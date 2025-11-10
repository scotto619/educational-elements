import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  CARD_RARITY_STYLES,
  CARD_RARITY_ORDER,
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
    const groups = {};
    cardLibrary.forEach(card => {
      if (!groups[card.type]) groups[card.type] = [];
      groups[card.type].push(card);
    });

    Object.values(groups).forEach(group => {
      group.sort((a, b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [cardLibrary]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {[...Array(48)].map((_, index) => (
            <div
              key={index}
              className="absolute bg-white/10 rounded-full animate-ping"
              style={{
                width: `${Math.random() * 5 + 3}px`,
                height: `${Math.random() * 5 + 3}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-6 md:p-10 text-white overflow-y-auto h-full">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/60 mb-2">Collector's Archive</p>
              <h2 className="text-3xl md:text-4xl font-bold drop-shadow-xl">Card Book</h2>
              <p className="text-white/80 max-w-xl mt-2 text-sm md:text-base">
                Track every avatar, pet, weapon, and artifact you've discovered. Complete the book to become a legendary collector!
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="self-start px-4 py-2 rounded-xl bg-white/10 border border-white/30 hover:bg-white/20 transition text-sm font-semibold"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-white/60">Completion</p>
              <p className="text-3xl font-bold text-white mt-2">{progress.completion}%</p>
              <p className="text-sm text-white/70 mt-1">
                {progress.uniqueOwned} of {progress.totalUnique} unique cards collected
              </p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-300"
                  style={{ width: `${progress.completion}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-white/60">Collection Size</p>
              <p className="text-3xl font-bold text-white mt-2">{progress.totalOwned}</p>
              <p className="text-sm text-white/70 mt-1">Total cards gathered</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-widest text-white/60 mb-3">Rarity Progress</p>
              <div className="space-y-2">
                {CARD_RARITY_ORDER.map(rarity => {
                  const stats = breakdown[rarity] || { total: 0, owned: 0 };
                  const config = CARD_RARITY_STYLES[rarity];
                  return (
                    <div key={rarity} className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: config?.color || '#fff' }}
                      />
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-widest text-white/60">{config?.label || rarity}</p>
                        <div className="mt-1 h-1.5 bg-white/10 rounded-full">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stats.total ? Math.min(100, Math.round((stats.owned / stats.total) * 100)) : 0}%`,
                              background: config?.gradient
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-white/70">
                        {stats.owned}/{stats.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-12">
            {Object.entries(groupedByType).map(([type, cards]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    {CARD_TYPE_LABELS[type] || type} Cards
                  </h3>
                  <p className="text-sm text-white/60">
                    {cards.filter(card => cardCollection.cards?.[card.id]?.count).length} / {cards.length} collected
                  </p>
                </div>
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cards.map(card => {
                    const ownedEntry = cardCollection.cards?.[card.id];
                    const owned = ownedEntry?.count || 0;
                    const rarity = CARD_RARITY_STYLES[card.rarity] || CARD_RARITY_STYLES.common;
                    const isOwned = owned > 0;

                    return (
                      <div
                        key={card.id}
                        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                          isOwned ? 'border-white/30 bg-white/10 hover:shadow-2xl hover:shadow-purple-500/30' : 'border-white/5 bg-white/5'
                        }`}
                        style={{ boxShadow: isOwned ? `0 0 25px ${rarity.glow}` : 'none' }}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                          <Image
                            src={card.image || '/Logo/icon.png'}
                            alt={card.name}
                            fill
                            sizes="200px"
                            className={`object-cover transition-all duration-300 ${isOwned ? '' : 'grayscale opacity-40'}`}
                          />
                          {card.rarity === 'legendary' && (
                            <div className="absolute inset-0 pointer-events-none">
                              {[...Array(14)].map((_, index) => (
                                <div
                                  key={index}
                                  className="absolute rounded-full animate-[spin_5s_linear_infinite]"
                                  style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: '5px',
                                    height: '5px',
                                    background: rarity.particle,
                                    animationDelay: `${Math.random() * 2.5}s`
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-white truncate" title={card.name}>
                            {card.name}
                          </p>
                          <p className="text-xs uppercase tracking-widest" style={{ color: rarity.color }}>
                            {rarity.label} • {CARD_TYPE_LABELS[card.type] || 'Card'}
                          </p>
                          <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                            <span>{isOwned ? `Owned x${owned}` : 'Missing'}</span>
                            {ownedEntry?.firstObtainedAt && (
                              <span className="text-white/50">
                                {new Date(ownedEntry.firstObtainedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default CardBookModal;
