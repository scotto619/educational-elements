// hooks/useStudentManagement.js - ENHANCED with All Required Functions for StudentsTab
import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

// Utility functions
const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) {
    console.warn('No avatarBase provided, using default Wizard F');
    return '/Avatars/Wizard F/Level 1.png';
  }
  
  const validLevel = Math.max(1, Math.min(level || 1, 4));
  const imagePath = `/Avatars/${avatarBase}/Level ${validLevel}.png`;
  
  console.log(`Loading avatar: ${avatarBase} Level ${validLevel} -> ${imagePath}`);
  return imagePath;
};

const calculateAvatarLevel = (totalXP) => {
  if (totalXP >= 300) return 4;  // Level 4: 300+ XP
  if (totalXP >= 200) return 3;  // Level 3: 200-299 XP  
  if (totalXP >= 100) return 2;  // Level 2: 100-199 XP
  return 1;                      // Level 1: 0-99 XP
};

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
};

const shouldReceivePet = (student) => {
  return (student.totalPoints || 0) >= 50 && (!student.ownedPets || student.ownedPets.length === 0);
};

const createNewPet = () => {
  const AVAILABLE_PETS = [
    'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight',
    'Crystal Sage', 'Dream', 'Druid', 'Engineer', 'Frost Mage', 'Illusionist',
    'Knight', 'Lightning', 'Monk', 'Necromancer', 'Orc', 'Paladin', 'Rogue',
    'Stealth', 'Time Knight', 'Warrior'
  ];
  
  const randomPet = AVAILABLE_PETS[Math.floor(Math.random() * AVAILABLE_PETS.length)];
  
  return {
    id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${randomPet} Companion`,
    type: randomPet,
    image: `/Pets/${randomPet}.png`,
    unlockedAt: new Date().toISOString()
  };
};

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

const playPetUnlockSound = () => {
  try {
    const audio = new Audio('/sounds/pet-unlock.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Sound play failed:', e));
  } catch (e) {
    console.log('Sound loading failed:', e);
  }
};

// Error handling wrapper
const withAsyncErrorHandling = (fn, operation = 'operation') => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`Error in ${operation}:`, error);
      throw error;
    }
  };
};

export const useStudentManagement = (user, currentClassId) => {
  // Core state
  const [students, setStudents] = useState([]);
  const [savingData, setSavingData] = useState(false);
  
  // Student selection state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Modal state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('');
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);

  // ===============================================
  // FIREBASE OPERATIONS
  // ===============================================

  const saveStudentsToFirebase = useCallback(withAsyncErrorHandling(async (studentsData) => {
    if (!user || !currentClassId) {
      throw new Error('User or class ID not available');
    }

    setSavingData(true);
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                students: studentsData,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } finally {
      setSavingData(false);
    }
  }, 'saveStudentsToFirebase'), [user, currentClassId]);

  // ===============================================
  // STUDENT SELECTION MANAGEMENT
  // ===============================================

  const toggleStudentSelection = useCallback((studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  }, []);

  const selectAllStudents = useCallback(() => {
    setSelectedStudents(students.map(s => s.id));
  }, [students]);

  const clearSelection = useCallback(() => {
    setSelectedStudents([]);
  }, []);

  // ===============================================
  // STUDENT CRUD OPERATIONS
  // ===============================================

  const addStudent = useCallback(withAsyncErrorHandling(async (studentData) => {
    const newStudent = migrateStudentData({
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...studentData,
      createdAt: new Date().toISOString()
    });

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    return newStudent;
  }, 'addStudent'), [students, saveStudentsToFirebase]);

  const removeStudent = useCallback(withAsyncErrorHandling(async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    return student;
  }, 'removeStudent'), [students, saveStudentsToFirebase]);

  const updateStudent = useCallback(withAsyncErrorHandling(async (studentId, updateData) => {
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            ...updateData, 
            lastUpdated: new Date().toISOString() 
          }
        : student
    );

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'updateStudent'), [students, saveStudentsToFirebase]);

  // ===============================================
  // XP MANAGEMENT
  // ===============================================

  const awardXP = useCallback(withAsyncErrorHandling(async (studentId, amount, category = 'general') => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const newTotalXP = (student.totalPoints || 0) + amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        const oldLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
        
        const updatedStudent = {
          ...student,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
          behaviorPoints: {
            ...student.behaviorPoints,
            [category.toLowerCase()]: (student.behaviorPoints?.[category.toLowerCase()] || 0) + amount
          },
          lastUpdated: new Date().toISOString()
        };

        // Check for level up
        if (newLevel > oldLevel) {
          playLevelUpSound();
          setLevelUpData({
            student: updatedStudent,
            oldLevel,
            newLevel
          });
        }

        // Check for pet unlock
        if (shouldReceivePet(updatedStudent)) {
          const newPet = createNewPet();
          updatedStudent.ownedPets = [newPet];
          playPetUnlockSound();
          setPetUnlockData({
            student: updatedStudent,
            pet: newPet
          });
        }

        return updatedStudent;
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    // Play XP sound
    playXPSound();
    
  }, 'awardXP'), [students, saveStudentsToFirebase]);

  const awardBulkXP = useCallback(withAsyncErrorHandling(async (studentIds, amount, category = 'general') => {
    let levelUps = [];
    let petUnlocks = [];

    const updatedStudents = students.map(student => {
      if (studentIds.includes(student.id)) {
        const newTotalXP = (student.totalPoints || 0) + amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        const oldLevel = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
        
        const updatedStudent = {
          ...student,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
          behaviorPoints: {
            ...student.behaviorPoints,
            [category.toLowerCase()]: (student.behaviorPoints?.[category.toLowerCase()] || 0) + amount
          },
          lastUpdated: new Date().toISOString()
        };

        if (newLevel > oldLevel) {
          levelUps.push({ student: updatedStudent, oldLevel, newLevel });
        }

        if (shouldReceivePet(updatedStudent)) {
          const newPet = createNewPet();
          updatedStudent.ownedPets = [newPet];
          petUnlocks.push({ student: updatedStudent, pet: newPet });
        }

        return updatedStudent;
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);

    // Play sounds
    playXPSound();
    if (levelUps.length > 0) {
      playLevelUpSound();
      setLevelUpData(levelUps[0]); // Show first level up
    }
    if (petUnlocks.length > 0) {
      playPetUnlockSound();
      setPetUnlockData(petUnlocks[0]); // Show first pet unlock
    }

  }, 'awardBulkXP'), [students, saveStudentsToFirebase]);

  const deductXP = useCallback(withAsyncErrorHandling(async (studentId, amount) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const newTotalXP = Math.max(0, (student.totalPoints || 0) - amount);
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        return {
          ...student,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(student.avatarBase || 'Wizard F', newLevel),
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'deductXP'), [students, saveStudentsToFirebase]);

  // ===============================================
  // COIN MANAGEMENT
  // ===============================================

  const awardCoins = useCallback(withAsyncErrorHandling(async (studentId, amount) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          currency: (student.currency || 0) + amount,
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'awardCoins'), [students, saveStudentsToFirebase]);

  const awardBulkCoins = useCallback(withAsyncErrorHandling(async (studentIds, amount) => {
    const updatedStudents = students.map(student => {
      if (studentIds.includes(student.id)) {
        return {
          ...student,
          currency: (student.currency || 0) + amount,
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'awardBulkCoins'), [students, saveStudentsToFirebase]);

  const spendCoins = useCallback(withAsyncErrorHandling(async (studentId, amount) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return false;

    const currentCoins = (student.currency || 0) + Math.floor((student.totalPoints || 0) / 10) - (student.coinsSpent || 0);
    if (currentCoins < amount) return false;

    const updatedStudents = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          coinsSpent: (s.coinsSpent || 0) + amount,
          lastUpdated: new Date().toISOString()
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    return true;
  }, 'spendCoins'), [students, saveStudentsToFirebase]);

  // ===============================================
  // AVATAR & PET MANAGEMENT
  // ===============================================

  const unlockAvatar = useCallback(withAsyncErrorHandling(async (studentId, avatarBase) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const ownedAvatars = student.ownedAvatars || [];
        if (!ownedAvatars.includes(avatarBase)) {
          return {
            ...student,
            ownedAvatars: [...ownedAvatars, avatarBase],
            lastUpdated: new Date().toISOString()
          };
        }
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'unlockAvatar'), [students, saveStudentsToFirebase]);

  const changeAvatar = useCallback(withAsyncErrorHandling(async (studentId, avatarBase) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const level = student.avatarLevel || calculateAvatarLevel(student.totalPoints || 0);
        return {
          ...student,
          avatarBase: avatarBase,
          avatar: getAvatarImage(avatarBase, level),
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'changeAvatar'), [students, saveStudentsToFirebase]);

  const addPet = useCallback(withAsyncErrorHandling(async (studentId, petData) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const newPet = {
          id: `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...petData,
          unlockedAt: new Date().toISOString()
        };
        
        return {
          ...student,
          ownedPets: [...(student.ownedPets || []), newPet],
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'addPet'), [students, saveStudentsToFirebase]);

  // ===============================================
  // DATA MIGRATION & FIXES
  // ===============================================

  const fixAllStudentData = useCallback(withAsyncErrorHandling(async () => {
    const fixedStudents = students.map(migrateStudentData);
    setStudents(fixedStudents);
    await saveStudentsToFirebase(fixedStudents);
    return fixedStudents;
  }, 'fixAllStudentData'), [students, saveStudentsToFirebase]);

  const resetStudentData = useCallback(withAsyncErrorHandling(async (studentId) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          totalPoints: 0,
          currency: 0,
          avatarLevel: 1,
          avatar: getAvatarImage(student.avatarBase || 'Wizard F', 1),
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
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'resetStudentData'), [students, saveStudentsToFirebase]);

  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================

  const getStudentById = useCallback((studentId) => {
    return students.find(s => s.id === studentId);
  }, [students]);

  const getStudentsByLevel = useCallback((level) => {
    return students.filter(s => (s.avatarLevel || calculateAvatarLevel(s.totalPoints || 0)) === level);
  }, [students]);

  const getTopStudents = useCallback((limit = 5) => {
    return [...students]
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, limit);
  }, [students]);

  const calculateClassStats = useCallback(() => {
    const totalStudents = students.length;
    const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const averageXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;
    
    const levelDistribution = {
      1: students.filter(s => (s.avatarLevel || calculateAvatarLevel(s.totalPoints || 0)) === 1).length,
      2: students.filter(s => (s.avatarLevel || calculateAvatarLevel(s.totalPoints || 0)) === 2).length,
      3: students.filter(s => (s.avatarLevel || calculateAvatarLevel(s.totalPoints || 0)) === 3).length,
      4: students.filter(s => (s.avatarLevel || calculateAvatarLevel(s.totalPoints || 0)) === 4).length
    };

    return {
      totalStudents,
      totalXP,
      averageXP,
      levelDistribution,
      topStudent: students.length > 0 ? getTopStudents(1)[0] : null
    };
  }, [students, getTopStudents]);

  // ===============================================
  // DATA SYNC EFFECT
  // ===============================================

  useEffect(() => {
    // Ensure all students have proper data structure
    if (students.length > 0) {
      const needsFix = students.some(student => 
        !student.avatar || 
        !student.avatarLevel || 
        !student.behaviorPoints ||
        !student.ownedAvatars ||
        !student.ownedPets
      );

      if (needsFix) {
        console.log('Fixing student data...');
        fixAllStudentData();
      }
    }
  }, [students, fixAllStudentData]);

  // ===============================================
  // RETURN HOOK INTERFACE
  // ===============================================

  return {
    // State
    students,
    savingData,
    selectedStudent,
    selectedStudents,
    showAddStudentModal,
    newStudentName,
    newStudentAvatar,
    levelUpData,
    petUnlockData,
    
    // State setters
    setStudents,
    setSelectedStudent,
    setSelectedStudents,
    setShowAddStudentModal,
    setNewStudentName,
    setNewStudentAvatar,
    setLevelUpData,
    setPetUnlockData,
    
    // Student selection
    toggleStudentSelection,
    selectAllStudents,
    clearSelection,
    
    // CRUD operations
    addStudent,
    removeStudent,
    updateStudent,
    
    // XP management
    awardXP,
    awardBulkXP,
    deductXP,
    
    // Coin management
    awardCoins,
    awardBulkCoins,
    spendCoins,
    
    // Avatar & Pet management
    unlockAvatar,
    changeAvatar,
    addPet,
    
    // Data management
    saveStudentsToFirebase,
    fixAllStudentData,
    resetStudentData,
    
    // Utility functions
    getStudentById,
    getStudentsByLevel,
    getTopStudents,
    calculateClassStats,
    
    // Helper functions
    migrateStudentData,
    calculateAvatarLevel,
    getAvatarImage,
    shouldReceivePet,
    createNewPet
  };
};