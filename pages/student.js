// pages/student.js - UPDATED: Added Literacy tab with Visual Writing Prompts
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { firestore } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Import the direct password helpers (no APIs needed)
import { verifyStudentPasswordDirect, getDefaultPassword } from '../utils/passwordHelpers';

// Import reusable components
import StudentShop from '../components/student/StudentShop';
import StudentGames from '../components/student/StudentGames';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentSpelling from '../components/student/StudentSpelling';
import StudentReading from '../components/student/StudentReading';
import StudentMathMentals from '../components/student/StudentMathMentals';
import StudentMaths from '../components/student/StudentMaths';
import StudentMorphology from '../components/student/StudentMorphology';
import VisualWritingPrompts from '../components/curriculum/literacy/VisualWritingPrompts';
import DailyMysteryBoxModal from '../components/student/DailyMysteryBoxModal';

// Import from the correct gameHelpers file
import { 
  calculateAvatarLevel, 
  calculateCoins, 
  getAvatarImage, 
  getPetImage,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_BASIC_AVATARS,
  HALLOWEEN_PREMIUM_AVATARS,
  HALLOWEEN_PETS,
  createPetEgg
} from '../utils/gameHelpers';

const isSameCalendarDay = (dateA, dateB) => (
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate()
);

const parseDateValue = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const parsed = value.toDate();
      return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
    }

    if (typeof value.seconds === 'number') {
      const milliseconds = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
      const parsed = new Date(milliseconds);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
};

