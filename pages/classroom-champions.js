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

  function handleAwardXP(id, category) {
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
    if (!newClassName.trim() || !newClassStudents.trim()) return;

    const studentsArray = newClassStudents
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => {
        const randomAvatar = AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          firstName: name,
          avatarBase: randomAvatar.base,
          avatarLevel: 1,
          avatar: getAvatarImage(randomAvatar.base, 1),
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
  }

  function loadClass(cls) {
    setStudents(cls.students);
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

  if (loading) return <div className="p-10 text-center text-xl">Loading...</div>;
  return (
    <div className="p-6 max-w-screen-xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Classroom Champions</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 rounded ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Dashboard</button>
        <button onClick={() => setActiveTab("students")} className={`px-4 py-2 rounded ${activeTab === "students" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Students</button>
        <button onClick={() => setActiveTab("race")} className={`px-4 py-2 rounded ${activeTab === "race" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Pet Race</button>
        <button onClick={() => setActiveTab("classes")} className={`px-4 py-2 rounded ${activeTab === "classes" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>My Classes</button>
      </div>

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700"
          >
            + Add Student
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="relative bg-white rounded-lg p-4 text-center shadow hover:shadow-md transition"
              >
                <div className="relative w-fit mx-auto cursor-pointer" onClick={() => setSelectedStudent(student)}>
                  <img
                    src={student.avatar}
                    alt={student.firstName}
                    className="w-16 h-16 rounded-full border-2 border-gray-300 object-cover"
                  />
                  {student.pet?.image && (
                    <img
                      src={student.pet.image}
                      alt="Pet"
                      className="w-6 h-6 absolute -top-2 -left-2 rounded-full border border-white shadow"
                    />
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                    ⭐{student.avatarLevel}
                  </div>
                </div>

                <div className="font-semibold text-gray-800 mt-2">{student.firstName}</div>

                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                  {student.totalPoints || 0}
                </div>

                <div className="mt-3 flex justify-center gap-2 text-lg">
                  <button title="Respectful" onClick={() => handleAwardXP(student.id, 'Respectful')} className="bg-gray-100 hover:bg-blue-100 px-2 py-1 rounded-full">👍</button>
                  <button title="Responsible" onClick={() => handleAwardXP(student.id, 'Responsible')} className="bg-gray-100 hover:bg-blue-100 px-2 py-1 rounded-full">💼</button>
                  <button title="Learner" onClick={() => handleAwardXP(student.id, 'Learner')} className="bg-gray-100 hover:bg-blue-100 px-2 py-1 rounded-full">📚</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pet Race Tab */}
      {activeTab === 'race' && (
        <div className="bg-white p-6 rounded shadow text-center relative">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">🐾 Pet Race</h2>

          <div className="flex items-center justify-center gap-3 mb-4">
            <label className="text-sm font-semibold">🎁 Prize:</label>
            <select
              value={selectedPrize}
              onChange={(e) => setSelectedPrize(e.target.value)}
              className="px-3 py-1 border rounded"
            >
              <option value="XP">XP</option>
              <option value="Loot">Loot Item</option>
              <option value="Prize">Classroom Prize</option>
            </select>

            {selectedPrize === 'XP' && (
              <input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(Number(e.target.value))}
                className="w-20 px-2 py-1 border rounded text-sm"
                min="1"
                max="100"
              />
            )}
          </div>

          <button
            disabled={raceInProgress}
            onClick={() => setShowRaceSetup(true)}
            className="mb-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Select Racers
          </button>

          <div className="relative h-[300px] border-t border-b border-gray-300 bg-gradient-to-r from-white to-sky-100 overflow-hidden rounded-md">
            {selectedPets.map((id, i) => {
              const s = students.find(stu => stu.id === id);
              if (!s?.pet) return null;
              const x = racePositions[id] || 0;

              return (
                <div
                  key={id}
                  className="absolute flex items-center space-x-2 transition-all duration-100"
                  style={{
                    top: `${i * 60}px`,
                    left: `${x}px`,
                    transition: 'left 0.2s linear',
                  }}
                >
                  <img src={s.pet.image} alt="Pet" className="w-12 h-12 rounded-full border shadow" />
                  <span className="text-sm font-semibold text-gray-700">{s.firstName}</span>
                </div>
              );
            })}

            {/* Finish Line */}
            <div className="absolute top-0 bottom-0 right-[20px] w-2 bg-red-500 shadow-lg z-10" />
          </div>
          {/* Pet Champion Leaderboard */}
          <div className="mt-8 text-left">
            <h3 className="text-lg font-bold text-gray-700 mb-2">🏅 Pet Champions</h3>
            <ul className="text-sm text-gray-800 space-y-1">
              {students
                .filter((s) => s.pet?.wins > 0)
                .sort((a, b) => (b.pet.wins || 0) - (a.pet.wins || 0))
                .slice(0, 3)
                .map((s, i) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="font-bold">#{i + 1}</span>
                    <img src={s.pet.image} className="w-6 h-6 rounded-full border" />
                    <span>{s.firstName}&apos;s {s.pet.name} – {s.pet.wins} wins</span>
                  </li>
                ))}
              {students.filter((s) => s.pet?.wins > 0).length === 0 && (
                <li className="text-gray-400 italic">No races yet.</li>
              )}
            </ul>
          </div>

          {/* Winner Modal */}
          {raceFinished && raceWinner && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4 text-green-600">🏆 Winner!</h3>
                <p className="mb-2 text-lg">{raceWinner.firstName}&apos;s pet wins the race!</p>
                <img src={raceWinner.pet.image} className="w-24 h-24 mx-auto rounded-full border shadow mb-2" />
                <p className="text-sm italic text-gray-500">Prize: {selectedPrize === 'XP' ? `${xpAmount} XP` : selectedPrize}</p>
                <button
                  onClick={() => setRaceFinished(false)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Race Setup Modal */}
          {showRaceSetup && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">🐾 Select Pets to Race</h2>
                <p className="text-sm text-gray-600 mb-3">Choose up to 5 students with pets:</p>

                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {students
                    .filter((s) => s.pet?.image)
                    .map((s) => (
                      <div
                        key={s.id}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition ${
                          selectedPets.includes(s.id)
                            ? 'bg-blue-100 border-blue-400'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          if (selectedPets.includes(s.id)) {
                            setSelectedPets((prev) => prev.filter((id) => id !== s.id));
                          } else if (selectedPets.length < 5) {
                            setSelectedPets((prev) => [...prev, s.id]);
                          }
                        }}
                      >
                        <img src={s.pet.image} className="w-8 h-8 rounded-full" />
                        <span className="text-sm">{s.firstName}</span>
                      </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => {
                      setShowRaceSetup(false);
                      setSelectedPets([]);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start Race
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Classes Tab */}
      {activeTab === 'classes' && (
        <div className="bg-white p-6 rounded shadow text-left">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">📘 My Classes</h2>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Class Name</label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Year 5 Gold"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Paste Student Names</label>
            <textarea
              value={newClassStudents}
              onChange={(e) => setNewClassStudents(e.target.value)}
              rows="6"
              placeholder="Enter one student per line"
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <button
            onClick={handleClassImport}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          >
            Upload Class
          </button>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2 text-gray-700">📂 Your Saved Classes</h3>
            <ul className="space-y-2">
              {teacherClasses.map((cls) => (
                <li key={cls.id} className="bg-gray-100 p-3 rounded shadow flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{cls.name}</p>
                    <p className="text-sm text-gray-600">{cls.students.length} students</p>
                  </div>
                  <button
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => loadClass(cls)}
                  >
                    Load
                  </button>
                </li>
              ))}
              {teacherClasses.length === 0 && (
                <li className="text-gray-500 italic">No saved classes yet.</li>
              )}
            </ul>
          </div>
        </div>
      )}
      {/* Character Sheet Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              {selectedStudent.firstName} – ⭐{selectedStudent.avatarLevel}
            </h2>
            <img src={selectedStudent.avatar} className="w-40 h-40 mx-auto rounded-full border-4 shadow mb-4" />
            <div className="text-left space-y-1 text-sm font-medium">
              <p>👍 Respectful: {selectedStudent.categoryTotal?.Respectful || 0}</p>
              <p>💼 Responsible: {selectedStudent.categoryTotal?.Responsible || 0}</p>
              <p>📚 Learner: {selectedStudent.categoryTotal?.Learner || 0}</p>
              <p className="mt-2">🕐 Weekly XP: {selectedStudent.weeklyPoints}</p>
              <p>💯 Total XP: {selectedStudent.totalPoints}</p>
            </div>

            {selectedStudent.pet?.image && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-2">🐾 Pet</h3>
                <img
                  src={selectedStudent.pet.image}
                  alt="Pet"
                  className="w-24 h-24 mx-auto mb-2 rounded-full border shadow"
                />
                <div className="text-sm text-gray-700 font-medium">
                  {selectedStudent.pet.name || 'Unnamed'} — Level {selectedStudent.pet.level || 1}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Speed: {selectedStudent.pet.speed || 1} | Wins: {selectedStudent.pet.wins || 0}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Level-Up Modal */}
      {levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
            <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Level Up!</h2>
            <p className="mb-6 text-lg font-medium">{levelUpData.name} has reached the next level!</p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div>
                <p className="text-sm mb-1 text-gray-600">Before</p>
                <img src={levelUpData.oldAvatar} className="w-20 h-20 rounded-full border-2" />
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-600">After</p>
                <img src={levelUpData.newAvatar} className="w-20 h-20 rounded-full border-2" />
              </div>
            </div>
            <button
              onClick={() => setLevelUpData(null)}
              className="mt-2 px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Pet Unlock Modal */}
      {petUnlockData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-3">🎉 You&apos;ve unlocked a pet!</h2>
            <p className="mb-4 text-lg">{petUnlockData.firstName}, meet your new companion!</p>
            <img
              src={petUnlockData.pet.image}
              alt="Pet"
              className="w-32 h-32 mx-auto rounded-full border-2 mb-4 shadow"
            />
            <input
              type="text"
              placeholder="Enter a name"
              className="w-full border px-3 py-2 rounded mb-2"
              value={petNameInput}
              onChange={(e) => setPetNameInput(e.target.value)}
            />
            <button
              onClick={() => setPetNameInput(getRandomPetName())}
              className="text-sm text-blue-600 hover:underline mb-4"
            >
              🎲 Random Name
            </button>

            <div className="flex justify-end gap-4 mt-4">
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Student</h2>

            <input
              type="text"
              placeholder="First name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              className="w-full mb-3 px-4 py-2 border rounded"
            />

            <label className="block mb-2 font-semibold">Choose Avatar</label>
            <div className="flex flex-wrap gap-3 mb-4 max-h-[200px] overflow-y-auto">
              {AVAILABLE_AVATARS.map((avatar) => (
                <div
                  key={avatar.path}
                  className="relative group cursor-pointer"
                  onClick={() => setNewStudentAvatar(avatar.path)}
                >
                  <img
                    src={avatar.path}
                    alt={avatar.base}
                    className={`w-14 h-14 rounded-full border-2 object-cover ${
                      newStudentAvatar === avatar.path ? 'border-blue-600' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 p-2 bg-white border rounded shadow z-10">
                    {[2, 3, 4].map((lvl) => (
                      <img
                        key={lvl}
                        src={`/avatars/${avatar.base.replaceAll(' ', '%20')}/Level%20${lvl}.png`}
                        alt={`Level ${lvl}`}
                        className="w-10 h-10 rounded object-cover border border-gray-300"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newStudentName || !newStudentAvatar) return;
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
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
