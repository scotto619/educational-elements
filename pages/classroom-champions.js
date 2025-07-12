const markQuestComplete = (questId, studentId = null) => {
    try {
      if (questId && typeof completeQuest === 'function') {
        completeQuest(questId, studentId);
        showToast('Quest marked as complete!');
      }
    } catch (error) {
      console.log('Quest completion failed:', error);
      showToast('Failed to complete quest. Please try again.');
    }
  };// classroom-champions.js - EMERGENCY FIX VERSION (Minimal Changes)
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
const COINS_PER_XP = 5; // 5 XP = 1 coin

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
  // DOUBLED LOOT BOXES
  {
    id: 'basic_box',
    name: 'Basic Loot Box',
    description: 'Contains 6 random items',
    price: 4,
    type: 'lootbox',
    rarity: 'common',
    icon: '📦',
    category: 'lootboxes',
    contents: { count: 6, rarityBonus: 0 }
  },
  {
    id: 'premium_box',
    name: 'Premium Loot Box',
    description: 'Contains 10 random items with better odds',
    price: 8,
    type: 'lootbox',
    rarity: 'rare',
    icon: '🎁',
    category: 'lootboxes',
    contents: { count: 10, rarityBonus: 15 }
  },
  {
    id: 'legendary_box',
    name: 'Legendary Loot Box',
    description: 'Contains 14 items with guaranteed rare+',
    price: 15,
    type: 'lootbox',
    rarity: 'legendary',
    icon: '💎',
    category: 'lootboxes',
    contents: { count: 14, rarityBonus: 30, guaranteedRare: true }
  },
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
  { id: 'coin_small', name: 'Coin Pouch', icon: '💰', rarity: 'common', effect: 'coins_1' },
  { id: 'sticker_star', name: 'Star Sticker', icon: '⭐', rarity: 'common', effect: 'cosmetic' },
  { id: 'pencil', name: 'Magic Pencil', icon: '✏️', rarity: 'common', effect: 'cosmetic' },
  { id: 'eraser', name: 'Lucky Eraser', icon: '🔸', rarity: 'common', effect: 'cosmetic' },
  { id: 'notebook', name: 'Enchanted Notebook', icon: '📓', rarity: 'common', effect: 'cosmetic' },
  { id: 'ruler', name: 'Golden Ruler', icon: '📏', rarity: 'common', effect: 'cosmetic' },
  { id: 'coin_medium', name: 'Coin Bag', icon: '💎', rarity: 'rare', effect: 'coins_3' },
  { id: 'rainbow_sticker', name: 'Rainbow Sticker', icon: '🌈', rarity: 'rare', effect: 'cosmetic' },
  { id: 'magic_wand', name: 'Magic Wand', icon: '🪄', rarity: 'rare', effect: 'cosmetic' },
  { id: 'pet_toy', name: 'Pet Toy', icon: '🧸', rarity: 'rare', effect: 'pet_happiness' },
  { id: 'crystal', name: 'Power Crystal', icon: '💎', rarity: 'rare', effect: 'cosmetic' },
  { id: 'scroll', name: 'Ancient Scroll', icon: '📜', rarity: 'rare', effect: 'cosmetic' },
  { id: 'coin_large', name: 'Treasure Chest', icon: '💰', rarity: 'epic', effect: 'coins_5' },
  { id: 'crystal_ball', name: 'Crystal Ball', icon: '🔮', rarity: 'epic', effect: 'cosmetic' },
  { id: 'spell_book', name: 'Ancient Spell Book', icon: '📚', rarity: 'epic', effect: 'xp_boost' },
  { id: 'golden_apple', name: 'Golden Apple', icon: '🍎', rarity: 'epic', effect: 'teacher_favorite' },
  { id: 'magic_ring', name: 'Ring of Power', icon: '💍', rarity: 'epic', effect: 'cosmetic' },
  { id: 'dragon_scale', name: 'Dragon Scale', icon: '🐲', rarity: 'epic', effect: 'cosmetic' },
  { id: 'coin_jackpot', name: 'Jackpot!', icon: '🎰', rarity: 'legendary', effect: 'coins_10' },
  { id: 'unicorn', name: 'Unicorn Friend', icon: '🦄', rarity: 'legendary', effect: 'pet_legendary' },
  { id: 'infinity_gem', name: 'Infinity Gem', icon: '💎', rarity: 'legendary', effect: 'permanent_buff' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🔥', rarity: 'legendary', effect: 'resurrection' },
  { id: 'time_crystal', name: 'Time Crystal', icon: '⏰', rarity: 'legendary', effect: 'cosmetic' },
  { id: 'star_fragment', name: 'Star Fragment', icon: '✨', rarity: 'legendary', effect: 'cosmetic' }
];

