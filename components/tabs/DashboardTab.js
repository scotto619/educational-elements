// components/tabs/DashboardTab.js - MOBILE-OPTIMIZED DASHBOARD
import React, { useEffect, useMemo, useState } from 'react';
import { buildShopInventory, getDailySpecials } from '../../utils/shopSpecials';
import { DEFAULT_PET_IMAGE } from '../../utils/gameHelpers';
import { DEFAULT_CARD_PACKS } from '../../utils/tradingCards';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';
import { DEFAULT_UPDATES } from '../../services/globalContent';

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
  SHOP_PREMIUM_PETS,
  dailySpecials = [],
  updates = []
}) => {
  const [featuredStudent, setFeaturedStudent] = useState(null);
  const [classStats, setClassStats] = useState({});
  const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);

  const resolvePetImage = (pet) => normalizeImageSource(getPetImage(pet), DEFAULT_PET_IMAGE);

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

  const getLevelBadgeColor = (level) => {
    switch(level) {
      case 1: return 'bg-gray-500';
      case 2: return 'bg-green-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const todaysSpecials = useMemo(() => {
    if (Array.isArray(dailySpecials) && dailySpecials.length > 0) {
      return dailySpecials;
    }

    const inventory = buildShopInventory({
      basicAvatars: SHOP_BASIC_AVATARS,
      premiumAvatars: SHOP_PREMIUM_AVATARS,
      basicPets: SHOP_BASIC_PETS,
      premiumPets: SHOP_PREMIUM_PETS,
      cardPacks: DEFAULT_CARD_PACKS
    });

    return getDailySpecials(inventory);
  }, [
    dailySpecials,
    SHOP_BASIC_AVATARS,
    SHOP_PREMIUM_AVATARS,
    SHOP_BASIC_PETS,
    SHOP_PREMIUM_PETS
  ]);

  const updatesToDisplay = useMemo(() => (
    Array.isArray(updates) && updates.length > 0 ? updates : DEFAULT_UPDATES
  ), [updates]);

  const getUpdateBadgeStyles = (status) => {
    switch ((status || '').toUpperCase()) {
      case 'NEW':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'IMPROVED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENHANCED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!featuredStudent) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="p-6 sm:p-8 text-center">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏫</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Welcome to Classroom Champions!</h2>
          <p className="text-sm sm:text-base text-gray-600">Add some students to get started with your classroom adventure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* MOBILE-OPTIMIZED Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">🏆 Classroom Champions Dashboard</h1>
            <p className="text-xs sm:text-base text-blue-100">Track your class progress and celebrate achievements!</p>
          </div>
          <div className="text-4xl sm:text-6xl opacity-20 mt-2 sm:mt-0">🎯</div>
        </div>
      </div>

      {/* MOBILE-OPTIMIZED Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* MOBILE-OPTIMIZED Featured Student Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 shadow-lg border-2 border-yellow-200">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="text-2xl sm:text-3xl">⭐</div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 text-center sm:text-left">Featured Champion</h2>
            <div className="text-xs sm:text-sm bg-yellow-200 px-2 sm:px-3 py-1 rounded-full text-yellow-800 font-semibold">
              Today's Star
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:gap-8">
            {/* Student Avatar - MOBILE RESPONSIVE SIZING */}
            <div className="relative flex-shrink-0">
              <img 
                src={getAvatarImage(featuredStudent.avatarBase, calculateAvatarLevel(featuredStudent.totalPoints))} 
                alt={featuredStudent.firstName}
                className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 rounded-full border-3 sm:border-4 border-yellow-400 shadow-lg"
              />
              <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 ${getLevelBadgeColor(calculateAvatarLevel(featuredStudent.totalPoints))} text-white text-sm sm:text-lg font-bold px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg`}>
                LVL {calculateAvatarLevel(featuredStudent.totalPoints)}
              </div>
            </div>

            {/* Student Info - MOBILE OPTIMIZED */}
            <div className="flex-1 text-center lg:text-left w-full">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                {featuredStudent.firstName} {featuredStudent.lastName}
              </h3>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                    {featuredStudent.totalPoints || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">⚡ Total XP</div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">
                    {calculateCoins(featuredStudent)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">💰 Coins</div>
                </div>
              </div>

              {/* Featured Student's Pet - MOBILE RESPONSIVE */}
              {featuredStudent.ownedPets && featuredStudent.ownedPets.length > 0 && (
                <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row lg:flex-row items-center gap-3 sm:gap-4">
                    {(() => {
                      const petImage = resolvePetImage(featuredStudent.ownedPets[0]);
                      return (
                        <img
                          src={petImage.src}
                          alt={featuredStudent.ownedPets[0].name}
                          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32 rounded-full border-2 sm:border-3 border-purple-300 shadow-md"
                          data-fallbacks={serializeFallbacks(petImage.fallbacks)}
                          data-fallback-index="0"
                          onError={petImageErrorHandler}
                        />
                      );
                    })()}
                    <div className="text-center sm:text-left lg:text-left">
                      <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">
                        Companion: {featuredStudent.ownedPets[0].name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">🐾 Faithful Friend</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE-OPTIMIZED Class Stats Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            📊 Class Statistics
          </h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-blue-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700">👥 Total Champions</span>
              <span className="font-bold text-blue-600 text-lg sm:text-xl">{classStats.totalStudents}</span>
            </div>
            
            <div className="flex justify-between items-center p-2 sm:p-3 bg-green-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700">⚡ Average XP</span>
              <span className="font-bold text-green-600 text-lg sm:text-xl">{classStats.averageXP}</span>
            </div>
            
            <div className="flex justify-between items-center p-2 sm:p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700">💰 Total Coins</span>
              <span className="font-bold text-yellow-600 text-lg sm:text-xl">{classStats.totalCoins}</span>
            </div>
            
            <div className="flex justify-between items-center p-2 sm:p-3 bg-purple-50 rounded-lg">
              <span className="text-sm sm:text-base text-gray-700">🐾 With Pets</span>
              <span className="font-bold text-purple-600 text-lg sm:text-xl">{classStats.studentsWithPets}</span>
            </div>
          </div>

          {/* Level Distribution - MOBILE RESPONSIVE */}
          <div className="mt-4 sm:mt-6">
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Level Distribution</h3>
            <div className="space-y-1 sm:space-y-2">
              {[4, 3, 2, 1].map(level => (
                <div key={level} className="flex items-center gap-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getLevelBadgeColor(level)}`}></div>
                  <span className="text-xs sm:text-sm text-gray-600 flex-1">Level {level}</span>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    {classStats.levelDistribution?.[level] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE-OPTIMIZED Featured Shop & Class Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Featured Shop Specials - MOBILE RESPONSIVE */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-2xl sm:text-3xl">🛒</div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Today's Daily Deals</h2>
                <p className="text-xs sm:text-sm text-purple-600">Rotates automatically from the shop each day</p>
              </div>
            </div>
            <div className="text-xs bg-purple-200 px-2 py-1 rounded-full text-purple-800 font-semibold">Fresh Picks</div>
          </div>

          {todaysSpecials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {todaysSpecials.map((item) => (
                <div
                  key={item.id || item.name}
                  className="relative bg-white rounded-xl p-3 sm:p-4 shadow-md border border-purple-100 flex flex-col items-center text-center gap-2"
                >
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    -{item.salePercentage || 30}%
                  </div>
                  {item.type === 'reward' ? (
                    <div className="text-3xl sm:text-4xl">{item.icon || '🎁'}</div>
                  ) : (
                    <img
                      src={item.path}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-purple-100 object-contain"
                    />
                  )}
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-800 truncate max-w-[150px]">{item.name}</h3>
                    <p className="text-[11px] sm:text-xs text-purple-600 uppercase tracking-wide font-semibold">
                      {item.type === 'avatar' ? 'Avatar' : item.type === 'pet' ? 'Pet Companion' : 'Class Reward'}
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 line-through">💰 {item.originalPrice}</div>
                  <div className="text-base sm:text-lg font-bold text-yellow-600">💰 {item.price}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white bg-opacity-70 rounded-xl p-4 text-center text-sm sm:text-base text-gray-600">
              No specials available right now. Check back tomorrow for new deals!
            </div>
          )}
        </div>

        {/* Class Achievement Highlights - MOBILE RESPONSIVE */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
            🌟 Class Highlights
          </h2>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600">Most Active Champion</div>
              <div className="font-bold text-blue-600 text-sm sm:text-base">
                {classStats.topStudent?.firstName || 'None'}
              </div>
            </div>
            
            <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600">Class Total XP</div>
              <div className="font-bold text-green-600 text-sm sm:text-base">{classStats.totalXP || 0}</div>
            </div>
            
            <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600">Champions with Pets</div>
              <div className="font-bold text-purple-600 text-sm sm:text-base">
                {classStats.studentsWithPets || 0} / {classStats.totalStudents || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest product updates */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 sm:p-6 shadow-lg border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl sm:text-3xl">🎉</div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Latest Updates</h2>
            <p className="text-xs sm:text-sm text-yellow-700">Fresh news direct from Educational Elements HQ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {updatesToDisplay.map((update) => (
            <article
              key={update.id}
              className="bg-white rounded-lg border border-yellow-200 p-3 sm:p-4 shadow-sm flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className={`text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full border ${getUpdateBadgeStyles(update.status)}`}>
                  {(update.status || 'UPDATE').toUpperCase()}
                </span>
                {update.highlight && (
                  <span className="text-[10px] sm:text-xs text-yellow-700 font-medium truncate">{update.highlight}</span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">{update.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{update.summary}</p>
            </article>
          ))}
        </div>
      </div>

      {/* MOBILE-OPTIMIZED Top Performers */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
          🏆 Top Performers
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {students
            .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
            .slice(0, 3)
            .map((student, index) => (
              <div key={student.id} className={`p-3 sm:p-4 rounded-lg border-2 ${
                index === 0 ? 'border-yellow-400 bg-yellow-50' : 
                index === 1 ? 'border-gray-400 bg-gray-50' : 
                'border-orange-400 bg-orange-50'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <img 
                      src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} 
                      alt={student.firstName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className={`absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-500' : 
                      'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {student.firstName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">{student.totalPoints || 0} XP</div>
                  </div>
                  <div className="text-xl sm:text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        {/* Show message if no students */}
        {students.length === 0 && (
          <div className="text-center text-gray-500 py-4 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-2">👥</div>
            <p className="text-sm sm:text-base">No students added yet. Add some champions to see the leaderboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;