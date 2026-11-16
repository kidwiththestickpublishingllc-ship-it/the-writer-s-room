/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 *
 * Batch: lock the payout routes (Wise, PayPal, Stripe) to admins only.
 * Only accounts in the admins table (checked by is_admin()) can trigger
 * a payout. Any other signed-in account is turned away.
 */

const fs = require('fs');
const path = require('path');

const ADMIN_LINE = `    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });`;

const GATE = `${ADMIN_LINE}

    // Payouts are admin-only: the caller must be in the admins table.
    const asCaller = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: \`Bearer \${access_token}\` } },
      auth: { persistSession: false },
    });
    const { data: isAdmin } = await asCaller.rpc("is_admin");
    if (isAdmin !== true) {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }`;

const EDITS = ['app/api/wise/payout/route.ts', 'app/api/paypal/payout/route.ts', 'app/api/stripe/payout/route.ts']
  .map(file => ({ file, label: 'admins only', from: ADMIN_LINE, to: GATE }));

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
const report = (sym, msg, e) => console.log(`  ${sym} ${msg.padEnd(15)} ${e.file.padEnd(34)} ${e.label}`);

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }
  if (f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
  const hits = count(f.text, e.from);
  if (hits === 1) { f.text = f.text.replace(e.from, () => e.to); f.dirty = true; ok++; report('✓', 'will change', e); }
  else if (hits === 0) { missing++; report('✗', 'NOT FOUND', e); }
  else { ambiguous++; report('✗', `AMBIGUOUS ${hits}×`, e); }
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