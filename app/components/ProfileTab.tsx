"use client";

interface ProfileTabProps {
  editName: string;
  editBio: string;
  editWebsite: string;
  editTwitter: string;
  editInstagram: string;
  editPayoutMethod: string;
  editPayoutHandle: string;
  saving: boolean;
  onSetName: (v: string) => void;
  onSetBio: (v: string) => void;
  onSetWebsite: (v: string) => void;
  onSetTwitter: (v: string) => void;
  onSetInstagram: (v: string) => void;
  onSetPayoutMethod: (v: string) => void;
  onSetPayoutHandle: (v: string) => void;
  onSave: () => void;
}

export default function ProfileTab({
  editName, editBio, editWebsite, editTwitter, editInstagram,
  editPayoutMethod, editPayoutHandle, saving,
  onSetName, onSetBio, onSetWebsite, onSetTwitter, onSetInstagram,
  onSetPayoutMethod, onSetPayoutHandle, onSave,
}: ProfileTabProps) {
  return (
    <div className="fade-up">
      <div className="hq-page-header">
        <span className="hq-page-eyebrow">Account</span>
        <h1 className="hq-page-title">My Profile</h1>
        <p className="hq-page-sub">This is your public author profile on TTL.</p>
      </div>
      <div style={{ maxWidth: 640 }}>
        <div className="editor-field">
          <label className="editor-label">Display Name</label>
          <input className="editor-input" value={editName} onChange={e => onSetName(e.target.value)} />
        </div>
        <div className="editor-field">
          <label className="editor-label">Bio</label>
          <textarea className="editor-textarea" style={{ minHeight: 180 }}
            value={editBio} maxLength={3000} onChange={e => onSetBio(e.target.value)}
            placeholder="Tell readers about yourself…" />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>{editBio.length}/3000 characters</div>
        </div>
        <div className="hq-divider" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>Social Links</div>
        <div className="editor-field">
          <label className="editor-label">Website</label>
          <input className="editor-input" value={editWebsite} onChange={e => onSetWebsite(e.target.value)} placeholder="https://yoursite.com" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="editor-field">
            <label className="editor-label">Twitter / X</label>
            <input className="editor-input" value={editTwitter} onChange={e => onSetTwitter(e.target.value)} placeholder="https://twitter.com/you" />
          </div>
          <div className="editor-field">
            <label className="editor-label">Instagram</label>
            <input className="editor-input" value={editInstagram} onChange={e => onSetInstagram(e.target.value)} placeholder="https://instagram.com/you" />
          </div>
        </div>
        <div className="hq-divider" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 8 }}>Payment Method</div>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 20 }}>Set up once — we'll send your earnings here when you request a payout.</p>
        <div className="editor-field">
          <label className="editor-label">Payout Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {['Zelle', 'PayPal', 'Venmo', 'Stripe'].map(m => (
              <button key={m} onClick={() => onSetPayoutMethod(m)}
                style={{ padding: '10px', border: `2px solid ${editPayoutMethod === m ? 'var(--gold)' : 'var(--border)'}`,
                  background: editPayoutMethod === m ? 'rgba(201,168,76,0.1)' : 'transparent',
                  color: editPayoutMethod === m ? 'var(--gold-light)' : 'var(--text-dim)',
                  borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {m}
              </button>
            ))}
          </div>
        </div>
        {editPayoutMethod && (
          <div className="editor-field">
            <label className="editor-label">
              {editPayoutMethod === 'Zelle' ? 'Zelle Phone or Email' :
               editPayoutMethod === 'PayPal' ? 'PayPal Email' :
               editPayoutMethod === 'Venmo' ? 'Venmo Username' : 'Stripe Email'}
            </label>
            <input className="editor-input" value={editPayoutHandle}
              onChange={e => onSetPayoutHandle(e.target.value)}
              placeholder={editPayoutMethod === 'Venmo' ? '@username' : 'email or phone'} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn-primary" disabled={saving} onClick={onSave}>
            {saving ? 'Saving…' : 'Save Profile ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
