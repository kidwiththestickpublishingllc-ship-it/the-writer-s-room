"use client";

type Earning = {
  id: string;
  chapter_id: string;
  ink_spent: number;
  gross_usd: number;
  writer_usd: number;
  platform_usd: number;
  created_at: string;
  payout_id: string | null;
};

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
};

interface EarningsTabProps {
  earnings: Earning[];
  chapters: Chapter[];
  writerPct: number;
  totalEarnings: number;
  unpaidTotal: number;
  totalUnlocks: number;
  onRequestPayout: () => void;
}

export default function EarningsTab({ earnings, chapters, writerPct, totalEarnings, unpaidTotal, totalUnlocks, onRequestPayout }: EarningsTabProps) {
  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Money</span>
        <h1 className="hq-page-title">Earnings</h1>
        <p className="hq-page-sub">Every time a reader unlocks your chapter, you earn {writerPct}%.</p>
      </div>
      <div className="hq-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="hq-stat">
          <span className="hq-stat-label">Total Earned</span>
          <div className="hq-stat-value">${totalEarnings.toFixed(2)}</div>
          <div className="hq-stat-sub">All time</div>
        </div>
        <div className="hq-stat">
          <span className="hq-stat-label">Unpaid</span>
          <div className="hq-stat-value" style={{ color: 'var(--green)' }}>${unpaidTotal.toFixed(2)}</div>
          <div className="hq-stat-sub">Ready to withdraw</div>
        </div>
        <div className="hq-stat">
          <span className="hq-stat-label">Total Unlocks</span>
          <div className="hq-stat-value">{totalUnlocks}</div>
          <div className="hq-stat-sub">Readers paid for your work</div>
        </div>
      </div>
      <div className="hq-section">
        <div className="hq-section-header">
          <h2 className="hq-section-title">Transaction History</h2>
          {unpaidTotal > 0 && (
            <button className="btn-primary" onClick={onRequestPayout}>
              Withdraw ${unpaidTotal.toFixed(2)} →
            </button>
          )}
        </div>
        {earnings.length > 0 ? (
          <div className="hq-table-wrap">
            <table className="hq-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chapter</th>
                  <th>Ink Spent</th>
                  <th>Gross</th>
                  <th>Your Cut ({writerPct}%)</th>
                  <th>TTL ({100 - writerPct}%)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map(e => {
                  const ch = chapters.find(c => c.id === e.chapter_id);
                  return (
                    <tr key={e.id}>
                      <td className="dim">{new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="primary">{ch ? `Ch. ${ch.chapter_number}: ${ch.title.slice(0, 30)}…` : '—'}</td>
                      <td>{e.ink_spent} ✒️</td>
                      <td>${Number(e.gross_usd).toFixed(3)}</td>
                      <td className="gold">${Number(e.writer_usd).toFixed(3)}</td>
                      <td className="dim">${Number(e.platform_usd).toFixed(3)}</td>
                      <td><span className={`badge ${e.payout_id ? 'badge-paid' : 'badge-pending'}`}>{e.payout_id ? 'Paid' : 'Pending'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">✒️</span>
            <div className="empty-title">No earnings yet</div>
            <p className="empty-sub">When readers unlock your chapters, your earnings will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
