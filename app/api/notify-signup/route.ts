/**
 * app/api/notify-signup/route.ts — the-writers-room
 * ─────────────────────────────────────────────────────────────────
 * Emails the TTL admin when a new member signs up (profiles INSERT)
 * or a new creator application arrives (applications INSERT).
 *
 * Called ONLY by Supabase Database Webhooks. Every call must carry
 * the header  x-notify-secret: <NOTIFY_WEBHOOK_SECRET>  — anything
 * without it is turned away, so nobody else can trigger emails.
 * ─────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "The Tiniest Library <hello@the-tiniest-library.com>";
const ADMIN_EMAIL = "kidwiththestickpublishingllc@gmail.com";
const ADMIN_PANEL = "https://write.the-tiniest-library.com/ttl-admin";

const esc = (v: unknown) =>
  String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Fields never worth emailing (or never safe to).
const SKIP = new Set(["id", "user_id", "ink_balance", "preferences", "reading_history", "payout_email", "payout_method", "tax_form_type"]);

function detailRows(record: Record<string, unknown>) {
  return Object.entries(record)
    .filter(([k, v]) => !SKIP.has(k) && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => {
      const text = typeof v === "object" ? JSON.stringify(v) : String(v);
      const short = text.length > 300 ? text.slice(0, 300) + "…" : text;
      return `<tr><td style="padding:6px 12px 6px 0;color:#666;font-size:13px;vertical-align:top;white-space:nowrap;">${esc(k.replace(/_/g, " "))}</td><td style="padding:6px 0;color:#111;font-size:14px;">${esc(short)}</td></tr>`;
    })
    .join("");
}

export async function POST(req: NextRequest) {
  const secret = process.env.NOTIFY_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-notify-secret") !== secret) {
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  const payload = await req.json().catch(() => null);
  if (!payload || payload.type !== "INSERT" || !payload.record) {
    return NextResponse.json({ ignored: true });
  }

  const table: string = payload.table;
  const r = payload.record as Record<string, unknown>;
  const who = (r.full_name || r.name || r.username || r.email || "someone") as string;

  let subject: string;
  let heading: string;
  if (table === "profiles") {
    subject = `New member: ${r.email ?? who}`;
    heading = "Someone just joined TTL";
  } else if (table === "applications") {
    const kind = (r.applicant_type as string) || "writer";
    subject = `New ${kind} application: ${who}`;
    heading = `New ${kind} application`;
  } else {
    return NextResponse.json({ ignored: true });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:3px solid #111;">
          <h2 style="margin:0 0 4px;font-size:22px;color:#111;">${esc(heading)}</h2>
          <p style="margin:0 0 16px;color:#666;font-size:13px;">${esc(new Date().toUTCString())}</p>
          <table style="border-collapse:collapse;">${detailRows(r)}</table>
          <p style="margin:20px 0 0;"><a href="${ADMIN_PANEL}" style="background:#FFE14D;color:#111;border:2px solid #111;padding:10px 16px;text-decoration:none;font-weight:bold;">Open the admin panel</a></p>
        </div>`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Email failed" }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}