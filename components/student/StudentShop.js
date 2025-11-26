// components/student/StudentShop.js - UPDATED WITH CHRISTMAS SUPPORT
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { CARD_EFFECTS, CARD_EFFECT_MAP } from '../../constants/cardEffects';
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
import { DEFAULT_TEACHER_REWARDS, buildShopInventory, getDailySpecials } from '../../utils/shopSpecials';

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
const MAX_LOOT_WELL_HISTORY = 12;

// Define rarity weights (higher = more common)
const RARITY_WEIGHTS = {
  common: 70,     // more common
  uncommon: 22,   // frequent but modest
  rare: 6,        // occasional
  epic: 2,        // very rare
  legendary: 1    // extremely rare
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

// Function to get all possible mystery box prizes (includes Christmas items via props)
const getMysteryBoxPrizes = (
  SHOP_BASIC_AVATARS,
  SHOP_PREMIUM_AVATARS,
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  classRewards,
  CHRISTMAS_BASIC_AVATARS = [],
  CHRISTMAS_PREMIUM_AVATARS = [],
  CHRISTMAS_PETS = [],
  EGG_TYPES = PET_EGG_TYPES,
  CARD_PACKS = [],
  CARD_EFFECTS_POOL = CARD_EFFECTS
) => {
  const prizes = [];

  // Add shop avatars (includes Christmas avatars passed from parent)
  [
    ...SHOP_BASIC_AVATARS,
    ...SHOP_PREMIUM_AVATARS,
    ...CHRISTMAS_BASIC_AVATARS,
    ...CHRISTMAS_PREMIUM_AVATARS
  ].forEach(avatar => {
    prizes.push({
      type: 'avatar',
      item: avatar,
      rarity: getItemRarity(avatar.price),
      name: avatar.name,
      displayName: avatar.name
    });
  });

  // Add shop pets (includes Christmas pets passed from parent)
  [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...CHRISTMAS_PETS].forEach(pet => {
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

  // Add rare cosmetic card effects (loot well and boxes only)
  (CARD_EFFECTS_POOL || []).forEach(effect => {
    prizes.push({
      type: 'card_effect',
      effectId: effect.id,
      rarity: effect.rarity,
      name: effect.name,
      displayName: effect.name,
      icon: '✨'
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
    case 'card_effect':
      return prize.name || 'Cosmetic Card Effect';
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

// Find original item price from shop data (includes Christmas items)
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
  HALLOWEEN_PETS = [],
  CHRISTMAS_BASIC_AVATARS = [],
  CHRISTMAS_PREMIUM_AVATARS = [],
  CHRISTMAS_PETS = []
) => {
  if (itemType === 'avatar') {
    const basicAvatar = SHOP_BASIC_AVATARS.find(a => a.name === itemName);
    const premiumAvatar = SHOP_PREMIUM_AVATARS.find(a => a.name === itemName);
    const halloweenBasic = HALLOWEEN_BASIC_AVATARS.find(a => a.name === itemName);
    const halloweenPremium = HALLOWEEN_PREMIUM_AVATARS.find(a => a.name === itemName);
    const christmasBasic = CHRISTMAS_BASIC_AVATARS.find(a => a.name === itemName);
    const christmasPremium = CHRISTMAS_PREMIUM_AVATARS.find(a => a.name === itemName);
    return (
      basicAvatar?.price ||
      premiumAvatar?.price ||
      halloweenBasic?.price ||
      halloweenPremium?.price ||
      christmasBasic?.price ||
      christmasPremium?.price ||
      10
    ); // Default if not found
  } else if (itemType === 'pet') {
    const basicPet = SHOP_BASIC_PETS.find(p => p.name === itemName);
    const premiumPet = SHOP_PREMIUM_PETS.find(p => p.name === itemName);
    const halloweenPet = HALLOWEEN_PETS.find(p => p.name === itemName);
    const christmasPet = CHRISTMAS_PETS.find(p => p.name === itemName);
    return basicPet?.price || premiumPet?.price || halloweenPet?.price || christmasPet?.price || 15; // Default if not found
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
  CHRISTMAS_BASIC_AVATARS = [],
  CHRISTMAS_PREMIUM_AVATARS = [],
  CHRISTMAS_PETS = [],
  classRewards,
  classmates = [],
  classData = null,
  performClassmateTrade = null
}) => {
  const [activeCategory, setActiveCategory] = useState('featured');
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });
  const [respondingTradeId, setRespondingTradeId] = useState(null);
  const [mounted, setMounted] = useState(false);

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
  const [lootWellResult, setLootWellResult] = useState(null);
  const [lootWellCountdown, setLootWellCountdown] = useState('');
  const [lootWellAnimating, setLootWellAnimating] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Egg celebrations
  const [hatchingCelebration, setHatchingCelebration] = useState(null);

  const currentCoins = calculateCoins(studentData);

  const studentEggs = useMemo(() => studentData?.petEggs || [], [studentData?.petEggs]);

  const cardCollection = useMemo(() => {
    const stored = studentData?.cardCollection || {};
    return {
      packs: { ...(stored.packs || {}) },
      cards: { ...(stored.cards || {}) },
      history: Array.isArray(stored.history) ? [...stored.history] : [],
      totalOpened: stored.totalOpened || 0,
      lastOpenedAt: stored.lastOpenedAt || null
    };
  }, [studentData?.cardCollection]);

  const availableClassRewards = useMemo(
    () => (classRewards?.length ? classRewards : DEFAULT_TEACHER_REWARDS),
    [classRewards]
  );

  const equippedCardEffectId = studentData?.equippedCardEffect || '';
  const ownedCardEffects = useMemo(() => {
    const ownedIds = new Set(studentData?.ownedCardEffects || []);
    return CARD_EFFECTS.filter(effect => ownedIds.has(effect.id));
  }, [studentData?.ownedCardEffects]);

  const tradingCardLibrary = useMemo(
    () =>
      buildTradingCardLibrary({
        avatars: [
          ...(SHOP_BASIC_AVATARS || []),
          ...(SHOP_PREMIUM_AVATARS || []),
          ...(HALLOWEEN_BASIC_AVATARS || []),
          ...(HALLOWEEN_PREMIUM_AVATARS || []),
          ...(CHRISTMAS_BASIC_AVATARS || []),
          ...(CHRISTMAS_PREMIUM_AVATARS || [])
        ],
        pets: [
          ...(SHOP_BASIC_PETS || []),
          ...(SHOP_PREMIUM_PETS || []),
          ...(HALLOWEEN_PETS || []),
          ...(CHRISTMAS_PETS || [])
        ]
      }),
    [
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      CHRISTMAS_BASIC_AVATARS,
      CHRISTMAS_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      HALLOWEEN_PETS,
      CHRISTMAS_PETS
    ]
  );

  const seasonalItems = useMemo(
    () => [
      ...(HALLOWEEN_BASIC_AVATARS || []).map(item => ({ ...item, category: 'halloween', type: 'avatar' })),
      ...(HALLOWEEN_PREMIUM_AVATARS || []).map(item => ({ ...item, category: 'halloween', type: 'avatar' })),
      ...(HALLOWEEN_PETS || []).map(item => ({ ...item, category: 'halloween', type: 'pet' })),
      ...(CHRISTMAS_BASIC_AVATARS || []).map(item => ({ ...item, category: 'christmas', type: 'avatar' })),
      ...(CHRISTMAS_PREMIUM_AVATARS || []).map(item => ({ ...item, category: 'christmas', type: 'avatar' })),
      ...(CHRISTMAS_PETS || []).map(item => ({ ...item, category: 'christmas', type: 'pet' }))
    ],
    [
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      HALLOWEEN_PETS,
      CHRISTMAS_BASIC_AVATARS,
      CHRISTMAS_PREMIUM_AVATARS,
      CHRISTMAS_PETS
    ]
  );

  const featuredItems = useMemo(() => {
    const inventory = buildShopInventory({
      basicAvatars: SHOP_BASIC_AVATARS,
      premiumAvatars: SHOP_PREMIUM_AVATARS,
      basicPets: SHOP_BASIC_PETS,
      premiumPets: SHOP_PREMIUM_PETS,
      rewards: availableClassRewards,
      cardPacks: DEFAULT_CARD_PACKS,
      extraItems: seasonalItems
    });

    return getDailySpecials(inventory);
  }, [
    SHOP_BASIC_AVATARS,
    SHOP_PREMIUM_AVATARS,
    SHOP_BASIC_PETS,
    SHOP_PREMIUM_PETS,
    availableClassRewards,
    seasonalItems
  ]);

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
  const lootWellHistory = useMemo(() => {
    const history = lootWellStats.history;
    if (!Array.isArray(history) || history.length === 0) {
      return [];
    }

    return history.slice(-5).reverse();
  }, [lootWellStats.history]);

  const createCardCollectionSnapshot = useCallback(
    () => ({
      packs: { ...(cardCollection.packs || {}) },
      cards: { ...(cardCollection.cards || {}) },
      history: Array.isArray(cardCollection.history) ? [...cardCollection.history] : [],
      totalOpened: cardCollection.totalOpened || 0,
      lastOpenedAt: cardCollection.lastOpenedAt || null
    }),
    [cardCollection]
  );

  const applyPrizeToStudent = useCallback(
    (prize, baseUpdates = {}, options = {}) => {
      if (!prize) {
        return { ...baseUpdates };
      }

      const updates = { ...baseUpdates };
      const timestamp = typeof options.timestamp === 'number' ? options.timestamp : Date.now();
      const nowIso = options.nowIso || new Date(timestamp).toISOString();

      switch (prize.type) {
        case 'avatar': {
          const avatarName = prize.item?.name;
          if (avatarName) {
            const existing = new Set([...(studentData.ownedAvatars || [])]);
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
            const newPet = { ...prize.item, id: prize.item?.id || `pet_${timestamp}` };
            const existingPets = Array.isArray(updates.ownedPets)
              ? updates.ownedPets
              : [...(studentData.ownedPets || [])];
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
              : [...(studentData.petEggs || [])];
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
              : [...(studentData.rewardsPurchased || [])];
            updates.rewardsPurchased = [
              ...rewards,
              {
                ...rewardItem,
                purchasedAt: nowIso
              }
            ];
            showToast(`You won ${rewardItem.name}!`, 'success');
          }
          break;
        }
        case 'xp': {
          const totalPoints = (updates.totalPoints ?? studentData.totalPoints ?? 0) + (prize.amount || 0);
          updates.totalPoints = totalPoints;
          showToast(`You won ${prize.amount || 0} XP!`, 'success');
          break;
        }
        case 'coins': {
          const currency = (updates.currency ?? studentData.currency ?? 0) + (prize.amount || 0);
          updates.currency = currency;
          showToast(`You won ${prize.amount || 0} bonus coins!`, 'success');
          break;
        }
      case 'card_pack': {
        const pack = prize.pack;
        if (pack) {
          const snapshot = updates.cardCollection || createCardCollectionSnapshot();
          const packs = { ...(snapshot.packs || {}) };
            const entry = packs[pack.id] || { count: 0 };
            packs[pack.id] = {
              ...entry,
              count: (entry.count || 0) + 1,
              lastObtainedAt: nowIso
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
      case 'card_effect': {
        const effectId = prize.effectId;
        if (effectId) {
          const ownedEffects = new Set(studentData.ownedCardEffects || []);
          if (Array.isArray(updates.ownedCardEffects)) {
            updates.ownedCardEffects.forEach(id => ownedEffects.add(id));
          }
          ownedEffects.add(effectId);
          updates.ownedCardEffects = [...ownedEffects];

          if (!studentData.equippedCardEffect && !updates.equippedCardEffect) {
            updates.equippedCardEffect = effectId;
          }

          const effectName = CARD_EFFECT_MAP[effectId]?.name || 'card effect';
          showToast(`You unlocked the ${effectName}!`, 'success');
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
    },
    [
      createCardCollectionSnapshot,
      showToast,
      studentData.ownedAvatars,
      studentData.ownedPets,
      studentData.petEggs,
      studentData.rewardsPurchased,
      studentData.totalPoints,
      studentData.currency,
      studentData.ownedCardEffects,
      studentData.equippedCardEffect
    ]
  );

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
    
    // Get all possible prizes (includes Christmas items)
    const allPrizes = getMysteryBoxPrizes(
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      availableClassRewards,
      CHRISTMAS_BASIC_AVATARS,
      CHRISTMAS_PREMIUM_AVATARS,
      CHRISTMAS_PETS,
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

  const handleLootWellDraw = async () => {
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

    const allPrizes = getMysteryBoxPrizes(
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      availableClassRewards,
      CHRISTMAS_BASIC_AVATARS,
      CHRISTMAS_PREMIUM_AVATARS,
      CHRISTMAS_PETS,
      PET_EGG_TYPES,
      DEFAULT_CARD_PACKS
    );

    let selectedPrize = allPrizes.length > 0 ? selectRandomPrize(allPrizes) : null;
    const outcome = 'prize';

    if (!selectedPrize) {
      showToast('The well needs more treasures to grant. Please try again later.', 'error');
      setLootWellAnimating(false);
      return;
    }

    let updates = {};
    if (selectedPrize) {
      updates = applyPrizeToStudent(selectedPrize, updates, { timestamp, nowIso });
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
      totalWins: (lootWellStats.totalWins || 0) + 1
    };

    const success = await updateStudentData(updates);

    if (success) {
      setLootWellResult({ outcome, prize: selectedPrize, entry: historyEntry });
    } else {
      showToast('The well magic fizzled. Please try again.', 'error');
    }

    setLootWellAnimating(false);
  };

  // ===============================================
  // SELLING FUNCTIONS
  // ===============================================
  
  const handleSellItem = (item, type) => {
    if (type === 'reward') {
      showToast('Class rewards cannot be sold.', 'warning');
      return;
    }
    const itemName = type === 'pet' ? item.name : type === 'avatar' ? item : item.name;
    const originalPrice = findOriginalPrice(
      itemName,
      type,
      SHOP_BASIC_AVATARS,
      SHOP_PREMIUM_AVATARS,
      SHOP_BASIC_PETS,
      SHOP_PREMIUM_PETS,
      availableClassRewards,
      HALLOWEEN_BASIC_AVATARS,
      HALLOWEEN_PREMIUM_AVATARS,
      HALLOWEEN_PETS,
      CHRISTMAS_BASIC_AVATARS,
      CHRISTMAS_PREMIUM_AVATARS,
      CHRISTMAS_PETS
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
    if (sellModal.type === 'reward') {
      setSellModal({ visible: false, item: null, type: null, price: 0 });
      showToast('Class rewards cannot be sold.', 'warning');
      return;
    }
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
    } else if (type === 'card_effect') {
      updates.equippedCardEffect = value;
      showToast('Card effect equipped!', 'success');
    }

    await updateStudentData(updates);
  };

  const categories = [
    { id: 'loot_well', name: '💠 The Loot Well', shortName: 'Loot Well' },
    { id: 'featured', name: '⭐ Featured Items', shortName: 'Featured' },
    { id: 'card_packs', name: '✨ Card Packs', shortName: 'Cards' },
    { id: 'mysterybox', name: '🎁 Mystery Box', shortName: 'Mystery' },
    { id: 'christmas', name: '🎄 Christmas Special', shortName: '🎄 Christmas' },
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

  const renderFeaturedItems = () => {
    if (!featuredItems || featuredItems.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <div className="text-4xl mb-2">✨</div>
          <p className="text-gray-600">Check back soon for rotating deals!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {featuredItems.map(item => {
          const isAvatar = item.type === 'avatar';
          const isPet = item.type === 'pet';
          const isReward = item.type === 'reward';
          const isCardPack = item.type === 'card_pack';

          const owned = isAvatar
            ? studentData?.ownedAvatars?.includes(item.name)
            : isPet
              ? studentData?.ownedPets?.some(p => p.name === item.name)
              : isReward
                ? studentData?.rewardsPurchased?.some(r => r.id === item.id || r.name === item.name)
                : false;

          if (isCardPack) {
            const packStyle = CARD_RARITY_STYLES[item.rarity] || CARD_RARITY_STYLES.common;
            const ownedCount = cardCollection.packs?.[item.id]?.count || 0;
            const canAfford = currentCoins >= item.price;

            return (
              <div
                key={item.id}
                className="relative rounded-2xl overflow-hidden shadow-lg border border-white/20"
                style={{
                  background: packStyle.gradient,
                  borderColor: `${packStyle.border}`
                }}
              >
                {item.salePercentage ? (
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    -{item.salePercentage}%
                  </div>
                ) : null}

                <div className="p-4 text-white flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/70">{packStyle.label}</p>
                      <h4 className="text-lg font-semibold drop-shadow">{item.name}</h4>
                    </div>
                    <span className="text-4xl drop-shadow-lg">{item.icon || '🃏'}</span>
                  </div>

                  <p className="text-xs text-white/80 mb-3">
                    {item.minCards}-{item.maxCards} cards per pack
                  </p>

                  <div className="mb-3 space-y-1">
                    {item.salePercentage && item.originalPrice ? (
                      <div className="text-xs text-white/70 line-through">💰 {item.originalPrice}</div>
                    ) : null}
                    <div className="text-lg font-bold">💰 {item.price}</div>
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <button
                      onClick={() => setPurchaseModal({ visible: true, item, type: 'card_pack' })}
                      disabled={!canAfford}
                      className="w-full rounded-lg bg-black/20 backdrop-blur px-3 py-2 text-sm font-semibold text-white hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Buy Pack
                    </button>
                    <p className="text-xs text-center text-white/80">Owned: x{ownedCount}</p>
                  </div>
                </div>
              </div>
            );
          }

          const canAfford = currentCoins >= item.price;

          return (
            <div
              key={item.name || item.id}
              className={`border-2 rounded-lg p-4 text-center flex flex-col justify-between relative ${owned ? 'border-green-400 bg-green-50' : 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50'}`}
            >
              {item.salePercentage ? (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  -{item.salePercentage}%
                </div>
              ) : null}

              <div className="text-3xl mb-2">{item.icon || (isPet ? '🐾' : isReward ? '🎁' : '⭐')}</div>
              <h4 className="font-bold text-lg text-gray-800 mb-1">{item.name}</h4>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description || 'Limited-time deal from the main shop.'}</p>

              <div className="mb-3 space-y-1">
                {item.salePercentage && item.originalPrice ? (
                  <div className="text-xs text-gray-500 line-through">💰 {item.originalPrice}</div>
                ) : null}
                <div className="text-xl font-bold text-gray-900">💰 {item.price}</div>
              </div>

              <button
                onClick={() => setPurchaseModal({ visible: true, item, type: item.type })}
                disabled={owned || !canAfford}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                  owned
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : canAfford
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {owned ? 'Owned' : canAfford ? 'Buy Now' : 'Not enough coins'}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderLootWell = () => {
    const lastPrize = lootWellStats.lastPrize;

    return (
      <div className="col-span-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700 text-white shadow-2xl p-6 md:p-10">
          <div className="absolute inset-0">
            <div className="absolute -top-32 -left-32 w-72 h-72 bg-cyan-300/40 blur-3xl rounded-full animate-pulse"></div>
            <div className="absolute -bottom-28 -right-24 w-80 h-80 bg-fuchsia-400/40 blur-3xl rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.22),_rgba(255,255,255,0))]" aria-hidden></div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl md:text-5xl drop-shadow-xl">⛲</span>
                <h3 className="text-3xl md:text-4xl font-black tracking-tight drop-shadow-lg">The Loot Well</h3>
                <p className="max-w-2xl text-sm md:text-base text-white/80">
                Whisper a wish into the radiant waters once every hour and the well will always answer with a prize—most are
                humble trinkets, but legendary rewards shimmer with dazzling effects when fortune smiles upon you!
                </p>
              </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-44 h-44 md:w-56 md:h-56 rounded-full bg-white/10 blur-2xl"></div>
              </div>
              <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-full border border-white/30 bg-gradient-to-br from-white/20 via-white/10 to-transparent shadow-[0_20px_45px_rgba(56,189,248,0.45)] flex items-center justify-center overflow-hidden">
                <div
                  className={`absolute inset-5 rounded-full border border-white/25 bg-gradient-to-br from-indigo-900/70 via-purple-900/80 to-black/70 backdrop-blur-sm transition-all ${
                    lootWellAnimating ? 'shadow-[0_0_40px_rgba(244,114,182,0.45)]' : 'shadow-[0_0_25px_rgba(147,197,253,0.35)]'
                  }`}
                ></div>
                <div
                  className="absolute inset-1 rounded-full border border-white/30 animate-spin"
                  style={{ animationDuration: lootWellAnimating ? '5s' : '14s' }}
                ></div>
                <div
                  className="absolute inset-3 rounded-full border border-dashed border-white/40 animate-spin"
                  style={{ animationDuration: lootWellAnimating ? '8s' : '20s' }}
                ></div>
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <span className={`text-4xl md:text-5xl drop-shadow-2xl ${lootWellAnimating ? 'animate-pulse' : ''}`}>💠</span>
                  <span className="text-[0.6rem] md:text-xs uppercase tracking-[0.5em] text-white/70">Arcane Waters</span>
                </div>
                <div className="absolute inset-x-6 bottom-6 h-12 bg-gradient-to-t from-cyan-400/50 via-sky-300/40 to-transparent blur-lg"></div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full max-w-md">
              <button
                onClick={handleLootWellDraw}
                disabled={lootWellAnimating || !lootWellReady}
                className={`w-full px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-lg transition-transform shadow-[0_0_35px_rgba(255,255,255,0.35)] ${
                  lootWellReady && !lootWellAnimating
                    ? 'bg-white text-indigo-700 hover:-translate-y-1 hover:shadow-[0_25px_55px_rgba(56,189,248,0.45)]'
                    : 'bg-white/20 text-white/70 cursor-not-allowed'
                } ${lootWellAnimating ? 'bg-white/40 text-indigo-700/90' : ''}`}
              >
                {lootWellReady
                  ? lootWellAnimating
                    ? 'Summoning Treasure...'
                    : 'Cast Your Wish'
                  : `Recharging • ${lootWellCountdown || 'Soon'}`}
              </button>
              <p className="text-xs md:text-sm text-white/70">
                {lootWellReady ? 'You may draw from the well now.' : 'Return when the waters glow again for another chance.'}
              </p>
            </div>

            {lootWellResult && (
              <div className="w-full max-w-xl px-5 py-4 rounded-2xl border border-emerald-200/70 bg-emerald-400/20 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.35)] backdrop-blur-sm transition-all">
                {`✨ The waters erupt with ${getPrizeDisplayName(lootWellResult.prize)}!`}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2 w-full max-w-3xl">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm text-left">
                <h4 className="text-sm md:text-base font-semibold text-white/90 mb-2">Latest Blessing</h4>
                {lastPrize ? (
                  <div className="text-sm text-white/80">
                    <div className="font-bold text-white">{lastPrize.name}</div>
                    <div className="text-xs uppercase tracking-wide text-white/60 mt-1">
                      {lastPrize.rarity ? `${lastPrize.rarity.toUpperCase()} • ` : ''}
                      {lootWellReady ? 'The well is ready for another wish!' : `Next wish in ${lootWellCountdown || 'an hour'}`}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-white/70">No treasures yet—be the first to awaken the well today!</p>
                )}
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm text-left">
                <h4 className="text-sm md:text-base font-semibold text-white/90 mb-2">Recent Ripples</h4>
                {lootWellHistory.length > 0 ? (
                  <ul className="space-y-2 text-sm text-white/75">
                    {lootWellHistory.map(entry => {
                      const entryDate = entry?.timestamp ? new Date(entry.timestamp) : null;
                      const timeLabel = entryDate && !Number.isNaN(entryDate.getTime())
                        ? entryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—';

                      return (
                        <li key={entry.id} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">
                              {entry.outcome === 'prize' ? '✨' : '🌊'}
                            </span>
                            <span>
                              {entry.outcome === 'prize' ? entry.prizeName || 'Mystery Treasure' : 'No prize'}
                            </span>
                          </span>
                          <span className="text-xs text-white/60">{timeLabel}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-white/70">The waters are calm—start the wave of rewards!</p>
                )}
              </div>
            </div>

            <div className="text-xs md:text-sm text-white/60 max-w-xl">
              Tip: Treasure chances are rare—every prize follows the same rarity magic as mystery boxes. Legendary pulls are truly legendary!
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMysteryBoxModal = () => {
    if (mysteryBoxModal.stage === 'confirm') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-4 md:p-6">
            <div className="text-5xl md:text-6xl mb-4">🎁</div>
            <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Open Mystery Box?</h2>
            <p className="mb-4 text-sm md:text-base">
              This will cost you <span className="font-bold text-yellow-600">{MYSTERY_BOX_PRICE} coins</span>
            </p>
            <p className="text-xs md:text-sm text-gray-600 mb-4">
              You'll receive a random prize based on rarity!
            </p>
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setMysteryBoxModal({ visible: false, stage: 'confirm' })} 
                className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={confirmMysteryBoxPurchase} 
                className="flex-1 py-2 md:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm md:text-base"
              >
                Open It!
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (mysteryBoxModal.stage === 'opening') {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-6 md:p-8">
            <div className={`text-6xl md:text-8xl mb-4 ${isSpinning ? 'animate-spin' : ''}`}>🎁</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Opening Mystery Box...</h2>
            <p className="text-purple-600 text-sm md:text-base">✨ Preparing your surprise! ✨</p>
          </div>
        </div>
      );
    }
    
    if (mysteryBoxModal.stage === 'reveal' && mysteryBoxPrize) {
      const rarityColor = getRarityColor(mysteryBoxPrize.rarity);
      const rarityBg = getRarityBg(mysteryBoxPrize.rarity);
      
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-4 md:p-6">
            <div className="text-4xl md:text-5xl mb-4">🎉</div>
            <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">You Won!</h2>
            
            <div className={`${rarityBg} border-2 ${rarityColor} rounded-xl p-4 md:p-6 mb-4`}>
              {mysteryBoxPrize.type === 'avatar' && (
                <img
                  src={mysteryBoxPrize.item.path}
                  alt={mysteryBoxPrize.displayName}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-4 border-white"
                  onError={(e) => {
                    e.target.src = '/shop/Basic/Banana.png';
                  }}
                />
              )}
              {mysteryBoxPrize.type === 'pet' && (
                <img
                  src={mysteryBoxPrize.item.path}
                  alt={mysteryBoxPrize.displayName}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-4 border-white"
                  onError={(e) => {
                    e.target.src = '/shop/BasicPets/Wizard.png';
                  }}
                />
              )}
              {mysteryBoxPrize.type === 'egg' && (
                <div
                  className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-3 rounded-full flex items-center justify-center shadow-inner"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${getEggAccent(mysteryBoxPrize.eggType)}33, #ffffff)`,
                    border: `4px solid ${getEggAccent(mysteryBoxPrize.eggType)}`
                  }}
                >
                  <span className="text-4xl md:text-5xl">🥚</span>
                </div>
              )}
              {mysteryBoxPrize.type === 'reward' && (
                <div className="text-4xl md:text-5xl mb-3">{mysteryBoxPrize.item.icon || '🎁'}</div>
              )}
              {(mysteryBoxPrize.type === 'xp' || mysteryBoxPrize.type === 'coins') && (
                <div className="text-4xl md:text-5xl mb-3">{mysteryBoxPrize.icon}</div>
              )}
              {mysteryBoxPrize.type === 'card_pack' && (() => {
                const pack = mysteryBoxPrize.pack;
                return (
                  <div
                    className="rounded-2xl px-4 py-5 text-white"
                    style={{
                      background: pack.visual?.gradient || 'linear-gradient(135deg,#3730a3,#7c3aed)',
                      boxShadow: `0 0 30px ${pack.visual?.glow || 'rgba(124,58,237,0.45)'}`
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm uppercase tracking-widest text-white/70">
                          {CARD_RARITY_STYLES[pack.rarity]?.label || pack.rarity} Pack
                        </p>
                        <p className="text-lg font-bold">{pack.name}</p>
                      </div>
                      <span className="text-4xl drop-shadow-xl">{pack.icon || '🃏'}</span>
                    </div>
                    <p className="text-sm text-white/80 mt-2">
                      Contains {pack.minCards}-{pack.maxCards} trading cards.
                    </p>
                  </div>
                );
              })()}

              <h3 className="text-base md:text-xl font-bold mb-1">{mysteryBoxPrize.displayName}</h3>
              <p className={`text-xs md:text-sm font-semibold ${rarityColor} uppercase`}>
                {mysteryBoxPrize.rarity} Rarity
              </p>
              {mysteryBoxPrize.type === 'egg' && (
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  {mysteryBoxPrize.eggType?.description || 'Keep this egg safe while it incubates. It will hatch into a surprise pet!'}
                </p>
              )}
            </div>

            <button
              onClick={collectMysteryBoxPrize} 
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-base md:text-lg"
            >
              Collect Prize!
            </button>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderSellModal = () => {
    if (!mounted) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-4 md:p-6">
          <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4 text-red-600">Sell Item?</h2>
          <p className="mb-4 text-sm md:text-base">
            Sell this item for <span className="font-bold text-green-600">💰{sellModal.price} coins</span>?
          </p>
          <p className="text-xs text-gray-500 mb-4">This action cannot be undone!</p>
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={() => setSellModal({ visible: false, item: null, type: null, price: 0 })}
              className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={confirmSell}
              className="flex-1 py-2 md:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm md:text-base"
            >
              Sell Item
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  const renderHatchCelebrationModal = () => {
    if (!hatchingCelebration) return null;

    const { pet, egg } = hatchingCelebration;
    const accent = getEggAccent(egg);
    const rarityColor = getRarityColor(pet.rarity);
    const rarityBg = getRarityBg(pet.rarity);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md text-center p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(24)].map((_, index) => (
              <div
                key={index}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`
                }}
              ></div>
            ))}
          </div>

          <div className="text-5xl md:text-6xl mb-4 animate-bounce">🐣</div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">A New Friend Appeared!</h2>
          <p className="text-sm md:text-base text-gray-600 mb-4">
            Your <span className="font-semibold" style={{ color: accent }}>{egg.name}</span> hatched into a
            {pet.rarity ? ` ${pet.rarity.toUpperCase()}` : ''} baby pet!
          </p>

          <div className={`${rarityBg} border-2 ${rarityColor} rounded-2xl p-4 md:p-6 mb-4 relative`}
               style={{ borderColor: `${accent}66` }}>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: `radial-gradient(circle at 30% 30%, ${accent}33, #ffffff)`, border: `4px solid ${accent}` }}
              >
                <span className="text-3xl">✨</span>
              </div>
            </div>
            <img
              src={pet.path}
              alt={pet.name}
              className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-3 object-contain"
              onError={(e) => {
                e.target.src = '/shop/BasicPets/Wizard.png';
              }}
            />
            <p className="text-lg md:text-xl font-bold mb-1">{pet.name}</p>
            <p className={`text-xs md:text-sm uppercase font-semibold ${rarityColor}`}>{pet.rarity || 'special'} hatchling</p>
          </div>

          <button
            onClick={() => setHatchingCelebration(null)}
            className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold text-base md:text-lg"
          >
            Awesome!
          </button>
        </div>
      </div>
    );
  };

  const renderShopItems = () => {
    if (activeCategory === 'mysterybox') {
      return renderMysteryBox();
    }

    if (activeCategory === 'loot_well') {
      return renderLootWell();
    }

    if (activeCategory === 'featured') {
      return renderFeaturedItems();
    }

    let items = [];
    let itemType = '';

    switch (activeCategory) {
      case 'card_packs':
        items = cardPackInventory;
        itemType = 'card_pack';
        break;
      case 'christmas':
        items = [
          ...CHRISTMAS_BASIC_AVATARS.map(item => ({ ...item, __type: 'avatar' })),
          ...CHRISTMAS_PREMIUM_AVATARS.map(item => ({ ...item, __type: 'avatar' })),
          ...CHRISTMAS_PETS.map(item => ({ ...item, __type: 'pet' }))
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
        items = availableClassRewards || [];
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
      const isChristmas = item.theme === 'christmas';
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
          } ${isOwnedItem && resolvedType !== 'card_pack' ? 'opacity-50' : ''} ${isChristmas ? 'border-2 border-emerald-500' : ''}`}
        >
          {isChristmas && (
            <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">
              🎄 CHRISTMAS
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
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 md:p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl md:text-3xl font-bold mb-1">🛍️ Shop</h2>
            <p className="text-blue-100 text-sm md:text-base">Spend your coins on awesome items!</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg px-3 py-2 md:px-4 md:py-3">
            <div className="text-xs md:text-sm text-blue-100">Your Coins</div>
            <div className="text-xl md:text-2xl font-bold">💰 {currentCoins}</div>
          </div>
        </div>
      </div>

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
                        You offered <span className="font-semibold">{offeredName}</span>{' '}
                        for <span className="font-semibold">{requestedName}</span>.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelTradeRequest}
                      disabled={respondingTradeId === outgoingTradeRequest.id}
                      className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                        respondingTradeId === outgoingTradeRequest.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
                      }`}
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
                      {fromName} wants to trade their{' '}
                      <span className="font-semibold">{offeredName}</span>{' '}
                      for your <span className="font-semibold">{requestedName}</span>.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleIncomingTradeDecision(request, 'reject')}
                      disabled={respondingTradeId === request.id}
                      className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                        respondingTradeId === request.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-white text-blue-700 border border-blue-300 hover:bg-blue-100'
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleIncomingTradeDecision(request, 'accept')}
                      disabled={respondingTradeId === request.id}
                      className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition ${
                        respondingTradeId === request.id
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
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

      {/* Quick Actions - Mobile Optimized */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setInventoryModal({ visible: true })}
          className="flex-shrink-0 bg-purple-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all text-sm md:text-base"
        >
          🎒 My Inventory
        </button>
        <button
          onClick={() => setCardBookVisible(true)}
          className="flex-shrink-0 bg-slate-900 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all text-sm md:text-base"
        >
          📖 Card Book
        </button>
        <button
          onClick={() => setActiveCategory('card_packs')}
          className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:text-base"
        >
          🃏 Card Packs
        </button>
        <button
          onClick={() => setShowSellMode(!showSellMode)}
          className={`flex-shrink-0 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
            showSellMode
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          💵 {showSellMode ? 'Stop Selling' : 'Sell Items'}
        </button>
      </div>

      {/* Shop Content - Mobile Optimized */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        {/* Category Tabs - Mobile Optimized */}
        <div className="flex overflow-x-auto gap-2 mb-4 md:mb-6 pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold transition-all text-xs md:text-sm ${
                activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="md:hidden">{cat.shortName}</span>
              <span className="hidden md:inline">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Special Header for Mystery Box Section */}
        {activeCategory === 'mysterybox' && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">🎁</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-purple-800">Mystery Box Adventure!</h3>
                <p className="text-purple-600 text-sm md:text-base">Take a chance and discover amazing surprises including Christmas items!</p>
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'loot_well' && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-sky-100 via-indigo-100 to-purple-100 rounded-lg border-2 border-sky-200">
            <div className="flex items-center gap-3">
              <div className="text-2xl md:text-3xl">💠</div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-indigo-800">The Loot Well is overflowing!</h3>
                <p className="text-indigo-600 text-sm md:text-base">Dip into the well once every hour for a rare chance at dazzling rewards.</p>
              </div>
            </div>
          </div>
        )}

        <div className={`grid gap-3 md:gap-4 ${
          activeCategory === 'mysterybox' || activeCategory === 'loot_well'
            ? 'grid-cols-1'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {renderShopItems()}
        </div>
      </div>

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

              {/* Card Effects */}
              <div>
                <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3">Card Effects</h3>
                {ownedCardEffects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {ownedCardEffects.map(effect => (
                      <div
                        key={effect.id}
                        className={`relative border-2 rounded-xl p-3 md:p-4 overflow-hidden ${
                          equippedCardEffectId === effect.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="absolute inset-0 pointer-events-none">
                          <div className={`absolute inset-0 blur-2xl rounded-xl ${effect.preview?.auraClass || ''}`} />
                          <div
                            className={`absolute inset-0 rounded-xl ${effect.preview?.ringClass || ''} ${
                              effect.preview?.animationClass || ''
                            }`}
                          />
                        </div>
                        <div className="relative z-10 flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white shadow"
                            aria-hidden
                          >
                            ✨
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm md:text-base text-slate-900 truncate">{effect.name}</p>
                            <p className="text-xs text-slate-600 truncate">{effect.description}</p>
                            <p className="text-[11px] uppercase tracking-wider text-indigo-600 mt-1">{effect.rarity}</p>
                          </div>
                        </div>
                        <div className="relative z-10 mt-3 flex gap-2">
                          {equippedCardEffectId === effect.id ? (
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">
                              Equipped
                            </span>
                          ) : (
                            <button
                              onClick={() => handleEquip('card_effect', effect.id)}
                              className="text-xs bg-indigo-600 text-white px-3 py-1 rounded font-semibold hover:bg-indigo-700 active:scale-95"
                            >
                              Equip
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm md:text-base">
                    Find rare card effects in the Mystery Box or Loot Well to decorate your student card.
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
                          <span className="text-[11px] uppercase font-semibold text-red-600">Not sellable</span>
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