// components/student/StudentDashboard.js - UPDATED: Avatar now matches equipped avatar on main site
import React, { useMemo } from 'react';
import { DEFAULT_PET_IMAGE } from '../../utils/gameHelpers';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';
import { CARD_EFFECT_MAP } from '../../constants/cardEffects';

const CLASS_REWARD_TIERS = [
  { xp: 1000, label: 'Class Prize 1' },
  { xp: 2000, label: 'Class Prize 2' },
  { xp: 3000, label: 'Class Prize 3' },
  { xp: 4000, label: 'Class Prize 4' },
  { xp: 5000, label: 'Major Prize' }
];

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

  const classTotalXP = useMemo(() => {
    const roster = classData?.students || [];
    return roster.reduce((sum, student) => sum + (student.totalPoints || 0), 0);
  }, [classData?.students]);

  const classRewardProgress = useMemo(() => {
    const maxTierXP = CLASS_REWARD_TIERS[CLASS_REWARD_TIERS.length - 1].xp;
    const progress = Math.min(100, Math.round((classTotalXP / maxTierXP) * 100));
    const nextTier = CLASS_REWARD_TIERS.find((tier) => classTotalXP < tier.xp);

    return {
      progress,
      nextTier,
      nextMessage: nextTier
        ? `${Math.max(0, nextTier.xp - classTotalXP)} XP until ${nextTier.label}`
        : '🎉 Major prize unlocked!'
    };
  }, [classTotalXP]);

  const resolvePetImage = (pet) => normalizeImageSource(getPetImage(pet), DEFAULT_PET_IMAGE);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Card - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
        <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">Welcome back, {studentData?.firstName}! 🎉</h2>
        <p className="text-purple-100 text-sm md:text-base">Ready to continue your classroom adventure?</p>
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

      {/* Class Reward Scale */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border border-purple-100 rounded-xl p-4 md:p-6 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🎁</div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Whole class progress</p>
              <h3 className="text-lg md:text-xl font-bold text-purple-800">Class Reward Scale</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs md:text-sm text-gray-500">Total class XP</p>
            <p className="text-xl md:text-2xl font-bold text-purple-700">{classTotalXP.toLocaleString()} XP</p>
          </div>
        </div>

        <div className="relative h-3 md:h-4 bg-white rounded-full overflow-hidden border border-purple-100">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-sm"
            style={{ width: `${classRewardProgress.progress}%` }}
          ></div>
          <div className="absolute inset-0 flex justify-between">
            {CLASS_REWARD_TIERS.map((tier) => {
              const reached = classTotalXP >= tier.xp;
              return (
                <div key={tier.xp} className="relative flex-1">
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 ${
                      reached ? 'bg-amber-400 border-amber-500 shadow-sm' : 'bg-white border-purple-200'
                    }`}
                    style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-5 gap-2 text-center text-[10px] md:text-xs font-semibold text-purple-700">
          {CLASS_REWARD_TIERS.map((tier) => {
            const reached = classTotalXP >= tier.xp;
            return (
              <div
                key={tier.xp}
                className={`px-2 py-1 rounded-lg border ${
                  reached ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-purple-100 text-purple-600'
                }`}
              >
                <div className="font-bold">{tier.xp.toLocaleString()} XP</div>
                <div>{tier.label}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm text-gray-700">
          <span className="font-semibold text-purple-800">{classRewardProgress.nextMessage}</span>
          <span className="text-gray-500">{classRewardProgress.progress}% of 5,000 XP</span>
        </div>
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

    </div>
  );
};

export default StudentDashboard;
