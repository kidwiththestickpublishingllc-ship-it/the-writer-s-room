// ── Language Detection ─────────────────────────────────────────
// Add this function at the top of your email route file
// It detects Arabic names and email addresses automatically

export function detectWriterLanguage(name: string, email?: string): 'arabic' | 'japanese' | 'english' {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  if (arabicPattern.test(name)) return 'arabic';
  if (email) {
    const arabicDomains = ['.sa','.ae','.eg','.kw','.qa','.bh','.om','.jo','.iq','.sy','.lb','.ma','.dz','.tn','.ly','.sd'];
    if (arabicDomains.some(d => email.toLowerCase().endsWith(d))) return 'arabic';
  }
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  if (japanesePattern.test(name)) return 'japanese';
  return 'english';
}

export function isArabicWriter(name: string, email?: string): boolean {
  return detectWriterLanguage(name, email) === 'arabic';
}

// ── Arabic Application Approved Email ──────────────────────────
// Replace your existing "application-approved" case with this:
// It automatically sends Arabic or English based on the writer's name

/*
case "application-approved": {
  const arabic = isArabicWriter(name, to);
  await resend.emails.send({
    from: FROM,
    to,
    subject: arabic
      ? "تمت الموافقة على طلبك — مرحباً بك في The Tiniest Library"
      : "You're in — Welcome to The Tiniest Library",
    html: arabic
      ? arabicApprovedEmail(name)
      : englishApprovedEmail(name),
  });
  break;
}
*/

// ── Arabic Approved Email HTML ──────────────────────────────────
export function arabicApprovedEmail(name: string): string {
  const firstName = name.split(" ")[0];
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;direction:rtl;">
      <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
        <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,#E2C97E,#C9A84C,transparent);"></div>
        <div style="padding:48px 40px;">

          <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;text-align:right;">
            ザ・タイニエスト・ライブラリー
          </p>

          <h1 style="font-family:'Georgia',serif;font-size:36px;font-weight:400;color:#f0ece2;margin:0 0 8px;text-align:right;">
            تمت الموافقة على طلبك. 🕯️
          </h1>

          <p style="font-size:16px;font-style:italic;color:rgba(240,236,226,0.5);margin:0 0 32px;text-align:right;">
            مرحباً بك في المكتبة.
          </p>

          <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;text-align:right;">
            مرحباً ${firstName}،
          </p>

          <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 20px;text-align:right;">
            يسعدنا الترحيب بك في The Tiniest Library. لقد تميّز طلبك، ونتطلع إلى سماع صوتك الأدبي على منصتنا.
          </p>

          <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 32px;text-align:right;">
            أنت الآن جزء من المؤسسين الأوائل — الأصوات التي ستحدد شكل هذه المكتبة للعالم.
          </p>

          <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:24px;margin-bottom:32px;">
            <p style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,168,76,0.7);margin:0 0 16px;text-align:right;">
              خطواتك التالية
            </p>
            <p style="font-size:14px;color:rgba(240,236,226,0.7);line-height:2;margin:0;text-align:right;">
              ١. سجّل الدخول إلى لوحة تحكم الكاتب<br>
              ٢. وقّع اتفاقيات الكاتب<br>
              ٣. أكمل ملفك الشخصي — السيرة الذاتية والأجناس الأدبية<br>
              ٤. سيظهر ملفك تلقائياً في غرفة القراءة
            </p>
          </div>

          <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.1);border-radius:8px;padding:20px;margin-bottom:32px;">
            <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;text-align:right;">
              🪶 حقوق التأليف والنشر ملكك دائماً. بلا استثناء.<br>
              🪙 ٧٠٪ من كل عملية فتح فصل تذهب مباشرة إليك.<br>
              💰 بقشيش القراء ١٠٠٪ لك. بدون أي رسوم للمنصة.<br>
              🌍 انشر بالعربية أو الإنجليزية أو الإسبانية أو الجميع.
            </p>
          </div>

          <div style="text-align:center;margin-bottom:32px;">
            <a href="https://write.the-tiniest-library.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:12px;font-weight:700;letter-spacing:0.15em;padding:14px 32px;border-radius:6px;text-decoration:none;">
              انتقل إلى لوحة التحكم ←
            </a>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
            <p style="font-size:13px;color:rgba(240,236,226,0.5);margin:0 0 8px;text-align:right;">
              مع خالص التحية والتقدير،
            </p>
            <p style="font-size:14px;color:#C9A84C;margin:0;text-align:right;">
              🕯️ دانيال F. سيدينيو
            </p>
            <p style="font-size:12px;color:rgba(240,236,226,0.3);margin:4px 0 0;text-align:right;">
              المؤسس، The Tiniest Library · Kid with the Stick Publishing LLC
            </p>
            <p style="font-size:11px;color:rgba(240,236,226,0.2);margin:16px 0 0;text-align:right;">
              حقوق التأليف والنشر ملكك دائماً. · The Tiniest Library
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}

