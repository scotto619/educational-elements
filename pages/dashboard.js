import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, firestore } from '../utils/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [savedClasses, setSavedClasses] = useState([]);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  
  // Class creation states
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [studentNames, setStudentNames] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [studentList, setStudentList] = useState([]);
  const [selectedAvatars, setSelectedAvatars] = useState({});
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Available Level 1 Avatars
  const LEVEL_1_AVATARS = [
    'Alchemist F', 'Alchemist M', 'Archer F', 'Archer M', 'Barbarian F', 'Barbarian M',
    'Bard F', 'Bard M', 'Beastmaster F', 'Beastmaster M', 'Cleric F', 'Cleric M',
    'Crystal Sage F', 'Crystal Sage M', 'Druid F', 'Druid M', 'Engineer F', 'Engineer M',
    'Ice Mage F', 'Ice Mage M', 'Illusionist F', 'Illusionist M', 'Knight F', 'Knight M',
    'Monk F', 'Monk M', 'Necromancer F', 'Necromancer M', 'Orc F', 'Orc M',
    'Paladin F', 'Paladin M', 'Rogue F', 'Rogue M', 'Sky Knight F', 'Sky Knight M',
    'Time Mage F', 'Time Mage M', 'Wizard F', 'Wizard M'
  ];

  // Calculate days until January 1, 2026
  useEffect(() => {
    const calculateTrialDays = () => {
      const now = new Date();
      const targetDate = new Date('2026-01-01T00:00:00.000Z');
      const timeDifference = targetDate.getTime() - now.getTime();
      const days = Math.max(0, Math.ceil(timeDifference / (1000 * 60 * 60 * 24)));
      setTrialDaysLeft(days);
    };

    calculateTrialDays();
    const interval = setInterval(calculateTrialDays, 1000 * 60 * 60); // Update every hour
    
    return () => clearInterval(interval);
  }, []);

  // Check for successful checkout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      window.history.replaceState({}, document.title, '/dashboard');
      setTimeout(() => {
        alert(`🎉 Welcome to Educational Elements! Your ${trialDaysLeft}-day free trial is now active.`);
      }, 1000);
    }
  }, [trialDaysLeft]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        
        // Load user data
        const docRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setSavedClasses(data.classes || []);
        } else {
          // New user - create initial document
          const newUserData = {
            email: user.email,
            createdAt: new Date().toISOString(),
            classes: [],
            subscription: null,
            subscriptionStatus: 'trialing', // Assume they completed signup with trial
            trialUntil: '2026-01-01T00:00:00.000Z'
          };
          
          await setDoc(docRef, newUserData);
          setUserData(newUserData);
          setSavedClasses([]);
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
      alert('No subscription found. Please contact support.');
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

  const startCreateClass = () => {
    setShowCreateClassModal(true);
    setCurrentStep(1);
    setClassName('');
    setStudentNames('');
    setStudentList([]);
    setSelectedAvatars({});
  };

  const processStudentNames = () => {
    if (!className.trim() || !studentNames.trim()) {
      alert("Please enter both class name and student names");
      return;
    }

    // Check class limits (2 classes max)
    if (savedClasses.length >= 2) {
      alert('You can create up to 2 classes with your Educational Elements subscription.');
      return;
    }

    // Process student names
    const students = studentNames
      .split('\n')
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => {
        const nameParts = name.split(' ');
        return {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(' ') || '',
          fullName: name
        };
      });

    if (students.length === 0) {
      alert("Please enter at least one student name");
      return;
    }

    setStudentList(students);
    
    // Initialize with random avatars
    const initialAvatars = {};
    students.forEach(student => {
      const randomAvatar = LEVEL_1_AVATARS[Math.floor(Math.random() * LEVEL_1_AVATARS.length)];
      initialAvatars[student.id] = randomAvatar;
    });
    setSelectedAvatars(initialAvatars);
    
    setCurrentStep(2);
  };

  const getAvatarImage = (avatarName) => {
    return `/avatars/${avatarName}/Level 1.png`;
  };

  const handleAvatarSelect = (studentId, avatarName) => {
    setSelectedAvatars(prev => ({
      ...prev,
      [studentId]: avatarName
    }));
  };

  const createClass = async () => {
    setIsCreatingClass(true);
    
    try {
      // Create student objects with selected avatars
      const studentsArray = studentList.map(student => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        avatarBase: selectedAvatars[student.id] || 'Wizard F',
        avatarLevel: 1,
        avatar: getAvatarImage(selectedAvatars[student.id] || 'Wizard F'),
        totalPoints: 0,
        currency: 0,
        coinsSpent: 0,
        ownedAvatars: [selectedAvatars[student.id] || 'Wizard F'],
        ownedPets: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }));

      const newClass = {
        id: 'class-' + Date.now(),
        name: className,
        students: studentsArray,
        createdAt: new Date().toISOString(),
        xpCategories: [
          { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' },
          { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' },
          { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' },
          { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' },
          { id: 5, label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' }
        ]
      };

      const docRef = doc(firestore, 'users', user.uid);
      const updated = [...savedClasses, newClass];
      
      await updateDoc(docRef, { 
        classes: updated,
        activeClassId: newClass.id
      });
      
      setSavedClasses(updated);
      setShowCreateClassModal(false);
      setCurrentStep(1);
      
      alert(`Class "${className}" created successfully with ${studentsArray.length} students!`);
      
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class. Please try again.');
    } finally {
      setIsCreatingClass(false);
    }
  };

  const deleteClass = async (classToDelete) => {
    if (!window.confirm(`Are you sure you want to delete "${classToDelete.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const docRef = doc(firestore, 'users', user.uid);
      const updated = savedClasses.filter(cls => cls.id !== classToDelete.id);
      
      await updateDoc(docRef, { 
        classes: updated,
        activeClassId: updated.length > 0 ? updated[0].id : null
      });
      
      setSavedClasses(updated);
      alert(`Class "${classToDelete.name}" has been deleted.`);
      
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Error deleting class. Please try again.');
    }
  };

  const setActiveClass = async (classId) => {
    try {
      const docRef = doc(firestore, 'users', user.uid);
      await updateDoc(docRef, { activeClassId: classId });
      
      setUserData(prev => ({ ...prev, activeClassId: classId }));
      
    } catch (error) {
      console.error('Error setting active class:', error);
      alert('Error setting active class. Please try again.');
    }
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

  // ✅ UPDATED ACCESS LOGIC WITH LEGACY SUPPORT
  const hasTrialAccess = userData?.subscriptionStatus === 'trialing' || 
                        (userData?.trialUntil && new Date(userData.trialUntil) > new Date());
  const hasActiveSubscription = userData?.subscriptionStatus === 'active';

  // Legacy user support - users who subscribed before the new system
  const hasLegacySubscription = (
    // Has old subscription field and it's not cancelled
    (userData?.subscription && 
     userData?.subscription !== 'cancelled' && 
     userData?.subscription !== null) ||
    // Has Stripe customer ID but no subscription status (old system)
    (userData?.stripeCustomerId && 
     !userData?.subscriptionStatus && 
     (!userData?.subscription || userData?.subscription !== 'cancelled'))
  );

  // Combined access check
  const canAccess = hasTrialAccess || hasActiveSubscription || hasLegacySubscription;

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8">
        
        {/* Trial Status Banner */}
        {hasTrialAccess && trialDaysLeft > 0 && (
          <div className="bg-gradient-to-r from-green-400 to-green-500 border border-green-300 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">🎉 Free Trial Active!</h3>
                <p className="text-green-100">You have {trialDaysLeft} days of free access remaining until January 1st, 2026.</p>
              </div>
              <div className="text-white text-center">
                <div className="text-3xl font-bold">{trialDaysLeft}</div>
                <div className="text-sm">Days Left</div>
              </div>
            </div>
          </div>
        )}

        {/* Legacy User Welcome Banner */}
        {hasLegacySubscription && !hasActiveSubscription && !hasTrialAccess && (
          <div className="bg-gradient-to-r from-purple-400 to-purple-500 border border-purple-300 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">👑 Welcome Back, Legacy Subscriber!</h3>
                <p className="text-purple-100">Your subscription is active and working perfectly. Thanks for being an early supporter!</p>
              </div>
              <div className="text-white text-4xl">✨</div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-16 w-16 mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Educational Elements
              </h1>
              <p className="text-gray-600 text-lg">Teacher Dashboard</p>
              {userData && (
                <div className="flex items-center mt-2 space-x-4">
                  {hasTrialAccess ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      Free Trial ({trialDaysLeft} days left)
                    </span>
                  ) : hasActiveSubscription ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      Active Subscription
                    </span>
                  ) : hasLegacySubscription ? (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                      Legacy Subscription ✨
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                      Trial Expired
                    </span>
                  )}
                  <span className="text-sm text-gray-600">
                    {savedClasses.length}/2 classes created
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            {userData?.stripeCustomerId && (
              <button
                onClick={handleManageSubscription}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold"
              >
                Manage Billing
              </button>
            )}
            <button
              onClick={() => router.push('/classroom-champions')}
              disabled={!canAccess || savedClasses.length === 0}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🚀 Launch Platform
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {savedClasses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="text-3xl font-bold">{savedClasses.length}</div>
              <div className="text-blue-100">Active Classes</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="text-3xl font-bold">
                {savedClasses.reduce((total, cls) => total + (cls.students?.length || 0), 0)}
              </div>
              <div className="text-purple-100">Total Students</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="text-3xl font-bold">
                {savedClasses.reduce((total, cls) => total + (cls.students?.reduce((sum, student) => sum + (student.totalPoints || 0), 0) || 0), 0)}
              </div>
              <div className="text-green-100">Total XP Earned</div>
            </div>
          </div>
        )}

        {/* Create New Class Button */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create New Class</h2>
              <p className="text-gray-600">Set up a new classroom with students and their starting avatars.</p>
            </div>
            <button
              onClick={startCreateClass}
              disabled={!canAccess || savedClasses.length >= 2}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savedClasses.length >= 2 ? 'Class Limit Reached' : '➕ Create Class'}
            </button>
          </div>
          {!canAccess && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 font-medium">
                Your trial has expired. Please subscribe to continue using Educational Elements.
              </p>
            </div>
          )}
        </div>

        {/* Saved Classes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Classes</h2>
          {savedClasses.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-xl text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500 text-xl font-medium mb-2">No classes created yet</p>
              <p className="text-gray-400">Create your first class to get started with Educational Elements!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedClasses.map((cls) => (
                <div key={cls.id} className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-2">{cls.name}</h3>
                        <p className="text-gray-600 mb-2">{cls.students?.length || 0} students</p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(cls.createdAt).toLocaleDateString()}
                        </p>
                        {userData?.activeClassId === cls.id && (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mt-2">
                            Active Class
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteClass(cls)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Class"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Student Avatars Preview */}
                    {cls.students && cls.students.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Students:</p>
                        <div className="flex flex-wrap gap-2">
                          {cls.students.slice(0, 8).map(student => (
                            <div key={student.id} className="flex items-center space-x-1 bg-gray-50 rounded-lg px-2 py-1">
                              <img 
                                src={getAvatarImage(student.avatarBase)}
                                alt={student.firstName}
                                className="w-6 h-6 rounded-full"
                                onError={(e) => e.target.src = '/avatars/Wizard F/Level 1.png'}
                              />
                              <span className="text-xs font-medium text-gray-700">{student.firstName}</span>
                            </div>
                          ))}
                          {cls.students.length > 8 && (
                            <div className="bg-gray-100 rounded-lg px-2 py-1">
                              <span className="text-xs text-gray-600">+{cls.students.length - 8} more</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setActiveClass(cls.id)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                      >
                        {userData?.activeClassId === cls.id ? 'Current Class' : 'Set Active'}
                      </button>
                      <button
                        onClick={() => router.push('/classroom-champions')}
                        disabled={!canAccess}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Open Class
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-800 mb-2">Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Classes:</span>
              <span className="ml-2 text-blue-800">{savedClasses.length}/2 created</span>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Students:</span>
              <span className="ml-2 text-blue-800">Unlimited per class</span>
            </div>
          </div>
          {hasTrialAccess && trialDaysLeft > 0 && (
            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 Free trial active! {trialDaysLeft} days remaining until January 1st, 2026.
              </p>
            </div>
          )}
          {hasLegacySubscription && !hasActiveSubscription && !hasTrialAccess && (
            <div className="mt-3 p-3 bg-purple-100 border border-purple-300 rounded-lg">
              <p className="text-purple-800 font-medium">
                ✨ Legacy subscription active! You have full access to all features.
              </p>
            </div>
          )}
          {trialDaysLeft === 0 && !hasActiveSubscription && !hasLegacySubscription && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
              <p className="text-yellow-800 font-medium">
                ⚠️ Your trial has expired. Billing will begin at $5.99/month.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal - Same as before */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {currentStep === 1 ? '📚 Create New Class' : '🎭 Choose Student Avatars'}
              </h2>
              <p className="text-purple-100 mt-2">
                {currentStep === 1 ? 'Enter your class information and student names' : 'Select starting avatars for each student'}
              </p>
            </div>
            
            <div className="p-6">
              {currentStep === 1 ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g., 5th Grade Math, Year 6 Blue"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Names (one per line)
                    </label>
                    <textarea
                      value={studentNames}
                      onChange={(e) => setStudentNames(e.target.value)}
                      rows="8"
                      placeholder="John Smith&#10;Sarah Johnson&#10;Mike Davis&#10;Emma Wilson"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter each student's full name on a separate line. You can include first and last names.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-medium">
                      Choose a starting avatar for each student. They can change avatars later as they level up!
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {studentList.map(student => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-bold text-lg text-gray-800 mb-4">{student.fullName}</h4>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {LEVEL_1_AVATARS.map(avatarName => (
                            <button
                              key={avatarName}
                              onClick={() => handleAvatarSelect(student.id, avatarName)}
                              className={`p-2 rounded-lg border-2 transition-all ${
                                selectedAvatars[student.id] === avatarName
                                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <img
                                src={getAvatarImage(avatarName)}
                                alt={avatarName}
                                className="w-12 h-12 rounded-lg mx-auto"
                                onError={(e) => e.target.src = '/avatars/Wizard F/Level 1.png'}
                              />
                              <p className="text-xs text-center mt-1 font-medium text-gray-700">
                                {avatarName.replace(' F', ' ♀').replace(' M', ' ♂')}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    setShowCreateClassModal(false);
                  } else {
                    setCurrentStep(1);
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={currentStep === 1 ? processStudentNames : createClass}
                disabled={isCreatingClass || (currentStep === 1 && (!className.trim() || !studentNames.trim()))}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingClass ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  currentStep === 1 ? 'Next: Choose Avatars' : 'Create Class'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}