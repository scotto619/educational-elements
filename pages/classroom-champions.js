// classroom-champions.js - COMPLETE WITH NEW QUEST TAB SYSTEM
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Lazy load components
const DashboardTab = React.lazy(() => import('../components/tabs/DashboardTab'));
const StudentsTab = React.lazy(() => import('../components/tabs/StudentsTab'));
const QuestTab = React.lazy(() => import('../components/tabs/QuestTab')); // NEW: Quest Tab
const ShopTab = React.lazy(() => import('../components/tabs/ShopTab'));
const PetRaceTab = React.lazy(() => import('../components/tabs/PetRaceTab'));
const GamesTab = React.lazy(() => import('../components/tabs/GamesTab'));
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

// ===============================================
// QUEST SYSTEM - QUEST GIVERS & DATA
// ===============================================

const QUEST_GIVERS = [
  {
    id: 'guide1',
    name: 'Professor Hoot',
    image: '/Guides/Guide 1.png',
    personality: 'wise',
    role: 'Learning Quest Giver',
    specialty: 'academic',
    greetings: [
      "Wisdom comes to those who seek knowledge! 🦉",
      "Ready for your next learning adventure?",
      "Books and quests await, young scholar!"
    ],
    questTypes: ['learning', 'homework', 'reading'],
    tips: [
      "💡 Tip: Consistent daily learning builds strong foundations!",
      "📚 Remember: Every expert was once a beginner!",
      "🎯 Focus on understanding, not just completing!"
    ]
  },
  {
    id: 'guide2',
    name: 'Captain Clockwork',
    image: '/Guides/Guide 2.png',
    personality: 'punctual',
    role: 'Organization Quest Giver',
    specialty: 'responsibility',
    greetings: [
      "Time for responsibility training! ⏰",
      "A well-organized student is a successful student!",
      "Ready to master the art of responsibility?"
    ],
    questTypes: ['organization', 'punctuality', 'homework'],
    tips: [
      "⏰ Tip: Being on time shows respect for others!",
      "📝 Remember: Organization is the key to success!",
      "🎯 Focus: Small habits create big achievements!"
    ]
  },
  {
    id: 'guide3',
    name: 'Sage Sparkle',
    image: '/Guides/Guide 3.png',
    personality: 'encouraging',
    role: 'Behavior Quest Giver',
    specialty: 'behavior',
    greetings: [
      "Kindness is the greatest magic! ✨",
      "Ready to spread some positive energy?",
      "Let's make the world brighter together!"
    ],
    questTypes: ['kindness', 'helping', 'teamwork'],
    tips: [
      "✨ Tip: A smile can change someone's entire day!",
      "🤝 Remember: Teamwork makes the dream work!",
      "💫 Focus: Be the reason someone believes in good!"
    ]
  },
  {
    id: 'guide4',
    name: 'Master Craft',
    image: '/Guides/Guide 4.png',
    personality: 'creative',
    role: 'Creative Quest Giver',
    specialty: 'creative',
    greetings: [
      "Let your imagination soar! 🎨",
      "Ready to create something amazing?",
      "Art and creativity know no bounds!"
    ],
    questTypes: ['art', 'writing', 'projects'],
    tips: [
      "🎨 Tip: Every masterpiece starts with a single stroke!",
      "💭 Remember: There are no mistakes, only discoveries!",
      "🌟 Focus: Express yourself fearlessly!"
    ]
  },
  {
    id: 'guide5',
    name: 'Coach Thunder',
    image: '/Guides/Guide 5.png',
    personality: 'energetic',
    role: 'Physical Quest Giver',
    specialty: 'physical',
    greetings: [
      "Let's get moving and grooving! 💪",
      "Ready to power up your body?",
      "Strength comes from consistent effort!"
    ],
    questTypes: ['exercise', 'sports', 'health'],
    tips: [
      "💪 Tip: Every step counts on your fitness journey!",
      "🏃 Remember: Your body is capable of amazing things!",
      "⚡ Focus: Energy creates more energy!"
    ]
  }
];

// Constants
const MAX_LEVEL = 4;
const COINS_PER_XP = 5;
const FINISH_LINE_POSITION = 100;

// ===============================================
// UTILITY FUNCTIONS
// ===============================================

const updateStudentWithCurrency = (student) => {
  return {
    ...student,
    totalPoints: student.totalPoints || 0,
    weeklyPoints: student.weeklyPoints || 0,
    categoryTotal: student.categoryTotal || {},
    categoryWeekly: student.categoryWeekly || {},
    coins: student.coins || 0,
    coinsSpent: student.coinsSpent || 0,
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

const getAvatarImage = (avatarBase, level) => {
  if (!avatarBase) return '';
  return `/Avatars/${avatarBase}/Level ${level}.png`;
};

const getRandomPet = () => {
  const pets = [
    { name: 'dragon', image: '/Pets/dragon.png' },
    { name: 'unicorn', image: '/Pets/unicorn.png' },
    { name: 'phoenix', image: '/Pets/phoenix.png' },
    { name: 'griffin', image: '/Pets/griffin.png' },
    { name: 'pegasus', image: '/Pets/pegasus.png' }
  ];
  return pets[Math.floor(Math.random() * pets.length)];
};

const getRandomPetName = () => {
  const names = ['Spark', 'Luna', 'Blaze', 'Storm', 'Nova', 'Echo', 'Frost', 'Ember'];
  return names[Math.floor(Math.random() * names.length)];
};

// Loading components
const LoadingSpinner = () => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Classroom Champions</h2>
        <p className="text-gray-500">Preparing your adventure...</p>
      </div>
    </div>
  </div>
);

const TabLoadingSpinner = () => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-xl font-semibold text-gray-700">Loading tab content...</p>
      </div>
    </div>
  </div>
);

// Currency Display Component
const CurrencyDisplay = ({ student }) => {
  const coins = Math.max(0, Math.floor((student?.totalPoints || 0) / COINS_PER_XP) + (student?.coins || 0) - (student?.coinsSpent || 0));
  const coinsSpent = student?.coinsSpent || 0;
  const xpCoins = Math.floor((student?.totalPoints || 0) / COINS_PER_XP);
  const bonusCoins = student?.coins || 0;
  
  return (
    <div className="flex items-center space-x-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
      <div className="text-center">
        <div className="text-2xl font-bold text-yellow-600">💰</div>
        <div className="text-sm text-yellow-700">Available</div>
        <div className="text-lg font-bold text-yellow-800">{coins}</div>
        <div className="text-xs text-yellow-600">({xpCoins} XP + {bonusCoins} bonus)</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-600">🛍️</div>
        <div className="text-sm text-gray-700">Spent</div>
        <div className="text-lg font-bold text-gray-800">{coinsSpent}</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">⭐</div>
        <div className="text-sm text-blue-700">Total XP</div>
        <div className="text-lg font-bold text-blue-800">{student?.totalPoints || 0}</div>
      </div>
    </div>
  );
};

// ===============================================
// MAIN COMPONENT
// ===============================================

export default function ClassroomChampions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('');
  const [levelUpData, setLevelUpData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [petUnlockData, setPetUnlockData] = useState(null);
  const [petNameInput, setPetNameInput] = useState('');

  // Avatar selection states
  const [showAvatarSelectionModal, setShowAvatarSelectionModal] = useState(false);
  const [studentForAvatarChange, setStudentForAvatarChange] = useState(null);

  // Race states
  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('XP');
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

  // NEW: Quest system states
  const [activeQuests, setActiveQuests] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  // UI states
  const [savingData, setSavingData] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [animatingXP, setAnimatingXP] = useState({});

  // Toast notification function
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // ===============================================
  // FIREBASE FUNCTIONS
  // ===============================================

  // Save students to Firebase
  const saveStudentsToFirebase = async (studentsToSave) => {
    if (!user || !currentClassId) return;

    try {
      setSavingData(true);
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                students: studentsToSave,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    } finally {
      setSavingData(false);
    }
  };

  // Save quest data to Firebase
  const saveQuestDataToFirebase = async (questData) => {
    if (!user || !currentClassId) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => 
          cls.id === currentClassId 
            ? { 
                ...cls, 
                ...questData,
                lastUpdated: new Date().toISOString()
              }
            : cls
        );
        
        await setDoc(docRef, { 
          ...data, 
          classes: updatedClasses 
        });
      }
    } catch (error) {
      console.error("Error saving quest data:", error);
    }
  };

  // Save active class to Firebase
  const saveActiveClassToFirebase = async (classId) => {
    if (!user) return;

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        await setDoc(docRef, { 
          ...data, 
          activeClassId: classId 
        });
      }
    } catch (error) {
      console.error("Error saving active class:", error);
    }
  };

  // ===============================================
  // QUEST MANAGEMENT FUNCTIONS
  // ===============================================

  // Create a new quest
  const handleCreateQuest = (questData) => {
    const newQuest = {
      ...questData,
      id: `quest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      completedBy: []
    };

    setActiveQuests(prev => {
      const updated = [...prev, newQuest];
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    showToast(`Quest "${questData.title}" created successfully!`);
  };

  // Edit an existing quest
  const handleEditQuest = (questId, updatedData) => {
    setActiveQuests(prev => {
      const updated = prev.map(quest => 
        quest.id === questId ? { ...quest, ...updatedData } : quest
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    showToast('Quest updated successfully!');
  };

  // Delete a quest
  const handleDeleteQuest = (questId) => {
    setActiveQuests(prev => {
      const updated = prev.filter(quest => quest.id !== questId);
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    showToast('Quest deleted successfully!');
  };

  // Complete a quest for a student
  const handleCompleteQuest = (questId, studentId, reward) => {
    // Update quest completion
    setActiveQuests(prev => {
      const updated = prev.map(quest => 
        quest.id === questId 
          ? { ...quest, completedBy: [...(quest.completedBy || []), studentId] }
          : quest
      );
      saveQuestDataToFirebase({ activeQuests: updated });
      return updated;
    });

    // Award the reward to the student
    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== studentId) return student;

        let updated = { ...student };

        switch (reward.type) {
          case 'xp':
            const newTotal = updated.totalPoints + reward.amount;
            updated = {
              ...updated,
              totalPoints: newTotal,
              weeklyPoints: (updated.weeklyPoints || 0) + reward.amount,
              categoryTotal: {
                ...updated.categoryTotal,
                [reward.category]: (updated.categoryTotal[reward.category] || 0) + reward.amount,
              },
              categoryWeekly: {
                ...updated.categoryWeekly,
                [reward.category]: (updated.categoryWeekly[reward.category] || 0) + reward.amount,
              },
              logs: [
                ...(updated.logs || []),
                {
                  type: reward.category,
                  amount: reward.amount,
                  date: new Date().toISOString(),
                  source: "quest",
                },
              ],
            };

            // Check for pet unlock
            if (!updated.pet?.image && newTotal >= 50) {
              const newPet = getRandomPet();
              setPetNameInput(getRandomPetName());
              setPetUnlockData({
                studentId: updated.id,
                firstName: updated.firstName,
                pet: newPet,
              });
            }

            // Check for level up
            updated = checkForLevelUp(updated);
            break;

          case 'coins':
            updated = {
              ...updated,
              coins: (updated.coins || 0) + reward.amount,
              logs: [
                ...(updated.logs || []),
                {
                  type: "bonus_coins",
                  amount: reward.amount,
                  date: new Date().toISOString(),
                  source: "quest",
                },
              ],
            };
            break;

          case 'item':
            updated = {
              ...updated,
              inventory: [
                ...(updated.inventory || []),
                {
                  id: `item_${Date.now()}`,
                  name: reward.item,
                  source: 'quest',
                  acquired: new Date().toISOString()
                }
              ],
              logs: [
                ...(updated.logs || []),
                {
                  type: "item_received",
                  item: reward.item,
                  date: new Date().toISOString(),
                  source: "quest",
                },
              ],
            };
            break;
        }

        return updated;
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    const student = students.find(s => s.id === studentId);
    const rewardText = reward.type === 'xp' ? `${reward.amount} ${reward.category} XP` :
                     reward.type === 'coins' ? `${reward.amount} coins` :
                     `item: ${reward.item}`;
    
    showToast(`${student?.firstName} completed quest and earned ${rewardText}!`);
  };

  // Get available quests for a student
  const getAvailableQuests = (student) => {
    return activeQuests.filter(quest => {
      if (quest.completedBy?.includes(student.id)) return false;
      if (quest.assignedTo && quest.assignedTo.length > 0 && !quest.assignedTo.includes(student.id)) return false;
      return true;
    });
  };

  // ===============================================
  // STUDENT MANAGEMENT FUNCTIONS
  // ===============================================

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

  const handleAwardXP = async (studentId, category, amount) => {
    setSavingData(true);
    setAnimatingXP(prev => ({ ...prev, [studentId]: category }));

    setTimeout(() => {
      setAnimatingXP(prev => ({ ...prev, [studentId]: null }));
    }, 1000);

    setStudents(prev => {
      const updatedStudents = prev.map(student => {
        if (student.id !== studentId) return student;

        const newTotal = student.totalPoints + amount;
        let updated = {
          ...student,
          totalPoints: newTotal,
          weeklyPoints: (student.weeklyPoints || 0) + amount,
          lastXpDate: new Date().toISOString(),
          categoryTotal: {
            ...student.categoryTotal,
            [category]: (student.categoryTotal[category] || 0) + amount,
          },
          categoryWeekly: {
            ...student.categoryWeekly,
            [category]: (student.categoryWeekly[category] || 0) + amount,
          },
          logs: [
            ...(student.logs || []),
            {
              type: category,
              amount: amount,
              date: new Date().toISOString(),
              source: "manual",
            },
          ],
        };

        if (!student.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: student.id,
            firstName: student.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    setSavingData(false);
    showToast(`+${amount} ${category} XP awarded!`);
  };

  // ===============================================
  // CLASS MANAGEMENT FUNCTIONS
  // ===============================================

  const handleClassImport = async () => {
    if (!newClassName.trim() || !newClassStudents.trim()) {
      alert("Please fill in both class name and student names");
      return;
    }

    setSavingData(true);

    const studentsArray = newClassStudents
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => {
        return updateStudentWithCurrency({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          firstName: name,
          avatarBase: '',
          avatarLevel: 1,
          avatar: '',
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          coins: 0,
          logs: [],
          pet: null,
          ownedAvatars: [],
          ownedPets: [],
          rewardsPurchased: [],
          inventory: [],
          coinsSpent: 0
        });
      });

    const newClass = {
      id: 'class-' + Date.now(),
      name: newClassName,
      students: studentsArray,
      activeQuests: [], // NEW: Initialize empty quest array
      attendanceData: {},
    };

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      const existingData = snap.exists() ? snap.data() : { subscription: 'basic', classes: [] };
      const maxAllowed = existingData.subscription === 'pro' ? 5 : 1;

      if (existingData.classes.length >= maxAllowed) {
        alert(`Your plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
        return;
      }

      const updatedClasses = [...existingData.classes, newClass];
      
      await setDoc(docRef, { 
        ...existingData, 
        classes: updatedClasses,
        activeClassId: newClass.id
      });

      setTeacherClasses(updatedClasses);
      setStudents(newClass.students);
      setCurrentClassId(newClass.id);
      setActiveQuests([]);
      setAttendanceData({});
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

  const loadClass = async (cls) => {
    await saveActiveClassToFirebase(cls.id);
    
    const studentsWithCurrency = cls.students.map(student => updateStudentWithCurrency(student));
    setStudents(studentsWithCurrency);
    setCurrentClassId(cls.id);
    
    // Load quest and attendance data
    setActiveQuests(cls.activeQuests || []);
    setAttendanceData(cls.attendanceData || {});
    
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    showToast(`${cls.name} loaded successfully!`);
  };

  // ===============================================
  // ATTENDANCE MANAGEMENT
  // ===============================================

  const markAttendance = (studentId, status, date = null) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    setAttendanceData(prev => {
      const updated = {
        ...prev,
        [targetDate]: {
          ...prev[targetDate],
          [studentId]: status
        }
      };
      
      saveQuestDataToFirebase({ attendanceData: updated });
      return updated;
    });

    const student = students.find(s => s.id === studentId);
    showToast(`${student?.firstName} marked as ${status}`);
  };

  // ===============================================
  // AUTHENTICATION & DATA LOADING
  // ===============================================

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

            let savedClasses = data.classes || [];
            
            // Ensure all classes have quest data structure
            const updatedClasses = savedClasses.map(cls => ({
              ...cls,
              activeQuests: cls.activeQuests || [],
              attendanceData: cls.attendanceData || {}
            }));

            setTeacherClasses(updatedClasses);

            if (updatedClasses.length > 0) {
              const activeClassId = data.activeClassId;
              const activeClass = activeClassId 
                ? updatedClasses.find(cls => cls.id === activeClassId)
                : updatedClasses[0];

              if (activeClass) {
                const studentsWithCurrency = activeClass.students.map(student => updateStudentWithCurrency(student));
                setStudents(studentsWithCurrency);
                setCurrentClassId(activeClass.id);
                setActiveQuests(activeClass.activeQuests || []);
                setAttendanceData(activeClass.attendanceData || {});
              }
            }
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ===============================================
  // RENDER
  // ===============================================

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-500">Please log in to access Classroom Champions</p>
          </div>
        </div>
      </div>
    );
  }

  // Tab props for all components
  const tabProps = {
    students,
    handleAwardXP,
    handleAvatarClick: (studentId) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setStudentForAvatarChange(student);
        setShowAvatarSelectionModal(true);
      }
    },
    setSelectedStudent,
    animatingXP,
    setShowAddStudentModal,
    showToast,
    userData,
    // Quest System Props
    activeQuests,
    QUEST_GIVERS,
    onCreateQuest: handleCreateQuest,
    onEditQuest: handleEditQuest,
    onDeleteQuest: handleDeleteQuest,
    onCompleteQuest: handleCompleteQuest,
    getAvailableQuests,
    attendanceData,
    markAttendance,
    // Bulk XP Props
    selectedStudents,
    setSelectedStudents,
    handleStudentSelect: (studentId) => {
      setSelectedStudents(prev => 
        prev.includes(studentId) 
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    },
    handleSelectAll: () => setSelectedStudents(students.map(s => s.id)),
    handleDeselectAll: () => setSelectedStudents([]),
    showBulkXpPanel,
    setShowBulkXpPanel,
    bulkXpAmount,
    setBulkXpAmount,
    bulkXpCategory,
    setBulkXpCategory,
    handleBulkXpAward: () => {
      // Bulk XP award logic here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Classroom Champions
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'students', label: 'Students', icon: '👥' },
            { id: 'quests', label: 'Quests', icon: '⚔️' }, // NEW: Quest Tab
            { id: 'shop', label: 'Shop', icon: '🏪' },
            { id: 'race', label: 'Pet Race', icon: '🏁' },
            { id: 'games', label: 'Games', icon: '🎮' },
            ...(userData?.subscription === 'pro' ? [{ id: 'toolkit', label: 'Teachers Toolkit', icon: '🛠️', isPro: true }] : []),
            { id: 'classes', label: 'My Classes', icon: '📚' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                tab.isPro 
                  ? (activeTab === tab.id 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105" 
                      : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg")
                  : (activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg")
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.isPro && (
                <span className="bg-yellow-400 text-purple-800 text-xs px-2 py-1 rounded-full font-bold">
                  PRO
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content with Suspense */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <Suspense fallback={<TabLoadingSpinner />}>
            {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
            {activeTab === 'students' && <StudentsTab {...tabProps} />}
            {activeTab === 'quests' && <QuestTab {...tabProps} />} {/* NEW: Quest Tab */}
            {activeTab === 'shop' && <ShopTab {...tabProps} />}
            {activeTab === 'race' && <PetRaceTab {...tabProps} />}
            {activeTab === 'games' && <GamesTab {...tabProps} />}
            {activeTab === 'toolkit' && <TeachersToolkitTab {...tabProps} />}
            {activeTab === 'classes' && (
              <ClassesTab 
                {...tabProps}
                teacherClasses={teacherClasses}
                currentClassId={currentClassId}
                loadClass={loadClass}
                newClassName={newClassName}
                setNewClassName={setNewClassName}
                newClassStudents={newClassStudents}
                setNewClassStudents={setNewClassStudents}
                handleClassImport={handleClassImport}
                savingData={savingData}
              />
            )}
            {activeTab === 'settings' && <SettingsTab {...tabProps} />}
          </Suspense>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            QUEST_GIVERS={QUEST_GIVERS}
            activeQuests={activeQuests}
            availableQuests={getAvailableQuests(selectedStudent)}
            onCompleteQuest={handleCompleteQuest}
            showToast={showToast}
          />
        )}

        {showAvatarSelectionModal && (
          <AvatarSelectionModal
            isOpen={showAvatarSelectionModal}
            onClose={() => setShowAvatarSelectionModal(false)}
            onSelectAvatar={(avatarBase) => {
              // Handle avatar change logic
              setShowAvatarSelectionModal(false);
            }}
            showToast={showToast}
          />
        )}

        {levelUpData && (
          <LevelUpModal
            data={levelUpData}
            onClose={() => setLevelUpData(null)}
          />
        )}

        {petUnlockData && (
          <PetUnlockModal
            data={petUnlockData}
            petName={petNameInput}
            onPetNameChange={setPetNameInput}
            onConfirm={() => {
              // Handle pet unlock logic
              setPetUnlockData(null);
            }}
            onClose={() => setPetUnlockData(null)}
          />
        )}
      </Suspense>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Saving Indicator */}
      {savingData && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Saving...
        </div>
      )}
    </div>
  );
}