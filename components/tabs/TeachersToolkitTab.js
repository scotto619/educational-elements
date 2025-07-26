// components/tabs/TeachersToolkitTab.js - Professional Classroom Management Tools
import React, { useState } from 'react';

// ===============================================
// TEACHERS TOOLKIT TAB COMPONENT
// ===============================================

const TeachersToolkitTab = ({ 
  students = [],
  user,
  showToast = () => {},
  userData = {}
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('help-queue');
  const [attendanceData, setAttendanceData] = useState({});
  const [helpQueue, setHelpQueue] = useState([]);
  const [timerSettings, setTimerSettings] = useState({ minutes: 5, seconds: 0, isRunning: false });
  const [groupSettings, setGroupSettings] = useState({ groupSize: 4, method: 'random' });

  // Check if user has PRO access (simplified check)
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

  // Get today's attendance
  const getTodaysAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceData[today] || {};
  };

  // Mark attendance
  const markAttendance = (studentId, status) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceData(prev => ({
      ...prev,
      [today]: {
        ...prev[today],
        [studentId]: status
      }
    }));
    showToast(`Attendance marked for student`, 'success');
  };

  // Help Queue Functions
  const addToHelpQueue = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const queueItem = {
      id: `help_${Date.now()}`,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      timestamp: new Date().toISOString(),
      status: 'waiting'
    };
    
    setHelpQueue(prev => [...prev, queueItem]);
    showToast(`${student.firstName} added to help queue`, 'info');
  };

  const removeFromHelpQueue = (helpId) => {
    setHelpQueue(prev => prev.filter(item => item.id !== helpId));
    showToast('Student removed from help queue', 'success');
  };

  // Group Maker Functions
  const createRandomGroups = () => {
    if (students.length === 0) {
      showToast('No students available for grouping', 'error');
      return [];
    }

    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groups = [];
    
    for (let i = 0; i < shuffled.length; i += groupSettings.groupSize) {
      groups.push(shuffled.slice(i, i + groupSettings.groupSize));
    }
    
    return groups;
  };

  // Name Picker Functions
  const pickRandomStudent = () => {
    if (students.length === 0) {
      showToast('No students available', 'error');
      return null;
    }
    
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    showToast(`Selected: ${randomStudent.firstName} ${randomStudent.lastName}!`, 'success');
    return randomStudent;
  };

  // Timer Functions
  const startTimer = () => {
    setTimerSettings(prev => ({ ...prev, isRunning: true }));
    showToast('Timer started!', 'success');
  };

  const stopTimer = () => {
    setTimerSettings(prev => ({ ...prev, isRunning: false }));
    showToast('Timer stopped!', 'info');
  };

  const resetTimer = () => {
    setTimerSettings(prev => ({ ...prev, minutes: 5, seconds: 0, isRunning: false }));
    showToast('Timer reset!', 'info');
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
                <span>Smart Group Maker</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Random Name Picker</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span>Class Timer Tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>Attendance Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Class Analytics</span>
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
  const todaysAttendance = getTodaysAttendance();

  // Toolkit tabs
  const toolkitTabs = [
    { id: 'help-queue', label: 'Help Queue', icon: '🎫' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'group-maker', label: 'Group Maker', icon: '👥' },
    { id: 'name-picker', label: 'Name Picker', icon: '🎯' },
    { id: 'timer', label: 'Timer', icon: '⏰' }
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
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-2xl font-bold">{analytics.totalStudents}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Average XP</p>
              <p className="text-2xl font-bold">{analytics.averageXP}</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">High Performers</p>
              <p className="text-2xl font-bold">{analytics.highPerformers}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Help Queue</p>
              <p className="text-2xl font-bold">{helpQueue.length}</p>
            </div>
            <div className="text-3xl">🎫</div>
          </div>
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">🚀 Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveToolkitTab('help-queue')}
            className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎫</div>
            <div className="font-semibold">Help Queue</div>
            <div className="text-sm text-orange-600">{helpQueue.length} waiting</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('attendance')}
            className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold">Attendance</div>
            <div className="text-sm text-blue-600">Today: {Object.keys(todaysAttendance).length}/{students.length}</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('group-maker')}
            className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Make Groups</div>
            <div className="text-sm text-green-600">Size: {groupSettings.groupSize}</div>
          </button>
          
          <button
            onClick={pickRandomStudent}
            className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎯</div>
            <div className="font-semibold">Pick Name</div>
            <div className="text-sm text-purple-600">Random select</div>
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
          {/* Help Queue Tab */}
          {activeToolkitTab === 'help-queue' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">🎫 Student Help Queue</h3>
                <div className="text-sm text-gray-600">
                  {helpQueue.length} student(s) in queue
                </div>
              </div>

              {/* Add to Queue */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Add Student to Queue</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => addToHelpQueue(student.id)}
                      disabled={helpQueue.some(item => item.studentId === student.id)}
                      className={`p-2 rounded-lg text-sm transition-all ${
                        helpQueue.some(item => item.studentId === student.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {student.firstName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue Display */}
              <div className="space-y-3">
                {helpQueue.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <p>No students need help right now!</p>
                  </div>
                ) : (
                  helpQueue.map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.studentName}</p>
                          <p className="text-sm text-gray-600">
                            Waiting since {new Date(item.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromHelpQueue(item.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                      >
                        Helped ✓
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Attendance Tab */}
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
                  const status = todaysAttendance[student.id] || 'not-marked';
                  
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
                          onClick={() => markAttendance(student.id, 'present')}
                          className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                            status === 'present'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          ✓ Present
                        </button>
                        <button
                          onClick={() => markAttendance(student.id, 'absent')}
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
                      {Object.values(todaysAttendance).filter(s => s === 'present').length}
                    </div>
                    <div className="text-sm text-gray-600">Present</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {Object.values(todaysAttendance).filter(s => s === 'absent').length}
                    </div>
                    <div className="text-sm text-gray-600">Absent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {students.length - Object.keys(todaysAttendance).length}
                    </div>
                    <div className="text-sm text-gray-600">Not Marked</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
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

          {/* Group Maker Tab */}
          {activeToolkitTab === 'group-maker' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">👥 Group Maker</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Group Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                    <select
                      value={groupSettings.groupSize}
                      onChange={(e) => setGroupSettings(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2}>2 students</option>
                      <option value={3}>3 students</option>
                      <option value={4}>4 students</option>
                      <option value={5}>5 students</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Method</label>
                    <select
                      value={groupSettings.method}
                      onChange={(e) => setGroupSettings(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="random">Random</option>
                      <option value="balanced">Balanced by XP</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const groups = createRandomGroups();
                  showToast(`Created ${groups.length} groups!`, 'success');
                }}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                🎲 Create Random Groups
              </button>

              <div className="text-center text-gray-500">
                <p>Groups will be displayed here after creation</p>
                <p className="text-sm">Estimated {Math.ceil(students.length / groupSettings.groupSize)} groups</p>
              </div>
            </div>
          )}

          {/* Name Picker Tab */}
          {activeToolkitTab === 'name-picker' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Random Name Picker</h3>
                
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 mb-6">
                  <div className="text-6xl mb-4">🎲</div>
                  <button
                    onClick={pickRandomStudent}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all font-bold text-lg"
                  >
                    Pick a Student!
                  </button>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {students.map(student => (
                    <div
                      key={student.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg text-center hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => showToast(`Selected ${student.firstName}!`, 'success')}
                    >
                      <img 
                        src={`/avatars/${student.avatarBase || 'Wizard F'}/Level ${student.avatarLevel || 1}.png`}
                        alt={`${student.firstName}'s Avatar`}
                        className="w-12 h-12 rounded-full mx-auto mb-2"
                        onError={(e) => { e.target.src = '/avatars/Wizard F/Level 1.png'; }}
                      />
                      <p className="text-sm font-semibold">{student.firstName}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timer Tab */}
          {activeToolkitTab === 'timer' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⏰ Class Timer</h3>
                
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-8 mb-6">
                  <div className="text-6xl font-mono font-bold mb-4 text-gray-800">
                    {String(timerSettings.minutes).padStart(2, '0')}:{String(timerSettings.seconds).padStart(2, '0')}
                  </div>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => setTimerSettings(prev => ({ ...prev, minutes: Math.max(0, prev.minutes - 1) }))}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                    >
                      -1 Min
                    </button>
                    <button
                      onClick={() => setTimerSettings(prev => ({ ...prev, minutes: prev.minutes + 1 }))}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                    >
                      +1 Min
                    </button>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={startTimer}
                      disabled={timerSettings.isRunning}
                      className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ▶️ Start
                    </button>
                    <button
                      onClick={stopTimer}
                      disabled={!timerSettings.isRunning}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ⏸️ Stop
                    </button>
                    <button
                      onClick={resetTimer}
                      className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-all font-semibold"
                    >
                      🔄 Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 5, 10].map(minutes => (
                    <button
                      key={minutes}
                      onClick={() => setTimerSettings(prev => ({ ...prev, minutes, seconds: 0 }))}
                      className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all"
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersToolkitTab;