// utils/keyboardQuestEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// KEYBOARD QUEST ⌨️ — structured touch-typing curriculum engine.
//
// 5 stages × 8 lessons (40 lessons) + 5 belt tests, from home-row anchors to
// full-speed paragraphs. Pure logic only — imported by the teacher hub
// (components/curriculum/typing/KeyboardQuest.js) and the student experience
// (components/student/StudentKeyboardQuest.js).
//
// DATA CONTRACT (teacher, toolkitData.keyboardQuest):
//   { students: { [studentId]: { assignedStage: 1..5, assignedAt } } }
//
// DATA CONTRACT (student record, studentData.keyboardQuestProgress):
//   { completedLessons: { [lessonId]: { bestWpm, bestAcc, stars, passed, attempts, timestamp } },
//     belts: { [stage]: { wpm, acc, timestamp } },
//     unlockedStage: 1..5,       // auto-advances when a belt is earned
//     totalKeys, totalSeconds, lastPractice }
// ─────────────────────────────────────────────────────────────────────────────

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ═══════════════════════════════════════════════════════════════════════════
// STAGES (belts)
// ═══════════════════════════════════════════════════════════════════════════
export const KQ_STAGES = {
  1: {
    id: 1, name: 'Home Row Heroes', icon: '🏠', belt: 'Yellow Belt', beltIcon: '🟡',
    color: 'amber', targetWpm: 10, targetAcc: 90,
    description: 'Learn the home row — where your fingers live. F and J are your anchors!',
  },
  2: {
    id: 2, name: 'Top Row Climbers', icon: '🧗', belt: 'Orange Belt', beltIcon: '🟠',
    color: 'orange', targetWpm: 14, targetAcc: 90,
    description: 'Reach up to the top row and unlock every vowel. Real words await!',
  },
  3: {
    id: 3, name: 'Bottom Row Divers', icon: '🤿', belt: 'Green Belt', beltIcon: '🟢',
    color: 'emerald', targetWpm: 18, targetAcc: 91,
    description: 'Dive down for the final letters. The whole alphabet becomes yours.',
  },
  4: {
    id: 4, name: 'Capital Command', icon: '🎖️', belt: 'Blue Belt', beltIcon: '🔵',
    color: 'sky', targetWpm: 20, targetAcc: 92,
    description: 'Capitals, punctuation and numbers — type like a real writer.',
  },
  5: {
    id: 5, name: 'Speed Legend', icon: '⚡', belt: 'Black Belt', beltIcon: '⚫',
    color: 'violet', targetWpm: 25, targetAcc: 93,
    description: 'Full sentences and paragraphs at speed. Only legends earn the black belt.',
  },
};
export const KQ_STAGE_IDS = [1, 2, 3, 4, 5];

// ═══════════════════════════════════════════════════════════════════════════
// LESSONS — newKeys build cumulatively in lesson order
// ═══════════════════════════════════════════════════════════════════════════
export const KQ_LESSONS = [
  // Stage 1 — home row
  { id: 't1.1', stage: 1, name: 'F & J — The Anchors', icon: '⚓', newKeys: ['f', 'j'], type: 'keys', tip: 'Feel the bumps on F and J? They guide your index fingers home without looking!' },
  { id: 't1.2', stage: 1, name: 'D & K', icon: '🎯', newKeys: ['d', 'k'], type: 'keys', tip: 'Middle fingers on D and K. Keep your index fingers anchored on F and J.' },
  { id: 't1.3', stage: 1, name: 'S & L', icon: '🎹', newKeys: ['s', 'l'], type: 'keys', tip: 'Ring fingers reach S and L. They feel weak now — they get stronger fast.' },
  { id: 't1.4', stage: 1, name: 'A & ;', icon: '🅰️', newKeys: ['a', ';'], type: 'keys', tip: 'Pinkies on A and ; — the full home row is yours. Eyes on the screen!' },
  { id: 't1.5', stage: 1, name: 'Home Row Words', icon: '📝', newKeys: [], type: 'words', tip: 'Real words with just eight keys. Type word by word, smooth and steady.' },
  { id: 't1.6', stage: 1, name: 'G & H — The Middle', icon: '🌉', newKeys: ['g', 'h'], type: 'keys', tip: 'Index fingers stretch inward for G and H, then snap back to F and J.' },
  { id: 't1.7', stage: 1, name: 'Home Row Phrases', icon: '💬', newKeys: [], type: 'words', tip: 'Longer runs now. Rhythm beats speed — type to a steady drumbeat.' },
  { id: 't1.8', stage: 1, name: 'Home Row Mastery', icon: '🏆', newKeys: [], type: 'mixed', tip: 'Everything so far, mixed together. Pass this and the belt test awaits!' },
  // Stage 2 — top row
  { id: 't2.1', stage: 2, name: 'E & I', icon: '👀', newKeys: ['e', 'i'], type: 'keys', tip: 'Middle fingers reach up for E and I — the two busiest vowels in English.' },
  { id: 't2.2', stage: 2, name: 'R & U', icon: '🚀', newKeys: ['r', 'u'], type: 'keys', tip: 'Index fingers up for R and U. Reach and return, reach and return.' },
  { id: 't2.3', stage: 2, name: 'T & Y', icon: '🌴', newKeys: ['t', 'y'], type: 'keys', tip: 'The long inward stretch — T for the left index, Y for the right.' },
  { id: 't2.4', stage: 2, name: 'W & O', icon: '🦉', newKeys: ['w', 'o'], type: 'keys', tip: 'Ring fingers climb to W and O. Keep the other fingers resting at home.' },
  { id: 't2.5', stage: 2, name: 'Q & P', icon: '🧩', newKeys: ['q', 'p'], type: 'keys', tip: 'Pinkies to the corners — Q and P. The whole top row is unlocked!' },
  { id: 't2.6', stage: 2, name: 'Two-Row Words', icon: '📚', newKeys: [], type: 'words', tip: 'With vowels unlocked, thousands of words open up. Enjoy the freedom!' },
  { id: 't2.7', stage: 2, name: 'Word Rivers', icon: '🏞️', newKeys: [], type: 'words', tip: 'Long flowing word runs. Don’t stop between words — flow like a river.' },
  { id: 't2.8', stage: 2, name: 'Two-Row Mastery', icon: '🏆', newKeys: [], type: 'mixed', tip: 'Prove your top-row power to unlock the Orange Belt test.' },
  // Stage 3 — bottom row
  { id: 't3.1', stage: 3, name: 'V & M', icon: '✌️', newKeys: ['v', 'm'], type: 'keys', tip: 'Index fingers dive down for V and M. Down and back, like a bounce.' },
  { id: 't3.2', stage: 3, name: 'C & N', icon: '🥥', newKeys: ['c', 'n'], type: 'keys', tip: 'C with the left middle finger, N with the right index. You’re nearly there.' },
  { id: 't3.3', stage: 3, name: 'B, X & Z', icon: '🐝', newKeys: ['b', 'x', 'z'], type: 'keys', tip: 'The rare letters! B is a big left-index stretch. Z belongs to the left pinky.' },
  { id: 't3.4', stage: 3, name: 'Comma & Full Stop', icon: '⏸️', newKeys: [',', '.'], type: 'keys', tip: 'Right middle finger for comma, right ring finger for full stop.' },
  { id: 't3.5', stage: 3, name: 'Alphabet Words', icon: '🔤', newKeys: [], type: 'words', tip: 'Every letter unlocked — any word in the dictionary is now typeable!' },
  { id: 't3.6', stage: 3, name: 'Simple Sentences', icon: '✏️', newKeys: [], type: 'sentences', tip: 'Whole sentences at last. Tap space with your thumb, never look down.' },
  { id: 't3.7', stage: 3, name: 'Speed Words', icon: '💨', newKeys: [], type: 'words', tip: 'Common words on repeat — train your fingers to fire them automatically.' },
  { id: 't3.8', stage: 3, name: 'Alphabet Mastery', icon: '🏆', newKeys: [], type: 'mixed', tip: 'The full alphabet challenge. The Green Belt is within reach!' },
  // Stage 4 — capitals, punctuation, numbers
  { id: 't4.1', stage: 4, name: 'Shift & Capitals', icon: '⬆️', newKeys: ['A', 'T', 'I', 'S', 'W'], type: 'sentences', tip: 'Opposite pinky holds Shift: capital letters on the LEFT hand use RIGHT Shift.' },
  { id: 't4.2', stage: 4, name: 'Proper Sentences', icon: '🖋️', newKeys: [], type: 'sentences', tip: 'Capital at the start, full stop at the end — real writing now.' },
  { id: 't4.3', stage: 4, name: 'Apostrophes', icon: '🪄', newKeys: ["'"], type: 'sentences', tip: 'Right pinky slides to the apostrophe. Don’t skip it — it’s a real key!' },
  { id: 't4.4', stage: 4, name: 'Questions & Excitement', icon: '❗', newKeys: ['?', '!'], type: 'sentences', tip: 'Shift + / makes ?, Shift + 1 makes ! — punctuation with power.' },
  { id: 't4.5', stage: 4, name: 'Numbers 1–5', icon: '5️⃣', newKeys: ['1', '2', '3', '4', '5'], type: 'keys', tip: 'The number row is a big reach. Left hand covers 1 to 5.' },
  { id: 't4.6', stage: 4, name: 'Numbers 6–0', icon: '🔟', newKeys: ['6', '7', '8', '9', '0'], type: 'keys', tip: 'Right hand takes 6 to 0. Reach up, tap, return home.' },
  { id: 't4.7', stage: 4, name: 'Punctuation Mix', icon: '🎛️', newKeys: [], type: 'sentences', tip: 'Sentences with everything: capitals, apostrophes, questions, numbers.' },
  { id: 't4.8', stage: 4, name: 'Capital Mastery', icon: '🏆', newKeys: [], type: 'sentences', tip: 'Master the whole keyboard to face the Blue Belt test.' },
  // Stage 5 — speed
  { id: 't5.1', stage: 5, name: 'Common Word Sprint', icon: '🏃', newKeys: [], type: 'words', tip: 'The 100 most common words make up half of everything you’ll ever type.' },
  { id: 't5.2', stage: 5, name: 'Tricky Words', icon: '🌪️', newKeys: [], type: 'words', tip: 'Awkward letter combos that trip up fast fingers. Slow is smooth, smooth is fast.' },
  { id: 't5.3', stage: 5, name: 'Sentence Sprints', icon: '🏁', newKeys: [], type: 'sentences', tip: 'Full sentences, full speed. Keep your eyes ahead of your fingers.' },
  { id: 't5.4', stage: 5, name: 'Paragraph Power', icon: '📜', newKeys: [], type: 'paragraph', tip: 'Your longest challenge yet. Settle into a rhythm and hold it.' },
  { id: 't5.5', stage: 5, name: 'Numbers in the Wild', icon: '🔢', newKeys: [], type: 'sentences', tip: 'Sentences with dates, prices and scores — numbers where they really appear.' },
  { id: 't5.6', stage: 5, name: 'The Endurance Run', icon: '🏔️', newKeys: [], type: 'paragraph', tip: 'Long-haul typing. Posture check: feet flat, wrists floating, back straight.' },
  { id: 't5.7', stage: 5, name: 'Accuracy Gauntlet', icon: '🎯', newKeys: [], type: 'sentences', minAcc: 97, tip: 'Speed means nothing without accuracy. 97% or better to pass this one.' },
  { id: 't5.8', stage: 5, name: 'Legend Mastery', icon: '🏆', newKeys: [], type: 'paragraph', tip: 'Everything you’ve got. The Black Belt test waits on the other side.' },
];
export const KQ_LESSON_MAP = Object.fromEntries(KQ_LESSONS.map((l) => [l.id, l]));
export const getLessonsForStage = (stage) => KQ_LESSONS.filter((l) => l.stage === Number(stage));
export const KQ_TOTAL_LESSONS = KQ_LESSONS.length;

