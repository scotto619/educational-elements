// constants/gameData.js - ENHANCED with Complete Shop System Constants

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
  { name: 'Illusionist Fox', image: '/Pets/Illusionist.png', speed: 1.5, wins: 0, level: 1 },
  { name: 'Knight Stallion', image: '/Pets/Knight.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Lightning Sprite', image: '/Pets/Lightning.png', speed: 1.6, wins: 0, level: 1 },
  { name: 'Monk Panda', image: '/Pets/Monk.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Necromancer Raven', image: '/Pets/Necromancer.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Orc Boar', image: '/Pets/Orc.png', speed: 0.9, wins: 0, level: 1 },
  { name: 'Paladin Lion', image: '/Pets/Paladin.png', speed: 1.1, wins: 0, level: 1 },
  { name: 'Rogue Shadow', image: '/Pets/Rogue.png', speed: 1.4, wins: 0, level: 1 },
  { name: 'Stealth Cat', image: '/Pets/Stealth.png', speed: 1.3, wins: 0, level: 1 },
  { name: 'Time Keeper', image: '/Pets/Time Knight.png', speed: 1.0, wins: 0, level: 1 },
  { name: 'Warrior Eagle', image: '/Pets/Warrior.png', speed: 1.2, wins: 0, level: 1 },
  { name: 'Wizard Owl', image: '/Pets/Wizard.png', speed: 1.0, wins: 0, level: 1 }
];

export const PET_NAMES = [
  'Buddy', 'Shadow', 'Storm', 'Luna', 'Max', 'Bella', 'Charlie', 'Daisy', 'Rocky',
  'Zoe', 'Jack', 'Molly', 'Duke', 'Sadie', 'Bear', 'Maggie', 'Zeus',
  'Lucy', 'Cooper', 'Sophie', 'Tucker', 'Chloe', 'Oliver', 'Lola', 'Oscar'
];

// ===============================================
// QUEST SYSTEM DATA
// ===============================================

export const QUEST_GIVERS = [
  {
    id: 'guide1',
    name: 'Sage the Wise',
    image: '/Guides/Guide 1.png',
    personality: 'wise',
    role: 'Academic Quest Giver',
    specialty: 'learning',
    greetings: [
      "Knowledge is the greatest treasure of all! 📚",
      "Ready to embark on a learning adventure?",
      "Every question is the beginning of wisdom!"
    ],
    tips: [
      "The more you learn, the more you realize how much you don't know.",
      "Curiosity is the engine of achievement.",
      "Education is the most powerful weapon to change the world."
    ]
  },
  {
    id: 'guide2',
    name: 'Valor the Brave',
    image: '/Guides/Guide 2.png',
    personality: 'brave',
    role: 'Challenge Quest Giver',
    specialty: 'courage',
    greetings: [
      "Courage isn't the absence of fear, it's facing your fears! ⚔️",
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
// COMPLETE SHOP SYSTEM DATA
// ===============================================

// Basic Shop Avatars - Regular purchasable avatars
export const BASIC_AVATARS = [
  {
    id: 'banana_basic',
    name: 'Banana Character',
    image: '/shop/Basic/Banana.png',
    price: 15,
    base: 'Banana',
    description: 'A fun banana character!'
  },
  {
    id: 'goblin1_basic',
    name: 'Goblin Warrior',
    image: '/shop/Basic/Goblin1.png',
    price: 20,
    base: 'Goblin1',
    description: 'A fierce goblin warrior'
  },
  {
    id: 'goblingirl1_basic',
    name: 'Goblin Girl',
    image: '/shop/Basic/GoblinGirl1.png',
    price: 20,
    base: 'GoblinGirl1',
    description: 'A clever goblin girl'
  },
  {
    id: 'guard1_basic',
    name: 'Royal Guard',
    image: '/shop/Basic/Guard1.png',
    price: 22,
    base: 'Guard1',
    description: 'A loyal royal guard'
  },
  {
    id: 'guardgirl1_basic',
    name: 'Guard Girl',
    image: '/shop/Basic/GuardGirl1.png',
    price: 22,
    base: 'GuardGirl1',
    description: 'A brave guard girl'
  },
  {
    id: 'soccerboy_basic',
    name: 'Soccer Boy',
    image: '/shop/Basic/SoccerBoy.png',
    price: 18,
    base: 'SoccerBoy',
    description: 'Ready for the game!'
  },
  {
    id: 'soccerboy2_basic',
    name: 'Soccer Boy 2',
    image: '/shop/Basic/SoccerBoy2.png',
    price: 18,
    base: 'SoccerBoy2',
    description: 'Another soccer champion!'
  },
  {
    id: 'soccergirl_basic',
    name: 'Soccer Girl',
    image: '/shop/Basic/SoccerGirl.png',
    price: 18,
    base: 'SoccerGirl',
    description: 'A skilled soccer player!'
  },
  {
    id: 'streetboy1_basic',
    name: 'Street Boy',
    image: '/shop/Basic/Streetboy1.png',
    price: 16,
    base: 'Streetboy1',
    description: 'Cool street style character'
  },
  {
    id: 'streetgirl1_basic',
    name: 'Street Girl',
    image: '/shop/Basic/Streetgirl1.png',
    price: 16,
    base: 'Streetgirl1',
    description: 'Hip street style character'
  },
  {
    id: 'vampire1_basic',
    name: 'Vampire',
    image: '/shop/Basic/Vampire1.png',
    price: 25,
    base: 'Vampire1',
    description: 'A mysterious vampire'
  },
  {
    id: 'vampiregirl1_basic',
    name: 'Vampire Girl',
    image: '/shop/Basic/VampireGirl1.png',
    price: 25,
    base: 'VampireGirl1',
    description: 'An elegant vampire girl'
  }
];

// Basic Shop Pets - Regular purchasable pets
export const BASIC_PETS = [
  {
    id: 'goblin_pet_basic',
    name: 'Goblin Companion',
    image: '/shop/BasicPets/GoblinPet.png',
    price: 18,
    type: 'basic',
    description: 'A mischievous goblin friend'
  },
  {
    id: 'soccer_pet_basic',
    name: 'Soccer Buddy',
    image: '/shop/BasicPets/SoccerPet.png',
    price: 20,
    type: 'basic',
    description: 'Ready to play ball!'
  },
  {
    id: 'unicorn_pet_basic',
    name: 'Unicorn Friend',
    image: '/shop/BasicPets/UnicornPet.png',
    price: 25,
    type: 'basic',
    description: 'A magical unicorn companion'
  }
];

// Existing Pets from the game (to be added to shop)
export const EXISTING_PETS = [
  "Alchemist", "Barbarian", "Bard", "Beastmaster", "Cleric", "Crystal Knight",
  "Crystal Sage", "Dream", "Druid", "Engineer", "Frost Mage", "Illusionist",
  "Knight", "Lightning", "Monk", "Necromancer", "Orc", "Paladin", "Rogue",
  "Stealth", "Time Knight", "Warrior", "Wizard"
].map((pet, index) => ({
  id: `classic_pet_${pet.toLowerCase().replace(' ', '_')}`,
  name: `${pet} Companion`,
  image: `/Pets/${pet}.png`,
  price: 15 + (index % 5) * 3, // Varied pricing 15-27 coins
  type: 'classic'
}));

// Premium Pets - Only available in loot boxes
export const PREMIUM_PETS = [
  {
    id: 'snake_pet_premium',
    name: 'Mystical Snake',
    image: '/shop/PremiumPets/SnakePet.png',
    type: 'premium',
    rarity: 'rare',
    description: 'A powerful serpent ally'
  },
  {
    id: 'vampire_pet_premium',
    name: 'Vampire Bat',
    image: '/shop/PremiumPets/VampirePet.png',
    type: 'premium',
    rarity: 'epic',
    description: 'A loyal vampire companion'
  }
];

// Premium Avatars - Basic Level 2 versions for loot boxes only
export const PREMIUM_BASIC_AVATARS = [
  {
    id: 'goblin2_premium',
    name: 'Elite Goblin Warrior',
    image: '/shop/Premium/Goblin2.png',
    base: 'Goblin2',
    rarity: 'rare',
    description: 'An upgraded goblin warrior'
  },
  {
    id: 'goblingirl2_premium',
    name: 'Elite Goblin Girl',
    image: '/shop/Premium/GoblinGirl2.png',
    base: 'GoblinGirl2',
    rarity: 'rare',
    description: 'An enhanced goblin girl'
  },
  {
    id: 'vampire2_premium',
    name: 'Vampire Lord',
    image: '/shop/Premium/Vampire2.png',
    base: 'Vampire2',
    rarity: 'epic',
    description: 'A powerful vampire lord'
  },
  {
    id: 'vampiregirl2_premium',
    name: 'Vampire Queen',
    image: '/shop/Premium/VampireGirl2.png',
    base: 'VampireGirl2',
    rarity: 'epic',
    description: 'An elegant vampire queen'
  }
];

// Themed Avatars - Multi-level progression sets
export const THEMED_AVATARS = [
  // Pirate Themed Level 2-4
  ...Array.from({length: 3}, (_, i) => ({
    id: `pirate_f_${i+2}`,
    name: `Pirate Captain F`,
    level: i + 2,
    image: `/shop/Themed/Pirate/F Level ${i + 2}.png`,
    price: 25 + (i * 12),
    base: 'Pirate F',
    rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
  })),
  ...Array.from({length: 3}, (_, i) => ({
    id: `pirate_m_${i+2}`,
    name: `Pirate Captain M`,
    level: i + 2,
    image: `/shop/Themed/Pirate/M Level ${i + 2}.png`,
    price: 25 + (i * 12),
    base: 'Pirate M',
    rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
  })),
  // Farm Themed Level 2-4
  ...Array.from({length: 3}, (_, i) => ({
    id: `farm_f_${i+2}`,
    name: `Master Farmer F`,
    level: i + 2,
    image: `/shop/Themed/Farm/F Level ${i + 2}.png`,
    price: 30 + (i * 15),
    base: 'Farm F',
    rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
  })),
  ...Array.from({length: 3}, (_, i) => ({
    id: `farm_m_${i+2}`,
    name: `Master Farmer M`,
    level: i + 2,
    image: `/shop/Themed/Farm/M Level ${i + 2}.png`,
    price: 30 + (i * 15),
    base: 'Farm M',
    rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
  })),
  // Robot Themed Level 2-4
  ...Array.from({length: 3}, (_, i) => ({
    id: `robot_f_${i+2}`,
    name: `Advanced Robot F`,
    level: i + 2,
    image: `/shop/Themed/Robot/F Level ${i + 2}.png`,
    price: 35 + (i * 18),
    base: 'Robot F',
    rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
  })),
  ...Array.from({length: 3}, (_, i) => ({
    id: `robot_m_${i+2}`,
    name: `Advanced Robot M`,
    level: i + 2,
    image: `/shop/Themed/Robot/M Level ${i + 2}.png`,
    price: 35 + (i * 18),
    base: 'Robot M',
    rarity: i === 0 ? 'rare' : i === 1 ? 'epic' : 'legendary'
  }))
];

// Loot Boxes
export const LOOT_BOXES = [
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    description: 'Contains 3 random items',
    image: '📦',
    price: 25,
    contents: { count: 3, guaranteedRare: false }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    description: 'Contains 5 items with guaranteed rare+',
    image: '✨',
    price: 50,
    contents: { count: 5, guaranteedRare: true }
  },
  {
    id: 'legendary_box',
    name: 'Legendary Loot Box',
    description: 'Contains 3 rare+ items with chance of legendary',
    image: '🏆',
    price: 100,
    contents: { count: 3, guaranteedRare: true, legendaryChance: true }
  }
];

// Default teacher rewards (now deletable)
export const DEFAULT_TEACHER_REWARDS = [
  { id: 'tech_time', name: 'Technology Time', description: '10 minutes of educational technology', price: 15, category: 'privileges', icon: '💻' },
  { id: 'move_seat', name: 'Move Seat for a Day', description: 'Choose where to sit for one day', price: 10, category: 'privileges', icon: '🪑' },
  { id: 'lollies', name: 'Sweet Treat', description: 'A special sweet treat', price: 8, category: 'treats', icon: '🍭' },
  { id: 'homework_pass', name: 'Homework Pass', description: 'Skip one homework assignment', price: 25, category: 'privileges', icon: '📝' },
  { id: 'line_leader', name: 'Line Leader', description: 'Be the line leader for a week', price: 12, category: 'privileges', icon: '👑' },
  { id: 'extra_play', name: 'Extra Playtime', description: '5 minutes extra recess', price: 18, category: 'privileges', icon: '⚽' },
  { id: 'teacher_helper', name: 'Teacher Helper', description: 'Be the teacher\'s special helper for a day', price: 20, category: 'privileges', icon: '🌟' },
  { id: 'free_draw', name: 'Free Drawing Time', description: '15 minutes of free drawing', price: 12, category: 'activities', icon: '🎨' }
];

// Rarity styling and metadata
export const RARITY_STYLES = {
  common: {
    name: 'Common',
    borderColor: 'border-gray-400',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-700',
    glowColor: 'shadow-gray-200',
    chance: 50
  },
  uncommon: {
    name: 'Uncommon',
    borderColor: 'border-green-400',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    glowColor: 'shadow-green-200',
    chance: 30
  },
  rare: {
    name: 'Rare',
    borderColor: 'border-blue-400',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    glowColor: 'shadow-blue-300',
    chance: 15
  },
  epic: {
    name: 'Epic',
    borderColor: 'border-purple-400',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    glowColor: 'shadow-purple-300',
    chance: 4
  },
  legendary: {
    name: 'Legendary',
    borderColor: 'border-orange-400',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    glowColor: 'shadow-orange-300',
    chance: 1
  }
};

// Combined shop items structure
export const SHOP_ITEMS = {
  avatars: {
    basic: BASIC_AVATARS,
    premium: PREMIUM_BASIC_AVATARS,
    themed: THEMED_AVATARS
  },
  pets: {
    basic: [...BASIC_PETS, ...EXISTING_PETS],
    premium: PREMIUM_PETS
  },
  lootBoxes: LOOT_BOXES,
  teacherRewards: DEFAULT_TEACHER_REWARDS
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