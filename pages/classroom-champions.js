// pages/classroom-champions.js - UPDATED with New StudentsTab Integration
import React, { useState, useEffect, useCallback } from 'react';
// Next.js imports with error handling
let useRouter;
try {
  const nextRouter = require('next/router');
  useRouter = nextRouter.useRouter;
} catch (e) {
  console.warn('Next.js router not available');
  useRouter = () => ({ push: (path) => console.log('Navigate to:', path) });
}
// Firebase imports with error handling
let auth, firestore, onAuthStateChanged, doc, getDoc, setDoc;
try {
  const firebaseAuth = require('firebase/auth');
  const firebaseFirestore = require('firebase/firestore');
  
  onAuthStateChanged = firebaseAuth.onAuthStateChanged;
  doc = firebaseFirestore.doc;
  getDoc = firebaseFirestore.getDoc;
  setDoc = firebaseFirestore.setDoc;
  
  // Try to import firebase config
  try {
    const firebaseUtils = require('../utils/firebase');
    auth = firebaseUtils.auth;
    firestore = firebaseUtils.firestore;
  } catch (e) {
    console.warn('Firebase config not found');
    auth = { signOut: () => Promise.resolve() };
    firestore = null;
  }
} catch (e) {
  console.warn('Firebase not available');
  auth = { signOut: () => Promise.resolve() };
  firestore = null;
  onAuthStateChanged = (auth, callback) => callback(null);
  doc = () => ({});
  getDoc = () => Promise.resolve({ exists: () => false });
  setDoc = () => Promise.resolve();
}

// Import the new StudentsTab
import StudentsTab from '../components/tabs/StudentsTab';

// Placeholder components for tabs that will be implemented later
const PlaceholderTab = ({ tabName, icon }) => (
  <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-700 mb-2">{tabName}</h3>
      <p className="text-gray-500">This tab is coming soon!</p>
    </div>
  </div>
);

const Dashboard = (props) => <PlaceholderTab tabName="Dashboard" icon="📊" />;
const QuestsTab = (props) => <PlaceholderTab tabName="Quests" icon="⚔️" />;
const ShopTab = (props) => <PlaceholderTab tabName="Shop" icon="🏪" />;
const PetRaceTab = (props) => <PlaceholderTab tabName="Pet Race" icon="🏁" />;
const FishingTab = (props) => <PlaceholderTab tabName="Fishing" icon="🎣" />;
const GamesTab = (props) => <PlaceholderTab tabName="Games" icon="🎲" />;
const CurriculumCorner = (props) => <PlaceholderTab tabName="Curriculum" icon="📚" />;
const TeachersToolkit = (props) => <PlaceholderTab tabName="Toolkit" icon="🛠️" />;
const ClassesTab = (props) => <PlaceholderTab tabName="Classes" icon="🏫" />;
const SettingsTab = (props) => <PlaceholderTab tabName="Settings" icon="⚙️" />;

// Simple error handling - inline to avoid import issues
const handleError = (error, context = 'Operation') => {
  console.error(`Error in ${context}:`, error);
  return error;
};

const withAsyncErrorHandling = (fn, operation = 'operation') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, operation);
    }
  };
};

// Default quest templates
const QUEST_TEMPLATES = [
  {
    id: 'homework_completion',
    title: 'Homework Hero',
    description: 'Complete all homework assignments this week',
    reward: { type: 'xp', amount: 25 },
    category: 'academic'
  },
  {
    id: 'helping_classmate',
    title: 'Helpful Friend',
    description: 'Help a classmate with their work',
    reward: { type: 'coins', amount: 10 },
    category: 'social'
  },
  {
    id: 'reading_goal',
    title: 'Bookworm',
    description: 'Read for 30 minutes every day this week',
    reward: { type: 'xp', amount: 20 },
    category: 'academic'
  }
];

// Get random avatar for new students
const getRandomAvatar = () => {
  const avatars = [
    'Wizard F', 'Wizard M', 'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M',
    'Barbarian F', 'Barbarian M', 'Bard F', 'Bard M', 'Cleric F', 'Cleric M'
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Utility functions for avatar handling
const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) return '/Avatars/Wizard F/Level 1.png';
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  return `/Avatars/${avatarBase}/Level ${validLevel}.png`;
};

