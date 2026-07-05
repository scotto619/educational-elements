// components/games/SweetEmpire/sweetEmpireConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// SWEET EMPIRE — pure configuration + shared styling exports.
//
// This file is imported by:
//   • SweetEmpireGame.js        (the game itself)
//   • components/tabs/StudentsTab.js      (teacher-side card theming)
//   • components/student/StudentDashboard.js (student-portal theming)
// so every profile theme/title/effect is defined in exactly one place.
//
// DATA CONTRACT (studentData.sweetEmpireData):
//   { sweets, runSweets, lifetimeSweets, clicks, goldenClicks,
//     buildings: {id:count}, upgrades: [ids], achievements: [ids],
//     sugarStars, starUpgrades: [ids], rebirths,
//     unlockedThemes/Titles/Effects: [ids],
//     activeTheme, activeTitle, activeEffect,   ← read by profile pages
//     lastSeen, lastSaved }
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// NUMBER FORMATTING
// ═══════════════════════════════════════════════════════════════════════════
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
export const fmtNum = (n) => {
  if (!Number.isFinite(n)) return '∞';
  if (n < 0) return '-' + fmtNum(-n);
  if (n < 1000) return n < 10 && n % 1 !== 0 ? n.toFixed(1) : Math.floor(n).toString();
  let tier = Math.floor(Math.log10(n) / 3);
  if (tier >= SUFFIXES.length) tier = SUFFIXES.length - 1;
  const scaled = n / Math.pow(10, tier * 3);
  return `${scaled >= 100 ? Math.floor(scaled) : scaled.toFixed(scaled >= 10 ? 1 : 2)}${SUFFIXES[tier]}`;
};

// ═══════════════════════════════════════════════════════════════════════════
// BUILDINGS — the production ladder (costs grow 1.15× per copy)
// ═══════════════════════════════════════════════════════════════════════════
export const COST_GROWTH = 1.15;

export const BUILDINGS = [
  { id: 'whisk',      name: 'Auto-Whisk',            icon: '🥄', baseCost: 15,      sps: 0.1,     desc: 'A tireless whisk that stirs up sweets all by itself.' },
  { id: 'oven',       name: "Grandma's Oven",        icon: '👵', baseCost: 100,     sps: 1,       desc: 'Grandma bakes around the clock. She insists.' },
  { id: 'stand',      name: 'Cupcake Stand',         icon: '🧁', baseCost: 1100,    sps: 8,       desc: 'A charming street stand selling cupcakes by the tray.' },
  { id: 'bakery',     name: 'Bakery',                icon: '🥐', baseCost: 12000,   sps: 47,      desc: 'A full bakery with ovens roaring day and night.' },
  { id: 'chocmine',   name: 'Chocolate Mine',        icon: '⛏️', baseCost: 130000,  sps: 260,     desc: 'Dig deep — the chocolate veins run rich down there.' },
  { id: 'candyfarm',  name: 'Candy Cane Farm',       icon: '🍬', baseCost: 1.4e6,   sps: 1400,    desc: 'Rows of candy canes swaying in a minty breeze.' },
  { id: 'icecream',   name: 'Ice Cream Glacier',     icon: '🍨', baseCost: 2e7,     sps: 7800,    desc: 'Harvest scoops straight from the neapolitan ice shelf.' },
  { id: 'refinery',   name: 'Sugar Refinery',        icon: '🏭', baseCost: 3.3e8,   sps: 44000,   desc: 'Industrial-grade sweetness, refined to perfection.' },
  { id: 'reactor',    name: 'Caramel Reactor',       icon: '⚗️', baseCost: 5.1e9,   sps: 260000,  desc: 'Molten caramel fusion. Do not lick the core.' },
  { id: 'gingercity', name: 'Gingerbread City',      icon: '🏰', baseCost: 7.5e10,  sps: 1.6e6,   desc: 'An entire metropolis of gingerbread citizens, all baking.' },
  { id: 'portal',     name: 'Dessert Dimension',     icon: '🌀', baseCost: 1e12,    sps: 1e7,     desc: 'A portal to a universe made entirely of dessert.' },
  { id: 'cosmic',     name: 'Cosmic Confectionery',  icon: '🌌', baseCost: 1.4e13,  sps: 6.5e7,   desc: 'Galaxies swirled like soft-serve. The final frontier of flavour.' },
];
export const BUILDING_MAP = Object.fromEntries(BUILDINGS.map((b) => [b.id, b]));

