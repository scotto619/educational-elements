// pages/classroom-champions.js - FIXED XP AWARDING FOR V2 ARCHITECTURE
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { postStudentUpdate } from '../utils/apiClient';

import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
const db = getFirestore();

// Import new Firebase utilities (for post-migration)
import {
  getUserData,
  getTeacherClasses,
  getClassData,
  getClassStudents,
  updateClassData,
  updateStudentData,
  createStudent,
  bulkAwardStudents,
  updateUserPreferences,
  listenToClassData,
  listenToClassStudents
} from '../utils/firebase-new';

// Import components (unchanged)
import DashboardTab from '../components/tabs/DashboardTab';
import StudentsTab from '../components/tabs/StudentsTab';
import ShopTab from '../components/tabs/ShopTab';
import QuestsTab from '../components/tabs/QuestsTab';
import PetRaceTab from '../components/tabs/PetRaceTab';
import GamesTab from '../components/tabs/GamesTab';
import SettingsTab from '../components/tabs/SettingsTab';
import TeachersToolkitTab from '../components/tabs/TeachersToolkitTab';
import CurriculumCornerTab from '../components/tabs/CurriculumCornerTab';
import QuizShowTab from '../components/tabs/QuizShowTab';

// Import floating widgets (unchanged)
import FloatingTimer from '../components/widgets/FloatingTimer';
import FloatingNamePicker from '../components/widgets/FloatingNamePicker';

// GAME CONSTANTS (unchanged)
const GAME_CONFIG = { MAX_LEVEL: 4, COINS_PER_XP: 5, PET_UNLOCK_XP: 50 };
const DEFAULT_XP_CATEGORIES = [ 
  { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' }, 
  { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' }, 
  { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' }, 
  { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' }, 
  { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' } 
];

// Shop constants (unchanged)
const AVAILABLE_AVATARS = [ 'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M', 'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M', 'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M', 'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M', 'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M', 'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M', 'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M' ];

const SHOP_BASIC_AVATARS = [ { name: 'Banana', price: 10, path: '/shop/Basic/Banana.png' }, { name: 'Basketball', price: 12, path: '/shop/Basic/Basketball.png' }, { name: 'BasketballGirl', price: 12, path: '/shop/Basic/BasketballGirl.png' }, { name: 'FarmerBoy', price: 15, path: '/shop/Basic/FarmerBoy.png' }, { name: 'FarmerGirl', price: 15, path: '/shop/Basic/FarmerGirl.png' }, { name: 'Goblin1', price: 15, path: '/shop/Basic/Goblin1.png' }, { name: 'GoblinGirl1', price: 15, path: '/shop/Basic/GoblinGirl1.png' }, { name: 'Guard1', price: 20, path: '/shop/Basic/Guard1.png' }, { name: 'GuardGirl1', price: 20, path: '/shop/Basic/GuardGirl1.png' }, { name: 'PirateBoy', price: 18, path: '/shop/Basic/PirateBoy.png' }, { name: 'PirateGirl', price: 18, path: '/shop/Basic/PirateGirl.png' }, { name: 'RoboKnight', price: 25, path: '/shop/Basic/RoboKnight.png' }, { name: 'RobotBoy', price: 22, path: '/shop/Basic/RobotBoy.png' }, { name: 'RobotGirl', price: 22, path: '/shop/Basic/RobotGirl.png' }, { name: 'SoccerBoy', price: 10, path: '/shop/Basic/SoccerBoy.png' }, { name: 'SoccerBoy2', price: 10, path: '/shop/Basic/SoccerBoy2.png' }, { name: 'SoccerGirl', price: 10, path: '/shop/Basic/SoccerGirl.png' }, { name: 'StreetBoy1', price: 15, path: '/shop/Basic/Streetboy1.png' }, { name: 'StreetGirl1', price: 15, path: '/shop/Basic/Streetgirl1.png' }, { name: 'Vampire1', price: 20, path: '/shop/Basic/Vampire1.png' } ];

const SHOP_PREMIUM_AVATARS = [ { name: 'Dwarf', price: 45, path: '/shop/Premium/Dwarf.png' }, { name: 'Dwarf2', price: 45, path: '/shop/Premium/Dwarf2.png' }, { name: 'FarmerBoy Premium', price: 35, path: '/shop/Premium/FarmerBoy.png' }, { name: 'FarmerGirl Premium', price: 35, path: '/shop/Premium/FarmerGirl.png' }, { name: 'Goblin2', price: 30, path: '/shop/Premium/Goblin2.png' }, { name: 'GoblinGirl2', price: 30, path: '/shop/Premium/GoblinGirl2.png' }, { name: 'King', price: 60, path: '/shop/Premium/King.png' }, { name: 'MechanicGirl', price: 40, path: '/shop/Premium/MechanicGirl.png' }, { name: 'PirateBoy Premium', price: 42, path: '/shop/Premium/PirateBoy.png' }, { name: 'PirateGirl Premium', price: 42, path: '/shop/Premium/PirateGirl.png' }, { name: 'Queen', price: 60, path: '/shop/Premium/Queen.png' }, { name: 'RobotBoy Premium', price: 38, path: '/shop/Premium/RobotBoy.png' }, { name: 'RobotGirl Premium', price: 38, path: '/shop/Premium/RobotGirl.png' }, { name: 'Vampire2', price: 40, path: '/shop/Premium/Vampire2.png' }, { name: 'VampireGirl2', price: 40, path: '/shop/Premium/VampireGirl2.png' } ];

const SHOP_BASIC_PETS = [ { name: 'Alchemist Pet', price: 25, path: '/shop/BasicPets/Alchemist.png' }, { name: 'Barbarian Pet', price: 30, path: '/shop/BasicPets/Barbarian.png' }, { name: 'Bard Pet', price: 25, path: '/shop/BasicPets/Bard.png' }, { name: 'Beastmaster Pet', price: 35, path: '/shop/BasicPets/Beastmaster.png' }, { name: 'Cleric Pet', price: 25, path: '/shop/BasicPets/Cleric.png' }, { name: 'Crystal Knight Pet', price: 45, path: '/shop/BasicPets/Crystal Knight.png' }, { name: 'Crystal Sage Pet', price: 45, path: '/shop/BasicPets/Crystal Sage.png' }, { name: 'Dragon Pet', price: 50, path: '/shop/BasicPets/DragonPet.png' }, { name: 'Dream Pet', price: 40, path: '/shop/BasicPets/Dream.png' }, { name: 'Druid Pet', price: 35, path: '/shop/BasicPets/Druid.png' }, { name: 'Engineer Pet', price: 30, path: '/shop/BasicPets/Engineer.png' }, { name: 'Farm Pet 1', price: 20, path: '/shop/BasicPets/FarmPet1.png' }, { name: 'Farm Pet 2', price: 20, path: '/shop/BasicPets/FarmPet2.png' }, { name: 'Farm Pet 3', price: 20, path: '/shop/BasicPets/FarmPet3.png' }, { name: 'Frost Mage Pet', price: 35, path: '/shop/BasicPets/Frost Mage.png' }, { name: 'Goblin Pet', price: 25, path: '/shop/BasicPets/GoblinPet.png' }, { name: 'Illusionist Pet', price: 40, path: '/shop/BasicPets/Illusionist.png' }, { name: 'Knight Pet', price: 30, path: '/shop/BasicPets/Knight.png' }, { name: 'Lightning Pet', price: 50, path: '/shop/BasicPets/Lightning.png' }, { name: 'Monk Pet', price: 25, path: '/shop/BasicPets/Monk.png' }, { name: 'Necromancer Pet', price: 40, path: '/shop/BasicPets/Necromancer.png' }, { name: 'Orc Pet', price: 30, path: '/shop/BasicPets/Orc.png' }, { name: 'Paladin Pet', price: 35, path: '/shop/BasicPets/Paladin.png' }, { name: 'Pirate Pet 1', price: 25, path: '/shop/BasicPets/PiratePet1.png' }, { name: 'Pirate Pet 2', price: 25, path: '/shop/BasicPets/PiratePet2.png' }, { name: 'Pirate Pet 3', price: 25, path: '/shop/BasicPets/PiratePet3.png' }, { name: 'Rabbit Pet', price: 20, path: '/shop/BasicPets/RabbitPet.png' }, { name: 'Robot Boy Pet', price: 30, path: '/shop/BasicPets/RobotBoyPet.png' }, { name: 'Robot Girl Pet', price: 30, path: '/shop/BasicPets/RobotGirlPet.png' }, { name: 'Robot Pet 1', price: 30, path: '/shop/BasicPets/RobotPet1.png' }, { name: 'Robot Pet 2', price: 30, path: '/shop/BasicPets/RobotPet2.png' }, { name: 'Rogue Pet', price: 25, path: '/shop/BasicPets/Rogue.png' }, { name: 'Soccer Pet', price: 20, path: '/shop/BasicPets/SoccerPet.png' }, { name: 'Stealth Pet', price: 35, path: '/shop/BasicPets/Stealth.png' }, { name: 'Time Knight Pet', price: 50, path: '/shop/BasicPets/Time Knight.png' }, { name: 'Unicorn Pet', price: 35, path: '/shop/BasicPets/UnicornPet.png' }, { name: 'Warrior Pet', price: 30, path: '/shop/BasicPets/Warrior.png' }, { name: 'Wizard Pet', price: 25, path: '/shop/BasicPets/Wizard.png' } ];

const SHOP_PREMIUM_PETS = [ { name: 'Lion Pet', price: 60, path: '/shop/PremiumPets/LionPet.png' }, { name: 'Snake Pet', price: 50, path: '/shop/PremiumPets/SnakePet.png' }, { name: 'Vampire Pet', price: 50, path: '/shop/PremiumPets/VampirePet.png' } ];

// Helper functions (unchanged)
const getAvatarImage = (avatarBase, level) => {
  const shopItem = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS]
    .find(a => a.name.toLowerCase() === (avatarBase || '').toLowerCase());
  if (shopItem) return shopItem.path;

  const lvl = Math.min(4, Math.max(1, Math.round(level || 1)));
  const base = encodeURIComponent(avatarBase || 'Wizard F');
  return `/avatars/${base}/Level ${lvl}.png`;
};

const getPetImage = (pet) => {
    if (!pet || !pet.name) return '/Pets/Wizard.png';
    if (pet.path) return pet.path;
    const shopItem = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS].find(p => p.name.toLowerCase() === pet.name.toLowerCase());
    if (shopItem) return shopItem.path;
    const key = (pet.type || pet.name || '').toLowerCase();
    const map = { 'alchemist': '/Pets/Alchemist.png', 'barbarian': '/Pets/Barbarian.png', 'bard': '/Pets/Bard.png', 'beastmaster': '/Pets/Beastmaster.png', 'cleric': '/Pets/Cleric.png', 'crystal knight': '/Pets/Crystal Knight.png', 'crystal sage': '/Pets/Crystal Sage.png', 'engineer': '/Pets/Engineer.png', 'frost mage': '/Pets/Frost Mage.png', 'illusionist': '/Pets/Illusionist.png', 'knight': '/Pets/Knight.png', 'lightning': '/Pets/Lightning.png', 'monk': '/Pets/Monk.png', 'necromancer': '/Pets/Necromancer.png', 'rogue': '/Pets/Rogue.png', 'stealth': '/Pets/Stealth.png', 'time knight': '/Pets/Time Knight.png', 'warrior': '/Pets/Warrior.png', 'wizard': '/Pets/Wizard.png' };
    return map[key] || '/Pets/Wizard.png';
};

const calculateAvatarLevel = (xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1);
const calculateCoins = (student) => Math.max(0, Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student?.currency || 0) - (student?.coinsSpent || 0));
const playSound = (sound = 'ding') => { try { const audio = new Audio(`/sounds/${sound}.mp3`); audio.volume = 0.3; audio.play().catch(e => {}); } catch(e) {} };

// Navigation tabs (unchanged)
const CLASSROOM_CHAMPIONS_TABS = [ 
  { id: 'dashboard', name: 'Dashboard', icon: '🏠', shortName: 'Home', mobileIcon: '🏠' }, 
  { id: 'students', name: 'Students', icon: '👥', shortName: 'Students', mobileIcon: '👥' },
  { id: 'quizshow', name: 'Quiz Show', icon: '🎪', shortName: 'Quiz', mobileIcon: '🎪' }, 
  { id: 'quests', name: 'Quests', icon: '📜', shortName: 'Quests', mobileIcon: '📜' }, 
  { id: 'shop', name: 'Shop', icon: '🛒', shortName: 'Shop', mobileIcon: '🛒' }, 
  { id: 'petrace', name: 'Pet Race', icon: '🏇', shortName: 'Race', mobileIcon: '🏇' }
];

const EDUCATIONAL_ELEMENTS_TABS = [
  { id: 'games', name: 'Games', icon: '🎮', shortName: 'Games', mobileIcon: '🎮' }, 
  { id: 'curriculum', name: 'Curriculum Corner', icon: '📖', shortName: 'Curriculum', mobileIcon: '📖' }, 
  { id: 'toolkit', name: 'Teachers Toolkit', icon: '🛠️', shortName: 'Toolkit', mobileIcon: '🛠️' }, 
  { id: 'settings', name: 'Settings', icon: '⚙️', shortName: 'Settings', mobileIcon: '⚙️' } 
];

const showToast = (message, type = 'info') => {
  // Toast notifications disabled as per requirements
};

const goToStudentPortal = () => {
  window.open('https://educational-elements.com/student', '_blank');
};

// MAIN COMPONENT - UPDATED FOR NEW ARCHITECTURE
const ClassroomChampions = () => {
  const router = useRouter();
  
  // Core state
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // App state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Class and student data
  const [currentClassId, setCurrentClassId] = useState(null);
  const [currentClassData, setCurrentClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [xpCategories, setXpCategories] = useState(DEFAULT_XP_CATEGORIES);
  
  // UI state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudentFirstName, setNewStudentFirstName] = useState('');
  const [newStudentLastName, setNewStudentLastName] = useState('');
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  
  // Widget settings
  const [widgetSettings, setWidgetSettings] = useState({
    showTimer: true,
    showNamePicker: true
  });
  
  // Real-time listeners cleanup
  const [classDataUnsubscribe, setClassDataUnsubscribe] = useState(null);
  const [studentsUnsubscribe, setStudentsUnsubscribe] = useState(null);
  
  // Track architecture version
  const [architectureVersion, setArchitectureVersion] = useState('unknown');

// FIXED: Read from old V1 structure: users/{uid}.classes[]
async function loadV1ClassAndStudents(userUid) {
  console.log('🔄 Loading V1 class and students for user:', userUid);
  
  const userSnap = await getDoc(doc(db, 'users', userUid));
  if (!userSnap.exists()) throw new Error('User not found (V1)');

  const u = userSnap.data() || {};
  const classes = Array.isArray(u.classes) ? u.classes : [];
  
  if (classes.length === 0) {
    throw new Error('No classes found (V1)');
  }
  
  // Find first non-archived class, or just use first class
  const cls = classes.find(c => c && c.archived === false) || classes[0];
  if (!cls) throw new Error('No valid class found (V1)');

  const students = Array.isArray(cls.students) ? cls.students : [];
  
  console.log('✅ V1 class loaded:', cls.name, 'with', students.length, 'students');

  // FIXED: normalize class data shape to match what UI expects
  const classData = {
    id: cls.id || cls.classId || cls.classCode || 'v1',
    name: cls.name || 'My Class',
    classCode: cls.classCode || '', // CRITICAL: ensure classCode exists
    xpCategories: cls.xpCategories || DEFAULT_XP_CATEGORIES,
    classRewards: cls.classRewards || [],
    toolkitData: cls.toolkitData || {},
    attendanceData: cls.attendanceData || {},
    activeQuests: cls.activeQuests || [],
    // Add all class properties that might be needed
    ...cls
  };

  return { classData, students };
}

  // AUTH & DATA LOADING - UPDATED FOR NEW ARCHITECTURE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { 
        setUser(user); 
        loadUserData(user);
      } else { 
        router.push('/login'); 
      }
    });
    return () => unsubscribe();
  }, [router]);

