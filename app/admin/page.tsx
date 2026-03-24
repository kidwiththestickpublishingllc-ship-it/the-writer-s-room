"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// Route: app/admin/page.tsx
// TTL Admin Dashboard — /admin
// Protected by Supabase auth
// =========================

type Tab = "applications" | "stories" | "writers" | "agreements" | "ink";

type Application = {
  id: string;
  created_at: string;
  full_name: string;
  pen_name: string | null;
  email: string;
  bio: string | null;
  why_ttl: string | null;
  genres: string[];
  writing_sample: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  status: string;
};

type Writer = {
  id: string;
  created_at: string;
  name: string;
  slug: string | null;
  bio: string | null;
  tagline: string | null;
  genres: string[] | null;
  photo_url: string | null;
  is_founding_author: boolean;
  is_approved: boolean;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
};

type Story = {
  id: string;
  created_at: string;
  title: string;
  slug: string;
  author_name: string;
  description: string | null;
  badge: string | null;
  is_published: boolean;
};

type Agreement = {
  id: string;
  created_at: string;
  writer_name: string;
  writer_email: string | null;
  document_type: string;
  document_version: string;
  signed_at: string;
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --gold: #C9A84C; --gold-light: #E2C97E; --gold-dim: rgba(201,168,76,0.35);
    --gold-glow: rgba(201,168,76,0.10); --blue: #6495ED; --blue-dim: rgba(100,149,237,0.22);
    --blue-bright: #84b0f5; --green: #4ade80; --green-dim: rgba(74,222,128,0.15);
    --red: #f87171; --red-dim: rgba(248,113,113,0.15);
    --amber: #fbbf24; --amber-dim: rgba(251,191,36,0.15);
    --ink-bg: #080808; --ink-surface: #0f0f0f; --ink-surface2: #161616;
    --ink-border: rgba(255,255,255,0.07); --ink-border-gold: rgba(201,168,76,0.22);
    --text-main: #f0ece2; --text-dim: rgba(232,228,218,0.5); --text-faint: rgba(232,228,218,0.25);
  }
  .adm-root { min-height: 100vh; background: var(--ink-bg); font-family: 'Syne', sans-serif; color: var(--text-main); display: flex; }

  /* SIDEBAR */
  .adm-sidebar {
    width: 220px; flex-shrink: 0; background: var(--ink-surface);
    border-right: 1px solid var(--ink-border-gold);
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 10;
  }
  .adm-sidebar-header {
    padding: 24px 20px 20px; border-bottom: 1px solid var(--ink-border);
  }
  .adm-sidebar-logo {
    display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
  }
  .adm-logo-badge {
    width: 30px; height: 30px; border-radius: 6px;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #000;
  }
  .adm-sidebar-title { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 400; color: var(--gold-light); }
  .adm-sidebar-sub { font-size: 9px; color: var(--text-faint); letter-spacing: 0.12em; text-transform: uppercase; margin-top: 2px; }
  .adm-nav { flex: 1; padding: 16px 12px; }
  .adm-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: 6px; cursor: pointer;
    font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-faint); border: 1px solid transparent;
    transition: all 0.2s; margin-bottom: 4px; width: 100%; background: none;
    text-align: left;
  }
  .adm-nav-item:hover { color: var(--text-dim); background: rgba(255,255,255,0.03); }
  .adm-nav-item.active { color: var(--gold-light); background: var(--gold-glow); border-color: var(--gold-dim); }
  .adm-nav-badge {
    margin-left: auto; font-size: 10px; font-weight: 700;
    background: var(--red-dim); color: var(--red);
    border-radius: 999px; padding: 1px 7px; border: 1px solid rgba(248,113,113,0.3);
  }
  .adm-nav-badge.green { background: var(--green-dim); color: var(--green); border-color: rgba(74,222,128,0.3); }
  .adm-sidebar-footer {
    padding: 16px 12px; border-top: 1px solid var(--ink-border);
  }
  .adm-logout-btn {
    width: 100%; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--text-faint); background: transparent;
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 8px; cursor: pointer; transition: all 0.2s;
  }
  .adm-logout-btn:hover { color: var(--red); border-color: rgba(248,113,113,0.3); }

  /* MAIN */
  .adm-main { margin-left: 220px; flex: 1; min-height: 100vh; }
  .adm-topbar {
    padding: 20px 32px; border-bottom: 1px solid var(--ink-border);
    display: flex; align-items: center; justify-content: space-between;
    background: rgba(8,8,8,0.8); backdrop-filter: blur(10px);
    position: sticky; top: 0; z-index: 5;
  }
  .adm-topbar-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300; color: var(--text-main); }
  .adm-topbar-user { font-size: 11px; color: var(--text-faint); }
  .adm-content { padding: 32px; }

  /* STATS ROW */
  .adm-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 32px; }
  .adm-stat-card {
    background: var(--ink-surface); border: 1px solid var(--ink-border);
    border-radius: 8px; padding: 18px 20px; position: relative; overflow: hidden;
  }
  .adm-stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .adm-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: var(--gold); line-height: 1; margin-bottom: 4px; }
  .adm-stat-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); }
  .adm-stat-sub { font-size: 10px; color: var(--text-faint); margin-top: 4px; }

  /* TABLE */
  .adm-table-wrap { background: var(--ink-surface); border: 1px solid var(--ink-border); border-radius: 8px; overflow: hidden; }
  .adm-table-header {
    padding: 16px 20px; border-bottom: 1px solid var(--ink-border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .adm-table-title { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); opacity: 0.8; }
  .adm-table-count { font-size: 11px; color: var(--text-faint); }
  table { width: 100%; border-collapse: collapse; }
  th { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); padding: 10px 20px; text-align: left; border-bottom: 1px solid var(--ink-border); font-weight: 500; }
  td { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 12px; color: var(--text-dim); vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .adm-cell-name { font-size: 13px; color: var(--text-main); font-weight: 500; margin-bottom: 2px; }
  .adm-cell-sub { font-size: 11px; color: var(--text-faint); }

  /* STATUS BADGES */
  .adm-status { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; }
  .adm-status-pending { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(251,191,36,0.3); }
  .adm-status-approved { background: var(--green-dim); color: var(--green); border: 1px solid rgba(74,222,128,0.3); }
  .adm-status-rejected { background: var(--red-dim); color: var(--red); border: 1px solid rgba(248,113,113,0.3); }
  .adm-status-published { background: var(--green-dim); color: var(--green); border: 1px solid rgba(74,222,128,0.3); }
  .adm-status-draft { background: rgba(255,255,255,0.05); color: var(--text-faint); border: 1px solid var(--ink-border); }

  /* ACTION BUTTONS */
  .adm-actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .adm-btn {
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 4px; cursor: pointer; transition: all 0.2s;
    border: 1px solid; font-weight: 500;
  }
  .adm-btn-approve { color: var(--green); border-color: rgba(74,222,128,0.3); background: var(--green-dim); }
  .adm-btn-approve:hover { background: rgba(74,222,128,0.25); }
  .adm-btn-reject { color: var(--red); border-color: rgba(248,113,113,0.3); background: var(--red-dim); }
  .adm-btn-reject:hover { background: rgba(248,113,113,0.25); }
  .adm-btn-publish { color: var(--blue-bright); border-color: var(--blue-dim); background: rgba(100,149,237,0.1); }
  .adm-btn-publish:hover { background: rgba(100,149,237,0.2); }
  .adm-btn-founding { color: var(--gold); border-color: var(--gold-dim); background: var(--gold-glow); }
  .adm-btn-founding:hover { background: rgba(201,168,76,0.18); }
  .adm-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* EXPAND ROW */
  .adm-expand { background: var(--ink-surface2); padding: 16px 20px; border-top: 1px solid var(--ink-border); }
  .adm-expand-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); opacity: 0.7; margin-bottom: 8px; }
  .adm-expand-text { font-size: 12px; color: var(--text-dim); line-height: 1.7; white-space: pre-wrap; }
  .adm-expand-sample { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 300; color: rgba(232,228,218,0.65); line-height: 1.8; white-space: pre-wrap; }
  .adm-genre-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
  .adm-genre-tag { font-size: 8px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--blue-bright); border: 1px solid var(--blue-dim); background: rgba(100,149,237,0.08); padding: 2px 8px; border-radius: 999px; }

  /* VIEW TOGGLE */
  .adm-view-btn { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-faint); background: transparent; border: none; cursor: pointer; padding: 4px 8px; transition: color 0.2s; }
  .adm-view-btn:hover { color: var(--gold); }

  /* EMPTY */
  .adm-empty { padding: 48px 20px; text-align: center; }
  .adm-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300; color: var(--text-dim); margin-bottom: 8px; }
  .adm-empty-sub { font-size: 12px; color: var(--text-faint); }

  /* LOADING */
  .adm-loading { padding: 48px; text-align: center; font-size: 12px; color: var(--text-faint); letter-spacing: 0.1em; }

  /* LOGIN */
  .adm-login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--ink-bg); }
  .adm-login-card {
    width: 100%; max-width: 420px; background: var(--ink-surface);
    border: 1px solid var(--ink-border-gold); border-radius: 8px; overflow: hidden;
    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
  }
  .adm-login-top { height: 3px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
  .adm-login-body { padding: 40px; }
  .adm-login-eyebrow { font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--gold); opacity: 0.7; display: block; margin-bottom: 12px; }
  .adm-login-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: var(--text-main); margin-bottom: 28px; }
  .adm-login-field { margin-bottom: 16px; }
  .adm-login-label { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-faint); display: block; margin-bottom: 7px; }
  .adm-login-input {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--ink-border);
    border-radius: 5px; padding: 11px 14px; font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-main); outline: none; transition: border-color 0.2s;
  }
  .adm-login-input:focus { border-color: var(--gold-dim); background: rgba(201,168,76,0.03); }
  .adm-login-btn {
    width: 100%; font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; font-weight: 700; color: #000;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    border: none; padding: 13px; border-radius: 5px; cursor: pointer;
    transition: opacity 0.2s; margin-top: 8px;
  }
  .adm-login-btn:hover:not(:disabled) { opacity: 0.88; }
  .adm-login-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .adm-login-error { font-size: 11px; color: var(--red); margin-top: 12px; padding: 9px 12px; background: var(--red-dim); border-radius: 5px; border: 1px solid rgba(248,113,113,0.25); }

  @media (max-width: 900px) {
    .adm-sidebar { display: none; }
    .adm-main { margin-left: 0; }
    .adm-stats { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ── Login Screen ──────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    onLogin();
    setLoading(false);
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="adm-login-wrap">
        <div className="adm-login-card">
          <div className="adm-login-top" />
          <div className="adm-login-body">
            <span className="adm-login-eyebrow">The Tiniest Library</span>
            <div className="adm-login-title">Admin Dashboard</div>
            <div className="adm-login-field">
              <label className="adm-login-label">Email</label>
              <input className="adm-login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="adm-login-field">
              <label className="adm-login-label">Password</label>
              <input className="adm-login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            {error && <div className="adm-login-error">{error}</div>}
            <button className="adm-login-btn" disabled={loading || !email || !password} onClick={handleLogin}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Applications Tab ──────────────────────────────────────────
function ApplicationsTab() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string, email: string, name: string) {
    await supabase.from("applications").update({ status }).eq("id", id);
    if (status === "approved") {
      // Create writer entry
      await supabase.from("writers").upsert({
        name, is_approved: true, is_founding_author: false,
        slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      });
    }
    load();
  }

  const filtered = items.filter(i => filter === "all" ? true : i.status === filter);
  const pendingCount = items.filter(i => i.status === "pending").length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["pending", "approved", "rejected", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
            padding: "6px 14px", borderRadius: 999, cursor: "pointer", transition: "all 0.2s",
            background: filter === f ? "var(--gold-glow)" : "transparent",
            border: filter === f ? "1px solid var(--gold-dim)" : "1px solid var(--ink-border)",
            color: filter === f ? "var(--gold-light)" : "var(--text-faint)",
          }}>
            {f}{f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>
      <div className="adm-table-wrap">
        <div className="adm-table-header">
          <span className="adm-table-title">Applications</span>
          <span className="adm-table-count">{filtered.length} records</span>
        </div>
        {loading ? <div className="adm-loading">Loading…</div> : filtered.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No applications.</div><p className="adm-empty-sub">Check back soon.</p></div>
        ) : (
          <table>
            <thead><tr>
              <th>Applicant</th><th>Genres</th><th>Applied</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(app => (
                <>
                  <tr key={app.id}>
                    <td>
                      <div className="adm-cell-name">{app.full_name}{app.pen_name ? ` (${app.pen_name})` : ""}</div>
                      <div className="adm-cell-sub">{app.email}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(app.genres ?? []).slice(0, 3).map(g => <span key={g} className="adm-genre-tag">{g}</span>)}
                        {(app.genres ?? []).length > 3 && <span className="adm-genre-tag">+{app.genres.length - 3}</span>}
                      </div>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                    <td><span className={`adm-status adm-status-${app.status}`}>{app.status}</span></td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-view-btn" onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                          {expanded === app.id ? "▲ Hide" : "▼ Read"}
                        </button>
                        {app.status === "pending" && (
                          <>
                            <button className="adm-btn adm-btn-approve" onClick={() => updateStatus(app.id, "approved", app.email, app.full_name)}>Approve</button>
                            <button className="adm-btn adm-btn-reject" onClick={() => updateStatus(app.id, "rejected", app.email, app.full_name)}>Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === app.id && (
                    <tr key={`${app.id}-expand`}>
                      <td colSpan={5} style={{ padding: 0 }}>
                        <div className="adm-expand">
                          {app.bio && <><div className="adm-expand-label">Bio</div><div className="adm-expand-text" style={{ marginBottom: 16 }}>{app.bio}</div></>}
                          {app.why_ttl && <><div className="adm-expand-label">Why TTL</div><div className="adm-expand-text" style={{ marginBottom: 16 }}>{app.why_ttl}</div></>}
                          {app.writing_sample && <><div className="adm-expand-label">Writing Sample</div><div className="adm-expand-sample">{app.writing_sample.slice(0, 600)}{app.writing_sample.length > 600 ? "…" : ""}</div></>}
                          {(app.twitter_url || app.instagram_url || app.website_url) && (
                            <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 11, color: "var(--blue-bright)" }}>
                              {app.website_url && <a href={app.website_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>🌐 Website</a>}
                              {app.twitter_url && <a href={app.twitter_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>𝕏 Twitter</a>}
                              {app.instagram_url && <a href={app.instagram_url} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>📷 Instagram</a>}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Stories Tab ───────────────────────────────────────────────
function StoriesTab() {
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("draft");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("stories").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("stories").update({ is_published: !current }).eq("id", id);
    load();
  }

  const filtered = items.filter(i => filter === "all" ? true : filter === "published" ? i.is_published : !i.is_published);
  const draftCount = items.filter(i => !i.is_published).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["draft", "published", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase",
            padding: "6px 14px", borderRadius: 999, cursor: "pointer", transition: "all 0.2s",
            background: filter === f ? "var(--gold-glow)" : "transparent",
            border: filter === f ? "1px solid var(--gold-dim)" : "1px solid var(--ink-border)",
            color: filter === f ? "var(--gold-light)" : "var(--text-faint)",
          }}>
            {f}{f === "draft" && draftCount > 0 ? ` (${draftCount})` : ""}
          </button>
        ))}
      </div>
      <div className="adm-table-wrap">
        <div className="adm-table-header">
          <span className="adm-table-title">Stories</span>
          <span className="adm-table-count">{filtered.length} records</span>
        </div>
        {loading ? <div className="adm-loading">Loading…</div> : filtered.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No stories yet.</div></div>
        ) : (
          <table>
            <thead><tr><th>Title</th><th>Author</th><th>Badge</th><th>Added</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><div className="adm-cell-name">{s.title}</div><div className="adm-cell-sub">{s.slug}</div></td>
                  <td>{s.author_name}</td>
                  <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>{s.badge ?? "—"}</span></td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td><span className={`adm-status ${s.is_published ? "adm-status-published" : "adm-status-draft"}`}>{s.is_published ? "Published" : "Draft"}</span></td>
                  <td>
                    <button className={`adm-btn ${s.is_published ? "adm-btn-reject" : "adm-btn-publish"}`} onClick={() => togglePublish(s.id, s.is_published)}>
                      {s.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Writers Tab ───────────────────────────────────────────────
function WritersTab() {
  const [items, setItems] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("writers").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function toggleApproved(id: string, current: boolean) {
    await supabase.from("writers").update({ is_approved: !current }).eq("id", id);
    load();
  }

  async function toggleFounding(id: string, current: boolean) {
    await supabase.from("writers").update({ is_founding_author: !current }).eq("id", id);
    load();
  }

  return (
    <div className="adm-table-wrap">
      <div className="adm-table-header">
        <span className="adm-table-title">All Writers</span>
        <span className="adm-table-count">{items.length} records</span>
      </div>
      {loading ? <div className="adm-loading">Loading…</div> : items.length === 0 ? (
        <div className="adm-empty"><div className="adm-empty-title">No writers yet.</div></div>
      ) : (
        <table>
          <thead><tr><th>Writer</th><th>Slug</th><th>Genres</th><th>Approved</th><th>Founding</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(w => (
              <tr key={w.id}>
                <td><div className="adm-cell-name">{w.name}</div></td>
                <td><span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "monospace" }}>{w.slug ?? "—"}</span></td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(w.genres ?? []).slice(0, 2).map(g => <span key={g} className="adm-genre-tag">{g}</span>)}
                  </div>
                </td>
                <td><span className={`adm-status ${w.is_approved ? "adm-status-approved" : "adm-status-pending"}`}>{w.is_approved ? "Yes" : "No"}</span></td>
                <td><span className={`adm-status ${w.is_founding_author ? "adm-status-approved" : "adm-status-draft"}`}>{w.is_founding_author ? "Yes" : "No"}</span></td>
                <td>
                  <div className="adm-actions">
                    <button className={`adm-btn ${w.is_approved ? "adm-btn-reject" : "adm-btn-approve"}`} onClick={() => toggleApproved(w.id, w.is_approved)}>
                      {w.is_approved ? "Revoke" : "Approve"}
                    </button>
                    <button className="adm-btn adm-btn-founding" onClick={() => toggleFounding(w.id, w.is_founding_author)}>
                      {w.is_founding_author ? "Remove Founding" : "Make Founding"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Agreements Tab ────────────────────────────────────────────
function AgreementsTab() {
  const [items, setItems] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("agreements").select("*").order("signed_at", { ascending: false })
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="adm-table-wrap">
      <div className="adm-table-header">
        <span className="adm-table-title">Signed Agreements</span>
        <span className="adm-table-count">{items.length} records</span>
      </div>
      {loading ? <div className="adm-loading">Loading…</div> : items.length === 0 ? (
        <div className="adm-empty"><div className="adm-empty-title">No agreements signed yet.</div></div>
      ) : (
        <table>
          <thead><tr><th>Writer</th><th>Email</th><th>Document</th><th>Version</th><th>Signed</th></tr></thead>
          <tbody>
            {items.map(a => (
              <tr key={a.id}>
                <td><div className="adm-cell-name">{a.writer_name}</div></td>
                <td>{a.writer_email ?? "—"}</td>
                <td><span className="adm-status adm-status-approved">{a.document_type}</span></td>
                <td style={{ color: "var(--text-faint)", fontSize: 11 }}>{a.document_version}</td>
                <td>{new Date(a.signed_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ── Ink Overview Tab ──────────────────────────────────────────
function InkTab() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("purchases").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setPurchases(data ?? []); setLoading(false); });
  }, []);

  const totalInk = purchases.reduce((sum, p) => sum + (p.ink_amount ?? 0), 0);

  return (
    <div>
      <div className="adm-stats" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 24 }}>
        <div className="adm-stat-card">
          <div className="adm-stat-num">{totalInk.toLocaleString()}</div>
          <div className="adm-stat-label">Total Ink Sold</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-num">{purchases.length}</div>
          <div className="adm-stat-label">Transactions</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-num">${((totalInk / 100) * 1).toFixed(2)}</div>
          <div className="adm-stat-label">Est. Revenue</div>
          <div className="adm-stat-sub">Based on $1 per 100 Ink</div>
        </div>
      </div>
      <div className="adm-table-wrap">
        <div className="adm-table-header">
          <span className="adm-table-title">Purchase History</span>
          <span className="adm-table-count">{purchases.length} transactions</span>
        </div>
        {loading ? <div className="adm-loading">Loading…</div> : purchases.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No purchases yet.</div><p className="adm-empty-sub">Ink purchases will appear here once Stripe is connected.</p></div>
        ) : (
          <table>
            <thead><tr><th>User</th><th>Ink</th><th>Stripe Session</th><th>Date</th></tr></thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id}>
                  <td>{p.user_id ?? "—"}</td>
                  <td><span style={{ color: "var(--gold)", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>{p.ink_amount}</span></td>
                  <td><span style={{ fontSize: 10, color: "var(--text-faint)", fontFamily: "monospace" }}>{p.stripe_session?.slice(0, 20)}…</span></td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("applications");
  const [counts, setCounts] = useState({ applications: 0, stories: 0, writers: 0, agreements: 0 });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
  }, []);

  useEffect(() => {
    if (!session) return;
    async function loadCounts() {
      const [apps, stories, writers, agreements] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("stories").select("id", { count: "exact" }).eq("is_published", false),
        supabase.from("writers").select("id", { count: "exact" }),
        supabase.from("agreements").select("id", { count: "exact" }),
      ]);
      setCounts({
        applications: apps.count ?? 0,
        stories: stories.count ?? 0,
        writers: writers.count ?? 0,
        agreements: agreements.count ?? 0,
      });
    }
    loadCounts();
  }, [session]);

  if (checking) return <><style>{STYLES}</style><div style={{ minHeight: "100vh", background: "#080808" }} /></>;
  if (!session) return <LoginScreen onLogin={() => supabase.auth.getSession().then(({ data }) => setSession(data.session))} />;

  const NAV = [
    { key: "applications" as Tab, label: "Applications", count: counts.applications, countColor: "" },
    { key: "stories" as Tab, label: "Stories", count: counts.stories, countColor: "" },
    { key: "writers" as Tab, label: "Writers", count: counts.writers, countColor: "green" },
    { key: "agreements" as Tab, label: "Agreements", count: counts.agreements, countColor: "green" },
    { key: "ink" as Tab, label: "Ink & Revenue", count: 0, countColor: "" },
  ];

  const TAB_TITLES: Record<Tab, string> = {
    applications: "Applications",
    stories: "Stories",
    writers: "Writers",
    agreements: "Agreements",
    ink: "Ink & Revenue",
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="adm-root">
        <aside className="adm-sidebar">
          <div className="adm-sidebar-header">
            <div className="adm-sidebar-logo">
              <div className="adm-logo-badge">TTL</div>
              <div>
                <div className="adm-sidebar-title">Admin</div>
              </div>
            </div>
            <div className="adm-sidebar-sub">The Tiniest Library</div>
          </div>
          <nav className="adm-nav">
            {NAV.map(n => (
              <button key={n.key} className={`adm-nav-item${tab === n.key ? " active" : ""}`} onClick={() => setTab(n.key)}>
                {n.label}
                {n.count > 0 && <span className={`adm-nav-badge${n.countColor ? " " + n.countColor : ""}`}>{n.count}</span>}
              </button>
            ))}
          </nav>
          <div className="adm-sidebar-footer">
            <button className="adm-logout-btn" onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <div className="adm-topbar-title">{TAB_TITLES[tab]}</div>
            <div className="adm-topbar-user">{session.user.email}</div>
          </div>
          <div className="adm-content">
            {tab === "applications" && (
              <>
                <div className="adm-stats">
                  <div className="adm-stat-card"><div className="adm-stat-num">{counts.applications}</div><div className="adm-stat-label">Pending Review</div></div>
                  <div className="adm-stat-card"><div className="adm-stat-num">{counts.writers}</div><div className="adm-stat-label">Total Writers</div></div>
                  <div className="adm-stat-card"><div className="adm-stat-num">{counts.agreements}</div><div className="adm-stat-label">Signed Agreements</div></div>
                </div>
                <ApplicationsTab />
              </>
            )}
            {tab === "stories" && <StoriesTab />}
            {tab === "writers" && <WritersTab />}
            {tab === "agreements" && <AgreementsTab />}
            {tab === "ink" && <InkTab />}
          </div>
        </main>
      </div>
    </>
  );
}