// Cumulative lowercase key set available at a given lesson (letters + basic punct)
export const keysUpTo = (lessonId) => {
  const set = new Set();
  for (const lesson of KQ_LESSONS) {
    lesson.newKeys.forEach((k) => set.add(k.toLowerCase()));
    if (lesson.id === lessonId) break;
  }
  return set;
};

// ═══════════════════════════════════════════════════════════════════════════
// TEXT BANKS
// ═══════════════════════════════════════════════════════════════════════════
const WORDS = (
  'as ask all fall hall has had gas glad lash flag dash salad glass shall half ' +
  'flash lads adds fads sags flask gags shag slash haha dad sad lad fad gaff jag ' +
  'the and for are but not you all can had her was one our out day get has him ' +
  'his how man new now old see two way who boy did its let put say she too use ' +
  'that with have this will your from they know want been good much some time ' +
  'very when come here just like long make many over such take than them well ' +
  'were what year work back call came each even find give hand high keep last ' +
  'left life little live look made most move must name need next only open part ' +
  'play right same seem show side tell turn under want water where which while ' +
  'world would write about after again always around because before better ' +
  'children different enough every example follow found great house important ' +
  'large learn letter mother never night often other people picture place point ' +
  'school second sentence should something sometimes sound spell still study ' +
  'their there these thing think three through together until walk watch cat dog ' +
  'run sun fun big red hat sit top ten pen box fox zip jam mix van web yes quiz ' +
  'jump quick brave fizzy lazy vexed'
).split(/\s+/).filter(Boolean);

const wordsForKeys = (keySet) =>
  WORDS.filter((w) => [...w].every((ch) => keySet.has(ch)));

const SENTENCES_SIMPLE = [ // lowercase, letters + , . only
  'the cat ran to the red barn and hid in the hay.',
  'we like to swim in the cool blue lake all summer.',
  'a small dog can dig a very big hole in the sand.',
  'the sun will rise over the hill and warm the town.',
  'she put the green apples in a basket by the door.',
  'birds sing in the tall trees when morning comes.',
  'my best friend and i walk to school every day.',
  'the little boat sailed far across the calm sea.',
  'he found a shiny rock, a leaf and an old coin.',
  'we planted seeds, watered them and watched them grow.',
];

const SENTENCES_CAPS = [ // capitals + . only (starter caps + names)
  'Sam and Tia went to the park on Saturday morning.',
  'The big race starts when Mr Lee waves the flag.',
  'Winter is coming and the days are getting shorter.',
  'Anna packed her bag and set off for the mountains.',
  'Our class visited the museum in the city today.',
  'The team from Sydney won the final game last week.',
  'Iris drew a map of the island for the treasure hunt.',
  'Tom fed the chickens before the storm arrived.',
];

const SENTENCES_APOS = [
  "It's a great day and we can't wait to play outside.",
  "That isn't my hat, it's my brother's favourite one.",
  "She's sure the dog didn't eat the last sausage.",
  "We're going to grandma's house after school today.",
  "Don't forget it's sports day and you'll need a hat.",
  "The bird's nest wasn't easy to spot in the tree.",
];

const SENTENCES_PUNCT = [
  'Watch out! The floor is wet and very slippery.',
  'Can you believe we won the grand final? What a day!',
  'Where did you put the glue, the tape and the string?',
  'Stop! Look both ways before you cross the road.',
  "Who's coming to the beach? Bring your towel and hat!",
  'Wow! That was the best goal I have ever seen.',
];

