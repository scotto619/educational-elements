// config/gameData.js - Centralized Game Data Configuration
// This file contains all game items, pets, shop data, and gameplay mechanics
// To add new items, simply update the relevant sections below

import { 
  getAllPets, 
  getAllAvatars, 
  getShopAssetPath, 
  getLootItemPath, 
  getThemedAvatarPath,
  getThemedPetPath,
  THEMED_AVATAR_SETS,
  BASIC_SHOP_AVATARS,
  BASIC_SHOP_PETS,
  PREMIUM_SHOP_PETS,
  PREMIUM_AVATARS,
  LOOT_ITEMS_BY_RARITY,
  QUEST_GUIDES,
  getGuideImagePath
} from './assets.js';

// ===============================================
// GAME CONSTANTS
// ===============================================

export const GAME_CONFIG = {
  MAX_LEVEL: 4,
  COINS_PER_XP: 5,
  PET_UNLOCK_XP: 50,
  LEVEL_THRESHOLDS: [0, 100, 200, 300], // XP required for each level
  RACE_DISTANCE: 0.8, // 80% of track width
  
  // XP Categories
  XP_CATEGORIES: ['Respectful', 'Responsible', 'Learner'],
  
  // Default XP Awards
  DEFAULT_XP_AWARDS: {
    'Respectful': 1,
    'Responsible': 1,
    'Learner': 1
  }
};

// ===============================================
// RARITY SYSTEM
// ===============================================

export const RARITY_CONFIG = {
  common: {
    name: 'Common',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    glowColor: 'shadow-gray-200',
    dropChance: 50
  },
  uncommon: {
    name: 'Uncommon',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    glowColor: 'shadow-green-200',
    dropChance: 30
  },
  rare: {
    name: 'Rare',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    glowColor: 'shadow-blue-200',
    dropChance: 15
  },
  epic: {
    name: 'Epic',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    glowColor: 'shadow-purple-200',
    dropChance: 4
  },
  legendary: {
    name: 'Legendary',
    borderColor: 'border-yellow-400',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    glowColor: 'shadow-yellow-200',
    dropChance: 1
  }
};

// ===============================================
// PET SYSTEM
// ===============================================

// Generate pets with stats from asset data
export const GAME_PETS = getAllPets().map((pet, index) => {
  // Assign varied stats based on pet type
  const baseSpeed = 0.8 + (Math.random() * 0.8); // Random speed 0.8-1.6
  const speedVariations = {
    'lightning': 1.6, 'stealth': 1.5, 'dream': 1.5, 'beastmaster': 1.4, 'rogue': 1.4,
    'barbarian': 1.3, 'illusionist': 1.3, 'orc': 1.3, 'crystal_knight': 1.2, 
    'knight': 1.2, 'warrior': 1.2, 'time_knight': 1.1, 'monk': 1.1, 'crystal_sage': 1.1,
    'engineer': 1.1, 'bard': 1.1, 'alchemist': 1.0, 'druid': 1.0, 'paladin': 1.0,
    'wizard': 1.0, 'cleric': 0.9, 'necromancer': 0.9, 'frost_mage': 0.8
  };
  
  return {
    ...pet,
    speed: speedVariations[pet.id] || baseSpeed,
    wins: 0,
    level: 1,
    rarity: 'common',
    price: 15 + (index % 5) * 3, // Varied pricing 15-27 coins
    category: 'pets'
  };
});

