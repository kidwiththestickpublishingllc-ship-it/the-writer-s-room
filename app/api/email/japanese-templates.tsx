"use client";

export function detectWriterLanguage(name: string, email?: string): 'arabic' | 'japanese' | 'english' {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  if (arabicPattern.test(name)) return 'arabic';
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  if (japanesePattern.test(name)) return 'japanese';
  return 'english';
}

// ── Japanese Email Templates ───────────────────────────────────
// Handles Japanese writer emails for The Tiniest Library
// Cherry blossom pink + white + gold + black theme

// ── Japanese Application Approved Email ───────────────────────
export function japaneseApprovedEmail(name: string): string {
  const firstName = name.split(" ")[0];
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#fdf6f8;font-family:'Georgia',serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid rgba(220,150,170,0.3);border-radius:8px;overflow:hidden;">

        <div style="height:4px;background:linear-gradient(90deg,#f9c6d0,#e8869a,#C9A84C,#e8869a,#f9c6d0);"></div>

        <div style="background:linear-gradient(135deg,#1a0a0e 0%,#2d0f18 50%,#1a0a0e 100%);padding:48px 40px 40px;">
          <div style="text-align:center;font-size:18px;letter-spacing:8px;margin-bottom:16px;opacity:0.6;">🌸 🌸 🌸</div>
          <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.8);margin:0 0 16px;text-align:center;">
            THE TINIEST LIBRARY — ザ・タイニエスト・ライブラリー
          </p>
          <h1 style="font-family:'Georgia',serif;font-size:36px;font-weight:400;color:#fdf6f8;margin:0 0 8px;text-align:center;">
            承認されました。🕯️
          </h1>
          <p style="font-size:16px;font-style:italic;color:rgba(253,246,248,0.5);margin:0;text-align:center;">
            本棚へようこそ。
          </p>
        </div>

        <div style="background:#fdf0f3;padding:20px 40px;border-bottom:1px solid rgba(220,150,170,0.2);text-align:center;">
          <p style="font-size:14px;color:#8b3a52;line-height:1.8;margin:0;">
            ${firstName}さん、あなたの申請が承認されました。🌸<br>
            あなたは今、<strong style="color:#C9A84C;">創設100名</strong>の一人です。
          </p>
        </div>

        <div style="padding:40px;">
          <p style="font-size:15px;color:#2d1a20;line-height:1.8;margin:0 0 20px;">
            あなたの申請は際立っていました。The Tiniest Library でのあなたの声を心待ちにしています。
          </p>

          <div style="background:#fff5f7;border:1px solid rgba(232,134,154,0.3);border-radius:8px;padding:24px;margin-bottom:32px;">
            <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8b3a52;margin:0 0 14px;">
              次のステップ
            </p>
            <p style="font-size:14px;color:#3d1a24;line-height:2.2;margin:0;">
              <span style="color:#C9A84C;font-weight:700;">1</span>&nbsp;&nbsp; 作家ダッシュボードにログインする<br>
              <span style="color:#C9A84C;font-weight:700;">2</span>&nbsp;&nbsp; 作家契約書に署名する<br>
              <span style="color:#C9A84C;font-weight:700;">3</span>&nbsp;&nbsp; プロフィールを完成させる — 自己紹介、写真、ジャンル、SNSリンク<br>
              <span style="color:#C9A84C;font-weight:700;">4</span>&nbsp;&nbsp; プロフィールがリーディングルームに自動的に公開されます
            </p>
          </div>

          <div style="background:#fff5f7;border:1px solid rgba(232,134,154,0.3);border-radius:8px;padding:20px;margin-bottom:32px;">
            <p style="font-size:13px;color:#3d1a24;line-height:2;margin:0;">
              🌸 著作権は常にあなたのもの。例外なく。<br>
              🪙 各章解放の70%が直接あなたに届きます。<br>
              💰 チップは100%あなたのもの。手数料ゼロ。<br>
              🌍 日本語・英語・スペイン語で出版できます。
            </p>
          </div>

          <div style="text-align:center;margin-bottom:32px;">
            <a href="https://write.the-tiniest-library.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
              ダッシュボードへ →
            </a>
          </div>
        </div>

        <div style="background:linear-gradient(135deg,#1a0a0e,#2d0f18);padding:28px 40px;">
          <div style="text-align:center;font-size:16px;letter-spacing:8px;margin-bottom:12px;opacity:0.4;">🌸 🌸 🌸</div>
          <p style="font-size:14px;color:#C9A84C;margin:0 0 4px;text-align:center;">🕯️ ダニエル・F・セデーニョ</p>
          <p style="font-size:12px;color:rgba(253,246,248,0.3);margin:0 0 12px;text-align:center;">創設者、The Tiniest Library</p>
          <p style="font-size:11px;color:rgba(253,246,248,0.2);margin:0;text-align:center;">著作権は常にあなたのもの。· 小さくなんかない · Anything But Tiny 🔥</p>
        </div>

        <div style="height:4px;background:linear-gradient(90deg,#f9c6d0,#e8869a,#C9A84C,#e8869a,#f9c6d0);"></div>
      </div>
    </body>
    </html>
  `;
}

// ── Japanese Onboarding Phase 2 Email HTML ─────────────────────
// Used as fallback if Resend template fails
export function japaneseOnboardingEmail(name: string): string {
  const firstName = name.split(" ")[0];
  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#fdf6f8;font-family:'Georgia',serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid rgba(220,150,170,0.3);border-radius:8px;overflow:hidden;">

        <div style="height:4px;background:linear-gradient(90deg,#f9c6d0,#e8869a,#C9A84C,#e8869a,#f9c6d0);"></div>

        <div style="background:linear-gradient(135deg,#1a0a0e 0%,#2d0f18 50%,#1a0a0e 100%);padding:48px 40px 40px;">
          <div style="text-align:center;font-size:18px;letter-spacing:8px;margin-bottom:16px;opacity:0.6;">🌸 🌸 🌸</div>
          <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(201,168,76,0.8);margin:0 0 16px;text-align:center;">
            THE TINIEST LIBRARY — ザ・タイニエスト・ライブラリー
          </p>
          <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#fdf6f8;margin:0 0 8px;text-align:center;">
            本棚へようこそ、
          </h1>
          <h2 style="font-family:'Georgia',serif;font-size:28px;font-weight:400;color:#C9A84C;margin:0 0 16px;text-align:center;">
            ${firstName}。🕯️
          </h2>
          <p style="font-size:15px;font-style:italic;color:rgba(253,246,248,0.5);margin:0;text-align:center;">
            あなたの作家ダッシュボードが稼働しています。
          </p>
        </div>

        <div style="background:#fdf0f3;padding:20px 40px;border-bottom:1px solid rgba(220,150,170,0.2);text-align:center;">
          <p style="font-size:14px;color:#8b3a52;line-height:1.8;margin:0;">
            あなたの申請が承認され、作家アカウントが有効になりました。<br>
            あなたは今、<strong style="color:#C9A84C;">創設100名</strong>の一人です。🌸
          </p>
        </div>

        <div style="padding:40px;">

          <div style="text-align:center;margin-bottom:40px;">
            <a href="https://write.the-tiniest-library.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
              ダッシュボードへ →
            </a>
          </div>

          <div style="margin-bottom:28px;">
            <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8b3a52;margin:0 0 12px;border-left:3px solid #e8869a;padding-left:12px;">あなたの部屋</p>
            <p style="font-size:14px;color:#2d1a20;line-height:1.9;margin:0 0 16px;">
              あなたは <strong>リーディングルーム</strong> での出版が承認されています。<strong style="color:#8b0000;">レッドルーム</strong> にも承認されている場合は、成人向けコンテンツ（+18）はそちらに投稿してください。
            </p>
            <div style="background:#fff5f7;border:1px solid rgba(232,134,154,0.3);border-radius:8px;padding:20px;">
              <p style="font-size:13px;color:#3d1a24;line-height:2.2;margin:0;">
                🌸 <strong>オリジナル作品のみ。</strong> AIによる執筆支援がある場合は開示してください。<br>
                🌸 <strong>著作権は常にあなたのもの。</strong> あなたが所有者です。<br>
                🌸 <strong>投稿前に校正してください。</strong> クオリティが重要です。<br>
                🌸 <strong>未成年者を傷つけるコンテンツは禁止。</strong> 例外はありません。<br>
                🌸 <strong>連載を始めたら、続けてください。</strong> 読者の信頼に応えてください。
              </p>
            </div>
          </div>

          <div style="margin-bottom:28px;">
            <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8b3a52;margin:0 0 12px;border-left:3px solid #e8869a;padding-left:12px;">インクの仕組み</p>
            <div style="border:1px solid rgba(232,134,154,0.3);border-radius:8px;overflow:hidden;margin-bottom:12px;">
              <div style="display:flex;padding:10px 16px;background:#fdf0f3;border-bottom:1px solid rgba(232,134,154,0.2);">
                <div style="flex:1;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8b3a52;">読者のアクション</div>
                <div style="flex:1;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8b3a52;text-align:right;">あなたの取り分</div>
              </div>
              <div style="display:flex;padding:12px 16px;border-bottom:1px solid rgba(220,150,170,0.1);background:#fff;">
                <div style="flex:1;font-size:13px;color:#2d1a20;">章を解放（25インク）</div>
                <div style="flex:1;font-size:13px;color:#1a7a3a;text-align:right;font-weight:700;">70% — 約$0.18</div>
              </div>
              <div style="display:flex;padding:12px 16px;background:#fff;">
                <div style="flex:1;font-size:13px;color:#2d1a20;">チップを贈る</div>
                <div style="flex:1;font-size:13px;color:#1a7a3a;text-align:right;font-weight:700;">100% あなたへ</div>
              </div>
            </div>
            <p style="font-size:13px;color:#6b4a52;margin:0;">最低支払額はありません。PayPal、Wise、Payoneer でいつでも支払いをリクエストできます。</p>
          </div>

          <div style="margin-bottom:40px;">
            <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8b3a52;margin:0 0 12px;border-left:3px solid #e8869a;padding-left:12px;">次のステップ</p>
            <div style="background:#fff5f7;border:1px solid rgba(232,134,154,0.3);border-radius:8px;padding:24px;">
              <p style="font-size:14px;color:#2d1a20;line-height:2.4;margin:0;">
                <span style="color:#C9A84C;font-weight:700;">1</span>&nbsp;&nbsp; ダッシュボードにログインする<br>
                <span style="color:#C9A84C;font-weight:700;">2</span>&nbsp;&nbsp; プロフィールを完成させる — 写真、自己紹介、ジャンル<br>
                <span style="color:#C9A84C;font-weight:700;">3</span>&nbsp;&nbsp; 契約書に署名する<br>
                <span style="color:#C9A84C;font-weight:700;">4</span>&nbsp;&nbsp; 最初の作品を投稿する<br>
                <span style="color:#C9A84C;font-weight:700;">5</span>&nbsp;&nbsp; 世界に知らせる。TTL プロフィールリンクを共有してください。
              </p>
            </div>
          </div>

          <div style="text-align:center;margin-bottom:40px;">
            <a href="https://write.the-tiniest-library.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:6px;text-decoration:none;">
              TTL で執筆を始める →
            </a>
          </div>

        </div>

        <div style="background:linear-gradient(135deg,#1a0a0e,#2d0f18);padding:32px 40px;">
          <div style="text-align:center;font-size:16px;letter-spacing:8px;margin-bottom:14px;opacity:0.4;">🌸 🌸 🌸</div>
          <p style="font-size:13px;color:rgba(253,246,248,0.4);margin:0 0 6px;text-align:center;">
            The Tiniest Library · リーディングルーム · ライターズルーム · レッドルーム
          </p>
          <p style="font-size:12px;color:rgba(253,246,248,0.25);margin:0 0 14px;text-align:center;">
            ご質問は hello@the-tiniest-library.com までご連絡ください
          </p>
          <p style="font-size:14px;color:#C9A84C;margin:0 0 4px;text-align:center;">🕯️ ダニエル・F・セデーニョ</p>
          <p style="font-size:12px;color:rgba(253,246,248,0.3);margin:0 0 14px;text-align:center;">創設者、The Tiniest Library · Kid with the Stick Publishing LLC</p>
          <p style="font-size:11px;color:rgba(253,246,248,0.2);margin:0;text-align:center;">著作権は常にあなたのもの。· 小さくなんかない · Anything But Tiny 🔥</p>
        </div>

        <div style="height:4px;background:linear-gradient(90deg,#f9c6d0,#e8869a,#C9A84C,#e8869a,#f9c6d0);"></div>
      </div>
    </body>
    </html>
  `;
}
