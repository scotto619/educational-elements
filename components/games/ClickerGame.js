// components/games/ClickerGame.js - ENHANCED WITH MUSIC, NEW EVENTS & HIGH-LEVEL REWARDS
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const getStudentIdentifier = (student) =>
  student?.id || student?.studentId || student?.uid || student?.userId || student?.email || null;

const ClickerGame = ({ studentData, updateStudentData, showToast, classmates = [] }) => {
  // Game state
  const [gameState, setGameState] = useState({
    gold: 0,
    totalGold: 0,
    handGold: 0,
    attacks: 0,
    dpcBase: 1,
    dpcMult: 1,
    globalDpsMult: 1,
    buyAmount: 1,
    timePlayed: 0,
    lastSave: Date.now(),
    multipliers: {},
    artifacts: [
      { key: 'orb', name: 'Crystal Orb', baseCost: 15, count: 0, baseDps: 0.1, icon: '1', path: '/Loot/Artifacts/1.png' },
      { key: 'tome', name: 'Ancient Tome', baseCost: 100, count: 0, baseDps: 1, icon: '2', path: '/Loot/Artifacts/2.png' },
      { key: 'lute', name: 'Mystic Lute', baseCost: 1100, count: 0, baseDps: 8, icon: '3', path: '/Loot/Artifacts/3.png' },
      { key: 'shield', name: 'Guardian Shield', baseCost: 12000, count: 0, baseDps: 47, icon: '4', path: '/Loot/Artifacts/4.png' },
      { key: 'chalice', name: 'Divine Chalice', baseCost: 130000, count: 0, baseDps: 260, icon: '5', path: '/Loot/Artifacts/5.png' },
      { key: 'crown', name: 'Crown of Ages', baseCost: 1400000, count: 0, baseDps: 1400, icon: '6', path: '/Loot/Artifacts/6.png' },
      { key: 'mask', name: 'Shadow Mask', baseCost: 20000000, count: 0, baseDps: 7800, icon: '7', path: '/Loot/Artifacts/7.png' },
      { key: 'totem', name: 'Primal Totem', baseCost: 330000000, count: 0, baseDps: 44000, icon: '8', path: '/Loot/Artifacts/8.png' },
      { key: 'phoenix', name: 'Phoenix Feather', baseCost: 5100000000, count: 0, baseDps: 260000, icon: '9', path: '/Loot/Artifacts/9.png' },
      { key: 'cauldron', name: 'Void Cauldron', baseCost: 75000000000, count: 0, baseDps: 1600000, icon: '10', path: '/Loot/Artifacts/10.png' }
    ],
    upgrades: [
      { id: 'orb-1', name: 'Enhance Crystal Orb', desc: 'Crystal Orbs are twice as efficient', cost: 100, req: { key: 'orb', count: 10 }, purchased: false },
      { id: 'tome-1', name: 'Forbidden Knowledge', desc: 'Ancient Tomes are twice as efficient', cost: 1000, req: { key: 'tome', count: 10 }, purchased: false },
      { id: 'lute-1', name: 'Harmonic Resonance', desc: 'Mystic Lutes are twice as efficient', cost: 11000, req: { key: 'lute', count: 10 }, purchased: false },
      { id: 'shield-1', name: 'Eternal Protection', desc: 'Guardian Shields are twice as efficient', cost: 120000, req: { key: 'shield', count: 10 }, purchased: false },
      { id: 'chalice-1', name: 'Divine Blessing', desc: 'Divine Chalices are twice as efficient', cost: 1300000, req: { key: 'chalice', count: 10 }, purchased: false },
      { id: 'attack-1', name: 'Weapon Mastery', desc: 'Attacks earn twice the gold', cost: 500, req: { key: null, count: 0 }, purchased: false },
      { id: 'attack-2', name: 'Legendary Technique', desc: 'Attacks earn 5x gold', cost: 50000000, req: { key: null, count: 0 }, purchased: false },
      { id: 'prestige-1', name: 'Ascended Power', desc: 'All artifacts are 50% more efficient', cost: 1000000000000, req: { key: null, count: 0 }, purchased: false },
    ],
    boons: [],
    event: { nextIn: 60 + Math.random() * 120, shown: false, until: 0, choices: [], eventText: '' },

    // Enhanced unlockables system
    unlockedWeapons: ['1'],
    activeWeapon: '1',
    unlockedThemes: ['default'],
    activeTheme: 'default',
    unlockedTitles: ['Novice'],
    activeTitle: 'Novice',
    achievements: [],
    prestige: 0,
    prestigePoints: 0,
    lifetimeEarnings: 0,

    // NEW: Music and high-level features
    musicEnabled: false,
    masterLevel: 0,
    challengesCompleted: [],
    bossesDefeated: [],
    skillPoints: 0,
    masteries: {},
    skillUpgrades: {}, // NEW: Track purchased skill upgrades
    currentCycle: 'Day',
    cycleClicks: 0,
    encounterClicks: 0,
    pickaxeLevel: 1,
    xp: 0, // NEW: Experience points
    level: 1, // NEW: Player level
    activeEnemy: null, // NEW: Currently fought enemy

    // NEW: Artifact Inventory System
    inventory: [], // List of acquired merchant artifact IDs
    equippedArtifacts: [null, null, null], // Max 3 equipped artifacts
    keys: { normal: 0, dark: 0, ice: 0 }, // NEW: Keys inventory
    nextEncounter: 'enemy', // NEW: Alternates between 'enemy' and 'event'

    // NEW: Camp Area
    inCamp: false,
    campShopItems: [],
    campShopPurchased: [],
    metalOre: 0, // NEW: Crafting material
  });

  const [selectedWeapon, setSelectedWeapon] = useState('1');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [showSkillShop, setShowSkillShop] = useState(false); // NEW: Skill Shop Modal State
  const [showCampShop, setShowCampShop] = useState(false); // NEW: Camp Shop Modal state
  const [showCraftingForge, setShowCraftingForge] = useState(false); // NEW: Crafting Forge Modal state
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showChoiceEvent, setShowChoiceEvent] = useState(false);
  const [eventTimeLeft, setEventTimeLeft] = useState(0);
  const [enemyTimeLeft, setEnemyTimeLeft] = useState(0); // NEW: Track time limit for active enemies
  const [showScoreboard, setShowScoreboard] = useState(false); // NEW: Scoreboard state
  const [showLevelUp, setShowLevelUp] = useState(false); // NEW: Level Up state
  const [levelUpData, setLevelUpData] = useState(null); // NEW: Level Up data

  // NEW: Challenge and boss states
  const [activeBoss, setActiveBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [maxBossHealth, setMaxBossHealth] = useState(0);
  const [triggeredPhases, setTriggeredPhases] = useState([]); // NEW: Track triggered boss phases
  const [showSkillChallenge, setShowSkillChallenge] = useState(false);
  const [challengeData, setChallengeData] = useState(null);

  // LOADING STATE
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  const gameLoopRef = useRef();
  const lastUpdateRef = useRef();
  const lastSaveRef = useRef(0);
  const nextRandomEncounterAtRef = useRef(null);
  const musicRef = useRef(null); // Background music reference

  // NEW: Anti-cheat state tracking
  const clickTimesRef = useRef([]);

  // EXPANDED: Weapon definitions with ULTRA-RARE weapons for high levels
  const WEAPONS = {
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
  const ENEMIES = {
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
  const MERCHANT_ITEMS = {
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

  const RARITY_WEIGHTS = { common: 60, rare: 30, legendary: 9, mythic: 1 };

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
  const THEMES = {
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
  const TITLES = {
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
  const BOSS_ENCOUNTERS = [
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
  const SKILL_CHALLENGES = [
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
  const SKILL_UPGRADES = {
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
  const CHOICE_EVENTS = [
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

  // Helper functions
  const fmt = useCallback((n) => {
    if (!isFinite(n) || isNaN(n)) return '0';
    const abs = Math.abs(n);
    if (abs < 1000) return Math.round(n).toLocaleString();
    const units = ['k', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'o', 'n'];
    let u = -1;
    let val = abs;
    while (val >= 1000 && u < units.length - 1) {
      val /= 1000;
      u++;
    }
    const out = (Math.sign(n) * val).toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2);
    return out + units[u];
  }, []);

  const costFor = useCallback((artifact) => {
    return Math.floor(artifact.baseCost * Math.pow(1.15, artifact.count));
  }, []);

  const artifactMult = useCallback((key) => {
    return gameState.multipliers[key] || 1;
  }, [gameState.multipliers]);

  const activeBoonMult = useCallback((type) => {
    let m = 1;
    const now = Date.now();
    for (const boon of gameState.boons) {
      if (boon.type === type && now < boon.until) m *= boon.mult;
    }
    return m;
  }, [gameState.boons]);

  // NEW: Helper to get skill level
  const getSkillLevel = useCallback((skillId) => {
    return gameState.skillUpgrades[skillId] || 0;
  }, [gameState.skillUpgrades]);

  const dpc = useCallback(() => {
    const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
    const weaponMultiplier = currentWeapon.dpcMultiplier || 1;

    let mult = gameState.dpcMult * activeBoonMult('dpc') * weaponMultiplier;
    let add = 0;

    // Apply Artifact Boosts
    (gameState.equippedArtifacts || []).forEach(artId => {
      if (artId) {
        const art = MERCHANT_ITEMS[artId];
        if (art && (art.type === 'damage' || art.type === 'all')) {
          const count = gameState.inventory.filter(id => id === artId).length;
          if (art.effectType === 'additive') {
            add += art.value * count;
          } else if (art.effectType === 'multiplicative') {
            mult *= Math.pow(art.value, count);
          }
        }
      }
    });

    return Math.max(1, gameState.dpcBase * mult) + add;
  }, [gameState.dpcBase, gameState.dpcMult, gameState.activeWeapon, activeBoonMult, gameState.equippedArtifacts, gameState.inventory]);

  // NEW: GPC (Gold Per Click) logic for mining separately from DPC
  const gpc = useCallback(() => {
    // Determine Mining Multiplier from Pickaxe Level
    let mult = Math.pow(2, gameState.pickaxeLevel - 1);
    let add = 0;

    // Apply Gold Artifact Boosts 
    (gameState.equippedArtifacts || []).forEach(artId => {
      if (artId) {
        const art = MERCHANT_ITEMS[artId];
        if (art && (art.type === 'gpc' || art.type === 'all')) {
          const count = gameState.inventory.filter(id => id === artId).length;
          if (art.effectType === 'additive') {
            add += art.value * count;
          } else if (art.effectType === 'multiplicative') {
            mult *= Math.pow(art.value, count);
          }
        }
      }
    });

    // Apply Gold Boost Skill
    const goldBoostLevel = getSkillLevel('gold_boost');
    if (goldBoostLevel > 0) {
      mult *= SKILL_UPGRADES['gold_boost'].effect(goldBoostLevel).value;
    }

    const levelMiningBonus = Math.max(0, gameState.level - 1);
    return Math.max(1, gameState.dpcBase * mult) + add + levelMiningBonus;
  }, [gameState.dpcBase, gameState.pickaxeLevel, gameState.level, getSkillLevel, gameState.equippedArtifacts, gameState.inventory]);

  const dps = useCallback(() => {
    let total = 0;
    if (gameState.artifacts && Array.isArray(gameState.artifacts)) {
      for (const a of gameState.artifacts) {
        if (a && typeof a === 'object' && typeof a.count === 'number' && typeof a.baseDps === 'number') {
          total += a.count * a.baseDps * artifactMult(a.key);
        }
      }
    }

    total *= gameState.globalDpsMult * activeBoonMult('dps');
    let mult = 1;
    let add = 0;

    // Apply Artifact Boosts
    (gameState.equippedArtifacts || []).forEach(artId => {
      if (artId) {
        const art = MERCHANT_ITEMS[artId];
        if (art && (art.type === 'dps' || art.type === 'all')) {
          const count = gameState.inventory.filter(id => id === artId).length;
          if (art.effectType === 'additive') {
            add += art.value * count;
          } else if (art.effectType === 'multiplicative') {
            mult *= Math.pow(art.value, count);
          }
        }
      }
    });

    // NEW: Apply Gold Boost Skill
    const goldBoostLevel = getSkillLevel('gold_boost');
    if (goldBoostLevel > 0) {
      mult *= SKILL_UPGRADES['gold_boost'].effect(goldBoostLevel).value;
    }

    return (total * mult) + add;
  }, [gameState.artifacts, gameState.globalDpsMult, artifactMult, activeBoonMult, getSkillLevel, gameState.equippedArtifacts, gameState.inventory]);

  const passiveGoldPerSecond = useCallback(() => {
    return dps() + Math.max(0, gameState.level - 1);
  }, [dps, gameState.level]);

  const totalArtifacts = useCallback(() => {
    if (!gameState.artifacts || !Array.isArray(gameState.artifacts)) return 0;
    return gameState.artifacts.reduce((sum, a) => {
      if (a && typeof a.count === 'number') {
        return sum + a.count;
      }
      return sum;
    }, 0);
  }, [gameState.artifacts]);

  const purchasedUpgrades = useCallback(() => {
    if (!gameState.upgrades || !Array.isArray(gameState.upgrades)) return 0;
    return gameState.upgrades.filter(u => u && u.purchased).length;
  }, [gameState.upgrades]);

  // NEW: Background Music Functions
  const initializeMusic = useCallback(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio('/sounds/clickermusic.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;

      // Handle loading errors gracefully
      musicRef.current.addEventListener('error', () => {
        console.log('Background music failed to load');
      });
    }
  }, []);

  const toggleMusic = useCallback(() => {
    initializeMusic();

    setGameState(prev => {
      const newMusicEnabled = !prev.musicEnabled;

      if (newMusicEnabled) {
        musicRef.current.play().catch(e => {
          console.log('Music playback failed:', e);
        });
      } else {
        musicRef.current.pause();
      }

      return { ...prev, musicEnabled: newMusicEnabled };
    });
  }, [initializeMusic]);

  // Prestige functions
  const canPrestige = useCallback(() => {
    return gameState.totalGold >= 1000000000;
  }, [gameState.totalGold]);

  const calculatePrestigeGain = useCallback(() => {
    if (!canPrestige()) return 0;
    return Math.floor(Math.sqrt(gameState.totalGold / 1000000000));
  }, [gameState.totalGold, canPrestige]);

  const getPrestigeBorder = (prestigeLevel) => {
    if (prestigeLevel <= 0) return '';
    if (prestigeLevel >= 20) return 'ring-8 ring-white ring-opacity-100 animate-pulse shadow-2xl shadow-white/50';
    if (prestigeLevel >= 15) return 'ring-8 ring-yellow-300 ring-opacity-100 animate-pulse shadow-2xl shadow-yellow-400/50';
    if (prestigeLevel >= 10) return 'ring-8 ring-purple-400 ring-opacity-100 animate-pulse shadow-2xl shadow-purple-400/50';
    if (prestigeLevel >= 6) return 'ring-8 ring-cyan-400 ring-opacity-80 shadow-xl shadow-cyan-400/30';
    const borders = ['', 'ring-4 ring-yellow-400 ring-opacity-60', 'ring-4 ring-orange-400 ring-opacity-60', 'ring-4 ring-red-400 ring-opacity-60', 'ring-4 ring-purple-400 ring-opacity-60', 'ring-4 ring-pink-400 ring-opacity-60'];
    return borders[Math.min(prestigeLevel, borders.length - 1)] || '';
  };

  // Add toast notification
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);

    if (showToast) {
      showToast(message, type);
    }
  }, [showToast]);

  // NEW: XP and Leveling
  const getNextLevelXP = useCallback((currentLevel) => {
    return Math.floor(100 * Math.pow(1.2, currentLevel - 1));
  }, []);

  const gainXP = useCallback((amount) => {
    setGameState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let leveledUp = false;

      while (newXp >= getNextLevelXP(newLevel)) {
        newXp -= getNextLevelXP(newLevel);
        newLevel++;
        leveledUp = true;
      }

      if (leveledUp) {
        addToast(`Level Up! You are now Level ${newLevel}!`, 'success');
        setLevelUpData({ level: newLevel, spGained: newLevel - prev.level });
        setShowLevelUp(true);
      }

      let newPickaxe = 1;
      if (newLevel >= 100) newPickaxe = 5;
      else if (newLevel >= 50) newPickaxe = 4;
      else if (newLevel >= 25) newPickaxe = 3;
      else if (newLevel >= 10) newPickaxe = 2;

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        pickaxeLevel: newPickaxe
      };
    });
  }, [getNextLevelXP, addToast]);

  // Check unlock requirements
  const checkUnlockRequirement = useCallback((requirement) => {
    if (!requirement) return true;

    switch (requirement.type) {
      case 'totalGold':
        return gameState.totalGold >= requirement.value;
      case 'attacks':
        return gameState.attacks >= requirement.value;
      case 'artifacts':
        return totalArtifacts() >= requirement.value;
      case 'dps':
        return dps() >= requirement.value;
      case 'upgrades':
        return purchasedUpgrades() >= requirement.value;
      case 'prestige':
        return gameState.prestige >= requirement.value;
      case 'masterLevel':
        return gameState.masterLevel >= requirement.value;
      case 'level':
        return gameState.level >= requirement.value;
      case 'bossDefeated':
        return gameState.bossesDefeated && gameState.bossesDefeated.includes(requirement.value);
      case 'chest':
      case 'boss':
        return false; // These are unlocked explicitly, not through stat checks
      default:
        return false;
    }
  }, [gameState.totalGold, gameState.attacks, gameState.prestige, gameState.masterLevel, gameState.level, totalArtifacts, dps, purchasedUpgrades]);

  // Add floating number
  const addFloatingNumber = useCallback((x, y, text, color = '#ffd700', icon = null) => {
    const id = Date.now() + Math.random();
    // Add random slight variation to x and y for a more scattered look
    const randomOffsetX = (Math.random() - 0.5) * 40;
    const randomOffsetY = (Math.random() - 0.5) * 20;

    setFloatingNumbers(prev => [...prev, {
      id,
      x: x + randomOffsetX,
      y: y + randomOffsetY,
      text,
      color,
      icon,
      time: Date.now()
    }]);

    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(f => f.id !== id));
    }, 1000); // Slightly longer duration for better flair
  }, []);

  // Add gold with effects
  const addGold = useCallback((amount) => {
    if (!isFinite(amount) || isNaN(amount)) return;

    setGameState(prev => {
      const newGold = Math.max(0, prev.gold + amount);
      const newTotalGold = amount > 0 ? prev.totalGold + amount : prev.totalGold;
      return {
        ...prev,
        gold: newGold,
        totalGold: newTotalGold
      };
    });
  }, []);

  // NEW: Boss encounter functions
  const startBossEncounter = useCallback((bossId) => {
    const boss = BOSS_ENCOUNTERS.find(b => b.id === bossId);
    if (!boss) return;

    // Dynamically scale boss health based on player's overall power (Level + DPC/DPS combo)
    // We want the bosses to always take a reasonable amount of time to kill, even with ultra weapons.
    // Calculate a rough DPS (Clicks per second average ~5 + AutoDPS)
    const currentPower = (dpc() * 5) + dps();
    // Base boss health multiplied by a scaling factor on player level, but also ensuring it's at minimum 30 seconds of pure DPS
    const levelFactor = Math.pow(1.15, gameState.level);
    const timeToKill = 30 + (boss.health / 1000000); // Base 30s + more for higher tier bosses

    // The health is either the mathematically scaled base health, OR the dynamic "30 seconds of DPS" health, whichever is HIGHER.
    const scaledHealth = Math.max(Math.floor(boss.health * levelFactor), Math.floor(currentPower * timeToKill));

    // Scale gold reward similarly
    const scaledReward = Math.floor(boss.goldReward * Math.pow(1.10, gameState.level));

    setActiveBoss({ ...boss, health: scaledHealth, goldReward: scaledReward });
    setBossHealth(scaledHealth);
    setMaxBossHealth(scaledHealth);
    setTriggeredPhases([]); // Reset triggered phases
    addToast(`${boss.name} appears! Prepare for battle!`, 'warning');
  }, [addToast]);

  const attackBoss = useCallback((damage) => {
    if (!activeBoss || bossHealth <= 0) return;

    const newHealth = Math.max(0, bossHealth - damage);
    setBossHealth(newHealth);

    // Check for phase transitions
    const healthPercent = (newHealth / maxBossHealth) * 100;
    const currentPhaseIndex = activeBoss.phases.findIndex((p, idx) => {
      const nextPhaseHealth = activeBoss.phases[idx + 1]?.healthPercent || 0;
      return healthPercent <= p.healthPercent && healthPercent > nextPhaseHealth;
    });

    if (currentPhaseIndex !== -1) {
      const currentPhase = activeBoss.phases[currentPhaseIndex];
      // Check if we haven't triggered this phase yet
      if (!triggeredPhases.includes(currentPhaseIndex)) {
        addToast(currentPhase.message, 'info');
        setTriggeredPhases(prev => [...prev, currentPhaseIndex]);
      }
    }

    // Boss defeated
    if (newHealth <= 0) {
      const reward = activeBoss.goldReward;
      addGold(reward);

      // Apply special reward
      setGameState(prev => {
        let newState = { ...prev };
        if (activeBoss.specialReward.type === 'dpcMult') {
          newState.dpcMult *= activeBoss.specialReward.value;
        } else if (activeBoss.specialReward.type === 'globalDpsMult') {
          newState.globalDpsMult *= activeBoss.specialReward.value;
        } else if (activeBoss.specialReward.type === 'masterLevel') {
          newState.masterLevel += activeBoss.specialReward.value;
        } else if (activeBoss.specialReward.type === 'weapon') {
          if (!newState.unlockedWeapons.includes(activeBoss.specialReward.value)) {
            newState.unlockedWeapons = [...newState.unlockedWeapons, activeBoss.specialReward.value];
          }
        }

        newState.bossesDefeated = [...(prev.bossesDefeated || []), activeBoss.id];

        // Grant SP based on boss difficulty
        const spReward = Math.ceil(Math.log10(activeBoss.health) * 2);
        newState.skillPoints += spReward;

        return newState;
      });

      addToast(`${activeBoss.name} defeated! Gained ${fmt(reward)} gold, ${Math.ceil(Math.log10(activeBoss.health) * 2)} SP, and an epic reward!`, 'success');
      setActiveBoss(null);
      setBossHealth(0);
      setMaxBossHealth(0);

      // End Blood Moon early upon victory
      setGameState(prev => {
        if (prev.currentCycle === 'BloodMoon') {
          return { ...prev, currentCycle: 'Day', cycleClicks: 0 };
        }
        return prev;
      });
    }
  }, [activeBoss, bossHealth, maxBossHealth, addGold, addToast, fmt]);

  // NEW: Skill challenge functions
  const startSkillChallenge = useCallback((challengeType) => {
    const challenge = SKILL_CHALLENGES.find(c => c.id === challengeType);
    if (!challenge) return;

    setChallengeData({
      ...challenge,
      startTime: Date.now(),
      progress: 0,
      completed: false
    });
    setShowSkillChallenge(true);
  }, []);

  const completeSkillChallenge = useCallback((success) => {
    if (!challengeData) return;

    if (success) {
      addGold(challengeData.goldReward);
      setGameState(prev => ({
        ...prev,
        skillPoints: prev.skillPoints + 1,
        challengesCompleted: [...(prev.challengesCompleted || []), challengeData.id]
      }));
      addToast(`Challenge completed! Gained ${fmt(challengeData.goldReward)} gold and 1 skill point!`, 'success');
    } else {
      const consolationGold = challengeData.goldReward * 0.1;
      addGold(consolationGold);
      addToast(`Challenge failed, but you gained ${fmt(consolationGold)} gold for trying!`, 'warning');
    }

    setShowSkillChallenge(false);
    setChallengeData(null);
  }, [challengeData, addGold, addToast, fmt]);

  // NEW: Buy Skill Upgrade
  const buySkillUpgrade = useCallback((skillId) => {
    const upgrade = SKILL_UPGRADES[skillId];
    if (!upgrade) return;

    const currentLevel = gameState.skillUpgrades[skillId] || 0;
    if (currentLevel >= upgrade.maxLevel) {
      addToast('Max level reached!', 'error');
      return;
    }

    const cost = Math.floor(upgrade.costPerLevel * Math.pow(upgrade.costScale, currentLevel));

    if (gameState.skillPoints >= cost) {
      setGameState(prev => ({
        ...prev,
        skillPoints: prev.skillPoints - cost,
        skillUpgrades: {
          ...prev.skillUpgrades,
          [skillId]: currentLevel + 1
        }
      }));
      addToast(`${upgrade.name} upgraded to level ${currentLevel + 1}!`, 'success');
    } else {
      addToast(`Need ${cost} Skill Points!`, 'error');
    }
  }, [gameState.skillPoints, gameState.skillUpgrades, addToast]);

  // Attack function - UPDATED with Critical Hits, Gem Hunter, and XP
  const attack = useCallback((event) => {
    // === NEW: Anti-cheat Click Tracking ===
    const now = Date.now();
    const clickTimes = clickTimesRef.current;
    clickTimes.push(now);

    // Keep only clicks within the last 1 second
    while (clickTimes.length > 0 && now - clickTimes[0] > 1000) {
      clickTimes.shift();
    }

    // If more than 15 clicks in 1 second, trigger penalty
    if (clickTimes.length > 15) {
      clickTimesRef.current = []; // Reset tracked clicks to prevent continuous firing
      addToast('⚠️ WEAPON BROKEN! You swung too wildly and broke your gear! Paid 50% of gold for repairs.', 'error');

      setGameState(prev => ({
        ...prev,
        gold: Math.floor(prev.gold * 0.5)
      }));
      // Optional: Add a screen shake or visual indication here if desired
      if (document.getElementById('game-container-main')) {
        document.getElementById('game-container-main').classList.add('animate-shake');
        setTimeout(() => {
          if (document.getElementById('game-container-main')) {
            document.getElementById('game-container-main').classList.remove('animate-shake');
          }
        }, 500);
      }
      return; // Stop the attack from giving rewards
    }
    // ======================================

    gainXP(1); // NEW: Gain 1 XP per click

    let baseValue = gpc();
    let gain = baseValue;
    let isCrit = false;

    // NEW: Critical Hit Logic
    const critLevel = getSkillLevel('crit_chance');
    if (critLevel > 0) {
      const critChance = SKILL_UPGRADES['crit_chance'].effect(critLevel).value;
      if (Math.random() < critChance) {
        gain *= 2;
        isCrit = true;
      }
    }

    // NEW: Gem Hunter Logic
    const gemHunterLevel = getSkillLevel('gem_hunter');
    if (gemHunterLevel > 0) {
      const gemChance = SKILL_UPGRADES['gem_hunter'].effect(gemHunterLevel).value;
      if (Math.random() < gemChance) {
        setGameState(prev => ({ ...prev, skillPoints: prev.skillPoints + 1 }));
        addToast('✨ You found a Skill Point!', 'success');
      }
    }

    // If boss is active, deal damage to boss instead
    // NOTE: Boss damage has been moved purely to the weapon attack!
    addGold(gain);

    // NEW: Key Drop Logic (0.05% chance)
    if (Math.random() < 0.0005) {
      setGameState(prev => {
        let keyType = null;
        if (prev.currentCycle === 'Day') keyType = 'normal';
        else if (prev.currentCycle === 'Night' || prev.currentCycle === 'BloodMoon') keyType = 'dark';
        else if (prev.currentCycle === 'Snow') keyType = 'ice';

        if (keyType && (!prev.keys || prev.keys[keyType] < 1)) {
          addToast(`?? Found a ${keyType.charAt(0).toUpperCase() + keyType.slice(1)} Key!`, 'success');
          return {
            ...prev,
            keys: {
              ...(prev.keys || { normal: 0, dark: 0, ice: 0 }),
              [keyType]: 1
            }
          };
        }
        return prev;
      });
    }

    // NEW: Metal Ore Drop Logic (0.05% chance)
    if (Math.random() < 0.0005) {
      setGameState(prev => ({ ...prev, metalOre: (prev.metalOre || 0) + 1 }));
      addToast('⛏️ Found 1 Metal Ore!', 'success');
      addFloatingNumber(event.clientX, event.clientY, '+1 Metal Ore', '#A0AEC0', '⛏️');
    }

    setGameState(prev => {
      let newCycle = prev.currentCycle;
      let newCycleClicks = prev.cycleClicks + 1;
      let newCampShopItems = prev.campShopItems;
      let newCampShopPurchased = prev.campShopPurchased;

      // Every 500 clicks, advance the cycle
      if (newCycleClicks >= 500) {
        newCycleClicks = 0;
        if (prev.currentCycle === 'Day' || prev.currentCycle === 'Snow') {
          // Transition to Night or Blood Moon
          if (prev.level >= 10 && Math.random() < 0.05) {
            newCycle = 'BloodMoon';
            addToast('The Blood Moon rises...', 'error');
          } else {
            newCycle = 'Night';
            addToast('Night has fallen.', 'info');
          }
        } else {
          // Transition to Day or Snow
          if (Math.random() < 0.20) {
            newCycle = 'Snow';
            addToast('A snow storm begins!', 'info');
          } else {
            newCycle = 'Day';
            addToast('A new day dawns.', 'success');
          }

          // NEW: Restock camp shop on morning
          let shopItems = [];
          let attempts = 0;
          while (shopItems.length < 3 && attempts < 50) {
            const rId = pickArtifactByRarity(true); // Exclude Mythic
            if (!shopItems.includes(rId)) {
              shopItems.push(rId);
            }
            attempts++;
          }
          newCampShopItems = shopItems.length === 3 ? shopItems : ['1', '2', '3'];
          newCampShopPurchased = [];
          addToast('The Camp Shop has restocked!', 'success');
        }
      }

      return {
        ...prev,
        handGold: prev.handGold + gain,
        attacks: prev.attacks + 1,
        encounterClicks: (prev.encounterClicks || 0) + 1,
        cycleClicks: newCycleClicks,
        currentCycle: newCycle,
        campShopItems: newCampShopItems,
        campShopPurchased: newCampShopPurchased
      };
    });

    // Add floating number at click position
    if (event && event.currentTarget) {
      const x = event.clientX;
      const y = event.clientY;
      const color = activeBoss ? '#ff4444' : isCrit ? '#ff00ff' : '#ffd700'; // Purple for Crit
      const text = `${activeBoss ? 'DMG: ' : '+'}${fmt(gain)}${isCrit ? ' ??' : ''}`;
      const icon = activeBoss ? '??' : '??';
      addFloatingNumber(x, y, text, color, icon);
    }

    // Play sound effect
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => { });
    } catch (e) { }

    // Check for achievements
    if (gameState.attacks === 0) {
      addToast('Achievement: First Strike!', 'success');
    }
  }, [dpc, gpc, addGold, addFloatingNumber, fmt, gameState.attacks, addToast, getSkillLevel, gainXP]);

  // NEW: Weapon Attack logic for Enemies
  const attackEnemy = useCallback((event) => {
    // === NEW: Anti-cheat Click Tracking for Weapons ===
    const now = Date.now();
    const clickTimes = clickTimesRef.current;
    clickTimes.push(now);

    while (clickTimes.length > 0 && now - clickTimes[0] > 1000) {
      clickTimes.shift();
    }

    if (clickTimes.length > 15) {
      clickTimesRef.current = [];
      addToast('⚠️ WEAPON BROKEN! You swung too quickly and broke your gear! Paid 50% of gold for repairs.', 'error');

      setGameState(prev => ({
        ...prev,
        gold: Math.floor(prev.gold * 0.5)
      }));
      if (document.getElementById('game-container-main')) {
        document.getElementById('game-container-main').classList.add('animate-shake');
        setTimeout(() => {
          if (document.getElementById('game-container-main')) {
            document.getElementById('game-container-main').classList.remove('animate-shake');
          }
        }, 500);
      }
      return;
    }
    // ===================================================

    let gain = dpc();
    let isCrit = false;

    const critLevel = getSkillLevel('crit_chance');
    if (critLevel > 0) {
      const critChance = SKILL_UPGRADES['crit_chance'].effect(critLevel).value;
      if (Math.random() < critChance) {
        gain *= 2;
        isCrit = true;
      }
    }

    // Otherwise, hit normal enemy
    if (!gameState.activeEnemy) return;

    setGameState(prev => {
      const enemy = prev.activeEnemy;
      if (!enemy) return prev;

      const newHp = Math.max(0, enemy.currentHp - gain);

      if (newHp <= 0) {
        const cappedGold = Math.min(enemy.baseGold, 100);
        const cappedXp = Math.min(enemy.xp, 100);
        addGold(cappedGold);
        gainXP(cappedXp);
        addToast(`Defeated ${enemy.name}! +${fmt(cappedGold)} Gold, +${cappedXp} XP`, 'success');
        return {
          ...prev,
          activeEnemy: null
        };
      }

      return {
        ...prev,
        activeEnemy: {
          ...enemy,
          currentHp: newHp
        }
      };
    });

    // Floating number
    if (event && event.currentTarget) {
      const x = event.clientX;
      const y = event.clientY;
      const text = `DMG: ${fmt(gain)}${isCrit ? ' ??' : ''}`;
      const color = isCrit ? '#ff00ff' : '#ff4444';
      addFloatingNumber(x, y, text, color, '??');
    }
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => { });
    } catch (e) { }
  }, [gameState.activeEnemy, dpc, getSkillLevel, addGold, gainXP, addToast, addFloatingNumber, fmt]);

  // Check for new unlocks
  const checkUnlocks = useCallback(() => {
    let newUnlocks = [];

    // Check weapons
    Object.entries(WEAPONS).forEach(([key, weapon]) => {
      if (!gameState.unlockedWeapons.includes(key) && checkUnlockRequirement(weapon.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedWeapons: [...prev.unlockedWeapons, key]
        }));
        newUnlocks.push(`New weapon unlocked: ${weapon.name}! (+${weapon.dpcMultiplier}x damage)`);
      }
    });

    // Check themes
    Object.entries(THEMES).forEach(([key, theme]) => {
      if (!gameState.unlockedThemes.includes(key) && checkUnlockRequirement(theme.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedThemes: [...prev.unlockedThemes, key]
        }));
        newUnlocks.push(`New theme unlocked: ${theme.name}!`);
      }
    });

    // Check titles
    Object.entries(TITLES).forEach(([key, title]) => {
      if (!gameState.unlockedTitles.includes(key) && checkUnlockRequirement(title.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedTitles: [...prev.unlockedTitles, key]
        }));
        newUnlocks.push(`New title unlocked: ${key}!`);
      }
    });

    // Show unlock notifications
    newUnlocks.forEach(message => {
      addToast(message, 'success');
    });
  }, [gameState.unlockedWeapons, gameState.unlockedThemes, gameState.unlockedTitles, checkUnlockRequirement, addToast]);

  // Buy artifact
  const buyArtifact = useCallback((artifactIndex, amount) => {
    setGameState(prev => {
      if (!prev.artifacts || !Array.isArray(prev.artifacts) || artifactIndex < 0 || artifactIndex >= prev.artifacts.length) {
        console.error('Invalid artifacts array or index');
        return prev;
      }

      const artifact = prev.artifacts[artifactIndex];
      if (!artifact || typeof artifact.count !== 'number') {
        console.error('Invalid artifact at index', artifactIndex);
        return prev;
      }

      const newArtifacts = [...prev.artifacts];
      let bought = 0;
      let totalCost = 0;

      for (let i = 0; i < amount; i++) {
        const cost = costFor({ ...artifact, count: artifact.count + bought });
        if (prev.gold >= totalCost + cost) {
          totalCost += cost;
          bought++;
        } else {
          break;
        }
      }

      if (bought > 0) {
        newArtifacts[artifactIndex] = {
          ...artifact,
          count: artifact.count + bought
        };

        addToast(`Acquired ${artifact.name} x${bought}`, 'success');

        return {
          ...prev,
          gold: prev.gold - totalCost,
          artifacts: newArtifacts
        };
      }

      return prev;
    });
  }, [costFor, addToast]);

  // Buy upgrade
  const buyUpgrade = useCallback((upgradeIndex) => {
    setGameState(prev => {
      if (!prev.upgrades || !Array.isArray(prev.upgrades) || upgradeIndex < 0 || upgradeIndex >= prev.upgrades.length) {
        console.error('Invalid upgrades array or index');
        return prev;
      }

      const upgrade = prev.upgrades[upgradeIndex];
      if (!upgrade || typeof upgrade.cost !== 'number' || upgrade.purchased) {
        console.error('Invalid upgrade at index', upgradeIndex);
        return prev;
      }

      if (prev.gold >= upgrade.cost && !upgrade.purchased) {
        const newUpgrades = [...prev.upgrades];
        newUpgrades[upgradeIndex] = { ...upgrade, purchased: true };

        // Apply upgrade effect
        let newState = {
          ...prev,
          gold: prev.gold - upgrade.cost,
          upgrades: newUpgrades
        };

        // Apply upgrade effects based on ID
        switch (upgrade.id) {
          case 'orb-1':
            newState.multipliers = { ...newState.multipliers, orb: (newState.multipliers.orb || 1) * 2 };
            break;
          case 'tome-1':
            newState.multipliers = { ...newState.multipliers, tome: (newState.multipliers.tome || 1) * 2 };
            break;
          case 'lute-1':
            newState.multipliers = { ...newState.multipliers, lute: (newState.multipliers.lute || 1) * 2 };
            break;
          case 'shield-1':
            newState.multipliers = { ...newState.multipliers, shield: (newState.multipliers.shield || 1) * 2 };
            break;
          case 'chalice-1':
            newState.multipliers = { ...newState.multipliers, chalice: (newState.multipliers.chalice || 1) * 2 };
            break;
          case 'attack-1':
            newState.dpcMult *= 2;
            break;
          case 'attack-2':
            newState.dpcMult *= 5;
            break;
          case 'prestige-1':
            newState.globalDpsMult *= 1.5;
            break;
        }

        addToast(`Purchased: ${upgrade.name}`, 'success');
        return newState;
      }
      return prev;
    });
  }, [addToast]);

  const doPrestige = useCallback(() => {
    if (!canPrestige()) return;

    const prestigeGain = calculatePrestigeGain();

    setGameState(prev => ({
      ...prev,
      gold: 0,
      totalGold: 0,
      handGold: 0,
      attacks: 0,
      dpcBase: 1,
      dpcMult: 1,
      globalDpsMult: 1,
      multipliers: {},
      artifacts: Array.isArray(prev.artifacts) ? prev.artifacts.map(a => ({ ...a, count: 0 })) : [],
      upgrades: Array.isArray(prev.upgrades) ? prev.upgrades.map(u => ({ ...u, purchased: false })) : [],
      boons: [],
      prestige: prev.prestige + 1,
      prestigePoints: prev.prestigePoints + prestigeGain,
      lifetimeEarnings: prev.lifetimeEarnings + prev.totalGold
    }));

    addToast(`Prestige ${gameState.prestige + 1} achieved! +${prestigeGain} prestige points!`, 'success');
  }, [canPrestige, calculatePrestigeGain, gameState.prestige, addToast]);

  // Spawn combat or choice event (alternates enemy/event every 150 clicks)
  const spawnChoiceEvent = useCallback(() => {
    if (gameState.activeEnemy || gameState.event.shown) return;

    // Determine type: alternate between Enemy and Event
    const isEnemyTurn = gameState.nextEncounter === 'enemy';

    if (isEnemyTurn) {
      const isNightCycle = gameState.currentCycle === 'Night' || gameState.currentCycle === 'BloodMoon';
      const enemyList = isNightCycle ? ENEMIES.Night : ENEMIES.Day;

      // Gate enemies by player level. Player can encounter enemies up to (level + 2) difficulty
      const maxDifficulty = gameState.level + 2;
      let validEnemies = enemyList.filter(e => e.difficulty <= maxDifficulty);

      // Failsafe in case array is somehow empty
      if (validEnemies.length === 0) validEnemies = [enemyList[0]];

      const randomEnemy = validEnemies[Math.floor(Math.random() * validEnemies.length)];

      // Drastically reduced HP scaling tuned by player level.
      const levelFactor = Math.max(1, gameState.level);
      const isNightOrBloodMoon = gameState.currentCycle === 'Night' || gameState.currentCycle === 'BloodMoon';

      let scaledHp;
      if (levelFactor < 10) {
        // Level <10 target: ~20-150 HP for day enemies, double at night.
        const minHp = Math.max(20, 20 + ((levelFactor - 1) * 5));
        const maxHp = Math.min(150, 70 + ((levelFactor - 1) * 10) + (randomEnemy.difficulty * 5));
        const baseHp = Math.floor(minHp + Math.random() * Math.max(1, maxHp - minHp));
        scaledHp = isNightOrBloodMoon ? baseHp * 2 : baseHp;
      } else {
        // Post level 10: continue scaling, but keep much lower than legacy values.
        const minHp = 90 + ((levelFactor - 10) * 18);
        const maxHp = 180 + ((levelFactor - 10) * 28) + (randomEnemy.difficulty * 12);
        const baseHp = Math.floor(minHp + Math.random() * Math.max(1, maxHp - minHp));
        scaledHp = isNightOrBloodMoon ? baseHp * 2 : baseHp;
      }

      setGameState(prev => ({
        ...prev,
        activeEnemy: {
          ...randomEnemy,
          currentHp: scaledHp,
          hp: scaledHp,
          baseGold: Math.floor(randomEnemy.baseGold * Math.pow(1.10, levelFactor - 1)),
          xp: Math.floor(randomEnemy.xp * Math.max(1, Math.floor(levelFactor / 2))),
          spawnTime: Date.now(),
          skillTestActive: true
        },
        nextEncounter: 'event'
      }));
      addToast(`A wild ${randomEnemy.name} appears ! Defend yourself!`, 'warning');
      return;
    }

    // Event turn: every event type has equal chance, including merchant event.
    const validEvents = CHOICE_EVENTS.filter(e => !e.cycle || e.cycle === gameState.currentCycle);
    const eventPool = [...validEvents, { type: 'merchant' }];
    const eventPick = eventPool[Math.floor(Math.random() * eventPool.length)];

    if (eventPick.type === 'merchant') {
      let shopItems = [];
      let attempts = 0;
      while (shopItems.length < 3 && attempts < 50) {
        const rId = pickArtifactByRarity(true); // Exclude Mythic
        if (!shopItems.includes(rId)) {
          shopItems.push(rId);
        }
        attempts++;
      }
      if (shopItems.length < 3) {
        shopItems = ['1', '2', '3']; // Fallback
      }

      setGameState(prev => ({
        ...prev,
        event: {
          ...prev.event,
          shown: true,
          until: Date.now() + 60000,
          type: 'merchant',
          eventText: prev.currentCycle === 'Night' || prev.currentCycle === 'BloodMoon'
            ? 'A Dark Merchant emerges from the shadows...'
            : 'A Traveling Merchant approaches...',
          choices: [],
          merchantInventory: shopItems
        },
        nextEncounter: 'enemy'
      }));
      setShowChoiceEvent(true);
      return;
    }

    setGameState(prev => ({
      ...prev,
      event: {
        ...prev.event,
        shown: true,
        type: 'TextEvent',
        until: Date.now() + 60000,
        eventText: eventPick.text,
        image: eventPick.image || null,
        choices: eventPick.choices
      },
      nextEncounter: 'enemy'
    }));
    setShowChoiceEvent(true);
  }, [gameState.event.shown, gameState.activeEnemy, gameState.currentCycle, gameState.level, gameState.nextEncounter, gameState.totalGold, addToast]);

  // Handle outcome of the inline combat test
  const handleEnemySkillTest = useCallback((success) => {
    setGameState(prev => {
      if (!prev.activeEnemy) return prev;
      let newEnemy = { ...prev.activeEnemy, skillTestActive: false };

      if (success) {
        addToast(`Defense Successful!`, 'success');
      } else {
        addToast(`Defense test failed! Time reduced by 5s.`, 'error');
        newEnemy.timeLimit = Math.max(5, newEnemy.timeLimit - 5);
      }

      return {
        ...prev,
        activeEnemy: newEnemy
      };
    });
  }, [addToast]);

  // Enhanced choice event handler with new event types
  const handleChoiceEvent = useCallback((choiceIndex) => {
    const choice = gameState.event.choices[choiceIndex];
    if (!choice) return;

    const effect = choice.effect;

    setGameState(prev => {
      let newState = { ...prev };

      switch (effect.type) {
        case 'placeholderEnemy':
          const enemyGold = Math.max(100, prev.totalGold * 0.05);
          newState.gold += enemyGold;
          newState.totalGold += enemyGold;
          addToast(`Enemy defeated! Found ${fmt(enemyGold)} gold.`, 'success');
          break;

        case 'nightRaid':
          // Find oppponent
          let opponent = null;
          let oppName = 'Shadow Doppelganger';
          let oppDpc = dpc() * (0.8 + Math.random() * 0.6); // Random difficulty if no opponent
          let oppGold = prev.gold; // Fallback gold

          if (classmates && Array.isArray(classmates) && classmates.length > 0 && studentData) {
            const myId = getStudentIdentifier(studentData);
            const others = classmates.filter(c => c && getStudentIdentifier(c) !== myId);
            if (others.length > 0) {
              const randomStudent = others[Math.floor(Math.random() * others.length)];
              opponent = randomStudent;
              oppName = randomStudent.firstName || 'Unknown Rival';
              // Try to get DPC, fallback to estimate based on gold
              if (randomStudent.clickerGameData) {
                oppDpc = randomStudent.clickerGameData.dpc || (randomStudent.clickerGameData.totalGold / 1000) || 10;
                oppGold = randomStudent.clickerGameData.gold || 0;
              }
            }
          }

          const myDpc = dpc();
          if (myDpc > oppDpc) {
            const stealAmount = Math.floor(oppGold * 0.05); // Steal 5% (Reduced from 50% for balance)
            // Cap steal amount to avoid massive injection from hacked/bugged saves, e.g. max 10% of my total gold or something? 
            // User asked for "steak 50% of that players gold". Let's stick to the requested logic but maybe cap it at 100% of my own gold to prevent game breaking.
            // For now, raw 50%.
            const actualSteal = Math.max(100, stealAmount);
            newState.gold += actualSteal;
            newState.totalGold += actualSteal;
            addToast(`⚔️ VICTORY! You raided ${oppName} and stole ${fmt(actualSteal)} gold!`, 'success');
          } else {
            const lostAmount = Math.floor(prev.gold * 0.2); // Lose 20%
            newState.gold = Math.max(0, prev.gold - lostAmount);
            newState.totalGold = Math.max(0, newState.totalGold - lostAmount);
            addToast(`💀 DEFEAT! ${oppName} was too strong! You lost ${fmt(lostAmount)} gold escaping!`, 'error');
          }
          break;

        case 'skillChallenge':
          startSkillChallenge(effect.challengeType);
          break;

        case 'bossEncounter':
          // Bosses are temporarily disabled.
          const fallbackGold = Math.max(10000, prev.totalGold * 0.2);
          newState.gold += fallbackGold;
          newState.totalGold += fallbackGold;
          addToast(`The rift is unstable! You salvage ${fmt(fallbackGold)} gold instead.`, 'info');
          break;

        case 'cosmicRift':
          const riftRewards = [
            { gold: 0.5, message: '?? The rift showered you with cosmic gold!' },
            { dpc: 2.0, message: '? Cosmic energy enhances your power!' },
            { masterLevel: 1, message: '?? You gained cosmic understanding!' }
          ];
          const riftReward = riftRewards[Math.floor(Math.random() * riftRewards.length)];

          if (riftReward.gold) {
            const cosmicGold = Math.max(20000, prev.totalGold * riftReward.gold);
            newState.gold += cosmicGold;
            newState.totalGold += cosmicGold;
          } else if (riftReward.dpc) {
            newState.dpcMult *= riftReward.dpc;
          } else if (riftReward.masterLevel) {
            newState.masterLevel = (newState.masterLevel || 0) + riftReward.masterLevel;
          }
          addToast(riftReward.message, 'success');
          break;

        case 'openChest':
          if (prev.keys && prev.keys[effect.keyType] > 0) {
            newState.keys = { ...prev.keys, [effect.keyType]: prev.keys[effect.keyType] - 1 };
            const chestGold = Math.max(50000, prev.totalGold * 1.5);
            newState.gold += chestGold;
            newState.totalGold += chestGold;

            const chestWeapons = ['11', '12', '13', '14', '15', '16', '17'];
            const unownedChestWeapons = chestWeapons.filter(w => !newState.unlockedWeapons.includes(w));

            if (unownedChestWeapons.length > 0 && Math.random() < 0.05) {
              const newWeapon = unownedChestWeapons[0];
              newState.unlockedWeapons = [...newState.unlockedWeapons, newWeapon];
              addToast(`?? Chest Opened! Found ${fmt(chestGold)} gold and a VERY RARE WEAPON: ${WEAPONS[newWeapon].name}!`, 'success');
            } else {
              // grant a rare item
              const randomArtId = pickArtifactByRarity(false);
              const item = MERCHANT_ITEMS[randomArtId];

              if (!newState.inventory.includes(randomArtId)) {
                newState.inventory = [...newState.inventory, randomArtId];
                addToast(`?? Chest Opened! Found ${fmt(chestGold)} gold and ${item.name}!`, 'success');
              } else {
                newState.dpcMult *= 2;
                addToast(`?? Chest Opened! Found ${fmt(chestGold)} gold and a 2x Power Boost!`, 'success');
              }
            }
          } else {
            addToast(`You don't have the required key!`, 'error');
          }
          break;

        case 'carnival':
          const carnivalGames = [
            { type: 'big_win', gold: 0.3, message: '?? JACKPOT! You won big at the carnival!' },
            { type: 'skill_point', skill: 1, message: '?? Your carnival skills earned you a skill point!' },
            { type: 'small_prize', gold: 0.1, message: '?? You won a small carnival prize!' }
          ];
          const carnivalResult = carnivalGames[Math.floor(Math.random() * carnivalGames.length)];

          if (carnivalResult.gold) {
            const carnivalGold = Math.max(5000, prev.totalGold * carnivalResult.gold);
            newState.gold += carnivalGold;
            newState.totalGold += carnivalGold;
          } else if (carnivalResult.skill) {
            newState.skillPoints = (newState.skillPoints || 0) + carnivalResult.skill;
          }
          addToast(carnivalResult.message, 'success');
          break;

        case 'energyStorm':
          const stormEffects = [
            { type: 'power_surge', mult: 3, duration: 180000 },
            { type: 'gold_rain', gold: 0.4 },
            { type: 'energy_overload', mult: 1.5, permanent: true }
          ];
          const stormEffect = stormEffects[Math.floor(Math.random() * stormEffects.length)];

          if (stormEffect.type === 'power_surge') {
            newState.boons = [...prev.boons, {
              name: 'Energy Storm Surge',
              type: 'dps',
              mult: stormEffect.mult,
              until: Date.now() + stormEffect.duration
            }];
            addToast(`? Energy storm grants ${stormEffect.mult}x DPS for ${stormEffect.duration / 1000}s!`, 'success');
          } else if (stormEffect.type === 'gold_rain') {
            const stormGold = Math.max(15000, prev.totalGold * stormEffect.gold);
            newState.gold += stormGold;
            newState.totalGold += stormGold;
            addToast(`?? Energy storm brings gold rain: ${fmt(stormGold)}!`, 'success');
          } else if (stormEffect.type === 'energy_overload') {
            newState.dpcMult *= stormEffect.mult;
            addToast(`? Permanent energy overload! +50% attack power!`, 'success');
          }
          break;

        case 'luckyWheel':
          const wheelOutcomes = [
            { type: 'gold', amount: 0.5, message: '?? JACKPOT! Huge gold bonus!' },
            { type: 'gold', amount: 0.2, message: '?? Big win! Gold bonus!' },
            { type: 'gold', amount: 0.1, message: '?? Nice! Small gold bonus!' },
            { type: 'dpc', mult: 2, message: '?? Amazing! Double click power!' },
            { type: 'boon', mult: 4, duration: 90000, message: '?? Incredible! Temporary super boost!' },
            { type: 'nothing', message: '?? Almost! Better luck next time!' }
          ];
          const wheelResult = wheelOutcomes[Math.floor(Math.random() * wheelOutcomes.length)];

          if (wheelResult.type === 'gold') {
            const wheelGold = Math.max(1000, prev.totalGold * wheelResult.amount);
            newState.gold += wheelGold;
            newState.totalGold += wheelGold;
          } else if (wheelResult.type === 'dpc') {
            newState.dpcMult *= wheelResult.mult;
          } else if (wheelResult.type === 'boon') {
            newState.boons = [...prev.boons, {
              name: 'Lucky Wheel Boost',
              type: 'dps',
              mult: wheelResult.mult,
              until: Date.now() + wheelResult.duration
            }];
          }
          addToast(wheelResult.message, 'success');
          break;

        case 'gambler_bet':
          const betAmount = Math.floor(prev.gold * 0.25);
          if (betAmount <= 0) {
            addToast('You need more gold to play!', 'error');
            break;
          }
          newState.gold -= betAmount; // Deduct first

          if (Math.random() <= 0.30) {
            // Win
            const winnings = betAmount * 3;
            newState.gold += winnings;
            newState.totalGold += (winnings - betAmount);
            addToast(`🎲 WIN! You won ${fmt(winnings)} gold!`, 'success');
          } else {
            // Lose
            newState.totalGold -= betAmount;
            addToast(`❌ LOSS. You lost ${fmt(betAmount)} gold.`, 'error');
          }
          break;

        case 'bard_song':
          const songCost = Math.floor(prev.gold * 0.10);
          newState.gold = Math.max(0, newState.gold - songCost);
          newState.totalGold = Math.max(0, newState.totalGold - songCost);

          newState.boons = [...prev.boons, {
            name: 'Inspiring Tune',
            type: 'dps',
            mult: 5,
            until: Date.now() + 300000 // 5 minutes
          }];
          addToast(`🎵 The Bard plays an epic tune! Paid ${fmt(songCost)} gold for 5x DPS for 5 minutes!`, 'success');
          break;

        case 'mysterious_portal':
          if (Math.random() < 0.5) {
            const portalGold = Math.max(25000, prev.totalGold * 0.25);
            newState.gold += portalGold;
            newState.totalGold += portalGold;
            addToast(`✨ The portal showered you with ${fmt(portalGold)} gold!`, 'success');
          } else {
            const randomArtId = pickArtifactByRarity(false);
            const item = MERCHANT_ITEMS[randomArtId];

            newState.inventory = [...newState.inventory, randomArtId];
            addToast(`✨ The portal bestowed ${item.name}!`, 'success');
          }
          break;

        case 'smallGoldGain':
          const smallGain = Math.max(10, prev.gold * effect.amount * 0.1); // Reduced heavily
          newState.gold += smallGain;
          newState.totalGold += smallGain;

          if (Math.random() < 0.1) {
            const randomArtId = pickArtifactByRarity(true); // Exclude Mythic
            const item = MERCHANT_ITEMS[randomArtId];
            newState.inventory = [...newState.inventory, randomArtId];
            addToast(`Found ${fmt(smallGain)} gold AND a shiny ${item.name}!`, 'success');
          } else {
            addToast(`Found ${fmt(smallGain)} gold!`, 'success');
          }
          break;

        case 'goldGain':
          const gain = Math.max(50, prev.gold * effect.amount * 0.1); // Reduced heavily
          newState.gold += gain;
          newState.totalGold += gain;

          if (Math.random() < 0.1) {
            const randomArtId = pickArtifactByRarity(true); // Exclude Mythic
            const item = MERCHANT_ITEMS[randomArtId];
            newState.inventory = [...newState.inventory, randomArtId];
            addToast(`Earned ${fmt(gain)} gold AND discovered a ${item.name}!`, 'success');
          } else {
            addToast(`Earned ${fmt(gain)} gold!`, 'success');
          }
          break;

        case 'randomBoon':
          const boonTypes = ['dpc', 'dps'];
          const randomType = boonTypes[Math.floor(Math.random() * boonTypes.length)];
          const mult = 2 + Math.random() * 3;
          newState.boons = [...prev.boons, {
            name: `Mystic ${randomType.toUpperCase()} Boost`,
            type: randomType,
            mult: mult,
            until: Date.now() + effect.duration
          }];
          addToast(`Gained ${randomType.toUpperCase()} x${mult.toFixed(1)} boost for ${effect.duration / 1000}s!`, 'success');
          break;

        case 'loseGold':
          const loss = Math.max(100, prev.totalGold * effect.amount);
          newState.gold = Math.max(0, newState.gold - loss);
          newState.totalGold = Math.max(0, newState.totalGold - loss);
          addToast(`👺 Goblin stole ${fmt(loss)} gold!`, 'error');
          break;

        case 'goblinPrank':
          // Prank: Temporary DPC reduction
          newState.dpcMult *= 0.5;
          newState.boons = [...prev.boons, {
            name: 'Goblin Prank',
            type: 'dpc',
            mult: 0.5,
            until: Date.now() + 30000 // 30s debuff
          }];
          addToast('?? Goblin greased your weapon! Damage halved for 30s!', 'warning');
          break;

        case 'shrineGamble':
          if (Math.random() > 0.5) {
            newState.boons = [...prev.boons, {
              name: 'Shrine Blessing',
              type: 'dps',
              mult: 3,
              until: Date.now() + 60000
            }];
            addToast('?? The shrine blesses you! 3x DPS for 60s!', 'success');
          } else {
            newState.gold = Math.floor(newState.gold * 0.5);
            addToast('?? The shrine curses you! Lost 50% of current gold!', 'error');
          }
          break;

        case 'repairCost':
          const repairCost = Math.max(500, prev.totalGold * effect.amount);
          newState.gold = Math.max(0, newState.gold - repairCost);
          addToast(`??? Repairs cost ${fmt(repairCost)} gold.`, 'info');
          break;

        case 'debuffDPS':
          newState.globalDpsMult *= effect.mult;
          newState.boons = [...prev.boons, {
            name: 'Broken Gear',
            type: 'dps',
            mult: effect.mult,
            until: Date.now() + effect.duration
          }];
          addToast(`? Gear damaged! DPS reduced by 50% for ${(effect.duration / 1000)}s!`, 'error');
          break;

        case 'mysteryBox':
          if (prev.skillPoints >= 1) {
            newState.skillPoints -= 1;
            const roll = Math.random();
            if (roll < 0.1) {
              // Jackpot
              newState.dpcMult *= 5; // Permanent small boost hack or just temp? Let's give massive temp
              newState.boons = [...prev.boons, {
                name: 'Mystery Jackpot',
                type: 'dpc',
                mult: 10,
                until: Date.now() + 120000
              }];
              addToast('?? JACKPOT! 10x Power for 2 mins!', 'success');
            } else if (roll < 0.5) {
              // Medium
              const boxGold = prev.totalGold * 0.5;
              newState.gold += boxGold;
              newState.totalGold += boxGold;
              addToast(`?? Box contained ${fmt(boxGold)} gold!`, 'success');
            } else {
              // Dud
              addToast('?? The box was empty...', 'warning');
            }
          } else {
            addToast('Not enough Skill Points!', 'error');
          }
          break;

        default:
          break;
      }

      newState.event = {
        ...newState.event,
        shown: false
      };

      return newState;
    });

    setShowChoiceEvent(false);
  }, [gameState.event.choices, startSkillChallenge, addToast, fmt, classmates, dpc, studentData]);

  // Close choice event without selecting
  const closeChoiceEvent = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      event: {
        ...prev.event,
        shown: false
      }
    }));
    setShowChoiceEvent(false);
  }, []);

  // Save to Firebase with enhanced data
  const saveToFirebase = useCallback(async () => {
    if (!studentData || !updateStudentData || !isLoaded || saveInProgress) {
      return;
    }

    setSaveInProgress(true);
    try {
      const cleanGameState = {
        gold: gameState.gold,
        totalGold: gameState.totalGold,
        handGold: gameState.handGold,
        attacks: gameState.attacks,
        dpcBase: gameState.dpcBase,
        dpcMult: gameState.dpcMult,
        globalDpsMult: gameState.globalDpsMult,
        buyAmount: gameState.buyAmount,
        timePlayed: gameState.timePlayed,
        multipliers: gameState.multipliers,
        artifacts: gameState.artifacts,
        upgrades: gameState.upgrades,
        boons: [],
        unlockedWeapons: gameState.unlockedWeapons,
        activeWeapon: gameState.activeWeapon,
        unlockedThemes: gameState.unlockedThemes,
        activeTheme: gameState.activeTheme,
        unlockedTitles: gameState.unlockedTitles,
        activeTitle: gameState.activeTitle,
        achievements: gameState.achievements,
        prestige: gameState.prestige,
        prestigePoints: gameState.prestigePoints,
        lifetimeEarnings: gameState.lifetimeEarnings,
        musicEnabled: gameState.musicEnabled,
        masterLevel: gameState.masterLevel,
        challengesCompleted: gameState.challengesCompleted,
        bossesDefeated: gameState.bossesDefeated,
        skillPoints: gameState.skillPoints,
        skillUpgrades: gameState.skillUpgrades, // NEW
        masteries: gameState.masteries,
        currentCycle: gameState.currentCycle,
        cycleClicks: gameState.cycleClicks,
        encounterClicks: gameState.encounterClicks || 0,
        pickaxeLevel: gameState.pickaxeLevel,
        xp: gameState.xp,
        level: gameState.level,
        inventory: Array.isArray(gameState.inventory) ? gameState.inventory : [],
        equippedArtifacts: Array.isArray(gameState.equippedArtifacts)
          ? gameState.equippedArtifacts.slice(0, 3)
          : [null, null, null],
        activeEnemy: gameState.activeEnemy || null,
        dpc: dpc(), // NEW: Save current DPC for leaderboards/pvp
        gpc: gpc(), // NEW: Save current GPC 
        keys: gameState.keys || { normal: 0, dark: 0, ice: 0 },
        nextEncounter: gameState.nextEncounter || 'enemy',
        lastSave: Date.now(),
        version: '4.0'
      };

      const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
      const currentTheme = THEMES[gameState.activeTheme] || THEMES.default;
      const clickerAchievements = {
        title: gameState.activeTitle,
        prestige: gameState.prestige,
        theme: gameState.activeTheme,
        themeName: currentTheme.name,
        weapon: currentWeapon.name,
        totalGold: gameState.totalGold,
        masterLevel: gameState.masterLevel,
        level: gameState.level,
        xp: gameState.xp,
        lastPlayed: Date.now()
      };

      await updateStudentData({
        clickerGameData: cleanGameState,
        clickerAchievements: clickerAchievements
      });

      console.log('? Enhanced clicker game saved successfully to Firebase');
      lastSaveRef.current = Date.now();

    } catch (error) {
      console.error('?? Error saving clicker game to Firebase:', error);
      addToast('Save failed! Please try again!', 'error');
    } finally {
      setSaveInProgress(false);
    }
  }, [gameState, studentData, updateStudentData, isLoaded, saveInProgress, addToast]);

  // Load from Firebase
  const loadFromFirebase = useCallback(() => {
    if (isLoaded) return;

    try {
      console.log('?? Loading clicker game from Firebase...');

      if (!studentData?.clickerGameData) {
        console.log('?? No existing game data found, starting new game for student');
        setIsLoaded(true);
        addToast('New adventure begins! Welcome to Hero Forge!', 'success');
        return;
      }

      const data = studentData.clickerGameData;

      if (data.version !== '4.0') {
        console.log('?? Version upgrade to 4.0, resetting game state for new Hero Forge update');
        setIsLoaded(true);
        addToast('Hero Forge updated! Progress reset for the new update!', 'success');
        return; // Will keep the default initial state
      }

      const loadedState = {
        gold: typeof data.gold === 'number' ? data.gold : 0,
        totalGold: typeof data.totalGold === 'number' ? data.totalGold : 0,
        handGold: typeof data.handGold === 'number' ? data.handGold : 0,
        attacks: typeof data.attacks === 'number' ? data.attacks : 0,
        dpcBase: typeof data.dpcBase === 'number' ? data.dpcBase : 1,
        dpcMult: typeof data.dpcMult === 'number' ? data.dpcMult : 1,
        globalDpsMult: typeof data.globalDpsMult === 'number' ? data.globalDpsMult : 1,
        buyAmount: typeof data.buyAmount === 'number' ? data.buyAmount : 1,
        timePlayed: typeof data.timePlayed === 'number' ? data.timePlayed : 0,
        lastSave: typeof data.lastSave === 'number' ? data.lastSave : Date.now(),
        multipliers: data.multipliers && typeof data.multipliers === 'object' ? data.multipliers : {},
        artifacts: Array.isArray(data.artifacts) ? data.artifacts : gameState.artifacts,
        upgrades: Array.isArray(data.upgrades) ? data.upgrades : gameState.upgrades,
        boons: [],
        unlockedWeapons: Array.isArray(data.unlockedWeapons) ? data.unlockedWeapons : ['1'],
        activeWeapon: typeof data.activeWeapon === 'string' ? data.activeWeapon : '1',
        unlockedThemes: Array.isArray(data.unlockedThemes) ? data.unlockedThemes : ['default'],
        activeTheme: typeof data.activeTheme === 'string' ? data.activeTheme : 'default',
        unlockedTitles: Array.isArray(data.unlockedTitles) ? data.unlockedTitles : ['Novice'],
        activeTitle: typeof data.activeTitle === 'string' ? data.activeTitle : 'Novice',
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        prestige: typeof data.prestige === 'number' ? data.prestige : 0,
        prestigePoints: typeof data.prestigePoints === 'number' ? data.prestigePoints : 0,
        lifetimeEarnings: typeof data.lifetimeEarnings === 'number' ? data.lifetimeEarnings : 0,
        musicEnabled: typeof data.musicEnabled === 'boolean' ? data.musicEnabled : false,
        masterLevel: typeof data.masterLevel === 'number' ? data.masterLevel : 0,
        challengesCompleted: Array.isArray(data.challengesCompleted) ? data.challengesCompleted : [],
        bossesDefeated: Array.isArray(data.bossesDefeated) ? data.bossesDefeated : [],
        skillPoints: typeof data.skillPoints === 'number' ? data.skillPoints : 0,
        skillUpgrades: data.skillUpgrades || {}, // NEW
        masteries: data.masteries && typeof data.masteries === 'object' ? data.masteries : {},
        currentCycle: data.currentCycle || 'Day',
        cycleClicks: typeof data.cycleClicks === 'number' ? data.cycleClicks : 0,
        encounterClicks: typeof data.encounterClicks === 'number' ? data.encounterClicks : 0,
        pickaxeLevel: typeof data.pickaxeLevel === 'number' ? data.pickaxeLevel : 1,
        xp: typeof data.xp === 'number' ? data.xp : 0,
        level: typeof data.level === 'number' ? data.level : 1,
        inventory: Array.isArray(data.inventory) ? data.inventory : [],
        equippedArtifacts: Array.isArray(data.equippedArtifacts)
          ? [...data.equippedArtifacts.slice(0, 3), null, null, null].slice(0, 3)
          : [null, null, null],
        activeEnemy: data.activeEnemy || null,
        keys: data.keys || { normal: 0, dark: 0, ice: 0 },
        nextEncounter: data.nextEncounter || 'enemy',
        event: { nextIn: 60 + Math.random() * 120, shown: false, until: 0, choices: [], eventText: '', image: null }
      };

      // NEW: Offline Progress Calculation
      const now = Date.now();
      const lastSaveTime = loadedState.lastSave || now;
      let timeElapsedSeconds = Math.max(0, Math.floor((now - lastSaveTime) / 1000));

      // Cap offline progress to 24 hours to prevent extreme overflow (86400 seconds)
      if (timeElapsedSeconds > 86400) {
        timeElapsedSeconds = 86400;
      }

      // We need a rough estimate of DPS to award offline gold.
      // Since `dps()` relies on `gameState`, we calculate a temporary one based on `loadedState.artifacts`
      let tempDps = 0;
      loadedState.artifacts.forEach(a => { tempDps += (a.baseDps * a.count); });
      tempDps *= loadedState.globalDpsMult;
      if (loadedState.prestige > 0) tempDps *= (1 + (loadedState.prestige * 0.1));

      // Apply offline efficiency multiplier from skill upgrades if purchased
      const offlineEfficiencyLvl = loadedState.skillUpgrades['offline_efficiency'] || 0;
      const offlineMult = 0.1 + (offlineEfficiencyLvl * 0.1); // Base 10%, +10% per level

      if (timeElapsedSeconds >= 60 && tempDps > 0) {
        const offlineGold = Math.floor(tempDps * timeElapsedSeconds * offlineMult);
        if (offlineGold > 0) {
          loadedState.gold += offlineGold;
          loadedState.totalGold += offlineGold;
          setTimeout(() => {
            addToast(`Welcome back! You earned ${fmt(offlineGold)} gold while you were away! (${Math.floor(timeElapsedSeconds / 60)} mins)`, 'success');
          }, 1500);
        }
      }

      setGameState(loadedState);
      setSelectedWeapon(loadedState.activeWeapon);
      setSelectedTheme(loadedState.activeTheme);

      // Initialize music based on saved preference
      if (loadedState.musicEnabled) {
        setTimeout(() => {
          initializeMusic();
          if (musicRef.current) {
            musicRef.current.play().catch(e => {
              console.log('Auto-play music failed:', e);
            });
          }
        }, 1000);
      }

      setIsLoaded(true);

      console.log('? Enhanced clicker game loaded successfully from Firebase');

    } catch (error) {
      console.error('?? Error loading clicker game from Firebase:', error);
      setIsLoaded(true);
      addToast('Load failed, starting new game!', 'warning');
    }
  }, [studentData, isLoaded, gameState.artifacts, gameState.upgrades, addToast, initializeMusic, fmt]);

  // Manual save function
  const manualSave = useCallback(() => {
    saveToFirebase();
    addToast('Game saved!', 'success');
  }, [saveToFirebase, addToast]);

  const restartGame = useCallback(async () => {
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Are you sure? This will permanently reset your Hero Forge progress.')
      : false;

    if (!confirmed) return;

    try {
      if (updateStudentData) {
        await updateStudentData({
          clickerGameData: null,
          clickerAchievements: null
        });
      }
      addToast('Hero Forge progress reset. Starting a new adventure!', 'success');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to restart Hero Forge:', error);
      addToast('Could not reset progress. Please try again.', 'error');
    }
  }, [updateStudentData, addToast]);

  // Load on component mount
  useEffect(() => {
    if (studentData && !isLoaded) {
      loadFromFirebase();
    }
  }, [studentData, loadFromFirebase, isLoaded]);

  // Auto-save
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveRef.current > 25000) {
        console.log('? Auto-saving enhanced clicker game...');
        saveToFirebase();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, saveToFirebase]);

  // Trigger encounters every 150 attacks, alternating enemy/event.
  useEffect(() => {
    if (!isLoaded) return;
    if (gameState.encounterClicks < 150) return;
    if (gameState.activeEnemy || gameState.event.shown) return;

    setGameState(prev => ({ ...prev, encounterClicks: 0 }));
    spawnChoiceEvent();
  }, [isLoaded, gameState.encounterClicks, gameState.activeEnemy, gameState.event.shown, spawnChoiceEvent]);

  // Trigger encounters randomly every 90-120 seconds (in addition to click-based triggers).
  useEffect(() => {
    if (!isLoaded) return;

    if (!nextRandomEncounterAtRef.current) {
      nextRandomEncounterAtRef.current = Date.now() + (90000 + Math.random() * 30000);
    }

    const timer = setInterval(() => {
      const now = Date.now();
      if (now < nextRandomEncounterAtRef.current) return;
      if (gameState.activeEnemy || gameState.event.shown) return;

      spawnChoiceEvent();
      nextRandomEncounterAtRef.current = Date.now() + (90000 + Math.random() * 30000);
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoaded, gameState.activeEnemy, gameState.event.shown, spawnChoiceEvent]);

  // Update event and enemy timers
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();

      if (showChoiceEvent) {
        const timeLeft = Math.max(0, Math.ceil((gameState.event.until - now) / 1000));
        setEventTimeLeft(timeLeft);
      }

      if (gameState.activeEnemy) {
        const elapsed = (now - gameState.activeEnemy.spawnTime) / 1000;
        const timeLeft = Math.max(0, Math.ceil(gameState.activeEnemy.timeLimit - elapsed));
        setEnemyTimeLeft(timeLeft);

        if (timeLeft <= 0) {
          let actualLoss = 0;
          setGameState(prev => {
            const lossPercentage = 0.1 + (Math.random() * 0.1); // 10% to 20%
            const penalty = Math.floor(prev.gold * lossPercentage);
            actualLoss = Math.min(prev.gold, penalty);
            return { ...prev, gold: Math.max(0, prev.gold - penalty), totalGold: Math.max(0, prev.totalGold - penalty), activeEnemy: null };
          });
          addToast(`Time's up! The ${gameState.activeEnemy.name} escaped. You lost ${fmt(actualLoss)} gold!`, 'error');
        }
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, [showChoiceEvent, gameState.event.until, gameState.activeEnemy, addToast, fmt]);

  // Check unlocks & Apply Auto-Clicker
  useEffect(() => {
    if (isLoaded) {
      checkUnlocks();

      // NEW: Auto Clicker Logic
      const autoClickLevel = getSkillLevel('auto_clicker');
      if (autoClickLevel > 0) {
        const intervalMs = SKILL_UPGRADES['auto_clicker'].effect(autoClickLevel).value * 1000;
        const autoClickInterval = setInterval(() => {
          // Trigger a weak click (no crit)
          const gain = dpc();
          // We need to re-implement basic addGold logic here to avoid full click overhead or just call attack(null)
          // But attack requires event for floating number. Let's make attack handle null event.
          // Actually, calling attack(null) is fine, it just won't show floating number.

          // To be safe and show effect, let's just add gold directly
          addGold(gain);
        }, intervalMs);
        return () => clearInterval(autoClickInterval);
      }
    }
  }, [checkUnlocks, isLoaded, getSkillLevel, dpc, addGold]);

  // Apply selected weapon and theme
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      activeWeapon: selectedWeapon,
      activeTheme: selectedTheme
    }));
  }, [selectedWeapon, selectedTheme]);

  // Game loop
  useEffect(() => {
    if (!isLoaded) return;

    const gameLoop = () => {
      const now = Date.now();
      const dt = Math.min(0.25, (now - (lastUpdateRef.current || now)) / 1000);
      lastUpdateRef.current = now;

      // Update DPS production + level-based auto farming (starts at 0 at level 1)
      const production = passiveGoldPerSecond() * dt;
      if (production > 0 && isFinite(production)) {
        addGold(production);
      }

      // Update time played
      setGameState(prev => ({
        ...prev,
        timePlayed: prev.timePlayed + dt
      }));

      // Clean up expired boons
      setGameState(prev => ({
        ...prev,
        boons: prev.boons.filter(boon => now < boon.until)
      }));

      // Choice event timeout system
      if (gameState.event.shown && now >= gameState.event.until) {
        setGameState(prev => ({
          ...prev,
          event: { ...prev.event, shown: false }
        }));
        setShowChoiceEvent(false);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isLoaded, passiveGoldPerSecond, addGold, gameState.event]);

  // NEW: Daily Restock Logic for Camp Shop
  useEffect(() => {
    if (!isLoaded) return;

    const checkAndRestock = () => {
      const now = new Date();
      const lastRestock = new Date(gameState.lastCampRestock);

      // Check if it's a new day since the last restock
      if (now.getDate() !== lastRestock.getDate() ||
        now.getMonth() !== lastRestock.getMonth() ||
        now.getFullYear() !== lastRestock.getFullYear()) {

        setGameState(prev => {
          // Only restock if items are not already present or if it's a new day
          if (prev.campShopItems && prev.campShopItems.length === 3 &&
            now.getDate() === new Date(prev.lastCampRestock).getDate() &&
            now.getMonth() === new Date(prev.lastCampRestock).getMonth() &&
            now.getFullYear() === new Date(prev.lastCampRestock).getFullYear()) {
            return prev; // Already restocked for today
          }

          let shopItems = [];
          let attempts = 0;
          while (shopItems.length < 3 && attempts < 50) {
            const rId = pickArtifactByRarity(true); // Exclude Mythic
            if (rId && !shopItems.includes(rId)) {
              shopItems.push(rId);
            }
            attempts++;
          }
          // Fallback if not enough unique items found
          const finalShopItems = shopItems.length === 3 ? shopItems : ['1', '2', '3'];
          addToast('Camp shop restocked with new items!', 'info');
          return { ...prev, campShopItems: finalShopItems, lastCampRestock: now.toISOString() };
        });
      }
    };

    // Run immediately on load
    checkAndRestock();

    // Set up interval to check daily (e.g., every hour)
    const interval = setInterval(checkAndRestock, 3600 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [isLoaded, gameState.lastCampRestock, setGameState, pickArtifactByRarity, addToast]);


  // Memoized Leaderboard Rows - Moved here to be before conditional returns but after fmt definition
  const leaderboardRows = useMemo(() => {
    if (!classmates || !Array.isArray(classmates)) return <div className="p-4 text-center text-gray-500">No classmates found.</div>;

    return [...classmates]
      .filter(s => s && typeof s === 'object')
      .sort((a, b) => {
        const goldA = a?.clickerGameData?.totalGold || 0;
        const goldB = b?.clickerGameData?.totalGold || 0;
        return goldB - goldA;
      })
      .map((student, index) => {
        const data = student.clickerGameData || {};
        const isMe = studentData && getStudentIdentifier(student) === getStudentIdentifier(studentData);
        return (
          <div key={student.id || index} className={`p-4 flex items-center gap-4 ${isMe ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold text-sm 
                            ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-300 text-gray-800' :
                  index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'}`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 truncate">
                {student.firstName || 'Unknown'} {student.lastName && student.lastName[0]}.
                {isMe && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">You</span>}
              </div>
              <div className="text-xs text-gray-500 flex gap-2">
                {data.activeTitle && <span>{data.activeTitle}</span>}
                {data.prestige > 0 && <span className="text-yellow-600">Prestige {data.prestige}</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-yellow-600">{fmt(data.totalGold || 0)}</div>
              <div className="text-xs text-gray-400">{fmt(data.dpc || 0)} DPS</div>
            </div>
          </div>
        );
      });
  }, [classmates, studentData, fmt]);

  // Show loading screen
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading Hero Forge...</h2>
          <p className="text-gray-500 mt-2">Preparing your enhanced adventure!</p>
        </div>
      </div>
    );
  }

  const currentTheme = THEMES[gameState.activeTheme] || THEMES.default;
  const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
  const currentTitle = TITLES[gameState.activeTitle] || TITLES['Novice'];
  const prestigeBorder = getPrestigeBorder(gameState.prestige);



  return (
    <div className={`min-h-screen p-4 ${currentTheme.bg}`}>
      {/* Custom styles */}
      <style jsx>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0px); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        .float-number { animation: float-up 0.8s ease-out forwards; }
        .prestige-glow { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2); }
        .boss-health-bar {
          background: linear-gradient(90deg, #ff4444 0%, #ff6666 50%, #ff4444 100%);
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>

      {/* Floating Numbers overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingNumbers.map(({ id, x, y, text, color, icon }) => (
          <div
            key={id}
            className="absolute select-none font-bold float-up"
            style={{
              left: x,
              top: y - 20, // Start slightly above click
              color: color,
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)', /* Stronger shadow */
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: icon ? '1.5rem' : '1.25rem' // Slightly bigger if it has an icon
            }}
          >
            {icon && <span className="animate-spin-slow drop-shadow-md">{icon}</span>}
            {text}
          </div>
        ))}
      </div>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg text-white font-semibold max-w-sm ${toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
              }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* NEW: Skill Challenge Modal */}
      {showSkillChallenge && challengeData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-md p-6 border-4 border-purple-400`}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-2">?? {challengeData.name}</h2>
              <p className="text-gray-700 mb-4">{challengeData.description}</p>
              <div className="text-lg font-semibold text-green-600">
                Reward: {fmt(challengeData.goldReward)} gold + 1 skill point
              </div>
            </div>

            <div className="mb-6">
              {challengeData.type === 'timing' && (
                <TimingChallenge
                  onComplete={completeSkillChallenge}
                  duration={challengeData.duration}
                />
              )}
              {challengeData.type === 'sequence' && (
                <SequenceChallenge
                  onComplete={completeSkillChallenge}
                  duration={challengeData.duration}
                />
              )}
              {challengeData.type === 'speed' && (
                <SpeedChallenge
                  onComplete={completeSkillChallenge}
                  duration={challengeData.duration}
                />
              )}
            </div>

            <div className="text-center">
              <button
                onClick={() => completeSkillChallenge(false)}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Give up challenge
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Music Button and Glassmorphism */}
        <div className={`${currentTheme.panel} rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-200 p-6 mb-6`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
                ??
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Hero Forge Enhanced
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center min-w-[150px]">
                    <div className={`inline-block px-3 py-0.5 rounded-full text-sm font-bold ${currentTitle.color} bg-opacity-20 border-2 border-current ${currentTitle.glow} shadow-lg`}>
                      Lvl {gameState.level} {gameState.activeTitle}
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-3 mt-1.5 border border-gray-600 overflow-hidden relative shadow-inner" title={`${gameState.xp} / ${getNextLevelXP(gameState.level)} XP`}>
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 relative" style={{ width: `${Math.min(100, (gameState.xp / getNextLevelXP(gameState.level)) * 100)}%` }}>
                        <div className="absolute inset-0 bg-white/20"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                        {Math.floor(gameState.xp)} / {getNextLevelXP(gameState.level)} XP
                      </div>
                    </div>
                  </div>
                  {gameState.prestige > 0 && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold text-yellow-400 bg-yellow-400 bg-opacity-20 border-2 border-yellow-400 shadow-yellow-400/50 shadow-lg">
                      Prestige {gameState.prestige} ?
                    </div>
                  )}
                  {gameState.masterLevel > 0 && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold text-purple-300 bg-purple-300 bg-opacity-20 border-2 border-purple-300 shadow-purple-300/50 shadow-lg">
                      Master Level {gameState.masterLevel} ??
                    </div>
                  )}
                  {(gameState.keys?.normal > 0 || gameState.keys?.dark > 0 || gameState.keys?.ice > 0) && (
                    <div className="flex items-center space-x-2 ml-2">
                      {gameState.keys.normal > 0 && (
                        <div className="flex items-center bg-gray-800/80 px-2 py-1 rounded-lg border border-gray-600 shadow-lg" title="Normal Keys">
                          <img src="/Hero Forge/Items/Keys/Key.png" alt="Normal Key" className="w-5 h-5 object-contain mr-1" />
                          <span className="font-bold text-yellow-400 text-sm">{gameState.keys.normal}</span>
                        </div>
                      )}
                      {gameState.keys.dark > 0 && (
                        <div className="flex items-center bg-gray-800/80 px-2 py-1 rounded-lg border border-purple-600 shadow-lg" title="Dark Keys">
                          <img src="/Hero Forge/Items/Keys/Dark Key.png" alt="Dark Key" className="w-5 h-5 object-contain mr-1" />
                          <span className="font-bold text-purple-400 text-sm">{gameState.keys.dark}</span>
                        </div>
                      )}
                      {gameState.keys.ice > 0 && (
                        <div className="flex items-center bg-gray-800/80 px-2 py-1 rounded-lg border border-blue-400 shadow-lg" title="Ice Keys">
                          <img src="/Hero Forge/Items/Keys/Ice Key.png" alt="Ice Key" className="w-5 h-5 object-contain mr-1" />
                          <span className="font-bold text-blue-300 text-sm">{gameState.keys.ice}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {/* NEW: Scoreboard Button */}
              <button
                onClick={() => setShowScoreboard(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-bold flex items-center gap-2"
              >
                <span>🏆</span> Scoreboard
              </button>

              {/* NEW: Music Toggle Button */}
              <button
                onClick={toggleMusic}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${gameState.musicEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-500 hover:bg-gray-600 text-white'
                  }`}
                title={gameState.musicEnabled ? 'Turn off music' : 'Turn on music'}
              >
                {gameState.musicEnabled ? '🎵 Music On' : '🔇 Music Off'}
              </button>

              {canPrestige() && (
                <button
                  onClick={doPrestige}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-bold prestige-glow"
                >
                  ✨ Prestige (+{calculatePrestigeGain()})
                </button>
              )}
              <button
                onClick={() => setShowSkillShop(true)}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                🧠 Skills ({gameState.skillPoints})
              </button>
              <button
                onClick={() => setShowUnlockables(!showUnlockables)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                🎨 Customize
              </button>
              <button
                onClick={restartGame}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-bold"
                title="Restart Hero Forge"
              >
                🔄 Restart
              </button>
              <button
                onClick={manualSave}
                disabled={saveInProgress}
                className={`px-4 py-2 rounded-lg transition-colors ${saveInProgress
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
              >
                {saveInProgress ? '💾 Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Scoreboard Modal */}
        {showScoreboard && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`${currentTheme.panel} w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]`}>
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                <h2 className="text-2xl font-black text-yellow-600 flex items-center gap-2">
                  <span>??</span> Global Leaderboard
                </h2>
                <button
                  onClick={() => setShowScoreboard(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                >
                  ?
                </button>
              </div>

              <div className="overflow-y-auto p-0 flex-1">
                <div className="divide-y divide-gray-100">
                  <div className="divide-y divide-gray-100">
                    {leaderboardRows}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setShowScoreboard(false)} // In a real app we might re-fetch here
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-semibold text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NEW: Skill Shop Modal */}
        {showSkillShop && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-4xl p-6 border-4 border-teal-400 max-h-[90vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-teal-600">?? Skill Shop</h2>
                  <p className="text-gray-600">Spend Skill Points to unlock permanent upgrades!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">Points: {gameState.skillPoints}</div>
                  <button onClick={() => setShowSkillShop(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(SKILL_UPGRADES).map(skill => {
                  const currentLevel = gameState.skillUpgrades[skill.id] || 0;
                  const maxed = currentLevel >= skill.maxLevel;
                  const cost = Math.floor(skill.costPerLevel * Math.pow(skill.costScale, currentLevel));
                  const canAfford = gameState.skillPoints >= cost;

                  return (
                    <div key={skill.id} className="border-2 border-teal-100 rounded-xl p-4 bg-teal-50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-bold text-teal-800">{skill.name}</h3>
                          <span className="bg-teal-200 text-teal-800 text-xs px-2 py-1 rounded-full font-bold">
                            Lvl {currentLevel} / {skill.maxLevel}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
                      </div>
                      <div className="mt-4">
                        {!maxed ? (
                          <button
                            onClick={() => buySkillUpgrade(skill.id)}
                            disabled={!canAfford}
                            className={`w-full py-2 rounded-lg font-bold transition-all ${canAfford
                              ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                          >
                            Upgrade ({cost} SP)
                          </button>
                        ) : (
                          <div className="w-full py-2 bg-teal-200 text-teal-800 text-center rounded-lg font-bold">
                            MAXED OUT
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[70vh] mt-8 max-w-7xl mx-auto">
          {/* Prominent Gold Display */}
          <div className="bg-gray-900 px-10 py-4 rounded-full border-2 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] z-20 flex items-center gap-4 mb-4 transform hover:scale-105 transition-transform cursor-default">
            <span className="text-5xl drop-shadow-lg">??</span>
            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              {fmt(Math.floor(gameState.totalGold))}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8 z-20">
            <p className="text-white bg-gray-900 px-6 py-2 rounded-full text-lg font-bold shadow-xl border border-gray-700 uppercase tracking-widest text-sm">
              {gameState.inCamp ? 'Rest at Camp' : 'Mine for resources'}
            </p>
            <button
              onClick={() => setGameState(prev => ({ ...prev, inCamp: !prev.inCamp }))}
              className={`px-6 py-2 rounded-full text-lg font-bold shadow-xl border-2 uppercase tracking-widest text-sm transition-all ${gameState.inCamp
                ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500'
                : 'bg-green-600 border-green-400 text-white hover:bg-green-500'
                }`}
            >
              {gameState.inCamp ? 'Back to Mine' : 'Camp'}
            </button>
          </div>

          <div className="relative z-10 w-full flex flex-col lg:flex-row gap-8 items-start justify-center p-4">

            {/* Left Column: Player Actions (Pickaxe + Weapon or Camp Options) */}
            <div className="w-full lg:w-1/3 flex flex-col items-center mt-10">

              {gameState.inCamp ? (
                /* CAMP VIEW UI */
                <div className="w-full flex-1 grid grid-cols-2 gap-4">
                  {/* Shop Button */}
                  <div
                    onClick={() => setShowCampShop(true)}
                    className="bg-gray-800 border-2 border-yellow-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <span className="text-5xl mb-2">??</span>
                    <span className="text-xl font-bold text-yellow-500">Shop</span>
                  </div>

                  {/* Craft Button */}
                  <div
                    onClick={() => setShowCraftingForge(true)}
                    className="bg-gray-800 border-2 border-orange-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <span className="text-5xl mb-2">??</span>
                    <span className="text-xl font-bold text-orange-500">Craft</span>
                  </div>

                  {/* Anvil Button */}
                  <div
                    onClick={() => addToast('Coming soon!', 'info')}
                    className="bg-gray-800 border-2 border-gray-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <span className="text-5xl mb-2">??</span>
                    <span className="text-xl font-bold text-gray-400">Anvil</span>
                  </div>

                  {/* House Button */}
                  <div
                    onClick={() => addToast('Coming soon!', 'info')}
                    className="bg-gray-800 border-2 border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <span className="text-5xl mb-2">??</span>
                    <span className="text-xl font-bold text-blue-400">House</span>
                  </div>
                </div>
              ) : (
                /* MINING VIEW UI */
                <>
                  {/* Main Clickable Area - Pickaxe */}
                  <div
                    className={`w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center text-8xl cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xl relative ${prestigeBorder} border-4 border-gray-600`}
                    onClick={attack}
                    style={{
                      boxShadow: `inset 0 20px 60px rgba(0,0,0,0.5), 0 30px 60px rgba(0,0,0,0.8)`
                    }}
                  >
                    <img
                      src={`/Hero Forge/Items/Pickaxes/level${gameState.pickaxeLevel}.png`}
                      alt="Pickaxe"
                      className="w-40 h-40 object-contain filter drop-shadow-2xl hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all z-20 relative"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="text-8xl hidden">??</div>

                    {/* Enhanced decorative elements */}
                    <div className="absolute top-4 left-12 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse"></div>
                    <div className="absolute top-16 left-6 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-8 left-24 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-12 right-6 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-16 right-4 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-24 right-12 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{ animationDelay: '2.5s' }}></div>
                  </div>

                  {/* Equipped Weapon Display */}
                  <div className="mt-6 flex flex-col items-center">
                    <div className="bg-gray-900 p-4 rounded-2xl border border-gray-600 shadow-2xl inline-flex flex-col items-center min-w-[160px] hover:bg-gray-800 transition-colors">
                      <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Equipped</h3>
                      <div
                        className="w-16 h-16 flex items-center justify-center bg-gray-900/50 rounded-xl shadow-inner mb-2 border border-gray-700/50 relative overflow-hidden group cursor-pointer hover:border-red-500/50 transition-colors"
                        onClick={attackEnemy}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                        <img
                          src={currentWeapon.path}
                          alt={currentWeapon.name}
                          className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] z-10 group-hover:scale-110 transition-transform active:scale-95"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                      <p className="text-sm font-bold text-blue-300">{currentWeapon.name}</p>
                      <p className="text-xs text-green-400 font-semibold">+{currentWeapon.dpcMultiplier}x DMG</p>

                      {/* Equipped Artifacts */}
                      {gameState.equippedArtifacts && gameState.equippedArtifacts.some(a => a) && (
                        <div className="border-t border-gray-700/50 mt-3 pt-3 w-full flex justify-center gap-2">
                          {gameState.equippedArtifacts.map((artId, idx) => {
                            if (!artId) return null;
                            const art = MERCHANT_ITEMS[artId];
                            const count = gameState.inventory.filter(id => id === artId).length;
                            return (
                              <div key={idx} className="w-10 h-10 rounded-lg bg-gray-900/50 border border-yellow-500/50 flex items-center justify-center relative group cursor-help hover:bg-gray-800/80 transition-colors shadow-md">
                                <img src={art.path} alt={art.name} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" onError={(e) => { e.target.style.display = 'none'; }} />
                                {count > 0 && <span className="absolute -bottom-1 -right-1 bg-pink-600 text-white text-[9px] font-black px-1 rounded-sm shadow-sm ring-1 ring-black">x{count}</span>}

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-max bg-gray-900 text-white text-xs p-2 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-gray-700">
                                  <div className="font-bold text-yellow-400">{art.name}</div>
                                  <div className="text-blue-300">{art.desc}</div>
                                  <div className="text-green-400 mt-1 font-bold">Total Bonus: +{Math.round((art.value - 1) * count * 100)}%</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Environment & Stats */}
            <div className="w-full lg:w-2/3 flex flex-col items-center lg:items-end">
              {/* Environment Display */}
              <div className="w-full relative rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-4 border-yellow-500/50 overflow-hidden bg-gray-950 flex justify-center items-center mb-6 min-h-[300px] lg:min-h-[400px]" style={{ maxHeight: '500px' }}>
                <img
                  src={getBackgroundImage()}
                  alt="Mining Environment"
                  className="w-full h-auto object-cover relative z-10 transition-all duration-1000"
                  style={{ maxHeight: '500px', width: '100%', objectFit: 'contain' }}
                />

                {/* Fallback ambient blur behind the contained image */}
                <img
                  src={getBackgroundImage()}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40 blur-2xl z-0 transition-all duration-1000"
                />

                {/* NEW: Inline Choice Event Overlay */}
                {showChoiceEvent && gameState.event && (
                  <div className="absolute inset-0 z-40 bg-black/90 flex flex-col items-center justify-center p-6 text-center overflow-y-auto w-full h-full">
                    <h2 className="text-3xl font-black text-yellow-400 mb-2 drop-shadow-lg tracking-wider">? Adventure Event ?</h2>

                    <div className="w-full max-w-md mb-4 bg-black/50 p-2 rounded-lg border border-yellow-500/30">
                      <div className="flex justify-between text-xs font-bold text-yellow-500 mb-1 px-1">
                        <span>Time Remaining</span>
                        <span className={eventTimeLeft <= 10 ? 'text-red-500 animate-pulse' : ''}>{eventTimeLeft}s</span>
                      </div>
                      <div className="w-full bg-gray-900 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(234,179,8,0.5)] ${eventTimeLeft <= 10 ? 'bg-red-500' : 'bg-yellow-500'}`}
                          style={{ width: `${Math.max(0, Math.min(100, (eventTimeLeft / 60) * 100))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 rounded-xl border border-gray-600/50 mb-6 max-w-2xl shadow-inner w-full">
                      <p className="text-white text-lg leading-relaxed font-bold drop-shadow-md">{gameState.event.eventText}</p>
                    </div>

                    {gameState.event.type === 'merchant' ? (
                      <div className="w-full max-w-3xl space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(gameState.event.merchantInventory || []).map((artId, index) => {
                            const item = MERCHANT_ITEMS[artId];
                            if (!item) return null;
                            const canAfford = gameState.totalGold >= item.cost;
                            const count = gameState.inventory.filter(id => id === artId).length;

                            return (
                              <div key={index} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 ${count > 0 ? 'border-yellow-500 bg-yellow-900/40 hover:bg-yellow-800/60 cursor-pointer' : canAfford ? 'border-yellow-400 bg-yellow-900/40 hover:bg-yellow-800/60 cursor-pointer' : 'border-gray-600 bg-gray-900/80 opacity-60'} transition-all hover:scale-105 active:scale-95`}
                                onClick={() => {
                                  if (canAfford) {
                                    setGameState(prev => ({
                                      ...prev,
                                      gold: Math.max(0, prev.gold - item.cost),
                                      inventory: [...prev.inventory, artId],
                                      event: { ...prev.event, shown: false }
                                    }));
                                    addToast(`Purchased ${item.name}! Check Customization to equip.`, 'success');
                                    setShowChoiceEvent(false);
                                  } else {
                                    addToast(`Not enough gold for ${item.name}.`, 'error');
                                  }
                                }}
                              >
                                <div className="w-14 h-14 bg-black/60 rounded-lg shadow-inner flex items-center justify-center p-2 mb-1 border border-white/10">
                                  <img src={item.path} alt={item.name} className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                                <div className="font-bold text-white text-[13px] text-center leading-tight">
                                  {item.name} {count > 0 && <span className="text-pink-400 ml-1 text-[11px] bg-pink-900/50 px-1 rounded">x{count}</span>}
                                </div>
                                <div className="text-[10px] font-semibold text-blue-300 text-center mb-1 leading-tight">{item.desc}</div>
                                <div className={`font-black text-sm bg-black/80 px-4 py-1.5 rounded-full w-full text-center border ${canAfford ? 'text-yellow-400 border-yellow-500/30' : 'text-red-500 border-red-500/30'}`}>
                                  💰 {fmt(item.cost)}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-center">
                          <button
                            onClick={closeChoiceEvent}
                            className="px-6 py-2 rounded-xl border-2 border-gray-400/60 hover:border-gray-300 bg-gray-900/80 hover:bg-gray-800 text-white font-bold transition-all hover:scale-105 active:scale-95"
                          >
                            🚪 Leave Merchant
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 w-full max-w-md">
                        {gameState.event.choices.map((choice, index) => (
                          <button
                            key={index}
                            onClick={() => handleChoiceEvent(index)}
                            className="w-full p-4 rounded-xl border-2 border-yellow-500/50 hover:border-yellow-400 bg-gradient-to-r from-gray-900 to-black text-white font-bold transition-all hover:scale-105 active:scale-95 text-base shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                          >
                            {choice.text}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* NEW: Enemy Health Bar Overlay */}
                {gameState.activeEnemy && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-3/4 max-w-md bg-black/80 p-3 rounded-xl border-2 border-red-500/50 shadow-[0_0_20px_rgba(255,0,0,0.3)] z-30 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-1 px-2">
                      <div className="text-xl font-bold text-red-400 flex items-center gap-2">
                        👹 {gameState.activeEnemy.name}
                      </div>
                      <div className={`text-sm font-bold ${enemyTimeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
                        ⏱️ {enemyTimeLeft}s
                      </div>
                    </div>
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600 relative">
                      <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300 relative" style={{ width: `${(gameState.activeEnemy.currentHp / gameState.activeEnemy.hp) * 100}%` }}>
                        <div className="absolute inset-0 bg-white/20"></div>
                      </div>
                    </div>
                    <div className="text-white text-xs font-bold mt-1 drop-shadow-md">{fmt(Math.ceil(gameState.activeEnemy.currentHp))} / {fmt(gameState.activeEnemy.hp)} HP</div>
                  </div>
                )}

                {/* NEW: Inline Skill Test Overlay */}
                {gameState.activeEnemy && gameState.activeEnemy.skillTestActive && (
                  <InlineSkillTest
                    testName={gameState.activeEnemy.skillTest}
                    onComplete={handleEnemySkillTest}
                  />
                )}
              </div>

              {/* Visual Combat Stats */}
              <div className="w-full bg-gray-900 rounded-2xl p-4 border border-gray-600 shadow-2xl">
                <div className="flex justify-around items-center mb-4 flex-wrap gap-4">
                  <div className="flex flex-col items-center hover:scale-110 transition-transform" title="Mining Power (Gold per Click)">
                    <div className="w-12 h-12 rounded-full bg-yellow-900/40 border border-yellow-500/30 flex items-center justify-center mb-2 shadow-inner">
                      <span className="text-xl drop-shadow-md">⛏️</span>
                    </div>
                    <span className="text-base font-black text-white drop-shadow-md">{fmt(gpc())}</span>
                  </div>

                  <div className="flex flex-col items-center hover:scale-110 transition-transform" title="Damage per Click">
                    <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-500/30 flex items-center justify-center mb-2 shadow-inner">
                      <span className="text-xl drop-shadow-md">⚔️</span>
                    </div>
                    <span className="text-base font-black text-white drop-shadow-md">{fmt(dpc())}</span>
                  </div>

                  <div className="flex flex-col items-center hover:scale-110 transition-transform" title="Attacks">
                    <div className="w-12 h-12 rounded-full bg-gray-900/40 border border-gray-500/30 flex items-center justify-center mb-2 shadow-inner">
                      <span className="text-xl drop-shadow-md">🖱️</span>
                    </div>
                    <span className="text-base font-black text-white drop-shadow-md">{gameState.attacks.toLocaleString()}</span>
                  </div>

                  <div className="flex flex-col items-center hover:scale-110 transition-transform" title="Damage per Second">
                    <div className="w-12 h-12 rounded-full bg-blue-900/40 border border-blue-500/30 flex items-center justify-center mb-2 shadow-inner">
                      <span className="text-xl drop-shadow-md">⚡</span>
                    </div>
                    <span className="text-base font-black text-white drop-shadow-md">{fmt(passiveGoldPerSecond())}</span>
                  </div>

                  {gameState.skillPoints > 0 && (
                    <div className="flex flex-col items-center hover:scale-110 transition-transform" title="Skill Points">
                      <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-inner">
                        <span className="text-xl drop-shadow-md">🧠</span>
                      </div>
                      <span className="text-base font-black text-emerald-400 drop-shadow-md">{gameState.skillPoints}</span>
                    </div>
                  )}

                  {gameState.prestige > 0 && (
                    <div className="flex flex-col items-center hover:scale-110 transition-transform" title="Prestige">
                      <div className="w-12 h-12 rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center mb-2 shadow-inner">
                        <span className="text-xl drop-shadow-md">✨</span>
                      </div>
                      <span className="text-base font-black text-purple-400 drop-shadow-md">{gameState.prestige}</span>
                    </div>
                  )}
                </div>

                {/* Stat Key at the bottom */}
                <div className="pt-3 border-t border-gray-600/50 flex justify-center flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-wider text-gray-400 font-semibold bg-black/30 rounded-xl p-2">
                  <span className="flex items-center gap-1"><span className="text-sm">⛏️</span> Mining Pwr</span>
                  <span className="flex items-center gap-1"><span className="text-sm">⚔️</span> Dmg/Click</span>
                  <span className="flex items-center gap-1"><span className="text-sm">🖱️</span> Attacks</span>
                  <span className="flex items-center gap-1"><span className="text-sm">⚡</span> Dmg/Sec</span>
                  <span className="flex items-center gap-1"><span className="text-sm">💰</span> Total Gold</span>
                  {gameState.skillPoints > 0 && <span className="flex items-center gap-1"><span className="text-sm">🧠</span> Skill Pts</span>}
                  {gameState.prestige > 0 && <span className="flex items-center gap-1"><span className="text-sm">✨</span> Prestige</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Unlockables Panel with new content */}
      {
        showUnlockables && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">🎨 Customize Your Legend</h2>
                  <button
                    onClick={() => setShowUnlockables(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Enhanced Weapons with ultra-rare options */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">⚔️ Legendary Weapons</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {Object.entries(WEAPONS).map(([key, weapon]) => {
                        const unlocked = gameState.unlockedWeapons.includes(key);
                        const requirement = weapon.requirement;
                        const isUltraRare = parseInt(key) >= 18;

                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${selectedWeapon === key
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                              : unlocked
                                ? isUltraRare
                                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-yellow-500 hover:shadow-md'
                                  : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
                                : 'border-gray-200 bg-gray-100 opacity-60'
                              }`}
                            onClick={() => unlocked && setSelectedWeapon(key)}
                          >
                            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                              <img
                                src={weapon.path}
                                alt={weapon.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div className={`text-xs font-semibold ${isUltraRare ? 'text-yellow-700' : ''}`}>
                              {weapon.name}
                              {isUltraRare && <span className="ml-1">✨</span>}
                            </div>
                            <div className={`text-xs font-bold ${isUltraRare ? 'text-orange-600' : 'text-green-600'}`}>
                              +{weapon.dpcMultiplier.toLocaleString()}x
                            </div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                                {requirement.type === 'upgrades' && `${requirement.value} upgrades`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                                {requirement.type === 'masterLevel' && `Master Level ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Themes with prestige themes */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🌌 Realm Themes</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(THEMES).map(([key, theme]) => {
                        const unlocked = gameState.unlockedThemes.includes(key);
                        const requirement = theme.requirement;
                        const isPrestigeTheme = ['transcendent', 'omnipotent', 'infinite'].includes(key);

                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedTheme === key
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                              : unlocked
                                ? isPrestigeTheme
                                  ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-500 hover:shadow-md'
                                  : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
                                : 'border-gray-200 bg-gray-100 opacity-60'
                              }`}
                            onClick={() => unlocked && setSelectedTheme(key)}
                          >
                            <div className={`w-full h-6 rounded bg-gradient-to-r ${theme.bg} mb-2 ${isPrestigeTheme ? 'shadow-lg' : ''}`}></div>
                            <div className={`text-sm font-semibold ${isPrestigeTheme ? 'text-purple-700' : ''}`}>
                              {theme.name}
                              {isPrestigeTheme && <span className="ml-1">🌟</span>}
                            </div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                                {requirement.type === 'masterLevel' && `Master Level ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Titles with master tiers */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">👑 Hero Titles</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(TITLES).map(([key, title]) => {
                        const unlocked = gameState.unlockedTitles.includes(key);
                        const requirement = title.requirement;
                        const isMasterTitle = ['Transcendent', 'Omnipotent', 'Cosmic Master', 'Reality Shaper', 'Infinity Lord'].includes(key);

                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${gameState.activeTitle === key
                              ? `border-blue-500 bg-blue-50 ring-2 ring-blue-300`
                              : unlocked
                                ? isMasterTitle
                                  ? 'border-gold-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-gold-500 hover:shadow-lg'
                                  : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
                                : 'border-gray-200 bg-gray-100 opacity-60'
                              }`}
                            onClick={() => unlocked && setGameState(prev => ({ ...prev, activeTitle: key }))}
                          >
                            <div className={`text-sm font-bold ${title.color} mb-1`}>
                              {key}
                              {isMasterTitle && <span className="ml-1">👑</span>}
                            </div>
                            <div className={`w-full h-2 rounded ${title.color.replace('text-', 'bg-')} opacity-20 mb-2 ${isMasterTitle ? 'shadow-md' : ''}`}></div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                                {requirement.type === 'masterLevel' && `Master Level ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* NEW: Artifact Loadouts */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🔮 Mystical Artifacts</h3>
                    <div className="mb-4 bg-gray-900 rounded-lg p-3 border-2 border-gray-700 shadow-inner">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 text-center">Active Loadout</div>
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2].map(slotIndex => {
                          const equippedId = gameState.equippedArtifacts[slotIndex];
                          const item = equippedId ? MERCHANT_ITEMS[equippedId] : null;
                          return (
                            <div
                              key={`slot-${slotIndex}`}
                              className="w-14 h-14 bg-gray-800 rounded-md border-2 border-gray-600 flex items-center justify-center relative group cursor-pointer hover:border-red-400 transition-colors"
                              onClick={() => {
                                // Unequip
                                if (equippedId) {
                                  setGameState(prev => {
                                    const newEquipped = [...prev.equippedArtifacts];
                                    newEquipped[slotIndex] = null;
                                    return { ...prev, equippedArtifacts: newEquipped };
                                  });
                                  addToast(`Unequipped ${item.name}`, 'info');
                                }
                              }}
                            >
                              {item ? (
                                <>
                                  <img src={item.path} alt={item.name} className="w-10 h-10 object-contain drop-shadow-md" onError={(e) => e.target.style.display = 'none'} />
                                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</div>
                                </>
                              ) : (
                                <span className="text-gray-600 text-xl font-black">+</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {gameState.inventory.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm italic p-4">Your bag is empty. Find the Traveling Merchant!</div>
                      ) : (
                        gameState.inventory.map(artId => {
                          const item = MERCHANT_ITEMS[artId];
                          if (!item) return null;
                          const isEquipped = gameState.equippedArtifacts.includes(artId);

                          return (
                            <div
                              key={`inv-${artId}`}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${isEquipped ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'}`}
                              onClick={() => {
                                if (isEquipped) {
                                  // Unequip
                                  setGameState(prev => {
                                    const newEq = [...prev.equippedArtifacts];
                                    const idx = newEq.indexOf(artId);
                                    if (idx !== -1) newEq[idx] = null;
                                    return { ...prev, equippedArtifacts: newEq };
                                  });
                                } else {
                                  // Try to equip in first empty slot
                                  const emptyIdx = gameState.equippedArtifacts.indexOf(null);
                                  if (emptyIdx !== -1) {
                                    setGameState(prev => {
                                      const newEq = [...prev.equippedArtifacts];
                                      newEq[emptyIdx] = artId;
                                      return { ...prev, equippedArtifacts: newEq };
                                    });
                                    addToast(`Equipped ${item.name}`, 'success');
                                  } else {
                                    addToast('Loadout full! Unequip an artifact first.', 'warning');
                                  }
                                }
                              }}
                            >
                              <div className="w-10 h-10 shrink-0 bg-gray-100 rounded flex items-center justify-center">
                                <img src={item.path} alt={item.name} className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold truncate text-gray-800">{item.name}</div>
                                <div className="text-xs text-blue-600 truncate">{item.desc}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t text-center">
                  <button
                    onClick={() => setShowUnlockables(false)}
                    className={`bg-gradient-to-r ${currentTheme.accent} text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all`}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* NEW: Camp Shop Modal */}
      {showCampShop && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl p-8 border-4 border-yellow-500 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-gray-700 pb-4">
              <div>
                <h2 className="text-3xl font-black text-yellow-400 drop-shadow-lg flex items-center gap-3">
                  <span className="text-4xl">??</span> Camp Trader
                </h2>
                <p className="text-gray-400 mt-2 font-medium">Stock refreshes every morning.</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <button
                  onClick={() => setShowCampShop(false)}
                  className="text-gray-500 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md border border-gray-700"
                >
                  ×
                </button>
                <div className="mt-4 bg-gray-800 px-4 py-2 rounded-xl border border-yellow-500/30 flex items-center gap-2 shadow-inner">
                  <span className="text-yellow-500 text-xl">??</span>
                  <span className="text-yellow-400 font-bold text-lg">{fmt(Math.floor(gameState.gold))}</span>
                </div>
              </div>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gameState.campShopItems.map((itemId, idx) => {
                const item = MERCHANT_ITEMS[itemId];
                if (!item) return null;
                const isPurchased = gameState.campShopPurchased?.includes(itemId);
                const canAfford = gameState.gold >= item.cost;

                return (
                  <div
                    key={`${itemId}-${idx}`}
                    className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all 
                        ${isPurchased ? 'border-gray-700 bg-gray-800/50 opacity-70 grayscale' : 'border-gray-700 bg-gray-800 hover:border-yellow-500/50 hover:bg-gray-800/80 shadow-lg'}`}
                  >
                    {isPurchased && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-[2px] rounded-2xl">
                        <div className="bg-red-600 text-white font-black text-xl px-6 py-2 rounded shadow-2xl transform -rotate-12 border-2 border-red-800 tracking-wider">
                          SOLD OUT
                        </div>
                      </div>
                    )}

                    {/* Item Image */}
                    <div className="w-24 h-24 bg-gray-900 rounded-xl flex items-center justify-center mb-4 p-2 shadow-inner border border-gray-700">
                      <img
                        src={item.path}
                        alt={item.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    {/* Details */}
                    <h3 className="text-lg font-bold text-blue-300 text-center mb-1">{item.name}</h3>
                    <p className="text-xs text-green-400 font-semibold text-center mb-4 h-8 flex items-center">{item.desc}</p>

                    {/* Price */}
                    <div className="flex items-center gap-1 mb-4 bg-black/50 px-3 py-1.5 rounded-lg border border-gray-700">
                      <span className="text-sm">??</span>
                      <span className={`font-bold ${canAfford || isPurchased ? 'text-yellow-400' : 'text-red-400'}`}>
                        {fmt(item.cost)}
                      </span>
                    </div>

                    {/* Buy Button */}
                    <button
                      disabled={isPurchased || !canAfford}
                      onClick={() => {
                        setGameState(prev => ({
                          ...prev,
                          gold: prev.gold - item.cost,
                          totalGold: Math.max(0, prev.totalGold - item.cost),
                          inventory: [...prev.inventory, itemId],
                          campShopPurchased: [...(prev.campShopPurchased || []), itemId]
                        }));
                        addToast(`Purchased ${item.name}!`, 'success');
                      }}
                      className={`w-full py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg transition-all
                          ${isPurchased ? 'bg-gray-700 text-gray-500 cursor-not-allowed' :
                          canAfford ? 'bg-yellow-600 hover:bg-yellow-500 text-black hover:-translate-y-1 hover:shadow-yellow-500/30' :
                            'bg-red-900/50 text-red-500/50 cursor-not-allowed border border-red-900/50'
                        }`}
                    >
                      {isPurchased ? 'Purchased' : canAfford ? 'Purchase' : 'Too Expensive'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* End Camp Shop Items Grid */}
          </div>
        </div>
      )}

      {/* NEW: Crafting Forge Modal */}
      {showCraftingForge && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 border-4 border-orange-500 relative max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-gray-700 pb-4">
              <div>
                <h2 className="text-3xl font-black text-orange-500 drop-shadow-lg flex items-center gap-3">
                  <span className="text-4xl">🔨</span> Crafting Forge
                </h2>
                <p className="text-gray-400 mt-2 font-medium">Use Metal Ore to forge new artifacts.</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <button
                  onClick={() => setShowCraftingForge(false)}
                  className="text-gray-500 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold shadow-md border border-gray-700"
                >
                  ×
                </button>
                <div className="mt-4 bg-gray-800 px-4 py-2 rounded-xl border border-orange-500/30 flex items-center gap-2 shadow-inner">
                  <span className="text-orange-500 text-xl">⛏️</span>
                  <span className="text-white font-bold text-lg">{gameState.metalOre || 0}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Craft */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-between gap-6 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-200 mb-2">Basic Forging</div>
                  <div className="text-md text-gray-400">Craft a random artifact</div>
                </div>
                <button
                  disabled={(gameState.metalOre || 0) < 10}
                  onClick={() => {
                    const randomArtId = pickArtifactByRarity(true); // normal pool
                    const item = MERCHANT_ITEMS[randomArtId];
                    setGameState(prev => ({
                      ...prev,
                      metalOre: (prev.metalOre || 0) - 10,
                      inventory: [...prev.inventory, randomArtId]
                    }));
                    addToast(`Crafted: ${item.name}!`, 'success');
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wider
                         ${(gameState.metalOre || 0) >= 10 ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/30 shadow-lg transform hover:-translate-y-1 transition' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  Forging (10 ⛏️)
                </button>
              </div>

              {/* Rare Craft */}
              <div className="bg-gray-800 p-6 rounded-xl border-2 border-yellow-700/50 flex flex-col items-center justify-between gap-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Premium</div>
                <div className="text-center mt-4">
                  <div className="text-2xl font-bold text-yellow-500 mb-2">Perfect Forging</div>
                  <div className="text-md text-gray-400">Guaranteed Rare or better</div>
                </div>
                <button
                  disabled={(gameState.metalOre || 0) < 100}
                  onClick={() => {
                    let randomArtId = '1';
                    // Force rare or better
                    let attempts = 0;
                    while (attempts < 50) {
                      randomArtId = pickArtifactByRarity(true);
                      if (MERCHANT_ITEMS[randomArtId].rarity !== 'common') break;
                      attempts++;
                    }
                    const item = MERCHANT_ITEMS[randomArtId];
                    setGameState(prev => ({
                      ...prev,
                      metalOre: (prev.metalOre || 0) - 100,
                      inventory: [...prev.inventory, randomArtId]
                    }));
                    addToast(`Crafted Premium: ${item.name}!`, 'success');
                  }}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg tracking-wider
                         ${(gameState.metalOre || 0) >= 100 ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-500/30 shadow-lg transform hover:-translate-y-1 transition' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  Forging (100 ⛏️)
                </button>
              </div>
            </div>
          </div>
        </div>
      )
      }

      {/* NEW: Admin / Developer Tools Panel */}
      {
        studentData?.firstName === 'Teacher' && (
          <div className="max-w-7xl mx-auto mt-8 mb-12">
            <div className="bg-gray-900 border-2 border-red-500/50 rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.2)] p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg">Admin Tools</div>
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <span>???</span> Developer Console
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Unlock cheats */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-bold text-gray-300 mb-2 uppercase">Unlocks</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        const allWeaponKeys = Object.keys(WEAPONS);
                        setGameState(prev => ({ ...prev, unlockedWeapons: allWeaponKeys, xp: prev.xp + 1000000, level: Math.max(prev.level, 100) }));
                        addToast('All Weapons Unlocked! Level boosted to 100.', 'success');
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-3 rounded"
                    >
                      Unlock All Weapons & Level 100
                    </button>
                    <button
                      onClick={() => {
                        const allMerchItems = Object.keys(MERCHANT_ITEMS);
                        setGameState(prev => ({
                          ...prev,
                          inventory: [...prev.inventory, ...allMerchItems],
                          keys: { normal: 99, dark: 99, ice: 99 },
                          gold: prev.gold + 1000000000,
                          totalGold: prev.totalGold + 1000000000
                        }));
                        addToast('Max Keys, 1B Gold, & All Artifacts Added!', 'success');
                      }}
                      className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2 px-3 rounded"
                    >
                      Give All Items & 1B Gold
                    </button>
                    <button
                      onClick={() => {
                        setGameState(prev => ({ ...prev, pickaxeLevel: Math.min(prev.pickaxeLevel + 1, 10) }));
                        addToast('Pickaxe Upgrade Forced!', 'success');
                      }}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white text-sm font-bold py-2 px-3 rounded"
                    >
                      Upgrade Pickaxe (+1)
                    </button>
                  </div>
                </div>

                {/* Spawner Cheats */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-bold text-gray-300 mb-2 uppercase">Force Spawns</h3>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setGameState(prev => ({ ...prev, event: { ...prev.event, shown: false }, activeEnemy: null, nextEncounter: 'enemy' }));
                        setTimeout(() => {
                          spawnChoiceEvent();
                        }, 100);
                        addToast('Forced Enemy Spawn...', 'info');
                      }}
                      className="bg-red-700 hover:bg-red-600 text-white text-sm font-bold py-2 px-3 rounded"
                    >
                      Force Spawn Enemy
                    </button>
                    <button
                      onClick={() => {
                        setGameState(prev => ({ ...prev, event: { ...prev.event, shown: false }, activeEnemy: null, nextEncounter: 'event' }));
                        setTimeout(() => {
                          spawnChoiceEvent();
                        }, 100);
                        addToast('Forced Choice Event Spawn...', 'info');
                      }}
                      className="bg-teal-700 hover:bg-teal-600 text-white text-sm font-bold py-2 px-3 rounded"
                    >
                      Force Spawn Choice Event
                    </button>
                  </div>
                </div>

                {/* Env Cycle Cheats */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-bold text-gray-300 mb-2 uppercase">Cycles</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setGameState(prev => ({ ...prev, currentCycle: 'Day' }))} className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2 px-2 rounded">Day</button>
                    <button onClick={() => setGameState(prev => ({ ...prev, currentCycle: 'Night' }))} className="bg-indigo-900 hover:bg-indigo-800 text-white text-xs font-bold py-2 px-2 rounded">Night</button>
                    <button onClick={() => setGameState(prev => ({ ...prev, currentCycle: 'Snow' }))} className="bg-cyan-200 hover:bg-cyan-100 text-cyan-900 text-xs font-bold py-2 px-2 rounded">Snow</button>
                    <button onClick={() => setGameState(prev => ({ ...prev, currentCycle: 'BloodMoon' }))} className="bg-red-900 hover:bg-red-800 text-white text-xs font-bold py-2 px-2 rounded">Blood Moon</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

// NEW: Skill Challenge Components

// Timing Challenge Component
const TimingChallenge = ({ onComplete, duration }) => {
  const [indicator, setIndicator] = useState(0);
  const [direction, setDirection] = useState(1);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicator(prev => {
        const newVal = prev + direction * 2;
        if (newVal >= 100) {
          setDirection(-1);
          return 100;
        }
        if (newVal <= 0) {
          setDirection(1);
          return 0;
        }
        return newVal;
      });
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1 && !hasClicked) {
          onComplete(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [direction, onComplete, hasClicked]);

  const handleClick = () => {
    if (hasClicked) return;
    setHasClicked(true);

    const success = indicator >= 40 && indicator <= 60;
    onComplete(success);
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">Click when the indicator is in the green zone!</div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
      </div>

      <div className="relative w-full h-8 bg-gray-300 rounded-lg mb-4">
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 rounded-lg"></div>
        <div className="absolute left-[35%] top-0 w-[30%] h-full bg-green-400 rounded-lg"></div>
        <div
          className="absolute top-0 w-2 h-full bg-blue-600 rounded-lg transition-all duration-100"
          style={{ left: `${indicator}%` }}
        ></div>
      </div>

      <button
        onClick={handleClick}
        disabled={hasClicked}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
      >
        {hasClicked ? 'Clicked!' : 'Click Now!'}
      </button>
    </div>
  );
};

// Sequence Challenge Component
const SequenceChallenge = ({ onComplete, duration }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(true);
  const [currentShow, setCurrentShow] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    // Generate random sequence
    const newSequence = [];
    for (let i = 0; i < 5; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);

    // Show sequence
    let showIndex = 0;
    const showInterval = setInterval(() => {
      if (showIndex < newSequence.length) {
        setCurrentShow(newSequence[showIndex]);
        showIndex++;
      } else {
        setShowingSequence(false);
        clearInterval(showInterval);
      }
    }, 800);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(showInterval);
      clearInterval(timer);
    };
  }, [onComplete]);

  const handleButtonClick = (index) => {
    if (showingSequence) return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      onComplete(false);
    } else if (newPlayerSequence.length === sequence.length) {
      onComplete(true);
    }
  };

  const buttons = [
    { color: 'bg-red-500', activeColor: 'bg-red-300', icon: '??' },
    { color: 'bg-blue-500', activeColor: 'bg-blue-300', icon: '??' },
    { color: 'bg-green-500', activeColor: 'bg-green-300', icon: '??' },
    { color: 'bg-yellow-500', activeColor: 'bg-yellow-300', icon: '?' }
  ];

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">
          {showingSequence ? 'Memorize the symbols...' : 'Repeat the sequence!'}
        </div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
        <div className="text-sm text-gray-600">Progress: {playerSequence.length}/{sequence.length}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={showingSequence}
            className={`w-20 h-20 rounded-lg font-bold text-3xl text-white transition-all transform duration-100 ${showingSequence && currentShow === index
              ? `${button.activeColor} scale-110 ring-4 ring-white shadow-xl`
              : button.color
              } ${!showingSequence ? 'hover:opacity-80 active:scale-95' : ''
              }`}
          >
            {button.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// Speed Challenge Component
const SpeedChallenge = ({ onComplete, duration }) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          const success = clicks >= 25; // Need 25 clicks in 5 seconds
          onComplete(success);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clicks, onComplete]);

  const handleClick = () => {
    if (isActive) {
      setClicks(prev => prev + 1);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">Click as fast as you can!</div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
        <div className="text-lg font-semibold text-blue-600">Clicks: {clicks}</div>
        <div className="text-sm text-gray-600">Target: 25 clicks</div>
      </div>

      <button
        onClick={handleClick}
        disabled={!isActive}
        className="w-32 h-32 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full font-bold text-xl transition-all active:scale-95"
      >
        {isActive ? 'CLICK!' : 'Done!'}
      </button>

      <div className="mt-4">
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (clicks / 25) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// NEW: Inline Skill Test Component
const InlineSkillTest = ({ testName, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [isActive, setIsActive] = useState(true);

  const getTestConfig = () => {
    switch (testName) {
      case 'Quick Click': return { goal: 5, move: false, timeout: 4000 };
      case 'Split Target': return { goal: 4, move: true, timeout: 5000 };
      case 'Poison Spores': return { goal: 6, move: true, timeout: 5500 };
      case 'Erratic Orbit': return { goal: 8, move: true, timeout: 6000, fast: true };
      case 'Ambush': return { goal: 3, move: true, timeout: 3000 };
      case 'Brute Force': return { goal: 12, move: false, timeout: 5000 };
      case 'Shield Block': return { goal: 1, move: false, timeout: 2000 };
      case 'Combo Sequence': return { goal: 5, move: true, timeout: 5000 };
      case 'Gold Rush': return { goal: 10, move: true, timeout: 6000 };
      case 'Inferno': return { goal: 15, move: true, fast: true, timeout: 6000 };
      default: return { goal: 4, move: false, timeout: 4000 };
    }
  };

  const config = getTestConfig();

  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      setIsActive(false);
      onComplete(false);
    }, config.timeout);

    let moveInterval;
    if (config.move) {
      moveInterval = setInterval(() => {
        setTargetPos({
          top: `${15 + Math.random() * 70}%`,
          left: `${15 + Math.random() * 70}%`
        });
      }, config.fast ? 600 : 1000);
    }

    return () => {
      clearTimeout(timer);
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [isActive, onComplete, config.timeout, config.move, config.fast]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isActive) return;
    const newProgress = progress + 1;
    setProgress(newProgress);
    if (newProgress >= config.goal) {
      setIsActive(false);
      onComplete(true);
    }
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-40 bg-black/50 rounded-3xl overflow-hidden pointer-events-auto backdrop-blur-sm">
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-2 rounded-full text-base font-bold border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] text-center whitespace-nowrap animate-pulse">
        Defend: {testName} ({progress}/{config.goal})
      </div>

      <button
        onClick={handleClick}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full border-4 border-white shadow-[0_0_25px_rgba(255,255,255,0.8)] hover:scale-110 active:scale-90 transition-transform flex items-center justify-center text-3xl"
        style={{ ...targetPos, transition: config.move ? 'all 0.2s ease-out' : 'none' }}
      >
        ??
      </button>
    </div>
  );
};

export default ClickerGame;
