import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  calculateAvatarLevel,
  createPetEgg
} from '../../utils/gameHelpers';

const FISHING_COST = 5;
const WATER_DEPTH = 100;
const LANE_COUNT = 5;
const HOOK_DROP_SPEED = 3; // depth percentage per tick
const DROP_INTERVAL_MS = 120;

const LANE_OFFSETS = [10, 30, 50, 70, 90];

const randomBetween = (min, max) => Math.random() * (max - min) + min;
const pickOne = (items) => items[Math.floor(Math.random() * items.length)];

const PRIZE_TIERS = [
  {
    id: 'shallow',
    label: 'Shallow Waters',
    depth: [12, 30],
    prizes: [
      { type: 'coins', amount: 6, label: 'Shiny Shell', icon: '🐚', rarity: 'common', valueScore: 1 },
      { type: 'coins', amount: 8, label: 'Busy Crab', icon: '🦀', rarity: 'common', valueScore: 1.2 },
      { type: 'xp', amount: 8, label: 'Learning Minnow', icon: '🐟', rarity: 'common', valueScore: 1.1 }
    ]
  },
  {
    id: 'mid',
    label: 'Middle Depths',
    depth: [35, 65],
    prizes: [
      { type: 'coins', amount: 12, label: 'Silver Salmon', icon: '🐠', rarity: 'uncommon', valueScore: 2 },
      { type: 'xp', amount: 15, label: 'Brainy Trout', icon: '🐡', rarity: 'uncommon', valueScore: 2.1 },
      { type: 'collectible', label: 'Sunken Compass', icon: '🧭', rarity: 'rare', valueScore: 2.6 }
    ]
  },
  {
    id: 'deep',
    label: 'Deep Sea',
    depth: [70, 95],
    prizes: [
      { type: 'coins', amount: 25, label: 'Golden Treasure Chest', icon: '🧰', rarity: 'rare', valueScore: 3.5 },
      { type: 'xp', amount: 30, label: 'Legendary Lanternfish', icon: '🐠', rarity: 'epic', valueScore: 3.8 },
      { type: 'petEgg', label: 'Mystic Tide Egg', icon: '🥚', rarity: 'legendary', valueScore: 4.5 }
    ]
  }
];

const buildPrize = (tier) => {
  const prizeBase = pickOne(tier.prizes);
  return {
    ...prizeBase,
    id: `${tier.id}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`,
    lane: Math.floor(Math.random() * LANE_COUNT),
    depth: randomBetween(tier.depth[0], tier.depth[1]),
    direction: Math.random() > 0.5 ? 'left' : 'right',
    duration: randomBetween(6, 11),
    delay: randomBetween(0, 1.5),
    tier: tier.id
  };
};

const generatePrizesForRound = () => {
  const prizes = [];
  PRIZE_TIERS.forEach((tier) => {
    const count = tier.id === 'deep' ? 3 : 4;
    for (let index = 0; index < count; index += 1) {
      prizes.push(buildPrize(tier));
    }
  });
  return prizes;
};

