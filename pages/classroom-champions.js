// classroom-champions.js - UPDATED WITH PHASE 3 OPTIMIZATIONS
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// PHASE 3: Import new organized modules
import { 
  GAME_CONFIG, 
  NAVIGATION_TABS, 
  QUEST_GIVERS, 
  QUEST_TEMPLATES,
  SHOP_ITEMS,
  LOOT_BOX_ITEMS,
  ITEM_RARITIES,
  AVAILABLE_AVATARS,
  PET_SPECIES,
  PET_NAMES,
  XP_REWARDS
} from '../constants/gameData';

import { 
  updateStudentWithCurrency,
  calculateCoins,
  canAfford,
  getRandomPet,
  getRandomPetName,
  calculatePetSpeed,
  getRandomAvatar,
  playXPSound,
  generateLootBoxRewards,
  formatTime,
  calculateStudentStats,
  calculateClassStats
} from '../utils/gameUtils';

import { 
  showToast, 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast,
  withAsyncErrorHandling,
  handleError 
} from '../utils/errorHandling';

import { useStudentManagement } from '../hooks/useStudentManagement';

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
  const coins = calculateCoins(student);
  const coinsSpent = student?.coinsSpent || 0;
  const xpCoins = Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP);
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

  // Core tab states
  const [activeTab, setActiveTab] = useState('dashboard');

  // PHASE 3: Use the new student management hook
  const studentManagement = useStudentManagement(user, userData?.activeClassId);
  const {
    students,
    setStudents,
    selectedStudent,
    setSelectedStudent,
    selectedStudents,
    setSelectedStudents,
    showAddStudentModal,
    setShowAddStudentModal,
    newStudentName,
    setNewStudentName,
    newStudentAvatar,
    setNewStudentAvatar,
    levelUpData,
    setLevelUpData,
    petUnlockData,
    setPetUnlockData,
    addStudent,
    removeStudent,
    awardXP,
    deductXP,
    awardCoins,
    spendCoins,
    changeAvatar,
    awardBulkXP,
    resetAllPoints,
    resetStudentPoints,
    toggleStudentSelection,
    selectAllStudents,
    clearSelection,
    fixAllStudentData,
    migrateAllStudents,
    saveStudentsToFirebase,
    classStats,
    getStudentById,
    getStudentsByLevel,
    getTopStudents,
    savingData
  } = studentManagement;

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
          handleError(error, 'User data loading');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ===============================================
  // SHOP & CURRENCY SYSTEM
  // ===============================================

  const handleShopStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleShopPurchase = useCallback(withAsyncErrorHandling(async (student, item) => {
    if (!canAfford(student, item.price)) {
      showWarningToast(`${student.firstName} doesn't have enough coins!`);
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
    showSuccessToast(`${student.firstName} purchased ${item.name}!`);
  }, 'handleShopPurchase'), [students, spendCoins, saveStudentsToFirebase]);

  const handleLootBoxPurchase = useCallback(withAsyncErrorHandling(async (student, lootBox) => {
    if (!canAfford(student, lootBox.price)) {
      showWarningToast(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    await spendCoins(student.id, lootBox.price);
    const rewards = generateLootBoxRewards(lootBox.id, LOOT_BOX_ITEMS);
    
    showSuccessToast(`${student.firstName} opened ${lootBox.name} and got ${rewards.length} items!`);
  }, 'handleLootBoxPurchase'), [spendCoins]);

  // ===============================================
  // QUEST SYSTEM FUNCTIONS
  // ===============================================

  const handleCreateQuest = useCallback((questData) => {
    const newQuest = {
      id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...questData,
      createdAt: new Date().toISOString(),
      completedBy: []
    };
    
    const updatedQuests = [...activeQuests, newQuest];
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
    showSuccessToast(`Quest "${questData.name}" created!`);
  }, [activeQuests, questTemplates, attendanceData]);

  const handleEditQuest = useCallback((questId, updatedData) => {
    const updatedQuests = activeQuests.map(quest =>
      quest.id === questId ? { ...quest, ...updatedData } : quest
    );
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
  }, [activeQuests, questTemplates, attendanceData]);

  const handleDeleteQuest = useCallback((questId) => {
    const updatedQuests = activeQuests.filter(quest => quest.id !== questId);
    setActiveQuests(updatedQuests);
    saveQuestDataToFirebase(updatedQuests, questTemplates, attendanceData);
    showSuccessToast('Quest deleted!');
  }, [activeQuests, questTemplates, attendanceData]);

  const handleCompleteQuest = useCallback(withAsyncErrorHandling(async (quest, student) => {
    if (quest.completedBy?.includes(student.id)) {
      showWarningToast(`${student.firstName} has already completed this quest!`);
      return;
    }

    // Award quest reward
    if (quest.reward.type === 'xp') {
      await awardXP(student, quest.reward.amount, quest.category);
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
    
    showSuccessToast(`${student.firstName} completed "${quest.name}" and earned ${quest.reward.amount} XP!`);
  }, 'handleCompleteQuest'), [activeQuests, questTemplates, attendanceData, awardXP]);

  const getAvailableQuests = useCallback((student) => {
    return activeQuests.filter(quest => !quest.completedBy?.includes(student.id));
  }, [activeQuests]);

  const handleAddQuestTemplate = useCallback((template) => {
    const newTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...template
    };
    const updatedTemplates = [...questTemplates, newTemplate];
    setQuestTemplates(updatedTemplates);
    saveQuestDataToFirebase(activeQuests, updatedTemplates, attendanceData);
  }, [questTemplates, activeQuests, attendanceData]);

  const handleEditQuestTemplate = useCallback((templateId, updatedData) => {
    const updatedTemplates = questTemplates.map(template =>
      template.id === templateId ? { ...template, ...updatedData } : template
    );
    setQuestTemplates(updatedTemplates);
    saveQuestDataToFirebase(activeQuests, updatedTemplates, attendanceData);
  }, [questTemplates, activeQuests, attendanceData]);

  const handleDeleteQuestTemplate = useCallback((templateId) => {
    const updatedTemplates = questTemplates.filter(template => template.id !== templateId);
    setQuestTemplates(updatedTemplates);
    saveQuestDataToFirebase(activeQuests, updatedTemplates, attendanceData);
  }, [questTemplates, activeQuests, attendanceData]);

  const handleResetQuestTemplates = useCallback(() => {
    setQuestTemplates(QUEST_TEMPLATES);
    saveQuestDataToFirebase(activeQuests, QUEST_TEMPLATES, attendanceData);
    showSuccessToast('Quest templates reset to defaults!');
  }, [activeQuests, attendanceData]);

  const showRandomQuestGiverTip = useCallback(() => {
    const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
    const randomTip = randomGiver.tips[Math.floor(Math.random() * randomGiver.tips.length)];
    showToast(`${randomGiver.name}: ${randomTip}`, 'info');
  }, []);

  const checkQuestCompletionSafely = useCallback((quest, student) => {
    try {
      return quest?.completedBy?.includes(student?.id) || false;
    } catch (error) {
      console.warn('Error checking quest completion:', error);
      return false;
    }
  }, []);

  // ===============================================
  // PET RACE SYSTEM
  // ===============================================

  const awardRacePrize = useCallback(withAsyncErrorHandling(async (winner, prize) => {
    const student = students.find(s => s.pet?.id === winner.pet.id || s.ownedPets?.some(p => p.id === winner.pet.id));
    
    if (!student) return;

    if (prize.type === 'xp') {
      await awardXP(student, prize.amount, prize.category || 'general');
    } else if (prize.type === 'coins') {
      await awardCoins(student, prize.amount);
    }

    showSuccessToast(`🏆 ${student.firstName}'s ${winner.pet.name} won the race and earned ${prize.amount} ${prize.type}!`);
  }, 'awardRacePrize'), [students, awardXP, awardCoins]);

  // ===============================================
  // ATTENDANCE SYSTEM
  // ===============================================

  const markAttendance = useCallback(async (studentId, date, status) => {
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
  }, [attendanceData, activeQuests, questTemplates]);

  // ===============================================
  // TIMER FUNCTIONS
  // ===============================================

  const handleTimerComplete = useCallback(() => {
    showSuccessToast('⏰ Timer completed!');
  }, []);

  const handleTimerUpdate = useCallback((newState) => {
    setTimerState(newState);
  }, []);

  const handleShowFullTimer = useCallback(() => {
    setActiveTab('toolkit');
  }, []);

  // ===============================================
  // SETTINGS & UTILITY FUNCTIONS
  // ===============================================

  const handleSubscriptionManagement = useCallback(withAsyncErrorHandling(async () => {
    if (!userData?.stripeCustomerId) {
      showWarningToast('Please contact support for subscription management.');
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
      showErrorToast('Error opening billing portal. Please contact support.');
    }
  }, 'handleSubscriptionManagement'), [userData]);

  const handleSubmitFeedback = useCallback(withAsyncErrorHandling(async () => {
    if (!feedbackMessage.trim()) {
      showWarningToast('Please enter your feedback message.');
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

      console.log('Feedback submitted:', feedbackData);
      
      setShowFeedbackModal(false);
      setFeedbackMessage('');
      setFeedbackSubject('');
      setFeedbackEmail('');
      showSuccessToast('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showErrorToast('Error submitting feedback. Please try again.');
    }
  }, 'handleSubmitFeedback'), [feedbackType, feedbackSubject, feedbackMessage, feedbackEmail, user]);

  // ===============================================
  // AVATAR MANAGEMENT
  // ===============================================

  const handleChangeAvatar = useCallback((student, avatarBase) => {
    changeAvatar(student, avatarBase);
    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
  }, [changeAvatar]);

  // ===============================================
  // CLASS MANAGEMENT FUNCTIONS
  // ===============================================

  const loadClass = useCallback(withAsyncErrorHandling(async (classData) => {
    try {
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
      
      showSuccessToast(`Loaded class: ${classData.name}`);
    } catch (error) {
      console.error("Error loading class:", error);
      showErrorToast('Error loading class');
    }
  }, 'loadClass'), [user, setStudents]);

  const handleClassImport = useCallback(withAsyncErrorHandling(async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      showWarningToast('Please enter a class name and student list!');
      return;
    }

    try {
      const studentLines = newClassStudents.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const newStudents = studentLines.map((name, index) => {
        const randomAvatar = getRandomAvatar();
        const student = {
          id: `student_${Date.now()}_${index}`,
          firstName: name,
          lastName: '',
          totalPoints: 0,
          currency: 0,
          avatarLevel: 1,
          avatarBase: randomAvatar,
          avatar: '',
          createdAt: new Date().toISOString()
        };
        return migrateStudentData(student);
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
      
      showSuccessToast(`Class "${newClassName}" created with ${newStudents.length} students!`);
    } catch (error) {
      console.error("Error creating class:", error);
      showErrorToast('Error creating class');
    }
  }, 'handleClassImport'), [newClassName, newClassStudents, user, loadClass]);

  // ===============================================
  // FIREBASE SAVE FUNCTIONS
  // ===============================================

  const saveQuestDataToFirebase = useCallback(withAsyncErrorHandling(async (questData, questTemplates, attendanceData) => {
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
  }, 'saveQuestDataToFirebase'), [user, currentClassId]);

  const saveGroupDataToFirebase = useCallback(withAsyncErrorHandling(async (groupData) => {
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
  }, 'saveGroupDataToFirebase'), [user, currentClassId]);

  const saveClassroomDataToFirebase = useCallback(withAsyncErrorHandling(async (classroomData) => {
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
  }, 'saveClassroomDataToFirebase'), [user, currentClassId]);

  const saveVocabularyDataToFirebase = useCallback(withAsyncErrorHandling(async (vocabularyData) => {
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
  }, 'saveVocabularyDataToFirebase'), [user, currentClassId]);

  // ===============================================
  // LEVEL UP SYSTEM
  // ===============================================

  const checkForLevelUp = useCallback((student) => {
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
  }, []);

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
    
    // Student management (from hook)
    ...studentManagement,
    
    // Data persistence
    showToast: showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    
    // Class management
    savedClasses,
    setSavedClasses,
    loadClass,
    handleClassImport,
    newClassName,
    setNewClassName,
    newClassStudents,
    setNewClassStudents,
    
    // Avatar system
    handleChangeAvatar,
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    
    // Shop functions
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
    calculateSpeed: calculatePetSpeed,
    RACE_DISTANCE: GAME_CONFIG.RACE_DISTANCE,
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
    MAX_LEVEL: GAME_CONFIG.MAX_LEVEL,
    calculateCoins,
    canAfford,
    calculateStudentStats,
    
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

      {/* Navigation - PHASE 3: Using centralized navigation config */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {NAVIGATION_TABS.map((tab) => (
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