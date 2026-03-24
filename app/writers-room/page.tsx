"use client";

import React, { useState, useEffect, useCallback } from "react";
import ApprovalGate from "../components/ApprovalGate";
import WriterAgreements from "../components/WriterAgreements";
// =========================
// Quill Tour — FIXED
// Bug 1: phase now starts as "idle" (not "modal")
// Bug 2: auto-start checks localStorage before firing
// Bug 3: completeTour + handleSpotNext defined before spotlight
//         useEffect so the stale-closure skip is safe
// =========================
const TOUR_KEY = "twr_tour_completed";

const MODAL_SLIDES = [
  {
    emoji: "🪶",
    title: "Welcome to\nThe Writer's Room",
    subtitle: "Guided by Quill",
    body: "This is where independent writers publish, earn, and build their readership on The Tiniest Library. I'm Quill — your Writer's Guide. Let me show you around.",
    cta: "Let's go →",
  },
  {
    emoji: "🏆",
    title: "The Founding\n100 Writers",
    subtitle: "Limited Spots Remaining",
    body: "The first 100 writers to join TTL earn Founding Writer status — a permanent badge on your author profile, priority placement in genre listings, and a piece of TTL history.",
    highlight: "Spots are going fast. Apply before they're gone.",
    cta: "Got it →",
  },
  {
    emoji: "©️",
    title: "You Keep Your\nCopyright",
    subtitle: "Always. No Exceptions.",
    body: "Publishing on TTL grants us a non-exclusive licence to display your work — nothing more. You can publish the same story anywhere else, pursue traditional publishing, or take it down at any time.",
    highlight: "Your story belongs to you. TTL never claims ownership.",
    cta: "That's huge →",
  },
  {
    emoji: "💰",
    title: "Earn Through\nInk",
    subtitle: "Real Revenue, Real Readers",
    body: "Readers buy Ink packs starting at $1 and spend it to unlock your chapters and tip you directly. Every Ink transaction on your work sends revenue straight to you via Stripe.",
    highlight: "No ads. No algorithm tax. Just readers supporting writers they love.",
    cta: "Nice →",
  },
  {
    emoji: "🗂️",
    title: "24 Genres,\nOne Home",
    subtitle: "Your Genre Awaits",
    body: "TTL publishes across all 24 genres — from Fantasy and Horror to Dark Academia, LGBTQ+ Fiction, Black Stories, Latin Voices, Fan Fiction, Cozy, and Adult 18+. Every story has a shelf.",
    highlight: "Each genre has its own landing page with dedicated readers.",
    cta: "Love it →",
  },
  {
    emoji: "✍️",
    title: "Your Author\nProfile",
    subtitle: "Build Your Readership",
    body: "Your author profile is your home on TTL. Readers follow you, tip you, and return for every new chapter. Fill it out in The Writer's Room — it displays live in The Reading Room.",
    highlight: "Ready for a quick tour of The Writer's Room?",
    cta: "Show me around →",
    isFinal: true,
  },
];

type SpotlightStep = {
  id: string;
  target: string;
  title: string;
  body: string;
  position: "top" | "bottom";
  isFinal?: boolean;
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const SPOTLIGHT_STEPS: SpotlightStep[] = [
  { id: "twr-founding", target: "[data-tour-writer='twr-founding']", title: "The Founding 100", body: "This banner tracks how many founding spots are left. Once 100 writers join, this program closes permanently. Claim your spot now.", position: "bottom" },
  { id: "twr-why", target: "[data-tour-writer='twr-why']", title: "Why Publish on TTL", body: "Three reasons every writer should know — you keep your copyright, you earn through Ink, and you build a real fanbase. No gatekeepers. No algorithms.", position: "bottom" },
  { id: "twr-how", target: "[data-tour-writer='twr-how']", title: "How It Works", body: "Four simple steps — submit your story, get published, earn Ink revenue, and grow your audience. The whole process is free and reviewed personally.", position: "bottom" },
  { id: "twr-ink", target: "[data-tour-writer='twr-ink']", title: "The Ink Economy", body: "This section explains exactly how money flows to you. Readers buy Ink, spend it on your chapters, and tip you directly. Revenue goes through Stripe to your account.", position: "top" },
  { id: "twr-genres", target: "[data-tour-writer='twr-genres']", title: "Formats & Genres", body: "See all the formats TTL accepts — short stories, serials, poems, fan fiction, early access chapters, and all 24 genres. If you write it, there's a home for it here.", position: "top" },
  { id: "twr-submit", target: "[data-tour-writer='twr-submit']", title: "Apply to Join", body: "Click Apply to Join to submit your story. We review every submission personally and respond within 5–10 business days. It's completely free.", position: "top", isFinal: true },
];

function getSpotRect(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function QuillTooltip({ step, rect, current, total, onNext, onSkip }: {
  step: SpotlightStep;
  rect: SpotlightRect;
  current: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const PAD = 16, TIP_W = 300, TIP_H = 160;
  let top = step.position === "bottom" ? rect.top + rect.height + PAD : rect.top - TIP_H - PAD;
  let left = Math.max(12, Math.min(rect.left + rect.width / 2 - TIP_W / 2, window.innerWidth - TIP_W - 12));
  top = Math.max(12, top);
  return (
    <div style={{ position: "fixed", top, left, width: TIP_W, zIndex: 10002, background: "#111", border: "1px solid rgba(167,139,250,0.45)", borderRadius: 14, padding: "18px 20px", boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 24px rgba(167,139,250,0.15)", fontFamily: "'Syne', sans-serif" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "14px 14px 0 0", background: "linear-gradient(90deg, transparent, #a78bfa, #C9A84C, transparent)" }} />
      <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(167,139,250,0.7)", marginBottom: 6 }}>🪶 Quill — Step {current} of {total}</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#E2C97E", marginBottom: 6, lineHeight: 1.3 }}>{step.title}</p>
      <p style={{ fontSize: 12, color: "rgba(232,228,218,0.7)", lineHeight: 1.65, marginBottom: 14 }}>{step.body}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button type="button" onClick={onSkip} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Skip tour</button>
        <button type="button" onClick={onNext} style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, background: "linear-gradient(135deg, #a78bfa, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer" }}>
          {step.isFinal ? "Done! 🪶" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function WritersTour() {
  // FIX 1: start idle, not "modal"
  const [phase, setPhase] = useState<"idle" | "modal" | "spotlight">("idle");
  const [modalSlide, setModalSlide] = useState(0);
  const [spotStep, setSpotStep] = useState(0);
  const [spotRect, setSpotRect] = useState<SpotlightRect | null>(null);

  // FIX 2: completeTour and handleSpotNext defined BEFORE the spotlight
  // useEffect so the closure always captures the latest reference.
  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setPhase("idle");
    setSpotRect(null);
  }, []);

  const handleSpotNext = useCallback(() => {
    setSpotStep((s) => {
      if (s < SPOTLIGHT_STEPS.length - 1) return s + 1;
      completeTour();
      return s;
    });
  }, [completeTour]);

  // FIX 3: only auto-start if tour has NOT been completed
  useEffect(() => {
    if (!localStorage.getItem(TOUR_KEY)) {
      setTimeout(() => setPhase("modal"), 1200);
    }
  }, []);

  // Manual replay trigger
  useEffect(() => {
    const handler = () => { setModalSlide(0); setSpotStep(0); setPhase("modal"); };
    window.addEventListener("twr-start-tour", handler);
    return () => window.removeEventListener("twr-start-tour", handler);
  }, []);

  // Spotlight rect updater — handleSpotNext is stable so this is safe
  useEffect(() => {
    if (phase !== "spotlight") return;
    const step = SPOTLIGHT_STEPS[spotStep];
    if (!step) return;
    const update = () => {
      const rect = getSpotRect(step.target);
      if (rect) {
        setSpotRect(rect);
        document.querySelector(step.target)?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        handleSpotNext();
      }
    };
    const timer = setTimeout(update, 350);
    window.addEventListener("resize", update);
    return () => { clearTimeout(timer); window.removeEventListener("resize", update); };
  }, [phase, spotStep, handleSpotNext]);

  const handleModalNext = () => modalSlide < MODAL_SLIDES.length - 1
    ? setModalSlide(s => s + 1)
    : (setPhase("spotlight"), setSpotStep(0));

  const handleSkip = () => completeTour();

  if (phase === "idle") return null;

  return (
    <>
      <style>{QUILL_TOUR_STYLES}</style>
      {phase === "modal" && (
        <div className="qt-overlay">
          <div className="qt-modal">
            <div className="qt-top-line" />
            <div className="qt-quill-header"><span>🪶</span><span className="qt-quill-label">Quill — The Writer's Guide</span></div>
            <div className="qt-dots">{MODAL_SLIDES.map((_, i) => <div key={i} className={`qt-dot${i === modalSlide ? " qt-dot-active" : ""}`} />)}</div>
            <div className="qt-slide">
              <div className="qt-emoji">{MODAL_SLIDES[modalSlide].emoji}</div>
              <p className="qt-eyebrow">{MODAL_SLIDES[modalSlide].subtitle}</p>
              <h2 className="qt-title">{MODAL_SLIDES[modalSlide].title}</h2>
              <p className="qt-body">{MODAL_SLIDES[modalSlide].body}</p>
              {"highlight" in MODAL_SLIDES[modalSlide] && MODAL_SLIDES[modalSlide].highlight && (
                <div className="qt-highlight"><span>✍️</span><span>{MODAL_SLIDES[modalSlide].highlight}</span></div>
              )}
            </div>
            <div className="qt-footer">
              <button type="button" onClick={handleSkip} className="qt-skip">Skip tour</button>
              <button type="button" onClick={handleModalNext} className="qt-cta">{MODAL_SLIDES[modalSlide].cta}</button>
            </div>
          </div>
        </div>
      )}
      {phase === "spotlight" && spotRect && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none" }}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <mask id="qt-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect x={spotRect.left - 8} y={spotRect.top - 8} width={spotRect.width + 16} height={spotRect.height + 16} rx={12} fill="black" />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.78)" mask="url(#qt-mask)" />
              <rect x={spotRect.left - 8} y={spotRect.top - 8} width={spotRect.width + 16} height={spotRect.height + 16} rx={12} fill="none" stroke="#a78bfa" strokeWidth={2} opacity={0.85} />
            </svg>
          </div>
          <QuillTooltip step={SPOTLIGHT_STEPS[spotStep]} rect={spotRect} current={spotStep + 1} total={SPOTLIGHT_STEPS.length} onNext={handleSpotNext} onSkip={handleSkip} />
        </>
      )}
      {phase === "spotlight" && !spotRect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "rgba(167,139,250,0.7)", fontFamily: "'Syne', sans-serif", fontSize: 13 }}>🪶 Loading tour…</div>
        </div>
      )}
    </>
  );
}

const QUILL_TOUR_STYLES = `
  .qt-overlay { position: fixed; inset: 0; z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(0,0,0,0.85); backdrop-filter: blur(12px); animation: qt-fadein 0.35s ease; }
  @keyframes qt-fadein { from { opacity: 0; } to { opacity: 1; } }
  .qt-modal { position: relative; width: 100%; max-width: 480px; background: #0f0f0f; border: 1px solid rgba(167,139,250,0.3); border-radius: 20px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.9); animation: qt-slidein 0.35s cubic-bezier(0.34,1.56,0.64,1); font-family: 'Syne', sans-serif; }
  @keyframes qt-slidein { from { transform: translateY(24px) scale(0.96); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  .qt-top-line { height: 2px; background: linear-gradient(90deg, transparent, #a78bfa, #C9A84C, transparent); }
  .qt-quill-header { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px 0; font-size: 16px; }
  .qt-quill-label { font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(167,139,250,0.65); }
  .qt-dots { display: flex; gap: 6px; justify-content: center; padding: 14px 24px 0; }
  .qt-dot { width: 6px; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.12); transition: all 0.25s; }
  .qt-dot-active { width: 24px; background: linear-gradient(90deg, #a78bfa, #C9A84C); }
  .qt-slide { padding: 24px 32px 8px; text-align: center; min-height: 270px; display: flex; flex-direction: column; align-items: center; }
  .qt-emoji { font-size: 52px; margin-bottom: 14px; animation: qt-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes qt-bounce { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .qt-eyebrow { font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(167,139,250,0.6); margin-bottom: 10px; }
  .qt-title { font-family: 'Cormorant Garamond', serif; font-size: 34px; font-weight: 300; color: #f0ece2; line-height: 1.1; margin-bottom: 14px; white-space: pre-line; }
  .qt-body { font-size: 13px; color: rgba(232,228,218,0.65); line-height: 1.75; max-width: 360px; margin-bottom: 16px; }
  .qt-highlight { display: flex; align-items: flex-start; gap: 8px; background: rgba(167,139,250,0.07); border: 1px solid rgba(167,139,250,0.2); border-radius: 10px; padding: 12px 16px; font-size: 12px; color: rgba(232,228,218,0.7); line-height: 1.6; text-align: left; max-width: 360px; }
  .qt-footer { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px 28px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px; }
  .qt-skip { font-family: 'Syne', sans-serif; font-size: 10px; color: rgba(255,255,255,0.28); background: none; border: none; cursor: pointer; padding: 0; }
  .qt-skip:hover { color: rgba(255,255,255,0.55); }
  .qt-cta { font-family: 'Syne', sans-serif; font-size: 11px; letter-spacing: 0.14em; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff; border: none; border-radius: 10px; padding: 12px 28px; cursor: pointer; transition: opacity 0.15s, transform 0.15s; }
  .qt-cta:hover { opacity: 0.88; transform: translateY(-1px); }
  @media (max-width: 480px) { .qt-modal { border-radius: 16px; } .qt-slide { padding: 20px 24px 8px; min-height: 240px; } .qt-title { font-size: 28px; } .qt-footer { padding: 16px 24px 24px; } }
`;

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
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
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
    background: none; cursor: pointer;
  }

  .twr-nav-link:hover, .twr-nav-link.active {
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

  .twr-founding-content { position: relative; z-index: 1; }

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

  .twr-format-icon { font-size: 24px; margin-bottom: 10px; display: block; }

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
  .twr-ink-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

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

  .twr-ink-flow { display: flex; flex-direction: column; gap: 12px; }

  .twr-ink-flow-step {
    display: flex; align-items: center; gap: 14px;
    background: var(--ink-surface2);
    border: 1px solid var(--ink-border);
    border-radius: 10px; padding: 14px 18px;
  }

  .twr-ink-flow-icon { font-size: 20px; flex-shrink: 0; }

  .twr-ink-flow-text {
    font-family: 'Syne', sans-serif;
    font-size: 12px; color: var(--text-dim); line-height: 1.6;
  }

  .twr-ink-flow-text strong { color: var(--gold-light); font-weight: 700; }

  /* RULES */
  .twr-rules-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .twr-rule-card {
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 12px; padding: 24px 28px;
    display: flex; gap: 16px; align-items: flex-start;
    transition: border-color 0.2s;
  }

  .twr-rule-card:hover { border-color: var(--ink-border-gold); }

  .twr-rule-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }

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
    display: flex; flex-direction: column; gap: 20px;
  }

  .twr-footer-top {
    display: flex; align-items: center;
    justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }

  .twr-footer-brand { display: flex; align-items: center; gap: 12px; }

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

  .twr-footer-pages {
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
    padding-top: 16px;
    border-top: 1px solid var(--ink-border);
  }

  .twr-footer-page-link {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-faint); text-decoration: none;
    padding: 5px 12px; border-radius: 4px;
    border: 1px solid transparent;
    transition: all 0.2s; white-space: nowrap;
    background: none; cursor: pointer;
  }

  .twr-footer-page-link:hover {
    color: var(--gold-light);
    border-color: var(--ink-border-gold);
    background: var(--gold-glow);
  }

  .twr-footer-page-sep {
    color: var(--text-faint);
    font-size: 9px;
    opacity: 0.4;
    pointer-events: none;
    user-select: none;
  }

  /* SUB-PAGE STYLES */
  .twr-subpage {
    position: relative; z-index: 1;
    max-width: 900px; margin: 0 auto;
    padding: 64px 40px 96px;
    animation: twr-fadein 0.35s ease;
  }

  @keyframes twr-fadein {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .twr-subpage-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: 'Syne', sans-serif;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--text-dim); margin-bottom: 40px;
    background: none; border: none; cursor: pointer;
    padding: 8px 0; transition: color 0.2s;
  }

  .twr-subpage-back:hover { color: var(--gold-light); }

  .twr-subpage-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase;
    color: var(--quill); display: block; margin-bottom: 14px;
  }

  .twr-subpage-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(48px, 7vw, 88px);
    font-weight: 300; line-height: 0.95;
    color: var(--text-main); margin-bottom: 20px;
  }

  .twr-subpage-intro {
    font-family: 'Syne', sans-serif;
    font-size: 14px; color: var(--text-dim);
    max-width: 600px; line-height: 1.8; margin-bottom: 48px;
    padding-bottom: 40px;
    border-bottom: 1px solid var(--ink-border-gold);
  }

  .twr-content-block { margin-bottom: 48px; }

  .twr-content-h2 {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 300;
    color: var(--text-main); margin-bottom: 16px;
    display: flex; align-items: center; gap: 12px;
  }

  .twr-content-h2-bar {
    width: 3px; height: 18px; border-radius: 2px;
    background: var(--gold); flex-shrink: 0;
  }

  .twr-content-h2-bar-quill { background: var(--quill); }

  .twr-content-p {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.85;
    margin-bottom: 14px;
  }

  .twr-content-p a { color: var(--gold-light); text-decoration: underline; text-underline-offset: 3px; }

  .twr-checklist { display: flex; flex-direction: column; gap: 10px; }

  .twr-checklist-item {
    display: flex; align-items: flex-start; gap: 14px;
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 10px; padding: 18px 20px;
    transition: border-color 0.2s;
  }

  .twr-checklist-item:hover { border-color: var(--ink-border-gold); }

  .twr-checklist-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }

  .twr-checklist-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.7;
  }

  .twr-checklist-text strong { color: var(--text-main); font-weight: 700; }

  .twr-info-panel {
    background: linear-gradient(135deg, rgba(201,168,76,0.06), rgba(167,139,250,0.04));
    border: 1px solid var(--gold-dim);
    border-radius: 14px; padding: 28px 32px;
    margin-bottom: 32px;
  }

  .twr-info-panel-quill {
    background: linear-gradient(135deg, rgba(167,139,250,0.06), rgba(201,168,76,0.04));
    border-color: var(--quill-dim);
  }

  .twr-info-panel-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
    color: var(--gold-dim); margin-bottom: 10px; display: block;
  }

  .twr-info-panel-label-quill { color: var(--quill-dim); }

  .twr-info-panel-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.8;
  }

  .twr-info-panel-text strong { color: var(--gold-light); }
  .twr-info-panel-quill .twr-info-panel-text strong { color: var(--quill); }

  .twr-faq-list { display: flex; flex-direction: column; gap: 4px; }

  .twr-faq-item {
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 10px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .twr-faq-item.open { border-color: var(--ink-border-gold); }

  .twr-faq-q {
    width: 100%; background: none; border: none; cursor: pointer;
    padding: 20px 24px;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    text-align: left;
  }

  .twr-faq-q-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600; letter-spacing: 0.04em;
    color: var(--text-main); line-height: 1.5;
  }

  .twr-faq-arrow { color: var(--gold-dim); font-size: 16px; flex-shrink: 0; transition: transform 0.25s; }
  .twr-faq-item.open .twr-faq-arrow { transform: rotate(180deg); color: var(--gold-light); }

  .twr-faq-a {
    padding: 0 24px 20px;
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.8;
    display: none;
  }

  .twr-faq-item.open .twr-faq-a { display: block; }

  .twr-contact-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    margin-bottom: 16px;
  }

  .twr-field { display: flex; flex-direction: column; gap: 8px; }

  .twr-field-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase;
    color: var(--gold-dim);
  }

  .twr-field-input, .twr-field-select, .twr-field-textarea {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-main);
    background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 8px; padding: 14px 16px;
    outline: none; transition: border-color 0.2s;
    width: 100%; box-sizing: border-box;
    appearance: none;
  }

  .twr-field-input::placeholder, .twr-field-textarea::placeholder { color: var(--text-faint); }
  .twr-field-input:focus, .twr-field-select:focus, .twr-field-textarea:focus { border-color: var(--gold-dim); }
  .twr-field-textarea { resize: vertical; min-height: 140px; }
  .twr-field-select { color: var(--text-dim); }
  .twr-field-select option { background: #111; color: var(--text-main); }

  .twr-contact-sent {
    text-align: center; padding: 48px 32px;
    background: var(--ink-surface);
    border: 1px solid var(--gold-dim);
    border-radius: 16px;
  }

  .twr-contact-sent-icon { font-size: 40px; margin-bottom: 16px; display: block; }

  .twr-contact-sent-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 36px; font-weight: 300;
    color: var(--text-main); margin-bottom: 12px;
  }

  .twr-contact-sent-text {
    font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-dim); line-height: 1.7;
  }

  .twr-copyright-highlight {
    background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(201,168,76,0.04));
    border: 1px solid var(--gold-dim);
    border-left: 4px solid var(--gold);
    border-radius: 0 12px 12px 0;
    padding: 24px 28px;
    margin-bottom: 24px;
  }

  .twr-copyright-highlight p {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 400; font-style: italic;
    color: var(--gold-light); line-height: 1.6; margin: 0;
  }

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
    .twr-subpage { padding: 48px 24px 72px; }
    .twr-contact-grid { grid-template-columns: 1fr; }
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
  { num: "01", title: "You keep your copyright", text: "Your story always belongs to you. Publishing on TTL does not transfer ownership of your work. You remain free to publish elsewhere, pursue traditional publishing, release print editions, or adapt your work into any other medium." },
  { num: "02", title: "Earn through Ink", text: "TTL runs on a reader-powered currency called Ink. Readers purchase Ink and use it to unlock your stories and tip you directly. Every time a reader spends Ink on your work, a portion goes straight to you." },
  { num: "03", title: "Build your fanbase", text: "Whether you're publishing your first story or bringing an existing audience, TTL gives you the tools to gain followers, connect with readers who love your writing, and build lasting creative momentum." },
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

const FAQS = [
  { q: "Is it free to submit my writing?", a: "Yes, completely free. There is no submission fee, no membership cost, and no hidden charges to publish on The Tiniest Library. You earn money; you don't spend it to join." },
  { q: "Do I give up my copyright when I publish here?", a: "No. You keep 100% of your copyright. Publishing on TTL grants us a non-exclusive licence to display your work on the platform, but ownership of your work remains entirely yours. You can publish the same work elsewhere, adapt it, or take it down at any time." },
  { q: "What genres do you accept?", a: "We publish across all 24 TTL genres including Fan Fiction, Horror, Fantasy, Romance, Sci-Fi, Literary Fiction, YA, Children's Literature, LGBTQ+ Fiction, Psychological Fiction, Historical Fiction, Contemporary Fiction, Serialised Fiction, and more. If it's a story, there's a home for it here." },
  { q: "How does the Ink system work?", a: "Ink is our reader currency. Readers buy Ink packs starting at $1 for 100 Ink and use it to unlock stories (25 Ink per chapter) or tip writers directly from their author cards. When readers spend Ink on your work, a portion of that revenue is paid out to you via Stripe." },
  { q: "How long does the review process take?", a: "We review every submission personally and aim to respond within 5–10 business days. Founding writer applications may be reviewed faster given the limited spots available." },
  { q: "Can I submit a work in progress or serialised story?", a: "Absolutely. Serials are one of the most popular formats on TTL. You can publish chapter by chapter on whatever schedule suits you. Readers can follow your author profile to be notified when new chapters drop." },
  { q: "What happens if my submission isn't accepted?", a: "If your submission isn't accepted, we'll let you know and you're welcome to revise and resubmit. Not every rejection is a no forever — sometimes it's a matter of timing, format, or fit. We try to give useful feedback where we can." },
  { q: "Can I publish work that's already been published elsewhere?", a: "In most cases, yes — as long as you hold the rights to it and any prior publication agreement doesn't prohibit it. If you're unsure, check the terms of your previous publication before submitting." },
  { q: "Is there a word count minimum or maximum?", a: "We don't enforce strict word count limits. Flash fiction, short stories, novellas, and full novels all have a place here. For serialised work, chapters can be as short or as long as your story requires." },
  { q: "What is a Founding Writer?", a: "The first 100 writers to join The Tiniest Library earn Founding Writer status. This includes permanent recognition on your author profile, a founding badge, priority placement in genre listings, and a small piece of TTL history. There are a limited number of spots remaining." },
];

// =========================
// Sub-Page: Submission Guidelines
// =========================
interface BackProps { onBack: () => void; }
interface NavigateProps { onNavigate: (page: string) => void; }

function PageSubmissionGuidelines({ onBack }: BackProps) {
  return (
    <div className="twr-subpage">
      <button className="twr-subpage-back" onClick={onBack}>← Back to The Writer's Room</button>
      <span className="twr-subpage-eyebrow">How to submit</span>
      <h1 className="twr-subpage-title">Submission<br />Guidelines</h1>
      <p className="twr-subpage-intro">Everything you need to know before you submit your writing to The Tiniest Library. We keep the process simple, human, and free.</p>

      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar" />Who can submit</h2>
        <p className="twr-content-p">The Tiniest Library is open to all writers regardless of experience, following, or publishing history. First-time writers are as welcome as traditionally published authors. We do not gatekeep based on credentials.</p>
        <p className="twr-content-p">You must be the original author of the work you submit and hold the rights to publish it here. If your work has been published elsewhere, check that your previous agreement permits simultaneous or republication before submitting.</p>
      </div>

      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar" />What we accept</h2>
        <div className="twr-checklist">
          {[
            { icon: "📖", text: "<strong>Short stories</strong> — standalone fiction of any length, any genre" },
            { icon: "📚", text: "<strong>Serialised fiction</strong> — ongoing chapters published on any schedule you choose" },
            { icon: "🪶", text: "<strong>Poetry and personal essays</strong> — verse, memoir, and lyric nonfiction" },
            { icon: "🌺", text: "<strong>Fan fiction</strong> — transformative works welcome across all fandoms" },
            { icon: "✨", text: "<strong>Early access chapters</strong> — share work-in-progress before a wider release" },
            { icon: "🔥", text: "<strong>All 24 TTL genres</strong> — including Adult 18+, Horror, Fantasy, Romance, Literary, LGBTQ+, YA, and more" },
          ].map((item, i) => (
            <div key={i} className="twr-checklist-item">
              <span className="twr-checklist-icon">{item.icon}</span>
              <span className="twr-checklist-text" dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>
      </div>

      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar twr-content-h2-bar-quill" />Content rules</h2>
        <div className="twr-checklist">
          {[
            { icon: "🚫", text: "<strong>No AI-only content.</strong> Work that is entirely AI-generated without meaningful human authorship will not be accepted. Human stories, always." },
            { icon: "🚫", text: "<strong>No plagiarism.</strong> Submitting work that is not your own, or presenting another person's writing as yours, will result in permanent removal from the platform." },
            { icon: "🚫", text: "<strong>No hate speech or harassment.</strong> Content that targets individuals or groups with abuse, hate, or harassment is not permitted regardless of genre or framing." },
            { icon: "🚫", text: "<strong>No illegal content.</strong> Content involving minors in sexual situations, or content that is otherwise unlawful in the jurisdiction in which we operate, will not be accepted under any circumstances." },
          ].map((item, i) => (
            <div key={i} className="twr-checklist-item">
              <span className="twr-checklist-icon">{item.icon}</span>
              <span className="twr-checklist-text" dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>
      </div>

      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar" />How to submit</h2>
        <div className="twr-info-panel">
          <span className="twr-info-panel-label">The process</span>
          <p className="twr-info-panel-text">
            Click <strong>Apply to Join</strong> on this page. You'll be taken to our submission form on The Tiniest Library website where you can provide your story, genre, a short description, and any relevant links. We review every submission personally and aim to respond within <strong>5–10 business days</strong>.
          </p>
        </div>
        <p className="twr-content-p">There is no submission fee. Founding writer status is awarded to the first 100 writers to join — spots are limited and going fast.</p>
      </div>

      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar twr-content-h2-bar-quill" />Founding writer commitment</h2>
        <p className="twr-content-p">Founding writers commit to publishing at least one piece per month. For serialised stories, individual chapters count — there's no minimum word count per chapter. This helps us build an active, living library rather than a static archive.</p>
        <p className="twr-content-p">If life happens and you need a break, just let us know. We're human too.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-primary">Apply to Join →</a>
        <button className="twr-btn-ghost" onClick={onBack}>Back to Writer's Room</button>
      </div>
    </div>
  );
}

// =========================
// Sub-Page: FAQs
// =========================
function PageFAQs({ onBack }: BackProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="twr-subpage">
      <button className="twr-subpage-back" onClick={onBack}>← Back to The Writer's Room</button>
      <span className="twr-subpage-eyebrow">Questions & answers</span>
      <h1 className="twr-subpage-title">Tiniest<br />FAQs</h1>
      <p className="twr-subpage-intro">Everything writers ask us most. If your question isn't here, use the Contact page and we'll get back to you personally.</p>
      <div className="twr-faq-list">
        {FAQS.map((faq, i) => (
          <div key={i} className={`twr-faq-item${openIdx === i ? ' open' : ''}`}>
            <button className="twr-faq-q" onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <span className="twr-faq-q-text">{faq.q}</span>
              <span className="twr-faq-arrow">▾</span>
            </button>
            <div className="twr-faq-a">{faq.a}</div>
          </div>
        ))}
      </div>
      <div className="twr-info-panel twr-info-panel-quill" style={{ marginTop: 48 }}>
        <span className="twr-info-panel-label twr-info-panel-label-quill">Still have questions?</span>
        <p className="twr-info-panel-text">We read every message. Head to our <strong>Contact Us</strong> page and ask us directly. We aim to reply within 2 business days.</p>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-primary">Apply to Join →</a>
        <button className="twr-btn-ghost" onClick={onBack}>Back to Writer's Room</button>
      </div>
    </div>
  );
}

// =========================
// Sub-Page: Copyright
// =========================
function PageCopyright({ onBack }: BackProps) {
  return (
    <div className="twr-subpage">
      <button className="twr-subpage-back" onClick={onBack}>← Back to The Writer's Room</button>
      <span className="twr-subpage-eyebrow">Your rights, always</span>
      <h1 className="twr-subpage-title">Keep Your<br />Copyright</h1>
      <p className="twr-subpage-intro">At The Tiniest Library, your work belongs to you — not to us, not to any algorithm, not to the platform. This is a non-negotiable principle of how TTL works.</p>
      <div className="twr-copyright-highlight"><p>"You own what you write. Publishing here changes nothing about that."</p></div>
      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar" />What copyright means for you</h2>
        <p className="twr-content-p">Copyright is the legal right of the creator of an original work to control how that work is used, reproduced, and distributed. When you write a story, poem, or any creative work, you automatically own that copyright from the moment it is created — no registration required.</p>
        <p className="twr-content-p">Publishing your work on The Tiniest Library does not change this. You are not selling your copyright, assigning it, or signing it over in any form.</p>
      </div>
      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar" />What you grant TTL</h2>
        <div className="twr-info-panel">
          <span className="twr-info-panel-label">A limited, non-exclusive licence only</span>
          <p className="twr-info-panel-text">
            By submitting your work, you grant The Tiniest Library a <strong>non-exclusive licence</strong> to display, host, and make your work available to readers on this platform. That's it. <strong>Non-exclusive</strong> means you can publish the same work anywhere else simultaneously. We hold no exclusivity over your writing, ever.
          </p>
        </div>
        <p className="twr-content-p">We do not claim the right to sell, sublicense, translate, adapt, or reproduce your work in any other medium or for any commercial purpose outside of displaying it to readers within The Tiniest Library platform.</p>
      </div>
      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar twr-content-h2-bar-quill" />What you can always do</h2>
        <div className="twr-checklist">
          {[
            { icon: "✅", text: "<strong>Publish the same work on other platforms</strong> simultaneously — Wattpad, Royal Road, your own website, anywhere." },
            { icon: "✅", text: "<strong>Submit your work for traditional publishing</strong> — our licence does not affect your ability to query agents or publishers." },
            { icon: "✅", text: "<strong>Self-publish a print or ebook edition</strong> — your story remains yours to commercialise in any form." },
            { icon: "✅", text: "<strong>Adapt your work</strong> into screenplays, games, audio fiction, translations, or any other medium." },
            { icon: "✅", text: "<strong>Remove your work from TTL</strong> at any time by contacting us. We will de-publish it promptly." },
            { icon: "✅", text: "<strong>Register your copyright</strong> independently — we encourage it for work you plan to commercialise widely." },
          ].map((item, i) => (
            <div key={i} className="twr-checklist-item">
              <span className="twr-checklist-icon">{item.icon}</span>
              <span className="twr-checklist-text" dangerouslySetInnerHTML={{ __html: item.text }} />
            </div>
          ))}
        </div>
      </div>
      <div className="twr-content-block">
        <h2 className="twr-content-h2"><span className="twr-content-h2-bar" />Why this matters</h2>
        <p className="twr-content-p">Many platforms bury exploitative clauses in their terms of service — broad licences that let the platform use your work in advertising, AI training, or merchandise without additional permission or payment. TTL is built on the opposite principle.</p>
        <p className="twr-content-p">Your creative work has value. You built it. The Tiniest Library exists to give it an audience and earn you revenue from it — not to extract ownership from the people who make this place worth reading.</p>
      </div>

      <div className="twr-info-panel twr-info-panel-quill">
        <span className="twr-info-panel-label twr-info-panel-label-quill">Questions about your rights?</span>
        <p className="twr-info-panel-text">
          If you have any concerns about how your work is being used or want clarification on any part of your licence, <strong>contact us directly</strong>. We take these questions seriously and will always respond plainly and honestly.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
        <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-primary">Apply to Join →</a>
        <button className="twr-btn-ghost" onClick={onBack}>Back to Writer's Room</button>
      </div>
    </div>
  );
}

// =========================
// Sub-Page: Contact
// =========================
function PageContact({ onBack }: BackProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = () => { if (!form.name || !form.email || !form.message) return; setSent(true); };

  return (
    <div className="twr-subpage">
      <button className="twr-subpage-back" onClick={onBack}>← Back to The Writer's Room</button>
      <span className="twr-subpage-eyebrow">Get in touch</span>
      <h1 className="twr-subpage-title">Contact<br />Us</h1>
      <p className="twr-subpage-intro">We read every message personally. Whether you have a question about submitting, your work on the platform, or anything else — reach out and we'll get back to you.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
        {[
          { icon: "🪶", label: "Submissions", text: "Questions about submitting your work or the review process" },
          { icon: "💰", label: "Ink & Revenue", text: "Questions about earnings, Stripe payouts, or the Ink system" },
          { icon: "📋", label: "Your Account", text: "Help with your author profile or published stories" },
          { icon: "💬", label: "General", text: "Anything else — we're happy to hear from you" },
        ].map(item => (
          <div key={item.label} className="twr-rule-card" style={{ cursor: 'default' }}>
            <span className="twr-rule-icon">{item.icon}</span>
            <div><div className="twr-rule-title">{item.label}</div><div className="twr-rule-text">{item.text}</div></div>
          </div>
        ))}
      </div>
      {sent ? (
        <div className="twr-contact-sent">
          <span className="twr-contact-sent-icon">🪶</span>
          <div className="twr-contact-sent-title">Message received.</div>
          <p className="twr-contact-sent-text">Thank you for reaching out. We aim to reply within 2 business days.<br />We look forward to reading your work.</p>
        </div>
      ) : (
        <div>
          <div className="twr-contact-grid">
            <div className="twr-field"><label className="twr-field-label">Your Name</label><input className="twr-field-input" name="name" placeholder="How should we address you?" value={form.name} onChange={handleChange} /></div>
            <div className="twr-field"><label className="twr-field-label">Email Address</label><input className="twr-field-input" name="email" type="email" placeholder="We'll reply here" value={form.email} onChange={handleChange} /></div>
          </div>
          <div className="twr-field" style={{ marginBottom: 16 }}>
            <label className="twr-field-label">Subject</label>
            <select className="twr-field-select" name="subject" value={form.subject} onChange={handleChange}>
              <option value="">Select a topic</option>
              <option value="submission">Submission question</option>
              <option value="ink">Ink & revenue</option>
              <option value="account">My account / profile</option>
              <option value="copyright">Copyright question</option>
              <option value="technical">Technical issue</option>
              <option value="other">Something else</option>
            </select>
          </div>
          <div className="twr-field" style={{ marginBottom: 24 }}>
            <label className="twr-field-label">Message</label>
            <textarea className="twr-field-textarea" name="message" placeholder="Tell us what's on your mind..." value={form.message} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="twr-btn-primary" onClick={handleSubmit}>Send Message →</button>
            <button className="twr-btn-ghost" onClick={onBack}>Back to Writer's Room</button>
          </div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 11, color: 'var(--text-faint)', marginTop: 16, lineHeight: 1.7 }}>
            We aim to respond within 2 business days. For urgent submission questions, see the <button style={{ background: 'none', border: 'none', color: 'var(--gold-light)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', padding: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }} onClick={onBack}>Submission Guidelines</button>.
          </p>
        </div>
      )}
    </div>
  );
}

// =========================
// Shared Footer
// =========================
function Footer({ onNavigate }: NavigateProps) {
  return (
    <div className="twr-footer">
      <div className="twr-footer-top">
        <div className="twr-footer-brand">
          <div className="twr-footer-logo">TTL</div>
          <div>
            <div className="twr-footer-brand-main">The Tiniest Library</div>
            <div className="twr-footer-brand-sub">The Writer's Room</div>
          </div>
        </div>
        <span className="twr-footer-copy">© {new Date().getFullYear()} The Tiniest Library. All rights reserved.</span>
        <div className="twr-footer-actions">
          <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-ghost" style={{ fontSize: '9px', padding: '8px 18px', borderRadius: '8px' }}>Submit Your Story</a>
          <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-primary" style={{ fontSize: '9px', padding: '8px 18px', borderRadius: '8px' }}>Reading Room →</a>
        </div>
      </div>
      <div className="twr-footer-pages">
        <button className="twr-footer-page-link" onClick={() => onNavigate('guidelines')}>Submission Guidelines</button>
        <span className="twr-footer-page-sep">·</span>
        <button className="twr-footer-page-link" onClick={() => onNavigate('faqs')}>Tiniest FAQs</button>
        <span className="twr-footer-page-sep">·</span>
        <button className="twr-footer-page-link" onClick={() => onNavigate('copyright')}>Keep Your Copyright</button>
        <span className="twr-footer-page-sep">·</span>
        <button className="twr-footer-page-link" onClick={() => onNavigate('contact')}>Contact Us</button>
        <span className="twr-footer-page-sep">·</span>
        <a href={TTL_MAIN_URL} target="_blank" rel="noopener noreferrer" className="twr-footer-page-link">The Tiniest Library ↗</a>
      </div>
    </div>
  );
}

// =========================
// Main Page
// =========================
export default function WritersRoomHome() {
  const [spotsLeft] = useState(87);
  const [page, setPage] = useState('home');

  const goHome = () => { setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const goPage = (p: string) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const NAV_PAGES: { key: string; label: string }[] = [
    { key: 'guidelines', label: 'Guidelines' },
    { key: 'faqs', label: 'FAQs' },
    { key: 'copyright', label: 'Your Copyright' },
    { key: 'contact', label: 'Contact' },{ key: 'profile', label: 'My Profile' },
  ];

  return (
    <>
      <style>{TWR_STYLES}</style>
      <div className="twr-root">

        {/* NAV */}
        <nav className="twr-nav">
          <div className="twr-nav-gold-line" />
          <div className="twr-nav-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 40, minWidth: 0 }}>
              <button onClick={goHome} className="twr-nav-brand">
                <div className="twr-nav-logo-badge">TTL</div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span className="twr-nav-brand-main">The Tiniest Library</span>
                  <span className="twr-nav-brand-sub">The Writer's Room</span>
                </div>
              </button>
              <div className="twr-nav-links">
                {page === 'home' ? (
                  <>
                    <a href="#why" className="twr-nav-link">Why TTL</a>
                    <a href="#how" className="twr-nav-link">How It Works</a>
                    <a href="#formats" className="twr-nav-link">Formats</a>
                    <a href="#ink" className="twr-nav-link">Ink Revenue</a>
                    <a href="#rules" className="twr-nav-link">Rules</a>
                    {NAV_PAGES.map(p => (
                      <button key={p.key} className="twr-nav-link" onClick={() => goPage(p.key)}>{p.label}</button>
                    ))}
                    <a href={TTL_READING_ROOM_URL} className="twr-nav-link" target="_blank" rel="noopener noreferrer">Reading Room</a>
                  </>
                ) : (
                  <>
                    <button className="twr-nav-link" onClick={goHome}>Home</button>
                    {NAV_PAGES.map(p2 => (
                      <button key={p2.key} className={`twr-nav-link${page === p2.key ? ' active' : ''}`} onClick={() => goPage(p2.key)}>{p2.label}</button>
                    ))}
                    <a href={TTL_READING_ROOM_URL} className="twr-nav-link" target="_blank" rel="noopener noreferrer">Reading Room</a>
                  </>
                )}
              </div>
            </div>
            <div className="twr-nav-right">
              <div className="twr-nav-badge"><span>🪶</span><span>{spotsLeft} Spots Left</span></div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("twr-start-tour"))}
                className="twr-btn-ghost"
                style={{ fontSize: '9px', padding: '6px 14px', borderRadius: '999px' }}
              >
                🪶 Tour
              </button>
              <a href="/apply" className="twr-btn-primary" style={{ fontSize: '9px', padding: '6px 18px', borderRadius: '999px' }}>
                Apply Now →
              </a>
            </div>            
          </div>          
        </nav>

        <div className="twr-nav-spacer" />

        {/* PAGE ROUTING */}
        {page === 'guidelines' && <PageSubmissionGuidelines onBack={goHome} />}
        {page === 'faqs' && <PageFAQs onBack={goHome} />}
        {page === 'copyright' && <PageCopyright onBack={goHome} />}
        {page === 'contact' && <PageContact onBack={goHome} />}
        {page === 'profile' && <ApprovalGate userId="temp-user-id" />}
        {page === 'home' && (
          <>
            {/* HERO */}
            <div className="twr-hero">
              <div className="twr-hero-inner">
                <span className="twr-hero-eyebrow">The Tiniest Library — For Writers</span>
                <h1 className="twr-hero-title">The<br />Writer's<br />Room</h1>
                <p className="twr-hero-sub">A home for independent writers. Publish your stories, earn through Ink, keep your copyright, and build the readership your work deserves.</p>
                <div className="twr-hero-actions">
                  <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-primary">Apply to Join →</a>
                  <a href="#how" className="twr-btn-ghost">How it works</a>
                  <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-ghost">Visit the Reading Room</a>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="twr-wrap">

              {/* FOUNDING 100 — data-tour-writer already present */}
              <div className="twr-section">
                <div className="twr-founding-banner" data-tour-writer="twr-founding">
                  <div className="twr-founding-num">100</div>
                  <div className="twr-founding-content">
                    <span className="twr-founding-label">Limited — Founding Writer Program</span>
                    <h2 className="twr-founding-headline">Be one of the first 100.</h2>
                    <p className="twr-founding-sub">The first 100 writers to join The Tiniest Library receive founding writer status — permanent recognition, priority placement, and a founding badge on their author profile.</p>
                    <div className="twr-founding-spots">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className={`twr-spot-dot${i >= 20 - Math.floor((spotsLeft / 100) * 20) ? '' : ' taken'}`} />
                      ))}
                    </div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, color: 'var(--gold-light)', marginBottom: 24, letterSpacing: '0.08em' }}>
                      <strong>{spotsLeft}</strong> of 100 spots remaining
                    </p>
                    <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-primary">Claim Your Spot →</a>
                  </div>
                </div>
              </div>

              {/* WHY TTL — data-tour-writer already present */}
              <div className="twr-section" id="why" data-tour-writer="twr-why">
                <div className="twr-section-accent">
                  <div className="twr-section-bar" />
                  <div><span className="twr-section-eyebrow">Why us</span><h2 className="twr-section-title">Why publish on TTL</h2></div>
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

              {/* HOW IT WORKS — data-tour-writer already present */}
              <div className="twr-section" id="how" data-tour-writer="twr-how">
                <div className="twr-section-accent">
                  <div className="twr-section-bar twr-section-bar-quill" />
                  <div><span className="twr-section-eyebrow">Simple process</span><h2 className="twr-section-title">How it works</h2></div>
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

              {/* FORMATS — data-tour-writer already present */}
              <div className="twr-section" id="formats" data-tour-writer="twr-genres">
                <div className="twr-section-accent">
                  <div className="twr-section-bar" />
                  <div><span className="twr-section-eyebrow">What we accept</span><h2 className="twr-section-title">Formats & genres</h2></div>
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

              {/* INK REVENUE — data-tour-writer already present */}
              <div className="twr-section" id="ink" data-tour-writer="twr-ink">
                <div className="twr-section-accent">
                  <div className="twr-section-bar" />
                  <div><span className="twr-section-eyebrow">How you earn</span><h2 className="twr-section-title">The Ink economy</h2></div>
                </div>
                <div className="twr-divider" />
                <div className="twr-ink-grid">
                  <div className="twr-ink-panel twr-ink-panel-gold">
                    <div className="twr-ink-label">Reader Currency</div>
                    <div className="twr-ink-num">Ink</div>
                    <p className="twr-ink-text">Ink is The Tiniest Library's reader currency. Readers purchase Ink packs starting at $1 and use it to unlock stories and tip writers they love. Every Ink transaction on your work sends revenue directly to you via Stripe.</p>
                    <br />
                    <p className="twr-ink-text">The more readers engage with your stories — unlocking chapters, tipping, returning for new content — the more you earn. No ads. No algorithm tax. Just readers supporting the writing they love.</p>
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

              {/* RULES */}
              <div className="twr-section" id="rules">
                <div className="twr-section-accent">
                  <div className="twr-section-bar twr-section-bar-quill" />
                  <div><span className="twr-section-eyebrow">Content guidelines</span><h2 className="twr-section-title">Submission rules</h2></div>
                </div>
                <div className="twr-divider" />
                <div className="twr-rules-grid">
                  {RULES.map(r => (
                    <div key={r.title} className="twr-rule-card">
                      <span className="twr-rule-icon">{r.icon}</span>
                      <div><div className="twr-rule-title">{r.title}</div><div className="twr-rule-text">{r.text}</div></div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
                  <button className="twr-btn-ghost" style={{ fontSize: '10px', padding: '10px 22px' }} onClick={() => goPage('guidelines')}>Full Submission Guidelines →</button>
                </div>
              </div>

              {/* CTA — data-tour-writer already present */}
              <div className="twr-cta" data-tour-writer="twr-submit">
                <h2 className="twr-cta-title">Your stories deserve a home.</h2>
                <p className="twr-cta-sub">100 founding writer spots. No gatekeepers. No algorithms. Just your work, your readers, and real revenue from the people who love what you create.</p>
                <div className="twr-cta-actions">
                  <a href="/apply" target="_blank" rel="noopener noreferrer" className="twr-btn-primary" style={{ fontSize: '11px', padding: '16px 36px' }}>Apply to Join →</a>
                  <a href={TTL_READING_ROOM_URL} target="_blank" rel="noopener noreferrer" className="twr-btn-ghost" style={{ fontSize: '11px', padding: '16px 36px' }}>See the Reading Room</a>
                </div>
              </div>

              <Footer onNavigate={goPage} />
            </div>
          </>
        )}

        {page !== 'home' && (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 40px 60px' }}>
            <Footer onNavigate={goPage} />
          </div>
        )}

        {/* Quill Tour — fires on first visit only, replayable via 🪶 Tour button */}
        <WritersTour />

      </div>
    </>
  );
}
