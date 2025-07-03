import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ClassroomChampions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);

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

  const [raceInProgress, setRaceInProgress] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [racePositions, setRacePositions] = useState({});
  const [raceWinner, setRaceWinner] = useState(null);
  const [selectedPrize, setSelectedPrize] = useState('XP');
  const [xpAmount, setXpAmount] = useState(1);
  const [selectedPets, setSelectedPets] = useState([]);
  const [showRaceSetup, setShowRaceSetup] = useState(false);

  const [newClassName, setNewClassName] = useState('');
  const [newClassStudents, setNewClassStudents] = useState('');
  const [teacherClasses, setTeacherClasses] = useState([]);

  // New UX states
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

  // Show success toast utility
  const showToast = (message) => {
    setShowSuccessToast(message);
    setTimeout(() => setShowSuccessToast(''), 3000);
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
    const base = pet.speed || 1;
    const level = pet.level || 1;
    const boost = level * 0.5;
    return base + boost;
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
    
    setStudents(prev => prev.map(student => 
      student.id === studentForAvatarChange.id 
        ? { ...student, avatarBase, avatar: newAvatar }
        : student
    ));

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const updatedClasses = data.classes.map(cls => ({
          ...cls,
          students: cls.students.map(student =>
            student.id === studentForAvatarChange.id
              ? { ...student, avatarBase, avatar: newAvatar }
              : student
          )
        }));
        await setDoc(docRef, { ...data, classes: updatedClasses });
      }
      showToast('Avatar updated successfully!');
    } catch (error) {
      console.error("Error updating avatar:", error);
    } finally {
      setSavingData(false);
    }

    setShowAvatarSelectionModal(false);
    setStudentForAvatarChange(null);
  }

  function handleAwardXP(id, category) {
    // Add animation
    setAnimatingXP(prev => ({ ...prev, [id]: category }));
    setTimeout(() => setAnimatingXP(prev => ({ ...prev, [id]: null })), 600);

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        const newTotal = s.totalPoints + 1;
        let updated = {
          ...s,
          totalPoints: newTotal,
          weeklyPoints: s.weeklyPoints + 1,
          categoryTotal: {
            ...s.categoryTotal,
            [category]: (s.categoryTotal[category] || 0) + 1,
          },
          categoryWeekly: {
            ...s.categoryWeekly,
            [category]: (s.categoryWeekly[category] || 0) + 1,
          },
          logs: [
            ...(s.logs || []),
            {
              type: category,
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
      })
    );
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
    showToast(`${cls.name} loaded successfully!`);
  }

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
            } else {
              setStudents([]);
            }
          } else {
            console.log("🆕 No user document, creating default");
            await setDoc(docRef, { subscription: 'basic', classes: [] });
            setTeacherClasses([]);
            setStudents([]);
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

  useEffect(() => {
    if (!raceInProgress || selectedPets.length === 0) return;

    const interval = setInterval(() => {
      setRacePositions((prev) => {
        const updated = { ...prev };
        let winnerId = null;

        for (const id of selectedPets) {
          const student = students.find((s) => s.id === id);
          if (!student?.pet) continue;

          const speed = calculateSpeed(student.pet);
          const step = Math.random() * speed * 4;
          updated[id] = (updated[id] || 0) + step;

          if (updated[id] >= 800 && !raceFinished) {
            winnerId = id;
            break;
          }
        }

        if (winnerId) {
          clearInterval(interval);
          const winner = students.find((s) => s.id === winnerId);
          setRaceWinner(winner);
          setRaceInProgress(false);
          setRaceFinished(true);

          setStudents((prev) =>
            prev.map((s) => {
              if (s.id === winnerId) {
                const updated = {
                  ...s,
                  pet: {
                    ...s.pet,
                    wins: (s.pet.wins || 0) + 1,
                  },
                };

                if (selectedPrize === 'XP') {
                  updated.totalPoints = (updated.totalPoints || 0) + xpAmount;
                  return checkForLevelUp(updated);
                }

                return updated;
              }
              return s;
            })
          );
        }

        return updated;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [raceInProgress, students, selectedPets, selectedPrize, xpAmount, raceFinished]);

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

  const renderDashboard = () => {
    const totalStudents = students.length;
    const studentsWithAvatars = students.filter(s => s.avatar).length;
    const studentsWithPets = students.filter(s => s.pet?.image).length;
    const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const topStudent = students.reduce((top, current) => 
      (current.totalPoints || 0) > (top.totalPoints || 0) ? current : top
    , students[0]);

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Class Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-blue-800 mb-1">Total Students</h3>
                <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <div className="text-4xl text-blue-500">👥</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-green-800 mb-1">With Avatars</h3>
                <p className="text-3xl font-bold text-green-600">{studentsWithAvatars}</p>
              </div>
              <div className="text-4xl text-green-500">🎭</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-purple-800 mb-1">With Pets</h3>
                <p className="text-3xl font-bold text-purple-600">{studentsWithPets}</p>
              </div>
              <div className="text-4xl text-purple-500">🐾</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-yellow-800 mb-1">Total Class XP</h3>
                <p className="text-3xl font-bold text-yellow-600">{totalXP}</p>
              </div>
              <div className="text-4xl text-yellow-500">⭐</div>
            </div>
          </div>
        </div>

        {/* Top Performer */}
        {topStudent && (
          <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-orange-200 p-8 rounded-xl shadow-lg border-2 border-yellow-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-3">🏆</span>
              Top Performer
            </h3>
            <div className="flex items-center space-x-6">
              {topStudent.avatar && (
                <div className="relative">
                  <img 
                    src={topStudent.avatar} 
                    alt={topStudent.firstName} 
                    className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-sm font-bold px-2 py-1 rounded-full shadow">
                    L{topStudent.avatarLevel}
                  </div>
                </div>
              )}
              <div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{topStudent.firstName}</p>
                <p className="text-lg text-yellow-700 flex items-center">
                  <span className="mr-2">⭐</span>
                  Level {topStudent.avatarLevel} • {topStudent.totalPoints} XP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Class Progress */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-2xl mr-3">📈</span>
            Class Progress
          </h3>
          <div className="space-y-4">
            {students.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.firstName} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      {student.firstName.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">{student.firstName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600 text-lg">{student.totalPoints || 0} XP</span>
                  <br />
                  <span className="text-sm text-gray-500">Level {student.avatarLevel}</span>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎒</div>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No students yet</h4>
                <p className="text-gray-500">Add students or load a class to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-2xl mr-3">⚡</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => setActiveTab('students')}
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
                <div className="font-semibold text-blue-800 text-lg">Manage Students</div>
                <div className="text-sm text-blue-600 mt-1">Add XP, view profiles</div>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('race')}
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏁</div>
                <div className="font-semibold text-green-800 text-lg">Start Pet Race</div>
                <div className="text-sm text-green-600 mt-1">Compete for prizes</div>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('classes')}
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
                <div className="font-semibold text-purple-800 text-lg">Manage Classes</div>
                <div className="text-sm text-purple-600 mt-1">Import, switch classes</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
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

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && renderDashboard()}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <span className="text-3xl mr-3">👥</span>
                  Students
                </h2>
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span className="text-xl">+</span>
                  <span>Add Student</span>
                </button>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-8xl mb-6">🎒</div>
                  <h3 className="text-2xl font-bold text-gray-600 mb-4">No students in your class yet</h3>
                  <p className="text-gray-500 mb-8">Add students or load a class from the Classes tab to get started!</p>
                  <button
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                  >
                    Add Your First Student
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="relative bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
                    >
                      <div className="relative w-fit mx-auto cursor-pointer mb-4" onClick={() => setSelectedStudent(student)}>
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={student.firstName}
                            className="w-20 h-20 rounded-full border-4 border-gray-200 object-cover shadow-md hover:shadow-lg transition-shadow"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {student.firstName.charAt(0)}
                          </div>
                        )}
                        {student.pet?.image && (
                          <img
                            src={student.pet.image}
                            alt="Pet"
                            className="w-8 h-8 absolute -top-2 -left-2 rounded-full border-2 border-white shadow-lg"
                          />
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg">
                          ⭐{student.avatarLevel}
                        </div>
                      </div>

                      <div className="font-bold text-gray-800 mb-3 text-lg">{student.firstName}</div>

                      <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                        {student.totalPoints || 0}
                      </div>

                      {/* XP Animation */}
                      {animatingXP[student.id] && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce text-2xl font-bold text-green-500 z-10">
                          +1 XP
                        </div>
                      )}

                      <div className="flex justify-center gap-2 text-lg">
                        <button 
                          title="Respectful" 
                          onClick={() => handleAwardXP(student.id, 'Respectful')} 
                          className="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md"
                        >
                          👍
                        </button>
                        <button 
                          title="Responsible" 
                          onClick={() => handleAwardXP(student.id, 'Responsible')} 
                          className="bg-green-100 hover:bg-green-200 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md"
                        >
                          💼
                        </button>
                        <button 
                          title="Learner" 
                          onClick={() => handleAwardXP(student.id, 'Learner')} 
                          className="bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md"
                        >
                          📚
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pet Race Tab */}
          {activeTab === 'race' && (
            <div className="animate-fade-in">
              <div className="text-center relative">
                <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center justify-center">
                  <span className="text-3xl mr-3">🏁</span>
                  Pet Race Championship
                </h2>

                <div className="flex items-center justify-center gap-6 mb-8 bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center gap-3">
                    <label className="font-bold text-gray-700">🎁 Prize:</label>
                    <select
                      value={selectedPrize}
                      onChange={(e) => setSelectedPrize(e.target.value)}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
                    >
                      <option value="XP">XP Points</option>
                      <option value="Loot">Loot Item</option>
                      <option value="Prize">Classroom Prize</option>
                    </select>
                  </div>

                  {selectedPrize === 'XP' && (
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-700">Amount:</label>
                      <input
                        type="number"
                        value={xpAmount}
                        onChange={(e) => setXpAmount(Number(e.target.value))}
                        className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
                        min="1"
                        max="100"
                      />
                    </div>
                  )}
                </div>

                <button
                  disabled={raceInProgress}
                  onClick={() => setShowRaceSetup(true)}
                  className="mb-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                >
                  {raceInProgress ? 'Race in Progress...' : 'Setup New Race'}
                </button>

                {/* Race Track */}
                <div className="relative h-80 border-4 border-gray-300 bg-gradient-to-r from-green-100 via-yellow-50 to-green-200 overflow-hidden rounded-xl shadow-inner mb-8">
                  {/* Track lanes */}
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="absolute w-full h-16 border-b border-gray-200" style={{ top: `${i * 60}px` }} />
                  ))}
                  
                  {selectedPets.map((id, i) => {
                    const s = students.find(stu => stu.id === id);
                    if (!s?.pet) return null;
                    const x = racePositions[id] || 0;

                    return (
                      <div
                        key={id}
                        className="absolute flex items-center space-x-3 transition-all duration-200 z-10"
                        style={{
                          top: `${i * 60 + 12}px`,
                          left: `${x}px`,
                          transition: 'left 0.2s linear',
                        }}
                      >
                        <img src={s.pet.image} alt="Pet" className="w-16 h-16 rounded-full border-2 border-white shadow-lg" />
                        <span className="bg-white px-2 py-1 rounded-lg text-sm font-bold text-gray-700 shadow">{s.firstName}</span>
                      </div>
                    );
                  })}

                  {/* Finish Line */}
                  <div className="absolute top-0 bottom-0 right-5 w-4 bg-gradient-to-b from-red-500 to-red-600 shadow-lg z-20 rounded">
                    <div className="text-white text-center text-xs font-bold mt-2 transform -rotate-90">FINISH</div>
                  </div>

                  {/* Starting line */}
                  <div className="absolute top-0 bottom-0 left-5 w-1 bg-gray-400 z-20"></div>
                </div>
                
                {/* Pet Champion Leaderboard */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                    <span className="text-2xl mr-2">🏅</span>
                    Pet Champions Hall of Fame
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {students
                      .filter((s) => s.pet?.wins > 0)
                      .sort((a, b) => (b.pet.wins || 0) - (a.pet.wins || 0))
                      .slice(0, 3)
                      .map((s, i) => (
                        <div key={s.id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3">
                          <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                          <img src={s.pet.image} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                          <div>
                            <div className="font-bold text-gray-800">{s.firstName}</div>
                            <div className="text-sm text-gray-600">{s.pet.name} - {s.pet.wins} wins</div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {students.filter((s) => s.pet?.wins > 0).length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">🏁</div>
                      <p className="text-gray-500 italic">No races completed yet. Start your first race!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Classes Tab */}
          {activeTab === 'classes' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
                <span className="text-3xl mr-3">📚</span>
                My Classes
              </h2>

              <div className="bg-gray-50 p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-6 text-gray-700">📘 Import New Class</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Class Name</label>
                    <input
                      type="text"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      placeholder="e.g. Year 5 Gold"
                      className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-3 font-semibold text-gray-700">Student Names (one per line)</label>
                    <textarea
                      value={newClassStudents}
                      onChange={(e) => setNewClassStudents(e.target.value)}
                      rows="4"
                      placeholder="John Smith&#10;Emma Johnson&#10;Michael Brown"
                      className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleClassImport}
                  disabled={savingData}
                  className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center space-x-2"
                >
                  {savingData ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Import Class</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center">
                  <span className="text-xl mr-2">📂</span>
                  Your Saved Classes
                </h3>
                
                {teacherClasses.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">📚</div>
                    <h4 className="text-xl font-semibold text-gray-600 mb-2">No classes saved yet</h4>
                    <p className="text-gray-500">Import your first class above to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teacherClasses.map((cls) => (
                      <div key={cls.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">{cls.name}</h4>
                          <p className="text-gray-600 flex items-center">
                            <span className="mr-2">👥</span>
                            {cls.students.length} students
                          </p>
                        </div>
                        <button
                          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
                          onClick={() => loadClass(cls)}
                        >
                          Load Class
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* Character Sheet Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-modal-appear">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center">
              <span className="mr-3">🎭</span>
              {selectedStudent.firstName}
              <span className="ml-3 text-xl">⭐{selectedStudent.avatarLevel}</span>
            </h2>
            
            {selectedStudent.avatar ? (
              <div className="mb-6">
                <img
                  src={selectedStudent.avatar}
                  className="w-32 h-32 mx-auto rounded-full border-4 border-gray-300 shadow-lg mb-4"
                />
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    setSelectedStudent(null);
                    setTimeout(() => handleAvatarClick(selectedStudent.id), 0);
                  }}
                >
                  🎨 Change Avatar
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
                  {selectedStudent.firstName.charAt(0)}
                </div>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  onClick={() => {
                    handleAvatarClick(selectedStudent.id);
                    setSelectedStudent(null);
                  }}
                >
                  🎨 Choose Avatar
                </button>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-gray-700 mb-4">📊 Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl mb-1">👍</div>
                  <div className="font-semibold">Respectful</div>
                  <div className="text-blue-600 font-bold">{selectedStudent.categoryTotal?.Respectful || 0}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl mb-1">💼</div>
                  <div className="font-semibold">Responsible</div>
                  <div className="text-green-600 font-bold">{selectedStudent.categoryTotal?.Responsible || 0}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl mb-1">📚</div>
                  <div className="font-semibold">Learner</div>
                  <div className="text-purple-600 font-bold">{selectedStudent.categoryTotal?.Learner || 0}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="font-semibold">Total XP</div>
                  <div className="text-yellow-600 font-bold">{selectedStudent.totalPoints}</div>
                </div>
              </div>
            </div>

            {selectedStudent.pet?.image && (
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center justify-center">
                  <span className="mr-2">🐾</span>
                  Pet Companion
                </h3>
                <img
                  src={selectedStudent.pet.image}
                  alt="Pet"
                  className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-gray-300 shadow-lg"
                />
                <div className="text-center">
                  <div className="font-semibold text-gray-800">{selectedStudent.pet.name || 'Unnamed'}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Level {selectedStudent.pet.level || 1} • Speed: {selectedStudent.pet.speed || 1} • Wins: {selectedStudent.pet.wins || 0}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedStudent(null)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      {showAvatarSelectionModal && studentForAvatarChange && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Choose New Avatar for {studentForAvatarChange.firstName}
              </h2>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
                {AVAILABLE_AVATARS.map((avatar) => (
                  <div
                    key={avatar.path}
                    className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300"
                    onClick={() => handleAvatarChange(avatar.base)}
                  >
                    <img
                      src={avatar.path}
                      alt={avatar.base}
                      className="w-full h-full rounded-lg border-2 border-gray-300 hover:border-blue-500 object-cover shadow-md hover:shadow-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {avatar.base}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    setShowAvatarSelectionModal(false);
                    setStudentForAvatarChange(null);
                  }}
                  className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level-Up Modal */}
      {levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full mx-4 transform scale-100 animate-modal-appear">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Level Up!</h2>
            <p className="mb-8 text-xl font-medium text-gray-700">{levelUpData.name} has reached the next level!</p>
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-sm mb-2 text-gray-600 font-semibold">Before</p>
                <img src={levelUpData.oldAvatar} className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-lg" />
              </div>
              <div className="text-4xl">➡️</div>
              <div className="text-center">
                <p className="text-sm mb-2 text-gray-600 font-semibold">After</p>
                <img src={levelUpData.newAvatar} className="w-24 h-24 rounded-full border-4 border-green-400 shadow-lg" />
              </div>
            </div>
            <button
              onClick={() => setLevelUpData(null)}
              className="px-8 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Pet Unlock Modal */}
      {petUnlockData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-modal-appear">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">Pet Unlocked!</h2>
            <p className="mb-6 text-xl text-gray-700">{petUnlockData.firstName}, meet your new companion!</p>
            <img
              src={petUnlockData.pet.image}
              alt="Pet"
              className="w-32 h-32 mx-auto rounded-full border-4 border-green-400 mb-6 shadow-lg"
            />
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name your pet:</label>
              <input
                type="text"
                placeholder="Enter a name"
                className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg mb-3 focus:border-blue-500 transition-colors"
                value={petNameInput}
                onChange={(e) => setPetNameInput(e.target.value)}
              />
              <button
                onClick={() => setPetNameInput(getRandomPetName())}
                className="text-sm text-blue-600 hover:underline font-semibold"
              >
                🎲 Random Name
              </button>
            </div>

            <button
              onClick={() => {
                setStudents((prev) =>
                  prev.map((s) =>
                    s.id === petUnlockData.studentId
                      ? {
                          ...s,
                          pet: {
                            ...petUnlockData.pet,
                            name: petNameInput || getRandomPetName(),
                          },
                        }
                      : s
                  )
                );
                setPetUnlockData(null);
                setPetNameInput('');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Welcome New Pet! 🐾
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Student</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Avatar</label>
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                {AVAILABLE_AVATARS.map((avatar) => (
                  <div
                    key={avatar.path}
                    className="relative group cursor-pointer"
                    onClick={() => setNewStudentAvatar(avatar.path)}
                  >
                    <img
                      src={avatar.path}
                      alt={avatar.base}
                      className={`w-full h-full rounded-lg border-2 object-cover transition-all duration-300 ${
                        newStudentAvatar === avatar.path 
                          ? 'border-blue-600 shadow-lg scale-105' 
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setNewStudentName('');
                  setNewStudentAvatar('');
                }}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newStudentName || !newStudentAvatar) {
                    alert("Please enter a name and choose an avatar");
                    return;
                  }
                  const base = AVAILABLE_AVATARS.find(a => a.path === newStudentAvatar)?.base || '';
                  const newStudent = {
                    id: Date.now().toString(),
                    firstName: newStudentName,
                    avatarBase: base,
                    avatarLevel: 1,
                    avatar: getAvatarImage(base, 1),
                    totalPoints: 0,
                    weeklyPoints: 0,
                    categoryTotal: {},
                    categoryWeekly: {},
                    logs: [],
                    pet: null
                  };
                  setStudents((prev) => [...prev, newStudent]);
                  setNewStudentName('');
                  setNewStudentAvatar('');
                  setShowAddStudentModal(false);
                  showToast('Student added successfully!');
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {raceFinished && raceWinner && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full mx-4 transform scale-100 animate-modal-appear">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-3xl font-bold mb-6 text-green-600">Race Winner!</h3>
            <p className="mb-4 text-xl font-medium text-gray-700">{raceWinner.firstName}'s pet wins the race!</p>
            <img src={raceWinner.pet.image} className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-400 shadow-lg mb-4" />
            <div className="bg-yellow-50 p-4 rounded-lg mb-6">
              <p className="text-lg font-semibold text-yellow-800">Prize: {selectedPrize === 'XP' ? `${xpAmount} XP` : selectedPrize}</p>
            </div>
            <button
              onClick={() => setRaceFinished(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Celebrate! 🎉
            </button>
          </div>
        </div>
      )}

      {/* Race Setup Modal */}
      {showRaceSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full transform scale-100 animate-modal-appear">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">🐾</span>
              Select Racing Pets
            </h2>
            <p className="text-gray-600 mb-6">Choose up to 5 students with pets to compete:</p>

            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto mb-6">
              {students
                .filter((s) => s.pet?.image)
                .map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedPets.includes(s.id)
                        ? 'bg-blue-100 border-blue-400 shadow-md'
                        : 'hover:bg-gray-100 border-gray-300'
                    }`}
                    onClick={() => {
                      if (selectedPets.includes(s.id)) {
                        setSelectedPets((prev) => prev.filter((id) => id !== s.id));
                      } else if (selectedPets.length < 5) {
                        setSelectedPets((prev) => [...prev, s.id]);
                      }
                    }}
                  >
                    <img src={s.pet.image} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">{s.firstName}</div>
                      <div className="text-sm text-gray-600">{s.pet.name || 'Unnamed'}</div>
                    </div>
                    {selectedPets.includes(s.id) && (
                      <div className="text-blue-500 text-xl">✓</div>
                    )}
                  </div>
                ))}
            </div>

            {students.filter((s) => s.pet?.image).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🐾</div>
                <p>No students have pets yet. Students unlock pets at 50 XP!</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRaceSetup(false);
                  setSelectedPets([]);
                }}
                className="flex-1 px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={selectedPets.length === 0}
                onClick={() => {
                  const starters = {};
                  selectedPets.forEach((id) => (starters[id] = 0));
                  setRacePositions(starters);
                  setRaceInProgress(true);
                  setRaceFinished(false);
                  setRaceWinner(null);
                  setShowRaceSetup(false);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
              >
                Start Race! 🏁
              </button>
            </div>
          </div>
        </div>
      )}

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