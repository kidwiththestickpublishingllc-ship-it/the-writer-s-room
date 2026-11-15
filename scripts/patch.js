/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run, reports what would change
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *
 * Four kinds of edit:
 *   exact  — FROM text must appear exactly once, replaced with TO
 *   block  — everything from START up to (not including) END is replaced
 *   append — TO is added to the end of the file unless MARKER is already there
 *   regex  — PATTERN must match exactly once; GONE is text that proves the
 *            edit is done when the pattern no longer matches
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 *
 * Batch: Creators Room — Red Room scrub. Removes the leftover Red Room genre
 * lists and their dropdowns (Submit tab + dashboard), the adult sub-genres,
 * and "Adult 18+" from the Quill chat and the tour. "All 24 genres" becomes
 * "every genre" so the count never goes stale.
 */

const fs = require('fs');
const path = require('path');

const D = 'app/dashboard/page.tsx';
const S = 'app/components/SubmitTab.tsx';
const H = 'app/page.tsx';
const Q = 'app/components/QuillChatWidget.tsx';
const T = 'app/components/WritersTour.tsx';

// Matches  {storyRoom === 'reading-room' ? ( <the normal pickers> ) : ( <Red Room select> )}
// and keeps only the normal pickers.
const ROOM_SWITCH = /\{storyRoom === 'reading-room' \? \(\s*([\s\S]*?)\s*\) : \(\s*<select[\s\S]*?RED_ROOM_GENRES\.map[\s\S]*?<\/select>\s*\)\}/;
// Matches the whole  const RED_ROOM_GENRES = [ ... ];  line block.
const RR_LIST = /^[ \t]*const RED_ROOM_GENRES = \[[\s\S]*?\];[ \t]*\r?\n/m;

const EDITS = [

  // ═══ SUBMIT TAB ══════════════════════════════════════════════════════
  {
    file: S, kind: 'regex',
    label: 'genre picker: drop the Red Room dropdown',
    pattern: ROOM_SWITCH, replace: (_m, keep) => keep,
    gone: 'RED_ROOM_GENRES.map',
  },
  {
    file: S, kind: 'regex',
    label: 'delete the Red Room genre list',
    pattern: RR_LIST, replace: () => '',
    gone: 'RED_ROOM_GENRES = [',
  },

  // ═══ DASHBOARD ═══════════════════════════════════════════════════════
  {
    file: D, kind: 'regex',
    label: 'genre picker: drop the Red Room dropdown',
    pattern: ROOM_SWITCH, replace: (_m, keep) => keep,
    gone: 'RED_ROOM_GENRES.map',
  },
  {
    file: D, kind: 'regex',
    label: 'delete the Red Room genre list',
    pattern: RR_LIST, replace: () => '',
    gone: 'RED_ROOM_GENRES = [',
  },
  {
    file: D, kind: 'exact',
    label: 'sub-genres: remove Adult Literature, Smut, Sexy Classy, Mature Romance',
    from: `subgenres: ['Cooking', 'Cooking Romance', 'Adult Literature', 'Smut', 'Sexy Classy', 'Mature Romance']`,
    to: `subgenres: ['Cooking', 'Cooking Romance']`,
  },
  {
    file: D, kind: 'exact',
    label: 'audience / tone: all-ages choices',
    from: `subgenres: ['PG', 'Tasteful', 'Mature', 'Adult', 'Sexy', 'Classy']`,
    to: `subgenres: ['All Ages', 'Teen', 'PG', 'Tasteful', 'Classy']`,
  },

  // ═══ HOME PAGE ═══════════════════════════════════════════════════════
  {
    file: H, kind: 'exact',
    label: 'home: "all 24 TTL genres" → "every TTL genre" (card)',
    from: `We publish across all 24 TTL genres — from`,
    to: `We publish across every TTL genre — from`,
  },
  {
    file: H, kind: 'exact',
    label: 'home: "all 24 TTL genres" → "every TTL genre" (FAQ)',
    from: `We publish across all 24 TTL genres including`,
    to: `We publish across every TTL genre, including`,
  },
  {
    file: H, kind: 'exact',
    label: 'home: "All 24 TTL genres" → "Every TTL genre" (list)',
    from: `<strong>All 24 TTL genres</strong>`,
    to: `<strong>Every TTL genre</strong>`,
  },

  // ═══ QUILL CHAT ══════════════════════════════════════════════════════
  {
    file: Q, kind: 'exact',
    label: 'Quill: genre answer without Adult 18+',
    from: `TTL accepts all 24 genres:`,
    to: `TTL accepts every genre:`,
  },
  {
    file: Q, kind: 'exact',
    label: 'Quill: drop "and Adult 18+"',
    from: `Indigenous Stories, LGBTQ+ Fiction, and Adult 18+.`,
    to: `Indigenous Stories, and LGBTQ+ Fiction.`,
  },

  // ═══ TOUR ════════════════════════════════════════════════════════════
  {
    file: T, kind: 'exact',
    label: 'tour: genres step without Adult 18+',
    from: `TTL publishes across all 24 genres — from Fantasy and Horror to Dark Academia, LGBTQ+ Fiction, Black Stories, Latin Voices, Fan Fiction, Cozy, and Adult 18+.`,
    to: `TTL publishes across every genre — from Fantasy and Horror to Dark Academia, LGBTQ+ Fiction, Black Stories, Latin Voices, Fan Fiction, and Cozy.`,
  },
  {
    file: T, kind: 'exact',
    label: 'tour: formats step',
    from: `early access chapters, and all 24 genres.`,
    to: `early access chapters, and every genre.`,
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
const report = (sym, msg, e) => console.log(`  ${sym} ${msg.padEnd(15)} ${e.file.split('/').pop().padEnd(22)} ${e.label}`);

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }

  if (e.kind === 'regex') {
    const all = new RegExp(e.pattern.source, e.pattern.flags.replace('g', '') + 'g');
    const n = (f.text.match(all) || []).length;
    if (n === 0) {
      if (f.text.includes(e.gone)) { missing++; report('✗', 'NOT FOUND', e); }
      else { already++; report('·', 'already done', e); }
      continue;
    }
    if (n > 1) { ambiguous++; report('✗', `AMBIGUOUS ${n}×`, e); continue; }
    f.text = f.text.replace(e.pattern, e.replace);
    f.dirty = true; ok++; report('✓', 'will change', e);
    continue;
  }

  if (e.kind === 'append') {
    if (f.text.includes(e.marker)) { already++; report('·', 'already done', e); continue; }
    f.text = f.text.replace(/\s*$/, '\n') + e.to;
    f.dirty = true; ok++; report('✓', 'will add', e);
    continue;
  }

  if (e.kind === 'block') {
    if (f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
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

  const hits = count(f.text, e.from);
  const toHoldsFrom = e.to.includes(e.from);
  if (hits === 0) {
    if (e.to && f.text.includes(e.to)) { already++; report('·', 'already done', e); }
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

if (missing || ambiguous) { console.log('\nNothing written. Send me the failing labels.'); process.exit(1); }
if (!apply) { console.log('Dry run. Add --apply to write.'); process.exit(0); }

for (const [rel, f] of cache) {
  if (!f.dirty) continue;
  fs.writeFileSync(f.full, f.crlf ? f.text.replace(/\n/g, '\r\n') : f.text, 'utf8');
  console.log(`  wrote  ${rel}`);
}
console.log('\nWritten. Check Problems, then push.');