// components/tabs/StudentsTab.js - Enhanced Students Management
import React, { useState } from 'react';

// ===============================================
// STUDENT TAB COMPONENT
// ===============================================

const StudentsTab = ({ 
  students = [], 
  onAwardXP, 
  onViewDetails,
  onAddStudent 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkXPModal, setShowBulkXPModal] = useState(false);
  const [bulkXPAmount, setBulkXPAmount] = useState(1);
  const [bulkXPReason, setBulkXPReason] = useState('Group Achievement');

  // Utility functions (inline to avoid import issues)
  const getAvatarImage = (avatarBase, level) => {
    if (!avatarBase) return '/avatars/Wizard F/Level 1.png';
    const validLevel = Math.max(1, Math.min(level || 1, 4));
    return `/avatars/${avatarBase}/Level ${validLevel}.png`;
  };

  const calculateAvatarLevel = (totalXP) => {
    if (totalXP >= 300) return 4;
    if (totalXP >= 200) return 3;  
    if (totalXP >= 100) return 2;
    return 1;
  };

  const calculateCoins = (student) => {
    const xpCoins = Math.floor((student?.totalPoints || 0) / 5);
    const bonusCoins = student?.currency || 0;
    const coinsSpent = student?.coinsSpent || 0;
    return Math.max(0, xpCoins + bonusCoins - coinsSpent);
  };

  const getGridClasses = (studentCount) => {
    if (studentCount <= 4) return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
    if (studentCount <= 8) return 'grid grid-cols-2 lg:grid-cols-4 gap-3';
    if (studentCount <= 12) return 'grid grid-cols-3 lg:grid-cols-6 gap-3';
    if (studentCount <= 20) return 'grid grid-cols-4 lg:grid-cols-8 gap-2';
    return 'grid grid-cols-5 lg:grid-cols-10 gap-1';
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || 
      calculateAvatarLevel(student.totalPoints || 0) === parseInt(filterLevel);
    
    return matchesSearch && matchesLevel;
  });

  // Handle student selection for bulk operations
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Handle bulk XP award
  const handleBulkXP = () => {
    if (selectedStudents.length === 0) {
      alert('Please select students first!');
      return;
    }

    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        onAwardXP(student, bulkXPAmount, bulkXPReason);
      }
    });

    setShowBulkXPModal(false);
    clearSelection();
    setBulkXPAmount(1);
    setBulkXPReason('Group Achievement');
  };

  // XP Categories for quick awards
  const xpCategories = [
    { label: 'Respectful', amount: 1, color: 'bg-blue-500', icon: '🤝' },
    { label: 'Responsible', amount: 1, color: 'bg-green-500', icon: '✅' },
    { label: 'Safe', amount: 1, color: 'bg-yellow-500', icon: '🛡️' },
    { label: 'Learner', amount: 1, color: 'bg-purple-500', icon: '📚' },
    { label: 'Star Award', amount: 5, color: 'bg-yellow-600', icon: '⭐' }
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
            </div>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 items-center">
            {selectedStudents.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedStudents.length} selected
                </span>
                <button
                  onClick={() => setShowBulkXPModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Award Bulk XP
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Clear
                </button>
              </>
            )}

            {filteredStudents.length > 1 && selectedStudents.length === 0 && (
              <button
                onClick={selectAllStudents}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
              >
                Select All
              </button>
            )}

            <button
              onClick={onAddStudent}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              + Add Student
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className={getGridClasses(filteredStudents.length)}>
        {filteredStudents.map(student => (
          <StudentCard
            key={student.id}
            student={student}
            onAwardXP={onAwardXP}
            onViewDetails={onViewDetails}
            isSelected={selectedStudents.includes(student.id)}
            onToggleSelection={() => toggleStudentSelection(student.id)}
            xpCategories={xpCategories}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && students.length > 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-600 mb-2">No Champions Found</h2>
          <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterLevel('all');
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Bulk XP Modal */}
      {showBulkXPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Award Bulk XP</h2>
              <p className="text-purple-100">To {selectedStudents.length} selected champions</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  XP Amount
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkXPAmount}
                  onChange={(e) => setBulkXPAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <input
                  type="text"
                  value={bulkXPReason}
                  onChange={(e) => setBulkXPReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Group Project, Class Participation"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowBulkXPModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkXP}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Award XP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Student Card Component
const StudentCard = ({ 
  student, 
  onAwardXP, 
  onViewDetails, 
  isSelected = false, 
  onToggleSelection,
  xpCategories = []
}) => {
  const currentLevel = student.avatarLevel || 1;
  const coins = Math.floor((student?.totalPoints || 0) / 5) + (student?.currency || 0) - (student?.coinsSpent || 0);
  const progressToNext = (student.totalPoints || 0) % 100;

  const getAvatarImage = (avatarBase, level) => {
    if (!avatarBase) return '/avatars/Wizard F/Level 1.png';
    const validLevel = Math.max(1, Math.min(level || 1, 4));
    return `/avatars/${avatarBase}/Level ${validLevel}.png`;
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 border-2 ${
      isSelected ? 'border-purple-500 bg-purple-50' : 'border-blue-100 hover:border-blue-300'
    }`}>
      {/* Selection Checkbox */}
      <div className="flex items-center justify-between mb-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <div className="text-xs text-gray-500">ID: {student.id?.slice(-4)}</div>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-3">
        <div className="relative group cursor-pointer" onClick={() => onViewDetails(student)}>
          <img 
            src={getAvatarImage(student.avatarBase || 'Wizard F', currentLevel)}
            alt={`${student.firstName}'s Avatar`}
            className="w-16 h-16 rounded-full border-3 border-blue-400 shadow-lg group-hover:border-blue-600 transition-all"
            onError={(e) => {
              console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
              e.target.src = '/avatars/Wizard F/Level 1.png';
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
            L{currentLevel}
          </div>
        </div>
        
        <h3 className="text-sm font-bold text-gray-800 mt-2 text-center leading-tight">
          {student.firstName} {student.lastName}
        </h3>
      </div>

      {/* Stats Section */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-600 font-semibold flex items-center">
            ⭐ {student.totalPoints || 0}
          </span>
          <span className="text-yellow-600 font-semibold flex items-center">
            🪙 {Math.max(0, coins)}
          </span>
        </div>
        
        {/* XP Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Level {currentLevel + 1}</span>
            <span>{progressToNext}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Pet Display */}
      {student.ownedPets && student.ownedPets.length > 0 && (
        <div className="flex justify-center mb-3">
          <div className="text-2xl" title={student.ownedPets[0].name}>
            {student.ownedPets[0].emoji}
          </div>
        </div>
      )}

      {/* XP Award Buttons */}
      <div className="grid grid-cols-3 gap-1">
        {xpCategories.slice(0, 3).map(category => (
          <button
            key={category.label}
            onClick={() => onAwardXP(student, category.amount, category.label)}
            className={`${category.color} text-white text-xs py-1 px-2 rounded-lg hover:opacity-80 transition-all font-bold`}
            title={category.label}
          >
            {category.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentsTab;