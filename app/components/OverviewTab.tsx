"use client";
import WriterCommunityFeed from "./WriterCommunityFeed";

type Story = { id: string; title: string; slug: string; };
type Chapter = { id: string; chapter_number: number; title: string; };
type Earning = { id: string; chapter_id: string; ink_spent: number; writer_usd: number; created_at: string; payout_id: string | null; };

interface OverviewTabProps {
  writer: any;
  stories: Story[];
  chapters: Chapter[];
  earnings: Earning[];
  totalEarnings: number;
  unpaidTotal: number;
  totalUnlocks: number;
  totalInkEarned: number;
  onNavigate: (tab: any) => void;
}

export default function OverviewTab({
  writer, stories, chapters, earnings,
  totalEarnings, unpaidTotal, totalUnlocks, totalInkEarned, onNavigate,
}: OverviewTabProps) {
  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">The Writer's Room</span>
        <h1 className="hq-page-title">Good to see you, {writer.name.split(' ')[0]}.</h1>
        <p className="hq-page-sub">Here's how your work is performing.</p>
      </div>

      {stories.length === 0 && (
        <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.25)", borderLeft: "4px solid var(--gold)", borderRadius: 12, padding: 28, marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Getting Started</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>Welcome to your Writer HQ, {writer.name.split(' ')[0]}. 🪶</div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>You're all set up. Here's how to get your first story published on TTL:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
            {[
              { step: "1", title: "Fill out your profile", desc: "Add your bio, photo and genres so readers can find you.", tab: "profile" },
              { step: "2", title: "Submit your story", desc: "Upload your manuscript title, description and first chapter.", tab: "submit" },
              { step: "3", title: "Add your chapters", desc: "Paste your chapter content in the Chapters tab.", tab: "chapters" },
              { step: "4", title: "Wait for approval", desc: "We review every story personally. Usually within 5-7 days.", tab: null },
            ].map(s => (
              <div key={s.step} onClick={() => s.tab && onNavigate(s.tab)}
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8, padding: 16, cursor: s.tab ? "pointer" : "default", transition: "all 0.2s" }}
                onMouseEnter={e => s.tab && (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
                onMouseLeave={e => s.tab && (e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)")}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>{s.step}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</div>
                {s.tab && <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 8, letterSpacing: "0.1em" }}>Go →</div>}
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('submit')} style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", padding: "12px 28px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--gold),#8a6510)", color: "#000" }}>
            Submit Your First Story →
          </button>
        </div>
      )}

      <div className="hq-stats">
        <div className="hq-stat">
          <span className="hq-stat-label">Total Earned</span>
          <div className="hq-stat-value">${totalEarnings.toFixed(2)}</div>
          <div className="hq-stat-sub">Lifetime writer earnings</div>
        </div>
        <div className="hq-stat">
          <span className="hq-stat-label">Unpaid Balance</span>
          <div className="hq-stat-value" style={{ color: unpaidTotal > 0 ? 'var(--green)' : 'var(--gold-light)' }}>${unpaidTotal.toFixed(2)}</div>
          <div className="hq-stat-sub">Ready to withdraw</div>
        </div>
        <div className="hq-stat">
          <span className="hq-stat-label">Chapter Unlocks</span>
          <div className="hq-stat-value">{totalUnlocks}</div>
          <div className="hq-stat-sub">Readers paying for your work</div>
        </div>
        <div className="hq-stat">
          <span className="hq-stat-label">Ink Earned</span>
          <div className="hq-stat-value">{totalInkEarned}</div>
          <div className="hq-stat-sub">Total Ink from unlocks</div>
        </div>
      </div>

      <div className="hq-section">
        <div className="hq-section-header"><h2 className="hq-section-title">Your Stories</h2></div>
        {stories.length > 0 ? (
          <div className="hq-table-wrap">
            <table className="hq-table">
              <thead><tr><th>Title</th><th>Chapters</th><th>Status</th><th>Unlocks</th><th>Earned</th></tr></thead>
              <tbody>
                {stories.map(s => {
                  const storyEarnings = earnings.filter(e => chapters.find(c => c.id === e.chapter_id));
                  return (
                    <tr key={s.id}>
                      <td className="primary">{s.title}</td>
                      <td>{chapters.length}</td>
                      <td><span className="badge badge-free">Published</span></td>
                      <td>{storyEarnings.length}</td>
                      <td className="gold">${storyEarnings.reduce((sum, e) => sum + Number(e.writer_usd), 0).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📖</span>
            <div className="empty-title">No stories yet</div>
            <p className="empty-sub">Your published stories will appear here.</p>
          </div>
        )}
      </div>

      {earnings.length > 0 && (
        <div className="hq-section">
          <div className="hq-section-header">
            <h2 className="hq-section-title">Recent Earnings</h2>
            <button className="btn-ghost" onClick={() => onNavigate('earnings')}>View All →</button>
          </div>
          <div className="hq-table-wrap">
            <table className="hq-table">
              <thead><tr><th>Date</th><th>Chapter</th><th>Ink</th><th>You Earned</th><th>Status</th></tr></thead>
              <tbody>
                {earnings.slice(0, 5).map(e => {
                  const ch = chapters.find(c => c.id === e.chapter_id);
                  return (
                    <tr key={e.id}>
                      <td className="dim">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td>{ch ? `Ch. ${ch.chapter_number}` : '—'}</td>
                      <td>{e.ink_spent} Ink</td>
                      <td className="gold">${Number(e.writer_usd).toFixed(3)}</td>
                      <td><span className={`badge ${e.payout_id ? 'badge-paid' : 'badge-pending'}`}>{e.payout_id ? 'Paid' : 'Pending'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <WriterCommunityFeed />
    </div>
  );
}
