// pages/student.js - FIXED with Correct Imports
import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Import reusable components
import StudentShop from '../components/student/StudentShop';
import StudentGames from '../components/student/StudentGames';
import StudentDashboard from '../components/student/StudentDashboard';

// FIXED: Import from the correct gameHelpers file
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

  // ===============================================
  // IMPROVED CLASS CODE LOOKUP APPROACH
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
      
      // APPROACH 1: Try to find class codes in a dedicated collection (if implemented)
      // This would be the most efficient approach but requires backend changes
      
      // APPROACH 2: Fallback to safer user collection search with better error handling
      const usersRef = collection(firestore, 'users');
      let usersSnapshot;
      
      try {
        // Try to get users - this will fail if security rules block it
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

      // Search through all teachers' classes
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
              foundClass = matchingClass;
              foundTeacherUserId = userDoc.id;
              break;
            }
          }
        } catch (userError) {
          console.warn('⚠️ Error processing user document:', userDoc.id, userError);
          // Continue searching other users
        }
      }

      if (!foundClass) {
        console.log('❌ No class found with code:', classCode.trim());
        setError('Class code not found. Please check with your teacher and make sure the code is correct.');
        setLoading(false);
        return;
      }

      console.log('✅ Class found with', foundClass.students?.length || 0, 'students');

      // Validate that the class has students
      if (!foundClass.students || foundClass.students.length === 0) {
        setError('This class has no students yet. Please check with your teacher.');
        setLoading(false);
        return;
      }

      // Set available students for selection
      setAvailableStudents(foundClass.students || []);
      setClassData(foundClass);
      setTeacherUserId(foundTeacherUserId);
      
    } catch (error) {
      console.error('💥 Unexpected error finding class:', error);
      
      // More specific error messages based on error type
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

    // Save session
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
      // Continue anyway - the session just won't persist
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
  // IMPROVED STUDENT DATA UPDATE FUNCTIONS
  // ===============================================
  
  const updateStudentData = async (updatedStudentData) => {
    if (!teacherUserId || !classData || !studentData) {
      console.error('Missing required data for student update');
      return false;
    }

    try {
      console.log('💾 Updating student data for:', studentData.firstName);
      
      // Get current teacher data
      const teacherDocRef = doc(firestore, 'users', teacherUserId);
      const teacherDocSnap = await getDoc(teacherDocRef);
      
      if (!teacherDocSnap.exists()) {
        console.error('Teacher document not found');
        return false;
      }

      const teacherData = teacherDocSnap.data();
      
      // Update the specific student in the specific class
      const updatedClasses = teacherData.classes.map(cls => {
        if (cls.id === classData.id) {
          return {
            ...cls,
            students: cls.students.map(student => 
              student.id === studentData.id 
                ? { ...student, ...updatedStudentData, lastUpdated: new Date().toISOString() }
                : student
            )
          };
        }
        return cls;
      });

      // Save to Firebase
      await updateDoc(teacherDocRef, { classes: updatedClasses });
      
      // Update local state
      const newStudentData = { ...studentData, ...updatedStudentData };
      setStudentData(newStudentData);
      
      // Update session
      try {
        const session = JSON.parse(sessionStorage.getItem('studentSession') || '{}');
        session.studentData = newStudentData;
        sessionStorage.setItem('studentSession', JSON.stringify(session));
      } catch (sessionError) {
        console.warn('Could not update session storage:', sessionError);
      }
      
      console.log('✅ Student data updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating student data:', error);
      return false;
    }
  };

  const showToast = (message, type = 'info') => {
    // Enhanced toast with better styling
    const toastElement = document.createElement('div');
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white font-semibold ${
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
    }, 3000);
  };

  // ===============================================
  // RENDER LOGIN SCREEN
  // ===============================================
  
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-16 w-16 mx-auto mb-4"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Student Portal
            </h1>
            <p className="text-gray-600 mt-2">Access your classroom adventure!</p>
          </div>

          {/* Class Code Entry */}
          {availableStudents.length === 0 && (
            <form onSubmit={handleClassCodeSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class Code
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="Enter your class code"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg font-semibold tracking-wider uppercase"
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Student Selection */}
          {availableStudents.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Select Your Name</h2>
                <p className="text-gray-600">Class: {classData?.name || 'Unknown Class'}</p>
                <p className="text-sm text-gray-500">Found {availableStudents.length} students</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {availableStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student.id)}
                    className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <img 
                      src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                      alt={student.firstName}
                      className="w-12 h-12 rounded-full border-2 border-gray-300"
                      onError={(e) => {
                        e.target.src = '/shop/Basic/Banana.png'; // Fallback image
                      }}
                    />
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
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
                className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
  // RENDER MAIN PORTAL
  // ===============================================
  
  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
    { id: 'shop', name: 'Shop', icon: '🛍️' },
    { id: 'games', name: 'Games', icon: '🎮' },
    { id: 'quizshow', name: 'Quiz Show', icon: '🎪' }
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
          />
        );
      case 'quizshow':
        return (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🎪</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Join the Quiz Show!</h2>
            <p className="text-gray-600 mb-6">
              Click the link below to join the live quiz show with your class.
            </p>
            <a 
              href="https://www.educational-elements.com/join" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all"
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/Logo/LOGO_NoBG.png" 
              alt="Educational Elements Logo" 
              className="h-10 w-10 mr-3"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome, {studentData?.firstName}!
              </h1>
              <p className="text-sm text-gray-600">
                Level {calculateAvatarLevel(studentData?.totalPoints)} Champion • {calculateCoins(studentData)} coins
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 font-semibold' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default StudentPortal;