import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export default function ClassroomChampions() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [classData, setClassData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarTargetId, setAvatarTargetId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        const docRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.classes?.length > 0) {
            setClassData(data.classes[0]);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);
  const handleAvatarClick = (studentId) => {
    setAvatarTargetId(studentId);
    setAvatarModalOpen(true);
  };

  const handleAvatarSelect = async (avatarUrl, avatarBase) => {
    if (!user || !classData) return;
    const updatedStudents = classData.students.map((student) =>
      student.id === avatarTargetId
        ? {
            ...student,
            avatar: avatarUrl,
            avatarBase: avatarBase,
            avatarLevel: 1,
          }
        : student
    );
    const updatedClass = { ...classData, students: updatedStudents };
    setClassData(updatedClass);

    const docRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const updatedClasses = data.classes.map((cls) =>
      cls.id === updatedClass.id ? updatedClass : cls
    );

    await setDoc(docRef, { ...data, classes: updatedClasses });
    setAvatarModalOpen(false);
  };

  const giveXP = async (studentId, category) => {
    if (!user || !classData) return;
    const updatedStudents = classData.students.map((student) =>
      student.id === studentId
        ? {
            ...student,
            totalPoints: student.totalPoints + 1,
            weeklyPoints: student.weeklyPoints + 1,
            categoryTotal: {
              ...student.categoryTotal,
              [category]: (student.categoryTotal[category] || 0) + 1,
            },
            categoryWeekly: {
              ...student.categoryWeekly,
              [category]: (student.categoryWeekly[category] || 0) + 1,
            },
            logs: [
              ...(student.logs || []),
              {
                type: 'xp',
                category,
                timestamp: Date.now(),
              },
            ],
          }
        : student
    );

    const updatedClass = { ...classData, students: updatedStudents };
    setClassData(updatedClass);

    const docRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const updatedClasses = data.classes.map((cls) =>
      cls.id === updatedClass.id ? updatedClass : cls
    );

    await setDoc(docRef, { ...data, classes: updatedClasses });
  };
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">Classroom Champions</h1>

      {!classData ? (
        <p className="text-gray-600">No class data loaded.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classData.students.map((student) => (
            <div key={student.id} className="p-4 border rounded bg-white shadow">
              <div className="flex flex-col items-center">
                <img
                  src={
                    student.avatar && student.avatar !== ''
                      ? student.avatar
                      : '/avatars/placeholder.png'
                  }
                  alt=""
                  className="w-16 h-16 rounded-full object-cover border mb-2 cursor-pointer"
                  onClick={() => setSelectedStudent(student)}
                />
                <p className="font-semibold text-center">{student.firstName}</p>
                <div className="flex space-x-1 mt-2">
                  <button onClick={() => giveXP(student.id, '👍')}>👍</button>
                  <button onClick={() => giveXP(student.id, '💼')}>💼</button>
                  <button onClick={() => giveXP(student.id, '📚')}>📚</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white p-6 rounded shadow-md max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setSelectedStudent(null)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedStudent.firstName}</h2>
            <img
              src={
                selectedStudent.avatar && selectedStudent.avatar !== ''
                  ? selectedStudent.avatar
                  : '/avatars/placeholder.png'
              }
              alt=""
              className="w-20 h-20 rounded-full object-cover border mb-3 mx-auto"
            />
            <p><strong>Total XP:</strong> {selectedStudent.totalPoints}</p>
            <p><strong>Weekly XP:</strong> {selectedStudent.weeklyPoints}</p>

            {selectedStudent.pet && (
              <div className="mt-4">
                <h3 className="font-semibold">Pet</h3>
                <img
                  src={selectedStudent.pet.image}
                  alt=""
                  className="w-16 h-16 rounded object-cover"
                />
                <p className="text-sm">Name: {selectedStudent.pet.name}</p>
              </div>
            )}

            {selectedStudent.avatar === '' && (
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  handleAvatarClick(selectedStudent.id);
                  setSelectedStudent(null);
                }}
              >
                🎨 Choose New Avatar
              </button>
            )}
          </div>
        </div>
      )}
      {avatarModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setAvatarModalOpen(false)}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Choose Your Avatar</h2>

            <div className="grid grid-cols-4 gap-4">
              {[
                'Alchemist', 'Archer', 'Bard', 'Barbarian',
                'Beastmaster', 'Knight', 'SkyKnight', 'TimeMage'
              ].map((type) => (
                <div
                  key={type}
                  className="cursor-pointer hover:scale-105 transition"
                  onClick={() =>
                    handleAvatarSelect(`/avatars/${type}_1.png`, type)
                  }
                >
                  <img
                    src={`/avatars/${type}_1.png`}
                    alt={type}
                    className="w-20 h-20 rounded object-cover border"
                  />
                  <p className="text-center text-sm mt-1">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
