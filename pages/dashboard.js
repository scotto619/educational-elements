import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../utils/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-100">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to your Dashboard!</h1>
      <p className="text-lg text-gray-700 mt-4">You&apos;re successfully logged in. 🎉</p>
      <button
        onClick={handleLogout}
        className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}