const StudentFishingEvent = ({
  studentData,
  calculateCoins,
  updateStudentData,
  showToast,
  getAvatarImage
}) => {
  const [activePrizes, setActivePrizes] = useState([]);
  const [hookDepth, setHookDepth] = useState(0);
  const [hookLane, setHookLane] = useState(2);
  const [roundStatus, setRoundStatus] = useState('idle');
  const [lastResult, setLastResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Ready to cast your line?');

  const intervalRef = useRef(null);
  const prizesRef = useRef([]);
  const caughtPrizeRef = useRef(null);
  const resolvingRef = useRef(false);

  const coinsAvailable = calculateCoins(studentData);
  const avatarLevel = calculateAvatarLevel(studentData?.totalPoints || 0);
  const avatarImage = useMemo(
    () => getAvatarImage(studentData?.avatarBase, avatarLevel),
    [avatarLevel, getAvatarImage, studentData?.avatarBase]
  );

  useEffect(() => {
    prizesRef.current = activePrizes;
  }, [activePrizes]);

  const stopDropInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => stopDropInterval, [stopDropInterval]);

  const checkCollision = useCallback(
    (depth, lane) => {
      const windowSize = 6;
      const available = prizesRef.current;
      for (let index = 0; index < available.length; index += 1) {
        const prize = available[index];
        if (prize.lane !== lane) continue;
        if (Math.abs(prize.depth - depth) <= windowSize) {
          return prize;
        }
      }
      return null;
    },
    []
  );

  const handleCastLine = async () => {
    if (roundStatus !== 'idle') {
      return;
    }

    if (coinsAvailable < FISHING_COST) {
      showToast(`You need ${FISHING_COST} coins to go fishing.`, 'error');
      return;
    }

    setHookLane(Math.floor(Math.random() * LANE_COUNT));
    setHookDepth(0);
    setStatusMessage('Casting your line...');
    setLastResult(null);
    caughtPrizeRef.current = null;
    setActivePrizes(generatePrizesForRound());
    setRoundStatus('casting');
  };

  useEffect(() => {
    if (roundStatus !== 'casting') {
      return undefined;
    }

    stopDropInterval();

    intervalRef.current = setInterval(() => {
      setHookDepth((previous) => {
        const nextDepth = Math.min(previous + HOOK_DROP_SPEED, WATER_DEPTH);

        if (!caughtPrizeRef.current) {
          const collision = checkCollision(nextDepth, hookLane);
          if (collision) {
            caughtPrizeRef.current = collision;
            setStatusMessage(`You hooked a ${collision.label}!`);
            setRoundStatus('reeling');
            return nextDepth;
          }
        }

        if (nextDepth >= WATER_DEPTH) {
          setStatusMessage('Reeling in...');
          setRoundStatus('reeling');
          return nextDepth;
        }

        return nextDepth;
      });
    }, DROP_INTERVAL_MS);

    return () => {
      stopDropInterval();
    };
  }, [checkCollision, hookLane, roundStatus, stopDropInterval]);

  const resetRound = useCallback(() => {
    setActivePrizes([]);
    setHookDepth(0);
    setRoundStatus('idle');
    setStatusMessage('Ready to cast your line?');
    caughtPrizeRef.current = null;
    resolvingRef.current = false;
  }, []);

  const resolveRound = useCallback(async () => {
    if (resolvingRef.current) {
      return;
    }

    resolvingRef.current = true;
    stopDropInterval();

    const prize = caughtPrizeRef.current;
    const nowIso = new Date().toISOString();

    const previousStats = studentData?.fishingEventStats || {};
    const history = Array.isArray(previousStats.recentHistory)
      ? previousStats.recentHistory
      : [];

    const updatedStats = {
      ...previousStats,
      totalCasts: (previousStats.totalCasts || 0) + 1,
      totalCoinsSpent: (previousStats.totalCoinsSpent || 0) + FISHING_COST,
      totalPrizesWon: (previousStats.totalPrizesWon || 0) + (prize ? 1 : 0),
      lastPrizeName: prize ? prize.label : previousStats.lastPrizeName || null,
      lastPrizeRarity: prize ? prize.rarity : previousStats.lastPrizeRarity || null,
      lastPlayedAt: nowIso,
      biggestCatchValue: prize
        ? Math.max(previousStats.biggestCatchValue || 0, prize.valueScore || 0)
        : previousStats.biggestCatchValue || 0,
      recentHistory: prize
        ? [{ name: prize.label, rarity: prize.rarity, at: nowIso }, ...history].slice(0, 5)
        : history.slice(0, 5)
    };

    const updates = {
      coinsSpent: (studentData?.coinsSpent || 0) + FISHING_COST,
      fishingEventStats: updatedStats
    };

    let toastMessage = 'Nothing bit this time... better luck on the next cast!';
    let toastType = 'info';

    if (prize) {
      switch (prize.type) {
        case 'coins':
          updates.currency = (studentData?.currency || 0) + prize.amount;
          toastMessage = `You reeled in ${prize.amount} bonus coins!`;
          toastType = 'success';
          break;
        case 'xp':
          updates.totalPoints = (studentData?.totalPoints || 0) + prize.amount;
          toastMessage = `Your catch grants ${prize.amount} XP!`;
          toastType = 'success';
          break;
        case 'petEgg': {
          const newEgg = {
            ...createPetEgg(),
            awardedAt: nowIso,
            source: 'fishing-event',
            name: prize.label
          };
          updates.petEggs = [...(studentData?.petEggs || []), newEgg];
          toastMessage = `Incredible! You discovered the ${prize.label}!`;
          toastType = 'success';
          break;
        }
        case 'collectible':
          updates.fishingEventRewards = Array.from(
            new Set([...(studentData?.fishingEventRewards || []), prize.label])
          );
          toastMessage = `You recovered the ${prize.label}!`;
          toastType = 'success';
          break;
        default:
          break;
      }
    }

    const success = await updateStudentData(updates);

    if (!success) {
      showToast('We could not save your fishing results. Try again soon!', 'error');
      setLastResult({ success: false, prize });
      resetRound();
      return;
    }

    if (toastMessage) {
      showToast(toastMessage, toastType);
    }

    setLastResult({ success: true, prize, message: toastMessage, completedAt: nowIso });
    resetRound();
  }, [resetRound, showToast, studentData, stopDropInterval, updateStudentData]);

  useEffect(() => {
    if (roundStatus === 'reeling') {
      stopDropInterval();
      const timeout = setTimeout(() => {
        resolveRound();
      }, 600);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [resolveRound, roundStatus, stopDropInterval]);

  const fishingStats = studentData?.fishingEventStats || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>🎣 Deep Sea Fishing Event</span>
          </h2>
          <p className="text-sm md:text-base text-sky-100">
            Spend {FISHING_COST} coins to cast your line. Deeper waters hide the rarest treasures!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="text-xs uppercase tracking-wide text-sky-100">Coins Available</div>
            <div className="text-2xl font-bold">💰 {coinsAvailable}</div>
          </div>
          <button
            type="button"
            onClick={handleCastLine}
            disabled={roundStatus !== 'idle'}
            className={`px-4 py-2 rounded-xl font-semibold shadow-lg transition-transform active:scale-95 ${
              roundStatus === 'idle'
                ? 'bg-white text-blue-600 hover:bg-blue-50'
                : 'bg-blue-300 bg-opacity-50 text-blue-100 cursor-not-allowed'
            }`}
          >
            {roundStatus === 'idle' ? `Go Fishing (-${FISHING_COST} coins)` : 'Casting...'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="relative h-96 water-effect">
          {/* Avatar and Fishing Line */}
          <div
            className="absolute top-0 flex flex-col items-center z-20"
            style={{ left: `${LANE_OFFSETS[hookLane]}%`, transform: 'translate(-50%, -10%)' }}
          >
            <div className="bg-white bg-opacity-80 rounded-full p-2 shadow-md">
              <img
                src={avatarImage}
                alt="Your character"
                className="w-16 h-16 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = '/shop/Basic/Banana.png';
                }}
              />
            </div>
            <div
              className="w-1 bg-yellow-100 transition-all duration-100"
              style={{ height: `${hookDepth}%` }}
            ></div>
            <div
              className="w-6 h-6 bg-yellow-300 border-2 border-yellow-500 rounded-full flex items-center justify-center text-sm"
              style={{ transform: 'translateY(-50%)' }}
            >
              🪝
            </div>
          </div>

          {/* Prizes */}
          {activePrizes.map((prize) => (
            <div
              key={prize.id}
              className={`absolute flex flex-col items-center text-white font-semibold text-xs md:text-sm drop-shadow swim-${prize.direction}`}
              style={{
                top: `${prize.depth}%`,
                left: `${LANE_OFFSETS[prize.lane]}%`,
                animationDuration: `${prize.duration}s`,
                animationDelay: `${prize.delay}s`
              }}
            >
              <div className="text-3xl md:text-4xl">{prize.icon}</div>
              <div className="bg-black bg-opacity-30 px-2 py-1 rounded-full whitespace-nowrap">
                {prize.label}
              </div>
            </div>
          ))}

          {/* Depth markers */}
          <div className="absolute inset-0 pointer-events-none">
            {[20, 40, 60, 80, 100].map((marker) => (
              <div
                key={marker}
                className="absolute left-4 text-white text-xs opacity-70"
                style={{ top: `${marker}%`, transform: 'translateY(-50%)' }}
              >
                {marker}m
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-sky-50 border-t">
          <p className="text-sm text-blue-700 font-semibold">{statusMessage}</p>
          {lastResult && (
            <div className="mt-3 p-4 rounded-xl bg-white shadow-inner border border-blue-100">
              {lastResult.success ? (
                lastResult.prize ? (
                  <>
                    <div className="text-lg font-bold text-blue-700 flex items-center gap-2">
                      <span>{lastResult.prize.icon}</span>
                      <span>You caught the {lastResult.prize.label}!</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">{lastResult.message}</p>
                  </>
                ) : (
                  <p className="text-sm text-blue-600">No catch this time, but the waves are full of possibilities!</p>
                )
              ) : (
                <p className="text-sm text-red-600">We could not record your catch. Please try again.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Event Stats</h3>
          <dl className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <dt>Total Casts</dt>
              <dd>{fishingStats.totalCasts || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Prizes Won</dt>
              <dd>{fishingStats.totalPrizesWon || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Coins Spent</dt>
              <dd>{fishingStats.totalCoinsSpent || 0}</dd>
            </div>
            {fishingStats.lastPrizeName && (
              <div className="flex justify-between">
                <dt>Last Catch</dt>
                <dd>{fishingStats.lastPrizeName}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Recent Catches</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {(fishingStats.recentHistory || []).length > 0 ? (
              fishingStats.recentHistory.map((entry) => (
                <li key={`${entry.name}-${entry.at}`} className="flex items-center justify-between">
                  <span>{entry.name}</span>
                  <span className="text-xs uppercase tracking-wide text-blue-500">{entry.rarity}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">No catches yet. Cast your first line!</li>
            )}
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h3 className="text-lg font-bold text-blue-700 mb-2">Special Finds</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            {(studentData?.fishingEventRewards || []).length > 0 ? (
              studentData.fishingEventRewards.map((reward) => (
                <li key={reward} className="flex items-center gap-2">
                  <span>✨</span>
                  <span>{reward}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400">Discover rare treasures in the deep sea!</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentFishingEvent;
