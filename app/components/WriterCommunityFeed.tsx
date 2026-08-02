"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type FeedItem = {
  id: string;
  type: "comment" | "like" | "chapter" | "announcement";
  actor: string;
  story: string;
  content?: string;
  time: string;
  icon: string;
};

export default function WriterCommunityFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const [comments, likes, chapters] = await Promise.all([
        supabase.from("story_comments").select("id, content, created_at, user_id, stories(title, author_name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("story_likes").select("id, created_at, user_id, stories(title, author_name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("chapters").select("id, title, chapter_number, created_at, stories(title, author_name)").order("created_at", { ascending: false }).limit(5),
      ]);
      const feed: FeedItem[] = [
        ...(comments.data ?? []).map((c: any) => ({ id: c.id, type: "comment" as const, actor: "A reader", story: c.stories?.title ?? "a story", content: c.content, time: c.created_at, icon: "💬" })),
        ...(likes.data ?? []).map((l: any) => ({ id: l.id, type: "like" as const, actor: "A reader", story: l.stories?.title ?? "a story", time: l.created_at, icon: "❤️" })),
        ...(chapters.data ?? []).map((ch: any) => ({ id: ch.id, type: "chapter" as const, actor: ch.stories?.author_name ?? "A writer", story: ch.stories?.title ?? "a story", content: `Chapter ${ch.chapter_number}: ${ch.title}`, time: ch.created_at, icon: "📖" })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
      setItems(feed);
    }
    load();
  }, []);

  const postAnnouncement = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setPosting(false); return; }
    const { data } = await supabase.from("writer_announcements").insert({ user_id: session.user.id, content: comment.trim() }).select().single();
    if (data) { setAnnouncements(prev => [data, ...prev]); setComment(""); }
    setPosting(false);
  };

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "just now";
  }

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: "var(--text)", marginBottom: 20 }}>Writer Community</div>
      <div style={{ background: "var(--ink2)", border: "1px solid var(--border-gold)", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "var(--gold)", marginBottom: 12 }}>Post an Announcement</div>
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share an update with your fellow writers…"
          style={{ width: "100%", background: "var(--ink3)", border: "1px solid var(--border)", borderRadius: 8, padding: "12px 16px", color: "var(--text)", fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.6, resize: "none" as const, outline: "none", minHeight: 80 }} />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
          <button onClick={postAnnouncement} disabled={posting || !comment.trim()}
            style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" as const, padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", background: comment.trim() ? "linear-gradient(135deg, var(--gold), #8a6510)" : "var(--ink3)", color: comment.trim() ? "#000" : "var(--text-dim)", transition: "all 0.2s" }}>
            {posting ? "Posting…" : "Post →"}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
        {announcements.map(a => (
          <div key={a.id} style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderLeft: "3px solid var(--gold)", borderRadius: 8, padding: "14px 18px", display: "flex", gap: 12 }}>
            <span style={{ fontSize: 16 }}>📣</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{a.content}</div>
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>just now</div>
            </div>
          </div>
        ))}
        {items.map(item => (
          <div key={item.id} style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{item.actor}</span>
                {item.type === "comment" && " commented on "}
                {item.type === "like" && " liked "}
                {item.type === "chapter" && " dropped a new chapter in "}
                <span style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontStyle: "italic" }}>{item.story}</span>
                {item.content && <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4, fontStyle: item.type === "comment" ? "italic" : "normal" }}>{item.type === "comment" ? `"${item.content}"` : item.content}</div>}
              </div>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-dim)", whiteSpace: "nowrap" as const, letterSpacing: "0.06em", flexShrink: 0 }}>{timeAgo(item.time)}</span>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px", color: "var(--text-dim)", fontSize: 13 }}>No community activity yet. Be the first to post! 🕯️</div>
        )}
      </div>
    </div>
  );
}
