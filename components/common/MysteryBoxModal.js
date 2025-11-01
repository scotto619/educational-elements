// components/common/MysteryBoxModal.js - REUSABLE MYSTERY BOX COMPONENT
import React, { useState } from 'react';
import {
  getMysteryBoxPrizes,
  selectRandomPrize,
  awardMysteryBoxPrize,
  getRarityColor,
  getRarityGradient,
  MYSTERY_BOX_PRICE
} from '../../utils/mysterybox';
import { getEggTypeById } from '../../utils/gameHelpers';

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

const MysteryBoxModal = ({
  isVisible,
  onClose,
  student,
  onUpdateStudent,
  showToast,
  // Prize pool configuration
  avatars = [],
  pets = [],
  rewards = [],
  // Customization options
  boxConfig = {
    name: 'Mystery Box',
    price: MYSTERY_BOX_PRICE,
    icon: '🎁',
    description: 'A magical box containing random prizes!'
  },
  // Additional options
  calculateCoins,
  theme = 'purple'
}) => {
  const [stage, setStage] = useState('confirm'); // confirm, opening, reveal
  const [prize, setPrize] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const currentCoins = calculateCoins ? calculateCoins(student) : (student?.currency || 0);

  const handlePurchase = () => {
    if (currentCoins < boxConfig.price) {
      showToast(`You need ${boxConfig.price - currentCoins} more coins for a ${boxConfig.name}!`, 'error');
      return;
    }
    
    // Deduct coins first
    const updatedStudent = { 
      ...student, 
      coinsSpent: (student.coinsSpent || 0) + boxConfig.price 
    };
    onUpdateStudent(updatedStudent);
    
    // Start the opening sequence
    setStage('opening');
    setIsSpinning(true);
    
    // Get all possible prizes
    const allPrizes = getMysteryBoxPrizes({
      avatars,
      pets,
      rewards,
      includeXP: true,
      includeCurrency: true
    });
    
    // Select random prize
    const selectedPrize = selectRandomPrize(allPrizes);
    setPrize(selectedPrize);
    
    // Spinning animation (3 seconds)
    setTimeout(() => {
      setIsSpinning(false);
      setStage('reveal');
      
      // Award the prize
      awardMysteryBoxPrize(selectedPrize, updatedStudent, onUpdateStudent, showToast);
    }, 3000);
  };

  const handleClose = () => {
    setStage('confirm');
    setPrize(null);
    setIsSpinning(false);
    onClose();
  };

  if (!isVisible) return null;

  const getThemeColors = () => {
    switch (theme) {
      case 'blue':
        return {
          primary: 'from-blue-400 to-cyan-400',
          secondary: 'from-blue-100 to-cyan-100',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'gold':
        return {
          primary: 'from-yellow-400 to-orange-400',
          secondary: 'from-yellow-100 to-orange-100',
          button: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'green':
        return {
          primary: 'from-green-400 to-emerald-400',
          secondary: 'from-green-100 to-emerald-100',
          button: 'bg-green-500 hover:bg-green-600'
        };
      default: // purple
        return {
          primary: 'from-purple-400 to-pink-400',
          secondary: 'from-purple-100 to-pink-100',
          button: 'bg-purple-500 hover:bg-purple-600'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center relative overflow-hidden animate-fadeIn">
        {/* Confirm Stage */}
        {stage === 'confirm' && (
          <div className="p-6">
            <div className="text-6xl mb-4 animate-bounce">{boxConfig.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{boxConfig.name}</h2>
            <p className="text-gray-600 mb-4 text-sm">
              {boxConfig.description}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-lg font-bold text-gray-800">
                💰 {boxConfig.price} coins
              </p>
              <p className="text-sm text-gray-600">
                You have: 💰 {currentCoins} coins
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleClose}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase}
                disabled={currentCoins < boxConfig.price}
                className={`flex-1 py-3 ${themeColors.button} text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105`}
              >
                Open Box! 🎲
              </button>
            </div>
          </div>
        )}
        
        {/* Opening Stage */}
        {stage === 'opening' && (
          <div className={`p-8 bg-gradient-to-br ${themeColors.primary} text-white`}>
            <div className={`text-8xl mb-4 transition-transform duration-300 ${
              isSpinning ? 'animate-spin' : ''
            }`}>
              {boxConfig.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2">Opening {boxConfig.name}...</h2>
            <div className="text-lg mb-4">
              {isSpinning ? 'Finding your prize...' : 'Almost ready...'}
            </div>
            
            {/* Animated dots */}
            <div className="flex justify-center">
              <div className="animate-pulse flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
            
            {/* Particle effects */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-8 right-6 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-12 left-8 w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
              <div className="absolute bottom-6 right-4 w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        )}
        
        {/* Reveal Stage */}
        {stage === 'reveal' && prize && (
          <div className="relative p-6 md:p-8 animate-fadeIn">
            {/* Confetti effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="absolute h-2 w-2 animate-ping rounded-full bg-yellow-400 opacity-80"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: '1.2s'
                  }}
                />
              ))}
            </div>

            {(() => {
              const rarityColor = getRarityColor(prize.rarity);
              const rarityGradient = getRarityGradient(prize.rarity);
              const renderArtwork = () => {
                if (prize.type === 'avatar' || prize.type === 'pet') {
                  return (
                    <img
                      src={prize.item.path}
                      alt={prize.displayName}
                      className="mx-auto h-28 w-28 rounded-full border-4 border-white object-contain shadow-xl"
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
                      className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 shadow-inner"
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
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-5xl shadow-lg">
                    {prize.icon || '🎁'}
                  </div>
                );
              };

              return (
                <>
                  <div className="mb-5 text-center">
                    <div className="text-5xl md:text-6xl">🎉</div>
                    <h2 className="mt-2 text-2xl font-extrabold text-gray-800">Congratulations!</h2>
                  </div>
                  <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                    <div className={`bg-gradient-to-br ${rarityGradient} p-6 text-center`}>{renderArtwork()}</div>
                    <div className="space-y-3 px-6 pb-6 pt-4 text-center">
                      <span className={`inline-block rounded-full border-2 px-4 py-1 text-xs font-bold uppercase tracking-wide ${rarityColor}`}>
                        {prize.rarity} prize
                      </span>
                      <h3 className="text-xl font-bold text-gray-800">{prize.displayName}</h3>
                      {(prize.description || prize.type === 'egg') && (
                        <p className="text-sm text-gray-600">
                          {prize.type === 'egg'
                            ? prize.eggType?.description ||
                              'Keep this egg safe while it incubates. It will hatch into a surprise pet!'
                            : prize.description}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}

            <button
              onClick={handleClose}
              className="mt-6 w-full transform rounded-lg bg-green-500 py-3 px-6 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-green-600"
            >
              Awesome! 🎊
            </button>
          </div>
        )}
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Preset configurations for different types of mystery boxes
export const MYSTERY_BOX_PRESETS = {
  STANDARD: {
    name: 'Mystery Box',
    price: 10,
    icon: '🎁',
    description: 'A magical box containing random prizes!',
    theme: 'purple'
  },
  
  RARE: {
    name: 'Rare Mystery Box',
    price: 25,
    icon: '🎁✨',
    description: 'A special box with better chances for rare items!',
    theme: 'blue'
  },
  
  EPIC: {
    name: 'Epic Mystery Box',
    price: 50,
    icon: '🎁💎',
    description: 'A legendary box with guaranteed epic or better!',
    theme: 'gold'
  },
  
  HOLIDAY: {
    name: 'Holiday Mystery Box',
    price: 15,
    icon: '🎁🎄',
    description: 'A festive box filled with holiday surprises!',
    theme: 'green'
  }
};

// Hook for easy mystery box management
export const useMysteryBoxModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  const open = () => setIsVisible(true);
  const close = () => setIsVisible(false);
  
  return {
    isVisible,
    open,
    close,
    MysteryBoxModal: (props) => (
      <MysteryBoxModal
        {...props}
        isVisible={isVisible}
        onClose={close}
      />
    )
  };
};

export default MysteryBoxModal;