const loadUserData = async (user) => {
  setLoading(true);
  setError(null);
  
  try {
    console.log('🔄 Loading user data for:', user.uid);
    
    // 1) Try to get basic user info (your existing helper)
    let userDataResult = null;
    try {
      userDataResult = await getUserData(user.uid);
      console.log('✅ User data loaded via V2 helper');
    } catch (e) {
      console.warn('⚠️ getUserData failed, will try direct V1 access:', e?.message || e);
    }

    if (!userDataResult) {
      // Direct V1 fallback if the getUserData helper doesn't work
      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) {
        userDataResult = userSnap.data();
        console.log('✅ User data loaded via direct V1 access');
      } else {
        throw new Error('User document not found');
      }
    }

    setUserData(userDataResult);
    setWidgetSettings(userDataResult.widgetSettings || { showTimer: true, showNamePicker: true });

    // 2) Try V2 classes first (your existing helper)
    let teacherClasses = [];
    try {
      teacherClasses = await getTeacherClasses(user.uid);
      if (teacherClasses && teacherClasses.length > 0) {
        console.log('✅ V2 classes found:', teacherClasses.length);
        setArchitectureVersion('v2');
        const activeClassId = userDataResult.activeClassId || teacherClasses[0].id;
        await loadClassData(activeClassId); // your existing listener-based loader
        setLoading(false);
        return; // Early return for V2 path
      }
    } catch (e) {
      console.warn('⚠️ getTeacherClasses failed, will try V1 fallback:', e?.message || e);
    }

    // 3) V1 fallback - FIXED
    console.log('🔄 No V2 classes found — using V1 user doc fallback');
    setArchitectureVersion('v1');
    
    const { classData, students } = await loadV1ClassAndStudents(user.uid);
    setCurrentClassData(classData);
    setCurrentClassId(classData.id);
    setXpCategories(classData.xpCategories || DEFAULT_XP_CATEGORIES);
    setStudents(students);
    
    console.log('✅ V1 fallback completed successfully');
    
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    setError(error.message);
  }
  setLoading(false);
};

  const loadClassData = async (classId) => {
    try {
      console.log('Loading class data:', classId);
      
      // Clean up existing listeners
      if (classDataUnsubscribe) classDataUnsubscribe();
      if (studentsUnsubscribe) studentsUnsubscribe();
      
      // Set up real-time listeners for class data
      const classUnsubscribe = listenToClassData(
        classId,
        (classData) => {
          if (classData) {
            console.log('Class data updated:', classData.name);
            setCurrentClassData(classData);
            setCurrentClassId(classId);
            setXpCategories(classData.xpCategories || DEFAULT_XP_CATEGORIES);
          }
        },
        (error) => {
          console.error('Class data listener error:', error);
          setError('Failed to load class data');
        }
      );
      setClassDataUnsubscribe(() => classUnsubscribe);
      
      // Set up real-time listeners for students
      const studentsUnsubscribeFunc = listenToClassStudents(
        classId,
        (studentsData) => {
          console.log('Students data updated:', studentsData.length, 'students');
          setStudents(studentsData || []);
        },
        (error) => {
          console.error('Students listener error:', error);
          setError('Failed to load students data');
        }
      );
      setStudentsUnsubscribe(() => studentsUnsubscribeFunc);
      
    } catch (error) {
      console.error('Error loading class data:', error);
      setError(error.message);
    }
  };

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (classDataUnsubscribe) classDataUnsubscribe();
      if (studentsUnsubscribe) studentsUnsubscribe();
    };
  }, [classDataUnsubscribe, studentsUnsubscribe]);

  // Show welcome popup after data loads
  useEffect(() => {
    if (!loading && user && students.length > 0) {
      const hasShownToday = sessionStorage.getItem('welcomePopupShown');
      if (!hasShownToday) {
        setTimeout(() => {
          setShowWelcomePopup(true);
          sessionStorage.setItem('welcomePopupShown', 'true');
        }, 1000);
      }
    }
  }, [loading, user, students]);

  // STUDENT UPDATE HANDLERS - FIXED FOR V2 CONSISTENCY
  
  const handleUpdateStudent = useCallback(async (studentId, updatedData) => {
    try {
      console.log('🔄 Updating student:', studentId, Object.keys(updatedData));
      
      if (architectureVersion === 'v2') {
        // Use new architecture - NO MANUAL STATE UPDATE, rely on real-time listener
        await updateStudentData(studentId, updatedData, 'Manual Update');
        // Real-time listener will update local state automatically
        console.log('✅ V2 student update sent, waiting for real-time update');
        return updatedData;
      } else {
        // V1 fallback - update in user document
        await updateV1StudentData(user.uid, currentClassId, studentId, updatedData);
        // Update local state for V1
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updatedData } : s));
        return { ...updatedData };
      }
      
    } catch (error) {
      console.error('❌ Error updating student:', error);
      showToast('Error updating student data', 'error');
      throw error;
    }
  }, [architectureVersion, user, currentClassId]);

  // V1 student update helper
  const updateV1StudentData = async (userId, classId, studentId, updatedData) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error('User not found');
    
    const userData = userSnap.data();
    const classes = userData.classes || [];
    
    const updatedClasses = classes.map(cls => {
      if (cls.id === classId || cls.classId === classId) {
        const updatedStudents = cls.students.map(student => {
          if (student.id === studentId) {
            return { ...student, ...updatedData, updatedAt: new Date().toISOString() };
          }
          return student;
        });
        return { ...cls, students: updatedStudents, updatedAt: new Date().toISOString() };
      }
      return cls;
    });
    
    await updateDoc(userRef, { classes: updatedClasses });
  };

  const handleReorderStudents = (reorderedStudents) => {
    // For now, just update local state
    setStudents(reorderedStudents);
  };

  // FIXED: handleBulkAward - Remove manual state updates for V2
  const handleBulkAward = useCallback(async (studentIds, amount, type) => {
    try {
      console.log('💰 Bulk awarding:', { studentIds: studentIds.length, amount, type });
      
      if (architectureVersion === 'v2') {
        // Use new API for V2 - NO MANUAL STATE UPDATE
        const promises = studentIds.map((sid, i) =>
          postStudentUpdate({
            studentId: sid,
            classCode: currentClassData?.classCode,
            updateData: type === 'xp' ? { totalPoints: amount } : { currency: amount },
            mode: 'increment',
            note: `Bulk ${type} Award`,
            opId: `bulk-${type}-${sid}-${Date.now()}-${i}`,
          })
        );
        
        await Promise.allSettled(promises);
        console.log('✅ V2 bulk award sent, waiting for real-time updates');
        
        // Real-time listeners will update the local state automatically
        // NO manual state updates here
        
      } else {
        // V1 fallback - direct updates with manual state updates
        await Promise.allSettled(
          studentIds.map(async (studentId) => {
            const updateData = type === 'xp' 
              ? { totalPoints: (students.find(s => s.id === studentId)?.totalPoints || 0) + amount }
              : { currency: (students.find(s => s.id === studentId)?.currency || 0) + amount };
            
            await updateV1StudentData(user.uid, currentClassId, studentId, updateData);
            
            // Update local state immediately for V1
            setStudents(prev => prev.map(s => 
              s.id === studentId ? { ...s, ...updateData } : s
            ));
          })
        );
      }
      
      // Check for level ups and pet unlocks (works with both V1 and V2)
      students.forEach(student => {
        if (studentIds.includes(student.id) && type === 'xp') {
          const oldLevel = calculateAvatarLevel(student.totalPoints || 0);
          const newLevel = calculateAvatarLevel((student.totalPoints || 0) + amount);
          
          if (newLevel > oldLevel) {
            setLevelUpData({ student, oldLevel, newLevel });
          }
          
          // Check for pet unlock
          const newTotalPoints = (student.totalPoints || 0) + amount;
          if (newTotalPoints >= GAME_CONFIG.PET_UNLOCK_XP && (!student.ownedPets || student.ownedPets.length === 0)) {
            const newPet = getRandomPet();
            setPetUnlockData({ student, pet: newPet });
            // Update student with pet
            handleUpdateStudent(student.id, {
              ownedPets: [newPet]
            });
          }
        }
      });
      
      playSound(type === 'xp' ? 'ding' : 'coins');
      
    } catch (error) {
      console.error('❌ Error in bulk award:', error);
      showToast('Error awarding points', 'error');
    }
  }, [students, handleUpdateStudent, architectureVersion, currentClassData, user, currentClassId]);

  // FIXED: awardXPToStudent - Remove manual state updates for V2
  const awardXPToStudent = useCallback(async (studentId, amount, reason = '') => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        console.error('Student not found:', studentId);
        return;
      }

      console.log(`⭐ Awarding ${amount} XP to ${student.firstName} for ${reason}`);
      
      if (architectureVersion === 'v2' && currentClassData?.classCode) {
        // Use new API for V2 - NO MANUAL STATE UPDATE
        await postStudentUpdate({
          studentId,
          classCode: currentClassData.classCode,
          updateData: { totalPoints: amount },
          mode: 'increment',
          note: `XP Award: ${reason || ''}`,
          opId: `xp-${studentId}-${Date.now()}`,
        });
        
        console.log('✅ V2 XP award sent, waiting for real-time update');
        // Real-time listener will update local state automatically
        
      } else {
        // V1 fallback with manual state update
        const newTotal = (student.totalPoints || 0) + amount;
        await updateV1StudentData(user.uid, currentClassId, studentId, { totalPoints: newTotal });
        
        // Update local state for V1
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, totalPoints: newTotal } : s
        ));
      }
      
      // Check for level up
      const oldLevel = calculateAvatarLevel(student.totalPoints || 0);
      const newLevel = calculateAvatarLevel((student.totalPoints || 0) + amount);
      
      if (newLevel > oldLevel) {
        setLevelUpData({ student: { ...student, totalPoints: (student.totalPoints || 0) + amount }, oldLevel, newLevel });
      }
      
      // Check for pet unlock
      const newTotalPoints = (student.totalPoints || 0) + amount;
      if (newTotalPoints >= GAME_CONFIG.PET_UNLOCK_XP && (!student.ownedPets || student.ownedPets.length === 0)) {
        const newPet = getRandomPet();
        setPetUnlockData({ student, pet: newPet });
        await handleUpdateStudent(studentId, {
          ownedPets: [newPet]
        });
      }
      
      playSound('ding');
      
    } catch (error) {
      console.error('❌ Error awarding XP:', error);
      showToast('Error awarding XP', 'error');
    }
  }, [students, handleUpdateStudent, architectureVersion, currentClassData, user, currentClassId]);

  // FIXED: awardCoinsToStudent - Remove manual state updates for V2
  const awardCoinsToStudent = useCallback(async (studentId, amount, reason = '') => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        console.error('Student not found:', studentId);
        return;
      }

      console.log(`🪙 Awarding ${amount} coins to ${student.firstName} for ${reason}`);
      
      if (architectureVersion === 'v2' && currentClassData?.classCode) {
        // Use new API for V2 - NO MANUAL STATE UPDATE
        await postStudentUpdate({
          studentId,
          classCode: currentClassData.classCode,
          updateData: { currency: amount },
          mode: 'increment',
          note: `Coin Award: ${reason || ''}`,
          opId: `coin-${studentId}-${Date.now()}`,
        });
        
        console.log('✅ V2 coin award sent, waiting for real-time update');
        // Real-time listener will update local state automatically
        
      } else {
        // V1 fallback with manual state update
        const newTotal = (student.currency || 0) + amount;
        await updateV1StudentData(user.uid, currentClassId, studentId, { currency: newTotal });
        
        // Update local state for V1
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, currency: newTotal } : s
        ));
      }
      
      playSound('coins');
      
    } catch (error) {
      console.error('❌ Error awarding coins:', error);
      showToast('Error awarding coins', 'error');
    }
  }, [students, architectureVersion, currentClassData, user, currentClassId]);

  const addStudent = async () => {
    if (!newStudentFirstName.trim() || !currentClassId) return;
    
    try {
      console.log('👨‍🎓 Creating new student:', newStudentFirstName, newStudentLastName);      
      if (architectureVersion === 'v2') {
        // Use new architecture
        await createStudent(currentClassId, {
          firstName: newStudentFirstName.trim(),
          lastName: newStudentLastName.trim()
        });
      } else {
        // V1 fallback - add to user document
        const newStudent = {
          id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          firstName: newStudentFirstName.trim(),
          lastName: newStudentLastName.trim(),
          totalPoints: 0,
          currency: 0,
          coinsSpent: 0,
          avatarBase: 'Wizard F',
          avatarLevel: 1,
          ownedAvatars: ['Wizard F'],
          ownedPets: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        const classes = userData.classes || [];
        
        const updatedClasses = classes.map(cls => {
          if (cls.id === currentClassId || cls.classId === currentClassId) {
            return { ...cls, students: [...(cls.students || []), newStudent] };
          }
          return cls;
        });
        
        await updateDoc(userRef, { classes: updatedClasses });
        setStudents(prev => [...prev, newStudent]);
      }
      
      setNewStudentFirstName('');
      setNewStudentLastName('');
      setShowAddStudentModal(false);
      
      showToast('Student added successfully!', 'success');
      
    } catch (error) {
      console.error('❌ Error creating student:', error);
      showToast('Error creating student', 'error');
    }
  };

  // CLASS DATA HANDLERS - UPDATED FOR ARCHITECTURE COMPATIBILITY
  
  const handleUpdateCategories = async (newCategories) => {
    try {
      if (architectureVersion === 'v2') {
        await updateClassData(currentClassId, { xpCategories: newCategories });
      } else {
        // V1 fallback
        await updateV1ClassData(user.uid, currentClassId, { xpCategories: newCategories });
      }
      setXpCategories(newCategories);
    } catch (error) {
      console.error('❌ Error updating categories:', error);
      showToast('Error updating XP categories', 'error');
    }
  };

  const saveClassData = async (updates) => {
    try {
      if (architectureVersion === 'v2') {
        await updateClassData(currentClassId, updates);
      } else {
        // V1 fallback
        await updateV1ClassData(user.uid, currentClassId, updates);
      }
    } catch (error) {
      console.error('❌ Error saving class data:', error);
      showToast('Error saving data', 'error');
      throw error;
    }
  };

  // V1 class update helper
  const updateV1ClassData = async (userId, classId, updatedData) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) throw new Error('User not found');
    
    const userData = userSnap.data();
    const classes = userData.classes || [];
    
    const updatedClasses = classes.map(cls => {
      if (cls.id === classId || cls.classId === classId) {
        return { ...cls, ...updatedData, updatedAt: new Date().toISOString() };
      }
      return cls;
    });
    
    await updateDoc(userRef, { classes: updatedClasses });
    
    // Update local state
    setCurrentClassData(prev => ({ ...prev, ...updatedData }));
  };

  const saveWidgetSettings = async (newSettings) => {
    try {
      if (architectureVersion === 'v2') {
        await updateUserPreferences(user.uid, { widgetSettings: newSettings });
      } else {
        // V1 fallback
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { widgetSettings: newSettings });
      }
      setWidgetSettings(newSettings);
    } catch (error) {
      console.error('❌ Error saving widget settings:', error);
      showToast('Error saving widget settings', 'error');
    }
  };

  // CLASS CODE MANAGEMENT - FIXED
  
  const updateClassCode = async (newClassCode) => {
    try {
      if (architectureVersion === 'v2') {
        await updateClassData(currentClassId, { classCode: newClassCode });
      } else {
        // V1 fallback
        await updateV1ClassData(user.uid, currentClassId, { classCode: newClassCode });
      }
    } catch (error) {
      console.error('❌ Error updating class code:', error);
      throw error;
    }
  };

  const copyClassCode = () => {
    if (currentClassData?.classCode) {
      navigator.clipboard.writeText(currentClassData.classCode).then(() => {
        showToast('Class code copied!', 'success');
      }).catch(() => {
        console.error('Failed to copy class code');
      });
    }
  };

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateNewCode = async () => {
    const newCode = generateClassCode();
    try {
      await updateClassCode(newCode);
      showToast('New class code generated!', 'success');
    } catch (error) {
      console.error('❌ Error generating class code:', error);
      showToast('Error generating class code', 'error');
    }
  };

  // Helper functions for components
  const getRandomPet = () => {
    const PET_SPECIES = [ { name: 'Alchemist', type: 'alchemist', rarity: 'common' }, { name: 'Barbarian', type: 'barbarian', rarity: 'common' }, { name: 'Bard', type: 'bard', rarity: 'common' }, { name: 'Beastmaster', type: 'beastmaster', rarity: 'rare' }, { name: 'Cleric', type: 'cleric', rarity: 'common' }, { name: 'Crystal Knight', type: 'crystal knight', rarity: 'epic' }, { name: 'Crystal Sage', type: 'crystal sage', rarity: 'epic' }, { name: 'Engineer', type: 'engineer', rarity: 'rare' }, { name: 'Frost Mage', type: 'frost mage', rarity: 'rare' }, { name: 'Illusionist', type: 'illusionist', rarity: 'epic' }, { name: 'Knight', type: 'knight', rarity: 'common' }, { name: 'Lightning', type: 'lightning', rarity: 'legendary' }, { name: 'Monk', type: 'monk', rarity: 'common' }, { name: 'Necromancer', type: 'necromancer', rarity: 'epic' }, { name: 'Rogue', type: 'rogue', rarity: 'common' }, { name: 'Stealth', type: 'stealth', rarity: 'rare' }, { name: 'Time Knight', type: 'time knight', rarity: 'legendary' }, { name: 'Warrior', type: 'warrior', rarity: 'common' }, { name: 'Wizard', type: 'wizard', rarity: 'common' } ];
    try {
        const pet = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
        return { id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: pet.name, type: pet.type, rarity: pet.rarity, displayName: pet.name, imageType: pet.type };
    } catch (error) {
        return { id: `pet_${Date.now()}_failsafe`, name: 'Wizard', type: 'wizard', rarity: 'common', displayName: 'Wizard', imageType: 'wizard' };
    }
  };

  // RENDER TAB CONTENT - UPDATED PROP PASSING
  const renderTabContent = () => {
    const commonProps = {
      students,
      showToast,
      getAvatarImage,
      getPetImage,
      calculateCoins,
      calculateAvatarLevel,
      user,
      currentClassId
    };

    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab 
                  {...commonProps}
                  SHOP_BASIC_AVATARS={SHOP_BASIC_AVATARS}
                  SHOP_PREMIUM_AVATARS={SHOP_PREMIUM_AVATARS}
                  SHOP_BASIC_PETS={SHOP_BASIC_PETS}
                  SHOP_PREMIUM_PETS={SHOP_PREMIUM_PETS}
                />;
      
      case 'students':
        return <StudentsTab 
                  {...commonProps}
                  xpCategories={xpCategories}
                  onUpdateCategories={handleUpdateCategories} 
                  onBulkAward={handleBulkAward} 
                  onUpdateStudent={handleUpdateStudent} 
                  onReorderStudents={handleReorderStudents} 
                  onViewDetails={setSelectedStudent} 
                  onAddStudent={() => setShowAddStudentModal(true)}
                />;
      
      case 'quests':
        return <QuestsTab
                  {...commonProps}
                  userData={userData}
                  onAwardXP={awardXPToStudent}
                  onAwardCoins={awardCoinsToStudent}
                  saveClassData={saveClassData}
                />;
      
      case 'quizshow':
        return <QuizShowTab 
                  {...commonProps}
                  userData={userData}
                  onAwardXP={awardXPToStudent}
                  onAwardCoins={awardCoinsToStudent}
                />;
      
      case 'shop':
        return <ShopTab
                  {...commonProps}
                  onUpdateStudent={handleUpdateStudent}
                  SHOP_BASIC_AVATARS={SHOP_BASIC_AVATARS}
                  SHOP_PREMIUM_AVATARS={SHOP_PREMIUM_AVATARS}
                  SHOP_BASIC_PETS={SHOP_BASIC_PETS}
                  SHOP_PREMIUM_PETS={SHOP_PREMIUM_PETS}
                  classRewards={currentClassData?.classRewards || []}
                  onUpdateRewards={(rewards) => saveClassData({ classRewards: rewards })}
                  saveRewards={(rewards) => saveClassData({ classRewards: rewards })}
                />;
      
      case 'petrace':
        return <PetRaceTab
                  {...commonProps}
                  updateStudent={handleUpdateStudent}
                />;
      
      case 'games':
        return <GamesTab {...commonProps} />;
      
      case 'curriculum':
        return <CurriculumCornerTab 
                  {...commonProps}
                  saveData={saveClassData}
                  loadedData={currentClassData?.toolkitData || {}}
                />;
      
      case 'toolkit':
        return <TeachersToolkitTab 
                  {...commonProps}
                  userData={userData}
                  saveGroupDataToFirebase={(data) => saveClassData({ groupData: data })}
                  saveClassroomDataToFirebase={(data) => {
                    if (Array.isArray(data)) {
                      // Handle student array updates
                      setStudents(data);
                    } else {
                      saveClassData({ classroomData: data });
                    }
                  }}
                  onAwardXP={awardXPToStudent}
                  onAwardCoins={awardCoinsToStudent}
                  onBulkAward={handleBulkAward}
                  activeQuests={currentClassData?.activeQuests || []}
                  attendanceData={currentClassData?.attendanceData || {}}
                  markAttendance={(studentId, status) => {
                    const today = new Date().toISOString().split('T')[0];
                    const updatedAttendance = {
                      ...currentClassData?.attendanceData,
                      [today]: {
                        ...(currentClassData?.attendanceData?.[today] || {}),
                        [studentId]: status,
                      },
                    };
                    saveClassData({ attendanceData: updatedAttendance });
                  }}
                  completeQuest={() => showToast('Quest completed!', 'success')}
                  setShowQuestManagement={() => showToast('Quest management opened!', 'info')}
                  saveToolkitData={(data) => saveClassData({ toolkitData: { ...currentClassData?.toolkitData, ...data } })}
                  loadedData={currentClassData?.toolkitData || {}}
                />;
      
      case 'settings':
        return <SettingsTab 
                  {...commonProps}
                  setStudents={setStudents}
                  updateAndSaveClass={() => {}} // Deprecated in new architecture
                  AVAILABLE_AVATARS={AVAILABLE_AVATARS}
                  currentClassData={currentClassData}
                  updateClassCode={updateClassCode}
                  widgetSettings={widgetSettings}
                  onUpdateWidgetSettings={saveWidgetSettings}
                />;
      
      default:
        return <div className="p-8 text-center text-gray-500">This tab is under construction.</div>;
    }
  };
  
  if (loading) { 
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Educational Elements...</p>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    ); 
  }

  if (error && !currentClassData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="text-sm text-gray-500 mb-4">
            Architecture: {architectureVersion}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* MOBILE-FRIENDLY HEADER */}
        <div className="bg-white shadow-lg border-b-4 border-blue-500">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
                
                {/* Mobile Header Layout */}
                <div className="flex items-center justify-between lg:hidden">
                    <div className="flex items-center min-w-0 flex-1">
                        <img 
                            src="/Logo/LOGO_NoBG.png" 
                            alt="Educational Elements Logo" 
                            className="h-8 w-8 sm:h-10 sm:w-10 mr-2 flex-shrink-0"
                        />
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                                Educational Elements
                            </h1>
                        </div>
                    </div>
                    
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Desktop Header Layout */}
                <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center">
                        <img 
                            src="/Logo/LOGO_NoBG.png" 
                            alt="Educational Elements Logo" 
                            className="h-12 w-12 mr-4"
                        />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Educational Elements
                        </h1>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* Architecture Version Indicator (Development only) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${
                              architectureVersion === 'v2' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {architectureVersion.toUpperCase()}
                            </div>
                        )}
                        
                        {/* Class Code Display */}
                        {currentClassData?.classCode && (
                            <div className="flex items-center space-x-2">
                                <div className="text-sm text-gray-600 hidden md:block">Class Code:</div>
                                <div className="bg-green-100 border-2 border-green-300 rounded-lg px-3 py-2">
                                    <span className="text-lg font-bold text-green-700 tracking-wider">
                                        {currentClassData.classCode}
                                    </span>
                                </div>
                                <button
                                    onClick={copyClassCode}
                                    className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                    title="Copy class code"
                                  >
                                    📋
                                </button>
                                <button
                                    onClick={handleGenerateNewCode}
                                    className="bg-orange-500 text-white px-2 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                                    title="Generate new code"
                                  >
                                    🔄
                                </button>
                            </div>
                        )}
                        
                        {!currentClassData?.classCode && (
                            <div className="flex items-center space-x-2">
                                <div className="text-sm text-orange-600 hidden md:block">No class code</div>
                                <button
                                    onClick={handleGenerateNewCode}
                                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                                >
                                    📱 Generate Code
                                </button>
                            </div>
                        )}
                        
                        <button 
                            onClick={goToStudentPortal}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium shadow-md text-sm"
                        >
                            🎓 Portal
                        </button>
                        <button 
                            onClick={() => auth.signOut()} 
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden mt-3 bg-gray-50 rounded-lg p-3 border">
                        {/* Architecture Version (Development only) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mb-2">
                                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  architectureVersion === 'v2' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  Architecture: {architectureVersion.toUpperCase()}
                                </div>
                            </div>
                        )}
                        
                        {currentClassData?.classCode ? (
                            <div className="mb-4 p-3 bg-white rounded-lg">
                                <div className="text-sm text-gray-600 mb-2">Class Code:</div>
                                <div className="flex items-center space-x-2">
                                    <div className="bg-green-100 border-2 border-green-300 rounded-lg px-3 py-2 flex-1">
                                        <span className="text-lg font-bold text-green-700 tracking-wider">
                                            {currentClassData.classCode}
                                        </span>
                                    </div>
                                    <button
                                        onClick={copyClassCode}
                                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                    >
                                        📋
                                    </button>
                                </div>
                                <button
                                    onClick={handleGenerateNewCode}
                                    className="w-full mt-2 bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm"
                                >
                                    🔄 Generate New Code
                                </button>
                            </div>
                        ) : (
                            <div className="mb-4 p-3 bg-white rounded-lg">
                                <div className="text-sm text-orange-600 mb-2">No class code set</div>
                                <button
                                    onClick={handleGenerateNewCode}
                                    className="w-full bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                                >
                                    📱 Generate Class Code
                                </button>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <button 
                                onClick={goToStudentPortal}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium text-sm"
                            >
                                🎓 Student Portal
                            </button>
                            <button 
                                onClick={() => auth.signOut()} 
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
        
        {/* MOBILE-FRIENDLY NAVIGATION TABS */}
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto">
                <div className="hidden sm:flex items-center justify-center gap-8 px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                    🏆 Classroom Champions
                  </h3>
                  <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                    📚 Educational Tools
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <div className="flex min-w-full">
                        {CLASSROOM_CHAMPIONS_TABS.map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setShowMobileMenu(false);
                                }} 
                                className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1 px-2 sm:px-3 py-2 sm:py-2.5 transition-all duration-200 text-xs whitespace-nowrap min-w-[60px] sm:min-w-[80px] ${
                                    activeTab === tab.id 
                                        ? 'text-purple-600 border-b-2 font-semibold border-purple-600 bg-purple-50' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-sm sm:text-base">{tab.mobileIcon}</span>
                                <span className="hidden sm:inline text-xs">{tab.shortName}</span>
                                <span className="sm:hidden text-[10px] leading-tight text-center">{tab.shortName}</span>
                            </button>
                        ))}
                        
                        <div className="w-px bg-gray-300 mx-1 my-1"></div>
                        
                        {EDUCATIONAL_ELEMENTS_TABS.map(tab => (
                            <button 
                                key={tab.id} 
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setShowMobileMenu(false);
                                }} 
                                className={`flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-1 px-2 sm:px-3 py-2 sm:py-2.5 transition-all duration-200 text-xs whitespace-nowrap min-w-[60px] sm:min-w-[80px] ${
                                    activeTab === tab.id 
                                        ? 'text-blue-600 border-b-2 font-semibold border-blue-600 bg-blue-50' 
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            >
                                <span className="text-sm sm:text-base">{tab.mobileIcon}</span>
                                <span className="hidden sm:inline text-xs">{tab.shortName}</span>
                                <span className="sm:hidden text-[10px] leading-tight text-center">{tab.shortName}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        
        {/* MAIN CONTENT */}
        <main className="max-w-screen-2xl mx-auto px-2 sm:px-4 py-3 sm:py-6">{renderTabContent()}</main>
        
        {/* FLOATING WIDGETS */}
        <div className="fixed inset-0 pointer-events-none z-50">
          {widgetSettings.showTimer && (
            <div className="pointer-events-auto">
              <FloatingTimer 
                showToast={showToast}
                playSound={playSound}
              />
            </div>
          )}
          
          {widgetSettings.showNamePicker && students.length > 0 && (
            <div className="pointer-events-auto">
              <FloatingNamePicker 
                students={students}
                showToast={showToast}
                playSound={playSound}
                getAvatarImage={getAvatarImage}
                calculateAvatarLevel={calculateAvatarLevel}
              />
            </div>
          )}
        </div>
        
        {/* MODALS */}
        {showAddStudentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-t-2xl">
                        <h2 className="text-xl sm:text-2xl font-bold">Add New Champion</h2>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <input 
                            type="text" 
                            value={newStudentFirstName} 
                            onChange={(e) => setNewStudentFirstName(e.target.value)} 
                            placeholder="First Name" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                        />
                        <input 
                            type="text" 
                            value={newStudentLastName} 
                            onChange={(e) => setNewStudentLastName(e.target.value)} 
                            placeholder="Last Name (Optional)" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 pt-0">
                        <button 
                            onClick={() => setShowAddStudentModal(false)} 
                            className="w-full sm:flex-1 px-4 py-2 border rounded-lg text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={addStudent} 
                            className="w-full sm:flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
                        >
                            Add Champion
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {levelUpData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-4 sm:p-6">
                    <div className="text-4xl sm:text-6xl mb-2">🎉</div>
                    <h2 className="text-xl sm:text-2xl font-bold">LEVEL UP!</h2>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 my-2">
                        {levelUpData.student.firstName} reached Level {levelUpData.newLevel}!
                    </h3>
                    <img 
                        src={getAvatarImage(levelUpData.student.avatarBase, levelUpData.newLevel)} 
                        alt="New Avatar" 
                        className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-full border-4 border-yellow-400"
                    />
                    <button 
                        onClick={() => setLevelUpData(null)} 
                        className="mt-4 w-full bg-yellow-500 text-white py-2 rounded text-sm sm:text-base"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        )}
        
        {petUnlockData && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-4 sm:p-6">
                    <div className="text-4xl sm:text-6xl mb-2">🐾</div>
                    <h2 className="text-xl sm:text-2xl font-bold">PET UNLOCKED!</h2>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 my-2">
                        {petUnlockData.student.firstName} found a companion!
                    </h3>
                    <img 
                        src={getPetImage(petUnlockData.pet)} 
                        alt={petUnlockData.pet.name} 
                        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full border-4 border-purple-400"
                    />
                    <h4 className="text-base sm:text-lg font-semibold text-purple-600 mt-2">
                        {petUnlockData.pet.name}
                    </h4>
                    <button 
                        onClick={() => setPetUnlockData(null)} 
                        className="mt-4 w-full bg-purple-500 text-white py-2 rounded text-sm sm:text-base"
                    >
                        Meet My Pet!
                    </button>
                </div>
            </div>
        )}
        
        {selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        <button 
                            onClick={() => setSelectedStudent(null)} 
                            className="float-right text-2xl font-bold"
                        >
                            ×
                        </button>
                        <h2 className="text-xl sm:text-2xl font-bold">
                            {selectedStudent.firstName} {selectedStudent.lastName}
                        </h2>
                        <p className="text-sm sm:text-base">Level {calculateAvatarLevel(selectedStudent.totalPoints || 0)} Champion</p>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <img 
                                    src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints))} 
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-blue-400" 
                                />
                            </div>
                            <div className="space-y-2 sm:space-y-4">
                                <p className="text-sm sm:text-base">
                                    <strong>XP:</strong> {selectedStudent.totalPoints || 0}
                                </p>
                                <p className="text-sm sm:text-base">
                                    <strong>Coins:</strong> {calculateCoins(selectedStudent)}
                                </p>
                                {selectedStudent.ownedPets?.[0] && (
                                    <div>
                                        <p className="text-sm sm:text-base">
                                            <strong>Companion:</strong> {selectedStudent.ownedPets[0].name}
                                        </p>
                                        <img 
                                            src={getPetImage(selectedStudent.ownedPets[0])} 
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-purple-300"
                                        />
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