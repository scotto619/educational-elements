// pages/student.js - UPDATED: Added Literacy tab with Visual Writing Prompts
import React, { useState, useEffect } from 'react';
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
import VisualWritingPrompts from '../components/curriculum/literacy/VisualWritingPrompts';

// Import from the correct gameHelpers file
import { 
  calculateAvatarLevel, 
  calculateCoins, 
  getAvatarImage, 
  getPetImage,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS
} from '../utils/gameHelpers';

// ===============================================
// HALLOWEEN THEMED ITEMS - MUST MATCH MAIN SITE
// ===============================================
const HALLOWEEN_BASIC_AVATARS = [
  { name: 'Demi', price: 15, path: '/shop/Themed/Halloween/Basic/Demi.png', theme: 'halloween' },
  { name: 'Jason', price: 18, path: '/shop/Themed/Halloween/Basic/Jason.png', theme: 'halloween' },
  { name: 'PumpkinKing', price: 20, path: '/shop/Themed/Halloween/Basic/PumpkinKing.png', theme: 'halloween' },
  { name: 'Skeleton', price: 15, path: '/shop/Themed/Halloween/Basic/Skeleton.png', theme: 'halloween' },
  { name: 'Witch', price: 18, path: '/shop/Themed/Halloween/Basic/Witch.png', theme: 'halloween' },
  { name: 'Zombie', price: 16, path: '/shop/Themed/Halloween/Basic/Zombie.png', theme: 'halloween' }
];

const HALLOWEEN_PREMIUM_AVATARS = [
  { name: 'Pumpkin', price: 35, path: '/shop/Themed/Halloween/Premium/Pumpkin.png', theme: 'halloween' },
  { name: 'Skeleton1', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton1.png', theme: 'halloween' },
  { name: 'Skeleton2', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton2.png', theme: 'halloween' },
  { name: 'Skeleton3', price: 40, path: '/shop/Themed/Halloween/Premium/Skeleton3.png', theme: 'halloween' },
  { name: 'Witch1', price: 42, path: '/shop/Themed/Halloween/Premium/Witch1.png', theme: 'halloween' },
  { name: 'Witch2', price: 42, path: '/shop/Themed/Halloween/Premium/Witch2.png', theme: 'halloween' },
  { name: 'Witch3', price: 42, path: '/shop/Themed/Halloween/Premium/Witch3.png', theme: 'halloween' },
  { name: 'Witch4', price: 42, path: '/shop/Themed/Halloween/Premium/Witch4.png', theme: 'halloween' },
  { name: 'Zombie1', price: 38, path: '/shop/Themed/Halloween/Premium/Zombie1.png', theme: 'halloween' }
];

const HALLOWEEN_PETS = [
  { name: 'Spooky Cat', price: 25, path: '/shop/Themed/Halloween/Pets/Pet.png', theme: 'halloween' },
  { name: 'Pumpkin Cat', price: 28, path: '/shop/Themed/Halloween/Pets/Pet2.png', theme: 'halloween' }
];

// Helper functions - UPDATED to include Halloween items and match main site exactly
const getAvatarImage = (avatarBase, level) => {
  // Check all shop avatar arrays including Halloween
  const shopItem = [...SHOP_BASIC_AVATARS, ...SHOP_PREMIUM_AVATARS, ...HALLOWEEN_BASIC_AVATARS, ...HALLOWEEN_PREMIUM_AVATARS]
    .find(a => a.name.toLowerCase() === (avatarBase || '').toLowerCase());
  if (shopItem) return shopItem.path;

  // Default to traditional avatar system
  const lvl = Math.min(4, Math.max(1, Math.round(level || 1)));
  const base = encodeURIComponent(avatarBase || 'Wizard F');
  return `/avatars/${base}/Level ${lvl}.png`;
};

const getPetImage = (pet) => {
    if (!pet || !pet.name) return '/Pets/Wizard.png';
    if (pet.path) return pet.path;
    
    // Check all shop pet arrays including Halloween
    const shopItem = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS].find(p => p.name.toLowerCase() === pet.name.toLowerCase());
    if (shopItem) return shopItem.path;
    
    // Fallback to old pet mapping system
    const key = (pet.type || pet.name || '').toLowerCase();
    const map = { 'alchemist': '/Pets/Alchemist.png', 'barbarian': '/Pets/Barbarian.png', 'bard': '/Pets/Bard.png', 'beastmaster': '/Pets/Beastmaster.png', 'cleric': '/Pets/Cleric.png', 'crystal knight': '/Pets/Crystal Knight.png', 'crystal sage': '/Pets/Crystal Sage.png', 'engineer': '/Pets/Engineer.png', 'frost mage': '/Pets/Frost Mage.png', 'illusionist': '/Pets/Illusionist.png', 'knight': '/Pets/Knight.png', 'lightning': '/Pets/Lightning.png', 'monk': '/Pets/Monk.png', 'necromancer': '/Pets/Necromancer.png', 'rogue': '/Pets/Rogue.png', 'stealth': '/Pets/Stealth.png', 'time knight': '/Pets/Time Knight.png', 'warrior': '/Pets/Warrior.png', 'wizard': '/Pets/Wizard.png' };
    return map[key] || '/Pets/Wizard.png';
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

  // Login flow states
  const [loginStep, setLoginStep] = useState('classCode'); // 'classCode', 'studentSelect', 'password'

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
      } catch (error) {
        console.error('Error parsing saved session:', error);
        sessionStorage.removeItem('studentSession');
      }
    }
  }, []);

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
      
      setStudentData(selectedStudent);
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

      // Update local state
      setStudentData(prev => ({ ...prev, ...updatedStudentData }));
      
      // Update session storage
      try {
        const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
        session.studentData = { ...session.studentData, ...updatedStudentData };
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

  const showToast = (message, type = 'info') => {
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
    { id: 'spelling', name: 'Spelling', icon: '🔤', shortName: 'Spelling' }
  ];

  // Handle tab changes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Set default subtab for tabs with subtabs
    if (tabId === 'maths') {
      setActiveSubTab('mentals');
    } else if (tabId === 'literacy') {
      setActiveSubTab('reading');
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
          
          <button 
            onClick={handleLogout}
            className="bg-gray-500 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base flex-shrink-0"
          >
            Logout
          </button>
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
    </div>
  );
};

export default StudentPortal;