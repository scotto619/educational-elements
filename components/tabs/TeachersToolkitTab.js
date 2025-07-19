// TeachersToolkitTab.js - Enhanced with Literacy Companion
import React, { useState } from 'react';
import StudentHelpQueue from '../StudentHelpQueue';
import HundredsBoard from '../HundredsBoard';
import GroupMaker from '../GroupMaker';
import NamePicker from '../NamePicker';
import TimerTools from '../TimerTools';
import DiceRoller from '../DiceRoller';
import ClassroomDesigner from '../ClassroomDesigner';
import WordStudy from '../WordStudy';
import NumberMat from '../NumberMat';
import AttendanceTracker from '../quest/AttendanceTracker';
import QuestProgressBar from '../quest/QuestProgressBar';
import LiteracyCompanion from '../LiteracyCompanion';

const TeachersToolkitTab = ({ 
  students, 
  showToast,
  userData,
  saveGroupDataToFirebase,
  saveClassroomDataToFirebase,
  currentClassId,
  // Quest System Props
  activeQuests,
  QUEST_GIVERS,
  attendanceData,
  markAttendance,
  completeQuest,
  setShowQuestManagement,
  // Additional Props for Analytics
  questTemplates,
  setSelectedQuestGiver,
  // Timer Props
  timerState,
  setTimerState
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('help-queue');
  const [showQuestAnalytics, setShowQuestAnalytics] = useState(false);
  const [selectedAnalyticsPeriod, setSelectedAnalyticsPeriod] = useState('week'); // week, month, all

  // Check if user has PRO access
  if (userData?.subscription !== 'pro') {
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
                <span>🔢</span>
                <span>Interactive Number Board</span>
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
                <span>Timer Tools for Activities</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎲</span>
                <span>Digital Dice Roller</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>🏫</span>
                <span>Interactive Classroom Designer</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📚</span>
                <span>Complete Literacy Companion</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🧮</span>
                <span>Math Number Mat Tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Quest Analytics & Reports</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>Advanced Attendance Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✨</span>
                <span>New Tools Added Monthly!</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.open('/pricing', '_blank')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
        >
          Upgrade to PRO
        </button>
      </div>
    );
  }

  // Calculate quest analytics
  const calculateQuestAnalytics = () => {
    const analytics = {
      totalQuests: activeQuests.length,
      totalCompletions: activeQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0),
      questGiverStats: {},
      categoryStats: {}
    };

    // Calculate completion rate
    const possibleCompletions = analytics.totalQuests * students.length;
    analytics.completionRate = possibleCompletions > 0 ? 
      Math.round((analytics.totalCompletions / possibleCompletions) * 100) : 0;

    // Group by quest giver
    QUEST_GIVERS.forEach(giver => {
      const giverQuests = activeQuests.filter(quest => quest.questGiverId === giver.id);
      const giverCompletions = giverQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0);
      
      analytics.questGiverStats[giver.id] = {
        totalQuests: giverQuests.length,
        totalCompletions: giverCompletions,
        completionRate: giverQuests.length > 0 ? 
          Math.round((giverCompletions / (giverQuests.length * students.length)) * 100) : 0
      };
    });

    // Group by category
    const categories = ['academic', 'behavior', 'responsibility'];
    categories.forEach(category => {
      const categoryQuests = activeQuests.filter(quest => quest.category === category);
      const categoryCompletions = categoryQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0);
      
      analytics.categoryStats[category] = {
        totalQuests: categoryQuests.length,
        totalCompletions: categoryCompletions,
        completionRate: categoryQuests.length > 0 ? 
          Math.round((categoryCompletions / (categoryQuests.length * students.length)) * 100) : 0
      };
    });

    return analytics;
  };

  // Calculate attendance statistics
  const calculateAttendanceStats = () => {
    const dates = Object.keys(attendanceData);
    const totalStudentDays = dates.length * students.length;
    let totalPresentCount = 0;

    dates.forEach(date => {
      const dayAttendance = attendanceData[date] || {};
      totalPresentCount += Object.values(dayAttendance).filter(status => status === 'present').length;
    });

    const averageAttendance = totalStudentDays > 0 ? 
      Math.round((totalPresentCount / totalStudentDays) * 100) : 0;

    // Calculate perfect attendance students
    const perfectAttendanceStudents = students.filter(student => {
      return dates.every(date => attendanceData[date]?.[student.id] === 'present');
    }).length;

    return {
      averageAttendance,
      totalDaysTracked: dates.length,
      perfectAttendanceStudents,
      attendanceTrend: 'stable' // This could be calculated based on recent trends
    };
  };

  const questAnalytics = calculateQuestAnalytics();
  const attendanceStats = calculateAttendanceStats();

  const toolkitTabs = [
    { id: 'help-queue', label: 'Help Queue', icon: '🎫' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'quest-analytics', label: 'Quest Analytics', icon: '⚔️' },
    { id: 'literacy-companion', label: 'Literacy Companion', icon: '📚' },
    { id: 'hundreds-board', label: 'Numbers Board', icon: '🔢' },
    { id: 'group-maker', label: 'Group Maker', icon: '👥' },
    { id: 'name-picker', label: 'Name Picker', icon: '🎯' },
    { id: 'timer', label: 'Timer Tools', icon: '⏰' },
    { id: 'dice', label: 'Dice Roller', icon: '🎲' },
    { id: 'classroom-designer', label: 'Room Designer', icon: '🏫' },
    { id: 'word-study', label: 'Word Study', icon: '📚' },
    { id: 'number-mat', label: 'Number Mat', icon: '🧮' }
  ];

  return (
    <div className="space-y-6">
      {/* Quest & Attendance Dashboard */}
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
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Quest Completions</p>
              <p className="text-2xl font-bold">{questAnalytics.totalCompletions}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Avg Attendance</p>
              <p className="text-2xl font-bold">{attendanceStats.averageAttendance}%</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Perfect Attendance</p>
              <p className="text-2xl font-bold">{attendanceStats.perfectAttendanceStudents}</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowQuestManagement(true)}
            className="p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">⚔️</div>
            <div className="font-semibold">Manage Quests</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('attendance')}
            className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold">Take Attendance</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('literacy-companion')}
            className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-semibold">Literacy Tools</div>
          </button>
          
          <button
            onClick={() => setActiveToolkitTab('help-queue')}
            className="p-4 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🎫</div>
            <div className="font-semibold">Help Queue</div>
          </button>
        </div>
      </div>

      {/* Toolkit Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
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
          {activeToolkitTab === 'help-queue' && (
            <StudentHelpQueue students={students} showToast={showToast} />
          )}

          {activeToolkitTab === 'attendance' && (
            <AttendanceTracker
              students={students}
              attendanceData={attendanceData}
              onMarkAttendance={markAttendance}
              showToast={showToast}
              currentDate={new Date().toISOString().split('T')[0]}
            />
          )}

          {activeToolkitTab === 'literacy-companion' && (
            <LiteracyCompanion showToast={showToast} />
          )}

          {activeToolkitTab === 'quest-analytics' && (
            <div className="space-y-6">
              {/* Period Selection */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">📊 Quest Analytics</h3>
                <select
                  value={selectedAnalyticsPeriod}
                  onChange={(e) => setSelectedAnalyticsPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-bold text-purple-800 mb-2">📈 Overall Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Quests:</span>
                      <span className="font-bold">{questAnalytics.totalQuests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Completions:</span>
                      <span className="font-bold">{questAnalytics.totalCompletions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate:</span>
                      <span className="font-bold text-purple-600">{questAnalytics.completionRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">👥 Student Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Students:</span>
                      <span className="font-bold">{students.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg per Student:</span>
                      <span className="font-bold">{students.length > 0 ? Math.round(questAnalytics.totalCompletions / students.length) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Participation:</span>
                      <span className="font-bold text-blue-600">
                        {questAnalytics.totalCompletions > 0 ? 'High' : 'Getting Started'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">📅 Attendance Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Rate:</span>
                      <span className="font-bold">{attendanceStats.averageAttendance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Tracked:</span>
                      <span className="font-bold">{attendanceStats.totalDaysTracked}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Perfect Attendance:</span>
                      <span className="font-bold text-green-600">{attendanceStats.perfectAttendanceStudents}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quest Giver Performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-bold text-gray-800 mb-4">🎭 Quest Giver Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(questAnalytics.questGiverStats).map(([giverId, stats]) => {
                    const giver = QUEST_GIVERS.find(g => g.id === giverId);
                    if (!giver) return null;

                    return (
                      <div key={giverId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={giver.image}
                            alt={giver.name}
                            className="w-12 h-12 rounded-full border-2 border-yellow-300"
                          />
                          <div>
                            <div className="font-bold text-gray-800">{giver.name}</div>
                            <div className="text-sm text-gray-600">{giver.role}</div>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quests:</span>
                            <span className="font-bold">{stats.totalQuests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Completions:</span>
                            <span className="font-bold">{stats.totalCompletions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Success Rate:</span>
                            <span className="font-bold text-green-600">{stats.completionRate}%</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedQuestGiver({ questGiver: giverId })}
                          className="w-full mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Performance */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-bold text-gray-800 mb-4">📊 Category Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(questAnalytics.categoryStats).map(([category, stats]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {category === 'academic' ? '📚' : 
                           category === 'behavior' ? '🌟' : 
                           category === 'responsibility' ? '👑' : '⚡'}
                        </div>
                        <h5 className="font-bold text-gray-800 capitalize mb-2">{category}</h5>
                        <div className="space-y-1 text-sm">
                          <div>Quests: <span className="font-bold">{stats.totalQuests}</span></div>
                          <div>Completions: <span className="font-bold">{stats.totalCompletions}</span></div>
                          <div className="text-green-600 font-bold">{stats.completionRate}% Success</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeToolkitTab === 'hundreds-board' && (
            <HundredsBoard showToast={showToast} />
          )}

          {activeToolkitTab === 'group-maker' && (
            <GroupMaker 
              students={students} 
              showToast={showToast}
              saveGroupDataToFirebase={saveGroupDataToFirebase}
            />
          )}

          {activeToolkitTab === 'name-picker' && (
            <NamePicker students={students} showToast={showToast} />
          )}

          {activeToolkitTab === 'timer' && (
            <TimerTools 
              showToast={showToast} 
              students={students}
              timerState={timerState}
              setTimerState={setTimerState}
            />
          )}

          {activeToolkitTab === 'dice' && (
            <DiceRoller showToast={showToast} />
          )}

          {activeToolkitTab === 'classroom-designer' && (
            <ClassroomDesigner 
              students={students} 
              showToast={showToast}
              saveClassroomDataToFirebase={saveClassroomDataToFirebase}
            />
          )}

          {activeToolkitTab === 'word-study' && (
            <WordStudy showToast={showToast} />
          )}

          {activeToolkitTab === 'number-mat' && (
            <NumberMat showToast={showToast} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersToolkitTab;