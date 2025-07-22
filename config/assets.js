// config/assets.js - Centralized Asset Management System
// This file contains all asset paths and locations
// To add new assets, simply update the relevant sections below

// ===============================================
// DIRECTORY PATHS
// ===============================================
export const ASSET_PATHS = {
  // Core Directories
  avatars: '/Avatars',
  pets: '/Pets',
  guides: '/Guides',
  loot: '/Loot',
  shop: '/shop',
  
  // Shop Subdirectories
  shopBasic: '/shop/Basic',
  shopBasicPets: '/shop/BasicPets', 
  shopPremium: '/shop/Premium',
  shopPremiumPets: '/shop/PremiumPets',
  shopThemed: '/shop/Themed',
  
  // Loot Subdirectories
  lootCommon: '/Loot/Common',
  lootUncommon: '/Loot/Uncommon',
  lootRare: '/Loot/Rare',
  lootEpic: '/Loot/Epic',
  lootLegendary: '/Loot/Legendary'
};

// ===============================================
// AVATAR MANAGEMENT
// ===============================================

// All available avatar classes (both male and female versions)
export const AVATAR_CLASSES = [
  'Alchemist', 'Archer', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric',
  'Crystal Sage', 'Druid', 'Engineer', 'Ice Mage', 'Illusionist', 'Knight',
  'Monk', 'Necromancer', 'Orc', 'Paladin', 'Rogue', 'Sky Knight',
  'Time Mage', 'Wizard'
];

// Gender suffixes for avatars
export const AVATAR_GENDERS = ['F', 'M']; // Female, Male

// Avatar levels (1-4)
export const AVATAR_LEVELS = [1, 2, 3, 4];

// Function to get avatar image path
export const getAvatarImagePath = (avatarBase, level = 1) => {
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return `${ASSET_PATHS.avatars}/Wizard F/Level 1.png`;
  }
  
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  return `${ASSET_PATHS.avatars}/${avatarBase}/Level ${validLevel}.png`;
};

// Generate all available avatars dynamically
export const getAllAvatars = () => {
  const avatars = [];
  AVATAR_CLASSES.forEach(className => {
    AVATAR_GENDERS.forEach(gender => {
      const avatarBase = `${className} ${gender}`;
      avatars.push({
        id: avatarBase.replace(' ', '_').toLowerCase(),
        name: `${className} (${gender === 'F' ? 'Female' : 'Male'})`,
        base: avatarBase,
        className: className,
        gender: gender,
        levels: AVATAR_LEVELS.map(level => ({
          level,
          imagePath: getAvatarImagePath(avatarBase, level)
        }))
      });
    });
  });
  return avatars;
};

// ===============================================
// PET MANAGEMENT  
// ===============================================

// All available pets with their file names
export const PET_NAMES = [
  'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight',
  'Crystal Sage', 'Dream', 'Druid', 'Engineer', 'Frost Mage', 'Illusionist',
  'Knight', 'Lightning', 'Monk', 'Necromancer', 'Orc', 'Paladin', 'Rogue',
  'Stealth', 'Time Knight', 'Warrior', 'Wizard'
];

// Function to get pet image path
export const getPetImagePath = (petName) => {
  return `${ASSET_PATHS.pets}/${petName}.png`;
};

// Generate all available pets dynamically
export const getAllPets = () => {
  return PET_NAMES.map(petName => ({
    id: petName.toLowerCase().replace(' ', '_'),
    name: `${petName} Companion`,
    imagePath: getPetImagePath(petName),
    type: 'classic'
  }));
};

// ===============================================
// SHOP ASSETS
// ===============================================

// Basic Shop Avatars
export const BASIC_SHOP_AVATARS = [
  { name: 'Banana', fileName: 'Banana.png' },
  { name: 'Goblin', fileName: 'Goblin.png' },
  { name: 'GoblinGirl', fileName: 'GoblinGirl.png' },
  { name: 'Soccer', fileName: 'Soccer.png' },
  { name: 'Vampire', fileName: 'Vampire.png' },
  { name: 'VampireGirl', fileName: 'VampireGirl.png' }
];

// Basic Shop Pets
export const BASIC_SHOP_PETS = [
  { name: 'Goblin Pet', fileName: 'GoblinPet.png' },
  { name: 'Soccer Pet', fileName: 'SoccerPet.png' },
  { name: 'Unicorn Pet', fileName: 'UnicornPet.png' }
];

// Premium Shop Pets (Loot Box Only)
export const PREMIUM_SHOP_PETS = [
  { name: 'Snake Pet', fileName: 'SnakePet.png', rarity: 'rare' },
  { name: 'Vampire Pet', fileName: 'VampirePet.png', rarity: 'epic' }
];

// Premium Avatars (Loot Box Only)
export const PREMIUM_AVATARS = [
  { name: 'Goblin2', fileName: 'Goblin2.png', rarity: 'rare' },
  { name: 'GoblinGirl2', fileName: 'GoblinGirl2.png', rarity: 'rare' },
  { name: 'Vampire2', fileName: 'Vampire2.png', rarity: 'epic' },
  { name: 'VampireGirl2', fileName: 'VampireGirl2.png', rarity: 'epic' }
];

// Themed Avatar Sets
export const THEMED_AVATAR_SETS = {
  pirate: {
    name: 'Pirate',
    baseDir: `${ASSET_PATHS.shopThemed}/Pirate`,
    avatars: {
      female: { levels: [1, 2, 3, 4], prefix: 'F' },
      male: { levels: [1, 2, 3, 4], prefix: 'M' }
    },
    pets: [
      { name: 'Pirate Pet 1', fileName: 'Pet 1.png' },
      { name: 'Pirate Pet 2', fileName: 'Pet 2.png' },
      { name: 'Pirate Pet 3', fileName: 'Pet 3.png' }
    ]
  },
  farm: {
    name: 'Farm',
    baseDir: `${ASSET_PATHS.shopThemed}/Farm`,
    avatars: {
      female: { levels: [1, 2, 3, 4], prefix: 'F' },
      male: { levels: [1, 2, 3, 4], prefix: 'M' }
    },
    pets: [
      { name: 'Farm Pet 1', fileName: 'Pet 1.png' },
      { name: 'Farm Pet 2', fileName: 'Pet 2.png' },
      { name: 'Farm Pet 3', fileName: 'Pet 3.png' }
    ]
  },
  robot: {
    name: 'Robot',
    baseDir: `${ASSET_PATHS.shopThemed}/Robot`,
    avatars: {
      female: { levels: [1, 2, 3, 4], prefix: 'F' },
      male: { levels: [1, 2, 3, 4], prefix: 'M' }
    },
    pets: [
      { name: 'Robot Pet 1', fileName: 'Pet 1.png' },
      { name: 'Robot Pet 2', fileName: 'Pet 2.png' }
    ]
  }
};

// ===============================================
// LOOT ASSETS
// ===============================================

// Loot items by rarity
export const LOOT_ITEMS_BY_RARITY = {
  common: [
    { name: 'Basic Sword', fileName: 'Loot 1.png', type: 'weapon' },
    { name: 'Iron Shield', fileName: 'Loot 2.png', type: 'armor' },
    { name: 'Health Vial', fileName: 'Loot 3.png', type: 'consumable' }
  ],
  uncommon: [
    { name: 'Silver Blade', fileName: 'Loot 1.png', type: 'weapon' },
    { name: 'Mage Robe', fileName: 'Loot 2.png', type: 'armor' }
  ],
  rare: [
    { name: 'Enchanted Bow', fileName: 'Loot 1.png', type: 'weapon' },
    { name: 'Power Crystal', fileName: 'Loot 2.png', type: 'artifact' }
  ],
  epic: [
    { name: 'Dragon Sword', fileName: 'Loot 1.png', type: 'weapon' },
    { name: 'Phoenix Armor', fileName: 'Loot 2.png', type: 'armor' }
  ],
  legendary: [
    { name: 'Excalibur', fileName: 'Loot 1.png', type: 'weapon' },
    { name: 'Crown of Kings', fileName: 'Loot 2.png', type: 'artifact' }
  ]
};

// ===============================================
// QUEST GUIDE ASSETS
// ===============================================

export const QUEST_GUIDES = [
  { id: 'guide1', name: 'Professor Hoot', fileName: 'Guide 1.png' },
  { id: 'guide2', name: 'Mystic Sage', fileName: 'Guide 2.png' },
  { id: 'guide3', name: 'Adventure Captain', fileName: 'Guide 3.png' },
  { id: 'guide4', name: 'Wise Elder', fileName: 'Guide 4.png' },
  { id: 'guide5', name: 'Magic Scholar', fileName: 'Guide 5.png' },
  { id: 'guide6', name: 'Quest Master', fileName: 'Guide 6.png' },
  { id: 'guide7', name: 'Learning Guide', fileName: 'Guide 7.png' }
];

// Function to get guide image path
export const getGuideImagePath = (fileName) => {
  return `${ASSET_PATHS.guides}/${fileName}`;
};

// ===============================================
// HELPER FUNCTIONS
// ===============================================

