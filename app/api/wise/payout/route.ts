import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const WISE_BASE = process.env.WISE_BASE_URL!;
const WISE_TOKEN = process.env.WISE_API_TOKEN!;
const WISE_PROFILE_ID = process.env.WISE_PROFILE_ID!;

async function wiseRequest(path: string, method = "GET", body?: object) {
  const res = await fetch(`${WISE_BASE}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${WISE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { access_token, writer_id } = await req.json();
    if (!access_token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userData, error: userErr } = await authClient.auth.getUser(access_token);
    if (userErr || !userData?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const { data: writer } = await admin
      .from("writers")
      .select("id, email, name, payout_handle, payout_method")
      .eq("id", writer_id)
      .maybeSingle();

    if (!writer) return NextResponse.json({ error: "Writer not found" }, { status: 404 });
    if (writer.payout_method !== "Wise" || !writer.payout_handle) {
      return NextResponse.json({ error: "Writer has no Wise email set up" }, { status: 400 });
    }

    const { data: earnings } = await admin
      .from("writer_earnings")
      .select("id, writer_usd")
      .eq("writer_id", writer_id)
      .is("payout_id", null);

    if (!earnings || earnings.length === 0) {
      return NextResponse.json({ error: "No unpaid earnings" }, { status: 400 });
    }

    const totalUsd = earnings.reduce((sum, e) => sum + Number(e.writer_usd), 0);
    if (totalUsd < 1) return NextResponse.json({ error: "Minimum payout is $1.00" }, { status: 400 });

    // Create payout record
    const { data: payout } = await admin
      .from("payouts")
      .insert({
        writer_id,
        amount_usd: totalUsd,
        status: "pending",
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
        period_end: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (!payout) return NextResponse.json({ error: "Could not create payout record" }, { status: 500 });

    // Step 1 — Create recipient account
    const recipient = await wiseRequest("/v1/accounts", "POST", {
      profile: WISE_PROFILE_ID,
      accountHolderName: writer.name ?? writer.email,
      currency: "USD",
      type: "email",
      details: { email: writer.payout_handle },
    });

    if (!recipient.id) {
      await admin.from("payouts").update({ status: "failed" }).eq("id", payout.id);
      return NextResponse.json({ error: "Failed to create Wise recipient: " + JSON.stringify(recipient) }, { status: 500 });
    }

    // Step 2 — Create quote
    const quote = await wiseRequest(`/v3/profiles/${WISE_PROFILE_ID}/quotes`, "POST", {
      sourceCurrency: "USD",
      targetCurrency: "USD",
      sourceAmount: totalUsd,
      targetAccount: recipient.id,
      payOut: "BALANCE",
    });

    if (!quote.id) {
      await admin.from("payouts").update({ status: "failed" }).eq("id", payout.id);
      return NextResponse.json({ error: "Failed to create Wise quote: " + JSON.stringify(quote) }, { status: 500 });
    }

    // Step 3 — Create transfer
    const transfer = await wiseRequest("/v1/transfers", "POST", {
      targetAccount: recipient.id,
      quoteUuid: quote.id,
      customerTransactionId: payout.id,
      details: { reference: `TTL earnings — ${earnings.length} unlock(s)` },
    });

    if (!transfer.id) {
      await admin.from("payouts").update({ status: "failed" }).eq("id", payout.id);
      return NextResponse.json({ error: "Failed to create Wise transfer: " + JSON.stringify(transfer) }, { status: 500 });
    }

    // Step 4 — Fund transfer
    const fund = await wiseRequest(
      `/v3/profiles/${WISE_PROFILE_ID}/transfers/${transfer.id}/payments`,
      "POST",
      { type: "BALANCE" }
    );

    if (fund.status === "COMPLETED" || fund.status === "PROCESSING") {
      await admin.from("writer_earnings").update({ payout_id: payout.id }).in("id", earnings.map(e => e.id));
      await admin.from("payouts").update({
        stripe_transfer_id: String(transfer.id),
        status: "paid",
        paid_at: new Date().toISOString(),
      }).eq("id", payout.id);

      return NextResponse.json({
        success: true,
        transfer_id: transfer.id,
        amount_usd: totalUsd,
        earnings_paid: earnings.length,
      });
    }

    await admin.from("payouts").update({ status: "failed" }).eq("id", payout.id);
    return NextResponse.json({ error: "Wise funding failed: " + JSON.stringify(fund) }, { status: 500 });

  } catch (error: any) {
    console.error("Wise payout error:", error);
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}