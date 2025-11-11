// components/student/StudentShop.js - UPDATED WITH HALLOWEEN SUPPORT
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import {
  PET_EGG_TYPES,
  createPetEgg,
  advanceEggStage,
  getEggStageStatus,
  resolveEggHatch,
  getEggTypeById,
  EGG_STAGE_ART,
  EGG_STAGE_MESSAGES,
  getEggStageArt,
  DEFAULT_PET_IMAGE
} from '../../utils/gameHelpers';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';
import CardPackOpeningModal from './cards/CardPackOpeningModal';
import CardBookModal from './cards/CardBookModal';
import {
  DEFAULT_CARD_PACKS,
  buildTradingCardLibrary,
  drawCardsFromPack,
  summarizeCardPull,
  CARD_RARITY_STYLES,
  CARD_RARITY_ORDER,
  CARD_TYPE_LABELS,
  getCollectionProgress,
  getRarityBreakdown,
  getCardLibraryMap
} from '../../utils/tradingCards';

// ===============================================
// MYSTERY BOX SYSTEM (SHARED WITH TEACHER SHOP)
// ===============================================

const defaultEggArt = (EGG_STAGE_ART?.unbroken && EGG_STAGE_ART.unbroken.src) || '/shop/Egg/Egg.png';
const eggImageErrorHandler = createImageErrorHandler(defaultEggArt);
const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);

const resolveEggArt = (stage) => normalizeImageSource(getEggStageArt(stage), defaultEggArt);

const resolvePetArt = (source) => normalizeImageSource(source, DEFAULT_PET_IMAGE);

const MYSTERY_BOX_PRICE = 10;

const LOOT_WELL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const LOOT_WELL_PRIZE_CHANCE = 0.18; // ~18% chance to surface a prize
const MAX_LOOT_WELL_HISTORY = 12;

// Define rarity weights (higher = more common)
const RARITY_WEIGHTS = {
  common: 50,     // 50% base chance
  uncommon: 30,   // 30% base chance
  rare: 15,       // 15% base chance
  epic: 4,        // 4% base chance
  legendary: 1    // 1% base chance
};

// Eggs should be a bit easier to find than other items that share their rarity tier
const EGG_RARITY_WEIGHT_BOOST = 3;

// Define XP and Coin rewards by rarity
const MYSTERY_REWARDS = {
  xp: {
    common: [3, 5, 8],
    uncommon: [10, 12, 15],
    rare: [18, 20, 25],
    epic: [30, 35, 40],
    legendary: [50, 75, 100]
  },
  coins: {
    common: [2, 3, 5],
    uncommon: [8, 10, 12],
    rare: [15, 18, 20],
    epic: [25, 30, 35],
    legendary: [40, 50, 60]
  }
};

// Function to determine item rarity based on price
const getItemRarity = (price) => {
  if (price <= 12) return 'common';
  if (price <= 20) return 'uncommon';
  if (price <= 30) return 'rare';
  if (price <= 45) return 'epic';
  return 'legendary';
};

// Function to get all possible mystery box prizes (includes Halloween items via props)
const getMysteryBoxPrizes = (
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  classRewards,
  HALLOWEEN_BASIC_AVATARS = [],
  HALLOWEEN_PREMIUM_AVATARS = [],
  HALLOWEEN_PETS = [],
  EGG_TYPES = PET_EGG_TYPES,
  CARD_PACKS = []
) => {
  const prizes = [];

  // Add shop avatars (includes Halloween avatars passed from parent)
  [
    ...SHOP_BASIC_AVATARS,
    ...SHOP_PREMIUM_AVATARS,
    ...HALLOWEEN_BASIC_AVATARS,
    ...HALLOWEEN_PREMIUM_AVATARS
  ].forEach(avatar => {
    prizes.push({
      type: 'avatar',
      item: avatar,
      rarity: getItemRarity(avatar.price),
      name: avatar.name,
      displayName: avatar.name
    });
  });

  // Add shop pets (includes Halloween pets passed from parent)
  [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS].forEach(pet => {
    prizes.push({
      type: 'pet',
      item: pet,
      rarity: getItemRarity(pet.price),
      name: pet.name,
      displayName: pet.name
    });
  });

  // Add eggs
  (EGG_TYPES || []).forEach(eggType => {
    prizes.push({
      type: 'egg',
      eggTypeId: eggType.id,
      eggType,
      rarity: eggType.rarity,
      name: `${eggType.name} Egg`,
      displayName: `${eggType.name} Egg`,
      icon: '🥚'
    });
  });
  
  // Add class rewards
  (classRewards || []).forEach(reward => {
    prizes.push({
      type: 'reward',
      item: reward,
      rarity: getItemRarity(reward.price),
      name: reward.name,
      displayName: reward.name
    });
  });
  
  // Add XP rewards
  Object.entries(MYSTERY_REWARDS.xp).forEach(([rarity, amounts]) => {
    amounts.forEach(amount => {
      prizes.push({
        type: 'xp',
        amount: amount,
        rarity: rarity,
        name: `${amount} XP`,
        displayName: `${amount} XP Boost`,
        icon: '⭐'
      });
    });
  });
  
  // Add coin rewards
  Object.entries(MYSTERY_REWARDS.coins).forEach(([rarity, amounts]) => {
    amounts.forEach(amount => {
      prizes.push({
        type: 'coins',
        amount: amount,
        rarity: rarity,
        name: `${amount} Coins`,
        displayName: `${amount} Bonus Coins`,
        icon: '💰'
      });
    });
  });

  (CARD_PACKS || []).forEach(pack => {
    prizes.push({
      type: 'card_pack',
      pack,
      rarity: pack.rarity || 'rare',
      name: pack.name,
      displayName: pack.name,
      icon: pack.icon || '🃏'
    });
  });

  return prizes;
};

// Weighted random selection function
const selectRandomPrize = (prizes) => {
  // Create weighted array
  const weightedPrizes = [];
  prizes.forEach(prize => {
    const baseWeight = RARITY_WEIGHTS[prize.rarity] || 1;
    const weightBoost = prize.type === 'egg' ? EGG_RARITY_WEIGHT_BOOST : 1;
    const weight = Math.max(1, Math.round(baseWeight * weightBoost));
    for (let i = 0; i < weight; i++) {
      weightedPrizes.push(prize);
    }
  });
  
  // Select random prize
  const randomIndex = Math.floor(Math.random() * weightedPrizes.length);
  return weightedPrizes[randomIndex];
};

// Get rarity color
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 border-gray-300';
    case 'uncommon': return 'text-green-600 border-green-300';
    case 'rare': return 'text-blue-600 border-blue-300';
    case 'epic': return 'text-purple-600 border-purple-300';
    case 'legendary': return 'text-yellow-600 border-yellow-300';
    default: return 'text-gray-600 border-gray-300';
  }
};

const getRarityBg = (rarity) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100';
    case 'uncommon': return 'bg-green-100';
    case 'rare': return 'bg-blue-100';
    case 'epic': return 'bg-purple-100';
    case 'legendary': return 'bg-yellow-100';
    default: return 'bg-gray-100';
  }
};

const formatDuration = (ms) => {
  if (!ms || ms <= 0) {
    return '0s';
  }

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (hours === 0 && seconds > 0) {
    parts.push(`${seconds}s`);
  }

  return parts.join(' ') || '0s';
};

const isSameCalendarDay = (dateA, dateB) => {
  if (!(dateA instanceof Date) || !(dateB instanceof Date)) {
    return false;
  }

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const parseDateValue = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const parsed = value.toDate();
      return parsed instanceof Date && !Number.isNaN(parsed.getTime()) ? parsed : null;
    }

    if (typeof value.seconds === 'number') {
      const milliseconds = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1e6);
      const parsed = new Date(milliseconds);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
  }

  return null;
};

const cloneCardCollection = (collection = {}) => ({
  packs: { ...(collection.packs || {}) },
  cards: { ...(collection.cards || {}) },
  history: Array.isArray(collection.history) ? [...collection.history] : [],
  totalOpened: collection.totalOpened || 0,
  lastOpenedAt: collection.lastOpenedAt || null
});

const applyPrizeToStudentBase = ({
  prize,
  studentData,
  showToast = () => {},
  createSnapshot,
  baseUpdates = {},
  timestamp,
  nowIso
}) => {
  if (!prize) {
    return { ...baseUpdates };
  }

  const updates = { ...baseUpdates };
  const resolvedTimestamp = typeof timestamp === 'number' ? timestamp : Date.now();
  const resolvedIso = nowIso || new Date(resolvedTimestamp).toISOString();

  switch (prize.type) {
    case 'avatar': {
      const avatarName = prize.item?.name;
      if (avatarName) {
        const existing = new Set([...(studentData?.ownedAvatars || [])]);
        if (Array.isArray(updates.ownedAvatars)) {
          updates.ownedAvatars.forEach(name => existing.add(name));
        }
        existing.add(avatarName);
        updates.ownedAvatars = [...existing];
        showToast(`You won the ${avatarName} avatar!`, 'success');
      }
      break;
    }
    case 'pet': {
      const petName = prize.item?.name;
      if (petName) {
        const newPet = { ...prize.item, id: prize.item?.id || `pet_${resolvedTimestamp}` };
        const existingPets = Array.isArray(updates.ownedPets)
          ? updates.ownedPets
          : [...(studentData?.ownedPets || [])];
        updates.ownedPets = [...existingPets, newPet];
        showToast(`You won a ${petName}!`, 'success');
      }
      break;
    }
    case 'egg': {
      const eggType = prize.eggType || getEggTypeById(prize.eggTypeId) || prize.item;
      if (eggType) {
        const newEgg = createPetEgg(eggType);
        const eggs = Array.isArray(updates.petEggs)
          ? updates.petEggs
          : [...(studentData?.petEggs || [])];
        updates.petEggs = [...eggs, newEgg];
        const rarityLabel = (newEgg.rarity || '').toUpperCase();
        const flair = rarityLabel ? `${rarityLabel} ` : '';
        showToast(`You discovered a ${flair}${newEgg.name}!`, newEgg.rarity === 'legendary' ? 'success' : 'info');
      }
      break;
    }
    case 'reward': {
      const rewardItem = prize.item;
      if (rewardItem) {
        const rewards = Array.isArray(updates.rewardsPurchased)
          ? updates.rewardsPurchased
          : [...(studentData?.rewardsPurchased || [])];
        updates.rewardsPurchased = [
          ...rewards,
          {
            ...rewardItem,
            purchasedAt: resolvedIso
          }
        ];
        showToast(`You won ${rewardItem.name}!`, 'success');
      }
      break;
    }
    case 'xp': {
      const totalPoints = (updates.totalPoints ?? studentData?.totalPoints ?? 0) + (prize.amount || 0);
      updates.totalPoints = totalPoints;
      showToast(`You won ${prize.amount || 0} XP!`, 'success');
      break;
    }
    case 'coins': {
      const currency = (updates.currency ?? studentData?.currency ?? 0) + (prize.amount || 0);
      updates.currency = currency;
      showToast(`You won ${prize.amount || 0} bonus coins!`, 'success');
      break;
    }
    case 'card_pack': {
      const pack = prize.pack;
      if (pack) {
        const snapshot = typeof createSnapshot === 'function'
          ? createSnapshot()
          : cloneCardCollection(studentData?.cardCollection || {});
        const packs = { ...(snapshot.packs || {}) };
        const entry = packs[pack.id] || { count: 0 };
        packs[pack.id] = {
          ...entry,
          count: (entry.count || 0) + 1,
          lastObtainedAt: resolvedIso
        };

        updates.cardCollection = {
          ...snapshot,
          packs,
          cards: { ...(snapshot.cards || {}) },
          history: Array.isArray(snapshot.history) ? [...snapshot.history] : [],
          totalOpened: snapshot.totalOpened || 0,
          lastOpenedAt: snapshot.lastOpenedAt || null
        };

        showToast(`You discovered a ${pack.name}!`, pack.rarity === 'legendary' ? 'success' : 'info');
      }
      break;
    }
    default: {
      if (prize.name) {
        showToast(`You received ${prize.name}!`, 'success');
      }
    }
  }

  return updates;
};

