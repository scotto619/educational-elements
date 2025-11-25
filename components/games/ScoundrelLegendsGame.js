import React, { useMemo, useState } from 'react';

const gradientByRarity = {
  common: 'from-slate-600 via-slate-700 to-slate-800',
  rare: 'from-emerald-500 via-teal-500 to-cyan-500',
  epic: 'from-purple-500 via-fuchsia-500 to-pink-500',
  legendary: 'from-amber-500 via-orange-500 to-rose-500'
};

const shuffle = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const createDeck = () => {
  const monsters = [
    { type: 'monster', name: 'Ember Imp', attack: 3, health: 5, reward: 2, flair: 'Quick strikes' },
    { type: 'monster', name: 'Crystal Basilisk', attack: 4, health: 8, reward: 3, flair: 'Scales shimmer with armor' },
    { type: 'monster', name: 'Moonlit Wraith', attack: 5, health: 10, reward: 4, flair: 'Drains warmth' },
    { type: 'monster', name: 'Ironclad Golem', attack: 6, health: 12, reward: 5, flair: 'Massive guardian' },
    { type: 'monster', name: 'Storm Harpy', attack: 4, health: 7, reward: 3, flair: 'Tornados of feathers' },
    { type: 'monster', name: 'Venom Drake', attack: 5, health: 9, reward: 4, flair: 'Toxic breath' },
    { type: 'monster', name: 'Shadow Titan', attack: 7, health: 16, reward: 7, flair: 'Eclipses the corridor' }
  ];

  const weapons = [
    { type: 'weapon', name: 'Sunforged Blade', attack: 4, durability: 3, rarity: 'rare', perk: '+1 combo damage' },
    { type: 'weapon', name: 'Frostbound Chakram', attack: 3, durability: 4, rarity: 'rare', perk: 'Skips monster retaliation once' },
    { type: 'weapon', name: 'Glimmer Pike', attack: 2, durability: 6, rarity: 'common', perk: 'Stable and precise' },
    { type: 'weapon', name: 'Arcstrike Cannon', attack: 6, durability: 2, rarity: 'epic', perk: 'Massive burst damage' },
    { type: 'weapon', name: 'Wildheart Claws', attack: 3, durability: 5, rarity: 'epic', perk: 'Heals 1 on takedown' }
  ];

  const potions = [
    { type: 'potion', name: 'Spark Tonic', heal: 5, shield: 0, rarity: 'common', flair: 'Bottled optimism' },
    { type: 'potion', name: 'Aurora Draught', heal: 8, shield: 1, rarity: 'rare', flair: 'Rainbow aftertaste' },
    { type: 'potion', name: 'Meteor Salts', heal: 4, shield: 2, rarity: 'rare', flair: 'Ignites bravery' },
    { type: 'potion', name: 'Phoenix Elixir', heal: 12, shield: 3, rarity: 'epic', flair: 'Turns defeat into fire' }
  ];

  const deck = [
    ...monsters,
    ...monsters,
    ...weapons,
    ...potions,
    { type: 'event', name: 'Treasure Cache', reward: 6, rarity: 'rare', flair: 'Glittering hoard' },
    { type: 'event', name: 'Ancient Shrine', reward: 4, rarity: 'epic', flair: 'Grants pure focus' },
    { type: 'event', name: 'Rogue Merchant', reward: 0, rarity: 'legendary', flair: 'Offers a free upgrade' }
  ];

  return shuffle(deck).map((card, index) => ({ ...card, id: `${card.name}-${index}` }));
};

