// classroom-champions.js - Updated with Multiple XP Awards
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Lazy load components
const DashboardTab = React.lazy(() => import('../components/tabs/DashboardTab'));
const StudentsTab = React.lazy(() => import('../components/tabs/StudentsTab'));
const PetRaceTab = React.lazy(() => import('../components/tabs/PetRaceTab'));
const ClassesTab = React.lazy(() => import('../components/tabs/ClassesTab'));

// Lazy load modals
const CharacterSheetModal = React.lazy(() => import('../components/modals/CharacterSheetModal'));
const AvatarSelectionModal = React.lazy(() => import('../components/modals/AvatarSelectionModal'));
const LevelUpModal = React.lazy(() => import('../components/modals/LevelUpModal'));
const PetUnlockModal = React.lazy(() => import('../components/modals/PetUnlockModal'));
const AddStudentModal = React.lazy(() => import('../components/modals/AddStudentModal'));
const RaceWinnerModal = React.lazy(() => import('../components/modals/RaceWinnerModal'));
const RaceSetupModal = React.lazy(() => import('../components/modals/RaceSetupModal'));

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

// Tab Loading component
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

export default function ClassroomChampions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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

  // UX states
  const [savingData, setSavingData] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');
  const [animatingXP, setAnimatingXP] = useState({});

  const MAX_LEVEL = 4;

  const AVAILABLE_AVATARS = [
    { base: "Alchemist F", path: "/avatars/Alchemist%20F/Level%201.png" },
    { base: "Alchemist M", path: "/avatars/Alchemist%20M/Level%201.png" },
    { base: "Archer F", path: "/avatars/Archer%20F/Level%201.png" },
    { base: "Archer M", path: "/avatars/Archer%20M/Level%201.png" },
    { base: "Barbarian F", path: "/avatars/Barbarian%20F/Level%201.png" },
    { base: "Barbarian M", path: "/avatars/Barbarian%20M/Level%201.png" },
    { base: "Bard F", path: "/avatars/Bard%20F/Level%201.png" },
    { base: "Bard M", path: "/avatars/Bard%20M/Level%201.png" },
    { base: "Beastmaster F", path: "/avatars/Beastmaster%20F/Level%201.png" },
    { base: "Beastmaster M", path: "/avatars/Beastmaster%20M/Level%201.png" },
    { base: "Cleric F", path: "/avatars/Cleric%20F/Level%201.png" },
    { base: "Cleric M", path: "/avatars/Cleric%20M/Level%201.png" },
    { base: "Crystal Sage F", path: "/avatars/Crystal%20Sage%20F/Level%201.png" },
    { base: "Crystal Sage M", path: "/avatars/Crystal%20Sage%20M/Level%201.png" },
    { base: "Druid F", path: "/avatars/Druid%20F/Level%201.png" },
    { base: "Druid M", path: "/avatars/Druid%20M/Level%201.png" },
    { base: "Engineer F", path: "/avatars/Engineer%20F/Level%201.png" },
    { base: "Engineer M", path: "/avatars/Engineer%20M/Level%201.png" },
    { base: "Ice Mage F", path: "/avatars/Ice%20Mage%20F/Level%201.png" },
    { base: "Ice Mage M", path: "/avatars/Ice%20Mage%20M/Level%201.png" },
    { base: "Illusionist F", path: "/avatars/Illusionist%20F/Level%201.png" },
    { base: "Illusionist M", path: "/avatars/Illusionist%20M/Level%201.png" },
    { base: "Knight F", path: "/avatars/Knight%20F/Level%201.png" },
    { base: "Knight M", path: "/avatars/Knight%20M/Level%201.png" },
    { base: "Monk F", path: "/avatars/Monk%20F/Level%201.png" },
    { base: "Monk M", path: "/avatars/Monk%20M/Level%201.png" },
    { base: "Necromancer F", path: "/avatars/Necromancer%20F/Level%201.png" },
    { base: "Necromancer M", path: "/avatars/Necromancer%20M/Level%201.png" },
    { base: "Orc F", path: "/avatars/Orc%20F/Level%201.png" },
    { base: "Orc M", path: "/avatars/Orc%20M/Level%201.png" },
    { base: "Paladin F", path: "/avatars/Paladin%20F/Level%201.png" },
    { base: "Paladin M", path: "/avatars/Paladin%20M/Level%201.png" },
    { base: "Rogue F", path: "/avatars/Rogue%20F/Level%201.png" },
    { base: "Rogue M", path: "/avatars/Rogue%20M/Level%201.png" },
    { base: "Sky Knight F", path: "/avatars/Sky%20Knight%20F/Level%201.png" },
    { base: "Sky Knight M", path: "/avatars/Sky%20Knight%20M/Level%201.png" },
    { base: "Time Mage F", path: "/avatars/Time%20Mage%20F/Level%201.png" },
    { base: "Time Mage M", path: "/avatars/Time%20Mage%20M/Level%201.png" },
    { base: "Wizard F", path: "/avatars/Wizard%20F/Level%201.png" },
    { base: "Wizard M", path: "/avatars/Wizard%20M/Level%201.png" }
  ];

  const PETS = [
    "Alchemist", "Barbarian", "Bard", "Beastmaster", "Cleric", "Crystal Knight",
    "Crystal Sage", "Dream", "Druid", "Engineer", "Frost Mage", "Illusionist",
    "Knight", "Lightning", "Monk", "Necromancer", "Orc", "Paladin", "Rogue",
    "Stealth", "Time Knight", "Warrior", "Wizard"
  ];

  const PET_NAMES = [
    "Flamepaw", "Shadowtail", "Brightfang", "Mysticwhisker", "Stormclaw",
    "Ironhoof", "Swiftbeak", "Frostwhisker", "Moonfang", "Nightclaw"
  ];

  // Utility functions
  const showToast = (message) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(''), 3000);
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

  function getAvatarImage(base, level) {
    return `/avatars/${base.replaceAll(" ", "%20")}/Level%20${level}.png`;
  }

  function getRandomPet() {
    const type = PETS[Math.floor(Math.random() * PETS.length)];
    return {
      image: `/Pets/${type}.png`,
      level: 1,
      speed: 1,
      wins: 0,
      name: ''
    };
  }

  function getRandomPetName() {
    return PET_NAMES[Math.floor(Math.random() * PET_NAMES.length)];
  }

  function calculateSpeed(pet) {
    const baseSpeed = pet.speed || 1;
    const level = pet.level || 1;
    
    // Very small level bonus to keep races competitive
    const levelBonus = (level - 1) * 0.05;
    
    return Math.max(baseSpeed + levelBonus, 0.8);
  }

  function checkForLevelUp(student) {
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
  }

  function handleAvatarClick(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setStudentForAvatarChange(student);
      setShowAvatarSelectionModal(true);
    }
  }

  async function handleAvatarChange(avatarBase) {
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

    try {
      showToast('Avatar updated successfully!');
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setSavingData(false);
    }

    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
  }

  function handleAwardXP(id, category, amount = 1) {
    setAnimatingXP(prev => ({ ...prev, [id]: category }));
    setTimeout(() => setAnimatingXP(prev => ({ ...prev, [id]: null })), 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (s.id !== id) return s;

        const newTotal = s.totalPoints + amount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: s.weeklyPoints + amount,
          categoryTotal: {
            ...s.categoryTotal,
            [category]: (s.categoryTotal[category] || 0) + amount,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [category]: (s.categoryWeekly[category] || 0) + amount,
          },
          logs: [
            ...(s.logs || []),
            {
              type: category,
              amount: amount,
              date: new Date().toISOString(),
              source: "manual",
            },
          ],
        };

        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: s.id,
            firstName: s.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
  }

  // New function for bulk XP awards
  function handleBulkXpAward() {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student");
      return;
    }

    setSavingData(true);
    
    // Animate all selected students
    selectedStudents.forEach(id => {
      setAnimatingXP(prev => ({ ...prev, [id]: bulkXpCategory }));
    });

    setTimeout(() => {
      selectedStudents.forEach(id => {
        setAnimatingXP(prev => ({ ...prev, [id]: null }));
      });
    }, 600);

    setStudents((prev) => {
      const updatedStudents = prev.map((s) => {
        if (!selectedStudents.includes(s.id)) return s;

        const newTotal = s.totalPoints + bulkXpAmount;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: s.weeklyPoints + bulkXpAmount,
          categoryTotal: {
            ...s.categoryTotal,
            [bulkXpCategory]: (s.categoryTotal[bulkXpCategory] || 0) + bulkXpAmount,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [bulkXpCategory]: (s.categoryWeekly[bulkXpCategory] || 0) + bulkXpAmount,
          },
          logs: [
            ...(s.logs || []),
            {
              type: bulkXpCategory,
              amount: bulkXpAmount,
              date: new Date().toISOString(),
              source: "bulk",
            },
          ],
        };

        if (!s.pet?.image && newTotal >= 50) {
          const newPet = getRandomPet();
          setPetNameInput(getRandomPetName());
          setPetUnlockData({
            studentId: s.id,
            firstName: s.firstName,
            pet: newPet,
          });
        }

        return checkForLevelUp(updated);
      });

      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });

    // Clear selections and close panel
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
    setSavingData(false);
    
    const studentNames = selectedStudents.length === students.length 
      ? 'the entire class'
      : `${selectedStudents.length} students`;
    
    showToast(`Awarded ${bulkXpAmount} XP to ${studentNames}!`);
  }

  // Student selection functions
  function handleStudentSelect(studentId) {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  }

  function handleSelectAll() {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  }

  function handleDeselectAll() {
    setSelectedStudents([]);
    setShowBulkXpPanel(false);
  }

  async function handleClassImport() {
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
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          firstName: name,
          avatarBase: '',
          avatarLevel: 1,
          avatar: '',
          totalPoints: 0,
          weeklyPoints: 0,
          categoryTotal: {},
          categoryWeekly: {},
          logs: [],
          pet: null
        };
      });

    const newClass = {
      id: 'class-' + Date.now(),
      name: newClassName,
      students: studentsArray
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
      await setDoc(docRef, { ...existingData, classes: updatedClasses });

      setTeacherClasses(updatedClasses);
      setStudents(newClass.students);
      setCurrentClassId(newClass.id);
      setNewClassName('');
      setNewClassStudents('');
      showToast('Class imported successfully!');
    } catch (error) {
      console.error("Error importing class:", error);
      alert("Error importing class. Please try again.");
    } finally {
      setSavingData(false);
    }
  }

  function loadClass(cls) {
    setStudents(cls.students);
    setCurrentClassId(cls.id);
    setSelectedStudents([]); // Clear selections when switching classes
    setShowBulkXpPanel(false);
    showToast(`${cls.name} loaded successfully!`);
  }

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
    calculateSpeed,
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
    showToast
  };

  // Modal props
  const modalProps = {
    // Common
    students,
    setStudents,
    AVAILABLE_AVATARS,
    getAvatarImage,
    getRandomPetName,
    saveStudentsToFirebase,
    showToast,
    setSavingData,
    // Character sheet
    selectedStudent,
    setSelectedStudent,
    handleAvatarClick,
    // Avatar selection
    showAvatarSelectionModal,
    setShowAvatarSelectionModal,
    studentForAvatarChange,
    setStudentForAvatarChange,
    handleAvatarChange,
    savingData,
    // Level up
    levelUpData,
    setLevelUpData,
    // Pet unlock
    petUnlockData,
    setPetUnlockData,
    petNameInput,
    setPetNameInput,
    // Add student
    showAddStudentModal,
    setShowAddStudentModal,
    newStudentName,
    setNewStudentName,
    newStudentAvatar,
    setNewStudentAvatar,
    // Race
    raceFinished,
    setRaceFinished,
    raceWinner,
    selectedPrize,
    xpAmount,
    showRaceSetup,
    setShowRaceSetup,
    selectedPets,
    setSelectedPets,
    setRacePositions,
    setRaceInProgress,
    setRaceWinner
  };

  // Race logic (keeping the existing problematic one for now)
  useEffect(() => {
    if (!raceInProgress || selectedPets.length === 0) return;

    const interval = setInterval(() => {
      setRacePositions((prev) => {
        const updated = { ...prev };
        let winnerId = null;

        // Dynamic finish line calculation
        const getRaceTrackWidth = () => {
          const raceTrack = document.querySelector('.race-track-container');
          if (raceTrack) {
            const rect = raceTrack.getBoundingClientRect();
            return rect.width;
          }
          return 800; // fallback
        };

        const trackWidth = getRaceTrackWidth();
        const FINISH_LINE_POSITION = Math.max(trackWidth - 45, 700);

        // First, check for winners WITHOUT updating positions
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const currentPosition = updated[id] || 0;
          const speed = calculateSpeed(student.pet);
          const baseStep = speed * 2;
          const randomMultiplier = 0.8 + Math.random() * 0.4;
          const step = baseStep * randomMultiplier;
          const newPosition = currentPosition + step;

          // Check if this pet would cross the finish line
          if (currentPosition < FINISH_LINE_POSITION && newPosition >= FINISH_LINE_POSITION && !raceFinished) {
            winnerId = id;
            break;
          }
        }

        // If we found a winner, DON'T update any positions, just end the race
        if (winnerId) {
          clearInterval(interval);
          
          const winner = students.find((s) => s.id === winnerId);
          setRaceWinner(winner);
          setRaceInProgress(false);
          setRaceFinished(true);

          // Award prizes
          setStudents((prev) => {
            const updatedStudents = prev.map((s) => {
              if (s.id === winnerId) {
                const updated = {
                  ...s,
                  pet: {
                    ...s.pet,
                    wins: (s.pet.wins || 0) + 1,
                    speed: (s.pet.speed || 1) + 0.02
                  },
                };

                if (selectedPrize === 'XP') {
                  updated.totalPoints = (updated.totalPoints || 0) + xpAmount;
                  return checkForLevelUp(updated);
                }

                return updated;
              }
              return s;
            });

            saveStudentsToFirebase(updatedStudents);
            return updatedStudents;
          });

          return prev;
        }

        // Only update positions if no winner was found
        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const speed = calculateSpeed(student.pet);
          const baseStep = speed * 2;
          const randomMultiplier = 0.8 + Math.random() * 0.4;
          const step = baseStep * randomMultiplier;
          
          const currentPosition = updated[id] || 0;
          const newPosition = currentPosition + step;
          
          updated[id] = newPosition;
        }

        return updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [raceInProgress, students, selectedPets, selectedPrize, xpAmount, raceFinished]);

  // Main auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("👤 onAuthStateChanged triggered");
      try {
        if (user) {
          console.log("✅ User detected:", user.uid);
          setUser(user);

          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);

          if (snap.exists()) {
            const data = snap.data();
            console.log("📦 User data from Firestore:", data);

            const savedClasses = data.classes || [];
            setTeacherClasses(savedClasses);

            if (savedClasses.length > 0) {
              setStudents(savedClasses[0].students);
              setCurrentClassId(savedClasses[0].id);
            } else {
              setStudents([]);
              setCurrentClassId(null);
            }
          } else {
            console.log("🆕 No user document, creating default");
            await setDoc(docRef, { subscription: 'basic', classes: [] });
            setTeacherClasses([]);
            setStudents([]);
            setCurrentClassId(null);
          }
        } else {
          console.log("🚫 No user signed in — redirecting to login");
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Error in auth listener:", error);
      } finally {
        console.log("✅ Done loading user");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Loading Classroom Champions</h2>
          <p className="text-gray-500">Preparing your adventure...</p>
        </div>
      </div>
    );
  }

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
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'students', label: 'Students', icon: '👥' },
            { id: 'race', label: 'Pet Race', icon: '🏁' },
            { id: 'classes', label: 'My Classes', icon: '📚' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content with Suspense */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <Suspense fallback={<TabLoadingSpinner />}>
            {activeTab === 'dashboard' && <DashboardTab {...tabProps} />}
            {activeTab === 'students' && <StudentsTab {...tabProps} />}
            {activeTab === 'race' && <PetRaceTab {...tabProps} />}
            {activeTab === 'classes' && <ClassesTab {...tabProps} />}
          </Suspense>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span className="font-semibold">{showSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {savingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Saving changes...</p>
          </div>
        </div>
      )}

      {/* Lazy-loaded Modals */}
      <Suspense fallback={null}>
        {selectedStudent && (
          <CharacterSheetModal {...modalProps} />
        )}
        {showAvatarSelectionModal && (
          <AvatarSelectionModal {...modalProps} />
        )}
        {levelUpData && (
          <LevelUpModal {...modalProps} />
        )}
        {petUnlockData && (
          <PetUnlockModal {...modalProps} />
        )}
        {showAddStudentModal && (
          <AddStudentModal {...modalProps} />
        )}
        {raceFinished && raceWinner && (
          <RaceWinnerModal {...modalProps} />
        )}
        {showRaceSetup && (
          <RaceSetupModal {...modalProps} />
        )}
      </Suspense>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        @keyframes modal-appear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-modal-appear {
          animation: modal-appear 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}