// Basic shop pets with enhanced data
export const BASIC_PETS = BASIC_SHOP_PETS.map((pet, index) => ({
  id: `basic_pet_${pet.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: pet.name,
  imagePath: getShopAssetPath('basicPets', pet.fileName),
  price: 20 + (index * 5),
  type: 'basic',
  category: 'pets',
  rarity: 'common',
  speed: 1.0 + (index * 0.1),
  wins: 0,
  level: 1,
  description: `A loyal ${pet.name.toLowerCase()} companion`
}));

// Premium pets (loot box only)
export const PREMIUM_PETS = PREMIUM_SHOP_PETS.map(pet => ({
  id: `premium_pet_${pet.name.toLowerCase().replace(/\s+/g, '_')}`,
  name: pet.name,
  imagePath: getShopAssetPath('premiumPets', pet.fileName),
  type: 'premium',
  category: 'pets',
  rarity: pet.rarity,
  speed: pet.rarity === 'epic' ? 1.5 : 1.3,
  wins: 0,
  level: 1,
  description: `A powerful ${pet.name.toLowerCase()}`
}));

// Themed pets from asset data
export const THEMED_PETS = Object.entries(THEMED_AVATAR_SETS).flatMap(([theme, data]) =>
  data.pets.map((pet, index) => ({
    id: `${theme}_pet_${index + 1}`,
    name: pet.name,
    imagePath: getThemedPetPath(theme, pet.fileName),
    price: 25 + (index * 5),
    type: theme,
    category: 'pets',
    rarity: 'uncommon',
    speed: 1.1 + (index * 0.1),
    wins: 0,
    level: 1,
    description: `A ${theme} themed companion`
  }))
);

// ===============================================
// AVATAR SYSTEM
// ===============================================

// Basic shop avatars with pricing
export const BASIC_AVATARS = BASIC_SHOP_AVATARS.map((avatar, index) => ({
  id: `basic_avatar_${avatar.name.toLowerCase()}`,
  name: avatar.name,
  imagePath: getShopAssetPath('basic', avatar.fileName),
  price: 15 + (index * 2),
  base: avatar.name,
  category: 'avatars',
  rarity: 'common',
  description: `A unique ${avatar.name} character`
}));

// Premium avatars (loot box only)
export const PREMIUM_BASIC_AVATARS = PREMIUM_AVATARS.map(avatar => ({
  id: `premium_avatar_${avatar.name.toLowerCase()}`,
  name: avatar.name,
  imagePath: getShopAssetPath('premium', avatar.fileName),
  base: avatar.name,
  category: 'avatars',
  rarity: avatar.rarity,
  description: `An elite ${avatar.name} variant`
}));

// Themed avatars from asset data
export const THEMED_AVATARS = Object.entries(THEMED_AVATAR_SETS).flatMap(([theme, data]) =>
  ['female', 'male'].flatMap(gender =>
    data.avatars[gender].levels.map(level => ({
      id: `${theme}_${gender}_${level}`,
      name: `${data.name} ${gender === 'female' ? 'F' : 'M'} Level ${level}`,
      imagePath: getThemedAvatarPath(theme, gender, level),
      level: level,
      price: level === 1 ? 20 : 30 + ((level - 2) * 15),
      base: `${data.name} ${gender === 'female' ? 'F' : 'M'}`,
      category: 'avatars',
      rarity: level <= 2 ? 'common' : level === 3 ? 'rare' : 'epic',
      description: `Level ${level} ${theme} ${gender}`
    }))
  )
);

// ===============================================
// SHOP ITEMS
// ===============================================

// Consumable items
export const CONSUMABLES = [
  {
    id: 'xp_boost',
    name: 'XP Boost Potion',
    price: 10,
    category: 'consumables',
    effect: '+5 XP',
    rarity: 'common',
    description: 'Instantly gain 5 XP points'
  },
  {
    id: 'luck_charm',
    name: 'Lucky Charm',
    price: 15,
    category: 'consumables',
    effect: '+3 Bonus Coins',
    rarity: 'common',
    description: 'Gain 3 bonus coins'
  },
  {
    id: 'speed_boost',
    name: 'Pet Speed Boost',
    price: 20,
    category: 'consumables',
    effect: 'Pet +0.5 Speed',
    rarity: 'uncommon',
    description: 'Permanently increase pet speed by 0.5'
  },
  {
    id: 'mega_xp',
    name: 'Mega XP Potion',
    price: 25,
    category: 'consumables',
    effect: '+10 XP',
    rarity: 'uncommon',
    description: 'Instantly gain 10 XP points'
  }
];

// Loot box items from asset data
export const LOOT_ITEMS = Object.entries(LOOT_ITEMS_BY_RARITY).flatMap(([rarity, items]) =>
  items.map((item, index) => ({
    id: `loot_${rarity}_${index + 1}`,
    name: item.name,
    imagePath: getLootItemPath(rarity, item.fileName),
    type: item.type,
    category: 'loot',
    rarity: rarity,
    description: `A ${rarity} ${item.type}`
  }))
);

// Loot boxes
export const LOOT_BOXES = [
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    price: 25,
    category: 'lootboxes',
    rarity: 'common',
    description: 'Contains 3 random items',
    itemCount: 3,
    rarityWeights: { common: 70, uncommon: 25, rare: 5 }
  },
  {
    id: 'rare_box',
    name: 'Rare Treasure Chest',
    price: 50,
    category: 'lootboxes',
    rarity: 'rare',
    description: 'Contains 5 random items with better odds',
    itemCount: 5,
    rarityWeights: { common: 40, uncommon: 35, rare: 20, epic: 5 }
  },
  {
    id: 'legendary_box',
    name: 'Legendary Vault',
    price: 100,
    category: 'lootboxes',
    rarity: 'legendary',
    description: 'Contains 7 random items with premium chances',
    itemCount: 7,
    rarityWeights: { uncommon: 30, rare: 40, epic: 25, legendary: 5 }
  }
];

// ===============================================
// QUEST SYSTEM
// ===============================================

// Quest givers from asset data
export const QUEST_GIVERS = QUEST_GUIDES.map(guide => {
  const personalities = {
    'guide1': { personality: 'wise', specialty: 'academic', role: 'Learning Quest Giver' },
    'guide2': { personality: 'mystical', specialty: 'magic', role: 'Magic Quest Giver' },
    'guide3': { personality: 'adventurous', specialty: 'exploration', role: 'Adventure Guide' },
    'guide4': { personality: 'kind', specialty: 'behavior', role: 'Behavior Coach' },
    'guide5': { personality: 'scholarly', specialty: 'research', role: 'Research Assistant' },
    'guide6': { personality: 'energetic', specialty: 'activities', role: 'Activity Director' },
    'guide7': { personality: 'helpful', specialty: 'learning', role: 'Study Buddy' }
  };

  const config = personalities[guide.id] || personalities['guide1'];

  return {
    ...guide,
    imagePath: getGuideImagePath(guide.fileName),
    ...config,
    greetings: [
      `Welcome, young learner! 🌟`,
      `Ready for your next adventure?`,
      `Let's achieve greatness together!`
    ],
    questTypes: ['learning', 'behavior', 'activity'],
    tips: [
      `💡 Tip: Consistency is the key to success!`,
      `📚 Remember: Every expert was once a beginner!`,
      `🎯 Focus on progress, not perfection!`
    ]
  };
});

