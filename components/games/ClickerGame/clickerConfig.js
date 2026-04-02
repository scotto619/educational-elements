// components/games/ClickerGame/clickerConfig.js
// Pure game configuration data — no state or component logic.

export const WEAPONS = {
  '1': { name: 'Novice Blade', icon: '??', path: '/Hero Forge/Items/Weapons/1.png', requirement: null, dpcMultiplier: 1 },
  '2': { name: 'Mystic Staff', icon: '??', path: '/Hero Forge/Items/Weapons/2.png', requirement: { type: 'level', value: 10 }, dpcMultiplier: 2 },
  '3': { name: 'Frost Axe', icon: '??', path: '/Hero Forge/Items/Weapons/3.png', requirement: { type: 'level', value: 20 }, dpcMultiplier: 4 },
  '4': { name: 'Shadow Daggers', icon: '???', path: '/Hero Forge/Items/Weapons/4.png', requirement: { type: 'level', value: 30 }, dpcMultiplier: 8 },
  '5': { name: 'Elven Bow', icon: '??', path: '/Hero Forge/Items/Weapons/5.png', requirement: { type: 'level', value: 40 }, dpcMultiplier: 16 },
  '6': { name: 'Orcish Cleaver', icon: '??', path: '/Hero Forge/Items/Weapons/6.png', requirement: { type: 'level', value: 50 }, dpcMultiplier: 32 },
  '7': { name: 'Divine Hammer', icon: '??', path: '/Hero Forge/Items/Weapons/7.png', requirement: { type: 'level', value: 60 }, dpcMultiplier: 64 },
  '8': { name: 'Nature\'s Whip', icon: '??', path: '/Hero Forge/Items/Weapons/8.png', requirement: { type: 'level', value: 70 }, dpcMultiplier: 128 },
  '9': { name: 'Celestial Orb', icon: '?', path: '/Hero Forge/Items/Weapons/9.png', requirement: { type: 'level', value: 80 }, dpcMultiplier: 256 },
  '10': { name: 'Heart Mace', icon: '??', path: '/Hero Forge/Items/Weapons/10.png', requirement: { type: 'level', value: 90 }, dpcMultiplier: 512 },

  // Chest exclusively found weapons (VERY RARE)
  '11': { name: 'Mechanical Gauntlet', icon: '??', path: '/Hero Forge/Items/Weapons/11.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 1024 },
  '12': { name: 'Golden Hammer', icon: '??', path: '/Hero Forge/Items/Weapons/12.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 2048 },
  '13': { name: 'Electro Staff', icon: '?', path: '/Hero Forge/Items/Weapons/13.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 4096 },
  '14': { name: 'Void Staff', icon: '??', path: '/Hero Forge/Items/Weapons/14.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 8192 },
  '15': { name: 'Elemental Trident', icon: '??', path: '/Hero Forge/Items/Weapons/15.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 16384 },
  '16': { name: 'Soul Reaper', icon: '??', path: '/Hero Forge/Items/Weapons/16.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 32768 },
  '17': { name: 'Cosmic Blades', icon: '??', path: '/Hero Forge/Items/Weapons/17.png', requirement: { type: 'chest', value: true }, dpcMultiplier: 65536 },

  // Boss rewards (Blood moon exclusive bosses)
  '18': { name: 'Genesis Sword', icon: '??', path: '/Hero Forge/Items/Weapons/18.png', requirement: { type: 'boss', value: 'skeleton_lord' }, dpcMultiplier: 131072 },
  '19': { name: 'Reality Breaker', icon: '?', path: '/Hero Forge/Items/Weapons/19.png', requirement: { type: 'bossDefeated', value: 'skeleton_lord' }, dpcMultiplier: 262144 },
  '20': { name: 'Infinity Edge', icon: '??', path: '/Hero Forge/Items/Weapons/20.png', requirement: { type: 'bossDefeated', value: 'demon_lord' }, dpcMultiplier: 524288 },
  '21': { name: 'Omnislayer', icon: '??', path: '/Hero Forge/Items/Weapons/21.png', requirement: { type: 'bossDefeated', value: 'death_dragon' }, dpcMultiplier: 1048576 }
};

// NEW: Enemy definitions with difficulty tiers and varied skill tests
export const ENEMIES = {
  Day: [
    { id: 'mouse', name: 'Field Mouse', path: '/Hero Forge/Day/Enemies/Mouse.png', hp: 20, timeLimit: 15, skillTest: 'Quick Click', baseGold: 10, xp: 2, difficulty: 1 },
    { id: 'slime', name: 'Green Slime', path: '/Hero Forge/Day/Enemies/Slime.png', hp: 50, timeLimit: 20, skillTest: 'Split Target', baseGold: 20, xp: 5, difficulty: 2 },
    { id: 'mushroom', name: 'Toxic Mushroom', path: '/Hero Forge/Day/Enemies/Mushroom.png', hp: 150, timeLimit: 25, skillTest: 'Poison Spores', baseGold: 60, xp: 15, difficulty: 3 },
    { id: 'wisp', name: 'Forest Wisp', path: '/Hero Forge/Day/Enemies/Wisp.png', hp: 300, timeLimit: 25, skillTest: 'Erratic Orbit', baseGold: 160, xp: 30, difficulty: 4 },
    { id: 'goblin', name: 'Scavenger Goblin', path: '/Hero Forge/Day/Enemies/Goblin.png', hp: 1000, timeLimit: 30, skillTest: 'Ambush', baseGold: 500, xp: 80, difficulty: 5 }
  ],
  Night: [
    { id: 'orc', name: 'Orc Marauder', path: '/Hero Forge/Night/Enemies/Orc.png', hp: 2500, timeLimit: 30, skillTest: 'Brute Force', baseGold: 1000, xp: 160, difficulty: 6 },
    { id: 'golem', name: 'Stone Golem', path: '/Hero Forge/Night/Enemies/Golem.png', hp: 8000, timeLimit: 35, skillTest: 'Shield Block', baseGold: 3000, xp: 400, difficulty: 7 },
    { id: 'knightreaper', name: 'Knight Reaper', path: '/Hero Forge/Night/Enemies/KnightReaper.png', hp: 25000, timeLimit: 40, skillTest: 'Combo Sequence', baseGold: 10000, xp: 1000, difficulty: 8 },
    { id: 'lootgoblin', name: 'Loot Goblin', path: '/Hero Forge/Night/Enemies/LootGoblin.png', hp: 50000, timeLimit: 15, skillTest: 'Gold Rush', baseGold: 20000, xp: 2000, difficulty: 9 },
    { id: 'dragon', name: 'Elder Dragon', path: '/Hero Forge/Night/Enemies/Dragon.png', hp: 100000, timeLimit: 45, skillTest: 'Inferno', baseGold: 50000, xp: 5000, difficulty: 10 }
  ]
};

// NEW: Merchant Artifacts (Purchasable upgrades)
export const MERCHANT_ITEMS = {
  // Common items (Cost: 1500)
  '1': { id: '1', name: 'Galaxy Ball', path: '/Hero Forge/Items/Artifacts/1.png', type: 'dps', effectType: 'additive', value: 1, desc: '+1 GPS (Auto mining)', cost: 1500, rarity: 'common' },
  '2': { id: '2', name: 'Necro Book', path: '/Hero Forge/Items/Artifacts/2.png', type: 'damage', effectType: 'additive', value: 1, desc: '+1 Weapon Damage', cost: 1500, rarity: 'common' },
  '3': { id: '3', name: 'Lute', path: '/Hero Forge/Items/Artifacts/3.png', type: 'gpc', effectType: 'additive', value: 1, desc: '+1 Gold per click', cost: 1500, rarity: 'common' },
  '4': { id: '4', name: 'Lion Medal', path: '/Hero Forge/Items/Artifacts/4.png', type: 'dps', effectType: 'additive', value: 3, desc: '+3 GPS', cost: 4500, rarity: 'common' },
  '5': { id: '5', name: 'Sand Wand', path: '/Hero Forge/Items/Artifacts/5.png', type: 'gpc', effectType: 'additive', value: 3, desc: '+3 Gold per click', cost: 4500, rarity: 'common' },
  '6': { id: '6', name: 'Quiver', path: '/Hero Forge/Items/Artifacts/6.png', type: 'damage', effectType: 'additive', value: 3, desc: '+3 Weapon Damage', cost: 4500, rarity: 'common' },

  // Rare items (Cost: 25000)
  '7': { id: '7', name: 'Rogue Mask', path: '/Hero Forge/Items/Artifacts/7.png', type: 'dps', effectType: 'additive', value: 5, desc: '+5 GPS', cost: 25000, rarity: 'rare' },
  '8': { id: '8', name: 'Skull Totem', path: '/Hero Forge/Items/Artifacts/8.png', type: 'damage', effectType: 'additive', value: 5, desc: '+5 Weapon Damage', cost: 25000, rarity: 'rare' },
  '9': { id: '9', name: 'Horn', path: '/Hero Forge/Items/Artifacts/9.png', type: 'gpc', effectType: 'additive', value: 5, desc: '+5 Gold Per click', cost: 25000, rarity: 'rare' },
  '10': { id: '10', name: 'Dark Moon', path: '/Hero Forge/Items/Artifacts/10.png', type: 'dps', effectType: 'additive', value: 7, desc: '+7 GPS', cost: 50000, rarity: 'rare' },
  '11': { id: '11', name: 'Air Crystal', path: '/Hero Forge/Items/Artifacts/11.png', type: 'damage', effectType: 'additive', value: 7, desc: '+7 Weapon Damage', cost: 50000, rarity: 'rare' },
  '12': { id: '12', name: 'Harp', path: '/Hero Forge/Items/Artifacts/12.png', type: 'gpc', effectType: 'additive', value: 7, desc: '+7 Gold per click', cost: 50000, rarity: 'rare' },

  // Legendary items (Cost: 2500000)
  '13': { id: '13', name: 'Bell', path: '/Hero Forge/Items/Artifacts/13.png', type: 'gpc', effectType: 'multiplicative', value: 1.5, desc: 'x1.5 Gold per click', cost: 2500000, rarity: 'legendary' },
  '14': { id: '14', name: 'Water Ball', path: '/Hero Forge/Items/Artifacts/14.png', type: 'dps', effectType: 'multiplicative', value: 1.5, desc: 'x1.5 GPS', cost: 2500000, rarity: 'legendary' },
  '15': { id: '15', name: 'Ice crystal', path: '/Hero Forge/Items/Artifacts/15.png', type: 'damage', effectType: 'multiplicative', value: 1.5, desc: 'x1.5 Weapon damage', cost: 2500000, rarity: 'legendary' },
  '16': { id: '16', name: 'Hourglass', path: '/Hero Forge/Items/Artifacts/16.png', type: 'dps', effectType: 'multiplicative', value: 2, desc: 'x2 GPS', cost: 10000000, rarity: 'legendary' },
  '17': { id: '17', name: 'Leaf Totem', path: '/Hero Forge/Items/Artifacts/17.png', type: 'gpc', effectType: 'multiplicative', value: 2, desc: 'x2 Gold per click', cost: 10000000, rarity: 'legendary' },
  '18': { id: '18', name: 'Boar Head', path: '/Hero Forge/Items/Artifacts/18.png', type: 'damage', effectType: 'multiplicative', value: 2, desc: 'x2 Weapon Damage', cost: 10000000, rarity: 'legendary' },

  // Mythic items (Cost: 0 since they drop from chests only)
  '19': { id: '19', name: 'Compass', path: '/Hero Forge/Items/Artifacts/19.png', type: 'all', effectType: 'additive', value: 5, desc: '+5 All Stats', cost: 0, rarity: 'mythic', chestOnly: true },
  '20': { id: '20', name: 'Element Ball', path: '/Hero Forge/Items/Artifacts/20.png', type: 'all', effectType: 'multiplicative', value: 1.5, desc: 'x1.5 All Stats', cost: 0, rarity: 'mythic', chestOnly: true },
  '21': { id: '21', name: 'Mythic Ball', path: '/Hero Forge/Items/Artifacts/21.png', type: 'all', effectType: 'multiplicative', value: 2, desc: 'x2 All Stats', cost: 0, rarity: 'mythic', chestOnly: true },
};

export const RARITY_WEIGHTS = { common: 60, rare: 30, legendary: 9, mythic: 1 };

const pickArtifactByRarity = useCallback((excludeMythic = false) => {
  let pool = Object.values(MERCHANT_ITEMS);
  if (excludeMythic) pool = pool.filter(i => !i.chestOnly);

  let totalWeight = pool.reduce((sum, item) => sum + RARITY_WEIGHTS[item.rarity], 0);
  let random = Math.random() * totalWeight;

  for (const item of pool) {
    random -= RARITY_WEIGHTS[item.rarity];
    if (random <= 0) return item.id;
  }
  return pool[0].id; // Fallback
}, []);

// NEW: Environment Cycle logic
const isNight = gameState.currentCycle === 'Night' || gameState.currentCycle === 'BloodMoon';
const getBackgroundImage = () => {
  if (gameState.inCamp) {
    return isNight ? '/Hero Forge/Night/NightCamp.png' : '/Hero Forge/Day/DayCamp.png';
  }

  if (showChoiceEvent && gameState.event.shown) {
    if (gameState.event.type === 'merchant') {
      return gameState.currentCycle === 'Night' || gameState.currentCycle === 'BloodMoon'
        ? '/Hero Forge/Night/Events/DarkMerchant.png'
        : '/Hero Forge/Day/Events/Merchant.png';
    }
    return gameState.event.image || '/Hero Forge/Day/DayMining.png';
  }
  if (gameState.activeEnemy) {
    return gameState.activeEnemy.path;
  }
  switch (gameState.currentCycle) {
    case 'BloodMoon': return '/Hero Forge/BloodMoon/BloodMoonMining.png';
    case 'Night': return '/Hero Forge/Night/NightMining.png';
    case 'Snow': return '/Hero Forge/Snow/SnowMining.png';
    default: return '/Hero Forge/Day/DayMining.png'; // Day
  }
};

const backgroundStyle = {
  backgroundImage: `url('${getBackgroundImage()}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  transition: 'background-image 1s ease-in-out'
};



// EXPANDED Theme definitions with PRESTIGE themes
export const THEMES = {
  default: {
    name: 'Hero\'s Dawn',
    bg: 'from-blue-50 to-purple-100',
    panel: 'bg-white text-gray-800',
    accent: 'from-blue-500 to-purple-600',
    requirement: null
  },
  dark: {
    name: 'Shadow Realm',
    bg: 'from-gray-900 to-black',
    panel: 'bg-gray-800 text-white',
    accent: 'from-purple-600 to-pink-600',
    requirement: { type: 'totalGold', value: 10000 }
  },
  forest: {
    name: 'Elven Grove',
    bg: 'from-green-100 to-emerald-200',
    panel: 'bg-green-50 text-gray-800',
    accent: 'from-green-500 to-emerald-600',
    requirement: { type: 'attacks', value: 500 }
  },
  fire: {
    name: 'Dragon\'s Lair',
    bg: 'from-red-100 to-orange-200',
    panel: 'bg-red-50 text-gray-800',
    accent: 'from-red-500 to-orange-600',
    requirement: { type: 'artifacts', value: 25 }
  },
  ice: {
    name: 'Frozen Peaks',
    bg: 'from-cyan-100 to-blue-200',
    panel: 'bg-cyan-50 text-gray-800',
    accent: 'from-cyan-500 to-blue-600',
    requirement: { type: 'dps', value: 50 }
  },
  cosmic: {
    name: 'Void Dimension',
    bg: 'from-purple-900 to-indigo-900',
    panel: 'bg-purple-800 text-white',
    accent: 'from-pink-500 to-purple-600',
    requirement: { type: 'prestige', value: 1 }
  },
  desert: {
    name: 'Desert Oasis',
    bg: 'from-yellow-100 to-orange-200',
    panel: 'bg-yellow-50 text-gray-800',
    accent: 'from-yellow-500 to-orange-600',
    requirement: { type: 'totalGold', value: 50000 }
  },
  ocean: {
    name: 'Ocean Depths',
    bg: 'from-blue-200 to-teal-300',
    panel: 'bg-blue-50 text-gray-800',
    accent: 'from-blue-600 to-teal-600',
    requirement: { type: 'attacks', value: 2000 }
  },
  mystic: {
    name: 'Mystic Grove',
    bg: 'from-purple-200 to-pink-200',
    panel: 'bg-purple-50 text-gray-800',
    accent: 'from-purple-600 to-pink-600',
    requirement: { type: 'artifacts', value: 75 }
  },
  celestial: {
    name: 'Celestial Realm',
    bg: 'from-indigo-200 to-purple-300',
    panel: 'bg-indigo-50 text-gray-800',
    accent: 'from-indigo-600 to-purple-600',
    requirement: { type: 'totalGold', value: 500000 }
  },
  volcanic: {
    name: 'Volcanic Forge',
    bg: 'from-red-200 to-gray-400',
    panel: 'bg-red-100 text-gray-800',
    accent: 'from-red-600 to-gray-700',
    requirement: { type: 'prestige', value: 3 }
  },

  // NEW: Ultra-exclusive prestige themes
  transcendent: {
    name: 'Transcendent Plane',
    bg: 'from-yellow-200 via-pink-300 to-purple-400',
    panel: 'bg-gradient-to-br from-white to-yellow-50 text-gray-800',
    accent: 'from-yellow-600 to-pink-600',
    requirement: { type: 'prestige', value: 10 }
  },
  omnipotent: {
    name: 'Omnipotent Realm',
    bg: 'from-black via-purple-900 to-pink-900',
    panel: 'bg-black text-white border-2 border-purple-500',
    accent: 'from-purple-500 to-pink-500',
    requirement: { type: 'prestige', value: 20 }
  },
  infinite: {
    name: 'Infinite Cosmos',
    bg: 'from-indigo-900 via-purple-900 to-pink-900',
    panel: 'bg-gray-900 text-white border-2 border-yellow-400',
    accent: 'from-yellow-400 to-orange-500',
    requirement: { type: 'masterLevel', value: 5 }
  }
};

// EXPANDED title definitions with MASTER tiers
export const TITLES = {
  'Novice': { requirement: null, color: 'text-gray-600', glow: '' },
  'Apprentice': { requirement: { type: 'totalGold', value: 500 }, color: 'text-green-600', glow: 'shadow-green-500/50' },
  'Warrior': { requirement: { type: 'attacks', value: 100 }, color: 'text-blue-600', glow: 'shadow-blue-500/50' },
  'Hero': { requirement: { type: 'totalGold', value: 5000 }, color: 'text-purple-600', glow: 'shadow-purple-500/50' },
  'Champion': { requirement: { type: 'artifacts', value: 10 }, color: 'text-orange-600', glow: 'shadow-orange-500/50' },
  'Legend': { requirement: { type: 'totalGold', value: 50000 }, color: 'text-yellow-600', glow: 'shadow-yellow-500/50' },
  'Mythic': { requirement: { type: 'prestige', value: 1 }, color: 'text-pink-600', glow: 'shadow-pink-500/50' },
  'Ascended': { requirement: { type: 'prestige', value: 3 }, color: 'text-cyan-400', glow: 'shadow-cyan-400/50' },
  'Divine': { requirement: { type: 'prestige', value: 5 }, color: 'text-yellow-400', glow: 'shadow-yellow-400/50' },
  'Eternal': { requirement: { type: 'prestige', value: 10 }, color: 'text-purple-400', glow: 'shadow-purple-400/50' },

  // NEW: Master tier titles
  'Transcendent': { requirement: { type: 'prestige', value: 15 }, color: 'text-gradient-to-r from-yellow-400 to-pink-400', glow: 'shadow-yellow-400/70' },
  'Omnipotent': { requirement: { type: 'prestige', value: 20 }, color: 'text-gradient-to-r from-purple-400 to-pink-400', glow: 'shadow-purple-400/90' },
  'Cosmic Master': { requirement: { type: 'prestige', value: 25 }, color: 'text-gradient-to-r from-blue-300 to-purple-300', glow: 'shadow-blue-400/90' },
  'Reality Shaper': { requirement: { type: 'masterLevel', value: 1 }, color: 'text-gradient-to-r from-red-300 to-yellow-300', glow: 'shadow-red-400/90' },
  'Infinity Lord': { requirement: { type: 'masterLevel', value: 10 }, color: 'text-white', glow: 'shadow-white/100 animate-pulse' }
};

// NEW: Boss definitions for epic encounters
export const BOSS_ENCOUNTERS = [
  {
    id: 'skeleton_lord',
    name: 'Skeleton Lord',
    path: '/Hero Forge/BloodMoon/Enemies/SkeletonLord.png',
    health: 5000000,
    goldReward: 500000,
    specialReward: { type: 'weapon', value: '18' },
    requirement: { type: 'level', value: 10 },
    phases: [
      { healthPercent: 100, message: 'The Skeleton Lord rattles to life!' },
      { healthPercent: 50, message: 'The Skeleton Lord summons an army of bones!' },
      { healthPercent: 10, message: 'The Skeleton Lord unleashes a deathly scream!' }
    ]
  },
  {
    id: 'demon_lord',
    name: 'Demon Lord',
    path: '/Hero Forge/BloodMoon/Enemies/DemonLord.png',
    health: 50000000,
    goldReward: 5000000,
    specialReward: { type: 'weapon', value: '19' },
    requirement: { type: 'bossDefeated', value: 'skeleton_lord' },
    phases: [
      { healthPercent: 100, message: 'The Demon Lord steps out of a portal of fire!' },
      { healthPercent: 50, message: 'The Demon Lord envelops the area in flames!' },
      { healthPercent: 10, message: 'The Demon Lord unleashes his ultimate hellfire!' }
    ]
  },
  {
    id: 'death_dragon',
    name: 'Death Dragon',
    path: '/Hero Forge/BloodMoon/Enemies/DeathDragon.png',
    health: 500000000,
    goldReward: 50000000,
    specialReward: { type: 'weapon', value: '20' },
    requirement: { type: 'bossDefeated', value: 'demon_lord' },
    phases: [
      { healthPercent: 100, message: 'The sky darkens as the Death Dragon descends!' },
      { healthPercent: 50, message: 'The Death Dragon scorches the earth with necromancy!' },
      { healthPercent: 10, message: 'The Death Dragon channels the energy of departed souls!' }
    ]
  },
  {
    id: 'abyss',
    name: 'The Abyss',
    path: '/Hero Forge/BloodMoon/Enemies/Abyss.png',
    health: 5000000000,
    goldReward: 500000000,
    specialReward: { type: 'weapon', value: '21' },
    requirement: { type: 'bossDefeated', value: 'death_dragon' },
    phases: [
      { healthPercent: 100, message: 'The very fabric of reality tears as The Abyss awakens!' },
      { healthPercent: 50, message: 'The Abyss begins to consume light itself!' },
      { healthPercent: 10, message: 'The Abyss attempts to swallow your soul!' }
    ]
  }
];

// NEW: Interactive skill challenges
export const SKILL_CHALLENGES = [
  {
    id: 'timing_challenge',
    name: 'Perfect Timing',
    description: 'Click when the indicator hits the green zone!',
    type: 'timing',
    difficulty: 'medium',
    goldReward: 5000,
    duration: 10000
  },
  {
    id: 'sequence_challenge',
    name: 'Memory Sequence',
    description: 'Repeat the sequence of clicks!',
    type: 'sequence',
    difficulty: 'hard',
    goldReward: 15000,
    duration: 30000
  },
  {
    id: 'rapid_fire',
    name: 'Rapid Fire',
    description: 'Click as fast as you can!',
    type: 'speed',
    difficulty: 'easy',
    goldReward: 3000,
    duration: 5000
  }
];

// NEW: Skill Shop Upgrades
export const SKILL_UPGRADES = {
  'gold_boost': {
    id: 'gold_boost',
    name: 'Midas Touch',
    description: 'Increases global gold gain by +10% per level',
    maxLevel: 10,
    costPerLevel: 1,
    costScale: 1.5,
    type: 'passive',
    effect: (level) => ({ type: 'globalGoldMult', value: 1 + (level * 0.1) })
  },
  'auto_clicker': {
    id: 'auto_clicker',
    name: 'Phantom Strike',
    description: 'Auto-clicks once every (11 - level) seconds',
    maxLevel: 10,
    costPerLevel: 2,
    costScale: 1.2,
    type: 'active',
    effect: (level) => ({ type: 'autoClick', value: Math.max(1, 11 - level) })
  },
  'crit_chance': {
    id: 'crit_chance',
    name: 'Critical Eye',
    description: '+1% chance to deal double damage per click',
    maxLevel: 20,
    costPerLevel: 1,
    costScale: 1.2,
    type: 'passive',
    effect: (level) => ({ type: 'critChance', value: level * 0.01 })
  },
  'event_luck': {
    id: 'event_luck',
    name: 'Fortune Seeker',
    description: 'Good events appear 5% more often per level',
    maxLevel: 5,
    costPerLevel: 3,
    costScale: 2,
    type: 'passive',
    effect: (level) => ({ type: 'eventRarity', value: 1 + (level * 0.05) })
  },
  'gem_hunter': {
    id: 'gem_hunter',
    name: 'Gem Hunter',
    description: 'Small chance to find 1 Skill Point when clicking (Very Rare)',
    maxLevel: 1,
    costPerLevel: 25,
    costScale: 1,
    type: 'passive',
    effect: (level) => ({ type: 'skillPointChance', value: 0.0001 }) // 0.01% chance
  },
  'offline_efficiency': {
    id: 'offline_efficiency',
    name: 'Restful Sleep',
    description: 'Increases Idle/Offline Gold generation by 10% per level',
    maxLevel: 10,
    costPerLevel: 5,
    costScale: 1.5,
    type: 'passive',
    effect: (level) => ({ type: 'offlineEfficiency', value: level * 0.1 })
  },
  'event_cap': {
    id: 'event_cap',
    name: 'Eagle Eye',
    description: 'Reduces the time between events by 5 seconds per level',
    maxLevel: 10,
    costPerLevel: 3,
    costScale: 1.3,
    type: 'passive',
    effect: (level) => ({ type: 'eventCooldownReduction', value: level * 5 })
  }
};

// NEW: Enhanced choice events - No "walk away", all require a choice.
export const CHOICE_EVENTS = [
  // DAY
  {
    text: "?? A Friendly Fairy flutters down, offering two sparkling dusts.",
    image: '/Hero Forge/Day/Events/FriendlyFairy.png',
    cycle: 'Day',
    choices: [
      { text: "Sprinkle Gold Dust (+Gold)", effect: { type: 'goldGain', amount: 0.1 } },
      { text: "Sprinkle Red Dust (+DPS 60s)", effect: { type: 'randomBoon', duration: 60000 } }
    ]
  },
  {
    text: "?? You find an ancient Tome. It hums with magical energy.",
    image: '/Hero Forge/Day/Events/Tome.png',
    cycle: 'Day',
    choices: [
      { text: "Study its secrets (Skill Test)", effect: { type: 'skillChallenge', challengeType: 'sequence_challenge' } },
      { text: "Sell it to a collector (+Gold)", effect: { type: 'goldGain', amount: 0.15 } }
    ]
  },
  // NIGHT
  {
    text: "????? A Mysterious Wizard blocks your path. \"A test of reflexes!\"",
    image: '/Hero Forge/Night/Events/MysteryWizard.png',
    cycle: 'Night',
    choices: [
      { text: "Accept the test!", effect: { type: 'skillChallenge', challengeType: 'rapid_fire' } },
      { text: "Bribe him to leave (-Gold)", effect: { type: 'loseGold', amount: 0.05 } }
    ]
  },
  {
    text: "?? A Friendly Wisp offers to guide you, for a price.",
    image: '/Hero Forge/Night/Events/FriendlyWisp.png',
    cycle: 'Night',
    choices: [
      { text: "Follow the Wisp (+Gold)", effect: { type: 'goldGain', amount: 0.2 } },
      { text: "Capture its energy (+DPS 120s)", effect: { type: 'randomBoon', duration: 120000 } }
    ]
  },
  // SNOW
  {
    text: "? An enchanted Snowman challenges you to a freezing duel.",
    image: '/Hero Forge/Snow/Events/SnowMan.png',
    cycle: 'Snow',
    choices: [
      { text: "Fight the Snowman!", effect: { type: 'skillChallenge', challengeType: 'timing_challenge' } },
      { text: "Smash it quickly (+Gold)", effect: { type: 'smallGoldGain', amount: 0.05 } }
    ]
  },
  {
    text: "?? A lake is completely Frozen Over. Below the ice, something glimmers.",
    image: '/Hero Forge/Snow/Events/FrozenOver.png',
    cycle: 'Snow',
    choices: [
      { text: "Carefully chip the ice (+Gold)", effect: { type: 'goldGain', amount: 0.15 } },
      { text: "Smash it! (Risk Damage)", effect: { type: 'shrineGamble' } }
    ]
  },
  // BLOOD MOON
  {
    text: "?? A terrifying Death Rift tears open reality!",
    image: '/Hero Forge/BloodMoon/Events/DeathRift.png',
    cycle: 'BloodMoon',
    choices: [
      { text: "Harvest Rift Crystals (+Gold)", effect: { type: 'goldGain', amount: 0.35 } },
      { text: "Stabilize the Rift (+DPS 120s)", effect: { type: 'randomBoon', duration: 120000 } }
    ]
  }
];
CHOICE_EVENTS.push({
  text: "A frozen Locked Ice Chest is stuck in the ice...",
  image: "/Hero Forge/Snow/Events/LockedIceChest.png",
  cycle: 'Snow',
  choices: [
    { text: "🗝️ Use Ice Key", effect: { type: 'openChest', keyType: 'ice' } },
    { text: "🏃 Leave it", effect: { type: 'nothing' } }
  ]
});

// NEW: Additional Fun Events
CHOICE_EVENTS.push({
  text: "🎲 You encounter The Gambler. He proposes a high-stakes game. Bet 25% of your gold?",
  image: "/Hero Forge/Day/Events/Gambler.png", // Assume we have this or fallback works
  choices: [
    { text: "💰 Bet 25% (30% to TRIPLE it)", effect: { type: 'gambler_bet' } },
    { text: "❌ Not my style", effect: { type: 'nothing' } }
  ]
});

CHOICE_EVENTS.push({
  text: "🎵 A Traveling Bard offers to play an inspiring tune for 10% of your gold.",
  image: "/Hero Forge/Day/Events/TravelingBard.png",
  choices: [
    { text: "🪙 Pay the Bard (Massive DPS boost)", effect: { type: 'bard_song' } },
    { text: "❌ Save my gold", effect: { type: 'nothing' } }
  ]
});

CHOICE_EVENTS.push({
  text: "✨ A Mysterious Portal shimmers before you. It could lead anywhere.",
  image: "/Hero Forge/Night/Events/Portal.png",
  choices: [
    { text: "🚪 Step through", effect: { type: 'mysterious_portal' } },
    { text: "❌ Ignore it", effect: { type: 'nothing' } }
  ]
});

