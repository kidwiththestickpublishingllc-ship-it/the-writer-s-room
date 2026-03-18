"use client";

import React, { useState } from "react";

// =========================
// Constants
// =========================
const TTL_SUBMIT_URL = "https://www.the-tiniest-library.com/new-page-1";
const TTL_MAIN_URL = "https://www.the-tiniest-library.com";
const TTL_READING_ROOM_URL = "https://the-reading-room-three.vercel.app/reading-room";

// =========================
// Styles
// =========================
const TWR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&family=Press+Start+2P&display=swap');

  :root {
    --gold: #C9A84C;
    --gold-light: #E2C97E;
    --gold-dim: rgba(201,168,76,0.38);
    --gold-glow: rgba(201,168,76,0.13);
    --blue: #6495ED;
    --blue-dim: rgba(100,149,237,0.22);
    --blue-bright: #84b0f5;
    --ink-bg: #0a0a0a;
    --ink-surface: #111111;
    --ink-surface2: #181818;
    --ink-border: rgba(255,255,255,0.07);
    --ink-border-gold: rgba(201,168,76,0.26);
    --text-main: #f0ece2;
    --text-dim: rgba(232,228,218,0.45);
    --text-faint: rgba(232,228,218,0.25);
    --quill: #a78bfa;
    --quill-dim: rgba(167,139,250,0.25);
    --quill-glow: rgba(167,139,250,0.12);
  }

  .twr-root {
    min-height: 100vh;
    background: var(--ink-bg);
    font-family: 'Syne', sans-serif;
    color: var(--text-main);
    position: relative;
    overflow-x: hidden;
  }

  .twr-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
    opacity: 0.35;
  }

  /* NAV */
  .twr-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 40;
    background: rgba(8,8,8,0.96);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--ink-border-gold);
    box-shadow: 0 2px 40px rgba(0,0,0,0.7);
  }

  .twr-nav-gold-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), var(--quill), transparent);
  }

  .twr-nav-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .twr-nav-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .twr-nav-logo-badge {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700; color: #000;
  }

  .twr-nav-brand-main {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 400;
    color: var(--gold-light); letter-spacing: 0.02em;
  }

  .twr-nav-brand-sub {
    font-family: 'Syne', sans-serif;
    font-size: 10px; font-weight: 500;
    color: rgba(255,255,255,0.32);
    letter-spacing: 0.1em; text-transform: uppercase;
  }

  .twr-nav-links {
    display: flex; align-items: center; gap: 2px;
  }

  .twr-nav-link {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--text-dim); text-decoration: none;
    padding: 6px 14px; border-radius: 4px;
    border: 1px solid transparent;
    transition: all 0.2s; white-space: nowrap;
  }

  .twr-nav-link:hover {
    color: var(--gold-light);
    border-color: var(--ink-border-gold);
    background: var(--gold-glow);
  }

  .twr-nav-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  .twr-nav-badge {
    display: flex; align-items: center; gap: 6px;
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    color: var(--quill);
    border: 1px solid var(--quill-dim);
    background: var(--quill-glow);
    padding: 6px 14px; border-radius: 999px;
    white-space: nowrap;
  }

  .twr-btn-primary {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: #000;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    border: none; padding: 13px 28px; border-radius: 8px;
    text-decoration: none; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    font-weight: 700; transition: opacity 0.2s;
  }

  .twr-btn-primary:hover { opacity: 0.88; }

  .twr-btn-ghost {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(232,228,218,0.6);
    background: transparent;
    border: 1px solid rgba(232,228,218,0.15);
    padding: 13px 28px; border-radius: 8px;
    text-decoration: none; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    transition: all 0.2s;
  }

  .twr-btn-ghost:hover {
    color: var(--gold-light);
    border-color: var(--gold-dim);
    background: var(--gold-glow);
  }

  .twr-btn-quill {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: #000;
    background: linear-gradient(135deg, var(--quill), #7c3aed);
    border: none; padding: 13px 28px; border-radius: 8px;
    text-decoration: none; cursor: pointer;
    display: inline-flex; align-items: center; gap: 8px;
    font-weight: 700; transition: opacity 0.2s;
  }

  .twr-btn-quill:hover { opacity: 0.88; }

  .twr-nav-spacer { height: 74px; }

  /* HERO */
  .twr-hero {
    padding: 0;
    background: linear-gradient(180deg, rgba(167,139,250,0.06) 0%, rgba(201,168,76,0.03) 60%, transparent 100%);
    border-bottom: 1px solid var(--ink-border);
  }

  .twr-hero-inner {
    max-width: 1400px; margin: 0 auto;
    padding: 80px 40px 64px;
    display: flex; flex-direction: column; gap: 0;
  }

  .twr-hero-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
    color: var(--quill); margin-bottom: 20px; display: block;
  }

  .twr-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(64px, 8vw, 120px);
    font-weight: 300; line-height: 0.9;
    color: var(--text-main); margin-bottom: 28px;
  }

  .twr-hero-sub {
    font-family: 'Syne', sans-serif;
    font-size: 15px; color: var(--text-dim);
    max-width: 540px; line-height: 1.75; margin-bottom: 40px;
  }

  .twr-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; }

  /* FOUNDING 100 BANNER */
  .twr-founding-banner {
    background: linear-gradient(135deg, rgba(201,168,76,0.08), rgba(167,139,250,0.08));
    border: 1px solid var(--gold-dim);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .twr-founding-banner::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .twr-founding-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(80px, 12vw, 160px);
    font-weight: 300;
    color: rgba(201,168,76,0.15);
    line-height: 1;
    position: absolute;
    top: -10px; left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    white-space: nowrap;
  }

  .twr-founding-content {
    position: relative; z-index: 1;
  }

  .twr-founding-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--gold-dim); margin-bottom: 12px; display: block;
  }

  .twr-founding-headline {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 300; color: var(--text-main);
    margin-bottom: 16px;
  }

  .twr-founding-sub {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim);
    max-width: 480px; margin: 0 auto 28px;
    line-height: 1.7;
  }

  .twr-founding-spots {
    display: flex; align-items: center; justify-content: center;
    gap: 8px; margin-bottom: 28px;
  }

  .twr-spot-dot {
    width: 8px; height: 8px; border-radius: 2px;
    background: var(--gold);
  }

  .twr-spot-dot.taken { background: rgba(255,255,255,0.12); }

  /* WRAP */
  .twr-wrap {
    position: relative; z-index: 1;
    max-width: 1400px; margin: 0 auto;
    padding: 64px 40px 96px;
  }

  .twr-section { margin-bottom: 80px; }

  .twr-section-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--gold-dim); display: block; margin-bottom: 6px;
  }

  .twr-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 40px; font-weight: 300;
    color: var(--text-main); line-height: 1;
  }

  .twr-section-accent {
    display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
  }

  .twr-section-bar {
    width: 4px; height: 22px; border-radius: 2px;
    background: var(--gold); flex-shrink: 0;
  }

  .twr-section-bar-quill { background: var(--quill); }

  .twr-divider {
    height: 1px;
    background: linear-gradient(to right, var(--gold-dim), transparent);
    margin: 20px 0 32px;
  }

  /* WHY CARDS */
  .twr-why-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
  }

  .twr-why-card {
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 16px; padding: 36px 28px;
    transition: border-color 0.25s, transform 0.2s;
    position: relative; overflow: hidden;
  }

  .twr-why-card::before {
    content: '';
    position: absolute; top: 0; left: 0;
    width: 100%; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    transform: scaleX(0); transition: transform 0.35s ease;
    transform-origin: left;
  }

  .twr-why-card:hover { border-color: var(--ink-border-gold); transform: translateY(-3px); }
  .twr-why-card:hover::before { transform: scaleX(1); }

  .twr-why-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 52px; font-weight: 300;
    color: rgba(201,168,76,0.15); line-height: 1; margin-bottom: 20px;
  }

  .twr-why-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--gold-light);
    margin-bottom: 14px;
  }

  .twr-why-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.75;
  }

  /* HOW IT WORKS */
  .twr-steps { display: flex; flex-direction: column; gap: 2px; }

  .twr-step {
    display: flex; align-items: flex-start; gap: 24px;
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 12px; padding: 28px 32px;
    transition: border-color 0.2s;
  }

  .twr-step:hover { border-color: var(--ink-border-gold); }

  .twr-step-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; font-weight: 300;
    color: var(--gold-dim); flex-shrink: 0; line-height: 1;
    width: 40px;
  }

  .twr-step-body { flex: 1; }

  .twr-step-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-main);
    margin-bottom: 8px;
  }

  .twr-step-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.7;
  }

  .twr-step-badge {
    font-family: 'Syne', sans-serif;
    font-size: 8px; letter-spacing: 0.16em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 999px; flex-shrink: 0;
    border: 1px solid var(--gold-dim); color: var(--gold-light);
    background: var(--gold-glow); align-self: center;
  }

  /* FORMATS GRID */
  .twr-formats-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  }

  .twr-format-card {
    background: var(--ink-surface2);
    border: 1px solid var(--ink-border);
    border-radius: 12px; padding: 20px 16px;
    text-align: center; transition: all 0.2s; cursor: default;
  }

  .twr-format-card:hover {
    border-color: var(--quill-dim);
    background: var(--quill-glow);
    transform: translateY(-2px);
  }

  .twr-format-icon {
    font-size: 24px; margin-bottom: 10px; display: block;
  }

  .twr-format-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-main);
    margin-bottom: 6px;
  }

  .twr-format-desc {
    font-family: 'Syne', sans-serif;
    font-size: 10px; color: var(--text-faint); line-height: 1.6;
  }

  /* INK EXPLAINER */
  .twr-ink-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }

  .twr-ink-panel {
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 16px; padding: 36px 32px;
  }

  .twr-ink-panel-gold { border-color: var(--gold-dim); }

  .twr-ink-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 72px; font-weight: 300;
    color: var(--gold); line-height: 1; margin-bottom: 8px;
  }

  .twr-ink-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;
    color: var(--gold-dim); margin-bottom: 16px;
  }

  .twr-ink-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.75;
  }

  .twr-ink-flow {
    display: flex; flex-direction: column; gap: 12px;
  }

  .twr-ink-flow-step {
    display: flex; align-items: center; gap: 14px;
    background: var(--ink-surface2);
    border: 1px solid var(--ink-border);
    border-radius: 10px; padding: 14px 18px;
  }

  .twr-ink-flow-icon {
    font-size: 20px; flex-shrink: 0;
  }

  .twr-ink-flow-text {
    font-family: 'Syne', sans-serif;
    font-size: 12px; color: var(--text-dim); line-height: 1.6;
  }

  .twr-ink-flow-text strong {
    color: var(--gold-light); font-weight: 700;
  }

  /* RULES */
  .twr-rules-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  }

  .twr-rule-card {
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 12px; padding: 24px 28px;
    display: flex; gap: 16px; align-items: flex-start;
    transition: border-color 0.2s;
  }

  .twr-rule-card:hover { border-color: var(--ink-border-gold); }

  .twr-rule-icon {
    font-size: 20px; flex-shrink: 0; margin-top: 2px;
  }

  .twr-rule-title {
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text-main);
    margin-bottom: 8px;
  }

  .twr-rule-text {
    font-family: 'Syne', sans-serif;
    font-size: 12px; color: var(--text-dim); line-height: 1.7;
  }

  /* CTA */
  .twr-cta {
    background: linear-gradient(135deg, rgba(201,168,76,0.06), rgba(167,139,250,0.06));
    border: 1px solid var(--gold-dim);
    border-radius: 20px; padding: 64px 40px;
    text-align: center; position: relative; overflow: hidden;
  }

  .twr-cta-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(36px, 5vw, 64px);
    font-weight: 300; color: var(--text-main);
    margin-bottom: 16px;
  }

  .twr-cta-sub {
    font-family: 'Syne', sans-serif;
    font-size: 14px; color: var(--text-dim);
    max-width: 440px; margin: 0 auto 36px;
    line-height: 1.7;
  }

  .twr-cta-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px; }

  /* FOOTER */
  .twr-footer {
    margin-top: 80px; padding: 40px 0 24px;
    border-top: 1px solid var(--ink-border-gold);
    display: flex; align-items: center;
    justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }

  .twr-footer-brand {
    display: flex; align-items: center; gap: 12px;
  }

  .twr-footer-logo {
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    font-family: 'Syne', sans-serif;
    font-size: 11px; font-weight: 700; color: #000;
  }

  .twr-footer-brand-main {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 400; color: var(--gold-light);
  }

  .twr-footer-brand-sub {
    font-family: 'Syne', sans-serif;
    font-size: 10px; color: var(--text-faint);
    letter-spacing: 0.1em; text-transform: uppercase;
  }

  .twr-footer-copy {
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.12em;
    color: var(--text-faint); text-transform: uppercase;
  }

  .twr-footer-actions { display: flex; gap: 10px; align-items: center; }

  /* RESPONSIVE */
  @media (max-width: 900px) {
    .twr-nav-inner { padding: 0 24px; }
    .twr-nav-links { display: none; }
    .twr-wrap { padding: 48px 24px 72px; }
    .twr-hero-inner { padding: 56px 24px 48px; }
    .twr-why-grid { grid-template-columns: 1fr; }
    .twr-formats-grid { grid-template-columns: repeat(2, 1fr); }
    .twr-ink-grid { grid-template-columns: 1fr; }
    .twr-rules-grid { grid-template-columns: 1fr; }
  }

  @media (max-width: 480px) {
    .twr-hero-title { font-size: 52px; }
    .twr-formats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

// =========================
// Data
// =========================
const WHY_CARDS = [
  {
    num: "01",
    title: "You keep your copyright",
    text: "Your story always belongs to you. Publishing on TTL does not transfer ownership of your work. You remain free to publish elsewhere, pursue traditional publishing, release print editions, or adapt your work into any other medium.",
  },
  {
    num: "02",
    title: "Earn through Ink",
    text: "TTL runs on a reader-powered currency called Ink. Readers purchase Ink and use it to unlock your stories and tip you directly. Every time a reader spends Ink on your work, a portion goes straight to you.",
  },
  {
    num: "03",
    title: "Build your fanbase",
    text: "Whether you're publishing your first story or bringing an existing audience, TTL gives you the tools to gain followers, connect with readers who love your writing, and build lasting creative momentum.",
  },
];

const FORMATS = [
  { icon: "📖", label: "Short Stories", desc: "Standalone fiction of any length" },
  { icon: "📚", label: "Serials", desc: "Ongoing chapters, released regularly" },
  { icon: "🪶", label: "Poems & Memoirs", desc: "Personal work, essays, verse" },
  { icon: "✨", label: "Early Access", desc: "Share chapters before public release" },
  { icon: "🌍", label: "YA Fiction", desc: "Young adult and new adult stories" },
  { icon: "🔥", label: "Genre Fiction", desc: "Horror, Fantasy, Sci-Fi, Romance & more" },
  { icon: "🏳️‍🌈", label: "LGBTQ+ Fiction", desc: "All voices, all stories" },
  { icon: "🌺", label: "Fan Fiction", desc: "Transformative works welcome" },
];

const STEPS = [
  { num: "01", title: "Submit Your Story", text: "Fill out the submission form with your story, genre, and a short description. We review every submission personally.", badge: "Free" },
  { num: "02", title: "Get Published", text: "Approved stories appear in the Reading Room and Browse All Stories pages, searchable by genre and author.", badge: "Fast" },
  { num: "03", title: "Earn Ink Revenue", text: "Readers spend Ink to unlock your chapters and tip you directly. Revenue goes through Stripe to your account.", badge: "Real Revenue" },
  { num: "04", title: "Grow Your Audience", text: "Your author profile page builds over time. Readers follow you, return for new chapters, and tip the writers they love.", badge: "Ongoing" },
];

const RULES = [
  { icon: "✅", title: "All experience levels welcome", text: "First-time writers and published authors both belong here. There's no gatekeeping based on credentials or follower count." },
  { icon: "✅", title: "Original work only", text: "All submissions must be your own original work. You retain copyright but warrant that you own the rights to what you submit." },
  { icon: "✅", title: "One piece per month minimum", text: "Founding writers commit to at least one piece per month. Serials can be shorter chapters published on a regular schedule." },
  { icon: "✅", title: "All genres accepted", text: "We publish across all 24 TTL genres — from Horror Mystery to Children's Literature to Adult 18+ — each with its own dedicated space." },
  { icon: "🚫", title: "No plagiarism or AI-only content", text: "Work that is entirely AI-generated without meaningful human authorship will not be accepted. Human stories, always." },
  { icon: "🚫", title: "No hate speech or harmful content", text: "Content that targets individuals or groups with harassment, hate, or abuse is not permitted regardless of genre or framing." },
];

// =========================
// Page Component
// =========================
export default function WritersRoomHome() {
  const [spotsLeft] = useState(87);

  return (
    <>
      <style>{TWR_STYLES}</style>

      <div className="twr-root">

        {/* NAV */}
        <nav className="twr-nav">
          <div className="twr-nav-gold-line" />
          <div className="twr-nav-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, minWidth: 0 }}>
              <a href={TTL_MAIN_URL} className="twr-nav-brand">
                <div className="twr-nav-logo-badge">TTL</div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span className="twr-nav-brand-main">The Tiniest Library</span>
                  <span className="twr-nav-brand-sub">The Writer's Room</span>
                </div>
              </a>
              <div className="twr-nav-links">
                <a href="#why" className="twr-nav-link">Why TTL</a>
                <a href="#how" className="twr-nav-link">How It Works</a>
                <a href="#formats" className="twr-nav-link">Formats</a>
                <a href="#ink" className="twr-nav-link">Ink Revenue</a>
                <a href="#rules" className="twr-nav-link">Guidelines</a>
                <a href={TTL_READING_ROOM_URL} className="twr-nav-link" target="_blank" rel="noopener noreferrer">Reading Room</a>
              </div>
            </div>
            <div className="twr-nav-right">
              <div className="twr-nav-badge">
                <span>🪶</span>
                <span>{spotsLeft} Spots Left</span>
              </div>
              <a href={TTL_SUBMIT_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-primary" style={{ fontSize: '10px', padding: '8px 20px', borderRadius: '999px' }}>
                Apply Now →
              </a>
            </div>
          </div>
        </nav>

        <div className="twr-nav-spacer" />

        {/* HERO */}
        <div className="twr-hero">
          <div className="twr-hero-inner">
            <span className="twr-hero-eyebrow">The Tiniest Library — For Writers</span>
            <h1 className="twr-hero-title">The<br />Writer's<br />Room</h1>
            <p className="twr-hero-sub">
              A home for independent writers. Publish your stories, earn through Ink,
              keep your copyright, and build the readership your work deserves.
            </p>
            <div className="twr-hero-actions">
              <a href={TTL_SUBMIT_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-primary">
                Apply to Join →
              </a>
              <a href="#how" className="twr-btn-ghost">
                How it works
              </a>
              <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-ghost">
                Visit the Reading Room
              </a>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="twr-wrap">

          {/* FOUNDING 100 BANNER */}
          <div className="twr-section">
            <div className="twr-founding-banner">
              <div className="twr-founding-num">100</div>
              <div className="twr-founding-content">
                <span className="twr-founding-label">Limited — Founding Writer Program</span>
                <h2 className="twr-founding-headline">Be one of the first 100.</h2>
                <p className="twr-founding-sub">
                  The first 100 writers to join The Tiniest Library receive founding writer status —
                  permanent recognition, priority placement, and a founding badge on their author profile.
                </p>
                <div className="twr-founding-spots">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className={`twr-spot-dot${i >= 20 - Math.floor((spotsLeft / 100) * 20) ? '' : ' taken'}`} />
                  ))}
                </div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, color: 'var(--gold-light)', marginBottom: 24, letterSpacing: '0.08em' }}>
                  <strong>{spotsLeft}</strong> of 100 spots remaining
                </p>
                <a href={TTL_SUBMIT_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-primary">
                  Claim Your Spot →
                </a>
              </div>
            </div>
          </div>

          {/* WHY TTL */}
          <div className="twr-section" id="why">
            <div className="twr-section-accent">
              <div className="twr-section-bar" />
              <div>
                <span className="twr-section-eyebrow">Why us</span>
                <h2 className="twr-section-title">Why publish on TTL</h2>
              </div>
            </div>
            <div className="twr-divider" />
            <div className="twr-why-grid">
              {WHY_CARDS.map(c => (
                <div key={c.num} className="twr-why-card">
                  <div className="twr-why-num">{c.num}</div>
                  <div className="twr-why-title">{c.title}</div>
                  <div className="twr-why-text">{c.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* HOW IT WORKS */}
          <div className="twr-section" id="how">
            <div className="twr-section-accent">
              <div className="twr-section-bar twr-section-bar-quill" />
              <div>
                <span className="twr-section-eyebrow">Simple process</span>
                <h2 className="twr-section-title">How it works</h2>
              </div>
            </div>
            <div className="twr-divider" />
            <div className="twr-steps">
              {STEPS.map(s => (
                <div key={s.num} className="twr-step">
                  <div className="twr-step-num">{s.num}</div>
                  <div className="twr-step-body">
                    <div className="twr-step-title">{s.title}</div>
                    <div className="twr-step-text">{s.text}</div>
                  </div>
                  <span className="twr-step-badge">{s.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FORMATS */}
          <div className="twr-section" id="formats">
            <div className="twr-section-accent">
              <div className="twr-section-bar" />
              <div>
                <span className="twr-section-eyebrow">What we accept</span>
                <h2 className="twr-section-title">Formats & genres</h2>
              </div>
            </div>
            <div className="twr-divider" />
            <div className="twr-formats-grid">
              {FORMATS.map(f => (
                <div key={f.label} className="twr-format-card">
                  <span className="twr-format-icon">{f.icon}</span>
                  <div className="twr-format-label">{f.label}</div>
                  <div className="twr-format-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* INK REVENUE */}
          <div className="twr-section" id="ink">
            <div className="twr-section-accent">
              <div className="twr-section-bar" />
              <div>
                <span className="twr-section-eyebrow">How you earn</span>
                <h2 className="twr-section-title">The Ink economy</h2>
              </div>
            </div>
            <div className="twr-divider" />
            <div className="twr-ink-grid">
              <div className="twr-ink-panel twr-ink-panel-gold">
                <div className="twr-ink-label">Reader Currency</div>
                <div className="twr-ink-num">Ink</div>
                <p className="twr-ink-text">
                  Ink is The Tiniest Library's reader currency. Readers purchase Ink packs
                  starting at $1 and use it to unlock stories and tip writers they love.
                  Every Ink transaction on your work sends revenue directly to you via Stripe.
                </p>
                <br />
                <p className="twr-ink-text">
                  The more readers engage with your stories — unlocking chapters, tipping,
                  returning for new content — the more you earn. No ads. No algorithm tax.
                  Just readers supporting the writing they love.
                </p>
              </div>
              <div className="twr-ink-panel">
                <div className="twr-ink-label">How the flow works</div>
                <div className="twr-ink-flow">
                  {[
                    { icon: "💳", text: "<strong>Reader buys Ink</strong> — packs start at $1 for 100 Ink via Stripe" },
                    { icon: "📖", text: "<strong>Reader unlocks your story</strong> — spends 25 Ink per chapter" },
                    { icon: "🪶", text: "<strong>Reader tips you directly</strong> — from your author card" },
                    { icon: "💰", text: "<strong>Revenue goes to you</strong> — processed securely through Stripe" },
                    { icon: "🔄", text: "<strong>Readers return</strong> — serials create ongoing income as new chapters drop" },
                  ].map((step, i) => (
                    <div key={i} className="twr-ink-flow-step">
                      <span className="twr-ink-flow-icon">{step.icon}</span>
                      <span className="twr-ink-flow-text" dangerouslySetInnerHTML={{ __html: step.text }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GUIDELINES */}
          <div className="twr-section" id="rules">
            <div className="twr-section-accent">
              <div className="twr-section-bar twr-section-bar-quill" />
              <div>
                <span className="twr-section-eyebrow">Content guidelines</span>
                <h2 className="twr-section-title">Submission rules</h2>
              </div>
            </div>
            <div className="twr-divider" />
            <div className="twr-rules-grid">
              {RULES.map(r => (
                <div key={r.title} className="twr-rule-card">
                  <span className="twr-rule-icon">{r.icon}</span>
                  <div>
                    <div className="twr-rule-title">{r.title}</div>
                    <div className="twr-rule-text">{r.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="twr-cta">
            <h2 className="twr-cta-title">Your stories deserve a home.</h2>
            <p className="twr-cta-sub">
              100 founding writer spots. No gatekeepers. No algorithms.
              Just your work, your readers, and real revenue from the people who love what you create.
            </p>
            <div className="twr-cta-actions">
              <a href={TTL_SUBMIT_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-primary" style={{ fontSize: '11px', padding: '16px 36px' }}>
                Apply to Join →
              </a>
              <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-ghost" style={{ fontSize: '11px', padding: '16px 36px' }}>
                See the Reading Room
              </a>
            </div>
          </div>

          {/* FOOTER */}
          <div className="twr-footer">
            <div className="twr-footer-brand">
              <div className="twr-footer-logo">TTL</div>
              <div>
                <div className="twr-footer-brand-main">The Tiniest Library</div>
                <div className="twr-footer-brand-sub">The Writer's Room</div>
              </div>
            </div>
            <span className="twr-footer-copy">© {new Date().getFullYear()} The Tiniest Library. All rights reserved.</span>
            <div className="twr-footer-actions">
              <a href={TTL_SUBMIT_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-ghost" style={{ fontSize: '9px', padding: '8px 18px', borderRadius: '8px' }}>
                Submit Your Story
              </a>
              <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-primary" style={{ fontSize: '9px', padding: '8px 18px', borderRadius: '8px' }}>
                Reading Room →
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