export const buildingCost = (building, owned) =>
  Math.ceil(building.baseCost * Math.pow(COST_GROWTH, owned));

export const bulkBuildingCost = (building, owned, count) => {
  let total = 0;
  for (let i = 0; i < count; i++) total += buildingCost(building, owned + i);
  return total;
};

// ═══════════════════════════════════════════════════════════════════════════
// UPGRADES
// ═══════════════════════════════════════════════════════════════════════════
// Building upgrades: auto-generated — at 10 / 25 / 50 / 100 / 200 owned,
// an upgrade appears that DOUBLES that building's output.
const BUILDING_UPGRADE_TIERS = [
  { at: 10,  costMult: 10,   adj: 'Improved' },
  { at: 25,  costMult: 50,   adj: 'Turbo' },
  { at: 50,  costMult: 500,  adj: 'Deluxe' },
  { at: 100, costMult: 5000, adj: 'Quantum' },
  { at: 200, costMult: 50000, adj: 'Transcendent' },
];

const buildingUpgrades = BUILDINGS.flatMap((b) =>
  BUILDING_UPGRADE_TIERS.map((tier, i) => ({
    id: `bu_${b.id}_${i}`,
    name: `${tier.adj} ${b.name}`,
    icon: b.icon,
    desc: `${b.name} output ×2. (Requires ${tier.at} owned)`,
    cost: b.baseCost * tier.costMult,
    type: 'building',
    target: b.id,
    mult: 2,
    unlock: (gs) => (gs.buildings[b.id] || 0) >= tier.at,
  }))
);

// Click upgrades: multiply sweets-per-click, plus "sticky fingers" upgrades
// that add a % of SPS to every click (this keeps clicking relevant forever).
const clickUpgrades = [
  { id: 'cu_0', name: 'Buttered Fingers',   icon: '👆', desc: 'Clicking power ×2.',                        cost: 100,    type: 'click', mult: 2,  unlock: (gs) => gs.clicks >= 25 },
  { id: 'cu_1', name: 'Sugar-Dusted Gloves', icon: '🧤', desc: 'Clicking power ×2.',                       cost: 2500,   type: 'click', mult: 2,  unlock: (gs) => gs.clicks >= 200 },
  { id: 'cu_2', name: 'Caramel Knuckles',   icon: '✊', desc: 'Clicking power ×3.',                        cost: 50000,  type: 'click', mult: 3,  unlock: (gs) => gs.clicks >= 1000 },
  { id: 'cu_3', name: 'Rolling Pin Arms',   icon: '💪', desc: 'Clicking power ×3.',                        cost: 1e6,    type: 'click', mult: 3,  unlock: (gs) => gs.clicks >= 3000 },
  { id: 'cu_4', name: 'Piping Bag Cannon',  icon: '🎂', desc: 'Clicking power ×5.',                        cost: 5e7,    type: 'click', mult: 5,  unlock: (gs) => gs.clicks >= 8000 },
  { id: 'cu_5', name: 'The Midas Mitt',     icon: '🥇', desc: 'Clicking power ×10.',                       cost: 5e9,    type: 'click', mult: 10, unlock: (gs) => gs.clicks >= 20000 },
  { id: 'sf_0', name: 'Sticky Fingers',     icon: '🍯', desc: 'Each click also earns 1% of your SPS.',     cost: 500000, type: 'clickSps', value: 0.01, unlock: (gs) => gs.clicks >= 2000 },
  { id: 'sf_1', name: 'Stickier Fingers',   icon: '🍯', desc: 'Each click also earns +2% of your SPS.',    cost: 5e7,    type: 'clickSps', value: 0.02, unlock: (gs) => gs.upgrades.includes('sf_0') },
  { id: 'sf_2', name: 'Honey-Glazed Hands', icon: '🐝', desc: 'Each click also earns +3% of your SPS.',    cost: 5e9,    type: 'clickSps', value: 0.03, unlock: (gs) => gs.upgrades.includes('sf_1') },
  { id: 'sf_3', name: 'The Syrup Touch',    icon: '🌊', desc: 'Each click also earns +4% of your SPS.',    cost: 5e11,   type: 'clickSps', value: 0.04, unlock: (gs) => gs.upgrades.includes('sf_2') },
];

// Global upgrades: multiply EVERYTHING.
const globalUpgrades = [
  { id: 'gu_0', name: 'Secret Family Recipe', icon: '📜', desc: 'All production ×1.5.',  cost: 1e6,  type: 'global', mult: 1.5, unlock: (gs) => gs.runSweets >= 500000 },
  { id: 'gu_1', name: 'Vanilla Essence',      icon: '🌼', desc: 'All production ×1.5.',  cost: 1e8,  type: 'global', mult: 1.5, unlock: (gs) => gs.runSweets >= 5e7 },
  { id: 'gu_2', name: 'Royal Warrant',        icon: '👑', desc: 'All production ×2.',    cost: 1e10, type: 'global', mult: 2,   unlock: (gs) => gs.runSweets >= 5e9 },
  { id: 'gu_3', name: 'Michelin Star',        icon: '⭐', desc: 'All production ×2.',    cost: 1e12, type: 'global', mult: 2,   unlock: (gs) => gs.runSweets >= 5e11 },
  { id: 'gu_4', name: 'Flavour Singularity',  icon: '🕳️', desc: 'All production ×3.',    cost: 1e15, type: 'global', mult: 3,   unlock: (gs) => gs.runSweets >= 5e14 },
];

// Golden cookie upgrades
const goldenUpgrades = [
  { id: 'gc_0', name: 'Lucky Sprinkles',  icon: '✨', desc: 'Golden cookies appear 25% more often.',      cost: 1e7,  type: 'goldenFreq', value: 0.25, unlock: (gs) => gs.goldenClicks >= 5 },
  { id: 'gc_1', name: 'Four-Leaf Cocoa',  icon: '🍀', desc: 'Golden cookies appear 25% more often.',      cost: 1e9,  type: 'goldenFreq', value: 0.25, unlock: (gs) => gs.goldenClicks >= 20 },
  { id: 'gc_2', name: 'Golden Rolling Pin', icon: '🌟', desc: 'Golden cookie effects last 50% longer.',   cost: 1e11, type: 'goldenDur',  value: 0.5,  unlock: (gs) => gs.goldenClicks >= 50 },
];

export const UPGRADES = [...buildingUpgrades, ...clickUpgrades, ...globalUpgrades, ...goldenUpgrades];
export const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

// ═══════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS — each one earned grants +1% to all production, forever
// ═══════════════════════════════════════════════════════════════════════════
const sweetAch = (id, name, icon, amount) =>
  ({ id, name, icon, desc: `Bake ${fmtNum(amount)} sweets in one run.`, check: (gs) => gs.runSweets >= amount });
const clickAch = (id, name, icon, amount) =>
  ({ id, name, icon, desc: `Click the cookie ${fmtNum(amount)} times.`, check: (gs) => gs.clicks >= amount });
const bldAch = (id, name, icon, buildingId, amount) =>
  ({ id, name, icon, desc: `Own ${amount} ${BUILDING_MAP[buildingId].name}${amount !== 1 ? 's' : ''}.`, check: (gs) => (gs.buildings[buildingId] || 0) >= amount });

