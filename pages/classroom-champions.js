// classroom-champions.js - COMPLETE WITH QUEST SYSTEM OVERHAUL + GAMES TAB
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
const GamesTab = React.lazy(() => import('../components/tabs/GamesTab')); // NEW: Games Tab
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
// QUEST SYSTEM OVERHAUL - QUEST GIVERS & DATA
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
    questTypes: ['organization', 'attendance', 'responsibility'],
    tips: [
      "⏰ Tip: Being on time shows respect for others!",
      "📋 Organization today prevents chaos tomorrow!",
      "✅ Small responsible actions build great character!"
    ]
  },
  {
    id: 'guide3',
    name: 'Sunny the Motivator',
    image: '/Guides/Guide 3.png',
    personality: 'energetic',
    role: 'Encouragement Specialist',
    specialty: 'motivation',
    greetings: [
      "You're doing amazing! Keep shining! ✨",
      "Every day is a new chance to be awesome!",
      "Your potential is unlimited! Let's unlock it!"
    ],
    questTypes: ['participation', 'improvement', 'goals'],
    tips: [
      "⭐ Tip: Celebrate small wins - they add up!",
      "🌟 Your effort matters more than perfection!",
      "🚀 Believe in yourself - others believe in you too!"
    ]
  },
  {
    id: 'guide4',
    name: 'Guardian Spirit',
    image: '/Guides/Guide 4.png',
    personality: 'protective',
    role: 'Behavior Quest Giver',
    specialty: 'respect',
    greetings: [
      "Kindness and respect make the strongest warriors.",
      "Protecting others starts with respectful actions.",
      "True strength comes from lifting others up."
    ],
    questTypes: ['kindness', 'respect', 'helping'],
    tips: [
      "🛡️ Tip: Kindness is a superpower everyone can have!",
      "🤝 Helping others helps you grow too!",
      "💙 Respect creates a safe space for everyone!"
    ]
  },
  {
    id: 'guide5',
    name: 'Sage Elder',
    image: '/Guides/Guide 5.png',
    personality: 'wise',
    role: 'Reflection Guide',
    specialty: 'growth',
    greetings: [
      "Reflection brings wisdom, young one.",
      "How have you grown today?",
      "The journey of learning never ends."
    ],
    questTypes: ['reflection', 'improvement', 'goals'],
    tips: [
      "🔮 Tip: Reflecting on mistakes helps you learn!",
      "🌱 Growth happens outside your comfort zone!",
      "📈 Progress, not perfection, is the goal!"
    ]
  },
  {
    id: 'guide6',
    name: 'Explorer Pete',
    image: '/Guides/Guide 6.png',
    personality: 'adventurous',
    role: 'Discovery Quest Giver',
    specialty: 'exploration',
    greetings: [
      "Adventure awaits around every corner! 🗺️",
      "What new territory will you explore today?",
      "The best discoveries come from curiosity!"
    ],
    questTypes: ['exploration', 'creativity', 'projects'],
    tips: [
      "🗺️ Tip: Ask questions - they lead to discoveries!",
      "🔍 Curiosity is your best learning tool!",
      "🎒 Every lesson is a new adventure!"
    ]
  },
  {
    id: 'guide7',
    name: 'The Grand Wizard',
    image: '/Guides/Guide 7.png',
    personality: 'magical',
    role: 'Master Quest Giver',
    specialty: 'all',
    greetings: [
      "Magic happens when effort meets opportunity! ✨",
      "You have the power to achieve greatness!",
      "Let the magic of learning transform you!"
    ],
    questTypes: ['mastery', 'special', 'achievement'],
    tips: [
      "✨ Tip: Every skill you learn is like casting a spell!",
      "🎭 Practice turns ordinary students into heroes!",
      "🌟 The real magic is in never giving up!"
    ]
  }
];

// Quest Templates
const QUEST_TEMPLATES = [
  {
    id: 'daily_homework',
    title: 'Daily Homework Hero',
    description: 'Complete your homework assignment on time',
    type: 'daily',
    category: 'learning',
    reward: 2,
    questGiver: 'guide1',
    difficulty: 'easy'
  },
  {
    id: 'perfect_attendance',
    title: 'Perfect Attendance Champion',
    description: 'Attend all classes this week',
    type: 'weekly',
    category: 'responsibility',
    reward: 5,
    questGiver: 'guide2',
    difficulty: 'medium'
  },
  {
    id: 'help_classmate',
    title: 'Helpful Hero',
    description: 'Help a classmate with their work',
    type: 'manual',
    category: 'respect',
    reward: 3,
    questGiver: 'guide4',
    difficulty: 'easy'
  },
  {
    id: 'creative_project',
    title: 'Creative Explorer',
    description: 'Complete a creative project or presentation',
    type: 'manual',
    category: 'learning',
    reward: 4,
    questGiver: 'guide6',
    difficulty: 'hard'
  },
  {
    id: 'reading_quest',
    title: 'Book Adventurer',
    description: 'Read for 30 minutes today',
    type: 'daily',
    category: 'learning',
    reward: 2,
    questGiver: 'guide1',
    difficulty: 'easy'
  },
  {
    id: 'organization_master',
    title: 'Organization Master',
    description: 'Keep your desk and materials organized all week',
    type: 'weekly',
    category: 'responsibility',
    reward: 4,
    questGiver: 'guide2',
    difficulty: 'medium'
  },
  {
    id: 'participation_star',
    title: 'Participation Star',
    description: 'Actively participate in class discussions',
    type: 'daily',
    category: 'learning',
    reward: 2,
    questGiver: 'guide3',
    difficulty: 'easy'
  },
  {
    id: 'kindness_warrior',
    title: 'Kindness Warrior',
    description: 'Perform three acts of kindness this week',
    type: 'weekly',
    category: 'respect',
    reward: 6,
    questGiver: 'guide4',
    difficulty: 'medium'
  }
];

// SHOP ITEMS
const SHOP_ITEMS = [
  // Accessories
  { id: 'crown', name: 'Royal Crown', icon: '👑', price: 15, category: 'accessories', rarity: 'epic' },
  { id: 'cape', name: 'Hero Cape', icon: '🦸', price: 10, category: 'accessories', rarity: 'rare' },
  { id: 'glasses', name: 'Smart Glasses', icon: '🤓', price: 5, category: 'accessories', rarity: 'common' },
  { id: 'wizard_hat', name: 'Wizard Hat', icon: '🧙', price: 12, category: 'accessories', rarity: 'rare' },
  // Power-ups
  { id: 'double_xp', name: 'Double XP Boost', icon: '⚡', price: 20, category: 'powerups', rarity: 'epic' },
  { id: 'lucky_charm', name: 'Lucky Charm', icon: '🍀', price: 8, category: 'powerups', rarity: 'common' },
  { id: 'speed_boost', name: 'Racing Speed Boost', icon: '💨', price: 15, category: 'powerups', rarity: 'rare' },
  // Trophies
  { id: 'gold_trophy', name: 'Golden Achievement', icon: '🏆', price: 25, category: 'trophies', rarity: 'legendary' },
  { id: 'silver_medal', name: 'Silver Medal', icon: '🥈', price: 15, category: 'trophies', rarity: 'rare' },
  { id: 'bronze_medal', name: 'Bronze Medal', icon: '🥉', price: 8, category: 'trophies', rarity: 'common' },
  { id: 'diamond_trophy', name: 'Diamond Champion', icon: '💎', price: 35, category: 'trophies', rarity: 'epic' },
  // Loot Boxes
  { id: 'basic_box', name: 'Basic Loot Box', icon: '📦', price: 25, category: 'lootboxes', rarity: 'common', type: 'lootbox', contents: { count: 3, rarityBonus: 0, guaranteedRare: false } },
  { id: 'premium_box', name: 'Premium Loot Box', icon: '✨', price: 50, category: 'lootboxes', rarity: 'epic', type: 'lootbox', contents: { count: 5, rarityBonus: 10, guaranteedRare: true } }
];

const ITEM_RARITIES = {
  common: { name: 'Common', bgColor: 'bg-gray-100', textColor: 'text-gray-700', borderColor: 'border-gray-300', chance: 60 },
  rare: { name: 'Rare', bgColor: 'bg-blue-100', textColor: 'text-blue-700', borderColor: 'border-blue-300', chance: 25 },
  epic: { name: 'Epic', bgColor: 'bg-purple-100', textColor: 'text-purple-700', borderColor: 'border-purple-300', chance: 10 },
  legendary: { name: 'Legendary', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300', chance: 5 }
};

const LOOT_BOX_ITEMS = [
  { id: 'sticker_star', name: 'Star Sticker', icon: '⭐', rarity: 'common', type: 'collectible' },
  { id: 'sticker_heart', name: 'Heart Sticker', icon: '💖', rarity: 'common', type: 'collectible' },
  { id: 'badge_good', name: 'Good Student Badge', icon: '😊', rarity: 'common', type: 'badge' },
  { id: 'gem_blue', name: 'Blue Gem', icon: '💎', rarity: 'rare', type: 'collectible' },
  { id: 'medal_bronze', name: 'Bronze Medal', icon: '🏅', rarity: 'rare', type: 'award' },
  { id: 'book_magic', name: 'Magic Book', icon: '📚', rarity: 'rare', type: 'accessory' },
  { id: 'sword_hero', name: 'Hero Sword', icon: '⚔️', rarity: 'epic', type: 'accessory' },
  { id: 'shield_knight', name: 'Knight Shield', icon: '🛡️', rarity: 'epic', type: 'accessory' },
  { id: 'crown_diamond', name: 'Diamond Crown', icon: '💎👑', rarity: 'legendary', type: 'accessory' },
  { id: 'staff_wizard', name: 'Wizard Staff', icon: '🔮', rarity: 'legendary', type: 'accessory' }
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

// Constants
const MAX_LEVEL = 4;
const COINS_PER_XP = 5;

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const updateStudentWithDefaults = (student) => {
  return {
    ...student,
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    avatarLevel: student.avatarLevel || 1,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    logs: student.logs || [],
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

// Calculate coins based on XP and spending
const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
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
  
  // Character sheet and avatar selection
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAvatarSelectionModal, setShowAvatarSelectionModal] = useState(false);
  const [studentForAvatarChange, setStudentForAvatarChange] = useState(null);
  
  // Level up and pet unlock
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [petNameInput, setPetNameInput] = useState('');
  
  // Race states
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState([]);
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('');
  const [xpAmount, setXpAmount] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showRaceSetup, setShowRaceSetup] = useState(false);
  
  // XP and animation states
  const [animatingXP, setAnimatingXP] = useState({});
  const [savingData, setSavingData] = useState(false);
  
  // Bulk XP states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkXpPanel, setShowBulkXpPanel] = useState(false);
  const [bulkXpAmount, setBulkXpAmount] = useState(1);
  const [bulkXpCategory, setBulkXpCategory] = useState('Respectful');
  
  // Quest system states
  const [activeQuests, setActiveQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(QUEST_TEMPLATES);
  const [showQuestManagement, setShowQuestManagement] = useState(false);
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(null);
  const [showQuestGiverTip, setShowQuestGiverTip] = useState(null);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  const [showQuestCompletion, setShowQuestCompletion] = useState(false);
  
  // Attendance system
  const [attendanceData, setAttendanceData] = useState({});
  
  // Class management
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');
  
  // User data
  const [userData, setUserData] = useState(null);
  
  // Settings and feedback
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // Toast notification system
  const [toastQueue, setToastQueue] = useState([]);
  const [activeToast, setActiveToast] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const toast = { id, message, type };
    setToastQueue(prev => [...prev, toast]);
  };

  useEffect(() => {
    if (toastQueue.length > 0 && !activeToast) {
      const nextToast = toastQueue[0];
      setActiveToast(nextToast);
      setToastQueue(prev => prev.slice(1));
      
      setTimeout(() => {
        setActiveToast(null);
      }, 3000);
    }
  }, [toastQueue, activeToast]);

  // ===============================================
  // CORE FUNCTIONS
  // ===============================================

  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(docRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedClasses = userData.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, students: updatedStudents }
            : cls
        );
        
        await setDoc(docRef, { ...userData, classes: updatedClasses }, { merge: true });
      }
    } catch (error) {
      console.error("Error saving students to Firebase:", error);
    }
  };

  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(docRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedClasses = userData.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...questData }
            : cls
        );
        
        await setDoc(docRef, { ...userData, classes: updatedClasses }, { merge: true });
      }
    } catch (error) {
      console.error("Error saving quest data to Firebase:", error);
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

  // Award XP function
  const handleAwardXP = (id, category, amount = 1) => {
    if (animatingXP[id]) return;
    
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

        // Pet unlock check
        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          updated.pet = newPet;
          setPetUnlockData({
            studentName: s.firstName,
            petImage: newPet.image,
          });
        }

        // Level up check
        updated = checkForLevelUp(updated);

        return updated;
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    showToast(`Awarded ${amount} XP to ${students.find(s => s.id === id)?.firstName}!`);
  };

  // Bulk XP functions
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  const handleBulkXpAward = () => {
    if (selectedStudents.length === 0) {
      showToast('No students selected!', 'error');
      return;
    }

    selectedStudents.forEach(studentId => {
      handleAwardXP(studentId, bulkXpCategory, bulkXpAmount);
    });

    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    
    const studentNames = selectedStudents.length === students.length 
      ? 'the entire class'
      : `${selectedStudents.length} students`;
    
    showToast(`Awarded ${bulkXpAmount} XP to ${studentNames}!`);
  };

  // Quest system functions
  const completeQuest = (questId, studentId = null) => {
    setActiveQuests(prev => {
      const updated = prev.map(quest => {
        if (quest.id === questId) {
          if (quest.category === 'class') {
            return { ...quest, completed: true };
          } else if (studentId) {
            return { 
              ...quest, 
              completedBy: [...(quest.completedBy || []), studentId] 
            };
          }
        }
        return quest;
      });
      
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    // Award coins to student
    if (studentId) {
      const quest = activeQuests.find(q => q.id === questId);
      if (quest) {
        setStudents(prev => {
          const updated = prev.map(student => 
            student.id === studentId 
              ? {
                  ...student,
                  coins: (student.coins || 0) + quest.reward,
                  logs: [
                    ...(student.logs || []),
                    {
                      type: 'quest_coins',
                      amount: quest.reward,
                      date: new Date().toISOString(),
                      source: 'quest_completion',
                      quest: quest.title
                    }
                  ]
                }
              : student
          );
          saveStudentsToFirebase(updated);
          return updated;
        });
        
        showToast(`Quest completed! Awarded ${quest.reward} coins!`, 'success');
      }
    }
  };

  const addQuestToActive = (template) => {
    const newQuest = {
      ...template,
      id: `${template.id}_${Date.now()}`,
      addedDate: new Date().toISOString(),
      completed: false,
      completedBy: []
    };
    
    setActiveQuests(prev => {
      const updated = [...prev, newQuest];
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    showToast(`Added quest: ${template.title}`);
  };

  const removeQuestFromActive = (questId) => {
    setActiveQuests(prev => {
      const updated = prev.filter(quest => quest.id !== questId);
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    showToast('Quest removed successfully!');
  };

  const createCustomQuest = (questData) => {
    const newQuest = {
      ...questData,
      id: `custom_${Date.now()}`,
      addedDate: new Date().toISOString(),
      completed: false,
      completedBy: []
    };
    
    setActiveQuests(prev => {
      const updated = [...prev, newQuest];
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    showToast(`Created custom quest: ${questData.title}`);
  };

  // Attendance functions
  const markAttendance = (studentId, status, date = new Date().toISOString().split('T')[0]) => {
    setAttendanceData(prev => {
      const updated = {
        ...prev,
        [date]: {
          ...prev[date],
          [studentId]: status
        }
      };
      
      saveQuestDataToFirebase({ attendanceData: updated });
      return updated;
    });
    
    const student = students.find(s => s.id === studentId);
    showToast(`Marked ${student?.firstName} as ${status} for ${date}`);
  };

  // Class management functions
  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      showToast("Please enter both class name and student names", 'error');
      return;
    }

    const maxAllowed = userData?.subscription === 'pro' ? 5 : 1;
    if (teacherClasses.length >= maxAllowed) {
      showToast(`Your ${userData?.subscription || 'basic'} plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`, 'error');
      return;
    }

    setSavingData(true);
    
    try {
      const studentList = newClassStudents
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .map((name, index) => ({
          id: Date.now() + index,
          firstName: name,
          avatarBase: AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)].base,
          avatarLevel: 1,
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          logs: []
        }))
        .map(student => ({
          ...student,
          avatar: getAvatarImage(student.avatarBase, 1)
        }));

      const newClass = {
        id: Date.now(),
        name: newClassName,
        students: studentList,
        activeQuests: [],
        questTemplates: QUEST_TEMPLATES,
        attendanceData: {},
        createdAt: new Date().toISOString()
      };

      const docRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(docRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedClasses = [...(userData.classes || []), newClass];
        await setDoc(docRef, { ...userData, classes: updatedClasses }, { merge: true });
        
        setTeacherClasses(updatedClasses);
        await loadClass(newClass);
        
        setNewClassName('');
        setNewClassStudents('');
        showToast(`Class "${newClassName}" imported with ${studentList.length} students!`);
      }
    } catch (error) {
      console.error("Error importing class:", error);
      showToast('Error importing class. Please try again.', 'error');
    } finally {
      setSavingData(false);
    }
  };

  const loadClass = async (classData) => {
    const studentsWithDefaults = classData.students.map(updateStudentWithDefaults);
    
    setStudents(studentsWithDefaults);
    setCurrentClassId(classData.id);
    setActiveQuests(classData.activeQuests || []);
    setQuestTemplates(classData.questTemplates || QUEST_TEMPLATES);
    setAttendanceData(classData.attendanceData || {});
    
    showToast(`Loaded class: ${classData.name}`);
  };

  // Settings functions
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
          avatar: s.avatarBase ? getAvatarImage(s.avatarBase, 1) : s.avatar,
          coins: 0,
          coinsSpent: 0,
          inventory: [],
          logs: [
            ...(s.logs || []),
            {
              type: "reset",
              amount: 0,
              date: new Date().toISOString(),
              source: "manual_reset",
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
        coins: 0,
        coinsSpent: 0,
        inventory: [],
        logs: [
          ...(s.logs || []),
          {
            type: "reset",
            amount: 0,
            date: new Date().toISOString(),
            source: "manual_reset_all",
          },
        ],
      }));
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    setSavingData(false);
    showToast('All student points reset successfully!');
  };

  const handleRemoveStudent = (studentId) => {
    setStudents(prev => {
      const updatedStudents = prev.filter(s => s.id !== studentId);
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    showToast('Student removed successfully!');
  };

  const handleSubscriptionManagement = async () => {
    if (!userData?.stripeCustomerId) {
      showToast('No subscription found. Please subscribe first.', 'error');
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
      showToast('Error opening billing portal. Please try again.', 'error');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      showToast('Please enter a message', 'error');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          subject: feedbackSubject,
          message: feedbackMessage,
          email: feedbackEmail,
          userId: user?.uid
        })
      });

      if (response.ok) {
        showToast('Thank you for your feedback!');
        setShowFeedbackModal(false);
        setFeedbackMessage('');
        setFeedbackSubject('');
        setFeedbackEmail('');
      } else {
        showToast('Error submitting feedback. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Error submitting feedback. Please try again.', 'error');
    }
  };

  // ===============================================
  // AUTH AND DATA LOADING
  // ===============================================

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
            setTeacherClasses(data.classes || []);
            
            const savedClasses = data.classes || [];
            if (savedClasses.length > 0) {
              const activeClassId = data.activeClassId;
              const activeClass = activeClassId 
                ? savedClasses.find(cls => cls.id === activeClassId)
                : savedClasses[0];
              
              if (activeClass) {
                await loadClass(activeClass);
              } else {
                setStudents([]);
                setCurrentClassId(null);
                setActiveQuests([]);
                setQuestTemplates(QUEST_TEMPLATES);
                setAttendanceData({});
              }
            } else {
              setStudents([]);
              setCurrentClassId(null);
              setActiveQuests([]);
              setQuestTemplates(QUEST_TEMPLATES);
              setAttendanceData({});
            }

            if (activeTab === 'toolkit' && data.subscription !== 'pro') {
              setActiveTab('dashboard');
            }
          } else {
            const defaultData = { subscription: 'basic', classes: [] };
            await setDoc(docRef, defaultData);
            setUserData(defaultData);
            setTeacherClasses([]);
            setStudents([]);
            setCurrentClassId(null);
            setActiveQuests([]);
            setQuestTemplates(QUEST_TEMPLATES);
            setAttendanceData({});
            
            if (activeTab === 'toolkit') {
              setActiveTab('dashboard');
            }
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error in auth listener:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [activeTab, router]);

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

  // Tab props object
  const tabProps = {
    students,
    setStudents,
    setActiveTab,
    handleAwardXP,
    handleAvatarClick,
    setSelectedStudent,
    animatingXP,
    setShowAddStudentModal,
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
    activeQuests,
    setActiveQuests,
    questTemplates,
    setQuestTemplates,
    completeQuest,
    addQuestToActive,
    removeQuestFromActive,
    createCustomQuest,
    setShowQuestManagement,
    showQuestManagement,
    QUEST_GIVERS,
    setSelectedQuestGiver,
    selectedQuestGiver,
    saveQuestDataToFirebase,
    attendanceData,
    markAttendance,
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
    userData,
    user,
    handleResetStudentPoints,
    handleResetAllPoints,
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
    calculateCoins,
    SHOP_ITEMS,
    ITEM_RARITIES,
    LOOT_BOX_ITEMS,
    AVAILABLE_AVATARS,
    getAvatarImage,
    getRandomPetName
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
            { id: 'shop', label: 'Shop', icon: '🏪' },
            { id: 'race', label: 'Pet Race', icon: '🏁' },
            { id: 'games', label: 'Games', icon: '🎮' }, // NEW: Games tab
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
            {activeTab === 'games' && <GamesTab showToast={showToast} />} {/* NEW: Games Tab */}
            {activeTab === 'toolkit' && <TeachersToolkitTab {...tabProps} />}
            {activeTab === 'classes' && <ClassesTab {...tabProps} />}
            {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          </Suspense>
        </div>
      </div>

      {/* Toast Notifications */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${
            activeToast.type === 'success' ? 'bg-green-500' :
            activeToast.type === 'error' ? 'bg-red-500' :
            activeToast.type === 'info' ? 'bg-blue-500' :
            'bg-gray-500'
          }`}>
            {activeToast.message}
          </div>
        </div>
      )}

      {/* All existing modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            handleAvatarClick={handleAvatarClick}
            calculateCoins={calculateCoins}
          />
        )}

        {showAvatarSelectionModal && (
          <AvatarSelectionModal
            show={showAvatarSelectionModal}
            onClose={() => setShowAvatarSelectionModal(false)}
            onSelectAvatar={handleAvatarChange}
            currentAvatar={studentForAvatarChange?.avatarBase}
            avatars={AVAILABLE_AVATARS}
            studentName={studentForAvatarChange?.firstName}
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
            onClose={() => setPetUnlockData(null)}
            onNamePet={(name) => {
              const studentIndex = students.findIndex(s => s.firstName === petUnlockData.studentName);
              if (studentIndex !== -1) {
                setStudents(prev => {
                  const updated = [...prev];
                  updated[studentIndex] = {
                    ...updated[studentIndex],
                    pet: {
                      ...updated[studentIndex].pet,
                      name: name
                    }
                  };
                  saveStudentsToFirebase(updated);
                  return updated;
                });
              }
              setPetUnlockData(null);
            }}
            getRandomPetName={getRandomPetName}
          />
        )}

        {raceFinished && raceWinner && (
          <RaceWinnerModal
            winner={raceWinner}
            onClose={() => {
              setRaceFinished(false);
              setRaceWinner(null);
            }}
            onAwardPrize={(prize, xp) => {
              if (prize && xp) {
                handleAwardXP(raceWinner.id, prize, parseInt(xp));
              }
              setRaceFinished(false);
              setRaceWinner(null);
            }}
          />
        )}

        {showRaceSetup && (
          <RaceSetupModal
            students={students}
            onClose={() => setShowRaceSetup(false)}
            onStartRace={(pets, prize, xp) => {
              setSelectedPets(pets);
              setSelectedPrize(prize);
              setXpAmount(xp);
              setShowRaceSetup(false);
              setRaceInProgress(true);
            }}
          />
        )}

        {questCompletionData && (
          <QuestCompletionModal
            quest={questCompletionData}
            onClose={() => setQuestCompletionData(null)}
          />
        )}

        {showAddStudentModal && (
          <AddStudentModal
            show={showAddStudentModal}
            onClose={() => {
              setShowAddStudentModal(false);
              setNewStudentName('');
              setNewStudentAvatar('');
            }}
            onAddStudent={(name, avatarBase) => {
              const newStudent = {
                id: Date.now(),
                firstName: name,
                avatarBase: avatarBase,
                avatarLevel: 1,
                avatar: getAvatarImage(avatarBase, 1),
                totalPoints: 0,
                weeklyPoints: 0,
                categoryTotal: {},
                categoryWeekly: {},
                logs: []
              };
              
              setStudents(prev => {
                const updated = [...prev, updateStudentWithDefaults(newStudent)];
                saveStudentsToFirebase(updated);
                return updated;
              });
              
              showToast(`Added ${name} to the class!`);
              setShowAddStudentModal(false);
              setNewStudentName('');
              setNewStudentAvatar('');
            }}
            newStudentName={newStudentName}
            setNewStudentName={setNewStudentName}
            newStudentAvatar={newStudentAvatar}
            setNewStudentAvatar={setNewStudentAvatar}
            avatars={AVAILABLE_AVATARS}
          />
        )}
      </Suspense>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-4">{showConfirmDialog.icon || '⚠️'}</div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">{showConfirmDialog.title}</h2>
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
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                    showConfirmDialog.type === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {showConfirmDialog.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}