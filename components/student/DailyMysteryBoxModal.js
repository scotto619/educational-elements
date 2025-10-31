import React, { useEffect, useRef, useState } from 'react';
import {
  getMysteryBoxPrizes,
  selectRandomPrize,
  getRarityBg,
  getRarityColor
} from '../../utils/mysterybox';
import { createPetEgg, getEggTypeById } from '../../utils/gameHelpers';

const getEggAccent = (eggLike) => {
  const fallback = '#f59e0b';
  if (!eggLike) return fallback;
  if (typeof eggLike === 'string') {
    return getEggTypeById(eggLike)?.accent || fallback;
  }
  if (eggLike.accent) return eggLike.accent;
  if (eggLike.eggType?.accent) return eggLike.eggType.accent;
  if (eggLike.eggTypeId) {
    return getEggTypeById(eggLike.eggTypeId)?.accent || fallback;
  }
  return fallback;
};

const DailyMysteryBoxModal = ({
  isOpen,
  onClose,
  studentData,
  updateStudentData,
  showToast,
  avatars = [],
  pets = [],
  rewards = [],
  onClaimComplete
}) => {
  const [stage, setStage] = useState('intro');
  const [prize, setPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCollecting, setIsCollecting] = useState(false);
  const spinTimeoutRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
      return;
    }

    setStage('intro');
    setPrize(null);
    setIsSpinning(false);
    setIsCollecting(false);

    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
        spinTimeoutRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen || !studentData) {
    return null;
  }

  const handleOpenBox = () => {
    const prizePool = getMysteryBoxPrizes({
      avatars,
      pets,
      rewards,
      includeXP: true,
      includeCurrency: true
    });

    if (!prizePool.length) {
      showToast?.('No prizes are available in the mystery box right now. Please try again later.', 'error');
      handleClose();
      return;
    }

    const selectedPrize = selectRandomPrize(prizePool);
    setPrize(selectedPrize);
    setStage('opening');
    setIsSpinning(true);

    spinTimeoutRef.current = setTimeout(() => {
      setIsSpinning(false);
      setStage('reveal');
      spinTimeoutRef.current = null;
    }, 2500);
  };

  const handleCollectPrize = async () => {
    if (!prize || isCollecting) {
      return;
    }

    setIsCollecting(true);

    const timestamp = new Date().toISOString();
    const updates = { lastFreeMysteryBoxAt: timestamp };
    let message = '';

    switch (prize.type) {
      case 'avatar': {
        const ownedAvatars = new Set(studentData.ownedAvatars || []);
        ownedAvatars.add(prize.item.name);
        updates.ownedAvatars = Array.from(ownedAvatars);
        message = `You won the ${prize.item.name} avatar!`;
        break;
      }
      case 'pet': {
        const newPet = { ...prize.item, id: `pet_${Date.now()}` };
        updates.ownedPets = [...(studentData.ownedPets || []), newPet];
        message = `You won a ${prize.item.name}!`;
        break;
      }
      case 'egg': {
        const eggType = prize.eggType || getEggTypeById(prize.eggTypeId);
        const newEgg = createPetEgg(eggType);
        updates.petEggs = [...(studentData.petEggs || []), newEgg];
        const rarityLabel = (newEgg.rarity || '').toUpperCase();
        message = `You discovered a ${rarityLabel ? `${rarityLabel} ` : ''}${newEgg.name}!`;
        break;
      }
      case 'reward': {
        updates.rewardsPurchased = [...(studentData.rewardsPurchased || []), {
          ...prize.item,
          awardedFrom: 'daily-mystery-box',
          awardedAt: timestamp
        }];
        message = `You won ${prize.item.name}!`;
        break;
      }
      case 'xp': {
        updates.totalPoints = (studentData.totalPoints || 0) + prize.amount;
        message = `You won ${prize.amount} bonus XP!`;
        break;
      }
      case 'coins': {
        updates.currency = (studentData.currency || 0) + prize.amount;
        message = `You won ${prize.amount} bonus coins!`;
        break;
      }
      default: {
        const displayName = prize.displayName || prize.name || 'a surprise prize';
        message = `You won ${displayName}!`;
        break;
      }
    }

    const success = await updateStudentData(updates);

    if (success) {
      showToast?.(message, 'success');
      onClaimComplete?.(prize);
      handleClose();
    } else {
      showToast?.('Failed to collect your mystery box reward. Please try again.', 'error');
      setIsCollecting(false);
    }
  };

  const handleClose = () => {
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    setStage('intro');
    setPrize(null);
    setIsSpinning(false);
    setIsCollecting(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full bg-gray-100 p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Close daily mystery box"
        >
          ✕
        </button>

        {stage === 'intro' && (
          <div className="p-6 text-center">
            <div className="mb-4 text-6xl">🎁</div>
            <h2 className="mb-2 text-2xl font-bold text-purple-700">Daily Mystery Box!</h2>
            <p className="mx-auto mb-4 max-w-sm text-sm text-gray-600">
              You get one free mystery box every day you log in. Open it now to see what reward is waiting for you!
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg border-2 border-gray-200 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={handleOpenBox}
                className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
              >
                Open My Free Box! 🎲
              </button>
            </div>
          </div>
        )}

        {stage === 'opening' && (
          <div className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 p-8 text-white">
            <div
              className={`mb-4 text-7xl transition-transform duration-300 ${
                isSpinning ? 'animate-spin' : ''
              }`}
            >
              🎁
            </div>
            <h2 className="mb-2 text-2xl font-bold">Opening your mystery box...</h2>
            <p className="text-sm text-purple-100">Hold tight! Your prize is almost ready.</p>
            <div className="mt-6 flex space-x-2">
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="h-2 w-2 animate-bounce rounded-full bg-white"
                  style={{ animationDelay: `${delay}ms` }}
                ></span>
              ))}
            </div>
          </div>
        )}

        {stage === 'reveal' && prize && (
          <div className={`p-8 text-center ${getRarityBg(prize.rarity)} animate-fadeIn`}>
            <div className="mx-auto mb-4 flex items-center justify-center">
              {(() => {
                if (prize.type === 'avatar' || prize.type === 'pet') {
                  return (
                    <img
                      src={prize.item.path}
                      alt={prize.displayName}
                      className="h-24 w-24 rounded-full border-4 border-white object-contain shadow-lg"
                      onError={(e) => {
                        e.target.src =
                          prize.type === 'avatar' ? '/shop/Basic/Banana.png' : '/shop/BasicPets/Wizard.png';
                      }}
                    />
                  );
                }
                if (prize.type === 'egg') {
                  const accent = getEggAccent(prize.eggType || prize.eggTypeId);
                  return (
                    <div
                      className="flex h-28 w-28 items-center justify-center rounded-full border-4 shadow-inner"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${accent}33, #ffffff)`,
                        borderColor: accent
                      }}
                    >
                      <span className="text-5xl">🥚</span>
                    </div>
                  );
                }
                return (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/80 text-4xl shadow">
                    {prize.icon || '🎉'}
                  </div>
                );
              })()}
            </div>
            <p
              className={`mx-auto mb-2 inline-block rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wider ${getRarityColor(
                prize.rarity
              )}`}
            >
              {prize.rarity || 'mystery'}
            </p>
            <h3 className="mb-2 text-2xl font-bold text-gray-800">
              {prize.displayName || prize.name || 'Mystery Reward'}
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-sm text-gray-600">
              {prize.type === 'egg'
                ? prize.eggType?.description || 'Keep this egg safe while it incubates. It will hatch into a surprise pet!'
                : prize.description || 'Congratulations on your daily reward!'}
            </p>
            <button
              type="button"
              onClick={handleCollectPrize}
              disabled={isCollecting}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 py-2 text-sm font-semibold text-white shadow-lg transition hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCollecting ? 'Collecting...' : 'Collect Reward'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyMysteryBoxModal;