export const ACHIEVEMENTS = [
  // Baking milestones
  sweetAch('a_s0', 'First Batch', '🍪', 100),
  sweetAch('a_s1', 'Bake Sale', '🧺', 10000),
  sweetAch('a_s2', 'Sweet Tooth', '🦷', 1e6),
  sweetAch('a_s3', 'Sugar High', '🎈', 1e8),
  sweetAch('a_s4', 'Dessert Storm', '🌪️', 1e10),
  sweetAch('a_s5', 'Confection Perfection', '💯', 1e12),
  sweetAch('a_s6', 'Planetary Pâtissier', '🪐', 1e15),
  sweetAch('a_s7', 'Galactic Glazier', '🌌', 1e18),
  // Clicking
  clickAch('a_c0', 'Warm-Up Taps', '👆', 100),
  clickAch('a_c1', 'Finger Workout', '💪', 1000),
  clickAch('a_c2', 'Click Machine', '🤖', 10000),
  clickAch('a_c3', 'Carpal Champion', '🏆', 50000),
  clickAch('a_c4', 'The Unstoppable Finger', '☄️', 200000),
  // Buildings
  bldAch('a_b0', 'Whisk Taker', '🥄', 'whisk', 25),
  bldAch('a_b1', 'Grandma Battalion', '👵', 'oven', 25),
  bldAch('a_b2', 'Cupcake Empire', '🧁', 'stand', 25),
  bldAch('a_b3', 'Chain Baker', '🥐', 'bakery', 25),
  bldAch('a_b4', 'Deep Choc Miner', '⛏️', 'chocmine', 25),
  bldAch('a_b5', 'Cane Tycoon', '🍬', 'candyfarm', 25),
  bldAch('a_b6', 'Glacier Boss', '🍨', 'icecream', 25),
  bldAch('a_b7', 'Refinery Mogul', '🏭', 'refinery', 25),
  bldAch('a_b8', 'Reactor Overseer', '⚗️', 'reactor', 25),
  bldAch('a_b9', 'City Planner', '🏰', 'gingercity', 25),
  bldAch('a_b10', 'Dimension Landlord', '🌀', 'portal', 25),
  bldAch('a_b11', 'Cosmic Baron', '🌌', 'cosmic', 25),
  { id: 'a_all1', name: 'One of Everything', icon: '🛒', desc: 'Own at least 1 of every building.', check: (gs) => BUILDINGS.every((b) => (gs.buildings[b.id] || 0) >= 1) },
  { id: 'a_all50', name: 'Sweet Monopoly', icon: '🎩', desc: 'Own at least 50 of every building.', check: (gs) => BUILDINGS.every((b) => (gs.buildings[b.id] || 0) >= 50) },
  { id: 'a_all100', name: 'Total Sweet Domination', icon: '🌍', desc: 'Own at least 100 of every building.', check: (gs) => BUILDINGS.every((b) => (gs.buildings[b.id] || 0) >= 100) },
  // Golden cookies
  { id: 'a_g0', name: 'Golden Snack', icon: '✨', desc: 'Click your first golden cookie.', check: (gs) => gs.goldenClicks >= 1 },
  { id: 'a_g1', name: 'Fortune Hunter', icon: '🌠', desc: 'Click 25 golden cookies.', check: (gs) => gs.goldenClicks >= 25 },
  { id: 'a_g2', name: 'Midas of Munchies', icon: '👑', desc: 'Click 100 golden cookies.', check: (gs) => gs.goldenClicks >= 100 },
  { id: 'a_g3', name: 'Golden God', icon: '🌞', desc: 'Click 500 golden cookies.', check: (gs) => gs.goldenClicks >= 500 },
  // Upgrades & stars
  { id: 'a_u0', name: 'Upgrader', icon: '🔧', desc: 'Buy 10 upgrades.', check: (gs) => gs.upgrades.length >= 10 },
  { id: 'a_u1', name: 'Optimiser', icon: '⚙️', desc: 'Buy 30 upgrades.', check: (gs) => gs.upgrades.length >= 30 },
  { id: 'a_u2', name: 'Completionist', icon: '📋', desc: 'Buy 60 upgrades.', check: (gs) => gs.upgrades.length >= 60 },
  // Rebirths
  { id: 'a_r0', name: 'Born Again Baker', icon: '🔄', desc: 'Perform your first Recipe Rebirth.', check: (gs) => gs.rebirths >= 1 },
  { id: 'a_r1', name: 'Serial Rebaker', icon: '♻️', desc: 'Perform 5 Recipe Rebirths.', check: (gs) => gs.rebirths >= 5 },
  { id: 'a_r2', name: 'Eternal Oven', icon: '🔥', desc: 'Perform 10 Recipe Rebirths.', check: (gs) => gs.rebirths >= 10 },
  { id: 'a_r3', name: 'The Infinite Bake', icon: '♾️', desc: 'Perform 25 Recipe Rebirths.', check: (gs) => gs.rebirths >= 25 },
  { id: 'a_r4', name: 'Beyond Flavour', icon: '🌈', desc: 'Perform 50 Recipe Rebirths.', check: (gs) => gs.rebirths >= 50 },
  // Stars
  { id: 'a_st0', name: 'Star Gazer', icon: '⭐', desc: 'Hold 10 Sugar Stars.', check: (gs) => gs.sugarStars >= 10 },
  { id: 'a_st1', name: 'Constellation Chef', icon: '🌟', desc: 'Hold 100 Sugar Stars.', check: (gs) => gs.sugarStars >= 100 },
  { id: 'a_st2', name: 'Sugar Supernova', icon: '💫', desc: 'Hold 1,000 Sugar Stars.', check: (gs) => gs.sugarStars >= 1000 },
];
export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

// ═══════════════════════════════════════════════════════════════════════════
// PRESTIGE — Recipe Rebirth & Sugar Stars
// ═══════════════════════════════════════════════════════════════════════════
// Stars earned on rebirth: sqrt(runSweets / 1e9) — first star needs 1 BILLION
// sweets baked in a single run (slow grind by design). Each star = +2% SPS.
export const STAR_DIVISOR = 1e9;
export const starsForRun = (runSweets) => Math.floor(Math.sqrt(Math.max(0, runSweets) / STAR_DIVISOR));
export const STAR_SPS_BONUS = 0.02;

// Star Shop — permanent upgrades bought with Sugar Stars (spent stars still
// count toward star-holding achievements? No — spent is spent; plan wisely.)
export const STAR_UPGRADES = [
  { id: 'su_head', name: 'Head Start', icon: '🚀', desc: 'Every rebirth starts with 5 free Auto-Whisks and 1 Grandma.', cost: 3 },
  { id: 'su_off1', name: 'Night Shift Elves', icon: '🧝', desc: 'Earn offline production for up to 8 hours (base: 2).', cost: 5 },
  { id: 'su_off2', name: 'Elf Overtime', icon: '🌙', desc: 'Offline production window becomes 24 hours.', cost: 25 },
  { id: 'su_click', name: 'Star-Powered Finger', icon: '☝️', desc: 'Clicking power permanently ×5.', cost: 10 },
  { id: 'su_gold', name: 'Golden Magnet', icon: '🧲', desc: 'Golden cookies appear twice as often. Forever.', cost: 20 },
  { id: 'su_keep', name: 'Recipe Memory', icon: '🧠', desc: 'Keep your click upgrades through rebirths.', cost: 40 },
  { id: 'su_combo', name: 'Endless Sugar Rush', icon: '⚡', desc: 'Sugar Rush combo decays 3× slower.', cost: 15 },
  { id: 'su_prod', name: 'Stellar Ovens', icon: '🌠', desc: 'All production permanently ×2.', cost: 75 },
  { id: 'su_prod2', name: 'Nebula Kitchens', icon: '🌌', desc: 'All production permanently ×3. (Stacks!)', cost: 300 },
];
export const STAR_UPGRADE_MAP = Object.fromEntries(STAR_UPGRADES.map((u) => [u.id, u]));

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN COOKIES
// ═══════════════════════════════════════════════════════════════════════════
export const GOLDEN_MIN_GAP = 90;   // seconds
export const GOLDEN_MAX_GAP = 300;
export const GOLDEN_LIFETIME = 11;  // seconds on screen

