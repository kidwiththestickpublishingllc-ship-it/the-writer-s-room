import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BASE_URL = "https://write.the-tiniest-library.com";

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();
    if (!access_token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Verify the writer's session
    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: userData, error: userErr } = await authClient.auth.getUser(access_token);
    if (userErr || !userData?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const writerId = userData.user.id;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // Get writer record
    const { data: writer } = await admin
      .from("writers")
      .select("id, email, stripe_account_id, stripe_onboarded")
      .eq("id", writerId)
      .maybeSingle();

    if (!writer) return NextResponse.json({ error: "Writer not found" }, { status: 404 });

    let stripeAccountId = writer.stripe_account_id;

    // Create Stripe Express account if they don't have one yet
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        email: writer.email,
        capabilities: {
          transfers: { requested: true },
        },
      });
      stripeAccountId = account.id;

      // Save to database
      await admin
        .from("writers")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", writerId);
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${BASE_URL}/dashboard?stripe=refresh`,
      return_url: `${BASE_URL}/dashboard?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("connect-onboard error:", error);
    return NextResponse.json({ error: error.message ?? "Failed" }, { status: 500 });
  }
}