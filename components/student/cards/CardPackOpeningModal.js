import React, { useMemo } from 'react';
import { CARD_RARITY_STYLES, CARD_TYPE_LABELS } from '../../../utils/tradingCards';

const rarityClassName = (rarity) => {
  const config = CARD_RARITY_STYLES[rarity] || CARD_RARITY_STYLES.common;
  return {
    borderColor: config.border,
    boxShadow: `0 0 24px ${config.glow}`,
    background: config.gradient,
    color: config.color
  };
};

const positionCards = (cards) => {
  const basePositions = {
    1: [{ rotate: 0, translateX: 0 }],
    2: [
      { rotate: -6, translateX: -18 },
      { rotate: 6, translateX: 18 }
    ],
    3: [
      { rotate: -10, translateX: -28 },
      { rotate: 0, translateX: 0 },
      { rotate: 10, translateX: 28 }
    ]
  };

  return basePositions[cards.length] || cards.map((_, index) => ({
    rotate: (index - (cards.length - 1) / 2) * 8,
    translateX: (index - (cards.length - 1) / 2) * 18
  }));
};

const CardPackOpeningModal = ({ visible, stage, pack, cards = [], results = [], onClose }) => {
  const positions = useMemo(() => positionCards(cards), [cards]);
  const summary = useMemo(() => {
    const rarityCounts = results.reduce((acc, card) => {
      if (!acc[card.rarity]) acc[card.rarity] = 0;
      acc[card.rarity] += 1;
      return acc;
    }, {});

    return Object.entries(rarityCounts)
      .map(([rarity, count]) => `${count} ${CARD_RARITY_STYLES[rarity]?.label || rarity}`)
      .join(' • ');
  }, [results]);

  if (!visible || !pack) {
    return null;
  }

  const packVisual = pack.visual || {};
  const canClose = stage === 'reveal';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-[60] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-slate-950/80 border border-white/10">
          <div className="absolute inset-0" aria-hidden>
            {[...Array(24)].map((_, index) => (
              <div
                key={index}
                className="absolute bg-white/20 rounded-full animate-pulse"
                style={{
                  width: `${Math.random() * 6 + 4}px`,
                  height: `${Math.random() * 6 + 4}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative p-6 md:p-10 text-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <p className="text-sm uppercase tracking-[0.35em] text-white/60 mb-3">Card Pack Opening</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-lg">{pack.icon} {pack.name}</h2>
                <p className="text-white/80 text-sm md:text-base max-w-xl leading-relaxed">
                  {pack.description || 'Bursting with magical collectibles for your adventure.'}
                </p>
                <p className="text-xs uppercase tracking-widest mt-4 text-white/50">
                  Contains {pack.minCards}-{pack.maxCards} cards • {CARD_RARITY_STYLES[pack.rarity]?.label || pack.rarity} Pack
                </p>
              </div>

              <div className="relative w-full md:w-72 flex flex-col items-center">
                <div
                  className={`relative w-48 h-64 md:w-56 md:h-72 rounded-2xl transition-all duration-700 ease-out ${
                    stage === 'reveal' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                  }`}
                  style={{
                    background: packVisual.gradient,
                    boxShadow: `0 0 60px ${packVisual.glow || 'rgba(255,255,255,0.25)'}`
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl border border-white/40" />
                  <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
                  <div className="absolute inset-4 rounded-xl border border-white/30 flex flex-col items-center justify-center text-center px-4">
                    <span className="text-5xl md:text-6xl drop-shadow-xl">{pack.icon || '🃏'}</span>
                    <span className="font-semibold text-white/90 mt-3">{pack.name}</span>
                    <span className="text-xs uppercase tracking-widest text-white/60 mt-2">
                      {pack.minCards}-{pack.maxCards} Cards
                    </span>
                  </div>
                  <div className={`absolute inset-0 rounded-2xl ${stage === 'charging' ? 'animate-[pulse_1.2s_infinite]' : ''}`} />
                </div>

                {stage !== 'reveal' && (
                  <p className="mt-3 text-sm text-white/80 tracking-wide">
                    {stage === 'charging' ? 'Charging the pack with stardust...' : 'Unleashing the cards...'}
                  </p>
                )}
              </div>
            </div>

            <div className={`mt-10 transition-all duration-700 ${stage === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
              <div className="relative flex items-center justify-center gap-4 md:gap-8">
                {cards.map((card, index) => {
                  const style = rarityClassName(card.rarity);
                  const position = positions[index] || { rotate: 0, translateX: 0 };
                  const rarityConfig = CARD_RARITY_STYLES[card.rarity] || CARD_RARITY_STYLES.common;

                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className="relative w-36 h-52 md:w-40 md:h-60 rounded-2xl overflow-hidden transform transition-all duration-700"
                      style={{
                        transform: `translateX(${position.translateX}%) rotate(${position.rotate}deg)`,
                        ...style
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${card.image})`,
                          filter: 'drop-shadow(0 10px 25px rgba(15, 23, 42, 0.45))'
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/75 backdrop-blur-sm px-3 py-2">
                        <p className="text-sm font-semibold text-white truncate" title={card.name}>
                          {card.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: rarityConfig.color }}>
                          {rarityConfig.label} • {CARD_TYPE_LABELS[card.type] || 'Card'}
                        </p>
                      </div>
                      {card.rarity === 'legendary' && (
                        <div className="absolute inset-0 pointer-events-none">
                          {[...Array(18)].map((_, particleIndex) => (
                            <div
                              key={particleIndex}
                              className="absolute rounded-full animate-[spin_4s_linear_infinite]"
                              style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: '6px',
                                height: '6px',
                                background: rarityConfig.particle,
                                animationDelay: `${Math.random() * 2}s`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Pack Highlights</p>
                <p className="text-sm md:text-base text-white/90 font-semibold">
                  {summary || 'Cards added to your collection!'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                  {cards.map(card => (
                    <span
                      key={card.id}
                      className="px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
                    >
                      {CARD_RARITY_STYLES[card.rarity]?.label || card.rarity} {CARD_TYPE_LABELS[card.type] || ''}: {card.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <button
                type="button"
                onClick={canClose ? onClose : undefined}
                disabled={!canClose}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  canClose
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-xl hover:shadow-purple-500/40'
                    : 'bg-white/10 text-white/60 cursor-not-allowed'
                }`}
              >
                {canClose ? 'Close' : 'Opening...'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg) translate(0, 0);
          }
          100% {
            transform: rotate(360deg) translate(0, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default CardPackOpeningModal;
