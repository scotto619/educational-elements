// components/tabs/StudentsTab.js - COMPLETE ENHANCED IMPLEMENTATION
import React, { useState, useEffect, useRef } from 'react';
import CharacterSheetModal from '../CharacterSheetModal';

// ===============================================
// HARDCODED CONSTANTS AND UTILITIES
// ===============================================

// Hardcoded XP Categories (editable)
const DEFAULT_XP_CATEGORIES = [
  { 
    id: 1, 
    label: 'Respectful', 
    amount: 1, 
    color: 'bg-blue-500', 
    icon: '🤝',
    description: 'Showing respect to others and the classroom'
  },
  { 
    id: 2, 
    label: 'Responsible', 
    amount: 1, 
    color: 'bg-green-500', 
    icon: '✅',
    description: 'Taking responsibility for actions and tasks'
  },
  { 
    id: 3, 
    label: 'Safe', 
    amount: 1, 
    color: 'bg-yellow-500', 
    icon: '🛡️',
    description: 'Following safety rules and helping others stay safe'
  },
  { 
    id: 4, 
    label: 'Learner', 
    amount: 1, 
    color: 'bg-purple-500', 
    icon: '📚',
    description: 'Actively participating in learning activities'
  },
  { 
    id: 5, 
    label: 'Star Award', 
    amount: 5, 
    color: 'bg-yellow-600', 
    icon: '⭐',
    description: 'Outstanding achievement or exceptional behavior'
  }
];

// Hardcoded Avatar Paths
const AVATAR_BASES = [
  'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Assassin F', 'Assassin M',
  'Barbarian F', 'Barbarian M', 'Cleric F', 'Cleric M', 'Fighter F', 'Fighter M',
  'Mage F', 'Mage M', 'Paladin F', 'Paladin M', 'Ranger F', 'Ranger M',
  'Rogue F', 'Rogue M', 'Sorcerer F', 'Sorcerer M', 'Warlock F', 'Warlock M',
  'Wizard F', 'Wizard M'
];

// Hardcoded Pet Data
const BASIC_PETS = [
  { id: 'goblin', name: 'Goblin Pet', image: '/shop/BasicPets/GoblinPet.png', speed: 3 },
  { id: 'soccer', name: 'Soccer Pet', image: '/shop/BasicPets/SoccerPet.png', speed: 4 },
  { id: 'unicorn', name: 'Unicorn Pet', image: '/shop/BasicPets/UnicornPet.png', speed: 5 }
];

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return '/Avatars/Wizard F/Level 1.png';
  }
  
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  const imagePath = `/Avatars/${avatarBase}/Level ${validLevel}.png`;
  
  return imagePath;
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

const shouldReceivePet = (student) => {
  return (student?.totalPoints || 0) >= 50 && (!student?.ownedPets || student.ownedPets.length === 0);
};

const getGridClasses = (studentCount) => {
  if (studentCount <= 4) return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
  if (studentCount <= 8) return 'grid grid-cols-2 lg:grid-cols-4 gap-3';
  if (studentCount <= 12) return 'grid grid-cols-3 lg:grid-cols-6 gap-3';
  if (studentCount <= 20) return 'grid grid-cols-4 lg:grid-cols-8 gap-2';
  return 'grid grid-cols-5 lg:grid-cols-10 gap-1';
};

const playSound = (soundType) => {
  try {
    const soundFiles = {
      'xp': '/sounds/xp-award.wav',
      'levelup': '/sounds/level-up.wav',
      'coin': '/sounds/coin.wav',
      'pet': '/sounds/pet-unlock.wav',
      'success': '/sounds/success.wav'
    };
    
    const audio = new Audio(soundFiles[soundType] || soundFiles.success);
    audio.volume = 0.7;
    audio.play().catch(() => {
      // Fallback to system beep
      console.log('Audio playback failed, using fallback');
    });
  } catch (error) {
    console.log('Audio not supported');
  }
};

// ===============================================
// MAIN COMPONENT
// ===============================================

