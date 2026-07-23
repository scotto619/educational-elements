// components/student/shopHelpers.js
// Pure constants and utility functions shared across the StudentShop system.
// No React or component state — safe to import anywhere.

import {
  PET_EGG_TYPES,
  EGG_STAGE_ART,
  getEggStageArt,
  DEFAULT_PET_IMAGE,
  isSameItemName
} from '../../utils/gameHelpers';
import { normalizeImageSource, createImageErrorHandler } from '../../utils/imageFallback';
import { CARD_EFFECTS } from '../../constants/cardEffects';

// ── Image helpers ────────────────────────────────────────────────────────────

export const defaultEggArt = (EGG_STAGE_ART?.unbroken && EGG_STAGE_ART.unbroken.src) || '/shop/Egg/Egg.png';
export const eggImageErrorHandler = createImageErrorHandler(defaultEggArt);
export const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);

export const resolveEggArt = (stage) => normalizeImageSource(getEggStageArt(stage), defaultEggArt);
export const resolvePetArt = (source) => normalizeImageSource(source, DEFAULT_PET_IMAGE);

// ── Mystery box constants ────────────────────────────────────────────────────

export const MYSTERY_BOX_PRICE = 10;
export const LOOT_WELL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
export const MAX_LOOT_WELL_HISTORY = 12;

// Higher weight = more common
export const RARITY_WEIGHTS = {
  common: 70,
  uncommon: 22,
  rare: 6,
  epic: 2,
  legendary: 1
};

// Eggs are slightly easier to find than other items at their rarity tier
export const EGG_RARITY_WEIGHT_BOOST = 3;

// Card effects are premium cosmetics — each individual effect has only a small
// chance of appearing in any given loot pool, making them genuinely rare finds.
// Value: 0.0 (never) – 1.0 (always).  0.1 ≈ ~3 effects per spin pool on average.
export const CARD_EFFECT_POOL_INCLUSION_CHANCE = 0.1;

export const MYSTERY_REWARDS = {
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

// ── Rarity helpers ───────────────────────────────────────────────────────────

export const getItemRarity = (price) => {
  if (price <= 12) return 'common';
  if (price <= 20) return 'uncommon';
  if (price <= 30) return 'rare';
  if (price <= 45) return 'epic';
  return 'legendary';
};

export const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common': return 'text-gray-600 border-gray-300';
    case 'uncommon': return 'text-green-600 border-green-300';
    case 'rare': return 'text-blue-600 border-blue-300';
    case 'epic': return 'text-purple-600 border-purple-300';
    case 'legendary': return 'text-yellow-600 border-yellow-300';
    default: return 'text-gray-600 border-gray-300';
  }
};

export const getRarityBg = (rarity) => {
  switch (rarity) {
    case 'common': return 'bg-gray-100';
    case 'uncommon': return 'bg-green-100';
    case 'rare': return 'bg-blue-100';
    case 'epic': return 'bg-purple-100';
    case 'legendary': return 'bg-yellow-100';
    default: return 'bg-gray-100';
  }
};

export const getEggAccent = (egg) => {
  if (!egg) return '#6366f1';
  if (egg.accent) return egg.accent;
  switch (egg.rarity) {
    case 'common': return '#6b7280';
    case 'uncommon': return '#16a34a';
    case 'rare': return '#2563eb';
    case 'epic': return '#7c3aed';
    case 'legendary': return '#f59e0b';
    default: return '#6366f1';
  }
};

// ── Prize helpers ────────────────────────────────────────────────────────────

