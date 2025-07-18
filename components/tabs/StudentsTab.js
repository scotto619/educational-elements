// StudentsTab.js - Simplified Compact View
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Class Overview</h2>
          <p className="text-gray-600">{students.length} students in your class</p>
        </div>
        
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Student</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round(students.reduce((acc, s) => acc + (s.totalPoints || 0), 0) / students.length) || 0}
          </div>
          <div className="text-sm text-blue-700">Average XP</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {Math.round(students.reduce((acc, s) => acc + calculateCoins(s), 0) / students.length) || 0}
          </div>
          <div className="text-sm text-yellow-700">Average Coins</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {students.filter(s => s.pet?.image).length}
          </div>
          <div className="text-sm text-green-700">Have Pets</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {students.filter(s => getStudentQuestProgress(s) > 0).length}
          </div>
          <div className="text-sm text-purple-700">Have Quests</div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {students.map(student => {
            const questCount = getStudentQuestProgress(student);
            const coins = calculateCoins(student);
            const xp = student.totalPoints || 0;
            const isAnimating = Object.values(animatingXP).some(val => val);

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-200 relative"
              >
                {/* Student Card */}
                <div className="p-4 space-y-3">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={(e) => handleAvatarClickWrapper(student, e)}
                      className="relative group"
                    >
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={`${student.firstName}'s avatar`}
                          className="w-16 h-16 rounded-full border-2 border-gray-300 group-hover:border-blue-500 transition-colors"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                          <span className="text-2xl">👤</span>
                        </div>
                      )}
                      {/* Level indicator */}
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                        {student.avatarLevel || 1}
                      </div>
                    </button>
                    
                    {/* Name */}
                    <h3 className="font-bold text-gray-800 text-center mt-2 truncate w-full text-sm">
                      {student.firstName}
                    </h3>
                  </div>

                  {/* Pet Section */}
                  <div className="flex justify-center">
                    {student.pet?.image ? (
                      <div className="flex items-center space-x-2 bg-green-50 px-2 py-1 rounded-lg">
                        <img
                          src={student.pet.image}
                          alt={student.pet.name}
                          className="w-6 h-6 rounded"
                        />
                        <span className="text-xs font-medium text-green-800 truncate max-w-16">
                          {student.pet.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        No Pet
                      </div>
                    )}
                  </div>

                  {/* Stats Section */}
                  <div className="space-y-2">
                    {/* XP */}
                    <div className="relative">
                      <button
                        onClick={(e) => handleXPClick(student.id, e)}
                        className={`w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-2 transition-colors ${
                          animatingXP[student.id] ? 'animate-pulse bg-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-700">XP</span>
                          <span className="font-bold text-blue-800">{xp}</span>
                        </div>
                      </button>

                      {/* XP Selector Dropdown */}
                      {showXPSelector === student.id && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 space-y-1">
                          {['Respectful', 'Responsible', 'Learner'].map(category => (
                            <div key={category} className="space-y-1">
                              <div className="text-xs font-medium text-gray-600">
                                {category === 'Respectful' ? '👍 Respectful' : 
                                 category === 'Responsible' ? '💼 Responsible' : 
                                 '📚 Learner'}
                              </div>
                              <div className="flex space-x-1">
                                {[1, 2, 5].map(amount => (
                                  <button
                                    key={amount}
                                    onClick={() => handleQuickXP(student.id, category, amount)}
                                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
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

                    {/* Coins */}
                    <button
                      onClick={(e) => handleCoinsClick(student, e)}
                      className="w-full bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-2 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-yellow-700">💰 Coins</span>
                        <span className="font-bold text-yellow-800">{coins}</span>
                      </div>
                    </button>

                    {/* Quests */}
                    <button
                      onClick={handleQuestsClick}
                      className={`w-full border rounded-lg p-2 transition-colors ${
                        questCount > 0 
                          ? 'bg-orange-50 hover:bg-orange-100 border-orange-200' 
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${
                          questCount > 0 ? 'text-orange-700' : 'text-gray-600'
                        }`}>
                          ⚔️ Quests
                        </span>
                        <span className={`font-bold ${
                          questCount > 0 ? 'text-orange-800' : 'text-gray-700'
                        }`}>
                          {questCount}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Click outside to close XP selector */}
      {showXPSelector && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowXPSelector(null)}
        />
      )}

      {/* Helper Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h4 className="font-bold text-blue-800 mb-2">Quick Actions:</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
          <div>
            <span className="font-medium">📸 Avatar:</span> Click to view character sheet
          </div>
          <div>
            <span className="font-medium">⭐ XP:</span> Click to award 1, 2, or 5 points
          </div>
          <div>
            <span className="font-medium">💰 Coins:</span> Click to open shop for student
          </div>
          <div>
            <span className="font-medium">⚔️ Quests:</span> Click to go to quest tab
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;