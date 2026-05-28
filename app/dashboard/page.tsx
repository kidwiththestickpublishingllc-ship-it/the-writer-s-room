"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { TWRNav } from "@/app/components/TWRNav";

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
    position:sticky; top:74px; height:calc(100vh - 74px); overflow-y:auto;
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

  /* ── SUBMIT MODAL LIGHT OVERRIDES ── */
  .submit-modal-body .editor-label { color: #8a6510; }
  .submit-modal-body .editor-input {
    background: #f8f8f8; border: 1px solid rgba(201,168,76,0.35);
    color: #1a1a2e; border-radius: 0;
  }
  .submit-modal-body .editor-input:focus { border-color: #C9A84C; }
  .submit-modal-body .editor-textarea {
    background: #f8f8f8; border: 1px solid rgba(201,168,76,0.35);
    color: #1a1a2e; border-radius: 0;
  }
  .submit-modal-body .editor-textarea:focus { border-color: #C9A84C; }
  .submit-modal-body .editor-field { margin-bottom: 20px; }
  .submit-modal-body .hq-divider { background: linear-gradient(to right, rgba(201,168,76,0.4), transparent); }
  .submit-modal-body .badge-free { color: #166534; border-color: rgba(22,101,52,0.3); background: rgba(22,101,52,0.08); }
  .submit-modal-body .badge-locked { color: #6b7280; border-color: #d1d5db; background: #f3f4f6; }

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
type Tab = 'overview' | 'chapters' | 'earnings' | 'payout' | 'profile' | 'submit' | 'media' | 'verify' | 'world';

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
// World Building Tab
// =========================
function WorldBuildingTab({ writer }: { writer: any }) {
  const [activeSection, setActiveSection] = useState<'glossary' | 'characters' | 'locations'>('glossary');
  const [stories, setStories] = useState<any[]>([]);
  const [selectedStory, setSelectedStory] = useState<string>('');
  const [glossaryItems, setGlossaryItems] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Glossary form
  const [gTerm, setGTerm] = useState('');
  const [gDef, setGDef] = useState('');
  const [gChapter, setGChapter] = useState('1');

  // Character form
  const [cName, setCName] = useState('');
  const [cBackstory, setCBackstory] = useState('');
  const [cChapter, setCChapter] = useState('1');
  const [cImage, setCImage] = useState('');

  // Location form
  const [lName, setLName] = useState('');
  const [lDesc, setLDesc] = useState('');
  const [lType, setLType] = useState('landmark');
  const [lChapter, setLChapter] = useState('1');
  const [lX, setLX] = useState('50');
  const [lY, setLY] = useState('50');
  const [lColor, setLColor] = useState('#C9A84C');

  useEffect(() => {
    if (!writer) return;
    supabase.from('stories').select('id, title').eq('author_id', writer.id).eq('is_published', true)
      .then(({ data }) => { setStories(data ?? []); if (data?.[0]) setSelectedStory(data[0].id); });
  }, [writer]);

  useEffect(() => {
    if (!selectedStory) return;
    setLoading(true);
    Promise.all([
      supabase.from('glossary').select('*').eq('story_id', selectedStory).order('chapter_first_appears'),
      supabase.from('characters').select('*').eq('story_id', selectedStory).order('chapter_introduced'),
      supabase.from('story_locations').select('*').eq('story_id', selectedStory).order('chapter_unlocks_at'),
    ]).then(([g, c, l]) => {
      setGlossaryItems(g.data ?? []);
      setCharacters(c.data ?? []);
      setLocations(l.data ?? []);
      setLoading(false);
    });
  }, [selectedStory]);

  async function addGlossary() {
    if (!gTerm || !gDef || !selectedStory) return;
    setSaving(true);
    const { data } = await supabase.from('glossary').insert({
      story_id: selectedStory, writer_id: writer.id,
      term: gTerm, definition: gDef,
      chapter_first_appears: parseInt(gChapter), is_approved: false
    }).select().single();
    if (data) setGlossaryItems(prev => [...prev, data]);
    setGTerm(''); setGDef(''); setGChapter('1');
    setSaving(false);
  }

  async function addCharacter() {
    if (!cName || !cBackstory || !selectedStory) return;
    setSaving(true);
    const { data } = await supabase.from('characters').insert({
      story_id: selectedStory, writer_id: writer.id,
      name: cName, backstory: cBackstory,
      chapter_introduced: parseInt(cChapter),
      image_url: cImage || null, is_approved: false
    }).select().single();
    if (data) setCharacters(prev => [...prev, data]);
    setCName(''); setCBackstory(''); setCChapter('1'); setCImage('');
    setSaving(false);
  }

  async function addLocation() {
    if (!lName || !selectedStory) return;
    setSaving(true);
    const { data } = await supabase.from('story_locations').insert({
      story_id: selectedStory, writer_id: writer.id,
      name: lName, description: lDesc,
      location_type: lType,
      chapter_unlocks_at: parseInt(lChapter),
      x_position: parseFloat(lX), y_position: parseFloat(lY),
      accent_color: lColor, is_approved: false
    }).select().single();
    if (data) setLocations(prev => [...prev, data]);
    setLName(''); setLDesc(''); setLType('landmark'); setLChapter('1');
    setLX('50'); setLY('50'); setLColor('#C9A84C');
    setSaving(false);
  }

  async function deleteItem(table: string, id: string, setter: Function, items: any[]) {
    await supabase.from(table).delete().eq('id', id);
    setter(items.filter((i: any) => i.id !== id));
  }

  const sectionStyle = (s: string) => ({
    padding: '8px 18px', borderRadius: 6, cursor: 'pointer',
    border: `1px solid ${activeSection === s ? 'var(--gold)' : 'var(--border)'}`,
    background: activeSection === s ? 'var(--gold-glow)' : 'transparent',
    color: activeSection === s ? 'var(--gold-light)' : 'var(--text-muted)',
    fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.1em', textTransform: 'uppercase' as const,
  });

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Story selector */}
      {stories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌍</span>
          <div className="empty-title">No published stories yet</div>
          <p className="empty-sub">Submit and get a story approved first — then come back to build its world.</p>
        </div>
      ) : (
        <>
          <div className="editor-field">
            <label className="editor-label">Which story?</label>
            <select className="editor-input" value={selectedStory} onChange={e => setSelectedStory(e.target.value)}>
              {stories.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          {/* Section tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button style={sectionStyle('glossary')} onClick={() => setActiveSection('glossary')}>
              📖 Glossary ({glossaryItems.length})
            </button>
            <button style={sectionStyle('characters')} onClick={() => setActiveSection('characters')}>
              👤 Characters ({characters.length})
            </button>
            <button style={sectionStyle('locations')} onClick={() => setActiveSection('locations')}>
              🗺️ Locations ({locations.length})
            </button>
          </div>

          {loading ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading…</div> : (
            <>
              {/* GLOSSARY */}
              {activeSection === 'glossary' && (
                <div>
                  <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Add Term</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="editor-field">
                        <label className="editor-label">Term</label>
                        <input className="editor-input" placeholder="e.g. The Glitch" value={gTerm} onChange={e => setGTerm(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">First appears in chapter</label>
                        <input className="editor-input" type="number" min="0" value={gChapter} onChange={e => setGChapter(e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Definition</label>
                      <textarea className="editor-textarea" style={{ minHeight: 80 }} placeholder="What does this term mean in your world?" value={gDef} onChange={e => setGDef(e.target.value)} />
                    </div>
                    <button className="btn-primary" disabled={saving || !gTerm || !gDef} onClick={addGlossary}>
                      {saving ? 'Saving…' : '+ Add Term'}
                    </button>
                  </div>
                  {glossaryItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No glossary terms yet. Add as many or as few as your world needs.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {glossaryItems.map(item => (
                        <div key={item.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-light)' }}>{item.term}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>Ch. {item.chapter_first_appears}</span>
                              <span style={{ fontSize: 9, color: item.is_approved ? '#6dc96d' : 'var(--text-muted)', border: `1px solid ${item.is_approved ? 'rgba(109,201,109,0.3)' : 'var(--border)'}`, borderRadius: 4, padding: '2px 8px' }}>{item.is_approved ? '✓ Approved' : 'Pending'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.definition}</div>
                          </div>
                          <button onClick={() => deleteItem('glossary', item.id, setGlossaryItems, glossaryItems)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, marginLeft: 12, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CHARACTERS */}
              {activeSection === 'characters' && (
                <div>
                  <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Add Character</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="editor-field">
                        <label className="editor-label">Character Name</label>
                        <input className="editor-input" placeholder="e.g. Fox" value={cName} onChange={e => setCName(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Introduced in chapter</label>
                        <input className="editor-input" type="number" min="0" value={cChapter} onChange={e => setCChapter(e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Backstory / Description</label>
                      <textarea className="editor-textarea" style={{ minHeight: 100 }} placeholder="Who is this character? What should readers know after meeting them?" value={cBackstory} onChange={e => setCBackstory(e.target.value)} />
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Character Image URL <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>(optional)</span></label>
                      <input className="editor-input" placeholder="https://your-character-art.jpg" value={cImage} onChange={e => setCImage(e.target.value)} />
                    </div>
                    <button className="btn-primary" disabled={saving || !cName || !cBackstory} onClick={addCharacter}>
                      {saving ? 'Saving…' : '+ Add Character'}
                    </button>
                  </div>
                  {characters.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No characters yet. Add character cards that unlock for readers when they reach the chapter a character appears in.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {characters.map(char => (
                        <div key={char.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          {char.image_url && <img src={char.image_url} alt={char.name} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#84b0f5' }}>{char.name}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>Ch. {char.chapter_introduced}</span>
                              <span style={{ fontSize: 9, color: char.is_approved ? '#6dc96d' : 'var(--text-muted)', border: `1px solid ${char.is_approved ? 'rgba(109,201,109,0.3)' : 'var(--border)'}`, borderRadius: 4, padding: '2px 8px' }}>{char.is_approved ? '✓ Approved' : 'Pending'}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{char.backstory}</div>
                          </div>
                          <button onClick={() => deleteItem('characters', char.id, setCharacters, characters)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* LOCATIONS */}
              {activeSection === 'locations' && (
                <div>
                  <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: 'var(--gold-light)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>Add Location</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div className="editor-field">
                        <label className="editor-label">Location Name</label>
                        <input className="editor-input" placeholder="e.g. Town Square" value={lName} onChange={e => setLName(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Unlocks at chapter</label>
                        <input className="editor-input" type="number" min="0" value={lChapter} onChange={e => setLChapter(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Type</label>
                        <select className="editor-input" value={lType} onChange={e => setLType(e.target.value)}>
                          <option value="landmark">Landmark</option>
                          <option value="building">Building</option>
                          <option value="residential">Residential</option>
                          <option value="secret">Secret</option>
                          <option value="natural">Natural</option>
                          <option value="institution">Institution</option>
                        </select>
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Accent Color</label>
                        <input type="color" value={lColor} onChange={e => setLColor(e.target.value)} style={{ width: '100%', height: 42, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--ink2)' }} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Map X position (0-100)</label>
                        <input className="editor-input" type="number" min="0" max="100" value={lX} onChange={e => setLX(e.target.value)} />
                      </div>
                      <div className="editor-field">
                        <label className="editor-label">Map Y position (0-100)</label>
                        <input className="editor-input" type="number" min="0" max="100" value={lY} onChange={e => setLY(e.target.value)} />
                      </div>
                    </div>
                    <div className="editor-field" style={{ marginBottom: 12 }}>
                      <label className="editor-label">Description</label>
                      <textarea className="editor-textarea" style={{ minHeight: 80 }} placeholder="What is this place? What happened here?" value={lDesc} onChange={e => setLDesc(e.target.value)} />
                    </div>
                    <button className="btn-primary" disabled={saving || !lName} onClick={addLocation}>
                      {saving ? 'Saving…' : '+ Add Location'}
                    </button>
                  </div>
                  {locations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>No locations yet. Add places from your story that appear on the world map and unlock as readers progress.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {locations.map(loc => (
                        <div key={loc.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <div style={{ width: 12, height: 12, borderRadius: '50%', background: loc.accent_color, flexShrink: 0 }} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{loc.name}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', textTransform: 'uppercase' }}>{loc.location_type}</span>
                              <span style={{ fontSize: 9, color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>Unlocks Ch. {loc.chapter_unlocks_at}</span>
                              <span style={{ fontSize: 9, color: loc.is_approved ? '#6dc96d' : 'var(--text-muted)', border: `1px solid ${loc.is_approved ? 'rgba(109,201,109,0.3)' : 'var(--border)'}`, borderRadius: 4, padding: '2px 8px' }}>{loc.is_approved ? '✓ Approved' : 'Pending'}</span>
                            </div>
                            {loc.description && <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{loc.description}</div>}
                          </div>
                          <button onClick={() => deleteItem('story_locations', loc.id, setLocations, locations)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, marginLeft: 12, flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
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
  const [showWelcome, setShowWelcome] = useState(false);
    // Profile edit state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
// Story submission state
  const [storyTitle, setStoryTitle] = useState('');
  const [storyRoom, setStoryRoom] = useState<'reading-room' | 'red-room'>('reading-room');
  const [storyGenre, setStoryGenre] = useState('');
  const [storySubGenre, setStorySubGenre] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [storyDescription, setStoryDescription] = useState('');
  const [storyCover, setStoryCover] = useState('');
  const [storyFormat, setStoryFormat] = useState<'serial' | 'standalone'>('serial');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [coverMode, setCoverMode] = useState<'upload' | 'url'>('url');
  const [coverUploading, setCoverUploading] = useState(false);
  const [docxChapters, setDocxChapters] = useState<{ title: string; content: string; isFree: boolean }[]>([]);
  const [docxProcessing, setDocxProcessing] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaTitle, setMediaTitle] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [mediaType, setMediaType] = useState('illustration');
  const [mediaChapterTag, setMediaChapterTag] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  };
const GENRE_GROUPS = [
    {
      group: 'Romance / Relationship',
      subgenres: ['Age-Gap Romance', 'Billionaire Romance', 'Office Romance', 'Casino Romance', 'Young Love', 'Reverse Harem', 'Yaoi', 'Dark Romance', 'Roman Love Story', 'African American Romance']
    },
    {
      group: 'Fantasy / Supernatural',
      subgenres: ['Dark Fantasy', 'Gothic Horror', 'Magical Girl', 'Magical Boy', 'Monster Romance', 'Fairyland Fantasy', 'Mecha', 'Isekai', 'Dark-Fantasy Romance']
    },
    {
      group: 'Manga / Comic / Visual Style',
      subgenres: ['Manga', 'Manga Style', 'Comic Book Style', 'Watercolor Manga', 'Retro Comic', 'Seinen']
    },
    {
      group: 'Horror / Thriller',
      subgenres: ['Gothic Horror', '60s Horror', 'Horror Romance', 'Monster Castle', 'Psychological Horror']
    },
    {
      group: 'Slice of Life / Specialty',
      subgenres: ['Cooking', 'Cooking Romance', 'Adult Literature', 'Smut', 'Sexy Classy', 'Mature Romance']
    },
    {
      group: 'Literary / General Fiction',
      subgenres: ['Literary Fiction', 'Dark Academia', 'Mystery', 'Thriller', 'Crime', 'Adventure', 'Drama', 'Comedy', 'Psychological', 'Political', 'War', 'Western', 'Biography/Memoir', 'Short Stories', 'Poetry', 'Novella', 'Experimental']
    },
    {
      group: 'Sci-Fi / Futuristic',
      subgenres: ['Sci-Fi', 'Futuristic', 'Mecha', '3D Style', 'Cinematic']
    },
    {
      group: 'Audience / Tone',
      subgenres: ['PG', 'Tasteful', 'Mature', 'Adult', 'Sexy', 'Classy']
    },
    {
      group: 'Aesthetic / Visual Mood',
      subgenres: ['Purple Lighting', 'Futuristic', '3D Style', 'Watercolor', 'Japanese Oriented', 'Comic Noir', 'Cinematic']
    },
  ];

  const READING_ROOM_GENRES = GENRE_GROUPS.flatMap(g => g.subgenres);
  const RED_ROOM_GENRES = [
    'Dark Romance', 'Erotica', 'BDSM', 'Paranormal Romance', 'Taboo',
    'Age Gap', 'Forbidden', 'Reverse Harem', 'Monster Romance', 'Vampire',
    'Werewolf', 'Mafia Romance', 'Stepdad/Stepmom', 'Office Romance',
    'Friends to Lovers', 'Enemies to Lovers', 'Slow Burn', 'Second Chance',
    'Serialized Adult', 'Fan Fiction', 'Explicit Horror', 'Fetish',
    'Lesbian', 'Gay', 'Bisexual', 'Trans', 'Polyamory', 'Cuckold',
    'Exhibitionism', 'Voyeurism'
  ];

  const submitStory = async () => {
    if (!storyTitle || !storyGenre || !storyDescription) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const slug = storyTitle.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const { data: storyData, error } = await supabase.from('stories').insert({
        title: storyTitle,
        slug: `${slug}-${Date.now()}`,
        author_name: writer?.name,
        author_id: writer?.id,
        description: storyDescription,
        cover_url: storyCover || null,
        badge: storyFormat === 'serial' ? 'Serial' : null,
        is_published: false,
        platform: 'ttl',
        room: storyRoom,
        genre: storySubGenre || storyGenre,
      }).select().single();

      if (error) throw error;

      // Notify admin
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'story-submitted',
          to: 'kidwiththestickpublishingllc@gmail.com',
          name: writer?.name,
          data: { title: storyTitle, genre: storySubGenre || storyGenre, room: storyRoom }
        }),
      });
      
if (docxChapters.length > 0 && storyData?.id) {
        const chaptersToInsert = docxChapters.map((ch, i) => ({
          story_id: storyData.id,
          chapter_number: i + 1,
          title: ch.title,
          content: ch.content,
          is_free: ch.isFree,
          ink_cost: ch.isFree ? 0 : 25,
        }));
        await supabase.from('chapters').insert(chaptersToInsert);
      }

      setSubmitSuccess(true);
      setStoryTitle('');
      setStoryGenre('');
      setStoryDescription('');
      setStoryCover('');
      showToast('Story submitted! We\'ll review it shortly.');
    } catch {
      showToast('Submission failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  // Load all data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { window.location.href = '/login'; return; }
        // Get writer profile
        let { data: writerData } = await supabase
          .from('writers')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        // Auto-link: if no writer found by user_id, try matching by email
        if (!writerData) {
          const { data: writerByEmail } = await supabase
            .from('writers')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

          if (writerByEmail) {
            await supabase
              .from('writers')
              .update({ user_id: session.user.id })
              .eq('id', writerByEmail.id);
            writerData = { ...writerByEmail, user_id: session.user.id };
          } else {
            window.location.href = '/apply';
            return;
          }
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

        // Get media
        const { data: mediaData } = await supabase
          .from('story_media')
          .select('*')
          .eq('author_id', writerData.id)
          .order('sort_order');
        if (mediaData) setMediaItems(mediaData);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true') {
        setShowWelcome(true);
        window.history.replaceState({}, '', '/dashboard');
      }
    }
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
        .from('payout_requests')
        .insert({
          writer_id: writer?.id,
          amount: unpaidTotal,
          payout_method: payoutMethod,
          payout_email: payoutHandle,
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
          <TWRNav />
          <div style={{ height: 74 }} />
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
      <TWRNav />
      <div style={{ height: 74 }} />

      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', overflowY: 'auto' }}>
          <div style={{ width: '100%', minHeight: '100vh', background: '#ffffff', borderTop: '4px solid #C9A84C' }}>
            <div style={{ padding: '32px 56px 24px', borderBottom: '1px solid rgba(201,168,76,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 6 }}>The Tiniest Library — Writer Submission</div>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: '#1a1a2e' }}>Submit Your Story</div>
              </div>
              <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: '2px solid #C9A84C', borderRadius: 0, width: 44, height: 44, fontSize: 18, cursor: 'pointer', color: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '48px 80px', color: '#1a1a2e', maxWidth: 1100, margin: '0 auto' }} className="submit-modal-body">
              {submitSuccess ? (
                <div style={{ textAlign: 'center', padding: '80px 32px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: '#1a1a2e', marginBottom: 12 }}>Story submitted!</div>
                  <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 32 }}>We'll review your submission shortly. You'll receive an email once it's approved.</p>
                  <button className="btn-ghost" onClick={() => { setSubmitSuccess(false); setShowSubmitModal(false); }}>Close →</button>
                </div>
              ) : (
                <div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Which Room? *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <button onClick={() => { setStoryRoom('reading-room'); setStoryGenre(''); }} style={{ padding: '20px', borderRadius: 0, cursor: 'pointer', border: storyRoom === 'reading-room' ? '2px solid #C9A84C' : '1px solid #e5e7eb', background: storyRoom === 'reading-room' ? 'rgba(201,168,76,0.06)' : '#f9fafb', color: storyRoom === 'reading-room' ? '#8a6510' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 14, textAlign: 'left' }}>
                        📚 The Reading Room
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>General fiction — all genres</div>
                      </button>
                      <button onClick={() => { setStoryRoom('red-room'); setStoryGenre(''); }} style={{ padding: '20px', borderRadius: 0, cursor: 'pointer', border: storyRoom === 'red-room' ? '2px solid #e05555' : '1px solid #e5e7eb', background: storyRoom === 'red-room' ? 'rgba(200,68,68,0.06)' : '#f9fafb', color: storyRoom === 'red-room' ? '#e05555' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 14, textAlign: 'left' }}>
                        🔴 The Red Room
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>18+ adult fiction only</div>
                      </button>
                    </div>
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Story Title *</label>
                    <input className="editor-input" placeholder="Enter your story title…" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} />
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Genre *</label>
                    {storyRoom === 'reading-room' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select className="editor-input" value={storyGenre} onChange={e => { setStoryGenre(e.target.value); setStorySubGenre(''); }} style={{ cursor: 'pointer' }}>
                          <option value="">Select a genre group…</option>
                          {GENRE_GROUPS.map(g => <option key={g.group} value={g.group}>{g.group}</option>)}
                        </select>
                        {storyGenre && (
                          <select className="editor-input" value={storySubGenre} onChange={e => setStorySubGenre(e.target.value)} style={{ cursor: 'pointer' }}>
                            <option value="">Select a sub-genre…</option>
                            {GENRE_GROUPS.find(g => g.group === storyGenre)?.subgenres.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    ) : (
                      <select className="editor-input" value={storyGenre} onChange={e => setStoryGenre(e.target.value)} style={{ cursor: 'pointer' }}>
                        <option value="">Select a genre…</option>
                        {RED_ROOM_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Format</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {(['serial', 'standalone'] as const).map(f => (
                        <button key={f} onClick={() => setStoryFormat(f)} style={{ padding: '16px', borderRadius: 0, cursor: 'pointer', border: storyFormat === f ? '2px solid #C9A84C' : '1px solid #e5e7eb', background: storyFormat === f ? 'rgba(201,168,76,0.06)' : '#f9fafb', color: storyFormat === f ? '#8a6510' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 13, textAlign: 'left' }}>
                          {f === 'serial' ? '📖 Serial' : '📄 Standalone'}
                          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{f === 'serial' ? 'Multiple chapters, ongoing' : 'Single complete story'}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Description / Blurb *</label>
                    <textarea className="editor-textarea" style={{ minHeight: 160, background: '#f8f8f8', border: '1px solid rgba(201,168,76,0.35)', color: '#1a1a2e', borderRadius: 0 }} placeholder="Write a compelling blurb…" value={storyDescription} onChange={e => setStoryDescription(e.target.value)} />
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{storyDescription.length}/500 characters</div>
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Cover Art <span style={{ color: '#9ca3af', fontSize: 10 }}>(optional)</span></label>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <button onClick={() => setCoverMode('upload')} style={{ flex: 1, padding: '10px', borderRadius: 0, cursor: 'pointer', border: coverMode === 'upload' ? '2px solid #C9A84C' : '1px solid #e5e7eb', background: coverMode === 'upload' ? 'rgba(201,168,76,0.06)' : '#f9fafb', color: coverMode === 'upload' ? '#8a6510' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 12 }}>⬆ Upload File</button>
                      <button onClick={() => setCoverMode('url')} style={{ flex: 1, padding: '10px', borderRadius: 0, cursor: 'pointer', border: coverMode === 'url' ? '2px solid #C9A84C' : '1px solid #e5e7eb', background: coverMode === 'url' ? 'rgba(201,168,76,0.06)' : '#f9fafb', color: coverMode === 'url' ? '#8a6510' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 12 }}>🔗 Paste URL</button>
                    </div>
                    {coverMode === 'url' ? (
                      <input className="editor-input" placeholder="https://your-cover-image.jpg" value={storyCover} onChange={e => setStoryCover(e.target.value)} />
                    ) : (
                      <div>
                        <input type="file" accept="image/*" id="cover-upload" style={{ display: 'none' }} onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file || !writer) return;
                          setCoverUploading(true);
                          const ext = file.name.split('.').pop();
                          const path = `covers/${writer.id}-${Date.now()}.${ext}`;
                          const { error } = await supabase.storage.from('story-media').upload(path, file, { upsert: true });
                          if (!error) {
                            const { data: { publicUrl } } = supabase.storage.from('story-media').getPublicUrl(path);
                            setStoryCover(publicUrl);
                          }
                          setCoverUploading(false);
                        }} />
                        <label htmlFor="cover-upload" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 0, border: '1px dashed #d1d5db', color: '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
                          {coverUploading ? 'Uploading…' : '+ Choose cover image'}
                        </label>
                      </div>
                    )}
                    {storyCover && <img src={storyCover} alt="Cover preview" style={{ marginTop: 12, width: 120, height: 160, objectFit: 'cover', border: '2px solid #C9A84C' }} onError={e => (e.currentTarget.style.display = 'none')} />}
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Upload Manuscript <span style={{ color: '#9ca3af', fontSize: 10 }}>.docx file</span></label>
                    <input type="file" accept=".docx" id="docx-upload" style={{ display: 'none' }} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setDocxProcessing(true);
                      const reader = new FileReader();
                      reader.onload = async ev => {
                        try {
                          const mammoth = await import('mammoth');
                          const result = await mammoth.extractRawText({ arrayBuffer: ev.target?.result as ArrayBuffer });
                          setDocxChapters([{ title: 'Chapter 1', content: result.value, isFree: true }]);
                        } catch { setDocxChapters([{ title: 'Chapter 1', content: 'Could not extract text.', isFree: true }]); }
                        setDocxProcessing(false);
                      };
                      reader.readAsArrayBuffer(file);
                    }} />
                    <label htmlFor="docx-upload" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 0, border: '1px dashed #d1d5db', color: '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 13, cursor: 'pointer' }}>
                      {docxProcessing ? 'Processing…' : '+ Upload .docx manuscript'}
                    </label>
                    {docxChapters.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <span style={{ fontSize: 13, color: '#6b7280' }}>{docxChapters.length} chapter{docxChapters.length > 1 ? 's' : ''} detected</span>
                          <button onClick={() => setDocxChapters(c => [...c, { title: `Chapter ${c.length + 1}`, content: '', isFree: false }])} style={{ fontSize: 12, color: '#C9A84C', background: 'none', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 0, padding: '6px 16px', cursor: 'pointer' }}>+ Add Chapter</button>
                        </div>
                        {docxChapters.map((ch, i) => (
                          <div key={i} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', padding: 16, marginBottom: 10 }}>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                              <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>#{i + 1}</span>
                              <input value={ch.title} onChange={e => setDocxChapters(c => c.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} style={{ flex: 1, background: '#fff', border: '1px solid #e5e7eb', padding: '8px 12px', color: '#1a1a2e', fontFamily: 'var(--font-ui)', fontSize: 13 }} placeholder="Chapter title" />
                              <button onClick={() => setDocxChapters(c => c.map((x, j) => j === i ? { ...x, isFree: !x.isFree } : x))} style={{ padding: '6px 12px', border: '1px solid #e5e7eb', background: ch.isFree ? 'rgba(22,101,52,0.08)' : '#fff', color: ch.isFree ? '#166534' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                {ch.isFree ? '🔓 Free' : '🔒 Paid'}
                              </button>
                              <button onClick={() => setDocxChapters(c => c.filter((_, j) => j !== i))} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#ef4444', cursor: 'pointer', fontSize: 12, padding: '4px 10px' }}>✕ Delete</button>
                            </div>
                            <textarea value={ch.content} onChange={e => setDocxChapters(c => c.map((x, j) => j === i ? { ...x, content: e.target.value } : x))} style={{ width: '100%', minHeight: 160, background: '#fff', border: '1px solid #e5e7eb', padding: '12px', color: '#1a1a2e', fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.8, resize: 'vertical', boxSizing: 'border-box' }} placeholder="Paste or edit chapter content here…" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ height: 1, background: 'linear-gradient(to right, #C9A84C, transparent)', margin: '40px 0' }} />
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 80 }}>
                    <button className="btn-primary" disabled={submitting || !storyTitle || !storyGenre || !storyDescription} onClick={submitStory}>
                      {submitting ? 'Submitting…' : 'Submit Story for Review →'}
                    </button>
                    <span style={{ fontSize: 13, color: '#9ca3af' }}>We review all submissions within 5–7 business days.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="hq-root">
      {showWelcome && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
          <div style={{ width: "100%", maxWidth: 620, background: "#0f0f0f", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 16, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ height: 3, background: "linear-gradient(90deg,transparent,#C9A84C,transparent)" }} />
            <div style={{ padding: "48px 40px" }}>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🕯️</div>
                <p style={{ fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: "rgba(201,168,76,0.7)", marginBottom: 12 }}>The Tiniest Library</p>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>Welcome to the shelf, {writer?.name.split(" ")[0] ?? "Writer"}.</h1>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>Your writer dashboard is live. Here's how to get started in the next 10 minutes.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 12, marginBottom: 32 }}>
                {[
                  { n: "1", title: "Complete your profile", desc: "Add your photo, bio, genres and social links. This is what readers see.", tab: "profile" },
                  { n: "2", title: "Sign your agreements", desc: "Plagiarism Clause and Copyright Agreement — takes 2 minutes.", tab: "agreements" },
                  { n: "3", title: "Submit your first story", desc: "Upload your manuscript title, description and first chapter.", tab: "submit" },
                  { n: "4", title: "Share your profile link", desc: "Tell your audience where to find you on TTL.", tab: null },
                ].map(s => (
                  <div key={s.n} onClick={() => { if (s.tab) setTab(s.tab as any); setShowWelcome(false); }}
                    style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: 16, background: "rgba(201,168,76,0.04)", border: "1px solid rgba(201,168,76,0.12)", borderRadius: 10, cursor: s.tab ? "pointer" : "default" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--gold)", flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</div>
                      {s.tab && <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 6, letterSpacing: "0.1em" }}>Go →</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 20, marginBottom: 32 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase" as const, color: "rgba(201,168,76,0.7)", marginBottom: 12 }}>How Ink Pays You</p>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" as const }}>
                  <div><div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "var(--gold)" }}>70%</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>per chapter unlock</div></div>
                  <div><div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "#4ade80" }}>100%</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>of every tip</div></div>
                  <div><div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "var(--text)" }}>$0</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>minimum payout</div></div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
                <button onClick={() => { setTab('submit'); setShowWelcome(false); }} style={{ flex: 1, fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase" as const, padding: "14px 24px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--gold),#8a6510)", color: "#000" }}>
                  Submit My First Story →
                </button>
                <button onClick={() => setShowWelcome(false)} style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" as const, padding: "14px 24px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}>
                  Explore Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        {/* Toast */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* Nav */}
        <nav className="hq-nav">
          <div className="hq-nav-line" />
          <div className="hq-nav-inner">
            <a href="https://www.the-tiniest-library.com" className="hq-nav-brand">
              <div className="hq-nav-logo">TTL</div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span className="hq-nav-title">The Tiniest Library</span>
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
<div className="hq-nav-section">Publish</div>
<button className={`hq-nav-item${tab === 'submit' ? ' active' : ''}`} onClick={() => setTab('submit')}>
  <span className="hq-nav-icon">📝</span> Submit Story
</button>
<button className={`hq-nav-item${tab === 'media' ? ' active' : ''}`} onClick={() => setTab('media')}>
  <span className="hq-nav-icon">🎨</span> Story Media
</button>
<div className="hq-nav-section">Verify</div>
            <button className={`hq-nav-item${tab === 'world' ? ' active' : ''}`} onClick={() => setTab('world')}>
              <span className="hq-nav-icon">🌍</span> World Building
            </button>
            <button className={`hq-nav-item${tab === 'verify' ? ' active' : ''}`} onClick={() => setTab('verify')}>
              <span className="hq-nav-icon">🪶</span> Verification
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

                {/* Getting Started Banner — shows only for new writers */}
                {stories.length === 0 && (
                  <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04))", border: "1px solid rgba(201,168,76,0.25)", borderLeft: "4px solid var(--gold)", borderRadius: 12, padding: 28, marginBottom: 32 }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 12 }}>Getting Started</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 300, color: "var(--text)", marginBottom: 8 }}>Welcome to your Writer HQ, {writer.name.split(' ')[0]}. 🪶</div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 20 }}>You're all set up. Here's how to get your first story published on TTL:</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
                      {[
                        { step: "1", title: "Fill out your profile", desc: "Add your bio, photo and genres so readers can find you.", tab: "profile" },
                        { step: "2", title: "Submit your story", desc: "Upload your manuscript title, description and first chapter.", tab: "submit" },
                        { step: "3", title: "Add your chapters", desc: "Paste your chapter content in the Chapters tab.", tab: "chapters" },
                        { step: "4", title: "Wait for approval", desc: "We review every story personally. Usually within 5-7 days.", tab: null },
                      ].map(s => (
                        <div key={s.step} onClick={() => s.tab && setTab(s.tab as any)} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 8, padding: 16, cursor: s.tab ? "pointer" : "default", transition: "all 0.2s" }}
                          onMouseEnter={e => s.tab && (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
                          onMouseLeave={e => s.tab && (e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)")}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>{s.step}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{s.title}</div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</div>
                          {s.tab && <div style={{ fontSize: 10, color: "var(--gold)", marginTop: 8, letterSpacing: "0.1em" }}>Go → </div>}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setTab('submit')} style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", padding: "12px 28px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg,var(--gold),#8a6510)", color: "#000" }}>
                      Submit Your First Story →
                    </button>
                  </div>
                )}

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
{/* — VERIFY — */}
            {tab === 'verify' && (
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
                      style={{ minHeight: 180 }}
                      value={editBio}
                      maxLength={3000}
                      onChange={e => setEditBio(e.target.value)}
                      placeholder="Tell readers about yourself…"
                    />
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                      {editBio.length}/3000 characters
                    </div>
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

            {/* ── SUBMIT STORY ── */}
            {tab === 'submit' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">Publish</span>
                  <h1 className="hq-page-title">Submit Your Story</h1>
                  <p className="hq-page-sub">Fill in all details below. You have full editorial control before submission.</p>
                </div>
                <button className="btn-primary" onClick={() => { setShowSubmitModal(true); setTimeout(() => { document.getElementById('submit-modal-overlay')?.scrollTo({ top: 0 }); }, 50); }} style={{ marginBottom: 24 }}>
                  Open Full Submission Form →
                </button>

                {showSubmitModal && (
                  <div
                    id="submit-modal-overlay"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', overflowY: 'auto' }}
                  >
                    <div style={{ width: '100%', background: '#ffffff', borderRadius: 0, borderTop: '4px solid #C9A84C', borderBottom: '4px solid #C9A84C', position: 'relative', minHeight: '100vh' }}>
                      {/* Gold top line */}
                      <div style={{ height: 4, background: 'linear-gradient(90deg, #C9A84C, #6495ED, #C9A84C)' }} />
                      {/* Header */}
                      <div style={{ padding: '32px 40px 24px', borderBottom: '1px solid rgba(201,168,76,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 6 }}>The Tiniest Library — Writer Submission</div>
                          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 300, color: '#1a1a2e' }}>Submit Your Story</div>
                        </div>
                        <button onClick={() => setShowSubmitModal(false)} style={{ background: 'none', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 0, width: 36, height: 36, fontSize: 16, cursor: 'pointer', color: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                      {/* Form body */}
                      <div style={{ padding: '48px 80px', color: '#1a1a2e', maxWidth: 1200, margin: '0 auto' }} className="submit-modal-body">

                {submitSuccess ? (
                  <div className="empty-state">
                    <span className="empty-icon">✅</span>
                    <div className="empty-title">Story submitted!</div>
                    <p className="empty-sub">We'll review your submission and get back to you shortly. You'll receive an email once it's approved.</p>
                    <button className="btn-ghost" style={{ marginTop: 24 }} onClick={() => setSubmitSuccess(false)}>
                      Submit Another Story →
                    </button>
                  </div>
                ) : (
                  <div style={{ maxWidth: 900, margin: '0 auto' }}>

                    {/* Room selector */}
                    <div className="editor-field">
                      <label className="editor-label">Which Room? *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <button
                          onClick={() => { setStoryRoom('reading-room'); setStoryGenre(''); }}
                          style={{
                            padding: '16px', borderRadius: 10, cursor: 'pointer',
                            border: storyRoom === 'reading-room' ? '1px solid var(--gold)' : '1px solid var(--border)',
                            background: storyRoom === 'reading-room' ? 'var(--gold-glow)' : 'var(--ink2)',
                            color: storyRoom === 'reading-room' ? 'var(--gold-light)' : 'var(--text-muted)',
                            fontFamily: 'var(--font-ui)', fontSize: 13, transition: 'all 0.2s',
                          }}
                        >
                          📚 The Reading Room
                          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>General fiction — all genres</div>
                        </button>
                        <button
                          onClick={() => { setStoryRoom('red-room'); setStoryGenre(''); }}
                          style={{
                            padding: '16px', borderRadius: 10, cursor: 'pointer',
                            border: storyRoom === 'red-room' ? '1px solid #e05555' : '1px solid var(--border)',
                            background: storyRoom === 'red-room' ? 'rgba(200,68,68,0.08)' : 'var(--ink2)',
                            color: storyRoom === 'red-room' ? '#e05555' : 'var(--text-muted)',
                            fontFamily: 'var(--font-ui)', fontSize: 13, transition: 'all 0.2s',
                          }}
                        >
                          🔴 The Red Room
                          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>18+ adult fiction only</div>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="editor-field">
                      <label className="editor-label">Story Title *</label>
                      <input
                        className="editor-input"
                        placeholder="Enter your story title…"
                        value={storyTitle}
                        style={{ background: '#f8f8f8', border: '1px solid rgba(201,168,76,0.4)', color: '#1a1a2e', borderRadius: 0 }}
                        onChange={e => setStoryTitle(e.target.value)}
                      />
                    </div>

                    {/* Genre + Sub-genre */}
                    <div className="editor-field">
                      <label className="editor-label">Genre *</label>
                      {storyRoom === 'reading-room' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <select className="editor-input" value={storyGenre} onChange={e => { setStoryGenre(e.target.value); setStorySubGenre(''); }} style={{ cursor: 'pointer' }}>
                            <option value="">Select a genre group…</option>
                            {GENRE_GROUPS.map(g => (
                              <option key={g.group} value={g.group}>{g.group}</option>
                            ))}
                          </select>
                          {storyGenre && (
                            <select className="editor-input" value={storySubGenre} onChange={e => setStorySubGenre(e.target.value)} style={{ cursor: 'pointer' }}>
                              <option value="">Select a sub-genre…</option>
                              {GENRE_GROUPS.find(g => g.group === storyGenre)?.subgenres.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <select className="editor-input" value={storyGenre} onChange={e => setStoryGenre(e.target.value)} style={{ cursor: 'pointer' }}>
                          <option value="">Select a genre…</option>
                          {RED_ROOM_GENRES.map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Format */}
                    <div className="editor-field">
                      <label className="editor-label">Format</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {(['serial', 'standalone'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setStoryFormat(f)}
                            style={{
                              padding: '12px', borderRadius: 8, cursor: 'pointer',
                              border: storyFormat === f ? '1px solid var(--gold)' : '1px solid var(--border)',
                              background: storyFormat === f ? 'var(--gold-glow)' : 'var(--ink2)',
                              color: storyFormat === f ? 'var(--gold-light)' : 'var(--text-muted)',
                              fontFamily: 'var(--font-ui)', fontSize: 12, transition: 'all 0.2s',
                              textTransform: 'capitalize',
                            }}
                          >
                            {f === 'serial' ? '📖 Serial' : '📄 Standalone'}
                            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4 }}>
                              {f === 'serial' ? 'Multiple chapters, ongoing' : 'Single complete story'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="editor-field">
                      <label className="editor-label">Description / Blurb *</label>
                      <textarea
                        className="editor-textarea"
                        style={{ minHeight: 140 }}
                        placeholder="Write a compelling blurb that makes readers want to unlock your story…"
                        value={storyDescription}
                        onChange={e => setStoryDescription(e.target.value)}
                      />
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
                        {storyDescription.length}/500 characters
                      </div>
                    </div>

                   {/* Cover Art */}
                    <div className="editor-field">
                      <label className="editor-label">Cover Art <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>(optional)</span></label>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                        <button onClick={() => setCoverMode('upload')} style={{ flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer', border: coverMode === 'upload' ? '1px solid var(--gold)' : '1px solid var(--border)', background: coverMode === 'upload' ? 'var(--gold-glow)' : 'var(--ink2)', color: coverMode === 'upload' ? 'var(--gold-light)' : 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 11 }}>⬆ Upload File</button>
                        <button onClick={() => setCoverMode('url')} style={{ flex: 1, padding: '8px', borderRadius: 6, cursor: 'pointer', border: coverMode === 'url' ? '1px solid var(--gold)' : '1px solid var(--border)', background: coverMode === 'url' ? 'var(--gold-glow)' : 'var(--ink2)', color: coverMode === 'url' ? 'var(--gold-light)' : 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 11 }}>🔗 Paste URL</button>
                      </div>
                      {coverMode === 'url' ? (
                        <input className="editor-input" placeholder="https://your-cover-image.jpg" value={storyCover} onChange={e => setStoryCover(e.target.value)} />
                      ) : (
                        <div>
                          <input type="file" accept="image/*" id="cover-upload" style={{ display: 'none' }} onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file || !writer) return;
                            setCoverUploading(true);
                            const ext = file.name.split('.').pop();
                            const path = `covers/${writer.id}-${Date.now()}.${ext}`;
                            const { error } = await supabase.storage.from('story-media').upload(path, file, { upsert: true });
                            if (!error) {
                              const { data: { publicUrl } } = supabase.storage.from('story-media').getPublicUrl(path);
                              setStoryCover(publicUrl);
                            }
                            setCoverUploading(false);
                          }} />
                          <label htmlFor="cover-upload" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 6, border: '1px dashed var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer' }}>
                            {coverUploading ? 'Uploading…' : '+ Choose cover image'}
                          </label>
                        </div>
                      )}
                      {storyCover && (
                        <img src={storyCover} alt="Cover preview" style={{ marginTop: 12, width: 120, height: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} onError={e => (e.currentTarget.style.display = 'none')} />
                      )}
                    </div>

                    {/* .docx Upload + Chapter Splitter */}
                    <div className="editor-field">
                      <label className="editor-label">Upload Manuscript <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>.docx file</span></label>
                      <input type="file" accept=".docx" id="docx-upload" style={{ display: 'none' }} onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setDocxProcessing(true);
                        const reader = new FileReader();
                        reader.onload = async ev => {
                          try {
                            const mammoth = await import('mammoth');
                            const result = await mammoth.extractRawText({ arrayBuffer: ev.target?.result as ArrayBuffer });
                            const raw = result.value;
                            setDocxChapters([{ title: 'Chapter 1', content: raw, isFree: true }]);
                          } catch { setDocxChapters([{ title: 'Chapter 1', content: 'Could not extract text. Please paste content manually.', isFree: true }]); }
                          setDocxProcessing(false);
                        };
                        reader.readAsArrayBuffer(file);
                      }} />
                      <label htmlFor="docx-upload" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 6, border: '1px dashed var(--border)', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 12, cursor: 'pointer' }}>
                        {docxProcessing ? 'Processing…' : '+ Upload .docx manuscript'}
                      </label>

                      {docxChapters.length > 0 && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>{docxChapters.length} chapter{docxChapters.length > 1 ? 's' : ''} detected</span>
                            <button onClick={() => setDocxChapters(c => [...c, { title: `Chapter ${c.length + 1}`, content: '', isFree: false }])} style={{ fontSize: 11, color: 'var(--gold-light)', background: 'none', border: '1px solid var(--gold-dim)', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>+ Add Chapter</button>
                          </div>
                          {docxChapters.map((ch, i) => (
                            <div key={i} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, marginBottom: 10 }}>
                              <div style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-ui)', flexShrink: 0 }}>#{i + 1}</span>
                                <input value={ch.title} onChange={e => setDocxChapters(c => c.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} style={{ flex: 1, background: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: 12 }} placeholder="Chapter title" />
                                <button onClick={() => setDocxChapters(c => c.map((x, j) => j === i ? { ...x, isFree: !x.isFree } : x))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: ch.isFree ? 'rgba(100,200,100,0.1)' : 'var(--ink)', color: ch.isFree ? '#6dc96d' : 'var(--text-dim)', fontFamily: 'var(--font-ui)', fontSize: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                  {ch.isFree ? '🔓 Free' : '🔒 Paid'}
                                </button>
                                <button onClick={() => setDocxChapters(c => c.filter((_, j) => j !== i))} style={{ background: 'none', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 4, color: '#f87171', cursor: 'pointer', fontSize: 12, padding: '2px 8px' }}>✕ Delete</button>
                              </div>
                              <textarea value={ch.content} onChange={e => setDocxChapters(c => c.map((x, j) => j === i ? { ...x, content: e.target.value } : x))} style={{ width: '100%', minHeight: 120, background: 'var(--ink)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: 13, lineHeight: 1.7, resize: 'vertical', boxSizing: 'border-box' }} placeholder="Paste or edit chapter content here…" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="hq-divider" />

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <button
                        className="btn-primary"
                        disabled={submitting || !storyTitle || !storyGenre || !storyDescription}
                        onClick={submitStory}
                      >
                        {submitting ? 'Submitting…' : 'Submit Story for Review →'}
                      </button>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                        We review all submissions within 5–7 business days.
                      </span>
                    </div>
                  </div>
                )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
{/* ── WORLD BUILDING ── */}
            {tab === 'world' && (
              <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">World Building</span>
                  <h2 className="hq-page-title">Your Story World</h2>
                  <p className="hq-page-sub">Add glossary terms, characters, and locations that unlock for readers as they progress through your story. Everything here is optional — add as much or as little as your world requires.</p>
                </div>

                <WorldBuildingTab writer={writer} />
              </div>
            )}
            {tab === 'media' && (

                 <div className="fade-up">
                <div className="hq-page-header">
                  <span className="hq-page-eyebrow">Story Media</span>
                  <h1 className="hq-page-title">Gallery & Artwork</h1>
                  <p className="hq-page-sub">Upload maps, character portraits, mood boards and illustrations for your readers.</p>
                </div>

                {/* Upload form */}
                <div style={{ background: 'var(--ink2)', border: '1px solid var(--border-gold)', borderRadius: 12, padding: 28, marginBottom: 32 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, color: 'var(--text)', marginBottom: 20 }}>Upload New Media</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="editor-field">
                      <label className="editor-label">Title</label>
                      <input className="editor-input" placeholder="e.g. Map of Veloria" value={mediaTitle} onChange={e => setMediaTitle(e.target.value)} />
                    </div>
                    <div className="editor-field">
                      <label className="editor-label">Media Type</label>
                      <select className="editor-input" value={mediaType} onChange={e => setMediaType(e.target.value)} style={{ cursor: 'pointer' }}>
                        <option value="map">🗺️ Map</option>
                        <option value="character">👤 Character Portrait</option>
                        <option value="rogues_gallery">👥 Rogues Gallery</option>
                        <option value="mood_board">🎨 Mood Board</option>
                        <option value="illustration">🖼️ Illustration</option>
                        <option value="other">📎 Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="editor-field" style={{ marginBottom: 16 }}>
                    <label className="editor-label">Caption (optional)</label>
                    <input className="editor-input" placeholder="Add context for your readers…" value={mediaCaption} onChange={e => setMediaCaption(e.target.value)} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                    <div className="editor-field">
                      <label className="editor-label">Link to Chapter (optional)</label>
                      <input className="editor-input" type="number" placeholder="Chapter number" value={mediaChapterTag} onChange={e => setMediaChapterTag(e.target.value)} />
                    </div>
                    <div className="editor-field">
                      <label className="editor-label">Image File</label>
                      <input type="file" accept="image/*" style={{ color: 'var(--text-muted)', fontSize: 13 }} onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setMediaFile(file);
                          setMediaPreview(URL.createObjectURL(file));
                        }
                      }} />
                    </div>
                  </div>

                  {mediaPreview && (
                    <img src={mediaPreview} alt="Preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }} />
                  )}

                  <button className="btn-primary" disabled={mediaUploading || !mediaFile} onClick={async () => {
                    if (!mediaFile || !writer) return;
                    setMediaUploading(true);
                    try {
                      const ext = mediaFile.name.split('.').pop();
                      const path = `${writer.id}/${Date.now()}.${ext}`;
                      const { error: uploadError } = await supabase.storage.from('story-media').upload(path, mediaFile, { upsert: true });
                      if (uploadError) throw uploadError;
                      const { data: { publicUrl } } = supabase.storage.from('story-media').getPublicUrl(path);
                      const { data: inserted, error: dbError } = await supabase.from('story_media').insert({
                        author_id: writer.id,
                        url: publicUrl,
                        title: mediaTitle || 'Untitled',
                        caption: mediaCaption || null,
                        media_type: mediaType,
                        chapter_tag: mediaChapterTag ? parseInt(mediaChapterTag) : null,
                        sort_order: mediaItems.length,
                      }).select().single();
                      if (dbError) throw dbError;
                      setMediaItems(prev => [...prev, inserted]);
                      setMediaTitle(''); setMediaCaption(''); setMediaChapterTag(''); setMediaFile(null); setMediaPreview('');
                      showToast('Media uploaded successfully!');
                    } catch {
                      showToast('Upload failed. Please try again.', 'error');
                    } finally {
                      setMediaUploading(false);
                    }
                  }}>
                    {mediaUploading ? 'Uploading…' : 'Upload Media →'}
                  </button>
                </div>

                {/* Media grid */}
                {mediaItems.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">🎨</span>
                    <div className="empty-title">No media yet</div>
                    <p className="empty-sub">Upload maps, character art, and illustrations to bring your world to life.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {mediaItems.map(item => (
                      <div key={item.id} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <img src={item.url} alt={item.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                        <div style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{item.title}</div>
                          <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{item.media_type.replace('_', ' ')}</div>
                          {item.caption && <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.caption}</div>}
                          {item.chapter_tag && <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>Chapter {item.chapter_tag}</div>}
                          <button onClick={async () => {
                            await supabase.from('story_media').delete().eq('id', item.id);
                            setMediaItems(prev => prev.filter(m => m.id !== item.id));
                            showToast('Media removed.');
                          }} style={{ marginTop: 8, fontSize: 10, color: 'var(--red)', background: 'none', border: '1px solid var(--red-dim)', borderRadius: 4, padding: '3px 8px', cursor: 'pointer' }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

</main>
        </div>
      </div>
    </>
  );
}
