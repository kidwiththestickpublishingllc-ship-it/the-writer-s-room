"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WriterOwed = {
  id: string;
  name: string;
  email: string | null;
  tier: string | null;
  unpaid_unlocks: number;
  unpaid_owed: number;
};

type PayoutRow = {
  id: string;
  writer_id: string;
  amount_usd: number;
  stripe_transfer_id: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  writer_name?: string;
};

export default function PayoutAdmin() {
  const [owed, setOwed] = useState<WriterOwed[]>([]);
  const [history, setHistory] = useState<PayoutRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [method, setMethod] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<Record<string, string>>({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      // Live "who's owed" — straight from the earnings ledger
      const { data: writers } = await supabase
        .from("writers")
        .select("id, name, email, tier");

      const { data: earnings } = await supabase
        .from("writer_earnings")
        .select("writer_id, writer_usd, payout_id");

      const unpaidByWriter: Record<string, { count: number; sum: number }> = {};
      (earnings ?? []).forEach((e: any) => {
        if (e.payout_id) return;
        if (!unpaidByWriter[e.writer_id]) unpaidByWriter[e.writer_id] = { count: 0, sum: 0 };
        unpaidByWriter[e.writer_id].count += 1;
        unpaidByWriter[e.writer_id].sum += Number(e.writer_usd);
      });

      const owedList: WriterOwed[] = (writers ?? []).map((w: any) => ({
        id: w.id,
        name: w.name,
        email: w.email,
        tier: w.tier,
        unpaid_unlocks: unpaidByWriter[w.id]?.count ?? 0,
        unpaid_owed: unpaidByWriter[w.id]?.sum ?? 0,
      })).filter(w => w.unpaid_owed > 0)
        .sort((a, b) => b.unpaid_owed - a.unpaid_owed);
      setOwed(owedList);

      // Payout history
      const { data: payouts } = await supabase
        .from("payouts")
        .select("*")
        .order("created_at", { ascending: false });

      const nameMap: Record<string, string> = {};
      (writers ?? []).forEach((w: any) => { nameMap[w.id] = w.name; });
      setHistory((payouts ?? []).map((p: any) => ({ ...p, writer_name: nameMap[p.writer_id] ?? "Unknown" })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markPaid(w: WriterOwed) {
    const m = method[w.id] || "Manual";
    const ref = reference[w.id] || "";
    if (!window.confirm(`Pay ${w.name} $${w.unpaid_owed.toFixed(2)} via ${m}? This stamps ${w.unpaid_unlocks} earning(s) as paid and cannot be undone here.`)) return;
    setProcessing(w.id);
    try {
      const { data, error } = await supabase.rpc("pay_writer", {
        p_writer_id: w.id,
        p_method: m,
        p_reference: ref,
      });
      if (error) throw error;
      if (data && (data as any).ok === false) {
        alert((data as any).error ?? "Payout failed");
      }
      await loadAll();
    } catch (err) {
      console.error(err);
      alert("Payout failed. Check console.");
    } finally {
      setProcessing(null);
    }
  }

  const totalOwed = owed.reduce((s, w) => s + w.unpaid_owed, 0);
  const totalPaid = history.reduce((s, p) => s + Number(p.amount_usd), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a14", color: "#fff", padding: "40px 24px", fontFamily: "Georgia, serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ color: "#C9A84C", fontSize: "28px", fontWeight: 600, margin: "0 0 8px" }}>Writer Payouts 💰</h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>Live balances from the earnings ledger. Mark paid after you send money manually.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          {[
            { label: "Owed Right Now", val: `$${totalOwed.toFixed(2)}`, color: "#C9A84C" },
            { label: "Total Paid Out", val: `$${totalPaid.toFixed(2)}`, color: "#22c55e" },
            { label: "Writers Awaiting", val: String(owed.length), color: "#fff" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "#111122", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "12px", padding: "20px" }}>
              <p style={{ color: "#666", fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px" }}>{stat.label}</p>
              <p style={{ color: stat.color, fontSize: "28px", fontWeight: 700, margin: 0 }}>{stat.val}</p>
            </div>
          ))}
        </div>

        <h2 style={{ color: "#f0ece2", fontSize: "18px", marginBottom: "16px" }}>Awaiting Payout</h2>
        {loading ? (
          <p style={{ color: "#555", textAlign: "center", padding: "40px" }}>Loading… 🕯️</p>
        ) : owed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#111122", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>✓</div>
            <p style={{ color: "#555", fontSize: "14px" }}>Everyone's paid up. No outstanding balances.</p>
          </div>
        ) : (
          owed.map(w => (
            <div key={w.id} style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <p style={{ color: "#f0ece2", fontSize: "16px", fontWeight: 600, margin: "0 0 4px" }}>{w.name}</p>
                  <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>{w.email ?? "—"} · {w.tier === "tier1" ? "80% tier" : "70% tier"} · {w.unpaid_unlocks} unlock(s)</p>
                </div>
                <p style={{ color: "#C9A84C", fontSize: "24px", fontWeight: 700, margin: 0 }}>${w.unpaid_owed.toFixed(2)}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  placeholder="Method (PayPal, Wise, Bank…)"
                  value={method[w.id] ?? ""}
                  onChange={e => setMethod({ ...method, [w.id]: e.target.value })}
                  style={{ flex: "1 1 160px", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Georgia, serif" }}
                />
                <input
                  placeholder="Reference / transaction ID"
                  value={reference[w.id] ?? ""}
                  onChange={e => setReference({ ...reference, [w.id]: e.target.value })}
                  style={{ flex: "1 1 160px", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none", fontFamily: "Georgia, serif" }}
                />
                <button
                  onClick={() => markPaid(w)}
                  disabled={processing === w.id}
                  style={{ padding: "10px 20px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", opacity: processing === w.id ? 0.6 : 1, whiteSpace: "nowrap" }}
                >
                  {processing === w.id ? "Processing…" : `✅ Mark $${w.unpaid_owed.toFixed(2)} Paid`}
                </button>
              </div>
            </div>
          ))
        )}

        <h2 style={{ color: "#f0ece2", fontSize: "18px", margin: "40px 0 16px" }}>Payout History</h2>
        {history.length === 0 ? (
          <p style={{ color: "#555", fontSize: "14px" }}>No payouts yet.</p>
        ) : (
          <div style={{ background: "#111122", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
            {history.map(p => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#f0ece2", fontWeight: 600 }}>{p.writer_name}</span>
                  <span style={{ color: "#666", marginLeft: 12 }}>{p.stripe_transfer_id ?? ""}</span>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ color: "#666" }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : ""}</span>
                  <span style={{ color: "#22c55e", fontWeight: 700 }}>${Number(p.amount_usd).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
