"use client";


import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// TWRNav + TWRFooter
// Shared navigation for all Creators Room pages.
// Usage:
//   import { TWRNav, TWRFooter } from "@/app/components/TWRNav";
//   <TWRNav />
//   <div style={{ height: 74 }} />
//   ... page content ...
//   <TWRFooter />
// =========================

const TWR_NAV_STYLES = `
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
`;

const SPOTS_LEFT = 87;

export function TWRNav() {
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

export function TWRFooter() {
  return (
    <footer className="twr-shared-footer">
      <div className="twr-shared-footer-brand">
        <a href="https://www.the-tiniest-library.com" className="twr-shared-footer-logo">TTL</a>
        <div>
          <div className="twr-shared-footer-name">The Creators Room</div>
          <div className="twr-shared-footer-sub">at The Tiniest Library</div>
        </div>
      </div>

      <div>
        <div className="twr-shared-footer-copy">
          © {new Date().getFullYear()} The Tiniest Library. All rights reserved.
        </div>
        <a
          href="https://www.kidwiththestick.com"
          target="_blank"
          rel="noopener noreferrer"
          className="twr-shared-footer-credit"
        >
          A company of Kid With The Stick Publishing
        </a>
      </div>

      <div className="twr-shared-footer-actions">
        <a href="/apply" className="twr-shared-footer-btn">Submit Your Work</a>
        <a href="/dashboard" className="twr-shared-footer-btn">Dashboard</a>
        <a href="https://read.the-tiniest-library.com/reading-room" className="twr-shared-footer-btn">Reading Room</a>
        <a href="https://artists.the-tiniest-library.com" className="twr-shared-footer-btn">The Galleria</a>
        <a href="https://read.the-tiniest-library.com/reading-room/how-it-works" className="twr-shared-footer-btn-primary">How It Works →</a>
      </div>
    </footer>
  );
}
