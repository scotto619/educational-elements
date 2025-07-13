// DashboardTab.js - ENHANCED with Quest System Integration
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
  completeQuest,
  setShowQuestManagement,
  attendanceData,
  markAttendance,
  setSelectedQuestGiver,
  showRandomQuestGiverTip,
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
  const [showQuestBoard, setShowQuestBoard] = useState(true);
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
  const completedQuests = activeQuests.filter(quest => quest.completedBy.length > 0).length;
  const questCompletionRate = totalActiveQuests > 0 ? Math.round((completedQuests / totalActiveQuests) * 100) : 0;

  // Get a random quest giver tip
  const getRandomTip = () => {
    if (QUEST_GIVERS.length === 0) return null;
    const randomGiver = QUEST_GIVERS[Math.floor(Math.random() * QUEST_GIVERS.length)];
    const randomTip = randomGiver.tips[Math.floor(Math.random() * randomGiver.tips.length)];
    return { questGiver: randomGiver, tip: randomTip };
  };

  // Show a tip every 30 seconds
  useEffect(() => {
    const tipInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        setCurrentTip(getRandomTip());
        setTimeout(() => setCurrentTip(null), 5000); // Hide after 5 seconds
      }
    }, 30000);

    return () => clearInterval(tipInterval);
  }, [QUEST_GIVERS]);

  const handleQuickAttendance = (studentId, status) => {
    markAttendance(studentId, today, status);
  };

  const getQuestGiver = (questGiverId) => {
    return QUEST_GIVERS.find(qg => qg.id === questGiverId);
  };

  const handleQuestClick = (quest) => {
    const questGiver = getQuestGiver(quest.questGiver);
    if (questGiver) {
      setSelectedQuestGiver({ ...quest, questGiver: questGiver });
    }
  };

  if (students.length === 0) {
    return (
      <div className="animate-fade-in text-center py-16">
        <div className="text-6xl mb-6">🎓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Classroom Champions!</h2>
        <p className="text-gray-600 mb-8">Get started by adding students to your class.</p>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Add Your First Student
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header with Class Overview */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">📊 Class Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{totalStudents}</div>
            <div className="text-sm opacity-90">Total Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{attendanceRate}%</div>
            <div className="text-sm opacity-90">Attendance Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{totalActiveQuests}</div>
            <div className="text-sm opacity-90">Active Quests</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{questCompletionRate}%</div>
            <div className="text-sm opacity-90">Quest Completion</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowQuestManagement(true)}
          className="p-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          <span className="text-2xl">⚔️</span>
          <span className="font-semibold">Manage Quests</span>
        </button>
        
        <button
          onClick={() => setShowAttendanceWidget(!showAttendanceWidget)}
          className="p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          <span className="text-2xl">📅</span>
          <span className="font-semibold">Quick Attendance</span>
        </button>
        
        <button
          onClick={() => setShowBulkXpPanel(!showBulkXpPanel)}
          className="p-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-lg flex items-center justify-center space-x-2"
        >
          <span className="text-2xl">⭐</span>
          <span className="font-semibold">Bulk XP Award</span>
        </button>
      </div>

      {/* Quest Giver Tip */}
      {currentTip && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-500 p-4 rounded-r-xl shadow-md animate-slide-up">
          <div className="flex items-start space-x-3">
            <img 
              src={currentTip.questGiver.image} 
              alt={currentTip.questGiver.name}
              className="w-12 h-12 rounded-full border-2 border-yellow-400"
            />
            <div>
              <div className="font-bold text-yellow-800">{currentTip.questGiver.name} says:</div>
              <div className="text-yellow-700">{currentTip.tip}</div>
            </div>
            <button 
              onClick={() => setCurrentTip(null)}
              className="text-yellow-600 hover:text-yellow-800 ml-auto"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Bulk XP Panel */}
      {showBulkXpPanel && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-800 mb-4">⭐ Bulk XP Award</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={bulkXpCategory}
                onChange={(e) => setBulkXpCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="Respectful">Respectful</option>
                <option value="Responsible">Responsible</option>
                <option value="Learner">Learner</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bulkXpAmount}
                onChange={(e) => setBulkXpAmount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleBulkXpAward}
                disabled={selectedStudents.length === 0}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold"
              >
                Award XP ({selectedStudents.length} selected)
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 bg-purple-200 text-purple-800 rounded-lg hover:bg-purple-300 transition-colors text-sm"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Quick Attendance Widget */}
      {showAttendanceWidget && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">📅 Quick Attendance - {today}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {students.map(student => {
              const attendance = todayAttendance[student.id] || 'unmarked';
              
              return (
                <div key={student.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={student.avatar || '/avatars/default.png'} 
                      alt={student.firstName}
                      className="w-8 h-8 rounded-full border-2 border-gray-300"
                    />
                    <span className="font-medium text-sm">{student.firstName}</span>
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
                      ✅
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

      {/* Active Quests Board */}
      {showQuestBoard && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">⚔️ Active Quests</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQuestManagement(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                Manage Quests
              </button>
              <button
                onClick={() => setShowQuestBoard(false)}
                className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Hide
              </button>
            </div>
          </div>

          {activeQuests.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🗡️</div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">No Active Quests</h4>
              <p className="text-gray-500 mb-4">Add some quests to get your students engaged!</p>
              <button
                onClick={() => setShowQuestManagement(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Add Your First Quest
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeQuests.map(quest => {
                const questGiver = getQuestGiver(quest.questGiver);
                const completionCount = quest.completedBy.length;
                const isClassQuest = quest.category === 'class' || quest.requirement?.type === 'class_total_xp';
                const maxCompletions = isClassQuest ? 1 : students.length;
                const completionPercentage = maxCompletions > 0 ? Math.round((completionCount / maxCompletions) * 100) : 0;

                return (
                  <div key={quest.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3 mb-3">
                      {questGiver && (
                        <img 
                          src={questGiver.image} 
                          alt={questGiver.name}
                          className="w-12 h-12 rounded-full border-2 border-gray-800"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xl">{quest.icon}</span>
                          <h4 className="font-bold text-sm">{quest.title}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{quest.description}</p>
                        {questGiver && (
                          <p className="text-xs text-blue-600">Quest Giver: {questGiver.name}</p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{completionCount}/{maxCompletions} ({completionPercentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Quest Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleQuestClick(quest)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        View Details
                      </button>
                      {quest.type === 'manual' && (
                        <button
                          onClick={() => completeQuest(quest.id)}
                          className="px-3 py-2 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>

                    {/* Reward Display */}
                    <div className="mt-2 text-xs text-gray-600 flex items-center space-x-1">
                      <span>💰</span>
                      <span>Reward: {quest.reward?.amount || 0} coins</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Student Grid */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">👥 Students</h3>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            + Add Student
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {students.map((student) => {
            const isSelected = selectedStudents.includes(student.id);
            const attendanceStatus = todayAttendance[student.id] || 'unmarked';
            const attendanceColor = {
              present: 'border-green-500 bg-green-50',
              absent: 'border-red-500 bg-red-50',
              late: 'border-yellow-500 bg-yellow-50',
              unmarked: 'border-gray-300 bg-white'
            }[attendanceStatus];

            return (
              <div
                key={student.id}
                className={`relative border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                  isSelected ? 'border-purple-500 bg-purple-50 scale-105' : attendanceColor
                } hover:shadow-lg`}
                onClick={() => showBulkXpPanel && handleStudentSelect(student.id)}
              >
                {/* Selection Indicator */}
                {showBulkXpPanel && (
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                )}

                {/* Attendance Indicator */}
                <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${
                  attendanceStatus === 'present' ? 'bg-green-500' :
                  attendanceStatus === 'absent' ? 'bg-red-500' :
                  attendanceStatus === 'late' ? 'bg-yellow-500' : 'bg-gray-300'
                }`}></div>

                {/* Avatar */}
                <div 
                  className="relative mb-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAvatarClick(student.id);
                  }}
                >
                  <img
                    src={student.avatar || '/avatars/default.png'}
                    alt={student.firstName}
                    className="w-16 h-16 mx-auto rounded-full border-3 border-white shadow-lg hover:scale-110 transition-transform"
                  />
                  
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {student.avatarLevel || 1}
                  </div>

                  {/* XP Animation */}
                  {animatingXP[student.id] && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                        +1 {animatingXP[student.id]}
                      </div>
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 mb-1">{student.firstName}</h4>
                  <div className="text-sm text-gray-600 mb-2">{student.totalPoints || 0} XP</div>
                  
                  {/* Pet Info */}
                  {student.pet && (
                    <div className="text-xs text-gray-500 mb-2">
                      🐾 {student.pet.name || 'Pet'} (Level {student.pet.level || 1})
                    </div>
                  )}
                </div>

                {/* Quick XP Buttons */}
                {!showBulkXpPanel && (
                  <div className="grid grid-cols-3 gap-1 mt-3">
                    {['Respectful', 'Responsible', 'Learner'].map((category) => (
                      <button
                        key={category}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAwardXP(student.id, category);
                        }}
                        className={`p-1 text-xs rounded transition-colors font-medium ${
                          category === 'Respectful' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          category === 'Responsible' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {category.charAt(0)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Student Character Sheet Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                  className="w-full mt-2 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;