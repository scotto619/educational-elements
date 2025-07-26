// constants/gameData.js - Game Constants and Configuration
export const GAME_CONFIG = {
  // XP and Level Configuration
  XP_PER_LEVEL: 100,
  MAX_LEVEL: 4,
  COINS_PER_XP: 10, // 1 coin per 10 XP
  
  // Pet unlock requirements
  FIRST_PET_XP: 50,
  
  // Behavior point categories
  BEHAVIOR_CATEGORIES: ['respectful', 'responsible', 'safe', 'learner', 'helper', 'creative'],
  
  // Quest difficulties and rewards
  QUEST_DIFFICULTIES: {
    easy: { xpMultiplier: 1, coinMultiplier: 1 },
    medium: { xpMultiplier: 1.5, coinMultiplier: 1.5 },
    hard: { xpMultiplier: 2, coinMultiplier: 2 }
  },
  
  // Sound settings
  DEFAULT_VOLUME: 0.3,
  
  // UI settings
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300
};

// ===============================================
// AVAILABLE AVATARS
// ===============================================

export const AVAILABLE_AVATARS = [
  'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M',
  'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M',
  'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M',
  'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M',
  'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M',
  'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M',
  'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M'
];

export const BASIC_AVATARS = [
  {
    id: 'wizard_f',
    name: 'Wizard F',
    avatarBase: 'Wizard F',
    rarity: 'common',
    price: 0,
    description: 'A wise and powerful wizard',
    category: 'starter'
  },
  {
    id: 'wizard_m',
    name: 'Wizard M',
    avatarBase: 'Wizard M',
    rarity: 'common',
    price: 0,
    description: 'A wise and powerful wizard',
    category: 'starter'
  },
  {
    id: 'alchemist_f',
    name: 'Alchemist F',
    avatarBase: 'Alchemist F',
    rarity: 'common',
    price: 20,
    description: 'Master of potions and magical brews',
    category: 'basic'
  },
  {
    id: 'alchemist_m',
    name: 'Alchemist M',
    avatarBase: 'Alchemist M',
    rarity: 'common',
    price: 20,
    description: 'Master of potions and magical brews',
    category: 'basic'
  },
  {
    id: 'archer_f',
    name: 'Archer F',
    avatarBase: 'Archer F',
    rarity: 'common',
    price: 25,
    description: 'Swift and accurate with bow and arrow',
    category: 'basic'
  },
  {
    id: 'archer_m',
    name: 'Archer M',
    avatarBase: 'Archer M',
    rarity: 'common',
    price: 25,
    description: 'Swift and accurate with bow and arrow',
    category: 'basic'
  }
];

export const PREMIUM_BASIC_AVATARS = [
  {
    id: 'knight_f',
    name: 'Knight F',
    avatarBase: 'Knight F',
    rarity: 'rare',
    price: 50,
    description: 'Noble warrior with shining armor',
    category: 'premium'
  },
  {
    id: 'knight_m',
    name: 'Knight M',
    avatarBase: 'Knight M',
    rarity: 'rare',
    price: 50,
    description: 'Noble warrior with shining armor',
    category: 'premium'
  },
  {
    id: 'crystal_sage_f',
    name: 'Crystal Sage F',
    avatarBase: 'Crystal Sage F',
    rarity: 'epic',
    price: 100,
    description: 'Wielder of crystal magic and ancient wisdom',
    category: 'premium'
  },
  {
    id: 'crystal_sage_m',
    name: 'Crystal Sage M',
    avatarBase: 'Crystal Sage M',
    rarity: 'epic',
    price: 100,
    description: 'Wielder of crystal magic and ancient wisdom',
    category: 'premium'
  }
];

export const THEMED_AVATARS = [
  {
    id: 'sky_knight_f',
    name: 'Sky Knight F',
    avatarBase: 'Sky Knight F',
    rarity: 'legendary',
    price: 200,
    description: 'Legendary warrior of the skies',
    category: 'legendary',
    theme: 'celestial'
  },
  {
    id: 'time_mage_f',
    name: 'Time Mage F',
    avatarBase: 'Time Mage F',
    rarity: 'legendary',
    price: 200,
    description: 'Master of time and temporal magic',
    category: 'legendary',
    theme: 'temporal'
  }
];

// ===============================================
// AVAILABLE PETS
// ===============================================

export const BASIC_PETS = [
  {
    id: 'alchemist_pet',
    name: 'Alchemist Companion',
    type: 'Alchemist',
    image: '/Pets/Alchemist.png',
    rarity: 'common',
    price: 30,
    description: 'A helpful companion for brewing potions'
  },
  {
    id: 'barbarian_pet',
    name: 'Barbarian Companion',
    type: 'Barbarian',
    image: '/Pets/Barbarian.png',
    rarity: 'common',
    price: 30,
    description: 'A fierce and loyal battle companion'
  },
  {
    id: 'bard_pet',
    name: 'Bard Companion',
    type: 'Bard',
    image: '/Pets/Bard.png',
    rarity: 'common',
    price: 30,
    description: 'A musical companion that loves to sing'
  },
  {
    id: 'cleric_pet',
    name: 'Cleric Companion',
    type: 'Cleric',
    image: '/Pets/Cleric.png',
    rarity: 'common',
    price: 30,
    description: 'A holy companion that brings healing'
  }
];

export const PREMIUM_PETS = [
  {
    id: 'crystal_knight_pet',
    name: 'Crystal Guardian',
    type: 'Crystal Knight',
    image: '/Pets/Crystal Knight.png',
    rarity: 'epic',
    price: 80,
    description: 'A crystalline guardian of immense power'
  },
  {
    id: 'frost_mage_pet',
    name: 'Frost Sprite',
    type: 'Frost Mage',
    image: '/Pets/Frost Mage.png',
    rarity: 'epic',
    price: 80,
    description: 'A magical sprite that controls ice and snow'
  },
  {
    id: 'lightning_pet',
    name: 'Storm Elemental',
    type: 'Lightning',
    image: '/Pets/Lightning.png',
    rarity: 'legendary',
    price: 150,
    description: 'An elemental being of pure lightning energy'
  }
];

export const EXISTING_PETS = [
  'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight',
  'Crystal Sage', 'Dream', 'Druid', 'Engineer', 'Frost Mage', 'Illusionist',
  'Knight', 'Lightning', 'Monk', 'Necromancer', 'Orc', 'Paladin', 'Rogue',
  'Stealth', 'Time Knight', 'Warrior'
];

// ===============================================
// XP CATEGORIES
// ===============================================

export const DEFAULT_XP_CATEGORIES = [
  {
    name: 'Respectful',
    icon: '🤝',
    color: 'blue',
    description: 'Being kind and respectful to others'
  },
  {
    name: 'Responsible',
    icon: '✅',
    color: 'green',
    description: 'Taking responsibility for actions and tasks'
  },
  {
    name: 'Safe',
    icon: '🛡️',
    color: 'yellow',
    description: 'Following safety rules and being careful'
  },
  {
    name: 'Learner',
    icon: '📚',
    color: 'purple',
    description: 'Showing curiosity and love for learning'
  },
  {
    name: 'Helper',
    icon: '🤗',
    color: 'pink',
    description: 'Helping classmates and teachers'
  },
  {
    name: 'Creative',
    icon: '🎨',
    color: 'indigo',
    description: 'Showing creativity and imagination'
  },
  {
    name: 'Bonus',
    icon: '⭐',
    color: 'orange',
    description: 'Extra recognition for special achievements'
  }
];

// ===============================================
// TEACHER REWARDS
// ===============================================

export const DEFAULT_TEACHER_REWARDS = [
  {
    id: 'tech_time',
    name: 'Technology Time',
    description: '10 minutes of educational technology time',
    price: 25,
    category: 'privileges',
    icon: '💻'
  },
  {
    id: 'class_game',
    name: 'Class Game',
    description: 'Choose a fun class game to play',
    price: 40,
    category: 'activities',
    icon: '🎮'
  },
  {
    id: 'homework_pass',
    name: 'Homework Pass',
    description: 'Skip one homework assignment',
    price: 60,
    category: 'privileges',
    icon: '📝'
  },
  {
    id: 'line_leader',
    name: 'Line Leader',
    description: 'Be the line leader for a day',
    price: 15,
    category: 'privileges',
    icon: '👑'
  },
  {
    id: 'extra_recess',
    name: 'Extra Recess',
    description: '5 extra minutes of recess time',
    price: 35,
    category: 'privileges',
    icon: '⏰'
  }
];

// ===============================================
// SHOP CONFIGURATION
// ===============================================

export const SHOP_ITEMS = {
  avatars: [...BASIC_AVATARS, ...PREMIUM_BASIC_AVATARS, ...THEMED_AVATARS],
  pets: [...BASIC_PETS, ...PREMIUM_PETS],
  rewards: DEFAULT_TEACHER_REWARDS
};

export const LOOT_BOXES = [
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    price: 50,
    description: 'Contains random avatars and pets',
    contents: {
      common: 0.7,
      rare: 0.25,
      epic: 0.05,
      legendary: 0.01
    }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    price: 100,
    description: 'Higher chance of rare items',
    contents: {
      common: 0.4,
      rare: 0.4,
      epic: 0.15,
      legendary: 0.05
    }
  }
];

// ===============================================
// RARITY CONFIGURATION
// ===============================================

export const RARITY_STYLES = {
  common: {
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    glow: 'shadow-gray-200'
  },
  rare: {
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    glow: 'shadow-blue-200'
  },
  epic: {
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    glow: 'shadow-purple-200'
  },
  legendary: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
    glow: 'shadow-yellow-200'
  }
};

// ===============================================
// SOUND FILES
// ===============================================

export const SOUND_FILES = {
  xpGain: '/sounds/xp-gain.mp3',
  levelUp: '/sounds/level-up.mp3',
  petUnlock: '/sounds/pet-unlock.mp3',
  coin: '/sounds/coin.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  click: '/sounds/click.mp3',
  purchase: '/sounds/purchase.mp3'
};

