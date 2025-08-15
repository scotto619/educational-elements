// pages/student.js - Student Portal Main Page
import React, { useState, useEffect } from 'react';
import { firestore } from '../utils/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// Import reusable components (modify them for student use)
import StudentShop from '../components/student/StudentShop';
import StudentGames from '../components/student/StudentGames';
import StudentDashboard from '../components/student/StudentDashboard';

// Import existing utilities
import { 
  calculateAvatarLevel, 
  calculateCoins, 
  getAvatarImage, 
  getPetImage,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS
} from '../pages/classroom-champions';

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
      const session = JSON.parse(savedSession);
      setIsLoggedIn(true);
      setStudentData(session.studentData);
      setClassData(session.classData);
      setTeacherUserId(session.teacherUserId);
      setActiveTab('dashboard');
    }
  }, []);

  // ===============================================
  // AUTHENTICATION FUNCTIONS
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
      // Search for class with this code across all users
      const usersRef = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let foundClass = null;
      let foundTeacherUserId = null;

      // Search through all teachers' classes
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        if (userData.classes) {
          const matchingClass = userData.classes.find(cls => cls.classCode === classCode.trim());
          if (matchingClass) {
            foundClass = matchingClass;
            foundTeacherUserId = userDoc.id;
            break;
          }
        }
      }

      if (!foundClass) {
        setError('Class code not found. Please check with your teacher.');
        setLoading(false);
        return;
      }

      // Set available students for selection
      setAvailableStudents(foundClass.students || []);
      setClassData(foundClass);
      setTeacherUserId(foundTeacherUserId);
      
    } catch (error) {
      console.error('Error finding class:', error);
      setError('Error connecting to class. Please try again.');
    }

    setLoading(false);
  };

  const handleStudentSelect = (studentId) => {
    const student = availableStudents.find(s => s.id === studentId);
    if (!student) return;

    // Save session
    const session = {
      studentData: student,
      classData: classData,
      teacherUserId: teacherUserId,
      loginTime: new Date().toISOString()
    };
    
    sessionStorage.setItem('studentSession', JSON.stringify(session));
    
    setStudentData(student);
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('studentSession');
    setIsLoggedIn(false);
    setStudentData(null);
    setClassData(null);
    setTeacherUserId(null);
    setClassCode('');
    setAvailableStudents([]);
    setError('');
  };

  // ===============================================
  // STUDENT DATA UPDATE FUNCTIONS
  // ===============================================
  
  const updateStudentData = async (updatedStudentData) => {
    try {
      // Update in Firebase
      const teacherDocRef = doc(firestore, 'users', teacherUserId);
      const teacherDocSnap = await getDocs(collection(firestore, 'users'));
      
      // Get current teacher data
      const teacherDoc = await getDocs(query(collection(firestore, 'users'), where('__name__', '==', teacherUserId)));
      const teacherData = teacherDoc.docs[0].data();
      
      // Update the specific student in the specific class
      const updatedClasses = teacherData.classes.map(cls => {
        if (cls.id === classData.id) {
          return {
            ...cls,
            students: cls.students.map(student => 
              student.id === studentData.id ? { ...student, ...updatedStudentData } : student
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
      const session = JSON.parse(sessionStorage.getItem('studentSession'));
      session.studentData = newStudentData;
      sessionStorage.setItem('studentSession', JSON.stringify(session));
      
      return true;
    } catch (error) {
      console.error('Error updating student data:', error);
      return false;
    }
  };

  const showToast = (message, type = 'info') => {
    // Simple toast implementation - you can enhance this
    alert(`${type.toUpperCase()}: ${message}`);
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
                  onChange={(e) => setClassCode(e.target.value)}
                  placeholder="Enter your class code"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center text-lg font-semibold tracking-wider uppercase"
                  maxLength="10"
                  disabled={loading}
                />
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
                {loading ? 'Finding Class...' : 'Find My Class'}
              </button>
            </form>
          )}

          {/* Student Selection */}
          {availableStudents.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Select Your Name</h2>
                <p className="text-gray-600">Class: {classData?.name || 'Unknown Class'}</p>
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
    { id: 'shop', name: 'Shop', icon: '🛒' },
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