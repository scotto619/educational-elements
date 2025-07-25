// constants/gameData.js - ENHANCED with Pet Unlock & Editable XP Criteria

// ===============================================
// CORE GAME CONSTANTS
// ===============================================

export const GAME_CONFIG = {
  MAX_LEVEL: 4,
  COINS_PER_XP: 5,
  RACE_DISTANCE: 0.8, // 80% of track width
  PET_UNLOCK_XP: 50, // NEW: Students get a pet at 50 XP
  XP_THRESHOLDS: {
    LEVEL_1: 0,
    LEVEL_2: 100,
    LEVEL_3: 200,
    LEVEL_4: 300
  }
};

// ===============================================
// EDITABLE XP REWARD CATEGORIES
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
    questTypes: ['learning', 'homework', 'reading'],
    tips: [
      "💡 Tip: Consistent daily learning builds strong foundations!",
      "📚 Remember: Every expert was once a beginner!",
      "🎯 Focus on understanding, not just completing!"
    ]
  },
  {
    id: 'guide2',
    name: 'Captain Courage',
    image: '/Guides/Guide 2.png',
    personality: 'brave',
    role: 'Behavior Quest Giver',
    specialty: 'character',
    greetings: [
      "Heroes are made through good choices! ⚔️",
      "Ready to show your character?",
      "Brave deeds await, young champion!"
    ],
    questTypes: ['behavior', 'kindness', 'respect'],
    tips: [
      "🛡️ Tip: True strength comes from helping others!",
      "⭐ Remember: Small acts of kindness make big differences!",
      "🎖️ Focus on being the hero of your own story!"
    ]
  },
  {
    id: 'guide3',
    name: 'Mystic Luna',
    image: '/Guides/Guide 3.png',
    personality: 'mysterious',
    role: 'Creative Quest Giver',
    specialty: 'creativity',
    greetings: [
      "Magic flows through creative minds! ✨",
      "The stars align for artistic adventures!",
      "Let your imagination soar, young artist!"
    ],
    questTypes: ['creative', 'art', 'expression'],
    tips: [
      "🎨 Tip: Every masterpiece starts with a single brushstroke!",
      "🌟 Remember: Your unique perspective is your superpower!",
      "✨ Focus on expressing your inner creativity!"
    ]
  }
];

export const QUEST_TEMPLATES = [
  {
    id: 'homework_completion',
    name: 'Complete Daily Homework',
    description: 'Finish all assigned homework tasks',
    reward: { type: 'xp', amount: 10 },
    category: 'academic',
    questGiver: 'guide1',
    estimatedTime: '30 minutes',
    difficulty: 'easy'
  },
  {
    id: 'help_classmate',
    name: 'Help a Classmate',
    description: 'Assist another student with their work',
    reward: { type: 'xp', amount: 15 },
    category: 'social',
    questGiver: 'guide2',
    estimatedTime: '15 minutes',
    difficulty: 'medium'
  },
  {
    id: 'reading_challenge',
    name: 'Read for 20 Minutes',
    description: 'Read independently for at least 20 minutes',
    reward: { type: 'xp', amount: 12 },
    category: 'academic',
    questGiver: 'guide1',
    estimatedTime: '20 minutes',
    difficulty: 'easy'
  }
];

// ===============================================
// SHOP & ECONOMY SYSTEM
// ===============================================

export const ITEM_RARITIES = {
  common: { color: 'gray', glow: 'shadow-lg', chance: 0.6 },
  uncommon: { color: 'green', glow: 'shadow-green-400/50', chance: 0.25 },
  rare: { color: 'blue', glow: 'shadow-blue-400/50', chance: 0.12 },
  epic: { color: 'purple', glow: 'shadow-purple-400/50', chance: 0.025 },
  legendary: { color: 'gold', glow: 'shadow-yellow-400/50', chance: 0.005 }
};

export const SHOP_ITEMS = {
  avatars: [
    { id: 'basic_wizard', name: 'Wizard', price: 50, category: 'avatars', avatarBase: 'Wizard F', rarity: 'common' },
    { id: 'basic_knight', name: 'Knight', price: 50, category: 'avatars', avatarBase: 'Knight M', rarity: 'common' },
    { id: 'basic_archer', name: 'Archer', price: 60, category: 'avatars', avatarBase: 'Archer F', rarity: 'uncommon' }
  ],
  pets: [
    { id: 'basic_cat', name: 'Alchemist Cat', price: 30, category: 'pets', image: '/Pets/Alchemist.png', rarity: 'common' },
    { id: 'basic_dog', name: 'Knight Dog', price: 35, category: 'pets', image: '/Pets/Knight.png', rarity: 'common' },
    { id: 'magic_owl', name: 'Mystic Owl', price: 75, category: 'pets', image: '/Pets/Cleric.png', rarity: 'rare' }
  ],
  consumables: [
    { id: 'xp_boost', name: 'XP Boost Potion', price: 15, category: 'consumables', effect: '+50% XP for 1 hour', rarity: 'common' },
    { id: 'pet_speed', name: 'Pet Speed Boost', price: 20, category: 'consumables', effect: 'Pet +0.5 Speed', rarity: 'uncommon' }
  ],
  lootboxes: [
    { id: 'basic_box', name: 'Basic Loot Box', price: 25, category: 'lootboxes', rarity: 'common' },
    { id: 'rare_box', name: 'Rare Treasure Chest', price: 50, category: 'lootboxes', rarity: 'rare' },
    { id: 'legendary_box', name: 'Legendary Vault', price: 100, category: 'lootboxes', rarity: 'legendary' }
  ]
};

