"use client";

/**
 * QuestionsTab.tsx
 * ─────────────────────────────────────────────────────────────────
 * Writer's Room dashboard tab — shows all reader questions across
 * all of the writer's stories. Writer can answer directly.
 *
 * Place at: app/components/QuestionsTab.tsx (the-writers-room)
 *
 * HOW TO WIRE into app/dashboard/page.tsx:
 * 1. import QuestionsTab from "@/app/components/QuestionsTab";
 * 2. Add 'questions' to Tab type
 * 3. Add nav button
 * 4. Add {tab === 'questions' && <QuestionsTab writerId={writer.user_id} />}
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Question {
  id: string;
  story_id: string;
  asker_id: string;
  asker_name: string;
  body: string;
  is_answered: boolean;
  writer_answer: string | null;
  answered_at: string | null;
  upvotes: number;
  created_at: string;
  stories?: { title: string; slug: string };
}

interface QuestionsTabProps {
  writerId: string;
}

export default function QuestionsTab({ writerId }: QuestionsTabProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unanswered" | "answered">("unanswered");
  const [answering, setAnswering] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("story_questions")
      .select("*, stories(title, slug)")
      .in("story_id",
        (await supabase
          .from("stories")
          .select("id")
          .eq("author_id", writerId)
        ).data?.map((s: any) => s.id) ?? []
      )
      .order("created_at", { ascending: false });
    setQuestions((data ?? []) as Question[]);
    setLoading(false);
  }, [writerId]);

  useEffect(() => { load(); }, [load]);

  const handleAnswer = async (questionId: string) => {
    if (!draft.trim() || submitting) return;
    setSubmitting(true);
    await supabase
      .from("story_questions")
      .update({
        writer_answer: draft.trim(),
        is_answered: true,
        answered_at: new Date().toISOString(),
      })
      .eq("id", questionId);
    setQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, is_answered: true, writer_answer: draft.trim() }
        : q
    ));
    setDraft("");
    setAnswering(null);
    setSubmitting(false);
  };

  const filtered = questions.filter(q => {
    if (filter === "unanswered") return !q.is_answered;
    if (filter === "answered") return q.is_answered;
    return true;
  });

  const unansweredCount = questions.filter(q => !q.is_answered).length;

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Community</span>
        <h1 className="hq-page-title">Reader Questions</h1>
        <p className="hq-page-sub">
          Readers leave questions on your chapters. Answer them to build connection.
          {unansweredCount > 0 && (
            <span style={{ color: "var(--gold)", marginLeft: 8 }}>
              {unansweredCount} unanswered
            </span>
          )}
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["unanswered", "all", "answered"] as const).map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              padding: "6px 16px", borderRadius: 8, cursor: "pointer",
              border: `1px solid ${filter === f ? "var(--gold)" : "var(--border)"}`,
              background: filter === f ? "rgba(201,168,76,0.1)" : "transparent",
              color: filter === f ? "var(--gold)" : "var(--text-dim)",
              transition: "all 0.2s",
            }}
          >
            {f === "unanswered" ? `Unanswered${unansweredCount > 0 ? ` (${unansweredCount})` : ""}` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-dim)", fontSize: 13 }}>
          Loading questions…
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          padding: "40px 24px", textAlign: "center",
          border: "1px solid var(--border)", borderRadius: 14,
          background: "var(--ink2)",
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>💬</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text)", marginBottom: 8 }}>
            {filter === "unanswered" ? "All caught up." : "No questions yet."}
          </div>
          <p style={{ color: "var(--text-dim)", fontSize: 13, lineHeight: 1.65 }}>
            {filter === "unanswered"
              ? "You've answered all reader questions. Keep writing — more will come."
              : "When readers ask questions on your chapters, they'll appear here."
            }
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(q => (
            <div
              key={q.id}
              style={{
                border: `1px solid ${q.is_answered ? "var(--border)" : "rgba(201,168,76,0.3)"}`,
                borderRadius: 14,
                background: q.is_answered ? "var(--ink2)" : "rgba(201,168,76,0.04)",
                overflow: "hidden",
              }}
            >
              {/* Question header */}
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "var(--ink3)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontSize: 14, color: "var(--gold)",
                    flexShrink: 0,
                  }}>
                    {q.asker_name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text)", fontWeight: 500 }}>
                      {q.asker_name}
                    </div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)" }}>
                      on <a href={`/stories/${(q.stories as any)?.slug}`} style={{ color: "var(--gold)", textDecoration: "none" }}>
                        {(q.stories as any)?.title ?? "Unknown Story"}
                      </a> · {timeAgo(q.created_at)}
                    </div>
                  </div>
                  {!q.is_answered && (
                    <span style={{
                      marginLeft: "auto",
                      fontFamily: "var(--font-ui)", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase",
                      color: "var(--gold)", border: "1px solid rgba(201,168,76,0.3)",
                      background: "rgba(201,168,76,0.08)", padding: "2px 8px", borderRadius: 999,
                    }}>
                      Awaiting answer
                    </span>
                  )}
                  {q.upvotes > 0 && (
                    <span style={{
                      fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)",
                      marginLeft: q.is_answered ? "auto" : 0,
                    }}>
                      ▲ {q.upvotes}
                    </span>
                  )}
                </div>
                <p style={{
                  fontFamily: "var(--font-ui)", fontSize: 14,
                  color: "var(--text)", lineHeight: 1.65, margin: 0,
                }}>
                  {q.body}
                </p>
              </div>

              {/* Answer section */}
              <div style={{ padding: "14px 20px" }}>
                {q.is_answered && q.writer_answer ? (
                  <div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>
                      Your Answer
                    </div>
                    <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text-dim)", lineHeight: 1.65, margin: 0 }}>
                      {q.writer_answer}
                    </p>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", marginTop: 6 }}>
                      Answered {q.answered_at ? timeAgo(q.answered_at) : ""}
                    </div>
                  </div>
                ) : answering === q.id ? (
                  <div>
                    <textarea
                      value={draft}
                      onChange={e => setDraft(e.target.value.slice(0, 1000))}
                      placeholder="Write your answer…"
                      rows={3}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        background: "var(--ink3)", border: "1px solid var(--border)",
                        borderRadius: 8, padding: "10px 14px", resize: "none",
                        fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--text)",
                        outline: "none", lineHeight: 1.65,
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => { setAnswering(null); setDraft(""); }}
                        style={{
                          fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.12em",
                          textTransform: "uppercase", padding: "7px 16px", borderRadius: 8,
                          border: "1px solid var(--border)", background: "transparent",
                          color: "var(--text-dim)", cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!draft.trim() || submitting}
                        onClick={() => handleAnswer(q.id)}
                        style={{
                          fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.12em",
                          textTransform: "uppercase", padding: "7px 16px", borderRadius: 8,
                          border: "none", background: "linear-gradient(135deg,#C9A84C,#8a6510)",
                          color: "#000", fontWeight: 700, cursor: "pointer",
                          opacity: !draft.trim() || submitting ? 0.4 : 1,
                        }}
                      >
                        {submitting ? "Publishing…" : "Publish Answer"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAnswering(q.id)}
                    style={{
                      fontFamily: "var(--font-ui)", fontSize: 10, letterSpacing: "0.14em",
                      textTransform: "uppercase", padding: "7px 18px", borderRadius: 8,
                      border: "1px solid rgba(201,168,76,0.4)", background: "rgba(201,168,76,0.08)",
                      color: "var(--gold)", cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    Answer This Question →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
