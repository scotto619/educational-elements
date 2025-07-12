// classroom-champions.js - FIXED Class Loading Issue
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Lazy load components
const DashboardTab = React.lazy(() => import('../components/tabs/DashboardTab'));
const StudentsTab = React.lazy(() => import('../components/tabs/StudentsTab'));
const ShopTab = React.lazy(() => import('../components/tabs/ShopTab'));
const PetRaceTab = React.lazy(() => import('../components/tabs/PetRaceTab'));
const ClassesTab = React.lazy(() => import('../components/tabs/ClassesTab'));
const SettingsTab = React.lazy(() => import('../components/tabs/SettingsTab'));
const TeachersToolkitTab = React.lazy(() => import('../components/tabs/TeachersToolkitTab'));

// Lazy load modals
const CharacterSheetModal = React.lazy(() => import('../components/modals/CharacterSheetModal'));
const AvatarSelectionModal = React.lazy(() => import('../components/modals/AvatarSelectionModal'));
const LevelUpModal = React.lazy(() => import('../components/modals/LevelUpModal'));
const PetUnlockModal = React.lazy(() => import('../components/modals/PetUnlockModal'));
const AddStudentModal = React.lazy(() => import('../components/modals/AddStudentModal'));
const RaceWinnerModal = React.lazy(() => import('../components/modals/RaceWinnerModal'));
const RaceSetupModal = React.lazy(() => import('../components/modals/RaceSetupModal'));
const QuestCompletionModal = React.lazy(() => import('../components/modals/QuestCompletionModal'));

// ===============================================
// CONSTANTS AND CONFIGURATIONS
// ===============================================

const MAX_LEVEL = 4;
const AVATAR_OPTIONS = [
  'warrior-male', 'warrior-female', 'wizard-male', 'wizard-female',
  'rogue-male', 'rogue-female', 'archer-male', 'archer-female',
  'knight-male', 'knight-female', 'mage-male', 'mage-female'
];

const PET_SPECIES = ['dragon', 'unicorn', 'phoenix', 'griffin', 'pegasus'];
const PET_NAMES = [
  'Blaze', 'Luna', 'Storm', 'Nova', 'Ember', 'Frost', 'Thunder', 'Aurora',
  'Shadow', 'Star', 'Fire', 'Ice', 'Lightning', 'Crystal', 'Mystic'
];

const DEFAULT_QUEST_TEMPLATES = [
  {
    id: 'helpful_student',
    name: 'Helpful Student',
    description: 'Help another student with their work',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'manual' },
    reward: { type: 'coins', amount: 3 }
  },
  {
    id: 'complete_work',
    name: 'Work Complete',
    description: 'Complete all assigned work',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'manual' },
    reward: { type: 'coins', amount: 2 }
  },
  {
    id: 'respectful_points',
    name: 'Respectful Champion',
    description: 'Earn 5 Respectful points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Respectful', amount: 5 },
    reward: { type: 'coins', amount: 2 }
  },
  {
    id: 'responsible_points',
    name: 'Responsible Champion',
    description: 'Earn 5 Responsible points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Responsible', amount: 5 },
    reward: { type: 'coins', amount: 2 }
  },
  {
    id: 'learner_points',
    name: 'Learning Champion',
    description: 'Earn 5 Learner points',
    type: 'daily',
    category: 'individual',
    requirement: { type: 'xp', category: 'Learner', amount: 5 },
    reward: { type: 'coins', amount: 2 }
  },
  {
    id: 'class_total_xp',
    name: 'Class Achievement',
    description: 'Class earns 100 total XP',
    type: 'weekly',
    category: 'class',
    requirement: { type: 'class_xp', amount: 100 },
    reward: { type: 'coins', amount: 5 }
  },
  {
    id: 'all_pets_unlocked',
    name: 'Pet Masters',
    description: 'Every student unlocks their pet',
    type: 'weekly',
    category: 'class',
    requirement: { type: 'all_pets' },
    reward: { type: 'coins', amount: 10 }
  }
];

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const getAvatarImage = (base, level) => {
  return `/avatars/${base}-level-${level}.png`;
};

const getRandomPet = () => {
  const species = PET_SPECIES[Math.floor(Math.random() * PET_SPECIES.length)];
  const name = PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
  
  return {
    species,
    name,
    speed: Math.floor(Math.random() * 50) + 50,
    strength: Math.floor(Math.random() * 50) + 50,
    intelligence: Math.floor(Math.random() * 50) + 50,
    raceWins: 0,
    unlockedAt: new Date().toISOString()
  };
};

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
};

