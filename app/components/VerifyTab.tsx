"use client";

export default function VerifyTab() {
  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Account</span>
        <h1 className="hq-page-title">Writer Verification</h1>
        <p className="hq-page-sub">Required before your first payout. You can publish freely while verification is pending.</p>
      </div>
      <div className="payout-grid">
        <div className="payout-card">
          <div className="payout-balance-label">STEP 1 — YOUR INFORMATION</div>
          <input className="payout-input" style={{width:"100%",marginBottom:12}} placeholder="Full Legal Name" />
          <input className="payout-input" style={{width:"100%",marginBottom:20}} placeholder="Country of Residence" />
          <div className="payout-balance-label">STEP 2 — TAX FORM TYPE</div>
          <div className="payout-method-grid" style={{marginBottom:20}}>
            <button className="payout-method-btn">W-9 — US Based</button>
            <button className="payout-method-btn">W-8BEN — Outside US</button>
          </div>
          <div className="payout-balance-label">STEP 3 — CONTENT TYPE</div>
          <label style={{display:"flex",gap:8,alignItems:"flex-start",color:"var(--text-dim)",fontSize:13,marginBottom:24}}>
            <input type="checkbox" style={{marginTop:2,accentColor:"var(--gold)"}} />
            I intend to publish adult content on The Red Room. I confirm I am 18 or older.
          </label>
          <button className="btn-primary" style={{width:"100%"}}>Submit Verification 🕯️</button>
        </div>
        <div className="payout-info-card">
          <div style={{fontWeight:600,marginBottom:12,color:"var(--gold-light)"}}>Why we verify</div>
          <div className="payout-info-row"><span className="payout-info-label">🔒 Protects your earnings</span></div>
          <div className="payout-info-row"><span className="payout-info-label">📋 US tax compliance</span></div>
          <div className="payout-info-row"><span className="payout-info-label">🌍 Info stored securely</span></div>
          <div className="payout-info-row"><span className="payout-info-label">✅ Publish freely before verifying</span></div>
          <div className="payout-info-row"><span className="payout-info-label">⏱️ Review takes 2 to 3 business days</span></div>
        </div>
      </div>
    </div>
  );
}
