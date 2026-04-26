"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// =========================
// Route: app/apply/page.tsx
// TTL Writer Application — /apply
// =========================

const TTL_SUBMIT_URL = "https://write.the-tiniest-library.com/apply";
const TTL_WRITERS_ROOM = "https://write.the-tiniest-library.com";

const ALL_GENRES = [
  "Fantasy", "Sci-Fi", "Horror Mystery", "Crime & Thrillers",
  "Romance", "Young Adult", "New Adult", "Children's Literature",
  "Cozy", "Poems & Memoirs", "Adventure", "Contemporary Fiction",
  "Historical Fiction", "Serialized Fiction", "Fan Fiction",
  "Slice Of Life", "Dark Academia", "Multi-Cultural", "Black Stories",
  "Latin Stories", "AAPI Authors", "Indigenous Stories",
  "LGBTQ+ Fiction", "Adult 18+",
];

type Step = 1 | 2 | 3 | 4;

type FormData = {
  full_name: string;
  pen_name: string;
  email: string;
  password: string;
  bio: string;
  why_ttl: string;
  genres: string[];
  writing_sample: string;
  twitter_url: string;
  instagram_url: string;
  website_url: string;
};

const EMPTY_FORM: FormData = {
  full_name: "", pen_name: "", email: "", password: "", bio: "",
  why_ttl: "", genres: [], writing_sample: "",
  twitter_url: "", instagram_url: "", website_url: "",
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Syne:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #C9A84C; --gold-light: #E2C97E; --gold-dim: rgba(201,168,76,0.35);
    --gold-glow: rgba(201,168,76,0.10); --quill: #9b6dff;
    --blue: #6495ED; --blue-dim: rgba(100,149,237,0.22);
    --ink-bg: #6495ED; --ink-surface: #0f0f0f; --ink-surface2: #161616;
    --ink-border: rgba(255,255,255,0.07); --ink-border-gold: rgba(201,168,76,0.22);
    --text-main: #f0ece2; --text-dim: rgba(232,228,218,0.5);
    --text-faint: rgba(232,228,218,0.25);
  }

  .ap-root {
    min-height: 100vh; background: var(--ink-bg);
    font-family: 'Syne', sans-serif; color: var(--text-main);
    overflow-x: hidden;
  }

  /* Noise texture */
  .ap-root::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  /* NAV */
  .ap-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 40;
    background: rgba(6,6,6,0.97); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--ink-border-gold);
  }
  .ap-nav-line { height: 2px; background: linear-gradient(90deg, transparent, var(--gold), var(--quill), var(--gold), transparent); }
  .ap-nav-inner {
    max-width: 1100px; margin: 0 auto; padding: 0 40px; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ap-nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
  .ap-nav-logo {
    width: 34px; height: 34px; border-radius: 7px;
    background: linear-gradient(135deg, var(--gold), #7a5510);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #000;
  }
  .ap-nav-brand-main { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 400; color: var(--gold-light); }
  .ap-nav-brand-sub { font-size: 9px; color: rgba(255,255,255,0.28); letter-spacing: 0.12em; text-transform: uppercase; }
  .ap-nav-back {
    font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--text-faint); text-decoration: none; border: 1px solid var(--ink-border);
    padding: 6px 14px; border-radius: 4px; transition: all 0.2s;
  }
  .ap-nav-back:hover { color: var(--gold-light); border-color: var(--gold-dim); background: var(--gold-glow); }
  .ap-spacer { height: 68px; }

  /* HERO */
  .ap-hero {
    max-width: 1100px; margin: 0 auto; padding: 72px 40px 56px;
    position: relative; z-index: 1;
    border-bottom: 1px solid var(--ink-border);
  }
  .ap-hero-eyebrow {
    font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase;
    color: var(--gold); display: block; margin-bottom: 16px; opacity: 0.8;
  }
  .ap-hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(44px, 6vw, 80px); font-weight: 300; line-height: 0.95;
    color: var(--text-main); margin-bottom: 20px;
  }
  .ap-hero-title em { font-style: italic; color: var(--gold-light); }
  .ap-hero-sub {
    font-size: 13px; color: var(--text-dim); max-width: 560px;
    line-height: 1.85; margin-bottom: 32px;
  }
  .ap-hero-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .ap-hero-pill {
    font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 999px;
    border: 1px solid var(--ink-border); color: var(--text-faint);
    display: flex; align-items: center; gap: 6px;
  }
  .ap-hero-pill span { color: var(--gold); }

  /* PROGRESS */
  .ap-progress-wrap {
    max-width: 1100px; margin: 0 auto; padding: 32px 40px 0;
    position: relative; z-index: 1;
  }
  .ap-progress { display: flex; align-items: center; gap: 0; }
  .ap-progress-step {
    flex: 1; display: flex; align-items: center; gap: 10px;
    padding: 14px 0; cursor: pointer;
    border-bottom: 2px solid var(--ink-border);
    transition: all 0.25s;
  }
  .ap-progress-step.active { border-bottom-color: var(--gold); }
  .ap-progress-step.done { border-bottom-color: rgba(74,222,128,0.4); }
  .ap-step-num {
    width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700;
    border: 1px solid rgba(255,255,255,0.15); color: var(--text-faint);
    transition: all 0.25s;
  }
  .ap-progress-step.active .ap-step-num { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
  .ap-progress-step.done .ap-step-num { border-color: rgba(74,222,128,0.5); color: rgba(74,222,128,0.8); background: rgba(74,222,128,0.08); }
  .ap-step-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-faint); transition: color 0.25s; }
  .ap-progress-step.active .ap-step-label { color: var(--gold-light); }
  .ap-progress-step.done .ap-step-label { color: rgba(74,222,128,0.7); }
  .ap-progress-connector { width: 24px; flex-shrink: 0; height: 1px; background: var(--ink-border); }

  /* FORM */
  .ap-form-wrap {
    max-width: 1100px; margin: 0 auto; padding: 48px 40px 96px;
    position: relative; z-index: 1;
  }
  .ap-form-grid { display: grid; grid-template-columns: 1fr 340px; gap: 48px; align-items: start; }

  /* Fields */
  .ap-section-title {
    font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300;
    color: var(--text-main); margin-bottom: 6px; line-height: 1;
  }
  .ap-section-sub { font-size: 12px; color: var(--text-faint); line-height: 1.6; margin-bottom: 32px; }
  .ap-field { margin-bottom: 24px; }
  .ap-field-label {
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--text-faint); display: flex; align-items: center;
    gap: 6px; margin-bottom: 8px;
  }
  .ap-field-label .req { color: var(--gold); }
  .ap-input {
    width: 100%; background: var(--ink-surface);
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 12px 16px; font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-main); outline: none;
    transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none;
  }
  .ap-input::placeholder { color: var(--text-faint); }
  .ap-input:focus { border-color: var(--gold-dim); background: rgba(201,168,76,0.03); }
  .ap-textarea {
    width: 100%; background: var(--ink-surface);
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 14px 16px; font-family: 'Syne', sans-serif;
    font-size: 13px; color: var(--text-main); outline: none;
    resize: vertical; line-height: 1.7;
    transition: border-color 0.2s, background 0.2s;
    min-height: 120px;
  }
  .ap-textarea::placeholder { color: var(--text-faint); }
  .ap-textarea:focus { border-color: var(--gold-dim); background: rgba(201,168,76,0.03); }
  .ap-field-hint { font-size: 10px; color: var(--text-faint); margin-top: 6px; line-height: 1.5; }

  /* Two col */
  .ap-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  /* Genre grid */
  .ap-genre-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  }
  .ap-genre-btn {
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    padding: 8px 10px; border-radius: 4px; cursor: pointer;
    border: 1px solid var(--ink-border); color: var(--text-faint);
    background: transparent; transition: all 0.18s; text-align: left;
    display: flex; align-items: center; gap: 6px;
  }
  .ap-genre-btn:hover { border-color: var(--gold-dim); color: var(--text-dim); }
  .ap-genre-btn.selected {
    border-color: var(--gold-dim); color: var(--gold-light);
    background: var(--gold-glow);
  }
  .ap-genre-check { width: 12px; height: 12px; border-radius: 2px; border: 1px solid currentColor; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 8px; }

  /* Sample */
  .ap-sample-textarea {
    width: 100%; background: var(--ink-surface);
    border: 1px solid var(--ink-border); border-radius: 6px;
    padding: 20px; font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-weight: 300; color: rgba(232,228,218,0.8);
    outline: none; resize: vertical; line-height: 1.9;
    transition: border-color 0.2s; min-height: 280px;
  }
  .ap-sample-textarea::placeholder { color: var(--text-faint); font-style: italic; }
  .ap-sample-textarea:focus { border-color: var(--gold-dim); }
  .ap-char-count { font-size: 10px; color: var(--text-faint); text-align: right; margin-top: 6px; }
  .ap-char-count.warn { color: rgba(251,191,36,0.7); }

  /* Navigation buttons */
  .ap-nav-btns { display: flex; gap: 12px; margin-top: 40px; }
  .ap-btn-primary {
    font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; font-weight: 700; color: #000;
    background: linear-gradient(135deg, var(--gold), #8a6510);
    border: none; padding: 14px 32px; border-radius: 6px;
    cursor: pointer; transition: opacity 0.2s; flex: 1;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .ap-btn-primary:hover:not(:disabled) { opacity: 0.88; }
  .ap-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }
  .ap-btn-ghost {
    font-family: 'Syne', sans-serif; font-size: 10px; letter-spacing: 0.16em;
    text-transform: uppercase; color: var(--text-faint);
    background: transparent; border: 1px solid var(--ink-border);
    padding: 14px 24px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
  }
  .ap-btn-ghost:hover { color: var(--text-dim); border-color: rgba(255,255,255,0.15); }

  /* Sidebar card */
  .ap-sidebar { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 88px; }
  .ap-sidebar-card {
    background: var(--ink-surface); border: 1px solid var(--ink-border);
    border-radius: 8px; padding: 22px; position: relative; overflow: hidden;
  }
  .ap-sidebar-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
  }
  .ap-sidebar-card-title {
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 14px; opacity: 0.8;
  }
  .ap-sidebar-item {
    display: flex; gap: 10px; margin-bottom: 14px; align-items: flex-start;
  }
  .ap-sidebar-item:last-child { margin-bottom: 0; }
  .ap-sidebar-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .ap-sidebar-item-title { font-size: 12px; color: var(--text-main); margin-bottom: 3px; font-weight: 500; }
  .ap-sidebar-item-sub { font-size: 11px; color: var(--text-faint); line-height: 1.5; }
  .ap-sidebar-divider { height: 1px; background: var(--ink-border); margin: 14px 0; }

  /* Error */
  .ap-error {
    font-size: 11px; color: rgba(248,113,113,0.9);
    padding: 10px 14px; border-radius: 6px;
    background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
    margin-top: 12px;
  }

  /* Success */
  .ap-success {
    max-width: 680px; margin: 80px auto; padding: 0 40px;
    text-align: center; position: relative; z-index: 1;
  }
  .ap-success-seal {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(201,168,76,0.08);
    border: 2px solid var(--gold-dim);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin: 0 auto 28px;
    box-shadow: 0 0 40px rgba(201,168,76,0.15);
  }
  .ap-success-eyebrow {
    font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase;
    color: var(--gold); display: block; margin-bottom: 16px; opacity: 0.75;
  }
  .ap-success-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 48px; font-weight: 300; color: var(--text-main);
    line-height: 1.05; margin-bottom: 20px;
  }
  .ap-success-body {
    font-size: 14px; color: var(--text-dim); line-height: 1.85;
    margin-bottom: 40px;
  }
  .ap-success-details {
    background: var(--ink-surface); border: 1px solid var(--ink-border-gold);
    border-radius: 8px; padding: 24px; text-align: left; margin-bottom: 32px;
  }
  .ap-success-detail-row {
    display: flex; justify-content: space-between; padding: 8px 0;
    border-bottom: 1px solid var(--ink-border); font-size: 12px;
  }
  .ap-success-detail-row:last-child { border-bottom: none; }
  .ap-success-detail-label { color: var(--text-faint); }
  .ap-success-detail-val { color: var(--text-main); font-weight: 500; }
  .ap-success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  /* Review step */
  .ap-review-section { margin-bottom: 28px; }
  .ap-review-label {
    font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 8px; opacity: 0.75;
  }
  .ap-review-value {
    font-size: 13px; color: var(--text-dim); line-height: 1.7;
    padding: 14px 16px; background: var(--ink-surface);
    border: 1px solid var(--ink-border); border-radius: 6px;
  }
  .ap-review-value.sample {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px; font-weight: 300;
    color: rgba(232,228,218,0.7); line-height: 1.9;
  }
  .ap-review-genres { display: flex; flex-wrap: wrap; gap: 6px; }
  .ap-review-genre-tag {
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--blue-bright: #84b0f5); border: 1px solid rgba(100,149,237,0.22);
    background: rgba(100,149,237,0.1); padding: 3px 10px; border-radius: 999px;
    color: #84b0f5;
  }

  .ap-divider { height: 1px; background: linear-gradient(to right, var(--gold-dim), transparent); margin: 32px 0; }

  @media (max-width: 900px) {
    .ap-form-grid { grid-template-columns: 1fr; }
    .ap-sidebar { position: static; }
    .ap-hero, .ap-progress-wrap, .ap-form-wrap { padding-left: 24px; padding-right: 24px; }
    .ap-genre-grid { grid-template-columns: repeat(2, 1fr); }
    .ap-field-row { grid-template-columns: 1fr; }
    .ap-nav-inner { padding: 0 24px; }
  }
`;

function StepIndicator({ current, done }: { current: Step; done: boolean }) {
  const steps = [
    { n: 1, label: "About You" },
    { n: 2, label: "Your Writing" },
    { n: 3, label: "Your Work" },
    { n: 4, label: "Review" },
  ];
  return (
    <div className="ap-progress">
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div className={`ap-progress-step ${current === s.n ? "active" : (done || current > s.n) ? "done" : ""}`} style={{ flex: 1 }}>
            <div className="ap-step-num">
              {(done || current > s.n) ? "✓" : s.n}
            </div>
            <span className="ap-step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className="ap-progress-connector" />}
        </div>
      ))}
    </div>
  );
}

function SidebarInfo({ step }: { step: Step }) {
  const content = {
    1: {
      title: "Why we ask this",
      items: [
        { icon: "🔒", title: "Your info is safe", sub: "We only use your details to review your application and contact you about TTL." },
        { icon: "✍️", title: "Pen names welcome", sub: "You can publish under any name you choose. Your legal name stays private." },
        { icon: "⚡", title: "Quick review", sub: "We review all applications within 5–7 business days." },
      ],
    },
    2: {
      title: "About your writing",
      items: [
        { icon: "📖", title: "No minimum experience", sub: "TTL is for emerging writers. We care about voice, not publication history." },
        { icon: "🎭", title: "Multiple genres", sub: "Select every genre you write in — you're not locked to one." },
        { icon: "🪶", title: "Be honest", sub: "Tell us who you are as a writer. The best applications feel like a real person." },
      ],
    },
    3: {
      title: "Your writing sample",
      items: [
        { icon: "📝", title: "Any genre, any length", sub: "Paste up to 1,500 words from any piece — finished or in progress." },
        { icon: "💡", title: "First impressions", sub: "Your opening lines matter most. Show us your voice early." },
        { icon: "🔐", title: "Stays private", sub: "Your sample is only seen by the TTL review team. Never shared publicly." },
      ],
    },
    4: {
      title: "Before you submit",
      items: [
        { icon: "👀", title: "Review carefully", sub: "Check that your email is correct — we'll use it to notify you." },
        { icon: "📄", title: "Agreements come later", sub: "If approved, you'll sign the Plagiarism Clause and Copyright Agreement before publishing." },
        { icon: "🏆", title: "Founding 100", sub: "Early applicants are prioritised for Founding Author status." },
      ],
    },
  };

  const c = content[step];
  return (
    <div className="ap-sidebar-card">
      <div className="ap-sidebar-card-title">{c.title}</div>
      {c.items.map((item, i) => (
        <div key={i}>
          {i > 0 && <div className="ap-sidebar-divider" />}
          <div className="ap-sidebar-item">
            <span className="ap-sidebar-icon">{item.icon}</span>
            <div>
              <div className="ap-sidebar-item-title">{item.title}</div>
              <div className="ap-sidebar-item-sub">{item.sub}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ApplyPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof FormData, value: string | string[]) =>
    setForm(f => ({ ...f, [field]: value }));

  const toggleGenre = (g: string) => {
    const next = form.genres.includes(g)
      ? form.genres.filter(x => x !== g)
      : [...form.genres, g];
    update("genres", next);
  };

  const canProceed = {
    1: form.full_name.trim().length >= 2 && form.email.trim().includes("@") && form.password.trim().length >= 6 && form.bio.trim().length >= 20,
    2: form.genres.length >= 1 && form.why_ttl.trim().length >= 30,
    3: form.writing_sample.trim().length >= 100,
    4: true,
  }[step];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password.trim(),
        options: { data: { full_name: form.full_name.trim() } }
      });
      if (authError && authError.message !== "User already registered") throw new Error(authError.message);
      const { error: dbError } = await supabase
        .from("applications")
        .insert({
          full_name: form.full_name.trim(),
          pen_name: form.pen_name.trim() || null,
          email: form.email.trim(),
          bio: form.bio.trim(),
          why_ttl: form.why_ttl.trim(),
          genres: form.genres,
          writing_sample: form.writing_sample.trim(),
          twitter_url: form.twitter_url.trim() || null,
          instagram_url: form.instagram_url.trim() || null,
          website_url: form.website_url.trim() || null,
          status: "pending",
        });
      if (dbError) throw new Error(dbError.message);

      // Send confirmation email
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "application-submitted",
          to: form.email.trim(),
          name: form.full_name.trim(),
        }),
      });

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="ap-root">
          <nav className="ap-nav">
            <div className="ap-nav-line" />
            <div className="ap-nav-inner">
              <a href={TTL_WRITERS_ROOM} className="ap-nav-brand">
                <div className="ap-nav-logo">TTL</div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span className="ap-nav-brand-main">The Tiniest Library</span>
                  <span className="ap-nav-brand-sub">The Writer's Room</span>
                </div>
              </a>
            </div>
          </nav>
          <div className="ap-spacer" />
          <div className="ap-success">
            <div className="ap-success-seal">🪶</div>
            <span className="ap-success-eyebrow">Application Received</span>
            <h1 className="ap-success-title">Welcome to<br />the waiting room.</h1>
            <p className="ap-success-body">
              Your application has been submitted to The Tiniest Library. We review every application personally — expect to hear from us within 5–7 business days at the email you provided. If approved, you'll receive instructions to sign your writer agreements and set up your author profile.
            </p>
            <div className="ap-success-details">
              <div className="ap-success-detail-row">
                <span className="ap-success-detail-label">Name</span>
                <span className="ap-success-detail-val">{form.full_name}{form.pen_name ? ` (${form.pen_name})` : ""}</span>
              </div>
              <div className="ap-success-detail-row">
                <span className="ap-success-detail-label">Email</span>
                <span className="ap-success-detail-val">{form.email}</span>
              </div>
              <div className="ap-success-detail-row">
                <span className="ap-success-detail-label">Genres</span>
                <span className="ap-success-detail-val">{form.genres.slice(0, 3).join(", ")}{form.genres.length > 3 ? ` +${form.genres.length - 3}` : ""}</span>
              </div>
              <div className="ap-success-detail-row">
                <span className="ap-success-detail-label">Status</span>
                <span className="ap-success-detail-val" style={{ color: "#fbbf24" }}>Under Review</span>
              </div>
            </div>
            <div className="ap-success-actions">
              <a href={TTL_WRITERS_ROOM} style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(232,228,218,0.6)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", padding: "13px 24px", borderRadius: 6, textDecoration: "none", transition: "all 0.2s" }}>
                ← Back to Writer's Room
              </a>
              <a href="https://the-reading-room-three.write.the-tiniest-library.com/reading-room" style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, color: "#000", background: "linear-gradient(135deg, #C9A84C, #8a6510)", border: "none", padding: "13px 28px", borderRadius: 6, textDecoration: "none" }}>
                Browse the Reading Room →
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="ap-root">
        {/* NAV */}
        <nav className="ap-nav">
          <div className="ap-nav-line" />
          <div className="ap-nav-inner">
            <a href={TTL_WRITERS_ROOM} className="ap-nav-brand">
              <div className="ap-nav-logo">TTL</div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span className="ap-nav-brand-main">The Tiniest Library</span>
                <span className="ap-nav-brand-sub">The Writer's Room</span>
              </div>
            </a>
            <a href={TTL_WRITERS_ROOM} className="ap-nav-back">← Back</a>
          </div>
        </nav>
        <div className="ap-spacer" />

        {/* HERO */}
        <div className="ap-hero">
          <span className="ap-hero-eyebrow">The Tiniest Library — Writer Application</span>
          <h1 className="ap-hero-title">Apply to<br /><em>Write</em> for TTL</h1>
          <p className="ap-hero-sub">
            The Tiniest Library is looking for independent writers with a voice worth hearing. Tell us who you are, what you write, and why TTL feels like home. Every application is read by a human.
          </p>
          <div className="ap-hero-pills">
            <div className="ap-hero-pill"><span>🏆</span> Founding 100 spots available</div>
            <div className="ap-hero-pill"><span>©</span> You keep your copyright</div>
            <div className="ap-hero-pill"><span>✒️</span> Earn through Ink</div>
            <div className="ap-hero-pill"><span>⚡</span> 5–7 day review</div>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="ap-progress-wrap">
          <StepIndicator current={step} done={submitted} />
        </div>

        {/* FORM */}
        <div className="ap-form-wrap">
          <div className="ap-form-grid">
            <div>

              {/* ── STEP 1: About You ── */}
              {step === 1 && (
                <div>
                  <h2 className="ap-section-title">About You</h2>
                  <p className="ap-section-sub">Tell us who you are. This information helps us understand you as a writer and person.</p>

                  <div className="ap-field-row">
                    <div className="ap-field">
                      <label className="ap-field-label">Full Name <span className="req">*</span></label>
                      <input className="ap-input" type="text" placeholder="Your legal name" value={form.full_name} onChange={e => update("full_name", e.target.value)} />
                    </div>
                    <div className="ap-field">
                      <label className="ap-field-label">Pen Name</label>
                      <input className="ap-input" type="text" placeholder="How you'll publish (optional)" value={form.pen_name} onChange={e => update("pen_name", e.target.value)} />
                    </div>
                  </div>

                  <div className="ap-field">
                    <label className="ap-field-label">Email Address <span className="req">*</span></label>
                    <input className="ap-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => update("email", e.target.value)} />
                    <p className="ap-field-hint">We'll send your application decision here. Double-check it's correct.</p>
                  </div>
                  <div className="ap-field">
                    <label className="ap-field-label">Create a Password <span className="req">*</span></label>
                    <input className="ap-input" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={e => update("password", e.target.value)} />
                    <p className="ap-field-hint">You'll use this to log into your Writer Dashboard once approved.</p>
                  </div>
                  <div className="ap-field">
                    <label className="ap-field-label">About Yourself <span className="req">*</span></label>
                    <textarea className="ap-textarea" placeholder="Tell us about yourself — your background, your life, what brought you to writing…" value={form.bio} onChange={e => update("bio", e.target.value)} rows={5} />
                    <p className="ap-field-hint">Minimum 20 characters. Be yourself — this isn't a cover letter.</p>
                  </div>

                  <div className="ap-divider" />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300, color: "var(--text-main)", marginBottom: 20 }}>Social Links</h3>

                  <div className="ap-field">
                    <label className="ap-field-label">Website</label>
                    <input className="ap-input" type="url" placeholder="https://yoursite.com" value={form.website_url} onChange={e => update("website_url", e.target.value)} />
                  </div>
                  <div className="ap-field-row">
                    <div className="ap-field">
                      <label className="ap-field-label">Twitter / X</label>
                      <input className="ap-input" type="url" placeholder="https://twitter.com/you" value={form.twitter_url} onChange={e => update("twitter_url", e.target.value)} />
                    </div>
                    <div className="ap-field">
                      <label className="ap-field-label">Instagram</label>
                      <input className="ap-input" type="url" placeholder="https://instagram.com/you" value={form.instagram_url} onChange={e => update("instagram_url", e.target.value)} />
                    </div>
                  </div>

                  <div className="ap-nav-btns">
                    <button className="ap-btn-primary" disabled={!canProceed} onClick={() => setStep(2)}>
                      Continue to Writing →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Your Writing ── */}
              {step === 2 && (
                <div>
                  <h2 className="ap-section-title">Your Writing</h2>
                  <p className="ap-section-sub">Tell us about what you write and why TTL is the right home for your work.</p>

                  <div className="ap-field">
                    <label className="ap-field-label">Genres You Write In <span className="req">*</span></label>
                    <p className="ap-field-hint" style={{ marginBottom: 12 }}>Select all that apply — you're not locked to one genre.</p>
                    <div className="ap-genre-grid">
                      {ALL_GENRES.map(g => (
                        <button key={g} type="button" className={`ap-genre-btn${form.genres.includes(g) ? " selected" : ""}`} onClick={() => toggleGenre(g)}>
                          <span className="ap-genre-check">{form.genres.includes(g) ? "✓" : ""}</span>
                          {g}
                        </button>
                      ))}
                    </div>
                    {form.genres.length > 0 && (
                      <p className="ap-field-hint" style={{ marginTop: 10 }}>
                        Selected: {form.genres.join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="ap-divider" />

                  <div className="ap-field">
                    <label className="ap-field-label">Why The Tiniest Library? <span className="req">*</span></label>
                    <textarea
                      className="ap-textarea"
                      placeholder="What draws you to TTL specifically? What kind of readership are you hoping to build? What does writing mean to you?"
                      value={form.why_ttl}
                      onChange={e => update("why_ttl", e.target.value)}
                      rows={6}
                    />
                    <p className="ap-field-hint">Minimum 30 characters. The most memorable answers are specific and honest.</p>
                  </div>

                  <div className="ap-nav-btns">
                    <button className="ap-btn-ghost" onClick={() => setStep(1)}>← Back</button>
                    <button className="ap-btn-primary" disabled={!canProceed} onClick={() => setStep(3)}>
                      Continue to Sample →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Writing Sample ── */}
              {step === 3 && (
                <div>
                  <h2 className="ap-section-title">Writing Sample</h2>
                  <p className="ap-section-sub">Paste up to 1,500 words from any piece of your writing. This is where we meet your voice.</p>

                  <div className="ap-field">
                    <label className="ap-field-label">Your Sample <span className="req">*</span></label>
                    <textarea
                      className="ap-sample-textarea"
                      placeholder="Paste your writing here — a chapter opening, a short story, a poem, the first scene of something you've been working on. Show us what you sound like when you're writing for real…"
                      value={form.writing_sample}
                      onChange={e => update("writing_sample", e.target.value.slice(0, 8000))}
                    />
                    <p className={`ap-char-count${form.writing_sample.length > 7000 ? " warn" : ""}`}>
                      {form.writing_sample.length.toLocaleString()} / 8,000 characters (~1,500 words)
                    </p>
                    <p className="ap-field-hint">Minimum 100 characters. Any genre, any format. Unfinished is fine.</p>
                  </div>

                  <div className="ap-nav-btns">
                    <button className="ap-btn-ghost" onClick={() => setStep(2)}>← Back</button>
                    <button className="ap-btn-primary" disabled={!canProceed} onClick={() => setStep(4)}>
                      Review Application →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Review ── */}
              {step === 4 && (
                <div>
                  <h2 className="ap-section-title">Review & Submit</h2>
                  <p className="ap-section-sub">Check everything looks right before you submit. You won't be able to edit after submission.</p>

                  <div className="ap-review-section">
                    <div className="ap-review-label">Name</div>
                    <div className="ap-review-value">{form.full_name}{form.pen_name ? ` — publishes as "${form.pen_name}"` : ""}</div>
                  </div>
                  <div className="ap-review-section">
                    <div className="ap-review-label">Email</div>
                    <div className="ap-review-value">{form.email}</div>
                  </div>
                  <div className="ap-review-section">
                    <div className="ap-review-label">About</div>
                    <div className="ap-review-value">{form.bio}</div>
                  </div>
                  <div className="ap-review-section">
                    <div className="ap-review-label">Genres ({form.genres.length})</div>
                    <div className="ap-review-value">
                      <div className="ap-review-genres">
                        {form.genres.map(g => <span key={g} className="ap-review-genre-tag">{g}</span>)}
                      </div>
                    </div>
                  </div>
                  <div className="ap-review-section">
                    <div className="ap-review-label">Why TTL</div>
                    <div className="ap-review-value">{form.why_ttl}</div>
                  </div>
                  <div className="ap-review-section">
                    <div className="ap-review-label">Writing Sample</div>
                    <div className="ap-review-value sample">
                      {form.writing_sample.slice(0, 300)}{form.writing_sample.length > 300 ? "…" : ""}
                    </div>
                  </div>
                  {(form.website_url || form.twitter_url || form.instagram_url) && (
                    <div className="ap-review-section">
                      <div className="ap-review-label">Links</div>
                      <div className="ap-review-value">
                        {[form.website_url, form.twitter_url, form.instagram_url].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: "16px 20px", border: "1px solid var(--gold-dim)", borderRadius: 6, background: "var(--gold-glow)", marginTop: 24, marginBottom: 8 }}>
                    <p style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.7 }}>
                      By submitting this application you confirm all information is accurate and your writing sample is your own original work. If approved, you'll be asked to sign the Plagiarism Clause and Copyright Agreement before publishing.
                    </p>
                  </div>

                  {error && <div className="ap-error">{error}</div>}

                  <div className="ap-nav-btns">
                    <button className="ap-btn-ghost" onClick={() => setStep(3)}>← Back</button>
                    <button className="ap-btn-primary" disabled={submitting} onClick={handleSubmit}>
                      {submitting ? "Submitting…" : "Submit Application →"}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* SIDEBAR */}
            <div className="ap-sidebar">
              <SidebarInfo step={step} />
              <div className="ap-sidebar-card">
                <div className="ap-sidebar-card-title">The Founding 100</div>
                <p style={{ fontSize: 12, color: "var(--text-faint)", lineHeight: 1.7 }}>
                  The first 100 writers to join TTL receive a permanent Founding Author badge, priority genre placement, and a piece of TTL history. Applications are reviewed in order received.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
