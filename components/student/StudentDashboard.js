// components/student/StudentDashboard.js
import React from 'react';

const StudentDashboard = ({ 
  studentData, 
  classData,
  getAvatarImage,
  getPetImage,
  calculateCoins,
  calculateAvatarLevel
}) => {
  const level = calculateAvatarLevel(studentData?.totalPoints || 0);
  const coins = calculateCoins(studentData);
  const xpForNextLevel = level < 4 ? (level * 100) - (studentData?.totalPoints || 0) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {studentData?.firstName}! 🎉</h2>
        <p className="text-purple-100">Ready to continue your classroom adventure?</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Avatar & Level */}
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          <img 
            src={getAvatarImage(studentData?.avatarBase, level)} 
            alt="Your Avatar"
            className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-300"
          />
          <h3 className="text-lg font-bold text-gray-800">Level {level}</h3>
          <p className="text-purple-600 font-semibold">Champion</p>
        </div>

        {/* XP Progress */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Experience</span>
            <span className="text-lg font-bold text-blue-600">⚡ {studentData?.totalPoints || 0}</span>
          </div>
          {level < 4 && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((studentData?.totalPoints || 0) % 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600">{100 - ((studentData?.totalPoints || 0) % 100)} XP to Level {level + 1}</p>
            </div>
          )}
          {level >= 4 && (
            <p className="text-xs text-green-600 font-semibold">🏆 Max Level Achieved!</p>
          )}
        </div>

        {/* Coins */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Coins</span>
            <span className="text-lg font-bold text-yellow-600">💰 {coins}</span>
          </div>
          <p className="text-xs text-gray-600">Ready to spend!</p>
        </div>

        {/* Pet */}
        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
          {studentData?.ownedPets && studentData.ownedPets.length > 0 ? (
            <div>
              <img 
                src={getPetImage(studentData.ownedPets[0])} 
                alt="Your Pet"
                className="w-16 h-16 rounded-full mx-auto mb-2 border-2 border-green-300"
              />
              <h4 className="font-semibold text-gray-800">{studentData.ownedPets[0].name}</h4>
              <p className="text-xs text-green-600">Your Companion</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-2">🥚</div>
              <p className="text-sm text-gray-600">Get 50 XP to unlock your first pet!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Your Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-gray-800">XP Earned</h4>
            <p className="text-2xl font-bold text-yellow-600">{studentData?.totalPoints || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-2xl mb-2">🛒</div>
            <h4 className="font-semibold text-gray-800">Items Owned</h4>
            <p className="text-2xl font-bold text-green-600">
              {(studentData?.ownedAvatars?.length || 0) + (studentData?.ownedPets?.length || 0)}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-semibold text-gray-800">Coins Earned</h4>
            <p className="text-2xl font-bold text-purple-600">
              {Math.floor((studentData?.totalPoints || 0) / 5) + (studentData?.currency || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">🛒</div>
            <div className="text-sm font-semibold">Visit Shop</div>
          </button>
          
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">🎮</div>
            <div className="text-sm font-semibold">Play Games</div>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">🎪</div>
            <div className="text-sm font-semibold">Quiz Show</div>
          </button>
          
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center hover:shadow-lg transition-all">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-sm font-semibold">Class Info</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export { StudentDashboard};