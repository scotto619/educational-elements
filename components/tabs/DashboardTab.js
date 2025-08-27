// components/tabs/DashboardTab.js - Updated Dashboard with larger featured champion images and no quick actions
import React, { useState, useEffect } from 'react';

const DashboardTab = ({ 
  students = [], 
  showToast = () => {},
  getAvatarImage,
  getPetImage,
  calculateCoins,
  calculateAvatarLevel,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS
}) => {
  const [featuredStudent, setFeaturedStudent] = useState(null);
  const [featuredShopItem, setFeaturedShopItem] = useState(null);
  const [classStats, setClassStats] = useState({});

  // Calculate class statistics
  useEffect(() => {
    if (students.length > 0) {
      const totalXP = students.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
      const totalCoins = students.reduce((sum, s) => sum + calculateCoins(s), 0);
      const averageXP = Math.round(totalXP / students.length);
      const topStudent = students.reduce((top, student) => 
        (student.totalPoints || 0) > (top.totalPoints || 0) ? student : top
      );
      
      const levelDistribution = students.reduce((acc, student) => {
        const level = calculateAvatarLevel(student.totalPoints || 0);
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      setClassStats({
        totalStudents: students.length,
        totalXP,
        totalCoins,
        averageXP,
        topStudent,
        levelDistribution,
        studentsWithPets: students.filter(s => s.ownedPets && s.ownedPets.length > 0).length
      });

      // Set featured student (rotate daily based on date)
      const today = new Date().getDate();
      const featuredIndex = today % students.length;
      setFeaturedStudent(students[featuredIndex]);
    }
  }, [students, calculateCoins, calculateAvatarLevel]);

  // Set featured shop item (rotate daily)
  useEffect(() => {
    const allShopItems = [
      ...SHOP_BASIC_AVATARS.map(item => ({ ...item, type: 'Basic Avatar', category: 'avatar' })),
      ...SHOP_PREMIUM_AVATARS.map(item => ({ ...item, type: 'Premium Avatar', category: 'avatar' })),
      ...SHOP_BASIC_PETS.map(item => ({ ...item, type: 'Basic Pet', category: 'pet' })),
      ...SHOP_PREMIUM_PETS.map(item => ({ ...item, type: 'Premium Pet', category: 'pet' }))
    ];
    
    if (allShopItems.length > 0) {
      const today = new Date().getDate();
      const featuredIndex = today % allShopItems.length;
      setFeaturedShopItem(allShopItems[featuredIndex]);
    }
  }, [SHOP_BASIC_AVATARS, SHOP_PREMIUM_AVATARS, SHOP_BASIC_PETS, SHOP_PREMIUM_PETS]);

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 1: return 'bg-gray-500';
      case 2: return 'bg-green-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!featuredStudent) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🏫</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Classroom Champions!</h2>
          <p className="text-gray-600">Add some students to get started with your classroom adventure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 Classroom Champions Dashboard</h1>
            <p className="text-blue-100">Track your class progress and celebrate achievements!</p>
          </div>
          <div className="text-6xl opacity-20">🎯</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Featured Student Card - UPDATED WITH MUCH LARGER IMAGES */}
        <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-lg border-2 border-yellow-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl">⭐</div>
            <h2 className="text-2xl font-bold text-gray-800">Featured Champion</h2>
            <div className="text-sm bg-yellow-200 px-3 py-1 rounded-full text-yellow-800 font-semibold">
              Today's Star
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Student Avatar - MUCH LARGER */}
            <div className="relative">
              <img 
                src={getAvatarImage(featuredStudent.avatarBase, calculateAvatarLevel(featuredStudent.totalPoints))} 
                alt={featuredStudent.firstName}
                className="w-48 h-48 lg:w-56 lg:h-56 rounded-full border-4 border-yellow-400 shadow-lg"
              />
              <div className={`absolute -top-3 -right-3 ${getLevelBadgeColor(calculateAvatarLevel(featuredStudent.totalPoints))} text-white text-lg font-bold px-4 py-2 rounded-full shadow-lg`}>
                LVL {calculateAvatarLevel(featuredStudent.totalPoints)}
              </div>
            </div>

            {/* Student Info */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-4xl font-bold text-gray-800 mb-4">{featuredStudent.firstName} {featuredStudent.lastName}</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-blue-600">{featuredStudent.totalPoints || 0}</div>
                  <div className="text-sm text-gray-600">⚡ Total XP</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-3xl font-bold text-yellow-600">{calculateCoins(featuredStudent)}</div>
                  <div className="text-sm text-gray-600">💰 Coins</div>
                </div>
              </div>

              {/* Featured Student's Pet - MUCH LARGER */}
              {featuredStudent.ownedPets && featuredStudent.ownedPets.length > 0 && (
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <img 
                      src={getPetImage(featuredStudent.ownedPets[0])} 
                      alt={featuredStudent.ownedPets[0].name}
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-3 border-purple-300 shadow-md"
                    />
                    <div className="text-center lg:text-left">
                      <div className="text-xl font-bold text-gray-800">Companion: {featuredStudent.ownedPets[0].name}</div>
                      <div className="text-sm text-gray-600">🐾 Faithful Friend</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Class Stats Card */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            📊 Class Statistics
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">👥 Total Champions</span>
              <span className="font-bold text-blue-600 text-xl">{classStats.totalStudents}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">⚡ Average XP</span>
              <span className="font-bold text-green-600 text-xl">{classStats.averageXP}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">💰 Total Coins</span>
              <span className="font-bold text-yellow-600 text-xl">{classStats.totalCoins}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">🐾 With Pets</span>
              <span className="font-bold text-purple-600 text-xl">{classStats.studentsWithPets}</span>
            </div>
          </div>

          {/* Level Distribution */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Level Distribution</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(level => (
                <div key={level} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getLevelBadgeColor(level)}`}></div>
                  <span className="text-sm text-gray-600 flex-1">Level {level}</span>
                  <span className="font-semibold text-gray-800">{classStats.levelDistribution?.[level] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Shop Item */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Featured Shop Item */}
        {featuredShopItem && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🛒</div>
              <h2 className="text-xl font-bold text-gray-800">Featured in Shop</h2>
              <div className="text-xs bg-purple-200 px-2 py-1 rounded-full text-purple-800 font-semibold">
                Daily Special
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <img 
                src={featuredShopItem.path} 
                alt={featuredShopItem.name}
                className="w-20 h-20 rounded-lg border-2 border-purple-300 shadow-sm object-contain"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{featuredShopItem.name}</h3>
                <p className="text-sm text-purple-600 font-semibold">{featuredShopItem.type}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-600">💰 {featuredShopItem.price}</span>
                  <span className="text-sm text-gray-600">coins</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Class Achievement Highlights */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            🌟 Class Highlights
          </h2>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Most Active Champion</div>
              <div className="font-bold text-blue-600">{classStats.topStudent?.firstName || 'None'}</div>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Class Total XP</div>
              <div className="font-bold text-green-600">{classStats.totalXP || 0}</div>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600">Champions with Pets</div>
              <div className="font-bold text-purple-600">{classStats.studentsWithPets || 0} / {classStats.totalStudents || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏆 Top Performers
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {students
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
            .slice(0, 3)
            .map((student, index) => (
              <div key={student.id} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'border-yellow-400 bg-yellow-50' : 
                index === 1 ? 'border-gray-400 bg-gray-50' : 
                'border-orange-400 bg-orange-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                      alt={student.firstName}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-500' : 
                      'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{student.firstName}</div>
                    <div className="text-sm text-gray-600">{student.totalPoints || 0} XP</div>
                  </div>
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;