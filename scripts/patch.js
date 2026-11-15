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
 * Batch: Studio pass 2 — the home page and its four sub-pages.
 */

const fs = require('fs');
const path = require('path');

const P = 'app/page.tsx';

const EDITS = [

  // ── 1. All home + sub-page styles (same class names, studio look) ───
  {
    file: P, kind: 'block',
    label: 'styles: the studio look for the home page and sub-pages',
    start: 'const TWR_STYLES = `',
    end: 'const WHY_CARDS = [',
    to: `const TWR_STYLES = \`
  /* ═══ The Creators Room home — studio styles ═══
     Colours and fonts come from globals.css (--st-*).
     The old names (--gold, --text-main…) are mapped to studio colours
     so any inline style still using them keeps working. */

  .twr-root {
    --gold: var(--st-postit); --gold-light: var(--st-postit);
    --gold-dim: rgba(255,232,115,0.4); --gold-glow: rgba(255,232,115,0.12);
    --quill: var(--st-pencil-on-mat); --quill-dim: var(--st-pencil-on-mat);
    --text-main: var(--st-on-mat); --text-dim: var(--st-on-mat-dim); --text-faint: rgba(246,241,228,0.62);
    --ink-surface: rgba(0,0,0,0.12); --ink-border: rgba(246,241,228,0.2); --ink-border-gold: rgba(246,241,228,0.4);
    --blue-bright: var(--st-pencil-on-mat);
    position: relative;
    min-height: 100vh;
    background: transparent;
    color: var(--st-on-mat);
    font-family: var(--st-font-ui);
    overflow-x: clip;
  }

  /* ── Buttons ── */
  .twr-btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 52px; padding: 0 26px; box-sizing: border-box;
    background: var(--st-paper); color: var(--st-stamp);
    border: 3px solid var(--st-stamp); outline: 2px solid var(--st-stamp); outline-offset: 3px;
    border-radius: 4px;
    font-family: var(--st-font-ui); font-size: 15px; font-weight: 900;
    letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none;
    transform: rotate(-2deg); transition: transform 0.12s; cursor: pointer;
  }
  .twr-btn-primary:hover { transform: rotate(-0.5deg) scale(1.03); color: var(--st-stamp); }
  .twr-btn-primary:active { transform: rotate(-0.5deg) scale(0.97); }

  .twr-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center;
    min-height: 48px; padding: 0 20px; box-sizing: border-box;
    background: transparent; color: var(--st-on-mat);
    border: 2px dashed var(--st-pencil-on-mat); border-radius: 3px;
    font-family: var(--st-font-ui); font-size: 15px; font-weight: 600;
    text-decoration: none; cursor: pointer;
  }
  .twr-btn-ghost:hover { border-style: solid; border-color: var(--st-on-mat); color: var(--st-on-mat); }

  /* On paper, pencil buttons draw in blue and ink in black */
  .twr-subpage .twr-btn-ghost, .twr-cta .twr-btn-ghost, .twr-founding-banner .twr-btn-ghost {
    border-color: var(--st-pencil); color: var(--st-pencil-text);
  }
  .twr-subpage .twr-btn-ghost:hover, .twr-cta .twr-btn-ghost:hover, .twr-founding-banner .twr-btn-ghost:hover {
    border-color: var(--st-ink); color: var(--st-ink);
  }

  /* ── Hero ── */
  .twr-hero-with-ad {
    max-width: var(--st-max); margin: 0 auto; box-sizing: border-box;
    padding: 56px 32px 40px;
    display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 48px; align-items: center;
  }
  .twr-hero { min-width: 0; }
  .twr-hero-inner { padding: 0; }
  .twr-hero-eyebrow {
    display: inline-block; margin-bottom: 14px;
    font-family: var(--st-font-type); font-size: 14px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--st-on-mat-dim);
  }
  .twr-hero-title {
    margin: 0;
    font-family: var(--st-font-ui); font-weight: 900;
    font-size: clamp(46px, 7vw, 84px); line-height: 0.96; letter-spacing: -0.02em;
    color: var(--st-on-mat);
  }
  .twr-hero-note {
    display: flex; align-items: flex-start; gap: 8px;
    margin: 14px 0 0 4px; max-width: 580px;
    font-family: var(--st-font-hand); font-weight: 700;
    font-size: clamp(24px, 3vw, 31px); line-height: 1.15;
    color: var(--st-pencil-on-mat);
  }
  .twr-hero-note svg { flex: none; margin-top: -4px; }
  .twr-hero-sub {
    margin: 22px 0 30px; max-width: 580px;
    font-family: var(--st-font-type); font-size: 17px; line-height: 1.6;
    color: var(--st-on-mat-dim);
  }
  .twr-hero-actions { display: flex; flex-wrap: wrap; gap: 16px 18px; align-items: center; }

  /* The promo panel, taped to the mat like a photo */
  .twr-hero-ad {
    position: relative;
    background: var(--st-paper); color: var(--st-ink);
    padding: 14px 14px 20px;
    transform: rotate(1.5deg);
    box-shadow: 0 2px 0 rgba(0,0,0,0.1), 0 18px 36px rgba(0,0,0,0.35);
  }
  .twr-hero-ad::before {
    content: ""; position: absolute; z-index: 2;
    top: -12px; left: 50%; width: 90px; height: 24px; margin-left: -45px;
    background: rgba(233,220,180,0.85); transform: rotate(-3deg);
  }

  /* ── The comic page ── */
  .twr-comic-wrap { max-width: var(--st-max); margin: 0 auto 88px; padding: 0 32px; box-sizing: border-box; }
  .twr-comic {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;
    background: #FFFFFF; padding: 18px;
    box-shadow: 0 2px 0 rgba(0,0,0,0.15), 0 24px 50px rgba(0,0,0,0.35);
    transform: rotate(-0.4deg);
  }
  .twr-panel { position: relative; height: clamp(160px, 26vw, 320px); border: 3px solid #141414; overflow: hidden; }
  .twr-panel svg { display: block; width: 100%; height: 100%; }
  .twr-panel-write { background: #FBF8EF; }
  .twr-panel-draw { background: #FFFFFF; }
  .twr-panel-team {
    background-color: #FFE3EF;
    background-image: radial-gradient(var(--st-pink) 1.6px, transparent 1.7px);
    background-size: 13px 13px;
  }
  .twr-panel-pay { background: var(--st-night); }
  .twr-cap {
    position: absolute; top: 12px; left: 12px; z-index: 2;
    background: #FFF6C9; padding: 6px 12px;
    font-family: var(--st-font-type); font-weight: 700;
    font-size: clamp(13px, 1.7vw, 20px); color: #141414;
    box-shadow: 0 1px 2px rgba(0,0,0,0.25);
  }
  .twr-cap::before {
    content: ""; position: absolute; top: -8px; left: -10px;
    width: 40px; height: 16px; background: rgba(233,220,180,0.85); transform: rotate(-24deg);
  }
  .twr-balloon {
    position: absolute; width: 50%; box-sizing: border-box;
    background: #FFFFFF; border: 3px solid #141414; border-radius: 50%;
    padding: clamp(12px, 2.6vw, 30px) clamp(8px, 1.6vw, 18px);
    text-align: center;
    font-family: var(--st-font-comic); font-size: clamp(16px, 2.6vw, 32px);
    line-height: 1; letter-spacing: 0.04em; color: #141414;
  }
  .twr-balloon::after {
    content: ""; position: absolute; bottom: -15px; left: 28%;
    border: 9px solid transparent; border-top: 16px solid #141414; border-bottom: 0;
  }
  .twr-balloon-a { left: 6%; top: 26%; }
  .twr-balloon-b { right: 6%; top: 54%; color: var(--st-night); }
  .twr-balloon-b::after { left: auto; right: 28%; }

  /* ── Page body ── */
  .twr-wrap { max-width: var(--st-max); margin: 0 auto; padding: 0 32px 24px; box-sizing: border-box; }
  .twr-section { margin-bottom: 88px; scroll-margin-top: 96px; }
  .twr-section-accent { display: flex; align-items: flex-end; gap: 14px; margin-bottom: 26px; }
  .twr-section-bar, .twr-divider { display: none; }
  .twr-section-eyebrow {
    display: block; margin-bottom: 4px;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 26px; line-height: 1;
    color: var(--st-pencil-on-mat);
    transform: rotate(-1.5deg); transform-origin: left;
  }
  .twr-section-title {
    margin: 0;
    font-family: var(--st-font-ui); font-weight: 900;
    font-size: clamp(30px, 4.4vw, 44px); line-height: 1.05; letter-spacing: -0.01em;
    color: var(--st-on-mat);
  }

  /* ── Founding 100: a sign-up sheet ── */
  .twr-founding-banner {
    position: relative;
    background-color: var(--st-paper); color: var(--st-ink);
    background-image: linear-gradient(90deg, transparent 104px, #E0605A 104px, #E0605A 106px, transparent 106px);
    padding: 40px 44px 40px 132px;
    box-shadow: 0 2px 0 rgba(0,0,0,0.08), 0 18px 36px rgba(0,0,0,0.32);
  }
  .twr-founding-num {
    position: absolute; left: 18px; top: 36px; width: 74px; padding: 12px 0;
    text-align: center;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 38px; line-height: 1;
    color: var(--st-stamp);
    border: 3px solid var(--st-stamp); border-radius: 50%;
    transform: rotate(-8deg);
  }
  .twr-founding-content { position: relative; }
  .twr-founding-label {
    display: block;
    font-family: var(--st-font-type); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--st-margin-red);
  }
  .twr-founding-headline {
    margin: 8px 0 10px;
    font-family: var(--st-font-ui); font-weight: 900;
    font-size: clamp(28px, 4vw, 40px); line-height: 1.1; color: var(--st-ink);
  }
  .twr-founding-sub {
    margin: 0 0 22px; max-width: 640px;
    font-family: var(--st-font-type); font-size: 16px; line-height: 1.6; color: var(--st-ink-soft);
  }
  .twr-founding-spots { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
  .twr-spot-dot {
    width: 22px; height: 22px; box-sizing: border-box;
    border: 2px dashed var(--st-pencil); border-radius: 3px;
  }
  .twr-spot-dot.taken { border: 2px solid var(--st-ink); background: var(--st-ink); }
  .twr-founding-count {
    margin: 0 0 24px;
    font-family: var(--st-font-hand); font-size: 27px; font-weight: 700; line-height: 1.1;
    color: var(--st-pencil-text);
  }
  .twr-founding-count strong { color: var(--st-stamp); }

  /* ── Why TTL: index cards pinned to cork ── */
  .twr-why-grid {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px;
    padding: 40px 30px 44px;
    border: 12px solid var(--st-cork-frame); border-radius: 4px;
    background-color: var(--st-cork);
    background-image: radial-gradient(rgba(90,55,25,0.35) 1.2px, transparent 1.4px), radial-gradient(rgba(255,235,200,0.25) 1px, transparent 1.2px);
    background-size: 9px 11px, 13px 7px;
    background-position: 0 0, 4px 3px;
    box-shadow: inset 0 0 36px rgba(60,30,10,0.35), 0 16px 34px rgba(0,0,0,0.3);
  }
  .twr-why-card {
    --pin: var(--st-stamp);
    position: relative;
    background: var(--st-paper); color: var(--st-ink);
    padding: 20px 20px 24px;
    box-shadow: 0 6px 14px rgba(40,20,5,0.35);
    transform: rotate(-1.2deg); transition: transform 0.15s;
  }
  .twr-why-card:nth-child(2) { --pin: #14C9B5; transform: rotate(1deg); }
  .twr-why-card:nth-child(3) { --pin: #E8B730; transform: rotate(-0.6deg); }
  .twr-why-card:hover { transform: rotate(0deg) translateY(-3px); }
  .twr-why-card::before {
    content: ""; position: absolute; top: -9px; left: calc(50% - 10px);
    width: 20px; height: 20px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6) 0 3px, transparent 4px), var(--pin);
    box-shadow: 0 2px 3px rgba(0,0,0,0.4);
  }
  .twr-why-num {
    font-family: var(--st-font-type); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; color: var(--st-margin-red);
  }
  .twr-why-title {
    margin-top: 6px; padding-bottom: 10px; border-bottom: 2px solid #E0605A;
    font-family: var(--st-font-ui); font-weight: 800; font-size: 21px; line-height: 1.15;
  }
  .twr-why-text {
    margin-top: 10px;
    font-family: var(--st-font-type); font-size: 15px; line-height: 26px; color: #2A2418;
    background-image: repeating-linear-gradient(transparent 0 25px, #9CC3E6 25px 26px);
  }

  /* ── How it works: a typed page with a margin ── */
  .twr-steps {
    display: flex; flex-direction: column;
    background-color: var(--st-paper); color: var(--st-ink);
    background-image: linear-gradient(90deg, transparent 72px, #E0605A 72px, #E0605A 74px, transparent 74px);
    padding: 14px 0;
    box-shadow: 0 2px 0 rgba(0,0,0,0.08), 0 18px 36px rgba(0,0,0,0.32);
  }
  .twr-step { display: flex; align-items: center; gap: 18px; padding: 22px 28px 22px 0; border-bottom: 1px solid #9CC3E6; }
  .twr-step:last-child { border-bottom: none; }
  .twr-step-num {
    width: 72px; flex-shrink: 0; text-align: center;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 30px; line-height: 1;
    color: var(--st-pencil-text);
  }
  .twr-step-body { flex: 1; min-width: 0; padding-left: 14px; }
  .twr-step-title { font-family: var(--st-font-ui); font-weight: 800; font-size: 20px; line-height: 1.2; }
  .twr-step-text { margin-top: 6px; font-family: var(--st-font-type); font-size: 15px; line-height: 1.6; color: var(--st-ink-soft); }
  .twr-step-badge {
    flex-shrink: 0; white-space: nowrap;
    padding: 6px 10px;
    font-family: var(--st-font-ui); font-size: 12px; font-weight: 900;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--st-stamp); border: 2px solid var(--st-stamp);
    transform: rotate(-4deg);
  }

  /* ── Formats: post-its ── */
  .twr-formats-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px 26px; }
  .twr-format-card {
    box-sizing: border-box; min-height: 120px;
    background: var(--st-postit); color: #2A2418;
    padding: 20px 20px 22px;
    box-shadow: 0 10px 18px rgba(0,0,0,0.3);
    transform: rotate(-1.5deg); transition: transform 0.15s;
  }
  .twr-format-card:nth-child(3n+2) { background: var(--st-postit-teal); transform: rotate(1.2deg); }
  .twr-format-card:nth-child(3n+3) { background: var(--st-postit-pink); transform: rotate(-0.5deg); }
  .twr-format-card:hover { transform: rotate(0deg) translateY(-3px); }
  .twr-format-icon { display: none; }
  .twr-format-label { font-family: var(--st-font-hand); font-weight: 700; font-size: 29px; line-height: 1.05; }
  .twr-format-desc { margin-top: 6px; font-family: var(--st-font-type); font-size: 14px; line-height: 1.45; }

  /* ── The Ink economy: a sheet and a dry-erase board ── */
  .twr-ink-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px; align-items: start; }
  .twr-ink-panel {
    background: #FDFDFB; color: #2A4F78;
    border: 10px solid #B9BFC5; border-radius: 4px;
    padding: 24px 26px 30px;
    box-shadow: 0 12px 26px rgba(0,0,0,0.3), inset 0 0 18px rgba(120,130,140,0.12);
  }
  .twr-ink-panel-gold {
    background: var(--st-paper); color: var(--st-ink);
    border: none; border-radius: 0;
    padding: 30px 32px 32px;
    box-shadow: 0 2px 0 rgba(0,0,0,0.08), 0 18px 36px rgba(0,0,0,0.32);
  }
  .twr-ink-label {
    font-family: var(--st-font-hand); font-weight: 700; font-size: 27px; line-height: 1.1;
    color: #1F7A6E;
  }
  .twr-ink-panel-gold .twr-ink-label {
    font-family: var(--st-font-type); font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--st-margin-red);
  }
  .twr-ink-num {
    margin: 8px 0 16px;
    font-family: var(--st-font-ui); font-weight: 900; font-size: 68px; line-height: 1;
    color: #1E2A6B;
  }
  .twr-ink-text { margin: 0; font-family: var(--st-font-type); font-size: 16px; line-height: 1.65; color: var(--st-ink-soft); }
  .twr-ink-flow { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; counter-reset: inkstep; }
  .twr-ink-flow-step { display: flex; align-items: baseline; gap: 10px; counter-increment: inkstep; }
  .twr-ink-flow-step::before {
    content: counter(inkstep) "."; min-width: 22px;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 26px; line-height: 1;
    color: var(--st-stamp);
  }
  .twr-ink-flow-icon { display: none; }
  .twr-ink-flow-text { font-family: var(--st-font-hand); font-weight: 600; font-size: 23px; line-height: 1.25; color: #2A4F78; }
  .twr-ink-flow-text strong { color: #1F7A6E; font-weight: 700; }

  /* ── Rules: slips of paper taped to the mat ── */
  .twr-rules-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px 28px; }
  .twr-rule-card {
    position: relative; display: flex; gap: 14px; align-items: flex-start;
    background: var(--st-paper); color: var(--st-ink);
    padding: 24px 22px 22px 18px;
    box-shadow: 0 8px 18px rgba(0,0,0,0.28);
    transform: rotate(-0.5deg);
  }
  .twr-rule-card:nth-child(even) { transform: rotate(0.6deg); }
  .twr-rule-card::before {
    content: ""; position: absolute; top: -10px; left: 50%;
    width: 70px; height: 20px; margin-left: -35px;
    background: rgba(233,220,180,0.85); transform: rotate(-2deg);
  }
  .twr-rule-icon {
    flex-shrink: 0; width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0;
  }
  .twr-rule-icon.yes::before { content: "\\\\2713"; font-family: var(--st-font-hand); font-weight: 700; font-size: 32px; line-height: 1; color: #2E6B45; }
  .twr-rule-icon.no::before { content: "\\\\2715"; font-family: var(--st-font-hand); font-weight: 700; font-size: 26px; line-height: 1; color: var(--st-stamp); }
  .twr-rule-title { font-family: var(--st-font-ui); font-weight: 800; font-size: 18px; line-height: 1.2; }
  .twr-rule-text { margin-top: 6px; font-family: var(--st-font-type); font-size: 14.5px; line-height: 1.55; color: var(--st-ink-soft); }

  /* ── Call to action: an application slip ── */
  .twr-cta {
    position: relative; margin-bottom: 40px;
    background: var(--st-paper); color: var(--st-ink);
    padding: 44px 48px;
    box-shadow: 0 2px 0 rgba(0,0,0,0.08), 0 18px 36px rgba(0,0,0,0.32);
    transform: rotate(0.3deg);
  }
  .twr-cta::before {
    content: "APPLICATION SLIP"; display: block; margin-bottom: 10px;
    font-family: var(--st-font-type); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; color: var(--st-margin-red);
  }
  .twr-cta-title {
    margin: 0;
    font-family: var(--st-font-ui); font-weight: 900;
    font-size: clamp(28px, 4vw, 40px); line-height: 1.1;
  }
  .twr-cta-sub { margin: 12px 0 28px; max-width: 660px; font-family: var(--st-font-type); font-size: 17px; line-height: 1.6; color: var(--st-ink-soft); }
  .twr-cta-actions { display: flex; flex-wrap: wrap; gap: 18px 22px; align-items: center; }

  /* ── More pages (Guidelines, FAQs, Copyright, Contact) ── */
  .twr-page-links { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 14px; margin-bottom: 24px; }
  .twr-page-links-label { font-family: var(--st-font-hand); font-weight: 700; font-size: 26px; color: var(--st-pencil-on-mat); margin-right: 4px; }

  /* ── The older in-page footer (kept for any page still using it) ── */
  .twr-footer { margin-top: 60px; padding: 30px 0; border-top: 1px solid rgba(246,241,228,0.2); font-family: var(--st-font-type); }
  .twr-footer-top { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 18px; }
  .twr-footer-brand { display: flex; align-items: center; gap: 12px; }
  .twr-footer-logo {
    width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
    border: 2.5px solid var(--st-on-mat); border-radius: 50%;
    font-family: var(--st-font-ui); font-size: 13px; font-weight: 900; color: var(--st-on-mat);
    transform: rotate(-8deg); text-decoration: none;
  }
  .twr-footer-brand-main { font-size: 18px; font-weight: 700; color: var(--st-on-mat); }
  .twr-footer-brand-sub, .twr-footer-copy { font-size: 13px; color: var(--st-on-mat-dim); }
  .twr-footer-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .twr-footer-pages { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-top: 18px; }
  .twr-footer-page-link {
    min-height: 44px; background: none; border: none; cursor: pointer;
    font-family: var(--st-font-ui); font-size: 14px; font-weight: 600; color: var(--st-on-mat);
    text-decoration: underline; text-decoration-color: var(--st-pencil-on-mat); text-underline-offset: 5px;
  }
  .twr-footer-page-link:hover { color: #FFFFFF; }
  .twr-footer-page-sep { color: var(--st-on-mat-dim); }

  /* ═══ Sub-pages: a typed manuscript page on the mat ═══ */
  .twr-subpage {
    --text-main: var(--st-ink); --text-dim: var(--st-ink-soft); --text-faint: #6B6250;
    --gold: var(--st-margin-red); --gold-light: var(--st-margin-red); --gold-dim: var(--st-paper-line);
    --quill: var(--st-pencil-text); --quill-dim: var(--st-pencil-text);
    --ink-border: var(--st-paper-line); --ink-border-gold: var(--st-ink); --ink-surface: rgba(0,0,0,0.03);
    --blue-bright: var(--st-pencil-text);
    position: relative; box-sizing: border-box;
    max-width: 860px; margin: 48px auto 0;
    padding: 48px 56px 56px 92px;
    background-color: var(--st-paper); color: var(--st-ink);
    background-image: linear-gradient(90deg, transparent 62px, #E0605A 62px, #E0605A 64px, transparent 64px);
    box-shadow: 0 2px 0 rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.35);
    animation: twr-fadein 0.3s ease;
  }
  @keyframes twr-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .twr-subpage-back {
    display: inline-flex; align-items: center; min-height: 44px; padding: 0 14px; margin-bottom: 22px;
    background: transparent; color: var(--st-pencil-text);
    border: 2px dashed var(--st-pencil); border-radius: 3px;
    font-family: var(--st-font-ui); font-size: 15px; font-weight: 600; cursor: pointer;
  }
  .twr-subpage-back:hover { border-style: solid; border-color: var(--st-ink); color: var(--st-ink); }
  .twr-subpage-eyebrow {
    display: block;
    font-family: var(--st-font-type); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--st-margin-red);
  }
  .twr-subpage-title {
    margin: 8px 0 16px;
    font-family: var(--st-font-ui); font-weight: 900;
    font-size: clamp(36px, 6vw, 58px); line-height: 1; letter-spacing: -0.02em; color: var(--st-ink);
  }
  .twr-subpage-intro { margin: 0 0 32px; max-width: 640px; font-family: var(--st-font-type); font-size: 18px; line-height: 1.65; color: var(--st-ink-soft); }
  .twr-content-block { margin-bottom: 36px; }
  .twr-content-h2 {
    display: flex; align-items: center; gap: 10px; margin: 0 0 14px;
    font-family: var(--st-font-ui); font-weight: 800; font-size: 24px; line-height: 1.2; color: var(--st-ink);
  }
  .twr-content-h2-bar { width: 22px; height: 3px; flex-shrink: 0; background: var(--st-pencil); }
  .twr-content-h2-bar-quill { background: #1F7A6E; }
  .twr-content-p { margin: 0 0 14px; font-family: var(--st-font-type); font-size: 16px; line-height: 1.75; color: #2A2418; }
  .twr-content-p a { color: var(--st-pencil-text); text-decoration: underline; text-underline-offset: 3px; }
  .twr-content-p a:hover { color: var(--st-ink); }

  .twr-checklist { display: flex; flex-direction: column; gap: 10px; }
  .twr-checklist-item {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 12px 14px; border: 1px solid #9CC3E6; background: rgba(156,195,230,0.08);
  }
  .twr-checklist-icon {
    position: relative; flex-shrink: 0; width: 18px; height: 18px; margin-top: 3px;
    border: 2px solid var(--st-ink); border-radius: 2px; font-size: 0;
  }
  .twr-checklist-icon::after {
    content: "\\\\2713"; position: absolute; left: 1px; top: -11px;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 26px; line-height: 1; color: #2E6B45;
  }
  .twr-checklist-text { font-family: var(--st-font-type); font-size: 15.5px; line-height: 1.6; color: #2A2418; }
  .twr-checklist-text strong { color: var(--st-ink); font-weight: 700; }

  .twr-info-panel {
    margin: 24px 0; padding: 20px 22px;
    background: var(--st-postit); color: #2A2418;
    box-shadow: 0 8px 16px rgba(0,0,0,0.18); transform: rotate(-0.6deg);
  }
  .twr-info-panel-quill { background: var(--st-postit-teal); transform: rotate(0.5deg); }
  .twr-info-panel-label {
    display: block; margin-bottom: 8px;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 25px; line-height: 1; color: #2A2418;
  }
  .twr-info-panel-label-quill { color: #1F4F49; }
  .twr-info-panel-text { font-family: var(--st-font-type); font-size: 15.5px; line-height: 1.6; color: #2A2418; }
  .twr-info-panel-text strong, .twr-info-panel-quill .twr-info-panel-text strong { color: var(--st-ink); }

  .twr-faq-list { display: flex; flex-direction: column; border-top: 2px solid var(--st-ink); }
  .twr-faq-item { border-bottom: 1px solid #9CC3E6; }
  .twr-faq-item.open { background: rgba(255,232,115,0.2); }
  .twr-faq-q {
    display: flex; justify-content: space-between; align-items: center; gap: 14px;
    width: 100%; min-height: 56px; padding: 14px 6px;
    background: none; border: none; cursor: pointer; text-align: left; color: var(--st-ink);
  }
  .twr-faq-q-text { font-family: var(--st-font-ui); font-weight: 700; font-size: 17px; line-height: 1.35; }
  .twr-faq-arrow {
    flex-shrink: 0; transition: transform 0.2s;
    font-family: var(--st-font-hand); font-weight: 700; font-size: 22px; line-height: 1; color: var(--st-pencil-text);
  }
  .twr-faq-item.open .twr-faq-arrow { transform: rotate(180deg); color: var(--st-stamp); }
  .twr-faq-a { display: none; padding: 0 6px 18px; font-family: var(--st-font-type); font-size: 15.5px; line-height: 1.7; color: #2A2418; }
  .twr-faq-item.open .twr-faq-a { display: block; }

  .twr-contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin-bottom: 20px; }
  .twr-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .twr-field-label {
    font-family: var(--st-font-type); font-size: 13px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase; color: var(--st-margin-red);
  }
  .twr-field-input, .twr-field-select, .twr-field-textarea {
    width: 100%; box-sizing: border-box; min-height: 46px; padding: 10px 4px;
    background: transparent; color: var(--st-ink);
    border: none; border-bottom: 2px dashed var(--st-pencil); border-radius: 0;
    font-family: var(--st-font-type); font-size: 17px; outline: none;
  }
  .twr-field-textarea {
    min-height: 160px; padding: 12px; resize: vertical; line-height: 26px;
    border: 2px dashed var(--st-pencil);
    background-image: repeating-linear-gradient(transparent 0 37px, #9CC3E6 37px 38px);
    background-position: 0 0;
  }
  .twr-field-input::placeholder, .twr-field-textarea::placeholder { color: #8A8170; }
  .twr-field-input:focus, .twr-field-select:focus, .twr-field-textarea:focus { border-style: solid; border-color: var(--st-ink); }
  .twr-field-select option { background: #FFFFFF; color: var(--st-ink); }

  .twr-contact-sent { text-align: center; padding: 30px 10px; }
  .twr-contact-sent-icon { display: none; }
  .twr-contact-sent-title { font-family: var(--st-font-ui); font-weight: 900; font-size: 28px; color: var(--st-ink); margin-bottom: 10px; }
  .twr-contact-sent-text { font-family: var(--st-font-type); font-size: 16px; line-height: 1.6; color: var(--st-ink-soft); }

  .twr-copyright-highlight {
    margin: 26px 0; padding: 22px 24px;
    border: 3px solid var(--st-stamp); outline: 2px solid var(--st-stamp); outline-offset: 3px;
    transform: rotate(-0.4deg);
  }
  .twr-copyright-highlight p { margin: 0; font-family: var(--st-font-type); font-weight: 700; font-size: 18px; line-height: 1.5; color: var(--st-ink); }

  /* ═══ Tablets ═══ */
  @media (max-width: 1023px) {
    .twr-hero-with-ad { grid-template-columns: minmax(0, 1fr); padding: 40px 24px 32px; }
    .twr-hero-ad { display: none; }
  }

  @media (max-width: 900px) {
    .twr-wrap { padding: 0 24px 24px; }
    .twr-comic-wrap { padding: 0 24px; }
    .twr-why-grid { grid-template-columns: minmax(0, 1fr); padding: 34px 22px 36px; }
    .twr-formats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .twr-ink-grid { grid-template-columns: minmax(0, 1fr); }
    .twr-rules-grid { grid-template-columns: minmax(0, 1fr); }
    .twr-contact-grid { grid-template-columns: minmax(0, 1fr); }
  }

  /* ═══ Phones ═══ */
  @media (max-width: 640px) {
    .twr-hero-with-ad { padding: 28px 16px 26px; }
    .twr-hero-actions { gap: 14px; }
    .twr-comic-wrap { padding: 0 16px; margin-bottom: 64px; }
    .twr-comic { padding: 10px; gap: 8px; }
    .twr-panel { border-width: 2px; }
    .twr-balloon { border-width: 2px; }
    .twr-wrap { padding: 0 16px 16px; }
    .twr-section { margin-bottom: 64px; }
    .twr-founding-banner { padding: 28px 20px; background-image: none; }
    .twr-founding-num { position: static; display: inline-block; width: 64px; font-size: 30px; padding: 10px 0; margin-bottom: 14px; }
    .twr-why-grid { border-width: 8px; padding: 28px 16px 30px; gap: 26px; }
    .twr-steps { background-image: linear-gradient(90deg, transparent 46px, #E0605A 46px, #E0605A 48px, transparent 48px); }
    .twr-step { flex-wrap: wrap; gap: 10px 0; padding: 18px 16px 18px 0; }
    .twr-step-num { width: 46px; font-size: 24px; }
    .twr-step-body { flex: 1 1 calc(100% - 60px); padding-left: 12px; }
    .twr-step-badge { margin-left: 58px; }
    .twr-format-card { min-height: 0; padding: 16px 14px 18px; }
    .twr-format-label { font-size: 25px; }
    .twr-ink-panel { padding: 20px 18px 24px; border-width: 8px; }
    .twr-ink-panel-gold { padding: 24px 20px; }
    .twr-ink-num { font-size: 54px; }
    .twr-cta { padding: 30px 22px; }
    .twr-subpage { margin: 24px 12px 0; padding: 30px 20px 36px 40px; background-image: linear-gradient(90deg, transparent 26px, #E0605A 26px, #E0605A 28px, transparent 28px); }
  }

  @media (max-width: 380px) {
    .twr-formats-grid { grid-template-columns: minmax(0, 1fr); }
  }
\`;

// =========================
// Data
// =========================
`,
  },

  // ── 2. Data: comics belong here too ──────────────────────────────────
  {
    file: P, kind: 'exact',
    label: 'formats: add Comics & Manga',
    from: `const FORMATS = [`,
    to: `const FORMATS = [
  { icon: "", label: "Comics & Manga", desc: "Pages, panels and webtoons, published in The Galleria" },`,
  },
  {
    file: P, kind: 'exact',
    label: 'steps: submit covers stories and comics',
    from: `{ num: "01", title: "Submit Your Story", text: "Fill out the submission form with your story, genre, and a short description. We review every submission personally.", badge: "Free" },`,
    to: `{ num: "01", title: "Submit Your Work", text: "Fill out the submission form with your story or comic, genre, and a short description. We review every submission personally.", badge: "Free" },`,
  },
  {
    file: P, kind: 'exact',
    label: 'steps: comics go to The Galleria',
    from: `text: "Approved stories appear in the Reading Room and Browse All Stories pages, searchable by genre and author."`,
    to: `text: "Approved stories appear in the Reading Room and comics in The Galleria, searchable by genre and creator."`,
  },

  // ── 3. Hero: The Creators Room, plus the comic page ──────────────────
  {
    file: P, kind: 'block',
    label: 'hero: The Creators Room, a pencil note, and the four-panel comic page',
    start: '{/* HERO */}',
    end: '{/* MAIN CONTENT */}',
    to: `{/* HERO */}
            <div className="twr-hero-with-ad">
              <div className="twr-hero">
                <div className="twr-hero-inner">
                  <span className="twr-hero-eyebrow">The Tiniest Library</span>
                  <h1 className="twr-hero-title">The Creators Room</h1>
                  <div className="twr-hero-note">
                    <svg width="58" height="38" viewBox="0 0 64 40" aria-hidden="true">
                      <path d="M4 4 C 10 26, 30 34, 56 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M48 22 L 57 30 L 47 36" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>a studio for writers and artists. bring a book, a comic, or half of one.</span>
                  </div>
                  <p className="twr-hero-sub">
                    A home for independent writers and artists. Publish your stories, earn through Ink,
                    keep your copyright, and build the readership your work deserves.
                  </p>
                  <div className="twr-hero-actions">
                    <a href="/apply" className="twr-btn-primary">Apply to Join</a>
                    <a href="#how" className="twr-btn-ghost">How it works</a>
                    <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-ghost">Visit the Reading Room</a>
                  </div>
                </div>
              </div>
              <div className="twr-hero-ad">
                <WritersRoomAdPanel />
              </div>
            </div>

            {/* THE COMIC PAGE */}
            <div className="twr-comic-wrap">
              <div className="twr-comic">

                <div className="twr-panel twr-panel-write">
                  <div className="twr-cap">You write.</div>
                  <svg viewBox="0 0 520 330" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A sheet of typed paper rolling out of a typewriter">
                    <rect x="150" y="40" width="230" height="250" fill="#FFFFFF" stroke="#141414" strokeWidth="2.5" />
                    <g fill="#141414">
                      <rect x="172" y="74" width="170" height="7" />
                      <rect x="172" y="96" width="186" height="7" />
                      <rect x="172" y="118" width="150" height="7" />
                      <rect x="172" y="140" width="178" height="7" />
                      <rect x="172" y="162" width="120" height="7" />
                      <rect x="172" y="198" width="160" height="7" />
                      <rect x="172" y="220" width="96" height="7" />
                      <rect x="272" y="218" width="3" height="12" />
                    </g>
                    <rect x="96" y="246" width="338" height="64" rx="10" fill="#141414" />
                    <rect x="120" y="236" width="290" height="16" rx="4" fill="#3B3B3B" />
                    <g fill="#FBF8EF">
                      <circle cx="140" cy="276" r="7" /><circle cx="166" cy="276" r="7" /><circle cx="192" cy="276" r="7" />
                      <circle cx="218" cy="276" r="7" /><circle cx="244" cy="276" r="7" /><circle cx="270" cy="276" r="7" />
                      <circle cx="296" cy="276" r="7" /><circle cx="322" cy="276" r="7" /><circle cx="348" cy="276" r="7" />
                      <circle cx="374" cy="276" r="7" /><circle cx="400" cy="276" r="7" />
                    </g>
                  </svg>
                </div>

                <div className="twr-panel twr-panel-draw">
                  <div className="twr-cap">You draw.</div>
                  <svg viewBox="0 0 520 330" preserveAspectRatio="xMidYMid slice" role="img" aria-label="A head sketched in blue pencil, half inked over in black">
                    <g fill="none" stroke="#7FB2E5" strokeWidth="2" strokeLinecap="round">
                      <circle cx="262" cy="160" r="86" />
                      <line x1="262" y1="64" x2="262" y2="262" />
                      <line x1="170" y1="168" x2="354" y2="168" />
                      <line x1="190" y1="206" x2="334" y2="206" />
                      <path d="M200 120 Q 262 60 326 116" />
                      <path d="M214 230 Q 262 300 312 232" />
                      <line x1="120" y1="300" x2="420" y2="40" strokeDasharray="4 7" />
                    </g>
                    <g fill="none" stroke="#141414" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M262 74 C 210 74, 178 112, 178 160 C 178 214, 214 258, 262 262" />
                      <path d="M212 168 Q 228 156 244 168" />
                      <path d="M240 206 Q 254 214 262 210" />
                      <path d="M262 168 L 252 196 L 264 198" />
                    </g>
                    <g transform="rotate(-38 430 236)">
                      <rect x="380" y="226" width="130" height="18" fill="#6FA8DC" stroke="#141414" strokeWidth="2" />
                      <path d="M380 226 L 356 235 L 380 244 Z" fill="#E8D3B0" stroke="#141414" strokeWidth="2" />
                      <path d="M362 233 L 356 235 L 362 237 Z" fill="#3570A8" />
                    </g>
                  </svg>
                </div>

                <div className="twr-panel twr-panel-team">
                  <div className="twr-cap">Or you team up.</div>
                  <div className="twr-balloon twr-balloon-a">I&apos;ll write it.</div>
                  <div className="twr-balloon twr-balloon-b">I&apos;ll draw it.</div>
                </div>

                <div className="twr-panel twr-panel-pay">
                  <div className="twr-cap">Every unlock pays you.</div>
                  <svg viewBox="0 0 520 330" preserveAspectRatio="xMidYMid slice" role="img" aria-label="An ink bottle filling up as readers unlock chapters">
                    <g fill="#14F1D9">
                      <path d="M300 70 q 8 14 0 20 q -8 -6 0 -20z" />
                      <path d="M330 40 q 6 11 0 16 q -6 -5 0 -16z" />
                      <path d="M276 30 q 5 9 0 13 q -5 -4 0 -13z" />
                    </g>
                    <rect x="238" y="108" width="64" height="30" fill="#0A0420" stroke="#F6F1E4" strokeWidth="3" />
                    <path d="M196 150 Q 196 138 210 138 L 330 138 Q 344 138 344 150 L 344 280 Q 344 296 328 296 L 212 296 Q 196 296 196 280 Z" fill="none" stroke="#F6F1E4" strokeWidth="3" />
                    <path d="M199 206 C 240 196, 300 216, 341 204 L 341 280 Q 341 293 328 293 L 212 293 Q 199 293 199 280 Z" fill="#14F1D9" />
                    <rect x="214" y="226" width="112" height="40" fill="#FBF8EF" />
                    <text x="270" y="252" textAnchor="middle" fontFamily="Courier Prime, monospace" fontWeight="700" fontSize="16" fill="#0A0420">INK</text>
                    <text x="270" y="318" textAnchor="middle" fontFamily="Courier Prime, monospace" fontSize="15" fill="#F6F1E4">70% of every unlock · 80% Founding 100</text>
                  </svg>
                </div>

              </div>
            </div>

            `,
  },

  // ── 4. Small markup fixes ────────────────────────────────────────────
  {
    file: P, kind: 'exact',
    label: 'founding: spots-left line in handwriting',
    from: `<p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, color: 'var(--gold-light)', marginBottom: 24, letterSpacing: '0.08em' }}>`,
    to: `<p className="twr-founding-count">`,
  },
  {
    file: P, kind: 'exact',
    label: 'rules: a pencil tick or a red cross instead of emoji',
    from: `<span className="twr-rule-icon">{r.icon}</span>`,
    to: `<span className={r.icon === "🚫" ? "twr-rule-icon no" : "twr-rule-icon yes"} aria-hidden="true">{r.icon}</span>`,
  },
  {
    file: P, kind: 'exact',
    label: 'rules: guidelines button at full size',
    from: `<button className="twr-btn-ghost" style={{ fontSize: '10px', padding: '10px 22px' }} onClick={() => goPage('guidelines')}>`,
    to: `<button className="twr-btn-ghost" onClick={() => goPage('guidelines')}>`,
  },
  {
    file: P, kind: 'exact',
    label: 'cta: apply button at full size',
    from: `className="twr-btn-primary" style={{ fontSize: '11px', padding: '16px 36px' }}`,
    to: `className="twr-btn-primary"`,
  },
  {
    file: P, kind: 'exact',
    label: 'cta: reading room button at full size',
    from: `className="twr-btn-ghost" style={{ fontSize: '11px', padding: '16px 36px' }}`,
    to: `className="twr-btn-ghost"`,
  },

  // ── 5. Footer runs the full width of the mat; sub-pages reachable ────
  {
    file: P, kind: 'block',
    label: 'footer: full-width mat edge, plus links to Guidelines, FAQs, Copyright, Contact',
    start: '{/* FOOTER */}',
    end: '{/* Footer on sub-pages */}',
    to: `{/* MORE PAGES */}
              <div className="twr-page-links">
                <span className="twr-page-links-label">More on the desk:</span>
                {NAV_PAGES.map(p => (
                  <button key={p.key} className="twr-btn-ghost" onClick={() => goPage(p.key)}>{p.label}</button>
                ))}
              </div>

              {/* FOOTER */}
            </div>
            <TWRFooter />
          </>
        )}

        `,
  },
  {
    file: P, kind: 'exact',
    label: 'sub-pages: footer runs the full width too',
    from: `<div style={{ maxWidth: 900, margin: '0 auto', padding: '0 40px 60px' }}>`,
    to: `<div className="twr-subpage-footer">`,
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