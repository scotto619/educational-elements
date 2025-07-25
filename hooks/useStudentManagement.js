// hooks/useStudentManagement.js - ENHANCED with All Required Functions for StudentsTab

import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

// Import utilities
import { 
  updateStudentWithCurrency, 
  calculateCoins, 
  canAfford, 
  getRandomPet, 
  getRandomPetName, 
  getRandomAvatar,
  playXPSound,
  playPetUnlockSound,
  validateStudentData,
  calculateStudentStats,
  shouldReceivePet,
  createNewPet,
  studentOwnsAvatar,
  calculateClassStats
} from '../utils/gameUtils';

import { 
  getAvatarImage, 
  calculateAvatarLevel, 
  migrateStudentData, 
  fixAllStudentLevels 
} from '../utils/avatarFixes';

import { 
  showToast, 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast,
  handleError, 
  withAsyncErrorHandling, 
  ERROR_TYPES 
} from '../utils/errorHandling';

import { GAME_CONFIG, AVAILABLE_AVATARS } from '../constants/gameData';

export const useStudentManagement = (user, currentClassId) => {
  // Core student state
  const [students, setStudents] = useState([]);
  const [savingData, setSavingData] = useState(false);
  
  // Student interaction state
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
        
        console.log('Student data saved successfully to Firebase');
      }
    } catch (error) {
      console.error('Error saving students:', error);
      throw error;
    } finally {
      setSavingData(false);
    }
  }, 'saveStudentsToFirebase'), [user, currentClassId]);

  // ===============================================
  // STUDENT MANAGEMENT OPERATIONS
  // ===============================================

  const addStudent = useCallback(withAsyncErrorHandling(async (studentData) => {
    const newStudent = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: studentData.firstName || studentData.name || 'New Student',
      lastName: studentData.lastName || '',
      totalPoints: 0,
      avatarLevel: 1,
      avatarBase: studentData.avatarBase || 'Wizard F',
      avatar: getAvatarImage(studentData.avatarBase || 'Wizard F', 1),
      currency: 0,
      coinsSpent: 0,
      ownedAvatars: [studentData.avatarBase || 'Wizard F'],
      ownedPets: [],
      questsCompleted: [],
      rewardsPurchased: [],
      behaviorPoints: {
        respectful: 0,
        responsible: 0,
        safe: 0,
        learner: 0
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    showSuccessToast(`${newStudent.firstName} added to class!`);
    return newStudent;
  }, 'addStudent'), [students, saveStudentsToFirebase]);

  const removeStudent = useCallback(withAsyncErrorHandling(async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      showWarningToast('Student not found');
      return;
    }

    const updatedStudents = students.filter(s => s.id !== studentId);
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    showSuccessToast(`${student.firstName} removed from class`);
  }, 'removeStudent'), [students, saveStudentsToFirebase]);

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
    
    // Play sound
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

    // Handle notifications
    if (levelUps.length > 0) {
      setLevelUpData(levelUps[0]); // Show first level up
    }
    if (petUnlocks.length > 0) {
      setPetUnlockData(petUnlocks[0]); // Show first pet unlock
    }

    showSuccessToast(`${amount} XP awarded to ${studentIds.length} students!`);
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
    
    showSuccessToast(`${amount} coins awarded to ${studentIds.length} students!`);
  }, 'awardBulkCoins'), [students, saveStudentsToFirebase]);

  const spendCoins = useCallback(withAsyncErrorHandling(async (studentId, amount) => {
    const student = students.find(s => s.id === studentId);
    if (!student || !canAfford(student, amount)) {
      showWarningToast('Not enough coins!');
      return false;
    }

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
  // AVATAR MANAGEMENT
  // ===============================================

  const changeAvatar = useCallback(withAsyncErrorHandling(async (studentId, avatarBase) => {
    const newAvatar = getAvatarImage(avatarBase, 1);
    
    const updatedStudents = students.map(s => 
      s.id === studentId 
        ? { 
            ...s, 
            avatarBase, 
            avatar: newAvatar,
            ownedAvatars: s.ownedAvatars?.includes(avatarBase) 
              ? s.ownedAvatars 
              : [...(s.ownedAvatars || []), avatarBase],
            lastUpdated: new Date().toISOString()
          }
        : s
    );
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showSuccessToast('Avatar changed successfully!');
  }, 'changeAvatar'), [students, saveStudentsToFirebase]);

  // ===============================================
  // BULK OPERATIONS
  // ===============================================

  const resetAllPoints = useCallback(withAsyncErrorHandling(async () => {
    const updatedStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatar: getAvatarImage(student.avatarBase || 'Wizard F', 1),
      behaviorPoints: {
        respectful: 0,
        responsible: 0,
        safe: 0,
        learner: 0
      },
      lastUpdated: new Date().toISOString()
    }));

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showSuccessToast('All student points reset!');
  }, 'resetAllPoints'), [students, saveStudentsToFirebase]);

  const resetStudentPoints = useCallback(withAsyncErrorHandling(async (studentId) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          totalPoints: 0,
          avatarLevel: 1,
          avatar: getAvatarImage(student.avatarBase || 'Wizard F', 1),
          behaviorPoints: {
            respectful: 0,
            responsible: 0,
            safe: 0,
            learner: 0
          },
          lastUpdated: new Date().toISOString()
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    const student = students.find(s => s.id === studentId);
    showSuccessToast(`${student?.firstName}'s points reset!`);
  }, 'resetStudentPoints'), [students, saveStudentsToFirebase]);

  // ===============================================
  // DATA FIXES & MAINTENANCE
  // ===============================================

  const fixAllStudentData = useCallback(() => {
    const fixedStudents = fixAllStudentLevels(students, (fixed) => {
      setStudents(fixed);
      saveStudentsToFirebase(fixed);
    });
    
    showSuccessToast('✅ All student levels and avatars have been fixed!');
    return fixedStudents;
  }, [students, saveStudentsToFirebase]);

  const migrateAllStudents = useCallback(() => {
    const migratedStudents = students.map(migrateStudentData);
    const hasChanges = JSON.stringify(students) !== JSON.stringify(migratedStudents);
    
    if (hasChanges) {
      setStudents(migratedStudents);
      saveStudentsToFirebase(migratedStudents);
      showSuccessToast('Student data migrated successfully!');
    } else {
      showToast('All student data is already up to date!', 'info');
    }
  }, [students, saveStudentsToFirebase]);

  // ===============================================
  // SELECTION MANAGEMENT
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
  // COMPUTED VALUES
  // ===============================================

  const classStats = useCallback(() => {
    return calculateClassStats(students);
  }, [students]);

  const getStudentById = useCallback((id) => {
    return students.find(student => student.id === id);
  }, [students]);

  const getStudentsByLevel = useCallback((level) => {
    return students.filter(student => (student.avatarLevel || 1) === level);
  }, [students]);

  const getTopStudents = useCallback((count = 5) => {
    return [...students]
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, count);
  }, [students]);

  const getStudentsNeedingPets = useCallback(() => {
    return students.filter(student => shouldReceivePet(student));
  }, [students]);

  // ===============================================
  // RETURN HOOK INTERFACE
  // ===============================================

  return {
    // State
    students,
    setStudents,
    savingData,
    selectedStudent,
    setSelectedStudent,
    selectedStudents,
    setSelectedStudents,
    
    // Modal state
    showAddStudentModal,
    setShowAddStudentModal,
    newStudentName,
    setNewStudentName,
    newStudentAvatar,
    setNewStudentAvatar,
    levelUpData,
    setLevelUpData,
    petUnlockData,
    setPetUnlockData,
    
    // Core operations
    addStudent,
    removeStudent,
    awardXP,
    deductXP,
    awardCoins,
    spendCoins,
    changeAvatar,
    
    // Bulk operations
    awardBulkXP,
    awardBulkCoins,
    resetAllPoints,
    resetStudentPoints,
    
    // Selection management
    toggleStudentSelection,
    selectAllStudents,
    clearSelection,
    
    // Data maintenance
    fixAllStudentData,
    migrateAllStudents,
    saveStudentsToFirebase,
    
    // Computed values
    classStats: classStats(),
    getStudentById,
    getStudentsByLevel,
    getTopStudents,
    getStudentsNeedingPets,
    
    // Utility functions for components
    calculateCoins,
    canAfford,
    calculateStudentStats,
    shouldReceivePet,
    studentOwnsAvatar
  };
};