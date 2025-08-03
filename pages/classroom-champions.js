// pages/classroom-champions.js - COMPLETE FILE WITH TOOLKIT DATA PERSISTENCE
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Import components
import StudentsTab from '../components/tabs/StudentsTab';
import ShopTab from '../components/tabs/ShopTab';
import QuestsTab from '../components/tabs/QuestsTab';
import GamesTab from '../components/tabs/GamesTab';
import SettingsTab from '../components/tabs/SettingsTab';
import TeachersToolkitTab from '../components/tabs/TeachersToolkitTab';
import CurriculumCornerTab from '../components/tabs/CurriculumCornerTab';

// ===============================================
// CORE GAME CONSTANTS & UTILITIES
// ===============================================
const GAME_CONFIG = { MAX_LEVEL: 4, COINS_PER_XP: 5, PET_UNLOCK_XP: 50 };
const DEFAULT_XP_CATEGORIES = [ { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' }, { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' }, { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' }, { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' }, { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' } ];

// Standard Level-Up Avatars
const AVAILABLE_AVATARS = [ 'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M', 'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M', 'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M', 'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M', 'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M', 'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M', 'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M' ];

// Standard Pets (Unlocked with XP)
const PET_SPECIES = [ { name: 'Alchemist', type: 'alchemist', rarity: 'common' }, { name: 'Barbarian', type: 'barbarian', rarity: 'common' }, { name: 'Bard', type: 'bard', rarity: 'common' }, { name: 'Beastmaster', type: 'beastmaster', rarity: 'rare' }, { name: 'Cleric', type: 'cleric', rarity: 'common' }, { name: 'Crystal Knight', type: 'crystal knight', rarity: 'epic' }, { name: 'Crystal Sage', type: 'crystal sage', rarity: 'epic' }, { name: 'Engineer', type: 'engineer', rarity: 'rare' }, { name: 'Frost Mage', type: 'frost mage', rarity: 'rare' }, { name: 'Illusionist', type: 'illusionist', rarity: 'epic' }, { name: 'Knight', type: 'knight', rarity: 'common' }, { name: 'Lightning', type: 'lightning', rarity: 'legendary' }, { name: 'Monk', type: 'monk', rarity: 'common' }, { name: 'Necromancer', type: 'necromancer', rarity: 'epic' }, { name: 'Rogue', type: 'rogue', rarity: 'common' }, { name: 'Stealth', type: 'stealth', rarity: 'rare' }, { name: 'Time Knight', type: 'time knight', rarity: 'legendary' }, { name: 'Warrior', type: 'warrior', rarity: 'common' }, { name: 'Wizard', type: 'wizard', rarity: 'common' } ];

// ===============================================
// CENTRALIZED SHOP ITEM DEFINITIONS
// ===============================================
const SHOP_BASIC_AVATARS = [ { name: 'Banana', price: 10, path: '/shop/Basic/Banana.png' }, { name: 'Goblin1', price: 15, path: '/shop/Basic/Goblin1.png' }, { name: 'GoblinGirl1', price: 15, path: '/shop/Basic/GoblinGirl1.png' }, { name: 'Guard1', price: 20, path: '/shop/Basic/Guard1.png' }, { name: 'GuardGirl1', price: 20, path: '/shop/Basic/GuardGirl1.png' }, { name: 'SoccerBoy', price: 10, path: '/shop/Basic/SoccerBoy.png' }, { name: 'SoccerBoy2', price: 10, path: '/shop/Basic/SoccerBoy2.png' }, { name: 'SoccerGirl', price: 10, path: '/shop/Basic/SoccerGirl.png' }, { name: 'StreetBoy1', price: 15, path: '/shop/Basic/Streetboy1.png' }, { name: 'StreetGirl1', price: 15, path: '/shop/Basic/Streetgirl1.png' }, { name: 'Vampire1', price: 20, path: '/shop/Basic/Vampire1.png' } ];
const SHOP_PREMIUM_AVATARS = [ { name: 'Goblin2', price: 30, path: '/shop/Premium/Goblin2.png' }, { name: 'GoblinGirl2', price: 30, path: '/shop/Premium/GoblinGirl2.png' }, { name: 'Vampire2', price: 40, path: '/shop/Premium/Vampire2.png' }, { name: 'VampireGirl2', price: 40, path: '/shop/Premium/VampireGirl2.png' } ];
const SHOP_BASIC_PETS = [ { name: 'Goblin Pet', price: 25, path: '/shop/BasicPets/GoblinPet.png' }, { name: 'Soccer Pet', price: 20, path: '/shop/BasicPets/SoccerPet.png' }, { name: 'Unicorn Pet', price: 35, path: '/shop/BasicPets/UnicornPet.png' } ];
const SHOP_PREMIUM_PETS = [ { name: 'Snake Pet', price: 50, path: '/shop/PremiumPets/SnakePet.png' }, { name: 'Vampire Pet', price: 50, path: '/shop/PremiumPets/VampirePet.png' } ];

// ===============================================
// SMART IMAGE HELPER FUNCTIONS
// ===============================================
const getAvatarImage = (avatarBase, level) => {
    const shopItem = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS].find(a => a.name.toLowerCase() === avatarBase?.toLowerCase());
    if (shopItem) return shopItem.path;
    return `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`;
};

const getPetImage = (pet) => {
    if (!pet || !pet.name) return '/Pets/Wizard.png';

    // First, check if pet has a direct path (for shop pets)
    if (pet.path) return pet.path;

    // Then, check shop items (case insensitive)
    const shopItem = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS].find(p => p.name.toLowerCase() === pet.name.toLowerCase());
    if (shopItem) return shopItem.path;

    // For standard pets
    const key = (pet.type || pet.name || '').toLowerCase();
    const map = { 'alchemist': '/Pets/Alchemist.png', 'barbarian': '/Pets/Barbarian.png', 'bard': '/Pets/Bard.png', 'beastmaster': '/Pets/Beastmaster.png', 'cleric': '/Pets/Cleric.png', 'crystal knight': '/Pets/Crystal Knight.png', 'crystal sage': '/Pets/Crystal Sage.png', 'engineer': '/Pets/Engineer.png', 'frost mage': '/Pets/Frost Mage.png', 'illusionist': '/Pets/Illusionist.png', 'knight': '/Pets/Knight.png', 'lightning': '/Pets/Lightning.png', 'monk': '/Pets/Monk.png', 'necromancer': '/Pets/Necromancer.png', 'rogue': '/Pets/Rogue.png', 'stealth': '/Pets/Stealth.png', 'time knight': '/Pets/Time Knight.png', 'warrior': '/Pets/Warrior.png', 'wizard': '/Pets/Wizard.png', 'dragon': '/Pets/Lightning.png', 'phoenix': '/Pets/Crystal Sage.png', 'unicorn': '/Pets/Time Knight.png', 'wolf': '/Pets/Warrior.png', 'owl': '/Pets/Wizard.png', 'cat': '/Pets/Rogue.png', 'tiger': '/Pets/Barbarian.png', 'bear': '/Pets/Beastmaster.png', 'lion': '/Pets/Knight.png', 'eagle': '/Pets/Stealth.png' };
    return map[key] || '/Pets/Wizard.png';
};

