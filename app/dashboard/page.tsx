"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =========================
// Route: app/dashboard/page.tsx
// The Writer's Room — Full Writer HQ
// =========================

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #C9A84C;
    --gold-light: #E2C97E;
    --gold-dim: rgba(201,168,76,0.3);
    --gold-glow: rgba(201,168,76,0.08);
    --quill: #9b6dff;
    --quill-dim: rgba(155,109,255,0.2);
    --ink: #0a0a0f;
    --ink2: #111118;
    --ink3: #18181f;
    --ink4: #22222c;
    --border: rgba(255,255,255,0.06);
    --border-gold: rgba(201,168,76,0.18);
    --text: #f0ece2;
    --text-muted: rgba(240,236,226,0.5);
    --text-dim: rgba(240,236,226,0.25);
    --green: #4ade80;
    --green-dim: rgba(74,222,128,0.15);
    --red: #f87171;
    --red-dim: rgba(248,113,113,0.12);
    --font-display: 'Cormorant Garamond', serif;
    --font-ui: 'Syne', sans-serif;
  }

  body { background: var(--ink); color: var(--text); font-family: var(--font-ui); }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

  .fade-up { animation: fadeUp 0.5s ease forwards; }

  /* ── LAYOUT ── */
  .hq-root { min-height:100vh; display:flex; flex-direction:column; }

  /* ── TOP NAV ── */
  .hq-nav {
    position:sticky; top:0; z-index:40;
    background:rgba(10,10,15,0.97);
    backdrop-filter:blur(20px);
    border-bottom:1px solid var(--border-gold);
  }
  .hq-nav-line { height:2px; background:linear-gradient(90deg,transparent,var(--gold),var(--quill),var(--gold),transparent); }
  .hq-nav-inner {
    max-width:1400px; margin:0 auto; padding:0 40px; height:64px;
    display:flex; align-items:center; justify-content:space-between; gap:24px;
  }
  .hq-nav-brand { display:flex; align-items:center; gap:12px; text-decoration:none; }
  .hq-nav-logo {
    width:34px; height:34px; border-radius:8px;
    background:linear-gradient(135deg,var(--gold),#7a5510);
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; color:#000;
  }
  .hq-nav-title { font-family:var(--font-display); font-size:17px; font-weight:400; color:var(--gold-light); }
  .hq-nav-sub { font-size:9px; color:var(--text-dim); letter-spacing:0.14em; text-transform:uppercase; }
  .hq-nav-right { display:flex; align-items:center; gap:10px; }
  .hq-nav-writer {
    font-size:12px; color:var(--text-muted);
    padding:6px 14px; border-radius:999px;
    border:1px solid var(--border); background:var(--ink2);
  }
  .hq-nav-logout {
    font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
    color:var(--text-dim); border:1px solid var(--border);
    background:transparent; padding:6px 14px; border-radius:6px;
    cursor:pointer; transition:all 0.2s;
  }
  .hq-nav-logout:hover { color:var(--red); border-color:var(--red-dim); }

  /* ── SIDEBAR + MAIN ── */
  .hq-body { display:flex; flex:1; max-width:1400px; margin:0 auto; width:100%; }

  .hq-sidebar {
    width:220px; flex-shrink:0;
    border-right:1px solid var(--border);
    padding:32px 0;
    position:sticky; top:64px; height:calc(100vh - 64px); overflow-y:auto;
  }

  .hq-nav-section {
    font-size:9px; letter-spacing:0.24em; text-transform:uppercase;
    color:var(--text-dim); padding:0 24px; margin-bottom:8px; margin-top:24px;
  }
  .hq-nav-section:first-child { margin-top:0; }

  .hq-nav-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 24px; cursor:pointer; border:none;
    background:transparent; width:100%; text-align:left;
    font-family:var(--font-ui); font-size:13px; color:var(--text-muted);
    transition:all 0.15s; border-left:2px solid transparent;
  }
  .hq-nav-item:hover { color:var(--text); background:var(--ink2); }
  .hq-nav-item.active {
    color:var(--gold-light); background:var(--gold-glow);
    border-left-color:var(--gold);
  }
  .hq-nav-icon { font-size:15px; width:18px; text-align:center; flex-shrink:0; }

  /* ── CONTENT ── */
  .hq-content { flex:1; padding:40px; min-width:0; }

  /* ── PAGE HEADER ── */
  .hq-page-header { margin-bottom:36px; }
  .hq-page-eyebrow {
    font-size:9px; letter-spacing:0.3em; text-transform:uppercase;
    color:var(--gold); opacity:0.75; display:block; margin-bottom:8px;
  }
  .hq-page-title {
    font-family:var(--font-display); font-size:38px; font-weight:300;
    color:var(--text); line-height:1; margin-bottom:6px;
  }
  .hq-page-sub { font-size:13px; color:var(--text-muted); }

  /* ── STAT CARDS ── */
  .hq-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:36px; }
  .hq-stat {
    background:var(--ink2); border:1px solid var(--border);
    border-radius:12px; padding:24px; position:relative; overflow:hidden;
    transition:border-color 0.2s;
  }
  .hq-stat:hover { border-color:var(--border-gold); }
  .hq-stat::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
    opacity:0;  transition:opacity 0.2s;
  }
  .hq-stat:hover::before { opacity:1; }
  .hq-stat-label {
    font-size:9px; letter-spacing:0.2em; text-transform:uppercase;
    color:var(--text-dim); margin-bottom:12px; display:block;
  }
  .hq-stat-value {
    font-family:var(--font-display); font-size:36px; font-weight:300;
    color:var(--gold-light); line-height:1; margin-bottom:4px;
  }
  .hq-stat-sub { font-size:11px; color:var(--text-dim); }

  /* ── SECTION ── */
  .hq-section { margin-bottom:40px; }
  .hq-section-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:20px;
  }
  .hq-section-title {
    font-family:var(--font-display); font-size:24px; font-weight:300; color:var(--text);
  }

  /* ── TABLE ── */
  .hq-table-wrap { border:1px solid var(--border); border-radius:12px; overflow:hidden; }
  .hq-table { width:100%; border-collapse:collapse; }
  .hq-table th {
    font-size:9px; letter-spacing:0.2em; text-transform:uppercase;
    color:var(--text-dim); padding:14px 20px; text-align:left;
    background:var(--ink2); border-bottom:1px solid var(--border);
    font-weight:500;
  }
  .hq-table td {
    padding:14px 20px; font-size:13px; color:var(--text-muted);
    border-bottom:1px solid var(--border); transition:background 0.15s;
  }
  .hq-table tr:last-child td { border-bottom:none; }
  .hq-table tr:hover td { background:var(--ink2); }
  .hq-table td.primary { color:var(--text); font-weight:500; }
  .hq-table td.gold { color:var(--gold-light); font-family:var(--font-display); font-size:15px; }
  .hq-table td.green { color:var(--green); }
  .hq-table td.dim { color:var(--text-dim); font-size:12px; }

  /* ── BADGE ── */
  .badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:9px; letter-spacing:0.12em; text-transform:uppercase;
    padding:3px 10px; border-radius:999px;
  }
  .badge-free { color:var(--green); border:1px solid rgba(74,222,128,0.3); background:var(--green-dim); }
  .badge-locked { color:var(--text-dim); border:1px solid var(--border); background:transparent; }
  .badge-pending { color:#fbbf24; border:1px solid rgba(251,191,36,0.3); background:rgba(251,191,36,0.08); }
  .badge-paid { color:var(--green); border:1px solid rgba(74,222,128,0.3); background:var(--green-dim); }

  /* ── CHAPTER EDITOR ── */
  .editor-grid { display:grid; grid-template-columns:280px 1fr; gap:20px; align-items:start; }
  .chapter-list-panel {
    border:1px solid var(--border); border-radius:12px; overflow:hidden;
    position:sticky; top:104px;
  }
  .chapter-list-header {
    padding:14px 20px; background:var(--ink2);
    border-bottom:1px solid var(--border);
    font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim);
  }
  .chapter-list-item {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 20px; cursor:pointer; border:none;
    background:transparent; width:100%; text-align:left;
    font-family:var(--font-ui); font-size:12px; color:var(--text-muted);
    border-bottom:1px solid var(--border); transition:all 0.15s;
  }
  .chapter-list-item:last-child { border-bottom:none; }
  .chapter-list-item:hover { background:var(--ink2); color:var(--text); }
  .chapter-list-item.active { background:var(--gold-glow); color:var(--gold-light); }
  .chapter-num { font-size:10px; color:var(--text-dim); min-width:20px; }

  .editor-panel {
    border:1px solid var(--border); border-radius:12px; overflow:hidden;
  }
  .editor-header {
    padding:20px 24px; background:var(--ink2);
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
  }
  .editor-chapter-title {
    font-family:var(--font-display); font-size:18px; font-weight:300; color:var(--text);
  }
  .editor-body { padding:24px; }
  .editor-field { margin-bottom:20px; }
  .editor-label {
    font-size:9px; letter-spacing:0.2em; text-transform:uppercase;
    color:var(--text-dim); display:block; margin-bottom:8px;
  }
  .editor-input {
    width:100%; background:var(--ink3); border:1px solid var(--border);
    border-radius:8px; padding:12px 16px;
    font-family:var(--font-ui); font-size:13px; color:var(--text);
    outline:none; transition:border-color 0.2s;
  }
  .editor-input:focus { border-color:var(--gold-dim); }
  .editor-textarea {
    width:100%; background:var(--ink3); border:1px solid var(--border);
    border-radius:8px; padding:16px;
    font-family:'Lora', Georgia, serif; font-size:15px; color:rgba(240,236,226,0.8);
    outline:none; resize:vertical; line-height:1.85; min-height:400px;
    transition:border-color 0.2s;
  }
  .editor-textarea:focus { border-color:var(--gold-dim); }
  .editor-footer {
    padding:16px 24px; border-top:1px solid var(--border);
    display:flex; align-items:center; justify-content:space-between;
    background:var(--ink2);
  }
  .editor-char-count { font-size:11px; color:var(--text-dim); }

  /* ── PAYOUT ── */
  .payout-grid { display:grid; grid-template-columns:1fr 360px; gap:24px; align-items:start; }
  .payout-card {
    background:var(--ink2); border:1px solid var(--border-gold);
    border-radius:16px; padding:32px; position:relative; overflow:hidden;
  }
  .payout-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }
  .payout-balance {
    font-family:var(--font-display); font-size:56px; font-weight:300;
    color:var(--gold-light); line-height:1; margin-bottom:4px;
  }
  .payout-balance-label { font-size:11px; color:var(--text-dim); letter-spacing:0.12em; text-transform:uppercase; margin-bottom:28px; }
  .payout-method-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
  .payout-method-btn {
    padding:14px; border-radius:8px; cursor:pointer;
    border:1px solid var(--border); background:var(--ink3);
    font-family:var(--font-ui); font-size:12px; color:var(--text-muted);
    transition:all 0.2s; text-align:center;
  }
  .payout-method-btn:hover { border-color:var(--gold-dim); color:var(--gold-light); }
  .payout-method-btn.selected { border-color:var(--gold); color:var(--gold-light); background:var(--gold-glow); }
  .payout-input {
    width:100%; background:var(--ink3); border:1px solid var(--border);
    border-radius:8px; padding:12px 16px;
    font-family:var(--font-ui); font-size:13px; color:var(--text);
    outline:none; transition:border-color 0.2s; margin-bottom:16px;
  }
  .payout-input:focus { border-color:var(--gold-dim); }
  .payout-info-card {
    background:var(--ink3); border:1px solid var(--border);
    border-radius:12px; padding:24px;
  }
  .payout-info-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:10px 0; border-bottom:1px solid var(--border);
    font-size:13px;
  }
  .payout-info-row:last-child { border-bottom:none; }
  .payout-info-label { color:var(--text-dim); }
  .payout-info-val { color:var(--text); font-weight:500; }

  /* ── BUTTONS ── */
  .btn-primary {
    font-family:var(--font-ui); font-size:11px; font-weight:600;
    letter-spacing:0.16em; text-transform:uppercase;
    padding:12px 28px; border-radius:8px; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--gold),#8a6510); color:#000;
    transition:opacity 0.2s; display:inline-flex; align-items:center; gap:8px;
  }
  .btn-primary:hover:not(:disabled) { opacity:0.85; }
  .btn-primary:disabled { opacity:0.35; cursor:not-allowed; }
  .btn-ghost {
    font-family:var(--font-ui); font-size:11px; font-weight:500;
    letter-spacing:0.14em; text-transform:uppercase;
    padding:12px 24px; border-radius:8px;
    border:1px solid var(--border-gold); background:transparent;
    color:var(--gold); cursor:pointer; transition:all 0.2s;
    display:inline-flex; align-items:center; gap:8px;
  }
  .btn-ghost:hover { background:var(--gold-glow); }
  .btn-danger {
    font-family:var(--font-ui); font-size:11px;
    letter-spacing:0.14em; text-transform:uppercase;
    padding:12px 24px; border-radius:8px;
    border:1px solid var(--red-dim); background:transparent;
    color:var(--red); cursor:pointer; transition:all 0.2s;
  }

  /* ── EMPTY STATE ── */
  .empty-state {
    text-align:center; padding:64px 32px;
    border:1px dashed var(--border); border-radius:12px;
  }
  .empty-icon { font-size:40px; display:block; margin-bottom:16px; }
  .empty-title { font-family:var(--font-display); font-size:24px; font-weight:300; color:var(--text); margin-bottom:8px; }
  .empty-sub { font-size:13px; color:var(--text-muted); line-height:1.7; }

  /* ── LOADING ── */
  .spinner { width:28px; height:28px; border:2px solid var(--border); border-top-color:var(--gold); border-radius:50%; animation:spin 0.8s linear infinite; }
  .loading-wrap { display:flex; align-items:center; justify-content:center; flex-direction:column; gap:14px; min-height:300px; }
  .loading-text { font-size:13px; color:var(--text-muted); letter-spacing:0.1em; }

  /* ── TOAST ── */
  .toast {
    position:fixed; bottom:32px; right:32px; z-index:100;
    padding:14px 24px; border-radius:10px;
    font-family:var(--font-ui); font-size:13px; font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,0.6);
    animation:fadeUp 0.3s ease;
  }
  .toast-success { background:#1a2e1a; border:1px solid rgba(74,222,128,0.4); color:var(--green); }
  .toast-error { background:#2e1a1a; border:1px solid rgba(248,113,113,0.4); color:var(--red); }

  /* ── DIVIDER ── */
  .hq-divider { height:1px; background:linear-gradient(to right,var(--gold-dim),transparent); margin:32px 0; }

  @media (max-width:1100px) {
    .hq-stats { grid-template-columns:repeat(2,1fr); }
    .editor-grid { grid-template-columns:1fr; }
    .payout-grid { grid-template-columns:1fr; }
  }
  @media (max-width:768px) {
    .hq-sidebar { display:none; }
    .hq-nav-inner { padding:0 20px; }
    .hq-content { padding:24px 20px; }
    .hq-stats { grid-template-columns:1fr 1fr; }
  }
`;

// =========================
// Types
// =========================
type Tab = 'overview' | 'chapters' | 'earnings' | 'payout' | 'profile';

type Story = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
};

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  content: string | null;
  is_free: boolean;
  ink_cost: number;
};

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

type Writer = {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
};

// =========================
// Toast
// =========================
function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast toast-${type}`}>{type === 'success' ? '✓ ' : '✕ '}{msg}</div>;
}

// =========================
// Main Dashboard
// =========================
export default function WriterDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [writer, setWriter] = useState<Writer | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutHandle, setPayoutHandle] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Profile edit state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editWebsite, setEditWebsite] = useState('');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  };

  // Load all data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { window.location.href = '/login'; return; }

        // Get writer profile
        const { data: writerData } = await supabase
          .from('writers')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!writerData) {
          // Check if writer exists by auth user id
          window.location.href = '/apply';
          return;
        }

        setWriter(writerData);
        setEditName(writerData.name ?? '');
        setEditBio(writerData.bio ?? '');
        setEditTwitter(writerData.twitter_url ?? '');
        setEditInstagram(writerData.instagram_url ?? '');
        setEditWebsite(writerData.website_url ?? '');

        // Get stories by this writer
        const { data: storiesData } = await supabase
          .from('stories')
          .select('*')
          .eq('author_id', writerData.id)
          .order('created_at', { ascending: false });

        if (storiesData && storiesData.length > 0) {
          setStories(storiesData);

          // Get chapters for first story
          const { data: chaptersData } = await supabase
            .from('chapters')
            .select('*')
            .eq('story_id', storiesData[0].id)
            .order('chapter_number');

          if (chaptersData) {
            setChapters(chaptersData);
            if (chaptersData.length > 0) {
              setSelectedChapter(chaptersData[0]);
              setEditTitle(chaptersData[0].title);
              setEditContent(chaptersData[0].content ?? '');
            }
          }
        }

        // Get earnings
        const { data: earningsData } = await supabase
          .from('writer_earnings')
          .select('*')
          .eq('writer_id', writerData.id)
          .order('created_at', { ascending: false });

        if (earningsData) setEarnings(earningsData);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Select chapter for editing
  const selectChapter = (ch: Chapter) => {
    setSelectedChapter(ch);
    setEditTitle(ch.title);
    setEditContent(ch.content ?? '');
  };

  // Save chapter
  const saveChapter = async () => {
    if (!selectedChapter) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('chapters')
        .update({ title: editTitle, content: editContent })
        .eq('id', selectedChapter.id);

      if (error) throw error;

      setChapters(prev => prev.map(c =>
        c.id === selectedChapter.id
          ? { ...c, title: editTitle, content: editContent }
          : c
      ));
      setSelectedChapter(prev => prev ? { ...prev, title: editTitle, content: editContent } : null);
      showToast('Chapter saved successfully!');
    } catch {
      showToast('Failed to save chapter.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save profile
  const saveProfile = async () => {
    if (!writer) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('writers')
        .update({
          name: editName,
          bio: editBio,
          twitter_url: editTwitter || null,
          instagram_url: editInstagram || null,
          website_url: editWebsite || null,
        })
        .eq('id', writer.id);

      if (error) throw error;
      setWriter(prev => prev ? { ...prev, name: editName, bio: editBio } : null);
      showToast('Profile updated!');
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Request payout
  const requestPayout = async () => {
    if (!payoutMethod || !payoutHandle) {
      showToast('Please select a method and enter your handle.', 'error');
      return;
    }
    setRequesting(true);
    try {
      // Insert payout request — you'd wire this to Stripe/PayPal etc.
      const { error } = await supabase
        .from('payouts')
        .insert({
          writer_id: writer?.id,
          amount_usd: unpaidTotal,
          method: payoutMethod,
          handle: payoutHandle,
          status: 'pending',
        });

      if (error) throw error;
      showToast('Payout requested! We\'ll process it within 2-3 business days.');
      setPayoutHandle('');
      setPayoutMethod('');
    } catch {
      showToast('Payout request failed. Please try again.', 'error');
    } finally {
      setRequesting(false);
    }
  };

  // Stats
  const totalEarnings = earnings.reduce((s, e) => s + Number(e.writer_usd), 0);
  const unpaidTotal = earnings.filter(e => !e.payout_id).reduce((s, e) => s + Number(e.writer_usd), 0);
  const totalUnlocks = earnings.length;
  const totalInkEarned = earnings.reduce((s, e) => s + e.ink_spent, 0);

  if (loading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="hq-root">
          <div className="loading-wrap" style={{ minHeight: '100vh' }}>
            <div className="spinner" />
            <p className="loading-text">Loading your Writer HQ…</p>
          </div>
        </div>
      </>
    );
  }

  if (!writer) return null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="hq-root">

        {/* Toast */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* Nav */}
        <nav className="hq-nav">
          <div className="hq-nav-line" />
          <div className="hq-nav-inner">
            <a href="https://the-writer-s-room.vercel.app" className="hq-nav-brand">
              <div className="hq-nav-logo">TWR</div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span className="hq-nav-title">The Writer's Room</span>
                <span className="hq-nav-sub">Writer HQ</span>
              </div>
            </a>
            <div className="hq-nav-right">
              <div className="hq-nav-writer">✍️ {writer.name}</div>
              <button className="hq-nav-logout" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}>
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="hq-body">

          {/* Sidebar */}
          <aside className="hq-sidebar">
            <div className="hq-nav-section">Overview</div>
            <button className={`hq-nav-item${tab === 'overview' ? ' active' : ''}`} onClick={() => setTab('overview')}>
              <span className="hq-nav-icon">📊</span> Dashboard
            </button>

            <div className="hq-nav-section">Content</div>
            <button className={`hq-nav-item${tab === 'chapters' ? ' active' : ''}`} onClick={() => setTab('chapters')}>
              <span className="hq-nav-icon">📖</span> My Chapters
            </button>

            <div className="hq-nav-section">Money</div>
            <button className={`hq-nav-item${tab === 'earnings' ? ' active' : ''}`} onClick={() => setTab('earnings')}>
              <span className="hq-nav-icon">✒️</span> Earnings
            </button>
            <button className={`hq-nav-item${tab === 'payout' ? ' active' : ''}`} onClick={() => setTab('payout')}>
              <span className="hq-nav-icon">💸</span> Request Payout
            </button>

            <div className="hq-nav-section">Account</div>
            <button className={`hq-nav-item${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>
              <span className="hq-nav-icon">👤</span> My Profile
            </button>
          </aside>

          {/* Main content */}
          <main className="hq-content">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">The Writer's Room</span>
                  <h1 className="hq-page-title">Good to see you, {writer.name.split(' ')[0]}.</h1>
                  <p className="hq-page-sub">Here's how your work is performing.</p>
                </div>

                <div className="hq-stats">
                  <div className="hq-stat">
                    <span className="hq-stat-label">Total Earned</span>
                    <div className="hq-stat-value">${totalEarnings.toFixed(2)}</div>
                    <div className="hq-stat-sub">Lifetime writer earnings</div>
                  </div>
                  <div className="hq-stat">
                    <span className="hq-stat-label">Unpaid Balance</span>
                    <div className="hq-stat-value" style={{ color: unpaidTotal > 0 ? 'var(--green)' : 'var(--gold-light)' }}>
                      ${unpaidTotal.toFixed(2)}
                    </div>
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

                {/* Stories */}
                <div className="hq-section">
                  <div className="hq-section-header">
                    <h2 className="hq-section-title">Your Stories</h2>
                  </div>
                  {stories.length > 0 ? (
                    <div className="hq-table-wrap">
                      <table className="hq-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Chapters</th>
                            <th>Status</th>
                            <th>Unlocks</th>
                            <th>Earned</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stories.map(s => {
                            const storyEarnings = earnings.filter(e =>
                              chapters.find(c => c.id === e.chapter_id)
                            );
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

                {/* Recent earnings */}
                {earnings.length > 0 && (
                  <div className="hq-section">
                    <div className="hq-section-header">
                      <h2 className="hq-section-title">Recent Earnings</h2>
                      <button className="btn-ghost" onClick={() => setTab('earnings')}>View All →</button>
                    </div>
                    <div className="hq-table-wrap">
                      <table className="hq-table">
                        <thead>
                          <tr><th>Date</th><th>Chapter</th><th>Ink</th><th>You Earned</th><th>Status</th></tr>
                        </thead>
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
              </div>
            )}

            {/* ── CHAPTERS ── */}
            {tab === 'chapters' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">Content</span>
                  <h1 className="hq-page-title">My Chapters</h1>
                  <p className="hq-page-sub">Click any chapter to edit its content.</p>
                </div>

                {chapters.length > 0 ? (
                  <div className="editor-grid">
                    {/* Chapter list */}
                    <div className="chapter-list-panel">
                      <div className="chapter-list-header">Chapters — {chapters.length} total</div>
                      {chapters.map(ch => (
                        <button
                          key={ch.id}
                          className={`chapter-list-item${selectedChapter?.id === ch.id ? ' active' : ''}`}
                          onClick={() => selectChapter(ch)}
                        >
                          <span className="chapter-num">{ch.chapter_number}</span>
                          <span style={{ flex: 1, textAlign: 'left', fontSize: 11, lineHeight: 1.4 }}>
                            {ch.title.length > 40 ? ch.title.slice(0, 40) + '…' : ch.title}
                          </span>
                          <span className={`badge ${ch.is_free ? 'badge-free' : 'badge-locked'}`} style={{ fontSize: 8 }}>
                            {ch.is_free ? 'Free' : `${ch.ink_cost}✒`}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Editor */}
                    {selectedChapter && (
                      <div className="editor-panel">
                        <div className="editor-header">
                          <div>
                            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 4 }}>
                              Chapter {selectedChapter.chapter_number}
                            </div>
                            <div className="editor-chapter-title">{selectedChapter.title}</div>
                          </div>
                          <span className={`badge ${selectedChapter.is_free ? 'badge-free' : 'badge-locked'}`}>
                            {selectedChapter.is_free ? 'Free' : `${selectedChapter.ink_cost} Ink to unlock`}
                          </span>
                        </div>
                        <div className="editor-body">
                          <div className="editor-field">
                            <label className="editor-label">Chapter Title</label>
                            <input
                              className="editor-input"
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                            />
                          </div>
                          <div className="editor-field">
                            <label className="editor-label">Content</label>
                            <textarea
                              className="editor-textarea"
                              value={editContent}
                              onChange={e => setEditContent(e.target.value)}
                              placeholder="Paste or write your chapter content here…"
                            />
                          </div>
                        </div>
                        <div className="editor-footer">
                          <span className="editor-char-count">
                            {editContent.length.toLocaleString()} characters
                          </span>
                          <button className="btn-primary" disabled={saving} onClick={saveChapter}>
                            {saving ? 'Saving…' : 'Save Chapter ✓'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">📖</span>
                    <div className="empty-title">No chapters yet</div>
                    <p className="empty-sub">Your chapters will appear here once your story is set up.</p>
                  </div>
                )}
              </div>
            )}

            {/* ── EARNINGS ── */}
            {tab === 'earnings' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">Money</span>
                  <h1 className="hq-page-title">Earnings</h1>
                  <p className="hq-page-sub">Every time a reader unlocks your chapter, you earn 70%.</p>
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
                      <button className="btn-primary" onClick={() => setTab('payout')}>
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
                            <th>Your Cut (70%)</th>
                            <th>TTL (30%)</th>
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
            )}

            {/* ── PAYOUT ── */}
            {tab === 'payout' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">Money</span>
                  <h1 className="hq-page-title">Request Payout</h1>
                  <p className="hq-page-sub">No minimum. Withdraw whenever you want.</p>
                </div>

                <div className="payout-grid">
                  <div className="payout-card">
                    <div className="payout-balance">${unpaidTotal.toFixed(2)}</div>
                    <div className="payout-balance-label">Available to withdraw</div>

                    <div style={{ marginBottom: 12 }}>
                      <label className="editor-label">Payout Method</label>
                      <div className="payout-method-grid">
                        {['Stripe', 'PayPal', 'Venmo', 'Zelle'].map(m => (
                          <button
                            key={m}
                            className={`payout-method-btn${payoutMethod === m ? ' selected' : ''}`}
                            onClick={() => setPayoutMethod(m)}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="editor-label">
                      {payoutMethod === 'Stripe' ? 'Email or Account ID' :
                       payoutMethod === 'PayPal' ? 'PayPal Email' :
                       payoutMethod === 'Venmo' ? '@Venmo Handle' :
                       payoutMethod === 'Zelle' ? 'Phone or Email' : 'Your Handle'}
                    </label>
                    <input
                      className="payout-input"
                      placeholder={payoutMethod ? `Enter your ${payoutMethod} details` : 'Select a method first'}
                      value={payoutHandle}
                      onChange={e => setPayoutHandle(e.target.value)}
                      disabled={!payoutMethod}
                    />

                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                      disabled={requesting || unpaidTotal === 0 || !payoutMethod || !payoutHandle}
                      onClick={requestPayout}
                    >
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
                    <div className="payout-info-row">
                      <span className="payout-info-label">Your cut</span>
                      <span className="payout-info-val" style={{ color: 'var(--green)' }}>70% of every unlock</span>
                    </div>
                    <div className="payout-info-row">
                      <span className="payout-info-label">TTL platform fee</span>
                      <span className="payout-info-val">30%</span>
                    </div>
                    <div className="payout-info-row">
                      <span className="payout-info-label">Tip jar</span>
                      <span className="payout-info-val" style={{ color: 'var(--green)' }}>100% yours</span>
                    </div>
                    <div className="payout-info-row">
                      <span className="payout-info-label">Minimum payout</span>
                      <span className="payout-info-val">None</span>
                    </div>
                    <div className="payout-info-row">
                      <span className="payout-info-label">Processing time</span>
                      <span className="payout-info-val">2-3 business days</span>
                    </div>
                    <div className="payout-info-row">
                      <span className="payout-info-label">Your copyright</span>
                      <span className="payout-info-val" style={{ color: 'var(--green)' }}>Always yours ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {tab === 'profile' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">Account</span>
                  <h1 className="hq-page-title">My Profile</h1>
                  <p className="hq-page-sub">This is your public author profile on TTL.</p>
                </div>

                <div style={{ maxWidth: 640 }}>
                  <div className="editor-field">
                    <label className="editor-label">Display Name</label>
                    <input className="editor-input" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div className="editor-field">
                    <label className="editor-label">Bio</label>
                    <textarea
                      className="editor-textarea"
                      style={{ minHeight: 120 }}
                      value={editBio}
                      onChange={e => setEditBio(e.target.value)}
                      placeholder="Tell readers about yourself…"
                    />
                  </div>

                  <div className="hq-divider" />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>
                    Social Links
                  </div>

                  <div className="editor-field">
                    <label className="editor-label">Website</label>
                    <input className="editor-input" value={editWebsite} onChange={e => setEditWebsite(e.target.value)} placeholder="https://yoursite.com" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="editor-field">
                      <label className="editor-label">Twitter / X</label>
                      <input className="editor-input" value={editTwitter} onChange={e => setEditTwitter(e.target.value)} placeholder="https://twitter.com/you" />
                    </div>
                    <div className="editor-field">
                      <label className="editor-label">Instagram</label>
                      <input className="editor-input" value={editInstagram} onChange={e => setEditInstagram(e.target.value)} placeholder="https://instagram.com/you" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button className="btn-primary" disabled={saving} onClick={saveProfile}>
                      {saving ? 'Saving…' : 'Save Profile ✓'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
