// StudentsTab.js - Compact, One-Screen Design
import React, { useState } from 'react';
import XPAwardPopup from '../XPAwardPopup';
import HoverImagePreview from '../HoverImagePreview';

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
  // Bulk XP Props - simplified
  selectedStudents = [],
  setSelectedStudents,
  handleStudentSelect,
  handleSelectAll,
  handleDeselectAll,
  showBulkXpPanel = false,
  setShowBulkXpPanel,
  bulkXpAmount = 1,
  setBulkXpAmount,
  bulkXpCategory = 'Respectful',
  setBulkXpCategory,
  handleBulkXpAward
}) => {
  const [hoveredStudent, setHoveredStudent] = useState(null);
  
  // XP Award Popup state
  const [showXPPopup, setShowXPPopup] = useState(false);
  const [xpPopupData, setXpPopupData] = useState({
    studentName: '',
    xpAmount: 0,
    category: 'Respectful',
    timestamp: 0  // Add timestamp to prevent re-triggering
  });
  
  // Simplified local state - only used if props aren't provided
  const [localSelectedStudents, setLocalSelectedStudents] = useState([]);
  const [localXpAmount, setLocalXpAmount] = useState(1);
  const [localXpCategory, setLocalXpCategory] = useState('Respectful');
  const [localShowPanel, setLocalShowPanel] = useState(false);

  // Use props if available, otherwise use local state
  const currentSelectedStudents = setSelectedStudents ? selectedStudents : localSelectedStudents;
  const currentXpAmount = setBulkXpAmount ? bulkXpAmount : localXpAmount;
  const currentXpCategory = setBulkXpCategory ? bulkXpCategory : localXpCategory;
  const isXpPanelOpen = setShowBulkXpPanel ? showBulkXpPanel : localShowPanel;

  // Handle individual XP award (fix for missing handleXPClick)
  const handleXPClick = (studentId, event) => {
    event.stopPropagation();
    event.preventDefault();
    
    const student = students.find(s => s.id === studentId);
    const xpAmount = 1;
    const category = 'Respectful';
    
    // Close any existing popup first
    setShowXPPopup(false);
    
    // Small delay then show new popup with timestamp
    setTimeout(() => {
      setXpPopupData({
        studentName: student?.firstName || 'Student',
        xpAmount: xpAmount,
        category: category,
        timestamp: Date.now()
      });
      setShowXPPopup(true);
    }, 50);
    
    // Award the XP
    handleAwardXP(studentId, category, xpAmount);
    showToast(`Awarded ${xpAmount} XP to ${student?.firstName}!`);
  };

  // Toggle XP panel
  const toggleXpPanel = () => {
    if (setShowBulkXpPanel) {
      setShowBulkXpPanel(!showBulkXpPanel);
    } else {
      setLocalShowPanel(!localShowPanel);
    }
  };

  // Handle student selection
  const selectStudent = (studentId) => {
    if (setSelectedStudents) {
      const newSelection = selectedStudents.includes(studentId)
        ? selectedStudents.filter(id => id !== studentId)
        : [...selectedStudents, studentId];
      setSelectedStudents(newSelection);
    } else {
      setLocalSelectedStudents(prev => 
        prev.includes(studentId) 
          ? prev.filter(id => id !== studentId)
          : [...prev, studentId]
      );
    }
  };

  // Select all students
  const selectAllStudents = () => {
    const allIds = students.map(s => s.id);
    if (setSelectedStudents) {
      setSelectedStudents(allIds);
    } else {
      setLocalSelectedStudents(allIds);
    }
  };

  // Clear all selections
  const clearAllStudents = () => {
    if (setSelectedStudents) {
      setSelectedStudents([]);
    } else {
      setLocalSelectedStudents([]);
    }
  };

  // Award XP to selected students
  const awardXpToSelected = () => {
    if (currentSelectedStudents.length === 0) {
      showToast('Please select at least one student first!', 'error');
      return;
    }

    if (handleBulkXpAward) {
      handleBulkXpAward();
    } else {
      // Award XP to each selected student
      currentSelectedStudents.forEach(studentId => {
        handleAwardXP(studentId, currentXpCategory, currentXpAmount);
      });

      const studentNames = currentSelectedStudents.length === students.length 
        ? 'the entire class'
        : `${currentSelectedStudents.length} students`;
      
      showToast(`Awarded ${currentXpAmount} ${currentXpCategory} XP to ${studentNames}!`);
      
      // Clear selections
      clearAllStudents();
      
      // Close any existing popup first
      setShowXPPopup(false);
      
      // Show popup for bulk award with timestamp
      setTimeout(() => {
        const firstStudent = students.find(s => s.id === currentSelectedStudents[0]);
        const displayName = currentSelectedStudents.length === 1 
          ? firstStudent?.firstName 
          : `${currentSelectedStudents.length} Heroes`;
          
        setXpPopupData({
          studentName: displayName,
          xpAmount: currentXpAmount,
          category: currentXpCategory,
          timestamp: Date.now()
        });
        setShowXPPopup(true);
      }, 50);
    }
  };

  // Close XP popup
  const closeXPPopup = () => {
    setShowXPPopup(false);
  };

  // Update XP amount
  const updateXpAmount = (amount) => {
    if (setBulkXpAmount) {
      setBulkXpAmount(amount);
    } else {
      setLocalXpAmount(amount);
    }
  };

  // Update XP category
  const updateXpCategory = (category) => {
    if (setBulkXpCategory) {
      setBulkXpCategory(category);
    } else {
      setLocalXpCategory(category);
    }
  };

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-xl p-4 text-white mb-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              ⚔️ Champions Guild
            </h2>
            <p className="text-indigo-100">{students.length} heroes ready for adventure!</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleXpPanel}
              className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                isXpPanelOpen 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <span>⚡</span>
              <span>Award XP</span>
            </button>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-bold flex items-center space-x-1"
            >
              <span>👤</span>
              <span>Add Hero</span>
            </button>
          </div>
        </div>
      </div>

      {/* Award XP Panel - Compact */}
      {isXpPanelOpen && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-bold text-purple-700">XP:</label>
              <input
                type="number"
                min="1"
                max="10"
                value={currentXpAmount}
                onChange={(e) => updateXpAmount(parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-bold text-purple-700">Type:</label>
              <select
                value={currentXpCategory}
                onChange={(e) => updateXpCategory(e.target.value)}
                className="px-2 py-1 border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="Respectful">👍 Respectful</option>
                <option value="Responsible">💼 Responsible</option>
                <option value="Learner">📚 Learner</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={selectAllStudents}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-bold"
              >
                Select All
              </button>
              <button
                onClick={clearAllStudents}
                className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-bold"
              >
                Clear
              </button>
            </div>

            <button
              onClick={awardXpToSelected}
              disabled={currentSelectedStudents.length === 0}
              className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-bold text-sm"
            >
              Award to {currentSelectedStudents.length} heroes
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats - Compact */}
      <div className="grid grid-cols-4 gap-2 mb-4 flex-shrink-0">
        {[
          {
            title: 'Avg XP',
            value: Math.round(students.reduce((acc, s) => acc + (s.totalPoints || 0), 0) / students.length) || 0,
            icon: '⚡',
            color: 'blue'
          },
          {
            title: 'Avg Coins',
            value: Math.round(students.reduce((acc, s) => acc + calculateCoins(s), 0) / students.length) || 0,
            icon: '💎',
            color: 'yellow'
          },
          {
            title: 'With Pets',
            value: students.filter(s => s.pet?.image).length,
            icon: '🐲',
            color: 'green'
          },
          {
            title: 'Questing',
            value: students.filter(s => getStudentQuestProgress(s) > 0).length,
            icon: '⚔️',
            color: 'purple'
          }
        ].map((stat, index) => (
          <div key={index} className={`bg-${stat.color}-50 rounded-lg p-2 text-center border border-${stat.color}-200`}>
            <div className="text-lg">{stat.icon}</div>
            <div className={`text-lg font-bold text-${stat.color}-600`}>{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Students Grid - Compact and Scrollable */}
      <div className="flex-1 overflow-auto">
        {students.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="text-6xl mb-4">🏰</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Empty Guild Hall</h3>
            <p className="text-gray-500 mb-4">Your guild awaits its first heroes!</p>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold"
            >
              🌟 Recruit Your First Hero
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
            {students.map(student => {
              const questCount = getStudentQuestProgress(student);
              const coins = calculateCoins(student);
              const xp = student.totalPoints || 0;
              const xpProgress = getXPProgress(student);
              const isHovered = hoveredStudent === student.id;
              const isAnimating = animatingXP[student.id];
              const isSelected = currentSelectedStudents.includes(student.id);

              return (
                <div
                  key={student.id}
                  className={`relative bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50 transform scale-105' 
                      : isHovered 
                        ? 'border-purple-300 shadow-md transform scale-105' 
                        : 'border-gray-200 hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredStudent(student.id)}
                  onMouseLeave={() => setHoveredStudent(null)}
                  onClick={() => isXpPanelOpen && selectStudent(student.id)}
                >
                  {/* Level Badge */}
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs font-bold px-1 py-0.5 rounded">
                    {student.avatarLevel || 1}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-purple-600 text-white text-xs font-bold px-1 py-0.5 rounded">
                      ✓
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="p-2 space-y-2">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => handleAvatarClickWrapper(student, e)}
                        className="relative"
                      >
                        <HoverImagePreview
                          imageSrc={student.avatar}
                          title={`${student.firstName}'s Avatar`}
                          subtitle={`Level ${student.avatarLevel || 1} Hero`}
                          previewSize="large"
                        >
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={`${student.firstName}'s avatar`}
                              className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-purple-400 transition-all"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                              <span className="text-xs">👤</span>
                            </div>
                          )}
                        </HoverImagePreview>
                      </button>
                    </div>

                    {/* Name */}
                    <h3 className="text-xs font-bold text-gray-800 text-center truncate">
                      {student.firstName}
                    </h3>

                    {/* XP Progress */}
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${student.avatarLevel >= 4 ? 100 : xpProgress.percentage}%` }}
                      ></div>
                    </div>

                    {/* Action Buttons - Compact Row */}
                    <div className="flex justify-center space-x-1">
                      <button
                        onClick={(e) => handleXPClick(student.id, e)}
                        className={`w-5 h-5 bg-blue-500 text-white text-xs rounded flex items-center justify-center font-bold hover:bg-blue-600 transition-all ${
                          isAnimating ? 'animate-pulse' : ''
                        }`}
                        title={`${xp} XP`}
                      >
                        ⭐
                      </button>
                      <button
                        onClick={(e) => handleCoinsClick(student, e)}
                        className="w-5 h-5 bg-yellow-500 text-white text-xs rounded flex items-center justify-center font-bold hover:bg-yellow-600 transition-all"
                        title={`${coins} Coins`}
                      >
                        💎
                      </button>
                      <button
                        onClick={handleQuestsClick}
                        className={`w-5 h-5 text-white text-xs rounded flex items-center justify-center font-bold transition-all ${
                          questCount > 0 
                            ? 'bg-orange-500 hover:bg-orange-600' 
                            : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                        title={`${questCount} Quests`}
                      >
                        ⚔️
                      </button>
                    </div>

                    {/* Stats - Compact */}
                    <div className="text-center text-xs space-y-1">
                      <div className="text-blue-600 font-bold">{xp}</div>
                      {student.pet?.image && (
                        <div className="text-green-600 text-xs truncate" title={student.pet.name}>
                          🐲 {student.pet.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Guide - Compact */}
      <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-xs text-center flex-shrink-0">
        <span className="font-bold text-indigo-800">Quick Guide:</span>
        <span className="text-indigo-600 ml-1">
          Click avatar for character sheet • ⭐ for quick XP • 💎 for shop • ⚔️ for quests • Use Award XP panel for bulk actions
        </span>
      </div>

      {/* XP Award Popup */}
      <XPAwardPopup
        show={showXPPopup}
        studentName={xpPopupData.studentName}
        xpAmount={xpPopupData.xpAmount}
        category={xpPopupData.category}
        timestamp={xpPopupData.timestamp}
        onClose={closeXPPopup}
        playSound={true}
      />
    </div>
  );
};

export default StudentsTab;