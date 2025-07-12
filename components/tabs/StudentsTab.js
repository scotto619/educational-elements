// StudentsTab.js - ENHANCED with Quest Progress Integration
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
  handleBulkXpAward
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
        if (type === 'attendance') {
          const attendance = getAttendanceStatus(student.id);
          return attendance === 'present';
        }
      }
      
      return quest.type === 'manual';
    });
  };

  // Sort and filter students
  const getSortedFilteredStudents = () => {
    let filteredStudents = [...students];

    // Apply filters
    switch (filterBy) {
      case 'present':
        filteredStudents = filteredStudents.filter(s => 
          getAttendanceStatus(s.id) === 'present'
        );
        break;
      case 'absent':
        filteredStudents = filteredStudents.filter(s => 
          ['absent', 'late'].includes(getAttendanceStatus(s.id))
        );
        break;
      case 'has-pet':
        filteredStudents = filteredStudents.filter(s => s.pet?.image);
        break;
      case 'no-pet':
        filteredStudents = filteredStudents.filter(s => !s.pet?.image);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'xp':
        filteredStudents.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        break;
      case 'level':
        filteredStudents.sort((a, b) => (b.avatarLevel || 1) - (a.avatarLevel || 1));
        break;
      case 'quests':
        filteredStudents.sort((a, b) => {
          const aProgress = getStudentQuestProgress(a);
          const bProgress = getStudentQuestProgress(b);
          return bProgress.completed - aProgress.completed;
        });
        break;
      default: // name
        filteredStudents.sort((a, b) => a.firstName.localeCompare(b.firstName));
    }

    return filteredStudents;
  };

  const getQuestGiver = (questGiverId) => {
    return QUEST_GIVERS.find(qg => qg.id === questGiverId);
  };

  const handleCompleteQuestForStudent = (questId, studentId) => {
    completeQuest(questId, studentId);
    showToast('Quest completed!');
  };

  if (students.length === 0) {
    return (
      <div className="animate-fade-in text-center py-16">
        <div className="text-6xl mb-6">👥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students in Class</h2>
        <p className="text-gray-600 mb-8">Add students to start tracking their quest progress and achievements.</p>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Add Your First Student
        </button>
      </div>
    );
  }

  const sortedStudents = getSortedFilteredStudents();

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="text-3xl mr-3">👥</span>
            Students ({sortedStudents.length})
          </h2>
          <p className="text-gray-600 mt-2">Track individual progress, quests, and achievements</p>
        </div>

        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          + Add Student
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="xp">Total XP</option>
              <option value="level">Avatar Level</option>
              <option value="quests">Quest Progress</option>
            </select>
          </div>

          {/* Filter By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter By</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-2 py-1 border border-gray-700 rounded text-sm"
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
                  onChange={(e) => setBulkXpAmount(parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-700 rounded text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSelectAll}
                  className="w-full px-3 py-1 bg-purple-200 text-purple-800 rounded text-sm hover:bg-purple-300 transition-colors"
                >
                  Select All
                </button>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleBulkXpAward}
                  disabled={selectedStudents.length === 0}
                  className="w-full px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  Award ({selectedStudents.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Students Display */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedStudents.map((student) => {
            const isSelected = selectedStudents.includes(student.id);
            const attendanceStatus = getAttendanceStatus(student.id);
            const questProgress = getStudentQuestProgress(student);
            const availableQuests = getAvailableQuests(student);
            
            const attendanceColor = {
              present: 'border-green-500 bg-green-50',
              absent: 'border-red-500 bg-red-50',
              late: 'border-yellow-500 bg-yellow-50',
              unmarked: 'border-gray-700 bg-white'
            }[attendanceStatus];

            return (
              <div
                key={student.id}
                className={`relative border-2 rounded-xl p-4 transition-all duration-200 ${
                  isSelected ? 'border-purple-500 bg-purple-50 scale-105' : attendanceColor
                } hover:shadow-lg ${showBulkXpPanel ? 'cursor-pointer' : ''}`}
                onClick={() => showBulkXpPanel && handleStudentSelect(student.id)}
              >
                {/* Selection Indicator */}
                {showBulkXpPanel && (
                  <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-700 bg-white'
                  }`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                )}

                {/* Attendance & Quest Indicators */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  <div className={`w-3 h-3 rounded-full ${
                    attendanceStatus === 'present' ? 'bg-green-500' :
                    attendanceStatus === 'absent' ? 'bg-red-500' :
                    attendanceStatus === 'late' ? 'bg-yellow-500' : 'bg-gray-700'
                  }`} title={`Attendance: ${attendanceStatus}`}></div>
                  {availableQuests.length > 0 && (
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" title={`${availableQuests.length} quests available`}></div>
                  )}
                </div>

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
                  
                  {/* Quest Progress */}
                  <div className="text-xs text-blue-600 mb-2">
                    ⚔️ {questProgress.completed}/{questProgress.total} quests
                  </div>
                  
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

                {/* Quest Button */}
                {availableQuests.length > 0 && !showBulkXpPanel && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudentForQuests(student);
                    }}
                    className="w-full mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors animate-pulse"
                  >
                    ⚔️ {availableQuests.length} Quest{availableQuests.length > 1 ? 's' : ''}
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
                              isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <span className="text-white text-xs">✓</span>}
                            </div>
                          )}
                          <img 
                            src={student.avatar || '/avatars/default.png'} 
                            alt={student.firstName}
                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                          />
                          <div className="ml-3">
                            <div className="font-semibold text-gray-900">{student.firstName}</div>
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
                          {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.totalPoints || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Level {student.avatarLevel || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{questProgress.completed}/{questProgress.total}</span>
                          {availableQuests.length > 0 && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {availableQuests.length} available
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.pet ? (
                          <span>🐾 {student.pet.name || 'Pet'}</span>
                        ) : (
                          <span className="text-gray-400">No pet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {availableQuests.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentForQuests(student);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Quests
                          </button>
                        )}
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
          {sortedStudents.map((student) => {
            const attendanceStatus = getAttendanceStatus(student.id);
            const questProgress = getStudentQuestProgress(student);
            const availableQuests = getAvailableQuests(student);
            const completedQuests = activeQuests.filter(quest => 
              quest.completedBy.includes(student.id)
            );
            const isSelected = selectedStudents.includes(student.id);

            return (
              <div 
                key={student.id} 
                className={`bg-white rounded-xl shadow-lg p-6 ${
                  isSelected ? 'ring-2 ring-purple-500' : ''
                } ${showBulkXpPanel ? 'cursor-pointer' : ''}`}
                onClick={() => showBulkXpPanel && handleStudentSelect(student.id)}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Student Info */}
                  <div className="flex items-center space-x-4">
                    {showBulkXpPanel && (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    )}
                    <div className="relative">
                      <img 
                        src={student.avatar || '/avatars/default.png'} 
                        alt={student.firstName}
                        className="w-16 h-16 rounded-full border-3 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarClick(student.id);
                        }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {student.avatarLevel || 1}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{student.firstName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{student.totalPoints || 0} XP</span>
                        <span className={`px-2 py-1 rounded ${
                          attendanceStatus === 'present' ? 'bg-green-100 text-green-800' :
                          attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' :
                          attendanceStatus === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1)}
                        </span>
                      </div>
                      {student.pet && (
                        <div className="text-sm text-gray-600 mt-1">
                          🐾 {student.pet.name || 'Pet'} (Level {student.pet.level || 1})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quest Progress */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">⚔️ Quest Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed Quests</span>
                        <span className="font-semibold">{questProgress.completed}/{questProgress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: questProgress.total > 0 
                              ? `${Math.round((questProgress.completed / questProgress.total) * 100)}%` 
                              : '0%' 
                          }}
                        ></div>
                      </div>
                      {availableQuests.length > 0 && (
                        <div className="text-sm text-blue-600">
                          {availableQuests.length} quest{availableQuests.length > 1 ? 's' : ''} available to complete
                        </div>
                      )}
                    </div>

                    {/* Recent Completed Quests */}
                    {completedQuests.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Recent Completions:</div>
                        <div className="space-y-1">
                          {completedQuests.slice(0, 3).map(quest => {
                            const questGiver = getQuestGiver(quest.questGiver);
                            return (
                              <div key={quest.id} className="flex items-center space-x-2 text-xs">
                                <span>{quest.icon}</span>
                                <span className="text-gray-600">{quest.title}</span>
                                {questGiver && (
                                  <img 
                                    src={questGiver.image} 
                                    alt={questGiver.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      View Character Sheet
                    </button>
                    
                    {availableQuests.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForQuests(student);
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold animate-pulse"
                      >
                        ⚔️ Complete {availableQuests.length} Quest{availableQuests.length > 1 ? 's' : ''}
                      </button>
                    )}

                    {!showBulkXpPanel && (
                      <div className="grid grid-cols-3 gap-1">
                        {['Respectful', 'Responsible', 'Learner'].map((category) => (
                          <button
                            key={category}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAwardXP(student.id, category);
                            }}
                            className={`p-2 text-xs rounded transition-colors font-medium ${
                              category === 'Respectful' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                              category === 'Responsible' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                              'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            }`}
                          >
                            +1 {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Quest Modal */}
      {selectedStudentForQuests && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  ⚔️ {selectedStudentForQuests.firstName}'s Available Quests
                </h2>
                <button 
                  onClick={() => setSelectedStudentForQuests(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-4">
                {getAvailableQuests(selectedStudentForQuests).map(quest => {
                  const questGiver = getQuestGiver(quest.questGiver);
                  
                  return (
                    <div key={quest.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        {questGiver && (
                          <img 
                            src={questGiver.image} 
                            alt={questGiver.name}
                            className="w-12 h-12 rounded-full border-2 border-gray-300 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xl">{quest.icon}</span>
                            <h3 className="font-bold">{quest.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded ${
                              quest.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              quest.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {quest.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{quest.description}</p>
                          {questGiver && (
                            <p className="text-xs text-blue-600 mb-3">Quest Giver: {questGiver.name}</p>
                          )}
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              💰 Reward: {quest.reward?.amount || 0} coins
                            </div>
                            <button
                              onClick={() => {
                                handleCompleteQuestForStudent(quest.id, selectedStudentForQuests.id);
                                setSelectedStudentForQuests(null);
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                              Complete Quest
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;