// components/tabs/TeachersToolkitTab.js - UPDATED WITH SPECIALIST TIMETABLE CREATOR
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
import VisualChecklist from '../tools/VisualChecklist';
import SpecialistCreator from '../tools/SpecialistCreator'; // UPDATED IMPORT

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
      <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <span className="text-4xl mr-3">🎂</span>
          Birthday Wall
        </h2>
        <p className="text-white opacity-90 mt-2">Track and celebrate student birthdays</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map(student => {
          const birthData = upcomingBirthdays.find(s => s.id === student.id);
          return (
            <div
              key={student.id}
              className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all ${
                birthData?.isToday ? 'border-4 border-pink-500 bg-gradient-to-br from-pink-50 to-red-50' :
                birthData?.isUpcoming ? 'border-2 border-yellow-400 bg-yellow-50' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <img
                  src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints)) || '/avatars/Wizard F/Level 1.png'}
                  alt={`${student.firstName}'s avatar`}
                  className="w-16 h-16 rounded-full border-2 border-gray-300"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800">
                    {student.firstName} {student.lastName}
                  </h3>
                  {student.birthday ? (
                    <p className="text-sm text-gray-600">
                      🎂 {new Date(student.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No birthday set</p>
                  )}
                </div>
                {birthData?.isToday && (
                  <div className="text-4xl animate-bounce">🎉</div>
                )}
              </div>

              {editingStudentId === student.id ? (
                <div className="mt-4 space-y-3">
                  <input
                    type="date"
                    value={birthdayInput}
                    onChange={(e) => setBirthdayInput(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assignBirthdayAvatar}
                      onChange={(e) => setAssignBirthdayAvatar(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Assign birthday avatar</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetBirthday(student.id)}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudentId(null);
                        setBirthdayInput('');
                        setAssignBirthdayAvatar(false);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
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
                  }}
                  className="mt-4 w-full bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                >
                  {student.birthday ? 'Edit Birthday' : 'Set Birthday'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===============================================
// ATTENDANCE TRACKER COMPONENT
// ===============================================
const AttendanceTracker = ({ students, showNotification }) => {
  const [attendance, setAttendance] = useState({});
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedAttendance = localStorage.getItem('attendance');
    if (savedAttendance) {
      setAttendance(JSON.parse(savedAttendance));
    }
  }, []);

  const markAttendance = (studentId, status) => {
    const newAttendance = {
      ...attendance,
      [today]: {
        ...(attendance[today] || {}),
        [studentId]: status,
      },
    };
    setAttendance(newAttendance);
    localStorage.setItem('attendance', JSON.stringify(newAttendance));
    showNotification(`Marked ${status} for student`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <span className="text-4xl mr-3">✅</span>
          Attendance Tracker
        </h2>
        <p className="text-white opacity-90 mt-2">Track daily student attendance</p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-xl mb-4">Today: {new Date(today).toLocaleDateString()}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map(student => {
            const status = attendance[today]?.[student.id] || 'unmarked';
            return (
              <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">{student.firstName} {student.lastName}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => markAttendance(student.id, 'present')}
                    className={`px-3 py-1 rounded ${status === 'present' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'absent')}
                    className={`px-3 py-1 rounded ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                  >
                    ✕
                  </button>
                  <button
                    onClick={() => markAttendance(student.id, 'late')}
                    className={`px-3 py-1 rounded ${status === 'late' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                  >
                    ⏰
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// ANALYTICS COMPONENT
// ===============================================
const AnalyticsComponent = ({ students }) => {
  const analytics = {
    totalStudents: students.length,
    averageXP: Math.round(students.reduce((acc, s) => acc + (s.totalPoints || 0), 0) / students.length) || 0,
    averageCoins: Math.round(students.reduce((acc, s) => acc + (s.currency || 0), 0) / students.length) || 0,
    topPerformers: students
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 5)
      .map(s => ({
        ...s,
        avatarUrl: `/avatars/${s.avatarBase}/Level ${Math.min(4, Math.floor((s.totalPoints || 0) / 100) + 1)}.png`,
      })),
    needsAttention: students.filter(s => (s.totalPoints || 0) < 50).length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <span className="text-4xl mr-3">📊</span>
          Class Analytics
        </h2>
        <p className="text-white opacity-90 mt-2">Performance insights and statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        <div className="bg-purple-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{analytics.averageXP}</div>
          <div className="text-sm text-gray-600">Average XP</div>
        </div>
        <div className="bg-green-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{analytics.averageCoins}</div>
          <div className="text-sm text-gray-600">Average Coins</div>
        </div>
        <div className="bg-orange-100 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">{analytics.needsAttention}</div>
          <div className="text-sm text-gray-600">Need Support</div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="font-bold text-lg text-gray-800 mb-4">🏆 Top 5 Performers</h4>
        <div className="space-y-3">
          {analytics.topPerformers.map((student, index) => (
            <div
              key={student.id}
              className="flex items-center space-x-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4"
            >
              <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
              <img
                src={student.avatarUrl || '/avatars/Wizard F/Level 1.png'}
                alt={`${student.firstName}'s Avatar`}
                className="w-12 h-12 rounded-full border-2 border-gray-300"
                onError={(e) => (e.target.src = '/avatars/Wizard F/Level 1.png')}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  {student.totalPoints || 0} XP • {student.currency || 0} Coins
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// MAIN TEACHERS TOOLKIT COMPONENT
// ===============================================
const TeachersToolkitTab = ({ 
  students, 
  saveClassroomDataToFirebase,
  saveToolkitData, // NEW: For saving toolkit data to Firebase
  loadedData = {}, // NEW: For loading toolkit data from Firebase
  currentClassId,
  getAvatarImage,
  calculateAvatarLevel
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ averageAttendance: 95 });
  const [analytics, setAnalytics] = useState({ totalStudents: students.length });
  const [timerSettings, setTimerSettings] = useState({
    isRunning: false,
    timeLeft: 0,
    mode: 'countdown'
  });

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // If a specific tool is active, render it
  if (activeToolkitTab) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setActiveToolkitTab(null)}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all font-semibold flex items-center gap-2"
        >
          ← Back to Toolkit
        </button>

        {/* Render the selected tool */}
        <div>
          {activeToolkitTab === 'classroom-jobs' && (
            <ClassroomJobs
              students={students}
              showToast={showNotification}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
              currentClassId={currentClassId}
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
          {activeToolkitTab === 'specialist-timetable' && (
            <SpecialistCreator
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
          {activeToolkitTab === 'visual-checklist' && (
            <VisualChecklist 
              showToast={showNotification}
            />
          )}
          {activeToolkitTab === 'brain-breaks' && (
            <BrainBreaks
              showToast={showNotification}
            />
          )}
          {activeToolkitTab === 'attendance' && (
            <AttendanceTracker
              students={students}
              showNotification={showNotification}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
              currentClassId={currentClassId}
            />
          )}
          {activeToolkitTab === 'analytics' && (
            <AnalyticsComponent
              students={students}
            />
          )}
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue 
              students={students} 
              showToast={showNotification}
            />
          )}
          {activeToolkitTab === 'group-maker' && (
            <GroupMaker 
              students={students} 
              showToast={showNotification}
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
          onClick={() => setActiveToolkitTab('specialist-timetable')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">👨‍🏫</div>
          <div className="text-lg font-bold mb-1">Specialist Timetable</div>
          <div className="text-sm opacity-90">Create specialist schedules</div>
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
          onClick={() => setActiveToolkitTab('visual-checklist')}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">📋</div>
          <div className="text-lg font-bold mb-1">Visual Checklist</div>
          <div className="text-sm opacity-90">Interactive routine displays</div>
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