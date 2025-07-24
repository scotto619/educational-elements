// classroom-champions.js - COMPLETE WITH PHASE 2 AVATAR & STUDENTS TAB FIXES
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// PHASE 2: Import avatar fixes utilities
import { 
  getAvatarImage, 
  calculateAvatarLevel, 
  migrateStudentData, 
  fixAllStudentLevels 
} from '../utils/avatarFixes';

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

const QUEST_TEMPLATES = [
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
// SHOP SYSTEM & ITEMS
// ===============================================

const ITEM_RARITIES = {
  common: { color: 'gray', glow: 'shadow-lg', chance: 0.6 },
  uncommon: { color: 'green', glow: 'shadow-green-400/50', chance: 0.25 },
  rare: { color: 'blue', glow: 'shadow-blue-400/50', chance: 0.12 },
  epic: { color: 'purple', glow: 'shadow-purple-400/50', chance: 0.025 },
  legendary: { color: 'gold', glow: 'shadow-yellow-400/50', chance: 0.005 }
};

const LOOT_BOX_ITEMS = {
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

const SHOP_ITEMS = {
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
    currency: student.currency || 0, // PHASE 2: Ensure currency field exists
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
    { name: 'Necromancer Raven', image: '/Pets/Necromancer.png', speed: 1.0, wins: 0, level: 1 },
    { name: 'Orc Wolf', image: '/Pets/Orc.png', speed: 1.4, wins: 0, level: 1 },
    { name: 'Paladin Lion', image: '/Pets/Paladin.png', speed: 1.3, wins: 0, level: 1 },
    { name: 'Rogue Shadow', image: '/Pets/Rogue.png', speed: 1.5, wins: 0, level: 1 },
    { name: 'Sky Knight Eagle', image: '/Pets/Sky Knight.png', speed: 1.7, wins: 0, level: 1 },
    { name: 'Time Mage Turtle', image: '/Pets/Time Mage.png', speed: 0.7, wins: 0, level: 1 },
    { name: 'Wizard Familiar', image: '/Pets/Wizard.png', speed: 1.0, wins: 0, level: 1 }
  ];
  
  return pets[Math.floor(Math.random() * pets.length)];
};

const getRandomPetName = () => {
  const petNames = [
    'Shadowpaw', 'Stormwing', 'Brightclaw', 'Swiftail', 'Goldmane', 'Starwhisper',
    'Thunderbolt', 'Moonbeam', 'Fireheart', 'Icewind', 'Leafdancer', 'Rockcrusher',
    'Mistwalker', 'Sunburst', 'Nightshade', 'Crystalwing', 'Emberstone', 'Frostbite',
    'Windrider', 'Earthshaker', 'Lightbringer', 'Darkfang', 'Silverclaw', 'Goldenwing'
  ];
  
  return petNames[Math.floor(Math.random() * petNames.length)];
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
  const [savedClasses, setSavedClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [savingData, setSavingData] = useState(false);

  // Quest states
  const [activeQuests, setActiveQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(QUEST_TEMPLATES);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(QUEST_GIVERS[0]);

  // Attendance
  const [attendanceData, setAttendanceData] = useState({});

  // Teacher rewards (for shop)
  const [teacherRewards, setTeacherRewards] = useState([]);

  // Timer states
  const [timerState, setTimerState] = useState({
    minutes: 0,
    seconds: 0,
    isRunning: false,
    isPaused: false,
    showMiniTimer: false
  });

  // Settings states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // ===============================================
  // AUTHENTICATION & DATA LOADING
  // ===============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        
        try {
          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);
          
          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);
            setSavedClasses(data.classes || []);
            
            // Load active class if exists
            if (data.activeClassId && data.classes) {
              const activeClass = data.classes.find(cls => cls.id === data.activeClassId);
              if (activeClass) {
                await loadClass(activeClass);
              }
            }
          } else {
            // New user setup
            const initialData = {
              email: user.email,
              classes: [],
              subscription: 'basic',
              createdAt: new Date().toISOString()
            };
            await setDoc(docRef, initialData);
            setUserData(initialData);
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          showToast('Error loading user data');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ===============================================
  // PHASE 2: STUDENT DATA MANAGEMENT WITH FIXES
  // ===============================================

  const saveStudentsToFirebase = async (studentsData) => {
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
                students: studentsData,
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
      console.error("Error saving students:", error);
      showToast('Error saving student data');
    } finally {
      setSavingData(false);
    }
  };

  // PHASE 2: Enhanced student management functions
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      showToast('Please enter a student name!');
      return;
    }

    const newStudent = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: newStudentName.trim(),
      lastName: '',
      totalPoints: 0,
      currency: 0, // PHASE 2: Initialize with coins
      avatarLevel: 1,
      avatarBase: newStudentAvatar || AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)],
      avatar: '', // Will be set by migrateStudentData
      ownedAvatars: [],
      ownedPets: [],
      rewardsPurchased: [],
      behaviorPoints: {
        respectful: 0,
        responsible: 0,
        safe: 0,
        learner: 0
      },
      createdAt: new Date().toISOString()
    };

    // Apply migration to ensure all fields are properly set
    const migratedStudent = migrateStudentData(newStudent);
    
    const updatedStudents = [...students, migratedStudent];
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    // Reset modal
    setNewStudentName('');
    setNewStudentAvatar('');
    setShowAddStudentModal(false);
    
    showToast(`✨ Welcome ${migratedStudent.firstName} to the class!`);
  };

  // PHASE 2: Enhanced XP handling with level calculation
  const handleAwardXP = async (student, amount = 1, category = 'general') => {
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        const newTotalXP = (s.totalPoints || 0) + amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        const oldLevel = s.avatarLevel || 1;
        
        const updatedStudent = {
          ...s,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(s.avatarBase, newLevel),
          behaviorPoints: {
            ...s.behaviorPoints,
            [category.toLowerCase()]: (s.behaviorPoints?.[category.toLowerCase()] || 0) + 1
          }
        };

        // Check for level up
        if (newLevel > oldLevel) {
          setLevelUpData({
            student: updatedStudent,
            oldLevel,
            newLevel,
            totalXP: newTotalXP
          });
          showToast(`🎉 ${s.firstName} leveled up to Level ${newLevel}!`);
        }

        return updatedStudent;
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  // PHASE 2: Fix all student data function
   const handleFixAllStudents = () => {
    setStudents(prevStudents => {
      const fixedStudents = fixAllStudentLevels(prevStudents, saveStudentsToFirebase);
      showToast('✅ All student levels and avatars have been fixed!', 'success');
      return fixedStudents;
    });
  };

  // ===============================================
  // SHOP & CURRENCY SYSTEM
  // ===============================================

  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student?.coins || 0;
    const coinsSpent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - coinsSpent);
  };

  const canAfford = (student, price) => {
    return calculateCoins(student) >= price;
  };

  const spendCoins = async (studentId, amount) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          coinsSpent: (student.coinsSpent || 0) + amount
        };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  };

  const generateLootBoxRewards = (boxType) => {
    const rewards = [];
    const numRewards = boxType === 'legendary_box' ? 3 : boxType === 'rare_box' ? 2 : 1;
    
    for (let i = 0; i < numRewards; i++) {
      const allItems = [...LOOT_BOX_ITEMS.avatars, ...LOOT_BOX_ITEMS.pets];
      const item = allItems[Math.floor(Math.random() * allItems.length)];
      rewards.push(item);
    }
    
    return rewards;
  };

  const handleShopStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleShopPurchase = async (student, item) => {
    if (!canAfford(student, item.price)) {
      showToast(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    await spendCoins(student.id, item.price);
    
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        if (item.category === 'avatars') {
          return {
            ...s,
            ownedAvatars: [...(s.ownedAvatars || []), item.avatarBase],
            inventory: [...(s.inventory || []), item]
          };
        } else if (item.category === 'pets') {
          const newPet = {
            id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: getRandomPetName(),
            image: item.image,
            type: item.id
          };
          return {
            ...s,
            ownedPets: [...(s.ownedPets || []), newPet],
            inventory: [...(s.inventory || []), item]
          };
        } else {
          return {
            ...s,
            inventory: [...(s.inventory || []), item]
          };
        }
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast(`${student.firstName} purchased ${item.name}!`);
  };

  const handleLootBoxPurchase = async (student, lootBox) => {
    if (!canAfford(student, lootBox.price)) {
      showToast(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    await spendCoins(student.id, lootBox.price);
    const rewards = generateLootBoxRewards(lootBox.id);
    
    showToast(`${student.firstName} opened ${lootBox.name} and got ${rewards.length} items!`);
  };

  // ===============================================
  // QUEST SYSTEM FUNCTIONS
  // ===============================================

  const handleCreateQuest = (questData) => {
    const newQuest = {
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...questData,
      createdAt: new Date().toISOString(),
      completedBy: []
    };
    
    const updatedQuests = [...activeQuests, newQuest];
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
    showToast(`Quest "${questData.name}" created!`);
  };

  const handleEditQuest = (questId, updatedData) => {
    const updatedQuests = activeQuests.map(quest =>
      quest.id === questId ? { ...quest, ...updatedData } : quest
    );
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
  };

  const handleDeleteQuest = (questId) => {
    const updatedQuests = activeQuests.filter(quest => quest.id !== questId);
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
    showToast('Quest deleted!');
  };

  const handleCompleteQuest = async (quest, student) => {
    if (quest.completedBy?.includes(student.id)) {
      showToast(`${student.firstName} has already completed this quest!`);
      return;
    }

    // Award quest reward
    if (quest.reward.type === 'xp') {
      await handleAwardXP(student, quest.reward.amount, quest.category);
    }

    // Mark quest as completed by student
    const updatedQuests = activeQuests.map(q =>
      q.id === quest.id
        ? { ...q, completedBy: [...(q.completedBy || []), student.id] }
        : q
    );
    
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
    
    setQuestCompletionData({
      quest,
      student,
      reward: quest.reward
    });
    
    showToast(`${student.firstName} completed "${quest.name}" and earned ${quest.reward.amount} XP!`);
  };

  const getAvailableQuests = (student) => {
    return activeQuests.filter(quest => !quest.completedBy?.includes(student.id));
  };

  const handleAddQuestTemplate = (template) => {
    const newTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...template
    };
    const updatedTemplates = [...questTemplates, newTemplate];
    setQuestTemplates(updatedTemplates);
    saveQuestDataToFirebase(activeQuests, updatedTemplates, attendanceData);
  };

  const handleEditQuestTemplate = (templateId, updatedData) => {
    const updatedTemplates = questTemplates.map(template =>
      template.id === templateId ? { ...template, ...updatedData } : template
    );
    setQuestTemplates(updatedTemplates);
    saveQuestDataToFirebase(activeQuests, updatedTemplates, attendanceData);
  };

  const handleDeleteQuestTemplate = (templateId) => {
    const updatedTemplates = questTemplates.filter(template => template.id !== templateId);
    setQuestTemplates(updatedTemplates);
    saveQuestDataToFirebase(activeQuests, updatedTemplates, attendanceData);
  };

  const handleResetQuestTemplates = () => {
    setQuestTemplates(QUEST_TEMPLATES);
    saveQuestDataToFirebase(activeQuests, QUEST_TEMPLATES, attendanceData);
    showToast('Quest templates reset to defaults!');
  };

  const showRandomQuestGiverTip = () => {
    const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
    const randomTip = randomGiver.tips[Math.floor(Math.random() * randomGiver.tips.length)];
    showToast(`${randomGiver.name}: ${randomTip}`);
  };

  const checkQuestCompletionSafely = (quest, student) => {
    try {
      return quest?.completedBy?.includes(student?.id) || false;
    } catch (error) {
      console.warn('Error checking quest completion:', error);
      return false;
    }
  };

  // ===============================================
  // PET RACE SYSTEM
  // ===============================================

  const calculateSpeed = (pet) => {
    const baseSpeed = pet?.speed || 1.0;
    const bonusSpeed = (pet?.wins || 0) * 0.1;
    const randomFactor = 0.8 + (Math.random() * 0.4);
    return Math.max(0.5, baseSpeed + bonusSpeed) * randomFactor;
  };

  const awardRacePrize = async (winner, prize) => {
    const student = students.find(s => s.pet?.id === winner.pet.id || s.ownedPets?.some(p => p.id === winner.pet.id));
    
    if (!student) return;

    if (prize.type === 'xp') {
      await handleAwardXP(student, prize.amount, prize.category || 'general');
    } else if (prize.type === 'coins') {
      const updatedStudents = students.map(s =>
        s.id === student.id
          ? { ...s, coins: (s.coins || 0) + prize.amount }
          : s
      );
      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);
    }

    showToast(`🏆 ${student.firstName}'s ${winner.pet.name} won the race and earned ${prize.amount} ${prize.type}!`);
  };

  // ===============================================
  // ATTENDANCE SYSTEM
  // ===============================================

  const markAttendance = async (studentId, date, status) => {
    const dateKey = date || new Date().toISOString().split('T')[0];
    const updatedAttendance = {
      ...attendanceData,
      [dateKey]: {
        ...attendanceData[dateKey],
        [studentId]: status
      }
    };
    
    setAttendanceData(updatedAttendance);
    saveQuestDataToFirebase(activeQuests, questTemplates, updatedAttendance);
  };

  // ===============================================
  // TIMER FUNCTIONS
  // ===============================================

  const handleTimerComplete = () => {
    showToast('⏰ Timer completed!');
    // Add any completion logic here
  };

  const handleTimerUpdate = (newState) => {
    setTimerState(newState);
  };

  const handleShowFullTimer = () => {
    setActiveTab('toolkit');
  };

  // ===============================================
  // SETTINGS & UTILITY FUNCTIONS
  // ===============================================

  const handleResetStudentPoints = async (studentId) => {
    const updatedStudents = students.map(student =>
      student.id === studentId
        ? { 
            ...student, 
            totalPoints: 0, 
            avatarLevel: 1,
            avatar: getAvatarImage(student.avatarBase, 1),
            behaviorPoints: {
              respectful: 0,
              responsible: 0,
              safe: 0,
              learner: 0
            }
          }
        : student
    );
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('Student points reset!');
  };

  const handleResetAllPoints = async () => {
    const updatedStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatar: getAvatarImage(student.avatarBase, 1),
      behaviorPoints: {
        respectful: 0,
        responsible: 0,
        safe: 0,
        learner: 0
      }
    }));
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('All student points reset!');
  };

  const handleResetPetSpeeds = async () => {
    const updatedStudents = students.map(student => ({
      ...student,
      pet: student.pet ? { ...student.pet, wins: 0, speed: 1.0 } : null
    }));
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('All pet speeds reset!');
  };

  const handleRemoveStudent = async (studentId) => {
    const updatedStudents = students.filter(student => student.id !== studentId);
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('Student removed!');
  };

  const handleSubscriptionManagement = async () => {
    if (!userData?.stripeCustomerId) {
      showToast('Please contact support for subscription management.');
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
      showToast('Error opening billing portal. Please contact support.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      showToast('Please enter your feedback message.');
      return;
    }

    try {
      const feedbackData = {
        type: feedbackType,
        subject: feedbackSubject,
        message: feedbackMessage,
        email: feedbackEmail || user?.email,
        userId: user?.uid,
        timestamp: new Date().toISOString()
      };

      // Here you would typically send to your feedback collection
      console.log('Feedback submitted:', feedbackData);
      
      setShowFeedbackModal(false);
      setFeedbackMessage('');
      setFeedbackSubject('');
      setFeedbackEmail('');
      showToast('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Error submitting feedback. Please try again.');
    }
  };

  const handleDeductXP = async (student, amount) => {
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        const newTotalXP = Math.max(0, (s.totalPoints || 0) - amount);
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        return {
          ...s,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(s.avatarBase, newLevel)
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast(`Deducted ${amount} XP from ${student.firstName}`);
  };

  const handleDeductCurrency = async (student, amount) => {
    const updatedStudents = students.map(s =>
      s.id === student.id
        ? { ...s, coins: Math.max(0, (s.coins || 0) - amount) }
        : s
    );
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast(`Deducted ${amount} coins from ${student.firstName}`);
  };

  // ===============================================
  // AVATAR MANAGEMENT
  // ===============================================

  const handleChangeAvatar = (student, avatarBase) => {
    setSavingData(true);
    const newAvatar = getAvatarImage(avatarBase, student.avatarLevel || 1);
    
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(s => 
        s.id === student.id 
          ? { 
              ...s, 
              avatarBase, 
              avatar: newAvatar,
              ownedAvatars: s.ownedAvatars?.includes(avatarBase) 
                ? s.ownedAvatars 
                : [...(s.ownedAvatars || []), avatarBase]
            }
          : s
      );
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setSavingData(false);
    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
    showToast('Avatar changed successfully!');
  };

  // ===============================================
  // CLASS MANAGEMENT FUNCTIONS
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
      showToast('Please enter a class name and student list!');
      return;
    }

    try {
      setSavingData(true);
      
      const studentLines = newClassStudents.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const newStudents = studentLines.map((name, index) => {
        const randomAvatar = AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
        const student = {
          id: `student_${Date.now()}_${index}`,
          firstName: name,
          lastName: '',
          totalPoints: 0,
          currency: 0, // PHASE 2: Initialize currency
          avatarLevel: 1,
          avatarBase: randomAvatar,
          avatar: '', // Will be set by migrateStudentData
          createdAt: new Date().toISOString()
        };
        return migrateStudentData(student); // PHASE 2: Apply migration
      });

      const newClass = {
        id: `class_${Date.now()}`,
        name: newClassName,
        students: newStudents,
        activeQuests: [],
        questTemplates: QUEST_TEMPLATES,
        attendanceData: {},
        teacherRewards: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      // Save to Firebase
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
        setSavedClasses(updatedClasses);
      }

      // Load the new class
      await loadClass(newClass);
      
      // Reset form
      setNewClassName('');
      setNewClassStudents('');
      
      showToast(`Class "${newClassName}" created with ${newStudents.length} students!`);
    } catch (error) {
      console.error("Error creating class:", error);
      showToast('Error creating class');
    } finally {
      setSavingData(false);
    }
  };

  // ===============================================
  // FIREBASE SAVE FUNCTIONS
  // ===============================================

  const saveQuestDataToFirebase = async (questData, questTemplates, attendanceData) => {
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
  // LEVEL UP SYSTEM
  // ===============================================

  const checkForLevelUp = (student) => {
    const currentLevel = student.avatarLevel || 1;
    const newLevel = calculateAvatarLevel(student.totalPoints || 0);
    
    if (newLevel > currentLevel) {
      setLevelUpData({
        student,
        oldLevel: currentLevel,
        newLevel,
        totalXP: student.totalPoints || 0
      });
      
      // Check for pet unlock at level 4
      if (newLevel >= 4 && (!student.ownedPets || student.ownedPets.length === 0)) {
        const newPet = getRandomPet();
        setPetUnlockData({
          student,
          pet: { ...newPet, name: getRandomPetName() }
        });
      }
      
      return true;
    }
    return false;
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Create combined props object for all tabs
  const tabProps = {
    // Core data
    students,
    setStudents,
    user,
    userData,
    currentClassId,
    
    // Student management
    handleAddStudent,
    handleAwardXP,
    handleViewStudent,
    handleFixAllStudents, // PHASE 2: Add fix function
    selectedStudent,
    setSelectedStudent,
    
    // Data persistence
    saveStudentsToFirebase,
    showToast,
    
    // Class management
    savedClasses,
    setSavedClasses,
    loadClass,
    handleClassImport,
    newClassName,
    setNewClassName,
    newClassStudents,
    setNewClassStudents,
    savingData,
    
    // Avatar system
    handleChangeAvatar,
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    
    // Modals
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
    fixAllStudentLevels, // PHASE 2: Export fix function
    
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
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105' 
                      : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 border-2 border-purple-300'
                    )
                  : (activeTab === tab.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                    )
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.isPro && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-1 rounded-full text-xs font-bold">
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <Suspense fallback={<TabLoadingSpinner />}>
          {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
          
          {/* PHASE 2: Updated StudentsTab with enhanced props */}
          {activeTab === 'students' && <StudentsTab {...tabProps} />}
          
          {activeTab === 'quests' && <QuestTab {...tabProps} />}
          {activeTab === 'shop' && <ShopTab {...tabProps} />}
          {activeTab === 'race' && <PetRaceTab {...tabProps} />}
          {activeTab === 'fishing' && <FishingGameTab {...tabProps} />}
          {activeTab === 'games' && <GamesTab {...tabProps} />}
          {activeTab === 'curriculum' && <CurriculumCornerTab {...tabProps} />}
          {activeTab === 'toolkit' && userData?.subscription === 'pro' && <TeachersToolkitTab {...tabProps} />}
          {activeTab === 'classes' && <ClassesTab {...tabProps} />}
          {activeTab === 'settings' && <SettingsTab {...tabProps} />}
        </Suspense>
      </div>

      {/* Persistent Timer */}
      {timerState.showMiniTimer && (
        <Suspense fallback={null}>
          <PersistentTimer {...tabProps} />
        </Suspense>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal {...tabProps} />
        )}
        
        {showAvatarSelectionModal && studentForAvatarChange && (
          <AvatarSelectionModal {...tabProps} />
        )}
        
        {levelUpData && (
          <LevelUpModal {...tabProps} />
        )}
        
        {petUnlockData && (
          <PetUnlockModal {...tabProps} />
        )}
        
        {showAddStudentModal && (
          <AddStudentModal {...tabProps} />
        )}
        
        {raceWinner && (
          <RaceWinnerModal {...tabProps} />
        )}
        
        {showRaceSetup && (
          <RaceSetupModal {...tabProps} />
        )}
        
        {questCompletionData && (
          <QuestCompletionModal {...tabProps} />
        )}
      </Suspense>

      {/* Loading Overlay */}
      {savingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Saving...</p>
          </div>
        </div>
      )}
    </div>
  );
}