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

  const handleUploadClass = async () => {
    if (!className.trim() || !studentNames.trim()) return;

    const studentsArray = studentNames
      .split('\\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({
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

    const newClass = {
      id: 'class-' + Date.now(),
      name: className,
      students: studentsArray,
    };

    const docRef = doc(firestore, 'users', user.uid);
    const snap = await getDoc(docRef);
    const data = snap.exists() ? snap.data() : { subscription: 'basic', classes: [] };
    const maxAllowed = data.subscription === 'pro' ? 5 : 1;

    if (data.classes.length >= maxAllowed) {
      alert(`Your plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
      return;
    }

    const updated = [...data.classes, newClass];
    await setDoc(docRef, { ...data, classes: updated });
    setSavedClasses(updated);
    setClassName('');
    setStudentNames('');
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
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-blue-700">Teacher Dashboard</h1>

      <button
        onClick={handleOpenClassroom}
        className="mb-6 bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700"
      >
        🎮 Launch Classroom Champions
      </button>

      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-2">📘 Upload New Class</h2>
        <input
          type="text"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="Class Name (e.g. Year 5 Gold)"
          className="w-full px-4 py-2 mb-3 border rounded"
        />
        <textarea
          value={studentNames}
          onChange={(e) => setStudentNames(e.target.value)}
          rows="5"
          placeholder="Paste one student name per line"
          className="w-full px-4 py-2 mb-3 border rounded"
        />
        <button
          onClick={handleUploadClass}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Upload Class
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">📂 Saved Classes</h2>
        <ul className="space-y-2">
          {savedClasses.map((cls) => (
            <li key={cls.id} className="bg-gray-100 p-3 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">{cls.name}</p>
                <p className="text-sm text-gray-600">{cls.students.length} students</p>
              </div>
              <div className="space-x-2">
                <button
                  className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => handleOpenClassroom()}
                >
                  Open
                </button>
                <button
                  className="text-sm px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={() => alert('Edit coming soon!')}
                >
                  Edit
                </button>
                <button
                  className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => handleDeleteClass(cls.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
          {savedClasses.length === 0 && <p className="text-gray-500 italic">No classes saved yet.</p>}
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="mt-12 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