// ===============================================
// UI THEMES
// ===============================================

export const UI_THEMES = {
  default: {
    primary: 'blue',
    secondary: 'purple',
    accent: 'yellow',
    success: 'green',
    warning: 'orange',
    error: 'red'
  },
  fantasy: {
    primary: 'purple',
    secondary: 'indigo',
    accent: 'pink',
    success: 'emerald',
    warning: 'amber',
    error: 'rose'
  },
  nature: {
    primary: 'green',
    secondary: 'teal',
    accent: 'lime',
    success: 'emerald',
    warning: 'yellow',
    error: 'red'
  }
};

// ===============================================
// QUEST TEMPLATES
// ===============================================

export const QUEST_TEMPLATES = [
  {
    id: 'homework_hero',
    title: 'Homework Hero',
    description: 'Complete all homework assignments this week',
    reward: { type: 'xp', amount: 25 },
    category: 'academic',
    difficulty: 'medium'
  },
  {
    id: 'helpful_friend',
    title: 'Helpful Friend',
    description: 'Help a classmate with their work',
    reward: { type: 'coins', amount: 15 },
    category: 'social',
    difficulty: 'easy'
  },
  {
    id: 'reading_champion',
    title: 'Reading Champion',
    description: 'Read for 30 minutes every day this week',
    reward: { type: 'xp', amount: 30 },
    category: 'academic',
    difficulty: 'medium'
  },
  {
    id: 'clean_desk',
    title: 'Organized Student',
    description: 'Keep your desk clean and organized for a week',
    reward: { type: 'coins', amount: 10 },
    category: 'responsibility',
    difficulty: 'easy'
  },
  {
    id: 'participation_star',
    title: 'Participation Star',
    description: 'Participate actively in class discussions',
    reward: { type: 'xp', amount: 20 },
    category: 'engagement',
    difficulty: 'medium'
  },
  {
    id: 'kindness_quest',
    title: 'Acts of Kindness',
    description: 'Perform 5 acts of kindness this week',
    reward: { type: 'xp', amount: 35 },
    category: 'social',
    difficulty: 'hard'
  }
];

// ===============================================
// ACHIEVEMENT SYSTEM
// ===============================================

export const ACHIEVEMENTS = [
  {
    id: 'first_level',
    name: 'Level Up!',
    description: 'Reach level 2',
    icon: '⬆️',
    requirement: { type: 'level', value: 2 },
    reward: { type: 'coins', amount: 20 }
  },
  {
    id: 'max_level',
    name: 'Champion',
    description: 'Reach the maximum level',
    icon: '👑',
    requirement: { type: 'level', value: 4 },
    reward: { type: 'coins', amount: 100 }
  },
  {
    id: 'first_pet',
    name: 'Pet Owner',
    description: 'Unlock your first pet',
    icon: '🐾',
    requirement: { type: 'pets', value: 1 },
    reward: { type: 'coins', amount: 25 }
  },
  {
    id: 'avatar_collector',
    name: 'Avatar Collector',
    description: 'Own 5 different avatars',
    icon: '🎭',
    requirement: { type: 'avatars', value: 5 },
    reward: { type: 'coins', amount: 50 }
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 10 quests',
    icon: '⚔️',
    requirement: { type: 'quests', value: 10 },
    reward: { type: 'xp', amount: 50 }
  }
];

// ===============================================
// BEHAVIOR TRACKING
// ===============================================

export const BEHAVIOR_CATEGORIES = {
  respectful: {
    name: 'Respectful',
    icon: '🤝',
    color: 'blue',
    description: 'Shows respect for others and their property'
  },
  responsible: {
    name: 'Responsible',
    icon: '✅',
    color: 'green',
    description: 'Takes responsibility for actions and tasks'
  },
  safe: {
    name: 'Safe',
    icon: '🛡️',
    color: 'yellow',
    description: 'Follows safety rules and makes good choices'
  },
  learner: {
    name: 'Learner',
    icon: '📚',
    color: 'purple',
    description: 'Shows enthusiasm for learning and growth'
  },
  helper: {
    name: 'Helper',
    icon: '🤗',
    color: 'pink',
    description: 'Helps others and contributes to the classroom'
  },
  creative: {
    name: 'Creative',
    icon: '🎨',
    color: 'indigo',
    description: 'Shows creativity and original thinking'
  }
};

// ===============================================
// EXPORT ALL CONSTANTS
// ===============================================

export default {
  GAME_CONFIG,
  AVAILABLE_AVATARS,
  BASIC_AVATARS,
  PREMIUM_BASIC_AVATARS,
  THEMED_AVATARS,
  BASIC_PETS,
  PREMIUM_PETS,
  EXISTING_PETS,
  DEFAULT_XP_CATEGORIES,
  DEFAULT_TEACHER_REWARDS,
  SHOP_ITEMS,
  LOOT_BOXES,
  RARITY_STYLES,
  SOUND_FILES,
  UI_THEMES,
  QUEST_TEMPLATES,
  ACHIEVEMENTS,
  BEHAVIOR_CATEGORIES
};