const getEggAccent = (egg) => {
  if (!egg) return '#6366f1';
  if (egg.accent) return egg.accent;
  switch (egg.rarity) {
    case 'common':
      return '#6b7280';
    case 'uncommon':
      return '#16a34a';
    case 'rare':
      return '#2563eb';
    case 'epic':
      return '#7c3aed';
    case 'legendary':
      return '#f59e0b';
    default:
      return '#6366f1';
  }
};

const getPrizeDisplayName = (prize) => {
  if (!prize) {
    return '';
  }

  switch (prize.type) {
    case 'avatar':
      return prize.item?.name || 'Mystery Avatar';
    case 'pet':
      return prize.item?.name || 'Mystery Pet';
    case 'reward':
      return prize.item?.name || 'Class Reward';
    case 'egg': {
      const eggName = prize.eggType?.name || prize.item?.name || prize.name;
      return eggName ? `${eggName} Egg` : 'Mystery Egg';
    }
    case 'xp':
      return `${prize.amount || 0} XP`;
    case 'coins':
      return `${prize.amount || 0} Coins`;
    case 'card_pack':
      return prize.pack?.name || 'Mystery Card Pack';
    default:
      return prize.name || 'Mystery Prize';
  }
};

// ===============================================
// SELLING SYSTEM
// ===============================================

// Calculate sell price (25% of original cost)
const calculateSellPrice = (originalPrice) => {
  return Math.max(1, Math.floor(originalPrice * 0.25));
};

// Find original item price from shop data (includes Halloween items)
const findOriginalPrice = (
  itemName,
  itemType,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  classRewards,
  HALLOWEEN_BASIC_AVATARS = [],
  HALLOWEEN_PREMIUM_AVATARS = [],
  HALLOWEEN_PETS = []
) => {
  if (itemType === 'avatar') {
    const basicAvatar = SHOP_BASIC_AVATARS.find(a => a.name === itemName);
    const premiumAvatar = SHOP_PREMIUM_AVATARS.find(a => a.name === itemName);
    const halloweenBasic = HALLOWEEN_BASIC_AVATARS.find(a => a.name === itemName);
    const halloweenPremium = HALLOWEEN_PREMIUM_AVATARS.find(a => a.name === itemName);
    return basicAvatar?.price || premiumAvatar?.price || halloweenBasic?.price || halloweenPremium?.price || 10; // Default if not found
  } else if (itemType === 'pet') {
    const basicPet = SHOP_BASIC_PETS.find(p => p.name === itemName);
    const premiumPet = SHOP_PREMIUM_PETS.find(p => p.name === itemName);
    const halloweenPet = HALLOWEEN_PETS.find(p => p.name === itemName);
    return basicPet?.price || premiumPet?.price || halloweenPet?.price || 15; // Default if not found
  } else if (itemType === 'reward') {
    const reward = (classRewards || []).find(r => r.id === itemName || r.name === itemName);
    return reward?.price || 10; // Default if not found
  }
  return 10; // Fallback default
};

const INITIAL_TRADE_MODAL_STATE = {
  visible: false,
  type: null,
  item: null,
  stage: 'select',
  selectedPartnerId: null,
  selectedPartnerItem: null,
  result: null
};

const TRADE_TYPE_LABELS = {
  avatar: 'Avatar',
  pet: 'Pet',
  card: 'Card'
};

const DEFAULT_CARD_PACK_OPENING_STATE = {
  visible: false,
  pack: null,
  stage: 'charging',
  cards: [],
  results: []
};

