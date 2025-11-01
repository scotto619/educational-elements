// utils/gameHelpers.js - UPDATED WITH HALLOWEEN CONTENT
export const GAME_CONFIG = { MAX_LEVEL: 4, COINS_PER_XP: 5, PET_UNLOCK_XP: 50 };

// ===============================================
// LEVEL CALCULATION
// ===============================================
export const calculateAvatarLevel = (totalPoints) => {
  if (totalPoints >= 300) return 4;
  if (totalPoints >= 200) return 3;
  if (totalPoints >= 100) return 2;
  return 1;
};

// ===============================================
// COINS CALCULATION
// ===============================================
export const calculateCoins = (student) => {
  if (!student) return 0;
  const totalEarned = Math.floor((student.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student.currency || 0);
  const totalSpent = student.coinsSpent || 0;
  return Math.max(0, totalEarned - totalSpent);
};

// ===============================================
// SHOP DATA
// ===============================================
export const SHOP_BASIC_AVATARS = [
  { name: 'Banana', price: 10, path: '/shop/Basic/Banana.png' },
  { name: 'Basketball', price: 12, path: '/shop/Basic/Basketball.png' },
  { name: 'BasketballGirl', price: 12, path: '/shop/Basic/BasketballGirl.png' },
  { name: 'FarmerBoy', price: 15, path: '/shop/Basic/FarmerBoy.png' }, 
  { name: 'FarmerGirl', price: 15, path: '/shop/Basic/FarmerGirl.png' }, 
  { name: 'Goblin1', price: 15, path: '/shop/Basic/Goblin1.png' }, 
  { name: 'GoblinGirl1', price: 15, path: '/shop/Basic/GoblinGirl1.png' }, 
  { name: 'Guard1', price: 20, path: '/shop/Basic/Guard1.png' }, 
  { name: 'GuardGirl1', price: 20, path: '/shop/Basic/GuardGirl1.png' }, 
  { name: 'PirateBoy', price: 18, path: '/shop/Basic/PirateBoy.png' }, 
  { name: 'PirateGirl', price: 18, path: '/shop/Basic/PirateGirl.png' }, 
  { name: 'RoboKnight', price: 25, path: '/shop/Basic/RoboKnight.png' }, 
  { name: 'RobotBoy', price: 22, path: '/shop/Basic/RobotBoy.png' }, 
  { name: 'RobotGirl', price: 22, path: '/shop/Basic/RobotGirl.png' }, 
  { name: 'SoccerBoy', price: 10, path: '/shop/Basic/SoccerBoy.png' },
  { name: 'SoccerBoy2', price: 10, path: '/shop/Basic/SoccerBoy2.png' },
  { name: 'SoccerGirl', price: 10, path: '/shop/Basic/SoccerGirl.png' },
  { name: 'StreetBoy1', price: 15, path: '/shop/Basic/Streetboy1.png' },
  { name: 'StreetGirl1', price: 15, path: '/shop/Basic/Streetgirl1.png' },
  { name: 'Vampire1', price: 20, path: '/shop/Basic/Vampire1.png' },
  { name: 'Astronaut', price: 26, path: '/shop/Basic/Update1/Astronaut.png' },
  { name: 'Challenger 67', price: 24, path: '/shop/Basic/Update1/67.png' },
  { name: 'Demon Hunter F', price: 28, path: '/shop/Basic/Update1/DemonHunterF.png' },
  { name: 'Demon Hunter M', price: 28, path: '/shop/Basic/Update1/DemonHunterM.png' },
  { name: 'Eleven', price: 18, path: '/shop/Basic/Update1/Eleven.png' },
  { name: 'K-Pop Star', price: 17, path: '/shop/Basic/Update1/KPop.png' },
  { name: 'K-Pop Idol', price: 17, path: '/shop/Basic/Update1/KPopGirl.png' },
  { name: 'Soccer Champ', price: 20, path: '/shop/Basic/Update1/Soccer Champ.png' },
  { name: 'Spartan', price: 26, path: '/shop/Basic/Update1/Spartan.png' },
  { name: 'Terminator', price: 30, path: '/shop/Basic/Update1/Terminator.png' }
];

export const SHOP_PREMIUM_AVATARS = [ 
  { name: 'Dwarf', price: 45, path: '/shop/Premium/Dwarf.png' }, 
  { name: 'Dwarf2', price: 45, path: '/shop/Premium/Dwarf2.png' }, 
  { name: 'FarmerBoy Premium', price: 35, path: '/shop/Premium/FarmerBoy.png' }, 
  { name: 'FarmerGirl Premium', price: 35, path: '/shop/Premium/FarmerGirl.png' }, 
  { name: 'Goblin2', price: 30, path: '/shop/Premium/Goblin2.png' }, 
  { name: 'GoblinGirl2', price: 30, path: '/shop/Premium/GoblinGirl2.png' }, 
  { name: 'King', price: 60, path: '/shop/Premium/King.png' }, 
  { name: 'MechanicGirl', price: 40, path: '/shop/Premium/MechanicGirl.png' }, 
  { name: 'PirateBoy Premium', price: 42, path: '/shop/Premium/PirateBoy.png' }, 
  { name: 'PirateGirl Premium', price: 42, path: '/shop/Premium/PirateGirl.png' }, 
  { name: 'Queen', price: 60, path: '/shop/Premium/Queen.png' }, 
  { name: 'RobotBoy Premium', price: 38, path: '/shop/Premium/RobotBoy.png' }, 
  { name: 'RobotGirl Premium', price: 38, path: '/shop/Premium/RobotGirl.png' }, 
  { name: 'Vampire2', price: 40, path: '/shop/Premium/Vampire2.png' }, 
  { name: 'VampireGirl2', price: 40, path: '/shop/Premium/VampireGirl2.png' } 
];

// ===============================================
// HALLOWEEN THEMED ITEMS - NEW!
// ===============================================
export const HALLOWEEN_BASIC_AVATARS = [
  { name: 'Demi', price: 15, path: '/shop/Themed/Halloween/Basic/Demi.png', theme: 'halloween' },
  { name: 'Jason', price: 18, path: '/shop/Themed/Halloween/Basic/Jason.png', theme: 'halloween' },
  { name: 'PumpkinKing', price: 20, path: '/shop/Themed/Halloween/Basic/PumpkinKing.png', theme: 'halloween' },
  { name: 'Skeleton', price: 15, path: '/shop/Themed/Halloween/Basic/Skeleton.png', theme: 'halloween' },
  { name: 'Witch', price: 18, path: '/shop/Themed/Halloween/Basic/Witch.png', theme: 'halloween' },
  { name: 'Zombie', price: 16, path: '/shop/Themed/Halloween/Basic/Zombie.png', theme: 'halloween' }
];

export const HALLOWEEN_PREMIUM_AVATARS = [
  { name: 'Pumpkin', price: 35, path: '/shop/Themed/Halloween/Premium/Pumpkin.png', theme: 'halloween' },
  { name: 'Skeleton1', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton1.png', theme: 'halloween' },
  { name: 'Skeleton2', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton2.png', theme: 'halloween' },
  { name: 'Skeleton3', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton3.png', theme: 'halloween' },
  { name: 'Witch1', price: 42, path: '/shop/Themed/Halloween/Premium/Witch1.png', theme: 'halloween' },
  { name: 'Witch2', price: 42, path: '/shop/Themed/Halloween/Premium/Witch2.png', theme: 'halloween' },
  { name: 'Witch3', price: 42, path: '/shop/Themed/Halloween/Premium/Witch3.png', theme: 'halloween' },
  { name: 'Witch4', price: 42, path: '/shop/Themed/Halloween/Premium/Witch4.png', theme: 'halloween' },
  { name: 'Zombie1', price: 38, path: '/shop/Themed/Halloween/Premium/Zombie1.png', theme: 'halloween' }
];

export const HALLOWEEN_PETS = [
  { name: 'Spooky Cat', price: 25, path: '/shop/Themed/Halloween/Pets/Pet.png', theme: 'halloween' },
  { name: 'Pumpkin Cat', price: 28, path: '/shop/Themed/Halloween/Pets/Pet2.png', theme: 'halloween' }
];

// ===============================================
// REGULAR PETS
// ===============================================
export const SHOP_BASIC_PETS = [
  { name: 'Alchemist Pet', price: 25, path: '/shop/BasicPets/Alchemist.png' },
  { name: 'Barbarian Pet', price: 30, path: '/shop/BasicPets/Barbarian.png' },
  { name: 'Bard Pet', price: 25, path: '/shop/BasicPets/Bard.png' },
  { name: 'Beastmaster Pet', price: 35, path: '/shop/BasicPets/Beastmaster.png' },
  { name: 'Cleric Pet', price: 25, path: '/shop/BasicPets/Cleric.png' },
  { name: 'Crystal Knight Pet', price: 45, path: '/shop/BasicPets/Crystal Knight.png' },
  { name: 'Crystal Sage Pet', price: 45, path: '/shop/BasicPets/Crystal Sage.png' },
  { name: 'Dragon Pet', price: 50, path: '/shop/BasicPets/DragonPet.png' },
  { name: 'Dream Pet', price: 40, path: '/shop/BasicPets/Dream.png' },
  { name: 'Druid Pet', price: 35, path: '/shop/BasicPets/Druid.png' },
  { name: 'Engineer Pet', price: 30, path: '/shop/BasicPets/Engineer.png' },
  { name: 'Farm Pet 1', price: 20, path: '/shop/BasicPets/FarmPet1.png' },
  { name: 'Farm Pet 2', price: 20, path: '/shop/BasicPets/FarmPet2.png' },
  { name: 'Farm Pet 3', price: 20, path: '/shop/BasicPets/FarmPet3.png' },
  { name: 'Frost Mage Pet', price: 35, path: '/shop/BasicPets/Frost Mage.png' },
  { name: 'Goblin Pet', price: 25, path: '/shop/BasicPets/GoblinPet.png' },
  { name: 'Illusionist Pet', price: 40, path: '/shop/BasicPets/Illusionist.png' },
  { name: 'Knight Pet', price: 30, path: '/shop/BasicPets/Knight.png' },
  { name: 'Lightning Pet', price: 50, path: '/shop/BasicPets/Lightning.png' },
  { name: 'Monk Pet', price: 25, path: '/shop/BasicPets/Monk.png' },
  { name: 'Necromancer Pet', price: 40, path: '/shop/BasicPets/Necromancer.png' },
  { name: 'Orc Pet', price: 30, path: '/shop/BasicPets/Orc.png' },
  { name: 'Paladin Pet', price: 35, path: '/shop/BasicPets/Paladin.png' },
  { name: 'Pirate Pet 1', price: 25, path: '/shop/BasicPets/PiratePet1.png' },
  { name: 'Pirate Pet 2', price: 25, path: '/shop/BasicPets/PiratePet2.png' },
  { name: 'Pirate Pet 3', price: 25, path: '/shop/BasicPets/PiratePet3.png' },
  { name: 'Rabbit Pet', price: 20, path: '/shop/BasicPets/RabbitPet.png' },
  { name: 'Robot Boy Pet', price: 30, path: '/shop/BasicPets/RobotBoyPet.png' },
  { name: 'Robot Girl Pet', price: 30, path: '/shop/BasicPets/RobotGirlPet.png' },
  { name: 'Robot Pet 1', price: 30, path: '/shop/BasicPets/RobotPet1.png' },
  { name: 'Robot Pet 2', price: 30, path: '/shop/BasicPets/RobotPet2.png' },
  { name: 'Rogue Pet', price: 25, path: '/shop/BasicPets/Rogue.png' },
  { name: 'Soccer Pet', price: 20, path: '/shop/BasicPets/SoccerPet.png' },
  { name: 'Stealth Pet', price: 35, path: '/shop/BasicPets/Stealth.png' },
  { name: 'Time Knight Pet', price: 50, path: '/shop/BasicPets/Time Knight.png' },
  { name: 'Unicorn Pet', price: 35, path: '/shop/BasicPets/UnicornPet.png' },
  { name: 'Warrior Pet', price: 30, path: '/shop/BasicPets/Warrior.png' },
  { name: 'Wizard Pet', price: 25, path: '/shop/BasicPets/Wizard.png' },
  { name: 'Lizard Hatchling', price: 28, path: '/shop/BasicPets/Update1/LizardPet.png' },
  { name: 'Octopus Buddy', price: 32, path: '/shop/BasicPets/Update1/OctopusPet.png' },
  { name: 'Red Panda Pal', price: 34, path: '/shop/BasicPets/Update1/RedpandaPet.png' },
  { name: 'Shark Buddy', price: 33, path: '/shop/Basic/Update1/SharkPet.png' }
];

export const SHOP_PREMIUM_PETS = [
  { name: 'Lion Pet', price: 60, path: '/shop/PremiumPets/LionPet.png' },
  { name: 'Snake Pet', price: 50, path: '/shop/PremiumPets/SnakePet.png' },
  { name: 'Vampire Pet', price: 50, path: '/shop/PremiumPets/VampirePet.png' }
];

// ===============================================
// AVATAR IMAGE PATHS - UPDATED WITH HALLOWEEN
// ===============================================
export const getAvatarImage = (avatarBase, level) => {
  // First check if it's a shop avatar (including Halloween)
  const shopItem = [
    ...SHOP_BASIC_AVATARS, 
    ...SHOP_PREMIUM_AVATARS, 
    ...HALLOWEEN_BASIC_AVATARS, 
    ...HALLOWEEN_PREMIUM_AVATARS
  ].find(a => a.name.toLowerCase() === avatarBase?.toLowerCase());
  
  if (shopItem) return shopItem.path;
  
  // Default to traditional avatar system with the SAME path structure as classroom-champions.js
  return `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`;
};

// ===============================================
// PET IMAGE PATHS - UPDATED WITH HALLOWEEN
// ===============================================
export const getPetImage = (pet) => {
  if (!pet || !pet.name) return '/shop/BasicPets/Wizard.png'; // Default fallback

  // First check if it's a shop pet (including Halloween)
  const shopItem = [
    ...SHOP_BASIC_PETS,
    ...SHOP_PREMIUM_PETS,
    ...HALLOWEEN_PETS
  ].find(p => p.name.toLowerCase() === pet.name.toLowerCase());

  if (shopItem) return shopItem.path;

  // Fallback to old pet system
  return `/Pets/${pet.name}.png`;
};

// ===============================================
// EGG & BABY PET SYSTEM
// ===============================================

const HOUR_IN_MS = 60 * 60 * 1000;

const randomDurationHours = (minHours, maxHours) => {
  const min = Math.max(1, minHours);
  const max = Math.max(min, maxHours);
  return (min + Math.random() * (max - min)) * HOUR_IN_MS;
};

const BABY_RARITY_WEIGHTS = {
  common: 45,
  uncommon: 30,
  rare: 18,
  epic: 6,
  legendary: 1
};

const pickByRarity = (items = [], weights = BABY_RARITY_WEIGHTS) => {
  if (!items.length) return null;

  const bucket = [];
  items.forEach((item) => {
    const weight = weights[item.rarity] || 1;
    for (let i = 0; i < weight; i += 1) {
      bucket.push(item);
    }
  });

  if (!bucket.length) return items[Math.floor(Math.random() * items.length)];
  return bucket[Math.floor(Math.random() * bucket.length)];
};

export const BABY_PETS = [
  {
    id: 'glimmer-kit',
    name: 'Glimmer Kit',
    rarity: 'common',
    path: '/shop/Egg/Babies/common/glimmer-kit.svg',
    speed: 5
  },
  {
    id: 'sprout-shell',
    name: 'Sprout Shell',
    rarity: 'common',
    path: '/shop/Egg/Babies/common/sprout-shell.svg',
    speed: 5
  },
  {
    id: 'sparkle-otter',
    name: 'Sparkle Otter',
    rarity: 'common',
    path: '/shop/Egg/Babies/common/sparkle-otter.svg',
    speed: 5
  },
  {
    id: 'aurora-foal',
    name: 'Aurora Foal',
    rarity: 'rare',
    path: '/shop/Egg/Babies/rare/aurora-foal.svg',
    speed: 6
  },
  {
    id: 'ember-hatchling',
    name: 'Ember Hatchling',
    rarity: 'rare',
    path: '/shop/Egg/Babies/rare/ember-hatchling.svg',
    speed: 6
  },
  {
    id: 'tide-pixie',
    name: 'Tide Pixie',
    rarity: 'rare',
    path: '/shop/Egg/Babies/rare/tide-pixie.svg',
    speed: 6
  }
];

export const PET_EGG_TYPES = [
  {
    id: 'starlit-egg',
    name: 'Starlit Egg',
    rarity: 'rare',
    description: 'Glitters with cosmic stardust and soft pastel hues.',
    accent: '#7c3aed',
    hatchPool: ['aurora-foal', 'tide-pixie'],
    minHours: 1,
    maxHours: 12
  },
  {
    id: 'lagoon-egg',
    name: 'Lagoon Egg',
    rarity: 'epic',
    description: 'Waves shimmer across the shell like glowing ripples.',
    accent: '#0ea5e9',
    hatchPool: ['glimmer-kit', 'sprout-shell', 'tide-pixie'],
    minHours: 1,
    maxHours: 12
  },
  {
    id: 'ember-egg',
    name: 'Ember Egg',
    rarity: 'legendary',
    description: 'Warm embers pulse beneath a crystalline shell.',
    accent: '#f97316',
    hatchPool: ['ember-hatchling', 'sparkle-otter'],
    minHours: 1,
    maxHours: 12
  }
];

export const EGG_STAGE_ART = {
  unbroken: '/shop/Egg/egg-stage-unbroken.svg',
  cracked: '/shop/Egg/egg-stage-cracked.svg',
  ready: '/shop/Egg/egg-stage-ready.svg',
  hatched: '/shop/Egg/egg-stage-ready.svg'
};

export const EGG_STAGE_MESSAGES = {
  unbroken: 'This egg is quietly humming with magic.',
  cracked: 'Cracks are spreading—keep watching!',
  ready: 'Your egg is ready to hatch!'
};

const EGG_STAGE_SEQUENCE = ['unbroken', 'cracked', 'ready'];

export const getEggTypeById = (eggTypeId) => PET_EGG_TYPES.find((egg) => egg.id === eggTypeId);

export const pickRandomEggType = () => pickByRarity(PET_EGG_TYPES, BABY_RARITY_WEIGHTS);

const chooseBabyForEgg = (eggType) => {
  if (!eggType) return pickByRarity(BABY_PETS);
  const pool = BABY_PETS.filter((baby) => eggType.hatchPool.includes(baby.id));
  return pickByRarity(pool.length ? pool : BABY_PETS);
};

export const createPetEgg = (eggType = pickRandomEggType(), currentTime = Date.now()) => {
  const type = eggType || pickRandomEggType();
  const baby = chooseBabyForEgg(type);
  const unbrokenDurationMs = randomDurationHours(type.minHours, type.maxHours);
  const crackedDurationMs = randomDurationHours(type.minHours, type.maxHours);

  return {
    id: `egg_${currentTime}_${Math.random().toString(36).slice(2)}`,
    eggTypeId: type.id,
    name: type.name,
    rarity: type.rarity,
    description: type.description,
    accent: type.accent,
    stage: 'unbroken',
    stageStartedAt: currentTime,
    stageEndsAt: currentTime + unbrokenDurationMs,
    unbrokenDurationMs,
    crackedDurationMs,
    assignedBabyId: baby?.id || null
  };
};

export const advanceEggStage = (egg, currentTime = Date.now()) => {
  if (!egg) return { egg, changed: false };

  const nextEgg = { ...egg };
  let changed = false;

  if (nextEgg.stage === 'ready' || nextEgg.stage === 'hatched') {
    return { egg: nextEgg, changed: false };
  }

  if (nextEgg.stageEndsAt && currentTime >= nextEgg.stageEndsAt) {
    const currentStageIndex = EGG_STAGE_SEQUENCE.indexOf(nextEgg.stage);
    const nextStage = EGG_STAGE_SEQUENCE[currentStageIndex + 1] || 'ready';

    if (nextStage === 'cracked') {
      nextEgg.stage = 'cracked';
      nextEgg.stageStartedAt = nextEgg.stageEndsAt;
      nextEgg.stageEndsAt = nextEgg.stageStartedAt + (nextEgg.crackedDurationMs || randomDurationHours(1, 12));
      changed = true;
    } else {
      nextEgg.stage = 'ready';
      nextEgg.stageStartedAt = nextEgg.stageEndsAt;
      nextEgg.stageEndsAt = null;
      changed = true;
    }
  }

  return { egg: nextEgg, changed };
};

export const getEggStageStatus = (egg, currentTime = Date.now()) => {
  if (!egg) {
    return {
      stage: 'unknown',
      progress: 0,
      timeRemainingMs: 0,
      stageLabel: 'Unknown Egg'
    };
  }

  const stageLabelMap = {
    unbroken: 'Incubating',
    cracked: 'Cracking',
    ready: 'Ready to Hatch',
    hatched: 'Hatched'
  };

  const stageDuration =
    egg.stage === 'unbroken'
      ? egg.unbrokenDurationMs
      : egg.stage === 'cracked'
        ? egg.crackedDurationMs
        : 0;

  const elapsed = egg.stageStartedAt ? currentTime - egg.stageStartedAt : 0;
  const progress = stageDuration > 0 ? Math.min(1, Math.max(0, elapsed / stageDuration)) : egg.stage === 'ready' ? 1 : 0;
  const timeRemainingMs = egg.stageEndsAt ? Math.max(0, egg.stageEndsAt - currentTime) : 0;

  return {
    stage: egg.stage,
    progress,
    timeRemainingMs,
    stageLabel: stageLabelMap[egg.stage] || 'Incubating'
  };
};

export const resolveEggHatch = (egg, currentTime = Date.now()) => {
  if (!egg || egg.stage !== 'ready') return null;
  const baby = BABY_PETS.find((pet) => pet.id === egg.assignedBabyId) || pickByRarity(BABY_PETS);
  return {
    ...baby,
    id: `pet_${currentTime}_${Math.random().toString(36).slice(2)}`,
    isBaby: true,
    originEggId: egg.id
  };
};

// ===============================================
// PET GENERATION SYSTEM
// ===============================================
const PET_SPECIES = [
  { name: 'Alchemist', type: 'alchemist', rarity: 'common' },
  { name: 'Barbarian', type: 'barbarian', rarity: 'common' },
  { name: 'Bard', type: 'bard', rarity: 'common' },
  { name: 'Beastmaster', type: 'beastmaster', rarity: 'rare' },
  { name: 'Cleric', type: 'cleric', rarity: 'common' },
  { name: 'Crystal Knight', type: 'crystal knight', rarity: 'epic' },
  { name: 'Crystal Sage', type: 'crystal sage', rarity: 'epic' },
  { name: 'Engineer', type: 'engineer', rarity: 'rare' },
  { name: 'Frost Mage', type: 'frost mage', rarity: 'rare' },
  { name: 'Illusionist', type: 'illusionist', rarity: 'rare' },
  { name: 'Knight', type: 'knight', rarity: 'common' },
  { name: 'Lightning', type: 'lightning', rarity: 'epic' },
  { name: 'Monk', type: 'monk', rarity: 'common' },
  { name: 'Necromancer', type: 'necromancer', rarity: 'rare' },
  { name: 'Rogue', type: 'rogue', rarity: 'common' },
  { name: 'Stealth', type: 'stealth', rarity: 'rare' },
  { name: 'Time Knight', type: 'time knight', rarity: 'legendary' },
  { name: 'Warrior', type: 'warrior', rarity: 'common' },
  { name: 'Wizard', type: 'wizard', rarity: 'common' }
];

export const getRandomPet = () => {
  const randomIndex = Math.floor(Math.random() * PET_SPECIES.length);
  const species = PET_SPECIES[randomIndex];
  
  return {
    id: `pet_${Date.now()}`,
    name: species.name,
    type: species.type,
    rarity: species.rarity,
    speed: Math.floor(Math.random() * 5) + 3, // Speed between 3-7
    image: `/Pets/${species.name}.png`
  };
};

// ===============================================
// PET UNLOCKING
// ===============================================
export const shouldReceivePet = (student) => {
  if (!student) return false;
  const totalXP = student.totalPoints || 0;
  const currentPets = student.ownedPets || [];
  
  // First pet at 50 XP
  if (totalXP >= GAME_CONFIG.PET_UNLOCK_XP && currentPets.length === 0) {
    return true;
  }
  
  return false;
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================
export const getGridClasses = (studentCount) => {
  if (studentCount <= 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  if (studentCount <= 6) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  if (studentCount <= 9) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
  if (studentCount <= 12) return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
  return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7';
};

export const playSound = (sound = 'ding') => {
  try {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.volume = 0.3;
    audio.play().catch(e => {
      console.log('Sound play failed:', e);
    });
  } catch(e) {
    console.log('Sound initialization failed:', e);
  }
};

// ===============================================
// STUDENT DATA VALIDATION
// ===============================================
export const validateStudentData = (student) => {
  if (!student) return null;
  
  const validStudent = {
    ...student,
    firstName: student.firstName || 'Student',
    lastName: student.lastName || '',
    totalPoints: student.totalPoints || 0,
    currency: student.currency || 0,
    coinsSpent: student.coinsSpent || 0,
    avatar: student.avatar || '/avatars/Wizard F/Level 1.png',
    avatarBase: student.avatarBase || 'Wizard F',
    avatarLevel: student.avatarLevel || 1,
    ownedAvatars: student.ownedAvatars || [student.avatarBase || 'Wizard F'],
    ownedPets: student.ownedPets || [],
    inventory: student.inventory || [],
    logs: student.logs || [],
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    rewardsPurchased: student.rewardsPurchased || [],
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  return validStudent;
};

// ===============================================
// XP AWARD UTILITIES
// ===============================================
export const awardXPToStudent = (student, amount, category, reason) => {
  const newTotalXP = (student.totalPoints || 0) + amount;
  const oldLevel = calculateAvatarLevel(student.totalPoints || 0);
  const newLevel = calculateAvatarLevel(newTotalXP);
  
  const updatedStudent = {
    ...student,
    totalPoints: newTotalXP,
    avatarLevel: newLevel,
    avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
    categoryTotal: {
      ...student.categoryTotal,
      [category]: (student.categoryTotal?.[category] || 0) + amount
    },
    logs: [
      ...(student.logs || []),
      {
        type: category,
        points: amount,
        timestamp: new Date().toISOString(),
        reason: reason || `Awarded ${category} points`
      }
    ],
    lastUpdated: new Date().toISOString()
  };

  // Check if student should receive a pet
  if (shouldReceivePet(updatedStudent)) {
    const randomPet = getRandomPet();
    updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), randomPet];
  }

  return {
    student: updatedStudent,
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    receivedPet: shouldReceivePet(student) && newTotalXP >= GAME_CONFIG.PET_UNLOCK_XP
  };
};

// ===============================================
// EXPORT ALL UTILITIES
// ===============================================
export default {
  getAvatarImage,
  calculateAvatarLevel,
  calculateCoins,
  shouldReceivePet,
  getGridClasses,
  playSound,
  validateStudentData,
  getRandomPet,
  awardXPToStudent,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  HALLOWEEN_BASIC_AVATARS,
  HALLOWEEN_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_PETS,
  GAME_CONFIG
};