const SENTENCES_NUMBERS = [
  'The bus leaves at 8.15 and arrives by 9 o clock.',
  'She scored 48 runs and took 3 wickets in the match.',
  'Our school has 27 classes and around 650 students.',
  'The recipe needs 2 eggs, 250 grams of flour and 1 cup of milk.',
  'In 2026 the games will run for 16 days in July.',
  'He read 12 books in 30 days over the holidays.',
];

const SENTENCES_SPEED = [
  'The quick brown fox jumps over the lazy dog near the river bank.',
  'Pack my box with five dozen jugs of fizzy lemon juice for the picnic.',
  'Bright vixens jump while the dozy fowl quack loudly at dawn.',
  'A wizard quickly jinxed the gnomes before they vanished into fog.',
  'Every good typist knows that steady rhythm beats frantic speed.',
  'Strong winds swept the coast while surfers waited for calmer waves.',
];

const PARAGRAPHS = [
  'The old lighthouse stood at the edge of the cliff, watching over the bay. Every night its beam swept across the dark water, guiding fishing boats safely home. The keeper climbed the winding stairs twice a day, and he knew every creak of every step.',
  'Deep in the rainforest, a tiny tree frog began its evening song. Soon a thousand voices joined in, rising and falling like waves. High above, the canopy swayed gently, and the first stars appeared between the leaves.',
  'The young inventor tightened the last bolt and stepped back. Her machine hummed, clicked twice, and then began to glow softly. It had taken two hundred tries, but tonight, at last, something wonderful was about to happen.',
  'On the morning of the big race, the whole town lined the main street. Runners stretched and bounced on their toes while the band played. When the starting gun fired, a roar went up that could be heard three valleys away.',
];

// ═══════════════════════════════════════════════════════════════════════════
// TEXT GENERATION
// ═══════════════════════════════════════════════════════════════════════════
const drillFromKeys = (keys, priorKeys, chunks) => {
  const parts = [];
  const all = [...keys, ...shuffle([...priorKeys]).slice(0, 4)];
  for (let i = 0; i < chunks; i++) {
    const mode = i % 3;
    if (mode === 0) {
      const k = pick(keys);
      parts.push(k.repeat(rand(2, 4)));
    } else if (mode === 1) {
      parts.push(Array.from({ length: rand(3, 5) }, () => pick(all)).join(''));
    } else {
      const a = pick(keys); const b = pick(all);
      parts.push((a + b).repeat(rand(2, 3)));
    }
  }
  return parts.join(' ');
};

const wordRun = (keySet, minChars) => {
  const bank = wordsForKeys(keySet);
  const safe = bank.length >= 8 ? bank : WORDS.slice(0, 60); // fallback (never expected)
  const out = [];
  let len = 0;
  while (len < minChars) {
    const w = pick(safe);
    if (out[out.length - 1] === w) continue;
    out.push(w);
    len += w.length + 1;
  }
  return out.join(' ');
};

const sentenceRun = (bank, minChars) => {
  const pool = shuffle(bank);
  const out = [];
  let len = 0; let i = 0;
  while (len < minChars) {
    const s = pool[i % pool.length];
    out.push(s);
    len += s.length + 1;
    i += 1;
  }
  return out.join(' ');
};

const sentenceBankForLesson = (lesson) => {
  switch (lesson.id) {
    case 't3.6': return SENTENCES_SIMPLE;
    case 't4.1': case 't4.2': return SENTENCES_CAPS;
    case 't4.3': return SENTENCES_APOS;
    case 't4.4': return SENTENCES_PUNCT;
    case 't4.7': case 't4.8': return [...SENTENCES_CAPS, ...SENTENCES_APOS, ...SENTENCES_PUNCT, ...SENTENCES_NUMBERS];
    case 't5.3': return SENTENCES_SPEED;
    case 't5.5': return SENTENCES_NUMBERS;
    case 't5.7': return [...SENTENCES_SPEED, ...SENTENCES_CAPS];
    default: return SENTENCES_SIMPLE;
  }
};

// Target text length by stage (characters)
const lessonLength = (stage, type) => {
  if (type === 'paragraph') return 240;
  const base = { 1: 90, 2: 110, 3: 130, 4: 140, 5: 170 }[stage] || 110;
  return base;
};

export const generateLessonText = (lessonId) => {
  const lesson = KQ_LESSON_MAP[lessonId];
  if (!lesson) return '';
  const keySet = keysUpTo(lessonId);
  const len = lessonLength(lesson.stage, lesson.type);

  if (lesson.type === 'keys') {
    const isNumbers = lesson.newKeys.every((k) => /[0-9]/.test(k));
    if (isNumbers) {
      const nums = lesson.newKeys;
      const parts = [];
      let total = 0;
      let i = 0;
      while (total < len) {
        const chunk = i % 2 === 0
          ? Array.from({ length: rand(3, 4) }, () => pick(nums)).join('')
          : `${pick(nums)}${pick(nums)} ${pick(nums)}`;
        parts.push(chunk);
        total += chunk.length + 1;
        i += 1;
      }
      return parts.join(' ');
    }
    const priorKeys = [...keySet].filter((k) => !lesson.newKeys.includes(k) && /[a-z;,./]/.test(k));
    const newLower = lesson.newKeys.map((k) => k.toLowerCase());
    const bank = wordsForKeys(keySet);
    const drillTarget = bank.length >= 5 ? Math.floor(len / 2) : len;
    let drills = drillFromKeys(newLower, priorKeys, 8);
    while (drills.length < drillTarget) drills += ' ' + drillFromKeys(newLower, priorKeys, 4);
    const words = bank.length >= 5 ? ' ' + wordRun(keySet, Math.max(30, len - drills.length)) : '';
    return (drills + words).slice(0, len + 30).trim();
  }

  if (lesson.type === 'words') return wordRun(keySet, len);
  if (lesson.type === 'sentences') return sentenceRun(sentenceBankForLesson(lesson), len);
  if (lesson.type === 'paragraph') return pick(PARAGRAPHS);
  // mixed: half drill-words, half words
  return `${wordRun(keySet, Math.floor(len / 2))} ${wordRun(keySet, Math.floor(len / 2))}`.slice(0, len + 20).trim();
};

// Belt test: longer text drawn from the whole stage
export const generateBeltTest = (stage) => {
  if (stage <= 2) {
    const lastLesson = getLessonsForStage(stage).slice(-1)[0];
    return wordRun(keysUpTo(lastLesson.id), 220);
  }
  if (stage === 3) return sentenceRun(SENTENCES_SIMPLE, 220);
  if (stage === 4) return sentenceRun([...SENTENCES_CAPS, ...SENTENCES_APOS, ...SENTENCES_PUNCT], 240);
  return pick(PARAGRAPHS) + ' ' + pick(SENTENCES_SPEED);
};

// ═══════════════════════════════════════════════════════════════════════════
// METRICS, STARS, BELTS
// ═══════════════════════════════════════════════════════════════════════════
// WPM = correct characters ÷ 5 ÷ minutes. Accuracy = 100 × (1 − errors/length).
export const calcWpm = (correctChars, seconds) =>
  seconds > 0 ? Math.round(((correctChars / 5) / (seconds / 60)) * 10) / 10 : 0;

export const calcAccuracy = (errors, totalChars) =>
  totalChars > 0 ? Math.max(0, Math.round((1 - errors / totalChars) * 1000) / 10) : 100;

// Stars: 1 = met stage targets, 2 = 1.4× WPM target, 3 = 1.9× WPM and +3% acc.
export const starsFor = (lesson, wpm, acc) => {
  const stage = KQ_STAGES[lesson.stage];
  const minAcc = lesson.minAcc || stage.targetAcc;
  if (acc < minAcc || wpm < stage.targetWpm) return 0;
  if (wpm >= stage.targetWpm * 1.9 && acc >= Math.min(99, minAcc + 3)) return 3;
  if (wpm >= stage.targetWpm * 1.4) return 2;
  return 1;
};

export const beltPassed = (stage, wpm, acc) =>
  wpm >= KQ_STAGES[stage].targetWpm && acc >= KQ_STAGES[stage].targetAcc;

export const lessonsPassedInStage = (progress, stage) =>
  getLessonsForStage(stage).filter((l) => progress?.completedLessons?.[l.id]?.passed).length;

export const stageComplete = (progress, stage) =>
  lessonsPassedInStage(progress, stage) === getLessonsForStage(stage).length &&
  !!progress?.belts?.[stage];

export const bestWpm = (progress) =>
  Math.max(0, ...Object.values(progress?.completedLessons || {}).map((r) => r?.bestWpm || 0),
    ...Object.values(progress?.belts || {}).map((b) => b?.wpm || 0));

export const avgAccuracy = (progress) => {
  const recs = Object.values(progress?.completedLessons || {}).filter((r) => r?.bestAcc);
  if (recs.length === 0) return null;
  return Math.round(recs.reduce((s, r) => s + r.bestAcc, 0) / recs.length * 10) / 10;
};

export const totalStars = (progress) =>
  Object.values(progress?.completedLessons || {}).reduce((s, r) => s + (r?.stars || 0), 0);

// ═══════════════════════════════════════════════════════════════════════════
// FINGER MAP (for the on-screen keyboard)
// ═══════════════════════════════════════════════════════════════════════════
export const FINGERS = {
  lp: { name: 'Left pinky', color: 'bg-rose-300', text: 'text-rose-800' },
  lr: { name: 'Left ring', color: 'bg-orange-300', text: 'text-orange-800' },
  lm: { name: 'Left middle', color: 'bg-amber-300', text: 'text-amber-800' },
  li: { name: 'Left index', color: 'bg-lime-300', text: 'text-lime-800' },
  ri: { name: 'Right index', color: 'bg-cyan-300', text: 'text-cyan-800' },
  rm: { name: 'Right middle', color: 'bg-sky-300', text: 'text-sky-800' },
  rr: { name: 'Right ring', color: 'bg-violet-300', text: 'text-violet-800' },
  rp: { name: 'Right pinky', color: 'bg-fuchsia-300', text: 'text-fuchsia-800' },
  th: { name: 'Thumb', color: 'bg-gray-300', text: 'text-gray-700' },
};

const FINGER_OF = {};
const assign = (keys, finger) => keys.split('').forEach((k) => { FINGER_OF[k] = finger; });
assign('qaz1', 'lp'); assign('wsx2', 'lr'); assign('edc3', 'lm'); assign('rfvtgb45', 'li');
assign('yhnujm67', 'ri'); assign('ik,8', 'rm'); assign('ol.9', 'rr'); assign("p;/'0", 'rp');
FINGER_OF[' '] = 'th';
export const fingerForKey = (ch) => FINGER_OF[(ch || '').toLowerCase()] || null;

// Keyboard layout rows for rendering (display char → shift pair where useful)
export const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

// Does typing this character require Shift?
export const needsShift = (ch) => /[A-Z?!"]/.test(ch);

// The physical lowercase key for any character
export const baseKeyFor = (ch) => {
  if (/[A-Z]/.test(ch)) return ch.toLowerCase();
  if (ch === '?') return '/';
  if (ch === '!') return '1';
  if (ch === '"') return "'";
  return ch;
};

// ═══════════════════════════════════════════════════════════════════════════
// REWARDS + DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════
export const KQ_REWARDS = {
  LESSON_XP: 5, LESSON_COINS: 1,
  THREE_STAR_XP: 3,            // bonus, first time a lesson hits 3 stars
  BELT_XP: 20, BELT_COINS: 4,
};

export const defaultKqProgress = () => ({
  completedLessons: {},
  belts: {},
  unlockedStage: 1,
  totalKeys: 0,
  totalSeconds: 0,
  lastPractice: null,
});
