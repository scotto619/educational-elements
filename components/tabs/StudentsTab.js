// components/tabs/StudentsTab.js - FIXED PET IMAGES AND LEVEL DISPLAY
import React, { useState, useEffect } from 'react';

// ===============================================
// ENHANCED STUDENTS TAB COMPONENT
// ===============================================

const StudentsTab = ({ 
  students = [], 
  onAwardXP, 
  onViewDetails,
  onAddStudent,
  onUpdateStudent, // New prop for updating student data
  userSettings = {} // For storing user's custom XP categories
}) => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkXPModal, setShowBulkXPModal] = useState(false);
  const [showIndividualXPModal, setShowIndividualXPModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(null);
  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const [hoveredPet, setHoveredPet] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // XP Award states
  const [bulkXPAmount, setBulkXPAmount] = useState(1);
  const [bulkXPReason, setBulkXPReason] = useState('Group Achievement');
  const [individualXPAmount, setIndividualXPAmount] = useState(1);
  const [individualXPReason, setIndividualXPReason] = useState('Excellence');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Default XP Categories (editable)
  const [xpCategories, setXpCategories] = useState([
    { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' },
    { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' },
    { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' },
    { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' },
    { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' },
    { id: 6, label: 'Teamwork', amount: 2, color: 'bg-pink-500', icon: '🤝' }
  ]);

  // State for inventory management
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryStudent, setInventoryStudent] = useState(null);
  const [showPetResetModal, setShowPetResetModal] = useState(false);
  
  // Available avatars for selection
  const AVAILABLE_AVATARS = [
    'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M',
    'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M',
    'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M',
    'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M',
    'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M',
    'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M',
    'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M'
  ];

  // Available pets for selection
  const AVAILABLE_PETS = [
    { name: 'Alchemist', type: 'alchemist', rarity: 'common' },
    { name: 'Barbarian', type: 'barbarian', rarity: 'common' },
    { name: 'Bard', type: 'bard', rarity: 'common' },
    { name: 'Beastmaster', type: 'beastmaster', rarity: 'rare' },
    { name: 'Cleric', type: 'cleric', rarity: 'common' },
    { name: 'Crystal Knight', type: 'crystal knight', rarity: 'epic' },
    { name: 'Crystal Sage', type: 'crystal sage', rarity: 'epic' },
    { name: 'Engineer', type: 'engineer', rarity: 'rare' },
    { name: 'Frost Mage', type: 'frost mage', rarity: 'rare' },
    { name: 'Illusionist', type: 'illusionist', rarity: 'epic' },
    { name: 'Knight', type: 'knight', rarity: 'common' },
    { name: 'Lightning', type: 'lightning', rarity: 'legendary' },
    { name: 'Monk', type: 'monk', rarity: 'common' },
    { name: 'Necromancer', type: 'necromancer', rarity: 'epic' },
    { name: 'Rogue', type: 'rogue', rarity: 'common' },
    { name: 'Stealth', type: 'stealth', rarity: 'rare' },
    { name: 'Time Knight', type: 'time knight', rarity: 'legendary' },
    { name: 'Warrior', type: 'warrior', rarity: 'common' },
    { name: 'Wizard', type: 'wizard', rarity: 'common' }
  ];

  // Category editing state
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ label: '', amount: 1, color: 'bg-blue-500', icon: '🌟' });

  // ===============================================
  // UTILITY FUNCTIONS - FIXED
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

  const getGridClasses = (studentCount) => {
    if (studentCount <= 4) return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
    if (studentCount <= 8) return 'grid grid-cols-2 lg:grid-cols-4 gap-3';
    if (studentCount <= 12) return 'grid grid-cols-3 lg:grid-cols-6 gap-3';
    if (studentCount <= 20) return 'grid grid-cols-4 lg:grid-cols-8 gap-2';
    if (studentCount <= 30) return 'grid grid-cols-5 lg:grid-cols-10 gap-1';
    return 'grid grid-cols-6 lg:grid-cols-12 gap-1';
  };

  // FIXED: Complete pet image mapping function
  const getPetImage = (petType, petName) => {
    // Handle both old and new pet naming systems
    const petImageMap = {
      // New class-based system
      'alchemist': '/Pets/Alchemist.png',
      'barbarian': '/Pets/Barbarian.png',
      'bard': '/Pets/Bard.png',
      'beastmaster': '/Pets/Beastmaster.png',
      'cleric': '/Pets/Cleric.png',
      'crystal knight': '/Pets/Crystal Knight.png',
      'crystal sage': '/Pets/Crystal Sage.png',
      'engineer': '/Pets/Engineer.png',
      'frost mage': '/Pets/Frost Mage.png',
      'illusionist': '/Pets/Illusionist.png',
      'knight': '/Pets/Knight.png',
      'lightning': '/Pets/Lightning.png',
      'monk': '/Pets/Monk.png',
      'necromancer': '/Pets/Necromancer.png',
      'rogue': '/Pets/Rogue.png',
      'stealth': '/Pets/Stealth.png',
      'time knight': '/Pets/Time Knight.png',
      'warrior': '/Pets/Warrior.png',
      'wizard': '/Pets/Wizard.png',
      
      // Legacy fantasy system mapping to new files
      'dragon': '/Pets/Lightning.png',      // Map dragon to Lightning (legendary)
      'phoenix': '/Pets/Crystal Sage.png',  // Map phoenix to Crystal Sage (epic)
      'unicorn': '/Pets/Time Knight.png',   // Map unicorn to Time Knight (legendary)
      'wolf': '/Pets/Warrior.png',          // Map wolf to Warrior
      'owl': '/Pets/Wizard.png',            // Map owl to Wizard
      'cat': '/Pets/Rogue.png',             // Map cat to Rogue
      'tiger': '/Pets/Barbarian.png',       // Map tiger to Barbarian
      'bear': '/Pets/Beastmaster.png',      // Map bear to Beastmaster
      'lion': '/Pets/Knight.png',           // Map lion to Knight
      'eagle': '/Pets/Stealth.png'          // Map eagle to Stealth
    };
    
    // Try petType first, then petName, then default
    const key = (petType || petName || '').toLowerCase();
    return petImageMap[key] || '/Pets/Wizard.png';
  };

  // ===============================================
  // INVENTORY MANAGEMENT FUNCTIONS
  // ===============================================

  const refreshAllStudentPets = () => {
    const updatedStudents = students.map(student => {
      if (student.ownedPets && student.ownedPets.length > 0) {
        const updatedPets = student.ownedPets.map(pet => ({
          ...pet,
          // Ensure we have the right properties for display
          displayName: pet.name || pet.displayName,
          imageType: pet.type || pet.name?.toLowerCase() || 'wizard'
        }));
        return { ...student, ownedPets: updatedPets };
      }
      return student;
    });
    
    // Update students through the parent component's handler
    updatedStudents.forEach(student => {
      if (onViewDetails) {
        // This will trigger the update in the parent component
        onUpdateStudent && onUpdateStudent(student);
      }
    });
    
    alert('Pet images refreshed! If pets still don\'t appear, they may need to be reset.');
  };

  const resetAllStudentPets = () => {
    if (!window.confirm('This will remove ALL pets from ALL students. This cannot be undone. Are you sure?')) {
      return;
    }
    
    const updatedStudents = students.map(student => ({
      ...student,
      ownedPets: []
    }));
    
    updatedStudents.forEach(student => {
      onUpdateStudent && onUpdateStudent(student);
    });
    
    alert('All student pets have been reset!');
    setShowPetResetModal(false);
  };

  const updateStudentAvatar = (student, newAvatarBase) => {
    const newLevel = calculateAvatarLevel(student.totalPoints || 0);
    const updatedStudent = {
      ...student,
      avatarBase: newAvatarBase,
      avatar: getAvatarImage(newAvatarBase, newLevel),
      avatarLevel: newLevel,
      ownedAvatars: [...(student.ownedAvatars || []), newAvatarBase].filter((v, i, a) => a.indexOf(v) === i)
    };
    
    onUpdateStudent && onUpdateStudent(updatedStudent);
    setInventoryStudent(updatedStudent);
    alert(`Avatar updated to ${newAvatarBase}!`);
  };

  const addPetToStudent = (student, petData) => {
    const newPet = {
      id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: petData.name,
      type: petData.type,
      rarity: petData.rarity,
      displayName: petData.name,
      imageType: petData.type
    };

    const updatedStudent = {
      ...student,
      ownedPets: [...(student.ownedPets || []), newPet]
    };
    
    onUpdateStudent && onUpdateStudent(updatedStudent);
    setInventoryStudent(updatedStudent);
    alert(`${petData.name} pet added!`);
  };

  const removePetFromStudent = (student, petId) => {
    if (!window.confirm('Remove this pet from the student?')) return;
    
    const updatedStudent = {
      ...student,
      ownedPets: (student.ownedPets || []).filter(pet => pet.id !== petId)
    };
    
    onUpdateStudent && onUpdateStudent(updatedStudent);
    setInventoryStudent(updatedStudent);
    alert('Pet removed!');
  };

  const openInventoryModal = (student) => {
    setInventoryStudent(student);
    setShowInventoryModal(true);
  };

  // ===============================================
  // SOUND AND ANIMATION FUNCTIONS
  // ===============================================

  const playXPSound = () => {
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.volume = 0.4;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
      console.log('Audio not available');
    }
  };

  const showXPAwardAnimation = (student, amount, reason) => {
    setShowXPAnimation({
      student,
      amount,
      reason,
      id: `${student.id}-${Date.now()}`
    });

    // Play sound
    playXPSound();

    // Hide animation after 3 seconds
    setTimeout(() => {
      setShowXPAnimation(null);
    }, 3000);
  };

  // ===============================================
  // STUDENT SELECTION FUNCTIONS
  // ===============================================

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

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // ===============================================
  // XP AWARD FUNCTIONS
  // ===============================================

  const handleQuickXP = (student, amount, category) => {
    onAwardXP(student, amount, category);
    showXPAwardAnimation(student, amount, category);
  };

  const handleIndividualXP = () => {
    if (!selectedStudent || individualXPAmount < 1) return;
    
    onAwardXP(selectedStudent, individualXPAmount, individualXPReason);
    showXPAwardAnimation(selectedStudent, individualXPAmount, individualXPReason);
    
    setShowIndividualXPModal(false);
    setSelectedStudent(null);
    setIndividualXPAmount(1);
    setIndividualXPReason('Excellence');
  };

  const handleBulkXP = () => {
    if (selectedStudents.length === 0 || bulkXPAmount < 1) return;

    selectedStudents.forEach((studentId, index) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        // Stagger the animations slightly for visual effect
        setTimeout(() => {
          onAwardXP(student, bulkXPAmount, bulkXPReason);
          showXPAwardAnimation(student, bulkXPAmount, bulkXPReason);
        }, index * 200);
      }
    });

    setShowBulkXPModal(false);
    clearSelection();
    setBulkXPAmount(1);
    setBulkXPReason('Group Achievement');
  };

  // ===============================================
  // CATEGORY MANAGEMENT FUNCTIONS
  // ===============================================

  const addCategory = () => {
    if (!newCategory.label.trim()) return;
    
    const category = {
      ...newCategory,
      id: Date.now(),
      label: newCategory.label.trim()
    };
    
    setXpCategories([...xpCategories, category]);
    setNewCategory({ label: '', amount: 1, color: 'bg-blue-500', icon: '🌟' });
  };

  const updateCategory = (id, updates) => {
    setXpCategories(xpCategories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id) => {
    setXpCategories(xpCategories.filter(cat => cat.id !== id));
  };

  // ===============================================
  // HOVER FUNCTIONS FOR IMAGES
  // ===============================================

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleAvatarHover = (student, isHovering) => {
    if (isHovering) {
      setHoveredAvatar({
        image: getAvatarImage(student.avatarBase || 'Wizard F', calculateAvatarLevel(student.totalPoints || 0)),
        name: `${student.firstName}'s Avatar`,
        level: calculateAvatarLevel(student.totalPoints || 0)
      });
    } else {
      setHoveredAvatar(null);
    }
  };

  const handlePetHover = (pet, isHovering) => {
    if (isHovering && pet) {
      setHoveredPet({
        image: getPetImage(pet.type, pet.name),
        name: pet.name,
        rarity: pet.rarity
      });
    } else {
      setHoveredPet(null);
    }
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  return (
    <div className="space-y-6" onMouseMove={handleMouseMove}>
      {/* Enhanced Controls Bar */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg border border-blue-200">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative">
              <input
                type="text"
                placeholder="Search champions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>

            <button
              onClick={() => setShowCategoriesModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              ⚙️ Edit Categories
            </button>

            <button
              onClick={refreshAllStudentPets}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              🔄 Refresh Pets
            </button>

            <button
              onClick={() => setShowPetResetModal(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              🗑️ Reset All Pets
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-center flex-wrap">
            {selectedStudents.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-purple-200">
                <span className="text-sm text-purple-600 font-semibold">
                  {selectedStudents.length} selected
                </span>
                <button
                  onClick={() => setShowBulkXPModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                >
                  🎯 Award Bulk XP
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-all text-sm"
                >
                  Clear
                </button>
              </div>
            )}

            {filteredStudents.length > 1 && selectedStudents.length === 0 && (
              <button
                onClick={selectAllStudents}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all font-semibold"
              >
                📋 Select All
              </button>
            )}

            <button
              onClick={onAddStudent}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              ➕ Add Champion
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 flex gap-4 items-center text-sm">
          <div className="bg-white px-3 py-1 rounded-lg border border-blue-200">
            <span className="text-blue-600 font-semibold">Total Champions: {filteredStudents.length}</span>
          </div>
          <div className="bg-white px-3 py-1 rounded-lg border border-green-200">
            <span className="text-green-600 font-semibold">
              Total XP: {filteredStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
            </span>
          </div>
          <div className="bg-white px-3 py-1 rounded-lg border border-yellow-200">
            <span className="text-yellow-600 font-semibold">
              Avg Level: {filteredStudents.length > 0 ? 
                (filteredStudents.reduce((sum, s) => sum + calculateAvatarLevel(s.totalPoints || 0), 0) / filteredStudents.length).toFixed(1) : 
                '0'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className={getGridClasses(filteredStudents.length)}>
        {filteredStudents.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            onQuickXP={handleQuickXP}
            onViewDetails={onViewDetails}
            onShowIndividualXP={(student) => {
              setSelectedStudent(student);
              setShowIndividualXPModal(true);
            }}
            openInventoryModal={openInventoryModal}
            isSelected={selectedStudents.includes(student.id)}
            onToggleSelection={() => toggleStudentSelection(student.id)}
            xpCategories={xpCategories}
            onAvatarHover={handleAvatarHover}
            onPetHover={handlePetHover}
            getAvatarImage={getAvatarImage}
            calculateAvatarLevel={calculateAvatarLevel}
            calculateCoins={calculateCoins}
            getPetImage={getPetImage}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && students.length > 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Champions Found</h2>
          <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterLevel('all');
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {filteredStudents.length === 0 && students.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Welcome to Your Classroom!</h2>
          <p className="text-gray-500 mb-6">Start by adding your first champion to begin the adventure.</p>
          <button
            onClick={onAddStudent}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            ➕ Add Your First Champion
          </button>
        </div>
      )}

      {/* Hover Image Preview */}
      {(hoveredAvatar || hoveredPet) && (
        <div 
          className="fixed pointer-events-none z-50 bg-white rounded-lg shadow-2xl p-3 border-2 border-blue-300"
          style={{ 
            left: mousePosition.x + 20, 
            top: mousePosition.y - 100,
            transform: hoveredAvatar || hoveredPet ? 'scale(1)' : 'scale(0)',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {hoveredAvatar && (
            <div className="text-center">
              <img 
                src={hoveredAvatar.image}
                alt={hoveredAvatar.name}
                className="w-56 h-56 rounded-lg mb-2 border-2 border-blue-400"
              />
              <p className="text-lg font-semibold text-gray-800">{hoveredAvatar.name}</p>
              <p className="text-sm text-blue-600">Level {hoveredAvatar.level}</p>
            </div>
          )}
          {hoveredPet && (
            <div className="text-center">
              <img 
                src={hoveredPet.image}
                alt={hoveredPet.name}
                className="w-48 h-48 rounded-lg mb-2 border-2 border-purple-400"
              />
              <p className="text-lg font-semibold text-gray-800">{hoveredPet.name}</p>
              <p className="text-sm text-purple-600 capitalize">{hoveredPet.rarity} Pet</p>
            </div>
          )}
        </div>
      )}

      {/* XP Award Animation */}
      {showXPAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-xl font-bold">{showXPAnimation.student.firstName} earned {showXPAnimation.amount} XP!</div>
              <div className="text-sm opacity-90">{showXPAnimation.reason}</div>
            </div>
          </div>
        </div>
      )}

      {/* Individual XP Modal */}
      {showIndividualXPModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Award XP to {selectedStudent.firstName}</h2>
              <p className="text-green-100">Individual achievement recognition</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">XP Amount</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={individualXPAmount}
                  onChange={(e) => setIndividualXPAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category/Reason</label>
                <select
                  value={individualXPReason}
                  onChange={(e) => setIndividualXPReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {xpCategories.map(category => (
                    <option key={category.id} value={category.label}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                  <option value="Custom Achievement">🌟 Custom Achievement</option>
                </select>
              </div>
              
              {individualXPReason === 'Custom Achievement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Reason</label>
                  <input
                    type="text"
                    value={individualXPReason}
                    onChange={(e) => setIndividualXPReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter custom reason..."
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowIndividualXPModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleIndividualXP}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Award XP 🎯
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk XP Modal */}
      {showBulkXPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Award Bulk XP</h2>
              <p className="text-purple-100">To {selectedStudents.length} selected champions</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">XP Amount</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkXPAmount}
                  onChange={(e) => setBulkXPAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category/Reason</label>
                <select
                  value={bulkXPReason}
                  onChange={(e) => setBulkXPReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {xpCategories.map(category => (
                    <option key={category.id} value={category.label}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                  <option value="Group Achievement">🎯 Group Achievement</option>
                  <option value="Class Participation">👥 Class Participation</option>
                  <option value="Project Completion">📋 Project Completion</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowBulkXPModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkXP}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Award XP 🎯
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Management Modal */}
      {showCategoriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Manage XP Categories</h2>
              <p className="text-indigo-100">Customize your classroom's reward system</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Existing Categories */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Categories</h3>
                <div className="space-y-3">
                  {xpCategories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <div className="font-semibold">{category.label}</div>
                          <div className="text-sm text-gray-500">{category.amount} XP</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Category</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                    <input
                      type="text"
                      value={newCategory.label}
                      onChange={(e) => setNewCategory({...newCategory, label: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., Creative Thinking"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">XP Amount</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newCategory.amount}
                      onChange={(e) => setNewCategory({...newCategory, amount: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <select
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="🌟">🌟 Star</option>
                      <option value="💡">💡 Lightbulb</option>
                      <option value="🎨">🎨 Art</option>
                      <option value="🏆">🏆 Trophy</option>
                      <option value="🎯">🎯 Target</option>
                      <option value="💪">💪 Strength</option>
                      <option value="🧠">🧠 Brain</option>
                      <option value="❤️">❤️ Heart</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <select
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="bg-blue-500">Blue</option>
                      <option value="bg-green-500">Green</option>
                      <option value="bg-yellow-500">Yellow</option>
                      <option value="bg-purple-500">Purple</option>
                      <option value="bg-pink-500">Pink</option>
                      <option value="bg-red-500">Red</option>
                      <option value="bg-indigo-500">Indigo</option>
                      <option value="bg-orange-500">Orange</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={addCategory}
                  className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Add Category
                </button>
              </div>
            </div>
            
            <div className="flex justify-end p-6 pt-0">
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Edit Category</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                <input
                  type="text"
                  value={editingCategory.label}
                  onChange={(e) => setEditingCategory({...editingCategory, label: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">XP Amount</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editingCategory.amount}
                  onChange={(e) => setEditingCategory({...editingCategory, amount: parseInt(e.target.value) || 1})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <select
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({...editingCategory, icon: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="🌟">🌟 Star</option>
                  <option value="💡">💡 Lightbulb</option>
                  <option value="🎨">🎨 Art</option>
                  <option value="🏆">🏆 Trophy</option>
                  <option value="🎯">🎯 Target</option>
                  <option value="💪">💪 Strength</option>
                  <option value="🧠">🧠 Brain</option>
                  <option value="❤️">❤️ Heart</option>
                  <option value="🤝">🤝 Handshake</option>
                  <option value="✅">✅ Check</option>
                  <option value="🛡️">🛡️ Shield</option>
                  <option value="📚">📚 Books</option>
                  <option value="⭐">⭐ Gold Star</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <select
                  value={editingCategory.color}
                  onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bg-blue-500">Blue</option>
                  <option value="bg-green-500">Green</option>
                  <option value="bg-yellow-500">Yellow</option>
                  <option value="bg-purple-500">Purple</option>
                  <option value="bg-pink-500">Pink</option>
                  <option value="bg-red-500">Red</option>
                  <option value="bg-indigo-500">Indigo</option>
                  <option value="bg-orange-500">Orange</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateCategory(editingCategory.id, editingCategory);
                  setEditingCategory(null);
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Reset Confirmation Modal */}
      {showPetResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">⚠️ Reset All Pets</h2>
            </div>
            
            <div className="p-6">
              <p className="text-gray-800 mb-4">
                This will remove <strong>ALL pets</strong> from <strong>ALL students</strong> in your class. 
                This action cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-700 text-sm">
                  <strong>Why might you need this?</strong><br/>
                  If pet images aren't loading properly due to old data formats, 
                  resetting pets allows students to earn new ones with the correct image files.
                </p>
              </div>
              <p className="text-gray-600 text-sm">
                Students can earn new pets by reaching 50 XP again after the reset.
              </p>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowPetResetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={resetAllStudentPets}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                ⚠️ Reset All Pets
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Inventory Modal */}
      {showInventoryModal && inventoryStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    👜 {inventoryStudent.firstName}'s Inventory
                  </h2>
                  <p className="text-purple-100">Manage avatars and pets</p>
                </div>
                <button
                  onClick={() => setShowInventoryModal(false)}
                  className="text-white hover:text-red-200 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Current Avatar */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎭 Current Avatar</h3>
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <img 
                    src={getAvatarImage(inventoryStudent.avatarBase || 'Wizard F', calculateAvatarLevel(inventoryStudent.totalPoints || 0))}
                    alt={`${inventoryStudent.firstName}'s Avatar`}
                    className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-lg"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">{inventoryStudent.avatarBase || 'Wizard F'}</h4>
                    <p className="text-gray-600">Level {calculateAvatarLevel(inventoryStudent.totalPoints || 0)}</p>
                    <p className="text-sm text-gray-500">{inventoryStudent.totalPoints || 0} XP</p>
                  </div>
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎨 Change Avatar</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {AVAILABLE_AVATARS.map(avatarBase => (
                    <button
                      key={avatarBase}
                      onClick={() => updateStudentAvatar(inventoryStudent, avatarBase)}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
                        inventoryStudent.avatarBase === avatarBase
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      title={avatarBase}
                    >
                      <img 
                        src={getAvatarImage(avatarBase, 1)}
                        alt={avatarBase}
                        className="w-12 h-12 rounded-full mx-auto"
                        onError={(e) => {
                          e.target.src = '/avatars/Wizard F/Level 1.png';
                        }}
                      />
                      <p className="text-xs mt-1 font-semibold text-gray-700 truncate">{avatarBase}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Pets */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🐾 Current Pets ({(inventoryStudent.ownedPets || []).length})</h3>
                {!inventoryStudent.ownedPets || inventoryStudent.ownedPets.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-2">🐾</div>
                    <p className="text-gray-600">No pets yet!</p>
                    <p className="text-sm text-gray-500">Students get their first pet at 50 XP</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {inventoryStudent.ownedPets.map(pet => (
                      <div key={pet.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-center mb-2">
                          <img 
                            src={getPetImage(pet.type || pet.imageType, pet.name)}
                            alt={pet.name || pet.displayName}
                            className="w-16 h-16 rounded-full mx-auto border-2 border-purple-300"
                            onError={(e) => {
                              e.target.src = '/Pets/Wizard.png';
                            }}
                          />
                        </div>
                        <h4 className="font-bold text-sm text-center text-gray-800">{pet.name || pet.displayName}</h4>
                        <p className="text-xs text-center text-gray-600 capitalize">{pet.rarity} Pet</p>
                        <button
                          onClick={() => removePetFromStudent(inventoryStudent, pet.id)}
                          className="w-full mt-2 bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Pet */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">➕ Add Pet</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  {AVAILABLE_PETS.map(pet => (
                    <button
                      key={pet.name}
                      onClick={() => addPetToStudent(inventoryStudent, pet)}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all hover:scale-105"
                      title={`${pet.name} (${pet.rarity})`}
                    >
                      <img 
                        src={getPetImage(pet.type, pet.name)}
                        alt={pet.name}
                        className="w-12 h-12 rounded-full mx-auto border-2 border-gray-300"
                        onError={(e) => {
                          e.target.src = '/Pets/Wizard.png';
                        }}
                      />
                      <p className="text-xs mt-1 font-semibold text-gray-700 truncate">{pet.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{pet.rarity}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Student Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Student Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{inventoryStudent.totalPoints || 0}</div>
                    <div className="text-sm text-gray-600">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{calculateCoins(inventoryStudent)}</div>
                    <div className="text-sm text-gray-600">Coins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{calculateAvatarLevel(inventoryStudent.totalPoints || 0)}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{(inventoryStudent.ownedPets || []).length}</div>
                    <div className="text-sm text-gray-600">Pets</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================================
// FIXED STUDENT CARD COMPONENT
// ===============================================

const StudentCard = ({ 
  student, 
  onQuickXP, 
  onViewDetails, 
  onShowIndividualXP,
  openInventoryModal,
  isSelected = false, 
  onToggleSelection,
  xpCategories = [],
  onAvatarHover,
  onPetHover,
  getAvatarImage,
  calculateAvatarLevel,
  calculateCoins,
  getPetImage
}) => {
  const currentLevel = calculateAvatarLevel(student.totalPoints || 0);
  const coins = calculateCoins(student);
  const progressToNext = (student.totalPoints || 0) % 100;

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
      isSelected ? 'border-purple-400 bg-purple-50' : 'border-blue-100 hover:border-blue-300'
    } relative group cursor-pointer transform hover:scale-105`}>
      
      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
          ✓
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-3">
        {/* Avatar Section with Click to Select */}
        <div className="flex flex-col items-center mb-3">
          <div 
            className="relative group/avatar cursor-pointer"
            onClick={onToggleSelection}
            onMouseEnter={() => onAvatarHover(student, true)}
            onMouseLeave={() => onAvatarHover(student, false)}
          >
            <img 
              src={getAvatarImage(student.avatarBase || 'Wizard F', currentLevel)}
              alt={`${student.firstName}'s Avatar`}
              className={`w-16 h-16 rounded-full border-3 shadow-lg transition-all ${
                isSelected ? 'border-purple-400' : 'border-blue-400 group-hover/avatar:border-blue-600'
              }`}
              onError={(e) => {
                console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
                e.target.src = '/avatars/Wizard F/Level 1.png';
              }}
            />
            {/* FIXED: Show current level, not next level */}
            <div className={`absolute -bottom-1 -right-1 text-white text-xs px-2 py-1 rounded-full font-bold ${
              isSelected ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              L{currentLevel}
            </div>
            
            {/* Selection hint */}
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {isSelected ? 'Selected' : 'Select'}
              </span>
            </div>
          </div>
          
          <h3 
            className="text-sm font-bold text-gray-800 mt-2 text-center leading-tight cursor-pointer hover:text-blue-600"
            onClick={() => onViewDetails(student)}
          >
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
          
          {/* XP Progress Bar - FIXED: Show progress to next level */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>To Level {currentLevel + 1}</span>
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

        {/* Pet Display - FIXED */}
        {student.ownedPets && student.ownedPets.length > 0 && (
          <div className="flex justify-center mb-3">
            <div 
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onMouseEnter={() => onPetHover(student.ownedPets[0], true)}
              onMouseLeave={() => onPetHover(student.ownedPets[0], false)}
            >
              <img 
                src={getPetImage(student.ownedPets[0].type || student.ownedPets[0].imageType, student.ownedPets[0].name)}
                alt={student.ownedPets[0].name || student.ownedPets[0].displayName}
                className="w-8 h-8 rounded-full border-2 border-purple-300"
                title={student.ownedPets[0].name || student.ownedPets[0].displayName}
                onError={(e) => {
                  console.warn(`Pet image failed to load: ${e.target.src}`);
                  e.target.src = '/Pets/Wizard.png'; // Fallback to default
                }}
              />
            </div>
          </div>
        )}

        {/* XP Award Buttons */}
        <div className="space-y-2">
          {/* Quick XP buttons (top 3 categories) */}
          <div className="grid grid-cols-3 gap-1">
            {xpCategories.slice(0, 3).map(category => (
              <button
                key={category.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickXP(student, category.amount, category.label);
                }}
                className={`${category.color} text-white text-xs py-1 px-1 rounded-lg hover:opacity-80 transition-all font-bold`}
                title={`${category.label} (+${category.amount} XP)`}
              >
                {category.icon}
              </button>
            ))}
          </div>
          
          {/* Individual XP button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowIndividualXP(student);
            }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs py-1 px-2 rounded-lg hover:shadow-md transition-all font-bold"
            title="Award custom XP amount"
          >
            🎯 Custom XP
          </button>

          {/* Inventory button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openInventoryModal(student);
            }}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs py-1 px-2 rounded-lg hover:shadow-md transition-all font-bold mt-1"
            title="View student inventory and change avatar"
          >
            👜 Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;