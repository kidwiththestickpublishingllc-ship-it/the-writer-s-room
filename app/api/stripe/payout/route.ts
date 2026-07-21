import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const MINIMUM_PAYOUT_USD = 10;

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
    const { access_token, writer_id } = await req.json();
    if (!access_token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userData, error: userErr } = await authClient.auth.getUser(access_token);
    if (userErr || !userData?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const { data: writer } = await admin
      .from("writers")
      .select("id, email, stripe_account_id, stripe_onboarded")
      .eq("id", writer_id)
      .maybeSingle();

    if (!writer) return NextResponse.json({ error: "Writer not found" }, { status: 404 });
    if (!writer.stripe_onboarded || !writer.stripe_account_id) {
      return NextResponse.json({ error: "Writer has not completed Stripe onboarding" }, { status: 400 });
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

    if (totalUsd < MINIMUM_PAYOUT_USD) {
      return NextResponse.json({
        error: `Minimum payout is $${MINIMUM_PAYOUT_USD}. Current balance: $${totalUsd.toFixed(2)}`
      }, { status: 400 });
    }

    const amountCents = Math.floor(totalUsd * 100);

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

    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: writer.stripe_account_id,
      metadata: {
        writer_id,
        payout_id: payout.id,
        earning_count: earnings.length.toString(),
      },
    });

    const earningIds = earnings.map(e => e.id);
    await admin
      .from("writer_earnings")
      .update({ payout_id: payout.id })
      .in("id", earningIds);

    await admin
      .from("payouts")
      .update({
        stripe_transfer_id: transfer.id,
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payout.id);

    return NextResponse.json({
      success: true,
      transfer_id: transfer.id,
      amount_usd: totalUsd,
      earnings_paid: earnings.length,
    });
  } catch (error: any) {
    console.error("payout error:", error);
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}