export const StudentLootWellSection = ({
  studentData,
  updateStudentData,
  showToast = () => {},
  SHOP_BASIC_AVATARS = [],
  SHOP_PREMIUM_AVATARS = [],
  SHOP_BASIC_PETS = [],
  SHOP_PREMIUM_PETS = [],
  HALLOWEEN_BASIC_AVATARS = [],
  HALLOWEEN_PREMIUM_AVATARS = [],
  HALLOWEEN_PETS = [],
  classRewards = []
}) => {
  const [lootWellResult, setLootWellResult] = useState(null);
  const [lootWellCountdown, setLootWellCountdown] = useState('');
  const [lootWellAnimating, setLootWellAnimating] = useState(false);

  const lootWellStats = studentData?.lootWell || {};

  const lastLootWellAttempt = useMemo(
    () => parseDateValue(lootWellStats.lastDrawAt),
    [lootWellStats.lastDrawAt]
  );

  const nextLootWellAvailability = useMemo(() => {
    if (!lastLootWellAttempt) {
      return null;
    }

    return new Date(lastLootWellAttempt.getTime() + LOOT_WELL_COOLDOWN_MS);
  }, [lastLootWellAttempt]);

  const lootWellReady = !nextLootWellAvailability || nextLootWellAvailability.getTime() <= Date.now();

  useEffect(() => {
    if (!nextLootWellAvailability || lootWellReady) {
      setLootWellCountdown('');
      return undefined;
    }

    const updateCountdown = () => {
      const remaining = nextLootWellAvailability.getTime() - Date.now();
      setLootWellCountdown(formatDuration(remaining));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);
    return () => clearInterval(intervalId);
  }, [lootWellReady, nextLootWellAvailability]);

  useEffect(() => {
    if (!lootWellResult) {
      return undefined;
    }

    const timeoutId = setTimeout(() => setLootWellResult(null), 6000);
    return () => clearTimeout(timeoutId);
  }, [lootWellResult]);

  const availablePrizes = useMemo(
    () =>
      getMysteryBoxPrizes(
        SHOP_BASIC_AVATARS,
        SHOP_PREMIUM_AVATARS,
        SHOP_BASIC_PETS,
        SHOP_PREMIUM_PETS,
        classRewards,
        HALLOWEEN_BASIC_AVATARS,
        HALLOWEEN_PREMIUM_AVATARS,
        HALLOWEEN_PETS,
        PET_EGG_TYPES,
        DEFAULT_CARD_PACKS
      ),
    [
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      classRewards,
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      HALLOWEEN_PETS
    ]
  );

  const applyPrize = useCallback(
    (prize, baseUpdates = {}, options = {}) =>
      applyPrizeToStudentBase({
        prize,
        studentData,
        showToast,
        baseUpdates,
        timestamp: options.timestamp,
        nowIso: options.nowIso,
        createSnapshot: () => cloneCardCollection(studentData?.cardCollection || {})
      }),
    [studentData, showToast]
  );

  const lootWellHistory = useMemo(() => {
    const history = lootWellStats.history;
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }

    return history.slice(-6).reverse();
  }, [lootWellStats.history]);

  const handleLootWellDraw = useCallback(async () => {
    if (lootWellAnimating) {
      return;
    }

    if (!lootWellReady) {
      if (nextLootWellAvailability) {
        const remaining = nextLootWellAvailability.getTime() - Date.now();
        showToast(`The Loot Well is recharging. Try again in ${formatDuration(remaining)}.`, 'info');
      } else {
        showToast('The Loot Well is recharging. Come back soon!', 'info');
      }
      return;
    }

    setLootWellAnimating(true);
    setLootWellResult(null);

    const timestamp = Date.now();
    const nowIso = new Date(timestamp).toISOString();

    let selectedPrize = null;
    let outcome = 'miss';

    if (availablePrizes.length > 0 && Math.random() < LOOT_WELL_PRIZE_CHANCE) {
      selectedPrize = selectRandomPrize(availablePrizes);
      outcome = 'prize';
    }

    let updates = {};
    if (selectedPrize) {
      updates = applyPrize(selectedPrize, updates, { timestamp, nowIso });
    }

    const historySource = Array.isArray(lootWellStats.history) ? lootWellStats.history : [];
    const trimmedHistory = historySource.slice(
      Math.max(0, historySource.length - (MAX_LOOT_WELL_HISTORY - 1))
    );

    const historyEntry = {
      id: `lootwell_${timestamp}`,
      outcome,
      rarity: selectedPrize?.rarity || null,
      prizeName: selectedPrize ? getPrizeDisplayName(selectedPrize) : null,
      timestamp: nowIso
    };

    updates.lootWell = {
      lastDrawAt: nowIso,
      lastOutcome: outcome,
      lastPrize: selectedPrize
        ? {
            type: selectedPrize.type,
            name: getPrizeDisplayName(selectedPrize),
            rarity: selectedPrize.rarity || null,
            amount: selectedPrize.amount || 1
          }
        : null,
      history: [...trimmedHistory, historyEntry],
      totalAttempts: (lootWellStats.totalAttempts || 0) + 1,
      totalWins: (lootWellStats.totalWins || 0) + (outcome === 'prize' ? 1 : 0)
    };

    const success = await updateStudentData(updates);

    if (success) {
      if (!selectedPrize) {
        showToast('The well shimmered, but no treasure surfaced this time. Come back in an hour!', 'info');
      }

      setLootWellResult({ outcome, prize: selectedPrize, entry: historyEntry });
    } else {
      showToast('The well magic fizzled. Please try again.', 'error');
    }

    setLootWellAnimating(false);
  }, [
    applyPrize,
    availablePrizes,
    lootWellAnimating,
    lootWellReady,
    lootWellStats.history,
    lootWellStats.totalAttempts,
    lootWellStats.totalWins,
    nextLootWellAvailability,
    showToast,
    updateStudentData
  ]);

  const lastPrize = lootWellStats.lastPrize;

  const renderHistoryItem = (entry) => {
    const date = entry.timestamp ? new Date(entry.timestamp) : null;
    const timeLabel = date && !Number.isNaN(date.getTime())
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';

    return (
      <li
        key={entry.id}
        className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">
            {entry.outcome === 'prize' ? '✨' : '💧'}
          </span>
          <div>
            <p className="font-semibold text-slate-100">
              {entry.outcome === 'prize' ? entry.prizeName || 'Mystery Prize' : 'No prize this time'}
            </p>
            {entry.rarity && (
              <p className="text-xs uppercase tracking-wide text-slate-300">{entry.rarity}</p>
            )}
          </div>
        </div>
        {timeLabel && <span className="text-xs text-slate-300">{timeLabel}</span>}
      </li>
    );
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_300px] md:p-8">
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">💠</span>
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">The Loot Well</h2>
                <p className="text-sm text-slate-300 md:text-base">
                  Whisper a wish once an hour for a chance at avatars, pets, eggs, coins, XP, or card packs.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-200">
              {lootWellReady ? 'Ready now' : `Recharging • ${lootWellCountdown || 'Soon'}`}
            </div>
          </div>

          {lastPrize && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-200">
              <span className="text-xl">{lastPrize.rarity ? '🌟' : '🎁'}</span>
              <div>
                <p className="font-semibold text-slate-100">Last prize: {lastPrize.name}</p>
                {lastPrize.rarity && (
                  <p className="text-xs uppercase tracking-wide text-slate-300">{lastPrize.rarity}</p>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleLootWellDraw}
            disabled={!lootWellReady || lootWellAnimating}
            className={`w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-6 py-4 text-lg font-semibold tracking-wide transition-all ${
              lootWellReady && !lootWellAnimating
                ? 'hover:from-cyan-300 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-200'
                : 'cursor-not-allowed opacity-60'
            }`}
          >
            {lootWellReady ? (lootWellAnimating ? 'Drawing your wish…' : 'Make a wish') : 'Come back soon'}
          </button>

          {lootWellResult && (
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100">
              {lootWellResult.outcome === 'prize'
                ? `✨ The waters erupt with ${getPrizeDisplayName(lootWellResult.prize)}!`
                : 'The waters were calm. Try again later!'}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-2xl bg-white/10 p-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-200">Recent wishes</h3>
            {lootWellHistory.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {lootWellHistory.map(renderHistoryItem)}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-300">No wishes yet—be the first to try the well!</p>
            )}
          </div>

          <div className="rounded-xl bg-white/5 p-3 text-xs text-slate-300">
            <p className="font-semibold text-slate-100">How it works</p>
            <p className="mt-2 leading-relaxed">
              You can make one wish every hour. Lucky wishes surface rare prizes, including premium items and card packs.
            </p>
            <p className="mt-2">Wishes made: {lootWellStats.totalAttempts || 0}</p>
            <p>Prizes found: {lootWellStats.totalWins || 0}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const StudentShop = ({
  studentData,
  updateStudentData,
  showToast = () => {},
  getAvatarImage,
  getPetImage,
  calculateCoins,
  calculateAvatarLevel,
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_BASIC_AVATARS = [],
  HALLOWEEN_PREMIUM_AVATARS = [],
  HALLOWEEN_PETS = [],
  classRewards,
  classmates = [],
  classData = null,
  performClassmateTrade = null
}) => {
  const [activeCategory, setActiveCategory] = useState('card_packs');
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });
  const [respondingTradeId, setRespondingTradeId] = useState(null);

  // Mystery Box states
  const [mysteryBoxModal, setMysteryBoxModal] = useState({ visible: false, stage: 'confirm' }); // confirm, opening, reveal
  const [mysteryBoxPrize, setMysteryBoxPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Selling states
  const [sellModal, setSellModal] = useState({ visible: false, item: null, type: null, price: 0 });
  const [showSellMode, setShowSellMode] = useState(false);

  // Trading states
  const [tradeModal, setTradeModal] = useState(INITIAL_TRADE_MODAL_STATE);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);

  // Trading card states
  const [cardBookVisible, setCardBookVisible] = useState(false);
  const [cardPackOpening, setCardPackOpening] = useState({ ...DEFAULT_CARD_PACK_OPENING_STATE });
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const packAnimationTimeoutsRef = useRef([]);

  const clearPackAnimationTimeouts = useCallback(() => {
    packAnimationTimeoutsRef.current.forEach(timeoutId => clearTimeout(timeoutId));
    packAnimationTimeoutsRef.current = [];
  }, []);

  const schedulePackTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      callback();
      packAnimationTimeoutsRef.current = packAnimationTimeoutsRef.current.filter(id => id !== timeoutId);
    }, delay);

    packAnimationTimeoutsRef.current.push(timeoutId);
  }, []);

  useEffect(() => () => {
    clearPackAnimationTimeouts();
  }, [clearPackAnimationTimeouts]);

  // Egg celebrations
  const [hatchingCelebration, setHatchingCelebration] = useState(null);

  const currentCoins = calculateCoins(studentData);

  const studentEggs = useMemo(() => studentData?.petEggs || [], [studentData?.petEggs]);

  const cardCollection = useMemo(
    () => cloneCardCollection(studentData?.cardCollection || {}),
    [studentData?.cardCollection]
  );

  const tradingCardLibrary = useMemo(
    () =>
      buildTradingCardLibrary({
        avatars: [
          ...(SHOP_BASIC_AVATARS || []),
          ...(SHOP_PREMIUM_AVATARS || []),
          ...(HALLOWEEN_BASIC_AVATARS || []),
          ...(HALLOWEEN_PREMIUM_AVATARS || [])
        ],
        pets: [
          ...(SHOP_BASIC_PETS || []),
          ...(SHOP_PREMIUM_PETS || []),
          ...(HALLOWEEN_PETS || [])
        ]
      }),
    [
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      HALLOWEEN_PETS
    ]
  );

  const cardLibraryMap = useMemo(
    () => getCardLibraryMap(tradingCardLibrary),
    [tradingCardLibrary]
  );

  const cardProgress = useMemo(
    () => getCollectionProgress(cardCollection, tradingCardLibrary),
    [cardCollection, tradingCardLibrary]
  );

  const cardRarityBreakdown = useMemo(
    () => getRarityBreakdown(cardCollection, tradingCardLibrary),
    [cardCollection, tradingCardLibrary]
  );

  const ownedCardEntries = useMemo(() => {
    const entries = [];
    const cards = cardCollection.cards || {};

    Object.entries(cards).forEach(([cardId, details]) => {
      if (!details?.count) {
        return;
      }

      const cardInfo = cardLibraryMap.get(cardId);
      if (!cardInfo) {
        return;
      }

      entries.push({
        ...cardInfo,
        count: details.count,
        firstObtainedAt: details.firstObtainedAt,
        lastObtainedAt: details.lastObtainedAt
      });
    });

    entries.sort((a, b) => {
      const rarityOrder = CARD_RARITY_ORDER.indexOf(a.rarity) - CARD_RARITY_ORDER.indexOf(b.rarity);
      if (rarityOrder !== 0) {
        return rarityOrder;
      }

      return a.name.localeCompare(b.name);
    });

    return entries;
  }, [cardCollection.cards, cardLibraryMap]);

  const resolvedClassmates = useMemo(() => {
    const map = new Map();

    const addStudents = (list = []) => {
      list.forEach(student => {
        if (!student || !student.id) {
          return;
        }

        const existing = map.get(student.id) || {};
        map.set(student.id, { ...existing, ...student });
      });
    };

    addStudents(Array.isArray(classmates) ? classmates : []);
    addStudents(Array.isArray(classData?.students) ? classData.students : []);

    return Array.from(map.values());
  }, [classData?.students, classmates]);

  const getStudentCardsForTrade = useCallback(
    (student) => {
      if (!student) {
        return [];
      }

      const cards = student.cardCollection?.cards || {};
      const entries = Object.entries(cards)
        .filter(([, entry]) => entry?.count)
        .map(([cardId, entry]) => {
          const cardInfo = cardLibraryMap.get(cardId);
          if (!cardInfo) {
            return null;
          }

          return {
            ...cardInfo,
            count: entry.count,
            firstObtainedAt: entry.firstObtainedAt,
            lastObtainedAt: entry.lastObtainedAt
          };
        })
        .filter(Boolean);

      entries.sort((a, b) => {
        const rarityOrder = CARD_RARITY_ORDER.indexOf(a.rarity) - CARD_RARITY_ORDER.indexOf(b.rarity);
        if (rarityOrder !== 0) {
          return rarityOrder;
        }

        return a.name.localeCompare(b.name);
      });

      return entries;
    },
    [cardLibraryMap]
  );

  const getTradeItemName = useCallback((type, item) => {
    if (!item) {
      return '';
    }

    if (type === 'avatar') {
      return item;
    }

    return item.name || '';
  }, []);

  const cardPackInventory = useMemo(
    () =>
      DEFAULT_CARD_PACKS.map(pack => ({
        ...pack,
        count: cardCollection.packs?.[pack.id]?.count || 0
      })),
    [cardCollection]
  );

  const cardHistoryPreview = useMemo(
    () => (Array.isArray(cardCollection.history) ? cardCollection.history.slice(0, 3) : []),
    [cardCollection.history]
  );

  const createCardCollectionSnapshot = useCallback(
    () => cloneCardCollection(cardCollection),
    [cardCollection]
  );

  const applyPrizeToStudent = useCallback(
    (prize, baseUpdates = {}, options = {}) =>
      applyPrizeToStudentBase({
        prize,
        studentData,
        showToast,
        createSnapshot: createCardCollectionSnapshot,
        baseUpdates,
        timestamp: options.timestamp,
        nowIso: options.nowIso
      }),
    [studentData, showToast, createCardCollectionSnapshot]
  );

  const pendingIncomingTrades = studentData?.pendingTradeRequests || [];
  const outgoingTradeRequest = studentData?.outgoingTradeRequest || null;
  const tradeNotifications = studentData?.tradeNotifications || [];
  const hasPendingOutgoingTrade = Boolean(outgoingTradeRequest);

  useEffect(() => {
    if (!Array.isArray(tradeNotifications) || tradeNotifications.length === 0) {
      return;
    }

    tradeNotifications.forEach(notification => {
      if (notification?.type === 'trade-rejected') {
        const partnerName = notification.partnerName || 'Your classmate';
        showToast(`${partnerName} declined your trade. You can try again today.`, 'info');
      } else if (notification?.type === 'trade-accepted') {
        const partnerName = notification.partnerName || 'Your classmate';
        showToast(`${partnerName} accepted your trade request!`, 'success');
      }
    });

    if (typeof updateStudentData === 'function') {
      updateStudentData({ tradeNotifications: [] });
    }
  }, [tradeNotifications, showToast, updateStudentData]);

  const lastTradeDate = useMemo(() => parseDateValue(studentData?.lastTradeAt), [studentData?.lastTradeAt]);

  const canTradeToday = useMemo(() => {
    if (hasPendingOutgoingTrade) {
      return false;
    }

    if (!lastTradeDate) {
      return true;
    }

    return !isSameCalendarDay(lastTradeDate, new Date());
  }, [hasPendingOutgoingTrade, lastTradeDate]);

  const nextTradeDate = useMemo(() => {
    if (!lastTradeDate) {
      return null;
    }

    const next = new Date(lastTradeDate.getTime());
    next.setDate(next.getDate() + 1);
    return next;
  }, [lastTradeDate]);

  const tradeAvailabilityText = useMemo(() => {
    if (hasPendingOutgoingTrade && outgoingTradeRequest) {
      const partnerName = outgoingTradeRequest.partnerName || 'your classmate';
      return `Waiting for ${partnerName} to respond to your trade request.`;
    }

    if (canTradeToday) {
      return 'You can make one trade today.';
    }

    if (!nextTradeDate) {
      return '';
    }

    const dateText = nextTradeDate.toLocaleDateString();
    const timeText = nextTradeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Next trade available on ${dateText} at ${timeText}.`;
  }, [canTradeToday, hasPendingOutgoingTrade, nextTradeDate, outgoingTradeRequest]);

  const handleTradeRequest = (type, item) => {
    if (hasPendingOutgoingTrade) {
      showToast('You already have a trade request waiting for confirmation.', 'info');
      return;
    }

    if (!canTradeToday) {
      showToast('You can only make one trade each day. Check back tomorrow!', 'info');
      return;
    }

    if (type === 'card') {
      if (!item?.id) {
        showToast('This card is not available to trade right now.', 'info');
        return;
      }

      const ownedCount = studentData?.cardCollection?.cards?.[item.id]?.count || 0;
      if (ownedCount <= 0) {
        showToast('You no longer own that card.', 'error');
        return;
      }
    }

    setTradeModal({
      ...INITIAL_TRADE_MODAL_STATE,
      visible: true,
      type,
      item
    });
  };

  const closeTradeModal = () => {
    setTradeModal(INITIAL_TRADE_MODAL_STATE);
    setIsProcessingTrade(false);
  };

  const confirmTrade = async () => {
    if (!tradeModal.type || !tradeModal.item) {
      return;
    }

    if (!canTradeToday) {
      showToast('You have already traded today. Please try again tomorrow!', 'info');
      closeTradeModal();
      return;
    }

    if (!tradeModal.selectedPartnerId || !tradeModal.selectedPartnerItem) {
      showToast('Select a classmate and one of their items to trade for.', 'info');
      return;
    }

    const selectedPartner = resolvedClassmates.find(partner => partner.id === tradeModal.selectedPartnerId);

    if (!selectedPartner) {
      showToast('Could not find the selected classmate. Please try again.', 'error');
      return;
    }

    const partnerLastTrade = parseDateValue(selectedPartner.lastTradeAt);
    if (partnerLastTrade && isSameCalendarDay(partnerLastTrade, new Date())) {
      showToast('That classmate has already traded today. Pick someone else.', 'info');
      return;
    }

    if (selectedPartner.outgoingTradeRequest) {
      showToast('That classmate already has a pending trade request. Try someone else.', 'info');
      return;
    }

    const studentHasItem = tradeModal.type === 'avatar'
      ? (studentData.ownedAvatars || []).includes(tradeModal.item)
      : tradeModal.type === 'pet'
        ? (studentData.ownedPets || []).some(pet => pet.id === tradeModal.item.id)
        : (studentData.cardCollection?.cards?.[tradeModal.item.id]?.count || 0) > 0;

    if (!studentHasItem) {
      showToast('You no longer have that item available to trade.', 'error');
      closeTradeModal();
      return;
    }

    const partnerHasItem = tradeModal.type === 'avatar'
      ? (selectedPartner.ownedAvatars || []).includes(tradeModal.selectedPartnerItem)
      : tradeModal.type === 'pet'
        ? (selectedPartner.ownedPets || []).some(pet => pet.id === tradeModal.selectedPartnerItem.id)
        : (selectedPartner.cardCollection?.cards?.[tradeModal.selectedPartnerItem.id]?.count || 0) > 0;

    if (!partnerHasItem) {
      showToast('It looks like that item is no longer available. Please choose another.', 'error');
      return;
    }

    if (typeof performClassmateTrade !== 'function') {
      showToast('Trading is unavailable right now. Please try again later.', 'error');
      return;
    }

    setIsProcessingTrade(true);

    try {
      const partnerDisplayName = selectedPartner.firstName
        ? `${selectedPartner.firstName}${selectedPartner.lastName ? ` ${selectedPartner.lastName}` : ''}`
        : selectedPartner.displayName || 'Classmate';

      const tradeResult = await performClassmateTrade({
        action: 'request',
        type: tradeModal.type,
        offeredItem: tradeModal.item,
        partnerId: selectedPartner.id,
        partnerItem: tradeModal.selectedPartnerItem
      });

      if (!tradeResult?.success) {
        showToast(tradeResult?.error || 'Trade failed. Please try again.', 'error');
        if (tradeResult?.shouldCloseModal) {
          closeTradeModal();
        }
        return;
      }

      showToast(`Trade request sent to ${partnerDisplayName}.`, 'success');

      const offeredSnapshot = tradeModal.type === 'pet'
        ? { ...tradeModal.item }
        : tradeModal.type === 'card'
          ? { ...tradeModal.item }
          : tradeModal.item;
      const requestedSnapshot = tradeModal.type === 'pet'
        ? { ...tradeModal.selectedPartnerItem }
        : tradeModal.type === 'card'
          ? { ...tradeModal.selectedPartnerItem }
          : tradeModal.selectedPartnerItem;

      setTradeModal(prev => ({
        ...prev,
        stage: 'pending',
        result: {
          offered: offeredSnapshot,
          requested: requestedSnapshot,
          partner: { id: selectedPartner.id, name: partnerDisplayName }
        }
      }));
    } finally {
      setIsProcessingTrade(false);
    }
  };

  const handleCancelTradeRequest = async () => {
    if (!outgoingTradeRequest) {
      return;
    }

    if (typeof performClassmateTrade !== 'function') {
      showToast('Trading is unavailable right now. Please try again later.', 'error');
      return;
    }

    setRespondingTradeId(outgoingTradeRequest.id);

    try {
      const result = await performClassmateTrade({
        action: 'cancel',
        request: outgoingTradeRequest
      });

      if (!result?.success) {
        showToast(result?.error || 'Could not cancel the trade request.', 'error');
        return;
      }

      showToast('Trade request cancelled.', 'info');
    } finally {
      setRespondingTradeId(null);
    }
  };

  const handleIncomingTradeDecision = async (request, decision) => {
    if (!request) {
      return;
    }

    if (typeof performClassmateTrade !== 'function') {
      showToast('Trading is unavailable right now. Please try again later.', 'error');
      return;
    }

    setRespondingTradeId(request.id);

    try {
      const result = await performClassmateTrade({
        action: decision === 'accept' ? 'accept' : 'reject',
        request
      });

      if (!result?.success) {
        showToast(result?.error || 'Could not update the trade.', 'error');
        return;
      }

      if (decision === 'accept') {
        showToast(`Trade complete! You traded with ${request.fromStudentName || 'your classmate'}.`, 'success');
      } else {
        showToast(`You declined the trade from ${request.fromStudentName || 'your classmate'}.`, 'info');
      }
    } finally {
      setRespondingTradeId(null);
    }
  };

  const renderTradeModal = () => {
    if (!tradeModal.visible) {
      return null;
    }

    const tradeType = tradeModal.type;
    const isAvatarTrade = tradeType === 'avatar';
    const isPetTrade = tradeType === 'pet';
    const isCardTrade = tradeType === 'card';
    const tradeTypeLabel = TRADE_TYPE_LABELS[tradeType] || 'Item';
    const tradePluralLabel = tradeType === 'card'
      ? 'cards'
      : isAvatarTrade
        ? 'avatars'
        : isPetTrade
          ? 'pets'
          : 'items';

    const resolveCardDetails = (card) => {
      if (!card?.id) {
        return null;
      }

      const fromMap = cardLibraryMap.get(card.id);
      if (fromMap) {
        return { ...fromMap, ...card };
      }

      if (card.name) {
        return { ...card };
      }

      return null;
    };

    if (tradeModal.stage === 'pending' && tradeModal.result) {
      const { partner, offered, requested } = tradeModal.result;
      const partnerName = partner?.name || 'your classmate';
      const offeredName = getTradeItemName(tradeType, offered);
      const requestedName = getTradeItemName(tradeType, requested);

      return (
        <div className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start md:items-center justify-center p-4 md:py-10">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl text-center p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="text-5xl md:text-6xl">📨</div>
                <h2 className="text-xl md:text-2xl font-bold">Trade request sent!</h2>
                <p className="text-sm md:text-base text-gray-700">
                  Waiting for {partnerName} to confirm the trade.
                </p>
                {(offeredName || requestedName) && (
                  <p className="text-xs md:text-sm text-gray-600">
                    They'll decide if they want your <span className="font-semibold">{offeredName}</span>{' '}
                    in exchange for their <span className="font-semibold">{requestedName}</span>.
                  </p>
                )}
                <button
                  onClick={closeTradeModal}
                  className="w-full py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (tradeModal.stage === 'result' && tradeModal.result) {
      const { received, traded, partner } = tradeModal.result;
      const receivedName = getTradeItemName(tradeType, received);
      const tradedName = getTradeItemName(tradeType, traded);
      const partnerName = partner?.name || 'your classmate';

      const resultImage = (() => {
        if (!received) return null;

        if (isAvatarTrade) {
          const avatarSrc = getAvatarImage(
            received,
            calculateAvatarLevel(studentData.totalPoints)
          );
          return (
            <img
              src={avatarSrc}
              alt={receivedName}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full mx-auto mb-4 border-4 border-amber-200"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
          );
        }

        if (isPetTrade) {
          const petArt = resolvePetArt(getPetImage(received));
          return (
            <img
              src={petArt.src}
              alt={receivedName}
              className="w-24 h-24 md:w-28 md:h-28 rounded-full mx-auto mb-4 border-4 border-amber-200"
              data-fallbacks={serializeFallbacks(petArt.fallbacks)}
              data-fallback-index="0"
              onError={petImageErrorHandler}
            />
          );
        }

        if (isCardTrade) {
          const cardDetails = resolveCardDetails(received);
          if (!cardDetails) {
            return null;
          }
          const rarityConfig = CARD_RARITY_STYLES[cardDetails.rarity] || CARD_RARITY_STYLES.common;

          return (
            <div
              className="relative w-24 h-36 md:w-28 md:h-40 rounded-xl overflow-hidden mx-auto mb-4 shadow-xl"
              style={{
                background: rarityConfig.gradient,
                boxShadow: `0 0 30px ${rarityConfig.glow}`
              }}
            >
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
              <img
                src={cardDetails.image || '/Logo/icon.png'}
                alt={cardDetails.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-2 py-1 text-xs font-semibold text-white truncate">
                {cardDetails.name}
              </div>
            </div>
          );
        }

        return null;
      })();

      return (
        <div className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start md:items-center justify-center p-4 md:py-10">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl text-center p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                <div className="text-5xl md:text-6xl mb-3">✨</div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">Trade Successful!</h2>
                <p className="text-sm md:text-base text-gray-700 mb-4">
                  You traded <span className="font-semibold">{tradedName}</span> with{' '}
                  <span className="font-semibold">{partnerName}</span> and received{' '}
                  <span className="font-semibold text-amber-600">{receivedName}</span>.
                </p>
                {resultImage}
                <p className="text-xs md:text-sm text-gray-500 mb-4">
                  You and {partnerName} can trade again tomorrow.
                </p>
                <button
                  onClick={closeTradeModal}
                  className="mt-2 w-full py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600"
                >
                  Awesome!
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const itemName = getTradeItemName(tradeType, tradeModal.item);
    const previewImage = (() => {
      if (!tradeModal.item) return null;

      if (isAvatarTrade) {
        return (
          <img
            src={getAvatarImage(itemName, calculateAvatarLevel(studentData.totalPoints))}
            alt={itemName}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 border-4 border-blue-200"
            onError={(e) => {
              e.target.src = '/shop/Basic/Banana.png';
            }}
          />
        );
      }

      if (isPetTrade) {
        const petArt = resolvePetArt(getPetImage(tradeModal.item));
        return (
          <img
            src={petArt.src}
            alt={itemName}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-4 border-4 border-green-200"
            data-fallbacks={serializeFallbacks(petArt.fallbacks)}
            data-fallback-index="0"
            onError={petImageErrorHandler}
          />
        );
      }

      if (isCardTrade) {
        const cardDetails = resolveCardDetails(tradeModal.item);
        if (!cardDetails) {
          return null;
        }
        const rarityConfig = CARD_RARITY_STYLES[cardDetails.rarity] || CARD_RARITY_STYLES.common;

        return (
          <div
            className="relative w-24 h-36 md:w-28 md:h-40 rounded-xl overflow-hidden mx-auto mb-4 shadow-xl"
            style={{
              background: rarityConfig.gradient,
              boxShadow: `0 0 30px ${rarityConfig.glow}`
            }}
          >
            <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
            <img
              src={cardDetails.image || '/Logo/icon.png'}
              alt={cardDetails.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-2 py-1 text-xs font-semibold text-white truncate">
              {cardDetails.name}
            </div>
            <div
              className="absolute top-2 left-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-slate-950/70 text-white"
              style={{ color: rarityConfig.color }}
            >
              {rarityConfig.label}
            </div>
          </div>
        );
      }

      return null;
    })();

    const partnerChoices = resolvedClassmates
      .filter(partner => partner && partner.id && partner.id !== studentData?.id)
      .map(partner => {
        const displayName = partner.firstName
          ? `${partner.firstName}${partner.lastName ? ` ${partner.lastName}` : ''}`
          : partner.displayName || 'Classmate';
        const lastTrade = parseDateValue(partner.lastTradeAt);
        const canTradeToday = !lastTrade || !isSameCalendarDay(lastTrade, new Date());
        const hasPendingOutgoing = Boolean(partner.outgoingTradeRequest);
        const partnerItems = isAvatarTrade
          ? (partner.ownedAvatars || [])
          : isPetTrade
            ? (partner.ownedPets || [])
            : getStudentCardsForTrade(partner);
        const hasItems = partnerItems.length > 0;

        return {
          id: partner.id,
          name: displayName,
          canTrade: canTradeToday && hasItems && !hasPendingOutgoing,
          reason: !canTradeToday
            ? 'Already traded today'
            : hasPendingOutgoing
              ? 'Has a pending trade request'
              : !hasItems
                ? `No ${tradePluralLabel} available`
                : null,
          items: partnerItems,
          raw: partner
        };
      });

    const eligiblePartners = partnerChoices.filter(option => option.canTrade);
    const selectedPartnerChoice = tradeModal.selectedPartnerId
      ? partnerChoices.find(option => option.id === tradeModal.selectedPartnerId)
      : null;
    const unavailablePartners = partnerChoices.filter(option => !option.canTrade);
    const partnerItems = selectedPartnerChoice?.items || [];

    const hasSelectedPartnerItem = isCardTrade
      ? Boolean(tradeModal.selectedPartnerItem?.id)
      : Boolean(tradeModal.selectedPartnerItem);

    const confirmDisabled =
      isProcessingTrade ||
      !canTradeToday ||
      !selectedPartnerChoice ||
      !hasSelectedPartnerItem;

    const tradeNote = selectedPartnerChoice
      ? `If ${selectedPartnerChoice.name} accepts, this trade will count for both of you today.`
      : 'Trading will use your one trade for today once it is accepted.';

    return (
      <div className="fixed inset-0 z-[75] bg-black/70 backdrop-blur-sm overflow-y-auto">
        <div className="min-h-full flex items-start md:items-center justify-center p-4 md:py-10">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl text-center p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
              <div>
                <div className="text-4xl md:text-5xl mb-2">🤝</div>
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  Trade {tradeTypeLabel} with a Classmate
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Choose a classmate to swap this {tradeTypeLabel.toLowerCase()}. Each student can trade once per day.
                </p>
              </div>

              {previewImage}

              {eligiblePartners.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
                  No classmates are available to trade this {tradeTypeLabel.toLowerCase()} today. Check back tomorrow!
                </div>
              ) : (
                <div className="text-left space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-1">
                      Choose a classmate
                    </label>
                    <select
                      value={tradeModal.selectedPartnerId || ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        setTradeModal(prev => ({
                          ...prev,
                          selectedPartnerId: value || null,
                          selectedPartnerItem: null
                        }));
                      }}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option value="">Select a classmate</option>
                      {eligiblePartners.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPartnerChoice && (
                    <div className="space-y-2">
                      <p className="text-xs md:text-sm font-semibold text-gray-700">
                        {selectedPartnerChoice.name}'s available {tradePluralLabel}
                      </p>
                      {partnerItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {partnerItems.map(item => {
                        if (isAvatarTrade) {
                          const isSelected = tradeModal.selectedPartnerItem === item;
                          const avatarSrc = getAvatarImage(
                            item,
                            calculateAvatarLevel(selectedPartnerChoice.raw.totalPoints || 0)
                          );

                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() =>
                                setTradeModal(prev => ({
                                  ...prev,
                                  selectedPartnerItem: item
                                }))
                              }
                              className={`border-2 rounded-lg p-2 text-center transition-all ${
                                isSelected ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                              }`}
                            >
                              <img
                                src={avatarSrc}
                                alt={item}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-1 border"
                                onError={(e) => {
                                  e.target.src = '/shop/Basic/Banana.png';
                                }}
                              />
                              <span className="text-xs font-semibold text-gray-700 truncate block">{item}</span>
                            </button>
                          );
                        }

                        if (isPetTrade) {
                          const isSelected = tradeModal.selectedPartnerItem?.id === item.id;
                          const petArt = resolvePetArt(getPetImage(item));

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setTradeModal(prev => ({
                                  ...prev,
                                  selectedPartnerItem: { ...item }
                                }))
                              }
                              className={`border-2 rounded-lg p-2 text-center transition-all ${
                                isSelected ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                              }`}
                            >
                              <img
                                src={petArt.src}
                                alt={item.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-1 border"
                                data-fallbacks={serializeFallbacks(petArt.fallbacks)}
                                data-fallback-index="0"
                                onError={petImageErrorHandler}
                              />
                              <span className="text-xs font-semibold text-gray-700 truncate block">{item.name}</span>
                            </button>
                          );
                        }

                        if (isCardTrade) {
                          const isSelected = tradeModal.selectedPartnerItem?.id === item.id;
                          const cardDetails = resolveCardDetails(item);
                          if (!cardDetails) {
                            return null;
                          }
                          const rarityConfig = CARD_RARITY_STYLES[cardDetails.rarity] || CARD_RARITY_STYLES.common;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                setTradeModal(prev => ({
                                  ...prev,
                                  selectedPartnerItem: { ...item }
                                }))
                              }
                              className={`rounded-lg overflow-hidden border-2 transition-all bg-slate-900 text-white ${
                                isSelected ? 'border-amber-500 shadow-lg shadow-amber-300/40' : 'border-white/10 hover:border-amber-300'
                              }`}
                            >
                              <div className="relative aspect-[3/4]">
                                <div
                                  className="absolute inset-0"
                                  style={{ background: rarityConfig.gradient }}
                                />
                                <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                                <img
                                  src={cardDetails.image || '/Logo/icon.png'}
                                  alt={cardDetails.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div
                                  className="absolute top-2 left-2 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-slate-950/70"
                                  style={{ color: rarityConfig.color }}
                                >
                                  {rarityConfig.label}
                                </div>
                                {item.count > 1 && (
                                  <div className="absolute top-2 right-2 bg-slate-950/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                    x{item.count}
                                  </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-slate-950/70 px-2 py-1 text-[11px] font-semibold truncate">
                                  {cardDetails.name}
                                </div>
                              </div>
                            </button>
                          );
                        }

                        return null;
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">This classmate does not have any available items.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {unavailablePartners.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left">
              <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">Unavailable classmates today</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                {unavailablePartners.map(option => (
                  <li key={option.id}>
                    {option.name}{option.reason ? ` — ${option.reason}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs md:text-sm text-gray-500">{tradeNote}</p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={closeTradeModal}
              className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={confirmTrade}
              disabled={confirmDisabled}
              className={`flex-1 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold transition-all ${
                confirmDisabled
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {isProcessingTrade ? 'Sending...' : 'Send Trade Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    );
  };

  useEffect(() => {
    if (!studentEggs.length) return;

    let cancelled = false;

    const syncEggStages = async () => {
      if (!studentEggs.length) return;

      let changed = false;
      const updatedEggs = studentEggs.map((egg) => {
        const { egg: nextEgg, changed: stageChanged } = advanceEggStage(egg);
        if (stageChanged) changed = true;
        return nextEgg;
      });

      if (changed && !cancelled) {
        await updateStudentData({ petEggs: updatedEggs });
      }
    };

    syncEggStages();
    const interval = setInterval(syncEggStages, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [studentEggs, updateStudentData]);

  // ===============================================
  // TRADING CARD FUNCTIONS
  // ===============================================

  const closeCardPackOpening = useCallback(() => {
    clearPackAnimationTimeouts();
    setCardPackOpening({ ...DEFAULT_CARD_PACK_OPENING_STATE });
    setIsOpeningPack(false);
  }, [clearPackAnimationTimeouts]);

  const handleOpenPack = useCallback(
    async (pack) => {
      if (!pack || isOpeningPack) {
        return;
      }

      const availableCount = cardCollection.packs?.[pack.id]?.count || 0;
      if (availableCount <= 0) {
        showToast('You do not have this pack yet. Purchase one to open it!', 'info');
        return;
      }

      setIsOpeningPack(true);
      clearPackAnimationTimeouts();

      const results = drawCardsFromPack(pack, { cardLibrary: tradingCardLibrary });
      const snapshot = createCardCollectionSnapshot();
      const nowIso = new Date().toISOString();

      const packs = { ...snapshot.packs };
      const packEntry = packs[pack.id] || { count: 0 };
      const nextCount = Math.max(0, (packEntry.count || 0) - 1);

      if (nextCount <= 0) {
        delete packs[pack.id];
      } else {
        packs[pack.id] = {
          ...packEntry,
          count: nextCount,
          lastOpenedAt: nowIso
        };
      }

      const cards = { ...snapshot.cards };
      results.forEach(card => {
        const existing = cards[card.id] || {};
        cards[card.id] = {
          count: (existing.count || 0) + 1,
          firstObtainedAt: existing.firstObtainedAt || nowIso,
          lastObtainedAt: nowIso
        };
      });

      const history = [
        {
          id: `pack-open-${Date.now()}`,
          packId: pack.id,
          packName: pack.name,
          openedAt: nowIso,
          cards: results.map(card => ({
            id: card.id,
            name: card.name,
            rarity: card.rarity,
            type: card.type
          }))
        },
        ...snapshot.history
      ].slice(0, 20);

      setCardPackOpening({
        visible: true,
        pack,
        stage: 'charging',
        cards: [],
        results
      });

      const saved = await updateStudentData({
        cardCollection: {
          ...snapshot,
          packs,
          cards,
          history,
          totalOpened: (snapshot.totalOpened || 0) + 1,
          lastOpenedAt: nowIso
        }
      });

      if (!saved) {
        setCardPackOpening({ ...DEFAULT_CARD_PACK_OPENING_STATE });
        setIsOpeningPack(false);
        showToast('We could not save your pack opening. Please try again.', 'error');
        return;
      }

      schedulePackTimeout(() => {
        setCardPackOpening(prev => ({ ...prev, stage: 'burst' }));
      }, 250);

      schedulePackTimeout(() => {
        setCardPackOpening(prev => ({ ...prev, stage: 'reveal', cards: prev.results }));
        setIsOpeningPack(false);
      }, 1100);

      showToast(`You pulled ${summarizeCardPull(results)}!`, 'success');
    },
    [
      cardCollection,
      clearPackAnimationTimeouts,
      createCardCollectionSnapshot,
      isOpeningPack,
      schedulePackTimeout,
      showToast,
      tradingCardLibrary,
      updateStudentData
    ]
  );

  const renderTradingCardShowcase = () => (
    <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white shadow-xl">
      <div className="absolute inset-0 opacity-30" aria-hidden>
        {[...Array(40)].map((_, index) => (
          <div
            key={index}
            className="absolute bg-white/20 rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">✨ Trading Card Universe</h3>
            <p className="text-white/70 text-sm md:text-base max-w-2xl mt-1">
              Collect dazzling avatars, pets, weapons, and artifacts. Complete the Card Book to unlock legendary bragging rights!
            </p>
            <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-fuchsia-400 to-sky-300"
                style={{ width: `${cardProgress.completion}%` }}
              />
            </div>
            <p className="text-xs uppercase tracking-widest text-white/60 mt-2">
              {cardProgress.uniqueOwned} / {cardProgress.totalUnique} unique cards • {cardProgress.totalOwned} total collected
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              onClick={() => setCardBookVisible(true)}
              className="px-4 py-2 rounded-xl bg-white/15 border border-white/30 hover:bg-white/25 transition font-semibold"
            >
              📖 Card Book
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('card_packs')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-lg font-semibold"
            >
              🃏 Shop Packs
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cardPackInventory.map(packInfo => {
            const packStyle = CARD_RARITY_STYLES[packInfo.rarity] || CARD_RARITY_STYLES.common;
            return (
              <div
                key={packInfo.id}
                className="relative overflow-hidden rounded-2xl border border-white/15 p-4 md:p-5 backdrop-blur-sm"
                style={{ background: packInfo.visual?.gradient || 'rgba(255,255,255,0.08)' }}
              >
                <div className="absolute inset-0 opacity-30 bg-black/20" aria-hidden></div>
                <div className="relative z-10 flex flex-col gap-3 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/70">
                        {packStyle.label} Pack
                      </p>
                      <p className="text-lg font-bold">{packInfo.name}</p>
                      <p className="text-xs text-white/70">
                        {packInfo.minCards}-{packInfo.maxCards} cards • Owned x{packInfo.count}
                      </p>
                    </div>
                    <span className="text-3xl drop-shadow-lg">{packInfo.icon || '🃏'}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => setPurchaseModal({ visible: true, item: packInfo, type: 'card_pack' })}
                      className="flex-1 px-4 py-2 rounded-lg font-semibold bg-white text-slate-900 border border-white/80 shadow-sm hover:bg-amber-100 hover:shadow-md transition"
                    >
                      Buy • 💰{packInfo.price}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenPack(packInfo)}
                      disabled={packInfo.count === 0 || isOpeningPack}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                        packInfo.count === 0 || isOpeningPack
                          ? 'bg-white/10 text-white/50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-400 to-pink-500 hover:shadow-lg'
                      }`}
                    >
                      {isOpeningPack ? 'Opening...' : `Open Pack${packInfo.count > 0 ? ` (${packInfo.count})` : ''}`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-white/70">
          {CARD_RARITY_ORDER.map(rarity => {
            const stats = cardRarityBreakdown[rarity] || { total: 0, owned: 0 };
            const style = CARD_RARITY_STYLES[rarity];
            return (
              <span
                key={rarity}
                className="px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
              >
                <span style={{ color: style.color }}>{style.label}</span>: {stats.owned}/{stats.total}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ===============================================
  // MYSTERY BOX FUNCTIONS
  // ===============================================
  
  const handleMysteryBoxPurchase = () => {
    if (currentCoins < MYSTERY_BOX_PRICE) {
      showToast(`You need ${MYSTERY_BOX_PRICE - currentCoins} more coins for a Mystery Box!`, 'error');
      return;
    }
    
    setMysteryBoxModal({ visible: true, stage: 'confirm' });
  };
  
  const confirmMysteryBoxPurchase = async () => {
    // Deduct coins first
    const updatedData = { 
      coinsSpent: (studentData.coinsSpent || 0) + MYSTERY_BOX_PRICE 
    };
    
    const success = await updateStudentData(updatedData);
    if (!success) {
      showToast('Failed to purchase Mystery Box. Please try again.', 'error');
      return;
    }
    
    // Start the opening sequence
    setMysteryBoxModal({ visible: true, stage: 'opening' });
    setIsSpinning(true);
    
    // Get all possible prizes (includes Halloween items)
    const allPrizes = getMysteryBoxPrizes(
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      classRewards,
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      HALLOWEEN_PETS,
      PET_EGG_TYPES,
      DEFAULT_CARD_PACKS
    );
    
    // Select random prize
    const selectedPrize = selectRandomPrize(allPrizes);
    setMysteryBoxPrize(selectedPrize);
    
    // Spinning animation (3 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setMysteryBoxModal({ visible: true, stage: 'reveal' });
    }, 3000);
  };
  
  const collectMysteryBoxPrize = async () => {
    if (!mysteryBoxPrize) return;

    const updates = applyPrizeToStudent(mysteryBoxPrize);

    const success = await updateStudentData(updates);
    if (success) {
      setMysteryBoxModal({ visible: false, stage: 'confirm' });
      setMysteryBoxPrize(null);
    } else {
      showToast('Failed to collect prize. Please try again.', 'error');
    }
  };



  // ===============================================
  // SELLING FUNCTIONS
  // ===============================================
  
  const handleSellItem = (item, type) => {
    const itemName = type === 'pet' ? item.name : type === 'avatar' ? item : item.name;
    const originalPrice = findOriginalPrice(
      itemName,
      type,
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      classRewards,
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      HALLOWEEN_PETS
    );
    const sellPrice = calculateSellPrice(originalPrice);
    
    setSellModal({
      visible: true,
      item: item,
      type: type,
      price: sellPrice
    });
  };
  
  const confirmSell = async () => {
    let updates = {};

    // Add coins from sale
    updates.currency = (studentData.currency || 0) + sellModal.price;
    
    // Remove item from inventory
    if (sellModal.type === 'avatar') {
      updates.ownedAvatars = studentData.ownedAvatars.filter(a => a !== sellModal.item);
    } else if (sellModal.type === 'pet') {
      updates.ownedPets = studentData.ownedPets.filter(p => p.id !== sellModal.item.id);
    } else if (sellModal.type === 'reward') {
      const rewardIndex = studentData.rewardsPurchased.findIndex(r => 
        r.id === sellModal.item.id || (r.purchasedAt === sellModal.item.purchasedAt && r.name === sellModal.item.name)
      );
      if (rewardIndex !== -1) {
        updates.rewardsPurchased = [
          ...studentData.rewardsPurchased.slice(0, rewardIndex),
          ...studentData.rewardsPurchased.slice(rewardIndex + 1)
        ];
      }
    }
    
    const success = await updateStudentData(updates);
    if (success) {
      setSellModal({ visible: false, item: null, type: null, price: 0 });
      
      const itemDisplayName = sellModal.type === 'pet' ? sellModal.item.name : 
                             sellModal.type === 'avatar' ? sellModal.item :
                             sellModal.item.name;
      
      showToast(`You sold ${itemDisplayName} for ${sellModal.price} coins!`, 'success');
    } else {
      showToast('Failed to sell item. Please try again.', 'error');
    }
  };

  const handleHatchEgg = async (egg) => {
    if (!egg) return;

    if (egg.stage !== 'ready') {
      showToast('This egg is still incubating!', 'warning');
      return;
    }

    const hatchedPet = resolveEggHatch(egg);
    if (!hatchedPet) {
      showToast('Something went wrong while hatching. Try again soon!', 'error');
      return;
    }

    const remainingEggs = studentEggs.filter((e) => e.id !== egg.id);
    const updates = {
      petEggs: remainingEggs,
      ownedPets: [...(studentData.ownedPets || []), hatchedPet]
    };

    const success = await updateStudentData(updates);
    if (success) {
      showToast(`You hatched ${hatchedPet.name}!`, 'success');
      setHatchingCelebration({ egg, pet: hatchedPet });
    } else {
      showToast('Failed to save your new pet. Please try again.', 'error');
    }
  };

  // ===============================================
  // PURCHASE LOGIC
  // ===============================================

  const handlePurchase = async () => {
    if (!purchaseModal.item) return;

    if (currentCoins < purchaseModal.item.price) {
      showToast(`You need ${purchaseModal.item.price - currentCoins} more coins!`, 'error');
      return;
    }

    let updates = {
      coinsSpent: (studentData.coinsSpent || 0) + purchaseModal.item.price
    };

    switch (purchaseModal.type) {
      case 'avatar':
        updates.ownedAvatars = [...new Set([...(studentData.ownedAvatars || []), purchaseModal.item.name])];
        showToast(`You bought the ${purchaseModal.item.name} avatar!`, 'success');
        break;
      case 'pet':
        const newPet = { ...purchaseModal.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(studentData.ownedPets || []), newPet];
        showToast(`You adopted a ${purchaseModal.item.name}!`, 'success');
        break;
      case 'reward':
        updates.rewardsPurchased = [...(studentData.rewardsPurchased || []), {
          ...purchaseModal.item,
          purchasedAt: new Date().toISOString()
        }];
        showToast(`You earned ${purchaseModal.item.name}!`, 'success');
        break;
      case 'card_pack': {
        const pack = purchaseModal.item;
        const snapshot = createCardCollectionSnapshot();
        const nowIso = new Date().toISOString();
        const packs = { ...snapshot.packs };
        const packEntry = packs[pack.id] || { count: 0 };
        packs[pack.id] = {
          ...packEntry,
          count: (packEntry.count || 0) + 1,
          lastObtainedAt: nowIso
        };

        updates.cardCollection = {
          ...snapshot,
          packs,
          cards: { ...snapshot.cards },
          history: snapshot.history
        };

        showToast(`You bought a ${pack.name}!`, 'success');
        break;
      }
    }

    const success = await updateStudentData(updates);
    if (success) {
      setPurchaseModal({ visible: false, item: null, type: null });
    } else {
      showToast('Purchase failed. Please try again.', 'error');
    }
  };

  const handleEquip = async (type, value) => {
    let updates = {};
    
    if (type === 'avatar') {
      updates.avatarBase = value;
      showToast('Avatar equipped!', 'success');
    } else if (type === 'pet') {
      const petToEquip = studentData.ownedPets.find(p => p.id === value);
      const otherPets = studentData.ownedPets.filter(p => p.id !== value);
      updates.ownedPets = [petToEquip, ...otherPets];
      showToast('Pet equipped!', 'success');
    }
    
    await updateStudentData(updates);
  };

  const categories = [
    { id: 'card_packs', name: '✨ Card Packs', shortName: 'Cards' },
    { id: 'mysterybox', name: '🎁 Mystery Box', shortName: 'Mystery' },
    { id: 'halloween', name: '🎃 Halloween Special', shortName: '🎃 Halloween' },
    { id: 'basic_avatars', name: 'Basic Avatars', shortName: 'Basic' },
    { id: 'premium_avatars', name: 'Premium Avatars', shortName: 'Premium' },
    { id: 'basic_pets', name: 'Basic Pets', shortName: 'Pets' },
    { id: 'premium_pets', name: 'Premium Pets', shortName: 'Rare Pets' },
    { id: 'rewards', name: 'Class Rewards', shortName: 'Rewards' }
  ];

  const renderMysteryBox = () => {
    return (
      <div className="text-center max-w-lg mx-auto">
        <div className="border-4 border-gradient-to-br from-purple-400 to-pink-400 rounded-xl p-6 md:p-8 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
          <div className="text-6xl md:text-8xl mb-4 animate-pulse">🎁</div>
          <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-2">Mystery Box</h3>
          <p className="text-purple-600 mb-4 text-sm md:text-base">
            A magical box containing random prizes! You might get avatars, pets, rewards, XP, or coins!
          </p>
          
          <div className="bg-white rounded-lg p-3 md:p-4 mb-4 shadow-inner">
            <h4 className="font-bold text-gray-800 mb-2 text-sm md:text-base">Possible Rarities:</h4>
            <div className="space-y-1 text-xs md:text-sm">
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-gray-400 rounded-full"></span>
                <span>Common (50%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full"></span>
                <span>Uncommon (30%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full"></span>
                <span>Rare (15%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full"></span>
                <span>Epic (4%)</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full"></span>
                <span>Legendary (1%)</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-3 md:p-4 mb-4 border-2 border-yellow-300">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-lg md:text-2xl">💰</span>
              <span className="font-bold text-yellow-900 text-base md:text-lg">Cost: {MYSTERY_BOX_PRICE} Coins</span>
            </div>
            <p className="text-xs md:text-sm text-yellow-800">
              You have: <span className="font-bold">{currentCoins} coins</span>
            </p>
          </div>

          <button
            onClick={handleMysteryBoxPurchase}
            disabled={currentCoins < MYSTERY_BOX_PRICE}
            className="w-full py-3 md:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-base md:text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentCoins < MYSTERY_BOX_PRICE ? 'Not Enough Coins' : 'Open Mystery Box!'}
          </button>
        </div>
      </div>
    );
  };



    let items = [];
    let itemType = '';

    switch (activeCategory) {
      case 'card_packs':
        items = cardPackInventory;
        itemType = 'card_pack';
        break;
      case 'halloween':
        items = [
          ...HALLOWEEN_BASIC_AVATARS.map(item => ({ ...item, __type: 'avatar' })),
          ...HALLOWEEN_PREMIUM_AVATARS.map(item => ({ ...item, __type: 'avatar' })),
          ...HALLOWEEN_PETS.map(item => ({ ...item, __type: 'pet' }))
        ];
        itemType = 'mixed';
        break;
      case 'basic_avatars':
        items = SHOP_BASIC_AVATARS;
        itemType = 'avatar';
        break;
      case 'premium_avatars':
        items = SHOP_PREMIUM_AVATARS;
        itemType = 'avatar';
        break;
      case 'basic_pets':
        items = SHOP_BASIC_PETS;
        itemType = 'pet';
        break;
      case 'premium_pets':
        items = SHOP_PREMIUM_PETS;
        itemType = 'pet';
        break;
      case 'rewards':
        items = classRewards || [];
        itemType = 'reward';
        break;
      default:
        return null;
    }

    if (items.length === 0) {
      return (
        <div className="col-span-full text-center py-8 md:py-12">
          <div className="text-4xl md:text-5xl mb-3 md:mb-4">📦</div>
          <p className="text-gray-600 text-sm md:text-base">No items available in this category yet!</p>
        </div>
      );
    }

    return items.map((item, index) => {
      const resolvedType = item.__type || itemType;
      const isOwnedItem = resolvedType === 'avatar'
        ? studentData.ownedAvatars?.includes(item.name)
        : resolvedType === 'pet'
        ? studentData.ownedPets?.some(p => p.name === item.name)
        : false;

      const canAfford = currentCoins >= (item.price || 0);
      const isHalloween = item.theme === 'halloween';
      const packCount = resolvedType === 'card_pack' ? item.count || 0 : 0;
      const packStyle = resolvedType === 'card_pack' ? (CARD_RARITY_STYLES[item.rarity] || CARD_RARITY_STYLES.common) : null;
      const packLabelColor = resolvedType === 'card_pack'
        ? item.visual?.label || '#f8fafc'
        : null;
      const packSubtitleColor = resolvedType === 'card_pack'
        ? item.visual?.label
          ? `${item.visual.label}cc`
          : 'rgba(248,250,252,0.75)'
        : null;
      const packIconShadow = resolvedType === 'card_pack'
        ? item.visual?.glow || 'rgba(15, 23, 42, 0.55)'
        : null;

      return (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-lg p-3 md:p-4 text-center transition-all hover:shadow-xl ${
            resolvedType === 'card_pack' ? 'bg-slate-900 text-white border border-white/15' : ''
          } ${isOwnedItem && resolvedType !== 'card_pack' ? 'opacity-50' : ''} ${isHalloween ? 'border-2 border-orange-400' : ''}`}
        >
          {isHalloween && (
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">
              🎃 HALLOWEEN
            </div>
          )}

          {resolvedType === 'card_pack' && (
            <div
              className="relative rounded-2xl overflow-hidden py-6 mb-3"
              style={{
                background: item.visual?.gradient || 'linear-gradient(135deg,#4338ca,#f472b6)',
                boxShadow: `0 0 25px ${item.visual?.glow || 'rgba(79,70,229,0.4)'}`
              }}
            >
              <div className="absolute inset-0 bg-white/10 mix-blend-overlay" aria-hidden></div>
              <div
                className="relative z-10 flex flex-col items-center gap-2"
                style={{ color: packLabelColor || '#f8fafc' }}
              >
                <span
                  className="text-4xl drop-shadow-xl"
                  style={{ textShadow: `0 6px 18px ${packIconShadow}` }}
                >
                  {item.icon || '🃏'}
                </span>
                <p className="font-bold text-lg" style={{ color: packLabelColor || '#f8fafc' }}>
                  {item.name}
                </p>
                <p
                  className="text-xs uppercase tracking-widest"
                  style={{ color: packSubtitleColor || 'rgba(248,250,252,0.75)' }}
                >
                  {item.minCards}-{item.maxCards} Cards
                </p>
              </div>
            </div>
          )}

          {resolvedType === 'avatar' && (
            <img
              src={item.path}
              alt={item.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 border-4 border-purple-300"
              onError={(e) => {
                e.target.src = '/shop/Basic/Banana.png';
              }}
            />
          )}
          {resolvedType === 'pet' && (
            <img
              src={item.path}
              alt={item.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-2 border-4 border-green-300"
              onError={(e) => {
                e.target.src = '/shop/BasicPets/Wizard.png';
              }}
            />
          )}
          {resolvedType === 'reward' && (
            <div className="text-3xl md:text-4xl mb-2">{item.icon || '🎁'}</div>
          )}

          {resolvedType !== 'card_pack' && (
            <>
              <h4 className="font-bold text-sm md:text-base mb-1 truncate">{item.name}</h4>
              <p className="text-yellow-600 font-bold mb-2 text-sm md:text-base">💰 {item.price}</p>
            </>
          )}

          {resolvedType === 'card_pack' && (
            <div className="space-y-2">
              <h4 className="font-bold text-base md:text-lg mb-1">{item.name}</h4>
              <p className="text-sm text-white/80">
                {packStyle?.label || item.rarity} Pack • Owned x{packCount}
              </p>
              <p className="text-xs text-white/60">{item.description}</p>
            </div>
          )}

          {isOwnedItem && resolvedType !== 'card_pack' ? (
            <button
              disabled
              className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg text-xs md:text-sm font-semibold cursor-not-allowed"
            >
              Owned ✓
            </button>
          ) : (
            resolvedType === 'card_pack' ? (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => setPurchaseModal({ visible: true, item, type: 'card_pack' })}
                  disabled={!canAfford}
                  className={`w-full py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    canAfford
                      ? 'bg-white text-slate-900 border border-white/70 hover:bg-amber-100'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? `Buy Pack • 💰${item.price}` : 'Not Enough Coins'}
                </button>
                <button
                  onClick={() => handleOpenPack(item)}
                  disabled={packCount === 0 || isOpeningPack}
                  className={`w-full py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                    packCount === 0 || isOpeningPack
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-pink-500 hover:shadow-lg'
                  }`}
                >
                  {packCount > 0 ? `Open Pack (${packCount})` : 'No Packs Yet'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPurchaseModal({ visible: true, item, type: resolvedType })}
                disabled={!canAfford}
                className={`w-full py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  canAfford
                    ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {canAfford ? 'Buy Now' : 'Not Enough Coins'}
              </button>
            )
          )}
        </div>
      );
    });
  };


  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">🛒</span>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">Student Shop</h2>
                <p className="text-sm text-slate-500 md:text-base">
                  Discover avatars, pets, card packs, and class rewards in a clean, mobile-friendly layout.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-500 md:text-sm">
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <span className="text-slate-600">⭐</span>Premium releases from your teacher appear here instantly.
              </span>
              <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                <span className="text-slate-600">🪙</span>Spend coins earned across lessons and games.
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-3xl bg-slate-900 p-5 text-white md:w-auto">
            <div className="text-xs uppercase tracking-widest text-white/60">Coins available</div>
            <div className="text-3xl font-bold md:text-4xl">💰 {currentCoins}</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInventoryModal({ visible: true })}
                className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20 md:flex-none"
              >
                🎒 Inventory
              </button>
              <button
                onClick={() => setCardBookVisible(true)}
                className="flex-1 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20 md:flex-none"
              >
                📖 Card Book
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4 border-t border-slate-200 bg-slate-50/60 p-4 md:px-8 md:py-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('card_packs')}
              className="flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50"
            >
              🃏 Featured Card Packs
            </button>
            <button
              onClick={() => setShowSellMode(!showSellMode)}
              className={"flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition " + (showSellMode
                ? 'border border-rose-200 bg-rose-50 text-rose-600'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100')}
            >
              💵 {showSellMode ? 'Selling enabled' : 'Enable sell mode'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100')}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {renderTradingCardShowcase()}

      {/* Trade Alerts */}
      {(hasPendingOutgoingTrade || pendingIncomingTrades.length > 0) && (
        <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
          {hasPendingOutgoingTrade && outgoingTradeRequest && (() => {
            const offeredName = getTradeItemName(outgoingTradeRequest.type, outgoingTradeRequest.offeredItem);
            const requestedName = getTradeItemName(outgoingTradeRequest.type, outgoingTradeRequest.requestedItem);
            const partnerName = outgoingTradeRequest.partnerName || 'your classmate';

            return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm md:text-base font-semibold text-amber-900">Awaiting confirmation</p>
                    <p className="text-xs md:text-sm text-amber-700">
                      Waiting for {partnerName} to respond to your trade request.
                    </p>
                    {(offeredName || requestedName) && (
                      <p className="text-xs md:text-sm text-amber-700 mt-1">
                        You offered <span className="font-semibold">{offeredName}</span> for <span className="font-semibold">{requestedName}</span>.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelTradeRequest}
                      disabled={respondingTradeId === outgoingTradeRequest.id}
                      className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition ${respondingTradeId === outgoingTradeRequest.id ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-500 text-white hover:bg-amber-600'}`}
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {pendingIncomingTrades.map(request => {
            const offeredName = getTradeItemName(request.type, request.offeredItem);
            const requestedName = getTradeItemName(request.type, request.requestedItem);
            const fromName = request.fromStudentName || 'A classmate';

            return (
              <div
                key={request.id}
                className="bg-blue-50 border border-blue-200 rounded-xl p-3 md:p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="text-sm md:text-base font-semibold text-blue-900">
                      Trade request from {fromName}
                    </p>
                    <p className="text-xs md:text-sm text-blue-700">
                      {fromName} wants to trade their <span className="font-semibold">{offeredName}</span> for your <span className="font-semibold">{requestedName}</span>.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleIncomingTradeDecision(request, 'reject')}
                      disabled={respondingTradeId === request.id}
                      className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition ${respondingTradeId === request.id ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'}`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleIncomingTradeDecision(request, 'accept')}
                      disabled={respondingTradeId === request.id}
                      className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition ${respondingTradeId === request.id ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
        {activeCategory === 'mysterybox' && (
          <div className="mb-4 md:mb-6 rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">🎁</div>
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-purple-800">Mystery Box Adventure</h3>
                <p className="text-sm text-purple-600 md:text-base">Unlock random avatars, pets, eggs, coins, and XP with every box.</p>
              </div>
            </div>
          </div>
        )}

        <div className={`grid gap-4 ${activeCategory === 'mysterybox' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {renderShopItems()}
        </div>
      </section>

      {/* Purchase Modal */}
      {/* Purchase Modal - Mobile Optimized */}
      {purchaseModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-4 md:p-6">
            <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Confirm Purchase</h2>
            <p className="mb-4 text-sm md:text-base">Buy {purchaseModal.item.name} for 💰{purchaseModal.item.price} coins?</p>
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setPurchaseModal({ visible: false, item: null, type: null })} 
                className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase} 
                className="flex-1 py-2 md:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm md:text-base"
              >
                Buy Now!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mystery Box Modal */}
      {mysteryBoxModal.visible && renderMysteryBoxModal()}

      {/* Sell Confirmation Modal */}
      {sellModal.visible && renderSellModal()}

      {/* Trade Modal */}
      {tradeModal.visible && renderTradeModal()}

      {/* Hatch Celebration */}
      {renderHatchCelebrationModal()}

      <CardPackOpeningModal
        visible={cardPackOpening.visible}
        stage={cardPackOpening.stage}
        pack={cardPackOpening.pack}
        cards={cardPackOpening.cards}
        results={cardPackOpening.results}
        onClose={closeCardPackOpening}
      />

      <CardBookModal
        visible={cardBookVisible}
        onClose={() => setCardBookVisible(false)}
        cardCollection={cardCollection}
        cardLibrary={tradingCardLibrary}
      />

      {/* Inventory Modal - Mobile Optimized - WITH SELLING FEATURE */}
      {inventoryModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b flex justify-between items-center">
              <h2 className="text-lg md:text-2xl font-bold">My Inventory</h2>
              <div className="flex items-center gap-2">
                {showSellMode && (
                  <span className="text-xs md:text-sm bg-green-500 text-white px-2 py-1 rounded-full font-semibold">
                    Sell Mode
                  </span>
                )}
                <button 
                  onClick={() => setInventoryModal({ visible: false })} 
                  className="text-2xl font-bold hover:text-red-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 md:p-4">
                <p className="text-sm md:text-base font-semibold text-amber-900 mb-1">Daily Trade Limit</p>
                <p
                  className={`text-xs md:text-sm ${canTradeToday ? 'text-emerald-700' : 'text-amber-700'}`}
                >
                  {tradeAvailabilityText}
                </p>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-4 md:p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold">Trading Card Collection</h3>
                    <p className="text-sm text-white/70">
                      {cardProgress.uniqueOwned} / {cardProgress.totalUnique} unique cards • {cardProgress.totalOwned} cards owned
                    </p>
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 via-fuchsia-400 to-sky-300"
                        style={{ width: `${cardProgress.completion}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setCardBookVisible(true)}
                    className="flex-shrink-0 px-4 py-2 rounded-lg bg-white/20 border border-white/30 hover:bg-white/30 transition text-sm font-semibold"
                  >
                    📖 View Card Book
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {cardPackInventory.map(packInfo => (
                    <div
                      key={`inventory-pack-${packInfo.id}`}
                      className="rounded-xl border border-white/15 p-3 space-y-2"
                      style={{ background: packInfo.visual?.gradient || 'rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-white/70">
                            {CARD_RARITY_STYLES[packInfo.rarity]?.label || packInfo.rarity}
                          </p>
                          <p className="text-base font-semibold">{packInfo.name}</p>
                        </div>
                        <span className="text-3xl drop-shadow">{packInfo.icon || '🃏'}</span>
                      </div>
                      <p className="text-xs text-white/70">
                        {packInfo.minCards}-{packInfo.maxCards} cards • Owned x{packInfo.count}
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setPurchaseModal({ visible: true, item: packInfo, type: 'card_pack' })}
                          className="w-full px-3 py-2 rounded-lg bg-white text-slate-900 border border-white/70 hover:bg-amber-100 text-xs font-semibold"
                        >
                          Buy Pack • 💰{packInfo.price}
                        </button>
                        <button
                          onClick={() => handleOpenPack(packInfo)}
                          disabled={packInfo.count === 0 || isOpeningPack}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition ${
                            packInfo.count === 0 || isOpeningPack
                              ? 'bg-white/10 text-white/50 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-400 to-pink-500 hover:shadow-lg'
                          }`}
                        >
                          {packInfo.count > 0 ? `Open (${packInfo.count})` : 'No Packs Ready'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {cardHistoryPreview.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Recent Pack Openings</p>
                    <ul className="space-y-2 text-sm text-white/80">
                      {cardHistoryPreview.map(entry => (
                        <li key={entry.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <span className="font-semibold">{entry.packName}</span>
                            <span className="text-white/60 text-xs ml-2">
                              {new Date(entry.openedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-white/70">
                            {entry.cards.map(card => (
                              <span key={`${entry.id}-${card.id}`} className="px-2 py-1 rounded-full bg-white/10 border border-white/20">
                                {CARD_RARITY_STYLES[card.rarity]?.label || card.rarity}: {card.name}
                              </span>
                            ))}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Owned Cards */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Cards</h3>
                {ownedCardEntries.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {ownedCardEntries.map(card => {
                      const rarityConfig = CARD_RARITY_STYLES[card.rarity] || CARD_RARITY_STYLES.common;

                      return (
                        <div
                          key={card.id}
                          className="relative rounded-xl overflow-hidden border shadow-sm"
                          style={{
                            borderColor: `${rarityConfig.border || '#fff'}88`,
                            background: rarityConfig.gradient
                          }}
                        >
                          <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                          <div className="relative p-3 flex gap-3">
                            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                              <img
                                src={card.image || '/Logo/icon.png'}
                                alt={card.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <p className="font-semibold text-sm md:text-base text-slate-900 truncate" title={card.name}>
                                {card.name}
                              </p>
                              <p className="text-xs uppercase tracking-widest" style={{ color: rarityConfig.color }}>
                                {rarityConfig.label} • {CARD_TYPE_LABELS[card.type] || 'Card'}
                              </p>
                              <p className="text-xs text-slate-700 mt-2">Owned x{card.count}</p>
                              <div className="mt-auto pt-2 flex gap-2">
                                <button
                                  onClick={() => handleTradeRequest('card', card)}
                                  disabled={!canTradeToday}
                                  className={`flex-1 text-xs px-2 py-1 rounded font-semibold transition-all ${
                                    canTradeToday
                                      ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                                      : 'bg-white/60 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  Trade
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">
                    No cards yet. Open packs or grab mystery boxes to start your collection!
                  </p>
                )}
              </div>

              {/* Owned Avatars */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Avatars</h3>
                {studentData.ownedAvatars && studentData.ownedAvatars.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                    {studentData.ownedAvatars.map(avatarName => (
                      <div key={avatarName} className={`border-2 rounded-lg p-2 md:p-3 text-center ${studentData.avatarBase === avatarName ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <img
                          src={getAvatarImage(avatarName, calculateAvatarLevel(studentData.totalPoints))}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1"
                          onError={(e) => {
                            e.target.src = '/shop/Basic/Banana.png';
                          }}
                        />
                        <p className="text-xs font-semibold truncate">{avatarName}</p>
                        <div className="mt-1 flex flex-col gap-1 items-center">
                          {studentData.avatarBase === avatarName ? (
                            <p className="text-xs text-blue-600 font-bold">Equipped</p>
                          ) : showSellMode ? (
                            <button
                              onClick={() => handleSellItem(avatarName, 'avatar')}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 active:scale-95"
                            >
                              Sell
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEquip('avatar', avatarName)}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 active:scale-95"
                            >
                              Equip
                            </button>
                          )}
                          <button
                            onClick={() => handleTradeRequest('avatar', avatarName)}
                            disabled={!canTradeToday}
                            className={`text-xs px-2 py-1 rounded font-semibold transition-all ${
                              canTradeToday
                                ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Trade
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No avatars owned yet. Visit the shop to buy some!</p>
                )}
              </div>

              {/* Owned Pets */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Pets</h3>
                {studentData.ownedPets?.length > 0 ? (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                    {studentData.ownedPets.map((pet, index) => (
                      <div key={pet.id} className={`border-2 rounded-lg p-2 md:p-3 text-center ${index === 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                        {(() => {
                          const petImage = resolvePetArt(getPetImage(pet));
                          return (
                            <img
                              src={petImage.src}
                              className="w-12 h-12 md:w-16 md:h-16 rounded-full mx-auto mb-1"
                              data-fallbacks={serializeFallbacks(petImage.fallbacks)}
                              data-fallback-index="0"
                              onError={petImageErrorHandler}
                              alt={pet.name}
                            />
                          );
                        })()}
                        <p className="text-xs font-semibold truncate">{pet.name}</p>
                        <div className="mt-1 flex flex-col gap-1 items-center">
                          {index === 0 ? (
                            <p className="text-xs text-purple-600 font-bold">Active</p>
                          ) : showSellMode ? (
                            <button
                              onClick={() => handleSellItem(pet, 'pet')}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 active:scale-95"
                            >
                              Sell
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEquip('pet', pet.id)}
                              className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 active:scale-95"
                            >
                              Equip
                            </button>
                          )}
                          <button
                            onClick={() => handleTradeRequest('pet', pet)}
                            disabled={!canTradeToday}
                            className={`text-xs px-2 py-1 rounded font-semibold transition-all ${
                              canTradeToday
                                ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Trade
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No pets yet! Get 50 XP to unlock your first pet.</p>
                )}
              </div>

              {/* Pet Eggs */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">Incubating Eggs</h3>
                {studentEggs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {studentEggs.map((egg) => {
                      const status = getEggStageStatus(egg);
                      const accent = getEggAccent(egg);
                      const eggArt = resolveEggArt(status.stage);
                      const stageMessage = EGG_STAGE_MESSAGES[status.stage] || 'A surprise is brewing inside.';
                      const stageMessageClass = `text-xs text-gray-600 mb-3 ${status.stage === 'ready' ? '' : 'mt-auto'}`;

                      return (
                        <div
                          key={egg.id}
                          className="border-2 border-purple-200 rounded-xl p-3 md:p-4 bg-purple-50 flex flex-col"
                          style={{
                            borderColor: `${accent}55`,
                            background: `linear-gradient(135deg, ${accent}11, #ffffff)`
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shadow ${
                                status.stage === 'unbroken' ? 'egg-shake' : ''
                              }`}
                              style={{
                                background: `radial-gradient(circle at 30% 30%, ${accent}22, #ffffff)`,
                                border: `3px solid ${accent}`
                              }}
                            >
                              <Image
                                src={eggArt.src}
                                alt={`${egg.name} stage illustration`}
                                fill
                                sizes="64px"
                                className="object-contain p-1"
                                data-fallbacks={serializeFallbacks(eggArt.fallbacks)}
                                data-fallback-index="0"
                                onError={eggImageErrorHandler}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-sm md:text-base">{egg.name}</p>
                              <p className="text-xs text-gray-600">{status.stageLabel}</p>
                            </div>
                          </div>

                          <p className={stageMessageClass}>{stageMessage}</p>

                          {status.stage === 'ready' ? (
                            <button
                              onClick={() => handleHatchEgg(egg)}
                              className="mt-auto text-xs md:text-sm bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 font-semibold"
                            >
                              Hatch Egg
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">No magical eggs yet. Try opening a Mystery Box!</p>
                )}
              </div>

              {/* Purchased Rewards */}
              {studentData.rewardsPurchased?.length > 0 && (
                <div>
                  <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">My Rewards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    {studentData.rewardsPurchased.map((reward, index) => (
                      <div key={index} className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-xl md:text-2xl">{reward.icon || '🎁'}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm md:text-base">{reward.name}</p>
                            <p className="text-xs text-gray-600">Earned: {new Date(reward.purchasedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {showSellMode && (
                          <button 
                            onClick={() => handleSellItem(reward, 'reward')} 
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 flex-shrink-0 active:scale-95"
                          >
                            Sell
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentShop;