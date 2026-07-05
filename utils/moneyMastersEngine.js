// utils/moneyMastersEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// MONEY MASTERS ENGINE — financial literacy curriculum for Classroom Champions
//
// Everything currency-related lives here: supported currencies, the 5-level
// lesson curriculum (Years 2–6), quiz question generators, boss challenges,
// answer checking, bank-simulation constants and savings goals.
//
// DATA CONTRACT (teacher side, stored in toolkitData.moneyMasters):
//   { settings: { currency: 'AUD' },
//     students: { [studentId]: { assignedLevel: 1..5, assignedAt } } }
//
// DATA CONTRACT (student record, studentData.moneyMastersProgress):
//   { completedLessons: { [lessonId]: { score, total, best, passed, timestamp } },
//     completedChallenges: { [level]: { score, total, passed, timestamp } },
//     unlockedLevel: 1..5,          // auto-advances past assignedLevel
//     bank: { balance, savings, lastInterest, transactions: [], goalsEarned: [] },
//     badges: [] }
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// CURRENCIES
// ═══════════════════════════════════════════════════════════════════════════
export const CURRENCIES = {
  AUD: {
    code: 'AUD', name: 'Australian Dollar', symbol: '$', flag: '🇦🇺',
    unit: 'dollar', unitPlural: 'dollars', sub: 'cents', subShort: 'c',
    coins: [
      { value: 0.05, label: '5c' }, { value: 0.1, label: '10c' },
      { value: 0.2, label: '20c' }, { value: 0.5, label: '50c' },
      { value: 1, label: '$1' }, { value: 2, label: '$2' },
    ],
    notes: [
      { value: 5, label: '$5' }, { value: 10, label: '$10' },
      { value: 20, label: '$20' }, { value: 50, label: '$50' }, { value: 100, label: '$100' },
    ],
  },
  GBP: {
    code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧',
    unit: 'pound', unitPlural: 'pounds', sub: 'pence', subShort: 'p',
    coins: [
      { value: 0.01, label: '1p' }, { value: 0.02, label: '2p' },
      { value: 0.05, label: '5p' }, { value: 0.1, label: '10p' },
      { value: 0.2, label: '20p' }, { value: 0.5, label: '50p' },
      { value: 1, label: '£1' }, { value: 2, label: '£2' },
    ],
    notes: [
      { value: 5, label: '£5' }, { value: 10, label: '£10' },
      { value: 20, label: '£20' }, { value: 50, label: '£50' },
    ],
  },
  USD: {
    code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸',
    unit: 'dollar', unitPlural: 'dollars', sub: 'cents', subShort: 'c',
    coins: [
      { value: 0.01, label: '1c (penny)' }, { value: 0.05, label: '5c (nickel)' },
      { value: 0.1, label: '10c (dime)' }, { value: 0.25, label: '25c (quarter)' },
    ],
    notes: [
      { value: 1, label: '$1' }, { value: 5, label: '$5' }, { value: 10, label: '$10' },
      { value: 20, label: '$20' }, { value: 50, label: '$50' }, { value: 100, label: '$100' },
    ],
  },
  NZD: {
    code: 'NZD', name: 'New Zealand Dollar', symbol: '$', flag: '🇳🇿',
    unit: 'dollar', unitPlural: 'dollars', sub: 'cents', subShort: 'c',
    coins: [
      { value: 0.1, label: '10c' }, { value: 0.2, label: '20c' }, { value: 0.5, label: '50c' },
      { value: 1, label: '$1' }, { value: 2, label: '$2' },
    ],
    notes: [
      { value: 5, label: '$5' }, { value: 10, label: '$10' },
      { value: 20, label: '$20' }, { value: 50, label: '$50' }, { value: 100, label: '$100' },
    ],
  },
  CAD: {
    code: 'CAD', name: 'Canadian Dollar', symbol: '$', flag: '🇨🇦',
    unit: 'dollar', unitPlural: 'dollars', sub: 'cents', subShort: 'c',
    coins: [
      { value: 0.05, label: '5c (nickel)' }, { value: 0.1, label: '10c (dime)' },
      { value: 0.25, label: '25c (quarter)' }, { value: 1, label: '$1 (loonie)' },
      { value: 2, label: '$2 (toonie)' },
    ],
    notes: [
      { value: 5, label: '$5' }, { value: 10, label: '$10' },
      { value: 20, label: '$20' }, { value: 50, label: '$50' }, { value: 100, label: '$100' },
    ],
  },
  EUR: {
    code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺',
    unit: 'euro', unitPlural: 'euros', sub: 'cents', subShort: 'c',
    coins: [
      { value: 0.05, label: '5c' }, { value: 0.1, label: '10c' },
      { value: 0.2, label: '20c' }, { value: 0.5, label: '50c' },
      { value: 1, label: '€1' }, { value: 2, label: '€2' },
    ],
    notes: [
      { value: 5, label: '€5' }, { value: 10, label: '€10' },
      { value: 20, label: '€20' }, { value: 50, label: '€50' }, { value: 100, label: '€100' },
    ],
  },
};

export const DEFAULT_CURRENCY = 'AUD';
export const getCurrency = (code) => CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];

// Format an amount in a currency. Amounts under 1 show as subunits (45c / 45p).
export const fmt = (amount, cur) => {
  const c = typeof cur === 'string' ? getCurrency(cur) : cur || CURRENCIES[DEFAULT_CURRENCY];
  const a = Math.round(amount * 100) / 100;
  if (a > 0 && a < 1) return `${Math.round(a * 100)}${c.subShort}`;
  const whole = Number.isInteger(a) ? String(a) : a.toFixed(2);
  return `${c.symbol}${whole}`;
};

// ═══════════════════════════════════════════════════════════════════════════
// RANDOM HELPERS
// ═══════════════════════════════════════════════════════════════════════════
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
const round2 = (n) => Math.round(n * 100) / 100;
// a "tidy" price: whole dollars or .50
const tidyPrice = (min, max) => round2(rand(min * 2, max * 2) / 2);

let qCounter = 0;
const numericQ = (question, answer, extra = {}) => ({
  uniqueId: `mmq_${Date.now()}_${qCounter++}`,
  type: 'numeric',
  question,
  answer: round2(answer),
  ...extra,
});
const mcQ = (question, correct, distractors, extra = {}) => {
  const options = shuffle([correct, ...distractors.filter((d) => d !== correct).slice(0, 3)]);
  return {
    uniqueId: `mmq_${Date.now()}_${qCounter++}`,
    type: 'mc',
    question,
    options,
    answer: correct,
    ...extra,
  };
};

const SHOP_ITEMS = [
  ['a toy car', '🚗'], ['a comic book', '📚'], ['a football', '⚽'], ['a skipping rope', '🪢'],
  ['a puzzle', '🧩'], ['an ice cream', '🍦'], ['a smoothie', '🥤'], ['a plant', '🪴'],
  ['a board game', '🎲'], ['some stickers', '✨'], ['a cap', '🧢'], ['a water bottle', '💧'],
  ['a sandwich', '🥪'], ['a kite', '🪁'], ['a torch', '🔦'], ['a yo-yo', '🪀'],
];
const NAMES = ['Mia', 'Leo', 'Ava', 'Noah', 'Zoe', 'Ethan', 'Ruby', 'Oscar', 'Isla', 'Max'];

// ═══════════════════════════════════════════════════════════════════════════
// LEVELS
// ═══════════════════════════════════════════════════════════════════════════
export const MM_LEVELS = {
  1: {
    id: 1, name: 'Coin Collector', icon: '🪙', years: 'Year 2',
    color: 'amber',
    description: 'Recognise coins and notes, count money, and work out if you have enough.',
  },
  2: {
    id: 2, name: 'Smart Shopper', icon: '🛒', years: 'Year 3',
    color: 'emerald',
    description: 'Make amounts different ways, give change, and compare prices like a pro.',
  },
  3: {
    id: 3, name: 'Budget Builder', icon: '📋', years: 'Year 4',
    color: 'sky',
    description: 'Tell needs from wants, build a budget, set saving goals, and spot the best deal.',
  },
  4: {
    id: 4, name: 'Money Manager', icon: '🏦', years: 'Year 5',
    color: 'violet',
    description: 'Earn income, calculate discounts, track a bank account, and understand interest.',
  },
  5: {
    id: 5, name: 'Finance Legend', icon: '💎', years: 'Year 6',
    color: 'rose',
    description: 'Master profit and loss, borrowing, exchange rates, and how to spot a scam.',
  },
};
export const MM_LEVEL_IDS = [1, 2, 3, 4, 5];

// ═══════════════════════════════════════════════════════════════════════════
// LESSONS — each has teaching cards (currency-aware) + question generators
// ═══════════════════════════════════════════════════════════════════════════
// gens: array of () functions (cur) => question. The quiz builder samples them.

const L = {}; // lesson registry

// ─── LEVEL 1: COIN COLLECTOR ────────────────────────────────────────────────
L['1.1'] = {
  id: '1.1', level: 1, name: 'Know Your Money', icon: '🔍',
  intro: 'Every country has its own money. Let’s get to know the coins and notes you’ll use every day!',
  cards: (c) => [
    {
      title: 'Coins and notes',
      text: `In ${c.name} money we use coins and notes. Coins are small amounts of metal money. Notes are worth more — they’re the paper (or plastic!) money.`,
      example: `Coins: ${c.coins.map((x) => x.label).join(', ')}. Notes: ${c.notes.map((x) => x.label).join(', ')}.`,
    },
    {
      title: `${c.unitPlural[0].toUpperCase() + c.unitPlural.slice(1)} and ${c.sub}`,
      text: `There are 100 ${c.sub} in one ${c.unit}. So ${fmt(1, c)} is the same as 100${c.subShort}, and ${fmt(2, c)} is the same as 200${c.subShort}.`,
      example: `${fmt(0.5, c)} + ${fmt(0.5, c)} = ${fmt(1, c)} — two halves make a whole ${c.unit}!`,
    },
    {
      title: 'Bigger isn’t always worth more',
      text: 'The size of a coin doesn’t tell you its value — you have to read the number on it. Some small coins are worth more than big ones!',
      example: `A ${c.coins[c.coins.length - 1].label} coin is worth more than a ${c.coins[0].label} coin, no matter their size.`,
    },
  ],
  tip: 'Line coins up from smallest value to largest to learn their order.',
  gens: [
    (c) => {
      const opts = shuffle([...c.coins, ...c.notes]).slice(0, 4);
      const max = opts.reduce((m, o) => (o.value > m.value ? o : m), opts[0]);
      return mcQ('Which of these is worth the MOST?', max.label, opts.map((o) => o.label));
    },
    (c) => {
      const opts = shuffle([...c.coins, ...c.notes]).slice(0, 4);
      const min = opts.reduce((m, o) => (o.value < m.value ? o : m), opts[0]);
      return mcQ('Which of these is worth the LEAST?', min.label, opts.map((o) => o.label));
    },
    (c) => numericQ(`How many ${c.sub} make ${fmt(1, c)}?`, 100),
    (c) => {
      const coin = pick(c.coins.filter((x) => x.value < 1));
      return numericQ(`How many ${c.sub} is a ${coin.label} coin worth?`, coin.value * 100);
    },
    (c) => {
      const n = rand(2, 5);
      return numericQ(`How many ${c.sub} make ${fmt(n, c)}?`, n * 100);
    },
    (c) => {
      const a = pick(c.coins);
      const b = pick(c.coins.filter((x) => x.value !== a.value));
      const bigger = a.value > b.value ? a : b;
      return mcQ(`Which coin is worth more: ${a.label} or ${b.label}?`, bigger.label, [a.label, b.label]);
    },
  ],
};

L['1.2'] = {
  id: '1.2', level: 1, name: 'Counting Coins', icon: '🧮',
  intro: 'Time to count! Adding coins together tells you how much money you really have.',
  cards: (c) => [
    {
      title: 'Start with the biggest',
      text: 'When counting a handful of coins, start with the biggest value and count down. It’s faster and you make fewer mistakes.',
      example: `${c.coins[c.coins.length - 1].label} + ${c.coins[c.coins.length - 2].label} first… then add the small coins.`,
    },
    {
      title: 'Skip counting',
      text: 'If you have lots of the same coin, skip count! Count by 5s, 10s or 20s instead of adding one at a time.',
      example: `Four ${fmt(0.5, c)} coins: ${Math.round(50)}${c.subShort}, 100${c.subShort}, 150${c.subShort}, 200${c.subShort} = ${fmt(2, c)}.`,
    },
    {
      title: 'Make friendly numbers',
      text: `Pair coins that make one whole ${c.unit} first. Whole ${c.unitPlural} are much easier to add up.`,
      example: `${fmt(0.5, c)} + ${fmt(0.5, c)} = ${fmt(1, c)} — pair them up, then count the rest.`,
    },
  ],
  tip: 'Sort coins into piles of the same type before counting.',
  gens: [
    (c) => {
      const coins = Array.from({ length: rand(3, 4) }, () => pick(c.coins));
      const total = round2(coins.reduce((s, x) => s + x.value, 0));
      return numericQ(`Add these coins: ${coins.map((x) => x.label).join(' + ')}. How much money is that? (${c.symbol})`, total, { money: true });
    },
    (c) => {
      const coin = pick(c.coins.filter((x) => x.value >= 0.1));
      const k = rand(3, 6);
      return numericQ(`You have ${k} coins that are each worth ${coin.label}. How much money do you have? (${c.symbol})`, round2(k * coin.value), { money: true });
    },
    (c) => {
      const target = rand(3, 10);
      const coin = c.coins.find((x) => x.value === 1) || c.notes[0];
      return numericQ(`How many ${coin.label} ${coin.value === 1 ? 'coins' : 'notes'} do you need to make ${fmt(target * coin.value, c)}?`, target);
    },
    (c) => {
      // biggest money piece: a $1/$2-style coin if the currency has one, else the smallest note
      const bigCoins = c.coins.filter((x) => x.value >= 1);
      const big = bigCoins.length > 0 ? pick(bigCoins) : c.notes[0];
      const small = pick(c.coins.filter((x) => x.value < 1));
      return numericQ(`What is ${big.label} + ${small.label}? (${c.symbol})`, round2(big.value + small.value), { money: true });
    },
  ],
};

L['1.3'] = {
  id: '1.3', level: 1, name: 'Notes & Totals', icon: '💵',
  intro: 'Notes are worth much more than coins. Let’s mix notes and coins together and find totals.',
  cards: (c) => [
    {
      title: 'Notes first, coins second',
      text: 'When you count mixed money, add the notes first (they’re worth the most), then add the coins on top.',
      example: `${c.notes[1].label} + ${c.notes[0].label} = ${fmt(c.notes[1].value + c.notes[0].value, c)}, then add your coins.`,
    },
    {
      title: 'Swapping money',
      text: 'The same amount of money can be made in different ways. A note can be swapped for lots of coins with the same total value!',
      example: `${c.notes[0].label} = ${c.notes[0].value} × ${fmt(1, c)} coins. Same value, different money!`,
    },
    {
      title: 'Reading amounts',
      text: `An amount like ${c.symbol}7.50 means 7 whole ${c.unitPlural} and 50 ${c.sub}. The dot separates ${c.unitPlural} from ${c.sub}.`,
      example: `${c.symbol}7.50 = ${fmt(5, c)} note + ${fmt(2, c)} + ${fmt(0.5, c)}.`,
    },
  ],
  tip: 'Check totals by counting twice — once up, once down.',
  gens: [
    (c) => {
      const notes = Array.from({ length: rand(2, 3) }, () => pick(c.notes.slice(0, 4)));
      const total = notes.reduce((s, x) => s + x.value, 0);
      return numericQ(`Add these notes: ${notes.map((x) => x.label).join(' + ')}. What is the total? (${c.symbol})`, total, { money: true });
    },
    (c) => {
      const note = pick(c.notes.slice(0, 3));
      const coins = Array.from({ length: 2 }, () => pick(c.coins));
      const total = round2(note.value + coins.reduce((s, x) => s + x.value, 0));
      return numericQ(`You have a ${note.label} note plus ${coins.map((x) => x.label).join(' and ')}. How much altogether? (${c.symbol})`, total, { money: true });
    },
    (c) => {
      const small = c.notes[0];
      const target = pick(c.notes.filter((x) => x.value > small.value && x.value % small.value === 0));
      return numericQ(`How many ${small.label} notes make ${target.label}?`, target.value / small.value);
    },
    (c) => {
      const oneCoin = c.coins.find((x) => x.value === 1);
      const note = pick(c.notes.slice(0, 2));
      if (!oneCoin) return numericQ(`How many ${c.sub} make ${note.label}?`, note.value * 100);
      return numericQ(`How many ${oneCoin.label} coins have the same value as a ${note.label} note?`, note.value);
    },
  ],
};

