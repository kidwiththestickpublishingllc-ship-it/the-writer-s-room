/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run, reports what would change
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *
 * Three kinds of edit:
 *   exact  — FROM text must appear exactly once, replaced with TO
 *   block  — everything from START up to (not including) END is replaced;
 *            START and END must each appear exactly once, END after START
 *   append — TO is added to the end of the file unless MARKER is already there
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 *
 * Batch: Studio pass 3a — the dashboard shell (folder, divider tabs, phone tabs,
 * welcome note) and the shared styles every dashboard tab uses.
 */

const fs = require('fs');
const path = require('path');

const D = 'app/dashboard/page.tsx';

const EDITS = [

  // ── 1. Dashboard styles: same class names and colour names, studio look ──
  {
    file: D, kind: 'block',
    label: 'styles: manila folder, divider tabs, index cards, ledgers, stamps',
    start: 'const STYLES = `',
    end: "type Tab = 'overview'",
    to: `const STYLES = \`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* The dashboard's colour names, now pointing at the studio.
     Every tab reads these, so the tabs move over with them.
     Inside the folder everything is dark ink on paper and manila. */
  :root {
    --gold: #8A2E2A;
    --gold-light: #141414;
    --gold-dim: rgba(138,46,42,0.35);
    --gold-glow: rgba(255,232,115,0.35);
    --quill: #3570A8;
    --quill-dim: rgba(53,112,168,0.2);
    --ink: #FBF8EF;
    --ink2: #F4EEDD;
    --ink3: #EDE4CC;
    --ink4: #E2D6B6;
    --border: rgba(20,20,20,0.14);
    --border-gold: rgba(20,20,20,0.32);
    --text: #141414;
    --text-muted: #4A4234;
    --text-dim: #6B6250;
    --green: #2E6B45;
    --green-dim: rgba(46,107,69,0.12);
    --red: #C8322F;
    --red-dim: rgba(200,50,47,0.12);
    --font-display: var(--st-font-ui, system-ui, sans-serif);
    --font-ui: var(--st-font-ui, system-ui, sans-serif);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  .fade-up { animation: fadeUp 0.5s ease forwards; }

  /* ── Layout ── */
  .hq-root { min-height: 100vh; display: flex; flex-direction: column; }

  /* ── Top bar: the edge of the cutting mat ── */
  .hq-nav {
    position: sticky; top: 0; z-index: 50;
    background-color: var(--st-mat-deep, #234A3D);
    border-bottom: 1px solid rgba(246,241,228,0.18);
    box-shadow: 0 6px 18px rgba(0,0,0,0.28);
  }
  .hq-nav-line {
    height: 8px;
    background-image:
      repeating-linear-gradient(90deg, rgba(246,241,228,0.5) 0 1px, transparent 1px 10px),
      repeating-linear-gradient(90deg, rgba(246,241,228,0.85) 0 1px, transparent 1px 50px);
    background-size: 100% 4px, 100% 8px;
    background-repeat: no-repeat;
  }
  .hq-nav-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 32px; height: 66px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .hq-nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; min-width: 0; }
  .hq-nav-logo {
    width: 42px; height: 42px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    border: 2.5px solid var(--st-on-mat, #F6F1E4); border-radius: 50%;
    font-family: var(--font-ui); font-size: 13px; font-weight: 900; letter-spacing: 0.06em;
    color: var(--st-on-mat, #F6F1E4);
    transform: rotate(-8deg);
  }
  .hq-nav-title { font-family: var(--st-font-type, monospace); font-size: 18px; font-weight: 700; color: var(--st-on-mat, #F6F1E4); white-space: nowrap; }
  .hq-nav-sub { font-family: var(--st-font-type, monospace); font-size: 12px; color: var(--st-on-mat-dim, rgba(246,241,228,0.78)); }
  .hq-nav-right { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .hq-nav-writer {
    font-family: var(--st-font-hand, cursive); font-size: 24px; font-weight: 700; line-height: 1;
    color: var(--st-pencil-on-mat, #A9CDF0);
    max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hq-nav-logout {
    display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px;
    background: transparent; color: var(--st-on-mat, #F6F1E4);
    border: 2px dashed var(--st-pencil-on-mat, #A9CDF0); border-radius: 3px;
    font-family: var(--font-ui); font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap;
  }
  .hq-nav-logout:hover { border-style: solid; border-color: var(--st-on-mat, #F6F1E4); }

  /* ── The desk: divider tabs on the left, the manila folder on the right ── */
  .hq-body {
    display: flex; align-items: flex-start; flex: 1;
    width: 100%; max-width: 1200px; margin: 0 auto;
    padding: 36px 32px 64px;
  }

  .hq-sidebar {
    width: 200px; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 6px;
    padding-top: 26px; margin-right: -6px;
  }
  .hq-nav-section {
    margin: 14px 0 2px 10px;
    font-family: var(--st-font-type, monospace); font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--st-on-mat-dim, rgba(246,241,228,0.78));
  }
  .hq-nav-section:first-child { margin-top: 0; }

  .hq-nav-item {
    position: relative; z-index: 1;
    display: flex; align-items: center; gap: 8px;
    width: 100%; min-height: 42px; padding: 0 16px;
    background: var(--st-manila-tab, #D9BD80); color: #3B2F17;
    border: none; border-radius: 8px 0 0 8px;
    font-family: var(--font-ui); font-size: 14px; font-weight: 600; text-align: left;
    cursor: pointer;
    box-shadow: inset -8px 0 10px rgba(80,55,15,0.16), 0 2px 4px rgba(0,0,0,0.2);
    transition: background 0.12s, transform 0.12s;
  }
  .hq-nav-item:hover { background: #E4C98E; transform: translateX(-3px); }
  .hq-nav-item.active {
    z-index: 3;
    background: var(--st-manila, #EAD5A4); color: var(--st-ink, #141414); font-weight: 800;
    box-shadow: -3px 2px 5px rgba(0,0,0,0.18);
    transform: none;
  }
  .hq-nav-icon { display: none; }

  .hq-content {
    position: relative; z-index: 2;
    flex: 1; min-width: 0; min-height: 70vh;
    padding: 40px 40px 48px;
    background-color: var(--st-manila, #EAD5A4);
    background-image: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 160px);
    border-radius: 4px 8px 8px 4px;
    box-shadow: 0 24px 50px rgba(0,0,0,0.4);
    color: var(--text);
    font-family: var(--font-ui);
  }

  /* ── Page header ── */
  .hq-page-header { margin-bottom: 30px; }
  .hq-page-eyebrow {
    display: block; margin-bottom: 6px;
    font-family: var(--st-font-type, monospace); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold);
  }
  .hq-page-title {
    margin-bottom: 8px;
    font-family: var(--font-ui); font-weight: 900;
    font-size: clamp(30px, 4vw, 42px); line-height: 1.05; letter-spacing: -0.01em;
    color: var(--text);
  }
  .hq-page-sub { max-width: 660px; font-family: var(--st-font-type, monospace); font-size: 15px; line-height: 1.6; color: var(--text-muted); }

  /* ── Stats: index cards ── */
  .hq-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-bottom: 34px; }
  .hq-stat {
    position: relative;
    padding: 16px 16px 18px;
    background-color: var(--st-paper, #FBF8EF);
    background-image: linear-gradient(#E0605A, #E0605A);
    background-size: 100% 2px; background-position: 0 40px; background-repeat: no-repeat;
    box-shadow: 0 4px 10px rgba(80,55,15,0.25);
    transform: rotate(-0.6deg);
  }
  .hq-stat:nth-child(even) { transform: rotate(0.6deg); }
  .hq-stat::before { content: none; }
  .hq-stat-label {
    height: 24px; overflow: hidden;
    font-family: var(--st-font-type, monospace); font-size: 12px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold);
  }
  .hq-stat-value { margin-top: 12px; font-family: var(--font-ui); font-weight: 900; font-size: 30px; line-height: 1.1; color: var(--text); }
  .hq-stat-sub { margin-top: 4px; font-family: var(--st-font-type, monospace); font-size: 13px; color: var(--text-muted); }

  /* ── Sections ── */
  .hq-section { margin-bottom: 36px; }
  .hq-section-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 14px; }
  .hq-section-title { font-family: var(--font-ui); font-weight: 800; font-size: 20px; color: var(--text); }
  .hq-divider {
    height: 2px; margin: 28px 0; border: 0;
    background: repeating-linear-gradient(90deg, var(--st-pencil, #7FB2E5) 0 8px, transparent 8px 14px);
  }

  /* ── Tables: a ruled ledger ── */
  .hq-table-wrap { background: var(--st-paper, #FBF8EF); box-shadow: 0 4px 12px rgba(80,55,15,0.22); overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .hq-table { width: 100%; min-width: 520px; border-collapse: collapse; font-family: var(--st-font-type, monospace); }
  .hq-table th {
    padding: 12px 14px; text-align: left; white-space: nowrap;
    font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--gold); border-bottom: 2px solid var(--text);
  }
  .hq-table td { padding: 12px 14px; font-size: 14.5px; color: var(--text-muted); border-bottom: 1px solid #9CC3E6; }
  .hq-table tr:last-child td { border-bottom: none; }
  .hq-table tr:hover td { background: rgba(255,232,115,0.18); }
  .hq-table td.primary { color: var(--text); font-weight: 700; }
  .hq-table td.gold { color: var(--text); font-family: var(--font-ui); font-weight: 800; font-size: 16px; }
  .hq-table td.green { color: var(--green); font-weight: 700; }
  .hq-table td.dim { color: var(--text-dim); font-size: 13px; }

  /* ── Badges: small rubber stamps ── */
  .badge {
    display: inline-block; padding: 3px 8px; white-space: nowrap;
    font-family: var(--font-ui); font-size: 11px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
    border: 2px solid currentColor; border-radius: 2px; background: transparent;
    transform: rotate(-3deg);
  }
  .badge-free { color: var(--green); border-color: currentColor; background: transparent; }
  .badge-locked { color: var(--text-dim); border-style: dashed; border-color: currentColor; background: transparent; }
  .badge-pending { color: #3570A8; border-style: dashed; border-color: currentColor; background: transparent; }
  .badge-paid { color: var(--green); border-color: currentColor; background: transparent; }

  /* ── Chapter editor: index cards and a lined page ── */
  .editor-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 22px; align-items: start; }
  .chapter-list-panel { background: var(--st-paper, #FBF8EF); box-shadow: 0 4px 12px rgba(80,55,15,0.22); }
  .chapter-list-header {
    display: flex; justify-content: space-between; align-items: center; gap: 10px;
    padding: 14px 16px; border-bottom: 2px solid var(--text);
    font-family: var(--st-font-type, monospace); font-size: 12px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold);
  }
  .chapter-list-item {
    display: flex; align-items: center; gap: 10px;
    min-height: 44px; padding: 12px 16px;
    border-bottom: 1px solid #9CC3E6; cursor: pointer;
    font-family: var(--font-ui); font-size: 14px; font-weight: 600; color: var(--text-muted);
  }
  .chapter-list-item:last-child { border-bottom: none; }
  .chapter-list-item:hover { background: rgba(255,232,115,0.25); color: var(--text); }
  .chapter-list-item.active { background: var(--st-postit, #FFE873); color: var(--text); font-weight: 800; }
  .chapter-num { min-width: 22px; font-family: var(--st-font-type, monospace); font-size: 12px; color: #3570A8; }

  .editor-panel { background: var(--st-paper, #FBF8EF); box-shadow: 0 4px 12px rgba(80,55,15,0.22); }
  .editor-header {
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;
    padding: 16px 22px; border-bottom: 2px solid var(--text);
  }
  .editor-chapter-title { font-family: var(--font-ui); font-weight: 800; font-size: 20px; color: var(--text); }
  .editor-body { padding: 24px 22px; }
  .editor-field { margin-bottom: 20px; }
  .editor-label {
    display: block; margin-bottom: 8px;
    font-family: var(--st-font-type, monospace); font-size: 12px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold);
  }
  .editor-input {
    width: 100%; min-height: 46px; padding: 10px 4px;
    background: transparent; color: var(--text);
    border: none; border-bottom: 2px dashed var(--st-pencil, #7FB2E5); border-radius: 0;
    font-family: var(--st-font-type, monospace); font-size: 17px; outline: none;
  }
  .editor-input:focus { border-bottom: 2px solid var(--text); }
  .editor-textarea {
    width: 100%; min-height: 420px; padding: 6px 14px; resize: vertical;
    background-color: #FFFEF9;
    background-image: repeating-linear-gradient(transparent 0 31px, #9CC3E6 31px 32px);
    background-attachment: local;
    border: 1px solid #D8CFB8; color: var(--text);
    font-family: var(--st-font-type, monospace); font-size: 17px; line-height: 32px; outline: none;
  }
  .editor-textarea:focus { border-color: var(--text); }
  .editor-footer {
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;
    padding: 14px 22px; border-top: 1px solid #D8CFB8;
  }
  .editor-char-count { font-family: var(--st-font-type, monospace); font-size: 13px; color: var(--text-dim); }

  /* ── Payouts ── */
  .payout-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 24px; align-items: start; }
  .payout-card { position: relative; padding: 26px; background: var(--st-paper, #FBF8EF); box-shadow: 0 4px 12px rgba(80,55,15,0.22); }
  .payout-card::before { content: none; }
  .payout-balance { margin: 8px 0 6px; font-family: var(--font-ui); font-weight: 900; font-size: 46px; line-height: 1; color: #1E2A6B; }
  .payout-balance-label {
    font-family: var(--st-font-type, monospace); font-size: 12px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--gold);
  }
  .payout-method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .payout-method-btn {
    min-height: 48px; padding: 10px 12px;
    background: transparent; color: #3570A8;
    border: 2px dashed var(--st-pencil, #7FB2E5); border-radius: 3px;
    font-family: var(--font-ui); font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .payout-method-btn:hover { border-style: solid; border-color: var(--text); color: var(--text); }
  .payout-method-btn.selected { border: 2px solid var(--text); background: var(--st-postit, #FFE873); color: var(--text); font-weight: 800; }
  .payout-input {
    width: 100%; min-height: 46px; padding: 10px 4px;
    background: transparent; color: var(--text);
    border: none; border-bottom: 2px dashed var(--st-pencil, #7FB2E5); border-radius: 0;
    font-family: var(--st-font-type, monospace); font-size: 17px; outline: none;
  }
  .payout-input:focus { border-bottom: 2px solid var(--text); }
  .payout-info-card { padding: 20px 22px; background: var(--st-postit, #FFE873); color: #2A2418; box-shadow: 0 6px 14px rgba(80,55,15,0.25); transform: rotate(0.6deg); }
  .payout-info-row {
    display: flex; justify-content: space-between; gap: 12px; padding: 9px 0;
    border-bottom: 1px dashed rgba(42,36,24,0.3);
    font-family: var(--st-font-type, monospace); font-size: 14px;
  }
  .payout-info-row:last-child { border-bottom: none; }
  .payout-info-label { color: #4A4234; }
  .payout-info-val { color: var(--text); font-weight: 700; }

  /* ── Buttons: stamp, pencil, and a red cross-out for danger ── */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 50px; padding: 0 24px;
    background: var(--st-paper, #FBF8EF); color: var(--st-stamp, #C8322F);
    border: 3px solid var(--st-stamp, #C8322F); outline: 2px solid var(--st-stamp, #C8322F); outline-offset: 3px;
    border-radius: 4px;
    font-family: var(--font-ui); font-size: 14px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
    transform: rotate(-1.5deg); transition: transform 0.12s; cursor: pointer;
  }
  .btn-primary:hover:not(:disabled) { transform: rotate(-0.5deg) scale(1.03); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 44px; padding: 0 18px;
    background: transparent; color: #3570A8;
    border: 2px dashed var(--st-pencil, #7FB2E5); border-radius: 3px;
    font-family: var(--font-ui); font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .btn-ghost:hover { background: transparent; border-style: solid; border-color: var(--text); color: var(--text); }
  .btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 44px; padding: 0 16px;
    background: transparent; color: var(--red);
    border: 2px solid var(--red); border-radius: 3px;
    font-family: var(--font-ui); font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .btn-danger:hover { background: var(--red); color: var(--st-paper, #FBF8EF); }

  /* ── Empty, loading and toast ── */
  .empty-state { padding: 48px 20px; text-align: center; background: var(--st-paper, #FBF8EF); box-shadow: 0 4px 12px rgba(80,55,15,0.22); }
  .empty-icon { display: none; }
  .empty-title { margin-bottom: 8px; font-family: var(--font-ui); font-weight: 800; font-size: 24px; color: var(--text); }
  .empty-sub { max-width: 460px; margin: 0 auto; font-family: var(--st-font-type, monospace); font-size: 15px; line-height: 1.6; color: var(--text-muted); }

  .spinner {
    width: 28px; height: 28px; border-radius: 50%;
    border: 3px solid rgba(169,205,240,0.35); border-top-color: var(--st-pencil-on-mat, #A9CDF0);
    animation: spin 0.8s linear infinite;
  }
  .hq-content .spinner { border-color: rgba(53,112,168,0.25); border-top-color: #3570A8; }
  .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 50vh; padding: 80px 20px; }
  .loading-text { font-family: var(--st-font-hand, cursive); font-size: 26px; font-weight: 700; color: var(--st-on-mat, #F6F1E4); }
  .hq-content .loading-text { color: #3570A8; }

  .toast {
    position: fixed; right: 24px; bottom: 24px; z-index: 200; max-width: 380px;
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px;
    background: var(--st-paper, #FBF8EF); color: var(--text);
    box-shadow: 0 12px 28px rgba(0,0,0,0.35);
    font-family: var(--st-font-type, monospace); font-size: 15px; line-height: 1.45;
    transform: rotate(-1deg);
  }
  .toast-success { border: none; border-top: 4px solid var(--green); background: var(--st-paper, #FBF8EF); color: var(--text); }
  .toast-error { border: none; border-top: 4px solid var(--red); background: var(--st-paper, #FBF8EF); color: var(--text); }

  /* ── Welcome note (first visit) ── */
  .hq-welcome-overlay {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px; background: rgba(20,32,27,0.75);
  }
  .hq-welcome {
    position: relative; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;
    padding: 40px 40px 36px;
    background: var(--st-paper, #FBF8EF); color: var(--text);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5);
  }
  .hq-welcome-label {
    display: block;
    font-family: var(--st-font-type, monospace); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--gold);
  }
  .hq-welcome-title { margin: 8px 0 8px; font-family: var(--font-ui); font-weight: 900; font-size: clamp(26px, 4vw, 34px); line-height: 1.1; }
  .hq-welcome-sub { font-family: var(--st-font-type, monospace); font-size: 15px; line-height: 1.6; color: var(--text-muted); }
  .hq-welcome-steps { display: grid; gap: 12px; margin: 24px 0; }
  .hq-welcome-step {
    display: flex; align-items: flex-start; gap: 14px; width: 100%;
    padding: 14px 16px; text-align: left;
    background: #FFFEF9; color: var(--text);
    border: 1px solid #D8CFB8; border-top: 2px solid #E0605A;
    box-shadow: 0 3px 8px rgba(80,55,15,0.15);
    font-family: var(--font-ui);
  }
  button.hq-welcome-step { cursor: pointer; }
  button.hq-welcome-step:hover { background: rgba(255,232,115,0.25); }
  .hq-welcome-num {
    flex: none; width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    border: 2px dashed var(--st-pencil, #7FB2E5); border-radius: 50%;
    font-family: var(--st-font-hand, cursive); font-size: 22px; font-weight: 700; color: #3570A8;
  }
  .hq-welcome-text { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .hq-welcome-text strong { font-size: 16px; font-weight: 800; }
  .hq-welcome-text span { font-family: var(--st-font-type, monospace); font-size: 14px; line-height: 1.5; color: var(--text-muted); }
  .hq-welcome-go { flex: none; align-self: center; font-family: var(--st-font-hand, cursive); font-size: 22px; font-weight: 700; color: var(--red); }
  .hq-welcome-ink {
    margin-bottom: 26px; padding: 16px 18px;
    background: var(--st-postit, #FFE873); color: #2A2418;
    box-shadow: 0 6px 14px rgba(80,55,15,0.2); transform: rotate(-0.6deg);
  }
  .hq-welcome-ink-label { font-family: var(--st-font-hand, cursive); font-size: 24px; font-weight: 700; }
  .hq-welcome-ink-row { display: flex; flex-wrap: wrap; gap: 14px 28px; margin-top: 6px; }
  .hq-welcome-ink-row div { display: flex; flex-direction: column; }
  .hq-welcome-ink-row strong { font-family: var(--font-ui); font-size: 28px; font-weight: 900; line-height: 1.1; }
  .hq-welcome-ink-row span { font-family: var(--st-font-type, monospace); font-size: 13px; }
  .hq-welcome-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }

  /* ── The submit form popup keeps its white page ── */
  .submit-modal-body .editor-label { color: #8a6510; }
  .submit-modal-body .editor-input { background: #fafafa; border: 1px solid #e5e7eb; color: #111; padding: 12px 16px; }
  .submit-modal-body .editor-input:focus { border-color: #C9A84C; }
  .submit-modal-body .editor-textarea { background: #fafafa; border: 1px solid #e5e7eb; color: #111; }
  .submit-modal-body .editor-textarea:focus { border-color: #C9A84C; }
  .submit-modal-body .editor-field { margin-bottom: 20px; }
  .submit-modal-body .hq-divider { background: linear-gradient(to right, rgba(201,168,76,0.4), transparent); }
  .submit-modal-body .badge-free { color: #166534; border-color: rgba(22,101,52,0.3); background: rgba(22,101,52,0.06); }
  .submit-modal-body .badge-locked { color: #6b7280; border-color: #d1d5db; background: #f3f4f6; }

  /* ═══ Tablets ═══ */
  @media (max-width: 1100px) {
    .hq-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .editor-grid { grid-template-columns: minmax(0, 1fr); }
    .payout-grid { grid-template-columns: minmax(0, 1fr); }
  }

  /* ═══ Tablets and phones: the divider tabs run across the top of the folder ═══ */
  @media (max-width: 900px) {
    .hq-body { flex-direction: column; align-items: stretch; padding: 20px 12px 48px; }
    .hq-sidebar {
      width: auto; flex-direction: row; gap: 6px;
      margin: 0 0 -2px; padding: 0 10px;
      overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
    }
    .hq-sidebar::-webkit-scrollbar { display: none; }
    .hq-nav-section { display: none; }
    .hq-nav-item {
      flex: none; width: auto; min-height: 44px; padding: 0 14px; white-space: nowrap;
      border-radius: 10px 10px 0 0; transform: none;
      box-shadow: inset 0 -8px 10px rgba(80,55,15,0.16);
    }
    .hq-nav-item:hover { transform: none; }
    .hq-nav-item.active { box-shadow: none; }
    .hq-content { padding: 26px 18px 36px; border-radius: 6px; }
  }

  /* ═══ Phones ═══ */
  @media (max-width: 640px) {
    .hq-nav-inner { padding: 0 16px; height: 60px; }
    .hq-nav-sub { display: none; }
    .hq-nav-title { font-size: 16px; }
    .hq-nav-writer { font-size: 20px; max-width: 130px; }
    .hq-body { padding: 16px 8px 40px; }
    .hq-content { padding: 22px 14px 30px; }
    .hq-stats { gap: 12px; }
    .hq-stat-value { font-size: 24px; }
    .payout-method-grid { grid-template-columns: minmax(0, 1fr); }
    .hq-welcome { padding: 28px 20px 24px; }
    .toast { left: 12px; right: 12px; bottom: 12px; max-width: none; }
  }

  @media (max-width: 400px) {
    .hq-stats { grid-template-columns: minmax(0, 1fr); }
    .hq-nav-writer { display: none; }
  }
\`;

// =========================
// Types
// =========================
`,
  },

  // ── 2. Welcome popup → a paper note with index-card steps ─────────────
  {
    file: D, kind: 'block',
    label: 'welcome: a paper note with the four start-up steps',
    start: '{showWelcome && (',
    end: '{/* Toast */}',
    to: `{showWelcome && (
        <div className="hq-welcome-overlay" role="dialog" aria-modal="true" aria-labelledby="hq-welcome-title">
          <div className="hq-welcome">
            <span className="hq-welcome-label">The Creators Room</span>
            <h1 id="hq-welcome-title" className="hq-welcome-title">Welcome to the studio, {writer?.name.split(" ")[0] ?? "Creator"}.</h1>
            <p className="hq-welcome-sub">Your desk is set up. Here&apos;s how to get going in the next ten minutes.</p>
            <div className="hq-welcome-steps">
              {[
                { n: "1", title: "Complete your profile", desc: "Add your photo, bio, genres and social links. This is what readers see.", tab: "profile" },
                { n: "2", title: "Sign your agreements", desc: "Plagiarism Clause and Copyright Agreement. Takes about 2 minutes.", tab: "agreements" },
                { n: "3", title: "Submit your first work", desc: "A story or a comic: title, description and the first chapter.", tab: "submit" },
                { n: "4", title: "Share your profile link", desc: "Tell your audience where to find you on TTL.", tab: null },
              ].map(s => s.tab ? (
                <button key={s.n} className="hq-welcome-step" onClick={() => { setTab(s.tab as any); setShowWelcome(false); }}>
                  <span className="hq-welcome-num">{s.n}</span>
                  <span className="hq-welcome-text"><strong>{s.title}</strong><span>{s.desc}</span></span>
                  <span className="hq-welcome-go">Go →</span>
                </button>
              ) : (
                <div key={s.n} className="hq-welcome-step">
                  <span className="hq-welcome-num">{s.n}</span>
                  <span className="hq-welcome-text"><strong>{s.title}</strong><span>{s.desc}</span></span>
                </div>
              ))}
            </div>
            <div className="hq-welcome-ink">
              <div className="hq-welcome-ink-label">How Ink pays you</div>
              <div className="hq-welcome-ink-row">
                <div><strong>{writerPct}%</strong><span>of every chapter unlock</span></div>
                <div><strong>100%</strong><span>of every tip</span></div>
                <div><strong>$0</strong><span>minimum payout</span></div>
              </div>
            </div>
            <div className="hq-welcome-actions">
              <button className="btn-primary" onClick={() => { setTab('submit'); setShowWelcome(false); }}>Submit my first work</button>
              <button className="btn-ghost" onClick={() => setShowWelcome(false)}>Explore the dashboard</button>
            </div>
          </div>
        </div>
      )}
        `,
  },

  // ── 3. Top bar and tab names ─────────────────────────────────────────
  {
    file: D, kind: 'exact',
    label: 'top bar: The Creators Room',
    from: `<span className="hq-nav-title">The Tiniest Library</span>`,
    to: `<span className="hq-nav-title">The Creators Room</span>`,
  },
  {
    file: D, kind: 'exact',
    label: 'top bar: your name in pencil, no emoji',
    from: `<div className="hq-nav-writer">✍️ {writer.name}</div>`,
    to: `<div className="hq-nav-writer">hi, {writer.name}</div>`,
  },
  {
    file: D, kind: 'exact',
    label: 'tabs: Submit Work (stories and comics)',
    from: `<span className="hq-nav-icon">📝</span> Submit Story`,
    to: `<span className="hq-nav-icon">📝</span> Submit Work`,
  },

];

// ── engine ───────────────────────────────────────────────────────────
const apply = process.argv.includes('--apply');
const cache = new Map();

function load(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const full = path.join(process.cwd(), rel);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf8');
  const crlf = raw.includes('\r\n');
  const entry = { full, text: crlf ? raw.replace(/\r\n/g, '\n') : raw, crlf, dirty: false };
  cache.set(rel, entry);
  return entry;
}

const count = (hay, needle) => hay.split(needle).length - 1;
let ok = 0, already = 0, missing = 0, ambiguous = 0;
const report = (sym, msg, e) => console.log(`  ${sym} ${msg.padEnd(15)} ${e.label}`);

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }

  if (e.kind === 'append') {
    if (f.text.includes(e.marker)) { already++; report('·', 'already done', e); continue; }
    f.text = f.text.replace(/\s*$/, '\n') + e.to;
    f.dirty = true; ok++; report('✓', 'will add', e);
    continue;
  }

  if (e.kind === 'block') {
    if (f.text.includes(e.to.trim().slice(0, 400)) && f.text.includes(e.to.trim().slice(-200))) {
      already++; report('·', 'already done', e); continue;
    }
    const s = count(f.text, e.start), n = count(f.text, e.end);
    if (s !== 1 || n !== 1) {
      if (s > 1 || n > 1) { ambiguous++; report('✗', 'AMBIGUOUS', e); }
      else { missing++; report('✗', 'NOT FOUND', e); }
      continue;
    }
    const a = f.text.indexOf(e.start), b = f.text.indexOf(e.end);
    if (b < a) { missing++; report('✗', 'OUT OF ORDER', e); continue; }
    f.text = f.text.slice(0, a) + e.to + f.text.slice(b);
    f.dirty = true; ok++; report('✓', 'will replace', e);
    continue;
  }

  const hits = count(f.text, e.from);
  const toHoldsFrom = e.to.includes(e.from);
  if (hits === 0) {
    if (e.to && f.text.includes(e.to)) { already++; report('·', 'already done', e); }
    else { missing++; report('✗', 'NOT FOUND', e); }
  } else if (hits === 1) {
    if (toHoldsFrom && f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true; ok++; report('✓', 'will change', e);
  } else {
    ambiguous++; report('✗', `AMBIGUOUS ${hits}×`, e);
  }
}

console.log('');
console.log(`${ok} to change · ${already} already applied · ${missing} not found · ${ambiguous} ambiguous`);

if (missing || ambiguous) { console.log('\nNothing written. Send me the failing labels.'); process.exit(1); }
if (!apply) { console.log('Dry run. Add --apply to write.'); process.exit(0); }

for (const [rel, f] of cache) {
  if (!f.dirty) continue;
  fs.writeFileSync(f.full, f.crlf ? f.text.replace(/\n/g, '\r\n') : f.text, 'utf8');
  console.log(`  wrote  ${rel}`);
}
console.log('\nWritten. Check Problems, then push.');