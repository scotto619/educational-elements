// components/student/StudentDashboard.js - MOBILE OPTIMIZED
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
        <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Welcome back, {studentData?.firstName}! 🎉</h2>
        <p className="text-purple-100 text-sm md:text-base">Ready to continue your classroom adventure?</p>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Avatar & Level */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg text-center">
          <img 
            src={getAvatarImage(studentData?.avatarBase, level)} 
            alt="Your Avatar"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-4 border-4 border-purple-300"
            onError={(e) => {
              e.target.src = '/shop/Basic/Banana.png';
            }}
          />
          <h3 className="text-base md:text-lg font-bold text-gray-800">Level {level}</h3>
          <p className="text-purple-600 font-semibold text-sm md:text-base">Champion</p>
        </div>

        {/* XP Progress */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-semibold text-gray-600">Experience</span>
            <span className="text-sm md:text-lg font-bold text-blue-600">⚡ {studentData?.totalPoints || 0}</span>
          </div>
          {level < 4 && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-2">
                <div 
                  className="bg-blue-500 h-2 md:h-3 rounded-full transition-all duration-500"
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
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-semibold text-gray-600">Coins</span>
            <span className="text-sm md:text-lg font-bold text-yellow-600">💰 {coins}</span>
          </div>
          <p className="text-xs text-gray-600">Ready to spend!</p>
        </div>

        {/* Pet */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg text-center">
          {studentData?.ownedPets && studentData.ownedPets.length > 0 ? (
            <div>
              <img 
                src={getPetImage(studentData.ownedPets[0])} 
                alt="Your Pet"
                className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1 md:mb-2 border-2 border-green-300"
                onError={(e) => {
                  e.target.src = '/shop/BasicPets/Wizard.png';
                }}
              />
              <h4 className="font-semibold text-gray-800 text-sm md:text-base">{studentData.ownedPets[0].name}</h4>
              <p className="text-xs text-green-600">Your Companion</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl md:text-4xl mb-1 md:mb-2">🥚</div>
              <p className="text-xs md:text-sm text-gray-600">Get 50 XP to unlock your first pet!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Achievements - Mobile Optimized */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">🏆 Your Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-yellow-50 rounded-lg p-3 md:p-4 border-2 border-yellow-200">
            <div className="text-xl md:text-2xl mb-1 md:mb-2">⚡</div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">XP Earned</h4>
            <p className="text-lg md:text-2xl font-bold text-yellow-600">{studentData?.totalPoints || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3 md:p-4 border-2 border-green-200">
            <div className="text-xl md:text-2xl mb-1 md:mb-2">🛍️</div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">Items Owned</h4>
            <p className="text-lg md:text-2xl font-bold text-green-600">
              {(studentData?.ownedAvatars?.length || 0) + (studentData?.ownedPets?.length || 0)}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 md:p-4 border-2 border-purple-200">
            <div className="text-xl md:text-2xl mb-1 md:mb-2">💰</div>
            <h4 className="font-semibold text-gray-800 text-sm md:text-base">Coins Earned</h4>
            <p className="text-lg md:text-2xl font-bold text-purple-600">
              {Math.floor((studentData?.totalPoints || 0) / 5) + (studentData?.currency || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">🚀 Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 md:p-4 rounded-lg text-center hover:shadow-lg transition-all active:scale-95">
            <div className="text-xl md:text-2xl mb-1">🛍️</div>
            <div className="text-xs md:text-sm font-semibold">Visit Shop</div>
          </button>
          
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 md:p-4 rounded-lg text-center hover:shadow-lg transition-all active:scale-95">
            <div className="text-xl md:text-2xl mb-1">🎮</div>
            <div className="text-xs md:text-sm font-semibold">Play Games</div>
          </button>
          
          <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3 md:p-4 rounded-lg text-center hover:shadow-lg transition-all active:scale-95">
            <div className="text-xl md:text-2xl mb-1">🎪</div>
            <div className="text-xs md:text-sm font-semibold">Quiz Show</div>
          </button>
          
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 md:p-4 rounded-lg text-center hover:shadow-lg transition-all active:scale-95">
            <div className="text-xl md:text-2xl mb-1">👥</div>
            <div className="text-xs md:text-sm font-semibold">Class Info</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;