export const LOOT_BOX_ITEMS = {
  avatars: [
    { id: 'wizard_fire', name: 'Fire Wizard', type: 'avatar', rarity: 'rare', avatarBase: 'Fire Wizard F' },
    { id: 'ice_knight', name: 'Ice Knight', type: 'avatar', rarity: 'epic', avatarBase: 'Ice Knight M' },
    { id: 'shadow_rogue', name: 'Shadow Rogue', type: 'avatar', rarity: 'legendary', avatarBase: 'Shadow Rogue F' }
  ],
  pets: [
    { id: 'dragon_pet', name: 'Mini Dragon', type: 'pet', image: '/Pets/Dragon.png', rarity: 'legendary' },
    { id: 'phoenix_pet', name: 'Phoenix Chick', type: 'pet', image: '/Pets/Phoenix.png', rarity: 'epic' },
    { id: 'unicorn_pet', name: 'Baby Unicorn', type: 'pet', image: '/Pets/Unicorn.png', rarity: 'rare' }
  ]
};

// ===============================================
// PET SYSTEM DATA
// ===============================================

export const PET_NAMES = [
  'Shadowpaw', 'Stormwing', 'Brightclaw', 'Swiftail', 'Goldmane', 'Starwhisper',
  'Thunderbolt', 'Moonbeam', 'Fireheart', 'Icewind', 'Leafdancer', 'Rockcrusher',
  'Mistwalker', 'Sunburst', 'Nightshade', 'Crystalwing', 'Emberstone', 'Frostbite',
  'Windrider', 'Earthshaker', 'Lightbringer', 'Darkfang', 'Silverclaw', 'Goldenwing'
];

export const PET_SPECIES = [
  { name: 'Alchemist Companion', image: '/Pets/Alchemist.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Barbarian Beast', image: '/Pets/Barbarian.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Bard Bird', image: '/Pets/Bard.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Beastmaster Pet', image: '/Pets/Beastmaster.png', speed: 1.4, wins: 0, level: 1 },
  { name: 'Cleric Owl', image: '/Pets/Cleric.png', speed: 0.9, wins: 0, level: 1 },
  { name: 'Crystal Knight', image: '/Pets/Crystal Knight.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Crystal Sage', image: '/Pets/Crystal Sage.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Dream Guardian', image: '/Pets/Dream.png', speed: 1.5, wins: 0, level: 1 },
  { name: 'Druid Sprite', image: '/Pets/Druid.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Engineer Bot', image: '/Pets/Engineer.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Frost Mage', image: '/Pets/Frost Mage.png', speed: 0.8, wins: 0, level: 1 },
  { name: 'Illusionist', image: '/Pets/Illusionist.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Knight Steed', image: '/Pets/Knight.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Lightning Spirit', image: '/Pets/Lightning.png', speed: 1.6, wins: 0, level: 1 },
  { name: 'Monk Tiger', image: '/Pets/Monk.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Necromancer Raven', image: '/Pets/Necromancer.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Orc Wolf', image: '/Pets/Orc.png', speed: 1.4, wins: 0, level: 1 },
  { name: 'Paladin Lion', image: '/Pets/Paladin.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Rogue Shadow', image: '/Pets/Rogue.png', speed: 1.5, wins: 0, level: 1 },
  { name: 'Sky Knight Eagle', image: '/Pets/Sky Knight.png', speed: 1.7, wins: 0, level: 1 },
  { name: 'Time Mage Turtle', image: '/Pets/Time Mage.png', speed: 0.7, wins: 0, level: 1 },
  { name: 'Wizard Familiar', image: '/Pets/Wizard.png', speed: 1.0, wins: 0, level: 1 }
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
// SHOP AVATAR BASES - FOR PROPER LOADING
// ===============================================

export const SHOP_AVATAR_MAPPING = {
  // Basic shop avatars
  'basic_wizard': { base: 'Wizard F', category: 'basic' },
  'basic_knight': { base: 'Knight M', category: 'basic' },
  'basic_archer': { base: 'Archer F', category: 'basic' },
  
  // Premium shop avatars (from themed sets)
  'pirate_f_1': { base: 'Pirate F', category: 'themed' },
  'pirate_m_1': { base: 'Pirate M', category: 'themed' },
  'ninja_f_1': { base: 'Ninja F', category: 'themed' },
  'ninja_m_1': { base: 'Ninja M', category: 'themed' },
  
  // Premium avatars (from loot boxes)
  'goblin2_premium': { base: 'Goblin2', category: 'premium' },
  'goblingirl2_premium': { base: 'GoblinGirl2', category: 'premium' },
  'vampire2_premium': { base: 'Vampire2', category: 'premium' },
  'vampiregirl2_premium': { base: 'VampireGirl2', category: 'premium' }
};