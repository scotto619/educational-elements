// components/tabs/StudentsTab.js - COMPLETE REWRITE
import React, { useState, useEffect, useRef } from 'react';

// Simple hook for student management - inline to avoid import issues
const useStudentManagement = (user, currentClassId) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = (students) => {
    setSelectedStudents(students.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  return {
    selectedStudents,
    setSelectedStudents,
    toggleStudentSelection,
    selectAllStudents,
    clearSelection
  };
};

// Available avatar options for new students
const AVAILABLE_AVATARS = [
  'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M',
  'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M',
  'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M',
  'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M',
  'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M',
  'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M',
  'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M'
];

// Available pets for preview
const AVAILABLE_PETS = [
  'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight',
  'Crystal Sage', 'Dream', 'Druid', 'Engineer', 'Frost Mage', 'Illusionist',
  'Knight', 'Lightning', 'Monk', 'Necromancer', 'Orc', 'Paladin', 'Rogue',
  'Stealth', 'Time Knight', 'Warrior'
];

// XP Categories for awarding
const DEFAULT_XP_CATEGORIES = [
  { name: 'Respectful', icon: '🤝', color: 'blue' },
  { name: 'Responsible', icon: '✅', color: 'green' },
  { name: 'Safe', icon: '🛡️', color: 'yellow' },
  { name: 'Learner', icon: '📚', color: 'purple' },
  { name: 'Helper', icon: '🤗', color: 'pink' },
  { name: 'Creative', icon: '🎨', color: 'indigo' },
  { name: 'Bonus', icon: '⭐', color: 'orange' }
];

// Utility functions
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

const getPetImage = (petType) => {
  return `/Pets/${petType}.png`;
};

const calculateCoins = (student) => {
  const xpCoins = Math.floor((student.totalPoints || 0) / 10);
  const bonusCoins = student.currency || 0;
  const spent = student.coinsSpent || 0;
  return xpCoins + bonusCoins - spent;
};

const getGridClasses = (count) => {
  if (count <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
  if (count <= 8) return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
  if (count <= 10) return 'grid-cols-2 md:grid-cols-5 lg:grid-cols-10';
  if (count <= 12) return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
  if (count <= 15) return 'grid-cols-3 md:grid-cols-5 lg:grid-cols-5';
  if (count <= 20) return 'grid-cols-4 md:grid-cols-5 lg:grid-cols-5';
  if (count <= 25) return 'grid-cols-5 md:grid-cols-5 lg:grid-cols-5';
  return 'grid-cols-6 md:grid-cols-6 lg:grid-cols-6';
};

// Sound functions
const playXPSound = () => {
  try {
    const audio = new Audio('/sounds/xp-gain.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Sound play failed:', e));
  } catch (e) {
    console.log('Sound loading failed:', e);
  }
};

const playLevelUpSound = () => {
  try {
    const audio = new Audio('/sounds/level-up.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Sound play failed:', e));
  } catch (e) {
    console.log('Sound loading failed:', e);
  }
};