L['1.4'] = {
  id: '1.4', level: 1, name: 'Enough Money?', icon: '⚖️',
  intro: 'Before you buy something, you need to know: do I have enough? Let’s compare money with prices.',
  cards: (c) => [
    {
      title: 'Compare, then decide',
      text: 'If the price is LESS than or EQUAL to your money, you can buy it. If the price is MORE, you can’t — yet!',
      example: `You have ${fmt(6, c)}. A kite costs ${fmt(5, c)}. ${fmt(6, c)} > ${fmt(5, c)} — you can buy it!`,
    },
    {
      title: 'How much more do I need?',
      text: 'If you don’t have enough, subtract your money from the price to find out how much more you need to save.',
      example: `Price ${fmt(10, c)} − your ${fmt(7, c)} = ${fmt(3, c)} more needed.`,
    },
    {
      title: 'How much is left?',
      text: 'If you DO have enough, subtract the price from your money to see what you’ll have left after buying.',
      example: `Your ${fmt(8, c)} − price ${fmt(5, c)} = ${fmt(3, c)} left over.`,
    },
  ],
  tip: 'Always ask: more, less, or equal?',
  gens: [
    (c) => {
      const have = rand(3, 15);
      const cost = rand(3, 15);
      const [item, emoji] = pick(SHOP_ITEMS);
      return mcQ(
        `${emoji} You have ${fmt(have, c)}. ${item[0].toUpperCase() + item.slice(1)} costs ${fmt(cost, c)}. Do you have enough?`,
        have >= cost ? 'Yes' : 'No',
        ['Yes', 'No']
      );
    },
    (c) => {
      const cost = rand(8, 20);
      const have = cost - rand(2, 6);
      const [item, emoji] = pick(SHOP_ITEMS);
      return numericQ(`${emoji} You have ${fmt(have, c)} but ${item} costs ${fmt(cost, c)}. How much MORE do you need? (${c.symbol})`, cost - have, { money: true });
    },
    (c) => {
      const have = rand(10, 25);
      const cost = have - rand(2, 8);
      const [item, emoji] = pick(SHOP_ITEMS);
      return numericQ(`${emoji} You have ${fmt(have, c)} and buy ${item} for ${fmt(cost, c)}. How much do you have LEFT? (${c.symbol})`, have - cost, { money: true });
    },
    (c) => {
      const a = tidyPrice(2, 12);
      let b = tidyPrice(2, 12);
      if (b === a) b = round2(b + 0.5);
      return mcQ(`Which is more money: ${fmt(a, c)} or ${fmt(b, c)}?`, fmt(Math.max(a, b), c), [fmt(a, c), fmt(b, c)]);
    },
  ],
};

// ─── LEVEL 2: SMART SHOPPER ─────────────────────────────────────────────────
const fewestCoins = (amount, coins) => {
  // greedy works for all standard denominations included above
  let remaining = Math.round(amount * 100);
  let count = 0;
  const sorted = [...coins].sort((a, b) => b.value - a.value);
  for (const coin of sorted) {
    const v = Math.round(coin.value * 100);
    count += Math.floor(remaining / v);
    remaining %= v;
  }
  return remaining === 0 ? count : null;
};

L['2.1'] = {
  id: '2.1', level: 2, name: 'Making Amounts', icon: '🧩',
  intro: 'Any amount can be made with different mixes of coins. A Smart Shopper can make amounts the quick way — with the fewest coins!',
  cards: (c) => [
    {
      title: 'Many ways, same amount',
      text: `${fmt(1, c)} can be made with one coin, two coins, or a whole pile of small ones. The value is what matters, not how many coins.`,
      example: `${fmt(1, c)} = ${fmt(0.5, c)} + ${fmt(0.5, c)}, or lots of smaller coins that add to the same.`,
    },
    {
      title: 'Fewest coins trick',
      text: 'To use the fewest coins, always grab the biggest coin that fits, then the next biggest, until you reach the amount.',
      example: `To make ${fmt(3.5, c)}: take the biggest coins first, then fill the gap with smaller ones.`,
    },
    {
      title: 'Check your total',
      text: 'After choosing coins, add them back up to check they make exactly the right amount — not more, not less.',
    },
  ],
  tip: 'Biggest coin first — that’s the fewest-coins secret.',
  gens: [
    (c) => {
      const targets = [1.5, 2.5, 3, 3.5, 4, 4.5, 5.5, 6];
      const t = pick(targets);
      const count = fewestCoins(t, c.coins);
      if (count === null) return numericQ(`How many ${c.sub} make ${fmt(2, c)}?`, 200);
      return numericQ(`What is the FEWEST number of coins you need to make ${fmt(t, c)}?`, count);
    },
    (c) => {
      const usable = c.coins.filter((x) => x.value >= 0.1);
      const a = pick(usable); const b = pick(usable); const d = pick(usable);
      const total = round2(a.value + b.value + d.value);
      const wrong1 = fmt(round2(total + pick([0.1, 0.5, 1])), c);
      const wrong2 = fmt(round2(Math.max(0.1, total - 0.5)), c);
      return mcQ(`${a.label} + ${b.label} + ${d.label} makes exactly…`, fmt(total, c), [wrong1, wrong2, fmt(round2(total + 2), c)]);
    },
    (c) => {
      const coin = pick(c.coins.filter((x) => x.value >= 0.1 && x.value <= 0.5));
      const k = pick([4, 5, 6, 8, 10]);
      return numericQ(`How many ${coin.label} coins do you need to make ${fmt(round2(coin.value * k), c)}?`, k);
    },
  ],
};

