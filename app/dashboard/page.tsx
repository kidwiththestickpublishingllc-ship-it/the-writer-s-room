"use client";

import WriterNotificationSystem from "@/app/components/WriterNotificationSystem";
import QuestionsTab from "@/app/components/QuestionsTab";
import TeamTab from "@/app/components/TeamTab";
import LettersInbox from "@/app/components/LettersInbox";
import { useEffect, useState, useCallback, useRef } from "react";
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
// The Creators Room — Full Creator HQ
// =========================

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ═══ Creator HQ — comic book edition ═══
     The dashboard's colour names point at a classic comic palette.
     Every tab reads these, so the tabs move over with them.
     Panels are white with black ink borders; captions are yellow.
     Set on .hq-root as well as :root so no other component's colours
     can overwrite them inside the dashboard. */
  :root, .hq-root {
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
  .hq-nav { position: relative; z-index: 5; background: var(--cb-ink); }
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
  .hq-sidebar { counter-reset: hqpage; }
  .hq-nav-section {
    width: fit-content; margin: 14px 0 4px 2px; padding: 1px 7px;
    background: #111111; color: #FFFFFF;
    font-family: var(--font-display); font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
    transform: rotate(-1.5deg);
  }
  .hq-nav-section:first-child { margin-top: 4px; }
  .hq-nav-item {
    counter-increment: hqpage;
    display: flex; align-items: center; gap: 10px;
    width: 100%; min-height: 42px; padding: 0 10px; margin-bottom: 3px;
    background: #FFFFFF; color: #111111;
    border: 2px solid #111111; border-radius: 0; box-shadow: 2px 2px 0 #111111;
    font-family: var(--font-ui); font-size: 14px; font-weight: 700; text-align: left;
    cursor: pointer; transition: transform 0.1s, box-shadow 0.1s, background 0.1s;
  }
  .hq-nav-item::before {
    content: counter(hqpage);
    flex: none; width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    background: #FFFFFF; color: #111111;
    border: 2px solid #111111; border-radius: 50%;
    font-family: var(--font-display); font-size: 14px; line-height: 1;
    transition: background 0.1s, color 0.1s;
  }
  .hq-nav-item:hover { background: #FFF3B0; transform: translate(-2px, -2px); box-shadow: 4px 4px 0 #111111; }
  .hq-nav-item:hover::before { background: #FF1493; color: #FFFFFF; }
  .hq-nav-item:active { transform: translate(1px, 1px); box-shadow: 0 0 0 #111111; }
  .hq-nav-item.active {
    background: #FFE14D; font-weight: 800;
    transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #111111;
    animation: hqPop 0.32s ease-out;
  }
  .hq-nav-item.active::before { background: #111111; color: #FFE14D; }
  @keyframes hqPop {
    0%   { transform: translate(-2px, -2px) scale(0.92); }
    60%  { transform: translate(-2px, -2px) scale(1.05) rotate(-1.2deg); }
    100% { transform: translate(-2px, -2px) scale(1) rotate(0deg); }
  }
  .hq-nav-icon { display: none; }

  .hq-content {
    position: relative; flex: 1; min-width: 0; min-height: 70vh;
    padding: 36px 36px 44px;
    background: var(--cb-paper); color: var(--text);
    border: 4px solid var(--cb-ink); box-shadow: 8px 8px 0 var(--cb-ink);
    font-family: var(--font-ui);
    scroll-margin-top: 96px;
  }

  /* ── Page turns: each tab flips in like the next page of the comic ── */
  .hq-turn-fwd { transform-origin: left center; animation: hqTurnFwd 0.45s cubic-bezier(0.2, 0.7, 0.2, 1); }
  .hq-turn-back { transform-origin: right center; animation: hqTurnBack 0.45s cubic-bezier(0.2, 0.7, 0.2, 1); }
  @keyframes hqTurnFwd {
    0%   { opacity: 0; transform: perspective(1400px) rotateY(-24deg) translateX(48px); }
    55%  { opacity: 1; }
    100% { opacity: 1; transform: none; }
  }
  @keyframes hqTurnBack {
    0%   { opacity: 0; transform: perspective(1400px) rotateY(24deg) translateX(-48px); }
    55%  { opacity: 1; }
    100% { opacity: 1; transform: none; }
  }

  /* ── Page footer: turn to the page before or after ── */
  .hq-pagefoot {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
    margin-top: 44px; padding-top: 20px; border-top: 4px solid var(--cb-ink);
  }
  .hq-pagefoot-num { font-family: var(--font-display); font-size: 20px; letter-spacing: 0.06em; color: var(--cb-ink); }
  .hq-pagefoot-btn {
    display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
    min-height: 52px; padding: 6px 16px;
    background: #FFFFFF; color: var(--cb-ink);
    border: 3px solid var(--cb-ink); border-radius: 0; box-shadow: 4px 4px 0 var(--cb-ink);
    text-align: left; cursor: pointer; transition: transform 0.08s, box-shadow 0.08s, background 0.08s;
  }
  .hq-pagefoot-btn.next { align-items: flex-end; text-align: right; background: var(--cb-yellow); }
  .hq-pagefoot-btn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--cb-ink); }
  .hq-pagefoot-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--cb-ink); }
  .hq-pagefoot-pg { font-family: var(--font-display); font-size: 16px; letter-spacing: 0.05em; color: var(--cb-red); }
  .hq-pagefoot-label { font-size: 14px; font-weight: 800; }

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
    .hq-nav-item { flex: none; width: auto; min-height: 44px; padding: 0 12px 0 8px; margin-bottom: 4px; white-space: nowrap; }
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
    .hq-pagefoot { flex-direction: column; align-items: stretch; }
    .hq-pagefoot-num { text-align: center; }
    .hq-pagefoot-btn, .hq-pagefoot-btn.next { align-items: center; text-align: center; }
  }

  @media (max-width: 400px) {
    .hq-stats { grid-template-columns: minmax(0, 1fr); }
    .hq-nav-writer { display: none; }
  }
`;

// =========================
// Types
// =========================
type Tab = 'overview' | 'chapters' | 'earnings' | 'payout' | 'profile' | 'submit' | 'media' | 'verify' | 'world' | 'questions' | 'letters' | 'team';

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
// The dashboard reads like a comic: each tab is a page, in this order.
const PAGE_ORDER: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Dashboard' },
  { key: 'chapters', label: 'My Chapters' },
  { key: 'earnings', label: 'Earnings' },
  { key: 'payout', label: 'Request Payout' },
  { key: 'profile', label: 'My Profile' },
  { key: 'submit', label: 'Submit Work' },
  { key: 'media', label: 'Story Media' },
  { key: 'team', label: 'Team & Splits' },
  { key: 'world', label: 'World Building' },
  { key: 'verify', label: 'Verification' },
  { key: 'questions', label: 'Questions' },
  { key: 'letters', label: 'Letters' },
];

// Calls a signed-in API route (e.g. /api/email) with this writer's login attached.
async function authFetch(url: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
  return fetch(url, { ...init, headers });
}

// Chapter text and media come through get_chapter_body, which always
// answers for a writer's own chapters.
async function withBodies(list: any[] | null): Promise<any[] | null> {
  if (!list) return list;
  return Promise.all(list.map(async (ch) => {
    const { data: body } = await supabase.rpc('get_chapter_body', { p_chapter_id: ch.id });
    return { ...ch, ...(body ?? {}) };
  }));
}

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

  // ── Comic page turning ──
  const pageIndex = PAGE_ORDER.findIndex(p => p.key === tab);
  const prevPage = pageIndex > 0 ? PAGE_ORDER[pageIndex - 1] : null;
  const nextPage = pageIndex >= 0 && pageIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[pageIndex + 1] : null;
  const [turn, setTurn] = useState<{ tab: Tab; dir: 'fwd' | 'back' }>({ tab: 'overview', dir: 'fwd' });
  if (turn.tab !== tab) {
    const from = PAGE_ORDER.findIndex(p => p.key === turn.tab);
    setTurn({ tab, dir: pageIndex >= from ? 'fwd' : 'back' });
  }
  const firstPageRef = useRef(true);
  useEffect(() => {
    if (firstPageRef.current) { firstPageRef.current = false; return; }
    document.querySelector('.hq-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [tab]);
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
      subgenres: ['Cooking', 'Cooking Romance']
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
      subgenres: ['All Ages', 'Teen', 'PG', 'Tasteful', 'Classy']
    },
    {
      group: 'Aesthetic / Visual Mood',
      subgenres: ['Purple Lighting', 'Futuristic', '3D Style', 'Watercolor', 'Japanese Oriented', 'Comic Noir', 'Cinematic']
    },
  ];

  const READING_ROOM_GENRES = GENRE_GROUPS.flatMap(g => g.subgenres);

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
      await authFetch('/api/email', {
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
          const { data: chaptersRaw } = await supabase
            .from('chapters')
            .select('id, story_id, chapter_number, title, is_free, ink_cost, created_at, media_type, publish_at, split_id')
            .eq('story_id', storiesData[0].id)
            .order('chapter_number');
          const chaptersData = await withBodies(chaptersRaw);

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
    supabase.from('chapters').select('id, story_id, chapter_number, title, is_free, ink_cost, created_at, media_type, publish_at, split_id').eq('story_id', currentStoryId).order('chapter_number')
      .then(async ({ data: raw }) => {
        const data = await withBodies(raw);
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
        .select('id, story_id, chapter_number, title, is_free, ink_cost, created_at, media_type, publish_at, split_id')
        .single()
        .then(r => ({ ...r, data: r.data ? { ...r.data, content: '' } : r.data }));
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
      await authFetch('/api/email', {
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
            <p className="loading-text">Loading your Creator HQ…</p>
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
                <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 6 }}>The Tiniest Library — Creator Submission</div>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                      <button onClick={() => { setStoryRoom('reading-room'); setStoryGenre(''); }} style={{ padding: '20px', borderRadius: 0, cursor: 'pointer', border: storyRoom === 'reading-room' ? '2px solid #C9A84C' : '1px solid #e5e7eb', background: storyRoom === 'reading-room' ? 'rgba(201,168,76,0.06)' : '#f9fafb', color: storyRoom === 'reading-room' ? '#8a6510' : '#6b7280', fontFamily: 'var(--font-ui)', fontSize: 14, textAlign: 'left' }}>
                        📚 The Reading Room
                        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>General fiction — all genres</div>
                      </button>
                    </div>
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Story Title *</label>
                    <input className="editor-input" placeholder="Enter your story title…" value={storyTitle} onChange={e => setStoryTitle(e.target.value)} />
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Genre *</label>
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
                  </div>
                  <div className="editor-field">
                    <label className="editor-label" style={{ color: '#8a6510' }}>Format</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
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
        {/* Toast */}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

        {/* Nav */}
        <nav className="hq-nav">
          <div className="hq-nav-line" />
          <div className="hq-nav-inner">
            <a href="https://www.the-tiniest-library.com" className="hq-nav-brand">
              <div className="hq-nav-logo">TTL</div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                <span className="hq-nav-title">The Creators Room</span>
                <span className="hq-nav-sub">Creator HQ</span>
              </div>
            </a>
            <div className="hq-nav-right">
              <div className="hq-nav-writer">hi, {writer.name}</div>
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
  <span className="hq-nav-icon">📝</span> Submit Work
</button>
<button className={`hq-nav-item${tab === 'media' ? ' active' : ''}`} onClick={() => setTab('media')}>
  <span className="hq-nav-icon">🎨</span> Story Media
</button>
<button className={`hq-nav-item${tab === 'team' ? ' active' : ''}`} onClick={() => setTab('team')}>
  <span className="hq-nav-icon">🤝</span> Team & Splits
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
            <div key={tab} className={`hq-turn-${turn.dir}`}>

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
            {tab === 'team' && <TeamTab />}
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
</div>
            {pageIndex >= 0 && (
              <nav className="hq-pagefoot" aria-label="Turn the page">
                {prevPage ? (
                  <button className="hq-pagefoot-btn prev" onClick={() => setTab(prevPage.key)}>
                    <span className="hq-pagefoot-pg">← Page {pageIndex}</span>
                    <span className="hq-pagefoot-label">{prevPage.label}</span>
                  </button>
                ) : <span />}
                <span className="hq-pagefoot-num">Page {pageIndex + 1} of {PAGE_ORDER.length}</span>
                {nextPage ? (
                  <button className="hq-pagefoot-btn next" onClick={() => setTab(nextPage.key)}>
                    <span className="hq-pagefoot-pg">Page {pageIndex + 2} →</span>
                    <span className="hq-pagefoot-label">{nextPage.label}</span>
                  </button>
                ) : <span />}
              </nav>
            )}
          </main>
        </div>
      </div>
    </>
  );
}