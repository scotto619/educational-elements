// ==================================================
// PHASE 2: AVATAR LOADING & STUDENT DATA FIXES - FIXED VERSION
// ==================================================

// ADD THIS IMPORT AT THE TOP - THIS WAS MISSING!
import React, { useState, useEffect } from 'react';

// 1. FIXED AVATAR IMAGE LOADING FUNCTION
const getAvatarImage = (avatarBase, level) => {
  // Handle missing or undefined avatarBase
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return '/Avatars/Wizard F/Level 1.png'; // Default fallback
  }
  
  // Ensure level is valid (1-4)
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  
  // Construct the path - this should match your folder structure exactly
  const imagePath = `/Avatars/${avatarBase}/Level ${validLevel}.png`;
  
  console.log(`Loading avatar: ${avatarBase} Level ${validLevel} -> ${imagePath}`);
  
  return imagePath;
};

// 2. FIXED AVATAR LEVEL CALCULATION
const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;  // Level 4: 300+ XP
  if (totalXP >= 200) return 3;  // Level 3: 200-299 XP  
  if (totalXP >= 100) return 2;  // Level 2: 100-199 XP
  return 1;                      // Level 1: 0-99 XP
};

// 3. STUDENT DATA MIGRATION & FIXES
const migrateStudentData = (student) => {
  const totalXP = student.totalPoints || 0;
  const correctLevel = calculateAvatarLevel(totalXP);
  
  return {
    ...student,
    // Ensure all required fields exist
    id: student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName: student.firstName || 'Student',
    lastName: student.lastName || '',
    totalPoints: totalXP,
    currency: student.currency || 0, // Fix missing coins
    
    // Fix avatar data
    avatarLevel: correctLevel,
    avatarBase: student.avatarBase || 'Wizard F', // Default if missing
    avatar: getAvatarImage(student.avatarBase || 'Wizard F', correctLevel),
    
    // Ensure arrays exist
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : ['Wizard F']),
    ownedPets: student.ownedPets || (student.pet ? [{
      id: `migrated_pet_${Date.now()}`,
      name: student.pet.name || 'Companion',
      image: student.pet.image,
      type: 'migrated'
    }] : []),
    rewardsPurchased: student.rewardsPurchased || [],
    
    // Quest and behavior tracking
    questsCompleted: student.questsCompleted || [],
    behaviorPoints: student.behaviorPoints || {
      respectful: 0,
      responsible: 0,
      safe: 0,
      learner: 0
    },
    
    // Timestamps
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
};

// 4. BULK STUDENT FIXES FUNCTION
const fixAllStudentLevels = (students, saveFunction) => {
  console.log('🔧 Starting student data fixes...');
  
  const fixedStudents = students.map(student => {
    const totalXP = student.totalPoints || 0;
    const correctLevel = calculateAvatarLevel(totalXP);
    
    // Fix avatar if it's missing or incorrect
    let fixedAvatarBase = student.avatarBase;
    if (!fixedAvatarBase) {
      // Assign a random avatar if missing
      const AVAILABLE_AVATARS = ['Wizard F', 'Wizard M', 'Knight F', 'Knight M', 'Archer F', 'Archer M'];
      fixedAvatarBase = AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
      console.log(`🎭 Assigned random avatar to ${student.firstName}: ${fixedAvatarBase}`);
    }
    
    const updatedStudent = migrateStudentData({
      ...student,
      avatarBase: fixedAvatarBase,
      avatarLevel: correctLevel,
      avatar: getAvatarImage(fixedAvatarBase, correctLevel)
    });
    
    // Log the fix
    if (student.avatarLevel !== correctLevel) {
      console.log(`📊 Fixed ${student.firstName}: ${totalXP} XP -> Level ${correctLevel} (was Level ${student.avatarLevel || 'undefined'})`);
    }
    
    return updatedStudent;
  });
  
  // Save the fixes
  if (saveFunction) {
    saveFunction(fixedStudents);
  }
  
  console.log('✅ Student data fixes complete!');
  return fixedStudents;
};

