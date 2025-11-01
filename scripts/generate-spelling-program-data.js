const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'concepts', 'spellingandmorphology.txt');
const outputPath = path.join(__dirname, '..', 'components', 'literacy', 'data', 'spelling-program-structure.json');

const raw = fs.readFileSync(inputPath, 'utf8');
const lines = raw.split(/\r?\n/);

const paragraphs = [];
let buffer = [];

for (const line of lines) {
  if (line.trim() === '') {
    if (buffer.length > 0) {
      paragraphs.push(buffer.join(' ').replace(/\s+/g, ' ').trim());
      buffer = [];
    }
  } else {
    buffer.push(line.trim());
  }
}
if (buffer.length > 0) {
  paragraphs.push(buffer.join(' ').replace(/\s+/g, ' ').trim());
}

const levelMap = {
  Foundation: 'Level Foundation',
  'Year 1': 'Level 1',
  'Year 2': 'Level 2',
  'Year 3': 'Level 3',
  'Year 4': 'Level 4',
  'Year 5': 'Level 5',
  'Year 6': 'Level 6'
};

const structure = {
  Phonology: {},
  'Spelling Patterns': {},
  Morphology: {}
};

let currentLevel = null;
let currentCategory = null;

const getCategoryName = (paragraph) => {
  if (/^Phonology/i.test(paragraph)) return 'Phonology';
  if (/^Orthography/i.test(paragraph)) return 'Spelling Patterns';
  if (/^Morphology/i.test(paragraph)) return 'Morphology';
  return null;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

for (const paragraph of paragraphs) {
  const levelMatch = paragraph.match(/^(Foundation|Year [1-6])/i);
  if (levelMatch) {
    const rawLevel = levelMatch[1].replace(/:$/, '').trim();
    currentLevel = levelMap[rawLevel] || rawLevel;
    continue;
  }

  const category = getCategoryName(paragraph);
  if (category) {
    currentCategory = category;
    if (currentLevel) {
      if (!structure[currentCategory][currentLevel]) {
        structure[currentCategory][currentLevel] = [];
      }
    }
    continue;
  }

  if (!currentLevel || !currentCategory) {
    continue;
  }

  if (!structure[currentCategory][currentLevel]) {
    structure[currentCategory][currentLevel] = [];
  }

  const item = {
    id: slugify(paragraph),
    text: paragraph
  };

  structure[currentCategory][currentLevel].push(item);
}

fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2), 'utf8');
console.log(`Generated spelling program structure with ${paragraphs.length} paragraphs.`);
