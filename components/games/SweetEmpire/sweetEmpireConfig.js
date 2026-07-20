// components/games/SweetEmpire/sweetEmpireConfig.js
// ─────────────────────────────────────────────────────────────────────────────
// CHAMPION'S FORGE ⚔️ — pure configuration + shared styling exports.
// (Formerly "Sweet Empire" — rethemed to heroes & champions. All ids and the
//  save shape are UNCHANGED so existing student progress carries over 1:1.)
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
//     dragonsSlain, eventsClaimed,               ← new (default 0)
//     unlockedThemes/Titles/Effects: [ids],
//     activeTheme, activeTitle, activeEffect,    ← read by profile pages
//     lastSeen, lastSaved }
//
// GLOSSARY (internal name → what the player sees):
//   sweets        → Gold            goldenClicks → Loot Chests opened
//   sugarStars    → Glory Stars     rebirths     → Heroic Ascensions
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
// RECRUITS (buildings) — the production ladder (costs grow 1.15× per copy)
// ids are the ORIGINAL building ids — do not change (saved progress).
// ═══════════════════════════════════════════════════════════════════════════
export const COST_GROWTH = 1.15;

export const BUILDINGS = [
  { id: 'whisk',      name: 'Squire',             icon: '🗡️', img: '/Pets/Warrior.png',        baseCost: 15,      sps: 0.1,     desc: 'A keen young squire, polishing blades and earning coin.' },
  { id: 'oven',       name: 'Knight',             icon: '🛡️', img: '/Pets/Knight.png',         baseCost: 100,     sps: 1,       desc: 'A sworn knight who guards the realm around the clock.' },
  { id: 'stand',      name: "Rogue's Den",        icon: '🗝️', img: '/Pets/Rogue.png',          baseCost: 1100,    sps: 8,       desc: 'Rogues "liberate" treasure from dungeons by the sackful.' },
  { id: 'bakery',     name: 'Barbarian Warband',  icon: '🪓', img: '/Pets/Barbarian.png',      baseCost: 12000,   sps: 47,      desc: 'A roaring warband raiding monster camps day and night.' },
  { id: 'chocmine',   name: 'Monk Monastery',     icon: '🥋', img: '/Pets/Monk.png',           baseCost: 130000,  sps: 260,     desc: 'Disciplined monks channel fortune with every strike.' },
  { id: 'candyfarm',  name: 'Druid Grove',        icon: '🌿', img: '/Pets/Druid.png',          baseCost: 1.4e6,   sps: 1400,    desc: 'Ancient druids grow gold-blossom trees deep in the wilds.' },
  { id: 'icecream',   name: 'Frost Mage Tower',   icon: '❄️', img: '/Pets/Frost Mage.png',     baseCost: 2e7,     sps: 7800,    desc: 'Frost mages freeze time itself to mine glacial riches.' },
  { id: 'refinery',   name: 'Paladin Order',      icon: '⚜️', img: '/Pets/Paladin.png',        baseCost: 3.3e8,   sps: 44000,   desc: 'A holy order whose crusades return laden with treasure.' },
  { id: 'reactor',    name: 'Necromancer Crypt',  icon: '💀', img: '/Pets/Necromancer.png',    baseCost: 5.1e9,   sps: 260000,  desc: 'Skeleton legions never sleep, never eat, never stop digging.' },
  { id: 'gingercity', name: 'Crystal Citadel',    icon: '🏰', img: '/Pets/Crystal Knight.png', baseCost: 7.5e10,  sps: 1.6e6,   desc: 'A fortress of living crystal, humming with radiant power.' },
  { id: 'portal',     name: 'Time Knight Gate',   icon: '🌀', img: '/Pets/Time Knight.png',    baseCost: 1e12,    sps: 1e7,     desc: 'Time Knights plunder the treasuries of forgotten eras.' },
  { id: 'cosmic',     name: 'Dream Legion',       icon: '🌌', img: '/Pets/Dream.png',          baseCost: 1.4e13,  sps: 6.5e7,   desc: 'Champions of the dream realm, marching beyond the stars.' },
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
// THE FORGE — the evolving clickable centerpiece
// Stage = highest entry whose requirement is met. Lifetime gold NEVER resets,
// so the weapon only ever grows mightier. Final relic stages need Ascensions.
// ═══════════════════════════════════════════════════════════════════════════
export const FORGE_STAGES = [
  { name: 'Worn Daggers',        img: '/Loot/Weapons/17.png',   req: { type: 'lifetime', value: 0 },     flavor: 'Every legend starts somewhere…' },
  { name: 'Soldier’s Cutlass',   img: '/Loot/Weapons/16.png',   req: { type: 'lifetime', value: 5000 },  flavor: 'Standard issue. Barely.' },
  { name: 'Knight’s Blade',      img: '/Loot/Weapons/1.png',    req: { type: 'lifetime', value: 1e5 },   flavor: 'Now we’re getting somewhere.' },
  { name: 'Champion’s Axe',      img: '/Loot/Weapons/3.png',    req: { type: 'lifetime', value: 2e6 },   flavor: 'Heavy. Loud. Effective.' },
  { name: 'Enchanted Warhammer', img: '/Loot/Weapons/7.png',    req: { type: 'lifetime', value: 5e7 },   flavor: 'It hums when monsters are near.' },
  { name: 'Twin Runeblades',     img: '/Loot/Weapons/4.png',    req: { type: 'lifetime', value: 1e9 },   flavor: 'Ancient runes crawl along the steel.' },
  { name: 'Skullcleaver',        img: '/Loot/Weapons/6.png',    req: { type: 'lifetime', value: 2.5e10 }, flavor: 'Taken from a warlord. He wasn’t using it anymore.' },
  { name: 'Stormcaller',         img: '/Loot/Weapons/13.png',   req: { type: 'lifetime', value: 1e12 },  flavor: 'Thunder answers every swing.' },
  { name: 'Soulrender',          img: '/Loot/Weapons/14.png',   req: { type: 'lifetime', value: 5e13 },  flavor: 'It whispers. Try not to listen.' },
  { name: 'Scepter of Eternity', img: '/Loot/Weapons/9.png',    req: { type: 'lifetime', value: 1e15 },  flavor: 'Time bends around its orb.' },
  { name: 'Godforged Maul',      img: '/Loot/Weapons/12.png',   req: { type: 'lifetime', value: 1e18 },  flavor: 'Hammered on the anvil of the gods.' },
  { name: 'Relic of the Ascended', img: '/Loot/Artifacts/1.png', req: { type: 'rebirths', value: 5 },    flavor: 'A relic only Ascended heroes may wield.' },
  { name: 'Crown Relic of Legends', img: '/Loot/Artifacts/5.png', req: { type: 'rebirths', value: 15 },  flavor: 'Legends kneel before it.' },
  { name: 'Heart of the Realm', img: '/Loot/Artifacts/9.png',   req: { type: 'rebirths', value: 30 },    flavor: 'The realm itself beats in your hands.' },
];

export const forgeStageFor = (gs) => {
  let stage = FORGE_STAGES[0];
  let index = 0;
  FORGE_STAGES.forEach((s, i) => {
    if (meetsUnlockReq(s.req, gs)) { stage = s; index = i; }
  });
  return { ...stage, index };
};

// ═══════════════════════════════════════════════════════════════════════════
// UPGRADES
// ═══════════════════════════════════════════════════════════════════════════
// Recruit upgrades: auto-generated — at 10 / 25 / 50 / 100 / 200 owned,
// an upgrade appears that DOUBLES that recruit's output.
const BUILDING_UPGRADE_TIERS = [
  { at: 10,  costMult: 10,    adj: 'Trained' },
  { at: 25,  costMult: 50,    adj: 'Veteran' },
  { at: 50,  costMult: 500,   adj: 'Elite' },
  { at: 100, costMult: 5000,  adj: 'Mythic' },
  { at: 200, costMult: 50000, adj: 'Ascended' },
];

const buildingUpgrades = BUILDINGS.flatMap((b) =>
  BUILDING_UPGRADE_TIERS.map((tier, i) => ({
    id: `bu_${b.id}_${i}`,
    name: `${tier.adj} ${b.name}`,
    icon: b.icon,
    img: b.img,
    desc: `${b.name} output ×2. (Requires ${tier.at} recruited)`,
    cost: b.baseCost * tier.costMult,
    type: 'building',
    target: b.id,
    mult: 2,
    unlock: (gs) => (gs.buildings[b.id] || 0) >= tier.at,
  }))
);

// Strike upgrades: multiply gold-per-strike, plus "Battle Instinct" upgrades
// that add a % of GPS to every strike (keeps clicking relevant forever).
const clickUpgrades = [
  { id: 'cu_0', name: 'Sharpened Blade',    icon: '🗡️', desc: 'Strike power ×2.',                          cost: 100,    type: 'click', mult: 2,  unlock: (gs) => gs.clicks >= 25 },
  { id: 'cu_1', name: 'Iron Gauntlets',     icon: '🧤', desc: 'Strike power ×2.',                          cost: 2500,   type: 'click', mult: 2,  unlock: (gs) => gs.clicks >= 200 },
  { id: 'cu_2', name: 'Steel Knuckles',     icon: '✊', desc: 'Strike power ×3.',                          cost: 50000,  type: 'click', mult: 3,  unlock: (gs) => gs.clicks >= 1000 },
  { id: 'cu_3', name: "Titan's Strength",   icon: '💪', desc: 'Strike power ×3.',                          cost: 1e6,    type: 'click', mult: 3,  unlock: (gs) => gs.clicks >= 3000 },
  { id: 'cu_4', name: 'Ballista Strike',    icon: '🏹', desc: 'Strike power ×5.',                          cost: 5e7,    type: 'click', mult: 5,  unlock: (gs) => gs.clicks >= 8000 },
  { id: 'cu_5', name: 'The Midas Gauntlet', icon: '🥇', desc: 'Strike power ×10.',                         cost: 5e9,    type: 'click', mult: 10, unlock: (gs) => gs.clicks >= 20000 },
  { id: 'sf_0', name: 'Battle Instinct',    icon: '⚔️', desc: 'Each strike also earns 1% of your GPS.',    cost: 500000, type: 'clickSps', value: 0.01, unlock: (gs) => gs.clicks >= 2000 },
  { id: 'sf_1', name: "Warrior's Flow",     icon: '🌊', desc: 'Each strike also earns +2% of your GPS.',   cost: 5e7,    type: 'clickSps', value: 0.02, unlock: (gs) => gs.upgrades.includes('sf_0') },
  { id: 'sf_2', name: "Hero's Resolve",     icon: '🛡️', desc: 'Each strike also earns +3% of your GPS.',   cost: 5e9,    type: 'clickSps', value: 0.03, unlock: (gs) => gs.upgrades.includes('sf_1') },
  { id: 'sf_3', name: "Legend's Touch",     icon: '👑', desc: 'Each strike also earns +4% of your GPS.',   cost: 5e11,   type: 'clickSps', value: 0.04, unlock: (gs) => gs.upgrades.includes('sf_2') },
];

// Global upgrades: multiply EVERYTHING.
const globalUpgrades = [
  { id: 'gu_0', name: 'Ancient War Manual',      icon: '📜', desc: 'All production ×1.5.', cost: 1e6,  type: 'global', mult: 1.5, unlock: (gs) => gs.runSweets >= 500000 },
  { id: 'gu_1', name: 'Elven Alliance',          icon: '🧝', desc: 'All production ×1.5.', cost: 1e8,  type: 'global', mult: 1.5, unlock: (gs) => gs.runSweets >= 5e7 },
  { id: 'gu_2', name: 'Royal Warrant',           icon: '👑', desc: 'All production ×2.',   cost: 1e10, type: 'global', mult: 2,   unlock: (gs) => gs.runSweets >= 5e9 },
  { id: 'gu_3', name: 'Blessing of the Gods',    icon: '⭐', desc: 'All production ×2.',   cost: 1e12, type: 'global', mult: 2,   unlock: (gs) => gs.runSweets >= 5e11 },
  { id: 'gu_4', name: 'Reality Singularity',     icon: '🕳️', desc: 'All production ×3.',   cost: 1e15, type: 'global', mult: 3,   unlock: (gs) => gs.runSweets >= 5e14 },
  { id: 'gu_5', name: 'Crown of Infinity',       icon: '♾️', desc: 'All production ×3.',   cost: 1e18, type: 'global', mult: 3,   unlock: (gs) => gs.runSweets >= 5e17 },
  { id: 'gu_6', name: 'Heart of the Multiverse', icon: '🌠', desc: 'All production ×4.',   cost: 1e21, type: 'global', mult: 4,   unlock: (gs) => gs.runSweets >= 5e20 },
];

// Loot chest upgrades (internally "golden" — do not rename ids)
const goldenUpgrades = [
  { id: 'gc_0', name: 'Lucky Charm',     icon: '🍀', desc: 'Loot chests appear 25% more often.',    cost: 1e7,  type: 'goldenFreq', value: 0.25, unlock: (gs) => gs.goldenClicks >= 5 },
  { id: 'gc_1', name: 'Treasure Sense',  icon: '🧭', desc: 'Loot chests appear 25% more often.',    cost: 1e9,  type: 'goldenFreq', value: 0.25, unlock: (gs) => gs.goldenClicks >= 20 },
  { id: 'gc_2', name: 'Gilded Crowbar',  icon: '🪓', desc: 'Loot chest effects last 50% longer.',   cost: 1e11, type: 'goldenDur',  value: 0.5,  unlock: (gs) => gs.goldenClicks >= 50 },
];

export const UPGRADES = [...buildingUpgrades, ...clickUpgrades, ...globalUpgrades, ...goldenUpgrades];
export const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

// ═══════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS — each one earned grants +1% to all production, forever
// ═══════════════════════════════════════════════════════════════════════════
const sweetAch = (id, name, icon, amount) =>
  ({ id, name, icon, desc: `Earn ${fmtNum(amount)} gold in one quest.`, check: (gs) => gs.runSweets >= amount });
const clickAch = (id, name, icon, amount) =>
  ({ id, name, icon, desc: `Strike the forge ${fmtNum(amount)} times.`, check: (gs) => gs.clicks >= amount });
const bldAch = (id, name, icon, buildingId, amount) =>
  ({ id, name, icon, desc: `Recruit ${amount} ${BUILDING_MAP[buildingId].name}${amount !== 1 ? 's' : ''}.`, check: (gs) => (gs.buildings[buildingId] || 0) >= amount });

export const ACHIEVEMENTS = [
  // Gold milestones
  sweetAch('a_s0', 'First Bounty', '💰', 100),
  sweetAch('a_s1', 'Village Hero', '🏘️', 10000),
  sweetAch('a_s2', 'Gilded Champion', '🥇', 1e6),
  sweetAch('a_s3', 'Dragon Banker', '🐉', 1e8),
  sweetAch('a_s4', 'War Treasury', '⚔️', 1e10),
  sweetAch('a_s5', 'Realm Shaker', '🏰', 1e12),
  sweetAch('a_s6', 'Planetary Conqueror', '🪐', 1e15),
  sweetAch('a_s7', 'Galactic Warlord', '🌌', 1e18),
  // Striking
  clickAch('a_c0', 'Warm-Up Swings', '🗡️', 100),
  clickAch('a_c1', 'Sword Arm', '💪', 1000),
  clickAch('a_c2', 'War Machine', '🤖', 10000),
  clickAch('a_c3', 'Blademaster', '🏆', 50000),
  clickAch('a_c4', 'The Unstoppable Blade', '☄️', 200000),
  // Recruits
  bldAch('a_b0', 'Squire Squad', '🗡️', 'whisk', 25),
  bldAch('a_b1', 'Knight Battalion', '🛡️', 'oven', 25),
  bldAch('a_b2', 'Thieves Guildmaster', '🗝️', 'stand', 25),
  bldAch('a_b3', 'Horde Leader', '🪓', 'bakery', 25),
  bldAch('a_b4', 'Grand Abbot', '🥋', 'chocmine', 25),
  bldAch('a_b5', 'Keeper of the Grove', '🌿', 'candyfarm', 25),
  bldAch('a_b6', 'Archmage of Frost', '❄️', 'icecream', 25),
  bldAch('a_b7', 'High Crusader', '⚜️', 'refinery', 25),
  bldAch('a_b8', 'Lord of Crypts', '💀', 'reactor', 25),
  bldAch('a_b9', 'Citadel Sovereign', '🏰', 'gingercity', 25),
  bldAch('a_b10', 'Master of Ages', '🌀', 'portal', 25),
  bldAch('a_b11', 'Dream General', '🌌', 'cosmic', 25),
  { id: 'a_all1', name: 'One of Every Banner', icon: '🚩', desc: 'Recruit at least 1 of every champion.', check: (gs) => BUILDINGS.every((b) => (gs.buildings[b.id] || 0) >= 1) },
  { id: 'a_all50', name: 'Grand Army', icon: '🎖️', desc: 'Recruit at least 50 of every champion.', check: (gs) => BUILDINGS.every((b) => (gs.buildings[b.id] || 0) >= 50) },
  { id: 'a_all100', name: 'Total Realm Domination', icon: '🌍', desc: 'Recruit at least 100 of every champion.', check: (gs) => BUILDINGS.every((b) => (gs.buildings[b.id] || 0) >= 100) },
  // Loot chests
  { id: 'a_g0', name: 'First Loot', icon: '🎁', desc: 'Open your first loot chest.', check: (gs) => gs.goldenClicks >= 1 },
  { id: 'a_g1', name: 'Treasure Hunter', icon: '🗺️', desc: 'Open 25 loot chests.', check: (gs) => gs.goldenClicks >= 25 },
  { id: 'a_g2', name: 'Master Looter', icon: '👑', desc: 'Open 100 loot chests.', check: (gs) => gs.goldenClicks >= 100 },
  { id: 'a_g3', name: 'Midas of the Realm', icon: '🌞', desc: 'Open 500 loot chests.', check: (gs) => gs.goldenClicks >= 500 },
  // Upgrades & stars
  { id: 'a_u0', name: 'Armorer', icon: '🔧', desc: 'Buy 10 upgrades.', check: (gs) => gs.upgrades.length >= 10 },
  { id: 'a_u1', name: 'Master Smith', icon: '⚙️', desc: 'Buy 30 upgrades.', check: (gs) => gs.upgrades.length >= 30 },
  { id: 'a_u2', name: 'Legendary Artificer', icon: '📋', desc: 'Buy 60 upgrades.', check: (gs) => gs.upgrades.length >= 60 },
  // Ascensions
  { id: 'a_r0', name: 'Reborn Hero', icon: '🔄', desc: 'Complete your first Heroic Ascension.', check: (gs) => gs.rebirths >= 1 },
  { id: 'a_r1', name: 'Serial Ascender', icon: '♻️', desc: 'Complete 5 Heroic Ascensions.', check: (gs) => gs.rebirths >= 5 },
  { id: 'a_r2', name: 'Eternal Flame', icon: '🔥', desc: 'Complete 10 Heroic Ascensions.', check: (gs) => gs.rebirths >= 10 },
  { id: 'a_r3', name: 'The Infinite Champion', icon: '♾️', desc: 'Complete 25 Heroic Ascensions.', check: (gs) => gs.rebirths >= 25 },
  { id: 'a_r4', name: 'Beyond Legend', icon: '🌈', desc: 'Complete 50 Heroic Ascensions.', check: (gs) => gs.rebirths >= 50 },
  // Glory Stars
  { id: 'a_st0', name: 'Star Gazer', icon: '⭐', desc: 'Hold 10 Glory Stars.', check: (gs) => gs.sugarStars >= 10 },
  { id: 'a_st1', name: 'Constellation Knight', icon: '🌟', desc: 'Hold 100 Glory Stars.', check: (gs) => gs.sugarStars >= 100 },
  { id: 'a_st2', name: 'Glory Supernova', icon: '💫', desc: 'Hold 1,000 Glory Stars.', check: (gs) => gs.sugarStars >= 1000 },
  // Realm events (new)
  { id: 'a_e0', name: 'Event Chaser', icon: '🌪️', desc: 'Answer 5 realm events.', check: (gs) => (gs.eventsClaimed || 0) >= 5 },
  { id: 'a_e1', name: "Fate's Favourite", icon: '🔮', desc: 'Answer 25 realm events.', check: (gs) => (gs.eventsClaimed || 0) >= 25 },
  { id: 'a_e2', name: 'Storm Rider', icon: '⚡', desc: 'Answer 100 realm events.', check: (gs) => (gs.eventsClaimed || 0) >= 100 },
  { id: 'a_e3', name: 'Chosen of the Realm', icon: '🌟', desc: 'Answer 500 realm events.', check: (gs) => (gs.eventsClaimed || 0) >= 500 },
  // Dragon raids (new)
  { id: 'a_d0', name: 'Dragonslayer', icon: '🐉', desc: 'Slay your first raiding dragon.', check: (gs) => (gs.dragonsSlain || 0) >= 1 },
  { id: 'a_d1', name: 'Wyrm Bane', icon: '🗡️', desc: 'Slay 10 raiding dragons.', check: (gs) => (gs.dragonsSlain || 0) >= 10 },
  { id: 'a_d2', name: 'Scourge of Dragons', icon: '🔥', desc: 'Slay 50 raiding dragons.', check: (gs) => (gs.dragonsSlain || 0) >= 50 },
  { id: 'a_d3', name: 'The Last Dragonlord', icon: '👑', desc: 'Slay 200 raiding dragons.', check: (gs) => (gs.dragonsSlain || 0) >= 200 },
];
export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

// ═══════════════════════════════════════════════════════════════════════════
// PRESTIGE — Heroic Ascension & Glory Stars (internally rebirths/sugarStars)
// ═══════════════════════════════════════════════════════════════════════════
// Stars earned on ascension: hard thresholds, MAX 3 PER ASCENSION.
// 1st star = 50 BILLION run gold, 2nd = 500 BILLION, 3rd = 5 TRILLION.
// (Rebalanced: stars are now rare and precious — each is +2% GPS forever.)
export const STAR_THRESHOLDS = [5e10, 5e11, 5e12];
export const STAR_DIVISOR = STAR_THRESHOLDS[0]; // kept for back-compat
export const starsForRun = (runSweets) =>
  STAR_THRESHOLDS.filter((t) => (Number(runSweets) || 0) >= t).length;
export const STAR_SPS_BONUS = 0.02;

// Hall of Legends — permanent upgrades bought with Glory Stars (spent is spent;
// plan wisely).
export const STAR_UPGRADES = [
  { id: 'su_head',   name: "Veteran's Start",      icon: '🚀', desc: 'Every Ascension starts with 5 free Squires and 1 Knight.', cost: 3 },
  { id: 'su_off1',   name: 'Night Watch',          icon: '🌙', desc: 'Earn offline production for up to 8 hours (base: 2).', cost: 5 },
  { id: 'su_off2',   name: 'Eternal Vigil',        icon: '🌌', desc: 'Offline production window becomes 24 hours.', cost: 25 },
  { id: 'su_click',  name: 'Star-Forged Gauntlet', icon: '☝️', desc: 'Strike power permanently ×5.', cost: 10 },
  { id: 'su_gold',   name: 'Treasure Magnet',      icon: '🧲', desc: 'Loot chests appear twice as often. Forever.', cost: 20 },
  { id: 'su_keep',   name: 'Muscle Memory',        icon: '🧠', desc: 'Keep your strike upgrades through Ascensions.', cost: 40 },
  { id: 'su_combo',  name: 'Endless Momentum',     icon: '⚡', desc: 'Battle Momentum decays 3× slower.', cost: 15 },
  { id: 'su_event',  name: 'Omen Reader',          icon: '🔮', desc: 'Realm events happen 50% more often.', cost: 30 },
  { id: 'su_dragon', name: "Dragonlord's Pact",    icon: '🐉', desc: 'Dragon raid rewards ×2.', cost: 50 },
  { id: 'su_prod',   name: 'Stellar Armory',       icon: '🌠', desc: 'All production permanently ×2.', cost: 75 },
  { id: 'su_prod2',  name: 'Celestial Legion',     icon: '🌌', desc: 'All production permanently ×3. (Stacks!)', cost: 300 },
];
export const STAR_UPGRADE_MAP = Object.fromEntries(STAR_UPGRADES.map((u) => [u.id, u]));

// ═══════════════════════════════════════════════════════════════════════════
// LOOT CHESTS (internally "golden cookies" — ids unchanged)
// ═══════════════════════════════════════════════════════════════════════════
export const GOLDEN_MIN_GAP = 90;   // seconds
export const GOLDEN_MAX_GAP = 300;
export const GOLDEN_LIFETIME = 11;  // seconds on screen

export const GOLDEN_EFFECTS = [
  { id: 'frenzy',      name: 'Battle Fury!',    icon: '🔥', weight: 34, duration: 30, desc: 'Production ×7 for 30s!' },
  { id: 'clickfrenzy', name: 'Blade Storm!',    icon: '⚡', weight: 18, duration: 15, desc: 'Strike power ×20 for 15s!' },
  { id: 'lucky',       name: 'Treasure Trove',  icon: '💰', weight: 34, duration: 0,  desc: 'Instant gold — 10% of your hoard or 15 min of GPS!' },
  { id: 'rush',        name: 'War Cry',         icon: '🌀', weight: 10, duration: 0,  desc: 'Battle Momentum instantly maxed!' },
  { id: 'jackpot',     name: "DRAGON'S HOARD!", icon: '🎰', weight: 4,  duration: 0,  desc: 'Instant gold — a full HOUR of GPS!' },
];

// A random artifact image is used for each chest spawn.
export const LOOT_CHEST_IMAGES = Array.from({ length: 21 }, (_, i) => `/Loot/Artifacts/${i + 1}.png`);

// ═══════════════════════════════════════════════════════════════════════════
// REALM EVENTS — random world events (new system, additive to save)
// ═══════════════════════════════════════════════════════════════════════════
export const EVENT_MIN_GAP = 150;   // seconds between events
export const EVENT_MAX_GAP = 420;
export const EVENT_LIFETIME = 18;   // seconds to answer the call before it fades

export const REALM_EVENTS = [
  { id: 'merchant', name: 'Travelling Merchant', icon: '🧝', weight: 20, kind: 'buff',
    desc: 'A merchant opens her wagon — all recruits 25% off for 60s!', duration: 60 },
  { id: 'blessing', name: 'Royal Blessing', icon: '✨', weight: 18, kind: 'buff',
    desc: 'The Crown blesses your banner — production ×3 for 45s!', duration: 45 },
  { id: 'training', name: 'Weapons Master', icon: '🛡️', weight: 18, kind: 'buff',
    desc: 'A weapons master drills you — strike power ×10 for 30s!', duration: 30 },
  { id: 'star',     name: 'Falling Star', icon: '🌠', weight: 22, kind: 'instant',
    desc: 'A star crashes nearby — instant gold! (15% of hoard or 10 min of GPS)' },
  { id: 'horde',    name: 'Goblin Horde', icon: '👺', weight: 14, kind: 'instant',
    desc: 'Goblins scatter loot as they flee — Momentum maxed + 5 min of GPS!' },
  { id: 'dragon',   name: 'DRAGON RAID!', icon: '🐉', weight: 8, kind: 'dragon',
    desc: 'A dragon attacks! Strike it down before it escapes for a HUGE bounty!', duration: 35 },

  // ── Choice events: tapping opens options, each with a different outcome ──
  { id: 'wizard',   name: 'Mysterious Wizard', icon: '🧙', weight: 10, kind: 'choice',
    desc: 'A hooded wizard offers to enchant your gold hoard… do you trust him?',
    options: [
      { id: 'accept',  label: '🪄 Accept the spell', hint: 'Could grow your hoard 20%… or shrink it' },
      { id: 'decline', label: '🙅 Send him away', hint: 'A small, safe reward' },
    ] },
  { id: 'bard',     name: 'Wandering Bard', icon: '🎻', weight: 10, kind: 'choice',
    desc: 'A bard offers a heroic ballad to inspire your recruits — for a price.',
    options: [
      { id: 'pay',    label: '💰 Pay 5% of hoard', hint: 'Production ×2 for 90s' },
      { id: 'refuse', label: '🚪 Refuse politely', hint: 'Nothing ventured, nothing gained' },
    ] },
  { id: 'chest',    name: 'Ancient Chest', icon: '🗝️', weight: 10, kind: 'choice',
    desc: 'A locked chest sits by the road. It could be treasure… or a mimic.',
    options: [
      { id: 'open',  label: '⛏️ Pry it open', hint: 'Probably treasure. Probably.' },
      { id: 'leave', label: '🏃 Leave it alone', hint: 'Walk away with your teeth' },
    ] },

  // ── Bad events: tap in time to stop them — ignore them and pay the price ──
  { id: 'thief',    name: 'Sneaky Thief!', icon: '🦹', weight: 9, kind: 'bad',
    desc: 'A thief is creeping toward your hoard! Tap to catch him before he escapes with 5% of your gold!' },
  { id: 'omen',     name: 'Grim Omen', icon: '🌩️', weight: 8, kind: 'bad',
    desc: 'Dark clouds gather over the realm… tap to ward off the curse, or production is HALVED for 60s!', duration: 60 },
];

// Dragon raid tuning: HP ≈ this many of your strikes; reward = minutes of GPS.
export const DRAGON_HP_CLICKS = 60;
export const DRAGON_TIME = 35;          // seconds to slay it
export const DRAGON_REWARD_MINUTES = 30;
export const DRAGON_IMAGES = [
  '/Bosses/Math/Boss 1.png', '/Bosses/Math/Boss 2.png', '/Bosses/Math/Boss 3.png', '/Bosses/Math/Boss 4.png',
  '/Bosses/English/Boss 1.png', '/Bosses/Science/Boss 1.png', '/Bosses/HaSS/Boss 1.png', '/Bosses/Art/Boss 1.png',
];

// ═══════════════════════════════════════════════════════════════════════════
// BATTLE MOMENTUM combo (internally "Sugar Rush")
// ═══════════════════════════════════════════════════════════════════════════
export const COMBO_MAX = 100;            // combo points
export const COMBO_MAX_BONUS = 1.0;      // +100% strike power at max momentum
export const COMBO_GAIN_PER_CLICK = 4;   // points gained per strike (25 strikes to max)
export const COMBO_DECAY_PER_SEC = 3;    // points lost per second idle
export const COMBO_DECAY_GRACE_MS = 1200; // no decay this soon after a strike

// Anti-autoclicker: if this many strikes land within the window, the weapon
// overheats and can't be used for the cooldown period. 30 clicks in 2s = a
// sustained 15 clicks/sec — beyond honest human clicking.
export const AUTOCLICK_WINDOW_CLICKS = 30;
export const AUTOCLICK_WINDOW_MS = 2000;
export const WEAPON_BREAK_SECONDS = 20;

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE UNLOCKS — the slow-grind chase items that theme student profiles
// (ids unchanged — students keep everything they've already unlocked/equipped)
// ═══════════════════════════════════════════════════════════════════════════
export const SE_THEMES = [
  { id: 'strawberry', name: 'Rosefire Banner',   icon: '🌹', req: { type: 'rebirths', value: 1 },  reqText: '1 Heroic Ascension' },
  { id: 'mint',       name: 'Emerald Grove',     icon: '🌿', req: { type: 'rebirths', value: 3 },  reqText: '3 Heroic Ascensions' },
  { id: 'blueberry',  name: 'Sapphire Ward',     icon: '🔷', req: { type: 'rebirths', value: 6 },  reqText: '6 Heroic Ascensions' },
  { id: 'licorice',   name: 'Shadowplate',       icon: '🖤', req: { type: 'golden', value: 100 },  reqText: '100 loot chests opened' },
  { id: 'caramel',    name: 'Gilded Honour',     icon: '🏅', req: { type: 'rebirths', value: 10 }, reqText: '10 Heroic Ascensions' },
  { id: 'bubblegum',  name: 'Arcane Bloom',      icon: '🔮', req: { type: 'lifetime', value: 1e12 }, reqText: '1T lifetime gold' },
  { id: 'rainbow',    name: 'Prismatic Legend',  icon: '🌈', req: { type: 'achievements', value: 30 }, reqText: '30 achievements' },
  { id: 'galaxy',     name: 'Astral Voyage',     icon: '🌌', req: { type: 'rebirths', value: 20 }, reqText: '20 Heroic Ascensions' },
  { id: 'royal',      name: 'Crown of Kings',    icon: '👑', req: { type: 'lifetime', value: 1e15 }, reqText: '1Qa lifetime gold' },
  { id: 'eternal',    name: 'Eternal Flame',     icon: '🔥', req: { type: 'rebirths', value: 40 }, reqText: '40 Heroic Ascensions' },
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
  { id: 'kitchenhand', name: 'Villager',          req: { type: 'lifetime', value: 0 },    reqText: 'Start playing', color: 'text-gray-500',    darkColor: 'text-slate-400' },
  { id: 'apprentice',  name: 'Squire',            req: { type: 'lifetime', value: 1e6 },  reqText: '1M lifetime gold', color: 'text-green-600', darkColor: 'text-green-400' },
  { id: 'pastrychef',  name: 'Knight',            req: { type: 'lifetime', value: 1e9 },  reqText: '1B lifetime gold', color: 'text-blue-600',  darkColor: 'text-blue-400' },
  { id: 'headbaker',   name: 'Champion',          req: { type: 'rebirths', value: 1 },    reqText: '1 Heroic Ascension', color: 'text-purple-600',  darkColor: 'text-purple-400' },
  { id: 'sugarsmith',  name: 'Warlord',           req: { type: 'rebirths', value: 5 },    reqText: '5 Heroic Ascensions', color: 'text-orange-600', darkColor: 'text-orange-400' },
  { id: 'grandmaster', name: 'Grand Champion',    req: { type: 'rebirths', value: 10 },   reqText: '10 Heroic Ascensions', color: 'text-yellow-600', darkColor: 'text-yellow-400' },
  { id: 'sweetlord',   name: 'Living Legend',     req: { type: 'rebirths', value: 20 },   reqText: '20 Heroic Ascensions', color: 'text-pink-600',   darkColor: 'text-pink-400' },
  { id: 'dessertdeity', name: 'Demigod',          req: { type: 'rebirths', value: 35 },   reqText: '35 Heroic Ascensions', color: 'text-cyan-600',   darkColor: 'text-cyan-400' },
  { id: 'sultan',      name: 'Eternal Champion',  req: { type: 'rebirths', value: 50 },   reqText: '50 Heroic Ascensions', color: 'text-amber-500',  darkColor: 'text-amber-300' },
];

// Special effects — animated rings/glows on the profile card. The rarest tier.
export const SE_EFFECTS = [
  { id: 'sprinkle_ring', name: 'Rose Halo',       icon: '🌹', req: { type: 'rebirths', value: 2 },  reqText: '2 Heroic Ascensions',
    cls: 'ring-4 ring-pink-300 shadow-md shadow-pink-300/50' },
  { id: 'caramel_glow',  name: 'Golden Aura',     icon: '🏅', req: { type: 'rebirths', value: 8 },  reqText: '8 Heroic Ascensions',
    cls: 'ring-4 ring-amber-400 shadow-lg shadow-amber-400/50' },
  { id: 'mint_aura',     name: 'Verdant Aura',    icon: '🌿', req: { type: 'golden', value: 250 },  reqText: '250 loot chests',
    cls: 'ring-4 ring-emerald-400 shadow-lg shadow-emerald-400/60' },
  { id: 'sugar_storm',   name: 'Storm of Blades', icon: '🌪️', req: { type: 'rebirths', value: 15 }, reqText: '15 Heroic Ascensions',
    cls: 'animate-pulse ring-4 ring-cyan-400 shadow-xl shadow-cyan-400/60' },
  { id: 'royal_radiance', name: 'Royal Radiance', icon: '👑', req: { type: 'rebirths', value: 30 }, reqText: '30 Heroic Ascensions',
    cls: 'animate-pulse ring-4 ring-offset-2 ring-yellow-400 shadow-2xl shadow-yellow-400/60' },
  { id: 'confection_crown', name: 'Crown of Legends', icon: '💎', req: { type: 'allAchievements', value: true }, reqText: 'Earn EVERY achievement',
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
export const OFFLINE_RATE = 0.5; // offline production runs at 50% of GPS

export const defaultSave = () => ({
  balancePatch: 2,    // save version — new players never receive old-balance resets
  sweets: 0,          // current gold in hoard
  runSweets: 0,       // gold this quest (drives stars + achievements)
  lifetimeSweets: 0,  // gold across all quests
  clicks: 0,
  goldenClicks: 0,    // loot chests opened
  buildings: {},
  upgrades: [],
  achievements: [],
  sugarStars: 0,      // Glory Stars
  starUpgrades: [],
  rebirths: 0,        // Heroic Ascensions
  dragonsSlain: 0,
  eventsClaimed: 0,
  unlockedThemes: [],
  unlockedTitles: ['kitchenhand'],
  unlockedEffects: [],
  activeTheme: null,
  activeTitle: 'kitchenhand',
  activeEffect: null,
  lastSeen: null,
  lastSaved: null,
});
// EOF
