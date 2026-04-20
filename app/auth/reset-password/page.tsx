"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --gold:#C9A84C; --gold-light:#E2C97E; --gold-dim:rgba(201,168,76,0.3);
    --gold-glow:rgba(201,168,76,0.08); --quill:#9b6dff;
    --ink:#0a0a0f; --ink2:#111118; --ink3:#18181f;
    --border:rgba(255,255,255,0.06); --border-gold:rgba(201,168,76,0.18);
    --text:#f0ece2; --text-muted:rgba(240,236,226,0.5); --text-dim:rgba(240,236,226,0.25);
    --red:#f87171; --green:#4ade80;
    --font-display:'Cormorant Garamond',serif; --font-ui:'Syne',sans-serif;
  }
  body { background:var(--ink); color:var(--text); font-family:var(--font-ui); }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .root {
    min-height:100vh; display:flex; align-items:center;
    justify-content:center; padding:24px;
  }
  .card {
    width:100%; max-width:440px; background:var(--ink2);
    border:1px solid var(--border-gold); border-radius:20px;
    overflow:hidden; animation:fadeUp 0.6s ease forwards;
    box-shadow:0 40px 80px rgba(0,0,0,0.6);
  }
  .card-top { height:3px; background:linear-gradient(90deg,transparent,var(--gold),var(--quill),var(--gold),transparent); }
  .card-body { padding:48px 40px 40px; }
  .brand { display:flex; align-items:center; gap:14px; margin-bottom:40px; }
  .logo {
    width:44px; height:44px; border-radius:10px;
    background:linear-gradient(135deg,var(--gold),#7a5510);
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; color:#000;
  }
  .brand-name { font-family:var(--font-display); font-size:20px; font-weight:400; color:var(--gold-light); }
  .brand-sub { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--text-dim); }
  .eyebrow { font-size:9px; letter-spacing:0.32em; text-transform:uppercase; color:var(--quill); opacity:0.8; display:block; margin-bottom:10px; }
  .title { font-family:var(--font-display); font-size:36px; font-weight:300; line-height:1.1; color:var(--text); margin-bottom:8px; }
  .title em { font-style:italic; color:var(--gold-light); }
  .sub { font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:36px; }
  .field { margin-bottom:18px; }
  .label { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-dim); display:block; margin-bottom:8px; }
  .input {
    width:100%; background:var(--ink3); border:1px solid var(--border);
    border-radius:8px; padding:13px 16px;
    font-family:var(--font-ui); font-size:14px; color:var(--text);
    outline:none; transition:border-color 0.2s;
  }
  .input:focus { border-color:var(--gold-dim); }
  .error {
    font-size:12px; color:var(--red); padding:10px 14px; border-radius:8px;
    background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); margin-bottom:16px;
  }
  .success {
    font-size:12px; color:var(--green); padding:10px 14px; border-radius:8px;
    background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.2); margin-bottom:16px;
  }
  .btn {
    width:100%; font-family:var(--font-ui); font-size:12px; font-weight:600;
    letter-spacing:0.18em; text-transform:uppercase; padding:14px;
    border-radius:8px; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--gold),#8a6510); color:#000;
    transition:opacity 0.2s; display:flex; align-items:center; justify-content:center; gap:10px;
    margin-top:24px;
  }
  .btn:hover:not(:disabled) { opacity:0.88; }
  .btn:disabled { opacity:0.4; cursor:not-allowed; }
  .spinner { width:16px; height:16px; border:2px solid rgba(0,0,0,0.2); border-top-color:#000; border-radius:50%; animation:spin 0.7s linear infinite; }
  .strength { margin-top:8px; display:flex; gap:4px; }
  .strength-bar { height:3px; flex:1; border-radius:999px; background:var(--border); transition:background 0.3s; }
  .strength-label { font-size:10px; color:var(--text-dim); margin-top:6px; }
`;

function passwordStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return score;
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase puts the token in the URL hash — we need to let it process
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
  }, []);

  const strength = passwordStrength(password);
  const strengthColors = ['var(--red)', 'var(--red)', '#fbbf24', '#fbbf24', 'var(--green)'];
  const strengthLabels = ['', 'Weak', 'Weak', 'Good', 'Strong', 'Very strong'];

  const handleReset = async () => {
    if (!password) { setError('Please enter a new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess('Password updated! Redirecting to your dashboard…');
      setTimeout(() => { window.location.href = '/dashboard'; }, 2000);
    } catch (e: any) {
      setError(e.message ?? 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <div className="card">
          <div className="card-top" />
          <div className="card-body">
            <div className="brand">
              <div className="logo">TWR</div>
              <div>
                <div className="brand-name">The Writer's Room</div>
                <div className="brand-sub">The Tiniest Library</div>
              </div>
            </div>

            <span className="eyebrow">Account Security</span>
            <h1 className="title">New <em>password.</em></h1>
            <p className="sub">Choose a strong password for your writer account.</p>

            {error && <div className="error">⚠ {error}</div>}
            {success && <div className="success">✓ {success}</div>}

            {!ready && !success && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '20px 0' }}>
                Verifying your reset link…
              </div>
            )}

            {ready && !success && (
              <>
                <div className="field">
                  <label className="label">New Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  {password.length > 0 && (
                    <>
                      <div className="strength">
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className="strength-bar"
                            style={{ background: i <= strength ? strengthColors[strength - 1] : undefined }}
                          />
                        ))}
                      </div>
                      <div className="strength-label">{strengthLabels[strength]}</div>
                    </>
                  )}
                </div>

                <div className="field">
                  <label className="label">Confirm Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Repeat your new password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleReset()}
                  />
                  {confirm.length > 0 && password !== confirm && (
                    <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>Passwords do not match</div>
                  )}
                </div>

                <button className="btn" disabled={loading || password !== confirm || password.length < 8} onClick={handleReset}>
                  {loading ? <span className="spinner" /> : null}
                  {loading ? 'Updating…' : 'Set New Password →'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}