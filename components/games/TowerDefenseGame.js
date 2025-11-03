// components/games/TowerDefenseGame.js - Tower Defense Legends
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import {
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  HALLOWEEN_BASIC_AVATARS,
  HALLOWEEN_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_PETS,
  getAvatarImage,
  getPetImage
} from '../../utils/gameHelpers';
import {
  WEAPONS,
  listWeaponOptions,
  getWeaponById,
  describeWeaponRequirement
} from '../../utils/weaponData';

const LANE_COUNT = 5;
const LANE_LENGTH = 12;
const INITIAL_LIVES = 24;
const INITIAL_ENERGY = 120;
const MAX_LOG_ENTRIES = 14;
const DEMO_WAVE_CAP = 8;
const TICK_INTERVAL = 500;

const DIFFICULTY_SETTINGS = {
  relaxed: {
    id: 'relaxed',
    name: 'Adventurer',
    healthMultiplier: 0.85,
    speedMultiplier: 0.92,
    rewardMultiplier: 0.9,
    description: 'Perfect for onboarding new strategists with forgiving waves.'
  },
  heroic: {
    id: 'heroic',
    name: 'Heroic',
    healthMultiplier: 1,
    speedMultiplier: 1,
    rewardMultiplier: 1,
    description: 'Balanced for replayability and long-form classroom competitions.'
  },
  mythic: {
    id: 'mythic',
    name: 'Mythic',
    healthMultiplier: 1.35,
    speedMultiplier: 1.12,
    rewardMultiplier: 1.25,
    description: 'Relentless sieges that demand mastery of pets, weapons, and synergies.'
  }
};

const difficultyOrder = ['relaxed', 'heroic', 'mythic'];

const TERRAIN_TYPES = [
  {
    id: 'arcane',
    name: 'Arcane Ridge',
    emoji: '🔮',
    gradient: 'from-indigo-500/20 via-purple-500/20 to-fuchsia-500/20',
    boosts: { arcane: 0.25, shadow: 0.1 },
    rangeBonus: 0.4,
    speedBonus: 0.05,
    description: 'Mystic ley lines supercharge casters and shadowy defenders.'
  },
  {
    id: 'tech',
    name: 'Skyforge Causeway',
    emoji: '⚙️',
    gradient: 'from-slate-500/20 via-sky-500/20 to-cyan-500/20',
    boosts: { tech: 0.22, heroic: 0.08 },
    rangeBonus: 0.2,
    speedBonus: 0.12,
    description: 'Ancient machinery accelerates reloading and precision shots.'
  },
  {
    id: 'nature',
    name: 'Emerald Wilds',
    emoji: '🌿',
    gradient: 'from-emerald-500/20 via-lime-400/20 to-amber-400/20',
    boosts: { nature: 0.24, beast: 0.12 },
    rangeBonus: 0.6,
    description: 'Spirit-touched groves empower beast friends and long range guardians.'
  },
  {
    id: 'shadow',
    name: 'Midnight Bastion',
    emoji: '🌙',
    gradient: 'from-gray-900/20 via-purple-900/20 to-indigo-900/20',
    boosts: { shadow: 0.28, arcane: 0.1 },
    description: 'Dancing moonlight amplifies draining strikes and spectral bonds.'
  },
  {
    id: 'tactical',
    name: 'Valor Parade',
    emoji: '🛡️',
    gradient: 'from-amber-500/20 via-orange-500/20 to-red-500/20',
    boosts: { tactical: 0.2, heroic: 0.12 },
    speedBonus: 0.08,
    description: 'Command banners rally tactical leaders with rapid responses.'
  }
];

const HAZARDS = [
  {
    id: 'clear',
    name: 'Calm Winds',
    description: 'No additional effects this run. Plan freely!',
    summary: 'Stable lane with no modifiers.'
  },
  {
    id: 'manafont',
    name: 'Mana Font',
    description: 'First tower gains +0.5 range and 10% faster casting.',
    rangeBonus: 0.5,
    attackSpeedBonus: 0.1,
    summary: 'Mana Font grants bonus range and casting speed.'
  },
  {
    id: 'spire',
    name: 'Crystal Spire',
    description: 'Earn +3 energy for every foe defeated in this lane.',
    energyBonus: 3,
    summary: 'Crystal Spire awards bonus energy per defeat.'
  },
  {
    id: 'ballista',
    name: 'Ancient Ballista',
    description: 'The first placement on this lane arrives pre-built at level 2.',
    startingLevel: 2,
    summary: 'Ancient Ballista upgrades your first tower instantly.'
  }
];

const ENEMY_ARCHETYPES = [
  {
    id: 'scout',
    name: 'Scout Runner',
    emoji: '⚡',
    baseHealth: 32,
    baseSpeed: 1.15,
    reward: 4,
    score: 12,
    rarity: 0.35,
    focus: 'tactical',
    description: 'Fast and evasive. Perfect target for slows.'
  },
  {
    id: 'brute',
    name: 'Shielded Brute',
    emoji: '🛡️',
    baseHealth: 68,
    baseSpeed: 0.75,
    reward: 6,
    score: 22,
    rarity: 0.22,
    focus: 'shadow',
    description: 'Heavy armor, reduced speed. Vulnerable to piercing damage.'
  },
  {
    id: 'phantom',
    name: 'Void Phantom',
    emoji: '👻',
    baseHealth: 54,
    baseSpeed: 0.95,
    reward: 7,
    score: 28,
    rarity: 0.18,
    focus: 'arcane',
    description: 'Phase-shifting foes with spectral shields.'
  },
  {
    id: 'ranger',
    name: 'Skirmisher Pack',
    emoji: '🗡️',
    baseHealth: 40,
    baseSpeed: 1.05,
    reward: 5,
    score: 18,
    rarity: 0.2,
    focus: 'tactical',
    description: 'Coordinated fighters that pressure the front line.'
  },
  {
    id: 'wyrmling',
    name: 'Ember Wyrmling',
    emoji: '🐉',
    baseHealth: 58,
    baseSpeed: 0.9,
    reward: 8,
    score: 30,
    rarity: 0.12,
    focus: 'nature',
    description: 'Breathes flame barriers that resist basic attacks.'
  }
];

