/* scripts/rename.js — The Writer's Room becomes The Creators Room.
 *
 *   node scripts/rename.js           → dry run, shows every line
 *   node scripts/rename.js --apply   → writes
 *
 * Run from the repo root. Preserves CRLF.
 * Display copy only. Identifiers like WritersRoomAdPanel and
 * TTL_WRITERS_ROOM are untouched — none of these patterns match a
 * string without a space or apostrophe in it.
 */

const fs = require('fs');
const path = require('path');

const RULES = [
  // the room — plural forms first so singular doesn't eat them
  [/Writer['’]s Room/g, 'Creators Room'],
  [/Writers Room/g,     'Creators Room'],
  [/WRITER['’]S ROOM/g, 'CREATORS ROOM'],
  [/WRITERS ROOM/g,     'CREATORS ROOM'],

  // the person and their things
  [/Writer Agreements/g,   'Creator Agreements'],
  [/Writer Agreement/g,    'Creator Agreement'],
  [/Writer Application/g,  'Creator Application'],
  [/Writer Verification/g, 'Creator Verification'],
  [/Writer Onboarding/g,   'Creator Onboarding'],
  [/Writer Submission/g,   'Creator Submission'],
  [/Writer Community/g,    'Creator Community'],
  [/Writer Dashboard/g,    'Creator Dashboard'],
  [/Writer Payouts/g,      'Creator Payouts'],
  [/Writer Program/g,      'Creator Program'],
  [/Writer Access/g,       'Creator Access'],
  [/Writers Awaiting/g,    'Creators Awaiting'],
  [/Writers Only/g,        'Creators Only'],

  // Writer's Guide deliberately left alone - decide separately
];

const PROSE = [
  // specific phrases first, so the general rules below can't fire twice
  [/First-time writers and published authors/g, 'First-time writers, artists and published authors'],
  [/independent writers and want them/g,        'independent writers and artists, and want them'],
  [/platform free for writers and readers/g,    'platform free for writers, artists and readers'],
  [/Ink works for writers/g,                    'Ink works for writers and artists'],
  [/A home for writers/g,                       'A home for writers and artists'],
  [/writers own what they write/g,              'creators own what they make'],

  // who the room is for — name both
  [/independent writers(?! and artists)/g,  'independent writers and artists'],
  [/emerging writers/g,     'emerging writers and artists'],
  [/First-time writers(?!,| and artists)/g,   'First-time writers and artists'],
  [/first-time writers/g,   'first-time writers and artists'],
  [/all writers/g,          'all writers and artists'],
  [/helping writers/g,      'helping writers and artists'],
  [/writers publish/g,      'writers and artists publish'],
  [/writers succeed/g,      'writers and artists succeed'],
  [/writers ask us/g,       'writers and artists ask us'],

  // structural — one of each, so the umbrella word
  [/Founding Writer status/g, 'Founding Creator status'],
  [/Founding writer status/g, 'Founding creator status'],
  [/founding writer status/g, 'founding creator status'],
  [/founding writer spots/g,  'founding creator spots'],
  [/Founding writers/g,       'Founding creators'],
  [/founding writers/g,       'founding creators'],
  [/Approved writers/g,       'Approved creators'],
  [/Writer HQ/g,              'Creator HQ'],
  [/Writers sign a/g,         'Creators sign a'],
  [/your writer dashboard/g,  'your creator dashboard'],
  [/your writer account/g,    'your creator account'],
  [/writer dashboard/g,       'creator dashboard'],
  [/writer agreements/g,      'creator agreements'],
  [/writer agreement/g,       'creator agreement'],
  [/Not a writer yet/g,       'Not a creator yet'],
  [/a TTL writer/g,           'a TTL creator'],
  [/100 writers/g,            '100 creators'],

  // reader-facing — readers don't care which kind
  [/the writers you love/g, 'the creators you love'],
  [/writers they love/g,    'creators they love'],
  [/tip writers/g,          'tip creators'],
  [/Payments to writers/g,  'Payments to creators'],

  // admin and legal — the person, whoever they are
  [/Lifetime writer earnings/g,        'Lifetime creator earnings'],
  [/a writer at The Tiniest Library/g, 'a creator at The Tiniest Library'],
  [/writers need a W-9/g, 'creators need a W-9'],
  [/The human writer/g,   'The human creator'],
  [/Every TTL writer/g,   'Every TTL creator'],
  [/every TTL writer/g,   'every TTL creator'],
  [/another writer/g,     'another creator'],
  [/any writer found/g,   'any creator found'],
  [/No writers yet/g,     'No creators yet'],
  [/Hello, writer/g,      'Hello, creator'],
  [/as a writer/g,        'as a creator'],
  [/shown to writer/g,    'shown to creator'],
  [/sent to writer/g,     'sent to creator'],
  [/note to writer/g,     'note to creator'],
];

const PROSE_SKIP = /supabase|\.from\(|\.eq\(|\.select\(|\.insert\(|\.update\(|_id\b|^import |require\(/;
const EXTS = ['.tsx', '.ts'];
const SKIP = ['node_modules', '.next', '.git'];

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.includes(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (EXTS.includes(path.extname(name))) out.push(full);
  }
  return out;
}

const apply = process.argv.includes('--apply');
const roots = ['app', 'lib'].filter(d => fs.existsSync(d));
const files = roots.flatMap(d => walk(d));

let total = 0;
let touched = 0;

for (const full of files) {
  const raw = fs.readFileSync(full, 'utf8');
  const crlf = raw.includes('\r\n');
  const lines = (crlf ? raw.replace(/\r\n/g, '\n') : raw).split('\n');

  let count = 0;
  const rel = path.relative(process.cwd(), full);

  for (let i = 0; i < lines.length; i++) {
    const before = lines[i];
    let after = before;
    for (const [re, to] of RULES) after = after.replace(re, to);
        if (!PROSE_SKIP.test(after)) {
      for (const [re, to] of PROSE) after = after.replace(re, to);
    }
    if (after !== before) {
      if (count === 0) { console.log(''); console.log(rel); }
      count++;
      const clip = s => s.trim().length > 104 ? s.trim().slice(0, 101) + '...' : s.trim();
      console.log(`  ${String(i + 1).padStart(4)}  - ${clip(before)}`);
      console.log(`        + ${clip(after)}`);
      lines[i] = after;
    }
  }

  if (count) {
    total += count;
    touched++;
    if (apply) {
      const out = lines.join('\n');
      fs.writeFileSync(full, crlf ? out.replace(/\n/g, '\r\n') : out, 'utf8');
    }
  }
}

console.log('');
console.log(`${total} lines across ${touched} files.`);
console.log(apply ? 'Written. Check Problems, then push.' : 'Dry run. Add --apply to write.');