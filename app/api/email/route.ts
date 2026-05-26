import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { japaneseApprovedEmail, japaneseOnboardingEmail } from './japanese-templates';
import { isArabicWriter, detectWriterLanguage, arabicApprovedEmail, arabicOnboardingEmail } from './arabic-templates';

// =========================
// TTL Email API Route
// app/api/email/route.ts (TWR)
// Handles all writer pipeline emails via Resend
// =========================

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "The Tiniest Library <hello@the-tiniest-library.com>";
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
                      4. Click <strong style="color:#C9A84C;">Submit Story</strong> in the sidebar to upload your manuscript<br>
                      5. Add your chapters one by one in the Chapters tab<br>
                      6. We review and publish — your profile and stories go live automatically
                    </p>
                  </div>

                  <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;margin-bottom:16px;">
                    Go to Your Dashboard →
                  </a>
                  <br>
                  <a href="${DASHBOARD_URL}?tab=submit" style="display:inline-block;background:transparent;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;border:1px solid rgba(201,168,76,0.4);margin-bottom:32px;">
                    Submit Your First Story →
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
// ── 4. Writer Onboarding Phase 2 ──
case "writer-onboarding-phase-2": {
  const language = detectWriterLanguage(name, to);
  const firstName = name.split(" ")[0];

  // Arabic and Japanese still use Resend templates (those are correct)
  // English now uses inline HTML since template_id was silently failing
  if (language === "arabic" || language === "japanese") {
    const subjects: Record<string, string> = {
      arabic:   "لوحة تحكم الكاتب جاهزة — كل ما تحتاجه هنا 🕯️",
      japanese: "作家ダッシュボードへようこそ — The Tiniest Library 🌸",
    };
    const templates: Record<string, string> = {
      arabic:   "4e653d06-5b00-45fd-aafd-04c6192a7f61",
      japanese: "10c1dd38-aa3d-4baa-a562-cc220d92317f",
    };
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: subjects[language],
        template_id: templates[language],
        variables: { writer_first_name: firstName },
      }),
    });
  } else {
    // English — inline HTML, fires reliably every time
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Your writer dashboard is live — here's everything you need 🕯️",
      html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
<div style="max-width:620px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
  <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
  <div style="padding:48px 40px;">
    <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
    <h1 style="font-family:'Georgia',serif;font-size:36px;font-weight:400;color:#f0ece2;margin:0 0 8px;">Welcome to the shelf,<br>${firstName}.</h1>
    <p style="font-size:15px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;">Your writer dashboard is live and ready.</p>
    <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">Your application has been approved and your writer account is active. Everything you need to start publishing on TTL is below.</p>
    <div style="text-align:center;margin:0 0 40px;">
      <a href="https://write.the-tiniest-library.com/dashboard?welcome=true" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:16px 40px;border-radius:6px;text-decoration:none;">Go to Your Dashboard →</a>
      <p style="font-size:11px;color:rgba(240,236,226,0.3);margin:12px 0 0;">Your profile, stories, earnings and agreements — all in one place.</p>
    </div>
    <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.18);border-radius:8px;padding:24px;margin-bottom:28px;">
      <p style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 12px;">Your Room</p>
      <p style="font-size:14px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 16px;">You are approved to publish in <strong style="color:#f0ece2;">The Reading Room</strong> — TTL's home for literary fiction, genre fiction, serials, short stories, comics, and manga.</p>
      <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.75;margin:0;">
        ✦ Original work only. AI-assisted writing must be disclosed.<br>
        ✦ You keep your copyright. Always.<br>
        ✦ Proofread before you publish. Quality matters.<br>
        ✦ No content that harms minors. Immediate permanent ban.<br>
        ✦ If you start a serial, commit to it. Your readers are investing.
      </p>
    </div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:24px;margin-bottom:28px;">
      <p style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">How Ink Pays You</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr style="border-bottom:1px solid rgba(255,255,255,0.07);">
          <th style="text-align:left;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(240,236,226,0.35);padding:8px 0;font-weight:500;">Reader Action</th>
          <th style="text-align:right;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(240,236,226,0.35);padding:8px 0;font-weight:500;">Your Cut</th>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="font-size:13px;color:rgba(240,236,226,0.7);padding:10px 0;">Unlocks one of your chapters (25 Ink)</td>
          <td style="text-align:right;font-size:13px;color:#C9A84C;padding:10px 0;">70% — ~$0.18 per unlock</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:rgba(240,236,226,0.7);padding:10px 0;">Tips you via your Ink Jar</td>
          <td style="text-align:right;font-size:13px;color:#C9A84C;padding:10px 0;">100% — every penny</td>
        </tr>
      </table>
      <p style="font-size:12px;color:rgba(240,236,226,0.4);line-height:1.7;margin:0;">No minimum payout. Request anytime via Stripe, PayPal, or Venmo.</p>
    </div>
    <div style="background:rgba(201,168,76,0.04);border:1px solid rgba(201,168,76,0.15);border-radius:8px;padding:24px;margin-bottom:32px;">
      <p style="font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">Your Next Steps</p>
      <p style="font-size:14px;color:rgba(240,236,226,0.75);line-height:1.9;margin:0;">
        1. Log into your dashboard<br>
        2. Complete your profile — photo, bio, genres, social links<br>
        3. Sign your agreements — Plagiarism Clause and Copyright Agreement<br>
        4. Submit your first story from the Stories tab<br>
        5. Share your TTL profile link everywhere you write online
      </p>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://write.the-tiniest-library.com/dashboard?welcome=true&tab=submit" style="display:inline-block;background:transparent;color:#C9A84C;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;border:1px solid rgba(201,168,76,0.4);">Submit Your First Story →</a>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;text-align:center;">
      <p style="font-size:11px;color:rgba(240,236,226,0.25);margin:0 0 8px;letter-spacing:0.1em;">Reading Room · Writer's Room · Red Room</p>
      <p style="font-size:11px;color:rgba(240,236,226,0.2);margin:0;">Questions? <a href="mailto:hello@the-tiniest-library.com" style="color:rgba(201,168,76,0.5);">hello@the-tiniest-library.com</a></p>
      <p style="font-size:10px;color:rgba(240,236,226,0.15);margin:12px 0 0;">You keep your copyright. Always. · The Tiniest Library</p>
    </div>
  </div>
</div>
</body>
</html>`,
    });
  }
  break;
}
      
case "writer-reminder": {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your TTL writer dashboard is waiting for you 🕯️",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
        <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
          <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
          <div style="padding:48px 40px;">
            <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
            <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 24px;">Your shelf is still empty, ${name}.</h1>
            <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
              You were approved to write for The Tiniest Library but your profile hasn't been set up yet. Readers are waiting — it only takes a few minutes to go live.
            </p>
            <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
              <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;">
                1. Log into your dashboard<br>
                2. Add your photo, bio and genres<br>
                3. Submit your first story<br>
                4. Start earning Ink
              </p>
            </div>
            <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
              Complete Your Profile →
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  });
  break;
}
// ── 6. Story Submitted ──
      case "story-submitted": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `New story submission: ${data?.title} — The Tiniest Library`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
                <div style="padding:40px;">
                  <h2 style="font-family:'Georgia',serif;font-size:24px;font-weight:400;color:#f0ece2;margin:0 0 20px;">New Story Submission</h2>
                  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:20px;margin-bottom:24px;">
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0 0 8px;"><strong style="color:#f0ece2;">Writer:</strong> ${name}</p>
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0 0 8px;"><strong style="color:#f0ece2;">Title:</strong> ${data?.title}</p>
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0 0 8px;"><strong style="color:#f0ece2;">Room:</strong> ${data?.room}</p>
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);margin:0;"><strong style="color:#f0ece2;">Genre:</strong> ${data?.genre}</p>
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
      // ── Story Approved ──
      case "story-approved": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `Your story is live on The Tiniest Library — ${data?.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,#E2C97E,#C9A84C,transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:36px;font-weight:400;color:#f0ece2;margin:0 0 8px;">Your story is live.</h1>
                  <p style="font-size:16px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;">${data?.title}</p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">Hi ${name},</p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    Your story has been reviewed and approved. It's now live in The Reading Room and appearing in your genre pages. Readers can find it, follow you, and start spending Ink on your chapters right now.
                  </p>
                  <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 12px;">What happens now</p>
                    <p style="font-size:14px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;">
                      ✦ Your story is live in The Reading Room<br>
                      ✦ It appears on your author profile automatically<br>
                      ✦ Readers can unlock chapters with Ink<br>
                      ✦ Tips go 100% to you — unlocks earn you 70%<br>
                      ✦ Share your profile link everywhere you write
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

      // ── Story Rejected ──
      case "story-rejected": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `Your story submission — The Tiniest Library`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(255,255,255,0.08);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,rgba(201,168,76,0.4),transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.5);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 32px;">Thanks for submitting, ${name}.</h1>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">
                    We've reviewed your submission of <strong style="color:#f0ece2;">${data?.title}</strong> and we aren't able to publish it at this time.
                  </p>
                  ${data?.note ? `
                  <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(240,236,226,0.3);margin:0 0 10px;">Note from the team</p>
                    <p style="font-size:14px;color:rgba(240,236,226,0.6);line-height:1.7;margin:0;">${data.note}</p>
                  </div>` : ''}
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    You're welcome to revise and resubmit from your dashboard at any time.
                  </p>
                  <a href="${DASHBOARD_URL}?tab=submit" style="display:inline-block;border:1px solid rgba(201,168,76,0.3);color:#C9A84C;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;padding:12px 24px;border-radius:6px;text-decoration:none;">
                    Revise & Resubmit →
                  </a>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      // ── World Content Approved ──
      case "world-content-approved": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `Your world content is live on TTL — ${data?.story_title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,#a78bfa,transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 8px;">Your world is live.</h1>
                  <p style="font-size:15px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;">${data?.story_title}</p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;">Hi ${name},</p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    Your ${data?.content_type ?? 'world content'} for <strong style="color:#f0ece2;">${data?.story_title}</strong> has been reviewed and approved. It's now live and will unlock for readers as they progress through your story.
                  </p>
                  <div style="background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(167,139,250,0.7);margin:0 0 12px;">What was approved</p>
                    <p style="font-size:14px;color:rgba(240,236,226,0.7);line-height:1.8;margin:0;">
                      ${data?.items_approved ?? 'Your submitted content'} — approved and live in the Reading Room.
                    </p>
                  </div>
                  <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
                    View Your Dashboard →
                  </a>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      // ── Story Live — Social Share Nudge ──
      case "story-live-share": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `Your story is live — time to share it 🕯️`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 8px;">${data?.title} is live.</h1>
                  <p style="font-size:15px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;">Now let your readers find it.</p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    Hi ${name}, your story is published and live in The Reading Room. The next step is getting eyes on it. Here's how to spread the word:
                  </p>
                  <div style="background:rgba(201,168,76,0.06);border:1px solid rgba(201,168,76,0.18);border-radius:8px;padding:24px;margin-bottom:24px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">Share your story link</p>
                    <p style="font-size:14px;color:rgba(240,236,226,0.7);line-height:1.8;margin:0 0 12px;">
                      Your story is live at:
                    </p>
                    <div style="background:rgba(0,0,0,0.3);border:1px solid rgba(201,168,76,0.2);border-radius:6px;padding:12px 16px;font-family:monospace;font-size:13px;color:#C9A84C;margin-bottom:16px;">
                      ${READING_ROOM_URL}/stories/${data?.slug}
                    </div>
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;">
                      ✦ Post your link on Instagram, X, TikTok, and anywhere you write online<br>
                      ✦ Tell your existing audience exactly where to find you on TTL<br>
                      ✦ Pin it. Link it in your bio. Put it everywhere.<br>
                      ✦ The first 3 chapters are free — make it easy for new readers to start
                    </p>
                  </div>
                  <div style="background:rgba(167,139,250,0.06);border:1px solid rgba(167,139,250,0.18);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(167,139,250,0.7);margin:0 0 12px;">Your author profile</p>
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;">
                      Share your author profile too — readers can follow you there and get notified every time you drop a new chapter.
                    </p>
                  </div>
                  <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;margin-bottom:16px;">
                    Go to Your Dashboard →
                  </a>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      // ── First Reader Celebration ──
      case "first-unlock": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `Your first reader just unlocked your story 🎉`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#4ade80,#C9A84C,transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 8px;">Someone just paid to read your work.</h1>
                  <p style="font-size:16px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;">This is what it feels like.</p>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">
                    Hi ${name}, a reader just spent Ink to unlock <strong style="color:#f0ece2;">${data?.chapter_title}</strong> of <strong style="color:#f0ece2;">${data?.story_title}</strong>. That's real money, from a real person, who chose your story.
                  </p>
                  <div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:24px;margin-bottom:32px;text-align:center;">
                    <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(74,222,128,0.7);margin:0 0 8px;">You earned</p>
                    <p style="font-family:'Georgia',serif;font-size:48px;font-weight:400;color:#4ade80;margin:0 0 4px;">${data?.amount ?? '$0.18'}</p>
                    <p style="font-size:12px;color:rgba(240,236,226,0.4);margin:0;">70% of the unlock — yours to keep</p>
                  </div>
                  <p style="font-size:14px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0 0 32px;">
                    Keep writing. Keep publishing. Every chapter you drop is another chance for this to happen again.
                  </p>
                  <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
                    See Your Earnings →
                  </a>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        break;
      }

      // ── Payout Processed ──
      case "payout-processed": {
        await resend.emails.send({
          from: FROM,
          to,
          subject: `Your payout has been sent — The Tiniest Library`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;">
              <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
                <div style="height:3px;background:linear-gradient(90deg,transparent,#4ade80,transparent);"></div>
                <div style="padding:48px 40px;">
                  <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;">The Tiniest Library</p>
                  <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 8px;">Your payout is on its way.</h1>
                  <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;">Hi ${name}, your payout of <strong style="color:#4ade80;">${data?.amount}</strong> has been processed via <strong style="color:#f0ece2;">${data?.method}</strong> to ${data?.handle}.</p>
                  <div style="background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
                    <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;">
                      ✦ Amount: <strong style="color:#4ade80;">${data?.amount}</strong><br>
                      ✦ Method: ${data?.method}<br>
                      ✦ Sent to: ${data?.handle}<br>
                      ✦ Please allow 1-2 business days for funds to arrive.
                    </p>
                  </div>
                  <a href="${DASHBOARD_URL}" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
                    View Your Earnings →
                  </a>
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