const calculateAvatarLevel = (xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1);
const calculateCoins = (student) => Math.max(0, Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP) + (student?.currency || 0) - (student?.coinsSpent || 0));
const playSound = (sound = 'ding') => { try { const audio = new Audio(`/sounds/${sound}.mp3`); audio.volume = 0.3; audio.play().catch(e => {}); } catch(e) {} };
const shouldReceivePet = (student) => (student?.totalPoints || 0) >= GAME_CONFIG.PET_UNLOCK_XP && (!student?.ownedPets || student.ownedPets.length === 0);
const getRandomPet = () => {
    try {
        const pet = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
        return { id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: pet.name, type: pet.type, rarity: pet.rarity, displayName: pet.name, imageType: pet.type };
    } catch (error) {
        return { id: `pet_${Date.now()}_failsafe`, name: 'Wizard', type: 'wizard', rarity: 'common', displayName: 'Wizard', imageType: 'wizard' };
    }
};

const showToast = (message, type = 'info') => {
  alert(`${type.toUpperCase()}: ${message}`);
};

const NAVIGATION_TABS = [ { id: 'dashboard', name: 'Dashboard', icon: '🏠'}, { id: 'students', name: 'Students', icon: '👥'}, { id: 'quests', name: 'Quests', icon: '📜'}, { id: 'shop', name: 'Shop', icon: '🏪'}, { id: 'games', name: 'Games', icon: '🎮'}, { id: 'curriculum', name: 'Curriculum Corner', icon: '📖'}, { id: 'toolkit', name: 'Teachers Toolkit', icon: '🛠️'}, { id: 'settings', name: 'Settings', icon: '⚙️'} ];

