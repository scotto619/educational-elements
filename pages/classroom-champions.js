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
  const [showAvatarSelectModal, setShowAvatarSelectModal] = useState(false); // NEW
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('');
  const [levelUpData, setLevelUpData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [avatarSelectTarget, setAvatarSelectTarget] = useState(null); // NEW
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

  const PETS = [/* ... no changes ... */];
  const PET_NAMES = [/* ... no changes ... */];

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
  const checkForLevelUp = (student) => {
    if (student.xp >= 300 && student.avatarLevel < 4) return 4;
    if (student.xp >= 200 && student.avatarLevel < 3) return 3;
    if (student.xp >= 100 && student.avatarLevel < 2) return 2;
    return null;
  };

  const handleAwardXP = async (studentId, type, amount) => {
    const updatedStudents = students.map((student) => {
      if (student.id !== studentId) return student;

      const newXP = (student.xp || 0) + amount;
      const levelUp = checkForLevelUp({ ...student, xp: newXP });

      const updated = {
        ...student,
        xp: newXP,
        logs: [
          ...(student.logs || []),
          {
            type,
            amount,
            timestamp: Date.now(),
          },
        ],
      };

      if (levelUp) {
        updated.avatarLevel = levelUp;
        updated.avatar = getAvatarImage(student.avatarBase, levelUp);
        setLevelUpData({
          name: student.firstName,
          newLevel: levelUp,
          avatar: getAvatarImage(student.avatarBase, levelUp),
        });
      }

      return updated;
    });

    setStudents(updatedStudents);

    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const updatedClasses = data.classes.map((cls) =>
      cls.id === data.classes[0].id ? { ...cls, students: updatedStudents } : cls
    );

    await setDoc(userRef, { ...data, classes: updatedClasses });
  };

  const handleClassImport = async () => {
    const names = newClassStudents
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) return;

    const newStudents = names.map((name) => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
      firstName: name,
      avatarBase: '',
      avatarLevel: 1,
      avatar: '',
      xp: 0,
      logs: [],
      pet: null,
    }));

    const newClass = {
      id: Date.now().toString(),
      name: newClassName || 'My Class',
      students: newStudents,
    };

    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const updatedClasses = [...(userData.classes || []), newClass];

    await setDoc(userRef, { ...userData, classes: updatedClasses });

    setTeacherClasses(updatedClasses);
    setNewClassName('');
    setNewClassStudents('');
    setStudents(newStudents);
    setShowAddStudentModal(false);
  };

  const handleChooseAvatarFromProfile = (studentId) => {
    setAvatarSelectTarget(studentId);
    setShowAvatarSelectModal(true);
  };

  const handleConfirmAvatarChoice = async (avatarPath, baseName) => {
    const updatedStudents = students.map((s) => {
      if (s.id !== avatarSelectTarget) return s;

      return {
        ...s,
        avatar: avatarPath,
        avatarBase: baseName,
        avatarLevel: 1,
      };
    });

    setStudents(updatedStudents);
    setShowAvatarSelectModal(false);
    setSelectedStudent(null);

    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const userData = userSnap.data();
    const updatedClasses = userData.classes.map((cls) =>
      cls.id === userData.classes[0].id ? { ...cls, students: updatedStudents } : cls
    );

    await setDoc(userRef, { ...userData, classes: updatedClasses });
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-700">
        Classroom Champions
      </h1>

      <div className="flex justify-center space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          Students
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'race'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
          onClick={() => setActiveTab('race')}
        >
          Pet Race
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white p-4 rounded shadow text-center cursor-pointer hover:shadow-lg relative"
              onClick={() => setSelectedStudent(student)}
            >
              {student.avatar ? (
                <img
                  src={student.avatar}
                  alt=""
                  className="w-24 h-24 rounded-full mx-auto mb-2"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-gray-300 flex items-center justify-center text-2xl text-gray-500">
                  ?
                </div>
              )}
              <p className="font-semibold">{student.firstName}</p>
              <p className="text-sm text-gray-500">XP: {student.xp || 0}</p>
            </div>
          ))}
        </div>
      )}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full relative">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold text-center mb-4">
              {selectedStudent.firstName}'s Profile
            </h2>

            {selectedStudent.avatar ? (
              <>
                <img
                  src={selectedStudent.avatar}
                  alt="avatar"
                  className="w-40 h-40 mx-auto rounded-full border-4 shadow mb-4"
                />
                <button
                  className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => handleChooseAvatarFromProfile(selectedStudent.id)}
                >
                  🎨 Choose New Avatar
                </button>
              </>
            ) : (
              <button
                className="mb-4 mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => handleChooseAvatarFromProfile(selectedStudent.id)}
              >
                🎨 Choose Avatar
              </button>
            )}

            <div className="text-sm mb-4">
              <p className="mb-2">XP: {selectedStudent.xp || 0}</p>
              <div>
                {(selectedStudent.logs || []).slice(-5).reverse().map((log, index) => (
                  <p key={index}>
                    {log.type} +{log.amount} XP –{' '}
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>

            {selectedStudent.pet && (
              <div className="mt-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Pet</h3>
                <img
                  src={selectedStudent.pet.image}
                  alt="pet"
                  className="w-24 h-24 mx-auto mb-1"
                />
                <p>Name: {selectedStudent.pet.name}</p>
                <p>Level: {selectedStudent.pet.level}</p>
                <p>Speed: {selectedStudent.pet.speed}</p>
                <p>Wins: {selectedStudent.pet.wins}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showAvatarSelectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full relative">
            <button
              onClick={() => setShowAvatarSelectModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Select an Avatar</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {AVAILABLE_AVATARS.map((avatar) => (
                <div
                  key={avatar.base}
                  className="cursor-pointer text-center"
                  onClick={() =>
                    handleConfirmAvatarChoice(avatar.path, avatar.base)
                  }
                >
                  <img
                    src={avatar.path}
                    alt={avatar.base}
                    className="w-20 h-20 rounded border-2 hover:border-blue-500 mx-auto"
                  />
                  <p className="text-sm mt-1">{avatar.base}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
            <button
              onClick={() => setShowAddStudentModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Upload Class List</h2>
            <label className="block mb-2 font-semibold">Class Name</label>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="e.g. 5B"
            />
            <label className="block mb-2 font-semibold">
              Paste student names (one per line):
            </label>
            <textarea
              value={newClassStudents}
              onChange={(e) => setNewClassStudents(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              rows={10}
              placeholder="Enter student names..."
            />
            <button
              onClick={handleClassImport}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Upload Class
            </button>
          </div>
        </div>
      )}

      {showRaceSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowRaceSetup(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Start Pet Race</h2>
            <p className="mb-2 font-semibold">Select up to 5 pets to race:</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {students
                .filter((s) => s.pet)
                .slice(0, 10)
                .map((s) => (
                  <div
                    key={s.id}
                    onClick={() =>
                      setSelectedPets((prev) =>
                        prev.includes(s.id)
                          ? prev.filter((id) => id !== s.id)
                          : [...prev, s.id].slice(0, 5)
                      )
                    }
                    className={`border rounded p-2 text-center cursor-pointer ${
                      selectedPets.includes(s.id)
                        ? 'border-blue-600 bg-blue-100'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={s.pet.image}
                      alt="pet"
                      className="w-12 h-12 mx-auto"
                    />
                    <p className="text-sm">{s.firstName}</p>
                  </div>
                ))}
            </div>

            <label className="block mb-1 font-semibold">Race Reward</label>
            <select
              value={selectedPrize}
              onChange={(e) => setSelectedPrize(e.target.value)}
              className="w-full p-2 border mb-2"
            >
              <option value="XP">XP</option>
              <option value="Loot">Loot</option>
              <option value="Prize">Classroom Prize</option>
            </select>

            {selectedPrize === 'XP' && (
              <input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(Number(e.target.value))}
                className="w-full p-2 border mb-4"
                placeholder="XP Amount"
              />
            )}

            <button
              onClick={() => {
                setShowRaceSetup(false);
                setRaceInProgress(true);
              }}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Start Race
            </button>
          </div>
        </div>
      )}
      {levelUpData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center relative">
            <h2 className="text-xl font-bold mb-2">🎉 {levelUpData.name} Levelled Up!</h2>
            <img
              src={levelUpData.avatar}
              alt="New Avatar"
              className="w-32 h-32 mx-auto mb-2"
            />
            <p>New Avatar Level: {levelUpData.newLevel}</p>
            <button
              onClick={() => setLevelUpData(null)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {petUnlockData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center relative">
            <h2 className="text-xl font-bold mb-2">
              🐾 {petUnlockData.name} unlocked a pet!
            </h2>
            <img
              src={petUnlockData.image}
              alt="Pet"
              className="w-32 h-32 mx-auto mb-2"
            />
            <input
              type="text"
              placeholder="Name your pet"
              value={petNameInput}
              onChange={(e) => setPetNameInput(e.target.value)}
              className="border rounded px-2 py-1 w-full mb-2"
            />
            <button
              onClick={() => {
                const updatedStudents = students.map((s) =>
                  s.id === petUnlockData.id
                    ? {
                        ...s,
                        pet: {
                          ...s.pet,
                          name: petNameInput || getRandomPetName(),
                        },
                      }
                    : s
                );
                setStudents(updatedStudents);
                setPetUnlockData(null);
                setPetNameInput('');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {raceInProgress && (
        <div className="mt-10 bg-white rounded p-4 shadow text-center relative">
          <h2 className="text-xl font-bold mb-4">🏁 Pet Race</h2>
          <div className="relative w-full h-40 bg-gray-100 rounded overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-2 bg-black" />
            {selectedPets.map((id, index) => {
              const student = students.find((s) => s.id === id);
              const position = racePositions[id] || 0;
              return (
                <img
                  key={id}
                  src={student?.pet?.image}
                  alt="pet"
                  className="absolute bottom-4"
                  style={{
                    left: `${position}%`,
                    transition: 'left 0.1s linear',
                    height: '40px',
                    transform: `translateY(-${index * 45}px)`,
                  }}
                />
              );
            })}
          </div>

          {!raceFinished && (
            <button
              onClick={async () => {
                const speeds = {};
                const positions = {};
                const finishLine = 100;

                selectedPets.forEach((id) => {
                  const student = students.find((s) => s.id === id);
                  speeds[id] = calculateSpeed(student.pet);
                  positions[id] = 0;
                });

                setRacePositions({ ...positions });

                const interval = setInterval(() => {
                  const updated = { ...positions };
                  let winner = null;

                  selectedPets.forEach((id) => {
                    updated[id] += Math.random() * speeds[id];
                    if (updated[id] >= finishLine && !winner) {
                      winner = id;
                    }
                  });

                  setRacePositions({ ...updated });

                  if (winner) {
                    clearInterval(interval);
                    setRaceFinished(true);
                    setRaceWinner(winner);

                    const updatedStudents = students.map((s) => {
                      if (s.id === winner) {
                        const updatedPet = {
                          ...s.pet,
                          wins: (s.pet.wins || 0) + 1,
                        };
                        if (selectedPrize === 'XP') {
                          return {
                            ...s,
                            pet: updatedPet,
                            xp: (s.xp || 0) + xpAmount,
                          };
                        } else {
                          return {
                            ...s,
                            pet: updatedPet,
                          };
                        }
                      }
                      return s;
                    });

                    setStudents(updatedStudents);
                  }
                }, 150);
              }}
              className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Go!
            </button>
          )}

          {raceFinished && (
            <div className="mt-4">
              <h3 className="text-lg font-bold text-green-700">🎉 Winner: {
                students.find(s => s.id === raceWinner)?.firstName
              }!</h3>
              <button
                onClick={() => {
                  setRaceInProgress(false);
                  setRaceFinished(false);
                  setRaceWinner(null);
                  setSelectedPets([]);
                  setRacePositions({});
                }}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Finish Race
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 text-center">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={() => setShowAddStudentModal(true)}
        >
          + Upload New Class
        </button>
        <button
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={() => setShowRaceSetup(true)}
        >
          🐾 Start Pet Race
        </button>
      </div>
    </div>
  );
}
