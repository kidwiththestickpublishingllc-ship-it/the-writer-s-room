/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run, reports what would change
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *   exact — FROM must appear exactly once, replaced with TO
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 *
 * Batch: lock the admin API routes. invite-writer, delete-writer and
 * delete-member now require a signed-in admin (lib/admin-auth.ts), and
 * the admin panel sends the admin's login with each of those calls.
 * delete-member also refuses to delete your own account or another admin.
 */

const fs = require('fs');
const path = require('path');

const P = 'app/ttl-admin/page.tsx';
const IW = 'app/api/invite-writer/route.ts';
const DW = 'app/api/delete-writer/route.ts';
const DM = 'app/api/delete-member/route.ts';

// ── pre-flight checks ────────────────────────────────────────────────
const need = (rel, why) => {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    console.log(`  ✗ ${rel} is missing — ${why}`);
    process.exit(1);
  }
};
need('lib/admin-auth.ts', 'create it first (paste it from my message), then run this again.');
{
  const page = fs.readFileSync(path.join(process.cwd(), P), 'utf8');
  if (!/^(?:import[^;\n]*\bsupabase\b[^;\n]*from|(?:export\s+)?const\s+supabase\s*=)/m.test(page)) {
    console.log(`  ✗ ${P} has no top-level "supabase" client — send me:  grep -n "supabase" ${P} | head -5`);
    process.exit(1);
  }
}

const GATE = `
    // Admins only — checked before the service-role key is used.
    const gate = await requireAdmin(req)
    if (gate instanceof NextResponse) return gate
`;

const routeEdits = (file) => [
  {
    file, kind: 'exact',
    label: 'import the admin gate',
    from: `import { NextResponse } from 'next/server'`,
    to: `import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../lib/admin-auth'`,
  },
  {
    file, kind: 'exact',
    label: 'turn away anyone who is not an admin',
    from: `export async function POST(req: Request) {
  try {`,
    to: `export async function POST(req: Request) {
  try {${GATE}`,
  },
];

const EDITS = [

  // ═══ API ROUTES ═══════════════════════════════════════════════════════
  ...routeEdits(IW),
  ...routeEdits(DW),
  ...routeEdits(DM),
  {
    file: DM, kind: 'exact',
    label: 'never delete yourself or another admin',
    from: `    if (!id) {
      return NextResponse.json({ error: 'Missing member id' }, { status: 400 })
    }`,
    to: `    if (!id) {
      return NextResponse.json({ error: 'Missing member id' }, { status: 400 })
    }

    if (id === gate.userId) {
      return NextResponse.json({ error: "You can't delete your own account from the panel." }, { status: 400 })
    }
    const { data: target } = await admin.from('profiles').select('role').eq('id', id).maybeSingle()
    if (target?.role === 'admin') {
      return NextResponse.json({ error: 'Admin accounts cannot be deleted from the panel.' }, { status: 403 })
    }`,
  },

  // ═══ ADMIN PANEL ══════════════════════════════════════════════════════
  {
    file: P, kind: 'exact',
    label: 'adminFetch: sends your login with admin calls',
    from: `type Tab = "applications" | "stories" | "writers" | "agreements" | "ink" | "media" | "payouts" | "members" | "world" | "comics";`,
    to: `type Tab = "applications" | "stories" | "writers" | "agreements" | "ink" | "media" | "payouts" | "members" | "world" | "comics";

// Calls an admin-only API route with the signed-in admin's login attached.
// The route checks it (lib/admin-auth.ts) before doing anything.
async function adminFetch(url: string, init: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);
  if (session?.access_token) headers.set("Authorization", \`Bearer \${session.access_token}\`);
  return fetch(url, { ...init, headers });
}`,
  },
  {
    file: P, kind: 'exact',
    label: 'invite-writer call uses adminFetch',
    from: `fetch("/api/invite-writer", {`,
    to: `adminFetch("/api/invite-writer", {`,
  },
  {
    file: P, kind: 'exact',
    label: 'delete-writer call uses adminFetch',
    from: `fetch("/api/delete-writer", {`,
    to: `adminFetch("/api/delete-writer", {`,
  },
  {
    file: P, kind: 'exact',
    label: 'delete-member call uses adminFetch',
    from: `fetch("/api/delete-member", {`,
    to: `adminFetch("/api/delete-member", {`,
  },
];

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