// ===============================================
// MAIN COMPONENT
// ===============================================
const ClassroomChampions = () => {
  const router = useRouter();
  
  // States
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [xpCategories, setXpCategories] = useState(DEFAULT_XP_CATEGORIES);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudentFirstName, setNewStudentFirstName] = useState('');
  const [newStudentLastName, setNewStudentLastName] = useState('');
  const [attendanceData, setAttendanceData] = useState({});
  const [activeQuests, setActiveQuests] = useState([]);

  // AUTH & DATA LOADING
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { setUser(user); loadUserData(user); } 
      else { router.push('/login'); }
    });
    return () => unsubscribe();
  }, [router]);

  const loadUserData = async (user) => {
    setLoading(true);
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const loadedUserData = docSnap.data();
        setUserData(loadedUserData);
        const activeClassId = loadedUserData.activeClassId || (loadedUserData.classes && loadedUserData.classes[0]?.id);
        if (activeClassId) {
          const activeClass = loadedUserData.classes.find(cls => cls.id === activeClassId);
          setCurrentClassId(activeClass.id);
          setStudents(activeClass.students || []);
          setXpCategories(activeClass.xpCategories || DEFAULT_XP_CATEGORIES);
          // Load additional data if available
          setAttendanceData(activeClass.attendanceData || {});
          setActiveQuests(activeClass.activeQuests || []);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      showToast('Error loading class data', 'error');
    }
    setLoading(false);
  };

  // ===============================================
  // ROBUST FIREBASE SAVING FUNCTIONS
  // ===============================================

  // Main function to update and save class data
  const updateAndSaveClass = async (updatedStudents, updatedCategories, additionalUpdates = {}) => {
    if (!user || !currentClassId) return;
    const docRef = doc(firestore, 'users', user.uid);
    try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const loadedUserData = docSnap.data();
            const updatedClasses = loadedUserData.classes.map(cls =>
                cls.id === currentClassId 
                    ? { 
                        ...cls, 
                        students: updatedStudents || cls.students, 
                        xpCategories: updatedCategories || cls.xpCategories,
                        ...additionalUpdates
                      } 
                    : cls
            );
            await updateDoc(docRef, { classes: updatedClasses });
        }
    } catch (error) { 
      console.error("Error saving class data:", error); 
      showToast('Error saving data', 'error');
    }
  };

  // General save for tool data
  const saveClassData = async (updates) => {
    if (!user || !currentClassId) return;
    const docRef = doc(firestore, 'users', user.uid);
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const loadedUserData = docSnap.data();
        const updatedClasses = loadedUserData.classes.map(cls =>
          cls.id === currentClassId ? { ...cls, ...updates } : cls
        );
        await updateDoc(docRef, { classes: updatedClasses });
        
        // Update local userData state to reflect changes
        const newUserData = { ...loadedUserData, classes: updatedClasses };
        setUserData(newUserData);
        
        console.log('Class data saved successfully!', updates);
      }
    } catch (error) {
      console.error("Error saving tool data:", error);
      showToast('Error saving toolkit data', 'error');
    }
  };

  // Tool-specific save functions
  const saveGroupDataToFirebase = async (groupData) => {
    await saveClassData({ groupData });
  };

  const saveClassroomDataToFirebase = async (data, classId) => {
    // This function can now correctly handle student array updates or other specific data objects
    if (Array.isArray(data)) {
      await updateAndSaveClass(data, xpCategories);
    } else {
      await saveClassData({ classroomData: data });
    }
  };

  // CORRECTED: This is the dedicated function for saving all toolkit data.
  // It merges new data with existing toolkit data, ensuring nothing is overwritten.
  const saveToolkitDataToFirebase = async (toolkitUpdates) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const loadedUserData = docSnap.data();
        
        const updatedClasses = loadedUserData.classes.map(cls => {
          if (cls.id === currentClassId) {
            // Merge new updates with existing toolkitData
            const updatedToolkitData = {
              ...cls.toolkitData, // Keep existing toolkit data
              ...toolkitUpdates,  // Add or overwrite with new updates
              lastUpdated: new Date().toISOString()
            };
            return { ...cls, toolkitData: updatedToolkitData };
          }
          return cls;
        });
        
        await updateDoc(docRef, { classes: updatedClasses });
        
        // Update local state to ensure UI consistency
        const newUserData = { ...loadedUserData, classes: updatedClasses };
        setUserData(newUserData);
        
        console.log('Toolkit data saved:', toolkitUpdates);
      }
    } catch (error) {
      console.error("Error saving toolkit data:", error);
      showToast('Error saving toolkit data', 'error');
    }
  };

  // ===============================================
  // STATE HANDLERS
  // ===============================================
  const handleReorderStudents = (reorderedStudents) => {
    setStudents(reorderedStudents);
    updateAndSaveClass(reorderedStudents, xpCategories);
  };

  const handleUpdateStudent = (updatedStudent) => {
    const newStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(newStudents);
    updateAndSaveClass(newStudents, xpCategories);
  };
    
  const handleUpdateCategories = (newCategories) => {
    setXpCategories(newCategories);
    updateAndSaveClass(students, newCategories);
  };
    
  const handleBulkAward = (studentIds, amount, type) => {
      const newStudents = students.map(student => {
          if (studentIds.includes(student.id)) {
              let updatedStudent = { ...student, lastUpdated: new Date().toISOString() };
              if (type === 'xp') {
                  const oldLevel = calculateAvatarLevel(updatedStudent.totalPoints || 0);
                  updatedStudent.totalPoints = (updatedStudent.totalPoints || 0) + amount;
                  const newLevel = calculateAvatarLevel(updatedStudent.totalPoints);
                  if (newLevel > oldLevel) setLevelUpData({ student: updatedStudent, oldLevel, newLevel });
                  if (shouldReceivePet(updatedStudent)) {
                      const newPet = getRandomPet();
                      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
                      setPetUnlockData({ student: updatedStudent, pet: newPet });
                  }
                  playSound('ding');
              } else { // 'coins'
                  updatedStudent.currency = (updatedStudent.currency || 0) + amount;
                  playSound('coins');
              }
              return updatedStudent;
          }
          return student;
      });
      setStudents(newStudents);
      updateAndSaveClass(newStudents, xpCategories);
  };
  
  const addStudent = () => {
    if (!newStudentFirstName.trim()) return;
    const newStudent = { id: `student_${Date.now()}`, firstName: newStudentFirstName.trim(), lastName: newStudentLastName.trim(), totalPoints: 0, currency: 0, coinsSpent: 0, avatarLevel: 1, avatarBase: 'Wizard F', avatar: getAvatarImage('Wizard F', 1), ownedAvatars: ['Wizard F'], ownedPets: [], createdAt: new Date().toISOString() };
    const newStudents = [...students, newStudent];
    setStudents(newStudents);
    updateAndSaveClass(newStudents, xpCategories);
    setNewStudentFirstName(''); setNewStudentLastName(''); setShowAddStudentModal(false);
  };

  // Mark attendance handler
  const markAttendance = (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedAttendance = {
      ...attendanceData,
      [today]: {
        ...(attendanceData[today] || {}),
        [studentId]: status,
      },
    };
    setAttendanceData(updatedAttendance);
    // Save to Firebase
    saveClassData({ attendanceData: updatedAttendance });
    showToast('Attendance updated!', 'success');
  };

  // Award XP function for toolkit components (especially classroom jobs)
  const handleAwardXPFromToolkit = (studentId, amount, reason = '') => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const oldLevel = calculateAvatarLevel(student.totalPoints || 0);
    const newTotalPoints = (student.totalPoints || 0) + amount;
    const newLevel = calculateAvatarLevel(newTotalPoints);
    
    const updatedStudent = {
      ...student,
      totalPoints: newTotalPoints,
      lastUpdated: new Date().toISOString()
    };

    // Check for level up
    if (newLevel > oldLevel) {
      setLevelUpData({ student: updatedStudent, oldLevel, newLevel });
    }

    // Check for pet unlock
    if (shouldReceivePet(updatedStudent)) {
      const newPet = getRandomPet();
      updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
      setPetUnlockData({ student: updatedStudent, pet: newPet });
    }

    // Update students array
    const newStudents = students.map(s => s.id === studentId ? updatedStudent : s);
    setStudents(newStudents);
    updateAndSaveClass(newStudents, xpCategories);
    
    playSound('ding');
    showToast(`${student.firstName} earned ${amount} XP${reason ? ` for ${reason}` : ''}!`, 'success');
  };

  // RENDER LOGIC
  const renderTabContent = () => {
    // ADDED: Find the current class data to pass down
    const currentClass = userData.classes?.find(cls => cls.id === currentClassId);

    switch (activeTab) {
      case 'students':
        return <StudentsTab 
                  students={students} 
                  xpCategories={xpCategories}
                  onUpdateCategories={handleUpdateCategories} 
                  onBulkAward={handleBulkAward} 
                  onUpdateStudent={handleUpdateStudent} 
                  onReorderStudents={handleReorderStudents} 
                  onViewDetails={setSelectedStudent} 
                  onAddStudent={() => setShowAddStudentModal(true)}
                  getAvatarImage={getAvatarImage}
                  getPetImage={getPetImage}
                  calculateCoins={calculateCoins}
                  calculateAvatarLevel={calculateAvatarLevel}
                />;
      case 'shop':
        return <ShopTab
                  students={students}
                  onUpdateStudent={handleUpdateStudent}
                  SHOP_BASIC_AVATARS={SHOP_BASIC_AVATARS}
                  SHOP_PREMIUM_AVATARS={SHOP_PREMIUM_AVATARS}
                  SHOP_BASIC_PETS={SHOP_BASIC_PETS}
                  SHOP_PREMIUM_PETS={SHOP_PREMIUM_PETS}
                  showToast={showToast}
                  getAvatarImage={getAvatarImage}
                  getPetImage={getPetImage}
                  calculateCoins={calculateCoins}
                  calculateAvatarLevel={calculateAvatarLevel}
                />;
      case 'curriculum':
        return <CurriculumCornerTab 
                  students={students}
                  showToast={showToast}
                />;
      case 'toolkit':
        return <TeachersToolkitTab 
                  students={students}
                  user={user}
                  showToast={showToast}
                  userData={userData}
                  // REMOVED: saveGroupDataToFirebase and saveClassroomDataToFirebase to avoid confusion
                  currentClassId={currentClassId}
                  onAwardXP={handleAwardXPFromToolkit}
                  activeQuests={activeQuests}
                  attendanceData={attendanceData}
                  markAttendance={markAttendance}
                  completeQuest={() => showToast('Quest completed!', 'success')}
                  setShowQuestManagement={() => showToast('Quest management opened!', 'info')}
                  getAvatarImage={getAvatarImage}
                  calculateAvatarLevel={calculateAvatarLevel}
                  // CHANGED: Pass the dedicated save function and the correctly loaded data for the toolkit.
                  saveToolkitData={saveToolkitDataToFirebase}
                  loadedData={currentClass?.toolkitData || {}}
                />;
      default:
        return <div className="p-8 text-center text-gray-500">This tab is under construction.</div>;
    }
  };
  
  if (loading) { return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto"></div></div>; }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-lg border-b-4 border-blue-500">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Classroom Champions</h1>
                <button onClick={() => auth.signOut()} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Sign Out</button>
            </div>
        </div>
        <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto flex overflow-x-auto">
                {NAVIGATION_TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap transition-all duration-200 ${activeTab === tab.id ? 'text-blue-600 border-b-2 font-semibold border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
                        <span className="text-lg">{tab.icon}</span>
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>
        </div>
        <main className="max-w-screen-2xl mx-auto px-4 py-6">{renderTabContent()}</main>
        
        {showAddStudentModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"><div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl"><h2 className="text-2xl font-bold">Add New Champion</h2></div><div className="p-6 space-y-4"><input type="text" value={newStudentFirstName} onChange={(e) => setNewStudentFirstName(e.target.value)} placeholder="First Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/><input type="text" value={newStudentLastName} onChange={(e) => setNewStudentLastName(e.target.value)} placeholder="Last Name (Optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div><div className="flex space-x-3 p-6 pt-0"><button onClick={() => setShowAddStudentModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button onClick={addStudent} className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg">Add Champion</button></div></div></div>}
        {levelUpData && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6"><div className="text-6xl mb-2">🎉</div><h2 className="text-2xl font-bold">LEVEL UP!</h2><h3 className="text-xl font-bold text-gray-800 my-2">{levelUpData.student.firstName} reached Level {levelUpData.newLevel}!</h3><img src={getAvatarImage(levelUpData.student.avatarBase, levelUpData.newLevel)} alt="New Avatar" className="w-32 h-32 mx-auto rounded-full border-4 border-yellow-400"/><button onClick={() => setLevelUpData(null)} className="mt-4 w-full bg-yellow-500 text-white py-2 rounded">Awesome!</button></div></div>}
        {petUnlockData && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6"><div className="text-6xl mb-2">🐾</div><h2 className="text-2xl font-bold">PET UNLOCKED!</h2><h3 className="text-xl font-bold text-gray-800 my-2">{petUnlockData.student.firstName} found a companion!</h3><img src={getPetImage(petUnlockData.pet)} alt={petUnlockData.pet.name} className="w-24 h-24 mx-auto rounded-full border-4 border-purple-400"/><h4 className="text-lg font-semibold text-purple-600 mt-2">{petUnlockData.pet.name}</h4><button onClick={() => setPetUnlockData(null)} className="mt-4 w-full bg-purple-500 text-white py-2 rounded">Meet My Pet!</button></div></div>}
        {selectedStudent && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="p-6"><button onClick={() => setSelectedStudent(null)} className="float-right text-2xl font-bold">×</button><h2 className="text-2xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h2><p>Level {calculateAvatarLevel(selectedStudent.totalPoints || 0)} Champion</p><div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"><div><img src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints))} className="w-32 h-32 rounded-full border-4 border-blue-400" /></div><div className="space-y-4"><p><strong>XP:</strong> {selectedStudent.totalPoints || 0}</p><p><strong>Coins:</strong> {calculateCoins(selectedStudent)}</p>{selectedStudent.ownedPets?.[0] && (<div><p><strong>Companion:</strong> {selectedStudent.ownedPets[0].name}</p><img src={getPetImage(selectedStudent.ownedPets[0])} className="w-16 h-16 rounded-full border-2 border-purple-300"/></div>)}</div></div></div></div></div>}
    </div>
  );
};

export default ClassroomChampions;