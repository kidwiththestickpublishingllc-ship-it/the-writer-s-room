/* scripts/patch.js — exact, verified multi-line edits.
 *
 *   node scripts/patch.js           → dry run, reports what would change
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *
 * Batch: Submit tab — Story / Comic fork.
 */

const fs = require('fs');
const path = require('path');

const F = 'app/components/SubmitTab.tsx';

const EDITS = [

  {
    file: F,
    label: 'STYLES for the Story / Comic cards',
    from: `interface SubmitTabProps {`,
    to: `const STYLES = \`
  .sub-fork { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 24px; }
  .sub-fork-card { display: block; padding: 20px 22px; border-radius: 12px; text-decoration: none; color: inherit; transition: transform 0.15s, box-shadow 0.15s; }
  .sub-fork-card.story { border: 1px solid rgba(201,168,76,0.45); background: rgba(201,168,76,0.06); }
  .sub-fork-card.comic {
    border: 1px solid rgba(20,241,217,0.45);
    background: linear-gradient(135deg, #0a0420, #1a0b3a);
    color: #F2ECFF;
    box-shadow: inset 0 0 0 1px rgba(255,20,147,0.15);
  }
  .sub-fork-card.comic:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(180,122,255,0.25); }
  .sub-fork-kicker { font-size: 10px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px; }
  .sub-fork-card.story .sub-fork-kicker { color: var(--gold, #C9A84C); }
  .sub-fork-card.comic .sub-fork-kicker { color: #14F1D9; }
  .sub-fork-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; margin-bottom: 6px; }
  .sub-fork-text { font-size: 13px; line-height: 1.55; opacity: 0.85; margin: 0; }
  .sub-fork-go { display: inline-block; margin-top: 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #FF69B4; }
  @media (max-width: 720px) { .sub-fork { grid-template-columns: 1fr; } }
\`;

interface SubmitTabProps {`,
  },
  {
    file: F,
    label: 'page title covers stories and comics',
    from: `<h1 className="hq-page-title">Submit Your Story</h1>`,
    to: `<h1 className="hq-page-title">Submit Your Work</h1>`,
  },
  {
    file: F,
    label: 'Story / Comic cards above the story form button',
    from: `      <button className="btn-primary" onClick={() => { onSetShowSubmitModal(true);`,
    to: `      <style>{STYLES}</style>
      <div className="sub-fork">
        <div className="sub-fork-card story">
          <div className="sub-fork-kicker">The Reading Room</div>
          <div className="sub-fork-title">📖 A Story</div>
          <p className="sub-fork-text">Novels, serials and short stories. Open the form below to set up your story, then add chapters in My Chapters.</p>
        </div>
        <a className="sub-fork-card comic" href="https://artists.the-tiniest-library.com/galleria/studio" target="_blank" rel="noopener noreferrer">
          <div className="sub-fork-kicker">The Galleria</div>
          <div className="sub-fork-title">🎨 A Comic</div>
          <p className="sub-fork-text">Comics, manga and webtoons. Create your series, upload your pages and submit for review in The Galleria Studio.</p>
          <span className="sub-fork-go">Open the Studio →</span>
        </a>
      </div>
      <button className="btn-primary" onClick={() => { onSetShowSubmitModal(true);`,
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

let ok = 0, already = 0, missing = 0, ambiguous = 0;

for (const e of EDITS) {
  const f = load(e.file);
  if (!f) { console.log(`  ✗ MISSING FILE   ${e.file}`); missing++; continue; }
  const hits = f.text.split(e.from).length - 1;
  if (hits === 1) {
    f.text = f.text.replace(e.from, () => e.to);
    f.dirty = true; ok++;
    console.log(`  ✓ will change    ${e.label}`);
  } else if (hits > 1) {
    ambiguous++;
    console.log(`  ✗ AMBIGUOUS (${hits}×)  ${e.label}`);
  } else if (e.to && f.text.includes(e.to)) {
    already++;
    console.log(`  · already done   ${e.label}`);
  } else {
    missing++;
    console.log(`  ✗ NOT FOUND      ${e.label}`);
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