const DEFAULT_QUEST_TEMPLATES = [
  {
    id: 'daily-respectful-5',
    title: 'Be Respectful',
    description: 'Earn 5 Respectful points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
    reward: { type: 'COINS', amount: 1 },
    icon: '👍'
  },
  {
    id: 'daily-responsible-3',
    title: 'Show Responsibility',
    description: 'Earn 3 Responsible points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Responsible', amount: 3 },
    reward: { type: 'COINS', amount: 1 },
    icon: '💼'
  },
  {
    id: 'daily-learner-4',
    title: 'Learning Champion',
    description: 'Earn 4 Learner points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Learner', amount: 4 },
    reward: { type: 'COINS', amount: 1 },
    icon: '📚'
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
// UTILITY FUNCTIONS - MINIMAL SAFE VERSION
// ===============================================

// FIXED: Calculate coins properly including coinsSpent
const calculateCoins = (student) => {
  if (!student) return 0;
  const xpCoins = Math.floor((student.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student.coins || 0;
  const coinsSpent = student.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

const canAfford = (student, cost) => {
  const coins = calculateCoins(student);
  return coins >= cost;
};

const spendCoins = (student, cost) => {
  const coins = calculateCoins(student);
  if (coins >= cost) {
    const bonusCoins = student?.coins || 0;
    let newBonusCoins = bonusCoins;
    let newTotalPoints = student?.totalPoints || 0;
    
    if (cost <= bonusCoins) {
      newBonusCoins = bonusCoins - cost;
    } else {
      const remainingCost = cost - bonusCoins;
      newBonusCoins = 0;
      newTotalPoints = Math.max(0, newTotalPoints - (remainingCost * COINS_PER_XP));
    }
    
    return {
      ...student,
      coins: newBonusCoins,
      totalPoints: newTotalPoints,
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
    coins: student.coins || 0,
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

// Currency Display Component
const CurrencyDisplay = ({ student }) => {
  const coins = calculateCoins(student);
  const coinsSpent = student?.coinsSpent || 0;
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  
  return (
    <div className="flex items-center space-x-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">💰</div>
        <div className="text-sm text-yellow-700">Available</div>
        <div className="text-lg font-bold text-yellow-800">{coins}</div>
        <div className="text-xs text-yellow-600">({xpCoins} XP + {bonusCoins} bonus - {coinsSpent} spent)</div>
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
// MAIN COMPONENT - SIMPLIFIED VERSION
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

  // SIMPLIFIED Quest system states
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(DEFAULT_QUEST_TEMPLATES);
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
  // SIMPLIFIED FUNCTION DEFINITIONS
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
      }
    } catch (error) {
      console.error('Error saving students:', error);
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
      console.error('Error saving quest data:', error);
    }
  };

  const generateDailyQuests = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const templates = Array.isArray(DEFAULT_QUEST_TEMPLATES) ? DEFAULT_QUEST_TEMPLATES : [];
      
      return templates
        .filter(template => template && template.type === 'daily')
        .map(template => ({
          ...template,
          id: `${template.id}-${today}`,
          startDate: today,
          completedBy: [],
          active: true
        }));
    } catch (error) {
      console.error('Error generating daily quests:', error);
      return [];
    }
  };

  const generateWeeklyQuests = () => {
    try {
      const weekStart = getWeekStart().toISOString().split('T')[0];
      const templates = Array.isArray(DEFAULT_QUEST_TEMPLATES) ? DEFAULT_QUEST_TEMPLATES : [];
      
      return templates
        .filter(template => template && template.type === 'weekly')
        .map(template => ({
          ...template,
          id: `${template.id}-${weekStart}`,
          startDate: weekStart,
          completedBy: [],
          active: true
        }));
    } catch (error) {
      console.error('Error generating weekly quests:', error);
      return [];
    }
  };

  const checkIndividualQuestCompletion = (quest, studentId) => {
    try {
      if (!quest || !quest.requirement || !Array.isArray(students)) {
        return false;
      }

      const student = students.find(s => s && s.id === studentId);
      if (!student) return false;

      const requirement = quest.requirement;
      
      switch (requirement.type) {
        case 'xp':
          const categoryXP = student.categoryTotal && student.categoryTotal[requirement.category] 
            ? student.categoryTotal[requirement.category] 
            : 0;
          return categoryXP >= requirement.amount;
        case 'total_xp':
          return (student.totalPoints || 0) >= requirement.amount;
        case 'pet_wins':
          return (student.pet && student.pet.wins ? student.pet.wins : 0) >= requirement.amount;
        case 'manual':
          return false; // Manual quests need teacher verification
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking individual quest completion:', error);
      return false;
    }
  };

  const checkClassQuestCompletionSafely = (quest, currentStudents) => {
    try {
      if (!quest || !quest.requirement || !Array.isArray(currentStudents)) {
        return false;
      }

      const requirement = quest.requirement;
      
      switch (requirement.type) {
        case 'class_total_xp':
          const totalClassXP = currentStudents.reduce((sum, student) => {
            return sum + (student && student.totalPoints ? student.totalPoints : 0);
          }, 0);
          return totalClassXP >= requirement.amount;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking class quest completion:', error);
      return false;
    }
  };

  const completeQuest = (questId, studentId = null) => {
    try {
      if (!questId) return;

      // Safety check for quest arrays
      const weeklyQuestExists = Array.isArray(weeklyQuests) && weeklyQuests.some(q => q && q.id === questId);
      
      if (weeklyQuestExists) {
        setWeeklyQuests(prev => {
          if (!Array.isArray(prev)) return [];
          
          const updatedQuests = prev.map(quest => {
            if (!quest || quest.id !== questId) return quest;
            
            const currentCompletedBy = Array.isArray(quest.completedBy) ? quest.completedBy : [];
            const newCompletedBy = studentId 
              ? [...currentCompletedBy, studentId]
              : [...currentCompletedBy, 'class'];
            
            return { ...quest, completedBy: newCompletedBy };
          });

          saveQuestDataToFirebase({ weeklyQuests: updatedQuests });
          return updatedQuests;
        });
      } else {
        setDailyQuests(prev => {
          if (!Array.isArray(prev)) return [];
          
          const updatedQuests = prev.map(quest => {
            if (!quest || quest.id !== questId) return quest;
            
            const currentCompletedBy = Array.isArray(quest.completedBy) ? quest.completedBy : [];
            const newCompletedBy = studentId 
              ? [...currentCompletedBy, studentId]
              : [...currentCompletedBy, 'class'];
            
            return { ...quest, completedBy: newCompletedBy };
          });

          saveQuestDataToFirebase({ dailyQuests: updatedQuests });
          return updatedQuests;
        });
      }

      // Award coins safely
      const allQuests = [
        ...(Array.isArray(dailyQuests) ? dailyQuests : []), 
        ...(Array.isArray(weeklyQuests) ? weeklyQuests : [])
      ];
      
      const completedQuest = allQuests.find(q => q && q.id === questId);
      
      if (completedQuest && completedQuest.reward && completedQuest.reward.type === 'COINS') {
        if (studentId) {
          setStudents(prev => {
            if (!Array.isArray(prev)) return [];
            
            const updatedStudents = prev.map(s => 
              s && s.id === studentId ? awardCoins(s, completedQuest.reward.amount) : s
            );
            
            saveStudentsToFirebase(updatedStudents);
            return updatedStudents;
          });
        } else {
          setStudents(prev => {
            if (!Array.isArray(prev)) return [];
            
            const updatedStudents = prev.map(s => s ? awardCoins(s, completedQuest.reward.amount) : s);
            
            saveStudentsToFirebase(updatedStudents);
            return updatedStudents;
          });
        }
      }

      // Set quest completion data safely
      if (completedQuest && typeof setQuestCompletionData === 'function') {
        const student = studentId && Array.isArray(students) 
          ? students.find(s => s && s.id === studentId) 
          : null;
          
        setQuestCompletionData({
          quest: completedQuest,
          student: student
        });
        
        if (typeof setShowQuestCompletion === 'function') {
          setShowQuestCompletion(true);
        }
      }
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const checkQuestCompletionSafely = (studentId, updatedStudents) => {
    try {
      const student = updatedStudents.find(s => s && s.id === studentId);
      if (!student) return;

      // Ensure arrays exist before using array methods
      const allQuests = [
        ...(Array.isArray(dailyQuests) ? dailyQuests : []), 
        ...(Array.isArray(weeklyQuests) ? weeklyQuests : [])
      ];

      // Check individual quests with safety checks
      allQuests.forEach(quest => {
        if (quest && quest.category === 'individual' && Array.isArray(quest.completedBy) && !quest.completedBy.includes(studentId)) {
          const questCreatedDate = new Date(quest.startDate);
          const studentLastActive = student.lastXpDate ? new Date(student.lastXpDate) : new Date('2024-01-01');
          
          const today = new Date().toISOString().split('T')[0];
          const isNewQuest = quest.startDate === today;
          
          if (questCreatedDate <= studentLastActive || !student.lastXpDate || isNewQuest) {
            if (checkIndividualQuestCompletion(quest, studentId)) {
              setTimeout(() => completeQuest(quest.id, studentId), 100);
            }
          }
        }
      });

      // Check class quests with safety checks
      allQuests.forEach(quest => {
        if (quest && quest.category === 'class' && Array.isArray(quest.completedBy) && !quest.completedBy.includes('class')) {
          if (checkClassQuestCompletionSafely(quest, updatedStudents)) {
            setTimeout(() => completeQuest(quest.id, null), 100);
          }
        }
      });
    } catch (error) {
      console.error('Error checking quest completion:', error);
    }
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
          ? { ...student, avatar: newAvatar, avatarBase }
          : student
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
    showToast('Avatar updated successfully!');
  };

  const awardXP = (studentId, amount, category) => {
    if (amount <= 0) return;

    setSavingData(true);
    setAnimatingXP({ [studentId]: true });

    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== studentId) return student;

        const newTotalPoints = (student.totalPoints || 0) + amount;
        const newWeeklyPoints = (student.weeklyPoints || 0) + amount;
        const newCategoryTotal = {
          ...student.categoryTotal,
          [category]: (student.categoryTotal?.[category] || 0) + amount
        };
        const newCategoryWeekly = {
          ...student.categoryWeekly,
          [category]: (student.categoryWeekly?.[category] || 0) + amount
        };

        let updatedStudent = {
          ...student,
          totalPoints: newTotalPoints,
          weeklyPoints: newWeeklyPoints,
          categoryTotal: newCategoryTotal,
          categoryWeekly: newCategoryWeekly,
          lastXpDate: new Date().toISOString(),
          logs: [
            ...(student.logs || []),
            {
              type: category,
              amount: amount,
              date: new Date().toISOString(),
              source: "teacher_award"
            }
          ]
        };

        updatedStudent = checkForLevelUp(updatedStudent);

        if (!student.pet && newTotalPoints >= 50) {
          const newPet = getRandomPet();
          newPet.name = getRandomPetName();
          setPetUnlockData({
            studentName: student.firstName,
            petImage: newPet.image,
            petName: newPet.name
          });
          updatedStudent.pet = newPet;
        }

        return updatedStudent;
      });

      saveStudentsToFirebase(updatedStudents);
      
      // Check quest completion with error handling
      setTimeout(() => {
        try {
          if (typeof checkQuestCompletionSafely === 'function') {
            checkQuestCompletionSafely(studentId, updatedStudents);
          }
        } catch (error) {
          console.log('Quest completion check failed:', error);
        }
      }, 500);

      return updatedStudents;
    });

    setSavingData(false);
    setTimeout(() => setAnimatingXP({}), 2000);
    showToast(`+${amount} ${category} XP awarded!`);
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      alert("Please enter a student name");
      return;
    }
    if (!newStudentAvatar) {
      alert("Please select an avatar");
      return;
    }

    const newStudent = {
      id: Date.now().toString(),
      firstName: newStudentName.trim(),
      avatar: getAvatarImage(newStudentAvatar, 1),
      avatarBase: newStudentAvatar,
      avatarLevel: 1,
      totalPoints: 0,
      weeklyPoints: 0,
      categoryTotal: {},
      categoryWeekly: {},
      pet: null,
      coins: 0,
      coinsSpent: 0,
      inventory: [],
      logs: []
    };

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = [...prev, newStudent];
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    setSavingData(false);
    setNewStudentName('');
    setNewStudentAvatar('');
    setShowAddStudentModal(false);
    showToast('Student added successfully!');
  };

  // REAL race functions - restored
  const startRace = () => {
    if (selectedPets.length < 2) {
      alert("Select at least 2 pets to race!");
      return;
    }

    setRaceInProgress(true);
    setRaceFinished(false);
    setRaceWinner(null);

    const speeds = {};
    selectedPets.forEach(pet => {
      speeds[pet.id] = calculateSpeed(pet);
    });

    let positions = {};
    selectedPets.forEach(pet => {
      positions[pet.id] = 0;
    });

    const raceInterval = setInterval(() => {
      setRacePositions(prev => {
        const newPositions = { ...prev };
        let winner = null;

        selectedPets.forEach(pet => {
          if (!winner) {
            const speed = speeds[pet.id];
            const randomFactor = 0.8 + Math.random() * 0.4;
            newPositions[pet.id] = (prev[pet.id] || 0) + (speed * randomFactor);

            if (newPositions[pet.id] >= 100) {
              newPositions[pet.id] = 100;
              winner = pet;
            }
          }
        });

        if (winner) {
          clearInterval(raceInterval);
          setRaceWinner(winner);
          setRaceFinished(true);
          setRaceInProgress(false);

          setStudents(prevStudents => {
            const updatedStudents = prevStudents.map(student => {
              if (student.id === winner.studentId) {
                const updatedPet = {
                  ...student.pet,
                  wins: (student.pet.wins || 0) + 1,
                  speed: Math.min((student.pet.speed || 1) + 0.1, 3)
                };

                let bonusReward = {};
                if (selectedPrize === 'XP') {
                  bonusReward = {
                    totalPoints: (student.totalPoints || 0) + xpAmount,
                    weeklyPoints: (student.weeklyPoints || 0) + xpAmount
                  };
                }

                return {
                  ...student,
                  pet: updatedPet,
                  ...bonusReward,
                  logs: [
                    ...(student.logs || []),
                    {
                      type: "pet_race_win",
                      amount: selectedPrize === 'XP' ? xpAmount : 0,
                      date: new Date().toISOString(),
                      source: "pet_race"
                    }
                  ]
                };
              }
              return student;
            });

            saveStudentsToFirebase(updatedStudents);
            return updatedStudents;
          });
        }

        return newPositions;
      });
    }, 100);
  };

  const resetRace = () => {
    setRacePositions({});
    setRaceWinner(null);
    setRaceFinished(false);
    setRaceInProgress(false);
    setSelectedPets([]);
  };

  // ENHANCED class management - with quest generation
  const importClass = async () => {
    if (!newClassName.trim()) {
      alert("Please enter a class name");
      return;
    }
    if (!newClassStudents.trim()) {
      alert("Please enter student names");
      return;
    }

    setSavingData(true);
    try {
      const studentNames = newClassStudents.split('\n').filter(name => name.trim());
      const newStudents = studentNames.map((name, index) => ({
        id: `${Date.now()}_${index}`,
        firstName: name.trim(),
        avatar: '',
        avatarBase: '',
        avatarLevel: 1,
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        pet: null,
        coins: 0,
        coinsSpent: 0,
        inventory: [],
        logs: []
      }));

      const initialDailyQuests = generateDailyQuests();
      const initialWeeklyQuests = generateWeeklyQuests();

      const newClass = {
        id: Date.now().toString(),
        name: newClassName.trim(),
        students: newStudents,
        dailyQuests: initialDailyQuests,
        weeklyQuests: initialWeeklyQuests,
        questTemplates: DEFAULT_QUEST_TEMPLATES,
        createdAt: new Date().toISOString()
      };

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
      setDailyQuests(initialDailyQuests);
      setWeeklyQuests(initialWeeklyQuests);
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

  const loadClass = async (cls) => {
    try {
      const studentsWithCurrency = Array.isArray(cls.students) 
        ? cls.students.map(updateStudentWithCurrency) 
        : [];
      setStudents(studentsWithCurrency);
      setCurrentClassId(cls.id);
      
      const savedDailyQuests = Array.isArray(cls.dailyQuests) ? cls.dailyQuests : [];
      const savedWeeklyQuests = Array.isArray(cls.weeklyQuests) ? cls.weeklyQuests : [];
      
      const today = new Date().toISOString().split('T')[0];
      const weekStart = getWeekStart().toISOString().split('T')[0];
      
      let dailyQuestsToUse = savedDailyQuests;
      let weeklyQuestsToUse = savedWeeklyQuests;
      
      if (savedDailyQuests.length === 0 || !savedDailyQuests.some(q => q && q.startDate === today)) {
        dailyQuestsToUse = generateDailyQuests();
      }
      
      if (savedWeeklyQuests.length === 0 || !savedWeeklyQuests.some(q => q && q.startDate === weekStart)) {
        weeklyQuestsToUse = generateWeeklyQuests();
      }
      
      setDailyQuests(dailyQuestsToUse);
      setWeeklyQuests(weeklyQuestsToUse);
      setQuestTemplates(Array.isArray(cls.questTemplates) ? cls.questTemplates : DEFAULT_QUEST_TEMPLATES);
      setSelectedStudents([]);
      setShowBulkXpPanel(false);
      showToast(`${cls.name} loaded successfully!`);
    } catch (error) {
      console.error('Error loading class:', error);
      showToast('Error loading class. Please try again.');
    }
  };

  // SIMPLIFIED shop functions
  const handleShopStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleShopPurchase = (student, item) => {
    const coins = calculateCoins(student);
    const cost = item.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== student.id) return s;
        
        const updatedStudent = spendCoins(s, cost);
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
    const coins = calculateCoins(student);
    const cost = lootBox.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    setSavingData(true);
    const rewards = generateLootBoxRewards(lootBox);
    
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s.id !== student.id) return s;
        
        const updatedStudent = spendCoins(s, cost);
        
        return {
          ...updatedStudent,
          inventory: [...(updatedStudent.inventory || []), ...rewards]
        };
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    
    const rewardsList = rewards.map(r => r.name).join(', ');
    showToast(`${student.firstName} opened ${lootBox.name} and got: ${rewardsList}!`);
  };

  // REAL settings functions - restored
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
          avatarLevel: 1,
          avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
          pet: null,
          logs: [
            ...(s.logs || []),
            {
              type: "reset",
              amount: 0,
              date: new Date().toISOString(),
              source: "points_reset",
            },
          ],
        } : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student points reset successfully!');
  };

  const handleCompleteReset = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId ? {
          ...s,
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          avatarLevel: 1,
          avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
          pet: null,
          coins: 0,
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
        avatarLevel: 1,
        avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : '',
        pet: null,
        coins: 0,
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  const handleAddQuestTemplate = (questTemplate) => {
    const newTemplate = {
      ...questTemplate,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    
    setQuestTemplates(prev => {
      const updated = [...prev, newTemplate];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template added successfully!');
  };

  const handleEditQuestTemplate = (templateId, updatedTemplate) => {
    setQuestTemplates(prev => {
      const updated = prev.map(template => 
        template.id === templateId ? { ...template, ...updatedTemplate } : template
      );
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template updated successfully!');
  };

  const handleDeleteQuestTemplate = (templateId) => {
    setQuestTemplates(prev => {
      const updated = prev.filter(template => template.id !== templateId);
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template deleted successfully!');
  };

  const handleResetQuestTemplates = () => {
    setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
    saveQuestDataToFirebase({ questTemplates: DEFAULT_QUEST_TEMPLATES });
    showToast('Quest templates reset to defaults!');
  };

  const saveGroupDataToFirebase = async (groupData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...groupData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
      }
    } catch (error) {
      console.error('Error saving group data:', error);
    }
  };

  const saveClassroomDataToFirebase = async (classroomData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...classroomData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
      }
    } catch (error) {
      console.error('Error saving classroom data:', error);
    }
  };

  const awardBulkXP = () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (!selectedStudents.includes(student.id)) return student;

        const newTotalPoints = (student.totalPoints || 0) + bulkXpAmount;
        const newWeeklyPoints = (student.weeklyPoints || 0) + bulkXpAmount;
        const newCategoryTotal = {
          ...student.categoryTotal,
          [bulkXpCategory]: (student.categoryTotal?.[bulkXpCategory] || 0) + bulkXpAmount
        };
        const newCategoryWeekly = {
          ...student.categoryWeekly,
          [bulkXpCategory]: (student.categoryWeekly?.[bulkXpCategory] || 0) + bulkXpAmount
        };

        let updatedStudent = {
          ...student,
          totalPoints: newTotalPoints,
          weeklyPoints: newWeeklyPoints,
          categoryTotal: newCategoryTotal,
          categoryWeekly: newCategoryWeekly,
          lastXpDate: new Date().toISOString(),
          logs: [
            ...(student.logs || []),
            {
              type: bulkXpCategory,
              amount: bulkXpAmount,
              date: new Date().toISOString(),
              source: "bulk_award"
            }
          ]
        };

        updatedStudent = checkForLevelUp(updatedStudent);

        if (!student.pet && newTotalPoints >= 50) {
          const newPet = getRandomPet();
          newPet.name = getRandomPetName();
          updatedStudent.pet = newPet;
        }

        return updatedStudent;
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    setSavingData(false);
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    
    const studentNames = selectedStudents.length === students.length 
      ? 'the entire class'
      : `${selectedStudents.length} students`;
    
    showToast(`Awarded ${bulkXpAmount} XP to ${studentNames}!`);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);
            const userClasses = Array.isArray(data.classes) ? data.classes : [];
            setTeacherClasses(userClasses);
            
            if (userClasses.length > 0) {
              const firstClass = userClasses[0];
              if (firstClass) {
                await loadClass(firstClass);
              }
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <LoadingSpinner message="Loading Classroom Champions..." />;
  }

  if (!user) {
    return <LoadingSpinner message="Redirecting to login..." />;
  }

  // Tab props
  const tabProps = {
    students,
    setStudents,
    awardXP,
    showToast,
    setSavingData,
    saveStudentsToFirebase,
    animatingXP,
    setSelectedStudent,
    handleAvatarClick,
    teacherClasses,
    newClassName,
    setNewClassName,
    newClassStudents,
    setNewClassStudents,
    importClass,
    loadClass,
    currentClassId,
    raceInProgress,
    raceFinished,
    racePositions,
    raceWinner,
    selectedPets,
    setSelectedPets,
    startRace,
    resetRace,
    selectedPrize,
    setSelectedPrize,
    xpAmount,
    setXpAmount,
    PETS,
    calculateSpeed,
    setShowRaceSetup,
    savingData,
    selectedStudents,
    setSelectedStudents,
    bulkXpAmount,
    setBulkXpAmount,
    bulkXpCategory,
    setBulkXpCategory,
    showBulkXpPanel,
    setShowBulkXpPanel,
    awardBulkXP,
    dailyQuests,
    weeklyQuests,
    markQuestComplete,
    questTemplates,
    userData,
    user,
    showConfirmDialog,
    setShowConfirmDialog,
    showFeedbackModal,
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
    handleDeductXP,
    handleDeductCurrency,
    handleResetStudentPoints,
    handleCompleteReset,
    handleResetAllPoints,
    handleResetPetSpeeds,
    handleRemoveStudent,
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
    handleAddQuestTemplate,
    handleEditQuestTemplate,
    handleDeleteQuestTemplate,
    handleResetQuestTemplates,
    saveGroupDataToFirebase,
    saveClassroomDataToFirebase,
    currentClassId
  };

  // Modal props
  const modalProps = {
    students,
    setStudents,
    AVAILABLE_AVATARS,
    getAvatarImage,
    getRandomPetName,
    saveStudentsToFirebase,
    showToast,
    setSavingData,
    selectedStudent,
    setSelectedStudent,
    handleAvatarClick,
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    handleAvatarChange,
    savingData,
    levelUpData,
    setLevelUpData,
    petUnlockData,
    setPetUnlockData,
    petNameInput,
    setPetNameInput,
    showAddStudentModal,
    setShowAddStudentModal,
    newStudentName,
    setNewStudentName,
    newStudentAvatar,
    setNewStudentAvatar,
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
    questCompletionData,
    setQuestCompletionData,
    showQuestCompletion,
    setShowQuestCompletion,
    calculateCoins
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🏆 Classroom Champions
          </h1>
          <p className="text-gray-600">Transform your classroom into an epic adventure!</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: '📊' },
                { id: 'students', name: 'Students', icon: '👥' },
                { id: 'shop', name: 'Shop', icon: '🏪' },
                { id: 'pet-race', name: 'Pet Racing', icon: '🏁' },
                { id: 'classes', name: 'Classes', icon: '📚' },
                { id: 'toolkit', name: "Teacher's Toolkit", icon: '🛠️' },
                { id: 'settings', name: 'Settings', icon: '⚙️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <Suspense fallback={<TabLoadingSpinner />}>
              {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
              {activeTab === 'students' && <StudentsTab {...tabProps} />}
              {activeTab === 'shop' && <ShopTab {...tabProps} />}
              {activeTab === 'pet-race' && <PetRaceTab {...tabProps} />}
              {activeTab === 'classes' && <ClassesTab {...tabProps} />}
              {activeTab === 'toolkit' && <TeachersToolkitTab {...tabProps} />}
              {activeTab === 'settings' && <SettingsTab {...tabProps} />}
            </Suspense>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        {selectedStudent && <CharacterSheetModal {...modalProps} />}
        {showAvatarSelectionModal && <AvatarSelectionModal {...modalProps} />}
        {levelUpData && <LevelUpModal {...modalProps} />}
        {petUnlockData && <PetUnlockModal {...modalProps} />}
        {showAddStudentModal && <AddStudentModal {...modalProps} />}
        {raceFinished && <RaceWinnerModal {...modalProps} />}
        {showRaceSetup && <RaceSetupModal {...modalProps} />}
        {showQuestCompletion && <QuestCompletionModal {...modalProps} />}
      </Suspense>

      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {showSuccessToast}
        </div>
      )}

      {savingData && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Saving...</span>
          </div>
        </div>
      )}
    </div>
  );
}