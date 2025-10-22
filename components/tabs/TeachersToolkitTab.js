// components/tabs/TeachersToolkitTab.js - UPDATED WITH SPECIALIST TIMETABLE
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
import SpecialistTimetable from '../tools/SpecialistCreator';

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={assignBirthdayAvatar}
                      onChange={(e) => setAssignBirthdayAvatar(e.target.checked)}
                      className="rounded text-pink-600"
                    />
                    <span className="text-sm text-gray-700">Assign Birthday Avatar</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSetBirthday(student.id)}
                      className="flex-1 bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 transition text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingStudentId(null);
                        setBirthdayInput('');
                        setAssignBirthdayAvatar(false);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-400 transition text-sm"
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
                  className="w-full bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition text-sm"
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
// MAIN TOOLKIT COMPONENT
// ===============================================
const TeachersToolkitTab = ({ 
  students, 
  currentClassId, 
  saveClassroomDataToFirebase, 
  getAvatarImage, 
  calculateAvatarLevel,
  attendanceStats,
  analytics
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [timerSettings, setTimerSettings] = useState({ type: 'countdown', duration: 300 });

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // If a specific tool is active, render only that tool with a back button
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
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg font-semibold"
        >
          ← Back to Toolkit
        </button>

        {/* Active Tool Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
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
              showToast={showNotification}
            />
          )}
          {activeToolkitTab === 'specialist-timetable' && (
            <SpecialistTimetable />
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
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue 
              students={students} 
              showToast={showNotification}
            />
          )}
          {activeToolkitTab === 'attendance' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Attendance Tracking</h2>
              <div className="bg-gradient-to-r from-teal-50 to-green-50 rounded-xl p-6 border-2 border-teal-200">
                <p className="text-gray-600 text-lg">Attendance tracking feature coming soon!</p>
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  <p className="font-semibold text-gray-800">Current Stats:</p>
                  <p className="text-gray-600 mt-2">Average Attendance: {attendanceStats?.averageAttendance || 0}%</p>
                </div>
              </div>
            </div>
          )}
          {activeToolkitTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border-2 border-violet-200">
                <p className="text-gray-600 text-lg">Advanced analytics coming soon!</p>
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                  <p className="font-semibold text-gray-800">Current Stats:</p>
                  <p className="text-gray-600 mt-2">Total Students: {analytics?.totalStudents || students.length}</p>
                </div>
              </div>
            </div>
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
          <div className="text-4xl mb-3">🎨</div>
          <div className="text-lg font-bold mb-1">Specialist Timetable</div>
          <div className="text-sm opacity-90">Automated specialist scheduling</div>
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
          <div className="text-sm opacity-90">{attendanceStats?.averageAttendance || 0}% average</div>
        </button>

        <button
          onClick={() => setActiveToolkitTab('analytics')}
          className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-6 rounded-xl hover:shadow-lg transition-all text-center"
        >
          <div className="text-4xl mb-3">📊</div>
          <div className="text-lg font-bold mb-1">Analytics</div>
          <div className="text-sm opacity-90">{analytics?.totalStudents || students.length} students</div>
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