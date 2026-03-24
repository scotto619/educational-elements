// components/student/modals/HatchCelebrationModal.js
import React from 'react';
import { getEggAccent, getRarityColor, getRarityBg } from '../shopHelpers';

const HatchCelebrationModal = ({ hatchingCelebration, onClose }) => {
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
            />
          ))}
        </div>

        <div className="text-5xl md:text-6xl mb-4 animate-bounce">🐣</div>
        <h2 className="text-xl md:text-2xl font-bold mb-2">A New Friend Appeared!</h2>
        <p className="text-sm md:text-base text-gray-600 mb-4">
          Your <span className="font-semibold" style={{ color: accent }}>{egg.name}</span> hatched into a
          {pet.rarity ? ` ${pet.rarity.toUpperCase()}` : ''} baby pet!
        </p>

        <div
          className={`${rarityBg} border-2 ${rarityColor} rounded-2xl p-4 md:p-6 mb-4 relative`}
          style={{ borderColor: `${accent}66` }}
        >
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
            onError={(e) => { e.target.src = '/shop/BasicPets/Wizard.png'; }}
          />
          <p className="text-lg md:text-xl font-bold mb-1">{pet.name}</p>
          <p className={`text-xs md:text-sm uppercase font-semibold ${rarityColor}`}>{pet.rarity || 'special'} hatchling</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold text-base md:text-lg"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default HatchCelebrationModal;
