import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";


const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
    const { access_token } = await req.json();
    if (!access_token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userData, error: userErr } = await authClient.auth.getUser(access_token);
    if (userErr || !userData?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const writerId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    const { data: writer } = await admin
      .from("writers")
      .select("stripe_account_id, stripe_onboarded")
      .eq("id", writerId)
      .maybeSingle();

    if (!writer?.stripe_account_id) {
      return NextResponse.json({ onboarded: false, hasAccount: false });
    }

    // Check status with Stripe
    const account = await stripe.accounts.retrieve(writer.stripe_account_id);
    const onboarded = account.details_submitted && account.charges_enabled;

    // Update database if newly onboarded
    if (onboarded && !writer.stripe_onboarded) {
      await admin
        .from("writers")
        .update({ stripe_onboarded: true })
        .eq("id", writerId);
    }

    return NextResponse.json({
      onboarded,
      hasAccount: true,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (error: any) {
    console.error("connect-status error:", error);
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}