const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;
  if (totalXP >= 200) return 3;
  if (totalXP >= 100) return 2;
  return 1;
};

const migrateStudentData = (student) => {
  const totalXP = student.totalPoints || 0;
  const correctLevel = calculateAvatarLevel(totalXP);
  
  return {
    ...student,
    id: student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName: student.firstName || 'Student',
    lastName: student.lastName || '',
    totalPoints: totalXP,
    currency: student.currency || 0,
    avatarLevel: correctLevel,
    avatarBase: student.avatarBase || 'Wizard F',
    avatar: getAvatarImage(student.avatarBase || 'Wizard F', correctLevel),
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : ['Wizard F']),
    ownedPets: student.ownedPets || [],
    behaviorPoints: student.behaviorPoints || {
      respectful: 0,
      responsible: 0,
      safe: 0,
      learner: 0,
      helper: 0,
      creative: 0
    },
    questsCompleted: student.questsCompleted || [],
    rewardsPurchased: student.rewardsPurchased || [],
    coinsSpent: student.coinsSpent || 0,
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};

const ClassroomChampions = () => {
  const router = useRouter();
  
  // Core state
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Class management
  const [currentClassId, setCurrentClassId] = useState(null);
  const [currentClass, setCurrentClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [savedClasses, setSavedClasses] = useState([]);
  
  // Quest system
  const [activeQuests, setActiveQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(QUEST_TEMPLATES);
  const [attendanceData, setAttendanceData] = useState({});
  
  // Class creation
  const [showClassModal, setShowClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');
  
  // Toast notifications
  const [toasts, setToasts] = useState([]);
  
  // ===============================================
  // TOAST NOTIFICATION SYSTEM
  // ===============================================

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const toast = {
      id: Date.now(),
      message,
      type,
      duration
    };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, duration);
  }, []);

  const toastShowToast = useCallback((message) => addToast(message, 'info'), [addToast]);
  const toastShowSuccessToast = useCallback((message) => addToast(message, 'success'), [addToast]);
  const toastShowErrorToast = useCallback((message) => addToast(message, 'error'), [addToast]);
  const toastShowWarningToast = useCallback((message) => addToast(message, 'warning'), [addToast]);

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
          toastShowErrorToast('Error loading user data');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [router, toastShowErrorToast]);

  // ===============================================
  // CLASS MANAGEMENT
  // ===============================================

  const loadClass = useCallback(withAsyncErrorHandling(async (classData) => {
    setCurrentClassId(classData.id);
    setCurrentClass(classData);
    
    // Migrate and fix student data
    const migratedStudents = (classData.students || []).map(migrateStudentData);
    setStudents(migratedStudents);
    
    // Load other class data
    setActiveQuests(classData.activeQuests || []);
    setQuestTemplates(classData.questTemplates || QUEST_TEMPLATES);
    setAttendanceData(classData.attendanceData || {});
    
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
  }, 'loadClass'), [user]);

  const handleClassImport = useCallback(withAsyncErrorHandling(async () => {
    if (!newClassName.trim()) {
      toastShowErrorToast('Please enter a class name');
      return;
    }

    if (!newClassStudents.trim()) {
      toastShowErrorToast('Please enter student names');
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
      
      toastShowSuccessToast(`Class "${newClassName}" created with ${newStudents.length} students!`);
    } catch (error) {
      console.error("Error creating class:", error);
      toastShowErrorToast('Error creating class');
    }
  }, 'handleClassImport'), [newClassName, newClassStudents, user, loadClass, toastShowErrorToast, toastShowSuccessToast]);

  // ===============================================
  // FIREBASE SAVE FUNCTIONS
  // ===============================================

  const saveStudentsToFirebase = useCallback(withAsyncErrorHandling(async (studentsData) => {
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
      throw error;
    }
  }, 'saveStudentsToFirebase'), [user, currentClassId]);

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

  // ===============================================
  // TAB RENDERING
  // ===============================================

  const renderActiveTab = () => {
    const commonProps = {
      showToast: toastShowToast,
      showSuccessToast: toastShowSuccessToast,
      showErrorToast: toastShowErrorToast,
      showWarningToast: toastShowWarningToast,
      currentClassId,
      user,
      userData,
      firestore
    };

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            students={students}
            currentClass={currentClass}
            {...commonProps}
          />
        );

      case 'students':
        return (
          <StudentsTab
            students={students}
            setStudents={setStudents}
            saveStudentsToFirebase={saveStudentsToFirebase}
            {...commonProps}
          />
        );

      case 'quests':
        return (
          <QuestsTab
            students={students}
            setStudents={setStudents}
            activeQuests={activeQuests}
            setActiveQuests={setActiveQuests}
            questTemplates={questTemplates}
            setQuestTemplates={setQuestTemplates}
            attendanceData={attendanceData}
            setAttendanceData={setAttendanceData}
            saveQuestDataToFirebase={saveQuestDataToFirebase}
            saveStudentsToFirebase={saveStudentsToFirebase}
            {...commonProps}
          />
        );

      case 'shop':
        return (
          <ShopTab
            students={students}
            setStudents={setStudents}
            saveStudentsToFirebase={saveStudentsToFirebase}
            {...commonProps}
          />
        );

      case 'pet-race':
        return (
          <PetRaceTab
            students={students}
            setStudents={setStudents}
            saveStudentsToFirebase={saveStudentsToFirebase}
            {...commonProps}
          />
        );

      case 'fishing':
        return (
          <FishingTab
            students={students}
            setStudents={setStudents}
            saveStudentsToFirebase={saveStudentsToFirebase}
            {...commonProps}
          />
        );

      case 'games':
        return (
          <GamesTab
            {...commonProps}
          />
        );

      case 'curriculum':
        return (
          <CurriculumCorner
            {...commonProps}
          />
        );

      case 'toolkit':
        return (
          <TeachersToolkit
            students={students}
            {...commonProps}
          />
        );

      case 'classes':
        return (
          <ClassesTab
            savedClasses={savedClasses}
            setSavedClasses={setSavedClasses}
            loadClass={loadClass}
            currentClassId={currentClassId}
            showClassModal={showClassModal}
            setShowClassModal={setShowClassModal}
            newClassName={newClassName}
            setNewClassName={setNewClassName}
            newClassStudents={newClassStudents}
            setNewClassStudents={setNewClassStudents}
            handleClassImport={handleClassImport}
            {...commonProps}
          />
        );

      case 'settings':
        return (
          <SettingsTab
            userData={userData}
            setUserData={setUserData}
            {...commonProps}
          />
        );

      default:
        return (
          <Dashboard
            students={students}
            currentClass={currentClass}
            {...commonProps}
          />
        );
    }
  };

  // ===============================================
  // LOADING STATE
  // ===============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-bold text-gray-700">Loading Classroom Champions...</h3>
        </div>
      </div>
    );
  }

  // ===============================================
  // MAIN RENDER
  // ===============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-gradient-to-r from-blue-500 to-purple-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="text-3xl">🎮</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Classroom Champions</h1>
                {currentClass && (
                  <p className="text-sm text-gray-600">
                    Class: <span className="font-semibold">{currentClass.name}</span> 
                    ({students.length} students)
                  </p>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <p className="text-xs text-gray-500">
                  {userData?.subscription || 'Basic'} Plan
                </p>
              </div>
              <button
                onClick={() => auth.signOut()}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: '📊' },
              { id: 'students', name: 'Students', icon: '👥' },
              { id: 'quests', name: 'Quests', icon: '⚔️' },
              { id: 'shop', name: 'Shop', icon: '🏪' },
              { id: 'pet-race', name: 'Pet Race', icon: '🏁' },
              { id: 'fishing', name: 'Fishing', icon: '🎣' },
              { id: 'games', name: 'Games', icon: '🎲' },
              { id: 'curriculum', name: 'Curriculum', icon: '📚' },
              { id: 'toolkit', name: 'Toolkit', icon: '🛠️' },
              { id: 'classes', name: 'Classes', icon: '🏫' },
              { id: 'settings', name: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          {currentClass ? (
            renderActiveTab()
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏫</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Class Selected</h3>
                <p className="text-gray-500 mb-4">Create a new class or select an existing one to get started.</p>
                <button
                  onClick={() => setActiveTab('classes')}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Manage Classes
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium max-w-sm transform transition-all ${
              toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassroomChampions;