import React from 'react';

const DashboardTab = ({ students, setActiveTab }) => {
  const totalStudents = students.length;
  const studentsWithAvatars = students.filter(s => s.avatar).length;
  const studentsWithPets = students.filter(s => s.pet?.image).length;
  const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
  const topStudent = students.reduce((top, current) => 
    (current.totalPoints || 0) > (top.totalPoints || 0) ? current : top
  , students[0]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Class Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-1">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
            </div>
            <div className="text-4xl text-blue-500">👥</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-green-800 mb-1">With Avatars</h3>
              <p className="text-3xl font-bold text-green-600">{studentsWithAvatars}</p>
            </div>
            <div className="text-4xl text-green-500">🎭</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-purple-800 mb-1">With Pets</h3>
              <p className="text-3xl font-bold text-purple-600">{studentsWithPets}</p>
            </div>
            <div className="text-4xl text-purple-500">🐾</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-yellow-800 mb-1">Total Class XP</h3>
              <p className="text-3xl font-bold text-yellow-600">{totalXP}</p>
            </div>
            <div className="text-4xl text-yellow-500">⭐</div>
          </div>
        </div>
      </div>

      {/* Top Performer */}
      {topStudent && (
        <div className="bg-gradient-to-r from-yellow-100 via-yellow-200 to-orange-200 p-8 rounded-xl shadow-lg border-2 border-yellow-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-3">🏆</span>
            Top Performer
          </h3>
          <div className="flex items-center space-x-6">
            {topStudent.avatar && (
              <div className="relative">
                <img 
                  src={topStudent.avatar} 
                  alt={topStudent.firstName} 
                  className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-sm font-bold px-2 py-1 rounded-full shadow">
                  L{topStudent.avatarLevel}
                </div>
              </div>
            )}
            <div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{topStudent.firstName}</p>
              <p className="text-lg text-yellow-700 flex items-center">
                <span className="mr-2">⭐</span>
                Level {topStudent.avatarLevel} • {topStudent.totalPoints} XP
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Class Progress */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-3">📈</span>
          Class Progress
        </h3>
        <div className="space-y-4">
          {students.slice(0, 5).map((student, index) => (
            <div key={student.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-bold text-gray-500 w-6">#{index + 1}</span>
                {student.avatar ? (
                  <img src={student.avatar} alt={student.firstName} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                    {student.firstName.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-gray-800">{student.firstName}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-600 text-lg">{student.totalPoints || 0} XP</span>
                <br />
                <span className="text-sm text-gray-500">Level {student.avatarLevel}</span>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎒</div>
              <h4 className="text-xl font-semibold text-gray-600 mb-2">No students yet</h4>
              <p className="text-gray-500">Add students or load a class to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-2xl mr-3">⚡</span>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setActiveTab('students')}
            className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👥</div>
              <div className="font-semibold text-blue-800 text-lg">Manage Students</div>
              <div className="text-sm text-blue-600 mt-1">Add XP, view profiles</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('race')}
            className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏁</div>
              <div className="font-semibold text-green-800 text-lg">Start Pet Race</div>
              <div className="text-sm text-green-600 mt-1">Compete for prizes</div>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <div className="text-center">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
              <div className="font-semibold text-purple-800 text-lg">Manage Classes</div>
              <div className="text-sm text-purple-600 mt-1">Import, switch classes</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;