L['2.2'] = {
  id: '2.2', level: 2, name: 'Giving Change', icon: '🔄',
  intro: 'When you pay with more money than the price, you get change back. Let’s make sure it’s always the RIGHT change!',
  cards: (c) => [
    {
      title: 'What is change?',
      text: 'Change = the money you paid MINUS the price. The shopkeeper gives back the difference.',
      example: `Pay with ${fmt(10, c)} for something that costs ${fmt(7, c)} → change is ${fmt(3, c)}.`,
    },
    {
      title: 'Count UP to find change',
      text: 'Shopkeepers count up from the price to the amount paid. It’s easier than subtracting!',
      example: `Price ${fmt(6.5, c)}, paid ${fmt(10, c)}: count ${fmt(0.5, c)} → ${fmt(7, c)}, then ${fmt(3, c)} → ${fmt(10, c)}. Change = ${fmt(3.5, c)}.`,
    },
    {
      title: 'Check your change',
      text: 'Always check: your change + the price should equal exactly what you handed over.',
    },
  ],
  tip: 'Count up from the price — like climbing stairs to the amount you paid.',
  gens: [
    (c) => {
      const note = pick(c.notes.slice(0, 3));
      const cost = tidyPrice(1, note.value - 1);
      const [item, emoji] = pick(SHOP_ITEMS);
      return numericQ(`${emoji} ${item[0].toUpperCase() + item.slice(1)} costs ${fmt(cost, c)}. You pay with a ${note.label} note. How much change do you get? (${c.symbol})`, round2(note.value - cost), { money: true });
    },
    (c) => {
      const note = pick(c.notes.slice(1, 4));
      const cost = rand(2, note.value - 2);
      return numericQ(`You pay ${fmt(note.value, c)} for a ${fmt(cost, c)} item. What is your change? (${c.symbol})`, note.value - cost, { money: true });
    },
    (c) => {
      const cost = tidyPrice(3, 9);
      const paid = 10;
      const correct = fmt(round2(paid - cost), c);
      return mcQ(`Price: ${fmt(cost, c)}. Paid: ${fmt(paid, c)}. Which is the correct change?`, correct,
        [fmt(round2(paid - cost + 1), c), fmt(round2(Math.max(0.5, paid - cost - 1)), c), fmt(round2(paid - cost + 0.5), c)]);
    },
  ],
};

L['2.3'] = {
  id: '2.3', level: 2, name: 'Comparing Prices', icon: '🏷️',
  intro: 'The same thing can cost different amounts in different shops. Smart Shoppers compare before they buy!',
  cards: (c) => [
    {
      title: 'Cheaper or dearer?',
      text: 'Compare prices digit by digit. The lower price is “cheaper”, the higher price is “dearer” (more expensive).',
      example: `${fmt(4.5, c)} is cheaper than ${fmt(5, c)} — you save ${fmt(0.5, c)} by choosing it.`,
    },
    {
      title: 'The difference is your saving',
      text: 'Subtract the cheaper price from the dearer price. That difference is how much you SAVE by shopping smart.',
      example: `${fmt(9, c)} − ${fmt(7.5, c)} = ${fmt(1.5, c)} saved!`,
    },
    {
      title: 'Price isn’t everything',
      text: 'Sometimes the cheaper item breaks quickly or is smaller. Compare the price AND what you get for it.',
    },
  ],
  tip: 'A minute of comparing can save you real money.',
  gens: [
    (c) => {
      const a = tidyPrice(3, 15);
      let b = tidyPrice(3, 15);
      if (b === a) b = round2(b + 1);
      const [item, emoji] = pick(SHOP_ITEMS);
      return mcQ(`${emoji} Shop A sells ${item} for ${fmt(a, c)}. Shop B sells it for ${fmt(b, c)}. Which shop is cheaper?`,
        a < b ? 'Shop A' : 'Shop B', ['Shop A', 'Shop B']);
    },
    (c) => {
      const a = tidyPrice(4, 18);
      const b = round2(a + tidyPrice(1, 5));
      return numericQ(`One store charges ${fmt(b, c)} and another charges ${fmt(a, c)} for the same game. What is the difference in price? (${c.symbol})`, round2(b - a), { money: true });
    },
    (c) => {
      const cheap = tidyPrice(5, 12);
      const dear = round2(cheap + tidyPrice(1, 4));
      const [item, emoji] = pick(SHOP_ITEMS);
      return numericQ(`${emoji} ${item[0].toUpperCase() + item.slice(1)} costs ${fmt(dear, c)} at the mall but ${fmt(cheap, c)} online. How much do you SAVE buying online? (${c.symbol})`, round2(dear - cheap), { money: true });
    },
  ],
};

L['2.4'] = {
  id: '2.4', level: 2, name: 'Shopping Trip', icon: '🛍️',
  intro: 'Time for a real shopping trip — add up a whole basket, pay, and check your change. Everything you’ve learned, together!',
  cards: (c) => [
    {
      title: 'Total the basket',
      text: 'Add every item’s price to find the basket total. Line the prices up and add carefully.',
      example: `${fmt(3.5, c)} + ${fmt(2, c)} + ${fmt(4.5, c)} = ${fmt(10, c)}.`,
    },
    {
      title: 'Estimate first',
      text: 'Before you pay, round each price to the nearest whole and add roughly. If the till says something wildly different — check!',
      example: `${fmt(3.9, c)} + ${fmt(6.1, c)} ≈ ${fmt(4, c)} + ${fmt(6, c)} = about ${fmt(10, c)}.`,
    },
    {
      title: 'Pay and check change',
      text: 'Choose a note big enough to cover the total, then check the change equals what you paid minus the total.',
    },
  ],
  tip: 'Estimate → total → pay → check change. That’s the shopper’s rhythm.',
  gens: [
    (c) => {
      const [i1, e1] = pick(SHOP_ITEMS);
      let [i2, e2] = pick(SHOP_ITEMS);
      const p1 = tidyPrice(2, 9); const p2 = tidyPrice(2, 9);
      return numericQ(`${e1}${e2} You buy ${i1} for ${fmt(p1, c)} and ${i2} for ${fmt(p2, c)}. What is the total? (${c.symbol})`, round2(p1 + p2), { money: true });
    },
    (c) => {
      const p1 = tidyPrice(2, 6); const p2 = tidyPrice(2, 6);
      const total = round2(p1 + p2);
      const note = c.notes.find((n) => n.value >= total + 1) || c.notes[c.notes.length - 1];
      return numericQ(`Your basket costs ${fmt(p1, c)} + ${fmt(p2, c)}. You pay with a ${note.label} note. How much change? (${c.symbol})`, round2(note.value - total), { money: true });
    },
    (c) => {
      const p1 = rand(2, 6); const p2 = rand(2, 6); const p3 = rand(1, 5);
      return numericQ(`Three items cost ${fmt(p1, c)}, ${fmt(p2, c)} and ${fmt(p3, c)}. What is the total? (${c.symbol})`, p1 + p2 + p3, { money: true });
    },
  ],
};

// ─── LEVEL 3: BUDGET BUILDER ────────────────────────────────────────────────
const NEEDS = ['fresh water', 'healthy food', 'a warm home', 'medicine when sick', 'clothes that fit', 'a safe place to sleep'];
const WANTS = ['a video game', 'designer sneakers', 'a chocolate bar', 'a new phone case', 'movie tickets', 'a fidget toy', 'branded headphones'];

L['3.1'] = {
  id: '3.1', level: 3, name: 'Needs vs Wants', icon: '🎯',
  intro: 'A NEED keeps you healthy and safe. A WANT is nice to have. Telling them apart is the first budgeting superpower.',
  cards: () => [
    {
      title: 'Needs come first',
      text: 'Needs are things you must have to live safely: food, water, shelter, clothing, health care. Budgets always cover needs first.',
      example: 'Food and a warm home are needs. A fifth pair of sneakers… probably not!',
    },
    {
      title: 'Wants are choices',
      text: 'Wants make life fun — games, treats, gadgets. Nothing wrong with wants! But they wait until needs are covered.',
      example: 'Movie tickets and chocolate are wants — great to enjoy AFTER the needs are sorted.',
    },
    {
      title: 'The tricky middle',
      text: 'Some things depend on the situation. Shoes are a need — but the most expensive brand is a want. Ask: what problem does this solve?',
    },
  ],
  tip: 'Before buying, ask: is this a need or a want?',
  gens: [
    () => {
      const need = pick(NEEDS);
      const wrong = shuffle(WANTS).slice(0, 3);
      return mcQ('Which of these is a NEED?', need, wrong);
    },
    () => {
      const want = pick(WANTS);
      const wrong = shuffle(NEEDS).slice(0, 3);
      return mcQ('Which of these is a WANT?', want, wrong);
    },
    () => mcQ('What should a good budget pay for FIRST?', 'Needs, like food and a safe home',
      ['Wants, like games and treats', 'Whatever is on sale', 'The most expensive thing']),
    () => {
      const item = pick([...NEEDS, ...WANTS]);
      const isNeed = NEEDS.includes(item);
      return mcQ(`Is "${item}" usually a need or a want?`, isNeed ? 'Need' : 'Want', ['Need', 'Want']);
    },
  ],
};

L['3.2'] = {
  id: '3.2', level: 3, name: 'Building a Budget', icon: '📋',
  intro: 'A budget is a plan for your money: what comes IN, what goes OUT, and what’s LEFT to save.',
  cards: (c) => [
    {
      title: 'Money in, money out',
      text: 'Income is money coming in (pocket money, jobs). Expenses are money going out (things you buy). A budget lists both.',
      example: `Income ${fmt(10, c)}/week. Expenses ${fmt(6, c)}. Left over: ${fmt(4, c)}.`,
    },
    {
      title: 'Leftover = savings power',
      text: 'Income − expenses = what’s left. If the answer is positive, you can save! If it’s negative, you’re spending more than you earn — time to adjust.',
      example: `${fmt(15, c)} in − ${fmt(12, c)} out = ${fmt(3, c)} saved each week.`,
    },
    {
      title: 'Track it',
      text: 'Write down what you spend for a week. Most people are surprised where their money actually goes!',
    },
  ],
  tip: 'A budget isn’t a cage — it’s a map that shows your money the way.',
  gens: [
    (c) => {
      const income = rand(10, 30);
      const spend = rand(4, income - 3);
      return numericQ(`Your income is ${fmt(income, c)} this week. You spend ${fmt(spend, c)}. How much is left? (${c.symbol})`, income - spend, { money: true });
    },
    (c) => {
      const budget = rand(15, 30);
      const spent = budget + pick([-5, -3, -2, 2, 3, 5]);
      return mcQ(`Your budget is ${fmt(budget, c)}. You spent ${fmt(spent, c)}. Are you over or under budget?`,
        spent > budget ? 'Over budget' : 'Under budget', ['Over budget', 'Under budget']);
    },
    (c) => {
      const income = rand(20, 40);
      const e1 = rand(3, 9); const e2 = rand(3, 9);
      return numericQ(`Income: ${fmt(income, c)}. Expenses: ${fmt(e1, c)} on snacks and ${fmt(e2, c)} on a book. How much can you save? (${c.symbol})`, income - e1 - e2, { money: true });
    },
    () => mcQ('What is an "expense"?', 'Money you spend',
      ['Money you earn', 'Money the bank gives you', 'A type of coin']),
  ],
};

L['3.3'] = {
  id: '3.3', level: 3, name: 'Saving Goals', icon: '🎯',
  intro: 'Saving gets easy when you have a goal. Pick a target, save a bit every week, and watch it grow!',
  cards: (c) => [
    {
      title: 'Set a clear goal',
      text: 'A good goal has a WHAT and a HOW MUCH. “Save for a skateboard that costs a set amount” beats “save some money”.',
      example: `Goal: skateboard ${fmt(60, c)}. Saving ${fmt(5, c)}/week → 12 weeks to go!`,
    },
    {
      title: 'Weeks to goal',
      text: 'Divide the goal by how much you save each week. That’s how many weeks until you get there. Round UP if it doesn’t divide evenly.',
      example: `${fmt(50, c)} goal ÷ ${fmt(10, c)}/week = 5 weeks.`,
    },
    {
      title: 'Pay yourself first',
      text: 'The moment money arrives, move your savings amount aside FIRST. What’s left is what you can spend guilt-free.',
    },
  ],
  tip: 'Small amounts, every week, beat big amounts “someday”.',
  gens: [
    (c) => {
      const perWeek = pick([2, 5, 10]);
      const weeks = rand(4, 12);
      const goal = perWeek * weeks;
      return numericQ(`You want to save ${fmt(goal, c)}. You save ${fmt(perWeek, c)} every week. How many WEEKS will it take?`, weeks);
    },
    (c) => {
      const perWeek = rand(3, 8);
      const weeks = rand(3, 8);
      return numericQ(`You save ${fmt(perWeek, c)} a week for ${weeks} weeks. How much have you saved? (${c.symbol})`, perWeek * weeks, { money: true });
    },
    (c) => {
      const goal = rand(30, 80);
      const have = rand(5, goal - 5);
      return numericQ(`Your goal is ${fmt(goal, c)} and you've saved ${fmt(have, c)} so far. How much more do you need? (${c.symbol})`, goal - have, { money: true });
    },
    () => mcQ('What does "pay yourself first" mean?', 'Put savings aside as soon as money arrives',
      ['Buy yourself a treat first', 'Spend it all, then save what’s left', 'Ask for more pocket money']),
  ],
};

L['3.4'] = {
  id: '3.4', level: 3, name: 'Smart Choices', icon: '🧠',
  intro: 'Bigger pack or single item? Sale or full price? Learn to find the BEST deal, not just the cheapest sticker.',
  cards: (c) => [
    {
      title: 'Unit price',
      text: 'To compare fairly, work out the price of ONE item (the unit price). Divide the pack price by how many you get.',
      example: `4 juices for ${fmt(8, c)} → ${fmt(2, c)} each. A single juice for ${fmt(2.5, c)}? The pack wins!`,
    },
    {
      title: 'Is the “deal” really a deal?',
      text: 'Shops use big red signs to make things FEEL cheap. Do the maths — sometimes the “special” costs more per item.',
      example: `“3 for ${fmt(9, c)}” is ${fmt(3, c)} each. If one costs ${fmt(2.8, c)} normally, the “deal” is worse!`,
    },
    {
      title: 'Only a bargain if you need it',
      text: 'Saving 50% on something you never use = wasting 100% of what you paid. The best deal is sometimes not buying at all.',
    },
  ],
  tip: 'Divide by the number of items — the unit price never lies.',
  gens: [
    (c) => {
      const each = pick([1.5, 2, 2.5, 3]);
      const k = pick([3, 4, 5]);
      const packPrice = round2(each * k);
      return numericQ(`A pack of ${k} costs ${fmt(packPrice, c)}. What is the price of ONE? (${c.symbol})`, each, { money: true });
    },
    (c) => {
      const k = pick([3, 4]);
      const each = pick([2, 2.5, 3]);
      const goodPack = round2(each * k - 1);
      const single = each;
      return mcQ(
        `A pack of ${k} costs ${fmt(goodPack, c)}. One on its own costs ${fmt(single, c)}. Which is the better deal per item?`,
        'The pack', ['The single item', 'They cost the same']
      );
    },
    (c) => {
      const each = pick([2, 3, 4]);
      const k = pick([2, 3]);
      const dealTotal = round2(each * k * 0.75);
      return numericQ(`Normally one costs ${fmt(each, c)}. The deal is "${k} for ${fmt(dealTotal, c)}". How much do you SAVE with the deal? (${c.symbol})`, round2(each * k - dealTotal), { money: true });
    },
    () => mcQ('A jacket you don’t need is 50% off. What’s the smartest thinking?',
      'Not buying it saves even more', ['A discount means you must buy it', 'Buy two since they’re cheap', 'Sales are always the best time to spend']),
  ],
};

