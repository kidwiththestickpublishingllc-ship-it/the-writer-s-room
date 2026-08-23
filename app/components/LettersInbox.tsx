"use client";

/**
 * LettersInbox.tsx
 * ─────────────────────────────────────────────────────────────────
 * Writer's Room dashboard tab — inbox for Reader's Letters.
 * Shows all letters sent to this writer with tip amounts.
 * Writer can read and reply to each letter.
 *
 * Place at: app/components/LettersInbox.tsx (the-writers-room)
 *
 * HOW TO WIRE into app/dashboard/page.tsx:
 * 1. import LettersInbox from "@/app/components/LettersInbox";
 * 2. Add 'letters' to Tab type
 * 3. Add nav button
 * 4. Add {tab === 'letters' && <LettersInbox writerId={writer.user_id} />}
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Letter {
  id: string;
  reader_id: string;
  writer_id: string;
  story_id: string | null;
  tip_amount: number;
  status: string;
  created_at: string;
  letter_messages?: LetterMessage[];
  stories?: { title: string; slug: string } | null;
}

interface LetterMessage {
  id: string;
  letter_id: string;
  sender_id: string;
  body: string;
  is_writer: boolean;
  created_at: string;
}

interface LettersInboxProps {
  writerId: string;
  writerName: string;
}

export default function LettersInbox({ writerId, writerName }: LettersInboxProps) {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [openLetter, setOpenLetter] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, LetterMessage[]>>({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reader_letters")
      .select("*, stories(title, slug)")
      .eq("writer_id", writerId)
      .order("created_at", { ascending: false });
    setLetters((data ?? []) as Letter[]);
    setLoading(false);
  }, [writerId]);

  useEffect(() => { load(); }, [load]);

  const loadMessages = async (letterId: string) => {
    if (messages[letterId]) return;
    const { data } = await supabase
      .from("letter_messages")
      .select("*")
      .eq("letter_id", letterId)
      .order("created_at", { ascending: true });
    setMessages(prev => ({ ...prev, [letterId]: (data ?? []) as LetterMessage[] }));
  };

  const openLetterHandler = async (letterId: string) => {
    setOpenLetter(letterId);
    await loadMessages(letterId);
    // Mark as read
    await supabase
      .from("reader_letters")
      .update({ status: "read" })
      .eq("id", letterId)
      .eq("status", "sent");
    setLetters(prev => prev.map(l =>
      l.id === letterId && l.status === "sent" ? { ...l, status: "read" } : l
    ));
  };

  const sendReply = async (letterId: string) => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const { data } = await supabase
      .from("letter_messages")
      .insert({
        letter_id: letterId,
        sender_id: writerId,
        body: draft.trim(),
        is_writer: true,
      })
      .select()
      .single();
    if (data) {
      setMessages(prev => ({
        ...prev,
        [letterId]: [...(prev[letterId] ?? []), data as LetterMessage],
      }));
      await supabase.from("reader_letters").update({ status: "replied" }).eq("id", letterId);
      setLetters(prev => prev.map(l => l.id === letterId ? { ...l, status: "replied" } : l));
    }
    setDraft("");
    setSending(false);
  };

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function statusColor(status: string) {
    if (status === "sent") return "var(--gold)";
    if (status === "replied") return "var(--green)";
    return "var(--text-dim)";
  }

  function statusLabel(status: string) {
    if (status === "sent") return "New";
    if (status === "read") return "Read";
    if (status === "replied") return "Replied";
    return status;
  }

  const unreadCount = letters.filter(l => l.status === "sent").length;
  const currentMessages = openLetter ? (messages[openLetter] ?? []) : [];
  const currentLetter = letters.find(l => l.id === openLetter);

  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Community</span>
        <h1 className="hq-page-title">Reader's Letters</h1>
        <p className="hq-page-sub">
          Personal letters from your readers — each one came with Ink.
          {unreadCount > 0 && (
            <span style={{ color: "var(--gold)", marginLeft: 8 }}>
              {unreadCount} new
            </span>
          )}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: openLetter ? "320px 1fr" : "1fr", gap: 16 }}>
        {/* Letter list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-dim)", fontSize: 13 }}>
              Loading letters…
            </div>
          ) : letters.length === 0 ? (
            <div style={{
              padding: "40px 24px", textAlign: "center",
              border: "1px solid var(--border)", borderRadius: 14,
              background: "var(--ink2)",
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✉️</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
                No letters yet.
              </div>
              <p style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.65 }}>
                When readers send you a Reader's Letter, it will appear here.
                Letters come with an Ink tip attached.
              </p>
            </div>
          ) : (
            letters.map(letter => (
              <button
                key={letter.id}
                type="button"
                onClick={() => openLetterHandler(letter.id)}
                style={{
                  textAlign: "left", padding: "14px 16px",
                  border: `1px solid ${openLetter === letter.id ? "rgba(201,168,76,0.4)" : letter.status === "sent" ? "rgba(201,168,76,0.25)" : "var(--border)"}`,
                  borderRadius: 12, cursor: "pointer",
                  background: openLetter === letter.id ? "rgba(201,168,76,0.06)" : letter.status === "sent" ? "rgba(201,168,76,0.03)" : "var(--ink2)",
                  transition: "all 0.2s", width: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: "var(--ink3)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontSize: 12, color: "var(--gold)",
                    flexShrink: 0,
                  }}>
                    R
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text)", fontWeight: 500 }}>
                      Reader
                    </div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)" }}>
                      {timeAgo(letter.created_at)}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-ui)", fontSize: 8, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: statusColor(letter.status),
                    border: `1px solid ${statusColor(letter.status)}44`,
                    padding: "1px 6px", borderRadius: 999, flexShrink: 0,
                  }}>
                    {statusLabel(letter.status)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {letter.tip_amount > 0 && (
                    <span style={{
                      fontFamily: "var(--font-ui)", fontSize: 10,
                      color: "var(--gold)", background: "rgba(201,168,76,0.1)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      padding: "2px 8px", borderRadius: 999,
                    }}>
                      🪶 {letter.tip_amount} Ink tip
                    </span>
                  )}
                  {(letter.stories as any)?.title && (
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      re: {(letter.stories as any).title}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Letter thread */}
        {openLetter && currentLetter && (
          <div style={{
            border: "1px solid var(--border)", borderRadius: 14,
            background: "var(--ink2)", overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: 600,
          }}>
            {/* Thread header */}
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text)" }}>
                  Reader's Letter
                </div>
                {(currentLetter.stories as any)?.title && (
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                    re: {(currentLetter.stories as any).title}
                  </div>
                )}
              </div>
              {currentLetter.tip_amount > 0 && (
                <span style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-ui)", fontSize: 11,
                  color: "var(--gold)", background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  padding: "4px 12px", borderRadius: 999,
                }}>
                  🪶 {currentLetter.tip_amount} Ink tip
                </span>
              )}
              <button
                type="button"
                onClick={() => setOpenLetter(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: 16, padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {currentMessages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    padding: "12px 16px", borderRadius: 12,
                    background: msg.is_writer ? "rgba(201,168,76,0.08)" : "var(--ink3)",
                    border: `1px solid ${msg.is_writer ? "rgba(201,168,76,0.2)" : "var(--border)"}`,
                    alignSelf: msg.is_writer ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: msg.is_writer ? "var(--gold)" : "var(--text-dim)", marginBottom: 6 }}>
                    {msg.is_writer ? writerName : "Reader"} · {timeAgo(msg.created_at)}
                  </div>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)", lineHeight: 1.65, margin: 0 }}>
                    {msg.body}
                  </p>
                </div>
              ))}
              {currentMessages.length === 0 && (
                <div style={{ textAlign: "center", color: "var(--text-dim)", fontSize: 13, padding: "20px 0" }}>
                  No messages yet. Reply to start the conversation.
                </div>
              )}
            </div>

            {/* Reply compose */}
            <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border)" }}>
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value.slice(0, 1000))}
                placeholder="Write a reply to your reader…"
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "var(--ink3)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "10px 14px", resize: "none",
                  fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)",
                  outline: "none", lineHeight: 1.65, marginBottom: 8,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  disabled={!draft.trim() || sending}
                  onClick={() => sendReply(openLetter)}
                  style={{
                    fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em",
                    textTransform: "uppercase", padding: "8px 20px", borderRadius: 8,
                    border: "none", background: "linear-gradient(135deg,#C9A84C,#8a6510)",
                    color: "#000", fontWeight: 700, cursor: "pointer",
                    opacity: !draft.trim() || sending ? 0.4 : 1,
                  }}
                >
                  {sending ? "Sending…" : "Send Reply →"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
