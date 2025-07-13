// classroom-champions.js - COMPLETE WITH QUEST SYSTEM OVERHAUL + GAMES TAB + FIXED QUEST MANAGEMENT
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
const QuestManagementModal = React.lazy(() => import('../components/modals/QuestManagementModal')); // FIXED: Added missing import

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
    questTypes: ['organization', 'punctuality', 'responsibility'],
    tips: [
      "📅 Tip: Planning ahead prevents last-minute stress!",
      "⏰ Time management is a superpower!",
      "🎯 Small consistent actions lead to big results!"
    ]
  },
  {
    id: 'guide3',
    name: 'Spark the Motivator',
    image: '/Guides/Guide 3.png',
    personality: 'energetic',
    role: 'Enthusiasm Quest Giver',
    specialty: 'behavior',
    greetings: [
      "Let's spark some amazing energy! ⚡",
      "Ready to light up the classroom?",
      "Your enthusiasm is contagious!"
    ],
    questTypes: ['participation', 'enthusiasm', 'teamwork'],
    tips: [
      "⚡ Tip: Positive energy multiplies when shared!",
      "🌟 Your attitude determines your altitude!",
      "🎉 Celebrate every small victory!"
    ]
  },
  {
    id: 'guide4',
    name: 'Shield Guardian',
    image: '/Guides/Guide 4.png',
    personality: 'protective',
    role: 'Respect Quest Giver',
    specialty: 'behavior',
    greetings: [
      "Respect and kindness are your greatest weapons! 🛡️",
      "Ready to be a guardian of peace?",
      "Your actions protect others!"
    ],
    questTypes: ['respect', 'kindness', 'helping'],
    tips: [
      "🛡️ Tip: True strength comes from protecting others!",
      "💙 Kindness is never wasted!",
      "🤝 We rise by lifting others!"
    ]
  },
  {
    id: 'guide5',
    name: 'Sage Willow',
    image: '/Guides/Guide 5.png',
    personality: 'wise',
    role: 'Growth Quest Giver',
    specialty: 'academic',
    greetings: [
      "Growth comes from reflection and effort! 🌱",
      "Ready to bloom into your potential?",
      "The journey of learning never ends!"
    ],
    questTypes: ['improvement', 'reflection', 'persistence'],
    tips: [
      "🌱 Tip: Growth happens outside your comfort zone!",
      "🍃 Every mistake is a learning opportunity!",
      "🔮 Patience and persistence unlock potential!"
    ]
  },
  {
    id: 'guide6',
    name: 'Explorer Quinn',
    image: '/Guides/Guide 6.png',
    personality: 'adventurous',
    role: 'Discovery Quest Giver',
    specialty: 'academic',
    greetings: [
      "Adventure awaits in every lesson! 🗺️",
      "Ready to explore new knowledge?",
      "Curiosity is your compass!"
    ],
    questTypes: ['research', 'exploration', 'creativity'],
    tips: [
      "🗺️ Tip: The best adventures start with curiosity!",
      "🎒 Pack your imagination for every journey!",
      "🔍 Questions are more valuable than answers!"
    ]
  }
];

