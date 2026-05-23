"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// TWRNav + TWRFooter
// Shared navigation for all Writer's Room pages.
// Usage:
//   import { TWRNav, TWRFooter } from "@/app/components/TWRNav";
//   <TWRNav />
//   <div style={{ height: 74 }} />
//   ... page content ...
//   <TWRFooter />
// =========================

const TWR_NAV_STYLES = `
  .twr-shared-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 40;
    background: rgba(8,8,8,0.96);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201,168,76,0.25);
    box-shadow: 0 2px 40px rgba(0,0,0,0.7);
  }

  .twr-shared-nav-top-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, #C9A84C, #a78bfa, transparent);
  }

  .twr-shared-nav-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .twr-shared-nav-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
  }

  .twr-shared-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .twr-shared-logo {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    font-family: 'Times New Roman', Times, serif;
    font-size: 11px; font-weight: 700; color: #000;
    flex-shrink: 0;
    text-decoration: none;
  }

  .twr-shared-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }

  .twr-shared-brand-main {
    font-family: 'Times New Roman', Times, serif;
    font-size: 17px;
    font-weight: 400;
    color: #E2C97E;
    letter-spacing: 0.02em;
    text-decoration: none;
  }

  .twr-shared-brand-sub {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    color: rgba(255,255,255,0.32);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
  }

  .twr-shared-links {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-wrap: nowrap;
  }

  .twr-shared-link {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(240,236,226,0.75);
    text-decoration: none;
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
    background: none;
    cursor: pointer;
  }

  .twr-shared-link:hover {
    color: #E2C97E;
    border-color: rgba(201,168,76,0.38);
    background: rgba(201,168,76,0.1);
  }

  .twr-shared-link-apply {
    color: #000;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    border: none;
    border-radius: 999px;
    padding: 6px 18px;
    font-weight: 700;
  }

  .twr-shared-link-apply:hover {
    opacity: 0.88;
    color: #000;
    border-color: transparent;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
  }

  .twr-shared-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .twr-shared-spots {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'Times New Roman', Times, serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #a78bfa;
    border: 1px solid rgba(167,139,250,0.35);
    background: rgba(167,139,250,0.1);
    padding: 6px 14px;
    border-radius: 999px;
    white-space: nowrap;
  }

  .twr-shared-divider {
    width: 1px;
    height: 20px;
    background: rgba(255,255,255,0.1);
  }

  .twr-shared-auth-btn {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #fff;
    background: #6495ED;
    border: none;
    padding: 6px 18px;
    border-radius: 999px;
    text-decoration: none;
    white-space: nowrap;
    transition: opacity 0.2s;
    cursor: pointer;
  }

  .twr-shared-auth-btn:hover { opacity: 0.88; }

  /* Footer */
  .twr-shared-footer {
    margin-top: 72px;
    padding: 40px 40px 24px;
    border-top: 1px solid rgba(201,168,76,0.35);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    background: rgba(8,8,5,0.6);
  }

  .twr-shared-footer-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .twr-shared-footer-logo {
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    font-family: 'Times New Roman', Times, serif;
    font-size: 11px; font-weight: 700; color: #000;
    flex-shrink: 0;
    text-decoration: none;
  }

  .twr-shared-footer-name {
    font-family: 'Times New Roman', Times, serif;
    font-size: 18px;
    font-weight: 400;
    color: #E2C97E;
  }

  .twr-shared-footer-sub {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .twr-shared-footer-copy {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.3);
    text-transform: uppercase;
    text-align: center;
  }

  .twr-shared-footer-credit {
    font-size: 10px;
    letter-spacing: 0.1em;
    color: #C9A84C;
    text-decoration: none;
    font-family: 'Times New Roman', Times, serif;
    display: block;
    text-align: center;
    margin-top: 4px;
  }

  .twr-shared-footer-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .twr-shared-footer-btn {
    font-family: 'Times New Roman', Times, serif;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.7);
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.25);
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
    cursor: pointer;
  }

  .twr-shared-footer-btn:hover {
    color: #E2C97E;
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.15);
  }

  .twr-shared-footer-btn-primary {
    font-family: 'Times New Roman', Times, serif;
    font-size: 9px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #000;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    text-decoration: none;
    transition: opacity 0.2s;
    white-space: nowrap;
    font-weight: 700;
    cursor: pointer;
  }

  .twr-shared-footer-btn-primary:hover { opacity: 0.88; }

  @media (max-width: 768px) {
    .twr-shared-links { display: none; }
    .twr-shared-nav-inner { padding: 0 20px; }
    .twr-shared-divider { display: none; }
    .twr-shared-brand-sub { display: none; }
    .twr-shared-footer {
      padding: 32px 24px 24px;
      flex-direction: column;
      align-items: flex-start;
    }
    .twr-shared-footer-actions { justify-content: flex-start; }
  }

  @media (max-width: 480px) {
    .twr-shared-brand-main { font-size: 14px; }
    .twr-shared-spots { padding: 5px 10px; font-size: 10px; }
    .twr-shared-auth-btn { padding: 5px 12px; font-size: 10px; }
  }
`;

