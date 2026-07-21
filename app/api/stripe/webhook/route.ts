import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const onboarded = account.details_submitted && account.charges_enabled;

    if (onboarded) {
      await admin
        .from("writers")
        .update({ stripe_onboarded: true })
        .eq("stripe_account_id", account.id);

      console.log(`Writer onboarded: ${account.id}`);
    }
  }

  if (event.type === "transfer.created") {
    const transfer = event.data.object as Stripe.Transfer;
    // Log successful transfer
    console.log(`Transfer created: ${transfer.id} for ${transfer.destination}`);
  }

  return NextResponse.json({ received: true });
}