const BOSS_ARCHETYPES = [
  {
    id: 'relic-titan',
    name: 'Relic Titan',
    emoji: '🗿',
    baseHealth: 480,
    baseSpeed: 0.6,
    reward: 30,
    score: 200,
    focus: 'shadow',
    description: 'Monolithic guardian infused with ancient shields.'
  },
  {
    id: 'storm-queen',
    name: 'Storm Queen',
    emoji: '🌩️',
    baseHealth: 420,
    baseSpeed: 0.75,
    reward: 32,
    score: 220,
    focus: 'arcane',
    description: 'Calls down tempests that quicken nearby foes.'
  },
  {
    id: 'chrono-hydra',
    name: 'Chrono Hydra',
    emoji: '⏳',
    baseHealth: 520,
    baseSpeed: 0.7,
    reward: 36,
    score: 250,
    focus: 'tech',
    description: 'Warps time, resisting slow effects until weakened.'
  }
];

const MUTATOR_LIBRARY = [
  {
    id: 'shadow-veil',
    name: 'Shadow Veil',
    description: 'Enemies spawn with spectral shields. Arcane towers deal +12% damage.',
    applyEnemy: (enemy, wave) => ({
      ...enemy,
      shield: (enemy.shield || 0) + Math.round(10 + wave * 1.5)
    }),
    applyTower: (tower) =>
      tower.focus === 'arcane'
        ? { ...tower, damage: Math.round(tower.damage * 1.12) }
        : tower
  },
  {
    id: 'beast-bond',
    name: 'Beast Bond',
    description: 'Companion beasts roar with power. Pets with beastly themes grant +18% damage.',
    applyTower: (tower) =>
      tower.petFocus === 'beast'
        ? { ...tower, damage: Math.round(tower.damage * 1.18) }
        : tower
  },
  {
    id: 'time-distortion',
    name: 'Time Distortion',
    description: 'Foes rush quicker but towers reload faster after leveling.',
    applyEnemy: (enemy) => ({
      ...enemy,
      speed: parseFloat((enemy.speed * 1.08).toFixed(2))
    }),
    onTowerLevel: (tower) => ({
      ...tower,
      attackSpeed: Math.max(420, Math.round(tower.attackSpeed * 0.9))
    })
  },
  {
    id: 'radiant-surplus',
    name: 'Radiant Surplus',
    description: 'Gain +6 bonus energy whenever a boss falls. Enemies resist slows slightly.',
    applyEnemy: (enemy) => ({
      ...enemy,
      slowResist: (enemy.slowResist || 0) + 0.1
    }),
    onBossDefeat: (awardEnergy) => awardEnergy(6)
  }
];

