// StudentsTab.js - Engaging RPG-Style Design
import React, { useState } from 'react';

const StudentsTab = ({
  students,
  handleAwardXP,
  setSelectedStudent,
  animatingXP,
  setShowAddStudentModal,
  showToast,
  // Quest System Props
  activeQuests,
  getAvailableQuests,
  // Shop Props
  calculateCoins,
  // Navigation
  setActiveTab,
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
  const [hoveredStudent, setHoveredStudent] = useState(null);

  // Calculate quest progress for a student
  const getStudentQuestProgress = (student) => {
    const availableQuests = getAvailableQuests ? getAvailableQuests(student) : [];
    return availableQuests.length;
  };

  // Handle coins click - go to shop with student selected
  const handleCoinsClick = (student, event) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedStudent(student);
    setActiveTab('shop');
  };

  // Handle quests click - go to quest tab
  const handleQuestsClick = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setActiveTab('quests');
  };

  // Handle avatar click to open character sheet
  const handleAvatarClickWrapper = (student, event) => {
    event.stopPropagation();
    event.preventDefault();
    setSelectedStudent(student);
  };

  // Get XP progress to next level
  const getXPProgress = (student) => {
    const currentLevel = student.avatarLevel || 1;
    const currentXP = student.totalPoints || 0;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const progressXP = currentXP - xpForCurrentLevel;
    const neededXP = xpForNextLevel - xpForCurrentLevel;
    const percentage = Math.min((progressXP / neededXP) * 100, 100);
    return { percentage, progressXP, neededXP };
  };

  return (
    <div className="space-y-6">
      {/* Epic Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
          <div className="text-8xl opacity-10">🏰</div>
        </div>

      {/* Award XP Panel */}
      {showBulkXpPanel && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-800 mb-4 text-center">⚡ Award Experience Points</h3>
          
          {/* XP Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-purple-700 mb-2">XP Amount</label>
              <input
                type="number"
                min="1"
                max="10"
                value={bulkXpAmount}
                onChange={(e) => {
                  console.log('Setting XP amount:', e.target.value);
                  setBulkXpAmount(parseInt(e.target.value) || 1);
                }}
                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-purple-700 mb-2">Category</label>
              <select
                value={bulkXpCategory}
                onChange={(e) => {
                  console.log('Setting XP category:', e.target.value);
                  setBulkXpCategory(e.target.value);
                }}
                className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Respectful">👍 Respectful</option>
                <option value="Responsible">💼 Responsible</option>
                <option value="Learner">📚 Learner</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-end space-x-2">
              <button
                onClick={() => {
                  console.log('Select All clicked');
                  handleSelectAll();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-bold transition-all"
              >
                Select All
              </button>
              <button
                onClick={() => {
                  console.log('Clear clicked');
                  handleDeselectAll();
                }}
                className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-600 font-bold transition-all"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  console.log('Award XP clicked', { 
                    selectedStudents, 
                    bulkXpAmount, 
                    bulkXpCategory,
                    selectedCount: selectedStudents.length 
                  });
                  if (selectedStudents.length === 0) {
                    showToast('Please select at least one student first!', 'error');
                    return;
                  }
                  handleBulkXpAward();
                }}
                disabled={selectedStudents.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed font-bold transition-all"
              >
                Award XP ({selectedStudents.length} heroes)
              </button>
            </div>
          </div>
          
          {/* Student Selection Grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {students.map(student => (
              <label 
                key={student.id} 
                className={`flex items-center space-x-2 text-sm rounded-lg p-2 border transition-colors cursor-pointer ${
                  selectedStudents.includes(student.id)
                    ? 'bg-purple-100 border-purple-400 text-purple-800'
                    : 'bg-white border-purple-200 text-gray-700 hover:bg-purple-50'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Student checkbox clicked:', student.firstName, student.id);
                  handleStudentSelect(student.id);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    console.log('Checkbox changed for:', student.firstName);
                    handleStudentSelect(student.id);
                  }}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="truncate font-medium">{student.firstName}</span>
              </label>
            ))}
          </div>
        </div>
      )}
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                ⚔️ Champions Guild
              </h2>
              <p className="text-indigo-100 text-lg">{students.length} brave adventurers ready for battle!</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkXpPanel(!showBulkXpPanel)}
                className={`px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 transition-all duration-200 ${
                  showBulkXpPanel 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' 
                    : 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white hover:from-purple-500 hover:to-indigo-600'
                }`}
              >
                <span className="text-lg">⚡</span>
                <span>Award XP</span>
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
              >
                <span className="text-lg">👤</span>
                <span>Recruit Hero</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guild Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Guild Power',
            value: Math.round(students.reduce((acc, s) => acc + (s.totalPoints || 0), 0) / students.length) || 0,
            icon: '⚡',
            gradient: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50'
          },
          {
            title: 'Treasury',
            value: Math.round(students.reduce((acc, s) => acc + calculateCoins(s), 0) / students.length) || 0,
            icon: '💎',
            gradient: 'from-yellow-500 to-orange-500',
            bgGradient: 'from-yellow-50 to-orange-50'
          },
          {
            title: 'Companions',
            value: students.filter(s => s.pet?.image).length,
            icon: '🐲',
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50 to-emerald-50'
          },
          {
            title: 'Active Quests',
            value: students.filter(s => getStudentQuestProgress(s) > 0).length,
            icon: '🗡️',
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-50 to-pink-50'
          }
        ].map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} rounded-xl p-4 border border-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.title}</div>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Heroes Grid */}
      {students.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-12 text-center border border-gray-200">
          <div className="text-8xl mb-6">🏰</div>
          <h3 className="text-3xl font-bold text-gray-700 mb-4">Empty Guild Hall</h3>
          <p className="text-gray-500 mb-8 text-lg">Your guild awaits its first brave heroes!</p>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
          >
            🌟 Recruit Your First Hero
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {students.map(student => {
            const questCount = getStudentQuestProgress(student);
            const coins = calculateCoins(student);
            const xp = student.totalPoints || 0;
            const xpProgress = getXPProgress(student);
            const isHovered = hoveredStudent === student.id;
            const isAnimating = animatingXP[student.id];
            const isSelected = selectedStudents.includes(student.id);

            return (
              <div
                key={student.id}
                className={`relative bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 transform ${
                  isSelected ? 'scale-105 shadow-2xl border-purple-500 bg-gradient-to-b from-purple-50 to-purple-100' :
                  isHovered ? 'scale-105 shadow-2xl border-purple-400' : 'border-gray-200 hover:shadow-xl'
                }`}
                onMouseEnter={() => setHoveredStudent(student.id)}
                onMouseLeave={() => setHoveredStudent(null)}
                onClick={() => showBulkXpPanel && handleStudentSelect(student.id)}
              >
                {/* Hero Card Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-yellow-300/20 to-transparent rounded-bl-full"></div>
                
                {/* Level Badge */}
                <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  Lv.{student.avatarLevel || 1}
                </div>

                {/* Selection Badge for Bulk XP */}
                {isSelected && showBulkXpPanel && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ✓ Selected
                  </div>
                )}

                {/* Hero Card Content */}
                <div className="relative z-10 p-4 space-y-3">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <button
                        onClick={(e) => handleAvatarClickWrapper(student, e)}
                        className="relative group"
                      >
                        {student.avatar ? (
                          <div className="relative">
                            <img
                              src={student.avatar}
                              alt={`${student.firstName}'s avatar`}
                              className={`w-16 h-16 rounded-full border-3 transition-all duration-300 ${
                                isHovered ? 'border-purple-400 shadow-lg' : 'border-gray-300'
                              }`}
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className={`w-16 h-16 rounded-full border-3 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-all duration-300 ${
                            isHovered ? 'border-purple-400' : 'border-gray-300'
                          }`}>
                            <span className="text-2xl">👤</span>
                          </div>
                        )}
                      </button>
                      
                      {/* Action Buttons */}
                      <div className="absolute -top-1 -right-2">
                        <button
                          onClick={(e) => handleXPClick(student.id, e)}
                          className={`w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-full flex items-center justify-center font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg transform hover:scale-110 ${
                            isAnimating ? 'animate-pulse scale-110' : ''
                          }`}
                          title={`${xp} XP - Click to award more`}
                        >
                          ⭐
                        </button>
                      </div>
                      
                      <div className="absolute -bottom-1 -right-2">
                        <button
                          onClick={(e) => handleCoinsClick(student, e)}
                          className="w-7 h-7 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm rounded-full flex items-center justify-center font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg transform hover:scale-110"
                          title={`${coins} Coins - Click for shop`}
                        >
                          💎
                        </button>
                      </div>
                      
                      <div className="absolute -bottom-1 -left-2">
                        <button
                          onClick={handleQuestsClick}
                          className={`w-7 h-7 text-white text-sm rounded-full flex items-center justify-center font-bold transition-all duration-200 shadow-lg transform hover:scale-110 ${
                            questCount > 0 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                          }`}
                          title={`${questCount} Quests - Click for quest tab`}
                        >
                          ⚔️
                        </button>
                      </div>
                    </div>
                    
                    {/* Hero Name */}
                    <h3 className="font-bold text-gray-800 text-center mt-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {student.firstName}
                    </h3>
                  </div>

                  {/* XP Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">XP Progress</span>
                      <span className="text-blue-600 font-bold">{xp}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${student.avatarLevel >= 4 ? 100 : xpProgress.percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-center space-x-2">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-bold">
                      {xp} XP
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs font-bold">
                      {coins} 💎
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                      questCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {questCount} ⚔️
                    </div>
                  </div>

                  {/* Pet Companion */}
                  <div className="text-center">
                    {student.pet?.image ? (
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 px-3 py-2 rounded-lg">
                        <div className="flex items-center justify-center space-x-2">
                          <img
                            src={student.pet.image}
                            alt={student.pet.name}
                            className="w-5 h-5 rounded"
                          />
                          <span className="text-xs font-bold text-green-800">
                            {student.pet.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                        No Companion
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Epic Helper Guide */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 border-2 border-indigo-200 rounded-xl p-4">
        <h4 className="font-bold text-indigo-800 mb-3 text-center">🏆 Hero Management Guide</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg mb-1">👤</div>
            <div className="font-bold text-gray-800">Avatar</div>
            <div className="text-gray-600 text-xs">Character Sheet</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg mb-1">⚡</div>
            <div className="font-bold text-purple-800">Award XP</div>
            <div className="text-purple-600 text-xs">Use panel above</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg mb-1">💎</div>
            <div className="font-bold text-yellow-800">Coins Button</div>
            <div className="text-yellow-600 text-xs">Open Shop</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <div className="text-lg mb-1">⚔️</div>
            <div className="font-bold text-orange-800">Quest Button</div>
            <div className="text-orange-600 text-xs">Quest Tab</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;