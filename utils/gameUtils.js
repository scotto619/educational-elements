// utils/gameUtils.js - Game Logic and Utility Functions
import { validateStudentData } from './errorHandling';
import { getPetImage as resolvePetImageSource, DEFAULT_PET_IMAGE } from './gameHelpers';
import { normalizeImageSource } from './imageFallback';

// ===============================================
// AVATAR MANAGEMENT
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
  if (totalXP >= 300) return 4;  // Level 4: 300+ XP
  if (totalXP >= 200) return 3;  // Level 3: 200-299 XP  
  if (totalXP >= 100) return 2;  // Level 2: 100-199 XP
  return 1;                      // Level 1: 0-99 XP
};

export const getRandomAvatar = () => {
  const AVAILABLE_AVATARS = [
    'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M',
    'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M',
    'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M',
    'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M',
    'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M',
    'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M',
    'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M'
  ];
  
  return AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
};

export const studentOwnsAvatar = (student, avatarBase) => {
  return (student.ownedAvatars || []).includes(avatarBase);
};

// ===============================================
// PET MANAGEMENT
// ===============================================

export const getPetImage = (petType) => {
  return `/Pets/${petType}.png`;
};

export const getRandomPet = () => {
  const AVAILABLE_PETS = [
    'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight',
    'Crystal Sage', 'Dream', 'Druid', 'Engineer', 'Frost Mage', 'Illusionist',
    'Knight', 'Lightning', 'Monk', 'Necromancer', 'Orc', 'Paladin', 'Rogue',
    'Stealth', 'Time Knight', 'Warrior'
  ];
  
  return AVAILABLE_PETS[Math.floor(Math.random() * AVAILABLE_PETS.length)];
};

export const getRandomPetName = (petType) => {
  const PET_NAMES = {
    'Alchemist': ['Bubbles', 'Flask', 'Potion', 'Brew', 'Mix'],
    'Barbarian': ['Crush', 'Smash', 'Rage', 'Storm', 'Fury'],
    'Bard': ['Melody', 'Harmony', 'Song', 'Tune', 'Note'],
    'Beastmaster': ['Wild', 'Hunter', 'Scout', 'Track', 'Nature'],
    'Cleric': ['Light', 'Hope', 'Faith', 'Grace', 'Heal'],
    'Crystal Knight': ['Prism', 'Crystal', 'Shine', 'Gleam', 'Sparkle'],
    'Crystal Sage': ['Wisdom', 'Insight', 'Truth', 'Vision', 'Oracle'],
    'Dream': ['Luna', 'Star', 'Night', 'Sleep', 'Fantasy'],
    'Druid': ['Forest', 'Grove', 'Branch', 'Leaf', 'Root'],
    'Engineer': ['Gear', 'Bolt', 'Steam', 'Copper', 'Iron'],
    'Frost Mage': ['Ice', 'Snow', 'Winter', 'Frost', 'Chill'],
    'Illusionist': ['Mirage', 'Trick', 'Magic', 'Phantom', 'Veil'],
    'Knight': ['Honor', 'Shield', 'Blade', 'Valor', 'Noble'],
    'Lightning': ['Spark', 'Bolt', 'Thunder', 'Storm', 'Flash'],
    'Monk': ['Peace', 'Zen', 'Calm', 'Spirit', 'Soul'],
    'Necromancer': ['Shadow', 'Bone', 'Spirit', 'Wraith', 'Void'],
    'Orc': ['Grunt', 'Bash', 'Thud', 'Rock', 'Stone'],
    'Paladin': ['Light', 'Justice', 'Divine', 'Sacred', 'Pure'],
    'Rogue': ['Shadow', 'Sneak', 'Quick', 'Silent', 'Swift'],
    'Stealth': ['Whisper', 'Silent', 'Hidden', 'Shade', 'Mist'],
    'Time Knight': ['Chrono', 'Tick', 'Clock', 'Time', 'Moment'],
    'Warrior': ['Steel', 'Iron', 'Brave', 'Strong', 'Might']
  };
  
  const names = PET_NAMES[petType] || ['Companion', 'Friend', 'Buddy', 'Pal', 'Mate'];
  return names[Math.floor(Math.random() * names.length)];
};

export const shouldReceivePet = (student) => {
  return (student.totalPoints || 0) >= 50 && (!student.ownedPets || student.ownedPets.length === 0);
};

export const createNewPet = () => {
  const petType = getRandomPet();
  const petName = getRandomPetName(petType);
  const petAsset = normalizeImageSource(resolvePetImageSource({ name: petName, type: petType }), DEFAULT_PET_IMAGE);

  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: petName,
    type: petType,
    image: petAsset.src,
    unlockedAt: new Date().toISOString(),
    level: 1,
    experience: 0,
    happiness: 100
  };
};

// ===============================================
// CURRENCY SYSTEM
// ===============================================

export const calculateCoins = (student) => {
  const xpCoins = Math.floor((student.totalPoints || 0) / 10); // 1 coin per 10 XP
  const bonusCoins = student.currency || 0;
  const spent = student.coinsSpent || 0;
  return Math.max(0, xpCoins + bonusCoins - spent);
};

export const canAfford = (student, price) => {
  const availableCoins = calculateCoins(student);
  return availableCoins >= price;
};

export const updateStudentWithCurrency = (student, coinsToSpend) => {
  if (!canAfford(student, coinsToSpend)) {
    throw new Error('Insufficient coins');
  }
  
  return {
    ...student,
    coinsSpent: (student.coinsSpent || 0) + coinsToSpend,
    lastUpdated: new Date().toISOString()
  };
};

// ===============================================
// STUDENT DATA MANAGEMENT
// ===============================================

export const migrateStudentData = (student) => {
  const totalXP = student.totalPoints || 0;
  const correctLevel = calculateAvatarLevel(totalXP);
  
  const migratedStudent = {
    ...student,
    // Ensure all required fields exist
    id: student.id || `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName: student.firstName || 'Student',
    lastName: student.lastName || '',
    totalPoints: totalXP,
    currency: student.currency || 0,
    
    // Fix avatar data
    avatarLevel: correctLevel,
    avatarBase: student.avatarBase || 'Wizard F',
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
      learner: 0,
      helper: 0,
      creative: 0
    },
    
    // Coin tracking
    coinsSpent: student.coinsSpent || 0,
    
    // Timestamps
    createdAt: student.createdAt || new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  // Validate the migrated data
  try {
    validateStudentData(migratedStudent);
  } catch (error) {
    console.warn('Student data validation failed:', error);
  }
  
  return migratedStudent;
};

export const calculateStudentStats = (student) => {
  const level = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
  const coins = calculateCoins(student);
  const xpToNextLevel = level < 4 ? (level * 100) - ((student.totalPoints || 0) % 100) : 0;
  
  return {
    level,
    totalXP: student.totalPoints || 0,
    coins,
    xpToNextLevel,
    ownedAvatarCount: (student.ownedAvatars || []).length,
    ownedPetCount: (student.ownedPets || []).length,
    questsCompletedCount: (student.questsCompleted || []).length,
    totalBehaviorPoints: Object.values(student.behaviorPoints || {}).reduce((sum, points) => sum + points, 0)
  };
};

export const calculateClassStats = (students) => {
  if (!Array.isArray(students) || students.length === 0) {
    return {
      totalStudents: 0,
      totalXP: 0,
      averageXP: 0,
      totalCoins: 0,
      averageCoins: 0,
      levelDistribution: { 1: 0, 2: 0, 3: 0, 4: 0 },
      topStudent: null
    };
  }
  
  const totalStudents = students.length;
  const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const totalCoins = students.reduce((sum, s) => sum + calculateCoins(s), 0);
  const averageXP = Math.round(totalXP / totalStudents);
  const averageCoins = Math.round(totalCoins / totalStudents);
  
  const levelDistribution = students.reduce((dist, student) => {
    const level = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
    dist[level] = (dist[level] || 0) + 1;
    return dist;
  }, { 1: 0, 2: 0, 3: 0, 4: 0 });
  
  const topStudent = [...students].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))[0];
  
  return {
    totalStudents,
    totalXP,
    averageXP,
    totalCoins,
    averageCoins,
    levelDistribution,
    topStudent
  };
};

// ===============================================
// SOUND MANAGEMENT
// ===============================================

export const playSound = (soundFile, volume = 0.3) => {
  try {
    const audio = new Audio(soundFile);
    audio.volume = volume;
    audio.play().catch(e => console.log('Sound play failed:', e));
  } catch (e) {
    console.log('Sound loading failed:', e);
  }
};

export const playXPSound = () => {
  playSound('/sounds/xp-gain.mp3', 0.3);
};

export const playLevelUpSound = () => {
  playSound('/sounds/level-up.mp3', 0.5);
};

export const playPetUnlockSound = () => {
  playSound('/sounds/pet-unlock.mp3', 0.4);
};

export const playCoinSound = () => {
  playSound('/sounds/coin.mp3', 0.3);
};

export const playSuccessSound = () => {
  playSound('/sounds/success.mp3', 0.4);
};

export const playErrorSound = () => {
  playSound('/sounds/error.mp3', 0.3);
};

// ===============================================
// QUEST MANAGEMENT
// ===============================================

export const createQuest = (questData) => {
  return {
    id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: questData.title || 'New Quest',
    description: questData.description || '',
    reward: questData.reward || { type: 'xp', amount: 5 },
    category: questData.category || 'general',
    difficulty: questData.difficulty || 'easy',
    completedBy: [],
    createdAt: new Date().toISOString(),
    isActive: true,
    ...questData
  };
};

export const completeQuestForStudent = (quest, studentId) => {
  if (!quest.completedBy.includes(studentId)) {
    return {
      ...quest,
      completedBy: [...quest.completedBy, studentId],
      lastUpdated: new Date().toISOString()
    };
  }
  return quest;
};

export const isQuestCompletedByStudent = (quest, studentId) => {
  return quest.completedBy.includes(studentId);
};

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch (error) {
    return 'Unknown Date';
  }
};

export const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return 'Unknown Date';
  }
};

export const generateId = (prefix = 'id') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getTimeAgo = (dateString) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch (error) {
    return 'Unknown time';
  }
};

// ===============================================
// EXPORT DEFAULT
// ===============================================

export default {
  // Avatar functions
  getAvatarImage,
  calculateAvatarLevel,
  getRandomAvatar,
  studentOwnsAvatar,
  
  // Pet functions
  getPetImage,
  getRandomPet,
  getRandomPetName,
  shouldReceivePet,
  createNewPet,
  
  // Currency functions
  calculateCoins,
  canAfford,
  updateStudentWithCurrency,
  
  // Student data functions
  migrateStudentData,
  calculateStudentStats,
  calculateClassStats,
  
  // Sound functions
  playSound,
  playXPSound,
  playLevelUpSound,
  playPetUnlockSound,
  playCoinSound,
  playSuccessSound,
  playErrorSound,
  
  // Quest functions
  createQuest,
  completeQuestForStudent,
  isQuestCompletedByStudent,
  
  // Utility functions
  formatDate,
  formatDateTime,
  generateId,
  clamp,
  randomBetween,
  shuffleArray,
  getTimeAgo
};