// ─── LEVEL 4: MONEY MANAGER ─────────────────────────────────────────────────
L['4.1'] = {
  id: '4.1', level: 4, name: 'Earning Money', icon: '💼',
  intro: 'Money is earned by doing work others value. Let’s calculate wages and explore different ways people earn.',
  cards: (c) => [
    {
      title: 'Wages: pay per hour',
      text: 'Many jobs pay a rate per hour. Your pay = hours worked × hourly rate.',
      example: `5 hours × ${fmt(12, c)}/hour = ${fmt(60, c)}.`,
    },
    {
      title: 'Ways to earn',
      text: 'A wage is paid per hour. A salary is a fixed yearly amount. A business earns profit. Sellers can earn commission on what they sell.',
      example: 'Dog-walking pays a wage. A lemonade stand earns profit!',
    },
    {
      title: 'Earning as a kid',
      text: 'Chores, pet-sitting, car washing, selling crafts — small jobs teach big lessons. Every dollar you earn is a dollar you understand.',
    },
  ],
  tip: 'Hours × rate = pay. Learn it once, use it forever.',
  gens: [
    (c) => {
      const hours = rand(2, 8);
      const rate = rand(8, 20);
      return numericQ(`You work ${hours} hours at ${fmt(rate, c)} per hour. How much do you earn? (${c.symbol})`, hours * rate, { money: true });
    },
    (c) => {
      const weekly = rand(15, 40);
      const weeks = rand(2, 6);
      const name = pick(NAMES);
      return numericQ(`${name} earns ${fmt(weekly, c)} a week walking dogs. How much after ${weeks} weeks? (${c.symbol})`, weekly * weeks, { money: true });
    },
    (c) => {
      const pay = pick([40, 60, 80, 100]);
      const rate = pick([8, 10, 20]);
      if (pay % rate !== 0) return numericQ(`You work 4 hours at ${fmt(10, c)}/hour. How much do you earn? (${c.symbol})`, 40, { money: true });
      return numericQ(`You earned ${fmt(pay, c)} at ${fmt(rate, c)} per hour. How many HOURS did you work?`, pay / rate);
    },
    () => mcQ('What is a "salary"?', 'A fixed amount paid for a year of work',
      ['Pay for each hour worked', 'Money won in a competition', 'Interest from a bank']),
    () => mcQ('A lemonade stand keeps the money left after paying for lemons and cups. That money is called…',
      'Profit', ['Salary', 'Change', 'Interest']),
  ],
};

L['4.2'] = {
  id: '4.2', level: 4, name: 'Discounts & Percentages', icon: '🏷️',
  intro: '“25% OFF!” — but how much is that really? Percentages turn you into a discount detective.',
  cards: (c) => [
    {
      title: 'Percent = out of 100',
      text: '50% is half. 25% is a quarter. 10% is one tenth — just divide by 10. Every other percentage builds from these.',
      example: `10% of ${fmt(40, c)} = ${fmt(4, c)}. So 20% = ${fmt(8, c)}, and 5% = ${fmt(2, c)}.`,
    },
    {
      title: 'Discount amount',
      text: 'The discount is the percentage OF the price. That’s how much you don’t pay.',
      example: `25% off ${fmt(60, c)} → discount = ${fmt(15, c)}.`,
    },
    {
      title: 'Sale price',
      text: 'Sale price = original price − discount. Or think “you pay the rest”: 25% off means you pay 75%.',
      example: `${fmt(60, c)} − ${fmt(15, c)} = ${fmt(45, c)} sale price.`,
    },
  ],
  tip: 'Find 10% first (divide by 10) — then scale up or down.',
  gens: [
    (c) => {
      const price = pick([20, 30, 40, 50, 60, 80]);
      const pc = pick([10, 25, 50]);
      return numericQ(`A game costs ${fmt(price, c)}. It's ${pc}% off. How much is the DISCOUNT? (${c.symbol})`, (price * pc) / 100, { money: true });
    },
    (c) => {
      const price = pick([20, 40, 60, 80]);
      const pc = pick([10, 25, 50]);
      return numericQ(`Shoes cost ${fmt(price, c)} with ${pc}% off. What is the SALE PRICE? (${c.symbol})`, price - (price * pc) / 100, { money: true });
    },
    (c) => {
      const price = pick([30, 50, 70]);
      return numericQ(`What is 10% of ${fmt(price, c)}? (${c.symbol})`, price / 10, { money: true });
    },
    () => mcQ('“50% off” means the price is…', 'Halved', ['Doubled', 'Reduced by a tenth', 'Free']),
    (c) => {
      const a = pick([20, 40]);
      return mcQ(`Which discount saves you MORE on a ${fmt(a, c)} item?`, '50% off', ['10% off', '25% off', `${fmt(1, c)} off`]);
    },
  ],
};

L['4.3'] = {
  id: '4.3', level: 4, name: 'Bank Accounts', icon: '🏦',
  intro: 'A bank account keeps your money safe and keeps score for you. Deposits in, withdrawals out — the balance tells the story.',
  cards: (c) => [
    {
      title: 'Deposit, withdraw, balance',
      text: 'DEPOSIT = money in. WITHDRAWAL = money out. BALANCE = what’s in the account right now.',
      example: `Balance ${fmt(50, c)} + deposit ${fmt(20, c)} − withdrawal ${fmt(15, c)} = new balance ${fmt(55, c)}.`,
    },
    {
      title: 'Why banks are safer',
      text: 'Money in a bank can’t be lost down the couch, and a statement records every movement so you always know where it went.',
    },
    {
      title: 'Reading a statement',
      text: 'A statement is a list of every deposit and withdrawal in order. Check it — banks are careful, but YOU are the boss of your money.',
    },
  ],
  tip: 'Balance = old balance + everything in − everything out.',
  gens: [
    (c) => {
      const start = rand(20, 80);
      const dep = rand(5, 30);
      const wd = rand(5, Math.min(30, start));
      return numericQ(`Balance: ${fmt(start, c)}. You deposit ${fmt(dep, c)} then withdraw ${fmt(wd, c)}. New balance? (${c.symbol})`, start + dep - wd, { money: true });
    },
    (c) => {
      const start = rand(30, 90);
      const dep1 = rand(5, 20); const dep2 = rand(5, 20);
      return numericQ(`Balance: ${fmt(start, c)}. Two deposits arrive: ${fmt(dep1, c)} and ${fmt(dep2, c)}. New balance? (${c.symbol})`, start + dep1 + dep2, { money: true });
    },
    () => mcQ('Putting money INTO your bank account is called a…', 'Deposit', ['Withdrawal', 'Discount', 'Loan']),
    () => mcQ('What is your account "balance"?', 'The amount of money currently in the account',
      ['The money you owe the bank', 'The bank’s fee', 'Your weekly pocket money']),
    () => mcQ('What is a bank statement?', 'A record of all money in and out of your account',
      ['A promise to pay later', 'A type of savings goal', 'A cash machine']),
  ],
};

L['4.4'] = {
  id: '4.4', level: 4, name: 'Interest — Money That Grows', icon: '🌱',
  intro: 'Banks pay you a little extra for keeping savings with them. It’s called interest — money your money earns!',
  cards: (c) => [
    {
      title: 'What is interest?',
      text: 'Interest is a percentage of your savings that the bank ADDS to your account, usually every year. Your money grows while you sleep!',
      example: `${fmt(100, c)} at 5% interest → the bank adds ${fmt(5, c)} after a year.`,
    },
    {
      title: 'Calculating interest',
      text: 'Interest = savings × rate. A 10% rate on savings means divide by 10; 5% is half of that.',
      example: `${fmt(200, c)} at 10% = ${fmt(20, c)} interest. At 5% = ${fmt(10, c)}.`,
    },
    {
      title: 'The snowball',
      text: 'Next year you earn interest on your interest too. That’s compounding — a snowball that grows faster the longer it rolls.',
      example: `${fmt(100, c)} → ${fmt(110, c)} → ${fmt(121, c)} at 10%: the growth itself grows!`,
    },
  ],
  tip: 'Interest rewards patience. The earlier you save, the harder your money works.',
  gens: [
    (c) => {
      const savings = pick([100, 200, 300, 400]);
      const rate = pick([5, 10]);
      return numericQ(`You have ${fmt(savings, c)} saved at ${rate}% yearly interest. How much INTEREST do you earn in a year? (${c.symbol})`, (savings * rate) / 100, { money: true });
    },
    (c) => {
      const savings = pick([100, 200, 500]);
      const rate = pick([5, 10]);
      return numericQ(`${fmt(savings, c)} earns ${rate}% interest. What is the TOTAL in the account after the interest is added? (${c.symbol})`, savings + (savings * rate) / 100, { money: true });
    },
    () => mcQ('What is interest on savings?', 'Extra money the bank pays you for saving',
      ['A fee you pay the bank', 'Money you lost', 'A kind of coupon']),
    () => mcQ('Why does saving early help so much?', 'Interest earns interest, so money snowballs over time',
      ['Banks only accept young savers', 'Prices never change', 'Interest only happens once']),
  ],
};

// ─── LEVEL 5: FINANCE LEGEND ────────────────────────────────────────────────
L['5.1'] = {
  id: '5.1', level: 5, name: 'Profit & Loss', icon: '📈',
  intro: 'Every business asks one question: did we make more than we spent? Welcome to profit and loss.',
  cards: (c) => [
    {
      title: 'Profit = sell − cost',
      text: 'If you sell something for MORE than it cost you, the difference is profit. Sell for LESS and it’s a loss.',
      example: `Buy for ${fmt(6, c)}, sell for ${fmt(10, c)} → ${fmt(4, c)} profit.`,
    },
    {
      title: 'Count ALL the costs',
      text: 'A lemonade stand pays for lemons, sugar AND cups. Real profit only appears after every cost is subtracted.',
      example: `Sales ${fmt(30, c)} − ingredients ${fmt(12, c)} − cups ${fmt(3, c)} = ${fmt(15, c)} profit.`,
    },
    {
      title: 'Scale it up',
      text: 'Profit per item × items sold = total profit. Small profits on many sales add up fast.',
      example: `${fmt(2, c)} profit each × 20 sold = ${fmt(40, c)}.`,
    },
  ],
  tip: 'Sell price − ALL costs = the truth about your business.',
  gens: [
    (c) => {
      const cost = rand(4, 15);
      const sell = cost + rand(2, 10);
      return numericQ(`You buy a plant for ${fmt(cost, c)} and sell it for ${fmt(sell, c)}. What is your PROFIT? (${c.symbol})`, sell - cost, { money: true });
    },
    (c) => {
      const cost = rand(5, 20);
      const sell = cost + pick([-4, -3, -2, 2, 3, 5]);
      return mcQ(`Bought for ${fmt(cost, c)}, sold for ${fmt(sell, c)}. Profit or loss?`,
        sell > cost ? 'Profit' : 'Loss', ['Profit', 'Loss']);
    },
    (c) => {
      const each = rand(1, 4);
      const n = pick([5, 10, 20]);
      return numericQ(`You make ${fmt(each, c)} profit on each cookie and sell ${n} cookies. Total profit? (${c.symbol})`, each * n, { money: true });
    },
    (c) => {
      const sales = rand(25, 60);
      const c1 = rand(5, 12); const c2 = rand(2, 8);
      return numericQ(`Your stall takes ${fmt(sales, c)} in sales. Ingredients cost ${fmt(c1, c)} and supplies cost ${fmt(c2, c)}. What is the profit? (${c.symbol})`, sales - c1 - c2, { money: true });
    },
  ],
};

L['5.2'] = {
  id: '5.2', level: 5, name: 'Borrowing & Credit', icon: '💳',
  intro: 'Borrowed money must be paid back — plus extra. Understanding that "extra" is what separates legends from the rest.',
  cards: (c) => [
    {
      title: 'Loans cost money',
      text: 'When you borrow, you repay the loan PLUS interest. That interest is the price of using someone else’s money.',
      example: `Borrow ${fmt(100, c)}, repay ${fmt(110, c)} → the loan cost you ${fmt(10, c)}.`,
    },
    {
      title: 'Credit vs debit',
      text: 'A DEBIT card spends YOUR money from your account. A CREDIT card spends the BANK’s money — which you must pay back, with interest if you’re slow.',
      example: 'Debit = your money now. Credit = borrowed money, pay later (carefully!).',
    },
    {
      title: 'Good borrowing habits',
      text: 'Borrow only what you can repay, pay it back fast, and always know the total you’ll repay BEFORE you borrow.',
    },
  ],
  tip: 'Before borrowing, ask: what will this REALLY cost me in total?',
  gens: [
    (c) => {
      const loan = pick([50, 100, 200]);
      const extra = pick([5, 10, 20]);
      return numericQ(`You borrow ${fmt(loan, c)} and must repay ${fmt(loan + extra, c)}. How much did the loan COST you? (${c.symbol})`, extra, { money: true });
    },
    (c) => {
      const loan = pick([100, 200]);
      const rate = pick([5, 10]);
      return numericQ(`You borrow ${fmt(loan, c)} at ${rate}% interest. How much do you repay in TOTAL? (${c.symbol})`, loan + (loan * rate) / 100, { money: true });
    },
    () => mcQ('A DEBIT card spends…', 'Your own money from your account',
      ['The bank’s money that you repay later', 'Free money', 'Only coins']),
    () => mcQ('A CREDIT card spends…', 'Borrowed money you must pay back',
      ['Your own savings', 'Money that never needs repaying', 'Pocket money only']),
    () => mcQ('Why can credit cards be risky?', 'Unpaid balances grow with interest',
      ['They only work on weekends', 'They can’t buy groceries', 'They expire every week']),
  ],
};

L['5.3'] = {
  id: '5.3', level: 5, name: 'Exchange Rates', icon: '🌍',
  intro: 'Different countries use different money. Exchange rates tell you what your money is worth around the world!',
  cards: (c) => {
    const other = c.code === 'USD' ? CURRENCIES.GBP : CURRENCIES.USD;
    return [
      {
        title: 'What is an exchange rate?',
        text: `An exchange rate says how much of one currency you get for another. Rates change every day as countries trade.`,
        example: `If 1 ${c.code} = 2 ${other.code}, then ${fmt(10, c)} becomes ${other.symbol}20.`,
      },
      {
        title: 'Converting money',
        text: 'To convert, MULTIPLY your amount by the rate. Coming back the other way, you divide.',
        example: `Rate 1 ${c.code} = 3 ${other.code}: ${fmt(5, c)} × 3 = ${other.symbol}15.`,
      },
      {
        title: 'Why it matters',
        text: 'Travellers, online shoppers and businesses all convert money. A good rate means your money buys more overseas.',
      },
    ];
  },
  tip: 'Multiply to convert out, divide to convert back.',
  gens: [
    (c) => {
      const others = Object.values(CURRENCIES).filter((x) => x.code !== c.code);
      const other = pick(others);
      const rate = pick([2, 3, 4]);
      const amount = rand(3, 12);
      return numericQ(`The rate is 1 ${c.code} = ${rate} ${other.code}. How many ${other.code} do you get for ${fmt(amount, c)}?`, amount * rate);
    },
    (c) => {
      const others = Object.values(CURRENCIES).filter((x) => x.code !== c.code);
      const other = pick(others);
      const rate = pick([2, 4, 5]);
      const foreign = rate * rand(2, 8);
      return numericQ(`The rate is 1 ${c.code} = ${rate} ${other.code}. How many ${c.code} is ${other.symbol}${foreign} worth?`, foreign / rate);
    },
    () => mcQ('What is an exchange rate?', 'How much one currency is worth in another',
      ['The bank’s opening hours', 'A shop discount', 'The price of gold only']),
    (c) => {
      const others = Object.values(CURRENCIES).filter((x) => x.code !== c.code);
      const other = pick(others);
      return mcQ(`The rate moves from 1 ${c.code} = 2 ${other.code} to 1 ${c.code} = 3 ${other.code}. Your ${c.code} now buys…`,
        `MORE ${other.code}`, [`LESS ${other.code}`, 'Exactly the same', 'Nothing at all']);
    },
  ],
};

