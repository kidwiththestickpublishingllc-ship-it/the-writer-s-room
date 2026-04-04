import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// =========================
// TTL Email API Route
// app/api/email/route.ts (TWR)
// Handles all writer pipeline emails via Resend
// =========================

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "The Tiniest Library <onboarding@resend.dev>";
const ADMIN_EMAIL = "kidwiththestickpublishingllc@gmail.com";
const DASHBOARD_URL = "https://write.the-tiniest-library.com/dashboard";
const APPLY_URL = "https://write.the-tiniest-library.com/apply";
const READING_ROOM_URL = "https://the-reading-room-three.write.the-tiniest-library.com/reading-room";

export async function POST(req: NextRequest) {
  try {
    const { type, to, name, data } = await req.json();

    switch (type) {

      // ── 1. Application Submitted — confirm to writer ──
      case "application-submitted": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: "We received your application — The Tiniest Library",
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
                
                <div style="padding:48px 40px;">
                  <div style="margin-bottom:32px;">
                    <div style="width:40px;height:40px;background:linear-gradient(135deg,#C9A84C,#8a6510);border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#000;margin-bottom:20px;">TTL</div>
                    <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 8px;">Your application is in.</h1>
                    <p style="font-size:14px;color:rgba(240,236,226,0.5);margin:0;letter-spacing:0.05em;">THE TINIEST LIBRARY — WRITER APPLICATION</p>
                  </div>

                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
                    Hi ${name},
                  </p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
                    Thank you for applying to write for The Tiniest Library. We've received your application and we're genuinely excited to read it.
                  </p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    Every application is read personally. You'll hear back from us within <strong style="color:#f0ece2;">5–7 business days</strong> with a decision.
                  </p>

                  <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 12px;">What happens next</p>
                    <p style="font-size:14px;color:rgba(240,236,226,0.6);line-height:1.7;margin:0;">
                      1. We review your application and writing sample<br>
                      2. You receive an approval or feedback email<br>
                      3. Approved writers sign agreements and set up their profile<br>
                      4. Your profile and stories go live in The Reading Room
                    </p>
                  </div>

                  <p style="font-size:14px;color:rgba(240,236,226,0.5);line-height:1.7;margin:0 0 32px;">
                    While you wait, explore <a href="${READING_ROOM_URL}" style="color:#C9A84C;text-decoration:none;">The Reading Room</a> to see what TTL is building.
                  </p>

                  <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                    <p style="font-size:12px;color:rgba(240,236,226,0.3);margin:0;">The Tiniest Library · Writers keep their copyright, always.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        // Also notify admin
        await resend.emails.send({
          from: FROM,
          to: ADMIN_EMAIL,
          subject: `New application: ${name} — The Tiniest Library`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
                <div style="padding:40px;">
                  <h2 style="font-family:'Georgia',serif;font-size:24px;font-weight:400;color:#f0ece2;margin:0 0 20px;">New Writer Application</h2>
                  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:20px;margin-bottom:24px;">
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0 0 8px;"><strong style="color:#f0ece2;">Name:</strong> ${name}</p>
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0 0 8px;"><strong style="color:#f0ece2;">Email:</strong> ${to}</p>
                    ${data?.genres ? `<p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0;"><strong style="color:#f0ece2;">Genres:</strong> ${data.genres.join(", ")}</p>` : ""}
                  </div>
                  <a href="https://write.the-tiniest-library.com/ttl-admin" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;padding:12px 24px;border-radius:6px;text-decoration:none;">
                    Review in Admin →
                  </a>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      // ── 2. Application Approved ──
      case "application-approved": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: "You're in — Welcome to The Tiniest Library",
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,#E2C97E,#C9A84C,transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:36px;font-weight:400;color:#f0ece2;margin:0 0 8px;">You're approved.</h1>
                  <p style="font-size:16px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;">Welcome to the library.</p>

                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
                    Hi ${name},
                  </p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    We're excited to have you. Your application stood out and we'd love to have your voice on TTL. Here's how to get started:
                  </p>

                  <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">Your next steps</p>
                    <p style="font-size:14px;color:rgba(240,236,226,0.7);line-height:1.8;margin:0;">
                      1. Log into your writer dashboard<br>
                      2. Sign your writer agreements<br>
                      3. Fill out your profile — bio, photo, genres, social links<br>
                      4. Your profile goes live in The Reading Room automatically
                    </p>
                  </div>

                  <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;margin-bottom:32px;">
                    Go to Your Dashboard →
                  </a>

                  <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                    <p style="font-size:12px;color:rgba(240,236,226,0.3);margin:0;">You keep your copyright. Always. · The Tiniest Library</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      // ── 3. Application Rejected ──
      case "application-rejected": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: "Your TTL application — The Tiniest Library",
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.5);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 32px;">Thank you for applying.</h1>

                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
                    Hi ${name},
                  </p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
                    We genuinely appreciate you taking the time to apply to The Tiniest Library. After careful review, we aren't able to move forward with your application at this time.
                  </p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    This doesn't reflect the quality of your writing — TTL is still growing and our needs are specific at this stage. We encourage you to apply again in the future as the library expands.
                  </p>

                  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:13px;color:rgba(240,236,226,0.5);line-height:1.7;margin:0;">
                      Keep writing. Keep submitting. The right home for your work exists — and it may be TTL at a different time. You're always welcome to reapply.
                    </p>
                  </div>

                  <a href="${APPLY_URL}" style="display:inline-block;border:1px solid rgba(201,168,76,0.3);color:#C9A84C;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;padding:12px 24px;border-radius:6px;text-decoration:none;margin-bottom:32px;">
                    Apply Again →
                  </a>

                  <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
                    <p style="font-size:12px;color:rgba(240,236,226,0.3);margin:0;">With respect · The Tiniest Library</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