// Default quest templates
export const DEFAULT_QUEST_TEMPLATES = [
  {
    id: 'daily_reading',
    title: 'Daily Reading Challenge',
    description: 'Read for 20 minutes',
    type: 'daily',
    xpReward: 5,
    coinReward: 2,
    category: 'Learner',
    questGiverId: 'guide1'
  },
  {
    id: 'homework_complete',
    title: 'Homework Hero',
    description: 'Complete all homework assignments',
    type: 'weekly',
    xpReward: 10,
    coinReward: 5,
    category: 'Responsible',
    questGiverId: 'guide4'
  },
  {
    id: 'help_classmate',
    title: 'Helpful Friend',
    description: 'Help a classmate with their work',
    type: 'daily',
    xpReward: 3,
    coinReward: 2,
    category: 'Respectful',
    questGiverId: 'guide7'
  },
  {
    id: 'clean_workspace',
    title: 'Organized Scholar',
    description: 'Keep your workspace clean and organized',
    type: 'daily',
    xpReward: 2,
    coinReward: 1,
    category: 'Responsible',
    questGiverId: 'guide6'
  }
];

// ===============================================
// ACHIEVEMENTS SYSTEM
// ===============================================

export const ACHIEVEMENTS = [
  {
    id: 'first_level',
    name: 'Level Up!',
    description: 'Reach Level 2',
    icon: '⭐',
    requirement: { type: 'level', value: 2 },
    reward: { coins: 10 }
  },
  {
    id: 'pet_owner',
    name: 'Pet Parent',
    description: 'Unlock your first pet',
    icon: '🐾',
    requirement: { type: 'pet_unlock', value: 1 },
    reward: { coins: 15 }
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 10 quests',
    icon: '📜',
    requirement: { type: 'quests_completed', value: 10 },
    reward: { coins: 25 }
  },
  {
    id: 'respectful_student',
    name: 'Respectful Student',
    description: 'Earn 50 Respectful XP',
    icon: '🤝',
    requirement: { type: 'category_xp', category: 'Respectful', value: 50 },
    reward: { coins: 20 }
  },
  {
    id: 'responsible_learner',
    name: 'Responsible Learner',
    description: 'Earn 50 Responsible XP',
    icon: '✅',
    requirement: { type: 'category_xp', category: 'Responsible', value: 50 },
    reward: { coins: 20 }
  },
  {
    id: 'dedicated_learner',
    name: 'Dedicated Learner',
    description: 'Earn 50 Learner XP',
    icon: '📚',
    requirement: { type: 'category_xp', category: 'Learner', value: 50 },
    reward: { coins: 20 }
  }
];

