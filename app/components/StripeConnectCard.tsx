"use client";

// app/components/StripeConnectCard.tsx
// Stripe Connect (Express) onboarding card for the Writer's Room profile tab.
// Bank details are collected by Stripe's hosted page — never by TTL.

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const STYLES = `
  .sc-card { border: 2px solid var(--border); border-radius: 10px; padding: 18px 20px; margin-bottom: 16px;
    background: rgba(201,168,76,0.04); }
  .sc-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .sc-pill { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 10px;
    border-radius: 999px; border: 1px solid var(--border); color: var(--text-dim); }
  .sc-pill.on { border-color: rgba(74,222,128,0.5); color: #4ade80; }
  .sc-pill.pending { border-color: var(--gold-dim); color: var(--gold-light); }
  .sc-text { font-size: 13px; color: var(--text-dim); line-height: 1.55; margin: 10px 0 14px; }
  .sc-btn { padding: 11px 18px; border-radius: 8px; border: 2px solid var(--gold); cursor: pointer;
    background: rgba(201,168,76,0.12); color: var(--gold-light); font-size: 13px; font-weight: 600; }
  .sc-btn:disabled { opacity: 0.6; cursor: default; }
  .sc-err { font-size: 12px; color: #f87171; margin-top: 10px; }
`;

export default function StripeConnectCard() {
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [err, setErr] = useState("");

  async function token() {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token ?? null;
  }

  async function readRow() {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return;
    const { data: w } = await supabase
      .from("writers")
      .select("stripe_account_id, stripe_onboarded")
      .eq("user_id", uid)
      .maybeSingle();
    setAccountId((w as any)?.stripe_account_id ?? null);
    setOnboarded(Boolean((w as any)?.stripe_onboarded));
  }

  useEffect(() => {
    (async () => {
      // Coming back from Stripe? Refresh verification status first.
      if (typeof window !== "undefined" && window.location.search.includes("stripe=return")) {
        const t = await token();
        if (t) {
          try {
            await fetch("/api/stripe/connect-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ access_token: t }),
            });
          } catch { /* fall through to the row read */ }
        }
      }
      await readRow();
      setLoading(false);
    })();
  }, []);

  async function startOnboarding() {
    setErr(""); setWorking(true);
    try {
      const t = await token();
      if (!t) { setErr("Please sign in again."); setWorking(false); return; }

      const res = await fetch("/api/stripe/connect-onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: t }),
      });
      const json = await res.json();
      if (!res.ok || !json?.url) { setErr(json?.error ?? "Could not start Stripe setup."); setWorking(false); return; }

      window.location.href = json.url;
    } catch (e: any) {
      setErr(e?.message ?? "Could not start Stripe setup.");
      setWorking(false);
    }
  }

  if (loading) return null;

  return (
    <div className="sc-card">
      <style>{STYLES}</style>
      <div className="sc-row">
        <strong style={{ fontSize: 14, color: "var(--text)" }}>Stripe Payouts</strong>
        {onboarded
          ? <span className="sc-pill on">Connected</span>
          : accountId
            ? <span className="sc-pill pending">Setup incomplete</span>
            : <span className="sc-pill">Not connected</span>}
      </div>

      <p className="sc-text">
        {onboarded
          ? "Your Stripe account is verified. Request a payout any time you're over your minimum and we'll send it straight to your bank."
          : "Stripe collects your bank details on their own secure page — TTL never sees or stores them. It takes a few minutes and you'll come straight back here."}
      </p>

      {!onboarded && (
        <button type="button" className="sc-btn" disabled={working} onClick={startOnboarding}>
          {working ? "Opening Stripe…" : accountId ? "Finish Stripe Setup →" : "Set Up Stripe Payouts →"}
        </button>
      )}

      {err && <div className="sc-err">{err}</div>}
    </div>
  );
}