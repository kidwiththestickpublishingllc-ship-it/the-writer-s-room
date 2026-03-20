"use client";

import { useEffect, useState, useCallback } from "react";

// =============================================================
// TWR WRITER'S TOUR — Guided by Quill
// A two-phase onboarding experience for writers:
//   Phase 1 — Welcome modal (6 slides introducing The Writer's Room)
//   Phase 2 — Spotlight tour (highlights real page elements)
//
// HOW TO INSTALL:
//   1. Save as: app/components/WritersTour.tsx
//   2. In your Writer's Room page or layout, add:
//      import WritersTour from "@/app/components/WritersTour";
//      Then place <WritersTour /> just before </body>
//
// HOW TO ADD THE REPLAY BUTTON anywhere on the page:
//   import { startWritersTour } from "@/app/components/WritersTour";
//   <button onClick={startWritersTour}>Take the Tour</button>
//
// CUSTOMIZATION:
//   - Edit MODAL_SLIDES to change the intro content
//   - Edit SPOTLIGHT_STEPS to change what gets highlighted
//   - Add data-tour-writer="step-id" to any element to spotlight it
// =============================================================

const TOUR_KEY = "twr_tour_completed";

// =============================================================
// Modal slides — 6 slides covering all writer features
// =============================================================
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

// =============================================================
// Spotlight steps — highlights real Writer's Room elements
// Add data-tour-writer="step-id" to elements in your pages
// =============================================================
const SPOTLIGHT_STEPS = [
  {
    id: "twr-founding",
    target: "[data-tour-writer='twr-founding']",
    title: "The Founding 100",
    body: "This banner tracks how many founding spots are left. Once 100 writers join, this program closes permanently. Claim your spot now.",
    position: "top" as const,
  },
  {
    id: "twr-why",
    target: "[data-tour-writer='twr-why']",
    title: "Why Publish on TTL",
    body: "Three reasons every writer should know — you keep your copyright, you earn through Ink, and you build a real fanbase. No gatekeepers. No algorithms.",
    position: "top" as const,
  },
  {
    id: "twr-how",
    target: "[data-tour-writer='twr-how']",
    title: "How It Works",
    body: "Four simple steps — submit your story, get published, earn Ink revenue, and grow your audience. The whole process is free and reviewed personally.",
    position: "top" as const,
  },
  {
    id: "twr-ink",
    target: "[data-tour-writer='twr-ink']",
    title: "The Ink Economy",
    body: "This section explains exactly how money flows to you. Readers buy Ink, spend it on your chapters, and tip you directly. Revenue goes through Stripe to your account.",
    position: "top" as const,
  },
  {
    id: "twr-genres",
    target: "[data-tour-writer='twr-genres']",
    title: "Formats & Genres",
    body: "See all the formats TTL accepts — short stories, serials, poems, fan fiction, early access chapters, and all 24 genres. If you write it, there's a home for it here.",
    position: "top" as const,
  },
  {
    id: "twr-submit",
    target: "[data-tour-writer='twr-submit']",
    title: "Apply to Join",
    body: "This is your CTA — click Apply to Join and submit your story. We review every submission personally and respond within 5–10 business days. It's completely free.",
    position: "top" as const,
    isFinal: true,
  },
];

// =============================================================
// Global trigger
// =============================================================
export function startWritersTour() {
  window.dispatchEvent(new CustomEvent("twr-start-tour"));
}

// =============================================================
// Spotlight helpers
// =============================================================
type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function getRect(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function TooltipBox({
  step,
  rect,
  current,
  total,
  onNext,
  onSkip,
}: {
  step: (typeof SPOTLIGHT_STEPS)[0];
  rect: SpotlightRect;
  current: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const PAD = 16;
  const TIP_W = 300;
  const TIP_H = 160;

  let top = 0;
  let left = rect.left + rect.width / 2 - TIP_W / 2;

  if (step.position === "bottom") {
    top = rect.top + rect.height + PAD;
  } else {
    top = rect.top - TIP_H - PAD;
  }

  left = Math.max(12, Math.min(left, window.innerWidth - TIP_W - 12));
  top = Math.max(12, top);

  return (
    <div
      style={{
        position: "fixed",
        top,
        left,
        width: TIP_W,
        zIndex: 10002,
        background: "#111",
        border: "1px solid rgba(167,139,250,0.45)",
        borderRadius: 14,
        padding: "18px 20px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.8), 0 0 24px rgba(167,139,250,0.15)",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* quill purple top line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "14px 14px 0 0", background: "linear-gradient(90deg, transparent, #a78bfa, #C9A84C, transparent)" }} />

      <div style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(167,139,250,0.7)", marginBottom: 6 }}>
        🪶 Quill — Step {current} of {total}
      </div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#E2C97E", marginBottom: 6, lineHeight: 1.3 }}>{step.title}</p>
      <p style={{ fontSize: 12, color: "rgba(232,228,218,0.7)", lineHeight: 1.65, marginBottom: 14 }}>{step.body}</p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <button
          type="button"
          onClick={onSkip}
          style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Skip tour
        </button>
        <button
          type="button"
          onClick={onNext}
          style={{
            fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700,
            background: "linear-gradient(135deg, #a78bfa, #7c3aed)", color: "#fff",
            border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer",
            transition: "opacity 0.15s",
          }}
        >
          {step.isFinal ? "Done! 🪶" : "Next →"}
        </button>
      </div>
    </div>
  );
}

// =============================================================
// Main component
// =============================================================
export default function WritersTour() {
  const [phase, setPhase] = useState<"idle" | "modal" | "spotlight">("idle");
  const [modalSlide, setModalSlide] = useState(0);
  const [spotStep, setSpotStep] = useState(0);
  const [spotRect, setSpotRect] = useState<SpotlightRect | null>(null);

  // Auto-start on first visit
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      setTimeout(() => setPhase("modal"), 1200);
    }
  }, []);

  // Listen for manual trigger
  useEffect(() => {
    const handler = () => {
      setModalSlide(0);
      setSpotStep(0);
      setPhase("modal");
    };
    window.addEventListener("twr-start-tour", handler);
    return () => window.removeEventListener("twr-start-tour", handler);
  }, []);

  // Update spotlight rect when step changes
  useEffect(() => {
    if (phase !== "spotlight") return;
    const step = SPOTLIGHT_STEPS[spotStep];
    if (!step) return;

    const update = () => {
      const rect = getRect(step.target);
      if (rect) {
        setSpotRect(rect);
        const el = document.querySelector(step.target);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        handleSpotNext();
      }
    };

    const timer = setTimeout(update, 350);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", update);
    };
  }, [phase, spotStep]);

  const completeTour = useCallback(() => {
    localStorage.setItem(TOUR_KEY, "1");
    setPhase("idle");
    setSpotRect(null);
  }, []);

  const handleModalNext = () => {
    if (modalSlide < MODAL_SLIDES.length - 1) {
      setModalSlide((s) => s + 1);
    } else {
      setPhase("spotlight");
      setSpotStep(0);
    }
  };

  const handleSpotNext = () => {
    if (spotStep < SPOTLIGHT_STEPS.length - 1) {
      setSpotStep((s) => s + 1);
    } else {
      completeTour();
    }
  };

  const handleSkip = () => completeTour();

  if (phase === "idle") return null;

  return (
    <>
      <style>{TOUR_STYLES}</style>

      {/* ── MODAL PHASE ── */}
      {phase === "modal" && (
        <div className="twr-tour-overlay">
          <div className="twr-tour-modal">
            <div className="twr-tour-modal-top-line" />

            {/* Quill branding */}
            <div className="twr-tour-quill-header">
              <span className="twr-tour-quill-icon">🪶</span>
              <span className="twr-tour-quill-label">Quill — The Writer's Guide</span>
            </div>

            {/* Progress dots */}
            <div className="twr-tour-dots">
              {MODAL_SLIDES.map((_, i) => (
                <div key={i} className={`twr-tour-dot ${i === modalSlide ? "twr-tour-dot-active" : ""}`} />
              ))}
            </div>

            {/* Slide content */}
            <div className="twr-tour-slide">
              <div className="twr-tour-emoji">{MODAL_SLIDES[modalSlide].emoji}</div>
              <p className="twr-tour-eyebrow">{MODAL_SLIDES[modalSlide].subtitle}</p>
              <h2 className="twr-tour-title">{MODAL_SLIDES[modalSlide].title}</h2>
              <p className="twr-tour-body">{MODAL_SLIDES[modalSlide].body}</p>
              {"highlight" in MODAL_SLIDES[modalSlide] && MODAL_SLIDES[modalSlide].highlight && (
                <div className="twr-tour-highlight">
                  <span>✍️</span>
                  <span>{MODAL_SLIDES[modalSlide].highlight}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="twr-tour-modal-footer">
              <button type="button" onClick={handleSkip} className="twr-tour-skip">
                Skip tour
              </button>
              <button type="button" onClick={handleModalNext} className="twr-tour-cta">
                {MODAL_SLIDES[modalSlide].cta}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SPOTLIGHT PHASE ── */}
      {phase === "spotlight" && spotRect && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10000, pointerEvents: "none" }}>
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <mask id="twr-spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={spotRect.left - 8}
                    y={spotRect.top - 8}
                    width={spotRect.width + 16}
                    height={spotRect.height + 16}
                    rx={12}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(0,0,0,0.78)"
                mask="url(#twr-spotlight-mask)"
              />
              {/* Purple/gold border around spotlight */}
              <rect
                x={spotRect.left - 8}
                y={spotRect.top - 8}
                width={spotRect.width + 16}
                height={spotRect.height + 16}
                rx={12}
                fill="none"
                stroke="#a78bfa"
                strokeWidth={2}
                opacity={0.85}
              />
            </svg>
          </div>

          <TooltipBox
            step={SPOTLIGHT_STEPS[spotStep]}
            rect={spotRect}
            current={spotStep + 1}
            total={SPOTLIGHT_STEPS.length}
            onNext={handleSpotNext}
            onSkip={handleSkip}
          />
        </>
      )}

      {/* Spotlight loading */}
      {phase === "spotlight" && !spotRect && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "rgba(167,139,250,0.7)", fontFamily: "'Syne', sans-serif", fontSize: 13, letterSpacing: "0.1em" }}>
            🪶 Loading tour…
          </div>
        </div>
      )}
    </>
  );
}

// =============================================================
// Styles — TWR purple/gold accent system
// =============================================================
const TOUR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Syne:wght@400;500;600;700&display=swap');

  .twr-tour-overlay {
    position: fixed;
    inset: 0;
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(12px);
    animation: twr-tour-fadein 0.35s ease;
  }

  @keyframes twr-tour-fadein {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .twr-tour-modal {
    position: relative;
    width: 100%;
    max-width: 480px;
    background: #0f0f0f;
    border: 1px solid rgba(167,139,250,0.3);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.9), 0 0 60px rgba(167,139,250,0.08);
    animation: twr-tour-slidein 0.35s cubic-bezier(0.34,1.56,0.64,1);
    font-family: 'Syne', sans-serif;
  }

  @keyframes twr-tour-slidein {
    from { transform: translateY(24px) scale(0.96); opacity: 0; }
    to { transform: translateY(0) scale(1); opacity: 1; }
  }

  .twr-tour-modal-top-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, #a78bfa, #C9A84C, transparent);
  }

  .twr-tour-quill-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 24px 0;
  }

  .twr-tour-quill-icon {
    font-size: 16px;
  }

  .twr-tour-quill-label {
    font-family: 'Syne', sans-serif;
    font-size: 9px;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(167,139,250,0.65);
  }

  .twr-tour-dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    padding: 14px 24px 0;
  }

  .twr-tour-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
    transition: all 0.25s;
  }

  .twr-tour-dot-active {
    width: 24px;
    background: linear-gradient(90deg, #a78bfa, #C9A84C);
  }

  .twr-tour-slide {
    padding: 24px 32px 8px;
    text-align: center;
    min-height: 270px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .twr-tour-emoji {
    font-size: 52px;
    margin-bottom: 14px;
    animation: twr-tour-bounce 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }

  @keyframes twr-tour-bounce {
    from { transform: scale(0.6); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .twr-tour-eyebrow {
    font-size: 9px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(167,139,250,0.6);
    margin-bottom: 10px;
  }

  .twr-tour-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 34px;
    font-weight: 300;
    color: #f0ece2;
    line-height: 1.1;
    margin-bottom: 14px;
    white-space: pre-line;
  }

  .twr-tour-body {
    font-size: 13px;
    color: rgba(232,228,218,0.65);
    line-height: 1.75;
    max-width: 360px;
    margin-bottom: 16px;
  }

  .twr-tour-highlight {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: rgba(167,139,250,0.07);
    border: 1px solid rgba(167,139,250,0.2);
    border-radius: 10px;
    padding: 12px 16px;
    font-size: 12px;
    color: rgba(232,228,218,0.7);
    line-height: 1.6;
    text-align: left;
    max-width: 360px;
  }

  .twr-tour-modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px 28px;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 8px;
  }

  .twr-tour-skip {
    font-family: 'Syne', sans-serif;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.28);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }

  .twr-tour-skip:hover { color: rgba(255,255,255,0.55); }

  .twr-tour-cta {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    letter-spacing: 0.14em;
    font-weight: 700;
    background: linear-gradient(135deg, #a78bfa, #7c3aed);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 28px;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.15s;
  }

  .twr-tour-cta:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    .twr-tour-modal { border-radius: 16px; }
    .twr-tour-slide { padding: 20px 24px 8px; min-height: 240px; }
    .twr-tour-title { font-size: 28px; }
    .twr-tour-modal-footer { padding: 16px 24px 24px; }
  }
`;

// =============================================================
// HOW TO ADD THE TOUR TRIGGER BUTTON
// =============================================================
// In any page or component, add this to replay the tour:
//
//   import { startWritersTour } from "@/app/components/WritersTour";
//   <button onClick={startWritersTour}>Take the Tour</button>
//
// =============================================================
// HOW TO ADD DATA-TOUR-WRITER ATTRIBUTES TO YOUR PAGES
// =============================================================
// The spotlight tour looks for elements with data-tour-writer attributes.
// Add these to the matching elements in WritersRoomHome:
//
//   Founding 100 banner  → data-tour-writer="twr-founding"
//   Why TTL section      → data-tour-writer="twr-why"
//   How It Works section → data-tour-writer="twr-how"
//   Ink Economy section  → data-tour-writer="twr-ink"
//   Formats section      → data-tour-writer="twr-genres"
//   CTA / Apply button   → data-tour-writer="twr-submit"
//
// =============================================================