const StudentPortal = () => {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPassword, setStudentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Student data states
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [teacherUserId, setTeacherUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState(null); // For subtabs within Maths/Literacy
  const [architectureVersion, setArchitectureVersion] = useState('unknown');
  const [dailyMysteryBoxAvailable, setDailyMysteryBoxAvailable] = useState(false);
  const [showDailyMysteryBox, setShowDailyMysteryBox] = useState(false);
  const [loginEggCelebration, setLoginEggCelebration] = useState(null);
  const dailyMysteryBoxAutoOpenKeyRef = useRef(null);
  const loginEggGrantAttemptedRef = useRef(false);

  const closeLoginEggCelebration = useCallback(() => setLoginEggCelebration(null), []);

  // Login flow states
  const [loginStep, setLoginStep] = useState('classCode'); // 'classCode', 'studentSelect', 'password'

  const availableAvatarPool = useMemo(
    () => [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS, ...(HALLOWEEN_BASIC_AVATARS || []), ...(HALLOWEEN_PREMIUM_AVATARS || [])],
    []
  );

  const availablePetPool = useMemo(
    () => [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...(HALLOWEEN_PETS || [])],
    []
  );

  const getDailyMysteryBoxStorageKey = useCallback((student) => {
    if (!student) {
      return null;
    }

    const identifier =
      student.id ||
      student.studentId ||
      student.uid ||
      student.userId ||
      student.email ||
      student.username ||
      (student.firstName ? `${student.firstName}-${student.lastName || ''}`.trim() : null);

    if (!identifier) {
      return null;
    }

    return `dailyMysteryBoxSeen:${identifier}`;
  }, []);

  const refreshDailyMysteryBoxAvailability = useCallback(
    (student, { autoOpen = false } = {}) => {
      if (!student) {
        setDailyMysteryBoxAvailable(false);
        setShowDailyMysteryBox(false);
        dailyMysteryBoxAutoOpenKeyRef.current = null;
        return false;
      }

      const lastClaimDate = parseDateValue(student.lastFreeMysteryBoxAt);
      const today = new Date();
      const todayKey = today.toISOString().slice(0, 10);
      const available = !lastClaimDate || !isSameCalendarDay(lastClaimDate, today);

      setDailyMysteryBoxAvailable(available);

      if (!available) {
        setShowDailyMysteryBox(false);
        dailyMysteryBoxAutoOpenKeyRef.current = null;
        return false;
      }

      const seenStorageKey = getDailyMysteryBoxStorageKey(student);
      let seenToday = false;

      if (seenStorageKey) {
        try {
          seenToday = sessionStorage.getItem(seenStorageKey) === todayKey;
        } catch (error) {
          console.warn('Unable to read daily mystery box session state:', error);
        }
      }

      const alreadyAutoOpenedToday = dailyMysteryBoxAutoOpenKeyRef.current === todayKey;

      if (autoOpen || (!alreadyAutoOpenedToday && !seenToday)) {
        setShowDailyMysteryBox(true);
        dailyMysteryBoxAutoOpenKeyRef.current = todayKey;

        if (seenStorageKey) {
          try {
            sessionStorage.setItem(seenStorageKey, todayKey);
          } catch (error) {
            console.warn('Unable to persist daily mystery box session state:', error);
          }
        }
      }

      return true;
    },
    [getDailyMysteryBoxStorageKey]
  );

  // Check for existing session on load
  useEffect(() => {
    const savedSession = sessionStorage.getItem('studentSession');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setIsLoggedIn(true);
        setStudentData(session.studentData);
        setClassData(session.classData);
        setTeacherUserId(session.teacherUserId);
        setArchitectureVersion(session.architectureVersion || 'unknown');
        setActiveTab('dashboard');
        if (session.studentData) {
          refreshDailyMysteryBoxAvailability(session.studentData, { autoOpen: true });
        }
      } catch (error) {
        console.error('Error parsing saved session:', error);
        sessionStorage.removeItem('studentSession');
      }
    }
  }, [refreshDailyMysteryBoxAvailability]);

  useEffect(() => {
    if (!isLoggedIn || !studentData) {
      return;
    }

    refreshDailyMysteryBoxAvailability(studentData);
  }, [isLoggedIn, refreshDailyMysteryBoxAvailability, studentData]);

  const showToast = useCallback((message, type = 'info') => {
    const toastElement = document.createElement('div');
    toastElement.className = `fixed top-4 left-4 right-4 md:top-4 md:right-4 md:left-auto z-50 p-4 rounded-lg shadow-lg text-white font-semibold text-center md:text-left max-w-sm mx-auto md:mx-0 ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    toastElement.textContent = message;

    document.body.appendChild(toastElement);

    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 4000);
  }, []);

  const handleDailyMysteryBoxClaimed = () => {
    setDailyMysteryBoxAvailable(false);
    setShowDailyMysteryBox(false);
    dailyMysteryBoxAutoOpenKeyRef.current = null;
  };

  const handleOpenDailyMysteryBox = useCallback(() => {
    if (!dailyMysteryBoxAvailable) {
      showToast('You have already opened your free mystery box today. Come back tomorrow for another surprise!', 'info');
      return;
    }

    setShowDailyMysteryBox(true);

    const todayKey = new Date().toISOString().slice(0, 10);
    if (dailyMysteryBoxAutoOpenKeyRef.current !== todayKey) {
      dailyMysteryBoxAutoOpenKeyRef.current = todayKey;
    }

    if (studentData) {
      const storageKey = getDailyMysteryBoxStorageKey(studentData);
      if (storageKey) {
        try {
          sessionStorage.setItem(storageKey, todayKey);
        } catch (error) {
          console.warn('Unable to persist daily mystery box session state:', error);
        }
      }
    }
  }, [dailyMysteryBoxAvailable, getDailyMysteryBoxStorageKey, showToast, studentData]);

  const grantLoginEggIfNeeded = useCallback(
    async (student) => {
      if (!student || student.loginEggGrantedAt) {
        return { student, granted: false, reason: 'already-granted' };
      }

      if (!teacherUserId || !classData) {
        console.warn('Missing class context for login egg grant');
        return { student, granted: false, reason: 'missing-context' };
      }

      try {
        const newEgg = createPetEgg();
        const updatedAt = new Date().toISOString();
        const nextEggs = [...(student.petEggs || []), newEgg];
        const updates = {
          petEggs: nextEggs,
          loginEggGrantedAt: updatedAt,
          updatedAt
        };

        if (architectureVersion === 'v2') {
          if (!student.id) {
            throw new Error('Missing student id for v2 login egg grant');
          }

          const studentRef = doc(firestore, 'students', student.id);
          await updateDoc(studentRef, updates);
        } else {
          const userRef = doc(firestore, 'users', teacherUserId);
          const userDoc = await getDoc(userRef);

          if (!userDoc.exists()) {
            throw new Error('Teacher record not found for login egg grant');
          }

          const userData = userDoc.data();
          let studentPatched = false;
          const updatedClasses = (userData.classes || []).map((cls) => {
            if (cls.classCode?.toUpperCase() === classData.classCode?.toUpperCase()) {
              const studentsArray = Array.isArray(cls.students) ? cls.students : [];
              const updatedStudents = studentsArray.map((s) => {
                const matchesStudent =
                  s.id === student.id ||
                  s.studentId === student.id ||
                  s.id === student.studentId ||
                  (s.studentId && student.studentId && s.studentId === student.studentId);

                if (matchesStudent) {
                  studentPatched = true;
                  return {
                    ...s,
                    ...updates
                  };
                }
                return s;
              });

              if (!studentPatched) {
                console.warn('Student entry not found for login egg grant in V1 architecture.');
              }

              return {
                ...cls,
                students: updatedStudents
              };
            }
            return cls;
          });

          await updateDoc(userRef, { classes: updatedClasses });
        }

        const updatedStudent = { ...student, ...updates };
        return { student: updatedStudent, granted: true, egg: newEgg };
      } catch (error) {
        console.error('Failed to grant login egg:', error);
        return { student, granted: false, reason: 'error', error };
      }
    },
    [architectureVersion, classData, teacherUserId]
  );

  useEffect(() => {
    if (
      !isLoggedIn ||
      !studentData ||
      studentData.loginEggGrantedAt ||
      !teacherUserId ||
      !classData ||
      loginEggGrantAttemptedRef.current
    ) {
      return;
    }

    let isMounted = true;
    loginEggGrantAttemptedRef.current = true;

    (async () => {
      const result = await grantLoginEggIfNeeded(studentData);
      if (!isMounted) {
        return;
      }

      if (result.granted) {
        const nextStudent = result.student;
        setStudentData(nextStudent);
        setSelectedStudent((prev) => (prev && prev.id === nextStudent.id ? nextStudent : prev));
        refreshDailyMysteryBoxAvailability(nextStudent);

        try {
          const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
          if (session.studentData && session.studentData.id === nextStudent.id) {
            session.studentData = nextStudent;
            sessionStorage.setItem('studentSession', JSON.stringify(session));
          }
        } catch (sessionError) {
          console.warn('Unable to persist login egg session update:', sessionError);
        }

        if (result.egg) {
          showToast(`You received a ${result.egg.name}!`, 'success');
          setLoginEggCelebration({
            name: result.egg.name,
            rarity: result.egg.rarity,
            accent: result.egg.accent,
            image: '/shop/Egg/Egg.png'
          });
        } else {
          showToast('You received a mysterious egg!', 'success');
          setLoginEggCelebration({
            name: 'Mystery Egg',
            rarity: 'mystery',
            accent: '#a855f7',
            image: '/shop/Egg/Egg.png'
          });
        }
      } else if (result.reason === 'error') {
        loginEggGrantAttemptedRef.current = false;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [
    classData,
    grantLoginEggIfNeeded,
    isLoggedIn,
    refreshDailyMysteryBoxAvailability,
    showToast,
    studentData,
    teacherUserId
  ]);

  // ===============================================
  // STEP 1: CLASS CODE SEARCH
  // ===============================================
  
  const handleClassCodeSubmit = async (e) => {
    e.preventDefault();
    if (!classCode.trim()) {
      setError('Please enter a class code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Searching for class code:', classCode.trim());
      
      // Try V2 architecture first, then V1 fallback
      let classResult = await searchV2Architecture(classCode.trim());
      
      if (!classResult) {
        console.log('🔄 V2 search failed, trying V1 fallback...');
        classResult = await searchV1Architecture(classCode.trim());
      }
      
      if (!classResult) {
        setError('Class code not found. Please check with your teacher and make sure the code is correct.');
        setLoading(false);
        return;
      }

      console.log('✅ Class found:', classResult.classData.name, 'Architecture:', classResult.architectureVersion);

      if (!classResult.students || classResult.students.length === 0) {
        setError('This class has no students yet. Please check with your teacher.');
        setLoading(false);
        return;
      }

      setAvailableStudents(classResult.students);
      setClassData(classResult.classData);
      setTeacherUserId(classResult.teacherUserId);
      setArchitectureVersion(classResult.architectureVersion);
      setLoginStep('studentSelect');
      
    } catch (error) {
      console.error('💥 Error finding class:', error);
      setError('Unable to connect to class. Please check your internet connection and try again.');
    }

    setLoading(false);
  };

  // V2 Architecture Search
  const searchV2Architecture = async (classCodeInput) => {
    try {
      console.log('🔍 V2 Search: Querying classes collection...');
      
      const classesQuery = query(
        collection(firestore, 'classes'),
        where('classCode', '==', classCodeInput.toUpperCase())
      );
      
      const classesSnapshot = await getDocs(classesQuery);
      
      if (classesSnapshot.empty) {
        return null;
      }

      const classDoc = classesSnapshot.docs[0];
      const classData = { id: classDoc.id, ...classDoc.data() };
      
      // Get class membership and students
      const membershipDoc = await getDoc(doc(firestore, 'class_memberships', classDoc.id));
      
      let students = [];
      if (membershipDoc.exists()) {
        const membershipData = membershipDoc.data();
        const studentIds = membershipData.students || [];
        
        if (studentIds.length > 0) {
          const studentPromises = studentIds.map(async (studentId) => {
            try {
              const studentDoc = await getDoc(doc(firestore, 'students', studentId));
              if (studentDoc.exists()) {
                return { id: studentDoc.id, ...studentDoc.data() };
              }
            } catch (error) {
              console.warn('⚠️ Error loading student:', studentId, error);
            }
            return null;
          });
          
          const studentResults = await Promise.all(studentPromises);
          students = studentResults.filter(s => s !== null);
        }
      }

      return {
        classData: { ...classData, toolkitData: classData.toolkitData || {} },
        students: students,
        teacherUserId: classData.teacherId,
        architectureVersion: 'v2'
      };

    } catch (error) {
      console.error('❌ V2 search error:', error);
      return null;
    }
  };

  // V1 Architecture Search
  const searchV1Architecture = async (classCodeInput) => {
    try {
      console.log('🔄 V1 Fallback: Scanning user documents...');
      
      const usersRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data();
          
          if (userData.classes && Array.isArray(userData.classes)) {
            const matchingClass = userData.classes.find(cls => 
              cls.classCode && cls.classCode.trim().toUpperCase() === classCodeInput.toUpperCase()
            );
            
            if (matchingClass) {
              return {
                classData: {
                  ...matchingClass,
                  id: matchingClass.id || matchingClass.classId || classCodeInput,
                  toolkitData: matchingClass.toolkitData || {}
                },
                students: matchingClass.students || [],
                teacherUserId: userDoc.id,
                architectureVersion: 'v1'
              };
            }
          }
        } catch (userError) {
          console.warn('⚠️ V1: Error processing user document:', userDoc.id, userError);
        }
      }

      return null;
      
    } catch (error) {
      console.error('❌ V1 search error:', error);
      return null;
    }
  };

  // ===============================================
  // STEP 2: STUDENT SELECTION
  // ===============================================
  
  const handleStudentSelect = (student) => {
    console.log('👤 Student selected:', student.firstName);
    setSelectedStudent(student);
    setStudentPassword('');
    setPasswordError('');
    setLoginStep('password');
  };

  // ===============================================
  // STEP 3: PASSWORD VERIFICATION - DIRECT (NO APIs)
  // ===============================================
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!studentPassword.trim()) {
      setPasswordError('Please enter your password');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      console.log('🔐 Verifying password directly (no API) for:', selectedStudent.firstName);
      
      // Use direct password verification (bypasses problematic APIs)
      const result = await verifyStudentPasswordDirect(
        selectedStudent.id, 
        studentPassword, 
        classData.classCode
      );

      if (!result.success) {
        const defaultPassword = getDefaultPassword(selectedStudent.firstName);
        setPasswordError(
          result.error === 'Invalid password' 
            ? `Incorrect password. Try: ${defaultPassword}` 
            : 'Unable to verify password. Please try again.'
        );
        setPasswordLoading(false);
        return;
      }

      console.log('✅ Password verified successfully via direct method');

      // Login successful - create session
      const session = {
        studentData: selectedStudent,
        classData: classData,
        teacherUserId: teacherUserId,
        architectureVersion: architectureVersion,
        loginTime: new Date().toISOString()
      };
      
      try {
        sessionStorage.setItem('studentSession', JSON.stringify(session));
      } catch (sessionError) {
        console.warn('⚠️ Could not save session to sessionStorage:', sessionError);
      }

      loginEggGrantAttemptedRef.current = false;
      setStudentData(selectedStudent);
      refreshDailyMysteryBoxAvailability(selectedStudent, { autoOpen: true });
      setIsLoggedIn(true);
      setActiveTab('dashboard');
      
    } catch (error) {
      console.error('❌ Direct password verification error:', error);
      setPasswordError('Network error. Please check your connection and try again.');
    }

    setPasswordLoading(false);
  };

  // ===============================================
  // ENHANCED UPDATE FUNCTION - DIRECT (NO APIs)
  // ===============================================
  
  const updateStudentData = async (updatedStudentData) => {
    if (!teacherUserId || !classData || !studentData) {
      console.error('Missing required data for student update');
      showToast('Unable to save changes. Please try logging in again.', 'error');
      return false;
    }

    try {
      console.log('💾 Updating student data directly (no API):', studentData.firstName);
      
      if (architectureVersion === 'v2') {
        // Direct V2 update
        const studentRef = doc(firestore, 'students', studentData.id);
        const updates = {
          ...updatedStudentData,
          updatedAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        };
        
        await updateDoc(studentRef, updates);
        console.log('✅ V2 direct student update completed');
        
      } else {
        // Direct V1 update
        const userRef = doc(firestore, 'users', teacherUserId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedClasses = userData.classes.map(cls => {
            if (cls.classCode?.toUpperCase() === classData.classCode?.toUpperCase()) {
              return {
                ...cls,
                students: cls.students.map(s => {
                  if (s.id === studentData.id) {
                    return { 
                      ...s, 
                      ...updatedStudentData,
                      updatedAt: new Date().toISOString() 
                    };
                  }
                  return s;
                })
              };
            }
            return cls;
          });
          
          await updateDoc(userRef, { classes: updatedClasses });
          console.log('✅ V1 direct student update completed');
        }
      }

      const nextStudentData = { ...studentData, ...updatedStudentData };

      // Update local state
      setStudentData(nextStudentData);
      refreshDailyMysteryBoxAvailability(nextStudentData);

      // Update session storage
      try {
        const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
        session.studentData = nextStudentData;
        sessionStorage.setItem('studentSession', JSON.stringify(session));
      } catch (sessionError) {
        console.warn('Could not update session storage:', sessionError);
      }
      
      return true;
      
    } catch (error) {
      console.error('❌ Direct student update error:', error);
      showToast('Failed to save changes. Please try again.', 'error');
      return false;
    }
  };

  // ===============================================
  // LOGOUT AND NAVIGATION
  // ===============================================
  
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('studentSession');
    } catch (error) {
      console.warn('Could not clear session storage:', error);
    }
    
    setIsLoggedIn(false);
    setStudentData(null);
    setClassData(null);
    setTeacherUserId(null);
    setArchitectureVersion('unknown');
    setClassCode('');
    setAvailableStudents([]);
    setSelectedStudent(null);
    setStudentPassword('');
    setError('');
    setPasswordError('');
    setLoginStep('classCode');
    setActiveSubTab(null);
    setDailyMysteryBoxAvailable(false);
    setShowDailyMysteryBox(false);
    dailyMysteryBoxAutoOpenKeyRef.current = null;
    loginEggGrantAttemptedRef.current = false;
  };

  const handleBackToClassCode = () => {
    setAvailableStudents([]);
    setSelectedStudent(null);
    setStudentPassword('');
    setClassCode('');
    setError('');
    setPasswordError('');
    setLoginStep('classCode');
  };

  const handleBackToStudentSelect = () => {
    setSelectedStudent(null);
    setStudentPassword('');
    setPasswordError('');
    setLoginStep('studentSelect');
  };

  // ===============================================
  // RENDER LOGIN SCREEN
  // ===============================================
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Portal
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Access your classroom adventure!</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                loginStep === 'classCode' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <div className={`w-8 h-1 ${loginStep !== 'classCode' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                loginStep === 'studentSelect' ? 'bg-blue-500 text-white' : 
                loginStep === 'password' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-8 h-1 ${loginStep === 'password' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                loginStep === 'password' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>

          {/* STEP 1: Class Code Entry */}
          {loginStep === 'classCode' && (
            <form onSubmit={handleClassCodeSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Code
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="Enter your class code"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg md:text-xl font-semibold tracking-wider uppercase"
                  maxLength="10"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Ask your teacher for the 6-character class code
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !classCode.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding Class...
                  </span>
                ) : (
                  'Find My Class'
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Student Selection */}
          {loginStep === 'studentSelect' && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Select Your Name</h2>
                <p className="text-gray-600 text-sm md:text-base">Class: {classData?.name || 'Unknown Class'}</p>
                <p className="text-xs md:text-sm text-gray-500">Found {availableStudents.length} students</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-64 md:max-h-80 overflow-y-auto">
                {availableStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="flex items-center space-x-3 p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
                  >
                    <img 
                      src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                      alt={student.firstName}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex-shrink-0"
                      onError={(e) => { e.target.src = '/shop/Basic/Banana.png'; }}
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm md:text-base truncate">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        Level {calculateAvatarLevel(student.totalPoints)} • {student.totalPoints || 0} XP
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleBackToClassCode}
                className="w-full py-2 md:py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm md:text-base"
              >
                ← Back to Class Code
              </button>
            </div>
          )}

          {/* STEP 3: Password Entry */}
          {loginStep === 'password' && selectedStudent && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 md:space-y-6">
              <div className="text-center">
                <img 
                  src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints))} 
                  alt={selectedStudent.firstName}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-blue-300 mx-auto mb-3"
                  onError={(e) => { e.target.src = '/shop/Basic/Banana.png'; }}
                />
                <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                  Welcome, {selectedStudent.firstName}!
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Please enter your password</p>
              </div>

              {/* PASSWORD HINT */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 text-center">
                  💡 <strong>Hint:</strong> Your password is usually your first name + "123"<br/>
                  Try: <code className="bg-blue-100 px-1 rounded">{getDefaultPassword(selectedStudent.firstName)}</code>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg md:text-xl font-semibold"
                  disabled={passwordLoading}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Ask your teacher if you forgot your password
                </p>
              </div>
              
              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{passwordError}</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={passwordLoading || !studentPassword.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToStudentSelect}
                className="w-full py-2 md:py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm md:text-base"
              >
                ← Choose Different Student
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER MAIN PORTAL WITH NEW LITERACY TAB
  // ===============================================
  
  const tabs = [
    { id: 'dashboard', name: 'Home', icon: '🏠', shortName: 'Home' },
    { id: 'maths', name: 'Maths', icon: '🔢', shortName: 'Maths', hasSubTabs: true },
    { id: 'literacy', name: 'Literacy', icon: '📚', shortName: 'Literacy', hasSubTabs: true },
    { id: 'shop', name: 'Shop', icon: '🛒', shortName: 'Shop' },
    { id: 'games', name: 'Games', icon: '🎮', shortName: 'Games' },
    { id: 'quizshow', name: 'Quiz Show', icon: '🎪', shortName: 'Quiz' }
  ];

  const mathsSubTabs = [
    { id: 'mentals', name: 'Mental Maths', icon: '🧮', shortName: 'Mentals' },
    { id: 'general', name: 'General Maths', icon: '➕', shortName: 'General' }
  ];

  const literacySubTabs = [
    { id: 'reading', name: 'Reading', icon: '📖', shortName: 'Reading' },
    { id: 'writing', name: 'Writing', icon: '✍️', shortName: 'Writing' },
    { id: 'spelling', name: 'Spelling', icon: '🔤', shortName: 'Spelling' },
    { id: 'morphology', name: 'Morphology', icon: '🧠', shortName: 'Morph' }
  ];

  const hasMorphologyLesson = Boolean(classData?.toolkitData?.morphology?.currentLesson);

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Set default subtab for tabs with subtabs
    if (tabId === 'maths') {
      setActiveSubTab('mentals');
    } else if (tabId === 'literacy') {
      setActiveSubTab(hasMorphologyLesson ? 'morphology' : 'reading');
    } else {
      setActiveSubTab(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <StudentDashboard
            studentData={studentData}
            classData={classData}
            getAvatarImage={getAvatarImage}
            getPetImage={getPetImage}
            calculateCoins={calculateCoins}
            calculateAvatarLevel={calculateAvatarLevel}
            dailyMysteryBoxAvailable={dailyMysteryBoxAvailable}
            onOpenDailyMysteryBox={handleOpenDailyMysteryBox}
          />
        );
      
      case 'maths':
        // Render maths subtabs content
        switch (activeSubTab) {
          case 'mentals':
            return (
              <StudentMathMentals 
                studentData={studentData}
                classData={classData}
                showToast={showToast}
              />
            );
          case 'general':
            return (
              <StudentMaths 
                studentData={studentData}
                classData={classData}
                showToast={showToast}
                updateStudentData={updateStudentData}
              />
            );
          default:
            return (
              <StudentMathMentals 
                studentData={studentData}
                classData={classData}
                showToast={showToast}
              />
            );
        }
      
      case 'literacy':
        // Render literacy subtabs content
        switch (activeSubTab) {
          case 'reading':
            return (
              <StudentReading 
                studentData={studentData}
                classData={classData}
                showToast={showToast}
              />
            );
          case 'writing':
            return (
              <VisualWritingPrompts 
                showToast={showToast}
                students={[studentData]}
              />
            );
          case 'spelling':
            return (
              <StudentSpelling
                studentData={studentData}
                classData={classData}
                showToast={showToast}
              />
            );
          case 'morphology':
            return (
              <StudentMorphology
                classData={classData}
              />
            );
          default:
            return (
              <StudentReading
                studentData={studentData}
                classData={classData}
                showToast={showToast}
              />
            );
        }
      
      case 'shop':
        return (
          <StudentShop
            studentData={studentData}
            updateStudentData={updateStudentData}
            showToast={showToast}
            getAvatarImage={getAvatarImage}
            getPetImage={getPetImage}
            calculateCoins={calculateCoins}
            calculateAvatarLevel={calculateAvatarLevel}
            SHOP_BASIC_AVATARS={SHOP_BASIC_AVATARS}
            SHOP_PREMIUM_AVATARS={SHOP_PREMIUM_AVATARS}
            SHOP_BASIC_PETS={SHOP_BASIC_PETS}
            SHOP_PREMIUM_PETS={SHOP_PREMIUM_PETS}
            HALLOWEEN_BASIC_AVATARS={HALLOWEEN_BASIC_AVATARS}
            HALLOWEEN_PREMIUM_AVATARS={HALLOWEEN_PREMIUM_AVATARS}
            HALLOWEEN_PETS={HALLOWEEN_PETS}
            classRewards={classData?.classRewards || []}
          />
        );
      
      case 'games':
        return (
          <StudentGames
            studentData={studentData}
            showToast={showToast}
            updateStudentData={updateStudentData}
            classData={classData}
            classmates={availableStudents}
          />
        );
      
      case 'quizshow':
        return (
          <div className="bg-white rounded-xl p-6 md:p-8 text-center">
            <div className="text-4xl md:text-6xl mb-4">🎪</div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Join the Quiz Show!</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
              Click the link below to join the live quiz show with your class.
            </p>
            <a 
              href="https://www.educational-elements.com/join" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:shadow-lg transition-all active:scale-95"
            >
              🚀 Join Quiz Show
            </a>
          </div>
        );
      
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3 flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                Welcome, {studentData?.firstName}!
              </h1>
              <p className="text-xs md:text-sm text-gray-600 truncate">
                Level {calculateAvatarLevel(studentData?.totalPoints)} Champion • {calculateCoins(studentData)} coins
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {dailyMysteryBoxAvailable && (
              <button
                onClick={handleOpenDailyMysteryBox}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                <span className="text-lg">🎁</span>
                <span className="hidden sm:inline">Daily Mystery Box</span>
                <span className="sm:hidden">Daily Box</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-500 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600 md:px-4 md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 flex flex-col md:flex-row items-center justify-center space-y-1 md:space-y-0 md:space-x-2 px-2 md:px-4 py-2 md:py-3 transition-all duration-200 min-w-[70px] md:min-w-0 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 font-semibold' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg md:text-xl">{tab.icon}</span>
                <span className="text-xs md:text-base md:hidden">{tab.shortName}</span>
                <span className="hidden md:inline text-sm lg:text-base">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation for Maths and Literacy */}
      {(activeTab === 'maths' || activeTab === 'literacy') && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b shadow-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto">
              {activeTab === 'maths' && mathsSubTabs.map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id)}
                  className={`flex-shrink-0 flex items-center justify-center space-x-2 px-3 md:px-6 py-2 md:py-3 transition-all duration-200 min-w-[100px] md:min-w-0 ${
                    activeSubTab === subTab.id 
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-white font-semibold' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-base md:text-lg">{subTab.icon}</span>
                  <span className="text-xs md:text-sm">{subTab.shortName}</span>
                </button>
              ))}
              {activeTab === 'literacy' && literacySubTabs.map(subTab => (
                <button
                  key={subTab.id}
                  onClick={() => setActiveSubTab(subTab.id)}
                  className={`flex-shrink-0 flex items-center justify-center space-x-2 px-3 md:px-6 py-2 md:py-3 transition-all duration-200 min-w-[100px] md:min-w-0 ${
                    activeSubTab === subTab.id
                      ? 'text-purple-600 border-b-2 border-purple-600 bg-white font-semibold'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white hover:bg-opacity-50'
                  }`}
                >
                  <span className="text-base md:text-lg">{subTab.icon}</span>
                  <span className="text-xs md:text-sm">{subTab.shortName}</span>
                  {subTab.id === 'morphology' && hasMorphologyLesson && (
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] md:text-xs font-semibold px-2 py-0.5">
                      NEW
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {renderTabContent()}
      </main>

      {loginEggCelebration && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black bg-opacity-60"
          onClick={closeLoginEggCelebration}
          role="presentation"
        >
          <div
            className="relative w-full max-w-md rounded-3xl shadow-xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${loginEggCelebration.accent || '#8b5cf6'}22, #ffffff)`
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-36 h-36 drop-shadow-2xl">
              <div className="w-full h-full rounded-full bg-white bg-opacity-90 flex items-center justify-center egg-shake">
                <Image
                  src={loginEggCelebration.image || '/shop/Egg/Egg.png'}
                  alt="Magical egg"
                  width={144}
                  height={144}
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>

            <div className="pt-20 pb-8 px-6 sm:px-10 text-center space-y-4">
              <h2 className="text-2xl font-bold text-purple-700">You received an egg!</h2>
              <p className="text-sm text-gray-600">
                Welcome back! A special egg has been added to your incubator just for logging in.
              </p>
              <div className="bg-white bg-opacity-80 rounded-2xl px-4 py-3 border border-purple-100">
                <p className="text-base font-semibold text-gray-800">{loginEggCelebration.name}</p>
                {loginEggCelebration.rarity && (
                  <p className="text-xs uppercase tracking-wide text-purple-500 font-semibold">
                    {loginEggCelebration.rarity}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={closeLoginEggCelebration}
                className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md transition-transform duration-150 active:scale-95"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      <DailyMysteryBoxModal
        isOpen={showDailyMysteryBox && Boolean(studentData)}
        onClose={() => setShowDailyMysteryBox(false)}
        studentData={studentData}
        updateStudentData={updateStudentData}
        showToast={showToast}
        avatars={availableAvatarPool}
        pets={availablePetPool}
        rewards={classData?.classRewards || []}
        onClaimComplete={handleDailyMysteryBoxClaimed}
      />
    </div>
  );
};

export default StudentPortal;