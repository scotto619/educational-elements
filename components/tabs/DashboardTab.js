// DashboardTab.js - Enhanced Dashboard with Quest Integration
import React, { useState, useEffect } from 'react';

const DashboardTab = ({
  students,
  handleAwardXP,
  handleAvatarClick,
  setSelectedStudent,
  animatingXP,
  setShowAddStudentModal,
  showToast,
  // Quest System Props
  activeQuests,
  QUEST_GIVERS,
  getAvailableQuests,
  attendanceData,
  markAttendance,
  // Bulk XP Props
  selectedStudents,
  setSelectedStudents,
  handleStudentSelect,
  handleSelectAll,
  handleDeselectAll,
  showBulkXpPanel,
  setShowBulkXpPanel,
  bulkXpAmount,
  setBulkXpAmount,
  bulkXpCategory,
  setBulkXpCategory,
  handleBulkXpAward
}) => {
  const [showAttendanceWidget, setShowAttendanceWidget] = useState(false);
  const [currentTip, setCurrentTip] = useState(null);

  // Get today's date for attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData[today] || {};

  // Calculate class statistics
  const totalStudents = students.length;
  const presentToday = Object.values(todayAttendance).filter(status => status === 'present').length;
  const absentToday = Object.values(todayAttendance).filter(status => status === 'absent').length;
  const lateToday = Object.values(todayAttendance).filter(status => status === 'late').length;
  const attendanceRate = totalStudents > 0 ? Math.round((presentToday / totalStudents) * 100) : 0;

  // Calculate quest completion statistics
  const totalActiveQuests = activeQuests.length;
  const totalQuestCompletions = activeQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0);
  const studentsWithAvailableQuests = students.filter(student => 
    getAvailableQuests ? getAvailableQuests(student).length > 0 : false
  ).length;

  // Get quest completion rate
  const questCompletionRate = totalActiveQuests > 0 && totalStudents > 0 ? 
    Math.round((totalQuestCompletions / (totalActiveQuests * totalStudents)) * 100) : 0;

  // Get today's completed quests
  const todayCompletedQuests = activeQuests.reduce((acc, quest) => {
    const todayCompletions = (quest.completedBy || []).filter(studentId => {
      // For now, we'll assume any completion is from today
      // In a real implementation, you'd track completion dates
      return true;
    });
    return acc + todayCompletions.length;
  }, 0);

  // Calculate class XP stats
  const totalClassXP = students.reduce((acc, student) => acc + (student.totalPoints || 0), 0);
  const averageXP = totalStudents > 0 ? Math.round(totalClassXP / totalStudents) : 0;
  const topPerformer = students.reduce((top, student) => 
    (student.totalPoints || 0) > (top.totalPoints || 0) ? student : top, 
    students[0] || {}
  );

  // Get students who need attention (low XP, absent, no quests completed)
  const studentsNeedingAttention = students.filter(student => {
    const attendance = todayAttendance[student.id];
    const xp = student.totalPoints || 0;
    const availableQuests = getAvailableQuests ? getAvailableQuests(student).length : 0;
    
    return attendance === 'absent' || xp < averageXP * 0.7 || availableQuests > 2;
  });

  // Handle quick attendance marking
  const handleQuickAttendance = (studentId, status) => {
    markAttendance(studentId, status);
  };

  // Show random tip from quest givers
  const showRandomQuestGiverTip = () => {
    const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
    const randomTip = randomGiver.tips[Math.floor(Math.random() * randomGiver.tips.length)];
    setCurrentTip({ giver: randomGiver, tip: randomTip });
    
    setTimeout(() => setCurrentTip(null), 5000);
  };

  useEffect(() => {
    // Show a random tip every 30 seconds
    const tipInterval = setInterval(showRandomQuestGiverTip, 30000);
    return () => clearInterval(tipInterval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome to Your Classroom!</h2>
            <p className="text-blue-100">
              {totalStudents} brave adventurers ready for learning quests
            </p>
          </div>
          <div className="text-6xl">🏫</div>
        </div>
      </div>

      {/* Quest Giver Tip */}
      {currentTip && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-fade-in">
          <div className="flex items-start space-x-3">
            <img
              src={currentTip.giver.image}
              alt={currentTip.giver.name}
              className="w-12 h-12 rounded-full border-2 border-yellow-300"
            />
            <div className="flex-1">
              <div className="font-bold text-yellow-800">{currentTip.giver.name} says:</div>
              <div className="text-yellow-700">{currentTip.tip}</div>
            </div>
            <button
              onClick={() => setCurrentTip(null)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Attendance Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Attendance Today</p>
              <p className="text-3xl font-bold text-gray-900">{attendanceRate}%</p>
              <p className="text-gray-500 text-sm">{presentToday}/{totalStudents} present</p>
            </div>
            <div className="text-4xl text-blue-500">📅</div>
          </div>
        </div>

        {/* Quest Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Quest Activity</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuestCompletions}</p>
              <p className="text-gray-500 text-sm">{totalActiveQuests} active quests</p>
            </div>
            <div className="text-4xl text-purple-500">⚔️</div>
          </div>
        </div>

        {/* Class XP */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Average XP</p>
              <p className="text-3xl font-bold text-gray-900">{averageXP}</p>
              <p className="text-gray-500 text-sm">{totalClassXP} total XP</p>
            </div>
            <div className="text-4xl text-green-500">⭐</div>
          </div>
        </div>

        {/* Students with Pets */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Students with Pets</p>
              <p className="text-3xl font-bold text-gray-900">
                {students.filter(s => s.pet?.image).length}
              </p>
              <p className="text-gray-500 text-sm">out of {totalStudents}</p>
            </div>
            <div className="text-4xl text-orange-500">🐾</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
          <button
            onClick={() => setShowBulkXpPanel(!showBulkXpPanel)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showBulkXpPanel 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            ⚡ Bulk XP
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAttendanceWidget(!showAttendanceWidget)}
            className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold">Take Attendance</div>
          </button>
          
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Add Student</div>
          </button>
          
          <button
            onClick={showRandomQuestGiverTip}
            className="p-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-center"
          >
            <div className="text-2xl mb-2">💡</div>
            <div className="font-semibold">Get Tip</div>
          </button>
          
          <button
            onClick={() => {
              const randomStudent = students[Math.floor(Math.random() * students.length)];
              if (randomStudent) setSelectedStudent(randomStudent);
            }}
            className="p-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-center"
            disabled={students.length === 0}
          >
            <div className="text-2xl mb-2">🎲</div>
            <div className="font-semibold">Random Student</div>
          </button>
        </div>
      </div>

      {/* Bulk XP Panel */}
      {showBulkXpPanel && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-800 mb-4">Award XP to Multiple Students</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">XP Amount</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bulkXpAmount}
                onChange={(e) => setBulkXpAmount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1">Category</label>
              <select
                value={bulkXpCategory}
                onChange={(e) => setBulkXpCategory(e.target.value)}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Respectful">👍 Respectful</option>
                <option value="Responsible">💼 Responsible</option>
                <option value="Learner">📚 Learner</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end space-x-2">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Clear
              </button>
              <button
                onClick={handleBulkXpAward}
                disabled={selectedStudents.length === 0}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Award XP ({selectedStudents.length} students)
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-32 overflow-y-auto">
            {students.map(student => (
              <label key={student.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentSelect(student.id)}
                  className="rounded"
                />
                <span className="truncate">{student.firstName}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Quick Attendance Widget */}
      {showAttendanceWidget && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Quick Attendance - {new Date().toLocaleDateString()}</h3>
            <button
              onClick={() => setShowAttendanceWidget(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => {
              const attendance = todayAttendance[student.id];
              
              return (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.firstName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs">👤</span>
                      </div>
                    )}
                    <span className="font-medium">{student.firstName}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleQuickAttendance(student.id, 'present')}
                      className={`p-1 rounded text-xs ${
                        attendance === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-green-200'
                      }`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleQuickAttendance(student.id, 'absent')}
                      className={`p-1 rounded text-xs ${
                        attendance === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-red-200'
                      }`}
                    >
                      ❌
                    </button>
                    <button
                      onClick={() => handleQuickAttendance(student.id, 'late')}
                      className={`p-1 rounded text-xs ${
                        attendance === 'late'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-yellow-200'
                      }`}
                    >
                      ⏰
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Quest Overview */}
      {totalActiveQuests > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Today's Quest Activity</h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                {totalActiveQuests} Active Quests
              </span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {totalQuestCompletions} Completions
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Quest Completion Progress */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700">Completion Rate</h4>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${questCompletionRate}%` }}
                ></div>
              </div>
              <div className="text-center text-sm text-gray-600">
                {questCompletionRate}% of possible completions
              </div>
            </div>

            {/* Students with Available Quests */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700">Students with Quests</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{studentsWithAvailableQuests}</div>
                <div className="text-sm text-gray-600">have available quests</div>
              </div>
            </div>

            {/* Most Active Quest Givers */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-700">Active Quest Givers</h4>
              <div className="flex -space-x-2">
                {QUEST_GIVERS.slice(0, 3).map(giver => (
                  <img
                    key={giver.id}
                    src={giver.image}
                    alt={giver.name}
                    className="w-10 h-10 rounded-full border-2 border-white"
                    title={giver.name}
                  />
                ))}
                {QUEST_GIVERS.length > 3 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold">
                    +{QUEST_GIVERS.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Needing Attention */}
      {studentsNeedingAttention.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4">Students Needing Attention</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentsNeedingAttention.map(student => {
              const attendance = todayAttendance[student.id];
              const availableQuests = getAvailableQuests ? getAvailableQuests(student).length : 0;
              const reasons = [];
              
              if (attendance === 'absent') reasons.push('Absent today');
              if ((student.totalPoints || 0) < averageXP * 0.7) reasons.push('Below average XP');
              if (availableQuests > 2) reasons.push(`${availableQuests} pending quests`);

              return (
                <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.firstName}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-800">{student.firstName}</h4>
                      <div className="text-sm text-gray-600">{student.totalPoints || 0} XP</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {reasons.map((reason, index) => (
                      <div key={index} className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                        {reason}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="mt-2 w-full bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Check Progress
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Performers */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Class Leaders</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top XP Earner */}
            <div className="text-center">
              <div className="text-6xl mb-2">🏆</div>
              <h4 className="font-bold text-gray-800">XP Champion</h4>
              {topPerformer.firstName && (
                <div className="mt-2">
                  <div className="font-bold text-lg text-gold-600">{topPerformer.firstName}</div>
                  <div className="text-gray-600">{topPerformer.totalPoints || 0} XP</div>
                </div>
              )}
            </div>

            {/* Most Quests Completed */}
            <div className="text-center">
              <div className="text-6xl mb-2">⚔️</div>
              <h4 className="font-bold text-gray-800">Quest Master</h4>
              {(() => {
                const questMaster = students.reduce((top, student) => {
                  const studentCompletions = activeQuests.filter(quest => 
                    quest.completedBy?.includes(student.id)
                  ).length;
                  const topCompletions = activeQuests.filter(quest => 
                    quest.completedBy?.includes(top.id)
                  ).length;
                  return studentCompletions > topCompletions ? student : top;
                }, students[0] || {});
                
                const completions = activeQuests.filter(quest => 
                  quest.completedBy?.includes(questMaster.id)
                ).length;

                return questMaster.firstName ? (
                  <div className="mt-2">
                    <div className="font-bold text-lg text-purple-600">{questMaster.firstName}</div>
                    <div className="text-gray-600">{completions} quests completed</div>
                  </div>
                ) : (
                  <div className="text-gray-500 mt-2">No quests completed yet</div>
                );
              })()}
            </div>

            {/* Perfect Attendance */}
            <div className="text-center">
              <div className="text-6xl mb-2">⭐</div>
              <h4 className="font-bold text-gray-800">Perfect Attendance</h4>
              {(() => {
                const perfectAttendees = students.filter(student => {
                  // Check last 5 days for perfect attendance
                  const last5Days = Array.from({length: 5}, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    return date.toISOString().split('T')[0];
                  });
                  
                  return last5Days.every(date => 
                    attendanceData[date]?.[student.id] === 'present'
                  );
                });

                return perfectAttendees.length > 0 ? (
                  <div className="mt-2">
                    <div className="font-bold text-lg text-blue-600">
                      {perfectAttendees.length} Student{perfectAttendees.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-gray-600">Perfect this week!</div>
                  </div>
                ) : (
                  <div className="text-gray-500 mt-2">Keep working on it!</div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {students.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">Ready to Start Your Adventure?</h3>
          <p className="text-gray-500 mb-6">Add your first students to begin the quest for knowledge!</p>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Add Your First Student
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;