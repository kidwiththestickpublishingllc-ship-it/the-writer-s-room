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
 * Batch: Studio pass 1 — fonts, studio colours, the mat, nav and footer.
 */

const fs = require('fs');
const path = require('path');

const L = 'app/layout.tsx';
const G = 'app/globals.css';
const N = 'app/components/TWRNav.tsx';

const EDITS = [

  // ── layout.tsx: four studio fonts, mobile browser bar colour ───────
  {
    file: L, kind: 'exact',
    label: 'layout: import the studio fonts',
    from: `import type { Metadata } from "next";`,
    to: `import type { Metadata, Viewport } from "next";
import { Archivo, Courier_Prime, Caveat, Bangers } from "next/font/google";`,
  },
  {
    file: L, kind: 'exact',
    label: 'layout: set up the studio fonts',
    from: `import WritersTour from "./components/WritersTour";`,
    to: `import WritersTour from "./components/WritersTour";

// Studio fonts. Archivo = headings and buttons, Courier Prime = anything typed,
// Caveat = handwriting, Bangers = comic lettering (artist screens only).
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const bangers = Bangers({ subsets: ["latin"], weight: "400", variable: "--font-bangers", display: "swap" });`,
  },
  {
    file: L, kind: 'exact',
    label: 'layout: phone browser bar matches the cutting mat',
    from: `export default function RootLayout`,
    to: `export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#234A3D",
};

export default function RootLayout`,
  },
  {
    file: L, kind: 'exact',
    label: 'layout: fonts available to every page',
    from: `<html lang="en">`,
    to: `<html lang="en" className={\`\${archivo.variable} \${courier.variable} \${caveat.variable} \${bangers.variable}\`}>`,
  },

  // ── globals.css: studio colours, the mat, phone-safe basics, kit ───
  {
    file: G, kind: 'append',
    label: 'globals: studio colours, the cutting mat, phone basics, studio kit',
    marker: `The Creators Room — studio`,
    to: `
/* ═══════════════════════════════════════════════════════════════════
   The Creators Room — studio
   The desk is a green self-healing cutting mat. Work in progress is
   drawn in blue pencil; finished work is inked black.
   ═══════════════════════════════════════════════════════════════════ */

:root {
  --st-mat: #2E5B4C;
  --st-mat-deep: #234A3D;
  --st-grid: rgba(246,241,228,0.06);
  --st-grid-major: rgba(246,241,228,0.13);
  --st-on-mat: #F6F1E4;
  --st-on-mat-dim: rgba(246,241,228,0.78);

  --st-paper: #FBF8EF;
  --st-paper-line: #D8CFB8;
  --st-ink: #141414;
  --st-ink-soft: #4A4234;
  --st-margin-red: #8A2E2A;

  --st-pencil: #7FB2E5;          /* lines and outlines */
  --st-pencil-text: #3570A8;     /* pencil-coloured text on paper (passes contrast) */
  --st-pencil-on-mat: #A9CDF0;   /* pencil on the green mat */
  --st-stamp: #C8322F;

  --st-manila: #EAD5A4;
  --st-manila-tab: #D9BD80;
  --st-cork: #C59A68;
  --st-cork-frame: #7A4E2A;
  --st-postit: #FFE873;
  --st-postit-pink: #FFC2D4;
  --st-postit-teal: #A8F0E6;

  --st-teal: #14F1D9;            /* from The Galleria */
  --st-pink: #FF1493;            /* from The Galleria */
  --st-night: #0A0420;           /* from The Galleria */

  --st-font-ui: var(--font-archivo), Archivo, system-ui, sans-serif;
  --st-font-type: var(--font-courier), "Courier Prime", "Courier New", monospace;
  --st-font-hand: var(--font-caveat), Caveat, cursive;
  --st-font-comic: var(--font-bangers), Bangers, Impact, sans-serif;

  --st-max: 1200px;
}

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background-color: var(--st-mat);
  background-image:
    linear-gradient(var(--st-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--st-grid) 1px, transparent 1px),
    linear-gradient(var(--st-grid-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--st-grid-major) 1px, transparent 1px);
  background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
  color: var(--st-on-mat);
  font-family: var(--st-font-ui);
  overflow-x: clip;
}

/* Phones: 16px form text stops iPhones zooming in while you type */
@media (max-width: 768px) {
  input, select, textarea { font-size: 16px !important; }
}

:focus-visible { outline: 3px solid var(--st-pencil); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; }
}

/* ── The studio kit: shared pieces every page can use ─────────────── */

/* Content never stretches past 1200px, like the Reading Room and Galleria */
.st-wrap { max-width: var(--st-max); margin: 0 auto; padding: 0 32px; box-sizing: border-box; }
@media (max-width: 640px) { .st-wrap { padding: 0 16px; } }

/* A sheet of paper on the mat */
.st-paper {
  background: var(--st-paper); color: var(--st-ink);
  box-shadow: 0 2px 0 rgba(0,0,0,0.08), 0 16px 34px rgba(0,0,0,0.3);
}

/* Small typed label in margin red: "SPLIT AGREEMENT", "CARD 1" */
.st-label {
  font-family: var(--st-font-type); font-size: 13px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--st-margin-red);
}

/* An index card: red head rule, blue lines */
.st-card {
  position: relative; background-color: var(--st-paper); color: var(--st-ink);
  background-image: linear-gradient(#E0605A, #E0605A), repeating-linear-gradient(transparent 0 25px, #9CC3E6 25px 26px);
  background-size: 100% 2px, 100% 100%;
  background-position: 0 44px, 0 46px;
  background-repeat: no-repeat;
  padding: 16px 16px 20px;
  box-shadow: 0 6px 14px rgba(40,20,5,0.35);
}

/* Cork board in a wooden frame */
.st-cork {
  border: 12px solid var(--st-cork-frame); border-radius: 4px;
  background-color: var(--st-cork);
  background-image: radial-gradient(rgba(90,55,25,0.35) 1.2px, transparent 1.4px), radial-gradient(rgba(255,235,200,0.25) 1px, transparent 1.2px);
  background-size: 9px 11px, 13px 7px;
  background-position: 0 0, 4px 3px;
  box-shadow: inset 0 0 36px rgba(60,30,10,0.35), 0 16px 34px rgba(0,0,0,0.3);
}

/* A post-it */
.st-postit {
  background: var(--st-postit); color: #2A2418;
  font-family: var(--st-font-hand); font-weight: 700;
  padding: 22px 20px; box-shadow: 0 10px 18px rgba(0,0,0,0.3);
}

/* Buttons: pencil (draft actions), ink (confirm), stamp (the one big action) */
.st-pencil-btn, .st-ink-btn, .st-stamp {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 44px; box-sizing: border-box; cursor: pointer; text-decoration: none;
  font-family: var(--st-font-ui); font-size: 15px; font-weight: 600;
}
.st-pencil-btn { padding: 0 18px; border: 2px dashed var(--st-pencil); border-radius: 3px; background: transparent; color: var(--st-pencil-text); }
.st-pencil-btn:hover { border-style: solid; border-color: var(--st-ink); color: var(--st-ink); }
.st-ink-btn { padding: 0 20px; border: 2px solid var(--st-ink); border-radius: 3px; background: var(--st-ink); color: var(--st-paper); }
.st-ink-btn:hover { background: var(--st-paper); color: var(--st-ink); }
.st-stamp {
  padding: 0 24px; min-height: 52px; border: 3px solid var(--st-stamp); outline: 2px solid var(--st-stamp); outline-offset: 3px;
  border-radius: 4px; background: var(--st-paper); color: var(--st-stamp);
  font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase;
  transform: rotate(-2.5deg); transition: transform 0.12s;
}
.st-stamp:hover { transform: rotate(-1deg) scale(1.03); color: var(--st-stamp); }
.st-stamp:active { transform: rotate(-1deg) scale(0.97); }
.st-pencil-btn:disabled, .st-ink-btn:disabled, .st-stamp:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

/* On the mat, pencil buttons draw in light blue and ink in cream */
.st-on-mat .st-pencil-btn { border-color: var(--st-pencil-on-mat); color: var(--st-on-mat); }
.st-on-mat .st-pencil-btn:hover { border-color: var(--st-on-mat); color: var(--st-on-mat); }
`,
  },

  // ── TWRNav.tsx: new styles (same class names, so every link keeps working)
  {
    file: N, kind: 'block',
    label: 'nav: studio styles for the nav, the phone menu and the footer',
    start: 'const TWR_NAV_STYLES = `',
    end: 'const SPOTS_LEFT = 87;',
    to: `const TWR_NAV_STYLES = \`
  /* ── Nav: the top edge of the cutting mat ── */
  .twr-shared-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 40;
    background-color: var(--st-mat-deep, #234A3D);
    border-bottom: 1px solid rgba(246,241,228,0.18);
    box-shadow: 0 6px 18px rgba(0,0,0,0.28);
    font-family: var(--st-font-ui, system-ui, sans-serif);
  }

  /* The ruler along the top edge */
  .twr-shared-nav-top-line {
    height: 8px;
    background-image:
      repeating-linear-gradient(90deg, rgba(246,241,228,0.5) 0 1px, transparent 1px 10px),
      repeating-linear-gradient(90deg, rgba(246,241,228,0.85) 0 1px, transparent 1px 50px);
    background-size: 100% 4px, 100% 8px;
    background-repeat: no-repeat;
  }

  .twr-shared-nav-inner {
    max-width: var(--st-max, 1200px);
    margin: 0 auto;
    padding: 0 32px;
    height: 66px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .twr-shared-nav-left { display: flex; align-items: center; gap: 30px; min-width: 0; flex: 1; }
  .twr-shared-brand { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

  /* The TTL rubber stamp */
  .twr-shared-logo {
    width: 42px; height: 42px;
    display: flex; align-items: center; justify-content: center;
    border: 2.5px solid var(--st-on-mat, #F6F1E4);
    border-radius: 50%;
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 13px; font-weight: 900; letter-spacing: 0.06em;
    color: var(--st-on-mat, #F6F1E4);
    text-decoration: none;
    transform: rotate(-8deg);
    transition: transform 0.15s;
    flex-shrink: 0;
  }
  .twr-shared-logo:hover { transform: rotate(-2deg); }

  .twr-shared-brand-text { display: flex; flex-direction: column; line-height: 1.15; }
  .twr-shared-brand-main {
    font-family: var(--st-font-type, monospace);
    font-size: 18px; font-weight: 700;
    color: var(--st-on-mat, #F6F1E4);
    text-decoration: none; white-space: nowrap;
  }
  .twr-shared-brand-sub {
    font-family: var(--st-font-type, monospace);
    font-size: 12px;
    color: var(--st-on-mat-dim, rgba(246,241,228,0.78));
    text-decoration: none; white-space: nowrap;
  }

  .twr-shared-links { display: flex; align-items: center; gap: 4px 20px; flex-wrap: nowrap; }

  .twr-shared-link {
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 15px; font-weight: 600;
    color: var(--st-on-mat, #F6F1E4);
    text-decoration: none;
    text-underline-offset: 6px;
    text-decoration-thickness: 2px;
    padding: 10px 2px;
    background: none; border: none;
    cursor: pointer; white-space: nowrap;
  }
  .twr-shared-link:hover {
    color: #ffffff;
    text-decoration: underline;
    text-decoration-color: var(--st-pencil-on-mat, #A9CDF0);
  }

  /* Apply is the red rubber stamp */
  .twr-shared-link-apply {
    display: inline-flex; align-items: center;
    min-height: 40px; padding: 0 16px;
    background: var(--st-paper, #FBF8EF);
    color: var(--st-stamp, #C8322F);
    border: 2.5px solid var(--st-stamp, #C8322F);
    outline: 1.5px solid var(--st-stamp, #C8322F);
    outline-offset: 2px;
    border-radius: 3px;
    font-size: 14px; font-weight: 900;
    letter-spacing: 0.1em; text-transform: uppercase;
    transform: rotate(-2.5deg);
    transition: transform 0.12s;
  }
  .twr-shared-link-apply:hover {
    color: var(--st-stamp, #C8322F);
    text-decoration: none;
    transform: rotate(-1deg) scale(1.04);
  }

  .twr-shared-nav-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }

  /* Founding spots: a post-it stuck to the edge of the mat */
  .twr-shared-spots {
    font-family: var(--st-font-hand, cursive);
    font-size: 20px; font-weight: 700; line-height: 1.2;
    color: #2A2418;
    background: var(--st-postit, #FFE873);
    padding: 3px 12px;
    transform: rotate(2deg);
    box-shadow: 0 3px 6px rgba(0,0,0,0.3);
    white-space: nowrap;
  }

  .twr-shared-divider { width: 1px; height: 26px; background: rgba(246,241,228,0.2); }

  /* Sign in / out: a blue-pencil button that inks in on hover */
  .twr-shared-auth-btn {
    display: inline-flex; align-items: center;
    min-height: 40px; padding: 0 16px;
    border: 2px dashed var(--st-pencil-on-mat, #A9CDF0);
    border-radius: 3px;
    background: transparent;
    color: var(--st-on-mat, #F6F1E4);
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 15px; font-weight: 600;
    text-decoration: none; white-space: nowrap; cursor: pointer;
  }
  .twr-shared-auth-btn:hover { border-style: solid; border-color: var(--st-on-mat, #F6F1E4); }

  /* Phone menu button and the index-card menu it opens */
  .twr-shared-menu-btn {
    display: none;
    align-items: center; justify-content: center; gap: 8px;
    min-height: 44px; min-width: 44px; padding: 0 12px;
    border: 2px dashed var(--st-pencil-on-mat, #A9CDF0);
    border-radius: 3px;
    background: transparent;
    color: var(--st-on-mat, #F6F1E4);
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 15px; font-weight: 600;
    cursor: pointer;
  }
  .twr-shared-menu-btn[aria-expanded="true"] { border-style: solid; }

  .twr-shared-sheet { display: none; }
  .twr-shared-sheet-card {
    max-width: 520px;
    margin: 0 16px 16px auto;
    background-color: var(--st-paper, #FBF8EF);
    background-image: linear-gradient(#E0605A, #E0605A);
    background-size: 100% 2px;
    background-position: 0 40px;
    background-repeat: no-repeat;
    box-shadow: 0 16px 34px rgba(0,0,0,0.4);
    padding: 12px 0 8px;
  }
  .twr-shared-sheet-label {
    padding: 0 18px 14px;
    font-family: var(--st-font-type, monospace);
    font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
    color: var(--st-margin-red, #8A2E2A);
  }
  .twr-shared-sheet-card a,
  .twr-shared-sheet-card button {
    display: flex; align-items: center;
    width: 100%; min-height: 50px; padding: 0 18px;
    box-sizing: border-box;
    border: none; border-bottom: 1px solid #9CC3E6;
    background: transparent;
    color: var(--st-ink, #141414);
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 17px; font-weight: 600;
    text-align: left; text-decoration: none; cursor: pointer;
  }
  .twr-shared-sheet-card a:last-child,
  .twr-shared-sheet-card button:last-child { border-bottom: none; }
  .twr-shared-sheet-card a:hover,
  .twr-shared-sheet-card button:hover { background: rgba(127,178,229,0.15); }

  /* ── Footer: the bottom edge of the mat ── */
  .twr-shared-footer {
    margin-top: 72px;
    padding: 36px max(32px, calc((100% - 1200px) / 2)) 30px;
    background-color: var(--st-mat-deep, #234A3D);
    background-image:
      repeating-linear-gradient(90deg, rgba(246,241,228,0.5) 0 1px, transparent 1px 10px),
      repeating-linear-gradient(90deg, rgba(246,241,228,0.85) 0 1px, transparent 1px 50px);
    background-size: 100% 4px, 100% 8px;
    background-repeat: no-repeat;
    border-top: 1px solid rgba(246,241,228,0.18);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px 28px;
    flex-wrap: wrap;
    font-family: var(--st-font-type, monospace);
  }

  .twr-shared-footer-brand { display: flex; align-items: center; gap: 12px; }

  .twr-shared-footer-logo {
    width: 42px; height: 42px;
    display: flex; align-items: center; justify-content: center;
    border: 2.5px solid var(--st-on-mat, #F6F1E4);
    border-radius: 50%;
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 13px; font-weight: 900; letter-spacing: 0.06em;
    color: var(--st-on-mat, #F6F1E4);
    text-decoration: none;
    transform: rotate(-8deg);
    flex-shrink: 0;
  }

  .twr-shared-footer-name { font-size: 18px; font-weight: 700; color: var(--st-on-mat, #F6F1E4); }
  .twr-shared-footer-sub { font-size: 13px; color: var(--st-on-mat-dim, rgba(246,241,228,0.78)); }
  .twr-shared-footer-copy { font-size: 13px; color: var(--st-on-mat-dim, rgba(246,241,228,0.78)); text-align: center; }
  .twr-shared-footer-credit {
    display: block; margin-top: 4px; text-align: center;
    font-size: 13px; color: var(--st-pencil-on-mat, #A9CDF0); text-decoration: none;
  }
  .twr-shared-footer-credit:hover { text-decoration: underline; }

  .twr-shared-footer-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }

  .twr-shared-footer-btn {
    display: inline-flex; align-items: center;
    min-height: 44px; padding: 0 14px;
    border: 2px dashed var(--st-pencil-on-mat, #A9CDF0);
    border-radius: 3px;
    color: var(--st-on-mat, #F6F1E4);
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 14px; font-weight: 600;
    text-decoration: none; white-space: nowrap;
  }
  .twr-shared-footer-btn:hover { border-style: solid; border-color: var(--st-on-mat, #F6F1E4); }

  .twr-shared-footer-btn-primary {
    display: inline-flex; align-items: center;
    min-height: 44px; padding: 0 16px;
    background: var(--st-paper, #FBF8EF);
    color: var(--st-stamp, #C8322F);
    border: 2.5px solid var(--st-stamp, #C8322F);
    outline: 1.5px solid var(--st-stamp, #C8322F);
    outline-offset: 2px;
    border-radius: 3px;
    font-family: var(--st-font-ui, system-ui, sans-serif);
    font-size: 13px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; white-space: nowrap;
    transform: rotate(-2deg);
  }

  /* ── Tablets and phones ── */
  @media (max-width: 1080px) {
    .twr-shared-links { display: none; }
    .twr-shared-divider { display: none; }
    .twr-shared-menu-btn { display: inline-flex; }
    .twr-shared-sheet { display: block; }
  }

  @media (max-width: 768px) {
    .twr-shared-footer {
      padding: 32px 16px 28px;
      flex-direction: column;
      align-items: flex-start;
    }
    .twr-shared-footer-copy, .twr-shared-footer-credit { text-align: left; }
    .twr-shared-footer-actions { justify-content: flex-start; }
  }

  @media (max-width: 640px) {
    .twr-shared-nav-inner { padding: 0 16px; gap: 10px; }
    .twr-shared-spots { display: none; }
    .twr-shared-brand-sub { display: none; }
    .twr-shared-brand-main { font-size: 16px; }
    .twr-hide-sm { display: none !important; }
    .twr-shared-link-apply { padding: 0 12px; font-size: 13px; }
  }

  @media (max-width: 380px) {
    .twr-shared-brand-text { display: none; }
  }
\`;

`,
  },

  // ── TWRNav.tsx: the nav itself — stamp logo, new name, phone menu ──
  {
    file: N, kind: 'block',
    label: 'nav: stamp logo, The Creators Room name, sign in OR out, phone menu',
    start: 'export function TWRNav() {',
    end: 'export function TWRFooter() {',
    to: `export function TWRNav() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? null);
    });
  }, []);

  const isAdmin = userEmail === "kidwiththestickpublishingllc@gmail.com";
  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  return (
    <>
      <style>{TWR_NAV_STYLES}</style>
      <nav className="twr-shared-nav" aria-label="The Creators Room">
        <div className="twr-shared-nav-top-line" aria-hidden="true" />
        <div className="twr-shared-nav-inner">
          <div className="twr-shared-nav-left">
            {/* Brand: the TTL stamp and the room's name */}
            <div className="twr-shared-brand">
              <a href="https://www.the-tiniest-library.com" className="twr-shared-logo" aria-label="The Tiniest Library">TTL</a>
              <div className="twr-shared-brand-text">
                <a href="https://write.the-tiniest-library.com" className="twr-shared-brand-main">The Creators Room</a>
                <a href="https://www.the-tiniest-library.com" className="twr-shared-brand-sub">at The Tiniest Library</a>
              </div>
            </div>

            {/* Nav links (desktop) */}
            <div className="twr-shared-links">
              <a href="https://write.the-tiniest-library.com" className="twr-shared-link">Home</a>
              <a href="/apply" className="twr-shared-link">Apply</a>
              <a href="/dashboard" className="twr-shared-link">Dashboard</a>
              <a href="https://read.the-tiniest-library.com/reading-room/how-it-works" className="twr-shared-link">How It Works</a>
              <a href="https://read.the-tiniest-library.com/reading-room" className="twr-shared-link">Reading Room</a>
              <a href="https://artists.the-tiniest-library.com" className="twr-shared-link">The Galleria</a>
            </div>
          </div>

          <div className="twr-shared-nav-right">
            <div className="twr-shared-spots">{SPOTS_LEFT} Founding spots left</div>
            <div className="twr-shared-divider" />
            <a href="/apply" className="twr-shared-link twr-shared-link-apply">Apply</a>
            {isAdmin && (
              <a href="/ttl-admin" className="twr-shared-link twr-hide-sm">Admin</a>
            )}
            {userEmail ? (
              <button className="twr-shared-auth-btn twr-hide-sm" onClick={signOut}>Sign Out</button>
            ) : (
              <a href="/login" className="twr-shared-auth-btn twr-hide-sm">Sign In</a>
            )}
            <button
              className="twr-shared-menu-btn"
              aria-expanded={menuOpen}
              aria-controls="twr-shared-sheet"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Phone and tablet menu: an index card */}
        {menuOpen && (
          <div className="twr-shared-sheet" id="twr-shared-sheet">
            <div className="twr-shared-sheet-card">
              <div className="twr-shared-sheet-label">THE CREATORS ROOM</div>
              <a href="https://write.the-tiniest-library.com">Home</a>
              <a href="/apply">Apply</a>
              <a href="/dashboard">Dashboard</a>
              <a href="https://read.the-tiniest-library.com/reading-room/how-it-works">How It Works</a>
              <a href="https://read.the-tiniest-library.com/reading-room">Reading Room</a>
              <a href="https://artists.the-tiniest-library.com">The Galleria</a>
              {isAdmin && <a href="/ttl-admin">Admin</a>}
              {userEmail ? (
                <button onClick={signOut}>Sign Out</button>
              ) : (
                <a href="/login">Sign In</a>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

`,
  },

  // ── TWRNav.tsx: footer names and buttons ───────────────────────────
  {
    file: N, kind: 'exact',
    label: 'footer: room name first',
    from: `<div className="twr-shared-footer-name">The Tiniest Library</div>`,
    to: `<div className="twr-shared-footer-name">The Creators Room</div>`,
  },
  {
    file: N, kind: 'exact',
    label: 'footer: library name second',
    from: `<div className="twr-shared-footer-sub">The Creators Room</div>`,
    to: `<div className="twr-shared-footer-sub">at The Tiniest Library</div>`,
  },
  {
    file: N, kind: 'exact',
    label: 'footer: submit covers stories and comics',
    from: `<a href="/apply" className="twr-shared-footer-btn">Submit Your Story</a>`,
    to: `<a href="/apply" className="twr-shared-footer-btn">Submit Your Work</a>`,
  },
  {
    file: N, kind: 'exact',
    label: 'footer: add The Galleria',
    from: `<a href="https://read.the-tiniest-library.com/reading-room" className="twr-shared-footer-btn">Reading Room</a>`,
    to: `<a href="https://read.the-tiniest-library.com/reading-room" className="twr-shared-footer-btn">Reading Room</a>
        <a href="https://artists.the-tiniest-library.com" className="twr-shared-footer-btn">The Galleria</a>`,
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

  if (e.to && f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
  const hits = count(f.text, e.from);
  if (hits === 1) {
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true; ok++; report('✓', 'will change', e);
  } else if (hits > 1) {
    ambiguous++; report('✗', `AMBIGUOUS ${hits}×`, e);
  } else {
    missing++; report('✗', 'NOT FOUND', e);
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