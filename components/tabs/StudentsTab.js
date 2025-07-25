// components/tabs/StudentsTab.js - FIXED COMPLETE IMPLEMENTATION
import React, { useState, useEffect } from 'react';

// Constants
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

// Utility Functions
const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return '/avatars/Wizard%20F/Level%201.png';
  }
  
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  // Fix: Use lowercase 'avatars' and URL encode spaces
  const encodedAvatarBase = avatarBase.replaceAll(" ", "%20");
  const imagePath = `/avatars/${encodedAvatarBase}/Level%20${validLevel}.png`;
  
  console.log(`Loading avatar: ${avatarBase} Level ${validLevel} -> ${imagePath}`);
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

// Main Component
const StudentsTab = ({ 
  students, 
  setStudents,
  selectedStudent,
  setSelectedStudent,
  selectedStudents = [],
  setSelectedStudents,
  toggleStudentSelection,
  selectAllStudents,
  clearSelection,
  awardXP,
  awardBulkXP,
  awardCoins,
  awardBulkCoins,
  addStudent,
  fixAllStudentData,
  showAddStudentModal,
  setShowAddStudentModal,
  levelUpData,
  setLevelUpData,
  petUnlockData,
  setPetUnlockData,
  saveStudentsToFirebase,
  showToast = () => {},
  showSuccessToast = () => {},
  showErrorToast = () => {},
  showWarningToast = () => {},
  currentClassId,
  user
}) => {
  // State
  const [xpCategories, setXpCategories] = useState(DEFAULT_XP_CATEGORIES);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showBulkCoinsModal, setShowBulkCoinsModal] = useState(false);
  const [bulkCoinAmount, setBulkCoinAmount] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [showXPCategoryEditor, setShowXPCategoryEditor] = useState(false);
  
  // Image preview state
  const [previewImage, setPreviewImage] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

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

  // Grid calculation
  const gridClasses = getGridClasses(sortedStudents.length);

  // Handle avatar hover
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

  // XP Award Function
  const handleAwardXP = async (studentId, amount, category) => {
    try {
      await awardXP(studentId, amount, category);
      
      // Check for level up
      const student = safeStudents.find(s => s.id === studentId);
      if (student) {
        const newXP = (student.totalPoints || 0) + amount;
        const oldLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
        const newLevel = calculateAvatarLevel(newXP);
        
        if (newLevel > oldLevel) {
          setLevelUpData({
            student: { ...student, totalPoints: newXP, avatarLevel: newLevel },
            oldLevel,
            newLevel
          });
        }
        
        // Check for pet unlock
        if (newXP >= 50 && (!student.ownedPets || student.ownedPets.length === 0)) {
          setPetUnlockData({
            student: { ...student, totalPoints: newXP }
          });
        }
      }
      
      showSuccessToast(`${amount} XP awarded for ${category}!`);
    } catch (error) {
      showErrorToast('Failed to award XP');
    }
  };

  // Fix student data function
  const handleFixData = () => {
    try {
      const fixedStudents = safeStudents.map(student => {
        const totalXP = student.totalPoints || 0;
        const correctLevel = calculateAvatarLevel(totalXP);
        const avatarBase = student.avatarBase || 'Wizard F';
        
        return {
          ...student,
          avatarLevel: correctLevel,
          avatarBase: avatarBase,
          avatar: getAvatarImage(avatarBase, correctLevel),
          currency: student.currency || 0,
          ownedAvatars: student.ownedAvatars || [avatarBase],
          ownedPets: student.ownedPets || [],
          lastUpdated: new Date().toISOString()
        };
      });
      
      setStudents(fixedStudents);
      saveStudentsToFirebase(fixedStudents);
      showSuccessToast('Student data fixed successfully!');
    } catch (error) {
      showErrorToast('Failed to fix student data');
    }
  };

  // Student Card Component
  const StudentCard = ({ student, isSelected, onToggleSelect }) => {
    const coins = calculateCoins(student);
    const currentLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
    const progressToNext = (student.totalPoints || 0) % 100;
    const progressPercentage = (progressToNext / 100) * 100;
    const needsPet = shouldReceivePet(student);
    
    // Get equipped pet
    const equippedPet = student.ownedPets?.[0];
    
    return (
      <div 
        className={`
          relative bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105
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
            onMouseEnter={(e) => handleAvatarHover(e, student)}
            onMouseLeave={hidePreview}
          >
            <img 
              src={student.avatar || getAvatarImage(student.avatarBase || 'Wizard F', currentLevel)}
              alt={`${student.firstName}'s Avatar`}
              className="w-16 h-16 rounded-full border-3 border-blue-400 shadow-lg group-hover:border-blue-600 transition-all"
              onError={(e) => {
                console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
                e.target.src = '/avatars/Wizard%20F/Level%201.png';
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
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pet Section */}
        {equippedPet && (
          <div className="flex justify-center mb-3">
            <div 
              className="relative cursor-pointer"
              onMouseEnter={(e) => handlePetHover(e, equippedPet, student)}
              onMouseLeave={hidePreview}
            >
              <img 
                src={equippedPet.image}
                alt={equippedPet.name}
                className="w-8 h-8 rounded-full border-2 border-green-400 shadow-md hover:border-green-600 transition-all"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowXPModal(student);
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded font-semibold transition-colors"
          >
            +1 XP
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAwardCoins(student.id, 5);
            }}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 rounded font-semibold transition-colors"
          >
            +5 🪙
          </button>
        </div>
      </div>
    );
  };

  // Bulk action functions
  const handleBulkXP = () => {
    if (selectedStudents.length === 0) {
      showWarningToast('Please select students first');
      return;
    }
    setShowXPModal({ bulk: true, studentIds: selectedStudents });
  };

  const handleBulkCoins = () => {
    if (selectedStudents.length === 0) {
      showWarningToast('Please select students first');
      return;
    }
    setShowBulkCoinsModal(true);
  };

  const handleAwardCoins = async (studentId, amount) => {
    try {
      await awardCoins(studentId, amount);
      showSuccessToast(`${amount} coins awarded!`);
    } catch (error) {
      showErrorToast('Failed to award coins');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold">
              👥 Class Champions
            </h2>
            <p className="text-blue-100 mt-1">
              {safeStudents.length} students • {selectedStudents.length} selected
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Student</span>
            </button>
            
            <button
              onClick={handleFixData}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>🔧</span>
              <span>Fix Data</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{safeStudents.length}</div>
            <div className="text-sm text-blue-100">Total Students</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {safeStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
            </div>
            <div className="text-sm text-blue-100">Total XP</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {safeStudents.reduce((sum, s) => sum + calculateCoins(s), 0)}
            </div>
            <div className="text-sm text-blue-100">Total Coins</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {safeStudents.filter(s => s.ownedPets?.length > 0).length}
            </div>
            <div className="text-sm text-blue-100">Have Pets</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search and Filter */}
          <div className="flex space-x-4 flex-1">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
          </div>

          {/* Selection Controls */}
          <div className="flex space-x-2">
            <button
              onClick={selectAllStudents}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Selection
            </button>
          </div>

          {/* Bulk Actions */}
          {selectedStudents.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={handleBulkXP}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <span>⭐</span>
                <span>Award XP ({selectedStudents.length})</span>
              </button>
              <button
                onClick={handleBulkCoins}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
              >
                <span>🪙</span>
                <span>Award Coins ({selectedStudents.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Students Grid */}
      {sortedStudents.length > 0 ? (
        <div className={gridClasses}>
          {sortedStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onToggleSelect={toggleStudentSelection}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            {searchTerm || filterLevel !== 'all' ? 'No students match your filters' : 'No Students Yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterLevel !== 'all' 
              ? 'Try adjusting your search or filter settings' 
              : 'Add your first student to get started!'
            }
          </p>
          {(!searchTerm && filterLevel === 'all') && (
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Add Your First Student
            </button>
          )}
        </div>
      )}

      {/* Image Preview */}
      {previewImage && (
        <div 
          className="fixed z-50 pointer-events-none animate-fade-in"
          style={{ 
            left: previewPosition.x, 
            top: previewPosition.y,
            zIndex: 9999
          }}
        >
          <div className="bg-white border-3 border-blue-300 rounded-xl shadow-2xl p-4 max-w-xs">
            <img
              src={previewImage.src}
              alt={previewImage.name}
              className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 mx-auto"
            />
            <div className="text-center mt-2">
              <div className="font-bold text-gray-800">{previewImage.name}</div>
              {previewImage.level && (
                <div className="text-sm text-gray-600">Level {previewImage.level}</div>
              )}
              {previewImage.owner && (
                <div className="text-sm text-gray-600">{previewImage.owner}'s Pet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* XP Award Modal */}
      {showXPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {showXPModal.bulk ? `Award XP to ${selectedStudents.length} Students` : `Award XP to ${showXPModal.firstName}`}
            </h3>
            
            <div className="space-y-3">
              {xpCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    if (showXPModal.bulk) {
                      selectedStudents.forEach(id => handleAwardXP(id, category.amount, category.label));
                    } else {
                      handleAwardXP(showXPModal.id, category.amount, category.label);
                    }
                    setShowXPModal(false);
                  }}
                  className={`w-full p-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2 ${category.color}`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label} (+{category.amount} XP)</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowXPModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk Coins Modal */}
      {showBulkCoinsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Award Coins to {selectedStudents.length} Students</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coin Amount
              </label>
              <input
                type="number"
                value={bulkCoinAmount}
                onChange={(e) => setBulkCoinAmount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  selectedStudents.forEach(id => handleAwardCoins(id, bulkCoinAmount));
                  setShowBulkCoinsModal(false);
                }}
                className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-medium"
              >
                Award {bulkCoinAmount} Coins
              </button>
              <button
                onClick={() => setShowBulkCoinsModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Character Sheet Modal Placeholder */}
      {showCharacterSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">{showCharacterSheet.firstName}'s Character Sheet</h3>
              <button
                onClick={() => setShowCharacterSheet(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-gray-600">Character sheet functionality will be implemented here</p>
              <p className="text-sm text-gray-500 mt-2">This will show stats, inventory, pets, and avatar customization</p>
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
              onError={(e) => {
                e.target.src = '/avatars/Wizard%20F/Level%201.png';
              }}
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
            <div className="text-4xl mb-4">🐕</div>
            <button
              onClick={() => setPetUnlockData(null)}
              className="bg-white text-blue-500 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Amazing!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;