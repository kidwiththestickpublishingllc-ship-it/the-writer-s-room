"use client";

import { useEffect, useRef, useState } from "react";

const USE_AI = true;

const TTL_SUBMIT_URL = "https://www.write.the-tiniest-library.com";

const QUILL_KB = {
  greeting_new: [
    "Welcome to The Writer's Room! 🪶 I'm Quill, your guide for everything about publishing on The Tiniest Library. Ask me about submitting your story, how Ink revenue works, what genres we accept, or the Founding 100 program. What can I help you with?",
    "Hello, writer! 🪶 I'm Quill — I'm here to help you get published on The Tiniest Library. You've got questions, I've got answers. Ask me anything about submissions, copyright, Ink earnings, or how to get started.",
    "Welcome! I'm Quill, your TTL writing guide. 📝 Whether you're submitting your first story or bringing an established audience, I can walk you through everything. What would you like to know?",
  ],
  greeting_returning: [
    "Welcome back! 🪶 Good to see you again. Still working on your submission, or do you have new questions about publishing on TTL? I'm here.",
    "Hey, welcome back to The Writer's Room! 🪶 Ready to take the next step? Ask me anything — I'm always here to help.",
  ],
  fallback: [
    "Great question — I want to make sure I give you the right answer. Try asking me about submissions, Ink revenue, copyright, genres, or the Founding 100 program.",
    "I'm still learning! But I can help with: how to submit, how Ink works for writers, copyright, genres we accept, or the Founding 100 spots. What would you like to know?",
  ],
  topics: {
    submit: `Submitting to TTL is simple and free. 📝 Head to the submission form at the-tiniest-library.com and fill in your story title, genre, a short description, and your manuscript. We review every submission personally. Approved stories are published in the Reading Room and Browse All Stories pages. → ${TTL_SUBMIT_URL}`,
    copyright: "Your copyright stays with you — always. 📜 Publishing on TTL does not transfer ownership of your work. You remain free to publish the same story elsewhere, pursue traditional publishing, release print editions, or adapt your work into film, TV, or any other medium. TTL is a platform to share your work, not a rights claim.",
    ink: "Ink is TTL's reader currency. 🪶 Readers purchase Ink packs (starting at $1) and use it to unlock your stories and tip you directly. Every time a reader spends Ink on your work, a portion goes to you via Stripe. Serials are especially powerful — each new chapter creates a fresh income moment as readers return to unlock it.",
    revenue: "Here's how the money flows: Readers buy Ink → they spend it unlocking your chapters (25 Ink each) → they tip you from your author profile → Stripe processes the payment to your account. The more you publish and the more readers engage, the more you earn. No ads, no middleman cuts beyond Stripe's standard fee.",
    founding: "The Founding 100 program gives the first 100 writers to join TTL a permanent founding badge on their author profile, priority placement in the Reading Room, and recognition as part of the platform's founding story. Spots are limited and filling fast — apply now at the submission link.",
    genres: "TTL accepts all 24 genres: Fantasy, Sci-Fi, Horror Mystery, Crime & Thrillers, Romance, Young Adult, New Adult, Children's Literature, Cozy, Poems & Memoirs, Adventure, Contemporary Fiction, Historical Fiction, Serialized Fiction, Fan Fiction, Slice Of Life, Dark Academia, Multi-Cultural, Black Stories, Latin Stories, AAPI Authors, Indigenous Stories, LGBTQ+ Fiction, and Adult 18+. Every kind of writer has a home here.",
    formats: "We accept short stories, serialized fiction (ongoing chapters), poems, memoirs, YA fiction, genre fiction, fan fiction, essays, and early access chapters. The minimum commitment for founding writers is 1 piece per month. Serials can be shorter chapters published on a regular schedule.",
    serial: "Serialized fiction is one of the best formats for TTL. 📚 You publish chapters regularly, readers unlock each new one with Ink, and your author page builds over time. It creates an ongoing income stream and keeps readers coming back. Many successful writers on platforms like Wattpad and Royal Road started with serials.",
    rules: "The main rules are simple: submit original work you own the rights to, commit to at least 1 piece per month, keep it within our content guidelines (no hate speech, harassment, or purely AI-generated content without human authorship), and be yourself. All experience levels are welcome — first-time writers and published authors alike.",
    ai: "TTL welcomes human storytelling. Work that is entirely AI-generated without meaningful human authorship won't be accepted. But AI-assisted writing — where a human author uses AI as a tool while maintaining their own creative voice, direction, and authorship — is considered on a case-by-case basis. When in doubt, lead with your own voice.",
    profile: "Every TTL writer gets their own author profile page. It includes your bio, genre tags, all your published stories, reader tip buttons, and a follow option. Readers can find you, follow your work, and tip you directly from your profile. Founding writers get a special badge displayed prominently.",
    readers: "The Reading Room is where your readers live. It's a beautifully designed platform where readers use Ink to unlock stories, tip authors, and follow serialized fiction. When you publish on TTL, your work appears there automatically, alongside the author directory and browse-by-genre pages.",
    hello: "Hey there! 🪶 I'm Quill, your writing guide here at The Tiniest Library. Ask me anything about publishing, Ink revenue, copyright, genres, or how to get your first story in front of readers.",
    thanks: "You're very welcome! Happy writing — and I can't wait to read what you create. 📝",
    start: `The fastest way to get started: click Apply Now at the top of the page, fill in the submission form with your story, genre, and a short description. We review every submission and get back to you quickly. → ${TTL_SUBMIT_URL}`,
    payment: "Payments to writers are processed through Stripe. You'll connect your Stripe account when you set up your author profile. Ink revenue accumulates and is paid out on a regular schedule. There are no setup fees or monthly charges — TTL only earns when you earn.",
    substack: "Yes, you can publish on both Substack and TTL simultaneously. Since you keep your copyright, there's no conflict. Many writers use Substack for their newsletter audience and TTL for their fiction — they complement each other well. Bring your Substack readers to TTL and give them a new way to support your work.",
    wattpad: "TTL and Wattpad serve different purposes. Wattpad is a volume platform with ads and algorithm dependency. TTL is a curated, premium space where readers pay directly for the work they love — no ads, no algorithm. Writers who are frustrated with Wattpad's monetization often find TTL's Ink model more rewarding.",
  },
};