// ── Arabic Onboarding Phase 2 Email HTML ───────────────────────
export function arabicOnboardingEmail(name: string): string {
  const firstName = name.split(" ")[0];
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Georgia',serif;direction:rtl;">
      <div style="max-width:600px;margin:0 auto;background:#0f0f0f;border:1px solid rgba(201,168,76,0.2);border-radius:8px;overflow:hidden;">
        <div style="height:3px;background:linear-gradient(90deg,transparent,#C9A84C,#E2C97E,#C9A84C,transparent);"></div>
        <div style="padding:48px 40px;">

          <p style="font-size:11px;letter-spacing:0.18em;color:rgba(201,168,76,0.7);margin:0 0 16px;text-align:right;">
            The Tiniest Library — لوحة تحكم الكاتب
          </p>

          <h1 style="font-family:'Georgia',serif;font-size:32px;font-weight:400;color:#f0ece2;margin:0 0 24px;text-align:right;">
            لوحة التحكم الخاصة بك جاهزة. 🕯️
          </h1>

          <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 24px;text-align:right;">
            مرحباً ${firstName}،
          </p>

          <p style="font-size:15px;color:rgba(240,236,226,0.75);line-height:1.8;margin:0 0 24px;text-align:right;">
            كل ما تحتاجه لبدء رحلتك كاتباً في The Tiniest Library موجود الآن في لوحة التحكم الخاصة بك.
          </p>

          <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:24px;margin-bottom:24px;">
            <p style="font-size:11px;letter-spacing:0.18em;color:rgba(201,168,76,0.7);margin:0 0 16px;text-align:right;">
              دليل البدء السريع
            </p>
            <p style="font-size:14px;color:rgba(240,236,226,0.7);line-height:2;margin:0;text-align:right;">
              ١. <strong style="color:#C9A84C;">أكمل ملفك الشخصي</strong> — صورة، سيرة ذاتية، الأجناس الأدبية<br>
              ٢. <strong style="color:#C9A84C;">وقّع اتفاقيات الكاتب</strong> — تحمي حقوقك وتفعّل أرباحك<br>
              ٣. <strong style="color:#C9A84C;">أرسل قصتك الأولى</strong> — أي طول وأي جنس أدبي<br>
              ٤. <strong style="color:#C9A84C;">ابدأ في الكسب</strong> — القراء يدفعون لفتح فصولك مباشرة
            </p>
          </div>

          <div style="background:rgba(201,168,76,0.05);border:1px solid rgba(201,168,76,0.1);border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="font-size:11px;letter-spacing:0.18em;color:rgba(201,168,76,0.7);margin:0 0 12px;text-align:right;">
              كيف تعمل منظومة الأرباح
            </p>
            <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:2;margin:0;text-align:right;">
              القراء يشترون <strong style="color:#C9A84C;">الحبر</strong> — عملتنا الداخلية<br>
              يستخدمون الحبر لفتح فصولك<br>
              <strong style="color:#C9A84C;">٧٠٪</strong> من قيمة كل فتح تذهب مباشرة إليك<br>
              البقشيش <strong style="color:#C9A84C;">١٠٠٪</strong> لك — بدون أي رسوم<br>
              حقوق التأليف والنشر <strong style="color:#C9A84C;">ملكك دائماً</strong>. بلا استثناء.
            </p>
          </div>

          <div style="background:rgba(139,0,0,0.08);border:1px solid rgba(139,0,0,0.2);border-radius:8px;padding:20px;margin-bottom:32px;">
            <p style="font-size:13px;color:rgba(240,236,226,0.6);line-height:1.8;margin:0;text-align:right;">
              🖤 <strong style="color:#cc4444;">The Red Room</strong> — غرفة المحتوى للبالغين (+١٨)<br>
              إذا كنت تكتب في هذا الجنس يمكنك نشره هناك أيضاً.<br>
              لا رقابة. لا حذف. صوتك كاملاً.
            </p>
          </div>

          <div style="text-align:center;margin-bottom:32px;">
            <a href="https://write.the-tiniest-library.com/dashboard"
               style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#8a6510);color:#000;font-size:12px;font-weight:700;letter-spacing:0.15em;padding:14px 32px;border-radius:6px;text-decoration:none;">
              ابدأ الآن ←
            </a>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
            <p style="font-size:13px;color:rgba(240,236,226,0.5);margin:0 0 8px;text-align:right;">
              في أي وقت تحتاج المساعدة راسلنا على
            </p>
            <p style="font-size:13px;color:#C9A84C;margin:0 0 16px;text-align:right;">
              hello@the-tiniest-library.com
            </p>
            <p style="font-size:14px;color:#C9A84C;margin:0;text-align:right;">
              🕯️ دانيال F. سيدينيو
            </p>
            <p style="font-size:12px;color:rgba(240,236,226,0.3);margin:4px 0 0;text-align:right;">
              المؤسس، The Tiniest Library
            </p>
            <p style="font-size:11px;color:rgba(240,236,226,0.2);margin:16px 0 0;text-align:right;">
              الطريق إلى القراء يبدأ هنا. · The Tiniest Library · 小さくなんかない
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;
}
