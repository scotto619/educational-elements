import React from 'react';

const StudentsTab = ({ 
  students, 
  setShowAddStudentModal, 
  handleAwardXP, 
  setSelectedStudent, 
  animatingXP,
  selectedStudents,
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
  const isSelectionMode = selectedStudents.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="text-3xl mr-3">👥</span>
          Students
          {isSelectionMode && (
            <span className="ml-4 text-lg text-blue-600 font-medium">
              ({selectedStudents.length} selected)
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-3">
          {isSelectionMode ? (
            <>
              <button
                onClick={() => setShowBulkXpPanel(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>⚡</span>
                <span>Award XP</span>
              </button>
              <button
                onClick={handleDeselectAll}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>✕</span>
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSelectAll}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span>☑️</span>
                <span>Select All</span>
              </button>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <span className="text-xl">+</span>
                <span>Add Student</span>
              </button>
            </>
          )}
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🎒</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No students in your class yet</h3>
          <p className="text-gray-500 mb-8">Add students or load a class from the Classes tab to get started!</p>
          <button
            onClick={() => setShowAddStudentModal(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
          >
            Add Your First Student
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {students.map((student) => (
            <div
              key={student.id}
              className={`relative bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-2 ${
                selectedStudents.includes(student.id) 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-100'
              }`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentSelect(student.id)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
              </div>

              <div className="relative w-fit mx-auto cursor-pointer mb-4" onClick={() => setSelectedStudent(student)}>
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.firstName}
                    className="w-20 h-20 rounded-full border-4 border-gray-200 object-cover shadow-md hover:shadow-lg transition-shadow"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                    {student.firstName.charAt(0)}
                  </div>
                )}
                {student.pet?.image && (
                  <img
                    src={student.pet.image}
                    alt="Pet"
                    className="w-8 h-8 absolute -top-2 -left-2 rounded-full border-2 border-white shadow-lg"
                  />
                )}
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-2 py-1 rounded-full shadow-lg">
                  ⭐{student.avatarLevel}
                </div>
              </div>

              <div className="font-bold text-gray-800 mb-3 text-lg">{student.firstName}</div>

              <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                {student.totalPoints || 0}
              </div>

              {/* XP Animation */}
              {animatingXP[student.id] && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce text-2xl font-bold text-green-500 z-10">
                  +{bulkXpAmount > 1 ? bulkXpAmount : 1} XP
                </div>
              )}

              {/* XP Award buttons - only show if not in selection mode */}
              {!isSelectionMode && (
                <div className="flex justify-center gap-2 text-lg">
                  <button 
                    title="Respectful" 
                    onClick={() => handleAwardXP(student.id, 'Respectful')} 
                    className="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md"
                  >
                    👍
                  </button>
                  <button 
                    title="Responsible" 
                    onClick={() => handleAwardXP(student.id, 'Responsible')} 
                    className="bg-green-100 hover:bg-green-200 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md"
                  >
                    💼
                  </button>
                  <button 
                    title="Learner" 
                    onClick={() => handleAwardXP(student.id, 'Learner')} 
                    className="bg-purple-100 hover:bg-purple-200 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-110 shadow-md"
                  >
                    📚
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bulk XP Award Panel */}
      {showBulkXpPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <span className="mr-3">⚡</span>
              Award XP to {selectedStudents.length} Student{selectedStudents.length > 1 ? 's' : ''}
            </h2>

            <div className="space-y-6">
              {/* XP Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">XP Amount</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={bulkXpAmount}
                    onChange={(e) => setBulkXpAmount(Number(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg min-w-[60px] text-center">
                    {bulkXpAmount}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'Respectful', label: 'Respectful', icon: '👍', color: 'blue' },
                    { id: 'Responsible', label: 'Responsible', icon: '💼', color: 'green' },
                    { id: 'Learner', label: 'Learner', icon: '📚', color: 'purple' }
                  ].map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setBulkXpCategory(category.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                        bulkXpCategory === category.id
                          ? `border-${category.color}-500 bg-${category.color}-50`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <div className="text-sm font-semibold text-gray-700">{category.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Students Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Students</label>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedStudents.map((id) => {
                      const student = students.find(s => s.id === id);
                      return (
                        <span key={id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {student?.firstName}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowBulkXpPanel(false)}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkXpAward}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
              >
                Award {bulkXpAmount} XP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper text */}
      {!isSelectionMode && students.length > 0 && (
        <div className="mt-8 text-center text-gray-500">
          <p className="text-sm">
            💡 Click student avatars to view profiles, or use checkboxes to select multiple students for bulk XP awards
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentsTab;