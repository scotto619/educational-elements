// components/student/StudentDashboard.js - UPDATED: Avatar now matches equipped avatar on main site
import React, { useMemo } from 'react';
import { DEFAULT_PET_IMAGE } from '../../utils/gameHelpers';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';
import { CARD_EFFECT_MAP } from '../../constants/cardEffects';

const StudentDashboard = ({
  studentData,
  classData,
  getAvatarImage,
  getPetImage,
  calculateCoins,
  calculateAvatarLevel,
  dailyMysteryBoxAvailable = false,
  onOpenDailyMysteryBox,
  noticeBoardItems = []
}) => {
  const level = calculateAvatarLevel(studentData?.totalPoints || 0);
  const coins = calculateCoins(studentData);
  const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);
  const equippedEffect = useMemo(() => CARD_EFFECT_MAP[studentData?.equippedCardEffect], [studentData?.equippedCardEffect]);
  const effectAccent = equippedEffect?.colors?.[0];

  const resolvePetImage = (pet) => normalizeImageSource(getPetImage(pet), DEFAULT_PET_IMAGE);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
        <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Welcome back, {studentData?.firstName}! 🎉</h2>
        <p className="text-purple-100 text-sm md:text-base">Ready to continue your classroom adventure?</p>
      </div>

      {/* Notice Board */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-purple-100">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <div className="text-xl md:text-2xl">📌</div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Class Notice Board</h3>
            <p className="text-xs md:text-sm text-gray-500">Updates from your teacher appear here automatically.</p>
          </div>
        </div>

        {noticeBoardItems?.length > 0 ? (
          <div className="space-y-3">
            {noticeBoardItems.map((item) => (
              <div key={item.id} className="bg-purple-50 border border-purple-100 rounded-lg p-3 md:p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-purple-900">{item.title}</h4>
                    {item.content && (
                      <p className="text-xs md:text-sm text-purple-800 mt-1 whitespace-pre-wrap">{item.content}</p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs md:text-sm text-purple-700 font-semibold mt-2 hover:underline"
                      >
                        Open link ↗
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-purple-700 font-semibold">NEW</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No notices yet. Check back soon!</p>
        )}
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {/* Avatar & Level - UPDATED: Shows equipped avatar */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg text-center relative overflow-hidden">
          {equippedEffect && (
            <>
              <div
                className={`absolute inset-0 blur-2xl pointer-events-none ${
                  equippedEffect.preview?.auraClass || 'bg-purple-100/60'
                }`}
              />
              <div
                className={`absolute inset-0 rounded-xl pointer-events-none ${equippedEffect.preview?.ringClass || ''} ${
                  equippedEffect.preview?.animationClass || ''
                }`}
              />
            </>
          )}
          <div className="relative z-10">
            <img
              src={getAvatarImage(studentData?.avatarBase, level)}
              alt="Your Avatar"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 md:mb-4 border-4 border-purple-300"
              style={{
                borderColor: effectAccent || undefined,
                boxShadow: effectAccent ? `0 0 24px ${effectAccent}66` : undefined
              }}
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
            <h3 className="text-base md:text-lg font-bold text-gray-800">Level {level}</h3>
            <p className="text-purple-600 font-semibold text-sm md:text-base">Champion</p>
            {equippedEffect && (
              <p className="text-[11px] md:text-xs font-semibold text-indigo-700 mt-1">
                {equippedEffect.name} equipped
              </p>
            )}
          </div>
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

        {/* Pet - UPDATED: Shows equipped pet properly */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg text-center">
          {studentData?.ownedPets && studentData.ownedPets.length > 0 ? (
            <div>
              {(() => {
                const petImage = resolvePetImage(studentData.ownedPets[0]);
                return (
                  <img
                    src={petImage.src}
                    alt="Your Pet"
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1 md:mb-2 border-2 border-green-300"
                    data-fallbacks={serializeFallbacks(petImage.fallbacks)}
                    data-fallback-index="0"
                    onError={petImageErrorHandler}
                  />
                );
              })()}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          <button
            type="button"
            onClick={() => onOpenDailyMysteryBox?.()}
            className={`relative overflow-hidden rounded-lg p-3 md:p-4 text-left transition-all active:scale-95 shadow-lg ${
              dailyMysteryBoxAvailable
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${onOpenDailyMysteryBox ? '' : 'cursor-not-allowed'}`}
            disabled={!onOpenDailyMysteryBox}
          >
            <div className="text-xl md:text-2xl mb-1">🎁</div>
            <div className="text-xs md:text-sm font-semibold">
              {dailyMysteryBoxAvailable ? 'Claim Daily Mystery Box' : 'Daily Mystery Box'}
            </div>
            <div className={`text-[10px] md:text-xs mt-1 ${dailyMysteryBoxAvailable ? 'text-purple-100' : 'text-gray-500'}`}>
              {dailyMysteryBoxAvailable ? 'Free reward waiting!' : 'Come back tomorrow'}
            </div>
          </button>

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