// scripts/generateWritingPromptsManifest.js
// ─────────────────────────────────────────────────────────────────────────────
// Rescans public/curriculum/literacy/VisualPrompts/ and regenerates
// components/curriculum/literacy/writing-prompts/promptManifest.js.
//
// Run it after dropping new prompt images (or a whole new text-type folder,
// e.g. "Informative" or "Recount") into the VisualPrompts directory:
//
//     node scripts/generateWritingPromptsManifest.js
//
// Rules:
//  • Every immediate subfolder of VisualPrompts/ becomes a text type.
//  • Every .png/.jpg/.jpeg/.webp inside it becomes a prompt, sorted
//    numerically when filenames are numbers, alphabetically otherwise.
//  • Files listed in EXCLUDE below are skipped (legacy word-bank images from
//    the old odd/even naming scheme).
//
// New text types appear automatically in the Writing Studio. To give a new
// type its own structure guide / word bank / sentence starters (instead of
// the generic defaults), add an entry for it in promptData.js →
// TEXT_TYPE_CONFIG, and per-image scaffolds in PROMPT_SCAFFOLDS.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const PROMPTS_DIR = path.join(__dirname, '..', 'public', 'curriculum', 'literacy', 'VisualPrompts');
const OUT_FILE = path.join(__dirname, '..', 'components', 'curriculum', 'literacy', 'writing-prompts', 'promptManifest.js');

// Legacy word-bank images to skip, as "<Folder>/<filename>".
const EXCLUDE = new Set([
  'Narrative/8.png', // old word-bank companion image for prompt 7
]);

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const numericValue = (name) => {
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
};

function scan() {
  if (!fs.existsSync(PROMPTS_DIR)) {
    console.error(`✗ Prompts directory not found: ${PROMPTS_DIR}`);
    process.exit(1);
  }

  const manifest = {};
  const folders = fs.readdirSync(PROMPTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  for (const folder of folders) {
    const files = fs.readdirSync(path.join(PROMPTS_DIR, folder))
      .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
      .filter((f) => !EXCLUDE.has(`${folder}/${f}`))
      .sort((a, b) => numericValue(a) - numericValue(b) || a.localeCompare(b));

    if (files.length > 0) {
      manifest[folder] = { folder, images: files };
    }
  }

  return manifest;
}

function render(manifest) {
  const entries = Object.entries(manifest).map(([key, { folder, images }]) => {
    const list = images.map((f) => `'${f}'`).join(', ');
    return `  ${key}: {\n    folder: '${folder}',\n    images: [${list}],\n  },`;
  }).join('\n');

  return `// components/curriculum/literacy/writing-prompts/promptManifest.js
// ─────────────────────────────────────────────────────────────────────────────
// AUTO-GENERATED — run \`node scripts/generateWritingPromptsManifest.js\` after
// adding new prompt images (or whole new text-type folders) to
// public/curriculum/literacy/VisualPrompts/. Do not edit by hand unless you
// enjoy your edits being overwritten.
//
// Each key is a folder name inside public/curriculum/literacy/VisualPrompts/.
// \`images\` lists the image filenames that should appear as prompts, sorted
// numerically. Legacy word-bank images (from the old odd/even naming scheme)
// are excluded by the generator script.
// ─────────────────────────────────────────────────────────────────────────────

export const PROMPT_MANIFEST = {
${entries}
};

export default PROMPT_MANIFEST;
`;
}

const manifest = scan();
fs.writeFileSync(OUT_FILE, render(manifest));

const summary = Object.entries(manifest)
  .map(([k, v]) => `${k}: ${v.images.length} prompts`)
  .join(', ');
console.log(`✓ Wrote ${path.relative(process.cwd(), OUT_FILE)} — ${summary}`);