const QUEST_TEMPLATES = [
  // Academic Quests
  {
    id: 'math-mastery',
    title: 'Math Mastery Challenge',
    description: 'Complete 5 math problems with perfect accuracy',
    icon: '🔢',
    category: 'academic',
    difficulty: 'medium',
    questGiver: 'guide1',
    estimatedTime: '20 minutes',
    reward: { type: 'coins', amount: 8 },
    type: 'manual'
  },
  {
    id: 'reading-champion',
    title: 'Reading Champion',
    description: 'Read for 30 minutes and summarize what you learned',
    icon: '📖',
    category: 'academic',
    difficulty: 'easy',
    questGiver: 'guide1',
    estimatedTime: '30 minutes',
    reward: { type: 'coins', amount: 6 },
    type: 'manual'
  },
  {
    id: 'science-explorer',
    title: 'Science Explorer',
    description: 'Conduct a science experiment and record observations',
    icon: '🔬',
    category: 'academic',
    difficulty: 'hard',
    questGiver: 'guide6',
    estimatedTime: '45 minutes',
    reward: { type: 'coins', amount: 12 },
    type: 'manual'
  },
  {
    id: 'creative-writer',
    title: 'Creative Writer',
    description: 'Write a creative story of at least 200 words',
    icon: '✍️',
    category: 'academic',
    difficulty: 'medium',
    questGiver: 'guide6',
    estimatedTime: '25 minutes',
    reward: { type: 'coins', amount: 9 },
    type: 'manual'
  },

  // Behavior Quests
  {
    id: 'kindness-warrior',
    title: 'Kindness Warrior',
    description: 'Perform 3 acts of kindness for classmates',
    icon: '💝',
    category: 'behavior',
    difficulty: 'easy',
    questGiver: 'guide4',
    estimatedTime: 'Throughout the day',
    reward: { type: 'coins', amount: 7 },
    type: 'manual'
  },
  {
    id: 'team-builder',
    title: 'Team Builder',
    description: 'Help a classmate who is struggling with work',
    icon: '🤝',
    category: 'behavior',
    difficulty: 'medium',
    questGiver: 'guide4',
    estimatedTime: '15 minutes',
    reward: { type: 'coins', amount: 8 },
    type: 'manual'
  },
  {
    id: 'energy-booster',
    title: 'Energy Booster',
    description: 'Encourage 5 classmates with positive words',
    icon: '⚡',
    category: 'behavior',
    difficulty: 'easy',
    questGiver: 'guide3',
    estimatedTime: '10 minutes',
    reward: { type: 'coins', amount: 5 },
    type: 'manual'
  },
  {
    id: 'conflict-resolver',
    title: 'Conflict Resolver',
    description: 'Help solve a disagreement peacefully',
    icon: '🕊️',
    category: 'behavior',
    difficulty: 'hard',
    questGiver: 'guide4',
    estimatedTime: '20 minutes',
    reward: { type: 'coins', amount: 15 },
    type: 'manual'
  },

  // Responsibility Quests
  {
    id: 'homework-hero',
    title: 'Homework Hero',
    description: 'Complete all homework assignments on time for one week',
    icon: '📚',
    category: 'responsibility',
    difficulty: 'medium',
    questGiver: 'guide2',
    estimatedTime: 'One week',
    reward: { type: 'coins', amount: 20 },
    type: 'manual'
  },
  {
    id: 'classroom-cleaner',
    title: 'Classroom Cleaner',
    description: 'Organize and clean your workspace without being asked',
    icon: '🧹',
    category: 'responsibility',
    difficulty: 'easy',
    questGiver: 'guide2',
    estimatedTime: '10 minutes',
    reward: { type: 'coins', amount: 4 },
    type: 'manual'
  },
  {
    id: 'supply-manager',
    title: 'Supply Manager',
    description: 'Keep track of and organize classroom supplies for the day',
    icon: '📦',
    category: 'responsibility',
    difficulty: 'medium',
    questGiver: 'guide2',
    estimatedTime: '30 minutes',
    reward: { type: 'coins', amount: 10 },
    type: 'manual'
  },
  {
    id: 'punctuality-master',
    title: 'Punctuality Master',
    description: 'Arrive to class on time every day for one week',
    icon: '⏰',
    category: 'responsibility',
    difficulty: 'easy',
    questGiver: 'guide2',
    estimatedTime: 'One week',
    reward: { type: 'coins', amount: 15 },
    type: 'manual'
  },

  // Weekly Challenges
  {
    id: 'growth-mindset',
    title: 'Growth Mindset Week',
    description: 'Show improvement in one subject area over the week',
    icon: '🌱',
    category: 'weekly',
    difficulty: 'medium',
    questGiver: 'guide5',
    estimatedTime: 'One week',
    reward: { type: 'coins', amount: 25 },
    type: 'manual'
  },
  {
    id: 'leadership-challenge',
    title: 'Leadership Challenge',
    description: 'Lead a group project or activity successfully',
    icon: '👑',
    category: 'weekly',
    difficulty: 'hard',
    questGiver: 'guide3',
    estimatedTime: 'One week',
    reward: { type: 'coins', amount: 30 },
    type: 'manual'
  }
];

