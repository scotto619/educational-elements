// StudentsTab.js - Ultra Compact View
import React, { useState } from 'react';

const StudentsTab = ({
  students,
  handleAwardXP,
  handleAvatarClick,
  setSelectedStudent,
  animatingXP,
  setShowAddStudentModal,
  showToast,
  // Quest System Props
  activeQuests,
  getAvailableQuests,
  attendanceData,
  // Shop Props
  calculateCoins,
  // Navigation
  setActiveTab
}) => {
  const [showXPSelector, setShowXPSelector] = useState(null); // studentId when showing XP selector

  // Calculate quest progress for a student
  const getStudentQuestProgress = (student) => {
    const availableQuests = getAvailableQuests ? getAvailableQuests(student) : [];
    return availableQuests.length;
  };

  // Handle XP click to show quick selector
  const handleXPClick = (studentId, event) => {
    event.stopPropagation();
    setShowXPSelector(showXPSelector === studentId ? null : studentId);
  };

  // Handle quick XP award
  const handleQuickXP = (studentId, category, amount) => {
    handleAwardXP(studentId, category, amount);
    setShowXPSelector(null);
  };

  // Handle coins click - go to shop with student selected
  const handleCoinsClick = (student, event) => {
    event.stopPropagation();
    setSelectedStudent(student);
    setActiveTab('shop');
  };

  // Handle quests click - go to quest tab
  const handleQuestsClick = (event) => {
    event.stopPropagation();
    setActiveTab('quests');
  };

  // Handle avatar click to open character sheet
  const handleAvatarClickWrapper = (student, event) => {
    event.stopPropagation();
    setSelectedStudent(student);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Class Overview</h2>
          <p className="text-gray-600">{students.length} students in your class</p>
        </div>
        
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Student</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-blue-600">
            {Math.round(students.reduce((acc, s) => acc + (s.totalPoints || 0), 0) / students.length) || 0}
          </div>
          <div className="text-xs text-blue-700">Average XP</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-yellow-600">
            {Math.round(students.reduce((acc, s) => acc + calculateCoins(s), 0) / students.length) || 0}
          </div>
          <div className="text-xs text-yellow-700">Average Coins</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-green-600">
            {students.filter(s => s.pet?.image).length}
          </div>
          <div className="text-xs text-green-700">Have Pets</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-purple-600">
            {students.filter(s => getStudentQuestProgress(s) > 0).length}
          </div>
          <div className="text-xs text-purple-700">Have Quests</div>
        </div>
      </div>

      {/* Students Grid */}
      {students.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No Students Added</h3>
          <p className="text-gray-500 mb-6">Get started by adding your first student!</p>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Add Your First Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
          {students.map(student => {
            const questCount = getStudentQuestProgress(student);
            const coins = calculateCoins(student);
            const xp = student.totalPoints || 0;

            return (
              <div
                key={student.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 relative"
              >
                {/* Student Card */}
                <div className="p-3 space-y-2">
                  {/* Avatar and Action Buttons */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <button
                        onClick={(e) => handleAvatarClickWrapper(student, e)}
                        className="relative group"
                      >
                        {student.avatar ? (
                          <img
                            src={student.avatar}
                            alt={`${student.firstName}'s avatar`}
                            className="w-12 h-12 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                            <span className="text-lg">👤</span>
                          </div>
                        )}
                      </button>
                      
                      {/* Action buttons positioned around avatar */}
                      <div className="absolute -top-1 -right-1">
                        <button
                          onClick={(e) => handleXPClick(student.id, e)}
                          className={`w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold hover:bg-blue-700 transition-colors ${
                            animatingXP[student.id] ? 'animate-pulse' : ''
                          }`}
                          title={`${xp} XP - Click to award more`}
                        >
                          ⭐
                        </button>
                      </div>
                      
                      <div className="absolute -bottom-1 -right-1">
                        <button
                          onClick={(e) => handleCoinsClick(student, e)}
                          className="w-5 h-5 bg-yellow-600 text-white text-xs rounded-full flex items-center justify-center font-bold hover:bg-yellow-700 transition-colors"
                          title={`${coins} Coins - Click for shop`}
                        >
                          💰
                        </button>
                      </div>
                      
                      <div className="absolute -bottom-1 -left-1">
                        <button
                          onClick={handleQuestsClick}
                          className={`w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold transition-colors ${
                            questCount > 0 
                              ? 'bg-orange-600 hover:bg-orange-700' 
                              : 'bg-gray-400 hover:bg-gray-500'
                          }`}
                          title={`${questCount} Quests - Click for quest tab`}
                        >
                          ⚔️
                        </button>
                      </div>
                    </div>
                    
                    {/* Name */}
                    <h3 className="font-bold text-gray-800 text-center mt-2 text-sm leading-tight">
                      {student.firstName}
                    </h3>
                  </div>

                  {/* Stats Row */}
                  <div className="text-center space-y-1">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Lv.{student.avatarLevel || 1}</span>
                    </div>
                    <div className="flex justify-center items-center space-x-2 text-xs">
                      <span className="bg-blue-100 text-blue-800 px-1 rounded">{xp}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-1 rounded">{coins}</span>
                      <span className={`px-1 rounded ${
                        questCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {questCount}
                      </span>
                    </div>
                  </div>

                  {/* Pet Section */}
                  <div className="text-center">
                    {student.pet?.image ? (
                      <div className="flex items-center justify-center space-x-1 bg-green-50 px-2 py-1 rounded">
                        <img
                          src={student.pet.image}
                          alt={student.pet.name}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs font-medium text-green-800">
                          {student.pet.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">
                        No Pet
                      </div>
                    )}
                  </div>
                </div>

                {/* XP Selector Dropdown - Fixed positioning */}
                {showXPSelector === student.id && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2 space-y-1 min-w-max">
                    {['Respectful', 'Responsible', 'Learner'].map(category => (
                      <div key={category} className="space-y-1">
                        <div className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          {category === 'Respectful' ? '👍 Respectful' : 
                           category === 'Responsible' ? '💼 Responsible' : 
                           '📚 Learner'}
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 5].map(amount => (
                            <button
                              key={amount}
                              onClick={() => handleQuickXP(student.id, category, amount)}
                              className={`px-2 py-1 text-xs rounded transition-colors ${
                                category === 'Respectful' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                category === 'Responsible' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              +{amount}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Click outside to close XP selector */}
      {showXPSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowXPSelector(null)}
        />
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
        <h4 className="font-bold text-blue-800 mb-2 text-sm">Quick Actions:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-blue-700">
          <div>
            <span className="font-medium">📸 Avatar:</span> Character sheet
          </div>
          <div>
            <span className="font-medium">⭐ Blue button:</span> Award XP (1,2,5)
          </div>
          <div>
            <span className="font-medium">💰 Yellow button:</span> Open shop
          </div>
          <div>
            <span className="font-medium">⚔️ Orange button:</span> Quest tab
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;