export const GOLDEN_EFFECTS = [
  { id: 'frenzy',      name: 'Frenzy!',        icon: '🔥', weight: 34, duration: 30, desc: 'Production ×7 for 30s!' },
  { id: 'clickfrenzy', name: 'Click Frenzy!',  icon: '⚡', weight: 18, duration: 15, desc: 'Clicking ×20 for 15s!' },
  { id: 'lucky',       name: 'Sweet Windfall', icon: '💰', weight: 34, duration: 0,  desc: 'Instant sweets — 10% of bank or 15 min of SPS!' },
  { id: 'rush',        name: 'Instant Rush',   icon: '🌀', weight: 10, duration: 0,  desc: 'Sugar Rush combo instantly maxed!' },
  { id: 'jackpot',     name: 'JACKPOT!',       icon: '🎰', weight: 4,  duration: 0,  desc: 'Instant sweets — a full HOUR of SPS!' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SUGAR RUSH combo
// ═══════════════════════════════════════════════════════════════════════════
export const COMBO_MAX = 100;          // combo points
export const COMBO_MAX_BONUS = 1.0;    // +100% click power at max combo
export const COMBO_DECAY_PER_SEC = 8;  // points lost per second idle

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE UNLOCKS — the slow-grind chase items that theme student profiles
// ═══════════════════════════════════════════════════════════════════════════
// Card themes (border/background/glow on the teacher's Students page and the
// student's own dashboard). Unlocks are DELIBERATELY hard.
export const SE_THEMES = [
  { id: 'strawberry', name: 'Strawberry Frosting', icon: '🍓', req: { type: 'rebirths', value: 1 },  reqText: '1 Recipe Rebirth' },
  { id: 'mint',       name: 'Mint Choc Chip',      icon: '🌿', req: { type: 'rebirths', value: 3 },  reqText: '3 Recipe Rebirths' },
  { id: 'blueberry',  name: 'Blueberry Glaze',     icon: '🫐', req: { type: 'rebirths', value: 6 },  reqText: '6 Recipe Rebirths' },
  { id: 'licorice',   name: 'Licorice Night',      icon: '🖤', req: { type: 'golden', value: 100 },  reqText: '100 golden cookies clicked' },
  { id: 'caramel',    name: 'Golden Caramel',      icon: '🍮', req: { type: 'rebirths', value: 10 }, reqText: '10 Recipe Rebirths' },
  { id: 'bubblegum',  name: 'Bubblegum Dream',     icon: '🫧', req: { type: 'lifetime', value: 1e12 }, reqText: '1T lifetime sweets' },
  { id: 'rainbow',    name: 'Rainbow Sherbet',     icon: '🌈', req: { type: 'achievements', value: 30 }, reqText: '30 achievements' },
  { id: 'galaxy',     name: 'Galaxy Swirl',        icon: '🌌', req: { type: 'rebirths', value: 20 }, reqText: '20 Recipe Rebirths' },
  { id: 'royal',      name: 'Royal Icing',         icon: '👑', req: { type: 'lifetime', value: 1e15 }, reqText: '1Qa lifetime sweets' },
  { id: 'eternal',    name: 'Eternal Flambé',      icon: '🔥', req: { type: 'rebirths', value: 40 }, reqText: '40 Recipe Rebirths' },
];

// Styling for each theme — used by StudentsTab (card) and StudentDashboard.
export const SE_THEME_STYLES = {
  strawberry: { border: 'border-pink-400',    darkBorder: 'border-pink-400',    bg: 'bg-pink-50',    darkBg: 'bg-pink-950/40',    glow: 'shadow-pink-400/40',    accent: '#f472b6', grad: 'from-pink-400 to-rose-500' },
  mint:       { border: 'border-emerald-400', darkBorder: 'border-emerald-400', bg: 'bg-emerald-50', darkBg: 'bg-emerald-950/40', glow: 'shadow-emerald-400/40', accent: '#34d399', grad: 'from-emerald-400 to-teal-500' },
  blueberry:  { border: 'border-blue-400',    darkBorder: 'border-blue-400',    bg: 'bg-blue-50',    darkBg: 'bg-blue-950/40',    glow: 'shadow-blue-400/40',    accent: '#60a5fa', grad: 'from-blue-400 to-indigo-500' },
  licorice:   { border: 'border-slate-600',   darkBorder: 'border-slate-400',   bg: 'bg-slate-100',  darkBg: 'bg-slate-900/60',   glow: 'shadow-slate-500/40',   accent: '#64748b', grad: 'from-slate-600 to-slate-900' },
  caramel:    { border: 'border-amber-400',   darkBorder: 'border-amber-400',   bg: 'bg-amber-50',   darkBg: 'bg-amber-950/40',   glow: 'shadow-amber-400/50',   accent: '#fbbf24', grad: 'from-amber-400 to-orange-500' },
  bubblegum:  { border: 'border-fuchsia-400', darkBorder: 'border-fuchsia-400', bg: 'bg-fuchsia-50', darkBg: 'bg-fuchsia-950/40', glow: 'shadow-fuchsia-400/40', accent: '#e879f9', grad: 'from-fuchsia-400 to-pink-500' },
  rainbow:    { border: 'border-purple-400',  darkBorder: 'border-purple-400',  bg: 'bg-gradient-to-br from-pink-50 via-yellow-50 to-cyan-50', darkBg: 'bg-purple-950/40', glow: 'shadow-purple-400/50', accent: '#c084fc', grad: 'from-pink-400 via-yellow-400 to-cyan-400' },
  galaxy:     { border: 'border-indigo-500',  darkBorder: 'border-indigo-400',  bg: 'bg-indigo-50',  darkBg: 'bg-indigo-950/50',  glow: 'shadow-indigo-500/50',  accent: '#818cf8', grad: 'from-indigo-500 via-purple-600 to-fuchsia-600' },
  royal:      { border: 'border-yellow-400',  darkBorder: 'border-yellow-300',  bg: 'bg-yellow-50',  darkBg: 'bg-yellow-950/40',  glow: 'shadow-yellow-400/60',  accent: '#facc15', grad: 'from-yellow-300 via-amber-400 to-yellow-500' },
  eternal:    { border: 'border-red-500',     darkBorder: 'border-red-400',     bg: 'bg-red-50',     darkBg: 'bg-red-950/40',     glow: 'shadow-red-500/60',     accent: '#f87171', grad: 'from-red-500 via-orange-500 to-amber-400' },
};

// Titles shown under the student's name on profile cards.
export const SE_TITLES = [
  { id: 'kitchenhand', name: 'Kitchen Hand',      req: { type: 'lifetime', value: 0 },    reqText: 'Start playing', color: 'text-gray-500',    darkColor: 'text-slate-400' },
  { id: 'apprentice',  name: 'Apprentice Baker',  req: { type: 'lifetime', value: 1e6 },  reqText: '1M lifetime sweets', color: 'text-green-600', darkColor: 'text-green-400' },
  { id: 'pastrychef',  name: 'Pastry Chef',       req: { type: 'lifetime', value: 1e9 },  reqText: '1B lifetime sweets', color: 'text-blue-600',  darkColor: 'text-blue-400' },
  { id: 'headbaker',   name: 'Head Baker',        req: { type: 'rebirths', value: 1 },    reqText: '1 Recipe Rebirth', color: 'text-purple-600',  darkColor: 'text-purple-400' },
  { id: 'sugarsmith',  name: 'Sugarsmith',        req: { type: 'rebirths', value: 5 },    reqText: '5 Recipe Rebirths', color: 'text-orange-600', darkColor: 'text-orange-400' },
  { id: 'grandmaster', name: 'Grand Confectioner', req: { type: 'rebirths', value: 10 },  reqText: '10 Recipe Rebirths', color: 'text-yellow-600', darkColor: 'text-yellow-400' },
  { id: 'sweetlord',   name: 'Sweet Lord',        req: { type: 'rebirths', value: 20 },   reqText: '20 Recipe Rebirths', color: 'text-pink-600',   darkColor: 'text-pink-400' },
  { id: 'dessertdeity', name: 'Dessert Deity',    req: { type: 'rebirths', value: 35 },   reqText: '35 Recipe Rebirths', color: 'text-cyan-600',   darkColor: 'text-cyan-400' },
  { id: 'sultan',      name: 'Sultan of Sweet',   req: { type: 'rebirths', value: 50 },   reqText: '50 Recipe Rebirths', color: 'text-amber-500',  darkColor: 'text-amber-300' },
];

// Special effects — animated rings/glows on the profile card. The rarest tier.
export const SE_EFFECTS = [
  { id: 'sprinkle_ring', name: 'Sprinkle Ring',  icon: '🍩', req: { type: 'rebirths', value: 2 },  reqText: '2 Recipe Rebirths',
    cls: 'ring-4 ring-pink-300 shadow-md shadow-pink-300/50' },
  { id: 'caramel_glow',  name: 'Caramel Glow',   icon: '🍮', req: { type: 'rebirths', value: 8 },  reqText: '8 Recipe Rebirths',
    cls: 'ring-4 ring-amber-400 shadow-lg shadow-amber-400/50' },
  { id: 'mint_aura',     name: 'Mint Aura',      icon: '🌿', req: { type: 'golden', value: 250 },  reqText: '250 golden cookies',
    cls: 'ring-4 ring-emerald-400 shadow-lg shadow-emerald-400/60' },
  { id: 'sugar_storm',   name: 'Sugar Storm',    icon: '🌪️', req: { type: 'rebirths', value: 15 }, reqText: '15 Recipe Rebirths',
    cls: 'animate-pulse ring-4 ring-cyan-400 shadow-xl shadow-cyan-400/60' },
  { id: 'royal_radiance', name: 'Royal Radiance', icon: '👑', req: { type: 'rebirths', value: 30 }, reqText: '30 Recipe Rebirths',
    cls: 'animate-pulse ring-4 ring-offset-2 ring-yellow-400 shadow-2xl shadow-yellow-400/60' },
  { id: 'confection_crown', name: 'Confection Crown', icon: '💎', req: { type: 'allAchievements', value: true }, reqText: 'Earn EVERY achievement',
    cls: 'animate-pulse ring-4 ring-offset-2 ring-fuchsia-500 shadow-2xl shadow-fuchsia-500/60' },
];

export const SE_THEME_MAP = Object.fromEntries(SE_THEMES.map((t) => [t.id, t]));
export const SE_TITLE_MAP = Object.fromEntries(SE_TITLES.map((t) => [t.id, t]));
export const SE_EFFECT_MAP = Object.fromEntries(SE_EFFECTS.map((e) => [e.id, e]));

export const meetsUnlockReq = (req, gs) => {
  switch (req.type) {
    case 'rebirths': return (gs.rebirths || 0) >= req.value;
    case 'lifetime': return (gs.lifetimeSweets || 0) >= req.value;
    case 'golden': return (gs.goldenClicks || 0) >= req.value;
    case 'achievements': return (gs.achievements || []).length >= req.value;
    case 'allAchievements': return (gs.achievements || []).length >= ACHIEVEMENTS.length;
    default: return false;
  }
};

// ─── Shared profile-styling helper (used by StudentsTab + StudentDashboard) ──
// Returns null when the student has nothing equipped, so callers can fall
// back to their defaults.
export const getSweetEmpireProfile = (sweetEmpireData, isDark = false) => {
  if (!sweetEmpireData) return null;
  const theme = sweetEmpireData.activeTheme ? SE_THEME_STYLES[sweetEmpireData.activeTheme] : null;
  const themeInfo = sweetEmpireData.activeTheme ? SE_THEME_MAP[sweetEmpireData.activeTheme] : null;
  const title = sweetEmpireData.activeTitle ? SE_TITLE_MAP[sweetEmpireData.activeTitle] : null;
  const effect = sweetEmpireData.activeEffect ? SE_EFFECT_MAP[sweetEmpireData.activeEffect] : null;
  if (!theme && !title && !effect) return null;
  return {
    theme,        // { border, darkBorder, bg, darkBg, glow, accent, grad } | null
    themeName: themeInfo?.name || null,
    themeIcon: themeInfo?.icon || null,
    title: title ? { name: title.name, color: isDark ? title.darkColor : title.color } : null,
    effectCls: effect?.cls || '',
    effectName: effect?.name || null,
    rebirths: sweetEmpireData.rebirths || 0,
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT SAVE + OFFLINE
// ═══════════════════════════════════════════════════════════════════════════
export const OFFLINE_BASE_HOURS = 2;
export const OFFLINE_RATE = 0.5; // offline production runs at 50% of SPS

export const defaultSave = () => ({
  sweets: 0,          // current bank
  runSweets: 0,       // baked this run (drives stars + achievements)
  lifetimeSweets: 0,  // baked across all runs
  clicks: 0,
  goldenClicks: 0,
  buildings: {},
  upgrades: [],
  achievements: [],
  sugarStars: 0,
  starUpgrades: [],
  rebirths: 0,
  unlockedThemes: [],
  unlockedTitles: ['kitchenhand'],
  unlockedEffects: [],
  activeTheme: null,
  activeTitle: 'kitchenhand',
  activeEffect: null,
  lastSeen: null,
  lastSaved: null,
});
