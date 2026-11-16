/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *   exact — FROM must appear exactly once, replaced with TO
 *   all   — PATTERN may match many times; every match is replaced.
 *           DONE is text that proves the edit already ran.
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 *
 * Batch: lock /api/email.
 *   • application-submitted stays public (fixed confirmation to the applicant)
 *   • story-submitted and admin-message may be sent by any signed-in account,
 *     but ONLY to the TTL admin inbox
 *   • every other type is admin-only
 *   • names are HTML-escaped in every template
 * The admin panel sends its emails through adminFetch, the writer dashboard
 * through a new authFetch, and the delete routes pass the admin's login on.
 */

const fs = require('fs');
const path = require('path');

const R  = 'app/api/email/route.ts';
const DB = 'app/dashboard/page.tsx';
const AD = 'app/ttl-admin/page.tsx';
const DM = 'app/api/delete-member/route.ts';
const DW = 'app/api/delete-writer/route.ts';

const FORWARD_FROM = `        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({`;
const FORWARD_TO = `        headers: { 'Content-Type': 'application/json', Authorization: req.headers.get('authorization') ?? '' },
        body: JSON.stringify({`;

const EDITS = [

  // ═══ EMAIL ROUTE ══════════════════════════════════════════════════════
  {
    file: R, kind: 'exact',
    label: 'import the Supabase client',
    from: `import { Resend } from "resend";`,
    to: `import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";`,
  },
  {
    file: R, kind: 'exact',
    label: 'who-is-calling + HTML escape helpers',
    from: `const READING_ROOM_URL = "https://read.the-tiniest-library.com/reading-room";`,
    to: `const READING_ROOM_URL = "https://read.the-tiniest-library.com/reading-room";

// ── Who may send what ─────────────────────────────────────────────
// Public: a fixed confirmation that only goes to the applicant.
const PUBLIC_TYPES = ["application-submitted"];
// Any signed-in account, but only ever to the TTL admin inbox.
const TO_ADMIN_TYPES = ["story-submitted", "admin-message"];
// Everything else: admins only.

async function emailCaller(req: NextRequest): Promise<{ isAdmin: boolean } | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const asCaller = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: \`Bearer \${token}\` } },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
  const { data: { user } } = await asCaller.auth.getUser(token);
  if (!user) return null;
  const { data: isAdmin } = await asCaller.rpc("is_admin");
  return { isAdmin: isAdmin === true };
}

// Names come from forms; never let them carry HTML into an email.
const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");`,
  },
  {
    file: R, kind: 'exact',
    label: 'check the caller before sending anything',
    from: `    const { type, to, name, data } = await req.json();`,
    to: `    const { type, to, name: rawName, data } = await req.json();
    const name = escapeHtml(String(rawName ?? ""));

    if (!PUBLIC_TYPES.includes(type)) {
      const caller = await emailCaller(req);
      if (!caller) {
        return NextResponse.json({ error: "Not signed in." }, { status: 401 });
      }
      const toAdminInbox = TO_ADMIN_TYPES.includes(type) && String(to ?? "").trim().toLowerCase() === ADMIN_EMAIL;
      if (!caller.isAdmin && !toAdminInbox) {
        return NextResponse.json({ error: "Admins only." }, { status: 403 });
      }
    }`,
  },

  // ═══ WRITER DASHBOARD ═════════════════════════════════════════════════
  {
    file: DB, kind: 'exact',
    label: 'authFetch: sends the writer\'s login with the email call',
    from: `function Toast({ msg, type, onClose }`,
    to: `// Calls a signed-in API route (e.g. /api/email) with this writer's login attached.
async function authFetch(url: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set("Authorization", \`Bearer \${session.access_token}\`);
  return fetch(url, { ...init, headers });
}

function Toast({ msg, type, onClose }`,
  },
  {
    file: DB, kind: 'all',
    label: 'dashboard email calls use authFetch',
    pattern: /(?<![\w.])fetch\((['"])\/api\/email\1/g,
    replace: (_m, q) => `authFetch(${q}/api/email${q}`,
    done: `authFetch('/api/email'`,
  },

  // ═══ ADMIN PANEL ══════════════════════════════════════════════════════
  {
    file: AD, kind: 'all',
    label: 'admin panel email calls use adminFetch',
    pattern: /(?<![\w.])fetch\((['"])\/api\/email\1/g,
    replace: (_m, q) => `adminFetch(${q}/api/email${q}`,
    done: `adminFetch("/api/email"`,
  },

  // ═══ DELETE ROUTES ════════════════════════════════════════════════════
  { file: DM, kind: 'exact', label: 'pass the admin login to the email call', from: FORWARD_FROM, to: FORWARD_TO },
  { file: DW, kind: 'exact', label: 'pass the admin login to the email call', from: FORWARD_FROM, to: FORWARD_TO },
];

// ── pre-flight ───────────────────────────────────────────────────────
{
  const ad = fs.readFileSync(path.join(process.cwd(), AD), 'utf8');
  if (!ad.includes('async function adminFetch(')) {
    console.log('  ✗ adminFetch is missing from the admin panel — run the admin-route lock first.');
    process.exit(1);
  }
}

// ── engine ───────────────────────────────────────────────────────────
const apply = process.argv.includes('--apply');
const cache = new Map();
function load(rel) {
  if (cache.has(rel)) return cache.get(rel);
  const full = path.join(process.cwd(), rel);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, 'utf8');
  const crlf = raw.includes('\r\n');
  const entry = { full, text: crlf ? raw.replace(/\r\n/g, '\n') : raw, crlf, dirty: false };
  cache.set(rel, entry);
  return entry;
}
const count = (hay, needle) => hay.split(needle).length - 1;
let ok = 0, already = 0, missing = 0, ambiguous = 0;
const report = (sym, msg, e) => console.log(`  ${sym} ${msg.padEnd(15)} ${e.file.split('/').slice(-2).join('/').padEnd(26)} ${e.label}`);

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }

  if (e.kind === 'all') {
    const n = (f.text.match(e.pattern) || []).length;
    if (n === 0) {
      if (f.text.includes(e.done)) { already++; report('·', 'already done', e); }
      else { missing++; report('✗', 'NOT FOUND', e); }
      continue;
    }
    f.text = f.text.replace(e.pattern, e.replace);
    f.dirty = true; ok++; report('✓', `will change ${n}×`, e);
    continue;
  }

  const hits = count(f.text, e.from);
  const toHoldsFrom = e.to.includes(e.from);
  if (hits === 0) {
    if (f.text.includes(e.to)) { already++; report('·', 'already done', e); }
    else { missing++; report('✗', 'NOT FOUND', e); }
  } else if (hits === 1) {
    if (toHoldsFrom && f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true; ok++; report('✓', 'will change', e);
  } else {
    ambiguous++; report('✗', `AMBIGUOUS ${hits}×`, e);
  }
}

console.log('');
console.log(`${ok} to change · ${already} already applied · ${missing} not found · ${ambiguous} ambiguous`);
if (missing || ambiguous) { console.log('\nNothing written. Send me the output.'); process.exit(1); }
if (!apply) { console.log('Dry run. Add --apply to write.'); process.exit(0); }
for (const [rel, f] of cache) {
  if (!f.dirty) continue;
  fs.writeFileSync(f.full, f.crlf ? f.text.replace(/\n/g, '\r\n') : f.text, 'utf8');
  console.log(`  wrote  ${rel}`);
}
console.log('\nWritten. Check Problems, then push.');