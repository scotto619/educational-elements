// components/student/modals/MysteryBoxModal.js
import React from 'react';
import { MYSTERY_BOX_PRICE, getRarityColor, getRarityBg, getEggAccent } from '../shopHelpers';
import { CARD_RARITY_STYLES } from '../../../utils/tradingCards';

const MysteryBoxModal = ({ modal, isSpinning, prize, onClose, onConfirm, onCollect }) => {
  if (modal.stage === 'confirm') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm text-center p-4 md:p-6">
          <div className="text-5xl md:text-6xl mb-4">🎁</div>
          <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Open Mystery Box?</h2>
          <p className="mb-4 text-sm md:text-base">
            This will cost you <span className="font-bold text-yellow-600">{MYSTERY_BOX_PRICE} coins</span>
          </p>
          <p className="text-xs md:text-sm text-gray-600 mb-4">
            You&apos;ll receive a random prize based on rarity!
          </p>
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 md:py-3 border rounded-lg hover:bg-gray-50 text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 md:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm md:text-base"
            >
              Open It!
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (modal.stage === 'opening') {
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

  if (modal.stage === 'reveal' && prize) {
    const rarityColor = getRarityColor(prize.rarity);
    const rarityBg = getRarityBg(prize.rarity);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-4 md:p-6">
          <div className="text-4xl md:text-5xl mb-4">🎉</div>
          <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">You Won!</h2>

          <div className={`${rarityBg} border-2 ${rarityColor} rounded-xl p-4 md:p-6 mb-4`}>
            {prize.type === 'avatar' && (
              <img
                src={prize.item.path}
                alt={prize.displayName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-4 border-white"
                onError={(e) => { e.target.src = '/shop/Basic/Banana.png'; }}
              />
            )}
            {prize.type === 'pet' && (
              <img
                src={prize.item.path}
                alt={prize.displayName}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 border-4 border-white"
                onError={(e) => { e.target.src = '/shop/BasicPets/Wizard.png'; }}
              />
            )}
            {prize.type === 'egg' && (
              <div
                className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-3 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${getEggAccent(prize.eggType)}33, #ffffff)`,
                  border: `4px solid ${getEggAccent(prize.eggType)}`
                }}
              >
                <span className="text-4xl md:text-5xl">🥚</span>
              </div>
            )}
            {prize.type === 'reward' && (
              <div className="text-4xl md:text-5xl mb-3">{prize.item.icon || '🎁'}</div>
            )}
            {(prize.type === 'xp' || prize.type === 'coins') && (
              <div className="text-4xl md:text-5xl mb-3">{prize.icon}</div>
            )}
            {prize.type === 'card_pack' && (() => {
              const pack = prize.pack;
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

            <h3 className="text-base md:text-xl font-bold mb-1">{prize.displayName}</h3>
            <p className={`text-xs md:text-sm font-semibold ${rarityColor} uppercase`}>
              {prize.rarity} Rarity
            </p>
            {prize.type === 'egg' && (
              <p className="text-xs md:text-sm text-gray-600 mt-2">
                {prize.eggType?.description || 'Keep this egg safe while it incubates. It will hatch into a surprise pet!'}
              </p>
            )}
          </div>

          <button
            onClick={onCollect}
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

export default MysteryBoxModal;
