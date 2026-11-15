"use client";

/**
 * ComicPages.tsx
 * ─────────────────────────────────────────────────────────────────
 * Creator HQ — splits a dashboard tab into comic-book pages instead of
 * stuffing everything onto one long screen.
 *
 * Place at: app/components/ComicPages.tsx (the-writers-room)
 *
 * Usage inside any tab:
 *   import ComicPages from "@/app/components/ComicPages";
 *   <ComicPages pages={[
 *     { label: "Your desk", content: <>...</> },
 *     { label: "Community", content: <>...</> },
 *   ]} />
 *
 * One page → shows it with no page controls.
 * Two or more → a strip of page buttons on top, "Continued on page 2 →"
 * at the bottom, and the view scrolls back up to the top of the page.
 * ─────────────────────────────────────────────────────────────────
 */

import { ReactNode, useRef, useState } from "react";

type ComicPage = { label: string; content: ReactNode };

const STYLES = `
  .cp-root { scroll-margin-top: 96px; }

  .cp-strip { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
  .cp-chip {
    display: flex; flex-direction: column; align-items: flex-start; gap: 1px;
    min-height: 48px; padding: 6px 14px;
    background: #FFFFFF; color: #111111;
    border: 2.5px solid #111111; border-radius: 0; box-shadow: 3px 3px 0 #111111;
    text-align: left; cursor: pointer;
    transition: transform 0.08s, box-shadow 0.08s, background 0.08s;
  }
  .cp-chip:hover { background: #FFF7C2; }
  .cp-chip.on { background: #FFE14D; transform: translate(-2px, -2px); box-shadow: 5px 5px 0 #111111; }
  .cp-chip-num {
    font-family: var(--st-font-comic, Impact, sans-serif);
    font-size: 15px; letter-spacing: 0.06em; color: #E8322E;
  }
  .cp-chip-label { font-family: var(--st-font-ui, system-ui, sans-serif); font-size: 13px; font-weight: 800; }

  .cp-page { animation: cp-in 0.25s ease; }
  @keyframes cp-in { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }

  .cp-foot {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
    margin-top: 32px; padding-top: 18px; border-top: 4px solid #111111;
  }
  .cp-num {
    font-family: var(--st-font-comic, Impact, sans-serif);
    font-size: 18px; letter-spacing: 0.06em; color: #111111;
  }
  .cp-turn {
    min-height: 46px; padding: 0 18px;
    background: #FFE14D; color: #111111;
    border: 3px solid #111111; border-radius: 0; box-shadow: 4px 4px 0 #111111;
    font-family: var(--st-font-comic, Impact, sans-serif);
    font-size: 18px; letter-spacing: 0.05em; text-transform: uppercase;
    cursor: pointer; transition: transform 0.08s, box-shadow 0.08s;
  }
  .cp-turn.prev { background: #FFFFFF; }
  .cp-turn:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #111111; }
  .cp-turn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #111111; }

  @media (max-width: 520px) {
    .cp-foot { flex-direction: column; align-items: stretch; }
    .cp-num { text-align: center; }
    .cp-turn { width: 100%; }
  }
`;

export default function ComicPages({ pages }: { pages: ComicPage[] }) {
  const [current, setCurrent] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);

  if (pages.length === 0) return null;
  const index = Math.min(current, pages.length - 1);
  const page = pages[index];
  const many = pages.length > 1;

  const turnTo = (n: number) => {
    setCurrent(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="cp-root" ref={topRef}>
      <style>{STYLES}</style>

      {many && (
        <nav className="cp-strip" aria-label="Pages">
          {pages.map((p, n) => (
            <button
              key={p.label}
              className={`cp-chip${n === index ? " on" : ""}`}
              aria-current={n === index ? "page" : undefined}
              onClick={() => turnTo(n)}
            >
              <span className="cp-chip-num">PAGE {n + 1}</span>
              <span className="cp-chip-label">{p.label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="cp-page" key={index}>
        {page.content}
      </div>

      {many && (
        <div className="cp-foot">
          {index > 0 ? (
            <button className="cp-turn prev" onClick={() => turnTo(index - 1)}>
              ← Back to page {index}
            </button>
          ) : (
            <span />
          )}
          <span className="cp-num">PAGE {index + 1} OF {pages.length}</span>
          {index < pages.length - 1 ? (
            <button className="cp-turn" onClick={() => turnTo(index + 1)}>
              Continued on page {index + 2} →
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
