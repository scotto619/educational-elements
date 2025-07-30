// components/tabs/StudentsTab.js
import React, { useState, useEffect } from 'react';

// ===============================================
// HELPER & UTILITY FUNCTIONS
// ===============================================

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
  const xpCoins = Math.floor((student?.totalPoints || 0) / 5);
  const bonusCoins = student?.currency || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

// Updated to better accommodate more students on one screen
const getGridClasses = (studentCount) => {
  if (studentCount <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
  if (studentCount <= 12) return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
  if (studentCount <= 18) return 'grid-cols-3 md:grid-cols-5 lg:grid-cols-9';
  if (studentCount <= 24) return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12';
  if (studentCount <= 32) return 'grid-cols-4 md:grid-cols-7 lg:grid-cols-12';
  return 'grid-cols-5 md:grid-cols-8 lg:grid-cols-12'; // For larger classes
};


const getPetImage = (petType, petName) => {
  const petImageMap = {
    'alchemist': '/Pets/Alchemist.png', 'barbarian': '/Pets/Barbarian.png',
    'bard': '/Pets/Bard.png', 'beastmaster': '/Pets/Beastmaster.png',
    'cleric': '/Pets/Cleric.png', 'crystal knight': '/Pets/Crystal Knight.png',
    'crystal sage': '/Pets/Crystal Sage.png', 'engineer': '/Pets/Engineer.png',
    'frost mage': '/Pets/Frost Mage.png', 'illusionist': '/Pets/Illusionist.png',
    'knight': '/Pets/Knight.png', 'lightning': '/Pets/Lightning.png',
    'monk': '/Pets/Monk.png', 'necromancer': '/Pets/Necromancer.png',
    'rogue': '/Pets/Rogue.png', 'stealth': '/Pets/Stealth.png',
    'time knight': '/Pets/Time Knight.png', 'warrior': '/Pets/Warrior.png',
    'wizard': '/Pets/Wizard.png', 'dragon': '/Pets/Lightning.png',
    'phoenix': '/Pets/Crystal Sage.png', 'unicorn': '/Pets/Time Knight.png',
    'wolf': '/Pets/Warrior.png', 'owl': '/Pets/Wizard.png',
    'cat': '/Pets/Rogue.png', 'tiger': '/Pets/Barbarian.png',
    'bear': '/Pets/Beastmaster.png', 'lion': '/Pets/Knight.png',
    'eagle': '/Pets/Stealth.png'
  };
  const key = (petType || petName || '').toLowerCase();
  return petImageMap[key] || '/Pets/Wizard.png';
};


// ===============================================
// NOTIFICATION COMPONENT
// ===============================================
const Notification = ({ message, type, icon }) => (
    <div className="fixed top-20 right-8 z-50 animate-fade-in-down">
        <div className={`flex items-center gap-4 rounded-xl shadow-2xl p-4 ${
            type === 'xp' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-green-400 to-teal-500'
        } text-white`}>
            <div className="text-4xl">{icon}</div>
            <div>
                <p className="font-bold text-lg">{message}</p>
            </div>
        </div>
    </div>
);


// ===============================================
// ENHANCED STUDENTS TAB COMPONENT
// ===============================================
const StudentsTab = ({ 
  students = [], 
  onAwardXP, 
  onViewDetails,
  onAddStudent,
  onUpdateStudent, // Critical prop for updating any student data
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showIndividualActionModal, setShowIndividualActionModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const [hoveredPet, setHoveredPet] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Action states
  const [actionAmount, setActionAmount] = useState(1);
  const [actionReason, setActionReason] = useState('Group Achievement');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState('xp'); // 'xp' or 'coins'
  
  // Default XP Categories (can be customized)
  const [xpCategories, setXpCategories] = useState([
    { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' },
    { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' },
    { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' },
    { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' },
    { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' },
    { id: 6, label: 'Teamwork', amount: 2, color: 'bg-pink-500', icon: '👥' }
  ]);

  // Inventory and management states
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryStudent, setInventoryStudent] = useState(null);
  const [showPetResetModal, setShowPetResetModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarStudent, setAvatarStudent] = useState(null);
  
  const AVAILABLE_AVATARS = [
    'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M', 'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M', 'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M', 'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M', 'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M', 'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M', 'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M'
  ];

  const AVAILABLE_PETS = [
    { name: 'Alchemist', type: 'alchemist', rarity: 'common' }, { name: 'Barbarian', type: 'barbarian', rarity: 'common' }, { name: 'Bard', type: 'bard', rarity: 'common' }, { name: 'Beastmaster', type: 'beastmaster', rarity: 'rare' }, { name: 'Cleric', type: 'cleric', rarity: 'common' }, { name: 'Crystal Knight', type: 'crystal knight', rarity: 'epic' }, { name: 'Crystal Sage', type: 'crystal sage', rarity: 'epic' }, { name: 'Engineer', type: 'engineer', rarity: 'rare' }, { name: 'Frost Mage', type: 'frost mage', rarity: 'rare' }, { name: 'Illusionist', type: 'illusionist', rarity: 'epic' }, { name: 'Knight', type: 'knight', rarity: 'common' }, { name: 'Lightning', type: 'lightning', rarity: 'legendary' }, { name: 'Monk', type: 'monk', rarity: 'common' }, { name: 'Necromancer', type: 'necromancer', rarity: 'epic' }, { name: 'Rogue', type: 'rogue', rarity: 'common' }, { name: 'Stealth', type: 'stealth', rarity: 'rare' }, { name: 'Time Knight', type: 'time knight', rarity: 'legendary' }, { name: 'Warrior', type: 'warrior', rarity: 'common' }, { name: 'Wizard', type: 'wizard', rarity: 'common' }
  ];

  // Category editing state
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ label: '', amount: 1, color: 'bg-blue-500', icon: '🌟' });

  // ===============================================
  // CORE LOGIC (XP, COINS, NOTIFICATIONS)
  // ===============================================

  const playSound = (sound = 'ding') => {
    try {
      const audio = new Audio(`/sounds/${sound}.mp3`);
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio not available');
    }
  };
  
  const showNotificationPopup = (message, type, icon) => {
      setNotification({ message, type, icon, id: Date.now() });
      setTimeout(() => setNotification(null), 3000);
  };
  
  const handleAwardXP = (student, amount, reason) => {
      onAwardXP(student, amount, reason); // This will trigger the parent's logic, including level-up checks
      playSound('ding');
      showNotificationPopup(`${student.firstName} earned ${amount} XP!`, 'xp', '⭐');
  };

  const awardCoins = (studentToUpdate, amount) => {
    const updatedStudent = {
      ...studentToUpdate,
      currency: (studentToUpdate.currency || 0) + amount,
    };
    onUpdateStudent(updatedStudent); // Save to Firebase
    playSound('coins'); // Use a different sound for coins
    showNotificationPopup(`${studentToUpdate.firstName} received ${amount} coins!`, 'coins', '🪙');
  };

  // ===============================================
  // HANDLERS FOR ACTIONS & MODALS
  // ===============================================

  const handleIndividualAction = () => {
    if (!selectedStudent || actionAmount < 1) return;
    
    if (actionType === 'xp') {
      handleAwardXP(selectedStudent, actionAmount, actionReason);
    } else {
      awardCoins(selectedStudent, actionAmount);
    }
    
    setShowIndividualActionModal(false);
    setSelectedStudent(null);
    setActionAmount(1);
  };

  const handleBulkAction = () => {
    if (selectedStudents.length === 0 || actionAmount < 1) return;

    selectedStudents.forEach((studentId, index) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setTimeout(() => {
          if (actionType === 'xp') {
            handleAwardXP(student, actionAmount, actionReason);
          } else {
            awardCoins(student, actionAmount);
          }
        }, index * 150); // Stagger the notifications
      }
    });

    setShowBulkActionModal(false);
    clearSelection();
    setActionAmount(1);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || 
      calculateAvatarLevel(student.totalPoints || 0) === parseInt(filterLevel);
    return matchesSearch && matchesLevel;
  });

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => setSelectedStudents(filteredStudents.map(s => s.id));
  const clearSelection = () => setSelectedStudents([]);

  // ===============================================
  // INVENTORY AND MANAGEMENT FUNCTIONS
  // ===============================================

  const resetAllStudentPets = () => {
    if (!window.confirm('This will remove ALL pets from ALL students. This cannot be undone. Are you sure?')) return;
    students.forEach(student => {
        onUpdateStudent({ ...student, ownedPets: [] });
    });
    showNotificationPopup('All student pets have been reset.', 'info', '🗑️');
    setShowPetResetModal(false);
  };

  const updateStudentAvatar = (student, newAvatarBase) => {
    const newLevel = calculateAvatarLevel(student.totalPoints || 0);
    const updatedStudent = {
      ...student,
      avatarBase: newAvatarBase,
      avatar: getAvatarImage(newAvatarBase, newLevel),
      ownedAvatars: [...new Set([...(student.ownedAvatars || []), newAvatarBase])]
    };
    onUpdateStudent(updatedStudent);
    if(inventoryStudent) setInventoryStudent(updatedStudent);
    if(avatarStudent) setAvatarStudent(updatedStudent);
    showNotificationPopup(`${student.firstName}'s avatar changed!`, 'info', '🎭');
  };
  
  const changeStudentAvatar = (student, newAvatarBase) => {
      updateStudentAvatar(student, newAvatarBase);
      setShowAvatarModal(false);
  };

  const addPetToStudent = (student, petData) => {
    const newPet = {
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: petData.name, type: petData.type, rarity: petData.rarity,
      displayName: petData.name, imageType: petData.type
    };
    const updatedStudent = { ...student, ownedPets: [...(student.ownedPets || []), newPet] };
    onUpdateStudent(updatedStudent);
    setInventoryStudent(updatedStudent);
    showNotificationPopup(`${petData.name} was added to ${student.firstName}!`, 'info', '🐾');
  };

  const removePetFromStudent = (student, petId) => {
    if (!window.confirm('Remove this pet from the student?')) return;
    const updatedStudent = { ...student, ownedPets: (student.ownedPets || []).filter(pet => pet.id !== petId) };
    onUpdateStudent(updatedStudent);
    setInventoryStudent(updatedStudent);
    showNotificationPopup('Pet removed.', 'info', '🐾');
  };

  const openInventoryModal = (student) => { setInventoryStudent(student); setShowInventoryModal(true); };
  const openAvatarModal = (student) => { setAvatarStudent(student); setShowAvatarModal(true); };

  // ===============================================
  // MOUSE HOVER AND POSITIONING
  // ===============================================

  const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
  const handleAvatarHover = (student, isHovering) => setHoveredAvatar(isHovering ? {
      image: getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints)),
      name: `${student.firstName}'s Avatar`,
      level: calculateAvatarLevel(student.totalPoints)
  } : null);
  const handlePetHover = (pet, isHovering) => setHoveredPet(isHovering && pet ? {
      image: getPetImage(pet.type, pet.name), name: pet.name, rarity: pet.rarity
  } : null);
  
  // ===============================================
  // RENDER FUNCTION
  // ===============================================
  return (
    <div className="space-y-6" onMouseMove={handleMouseMove}>
      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            <div className="flex gap-4 items-center flex-wrap">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-auto pl-10 pr-4 py-2 border rounded-lg" />
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="w-full md:w-auto px-4 py-2 border rounded-lg">
                    <option value="all">All Levels</option> {[1, 2, 3, 4].map(l => <option key={l} value={l}>Level {l}</option>)}
                </select>
            </div>

            <div className="flex gap-2 items-center justify-center flex-wrap">
                {selectedStudents.length > 0 ? (
                    <>
                        <span className="text-purple-600 font-semibold">{selectedStudents.length} selected</span>
                        <button onClick={() => { setActionType('xp'); setShowBulkActionModal(true); }} className="bg-purple-500 text-white px-3 py-2 rounded-lg">Award Bulk</button>
                        <button onClick={clearSelection} className="bg-gray-500 text-white px-3 py-2 rounded-lg">Clear</button>
                    </>
                ) : (
                    <button onClick={selectAllStudents} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Select All</button>
                )}
            </div>

            <div className="flex gap-2 items-center justify-end flex-wrap">
                <button onClick={onAddStudent} className="bg-green-500 text-white px-4 py-2 rounded-lg">+ Add Champion</button>
                <button onClick={() => setShowCategoriesModal(true)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg">⚙️ Categories</button>
            </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className={`grid ${getGridClasses(filteredStudents.length)} gap-3`}>
        {filteredStudents.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            onAwardXP={handleAwardXP}
            onAwardCoins={awardCoins}
            onViewDetails={onViewDetails}
            onShowIndividualAction={(student, type) => {
              setSelectedStudent(student);
              setActionType(type);
              setShowIndividualActionModal(true);
            }}
            openInventoryModal={openInventoryModal}
            openAvatarModal={openAvatarModal}
            isSelected={selectedStudents.includes(student.id)}
            onToggleSelection={() => toggleStudentSelection(student.id)}
            xpCategories={xpCategories}
            onAvatarHover={handleAvatarHover}
            onPetHover={handlePetHover}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
          <div className="text-center py-20 col-span-full">
              <div className="text-6xl mb-4">{students.length > 0 ? '🔍' : '🌟'}</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-2">{students.length > 0 ? 'No Champions Found' : 'Welcome to Your Classroom!'}</h2>
              <p className="text-gray-500 mb-6">{students.length > 0 ? 'Try adjusting your search or filter criteria.' : 'Start by adding your first champion.'}</p>
              <button onClick={students.length > 0 ? () => { setSearchTerm(''); setFilterLevel('all'); } : onAddStudent}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-semibold">
                  {students.length > 0 ? 'Clear Filters' : '➕ Add Your First Champion'}
              </button>
          </div>
      )}

      {/* Hover Image Preview */}
      {(hoveredAvatar || hoveredPet) && (
        <div className="fixed pointer-events-none z-[100] bg-white rounded-lg shadow-2xl p-3 border-2 border-blue-300"
          style={{ left: mousePosition.x + 20, top: mousePosition.y - 100, transition: 'transform 0.2s ease-out', transform: 'scale(1)' }}>
            {hoveredAvatar && (<>
                <img src={hoveredAvatar.image} alt={hoveredAvatar.name} className="w-48 h-48 rounded-lg mb-2 border-2 border-blue-400" />
                <p className="text-lg font-semibold text-gray-800 text-center">{hoveredAvatar.name}</p>
            </>)}
            {hoveredPet && (<>
                <img src={hoveredPet.image} alt={hoveredPet.name} className="w-40 h-40 rounded-lg mb-2 border-2 border-purple-400" />
                <p className="text-lg font-semibold text-gray-800 text-center">{hoveredPet.name}</p>
            </>)}
        </div>
      )}

      {/* Notification Popup */}
      {notification && <Notification message={notification.message} type={notification.type} icon={notification.icon} />}

      {/* Individual Action Modal */}
      {showIndividualActionModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                  <div className={`bg-gradient-to-r ${actionType === 'xp' ? 'from-green-500 to-green-600' : 'from-yellow-500 to-yellow-600'} text-white p-6 rounded-t-2xl`}>
                      <h2 className="text-2xl font-bold">Award {actionType === 'xp' ? 'XP' : 'Coins'} to {selectedStudent.firstName}</h2>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{actionType === 'xp' ? 'XP' : 'Coin'} Amount</label>
                          <input type="number" min="1" value={actionAmount} onChange={(e) => setActionAmount(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border rounded-lg"/>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                          <input type="text" value={actionReason} onChange={(e) => setActionReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg"/>
                      </div>
                  </div>
                  <div className="flex space-x-3 p-6 pt-0">
                      <button onClick={() => setShowIndividualActionModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                      <button onClick={handleIndividualAction} className={`flex-1 text-white px-4 py-2 rounded-lg ${actionType === 'xp' ? 'bg-green-500' : 'bg-yellow-500'}`}>Award</button>
                  </div>
              </div>
          </div>
      )}

      {/* Bulk Action Modal */}
      {showBulkActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`bg-gradient-to-r ${actionType === 'xp' ? 'from-purple-500 to-purple-600' : 'from-blue-500 to-blue-600'} text-white p-6 rounded-t-2xl`}>
                <h2 className="text-2xl font-bold">Award Bulk {actionType === 'xp' ? 'XP' : 'Coins'}</h2>
                <p>To {selectedStudents.length} selected champions</p>
            </div>
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount for Each Student</label>
                    <input type="number" min="1" value={actionAmount} onChange={(e) => setActionAmount(parseInt(e.target.value) || 1)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                    <input type="text" value={actionReason} onChange={(e) => setActionReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
            </div>
            <div className="flex space-x-3 p-6 pt-0">
                <button onClick={() => setShowBulkActionModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
                <button onClick={handleBulkAction} className={`flex-1 text-white px-4 py-2 rounded-lg ${actionType === 'xp' ? 'bg-purple-500' : 'bg-blue-500'}`}>Award to All</button>
            </div>
          </div>
        </div>
      )}

      {/* All other modals (Categories, Pet Reset, Inventory, Avatar) remain the same as your provided code... */}
      {/* For brevity, I am omitting the large modal definitions you already have, as they don't need changes for this update. */}
      {/* You should keep your existing modal code for Categories, Pet Reset, Inventory, and Avatar selection. */}
    </div>
  );
};

// ===============================================
// STUDENT CARD COMPONENT
// ===============================================
const StudentCard = ({ 
  student, onAwardXP, onAwardCoins, onViewDetails, onShowIndividualAction,
  openInventoryModal, openAvatarModal, isSelected, onToggleSelection,
  xpCategories, onAvatarHover, onPetHover
}) => {
  const currentLevel = calculateAvatarLevel(student.totalPoints || 0);
  const coins = calculateCoins(student);
  const progressToNext = (student.totalPoints || 0) % 100;
  const [showActions, setShowActions] = useState(false);

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-blue-400'
    } relative group p-3 flex flex-col justify-between`}
    onClick={onToggleSelection}>
        
        {isSelected && <div className="absolute top-1 right-1 bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold z-10">✓</div>}
        
        {/* Top Section: Avatar and Name */}
        <div className="flex flex-col items-center text-center">
            <div className="relative cursor-pointer" onMouseEnter={() => onAvatarHover(student, true)} onMouseLeave={() => onAvatarHover(student, false)} onDoubleClick={(e) => { e.stopPropagation(); openAvatarModal(student); }}>
                <img src={getAvatarImage(student.avatarBase, currentLevel)} alt={`${student.firstName}'s Avatar`} className="w-16 h-16 rounded-full border-4 border-blue-400 shadow-md"/>
                <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">L{currentLevel}</div>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mt-2 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); onViewDetails(student); }}>{student.firstName}</h3>
        </div>

        {/* Middle Section: Stats */}
        <div className="my-2">
            <div className="flex items-center justify-around text-xs">
                <span className="text-blue-600 font-semibold">⭐ {student.totalPoints || 0}</span>
                <span className="text-yellow-600 font-semibold">🪙 {coins}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${progressToNext}%` }}></div>
            </div>
        </div>

        {/* Bottom Section: Actions */}
        <div className="relative">
            <div className="grid grid-cols-3 gap-1">
                {xpCategories.slice(0, 3).map(cat => (
                    <button key={cat.id} onClick={(e) => { e.stopPropagation(); onAwardXP(student, cat.amount, cat.label); }}
                        className={`${cat.color} text-white text-xs py-1.5 rounded-md hover:opacity-80`} title={`${cat.label} (+${cat.amount} XP)`}>
                        {cat.icon}
                    </button>
                ))}
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }} className="w-full mt-1 bg-gray-600 text-white text-xs py-1 rounded-md hover:bg-gray-700">More Actions ▾</button>

            {/* Actions Dropdown */}
            {showActions && (
                <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-300 rounded-lg shadow-xl z-20" onMouseLeave={() => setShowActions(false)}>
                    <button onClick={(e) => { e.stopPropagation(); onShowIndividualAction(student, 'xp'); setShowActions(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100">Award Custom XP ⭐</button>
                    <button onClick={(e) => { e.stopPropagation(); onShowIndividualAction(student, 'coins'); setShowActions(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100">Award Coins 🪙</button>
                    <button onClick={(e) => { e.stopPropagation(); openAvatarModal(student); setShowActions(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100">Change Avatar 🎭</button>
                    <button onClick={(e) => { e.stopPropagation(); openInventoryModal(student); setShowActions(false); }} className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100">Full Inventory 👜</button>
                </div>
            )}
        </div>

        {/* Pet Display */}
        {student.ownedPets && student.ownedPets.length > 0 && (
            <div className="absolute top-1 left-1 cursor-pointer hover:scale-110 transition-transform" onMouseEnter={() => onPetHover(student.ownedPets[0], true)} onMouseLeave={() => onPetHover(student.ownedPets[0], false)}>
                <img src={getPetImage(student.ownedPets[0].type, student.ownedPets[0].name)} alt={student.ownedPets[0].name} className="w-7 h-7 rounded-full border-2 border-purple-300"/>
            </div>
        )}
    </div>
  );
};

export default StudentsTab;