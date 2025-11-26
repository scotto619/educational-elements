import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth, firestore } from '../utils/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { DEFAULT_UPDATES, fetchDashboardUpdates } from '../services/globalContent';

const OWNER_EMAIL = 'scotto6190@gmail.com';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [savedClasses, setSavedClasses] = useState([]);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [architectureVersion, setArchitectureVersion] = useState('unknown');
  const [dashboardUpdates, setDashboardUpdates] = useState(DEFAULT_UPDATES);
  
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

  const CLASS_REWARD_TIERS = [
    { xp: 1000, label: 'Prize 1' },
    { xp: 2000, label: 'Prize 2' },
    { xp: 3000, label: 'Prize 3' },
    { xp: 4000, label: 'Prize 4' },
    { xp: 5000, label: 'Major Prize' }
  ];

  const getUpdateBadgeStyles = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'NEW':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'IMPROVED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENHANCED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUpdateBorderClass = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'NEW':
        return 'border-green-200';
      case 'IMPROVED':
        return 'border-blue-200';
      case 'ENHANCED':
        return 'border-purple-200';
      default:
        return 'border-gray-200';
    }
  };

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
    const interval = setInterval(calculateTrialDays, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadUpdates = async () => {
      try {
        const updates = await fetchDashboardUpdates();
        if (!cancelled) {
          setDashboardUpdates(updates.length > 0 ? updates : DEFAULT_UPDATES);
        }
      } catch (error) {
        console.error('❌ Error loading dashboard updates:', error);
      }
    };

    loadUpdates();

    return () => {
      cancelled = true;
    };
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

  // V2 Architecture: Load classes from new collections
  async function loadV2Classes(userId) {
    try {
      console.log('📚 Loading V2 classes for user:', userId);
      
      // Query classes collection where teacherId matches user
      const classesQuery = query(
        collection(firestore, 'classes'),
        where('teacherId', '==', userId),
        where('archived', '==', false)
      );
      
      const classesSnapshot = await getDocs(classesQuery);
      console.log('✅ Found V2 classes:', classesSnapshot.size);

      const classes = [];
      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data();

        // Get student count from class membership
        const membershipDoc = await getDoc(doc(firestore, 'class_memberships', classDoc.id));
        let studentCount = 0;
        let students = [];
        let classTotalXP = 0;

        if (membershipDoc.exists()) {
          const membershipData = membershipDoc.data();
          const studentIds = membershipData.students || [];
          studentCount = studentIds.length;

          // Get student details for display
          if (studentIds.length > 0) {
            const studentPromises = studentIds.map(async (studentId) => {
              try {
                const studentDoc = await getDoc(doc(firestore, 'students', studentId));
                if (studentDoc.exists()) {
                  return studentDoc.data();
                }
              } catch (error) {
                console.warn('Error loading student:', studentId, error);
              }
              return null;
            });

            const studentResults = await Promise.all(studentPromises);
            const validStudents = studentResults.filter(s => s !== null);
            students = validStudents.slice(0, 6);
            classTotalXP = validStudents.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
          }
        }

        // Format class data for compatibility with dashboard UI
        const formattedClass = {
          id: classDoc.id,
          name: classData.name,
          classCode: classData.classCode,
          createdAt: classData.createdAt,
          studentCount: studentCount,
          students: students, // For preview display
          totalXP: classTotalXP,
          // Add a marker to indicate this is V2 data
          isV2: true
        };
        
        classes.push(formattedClass);
      }
      
      console.log('📊 V2 classes loaded:', classes.length);
      return classes;
      
    } catch (error) {
      console.error('❌ Error loading V2 classes:', error);
      throw error;
    }
  }

  // V1 Architecture: Load classes from user document (fallback)
  function loadV1Classes(userData) {
    console.log('📚 Loading V1 classes from user document');
    const classes = userData.classes || [];
    
    // Add student count for each class
    const formattedClasses = classes.map(cls => ({
      ...cls,
      studentCount: cls.students?.length || 0,
      isV2: false
    }));
    
    console.log('📊 V1 classes loaded:', formattedClasses.length);
    return formattedClasses;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);

        console.log('=== CURRENT USER DEBUG ===');
        console.log('User ID:', user.uid);
        console.log('User Email:', user.email);
        console.log('User Display Name:', user.displayName);
        console.log('========================');
        
        try {
          // Load user data
          const docRef = doc(firestore, 'users', user.uid);
          const snap = await getDoc(docRef);
          
          let userData;
          if (snap.exists()) {
            userData = snap.data();
            setUserData(userData);
          } else {
            // New user - create initial document
            userData = {
              email: user.email,
              createdAt: new Date().toISOString(),
              classes: [],
              subscription: null,
              subscriptionStatus: 'trialing',
              trialUntil: '2026-01-01T00:00:00.000Z'
            };
            
            await setDoc(docRef, userData);
            setUserData(userData);
          }
          
          // Determine architecture version and load classes
          console.log('🔍 Determining architecture version...');
          
          // Check if user has been migrated to V2
          const hasV2Marker = userData.version === '2.0' || userData.migratedAt;
          
          if (hasV2Marker) {
            console.log('✅ User is on V2 architecture');
            setArchitectureVersion('v2');
            
            try {
              const v2Classes = await loadV2Classes(user.uid);
              setSavedClasses(v2Classes);
            } catch (error) {
              console.warn('⚠️ V2 loading failed, falling back to V1:', error.message);
              setArchitectureVersion('v1-fallback');
              const v1Classes = loadV1Classes(userData);
              setSavedClasses(v1Classes);
            }
          } else {
            console.log('🔍 User is on V1 architecture');
            setArchitectureVersion('v1');
            const v1Classes = loadV1Classes(userData);
            setSavedClasses(v1Classes);
          }
          
        } catch (error) {
          console.error('❌ Error loading user data:', error);
          setArchitectureVersion('error');
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
      router.push('/signup');
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

    if (savedClasses.length >= 2) {
      alert('You can create up to 2 classes with your Educational Elements subscription.');
      return;
    }

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

  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createClass = async () => {
    setIsCreatingClass(true);

    try {
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

      if (architectureVersion === 'v2') {
        const batch = writeBatch(firestore);
        const now = new Date().toISOString();
        const classId = `class_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const classRef = doc(firestore, 'classes', classId);
        const membershipRef = doc(firestore, 'class_memberships', classId);
        const userRef = doc(firestore, 'users', user.uid);

        const classData = {
          id: classId,
          teacherId: user.uid,
          name: className,
          classCode: generateClassCode(),
          createdAt: now,
          updatedAt: now,
          xpCategories: newClass.xpCategories,
          classRewards: [],
          activeQuests: [],
          attendanceData: {},
          toolkitData: {},
          studentCount: studentsArray.length,
          lastActivity: now,
          archived: false
        };

        const studentIds = studentsArray.map(student => student.id);

        batch.set(classRef, classData);
        batch.set(membershipRef, {
          classId,
          teacherId: user.uid,
          students: studentIds,
          createdAt: now,
          updatedAt: now
        });

        studentsArray.forEach(student => {
          const studentRef = doc(firestore, 'students', student.id);
          batch.set(studentRef, {
            ...student,
            classId,
            classCode: classData.classCode,
            lastActivity: now,
            archived: false
          });
        });

        batch.update(userRef, {
          activeClassId: classId,
          updatedAt: now,
          version: '2.0'
        });

        await batch.commit();

        const v2Classes = await loadV2Classes(user.uid);
        setSavedClasses(v2Classes);
      } else {
        // Always create in V1 format for now (the migration will handle V1->V2 conversion)
        const docRef = doc(firestore, 'users', user.uid);
        const currentUserData = await getDoc(docRef);
        const existingClasses = currentUserData.exists() ? (currentUserData.data().classes || []) : [];
        const updated = [...existingClasses, newClass];

        await updateDoc(docRef, {
          classes: updated,
          activeClassId: newClass.id
        });

        const userData = await getDoc(docRef);
        const v1Classes = loadV1Classes(userData.data());
        setSavedClasses(v1Classes);
      }

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
      if (classToDelete.isV2) {
        const classId = classToDelete.id;
        const batch = writeBatch(firestore);
        const now = new Date().toISOString();

        const classRef = doc(firestore, 'classes', classId);
        const membershipRef = doc(firestore, 'class_memberships', classId);
        const userRef = doc(firestore, 'users', user.uid);

        const membershipSnap = await getDoc(membershipRef);
        const studentIds = membershipSnap.exists() ? (membershipSnap.data().students || []) : [];

        studentIds.forEach(studentId => {
          const studentRef = doc(firestore, 'students', studentId);
          batch.delete(studentRef);
        });

        batch.delete(membershipRef);
        batch.delete(classRef);

        const remainingClasses = savedClasses.filter(cls => cls.id !== classId);
        const newActiveClassId = userData?.activeClassId === classId
          ? (remainingClasses[0]?.id || null)
          : (userData?.activeClassId || null);

        batch.update(userRef, {
          activeClassId: newActiveClassId,
          updatedAt: now
        });

        await batch.commit();

        const refreshedClasses = await loadV2Classes(user.uid);
        setSavedClasses(refreshedClasses);
        setUserData(prev => ({ ...prev, activeClassId: newActiveClassId }));

        alert(`Class "${classToDelete.name}" has been deleted.`);
        return;
      }

      // V1 deletion
      const docRef = doc(firestore, 'users', user.uid);
      const currentUserData = await getDoc(docRef);
      const existingClasses = currentUserData.data().classes || [];
      const updated = existingClasses.filter(cls => cls.id !== classToDelete.id);
      
      await updateDoc(docRef, { 
        classes: updated,
        activeClassId: updated.length > 0 ? updated[0].id : null
      });
      
      setSavedClasses(prev => prev.filter(cls => cls.id !== classToDelete.id));
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">Loading...</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-gray-500 mt-2">Architecture: {architectureVersion}</p>
          )}
        </div>
      </div>
    );
  }

  // FIXED: Access Logic - Now checks both V1 and V2 formats
  const hasTrialAccess = userData?.subscriptionStatus === 'trialing' || 
                        (userData?.trialUntil && new Date(userData.trialUntil) > new Date()) ||
                        (userData?.freeAccessUntil && new Date(userData.freeAccessUntil) > new Date()) ||
                        (userData?.isTrialUser === true);

  const hasActiveSubscription = userData?.subscriptionStatus === 'active';

  const hasLegacySubscription = (
    (userData?.subscription && 
     userData?.subscription !== 'cancelled' && 
     userData?.subscription !== null) ||
    (userData?.stripeCustomerId && 
     !userData?.subscriptionStatus && 
     (!userData?.subscription || userData?.subscription !== 'cancelled'))
  );

  const canAccess = hasTrialAccess || hasActiveSubscription || hasLegacySubscription;

  // DEBUGGING: Add this temporarily to see what's in the user data
  if (process.env.NODE_ENV === 'development') {
    console.log('=== TRIAL ACCESS DEBUG ===');
    console.log('User Data:', {
      subscriptionStatus: userData?.subscriptionStatus,
      trialUntil: userData?.trialUntil,
      freeAccessUntil: userData?.freeAccessUntil,
      isTrialUser: userData?.isTrialUser,
      subscription: userData?.subscription,
      stripeCustomerId: userData?.stripeCustomerId
    });
    console.log('Access Checks:', {
      hasTrialAccess,
      hasActiveSubscription,
      hasLegacySubscription,
      canAccess
    });
    console.log('========================');
  }

  // Calculate total students for display
  const totalStudents = savedClasses.reduce((total, cls) => {
    if (cls.isV2) {
      return total + (cls.studentCount || 0);
    } else {
      return total + (cls.students?.length || 0);
    }
  }, 0);

  const calculateClassTotalXP = (cls) => {
    if (typeof cls.totalXP === 'number') {
      return cls.totalXP;
    }

    return cls.students?.reduce((sum, student) => sum + (student.totalPoints || 0), 0) || 0;
  };

  const totalXP = savedClasses.reduce((total, cls) => total + calculateClassTotalXP(cls), 0);

  // Subscription Required Screen
  if (!canAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
            
            {/* Mobile-Friendly Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div className="flex items-center text-center sm:text-left">
                <img 
                  src="/Logo/LOGO_NoBG.png" 
                  alt="Educational Elements Logo" 
                  className="h-12 w-12 sm:h-16 sm:w-16 mr-4"
                />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Educational Elements
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">Teacher Dashboard</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold text-sm sm:text-base"
              >
                Sign Out
              </button>
            </div>

            {/* Subscription Required Content */}
            <div className="text-center max-w-2xl mx-auto">
              <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🔒</div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Subscription Required</h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Your trial has expired. Subscribe now to continue accessing your classroom data and all Educational Elements features.
              </p>
              
              {/* Data Safety Assurance */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center mb-3">
                  <div className="text-2xl sm:text-3xl mr-0 sm:mr-3 mb-2 sm:mb-0">✨</div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800">Your Data is Safe!</h3>
                </div>
                <p className="text-blue-700 text-sm sm:text-lg leading-relaxed">
                  All your classes, students, and progress are preserved and secure. 
                  Subscribe to instantly regain full access to everything you've created.
                </p>
              </div>

              {/* Class Summary for Mobile */}
              {savedClasses.length > 0 && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-4">What You'll Get Back</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{savedClasses.length}</div>
                      <div className="text-purple-700 text-sm sm:text-base">Classes</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{totalStudents}</div>
                      <div className="text-purple-700 text-sm sm:text-base">Students</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{totalXP}</div>
                      <div className="text-purple-700 text-sm sm:text-base">Total XP</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscribe Button */}
              <button
                onClick={handleManageSubscription}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl mb-4 sm:mb-6"
              >
                Subscribe Now - $5.99/month
              </button>
              
              <div className="space-y-2 text-gray-600 text-sm sm:text-lg">
                <p>✅ Instant access to all features</p>
                <p>✅ Cancel anytime</p>
                <p>✅ All your data restored immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          
          {/* Trial Status Banner - Mobile Friendly */}
          {hasTrialAccess && trialDaysLeft > 0 && (
            <div className="bg-gradient-to-r from-green-400 to-green-500 border border-green-300 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">🎉 Free Trial Active!</h3>
                  <p className="text-green-100 text-sm sm:text-base">You have {trialDaysLeft} days of free access remaining until January 1st, 2026.</p>
                </div>
                <div className="text-white text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{trialDaysLeft}</div>
                  <div className="text-xs sm:text-sm">Days Left</div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile-Friendly Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start mb-6 sm:mb-8 space-y-4 lg:space-y-0">
            <div className="flex items-center w-full lg:w-auto">
              <img 
                src="/Logo/LOGO_NoBG.png" 
                alt="Educational Elements Logo" 
                className="h-12 w-12 sm:h-16 sm:w-16 mr-4"
              />
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Educational Elements
                </h1>
                <p className="text-gray-600 text-sm sm:text-lg">Teacher Dashboard</p>
                {userData && (
                  <div className="flex flex-wrap items-center mt-2 gap-2 sm:gap-4">
                    {hasTrialAccess ? (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-green-100 text-green-800">
                        Free Trial ({trialDaysLeft} days left)
                      </span>
                    ) : hasActiveSubscription ? (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800">
                        Active Subscription
                      </span>
                    ) : hasLegacySubscription ? (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-purple-100 text-purple-800">
                        Legacy Subscription ✨
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-yellow-100 text-yellow-800">
                        Trial Expired
                      </span>
                    )}
                    <span className="text-xs sm:text-sm text-gray-600">
                      {savedClasses.length}/2 classes created
                    </span>
                    {/* Development info */}
                    {process.env.NODE_ENV === 'development' && (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        architectureVersion === 'v2' ? 'bg-green-100 text-green-700' : 
                        architectureVersion === 'v1' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {architectureVersion.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons - Mobile Stack */}
            <div className="flex flex-col sm:flex-row w-full lg:w-auto space-y-2 sm:space-y-0 sm:space-x-3">
              {user?.email?.toLowerCase() === OWNER_EMAIL && (
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 font-semibold text-sm sm:text-base"
                >
                  Open Admin Console
                </button>
              )}
              {userData?.stripeCustomerId && (
                <button
                  onClick={handleManageSubscription}
                  className="w-full sm:w-auto bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold text-sm sm:text-base"
                >
                  Manage Billing
                </button>
              )}
              <button
                onClick={() => router.push('/classroom-champions')}
                disabled={!canAccess || savedClasses.length === 0}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 text-base sm:text-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🚀 Launch Platform
              </button>
              <button
                onClick={handleLogout}
                className="w-full sm:w-auto bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold text-sm sm:text-base"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* What's New Section - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl sm:text-3xl">📌</div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Notice Board</h2>
                    <p className="text-gray-600 text-sm sm:text-base">Create and manage the notices your students see in their portal.</p>
                  </div>
                </div>
                <Link href="/notice-board" className="mt-3 sm:mt-0 inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700">
                  Open Notice Board Manager ↗
                </Link>
              </div>
            </div>
          </div>

          {/* What's New Section - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
                <div className="text-2xl sm:text-3xl">🚀</div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold">What's New & Always Expanding!</h2>
                  <p className="text-blue-100 text-sm sm:text-base">Educational Elements and Classroom Champions are constantly growing</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl sm:text-2xl">✨</div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-2">Always Updating!</h3>
                      <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                        We're constantly adding new features, tools, and improvements to make your classroom experience even better. 
                        Keep an eye out for exciting updates!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-xl sm:text-2xl">💡</div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-2">Share Your Ideas!</h3>
                      <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                        Found a bug? Have a great idea? Visit the <strong>Settings</strong> tab in your classroom 
                        to report issues or suggest new features. Your feedback shapes our updates!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Updates - Mobile Grid */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-2xl sm:text-3xl">🎉</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Latest Updates</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {dashboardUpdates.map((update) => (
                  <article
                    key={update.id}
                    className={`bg-white rounded-lg p-3 sm:p-4 border-2 shadow-sm flex flex-col gap-2 ${getUpdateBorderClass(update.status)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full border ${getUpdateBadgeStyles(update.status)}`}>
                        {(update.status || 'UPDATE').toUpperCase()}
                      </span>
                      {update.highlight && (
                        <span className="text-[11px] sm:text-xs text-gray-500 font-medium truncate">{update.highlight}</span>
                      )}
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800">{update.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{update.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats - Mobile Friendly */}
          {savedClasses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold">{savedClasses.length}</div>
                <div className="text-blue-100 text-sm sm:text-base">Active Classes</div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="text-xs text-blue-200 mt-1">
                    {savedClasses.filter(c => c.isV2).length} V2, {savedClasses.filter(c => !c.isV2).length} V1
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold">{totalStudents}</div>
                <div className="text-purple-100 text-sm sm:text-base">Total Students</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-xl">
                <div className="text-2xl sm:text-3xl font-bold">{totalXP}</div>
                <div className="text-green-100 text-sm sm:text-base">Total XP Earned</div>
              </div>
            </div>
          )}

          {/* Create New Class Button - Mobile Optimized */}
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 rounded-xl border border-purple-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Create New Class</h2>
                <p className="text-gray-600 text-sm sm:text-base">Set up a new classroom with students and their starting avatars.</p>
              </div>
              <button
                onClick={startCreateClass}
                disabled={!canAccess || savedClasses.length >= 2}
                className="w-full lg:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {savedClasses.length >= 2 ? 'Class Limit Reached' : '➕ Create Class'}
              </button>
            </div>
            {!canAccess && (
              <div className="mt-4 p-3 sm:p-4 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-800 font-medium text-sm sm:text-base">
                  Your trial has expired. Please subscribe to continue using Educational Elements.
                </p>
              </div>
            )}
          </div>

          {/* Saved Classes - Mobile Grid */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Your Classes</h2>
            {savedClasses.length === 0 ? (
              <div className="bg-gray-50 p-8 sm:p-12 rounded-xl text-center">
                <div className="text-4xl sm:text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg sm:text-xl font-medium mb-2">No classes created yet</p>
                <p className="text-gray-400 text-sm sm:text-base">Create your first class to get started with Educational Elements!</p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Debug: Architecture {architectureVersion}, User {user?.uid?.substring(0, 8)}...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {savedClasses.map((cls) => (
                  <div key={cls.id} className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg sm:text-xl text-gray-800 truncate">{cls.name}</h3>
                            {process.env.NODE_ENV === 'development' && (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                cls.isV2 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {cls.isV2 ? 'V2' : 'V1'}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2 text-sm sm:text-base">
                            {cls.isV2 ? cls.studentCount : cls.students?.length || 0} students
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500">
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
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Delete Class"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      {/* Student Avatars Preview - Mobile Responsive */}
                      {cls.students && cls.students.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Students:</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {cls.students.slice(0, 6).map(student => (
                              <div key={student.id} className="flex items-center space-x-1 bg-gray-50 rounded-lg px-2 py-1">
                                <img 
                                  src={getAvatarImage(student.avatarBase)}
                                  alt={student.firstName}
                                  className="w-4 h-4 sm:w-6 sm:h-6 rounded-full"
                                  onError={(e) => e.target.src = '/avatars/Wizard F/Level 1.png'}
                                />
                                <span className="text-xs font-medium text-gray-700 truncate max-w-[60px]">{student.firstName}</span>
                              </div>
                            ))}
                            {(cls.isV2 ? cls.studentCount : cls.students.length) > 6 && (
                              <div className="bg-gray-100 rounded-lg px-2 py-1">
                                <span className="text-xs text-gray-600">+{(cls.isV2 ? cls.studentCount : cls.students.length) - 6}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Class Reward Scale */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎁</span>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600">Class Rewards</p>
                              <p className="text-sm sm:text-base font-semibold text-gray-800">Whole class XP progress</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Total XP</p>
                            <p className="text-lg sm:text-xl font-bold text-purple-600">{calculateClassTotalXP(cls)}</p>
                          </div>
                        </div>

                        {(() => {
                          const classTotalXP = calculateClassTotalXP(cls);
                          const maxTierXP = CLASS_REWARD_TIERS[CLASS_REWARD_TIERS.length - 1].xp;
                          const progress = Math.min(100, Math.round((classTotalXP / maxTierXP) * 100));
                          const nextTier = CLASS_REWARD_TIERS.find(tier => classTotalXP < tier.xp);
                          const nextMessage = nextTier
                            ? `${Math.max(0, nextTier.xp - classTotalXP)} XP to ${nextTier.label}`
                            : '🎉 Major prize unlocked!';

                          return (
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-3 sm:p-4 shadow-inner">
                              <div className="relative h-3 sm:h-4 bg-white rounded-full overflow-hidden border border-purple-100">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-inner"
                                  style={{ width: `${progress}%` }}
                                ></div>
                                <div className="absolute inset-0 flex justify-between">
                                  {CLASS_REWARD_TIERS.map((tier) => {
                                    const reached = classTotalXP >= tier.xp;
                                    return (
                                      <div key={tier.xp} className="relative flex-1">
                                        <div
                                          className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 ${
                                            reached ? 'bg-amber-400 border-amber-500 shadow-sm' : 'bg-white border-purple-200'
                                          }`}
                                          style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                                        ></div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="mt-3 grid grid-cols-5 gap-2 text-center text-[10px] sm:text-xs font-semibold text-purple-700">
                                {CLASS_REWARD_TIERS.map((tier) => {
                                  const reached = classTotalXP >= tier.xp;
                                  return (
                                    <div
                                      key={tier.xp}
                                      className={`px-2 py-1 rounded-lg border ${
                                        reached
                                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                                          : 'bg-white border-purple-100 text-purple-600'
                                      }`}
                                    >
                                      <div className="font-bold">{tier.xp.toLocaleString()} XP</div>
                                      <div>{tier.label}</div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-700">
                                <span className="font-semibold text-purple-700">{nextMessage}</span>
                                <span className="text-gray-500">{progress}% of 5,000 XP</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Action Buttons - Mobile Stack */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button
                          onClick={() => setActiveClass(cls.id)}
                          className="flex-1 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
                        >
                          {userData?.activeClassId === cls.id ? 'Current Class' : 'Set Active'}
                        </button>
                        <button
                          onClick={() => router.push('/classroom-champions')}
                          disabled={!canAccess}
                          className="flex-1 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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

          {/* Plan Status - Mobile Friendly */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="font-bold text-blue-800 mb-2 text-lg sm:text-xl">Your Plan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
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
                <p className="text-green-800 font-medium text-sm sm:text-base">
                  🎉 Free trial active! {trialDaysLeft} days remaining until January 1st, 2026.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Class Modal - Mobile Responsive */}
      {showCreateClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl">
              <h2 className="text-xl sm:text-2xl font-bold">
                {currentStep === 1 ? '📚 Create New Class' : '🎭 Choose Student Avatars'}
              </h2>
              <p className="text-purple-100 mt-2 text-sm sm:text-base">
                {currentStep === 1 ? 'Enter your class information and student names' : 'Select starting avatars for each student'}
              </p>
            </div>
            
            <div className="p-4 sm:p-6">
              {currentStep === 1 ? (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                    <input
                      type="text"
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="e.g., 5th Grade Math, Year 6 Blue"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Names (one per line)
                    </label>
                    <textarea
                      value={studentNames}
                      onChange={(e) => setStudentNames(e.target.value)}
                      rows="6"
                      placeholder="John Smith&#10;Sarah Johnson&#10;Mike Davis&#10;Emma Wilson"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 font-medium text-sm sm:text-base"
                    />
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      Enter each student's full name on a separate line. You can include first and last names.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-blue-800 font-medium text-sm sm:text-base">
                      Choose a starting avatar for each student. They can change avatars later as they level up!
                    </p>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {studentList.map(student => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <h4 className="font-bold text-base sm:text-lg text-gray-800 mb-3 sm:mb-4">{student.fullName}</h4>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                          {LEVEL_1_AVATARS.map(avatarName => (
                            <button
                              key={avatarName}
                              onClick={() => handleAvatarSelect(student.id, avatarName)}
                              className={`p-1 sm:p-2 rounded-lg border-2 transition-all ${
                                selectedAvatars[student.id] === avatarName
                                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              <img
                                src={getAvatarImage(avatarName)}
                                alt={avatarName}
                                className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg mx-auto"
                                onError={(e) => e.target.src = '/avatars/Wizard F/Level 1.png'}
                              />
                              <p className="text-xs text-center mt-1 font-medium text-gray-700 truncate">
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
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 pt-0">
              <button
                onClick={() => {
                  if (currentStep === 1) {
                    setShowCreateClassModal(false);
                  } else {
                    setCurrentStep(1);
                  }
                }}
                className="w-full sm:flex-1 px-4 py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm sm:text-base"
              >
                {currentStep === 1 ? 'Cancel' : 'Back'}
              </button>
              <button
                onClick={currentStep === 1 ? processStudentNames : createClass}
                disabled={isCreatingClass || (currentStep === 1 && (!className.trim() || !studentNames.trim()))}
                className="w-full sm:flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 sm:py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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