type Message = { role: "user" | "quill"; text: string; time: string; };

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isReturningWriter(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem("ttl_writer_visited"));
}

function markWriterVisited() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("ttl_writer_visited", "1");
}

function getRuleBasedResponse(input: string): string {
  const q = input.toLowerCase();
  if (/\b(hi|hello|hey|good morning|good evening|good afternoon|howdy)\b/.test(q)) return QUILL_KB.topics.hello;
  if (/\b(thank|thanks|thank you|ty|thx)\b/.test(q)) return QUILL_KB.topics.thanks;
  if (/\b(start|begin|get started|first step|how do i start)\b/.test(q)) return QUILL_KB.topics.start;
  if (/\b(submit|submission|apply|application|how to submit|send my story)\b/.test(q)) return QUILL_KB.topics.submit;
  if (/\b(copyright|rights|ownership|my work|keep my rights|transfer)\b/.test(q)) return QUILL_KB.topics.copyright;
  if (/\b(ink|currency|reader currency|how does ink work)\b/.test(q)) return QUILL_KB.topics.ink;
  if (/\b(revenue|earn|money|paid|payment|income|how much|stripe)\b/.test(q)) return QUILL_KB.topics.revenue;
  if (/\b(founding|100 spots|founding writer|first 100|badge)\b/.test(q)) return QUILL_KB.topics.founding;
  if (/\b(genre|genres|what genre|what type|what kind)\b/.test(q)) return QUILL_KB.topics.genres;
  if (/\b(format|serial|chapter|poem|memoir|essay|short story|accepted formats)\b/.test(q)) return QUILL_KB.topics.formats;
  if (/\b(serialized|serial fiction|ongoing|chapters|weekly)\b/.test(q)) return QUILL_KB.topics.serial;
  if (/\b(rule|rules|guidelines|content|allowed|not allowed|permitted)\b/.test(q)) return QUILL_KB.topics.rules;
  if (/\b(ai|artificial intelligence|ai.generated|chatgpt)\b/.test(q)) return QUILL_KB.topics.ai;
  if (/\b(profile|author profile|page|my page|author page)\b/.test(q)) return QUILL_KB.topics.profile;
  if (/\b(reader|readers|reading room|audience|fans)\b/.test(q)) return QUILL_KB.topics.readers;
  if (/\b(payment|paid out|payout|stripe|how do i get paid)\b/.test(q)) return QUILL_KB.topics.payment;
  if (/\b(substack|newsletter|both platforms)\b/.test(q)) return QUILL_KB.topics.substack;
  if (/\b(wattpad|royal road|kindle vella|compare|versus|vs)\b/.test(q)) return QUILL_KB.topics.wattpad;
  return QUILL_KB.fallback[Math.floor(Math.random() * QUILL_KB.fallback.length)];
}

async function getAIResponse(messages: Message[]): Promise<string> {
  try {
    const res = await fetch("/api/quill-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages
          .filter(m => m.role === "user" || m.role === "quill")
          .map((m) => ({
            role: m.role === "quill" ? "assistant" : "user",
            content: m.text,
          })),
      }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.message || QUILL_KB.fallback[0];
  } catch (err) {
    console.error("Quill AI error:", err);
    throw err;
  }
}

// =========================
// Widget Styles
// =========================
const WIDGET_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  :root {
    --gold: #C9A84C; --gold-light: #E2C97E;
    --gold-dim: rgba(201,168,76,0.38); --gold-glow: rgba(201,168,76,0.13);
    --blue: #6495ED; --blue-dim: rgba(100,149,237,0.22); --blue-bright: #84b0f5;
    --quill: #a78bfa; --quill-dim: rgba(167,139,250,0.25); --quill-glow: rgba(167,139,250,0.12);
    --ink-bg: #0a0a0a; --ink-surface: #111111; --ink-surface2: #181818;
    --ink-border: rgba(255,255,255,0.07); --ink-border-gold: rgba(201,168,76,0.26);
    --text-main: #f0ece2; --text-dim: rgba(232,228,218,0.45); --text-faint: rgba(232,228,218,0.25);
  }

  .quill-fab {
    position: fixed; bottom: 28px; right: 28px; z-index: 999;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    padding: 8px; border-radius: 18px;
    width: 180px; height: 156px;
    background: #0a0a0a; border: none;
    cursor: pointer; transition: transform 0.2s, opacity 0.2s;
    overflow: hidden;
  }

  .quill-fab::before {
    content: '';
    position: absolute; inset: -3px; border-radius: 20px;
    background: conic-gradient(
      from 0deg,
      transparent 10%,
      rgba(167,139,250,0.0) 20%,
      rgba(167,139,250,0.6) 35%,
      rgba(200,180,255,0.9) 50%,
      rgba(167,139,250,0.6) 65%,
      rgba(167,139,250,0.0) 80%,
      transparent 90%
    );
    animation: quillGlowSpin 3s linear infinite;
    z-index: -1;
  }

  .quill-fab::after {
    content: '';
    position: absolute; inset: 2px; border-radius: 17px;
    background: #0a0a0a; z-index: -1;
  }

  @keyframes quillGlowSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .quill-fab:hover { transform: translateY(-3px); }
  .quill-fab-hidden { opacity: 0; pointer-events: none; transform: scale(0.85); }

  .quill-fab canvas {
    width: 160px !important; height: 120px !important;
    pointer-events: none; image-rendering: pixelated;
  }

  .quill-fab-label {
    font-family: 'Press Start 2P', monospace;
    font-size: 9px; color: var(--quill);
    letter-spacing: 0.1em;
    text-shadow: 0 0 8px rgba(167,139,250,0.5);
  }

  .quill-fab-hint {
    font-family: 'Press Start 2P', monospace;
    font-size: 7px; color: rgba(167,139,250,0.45);
    letter-spacing: 0.05em;
    animation: quillFabPulse 2s ease-in-out infinite;
  }

  @keyframes quillFabPulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

  .quill-window {
    position: fixed; bottom: 28px; right: 28px; z-index: 1000;
    width: 420px; max-width: calc(100vw - 32px);
    background: var(--ink-surface);
    border: 1px solid rgba(167,139,250,0.3);
    border-radius: 20px; overflow: hidden;
    display: flex; flex-direction: column;
    box-shadow: 0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(167,139,250,0.1);
    opacity: 0; transform: translateY(20px) scale(0.97);
    pointer-events: none;
    transition: opacity 0.25s, transform 0.25s;
    max-height: 600px;
  }

  .quill-window-open {
    opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
  }

  .quill-window-accent {
    height: 2px;
    background: linear-gradient(90deg, var(--quill-dim), var(--quill), var(--gold), var(--quill-dim));
  }

  .quill-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--ink-border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--ink-surface2);
  }

  .quill-header-left { display: flex; align-items: center; gap: 12px; }

  .quill-avatar {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--quill), #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }

  .quill-name {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 700;
    color: var(--text-main); letter-spacing: 0.06em;
  }

  .quill-status {
    font-family: 'Syne', sans-serif;
    font-size: 10px; color: var(--quill);
    letter-spacing: 0.08em; display: flex; align-items: center; gap: 5px;
  }

  .quill-status-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--quill); animation: quillPulse 2s ease-in-out infinite;
  }

  @keyframes quillPulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

  .quill-close {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--text-dim); border: 1px solid var(--ink-border);
    background: var(--ink-surface); padding: 6px 12px;
    border-radius: 6px; cursor: pointer; transition: all 0.2s;
  }

  .quill-close:hover { color: var(--text-main); border-color: var(--quill-dim); }

  .quill-messages {
    flex: 1; overflow-y: auto; padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
    min-height: 200px; max-height: 360px;
  }

  .quill-messages::-webkit-scrollbar { width: 4px; }
  .quill-messages::-webkit-scrollbar-track { background: transparent; }
  .quill-messages::-webkit-scrollbar-thumb { background: var(--quill-dim); border-radius: 2px; }

  .quill-msg { display: flex; flex-direction: column; gap: 4px; }
  .quill-msg-user { align-items: flex-end; }
  .quill-msg-quill { align-items: flex-start; }

  .quill-bubble {
    max-width: 85%;
    padding: 12px 16px;
    border-radius: 14px;
    font-family: 'Syne', sans-serif;
    font-size: 13px; line-height: 1.65;
  }

  .quill-bubble-user {
    background: linear-gradient(135deg, var(--quill), #7c3aed);
    color: #fff; border-radius: 14px 14px 4px 14px;
  }

  .quill-bubble-quill {
    background: var(--ink-surface2);
    border: 1px solid var(--ink-border);
    color: var(--text-main); border-radius: 14px 14px 14px 4px;
  }

  .quill-time {
    font-family: 'Syne', sans-serif;
    font-size: 9px; color: var(--text-faint); letter-spacing: 0.06em;
    padding: 0 4px;
  }

  .quill-typing {
    display: flex; gap: 4px; align-items: center; padding: 14px 16px;
  }

  .quill-typing span {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--quill); opacity: 0.5;
    animation: quillTyping 1.2s ease-in-out infinite;
  }

  .quill-typing span:nth-child(2) { animation-delay: 0.2s; }
  .quill-typing span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes quillTyping {
    0%,100%{opacity:0.3;transform:translateY(0)}
    50%{opacity:1;transform:translateY(-4px)}
  }

  .quill-input-area {
    padding: 14px 16px;
    border-top: 1px solid var(--ink-border);
    display: flex; gap: 10px; align-items: center;
    background: var(--ink-surface2);
  }

  .quill-input {
    flex: 1; background: var(--ink-surface);
    border: 1px solid var(--ink-border);
    border-radius: 10px; padding: 10px 14px;
    font-family: 'Syne', sans-serif; font-size: 13px;
    color: var(--text-main); outline: none;
    transition: border-color 0.2s;
  }

  .quill-input:focus { border-color: var(--quill-dim); }
  .quill-input::placeholder { color: var(--text-faint); }

  .quill-send {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--quill), #7c3aed);
    border: none; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    font-size: 16px; transition: opacity 0.2s; flex-shrink: 0;
  }

  .quill-send:hover { opacity: 0.85; }
  .quill-send:disabled { opacity: 0.4; cursor: default; }

  .quill-suggestions {
    padding: 0 16px 14px;
    display: flex; flex-wrap: wrap; gap: 6px;
    background: var(--ink-surface2);
  }

  .quill-suggestion {
    font-family: 'Syne', sans-serif;
    font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--quill); border: 1px solid var(--quill-dim);
    background: var(--quill-glow); padding: 5px 10px;
    border-radius: 6px; cursor: pointer; transition: all 0.18s;
  }

  .quill-suggestion:hover { background: rgba(167,139,250,0.2); }

  @media (max-width: 480px) {
    .quill-window { width: calc(100vw - 32px); right: 16px; bottom: 16px; }
    .quill-fab { right: 16px; bottom: 16px; }
  }
