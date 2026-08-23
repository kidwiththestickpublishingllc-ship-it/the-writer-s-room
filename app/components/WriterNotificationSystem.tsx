"use client";

/**
 * WriterNotificationSystem.tsx
 * ─────────────────────────────────────────────────────────────────
 * Real-time notification toasts for the Writer's Room dashboard.
 * Subscribes to the notifications table via Supabase Realtime.
 * Plays branded sounds and shows animated toasts.
 *
 * HOW TO WIRE into app/dashboard/page.tsx:
 * 1. import WriterNotificationSystem from "@/app/components/WriterNotificationSystem";
 * 2. Place inside the dashboard return, after <TWRNav />:
 *    <WriterNotificationSystem writerId={writer.user_id} />
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  created_at: string;
}

interface WriterNotificationSystemProps {
  writerId: string;
}

// ─── Sound Engine (Web Audio API — no external files) ────────────
function playTipSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Quill scratch — soft high shimmer
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.22);

    // Ink drop — warm low tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain2.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.4);

    // Gold shimmer — high harmonics
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1320, ctx.currentTime + 0.05);
    osc3.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.25);
    gain3.gain.setValueAtTime(0, ctx.currentTime + 0.05);
    gain3.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.08);
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc3.start(ctx.currentTime + 0.05);
    osc3.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not available — silent fallback
  }
}

function playLetterSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Wax seal stamp — deep thud
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(180, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
    gain1.gain.setValueAtTime(0.18, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.2);

    // Envelope rustle — airy noise
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 0.5;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseGain.gain.setValueAtTime(0.04, ctx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.17);
    noise.start(ctx.currentTime + 0.05);
    noise.stop(ctx.currentTime + 0.18);

    // Gentle chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.value = 523;
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.12);
    gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.48);
  } catch {
    // Audio not available — silent fallback
  }
}

function playQuestionSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    // Rising question tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch {}
}

// ─── Toast Component ─────────────────────────────────────────────
const TOAST_STYLES = `
  @keyframes wnSlideIn {
    from { transform: translateX(120%); opacity: 0; }
    to   { transform: translateX(0);   opacity: 1; }
  }
  @keyframes wnSlideOut {
    from { transform: translateX(0);   opacity: 1; }
    to   { transform: translateX(120%); opacity: 0; }
  }
  @keyframes wnShimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes wnPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.4); }
    50%       { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
  }

  .wn-toast-wrap {
    position: fixed;
    bottom: 32px; right: 32px;
    z-index: 9999;
    display: flex; flex-direction: column; gap: 10px;
    pointer-events: none;
  }

  .wn-toast {
    width: 320px;
    background: #111118;
    border-radius: 14px;
    overflow: hidden;
    pointer-events: all;
    animation: wnSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    box-shadow: 0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07);
  }

  .wn-toast.exiting {
    animation: wnSlideOut 0.3s ease-in forwards;
  }

  .wn-toast-tip { border-top: 2px solid #C9A84C; animation: wnPulse 1.5s ease 0.2s 2; }
  .wn-toast-letter { border-top: 2px solid #C84444; }
  .wn-toast-question { border-top: 2px solid #9b6dff; }
  .wn-toast-default { border-top: 2px solid rgba(255,255,255,0.15); }

  .wn-toast-shimmer {
    height: 2px;
    background: linear-gradient(90deg, transparent, #C9A84C, #E2C97E, #C9A84C, transparent);
    background-size: 200% auto;
    animation: wnShimmer 1.5s linear 0.3s 2;
  }

  .wn-toast-body {
    padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px;
  }

  .wn-toast-icon {
    font-size: 22px; line-height: 1; flex-shrink: 0;
    margin-top: 1px;
  }

  .wn-toast-content { flex: 1; min-width: 0; }

  .wn-toast-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #f0ece2; margin-bottom: 3px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .wn-toast-body-text {
    font-family: 'Syne', sans-serif;
    font-size: 11px; color: rgba(240,236,226,0.5);
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  .wn-toast-close {
    background: transparent; border: none; cursor: pointer;
    color: rgba(240,236,226,0.25); font-size: 14px; padding: 0;
    flex-shrink: 0; transition: color 0.2s; margin-top: 1px;
  }
  .wn-toast-close:hover { color: rgba(240,236,226,0.6); }

  .wn-toast-progress {
    height: 2px;
    background: rgba(255,255,255,0.06);
    position: relative; overflow: hidden;
  }
  .wn-toast-progress-bar {
    position: absolute; top: 0; left: 0; bottom: 0;
    background: rgba(201,168,76,0.4);
    animation: wnProgress 4s linear forwards;
  }
  @keyframes wnProgress {
    from { width: 100%; }
    to   { width: 0%; }
  }
`;

interface ToastItem {
  id: string;
  notification: Notification;
  exiting: boolean;
}

function getToastClass(type: string) {
  if (type === "ttl_update") return "wn-toast wn-toast-tip";
  if (type === "letter_reply") return "wn-toast wn-toast-letter";
  if (type === "new_question") return "wn-toast wn-toast-question";
  return "wn-toast wn-toast-default";
}

function getToastIcon(type: string) {
  if (type === "ttl_update") return "🪶";
  if (type === "letter_reply") return "✉️";
  if (type === "new_question") return "💬";
  return "🔔";
}

// ─── Main Component ────────────────────────────────────────────────
export default function WriterNotificationSystem({ writerId }: WriterNotificationSystemProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 350);
  }, []);

  const addToast = useCallback((notification: Notification) => {
    const id = notification.id;
    setToasts(prev => [...prev.slice(-3), { id, notification, exiting: false }]);

    // Play sound
    if (notification.type === "ttl_update") playTipSound();
    else if (notification.type === "letter_reply") playLetterSound();
    else if (notification.type === "new_question") playQuestionSound();

    // Auto-dismiss after 4s
    const timer = setTimeout(() => dismiss(id), 4000);
    timersRef.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => {
    if (!writerId) return;

    // Subscribe to new notifications for this writer
    const channel = supabase
      .channel(`writer-notifications-${writerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${writerId}`,
        },
        (payload) => {
          addToast(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      timersRef.current.forEach(clearTimeout);
    };
  }, [writerId, addToast]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{TOAST_STYLES}</style>
      <div className="wn-toast-wrap">
        {toasts.map(({ id, notification, exiting }) => (
          <div
            key={id}
            className={`${getToastClass(notification.type)}${exiting ? " exiting" : ""}`}
          >
            {notification.type === "ttl_update" && <div className="wn-toast-shimmer" />}
            <div className="wn-toast-body">
              <span className="wn-toast-icon">{getToastIcon(notification.type)}</span>
              <div className="wn-toast-content">
                <div className="wn-toast-title">{notification.title}</div>
                <div className="wn-toast-body-text">{notification.body}</div>
              </div>
              <button
                type="button"
                className="wn-toast-close"
                onClick={() => dismiss(id)}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
            <div className="wn-toast-progress">
              <div className="wn-toast-progress-bar" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
