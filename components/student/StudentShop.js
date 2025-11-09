// components/student/StudentShop.js - UPDATED WITH HALLOWEEN SUPPORT
import React, { useEffect, useMemo, useState } from 'react';
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

// ===============================================
// MYSTERY BOX SYSTEM (SHARED WITH TEACHER SHOP)
// ===============================================

const defaultEggArt = (EGG_STAGE_ART?.unbroken && EGG_STAGE_ART.unbroken.src) || '/shop/Egg/Egg.png';
const eggImageErrorHandler = createImageErrorHandler(defaultEggArt);
const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);

const resolveEggArt = (stage) => normalizeImageSource(getEggStageArt(stage), defaultEggArt);

const resolvePetArt = (source) => normalizeImageSource(source, DEFAULT_PET_IMAGE);

const MYSTERY_BOX_PRICE = 10;

// Define rarity weights (higher = more common)
const RARITY_WEIGHTS = {
  common: 50,     // 50% base chance
  uncommon: 30,   // 30% base chance  
  rare: 15,       // 15% base chance
  epic: 4,        // 4% base chance
  legendary: 1    // 1% base chance
};

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
  EGG_TYPES = PET_EGG_TYPES
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
  
  return prizes;
};

// Weighted random selection function
const selectRandomPrize = (prizes) => {
  // Create weighted array
  const weightedPrizes = [];
  prizes.forEach(prize => {
    const weight = RARITY_WEIGHTS[prize.rarity] || 1;
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
  performClassmateTrade = null
}) => {
  const [activeCategory, setActiveCategory] = useState('halloween'); // Spotlight the limited-time collection first
  const [purchaseModal, setPurchaseModal] = useState({ visible: false, item: null, type: null });
  const [inventoryModal, setInventoryModal] = useState({ visible: false });

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

  // Egg celebrations
  const [hatchingCelebration, setHatchingCelebration] = useState(null);

  const currentCoins = calculateCoins(studentData);

  const studentEggs = useMemo(() => studentData?.petEggs || [], [studentData?.petEggs]);

  const lastTradeDate = useMemo(() => parseDateValue(studentData?.lastTradeAt), [studentData?.lastTradeAt]);

  const canTradeToday = useMemo(() => {
    if (!lastTradeDate) {
      return true;
    }

    return !isSameCalendarDay(lastTradeDate, new Date());
  }, [lastTradeDate]);

  const nextTradeDate = useMemo(() => {
    if (!lastTradeDate) {
      return null;
    }

    const next = new Date(lastTradeDate.getTime());
    next.setDate(next.getDate() + 1);
    return next;
  }, [lastTradeDate]);

  const tradeAvailabilityText = useMemo(() => {
    if (canTradeToday) {
      return 'You can make one trade today.';
    }

    if (!nextTradeDate) {
      return '';
    }

    const dateText = nextTradeDate.toLocaleDateString();
    const timeText = nextTradeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `Next trade available on ${dateText} at ${timeText}.`;
  }, [canTradeToday, nextTradeDate]);

  const handleTradeRequest = (type, item) => {
    if (!canTradeToday) {
      showToast('You can only make one trade each day. Check back tomorrow!', 'info');
      return;
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

    const selectedPartner = (classmates || []).find(partner => partner.id === tradeModal.selectedPartnerId);

    if (!selectedPartner) {
      showToast('Could not find the selected classmate. Please try again.', 'error');
      return;
    }

    const partnerLastTrade = parseDateValue(selectedPartner.lastTradeAt);
    if (partnerLastTrade && isSameCalendarDay(partnerLastTrade, new Date())) {
      showToast('That classmate has already traded today. Pick someone else.', 'info');
      return;
    }

    const partnerHasItem = tradeModal.type === 'avatar'
      ? (selectedPartner.ownedAvatars || []).includes(tradeModal.selectedPartnerItem)
      : (selectedPartner.ownedPets || []).some(pet => pet.id === tradeModal.selectedPartnerItem.id);

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

      showToast(`Trade complete! You traded with ${partnerDisplayName}.`, 'success');
      setTradeModal(prev => ({
        ...prev,
        stage: 'result',
        result: {
          received: tradeModal.selectedPartnerItem,
          traded: prev.item,
          partner: { id: selectedPartner.id, name: partnerDisplayName }
        }
      }));
    } finally {
      setIsProcessingTrade(false);
    }
  };

  const renderTradeModal = () => {
    if (!tradeModal.visible) {
      return null;
    }

    const isAvatarTrade = tradeModal.type === 'avatar';

    if (tradeModal.stage === 'result' && tradeModal.result) {
      const { received, traded, partner } = tradeModal.result;
      const receivedName = isAvatarTrade ? received : received?.name;
      const tradedName = isAvatarTrade ? traded : traded?.name;
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
      })();

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-6 md:p-8">
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
      );
    }

    const itemName = isAvatarTrade ? tradeModal.item : tradeModal.item?.name;
    const previewImage = (() => {
      if (!itemName) return null;

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
    })();

    const partnerChoices = (classmates || [])
      .filter(partner => partner && partner.id && partner.id !== studentData?.id)
      .map(partner => {
        const displayName = partner.firstName
          ? `${partner.firstName}${partner.lastName ? ` ${partner.lastName}` : ''}`
          : partner.displayName || 'Classmate';
        const lastTrade = parseDateValue(partner.lastTradeAt);
        const canTradeToday = !lastTrade || !isSameCalendarDay(lastTrade, new Date());
        const partnerItems = isAvatarTrade
          ? (partner.ownedAvatars || [])
          : (partner.ownedPets || []);

        return {
          id: partner.id,
          name: displayName,
          canTrade: canTradeToday && partnerItems.length > 0,
          reason: !canTradeToday
            ? 'Already traded today'
            : partnerItems.length === 0
              ? `No ${isAvatarTrade ? 'avatars' : 'pets'} available`
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

    const confirmDisabled =
      isProcessingTrade ||
      !canTradeToday ||
      !selectedPartnerChoice ||
      !tradeModal.selectedPartnerItem;

    const tradeNote = selectedPartnerChoice
      ? `This trade will count for both you and ${selectedPartnerChoice.name} today.`
      : 'Trading will use your one trade for today.';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl text-center p-6 md:p-8 space-y-4">
          <div>
            <div className="text-4xl md:text-5xl mb-2">🤝</div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">
              {isAvatarTrade ? 'Trade Avatar with a Classmate' : 'Trade Pet with a Classmate'}
            </h2>
            <p className="text-sm md:text-base text-gray-700">
              Choose a classmate to swap this {isAvatarTrade ? 'avatar' : 'pet'}. Each student can trade once per day.
            </p>
          </div>

          {previewImage}

          {eligiblePartners.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
              No classmates are available to trade this {isAvatarTrade ? 'avatar' : 'pet'} today. Check back tomorrow!
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
                    {selectedPartnerChoice.name}'s {isAvatarTrade ? 'available avatars' : 'available pets'}
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
              {isProcessingTrade ? 'Trading...' : 'Confirm Trade'}
            </button>
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
      PET_EGG_TYPES
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
    
    let updates = {};
    
    switch (mysteryBoxPrize.type) {
      case 'avatar':
        updates.ownedAvatars = [...new Set([...(studentData.ownedAvatars || []), mysteryBoxPrize.item.name])];
        showToast(`You won the ${mysteryBoxPrize.item.name} avatar!`, 'success');
        break;
      case 'pet':
        const newPet = { ...mysteryBoxPrize.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(studentData.ownedPets || []), newPet];
        showToast(`You won a ${mysteryBoxPrize.item.name}!`, 'success');
        break;
      case 'egg': {
        const eggType = mysteryBoxPrize.eggType || getEggTypeById(mysteryBoxPrize.eggTypeId);
        const newEgg = createPetEgg(eggType);
        updates.petEggs = [...(studentData.petEggs || []), newEgg];
        const rarityLabel = (newEgg.rarity || '').toUpperCase();
        const flair = rarityLabel ? `${rarityLabel} ` : '';
        showToast(`You discovered a ${flair}${newEgg.name}!`, newEgg.rarity === 'legendary' ? 'success' : 'info');
        break;
      }
      case 'reward':
        updates.rewardsPurchased = [...(studentData.rewardsPurchased || []), {
          ...mysteryBoxPrize.item,
          purchasedAt: new Date().toISOString()
        }];
        showToast(`You won ${mysteryBoxPrize.item.name}!`, 'success');
        break;
      case 'xp':
        updates.totalPoints = (studentData.totalPoints || 0) + mysteryBoxPrize.amount;
        showToast(`You won ${mysteryBoxPrize.amount} XP!`, 'success');
        break;
      case 'coins':
        updates.currency = (studentData.currency || 0) + mysteryBoxPrize.amount;
        showToast(`You won ${mysteryBoxPrize.amount} bonus coins!`, 'success');
        break;
    }
    
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
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

    let items = [];
    let itemType = '';

    switch (activeCategory) {
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
      const alreadyOwned = resolvedType === 'avatar'
        ? studentData.ownedAvatars?.includes(item.name)
        : resolvedType === 'pet'
        ? studentData.ownedPets?.some(p => p.name === item.name)
        : false;

      const canAfford = currentCoins >= item.price;
      const isHalloween = item.theme === 'halloween';

      return (
        <div
          key={index}
          className={`bg-white rounded-xl shadow-lg p-3 md:p-4 text-center transition-all hover:shadow-xl ${
            alreadyOwned ? 'opacity-50' : ''
          } ${isHalloween ? 'border-2 border-orange-400' : ''}`}
        >
          {isHalloween && (
            <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2 inline-block">
              🎃 HALLOWEEN
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
          
          <h4 className="font-bold text-sm md:text-base mb-1 truncate">{item.name}</h4>
          <p className="text-yellow-600 font-bold mb-2 text-sm md:text-base">💰 {item.price}</p>
          
          {alreadyOwned ? (
            <button
              disabled
              className="w-full py-2 bg-gray-300 text-gray-600 rounded-lg text-xs md:text-sm font-semibold cursor-not-allowed"
            >
              Owned ✓
            </button>
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

      {/* Quick Actions - Mobile Optimized */}
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setInventoryModal({ visible: true })}
          className="flex-shrink-0 bg-purple-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all text-sm md:text-base"
        >
          🎒 My Inventory
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
                <p className="text-purple-600 text-sm md:text-base">Take a chance and discover amazing surprises including Halloween items!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className={`grid gap-3 md:gap-4 ${
          activeCategory === 'mysterybox'
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