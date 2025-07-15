// StudentsTab.js - ClassDojo-Style Layout with Victory Celebration
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
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedStudentForXP, setSelectedStudentForXP] = useState(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [victoryData, setVictoryData] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get today's date for attendance
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendanceData[today] || {};

  // Get student's attendance status
  const getAttendanceStatus = (studentId) => {
    return todayAttendance[studentId] || 'unmarked';
  };

  // Calculate coins for a student
  const getStudentCoins = (student) => {
    const COINS_PER_XP = 5;
    return Math.max(0, Math.floor((student?.totalPoints || 0) / COINS_PER_XP) + (student?.coins || 0) - (student?.coinsSpent || 0));
  };

  // Sort and filter students
  const sortedAndFilteredStudents = React.useMemo(() => {
    let filtered = [...students];

    // Apply filters
    if (filterBy === 'present') {
      filtered = filtered.filter(s => getAttendanceStatus(s.id) === 'present');
    } else if (filterBy === 'absent') {
      filtered = filtered.filter(s => getAttendanceStatus(s.id) !== 'present');
    } else if (filterBy === 'has-pet') {
      filtered = filtered.filter(s => s.pet?.image);
    } else if (filterBy === 'no-pet') {
      filtered = filtered.filter(s => !s.pet?.image);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.firstName.localeCompare(b.firstName);
      } else if (sortBy === 'xp') {
        return (b.totalPoints || 0) - (a.totalPoints || 0);
      } else if (sortBy === 'level') {
        return (b.avatarLevel || 1) - (a.avatarLevel || 1);
      }
      return 0;
    });

    return filtered;
  }, [students, sortBy, filterBy, todayAttendance]);

  // Handle student click for XP selection
  const handleStudentClick = (student) => {
    if (showBulkXpPanel) {
      handleStudentSelect(student.id);
    } else {
      setSelectedStudentForXP(student);
    }
  };

  // Handle XP award with victory celebration
  const handleXPAward = (category, amount = 1) => {
    if (!selectedStudentForXP) return;

    // Award the XP
    handleAwardXP(selectedStudentForXP.id, category, amount);

    // Show victory modal
    setVictoryData({
      student: selectedStudentForXP,
      category,
      amount,
      reason: getCategoryReason(category)
    });
    setShowVictoryModal(true);
    setShowConfetti(true);

    // Close XP selection modal
    setSelectedStudentForXP(null);

    // Hide victory modal after 6 seconds
    setTimeout(() => {
      setShowVictoryModal(false);
      setShowConfetti(false);
    }, 6000);
  };

  // Get category reason text
  const getCategoryReason = (category) => {
    const reasons = {
      'Respectful': 'for showing respect and kindness!',
      'Responsible': 'for being responsible and organized!',
      'Learner': 'for great learning and effort!'
    };
    return reasons[category] || 'for being awesome!';
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'Respectful': 'bg-green-500',
      'Responsible': 'bg-blue-500',
      'Learner': 'bg-purple-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  // Generate confetti elements
  const confettiElements = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 animate-bounce ${
        ['bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-red-400', 'bg-purple-400'][i % 5]
      }`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    />
  ));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            🎓 My Students
          </h2>
          <p className="text-gray-600 mt-1">
            Click on students to award XP points and celebrate their achievements!
          </p>
        </div>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          + Add Student
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Sort and Filter */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="xp">Total XP</option>
                <option value="level">Avatar Level</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter By</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Students</option>
                <option value="present">Present Today</option>
                <option value="absent">Absent/Late Today</option>
                <option value="has-pet">Has Pet</option>
                <option value="no-pet">No Pet Yet</option>
              </select>
            </div>
          </div>

          {/* Bulk XP Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkXpPanel(!showBulkXpPanel)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showBulkXpPanel 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              {showBulkXpPanel ? 'Exit Bulk Mode' : 'Bulk XP Mode'}
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
          <div className="text-2xl font-bold text-blue-600">{sortedAndFilteredStudents.length}</div>
          <div className="text-sm text-blue-700">Total Students</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedAndFilteredStudents.filter(s => getAttendanceStatus(s.id) === 'present').length}
          </div>
          <div className="text-sm text-green-700">Present Today</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {sortedAndFilteredStudents.filter(s => s.pet?.image).length}
          </div>
          <div className="text-sm text-purple-700">Have Pets</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {sortedAndFilteredStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
          </div>
          <div className="text-sm text-yellow-700">Total Class XP</div>
        </div>
      </div>

      {/* Students Grid - ClassDojo Style */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
        {sortedAndFilteredStudents.map((student) => {
          const attendanceStatus = getAttendanceStatus(student.id);
          const isSelected = selectedStudents.includes(student.id);
          const coins = getStudentCoins(student);
          const isAnimating = animatingXP[student.id];

          return (
            <div
              key={student.id}
              className={`bg-white rounded-xl shadow-md p-3 transition-all duration-300 cursor-pointer hover:shadow-lg transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-purple-300 bg-purple-50' : ''
              } ${isAnimating ? 'animate-pulse' : ''}`}
              onClick={() => handleStudentClick(student)}
            >
              {/* Selection Indicator */}
              {showBulkXpPanel && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${
                  isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && <span className="text-white text-xs">✓</span>}
                </div>
              )}

              {/* Attendance Status Indicator */}
              <div className={`absolute top-1 left-1 w-2 h-2 rounded-full ${
                attendanceStatus === 'present' ? 'bg-green-500' :
                attendanceStatus === 'absent' ? 'bg-red-500' :
                attendanceStatus === 'late' ? 'bg-yellow-500' : 'bg-gray-300'
              }`}></div>

              {/* Avatar - Main Focus */}
              <div className="text-center mb-2">
                <div className="relative inline-block">
                  {student.avatar ? (
                    <img 
                      src={student.avatar} 
                      alt={student.firstName}
                      className="w-12 h-12 rounded-full mx-auto border-2 border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-lg">
                      👤
                    </div>
                  )}
                  
                  {/* Level Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {student.avatarLevel || 1}
                  </div>
                </div>
              </div>

              {/* Student Name */}
              <h3 className="font-bold text-gray-800 text-center text-xs mb-1 truncate">
                {student.firstName}
              </h3>

              {/* XP Display */}
              <div className="text-center mb-1">
                <div className="text-sm font-bold text-blue-600">
                  {student.totalPoints || 0}
                </div>
                <div className="text-xs text-blue-700">XP</div>
              </div>

              {/* Coins Display */}
              <div className="text-center mb-1">
                <div className="text-xs font-bold text-yellow-600">
                  💰 {coins}
                </div>
              </div>

              {/* Pet Display */}
              {student.pet?.image && (
                <div className="text-center mb-1">
                  <img 
                    src={student.pet.image} 
                    alt="Pet" 
                    className="w-4 h-4 rounded-full mx-auto"
                  />
                </div>
              )}

              {/* Quick Actions (only in non-bulk mode) */}
              {!showBulkXpPanel && (
                <div className="flex justify-center mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student);
                    }}
                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                  >
                    Details
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedAndFilteredStudents.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎒</div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">No Students Found</h3>
          <p className="text-gray-500 mb-4">
            {filterBy === 'all' 
              ? 'Add your first student to get started!' 
              : 'No students match your current filter.'
            }
          </p>
          {filterBy === 'all' && (
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              + Add Your First Student
            </button>
          )}
        </div>
      )}

      {/* XP Award Modal */}
      {selectedStudentForXP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-5">
              {/* Student Info */}
              <div className="text-center mb-5">
                <div className="mb-3">
                  {selectedStudentForXP.avatar ? (
                    <img 
                      src={selectedStudentForXP.avatar} 
                      alt={selectedStudentForXP.firstName}
                      className="w-16 h-16 rounded-full mx-auto border-4 border-gray-200 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedStudentForXP.firstName}
                </h2>
                <p className="text-gray-600 text-sm">
                  Choose why they deserve XP!
                </p>
              </div>

              {/* XP Categories */}
              <div className="space-y-2">
                <button
                  onClick={() => handleXPAward('Respectful')}
                  className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <span>👍</span>
                  <span>Respectful</span>
                </button>
                <button
                  onClick={() => handleXPAward('Responsible')}
                  className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <span>💼</span>
                  <span>Responsible</span>
                </button>
                <button
                  onClick={() => handleXPAward('Learner')}
                  className="w-full p-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <span>📚</span>
                  <span>Learner</span>
                </button>
              </div>

              {/* Multiple Points Option */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">Award Multiple Points</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[2, 3, 5].map(amount => (
                    <button
                      key={amount}
                      onClick={() => handleXPAward('Respectful', amount)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors font-medium text-xs"
                    >
                      +{amount} Respectful
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedStudentForXP(null)}
                className="w-full mt-3 p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {showVictoryModal && victoryData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiElements}
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-bounce">
            <div className={`${getCategoryColor(victoryData.category)} text-white rounded-t-xl p-6 text-center`}>
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">
                Amazing Work!
              </h2>
              <p className="text-base opacity-90">
                {victoryData.student.firstName} earned {victoryData.amount} XP!
              </p>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-4">
                {victoryData.student.avatar ? (
                  <img 
                    src={victoryData.student.avatar} 
                    alt={victoryData.student.firstName}
                    className="w-20 h-20 rounded-full mx-auto border-4 border-gray-200 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto bg-gray-200 flex items-center justify-center text-3xl">
                    👤
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {victoryData.student.firstName}
              </h3>
              
              <p className="text-base text-gray-600 mb-3">
                {victoryData.reason}
              </p>
              
              <div className={`inline-flex items-center px-3 py-2 ${getCategoryColor(victoryData.category)} text-white rounded-full font-bold`}>
                <span className="mr-2">
                  {victoryData.category === 'Respectful' ? '👍' : 
                   victoryData.category === 'Responsible' ? '💼' : '📚'}
                </span>
                +{victoryData.amount} {victoryData.category}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;