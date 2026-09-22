// One-time script: removes LettersInbox.tsx's broken reference to a
// stories(title, slug) relationship that doesn't exist on reader_letters
// (it was making the whole letters query fail outright).
//
// Run from the repo root: node scripts/fix-letters-inbox.js

const fs = require("fs");
const path = require("path");

function applyReplacements(filePath, replacements) {
  let raw = fs.readFileSync(filePath, "utf8");
  const hadCRLF = raw.includes("\r\n");
  let content = hadCRLF ? raw.replace(/\r\n/g, "\n") : raw;

  for (const { label, old, new: replacement } of replacements) {
    const count = content.split(old).length - 1;
    if (count !== 1) {
      console.error(`✘ FAILED: "${label}" — expected 1 match, found ${count}. Aborting before writing.`);
      return false;
    }
    content = content.replace(old, replacement);
    console.log(`✔ Applied: ${label}`);
  }

  if (hadCRLF) {
    content = content.replace(/\n/g, "\r\n");
  }
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

const filePath = path.join(__dirname, "..", "app", "components", "LettersInbox.tsx");

const ok = applyReplacements(filePath, [
  {
    label: "Remove story_id/stories fields from Letter type (no such relationship exists)",
    old: `interface Letter {
  id: string;
  reader_id: string;
  writer_id: string;
  story_id: string | null;
  tip_amount: number;
  status: string;
  created_at: string;
  letter_messages?: LetterMessage[];
  stories?: { title: string; slug: string } | null;
}`,
    new: `interface Letter {
  id: string;
  reader_id: string;
  writer_id: string;
  tip_amount: number;
  status: string;
  created_at: string;
  letter_messages?: LetterMessage[];
}`,
  },
  {
    label: "Drop the broken stories() embed from the letters query",
    old: `    const { data } = await supabase
      .from("reader_letters")
      .select("*, stories(title, slug)")
      .eq("writer_id", writerId)
      .order("created_at", { ascending: false });`,
    new: `    const { data } = await supabase
      .from("reader_letters")
      .select("*")
      .eq("writer_id", writerId)
      .order("created_at", { ascending: false });`,
  },
  {
    label: "Remove dead story reference in the letter list item",
    old: `                  {(letter.stories as any)?.title && (
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 10, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      re: {(letter.stories as any).title}
                    </span>
                  )}
`,
    new: ``,
  },
  {
    label: "Remove dead story reference in the thread header",
    old: `                {(currentLetter.stories as any)?.title && (
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>
                    re: {(currentLetter.stories as any).title}
                  </div>
                )}
`,
    new: ``,
  },
]);

if (!ok) {
  console.error("\nEdit failed. No changes were written.");
  process.exit(1);
}

console.log("\nAll edits applied successfully.");