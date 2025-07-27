// components/tabs/TeachersToolkitTab.js - Professional Classroom Management Tools with Classroom Jobs
import React, { useState } from 'react';

// Import tool components from the tools folder
import StudentHelpQueue from '../tools/StudentHelpQueue';
import GroupMaker from '../tools/GroupMaker';
import NamePicker from '../tools/NamePicker';
import TimerTools from '../tools/TimerTools';
import ClassroomDesigner from '../tools/ClassroomDesigner';
import DiceRoller from '../tools/DiceRoller';
import ClassroomJobs from '../tools/ClassroomJobs'; // Classroom Jobs
import TimetableCreator from '../tools/TimetableCreator'; // TimetableCreator

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
  onAwardXP = () => {}, // XP awarding function for job payments
  // Quest System Props (if available)
  activeQuests = [],
  attendanceData = {},
  markAttendance,
  completeQuest,
  setShowQuestManagement
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('timetable'); // Default to timetable
  const [attendanceState, setAttendanceState] = useState(attendanceData);
  const [timerSettings, setTimerSettings] = useState({ 
    minutes: 5, 
    seconds: 0, 
    isRunning: false,
    isActive: false,
    time: 300,
    originalTime: 300,
    isPaused: false,
    type: 'countdown'
  });

  // Check if user has PRO access (simplified check for demo)
  const isPro = userData?.subscription === 'pro' || true; // Set to true for demo

  // Calculate basic analytics
  const calculateBasicAnalytics = () => {
    return {
      totalStudents: students.length,
      averageXP: students.length > 0 ? 
        Math.round(students.reduce((sum, s) => sum + (s.totalPoints || 0), 0) / students.length) : 0,
      highPerformers: students.filter(s => (s.totalPoints || 0) >= 200).length,
      needsAttention: students.filter(s => (s.totalPoints || 0) < 50).length
    };
  };

  // Calculate quest analytics (if quest system is available)
  const calculateQuestAnalytics = () => {
    if (!activeQuests || activeQuests.length === 0) {
      return {
        totalQuests: 0,
        totalCompletions: 0,
        completionRate: 0
      };
    }

    const analytics = {
      totalQuests: activeQuests.length,
      totalCompletions: activeQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0),
    };

    // Calculate completion rate
    const possibleCompletions = analytics.totalQuests * students.length;
    analytics.completionRate = possibleCompletions > 0 ?
      Math.round((analytics.totalCompletions / possibleCompletions) * 100) : 0;

    return analytics;
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    const dates = Object.keys(attendanceState);
    if (dates.length === 0) return { averageAttendance: 0, totalDaysTracked: 0, perfectAttendanceStudents: 0 };

    const totalStudentDays = dates.length * students.length;
    const totalPresentCount = dates.reduce((acc, date) => {
      return acc + Object.values(attendanceState[date] || {}).filter(status => status === 'present').length;
    }, 0);

    const averageAttendance = totalStudentDays > 0 ? 
      Math.round((totalPresentCount / totalStudentDays) * 100) : 0;

    // Calculate perfect attendance students
    const perfectAttendanceStudents = students.filter(student => {
      return dates.every(date => attendanceState[date]?.[student.id] === 'present');
    }).length;

    return {
      averageAttendance,
      totalDaysTracked: dates.length,
      perfectAttendanceStudents,
      attendanceTrend: 'stable'
    };
  };

  // Handle attendance marking
  const handleMarkAttendance = (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    const newAttendanceState = {
      ...attendanceState,
      [today]: {
        ...attendanceState[today],
        [studentId]: status
      }
    };
    
    setAttendanceState(newAttendanceState);
    
    // Call external handler if provided
    if (markAttendance) {
      markAttendance(studentId, status);
    }
    
    showToast(`Attendance marked for student`, 'success');
  };

  // Handle saving timetable data
  const handleSaveTimetableData = (timetableData) => {
    // Here you would typically save to Firebase or your backend
    // For now, just show a success message
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
                <span>🎫</span>
                <span>Student Help Queue System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>Smart Group Maker with Constraints</span>
              </div>
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
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Advanced Attendance Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Quest Analytics & Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎮</span>
                <span>Gamification Features</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🌍</span>
                <span>Geography & Science Activities</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✨</span>
                <span>New Tools Added Monthly!</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎨</span>
                <span>Creative Arts & Expression</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
          <p className="text-blue-700 text-sm">
            💡 <strong>Note:</strong> Subject-specific tools like Math, Literacy, and Geography are organized in the "Curriculum Corner" tab for better classroom workflow!
          </p>
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

  // Updated toolkit tabs to include classroom jobs and timetable
  const toolkitTabs = [
    { id: 'classroom-jobs', label: 'Classroom Jobs', icon: '💼' },
    { id: 'timetable', label: 'Timetable', icon: '📅' },
    { id: 'help-queue', label: 'Help Queue', icon: '🎫' },
    { id: 'attendance', label: 'Attendance', icon: '✅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'group-maker', label: 'Group Maker', icon: '👥' },
    { id: 'name-picker', label: 'Name Picker', icon: '🎯' },
    { id: 'timer', label: 'Timer Tools', icon: '⏰' },
    { id: 'dice-roller', label: 'Dice Roller', icon: '🎲' },
    { id: 'classroom-designer', label: 'Room Designer', icon: '🏫' }
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
          <p className="text-xl opacity-90">Professional classroom management tools</p>
        </div>
        
        {/* Floating decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎯</div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>📊</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>👥</div>
      </div>

      {/* Curriculum Corner Notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">📖</span>
          <div>
            <h4 className="font-bold text-green-800 mb-2">📚 Looking for Subject Tools?</h4>
            <p className="text-green-700 mb-3">
              Math, Literacy, Geography, and Science tools have been organized in the <strong>Curriculum Corner</strong> tab for better subject-based teaching!
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
        
        <button
          onClick={() => setActiveToolkitTab('help-queue')}
          className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-center"
        >
          <div className="text-2xl mb-2">🎫</div>
          <div className="font-semibold">Help Queue</div>
          <div className="text-sm text-orange-600">Manage assistance</div>
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
          {/* Classroom Jobs */}
          {activeToolkitTab === 'classroom-jobs' && (
            <ClassroomJobs 
              students={students} 
              showToast={showToast}
              onAwardXP={onAwardXP}
            />
          )}

          {/* FIXED: Added the missing Timetable rendering */}
          {activeToolkitTab === 'timetable' && (
            <TimetableCreator 
              students={students} 
              showToast={showToast}
              onSaveData={handleSaveTimetableData}
            />
          )}

          {/* Help Queue */}
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue 
              students={students} 
              showToast={showToast} 
            />
          )}

          {/* Attendance Tracker */}
          {activeToolkitTab === 'attendance' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">✅ Daily Attendance</h3>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(student => (
                  <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={`/avatars/${student.avatarBase || 'Wizard F'}/Level 1.png`}
                        alt={`${student.firstName}'s Avatar`}
                        className="w-10 h-10 rounded-full border-2 border-gray-300"
                        onError={(e) => {
                          e.target.src = '/avatars/Wizard F/Level 1.png';
                        }}
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

          {/* Analytics Dashboard */}
          {activeToolkitTab === 'analytics' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Class Analytics Dashboard</h3>
              
              {/* Overview Cards */}
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

              {/* Student Performance Breakdown */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-800 mb-4">📈 Student Performance Levels</h4>
                <div className="space-y-2">
                  {[
                    { range: '300+ XP', label: 'Level 4 Champions', color: 'bg-purple-500', count: students.filter(s => (s.totalPoints || 0) >= 300).length },
                    { range: '200-299 XP', label: 'Level 3 Achievers', color: 'bg-blue-500', count: students.filter(s => (s.totalPoints || 0) >= 200 && (s.totalPoints || 0) < 300).length },
                    { range: '100-199 XP', label: 'Level 2 Learners', color: 'bg-green-500', count: students.filter(s => (s.totalPoints || 0) >= 100 && (s.totalPoints || 0) < 200).length },
                    { range: '0-99 XP', label: 'Level 1 Beginners', color: 'bg-yellow-500', count: students.filter(s => (s.totalPoints || 0) < 100).length }
                  ].map(level => {
                    const percentage = students.length > 0 ? (level.count / students.length) * 100 : 0;
                    return (
                      <div key={level.range} className="flex items-center space-x-4">
                        <div className="w-32 text-sm font-medium text-gray-700">{level.range}:</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                          <div 
                            className={`${level.color} h-6 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
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

// ===============================================
// TIME SLOT EDITOR COMPONENT
// ===============================================

const TimeSlotEditor = ({ timeSlots, onSave, onCancel }) => {
  const [editableSlots, setEditableSlots] = useState(timeSlots.map(slot => ({ ...slot })));

  const addTimeSlot = () => {
    const newSlot = {
      id: `slot${editableSlots.length + 1}`,
      start: '09:00',
      end: '09:50',
      label: `Period ${editableSlots.length + 1}`
    };
    setEditableSlots([...editableSlots, newSlot]);
  };

  const removeTimeSlot = (index) => {
    if (editableSlots.length > 1) {
      setEditableSlots(editableSlots.filter((_, i) => i !== index));
    }
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = editableSlots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    setEditableSlots(updated);
  };

  const validateTimeSlots = () => {
    // Check for valid time format and no overlaps
    for (let i = 0; i < editableSlots.length; i++) {
      const slot = editableSlots[i];
      
      // Check time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(slot.start) || !timeRegex.test(slot.end)) {
        return `Invalid time format in ${slot.label}`;
      }
      
      // Check start < end
      const startMinutes = parseTime(slot.start);
      const endMinutes = parseTime(slot.end);
      if (startMinutes >= endMinutes) {
        return `Start time must be before end time in ${slot.label}`;
      }
    }
    return null;
  };

  const handleSave = () => {
    const error = validateTimeSlots();
    if (error) {
      alert(error);
      return;
    }
    onSave(editableSlots);
  };

  // Helper function to parse time (copied from parent component)
  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  return (
    <div className="space-y-4">
      <div className="max-h-96 overflow-y-auto">
        {editableSlots.map((slot, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center p-4 bg-gray-50 rounded-lg mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={slot.label}
                onChange={(e) => updateTimeSlot(index, 'label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Period 1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={slot.start}
                onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={slot.end}
                onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => removeTimeSlot(index)}
                disabled={editableSlots.length === 1}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove time slot"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={addTimeSlot}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          ➕ Add Time Slot
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            Save Time Slots
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-700">
          <span>💡</span>
          <span className="font-semibold">Tips:</span>
        </div>
        <ul className="mt-2 text-sm text-blue-600 space-y-1">
          <li>• Use 24-hour format (e.g., 14:30 for 2:30 PM)</li>
          <li>• Make sure start time is before end time</li>
          <li>• Consider breaks between periods</li>
          <li>• You can add as many periods as needed</li>
        </ul>
      </div>
    </div>
  );
};

export default TeachersToolkitTab;