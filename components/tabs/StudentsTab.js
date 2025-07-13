// StudentsTab.js - FIXED: Coin display and enhanced functionality
import React, { useState, useEffect } from 'react';

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
  QUEST_GIVERS,
  completeQuest,
  attendanceData,
  setSelectedQuestGiver,
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
  handleBulkXpAward,
  calculateCoins
}) => {
  const [sortBy, setSortBy] = useState('name'); // name, xp, level, quests
  const [filterBy, setFilterBy] = useState('all'); // all, present, absent, has-pet, no-pet
  const [viewMode, setViewMode] = useState('grid'); // grid, list, detailed
  const [selectedStudentForQuests, setSelectedStudentForQuests] = useState(null);

  // Get today's date for attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData[today] || {};

  // Calculate quest progress for a student
  const getStudentQuestProgress = (student) => {
    const completedQuests = activeQuests.filter(quest => 
      quest.completedBy.includes(student.id)
    ).length;
    const totalQuests = activeQuests.filter(quest => 
      quest.category !== 'class' // Exclude class-wide quests
    ).length;
    return { completed: completedQuests, total: totalQuests };
  };

  // Get student's attendance status
  const getAttendanceStatus = (studentId) => {
    return todayAttendance[studentId] || 'unmarked';
  };

  // Check which quests a student can complete
  const getAvailableQuests = (student) => {
    return activeQuests.filter(quest => {
      if (quest.completedBy.includes(student.id)) return false;
      if (quest.category === 'class') return false;
      
      // Check if student meets requirements for auto quests
      if (quest.type === 'auto' && quest.requirement) {
        const { type, category, amount } = quest.requirement;
        if (type === 'xp') {
          const categoryPoints = student.categoryWeekly?.[category] || 0;
          return categoryPoints >= amount;
        }
      }
      
      return true;
    });
  };

  // Filter students based on current filter
  const filteredStudents = students.filter(student => {
    const attendanceStatus = getAttendanceStatus(student.id);
    
    switch (filterBy) {
      case 'present':
        return attendanceStatus === 'present';
      case 'absent':
        return ['absent', 'late'].includes(attendanceStatus);
      case 'has-pet':
        return student.pet?.image;
      case 'no-pet':
        return !student.pet?.image;
      default:
        return true;
    }
  });

  // Sort students based on current sort criteria
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'xp':
        return (b.totalPoints || 0) - (a.totalPoints || 0);
      case 'level':
        return (b.avatarLevel || 1) - (a.avatarLevel || 1);
      case 'quests':
        const aQuests = getStudentQuestProgress(a);
        const bQuests = getStudentQuestProgress(b);
        return bQuests.completed - aQuests.completed;
      case 'name':
      default:
        return a.firstName.localeCompare(b.firstName);
    }
  });

  // FIXED: Calculate coins using the proper function
  const getStudentCoins = (student) => {
    return calculateCoins ? calculateCoins(student) : Math.floor((student.totalPoints || 0) / 5);
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Yet</h2>
        <p className="text-gray-700 mb-6">
          Add students to your class to start tracking their progress and awarding XP!
        </p>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Add Your First Student
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">👥 Student Progress</h2>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Student</span>
        </button>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">🔧 Controls & Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="xp">Total XP</option>
              <option value="level">Avatar Level</option>
              <option value="quests">Quests Completed</option>
            </select>
          </div>

          {/* Filter By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter By</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              <option value="present">Present Today</option>
              <option value="absent">Absent/Late Today</option>
              <option value="has-pet">Has Pet</option>
              <option value="no-pet">No Pet Yet</option>
            </select>
          </div>

          {/* View Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
              <option value="detailed">Detailed View</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bulk Actions</label>
            <button
              onClick={() => setShowBulkXpPanel(!showBulkXpPanel)}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                showBulkXpPanel 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {showBulkXpPanel ? 'Cancel Bulk Mode' : 'Bulk XP Mode'}
            </button>
          </div>
        </div>

        {/* Bulk XP Panel */}
        {showBulkXpPanel && (
          <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-3">⭐ Bulk XP Award Mode</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={bulkXpCategory}
                  onChange={(e) => setBulkXpCategory(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="Respectful">Respectful</option>
                  <option value="Responsible">Responsible</option>
                  <option value="Learner">Learner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bulkXpAmount}
                  onChange={(e) => setBulkXpAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSelectAll}
                  className="w-full px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  Select All
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleBulkXpAward}
                  disabled={selectedStudents.length === 0}
                  className={`w-full px-2 py-1 rounded text-sm font-medium ${
                    selectedStudents.length > 0
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Award XP ({selectedStudents.length})
                </button>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Click on students to select them for bulk XP awards. Selected: {selectedStudents.length}
            </p>
          </div>
        )}
      </div>

      {/* Student Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{sortedStudents.length}</div>
          <div className="text-sm text-blue-700">Total Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedStudents.filter(s => getAttendanceStatus(s.id) === 'present').length}
          </div>
          <div className="text-sm text-green-700">Present Today</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sortedStudents.filter(s => s.pet?.image).length}
          </div>
          <div className="text-sm text-purple-700">Have Pets</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {sortedStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
          </div>
          <div className="text-sm text-yellow-700">Total Class XP</div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedStudents.map((student) => {
            const attendanceStatus = getAttendanceStatus(student.id);
            const questProgress = getStudentQuestProgress(student);
            const availableQuests = getAvailableQuests(student);
            const isSelected = selectedStudents.includes(student.id);
            const coins = getStudentCoins(student);

            return (
              <div
                key={student.id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl ${
                  isSelected ? 'ring-4 ring-purple-300 bg-purple-50' : ''
                } ${showBulkXpPanel ? 'cursor-pointer' : ''}`}
                onClick={() => showBulkXpPanel && handleStudentSelect(student.id)}
              >
                {/* Avatar and Basic Info */}
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    {student.avatar ? (
                      <img
                        src={student.avatar}
                        alt={student.firstName}
                        className="w-20 h-20 rounded-full border-4 border-gray-300 object-cover shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(student.id);
                        }}
                      />
                    ) : (
                      <div 
                        className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(student.id);
                        }}
                      >
                        {student.firstName.charAt(0)}
                      </div>
                    )}
                    
                    {/* Pet in corner */}
                    {student.pet?.image && (
                      <img
                        src={student.pet.image}
                        alt="Pet"
                        className="w-8 h-8 absolute -top-1 -right-1 rounded-full border-2 border-white shadow-lg"
                      />
                    )}
                    
                    {/* Level badge */}
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      ⭐{student.avatarLevel}
                    </div>

                    {/* Attendance Status */}
                    <div className={`absolute -top-1 -left-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs ${
                      attendanceStatus === 'present' ? 'bg-green-500' :
                      attendanceStatus === 'absent' ? 'bg-red-500' :
                      attendanceStatus === 'late' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`}>
                      {attendanceStatus === 'present' ? '✓' :
                       attendanceStatus === 'absent' ? '✗' :
                       attendanceStatus === 'late' ? '⏰' : '?'}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mt-2">{student.firstName}</h3>
                  <p className="text-sm text-gray-600">Level {student.avatarLevel} Champion</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-green-50 p-2 rounded text-center">
                    <div className="text-lg font-bold text-green-600">{student.totalPoints || 0}</div>
                    <div className="text-xs text-green-700">Total XP</div>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded text-center">
                    <div className="text-lg font-bold text-yellow-600 flex items-center justify-center">
                      <span className="mr-1">💰</span>
                      {coins}
                    </div>
                    <div className="text-xs text-yellow-700">Coins</div>
                  </div>
                </div>

                {/* Quest Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Quests</span>
                    <span className="text-xs text-gray-500">
                      {questProgress.completed}/{questProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: questProgress.total > 0 ? `${(questProgress.completed / questProgress.total) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* XP Award Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {['Respectful', 'Responsible', 'Learner'].map(category => (
                    <button
                      key={category}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAwardXP(student.id, category, 1);
                      }}
                      disabled={animatingXP[student.id] === category}
                      className={`px-2 py-1 text-xs rounded font-medium transition-all ${
                        category === 'Respectful' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                        category === 'Responsible' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                        'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      } ${animatingXP[student.id] === category ? 'animate-pulse' : ''}`}
                    >
                      {category === 'Respectful' ? '👍' : 
                       category === 'Responsible' ? '💼' : 
                       '📚'}
                    </button>
                  ))}
                </div>

                {/* Available Quests Indicator */}
                {availableQuests.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudentForQuests(student);
                    }}
                    className="w-full mb-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200 transition-colors font-medium"
                  >
                    ⚔️ {availableQuests.length} Quest{availableQuests.length !== 1 ? 's' : ''}
                  </button>
                )}

                {/* Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(student);
                  }}
                  className="w-full mt-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => {
                  const attendanceStatus = getAttendanceStatus(student.id);
                  const questProgress = getStudentQuestProgress(student);
                  const availableQuests = getAvailableQuests(student);
                  const isSelected = selectedStudents.includes(student.id);
                  const coins = getStudentCoins(student);

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-gray-50 ${
                        isSelected ? 'bg-purple-50' : ''
                      } ${showBulkXpPanel ? 'cursor-pointer' : ''}`}
                      onClick={() => showBulkXpPanel && handleStudentSelect(student.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {showBulkXpPanel && (
                            <div className={`mr-3 w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'
                            }`}>
                              {isSelected && '✓'}
                            </div>
                          )}
                          {student.avatar && (
                            <img 
                              src={student.avatar} 
                              alt={student.firstName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.firstName}</div>
                            <div className="text-sm text-gray-500">Level {student.avatarLevel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendanceStatus === 'present' ? 'bg-green-100 text-green-800' :
                          attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' :
                          attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendanceStatus === 'present' ? '✓ Present' :
                           attendanceStatus === 'absent' ? '✗ Absent' :
                           attendanceStatus === 'late' ? '⏰ Late' : '? Unmarked'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.totalPoints || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-1">💰</span>
                          {coins}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ⭐ {student.avatarLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {questProgress.completed}/{questProgress.total}
                        {availableQuests.length > 0 && (
                          <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                            {availableQuests.length} available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.pet?.image ? (
                          <div className="flex items-center">
                            <img src={student.pet.image} alt="Pet" className="w-6 h-6 rounded-full mr-2" />
                            <span className="text-xs">{student.pet.name || 'Pet'}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No pet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAwardXP(student.id, 'Respectful', 1);
                            }}
                            className="text-green-600 hover:text-green-900 text-lg"
                            title="Award Respectful XP"
                          >
                            👍
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAwardXP(student.id, 'Responsible', 1);
                            }}
                            className="text-blue-600 hover:text-blue-900 text-lg"
                            title="Award Responsible XP"
                          >
                            💼
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAwardXP(student.id, 'Learner', 1);
                            }}
                            className="text-purple-600 hover:text-purple-900 text-lg"
                            title="Award Learner XP"
                          >
                            📚
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                            }}
                            className="text-gray-600 hover:text-gray-900 text-sm"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quest Selection Modal */}
      {selectedStudentForQuests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-96 overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ⚔️ Available Quests for {selectedStudentForQuests.firstName}
              </h2>
            </div>

            <div className="space-y-3">
              {getAvailableQuests(selectedStudentForQuests).map((quest, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{quest.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {quest.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{quest.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-600">
                      Reward: {quest.reward} coins
                    </span>
                    <button
                      onClick={() => {
                        completeQuest(quest.id, selectedStudentForQuests.id);
                        setSelectedStudentForQuests(null);
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setSelectedStudentForQuests(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;