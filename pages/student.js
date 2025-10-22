// pages/student.js - UPDATED WITH LITERACY TAB
import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Import the direct password helpers (no APIs needed)
import { verifyStudentPasswordDirect, getDefaultPassword } from '../utils/passwordHelpers';

// Import reusable components
import StudentShop from '../components/student/StudentShop';
import StudentGames from '../components/student/StudentGames';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentMathMentals from '../components/student/StudentMathMentals';
import StudentMaths from '../components/student/StudentMaths';
import StudentLiteracy from '../components/student/StudentLiteracy'; // NEW IMPORT

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

      console.log('✅ Class found:', classResult);
      setAvailableStudents(classResult.students);
      setTeacherUserId(classResult.teacherUserId);
      setClassData(classResult.classData);
      setArchitectureVersion(classResult.architectureVersion);
      setLoginStep('studentSelect');
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error finding class:', error);
      setError('Something went wrong. Please try again or contact your teacher.');
      setLoading(false);
    }
  };

  // Search V2 Architecture
  const searchV2Architecture = async (code) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('classCode', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const teacherDoc = querySnapshot.docs[0];
        const teacherData = teacherDoc.data();
        const teacherId = teacherDoc.id;

        console.log('📖 V2: Found teacher with matching class code');
        
        // V2 uses "users/{userId}/classes" structure
        const classesRef = collection(firestore, `users/${teacherId}/classes`);
        const classesSnapshot = await getDocs(classesRef);

        if (!classesSnapshot.empty) {
          // Get the first class (there's typically only one class per teacher in this structure)
          const classDoc = classesSnapshot.docs[0];
          const classData = classDoc.data();
          
          return {
            students: classData.students || [],
            teacherUserId: teacherId,
            classData: {
              ...classData,
              classId: classDoc.id,
              className: classData.name || 'My Class'
            },
            architectureVersion: 'v2'
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('V2 search error:', error);
      return null;
    }
  };

  // Search V1 Architecture (Fallback)
  const searchV1Architecture = async (code) => {
    try {
      const usersRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(usersRef);

      for (const userDoc of querySnapshot.docs) {
        const userData = userDoc.data();
        const classes = userData.classes || [];
        
        for (const classDoc of classes) {
          if (classDoc.classCode === code.toUpperCase()) {
            console.log('📖 V1: Found matching class in user document');
            
            return {
              students: classDoc.students || [],
              teacherUserId: userDoc.id,
              classData: {
                ...classDoc,
                classId: classDoc.id,
                className: classDoc.name || 'My Class'
              },
              architectureVersion: 'v1'
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('V1 search error:', error);
      return null;
    }
  };

  // ===============================================
  // STEP 2: STUDENT SELECTION
  // ===============================================
  
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentPassword('');
    setPasswordError('');
    setLoginStep('password');
  };

  // ===============================================
  // STEP 3: PASSWORD VERIFICATION
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
      console.log('🔐 Attempting direct password verification...');
      
      // Use the direct password verification helper
      const isValid = await verifyStudentPasswordDirect(
        teacherUserId,
        selectedStudent.id,
        studentPassword,
        architectureVersion
      );

      if (isValid) {
        console.log('✅ Password correct! Logging in student...');
        
        // Save session
        const session = {
          studentData: selectedStudent,
          classData: classData,
          teacherUserId: teacherUserId,
          architectureVersion: architectureVersion
        };
        sessionStorage.setItem('studentSession', JSON.stringify(session));
        
        setStudentData(selectedStudent);
        setIsLoggedIn(true);
        setActiveTab('dashboard');
      } else {
        console.log('❌ Password incorrect');
        setPasswordError('Incorrect password. Please try again or ask your teacher for help.');
      }
      
      setPasswordLoading(false);
      
    } catch (error) {
      console.error('❌ Password verification error:', error);
      setPasswordError('Something went wrong. Please try again.');
      setPasswordLoading(false);
    }
  };

  // ===============================================
  // UPDATE STUDENT DATA (For shop purchases, games, etc.)
  // ===============================================
  
  const updateStudentData = async (updatedStudentData) => {
    try {
      console.log('💾 Updating student data...', {
        architectureVersion,
        teacherId: teacherUserId,
        studentId: studentData.id,
        updates: Object.keys(updatedStudentData)
      });

      // V2 Architecture - Update in Firestore subcollection
      if (architectureVersion === 'v2') {
        console.log('📝 V2: Updating in subcollection structure');
        
        const classesRef = collection(firestore, `users/${teacherUserId}/classes`);
        const classesSnapshot = await getDocs(classesRef);
        
        if (!classesSnapshot.empty) {
          const classDoc = classesSnapshot.docs[0];
          const classDocRef = doc(firestore, `users/${teacherUserId}/classes/${classDoc.id}`);
          const classData = classDoc.data();
          
          const updatedStudents = classData.students.map(s => 
            s.id === studentData.id ? { ...s, ...updatedStudentData } : s
          );
          
          await updateDoc(classDocRef, { students: updatedStudents });
          console.log('✅ V2 student update completed');
        }
      } 
      // V1 Architecture - Update in user document
      else {
        console.log('📝 V1: Updating in user document');
        
        const userRef = doc(firestore, 'users', teacherUserId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedClasses = userData.classes.map(cls => {
            if (cls.classCode === classData.classCode) {
              return {
                ...cls,
                students: cls.students.map(s => 
                  s.id === studentData.id ? { ...s, ...updatedStudentData } : s
                )
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
            <div className="text-4xl md:text-5xl mb-3">🎓</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Student Portal</h1>
            <p className="text-sm md:text-base text-gray-600">Welcome back! Let's learn together</p>
          </div>

          {/* Step 1: Class Code Entry */}
          {loginStep === 'classCode' && (
            <form onSubmit={handleClassCodeSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Class Code
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg text-center text-lg md:text-xl font-bold uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  maxLength={6}
                  disabled={loading}
                />
                <p className="text-xs md:text-sm text-gray-500 mt-2 text-center">
                  Ask your teacher for the class code
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
                  'Continue'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Student Selection */}
          {loginStep === 'studentSelect' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-800">Select Your Name</h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Click on your name to continue</p>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="w-full p-3 md:p-4 bg-gradient-to-r from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-2 border-gray-200 rounded-lg text-left transition-all hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl md:text-3xl">
                        {getAvatarImage(calculateAvatarLevel(student.totalPoints || 0))}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm md:text-base">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-600">
                          Level {calculateAvatarLevel(student.totalPoints || 0)} • {student.totalPoints || 0} XP
                        </p>
                      </div>
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

          {/* Step 3: Password Entry */}
          {loginStep === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4 md:space-y-6">
              <div className="text-center mb-4">
                <div className="text-3xl md:text-4xl mb-2">
                  {getAvatarImage(calculateAvatarLevel(selectedStudent?.totalPoints || 0))}
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gray-800">
                  Welcome, {selectedStudent?.firstName}!
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1">Enter your password to continue</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-lg text-base md:text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  disabled={passwordLoading}
                  autoFocus
                />
                <p className="text-xs md:text-sm text-gray-500 mt-2">
                  💡 Default password is your first name (lowercase)
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
    { id: 'maths', name: 'Maths', icon: '🔢', shortName: 'Maths' },
    { id: 'literacy', name: 'Literacy', icon: '📚', shortName: 'Literacy' }, // NEW LITERACY TAB
    { id: 'shop', name: 'Shop', icon: '🛒', shortName: 'Shop' },
    { id: 'games', name: 'Games', icon: '🎮', shortName: 'Games' },
    { id: 'quizshow', name: 'Quiz Show', icon: '🎪', shortName: 'Quiz' }
  ];

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
        return (
          <StudentMaths 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
            updateStudentData={updateStudentData}
          />
        );
      case 'literacy':
        return (
          <StudentLiteracy 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
            updateStudentData={updateStudentData}
          />
        );
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
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Student Info */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="text-2xl md:text-3xl">
                {getAvatarImage(calculateAvatarLevel(studentData?.totalPoints || 0))}
              </div>
              <div>
                <h1 className="text-sm md:text-lg font-bold text-gray-800">
                  {studentData?.firstName} {studentData?.lastName}
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  Level {calculateAvatarLevel(studentData?.totalPoints || 0)} • {studentData?.totalPoints || 0} XP • {calculateCoins(studentData)} 🪙
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 md:px-4 py-2 bg-red-500 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto space-x-1 md:space-x-2 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center
                  px-3 md:px-6 py-2 md:py-3 rounded-lg
                  font-semibold text-xs md:text-sm
                  transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span className="text-lg md:text-2xl mb-1">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.shortName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StudentPortal;