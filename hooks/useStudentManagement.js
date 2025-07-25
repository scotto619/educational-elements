// hooks/useStudentManagement.js - ENHANCED with Pet Unlock & Level Up Logic

import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

// Import our enhanced utilities
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
  checkLevelUpThresholds,
  createNewPet,
  resolveAvatarBase,
  studentOwnsAvatar
} from '../utils/gameUtils';

import { 
  getAvatarImage, 
  calculateAvatarLevel, 
  migrateStudentData, 
  fixAllStudentLevels 
} from '../utils/avatarFixes';

import { 
  showToast, 
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
        
        showToast('Student data saved successfully!', 'success');
      }
    } finally {
      setSavingData(false);
    }
  }, 'saveStudentsToFirebase'), [user, currentClassId]);

  // ===============================================
  // STUDENT MANAGEMENT OPERATIONS
  // ===============================================

  const addStudent = useCallback(withAsyncErrorHandling(async () => {
    if (!newStudentName.trim()) {
      showToast('Please enter a student name!', 'warning');
      return;
    }

    const newStudent = {
      id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      firstName: newStudentName.trim(),
      lastName: '',
      totalPoints: 0,
      currency: 0,
      avatarLevel: 1,
      avatarBase: newStudentAvatar || getRandomAvatar(),
      hasReceivedFirstPet: false,
      lastLevelUpCheck: 0,
      createdAt: new Date().toISOString()
    };

    // Validate student data
    const validation = validateStudentData(newStudent);
    if (!validation.isValid) {
      throw new Error(`Invalid student data: ${validation.errors.join(', ')}`);
    }

    // Apply migration to ensure all fields are properly set
    const migratedStudent = migrateStudentData(newStudent);
    
    const updatedStudents = [...students, migratedStudent];
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    // Reset modal
    setNewStudentName('');
    setNewStudentAvatar('');
    setShowAddStudentModal(false);
    
    showToast(`✨ Welcome ${migratedStudent.firstName} to the class!`, 'success');
    
    return migratedStudent;
  }, 'addStudent'), [students, newStudentName, newStudentAvatar, saveStudentsToFirebase]);

  const removeStudent = useCallback(withAsyncErrorHandling(async (studentId) => {
    const updatedStudents = students.filter(student => student.id !== studentId);
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    // Clear selected student if it was the removed one
    if (selectedStudent?.id === studentId) {
      setSelectedStudent(null);
    }
    
    showToast('Student removed successfully!', 'success');
  }, 'removeStudent'), [students, selectedStudent, saveStudentsToFirebase]);

  // ENHANCED: XP awarding with pet unlock and level up detection
  const awardXP = useCallback(withAsyncErrorHandling(async (student, amount = 1, category = 'general') => {
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        const newTotalXP = (s.totalPoints || 0) + amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        const oldLevel = s.avatarLevel || 1;
        
        const updatedStudent = {
          ...s,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(s.avatarBase, newLevel),
          lastLevelUpCheck: newTotalXP,
          behaviorPoints: {
            ...s.behaviorPoints,
            [category.toLowerCase()]: (s.behaviorPoints?.[category.toLowerCase()] || 0) + 1
          }
        };

        // Check for level up (every 100 XP)
        if (newLevel > oldLevel) {
          setLevelUpData({
            student: updatedStudent,
            oldLevel,
            newLevel,
            totalXP: newTotalXP
          });
          showToast(`🎉 ${s.firstName} leveled up to Level ${newLevel}!`, 'success');
        }

        // NEW: Check for pet unlock at 50 XP
        if (shouldReceivePet(updatedStudent)) {
          const newPet = createNewPet();
          updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
          updatedStudent.hasReceivedFirstPet = true;
          
          setPetUnlockData({
            student: updatedStudent,
            pet: newPet
          });
          
          playPetUnlockSound();
          showToast(`🐾 ${s.firstName} unlocked their first pet: ${newPet.name}!`, 'success');
        } else if (newLevel === oldLevel) {
          showToast(`${s.firstName} earned ${amount} XP!`, 'success');
        }

        return updatedStudent;
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    // Play sound effect
    playXPSound();
    
  }, 'awardXP'), [students, saveStudentsToFirebase]);

  const deductXP = useCallback(withAsyncErrorHandling(async (student, amount) => {
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        const newTotalXP = Math.max(0, (s.totalPoints || 0) - amount);
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        return {
          ...s,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(s.avatarBase, newLevel),
          lastLevelUpCheck: newTotalXP
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast(`Deducted ${amount} XP from ${student.firstName}`, 'warning');
  }, 'deductXP'), [students, saveStudentsToFirebase]);

  const awardCoins = useCallback(withAsyncErrorHandling(async (student, amount) => {
    const updatedStudents = students.map(s =>
      s.id === student.id
        ? { ...s, currency: (s.currency || 0) + amount }
        : s
    );
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast(`${student.firstName} earned ${amount} coins!`, 'success');
  }, 'awardCoins'), [students, saveStudentsToFirebase]);

  const spendCoins = useCallback(withAsyncErrorHandling(async (studentId, amount) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          coinsSpent: (student.coinsSpent || 0) + amount
        };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
  }, 'spendCoins'), [students, saveStudentsToFirebase]);

  // ===============================================
  // BULK OPERATIONS
  // ===============================================

  const awardBulkXP = useCallback(withAsyncErrorHandling(async (studentIds, amount, category = 'general') => {
    if (studentIds.length === 0) {
      showToast('Please select students first', 'warning');
      return;
    }

    let levelUpsTriggered = [];
    let petUnlocksTriggered = [];

    const updatedStudents = students.map(student => {
      if (studentIds.includes(student.id)) {
        const newTotalXP = (student.totalPoints || 0) + amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        const oldLevel = student.avatarLevel || 1;
        
        const updatedStudent = {
          ...student,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(student.avatarBase, newLevel),
          lastLevelUpCheck: newTotalXP,
          behaviorPoints: {
            ...student.behaviorPoints,
            [category.toLowerCase()]: (student.behaviorPoints?.[category.toLowerCase()] || 0) + 1
          }
        };

        // Track level ups
        if (newLevel > oldLevel) {
          levelUpsTriggered.push(updatedStudent);
        }

        // Track pet unlocks
        if (shouldReceivePet(updatedStudent)) {
          const newPet = createNewPet();
          updatedStudent.ownedPets = [...(updatedStudent.ownedPets || []), newPet];
          updatedStudent.hasReceivedFirstPet = true;
          petUnlocksTriggered.push({ student: updatedStudent, pet: newPet });
        }

        return updatedStudent;
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    // Show summary notifications
    showToast(`🎉 Awarded ${amount} XP to ${studentIds.length} students!`, 'success');
    
    if (levelUpsTriggered.length > 0) {
      showToast(`🎊 ${levelUpsTriggered.length} students leveled up!`, 'success');
    }
    
    if (petUnlocksTriggered.length > 0) {
      showToast(`🐾 ${petUnlocksTriggered.length} students unlocked pets!`, 'success');
      playPetUnlockSound();
    }
    
    setSelectedStudents([]); // Clear selection
  }, 'awardBulkXP'), [students, saveStudentsToFirebase]);

  const awardBulkCoins = useCallback(withAsyncErrorHandling(async (studentIds, amount) => {
    if (studentIds.length === 0) {
      showToast('Please select students first', 'warning');
      return;
    }

    const updatedStudents = students.map(student => 
      studentIds.includes(student.id)
        ? { ...student, currency: (student.currency || 0) + amount }
        : student
    );

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    showToast(`💰 Awarded ${amount} coins to ${studentIds.length} students!`, 'success');
    setSelectedStudents([]); // Clear selection
  }, 'awardBulkCoins'), [students, saveStudentsToFirebase]);

  const resetAllPoints = useCallback(withAsyncErrorHandling(async () => {
    const updatedStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatar: getAvatarImage(student.avatarBase, 1),
      lastLevelUpCheck: 0,
      behaviorPoints: {
        respectful: 0,
        responsible: 0,
        safe: 0,
        learner: 0
      }
    }));
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('All student points reset!', 'success');
  }, 'resetAllPoints'), [students, saveStudentsToFirebase]);

  const resetStudentPoints = useCallback(withAsyncErrorHandling(async (studentId) => {
    const updatedStudents = students.map(student =>
      student.id === studentId
        ? { 
            ...student, 
            totalPoints: 0, 
            avatarLevel: 1,
            avatar: getAvatarImage(student.avatarBase, 1),
            lastLevelUpCheck: 0,
            behaviorPoints: {
              respectful: 0,
              responsible: 0,
              safe: 0,
              learner: 0
            }
          }
        : student
    );
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('Student points reset!', 'success');
  }, 'resetStudentPoints'), [students, saveStudentsToFirebase]);

  // ===============================================
  // AVATAR MANAGEMENT - ENHANCED FOR SHOP ITEMS
  // ===============================================

  const changeAvatar = useCallback(withAsyncErrorHandling(async (student, avatarIdentifier) => {
    // Resolve the actual avatar base from shop ID or direct base name
    const avatarBase = resolveAvatarBase(avatarIdentifier, student);
    const newAvatar = getAvatarImage(avatarBase, student.avatarLevel || 1);
    
    const updatedStudents = students.map(s => 
      s.id === student.id 
        ? { 
            ...s, 
            avatarBase, 
            avatar: newAvatar,
            ownedAvatars: s.ownedAvatars?.includes(avatarBase) 
              ? s.ownedAvatars 
              : [...(s.ownedAvatars || []), avatarBase]
          }
        : s
    );
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast('Avatar changed successfully!', 'success');
  }, 'changeAvatar'), [students, saveStudentsToFirebase]);

  // NEW: Function to handle shop avatar purchases
  const purchaseShopAvatar = useCallback(withAsyncErrorHandling(async (student, shopItem) => {
    if (!canAfford(student, shopItem.price)) {
      showToast(`${student.firstName} doesn't have enough coins!`, 'warning');
      return false;
    }

    const avatarBase = resolveAvatarBase(shopItem.id, student);
    
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        return {
          ...s,
          coinsSpent: (s.coinsSpent || 0) + shopItem.price,
          ownedAvatars: [...(s.ownedAvatars || []), avatarBase],
          inventory: [...(s.inventory || []), {
            ...shopItem,
            purchaseDate: new Date().toISOString()
          }]
        };
      }
      return s;
    });
    
    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    showToast(`${student.firstName} purchased ${shopItem.name}!`, 'success');
    return true;
  }, 'purchaseShopAvatar'), [students, saveStudentsToFirebase]);

  // ===============================================
  // DATA FIXES & MAINTENANCE
  // ===============================================

  const fixAllStudentData = useCallback(() => {
    const fixedStudents = fixAllStudentLevels(students, (fixed) => {
      setStudents(fixed);
      saveStudentsToFirebase(fixed);
    });
    
    showToast('✅ All student levels and avatars have been fixed!', 'success');
    return fixedStudents;
  }, [students, saveStudentsToFirebase]);

  const migrateAllStudents = useCallback(() => {
    const migratedStudents = students.map(migrateStudentData);
    const hasChanges = JSON.stringify(students) !== JSON.stringify(migratedStudents);
    
    if (hasChanges) {
      setStudents(migratedStudents);
      saveStudentsToFirebase(migratedStudents);
      showToast('Student data migrated successfully!', 'success');
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
    if (!students.length) {
      return {
        totalStudents: 0,
        averageXP: 0,
        totalXP: 0,
        highestLevel: 0,
        totalCoins: 0,
        studentsWithPets: 0
      };
    }

    const totalXP = students.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
    const totalCoins = students.reduce((sum, student) => sum + calculateCoins(student), 0);
    const highestLevel = Math.max(...students.map(student => student.avatarLevel || 1));
    const studentsWithPets = students.filter(student => student.ownedPets?.length > 0).length;
    
    return {
      totalStudents: students.length,
      averageXP: Math.round(totalXP / students.length),
      totalXP,
      highestLevel,
      totalCoins,
      studentsWithPets
    };
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
    purchaseShopAvatar, // NEW
    
    // Bulk operations
    awardBulkXP,
    awardBulkCoins, // NEW
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
    getStudentsNeedingPets, // NEW
    
    // Utility functions for components
    calculateCoins,
    canAfford,
    calculateStudentStats,
    shouldReceivePet,
    studentOwnsAvatar // NEW
  };
};