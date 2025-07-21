// classroom-champions.js - COMPLETE WITH ALL FEATURES + FIXED AVATAR SYSTEM
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Lazy load components
const DashboardTab = React.lazy(() => import('../components/tabs/DashboardTab'));
const StudentsTab = React.lazy(() => import('../components/tabs/StudentsTab'));
const QuestTab = React.lazy(() => import('../components/tabs/QuestTab'));
const ShopTab = React.lazy(() => import('../components/tabs/ShopTab'));
const PetRaceTab = React.lazy(() => import('../components/tabs/PetRaceTab'));
const FishingGameTab = React.lazy(() => import('../components/tabs/FishingGameTab'));
const GamesTab = React.lazy(() => import('../components/tabs/GamesTab'));
const CurriculumCornerTab = React.lazy(() => import('../components/tabs/CurriculumCornerTab'));
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

// Timer Components
const PersistentTimer = React.lazy(() => import('../components/PersistentTimer'));

// ===============================================
// QUEST SYSTEM - QUEST GIVERS & DATA
// ===============================================

const QUEST_GIVERS = [
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
    name: 'Captain Valor',
    image: '/Guides/Guide 2.png',
    personality: 'encouraging',
    role: 'Behavior Quest Giver',
    specialty: 'behavior',
    greetings: [
      "Honor and respect lead to victory! ⚔️",
      "Show your noble character, brave champion!",
      "True strength comes from good choices!"
    ],
    questTypes: ['respectful', 'helpful', 'leadership'],
    tips: [
      "🛡️ Tip: Respect for others shows true strength!",
      "⚔️ Remember: Heroes help those in need!",
      "🏆 Small acts of kindness make big differences!"
    ]
  },
  {
    id: 'guide3',
    name: 'Master Chen',
    image: '/Guides/Guide 3.png',
    personality: 'focused',
    role: 'Responsibility Quest Giver',
    specialty: 'responsibility',
    greetings: [
      "Discipline creates champions! 🥋",
      "Every task completed strengthens your spirit!",
      "Responsibility is the path to mastery!"
    ],
    questTypes: ['responsible', 'organization', 'completion'],
    tips: [
      "📝 Tip: Break big tasks into smaller steps!",
      "⏰ Remember: On-time completion shows respect!",
      "🎯 Focus: One task at a time leads to success!"
    ]
  },
  {
    id: 'guide4',
    name: 'Luna Starweaver',
    image: '/Guides/Guide 4.png',
    personality: 'creative',
    role: 'Creative Quest Giver',
    specialty: 'creative',
    greetings: [
      "Creativity flows through every soul! ✨",
      "Let your imagination paint the world!",
      "Art is the language of the heart!"
    ],
    questTypes: ['creative', 'expression', 'innovation'],
    tips: [
      "🎨 Tip: There's no wrong way to create!",
      "🌟 Remember: Every masterpiece starts with a single stroke!",
      "💫 Focus: Your unique voice matters!"
    ]
  },
  {
    id: 'guide5',
    name: 'Coach Thunder',
    image: '/Guides/Guide 5.png',
    personality: 'energetic',
    role: 'Physical Quest Giver',
    specialty: 'physical',
    greetings: [
      "Let's get moving and grooving! 💪",
      "Ready to power up your body?",
      "Strength comes from consistent effort!"
    ],
    questTypes: ['exercise', 'sports', 'health'],
    tips: [
      "💪 Tip: Every step counts on your fitness journey!",
      "🏃 Remember: Your body is capable of amazing things!",
      "⚡ Focus: Energy creates more energy!"
    ]
  }
];

const QUEST_TEMPLATES = [
  // Learning Quests
  {
    id: 'homework_basic',
    title: 'Scholar\'s Journey',
    description: 'Complete homework assignments',
    icon: '📚',
    category: 'learning',
    giver: 'guide1',
    requirements: { count: 3, timeframe: 'week' },
    reward: { type: 'coins', amount: 15 },
    difficulty: 'easy'
  },
  {
    id: 'reading_challenge',
    title: 'Bookworm Badge',
    description: 'Read for learning activities',
    icon: '📖',
    category: 'learning',
    giver: 'guide1',
    requirements: { count: 5, timeframe: 'week' },
    reward: { type: 'coins', amount: 20 },
    difficulty: 'medium'
  },
  
  // Respectful Quests
  {
    id: 'help_classmates',
    title: 'Helper\'s Heart',
    description: 'Show respect and kindness',
    icon: '🤝',
    category: 'respectful',
    giver: 'guide2',
    requirements: { count: 4, timeframe: 'week' },
    reward: { type: 'coins', amount: 12 },
    difficulty: 'easy'
  },
  {
    id: 'leadership_moments',
    title: 'Natural Leader',
    description: 'Demonstrate leadership qualities',
    icon: '👑',
    category: 'respectful',
    giver: 'guide2',
    requirements: { count: 2, timeframe: 'week' },
    reward: { type: 'coins', amount: 25 },
    difficulty: 'hard'
  },

  // Responsible Quests
  {
    id: 'organization_master',
    title: 'Tidy Champion',
    description: 'Keep workspace organized',
    icon: '🗂️',
    category: 'responsible',
    giver: 'guide3',
    requirements: { count: 5, timeframe: 'week' },
    reward: { type: 'coins', amount: 15 },
    difficulty: 'medium'
  },
  {
    id: 'punctuality_pro',
    title: 'Time Master',
    description: 'Arrive on time consistently',
    icon: '⏰',
    category: 'responsible',
    giver: 'guide3',
    requirements: { count: 5, timeframe: 'week' },
    reward: { type: 'coins', amount: 18 },
    difficulty: 'medium'
  },

  // Creative Quests
  {
    id: 'creative_project',
    title: 'Creative Expression',
    description: 'Complete a creative art or writing project',
    icon: '🎨',
    category: 'creative',
    giver: 'guide4',
    requirements: { count: 1, timeframe: 'week' },
    reward: { type: 'coins', amount: 20 },
    difficulty: 'medium'
  },

  // Physical Quests
  {
    id: 'exercise_challenge',
    title: 'Fitness Champion',
    description: 'Complete physical activities',
    icon: '💪',
    category: 'physical',
    giver: 'guide5',
    requirements: { count: 3, timeframe: 'week' },
    reward: { type: 'coins', amount: 15 },
    difficulty: 'medium'
  }
];

// ===============================================
// LOOT BOX & SHOP DATA
// ===============================================

const ITEM_RARITIES = {
  common: { chance: 70, color: '#9CA3AF', glow: 'shadow-gray-300' },
  uncommon: { chance: 50, color: '#10B981', glow: 'shadow-green-300' },
  rare: { chance: 25, color: '#3B82F6', glow: 'shadow-blue-300' },
  epic: { chance: 10, color: '#8B5CF6', glow: 'shadow-purple-300' },
  legendary: { chance: 3, color: '#F59E0B', glow: 'shadow-yellow-300' }
};

const LOOT_BOX_ITEMS = [
  // Common items
  { name: 'Pencil of Power', rarity: 'common', value: 2 },
  { name: 'Lucky Eraser', rarity: 'common', value: 3 },
  { name: 'Wisdom Bookmark', rarity: 'common', value: 4 },
  // Uncommon items
  { name: 'Enchanted Notebook', rarity: 'uncommon', value: 5 },
  { name: 'Magic Ruler', rarity: 'uncommon', value: 7 },
  { name: 'Crystal Pen', rarity: 'rare', value: 12 },
  { name: 'Golden Calculator', rarity: 'rare', value: 15 },
  { name: 'Mystic Compass', rarity: 'epic', value: 25 },
  { name: 'Phoenix Feather', rarity: 'epic', value: 30 },
  { name: 'Dragon Scale', rarity: 'legendary', value: 50 },
  { name: 'Unicorn Horn', rarity: 'legendary', value: 75 }
];

// Shop Items
const SHOP_ITEMS = {
  avatars: [
    { id: 'Wizard F', name: 'Wizard (Female)', price: 25, category: 'avatars', image: '/Avatars/Wizard F/Level 1.png' },
    { id: 'Wizard M', name: 'Wizard (Male)', price: 25, category: 'avatars', image: '/Avatars/Wizard M/Level 1.png' },
    { id: 'Knight F', name: 'Knight (Female)', price: 30, category: 'avatars', image: '/Avatars/Knight F/Level 1.png' },
    { id: 'Knight M', name: 'Knight (Male)', price: 30, category: 'avatars', image: '/Avatars/Knight M/Level 1.png' },
    { id: 'Archer F', name: 'Archer (Female)', price: 25, category: 'avatars', image: '/Avatars/Archer F/Level 1.png' },
    { id: 'Archer M', name: 'Archer (Male)', price: 25, category: 'avatars', image: '/Avatars/Archer M/Level 1.png' },
    { id: 'Rogue F', name: 'Rogue (Female)', price: 35, category: 'avatars', image: '/Avatars/Rogue F/Level 1.png' },
    { id: 'Rogue M', name: 'Rogue (Male)', price: 35, category: 'avatars', image: '/Avatars/Rogue M/Level 1.png' }
  ],
  pets: [
    { id: 'Alchemist', name: 'Alchemist Companion', price: 40, category: 'pets', image: '/Pets/Alchemist.png' },
    { id: 'Barbarian', name: 'Barbarian Beast', price: 45, category: 'pets', image: '/Pets/Barbarian.png' },
    { id: 'Bard', name: 'Bard Bird', price: 35, category: 'pets', image: '/Pets/Bard.png' },
    { id: 'Crystal Knight', name: 'Crystal Knight', price: 50, category: 'pets', image: '/Pets/Crystal Knight.png' },
    { id: 'Dream', name: 'Dream Guardian', price: 60, category: 'pets', image: '/Pets/Dream.png' }
  ],
  consumables: [
    { id: 'xp_boost', name: 'XP Boost Potion', price: 10, category: 'consumables', effect: '+5 XP' },
    { id: 'luck_charm', name: 'Lucky Charm', price: 15, category: 'consumables', effect: '+3 Bonus Coins' },
    { id: 'speed_boost', name: 'Pet Speed Boost', price: 20, category: 'consumables', effect: 'Pet +0.5 Speed' }
  ],
  lootboxes: [
    { id: 'basic_box', name: 'Basic Loot Box', price: 25, category: 'lootboxes', rarity: 'common' },
    { id: 'rare_box', name: 'Rare Treasure Chest', price: 50, category: 'lootboxes', rarity: 'rare' },
    { id: 'legendary_box', name: 'Legendary Vault', price: 100, category: 'lootboxes', rarity: 'legendary' }
  ]
};

// Available Avatars - Updated to match your file structure
const AVAILABLE_AVATARS = [
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

// Constants
const MAX_LEVEL = 4;
const COINS_PER_XP = 5;
const RACE_DISTANCE = 0.8; // 80% of track width is the race distance

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
    inventory: student.inventory || [],
    lootBoxes: student.lootBoxes || [],
    achievements: student.achievements || [],
    lastXpDate: student.lastXpDate || null,
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : []),
    ownedPets: student.ownedPets || (student.pet ? [{ 
      id: `migrated_pet_${Date.now()}`,
      name: student.pet.name || 'Companion',
      image: student.pet.image,
      type: 'migrated'
    }] : []),
    rewardsPurchased: student.rewardsPurchased || []
  };
};

const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) return '';
  return `/Avatars/${avatarBase}/Level ${level}.png`;
};

const getRandomPet = () => {
  const pets = [
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
    { name: 'Necromancer', image: '/Pets/Necromancer.png', speed: 0.9, wins: 0, level: 1 },
    { name: 'Orc Warrior', image: '/Pets/Orc.png', speed: 1.3, wins: 0, level: 1 },
    { name: 'Paladin Lion', image: '/Pets/Paladin.png', speed: 1.0, wins: 0, level: 1 },
    { name: 'Rogue Shadow', image: '/Pets/Rogue.png', speed: 1.4, wins: 0, level: 1 },
    { name: 'Stealth Cat', image: '/Pets/Stealth.png', speed: 1.5, wins: 0, level: 1 },
    { name: 'Time Knight', image: '/Pets/Time Knight.png', speed: 1.1, wins: 0, level: 1 },
    { name: 'Warrior Wolf', image: '/Pets/Warrior.png', speed: 1.2, wins: 0, level: 1 },
    { name: 'Wizard Familiar', image: '/Pets/Wizard.png', speed: 1.0, wins: 0, level: 1 }
  ];
  return pets[Math.floor(Math.random() * pets.length)];
};

const getRandomPetName = () => {
  const names = [
    'Spark', 'Luna', 'Blaze', 'Storm', 'Nova', 'Echo', 'Frost', 'Ember',
    'Shadow', 'Sunny', 'Thunder', 'Misty', 'Flash', 'Comet', 'Star', 'Breeze',
    'Flame', 'River', 'Sky', 'Dawn', 'Dusk', 'Rain', 'Snow', 'Wind'
  ];
  return names[Math.floor(Math.random() * names.length)];
};

// ===============================================
// SOUND UTILITY FUNCTIONS
// ===============================================

const playXPSound = () => {
  try {
    // Create and play XP award sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Sound not available:', error);
  }
};

const playLevelUpSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Level up fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + (i * 0.15));
    });
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  } catch (error) {
    console.log('Sound not available:', error);
  }
};

const generateLootBoxRewards = (lootBox) => {
  const rewards = [];
  const numRewards = Math.floor(Math.random() * 3) + 1; // 1-3 rewards
  
  for (let i = 0; i < numRewards; i++) {
    const randomValue = Math.random() * 100;
    let selectedRarity = 'common';
    
    for (const [rarity, data] of Object.entries(ITEM_RARITIES)) {
      if (randomValue <= data.chance) {
        selectedRarity = rarity;
        break;
      }
    }
    
    const rarityItems = LOOT_BOX_ITEMS.filter(item => item.rarity === selectedRarity);
    if (rarityItems.length > 0) {
      const randomItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];
      rewards.push({
        ...randomItem,
        id: `loot_${Date.now()}_${i}`,
        acquired: new Date().toISOString()
      });
    }
  }
  
  return rewards;
};

// Migration function for existing data
const migrateClassData = async (cls) => {
  console.log(`Migrating class: ${cls.name}`);
  
  // Migrate students to new structure
  const migratedStudents = cls.students.map(student => updateStudentWithCurrency(student));
  
  return {
    ...cls,
    students: migratedStudents,
    activeQuests: cls.activeQuests || [],
    questTemplates: cls.questTemplates || QUEST_TEMPLATES,
    attendanceData: cls.attendanceData || {},
    teacherRewards: cls.teacherRewards || []
  };
};

// ===============================================
// UTILITY COMPONENTS
// ===============================================

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Classroom Champions...</h2>
        <p className="text-gray-600">Preparing your adventure!</p>
      </div>
    </div>
  </div>
);

const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-xl font-semibold text-gray-700">Loading tab content...</p>
    </div>
  </div>
);

// Currency Display Component
const CurrencyDisplay = ({ student }) => {
  const coins = Math.max(0, Math.floor((student?.totalPoints || 0) / COINS_PER_XP) + (student?.coins || 0) - (student?.coinsSpent || 0));
  const coinsSpent = student?.coinsSpent || 0;
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  
  return (
    <div className="flex items-center space-x-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">💰</div>
        <div className="text-sm text-yellow-700">Available</div>
        <div className="text-lg font-bold text-yellow-800">{coins}</div>
        <div className="text-xs text-yellow-600">({xpCoins} XP + {bonusCoins} bonus)</div>
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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(() => (message, type = 'info') => {
    // Simple toast implementation - you can replace with your preferred toast library
    alert(`${type.toUpperCase()}: ${message}`);
  });

  // Core tab and student states
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

  // Enhanced Race states
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('xp');
  const [prizeDetails, setPrizeDetails] = useState({ amount: 5, category: 'Respectful' });
  const [selectedPets, setSelectedPets] = useState([]);
  const [showRaceSetup, setShowRaceSetup] = useState(false);
  const [raceInterval, setRaceInterval] = useState(null);

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
  const [activeQuests, setActiveQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(QUEST_TEMPLATES);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  const [showQuestCompletion, setShowQuestCompletion] = useState(false);
  const [showQuestManagement, setShowQuestManagement] = useState(false);
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(null);
  const [showQuestGiverTip, setShowQuestGiverTip] = useState(null);

  // Animation states
  const [animatingXP, setAnimatingXP] = useState({});
  const [savingData, setSavingData] = useState(false);

  // Settings states
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // Attendance data
  const [attendanceData, setAttendanceData] = useState({});

  // Teacher rewards for race prizes
  const [teacherRewards, setTeacherRewards] = useState([]);

  // ===============================================
  // TIMER STATE MANAGEMENT
  // ===============================================

  // Timer states
  const [timerState, setTimerState] = useState({
    isActive: false,
    time: 300, // 5 minutes default
    originalTime: 300,
    isRunning: false,
    isPaused: false,
    type: 'countdown'
  });
  const [showFullTimerModal, setShowFullTimerModal] = useState(false);

  // Timer callback functions
  const handleTimerComplete = () => {
    showToast('⏰ Timer completed!', 'info');
    setTimerState(prev => ({ ...prev, isActive: false, isRunning: false }));
  };

  const handleTimerUpdate = (newState) => {
    setTimerState(newState);
  };

  const handleShowFullTimer = () => {
    setShowFullTimerModal(true);
  };

  // ===============================================
  // RACE SYSTEM FUNCTIONS - RESTORED
  // ===============================================

  const calculateSpeed = (pet) => {
    if (!pet) return 1;
    const baseSpeed = pet.speed || 1;
    const levelBonus = ((pet.level || 1) - 1) * 0.2;
    const winBonus = (pet.wins || 0) * 0.1;
    return Math.min(baseSpeed + levelBonus + winBonus, 3) + (Math.random() * 0.5);
  };

  const startRace = () => {
    if (selectedPets.length === 0) return;

    const raceIntervalId = setInterval(() => {
      setRacePositions(prev => {
        const newPositions = { ...prev };
        let raceComplete = false;
        let winner = null;

        selectedPets.forEach(petId => {
          const student = students.find(s => s.id === petId);
          if (student?.pet) {
            const speed = calculateSpeed(student.pet);
            const movement = speed * 3; // Pixels per frame
            newPositions[petId] = (newPositions[petId] || 0) + movement;

            // Check if race is won (80% of track width minus pet size)
            if (newPositions[petId] >= 600 && !raceComplete) { // Assuming ~750px track width
              raceComplete = true;
              winner = student;
            }
          }
        });

        if (raceComplete && winner) {
          clearInterval(raceIntervalId);
          setRaceInterval(null);
          setRaceInProgress(false);
          setRaceFinished(true);
          setRaceWinner(winner);
          awardRacePrize(winner);
        }

        return newPositions;
      });
    }, 100); // Update every 100ms

    setRaceInterval(raceIntervalId);
  };

  const awardRacePrize = (winner) => {
    if (selectedPrize === 'xp') {
      const prizeText = `${prizeDetails.amount} ${prizeDetails.category} XP`;
      showToast(`🏆 ${winner.firstName} wins the race and earns ${prizeText}!`);
      handleAwardXP(winner.id, prizeDetails.category, prizeDetails.amount);
    } else {
      const prizeText = `${prizeDetails.amount} coins`;
      showToast(`🏆 ${winner.firstName} wins the race and earns ${prizeText}!`);
      setStudents(prev => {
        const updatedStudents = prev.map(s => 
          s.id === winner.id 
            ? { ...s, coins: (s.coins || 0) + prizeDetails.amount }
            : s
        );
        saveStudentsToFirebase(updatedStudents);
        return updatedStudents;
      });
    }

    // Update pet wins
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === winner.id && s.pet
          ? { ...s, pet: { ...s.pet, wins: (s.pet.wins || 0) + 1 } }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
  };

  // Start race when race setup completes
  useEffect(() => {
    if (raceInProgress && selectedPets.length > 0 && !raceInterval) {
      startRace();
    }
    
    // Cleanup on unmount or when race stops
    return () => {
      if (raceInterval) {
        clearInterval(raceInterval);
      }
    };
  }, [raceInProgress, selectedPets]);

  // ===============================================
  // LEVEL UP SYSTEM
  // ===============================================

  const checkForLevelUp = (student) => {
    const currentLevel = student.avatarLevel || 1;
    const totalXP = student.totalPoints || 0;

    let newLevel = 1;
    if (totalXP >= 200) newLevel = 4;
    else if (totalXP >= 100) newLevel = 3;
    else if (totalXP >= 50) newLevel = 2;

    if (newLevel > currentLevel && newLevel <= MAX_LEVEL) {
      const updatedStudent = {
        ...student,
        avatarLevel: newLevel,
        avatar: getAvatarImage(student.avatarBase, newLevel)
      };

      // Show level up modal
      setLevelUpData({
        student: updatedStudent,
        newLevel: newLevel
      });

      // Play level up sound
      playLevelUpSound();

      return updatedStudent;
    }

    return student;
  };

  // ===============================================
  // XP AWARD SYSTEM WITH SOUND
  // ===============================================

  const handleAwardXP = (studentId, category, amount) => {
    if (!studentId || !category || !amount) return;

    setSavingData(true);

    // Play XP sound
    playXPSound();

    // Animate XP award
    setAnimatingXP(prev => ({ ...prev, [studentId]: category }));
    setTimeout(() => {
      setAnimatingXP(prev => ({ ...prev, [studentId]: null }));
    }, 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (s.id !== studentId) return s;

        const newTotal = s.totalPoints + amount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: (s.weeklyPoints || 0) + amount,
          lastXpDate: new Date().toISOString(),
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

        // Check for pet unlock at 50 XP
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
      checkQuestCompletionSafely(studentId, updatedStudents);
      return updatedStudents;
    });

    setSavingData(false);
    showToast(`+${amount} ${category} XP awarded!`);
  };

  // ===============================================
  // STUDENT MANAGEMENT FUNCTIONS
  // ===============================================

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
          ? { 
              ...student, 
              avatarBase, 
              avatar: newAvatar,
              ownedAvatars: student.ownedAvatars?.includes(avatarBase) 
                ? student.ownedAvatars 
                : [...(student.ownedAvatars || []), avatarBase]
            }
          : student
      );
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
    showToast('Avatar changed successfully!');
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
    
    // Play sound for bulk award
    playXPSound();
    
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
          lastXpDate: new Date().toISOString(),
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

  // ===============================================
  // QUEST MANAGEMENT FUNCTIONS
  // ===============================================

  // Quest completion check function
  const checkQuestCompletionSafely = (studentId, currentStudents) => {
    try {
      const student = currentStudents.find(s => s.id === studentId);
      if (!student) return;

      activeQuests.forEach(quest => {
        // Check if quest is completed for this student
        const studentProgress = quest.progress?.[studentId] || 0;
        const required = quest.requirements?.count || 1;
        
        if (studentProgress >= required && !quest.completedBy?.includes(studentId)) {
          // Quest completed!
          setQuestCompletionData({
            questId: quest.id,
            studentId: studentId,
            quest: quest,
            student: student,
            reward: quest.reward
          });
        }
      });
    } catch (error) {
      console.error('Error checking quest completion:', error);
    }
  };

  // Create a new quest
  const handleCreateQuest = (questData) => {
    const newQuest = {
      ...questData,
      id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      completedBy: []
    };

    setActiveQuests(prev => {
      const updated = [...prev, newQuest];
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    showToast(`Quest "${questData.title}" created successfully!`);
  };

  // Edit an existing quest
  const handleEditQuest = (questId, updatedData) => {
    setActiveQuests(prev => {
      const updated = prev.map(quest => 
        quest.id === questId ? { ...quest, ...updatedData } : quest
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    showToast('Quest updated successfully!');
  };

  // Delete a quest
  const handleDeleteQuest = (questId) => {
    setActiveQuests(prev => {
      const updated = prev.filter(quest => quest.id !== questId);
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    showToast('Quest deleted successfully!');
  };

  // Complete a quest for a student
  const handleCompleteQuest = (questId, studentId, reward) => {
    // Update quest completion
    setActiveQuests(prev => {
      const updated = prev.map(quest => 
        quest.id === questId 
          ? { 
              ...quest, 
              completedBy: [...(quest.completedBy || []), studentId],
              completedDate: new Date().toISOString()
            }
          : quest
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    // Award quest reward
    if (reward.type === 'coins') {
      setStudents(prev => {
        const updatedStudents = prev.map(s =>
          s.id === studentId
            ? { ...s, coins: (s.coins || 0) + reward.amount }
            : s
        );
        saveStudentsToFirebase(updatedStudents);
        return updatedStudents;
      });
      showToast(`Quest completed! ${reward.amount} coins awarded!`);
    } else if (reward.type === 'xp') {
      handleAwardXP(studentId, reward.category, reward.amount);
    }
  };

  // Get available quests for a student
  const getAvailableQuests = (student) => {
    return activeQuests.filter(quest => {
      if (quest.completedBy?.includes(student.id)) return false;
      if (quest.assignedTo && quest.assignedTo.length > 0 && !quest.assignedTo.includes(student.id)) return false;
      return true;
    });
  };

  // Quest template functions
  const handleAddQuestTemplate = (newTemplate) => {
    setQuestTemplates(prev => [...prev, { ...newTemplate, id: `template_${Date.now()}` }]);
    showToast('Quest template added successfully!');
  };

  const handleEditQuestTemplate = (templateId, updatedTemplate) => {
    setQuestTemplates(prev => 
      prev.map(template => 
        template.id === templateId ? { ...template, ...updatedTemplate } : template
      )
    );
    showToast('Quest template updated successfully!');
  };

  const handleDeleteQuestTemplate = (templateId) => {
    setQuestTemplates(prev => prev.filter(template => template.id !== templateId));
    showToast('Quest template deleted successfully!');
  };

  const handleResetQuestTemplates = () => {
    setQuestTemplates(QUEST_TEMPLATES);
    showToast('Quest templates reset to default!');
  };

  const showRandomQuestGiverTip = () => {
    const allTips = QUEST_GIVERS.flatMap(giver => giver.tips);
    const randomTip = allTips[Math.floor(Math.random() * allTips.length)];
    showToast(randomTip);
  };

  // ===============================================
  // SHOP FUNCTIONS
  // ===============================================

  const calculateCoins = (student) => {
    return Math.max(0, Math.floor((student?.totalPoints || 0) / COINS_PER_XP) + (student?.coins || 0) - (student?.coinsSpent || 0));
  };

  const canAfford = (student, price) => {
    return calculateCoins(student) >= price;
  };

  const spendCoins = (student, amount) => {
    return {
      ...student,
      coinsSpent: (student.coinsSpent || 0) + amount
    };
  };

  const handleShopStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleShopPurchase = (student, item) => {
    if (!canAfford(student, item.price)) {
      showToast('Not enough coins!');
      return;
    }

    let updatedStudent = spendCoins(student, item.price);

    // Handle different item types
    switch (item.category) {
      case 'avatars':
        updatedStudent.avatarBase = item.id;
        updatedStudent.avatar = getAvatarImage(item.id, updatedStudent.avatarLevel);
        if (!updatedStudent.ownedAvatars) updatedStudent.ownedAvatars = [];
        if (!updatedStudent.ownedAvatars.includes(item.id)) {
          updatedStudent.ownedAvatars.push(item.id);
        }
        break;
      case 'pets':
        if (!updatedStudent.ownedPets) updatedStudent.ownedPets = [];
        updatedStudent.ownedPets.push({
          id: `pet_${Date.now()}`,
          name: getRandomPetName(),
          image: item.image,
          type: 'purchased'
        });
        break;
      case 'consumables':
        // Handle consumable effects
        if (item.id === 'xp_boost') {
          updatedStudent.totalPoints = (updatedStudent.totalPoints || 0) + 5;
        } else if (item.id === 'luck_charm') {
          updatedStudent.coins = (updatedStudent.coins || 0) + 3;
        }
        break;
    }

    const updatedStudents = students.map(s => 
      s.id === student.id ? updatedStudent : s
    );

    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    
    showToast(`${item.name} purchased!`);
  };

  const handleLootBoxPurchase = (student, lootBox) => {
    if (!canAfford(student, lootBox.price)) {
      showToast('Not enough coins!');
      return;
    }

    const rewards = generateLootBoxRewards(lootBox);
    let updatedStudent = spendCoins(student, lootBox.price);
    
    // Add rewards to inventory
    if (!updatedStudent.inventory) updatedStudent.inventory = [];
    updatedStudent.inventory.push(...rewards);

    const updatedStudents = students.map(s => 
      s.id === student.id ? updatedStudent : s
    );

    setStudents(updatedStudents);
    setSelectedStudent(updatedStudent);
    saveStudentsToFirebase(updatedStudents);
    
    showToast(`${lootBox.name} opened! Got ${rewards.length} items!`);
  };

  // ===============================================
  // ATTENDANCE FUNCTIONS
  // ===============================================

  const markAttendance = (studentId, status, date = new Date().toISOString().split('T')[0]) => {
    setAttendanceData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [studentId]: status
      }
    }));
    
    const student = students.find(s => s.id === studentId);
    showToast(`${student?.firstName} marked as ${status}`);
  };

  // ===============================================
  // SETTINGS FUNCTIONS
  // ===============================================

  const handleDeductXP = (studentId, amount) => {
    if (amount <= 0) {
      alert("Please enter a positive amount");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              totalPoints: Math.max(0, s.totalPoints - amount),
              logs: [
                ...(s.logs || []),
                {
                  type: 'deduction',
                  amount: -amount,
                  date: new Date().toISOString(),
                  source: 'admin'
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('XP deducted successfully');
  };

  const handleDeductCurrency = (studentId, amount) => {
    if (amount <= 0) {
      alert("Please enter a positive amount");
      return;
    }

    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              coinsSpent: (s.coinsSpent || 0) + amount,
              logs: [
                ...(s.logs || []),
                {
                  type: 'coin_deduction',
                  amount: -amount,
                  date: new Date().toISOString(),
                  source: 'admin'
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Coins deducted successfully');
  };

  // Reset functions
  const handleResetStudentPoints = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              totalPoints: 0, 
              weeklyPoints: 0,
              categoryTotal: {},
              categoryWeekly: {},
              avatarLevel: 1,
              avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : s.avatar,
              logs: [
                ...(s.logs || []),
                {
                  type: 'reset',
                  amount: 0,
                  date: new Date().toISOString(),
                  source: 'admin'
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student points reset successfully');
  };

  const handleResetAllPoints = () => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.map(s => ({
        ...s,
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        avatarLevel: 1,
        avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : s.avatar,
        logs: [
          ...(s.logs || []),
          {
            type: 'reset_all',
            amount: 0,
            date: new Date().toISOString(),
            source: 'admin'
          }
        ]
      }));
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('All student points reset successfully');
  };

  const handleResetPetSpeeds = () => {
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
    showToast('All pet speeds reset successfully');
  };

  const handleRemoveStudent = (studentId) => {
    setSavingData(true);
    setStudents(prev => {
      const updatedStudents = prev.filter(s => s.id !== studentId);
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('Student removed successfully');
  };

  // Feedback functions
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

  const handleSubscriptionManagement = () => {
    router.push('/subscription-management');
  };

  // ===============================================
  // FIREBASE FUNCTIONS
  // ===============================================

  // Save students to Firebase
  const saveStudentsToFirebase = async (studentsToSave) => {
    if (!user || !currentClassId || savingData) return;

    try {
      setSavingData(true);
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                students: studentsToSave,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    } finally {
      setSavingData(false);
    }
  };

  // Save quest data to Firebase
  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                activeQuests: questData.activeQuests || cls.activeQuests,
                questTemplates: questTemplates,
                attendanceData: attendanceData,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving quest data:", error);
    }
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
            ? { 
                ...cls, 
                groupData: groupData,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving group data:", error);
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
            ? { 
                ...cls, 
                classroomData: classroomData,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving classroom data:", error);
    }
  };

  const saveVocabularyDataToFirebase = async (vocabularyData) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                vocabularyData,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving vocabulary data:", error);
    }
  };

  // ===============================================
  // CLASS MANAGEMENT
  // ===============================================

  const loadClass = async (classData) => {
    try {
      setSavingData(true);
      const studentsWithCurrency = classData.students.map(student => updateStudentWithCurrency(student));
      
      setStudents(studentsWithCurrency);
      setCurrentClassId(classData.id);
      setActiveQuests(classData.activeQuests || []);
      setQuestTemplates(classData.questTemplates || QUEST_TEMPLATES);
      setAttendanceData(classData.attendanceData || {});
      setTeacherRewards(classData.teacherRewards || []);
      
      // Update active class in Firebase
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const data = snap.data();
          await setDoc(docRef, { 
            ...data, 
            activeClassId: classData.id 
          });
        }
      }
      
      showToast(`Loaded class: ${classData.name}`);
    } catch (error) {
      console.error("Error loading class:", error);
      showToast('Error loading class');
    } finally {
      setSavingData(false);
    }
  };

  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      showToast('Please enter a class name and student list!', 'error');
      return;
    }

    try {
      setSavingData(true);
      
      const studentNames = newClassStudents
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      const newStudents = studentNames.map((name, index) => {
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');
        const randomAvatar = AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
        
        return {
          id: `student_${Date.now()}_${index}`,
          firstName: firstName || 'Student',
          lastName: lastName || '',
          avatarBase: randomAvatar,
          avatarLevel: 1,
          avatar: getAvatarImage(randomAvatar, 1),
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          coins: 0,
          coinsSpent: 0,
          pet: null,
          inventory: [],
          ownedPets: [],
          logs: []
        };
      });

      const newClass = {
        id: `class_${Date.now()}`,
        name: newClassName.trim(),
        students: newStudents,
        activeQuests: [],
        questTemplates: QUEST_TEMPLATES,
        attendanceData: {},
        teacherRewards: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Save to Firebase
      if (user) {
        const docRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const data = snap.data();
          const updatedClasses = [...(data.classes || []), newClass];
          
          await setDoc(docRef, { 
            ...data, 
            classes: updatedClasses,
            activeClassId: newClass.id
          });
          
          setTeacherClasses(updatedClasses);
          await loadClass(newClass);
        }
      }

      setNewClassName('');
      setNewClassStudents('');
      showToast(`Class "${newClass.name}" created with ${newStudents.length} students!`);
      
    } catch (error) {
      console.error("Error creating class:", error);
      showToast('Error creating class');
    } finally {
      setSavingData(false);
    }
  };

  // ===============================================
  // AUTHENTICATION & DATA LOADING
  // ===============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setTeacherClasses(data.classes || []);
            
            // Load active class if available
            const activeClassId = data.activeClassId;
            if (activeClassId && data.classes) {
              const activeClass = data.classes.find(cls => cls.id === activeClassId);
              if (activeClass) {
                await loadClass(activeClass);
              }
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        router.push('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  // Tab props object - COMPREHENSIVE
  const tabProps = {
    // Student data
    students,
    setStudents,
    selectedStudent,
    setSelectedStudent,
    
    // XP and progression
    handleAwardXP,
    handleAvatarClick,
    handleAvatarChange,
    animatingXP,
    savingData,
    setSavingData,
    
    // Bulk XP
    selectedStudents,
    setSelectedStudents,
    handleStudentSelect,
    handleSelectAll,
    handleDeselectAll,
    handleBulkXpAward,
    bulkXpAmount,
    setBulkXpAmount,
    bulkXpCategory,
    setBulkXpCategory,
    showBulkXpPanel,
    setShowBulkXpPanel,
    
    // Pet and avatar systems
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
    levelUpData,
    setLevelUpData,
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    
    // Shop functions
    calculateCoins,
    canAfford,
    spendCoins,
    SHOP_ITEMS,
    ITEM_RARITIES,
    LOOT_BOX_ITEMS,
    generateLootBoxRewards,
    handleShopStudentSelect,
    handleShopPurchase,
    handleLootBoxPurchase,
    CurrencyDisplay,
    
    // Utility functions
    showToast,
    userData,
    saveStudentsToFirebase,
    
    // Quest system
    activeQuests,
    setActiveQuests,
    questTemplates,
    setQuestTemplates,
    questCompletionData,
    setQuestCompletionData,
    handleCreateQuest,
    handleEditQuest,
    handleDeleteQuest,
    handleCompleteQuest,
    getAvailableQuests,
    handleAddQuestTemplate,
    handleEditQuestTemplate,
    handleDeleteQuestTemplate,
    handleResetQuestTemplates,
    selectedQuestGiver,
    setSelectedQuestGiver,
    showRandomQuestGiverTip,
    QUEST_GIVERS,
    checkQuestCompletionSafely,
    saveQuestDataToFirebase,
    
    // Attendance 
    attendanceData,
    setAttendanceData,
    markAttendance,
    
    // Enhanced Pet Race Props
    raceInProgress,
    setRaceInProgress,
    raceFinished,
    setRaceFinished,
    racePositions,
    setRacePositions,
    raceWinner,
    setRaceWinner,
    selectedPrize,
    setSelectedPrize,
    prizeDetails,
    setPrizeDetails,
    selectedPets,
    setSelectedPets,
    showRaceSetup,
    setShowRaceSetup,
    calculateSpeed,
    RACE_DISTANCE,
    awardRacePrize,
    teacherRewards,
    setTeacherRewards,
    
    // Timer Props
    timerState,
    setTimerState,
    handleTimerComplete,
    handleTimerUpdate,
    handleShowFullTimer,
    
    // Settings Props
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
    handleDeductXP,
    handleDeductCurrency,
    
    // Group Management
    saveGroupDataToFirebase,
    
    // Classroom Management
    saveClassroomDataToFirebase,
    
    // Vocabulary Management
    saveVocabularyDataToFirebase,
    
    // Fishing Game Props
    checkForLevelUp,
    
    // Utility Functions
    getAvatarImage,
    getRandomPet,
    getRandomPetName,
    updateStudentWithCurrency,
    AVAILABLE_AVATARS,
    MAX_LEVEL,
    
    // Additional utility props
    currentClassId
  };

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
            { id: 'quests', label: 'Quests', icon: '⚔️' },
            { id: 'shop', label: 'Shop', icon: '🏪' },
            { id: 'race', label: 'Pet Race', icon: '🏁' },
            { id: 'fishing', label: 'Fishing', icon: '🎣' },
            { id: 'games', label: 'Games', icon: '🎮' },
            { id: 'curriculum', label: 'Curriculum Corner', icon: '📖' },
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
            {activeTab === 'quests' && <QuestTab {...tabProps} />}
            {activeTab === 'shop' && <ShopTab {...tabProps} />}
            {activeTab === 'race' && <PetRaceTab {...tabProps} />}
            {activeTab === 'fishing' && <FishingGameTab {...tabProps} />}
            {activeTab === 'games' && <GamesTab {...tabProps} />}
            {activeTab === 'curriculum' && <CurriculumCornerTab {...tabProps} />}
            {activeTab === 'toolkit' && <TeachersToolkitTab {...tabProps} />}
            {activeTab === 'classes' && (
              <ClassesTab 
                {...tabProps}
                teacherClasses={teacherClasses}
                currentClassId={currentClassId}
                loadClass={loadClass}
                newClassName={newClassName}
                setNewClassName={setNewClassName}
                newClassStudents={newClassStudents}
                setNewClassStudents={setNewClassStudents}
                handleClassImport={handleClassImport}
                savingData={savingData}
              />
            )}
            {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          </Suspense>
        </div>
      </div>

      {/* Persistent Timer - Shows when timer is active */}
      <Suspense fallback={null}>
        {timerState.isActive && (
          <PersistentTimer
            isVisible={timerState.isActive}
            timerData={timerState}
            onTimerComplete={handleTimerComplete}
            onTimerUpdate={handleTimerUpdate}
            onShowFullTimer={handleShowFullTimer}
          />
        )}
      </Suspense>

      {/* Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onAvatarChange={() => {
              setStudentForAvatarChange(selectedStudent);
              setShowAvatarSelectionModal(true);
            }}
            getAvatarImage={getAvatarImage}
            calculateCoins={calculateCoins}
            CurrencyDisplay={CurrencyDisplay}
            activeQuests={activeQuests}
            getAvailableQuests={getAvailableQuests}
            onCompleteQuest={handleCompleteQuest}
            showToast={showToast}
          />
        )}

        {showAvatarSelectionModal && (
          <AvatarSelectionModal
            student={studentForAvatarChange}
            onClose={() => {
              setShowAvatarSelectionModal(false);
              setStudentForAvatarChange(null);
            }}
            onSelectAvatar={handleAvatarChange}
            availableAvatars={AVAILABLE_AVATARS}
            getAvatarImage={getAvatarImage}
          />
        )}

        {levelUpData && (
          <LevelUpModal
            student={levelUpData.student}
            newLevel={levelUpData.newLevel}
            onClose={() => setLevelUpData(null)}
            getAvatarImage={getAvatarImage}
          />
        )}

        {petUnlockData && (
          <PetUnlockModal
            student={petUnlockData}
            onClose={() => setPetUnlockData(null)}
            onNamePet={(name) => {
              const updatedStudent = {
                ...petUnlockData,
                pet: { ...petUnlockData.pet, name }
              };
              const updatedStudents = students.map(s => 
                s.id === petUnlockData.studentId 
                  ? updatedStudent 
                  : s
              );
              setStudents(updatedStudents);
              saveStudentsToFirebase(updatedStudents);
              setPetUnlockData(null);
              showToast(`${name} is now ${updatedStudent.firstName}'s pet!`);
            }}
            petNameInput={petNameInput}
            setPetNameInput={setPetNameInput}
            getRandomPetName={getRandomPetName}
            setStudents={setStudents}
            saveStudentsToFirebase={saveStudentsToFirebase}
          />
        )}

        {showAddStudentModal && (
          <AddStudentModal
            showAddStudentModal={showAddStudentModal}
            setShowAddStudentModal={setShowAddStudentModal}
            newStudentName={newStudentName}
            setNewStudentName={setNewStudentName}
            newStudentAvatar={newStudentAvatar}
            setNewStudentAvatar={setNewStudentAvatar}
            AVAILABLE_AVATARS={AVAILABLE_AVATARS.map(avatar => ({
              base: avatar,
              path: getAvatarImage(avatar, 1)
            }))}
            getAvatarImage={getAvatarImage}
            students={students}
            setStudents={setStudents}
            saveStudentsToFirebase={saveStudentsToFirebase}
            showToast={showToast}
            handleDeselectAll={handleDeselectAll}
          />
        )}

        {raceWinner && (
          <RaceWinnerModal
            winner={raceWinner}
            selectedPrize={selectedPrize}
            prizeDetails={prizeDetails}
            onClose={() => {
              setRaceWinner(null);
              setRaceFinished(false);
              setRaceInProgress(false);
              setRacePositions({});
              setSelectedPets([]);
            }}
            getAvatarImage={getAvatarImage}
          />
        )}

        {showRaceSetup && (
          <RaceSetupModal
            students={students}
            selectedPets={selectedPets}
            setSelectedPets={setSelectedPets}
            selectedPrize={selectedPrize}
            setSelectedPrize={setSelectedPrize}
            prizeDetails={prizeDetails}
            setPrizeDetails={setPrizeDetails}
            teacherRewards={teacherRewards}
            onClose={() => setShowRaceSetup(false)}
            onStartRace={() => {
              setShowRaceSetup(false);
              setRaceInProgress(true);
            }}
            calculateSpeed={calculateSpeed}
            showToast={showToast}
          />
        )}

        {questCompletionData && (
          <QuestCompletionModal
            questData={questCompletionData}
            onClose={() => setQuestCompletionData(null)}
            onConfirm={(questId, studentId, reward) => {
              handleCompleteQuest(questId, studentId, reward);
              setQuestCompletionData(null);
            }}
            showToast={showToast}
          />
        )}
      </Suspense>
    </div>
  );
}