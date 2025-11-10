import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  CARD_RARITY_ORDER,
  CARD_RARITY_STYLES,
  CARD_TYPE_LABELS,
  getCollectionProgress,
  getRarityBreakdown
} from '../../../utils/tradingCards';

const CardBookModal = ({ visible, onClose, cardCollection, cardLibrary }) => {
  const progress = useMemo(
    () => getCollectionProgress(cardCollection, cardLibrary),
    [cardCollection, cardLibrary]
  );

  const breakdown = useMemo(
    () => getRarityBreakdown(cardCollection, cardLibrary),
    [cardCollection, cardLibrary]
  );

  const groupedByType = useMemo(() => {
    const groups = cardLibrary.reduce((acc, card) => {
      if (!acc[card.type]) {
        acc[card.type] = [];
      }

      acc[card.type].push(card);
      return acc;
    }, {});

    Object.values(groups).forEach(cards => {
      cards.sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [cardLibrary]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        id: index,
        top: `${12 + (index * 23) % 76}%`,
        left: `${(index * 37) % 96}%`,
        size: `${3 + (index % 5)}px`,
        delay: `${(index % 6) * 0.4}s`
      })),
    []
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/85 backdrop-blur-lg overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-6xl rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 shadow-[0_25px_80px_rgba(45,10,95,0.4)]">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            {sparkles.map(sparkle => (
              <span
                key={sparkle.id}
                className="absolute block rounded-full bg-white/15 animate-ping"
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

          <div className="relative z-10 p-6 md:p-10 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">Collector's Archive</p>
                <h2 className="text-3xl md:text-4xl font-semibold mt-2">Card Book</h2>
                <p className="mt-3 text-sm md:text-base text-white/75 max-w-xl leading-relaxed">
                  Explore every avatar, pet, weapon, and artifact. Complete the collection to unlock special surprises!
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="self-start px-4 py-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 transition font-semibold text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-5">
                <p className="text-xs uppercase tracking-widest text-white/60">Completion</p>
                <p className="mt-3 text-3xl font-bold text-white">{progress.completion}%</p>
                <p className="mt-2 text-sm text-white/70">
                  {progress.uniqueOwned} of {progress.totalUnique} unique cards collected
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-300"
                    style={{ width: `${progress.completion}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-5">
                <p className="text-xs uppercase tracking-widest text-white/60">Collection Size</p>
                <p className="mt-3 text-3xl font-bold text-white">{progress.totalOwned}</p>
                <p className="mt-2 text-sm text-white/70">Total cards gathered so far</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-5">
                <p className="text-xs uppercase tracking-widest text-white/60 mb-3">Rarity Progress</p>
                <div className="space-y-2">
                  {CARD_RARITY_ORDER.map(rarityKey => {
                    const rarityStats = breakdown[rarityKey] || { owned: 0, total: 0 };
                    const rarityConfig = CARD_RARITY_STYLES[rarityKey];

                    return (
                      <div key={rarityKey} className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: rarityConfig?.color || '#fff' }}
                        />
                        <div className="flex-1">
                          <p className="text-[11px] uppercase tracking-widest text-white/60">{rarityConfig?.label || rarityKey}</p>
                          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${rarityStats.total ? Math.min(100, Math.round((rarityStats.owned / rarityStats.total) * 100)) : 0}%`,
                                background: rarityConfig?.gradient
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-white/70">
                          {rarityStats.owned}/{rarityStats.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-12">
              {Object.entries(groupedByType).map(([type, cards]) => {
                const ownedCount = cards.filter(card => cardCollection.cards?.[card.id]?.count).length;

                return (
                  <section key={type}>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl md:text-2xl font-semibold">
                        {CARD_TYPE_LABELS[type] || type} Cards
                      </h3>
                      <p className="text-sm text-white/60">
                        {ownedCount} / {cards.length} collected
                      </p>
                    </div>

                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {cards.map(card => {
                        const ownedEntry = cardCollection.cards?.[card.id];
                        const ownedCountForCard = ownedEntry?.count || 0;
                        const rarity = CARD_RARITY_STYLES[card.rarity] || CARD_RARITY_STYLES.common;
                        const isOwned = ownedCountForCard > 0;
                        const hideLegendary = card.rarity === 'legendary' && !isOwned;

                        return (
                          <article
                            key={card.id}
                            className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                              isOwned
                                ? 'border-white/25 bg-white/10 hover:shadow-[0_0_35px_rgba(180,150,255,0.4)]'
                                : 'border-white/5 bg-white/5'
                            }`}
                            style={{ boxShadow: isOwned ? `0 0 25px ${rarity.glow}` : undefined }}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                              {hideLegendary ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur">
                                  <span className="text-4xl font-bold text-white/60">???</span>
                                  <span className="mt-2 text-xs uppercase tracking-widest text-white/50">Legendary Mystery</span>
                                </div>
                              ) : (
                                <>
                                  <Image
                                    src={card.image || '/Logo/icon.png'}
                                    alt={card.name}
                                    fill
                                    sizes="200px"
                                    className={`object-cover transition-all duration-300 ${isOwned ? '' : 'grayscale opacity-40'}`}
                                  />
                                  {card.rarity === 'legendary' && (
                                    <div className="absolute inset-0 pointer-events-none">
                                      {Array.from({ length: 14 }).map((_, particleIndex) => (
                                        <span
                                          key={particleIndex}
                                          className="absolute rounded-full animate-[spin_5s_linear_infinite]"
                                          style={{
                                            top: `${(particleIndex * 29) % 100}%`,
                                            left: `${(particleIndex * 47) % 100}%`,
                                            width: '5px',
                                            height: '5px',
                                            background: rarity.particle,
                                            animationDelay: `${(particleIndex % 6) * 0.35}s`
                                          }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="p-4">
                              <p className="font-semibold text-white truncate" title={hideLegendary ? 'Legendary Mystery' : card.name}>
                                {hideLegendary ? 'Legendary Mystery' : card.name}
                              </p>
                              <p className="text-xs uppercase tracking-widest" style={{ color: rarity.color }}>
                                {hideLegendary ? '???' : `${rarity.label} • ${CARD_TYPE_LABELS[card.type] || 'Card'}`}
                              </p>
                              <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                                <span>{isOwned ? `Owned x${ownedCountForCard}` : hideLegendary ? 'Hidden' : 'Missing'}</span>
                                {ownedEntry?.firstObtainedAt && !hideLegendary && (
                                  <span className="text-white/50">
                                    {new Date(ownedEntry.firstObtainedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardBookModal;
