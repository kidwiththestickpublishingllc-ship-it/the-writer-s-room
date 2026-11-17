/* scripts/patch.js — exact, verified edits.
 *
 *   node scripts/patch.js           → dry run
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 * If anything is missing or ambiguous, NOTHING is written. CRLF safe.
 *
 * Batch: stage 2b — the writer dashboard loads chapter text through
 * get_chapter_body (writers can always read their own chapters), and a new
 * chapter is returned without reading its text back. Nothing changes for
 * the writer; this just stops the dashboard relying on direct text reads.
 */

const fs = require('fs');
const path = require('path');

const DB = 'app/dashboard/page.tsx';
const META = 'id, story_id, chapter_number, title, is_free, ink_cost, created_at, media_type, publish_at, split_id';

const EDITS = [
  {
    file: DB, label: 'helper: chapter list + text through get_chapter_body',
    from: `function Toast({ msg, type, onClose }`,
    to: `// Chapter text and media come through get_chapter_body, which always
// answers for a writer's own chapters.
async function withBodies(list: any[] | null): Promise<any[] | null> {
  if (!list) return list;
  return Promise.all(list.map(async (ch) => {
    const { data: body } = await supabase.rpc('get_chapter_body', { p_chapter_id: ch.id });
    return { ...ch, ...(body ?? {}) };
  }));
}

function Toast({ msg, type, onClose }`,
  },
  {
    file: DB, label: 'first load: chapters via withBodies',
    from: `          const { data: chaptersData } = await supabase
            .from('chapters')
            .select('*')
            .eq('story_id', storiesData[0].id)
            .order('chapter_number');`,
    to: `          const { data: chaptersRaw } = await supabase
            .from('chapters')
            .select('${META}')
            .eq('story_id', storiesData[0].id)
            .order('chapter_number');
          const chaptersData = await withBodies(chaptersRaw);`,
  },
  {
    file: DB, label: 'story switch: chapters via withBodies',
    from: `    supabase.from('chapters').select('*').eq('story_id', currentStoryId).order('chapter_number')
      .then(({ data }) => {`,
    to: `    supabase.from('chapters').select('${META}').eq('story_id', currentStoryId).order('chapter_number')
      .then(async ({ data: raw }) => {
        const data = await withBodies(raw);`,
  },
  {
    file: DB, label: 'new chapter: returned without reading text back',
    from: `          ink_cost: nextNum === 1 ? 0 : 25,
        })
        .select()
        .single();`,
    to: `          ink_cost: nextNum === 1 ? 0 : 25,
        })
        .select('${META}')
        .single()
        .then(r => ({ ...r, data: r.data ? { ...r.data, content: '' } : r.data }));`,
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
const report = (sym, msg, e) => console.log(`  ${sym} ${msg.padEnd(15)} ${e.label}`);

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }
  const hits = count(f.text, e.from);
  if (hits === 1) {
    if (e.to.includes(e.from) && f.text.includes(e.to)) { already++; report('·', 'already done', e); continue; }
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true; ok++; report('✓', 'will change', e);
  } else if (hits === 0) {
    if (f.text.includes(e.to)) { already++; report('·', 'already done', e); }
    else { missing++; report('✗', 'NOT FOUND', e); }
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