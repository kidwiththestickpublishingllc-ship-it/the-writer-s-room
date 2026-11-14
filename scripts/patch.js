/* scripts/patch.js — exact, verified multi-line edits.
 *
 *   node scripts/patch.js           → dry run, reports what would change
 *   node scripts/patch.js --apply   → writes
 *
 * Run from the repo root (~/the-writers-room).
 *
 * Batch: TTL Admin — application card shows artist fields.
 */

const fs = require('fs');
const path = require('path');

const F = 'app/ttl-admin/page.tsx';

const EDITS = [

  {
    file: F,
    label: 'application type knows the artist fields',
    from: `  writing_sample: string | null;`,
    to: `  writing_sample: string | null;
  applicant_type?: string | null;
  portfolio_url?: string | null;
  art_roles?: string[] | null;
  open_to_collab?: boolean | null;`,
  },
  {
    file: F,
    label: 'expanded card shows applying as, art roles, portfolio, teaming up',
    from: `{app.writing_sample && <><div className="adm-expand-label">Writing Sample</div>`,
    to: `{app.applicant_type && app.applicant_type !== "writer" && <><div className="adm-expand-label">Applying As</div><div className="adm-expand-text" style={{ marginBottom: 16 }}>{app.applicant_type === "both" ? "Writer and artist" : "Artist"}{app.art_roles?.length ? \` · \${app.art_roles.join(", ")}\` : ""}</div></>}
                          {app.portfolio_url && /^https?:\\/\\//i.test(app.portfolio_url) && <><div className="adm-expand-label">Portfolio</div><div className="adm-expand-text" style={{ marginBottom: 16 }}><a href={app.portfolio_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue-bright)" }}>{app.portfolio_url}</a></div></>}
                          {app.open_to_collab && <div className="adm-expand-text" style={{ marginBottom: 16 }}>🤝 Open to teaming up</div>}
                          {app.writing_sample && <><div className="adm-expand-label">Writing Sample</div>`,
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