const StudentsTab = ({ 
  students = [], 
  setStudents,
  selectedStudent,
  setSelectedStudent,
  showToast = () => {},
  saveStudentsToFirebase = () => {},
  userData,
  user
}) => {
  // ===============================================
  // STATE MANAGEMENT
  // ===============================================
  
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showXPModal, setShowXPModal] = useState(false);
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [showCharacterSheet, setShowCharacterSheet] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [xpCategories, setXpCategories] = useState(DEFAULT_XP_CATEGORIES);
  const [hoverPreview, setHoverPreview] = useState({ show: false, image: '', name: '', x: 0, y: 0 });
  
  // Form states
  const [xpAmount, setXpAmount] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(1);
  const [coinAmount, setCoinAmount] = useState(1);
  const [customReason, setCustomReason] = useState('');

  // ===============================================
  // HOVER PREVIEW SYSTEM
  // ===============================================

  const handleImageHover = (e, imageData) => {
    const rect = e.target.getBoundingClientRect();
    setHoverPreview({
      show: true,
      image: imageData.image,
      name: imageData.name,
      type: imageData.type || 'avatar',
      x: rect.right + 10,
      y: rect.top
    });
  };

  const hidePreview = () => {
    setHoverPreview({ show: false, image: '', name: '', x: 0, y: 0 });
  };

  // ===============================================
  // STUDENT SELECTION MANAGEMENT
  // ===============================================

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const selectAllStudents = () => {
    setSelectedStudents(new Set(students.map(s => s.id)));
  };

  const deselectAllStudents = () => {
    setSelectedStudents(new Set());
  };

  // ===============================================
  // XP AND COIN AWARD SYSTEM
  // ===============================================

  const handleAwardXP = () => {
    if (selectedStudents.size === 0) {
      showToast('Please select at least one student');
      return;
    }

    const category = xpCategories.find(cat => cat.id === selectedCategory);
    const finalAmount = xpAmount || category?.amount || 1;
    
    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (selectedStudents.has(student.id)) {
          const newTotalXP = (student.totalPoints || 0) + finalAmount;
          const oldLevel = calculateAvatarLevel(student.totalPoints || 0);
          const newLevel = calculateAvatarLevel(newTotalXP);
          
          // Check for level up
          if (newLevel > oldLevel) {
            setTimeout(() => {
              setLevelUpData({
                student: { ...student, totalPoints: newTotalXP },
                newLevel
              });
              playSound('levelup');
            }, 500);
          }
          
          // Check for pet unlock
          if (shouldReceivePet({ ...student, totalPoints: newTotalXP })) {
            const randomPet = BASIC_PETS[Math.floor(Math.random() * BASIC_PETS.length)];
            setTimeout(() => {
              setPetUnlockData({
                student: { ...student, totalPoints: newTotalXP },
                pet: randomPet
              });
              playSound('pet');
            }, newLevel > oldLevel ? 2000 : 500);
            
            // Add pet to student
            return {
              ...student,
              totalPoints: newTotalXP,
              avatarLevel: newLevel,
              avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
              ownedPets: [...(student.ownedPets || []), randomPet],
              categoryTotal: {
                ...student.categoryTotal,
                [category.label]: (student.categoryTotal?.[category.label] || 0) + finalAmount
              },
              logs: [
                ...(student.logs || []),
                {
                  type: category.label,
                  points: finalAmount,
                  timestamp: new Date().toISOString(),
                  reason: customReason || category.description
                }
              ]
            };
          }
          
          return {
            ...student,
            totalPoints: newTotalXP,
            avatarLevel: newLevel,
            avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
            categoryTotal: {
              ...student.categoryTotal,
              [category.label]: (student.categoryTotal?.[category.label] || 0) + finalAmount
            },
            logs: [
              ...(student.logs || []),
              {
                type: category.label,
                points: finalAmount,
                timestamp: new Date().toISOString(),
                reason: customReason || category.description
              }
            ]
          };
        }
        return student;
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    // Play sound and show success
    playSound('xp');
    showToast(`Awarded ${finalAmount} XP to ${selectedStudents.size} student${selectedStudents.size > 1 ? 's' : ''}`);
    
    // Reset form
    setShowXPModal(false);
    setXpAmount(1);
    setCustomReason('');
    setSelectedStudents(new Set());
  };

  const handleAwardCoins = () => {
    if (selectedStudents.size === 0) {
      showToast('Please select at least one student');
      return;
    }

    setStudents(prevStudents => {
      const updatedStudents = prevStudents.map(student => {
        if (selectedStudents.has(student.id)) {
          return {
            ...student,
            currency: (student.currency || 0) + coinAmount,
            logs: [
              ...(student.logs || []),
              {
                type: 'Coin Award',
                points: coinAmount,
                timestamp: new Date().toISOString(),
                reason: customReason || 'Bonus coins awarded'
              }
            ]
          };
        }
        return student;
      });
      
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    playSound('coin');
    showToast(`Awarded ${coinAmount} coin${coinAmount > 1 ? 's' : ''} to ${selectedStudents.size} student${selectedStudents.size > 1 ? 's' : ''}`);
    
    setShowCoinModal(false);
    setCoinAmount(1);
    setCustomReason('');
    setSelectedStudents(new Set());
  };

  // ===============================================
  // STUDENT CARD COMPONENT
  // ===============================================

  const StudentCard = ({ student, isSelected, onToggleSelect }) => {
    const coins = calculateCoins(student);
    const currentLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
    const progressToNext = (student.totalPoints || 0) % 100;
    const progressPercentage = (progressToNext / 100) * 100;
    const needsPet = shouldReceivePet(student);
    
    // Get equipped pet (first owned pet)
    const equippedPet = student.ownedPets?.[0];
    
    return (
      <div 
        className={`
          relative bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105
          border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
          ${needsPet ? 'ring-2 ring-orange-300 border-orange-300' : ''}
          p-3 cursor-pointer group
        `}
        onClick={() => setShowCharacterSheet(student)}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(student.id);
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Pet Needed Badge */}
        {needsPet && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            🐾 Pet!
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-3">
          <div 
            className="relative group cursor-pointer"
            onMouseEnter={(e) => handleImageHover(e, {
              image: student.avatar || getAvatarImage(student.avatarBase || 'Wizard F', currentLevel),
              name: `${student.firstName} (Level ${currentLevel})`,
              type: 'avatar'
            })}
            onMouseLeave={hidePreview}
          >
            <img 
              src={student.avatar || getAvatarImage(student.avatarBase || 'Wizard F', currentLevel)}
              alt={`${student.firstName}'s Avatar`}
              className="w-16 h-16 rounded-full border-3 border-blue-400 shadow-lg group-hover:border-blue-600 transition-all"
              onError={(e) => {
                console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
                e.target.src = '/Avatars/Wizard F/Level 1.png';
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
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pet Section */}
        {equippedPet && (
          <div className="flex items-center justify-center">
            <div 
              className="relative cursor-pointer"
              onMouseEnter={(e) => handleImageHover(e, {
                image: equippedPet.image,
                name: equippedPet.name,
                type: 'pet'
              })}
              onMouseLeave={hidePreview}
            >
              <img 
                src={equippedPet.image}
                alt={equippedPet.name}
                className="w-8 h-8 rounded-lg border border-gray-300 hover:border-purple-400 transition-colors"
                onError={(e) => {
                  console.warn(`Pet image failed to load: ${e.target.src}`);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===============================================
  // RENDER MAIN COMPONENT
  // ===============================================

  return (
    <div className="animate-fade-in p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="text-3xl mr-3">👨‍🎓</span>
            Students ({students.length})
          </h2>
          <p className="text-gray-600 mt-1">Click students to view character sheets • Hover over avatars and pets for previews</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            onClick={() => setShowCategoryEditor(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            ⚙️ Edit Categories
          </button>
          
          <button
            onClick={selectedStudents.size > 0 ? deselectAllStudents : selectAllStudents}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            {selectedStudents.size > 0 ? '❌ Deselect All' : '✅ Select All'}
          </button>
          
          <button
            onClick={() => setShowXPModal(true)}
            disabled={selectedStudents.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            ⭐ Award XP ({selectedStudents.size})
          </button>
          
          <button
            onClick={() => setShowCoinModal(true)}
            disabled={selectedStudents.size === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            🪙 Award Coins ({selectedStudents.size})
          </button>
        </div>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">👨‍🎓</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Yet</h3>
          <p className="text-gray-500">Add students to your class to get started!</p>
        </div>
      ) : (
        <div className={`${getGridClasses(students.length)} mb-6`}>
          {students.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.has(student.id)}
              onToggleSelect={toggleStudentSelection}
            />
          ))}
        </div>
      )}

      {/* Hover Preview */}
      {hoverPreview.show && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ 
            left: `${hoverPreview.x}px`, 
            top: `${hoverPreview.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 max-w-xs">
            <img 
              src={hoverPreview.image}
              alt={hoverPreview.name}
              className="w-32 h-32 mx-auto rounded-lg border border-gray-300 mb-2"
            />
            <h4 className="text-center font-bold text-gray-800">{hoverPreview.name}</h4>
            <p className="text-center text-sm text-gray-600 capitalize">{hoverPreview.type}</p>
          </div>
        </div>
      )}

      {/* XP Award Modal */}
      {showXPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Award XP Points</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {xpCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.label} ({category.amount} XP)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">XP Amount</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={xpAmount}
                  onChange={(e) => setXpAmount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Reason (Optional)</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter custom reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAwardXP}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Award XP
              </button>
              <button
                onClick={() => setShowXPModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin Award Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Award Coins</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Coin Amount</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason (Optional)</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter reason for coins..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAwardCoins}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                Award Coins
              </button>
              <button
                onClick={() => setShowCoinModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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
          <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl p-8 max-w-md w-full mx-4 text-white text-center">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h3 className="text-3xl font-bold mb-2">LEVEL UP!</h3>
            <p className="text-xl mb-4">{levelUpData.student.firstName} reached Level {levelUpData.newLevel}!</p>
            <img 
              src={getAvatarImage(levelUpData.student.avatarBase, levelUpData.newLevel)}
              alt="New Avatar"
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
            <button
              onClick={() => setLevelUpData(null)}
              className="bg-white text-orange-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Pet Unlock Modal */}
      {petUnlockData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 rounded-xl p-8 max-w-md w-full mx-4 text-white text-center">
            <div className="text-6xl mb-4 animate-bounce">🐾</div>
            <h3 className="text-3xl font-bold mb-2">PET UNLOCKED!</h3>
            <p className="text-xl mb-4">{petUnlockData.student.firstName} earned their first pet!</p>
            <img 
              src={petUnlockData.pet.image}
              alt={petUnlockData.pet.name}
              className="w-16 h-16 rounded-lg mx-auto mb-4 border-4 border-white shadow-lg"
            />
            <p className="text-lg font-semibold">{petUnlockData.pet.name}</p>
            <button
              onClick={() => setPetUnlockData(null)}
              className="bg-white text-blue-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors mt-4"
            >
              Amazing!
            </button>
          </div>
        </div>
      )}

      {/* Category Editor Modal */}
      {showCategoryEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit XP Categories</h3>
              <button
                onClick={() => setShowCategoryEditor(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              {xpCategories.map((category, index) => (
                <div key={category.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={category.label}
                      onChange={(e) => {
                        const newCategories = [...xpCategories];
                        newCategories[index].label = e.target.value;
                        setXpCategories(newCategories);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={category.amount}
                      onChange={(e) => {
                        const newCategories = [...xpCategories];
                        newCategories[index].amount = parseInt(e.target.value);
                        setXpCategories(newCategories);
                      }}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (xpCategories.length > 1) {
                        setXpCategories(xpCategories.filter((_, i) => i !== index));
                      }
                    }}
                    disabled={xpCategories.length <= 1}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const newId = Math.max(...xpCategories.map(c => c.id)) + 1;
                  setXpCategories([
                    ...xpCategories,
                    {
                      id: newId,
                      label: 'New Category',
                      amount: 1,
                      color: 'bg-blue-500',
                      icon: '⭐',
                      description: 'New behavior category'
                    }
                  ]);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add Category
              </button>
              
              <button
                onClick={() => {
                  showToast('XP categories updated successfully!');
                  setShowCategoryEditor(false);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              
              <button
                onClick={() => {
                  setXpCategories(DEFAULT_XP_CATEGORIES);
                  setShowCategoryEditor(false);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Sheet Modal */}
      <CharacterSheetModal
        student={showCharacterSheet}
        isOpen={!!showCharacterSheet}
        onClose={() => setShowCharacterSheet(null)}
        onUpdateStudent={(updatedStudent) => {
          setStudents(prevStudents => {
            const updatedStudents = prevStudents.map(student => 
              student.id === updatedStudent.id ? updatedStudent : student
            );
            saveStudentsToFirebase(updatedStudents);
            return updatedStudents;
          });
        }}
        showToast={showToast}
      />
    </div>
  );
};

export default StudentsTab;