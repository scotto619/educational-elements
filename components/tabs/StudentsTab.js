import React from 'react';

const StudentsTab = ({ 
  students, 
  setShowAddStudentModal, 
  handleAwardXP, 
  setSelectedStudent, 
  animatingXP 
}) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <span className="text-3xl mr-3">👥</span>
          Students
        </h2>
        <button
          onClick={() => setShowAddStudentModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
        >
          <span className="text-xl">+</span>
          <span>Add Student</span>
        </button>
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
              className="relative bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
            >
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
                  +1 XP
                </div>
              )}

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsTab;