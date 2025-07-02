import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [className, setClassName] = useState('');
  const [studentNames, setStudentNames] = useState('');
  const [savedClasses, setSavedClasses] = useState([]);
  
  // New states for avatar selection
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [studentsForAvatars, setStudentsForAvatars] = useState([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // Available avatars (same as in classroom-champions.js)
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

  function getAvatarImage(base, level) {
    return `/avatars/${base.replaceAll(" ", "%20")}/Level%20${level}.png`;
  }

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
          setSavedClasses(data.classes || []);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleUploadClass = () => {
    if (!className.trim() || !studentNames.trim()) {
      alert("Please enter both class name and student names");
      return;
    }

    // Create students array with names only
    const studentsArray = studentNames
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name, index) => ({
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
        pet: null,
      }));

    // Start avatar selection process
    setStudentsForAvatars(studentsArray);
    setCurrentStudentIndex(0);
    setShowAvatarModal(true);
  };

  const handleAvatarSelect = (avatarPath, avatarBase) => {
    const updatedStudents = [...studentsForAvatars];
    updatedStudents[currentStudentIndex] = {
      ...updatedStudents[currentStudentIndex],
      avatarBase: avatarBase,
      avatar: getAvatarImage(avatarBase, 1)
    };
    setStudentsForAvatars(updatedStudents);

    // Move to next student or finish
    if (currentStudentIndex < updatedStudents.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
    } else {
      // All avatars selected, save the class
      saveClassWithAvatars(updatedStudents);
    }
  };

  const saveClassWithAvatars = async (studentsWithAvatars) => {
    const newClass = {
      id: 'class-' + Date.now(),
      name: className,
      students: studentsWithAvatars,
    };

    const docRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(docRef);
    const data = snap.exists() ? snap.data() : { subscription: 'basic', classes: [] };
    const maxAllowed = data.subscription === 'pro' ? 5 : 1;

    if (data.classes.length >= maxAllowed) {
      alert(`Your plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
      setShowAvatarModal(false);
      return;
    }

    const updated = [...data.classes, newClass];
    await setDoc(docRef, { ...data, classes: updated });
    setSavedClasses(updated);
    setClassName('');
    setStudentNames('');
    setShowAvatarModal(false);
    setStudentsForAvatars([]);
    setCurrentStudentIndex(0);
  };

  const handleDeleteClass = async (classId) => {
    const confirmed = confirm('Are you sure you want to delete this class?');
    if (!confirmed) return;

    const docRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const updatedClasses = (data.classes || []).filter((cls) => cls.id !== classId);

    await setDoc(docRef, { ...data, classes: updatedClasses });
    setSavedClasses(updatedClasses);
  };

  const handleOpenClassroom = () => {
    router.push('/classroom-champions');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6 text-blue-700 text-center">Teacher Dashboard</h1>

        <button
          onClick={handleOpenClassroom}
          className="w-full mb-8 bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg shadow-md"
        >
          🎮 Launch Classroom Champions
        </button>

        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">📘 Upload New Class</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Year 5 Gold"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Names</label>
              <textarea
                value={studentNames}
                onChange={(e) => setStudentNames(e.target.value)}
                rows="6"
                placeholder="Enter one student name per line&#10;Example:&#10;John Smith&#10;Emma Johnson&#10;Michael Brown"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>
            <button
              onClick={handleUploadClass}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md"
            >
              Select Avatars & Upload Class
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">📂 Saved Classes</h2>
          {savedClasses.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-500 italic text-lg">No classes saved yet.</p>
              <p className="text-gray-400 text-sm mt-2">Upload your first class above to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedClasses.map((cls) => (
                <div key={cls.id} className="bg-gray-50 p-4 rounded-lg shadow flex justify-between items-center hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-bold text-lg text-gray-800">{cls.name}</p>
                    <p className="text-gray-600">{cls.students.length} students</p>
                  </div>
                  <div className="space-x-2 flex">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      onClick={() => handleOpenClassroom()}
                    >
                      Open
                    </button>
                    <button
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                      onClick={() => alert('Edit feature coming soon!')}
                    >
                      Edit
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                      onClick={() => handleDeleteClass(cls.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Avatar Selection Modal */}
      {showAvatarModal && studentsForAvatars.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                Choose Avatar for {studentsForAvatars[currentStudentIndex]?.firstName}
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Student {currentStudentIndex + 1} of {studentsForAvatars.length}
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
                {AVAILABLE_AVATARS.map((avatar) => (
                  <div
                    key={avatar.path}
                    className="relative group cursor-pointer transform hover:scale-105 transition-transform"
                    onClick={() => handleAvatarSelect(avatar.path, avatar.base)}
                  >
                    <img
                      src={avatar.path}
                      alt={avatar.base}
                      className="w-full h-full rounded-lg border-2 border-gray-300 hover:border-blue-500 object-cover shadow-md"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      {avatar.base}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setShowAvatarModal(false);
                    setStudentsForAvatars([]);
                    setCurrentStudentIndex(0);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}