const createSeededRandom = (seed) => {
  let value = Math.abs(Math.floor(seed || 1)) % 2147483647;
  if (value <= 0) value = 1;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

const dedupeByName = (items = []) => {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    if (!item?.name) return;
    const key = item.name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
};

const generateRealmName = (seed) => {
  const rng = createSeededRandom(seed);
  const prefixes = ['Crystal', 'Arcadian', 'Elder', 'Solar', 'Nebula', 'Aurora', 'Mythic', 'Prime'];
  const suffixes = ['Stronghold', 'Sanctum', 'Frontier', 'Rampart', 'Citadel', 'Cascade', 'Outpost', 'Spire'];
  const mid = ['of Echoes', 'of Legends', 'of Guardians', 'of Wonders', 'of the Ancients', 'of Radiance'];
  const prefix = prefixes[Math.floor(rng() * prefixes.length)];
  const suffix = suffixes[Math.floor(rng() * suffixes.length)];
  const middle = mid[Math.floor(rng() * mid.length)];
  return `${prefix} ${suffix} ${middle}`;
};

const classifyFocus = (name = '') => {
  const value = name.toLowerCase();
  if (/wizard|mage|witch|sorcer|arcane|spell/.test(value)) return 'arcane';
  if (/robot|mech|tech|engineer|cyber|chrono|gauntlet|mechanic/.test(value)) return 'tech';
  if (/pirate|rogue|guard|knight|champ|soldier|valor|tact/.test(value)) return 'tactical';
  if (/vampire|ghost|shadow|phantom|demon|void|skeleton/.test(value)) return 'shadow';
  if (/druid|beast|beastmaster|dragon|forest|farm|nature|unicorn|animal|wolf|bear/.test(value)) return 'nature';
  if (/beast|dragon|wolf|lion|panda|orc/.test(value)) return 'beast';
  return 'heroic';
};

const evaluateAvatarBonuses = (avatarName = '') => {
  const focus = classifyFocus(avatarName);
  switch (focus) {
    case 'arcane':
      return {
        focus,
        damageBonus: 0.12,
        rangeBonus: 0.4,
        summary: 'Arcane avatar: +12% damage and +0.4 range. Excels on Arcane Ridge.'
      };
    case 'tech':
      return {
        focus,
        speedBonus: 0.14,
        summary: 'Tech avatar: +14% attack speed, +4 bonus energy on upgrade.'
      };
    case 'shadow':
      return {
        focus,
        damageBonus: 0.1,
        summary: 'Shadow avatar: +10% damage and applies weakening strikes.',
        effects: ['weaken']
      };
    case 'nature':
      return {
        focus,
        rangeBonus: 0.5,
        damageBonus: 0.06,
        summary: 'Nature avatar: Huge +0.5 range, excels with beast companions.'
      };
    case 'tactical':
      return {
        focus,
        speedBonus: 0.08,
        damageBonus: 0.05,
        summary: 'Tactical avatar: Balanced bonuses with cheaper deployments.',
        costModifier: 4
      };
    case 'beast':
      return {
        focus: 'nature',
        damageBonus: 0.09,
        summary: 'Beast avatar: Converts to nature focus with feral damage.'
      };
    default:
      return {
        focus: 'heroic',
        damageBonus: 0.04,
        summary: 'Heroic avatar: Solid +4% damage and morale boosts.'
      };
  }
};

const evaluatePetBonuses = (petName = '') => {
  const focus = classifyFocus(petName);
  const lower = petName.toLowerCase();
  const base = {
    focus,
    damageBonus: 0,
    speedBonus: 0,
    rangeBonus: 0,
    energyBonus: 0,
    summary: ''
  };

  if (/dragon|phoenix|wyrm|hydra/.test(lower)) {
    return {
      ...base,
      damageBonus: 0.16,
      summary: 'Dragon companion: +16% damage and applies burning strikes.',
      effects: ['burn']
    };
  }
  if (/wizard|mage|sage|crystal|orb/.test(lower)) {
    return {
      ...base,
      focus: 'arcane',
      speedBonus: 0.12,
      summary: 'Mystic familiar: +12% speed and arcane alignment.'
    };
  }
  if (/robot|mech|gauntlet|engineer/.test(lower)) {
    return {
      ...base,
      focus: 'tech',
      speedBonus: 0.18,
      summary: 'Robotic ally: +18% reload speed and precise targeting.'
    };
  }
  if (/unicorn|panda|pet|buddy|companion|pal/.test(lower)) {
    return {
      ...base,
      rangeBonus: 0.35,
      summary: 'Faithful companion: +0.35 range and morale energy +3.',
      energyBonus: 3
    };
  }
  if (/orc|barbarian|warrior|berserker/.test(lower)) {
    return {
      ...base,
      damageBonus: 0.14,
      summary: 'Warrior pet: +14% damage and bravery aura (+2 energy).',
      energyBonus: 2
    };
  }

  return {
    ...base,
    damageBonus: 0.08,
    summary: 'Loyal pet: +8% damage and supportive presence.'
  };
};

const addLogEntry = (entries, message) => {
  const next = [...entries, message];
  if (next.length > MAX_LOG_ENTRIES) {
    return next.slice(next.length - MAX_LOG_ENTRIES);
  }
  return next;
};

const getXpForLevel = (level) => 60 + level * 45;

const buildEnemyFromArchetype = (archetype, wave, laneIndex, rng, difficulty) => {
  const variance = 0.85 + rng() * 0.3;
  const health = Math.round(
    archetype.baseHealth * variance * (1 + wave * 0.18) * difficulty.healthMultiplier
  );
  const speed = parseFloat(
    (archetype.baseSpeed * (0.9 + rng() * 0.2) * difficulty.speedMultiplier).toFixed(2)
  );
  return {
    id: `${archetype.id}-${wave}-${Math.floor(rng() * 100000)}`,
    name: archetype.name,
    emoji: archetype.emoji,
    type: 'minion',
    archetype: archetype.id,
    focus: archetype.focus,
    lane: laneIndex,
    position: 0,
    progress: 0,
    speed,
    baseSpeed: speed,
    reward: Math.round(archetype.reward * difficulty.rewardMultiplier),
    scoreReward: Math.round(archetype.score * difficulty.rewardMultiplier),
    health,
    maxHealth: health,
    shield: archetype.id === 'phantom' ? Math.round(health * 0.15) : 0,
    slowResist: archetype.id === 'wyrmling' ? 0.15 : 0,
    effects: []
  };
};

const buildBossFromArchetype = (archetype, wave, laneIndex, difficulty) => {
  const multiplier = 1 + wave * 0.25;
  const health = Math.round(archetype.baseHealth * multiplier * difficulty.healthMultiplier);
  const speed = parseFloat((archetype.baseSpeed * difficulty.speedMultiplier).toFixed(2));
  return {
    id: `${archetype.id}-boss-${wave}-${laneIndex}`,
    name: archetype.name,
    emoji: archetype.emoji,
    type: 'boss',
    focus: archetype.focus,
    lane: laneIndex,
    position: 0,
    progress: 0,
    speed,
    baseSpeed: speed,
    reward: Math.round(archetype.reward * difficulty.rewardMultiplier),
    scoreReward: Math.round(archetype.score * difficulty.rewardMultiplier),
    health,
    maxHealth: health,
    shield: Math.round(health * 0.2),
    slowResist: 0.25,
    effects: []
  };
};

const generateMapFromSeed = (seed) => {
  const rng = createSeededRandom(seed);
  return Array.from({ length: LANE_COUNT }).map((_, laneIndex) => {
    const terrain = TERRAIN_TYPES[Math.floor(rng() * TERRAIN_TYPES.length) % TERRAIN_TYPES.length];
    const hazard = HAZARDS[Math.floor(rng() * HAZARDS.length) % HAZARDS.length];
    return {
      laneIndex,
      terrain,
      hazard
    };
  });
};

const selectMutators = (seed) => {
  const rng = createSeededRandom(seed * 13);
  const pool = [...MUTATOR_LIBRARY];
  const selected = [];
  while (selected.length < 2 && pool.length) {
    const index = Math.floor(rng() * pool.length);
    selected.push(pool.splice(index, 1)[0]);
  }
  return selected;
};

const applyMutatorsToTower = (tower, mutators) =>
  mutators.reduce((current, mutator) => {
    if (typeof mutator.applyTower === 'function') {
      const mutated = mutator.applyTower(current);
      return mutated || current;
    }
    return current;
  }, tower);

const applyMutatorsToEnemy = (enemy, mutators, wave) =>
  mutators.reduce((current, mutator) => {
    if (typeof mutator.applyEnemy === 'function') {
      const mutated = mutator.applyEnemy(current, wave);
      return mutated || current;
    }
    return current;
  }, enemy);

const TowerDefenseGame = ({
  studentData,
  updateStudentData,
  showToast,
  demoMode = false,
  gameMode: _gameMode = 'digital',
  storageKeySuffix
}) => {
  const storageKey = storageKeySuffix ? `tower-defense-legends:${storageKeySuffix}` : 'tower-defense-legends';
  const [difficulty, setDifficulty] = useState('heroic');
  const [mapSeed, setMapSeed] = useState(() => Math.floor(Math.random() * 90000) + 10000);
  const [realmName, setRealmName] = useState(() => generateRealmName(mapSeed));
  const [lanes, setLanes] = useState(() => generateMapFromSeed(mapSeed));
  const [mutators, setMutators] = useState(() => selectMutators(mapSeed));

  const [currentWave, setCurrentWave] = useState(1);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [energy, setEnergy] = useState(INITIAL_ENERGY);
  const [score, setScore] = useState(0);
  const [relics, setRelics] = useState(0);

  const [towers, setTowers] = useState([]);
  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Strategize your defense and unleash the classroom heroes!');
  const [activityLog, setActivityLog] = useState(() => addLogEntry([], 'Welcome Commander! Assemble your squad.'));
  const savedProgress = studentData?.gameProgress?.towerDefenseLegends || {};

  const energyRef = useRef(energy);
  const mutatorsRef = useRef(mutators);
  const difficultyRef = useRef(difficulty);
  const autoStartRef = useRef(autoStart);
  const towersRef = useRef(towers);

  useEffect(() => {
    try {
      const savedDifficulty = window.localStorage.getItem(`${storageKey}:difficulty`);
      const savedAuto = window.localStorage.getItem(`${storageKey}:autoStart`);
      if (savedDifficulty && DIFFICULTY_SETTINGS[savedDifficulty]) {
        setDifficulty(savedDifficulty);
      }
      if (savedAuto != null) {
        setAutoStart(savedAuto === 'true');
      }
    } catch (error) {
      // Ignore storage access errors
    }
  }, [storageKey]);

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    mutatorsRef.current = mutators;
  }, [mutators]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  useEffect(() => {
    autoStartRef.current = autoStart;
  }, [autoStart]);

  useEffect(() => {
    towersRef.current = towers;
  }, [towers]);

  useEffect(() => {
    try {
      window.localStorage.setItem(`${storageKey}:difficulty`, difficulty);
      window.localStorage.setItem(`${storageKey}:autoStart`, String(autoStart));
    } catch (error) {
      // Ignore storage access errors
    }
  }, [autoStart, difficulty, storageKey]);

  const avatarOptions = useMemo(() => {
    const combined = dedupeByName([
      ...SHOP_BASIC_AVATARS,
      ...SHOP_PREMIUM_AVATARS,
      ...(HALLOWEEN_BASIC_AVATARS || []),
      ...(HALLOWEEN_PREMIUM_AVATARS || [])
    ]);
    return combined.map((avatar) => ({
      ...avatar,
      image: getAvatarImage(avatar.name, 4),
      focus: classifyFocus(avatar.name)
    }));
  }, []);

  const petOptions = useMemo(() => {
    const combined = dedupeByName([
      ...SHOP_BASIC_PETS,
      ...SHOP_PREMIUM_PETS,
      ...(HALLOWEEN_PETS || [])
    ]);
    return combined.map((pet) => {
      const imageSource = getPetImage(pet);
      const image = typeof imageSource === 'string' ? imageSource : imageSource?.src;
      return {
        ...pet,
        image,
        focus: classifyFocus(pet.name)
      };
    });
  }, []);

  const weaponOptions = useMemo(
    () =>
      listWeaponOptions().map((weapon) => ({
        ...weapon,
        focus: classifyFocus(weapon.name)
      })),
    []
  );

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedWeaponId, setSelectedWeaponId] = useState('1');
  const [selectedLane, setSelectedLane] = useState(0);
  const [selectedTile, setSelectedTile] = useState(2);

  useEffect(() => {
    if (!selectedAvatar && avatarOptions.length) {
      setSelectedAvatar(avatarOptions[0]);
    }
  }, [avatarOptions, selectedAvatar]);

  useEffect(() => {
    if (!selectedPet && petOptions.length) {
      setSelectedPet(petOptions[0]);
    }
  }, [petOptions, selectedPet]);

  useEffect(() => {
    if (!WEAPONS[selectedWeaponId]) {
      setSelectedWeaponId(weaponOptions[0]?.id || '1');
    }
  }, [selectedWeaponId, weaponOptions]);

  const recordLog = useCallback((message) => {
    setActivityLog((prev) => addLogEntry(prev, message));
  }, []);

  const resetRun = useCallback(
    (seed = Math.floor(Math.random() * 90000) + 10000) => {
      const nextLanes = generateMapFromSeed(seed);
      const nextMutators = selectMutators(seed);
      setMapSeed(seed);
      setRealmName(generateRealmName(seed));
      setLanes(nextLanes);
      setMutators(nextMutators);
      setCurrentWave(1);
      setLives(INITIAL_LIVES);
      setEnergy(INITIAL_ENERGY);
      setScore(0);
      setRelics(0);
      setTowers([]);
      setEnemies([]);
      setIsRunning(false);
      setStatusMessage('New realm discovered! Prepare your defenses.');
      setActivityLog(addLogEntry([], 'Realm reset – new map layout and mutators in play.'));
      showToast?.('New tower defense realm ready!');
    },
    [showToast]
  );

  const currentDifficulty = useMemo(
    () => DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.heroic,
    [difficulty]
  );

  const computeTowerStats = useCallback(
    (avatar, pet, weapon, laneInfo) => {
      if (!avatar || !pet || !weapon || !laneInfo) return null;
      const avatarBonuses = evaluateAvatarBonuses(avatar.name);
      const petBonuses = evaluatePetBonuses(pet.name);
      const weaponData = getWeaponById(weapon.id || weapon);
      const focus = avatarBonuses.focus || petBonuses.focus || classifyFocus(weapon.name);
      const laneBoost = laneInfo.terrain.boosts?.[focus] || 0;
      const hazard = laneInfo.hazard;

      const baseDamage = 6 + (weaponData?.powerScore || 1) * 1.65;
      const damageMultiplier =
        1 + (avatarBonuses.damageBonus || 0) + (petBonuses.damageBonus || 0) + laneBoost;
      let damage = Math.round(baseDamage * damageMultiplier);

      let attackSpeed = 1750 - (weaponData?.powerScore || 1) * 35;
      attackSpeed *= 1 - (avatarBonuses.speedBonus || 0) - (petBonuses.speedBonus || 0);
      if (laneInfo.terrain.speedBonus) attackSpeed *= 1 - laneInfo.terrain.speedBonus;
      if (hazard?.attackSpeedBonus) attackSpeed *= 1 - hazard.attackSpeedBonus;
      attackSpeed = Math.max(520, Math.round(attackSpeed));

      let range = 2.6 + (weaponData?.powerScore || 1) / 12;
      range += (avatarBonuses.rangeBonus || 0) + (petBonuses.rangeBonus || 0);
      if (laneInfo.terrain.rangeBonus) range += laneInfo.terrain.rangeBonus;
      if (hazard?.rangeBonus) range += hazard.rangeBonus;
      range = parseFloat(Math.min(8, range).toFixed(2));

      let cost = 36 + (weaponData?.tier || 1) * 6 + (weaponData?.powerScore || 1) * 0.45;
      cost -= avatarBonuses.costModifier || 0;
      if (hazard?.costModifier) cost += hazard.costModifier;
      cost = Math.max(20, Math.round(cost));

      const energyBonus = (petBonuses.energyBonus || 0) + (hazard?.energyBonus || 0);
      const effects = new Set([...(avatarBonuses.effects || []), ...(petBonuses.effects || [])]);

      return {
        focus,
        damage,
        attackSpeed,
        range,
        cost,
        energyBonus,
        effects: Array.from(effects),
        avatarSummary: avatarBonuses.summary,
        petSummary: petBonuses.summary,
        petFocus: petBonuses.focus || classifyFocus(pet.name)
      };
    },
    []
  );

  const createTower = useCallback(
    (laneIndex, tileIndex) => {
      const laneInfo = lanes[laneIndex];
      const weapon = weaponOptions.find((w) => w.id === selectedWeaponId) || weaponOptions[0];
      const stats = computeTowerStats(selectedAvatar, selectedPet, weapon, laneInfo);
      if (!stats) return null;

      const baseTower = {
        id: `tower-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        name: `${selectedAvatar?.name || 'Hero'} + ${weapon?.name || 'Weapon'}`,
        avatar: selectedAvatar,
        pet: selectedPet,
        weapon,
        lane: laneIndex,
        position: tileIndex,
        focus: stats.focus,
        petFocus: stats.petFocus,
        damage: stats.damage,
        attackSpeed: stats.attackSpeed,
        range: stats.range,
        cost: stats.cost,
        energyBonus: stats.energyBonus,
        effects: stats.effects,
        avatarSummary: stats.avatarSummary,
        petSummary: stats.petSummary,
        lastAttack: 0,
        level: lanes[laneIndex]?.hazard?.startingLevel || 1,
        xp: 0,
        kills: 0,
        shotsFired: 0,
        laneTerrain: laneInfo.terrain,
        hazard: laneInfo.hazard
      };

      let mutatedTower = applyMutatorsToTower(baseTower, mutatorsRef.current);
      if (mutatedTower.level > 1) {
        for (let level = 1; level < mutatedTower.level; level += 1) {
          mutatedTower = {
            ...mutatedTower,
            damage: Math.round(mutatedTower.damage * 1.12 + 2),
            range: parseFloat(Math.min(8, mutatedTower.range + 0.25).toFixed(2)),
            attackSpeed: Math.max(480, Math.round(mutatedTower.attackSpeed * 0.94))
          };
        }
      }
      return mutatedTower;
    },
    [computeTowerStats, lanes, mutatorsRef, selectedAvatar, selectedPet, selectedWeaponId, weaponOptions]
  );

  const [hoveredTile, setHoveredTile] = useState(null);

  const placeTower = useCallback(() => {
    if (demoMode && towers.length >= 12) {
      setStatusMessage('Demo mode limit reached. Reset to try different builds!');
      return;
    }

    const laneInfo = lanes[selectedLane];
    if (!laneInfo) return;
    if (towers.some((tower) => tower.lane === selectedLane && tower.position === selectedTile)) {
      setStatusMessage('A tower already occupies that tile. Choose another spot.');
      return;
    }

    const newTower = createTower(selectedLane, selectedTile);
    if (!newTower) return;

    if (energyRef.current < newTower.cost) {
      setStatusMessage('Not enough energy to deploy that tower.');
      return;
    }

    setEnergy((prev) => prev - newTower.cost);
    if (newTower.energyBonus) {
      setEnergy((prev) => prev + newTower.energyBonus);
    }
    setTowers((prev) => [...prev, newTower]);
    setSelectedTowerId(newTower.id);
    recordLog(`Deployed ${selectedAvatar?.name || 'Hero'} with ${selectedPet?.name || 'Pet'} wielding ${newTower.weapon?.name}.`);
    setStatusMessage('Tower placed! Prepare for the next wave.');
  }, [createTower, demoMode, lanes, recordLog, selectedAvatar, selectedLane, selectedPet, selectedTile, towers.length]);

  const removeTower = useCallback(
    (towerId) => {
      setTowers((prev) => {
        const target = prev.find((tower) => tower.id === towerId);
        if (!target) return prev;
        const refund = Math.round((target.cost || 40) * 0.6 + target.level * 8);
        setEnergy((current) => current + refund);
        recordLog(`Recalled ${target.avatar?.name || 'tower'} for ${refund} energy.`);
        return prev.filter((tower) => tower.id !== towerId);
      });
    },
    [recordLog]
  );

  const upgradeTower = useCallback(
    (towerId) => {
      setTowers((prev) => {
        const next = prev.map((tower) => {
          if (tower.id !== towerId) return tower;
          const upgradeCost = Math.round((tower.cost || 40) * 0.6 + tower.level * 15);
          if (energyRef.current < upgradeCost) {
            setStatusMessage('Not enough energy for that upgrade.');
            return tower;
          }
          setEnergy((prevEnergy) => prevEnergy - upgradeCost);
          const leveled = {
            ...tower,
            level: tower.level + 1,
            damage: Math.round(tower.damage * 1.18 + 3),
            range: parseFloat(Math.min(8, tower.range + 0.35).toFixed(2)),
            attackSpeed: Math.max(440, Math.round(tower.attackSpeed * 0.9)),
            xp: 0
          };
          const mutated = mutatorsRef.current.reduce((current, mutator) => {
            if (typeof mutator.onTowerLevel === 'function') {
              return mutator.onTowerLevel(current) || current;
            }
            return current;
          }, leveled);
          recordLog(`Upgraded ${tower.avatar?.name || 'tower'} to level ${mutated.level}!`);
          return mutated;
        });
        return next;
      });
    },
    [recordLog]
  );

  const awardEnergy = useCallback((amount) => {
    if (!amount) return;
    setEnergy((prev) => prev + amount);
  }, []);

  const persistProgress = useCallback(
    async (progress) => {
      if (demoMode || !updateStudentData || !studentData) return;
      const existing = savedProgress;
      const payload = {
        ...existing,
        ...progress,
        lastPlayed: new Date().toISOString()
      };
      try {
        await updateStudentData({
          gameProgress: {
            ...studentData.gameProgress,
            towerDefenseLegends: payload
          }
        });
      } catch (error) {
        console.error('Failed to save Tower Defense progress', error);
      }
    },
    [demoMode, savedProgress, studentData, updateStudentData]
  );

  const generateWaveEnemies = useCallback(
    (waveNumber) => {
      const rng = createSeededRandom(mapSeed + waveNumber * 97 + lanes.length * 11);
      const difficultySettings = DIFFICULTY_SETTINGS[difficultyRef.current] || currentDifficulty;
      const enemyCount = Math.min(6 + waveNumber * 2, 45);
      const totalWeight = ENEMY_ARCHETYPES.reduce((sum, archetype) => sum + archetype.rarity, 0);

      const pickArchetype = () => {
        const roll = rng() * totalWeight;
        let cumulative = 0;
        for (const archetype of ENEMY_ARCHETYPES) {
          cumulative += archetype.rarity;
          if (roll <= cumulative) return archetype;
        }
        return ENEMY_ARCHETYPES[0];
      };

      const laneCount = lanes.length || LANE_COUNT;
      const generated = [];
      for (let index = 0; index < enemyCount; index += 1) {
        const laneIndex = Math.floor(rng() * laneCount) % laneCount;
        const archetype = pickArchetype();
        let enemy = buildEnemyFromArchetype(archetype, waveNumber, laneIndex, rng, difficultySettings);
        enemy = applyMutatorsToEnemy(enemy, mutatorsRef.current, waveNumber);
        enemy.debuffs = enemy.debuffs || {};
        generated.push(enemy);
      }

      if (waveNumber % 5 === 0) {
        const bossArchetype = BOSS_ARCHETYPES[Math.floor(rng() * BOSS_ARCHETYPES.length) % BOSS_ARCHETYPES.length];
        const laneIndex = Math.floor(rng() * laneCount) % laneCount;
        let boss = buildBossFromArchetype(bossArchetype, waveNumber, laneIndex, difficultySettings);
        boss = applyMutatorsToEnemy(boss, mutatorsRef.current, waveNumber);
        boss.debuffs = boss.debuffs || {};
        generated.push(boss);
      }

      return generated;
    },
    [currentDifficulty, lanes.length, mapSeed]
  );

  const startWave = useCallback(
    (targetWave = currentWave) => {
      const waveNumber = Math.max(1, targetWave);
      if (demoMode && waveNumber > DEMO_WAVE_CAP) {
        setStatusMessage('Demo mode capped at Wave 8. Reset to explore more realms!');
        setIsRunning(false);
        return;
      }
      const generatedEnemies = generateWaveEnemies(waveNumber);
      setCurrentWave(waveNumber);
      setEnemies(generatedEnemies);
      setIsRunning(true);
      setStatusMessage(`Wave ${waveNumber} begins!`);
      recordLog(`Wave ${waveNumber} charging with ${generatedEnemies.length} foes.`);
    },
    [currentWave, demoMode, generateWaveEnemies, recordLog]
  );

  const tickRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  const processTick = useCallback(() => {
    const now = Date.now();
    const delta = Math.min(1.5, (now - lastTickRef.current) / TICK_INTERVAL);
    lastTickRef.current = now;

    const towerArray = towersRef.current;
    const towerXp = new Array(towerArray.length).fill(0);
    const towerKills = new Array(towerArray.length).fill(0);
    const towersFired = new Set();
    const defeatedEnemies = [];
    const escapedEnemies = [];

    setEnemies((prevEnemies) => {
      if (!prevEnemies.length) {
        return prevEnemies;
      }

      const updated = prevEnemies.map((enemy) => ({
        ...enemy,
        debuffs: { ...(enemy.debuffs || {}) }
      }));

      updated.forEach((enemy) => {
        if (enemy.debuffs?.slow) {
          enemy.debuffs.slow = Math.max(0, enemy.debuffs.slow - 0.02 * delta);
        }
        const slowFactor = 1 - Math.min(enemy.debuffs?.slow || 0, 0.5);
        const effectiveSpeed = enemy.speed * slowFactor;
        enemy.progress += effectiveSpeed * delta;
        while (enemy.progress >= 1) {
          enemy.progress -= 1;
          enemy.position += 1;
        }
      });

      towerArray.forEach((tower, towerIndex) => {
        if (!tower) return;
        if (now - tower.lastAttack < tower.attackSpeed) return;
        const candidates = updated
          .map((enemy, index) => ({ enemy, index }))
          .filter(({ enemy }) => enemy.lane === tower.lane && enemy.position >= tower.position)
          .filter(({ enemy }) => enemy.position - tower.position <= tower.range);

        if (!candidates.length) return;
        candidates.sort(
          (a, b) =>
            b.enemy.position + b.enemy.progress - (a.enemy.position + a.enemy.progress)
        );
        const { enemy, index } = candidates[0];
        let damage = tower.damage;
        if (enemy.type === 'boss') {
          damage = Math.round(damage * (1.05 + tower.level * 0.03));
        }
        if (tower.effects?.includes('burn')) {
          damage += Math.round(damage * 0.25);
        }
        if (enemy.debuffs?.weakened) {
          damage += Math.round(damage * enemy.debuffs.weakened);
        }
        if (tower.effects?.includes('weaken') && !enemy.debuffs?.weakened) {
          enemy.debuffs = { ...(enemy.debuffs || {}), weakened: 0.1 };
        }
        if (tower.effects?.includes('slow')) {
          const resist = enemy.slowResist || 0;
          const applied = Math.max(0.05, 0.2 - resist);
          enemy.debuffs = {
            ...(enemy.debuffs || {}),
            slow: Math.min(0.5, (enemy.debuffs?.slow || 0) + applied)
          };
        }

        let remainingDamage = damage;
        if (enemy.shield) {
          const absorbed = Math.min(enemy.shield, remainingDamage * 0.6);
          enemy.shield = Math.max(0, enemy.shield - absorbed);
          remainingDamage -= absorbed;
        }
        enemy.health -= remainingDamage;
        towerXp[towerIndex] += Math.max(1, Math.round(remainingDamage));
        towersFired.add(towerIndex);
        if (enemy.health <= 0) {
          towerKills[towerIndex] += 1;
        }
      });

      const survivors = [];
      updated.forEach((enemy) => {
        if (enemy.health <= 0) {
          defeatedEnemies.push(enemy);
        } else if (enemy.position >= LANE_LENGTH) {
          escapedEnemies.push(enemy);
        } else {
          survivors.push(enemy);
        }
      });

      return survivors;
    });

    if (defeatedEnemies.length) {
      const energyGain = defeatedEnemies.reduce(
        (sum, enemy) => sum + (enemy.type === 'boss' ? enemy.reward + 6 : enemy.reward),
        0
      );
      const scoreGain = defeatedEnemies.reduce(
        (sum, enemy) => sum + enemy.scoreReward,
        0
      );
      setEnergy((prev) => prev + energyGain);
      setScore((prev) => prev + scoreGain);
      defeatedEnemies.forEach((enemy) => {
        if (enemy.type === 'boss') {
          mutatorsRef.current.forEach((mutator) => {
            if (typeof mutator.onBossDefeat === 'function') {
              mutator.onBossDefeat(awardEnergy);
            }
          });
        }
      });
      if (defeatedEnemies.length >= 3) {
        recordLog(`Defeated ${defeatedEnemies.length} foes! +${energyGain} energy earned.`);
      }
    }

    if (escapedEnemies.length) {
      const lifeLoss = escapedEnemies.reduce(
        (sum, enemy) => sum + (enemy.type === 'boss' ? 5 : enemy.type === 'minion' ? 1 : 2),
        0
      );
      setLives((prev) => Math.max(0, prev - lifeLoss));
      recordLog(`${escapedEnemies.length} enemies slipped through! Lost ${lifeLoss} hearts.`);
      if (lives - lifeLoss <= 0) {
        setStatusMessage('The classroom fell! Reset and try a new strategy.');
        setIsRunning(false);
      }
    }

    if (towerXp.some((xp) => xp > 0) || towerKills.some((kills) => kills > 0)) {
      setTowers((prevTowers) =>
        prevTowers.map((tower, index) => {
          if (!tower) return tower;
          const xpGain = towerXp[index] || 0;
          const killGain = towerKills[index] || 0;
          const fired = towersFired.has(index);
          if (!xpGain && !killGain && !fired) return tower;

          let updatedTower = { ...tower };
          if (fired) {
            updatedTower.lastAttack = now;
            updatedTower.shotsFired = (updatedTower.shotsFired || 0) + 1;
          }
          if (killGain) {
            updatedTower.kills = (updatedTower.kills || 0) + killGain;
          }
          if (xpGain) {
            let xp = updatedTower.xp + xpGain;
            let level = updatedTower.level;
            let leveled = false;
            let threshold = getXpForLevel(level);
            while (xp >= threshold) {
              xp -= threshold;
              level += 1;
              leveled = true;
              updatedTower.damage = Math.round(updatedTower.damage * 1.14 + 3);
              updatedTower.range = parseFloat(Math.min(8, updatedTower.range + 0.3).toFixed(2));
              updatedTower.attackSpeed = Math.max(420, Math.round(updatedTower.attackSpeed * 0.92));
              threshold = getXpForLevel(level);
            }
            updatedTower.level = level;
            updatedTower.xp = xp;
            if (leveled) {
              mutatorsRef.current.forEach((mutator) => {
                if (typeof mutator.onTowerLevel === 'function') {
                  updatedTower = mutator.onTowerLevel(updatedTower) || updatedTower;
                }
              });
            }
          }
          return updatedTower;
        })
      );
    }
  }, [awardEnergy, lives, recordLog]);

  useEffect(() => {
    if (!isRunning) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return undefined;
    }
    lastTickRef.current = Date.now();
    tickRef.current = setInterval(processTick, TICK_INTERVAL);
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [isRunning, processTick]);

  const handleWaveComplete = useCallback(() => {
    if (enemies.length) return;
    if (!isRunning) return;

    const clearedWave = currentWave;
    setIsRunning(false);
    const bonusEnergy = Math.round((28 + clearedWave * 4) * currentDifficulty.rewardMultiplier);
    const bonusRelics = clearedWave % 3 === 0 ? 1 : 0;
    setEnergy((prev) => prev + bonusEnergy);
    if (bonusRelics) {
      setRelics((prev) => prev + bonusRelics);
    }
    recordLog(`Wave ${clearedWave} cleared! +${bonusEnergy} energy`);
    setStatusMessage(`Wave ${clearedWave} complete! Ready for Wave ${clearedWave + 1}.`);

    persistProgress({
      bestWave: Math.max(savedProgress.bestWave || 0, clearedWave),
      bestScore: Math.max(savedProgress.bestScore || 0, score)
    });

    if (autoStartRef.current && (!demoMode || clearedWave + 1 <= DEMO_WAVE_CAP)) {
      setTimeout(() => startWave(clearedWave + 1), 900);
    }
  }, [autoStartRef, currentDifficulty.rewardMultiplier, currentWave, demoMode, enemies.length, isRunning, persistProgress, recordLog, savedProgress.bestScore, savedProgress.bestWave, score, startWave]);

  useEffect(() => {
    if (isRunning && enemies.length === 0) {
      handleWaveComplete();
    }
  }, [enemies.length, handleWaveComplete, isRunning]);

  const selectedTower = useMemo(
    () => towers.find((tower) => tower.id === selectedTowerId) || null,
    [towers, selectedTowerId]
  );

  const previewStats = useMemo(() => {
    const laneInfo = lanes[selectedLane];
    const weapon = weaponOptions.find((w) => w.id === selectedWeaponId) || weaponOptions[0];
    return computeTowerStats(selectedAvatar, selectedPet, weapon, laneInfo);
  }, [computeTowerStats, lanes, selectedAvatar, selectedPet, selectedLane, selectedWeaponId, weaponOptions]);

  const difficultyOptions = difficultyOrder.map((id) => DIFFICULTY_SETTINGS[id]);

  const canPlaceTower = Boolean(previewStats && energy >= previewStats.cost);

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setStatusMessage(`Difficulty set to ${DIFFICULTY_SETTINGS[newDifficulty].name}.`);
  };

  const tileIndices = useMemo(() => Array.from({ length: LANE_LENGTH }, (_, index) => index), []);

  const formatNumber = (value) => value.toLocaleString();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-2xl p-5 text-white shadow-xl border border-indigo-700/40">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-indigo-300">Realm</div>
                <h2 className="text-2xl font-bold">{realmName}</h2>
                <p className="text-indigo-200 text-sm">Mutators active: {mutators.map((m) => m.name).join(', ') || 'None'}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wide text-indigo-200">Wave</div>
                  <div className="text-xl font-semibold">{currentWave}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wide text-indigo-200">Lives</div>
                  <div className="text-xl font-semibold">{lives}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wide text-indigo-200">Energy</div>
                  <div className="text-xl font-semibold">{formatNumber(energy)}</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wide text-indigo-200">Score</div>
                  <div className="text-xl font-semibold">{formatNumber(score)}</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => startWave(currentWave)}
                disabled={isRunning || enemies.length > 0}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  isRunning || enemies.length > 0
                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                }`}
              >
                {isRunning ? 'Wave In Progress' : `Launch Wave ${currentWave}`}
              </button>
              <button
                onClick={() => setAutoStart((prev) => !prev)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  autoStart ? 'bg-yellow-500 text-white' : 'bg-white/10 text-white'
                }`}
              >
                {autoStart ? 'Auto Waves Enabled' : 'Enable Auto Waves'}
              </button>
              <button
                onClick={() => resetRun(mapSeed + Math.floor(Math.random() * 999))}
                className="px-4 py-2 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white"
              >
                Generate New Realm
              </button>
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
                <span className="text-xs uppercase tracking-wide text-indigo-200">Difficulty</span>
                <select
                  value={difficulty}
                  onChange={(event) => handleDifficultyChange(event.target.value)}
                  className="bg-transparent text-white border border-white/30 rounded px-2 py-1 text-sm focus:outline-none"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option.id} value={option.id} className="text-black">
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-4 text-sm text-indigo-200">{statusMessage}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Battlefield Layout</h3>
                <p className="text-sm text-gray-500">Hover over tiles to inspect lanes. Place towers before launching waves.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {mutators.map((mutator) => (
                  <div key={mutator.id} className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
                    {mutator.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {lanes.map((lane) => (
                <div key={lane.laneIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{lane.terrain.emoji}</div>
                      <div>
                        <div className="font-semibold text-gray-900">Lane {lane.laneIndex + 1}: {lane.terrain.name}</div>
                        <div className="text-xs text-gray-500">{lane.terrain.description}</div>
                        {lane.hazard && (
                          <div className="text-xs text-blue-500">Hazard: {lane.hazard.name} – {lane.hazard.summary}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">Boosts: {Object.keys(lane.terrain.boosts || {}).join(', ') || 'Balanced'}</div>
                  </div>
                  <div className={`grid grid-cols-${LANE_LENGTH} gap-1`}
                    style={{ gridTemplateColumns: `repeat(${LANE_LENGTH}, minmax(32px, 1fr))` }}
                  >
                    {tileIndices.map((tileIndex) => {
                      const tower = towers.find((candidate) => candidate.lane === lane.laneIndex && candidate.position === tileIndex);
                      const tileEnemies = enemies.filter((enemy) => enemy.lane === lane.laneIndex && enemy.position === tileIndex);
                      const isHovered = hoveredTile?.lane === lane.laneIndex && hoveredTile?.tile === tileIndex;
                      const isSelected = selectedTowerId && tower?.id === selectedTowerId;
                      return (
                        <button
                          key={tileIndex}
                          type="button"
                          onMouseEnter={() => setHoveredTile({ lane: lane.laneIndex, tile: tileIndex })}
                          onMouseLeave={() => setHoveredTile(null)}
                          onClick={() => {
                            if (tower) {
                              setSelectedTowerId(tower.id);
                            } else {
                              setSelectedLane(lane.laneIndex);
                              setSelectedTile(tileIndex);
                            }
                          }}
                          className={`relative h-20 border rounded-lg transition-all duration-200 ${
                            tower
                              ? 'bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-100 border-indigo-300'
                              : 'bg-gray-50 border-gray-200'
                          } ${isHovered ? 'ring-2 ring-indigo-400' : ''} ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
                        >
                          {tower ? (
                            <div className="flex flex-col h-full justify-between p-2 text-left">
                              <div className="text-xs font-semibold text-gray-700 truncate">
                                {tower.avatar?.name || 'Hero'}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate">
                                Lv {tower.level} • {tower.weapon?.name}
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col h-full items-center justify-center text-xs text-gray-400">
                              <div>Empty</div>
                              {selectedLane === lane.laneIndex && selectedTile === tileIndex && <div className="text-indigo-500">Target</div>}
                            </div>
                          )}
                          {tileEnemies.length > 0 && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1 rounded-full">
                              {tileEnemies.length}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Summon a Tower</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Avatar</label>
                <select
                  value={selectedAvatar?.name || ''}
                  onChange={(event) => {
                    const avatar = avatarOptions.find((option) => option.name === event.target.value);
                    setSelectedAvatar(avatar || avatarOptions[0]);
                  }}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {avatarOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Companion Pet</label>
                <select
                  value={selectedPet?.name || ''}
                  onChange={(event) => {
                    const pet = petOptions.find((option) => option.name === event.target.value);
                    setSelectedPet(pet || petOptions[0]);
                  }}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {petOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Weapon from Hero Forge</label>
                <select
                  value={selectedWeaponId}
                  onChange={(event) => setSelectedWeaponId(event.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {weaponOptions.map((weapon) => (
                    <option key={weapon.id} value={weapon.id}>
                      {weapon.name} — {describeWeaponRequirement(weapon)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Lane</label>
                  <select
                    value={selectedLane}
                    onChange={(event) => setSelectedLane(Number(event.target.value))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {lanes.map((lane) => (
                      <option key={lane.laneIndex} value={lane.laneIndex}>
                        Lane {lane.laneIndex + 1} — {lane.terrain.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Tile</label>
                  <select
                    value={selectedTile}
                    onChange={(event) => setSelectedTile(Number(event.target.value))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {tileIndices.map((tile) => (
                      <option key={tile} value={tile}>
                        Tile {tile + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {previewStats && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                  <div>
                    <div className="font-semibold text-indigo-700">Damage</div>
                    <div className="text-indigo-900 text-sm">{previewStats.damage}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-indigo-700">Range</div>
                    <div className="text-indigo-900 text-sm">{previewStats.range} tiles</div>
                  </div>
                  <div>
                    <div className="font-semibold text-indigo-700">Attack Speed</div>
                    <div className="text-indigo-900 text-sm">{(previewStats.attackSpeed / 1000).toFixed(2)}s</div>
                  </div>
                  <div>
                    <div className="font-semibold text-indigo-700">Energy Cost</div>
                    <div className="text-indigo-900 text-sm">{previewStats.cost}</div>
                  </div>
                  <div className="col-span-2 text-indigo-600">{previewStats.avatarSummary}</div>
                  <div className="col-span-2 text-indigo-600">{previewStats.petSummary}</div>
                </div>
              )}
              <button
                onClick={placeTower}
                disabled={!canPlaceTower}
                className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                  canPlaceTower ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Deploy Tower ({previewStats ? `${previewStats.cost} energy` : 'Select loadout'})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tower Details</h3>
            {selectedTower ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{selectedTower.avatar?.name}</div>
                    <div className="text-xs text-gray-500">Weapon: {selectedTower.weapon?.name}</div>
                  </div>
                  <div className="text-sm text-indigo-600">Level {selectedTower.level}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <div className="font-semibold text-gray-700">Damage</div>
                    <div className="text-gray-900 text-sm">{selectedTower.damage}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <div className="font-semibold text-gray-700">Attack Speed</div>
                    <div className="text-gray-900 text-sm">{(selectedTower.attackSpeed / 1000).toFixed(2)}s</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <div className="font-semibold text-gray-700">Range</div>
                    <div className="text-gray-900 text-sm">{selectedTower.range}</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                    <div className="font-semibold text-gray-700">Kills</div>
                    <div className="text-gray-900 text-sm">{selectedTower.kills || 0}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">{selectedTower.avatarSummary}</div>
                <div className="text-xs text-gray-500">{selectedTower.petSummary}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => upgradeTower(selectedTower.id)}
                    className="flex-1 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold"
                  >
                    Upgrade
                  </button>
                  <button
                    onClick={() => removeTower(selectedTower.id)}
                    className="flex-1 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold"
                  >
                    Recall
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Select a tower on the map to view upgrade options.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-4">
            <h3 className="text-lg font-bold text-gray-900">Battle Log</h3>
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto text-sm text-gray-600">
              {activityLog.map((entry, index) => (
                <div key={index} className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerDefenseGame;
