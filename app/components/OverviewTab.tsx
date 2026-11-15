"use client";
import WriterCommunityFeed from "./WriterCommunityFeed";
import ComicPages from "./ComicPages";

const OV_STYLES = `
  .ov-start {
    position: relative; margin: 10px 0 34px; padding: 30px 24px 26px;
    background-color: #FFFFFF;
    background-image: radial-gradient(rgba(42,100,200,0.12) 1.2px, transparent 1.4px);
    background-size: 10px 10px;
    border: 3px solid #111111; box-shadow: 6px 6px 0 #111111;
  }
  .ov-start-tag {
    position: absolute; top: -17px; left: 18px; padding: 2px 10px;
    background: #FF1493; color: #FFFFFF; border: 2px solid #111111;
    font-family: var(--st-font-comic, Impact, sans-serif); font-size: 17px; letter-spacing: 0.06em; text-transform: uppercase;
    transform: rotate(-2deg);
  }
  .ov-start-title {
    display: inline-block; margin-bottom: 12px; padding: 4px 12px 2px;
    background: #FFE14D; color: #111111; border: 3px solid #111111; box-shadow: 4px 4px 0 #111111;
    font-family: var(--st-font-comic, Impact, sans-serif); font-size: clamp(22px, 3vw, 30px); line-height: 1.1; letter-spacing: 0.03em;
  }
  .ov-start-sub { max-width: 620px; margin-bottom: 18px; font-size: 15px; line-height: 1.6; color: #3A3A3A; }
  .ov-steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 24px; }
  .ov-step {
    display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
    padding: 14px; text-align: left;
    background: #FFFFFF; color: #111111;
    border: 2.5px solid #111111; box-shadow: 3px 3px 0 #111111;
    font-family: var(--st-font-ui, system-ui, sans-serif);
  }
  button.ov-step { cursor: pointer; transition: transform 0.08s, box-shadow 0.08s, background 0.08s; }
  button.ov-step:hover { background: #FFF7C2; transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #111111; }
  .ov-step-num {
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    background: #FFE14D; border: 2px solid #111111; border-radius: 50%;
    font-family: var(--st-font-comic, Impact, sans-serif); font-size: 18px;
  }
  .ov-step-title { font-size: 15px; font-weight: 800; }
  .ov-step-desc { font-size: 13px; line-height: 1.5; color: #3A3A3A; }
  .ov-step-go { margin-top: auto; padding-top: 4px; font-family: var(--st-font-comic, Impact, sans-serif); font-size: 18px; letter-spacing: 0.04em; color: #E8322E; }

  @media (max-width: 1100px) { .ov-steps { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  @media (max-width: 520px) {
    .ov-steps { grid-template-columns: minmax(0, 1fr); }
    .ov-start { padding: 26px 16px 22px; box-shadow: 5px 5px 0 #111111; }
  }
`;

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
      <style>{OV_STYLES}</style>
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">The Creators Room</span>
        <h1 className="hq-page-title">Good to see you, {writer.name.split(' ')[0]}.</h1>
        <p className="hq-page-sub">Here's how your work is performing.</p>
      </div>

      <ComicPages pages={[
        { label: "Your desk", content: (<>

      {stories.length === 0 && (
        <div className="ov-start">
          <span className="ov-start-tag">Getting started</span>
          <div className="ov-start-title">Welcome to your Creator HQ, {writer.name.split(' ')[0]}.</div>
          <p className="ov-start-sub">You&apos;re all set up. Here&apos;s how to get your first story or comic published on TTL:</p>
          <div className="ov-steps">
            {[
              { step: "1", title: "Fill out your profile", desc: "Add your bio, photo and genres so readers can find you.", tab: "profile" },
              { step: "2", title: "Submit your work", desc: "A story or a comic: title, description and the first chapter.", tab: "submit" },
              { step: "3", title: "Add your chapters", desc: "Paste your chapter content in the Chapters tab.", tab: "chapters" },
              { step: "4", title: "Wait for approval", desc: "We review every submission personally, usually within 5–7 days.", tab: null },
            ].map(s => s.tab ? (
              <button key={s.step} className="ov-step" onClick={() => onNavigate(s.tab)}>
                <span className="ov-step-num">{s.step}</span>
                <span className="ov-step-title">{s.title}</span>
                <span className="ov-step-desc">{s.desc}</span>
                <span className="ov-step-go">Go →</span>
              </button>
            ) : (
              <div key={s.step} className="ov-step">
                <span className="ov-step-num">{s.step}</span>
                <span className="ov-step-title">{s.title}</span>
                <span className="ov-step-desc">{s.desc}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={() => onNavigate('submit')}>Submit your first work</button>
        </div>
      )}

      <div className="hq-stats">
        <div className="hq-stat">
          <span className="hq-stat-label">Total Earned</span>
          <div className="hq-stat-value">${totalEarnings.toFixed(2)}</div>
          <div className="hq-stat-sub">Lifetime creator earnings</div>
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

      </>) },
        { label: "Community", content: <WriterCommunityFeed /> },
      ]} />
    </div>
  );
}
