// constants/gameData.js - ENHANCED with Missing Constants for StudentsTab

// ===============================================
// CORE GAME CONSTANTS
// ===============================================

export const GAME_CONFIG = {
  MAX_LEVEL: 4,
  COINS_PER_XP: 5,
  RACE_DISTANCE: 0.8, // 80% of track width
  PET_UNLOCK_XP: 50, // Students get a pet at 50 XP
  XP_THRESHOLDS: {
    LEVEL_1: 0,
    LEVEL_2: 100,
    LEVEL_3: 200,
    LEVEL_4: 300
  }
};

// ===============================================
// EDITABLE XP REWARD CATEGORIES - FOR STUDENTSTAB
// ===============================================

export const DEFAULT_XP_CATEGORIES = [
  { 
    id: 1, 
    label: 'Respectful', 
    amount: 1, 
    color: 'bg-blue-500', 
    icon: '🤝',
    description: 'Showing respect to others and the classroom'
  },
  { 
    id: 2, 
    label: 'Responsible', 
    amount: 1, 
    color: 'bg-green-500', 
    icon: '✅',
    description: 'Taking responsibility for actions and tasks'
  },
  { 
    id: 3, 
    label: 'Safe', 
    amount: 1, 
    color: 'bg-yellow-500', 
    icon: '🛡️',
    description: 'Following safety rules and helping others stay safe'
  },
  { 
    id: 4, 
    label: 'Learner', 
    amount: 1, 
    color: 'bg-purple-500', 
    icon: '📚',
    description: 'Actively participating in learning activities'
  },
  { 
    id: 5, 
    label: 'Star Award', 
    amount: 5, 
    color: 'bg-yellow-600', 
    icon: '⭐',
    description: 'Outstanding achievement or exceptional behavior'
  }
];

// Legacy support for old XP_REWARDS constant
export const XP_REWARDS = DEFAULT_XP_CATEGORIES;

// ===============================================
// AVAILABLE AVATARS
// ===============================================

export const AVAILABLE_AVATARS = [
  // Female Avatars
  'Alchemist F', 'Archer F', 'Barbarian F', 'Bard F', 'Beastmaster F', 'Cleric F', 
  'Crystal Sage F', 'Druid F', 'Engineer F', 'Ice Mage F', 'Illusionist F', 'Knight F', 
  'Monk F', 'Necromancer F', 'Orc F', 'Paladin F', 'Rogue F', 'Sky Knight F', 
  'Time Mage F', 'Wizard F',
  
  // Male Avatars  
  'Alchemist M', 'Archer M', 'Barbarian M', 'Bard M', 'Beastmaster M', 'Cleric M',
  'Crystal Sage M', 'Druid M', 'Engineer M', 'Ice Mage M', 'Illusionist M', 'Knight M',
  'Monk M', 'Necromancer M', 'Orc M', 'Paladin M', 'Rogue M', 'Sky Knight M', 
  'Time Mage M', 'Wizard M'
];

// ===============================================
// PET SYSTEM DATA
// ===============================================

export const PET_SPECIES = [
  { name: 'Alchemist Dragon', image: '/Pets/Alchemist.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Barbarian Bear', image: '/Pets/Barbarian.png', speed: 0.9, wins: 0, level: 1 },
  { name: 'Bard Songbird', image: '/Pets/Bard.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Beastmaster Wolf', image: '/Pets/Beastmaster.png', speed: 1.4, wins: 0, level: 1 },
  { name: 'Cleric Dove', image: '/Pets/Cleric.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Crystal Companion', image: '/Pets/Crystal Knight.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Crystal Sage Owl', image: '/Pets/Crystal Sage.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Dream Cat', image: '/Pets/Dream.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Druid Stag', image: '/Pets/Druid.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Engineer Bot', image: '/Pets/Engineer.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Frost Companion', image: '/Pets/Frost Mage.png', speed: 0.8, wins: 0, level: 1 },
  { name: 'Illusionist Fox', image: '/Pets/Illusionist.png', speed: 1.6, wins: 0, level: 1 },
  { name: 'Knight Horse', image: '/Pets/Knight.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Lightning Sprite', image: '/Pets/Lightning.png', speed: 1.8, wins: 0, level: 1 },
  { name: 'Monk Tiger', image: '/Pets/Monk.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Necromancer Raven', image: '/Pets/Necromancer.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Orc Wolf', image: '/Pets/Orc.png', speed: 1.4, wins: 0, level: 1 },
  { name: 'Paladin Lion', image: '/Pets/Paladin.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Rogue Shadow', image: '/Pets/Rogue.png', speed: 1.5, wins: 0, level: 1 },
  { name: 'Stealth Cat', image: '/Pets/Stealth.png', speed: 1.7, wins: 0, level: 1 },
  { name: 'Time Knight Turtle', image: '/Pets/Time Knight.png', speed: 0.6, wins: 0, level: 1 },
  { name: 'Warrior Hawk', image: '/Pets/Warrior.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Wizard Familiar', image: '/Pets/Wizard.png', speed: 1.0, wins: 0, level: 1 }
];

