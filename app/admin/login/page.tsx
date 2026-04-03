"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E2C97E; --gold-dim: rgba(201,168,76,0.3);
    --gold-glow: rgba(201,168,76,0.08); --quill: #9b6dff;
    --ink: #0a0a0f; --ink2: #111118; --ink3: #18181f;
    --border: rgba(255,255,255,0.06); --border-gold: rgba(201,168,76,0.18);
    --text: #f0ece2; --text-muted: rgba(240,236,226,0.5); --text-dim: rgba(240,236,226,0.25);
    --red: #f87171; --font-display: 'Cormorant Garamond', serif; --font-ui: 'Syne', sans-serif;
  }
  body { background: var(--ink); color: var(--text); font-family: var(--font-ui); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin { to { transform:rotate(360deg); } }

  .login-root {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    position:relative; overflow:hidden; padding:24px;
  }
  .login-root::before {
    content:''; position:fixed; inset:0; pointer-events:none;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity:0.4;
  }
  .login-root::after {
    content:''; position:fixed; top:-20%; left:50%; transform:translateX(-50%);
    width:600px; height:600px;
    background:radial-gradient(ellipse, rgba(155,109,255,0.06) 0%, transparent 70%);
    pointer-events:none;
  }
  .login-card {
    position:relative; z-index:1; width:100%; max-width:440px;
    background:var(--ink2); border:1px solid var(--border-gold); border-radius:20px;
    overflow:hidden; animation:fadeUp 0.6s ease forwards;
    box-shadow:0 40px 80px rgba(0,0,0,0.6);
  }
  .login-card-top { height:3px; background:linear-gradient(90deg,transparent,var(--gold),var(--quill),var(--gold),transparent); }
  .login-card-body { padding:48px 40px 40px; }
  .login-brand { display:flex; align-items:center; gap:14px; margin-bottom:36px; }
  .login-logo {
    width:44px; height:44px; border-radius:10px;
    background:linear-gradient(135deg,var(--gold),#7a5510);
    display:flex; align-items:center; justify-content:center;
    font-size:13px; font-weight:700; color:#000; flex-shrink:0;
  }
  .login-brand-name { font-family:var(--font-display); font-size:20px; font-weight:400; color:var(--gold-light); line-height:1.2; }
  .login-brand-sub { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--text-dim); }
  .invite-badge {
    display:inline-flex; align-items:center; gap:8px;
    font-size:10px; letter-spacing:0.14em; text-transform:uppercase;
    color:var(--gold); border:1px solid var(--gold-dim); background:var(--gold-glow);
    padding:6px 14px; border-radius:999px; margin-bottom:24px;
  }
  .login-eyebrow { font-size:9px; letter-spacing:0.32em; text-transform:uppercase; color:var(--quill); opacity:0.8; display:block; margin-bottom:10px; }
  .login-title { font-family:var(--font-display); font-size:36px; font-weight:300; line-height:1.1; color:var(--text); margin-bottom:8px; }
  .login-title em { font-style:italic; color:var(--gold-light); }
  .login-sub { font-size:13px; color:var(--text-muted); line-height:1.6; margin-bottom:32px; }
  .login-field { margin-bottom:18px; }
  .login-label { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-dim); display:block; margin-bottom:8px; }
  .login-input {
    width:100%; background:var(--ink3); border:1px solid var(--border); border-radius:8px;
    padding:13px 16px; font-family:var(--font-ui); font-size:14px; color:var(--text);
    outline:none; transition:border-color 0.2s, background 0.2s;
  }
  .login-input::placeholder { color:var(--text-dim); }
  .login-input:focus { border-color:var(--gold-dim); background:rgba(201,168,76,0.03); }
  .login-error { font-size:12px; color:var(--red); padding:10px 14px; border-radius:8px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.2); margin-bottom:16px; }
  .login-success { font-size:12px; color:#4ade80; padding:10px 14px; border-radius:8px; background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.2); margin-bottom:16px; }
  .login-btn {
    width:100%; font-family:var(--font-ui); font-size:12px; font-weight:600;
    letter-spacing:0.18em; text-transform:uppercase; padding:14px; border-radius:8px;
    border:none; cursor:pointer; background:linear-gradient(135deg,var(--gold),#8a6510);
    color:#000; transition:opacity 0.2s;
    display:flex; align-items:center; justify-content:center; gap:10px; margin-bottom:12px;
  }
  .login-btn:hover:not(:disabled) { opacity:0.88; }
  .login-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .login-btn-ghost {
    width:100%; font-family:var(--font-ui); font-size:11px; font-weight:500;
    letter-spacing:0.14em; text-transform:uppercase; padding:12px; border-radius:8px;
    border:1px solid var(--border); background:transparent; color:var(--text-dim);
    cursor:pointer; transition:all 0.2s;
  }
  .login-btn-ghost:hover { color:var(--text-muted); border-color:var(--border-gold); }
  .login-divider { display:flex; align-items:center; gap:12px; margin:16px 0; }
  .login-divider-line { flex:1; height:1px; background:var(--border); }
  .login-divider-text { font-size:11px; color:var(--text-dim); letter-spacing:0.1em; }
  .login-footer { padding:20px 40px 28px; border-top:1px solid var(--border); }
  .login-footer-text { font-size:12px; color:var(--text-dim); line-height:1.7; text-align:center; }
  .login-footer-link { color:var(--gold); text-decoration:none; transition:opacity 0.2s; }
  .login-footer-link:hover { opacity:0.75; }
  .login-footer-note { margin-top:12px; padding-top:12px; border-top:1px solid var(--border); font-size:11px; color:var(--text-dim); text-align:center; line-height:1.6; }
  .spinner { width:16px; height:16px; border:2px solid rgba(0,0,0,0.2); border-top-color:#000; border-radius:50%; animation:spin 0.7s linear infinite; }
  @media (max-width:480px) { .login-card-body { padding:36px 24px 28px; } .login-footer { padding:16px 24px 24px; } }
`;

type Mode = 'signin' | 'reset';

export default function WritersRoomLogin() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message ?? 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://the-writer-s-room.vercel.app/dashboard',
      });
      if (error) throw error;
      setSuccess('Reset link sent! Check your inbox.');
    } catch (e: any) {
      setError(e.message ?? 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="login-root">
        <div className="login-card">
          <div className="login-card-top" />
          <div className="login-card-body">

            <div className="login-brand">
              <div className="login-logo">TWR</div>
              <div>
                <div className="login-brand-name">The Writer's Room</div>
                <div className="login-brand-sub">The Tiniest Library</div>
              </div>
            </div>

            <div className="invite-badge">🔒 Approved Writers Only</div>

            <span className="login-eyebrow">
              {mode === 'signin' ? 'Writer Access' : 'Reset Password'}
            </span>
            <h1 className="login-title">
              {mode === 'signin' ? <>Welcome <em>back.</em></> : <>Reset your <em>password.</em></>}
            </h1>
            <p className="login-sub">
              {mode === 'signin'
                ? 'Sign in to your Writer HQ — manage chapters, track earnings, and request payouts.'
                : 'Enter your email and we\'ll send you a secure reset link.'}
            </p>

            {error && <div className="login-error">⚠ {error}</div>}
            {success && <div className="login-success">✓ {success}</div>}

            <div className="login-field">
              <label className="login-label">Email Address</label>
              <input
                className="login-input" type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'signin' ? handleSignIn() : handleReset())}
              />
            </div>

            {mode === 'signin' && (
              <div className="login-field">
                <label className="login-label">Password</label>
                <input
                  className="login-input" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignIn()}
                />
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <button className="login-btn" disabled={loading}
                onClick={mode === 'signin' ? handleSignIn : handleReset}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Please wait…' :
                 mode === 'signin' ? 'Sign In to Writer HQ →' : 'Send Reset Link →'}
              </button>

              <div className="login-divider">
                <div className="login-divider-line" />
                <span className="login-divider-text">{mode === 'signin' ? 'trouble signing in?' : 'remembered it?'}</span>
                <div className="login-divider-line" />
              </div>

              <button className="login-btn-ghost"
                onClick={() => { setMode(mode === 'signin' ? 'reset' : 'signin'); setError(''); setSuccess(''); }}>
                {mode === 'signin' ? 'Forgot Password?' : '← Back to Sign In'}
              </button>
            </div>
          </div>

          <div className="login-footer">
            <p className="login-footer-text">
              Don't have access yet?{' '}
              <a href="/apply" className="login-footer-link">Apply to write for TTL →</a>
            </p>
            <p className="login-footer-note">
              Writer accounts are by invitation only. Once your application is approved you'll receive an email invite with instructions to set up your account.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
