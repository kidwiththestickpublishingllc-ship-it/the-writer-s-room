"use client";

import WriterNotificationSystem from "@/app/components/WriterNotificationSystem";
import QuestionsTab from "@/app/components/QuestionsTab";
import LettersInbox from "@/app/components/LettersInbox";
import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { TWRNav } from "@/app/components/TWRNav";
import WorldBuildingTab from "@/app/components/WorldBuildingTab";
import VerifyTab from "@/app/components/VerifyTab";
import EarningsTab from "@/app/components/EarningsTab";
import PayoutTab from "@/app/components/PayoutTab";
import ProfileTab from "@/app/components/ProfileTab";
import MediaTab from "@/app/components/MediaTab";
import OverviewTab from "@/app/components/OverviewTab";
import ChaptersTab from "@/app/components/ChaptersTab";
import SubmitTab from "@/app/components/SubmitTab";


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
type Tab = 'overview' | 'chapters' | 'earnings' | 'payout' | 'profile' | 'submit' | 'media' | 'verify' | 'world' | 'questions' | 'letters';

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
  email: string | null;
  bio: string | null;
  photo_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  payout_method: string | null;
  payout_handle: string | null;
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
  const [currentStoryId, setCurrentStoryId] = useState<string>('');
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [lockedChapterIds, setLockedChapterIds] = useState<Set<string>>(new Set());
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedStory, setSelectedStory] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [chapterFree, setChapterFree] = useState(true);
  const [chapterCost, setChapterCost] = useState(25);
  const [bulkText, setBulkText] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [payoutHandle, setPayoutHandle] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [stripeOnboarded, setStripeOnboarded] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeChecked, setStripeChecked] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
    // Profile edit state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPayoutMethod, setEditPayoutMethod] = useState('');
  const [editPayoutHandle, setEditPayoutHandle] = useState('');
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
        genre: storySubGenre || storyGenre || 'Serialized Fiction',
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
          data: { title: storyTitle, genre: storySubGenre || storyGenre || 'Serialized Fiction', room: storyRoom }
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
          if (writerData.first_login) {
            window.location.href = '/auth/reset-password';
             return;
        }
        setWriter(writerData);
        setEditName(writerData.name ?? '');
        setEditBio(writerData.bio ?? '');
        setEditTwitter(writerData.twitter_url ?? '');
        setEditInstagram(writerData.instagram_url ?? '');
        setEditWebsite(writerData.website_url ?? '');
        setEditPayoutMethod(writerData.payout_method ?? '');
        setEditPayoutHandle(writerData.payout_handle ?? '');
        setPayoutMethod(writerData.payout_method ?? '');
        setPayoutHandle(writerData.payout_handle ?? '');

        // Get stories by this writer
        const { data: storiesData } = await supabase
          .from('stories')
          .select('*')
          .eq('author_id', writerData.id)
          .order('created_at', { ascending: false });

        if (storiesData && storiesData.length > 0) {
          setStories(storiesData);
          setCurrentStoryId(storiesData[0].id);

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

  // Reload chapters when the writer switches story in My Chapters
  useEffect(() => {
    if (!currentStoryId) return;
    supabase.from('chapters').select('*').eq('story_id', currentStoryId).order('chapter_number')
      .then(({ data }) => {
        setChapters(data ?? []);
        if (data && data.length > 0) { selectChapter(data[0]); }
        else { setSelectedChapter(null); setEditTitle(''); setEditContent(''); }
      });
  }, [currentStoryId]);
  // Load which chapters have been unlocked by paying readers (hard-lock from deletion)
  useEffect(() => {
    async function loadLocks() {
      if (chapters.length === 0) { setLockedChapterIds(new Set()); return; }
      const ids = chapters.map(c => c.id);
      const { data } = await supabase
        .from('chapter_unlocks')
        .select('chapter_id')
        .in('chapter_id', ids);
      setLockedChapterIds(new Set((data ?? []).map((r: any) => r.chapter_id)));
    }
    loadLocks();
  }, [chapters]);

  // Add a new blank chapter at the next number
  const addChapter = async () => {
    if (!currentStoryId) { showToast('Create or select a story first.', 'error'); return; }
    setSaving(true);
    try {
      const nextNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number)) + 1 : 1;
      const { data, error } = await supabase
        .from('chapters')
        .insert({
          story_id: currentStoryId,
          chapter_number: nextNum,
          title: `Chapter ${nextNum}`,
          content: '',
          is_free: nextNum === 1,
          ink_cost: nextNum === 1 ? 0 : 25,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setChapters(prev => [...prev, data]);
        selectChapter(data);
        showToast('New chapter added! Write away.');
      }
    } catch {
      showToast('Failed to add chapter.', 'error');
    } finally {
      setSaving(false);
    }
  };

// Delete a story — blocked if any chapter has paid unlocks
  const deleteStory = async () => {
    if (!currentStoryId) { showToast('No story selected.', 'error'); return; }
    const story = stories.find(s => s.id === currentStoryId);
    if (!story) return;
    // Check for paid unlocks
    const { data: unlocks } = await supabase
      .from('chapter_unlocks')
      .select('id')
      .in('chapter_id', chapters.map(c => c.id))
      .limit(1);
    if (unlocks && unlocks.length > 0) {
      // Has paid unlocks — request deletion instead
      if (!window.confirm(`"${story.title}" has readers who paid to unlock chapters. This will request deletion — Daniel will review and approve.\n\nSend deletion request?`)) return;
      await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admin-message',
          to: 'kidwiththestickpublishingllc@gmail.com',
          name: 'Daniel',
          data: {
            subject: `Story deletion request — ${story.title}`,
            message: `Writer ${writer?.name} (${writer?.email}) has requested deletion of "${story.title}".\n\nThis story has paid unlocks. Please review and delete manually if approved.\n\nStory ID: ${currentStoryId}`,
          }
        }),
      });
      showToast('Deletion request sent. Daniel will review and approve.', 'success');
      return;
    }
    // No paid unlocks — delete directly
    if (!window.confirm(`Delete "${story.title}" and all its chapters? This cannot be undone.`)) return;
    await supabase.from('chapters').delete().eq('story_id', currentStoryId);
    await supabase.from('stories').delete().eq('id', currentStoryId);
    setStories(prev => prev.filter(s => s.id !== currentStoryId));
    setCurrentStoryId('');
    setChapters([]);
    showToast('Story deleted.');
  };

  // Delete a chapter — blocked if a reader has paid to unlock it
  const deleteChapter = async (ch: Chapter) => {
    if (lockedChapterIds.has(ch.id)) {
      showToast('This chapter has been purchased by readers and cannot be deleted.', 'error');
      return;
    }
    if (!window.confirm(`Delete "${ch.title}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('chapters').delete().eq('id', ch.id);
      if (error) throw error;
      setChapters(prev => prev.filter(c => c.id !== ch.id));
      if (selectedChapter?.id === ch.id) setSelectedChapter(null);
      showToast('Chapter deleted.');
    } catch {
      showToast('Failed to delete chapter.', 'error');
    } finally {
      setSaving(false);
    }
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
    console.log('Saving profile for writer.id:', writer.id);
    console.log('payout_method:', editPayoutMethod, 'payout_handle:', editPayoutHandle);
    try {
      const { error } = await supabase
        .from('writers')
        .update({
          name: editName,
          bio: editBio,
          twitter_url: editTwitter || null,
          instagram_url: editInstagram || null,
          website_url: editWebsite || null,
          payout_method: editPayoutMethod || null,
          payout_handle: editPayoutHandle || null,
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

const checkStripeStatus = async () => {
    if (stripeChecked) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/connect-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: session.access_token }),
      });
      const data = await res.json();
      setStripeOnboarded(data.onboarded ?? false);
      setStripeChecked(true);
    } catch {}
  };

  const handleStripeOnboard = async () => {
    setStripeLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/stripe/connect-onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: session.access_token }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else showToast("Could not start Stripe onboarding.", "error");
    } catch {
      showToast("Stripe onboarding failed.", "error");
    } finally {
      setStripeLoading(false);
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
      const sessionResult = await supabase.auth.getSession();
      const session = sessionResult.data.session;
      if (!session) { showToast('Not signed in.', 'error'); setRequesting(false); return; }
      // Insert payout request — you'd wire this to Stripe/PayPal etc.
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          writer_id: session.user.id,
          amount: unpaidTotal,
          payout_method: payoutMethod,
          payout_email: payoutHandle,
          status: 'pending',
        });

      if (error) throw error;
      showToast('Payout requested! We\'ll process it within 2-3 business days.');
      setPayoutHandle('');
      setPayoutMethod('');
    } catch (err: any) {
      console.error('Payout error:', err);
      showToast(err.message ?? 'Payout request failed. Please try again.', 'error');
    } finally {
      setRequesting(false);
    }
  };

  // Stats
  const totalEarnings = earnings.reduce((s, e) => s + Number(e.writer_usd), 0);
  const unpaidTotal = earnings.filter(e => !e.payout_id).reduce((s, e) => s + Number(e.writer_usd), 0);
  const totalUnlocks = earnings.length;
  const totalInkEarned = earnings.reduce((s, e) => s + e.ink_spent, 0);
  const writerPct = (writer as any)?.tier === 'tier1' ? 80 : 70;

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
      <WriterNotificationSystem writerId={writer.id} />
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
                  <div><div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 300, color: "var(--gold)" }}>{writerPct}%</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>per chapter unlock</div></div>
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
            <div className="hq-nav-section">Community</div>
            <button className={`hq-nav-item${tab === 'questions' ? ' active' : ''}`} onClick={() => setTab('questions')}>
              <span className="hq-nav-icon">💬</span> Questions
            </button>
            <button className={`hq-nav-item${tab === 'letters' ? ' active' : ''}`} onClick={() => setTab('letters')}>
              <span className="hq-nav-icon">✉️</span> Letters
            </button>
          </aside>

          {/* Main content */}
          <main className="hq-content">

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && <OverviewTab
              writer={writer}
              stories={stories}
              chapters={chapters}
              earnings={earnings}
              totalEarnings={totalEarnings}
              unpaidTotal={unpaidTotal}
              totalUnlocks={totalUnlocks}
              totalInkEarned={totalInkEarned}
              onNavigate={setTab}
            />}

            {/* ── CHAPTERS ── */}
            {tab === 'chapters' && <ChaptersTab
              stories={stories}
              chapters={chapters}
              selectedStory={selectedStory}
              chapterTitle={chapterTitle}
              chapterContent={chapterContent}
              chapterFree={chapterFree}
              chapterCost={chapterCost}
              saving={saving}
              bulkText={bulkText}
              onSetSelectedStory={setSelectedStory}
              onSetChapterTitle={setChapterTitle}
              onSetChapterContent={setChapterContent}
              onSetChapterFree={setChapterFree}
              onSetChapterCost={setChapterCost}
              onSetBulkText={setBulkText}
              onSetChapters={setChapters}
              onSaveChapter={saveChapter}
              onToast={showToast}
            />}

            {/* ── EARNINGS ── */}
            {tab === 'earnings' && <EarningsTab
              earnings={earnings}
              chapters={chapters}
              writerPct={writerPct}
              totalEarnings={totalEarnings}
              unpaidTotal={unpaidTotal}
              totalUnlocks={totalUnlocks}
              onRequestPayout={() => setTab('payout')}
            />}

            {/* ── PAYOUT ── */}
            {tab === 'payout' && <PayoutTab
              stripeOnboarded={stripeOnboarded}
              stripeLoading={stripeLoading}
              payoutMethod={payoutMethod}
              payoutHandle={payoutHandle}
              unpaidTotal={unpaidTotal}
              requesting={requesting}
              writerPct={writerPct}
              onSetPayoutMethod={setPayoutMethod}
              onSetPayoutHandle={setPayoutHandle}
              onStripeOnboard={handleStripeOnboard}
              onCheckStripeStatus={checkStripeStatus}
              onRequestPayout={requestPayout}
            />}
{/* — VERIFY — */}
            {tab === 'verify' && <VerifyTab />}
            {/* ── PROFILE ── */}
            {tab === 'profile' && <ProfileTab
              editName={editName}
              editBio={editBio}
              editWebsite={editWebsite}
              editTwitter={editTwitter}
              editInstagram={editInstagram}
              editPayoutMethod={editPayoutMethod}
              editPayoutHandle={editPayoutHandle}
              saving={saving}
              onSetName={setEditName}
              onSetBio={setEditBio}
              onSetWebsite={setEditWebsite}
              onSetTwitter={setEditTwitter}
              onSetInstagram={setEditInstagram}
              onSetPayoutMethod={setEditPayoutMethod}
              onSetPayoutHandle={setEditPayoutHandle}
              onSave={saveProfile}
            />}

            {/* ── SUBMIT STORY ── */}
            {tab === 'submit' && <SubmitTab
              storyTitle={storyTitle}
              storyRoom={storyRoom}
              storyGenre={storyGenre}
              storySubGenre={storySubGenre}
              storyDescription={storyDescription}
              storyCover={storyCover}
              storyFormat={storyFormat}
              showSubmitModal={showSubmitModal}
              submitting={submitting}
              onSetStoryTitle={setStoryTitle}
              onSetStoryRoom={setStoryRoom}
              onSetStoryGenre={setStoryGenre}
              onSetStorySubGenre={setStorySubGenre}
              onSetStoryDescription={setStoryDescription}
              onSetStoryCover={setStoryCover}
              onSetStoryFormat={setStoryFormat}
              onSetShowSubmitModal={setShowSubmitModal}
              onSubmitStory={submitStory}
            />}
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
            {tab === 'questions' && <QuestionsTab writerId={writer.id} />}
            {tab === 'letters' && <LettersInbox writerId={writer.id} writerName={writer.name} />}
            {tab === 'media' && <MediaTab
              writer={writer}
              mediaItems={mediaItems}
              mediaTitle={mediaTitle}
              mediaType={mediaType}
              mediaCaption={mediaCaption}
              mediaChapterTag={mediaChapterTag}
              mediaFile={mediaFile}
              mediaPreview={mediaPreview}
              mediaUploading={mediaUploading}
              onSetMediaTitle={setMediaTitle}
              onSetMediaType={setMediaType}
              onSetMediaCaption={setMediaCaption}
              onSetMediaChapterTag={setMediaChapterTag}
              onSetMediaFile={setMediaFile}
              onSetMediaPreview={setMediaPreview}
              onSetMediaItems={setMediaItems}
              onSetMediaUploading={setMediaUploading}
              onToast={showToast}
            />}
</main>
        </div>
      </div>
    </>
  );
}