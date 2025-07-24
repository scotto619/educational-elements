// utils/gameUtils.js - PHASE 3: Consolidated Game Utility Functions
// This consolidates all the scattered utility functions from classroom-champions.js

import { 
  GAME_CONFIG, 
  PET_NAMES, 
  PET_SPECIES, 
  SOUND_FILES, 
  AVAILABLE_AVATARS 
} from '../constants/gameData';

// ===============================================
// STUDENT DATA UTILITIES
// ===============================================

export const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
    currency: student.currency || 0, // Ensure currency field exists
    inventory: student.inventory || [],
    lootBoxes: student.lootBoxes || [],
    achievements: student.achievements || [],
    lastXpDate: student.lastXpDate || null,
    ownedAvatars: student.ownedAvatars || (student.avatarBase ? [student.avatarBase] : []),
    ownedPets: student.ownedPets || (student.pet ? [{
      id: `migrated_pet_${Date.now()}`,
      name: student.pet.name || 'Companion',
      image: student.pet.image,
      type: 'migrated'
    }] : []),
    rewardsPurchased: student.rewardsPurchased || []
  };
};

export const calculateCoins = (student) => {
  const xpCoins = Math.floor((student?.totalPoints || 0) / GAME_CONFIG.COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  const coinsSpent = student?.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - coinsSpent);
};

export const canAfford = (student, price) => {
  return calculateCoins(student) >= price;
};

// ===============================================
// PET SYSTEM UTILITIES
// ===============================================

export const getRandomPet = () => {
  return PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
};

export const getRandomPetName = () => {
  return PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
};

export const calculatePetSpeed = (pet) => {
  const baseSpeed = pet?.speed || 1.0;
  const bonusSpeed = (pet?.wins || 0) * 0.1;
  const randomFactor = 0.8 + (Math.random() * 0.4);
  return Math.max(0.5, baseSpeed + bonusSpeed) * randomFactor;
};

// ===============================================
// AVATAR SYSTEM UTILITIES
// ===============================================

export const getRandomAvatar = () => {
  return AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
};

// ===============================================
// SOUND SYSTEM UTILITIES
// ===============================================

export const playSound = (soundType, volume = 0.7) => {
  try {
    const soundFile = SOUND_FILES[soundType];
    if (!soundFile) {
      console.warn(`Sound type ${soundType} not found`);
      return;
    }

    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play().catch(error => {
      console.log(`Could not play ${soundType} sound:`, error);
      // Fallback to system beep
      playSystemBeep();
    });
  } catch (error) {
    console.log('Audio not supported:', error);
    playSystemBeep();
  }
};

export const playXPSound = () => {
  try {
    // Create and play XP award sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Sound not available:', error);
  }
};

export const playSystemBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('System beep not available:', error);
  }
};

// ===============================================
// LOOT BOX UTILITIES
// ===============================================

export const generateLootBoxRewards = (boxType, lootBoxItems) => {
  const rewards = [];
  const numRewards = boxType === 'legendary_box' ? 3 : boxType === 'rare_box' ? 2 : 1;
  
  for (let i = 0; i < numRewards; i++) {
    const allItems = [...lootBoxItems.avatars, ...lootBoxItems.pets];
    const item = allItems[Math.floor(Math.random() * allItems.length)];
    rewards.push(item);
  }
  
  return rewards;
};

// ===============================================
// VALIDATION UTILITIES
// ===============================================

export const validateStudentData = (student) => {
  const errors = [];
  
  if (!student.id) errors.push('Student ID is required');
  if (!student.firstName?.trim()) errors.push('Student first name is required');
  if (typeof student.totalPoints !== 'number') errors.push('Total points must be a number');
  if (typeof student.avatarLevel !== 'number') errors.push('Avatar level must be a number');
  if (!student.avatarBase) errors.push('Avatar base is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateClassData = (classData) => {
  const errors = [];
  
  if (!classData.name?.trim()) errors.push('Class name is required');
  if (!Array.isArray(classData.students)) errors.push('Students must be an array');
  if (!classData.id) errors.push('Class ID is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===============================================
// DATA FORMATTING UTILITIES
// ===============================================

export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const formatXP = (xp) => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
};

export const formatCoins = (coins) => {
  if (coins >= 1000) {
    return `${(coins / 1000).toFixed(1)}k`;
  }
  return coins.toString();
};

// ===============================================
// ARRAY UTILITIES
// ===============================================

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomItems = (array, count) => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

// ===============================================
// DATE UTILITIES
// ===============================================

export const isToday = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  const date = dateString?.split('T')[0];
  return today === date;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// ===============================================
// LOCAL STORAGE UTILITIES (For client-side caching)
// ===============================================

export const saveToLocalStorage = (key, data) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (error) {
    console.warn('Could not save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
  } catch (error) {
    console.warn('Could not load from localStorage:', error);
  }
  return defaultValue;
};

export const removeFromLocalStorage = (key) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn('Could not remove from localStorage:', error);
  }
};

// ===============================================
// ANALYTICS UTILITIES
// ===============================================

export const calculateStudentStats = (student) => {
  const totalXP = student.totalPoints || 0;
  const level = student.avatarLevel || 1;
  const coins = calculateCoins(student);
  const ownedAvatars = student.ownedAvatars?.length || 0;
  const ownedPets = student.ownedPets?.length || 0;
  const questsCompleted = student.questsCompleted?.length || 0;
  
  return {
    totalXP,
    level,
    coins,
    ownedAvatars,
    ownedPets,
    questsCompleted,
    coinsSpent: student.coinsSpent || 0,
    averageXPPerDay: totalXP / Math.max(1, getDaysSinceCreation(student.createdAt))
  };
};

export const calculateClassStats = (students) => {
  if (!students.length) {
    return {
      totalStudents: 0,
      averageXP: 0,
      totalXP: 0,
      highestLevel: 0,
      totalCoins: 0
    };
  }

  const totalXP = students.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
  const totalCoins = students.reduce((sum, student) => sum + calculateCoins(student), 0);
  const highestLevel = Math.max(...students.map(student => student.avatarLevel || 1));
  
  return {
    totalStudents: students.length,
    averageXP: Math.round(totalXP / students.length),
    totalXP,
    highestLevel,
    totalCoins
  };
};

const getDaysSinceCreation = (createdAt) => {
  if (!createdAt) return 1;
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

// ===============================================
// ERROR HANDLING UTILITIES
// ===============================================

export const handleError = (error, context = 'Unknown') => {
  console.error(`Error in ${context}:`, error);
  
  // You can expand this to send errors to a logging service
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'Server'
  };
  
  // Future: Send to error tracking service
  // sendToErrorTracking(errorData);
  
  return errorData;
};

export const withErrorHandling = (fn, context = 'Function') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error; // Re-throw so the UI can handle it
    }
  };
};