// hooks/index.js - Custom Hooks for Classroom Champions
// These hooks encapsulate common operations and integrate with our services

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../utils/firebase';
import firebaseService from '../services/firebaseService';
import studentService from '../services/studentService';
import questService from '../services/questService';
import gameLogic from '../services/gameLogic';
import soundService from '../services/soundService';

// ===============================================
// AUTHENTICATION HOOKS
// ===============================================

/**
 * Hook for managing user authentication state
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setUser(null);
          setUserData(null);
          router.push('/login');
        } else {
          setUser(user);
          const data = await firebaseService.getUserData(user.uid);
          setUserData(data);
          
          // Update last login
          await firebaseService.updateUserData(user.uid, {
            lastLoginAt: new Date().toISOString()
          });
        }
      } catch (err) {
        setError(err.message);
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      router.push('/login');
    } catch (err) {
      setError(err.message);
    }
  }, [router]);

  return { user, userData, loading, error, logout };
};

// ===============================================
// STUDENT MANAGEMENT HOOKS
// ===============================================

/**
 * Hook for managing students in a class
 */
export const useStudents = (userId, classId) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load students from Firebase
  const loadStudents = useCallback(async () => {
    if (!userId || !classId) return;

    try {
      setLoading(true);
      const classData = await firebaseService.getClassData(userId, classId);
      if (classData?.students) {
        const validatedStudents = classData.students.map(student => 
          gameLogic.validateStudentData(student)
        );
        setStudents(validatedStudents);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, classId]);

  // Save students to Firebase
  const saveStudents = useCallback(async (studentsToSave) => {
    if (!userId || !classId || saving) return;

    try {
      setSaving(true);
      await firebaseService.saveStudents(userId, classId, studentsToSave);
      setStudents(studentsToSave);
    } catch (err) {
      setError(err.message);
      console.error('Error saving students:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, classId, saving]);

  // Add new student
  const addStudent = useCallback(async (firstName, lastName, avatarBase) => {
    try {
      const newStudent = studentService.createStudent(firstName, lastName, avatarBase);
      const updatedStudents = [...students, newStudent];
      await saveStudents(updatedStudents);
      return newStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students, saveStudents]);

  // Update specific student
  const updateStudent = useCallback(async (studentId, updates) => {
    try {
      const updatedStudents = students.map(student =>
        student.id === studentId
          ? studentService.updateStudent(student, updates)
          : student
      );
      await saveStudents(updatedStudents);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students, saveStudents]);

  // Remove student
  const removeStudent = useCallback(async (studentId) => {
    try {
      const updatedStudents = students.filter(s => s.id !== studentId);
      await saveStudents(updatedStudents);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students, saveStudents]);

  // Award XP to student
  const awardXP = useCallback(async (studentId, category, amount, source = 'manual') => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const updatedStudent = await studentService.awardXP(student, category, amount, source);
      const updatedStudents = students.map(s =>
        s.id === studentId ? updatedStudent : s
      );
      
      await saveStudents(updatedStudents);
      return updatedStudent;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students, saveStudents]);

  // Bulk award XP
  const bulkAwardXP = useCallback(async (studentIds, category, amount, source = 'manual') => {
    try {
      const updatedStudents = await studentService.bulkAwardXP(
        students, studentIds, category, amount, source
      );
      await saveStudents(updatedStudents);
      return updatedStudents;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [students, saveStudents]);

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  return {
    students,
    loading,
    saving,
    error,
    addStudent,
    updateStudent,
    removeStudent,
    awardXP,
    bulkAwardXP,
    saveStudents,
    reloadStudents: loadStudents
  };
};

/**
 * Hook for student statistics and analytics
 */
export const useStudentStats = (students) => {
  return useMemo(() => {
    if (!students?.length) return null;

    const totalStudents = students.length;
    const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const averageXP = Math.round(totalXP / totalStudents);
    
    const levelDistribution = students.reduce((acc, s) => {
      const level = gameLogic.calculateLevel(s.totalPoints || 0);
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const categoryTotals = students.reduce((acc, s) => {
      Object.entries(s.categoryTotal || {}).forEach(([category, xp]) => {
        acc[category] = (acc[category] || 0) + xp;
      });
      return acc;
    }, {});

    const topPerformers = [...students]
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 5);

    return {
      totalStudents,
      totalXP,
      averageXP,
      levelDistribution,
      categoryTotals,
      topPerformers
    };
  }, [students]);
};

// ===============================================
// QUEST MANAGEMENT HOOKS
// ===============================================

/**
 * Hook for managing quests
 */
export const useQuests = (userId, classId) => {
  const [activeQuests, setActiveQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load quest data
  const loadQuestData = useCallback(async () => {
    if (!userId || !classId) return;

    try {
      setLoading(true);
      const classData = await firebaseService.getClassData(userId, classId);
      setActiveQuests(classData?.activeQuests || []);
      setQuestTemplates(classData?.questTemplates || questService.getDefaultTemplates());
    } catch (err) {
      setError(err.message);
      console.error('Error loading quest data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, classId]);

  // Save quest data
  const saveQuestData = useCallback(async (questData) => {
    if (!userId || !classId || saving) return;

    try {
      setSaving(true);
      await firebaseService.saveQuestData(userId, classId, questData);
    } catch (err) {
      setError(err.message);
      console.error('Error saving quest data:', err);
    } finally {
      setSaving(false);
    }
  }, [userId, classId, saving]);

  // Create new quest
  const createQuest = useCallback(async (questData) => {
    try {
      const newQuest = questService.createQuest(questData);
      const updatedQuests = [...activeQuests, newQuest];
      setActiveQuests(updatedQuests);
      await saveQuestData({ activeQuests: updatedQuests, questTemplates });
      return newQuest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeQuests, questTemplates, saveQuestData]);

  // Complete quest
  const completeQuest = useCallback(async (questId, student) => {
    try {
      const quest = activeQuests.find(q => q.id === questId);
      if (!quest) throw new Error('Quest not found');

      const result = questService.completeQuest(quest, student);
      const updatedQuests = activeQuests.map(q =>
        q.id === questId ? result.quest : q
      );
      
      setActiveQuests(updatedQuests);
      await saveQuestData({ activeQuests: updatedQuests, questTemplates });
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeQuests, questTemplates, saveQuestData]);

  // Get available quests for student
  const getAvailableQuests = useCallback((student) => {
    return questService.getAvailableQuests(activeQuests, student);
  }, [activeQuests]);

  // Load quest data on mount
  useEffect(() => {
    loadQuestData();
  }, [loadQuestData]);

  return {
    activeQuests,
    questTemplates,
    loading,
    saving,
    error,
    createQuest,
    completeQuest,
    getAvailableQuests,
    reloadQuests: loadQuestData
  };
};

// ===============================================
// UI STATE HOOKS
// ===============================================

/**
 * Hook for managing modal states
 */
export const useModals = () => {
  const [modals, setModals] = useState({
    addStudent: false,
    characterSheet: false,
    avatarSelection: false,
    levelUp: false,
    petUnlock: false,
    questCompletion: false,
    raceSetup: false,
    raceWinner: false
  });

  const [modalData, setModalData] = useState({});

  const openModal = useCallback((modalName, data = {}) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    setModalData(prev => ({ ...prev, [modalName]: data }));
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setModalData(prev => ({ ...prev, [modalName]: {} }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(Object.keys(modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {}));
    setModalData({});
  }, [modals]);

  return { modals, modalData, openModal, closeModal, closeAllModals };
};

/**
 * Hook for managing toast notifications
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

/**
 * Hook for managing bulk selection
 */
export const useBulkSelection = (items = []) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const selectItem = useCallback((id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(items.map(item => item.id));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const isSelected = useCallback((id) => {
    return selectedItems.includes(id);
  }, [selectedItems]);

  const selectedCount = selectedItems.length;
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  return {
    selectedItems,
    selectedCount,
    allSelected,
    selectItem,
    selectAll,
    deselectAll,
    isSelected,
    setSelectedItems
  };
};

// ===============================================
// GAME STATE HOOKS
// ===============================================

/**
 * Hook for managing sound preferences
 */
export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);

  useEffect(() => {
    soundService.setEnabled(soundEnabled);
    soundService.setVolume(volume);
  }, [soundEnabled, volume]);

  const playSound = useCallback((soundType) => {
    if (soundEnabled) {
      soundService.playSound(soundType);
    }
  }, [soundEnabled]);

  return {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    playSound
  };
};

/**
 * Hook for managing class selection and navigation
 */
export const useClassNavigation = (userId) => {
  const [currentClassId, setCurrentClassId] = useState(null);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClasses = async () => {
      if (!userId) return;

      try {
        const userData = await firebaseService.getUserData(userId);
        if (userData) {
          setAvailableClasses(userData.classes || []);
          setCurrentClassId(userData.activeClassId || userData.classes?.[0]?.id || null);
        }
      } catch (error) {
        console.error('Error loading classes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClasses();
  }, [userId]);

  const switchClass = useCallback(async (classId) => {
    try {
      await firebaseService.setActiveClass(userId, classId);
      setCurrentClassId(classId);
    } catch (error) {
      console.error('Error switching class:', error);
    }
  }, [userId]);

  const currentClass = availableClasses.find(cls => cls.id === currentClassId);

  return {
    currentClassId,
    currentClass,
    availableClasses,
    loading,
    switchClass
  };
};

/**
 * Hook for managing app-wide loading states
 */
export const useAppLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return Boolean(loadingStates[key]);
  }, [loadingStates]);

  const isAnyLoading = useMemo(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  return { setLoading, isLoading, isAnyLoading };
};

// ===============================================
// UTILITY HOOKS
// ===============================================

/**
 * Hook for debouncing values (useful for search inputs)
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for local storage with JSON serialization
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key]);

  return [storedValue, setValue];
};

/**
 * Hook for managing component visibility with animation
 */
export const useVisibility = (initialVisible = false, animationDuration = 300) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  const show = useCallback(() => {
    setIsAnimating(true);
    setIsVisible(true);
    setTimeout(() => setIsAnimating(false), animationDuration);
  }, [animationDuration]);

  const hide = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, animationDuration);
  }, [animationDuration]);

  const toggle = useCallback(() => {
    if (isVisible) {
      hide();
    } else {
      show();
    }
  }, [isVisible, show, hide]);

  return { isVisible, isAnimating, show, hide, toggle };
};