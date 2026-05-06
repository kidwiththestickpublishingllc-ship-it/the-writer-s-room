"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PayoutRequest = {
  id: string;
  writer_id: string;
  amount: number;
  payout_method: string;
  payout_email: string;
  status: string;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
  writer_name?: string;
  writer_email?: string;
};

function filterBtnStyle(active: boolean): React.CSSProperties {
  return {
    padding: "8px 16px",
    borderRadius: "99px",
    border: `1px solid ${active ? "#C9A84C" : "rgba(255,255,255,0.1)"}`,
    background: active ? "rgba(201,168,76,0.15)" : "transparent",
    color: active ? "#C9A84C" : "#666",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  };
}

function badgeStyle(status: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: 700,
    background:
      status === "completed" ? "rgba(34,197,94,0.15)" :
      status === "rejected" ? "rgba(239,68,68,0.15)" :
      "rgba(201,168,76,0.15)",
    color:
      status === "completed" ? "#22c55e" :
      status === "rejected" ? "#ef4444" :
      "#C9A84C",
    border: `1px solid ${
      status === "completed" ? "rgba(34,197,94,0.3)" :
      status === "rejected" ? "rgba(239,68,68,0.3)" :
      "rgba(201,168,76,0.3)"
    }`,
  };
}

export default function PayoutAdmin() {
  const [requests, setRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [processing, setProcessing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => { loadRequests(); }, [filter]);

  async function loadRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payout_requests")
        .select("*")
        .order("requested_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const enriched = await Promise.all(
          data.map(async (req) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, email")
              .eq("id", req.writer_id)
              .single();
            return {
              ...req,
              writer_name: profile?.full_name ?? "Unknown",
              writer_email: profile?.email ?? "Unknown",
            };
          })
        );
        setRequests(enriched);
        setTotalPaid(
          enriched.filter(r => r.status === "completed")
            .reduce((s, r) => s + Number(r.amount), 0)
        );
        setTotalPending(
          enriched.filter(r => r.status === "pending")
            .reduce((s, r) => s + Number(r.amount), 0)
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    id: string,
    status: "completed" | "rejected",
    writerId: string,
    amount: number
  ) {
    setProcessing(id);
    try {
      await supabase
        .from("payout_requests")
        .update({
          status,
          notes: notes[id] ?? null,
          processed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (status === "rejected") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("earnings_balance, pending_payout")
          .eq("id", writerId)
          .single();
        if (profile) {
          await supabase
            .from("profiles")
            .update({
              earnings_balance: profile.earnings_balance + amount,
              pending_payout: 0,
            })
            .eq("id", writerId);
        }
      } else {
        await supabase
          .from("profiles")
          .update({ pending_payout: 0 })
          .eq("id", writerId);
      }
      await loadRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(null);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  }

  const filtered = requests.filter(r =>
    filter === "all" ? true : r.status === filter
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a14",
      color: "#fff",
      padding: "40px 24px",
      fontFamily: "Georgia, serif",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            color: "#C9A84C",
            fontSize: "28px",
            fontWeight: 600,
            margin: "0 0 8px",
          }}>
            Payout Requests 💰
          </h1>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Review and process writer payout requests
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}>
          {[
            { label: "Total Pending", val: `$${totalPending.toFixed(2)}`, color: "#C9A84C" },
            { label: "Total Paid Out", val: `$${totalPaid.toFixed(2)}`, color: "#22c55e" },
            { label: "Pending Requests", val: String(requests.filter(r => r.status === "pending").length), color: "#fff" },
            { label: "Total Requests", val: String(requests.length), color: "#fff" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "#111122",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <p style={{
                color: "#666",
                fontSize: "11px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}>
                {stat.label}
              </p>
              <p style={{
                color: stat.color,
                fontSize: "28px",
                fontWeight: 700,
                margin: 0,
              }}>
                {stat.val}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}>
          {["pending", "completed", "rejected", "all"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={filterBtnStyle(filter === f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "pending" && requests.filter(r => r.status === "pending").length > 0 && (
                <span style={{
                  marginLeft: "6px",
                  background: "#C9A84C",
                  color: "#0a0a14",
                  borderRadius: "99px",
                  padding: "1px 6px",
                  fontSize: "10px",
                }}>
                  {requests.filter(r => r.status === "pending").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: "#555", textAlign: "center", padding: "40px" }}>
            Loading requests... 🕯️
          </p>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#111122",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>💰</div>
            <p style={{ color: "#555", fontSize: "14px" }}>
              No {filter} payout requests.
            </p>
          </div>
        ) : (
          filtered.map(req => (
            <div key={req.id} style={{
              background: "#111122",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "16px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}>
                <div>
                  <p style={{
                    color: "#f0ece2",
                    fontSize: "16px",
                    fontWeight: 600,
                    margin: "0 0 4px",
                  }}>
                    {req.writer_name}
                  </p>
                  <p style={{ color: "#666", fontSize: "12px", margin: 0 }}>
                    {req.writer_email}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{
                    color: "#C9A84C",
                    fontSize: "24px",
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}>
                    ${Number(req.amount).toFixed(2)}
                  </p>
                  <span style={badgeStyle(req.status)}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{
                display: "flex",
                gap: "24px",
                marginBottom: "16px",
                flexWrap: "wrap",
              }}>
                {[
                  { label: "Method", val: req.payout_method },
                  { label: "Account", val: req.payout_email },
                  { label: "Requested", val: timeAgo(req.requested_at) },
                  ...(req.processed_at
                    ? [{ label: "Processed", val: timeAgo(req.processed_at) }]
                    : []),
                ].map(info => (
                  <div key={info.label} style={{ fontSize: "13px" }}>
                    <span style={{ color: "#666", marginRight: "6px" }}>
                      {info.label}
                    </span>
                    <span style={{ color: "#f0ece2", fontWeight: 500 }}>
                      {info.val}
                    </span>
                  </div>
                ))}
              </div>

              {req.notes && (
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  marginBottom: "12px",
                }}>
                  <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                    Note: {req.notes}
                  </p>
                </div>
              )}

              {req.status === "pending" && (
                <>
                  <input
                    type="text"
                    placeholder="Add a note (optional)"
                    value={notes[req.id] ?? ""}
                    onChange={e => setNotes({
                      ...notes,
                      [req.id]: e.target.value,
                    })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "13px",
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: "12px",
                      fontFamily: "Georgia, serif",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => updateStatus(
                        req.id, "completed", req.writer_id, req.amount
                      )}
                      disabled={processing === req.id}
                      style={{
                        padding: "10px 20px",
                        background: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        opacity: processing === req.id ? 0.6 : 1,
                      }}
                    >
                      {processing === req.id ? "Processing..." : "✅ Mark as Paid"}
                    </button>
                    <button
                      onClick={() => updateStatus(
                        req.id, "rejected", req.writer_id, req.amount
                      )}
                      disabled={processing === req.id}
                      style={{
                        padding: "10px 20px",
                        background: "rgba(239,68,68,0.15)",
                        color: "#ef4444",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        opacity: processing === req.id ? 0.6 : 1,
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}

      </div>
    </div>
  );
}
