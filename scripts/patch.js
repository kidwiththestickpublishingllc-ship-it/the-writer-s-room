/* scripts/patch.js — exact, verified multi-line edits.
 *
 *   node scripts/patch.js           → dry run, reports what would change
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *
 * Safety:
 *   - Matches against LF internally, writes back in the file's own line ending,
 *     so Windows CRLF files are handled without corruption.
 *   - If an edit's FROM text is missing, it checks whether the TO text is
 *     already there and says "already applied" instead of failing blind.
 *   - If anything is genuinely MISSING, NOTHING is written. All or nothing.
 *   - Refuses to run if a FROM string appears more than once in its file.
 *
 * Batch: Apply page — step bar follows the choice, purple boxes, orphan hint.
 */

const fs = require('fs');
const path = require('path');

const F = 'app/apply/page.tsx';

const EDITS = [

  // ── 1. Step bar knows who is applying ──────────────────────────────
  {
    file: F,
    label: 'StepIndicator takes the applicant type',
    from: `function StepIndicator({ current, done }: { current: Step; done: boolean }) {`,
    to: `function StepIndicator({ current, done, kind = "writer" }: { current: Step; done: boolean; kind?: "writer" | "artist" | "both" }) {`,
  },
  {
    file: F,
    label: 'step bar labels for writers, artists and both',
    from: `    { n: 2, label: "Your Writing" },
    { n: 3, label: "Your Work" },`,
    to: `    { n: 2, label: kind === "artist" ? "Your Art" : kind === "both" ? "Your Work" : "Your Writing" },
    { n: 3, label: kind === "artist" ? "Portfolio" : kind === "both" ? "Samples" : "Your Work" },`,
  },
  {
    file: F,
    label: 'pass the applicant type to the step bar',
    from: `<StepIndicator current={step} done={submitted} />`,
    to: `<StepIndicator current={step} done={submitted} kind={form.applicant_type} />`,
  },

  // ── 2. Orphan hint from the removed password field ─────────────────
  {
    file: F,
    label: 'remove the orphan login hint under Email',
    from: `<p className="ap-field-hint">You'll use this to log into your Creator Dashboard once approved.</p>`,
    to: ``,
  },

  // ── 3. Purple boxes in the Galleria skin ───────────────────────────
  {
    file: F,
    label: 'Galleria skin tints inputs, review boxes and sidebar cards',
    from: `    --text-faint: rgba(242,236,255,0.58);`,
    to: `    --text-faint: rgba(242,236,255,0.58);
    --ink-surface: rgba(30,12,70,0.55);
    --ink-border: rgba(180,122,255,0.24);`,
  },
  {
    file: F,
    label: 'Galleria skin overrides for boxes with fixed colours, and hide empty fields',
    from: `  .ap-root.artist .ap-check input { accent-color: #FF1493; }`,
    to: `  .ap-root.artist .ap-check input { accent-color: #FF1493; }
  .ap-root.artist .ap-input,
  .ap-root.artist .ap-textarea,
  .ap-root.artist .ap-sample-textarea,
  .ap-root.artist .ap-sidebar-card {
    background: rgba(30,12,70,0.55) !important;
    border-color: rgba(180,122,255,0.24) !important;
  }
  .ap-root.artist .ap-input:focus,
  .ap-root.artist .ap-textarea:focus,
  .ap-root.artist .ap-sample-textarea:focus { border-color: #14F1D9 !important; }
  .ap-root.artist .ap-review-value.sample { color: var(--text-dim); }
  .ap-field:empty { display: none; }`,
  },

];

// ── engine ───────────────────────────────────────────────────────────
const apply = process.argv.includes('--apply');

const cache = new Map();   // file → { text, crlf, dirty }

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

let ok = 0, already = 0, missing = 0, ambiguous = 0;

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) {
    console.log(`  ✗ MISSING FILE   ${e.file}`);
    missing++;
    continue;
  }

  const hits = f.text.split(e.from).length - 1;

  if (hits === 1) {
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true;
    ok++;
    console.log(`  ✓ will change    ${e.label}`);
  } else if (hits > 1) {
    ambiguous++;
    console.log(`  ✗ AMBIGUOUS (${hits}×)  ${e.label}`);
    console.log(`      the FROM text appears ${hits} times in ${e.file} — needs more context`);
  } else if (e.to && f.text.includes(e.to)) {
    already++;
    console.log(`  · already done   ${e.label}`);
  } else {
    missing++;
    console.log(`  ✗ NOT FOUND      ${e.label}`);
    console.log(`      in ${e.file} — the file has drifted from what this patch expects`);
  }
}

console.log('');
console.log(`${ok} to change · ${already} already applied · ${missing} not found · ${ambiguous} ambiguous`);

if (missing || ambiguous) {
  console.log('');
  console.log('Nothing written. Fix the mismatches above first — send me the failing');
  console.log('labels and I will re-cut those edits against the real text.');
  process.exit(1);
}

if (!apply) {
  console.log('Dry run. Add --apply to write.');
  process.exit(0);
}

let written = 0;
for (const [rel, f] of cache) {
  if (!f.dirty) continue;
  fs.writeFileSync(f.full, f.crlf ? f.text.replace(/\n/g, '\r\n') : f.text, 'utf8');
  written++;
  console.log(`  wrote  ${rel}`);
}

console.log('');
console.log(written ? 'Written. Check Problems, then push.' : 'Nothing to write.');