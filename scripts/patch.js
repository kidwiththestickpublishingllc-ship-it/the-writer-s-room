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
 * Batch: Apply page — Writer / Artist / Both fork, Galleria skin for artists.
 */

const fs = require('fs');
const path = require('path');

const F = 'app/apply/page.tsx';

const EDITS = [

  // ── 1. Form shape ───────────────────────────────────────────────────
  {
    file: F,
    label: 'FormData gets applicant_type, portfolio_url, art_roles, open_to_collab',
    from: `  website_url: string;
};`,
    to: `  website_url: string;
  applicant_type: "writer" | "artist" | "both";
  portfolio_url: string;
  art_roles: string[];
  open_to_collab: boolean;
};`,
  },
  {
    file: F,
    label: 'ART_ROLES list above EMPTY_FORM',
    from: `const EMPTY_FORM: FormData = {`,
    to: `const ART_ROLES = ["Full pages (pencils to colour)", "Penciler", "Inker", "Colorist", "Letterer", "Cover artist"];

const EMPTY_FORM: FormData = {`,
  },
  {
    file: F,
    label: 'EMPTY_FORM defaults for the new fields',
    from: `  twitter_url: "", instagram_url: "", website_url: "",
};`,
    to: `  twitter_url: "", instagram_url: "", website_url: "",
  applicant_type: "writer", portfolio_url: "", art_roles: [], open_to_collab: false,
};`,
  },

  // ── 2. Helpers and step rules ───────────────────────────────────────
  {
    file: F,
    label: 'update() accepts true/false for the checkbox',
    from: `const update = (field: keyof FormData, value: string | string[]) =>`,
    to: `const update = (field: keyof FormData, value: string | string[] | boolean) =>`,
  },
  {
    file: F,
    label: 'writes / draws flags and toggleRole, before canProceed',
    from: `  const canProceed = {`,
    to: `  const writes = form.applicant_type !== "artist";
  const draws = form.applicant_type !== "writer";
  const toggleRole = (r: string) =>
    update("art_roles", form.art_roles.includes(r) ? form.art_roles.filter(x => x !== r) : [...form.art_roles, r]);

  const canProceed = {`,
  },
  {
    file: F,
    label: 'step 2 rule: artists pick at least one art role',
    from: `2: form.genres.length >= 1 && form.why_ttl.trim().length >= 30,`,
    to: `2: form.genres.length >= 1 && form.why_ttl.trim().length >= 30 && (!draws || form.art_roles.length >= 1),`,
  },
  {
    file: F,
    label: 'step 3 rule: writers need a sample, artists need a portfolio link',
    from: `3: form.writing_sample.trim().length >= 100,`,
    to: `3: (!writes || form.writing_sample.trim().length >= 100) && (!draws || /^https?:\\/\\/\\S+\\.\\S+/.test(form.portfolio_url.trim())),`,
  },

  // ── 3. Save the new fields ──────────────────────────────────────────
  {
    file: F,
    label: 'insert saves the artist fields',
    from: `website_url: form.website_url.trim() || null,`,
    to: `website_url: form.website_url.trim() || null,
          applicant_type: form.applicant_type,
          portfolio_url: form.portfolio_url.trim() || null,
          art_roles: form.art_roles.length ? form.art_roles : null,
          open_to_collab: form.open_to_collab,`,
  },

  // ── 4. Hero ─────────────────────────────────────────────────────────
  {
    file: F,
    label: 'hero says Write / Draw / Create',
    from: `<h1 className="ap-hero-title">Apply to<br /><em>Write</em> for TTL</h1>`,
    to: `<h1 className="ap-hero-title">Apply to<br /><em>{draws ? (writes ? "Create" : "Draw") : "Write"}</em> for TTL</h1>`,
  },

  // ── 5. Step 1: who are you applying as ──────────────────────────────
  {
    file: F,
    label: 'step 1: Writer / Artist / Both chooser',
    from: `<p className="ap-section-sub">Tell us who you are. This information helps us understand you as a creator and person.</p>`,
    to: `<p className="ap-section-sub">Tell us who you are. This information helps us understand you as a creator and person.</p>

                  <div className="ap-field">
                    <label className="ap-field-label">I'm applying as <span className="req">*</span></label>
                    <div className="ap-type-grid">
                      {([
                        ["writer", "Writer", "Novels, serials and short stories. You publish in the Reading Room."],
                        ["artist", "Artist", "Comics, manga and webtoons. You publish in The Galleria."],
                        ["both", "Both", "You write and draw. You publish in both."],
                      ] as const).map(([value, name, desc]) => (
                        <button key={value} type="button" className={\`ap-type-btn\${form.applicant_type === value ? " selected" : ""}\`} onClick={() => update("applicant_type", value)}>
                          <div className="ap-type-name">{name}</div>
                          <div className="ap-type-desc">{desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>`,
  },
  {
    file: F,
    label: 'step 1 button names the next step',
    from: `Continue to Writing →`,
    to: `Continue to {draws && !writes ? "Your Art" : "Writing"} →`,
  },

  // ── 6. Step 2: art roles, genres, teaming up ────────────────────────
  {
    file: F,
    label: 'step 2 title',
    from: `<h2 className="ap-section-title">Your Writing</h2>`,
    to: `<h2 className="ap-section-title">{draws && !writes ? "Your Art" : draws ? "Your Work" : "Your Writing"}</h2>`,
  },
  {
    file: F,
    label: 'step 2: art roles for artists',
    from: `<p className="ap-section-sub">Tell us about what you write and why TTL is the right home for your work.</p>`,
    to: `<p className="ap-section-sub">Tell us about what you {draws && !writes ? "make" : "write"} and why TTL is the right home for your work.</p>

                  {draws && (
                    <div className="ap-field">
                      <label className="ap-field-label">What You Do on the Page <span className="req">*</span></label>
                      <p className="ap-field-hint" style={{ marginBottom: 12 }}>Select all that apply.</p>
                      <div className="ap-genre-grid">
                        {ART_ROLES.map(r => (
                          <button key={r} type="button" className={\`ap-genre-btn\${form.art_roles.includes(r) ? " selected" : ""}\`} onClick={() => toggleRole(r)}>
                            <span className="ap-genre-check">{form.art_roles.includes(r) ? "✓" : ""}</span>
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}`,
  },
  {
    file: F,
    label: 'step 2 genres label fits artists',
    from: `Genres You Write In <span className="req">*</span>`,
    to: `Genres You {writes ? "Write" : "Work"} In <span className="req">*</span>`,
  },
  {
    file: F,
    label: 'step 2: open to teaming up checkbox',
    from: `<p className="ap-field-hint">Minimum 30 characters. The most memorable answers are specific and honest.</p>`,
    to: `<p className="ap-field-hint">Minimum 30 characters. The most memorable answers are specific and honest.</p>
                    <label className="ap-check">
                      <input type="checkbox" checked={form.open_to_collab} onChange={e => update("open_to_collab", e.target.checked)} />
                      <span>I'm open to teaming up with {writes && !draws ? "an artist who could draw my stories" : draws && !writes ? "writers who need an artist" : "other writers and artists"}.</span>
                    </label>`,
  },
  {
    file: F,
    label: 'step 2 button names the next step',
    from: `Continue to Sample →`,
    to: `Continue to {writes ? "Sample" : "Portfolio"} →`,
  },

  // ── 7. Step 3: portfolio for artists, sample for writers ────────────
  {
    file: F,
    label: 'step 3 title',
    from: `<h2 className="ap-section-title">Writing Sample</h2>`,
    to: `<h2 className="ap-section-title">{writes ? (draws ? "Your Samples" : "Writing Sample") : "Your Portfolio"}</h2>`,
  },
  {
    file: F,
    label: 'step 3: portfolio link, and the writing sample only for writers (open)',
    from: `<p className="ap-section-sub">Paste up to 1,500 words from any piece of your writing. This is where we meet your voice.</p>`,
    to: `{draws && (
                    <>
                      <p className="ap-section-sub">Link us to your work. This is where we meet your line, your colour and your storytelling.</p>
                      <div className="ap-field">
                        <label className="ap-field-label">Portfolio Link <span className="req">*</span></label>
                        <input className="ap-input" type="url" placeholder="Instagram, ArtStation, Behance, or a shared Drive folder" value={form.portfolio_url} onChange={e => update("portfolio_url", e.target.value)} />
                        <p className="ap-field-hint">Show at least 3 finished pages or panels. Pages that tell a story in sequence help most. Make sure the link is public.</p>
                      </div>
                    </>
                  )}

                  {writes && (
                    <>
                  <p className="ap-section-sub">Paste up to 1,500 words from any piece of your writing. This is where we meet your voice.</p>`,
  },
  {
    file: F,
    label: 'step 3: writing sample only for writers (close)',
    from: `<p className="ap-field-hint">Minimum 100 characters. Any genre, any format. Unfinished is fine.</p>
                  </div>`,
    to: `<p className="ap-field-hint">Minimum 100 characters. Any genre, any format. Unfinished is fine.</p>
                  </div>
                    </>
                  )}`,
  },

  // ── 8. Step 4: review ───────────────────────────────────────────────
  {
    file: F,
    label: 'review: applying as, art roles, portfolio',
    from: `{(form.website_url || form.twitter_url || form.instagram_url) && (`,
    to: `<div className="ap-review-section">
                    <div className="ap-review-label">Applying As</div>
                    <div className="ap-review-value">
                      {form.applicant_type === "both" ? "Writer and artist" : form.applicant_type === "artist" ? "Artist" : "Writer"}
                      {form.open_to_collab ? " · open to teaming up" : ""}
                    </div>
                  </div>
                  {draws && (
                    <div className="ap-review-section">
                      <div className="ap-review-label">Art</div>
                      <div className="ap-review-value">
                        {form.art_roles.join(", ")}
                        <br />
                        <a href={form.portfolio_url} target="_blank" rel="noreferrer">{form.portfolio_url}</a>
                      </div>
                    </div>
                  )}
                  {(form.website_url || form.twitter_url || form.instagram_url) && (`,
  },
  {
    file: F,
    label: 'review: no empty writing sample box for artists',
    from: `{form.writing_sample.slice(0, 300)}{form.writing_sample.length > 300 ? "…" : ""}`,
    to: `{form.writing_sample.slice(0, 300) || "Not needed for an artist application."}{form.writing_sample.length > 300 ? "…" : ""}`,
  },
  {
    file: F,
    label: 'review: originality line covers art',
    from: `and your writing sample is your own original work.`,
    to: `and your sample work is your own original work.`,
  },

  // ── 9. Styles: chooser, checkbox, Galleria skin ─────────────────────
  {
    file: F,
    label: 'styles for the chooser, the checkbox and the Galleria skin',
    from: `  .ap-root {`,
    to: `  .ap-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .ap-type-btn {
    text-align: left; padding: 14px 16px; border-radius: 8px; cursor: pointer; font-family: inherit;
    border: 1px solid var(--gold-dim, rgba(201,168,76,0.35)); background: transparent; color: var(--text-main, inherit);
    transition: border-color 0.15s, background 0.15s;
  }
  .ap-type-btn.selected { border: 2px solid var(--gold, #C9A84C); background: var(--gold-glow, rgba(201,168,76,0.08)); }
  .ap-type-name { font-weight: 700; font-size: 14px; margin-bottom: 4px; }
  .ap-type-desc { font-size: 12px; line-height: 1.5; color: var(--text-faint, inherit); }
  .ap-check { display: flex; gap: 10px; align-items: flex-start; margin-top: 18px; font-size: 13px; line-height: 1.5; color: var(--text-dim, inherit); cursor: pointer; }
  .ap-check input { margin-top: 3px; accent-color: var(--gold, #C9A84C); }
  @media (max-width: 640px) { .ap-type-grid { grid-template-columns: 1fr; } }

  /* ── The Galleria skin, for anyone who draws ── */
  .ap-root.artist {
    --gold: #14F1D9;
    --gold-light: #7FF8EA;
    --gold-dim: rgba(20,241,217,0.35);
    --gold-glow: rgba(20,241,217,0.08);
    --text-main: #F2ECFF;
    --text-dim: rgba(242,236,255,0.8);
    --text-faint: rgba(242,236,255,0.58);
    background:
      radial-gradient(1200px 600px at 85% -10%, rgba(180,122,255,0.22), transparent 60%),
      radial-gradient(900px 500px at -10% 40%, rgba(255,20,147,0.14), transparent 60%),
      #0a0420 !important;
    color: var(--text-main);
  }
  .ap-root.artist .ap-btn-primary { background: linear-gradient(135deg, #14F1D9, #B47AFF) !important; color: #0a0420 !important; border: none !important; }
  .ap-root.artist .ap-genre-btn.selected { border-color: #FF1493 !important; color: #FF69B4 !important; background: rgba(255,20,147,0.08) !important; }
  .ap-root.artist .ap-type-btn.selected { border-color: #FF1493; background: rgba(255,20,147,0.08); }
  .ap-root.artist .ap-check input { accent-color: #FF1493; }

  .ap-root {`,
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
  } else if (f.text.includes(e.to)) {
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