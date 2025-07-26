// utils/studentsUtils.js - Utility functions for Students Tab
// This file provides helper functions for student management

// ===============================================
// AVATAR AND LEVEL UTILITIES
// ===============================================

export const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return '/Avatars/Wizard F/Level 1.png';
  }
  
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  const imagePath = `/Avatars/${avatarBase}/Level ${validLevel}.png`;
  
  return imagePath;
};

export const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;
  if (totalXP >= 200) return 3;  
  if (totalXP >= 100) return 2;
  return 1;
};

// ===============================================
// CURRENCY AND REWARDS UTILITIES
// ===============================================

export const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / 5);
  const bonusCoins = student?.currency || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

export const shouldReceivePet = (student) => {
  return (student?.totalPoints || 0) >= 50 && (!student?.ownedPets || student.ownedPets.length === 0);
};

// ===============================================
// GRID LAYOUT UTILITIES
// ===============================================

export const getGridClasses = (studentCount) => {
  if (studentCount <= 4) return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
  if (studentCount <= 8) return 'grid grid-cols-2 lg:grid-cols-4 gap-3';
  if (studentCount <= 12) return 'grid grid-cols-3 lg:grid-cols-6 gap-3';
  if (studentCount <= 20) return 'grid grid-cols-4 lg:grid-cols-8 gap-2';
  return 'grid grid-cols-5 lg:grid-cols-10 gap-1';
};

// ===============================================
// SOUND UTILITIES (simplified - no fake files)
// ===============================================

export const playSound = (soundType, volume = 0.7) => {
  // Simple console log instead of fake audio files
  console.log(`Sound would play: ${soundType}`);
  // If you have actual sound files later, you can add them here
};

// ===============================================
// DATA VALIDATION UTILITIES
// ===============================================

export const validateStudentData = (student) => {
  const validStudent = {
    id: student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName: student.firstName || 'Student',
    lastName: student.lastName || '',
    totalPoints: student.totalPoints || 0,
    currency: student.currency || 0,
    coinsSpent: student.coinsSpent || 0,
    avatarBase: student.avatarBase || 'Wizard F',
    avatarLevel: student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0),
    avatar: student.avatar || getAvatarImage(student.avatarBase || 'Wizard F', calculateAvatarLevel(student.totalPoints || 0)),
    ownedAvatars: student.ownedAvatars || [student.avatarBase || 'Wizard F'],
    ownedPets: student.ownedPets || [],
    inventory: student.inventory || [],
    logs: student.logs || [],
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    rewardsPurchased: student.rewardsPurchased || [],
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  return validStudent;
};

// ===============================================
// PET DATA UTILITIES (use existing pet data)
// ===============================================

export const getRandomPet = () => {
  // Simple default pet - will be replaced with actual pet system later
  return {
    id: `pet_${Date.now()}`,
    name: 'Companion Pet',
    image: '/shop/BasicPets/GoblinPet.png', // Use existing image
    speed: 3,
    rarity: 'common'
  };
};

// ===============================================
// XP AWARD UTILITIES
// ===============================================

export const awardXPToStudent = (student, amount, category, reason) => {
  const newTotalXP = (student.totalPoints || 0) + amount;
  const oldLevel = calculateAvatarLevel(student.totalPoints || 0);
  const newLevel = calculateAvatarLevel(newTotalXP);
  
  const updatedStudent = {
    ...student,
    totalPoints: newTotalXP,
    avatarLevel: newLevel,
    avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
    categoryTotal: {
      ...student.categoryTotal,
      [category]: (student.categoryTotal?.[category] || 0) + amount
    },
    logs: [
      ...(student.logs || []),
      {
        type: category,
        points: amount,
        timestamp: new Date().toISOString(),
        reason: reason || `Awarded ${category} points`
      }
    ],
    lastUpdated: new Date().toISOString()
  };

  // Check if student should receive a pet
  if (shouldReceivePet(updatedStudent)) {
    const randomPet = getRandomPet();
    updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), randomPet];
  }

  return {
    student: updatedStudent,
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel,
    receivedPet: shouldReceivePet(student) && newTotalXP >= 50
  };
};

// ===============================================
// EXPORT ALL UTILITIES
// ===============================================

export default {
  getAvatarImage,
  calculateAvatarLevel,
  calculateCoins,
  shouldReceivePet,
  getGridClasses,
  playSound,
  validateStudentData,
  getRandomPet,
  awardXPToStudent
};