export const PET_NAMES = [
  'Buddy', 'Shadow', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Rocky',
  'Zoe', 'Jack', 'Molly', 'Duke', 'Sadie', 'Bear', 'Maggie', 'Zeus',
  'Lucy', 'Cooper', 'Sophie', 'Tucker', 'Chloe', 'Oliver', 'Lola', 'Oscar',
  'Ruby', 'Milo', 'Penny', 'Leo', 'Nala', 'Finn', 'Rosie', 'Gus'
];

// ===============================================
// QUEST SYSTEM DATA
// ===============================================

export const QUEST_GIVERS = [
  {
    id: 'guide1',
    name: 'Professor Hoot',
    image: '/Guides/Guide 1.png',
    personality: 'wise',
    role: 'Learning Quest Giver',
    specialty: 'academic',
    greetings: [
      "Wisdom comes to those who seek knowledge! 🦉",
      "Ready for your next learning adventure?",
      "Books and quests await, young scholar!"
    ],
    tips: [
      "Remember, every expert was once a beginner!",
      "The best time to plant a tree was 20 years ago. The second best time is now!",
      "Knowledge is the only treasure that grows when shared."
    ]
  },
  {
    id: 'guide2',
    name: 'Captain Valor',
    image: '/Guides/Guide 2.png',
    personality: 'brave',
    role: 'Courage Quest Giver',
    specialty: 'bravery',
    greetings: [
      "Courage isn't the absence of fear, it's acting despite it! ⚔️",
      "Ready to face your challenges head-on?",
      "Every hero starts with a single brave step!"
    ],
    tips: [
      "Bravery is not the absence of fear, but action in spite of it!",
      "Champions are made when nobody is watching.",
      "The greatest glory is not in never falling, but in rising every time we fall."
    ]
  },
  {
    id: 'guide3',
    name: 'Sunny the Helper',
    image: '/Guides/Guide 3.png',
    personality: 'kind',
    role: 'Kindness Quest Giver',
    specialty: 'helping',
    greetings: [
      "Kindness is the language everyone understands! 🌟",
      "Ready to spread some sunshine today?",
      "Small acts of kindness create big changes!"
    ],
    tips: [
      "No act of kindness, no matter how small, is ever wasted.",
      "Be the reason someone believes in good people.",
      "Kindness is free, but its value is priceless."
    ]
  }
];

export const QUEST_TEMPLATES = [
  {
    id: 'daily_reading',
    title: 'Daily Reading Challenge',
    description: 'Read for 20 minutes',
    category: 'academic',
    icon: '📚',
    questGiverId: 'guide1',
    rewards: { xp: 2, coins: 0 },
    type: 'daily'
  },
  {
    id: 'help_classmate',
    title: 'Lending a Hand',
    description: 'Help a classmate with their work',
    category: 'social',
    icon: '🤝',
    questGiverId: 'guide3',
    rewards: { xp: 3, coins: 5 },
    type: 'social'
  },
  {
    id: 'clean_workspace',
    title: 'Tidy Champion',
    description: 'Keep your workspace clean all day',
    category: 'responsibility',
    icon: '🧹',
    questGiverId: 'guide2',
    rewards: { xp: 2, coins: 3 },
    type: 'daily'
  }
];

// ===============================================
// SHOP SYSTEM DATA
// ===============================================