const StudentsTab = ({ 
  students, 
  setStudents, 
  saveStudentsToFirebase,
  showToast,
  showSuccessToast,
  showErrorToast,
  currentClassId,
  user 
}) => {
  // Use the inline student management hook
  const {
    selectedStudents,
    setSelectedStudents,
    toggleStudentSelection,
    selectAllStudents,
    clearSelection
  } = useStudentManagement(user, currentClassId);

  // Local state
  const [xpCategories] = useState(DEFAULT_XP_CATEGORIES);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showBulkXPModal, setShowBulkXPModal] = useState(false);
  const [showBulkCoinsModal, setShowBulkCoinsModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [selectedStudentForSheet, setSelectedStudentForSheet] = useState(null);
  
  // XP Award state
  const [selectedCategory, setSelectedCategory] = useState('Bonus');
  const [customXPAmount, setCustomXPAmount] = useState(1);
  const [bulkXPAmount, setBulkXPAmount] = useState(5);
  const [bulkCoinAmount, setBulkCoinAmount] = useState(5);
  
  // New student state
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('Wizard F');
  
  // Image preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });
  
  // Level up and notification state
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [notificationQueue, setNotificationQueue] = useState([]);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  // Ensure students is always an array
  const safeStudents = Array.isArray(students) ? students : [];

  // Filter and sort students
  const filteredStudents = safeStudents.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || 
      (student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0)) === parseInt(filterLevel);
    
    return matchesSearch && matchesLevel;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => 
    (b.totalPoints || 0) - (a.totalPoints || 0)
  );

  // Grid calculation for responsive layout
  const gridClasses = getGridClasses(sortedStudents.length);

  // ===============================================
  // EVENT HANDLERS
  // ===============================================

  const handleAvatarHover = (event, student) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: event.clientX + 15,
      y: event.clientY - 50
    });
    setPreviewImage({
      src: student.avatar || getAvatarImage(student.avatarBase, student.avatarLevel),
      name: `${student.firstName}'s Avatar`,
      level: student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0),
      type: 'avatar'
    });
  };

  const handlePetHover = (event, pet, student) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: event.clientX + 15,
      y: event.clientY - 50
    });
    setPreviewImage({
      src: pet.image,
      name: pet.name,
      owner: student.firstName,
      type: 'pet'
    });
  };

  const hidePreview = () => {
    setPreviewImage(null);
  };

  const handleQuickXP = async (studentId) => {
    try {
      const student = safeStudents.find(s => s.id === studentId);
      if (!student) return;

      const oldLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
      const newXP = (student.totalPoints || 0) + 1;
      const newLevel = calculateAvatarLevel(newXP);

      // Update student
      const updatedStudents = safeStudents.map(s => 
        s.id === studentId 
          ? {
              ...s,
              totalPoints: newXP,
              avatarLevel: newLevel,
              avatar: getAvatarImage(s.avatarBase || 'Wizard F', newLevel),
              lastUpdated: new Date().toISOString()
            }
          : s
      );

      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      // Play sound
      playXPSound();

      // Check for level up
      if (newLevel > oldLevel) {
        playLevelUpSound();
        setLevelUpData({
          student: { ...student, totalPoints: newXP, avatarLevel: newLevel },
          oldLevel,
          newLevel
        });
      }

      // Add notification
      addNotification(`${student.firstName} earned 1 XP!`, 'success');

    } catch (error) {
      console.error('Error awarding XP:', error);
      showErrorToast('Failed to award XP');
    }
  };

  const handleCustomXP = async (studentId, amount, category) => {
    try {
      const student = safeStudents.find(s => s.id === studentId);
      if (!student) return;

      const oldLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
      const newXP = (student.totalPoints || 0) + amount;
      const newLevel = calculateAvatarLevel(newXP);

      // Update student
      const updatedStudents = safeStudents.map(s => 
        s.id === studentId 
          ? {
              ...s,
              totalPoints: newXP,
              avatarLevel: newLevel,
              avatar: getAvatarImage(s.avatarBase || 'Wizard F', newLevel),
              behaviorPoints: {
                ...s.behaviorPoints,
                [category.toLowerCase()]: (s.behaviorPoints?.[category.toLowerCase()] || 0) + amount
              },
              lastUpdated: new Date().toISOString()
            }
          : s
      );

      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      // Play sound
      playXPSound();

      // Check for level up
      if (newLevel > oldLevel) {
        playLevelUpSound();
        setLevelUpData({
          student: { ...student, totalPoints: newXP, avatarLevel: newLevel },
          oldLevel,
          newLevel
        });
      }

      // Check for pet unlock (first pet at 50 XP)
      if (newXP >= 50 && (!student.ownedPets || student.ownedPets.length === 0)) {
        const randomPet = AVAILABLE_PETS[Math.floor(Math.random() * AVAILABLE_PETS.length)];
        const newPet = {
          id: `pet_${Date.now()}`,
          name: `${student.firstName}'s ${randomPet}`,
          type: randomPet,
          image: getPetImage(randomPet),
          unlockedAt: new Date().toISOString()
        };

        // Add pet to student
        const studentsWithPet = updatedStudents.map(s => 
          s.id === studentId 
            ? { ...s, ownedPets: [newPet] }
            : s
        );

        setStudents(studentsWithPet);
        await saveStudentsToFirebase(studentsWithPet);

        setPetUnlockData({
          student: { ...student, totalPoints: newXP },
          pet: newPet
        });
      }

      addNotification(`${student.firstName} earned ${amount} XP for ${category}!`, 'success');
      setShowXPModal(false);

    } catch (error) {
      console.error('Error awarding custom XP:', error);
      showErrorToast('Failed to award XP');
    }
  };

  const handleBulkXP = async () => {
    if (selectedStudents.length === 0) {
      showErrorToast('No students selected');
      return;
    }

    try {
      let levelUps = [];
      const updatedStudents = safeStudents.map(student => {
        if (selectedStudents.includes(student.id)) {
          const oldLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
          const newXP = (student.totalPoints || 0) + bulkXPAmount;
          const newLevel = calculateAvatarLevel(newXP);

          if (newLevel > oldLevel) {
            levelUps.push({ student: { ...student, totalPoints: newXP }, oldLevel, newLevel });
          }

          return {
            ...student,
            totalPoints: newXP,
            avatarLevel: newLevel,
            avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
            behaviorPoints: {
              ...student.behaviorPoints,
              [selectedCategory.toLowerCase()]: (student.behaviorPoints?.[selectedCategory.toLowerCase()] || 0) + bulkXPAmount
            },
            lastUpdated: new Date().toISOString()
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      playXPSound();
      if (levelUps.length > 0) {
        playLevelUpSound();
        setLevelUpData(levelUps[0]);
      }

      addNotification(`${bulkXPAmount} XP awarded to ${selectedStudents.length} students!`, 'success');
      setShowBulkXPModal(false);
      clearSelection();

    } catch (error) {
      console.error('Error awarding bulk XP:', error);
      showErrorToast('Failed to award bulk XP');
    }
  };

  const handleAddCoins = async (studentId, amount) => {
    try {
      const updatedStudents = safeStudents.map(s => 
        s.id === studentId 
          ? {
              ...s,
              currency: (s.currency || 0) + amount,
              lastUpdated: new Date().toISOString()
            }
          : s
      );

      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      const student = safeStudents.find(s => s.id === studentId);
      addNotification(`${student?.firstName} earned ${amount} coins!`, 'success');

    } catch (error) {
      console.error('Error awarding coins:', error);
      showErrorToast('Failed to award coins');
    }
  };

  const handleBulkCoins = async () => {
    if (selectedStudents.length === 0) {
      showErrorToast('No students selected');
      return;
    }

    try {
      const updatedStudents = safeStudents.map(student => {
        if (selectedStudents.includes(student.id)) {
          return {
            ...student,
            currency: (student.currency || 0) + bulkCoinAmount,
            lastUpdated: new Date().toISOString()
          };
        }
        return student;
      });

      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      addNotification(`${bulkCoinAmount} coins awarded to ${selectedStudents.length} students!`, 'success');
      setShowBulkCoinsModal(false);
      clearSelection();

    } catch (error) {
      console.error('Error awarding bulk coins:', error);
      showErrorToast('Failed to award bulk coins');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      showErrorToast('Please enter a student name');
      return;
    }

    try {
      const newStudent = {
        id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstName: newStudentName.trim(),
        lastName: '',
        totalPoints: 0,
        currency: 0,
        avatarLevel: 1,
        avatarBase: newStudentAvatar,
        avatar: getAvatarImage(newStudentAvatar, 1),
        ownedAvatars: [newStudentAvatar],
        ownedPets: [],
        behaviorPoints: {
          respectful: 0,
          responsible: 0,
          safe: 0,
          learner: 0,
          helper: 0,
          creative: 0
        },
        questsCompleted: [],
        rewardsPurchased: [],
        coinsSpent: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      const updatedStudents = [...safeStudents, newStudent];
      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      showSuccessToast(`${newStudentName} added to class!`);
      setNewStudentName('');
      setNewStudentAvatar('Wizard F');
      setShowAddStudentModal(false);

    } catch (error) {
      console.error('Error adding student:', error);
      showErrorToast('Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      const student = safeStudents.find(s => s.id === studentId);
      if (!student) return;

      const updatedStudents = safeStudents.filter(s => s.id !== studentId);
      setStudents(updatedStudents);
      await saveStudentsToFirebase(updatedStudents);

      showSuccessToast(`${student.firstName} removed from class`);

    } catch (error) {
      console.error('Error removing student:', error);
      showErrorToast('Failed to remove student');
    }
  };

  const openCharacterSheet = (student) => {
    setSelectedStudentForSheet(student);
    setShowCharacterSheet(true);
  };

  // Notification system
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotificationQueue(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotificationQueue(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // ===============================================
  // RENDER COMPONENTS
  // ===============================================

  const StudentCard = ({ student }) => {
    const level = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
    const coins = calculateCoins(student);
    const isSelected = selectedStudents.includes(student.id);
    const pets = student.ownedPets || [];

    return (
      <div 
        className={`relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
          isSelected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
        }`}
        onClick={() => toggleStudentSelection(student.id)}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold z-10">
            ✓
          </div>
        )}

        {/* Avatar */}
        <div 
          className="relative cursor-pointer"
          onMouseEnter={(e) => handleAvatarHover(e, student)}
          onMouseLeave={hidePreview}
          onClick={(e) => {
            e.stopPropagation();
            openCharacterSheet(student);
          }}
        >
          <img
            src={student.avatar || getAvatarImage(student.avatarBase, level)}
            alt={`${student.firstName}'s Avatar`}
            className="w-full h-32 object-cover rounded-t-lg hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.src = '/Avatars/Wizard F/Level 1.png';
            }}
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-bold">
            Lv. {level}
          </div>
        </div>

        {/* Student Info */}
        <div className="p-3">
          <h3 className="font-bold text-lg text-gray-800 mb-1 truncate">
            {student.firstName}
          </h3>
          
          {/* XP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>XP: {student.totalPoints || 0}</span>
              <span>Next: {100 - ((student.totalPoints || 0) % 100)}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-300"
                style={{ width: `${((student.totalPoints || 0) % 100)}%` }}
              />
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center text-yellow-600">
              <span className="text-lg">💰</span>
              <span className="ml-1 font-bold">{coins}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddCoins(student.id, 5);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
            >
              +5 💰
            </button>
          </div>

          {/* Pets */}
          {pets.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {pets.slice(0, 3).map((pet, index) => (
                <img
                  key={index}
                  src={pet.image}
                  alt={pet.name}
                  className="w-6 h-6 rounded cursor-pointer hover:scale-110 transition-transform"
                  onMouseEnter={(e) => handlePetHover(e, pet, student)}
                  onMouseLeave={hidePreview}
                  onError={(e) => {
                    e.target.src = '/Pets/Wizard.png';
                  }}
                />
              ))}
              {pets.length > 3 && (
                <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-bold">
                  +{pets.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickXP(student.id);
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-2 py-1 rounded text-xs font-bold transition-all transform hover:scale-105"
            >
              ⭐ +1 XP
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowXPModal(student);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
            >
              +XP
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===============================================
  // MAIN RENDER
  // ===============================================

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            👥 Class Champions ({sortedStudents.length} students)
          </h2>
          
          {/* Search and Filter */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              ➕ Add Student
            </button>
            
            {selectedStudents.length > 0 && (
              <>
                <button
                  onClick={() => setShowBulkXPModal(true)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  ⭐ Bulk XP ({selectedStudents.length})
                </button>
                <button
                  onClick={() => setShowBulkCoinsModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  💰 Bulk Coins ({selectedStudents.length})
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                >
                  Clear Selection
                </button>
              </>
            )}
            
            <button
              onClick={() => selectAllStudents(sortedStudents)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              Select All
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="flex-1 overflow-auto">
        {sortedStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-600 mb-2">No students yet!</h3>
            <p className="text-gray-500 mb-4">Add your first student to get started.</p>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              ➕ Add Student
            </button>
          </div>
        ) : (
          <div className={`grid ${gridClasses} gap-4 pb-4`}>
            {sortedStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notificationQueue.map((notification) => (
          <div
            key={notification.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white font-bold animate-bounce ${
              notification.type === 'success' ? 'bg-green-500' : 
              notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Image Preview */}
      {previewImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: previewPosition.x,
            top: previewPosition.y
          }}
        >
          <div className="bg-black bg-opacity-90 text-white p-3 rounded-lg shadow-xl max-w-xs">
            <img
              src={previewImage.src}
              alt={previewImage.name}
              className="w-24 h-24 object-cover rounded mb-2 mx-auto"
            />
            <div className="text-center">
              <div className="font-bold">{previewImage.name}</div>
              {previewImage.level && <div className="text-sm">Level {previewImage.level}</div>}
              {previewImage.owner && <div className="text-sm">Owner: {previewImage.owner}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Student</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Student Name</label>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter student name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Choose Starting Avatar</label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-auto border border-gray-300 rounded p-2">
                {AVAILABLE_AVATARS.map((avatar) => (
                  <div
                    key={avatar}
                    className={`cursor-pointer border-2 rounded p-1 ${
                      newStudentAvatar === avatar ? 'border-blue-500' : 'border-gray-200'
                    }`}
                    onClick={() => setNewStudentAvatar(avatar)}
                  >
                    <img
                      src={getAvatarImage(avatar, 1)}
                      alt={avatar}
                      className="w-full h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/Avatars/Wizard F/Level 1.png';
                      }}
                    />
                    <div className="text-xs text-center mt-1 truncate">{avatar}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddStudent}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Add Student
              </button>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom XP Modal */}
      {showXPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Award XP to {showXPModal.firstName}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">XP Amount</label>
              <input
                type="number"
                value={customXPAmount}
                onChange={(e) => setCustomXPAmount(parseInt(e.target.value) || 1)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {xpCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      selectedCategory === category.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg">{category.icon}</div>
                    <div className="text-xs font-bold">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCustomXP(showXPModal.id, customXPAmount, selectedCategory)}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Award XP
              </button>
              <button
                onClick={() => setShowXPModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk XP Modal */}
      {showBulkXPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Award XP to {selectedStudents.length} Students
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">XP Amount (each)</label>
              <input
                type="number"
                value={bulkXPAmount}
                onChange={(e) => setBulkXPAmount(parseInt(e.target.value) || 1)}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {xpCategories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      selectedCategory === category.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg">{category.icon}</div>
                    <div className="text-xs font-bold">{category.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBulkXP}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Award XP
              </button>
              <button
                onClick={() => setShowBulkXPModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Coins Modal */}
      {showBulkCoinsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Award Coins to {selectedStudents.length} Students
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Coin Amount (each)</label>
              <input
                type="number"
                value={bulkCoinAmount}
                onChange={(e) => setBulkCoinAmount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleBulkCoins}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Award Coins
              </button>
              <button
                onClick={() => setShowBulkCoinsModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Modal */}
      {levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-8 w-full max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-2">LEVEL UP!</h2>
            <h3 className="text-xl font-bold text-white mb-4">
              {levelUpData.student.firstName} reached Level {levelUpData.newLevel}!
            </h3>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <img
                src={getAvatarImage(levelUpData.student.avatarBase, levelUpData.newLevel)}
                alt="New Avatar"
                className="w-32 h-32 mx-auto rounded-lg shadow-lg"
              />
            </div>

            <button
              onClick={() => setLevelUpData(null)}
              className="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Awesome! 🎊
            </button>
          </div>
        </div>
      )}

      {/* Pet Unlock Modal */}
      {petUnlockData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-xl p-8 w-full max-w-md text-center shadow-2xl">
            <div className="text-6xl mb-4 animate-bounce">🐾</div>
            <h2 className="text-3xl font-bold text-white mb-2">NEW PET!</h2>
            <h3 className="text-xl font-bold text-white mb-4">
              {petUnlockData.student.firstName} unlocked their first pet!
            </h3>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <img
                src={petUnlockData.pet.image}
                alt="New Pet"
                className="w-32 h-32 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-white font-bold mt-2">{petUnlockData.pet.name}</p>
            </div>

            <button
              onClick={() => setPetUnlockData(null)}
              className="bg-white text-blue-500 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Amazing! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Character Sheet Modal */}
      {showCharacterSheet && selectedStudentForSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-96 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                {selectedStudentForSheet.firstName}'s Character Sheet
              </h3>
              <button
                onClick={() => setShowCharacterSheet(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avatar and Basic Info */}
              <div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <img
                    src={selectedStudentForSheet.avatar || getAvatarImage(selectedStudentForSheet.avatarBase, selectedStudentForSheet.avatarLevel)}
                    alt="Avatar"
                    className="w-32 h-32 mx-auto rounded-lg shadow-lg mb-2"
                  />
                  <h4 className="font-bold text-lg">{selectedStudentForSheet.firstName}</h4>
                  <p className="text-gray-600">Level {selectedStudentForSheet.avatarLevel || 1}</p>
                  <p className="text-gray-600">{selectedStudentForSheet.totalPoints || 0} Total XP</p>
                  <p className="text-yellow-600 font-bold">💰 {calculateCoins(selectedStudentForSheet)} Coins</p>
                </div>
              </div>

              {/* Stats and Info */}
              <div>
                <h5 className="font-bold mb-2">Behavior Points</h5>
                <div className="space-y-2 mb-4">
                  {Object.entries(selectedStudentForSheet.behaviorPoints || {}).map(([behavior, points]) => (
                    <div key={behavior} className="flex justify-between">
                      <span className="capitalize">{behavior}:</span>
                      <span className="font-bold">{points}</span>
                    </div>
                  ))}
                </div>

                <h5 className="font-bold mb-2">Collection</h5>
                <div className="text-sm text-gray-600">
                  <p>Owned Avatars: {(selectedStudentForSheet.ownedAvatars || []).length}</p>
                  <p>Owned Pets: {(selectedStudentForSheet.ownedPets || []).length}</p>
                  <p>Quests Completed: {(selectedStudentForSheet.questsCompleted || []).length}</p>
                  <p>Rewards Purchased: {(selectedStudentForSheet.rewardsPurchased || []).length}</p>
                </div>
              </div>
            </div>

            {/* Pets Display */}
            {selectedStudentForSheet.ownedPets && selectedStudentForSheet.ownedPets.length > 0 && (
              <div className="mt-6">
                <h5 className="font-bold mb-2">Pet Collection</h5>
                <div className="grid grid-cols-4 gap-2">
                  {selectedStudentForSheet.ownedPets.map((pet, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={pet.image}
                        alt={pet.name}
                        className="w-16 h-16 mx-auto rounded shadow"
                      />
                      <p className="text-xs mt-1">{pet.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handleRemoveStudent(selectedStudentForSheet.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Remove Student
              </button>
              <button
                onClick={() => setShowCharacterSheet(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;