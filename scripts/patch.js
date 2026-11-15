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
 * Batch: Studio pass 3a, comic edition — the dashboard becomes a comic book:
 * Ben-Day blue with white dots, black-bordered panels, hard shadows,
 * yellow caption boxes, Bangers lettering.
 */

const fs = require('fs');
const path = require('path');

const D = 'app/dashboard/page.tsx';

const EDITS = [

  {
    file: D, kind: 'block',
    label: 'styles: the dashboard as a comic book (blue dots, panels, captions)',
    start: 'const STYLES = `',
    end: "type Tab = 'overview'",
    to: `const STYLES = \`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ═══ Creator HQ — comic book edition ═══
     The dashboard's colour names point at a classic comic palette.
     Every tab reads these, so the tabs move over with them.
     Panels are white with black ink borders; captions are yellow. */
  :root {
    --cb-blue: #2A64C8;
    --cb-yellow: #FFE14D;
    --cb-red: #E8322E;
    --cb-pink: #FF1493;
    --cb-teal: #14F1D9;
    --cb-ink: #111111;
    --cb-paper: #FFFDF5;

    --gold: #D7261E;
    --gold-light: #111111;
    --gold-dim: rgba(17,17,17,0.35);
    --gold-glow: rgba(255,225,77,0.45);
    --quill: #1E5BB8;
    --quill-dim: rgba(30,91,184,0.18);
    --ink: #FFFFFF;
    --ink2: #FFFDF5;
    --ink3: #F3F0E6;
    --ink4: #E8E3D3;
    --border: rgba(17,17,17,0.55);
    --border-gold: #111111;
    --text: #111111;
    --text-muted: #3A3A3A;
    --text-dim: #5C5C5C;
    --green: #1B8A4A;
    --green-dim: rgba(27,138,74,0.12);
    --red: #D7261E;
    --red-dim: rgba(215,38,30,0.12);
    --font-display: var(--st-font-comic, Impact, sans-serif);
    --font-ui: var(--st-font-ui, system-ui, sans-serif);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  .fade-up { animation: fadeUp 0.5s ease forwards; }

  /* ── The page: Ben-Day blue with white dots ── */
  .hq-root {
    min-height: 100vh; display: flex; flex-direction: column; overflow-x: clip;
    background-color: var(--cb-blue);
    background-image: radial-gradient(rgba(255,255,255,0.3) 1.7px, transparent 1.9px);
    background-size: 14px 14px;
    color: var(--text);
  }

  /* ── Masthead ── */
  .hq-nav { position: sticky; top: 0; z-index: 50; background: var(--cb-ink); }
  .hq-nav-line {
    height: 6px;
    background: repeating-linear-gradient(90deg, var(--cb-yellow) 0 32px, var(--cb-pink) 32px 64px, var(--cb-teal) 64px 96px);
  }
  .hq-nav-inner {
    max-width: 1200px; margin: 0 auto; padding: 0 32px; height: 64px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
  }
  .hq-nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; min-width: 0; }
  .hq-nav-logo {
    width: 44px; height: 44px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: var(--cb-yellow); color: var(--cb-ink);
    border: 3px solid #FFFFFF; border-radius: 50%;
    font-family: var(--font-display); font-size: 18px; letter-spacing: 0.04em;
    transform: rotate(-10deg);
  }
  .hq-nav-title { font-family: var(--font-display); font-size: 24px; letter-spacing: 0.04em; color: var(--cb-yellow); white-space: nowrap; line-height: 1; }
  .hq-nav-sub { font-family: var(--font-ui); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.8); }
  .hq-nav-right { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .hq-nav-writer {
    font-family: var(--font-display); font-size: 20px; letter-spacing: 0.04em; color: #FFFFFF;
    max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hq-nav-logout {
    display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px;
    background: transparent; color: #FFFFFF;
    border: 2px solid #FFFFFF; border-radius: 0;
    font-family: var(--font-ui); font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
    cursor: pointer; white-space: nowrap;
  }
  .hq-nav-logout:hover { background: var(--cb-yellow); color: var(--cb-ink); border-color: var(--cb-yellow); }

  /* ── Layout: a contents panel and the comic page ── */
  .hq-body {
    display: flex; align-items: flex-start; gap: 28px; flex: 1;
    width: 100%; max-width: 1200px; margin: 0 auto;
    padding: 40px 32px 64px;
  }

  .hq-sidebar {
    position: relative; width: 210px; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 4px;
    padding: 22px 12px 14px;
    background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 6px 6px 0 var(--cb-ink);
  }
  .hq-sidebar::before {
    content: "CONTENTS"; position: absolute; top: -17px; left: 12px;
    padding: 2px 10px;
    background: var(--cb-pink); color: #FFFFFF; border: 2px solid var(--cb-ink);
    font-family: var(--font-display); font-size: 18px; letter-spacing: 0.06em;
    transform: rotate(-2deg);
  }
  .hq-nav-section {
    margin: 12px 4px 4px;
    font-family: var(--font-ui); font-size: 11px; font-weight: 800;
    letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-dim);
  }
  .hq-nav-section:first-child { margin-top: 6px; }
  .hq-nav-item {
    display: flex; align-items: center; gap: 8px;
    width: 100%; min-height: 40px; padding: 0 12px;
    background: transparent; color: var(--cb-ink);
    border: 2px solid transparent; border-radius: 0;
    font-family: var(--font-ui); font-size: 14px; font-weight: 700; text-align: left;
    cursor: pointer; transition: transform 0.08s, box-shadow 0.08s, background 0.08s;
  }
  .hq-nav-item:hover { background: #FFF3B0; border-color: var(--cb-ink); }
  .hq-nav-item.active {
    background: var(--cb-yellow); border-color: var(--cb-ink);
    box-shadow: 3px 3px 0 var(--cb-ink); transform: translate(-1px, -1px);
    font-weight: 800;
  }
  .hq-nav-icon { display: none; }

  .hq-content {
    position: relative; flex: 1; min-width: 0; min-height: 70vh;
    padding: 36px 36px 44px;
    background: var(--cb-paper); color: var(--text);
    border: 4px solid var(--cb-ink); box-shadow: 8px 8px 0 var(--cb-ink);
    font-family: var(--font-ui);
  }

  /* ── Page header: a pink tag and a yellow caption box ── */
  .hq-page-header { margin-bottom: 28px; }
  .hq-page-eyebrow {
    display: inline-block; margin-bottom: 12px; padding: 2px 10px;
    background: var(--cb-pink); color: #FFFFFF; border: 2px solid var(--cb-ink);
    font-family: var(--font-display); font-size: 16px; letter-spacing: 0.06em; text-transform: uppercase;
    transform: rotate(-1.5deg);
  }
  .hq-page-title {
    display: block; width: fit-content; max-width: 100%;
    margin-bottom: 14px; padding: 6px 16px 4px;
    background: var(--cb-yellow); color: var(--cb-ink);
    border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink);
    font-family: var(--font-display); font-weight: 400;
    font-size: clamp(28px, 4vw, 44px); line-height: 1.05; letter-spacing: 0.03em;
  }
  .hq-page-sub { max-width: 660px; font-size: 15px; line-height: 1.6; color: var(--text-muted); }

  /* ── Stats: little panels ── */
  .hq-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; margin-bottom: 32px; }
  .hq-stat {
    position: relative; padding: 14px 14px 16px;
    background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink);
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .hq-stat:hover { transform: translate(-2px, -2px); box-shadow: 7px 7px 0 var(--cb-ink); }
  .hq-stat::before { content: none; }
  .hq-stat-label {
    display: inline-block; max-width: 100%; padding: 1px 8px;
    background: var(--cb-yellow); color: var(--cb-ink); border: 2px solid var(--cb-ink);
    font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hq-stat:nth-child(4n+2) .hq-stat-label { background: var(--cb-teal); }
  .hq-stat:nth-child(4n+3) .hq-stat-label { background: var(--cb-pink); color: #FFFFFF; }
  .hq-stat:nth-child(4n+4) .hq-stat-label { background: #FFFFFF; }
  .hq-stat-value { margin-top: 10px; font-family: var(--font-display); font-size: 36px; line-height: 1; letter-spacing: 0.02em; color: var(--cb-ink); }
  .hq-stat-sub { margin-top: 4px; font-size: 12.5px; line-height: 1.4; color: var(--text-muted); }

  /* ── Sections ── */
  .hq-section { margin-bottom: 34px; }
  .hq-section-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
  .hq-section-title {
    display: inline-block; padding: 2px 12px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 3px solid var(--cb-ink); box-shadow: 4px 4px 0 var(--cb-ink);
    font-family: var(--font-display); font-weight: 400; font-size: 24px; letter-spacing: 0.04em;
    transform: rotate(-1deg);
  }
  .hq-divider { height: 4px; margin: 28px 0; border: 0; background: var(--cb-ink); }

  /* ── Tables: a black header strip ── */
  .hq-table-wrap { background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .hq-table { width: 100%; min-width: 520px; border-collapse: collapse; }
  .hq-table th {
    padding: 10px 14px; text-align: left; white-space: nowrap;
    background: var(--cb-ink); color: var(--cb-yellow);
    font-family: var(--font-display); font-weight: 400; font-size: 16px; letter-spacing: 0.05em;
  }
  .hq-table td { padding: 12px 14px; font-size: 14px; color: var(--text-muted); border-bottom: 1.5px solid rgba(17,17,17,0.18); }
  .hq-table tr:last-child td { border-bottom: none; }
  .hq-table tr:hover td { background: #FFF7C2; }
  .hq-table td.primary { color: var(--cb-ink); font-weight: 700; }
  .hq-table td.gold { color: var(--cb-ink); font-family: var(--font-display); font-size: 18px; letter-spacing: 0.03em; }
  .hq-table td.green { color: var(--green); font-weight: 800; }
  .hq-table td.dim { color: var(--text-dim); font-size: 13px; }

  /* ── Badges: stickers ── */
  .badge {
    display: inline-block; padding: 2px 8px; white-space: nowrap;
    font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    border: 2px solid var(--cb-ink); border-radius: 0; box-shadow: 2px 2px 0 var(--cb-ink);
    transform: rotate(-2deg);
  }
  .badge-free { background: var(--cb-teal); color: var(--cb-ink); border-color: var(--cb-ink); }
  .badge-locked { background: #FFFFFF; color: var(--text-dim); border-color: var(--cb-ink); }
  .badge-pending { background: var(--cb-yellow); color: var(--cb-ink); border-color: var(--cb-ink); }
  .badge-paid { background: var(--green); color: #FFFFFF; border-color: var(--cb-ink); }

  /* ── Chapter editor ── */
  .editor-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 24px; align-items: start; }
  .chapter-list-panel { background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); }
  .chapter-list-header {
    display: flex; justify-content: space-between; align-items: center; gap: 10px;
    padding: 10px 14px; background: var(--cb-ink); color: var(--cb-yellow);
    font-family: var(--font-display); font-size: 18px; letter-spacing: 0.05em;
  }
  .chapter-list-item {
    display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 10px 14px;
    border-bottom: 1.5px solid rgba(17,17,17,0.18); cursor: pointer;
    font-size: 14px; font-weight: 700; color: var(--text-muted);
  }
  .chapter-list-item:last-child { border-bottom: none; }
  .chapter-list-item:hover { background: #FFF7C2; color: var(--cb-ink); }
  .chapter-list-item.active { background: var(--cb-yellow); color: var(--cb-ink); font-weight: 800; }
  .chapter-num { min-width: 22px; font-family: var(--font-display); font-size: 17px; color: var(--cb-red); }

  .editor-panel { background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); }
  .editor-header {
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;
    padding: 14px 20px; border-bottom: 3px solid var(--cb-ink);
  }
  .editor-chapter-title { font-family: var(--font-display); font-size: 26px; letter-spacing: 0.03em; color: var(--cb-ink); }
  .editor-body { padding: 22px 20px; }
  .editor-field { margin-bottom: 20px; }
  .editor-label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cb-ink); }
  .editor-input {
    width: 100%; min-height: 46px; padding: 10px 12px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 2px solid var(--cb-ink); border-radius: 0;
    font-family: var(--font-ui); font-size: 16px; outline: none;
  }
  .editor-input:focus { box-shadow: 3px 3px 0 var(--cb-blue); }
  .editor-textarea {
    width: 100%; min-height: 420px; padding: 14px; resize: vertical;
    background: var(--cb-paper); color: var(--cb-ink);
    border: 2px solid var(--cb-ink); border-radius: 0;
    font-family: var(--st-font-type, monospace); font-size: 16px; line-height: 1.75; outline: none;
  }
  .editor-textarea:focus { box-shadow: 3px 3px 0 var(--cb-blue); }
  .editor-footer {
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px;
    padding: 14px 20px; border-top: 3px solid var(--cb-ink);
  }
  .editor-char-count { font-size: 13px; color: var(--text-dim); }

  /* ── Payouts ── */
  .payout-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 26px; align-items: start; }
  .payout-card { position: relative; padding: 24px; background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); }
  .payout-card::before { content: none; }
  .payout-balance { margin: 10px 0 6px; font-family: var(--font-display); font-size: 58px; line-height: 1; letter-spacing: 0.02em; color: var(--cb-ink); }
  .payout-balance-label {
    display: inline-block; padding: 1px 8px;
    background: var(--cb-yellow); border: 2px solid var(--cb-ink);
    font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--cb-ink);
  }
  .payout-method-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .payout-method-btn {
    min-height: 48px; padding: 10px 12px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 2px solid var(--cb-ink); border-radius: 0;
    font-family: var(--font-ui); font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .payout-method-btn:hover { background: #FFF7C2; }
  .payout-method-btn.selected { background: var(--cb-yellow); box-shadow: 3px 3px 0 var(--cb-ink); font-weight: 800; }
  .payout-input {
    width: 100%; min-height: 46px; padding: 10px 12px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 2px solid var(--cb-ink); border-radius: 0;
    font-family: var(--font-ui); font-size: 16px; outline: none;
  }
  .payout-input:focus { box-shadow: 3px 3px 0 var(--cb-blue); }
  .payout-info-card { padding: 18px 20px; background: var(--cb-yellow); border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); transform: rotate(0.6deg); }
  .payout-info-row {
    display: flex; justify-content: space-between; gap: 12px; padding: 9px 0;
    border-bottom: 2px dashed rgba(17,17,17,0.35); font-size: 14px;
  }
  .payout-info-row:last-child { border-bottom: none; }
  .payout-info-label { color: #3A3A3A; }
  .payout-info-val { color: var(--cb-ink); font-weight: 800; }

  /* ── Buttons: press them and they squash into the page ── */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 48px; padding: 0 22px;
    background: var(--cb-yellow); color: var(--cb-ink);
    border: 3px solid var(--cb-ink); border-radius: 0; box-shadow: 4px 4px 0 var(--cb-ink);
    font-family: var(--font-display); font-size: 20px; letter-spacing: 0.05em; text-transform: uppercase;
    cursor: pointer; transition: transform 0.08s, box-shadow 0.08s;
  }
  .btn-primary:hover:not(:disabled) { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--cb-ink); }
  .btn-primary:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--cb-ink); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 44px; padding: 0 16px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 2.5px solid var(--cb-ink); border-radius: 0; box-shadow: 3px 3px 0 var(--cb-ink);
    font-family: var(--font-ui); font-size: 14px; font-weight: 800; cursor: pointer;
    transition: transform 0.08s, box-shadow 0.08s;
  }
  .btn-ghost:hover { background: #FFF7C2; transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--cb-ink); }
  .btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    min-height: 44px; padding: 0 16px;
    background: var(--cb-red); color: #FFFFFF;
    border: 2.5px solid var(--cb-ink); border-radius: 0; box-shadow: 3px 3px 0 var(--cb-ink);
    font-family: var(--font-ui); font-size: 14px; font-weight: 800; cursor: pointer;
  }
  .btn-danger:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--cb-ink); }

  /* ── Empty, loading and toast ── */
  .empty-state { padding: 40px 20px; text-align: center; background: #FFFFFF; border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); }
  .empty-icon { display: none; }
  .empty-title { margin-bottom: 8px; font-family: var(--font-display); font-size: 30px; letter-spacing: 0.04em; color: var(--cb-ink); }
  .empty-sub { max-width: 460px; margin: 0 auto; font-size: 15px; line-height: 1.6; color: var(--text-muted); }

  .spinner {
    width: 30px; height: 30px; border-radius: 50%;
    border: 4px solid rgba(255,255,255,0.35); border-top-color: #FFFFFF;
    animation: spin 0.8s linear infinite;
  }
  .hq-content .spinner { border-color: rgba(17,17,17,0.15); border-top-color: var(--cb-ink); }
  .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; min-height: 50vh; padding: 80px 20px; }
  .loading-text { font-family: var(--font-display); font-size: 28px; letter-spacing: 0.05em; color: #FFFFFF; }
  .hq-content .loading-text { color: var(--cb-ink); }

  .toast {
    position: fixed; right: 24px; bottom: 24px; z-index: 200; max-width: 380px;
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink);
    font-family: var(--font-ui); font-size: 15px; font-weight: 700; line-height: 1.4;
  }
  .toast-success { background: #D9FFF6; color: var(--cb-ink); border: 3px solid var(--cb-ink); }
  .toast-error { background: #FFE0DF; color: var(--cb-ink); border: 3px solid var(--cb-ink); }

  /* ── Welcome (first visit): a splash page ── */
  .hq-welcome-overlay {
    position: fixed; inset: 0; z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 20px; background: rgba(10,20,60,0.8);
  }
  .hq-welcome {
    position: relative; width: 100%; max-width: 640px; max-height: 90vh; overflow-y: auto;
    padding: 36px 36px 32px;
    background: var(--cb-paper); color: var(--cb-ink);
    border: 4px solid var(--cb-ink); box-shadow: 10px 10px 0 var(--cb-ink);
  }
  .hq-welcome-label {
    display: inline-block; padding: 2px 10px;
    background: var(--cb-pink); color: #FFFFFF; border: 2px solid var(--cb-ink);
    font-family: var(--font-display); font-size: 16px; letter-spacing: 0.06em; text-transform: uppercase;
    transform: rotate(-1.5deg);
  }
  .hq-welcome-title {
    display: block; width: fit-content; max-width: 100%;
    margin: 14px 0 12px; padding: 6px 14px 4px;
    background: var(--cb-yellow); border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink);
    font-family: var(--font-display); font-weight: 400; font-size: clamp(26px, 4vw, 36px); line-height: 1.05; letter-spacing: 0.03em;
  }
  .hq-welcome-sub { font-size: 15px; line-height: 1.6; color: var(--text-muted); }
  .hq-welcome-steps { display: grid; gap: 12px; margin: 22px 0; }
  .hq-welcome-step {
    display: flex; align-items: flex-start; gap: 14px; width: 100%;
    padding: 12px 14px; text-align: left;
    background: #FFFFFF; color: var(--cb-ink);
    border: 2.5px solid var(--cb-ink); box-shadow: 3px 3px 0 var(--cb-ink);
    font-family: var(--font-ui);
  }
  button.hq-welcome-step { cursor: pointer; transition: transform 0.08s, box-shadow 0.08s; }
  button.hq-welcome-step:hover { background: #FFF7C2; transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--cb-ink); }
  .hq-welcome-num {
    flex: none; width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    background: var(--cb-yellow); border: 2px solid var(--cb-ink); border-radius: 50%;
    font-family: var(--font-display); font-size: 20px;
  }
  .hq-welcome-text { flex: 1; display: flex; flex-direction: column; gap: 3px; }
  .hq-welcome-text strong { font-size: 16px; font-weight: 800; }
  .hq-welcome-text span { font-size: 14px; line-height: 1.5; color: var(--text-muted); }
  .hq-welcome-go { flex: none; align-self: center; font-family: var(--font-display); font-size: 20px; letter-spacing: 0.04em; color: var(--cb-red); }
  .hq-welcome-ink { margin-bottom: 24px; padding: 14px 16px; background: var(--cb-teal); border: 3px solid var(--cb-ink); box-shadow: 5px 5px 0 var(--cb-ink); }
  .hq-welcome-ink-label { font-family: var(--font-display); font-size: 22px; letter-spacing: 0.04em; }
  .hq-welcome-ink-row { display: flex; flex-wrap: wrap; gap: 14px 28px; margin-top: 6px; }
  .hq-welcome-ink-row div { display: flex; flex-direction: column; }
  .hq-welcome-ink-row strong { font-family: var(--font-display); font-weight: 400; font-size: 38px; line-height: 1; }
  .hq-welcome-ink-row span { font-size: 13px; font-weight: 700; }
  .hq-welcome-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }

  /* ── The submit form popup keeps its white page ── */
  .submit-modal-body .editor-label { color: #8a6510; }
  .submit-modal-body .editor-input { background: #fafafa; border: 1px solid #e5e7eb; color: #111; padding: 12px 16px; box-shadow: none; }
  .submit-modal-body .editor-input:focus { border-color: #C9A84C; }
  .submit-modal-body .editor-textarea { background: #fafafa; border: 1px solid #e5e7eb; color: #111; box-shadow: none; }
  .submit-modal-body .editor-textarea:focus { border-color: #C9A84C; }
  .submit-modal-body .editor-field { margin-bottom: 20px; }
  .submit-modal-body .hq-divider { height: 1px; background: linear-gradient(to right, rgba(201,168,76,0.4), transparent); }
  .submit-modal-body .badge-free { color: #166534; border-color: rgba(22,101,52,0.3); background: rgba(22,101,52,0.06); box-shadow: none; }
  .submit-modal-body .badge-locked { color: #6b7280; border-color: #d1d5db; background: #f3f4f6; box-shadow: none; }

  /* ═══ Tablets ═══ */
  @media (max-width: 1100px) {
    .hq-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .editor-grid { grid-template-columns: minmax(0, 1fr); }
    .payout-grid { grid-template-columns: minmax(0, 1fr); }
  }

  /* ═══ Tablets and phones: the contents become one swipeable strip ═══ */
  @media (max-width: 900px) {
    .hq-body { flex-direction: column; align-items: stretch; gap: 26px; padding: 30px 12px 48px; }
    .hq-sidebar {
      width: auto; flex-direction: row; gap: 8px;
      padding: 18px 10px 10px;
      overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
    }
    .hq-sidebar::-webkit-scrollbar { display: none; }
    .hq-nav-section { display: none; }
    .hq-nav-item {
      flex: none; width: auto; min-height: 44px; padding: 0 14px; white-space: nowrap;
      background: #FFFFFF; border-color: var(--cb-ink);
    }
    .hq-content { padding: 26px 18px 34px; box-shadow: 6px 6px 0 var(--cb-ink); }
  }

  /* ═══ Phones ═══ */
  @media (max-width: 640px) {
    .hq-nav-inner { padding: 0 14px; height: 58px; }
    .hq-nav-sub { display: none; }
    .hq-nav-title { font-size: 20px; }
    .hq-nav-writer { font-size: 16px; max-width: 120px; }
    .hq-body { padding: 28px 10px 40px; }
    .hq-content { padding: 20px 14px 28px; border-width: 3px; box-shadow: 5px 5px 0 var(--cb-ink); }
    .hq-stats { gap: 12px; }
    .hq-stat-value { font-size: 28px; }
    .payout-method-grid { grid-template-columns: minmax(0, 1fr); }
    .hq-welcome { padding: 26px 18px 22px; box-shadow: 6px 6px 0 var(--cb-ink); }
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