export const getMysteryBoxPrizes = (
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

  [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...CHRISTMAS_PETS].forEach(pet => {
    prizes.push({
      type: 'pet',
      item: pet,
      rarity: getItemRarity(pet.price),
      name: pet.name,
      displayName: pet.name
    });
  });

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

  (classRewards || []).forEach(reward => {
    prizes.push({
      type: 'reward',
      item: reward,
      rarity: getItemRarity(reward.price),
      name: reward.name,
      displayName: reward.name
    });
  });

  Object.entries(MYSTERY_REWARDS.xp).forEach(([rarity, amounts]) => {
    amounts.forEach(amount => {
      prizes.push({ type: 'xp', amount, rarity, name: `${amount} XP`, displayName: `${amount} XP Boost`, icon: '⭐' });
    });
  });

  Object.entries(MYSTERY_REWARDS.coins).forEach(([rarity, amounts]) => {
    amounts.forEach(amount => {
      prizes.push({ type: 'coins', amount, rarity, name: `${amount} Coins`, displayName: `${amount} Bonus Coins`, icon: '💰' });
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

  // Card effects are VERY rare in loot — each effect has only a small chance
  // of even appearing in the prize pool for any given spin.
  (CARD_EFFECTS_POOL || []).forEach(effect => {
    if (Math.random() < CARD_EFFECT_POOL_INCLUSION_CHANCE) {
      prizes.push({
        type: 'card_effect',
        effectId: effect.id,
        rarity: 'legendary', // always treated as legendary weight so they stay scarce
        name: effect.name,
        displayName: effect.name,
        icon: '✨'
      });
    }
  });

  return prizes;
};

export const selectRandomPrize = (prizes) => {
  const weightedPrizes = [];
  prizes.forEach(prize => {
    const baseWeight = RARITY_WEIGHTS[prize.rarity] || 1;
    const weightBoost = prize.type === 'egg' ? EGG_RARITY_WEIGHT_BOOST : 1;
    const weight = Math.max(1, Math.round(baseWeight * weightBoost));
    for (let i = 0; i < weight; i++) {
      weightedPrizes.push(prize);
    }
  });
  return weightedPrizes[Math.floor(Math.random() * weightedPrizes.length)];
};

export const getPrizeDisplayName = (prize) => {
  if (!prize) return '';
  switch (prize.type) {
    case 'avatar': return prize.item?.name || 'Mystery Avatar';
    case 'pet': return prize.item?.name || 'Mystery Pet';
    case 'reward': return prize.item?.name || 'Class Reward';
    case 'egg': {
      const eggName = prize.eggType?.name || prize.item?.name || prize.name;
      return eggName ? `${eggName} Egg` : 'Mystery Egg';
    }
    case 'xp': return `${prize.amount || 0} XP`;
    case 'coins': return `${prize.amount || 0} Coins`;
    case 'card_pack': return prize.pack?.name || 'Mystery Card Pack';
    case 'card_effect': return prize.name || 'Cosmetic Card Effect';
    default: return prize.name || 'Mystery Prize';
  }
};

// ── Selling helpers ──────────────────────────────────────────────────────────

export const calculateSellPrice = (originalPrice) => Math.max(1, Math.floor(originalPrice * 0.25));

export const findOriginalPrice = (
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
  // Match through the legacy rename map so items bought under OLD names still price correctly
  const match = (list) => (list || []).find((entry) => isSameItemName(entry.name, itemName));
  if (itemType === 'avatar') {
    return (
      match(SHOP_BASIC_AVATARS)?.price ||
      match(SHOP_PREMIUM_AVATARS)?.price ||
      match(HALLOWEEN_BASIC_AVATARS)?.price ||
      match(HALLOWEEN_PREMIUM_AVATARS)?.price ||
      match(CHRISTMAS_BASIC_AVATARS)?.price ||
      match(CHRISTMAS_PREMIUM_AVATARS)?.price ||
      10
    );
  }
  if (itemType === 'pet') {
    return match(SHOP_BASIC_PETS)?.price || match(SHOP_PREMIUM_PETS)?.price || match(HALLOWEEN_PETS)?.price || match(CHRISTMAS_PETS)?.price || 15;
  }
  if (itemType === 'reward') {
    const reward = (classRewards || []).find(r => r.id === itemName || r.name === itemName);
    return reward?.price || 10;
  }
  return 10;
};

// ── Date helpers ─────────────────────────────────────────────────────────────

export const formatDuration = (ms) => {
  if (!ms || ms <= 0) return '0s';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (hours === 0 && seconds > 0) parts.push(`${seconds}s`);
  return parts.join(' ') || '0s';
};

export const isSameCalendarDay = (dateA, dateB) => {
  if (!(dateA instanceof Date) || !(dateB instanceof Date)) return false;
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

export const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
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

// ── Modal initial states ─────────────────────────────────────────────────────

export const INITIAL_TRADE_MODAL_STATE = {
  visible: false,
  type: null,
  item: null,
  stage: 'select',
  selectedPartnerId: null,
  selectedPartnerItem: null,
  result: null
};

export const TRADE_TYPE_LABELS = {
  avatar: 'Avatar',
  pet: 'Pet',
  card: 'Card'
};

export const DEFAULT_CARD_PACK_OPENING_STATE = {
  visible: false,
  pack: null,
  stage: 'charging',
  cards: [],
  results: []
};
