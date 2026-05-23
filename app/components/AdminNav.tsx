"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// AdminNav
// Minimal admin-only navigation. Completely separate from public nav.
// Signals clearly: "you are behind the curtain."
// Usage:
//   import { AdminNav } from "@/app/components/AdminNav";
//   <AdminNav />
//   <div style={{ height: 64 }} />
//   ... admin content ...
// =========================

const ADMIN_NAV_STYLES = `
  .admin-nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 40;
    background: #0d0608;
    border-bottom: 1px solid rgba(201,76,76,0.3);
    box-shadow: 0 2px 24px rgba(0,0,0,0.8);
  }

  .admin-nav-alert-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, #c94c4c, #C9A84C, transparent);
  }

  .admin-nav-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 40px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .admin-nav-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }

  .admin-nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    text-decoration: none;
  }

  .admin-nav-logo {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    background: linear-gradient(135deg, #C9A84C, #8a6510);
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px; font-weight: 700; color: #000;
    flex-shrink: 0;
  }

  .admin-nav-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
  }

  .admin-nav-brand-main {
    font-family: 'Times New Roman', Times, serif;
    font-size: 14px;
    font-weight: 400;
    color: #E2C97E;
    letter-spacing: 0.02em;
  }

  .admin-badge {
    font-family: 'Times New Roman', Times, serif;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #c94c4c;
    background: rgba(201,76,76,0.12);
    border: 1px solid rgba(201,76,76,0.35);
    padding: 2px 8px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .admin-nav-links {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .admin-nav-link {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(240,236,226,0.5);
    text-decoration: none;
    padding: 5px 12px;
    border-radius: 4px;
    border: 1px solid transparent;
    transition: all 0.2s;
    white-space: nowrap;
    cursor: pointer;
    background: none;
  }

  .admin-nav-link:hover {
    color: #E2C97E;
    border-color: rgba(201,168,76,0.3);
    background: rgba(201,168,76,0.08);
  }

  .admin-nav-link.active {
    color: #E2C97E;
    border-color: rgba(201,168,76,0.3);
    background: rgba(201,168,76,0.08);
  }

  .admin-nav-link-danger {
    color: rgba(201,76,76,0.7);
  }

  .admin-nav-link-danger:hover {
    color: #f87171;
    border-color: rgba(201,76,76,0.3);
    background: rgba(201,76,76,0.08);
  }

  .admin-nav-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .admin-nav-user {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11px;
    color: rgba(240,236,226,0.4);
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  .admin-nav-user span {
    color: rgba(240,236,226,0.7);
    font-weight: 600;
  }

  .admin-nav-divider {
    width: 1px;
    height: 18px;
    background: rgba(255,255,255,0.08);
  }

  .admin-signout {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(201,76,76,0.7);
    background: transparent;
    border: 1px solid rgba(201,76,76,0.25);
    padding: 5px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .admin-signout:hover {
    color: #f87171;
    border-color: rgba(201,76,76,0.5);
    background: rgba(201,76,76,0.08);
  }

  .admin-view-site {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(240,236,226,0.5);
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 5px 14px;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .admin-view-site:hover {
    color: #E2C97E;
    border-color: rgba(201,168,76,0.3);
    background: rgba(201,168,76,0.08);
  }

  @media (max-width: 900px) {
    .admin-nav-inner { padding: 0 20px; }
    .admin-nav-links { display: none; }
    .admin-nav-user { display: none; }
  }
`;

const ADMIN_LINKS = [
  { label: "Dashboard", href: "/ttl-admin" },
  { label: "Submissions", href: "/ttl-admin/submissions" },
  { label: "Writers", href: "/ttl-admin/writers" },
  { label: "Stories", href: "/ttl-admin/stories" },
  { label: "Chapters", href: "/ttl-admin/chapters" },
  { label: "Settings", href: "/ttl-admin/settings" },
];

export function AdminNav() {
  const [user, setUser] = useState<any>(null);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const displayName = user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Admin";

  return (
    <>
      <style>{ADMIN_NAV_STYLES}</style>
      <nav className="admin-nav">
        <div className="admin-nav-alert-line" />
        <div className="admin-nav-inner">
          <div className="admin-nav-left">
            {/* Brand */}
            <a href="https://www.the-tiniest-library.com" className="admin-nav-brand">
              <div className="admin-nav-logo">TTL</div>
              <div className="admin-nav-brand-text">
                <span className="admin-nav-brand-main">The Tiniest Library</span>
              </div>
            </a>

            <div className="admin-badge">⚙ Admin</div>

            {/* Admin links */}
            <div className="admin-nav-links">
              {ADMIN_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`admin-nav-link${currentPath === link.href ? " active" : ""}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="admin-nav-right">
            {user && (
              <span className="admin-nav-user">
                Logged in as <span>{displayName}</span>
              </span>
            )}
            <div className="admin-nav-divider" />
            <a
              href="https://read.the-tiniest-library.com/reading-room"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-view-site"
            >
              View Site ↗
            </a>
            <button onClick={handleSignOut} className="admin-signout">
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
