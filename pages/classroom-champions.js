// classroom-champions.js - Updated with Coin Rewards for Quests
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Lazy load components
const DashboardTab = React.lazy(() => import('../components/tabs/DashboardTab'));
const StudentsTab = React.lazy(() => import('../components/tabs/StudentsTab'));
const ShopTab = React.lazy(() => import('../components/tabs/ShopTab'));
const PetRaceTab = React.lazy(() => import('../components/tabs/PetRaceTab'));
const ClassesTab = React.lazy(() => import('../components/tabs/ClassesTab'));
const SettingsTab = React.lazy(() => import('../components/tabs/SettingsTab'));
const TeachersToolkitTab = React.lazy(() => import('../components/tabs/TeachersToolkitTab'));

// Lazy load modals
const CharacterSheetModal = React.lazy(() => import('../components/modals/CharacterSheetModal'));
const AvatarSelectionModal = React.lazy(() => import('../components/modals/AvatarSelectionModal'));
const LevelUpModal = React.lazy(() => import('../components/modals/LevelUpModal'));
const PetUnlockModal = React.lazy(() => import('../components/modals/PetUnlockModal'));
const AddStudentModal = React.lazy(() => import('../components/modals/AddStudentModal'));
const RaceWinnerModal = React.lazy(() => import('../components/modals/RaceWinnerModal'));
const RaceSetupModal = React.lazy(() => import('../components/modals/RaceSetupModal'));
const QuestCompletionModal = React.lazy(() => import('../components/modals/QuestCompletionModal'));

// ===============================================
// CONSTANTS AND CONFIGURATIONS
// ===============================================

const MAX_LEVEL = 4;

const ITEM_RARITIES = {
  common: { 
    name: 'Common', 
    color: 'gray', 
    bgColor: 'bg-gray-100', 
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
    chance: 60
  },
  rare: { 
    name: 'Rare', 
    color: 'blue', 
    bgColor: 'bg-blue-100', 
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
    chance: 30
  },
  epic: { 
    name: 'Epic', 
    color: 'purple', 
    bgColor: 'bg-purple-100', 
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
    chance: 8
  },
  legendary: { 
    name: 'Legendary', 
    color: 'yellow', 
    bgColor: 'bg-yellow-100', 
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-300',
    chance: 2
  }
};

const SHOP_ITEMS = [
  // Cosmetic Items
  {
    id: 'crown',
    name: 'Golden Crown',
    description: 'A majestic crown for classroom royalty',
    price: 10,
    type: 'cosmetic',
    rarity: 'epic',
    icon: '👑',
    category: 'accessories'
  },
  {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    description: 'Channel your inner magic user',
    price: 6,
    type: 'cosmetic',
    rarity: 'rare',
    icon: '🧙‍♂️',
    category: 'accessories'
  },
  {
    id: 'sunglasses',
    name: 'Cool Sunglasses',
    description: 'Look effortlessly cool',
    price: 3,
    type: 'cosmetic',
    rarity: 'common',
    icon: '😎',
    category: 'accessories'
  },
  {
    id: 'cape',
    name: 'Superhero Cape',
    description: 'Be the hero of your classroom',
    price: 8,
    type: 'cosmetic',
    rarity: 'rare',
    icon: '🦸‍♂️',
    category: 'accessories'
  },
  
  // Power-ups
  {
    id: 'double_xp',
    name: 'Double XP Boost',
    description: 'Double XP for your next 5 actions',
    price: 8,
    type: 'powerup',
    rarity: 'rare',
    icon: '⚡',
    category: 'powerups',
    effect: 'double_xp_5'
  },
  {
    id: 'pet_treat',
    name: 'Pet Speed Boost',
    description: 'Permanently increase your pet\'s speed',
    price: 12,
    type: 'powerup',
    rarity: 'epic',
    icon: '🍖',
    category: 'powerups',
    effect: 'pet_speed_boost'
  },
  {
    id: 'luck_charm',
    name: 'Lucky Charm',
    description: 'Increase your loot box luck for 24 hours',
    price: 5,
    type: 'powerup',
    rarity: 'common',
    icon: '🍀',
    category: 'powerups',
    effect: 'luck_boost_24h'
  },
  
  // Loot Boxes
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    description: 'Contains 3 random items',
    price: 4,
    type: 'lootbox',
    rarity: 'common',
    icon: '📦',
    category: 'lootboxes',
    contents: { count: 3, rarityBonus: 0 }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    description: 'Contains 5 random items with better odds',
    price: 8,
    type: 'lootbox',
    rarity: 'rare',
    icon: '🎁',
    category: 'lootboxes',
    contents: { count: 5, rarityBonus: 15 }
  },
  {
    id: 'legendary_box',
    name: 'Legendary Loot Box',
    description: 'Contains 7 items with guaranteed rare+',
    price: 15,
    type: 'lootbox',
    rarity: 'legendary',
    icon: '💎',
    category: 'lootboxes',
    contents: { count: 7, rarityBonus: 30, guaranteedRare: true }
  },
  
  // Collectibles
  {
    id: 'trophy_bronze',
    name: 'Bronze Trophy',
    description: 'A symbol of your achievements',
    price: 5,
    type: 'collectible',
    rarity: 'common',
    icon: '🥉',
    category: 'trophies'
  },
  {
    id: 'trophy_silver',
    name: 'Silver Trophy',
    description: 'Shining bright with success',
    price: 10,
    type: 'collectible',
    rarity: 'rare',
    icon: '🥈',
    category: 'trophies'
  },
  {
    id: 'trophy_gold',
    name: 'Gold Trophy',
    description: 'The ultimate achievement',
    price: 20,
    type: 'collectible',
    rarity: 'epic',
    icon: '🥇',
    category: 'trophies'
  }
];

const LOOT_BOX_ITEMS = [
  // Common Items
  { id: 'coin_small', name: 'Coin Pouch', icon: '💰', rarity: 'common', effect: 'coins_1' },
  { id: 'sticker_star', name: 'Star Sticker', icon: '⭐', rarity: 'common', effect: 'cosmetic' },
  { id: 'pencil', name: 'Magic Pencil', icon: '✏️', rarity: 'common', effect: 'cosmetic' },
  { id: 'eraser', name: 'Lucky Eraser', icon: '🔸', rarity: 'common', effect: 'cosmetic' },
  
  // Rare Items
  { id: 'coin_medium', name: 'Coin Bag', icon: '💎', rarity: 'rare', effect: 'coins_3' },
  { id: 'rainbow_sticker', name: 'Rainbow Sticker', icon: '🌈', rarity: 'rare', effect: 'cosmetic' },
  { id: 'magic_wand', name: 'Magic Wand', icon: '🪄', rarity: 'rare', effect: 'cosmetic' },
  { id: 'pet_toy', name: 'Pet Toy', icon: '🧸', rarity: 'rare', effect: 'pet_happiness' },
  
  // Epic Items
  { id: 'coin_large', name: 'Treasure Chest', icon: '💰', rarity: 'epic', effect: 'coins_5' },
  { id: 'crystal_ball', name: 'Crystal Ball', icon: '🔮', rarity: 'epic', effect: 'cosmetic' },
  { id: 'spell_book', name: 'Ancient Spell Book', icon: '📚', rarity: 'epic', effect: 'xp_boost' },
  { id: 'golden_apple', name: 'Golden Apple', icon: '🍎', rarity: 'epic', effect: 'teacher_favorite' },
  
  // Legendary Items
  { id: 'coin_jackpot', name: 'Jackpot!', icon: '🎰', rarity: 'legendary', effect: 'coins_10' },
  { id: 'unicorn', name: 'Unicorn Friend', icon: '🦄', rarity: 'legendary', effect: 'pet_legendary' },
  { id: 'infinity_gem', name: 'Infinity Gem', icon: '💎', rarity: 'legendary', effect: 'permanent_buff' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🔥', rarity: 'legendary', effect: 'resurrection' }
];

// UPDATED: Quest templates now award COINS instead of XP
const DEFAULT_QUEST_TEMPLATES = [
  // Daily Quests - Award 1 coin each
  {
    id: 'daily-respectful-5',
    title: 'Be Respectful',
    description: 'Earn 5 Respectful points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
    reward: { type: 'COINS', amount: 1 }, // Changed from XP to COINS
    icon: '👍'
  },
  {
    id: 'daily-responsible-3',
    title: 'Show Responsibility',
    description: 'Earn 3 Responsible points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Responsible', amount: 3 },
    reward: { type: 'COINS', amount: 1 }, // Changed from XP to COINS
    icon: '💼'
  },
  {
    id: 'daily-learner-4',
    title: 'Learning Champion',
    description: 'Earn 4 Learner points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Learner', amount: 4 },
    reward: { type: 'COINS', amount: 1 }, // Changed from XP to COINS
    icon: '📚'
  },
  {
    id: 'daily-homework',
    title: 'Homework Hero',
    description: 'Complete and submit homework',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'manual', description: 'Teacher verification required' },
    reward: { type: 'COINS', amount: 1 }, // Changed from XP to COINS
    icon: '📝'
  },
  // Weekly Quests - Award 5 coins each
  {
    id: 'weekly-total-xp',
    title: 'XP Champion',
    description: 'Earn 50 total XP this week',
    type: 'weekly',
    category: 'individual',
    requirement: { type: 'total_xp', amount: 50 },
    reward: { type: 'COINS', amount: 5 }, // Changed from XP to COINS
    icon: '⭐'
  },
  {
    id: 'weekly-attendance',
    title: 'Perfect Attendance',
    description: 'Attend all classes this week',
    type: 'weekly',
    category: 'individual',
    requirement: { type: 'manual', description: 'Teacher verification required' },
    reward: { type: 'COINS', amount: 5 }, // Changed from XP to COINS
    icon: '🎯'
  },
  {
    id: 'weekly-class-goal',
    title: 'Class Unity',
    description: 'Whole class earns 200 total XP',
    type: 'weekly',
    category: 'class',
    requirement: { type: 'class_total_xp', amount: 200 },
    reward: { type: 'COINS', amount: 5 }, // Changed from XP to COINS
    icon: '🏆'
  },
  {
    id: 'weekly-pet-race',
    title: 'Racing Champion',
    description: 'Win 2 pet races this week',
    type: 'weekly',
    category: 'individual',
    requirement: { type: 'pet_wins', amount: 2 },
    reward: { type: 'COINS', amount: 5 }, // Changed from XP to COINS
    icon: '🏁'
  }
];

const AVAILABLE_AVATARS = [
  { base: "Alchemist F", path: "/avatars/Alchemist%20F/Level%201.png" },
  { base: "Alchemist M", path: "/avatars/Alchemist%20M/Level%201.png" },
  { base: "Archer F", path: "/avatars/Archer%20F/Level%201.png" },
  { base: "Archer M", path: "/avatars/Archer%20M/Level%201.png" },
  { base: "Barbarian F", path: "/avatars/Barbarian%20F/Level%201.png" },
  { base: "Barbarian M", path: "/avatars/Barbarian%20M/Level%201.png" },
  { base: "Bard F", path: "/avatars/Bard%20F/Level%201.png" },
  { base: "Bard M", path: "/avatars/Bard%20M/Level%201.png" },
  { base: "Beastmaster F", path: "/avatars/Beastmaster%20F/Level%201.png" },
  { base: "Beastmaster M", path: "/avatars/Beastmaster%20M/Level%201.png" },
  { base: "Cleric F", path: "/avatars/Cleric%20F/Level%201.png" },
  { base: "Cleric M", path: "/avatars/Cleric%20M/Level%201.png" },
  { base: "Crystal Sage F", path: "/avatars/Crystal%20Sage%20F/Level%201.png" },
  { base: "Crystal Sage M", path: "/avatars/Crystal%20Sage%20M/Level%201.png" },
  { base: "Druid F", path: "/avatars/Druid%20F/Level%201.png" },
  { base: "Druid M", path: "/avatars/Druid%20M/Level%201.png" },
  { base: "Engineer F", path: "/avatars/Engineer%20F/Level%201.png" },
  { base: "Engineer M", path: "/avatars/Engineer%20M/Level%201.png" },
  { base: "Ice Mage F", path: "/avatars/Ice%20Mage%20F/Level%201.png" },
  { base: "Ice Mage M", path: "/avatars/Ice%20Mage%20M/Level%201.png" },
  { base: "Illusionist F", path: "/avatars/Illusionist%20F/Level%201.png" },
  { base: "Illusionist M", path: "/avatars/Illusionist%20M/Level%201.png" },
  { base: "Knight F", path: "/avatars/Knight%20F/Level%201.png" },
  { base: "Knight M", path: "/avatars/Knight%20M/Level%201.png" },
  { base: "Monk F", path: "/avatars/Monk%20F/Level%201.png" },
  { base: "Monk M", path: "/avatars/Monk%20M/Level%201.png" },
  { base: "Necromancer F", path: "/avatars/Necromancer%20F/Level%201.png" },
  { base: "Necromancer M", path: "/avatars/Necromancer%20M/Level%201.png" },
  { base: "Orc F", path: "/avatars/Orc%20F/Level%201.png" },
  { base: "Orc M", path: "/avatars/Orc%20M/Level%201.png" },
  { base: "Paladin F", path: "/avatars/Paladin%20F/Level%201.png" },
  { base: "Paladin M", path: "/avatars/Paladin%20M/Level%201.png" },
  { base: "Rogue F", path: "/avatars/Rogue%20F/Level%201.png" },
  { base: "Rogue M", path: "/avatars/Rogue%20M/Level%201.png" },
  { base: "Sky Knight F", path: "/avatars/Sky%20Knight%20F/Level%201.png" },
  { base: "Sky Knight M", path: "/avatars/Sky%20Knight%20M/Level%201.png" },
  { base: "Time Mage F", path: "/avatars/Time%20Mage%20F/Level%201.png" },
  { base: "Time Mage M", path: "/avatars/Time%20Mage%20M/Level%201.png" },
  { base: "Wizard F", path: "/avatars/Wizard%20F/Level%201.png" },
  { base: "Wizard M", path: "/avatars/Wizard%20M/Level%201.png" }
];

