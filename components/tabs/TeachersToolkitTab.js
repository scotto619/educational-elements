// components/tabs/TeachersToolkitTab.js - UPDATED WITH UNIFIED BUTTON INTERFACE AND MINIMAL NOTIFICATIONS
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
import BrainBreaks from '../tools/BrainBreaks';

// ===============================================
// AUTO-DISMISSING NOTIFICATION COMPONENT
// ===============================================
const AutoNotification = ({ message, type = 'success', duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg transition-opacity duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'info' ? 'bg-blue-500 text-white' :
      'bg-gray-500 text-white'
    }`}>
      {message}
    </div>
  );
};

// ===============================================
// BIRTHDAY WALL COMPONENT
// ===============================================
const BirthdayWall = ({ students, showNotification, saveClassroomDataToFirebase, currentClassId, getAvatarImage, calculateAvatarLevel }) => {
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
      showNotification('Please select a valid date', 'error');
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
    showNotification('Birthday updated successfully!', 'success');
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
// TEACHERS TOOLKIT TAB COMPONENT - UNIFIED INTERFACE
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
  onAwardCoins = () => {},
  onBulkAward = () => {},
  activeQuests = [],
  attendanceData = {},
  markAttendance,
  completeQuest,
  setShowQuestManagement,
  getAvatarImage,
  calculateAvatarLevel,
  saveToolkitData,
  loadedData,
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState(null);
  const [attendanceState, setAttendanceState] = useState(attendanceData);
  const [notifications, setNotifications] = useState([]);
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

  // Replace showToast with minimal auto-dismissing notifications
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
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
    // Silent update - no notification needed
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

  // If a tool is selected, show only that tool
  if (activeToolkitTab) {
    return (
      <div className="space-y-6">
        {/* Notifications */}
        {notifications.map(notification => (
          <AutoNotification 
            key={notification.id} 
            message={notification.message} 
            type={notification.type} 
          />
        ))}

        {/* Back Button */}
        <button
          onClick={() => setActiveToolkitTab(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          ← Back to Toolkit
        </button>

        {/* Tool Content */}
        <div className="bg-white rounded-xl shadow-lg p-6 min-h-[600px]">
          {activeToolkitTab === 'classroom-jobs' && (
            <ClassroomJobs 
              students={students} 
              showToast={showNotification} 
              onAwardXP={onAwardXP}
              onAwardCoins={onAwardCoins}
              saveData={saveToolkitData}
              loadedData={loadedData}
            />
          )}
          {activeToolkitTab === 'timetable' && (
            <TimetableCreator 
              students={students} 
              showToast={showNotification}
              saveData={saveToolkitData}
              loadedData={loadedData}
            />
          )}
          {activeToolkitTab === 'birthday-wall' && (
            <BirthdayWall
              students={students}
              showNotification={showNotification}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase} 
              currentClassId={currentClassId}
              getAvatarImage={getAvatarImage}
              calculateAvatarLevel={calculateAvatarLevel}
            />
          )}
          {activeToolkitTab === 'brain-breaks' && (
            <BrainBreaks 
              students={students} 
              showToast={showNotification} 
            />
          )}
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue 
              students={students} 
              showToast={showNotification} 
            />
          )}
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

              {/* Additional analytics sections remain the same... */}
            </div>
          )}
          {activeToolkitTab === 'group-maker' && (
            <GroupMaker 
              students={students} 
              showToast={showNotification}
              saveGroupDataToFirebase={saveGroupDataToFirebase}
              userData={userData}
              currentClassId={currentClassId}
            />
          )}
          {activeToolkitTab === 'name-picker' && (
            <NamePicker 
              students={students} 
              showToast={showNotification} 
            />
          )}
          {activeToolkitTab === 'timer' && (
            <TimerTools 
              showToast={showNotification}
              students={students}
              timerState={timerSettings}
              setTimerState={setTimerSettings}
            />
          )}
          {activeToolkitTab === 'dice-roller' && (
            <DiceRoller 
              showToast={showNotification}
            />
          )}
          {activeToolkitTab === 'classroom-designer' && (
            <ClassroomDesigner 
              students={students} 
              showToast={showNotification}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
              currentClassId={currentClassId}
            />
          )}
        </div>
      </div>
    );
  }

  // Main toolkit interface with all tools as big buttons
  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.map(notification => (
        <AutoNotification 
          key={notification.id} 
          message={notification.message} 
          type={notification.type} 
        />
      ))}

      {/* Header */}
      <div className="text-center bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">🛠️</span>
            Teachers Toolkit
            <span className="text-4xl ml-4 animate-bounce">⚙️</span>
          </h2>
          <p className="text-xl opacity-90">Professional classroom management tools</p>
        </div>
      </div>

      {/* All Tools as Big Colorful Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveToolkitTab('classroom-jobs')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">💼</div>
          <div className="text-lg font-bold mb-1">Classroom Jobs</div>
          <div className="text-sm opacity-90">Assign responsibilities & rewards</div>
        </button>
        
        <button
          onClick={() => setActiveToolkitTab('timetable')}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">📅</div>
          <div className="text-lg font-bold mb-1">Timetable</div>
          <div className="text-sm opacity-90">Schedule management</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('birthday-wall')}
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">🎂</div>
          <div className="text-lg font-bold mb-1">Birthday Wall</div>
          <div className="text-sm opacity-90">Track student birthdays</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('brain-breaks')}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">🧠</div>
          <div className="text-lg font-bold mb-1">Brain Breaks</div>
          <div className="text-sm opacity-90">Random activities</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('help-queue')}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">🎫</div>
          <div className="text-lg font-bold mb-1">Help Queue</div>
          <div className="text-sm opacity-90">Student help requests</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('attendance')}
          className="bg-gradient-to-r from-teal-500 to-green-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">✅</div>
          <div className="text-lg font-bold mb-1">Attendance</div>
          <div className="text-sm opacity-90">{attendanceStats.averageAttendance}% average</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('analytics')}
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">📊</div>
          <div className="text-lg font-bold mb-1">Analytics</div>
          <div className="text-sm opacity-90">{analytics.totalStudents} students</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('group-maker')}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">👥</div>
          <div className="text-lg font-bold mb-1">Group Maker</div>
          <div className="text-sm opacity-90">Create random teams</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('name-picker')}
          className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-lg font-bold mb-1">Name Picker</div>
          <div className="text-sm opacity-90">Random student selection</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('timer')}
          className="bg-gradient-to-r from-slate-500 to-gray-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">⏰</div>
          <div className="text-lg font-bold mb-1">Timer Tools</div>
          <div className="text-sm opacity-90">Countdown & stopwatch</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('dice-roller')}
          className="bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">🎲</div>
          <div className="text-lg font-bold mb-1">Dice Roller</div>
          <div className="text-sm opacity-90">Virtual dice for activities</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('classroom-designer')}
          className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">🏫</div>
          <div className="text-lg font-bold mb-1">Room Designer</div>
          <div className="text-sm opacity-90">Design classroom layout</div>
        </button>
      </div>
    </div>
  );
};

export default TeachersToolkitTab;