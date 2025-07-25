// components/tabs/StudentsTab.js - COMPLETELY REDESIGNED for Enhanced Experience
import React, { useState, useEffect } from 'react';

// Import Phase 3 utilities and constants
import { 
  DEFAULT_XP_CATEGORIES, 
  GAME_CONFIG, 
  AVAILABLE_AVATARS 
} from '../../constants/gameData';

import { 
  calculateCoins, 
  getGridClasses, 
  calculateOptimalGrid,
  shouldReceivePet,
  studentOwnsAvatar,
  createNewPet,
  playPetUnlockSound
} from '../../utils/gameUtils';

import { 
  getAvatarImage, 
  calculateAvatarLevel 
} from '../../utils/avatarFixes';

import { useImagePreview } from '../modals/ImagePreviewModal';
import XPAwardModal from '../modals/XPAwardModal';

const StudentsTab = ({ 
  // Student management from hook
  students, 
  setStudents,
  selectedStudent,
  setSelectedStudent,
  selectedStudents,
  setSelectedStudents,
  toggleStudentSelection,
  selectAllStudents,
  clearSelection,
  awardXP,
  awardBulkXP,
  awardCoins,
  awardBulkCoins,
  addStudent,
  fixAllStudentData,
  
  // Modal states
  showAddStudentModal,
  setShowAddStudentModal,
  levelUpData,
  setLevelUpData,
  petUnlockData,
  setPetUnlockData,
  
  // Utility functions
  saveStudentsToFirebase,
  showToast,
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  
  // Other required props
  currentClassId,
  user
}) => {
  // Local state
  const [xpCategories, setXpCategories] = useState(DEFAULT_XP_CATEGORIES);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showBulkCoinsModal, setShowBulkCoinsModal] = useState(false);
  const [bulkCoinAmount, setBulkCoinAmount] = useState(5);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'compact'
  const [filterLevel, setFilterLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Image preview hook
  const { 
    showPreview, 
    hidePreview, 
    PreviewComponent 
  } = useImagePreview();

  // ===============================================
  // STUDENT FILTERING AND SORTING
  // ===============================================

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || (student.avatarLevel || 1) === parseInt(filterLevel);
    return matchesSearch && matchesLevel;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    return (b.totalPoints || 0) - (a.totalPoints || 0);
  });

  // ===============================================
  // XP AND COIN AWARD HANDLERS
  // ===============================================

  const handleQuickXPAward = (student, amount = 1) => {
    // For single student quick awards, use default category
    const defaultCategory = xpCategories.find(cat => cat.label === 'Star Award') || xpCategories[0];
    awardXP(student, amount, defaultCategory.label);
  };

  const handleBulkXPAward = (studentIds, amount, category) => {
    awardBulkXP(studentIds, amount, category);
    setShowXPModal(false);
  };

  const handleBulkCoinsAward = () => {
    if (selectedStudents.length === 0) {
      showWarningToast('Please select students first');
      return;
    }
    
    awardBulkCoins(selectedStudents, bulkCoinAmount);
    setShowBulkCoinsModal(false);
  };

  const handleSingleCoinAward = (student, amount = 5) => {
    awardCoins(student, amount);
  };

  // ===============================================
  // AVATAR AND PET PREVIEW HANDLERS
  // ===============================================

  const handleAvatarHover = (event, student) => {
    const avatarData = {
      image: student.avatar || getAvatarImage(student.avatarBase, student.avatarLevel),
      name: `${student.firstName}'s Avatar`,
      type: 'avatar',
      level: student.avatarLevel || 1,
      description: `Level ${student.avatarLevel || 1} ${student.avatarBase || 'Character'}`
    };
    showPreview(avatarData, event);
  };

  const handlePetHover = (event, pet, student) => {
    const petData = {
      image: pet.image,
      name: pet.name,
      type: 'pet',
      species: pet.species || 'Companion',
      speed: pet.speed,
      wins: pet.wins || 0,
      description: `${student.firstName}'s faithful companion`
    };
    showPreview(petData, event);
  };

  // ===============================================
  // RESPONSIVE GRID CALCULATION
  // ===============================================

  const gridConfig = calculateOptimalGrid(sortedStudents.length);
  const gridClasses = getGridClasses(sortedStudents.length);

  // ===============================================
  // STUDENT CARD COMPONENT
  // ===============================================

  const StudentCard = ({ student, isSelected, onToggleSelect }) => {
    const coins = calculateCoins(student);
    const progressToNext = (student.totalPoints || 0) % 100;
    const nextLevelXP = 100;
    const progressPercentage = (progressToNext / nextLevelXP) * 100;
    
    // Check if student needs pet
    const needsPet = shouldReceivePet(student);
    
    return (
      <div 
        className={`
          relative bg-white rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105
          border-2 ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
          ${needsPet ? 'ring-2 ring-orange-300 border-orange-300' : ''}
          p-4 cursor-pointer group
        `}
        onClick={() => setSelectedStudent(student)}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect(student.id);
            }}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Pet Needed Badge */}
        {needsPet && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            🐾 Pet!
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-3">
          <div 
            className="relative group cursor-pointer"
            onMouseEnter={(e) => handleAvatarHover(e, student)}
            onMouseLeave={hidePreview}
          >
            <img 
              src={student.avatar || getAvatarImage(student.avatarBase, student.avatarLevel)}
              alt={`${student.firstName}'s Avatar`}
              className="w-16 h-16 rounded-full border-3 border-blue-400 shadow-lg group-hover:border-blue-600 transition-all"
              onError={(e) => {
                console.warn(`Avatar failed to load for ${student.firstName}: ${e.target.src}`);
                e.target.src = '/Avatars/Wizard F/Level 1.png';
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              L{student.avatarLevel || 1}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mt-2 text-center leading-tight">
            {student.firstName}
          </h3>
        </div>

        {/* Stats Section */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-600 font-semibold flex items-center">
              ⭐ {student.totalPoints || 0}
            </span>
            <span className="text-yellow-600 font-semibold flex items-center">
              🪙 {coins}
            </span>
          </div>
          
          {/* XP Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Level {(student.avatarLevel || 1) + 1}</span>
              <span>{progressToNext}/{nextLevelXP}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Pets Section */}
        {student.ownedPets && student.ownedPets.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Pets:</div>
            <div className="flex space-x-1 justify-center">
              {student.ownedPets.slice(0, 3).map((pet, index) => (
                <div
                  key={pet.id || index}
                  className="relative"
                  onMouseEnter={(e) => handlePetHover(e, pet, student)}
                  onMouseLeave={hidePreview}
                >
                  <img
                    src={pet.image}
                    alt={pet.name}
                    className="w-6 h-6 rounded-full border border-purple-300 hover:border-purple-500 cursor-pointer transition-all hover:scale-110"
                  />
                </div>
              ))}
              {student.ownedPets.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  +{student.ownedPets.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickXPAward(student, 1);
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-2 rounded font-semibold transition-colors"
          >
            +1 XP
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleQuickXPAward(student, 5);
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs py-2 rounded font-semibold transition-colors"
          >
            +5 XP
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSingleCoinAward(student, 5);
            }}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-2 rounded font-semibold transition-colors"
          >
            +5 🪙
          </button>
        </div>
      </div>
    );
  };

  // ===============================================
  // RENDER MAIN COMPONENT
  // ===============================================

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold">
              👥 Class Champions
            </h2>
            <p className="text-blue-100 mt-1">
              {students.length} students • {selectedStudents.length} selected
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Student</span>
            </button>
            
            <button
              onClick={fixAllStudentData}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>🔧</span>
              <span>Fix Data</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{students.length}</div>
            <div className="text-sm text-blue-100">Total Students</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
            </div>
            <div className="text-sm text-blue-100">Total XP</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + calculateCoins(s), 0)}
            </div>
            <div className="text-sm text-blue-100">Total Coins</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {students.filter(s => s.ownedPets?.length > 0).length}
            </div>
            <div className="text-sm text-blue-100">Have Pets</div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          
          {/* Selection Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-600">Quick Select:</span>
            
            <button
              onClick={selectAllStudents}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              All ({students.length})
            </button>
            
            <button
              onClick={clearSelection}
              className="text-gray-600 hover:text-gray-800 text-sm font-semibold"
            >
              None
            </button>
            
            <div className="text-sm text-gray-500">
              {selectedStudents.length} selected
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            {selectedStudents.length > 0 && (
              <>
                <button
                  onClick={() => setShowXPModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>⭐</span>
                  <span>Award XP ({selectedStudents.length})</span>
                </button>
                
                <button
                  onClick={() => setShowBulkCoinsModal(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>🪙</span>
                  <span>Award Coins</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Search:</label>
            <input
              type="text"
              placeholder="Student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Level:</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'compact' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {sortedStudents.length > 0 ? (
        <div className={gridClasses}>
          {sortedStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              isSelected={selectedStudents.includes(student.id)}
              onToggleSelect={toggleStudentSelection}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">
            {searchTerm || filterLevel !== 'all' ? 'No students match your filters' : 'No Students Yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterLevel !== 'all' 
              ? 'Try adjusting your search or filter settings' 
              : 'Add your first student to get started!'
            }
          </p>
          {!searchTerm && filterLevel === 'all' && (
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Your First Student
            </button>
          )}
        </div>
      )}

      {/* XP Award Modal */}
      <XPAwardModal
        isOpen={showXPModal}
        onClose={() => setShowXPModal(false)}
        onAward={handleBulkXPAward}
        selectedStudents={selectedStudents}
        students={students}
        customCategories={xpCategories}
      />

      {/* Bulk Coins Modal */}
      {showBulkCoinsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-90vw">
            <h3 className="text-xl font-bold mb-4 text-center">
              💰 Award Coins to {selectedStudents.length} Students
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coins per student:
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={bulkCoinAmount}
                onChange={(e) => setBulkCoinAmount(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg"
              />
              
              <p className="text-sm text-gray-600 mt-2 text-center">
                Total: <span className="font-bold text-yellow-600">
                  {bulkCoinAmount * selectedStudents.length} coins
                </span>
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkCoinsModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkCoinsAward}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Award Coins
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Component */}
      <PreviewComponent />
    </div>
  );
};

export default StudentsTab;