const SPOTS_LEFT = 87;

export function TWRNav() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <style>{TWR_NAV_STYLES}</style>
      <nav className="twr-shared-nav">
        <div className="twr-shared-nav-top-line" />
        <div className="twr-shared-nav-inner">
          <div className="twr-shared-nav-left">
            {/* Brand */}
            <div className="twr-shared-brand">
              <a href="https://www.the-tiniest-library.com" className="twr-shared-logo">TTL</a>
              <div className="twr-shared-brand-text">
                <a href="https://www.the-tiniest-library.com" className="twr-shared-brand-main">The Tiniest Library</a>
                <a href="https://write.the-tiniest-library.com" className="twr-shared-brand-sub">The Writer's Room</a>
              </div>
            </div>

            {/* Nav links */}
            <div className="twr-shared-links">
              <a href="https://write.the-tiniest-library.com" className="twr-shared-link">Home</a>
              <a href="/apply" className="twr-shared-link">Apply</a>
              <a href="/dashboard" className="twr-shared-link">Dashboard</a>
              <a href="https://read.the-tiniest-library.com/reading-room/how-it-works" className="twr-shared-link">How It Works</a>
              <a href="https://read.the-tiniest-library.com/reading-room" className="twr-shared-link">Reading Room</a>
              <a href="https://redroom.the-tiniest-library.com" className="twr-shared-link">Red Room</a>
            </div>
          </div>

          <div className="twr-shared-nav-right">
            <div className="twr-shared-spots">
              <span>🪶</span>
              <span>{SPOTS_LEFT} Spots Left</span>
            </div>
            <div className="twr-shared-divider" />
            {user ? (
              <a href="/dashboard" className="twr-shared-auth-btn">My Dashboard →</a>
            ) : (
              <a href="/apply" className="twr-shared-link twr-shared-link-apply">Apply Now →</a>
            )}
          </div>
        </div>
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
          <div className="twr-shared-footer-name">The Tiniest Library</div>
          <div className="twr-shared-footer-sub">The Writer's Room</div>
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
        <a href="/apply" className="twr-shared-footer-btn">Submit Your Story</a>
        <a href="/dashboard" className="twr-shared-footer-btn">Dashboard</a>
        <a href="https://read.the-tiniest-library.com/reading-room" className="twr-shared-footer-btn">Reading Room</a>
        <a href="https://redroom.the-tiniest-library.com" className="twr-shared-footer-btn">Red Room</a>
        <a href="https://read.the-tiniest-library.com/reading-room/how-it-works" className="twr-shared-footer-btn-primary">How It Works →</a>
      </div>
    </footer>
  );
}
