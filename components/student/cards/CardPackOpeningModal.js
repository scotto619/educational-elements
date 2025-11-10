import React, { useMemo } from 'react';
import { CARD_RARITY_STYLES, CARD_TYPE_LABELS } from '../../../utils/tradingCards';

const rarityStyles = rarity => {
  const config = CARD_RARITY_STYLES[rarity] || CARD_RARITY_STYLES.common;
  return {
    borderColor: config.border,
    boxShadow: `0 0 28px ${config.glow}`,
    background: config.gradient,
    color: config.color
  };
};

const computePositions = cards => {
  const defaultLayouts = {
    1: [{ rotate: 0, x: 0 }],
    2: [
      { rotate: -8, x: -18 },
      { rotate: 8, x: 18 }
    ],
    3: [
      { rotate: -12, x: -26 },
      { rotate: 0, x: 0 },
      { rotate: 12, x: 26 }
    ]
  };

  if (defaultLayouts[cards.length]) {
    return defaultLayouts[cards.length];
  }

  const middle = (cards.length - 1) / 2;
  return cards.map((_, index) => ({
    rotate: (index - middle) * 6,
    x: (index - middle) * 16
  }));
};

const CardPackOpeningModal = ({ visible, stage, pack, cards = [], results = [], onClose }) => {
  const positions = useMemo(() => computePositions(cards), [cards]);
  const raritySummary = useMemo(() => {
    if (!results.length) return '';

    const totals = results.reduce((acc, card) => {
      const key = card.rarity || 'common';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(totals)
      .map(([key, count]) => `${count} ${CARD_RARITY_STYLES[key]?.label || key}`)
      .join(' • ');
  }, [results]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        top: `${(index * 37) % 100}%`,
        left: `${(index * 51) % 100}%`,
        size: `${4 + (index % 6)}px`,
        delay: `${(index % 8) * 0.35}s`
      })),
    []
  );

  if (!visible || !pack) {
    return null;
  }

  const packVisual = pack.visual || {};
  const canClose = stage === 'reveal';

  return (
    <div className="fixed inset-0 z-[65] bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/85 shadow-[0_25px_80px_rgba(15,23,42,0.6)]">
            <div className="absolute inset-0 pointer-events-none opacity-50">
              {sparkles.map(sparkle => (
                <span
                  key={sparkle.id}
                  className="absolute block rounded-full bg-white/25 animate-ping"
                  style={{
                    top: sparkle.top,
                    left: sparkle.left,
                    width: sparkle.size,
                    height: sparkle.size,
                    animationDelay: sparkle.delay
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 p-6 md:p-10 text-white">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.35em] text-white/60">Card Pack Opening</p>
                  <h2 className="mt-2 text-2xl md:text-3xl font-semibold drop-shadow-lg">
                    {pack.icon} {pack.name}
                  </h2>
                  <p className="mt-3 text-sm md:text-base text-white/75 leading-relaxed max-w-xl">
                    {pack.description || 'Bursting with magical collectibles for your adventure.'}
                  </p>
                  <p className="mt-4 text-[11px] uppercase tracking-widest text-white/50">
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
                    <div className="absolute inset-0 rounded-2xl bg-white/10 mix-blend-overlay" />
                    <div className="absolute inset-4 rounded-xl border border-white/30 flex flex-col items-center justify-center text-center px-4">
                      <span className="text-5xl md:text-6xl drop-shadow-xl">{pack.icon || '🃏'}</span>
                      <span className="mt-3 font-semibold text-white/90">{pack.name}</span>
                      <span className="mt-2 text-[11px] uppercase tracking-widest text-white/60">
                        {pack.minCards}-{pack.maxCards} Cards
                      </span>
                    </div>
                    <div className={`absolute inset-0 rounded-2xl ${stage === 'charging' ? 'animate-[pulse_1.3s_ease-in-out_infinite]' : ''}`} />
                  </div>

                  {stage !== 'reveal' && (
                    <p className="mt-3 text-sm text-white/80 tracking-wide text-center">
                      {stage === 'charging' ? 'Charging the pack with stardust…' : 'Unleashing the cards…'}
                    </p>
                  )}
                </div>
              </div>

              <div className={`mt-10 transition-all duration-700 ${stage === 'reveal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
                <div className="relative flex items-center justify-center gap-4 md:gap-8">
                  {cards.map((card, index) => {
                    const transform = positions[index] || { rotate: 0, x: 0 };
                    const rarityConfig = CARD_RARITY_STYLES[card.rarity] || CARD_RARITY_STYLES.common;

                    return (
                      <div
                        key={`${card.id}-${index}`}
                        className="relative w-36 h-52 md:w-40 md:h-60 rounded-2xl overflow-hidden transition-all duration-700"
                        style={{
                          transform: `translateX(${transform.x}%) rotate(${transform.rotate}deg)`,
                          ...rarityStyles(card.rarity)
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
                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/75 backdrop-blur-sm px-3 py-2">
                          <p className="text-sm font-semibold text-white truncate" title={card.name}>
                            {card.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest" style={{ color: rarityConfig.color }}>
                            {rarityConfig.label} • {CARD_TYPE_LABELS[card.type] || 'Card'}
                          </p>
                        </div>
                        {card.rarity === 'legendary' && (
                          <div className="absolute inset-0 pointer-events-none">
                            {Array.from({ length: 18 }).map((_, particleIndex) => (
                              <span
                                key={particleIndex}
                                className="absolute rounded-full animate-[spin_4s_linear_infinite]"
                                style={{
                                  top: `${(particleIndex * 23) % 100}%`,
                                  left: `${(particleIndex * 41) % 100}%`,
                                  width: '6px',
                                  height: '6px',
                                  background: rarityConfig.particle,
                                  animationDelay: `${(particleIndex % 7) * 0.3}s`
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 md:p-5">
                  <p className="text-xs uppercase tracking-widest text-white/60 mb-2">Pack Highlights</p>
                  <p className="text-sm md:text-base text-white/90 font-semibold">
                    {raritySummary || 'Cards added to your collection!'}
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
      </div>
    </div>
  );
};

export default CardPackOpeningModal;
