import fs from 'fs';
const path = 'app/ttl-admin/page.tsx';
let src = fs.readFileSync(path, 'utf-8');

const newFunc = `function PayoutAdminTab() {
  const [owed, setOwed] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [method, setMethod] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<Record<string, string>>({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const { data: writers } = await supabase.from("writers").select("id, name, email, tier");
      const { data: earnings } = await supabase.from("writer_earnings").select("writer_id, writer_usd, payout_id");
      const unpaid: Record<string, { count: number; sum: number }> = {};
      (earnings ?? []).forEach((e: any) => {
        if (e.payout_id) return;
        if (!unpaid[e.writer_id]) unpaid[e.writer_id] = { count: 0, sum: 0 };
        unpaid[e.writer_id].count += 1;
        unpaid[e.writer_id].sum += Number(e.writer_usd);
      });
      const owedList = (writers ?? []).map((w: any) => ({
        id: w.id, name: w.name, email: w.email, tier: w.tier,
        unpaid_unlocks: unpaid[w.id]?.count ?? 0,
        unpaid_owed: unpaid[w.id]?.sum ?? 0,
      })).filter((w: any) => w.unpaid_owed > 0).sort((a: any, b: any) => b.unpaid_owed - a.unpaid_owed);
      setOwed(owedList);
      const { data: payouts } = await supabase.from("payouts").select("*").order("created_at", { ascending: false });
      const nameMap: Record<string, string> = {};
      (writers ?? []).forEach((w: any) => { nameMap[w.id] = w.name; });
      setHistory((payouts ?? []).map((p: any) => ({ ...p, writer_name: nameMap[p.writer_id] ?? "Unknown" })));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function markPaid(w: any) {
    const m = method[w.id] || "Manual";
    const ref = reference[w.id] || "";
    if (!window.confirm("Pay " + w.name + " $" + w.unpaid_owed.toFixed(2) + " via " + m + "? This stamps " + w.unpaid_unlocks + " earning(s) as paid and cannot be undone here.")) return;
    setProcessing(w.id);
    try {
      const { data, error } = await supabase.rpc("pay_writer", { p_writer_id: w.id, p_method: m, p_reference: ref });
      if (error) throw error;
      if (data && (data as any).ok === false) alert((data as any).error ?? "Payout failed");
      await loadAll();
    } catch (err) { console.error(err); alert("Payout failed. Check console."); }
    finally { setProcessing(null); }
  }

  const totalOwed = owed.reduce((s: number, w: any) => s + w.unpaid_owed, 0);
  const totalPaid = history.reduce((s: number, p: any) => s + Number(p.amount_usd), 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Owed Right Now", val: "$" + totalOwed.toFixed(2), color: "var(--gold-light)" },
          { label: "Total Paid Out", val: "$" + totalPaid.toFixed(2), color: "var(--green)" },
          { label: "Writers Awaiting", val: String(owed.length), color: "var(--text)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      <h3 style={{ color: "var(--text)", fontSize: 16, marginBottom: 14 }}>Awaiting Payout</h3>
      {loading ? (
        <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>Loading...</p>
      ) : owed.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--ink2)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
          <p style={{ color: "var(--text-dim)" }}>Everyone's paid up. No outstanding balances.</p>
        </div>
      ) : owed.map((w: any) => (
        <div key={w.id} style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{w.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{w.email ?? "-"} ({w.tier === "tier1" ? "80% tier" : "70% tier"}, {w.unpaid_unlocks} unlock(s))</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold-light)" }}>{"$" + w.unpaid_owed.toFixed(2)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Method (PayPal, Wise, Bank...)" value={method[w.id] ?? ""} onChange={e => setMethod({ ...method, [w.id]: e.target.value })} style={{ flex: "1 1 150px", padding: "8px 12px", background: "var(--ink3)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }} />
            <input placeholder="Reference / txn ID" value={reference[w.id] ?? ""} onChange={e => setReference({ ...reference, [w.id]: e.target.value })} style={{ flex: "1 1 150px", padding: "8px 12px", background: "var(--ink3)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }} />
            <button onClick={() => markPaid(w)} disabled={processing === w.id} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{processing === w.id ? "Processing..." : "Mark $" + w.unpaid_owed.toFixed(2) + " Paid"}</button>
          </div>
        </div>
      ))}
      <h3 style={{ color: "var(--text)", fontSize: 16, margin: "32px 0 14px" }}>Payout History</h3>
      {history.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>No payouts yet.</p>
      ) : (
        <div style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {history.map((p: any) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <div><span style={{ color: "var(--text)", fontWeight: 600 }}>{p.writer_name}</span><span style={{ color: "var(--text-dim)", marginLeft: 12 }}>{p.stripe_transfer_id ?? ""}</span></div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: "var(--text-dim)" }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : ""}</span>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>{"$" + Number(p.amount_usd).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`;

const pattern = /function PayoutAdminTab\(\) \{[\s\S]*?\n\}\nfunction MembersTab/;
const matches = src.match(pattern);
if (!matches) {
  console.log("ERROR: could not find PayoutAdminTab boundaries. No changes written.");
  process.exit(1);
}
src = src.replace(pattern, newFunc + "\nfunction MembersTab");
fs.writeFileSync(path, src, 'utf-8');
console.log("SUCCESS: PayoutAdminTab replaced.");