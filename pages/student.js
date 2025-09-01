// pages/student.js - FIXED WITH MATH MENTALS PROGRESS PERSISTENCE
import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Import reusable components
import StudentShop from '../components/student/StudentShop';
import StudentGames from '../components/student/StudentGames';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentSpelling from '../components/student/StudentSpelling';
import StudentReading from '../components/student/StudentReading';
import StudentMathMentals from '../components/student/StudentMathMentals'; // NEW IMPORT

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
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Student data states
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [teacherUserId, setTeacherUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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
        setActiveTab('dashboard');
      } catch (error) {
        console.error('Error parsing saved session:', error);
        sessionStorage.removeItem('studentSession');
      }
    }
  }, []);

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
      
      const usersRef = collection(firestore, 'users');
      let usersSnapshot;
      
      try {
        usersSnapshot = await getDocs(usersRef);
        console.log('✅ Successfully retrieved users collection');
      } catch (firebaseError) {
        console.error('❌ Firebase security rules blocking users collection access:', firebaseError);
        setError('Unable to connect to class database. Please check your internet connection and try again.');
        setLoading(false);
        return;
      }
      
      let foundClass = null;
      let foundTeacherUserId = null;

      for (const userDoc of usersSnapshot.docs) {
        try {
          const userData = userDoc.data();
          console.log('👥 Checking user:', userDoc.id, 'has classes:', !!userData.classes);
          
          if (userData.classes && Array.isArray(userData.classes)) {
            const matchingClass = userData.classes.find(cls => 
              cls.classCode && cls.classCode.trim().toUpperCase() === classCode.trim().toUpperCase()
            );
            
            if (matchingClass) {
              console.log('🎯 Found matching class!', matchingClass.name);
              
              // ENHANCEMENT: Get additional teacher data including toolkitData
              const teacherDocRef = doc(firestore, 'users', userDoc.id);
              const teacherDocSnap = await getDoc(teacherDocRef);
              
              if (teacherDocSnap.exists()) {
                const fullTeacherData = teacherDocSnap.data();
                const fullClassData = fullTeacherData.classes.find(cls => cls.id === matchingClass.id);
                
                // Include toolkit data for spelling/reading/math assignments
                foundClass = {
                  ...fullClassData,
                  toolkitData: fullTeacherData.classes.find(cls => cls.id === matchingClass.id)?.toolkitData || {}
                };
                
                console.log('📚 Loaded class with toolkit data:', foundClass.toolkitData ? 'Yes' : 'No');
              } else {
                foundClass = matchingClass;
              }
              
              foundTeacherUserId = userDoc.id;
              break;
            }
          }
        } catch (userError) {
          console.warn('⚠️ Error processing user document:', userDoc.id, userError);
        }
      }

      if (!foundClass) {
        console.log('❌ No class found with code:', classCode.trim());
        setError('Class code not found. Please check with your teacher and make sure the code is correct.');
        setLoading(false);
        return;
      }

      console.log('✅ Class found with', foundClass.students?.length || 0, 'students');

      if (!foundClass.students || foundClass.students.length === 0) {
        setError('This class has no students yet. Please check with your teacher.');
        setLoading(false);
        return;
      }

      setAvailableStudents(foundClass.students || []);
      setClassData(foundClass);
      setTeacherUserId(foundTeacherUserId);
      
    } catch (error) {
      console.error('💥 Unexpected error finding class:', error);
      
      if (error.code === 'permission-denied') {
        setError('Access denied. Please check your internet connection and try again.');
      } else if (error.code === 'unavailable') {
        setError('Service temporarily unavailable. Please try again in a moment.');
      } else {
        setError('Unable to connect to class. Please check your internet connection and try again.');
      }
    }

    setLoading(false);
  };

  const handleStudentSelect = (studentId) => {
    const student = availableStudents.find(s => s.id === studentId);
    if (!student) {
      console.error('Student not found:', studentId);
      return;
    }

    console.log('👤 Student selected:', student.firstName);

    const session = {
      studentData: student,
      classData: classData,
      teacherUserId: teacherUserId,
      loginTime: new Date().toISOString()
    };
    
    try {
      sessionStorage.setItem('studentSession', JSON.stringify(session));
    } catch (sessionError) {
      console.warn('⚠️ Could not save session to sessionStorage:', sessionError);
    }
    
    setStudentData(student);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

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
    setClassCode('');
    setAvailableStudents([]);
    setError('');
  };

  // ===============================================
  // FIXED UPDATE FUNCTION - ENHANCED FOR MATH MENTALS PROGRESS PERSISTENCE
  // ===============================================
  
  const updateStudentData = async (updatedStudentData) => {
    if (!teacherUserId || !classData || !studentData) {
      console.error('Missing required data for student update');
      showToast('Unable to save changes. Please try logging in again.', 'error');
      return false;
    }

    try {
      console.log('💾 Updating student data via API for:', studentData.firstName);
      
      // Use the server API instead of direct Firestore writes
      const response = await fetch('/api/student-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherUserId: teacherUserId,
          classId: classData.id,
          studentId: studentData.id,
          updateData: updatedStudentData,
          classCode: classData.classCode
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ API Error:', result);
        
        if (response.status === 404) {
          showToast('Class or student not found. Please try logging in again.', 'error');
        } else if (response.status === 400) {
          showToast('Invalid update request. Please contact your teacher.', 'error');
        } else {
          showToast('Unable to save changes. Please try again.', 'error');
        }
        
        return false;
      }

      // CRITICAL FIX: Update local state with the response data
      const updatedStudent = result.student;
      setStudentData(updatedStudent);
      
      // CRITICAL FIX: For Math Mentals updates, also update classData to keep everything in sync
      if (updatedStudentData.mathMentalsProgress) {
        console.log('🧮 Math Mentals update detected - syncing local class data...');
        
        // Update the math groups in classData to reflect the new progress
        const updatedClassData = { ...classData };
        if (updatedClassData.toolkitData?.mathMentalsGroups) {
          updatedClassData.toolkitData.mathMentalsGroups = updatedClassData.toolkitData.mathMentalsGroups.map(group => ({
            ...group,
            students: group.students.map(student => {
              if (student.id === studentData.id) {
                return {
                  ...student,
                  progress: updatedStudentData.mathMentalsProgress.progress,
                  streak: updatedStudentData.mathMentalsProgress.streak,
                  currentLevel: updatedStudentData.mathMentalsProgress.currentLevel,
                  lastUpdated: new Date().toISOString()
                };
              }
              return student;
            })
          }));
          
          console.log('✅ Local math group data synchronized');
        }
        setClassData(updatedClassData);
        
        // Update session storage with both updated student and class data
        try {
          const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
          session.studentData = updatedStudent;
          session.classData = updatedClassData; // Include updated class data
          sessionStorage.setItem('studentSession', JSON.stringify(session));
          console.log('✅ Session storage updated with synced data');
        } catch (sessionError) {
          console.warn('Could not update session storage:', sessionError);
        }
      } else {
        // For non-Math Mentals updates, just update session storage normally
        try {
          const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
          session.studentData = updatedStudent;
          sessionStorage.setItem('studentSession', JSON.stringify(session));
        } catch (sessionError) {
          console.warn('Could not update session storage:', sessionError);
        }
      }
      
      console.log('✅ Student data updated successfully via API');
      return true;
      
    } catch (error) {
      console.error('❌ Network error updating student data:', error);
      
      // Check if it's a network connectivity issue
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast('Network connection error. Please check your internet and try again.', 'error');
      } else {
        showToast('Failed to save changes. Please try again.', 'error');
      }
      
      return false;
    }
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
    }, 4000); // Show longer for error messages
  };

  // ===============================================
  // RENDER LOGIN SCREEN - MOBILE OPTIMIZED
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
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Portal
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Access your classroom adventure!</p>
          </div>

          {/* Class Code Entry */}
          {availableStudents.length === 0 && (
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

          {/* Student Selection - Mobile Optimized */}
          {availableStudents.length > 0 && (
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
                    onClick={() => handleStudentSelect(student.id)}
                    className="flex items-center space-x-3 p-3 md:p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-95"
                  >
                    <img 
                      src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                      alt={student.firstName}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-300 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = '/shop/Basic/Banana.png';
                      }}
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
                onClick={() => {
                  setAvailableStudents([]);
                  setClassCode('');
                  setError('');
                }}
                className="w-full py-2 md:py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm md:text-base"
              >
                ← Back to Class Code
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER MAIN PORTAL - UPDATED WITH MATH MENTALS TAB
  // ===============================================
  
  const tabs = [
    { id: 'dashboard', name: 'Home', icon: '🏠', shortName: 'Home' },
    { id: 'mathmentals', name: 'Math Mentals', icon: '🧮', shortName: 'Math' }, // NEW TAB
    { id: 'spelling', name: 'Spelling', icon: '📝', shortName: 'Spelling' },
    { id: 'reading', name: 'Reading', icon: '📖', shortName: 'Reading' },
    { id: 'shop', name: 'Shop', icon: '🛍️', shortName: 'Shop' },
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
      case 'mathmentals': // NEW CASE FOR MATH MENTALS
        return (
          <StudentMathMentals 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
            updateStudentData={updateStudentData}
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
      case 'reading':
        return (
          <StudentReading 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
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
      {/* Header - Mobile Optimized */}
      <div className="bg-white shadow-lg border-b-4 border-blue-500">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-8 w-8 md:h-10 md:w-10 mr-2 md:mr-3 flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
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

      {/* Navigation - UPDATED TO HANDLE 7 TABS ON MOBILE */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content - Mobile Optimized */}
      <main className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default StudentPortal;