// hooks/useStudentManagement.js - PHASE 3: Custom Hook for Student Management
// This consolidates all student-related state and functions from classroom-champions.js

import { useState, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

// Import our new utilities
import { 
  updateStudentWithCurrency, 
  calculateCoins, 
  canAfford, 
  getRandomPet, 
  getRandomPetName, 
  getRandomAvatar,
  playXPSound,
  validateStudentData,
  calculateStudentStats
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
          behaviorPoints: {
            ...s.behaviorPoints,
            [category.toLowerCase()]: (s.behaviorPoints?.[category.toLowerCase()] || 0) + 1
          }
        };

        // Check for level up
        if (newLevel > oldLevel) {
          setLevelUpData({
            student: updatedStudent,
            oldLevel,
            newLevel,
            totalXP: newTotalXP
          });
          
          // Check for pet unlock at level 4
          if (newLevel >= 4 && (!s.ownedPets || s.ownedPets.length === 0)) {
            const newPet = getRandomPet();
            setPetUnlockData({
              student: updatedStudent,
              pet: { ...newPet, name: getRandomPetName() }
            });
          }
          
          showToast(`🎉 ${s.firstName} leveled up to Level ${newLevel}!`, 'success');
        } else {
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
          avatar: getAvatarImage(s.avatarBase, newLevel)
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

  const awardBulkXP = useCallback(withAsyncErrorHandling(async (studentIds, amount) => {
    if (studentIds.length === 0) {
      showToast('Please select students first', 'warning');
      return;
    }

    const updatedStudents = students.map(student => {
      if (studentIds.includes(student.id)) {
        const newTotalXP = (student.totalPoints || 0) + amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        return {
          ...student,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(student.avatarBase, newLevel)
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    await saveStudentsToFirebase(updatedStudents);
    
    showToast(`🎉 Awarded ${amount} XP to ${studentIds.length} students!`, 'success');
    setSelectedStudents([]); // Clear selection
  }, 'awardBulkXP'), [students, saveStudentsToFirebase]);

  const resetAllPoints = useCallback(withAsyncErrorHandling(async () => {
    const updatedStudents = students.map(student => ({
      ...student,
      totalPoints: 0,
      avatarLevel: 1,
      avatar: getAvatarImage(student.avatarBase, 1),
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
  // AVATAR MANAGEMENT
  // ===============================================

  const changeAvatar = useCallback(withAsyncErrorHandling(async (student, avatarBase) => {
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
    
    // Utility functions for components
    calculateCoins,
    canAfford,
    calculateStudentStats
  };
};