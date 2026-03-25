"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// Route: app/dashboard/page.tsx
// Writer Dashboard — /dashboard
// Protected by Supabase auth
// =========================

const ALL_GENRES = [
  "Fantasy", "Sci-Fi", "Horror Mystery", "Crime & Thrillers",
  "Romance", "Young Adult", "New Adult", "Children's Literature",
  "Cozy", "Poems & Memoirs", "Adventure", "Contemporary Fiction",
  "Historical Fiction", "Serialized Fiction", "Fan Fiction",
  "Slice Of Life", "Dark Academia", "Multi-Cultural", "Black Stories",
  "Latin Stories", "AAPI Authors", "Indigenous Stories",
  "LGBTQ+ Fiction", "Adult 18+",
];

type Tab = "profile" | "stories" | "ink" | "settings";

type WriterProfile = {
  id: string;
  name: string;
  slug: string | null;
  bio: string | null;
  tagline: string | null;
  greeting: string | null;
  genres: string[] | null;
  photo_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  is_founding_author: boolean;
  is_approved: boolean;
  user_id: string | null;
};

type Story = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  badge: string | null;
  is_published: boolean;
  created_at: string;
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E2C97E; --gold-dim: rgba(201,168,76,0.35);
    --gold-glow: rgba(201,168,76,0.10); --blue: #6495ED; --blue-dim: rgba(100,149,237,0.22);
    --blue-bright: #84b0f5; --green: #4ade80; --green-dim: rgba(74,222,128,0.15);
    --red: #f87171; --red-dim: rgba(248,113,113,0.15);
    --quill: #9b6dff; --quill-dim: rgba(155,109,255,0.15);
    --ink-bg: #080808; --ink-surface: #0f0f0f; --ink-surface2: #161616;
    --ink-border: rgba(255,255,255,0.07); --ink-border-gold: rgba(201,168,76,0.22);
    --text-main: #f0ece2; --text-dim: rgba(232,228,218,0.5); --text-faint: rgba(232,228,218,0.25);
  }

  .wd-root { min-height: 100vh; background: var(--ink-bg); font-family: 'Syne', sans-serif; color: var(--text-main); display: flex; }

  /* SIDEBAR */
  .wd-sidebar {
    width: 240px; flex-shrink: 0; background: var(--ink-surface);
    border-right: 1px solid var(--ink-border-gold);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 10;
  }
  .wd-sidebar-top { height: 3px; background: linear-gradient(90deg, transparent, var(--quill), var(--gold), transparent); }
  .wd-sidebar-header { padding: 28px 20px 20px; border-bottom: 1px solid var(--ink-border); }
  .wd-sidebar-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .wd-brand-logo {
    width: 32px; height: 32px; border-radius: 6px;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #000;
  }
  .wd-brand-name { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 400; color: var(--gold-light); }
  .wd-brand-sub { font-size: 9px; color: var(--text-faint); letter-spacing: 0.12em; text-transform: uppercase; }

  /* Author card in sidebar */
  .wd-author-card {
    background: rgba(155,109,255,0.06); border: 1px solid var(--quill-dim);
    border-radius: 8px; padding: 14px;
  }
  .wd-author-avatar {
    width: 48px; height: 48px; border-radius: 8px;
    background: linear-gradient(135deg, #1a1a24, #252535);
    border: 1px solid var(--quill-dim);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300;
    color: var(--quill); overflow: hidden; margin-bottom: 10px;
  }
  .wd-author-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .wd-author-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; color: var(--text-main); margin-bottom: 3px; }
  .wd-author-role { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); opacity: 0.75; }
  .wd-founding-badge {
    display: inline-block; font-size: 8px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold); border: 1px solid var(--gold-dim); background: var(--gold-glow);
    padding: 2px 8px; border-radius: 999px; margin-top: 6px;
  }

  /* NAV */
  .wd-nav { flex: 1; padding: 16px 12px; }
  .wd-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 6px; cursor: pointer;
    font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-faint); border: 1px solid transparent;
    transition: all 0.2s; margin-bottom: 4px; width: 100%;
    background: none; text-align: left;
  }
  .wd-nav-item:hover { color: var(--text-dim); background: rgba(255,255,255,0.03); }
  .wd-nav-item.active { color: var(--gold-light); background: var(--gold-glow); border-color: var(--gold-dim); }
  .wd-nav-icon { font-size: 14px; width: 18px; text-align: center; }

  .wd-sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--ink-border); display: flex; flex-direction: column; gap: 8px; }
  .wd-profile-link {
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--blue-bright); background: rgba(100,149,237,0.08);
    border: 1px solid var(--blue-dim); border-radius: 6px;
    padding: 8px; text-align: center; text-decoration: none; transition: all 0.2s;
    display: block;
  }
  .wd-profile-link:hover { background: rgba(100,149,237,0.15); }
  .wd-logout-btn {
    width: 100%; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-faint); background: transparent;
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 8px; cursor: pointer; transition: all 0.2s;
  }
  .wd-logout-btn:hover { color: var(--red); border-color: rgba(248,113,113,0.3); }

  /* MAIN */
  .wd-main { margin-left: 240px; flex: 1; min-height: 100vh; }
  .wd-topbar {
    padding: 20px 36px; border-bottom: 1px solid var(--ink-border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(8,8,8,0.9); backdrop-filter: blur(10px);
    position: sticky; top: 0; z-index: 5;
  }
  .wd-topbar-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 300; color: var(--text-main); }
  .wd-topbar-sub { font-size: 11px; color: var(--text-faint); margin-top: 2px; }
  .wd-content { padding: 36px; max-width: 900px; }

  /* FORM SECTIONS */
  .wd-section { margin-bottom: 40px; }
  .wd-section-title {
    font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300;
    color: var(--text-main); margin-bottom: 4px;
  }
  .wd-section-sub { font-size: 12px; color: var(--text-faint); margin-bottom: 24px; line-height: 1.6; }
  .wd-divider { height: 1px; background: linear-gradient(to right, var(--gold-dim), transparent); margin-bottom: 28px; }

  /* FIELDS */
  .wd-field { margin-bottom: 20px; }
  .wd-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .wd-label {
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--text-faint); display: block; margin-bottom: 7px;
  }
  .wd-input {
    width: 100%; background: var(--ink-surface);
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 11px 14px; font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-main); outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .wd-input::placeholder { color: var(--text-faint); }
  .wd-input:focus { border-color: var(--gold-dim); background: rgba(201,168,76,0.03); }
  .wd-textarea {
    width: 100%; background: var(--ink-surface);
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 14px; font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-main); outline: none;
    resize: vertical; line-height: 1.7; min-height: 120px;
    transition: border-color 0.2s;
  }
  .wd-textarea::placeholder { color: var(--text-faint); }
  .wd-textarea:focus { border-color: var(--gold-dim); }
  .wd-field-hint { font-size: 10px; color: var(--text-faint); margin-top: 6px; line-height: 1.5; }

  /* PHOTO UPLOAD */
  .wd-photo-wrap { display: flex; align-items: flex-start; gap: 24px; margin-bottom: 24px; }
  .wd-photo-preview {
    width: 100px; height: 100px; border-radius: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, #1a1a24, #252535);
    border: 2px solid var(--gold-dim);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-size: 40px;
    font-weight: 300; color: var(--gold); overflow: hidden;
    box-shadow: 0 0 30px var(--gold-glow);
  }
  .wd-photo-preview img { width: 100%; height: 100%; object-fit: cover; }
  .wd-photo-controls { flex: 1; }
  .wd-photo-btn {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-dim); border: 1px solid var(--ink-border);
    background: transparent; padding: 9px 18px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s; display: inline-block;
  }
  .wd-photo-btn:hover { color: var(--gold-light); border-color: var(--gold-dim); background: var(--gold-glow); }
  .wd-photo-uploading { font-size: 11px; color: var(--text-faint); margin-top: 8px; }

  /* GENRE GRID */
  .wd-genre-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
  .wd-genre-btn {
    font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 8px 10px; border-radius: 4px; cursor: pointer;
    border: 1px solid var(--ink-border); color: var(--text-faint);
    background: transparent; transition: all 0.18s; text-align: left;
    display: flex; align-items: center; gap: 6px;
  }
  .wd-genre-btn:hover { border-color: var(--gold-dim); color: var(--text-dim); }
  .wd-genre-btn.selected { border-color: var(--gold-dim); color: var(--gold-light); background: var(--gold-glow); }
  .wd-genre-check { width: 12px; height: 12px; border-radius: 2px; border: 1px solid currentColor; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 8px; }

  /* SAVE BUTTON */
  .wd-save-row { display: flex; align-items: center; gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--ink-border); }
  .wd-btn-save {
    font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; font-weight: 700; color: #000;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    border: none; padding: 13px 32px; border-radius: 6px;
    cursor: pointer; transition: opacity 0.2s;
  }
  .wd-btn-save:hover:not(:disabled) { opacity: 0.88; }
  .wd-btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
  .wd-save-status { font-size: 12px; color: var(--green); display: flex; align-items: center; gap: 6px; }
  .wd-save-error { font-size: 12px; color: var(--red); }

  /* STORIES */
  .wd-stories-grid { display: flex; flex-direction: column; gap: 12px; }
  .wd-story-card {
    background: var(--ink-surface); border: 1px solid var(--ink-border);
    border-radius: 8px; padding: 18px 20px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .wd-story-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; color: var(--text-main); margin-bottom: 4px; }
  .wd-story-meta { font-size: 11px; color: var(--text-faint); }
  .wd-badge { font-size: 8px; letter-spacing: 0.14em; text-transform: uppercase; padding: 3px 9px; border-radius: 999px; }
  .wd-badge-serial { border: 1px solid var(--blue-dim); color: var(--blue-bright); background: rgba(100,149,237,0.08); }
  .wd-badge-exclusive { border: 1px solid var(--gold-dim); color: var(--gold-light); background: var(--gold-glow); }
  .wd-badge-early { border: 1px solid rgba(232,228,218,0.2); color: var(--text-dim); background: rgba(232,228,218,0.05); }
  .wd-published { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); }
  .wd-draft { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-faint); }

  /* INK */
  .wd-ink-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
  .wd-ink-card {
    background: var(--ink-surface); border: 1px solid var(--ink-border);
    border-radius: 8px; padding: 20px; position: relative; overflow: hidden;
  }
  .wd-ink-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .wd-ink-num { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: var(--gold); line-height: 1; margin-bottom: 6px; }
  .wd-ink-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); }
  .wd-ink-sub { font-size: 10px; color: var(--text-faint); margin-top: 4px; }

  /* SETTINGS */
  .wd-settings-card {
    background: var(--ink-surface); border: 1px solid var(--ink-border);
    border-radius: 8px; padding: 24px; margin-bottom: 16px;
  }
  .wd-settings-title { font-size: 14px; color: var(--text-main); font-weight: 500; margin-bottom: 6px; }
  .wd-settings-sub { font-size: 12px; color: var(--text-faint); line-height: 1.6; margin-bottom: 16px; }
  .wd-btn-ghost {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-dim); background: transparent;
    border: 1px solid var(--ink-border); padding: 9px 20px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s;
  }
  .wd-btn-ghost:hover { color: var(--gold-light); border-color: var(--gold-dim); }
  .wd-btn-danger {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--red); background: var(--red-dim);
    border: 1px solid rgba(248,113,113,0.3); padding: 9px 20px; border-radius: 6px;
    cursor: pointer; transition: all 0.2s;
  }
  .wd-btn-danger:hover { background: rgba(248,113,113,0.25); }

  /* EMPTY STATE */
  .wd-empty { padding: 48px; text-align: center; }
  .wd-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 300; color: var(--text-dim); margin-bottom: 8px; }
  .wd-empty-sub { font-size: 12px; color: var(--text-faint); line-height: 1.7; }

  /* NOT APPROVED */
  .wd-pending-wrap { max-width: 580px; margin: 80px auto; padding: 0 40px; text-align: center; }
  .wd-pending-icon { font-size: 48px; margin-bottom: 20px; display: block; }
  .wd-pending-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: var(--text-main); margin-bottom: 14px; }
  .wd-pending-sub { font-size: 13px; color: var(--text-dim); line-height: 1.8; margin-bottom: 28px; }

  /* LOGIN */
  .wd-login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--ink-bg); }
  .wd-login-card { width: 100%; max-width: 420px; background: var(--ink-surface); border: 1px solid var(--ink-border-gold); border-radius: 8px; overflow: hidden; box-shadow: 0 40px 80px rgba(0,0,0,0.6); }
  .wd-login-top { height: 3px; background: linear-gradient(90deg, transparent, var(--quill), var(--gold), transparent); }
  .wd-login-body { padding: 40px; }
  .wd-login-eyebrow { font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--quill); opacity: 0.8; display: block; margin-bottom: 10px; }
  .wd-login-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: var(--text-main); margin-bottom: 6px; }
  .wd-login-sub { font-size: 12px; color: var(--text-faint); margin-bottom: 28px; line-height: 1.6; }
  .wd-login-field { margin-bottom: 16px; }
  .wd-login-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); display: block; margin-bottom: 7px; }
  .wd-login-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--ink-border); border-radius: 5px; padding: 11px 14px; font-family: 'Syne', sans-serif; font-size: 13px; color: var(--text-main); outline: none; transition: border-color 0.2s; }
  .wd-login-input:focus { border-color: var(--quill-dim); }
  .wd-login-btn { width: 100%; font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 700; color: #000; background: linear-gradient(135deg, var(--gold), #8a6510); border: none; padding: 13px; border-radius: 5px; cursor: pointer; transition: opacity 0.2s; margin-top: 8px; }
  .wd-login-btn:hover:not(:disabled) { opacity: 0.88; }
  .wd-login-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .wd-login-error { font-size: 11px; color: var(--red); margin-top: 12px; padding: 9px 12px; background: var(--red-dim); border-radius: 5px; border: 1px solid rgba(248,113,113,0.25); }
  .wd-login-register { font-size: 11px; color: var(--text-faint); text-align: center; margin-top: 16px; }
  .wd-login-register a { color: var(--gold-light); text-decoration: none; }

  @media (max-width: 900px) {
    .wd-sidebar { display: none; }
    .wd-main { margin-left: 0; }
    .wd-genre-grid { grid-template-columns: repeat(2, 1fr); }
    .wd-field-row { grid-template-columns: 1fr; }
    .wd-ink-stats { grid-template-columns: repeat(2, 1fr); }
    .wd-content { padding: 24px; }
  }
`;

// ── Login ─────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [registered, setRegistered] = useState(false);

  const handle = async () => {
    setLoading(true); setError("");
    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      onLogin();
    } else {
      const { error: err } = await supabase.auth.signUp({ email, password });
      if (err) { setError(err.message); setLoading(false); return; }
      setRegistered(true);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="wd-login-wrap">
        <div className="wd-login-card">
          <div className="wd-login-top" />
          <div className="wd-login-body">
            <span className="wd-login-eyebrow">The Tiniest Library</span>
            <div className="wd-login-title">{mode === "login" ? "Writer Login" : "Create Account"}</div>
            <p className="wd-login-sub">
              {mode === "login"
                ? "Sign in to manage your profile, stories, and ink earnings."
                : "Create your writer account. You'll need to be approved before your profile goes live."
              }
            </p>
            {registered ? (
              <div style={{ padding: "16px", background: "var(--green-dim)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 6, fontSize: 12, color: "var(--green)", lineHeight: 1.7 }}>
                Account created! Check your email to confirm, then come back to sign in.
              </div>
            ) : (
              <>
                <div className="wd-login-field">
                  <label className="wd-login-label">Email</label>
                  <input className="wd-login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
                </div>
                <div className="wd-login-field">
                  <label className="wd-login-label">Password</label>
                  <input className="wd-login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
                </div>
                {error && <div className="wd-login-error">{error}</div>}
                <button className="wd-login-btn" disabled={loading || !email || !password} onClick={handle}>
                  {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
                </button>
                <div className="wd-login-register">
                  {mode === "login"
                    ? <>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); setMode("register"); }}>Register</a></>
                    : <>Already have an account? <a href="#" onClick={e => { e.preventDefault(); setMode("login"); }}>Sign in</a></>
                  }
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Profile Tab ───────────────────────────────────────────────
function ProfileTab({ profile, onSave }: { profile: WriterProfile; onSave: (p: Partial<WriterProfile>) => Promise<void> }) {
  const [form, setForm] = useState({
    name: profile.name ?? "",
    tagline: profile.tagline ?? "",
    bio: profile.bio ?? "",
    greeting: profile.greeting ?? "",
    genres: profile.genres ?? [],
    twitter_url: profile.twitter_url ?? "",
    instagram_url: profile.instagram_url ?? "",
    website_url: profile.website_url ?? "",
    photo_url: profile.photo_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleGenre = (g: string) => {
    const next = form.genres.includes(g) ? form.genres.filter(x => x !== g) : [...form.genres, g];
    update("genres", next);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("writer-photos").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("writer-photos").getPublicUrl(path);
      update("photo_url", data.publicUrl);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true); setSaveStatus("idle");
    try {
      await onSave(form);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch {
      setSaveStatus("error");
    }
    setSaving(false);
  };

  const initial = form.name.split(" ").pop()?.[0]?.toUpperCase() ?? "W";

  return (
    <div className="wd-content">
      {/* Photo */}
      <div className="wd-section">
        <div className="wd-section-title">Profile Photo</div>
        <p className="wd-section-sub">Your photo appears on your author card and profile page in The Reading Room.</p>
        <div className="wd-photo-wrap">
          <div className="wd-photo-preview">
            {form.photo_url ? <img src={form.photo_url} alt="Profile" /> : initial}
          </div>
          <div className="wd-photo-controls">
            <button className="wd-photo-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload Photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            {uploading && <div className="wd-photo-uploading">Uploading to Supabase Storage…</div>}
            <p className="wd-field-hint" style={{ marginTop: 10 }}>JPG or PNG, max 5MB. Square images work best.</p>
          </div>
        </div>
      </div>

      <div className="wd-divider" />

      {/* Identity */}
      <div className="wd-section">
        <div className="wd-section-title">Identity</div>
        <p className="wd-section-sub">How you appear to readers across TTL.</p>
        <div className="wd-field-row">
          <div className="wd-field">
            <label className="wd-label">Display Name *</label>
            <input className="wd-input" type="text" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your name or pen name" />
          </div>
          <div className="wd-field">
            <label className="wd-label">Tagline</label>
            <input className="wd-input" type="text" value={form.tagline} onChange={e => update("tagline", e.target.value)} placeholder="One sentence that captures your voice" maxLength={100} />
          </div>
        </div>
        <div className="wd-field">
          <label className="wd-label">Author Bio</label>
          <textarea className="wd-textarea" rows={5} value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Tell readers about yourself — your background, your influences, what drives your writing…" />
          <p className="wd-field-hint">This appears on your public profile page in The Reading Room.</p>
        </div>
        <div className="wd-field">
          <label className="wd-label">Achievements & Notable Works</label>
          <textarea className="wd-textarea" rows={3} value={form.greeting} onChange={e => update("greeting", e.target.value)} placeholder="Awards, milestones, publications, reader milestones — anything worth celebrating…" />
        </div>
      </div>

      <div className="wd-divider" />

      {/* Genres */}
      <div className="wd-section">
        <div className="wd-section-title">Your Genres</div>
        <p className="wd-section-sub">Select all genres you write in. Your profile will appear on each genre page in The Reading Room.</p>
        <div className="wd-genre-grid">
          {ALL_GENRES.map(g => (
            <button key={g} type="button" className={`wd-genre-btn${form.genres.includes(g) ? " selected" : ""}`} onClick={() => toggleGenre(g)}>
              <span className="wd-genre-check">{form.genres.includes(g) ? "✓" : ""}</span>
              {g}
            </button>
          ))}
        </div>
        {form.genres.length > 0 && (
          <p className="wd-field-hint" style={{ marginTop: 10 }}>Selected: {form.genres.join(", ")}</p>
        )}
      </div>

      <div className="wd-divider" />

      {/* Social */}
      <div className="wd-section">
        <div className="wd-section-title">Social Links</div>
        <p className="wd-section-sub">These appear as buttons on your public profile.</p>
        <div className="wd-field">
          <label className="wd-label">Website</label>
          <input className="wd-input" type="url" value={form.website_url} onChange={e => update("website_url", e.target.value)} placeholder="https://yoursite.com" />
        </div>
        <div className="wd-field-row">
          <div className="wd-field">
            <label className="wd-label">Twitter / X</label>
            <input className="wd-input" type="url" value={form.twitter_url} onChange={e => update("twitter_url", e.target.value)} placeholder="https://twitter.com/you" />
          </div>
          <div className="wd-field">
            <label className="wd-label">Instagram</label>
            <input className="wd-input" type="url" value={form.instagram_url} onChange={e => update("instagram_url", e.target.value)} placeholder="https://instagram.com/you" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="wd-save-row">
        <button className="wd-btn-save" disabled={saving || !form.name.trim()} onClick={handleSave}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
        {saveStatus === "saved" && <span className="wd-save-status">✓ Profile saved — live in The Reading Room</span>}
        {saveStatus === "error" && <span className="wd-save-error">Something went wrong. Try again.</span>}
      </div>
    </div>
  );
}

// ── Stories Tab ───────────────────────────────────────────────
function StoriesTab({ writerId }: { writerId: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("stories").select("*")
      .eq("author_id", writerId)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setStories(data ?? []); setLoading(false); });
  }, [writerId]);

  const badgeClass = (badge: string | null) => {
    if (badge === "Exclusive") return "wd-badge wd-badge-exclusive";
    if (badge === "Early Access") return "wd-badge wd-badge-early";
    return "wd-badge wd-badge-serial";
  };

  return (
    <div className="wd-content">
      <div className="wd-section-title" style={{ marginBottom: 6 }}>Your Stories</div>
      <p className="wd-section-sub" style={{ marginBottom: 24 }}>Stories submitted to TTL. Contact us to add or update stories.</p>
      {loading ? (
        <div className="wd-empty"><div className="wd-empty-title">Loading…</div></div>
      ) : stories.length === 0 ? (
        <div className="wd-empty">
          <div className="wd-empty-title">No stories yet.</div>
          <p className="wd-empty-sub">Once you submit a story and it's approved, it will appear here and go live in The Reading Room.</p>
        </div>
      ) : (
        <div className="wd-stories-grid">
          {stories.map(s => (
            <div key={s.id} className="wd-story-card">
              <div>
                <div className="wd-story-title">{s.title}</div>
                <div className="wd-story-meta">{s.slug} · Added {new Date(s.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                {s.badge && <span className={badgeClass(s.badge)}>{s.badge}</span>}
                <span className={s.is_published ? "wd-published" : "wd-draft"}>{s.is_published ? "Live" : "Draft"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Ink Tab ───────────────────────────────────────────────────
function InkTab({ profile }: { profile: WriterProfile }) {
  const jarTotal = 0; // Will connect to real jar data later
  return (
    <div className="wd-content">
      <div className="wd-section-title" style={{ marginBottom: 6 }}>Ink & Earnings</div>
      <p className="wd-section-sub" style={{ marginBottom: 24 }}>Track your reader tips and story unlock revenue.</p>
      <div className="wd-ink-stats">
        <div className="wd-ink-card">
          <div className="wd-ink-num">{jarTotal}</div>
          <div className="wd-ink-label">Ink Jar Total</div>
          <div className="wd-ink-sub">Tips from readers</div>
        </div>
        <div className="wd-ink-card">
          <div className="wd-ink-num">0</div>
          <div className="wd-ink-label">Story Unlocks</div>
          <div className="wd-ink-sub">Readers who unlocked your work</div>
        </div>
        <div className="wd-ink-card">
          <div className="wd-ink-num">$0</div>
          <div className="wd-ink-label">Est. Payout</div>
          <div className="wd-ink-sub">Next distribution</div>
        </div>
      </div>
      <div style={{ padding: "20px 24px", background: "var(--ink-surface)", border: "1px solid var(--ink-border-gold)", borderRadius: 8 }}>
        <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.8 }}>
          Ink revenue distributions happen monthly. Tips go directly to you with no platform fee. Story unlock revenue is distributed at the rate disclosed in your approval email. Payouts require a minimum accumulated balance — details coming to your email once your first story goes live.
        </p>
      </div>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────
function SettingsTab({ email }: { email: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [pwStatus, setPwStatus] = useState("");

  const updatePassword = async () => {
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwStatus(error ? error.message : "Password updated successfully.");
    setUpdating(false);
    setNewPassword("");
  };

  return (
    <div className="wd-content">
      <div className="wd-section-title" style={{ marginBottom: 6 }}>Settings</div>
      <p className="wd-section-sub" style={{ marginBottom: 24 }}>Manage your account.</p>

      <div className="wd-settings-card">
        <div className="wd-settings-title">Account Email</div>
        <p className="wd-settings-sub">Your login email. Contact TTL to change it.</p>
        <div style={{ fontFamily: "monospace", fontSize: 13, color: "var(--text-dim)", padding: "9px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--ink-border)", borderRadius: 6 }}>{email}</div>
      </div>

      <div className="wd-settings-card">
        <div className="wd-settings-title">Change Password</div>
        <p className="wd-settings-sub">Set a new password for your writer account.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="wd-label">New Password</label>
            <input className="wd-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <button className="wd-btn-ghost" disabled={updating || newPassword.length < 6} onClick={updatePassword} style={{ flexShrink: 0 }}>
            {updating ? "Updating…" : "Update"}
          </button>
        </div>
        {pwStatus && <p style={{ fontSize: 11, color: pwStatus.includes("success") ? "var(--green)" : "var(--red)", marginTop: 10 }}>{pwStatus}</p>}
      </div>

      <div className="wd-settings-card" style={{ borderColor: "rgba(248,113,113,0.2)" }}>
        <div className="wd-settings-title">Contact TTL</div>
        <p className="wd-settings-sub">Need to remove a story, update your email, or have a question about your account?</p>
        <a href="https://www.the-tiniest-library.com" target="_blank" rel="noopener noreferrer" className="wd-btn-ghost" style={{ display: "inline-block", textDecoration: "none" }}>
          Contact The Tiniest Library →
        </a>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function WriterDashboard() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [profile, setProfile] = useState<WriterProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  useEffect(() => {
    if (!session) return;
    loadProfile();
  }, [session]);

  async function loadProfile() {
    setProfileLoading(true);
    const { data } = await supabase
      .from("writers")
      .select("*")
      .eq("user_id", session.user.id)
      .single();

    if (!data) {
      // Try matching by email if user_id not set yet
      const { data: byEmail } = await supabase
        .from("writers")
        .select("*")
        .eq("name", session.user.email)
        .single();

      if (byEmail) {
        // Link user_id to writer record
        await supabase.from("writers").update({ user_id: session.user.id }).eq("id", byEmail.id);
        setProfile({ ...byEmail, user_id: session.user.id });
      } else {
        // Create a new writer record
        const { data: created } = await supabase.from("writers").insert({
          name: session.user.email?.split("@")[0] ?? "New Writer",
          user_id: session.user.id,
          is_approved: false,
          is_founding_author: false,
        }).select().single();
        setProfile(created);
      }
    } else {
      setProfile(data);
    }
    setProfileLoading(false);
  }

  async function saveProfile(updates: Partial<WriterProfile>) {
    if (!profile) return;
    // Auto-generate slug from name if not set
    if (!profile.slug && updates.name) {
      updates.slug = (updates.name as string).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    const { error } = await supabase.from("writers").update(updates).eq("id", profile.id);
    if (error) throw error;
    setProfile(p => p ? { ...p, ...updates } : p);
  }

  if (checking || profileLoading) return <><style>{STYLES}</style><div style={{ minHeight: "100vh", background: "#080808" }} /></>;
  if (!session) return <LoginScreen onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;

  const initial = profile?.name?.split(" ").pop()?.[0]?.toUpperCase() ?? "W";
  const slug = profile?.slug;

  const NAV = [
    { key: "profile" as Tab, label: "My Profile", icon: "🪶" },
    { key: "stories" as Tab, label: "My Stories", icon: "📖" },
    { key: "ink" as Tab, label: "Ink & Earnings", icon: "✒️" },
    { key: "settings" as Tab, label: "Settings", icon: "⚙️" },
  ];

  const TAB_TITLES: Record<Tab, string> = {
    profile: "My Profile",
    stories: "My Stories",
    ink: "Ink & Earnings",
    settings: "Settings",
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="wd-root">
        <aside className="wd-sidebar">
          <div className="wd-sidebar-top" />
          <div className="wd-sidebar-header">
            <div className="wd-sidebar-brand">
              <div className="wd-brand-logo">TTL</div>
              <div>
                <div className="wd-brand-name">The Tiniest Library</div>
                <div className="wd-brand-sub">Writer Dashboard</div>
              </div>
            </div>
            <div className="wd-author-card">
              <div className="wd-author-avatar">
                {profile?.photo_url ? <img src={profile.photo_url} alt={profile.name} /> : initial}
              </div>
              <div className="wd-author-name">{profile?.name ?? "Writer"}</div>
              <div className="wd-author-role">{profile?.is_approved ? "Approved Writer" : "Pending Approval"}</div>
              {profile?.is_founding_author && <div className="wd-founding-badge">Founding Author</div>}
            </div>
          </div>

          <nav className="wd-nav">
            {NAV.map(n => (
              <button key={n.key} className={`wd-nav-item${tab === n.key ? " active" : ""}`} onClick={() => setTab(n.key)}>
                <span className="wd-nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="wd-sidebar-footer">
            {profile?.is_approved && slug && (
              <a href={`https://the-reading-room-three.vercel.app/reading-room/authors/${slug}`} target="_blank" rel="noopener noreferrer" className="wd-profile-link">
                View Public Profile →
              </a>
            )}
            <button className="wd-logout-btn" onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        </aside>

        <main className="wd-main">
          <div className="wd-topbar">
            <div>
              <div className="wd-topbar-title">{TAB_TITLES[tab]}</div>
              <div className="wd-topbar-sub">{session.user.email}</div>
            </div>
            {!profile?.is_approved && (
              <div style={{ fontSize: 11, color: "var(--amber)", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", padding: "8px 16px", borderRadius: 6 }}>
                Application under review — profile won't go public until approved
              </div>
            )}
          </div>

          {tab === "profile" && profile && (
            <ProfileTab profile={profile} onSave={saveProfile} />
          )}
          {tab === "stories" && profile && (
            <StoriesTab writerId={profile.id} />
          )}
          {tab === "ink" && profile && (
            <InkTab profile={profile} />
          )}
          {tab === "settings" && (
            <SettingsTab email={session.user.email} />
          )}
        </main>
      </div>
    </>
  );
}
