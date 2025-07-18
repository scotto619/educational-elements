// StudentsTab.js - Enhanced with Quest Indicators
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
  getAvailableQuests,
  attendanceData,
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
  const [sortBy, setSortBy] = useState('name'); // name, xp, level, quests
  const [filterBy, setFilterBy] = useState('all'); // all, present, absent, has-pet, no-pet, has-quests
  const [viewMode, setViewMode] = useState('grid'); // grid, list, detailed

  // Get today's date for attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData[today] || {};

  // Calculate quest progress for a student
  const getStudentQuestProgress = (student) => {
    const availableQuests = getAvailableQuests ? getAvailableQuests(student) : [];
    const completedToday = activeQuests.filter(quest => 
      quest.completedBy?.includes(student.id) && 
      quest.createdAt?.split('T')[0] === today
    ).length;
    
    return { 
      available: availableQuests.length, 
      completedToday,
      total: activeQuests.length 
    };
  };

  // Get student's attendance status
  const getAttendanceStatus = (studentId) => {
    return todayAttendance[studentId] || 'unmarked';
  };

  // Calculate coins for a student
  const calculateCoins = (student) => {
    const COINS_PER_XP = 5;
    const xpCoins = Math.floor((student.totalPoints || 0) / COINS_PER_XP);
    const bonusCoins = student.coins || 0;
    const spentCoins = student.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - spentCoins);
  };

  // Sort students
  const sortedStudents = [...students].sort((a, b) => {
    switch (sortBy) {
      case 'xp':
        return (b.totalPoints || 0) - (a.totalPoints || 0);
      case 'level':
        return (b.avatarLevel || 1) - (a.avatarLevel || 1);
      case 'quests':
        const aQuests = getStudentQuestProgress(a);
        const bQuests = getStudentQuestProgress(b);
        return bQuests.available - aQuests.available;
      case 'name':
      default:
        return a.firstName.localeCompare(b.firstName);
    }
  });

  // Filter students
  const filteredStudents = sortedStudents.filter(student => {
    const attendanceStatus = getAttendanceStatus(student.id);
    const questProgress = getStudentQuestProgress(student);
    
    switch (filterBy) {
      case 'present':
        return attendanceStatus === 'present';
      case 'absent':
        return attendanceStatus === 'absent';
      case 'has-pet':
        return student.pet?.image;
      case 'no-pet':
        return !student.pet?.image;
      case 'has-quests':
        return questProgress.available > 0;
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Student Management</h2>
          <p className="text-gray-600">
            {filteredStudents.length} of {students.length} students
            {filteredStudents.length !== students.length && ` (filtered)`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            ➕ Add Student
          </button>
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
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="name">Name</option>
                <option value="xp">Total XP</option>
                <option value="level">Level</option>
                <option value="quests">Available Quests</option>
              </select>
            </div>

            {/* Filter Options */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Students</option>
                <option value="present">Present Today</option>
                <option value="absent">Absent Today</option>
                <option value="has-pet">Has Pet</option>
                <option value="no-pet">No Pet</option>
                <option value="has-quests">Has Available Quests</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <div className="flex rounded-lg border border-gray-300">
                {[
                  { id: 'grid', icon: '▦', label: 'Grid' },
                  { id: 'list', icon: '☰', label: 'List' },
                  { id: 'detailed', icon: '📋', label: 'Detailed' }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      viewMode === mode.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title={mode.label}
                  >
                    {mode.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bulk Selection Controls */}
          {selectedStudents.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedStudents.length} selected
              </span>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-blue-600">
              {students.filter(s => getAttendanceStatus(s.id) === 'present').length}
            </div>
            <div className="text-xs text-blue-700">Present Today</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600">
              {students.filter(s => s.pet?.image).length}
            </div>
            <div className="text-xs text-green-700">Have Pets</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-purple-600">
              {students.filter(s => getStudentQuestProgress(s).available > 0).length}
            </div>
            <div className="text-xs text-purple-700">Have Quests</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-600">
              {Math.round(students.reduce((acc, s) => acc + (s.totalPoints || 0), 0) / students.length) || 0}
            </div>
            <div className="text-xs text-yellow-700">Avg XP</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-lg font-bold text-orange-600">
              {activeQuests.reduce((acc, quest) => acc + (quest.completedBy?.length || 0), 0)}
            </div>
            <div className="text-xs text-orange-700">Quests Completed</div>
          </div>
        </div>
      </div>

      {/* Bulk XP Panel */}
      {showBulkXpPanel && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-purple-800 mb-4">Award XP to Multiple Students</h3>
          
          {/* Student Selection */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-purple-700">Select Students:</span>
              <div className="space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Clear All
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

          {/* XP Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
            <div className="flex items-end">
              <button
                onClick={handleBulkXpAward}
                disabled={selectedStudents.length === 0}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                Award XP ({selectedStudents.length} students)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Display */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">
            {students.length === 0 ? 'No Students Added' : 'No Students Match Filter'}
          </h3>
          {students.length === 0 ? (
            <>
              <p className="text-gray-500 mb-6">Get started by adding your first student!</p>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Add Your First Student
              </button>
            </>
          ) : (
            <p className="text-gray-500">Try adjusting your filter settings.</p>
          )}
        </div>
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStudents.map(student => {
                const questProgress = getStudentQuestProgress(student);
                const attendanceStatus = getAttendanceStatus(student.id);
                const coins = calculateCoins(student);
                const isSelected = selectedStudents.includes(student.id);

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl cursor-pointer ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    {/* Student Header */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-800">{student.firstName}</h3>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStudentSelect(student.id)}
                          className="rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Avatar and Basic Info */}
                      <div className="flex items-center space-x-3">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvatarClick(student.id);
                          }}
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
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-blue-600">⭐ Level {student.avatarLevel || 1}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              attendanceStatus === 'present' ? 'bg-green-100 text-green-800' :
                              attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' :
                              attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {attendanceStatus === 'present' ? '✓' :
                               attendanceStatus === 'absent' ? '✗' :
                               attendanceStatus === 'late' ? '⏰' : '?'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {student.totalPoints || 0} XP • 💰 {coins}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quest Progress */}
                    {questProgress.available > 0 && (
                      <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-orange-800">
                            ⚔️ {questProgress.available} Quest{questProgress.available !== 1 ? 's' : ''} Available
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                            }}
                            className="text-xs bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700 transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* XP Award Buttons */}
                    <div className="p-4">
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

                      {/* Pet Info */}
                      {student.pet?.image && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                          <div className="flex items-center space-x-2">
                            <img
                              src={student.pet.image}
                              alt={student.pet.name}
                              className="w-6 h-6 rounded"
                            />
                            <span className="text-sm font-medium text-green-800">
                              {student.pet.name}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Character Sheet Button */}
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        View Character Sheet
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length}
                          onChange={() => {
                            if (selectedStudents.length === students.length) {
                              handleDeselectAll();
                            } else {
                              handleSelectAll();
                            }
                          }}
                          className="rounded"
                        />
                      </th>
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
                    {filteredStudents.map(student => {
                      const questProgress = getStudentQuestProgress(student);
                      const attendanceStatus = getAttendanceStatus(student.id);
                      const coins = calculateCoins(student);
                      const isSelected = selectedStudents.includes(student.id);

                      return (
                        <tr key={student.id} className={isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleStudentSelect(student.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                onClick={() => handleAvatarClick(student.id)}
                                className="flex-shrink-0 h-10 w-10 cursor-pointer"
                              >
                                {student.avatar ? (
                                  <img
                                    className="h-10 w-10 rounded-full"
                                    src={student.avatar}
                                    alt={student.firstName}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-sm">👤</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.firstName}</div>
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
                            <div className="flex items-center space-x-2">
                              <span>{questProgress.completedToday}/{questProgress.total}</span>
                              {questProgress.available > 0 && (
                                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                                  {questProgress.available} available
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.pet?.image ? (
                              <div className="flex items-center space-x-1">
                                <img src={student.pet.image} alt={student.pet.name} className="w-6 h-6" />
                                <span>{student.pet.name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">No pet</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedStudent(student)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </button>
                              {questProgress.available > 0 && (
                                <button
                                  onClick={() => setSelectedStudent(student)}
                                  className="text-orange-600 hover:text-orange-900"
                                >
                                  Quests
                                </button>
                              )}
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

          {/* Detailed View */}
          {viewMode === 'detailed' && (
            <div className="space-y-4">
              {filteredStudents.map(student => {
                const questProgress = getStudentQuestProgress(student);
                const attendanceStatus = getAttendanceStatus(student.id);
                const coins = calculateCoins(student);
                const isSelected = selectedStudents.includes(student.id);

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleStudentSelect(student.id)}
                            className="rounded"
                          />
                          <div
                            onClick={() => handleAvatarClick(student.id)}
                            className="cursor-pointer"
                          >
                            {student.avatar ? (
                              <img
                                src={student.avatar}
                                alt={student.firstName}
                                className="w-20 h-20 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center hover:border-blue-500 transition-colors">
                                <span className="text-3xl">👤</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">{student.firstName}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-blue-600 font-medium">⭐ Level {student.avatarLevel || 1}</span>
                              <span className="text-gray-600">{student.totalPoints || 0} XP</span>
                              <span className="text-yellow-600">💰 {coins} coins</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                attendanceStatus === 'present' ? 'bg-green-100 text-green-800' :
                                attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' :
                                attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {attendanceStatus === 'present' ? '✓ Present' :
                                 attendanceStatus === 'absent' ? '✗ Absent' :
                                 attendanceStatus === 'late' ? '⏰ Late' : '? Unmarked'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Character Sheet
                        </button>
                      </div>

                      {/* Quest Progress */}
                      {questProgress.available > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-orange-800">Available Quests</h4>
                              <p className="text-orange-700">
                                {questProgress.available} quest{questProgress.available !== 1 ? 's' : ''} waiting to be completed
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              View Quests
                            </button>
                          </div>
                        </div>
                      )}

                      {/* XP Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {['Respectful', 'Responsible', 'Learner'].map(category => {
                          const categoryXP = student.categoryTotal?.[category] || 0;
                          return (
                            <div key={category} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-700">
                                  {category === 'Respectful' ? '👍 Respectful' : 
                                   category === 'Responsible' ? '💼 Responsible' : 
                                   '📚 Learner'}
                                </span>
                                <span className="text-lg font-bold text-gray-800">{categoryXP}</span>
                              </div>
                              <button
                                onClick={() => handleAwardXP(student.id, category, 1)}
                                disabled={animatingXP[student.id] === category}
                                className={`w-full px-3 py-1 rounded font-medium transition-all ${
                                  category === 'Respectful' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                  category === 'Responsible' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                  'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                } ${animatingXP[student.id] === category ? 'animate-pulse' : ''}`}
                              >
                                +1 XP
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pet Info */}
                      {student.pet?.image && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={student.pet.image}
                              alt={student.pet.name}
                              className="w-12 h-12 rounded"
                            />
                            <div>
                              <h4 className="font-bold text-green-800">{student.pet.name}</h4>
                              <p className="text-green-700">Companion Pet</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentsTab;