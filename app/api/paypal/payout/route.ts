import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL!;
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET!;

async function getPayPalToken(): Promise<string> {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get PayPal token");
  return data.access_token;
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
      .select("id, email, payout_handle, payout_method")
      .eq("id", writer_id)
      .maybeSingle();

    if (!writer) return NextResponse.json({ error: "Writer not found" }, { status: 404 });
    if (writer.payout_method !== "PayPal" || !writer.payout_handle) {
      return NextResponse.json({ error: "Writer has no PayPal set up" }, { status: 400 });
    }

    console.log("PayPal payout - writer_id received:", writer_id);
    const { data: earnings } = await admin
      .from("writer_earnings")
      .select("id, writer_usd")
      .eq("writer_id", writer_id)
      .is("payout_id", null);
    console.log("PayPal payout - earnings found:", earnings?.length ?? 0);

    if (!earnings || earnings.length === 0) {
      return NextResponse.json({ error: "No unpaid earnings" }, { status: 400 });
    }

    const totalUsd = earnings.reduce((sum, e) => sum + Number(e.writer_usd), 0);
    if (totalUsd < 1) {
      return NextResponse.json({ error: "Minimum payout is $1.00" }, { status: 400 });
    }

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

    // Get PayPal token
    const token = await getPayPalToken();

    // Send PayPal payout
    const paypalRes = await fetch(`${PAYPAL_BASE}/v1/payments/payouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `TTL-${payout.id}`,
          email_subject: "Your TTL earnings have been paid!",
          email_message: "Your payout from The Tiniest Library has been sent. Thank you for writing with us.",
        },
        items: [{
          recipient_type: "EMAIL",
          amount: { value: totalUsd.toFixed(2), currency: "USD" },
          receiver: writer.payout_handle,
          note: `TTL earnings payout — ${earnings.length} chapter unlock(s)`,
          sender_item_id: payout.id,
        }],
      }),
    });

    const paypalData = await paypalRes.json();

    if (!paypalRes.ok) {
      await admin.from("payouts").update({ status: "failed" }).eq("id", payout.id);
      return NextResponse.json({ error: "PayPal payout failed: " + JSON.stringify(paypalData) }, { status: 500 });
    }

    const paypalBatchId = paypalData.batch_header?.payout_batch_id;

    // Mark earnings paid
    await admin
      .from("writer_earnings")
      .update({ payout_id: payout.id })
      .in("id", earnings.map(e => e.id));

    // Update payout record
    await admin
      .from("payouts")
      .update({
        stripe_transfer_id: paypalBatchId,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    return NextResponse.json({
      success: true,
      batch_id: paypalBatchId,
      amount_usd: totalUsd,
      earnings_paid: earnings.length,
    });
  } catch (error: any) {
    console.error("PayPal payout error:", error);
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}