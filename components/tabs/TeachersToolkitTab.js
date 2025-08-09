// components/tabs/TeachersToolkitTab.js - FINAL FIXED with proper award functions
import React, { useState } from 'react';

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
// BIRTHDAY WALL COMPONENT (No changes needed here)
// ===============================================
const BirthdayWall = ({ students, showToast, saveClassroomDataToFirebase, currentClassId, getAvatarImage, calculateAvatarLevel }) => {
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [birthdayInput, setBirthdayInput] = useState('');
  const [assignBirthdayAvatar, setAssignBirthdayAvatar] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
  const oneWeekFromNowStr = oneWeekFromNow.toISOString().split('T')[0];

  const BIRTHDAY_AVATARS = [
    { name: 'Birthday Cake', path: '/shop/Themed/Birthday/BirthdayCake.png' },
    { name: 'Party Hat', path: '/shop/Themed/Birthday/PartyHat.png' },
    { name: 'Balloon Hero', path: '/shop/Themed/Birthday/BalloonHero.png' },
  ];

  const getUpcomingBirthdays = () => {
    return students
      .filter(student => student.birthday)
      .map(student => {
        const birthDate = new Date(student.birthday);
        const todayDate = new Date(today);
        birthDate.setFullYear(todayDate.getFullYear());
        const isToday = birthDate.toISOString().split('T')[0] === today;
        const isUpcoming = birthDate >= todayDate && birthDate <= new Date(oneWeekFromNowStr);
        return { ...student, isToday, isUpcoming };
      })
      .sort((a, b) => new Date(a.birthday) - new Date(b.birthday));
  };

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
    // Note: Birthday data is part of the main student object, so it uses a different save function. This is correct.
    saveClassroomDataToFirebase(updatedStudents, currentClassId);
    showToast('Birthday updated successfully!', 'success');
    setEditingStudentId(null);
    setBirthdayInput('');
    setAssignBirthdayAvatar(false);
  };
  
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
    </div>
  );
};

// ===============================================
// TEACHERS TOOLKIT TAB COMPONENT - FINAL FIXED
// ===============================================
const TeachersToolkitTab = ({
  students = [],
  user,
  showToast = () => {},
  userData = {},
  saveGroupDataToFirebase,
  saveClassroomDataToFirebase,
  currentClassId,
  // FIXED: Receive individual award functions from parent
  onAwardXP = () => {},
  onAwardCoins = () => {},
  onBulkAward = () => {},
  activeQuests = [],
  attendanceData = {},
  markAttendance,
  completeQuest,
  setShowQuestManagement,
  getAvatarImage,
  calculateAvatarLevel,
  // Toolkit save function and loaded data
  saveToolkitData, // This is the function to save toolkit-specific data
  loadedData, // This contains the loaded toolkit data
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('classroom-jobs');
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
      return { totalQuests: 0, totalCompletions: 0, completionRate: 0, };
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
    return { averageAttendance, totalDaysTracked: dates.length, perfectAttendanceStudents, attendanceTrend: 'stable', };
  };

  const handleMarkAttendance = (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    const newAttendanceState = { ...attendanceState, [today]: { ...attendanceState[today], [studentId]: status, }, };
    setAttendanceState(newAttendanceState);
    if (markAttendance) {
      markAttendance(studentId, status);
    }
    showToast(`Attendance marked for student`, 'success');
  };

  if (!isPro) {
    return (
      <div className="text-center bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-xl p-8">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Teachers Toolkit - Pro Feature</h2>
        <p className="text-gray-600 mb-6">Unlock powerful classroom management tools with a Pro subscription!</p>
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
          Upgrade to Pro
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
      </div>

      {/* Auto-save notice */}
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
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-3xl mb-2">💼</div>
          <div className="font-semibold">Classroom Jobs</div>
          <div className="text-sm opacity-90">Assign responsibilities</div>
        </button>
        
        <button
          onClick={() => setActiveToolkitTab('timetable')}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-3xl mb-2">📅</div>
          <div className="font-semibold">Timetable</div>
          <div className="text-sm opacity-90">Schedule management</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('attendance')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-3xl mb-2">✅</div>
          <div className="font-semibold">Attendance</div>
          <div className="text-sm opacity-90">{attendanceStats.averageAttendance}% avg</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('analytics')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="font-semibold">Analytics</div>
          <div className="text-sm opacity-90">{analytics.totalStudents} students</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('group-maker')}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-3xl mb-2">👥</div>
          <div className="font-semibold">Group Maker</div>
          <div className="text-sm opacity-90">Create teams</div>
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
              onAwardCoins={onAwardCoins}
              // Pass the correct save function and loaded data
              saveData={saveToolkitData}
              loadedData={loadedData}
            />
          )}
          {activeToolkitTab === 'timetable' && (
            <TimetableCreator 
              students={students} 
              showToast={showToast}
              // Pass the correct save function and loaded data
              saveData={saveToolkitData}
              loadedData={loadedData}
            />
          )}
          {activeToolkitTab === 'birthday-wall' && (
            <BirthdayWall
              students={students}
              showToast={showToast}
              // This uses a different save mechanism because it modifies the core student objects, which is correct.
              saveClassroomDataToFirebase={saveClassroomDataToFirebase} 
              currentClassId={currentClassId}
              getAvatarImage={getAvatarImage}
              calculateAvatarLevel={calculateAvatarLevel}
            />
          )}

          {/* Help Queue */}
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue 
              students={students} 
              showToast={showToast} 
            />
          )}

          {/* Attendance */}
          {activeToolkitTab === 'attendance' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">✅</span>
                Attendance Tracker
              </h3>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                <h4 className="font-bold text-lg text-green-800 mb-4">Today's Attendance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {students.map(student => {
                    const today = new Date().toISOString().split('T')[0];
                    const todayStatus = attendanceState[today]?.[student.id];
                    
                    return (
                      <div key={student.id} className="bg-white rounded-lg p-4 shadow-md">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))}
                            alt={`${student.firstName}'s Avatar`}
                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                          />
                          <div>
                            <div className="font-semibold">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-gray-500">
                              Status: <span className={`font-semibold ${
                                todayStatus === 'present' ? 'text-green-600' :
                                todayStatus === 'absent' ? 'text-red-600' :
                                todayStatus === 'late' ? 'text-yellow-600' : 'text-gray-500'
                              }`}>
                                {todayStatus || 'Not marked'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'present')}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                              todayStatus === 'present' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'late')}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                              todayStatus === 'late' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(student.id, 'absent')}
                            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all ${
                              todayStatus === 'absent' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeToolkitTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📊</span>
                Class Analytics
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold text-blue-800">{analytics.totalStudents}</p>
                    </div>
                    <div className="text-4xl">👥</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Average XP</p>
                      <p className="text-3xl font-bold text-green-800">{analytics.averageXP}</p>
                    </div>
                    <div className="text-4xl">⭐</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-xl p-6 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">High Performers</p>
                      <p className="text-3xl font-bold text-purple-800">{analytics.highPerformers}</p>
                    </div>
                    <div className="text-4xl">🏆</div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Needs Support</p>
                      <p className="text-3xl font-bold text-orange-800">{analytics.needsAttention}</p>
                    </div>
                    <div className="text-4xl">📈</div>
                  </div>
                </div>
              </div>

              {/* Attendance Analytics */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-4">📊 Attendance Overview</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{attendanceStats.averageAttendance}%</div>
                    <div className="text-sm text-gray-600">Average Attendance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{attendanceStats.totalDaysTracked}</div>
                    <div className="text-sm text-gray-600">Days Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{attendanceStats.perfectAttendanceStudents}</div>
                    <div className="text-sm text-gray-600">Perfect Attendance</div>
                  </div>
                </div>
              </div>

              {/* Quest Analytics */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-4">🎯 Quest Progress</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{questAnalytics.totalQuests}</div>
                    <div className="text-sm text-gray-600">Active Quests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{questAnalytics.totalCompletions}</div>
                    <div className="text-sm text-gray-600">Total Completions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600">{questAnalytics.completionRate}%</div>
                    <div className="text-sm text-gray-600">Completion Rate</div>
                  </div>
                </div>
              </div>

              {/* XP Distribution */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-xl font-bold text-gray-800 mb-4">📈 XP Distribution</h4>
                <div className="space-y-3">
                  {[
                    { range: '300+ XP', color: 'bg-purple-500', count: students.filter(s => (s.totalPoints || 0) >= 300).length },
                    { range: '200-299 XP', color: 'bg-blue-500', count: students.filter(s => (s.totalPoints || 0) >= 200 && (s.totalPoints || 0) < 300).length },
                    { range: '100-199 XP', color: 'bg-green-500', count: students.filter(s => (s.totalPoints || 0) >= 100 && (s.totalPoints || 0) < 200).length },
                    { range: '50-99 XP', color: 'bg-yellow-500', count: students.filter(s => (s.totalPoints || 0) >= 50 && (s.totalPoints || 0) < 100).length },
                    { range: '0-49 XP', color: 'bg-red-500', count: students.filter(s => (s.totalPoints || 0) < 50).length },
                  ].map(({ range, color, count }) => {
                    const percentage = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                    return (
                      <div key={range} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium text-gray-700">{range}:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                          <div 
                            className={`${color} h-4 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-semibold">{percentage}%</span>
                          <span className="text-sm font-bold">{count} students</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Group Maker */}
          {activeToolkitTab === 'group-maker' && (
            <GroupMaker 
              students={students} 
              showToast={showToast}
              saveGroupDataToFirebase={saveGroupDataToFirebase}
              userData={userData}
              currentClassId={currentClassId}
            />
          )}

          {/* Name Picker */}
          {activeToolkitTab === 'name-picker' && (
            <NamePicker 
              students={students} 
              showToast={showToast} 
            />
          )}

          {/* Timer Tools */}
          {activeToolkitTab === 'timer' && (
            <TimerTools 
              showToast={showToast}
              students={students}
              timerState={timerSettings}
              setTimerState={setTimerSettings}
            />
          )}

          {/* Dice Roller */}
          {activeToolkitTab === 'dice-roller' && (
            <DiceRoller 
              showToast={showToast}
            />
          )}

          {/* Classroom Designer */}
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