`;

const PIXEL = 2;
const QUILL_COLORS = {
  leatherDark: '#1e1230', leather: '#2d1b69', leatherLight: '#3d2483',
  leatherHighlight: '#4c2d9e', gold: '#a78bfa', goldLight: '#c4b5fd',
  goldDark: '#7c3aed', pageCream: '#f5f0ff', pageEdge: '#e0d7ff',
  pageShadow: '#c4b5fd', spine: '#1a0f40', spineDark: '#0f0826', text: '#4c2d9e',
};

function QuillBook({ onClick }: { onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isOpenRef = useRef(false);
  const animatingRef = useRef(false);
  const animProgressRef = useRef(0);
  const animDirectionRef = useRef(0);
  const rafRef = useRef<number>(0);

  function dp(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL, y * PIXEL, PIXEL, PIXEL);
  }
  function dr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL, y * PIXEL, w * PIXEL, h * PIXEL);
  }

  function drawClosed(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, 160, 120);
    const bx = 18, by = 10, bw = 44, bh = 40;
    dr(ctx, bx+2, by+2, bw, bh, "rgba(0,0,0,0.35)");
    dr(ctx, bx, by, bw, bh, QUILL_COLORS.leather);
    for (let i = 0; i < 10; i++) dp(ctx, bx+3+Math.floor((i*7+3)%(bw-6)), by+3+Math.floor((i*11+5)%(bh-6)), QUILL_COLORS.leatherDark);
    for (let i = 0; i < 6; i++) dp(ctx, bx+3+Math.floor((i*13+7)%(bw-6)), by+3+Math.floor((i*9+3)%(bh-6)), QUILL_COLORS.leatherHighlight);
    for (let x = bx+2; x < bx+bw-2; x++) dp(ctx, x, by+2, QUILL_COLORS.gold);
    for (let x = bx+2; x < bx+bw-2; x++) dp(ctx, x, by+bh-3, QUILL_COLORS.gold);
    for (let y = by+2; y < by+bh-2; y++) dp(ctx, bx+2, y, QUILL_COLORS.gold);
    for (let y = by+2; y < by+bh-2; y++) dp(ctx, bx+bw-3, y, QUILL_COLORS.gold);
    [[bx+3,by+3],[bx+4,by+3],[bx+3,by+4],[bx+bw-4,by+3],[bx+bw-5,by+3],[bx+bw-4,by+4],
     [bx+3,by+bh-4],[bx+4,by+bh-4],[bx+3,by+bh-5],[bx+bw-4,by+bh-4],[bx+bw-5,by+bh-4],[bx+bw-4,by+bh-5]
    ].forEach(([x,y]) => dp(ctx, x, y, QUILL_COLORS.goldLight));
    const cx = bx + Math.floor(bw/2), cy = by + Math.floor(bh/2);
    [[cx,cy-3,QUILL_COLORS.gold],[cx-1,cy-2,QUILL_COLORS.gold],[cx,cy-2,QUILL_COLORS.goldLight],[cx+1,cy-2,QUILL_COLORS.gold],
     [cx-2,cy-1,QUILL_COLORS.gold],[cx-1,cy-1,QUILL_COLORS.goldLight],[cx,cy-1,QUILL_COLORS.goldLight],[cx+1,cy-1,QUILL_COLORS.goldLight],[cx+2,cy-1,QUILL_COLORS.gold],
     [cx-3,cy,QUILL_COLORS.goldDark],[cx-2,cy,QUILL_COLORS.gold],[cx-1,cy,QUILL_COLORS.goldLight],[cx,cy,'#fff'],[cx+1,cy,QUILL_COLORS.goldLight],[cx+2,cy,QUILL_COLORS.gold],[cx+3,cy,QUILL_COLORS.goldDark],
     [cx-2,cy+1,QUILL_COLORS.gold],[cx-1,cy+1,QUILL_COLORS.goldLight],[cx,cy+1,QUILL_COLORS.goldLight],[cx+1,cy+1,QUILL_COLORS.goldLight],[cx+2,cy+1,QUILL_COLORS.gold],
     [cx-1,cy+2,QUILL_COLORS.gold],[cx,cy+2,QUILL_COLORS.goldLight],[cx+1,cy+2,QUILL_COLORS.gold],[cx,cy+3,QUILL_COLORS.goldDark]
    ].forEach(([x,y,c]) => dp(ctx, x as number, y as number, c as string));
    for (let y = by+1; y < by+bh-1; y++) { dp(ctx, bx+bw, y, QUILL_COLORS.pageEdge); dp(ctx, bx+bw+1, y, QUILL_COLORS.pageShadow); }
    dr(ctx, bx-2, by, 2, bh, QUILL_COLORS.spine);
    for (let y = by; y < by+bh; y+=3) dp(ctx, bx-2, y, QUILL_COLORS.spineDark);
    dr(ctx, bx-2, by+4, 2, 1, QUILL_COLORS.goldDark); dr(ctx, bx-2, by+bh-5, 2, 1, QUILL_COLORS.goldDark);
    for (let y = by; y < by+bh; y++) dp(ctx, bx+bw-1, y, QUILL_COLORS.leatherLight);
    for (let x = bx; x < bx+bw; x++) dp(ctx, x, by+bh-1, QUILL_COLORS.leatherDark);
    for (let x = bx; x < bx+bw; x++) dp(ctx, x, by, QUILL_COLORS.leatherHighlight);
  }

  function drawOpen(ctx: CanvasRenderingContext2D, progress: number) {
    ctx.clearRect(0, 0, 160, 120);
    const bx = 6, by = 10, bw = 34, bh = 40;
    dr(ctx, bx+1, by+2, bw*2+10, bh, "rgba(0,0,0,0.2)");
    dr(ctx, bx, by, bw, bh, QUILL_COLORS.leather);
    for (let x = bx+2; x < bx+bw-2; x++) dp(ctx, x, by+2, QUILL_COLORS.gold);
    for (let x = bx+2; x < bx+bw-2; x++) dp(ctx, x, by+bh-3, QUILL_COLORS.gold);
    for (let y = by+2; y < by+bh-2; y++) dp(ctx, bx+2, y, QUILL_COLORS.gold);
    for (let y = by+2; y < by+bh-2; y++) dp(ctx, bx+bw-3, y, QUILL_COLORS.gold);
    dr(ctx, bx+bw, by, 3, bh, QUILL_COLORS.spine);
    for (let y = by; y < by+bh; y+=3) dp(ctx, bx+bw+1, y, QUILL_COLORS.spineDark);
    dr(ctx, bx+bw, by+4, 3, 1, QUILL_COLORS.goldDark); dr(ctx, bx+bw, by+bh-5, 3, 1, QUILL_COLORS.goldDark);
    const px = bx+bw+3, pageW = Math.floor(bw * progress);
    if (pageW > 0) {
      dr(ctx, px, by+1, pageW, bh-2, QUILL_COLORS.pageCream);
      if (progress > 0.5) {
        for (let i = 0; i < 9; i++) {
          const lw = Math.min(pageW-4, 6+(i*5+3)%18);
          if (lw > 2) dr(ctx, px+2, by+4+i*3, lw, 1, QUILL_COLORS.text);
        }
      }
      for (let y = by+1; y < by+bh-1; y++) dp(ctx, px, y, QUILL_COLORS.pageShadow);
    }
    const rcx = px+pageW+1;
    if (progress > 0.1) {
      dr(ctx, rcx, by, Math.floor(bw*progress), bh, QUILL_COLORS.leatherLight);
      if (progress > 0.6) {
        const visW = Math.floor(bw*progress);
        for (let x = rcx+1; x < rcx+visW-1; x++) { dp(ctx, x, by+2, QUILL_COLORS.goldDark); dp(ctx, x, by+bh-3, QUILL_COLORS.goldDark); }
      }
      for (let y = by; y < by+bh; y++) dp(ctx, rcx, y, QUILL_COLORS.leatherDark);
    }
    if (progress > 0.3) {
      dr(ctx, bx+1, by+1, bw-1, bh-2, QUILL_COLORS.pageCream);
      for (let i = 0; i < 7; i++) dr(ctx, bx+3, by+4+i*4, Math.min(6+i*3, bw-6), 1, "#c4b5fd");
      dr(ctx, bx, by, 1, bh, QUILL_COLORS.leather);
    }
  }

  function runAnim() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    if (animDirectionRef.current === 1) {
      animProgressRef.current += 0.07;
      if (animProgressRef.current >= 1) { animProgressRef.current = 1; animatingRef.current = false; isOpenRef.current = true; drawOpen(ctx, 1); return; }
    } else {
      animProgressRef.current -= 0.07;
      if (animProgressRef.current <= 0) { animProgressRef.current = 0; animatingRef.current = false; isOpenRef.current = false; drawClosed(ctx); return; }
    }
    drawOpen(ctx, animProgressRef.current);
    rafRef.current = requestAnimationFrame(runAnim);
  }

  function handleClick() {
    if (animatingRef.current) return;
    animatingRef.current = true;
    if (!isOpenRef.current) { animDirectionRef.current = 1; animProgressRef.current = 0; }
    else { animDirectionRef.current = -1; animProgressRef.current = 1; }
    rafRef.current = requestAnimationFrame(runAnim);
    onClick();
  }

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) drawClosed(ctx);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return (
    <canvas ref={canvasRef} width={160} height={120}
      onClick={handleClick}
      style={{ imageRendering: "pixelated", display: "block", cursor: "pointer" }}
    />
  );
}

const SUGGESTIONS = ["How do I submit?", "Copyright?", "How does Ink work?", "Founding 100?"];

export default function QuillChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      markWriterVisited();
      const returning = isReturningWriter();
      const pool = returning ? QUILL_KB.greeting_returning : QUILL_KB.greeting_new;
      const greeting = pool[Math.floor(Math.random() * pool.length)];
      setTimeout(() => {
        setMessages([{ role: "quill", text: greeting, time: getTime() }]);
      }, 400);
    }
  }, [open, hasGreeted]);

  useEffect(() => {
    if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim(), time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      let response: string;
      if (USE_AI) {
        response = await getAIResponse([...messages, userMsg]);
      } else {
        await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
        response = getRuleBasedResponse(text);
      }
      setMessages(prev => [...prev, { role: "quill", text: response, time: getTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "quill", text: "Something went wrong — please try again!", time: getTime() }]);
    } finally {
      setLoading(false);
      if (!open) setUnread(u => u + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  return (
    <>
      <style>{WIDGET_STYLES}</style>

      <button
        type="button"
        onClick={handleOpen}
        className={`quill-fab ${open ? "quill-fab-hidden" : ""}`}
        aria-label="Open Quill chat"
        suppressHydrationWarning
      >
        <QuillBook onClick={handleOpen} />
        <span className="quill-fab-label">QUILL</span>
        <span className="quill-fab-hint">~ tap to open ~</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '999px',
            background: 'var(--quill)', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Syne', sans-serif",
          }}>{unread}</span>
        )}
      </button>

      <div className={`quill-window ${open ? "quill-window-open" : ""}`} role="dialog" aria-label="Quill writer guide">
        <div className="quill-window-accent" />

        <div className="quill-header">
          <div className="quill-header-left">
            <div className="quill-avatar">🪶</div>
            <div>
              <div className="quill-name">Quill</div>
              <div className="quill-status">
                <div className="quill-status-dot" />
                Writer's Guide
              </div>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="quill-close">Close ✕</button>
        </div>

        <div className="quill-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`quill-msg quill-msg-${msg.role}`}>
              <div className={`quill-bubble quill-bubble-${msg.role}`}>{msg.text}</div>
              <span className="quill-time">{msg.time}</span>
            </div>
          ))}
          {loading && (
            <div className="quill-msg quill-msg-quill">
              <div className="quill-bubble quill-bubble-quill">
                <div className="quill-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && !loading && (
          <div className="quill-suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} type="button" className="quill-suggestion" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="quill-input-area">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Quill anything..."
            className="quill-input"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="quill-send"
          >
            🪶
          </button>
        </div>
      </div>
    </>
  );
}
