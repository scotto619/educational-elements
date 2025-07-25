// pages/classroom-champions.js - UPDATED WITH PHASE 3 OPTIMIZATIONS AND SHOPTAB INTEGRATION
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
  XP_REWARDS,
  DEFAULT_TEACHER_REWARDS
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

export default function ClassroomChampions() {
  const router = useRouter();
  
  // ===============================================
  // AUTHENTICATION & USER STATE
  // ===============================================
  
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // ===============================================
  // STUDENT MANAGEMENT HOOK
  // ===============================================
  
  const studentManagement = useStudentManagement(user, currentClassId);
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
    awardBulkCoins,
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
  // FIREBASE DATA OPERATIONS
  // ===============================================

  const saveQuestDataToFirebase = useCallback(withAsyncErrorHandling(async (activeQuests, questTemplates, attendanceData) => {
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
                activeQuests: activeQuests || cls.activeQuests,
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
                vocabularyData: vocabularyData,
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

  // Load class data including quests, attendance, and other tab data
  const loadClassDataFromFirebase = useCallback(withAsyncErrorHandling(async () => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const currentClass = data.classes?.find(cls => cls.id === currentClassId);
        
        if (currentClass) {
          // Load quest data
          if (currentClass.activeQuests) {
            setActiveQuests(currentClass.activeQuests);
          }
          if (currentClass.questTemplates) {
            setQuestTemplates(currentClass.questTemplates);
          }
          if (currentClass.attendanceData) {
            setAttendanceData(currentClass.attendanceData);
          }
        }
      }
    } catch (error) {
      console.error("Error loading class data:", error);
    }
  }, 'loadClassDataFromFirebase'), [user, currentClassId]);

  // ===============================================
  // AUTHENTICATION SETUP
  // ===============================================
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setSavedClasses(data.classes || []);
            
            // Auto-select the first class if available
            if (data.classes && data.classes.length > 0 && !currentClassId) {
              setCurrentClassId(data.classes[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          showErrorToast('Failed to load user data');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, currentClassId]);

  // Load additional class data when currentClassId changes
  useEffect(() => {
    if (currentClassId) {
      loadClassDataFromFirebase();
    }
  }, [currentClassId, loadClassDataFromFirebase]);

  // ===============================================
  // QUEST SYSTEM FUNCTIONS
  // ===============================================

  const saveQuestDataSafely = useCallback(() => {
    saveQuestDataToFirebase(activeQuests, questTemplates, attendanceData);
  }, [activeQuests, questTemplates, attendanceData, saveQuestDataToFirebase]);

  useEffect(() => {
    const interval = setInterval(saveQuestDataSafely, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [saveQuestDataSafely]);

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
  }, [attendanceData, activeQuests, questTemplates, saveQuestDataToFirebase]);

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

    // Implement Stripe customer portal redirect
    showToast('Redirecting to subscription management...', 'info');
  }, 'handleSubscriptionManagement'), [userData]);

  const handleSendFeedback = useCallback(withAsyncErrorHandling(async () => {
    if (!feedbackSubject.trim() || !feedbackMessage.trim()) {
      showWarningToast('Please fill in all required fields.');
      return;
    }

    // Simulate sending feedback (implement actual submission)
    showSuccessToast('Feedback sent successfully! Thank you for helping us improve.');
    setShowFeedbackModal(false);
    setFeedbackSubject('');
    setFeedbackMessage('');
    setFeedbackEmail('');
  }, 'handleSendFeedback'), [feedbackSubject, feedbackMessage, feedbackEmail]);

  // ===============================================
  // NAVIGATION FUNCTIONS
  // ===============================================

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    
    // Clear selections when changing tabs
    setSelectedStudent(null);
    setSelectedStudents([]);
    
    // Play tab change sound
    playXPSound(0.2);
  }, []);

  const handleLogout = useCallback(withAsyncErrorHandling(async () => {
    await auth.signOut();
    router.push('/');
  }, 'handleLogout'), [router]);

  // ===============================================
  // CLASS MANAGEMENT
  // ===============================================

  const handleClassChange = useCallback((classId) => {
    setCurrentClassId(classId);
    setActiveTab('dashboard'); // Reset to dashboard when changing classes
  }, []);

  const handleDeleteClass = useCallback(withAsyncErrorHandling(async (classIdToDelete) => {
    if (!user) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.filter(cls => cls.id !== classIdToDelete);
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
        
        setSavedClasses(updatedClasses);
        
        if (currentClassId === classIdToDelete) {
          setCurrentClassId(updatedClasses.length > 0 ? updatedClasses[0].id : null);
        }
        
        showSuccessToast('Class deleted successfully!');
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      showErrorToast('Failed to delete class');
    }
  }, 'handleDeleteClass'), [user, currentClassId]);

  // ===============================================
  // MAIN RENDER
  // ===============================================

  if (loading) {
    return <LoadingSpinner />;
  }

  const currentClass = savedClasses.find(cls => cls.id === currentClassId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🏆</div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Classroom Champions
                </h1>
                {currentClass && (
                  <p className="text-sm text-gray-600 font-medium">
                    📚 {currentClass.name} • {students.length} students
                  </p>
                )}
              </div>
            </div>

            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {userData && (
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{userData.email}</p>
                  <p className="text-xs text-gray-600">
                    {userData.plan === 'pro' ? '✨ Pro Account' : '📖 Basic Account'}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200 overflow-x-auto">
            <div className="flex space-x-1 py-2 min-w-max">
              {NAVIGATION_TABS.map(tab => {
                const isProFeature = tab.isPro && userData?.plan !== 'pro';
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isProFeature && handleTabChange(tab.id)}
                    disabled={isProFeature}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                        : isProFeature
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-blue-600'
                      }
                    `}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isProFeature && <span className="text-xs">PRO</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Suspense fallback={<TabLoadingSpinner />}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <DashboardTab
              students={students}
              classStats={classStats}
              currentClass={currentClass}
              userData={userData}
              activeQuests={activeQuests}
              onTabChange={handleTabChange}
            />
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <StudentsTab
              students={students}
              setStudents={setStudents}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              selectedStudents={selectedStudents}
              setSelectedStudents={setSelectedStudents}
              showAddStudentModal={showAddStudentModal}
              setShowAddStudentModal={setShowAddStudentModal}
              newStudentName={newStudentName}
              setNewStudentName={setNewStudentName}
              newStudentAvatar={newStudentAvatar}
              setNewStudentAvatar={setNewStudentAvatar}
              levelUpData={levelUpData}
              setLevelUpData={setLevelUpData}
              petUnlockData={petUnlockData}
              setPetUnlockData={setPetUnlockData}
              addStudent={addStudent}
              removeStudent={removeStudent}
              awardXP={awardXP}
              deductXP={deductXP}
              awardCoins={awardCoins}
              changeAvatar={changeAvatar}
              awardBulkXP={awardBulkXP}
              toggleStudentSelection={toggleStudentSelection}
              selectAllStudents={selectAllStudents}
              clearSelection={clearSelection}
              saveStudentsToFirebase={saveStudentsToFirebase}
              showToast={showToast}
              userData={userData}
            />
          )}

          {/* Quests Tab */}
          {activeTab === 'quests' && (
            <QuestTab
              students={students}
              setStudents={setStudents}
              activeQuests={activeQuests}
              setActiveQuests={setActiveQuests}
              questTemplates={questTemplates}
              setQuestTemplates={setQuestTemplates}
              questCompletionData={questCompletionData}
              setQuestCompletionData={setQuestCompletionData}
              selectedQuestGiver={selectedQuestGiver}
              setSelectedQuestGiver={setSelectedQuestGiver}
              attendanceData={attendanceData}
              markAttendance={markAttendance}
              saveQuestDataToFirebase={saveQuestDataToFirebase}
              saveStudentsToFirebase={saveStudentsToFirebase}
              showToast={showToast}
              awardXP={awardXP}
              awardCoins={awardCoins}
              currentClassId={currentClassId}
              userData={userData}
              user={user}
              firestore={firestore}
            />
          )}

          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <ShopTab
              students={students}
              setStudents={setStudents}
              showToast={showToast}
              saveStudentsToFirebase={saveStudentsToFirebase}
              currentClassId={currentClassId}
              userData={userData}
              user={user}
              firestore={firestore}
            />
          )}

          {/* Pet Race Tab */}
          {activeTab === 'race' && (
            <PetRaceTab
              students={students}
              setStudents={setStudents}
              raceInProgress={raceInProgress}
              setRaceInProgress={setRaceInProgress}
              raceFinished={raceFinished}
              setRaceFinished={setRaceFinished}
              racePositions={racePositions}
              setRacePositions={setRacePositions}
              raceWinner={raceWinner}
              setRaceWinner={setRaceWinner}
              selectedPrize={selectedPrize}
              setSelectedPrize={setSelectedPrize}
              prizeDetails={prizeDetails}
              setPrizeDetails={setPrizeDetails}
              selectedPets={selectedPets}
              setSelectedPets={setSelectedPets}
              showRaceSetup={showRaceSetup}
              setShowRaceSetup={setShowRaceSetup}
              raceInterval={raceInterval}
              setRaceInterval={setRaceInterval}
              awardRacePrize={awardRacePrize}
              showToast={showToast}
              userData={userData}
            />
          )}

          {/* Fishing Tab */}
          {activeTab === 'fishing' && (
            <FishingGameTab
              students={students}
              setStudents={setStudents}
              saveStudentsToFirebase={saveStudentsToFirebase}
              awardXP={awardXP}
              awardCoins={awardCoins}
              showToast={showToast}
              userData={userData}
            />
          )}

          {/* Games Tab */}
          {activeTab === 'games' && (
            <GamesTab
              students={students}
              setStudents={setStudents}
              saveStudentsToFirebase={saveStudentsToFirebase}
              showToast={showToast}
              userData={userData}
            />
          )}

          {/* Curriculum Corner Tab */}
          {activeTab === 'curriculum' && (
            <CurriculumCornerTab
              currentClassId={currentClassId}
              userData={userData}
              user={user}
              firestore={firestore}
              saveVocabularyDataToFirebase={saveVocabularyDataToFirebase}
              showToast={showToast}
            />
          )}

          {/* Teachers Toolkit Tab */}
          {activeTab === 'toolkit' && (
            <TeachersToolkitTab
              students={students}
              setStudents={setStudents}
              saveStudentsToFirebase={saveStudentsToFirebase}
              timerState={timerState}
              setTimerState={setTimerState}
              handleTimerComplete={handleTimerComplete}
              handleTimerUpdate={handleTimerUpdate}
              saveGroupDataToFirebase={saveGroupDataToFirebase}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
              currentClassId={currentClassId}
              userData={userData}
              user={user}
              firestore={firestore}
              showToast={showToast}
            />
          )}

          {/* Classes Tab */}
          {activeTab === 'classes' && (
            <ClassesTab
              user={user}
              firestore={firestore}
              savedClasses={savedClasses}
              setSavedClasses={setSavedClasses}
              currentClassId={currentClassId}
              setCurrentClassId={setCurrentClassId}
              handleClassChange={handleClassChange}
              handleDeleteClass={handleDeleteClass}
              newClassName={newClassName}
              setNewClassName={setNewClassName}
              newClassStudents={newClassStudents}
              setNewClassStudents={setNewClassStudents}
              showToast={showToast}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsTab
              userData={userData}
              user={user}
              students={students}
              setStudents={setStudents}
              saveStudentsToFirebase={saveStudentsToFirebase}
              resetAllPoints={resetAllPoints}
              fixAllStudentData={fixAllStudentData}
              migrateAllStudents={migrateAllStudents}
              showConfirmDialog={showConfirmDialog}
              setShowConfirmDialog={setShowConfirmDialog}
              showFeedbackModal={showFeedbackModal}
              setShowFeedbackModal={setShowFeedbackModal}
              feedbackType={feedbackType}
              setFeedbackType={setFeedbackType}
              feedbackSubject={feedbackSubject}
              setFeedbackSubject={setFeedbackSubject}
              feedbackMessage={feedbackMessage}
              setFeedbackMessage={setFeedbackMessage}
              feedbackEmail={feedbackEmail}
              setFeedbackEmail={setFeedbackEmail}
              handleSubscriptionManagement={handleSubscriptionManagement}
              handleSendFeedback={handleSendFeedback}
              showToast={showToast}
            />
          )}
        </Suspense>
      </main>

      {/* Persistent Timer Component */}
      {timerState.showMiniTimer && (
        <Suspense fallback={null}>
          <PersistentTimer
            timerState={timerState}
            onTimerUpdate={handleTimerUpdate}
            onTimerComplete={handleTimerComplete}
            onShowFullTimer={handleShowFullTimer}
          />
        </Suspense>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        {/* Level Up Modal */}
        {levelUpData && (
          <LevelUpModal
            student={levelUpData}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {/* Pet Unlock Modal */}
        {petUnlockData && (
          <PetUnlockModal
            student={petUnlockData.student}
            pet={petUnlockData.pet}
            onClose={() => setPetUnlockData(null)}
          />
        )}

        {/* Add Student Modal */}
        {showAddStudentModal && (
          <AddStudentModal
            isOpen={showAddStudentModal}
            onClose={() => setShowAddStudentModal(false)}
            newStudentName={newStudentName}
            setNewStudentName={setNewStudentName}
            newStudentAvatar={newStudentAvatar}
            setNewStudentAvatar={setNewStudentAvatar}
            onAddStudent={addStudent}
          />
        )}

        {/* Avatar Selection Modal */}
        {showAvatarSelectionModal && studentForAvatarChange && (
          <AvatarSelectionModal
            student={studentForAvatarChange}
            onClose={() => {
              setShowAvatarSelectionModal(false);
              setStudentForAvatarChange(null);
            }}
            onSelectAvatar={(avatar) => {
              changeAvatar(studentForAvatarChange, avatar);
              setShowAvatarSelectionModal(false);
              setStudentForAvatarChange(null);
            }}
          />
        )}

        {/* Character Sheet Modal */}
        {selectedStudent && (
          <CharacterSheetModal
            student={selectedStudent}
            isOpen={!!selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}

        {/* Race Setup Modal */}
        {showRaceSetup && (
          <RaceSetupModal
            students={students}
            selectedPets={selectedPets}
            setSelectedPets={setSelectedPets}
            selectedPrize={selectedPrize}
            setSelectedPrize={setSelectedPrize}
            prizeDetails={prizeDetails}
            setPrizeDetails={setPrizeDetails}
            onClose={() => setShowRaceSetup(false)}
            onStartRace={() => {
              setShowRaceSetup(false);
              setRaceInProgress(true);
            }}
          />
        )}

        {/* Race Winner Modal */}
        {raceWinner && (
          <RaceWinnerModal
            winner={raceWinner}
            prize={prizeDetails}
            onClose={() => {
              setRaceWinner(null);
              setRaceFinished(false);
              setRacePositions({});
            }}
          />
        )}

        {/* Quest Completion Modal */}
        {questCompletionData && (
          <QuestCompletionModal
            questData={questCompletionData}
            onClose={() => setQuestCompletionData(null)}
          />
        )}
      </Suspense>
    </div>
  );
}