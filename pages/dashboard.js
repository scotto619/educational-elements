import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [className, setClassName] = useState('');
  const [studentNames, setStudentNames] = useState('');
  const [savedClasses, setSavedClasses] = useState([]);
  const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);

  // Check for successful checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, '/dashboard');
      
      // Show success message
      setTimeout(() => {
        alert('🎉 Welcome to Classroom Champions! Your subscription is now active.');
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        
        // Load user data including subscription info
        const docRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setSavedClasses(data.classes || []);
          
          // Check if user needs to subscribe
          if (!data.subscription || data.subscription === 'cancelled') {
            setShowSubscriptionBanner(true);
          }
        } else {
          // New user - redirect to pricing
          router.push('/pricing');
          return;
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

  const handleManageSubscription = async () => {
    if (!userData?.stripeCustomerId) {
      alert('No subscription found. Please subscribe first.');
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

  const handleUploadClass = async () => {
    if (!className.trim() || !studentNames.trim()) {
      alert("Please enter both class name and student names");
      return;
    }

    // Check subscription limits
    const maxAllowed = userData?.subscription === 'pro' ? 5 : 1;
    if (savedClasses.length >= maxAllowed) {
      alert(`Your ${userData?.subscription || 'basic'} plan only allows up to ${maxAllowed} class${maxAllowed > 1 ? 'es' : ''}.`);
      if (userData?.subscription !== 'pro') {
        const upgrade = confirm('Would you like to upgrade to Pro for unlimited classes?');
        if (upgrade) {
          router.push('/pricing');
        }
      }
      return;
    }

    // Rest of upload logic...
    const studentsArray = studentNames
      .split('\n')
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
    const updated = [...savedClasses, newClass];
    
    await setDoc(docRef, { 
      ...userData, 
      classes: updated 
    });
    
    setSavedClasses(updated);
    setClassName('');
    setStudentNames('');
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
        {/* Subscription Banner */}
        {showSubscriptionBanner && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Subscription Required</h3>
                <p className="text-yellow-700">Subscribe to start creating classes and managing students.</p>
              </div>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 font-semibold"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-blue-700">Teacher Dashboard</h1>
            {userData?.subscription && (
              <div className="flex items-center mt-2 space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  userData.subscription === 'pro' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userData.subscription === 'pro' ? 'Pro Plan' : 'Basic Plan'}
                </span>
                <span className="text-sm text-gray-600">
                  {savedClasses.length}/{userData.subscription === 'pro' ? '5' : '1'} classes used
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            {userData?.stripeCustomerId && (
              <button
                onClick={handleManageSubscription}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
              >
                Manage Subscription
              </button>
            )}
            <button
              onClick={() => router.push('/classroom-champions')}
              className="bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 text-lg shadow-md"
            >
              🎮 Launch Classroom Champions
            </button>
          </div>
        </div>

        {/* Rest of dashboard remains the same... */}
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
  placeholder="Enter one student name per line"
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
/>
            </div>
            <button
              onClick={handleUploadClass}
              disabled={!userData?.subscription || userData.subscription === 'cancelled'}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!userData?.subscription ? 'Subscribe to Upload Classes' : 'Select Avatars & Upload Class'}
            </button>
          </div>
        </div>

        {/* Saved Classes */}
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
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    onClick={() => router.push('/classroom-champions')}
                  >
                    Open
                  </button>
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
    </div>
  );
}