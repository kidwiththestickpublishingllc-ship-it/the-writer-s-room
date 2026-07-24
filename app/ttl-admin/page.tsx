"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// AD MANAGEMENT TAB
// Add this to app/ttl-admin/page.tsx
// =========================

// 1. Add "ads" to the Tab type:
// type Tab = "applications" | "stories" | "writers" | "agreements" | "ink" | "ads";

// 2. Add to NAV array:
// { key: "ads" as Tab, label: "Ads", count: 0, countColor: "" },

// 3. Add to TAB_TITLES:
// ads: "Ad Manager",

// 4. Add to main content area:
// {tab === "ads" && <AdsTab />}

// 5. Paste the AdsTab component below into your admin page file

// =========================
// PASTE THIS COMPONENT INTO app/ttl-admin/page.tsx
// =========================

/*

type Ad = {
  id: string;
  created_at: string;
  headline: string;
  description: string | null;
  image_url: string | null;
  link_url: string;
  cta_text: string;
  advertiser_name: string;
  advertiser_logo_url: string | null;
  ink_reward: number;
  daily_budget: number;
  is_active: boolean;
  view_count: number;
  click_count: number;
};

function AdsTab() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    description: "",
    image_url: "",
    link_url: "",
    cta_text: "Learn More",
    advertiser_name: "",
    advertiser_logo_url: "",
    ink_reward: 5,
    daily_budget: 100,
    is_active: false,
  });

  useEffect(() => { loadAds(); }, []);

  async function loadAds() {
    setLoading(true);
    const { data } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
    setAds(data ?? []);
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("ads").update({ is_active: !current }).eq("id", id);
    loadAds();
  }

  async function deleteAd(id: string) {
    if (!confirm("Delete this ad permanently?")) return;
    await supabase.from("ads").delete().eq("id", id);
    loadAds();
  }

  async function saveAd() {
    setSaving(true);
    await supabase.from("ads").insert({
      ...form,
      ink_reward: Number(form.ink_reward),
      daily_budget: Number(form.daily_budget),
    });
    setForm({ headline: "", description: "", image_url: "", link_url: "", cta_text: "Learn More", advertiser_name: "", advertiser_logo_url: "", ink_reward: 5, daily_budget: 100, is_active: false });
    setShowForm(false);
    setSaving(false);
    loadAds();
  }

  const totalViews = ads.reduce((s, a) => s + (a.view_count ?? 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (a.click_count ?? 0), 0);
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <div className="adm-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        <div className="adm-stat-card"><div className="adm-stat-num">{ads.length}</div><div className="adm-stat-label">Total Ads</div></div>
        <div className="adm-stat-card"><div className="adm-stat-num">{ads.filter(a => a.is_active).length}</div><div className="adm-stat-label">Active</div></div>
        <div className="adm-stat-card"><div className="adm-stat-num">{totalViews.toLocaleString()}</div><div className="adm-stat-label">Total Views</div></div>
        <div className="adm-stat-card"><div className="adm-stat-num">{ctr}%</div><div className="adm-stat-label">Click Rate</div></div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="adm-btn adm-btn-approve" style={{ fontSize: 10, padding: "8px 20px" }} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Ad"}
        </button>
      </div>

      {showForm && (
        <div className="adm-table-wrap" style={{ marginBottom: 20, padding: 24 }}>
          <div className="adm-table-title" style={{ marginBottom: 20 }}>New Advertisement</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Headline *</div>
              <input style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} placeholder="Ad headline" />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Advertiser Name *</div>
              <input style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.advertiser_name} onChange={e => setForm(f => ({ ...f, advertiser_name: e.target.value }))} placeholder="Company or brand name" />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Link URL *</div>
              <input style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="https://advertiser.com" />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>CTA Button Text</div>
              <input style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="Learn More" />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Image URL</div>
              <input style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Advertiser Logo URL</div>
              <input style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.advertiser_logo_url} onChange={e => setForm(f => ({ ...f, advertiser_logo_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Description</div>
              <textarea style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit", resize: "vertical", minHeight: 80 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description of the ad..." />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Ink Reward Per View</div>
              <input type="number" style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.ink_reward} onChange={e => setForm(f => ({ ...f, ink_reward: Number(e.target.value) }))} min={1} max={50} />
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 6 }}>Daily View Budget</div>
              <input type="number" style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 5, padding: "9px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} value={form.daily_budget} onChange={e => setForm(f => ({ ...f, daily_budget: Number(e.target.value) }))} min={1} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-dim)", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              Activate immediately
            </label>
            <button className="adm-btn adm-btn-approve" style={{ marginLeft: "auto" }} disabled={saving || !form.headline || !form.advertiser_name || !form.link_url} onClick={saveAd}>
              {saving ? "Saving…" : "Save Ad"}
            </button>
          </div>
        </div>
      )}

      <div className="adm-table-wrap">
        <div className="adm-table-header">
          <span className="adm-table-title">All Ads</span>
          <span className="adm-table-count">{ads.length} ads</span>
        </div>
        {loading ? <div className="adm-loading">Loading…</div> : ads.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No ads yet.</div><p className="adm-empty-sub">Create your first ad above.</p></div>
        ) : (
          <table>
            <thead><tr><th>Ad</th><th>Advertiser</th><th>Ink Reward</th><th>Views</th><th>Clicks</th><th>CTR</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {ads.map(ad => {
                const adCtr = ad.view_count > 0 ? ((ad.click_count / ad.view_count) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={ad.id}>
                    <td>
                      <div className="adm-cell-name">{ad.headline}</div>
                      <div className="adm-cell-sub">{ad.link_url.slice(0, 30)}…</div>
                    </td>
                    <td>{ad.advertiser_name}</td>
                    <td><span style={{ color: "var(--gold)", fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>{ad.ink_reward}</span></td>
                    <td>{ad.view_count.toLocaleString()}</td>
                    <td>{ad.click_count.toLocaleString()}</td>
                    <td style={{ color: Number(adCtr) > 2 ? "var(--green)" : "var(--text-faint)" }}>{adCtr}%</td>
                    <td><span className={`adm-status ${ad.is_active ? "adm-status-approved" : "adm-status-draft"}`}>{ad.is_active ? "Active" : "Paused"}</span></td>
                    <td>
                      <div className="adm-actions">
                        <button className={`adm-btn ${ad.is_active ? "adm-btn-reject" : "adm-btn-approve"}`} onClick={() => toggleActive(ad.id, ad.is_active)}>
                          {ad.is_active ? "Pause" : "Activate"}
                        </button>
                        <button className="adm-btn adm-btn-reject" onClick={() => deleteAd(ad.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

*/

// =========================
// Route: app/admin/page.tsx
// TTL Admin Dashboard — /admin
// Protected by Supabase auth
// =========================

type Tab = "applications" | "stories" | "writers" | "agreements" | "ink" | "media" | "payouts" | "members" | "world" | "comics";

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
  email: string | null;
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
  author_email?: string;
  description: string | null;
  badge: string | null;
  is_published: boolean;
  status?: string;
  genre?: string;
  room?: string;
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

type ComicSubmission = {
  id: string;
  series_id: string;
  creator_id: string;
  creator_name: string | null;
  series_title: string | null;
  is_adult: boolean;
  submission_status: string;
  submitted_at: string;
  rejection_reason: string | null;
  comic_series?: {
    slug: string;
    title: string;
    type: string;
    genre: string;
    publish_status: string;
    creator_name: string | null;
  } | null;
};

function ComicsTab() {
  const [items, setItems] = useState<ComicSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("comic_submissions")
      .select("*, comic_series(slug, title, type, genre, publish_status, creator_name)")
      .order("submitted_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  async function approve(sub: ComicSubmission) {
    // 1. Flip the series to published
    const { error: pubErr } = await supabase
      .from("comic_series")
      .update({ publish_status: "published" })
      .eq("id", sub.series_id);
    if (pubErr) { alert(`Publish failed: ${pubErr.message}`); return; }

    // 2. Mark submission approved
    await supabase
      .from("comic_submissions")
      .update({ submission_status: "approved", reviewed_at: new Date().toISOString() })
      .eq("id", sub.id);

    // 3. Admin confirmation email (mirrors story-approved admin-message pattern)
    await fetch("/api/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin-message",
        to: "kidwiththestickpublishingllc@gmail.com",
        name: "TTL Admin",
        data: { message: `✅ Comic "${sub.series_title}" approved and published to The Galleria.` }
      }),
    });

    alert(`✅ "${sub.series_title}" is now live on The Galleria.`);
    load();
  }

  async function reject(sub: ComicSubmission) {
    await supabase
      .from("comic_series")
      .update({ publish_status: "rejected" })
      .eq("id", sub.series_id);
    await supabase
      .from("comic_submissions")
      .update({ submission_status: "rejected", reviewed_at: new Date().toISOString(), rejection_reason: rejectNote || null })
      .eq("id", sub.id);
    setRejectId(null); setRejectNote("");
    load();
  }

  const filtered = items.filter(i => filter === "all" ? true : i.submission_status === filter);
  const pendingCount = items.filter(i => i.submission_status === "pending").length;

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
          <span className="adm-table-title">Comic Submissions</span>
          <span className="adm-table-count">{filtered.length} records</span>
        </div>
        {loading ? <div className="adm-loading">Loading…</div> : filtered.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No comic submissions.</div></div>
        ) : (
          <table>
            <thead><tr><th>Series</th><th>Creator</th><th>Type</th><th>Genre</th><th>Wing</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(sub => {
                const s = sub.comic_series;
                return (
                  <tr key={sub.id}>
                    <td>
                      <div className="adm-cell-name">{sub.series_title ?? s?.title ?? "Untitled"}</div>
                      <div className="adm-cell-sub">{s?.slug ?? "—"}</div>
                    </td>
                    <td>{sub.creator_name ?? s?.creator_name ?? "—"}</td>
                    <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>{s?.type ?? "—"}</span></td>
                    <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>{s?.genre ?? "—"}</span></td>
                    <td><span style={{ fontSize: 10, color: sub.is_adult ? "#c84444" : "var(--blue-bright)" }}>{sub.is_adult ? "18+ Veil" : "Galleria"}</span></td>
                    <td>{new Date(sub.submitted_at).toLocaleDateString()}</td>
                    <td><span className={`adm-status ${sub.submission_status === "approved" ? "adm-status-approved" : sub.submission_status === "rejected" ? "adm-status-rejected" : "adm-status-pending"}`}>{sub.submission_status}</span></td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {sub.submission_status === "pending" && (
                        <>
                          <button className="adm-btn adm-btn-approve" onClick={() => approve(sub)}>Approve</button>
                          {rejectId !== sub.id && <button className="adm-btn adm-btn-reject" onClick={() => setRejectId(sub.id)}>Reject</button>}
                        </>
                      )}
                      {rejectId === sub.id && (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Reason (optional)" style={{ fontSize: 11, padding: "4px 8px", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 4, color: "var(--text-main)", width: 160 }} />
                          <button className="adm-btn adm-btn-reject" onClick={() => reject(sub)}>Confirm</button>
                          <button className="adm-btn" onClick={() => setRejectId(null)}>Cancel</button>
                        </div>
                      )}
                      {s?.slug && (
                        <a href={`https://artists.the-tiniest-library.com/galleria/comics/${s.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn">Preview →</a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

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
      // Create Supabase auth account via invite
      await fetch("/api/invite-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      await supabase.from("writers").upsert({
        name, email, is_approved: true, is_founding_author: false,
        slug: name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        tagline: "A writer at The Tiniest Library.",
        bio: "This author is setting up their profile. Check back soon.",
        genres: [],
      }, { onConflict: "email" }); // Bridge profile — author fills in the rest
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "application-approved", to: email, name }),
    });
    // Phase 2 — Welcome + rules + ink guide
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "writer-onboarding-phase-2",
        to: email,
        name,
      }),
    });
    } else if (status === "rejected") {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "application-rejected", to: email, name }),
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
  const [filter, setFilter] = useState<"all" | "pending" | "published" | "draft">("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase.from("stories").select("*, writers(email, name)").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  async function approveStory(id: string, authorEmail: string, title: string, slug?: string) {
    const { error: publishError } = await supabase.from("stories").update({ is_published: true }).eq("id", id);
    if (publishError) { alert(`❌ Publish failed: ${publishError.message}`); return; }

    // Email 1 — story approved (to writer)
    const r1 = await fetch("/api/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "story-approved", to: authorEmail, data: { title } }),
    });

    // Email 2 — social share nudge (to writer)
    const { data: writer } = await supabase
      .from('writers')
      .select('name')
      .eq('email', authorEmail)
      .single();

    const r2 = await fetch("/api/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "story-live-share",
        to: authorEmail,
        name: writer?.name ?? authorEmail,
        data: { title, slug: slug ?? '' }
      }),
    });

    // Email 3 — admin confirmation
    const r3 = await fetch("/api/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "admin-message",
        to: "kidwiththestickpublishingllc@gmail.com",
        name: "TTL Admin",
        data: { message: `✅ "${title}" has been published. Author: ${authorEmail}. Emails fired: approved=${r1.ok}, share=${r2.ok}.` }
      }),
    });

    const allOk = r1.ok && r2.ok && r3.ok;
    alert(allOk
      ? `✅ "${title}" published! Emails sent to writer and admin.`
      : `⚠️ Published but some emails may have failed. approved=${r1.ok}, share=${r2.ok}, admin=${r3.ok}`
    );
    load();
  }
  async function rejectStory(id: string, authorEmail: string, title: string) {
    await supabase.from("stories").update({ is_published: false, status: "rejected" }).eq("id", id);
    await fetch("/api/email", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "story-rejected", to: authorEmail, data: { title, note: rejectNote } }),
    });
    setRejectId(null); setRejectNote(""); load();
  }
  async function togglePublish(id: string, current: boolean) {
    await supabase.from("stories").update({ is_published: !current }).eq("id", id);
    load();
  }
  const filtered = items.filter(i =>
    filter === "all" ? true :
    filter === "published" ? i.is_published :
    filter === "pending" ? !i.is_published && i.status !== "rejected" :
    !i.is_published
  );
  const pendingCount = items.filter(i => !i.is_published && i.status !== "rejected").length;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["pending", "published", "all"] as const).map(f => (
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
          <span className="adm-table-title">Stories</span>
          <span className="adm-table-count">{filtered.length} records</span>
        </div>
        {loading ? <div className="adm-loading">Loading…</div> : filtered.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No stories yet.</div></div>
        ) : (
          <table>
            <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>Room</th><th>Added</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><div className="adm-cell-name">{s.title}</div><div className="adm-cell-sub">{s.slug}</div></td>
                  <td>{s.author_name}</td>
                  <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>{s.genre ?? "—"}</span></td>
                  <td><span style={{ fontSize: 10, color: s.room === "red-room" ? "#c84444" : "var(--blue-bright)" }}>{s.room ?? "reading-room"}</span></td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td><span className={`adm-status ${s.is_published ? "adm-status-approved" : "adm-status-pending"}`}>{s.is_published ? "Published" : "Pending"}</span></td>
                  <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {!s.is_published && (
                      <button className="adm-btn adm-btn-approve" onClick={() => approveStory(s.id, (s as any).writers?.email ?? "", s.title, s.slug)}>Publish</button>
                    )}
                                                            
                    {s.is_published && (
                      <button className="adm-btn adm-btn-reject" onClick={() => togglePublish(s.id, true)}>Unpublish</button>
                    )}
                    {!s.is_published && rejectId !== s.id && (
                      <button className="adm-btn adm-btn-reject" onClick={() => setRejectId(s.id)}>Reject</button>
                    )}
                    {rejectId === s.id && (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Reason (optional)" style={{ fontSize: 11, padding: "4px 8px", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 4, color: "var(--text-main)", width: 160 }} />
                        <button className="adm-btn adm-btn-reject" onClick={() => rejectStory(s.id, (s as any).writers?.email ?? "", s.title)}>Confirm</button>
                        <button className="adm-btn" onClick={() => setRejectId(null)}>Cancel</button>
                      </div>
                    )}
                    <a href={`https://read.the-tiniest-library.com/reading-room/stories/${s.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn">Preview →</a>
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

// ── Media Review Tab ──────────────────────────────────────────
function MediaReviewTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");
  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("story_media")
      .select("*, writers(name, email)")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }
  async function approveMedia(id: string) {
    await supabase.from("story_media").update({ is_approved: true }).eq("id", id);
    load();
  }
  async function rejectMedia(id: string) {
    await supabase.from("story_media").delete().eq("id", id);
    load();
  }
  const filtered = items.filter(i =>
    filter === "all" ? true :
    filter === "approved" ? i.is_approved :
    !i.is_approved
  );
  const pendingCount = items.filter(i => !i.is_approved).length;
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["pending", "approved", "all"] as const).map(f => (
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {loading ? <div className="adm-loading">Loading…</div> : filtered.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No media to review.</div></div>
        ) : filtered.map(item => (
          <div key={item.id} style={{ background: "var(--ink-surface)", border: "1px solid var(--ink-border)", borderRadius: 10, overflow: "hidden" }}>
            <img src={item.url} alt={item.title} style={{ width: "100%", height: 180, objectFit: "cover" }} />
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 10, color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{item.media_type?.replace("_", " ")}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>by {item.writers?.name ?? "Unknown"}</div>
              {item.caption && <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>{item.caption}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {!item.is_approved && (
                  <button className="adm-btn adm-btn-approve" onClick={() => approveMedia(item.id)}>Approve</button>
                )}
                <button className="adm-btn adm-btn-reject" onClick={() => rejectMedia(item.id)}>Remove</button>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="adm-btn">View →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// UPGRADED WritersTab — drop-in replacement for WritersTab()
// in app/ttl-admin/page.tsx
//
// CHANGES:
// - Pipeline status column (Approved → Email Sent → Profile Complete → Active)
// - Inline admin notes (click pencil to edit, saves to Supabase)
// - Timestamps: onboarding_email_sent_at, profile_completed_at
// - Onboarding button now stamps onboarding_email_sent_at in Supabase
// ============================================================

function WritersTab() {
  const [items, setItems] = useState<Writer[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("writers")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  // Send onboarding email AND stamp the timestamp
  async function resendOnboarding(writer: Writer) {
    const email = writer.email ?? prompt(`Email address for ${writer.name}?`);
    if (!email) return;
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "writer-onboarding-phase-2",
        to: email,
        name: writer.name,
      }),
    });
    // Stamp the timestamp so admin knows email was sent
    await supabase
      .from("writers")
      .update({ onboarding_email_sent_at: new Date().toISOString() })
      .eq("id", writer.id);
    alert(`Onboarding email sent to ${email}!`);
    load();
  }

  async function sendReminder(writer: Writer) {
    if (!writer.email) { alert("No email on file for this writer."); return; }
    setReminding(writer.id);
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "writer-reminder", to: writer.email, name: writer.name }),
    });
    setReminding(null);
    alert(`Reminder sent to ${writer.name}!`);
  }

  async function toggleApproved(id: string, current: boolean) {
    await supabase.from("writers").update({ is_approved: !current }).eq("id", id);
    load();
  }

  async function toggleFounding(id: string, current: boolean) {
    await supabase.from("writers").update({ is_founding_author: !current }).eq("id", id);
    load();
  }
  async function deleteWriter(id: string, name: string) {
    if (!window.confirm(`Delete "${name}"? This permanently removes their profile, all their stories, and chapters. This cannot be undone.`)) return;
    try {
      const { data: writerRow } = await supabase.from("writers").select("email, user_id").eq("id", id).single();
      const authorId = (writerRow as any)?.user_id ?? id;
      const { data: stories } = await supabase.from("stories").select("id").or(`author_id.eq.${id},author_id.eq.${authorId}`);
      const storyIds = (stories ?? []).map((s: any) => s.id);
      let chapterCount = 0;
      if (storyIds.length > 0) {
        const { data: chs } = await supabase.from("chapters").select("id").in("story_id", storyIds);
        chapterCount = (chs ?? []).length;
        await supabase.from("chapters").delete().in("story_id", storyIds);
        await supabase.from("stories").delete().in("id", storyIds);
      }
      const { error } = await supabase.from("writers").delete().eq("id", id);
      if (error) throw error;
      await fetch("/api/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin-message",
          to: "kidwiththestickpublishingllc@gmail.com",
          name: "TTL Admin",
          data: { message: `🗑️ Writer deleted: "${name}" (${(writerRow as any)?.email ?? "no email"}). Removed ${storyIds.length} story(ies) and ${chapterCount} chapter(s).` }
        }),
      });
      alert(`"${name}" deleted — ${storyIds.length} stories, ${chapterCount} chapters removed.`);
      load();
    } catch (e: any) {
      alert(`Delete failed: ${e.message ?? "unknown error"}`);
    }
  }

  async function saveNote(id: string) {
    setSavingNote(true);
    await supabase.from("writers").update({ admin_notes: noteValue }).eq("id", id);
    setSavingNote(false);
    setEditingNote(null);
    setNoteValue("");
    load();
  }

  // Pipeline: what stage is this writer at?
 function pipelineStatus(w: any) {
    const hasProfile = w.bio && w.photo_url && w.genres?.length > 0;
    const emailSent = !!w.onboarding_email_sent_at;

    // Founding authors are active once approved — known, vetted members.
    if (w.is_approved && w.is_founding_author) {
      return { label: "✅ Active", color: "var(--green)", bg: "var(--green-dim)", border: "rgba(74,222,128,0.3)" };
    }
    if (!w.is_approved) {
      return { label: "Not Approved", color: "var(--text-faint)", bg: "rgba(255,255,255,0.05)", border: "var(--ink-border)" };
    }
    if (w.is_approved && !emailSent) {
      return { label: "⚡ Needs Email", color: "var(--amber)", bg: "var(--amber-dim)", border: "rgba(251,191,36,0.3)" };
    }
    if (emailSent && !hasProfile) {
      return { label: "⏳ Awaiting Profile", color: "#84b0f5", bg: "rgba(100,149,237,0.1)", border: "rgba(100,149,237,0.3)" };
    }
    if (hasProfile) {
      return { label: "✅ Active", color: "var(--green)", bg: "var(--green-dim)", border: "rgba(74,222,128,0.3)" };
    }
    return { label: "Unknown", color: "var(--text-faint)", bg: "transparent", border: "var(--ink-border)" };
  }

  function profileStatus(w: Writer) {
    const fields = [w.bio, w.photo_url, w.genres?.length];
    const filled = fields.filter(Boolean).length;
    if (filled === 3) return { label: "Complete", cls: "adm-status-approved" };
    if (filled > 0) return { label: "Partial", cls: "adm-status-pending" };
    return { label: "Empty", cls: "adm-status-rejected" };
  }

  function fmtDate(ts: string | null | undefined) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Count pipeline stages for the summary row
  const needsEmail = items.filter(w => w.is_approved && !(w as any).onboarding_email_sent_at).length;
  const awaitingProfile = items.filter(w => {
    const hasProfile = w.bio && w.photo_url && w.genres?.length;
    return w.is_approved && (w as any).onboarding_email_sent_at && !hasProfile;
  }).length;
  const active = items.filter(w => w.bio && w.photo_url && w.genres?.length).length;

  return (
    <div>
      {/* Pipeline summary strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12, marginBottom: 24,
      }}>
        {[
          { label: "Total Writers", val: items.length, color: "var(--gold)" },
          { label: "Needs Onboarding Email", val: needsEmail, color: "var(--amber)" },
          { label: "Awaiting Profile", val: awaitingProfile, color: "#84b0f5" },
          { label: "Fully Active", val: active, color: "var(--green)" },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-num" style={{ color: s.color, fontSize: 28 }}>{s.val}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-table-wrap">
        <div className="adm-table-header">
          <span className="adm-table-title">All Writers</span>
          <span className="adm-table-count">{items.length} records</span>
        </div>
        {loading ? (
          <div className="adm-loading">Loading…</div>
        ) : items.length === 0 ? (
          <div className="adm-empty"><div className="adm-empty-title">No writers yet.</div></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Writer</th>
                <th>Pipeline</th>
                <th>Profile</th>
                <th>Email Sent</th>
                <th>Approved</th>
                <th>Founding</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(w => {
                const ps = profileStatus(w);
                const pipe = pipelineStatus(w);
                const isEditingThisNote = editingNote === w.id;

                return (
                  <tr key={w.id}>
                    {/* Writer name + slug */}
                    <td>
                      <div className="adm-cell-name">{w.name}</div>
                      <div className="adm-cell-sub">{w.slug ?? "—"}</div>
                      <div className="adm-cell-sub" style={{ fontSize: 10 }}>{w.email ?? "no email"}</div>
                    </td>

                    {/* Pipeline status */}
                    <td>
                      <span style={{
                        fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                        padding: "3px 10px", borderRadius: 999,
                        color: pipe.color, background: pipe.bg,
                        border: `1px solid ${pipe.border}`,
                        whiteSpace: "nowrap",
                      }}>
                        {pipe.label}
                      </span>
                    </td>

                    {/* Profile completeness */}
                    <td>
                      <span className={`adm-status ${ps.cls}`}>{ps.label}</span>
                    </td>

                    {/* Onboarding email sent timestamp */}
                    <td>
                      <span style={{ fontSize: 11, color: (w as any).onboarding_email_sent_at ? "var(--green)" : "var(--text-faint)" }}>
                        {fmtDate((w as any).onboarding_email_sent_at)}
                      </span>
                    </td>

                    {/* Approved */}
                    <td>
                      <span className={`adm-status ${w.is_approved ? "adm-status-approved" : "adm-status-pending"}`}>
                        {w.is_approved ? "Yes" : "No"}
                      </span>
                    </td>

                    {/* Founding */}
                    <td>
                      <span className={`adm-status ${w.is_founding_author ? "adm-status-approved" : "adm-status-draft"}`}>
                        {w.is_founding_author ? "Yes" : "No"}
                      </span>
                    </td>

                    {/* Admin notes — inline edit */}
                    <td style={{ minWidth: 180 }}>
                      {isEditingThisNote ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <textarea
                            value={noteValue}
                            onChange={e => setNoteValue(e.target.value)}
                            rows={3}
                            style={{
                              width: "100%", background: "var(--ink-surface2)",
                              border: "1px solid var(--gold-dim)", borderRadius: 5,
                              padding: "6px 8px", fontSize: 11, color: "var(--text-main)",
                              outline: "none", fontFamily: "inherit", resize: "none",
                            }}
                            placeholder="Admin note…"
                            autoFocus
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="adm-btn adm-btn-approve"
                              style={{ fontSize: 9 }}
                              disabled={savingNote}
                              onClick={() => saveNote(w.id)}
                            >
                              {savingNote ? "Saving…" : "Save"}
                            </button>
                            <button
                              className="adm-btn"
                              style={{ fontSize: 9 }}
                              onClick={() => { setEditingNote(null); setNoteValue(""); }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => { setEditingNote(w.id); setNoteValue((w as any).admin_notes ?? ""); }}
                          style={{
                            fontSize: 11, color: (w as any).admin_notes ? "var(--text-dim)" : "var(--text-faint)",
                            cursor: "pointer", lineHeight: 1.5,
                            padding: "4px 6px", borderRadius: 4,
                            border: "1px dashed transparent",
                            transition: "all 0.15s",
                          }}
                          title="Click to add/edit note"
                          onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--gold-dim)")}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}
                        >
                          {(w as any).admin_notes
                            ? (w as any).admin_notes.slice(0, 60) + ((w as any).admin_notes.length > 60 ? "…" : "")
                            : "✏️ Add note"}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="adm-actions" style={{ flexDirection: "column", alignItems: "flex-start", gap: 5 }}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <button
                            className={`adm-btn ${w.is_approved ? "adm-btn-reject" : "adm-btn-approve"}`}
                            onClick={() => toggleApproved(w.id, w.is_approved)}
                          >
                            {w.is_approved ? "Revoke" : "Approve"}
                          </button>
                          <button
                            className="adm-btn adm-btn-founding"
                            onClick={() => toggleFounding(w.id, w.is_founding_author)}
                          >
                            {w.is_founding_author ? "↓ Founding" : "↑ Founding"}
                          </button>
                          <button
                            className="adm-btn"
                            style={{
                              color: (w as any).tier === 'tier1' ? '#a78bfa' : 'var(--text-dim)',
                              borderColor: (w as any).tier === 'tier1' ? 'rgba(167,139,250,0.4)' : 'var(--ink-border)',
                              background: (w as any).tier === 'tier1' ? 'rgba(167,139,250,0.1)' : 'transparent',
                              fontWeight: (w as any).tier === 'tier1' ? 700 : 400,
                            }}
                            onClick={async () => {
                              const newTier = (w as any).tier === 'tier1' ? 'tier2' : 'tier1';
                              await supabase.from('writers').update({
                                tier: newTier,
                                publisher_label: newTier === 'tier1' ? 'Kid With The Stick Publishing LLC' : null
                              }).eq('id', w.id);
                              load();
                            }}
                          >
                            {(w as any).tier === 'tier1' ? '🏢 Kid Signed' : '↑ Sign to Kid'}
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          <button
                            className="adm-btn adm-btn-publish"
                            onClick={() => resendOnboarding(w)}
                          >
                            📧 Onboarding
                          </button>
                          <button
                            className="adm-btn"
                            style={{ color: "var(--amber)", borderColor: "rgba(251,191,36,0.3)", background: "var(--amber-dim)" }}
                            disabled={reminding === w.id}
                            onClick={() => sendReminder(w)}
                          >
                            {reminding === w.id ? "Sending…" : "🔔 Remind"}
                          </button>
                          <button
                            className="adm-btn adm-btn-reject"
                            onClick={async () => {
                              if (!window.confirm(`Delete "${w.name}"? This permanently removes their profile, all their stories, and chapters. This cannot be undone.`)) return;
                              const res = await fetch("/api/delete-writer", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: w.id, name: w.name }),
                              });
                              const result = await res.json();
                              if (!res.ok) { alert(`Delete failed: ${result.error}`); return; }
                              alert(`"${w.name}" deleted — ${result.stories} stories, ${result.chapters} chapters removed.`);
                              load();
                            }}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      {w.slug && (
                          <div style={{ display: "flex", gap: 5 }}>
                            <a href={`https://read.the-tiniest-library.com/reading-room/authors/${w.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn" style={{ fontSize: 9 }}>👁 Profile →</a>
                            <a href={`https://write.the-tiniest-library.com/ttl-admin?tab=stories&writer=${w.slug}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-approve" style={{ fontSize: 9 }}>📖 Stories →</a>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
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

// ── Payout Admin Tab ──────────────────────────────────────────
function PayoutAdminTab() {
  const [owed, setOwed] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [method, setMethod] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<Record<string, string>>({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const { data: writers } = await supabase.from("writers").select("id, name, email, tier");
      const { data: earnings } = await supabase.from("writer_earnings").select("writer_id, writer_usd, payout_id");
      const unpaid: Record<string, { count: number; sum: number }> = {};
      (earnings ?? []).forEach((e: any) => {
        if (e.payout_id) return;
        if (!unpaid[e.writer_id]) unpaid[e.writer_id] = { count: 0, sum: 0 };
        unpaid[e.writer_id].count += 1;
        unpaid[e.writer_id].sum += Number(e.writer_usd);
      });
      const owedList = (writers ?? []).map((w: any) => ({
        id: w.id, name: w.name, email: w.email, tier: w.tier,
        unpaid_unlocks: unpaid[w.id]?.count ?? 0,
        unpaid_owed: unpaid[w.id]?.sum ?? 0,
      })).filter((w: any) => w.unpaid_owed > 0).sort((a: any, b: any) => b.unpaid_owed - a.unpaid_owed);
      setOwed(owedList);
      const { data: payouts } = await supabase.from("payouts").select("*").order("created_at", { ascending: false });
      const nameMap: Record<string, string> = {};
      (writers ?? []).forEach((w: any) => { nameMap[w.id] = w.name; });
      setHistory((payouts ?? []).map((p: any) => ({ ...p, writer_name: nameMap[p.writer_id] ?? "Unknown" })));
      const { data: payoutReqs } = await supabase
        .from("payout_requests")
        .select("*")
        .eq("status", "pending")
        .order("requested_at", { ascending: false });
      setRequests(payoutReqs ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

async function markProcessed(id: string) {
    const ref = reference[id] ?? '';
    const req = requests.find(r => r.id === id);
    if (!req) return;

    await supabase
      .from("payout_requests")
      .update({ 
        status: "completed", 
        processed_at: new Date().toISOString(),
        notes: ref,
      })
      .eq("id", id);

    // Send receipt email to writer
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payout-processed",
          to: req.payout_email,
          name: req.payout_email,
          data: {
            amount: `$${Number(req.amount).toFixed(2)}`,
            method: req.payout_method,
            handle: req.payout_email,
            reference: ref,
          }
        }),
      });
} catch (err) { console.error("Payout email failed:", err); }

    // Admin receipt
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "admin-message",
          to: "kidwiththestickpublishingllc@gmail.com",
          name: "Daniel",
          data: {
            subject: `Payout sent — $${Number(req.amount).toFixed(2)} via ${req.payout_method}`,
            message: `Payout of $${Number(req.amount).toFixed(2)} marked as processed.\n\nSent to: ${req.payout_email}\nMethod: ${req.payout_method}\nReference: ${ref}\nDate: ${new Date().toLocaleDateString()}`,
          }
        }),
      });
    } catch (err) { console.error("Admin receipt email failed:", err); }

    setRequests(prev => prev.filter(r => r.id !== id));
  }

  async function markPaid(w: any) {
    const m = method[w.id] || "Manual";
    const ref = reference[w.id] || "";
    if (!window.confirm("Pay " + w.name + " $" + w.unpaid_owed.toFixed(2) + " via " + m + "? This stamps " + w.unpaid_unlocks + " earning(s) as paid and cannot be undone here.")) return;
    setProcessing(w.id);
    try {
      const { data, error } = await supabase.rpc("pay_writer", { p_writer_id: w.id, p_method: m, p_reference: ref });
      if (error) throw error;
      if (data && (data as any).ok === false) { alert((data as any).error ?? "Payout failed"); return; }
      // Send receipt email to writer
      try {
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "payout-processed",
            to: w.email,
            name: w.name,
            data: {
              amount: `$${w.unpaid_owed.toFixed(2)}`,
              method: m,
              handle: ref,
              reference: ref,
            }
          }),
        });
        // Admin receipt
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "admin-message",
            to: "kidwiththestickpublishingllc@gmail.com",
            name: "Daniel",
            data: {
              subject: `Payout sent — $${w.unpaid_owed.toFixed(2)} to ${w.name} via ${m}`,
              message: `Payout of $${w.unpaid_owed.toFixed(2)} marked as processed.\n\nWriter: ${w.name}\nEmail: ${w.email}\nMethod: ${m}\nReference: ${ref}\nDate: ${new Date().toLocaleDateString()}`,
            }
          }),
        });
      } catch (emailErr) { console.error("Receipt email failed:", emailErr); }
      await loadAll();
    } catch (err) { console.error(err); alert("Payout failed. Check console."); }
    finally { setProcessing(null); }
  }

async function payViaPayPal(w: any) {
    if (!window.confirm(`Send $${w.unpaid_owed.toFixed(2)} to ${w.email} via PayPal? This cannot be undone.`)) return;
    setProcessing(w.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { alert("Not signed in"); return; }
      const res = await fetch("/api/paypal/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: session.access_token, writer_id: w.id }),
      });
      const data = await res.json();
      if (!res.ok) { alert("PayPal payout failed: " + data.error); return; }
      alert(`✓ $${w.unpaid_owed.toFixed(2)} sent via PayPal! Batch ID: ${data.batch_id}`);
      await loadAll();
    } catch (err) { console.error(err); alert("PayPal payout failed."); }
    finally { setProcessing(null); }
  }
 
  const totalOwed = owed.reduce((s: number, w: any) => s + w.unpaid_owed, 0);
  const totalPaid = history.reduce((s: number, p: any) => s + Number(p.amount_usd), 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Owed Right Now", val: "$" + totalOwed.toFixed(2), color: "var(--gold-light)" },
          { label: "Total Paid Out", val: "$" + totalPaid.toFixed(2), color: "var(--green)" },
          { label: "Writers Awaiting", val: String(owed.length), color: "var(--text)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>
      {/* PENDING PAYOUT REQUESTS */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ color: "var(--text)", fontSize: 16, marginBottom: 14 }}>
          Pending Payout Requests ({requests.length})
        </h3>
        {requests.length === 0 && (
          <p style={{ color: "var(--text-dim)", fontSize: 13 }}>No pending requests.</p>
        )}
        {requests.map((r: any) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", marginBottom: 8, background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
                ${Number(r.amount).toFixed(2)} via {r.payout_method}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                {r.payout_email} · {new Date(r.requested_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <input
                placeholder="Reference / Txn ID (required)"
                value={reference[r.id] ?? ''}
                onChange={e => setReference(prev => ({ ...prev, [r.id]: e.target.value }))}
                style={{ fontSize: 11, padding: "5px 10px", background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, color: "var(--text)",
                  width: 220 }}
              />
              <button
                onClick={() => markProcessed(r.id)}
                disabled={!reference[r.id]?.trim()}
                style={{ fontSize: 11, fontWeight: 700, padding: "6px 14px",
                  background: reference[r.id]?.trim() ? "rgba(0,200,100,0.1)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${reference[r.id]?.trim() ? "rgba(0,200,100,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: reference[r.id]?.trim() ? "#00c864" : "var(--text-dim)",
                  borderRadius: 6, cursor: reference[r.id]?.trim() ? "pointer" : "not-allowed" }}>
                Mark Processed ✓
              </button>
            </div>
          </div>
        ))}
      </div>
      <h3 style={{ color: "var(--text)", fontSize: 16, marginBottom: 14 }}>Awaiting Payout</h3>
      {loading ? (
        <p style={{ color: "var(--text-dim)", textAlign: "center", padding: 40 }}>Loading...</p>
      ) : owed.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "var(--ink2)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
          <p style={{ color: "var(--text-dim)" }}>Everyone's paid up. No outstanding balances.</p>
        </div>
      ) : owed.map((w: any) => (
        <div key={w.id} style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, color: "var(--text)" }}>{w.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{w.email ?? "-"} ({w.tier === "tier1" ? "80% tier" : "70% tier"}, {w.unpaid_unlocks} unlock(s))</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold-light)" }}>{"$" + w.unpaid_owed.toFixed(2)}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input placeholder="Method (PayPal, Wise, Bank...)" value={method[w.id] ?? ""} onChange={e => setMethod({ ...method, [w.id]: e.target.value })} style={{ flex: "1 1 150px", padding: "8px 12px", background: "var(--ink3)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }} />
            <input placeholder="Reference / txn ID" value={reference[w.id] ?? ""} onChange={e => setReference({ ...reference, [w.id]: e.target.value })} style={{ flex: "1 1 150px", padding: "8px 12px", background: "var(--ink3)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", fontSize: 13, outline: "none" }} />
            <button onClick={() => markPaid(w)} disabled={processing === w.id} style={{ padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{processing === w.id ? "Processing..." : "Mark $" + w.unpaid_owed.toFixed(2) + " Paid"}</button>
            <button onClick={() => payViaPayPal(w)} disabled={processing === w.id} style={{ padding: "8px 16px", background: "#003087", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{processing === w.id ? "Processing..." : "PayPal $" + w.unpaid_owed.toFixed(2)}</button>
          </div>
        </div>
      ))}
      <h3 style={{ color: "var(--text)", fontSize: 16, margin: "32px 0 14px" }}>Payout History</h3>
      {history.length === 0 ? (
        <p style={{ color: "var(--text-dim)", fontSize: 13 }}>No payouts yet.</p>
      ) : (
        <div style={{ background: "var(--ink2)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {history.map((p: any) => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <div><span style={{ color: "var(--text)", fontWeight: 600 }}>{p.writer_name}</span><span style={{ color: "var(--text-dim)", marginLeft: 12 }}>{p.stripe_transfer_id ?? ""}</span></div>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <span style={{ color: "var(--text-dim)" }}>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : ""}</span>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>{"$" + Number(p.amount_usd).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function MembersTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [inkAmount, setInkAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setItems(data ?? []); setLoading(false); });
  }, []);
  async function sendInk() {
    if (!selected || !inkAmount) return;
    setSaving(true);
    const amt = parseInt(inkAmount);
    await supabase.from("profiles").update({ ink_balance: (selected.ink_balance ?? 0) + amt }).eq("id", selected.id);
    setItems(prev => prev.map(m => m.id === selected.id ? { ...m, ink_balance: (m.ink_balance ?? 0) + amt } : m));
    setSelected((p: any) => ({ ...p, ink_balance: (p.ink_balance ?? 0) + amt }));
    setInkAmount(""); setSaving(false);
  }
  async function deleteMember() {
    if (!selected) return;
    if (!window.confirm(`Permanently delete "${selected.full_name ?? selected.email}"? This removes their profile AND their login account. This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/delete-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, email: selected.email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Delete failed");
      setItems(prev => prev.filter(m => m.id !== selected.id));
      setSelected(null);
      alert("Member fully deleted — profile and login removed.");
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    }
    setSaving(false);
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 340px" : "1fr", gap: 20 }}>
      <div className="adm-table-wrap">
        <div className="adm-table-header"><span className="adm-table-title">All Members</span><span className="adm-table-count">{items.length} members</span></div>
        {loading ? <div className="adm-loading">Loading…</div> : items.length === 0 ? <div className="adm-empty"><div className="adm-empty-title">No members yet.</div></div> : (
          <table><thead><tr><th>Member</th><th>Tier</th><th>Ink</th><th>Joined</th><th></th></tr></thead>
          <tbody>{items.map(m => (
            <tr key={m.id}>
              <td><div className="adm-cell-name">{m.full_name ?? "Anonymous"}</div><div className="adm-cell-sub">{m.email}</div></td>
              <td><span className={`adm-status ${m.membership_tier === "pro" ? "adm-status-approved" : "adm-status-draft"}`}>{m.membership_tier ?? "free"}</span></td>
              <td style={{ color: "var(--gold)" }}>{m.ink_balance ?? 0}</td>
              <td>{new Date(m.created_at).toLocaleDateString()}</td>
              <td><button className="adm-btn adm-btn-approve" onClick={() => setSelected(m)}>Manage</button></td>
            </tr>
          ))}</tbody></table>
        )}
      </div>
      {selected && (
        <div style={{ background: "var(--ink-surface)", border: "1px solid var(--ink-border-gold)", borderRadius: 10, padding: 24, position: "sticky", top: 80 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 18, color: "var(--text-main)" }}>{selected.full_name ?? "Anonymous"}</div>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "var(--text-faint)", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>{selected.email}</div>
          <div style={{ padding: "8px 0", borderBottom: "1px solid var(--ink-border)", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "var(--text-faint)" }}>Ink Balance: </span>
            <span style={{ color: "var(--gold)" }}>{selected.ink_balance ?? 0}</span>
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Send Free Ink</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input type="number" value={inkAmount} onChange={e => setInkAmount(e.target.value)} placeholder="Amount" style={{ flex: 1, background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit" }} />
            <button className="adm-btn adm-btn-approve" disabled={saving || !inkAmount} onClick={sendInk}>Send</button>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {[100, 250, 500].map(amt => <button key={amt} onClick={() => setInkAmount(String(amt))} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 999, cursor: "pointer", background: "transparent", border: "1px solid var(--ink-border)", color: "var(--text-faint)" }}>+{amt}</button>)}
          </div>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8 }}>Send Message</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Write a message..." rows={4} style={{ width: "100%", background: "var(--ink-surface2)", border: "1px solid var(--ink-border)", borderRadius: 6, padding: "10px 12px", fontSize: 13, color: "var(--text-main)", outline: "none", fontFamily: "inherit", resize: "vertical" as const, boxSizing: "border-box" as const }} />
          <button className="adm-btn adm-btn-approve" disabled={saving || !msg.trim()} style={{ marginTop: 8, width: "100%", justifyContent: "center" }} onClick={async () => { setSaving(true); await fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "admin-message", to: selected.email, name: selected.full_name, data: { message: msg } }) }); setMsg(""); setSaving(false); }}>{saving ? "Sending…" : "Send Message"}</button>
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(248,113,113,0.2)" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#f87171", marginBottom: 8 }}>Danger Zone</div>
            <button
              onClick={deleteMember}
              disabled={saving}
              style={{ width: "100%", padding: "10px", borderRadius: 6, border: "1px solid rgba(248,113,113,0.4)", background: "rgba(248,113,113,0.1)", color: "#f87171", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}
            >
              {saving ? "Deleting…" : "🗑 Delete Member Permanently"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── World Content Tab ─────────────────────────────────────────
function WorldContentTab() {
  const [glossary, setGlossary] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"glossary" | "characters" | "locations">("glossary");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [g, c, l] = await Promise.all([
      supabase.from("glossary").select("*, stories(title, author_name)").order("created_at", { ascending: false }),
      supabase.from("characters").select("*, stories(title, author_name)").order("created_at", { ascending: false }),
      supabase.from("story_locations").select("*, stories(title, author_name)").order("created_at", { ascending: false }),
    ]);
    setGlossary(g.data ?? []);
    setCharacters(c.data ?? []);
    setLocations(l.data ?? []);
    setLoading(false);
  }

  async function approve(table: string, id: string) {
    await supabase.from(table).update({ is_approved: true }).eq("id", id);
    
    // Get writer email and story title to notify
    const item = [...glossary, ...characters, ...locations].find(i => i.id === id);
    if (item?.stories?.author_name) {
      // Get writer email
      const { data: writer } = await supabase
        .from('writers')
        .select('email, name')
        .eq('name', item.stories.author_name)
        .single();
      
      if (writer?.email) {
        const contentType = table === 'glossary' ? 'glossary term' 
          : table === 'characters' ? 'character card' 
          : 'map location';
        await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'world-content-approved',
            to: writer.email,
            name: writer.name,
            data: {
              story_title: item.stories.title,
              content_type: contentType,
              items_approved: `1 ${contentType} approved`
            }
          })
        });
      }
    }
    load();
  }

  async function reject(table: string, id: string) {
    await supabase.from(table).delete().eq("id", id);
    load();
  }

  const pendingG = glossary.filter(i => !i.is_approved);
  const pendingC = characters.filter(i => !i.is_approved);
  const pendingL = locations.filter(i => !i.is_approved);
  const totalPending = pendingG.length + pendingC.length + pendingL.length;

  const btnStyle = (s: string) => ({
    fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase" as const,
    padding: "6px 14px", borderRadius: 999, cursor: "pointer", transition: "all 0.2s",
    background: section === s ? "var(--gold-glow)" : "transparent",
    border: section === s ? "1px solid var(--gold-dim)" : "1px solid var(--ink-border)",
    color: section === s ? "var(--gold-light)" : "var(--text-faint)",
  });

  return (
    <div>
      {/* Summary strip */}
      <div className="adm-stats" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        <div className="adm-stat-card"><div className="adm-stat-num" style={{ color: totalPending > 0 ? "var(--amber)" : "var(--green)" }}>{totalPending}</div><div className="adm-stat-label">Pending Review</div></div>
        <div className="adm-stat-card"><div className="adm-stat-num">{pendingG.length}</div><div className="adm-stat-label">Glossary Terms</div></div>
        <div className="adm-stat-card"><div className="adm-stat-num">{pendingC.length}</div><div className="adm-stat-label">Characters</div></div>
        <div className="adm-stat-card"><div className="adm-stat-num">{pendingL.length}</div><div className="adm-stat-label">Locations</div></div>
      </div>

      {/* Section filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={btnStyle("glossary")} onClick={() => setSection("glossary")}>
          📖 Glossary {pendingG.length > 0 && `(${pendingG.length})`}
        </button>
        <button style={btnStyle("characters")} onClick={() => setSection("characters")}>
          👤 Characters {pendingC.length > 0 && `(${pendingC.length})`}
        </button>
        <button style={btnStyle("locations")} onClick={() => setSection("locations")}>
          🗺️ Locations {pendingL.length > 0 && `(${pendingL.length})`}
        </button>
      </div>

      {loading ? <div className="adm-loading">Loading…</div> : (
        <>
          {/* GLOSSARY */}
          {section === "glossary" && (
            <div className="adm-table-wrap">
              <div className="adm-table-header">
                <span className="adm-table-title">Glossary Terms</span>
                <span className="adm-table-count">{glossary.length} total · {pendingG.length} pending</span>
              </div>
              {glossary.length === 0 ? (
                <div className="adm-empty"><div className="adm-empty-title">No glossary terms yet.</div></div>
              ) : (
                <table>
                  <thead><tr><th>Term</th><th>Definition</th><th>Story</th><th>Author</th><th>Chapter</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {glossary.map(item => (
                      <tr key={item.id}>
                        <td><div className="adm-cell-name" style={{ color: "var(--gold-light)" }}>{item.term}</div></td>
                        <td style={{ maxWidth: 300 }}><div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{item.definition?.slice(0, 120)}{item.definition?.length > 120 ? "…" : ""}</div></td>
                        <td><div className="adm-cell-sub">{item.stories?.title ?? "—"}</div></td>
                        <td><div className="adm-cell-sub">{item.stories?.author_name ?? "—"}</div></td>
                        <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>Ch. {item.chapter_first_appears}</span></td>
                        <td><span className={`adm-status ${item.is_approved ? "adm-status-approved" : "adm-status-pending"}`}>{item.is_approved ? "Approved" : "Pending"}</span></td>
                        <td>
                          <div className="adm-actions">
                            {!item.is_approved && <button className="adm-btn adm-btn-approve" onClick={() => approve("glossary", item.id)}>Approve</button>}
                            <button className="adm-btn adm-btn-reject" onClick={() => reject("glossary", item.id)}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* CHARACTERS */}
          {section === "characters" && (
            <div className="adm-table-wrap">
              <div className="adm-table-header">
                <span className="adm-table-title">Characters</span>
                <span className="adm-table-count">{characters.length} total · {pendingC.length} pending</span>
              </div>
              {characters.length === 0 ? (
                <div className="adm-empty"><div className="adm-empty-title">No characters yet.</div></div>
              ) : (
                <table>
                  <thead><tr><th>Character</th><th>Backstory</th><th>Story</th><th>Author</th><th>Chapter</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {characters.map(char => (
                      <tr key={char.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {char.image_url && <img src={char.image_url} alt={char.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />}
                            <div className="adm-cell-name" style={{ color: "#84b0f5" }}>{char.name}</div>
                          </div>
                        </td>
                        <td style={{ maxWidth: 280 }}><div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{char.backstory?.slice(0, 100)}{char.backstory?.length > 100 ? "…" : ""}</div></td>
                        <td><div className="adm-cell-sub">{char.stories?.title ?? "—"}</div></td>
                        <td><div className="adm-cell-sub">{char.stories?.author_name ?? "—"}</div></td>
                        <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>Ch. {char.chapter_introduced}</span></td>
                        <td><span className={`adm-status ${char.is_approved ? "adm-status-approved" : "adm-status-pending"}`}>{char.is_approved ? "Approved" : "Pending"}</span></td>
                        <td>
                          <div className="adm-actions">
                            {!char.is_approved && <button className="adm-btn adm-btn-approve" onClick={() => approve("characters", char.id)}>Approve</button>}
                            <button className="adm-btn adm-btn-reject" onClick={() => reject("characters", char.id)}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* LOCATIONS */}
          {section === "locations" && (
            <div className="adm-table-wrap">
              <div className="adm-table-header">
                <span className="adm-table-title">Map Locations</span>
                <span className="adm-table-count">{locations.length} total · {pendingL.length} pending</span>
              </div>
              {locations.length === 0 ? (
                <div className="adm-empty"><div className="adm-empty-title">No locations yet.</div></div>
              ) : (
                <table>
                  <thead><tr><th>Location</th><th>Description</th><th>Story</th><th>Author</th><th>Type</th><th>Unlocks</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {locations.map(loc => (
                      <tr key={loc.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: loc.accent_color, flexShrink: 0 }} />
                            <div className="adm-cell-name">{loc.name}</div>
                          </div>
                        </td>
                        <td style={{ maxWidth: 240 }}><div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.5 }}>{loc.description?.slice(0, 80)}{loc.description?.length > 80 ? "…" : ""}</div></td>
                        <td><div className="adm-cell-sub">{loc.stories?.title ?? "—"}</div></td>
                        <td><div className="adm-cell-sub">{loc.stories?.author_name ?? "—"}</div></td>
                        <td><span style={{ fontSize: 9, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{loc.location_type}</span></td>
                        <td><span style={{ fontSize: 10, color: "var(--text-faint)" }}>Ch. {loc.chapter_unlocks_at}</span></td>
                        <td><span className={`adm-status ${loc.is_approved ? "adm-status-approved" : "adm-status-pending"}`}>{loc.is_approved ? "Approved" : "Pending"}</span></td>
                        <td>
                          <div className="adm-actions">
                            {!loc.is_approved && <button className="adm-btn adm-btn-approve" onClick={() => approve("story_locations", loc.id)}>Approve</button>}
                            <button className="adm-btn adm-btn-reject" onClick={() => reject("story_locations", loc.id)}>Remove</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("applications");
  const [counts, setCounts] = useState({ applications: 0, stories: 0, writers: 0, agreements: 0, media: 0, members: 0, world: 0, comics: 0 });

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
      const [apps, stories, writers, agreements, media, members, glossary, characters, locations, comics] = await Promise.all([
        supabase.from("applications").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("stories").select("id", { count: "exact" }).eq("is_published", false),
        supabase.from("writers").select("id", { count: "exact" }),
        supabase.from("agreements").select("id", { count: "exact" }),
        supabase.from("story_media").select("id", { count: "exact" }).eq("is_approved", false),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("glossary").select("id", { count: "exact" }).eq("is_approved", false),
        supabase.from("characters").select("id", { count: "exact" }).eq("is_approved", false),
        supabase.from("story_locations").select("id", { count: "exact" }).eq("is_approved", false),
        supabase.from("comic_submissions").select("id", { count: "exact" }).eq("submission_status", "pending"),
      ]);
      setCounts({
        applications: apps.count ?? 0,
        stories: stories.count ?? 0,
        writers: writers.count ?? 0,
        agreements: agreements.count ?? 0,
        media: media.count ?? 0,
        members: members.count ?? 0,
        world: (glossary.count ?? 0) + (characters.count ?? 0) + (locations.count ?? 0),
        comics: comics.count ?? 0,
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
    { key: "media" as Tab, label: "Media Review", count: counts.media, countColor: "green" },
    { key: "world" as Tab, label: "World Content", count: counts.world, countColor: "green" },
    { key: "payouts" as Tab, label: "Payouts", count: 0, countColor: "" },
    { key: "members" as Tab, label: "Members", count: counts.members, countColor: "green" },
    { key: "comics" as Tab, label: "Comics", count: counts.comics, countColor: "" },
  ];
  const TAB_TITLES: Record<Tab, string> = {
    applications: "Applications",
    stories: "Stories",
    writers: "Writers",
    agreements: "Agreements",
    ink: "Ink & Revenue",
    media: "Media Review",
    world: "World Content",
    payouts: "Payout Requests",
    members: "Members",
    comics: "Comic Submissions",
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
            {tab === "media" && <MediaReviewTab />}
            {tab === "payouts" && <PayoutAdminTab />}
            {tab === "members" && <MembersTab />}
            {tab === "agreements" && <AgreementsTab />}
            {tab === "ink" && <InkTab />}
            {tab === "world" && <WorldContentTab />}
            {tab === "comics" && <ComicsTab />}
          </div>
        </main>
      </div>
    </>
  );
}