// 5. STUDENT DISPLAY COMPONENT WITH COINS & IMPROVED VISUALS
const StudentCard = ({ student, onAwardXP, onViewDetails, onEditCoins }) => {
  const [showPetPreview, setShowPetPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const handlePetHover = (event, pet) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShowPetPreview(pet);
  };

  const handlePetLeave = () => {
    setShowPetPreview(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-2 border-blue-100 hover:border-blue-300">
      {/* Student Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar with Error Handling */}
          <div className="relative">
            <img 
              src={student.avatar || getAvatarImage(student.avatarBase, student.avatarLevel)}
              alt={`${student.firstName}'s Avatar`}
              className="w-16 h-16 rounded-full border-3 border-gold-400 shadow-lg"
              onError={(e) => {
                console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
                e.target.src = '/Avatars/Wizard F/Level 1.png'; // Fallback
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              L{student.avatarLevel || 1}
            </div>
          </div>
          
          {/* Student Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {student.firstName} {student.lastName}
            </h3>
            <div className="flex items-center space-x-3 text-sm">
              <span className="text-blue-600 font-semibold">
                ⭐ {student.totalPoints || 0} XP
              </span>
              <span className="text-yellow-600 font-semibold">
                🪙 {student.currency || 0} Coins
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onAwardXP(student)}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
          >
            +XP
          </button>
          <button
            onClick={() => onEditCoins(student)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
          >
            +🪙
          </button>
          <button
            onClick={() => onViewDetails(student)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
          >
            View
          </button>
        </div>
      </div>

      {/* Pet Display with Hover Preview */}
      {student.ownedPets && student.ownedPets.length > 0 && (
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-sm font-semibold text-gray-600">Pets:</span>
          <div className="flex space-x-1">
            {student.ownedPets.slice(0, 3).map((pet, index) => (
              <div
                key={pet.id || index}
                className="relative"
                onMouseEnter={(e) => handlePetHover(e, pet)}
                onMouseLeave={handlePetLeave}
              >
                <img
                  src={pet.image}
                  alt={pet.name}
                  className="w-8 h-8 rounded-full border-2 border-purple-300 hover:border-purple-500 cursor-pointer transition-all"
                />
              </div>
            ))}
            {student.ownedPets.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                +{student.ownedPets.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pet Preview Modal */}
      {showPetPreview && (
        <div 
          className="fixed z-50 bg-white border-2 border-purple-300 rounded-lg p-3 shadow-xl"
          style={{ 
            left: previewPosition.x, 
            top: previewPosition.y,
            transform: 'translateY(-50%)'
          }}
        >
          <img
            src={showPetPreview.image}
            alt={showPetPreview.name}
            className="w-16 h-16 rounded-lg mx-auto mb-2"
          />
          <p className="text-sm font-semibold text-center text-gray-800">
            {showPetPreview.name}
          </p>
        </div>
      )}

      {/* XP Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress to Level {(student.avatarLevel || 1) + 1}</span>
          <span>{student.totalPoints || 0} / {(student.avatarLevel || 1) * 100}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, ((student.totalPoints || 0) % 100))}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// 6. COIN MANAGEMENT MODAL
const CoinEditModal = ({ student, isOpen, onClose, onSave }) => {
  const [coinAmount, setCoinAmount] = useState(0);
  const [operation, setOperation] = useState('add'); // 'add' or 'set'

  useEffect(() => {
    if (isOpen && student) {
      setCoinAmount(0);
      setOperation('add');
    }
  }, [isOpen, student]);

  const handleSave = () => {
    const currentCoins = student.currency || 0;
    const newCoinTotal = operation === 'add' 
      ? currentCoins + coinAmount 
      : coinAmount;
    
    onSave(student.id, Math.max(0, newCoinTotal));
    onClose();
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 max-w-90vw">
        <h3 className="text-xl font-bold mb-4 text-center">
          🪙 Manage Coins for {student.firstName}
        </h3>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">Current Coins: <span className="font-bold text-yellow-600">{student.currency || 0}</span></p>
          
          <div className="flex space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="add"
                checked={operation === 'add'}
                onChange={(e) => setOperation(e.target.value)}
                className="mr-2"
              />
              Add Coins
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="set"
                checked={operation === 'set'}
                onChange={(e) => setOperation(e.target.value)}
                className="mr-2"
              />
              Set Total
            </label>
          </div>

          <input
            type="number"
            min="0"
            value={coinAmount}
            onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg"
            placeholder="Enter amount"
          />
          
          <p className="text-sm text-gray-600 mt-2 text-center">
            New Total: <span className="font-bold text-yellow-600">
              {operation === 'add' 
                ? (student.currency || 0) + coinAmount 
                : coinAmount
              } coins
            </span>
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Export all the fixes
export {
  getAvatarImage,
  calculateAvatarLevel,
  migrateStudentData,
  fixAllStudentLevels,
  StudentCard,
  CoinEditModal
};