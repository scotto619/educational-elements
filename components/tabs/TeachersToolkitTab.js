// components/tabs/TeachersToolkitTab.js - Professional Classroom Management Tools with Separate Components
import React, { useState } from 'react';

// Import tool components from the tools folder
import StudentHelpQueue from '../tools/StudentHelpQueue';
import GroupMaker from '../tools/GroupMaker';
import NamePicker from '../tools/NamePicker';
import TimerTools from '../tools/TimerTools';
import ClassroomDesigner from '../tools/ClassroomDesigner';
import DiceRoller from '../tools/DiceRoller';

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
  // Quest System Props (if available)
  activeQuests = [],
  attendanceData = {},
  markAttendance,
  completeQuest,
  setShowQuestManagement
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('help-queue');
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
                <span>📅</span>
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

  // Updated toolkit tabs to include all tools
  const toolkitTabs = [
    { id: 'help-queue', label: 'Help Queue', icon: '🎫' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-green-700 text-sm">
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span>Literacy Tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔢</span>
                <span>Math Activities</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🌍</span>
                <span>Geography Explorer</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔬</span>
                <span>Science Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Quests</p>
              <p className="text-2xl font-bold">{questAnalytics.totalQuests}</p>
            </div>
            <div className="text-3xl">⚔️</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Quest Completion</p>
              <p className="text-2xl font-bold">{questAnalytics.completionRate}%</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Attendance Rate</p>
              <p className="text-2xl font-bold">{attendanceStats.averageAttendance}%</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Average XP</p>
              <p className="text-2xl font-bold">{analytics.averageXP}</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🚀 Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowQuestManagement && setShowQuestManagement(true)}
            className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">⚔️</div>
            <div className="font-semibold">Manage Quests</div>
            <div className="text-sm text-purple-600">{questAnalytics.totalQuests} active</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('attendance')}
            className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold">Take Attendance</div>
            <div className="text-sm text-blue-600">{attendanceStats.averageAttendance}% avg</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('help-queue')}
            className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎫</div>
            <div className="font-semibold">Help Queue</div>
            <div className="text-sm text-orange-600">Manage assistance</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('timer')}
            className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">⏰</div>
            <div className="font-semibold">Epic Timer</div>
            <div className="text-sm text-green-600">With animations</div>
          </button>
        </div>
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
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {/* Student Help Queue */}
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue 
              students={students} 
              showToast={showToast} 
            />
          )}

          {/* Attendance Tracker */}
          {activeToolkitTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">📅 Daily Attendance</h3>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map(student => {
                  const today = new Date().toISOString().split('T')[0];
                  const status = attendanceState[today]?.[student.id] || 'not-marked';
                  
                  return (
                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={`/avatars/${student.avatarBase || 'Wizard F'}/Level ${student.avatarLevel || 1}.png`}
                          alt={`${student.firstName}'s Avatar`}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => { e.target.src = '/avatars/Wizard F/Level 1.png'; }}
                        />
                        <div>
                          <p className="font-semibold">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-gray-500">Level {student.avatarLevel || 1}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMarkAttendance(student.id, 'present')}
                          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                            status === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(student.id, 'absent')}
                          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                            status === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          ✗ Absent
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Today's Summary</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(attendanceState[new Date().toISOString().split('T')[0]] || {}).filter(s => s === 'present').length}
                    </div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(attendanceState[new Date().toISOString().split('T')[0]] || {}).filter(s => s === 'absent').length}
                    </div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {students.length - Object.keys(attendanceState[new Date().toISOString().split('T')[0]] || {}).length}
                    </div>
                    <div className="text-sm text-gray-600">Not Marked</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeToolkitTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800">📊 Class Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-4">📈 Performance Overview</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Students:</span>
                      <span className="font-bold">{analytics.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average XP:</span>
                      <span className="font-bold">{analytics.averageXP}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">High Performers:</span>
                      <span className="font-bold text-green-600">{analytics.highPerformers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Needs Support:</span>
                      <span className="font-bold text-orange-600">{analytics.needsAttention}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-4">🏆 Top Performers</h4>
                  <div className="space-y-2">
                    {[...students]
                      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
                      .slice(0, 5)
                      .map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                            <span className="text-sm">{student.firstName}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">{student.totalPoints || 0} XP</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-4">📊 Level Distribution</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(level => {
                      const count = students.filter(s => {
                        const xp = s.totalPoints || 0;
                        if (level === 1) return xp < 100;
                        if (level === 2) return xp >= 100 && xp < 200;
                        if (level === 3) return xp >= 200 && xp < 300;
                        return xp >= 300;
                      }).length;
                      
                      return (
                        <div key={level} className="flex items-center justify-between">
                          <span className="text-sm">Level {level}:</span>
                          <span className="text-sm font-bold">{count} students</span>
                        </div>
                      );
                    })}
                  </div>
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