const PETS = [
  "Alchemist", "Barbarian", "Bard", "Beastmaster", "Cleric", "Crystal Knight",
  "Crystal Sage", "Dream", "Druid", "Engineer", "Frost Mage", "Illusionist",
  "Knight", "Lightning", "Monk", "Necromancer", "Orc", "Paladin", "Rogue",
  "Stealth", "Time Knight", "Warrior", "Wizard"
];

const PET_NAMES = [
  "Flamepaw", "Shadowtail", "Brightfang", "Mysticwhisker", "Stormclaw",
  "Ironhoof", "Swiftbeak", "Frostwhisker", "Moonfang", "Nightclaw"
];

// ===============================================
// UTILITY FUNCTIONS - UPDATED FOR SEPARATE COINS
// ===============================================

const calculateCoins = (student) => {
  // NEW: Use actual coins field instead of XP calculation
  return student?.coins || 0;
};

const canAfford = (student, cost) => {
  const coins = calculateCoins(student);
  return coins >= cost;
};

const spendCoins = (student, cost) => {
  const coins = calculateCoins(student);
  if (coins >= cost) {
    return {
      ...student,
      coins: Math.max(0, (student.coins || 0) - cost),
      coinsSpent: (student.coinsSpent || 0) + cost,
      logs: [
        ...(student.logs || []),
        {
          type: "purchase",
          amount: -cost,
          date: new Date().toISOString(),
          source: "shop_purchase",
        },
      ],
    };
  }
  return student;
};

// NEW: Function to award actual coins (no XP involved)
const awardCoins = (student, coinAmount) => {
  return {
    ...student,
    coins: (student.coins || 0) + coinAmount,
    logs: [
      ...(student.logs || []),
      {
        type: "quest_coins",
        amount: coinAmount,
        date: new Date().toISOString(),
        source: "quest_completion",
      },
    ],
  };
};

const generateLootBoxRewards = (lootBox) => {
  const rewards = [];
  const { count, rarityBonus, guaranteedRare } = lootBox.contents;
  
  for (let i = 0; i < count; i++) {
    let rarity = 'common';
    const roll = Math.random() * 100;
    
    // Apply rarity bonus
    const adjustedRoll = roll - (rarityBonus || 0);
    
    if (adjustedRoll <= ITEM_RARITIES.legendary.chance) {
      rarity = 'legendary';
    } else if (adjustedRoll <= ITEM_RARITIES.epic.chance) {
      rarity = 'epic';
    } else if (adjustedRoll <= ITEM_RARITIES.rare.chance) {
      rarity = 'rare';
    } else {
      rarity = 'common';
    }
    
    // Guarantee at least one rare+ item for premium boxes
    if (guaranteedRare && i === 0 && rarity === 'common') {
      rarity = 'rare';
    }
    
    const availableItems = LOOT_BOX_ITEMS.filter(item => item.rarity === rarity);
    const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
    
    rewards.push({
      ...randomItem,
      id: `${randomItem.id}_${Date.now()}_${i}`,
      obtainedAt: new Date().toISOString()
    });
  }
  
  return rewards;
};

const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    coins: student.coins || 0, // NEW: Separate coins field
    coinsSpent: student.coinsSpent || 0,
    inventory: student.inventory || [],
    lootBoxes: student.lootBoxes || [],
    achievements: student.achievements || [],
    lastXpDate: student.lastXpDate || null
  };
};

const getAvatarImage = (base, level) => {
  return `/avatars/${base.replaceAll(" ", "%20")}/Level%20${level}.png`;
};

const getRandomPet = () => {
  const type = PETS[Math.floor(Math.random() * PETS.length)];
  return {
    image: `/Pets/${type}.png`,
    level: 1,
    speed: 1,
    wins: 0,
    name: ''
  };
};

const getRandomPetName = () => {
  return PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
};

const calculateSpeed = (pet) => {
  const baseSpeed = pet.speed || 1;
  const level = pet.level || 1;
  
  // Very small level bonus to keep races competitive
  const levelBonus = (level - 1) * 0.05;
  
  return Math.max(baseSpeed + levelBonus, 0.8);
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
};

const getWeekEnd = () => {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return weekEnd;
};

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Tab Loading component
const TabLoadingSpinner = () => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading tab content...</p>
      </div>
    </div>
  </div>
);

// Currency Display Component - Updated for separate coins
const CurrencyDisplay = ({ student }) => {
  const coins = calculateCoins(student);
  const coinsSpent = student?.coinsSpent || 0;
  
  return (
    <div className="flex items-center space-x-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">💰</div>
        <div className="text-sm text-yellow-700">Available</div>
        <div className="text-lg font-bold text-yellow-800">{coins}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">🛍️</div>
        <div className="text-sm text-gray-700">Spent</div>
        <div className="text-lg font-bold text-gray-800">{coinsSpent}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">⭐</div>
        <div className="text-sm text-blue-700">Total XP</div>
        <div className="text-lg font-bold text-blue-800">{student?.totalPoints || 0}</div>
      </div>
    </div>
  );
};

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function ClassroomChampions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('');
  const [levelUpData, setLevelUpData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [petNameInput, setPetNameInput] = useState('');

  // Avatar selection states
  const [showAvatarSelectionModal, setShowAvatarSelectionModal] = useState(false);
  const [studentForAvatarChange, setStudentForAvatarChange] = useState(null);

  // Race states
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('XP');
  const [xpAmount, setXpAmount] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showRaceSetup, setShowRaceSetup] = useState(false);

  // Class management states
  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);

  // Multiple XP award states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkXpAmount, setBulkXpAmount] = useState(1);
  const [bulkXpCategory, setBulkXpCategory] = useState('Respectful');
  const [showBulkXpPanel, setShowBulkXpPanel] = useState(false);

  // Quest system states
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState([]);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  const [showQuestCompletion, setShowQuestCompletion] = useState(false);

  // Settings states
  const [userData, setUserData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // UX states
  const [savingData, setSavingData] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');
  const [animatingXP, setAnimatingXP] = useState({});

  // ===============================================
  // FUNCTION DEFINITIONS (BEFORE tabProps)
  // ===============================================

  const showToast = (message) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(''), 3000);
  };

  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, students: updatedStudents }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Student data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving student data:", error);
    }
  };

  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...questData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
      }
    } catch (error) {
      console.error("❌ Error saving quest data:", error);
    }
  };

  const generateDailyQuests = () => {
    const dailyTemplates = questTemplates.filter(t => t.type === 'daily');
    const selectedQuests = dailyTemplates.slice(0, 3).map(template => ({
      ...template,
      id: `daily-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      completedBy: [],
      active: true
    }));
    return selectedQuests;
  };

  const generateWeeklyQuests = () => {
    const weeklyTemplates = questTemplates.filter(t => t.type === 'weekly');
    const selectedQuests = weeklyTemplates.slice(0, 2).map(template => ({
      ...template,
      id: `weekly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate: getWeekStart().toISOString().split('T')[0],
      endDate: getWeekEnd().toISOString().split('T')[0],
      completedBy: [],
      active: true
    }));
    return selectedQuests;
  };

  const checkIndividualQuestCompletion = (quest, studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return false;

    const { requirement } = quest;
    
    switch (requirement.type) {
      case 'xp':
        const categoryPoints = student.categoryWeekly?.[requirement.category] || 0;
        return categoryPoints >= requirement.amount;
      case 'total_xp':
        return student.weeklyPoints >= requirement.amount;
      case 'pet_wins':
        return (student.pet?.wins || 0) >= requirement.amount;
      case 'manual':
        return quest.completedBy.includes(studentId);
      default:
        return false;
    }
  };

  const checkClassQuestCompletion = (quest) => {
    const { requirement } = quest;
    
    switch (requirement.type) {
      case 'class_total_xp':
        const totalClassXP = students.reduce((sum, s) => sum + (s.weeklyPoints || 0), 0);
        return totalClassXP >= requirement.amount;
      case 'manual':
        return quest.completedBy.includes('class');
      default:
        return false;
    }
  };

  const checkClassQuestCompletionSafely = (quest, studentsArray) => {
    const { requirement } = quest;
    
    switch (requirement.type) {
      case 'class_total_xp':
        const totalClassXP = studentsArray.reduce((sum, s) => sum + (s.weeklyPoints || 0), 0);
        return totalClassXP >= requirement.amount;
      case 'manual':
        return quest.completedBy.includes('class');
      default:
        return false;
    }
  };

  const checkQuestCompletion = (questId, studentId = null) => {
    const quest = [...dailyQuests, ...weeklyQuests].find(q => q.id === questId);
    if (!quest) return false;

    if (quest.category === 'class') {
      return checkClassQuestCompletion(quest);
    } else {
      return checkIndividualQuestCompletion(quest, studentId);
    }
  };

  // UPDATED: Quest completion function that awards COINS instead of XP
  const completeQuest = (questId, studentId = null) => {
    const quest = [...dailyQuests, ...weeklyQuests].find(q => q.id === questId);
    if (!quest) return;

    const completionKey = studentId || 'class';
    if (quest.completedBy.includes(completionKey)) return;

    console.log(`🏆 Completing quest ${quest.id} for ${completionKey} - COIN reward system`);

    // Update quest completion
    const updatedDailyQuests = dailyQuests.map(q => 
      q.id === questId ? { ...q, completedBy: [...q.completedBy, completionKey] } : q
    );
    const updatedWeeklyQuests = weeklyQuests.map(q => 
      q.id === questId ? { ...q, completedBy: [...q.completedBy, completionKey] } : q
    );

    setDailyQuests(updatedDailyQuests);
    setWeeklyQuests(updatedWeeklyQuests);

    // UPDATED: Award coin rewards instead of XP
    if (quest.reward.type === 'COINS') {
      setStudents(prev => {
        const rewardedStudents = prev.map(student => {
          if (studentId && student.id !== studentId) return student;
          
          if (!studentId || student.id === studentId) {
            // Award coins by adding equivalent XP (but track as coins in logs)
            return awardCoins(student, quest.reward.amount);
          }
          return student;
        });
        
        saveStudentsToFirebase(rewardedStudents);
        return rewardedStudents;
      });
    } else if (quest.reward.type === 'XP') {
      // Handle legacy XP rewards for custom quests
      setStudents(prev => {
        const rewardedStudents = prev.map(student => {
          if (studentId && student.id !== studentId) return student;
          
          if (!studentId || student.id === studentId) {
            const newTotal = student.totalPoints + quest.reward.amount;
            return {
              ...student,
              totalPoints: newTotal,
              weeklyPoints: (student.weeklyPoints || 0) + quest.reward.amount,
              categoryTotal: {
                ...student.categoryTotal,
                'Quest': (student.categoryTotal['Quest'] || 0) + quest.reward.amount,
              },
              categoryWeekly: {
                ...student.categoryWeekly,
                'Quest': (student.categoryWeekly['Quest'] || 0) + quest.reward.amount,
              },
              logs: [
                ...(student.logs || []),
                {
                  type: 'Quest',
                  amount: quest.reward.amount,
                  date: new Date().toISOString(),
                  source: `quest_${quest.id}`,
                },
              ],
            };
          }
          return student;
        });
        
        saveStudentsToFirebase(rewardedStudents);
        return rewardedStudents;
      });
    }

    // FIXED: Show completion modal immediately and update states synchronously
    setQuestCompletionData({
      quest,
      studentId,
      student: studentId ? students.find(s => s.id === studentId) : null
    });
    setShowQuestCompletion(true);

    // Save to Firebase
    saveQuestDataToFirebase({
      dailyQuests: updatedDailyQuests,
      weeklyQuests: updatedWeeklyQuests
    });
  };

  // ENHANCED: Quest completion check - now simpler since coins don't affect XP
  const checkQuestCompletionSafely = (studentId, updatedStudents) => {
    const student = updatedStudents.find(s => s.id === studentId);
    if (!student) return;

    console.log(`🎯 Checking quest completion for student ${studentId}`);

    // Check individual quests
    [...dailyQuests, ...weeklyQuests].forEach(quest => {
      if (quest.category === 'individual' && !quest.completedBy.includes(studentId)) {
        // IMPORTANT: Only check quests that were created AFTER the student's last XP gain
        // This prevents retroactive quest completion for existing students
        const questCreatedDate = new Date(quest.startDate);
        const studentLastActive = student.lastXpDate ? new Date(student.lastXpDate) : new Date('2024-01-01');
        
        // Only trigger quest completion if:
        // 1. The student gained XP AFTER the quest was created, OR
        // 2. The student is newly created (no lastXpDate), OR
        // 3. The quest was created today (new quests should work immediately)
        const today = new Date().toISOString().split('T')[0];
        const isNewQuest = quest.startDate === today;
        
        if (questCreatedDate <= studentLastActive || !student.lastXpDate || isNewQuest) {
          if (checkIndividualQuestCompletion(quest, studentId)) {
            console.log(`✅ Quest ${quest.id} completed by ${studentId} - showing modal and awarding coins`);
            // Use the NORMAL complete quest function to show modal and award coins
            setTimeout(() => completeQuest(quest.id, studentId), 100);
          }
        }
      }
    });

    // Check class quests (these can be retroactive since they're class-wide)
    [...dailyQuests, ...weeklyQuests].forEach(quest => {
      if (quest.category === 'class' && !quest.completedBy.includes('class')) {
        if (checkClassQuestCompletionSafely(quest, updatedStudents)) {
          console.log(`✅ Class quest ${quest.id} completed - showing modal and awarding coins`);
          // Use the NORMAL complete quest function to show modal and award coins
          setTimeout(() => completeQuest(quest.id, null), 100);
        }
      }
    });
  };

  const markQuestComplete = (questId, studentId = null) => {
    // For manual quests, mark as completed
    completeQuest(questId, studentId);
    showToast('Quest marked as complete!');
  };

  const checkForLevelUp = (student) => {
    const nextLevel = student.avatarLevel + 1;
    const xpNeeded = student.avatarLevel * 100;
    if (student.totalPoints >= xpNeeded && student.avatarLevel < MAX_LEVEL) {
      const newAvatar = getAvatarImage(student.avatarBase, nextLevel);
      setLevelUpData({
        name: student.firstName,
        oldAvatar: student.avatar,
        newAvatar,
      });
      return {
        ...student,
        avatarLevel: nextLevel,
        avatar: newAvatar,
      };
    }
    return student;
  };

  const handleAvatarClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentForAvatarChange(student);
      setShowAvatarSelectionModal(true);
    }
  };

  const handleAvatarChange = async (avatarBase) => {
    if (!studentForAvatarChange) return;

    setSavingData(true);
    const newAvatar = getAvatarImage(avatarBase, studentForAvatarChange.avatarLevel);
    
    setStudents(prev => {
      const updatedStudents = prev.map(student => 
        student.id === studentForAvatarChange.id 
          ? { ...student, avatarBase, avatar: newAvatar }
          : student
      );
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    try {
      showToast('Avatar updated successfully!');
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setSavingData(false);
    }

    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
  };

  // WORKING: Award XP function with tracking of last XP date
  const handleAwardXP = (id, category, amount = 1) => {
    // Prevent rapid firing
    if (animatingXP[id]) return;
    
    console.log(`🎯 Awarding ${amount} XP to student ${id} in category ${category}`);
    
    setAnimatingXP(prev => ({ ...prev, [id]: category }));
    setTimeout(() => setAnimatingXP(prev => ({ ...prev, [id]: null })), 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (s.id !== id) return s;

        const newTotal = s.totalPoints + amount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: (s.weeklyPoints || 0) + amount,
          lastXpDate: new Date().toISOString(), // Track when XP was last awarded
          categoryTotal: {
            ...s.categoryTotal,
            [category]: (s.categoryTotal[category] || 0) + amount,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [category]: (s.categoryWeekly[category] || 0) + amount,
          },
          logs: [
            ...(s.logs || []),
            {
              type: category,
              amount: amount,
              date: new Date().toISOString(),
              source: "manual",
            },
          ],
        };

        // Pet unlock check
        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: s.id,
            firstName: s.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);
      
      // Quest completion check with modal and coin rewards
      checkQuestCompletionSafely(id, updatedStudents);
      
      return updatedStudents;
    });
  };

  // Student selection functions
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
  };

  const handleBulkXpAward = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    setSavingData(true);
    
    // Animate all selected students
    selectedStudents.forEach(id => {
      setAnimatingXP(prev => ({ ...prev, [id]: bulkXpCategory }));
    });

    setTimeout(() => {
      selectedStudents.forEach(id => {
        setAnimatingXP(prev => ({ ...prev, [id]: null }));
      });
    }, 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (!selectedStudents.includes(s.id)) return s;

        const newTotal = s.totalPoints + bulkXpAmount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: (s.weeklyPoints || 0) + bulkXpAmount,
          lastXpDate: new Date().toISOString(), // Track XP date
          categoryTotal: {
            ...s.categoryTotal,
            [bulkXpCategory]: (s.categoryTotal[bulkXpCategory] || 0) + bulkXpAmount,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [bulkXpCategory]: (s.categoryWeekly[bulkXpCategory] || 0) + bulkXpAmount,
          },
          logs: [
            ...(s.logs || []),
            {
              type: bulkXpCategory,
              amount: bulkXpAmount,
              date: new Date().toISOString(),
              source: "bulk",
            },
          ],
        };

        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: s.id,
            firstName: s.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);

      // Quest completion for each student
      selectedStudents.forEach(studentId => {
        checkQuestCompletionSafely(studentId, updatedStudents);
      });

      return updatedStudents;
    });

    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    setSavingData(false);
    
    const studentNames = selectedStudents.length === students.length 
      ? 'the entire class'
      : `${selectedStudents.length} students`;
    
    showToast(`Awarded ${bulkXpAmount} XP to ${studentNames}!`);
  };

  // ENHANCED: Settings functions with proper resets
  const handleDeductXP = (studentId, amount) => {
    if (amount <= 0) {
      alert("Please enter a positive amount");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId ? {
          ...s,
          totalPoints: Math.max(0, s.totalPoints - amount),
          weeklyPoints: Math.max(0, (s.weeklyPoints || 0) - amount),
          logs: [
            ...(s.logs || []),
            {
              type: "deduction",
              amount: -amount,
              date: new Date().toISOString(),
              source: "manual_deduction",
            },
          ],
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast(`Deducted ${amount} XP successfully!`);
  };

  const handleDeductCurrency = (studentId, coinAmount) => {
    if (coinAmount <= 0) {
      alert("Please enter a positive amount");
      return;
    }
    
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== studentId) return s;
        
        const currentCoins = calculateCoins(s);
        if (currentCoins < coinAmount) {
          alert(`Student only has ${currentCoins} coins available`);
          return s;
        }
        
        return {
          ...s,
          coins: Math.max(0, (s.coins || 0) - coinAmount),
          logs: [
            ...(s.logs || []),
            {
              type: "currency_deduction",
              amount: -coinAmount,
              date: new Date().toISOString(),
              source: "manual_currency_deduction",
            },
          ],
        };
      });
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast(`Deducted ${coinAmount} coins successfully!`);
  };

  // ENHANCED: Reset functions that properly reset everything including coins
  const handleResetStudentPoints = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId ? {
          ...s,
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          // Reset avatar to level 1
          avatarLevel: 1,
          avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
          // Remove pet completely
          pet: null,
          // Clear inventory, currency, and coins
          coins: 0, // NEW: Reset separate coins
          inventory: [],
          lootBoxes: [],
          coinsSpent: 0,
          logs: [
            ...(s.logs || []),
            {
              type: "full_reset",
              amount: 0,
              date: new Date().toISOString(),
              source: "complete_reset",
            },
          ],
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student completely reset successfully!');
  };

  const handleResetAllPoints = async () => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => ({
        ...s,
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        // Reset avatar to level 1
        avatarLevel: 1,
        avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
        // Remove pets completely
        pet: null,
        // Clear inventory, currency, and coins
        coins: 0, // NEW: Reset separate coins
        inventory: [],
        lootBoxes: [],
        coinsSpent: 0,
        logs: [
          ...(s.logs || []),
          {
            type: "bulk_reset",
            amount: 0,
            date: new Date().toISOString(),
            source: "bulk_reset",
          },
        ],
      }));
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('All students completely reset successfully!');
  };

  const handleResetPetSpeeds = async () => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.pet ? {
          ...s,
          pet: {
            ...s.pet,
            speed: 1,
            wins: 0
          }
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Pet speeds reset successfully!');
  };

  const handleRemoveStudent = async (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.filter(s => s.id !== studentId);
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student removed successfully!');
  };

  const handleSubmitFeedback = async () => {
    setSavingData(true);
    
    try {
      // Here you would typically send to your backend API
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setFeedbackSubject('');
      setFeedbackMessage('');
      setFeedbackEmail('');
      setShowFeedbackModal(false);
      
      showToast('Feedback submitted successfully!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setSavingData(false);
    }
  };

  const handleSubscriptionManagement = async () => {
    if (!userData?.stripeCustomerId) {
      // Redirect to upgrade page
      router.push('/pricing');
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userData.stripeCustomerId })
      });

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Error opening billing portal. Please try again.');
    }
  };

  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      alert("Please fill in both class name and student names");
      return;
    }

    setSavingData(true);

    const studentsArray = newClassStudents
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => {
        return updateStudentWithCurrency({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          firstName: name,
          avatarBase: '',
          avatarLevel: 1,
          avatar: '',
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          coins: 0, // NEW: Initialize with 0 coins
          logs: [],
          pet: null
        });
      });

    const newClass = {
      id: 'class-' + Date.now(),
      name: newClassName,
      students: studentsArray,
      dailyQuests: [],
      weeklyQuests: [],
      questTemplates: DEFAULT_QUEST_TEMPLATES
    };

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      const existingData = snap.exists() ? snap.data() : { subscription: 'basic', classes: [] };
      const maxAllowed = existingData.subscription === 'pro' ? 5 : 1;

      if (existingData.classes.length >= maxAllowed) {
        alert(`Your plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
        return;
      }

      const updatedClasses = [...existingData.classes, newClass];
      await setDoc(docRef, { ...existingData, classes: updatedClasses });

      setTeacherClasses(updatedClasses);
      setStudents(newClass.students);
      setCurrentClassId(newClass.id);
      setDailyQuests([]);
      setWeeklyQuests([]);
      setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
      setNewClassName('');
      setNewClassStudents('');
      showToast('Class imported successfully!');
    } catch (error) {
      console.error("Error importing class:", error);
      alert("Error importing class. Please try again.");
    } finally {
      setSavingData(false);
    }
  };

  const loadClass = (cls) => {
    const studentsWithCurrency = cls.students.map(updateStudentWithCurrency);
    setStudents(studentsWithCurrency);
    setCurrentClassId(cls.id);
    setDailyQuests(cls.dailyQuests || []);
    setWeeklyQuests(cls.weeklyQuests || []);
    setQuestTemplates(cls.questTemplates || DEFAULT_QUEST_TEMPLATES);
    setSelectedStudents([]); // Clear selections when switching classes
    setShowBulkXpPanel(false);
    showToast(`${cls.name} loaded successfully!`);
  };

  // ENHANCED: Shop functions
  const handleShopStudentSelect = (student) => {
    console.log('Shop: Selected student:', student);
    setSelectedStudent(student);
    // Don't open character sheet in shop - just select the student
  };

  const handleShopPurchase = (student, item) => {
                  const coins = calculateCoins(student);
    const cost = item.price;
    
    console.log(`Purchase attempt: ${student.firstName} buying ${item.name} for ${cost} coins (has ${coins})`);
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins! Needs ${cost}, has ${coins}`);
      return;
    }

    setSavingData(true);
    
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== student.id) return s;
        
        const updatedStudent = spendCoins(s, cost);
        
        // Add item to inventory
        const newItem = {
          ...item,
          id: `${item.id}_${Date.now()}`,
          purchasedAt: new Date().toISOString()
        };
        
        return {
          ...updatedStudent,
          inventory: [...(updatedStudent.inventory || []), newItem]
        };
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    showToast(`${student.firstName} purchased ${item.name}!`);
  };

  const handleLootBoxPurchase = (student, lootBox) => {
    const coins = calculateCoins(student.totalPoints || 0);
    const cost = lootBox.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    setSavingData(true);
    
    // Generate rewards
    const rewards = generateLootBoxRewards(lootBox);
    
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== student.id) return s;
        
        const updatedStudent = spendCoins(s, cost);
        
        return {
          ...updatedStudent,
          lootBoxes: [...(updatedStudent.lootBoxes || []), {
            boxType: lootBox.id,
            rewards: rewards,
            openedAt: new Date().toISOString()
          }]
        };
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    
    // Show rewards modal or toast
    const rewardsList = rewards.map(r => r.name).join(', ');
    showToast(`${student.firstName} opened ${lootBox.name} and got: ${rewardsList}!`);
  };

  // Debug functions
  const debugCurrencySystem = () => {
    console.log('=== CURRENCY DEBUG ===');
    students.forEach(student => {
      const coins = calculateCoins(student);
      console.log(`${student.firstName}: ${student.totalPoints} XP, ${coins} coins (separate fields)`);
    });
    
    showToast('Check console for currency debug info');
  };

  // Quick fix function for existing users - migrate to separate coins
  const quickFixForExistingUsers = () => {
    console.log('🔧 Applying quick fixes for existing users...');
    
    // 1. Reset quest progress to prevent retroactive completions
    setDailyQuests(prev => prev.map(q => ({ ...q, completedBy: [] })));
    setWeeklyQuests(prev => prev.map(q => ({ ...q, completedBy: [] })));
    
    // 2. Migrate students to separate coin system
    setStudents(prev => {
      const updatedStudents = prev.map(student => ({
        ...student,
        lastXpDate: new Date().toISOString(),
        // Migrate to separate coins: give them coins based on their current XP
        coins: student.coins || Math.floor((student.totalPoints || 0) / 5),
        coinsSpent: student.coinsSpent || 0,
        inventory: student.inventory || [],
        lootBoxes: student.lootBoxes || [],
      }));
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    showToast('✅ Applied fixes and migrated to separate coin system!');
    console.log('✅ Quick fixes applied successfully');
  };

  const resetQuestProgressForExistingStudents = () => {
    setStudents(prev => {
      const updatedStudents = prev.map(student => ({
        ...student,
        lastXpDate: new Date().toISOString(), // Set current date to prevent retroactive quests
      }));
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    // Also clear all current quest completions
    setDailyQuests(prev => prev.map(q => ({ ...q, completedBy: [] })));
    setWeeklyQuests(prev => prev.map(q => ({ ...q, completedBy: [] })));
    
    showToast('Quest progress reset for all students!');
  };

  // Props object for all tabs
  const tabProps = {
    students,
    setStudents,
    setActiveTab,
    handleAwardXP,
    handleAvatarClick,
    setSelectedStudent,
    animatingXP,
    setShowAddStudentModal,
    // Multiple XP props
    selectedStudents,
    setSelectedStudents,
    handleStudentSelect,
    handleSelectAll,
    handleDeselectAll,
    showBulkXpPanel,
    setShowBulkXpPanel,
    bulkXpAmount,
    setBulkXpAmount,
    bulkXpCategory,
    setBulkXpCategory,
    handleBulkXpAward,
    // Quest props
    dailyQuests,
    weeklyQuests,
    questTemplates,
    setQuestTemplates,
    checkQuestCompletion,
    completeQuest,
    markQuestComplete,
    generateDailyQuests,
    generateWeeklyQuests,
    setDailyQuests,
    setWeeklyQuests,
    saveQuestDataToFirebase,
    // Race props
    raceInProgress,
    raceFinished,
    racePositions,
    setRacePositions,
    raceWinner,
    setRaceWinner,
    selectedPrize,
    setSelectedPrize,
    xpAmount,
    setXpAmount,
    selectedPets,
    setSelectedPets,
    showRaceSetup,
    setShowRaceSetup,
    setRaceInProgress,
    setRaceFinished,
    calculateSpeed,
    checkForLevelUp,
    saveStudentsToFirebase,
    // Class props
    newClassName,
    setNewClassName,
    newClassStudents,
    setNewClassStudents,
    teacherClasses,
    setTeacherClasses,
    currentClassId,
    setCurrentClassId,
    handleClassImport,
    loadClass,
    savingData,
    showToast,
    // Enhanced Settings props
    userData,
    user,
    handleResetStudentPoints,
    handleResetAllPoints,
    handleResetPetSpeeds,
    handleRemoveStudent,
    handleSubscriptionManagement,
    setShowConfirmDialog,
    setShowFeedbackModal,
    feedbackType,
    setFeedbackType,
    feedbackSubject,
    setFeedbackSubject,
    feedbackMessage,
    setFeedbackMessage,
    feedbackEmail,
    setFeedbackEmail,
    handleSubmitFeedback,
    showFeedbackModal,
    router,
    // Enhanced Currency & Shop props
    selectedStudent,
    setSelectedStudent,
    calculateCoins,
    canAfford,
    spendCoins,
    SHOP_ITEMS,
    ITEM_RARITIES,
    LOOT_BOX_ITEMS,
    generateLootBoxRewards,
    setSavingData,
    handleShopStudentSelect,
    handleShopPurchase,
    handleLootBoxPurchase,
    CurrencyDisplay,
    // Enhanced Settings Functions
    handleDeductXP,
    handleDeductCurrency,
    debugCurrencySystem,
    quickFixForExistingUsers,
    resetQuestProgressForExistingStudents
  };

  // Modal props
  const modalProps = {
    // Common
    students,
    setStudents,
    AVAILABLE_AVATARS,
    getAvatarImage,
    getRandomPetName,
    saveStudentsToFirebase,
    showToast,
    setSavingData,
    // Character sheet
    selectedStudent,
    setSelectedStudent,
    handleAvatarClick,
    // Avatar selection
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    handleAvatarChange,
    savingData,
    // Level up
    levelUpData,
    setLevelUpData,
    // Pet unlock
    petUnlockData,
    setPetUnlockData,
    petNameInput,
    setPetNameInput,
    // Add student
    showAddStudentModal,
    setShowAddStudentModal,
    newStudentName,
    setNewStudentName,
    newStudentAvatar,
    setNewStudentAvatar,
    // Race
    raceFinished,
    setRaceFinished,
    raceWinner,
    selectedPrize,
    xpAmount,
    showRaceSetup,
    setShowRaceSetup,
    selectedPets,
    setSelectedPets,
    setRacePositions,
    setRaceInProgress,
    setRaceWinner,
    // Quest completion
    questCompletionData,
    setQuestCompletionData,
    showQuestCompletion,
    setShowQuestCompletion,
    // Currency utilities
    calculateCoins
  };

  // Initialize quests when class loads
  useEffect(() => {
    if (currentClassId && questTemplates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = getWeekStart().toISOString().split('T')[0];
      
      // Generate daily quests if none exist for today
      if (dailyQuests.length === 0 || dailyQuests.every(q => q.startDate !== today)) {
        const newDailyQuests = generateDailyQuests();
        setDailyQuests(newDailyQuests);
      }
      
      // Generate weekly quests if none exist for this week
      if (weeklyQuests.length === 0 || weeklyQuests.every(q => q.startDate !== weekStart)) {
        const newWeeklyQuests = generateWeeklyQuests();
        setWeeklyQuests(newWeeklyQuests);
      }
    }
  }, [currentClassId, questTemplates]);

  // Race logic with fixed finish line
  useEffect(() => {
    if (!raceInProgress || selectedPets.length === 0) return;

    const interval = setInterval(() => {
      setRacePositions((prev) => {
        const updated = { ...prev };
        let winnerId = null;

        // More accurate finish line calculation
        const getRaceTrackWidth = () => {
          const raceTrack = document.querySelector('.race-track-container');
          if (raceTrack) {
            const rect = raceTrack.getBoundingClientRect();
            // Set finish line earlier to prevent squishing
            return rect.width - 80; // Increased buffer from 45 to 80
          }
          return 720; // Reduced fallback from 700 to 720
        };

        const trackWidth = getRaceTrackWidth();
        const FINISH_LINE_POSITION = trackWidth;

        // Check for winners BEFORE updating positions
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const currentPosition = updated[id] || 0;
          
          // Check if this pet will cross the finish line with the next step
          if (currentPosition < FINISH_LINE_POSITION) {
            const speed = calculateSpeed(student.pet);
            const baseStep = speed * 2;
            const randomMultiplier = 0.8 + Math.random() * 0.4;
            const step = baseStep * randomMultiplier;
            const nextPosition = currentPosition + step;

            // If the next position would cross the finish line, declare winner immediately
            if (nextPosition >= FINISH_LINE_POSITION && !raceFinished) {
              winnerId = id;
              
              // Set winner position exactly at finish line to prevent overrun
              updated[id] = FINISH_LINE_POSITION;
              
              // Stop all other pets at their current positions
              for (const otherId of selectedPets) {
                if (otherId !== id && updated[otherId] !== undefined) {
                  updated[otherId] = Math.min(updated[otherId] || 0, FINISH_LINE_POSITION - 10);
                }
              }
              break;
            }
          }
        }

        // If we found a winner, end the race immediately
        if (winnerId) {
          clearInterval(interval);
          
          const winner = students.find((s) => s.id === winnerId);
          setRaceWinner(winner);
          setRaceInProgress(false);
          setRaceFinished(true);

          // Award prizes
          setStudents((prev) => {
            const updatedStudents = prev.map((s) => {
              if (s.id === winnerId) {
                const updated = {
                  ...s,
                  pet: {
                    ...s.pet,
                    wins: (s.pet.wins || 0) + 1,
                    speed: (s.pet.speed || 1) + 0.02
                  },
                };

                if (selectedPrize === 'XP') {
                  updated.totalPoints = (updated.totalPoints || 0) + xpAmount;
                  return checkForLevelUp(updated);
                }

                return updated;
              }
              return s;
            });

            saveStudentsToFirebase(updatedStudents);
            return updatedStudents;
          });

          return updated; // Return the final positions
        }

        // Only update positions if no winner was found
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const speed = calculateSpeed(student.pet);
          const baseStep = speed * 2;
          const randomMultiplier = 0.8 + Math.random() * 0.4;
          const step = baseStep * randomMultiplier;
          
          const currentPosition = updated[id] || 0;
          const newPosition = Math.min(currentPosition + step, FINISH_LINE_POSITION);
          
          updated[id] = newPosition;
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [raceInProgress, students, selectedPets, selectedPrize, xpAmount, raceFinished]);

  // Main auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("👤 onAuthStateChanged triggered");
      try {
        if (user) {
          console.log("✅ User detected:", user.uid);
          setUser(user);

          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            console.log("📦 User data from Firestore:", data);
            setUserData(data);

            const savedClasses = data.classes || [];
            setTeacherClasses(savedClasses);

            if (savedClasses.length > 0) {
              const firstClass = savedClasses[0];
              const studentsWithCurrency = firstClass.students.map(updateStudentWithCurrency);
              setStudents(studentsWithCurrency);
              setCurrentClassId(firstClass.id);
              setDailyQuests(firstClass.dailyQuests || []);
              setWeeklyQuests(firstClass.weeklyQuests || []);
              setQuestTemplates(firstClass.questTemplates || DEFAULT_QUEST_TEMPLATES);
            } else {
              setStudents([]);
              setCurrentClassId(null);
              setDailyQuests([]);
              setWeeklyQuests([]);
              setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
            }

            // Redirect to dashboard if trying to access toolkit without PRO
            if (activeTab === 'toolkit' && data.subscription !== 'pro') {
              setActiveTab('dashboard');
            }
          } else {
            console.log("🆕 No user document, creating default");
            const defaultData = { subscription: 'basic', classes: [] };
            await setDoc(docRef, defaultData);
            setUserData(defaultData);
            setTeacherClasses([]);
            setStudents([]);
            setCurrentClassId(null);
            setDailyQuests([]);
            setWeeklyQuests([]);
            setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
            
            // Redirect to dashboard if trying to access toolkit without PRO
            if (activeTab === 'toolkit') {
              setActiveTab('dashboard');
            }
          }
        } else {
          console.log("🚫 No user signed in — redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Error in auth listener:", error);
      } finally {
        console.log("✅ Done loading user");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Classroom Champions</h2>
          <p className="text-gray-500">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Classroom Champions
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'students', label: 'Students', icon: '👥' },
            { id: 'shop', label: 'Shop', icon: '🏪' },
            { id: 'race', label: 'Pet Race', icon: '🏁' },
            // Only show Teachers Toolkit for PRO users
            ...(userData?.subscription === 'pro' ? [{ id: 'toolkit', label: 'Teachers Toolkit', icon: '🛠️', isPro: true }] : []),
            { id: 'classes', label: 'My Classes', icon: '📚' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tab.isPro 
                  ? (activeTab === tab.id 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105" 
                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg")
                  : (activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg")
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.isPro && (
                <span className="bg-yellow-400 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content with Suspense */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <Suspense fallback={<TabLoadingSpinner />}>
            {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
            {activeTab === 'students' && <StudentsTab {...tabProps} />}
            {activeTab === 'shop' && <ShopTab {...tabProps} />}
            {activeTab === 'race' && <PetRaceTab {...tabProps} />}
            {activeTab === 'toolkit' && <TeachersToolkitTab {...tabProps} />}
            {activeTab === 'classes' && <ClassesTab {...tabProps} />}
            {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          </Suspense>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
            <div className="text-center">
              <div className="text-6xl mb-4">{showConfirmDialog.icon}</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{showConfirmDialog.title}</h2>
              <p className="text-gray-600 mb-6">{showConfirmDialog.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    showConfirmDialog.onConfirm();
                    setShowConfirmDialog(null);
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg transition-colors font-semibold text-white ${
                    showConfirmDialog.type === 'danger' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {showConfirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">{feedbackType === 'bug' ? '🐛' : '💡'}</span>
              {feedbackType === 'bug' ? 'Report Bug' : 'Feature Request'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">💡 Feature Request</option>
                  <option value="feedback">💬 General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={feedbackSubject}
                  onChange={(e) => setFeedbackSubject(e.target.value)}
                  placeholder="Brief description of the issue or idea"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Please provide detailed information..."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackSubject || !feedbackMessage}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{showSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {savingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Saving changes...</p>
          </div>
        </div>
      )}

      {/* Lazy-loaded Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal {...modalProps} />
        )}
        {showAvatarSelectionModal && (
          <AvatarSelectionModal {...modalProps} />
        )}
        {levelUpData && (
          <LevelUpModal {...modalProps} />
        )}
        {petUnlockData && (
          <PetUnlockModal {...modalProps} />
        )}
        {showAddStudentModal && (
          <AddStudentModal {...modalProps} />
        )}
        {raceFinished && raceWinner && (
          <RaceWinnerModal {...modalProps} />
        )}
        {showRaceSetup && (
          <RaceSetupModal {...modalProps} />
        )}
        {showQuestCompletion && (
          <QuestCompletionModal {...modalProps} />
        )}
      </Suspense>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}