// ===============================================
// COMBINED SHOP DATA
// ===============================================

export const ALL_SHOP_ITEMS = {
  avatars: [
    ...getAllAvatars().slice(0, 8).map((avatar, index) => ({
      id: avatar.id,
      name: avatar.name,
      price: 25 + (index * 5),
      category: 'avatars',
      imagePath: avatar.levels[0].imagePath,
      rarity: 'common',
      base: avatar.base
    })),
    ...BASIC_AVATARS,
    ...THEMED_AVATARS.filter(avatar => avatar.level === 1)
  ],
  pets: [
    ...GAME_PETS.slice(0, 5),
    ...BASIC_PETS,
    ...THEMED_PETS
  ],
  consumables: CONSUMABLES,
  lootboxes: LOOT_BOXES
};

// Items available in loot boxes
export const LOOT_BOX_POOL = [
  ...LOOT_ITEMS,
  ...PREMIUM_PETS,
  ...PREMIUM_BASIC_AVATARS,
  ...THEMED_AVATARS.filter(avatar => avatar.level > 1),
  ...CONSUMABLES.filter(item => item.rarity !== 'common')
];

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

// Generate loot box rewards
export const generateLootBoxRewards = (lootBox) => {
  const rewards = [];
  const { itemCount, rarityWeights } = lootBox;
  
  for (let i = 0; i < itemCount; i++) {
    // Determine rarity based on weights
    const rand = Math.random() * 100;
    let cumulative = 0;
    let selectedRarity = 'common';
    
    for (const [rarity, weight] of Object.entries(rarityWeights)) {
      cumulative += weight;
      if (rand <= cumulative) {
        selectedRarity = rarity;
        break;
      }
    }
    
    // Get items of selected rarity
    const availableItems = LOOT_BOX_POOL.filter(item => item.rarity === selectedRarity);
    if (availableItems.length > 0) {
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
      rewards.push(randomItem);
    }
  }
  
  return rewards;
};

// Calculate level from XP
export const calculateLevel = (xp) => {
  for (let i = GAME_CONFIG.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= GAME_CONFIG.LEVEL_THRESHOLDS[i]) {
      return Math.min(i + 1, GAME_CONFIG.MAX_LEVEL);
    }
  }
  return 1;
};

// Calculate XP needed for next level
export const getXPForNextLevel = (currentXP) => {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= GAME_CONFIG.MAX_LEVEL) return 0;
  return GAME_CONFIG.LEVEL_THRESHOLDS[currentLevel] - currentXP;
};

// Calculate coins from XP
export const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  const spent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - spent);
};

export default {
  GAME_CONFIG,
  RARITY_CONFIG,
  GAME_PETS,
  BASIC_PETS,
  PREMIUM_PETS,
  THEMED_PETS,
  BASIC_AVATARS,
  PREMIUM_BASIC_AVATARS,
  THEMED_AVATARS,
  CONSUMABLES,
  LOOT_ITEMS,
  LOOT_BOXES,
  QUEST_GIVERS,
  DEFAULT_QUEST_TEMPLATES,
  ACHIEVEMENTS,
  ALL_SHOP_ITEMS,
  LOOT_BOX_POOL,
  generateLootBoxRewards,
  calculateLevel,
  getXPForNextLevel,
  calculateCoins
};