const SCAM_QS = [
  () => mcQ('You get a message: "You won a prize! Send a small fee to claim it." What should you do?',
    'Don’t pay — real prizes never ask for money first', ['Pay quickly before it expires', 'Send half the fee to be safe', 'Reply with your bank details']),
  () => mcQ('Who should you share your bank PIN with?', 'Nobody — not even friends',
    ['Anyone who asks nicely', 'People online who seem trustworthy', 'Whoever says they’re from the bank']),
  () => mcQ('An online deal looks WAY too good to be true. The golden rule says…',
    'It probably is — investigate before paying', ['Buy fast before it sells out', 'Too-good deals are always real', 'Pay with a gift card to be safe']),
  () => mcQ('A "bank" emails asking you to click a link and type your password. This is likely…',
    'Phishing — a scam fishing for your details', ['Normal bank business', 'A reward program', 'A software update']),
  () => mcQ('Why do scammers create urgency ("act NOW!")?', 'To stop you thinking carefully before paying',
    ['Because offers really do expire in minutes', 'To be helpful', 'Because banks require speed']),
  () => mcQ('A stranger online offers to double any money you send them. This is…',
    'A scam — money doesn’t double by magic', ['A great investment', 'How banks work', 'Safe if the website looks nice']),
  () => mcQ('What’s the safest response to a suspicious message about money?',
    'Stop, don’t click, and tell a trusted adult', ['Reply asking questions', 'Click the link to check', 'Forward it to friends']),
  () => mcQ('Someone asks you to pay for something using only gift cards. That’s…',
    'A classic scam warning sign', ['A normal way to pay bills', 'Safer than a bank card', 'Required by most shops']),
];

L['5.4'] = {
  id: '5.4', level: 5, name: 'Scam Spotters', icon: '🕵️',
  intro: 'Scammers try to trick people out of their money. Learn their tricks and you become very hard to fool.',
  cards: () => [
    {
      title: 'The big red flags',
      text: 'Urgency ("act NOW!"), secrets ("don’t tell anyone"), prizes you never entered, and requests for PINs, passwords or gift cards. One red flag = stop and think.',
      example: '"You won! Just pay a small fee…" — real prizes NEVER cost money to collect.',
    },
    {
      title: 'Phishing',
      text: 'Fake emails and texts pretend to be your bank or a game, hoping you’ll click and type your password. Real banks never ask for your password by message.',
      example: 'Check the sender address — "yourbank-security-team.xyz" is not your bank!',
    },
    {
      title: 'Your defence plan',
      text: 'Stop. Don’t click. Never share PINs or passwords. And always tell a trusted adult — scammers hate daylight.',
    },
  ],
  tip: 'If it’s urgent, secret, or too good to be true — it’s probably a scam.',
  gens: SCAM_QS,
};

export const MM_LESSONS = L;
export const getLessonsForLevel = (level) =>
  Object.values(MM_LESSONS).filter((l) => l.level === Number(level)).sort((a, b) => a.id.localeCompare(b.id));
export const getLesson = (lessonId) => MM_LESSONS[lessonId] || null;

// ═══════════════════════════════════════════════════════════════════════════
// QUIZ BUILDING
// ═══════════════════════════════════════════════════════════════════════════
export const QUIZ_LENGTH = 8;
export const QUIZ_PASS = 6;        // 6/8 = 75%
export const BOSS_LENGTH = 10;
export const BOSS_PASS = 8;        // 8/10

const buildUnique = (gens, cur, n) => {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < n && guard < 250) {
    guard += 1;
    const q = pick(gens)(cur);
    if (!q || seen.has(q.question)) continue;
    seen.add(q.question);
    out.push(q);
  }
  return out;
};

export const generateLessonQuiz = (lessonId, currencyCode, n = QUIZ_LENGTH) => {
  const lesson = getLesson(lessonId);
  if (!lesson) return [];
  return buildUnique(lesson.gens, getCurrency(currencyCode), n);
};

export const generateBossChallenge = (level, currencyCode, n = BOSS_LENGTH) => {
  const gens = getLessonsForLevel(level).flatMap((l) => l.gens);
  return buildUnique(gens, getCurrency(currencyCode), n);
};

// Accepts "4.5", "4.50", "$4.50", "£4.50", "45c" (as 45 when answer is 45), commas, spaces.
export const checkAnswer = (question, input) => {
  if (question.type === 'mc') return String(input) === String(question.answer);
  const cleaned = String(input).replace(/[^\d.-]/g, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return false;
  const val = parseFloat(cleaned);
  if (Number.isNaN(val)) return false;
  const ans = question.answer;
  if (Math.abs(val - ans) < 0.011) return true;
  // money answers under 1: accept subunit entry (e.g. typing 45 for 45c/0.45)
  if (question.money && ans > 0 && ans < 1 && Math.abs(val - ans * 100) < 0.011) return true;
  return false;
};

// ═══════════════════════════════════════════════════════════════════════════
// REWARDS, BANK SIM, BADGES
// ═══════════════════════════════════════════════════════════════════════════
export const MM_REWARDS = {
  LESSON_XP: 10, LESSON_COINS: 2,
  BOSS_XP: 25, BOSS_COINS: 5,
  LESSON_BANK: 25, BOSS_BANK: 75,   // Money Masters virtual dollars
};

export const BANK_INTEREST_RATE = 0.05;   // 5% per week on savings
export const BANK_INTEREST_MAX_WEEKS = 8; // cap per catch-up application
export const BANK_TX_LIMIT = 40;

export const SAVINGS_GOALS = [
  { id: 'goal_100', amount: 100, name: 'Century Saver', icon: '🥉' },
  { id: 'goal_250', amount: 250, name: 'Super Saver', icon: '🥈' },
  { id: 'goal_500', amount: 500, name: 'Vault Master', icon: '🥇' },
  { id: 'goal_1000', amount: 1000, name: 'Millionaire Mindset', icon: '💎' },
];

export const emptyBank = () => ({
  balance: 0,
  savings: 0,
  lastInterest: new Date().toISOString(),
  transactions: [],
  goalsEarned: [],
});

export const emptyProgress = () => ({
  completedLessons: {},
  completedChallenges: {},
  unlockedLevel: 1,
  bank: emptyBank(),
  badges: [],
});

// Apply weekly compound interest to savings for whole weeks elapsed. Pure fn.
export const applyWeeklyInterest = (bank, now = new Date()) => {
  const b = { ...emptyBank(), ...(bank || {}) };
  if (!b.savings || b.savings <= 0) return { bank: { ...b, lastInterest: now.toISOString() }, earned: 0 };
  const last = new Date(b.lastInterest || now.toISOString());
  const weeks = Math.min(
    BANK_INTEREST_MAX_WEEKS,
    Math.floor((now - last) / (7 * 24 * 60 * 60 * 1000))
  );
  if (weeks <= 0) return { bank: b, earned: 0 };
  let savings = b.savings;
  for (let i = 0; i < weeks; i++) savings = round2(savings * (1 + BANK_INTEREST_RATE));
  const earned = round2(savings - b.savings);
  const tx = {
    type: 'interest',
    amount: earned,
    desc: `Interest (${weeks} week${weeks !== 1 ? 's' : ''} at ${Math.round(BANK_INTEREST_RATE * 100)}%)`,
    ts: now.toISOString(),
  };
  return {
    bank: {
      ...b,
      savings,
      lastInterest: now.toISOString(),
      transactions: [tx, ...(b.transactions || [])].slice(0, BANK_TX_LIMIT),
    },
    earned,
  };
};

// Level completion check: all lessons passed + boss passed
export const isLevelComplete = (progress, level) => {
  const lessons = getLessonsForLevel(level);
  const allLessons = lessons.every((l) => progress?.completedLessons?.[l.id]?.passed);
  const boss = progress?.completedChallenges?.[level]?.passed;
  return allLessons && !!boss;
};

export const lessonsPassedInLevel = (progress, level) =>
  getLessonsForLevel(level).filter((l) => progress?.completedLessons?.[l.id]?.passed).length;

export const countTotalLessonsPassed = (progress) =>
  Object.values(progress?.completedLessons || {}).filter((x) => x?.passed).length;

export const TOTAL_LESSONS = Object.keys(MM_LESSONS).length; // 20 lessons across 5 levels