export const SHOP_ITEMS = {
  avatars: {
    basic: [
      {
        id: 'basic_wizard_f',
        name: 'Apprentice Wizard',
        image: '/Avatars/Wizard F/Level 1.png',
        price: 10,
        base: 'Wizard F',
        category: 'basic'
      },
      {
        id: 'basic_knight_m',
        name: 'Young Knight',
        image: '/Avatars/Knight M/Level 1.png',
        price: 12,
        base: 'Knight M',
        category: 'basic'
      }
    ],
    premium: [
      {
        id: 'premium_dragon_lord',
        name: 'Dragon Lord',
        image: '/shop/Premium/Dragon_Lord.png',
        price: 50,
        base: 'Dragon Lord',
        category: 'premium'
      }
    ]
  },
  pets: {
    basic: [
      {
        id: 'basic_companion',
        name: 'Loyal Companion',
        image: '/Pets/Wizard.png',
        price: 15,
        species: 'Wizard Familiar',
        speed: 1.0
      }
    ]
  }
};

export const LOOT_BOX_ITEMS = {
  common: [
    { id: 'common_avatar_1', name: 'Forest Ranger', type: 'avatar', rarity: 'common' },
    { id: 'common_pet_1', name: 'Forest Fox', type: 'pet', rarity: 'common' }
  ],
  rare: [
    { id: 'rare_avatar_1', name: 'Storm Mage', type: 'avatar', rarity: 'rare' },
    { id: 'rare_pet_1', name: 'Thunder Bird', type: 'pet', rarity: 'rare' }
  ],
  legendary: [
    { id: 'legendary_avatar_1', name: 'Cosmic Sage', type: 'avatar', rarity: 'legendary' },
    { id: 'legendary_pet_1', name: 'Stellar Dragon', type: 'pet', rarity: 'legendary' }
  ]
};

export const ITEM_RARITIES = {
  common: { color: 'gray', dropRate: 0.60 },
  rare: { color: 'blue', dropRate: 0.30 },
  epic: { color: 'purple', dropRate: 0.08 },
  legendary: { color: 'orange', dropRate: 0.02 }
};

// ===============================================
// NAVIGATION TABS CONFIGURATION
// ===============================================

export const NAVIGATION_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'students', label: 'Students', icon: '👥' },
  { id: 'quests', label: 'Quests', icon: '⚔️' },
  { id: 'shop', label: 'Shop', icon: '🏪' },
  { id: 'race', label: 'Pet Race', icon: '🏁' },
  { id: 'fishing', label: 'Fishing', icon: '🎣' },
  { id: 'games', label: 'Games', icon: '🎮' },
  { id: 'curriculum', label: 'Curriculum Corner', icon: '📖' },
  { id: 'toolkit', label: 'Teachers Toolkit', icon: '🛠️', isPro: true },
  { id: 'classes', label: 'My Classes', icon: '📚' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

// ===============================================
// SOUND FILE PATHS
// ===============================================

export const SOUND_FILES = {
  XP_AWARD: '/sounds/xp-award.wav',
  LEVEL_UP: '/sounds/level-up.wav',
  COIN_COLLECT: '/sounds/coin.wav',
  PET_UNLOCK: '/sounds/pet-unlock.wav',
  QUEST_COMPLETE: '/sounds/quest-complete.wav',
  TIMER_COMPLETE: '/sounds/timer.wav',
  BUTTON_CLICK: '/sounds/click.wav',
  ERROR: '/sounds/error.wav',
  SUCCESS: '/sounds/success.wav'
};

// ===============================================
// UI THEME CONSTANTS
// ===============================================

export const UI_THEMES = {
  colors: {
    primary: 'blue',
    secondary: 'purple',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue'
  },
  animations: {
    MODAL_APPEAR: 'animate-modal-appear',
    SLIDE_UP: 'animate-slide-up',
    FADE_IN: 'animate-fade-in',
    BOUNCE: 'animate-bounce-slow',
    PULSE: 'animate-pulse-slow',
    WIGGLE: 'animate-wiggle',
    FLOAT: 'animate-float',
    GLOW: 'animate-glow',
    SHIMMER: 'animate-shimmer'
  }
};