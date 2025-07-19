// classroom-champions.js - COMPLETE WITH ENHANCED PET RACE SYSTEM
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
const GamesTab = React.lazy(() => import('../components/tabs/GamesTab'));
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
    name: 'Captain Clockwork',
    image: '/Guides/Guide 2.png',
    personality: 'punctual',
    role: 'Organization Quest Giver',
    specialty: 'responsibility',
    greetings: [
      "Time for responsibility training! ⏰",
      "A well-organized student is a successful student!",
      "Ready to master the art of responsibility?"
    ],
    questTypes: ['organization', 'punctuality', 'homework'],
    tips: [
      "⏰ Tip: Being on time shows respect for others!",
      "📝 Remember: Organization is the key to success!",
      "🎯 Focus: Small habits create big achievements!"
    ]
  },
  {
    id: 'guide3',
    name: 'Sage Sparkle',
    image: '/Guides/Guide 3.png',
    personality: 'encouraging',
    role: 'Behavior Quest Giver',
    specialty: 'behavior',
    greetings: [
      "Kindness is the greatest magic! ✨",
      "Ready to spread some positive energy?",
      "Let's make the world brighter together!"
    ],
    questTypes: ['kindness', 'helping', 'teamwork'],
    tips: [
      "✨ Tip: A smile can change someone's entire day!",
      "🤝 Remember: Teamwork makes the dream work!",
      "💫 Focus: Be the reason someone believes in good!"
    ]
  },
  {
    id: 'guide4',
    name: 'Master Craft',
    image: '/Guides/Guide 4.png',
    personality: 'creative',
    role: 'Creative Quest Giver',
    specialty: 'creative',
    greetings: [
      "Let your imagination soar! 🎨",
      "Ready to create something amazing?",
      "Art and creativity know no bounds!"
    ],
    questTypes: ['art', 'writing', 'projects'],
    tips: [
      "🎨 Tip: Every masterpiece starts with a single stroke!",
      "💭 Remember: There are no mistakes, only discoveries!",
      "🌟 Focus: Express yourself fearlessly!"
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

// Quest Templates
const QUEST_TEMPLATES = [
  {
    id: 'homework_basic',
    name: 'Complete Homework',
    description: 'Finish today\'s homework assignment',
    category: 'academic',
    questGiver: 'guide1',
    icon: '📝',
    reward: { type: 'coins', amount: 3 }
  },
  {
    id: 'reading_challenge',
    name: 'Reading Challenge',
    description: 'Read for 20 minutes',
    category: 'academic',
    questGiver: 'guide1',
    icon: '📚',
    reward: { type: 'xp', amount: 2, category: 'Learner' }
  },
  {
    id: 'help_classmate',
    name: 'Help a Classmate',
    description: 'Assist another student with their work',
    category: 'behavior',
    questGiver: 'guide3',
    icon: '🤝',
    reward: { type: 'xp', amount: 3, category: 'Respectful' }
  },
  {
    id: 'organize_desk',
    name: 'Organize Your Space',
    description: 'Clean and organize your desk area',
    category: 'responsibility',
    questGiver: 'guide2',
    icon: '🧹',
    reward: { type: 'xp', amount: 2, category: 'Responsible' }
  },
  {
    id: 'creative_project',
    name: 'Creative Expression',
    description: 'Complete a creative art or writing project',
    category: 'creative',
    questGiver: 'guide4',
    icon: '🎨',
    reward: { type: 'coins', amount: 5 }
  }
];

// Shop Items
const SHOP_ITEMS = {
  avatars: [
    { id: 'wizard', name: 'Wizard', price: 25, category: 'avatars', image: '/Avatars/Wizard/Level 1.png' },
    { id: 'knight', name: 'Knight', price: 25, category: 'avatars', image: '/Avatars/Knight/Level 1.png' },
    { id: 'archer', name: 'Archer', price: 25, category: 'avatars', image: '/Avatars/Archer/Level 1.png' },
    { id: 'rogue', name: 'Rogue', price: 25, category: 'avatars', image: '/Avatars/Rogue/Level 1.png' },
  ],
  pets: [
    { id: 'dragon', name: 'Fire Dragon', price: 15, category: 'pets', image: '/Pets/dragon.png' },
    { id: 'unicorn', name: 'Magic Unicorn', price: 15, category: 'pets', image: '/Pets/unicorn.png' },
    { id: 'phoenix', name: 'Phoenix', price: 20, category: 'pets', image: '/Pets/phoenix.png' },
    { id: 'griffin', name: 'Griffin', price: 20, category: 'pets', image: '/Pets/griffin.png' },
  ],
  consumables: [
    { id: 'xp_boost', name: 'XP Boost Potion', price: 10, category: 'consumables', description: '+5 XP to next activity' },
    { id: 'luck_charm', name: 'Lucky Charm', price: 8, category: 'consumables', description: 'Increases loot box luck' },
  ]
};

const ITEM_RARITIES = {
  common: { name: 'Common', color: '#9CA3AF', chance: 60 },
  uncommon: { name: 'Uncommon', color: '#10B981', chance: 25 },
  rare: { name: 'Rare', color: '#3B82F6', chance: 12 },
  epic: { name: 'Epic', color: '#8B5CF6', chance: 2.5 },
  legendary: { name: 'Legendary', color: '#F59E0B', chance: 0.5 }
};

const LOOT_BOX_ITEMS = [
  { name: 'Gold Star Sticker', rarity: 'common', value: 2 },
  { name: 'Rainbow Pencil', rarity: 'common', value: 3 },
  { name: 'Sparkly Eraser', rarity: 'uncommon', value: 5 },
  { name: 'Magic Ruler', rarity: 'uncommon', value: 7 },
  { name: 'Crystal Pen', rarity: 'rare', value: 12 },
  { name: 'Golden Calculator', rarity: 'rare', value: 15 },
  { name: 'Mystic Compass', rarity: 'epic', value: 25 },
  { name: 'Phoenix Feather', rarity: 'epic', value: 30 },
  { name: 'Dragon Scale', rarity: 'legendary', value: 50 },
  { name: 'Unicorn Horn', rarity: 'legendary', value: 75 }
];

// Available Avatars
const AVAILABLE_AVATARS = [
  'Wizard', 'Knight', 'Archer', 'Rogue', 'Paladin', 'Mage', 'Barbarian', 'Monk',
  'Ranger', 'Druid', 'Bard', 'Warlock', 'Sorcerer', 'Cleric', 'Fighter', 'Assassin'
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
    { name: 'dragon', image: '/Pets/dragon.png' },
    { name: 'unicorn', image: '/Pets/unicorn.png' },
    { name: 'phoenix', image: '/Pets/phoenix.png' },
    { name: 'griffin', image: '/Pets/griffin.png' },
    { name: 'pegasus', image: '/Pets/pegasus.png' }
  ];
  return pets[Math.floor(Math.random() * pets.length)];
};

const getRandomPetName = () => {
  const names = ['Spark', 'Luna', 'Blaze', 'Storm', 'Nova', 'Echo', 'Frost', 'Ember'];
  return names[Math.floor(Math.random() * names.length)];
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
  
  const migratedStudents = cls.students.map(student => {
    const migrated = updateStudentWithCurrency(student);
    
    // Migrate pet if exists
    if (student.pet && !migrated.ownedPets.length) {
      migrated.ownedPets = [{
        id: `migrated_pet_${Date.now()}`,
        name: student.pet.name || 'Companion',
        image: student.pet.image,
        type: 'migrated'
      }];
    }
    
    return migrated;
  });

  return {
    ...cls,
    students: migratedStudents,
    activeQuests: cls.activeQuests || [],
    questTemplates: cls.questTemplates || QUEST_TEMPLATES,
    attendanceData: cls.attendanceData || {},
    teacherRewards: cls.teacherRewards || []
  };
};

// Enhanced speed calculation for racing
const calculateSpeed = (pet) => {
  const baseSpeed = 1;
  const winBoost = (pet.wins || 0); // Each win adds 2% speed
  const randomFactor = 0.8 + (Math.random() * 0.4); // 80-120% of base speed
  return (baseSpeed + winBoost) * randomFactor;
};

// Loading components
const LoadingSpinner = () => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Classroom Champions</h2>
        <p className="text-gray-500">Preparing your adventure...</p>
      </div>
    </div>
  </div>
);

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
    showToast('⏰ Timer completed!', 'success');
    setTimerState(prev => ({
      ...prev,
      isActive: false,
      isRunning: false,
      isPaused: false,
      time: 0
    }));
  };

  const handleTimerUpdate = (updatedTimerData) => {
    setTimerState(prev => ({
      ...prev,
      ...updatedTimerData,
      isActive: updatedTimerData.isRunning || updatedTimerData.time > 0
    }));
  };

  const handleShowFullTimer = () => {
    setActiveTab('toolkit');
    // Small delay to ensure tab loads then scroll to timer
    setTimeout(() => {
      const timerElement = document.querySelector('[data-timer-tools]');
      if (timerElement) {
        timerElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // ===============================================
  // CORE FUNCTIONS
  // ===============================================

  // Toast notification system
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  // Calculate coins for a student
  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;
    const coinsSpent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - coinsSpent);
  };

  // Check if student can afford an item
  const canAfford = (student, price) => {
    return calculateCoins(student) >= price;
  };

  // Spend coins function
  const spendCoins = (studentId, amount) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, coinsSpent: (student.coinsSpent || 0) + amount }
        : student
    ));
  };

  // ===============================================
  // ENHANCED RACE FUNCTIONS
  // ===============================================

  // Award race prize to winner
  const awardRacePrize = async (winner) => {
    let prizeAwarded = '';
    
    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== winner.id) return student;

        let updated = {
          ...student,
          pet: {
            ...student.pet,
            wins: (student.pet.wins || 0) + 1,
            speed: (student.pet.speed || 1) + 0.02
          }
        };

        switch (selectedPrize) {
          case 'xp':
            updated.totalPoints = (updated.totalPoints || 0) + prizeDetails.amount;
            updated.categoryTotal = {
              ...updated.categoryTotal,
              [prizeDetails.category]: (updated.categoryTotal[prizeDetails.category] || 0) + prizeDetails.amount
            };
            updated.logs = [
              ...(updated.logs || []),
              {
                type: prizeDetails.category,
                amount: prizeDetails.amount,
                date: new Date().toISOString(),
                source: 'race_win'
              }
            ];
            prizeAwarded = `${prizeDetails.amount} ${prizeDetails.category} XP`;
            updated = checkForLevelUp(updated);
            break;

          case 'coins':
            updated.coins = (updated.coins || 0) + prizeDetails.amount;
            updated.logs = [
              ...(updated.logs || []),
              {
                type: 'bonus_coins',
                amount: prizeDetails.amount,
                date: new Date().toISOString(),
                source: 'race_win'
              }
            ];
            prizeAwarded = `${prizeDetails.amount} coins`;
            break;

          case 'shop_item':
            if (prizeDetails.item.category === 'avatars') {
              updated.ownedAvatars = [...(updated.ownedAvatars || []), prizeDetails.item.id];
            } else if (prizeDetails.item.category === 'pets') {
              updated.ownedPets = [...(updated.ownedPets || []), {
                id: `pet_${Date.now()}`,
                name: prizeDetails.item.name,
                image: prizeDetails.item.image,
                type: 'race_prize'
              }];
            } else {
              updated.inventory = [...(updated.inventory || []), {
                id: `item_${Date.now()}`,
                name: prizeDetails.item.name,
                description: prizeDetails.item.description,
                source: 'race_win',
                acquired: new Date().toISOString()
              }];
            }
            prizeAwarded = prizeDetails.item.name;
            break;

          case 'loot_box':
            const rewards = generateLootBoxRewards(prizeDetails.lootBox);
            updated.inventory = [...(updated.inventory || []), ...rewards];
            prizeAwarded = `${prizeDetails.lootBox.name} with ${rewards.length} items`;
            break;

          case 'classroom_reward':
            updated.inventory = [...(updated.inventory || []), {
              id: `reward_${Date.now()}`,
              name: prizeDetails.reward.name,
              description: prizeDetails.reward.description,
              source: 'race_win',
              acquired: new Date().toISOString(),
              category: 'classroom_reward'
            }];
            prizeAwarded = prizeDetails.reward.name;
            break;
        }

        return updated;
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    showToast(`🏆 ${winner.firstName} wins and earns ${prizeAwarded}!`, 'success');
  };

  // ===============================================
  // FIREBASE FUNCTIONS
  // ===============================================

  // Save students to Firebase
  const saveStudentsToFirebase = async (studentsToSave) => {
    if (!user || !currentClassId) return;

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
                ...questData,
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

  // Save active class to Firebase
  const saveActiveClassToFirebase = async (classId) => {
    if (!user) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        await setDoc(docRef, { 
          ...data, 
          activeClassId: classId 
        });
      }
    } catch (error) {
      console.error("Error saving active class:", error);
    }
  };

  // Save group data to Firebase (for toolkit)
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
                groupData,
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

  // Save classroom data to Firebase (for toolkit)
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
                classroomData,
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

  // ===============================================
  // QUEST MANAGEMENT FUNCTIONS
  // ===============================================

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
          ? { ...quest, completedBy: [...(quest.completedBy || []), studentId] }
          : quest
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    // Award the reward to the student
    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== studentId) return student;

        let updated = { ...student };

        switch (reward.type) {
          case 'xp':
            const newTotal = updated.totalPoints + reward.amount;
            updated = {
              ...updated,
              totalPoints: newTotal,
              weeklyPoints: (updated.weeklyPoints || 0) + reward.amount,
              categoryTotal: {
                ...updated.categoryTotal,
                [reward.category]: (updated.categoryTotal[reward.category] || 0) + reward.amount,
              },
              categoryWeekly: {
                ...updated.categoryWeekly,
                [reward.category]: (updated.categoryWeekly[reward.category] || 0) + reward.amount,
              },
              logs: [
                ...(updated.logs || []),
                {
                  type: reward.category,
                  amount: reward.amount,
                  date: new Date().toISOString(),
                  source: "quest",
                },
              ],
            };

            // Check for pet unlock
            if (!updated.pet?.image && newTotal >= 50) {
              const newPet = getRandomPet();
              setPetNameInput(getRandomPetName());
              setPetUnlockData({
                studentId: updated.id,
                firstName: updated.firstName,
                pet: newPet,
              });
            }

            // Check for level up
            updated = checkForLevelUp(updated);
            break;

          case 'coins':
            updated = {
              ...updated,
              coins: (updated.coins || 0) + reward.amount,
              logs: [
                ...(updated.logs || []),
                {
                  type: "bonus_coins",
                  amount: reward.amount,
                  date: new Date().toISOString(),
                  source: "quest",
                },
              ],
            };
            break;

          case 'item':
            updated = {
              ...updated,
              inventory: [
                ...(updated.inventory || []),
                {
                  id: `item_${Date.now()}`,
                  name: reward.item,
                  source: 'quest',
                  acquired: new Date().toISOString()
                }
              ],
              logs: [
                ...(updated.logs || []),
                {
                  type: "item_received",
                  item: reward.item,
                  date: new Date().toISOString(),
                  source: "quest",
                },
              ],
            };
            break;
        }

        return updated;
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    const student = students.find(s => s.id === studentId);
    const rewardText = reward.type === 'xp' ? `${reward.amount} ${reward.category} XP` :
                     reward.type === 'coins' ? `${reward.amount} coins` :
                     `item: ${reward.item}`;
    
    showToast(`${student?.firstName} completed quest and earned ${rewardText}!`);
  };

  // Get available quests for a student
  const getAvailableQuests = (student) => {
    return activeQuests.filter(quest => {
      if (quest.completedBy?.includes(student.id)) return false;
      if (quest.assignedTo && quest.assignedTo.length > 0 && !quest.assignedTo.includes(student.id)) return false;
      return true;
    });
  };

  // Safe quest completion check
  const checkQuestCompletionSafely = (studentId, studentsArray) => {
    try {
      // Check if any quests can be auto-completed
      const student = studentsArray.find(s => s.id === studentId);
      if (!student) return;

      // Auto-complete logic would go here
      // For now, this is just a placeholder
    } catch (error) {
      console.error('Error checking quest completion:', error);
    }
  };

  // ===============================================
  // STUDENT MANAGEMENT FUNCTIONS
  // ===============================================

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

  const handleAwardXP = async (studentId, category, amount) => {
    setSavingData(true);
    setAnimatingXP(prev => ({ ...prev, [studentId]: category }));

    setTimeout(() => {
      setAnimatingXP(prev => ({ ...prev, [studentId]: null }));
    }, 1000);

    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== studentId) return student;

        const newTotal = student.totalPoints + amount;
        let updated = {
          ...student,
          totalPoints: newTotal,
          weeklyPoints: (student.weeklyPoints || 0) + amount,
          lastXpDate: new Date().toISOString(),
          categoryTotal: {
            ...student.categoryTotal,
            [category]: (student.categoryTotal[category] || 0) + amount,
          },
          categoryWeekly: {
            ...student.categoryWeekly,
            [category]: (student.categoryWeekly[category] || 0) + amount,
          },
          logs: [
            ...(student.logs || []),
            {
              type: category,
              amount: amount,
              date: new Date().toISOString(),
              source: "manual",
            },
          ],
        };

        if (!student.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: student.id,
            firstName: student.firstName,
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

  const handleSubscriptionManagement = async () => {
    if (!userData?.stripeCustomerId) {
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

  // Quest template management functions
  const handleAddQuestTemplate = (questData) => {
    const newTemplate = {
      ...questData,
      id: `template_${Date.now()}`,
      isCustom: true
    };
    
    setQuestTemplates(prev => {
      const updated = [...prev, newTemplate];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template added successfully!');
  };

  const handleEditQuestTemplate = (templateId, questData) => {
    setQuestTemplates(prev => {
      const updated = prev.map(template => 
        template.id === templateId ? { ...template, ...questData } : template
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
    setQuestTemplates(QUEST_TEMPLATES);
    saveQuestDataToFirebase({ questTemplates: QUEST_TEMPLATES });
    showToast('Quest templates reset to defaults!');
  };

  // Random quest giver tip function
  const showRandomQuestGiverTip = () => {
    const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
    const randomTip = randomGiver.tips[Math.floor(Math.random() * randomGiver.tips.length)];
    setShowQuestGiverTip({ giver: randomGiver, tip: randomTip });
    
    setTimeout(() => setShowQuestGiverTip(null), 5000);
  };

  // ===============================================
  // SHOP FUNCTIONS
  // ===============================================

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

    spendCoins(student.id, cost);
    
    // Add item to student's owned items
    setStudents(prev => prev.map(s => {
      if (s.id !== student.id) return s;
      
      if (item.category === 'avatars') {
        return {
          ...s,
          ownedAvatars: [...(s.ownedAvatars || []), item.id],
          rewardsPurchased: [...(s.rewardsPurchased || []), item.name]
        };
      } else if (item.category === 'pets') {
        return {
          ...s,
          ownedPets: [...(s.ownedPets || []), {
            id: `pet_${Date.now()}`,
            name: item.name,
            image: item.image,
            type: 'purchased'
          }],
          rewardsPurchased: [...(s.rewardsPurchased || []), item.name]
        };
      } else {
        return {
          ...s,
          inventory: [...(s.inventory || []), {
            id: `item_${Date.now()}`,
            name: item.name,
            description: item.description,
            source: 'shop',
            acquired: new Date().toISOString()
          }],
          rewardsPurchased: [...(s.rewardsPurchased || []), item.name]
        };
      }
    }));
    
    showToast(`${student.firstName} purchased ${item.name}!`);
  };

  const handleLootBoxPurchase = (student, lootBox) => {
    const coins = calculateCoins(student);
    const cost = lootBox.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    const rewards = generateLootBoxRewards(lootBox);
    spendCoins(student.id, cost);
    
    // Add rewards to student inventory
    setStudents(prev => prev.map(s => 
      s.id === student.id 
        ? { ...s, inventory: [...(s.inventory || []), ...rewards] }
        : s
    ));

    const rewardNames = rewards.map(r => r.name).join(', ');
    showToast(`${student.firstName} opened ${lootBox.name} and got: ${rewardNames}!`);
  };

  // ===============================================
  // CLASS MANAGEMENT FUNCTIONS
  // ===============================================

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
          coins: 0,
          logs: [],
          pet: null,
          ownedAvatars: [],
          ownedPets: [],
          rewardsPurchased: [],
          inventory: [],
          coinsSpent: 0
        });
      });

    const newClass = {
      id: 'class-' + Date.now(),
      name: newClassName,
      students: studentsArray,
      activeQuests: [],
      questTemplates: QUEST_TEMPLATES,
      attendanceData: {},
      teacherRewards: []
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
      
      await setDoc(docRef, { 
        ...existingData, 
        classes: updatedClasses,
        activeClassId: newClass.id
      });

      setTeacherClasses(updatedClasses);
      setStudents(newClass.students);
      setCurrentClassId(newClass.id);
      setActiveQuests([]);
      setQuestTemplates(QUEST_TEMPLATES);
      setAttendanceData({});
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
    await saveActiveClassToFirebase(cls.id);
    
    const studentsWithCurrency = cls.students.map(student => updateStudentWithCurrency(student));
    setStudents(studentsWithCurrency);
    setCurrentClassId(cls.id);
    
    // Load quest and attendance data
    setActiveQuests(cls.activeQuests || []);
    setQuestTemplates(cls.questTemplates || QUEST_TEMPLATES);
    setAttendanceData(cls.attendanceData || {});
    setTeacherRewards(cls.teacherRewards || []);
    
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    showToast(`${cls.name} loaded successfully!`);
  };

  // ===============================================
  // ATTENDANCE MANAGEMENT
  // ===============================================

  const markAttendance = (studentId, status, date = null) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    setAttendanceData(prev => {
      const updated = {
        ...prev,
        [targetDate]: {
          ...prev[targetDate],
          [studentId]: status
        }
      };
      
      saveQuestDataToFirebase({ attendanceData: updated });
      return updated;
    });

    const student = students.find(s => s.id === studentId);
    showToast(`${student?.firstName} marked as ${status}`);
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  // Enhanced Pet racing effect with proper distance calculation
  useEffect(() => {
    if (!raceInProgress || raceFinished) return;

    const interval = setInterval(() => {
      setRacePositions(prev => {
        const updated = { ...prev };

        // Check if race should finish (when any pet reaches the finish line)
        if (Object.values(updated).some(pos => pos >= RACE_DISTANCE)) {
          setRaceInProgress(false);
          setRaceFinished(true);

          // Find winner - pet that traveled the furthest
          const maxPosition = Math.max(...Object.values(updated));
          const winnerId = Object.keys(updated).find(id => updated[id] === maxPosition);
          const winnerStudent = students.find(s => s.id === winnerId);
          
          if (winnerStudent) {
            setRaceWinner(winnerStudent);
          }

          return updated;
        }

        // Move each pet forward
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const speed = calculateSpeed(student.pet);
          const baseStep = speed * 0.01; // Reduced step size for better visuals
          const randomMultiplier = 0.8 + Math.random() * 0.4;
          const step = baseStep * randomMultiplier;
          
          const currentPosition = updated[id] || 0;
          const newPosition = Math.min(currentPosition + step, RACE_DISTANCE);
          
          updated[id] = newPosition;
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [raceInProgress, students, selectedPets, raceFinished]);

  // Authentication and user data management with data migration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);

          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);

            let savedClasses = data.classes || [];
            
            // Migration: Migrate existing classes to new data structure
            let needsUpdate = false;
            const migratedClasses = await Promise.all(
              savedClasses.map(async (cls) => {
                const hasOldData = cls.students.some(s => s.ownedAvatars === undefined);
                if (hasOldData) {
                  needsUpdate = true;
                  console.log(`Migrating class: ${cls.name}`);
                  return await migrateClassData(cls);
                }
                return cls;
              })
            );

            // Save migrated data back to Firebase if needed
            if (needsUpdate) {
              console.log('Saving migrated data to Firebase...');
              await setDoc(docRef, { 
                ...data, 
                classes: migratedClasses 
              });
              showToast('Data updated for new features!');
            }

            setTeacherClasses(migratedClasses);

            if (migratedClasses.length > 0) {
              const activeClassId = data.activeClassId;
              const activeClass = activeClassId 
                ? migratedClasses.find(cls => cls.id === activeClassId)
                : migratedClasses[0];

              if (activeClass) {
                const studentsWithCurrency = activeClass.students.map(student => updateStudentWithCurrency(student));
                setStudents(studentsWithCurrency);
                setCurrentClassId(activeClass.id);
                setActiveQuests(activeClass.activeQuests || []);
                setQuestTemplates(activeClass.questTemplates || QUEST_TEMPLATES);
                setAttendanceData(activeClass.attendanceData || {});
                setTeacherRewards(activeClass.teacherRewards || []);
              }
            }
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ===============================================
  // RENDER
  // ===============================================

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-500">Please log in to access Classroom Champions</p>
          </div>
        </div>
      </div>
    );
  }

  // Tab props for all components
  const tabProps = {
    students,
    handleAwardXP,
    handleAvatarClick,
    setSelectedStudent,
    animatingXP,
    setShowAddStudentModal,
    showToast,
    userData,
    user,
    router,
    currentClassId,
    savingData,
    setSavingData,
    // Quest System Props
    activeQuests,
    questTemplates,
    QUEST_GIVERS,
    onCreateQuest: handleCreateQuest,
    onEditQuest: handleEditQuest,
    onDeleteQuest: handleDeleteQuest,
    onCompleteQuest: handleCompleteQuest,
    getAvailableQuests,
    attendanceData,
    markAttendance,
    saveQuestDataToFirebase,
    handleAddQuestTemplate,
    handleEditQuestTemplate,
    handleDeleteQuestTemplate,
    handleResetQuestTemplates,
    selectedQuestGiver,
    setSelectedQuestGiver,
    showRandomQuestGiverTip,
    // Bulk XP Props
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
    // Shop Props
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
    // Timer Props
    timerState,
    setTimerState,
    handleTimerComplete,
    handleTimerUpdate,
    handleShowFullTimer,
    // Utility Functions
    getAvatarImage,
    getRandomPet,
    getRandomPetName,
    updateStudentWithCurrency,
    checkForLevelUp,
    AVAILABLE_AVATARS,
    MAX_LEVEL
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
            { id: 'games', label: 'Games', icon: '🎮' },
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
            {activeTab === 'games' && <GamesTab {...tabProps} />}
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
            QUEST_GIVERS={QUEST_GIVERS}
            activeQuests={activeQuests}
            availableQuests={getAvailableQuests(selectedStudent)}
            onCompleteQuest={handleCompleteQuest}
            showToast={showToast}
          />
        )}

        {showAvatarSelectionModal && (
          <AvatarSelectionModal
            isOpen={showAvatarSelectionModal}
            onClose={() => setShowAvatarSelectionModal(false)}
            onSelectAvatar={handleAvatarChange}
            availableAvatars={AVAILABLE_AVATARS}
            currentAvatar={studentForAvatarChange?.avatarBase}
            showToast={showToast}
          />
        )}

        {levelUpData && (
          <LevelUpModal
            data={levelUpData}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {petUnlockData && (
          <PetUnlockModal
            data={petUnlockData}
            petName={petNameInput}
            onPetNameChange={setPetNameInput}
            onConfirm={() => {
              if (!petNameInput.trim()) {
                alert('Please enter a name for your pet!');
                return;
              }

              setStudents(prev => prev.map(student => 
                student.id === petUnlockData.studentId 
                  ? { 
                      ...student, 
                      pet: { 
                        ...petUnlockData.pet, 
                        name: petNameInput,
                        speed: 1,
                        wins: 0
                      }
                    }
                  : student
              ));

              showToast(`${petUnlockData.firstName} unlocked ${petNameInput}!`);
              setPetUnlockData(null);
              setPetNameInput('');
            }}
            onClose={() => setPetUnlockData(null)}
          />
        )}

        {showAddStudentModal && (
          <AddStudentModal
            isOpen={showAddStudentModal}
            onClose={() => setShowAddStudentModal(false)}
            onAddStudent={(name, avatar) => {
              const newStudent = updateStudentWithCurrency({
                id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
                firstName: name,
                avatarBase: avatar,
                avatarLevel: 1,
                avatar: getAvatarImage(avatar, 1),
                totalPoints: 0,
                weeklyPoints: 0,
                categoryTotal: {},
                categoryWeekly: {},
                coins: 0,
                logs: [],
                pet: null
              });

              setStudents(prev => {
                const updated = [...prev, newStudent];
                saveStudentsToFirebase(updated);
                return updated;
              });

              showToast(`${name} added to class!`);
            }}
            availableAvatars={AVAILABLE_AVATARS}
            showToast={showToast}
          />
        )}

        {raceFinished && raceWinner && (
          <RaceWinnerModal
            winner={raceWinner}
            selectedPrize={selectedPrize}
            prizeDetails={prizeDetails}
            awardPrize={awardRacePrize}
            onClose={() => {
              setRaceFinished(false);
              setRaceWinner(null);
              setRacePositions({});
              setSelectedPets([]);
            }}
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
            SHOP_ITEMS={SHOP_ITEMS}
            LOOT_BOX_ITEMS={LOOT_BOX_ITEMS}
            teacherRewards={teacherRewards}
            onStartRace={() => {
              if (selectedPets.length < 2) {
                alert('Please select at least 2 pets to race!');
                return;
              }
              
              if (!selectedPrize || !prizeDetails) {
                alert('Please select a prize for the winner!');
                return;
              }
              
              setShowRaceSetup(false);
              
              // Initialize race positions
              const initialPositions = {};
              selectedPets.forEach(id => {
                initialPositions[id] = 0;
              });
              setRacePositions(initialPositions);
              setRaceInProgress(true);
              setRaceFinished(false);
              setRaceWinner(null);
            }}
            onClose={() => setShowRaceSetup(false)}
          />
        )}

        {showQuestCompletion && questCompletionData && (
          <QuestCompletionModal
            data={questCompletionData}
            onClose={() => {
              setShowQuestCompletion(false);
              setQuestCompletionData(null);
            }}
          />
        )}
      </Suspense>

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{showConfirmDialog.icon}</span>
                <h3 className="text-xl font-bold text-gray-800">{showConfirmDialog.title}</h3>
              </div>
              <p className="text-gray-600 mb-6">{showConfirmDialog.message}</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    showConfirmDialog.onConfirm();
                    setShowConfirmDialog(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    showConfirmDialog.type === 'danger' 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showConfirmDialog.confirmText}
                </button>
                <button
                  onClick={() => setShowConfirmDialog(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg animate-fade-in ${
              toast.type === 'success' ? 'bg-green-600 text-white' :
              toast.type === 'error' ? 'bg-red-600 text-white' :
              'bg-blue-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Saving Indicator */}
      {savingData && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Saving...
        </div>
      )}

      {/* Quest Giver Tip Popup */}
      {showQuestGiverTip && (
        <div className="fixed top-20 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl shadow-2xl z-50 max-w-sm animate-fade-in">
          <div className="flex items-start space-x-3">
            <img
              src={showQuestGiverTip.giver.image}
              alt={showQuestGiverTip.giver.name}
              className="w-12 h-12 rounded-full border-2 border-yellow-300"
            />
            <div>
              <div className="font-bold text-yellow-300">{showQuestGiverTip.giver.name}</div>
              <div className="text-sm">{showQuestGiverTip.tip}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}