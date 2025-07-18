// DashboardTab.js - Completely Revamped Modern Dashboard
import React, { useState, useEffect } from 'react';

const DashboardTab = ({
  students,
  handleAwardXP,
  setSelectedStudent,
  animatingXP,
  setShowAddStudentModal,
  showToast,
  setActiveTab,
  // Quest System Props
  activeQuests,
  getAvailableQuests,
  attendanceData,
  markAttendance,
  // Bulk XP Props
  selectedStudents,
  setSelectedStudents,
  showBulkXpPanel,
  setShowBulkXpPanel,
  calculateCoins
}) => {
  const [timeOfDay, setTimeOfDay] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [classInsights, setClassInsights] = useState({});

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('Good morning');
    else if (hour < 17) setTimeOfDay('Good afternoon');
    else setTimeOfDay('Good evening');
  }, []);

  // Calculate today's date and stats
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData[today] || {};
  const totalStudents = students.length;
  const presentToday = Object.values(todayAttendance).filter(status => status === 'present').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  // Calculate advanced class metrics
  const totalClassXP = students.reduce((acc, student) => acc + (student.totalPoints || 0), 0);
  const averageXP = totalStudents > 0 ? Math.round(totalClassXP / totalStudents) : 0;
  const studentsWithPets = students.filter(s => s.pet?.image).length;
  const totalCoins = students.reduce((acc, student) => acc + calculateCoins(student), 0);
  
  // Get top performers
  const topXpStudent = students.reduce((top, student) => 
    (student.totalPoints || 0) > (top.totalPoints || 0) ? student : top, students[0] || null);
  
  const topCoinStudent = students.reduce((top, student) => 
    calculateCoins(student) > calculateCoins(top) ? student : top, students[0] || null);

  // Weekly trend calculation
  const thisWeekXP = students.reduce((acc, student) => acc + (student.weeklyPoints || 0), 0);
  const weeklyAverage = totalStudents > 0 ? Math.round(thisWeekXP / totalStudents) : 0;

  // Class health indicators
  const getClassHealth = () => {
    if (attendanceRate >= 95 && averageXP >= 100) return { status: 'excellent', color: 'green', emoji: '🌟' };
    if (attendanceRate >= 85 && averageXP >= 75) return { status: 'good', color: 'blue', emoji: '👍' };
    if (attendanceRate >= 70 && averageXP >= 50) return { status: 'fair', color: 'yellow', emoji: '⚡' };
    return { status: 'needs attention', color: 'orange', emoji: '🎯' };
  };

  const classHealth = getClassHealth();

  // Quick actions that teachers actually use
  const quickActions = [
    {
      title: 'Award Class XP',
      icon: '⚡',
      action: () => setShowBulkXpPanel(true),
      color: 'purple',
      enabled: students.length > 0
    },
    {
      title: 'Mark Attendance',
      icon: '📋',
      action: () => setActiveTab('attendance'),
      color: 'blue',
      enabled: students.length > 0
    },
    {
      title: 'Start Pet Race',
      icon: '🏁',
      action: () => setActiveTab('race'),
      color: 'green',
      enabled: studentsWithPets > 0
    },
    {
      title: 'View Shop',
      icon: '🛍️',
      action: () => setActiveTab('shop'),
      color: 'yellow',
      enabled: totalCoins > 0
    },
    {
      title: 'Teacher Tools',
      icon: '🛠️',
      action: () => setActiveTab('toolkit'),
      color: 'gray',
      enabled: true
    },
    {
      title: 'Add Students',
      icon: '👥',
      action: () => setShowAddStudentModal(true),
      color: 'indigo',
      enabled: true
    }
  ];

  // Simulate recent activity (in real app, this would come from logs)
  const getRecentActivity = () => {
    const activities = [];
    
    // Add some sample recent activities
    if (students.length > 0) {
      const recentStudent = students[Math.floor(Math.random() * students.length)];
      activities.push({
        type: 'xp_awarded',
        student: recentStudent.firstName,
        detail: '5 XP for excellent behavior',
        time: '2 minutes ago',
        icon: '⭐'
      });
    }

    if (studentsWithPets > 0) {
      const petOwner = students.find(s => s.pet?.image);
      if (petOwner) {
        activities.push({
          type: 'pet_unlocked',
          student: petOwner.firstName,
          detail: `unlocked ${petOwner.pet.name}`,
          time: '15 minutes ago',
          icon: '🐾'
        });
      }
    }

    return activities.slice(0, 3);
  };

  // At-a-glance insights
  const insights = [
    {
      text: `${students.filter(s => (s.totalPoints || 0) >= 100).length} students have reached 100+ XP`,
      type: 'milestone',
      icon: '🎯'
    },
    {
      text: studentsWithPets > 0 ? `${studentsWithPets} students have companion pets` : 'No students have pets yet',
      type: studentsWithPets > 0 ? 'achievement' : 'opportunity',
      icon: studentsWithPets > 0 ? '🐲' : '🥚'
    },
    {
      text: attendanceRate >= 90 ? 'Excellent attendance this week!' : 'Room for attendance improvement',
      type: attendanceRate >= 90 ? 'achievement' : 'attention',
      icon: attendanceRate >= 90 ? '🌟' : '📈'
    }
  ];

  if (students.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🚀</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Kingdom!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Ready to transform your classroom into an epic adventure? Let's start by adding your first heroes!
          </p>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all shadow-lg"
          >
            🌟 Add Your First Heroes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 text-9xl opacity-10">⚔️</div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {timeOfDay}, Champion! 👑
          </h1>
          <p className="text-purple-100 text-lg mb-4">
            Your guild of {totalStudents} heroes awaits your leadership
          </p>
          
          {/* Class Health Status */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 bg-${classHealth.color}-500/20 backdrop-blur px-4 py-2 rounded-lg border border-white/20`}>
              <span className="text-2xl">{classHealth.emoji}</span>
              <span className="font-bold">Guild Status: {classHealth.status}</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-lg border border-white/20">
              <span className="font-bold">{attendanceRate}% Present Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-bold">Total Guild Power</p>
              <p className="text-2xl font-bold text-gray-900">{totalClassXP.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{averageXP} avg per hero</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-yellow-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-bold">Guild Treasury</p>
              <p className="text-2xl font-bold text-gray-900">{totalCoins}</p>
              <p className="text-xs text-gray-500">coins available</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-bold">Companions</p>
              <p className="text-2xl font-bold text-gray-900">{studentsWithPets}</p>
              <p className="text-xs text-gray-500">of {totalStudents} heroes</p>
            </div>
            <div className="text-3xl">🐲</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-bold">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{thisWeekXP}</p>
              <p className="text-xs text-gray-500">{weeklyAverage} avg XP</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Champions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={!action.enabled}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  action.enabled
                    ? `border-${action.color}-200 hover:border-${action.color}-400 hover:bg-${action.color}-50 bg-gradient-to-br from-${action.color}-50 to-${action.color}-100 hover:shadow-md transform hover:scale-105`
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <span className="font-bold text-gray-800">{action.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Champions */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Guild Champions
          </h3>
          
          {topXpStudent && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                  👑
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{topXpStudent.firstName}</div>
                  <div className="text-sm text-yellow-700">XP Champion • {topXpStudent.totalPoints || 0} XP</div>
                </div>
                <button
                  onClick={() => setSelectedStudent(topXpStudent)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-bold"
                >
                  View
                </button>
              </div>

              {topCoinStudent && topCoinStudent.id !== topXpStudent.id && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                    💰
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{topCoinStudent.firstName}</div>
                    <div className="text-sm text-green-700">Coin Master • {calculateCoins(topCoinStudent)} coins</div>
                  </div>
                  <button
                    onClick={() => setSelectedStudent(topCoinStudent)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-bold"
                  >
                    View
                  </button>
                </div>
              )}

              {studentsWithPets > 0 && (
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🐾</span>
                      <span className="font-bold text-gray-800">Pet Companions</span>
                    </div>
                    <span className="text-purple-700 font-bold">{studentsWithPets} heroes</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Insights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">🎯</span>
            Class Insights
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                insight.type === 'achievement' ? 'bg-green-50 border border-green-200' :
                insight.type === 'milestone' ? 'bg-blue-50 border border-blue-200' :
                insight.type === 'opportunity' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-orange-50 border border-orange-200'
              }`}>
                <span className="text-xl">{insight.icon}</span>
                <span className="text-gray-700 font-medium">{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Class Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Class Overview
          </h3>
          
          {/* XP Distribution */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">XP Distribution</span>
                <span className="text-blue-600 font-bold">{averageXP} avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((averageXP / 200) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pet Adoption Rate</span>
                <span className="text-green-600 font-bold">{Math.round((studentsWithPets / totalStudents) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${(studentsWithPets / totalStudents) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Attendance Rate</span>
                <span className="text-blue-600 font-bold">{attendanceRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-800 mb-4 flex items-center">
          <span className="mr-2">🧭</span>
          Quick Navigation
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { tab: 'students', label: 'View All Heroes', icon: '👥' },
            { tab: 'shop', label: 'Guild Shop', icon: '🛍️' },
            { tab: 'race', label: 'Pet Racing', icon: '🏁' },
            { tab: 'toolkit', label: 'Teacher Tools', icon: '🛠️' }
          ].map((nav, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(nav.tab)}
              className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-medium text-gray-700 hover:text-indigo-700"
            >
              <span>{nav.icon}</span>
              <span>{nav.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;