// Get themed avatar path
export const getThemedAvatarPath = (theme, gender, level) => {
  const themeData = THEMED_AVATAR_SETS[theme];
  if (!themeData) return null;
  
  const genderData = themeData.avatars[gender];
  if (!genderData || !genderData.levels.includes(level)) return null;
  
  return `${themeData.baseDir}/${genderData.prefix} Level ${level}.png`;
};

// Get themed pet path
export const getThemedPetPath = (theme, petFileName) => {
  const themeData = THEMED_AVATAR_SETS[theme];
  if (!themeData) return null;
  
  return `${themeData.baseDir}/${petFileName}`;
};

// Get shop asset path
export const getShopAssetPath = (category, fileName) => {
  const pathMap = {
    basic: ASSET_PATHS.shopBasic,
    basicPets: ASSET_PATHS.shopBasicPets,
    premium: ASSET_PATHS.shopPremium,
    premiumPets: ASSET_PATHS.shopPremiumPets
  };
  
  return `${pathMap[category]}/${fileName}`;
};

// Get loot item path
export const getLootItemPath = (rarity, fileName) => {
  const rarityDirs = {
    common: ASSET_PATHS.lootCommon,
    uncommon: ASSET_PATHS.lootUncommon,
    rare: ASSET_PATHS.lootRare,
    epic: ASSET_PATHS.lootEpic,
    legendary: ASSET_PATHS.lootLegendary
  };
  
  return `${rarityDirs[rarity]}/${fileName}`;
};

// ===============================================
// RANDOM PET NAMES
// ===============================================

export const RANDOM_PET_NAMES = [
  'Spark', 'Luna', 'Blaze', 'Storm', 'Nova', 'Echo', 'Frost', 'Ember',
  'Shadow', 'Sunny', 'Thunder', 'Misty', 'Flash', 'Comet', 'Star', 'Breeze',
  'Flame', 'River', 'Sky', 'Dawn', 'Dusk', 'Rain', 'Snow', 'Wind', 'Spirit',
  'Magic', 'Crystal', 'Dream', 'Wonder', 'Phoenix', 'Dragon', 'Tiger', 'Wolf'
];

// Function to get random pet name
export const getRandomPetName = () => {
  return RANDOM_PET_NAMES[Math.floor(Math.random() * RANDOM_PET_NAMES.length)];
};

// ===============================================
// SOUND DEFINITIONS
// ===============================================

export const SOUND_TYPES = {
  xpAward: 'xp_award',
  levelUp: 'level_up',
  petUnlock: 'pet_unlock',
  questComplete: 'quest_complete',
  purchase: 'purchase',
  raceStart: 'race_start',
  raceWin: 'race_win'
};

// Sound configuration for programmatically generated sounds
export const SOUND_CONFIG = {
  [SOUND_TYPES.xpAward]: {
    type: 'sequence',
    notes: [
      { frequency: 523.25, duration: 0.1 }, // C5
      { frequency: 659.25, duration: 0.1 }, // E5  
      { frequency: 783.99, duration: 0.2 }  // G5
    ],
    volume: 0.3
  },
  [SOUND_TYPES.levelUp]: {
    type: 'sequence',
    notes: [
      { frequency: 523.25, duration: 0.15 }, // C5
      { frequency: 659.25, duration: 0.15 }, // E5
      { frequency: 783.99, duration: 0.15 }, // G5
      { frequency: 1046.50, duration: 0.25 } // C6
    ],
    volume: 0.4
  },
  [SOUND_TYPES.questComplete]: {
    type: 'sequence', 
    notes: [
      { frequency: 440.00, duration: 0.1 }, // A4
      { frequency: 554.37, duration: 0.1 }, // C#5
      { frequency: 659.25, duration: 0.2 }  // E5
    ],
    volume: 0.3
  }
};

export default {
  ASSET_PATHS,
  AVATAR_CLASSES,
  AVATAR_GENDERS,
  AVATAR_LEVELS,
  getAvatarImagePath,
  getAllAvatars,
  PET_NAMES,
  getPetImagePath,
  getAllPets,
  BASIC_SHOP_AVATARS,
  BASIC_SHOP_PETS,
  PREMIUM_SHOP_PETS,
  PREMIUM_AVATARS,
  THEMED_AVATAR_SETS,
  LOOT_ITEMS_BY_RARITY,
  QUEST_GUIDES,
  getGuideImagePath,
  getThemedAvatarPath,
  getThemedPetPath,
  getShopAssetPath,
  getLootItemPath,
  RANDOM_PET_NAMES,
  getRandomPetName,
  SOUND_TYPES,
  SOUND_CONFIG
};