const ScoundrelLegendsGame = () => {
  const baseWeapon = useMemo(
    () => ({
      type: 'weapon',
      name: 'Rusty Dagger',
      attack: 2,
      durability: 5,
      rarity: 'common',
      perk: 'Old reliable'
    }),
    []
  );

  const [deck, setDeck] = useState(createDeck());
  const [activeCard, setActiveCard] = useState(null);
  const [playerHealth, setPlayerHealth] = useState(20);
  const [maxHealth, setMaxHealth] = useState(20);
  const [shield, setShield] = useState(0);
  const [weapon, setWeapon] = useState(baseWeapon);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState([{ type: 'info', text: 'Welcome to the Arcane Dungeon! Draw a card to begin.' }]);
  const [isGameOver, setIsGameOver] = useState(false);

  const resetGame = () => {
    setDeck(createDeck());
    setActiveCard(null);
    setPlayerHealth(20);
    setMaxHealth(20);
    setShield(0);
    setWeapon(baseWeapon);
    setCombo(0);
    setScore(0);
    setLog([{ type: 'info', text: 'A fresh delve begins. Draw a card!' }]);
    setIsGameOver(false);
  };

  const addLog = (type, text) => setLog((prev) => [{ type, text }, ...prev].slice(0, 10));

  const drawCard = () => {
    if (isGameOver) return;
    if (!deck.length) {
      addLog('info', 'You cleared the dungeon!');
      setIsGameOver(true);
      return;
    }

    const [top, ...rest] = deck;
    setDeck(rest);
    setCombo((c) => Math.max(0, c - 1));

    if (top.type === 'monster') {
      setActiveCard({ ...top, currentHealth: top.health });
      addLog('alert', `A ${top.name} appears!`);
    } else {
      setActiveCard(top);
      addLog('info', `${top.name} found.`);
    }
  };

  const resolveMonsterAttack = () => {
    if (!activeCard || activeCard.type !== 'monster' || isGameOver) return;

    const playerDamage = weapon.attack + Math.floor(combo / 2);
    const remainingHealth = activeCard.currentHealth - playerDamage;
    const weaponDurabilityLoss = 1;

    addLog('action', `You strike ${activeCard.name} for ${playerDamage} damage!`);

    if (weaponDurabilityLoss >= weapon.durability) {
      addLog('alert', `${weapon.name} breaks!`);
      setWeapon(baseWeapon);
    } else {
      setWeapon((w) => ({ ...w, durability: w.durability - weaponDurabilityLoss }));
    }

    if (remainingHealth > 0) {
      const incoming = Math.max(0, activeCard.attack - shield);
      const newHealth = Math.max(0, playerHealth - incoming);
      setActiveCard((card) => ({ ...card, currentHealth: remainingHealth }));
      setPlayerHealth(newHealth);
      setShield((s) => Math.max(0, s - activeCard.attack));
      setCombo(0);
      addLog('damage', `${activeCard.name} hits back for ${incoming}.`);
      if (newHealth <= 0) {
        setIsGameOver(true);
        addLog('alert', 'You fall in battle...');
      }
      return;
    }

    setActiveCard(null);
    setScore((s) => s + activeCard.reward);
    setCombo((c) => c + 1);

    setPlayerHealth((h) => Math.min(maxHealth, h + (weapon.name === 'Wildheart Claws' ? 1 : 0)));
    addLog('success', `Defeated ${activeCard.name}! +${activeCard.reward} prestige.`);
  };

  const resolveEvade = () => {
    if (!activeCard || activeCard.type !== 'monster' || isGameOver) return;
    const chipDamage = Math.max(1, activeCard.attack - 3 - shield);
    setPlayerHealth((h) => {
      const newHealth = Math.max(0, h - chipDamage);
      if (newHealth <= 0) setIsGameOver(true);
      return newHealth;
    });
    setShield((s) => Math.max(0, s - activeCard.attack));
    setActiveCard(null);
    setCombo(0);
    addLog('damage', `You evade! Suffer ${chipDamage} chip damage.`);
  };

  const equipWeapon = () => {
    if (!activeCard || activeCard.type !== 'weapon') return;
    setWeapon(activeCard);
    setActiveCard(null);
    setCombo((c) => c + 1);
    addLog('success', `Equipped ${activeCard.name}!`);
  };

  const drinkPotion = () => {
    if (!activeCard || activeCard.type !== 'potion') return;
    const healAmount = activeCard.heal;
    const shieldGain = activeCard.shield || 0;
    setPlayerHealth((h) => Math.min(maxHealth + shieldGain, h + healAmount));
    setMaxHealth((m) => m + Math.floor(shieldGain / 2));
    setShield((s) => s + shieldGain);
    setActiveCard(null);
    setCombo((c) => c + 1);
    addLog('success', `Drank ${activeCard.name}. +${healAmount} health, +${shieldGain} ward.`);
  };

  const resolveEvent = () => {
    if (!activeCard || activeCard.type !== 'event') return;
    if (activeCard.name === 'Rogue Merchant') {
      setWeapon((w) => ({ ...w, attack: w.attack + 1, durability: w.durability + 1 }));
      addLog('success', 'Merchant tinkers with your gear!');
    } else if (activeCard.name === 'Ancient Shrine') {
      setCombo((c) => c + 2);
      setShield((s) => s + 2);
      addLog('info', 'The shrine fills you with focus. Combo boosted!');
    } else {
      setScore((s) => s + activeCard.reward);
      addLog('success', `Treasure cache yields ${activeCard.reward} prestige!`);
    }
    setActiveCard(null);
  };

  const cardAccent = (card) => {
    if (!card) return 'from-gray-700 via-gray-800 to-gray-900';
    if (card.type === 'monster') return 'from-rose-500 via-red-500 to-orange-500';
    if (card.type === 'weapon') return gradientByRarity[card.rarity] || gradientByRarity.common;
    if (card.type === 'potion') return 'from-emerald-400 via-teal-400 to-cyan-400';
    return gradientByRarity[card.rarity] || 'from-indigo-500 via-purple-500 to-pink-500';
  };

  const renderCard = (card) => {
    if (!card) return (
      <div className="h-full bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-4 text-white border border-slate-700 shadow-2xl flex items-center justify-center">
        <p className="text-sm text-slate-300 text-center">Draw to reveal your next encounter</p>
      </div>
    );

    return (
      <div className={`h-full bg-gradient-to-br ${cardAccent(card)} rounded-2xl p-4 text-white border border-white/20 shadow-2xl transition-all`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.2em] text-white/70">{card.type}</p>
            <h3 className="text-2xl font-extrabold">{card.name}</h3>
          </div>
          <div className="text-right text-sm text-white/80">
            {card.type === 'monster' && (
              <p>
                ❤️ {card.currentHealth ?? card.health} · ⚔️ {card.attack}
              </p>
            )}
            {card.type === 'weapon' && (
              <p>
                ⚔️ {card.attack} · ⏳ {card.durability}
              </p>
            )}
            {card.type === 'potion' && <p>➕ {card.heal} hp</p>}
            {card.type === 'event' && <p>{card.reward ? `+${card.reward} prestige` : 'special'}</p>}
          </div>
        </div>
        <p className="mt-2 text-white/80 text-sm">{card.flair || card.perk || 'An intriguing find.'}</p>
      </div>
    );
  };

  const healthPercent = Math.max(0, Math.min(100, Math.round((playerHealth / maxHealth) * 100)));

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl shadow-2xl overflow-hidden border border-white/10">
      <div className="p-4 md:p-6 bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-white/80 text-sm uppercase tracking-[0.25em]">Scoundrel-inspired solo crawl</p>
          <h2 className="text-3xl font-black">Arcane Dungeon: Rogue Scoundrel</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-white/80 text-xs">Prestige</p>
            <p className="text-2xl font-black">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-xs">Combo</p>
            <p className="text-2xl font-black">{combo}</p>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur font-semibold"
          >
            Restart
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 grid md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="uppercase text-xs tracking-[0.2em] text-white/60">Vitals</p>
              <span className="text-sm text-white/70">Deck {deck.length} cards</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm text-white/70">
                <span>Health</span>
                <span>
                  {playerHealth}/{maxHealth}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 mt-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${healthPercent}%` }} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-white/80">
              <span>Ward</span>
              <span>{shield}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
            <p className="uppercase text-xs tracking-[0.2em] text-white/60">Current Weapon</p>
            <div className={`mt-2 p-3 rounded-xl bg-gradient-to-br ${gradientByRarity[weapon.rarity] || gradientByRarity.common} border border-white/20 shadow-lg`}>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg">{weapon.name}</h3>
                <span className="text-sm">⚔️ {weapon.attack}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/80 mt-1">
                <span>Durability</span>
                <span>{weapon.durability}</span>
              </div>
              <p className="text-xs text-white/70 mt-2">{weapon.perk}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="uppercase text-xs tracking-[0.2em] text-white/60">Actions</p>
              <span className="text-xs text-white/50">Resolve the current card</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={drawCard}
                disabled={!!activeCard || isGameOver}
                className="col-span-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg"
              >
                {deck.length ? 'Draw Encounter' : 'Deck Cleared'}
              </button>
              <button
                onClick={resolveMonsterAttack}
                disabled={!activeCard || activeCard.type !== 'monster' || isGameOver}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-white font-semibold py-2 rounded-lg"
              >
                Strike
              </button>
              <button
                onClick={resolveEvade}
                disabled={!activeCard || activeCard.type !== 'monster' || isGameOver}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 disabled:opacity-40 text-white font-semibold py-2 rounded-lg"
              >
                Evade
              </button>
              <button
                onClick={equipWeapon}
                disabled={!activeCard || activeCard.type !== 'weapon' || isGameOver}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-40 text-white font-semibold py-2 rounded-lg"
              >
                Equip Weapon
              </button>
              <button
                onClick={drinkPotion}
                disabled={!activeCard || activeCard.type !== 'potion' || isGameOver}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-white font-semibold py-2 rounded-lg"
              >
                Drink Potion
              </button>
              <button
                onClick={resolveEvent}
                disabled={!activeCard || activeCard.type !== 'event' || isGameOver}
                className="col-span-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 disabled:opacity-40 text-white font-semibold py-2 rounded-lg"
              >
                Resolve Event
              </button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-3xl p-4 border border-white/10 shadow-2xl min-h-[420px] flex flex-col">
            <p className="uppercase text-xs tracking-[0.2em] text-white/60">Current Encounter</p>
            <div className="mt-3 flex-1">{renderCard(activeCard)}</div>
            {isGameOver && (
              <div className="mt-3 bg-white/10 rounded-xl p-3 text-center text-sm text-white/80">
                Journey ends. Tap restart to dive again!
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="uppercase text-xs tracking-[0.2em] text-white/60">Upcoming</p>
                <span className="text-xs text-white/60">{deck.length} cards remain</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {deck.slice(0, 6).map((card) => (
                    <div key={card.id} className={`rounded-xl p-2 text-center text-xs text-white/80 bg-gradient-to-br ${cardAccent(card)} border border-white/10 shadow`}>
                    <p className="font-semibold truncate">{card.name}</p>
                    <p className="text-[10px] uppercase tracking-wide">{card.type}</p>
                  </div>
                ))}
                {!deck.length && <p className="col-span-3 text-center text-white/60 text-sm">Deck cleared</p>}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 shadow-xl max-h-[260px] overflow-y-auto">
              <p className="uppercase text-xs tracking-[0.2em] text-white/60">Journey Log</p>
              <div className="mt-3 space-y-2">
                {log.map((entry, index) => (
                  <div key={`${entry.text}-${index}`} className={`text-sm rounded-lg px-3 py-2 bg-white/5 border border-white/10 ${
                    entry.type === 'alert'
                      ? 'text-amber-200'
                      : entry.type === 'success'
                      ? 'text-emerald-200'
                      : entry.type === 'damage'
                      ? 'text-rose-200'
                      : 'text-white'
                  }`}>
                    {entry.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoundrelLegendsGame;