const getWeekEnd = () => {
  const weekStart = getWeekStart();
  return new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
};

const updateStudentWithCurrency = (student) => {
  const coins = Math.floor(student.totalPoints / 5);
  return { ...student, coins };
};

const calculateCoins = (student) => {
  return Math.floor(student.totalPoints / 5);
};

const canAfford = (student, cost) => {
  const coins = calculateCoins(student);
  return coins >= cost;
};

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function ClassroomChampions() {
  const router = useRouter();

  // Core states
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAvatarSelectionModal, setShowAvatarSelectionModal] = useState(false);
  const [studentForAvatarChange, setStudentForAvatarChange] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('');

  // Race states
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('');
  const [xpAmount, setXpAmount] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showRaceSetup, setShowRaceSetup] = useState(false);

  // Class management states
  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [currentClassId, setCurrentClassId] = useState(null);

  // Multiple XP award states
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkXpAmount, setBulkXpAmount] = useState(1);
  const [bulkXpCategory, setBulkXpCategory] = useState('Respectful');
  const [showBulkXpPanel, setShowBulkXpPanel] = useState(false);

  // FIXED: Quest system states - always initialized
  const [dailyQuests, setDailyQuests] = useState([]);
  const [weeklyQuests, setWeeklyQuests] = useState([]);
  const [questTemplates, setQuestTemplates] = useState(DEFAULT_QUEST_TEMPLATES);
  const [questCompletionData, setQuestCompletionData] = useState(null);
  const [showQuestCompletion, setShowQuestCompletion] = useState(false);

  // Settings states
  const [userData, setUserData] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');

  // UX states
  const [savingData, setSavingData] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');
  const [animatingXP, setAnimatingXP] = useState({});

  // ===============================================
  // FUNCTION DEFINITIONS
  // ===============================================

  const showToast = (message) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(''), 3000);
  };

  // FIXED: Save active class ID to Firebase
  const saveActiveClassToFirebase = async (classId) => {
    if (!user) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        await setDoc(docRef, { ...data, activeClassId: classId });
        console.log("✅ Active class ID saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving active class ID:", error);
    }
  };

  const saveStudentsToFirebase = async (updatedStudents) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, students: updatedStudents }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Student data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving student data:", error);
    }
  };

  // Enhanced classroom data saving functions
  const saveClassroomDataToFirebase = async (classId, classroomData) => {
    if (!user || !classId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === classId 
            ? { ...cls, classroomData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Classroom data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving classroom data:", error);
    }
  };

  // FIXED: Enhanced quest data saving
  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, ...questData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Quest data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving quest data:", error);
    }
  };

  // Group data saving
  const saveGroupDataToFirebase = async (groupData) => {
    if (!user || !currentClassId) return;
    
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { ...cls, groupData }
            : cls
        );
        await setDoc(docRef, { ...data, classes: updatedClasses });
        console.log("✅ Group data saved to Firebase");
      }
    } catch (error) {
      console.error("❌ Error saving group data:", error);
    }
  };

  // FIXED: Generate daily quests with immediate save
  const generateDailyQuests = async () => {
    const today = new Date().toISOString().split('T')[0];
    const dailyTemplates = questTemplates.filter(t => t.type === 'daily');
    const selectedQuests = dailyTemplates.slice(0, 3).map(template => ({
      ...template,
      id: `daily-${today}-${template.id}`,
      startDate: today,
      endDate: today,
      completedBy: [],
      active: true
    }));
    
    // Immediately save to Firebase
    await saveQuestDataToFirebase({ dailyQuests: selectedQuests });
    return selectedQuests;
  };

  const generateWeeklyQuests = async () => {
    const weekStart = getWeekStart().toISOString().split('T')[0];
    const weekEnd = getWeekEnd().toISOString().split('T')[0];
    const weeklyTemplates = questTemplates.filter(t => t.type === 'weekly');
    const selectedQuests = weeklyTemplates.slice(0, 2).map(template => ({
      ...template,
      id: `weekly-${weekStart}-${template.id}`,
      startDate: weekStart,
      endDate: weekEnd,
      completedBy: [],
      active: true
    }));
    
    // Immediately save to Firebase
    await saveQuestDataToFirebase({ weeklyQuests: selectedQuests });
    return selectedQuests;
  };

  const checkIndividualQuestCompletion = (quest, studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return false;

    const { requirement } = quest;
    
    switch (requirement.type) {
      case 'xp':
        const categoryPoints = student.categoryWeekly?.[requirement.category] || 0;
        return categoryPoints >= requirement.amount;
      case 'manual':
        return false; // Manual quests need teacher confirmation
      default:
        return false;
    }
  };

  const checkClassQuestCompletionSafely = (quest, studentsArray = students) => {
    const { requirement } = quest;
    
    switch (requirement.type) {
      case 'class_xp':
        const totalXP = studentsArray.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
        return totalXP >= requirement.amount;
      case 'all_pets':
        return studentsArray.length > 0 && studentsArray.every(student => student.pet);
      default:
        return false;
    }
  };

  const completeQuest = async (questId, studentId = null) => {
    const updatedDailyQuests = dailyQuests.map(quest => {
      if (quest.id === questId) {
        const completedBy = studentId 
          ? [...quest.completedBy, studentId]
          : [...quest.completedBy, 'class'];
        return { ...quest, completedBy };
      }
      return quest;
    });

    const updatedWeeklyQuests = weeklyQuests.map(quest => {
      if (quest.id === questId) {
        const completedBy = studentId 
          ? [...quest.completedBy, studentId]
          : [...quest.completedBy, 'class'];
        return { ...quest, completedBy };
      }
      return quest;
    });

    setDailyQuests(updatedDailyQuests);
    setWeeklyQuests(updatedWeeklyQuests);

    // Find the completed quest
    const completedQuest = [...updatedDailyQuests, ...updatedWeeklyQuests].find(q => q.id === questId);
    
    if (completedQuest && completedQuest.reward.type === 'coins') {
      if (studentId) {
        // Individual reward
        setStudents(prev => {
          const updated = prev.map(student => {
            if (student.id === studentId) {
              const newTotalPoints = student.totalPoints + (completedQuest.reward.amount * 5);
              return { ...student, totalPoints: newTotalPoints };
            }
            return student;
          });
          saveStudentsToFirebase(updated);
          return updated;
        });
      } else {
        // Class reward
        setStudents(prev => {
          const updated = prev.map(student => {
            const newTotalPoints = student.totalPoints + (completedQuest.reward.amount * 5);
            return { ...student, totalPoints: newTotalPoints };
          });
          saveStudentsToFirebase(updated);
          return updated;
        });
      }
    }

    // Show completion modal
    setQuestCompletionData({
      quest: completedQuest,
      student: studentId ? students.find(s => s.id === studentId) : null
    });
    setShowQuestCompletion(true);

    // Save to Firebase
    saveQuestDataToFirebase({
      dailyQuests: updatedDailyQuests,
      weeklyQuests: updatedWeeklyQuests
    });
  };

  // FIXED: Quest completion check
  const checkQuestCompletionSafely = (studentId, updatedStudents) => {
    const student = updatedStudents.find(s => s.id === studentId);
    if (!student) return;

    // Check individual quests
    [...dailyQuests, ...weeklyQuests].forEach(quest => {
      if (quest.category === 'individual' && !quest.completedBy.includes(studentId)) {
        const questCreatedDate = new Date(quest.startDate);
        const studentLastActive = student.lastXpDate ? new Date(student.lastXpDate) : new Date('2024-01-01');
        
        const today = new Date().toISOString().split('T')[0];
        const isNewQuest = quest.startDate === today;
        
        if (questCreatedDate <= studentLastActive || !student.lastXpDate || isNewQuest) {
          if (checkIndividualQuestCompletion(quest, studentId)) {
            setTimeout(() => completeQuest(quest.id, studentId), 100);
          }
        }
      }
    });

    // Check class quests
    [...dailyQuests, ...weeklyQuests].forEach(quest => {
      if (quest.category === 'class' && !quest.completedBy.includes('class')) {
        if (checkClassQuestCompletionSafely(quest, updatedStudents)) {
          setTimeout(() => completeQuest(quest.id, null), 100);
        }
      }
    });
  };

  const markQuestComplete = (questId, studentId = null) => {
    // For manual quests, mark as completed
    completeQuest(questId, studentId);
    showToast('Quest marked as complete!');
  };

  const checkForLevelUp = (student) => {
    const nextLevel = student.avatarLevel + 1;
    const xpNeeded = student.avatarLevel * 100;
    if (student.totalPoints >= xpNeeded && student.avatarLevel < MAX_LEVEL) {
      const newAvatar = getAvatarImage(student.avatarBase, nextLevel);
      setLevelUpData({
        name: student.firstName,
        oldAvatar: student.avatar,
        newAvatar,
      });
      return {
        ...student,
        avatarLevel: nextLevel,
        avatar: newAvatar,
      };
    }
    return student;
  };

  const handleAvatarClick = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentForAvatarChange(student);
      setShowAvatarSelectionModal(true);
    }
  };

  const handleAvatarChange = async (avatarBase) => {
    if (!studentForAvatarChange) return;

    setSavingData(true);
    const newAvatar = getAvatarImage(avatarBase, studentForAvatarChange.avatarLevel);
    
    setStudents(prev => {
      const updatedStudents = prev.map(student => 
        student.id === studentForAvatarChange.id 
          ? { ...student, avatarBase, avatar: newAvatar }
          : student
      );
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
    setSavingData(false);
    showToast('Avatar updated successfully!');
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !newStudentAvatar) {
      alert('Please enter a name and select an avatar.');
      return;
    }

    setSavingData(true);
    const newStudent = {
      id: Date.now().toString(),
      firstName: newStudentName.trim(),
      avatarBase: newStudentAvatar,
      avatar: getAvatarImage(newStudentAvatar, 1),
      avatarLevel: 1,
      respectfulPoints: 0,
      responsiblePoints: 0,
      learnerPoints: 0,
      totalPoints: 0,
      categoryWeekly: { Respectful: 0, Responsible: 0, Learner: 0 },
      pet: null
    };

    setStudents(prev => {
      const updatedStudents = [...prev, newStudent];
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    setNewStudentName('');
    setNewStudentAvatar('');
    setShowAddStudentModal(false);
    setSavingData(false);
    showToast('Student added successfully!');
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStudents([]);
  };

  const handleBulkXpAward = () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one student.');
      return;
    }

    selectedStudents.forEach(studentId => {
      for (let i = 0; i < bulkXpAmount; i++) {
        setTimeout(() => handleAwardXP(studentId, bulkXpCategory), i * 100);
      }
    });

    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    showToast(`Awarded ${bulkXpAmount} ${bulkXpCategory} XP to ${selectedStudents.length} students!`);
  };

  const handleAwardXP = (studentId, category) => {
    setSavingData(true);

    // Animate XP
    setAnimatingXP(prev => ({ ...prev, [studentId]: category }));
    setTimeout(() => {
      setAnimatingXP(prev => ({ ...prev, [studentId]: null }));
    }, 1000);

    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id === studentId) {
          const newCategoryPoints = student[category.toLowerCase() + 'Points'] + 1;
          const newTotalPoints = student.totalPoints + 1;
          const newCategoryWeekly = {
            ...student.categoryWeekly,
            [category]: (student.categoryWeekly?.[category] || 0) + 1
          };

          let updatedStudent = {
            ...student,
            [category.toLowerCase() + 'Points']: newCategoryPoints,
            totalPoints: newTotalPoints,
            categoryWeekly: newCategoryWeekly,
            lastXpDate: new Date().toISOString()
          };

          // Check for level up
          updatedStudent = checkForLevelUp(updatedStudent);

          // Check for pet unlock
          if (!updatedStudent.pet && updatedStudent.totalPoints >= 50) {
            const newPet = getRandomPet();
            updatedStudent.pet = newPet;
            setPetUnlockData({
              name: updatedStudent.firstName,
              pet: newPet
            });
          }

          return updatedStudent;
        }
        return student;
      });

      // Save to Firebase
      saveStudentsToFirebase(updatedStudents);
      
      // Check quest completion after state update
      const targetStudent = updatedStudents.find(s => s.id === studentId);
      if (targetStudent) {
        setTimeout(() => checkQuestCompletionSafely(studentId, updatedStudents), 100);
      }

      setSavingData(false);
      return updatedStudents;
    });
  };

  // FIXED: Class import with proper currentClassId setting and active class saving
  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      alert('Please enter both class name and student names.');
      return;
    }

    setSavingData(true);

    const studentList = newClassStudents
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map((name, index) => ({
        id: `${Date.now()}-${index}`,
        firstName: name,
        avatarBase: AVATAR_OPTIONS[index % AVATAR_OPTIONS.length],
        avatar: getAvatarImage(AVATAR_OPTIONS[index % AVATAR_OPTIONS.length], 1),
        avatarLevel: 1,
        respectfulPoints: 0,
        responsiblePoints: 0,
        learnerPoints: 0,
        totalPoints: 0,
        categoryWeekly: { Respectful: 0, Responsible: 0, Learner: 0 },
        pet: null
      }));

    const initialDailyQuests = await generateDailyQuests();
    const initialWeeklyQuests = await generateWeeklyQuests();

    const newClass = {
      id: Date.now().toString(),
      name: newClassName.trim(),
      students: studentList,
      dailyQuests: initialDailyQuests,
      weeklyQuests: initialWeeklyQuests,
      questTemplates: DEFAULT_QUEST_TEMPLATES,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      const existingData = snap.exists() ? 
        snap.data() : { subscription: 'basic', classes: [] };
      const maxAllowed = existingData.subscription === 'pro' ? 5 : 1;

      if (existingData.classes.length >= maxAllowed) {
        alert(`Your plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
        return;
      }

      const updatedClasses = [...existingData.classes, newClass];
      
      // FIXED: Save both the updated classes and the active class ID
      await setDoc(docRef, { 
        ...existingData, 
        classes: updatedClasses,
        activeClassId: newClass.id // Set the new class as active
      });

      setTeacherClasses(updatedClasses);
      setStudents(newClass.students);
      setCurrentClassId(newClass.id);
      setDailyQuests(initialDailyQuests);
      setWeeklyQuests(initialWeeklyQuests);
      setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
      setNewClassName('');
      setNewClassStudents('');
      showToast('Class imported successfully!');
    } catch (error) {
      console.error("Error importing class:", error);
      alert("Error importing class. Please try again.");
    } finally {
      setSavingData(false);
    }
  };

  // FIXED: Load class with proper quest initialization and active class saving
  const loadClass = async (cls) => {
    const studentsWithCurrency = cls.students.map(updateStudentWithCurrency);
    setStudents(studentsWithCurrency);
    setCurrentClassId(cls.id);
    
    // FIXED: Save this as the active class
    await saveActiveClassToFirebase(cls.id);
    
    // Load saved quests or generate new ones
    const savedDailyQuests = cls.dailyQuests || [];
    const savedWeeklyQuests = cls.weeklyQuests || [];
    
    // Check if we need to generate new quests
    const today = new Date().toISOString().split('T')[0];
    const weekStart = getWeekStart().toISOString().split('T')[0];
    
    let dailyQuestsToUse = savedDailyQuests;
    let weeklyQuestsToUse = savedWeeklyQuests;
    
    // Generate new daily quests if needed
    if (savedDailyQuests.length === 0 || !savedDailyQuests.some(q => q.startDate === today)) {
      dailyQuestsToUse = await generateDailyQuests();
    }
    
    // Generate new weekly quests if needed
    if (savedWeeklyQuests.length === 0 || !savedWeeklyQuests.some(q => q.startDate === weekStart)) {
      weeklyQuestsToUse = await generateWeeklyQuests();
    }
    
    setDailyQuests(dailyQuestsToUse);
    setWeeklyQuests(weeklyQuestsToUse);
    setQuestTemplates(cls.questTemplates || DEFAULT_QUEST_TEMPLATES);
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    showToast(`${cls.name} loaded successfully!`);
  };

  // Shop functions
  const handleShopStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  const handleShopPurchase = (student, item) => {
    const coins = calculateCoins(student);
    const cost = item.price;
    
    if (!canAfford(student, cost)) {
      alert(`${student.firstName} doesn't have enough coins!`);
      return;
    }

    // Deduct XP (5 XP = 1 coin)
    const xpToDeduct = cost * 5;
    setStudents(prev => {
      const updated = prev.map(s => 
        s.id === student.id 
          ? { ...s, totalPoints: Math.max(0, s.totalPoints - xpToDeduct) }
          : s
      );
      saveStudentsToFirebase(updated);
      return updated;
    });

    showToast(`${student.firstName} purchased ${item.name} for ${cost} coins!`);
  };

  // Settings functions
  const handleResetStudentPoints = (studentId) => {
    setStudents(prev => {
      const updated = prev.map(student => 
        student.id === studentId 
          ? {
              ...student,
              respectfulPoints: 0,
              responsiblePoints: 0,
              learnerPoints: 0,
              totalPoints: 0,
              categoryWeekly: { Respectful: 0, Responsible: 0, Learner: 0 }
            }
          : student
      );
      saveStudentsToFirebase(updated);
      return updated;
    });
    showToast('Student points reset successfully!');
  };

  const handleResetAllPoints = () => {
    setStudents(prev => {
      const updated = prev.map(student => ({
        ...student,
        respectfulPoints: 0,
        responsiblePoints: 0,
        learnerPoints: 0,
        totalPoints: 0,
        categoryWeekly: { Respectful: 0, Responsible: 0, Learner: 0 }
      }));
      saveStudentsToFirebase(updated);
      return updated;
    });
    showToast('All student points reset successfully!');
  };

  const handleResetPetSpeeds = () => {
    setStudents(prev => {
      const updated = prev.map(student => 
        student.pet 
          ? {
              ...student,
              pet: {
                ...student.pet,
                speed: Math.floor(Math.random() * 50) + 50,
                strength: Math.floor(Math.random() * 50) + 50,
                intelligence: Math.floor(Math.random() * 50) + 50
              }
            }
          : student
      );
      saveStudentsToFirebase(updated);
      return updated;
    });
    showToast('Pet stats randomized successfully!');
  };

  const handleRemoveStudent = (studentId) => {
    setStudents(prev => {
      const updated = prev.filter(student => student.id !== studentId);
      saveStudentsToFirebase(updated);
      return updated;
    });
    showToast('Student removed successfully!');
  };

  const handleSubscriptionManagement = async () => {
    if (!userData?.stripeCustomerId) {
      router.push('/pricing');
      return;
    }

    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userData.stripeCustomerId })
      });

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Error opening billing portal. Please try again.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      alert('Please enter your feedback message.');
      return;
    }

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          subject: feedbackSubject,
          message: feedbackMessage,
          email: feedbackEmail,
          userId: user.uid
        })
      });

      if (response.ok) {
        showToast('Feedback submitted successfully!');
        setShowFeedbackModal(false);
        setFeedbackSubject('');
        setFeedbackMessage('');
        setFeedbackEmail('');
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    }
  };

  const handleAddQuestTemplate = (newTemplate) => {
    const templateWithId = {
      ...newTemplate,
      id: `custom-${Date.now()}`
    };
    
    setQuestTemplates(prev => {
      const updated = [...prev, templateWithId];
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template added successfully!');
  };

  const handleEditQuestTemplate = (templateId, updatedTemplate) => {
    setQuestTemplates(prev => {
      const updated = prev.map(template => 
        template.id === templateId ? { ...template, ...updatedTemplate } : template
      );
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template updated successfully!');
  };

  const handleDeleteQuestTemplate = (templateId) => {
    setQuestTemplates(prev => {
      const updated = prev.filter(template => template.id !== templateId);
      saveQuestDataToFirebase({ questTemplates: updated });
      return updated;
    });
    
    showToast('Quest template deleted successfully!');
  };

  const handleResetQuestTemplates = () => {
    setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
    saveQuestDataToFirebase({ questTemplates: DEFAULT_QUEST_TEMPLATES });
    showToast('Quest templates reset to defaults!');
  };

  // Props object for all tabs
  const tabProps = {
    students,
    setStudents,
    setActiveTab,
    handleAwardXP,
    handleAvatarClick,
    setSelectedStudent,
    animatingXP,
    setShowAddStudentModal,
    // Multiple XP props
    selectedStudents,
    setSelectedStudents,
    handleStudentSelect,
    handleSelectAll,
    handleDeselectAll,
    showBulkXpPanel,
    setShowBulkXpPanel,
    bulkXpAmount,
    setBulkXpAmount,
    bulkXpCategory,
    setBulkXpCategory,
    handleBulkXpAward,
    // Quest props
    dailyQuests,
    weeklyQuests,
    questTemplates,
    setQuestTemplates,
    checkQuestCompletion: checkQuestCompletionSafely,
    completeQuest,
    markQuestComplete,
    generateDailyQuests,
    generateWeeklyQuests,
    setDailyQuests,
    setWeeklyQuests,
    saveQuestDataToFirebase,
    // Race props
    raceInProgress,
    raceFinished,
    racePositions,
    setRacePositions,
    raceWinner,
    setRaceWinner,
    selectedPrize,
    setSelectedPrize,
    xpAmount,
    setXpAmount,
    selectedPets,
    setSelectedPets,
    showRaceSetup,
    setShowRaceSetup,
    setRaceInProgress,
    setRaceFinished,
    calculateSpeed: (pet) => pet?.speed || 50,
    checkForLevelUp,
    saveStudentsToFirebase,
    // Class props
    newClassName,
    setNewClassName,
    newClassStudents,
    setNewClassStudents,
    teacherClasses,
    setTeacherClasses,
    currentClassId,
    setCurrentClassId,
    handleClassImport,
    loadClass,
    savingData,
    showToast,
    // Settings props
    userData,
    user,
    handleResetStudentPoints,
    handleResetAllPoints,
    handleResetPetSpeeds,
    handleRemoveStudent,
    handleSubscriptionManagement,
    setShowConfirmDialog,
    setShowFeedbackModal,
    feedbackType,
    setFeedbackType,
    feedbackSubject,
    setFeedbackSubject,
    feedbackMessage,
    setFeedbackMessage,
    feedbackEmail,
    setFeedbackEmail,
    handleSubmitFeedback,
    showFeedbackModal,
    router,
    // Shop props
    selectedStudent,
    setSelectedStudent,
    handleShopStudentSelect,
    handleShopPurchase,
    calculateCoins,
    canAfford,
    // Toolkit props
    saveGroupDataToFirebase,
    saveClassroomDataToFirebase,
    // Quest template management
    handleAddQuestTemplate,
    handleEditQuestTemplate,
    handleDeleteQuestTemplate,
    handleResetQuestTemplates
  };

  // ===============================================
  // EFFECTS
  // ===============================================

  // Quest initialization
  useEffect(() => {
    const initializeQuests = async () => {
      if (currentClassId && questTemplates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const weekStart = getWeekStart().toISOString().split('T')[0];
        
        // Check if we need new daily quests
        const needNewDaily = dailyQuests.length === 0 || !dailyQuests.some(q => q.startDate === today);
        
        // Check if we need new weekly quests
        const needNewWeekly = weeklyQuests.length === 0 || !weeklyQuests.some(q => q.startDate === weekStart);
        
        if (needNewDaily) {
          const newDailyQuests = await generateDailyQuests();
          setDailyQuests(newDailyQuests);
        }
        
        if (needNewWeekly) {
          const newWeeklyQuests = await generateWeeklyQuests();
          setWeeklyQuests(newWeeklyQuests);
        }
      }
    };
    
    initializeQuests();
  }, [currentClassId, questTemplates]);

  // Race logic with fixed finish line
  useEffect(() => {
    if (!raceInProgress || selectedPets.length === 0) return;

    const interval = setInterval(() => {
      setRacePositions((prev) => {
        const updated = { ...prev };
        let winnerId = null;

        const getRaceTrackWidth = () => {
          const raceTrack = document.querySelector('.race-track-container');
          if (raceTrack) {
            const rect = raceTrack.getBoundingClientRect();
            return rect.width - 80;
          }
          return 720;
        };

        const trackWidth = getRaceTrackWidth();
        const FINISH_LINE_POSITION = trackWidth;

        // Check for winners BEFORE updating positions
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const currentPosition = updated[id] || 0;
          
          if (currentPosition < FINISH_LINE_POSITION) {
            const speed = student.pet.speed;
            const baseStep = speed * 2;
            const randomMultiplier = 0.8 + Math.random() * 0.4;
            const step = baseStep * randomMultiplier;
            
            const newPosition = Math.min(currentPosition + step, FINISH_LINE_POSITION);
            updated[id] = newPosition;

            // Check if this pet just won
            if (newPosition >= FINISH_LINE_POSITION && !winnerId) {
              winnerId = id;
            }
          }
        }

        // Handle race completion
        if (winnerId && !raceFinished) {
          setTimeout(() => {
            setRaceInProgress(false);
            setRaceFinished(true);
            setRaceWinner(winnerId);

            // Award prize to winner
            if (selectedPrize && xpAmount > 0) {
              for (let i = 0; i < xpAmount; i++) {
                setTimeout(() => handleAwardXP(winnerId, selectedPrize), i * 200);
              }

              // Update race wins
              setStudents(prev => {
                const updatedStudents = prev.map(student => {
                  if (student.id === winnerId && student.pet) {
                    return {
                      ...student,
                      pet: {
                        ...student.pet,
                        raceWins: (student.pet.raceWins || 0) + 1
                      }
                    };
                  }
                  return student;
                });
                saveStudentsToFirebase(updatedStudents);
                return updatedStudents;
              });
            }
          }, 500);
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [raceInProgress, students, selectedPets, selectedPrize, xpAmount, raceFinished]);

  // FIXED: Authentication and user data management with active class loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);

          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            setUserData(data);

            const savedClasses = data.classes || [];
            setTeacherClasses(savedClasses);

            if (savedClasses.length > 0) {
              // FIXED: Load the active class instead of always loading the first class
              const activeClassId = data.activeClassId;
              const activeClass = activeClassId 
                ? savedClasses.find(cls => cls.id === activeClassId)
                : savedClasses[0]; // Fallback to first class if no active class set
              
              if (activeClass) {
                await loadClass(activeClass);
              } else {
                // If activeClassId doesn't match any class, load the first one and update activeClassId
                const firstClass = savedClasses[0];
                await loadClass(firstClass);
                await saveActiveClassToFirebase(firstClass.id);
              }
            } else {
              setStudents([]);
              setCurrentClassId(null);
              // Initialize with empty quests but keep templates
              setDailyQuests([]);
              setWeeklyQuests([]);
              setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
            }

            // Redirect to dashboard if trying to access toolkit without PRO
            if (activeTab === 'toolkit' && data.subscription !== 'pro') {
              setActiveTab('dashboard');
            }
          } else {
            const defaultData = { subscription: 'basic', classes: [] };
            await setDoc(docRef, defaultData);
            setUserData(defaultData);
            setTeacherClasses([]);
            setStudents([]);
            setCurrentClassId(null);
            setDailyQuests([]);
            setWeeklyQuests([]);
            setQuestTemplates(DEFAULT_QUEST_TEMPLATES);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ===============================================
  // RENDER
  // ===============================================

  if (!user || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading Classroom Champions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-4 border-green-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">🏆 Classroom Champions</h1>
              {currentClassId && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {teacherClasses.find(cls => cls.id === currentClassId)?.name || 'Current Class'}
                </span>
              )}
            </div>
            
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
                { id: 'students', label: '👥 Students', icon: '👥' },
                { id: 'shop', label: '🛍️ Shop', icon: '🛍️' },
                { id: 'races', label: '🏁 Races', icon: '🏁' },
                { id: 'classes', label: '📚 Classes', icon: '📚' },
                { id: 'toolkit', label: '🛠️ Toolkit', icon: '🛠️', locked: userData?.subscription !== 'pro' },
                { id: 'settings', label: '⚙️ Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.locked}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-200 relative ${
                    activeTab === tab.id
                      ? 'bg-white text-green-700 shadow-md transform scale-105'
                      : tab.locked
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-green-700 hover:bg-white/50'
                  }`}
                >
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xl">{tab.icon}</span>
                  {tab.locked && (
                    <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent"></div>
          </div>
        }>
          {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
          {activeTab === 'students' && <StudentsTab {...tabProps} />}
          {activeTab === 'shop' && <ShopTab {...tabProps} />}
          {activeTab === 'races' && <PetRaceTab {...tabProps} />}
          {activeTab === 'classes' && <ClassesTab {...tabProps} />}
          {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          {activeTab === 'toolkit' && userData?.subscription === 'pro' && (
            <TeachersToolkitTab {...tabProps} />
          )}
        </Suspense>
      </main>

      {/* Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onAvatarClick={handleAvatarClick}
          />
        )}

        {showAvatarSelectionModal && (
          <AvatarSelectionModal
            currentAvatar={studentForAvatarChange?.avatarBase}
            onSelect={handleAvatarChange}
            onClose={() => {
              setShowAvatarSelectionModal(false);
              setStudentForAvatarChange(null);
            }}
            loading={savingData}
          />
        )}

        {levelUpData && (
          <LevelUpModal
            levelUpData={levelUpData}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {petUnlockData && (
          <PetUnlockModal
            petUnlockData={petUnlockData}
            onClose={() => setPetUnlockData(null)}
          />
        )}

        {showAddStudentModal && (
          <AddStudentModal
            showAddStudentModal={showAddStudentModal}
            setShowAddStudentModal={setShowAddStudentModal}
            newStudentName={newStudentName}
            setNewStudentName={setNewStudentName}
            newStudentAvatar={newStudentAvatar}
            setNewStudentAvatar={setNewStudentAvatar}
            handleAddStudent={handleAddStudent}
            AVATAR_OPTIONS={AVATAR_OPTIONS}
            savingData={savingData}
          />
        )}

        {raceWinner && (
          <RaceWinnerModal
            raceWinner={raceWinner}
            students={students}
            selectedPrize={selectedPrize}
            xpAmount={xpAmount}
            onClose={() => {
              setRaceWinner(null);
              setRacePositions({});
              setRaceFinished(false);
            }}
          />
        )}

        {showRaceSetup && (
          <RaceSetupModal
            {...tabProps}
            onClose={() => setShowRaceSetup(false)}
          />
        )}

        {showQuestCompletion && questCompletionData && (
          <QuestCompletionModal
            questData={questCompletionData}
            onClose={() => {
              setShowQuestCompletion(false);
              setQuestCompletionData(null);
            }}
          />
        )}
      </Suspense>

      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce">
          {showSuccessToast}
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">{showConfirmDialog.title}</h3>
            <p className="text-gray-700 mb-6">{showConfirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  showConfirmDialog.onConfirm();
                  setShowConfirmDialog(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}