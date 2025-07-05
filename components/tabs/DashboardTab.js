import React from 'react';
import QuestPanel from '../components/QuestPanel';

const DashboardTab = ({ 
  students, 
  setActiveTab,
  selectedStudents,
  handleSelectAll,
  setShowBulkXpPanel,
  dailyQuests,
  weeklyQuests,
  checkQuestCompletion,
  markQuestComplete
}) => {
  const totalStudents = students.length;
  const studentsWithAvatars = students.filter(s => s.avatar).length;
  const studentsWithPets = students.filter(s => s.pet?.image).length;
  const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const averageXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;
  const topStudent = students.reduce((top, current) => 
    (current.totalPoints || 0) > (top.totalPoints || 0) ? current : top
  , students[0]);

  // XP distribution stats
  const xpDistribution = {
    respectful: students.reduce((sum, s) => sum + (s.categoryTotal?.Respectful || 0), 0),
    responsible: students.reduce((sum, s) => sum + (s.categoryTotal?.Responsible || 0), 0),
    learner: students.reduce((sum, s) => sum + (s.categoryTotal?.Learner || 0), 0)
  };

  // Quest completion stats
  const questStats = {
    dailyCompleted: dailyQuests.filter(q => 
      q.category === 'class' ? checkQuestCompletion(q.id) : 
      students.some(s => checkQuestCompletion(q.id, s.id))
    ).length,
    weeklyCompleted: weeklyQuests.filter(q => 
      q.category === 'class' ? checkQuestCompletion(q.id) : 
      students.some(s => checkQuestCompletion(q.id, s.id))
    ).length,
    totalDaily: dailyQuests.length,
    totalWeekly: weeklyQuests.length
  };

  return (
    <div className="flex gap-8 animate-fade-in">
      {/* Left Side - Quest Panel */}
      <div className="w-1/3">
        <QuestPanel 
          dailyQuests={dailyQuests}
          weeklyQuests={weeklyQuests}
          students={students}
          checkQuestCompletion={checkQuestCompletion}
          markQuestComplete={markQuestComplete}
        />
      </div>

      {/* Right Side - Main Dashboard Content */}
      <div className="w-2/3 space-y-8">
        {/* Class Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-blue-800 mb-1">Total Students</h3>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <div className="text-3xl text-blue-500">👥</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-green-800 mb-1">With Avatars</h3>
                <p className="text-2xl font-bold text-green-600">{studentsWithAvatars}</p>
              </div>
              <div className="text-3xl text-green-500">🎭</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-purple-800 mb-1">With Pets</h3>
                <p className="text-2xl font-bold text-purple-600">{studentsWithPets}</p>
              </div>
              <div className="text-3xl text-purple-500">🐾</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-yellow-800 mb-1">Total Class XP</h3>
                <p className="text-2xl font-bold text-yellow-600">{totalXP}</p>
              </div>
              <div className="text-3xl text-yellow-500">⭐</div>
            </div>
          </div>
        </div>

        {/* Quest Progress Overview */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">🎯</span>
            Quest Progress Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Daily Quests</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  {questStats.dailyCompleted}/{questStats.totalDaily}
                </span>
                <span className="text-sm text-blue-600">
                  {questStats.totalDaily > 0 ? 
                    Math.round((questStats.dailyCompleted / questStats.totalDaily) * 100) : 0}% Complete
                </span>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Weekly Quests</h4>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-purple-600">
                  {questStats.weeklyCompleted}/{questStats.totalWeekly}
                </span>
                <span className="text-sm text-purple-600">
                  {questStats.totalWeekly > 0 ? 
                    Math.round((questStats.weeklyCompleted / questStats.totalWeekly) * 100) : 0}% Complete
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* XP Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">📊</span>
            XP Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">{averageXP}</div>
              <div className="text-sm text-gray-500">Average XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">{xpDistribution.respectful}</div>
              <div className="text-sm text-blue-600 flex items-center justify-center">
                <span className="mr-1">👍</span>
                Respectful
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">{xpDistribution.responsible}</div>
              <div className="text-sm text-green-600 flex items-center justify-center">
                <span className="mr-1">💼</span>
                Responsible
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">{xpDistribution.learner}</div>
              <div className="text-sm text-purple-600 flex items-center justify-center">
                <span className="mr-1">📚</span>
                Learner
              </div>
            </div>
          </div>
        </div>

        {/* Top Performer */}
        {topStudent && (
          <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-orange-200 p-6 rounded-xl shadow-lg border-2 border-yellow-300">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏆</span>
              Top Performer
            </h3>
            <div className="flex items-center space-x-4">
              {topStudent.avatar && (
                <div className="relative">
                  <img 
                    src={topStudent.avatar} 
                    alt={topStudent.firstName} 
                    className="w-16 h-16 rounded-full border-4 border-yellow-400 shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                    L{topStudent.avatarLevel}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xl font-bold text-gray-800 mb-1">{topStudent.firstName}</p>
                <p className="text-lg text-yellow-700 flex items-center">
                  <span className="mr-2">⭐</span>
                  Level {topStudent.avatarLevel} • {topStudent.totalPoints} XP
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">⚡</span>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveTab('students')}
              className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👥</div>
                <div className="font-semibold text-blue-800 text-sm">Manage Students</div>
                <div className="text-xs text-blue-600 mt-1">Award XP, view profiles</div>
              </div>
            </button>
            
            <button 
              onClick={() => {
                if (students.length > 0) {
                  handleSelectAll();
                  setShowBulkXpPanel(true);
                }
              }}
              disabled={students.length === 0}
              className="group p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚡</div>
                <div className="font-semibold text-green-800 text-sm">Bulk XP Award</div>
                <div className="text-xs text-green-600 mt-1">Award XP to entire class</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('race')}
              className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏁</div>
                <div className="font-semibold text-purple-800 text-sm">Start Pet Race</div>
                <div className="text-xs text-purple-600 mt-1">Compete for prizes</div>
              </div>
            </button>
            
            <button 
              onClick={() => setActiveTab('classes')}
              className="group p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              <div className="text-center">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                <div className="font-semibold text-orange-800 text-sm">Manage Classes</div>
                <div className="text-xs text-orange-600 mt-1">Import, switch classes</div>
              </div>
            </button>
          </div>
        </div>

        {/* Class Progress */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">📈</span>
            Class Progress
          </h3>
          <div className="space-y-3">
            {students.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                  {student.avatar ? (
                    <img src={student.avatar} alt={student.firstName} className="w-10 h-10 rounded-full border-2 border-gray-300" />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      {student.firstName.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">{student.firstName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600 text-lg">{student.totalPoints || 0} XP</span>
                  <br />
                  <span className="text-sm text-gray-500">Level {student.avatarLevel}</span>
                </div>
              </div>
            ))}
            {students.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🎒</div>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No students yet</h4>
                <p className="text-gray-500">Add students or load a class to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;