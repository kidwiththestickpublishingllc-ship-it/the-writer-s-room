"use client";

interface PayoutTabProps {
  stripeOnboarded: boolean;
  stripeLoading: boolean;
  payoutMethod: string;
  payoutHandle: string;
  unpaidTotal: number;
  requesting: boolean;
  writerPct: number;
  onSetPayoutMethod: (m: string) => void;
  onSetPayoutHandle: (h: string) => void;
  onStripeOnboard: () => void;
  onCheckStripeStatus: () => void;
  onRequestPayout: () => void;
}

export default function PayoutTab({
  stripeOnboarded, stripeLoading, payoutMethod, payoutHandle,
  unpaidTotal, requesting, writerPct,
  onSetPayoutMethod, onSetPayoutHandle,
  onStripeOnboard, onCheckStripeStatus, onRequestPayout,
}: PayoutTabProps) {
  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Money</span>
        <h1 className="hq-page-title">Request Payout</h1>
        <p className="hq-page-sub">No minimum. Withdraw whenever you want.</p>
      </div>
      <div className="payout-grid">
        <div className="payout-card">
          {!stripeOnboarded && (
            <div style={{ margin: "16px 0", padding: "16px", background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: "var(--text)", marginBottom: 10, fontWeight: 600 }}>
                Set up direct payments to get paid automatically
              </div>
              <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}
                onClick={() => { onCheckStripeStatus(); onStripeOnboard(); }} disabled={stripeLoading}>
                {stripeLoading ? "Loading…" : "Set Up Payments with Stripe →"}
              </button>
            </div>
          )}
          {stripeOnboarded && (
            <div style={{ margin: "16px 0", padding: "12px 16px", background: "rgba(0,200,100,0.06)", border: "1px solid rgba(0,200,100,0.3)", borderRadius: 8, fontSize: 13, color: "#00c864" }}>
              ✓ Stripe payments connected — payouts go directly to your bank
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label className="editor-label">Payout Method</label>
            <div className="payout-method-grid">
              {['Stripe', 'PayPal', 'Venmo', 'Zelle'].map(m => (
                <button key={m} className={`payout-method-btn${payoutMethod === m ? ' selected' : ''}`}
                  onClick={() => onSetPayoutMethod(m)}>{m}</button>
              ))}
            </div>
          </div>
          <label className="editor-label">
            {payoutMethod === 'Stripe' ? 'Email or Account ID' :
             payoutMethod === 'PayPal' ? 'PayPal Email' :
             payoutMethod === 'Venmo' ? '@Venmo Handle' :
             payoutMethod === 'Zelle' ? 'Phone or Email' : 'Your Handle'}
          </label>
          <input className="payout-input"
            placeholder={payoutMethod ? `Enter your ${payoutMethod} details` : 'Select a method first'}
            value={payoutHandle} onChange={e => onSetPayoutHandle(e.target.value)}
            disabled={!payoutMethod} />
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            disabled={requesting || unpaidTotal === 0 || !payoutMethod || !payoutHandle}
            onClick={onRequestPayout}>
            {requesting ? 'Requesting…' : `Request $${unpaidTotal.toFixed(2)} Payout →`}
          </button>
          {unpaidTotal === 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 12, textAlign: 'center' }}>
              No unpaid balance — keep writing to earn more!
            </p>
          )}
        </div>
        <div className="payout-info-card">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>
            How payouts work
          </div>
          <div className="payout-info-row"><span className="payout-info-label">Your cut</span><span className="payout-info-val" style={{ color: 'var(--green)' }}>{writerPct}% of every unlock</span></div>
          <div className="payout-info-row"><span className="payout-info-label">TTL platform fee</span><span className="payout-info-val">{100 - writerPct}%</span></div>
          <div className="payout-info-row"><span className="payout-info-label">Tip jar</span><span className="payout-info-val" style={{ color: 'var(--green)' }}>100% yours</span></div>
          <div className="payout-info-row"><span className="payout-info-label">Minimum payout</span><span className="payout-info-val">None</span></div>
          <div className="payout-info-row"><span className="payout-info-label">Processing time</span><span className="payout-info-val">2-3 business days</span></div>
          <div className="payout-info-row"><span className="payout-info-label">Your copyright</span><span className="payout-info-val" style={{ color: 'var(--green)' }}>Always yours ✓</span></div>
        </div>
      </div>
    </div>
  );
}
