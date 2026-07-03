// utils/mathMentalsEngine.js — Math Mentals question engine 🧮
// The single source of truth for the Math Mentals program: level metadata,
// all 80 sublevels, and a robust question generator that implements EVERY
// question type (the old inline generator only implemented 7 of 49 types and
// silently returned "2 + 2" for the rest).
//
// Used by:
//   • components/student/StudentMathMentals.js (daily mentals tests)
//   • components/games/MathGrandPrixGame.js   (racing game)
//
// API:
//   MATH_LEVELS                          — level metadata (name, colours, icon)
//   MATH_SUBLEVELS                       — { "1.1": { name, type, ... }, ... }
//   getSublevelsForLevel(1..4)           — sublevel ids for a whole level
//   generateQuestion(sublevelId, config?, seed?)
//        → { question, answer, display?, uniqueId, sublevelId, type }
//   generateQuestionSet(sublevelId, count) — unique questions, no repeats
//   checkAnswer(question, userInput)     — tolerant numeric comparison
//
// IMPORTANT: sublevel ids and names are unchanged from the original program so
// students' saved progress (e.g. currentLevel "2.14") keeps working.

// ── Level metadata ────────────────────────────────────────────────────────────
export const MATH_LEVELS = {
  1: {
    name: "Level 1 - Prep/Grade 1",
    description: "Basic number facts and counting (Ages 5-7)",
    color: "from-green-400 to-green-600",
    icon: "🌱"
  },
  2: {
    name: "Level 2 - Grade 1/2",
    description: "Early addition and subtraction (Ages 6-8)",
    color: "from-blue-400 to-blue-600",
    icon: "📚"
  },
  3: {
    name: "Level 3 - Grade 2/3",
    description: "Multiplication and division basics (Ages 7-9)",
    color: "from-purple-400 to-purple-600",
    icon: "🚀"
  },
  4: {
    name: "Level 4 - Grade 3/4",
    description: "Advanced number operations (Ages 8-10)",
    color: "from-red-400 to-red-600",
    icon: "⭐"
  }
};

// ── Sublevels (ids/names preserved from the original program) ────────────────
export const MATH_SUBLEVELS = {
  // LEVEL 1 - PREP/GRADE 1
  "1.1": { name: "Counting 0-5", type: "counting", max: 5 },
  "1.2": { name: "Counting 0-10", type: "counting", max: 10 },
  "1.3": { name: "Add 1", type: "add_one", max: 10 },
  "1.4": { name: "Subtract 1", type: "subtract_one", max: 10 },
  "1.5": { name: "Add 2", type: "add_two", max: 8 },
  "1.6": { name: "Number Before", type: "number_before", max: 10 },
  "1.7": { name: "Number After", type: "number_after", max: 9 },
  "1.8": { name: "Doubles to 5", type: "doubles", max: 5 },
  "1.9": { name: "Add to 5", type: "add_to_target", target: 5 },
  "1.10": { name: "Subtract from 5", type: "subtract_from_target", target: 5 },
  "1.11": { name: "Count by 2s", type: "skip_count", step: 2, max: 10 },
  "1.12": { name: "Add to 10", type: "add_to_target", target: 10 },
  "1.13": { name: "Subtract from 10", type: "subtract_from_target", target: 10 },
  "1.14": { name: "Doubles to 10", type: "doubles", max: 10 },
  "1.15": { name: "Which is More?", type: "compare", max: 10 },
  "1.16": { name: "Which is Less?", type: "compare_less", max: 10 },
  "1.17": { name: "Missing Numbers", type: "missing_number", max: 10 },
  "1.18": { name: "Count Forward 3", type: "count_forward", steps: 3, max: 7 },
  "1.19": { name: "Count Backward 3", type: "count_backward", steps: 3, max: 10 },
  "1.20": { name: "Mixed to 10", type: "mixed_basic", max: 10 },

  // LEVEL 2 - GRADE 1/2
  "2.1": { name: "Add to 15", type: "addition", max: 15 },
  "2.2": { name: "Subtract from 15", type: "subtraction", max: 15 },
  "2.3": { name: "Add to 20", type: "addition", max: 20 },
  "2.4": { name: "Subtract from 20", type: "subtraction", max: 20 },
  "2.5": { name: "Doubles to 20", type: "doubles", max: 20 },
  "2.6": { name: "Near Doubles", type: "near_doubles", max: 20 },
  "2.7": { name: "Count by 5s", type: "skip_count", step: 5, max: 50 },
  "2.8": { name: "Count by 10s", type: "skip_count", step: 10, max: 100 },
  "2.9": { name: "2 Times Table", type: "times_table", table: 2 },
  "2.10": { name: "5 Times Table", type: "times_table", table: 5 },
  "2.11": { name: "10 Times Table", type: "times_table", table: 10 },
  "2.12": { name: "Half of Even Numbers", type: "halving", max: 20 },
  "2.13": { name: "Add 10", type: "add_ten", max: 90 },
  "2.14": { name: "Subtract 10", type: "subtract_ten", max: 100 },
  "2.15": { name: "Bridging 10", type: "bridging_ten", max: 20 },
  "2.16": { name: "Teen Numbers", type: "teen_numbers", max: 19 },
  "2.17": { name: "Place Value Tens", type: "place_value_tens", max: 99 },
  "2.18": { name: "Round to 10", type: "rounding", target: 10 },
  "2.19": { name: "Mixed Addition 20", type: "mixed_addition", max: 20 },
  "2.20": { name: "Mixed Subtraction 20", type: "mixed_subtraction", max: 20 },

  // LEVEL 3 - GRADE 2/3
  "3.1": { name: "Add to 50", type: "addition", max: 50 },
  "3.2": { name: "Subtract from 50", type: "subtraction", max: 50 },
  "3.3": { name: "Add to 100", type: "addition", max: 100 },
  "3.4": { name: "Subtract from 100", type: "subtraction", max: 100 },
  "3.5": { name: "3 Times Table", type: "times_table", table: 3 },
  "3.6": { name: "4 Times Table", type: "times_table", table: 4 },
  "3.7": { name: "6 Times Table", type: "times_table", table: 6 },
  "3.8": { name: "7 Times Table", type: "times_table", table: 7 },
  "3.9": { name: "8 Times Table", type: "times_table", table: 8 },
  "3.10": { name: "9 Times Table", type: "times_table", table: 9 },
  "3.11": { name: "Division by 2", type: "division", table: 2 },
  "3.12": { name: "Division by 5", type: "division", table: 5 },
  "3.13": { name: "Division by 10", type: "division", table: 10 },
  "3.14": { name: "Mixed Times Tables", type: "mixed_tables", tables: [2, 3, 4, 5, 10] },
  "3.15": { name: "Add 3 Numbers", type: "add_three", max: 30 },
  "3.16": { name: "Round to 100", type: "rounding", target: 100 },
  "3.17": { name: "Place Value 100s", type: "place_value_hundreds", max: 999 },
  "3.18": { name: "Missing Addend", type: "missing_addend", max: 50 },
  "3.19": { name: "Fraction Halves", type: "fractions_half", max: 20 },
  "3.20": { name: "Mixed Operations 100", type: "mixed_all", max: 100 },

  // LEVEL 4 - GRADE 3/4
  "4.1": { name: "Add to 200", type: "addition", max: 200 },
  "4.2": { name: "Subtract from 200", type: "subtraction", max: 200 },
  "4.3": { name: "Add to 1000", type: "addition", max: 1000 },
  "4.4": { name: "Subtract from 1000", type: "subtraction", max: 1000 },
  "4.5": { name: "11 Times Table", type: "times_table", table: 11 },
  "4.6": { name: "12 Times Table", type: "times_table", table: 12 },
  "4.7": { name: "Mixed Division", type: "mixed_division", tables: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  "4.8": { name: "Multiply by 10", type: "multiply_ten", max: 99 },
  "4.9": { name: "Multiply by 100", type: "multiply_hundred", max: 99 },
  "4.10": { name: "Divide by 10", type: "divide_ten", max: 990 },
  "4.11": { name: "Decimals Add", type: "decimal_add", max: 10 },
  "4.12": { name: "Decimals Subtract", type: "decimal_subtract", max: 10 },
  "4.13": { name: "Fraction Quarters", type: "fractions_quarter", max: 40 },
  "4.14": { name: "Percentage 10s", type: "percentage_tens", max: 100 },
  "4.15": { name: "Square Numbers", type: "squares", max: 10 },
  "4.16": { name: "Double & Half", type: "double_half", max: 100 },
  "4.17": { name: "Add Hundreds", type: "add_hundreds", max: 900 },
  "4.18": { name: "Subtract Hundreds", type: "subtract_hundreds", max: 1000 },
  "4.19": { name: "Round to 1000", type: "rounding", target: 1000 },
  "4.20": { name: "Mixed Advanced", type: "mixed_advanced", max: 1000 }
};

export const getSublevelsForLevel = (level) =>
  Object.keys(MATH_SUBLEVELS).filter((id) => id.startsWith(`${level}.`));

// Correct numeric progression order: 1.1, 1.2, ... 1.20, 2.1, ... 4.20
// (a plain .sort() puts "1.10" before "1.2" — never use that for progression!)
export const SUBLEVEL_ORDER = Object.keys(MATH_SUBLEVELS).sort((a, b) => {
  const [aL, aS] = a.split(".").map(Number);
  const [bL, bS] = b.split(".").map(Number);
  return aL - bL || aS - bS;
});

export const getNextSublevel = (id) => {
  const i = SUBLEVEL_ORDER.indexOf(id);
  return i >= 0 && i < SUBLEVEL_ORDER.length - 1 ? SUBLEVEL_ORDER[i + 1] : null;
};

export const getPrevSublevel = (id) => {
  const i = SUBLEVEL_ORDER.indexOf(id);
  return i > 0 ? SUBLEVEL_ORDER[i - 1] : null;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const round1 = (n) => Math.round(n * 10) / 10;

// Every generator returns { question, answer, display? }.
// Answers are always numeric so students can type them on a number pad.
const GENERATORS = {
  // ── Counting & number order ─────────────────────────────────────────────
  counting: (c) => {
    const n = randomInt(1, c.max);
    return { question: "Count the dots:", answer: n, display: "• ".repeat(n).trim() };
  },
  number_before: (c) => {
    const n = randomInt(1, c.max);
    return { question: `What number comes just BEFORE ${n}?`, answer: n - 1 };
  },
  number_after: (c) => {
    const n = randomInt(0, c.max);
    return { question: `What number comes just AFTER ${n}?`, answer: n + 1 };
  },
  count_forward: (c) => {
    const start = randomInt(1, c.max);
    return { question: `Start at ${start} and count forward ${c.steps}. Where do you land?`, answer: start + c.steps };
  },
  count_backward: (c) => {
    const start = randomInt(c.steps + 1, c.max);
    return { question: `Start at ${start} and count backward ${c.steps}. Where do you land?`, answer: start - c.steps };
  },
  skip_count: (c) => {
    const kMax = Math.max(5, Math.floor(c.max / c.step));
    const start = randomInt(0, kMax) * c.step;
    const seq = [start, start + c.step, start + c.step * 2, start + c.step * 3];
    const blankPos = randomInt(1, 3); // hide one of the last three terms
    const answer = seq[blankPos];
    const shown = seq.map((n, i) => (i === blankPos ? "__" : n)).join(", ");
    return { question: `Counting by ${c.step}s — fill in the blank: ${shown}`, answer };
  },
  missing_number: (c) => {
    const mid = randomInt(1, c.max - 1);
    const blankPos = randomInt(0, 2);
    const seq = [mid - 1, mid, mid + 1];
    const answer = seq[blankPos];
    const shown = seq.map((n, i) => (i === blankPos ? "__" : n)).join(", ");
    return { question: `Fill in the missing number: ${shown}`, answer };
  },
  compare: (c) => {
    const a = randomInt(0, c.max);
    let b = randomInt(0, c.max);
    if (b === a) b = (b + 1 + randomInt(0, c.max - 1)) % (c.max + 1);
    return { question: `Which number is BIGGER: ${a} or ${b}?`, answer: Math.max(a, b) };
  },
  compare_less: (c) => {
    const a = randomInt(0, c.max);
    let b = randomInt(0, c.max);
    if (b === a) b = (b + 1 + randomInt(0, c.max - 1)) % (c.max + 1);
    return { question: `Which number is SMALLER: ${a} or ${b}?`, answer: Math.min(a, b) };
  },

  // ── Addition & subtraction ──────────────────────────────────────────────
  add_one: (c) => {
    const n = randomInt(0, c.max);
    return { question: `${n} + 1 = ?`, answer: n + 1 };
  },
  subtract_one: (c) => {
    const n = randomInt(1, c.max);
    return { question: `${n} - 1 = ?`, answer: n - 1 };
  },
  add_two: (c) => {
    const n = randomInt(0, c.max);
    return { question: `${n} + 2 = ?`, answer: n + 2 };
  },
  add_ten: (c) => {
    const n = randomInt(1, c.max);
    return { question: `${n} + 10 = ?`, answer: n + 10 };
  },
  subtract_ten: (c) => {
    const n = randomInt(10, c.max);
    return { question: `${n} - 10 = ?`, answer: n - 10 };
  },
  addition: (c) => {
    const a = randomInt(1, Math.max(1, c.max - 1));
    const b = randomInt(1, Math.max(1, c.max - a));
    return { question: `${a} + ${b} = ?`, answer: a + b };
  },
  subtraction: (c) => {
    const result = randomInt(0, c.max - 1);
    const taken = randomInt(1, c.max - result);
    return { question: `${result + taken} - ${taken} = ?`, answer: result };
  },
  add_three: (c) => {
    const a = randomInt(1, Math.max(1, Math.floor(c.max / 3)));
    const b = randomInt(1, Math.max(1, Math.floor(c.max / 3)));
    const cc = randomInt(1, Math.max(1, c.max - a - b));
    return { question: `${a} + ${b} + ${cc} = ?`, answer: a + b + cc };
  },
  add_to_target: (c) => {
    // Number bonds: a + ? = target
    const a = randomInt(0, c.target);
    return { question: `${a} + ? = ${c.target}`, answer: c.target - a };
  },
  subtract_from_target: (c) => {
    const a = randomInt(0, c.target);
    return { question: `${c.target} - ${a} = ?`, answer: c.target - a };
  },
  missing_addend: (c) => {
    const total = randomInt(2, c.max);
    const known = randomInt(1, total - 1);
    return { question: `${known} + ? = ${total}`, answer: total - known };
  },
  bridging_ten: (c) => {
    // Single-digit sums that cross over 10, e.g. 8 + 5
    const a = randomInt(5, 9);
    const b = randomInt(11 - a, Math.min(9, Math.max(11 - a, c.max - a)));
    return { question: `${a} + ${b} = ?`, answer: a + b };
  },
  teen_numbers: (c) => {
    const ones = randomInt(1, Math.min(9, c.max - 10));
    return Math.random() < 0.5
      ? { question: `10 + ${ones} = ?`, answer: 10 + ones }
      : { question: `1 ten and ${ones} ones make what number?`, answer: 10 + ones };
  },
  add_hundreds: (c) => {
    const a = randomInt(1, Math.max(1, Math.floor(c.max / 100) - 1)) * 100;
    const b = randomInt(1, Math.max(1, Math.floor((c.max - a) / 100))) * 100;
    return { question: `${a} + ${b} = ?`, answer: a + b };
  },
  subtract_hundreds: (c) => {
    const a = randomInt(2, Math.floor(c.max / 100)) * 100;
    const b = randomInt(1, a / 100 - 1) * 100;
    return { question: `${a} - ${b} = ?`, answer: a - b };
  },

  // ── Doubles, halves & near doubles ──────────────────────────────────────
  doubles: (c) => {
    const n = randomInt(1, c.max);
    return Math.random() < 0.5
      ? { question: `${n} + ${n} = ?`, answer: n * 2 }
      : { question: `Double ${n} = ?`, answer: n * 2 };
  },
  near_doubles: (c) => {
    const n = randomInt(1, Math.floor((c.max - 1) / 2));
    return { question: `${n} + ${n + 1} = ?`, answer: n * 2 + 1 };
  },
  halving: (c) => {
    const n = randomInt(1, Math.floor(c.max / 2)) * 2;
    return { question: `Half of ${n} = ?`, answer: n / 2 };
  },
  double_half: (c) => {
    if (Math.random() < 0.5) {
      const n = randomInt(1, Math.floor(c.max / 2));
      return { question: `Double ${n} = ?`, answer: n * 2 };
    }
    const n = randomInt(1, Math.floor(c.max / 2)) * 2;
    return { question: `Half of ${n} = ?`, answer: n / 2 };
  },

  // ── Multiplication & division ───────────────────────────────────────────
  times_table: (c) => {
    const m = randomInt(1, 12);
    return { question: `${m} × ${c.table} = ?`, answer: m * c.table };
  },
  division: (c) => {
    const q = randomInt(1, 12);
    return { question: `${q * c.table} ÷ ${c.table} = ?`, answer: q };
  },
  mixed_tables: (c) => {
    const table = pick(c.tables);
    const m = randomInt(1, 12);
    return { question: `${m} × ${table} = ?`, answer: m * table };
  },
  mixed_division: (c) => {
    const table = pick(c.tables);
    const q = randomInt(1, 12);
    return { question: `${q * table} ÷ ${table} = ?`, answer: q };
  },
  multiply_ten: (c) => {
    const n = randomInt(1, c.max);
    return { question: `${n} × 10 = ?`, answer: n * 10 };
  },
  multiply_hundred: (c) => {
    const n = randomInt(1, c.max);
    return { question: `${n} × 100 = ?`, answer: n * 100 };
  },
  divide_ten: (c) => {
    const n = randomInt(1, Math.floor(c.max / 10)) * 10;
    return { question: `${n} ÷ 10 = ?`, answer: n / 10 };
  },
  squares: (c) => {
    const n = randomInt(1, c.max);
    return Math.random() < 0.5
      ? { question: `${n} × ${n} = ?`, answer: n * n }
      : { question: `What is ${n} squared?`, answer: n * n };
  },

  // ── Place value & rounding ──────────────────────────────────────────────
  place_value_tens: (c) => {
    const n = randomInt(10, c.max);
    const tens = Math.floor(n / 10) % 10;
    return Math.random() < 0.5
      ? { question: `What digit is in the TENS place of ${n}?`, answer: tens }
      : { question: `How many tens are in ${n}?`, answer: Math.floor(n / 10) };
  },
  place_value_hundreds: (c) => {
    const n = randomInt(100, c.max);
    const hundreds = Math.floor(n / 100) % 10;
    return Math.random() < 0.5
      ? { question: `What digit is in the HUNDREDS place of ${n}?`, answer: hundreds }
      : { question: `How many hundreds are in ${n}?`, answer: Math.floor(n / 100) };
  },
  rounding: (c) => {
    const t = c.target;
    let n = randomInt(t + 1, t * 10 - 1);
    if (n % t === 0) n += randomInt(1, t - 1);
    return { question: `Round ${n} to the nearest ${t}:`, answer: Math.round(n / t) * t };
  },

  // ── Fractions, decimals & percentages ───────────────────────────────────
  fractions_half: (c) => {
    const n = randomInt(1, Math.floor(c.max / 2)) * 2;
    return { question: `What is ½ of ${n}?`, answer: n / 2 };
  },
  fractions_quarter: (c) => {
    const n = randomInt(1, Math.floor(c.max / 4)) * 4;
    return { question: `What is ¼ of ${n}?`, answer: n / 4 };
  },
  decimal_add: (c) => {
    const a = randomInt(1, c.max * 10 - 11) / 10;
    const b = randomInt(1, c.max * 10 - Math.round(a * 10)) / 10;
    return { question: `${a} + ${b} = ?`, answer: round1(a + b) };
  },
  decimal_subtract: (c) => {
    const a = randomInt(11, c.max * 10) / 10;
    const b = randomInt(1, Math.round(a * 10) - 1) / 10;
    return { question: `${a} - ${b} = ?`, answer: round1(a - b) };
  },
  percentage_tens: (c) => {
    const pct = randomInt(1, 10) * 10;
    const n = randomInt(1, Math.floor(c.max / 10)) * 10;
    return { question: `What is ${pct}% of ${n}?`, answer: (pct / 100) * n };
  },

  // ── Mixed reviews ───────────────────────────────────────────────────────
  mixed_basic: (c) => pick([
    GENERATORS.add_one, GENERATORS.subtract_one, GENERATORS.add_two, GENERATORS.addition,
  ])(c),
  mixed_addition: (c) => pick([GENERATORS.addition, GENERATORS.missing_addend])({ ...c, max: c.max }),
  mixed_subtraction: (c) => GENERATORS.subtraction(c),
  mixed_all: (c) => pick([
    () => GENERATORS.addition(c),
    () => GENERATORS.subtraction(c),
    () => GENERATORS.mixed_tables({ tables: [2, 3, 4, 5, 10] }),
  ])(),
  mixed_advanced: (c) => pick([
    () => GENERATORS.addition(c),
    () => GENERATORS.subtraction(c),
    () => GENERATORS.mixed_tables({ tables: [3, 4, 6, 7, 8, 9, 11, 12] }),
    () => GENERATORS.mixed_division({ tables: [3, 4, 6, 7, 8, 9] }),
    () => GENERATORS.multiply_ten({ max: 99 }),
    () => GENERATORS.squares({ max: 12 }),
  ])(),
};

// ── Public API ────────────────────────────────────────────────────────────────
export const generateQuestion = (sublevelId, config = null, seed = 0) => {
  const cfg = config || MATH_SUBLEVELS[sublevelId];
  const gen = cfg && GENERATORS[cfg.type];
  let q;
  if (gen) {
    q = gen(cfg);
  } else {
    // Unknown type: still produce a real, varied question (never a constant!)
    console.warn(`mathMentalsEngine: unknown question type "${cfg?.type}" for sublevel "${sublevelId}"`);
    const a = randomInt(2, 15);
    const b = randomInt(2, 15);
    q = { question: `${a} + ${b} = ?`, answer: a + b };
  }
  return {
    ...q,
    sublevelId,
    type: cfg?.type || "unknown",
    uniqueId: `${cfg?.type || "q"}_${seed}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
};

// Generate `count` questions with no duplicates (falls back gracefully for
// tiny question spaces like "Counting 0-5").
export const generateQuestionSet = (sublevelId, count = 10) => {
  const questions = [];
  const seen = new Set();
  let attempts = 0;
  while (questions.length < count && attempts < count * 25) {
    attempts += 1;
    const q = generateQuestion(sublevelId, null, attempts);
    const key = `${q.question}|${q.display || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      questions.push(q);
    }
  }
  // tiny question spaces: allow repeats rather than returning fewer questions
  while (questions.length < count) {
    questions.push(generateQuestion(sublevelId, null, attempts + questions.length));
  }
  return questions;
};

export const checkAnswer = (question, userInput) => {
  if (question == null || userInput == null) return false;
  const expected = Number(question.answer);
  const given = Number(String(userInput).trim().replace(",", "."));
  if (Number.isNaN(expected) || Number.isNaN(given)) return false;
  return Math.abs(expected - given) < 1e-9;
};

const mathMentalsEngine = {
  MATH_LEVELS,
  MATH_SUBLEVELS,
  getSublevelsForLevel,
  generateQuestion,
  generateQuestionSet,
  checkAnswer,
};

export default mathMentalsEngine;
