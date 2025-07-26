// pages/classroom-champions.js - SIMPLIFIED AND FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Import components
import StudentsTab from '../components/tabs/StudentsTab';
import ShopTab from '../components/tabs/ShopTab';
import QuestsTab from '../components/tabs/QuestsTab';
import GamesTab from '../components/tabs/GamesTab';
import SettingsTab from '../components/tabs/SettingsTab';
import TeachersToolkitTab from '../components/tabs/TeachersToolkitTab';

// ===============================================
// CORE GAME CONSTANTS (INLINE TO AVOID IMPORT ISSUES)
// ===============================================

const GAME_CONFIG = {
  MAX_LEVEL: 4,
  COINS_PER_XP: 5,
  PET_UNLOCK_XP: 50,
  XP_THRESHOLDS: { LEVEL_1: 0, LEVEL_2: 100, LEVEL_3: 200, LEVEL_4: 300 }
};

const DEFAULT_XP_CATEGORIES = [
  { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' },
  { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' },
  { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' },
  { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' },
  { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' }
];

const AVAILABLE_AVATARS = [
  'Alchemist F', 'Archer F', 'Archer M', 'Bard F', 'Bard M', 'Druid F', 'Druid M',
  'Knight F', 'Knight M', 'Mage F', 'Mage M', 'Paladin F', 'Paladin M', 
  'Ranger F', 'Ranger M', 'Rogue F', 'Rogue M', 'Warrior F', 'Warrior M', 'Wizard F', 'Wizard M'
];

const PET_SPECIES = [
  { name: 'Dragon', emoji: '🐉', rarity: 'rare' },
  { name: 'Phoenix', emoji: '🔥', rarity: 'epic' },
  { name: 'Unicorn', emoji: '🦄', rarity: 'legendary' },
  { name: 'Wolf', emoji: '🐺', rarity: 'common' },
  { name: 'Owl', emoji: '🦉', rarity: 'common' },
  { name: 'Cat', emoji: '🐱', rarity: 'common' },
  { name: 'Tiger', emoji: '🐅', rarity: 'rare' }
];

// ===============================================
// UTILITY FUNCTIONS (INLINE TO AVOID IMPORT ISSUES)
// ===============================================

// FIXED: Use lowercase 'avatars' to match your file structure
const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) return '/avatars/Wizard F/Level 1.png';
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  return `/avatars/${avatarBase}/Level ${validLevel}.png`;
};

const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;
  if (totalXP >= 200) return 3;  
  if (totalXP >= 100) return 2;
  return 1;
};

const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP);
  const bonusCoins = student?.currency || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

const getRandomPet = () => {
  const pet = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${pet.name} ${Math.floor(Math.random() * 100)}`,
    emoji: pet.emoji,
    type: pet.name.toLowerCase(),
    rarity: pet.rarity,
    speed: Math.random() * 0.5 + 0.5
  };
};

const shouldReceivePet = (student) => {
  return (student?.totalPoints || 0) >= GAME_CONFIG.PET_UNLOCK_XP && 
         (!student?.ownedPets || student.ownedPets.length === 0);
};

const playXPSound = () => {
  try {
    const audio = new Audio('/sounds/xp-gain.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  } catch (e) {
    console.log('Audio not available');
  }
};

const showToast = (message, type = 'info') => {
  // Simple alert for now - you can enhance this later
  alert(`${type.toUpperCase()}: ${message}`);
};

// ===============================================
// STUDENT CARD COMPONENT
// ===============================================

const StudentCard = ({ student, onAwardXP, onViewDetails }) => {
  const currentLevel = calculateAvatarLevel(student.totalPoints || 0);
  const coins = calculateCoins(student);
  const progressToNext = (student.totalPoints || 0) % 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300">
      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative group cursor-pointer" onClick={() => onViewDetails(student)}>
          <img 
            src={getAvatarImage(student.avatarBase || 'Wizard F', currentLevel)}
            alt={`${student.firstName}'s Avatar`}
            className="w-16 h-16 rounded-full border-3 border-blue-400 shadow-lg group-hover:border-blue-600 transition-all"
            onError={(e) => {
              console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
              e.target.src = '/avatars/Wizard F/Level 1.png';
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
            L{currentLevel}
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-gray-800 mt-2 text-center leading-tight">
          {student.firstName}
        </h3>
      </div>

      {/* Stats Section */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-600 font-semibold flex items-center">
            ⭐ {student.totalPoints || 0}
          </span>
          <span className="text-yellow-600 font-semibold flex items-center">
            🪙 {coins}
          </span>
        </div>
        
        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Level {currentLevel + 1}</span>
            <span>{progressToNext}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Pet Display */}
      {student.ownedPets && student.ownedPets.length > 0 && (
        <div className="flex justify-center mb-3">
          <div className="text-2xl" title={student.ownedPets[0].name}>
            {student.ownedPets[0].emoji}
          </div>
        </div>
      )}

      {/* XP Award Buttons */}
      <div className="grid grid-cols-3 gap-1">
        {DEFAULT_XP_CATEGORIES.slice(0, 3).map(category => (
          <button
            key={category.id}
            onClick={() => onAwardXP(student, category.amount, category.label)}
            className={`${category.color} text-white text-xs py-1 px-2 rounded-lg hover:opacity-80 transition-all font-bold`}
            title={category.label}
          >
            {category.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// TAB CONFIGURATION
// ===============================================

const NAVIGATION_TABS = [
  { 
    id: 'dashboard', 
    name: 'Dashboard', 
    icon: '🏠', 
    color: 'from-blue-500 to-blue-600',
    description: 'Class overview and quick stats'
  },
  { 
    id: 'students', 
    name: 'Students', 
    icon: '👥', 
    color: 'from-green-500 to-green-600',
    description: 'Manage student progress and awards'
  },
  { 
    id: 'quests', 
    name: 'Quests', 
    icon: '📜', 
    color: 'from-purple-500 to-purple-600',
    description: 'Create and manage class quests'
  },
  { 
    id: 'shop', 
    name: 'Shop', 
    icon: '🏪', 
    color: 'from-yellow-500 to-yellow-600',
    description: 'Avatar and pet marketplace'
  },
  { 
    id: 'games', 
    name: 'Games', 
    icon: '🎮', 
    color: 'from-red-500 to-red-600',
    description: 'Fun classroom activities'
  },
  { 
    id: 'toolkit', 
    name: 'Teachers Toolkit', 
    icon: '🛠️', 
    color: 'from-indigo-500 to-indigo-600',
    description: 'Professional classroom management tools'
  },
  { 
    id: 'settings', 
    name: 'Settings', 
    icon: '⚙️', 
    color: 'from-gray-500 to-gray-600',
    description: 'Class and account settings'
  }
];

// ===============================================
// MAIN COMPONENT
// ===============================================

const ClassroomChampions = () => {
  const router = useRouter();
  
  // Core state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);
  
  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Form states
  const [newStudentFirstName, setNewStudentFirstName] = useState('');
  const [newStudentLastName, setNewStudentLastName] = useState('');

  // ===============================================
  // AUTHENTICATION
  // ===============================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        loadUserData(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadUserData = async (user) => {
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Load the active class
        if (userData.classes && userData.classes.length > 0) {
          const activeClass = userData.classes.find(cls => cls.id === userData.activeClassId) || userData.classes[0];
          setCurrentClassId(activeClass.id);
          setStudents(activeClass.students || []);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showToast('Error loading class data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===============================================
  // STUDENT MANAGEMENT
  // ===============================================

  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const updatedClasses = userData.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, students: updatedStudents }
            : cls
        );
        
        await setDoc(docRef, { ...userData, classes: updatedClasses });
      }
    } catch (error) {
      console.error('Error saving students:', error);
      showToast('Error saving student data', 'error');
    }
  };

  const awardXP = useCallback(async (student, amount, category) => {
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        const newTotalXP = (s.totalPoints || 0) + amount;
        const oldLevel = calculateAvatarLevel(s.totalPoints || 0);
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        const updatedStudent = {
          ...s,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(s.avatarBase || 'Wizard F', newLevel),
          lastUpdated: new Date().toISOString()
        };

        // Check for level up
        if (newLevel > oldLevel) {
          setLevelUpData({
            student: updatedStudent,
            oldLevel,
            newLevel
          });
        }

        // Check for pet unlock
        if (shouldReceivePet(updatedStudent)) {
          const newPet = getRandomPet();
          updatedStudent.ownedPets = [newPet];
          setPetUnlockData({
            student: updatedStudent,
            pet: newPet
          });
        }

        return updatedStudent;
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    playXPSound();
    showToast(`${student.firstName} earned ${amount} XP for ${category}!`, 'success');
  }, [students]);

  const addStudent = async () => {
    if (!newStudentFirstName.trim()) {
      showToast('Please enter a first name', 'error');
      return;
    }

    const newStudent = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: newStudentFirstName.trim(),
      lastName: newStudentLastName.trim(),
      totalPoints: 0,
      currency: 0,
      coinsSpent: 0,
      avatarLevel: 1,
      avatarBase: 'Wizard F',
      avatar: getAvatarImage('Wizard F', 1),
      ownedAvatars: ['Wizard F'],
      ownedPets: [],
      rewardsPurchased: [],
      questsCompleted: [],
      behaviorPoints: { respectful: 0, responsible: 0, safe: 0, learner: 0 },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    setNewStudentFirstName('');
    setNewStudentLastName('');
    setShowAddStudentModal(false);
    
    showToast(`${newStudent.firstName} has been added to the class!`, 'success');
  };

  const updateStudent = async (updatedStudent) => {
    const updatedStudents = students.map(s => 
      s.id === updatedStudent.id ? updatedStudent : s
    );
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  };

  // ===============================================
  // GRID LAYOUT CALCULATION
  // ===============================================

  const getGridClasses = (studentCount) => {
    if (studentCount <= 4) return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
    if (studentCount <= 8) return 'grid grid-cols-2 lg:grid-cols-4 gap-3';
    if (studentCount <= 12) return 'grid grid-cols-3 lg:grid-cols-6 gap-3';
    if (studentCount <= 20) return 'grid grid-cols-4 lg:grid-cols-8 gap-2';
    return 'grid grid-cols-5 lg:grid-cols-10 gap-1';
  };

  // ===============================================
  // TAB CONTENT RENDERING
  // ===============================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return renderStudentsTab();
      case 'quests':
        return renderQuestsTab();
      case 'shop':
        return renderShopTab();
      case 'games':
        return renderGamesTab();
      case 'toolkit':
        return renderToolkitTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderStudentsTab();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Champions</p>
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total XP Earned</p>
              <p className="text-2xl font-bold text-yellow-600">
                {students.reduce((sum, student) => sum + (student.totalPoints || 0), 0)}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Average Level</p>
              <p className="text-2xl font-bold text-green-600">
                {students.length > 0 
                  ? (students.reduce((sum, student) => sum + calculateAvatarLevel(student.totalPoints || 0), 0) / students.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Champions with Pets</p>
              <p className="text-2xl font-bold text-purple-600">
                {students.filter(s => s.ownedPets && s.ownedPets.length > 0).length}
              </p>
            </div>
            <div className="text-3xl">🐾</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Top Champions</h3>
        <div className="space-y-3">
          {[...students]
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
            .slice(0, 5)
            .map((student, index) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold text-gray-500">#{index + 1}</div>
                  <img 
                    src={getAvatarImage(student.avatarBase || 'Wizard F', calculateAvatarLevel(student.totalPoints || 0))}
                    alt={`${student.firstName}'s Avatar`}
                    className="w-10 h-10 rounded-full border-2 border-gray-300"
                  />
                  <div>
                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500">Level {calculateAvatarLevel(student.totalPoints || 0)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{student.totalPoints || 0} XP</p>
                  <p className="text-sm text-gray-500">{calculateCoins(student)} coins</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderStudentsTab = () => (
    <StudentsTab
      students={students}
      onAwardXP={awardXP}
      onViewDetails={setSelectedStudent}
      onAddStudent={() => setShowAddStudentModal(true)}
    />
  );

  const renderQuestsTab = () => (
    <QuestsTab
      students={students}
      updateStudent={updateStudent}
      showToast={showToast}
    />
  );

  const renderShopTab = () => (
    <ShopTab
      students={students}
      updateStudent={updateStudent}
      showToast={showToast}
    />
  );

  const renderGamesTab = () => (
    <GamesTab
      showToast={showToast}
    />
  );

  const renderToolkitTab = () => (
    <TeachersToolkitTab
      students={students}
      user={user}
      showToast={showToast}
      userData={{}} // You can pass real userData if you have it
    />
  );

  const renderSettingsTab = () => (
    <SettingsTab
      user={user}
      currentClassId={currentClassId}
      students={students}
      setStudents={setStudents}
      saveStudentsToFirebase={saveStudentsToFirebase}
      showToast={showToast}
    />
  );

  // ===============================================
  // RENDER
  // ===============================================

  if (loading) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Classroom Champions
              </h1>
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-blue-800 font-semibold text-sm">
                  {students.length} Champions
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {(activeTab === 'students' || activeTab === 'toolkit') && (
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  + Add Student
                </button>
              )}
              
              <button
                onClick={() => auth.signOut()}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto">
            {NAVIGATION_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderTabContent()}
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Add New Champion</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newStudentFirstName}
                  onChange={(e) => setNewStudentFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newStudentLastName}
                  onChange={(e) => setNewStudentLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter last name (optional)"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addStudent}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Add Champion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-t-2xl">
              <div className="text-6xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold">LEVEL UP!</h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {levelUpData.student.firstName} reached Level {levelUpData.newLevel}!
              </h3>
              <img 
                src={levelUpData.student.avatar}
                alt="New Avatar"
                className="w-32 h-32 mx-auto rounded-full border-4 border-yellow-400 shadow-lg mb-4"
              />
              <p className="text-gray-600">Amazing progress! Keep up the great work!</p>
            </div>
            
            <div className="p-6 pt-0">
              <button
                onClick={() => setLevelUpData(null)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Unlock Modal */}
      {petUnlockData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="text-6xl mb-2">🐾</div>
              <h2 className="text-2xl font-bold">PET UNLOCKED!</h2>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {petUnlockData.student.firstName} found a companion!
              </h3>
              <div className="text-8xl mb-4">{petUnlockData.pet.emoji}</div>
              <h4 className="text-lg font-semibold text-purple-600 mb-2">
                {petUnlockData.pet.name}
              </h4>
              <p className="text-gray-600">Your new pet will accompany you on adventures!</p>
            </div>
            
            <div className="p-6 pt-0">
              <button
                onClick={() => setPetUnlockData(null)}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Meet My Pet!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                  <p className="text-blue-100">Level {calculateAvatarLevel(selectedStudent.totalPoints || 0)} Champion</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-white hover:text-red-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="text-center">
                  <img 
                    src={selectedStudent.avatar || getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints || 0))}
                    alt={`${selectedStudent.firstName}'s Avatar`}
                    className="w-32 h-32 mx-auto rounded-full border-4 border-blue-400 shadow-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold">{selectedStudent.avatarBase || 'Wizard F'}</h3>
                </div>
                
                {/* Stats */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Experience Points</h4>
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.totalPoints || 0} XP</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Coins</h4>
                    <p className="text-2xl font-bold text-yellow-600">{calculateCoins(selectedStudent)} 🪙</p>
                  </div>
                  
                  {selectedStudent.ownedPets && selectedStudent.ownedPets.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Companion</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{selectedStudent.ownedPets[0].emoji}</span>
                        <span className="font-semibold">{selectedStudent.ownedPets[0].name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomChampions;