// components/tabs/TeachersToolkitTab.js - Enhanced with Firebase Persistence for Jobs and Timetables
import React, { useState, useEffect } from 'react';

// Import tool components from the tools folder
import StudentHelpQueue from '../tools/StudentHelpQueue';
import GroupMaker from '../tools/GroupMaker';
import NamePicker from '../tools/NamePicker';
import TimerTools from '../tools/TimerTools';
import ClassroomDesigner from '../tools/ClassroomDesigner';
import DiceRoller from '../tools/DiceRoller';
import ClassroomJobs from '../tools/ClassroomJobs';
import TimetableCreator from '../tools/TimetableCreator';

// ===============================================
// BIRTHDAY WALL COMPONENT
// ===============================================
const BirthdayWall = ({ students, showToast, saveClassroomDataToFirebase, currentClassId, getAvatarImage, calculateAvatarLevel }) => {
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [birthdayInput, setBirthdayInput] = useState('');
  const [assignBirthdayAvatar, setAssignBirthdayAvatar] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  const oneWeekFromNowStr = oneWeekFromNow.toISOString().split('T')[0];

  // Available Birthday Avatars (from file structure)
  const BIRTHDAY_AVATARS = [
    { name: 'Birthday Cake', path: '/shop/Themed/Birthday/BirthdayCake.png' },
    { name: 'Party Hat', path: '/shop/Themed/Birthday/PartyHat.png' },
    { name: 'Balloon Hero', path: '/shop/Themed/Birthday/BalloonHero.png' },
  ];

  // Filter students with birthdays today or within 7 days
  const getUpcomingBirthdays = () => {
    return students
      .filter(student => student.birthday)
      .map(student => {
        const birthDate = new Date(student.birthday);
        const todayDate = new Date(today);
        // Adjust birth year to current year for comparison
        birthDate.setFullYear(todayDate.getFullYear());
        const isToday = birthDate.toISOString().split('T')[0] === today;
        const isUpcoming = birthDate >= todayDate && birthDate <= new Date(oneWeekFromNowStr);
        return { ...student, isToday, isUpcoming };
      })
      .sort((a, b) => new Date(a.birthday) - new Date(b.birthday));
  };

  // Handle birthday date change
  const handleSetBirthday = (studentId) => {
    if (!birthdayInput) {
      showToast('Please select a valid date', 'error');
      return;
    }
    const updatedStudents = students.map(student =>
      student.id === studentId
        ? {
            ...student,
            birthday: birthdayInput,
            birthdayAvatar: assignBirthdayAvatar
              ? BIRTHDAY_AVATARS[Math.floor(Math.random() * BIRTHDAY_AVATARS.length)].name
              : student.birthdayAvatar || null,
          }
        : student
    );
    saveClassroomDataToFirebase(updatedStudents, currentClassId);
    showToast('Birthday updated successfully!', 'success');
    setEditingStudentId(null);
    setBirthdayInput('');
    setAssignBirthdayAvatar(false);
  };

  // Notify about today's birthdays on mount
  useEffect(() => {
    const todayBirthdays = students.filter(
      student => student.birthday && new Date(student.birthday).toISOString().split('T')[0] === today
    );
    if (todayBirthdays.length > 0) {
      showToast(`Happy Birthday to ${todayBirthdays.map(s => s.firstName).join(', ')}! 🎉`, 'success');
    }
  }, [students, today, showToast]);

  const upcomingBirthdays = getUpcomingBirthdays();

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        🎂 Birthday Wall
      </h3>

      {/* Upcoming Birthdays Section */}
      <div className="bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl p-6 shadow-lg">
        <h4 className="font-bold text-lg text-pink-800 mb-4">Upcoming Birthdays</h4>
        {upcomingBirthdays.length === 0 ? (
          <p className="text-gray-600">No birthdays in the next 7 days.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBirthdays.map(student => (
              <div
                key={student.id}
                className={`p-4 rounded-lg shadow-md flex items-center space-x-4 transition-all duration-300 ${
                  student.isToday ? 'bg-yellow-100 border-2 border-yellow-400 animate-pulse' : 'bg-white'
                }`}
              >
                <img
                  src={
                    student.isToday && student.birthdayAvatar
                      ? BIRTHDAY_AVATARS.find(a => a.name === student.birthdayAvatar)?.path ||
                        getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))
                      : getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))
                  }
                  alt={`${student.firstName}'s Avatar`}
                  className="w-12 h-12 rounded-full border-2 border-gray-300"
                  onError={(e) => (e.target.src = '/avatars/Wizard F/Level 1.png')}
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(student.birthday).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                    {student.isToday && (
                      <span className="ml-2 text-yellow-600 font-bold">🎉 Today!</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manage Birthdays Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="font-bold text-lg text-gray-800 mb-4">Manage Student Birthdays</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <div key={student.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))}
                  alt={`${student.firstName}'s Avatar`}
                  className="w-10 h-10 rounded-full border-2 border-gray-300"
                  onError={(e) => (e.target.src = '/avatars/Wizard F/Level 1.png')}
                />
                <div>
                  <div className="font-semibold">{student.firstName} {student.lastName}</div>
                  <div className="text-sm text-gray-500">
                    {student.birthday
                      ? new Date(student.birthday).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'No birthday set'}
                  </div>
                </div>
              </div>
              {editingStudentId === student.id ? (
                <div className="space-y-3">
                  <input
                    type="date"
                    value={birthdayInput}
                    onChange={(e) => setBirthdayInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    max={today}
                  />
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={assignBirthdayAvatar}
                      onChange={(e) => setAssignBirthdayAvatar(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    />
                    <label className="text-sm text-gray-700">Assign Birthday Avatar</label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSetBirthday(student.id)}
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudentId(null);
                        setBirthdayInput('');
                        setAssignBirthdayAvatar(false);
                      }}
                      className="flex-1 px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setEditingStudentId(student.id);
                    setBirthdayInput(student.birthday || '');
                    setAssignBirthdayAvatar(!!student.birthdayAvatar);
                  }}
                  className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {student.birthday ? 'Edit Birthday' : 'Set Birthday'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Birthday Avatars Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg">
        <h4 className="font-bold text-lg text-gray-800 mb-4">Birthday Avatars</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BIRTHDAY_AVATARS.map(avatar => (
            <div key={avatar.name} className="text-center p-4 bg-white rounded-lg shadow-md">
              <img
                src={avatar.path}
                alt={avatar.name}
                className="w-16 h-16 rounded-full mx-auto mb-2"
                onError={(e) => (e.target.src = '/avatars/Wizard F/Level 1.png')}
              />
              <p className="font-semibold text-gray-800">{avatar.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// TEACHERS TOOLKIT TAB COMPONENT
// ===============================================
const TeachersToolkitTab = ({
  students = [],
  user,
  showToast = () => {},
  userData = {},
  saveGroupDataToFirebase,
  saveClassroomDataToFirebase,
  currentClassId,
  onAwardXP = () => {},
  activeQuests = [],
  attendanceData = {},
  markAttendance,
  completeQuest,
  setShowQuestManagement,
  getAvatarImage,
  calculateAvatarLevel,
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('timetable');
  const [attendanceState, setAttendanceState] = useState(attendanceData);
  const [timerSettings, setTimerSettings] = useState({
    minutes: 5,
    seconds: 0,
    isRunning: false,
    isActive: false,
    time: 300,
    originalTime: 300,
    isPaused: false,
    type: 'countdown',
  });

  // ADDED: Firebase data management for toolkit tools
  const [toolkitData, setToolkitData] = useState({});

  // Load toolkit data from Firebase via parent component
  useEffect(() => {
    // This would be loaded from the parent component's userData
    if (userData?.classes) {
      const currentClass = userData.classes.find(cls => cls.id === currentClassId);
      if (currentClass?.toolkitData) {
        setToolkitData(currentClass.toolkitData);
      }
    }
  }, [userData, currentClassId]);

  // ADDED: Save function for toolkit data
  const saveToolkitData = async (updates) => {
    const updatedToolkitData = { ...toolkitData, ...updates };
    setToolkitData(updatedToolkitData);
    
    // Save to Firebase via parent component
    if (saveClassroomDataToFirebase) {
      saveClassroomDataToFirebase({ toolkitData: updatedToolkitData }, currentClassId);
    }
  };

  const isPro = userData?.subscription === 'pro' || true;

  const calculateBasicAnalytics = () => {
    return {
      totalStudents: students.length,
      averageXP: students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.totalPoints || 0), 0) / students.length)
        : 0,
      highPerformers: students.filter(s => (s.totalPoints || 0) >= 200).length,
      needsAttention: students.filter(s => (s.totalPoints || 0) < 50).length,
    };
  };

  const calculateQuestAnalytics = () => {
    if (!activeQuests || activeQuests.length === 0) {
      return {
        totalQuests: 0,
        totalCompletions: 0,
        completionRate: 0,
      };
    }

    const analytics = {
      totalQuests: activeQuests.length,
      totalCompletions: activeQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0),
    };

    const possibleCompletions = analytics.totalQuests * students.length;
    analytics.completionRate = possibleCompletions > 0
      ? Math.round((analytics.totalCompletions / possibleCompletions) * 100)
      : 0;

    return analytics;
  };

  const calculateAttendanceStats = () => {
    const dates = Object.keys(attendanceState);
    if (dates.length === 0) return { averageAttendance: 0, totalDaysTracked: 0, perfectAttendanceStudents: 0 };

    const totalStudentDays = dates.length * students.length;
    const totalPresentCount = dates.reduce((acc, date) => {
      return acc + Object.values(attendanceState[date] || {}).filter(status => status === 'present').length;
    }, 0);

    const averageAttendance = totalStudentDays > 0
      ? Math.round((totalPresentCount / totalStudentDays) * 100)
      : 0;

    const perfectAttendanceStudents = students.filter(student => {
      return dates.every(date => attendanceState[date]?.[student.id] === 'present');
    }).length;

    return {
      averageAttendance,
      totalDaysTracked: dates.length,
      perfectAttendanceStudents,
      attendanceTrend: 'stable',
    };
  };

  const handleMarkAttendance = (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    const newAttendanceState = {
      ...attendanceState,
      [today]: {
        ...attendanceState[today],
        [studentId]: status,
      },
    };

    setAttendanceState(newAttendanceState);

    if (markAttendance) {
      markAttendance(studentId, status);
    }

    showToast(`Attendance marked for student`, 'success');
  };

  const handleSaveTimetableData = (timetableData) => {
    showToast('Timetable saved successfully!', 'success');
    console.log('Timetable data to save:', timetableData);
  };

  if (!isPro) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Teachers Toolkit</h2>
        <p className="text-gray-700 mb-6">
          The Teachers Toolkit is a PRO feature that includes interactive teaching tools to enhance your classroom experience.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
          <p className="text-yellow-700 font-semibold mb-3">🌟 PRO Teaching Tools Include:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-600 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>💼</span>
                <span>Interactive Classroom Jobs System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>Visual Timetable Creator</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎂</span>
                <span>Birthday Wall & Reminders</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎫</span>
                <span>Student Help Queue System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>Smart Group Maker with Constraints</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Smart Name Picker Wheel</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span>Epic Timer Tools with Animations</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🏫</span>
                <span>Interactive Classroom Designer</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎲</span>
                <span>Advanced Dice Roller System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Advanced Attendance Tracking</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => showToast('Upgrade feature coming soon!', 'info')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          Upgrade to PRO
        </button>
      </div>
    );
  }

  const analytics = calculateBasicAnalytics();
  const questAnalytics = calculateQuestAnalytics();
  const attendanceStats = calculateAttendanceStats();

  const toolkitTabs = [
    { id: 'classroom-jobs', label: 'Classroom Jobs', icon: '💼' },
    { id: 'timetable', label: 'Timetable', icon: '📅' },
    { id: 'birthday-wall', label: 'Birthday Wall', icon: '🎂' },
    { id: 'help-queue', label: 'Help Queue', icon: '🎫' },
    { id: 'attendance', label: 'Attendance', icon: '✅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'group-maker', label: 'Group Maker', icon: '👥' },
    { id: 'name-picker', label: 'Name Picker', icon: '🎯' },
    { id: 'timer', label: 'Timer Tools', icon: '⏰' },
    { id: 'dice-roller', label: 'Dice Roller', icon: '🎲' },
    { id: 'classroom-designer', label: 'Room Designer', icon: '🏫' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">🛠️</span>
            Teachers Toolkit
            <span className="text-4xl ml-4 animate-bounce">⚙️</span>
          </h2>
          <p className="text-xl opacity-90">Professional classroom management tools with auto-save</p>
        </div>
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
          🎯
        </div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>
          📊
        </div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>
          👥
        </div>
      </div>

      {/* Curriculum Corner Notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">📖</span>
          <div>
            <h4 className="font-bold text-green-800 mb-2">📚 Looking for Subject Tools?</h4>
            <p className="text-green-700 mb-3">
              Math, Literacy, Geography, and Science tools have been organized in the{' '}
              <strong>Curriculum Corner</strong> tab for better subject-based teaching!
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">🧮 Math Tools</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">📝 Literacy Games</span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">🌍 Geography</span>
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">🔬 Science</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Save Status Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-2xl">💾</span>
          <div className="text-center">
            <p className="font-semibold text-blue-800">Auto-Save Enabled</p>
            <p className="text-sm text-blue-600">Your classroom jobs and timetables are automatically saved to the cloud!</p>
          </div>
          <span className="text-green-500 text-xl">✅</span>
        </div>
      </div>

      {/* Quick Action Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <button
          onClick={() => setActiveToolkitTab('classroom-jobs')}
          className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-center"
        >
          <div className="text-2xl mb-2">💼</div>
          <div className="font-semibold">Classroom Jobs</div>
          <div className="text-sm text-purple-600">Assign & pay students</div>
        </button>
        <button
          onClick={() => setActiveToolkitTab('timetable')}
          className="p-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-center"
        >
          <div className="text-2xl mb-2">📅</div>
          <div className="font-semibold">Timetable</div>
          <div className="text-sm text-indigo-600">Schedule & reminders</div>
        </button>
        <button
          onClick={() => setActiveToolkitTab('birthday-wall')}
          className="p-4 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors text-center"
        >
          <div className="text-2xl mb-2">🎂</div>
          <div className="font-semibold">Birthday Wall</div>
          <div className="text-sm text-pink-600">Celebrate & manage</div>
        </button>
        <button
          onClick={() => setActiveToolkitTab('analytics')}
          className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-semibold">Class Analytics</div>
          <div className="text-sm text-blue-600">{analytics.averageXP} avg XP</div>
        </button>
        <button
          onClick={() => setActiveToolkitTab('attendance')}
          className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
        >
          <div className="text-2xl mb-2">✅</div>
          <div className="font-semibold">Take Attendance</div>
          <div className="text-sm text-green-600">{attendanceStats.averageAttendance}% avg</div>
        </button>
      </div>

      {/* Main Toolkit Interface */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {toolkitTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveToolkitTab(tab.id)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeToolkitTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="min-h-[600px]">
          {activeToolkitTab === 'classroom-jobs' && (
            <ClassroomJobs 
              students={students} 
              showToast={showToast} 
              onAwardXP={onAwardXP}
              saveData={saveToolkitData}
              loadedData={toolkitData}
            />
          )}
          {activeToolkitTab === 'timetable' && (
            <TimetableCreator 
              students={students} 
              showToast={showToast}
              saveData={saveToolkitData}
              loadedData={toolkitData}
            />
          )}
          {activeToolkitTab === 'birthday-wall' && (
            <BirthdayWall
              students={students}
              showToast={showToast}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
              currentClassId={currentClassId}
              getAvatarImage={getAvatarImage}
              calculateAvatarLevel={calculateAvatarLevel}
            />
          )}
          {activeToolkitTab === 'help-queue' && <StudentHelpQueue students={students} showToast={showToast} />}
          {activeToolkitTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">✅ Daily Attendance</h3>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(student => (
                  <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))}
                        alt={`${student.firstName}'s Avatar`}
                        className="w-10 h-10 rounded-full border-2 border-gray-300"
                        onError={(e) => (e.target.src = '/avatars/Wizard F/Level 1.png')}
                      />
                      <div>
                        <div className="font-semibold">{student.firstName} {student.lastName}</div>
                        <div className="text-sm text-gray-500">{student.totalPoints || 0} XP</div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'present')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          attendanceState[new Date().toISOString().split('T')[0]]?.[student.id] === 'present'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        ✓ Present
                      </button>
                      <button
                        onClick={() => handleMarkAttendance(student.id, 'absent')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          attendanceState[new Date().toISOString().split('T')[0]]?.[student.id] === 'absent'
                            ? 'bg-red-500 text-white'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        ✗ Absent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeToolkitTab === 'analytics' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Class Analytics Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-800">Total Students</h4>
                    <span className="text-2xl">👥</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</div>
                  <div className="text-sm text-blue-600 mt-2">Active learners</div>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-800">Average XP</h4>
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">{analytics.averageXP}</div>
                  <div className="text-sm text-green-600 mt-2">Class performance</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-purple-800">High Performers</h4>
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">{analytics.highPerformers}</div>
                  <div className="text-sm text-purple-600 mt-2">200+ XP students</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-yellow-800">Need Support</h4>
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">{analytics.needsAttention}</div>
                  <div className="text-sm text-yellow-600 mt-2">Under 50 XP</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">📈 Student Performance Levels</h4>
                <div className="space-y-2">
                  {[
                    { range: '300+ XP', label: 'Level 4 Champions', color: 'bg-purple-500', count: students.filter(s => (s.totalPoints || 0) >= 300).length },
                    { range: '200-299 XP', label: 'Level 3 Achievers', color: 'bg-blue-500', count: students.filter(s => (s.totalPoints || 0) >= 200 && (s.totalPoints || 0) < 300).length },
                    { range: '100-199 XP', label: 'Level 2 Learners', color: 'bg-green-500', count: students.filter(s => (s.totalPoints || 0) >= 100 && (s.totalPoints || 0) < 200).length },
                    { range: '0-99 XP', label: 'Level 1 Beginners', color: 'bg-yellow-500', count: students.filter(s => (s.totalPoints || 0) < 100).length },
                  ].map(level => {
                    const percentage = students.length > 0 ? (level.count / students.length) * 100 : 0;
                    return (
                      <div key={level.range} className="flex items-center space-x-4">
                        <div className="w-32 text-sm font-medium text-gray-700">{level.range}:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div className={`${level.color} h-6 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                          <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                            {level.count} students ({percentage.toFixed(0)}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeToolkitTab === 'group-maker' && (
            <GroupMaker
              students={students}
              showToast={showToast}
              saveGroupDataToFirebase={saveGroupDataToFirebase}
              userData={userData}
              currentClassId={currentClassId}
            />
          )}
          {activeToolkitTab === 'name-picker' && <NamePicker students={students} showToast={showToast} />}
          {activeToolkitTab === 'timer' && (
            <TimerTools showToast={showToast} students={students} timerState={timerSettings} setTimerState={setTimerSettings} />
          )}
          {activeToolkitTab === 'dice-roller' && <DiceRoller showToast={showToast} />}
          {activeToolkitTab === 'classroom-designer' && (
            <ClassroomDesigner
              students={students}
              showToast={showToast}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
              currentClassId={currentClassId}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersToolkitTab;