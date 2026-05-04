# Pending Scheduled Task Update

**Task ID:** `daily-unsorted-resources-processor`

To apply this update, open a fresh chat and ask:
> "Please update the scheduled task `daily-unsorted-resources-processor` with the prompt below."

Then paste the following:

---

## Daily Unsorted Resources Processor — Educational Elements Website

Check the "Unsorted Resources" folder for new files. If it is empty, do nothing and exit. If files are found, implement them into the educational-elements website, then clear the folder.

---

### FOLDER PATH TO CHECK

**Primary unsorted folder** (inside the website's public dir):
- Windows: `C:\Users\USER\educational-elements\public\Unsorted Resources\`
- Bash: `/sessions/*/mnt/educational-elements/public/Unsorted Resources/`

If this folder is empty (no files, no subfolders), **stop here and exit** — no work needed.

> **Note:** The OneDrive folder is no longer used. Only process files from the above folder.

---

### WEBSITE STRUCTURE (educational-elements)

This is a Next.js site at `C:\Users\USER\educational-elements\`.

**Key public folders:**

- `/public/Displays/` — PNG image displays for classroom use. Subfolders: English/, Maths/, Science/, HASS/, Behaviour/, Games/
  - Each subject folder can have sub-subfolders (e.g. `Worksheets/`, `Phonics/`, `Alphabet/`, `Writing/`, etc.)
  - Registered in: `components/curriculum/general/DisplaysGallery.js`

- `/public/Unit Resources/` — Downloadable PDFs and other docs for students/teachers. Subfolders: Literacy/, Mathematics/, Science/, HASS/
  - Registered in: `components/tabs/ResourceHubTab.js` inside the `resourcesBySubject` object

- `/public/shop/` — Avatar and pet images for the in-app shop. Subfolders: Basic/, Premium/, BasicPets/, PremiumPets/, Egg/, Consumables/, Themed/
  - Basic avatars use numbered update subfolders: `Basic/Update1/`, `Basic/Update2/`, etc.
  - Shop items are registered directly in `utils/gameHelpers.js` in the `SHOP_BASIC_AVATARS` or `SHOP_PREMIUM_AVATARS` arrays (for avatars) or `SHOP_BASIC_PETS` / `SHOP_PREMIUM_PETS` (for pets)

- `/public/games/` — Game asset images. Subfolders by game name (e.g. `werewolf/`)

- `/public/avatars/` — Avatar character images. Each character has a named subfolder (e.g. `Wizard M/`, `Archer F/`).

- `/public/Curriculum/` — Curriculum-specific assets. Subfolders: Literacy/, Literacy/Comprehension/, Literacy/VisualPrompts/

---

### HOW TO CLASSIFY INCOMING FILES

Use filename, extension, and subfolder name to determine type and destination:

**Subfolders in Unsorted Resources:**
- A folder named `Avatars/` → contains avatar PNGs for the shop (see Avatar/Pet section below)
- A folder named `Pets/` → contains pet PNGs for the shop (see Avatar/Pet section below)
- A folder named `Werewolf Characters/` or other game-character folders → move to `/public/games/[game-name]/`
- Any other named subfolder → inspect contents and use best judgment for destination

**PNG/JPG images (loose files):**
- Name contains "Worksheet" → **Displays gallery worksheet**
  - "Comprehension", "Narrative", "Persuasive", "TEEL", "Writing" → `Displays/English/Worksheets/`
  - "Currency", "Counting", "PlaceValue", "Fraction", "Maths", "Math", "Number", "Skip", "Whole", "Expanded" → `Displays/Maths/Worksheets/`
  - "Science", "Experiment" → `Displays/Science/Worksheets/`
  - "HASS", "History", "Geography" → `Displays/HASS/Worksheets/`
- Name contains "Display", "Poster", "Chart", "Visual" → classify by subject keyword into appropriate `Displays/[Subject]/` subfolder (e.g. Writing-related displays → `Displays/English/Writing/`)
- If unclear, inspect the image visually and use best judgment

**PDF files:**
- Classify by subject keyword in filename → `Unit Resources/Literacy/`, `Unit Resources/Mathematics/`, `Unit Resources/Science/`, or `Unit Resources/HASS/`
- Register in `components/tabs/ResourceHubTab.js` by adding an entry to the appropriate array in `resourcesBySubject`

**PPTX/DOCX files:**
- Treat same as PDFs for Unit Resources registration

---

### HOW TO REGISTER PNG WORKSHEETS IN DisplaysGallery.js

File: `C:\Users\USER\educational-elements\components\curriculum\general\DisplaysGallery.js`

Each display category has a `sections` array. Find the matching category (e.g. `id: 'english'` or `id: 'maths'`) and either:
- Add images to the existing section (e.g. `'Worksheets'`, `'Writing Genres'`, `'Persuasive Writing'`), OR
- Append a new section object at the end of that category's `sections` array

Example section format:
```js
{
  name: 'Worksheets',
  images: [
    { name: 'Place Value Worksheet', file: 'Worksheets/PlaceValueWorksheet.png' },
  ]
}
```

The image `file` path is **relative to the category's `folder`**. For example, for Maths (folder: `'Maths'`), a file at `public/Displays/Maths/Worksheets/PlaceValue.png` uses `file: 'Worksheets/PlaceValue.png'`.

**Already registered items (as of 2026-05-03):**

English Worksheets section exists with:
- ComprehensionWorksheet.png through ComprehensionWorksheet6.png
- NarrativeWritingWorksheet.png
- PersuasiveWritingWorksheet.png, PersuasiveWritingWorksheet2.png
- TEELParagraphWorksheet.png
- ComplexSentencesWorksheet.png, VerbsWorksheet.png

English Writing Genres section exists with:
- Fantasy Narratives, Information Reports, Poetry, Recount Writing, Science Fiction Narratives
- InformativeWritingDisplay.png, InformativeTextDisplay2.png
- TEELParagraphDisplay.png, TEELParagraphDisplay2.png
- NarrativeWritingDisplay.png, TEELDisplay.png

English Persuasive Writing section exists with:
- Persuasive.png, Persuasive Checklist.png, Persuasive Devices.png, Persuasive Elements.png, Persuasive Structure.png
- PersuasiveWritingDisplay.png

Maths Worksheets section exists with:
- AustralianCurrencyWorksheet.png
- CountingWorksheet.png, ExpandedFormWorksheet.png, PlaceValueWorksheet.png
- SkipCountingWorksheet.png, WholeNumbersWorksheet.png

When adding new items, **append** new entries to existing sections rather than creating duplicates.

---

### HOW TO REGISTER PDF UNIT RESOURCES IN ResourceHubTab.js

File: `C:\Users\USER\educational-elements\components\tabs\ResourceHubTab.js`

Find the `resourcesBySubject` object. Each subject (english, mathematics, science, hass) has an array of resource objects:
```js
{ id: 'unique-slug', title: 'Display Title', description: 'Brief description', pdfPath: '/Unit Resources/Literacy/Filename.pdf', icon: '📝' }
```

Append new entries to the correct subject array. Use a kebab-case `id`, a descriptive title, short description, and relevant emoji icon.

---

### HOW TO IMPLEMENT AVATAR AND PET SHOP ITEMS

When avatar or pet PNGs arrive (either as loose files or in an `Avatars/` or `Pets/` subfolder):

**1. Copy images to the correct public folder:**
- Basic avatars → `/public/shop/Basic/Update[N]/` where N is the next update number (check existing subfolders to find the latest)
- Premium avatars → `/public/shop/Premium/` (flat folder, no subfolders)
- Basic pets → `/public/shop/BasicPets/Update [N]/` (check existing subfolders)
- Premium pets → `/public/shop/PremiumPets/` (flat folder)

**Classifying Basic vs Premium:**
- Premium: clearly high-tier, epic, legendary, royal, or boss-type names/visuals (e.g. "Gold Mask", "Skeleton Lord", "King", "Queen"). Price range: 35–60 coins.
- Basic: everything else. Price range: 10–30 coins based on uniqueness/complexity.

**2. Register in `utils/gameHelpers.js`:**

File: `C:\Users\USER\educational-elements\utils\gameHelpers.js`

Add entries to the appropriate array (`SHOP_BASIC_AVATARS`, `SHOP_PREMIUM_AVATARS`, `SHOP_BASIC_PETS`, `SHOP_PREMIUM_PETS`):

```js
{ name: 'Display Name', price: 20, path: '/shop/Basic/Update5/Filename.png' }
```

- Use the display name as the `name` (fix any typos in filenames — e.g. `Figther.png` → name: `'Fighter'`)
- Use the actual filename (including typos) in the `path`
- Assign a price based on tier and visual complexity

**Already registered shop items (as of 2026-05-03):**

Basic avatars include Update1 through Update5 items. Update5 contains:
- Bardo (22), Chicken (15), Fighter (22), Frog Prince (20), Mage Girl (25), Pirate Skelly (22), Ranger Girl (22), Rogue (20), Rogue 2 (22), Scientist (20), Warthog (18)

Premium avatars include:
- Dwarf, Dwarf2, FarmerBoy Premium, FarmerGirl Premium, Goblin2, GoblinGirl2, King, MechanicGirl, PirateBoy Premium, PirateGirl Premium, Queen, RobotBoy Premium, RobotGirl Premium, Vampire2, VampireGirl2, Gold Mask (45), Skeleton Lord (50)

Next basic avatar update folder: **Update6**

---

### GAME ASSET FOLDERS

When a subfolder of character images clearly belongs to a specific game (e.g. "Werewolf Characters"), move all images to `/public/games/[game-slug]/`. Use a lowercase kebab-case folder name (e.g. `werewolf`).

Already created game folders:
- `/public/games/werewolf/` — 30 Werewolf role character images (Alpha Wolf, Seer, Villager, Witch, etc.)

---

### AFTER PROCESSING

1. Move all processed files to their destination folders (delete originals from Unsorted Resources)
2. To delete files from the Unsorted Resources folder, call `mcp__cowork__allow_cowork_file_delete` with the path `/sessions/*/mnt/educational-elements/public/Unsorted Resources/[filename]` if bash `rm` fails with "Operation not permitted"
3. Verify the Unsorted Resources folder is empty
4. If `DisplaysGallery.js` was modified, confirm the syntax is valid (check for unmatched brackets)
5. Log a summary of what was processed to the console/output

---

### SELF-IMPROVEMENT (after each run)

After a successful run where you processed files, update this task's prompt to:
- Add any new folder patterns you discovered
- Add any new file naming conventions you encountered
- Note any edge cases or corrections made
- Update the "Already registered" lists to include newly added items
- Update the "Next basic avatar update folder" counter

Use the `mcp__scheduled-tasks__update_scheduled_task` tool with taskId `daily-unsorted-resources-processor` to update the prompt.
