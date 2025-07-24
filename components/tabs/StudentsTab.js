// components/tabs/StudentsTab.js - UPDATED WITH PHASE 2 FIXES
import React, { useState, useEffect } from 'react';

// Import the Phase 2 fixes
import { 
  getAvatarImage, 
  calculateAvatarLevel, 
  migrateStudentData, 
  fixAllStudentLevels,
  StudentCard,
  CoinEditModal 
} from '../../utils/avatarFixes';

const StudentsTab = ({ 
  students, 
  setStudents, 
  handleAddStudent, 
  handleAwardXP, 
  handleViewStudent, 
  saveStudentsToFirebase,
  showToast,
  selectedStudent,
  setSelectedStudent,
  currentClassId
}) => {
  // State for bulk operations
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkXPAmount, setBulkXPAmount] = useState(1);
  const [showBulkModal, setShowBulkModal] = useState(false);
  
  // State for coin management
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinEditStudent, setCoinEditStudent] = useState(null);
  
  // State for XP rewards customization
  const [xpRewards, setXPRewards] = useState([
    { id: 1, label: 'Respectful', amount: 1, color: 'bg-blue-500' },
    { id: 2, label: 'Responsible', amount: 1, color: 'bg-green-500' },
    { id: 3, label: 'Safe', amount: 1, color: 'bg-yellow-500' },
    { id: 4, label: 'Learner', amount: 1, color: 'bg-purple-500' },
    { id: 5, label: 'Star Award', amount: 5, color: 'bg-gold-500' }
  ]);

  // Migrate student data on component mount
  useEffect(() => {
    if (students.length > 0) {
      const migratedStudents = students.map(migrateStudentData);
      const hasChanges = JSON.stringify(students) !== JSON.stringify(migratedStudents);
      
      if (hasChanges) {
        console.log('📊 Migrating student data...');
        setStudents(migratedStudents);
        if (saveStudentsToFirebase) {
          saveStudentsToFirebase(migratedStudents);
        }
      }
    }
  }, []);

  // Handle bulk student fixes
  const handleFixAllStudents = () => {
    const fixedStudents = fixAllStudentLevels(students, (fixed) => {
      setStudents(fixed);
      if (saveStudentsToFirebase) {
        saveStudentsToFirebase(fixed);
      }
    });
    
    if (showToast) {
      showToast('✅ All student levels and avatars have been fixed!', 'success');
    }
  };

  // Handle individual XP award with custom amount
  const handleCustomXPAward = (student, rewardType) => {
    const reward = xpRewards.find(r => r.id === rewardType) || xpRewards[0];
    const updatedStudents = students.map(s => {
      if (s.id === student.id) {
        const newTotalXP = (s.totalPoints || 0) + reward.amount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        return {
          ...s,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(s.avatarBase, newLevel),
          behaviorPoints: {
            ...s.behaviorPoints,
            [reward.label.toLowerCase()]: (s.behaviorPoints?.[reward.label.toLowerCase()] || 0) + 1
          }
        };
      }
      return s;
    });
    
    setStudents(updatedStudents);
    if (saveStudentsToFirebase) {
      saveStudentsToFirebase(updatedStudents);
    }
    
    if (showToast) {
      showToast(`🌟 ${student.firstName} earned ${reward.amount} XP for being ${reward.label}!`, 'success');
    }
  };

  // Handle bulk XP award
  const handleBulkXPAward = () => {
    if (selectedStudents.length === 0) {
      if (showToast) {
        showToast('Please select students first', 'warning');
      }
      return;
    }

    const updatedStudents = students.map(student => {
      if (selectedStudents.includes(student.id)) {
        const newTotalXP = (student.totalPoints || 0) + bulkXPAmount;
        const newLevel = calculateAvatarLevel(newTotalXP);
        
        return {
          ...student,
          totalPoints: newTotalXP,
          avatarLevel: newLevel,
          avatar: getAvatarImage(student.avatarBase, newLevel)
        };
      }
      return student;
    });

    setStudents(updatedStudents);
    if (saveStudentsToFirebase) {
      saveStudentsToFirebase(updatedStudents);
    }
    
    setSelectedStudents([]);
    setShowBulkModal(false);
    
    if (showToast) {
      showToast(`🎉 Awarded ${bulkXPAmount} XP to ${selectedStudents.length} students!`, 'success');
    }
  };

  // Handle coin editing
  const handleEditCoins = (student) => {
    setCoinEditStudent(student);
    setShowCoinModal(true);
  };

  const handleSaveCoins = (studentId, newCoinAmount) => {
    const updatedStudents = students.map(student => 
      student.id === studentId 
        ? { ...student, currency: newCoinAmount }
        : student
    );
    
    setStudents(updatedStudents);
    if (saveStudentsToFirebase) {
      saveStudentsToFirebase(updatedStudents);
    }
    
    if (showToast) {
      const student = students.find(s => s.id === studentId);
      showToast(`💰 Updated coins for ${student?.firstName}!`, 'success');
    }
  };

  // Toggle student selection for bulk operations
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            👥 Class Champions ({students.length} students)
          </h2>
          
          <div className="flex space-x-3">
            <button
              onClick={handleAddStudent}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Add Student</span>
            </button>
            
            <button
              onClick={handleFixAllStudents}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <span>🔧</span>
              <span>Fix All Data</span>
            </button>
          </div>
        </div>

        {/* Bulk Operations */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-600">Bulk Actions:</span>
            
            <button
              onClick={selectAllStudents}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              Select All
            </button>
            
            <button
              onClick={clearSelection}
              className="text-gray-600 hover:text-gray-800 text-sm font-semibold"
            >
              Clear ({selectedStudents.length})
            </button>
            
            {selectedStudents.length > 0 && (
              <button
                onClick={() => setShowBulkModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold"
              >
                Award XP to {selectedStudents.length} students
              </button>
            )}
          </div>

          {/* XP Reward Customization */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Quick Awards:</span>
            {xpRewards.slice(0, 4).map(reward => (
              <div
                key={reward.id}
                className={`${reward.color} text-white px-2 py-1 rounded text-xs font-semibold cursor-help`}
                title={`${reward.label}: ${reward.amount} XP`}
              >
                {reward.label} (+{reward.amount})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map(student => (
          <div key={student.id} className="relative">
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <input
                type="checkbox"
                checked={selectedStudents.includes(student.id)}
                onChange={() => toggleStudentSelection(student.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>

            {/* Student Card */}
            <div className={`transition-all duration-200 ${
              selectedStudents.includes(student.id) 
                ? 'ring-2 ring-blue-500 ring-offset-2' 
                : ''
            }`}>
              <StudentCard
                student={student}
                onAwardXP={(student) => {
                  // Show XP reward options
                  const rewardId = window.confirm('Use quick +1 XP award?') ? 1 : 5;
                  handleCustomXPAward(student, rewardId);
                }}
                onViewDetails={handleViewStudent}
                onEditCoins={handleEditCoins}
              />
            </div>

            {/* XP Award Buttons Overlay */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white bg-opacity-95 rounded-lg p-2 shadow-lg">
                <div className="grid grid-cols-2 gap-1">
                  {xpRewards.slice(0, 4).map(reward => (
                    <button
                      key={reward.id}
                      onClick={() => handleCustomXPAward(student, reward.id)}
                      className={`${reward.color} hover:opacity-80 text-white px-2 py-1 rounded text-xs font-semibold transition-all`}
                      title={`Award ${reward.amount} XP for ${reward.label}`}
                    >
                      +{reward.amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {students.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-2">No Students Yet</h3>
          <p className="text-gray-500 mb-6">Add your first student to get started!</p>
          <button
            onClick={handleAddStudent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Add Your First Student
          </button>
        </div>
      )}

      {/* Bulk XP Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-90vw">
            <h3 className="text-xl font-bold mb-4 text-center">
              🌟 Bulk XP Award
            </h3>
            <p className="text-gray-600 mb-4 text-center">
              Award XP to {selectedStudents.length} selected students
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                XP Amount:
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={bulkXPAmount}
                onChange={(e) => setBulkXPAmount(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-lg"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkXPAward}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                Award XP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coin Edit Modal */}
      <CoinEditModal
        student={coinEditStudent}
        isOpen={showCoinModal}
        onClose={() => {
          setShowCoinModal(false);
          setCoinEditStudent(null);
        }}
        onSave={handleSaveCoins}
      />
    </div>
  );
};

export default StudentsTab;