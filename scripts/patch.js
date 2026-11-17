/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *   exact — FROM must appear exactly once, replaced with TO
 *   block — everything from START up to (not including) END is replaced
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 * At the end it checks no ExoClick code is left in the edited files.
 *
 * Batch: Creators Room — ExoClick out of the rotating ad panel.
 * The panel keeps rotating through its house ads.
 */

const fs = require('fs');
const path = require('path');

const AP = 'app/components/WritersRoomAdPanel.tsx';

const EDITS = [
  {
    file: AP, kind: 'exact', label: 'drop the ExoClick type',
    from: `declare global {
  interface Window { AdProvider?: any[] }
}

`,
    to: ``, done: `// Each ad in the rotation (TTL house ads and sponsors).`,
  },
  {
    file: AP, kind: 'exact', label: 'drop the ExoClick zone id',
    from: `const EXO_ZONE_ID = '5938672'\n`,
    to: ``, done: `// Each ad in the rotation (TTL house ads and sponsors).`,
  },
  {
    file: AP, kind: 'exact', label: 'rotation comment',
    from: `// Each ad in the rotation. The ExoClick slide is marked with \`exo: true\`
// so it renders the live ad slot instead of a house-ad layout.`,
    to: `// Each ad in the rotation (TTL house ads and sponsors).`,
  },
  {
    file: AP, kind: 'exact', label: 'remove the ExoClick slide from the rotation',
    from: `  // ── ExoClick rotating slide ──
  {
    exo: true,
    accent: '#A78BFA',
  },
`,
    to: ``, done: `// Each ad in the rotation (TTL house ads and sponsors).`,
  },
  {
    file: AP, kind: 'exact', label: 'stop loading ExoClick',
    from: `    // Load ExoClick provider once and serve.
    if (!initialized.current) {
      initialized.current = true
      if (!document.querySelector('script[src="https://a.magsrv.com/ad-provider.js"]')) {
        const script = document.createElement('script')
        script.src = 'https://a.magsrv.com/ad-provider.js'
        script.async = true
        script.type = 'application/javascript'
        document.body.appendChild(script)
      }
      window.AdProvider = window.AdProvider || []
      window.AdProvider.push({ serve: {} })
    }
`,
    to: ``, done: `// Each ad in the rotation (TTL house ads and sponsors).`,
  },
  {
    file: AP, kind: 'block', label: 'remove the ExoClick slot',
    start: `      {/* ── ExoClick slot: always mounted, only visible on its slide ── */}`,
    end: `      {/* ── House-ad slide content (hidden on the ExoClick slide) ── */}`,
    to: ``, done: `      {/* ── House-ad slide content ── */}`,
  },
  {
    file: AP, kind: 'exact', label: 'house-ad condition no longer checks exo',
    from: `      {/* ── House-ad slide content (hidden on the ExoClick slide) ── */}
      {!ad.exo && !ad.cover && !ad.storyCard && (`,
    to: `      {/* ── House-ad slide content ── */}
      {!ad.cover && !ad.storyCard && (`,
  },
];

// Every reference to the old ExoClick slide must be gone, or TypeScript fails.
const leftoverCheck = () => {
  const f = cache.get(AP);
  if (f && /\bad\.exo\b|\.exo\b/.test(f.text)) {
    console.log(`  ! "ad.exo" is still used somewhere in ${AP} — send me: grep -n "exo" ${AP}`);
    return true;
  }
  return false;
};

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
const report = (sym, msg, e) => console.log(`  ${sym} ${msg.padEnd(15)} ${e.file.split('/').slice(-2).join('/').padEnd(34)} ${e.label}`);

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }

  if (e.kind === 'block') {
    if (e.done && !f.text.includes(e.start) && f.text.includes(e.done)) { already++; report('·', 'already done', e); continue; }
    const s = count(f.text, e.start), n = count(f.text, e.end);
    if (s !== 1 || n !== 1) {
      if (s > 1 || n > 1) { ambiguous++; report('✗', 'AMBIGUOUS', e); }
      else { missing++; report('✗', 'NOT FOUND', e); }
      continue;
    }
    const a = f.text.indexOf(e.start), b = f.text.indexOf(e.end);
    if (b < a) { missing++; report('✗', 'OUT OF ORDER', e); continue; }
    f.text = f.text.slice(0, a) + e.to + f.text.slice(b);
    f.dirty = true; ok++; report('✓', 'will replace', e);
    continue;
  }

  // exact
  const hits = count(f.text, e.from);
  if (hits === 1) {
    if (e.to.includes(e.from) && f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true; ok++; report('✓', 'will change', e);
  } else if (hits === 0) {
    if (e.done ? f.text.includes(e.done) : (e.to && f.text.includes(e.to))) { already++; report('·', 'already done', e); }
    else { missing++; report('✗', 'NOT FOUND', e); }
  } else {
    ambiguous++; report('✗', `AMBIGUOUS ${hits}×`, e);
  }
}

// After every edit, no ExoClick may be left in the edited files.
for (const [rel, f] of cache) {
  if (/magsrv|AdProvider|eas6a97888e|exoclick/i.test(f.text)) {
    console.log(`  ! ExoClick still referenced in ${rel} — send me: grep -niE "magsrv|AdProvider|eas6a97888e|exoclick" ${rel}`);
    if (!missing && !ambiguous) missing++;
  }
}
if (leftoverCheck() && !missing && !ambiguous) missing++;

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