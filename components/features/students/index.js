// components/features/students/index.js - Student Management Components
// These focused components handle specific student-related functionality

import React, { useState, useMemo } from 'react';
import { 
  Button, 
  IconButton, 
  Card, 
  XPBadge, 
  LevelProgressBar, 
  CoinDisplay,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useStudents, useBulkSelection, useModals } from '../../../hooks';
import { getAvatarImagePath } from '../../../config/assets';
import { calculateLevel, calculateCoins, GAME_CONFIG } from '../../../config/gameData';

// ===============================================
// STUDENT CARD COMPONENT
// ===============================================

/**
 * Individual Student Card Component
 */
const StudentCard = ({ 
  student, 
  onAwardXP, 
  onStudentClick,
  onAvatarClick,
  isSelected = false,
  onSelect = null,
  showSelection = false,
  animatingXP = null
}) => {
  const [hoveredPet, setHoveredPet] = useState(false);
  
  const level = calculateLevel(student.totalPoints || 0);
  const coins = calculateCoins(student);
  const avatarImage = getAvatarImagePath(student.avatarBase, level);
  
  const isAnimating = animatingXP === student.id;

  return (
    <Card className={`
      transition-all duration-300 hover:shadow-xl cursor-pointer
      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
      ${isAnimating ? 'animate-pulse' : ''}
    `}>
      <div className="space-y-4">
        {/* Selection Checkbox */}
        {showSelection && (
          <div className="flex items-center justify-between">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(student.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="text-xs text-gray-500">Select</div>
          </div>
        )}

        {/* Avatar */}
        <div className="text-center">
          <div 
            className="relative inline-block cursor-pointer group"
            onClick={() => onAvatarClick?.(student)}
          >
            <img
              src={avatarImage}
              alt={`${student.firstName}'s avatar`}
              className="w-20 h-20 rounded-full border-4 border-blue-200 group-hover:border-blue-400 transition-colors"
              onError={(e) => {
                e.target.src = '/Avatars/Wizard F/Level 1.png'; // Fallback
              }}
            />
            
            {/* Level Badge */}
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {level}
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-bold">
                Change
              </span>
            </div>
          </div>
          
          {/* Student Name */}
          <h3 
            className="font-bold text-gray-800 mt-2 cursor-pointer hover:text-blue-600"
            onClick={() => onStudentClick?.(student)}
          >
            {student.firstName} {student.lastName}
          </h3>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <LevelProgressBar 
            currentXP={student.totalPoints || 0}
            nextLevelXP={level < GAME_CONFIG.MAX_LEVEL ? GAME_CONFIG.LEVEL_THRESHOLDS[level] : 0}
            level={level}
            maxLevel={GAME_CONFIG.MAX_LEVEL}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <CoinDisplay amount={coins} size="sm" />
          <div className="text-gray-600">
            {student.totalPoints || 0} XP
          </div>
        </div>

        {/* Pet Display */}
        {student.pet?.image && (
          <div 
            className="flex items-center justify-center"
            onMouseEnter={() => setHoveredPet(true)}
            onMouseLeave={() => setHoveredPet(false)}
          >
            <div className="relative">
              <img
                src={student.pet.image}
                alt={student.pet.name}
                className="w-12 h-12 rounded-lg border-2 border-yellow-200"
              />
              
              {/* Pet Tooltip */}
              {hoveredPet && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                  {student.pet.name}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* XP Award Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {GAME_CONFIG.XP_CATEGORIES.map(category => (
            <Button
              key={category}
              size="sm"
              variant="secondary"
              onClick={() => onAwardXP?.(student.id, category, 1)}
              className="text-xs py-1"
            >
              +1 {category.slice(0, 4)}
            </Button>
          ))}
        </div>

        {/* Recent XP Animation */}
        {isAnimating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
            <XPBadge amount={1} category={animatingXP} isAnimating={true} />
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// STUDENT GRID COMPONENT
// ===============================================

/**
 * Grid Layout for Student Cards
 */
const StudentGrid = ({ 
  students, 
  onAwardXP, 
  onStudentClick,
  onAvatarClick,
  selectedStudents = [],
  onStudentSelect = null,
  showSelection = false,
  animatingXP = null,
  columns = 'auto' // 'auto', 2, 3, 4, 5, 6
}) => {
  const gridClasses = {
    auto: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  if (!students.length) {
    return (
      <EmptyState
        icon="👥"
        title="No students in this class"
        description="Add students to get started with your classroom management."
      />
    );
  }

  return (
    <div className={`grid gap-4 ${gridClasses[columns]}`}>
      {students.map(student => (
        <StudentCard
          key={student.id}
          student={student}
          onAwardXP={onAwardXP}
          onStudentClick={onStudentClick}
          onAvatarClick={onAvatarClick}
          isSelected={selectedStudents.includes(student.id)}
          onSelect={onStudentSelect}
          showSelection={showSelection}
          animatingXP={animatingXP}
        />
      ))}
    </div>
  );
};

// ===============================================
// BULK XP PANEL COMPONENT
// ===============================================

/**
 * Bulk XP Award Panel
 */
const BulkXPPanel = ({ 
  selectedStudents = [],
  students = [],
  onAwardBulkXP,
  onClose
}) => {
  const [xpAmount, setXpAmount] = useState(1);
  const [category, setCategory] = useState('Respectful');
  const [isAwarding, setIsAwarding] = useState(false);

  const selectedCount = selectedStudents.length;
  const selectedStudentNames = students
    .filter(s => selectedStudents.includes(s.id))
    .map(s => `${s.firstName} ${s.lastName}`)
    .join(', ');

  const handleAward = async () => {
    setIsAwarding(true);
    try {
      await onAwardBulkXP(selectedStudents, category, xpAmount);
      onClose();
    } catch (error) {
      console.error('Error awarding bulk XP:', error);
    } finally {
      setIsAwarding(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-40 shadow-2xl border-blue-500">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">
            Award XP to {selectedCount} student{selectedCount !== 1 ? 's' : ''}
          </h3>
          <IconButton
            icon="×"
            onClick={onClose}
            variant="ghost"
          />
        </div>

        {/* Selected Students */}
        <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
          <strong>Selected:</strong> {selectedStudentNames}
        </div>

        {/* XP Controls */}
        <div className="grid grid-cols-3 gap-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <select
              value={xpAmount}
              onChange={(e) => setXpAmount(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 5, 10].map(amount => (
                <option key={amount} value={amount}>+{amount} XP</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {GAME_CONFIG.XP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Action */}
          <div className="flex items-end">
            <Button
              onClick={handleAward}
              loading={isAwarding}
              className="w-full"
            >
              Award XP
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// STUDENT SEARCH AND FILTER COMPONENT
// ===============================================

/**
 * Search and Filter Controls
 */
const StudentSearchFilter = ({ 
  students,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  selectedStudents = [],
  onSelectAll,
  onDeselectAll,
  showBulkControls = false
}) => {
  const sortOptions = [
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'nameDesc', label: 'Name (Z-A)' },
    { value: 'xp', label: 'XP (High to Low)' },
    { value: 'xpDesc', label: 'XP (Low to High)' },
    { value: 'level', label: 'Level (High to Low)' },
    { value: 'coins', label: 'Coins (High to Low)' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'level1', label: 'Level 1' },
    { value: 'level2', label: 'Level 2' },
    { value: 'level3', label: 'Level 3' },
    { value: 'level4', label: 'Level 4' },
    { value: 'hasPet', label: 'Has Pet' },
    { value: 'noPet', label: 'No Pet' }
  ];

  const allSelected = students.length > 0 && selectedStudents.length === students.length;
  const someSelected = selectedStudents.length > 0 && selectedStudents.length < students.length;

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search students by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Selection Controls */}
          {showBulkControls && (
            <div className="flex items-center space-x-2 ml-auto">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectAll();
                  } else {
                    onDeselectAll();
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm font-medium text-gray-700">
                Select All ({selectedStudents.length})
              </label>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// STUDENT STATISTICS COMPONENT
// ===============================================

/**
 * Class Statistics Overview
 */
const StudentStats = ({ students }) => {
  const stats = useMemo(() => {
    if (!students.length) return null;

    const totalStudents = students.length;
    const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
    const averageXP = Math.round(totalXP / totalStudents);
    
    const levelCounts = students.reduce((acc, s) => {
      const level = calculateLevel(s.totalPoints || 0);
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {});

    const studentsWithPets = students.filter(s => s.pet?.image).length;
    const totalCoins = students.reduce((sum, s) => sum + calculateCoins(s), 0);

    return {
      totalStudents,
      totalXP,
      averageXP,
      levelCounts,
      studentsWithPets,
      totalCoins
    };
  }, [students]);

  if (!stats) return null;

  return (
    <Card title="Class Overview" className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
          <div className="text-sm text-blue-700">Total Students</div>
        </div>
        
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.totalXP.toLocaleString()}</div>
          <div className="text-sm text-purple-700">Total XP</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.averageXP}</div>
          <div className="text-sm text-green-700">Average XP</div>
        </div>
        
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.studentsWithPets}</div>
          <div className="text-sm text-yellow-700">Have Pets</div>
        </div>
      </div>

      {/* Level Distribution */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-3">Level Distribution</h4>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map(level => (
            <div key={level} className="text-center p-2 bg-gray-50 rounded">
              <div className="font-bold text-lg">{stats.levelCounts[level] || 0}</div>
              <div className="text-xs text-gray-600">Level {level}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// MAIN STUDENTS TAB COMPONENT
// ===============================================

/**
 * Complete Students Tab using smaller components
 */
const StudentsTab = ({ 
  userId, 
  classId, 
  onStudentClick,
  onAvatarClick 
}) => {
  const { students, loading, awardXP, bulkAwardXP } = useStudents(userId, classId);
  const { selectedItems: selectedStudents, ...selection } = useBulkSelection(students);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const [showBulkXP, setShowBulkXP] = useState(false);
  const [animatingXP, setAnimatingXP] = useState(null);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'level1':
      case 'level2':
      case 'level3':
      case 'level4':
        const targetLevel = parseInt(filterBy.slice(-1));
        filtered = filtered.filter(s => calculateLevel(s.totalPoints || 0) === targetLevel);
        break;
      case 'hasPet':
        filtered = filtered.filter(s => s.pet?.image);
        break;
      case 'noPet':
        filtered = filtered.filter(s => !s.pet?.image);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`));
        break;
      case 'xp':
        filtered.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
        break;
      case 'xpDesc':
        filtered.sort((a, b) => (a.totalPoints || 0) - (b.totalPoints || 0));
        break;
      case 'level':
        filtered.sort((a, b) => calculateLevel(b.totalPoints || 0) - calculateLevel(a.totalPoints || 0));
        break;
      case 'coins':
        filtered.sort((a, b) => calculateCoins(b) - calculateCoins(a));
        break;
    }

    return filtered;
  }, [students, searchTerm, sortBy, filterBy]);

  // Handle XP award with animation
  const handleAwardXP = async (studentId, category, amount) => {
    setAnimatingXP(studentId);
    try {
      await awardXP(studentId, category, amount);
    } finally {
      setTimeout(() => setAnimatingXP(null), 600);
    }
  };

  // Handle bulk XP award
  const handleBulkAwardXP = async (studentIds, category, amount) => {
    await bulkAwardXP(studentIds, category, amount);
    selection.deselectAll();
    setShowBulkXP(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Statistics */}
      <StudentStats students={students} />

      {/* Search and Controls */}
      <StudentSearchFilter
        students={filteredStudents}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterBy={filterBy}
        onFilterChange={setFilterBy}
        selectedStudents={selectedStudents}
        onSelectAll={() => {
          selection.selectAll();
          setShowBulkXP(true);
        }}
        onDeselectAll={() => {
          selection.deselectAll();
          setShowBulkXP(false);
        }}
        showBulkControls={true}
      />

      {/* Student Grid */}
      <StudentGrid
        students={filteredStudents}
        onAwardXP={handleAwardXP}
        onStudentClick={onStudentClick}
        onAvatarClick={onAvatarClick}
        selectedStudents={selectedStudents}
        onStudentSelect={(studentId, selected) => {
          selection.selectItem(studentId);
          setShowBulkXP(selectedStudents.length > 0 || selected);
        }}
        showSelection={showBulkXP}
        animatingXP={animatingXP}
      />

      {/* Bulk XP Panel */}
      {showBulkXP && (
        <BulkXPPanel
          selectedStudents={selectedStudents}
          students={students}
          onAwardBulkXP={handleBulkAwardXP}
          onClose={() => {
            setShowBulkXP(false);
            selection.deselectAll();
          }}
        />
      )}
    </div>
  );
};

// Export all components
export {
  StudentCard,
  StudentGrid,
  BulkXPPanel,
  StudentSearchFilter,
  StudentStats,
  StudentsTab
};