// ===============================================
// AVATAR SYSTEM
// ===============================================

const AVATAR_BASES = [
  'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight', 
  'Crystal Sage', 'Engineer', 'Frost Mage', 'Illusionist', 'Knight', 'Lightning', 
  'Monk', 'Necromancer', 'Rogue', 'Stealth', 'Time Knight', 'Warrior', 'Wizard'
];

const getAvatarImage = (base, level) => {
  return `/avatars/${base}/${base} lvl ${level}.png`;
};

const getRandomPetName = () => {
  const names = [
    'Sparkle', 'Shadow', 'Flame', 'Frost', 'Thunder', 'Storm', 'Blaze', 'Crystal',
    'Nova', 'Echo', 'Dash', 'Spirit', 'Mystic', 'Comet', 'Star', 'Luna',
    'Phoenix', 'Sage', 'Knight', 'Scout', 'Flash', 'Bolt', 'Ember', 'Mist'
  ];
  return names[Math.floor(Math.random() * names.length)];
};

// Pet generation and speed calculation
const generatePet = () => {
  const pets = AVATAR_BASES;
  const randomPet = pets[Math.floor(Math.random() * pets.length)];
  return {
    type: randomPet,
    name: getRandomPetName(),
    speed: Math.floor(Math.random() * 50) + 25,
    image: `/pets/${randomPet}.png`,
    wins: 0
  };
};

const calculateSpeed = (pet) => {
  if (!pet) return 0;
  const baseSpeed = pet.speed || 50;
  const winBonus = (pet.wins || 0) * 2;
  return Math.min(baseSpeed + winBonus, 100);
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const showToast = (message, type = 'info') => {
  // Toast notification system
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} opacity-0 transform translate-y-2 transition-all duration-300`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `
    <div class="flex items-center space-x-2 bg-white rounded-lg shadow-lg border-l-4 ${
      type === 'success' ? 'border-green-500' : 
      type === 'error' ? 'border-red-500' : 'border-blue-500'
    } p-4">
      <span class="text-xl">${icon}</span>
      <span class="text-gray-800 font-medium">${message}</span>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

const createToastContainer = () => {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'fixed top-4 right-4 z-50 space-y-2';
  document.body.appendChild(container);
  return container;
};

const calculateTotalCoins = (student) => {
  const baseCoins = Math.floor(student.totalPoints / 5) || 0;
  const bonusCoins = student.bonusCoins || 0;
  const coinsSpent = student.coinsSpent || 0;
  return Math.max(0, baseCoins + bonusCoins - coinsSpent);
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
  const [selectedStudentForQuests, setSelectedStudentForQuests] = useState(null);
  const [selectedQuestGiver, setSelectedQuestGiver] = useState(null);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  
  // Attendance system
  const [attendanceData, setAttendanceData] = useState({});
  
  // User and class management
  const [userData, setUserData] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');

  // ===============================================
  // FIREBASE FUNCTIONS
  // ===============================================

  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;
    
    setSavingData(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedClasses = userData.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, students: updatedStudents }
            : cls
        );
        
        await setDoc(userDocRef, { 
          ...userData, 
          classes: updatedClasses 
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      showToast('Error saving data. Please try again.', 'error');
    } finally {
      setSavingData(false);
    }
  };

  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedClasses = userData.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...questData }
            : cls
        );
        
        await setDoc(userDocRef, { 
          ...userData, 
          classes: updatedClasses 
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving quest data:', error);
      showToast('Error saving quest data', 'error');
    }
  };

  // ===============================================
  // XP AND LEVEL SYSTEM
  // ===============================================

  const checkForLevelUp = (student) => {
    const currentLevel = student.avatarLevel || 1;
    const totalPoints = student.totalPoints || 0;
    
    let newLevel = 1;
    if (totalPoints >= 200) newLevel = 4;
    else if (totalPoints >= 100) newLevel = 3;
    else if (totalPoints >= 50) newLevel = 2;
    
    if (newLevel > currentLevel) {
      return {
        student: student,
        oldLevel: currentLevel,
        newLevel: newLevel,
        newAvatar: getAvatarImage(student.avatarBase, newLevel)
      };
    }
    
    return null;
  };

  const handleAwardXP = async (studentId, category, points) => {
    setAnimatingXP(prev => ({ ...prev, [studentId]: true }));
    
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (student.id === studentId) {
          const newCategoryTotal = (student.categoryTotal?.[category] || 0) + points;
          const newCategoryWeekly = (student.categoryWeekly?.[category] || 0) + points;
          const newTotalPoints = (student.totalPoints || 0) + points;
          
          const updatedStudent = {
            ...student,
            totalPoints: newTotalPoints,
            weeklyPoints: (student.weeklyPoints || 0) + points,
            categoryTotal: {
              ...student.categoryTotal,
              [category]: newCategoryTotal
            },
            categoryWeekly: {
              ...student.categoryWeekly,
              [category]: newCategoryWeekly
            },
            logs: [
              ...(student.logs || []),
              {
                type: 'xp',
                category,
                amount: points,
                timestamp: new Date().toISOString()
              }
            ]
          };
          
          // Check for level up
          const levelUpInfo = checkForLevelUp(updatedStudent);
          if (levelUpInfo) {
            updatedStudent.avatarLevel = levelUpInfo.newLevel;
            updatedStudent.avatar = levelUpInfo.newAvatar;
            setLevelUpData(levelUpInfo);
          }
          
          // Check for pet unlock
          if (newTotalPoints >= 50 && !student.pet) {
            const newPet = generatePet();
            updatedStudent.pet = newPet;
            setPetUnlockData({ student: updatedStudent, pet: newPet });
          }
          
          return updatedStudent;
        }
        return student;
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setTimeout(() => {
      setAnimatingXP(prev => ({ ...prev, [studentId]: false }));
    }, 1000);
    
    showToast(`+${points} ${category} XP awarded!`, 'success');
  };

  // ===============================================
  // STUDENT MANAGEMENT
  // ===============================================

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
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
  };

  const handleBulkXpAward = () => {
    if (selectedStudents.length === 0) {
      showToast('Please select students first', 'error');
      return;
    }
    
    selectedStudents.forEach(studentId => {
      handleAwardXP(studentId, bulkXpCategory, bulkXpAmount);
    });
    
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    showToast(`Awarded ${bulkXpAmount} ${bulkXpCategory} XP to ${selectedStudents.length} students!`, 'success');
  };

  const handleAvatarClick = (student) => {
    setSelectedStudent(student);
  };

  // ===============================================
  // QUEST SYSTEM FUNCTIONS
  // ===============================================

  const getAvailableQuests = (student) => {
    return activeQuests.filter(quest => 
      !quest.completedBy.includes(student.id)
    );
  };

  const completeQuest = (questId, studentId) => {
    const quest = activeQuests.find(q => q.id === questId);
    const student = students.find(s => s.id === studentId);
    
    if (!quest || !student) return;
    
    // Update quest completion
    setActiveQuests(prev => {
      const updated = prev.map(q => 
        q.id === questId 
          ? { ...q, completedBy: [...q.completedBy, studentId] }
          : q
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    // Award coins
    setStudents(prev => {
      const updated = prev.map(s => 
        s.id === studentId 
          ? { 
              ...s, 
              bonusCoins: (s.bonusCoins || 0) + quest.reward.amount,
              logs: [
                ...(s.logs || []),
                {
                  type: 'quest',
                  questId: quest.id,
                  questTitle: quest.title,
                  reward: quest.reward.amount,
                  timestamp: new Date().toISOString()
                }
              ]
            }
          : s
      );
      saveStudentsToFirebase(updated);
      return updated;
    });
    
    // Show completion modal
    const questGiver = QUEST_GIVERS.find(qg => qg.id === quest.questGiver);
    setQuestCompletionData({
      quest,
      student,
      questGiver
    });
    
    setSelectedStudentForQuests(null);
    
    if (quest.reward.type === 'coins') {
      showToast(`${student.firstName} completed "${quest.title}"! Awarded ${quest.reward.amount} coins!`, 'success');
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
    
    showToast(`Added quest: ${template.title}`, 'success');
  };

  const removeQuestFromActive = (questId) => {
    setActiveQuests(prev => {
      const updated = prev.filter(quest => quest.id !== questId);
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });
    
    showToast('Quest removed successfully!', 'success');
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
    
    showToast(`Created custom quest: ${questData.title}`, 'success');
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
    showToast(`Marked ${student?.firstName} as ${status} for ${date}`, 'success');
  };

  // Class management functions
  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      showToast("Please enter both class name and student names", 'error');
      return;
    }

    const maxAllowed = userData?.subscription === 'pro' ? 5 : 1;
    if (teacherClasses.length >= maxAllowed) {
      showToast(`Your ${userData?.subscription || 'basic'} plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}. Please upgrade to add more classes.`, 'error');
      return;
    }

    const studentNames = newClassStudents.split('\n').filter(name => name.trim());
    const newStudents = studentNames.map((name, index) => {
      const randomAvatarBase = AVATAR_BASES[Math.floor(Math.random() * AVATAR_BASES.length)];
      return {
        id: Date.now() + index,
        firstName: name.trim(),
        avatarBase: randomAvatarBase,
        avatarLevel: 1,
        avatar: getAvatarImage(randomAvatarBase, 1),
        totalPoints: 0,
        weeklyPoints: 0,
        categoryTotal: {},
        categoryWeekly: {},
        logs: []
      };
    });

    const newClass = {
      id: Date.now(),
      name: newClassName.trim(),
      students: newStudents,
      createdAt: new Date().toISOString(),
      activeQuests: [],
      questTemplates: QUEST_TEMPLATES,
      attendanceData: {}
    };

    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const updatedClasses = [...teacherClasses, newClass];
      
      await setDoc(userDocRef, { 
        ...userData,
        classes: updatedClasses 
      }, { merge: true });
      
      setTeacherClasses(updatedClasses);
      setNewClassName('');
      setNewClassStudents('');
      showToast(`Class "${newClass.name}" created successfully with ${newStudents.length} students!`, 'success');
    } catch (error) {
      console.error('Error creating class:', error);
      showToast('Error creating class. Please try again.', 'error');
    }
  };

  const loadClass = async (classData) => {
    setCurrentClassId(classData.id);
    setStudents(classData.students || []);
    setActiveQuests(classData.activeQuests || []);
    setQuestTemplates(classData.questTemplates || QUEST_TEMPLATES);
    setAttendanceData(classData.attendanceData || {});
    setActiveTab('students');
    showToast(`Loaded class: ${classData.name}`, 'success');
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          
          const docRef = doc(firestore, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setTeacherClasses(data.classes || []);
            
            const savedClasses = data.classes || [];
            if (savedClasses.length > 0) {
              const activeClassId = localStorage.getItem('activeClassId');
              const activeClass = activeClassId ? 
                savedClasses.find(cls => cls.id === activeClassId) 
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
    handleClassImport,
    teacherClasses,
    setTeacherClasses,
    loadClass,
    currentClassId,
    setCurrentClassId,
    userData,
    setUserData,
    user,
    showToast,
    router,
    AVATAR_BASES,
    getAvatarImage,
    calculateTotalCoins,
    setSelectedStudentForQuests,
    selectedStudentForQuests,
    getAvailableQuests
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🏆 Classroom Champions
              </h1>
              <p className="text-gray-600">
                Transform your classroom into an epic RPG adventure!
              </p>
              {currentClassId && (
                <p className="text-sm text-blue-600 mt-1">
                  Current Class: {teacherClasses.find(cls => cls.id === currentClassId)?.name}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {savingData && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                Plan: <span className="font-semibold capitalize">{userData?.subscription || 'Basic'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'students', label: '👥 Students', icon: '👥' },
              { id: 'shop', label: '🛒 Shop', icon: '🛒' },
              { id: 'pet-race', label: '🏁 Pet Race', icon: '🏁' },
              { id: 'games', label: '🎮 Games', icon: '🎮' },
              { id: 'classes', label: '📚 Classes', icon: '📚' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
              ...(userData?.subscription === 'pro' ? [{ id: 'toolkit', label: '🛠️ Toolkit', icon: '🛠️' }] : [])
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xl">{tab.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Suspense fallback={
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        }>
          {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
          {activeTab === 'students' && <StudentsTab {...tabProps} />}
          {activeTab === 'shop' && <ShopTab {...tabProps} />}
          {activeTab === 'pet-race' && <PetRaceTab {...tabProps} />}
          {activeTab === 'games' && <GamesTab {...tabProps} />}
          {activeTab === 'classes' && <ClassesTab {...tabProps} />}
          {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          {activeTab === 'toolkit' && userData?.subscription === 'pro' && <TeachersToolkitTab {...tabProps} />}
        </Suspense>

        {/* Modals */}
        <Suspense fallback={null}>
          {selectedStudent && (
            <CharacterSheetModal
              student={selectedStudent}
              onClose={() => setSelectedStudent(null)}
              onChangeAvatar={(student) => {
                setStudentForAvatarChange(student);
                setShowAvatarSelectionModal(true);
                setSelectedStudent(null);
              }}
            />
          )}

          {showAvatarSelectionModal && (
            <AvatarSelectionModal
              student={studentForAvatarChange}
              onClose={() => {
                setShowAvatarSelectionModal(false);
                setStudentForAvatarChange(null);
              }}
              onSelectAvatar={(avatarBase) => {
                setStudents(prev => prev.map(s => 
                  s.id === studentForAvatarChange.id 
                    ? { 
                        ...s, 
                        avatarBase: avatarBase,
                        avatar: getAvatarImage(avatarBase, s.avatarLevel || 1)
                      }
                    : s
                ));
                setShowAvatarSelectionModal(false);
                setStudentForAvatarChange(null);
                showToast('Avatar updated successfully!', 'success');
              }}
              AVATAR_BASES={AVATAR_BASES}
              getAvatarImage={getAvatarImage}
            />
          )}

          {levelUpData && (
            <LevelUpModal
              levelUpData={levelUpData}
              onClose={() => setLevelUpData(null)}
            />
          )}

          {petUnlockData && (
            <PetUnlockModal
              petData={petUnlockData}
              onClose={() => setPetUnlockData(null)}
              onNamePet={(petName) => {
                setStudents(prev => prev.map(s => 
                  s.id === petUnlockData.student.id 
                    ? { ...s, pet: { ...s.pet, name: petName } }
                    : s
                ));
                saveStudentsToFirebase(students.map(s => 
                  s.id === petUnlockData.student.id 
                    ? { ...s, pet: { ...s.pet, name: petName } }
                    : s
                ));
                setPetUnlockData(null);
                showToast(`Pet named ${petName}!`, 'success');
              }}
              petNameInput={petNameInput}
              setPetNameInput={setPetNameInput}
              randomPetName={getRandomPetName}
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
              questData={questCompletionData}
              onClose={() => setQuestCompletionData(null)}
            />
          )}

          {/* FIXED: Added Quest Management Modal */}
          {showQuestManagement && (
            <QuestManagementModal
              questTemplates={questTemplates}
              activeQuests={activeQuests}
              onAddQuest={addQuestToActive}
              onRemoveQuest={removeQuestFromActive}
              onCreateQuest={createCustomQuest}
              onClose={() => setShowQuestManagement(false)}
              QUEST_GIVERS={QUEST_GIVERS}
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
                  const updated = [...prev, newStudent];
                  saveStudentsToFirebase(updated);
                  return updated;
                });
                
                setShowAddStudentModal(false);
                setNewStudentName('');
                setNewStudentAvatar('');
                showToast(`Added ${name} to the class!`, 'success');
              }}
              newStudentName={newStudentName}
              setNewStudentName={setNewStudentName}
              newStudentAvatar={newStudentAvatar}
              setNewStudentAvatar={setNewStudentAvatar}
              AVATAR_BASES={AVATAR_BASES}
              getAvatarImage={getAvatarImage}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}