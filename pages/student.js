// pages/student.js - UPDATED WITH HALLOWEEN THEMED ITEMS
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
  getAvatarImage as gameHelpersGetAvatarImage, 
  getPetImage as gameHelpersGetPetImage,
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
        const studentIds = membershipData.studentIds || [];
        
        // Fetch all students
        for (const studentId of studentIds) {
          const studentDoc = await getDoc(doc(firestore, 'students', studentId));
          if (studentDoc.exists()) {
            students.push({ id: studentDoc.id, ...studentDoc.data() });
          }
        }
      }
      
      if (students.length === 0) {
        return null;
      }
      
      return {
        classData,
        students,
        teacherUserId: classData.teacherId,
        architectureVersion: 'V2'
      };
      
    } catch (error) {
      console.error('V2 search error:', error);
      return null;
    }
  };

  // V1 Architecture Search (fallback)
  const searchV1Architecture = async (classCodeInput) => {
    try {
      console.log('🔍 V1 Search: Querying users collection...');
      
      const usersQuery = query(
        collection(firestore, 'users'),
        where('classes', 'array-contains', classCodeInput.toUpperCase())
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        return null;
      }

      const teacherDoc = usersSnapshot.docs[0];
      const teacherId = teacherDoc.id;
      
      // Get all classes for this teacher
      const classesCollectionRef = collection(firestore, 'users', teacherId, 'classes');
      const classesSnapshot = await getDocs(classesCollectionRef);
      
      let targetClassData = null;
      let targetClassId = null;
      
      for (const classDoc of classesSnapshot.docs) {
        const data = classDoc.data();
        if (data.classCode?.toUpperCase() === classCodeInput.toUpperCase()) {
          targetClassData = { id: classDoc.id, ...data };
          targetClassId = classDoc.id;
          break;
        }
      }
      
      if (!targetClassData) {
        return null;
      }
      
      // Get students for this class
      const studentsCollectionRef = collection(firestore, 'users', teacherId, 'classes', targetClassId, 'students');
      const studentsSnapshot = await getDocs(studentsCollectionRef);
      
      const students = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (students.length === 0) {
        return null;
      }
      
      return {
        classData: targetClassData,
        students,
        teacherUserId: teacherId,
        architectureVersion: 'V1'
      };
      
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
    setLoginStep('password');
  };

  // ===============================================
  // STEP 3: PASSWORD VERIFICATION
  // ===============================================
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setPasswordLoading(true);
    setPasswordError('');

    try {
      console.log('🔐 Verifying password for student:', selectedStudent.firstName);
      
      const defaultPassword = getDefaultPassword(selectedStudent.firstName, selectedStudent.lastName);
      console.log('🔑 Default password generated:', defaultPassword);
      
      const isPasswordCorrect = await verifyStudentPasswordDirect(
        selectedStudent,
        studentPassword.trim(),
        defaultPassword
      );

      if (isPasswordCorrect) {
        console.log('✅ Password correct - logging in');
        
        // Fetch the latest student data
        let latestStudentData;
        
        if (architectureVersion === 'V2') {
          const studentDoc = await getDoc(doc(firestore, 'students', selectedStudent.id));
          if (studentDoc.exists()) {
            latestStudentData = { id: studentDoc.id, ...studentDoc.data() };
          } else {
            latestStudentData = selectedStudent;
          }
        } else {
          const studentDoc = await getDoc(
            doc(firestore, 'users', teacherUserId, 'classes', classData.id, 'students', selectedStudent.id)
          );
          if (studentDoc.exists()) {
            latestStudentData = { id: studentDoc.id, ...studentDoc.data() };
          } else {
            latestStudentData = selectedStudent;
          }
        }

        setStudentData(latestStudentData);
        setIsLoggedIn(true);
        
        // Save session
        sessionStorage.setItem('studentSession', JSON.stringify({
          studentData: latestStudentData,
          classData,
          teacherUserId,
          architectureVersion
        }));
        
      } else {
        console.log('❌ Password incorrect');
        setPasswordError('Incorrect password. Please try again or ask your teacher for help.');
      }
      
    } catch (error) {
      console.error('💥 Error verifying password:', error);
      setPasswordError('Something went wrong. Please try again.');
    }

    setPasswordLoading(false);
  };

  // ===============================================
  // UPDATE STUDENT DATA
  // ===============================================
  
  const updateStudentDataInFirebase = async (updates) => {
    if (!studentData || !teacherUserId || !classData) return;

    try {
      console.log('💾 Updating student data...', updates);
      
      let studentRef;
      
      if (architectureVersion === 'V2') {
        studentRef = doc(firestore, 'students', studentData.id);
      } else {
        studentRef = doc(firestore, 'users', teacherUserId, 'classes', classData.id, 'students', studentData.id);
      }

      await updateDoc(studentRef, {
        ...updates,
        lastUpdated: new Date().toISOString()
      });

      // Update local state
      const updatedData = { ...studentData, ...updates };
      setStudentData(updatedData);
      
      // Update session storage
      sessionStorage.setItem('studentSession', JSON.stringify({
        studentData: updatedData,
        classData,
        teacherUserId,
        architectureVersion
      }));

      console.log('✅ Student data updated successfully');
      
    } catch (error) {
      console.error('💥 Error updating student data:', error);
      throw error;
    }
  };

  // ===============================================
  // LOGOUT
  // ===============================================
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setStudentData(null);
    setClassData(null);
    setTeacherUserId(null);
    setClassCode('');
    setAvailableStudents([]);
    setSelectedStudent(null);
    setStudentPassword('');
    setLoginStep('classCode');
    setActiveTab('dashboard');
    sessionStorage.removeItem('studentSession');
  };

  // ===============================================
  // RENDER: LOGIN SCREENS
  // ===============================================

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <div className="text-4xl md:text-5xl mb-2">🎓</div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Student Portal</h1>
            <p className="text-gray-600 mt-2">Educational Elements / Classroom Champions</p>
          </div>

          {/* STEP 1: CLASS CODE */}
          {loginStep === 'classCode' && (
            <form onSubmit={handleClassCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Your Class Code
                </label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center text-2xl font-bold"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !classCode.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Finding Class...' : 'Find My Class'}
              </button>
            </form>
          )}

          {/* STEP 2: STUDENT SELECTION */}
          {loginStep === 'studentSelect' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{classData?.name}</h2>
                <p className="text-gray-600 text-sm">Select your name</p>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                {availableStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 p-4 rounded-lg text-left transition-all hover:shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints || 0))}
                        alt={`${student.firstName}'s avatar`}
                        className="w-12 h-12 rounded-full border-2 border-purple-300"
                        onError={(e) => {
                          e.target.src = '/shop/Basic/Banana.png';
                        }}
                      />
                      <div>
                        <div className="font-bold text-gray-800">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-600">Level {calculateAvatarLevel(student.totalPoints || 0)} • {student.totalPoints || 0} XP</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setLoginStep('classCode');
                  setSelectedStudent(null);
                  setError('');
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Back to Class Code
              </button>
            </div>
          )}

          {/* STEP 3: PASSWORD */}
          {loginStep === 'password' && selectedStudent && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <img 
                  src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints || 0))}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-purple-300"
                  onError={(e) => {
                    e.target.src = '/shop/Basic/Banana.png';
                  }}
                />
                <h2 className="text-xl font-bold text-gray-800">{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                <p className="text-gray-600 text-sm">Enter your password</p>
              </div>

              <div>
                <input
                  type="password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center text-xl"
                  disabled={passwordLoading}
                  autoFocus
                />
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordLoading || !studentPassword.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? 'Logging In...' : 'Login'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginStep('studentSelect');
                  setSelectedStudent(null);
                  setStudentPassword('');
                  setPasswordError('');
                }}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Back to Student List
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER: STUDENT PORTAL (LOGGED IN)
  // ===============================================

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '🏠', mobileIcon: '🏠' },
    { id: 'shop', name: 'Shop', icon: '🛒', mobileIcon: '🛒' },
    { id: 'games', name: 'Games', icon: '🎮', mobileIcon: '🎮' },
    { id: 'spelling', name: 'Spelling', icon: '✏️', mobileIcon: '✏️' },
    { id: 'reading', name: 'Reading', icon: '📖', mobileIcon: '📖' },
    { id: 'maths', name: 'Maths', icon: '🔢', mobileIcon: '🔢' },
    { id: 'literacy', name: 'Literacy', icon: '📝', mobileIcon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={getAvatarImage(studentData?.avatarBase, calculateAvatarLevel(studentData?.totalPoints || 0))}
                alt="Avatar"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-purple-300"
                onError={(e) => {
                  e.target.src = '/shop/Basic/Banana.png';
                }}
              />
              <div>
                <h2 className="font-bold text-gray-800 text-sm md:text-base">{studentData?.firstName}</h2>
                <p className="text-xs text-gray-600">{classData?.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-1 md:space-x-2">
                <span className="text-lg md:text-xl">⚡</span>
                <span className="font-bold text-blue-600 text-sm md:text-base">{studentData?.totalPoints || 0}</span>
              </div>
              <div className="flex items-center space-x-1 md:space-x-2">
                <span className="text-lg md:text-xl">💰</span>
                <span className="font-bold text-yellow-600 text-sm md:text-base">{calculateCoins(studentData)}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActiveSubTab(null);
                }}
                className={`flex items-center justify-center space-x-1 md:space-x-2 px-3 md:px-6 py-3 md:py-4 border-b-2 transition-all whitespace-nowrap text-xs md:text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 font-bold bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base md:text-lg">{tab.mobileIcon}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <StudentDashboard
            studentData={studentData}
            classData={classData}
            getAvatarImage={getAvatarImage}
            getPetImage={getPetImage}
            calculateCoins={calculateCoins}
            calculateAvatarLevel={calculateAvatarLevel}
          />
        )}

        {activeTab === 'shop' && (
          <StudentShop
            studentData={studentData}
            classData={classData}
            updateStudentData={updateStudentDataInFirebase}
            getAvatarImage={getAvatarImage}
            getPetImage={getPetImage}
            calculateCoins={calculateCoins}
            calculateAvatarLevel={calculateAvatarLevel}
            SHOP_BASIC_AVATARS={[...SHOP_BASIC_AVATARS, ...HALLOWEEN_BASIC_AVATARS]}
            SHOP_PREMIUM_AVATARS={[...SHOP_PREMIUM_AVATARS, ...HALLOWEEN_PREMIUM_AVATARS]}
            SHOP_BASIC_PETS={SHOP_BASIC_PETS}
            SHOP_PREMIUM_PETS={[...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS]}
          />
        )}

        {activeTab === 'games' && (
          <StudentGames studentData={studentData} />
        )}

        {activeTab === 'spelling' && (
          <StudentSpelling 
            studentData={studentData}
            classData={classData}
          />
        )}

        {activeTab === 'reading' && (
          <StudentReading 
            studentData={studentData}
            classData={classData}
          />
        )}

        {activeTab === 'maths' && (
          <StudentMaths 
            studentData={studentData}
            classData={classData}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
          />
        )}

        {activeTab === 'literacy' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">📝 Literacy Activities</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveSubTab('visual-writing')}
                  className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
                    activeSubTab === 'visual-writing'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="text-3xl md:text-4xl mb-2">🎨</div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-800">Visual Writing Prompts</h3>
                  <p className="text-sm text-gray-600 mt-2">Write creative stories based on images</p>
                </button>
              </div>
            </div>

            {activeSubTab === 'visual-writing' && (
              <VisualWritingPrompts 
                studentData={studentData}
                classData={classData}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;