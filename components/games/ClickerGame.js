// components/games/ClickerGame.js - Enhanced Hero Forge Fantasy Clicker
import React, { useState, useEffect, useRef, useCallback } from 'react';

const ClickerGame = ({ studentData, updateStudentData, showToast }) => {
  // Game state
  const [gameState, setGameState] = useState({
    gold: 0,
    totalGold: 0,
    handGold: 0,
    attacks: 0,
    dpcBase: 1,
    dpcMult: 1,
    globalDpsMult: 1,
    buyAmount: 1,
    timePlayed: 0,
    lastSave: Date.now(),
    multipliers: {},
    artifacts: [
      { key: 'orb', name: 'Crystal Orb', baseCost: 15, count: 0, baseDps: 0.1, icon: '1', path: '/public/Loot/Artifacts/1.png' },
      { key: 'tome', name: 'Ancient Tome', baseCost: 100, count: 0, baseDps: 1, icon: '2', path: '/public/Loot/Artifacts/2.png' },
      { key: 'lute', name: 'Mystic Lute', baseCost: 1100, count: 0, baseDps: 8, icon: '3', path: '/public/Loot/Artifacts/3.png' },
      { key: 'shield', name: 'Guardian Shield', baseCost: 12000, count: 0, baseDps: 47, icon: '4', path: '/public/Loot/Artifacts/4.png' },
      { key: 'chalice', name: 'Divine Chalice', baseCost: 130000, count: 0, baseDps: 260, icon: '5', path: '/public/Loot/Artifacts/5.png' },
      { key: 'crown', name: 'Crown of Ages', baseCost: 1400000, count: 0, baseDps: 1400, icon: '6', path: '/public/Loot/Artifacts/6.png' },
      { key: 'mask', name: 'Shadow Mask', baseCost: 20000000, count: 0, baseDps: 7800, icon: '7', path: '/public/Loot/Artifacts/7.png' },
      { key: 'totem', name: 'Primal Totem', baseCost: 330000000, count: 0, baseDps: 44000, icon: '8', path: '/public/Loot/Artifacts/8.png' },
      { key: 'phoenix', name: 'Phoenix Feather', baseCost: 5100000000, count: 0, baseDps: 260000, icon: '9', path: '/public/Loot/Artifacts/9.png' },
      { key: 'cauldron', name: 'Void Cauldron', baseCost: 75000000000, count: 0, baseDps: 1600000, icon: '10', path: '/public/Loot/Artifacts/10.png' }
    ],
    upgrades: [
      { id: 'orb-1', name: 'Enhance Crystal Orb', desc: 'Crystal Orbs are twice as efficient', cost: 100, req: { key: 'orb', count: 10 }, purchased: false },
      { id: 'tome-1', name: 'Forbidden Knowledge', desc: 'Ancient Tomes are twice as efficient', cost: 1000, req: { key: 'tome', count: 10 }, purchased: false },
      { id: 'lute-1', name: 'Harmonic Resonance', desc: 'Mystic Lutes are twice as efficient', cost: 11000, req: { key: 'lute', count: 10 }, purchased: false },
      { id: 'shield-1', name: 'Eternal Protection', desc: 'Guardian Shields are twice as efficient', cost: 120000, req: { key: 'shield', count: 10 }, purchased: false },
      { id: 'chalice-1', name: 'Divine Blessing', desc: 'Divine Chalices are twice as efficient', cost: 1300000, req: { key: 'chalice', count: 10 }, purchased: false },
      { id: 'attack-1', name: 'Weapon Mastery', desc: 'Attacks earn twice the gold', cost: 500, req: { key: null, count: 0 }, purchased: false },
      { id: 'attack-2', name: 'Legendary Technique', desc: 'Attacks earn 5x gold', cost: 50000000, req: { key: null, count: 0 }, purchased: false },
      { id: 'prestige-1', name: 'Ascended Power', desc: 'All artifacts are 50% more efficient', cost: 1000000000000, req: { key: null, count: 0 }, purchased: false },
    ],
    boons: [],
    event: { nextIn: 60 + Math.random() * 120, shown: false, until: 0, choices: [], eventText: '' },
    
    // Enhanced unlockables system
    unlockedWeapons: ['1'],
    activeWeapon: '1',
    unlockedThemes: ['default'],
    activeTheme: 'default',
    unlockedTitles: ['Novice'],
    activeTitle: 'Novice',
    achievements: [],
    prestige: 0,
    prestigePoints: 0,
    lifetimeEarnings: 0
  });

  const [selectedWeapon, setSelectedWeapon] = useState('1');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showChoiceEvent, setShowChoiceEvent] = useState(false);

  const gameLoopRef = useRef();
  const lastUpdateRef = useRef(performance.now());
  const eventAccumRef = useRef(0);
  const autosaveAccumRef = useRef(0);

  // Weapon definitions with unlock requirements
  const WEAPONS = {
    '1': { name: 'Novice Blade', icon: '⚔️', path: '/public/Loot/Weapons/1.png', requirement: null },
    '2': { name: 'Mystic Staff', icon: '🔮', path: '/public/Loot/Weapons/2.png', requirement: { type: 'totalGold', value: 1000 } },
    '3': { name: 'Frost Axe', icon: '🪓', path: '/public/Loot/Weapons/3.png', requirement: { type: 'totalGold', value: 5000 } },
    '4': { name: 'Shadow Daggers', icon: '🗡️', path: '/public/Loot/Weapons/4.png', requirement: { type: 'totalGold', value: 25000 } },
    '5': { name: 'Elven Bow', icon: '🏹', path: '/public/Loot/Weapons/5.png', requirement: { type: 'attacks', value: 1000 } },
    '6': { name: 'Orcish Cleaver', icon: '⚔️', path: '/public/Loot/Weapons/6.png', requirement: { type: 'artifacts', value: 50 } },
    '7': { name: 'Divine Hammer', icon: '🔨', path: '/public/Loot/Weapons/7.png', requirement: { type: 'totalGold', value: 100000 } },
    '8': { name: 'Nature\'s Whip', icon: '🌿', path: '/public/Loot/Weapons/8.png', requirement: { type: 'upgrades', value: 3 } },
    '9': { name: 'Celestial Orb', icon: '✨', path: '/public/Loot/Weapons/9.png', requirement: { type: 'totalGold', value: 1000000 } },
    '10': { name: 'Frost Axe Prime', icon: '❄️', path: '/public/Loot/Weapons/10.png', requirement: { type: 'dps', value: 100000 } },
    '11': { name: 'Mechanical Gauntlet', icon: '🤖', path: '/public/Loot/Weapons/11.png', requirement: { type: 'totalGold', value: 10000000 } },
    '12': { name: 'Rose Blade', icon: '🌹', path: '/public/Loot/Weapons/12.png', requirement: { type: 'prestige', value: 1 } },
    '13': { name: 'Golden Warhammer', icon: '⚒️', path: '/public/Loot/Weapons/13.png', requirement: { type: 'totalGold', value: 100000000 } },
    '14': { name: 'Void Staff', icon: '🌌', path: '/public/Loot/Weapons/14.png', requirement: { type: 'prestige', value: 2 } },
    '15': { name: 'Elemental Trident', icon: '🔱', path: '/public/Loot/Weapons/15.png', requirement: { type: 'totalGold', value: 1000000000 } },
    '16': { name: 'Soul Reaper', icon: '💀', path: '/public/Loot/Weapons/16.png', requirement: { type: 'prestige', value: 5 } },
    '17': { name: 'Cosmic Blades', icon: '🌟', path: '/public/Loot/Weapons/17.png', requirement: { type: 'prestige', value: 10 } }
  };

  // Theme definitions (enhanced)
  const THEMES = {
    default: { 
      name: 'Hero\'s Dawn', 
      bg: 'from-blue-50 to-purple-100',
      panel: 'bg-white',
      accent: 'from-blue-500 to-purple-600',
      requirement: null 
    },
    dark: { 
      name: 'Shadow Realm', 
      bg: 'from-gray-900 to-black',
      panel: 'bg-gray-800 text-white',
      accent: 'from-purple-600 to-pink-600',
      requirement: { type: 'totalGold', value: 10000 } 
    },
    forest: { 
      name: 'Elven Grove', 
      bg: 'from-green-100 to-emerald-200',
      panel: 'bg-green-50',
      accent: 'from-green-500 to-emerald-600',
      requirement: { type: 'attacks', value: 500 } 
    },
    fire: { 
      name: 'Dragon\'s Lair', 
      bg: 'from-red-100 to-orange-200',
      panel: 'bg-red-50',
      accent: 'from-red-500 to-orange-600',
      requirement: { type: 'artifacts', value: 25 } 
    },
    ice: { 
      name: 'Frozen Peaks', 
      bg: 'from-cyan-100 to-blue-200',
      panel: 'bg-cyan-50',
      accent: 'from-cyan-500 to-blue-600',
      requirement: { type: 'dps', value: 50 } 
    },
    cosmic: {
      name: 'Void Dimension',
      bg: 'from-purple-900 to-indigo-900',
      panel: 'bg-purple-800 text-white',
      accent: 'from-pink-500 to-purple-600',
      requirement: { type: 'prestige', value: 1 }
    }
  };

  // Enhanced title definitions
  const TITLES = {
    'Novice': { requirement: null, color: 'text-gray-600', glow: '' },
    'Apprentice': { requirement: { type: 'totalGold', value: 500 }, color: 'text-green-600', glow: 'shadow-green-500/50' },
    'Warrior': { requirement: { type: 'attacks', value: 100 }, color: 'text-blue-600', glow: 'shadow-blue-500/50' },
    'Hero': { requirement: { type: 'totalGold', value: 5000 }, color: 'text-purple-600', glow: 'shadow-purple-500/50' },
    'Champion': { requirement: { type: 'artifacts', value: 10 }, color: 'text-orange-600', glow: 'shadow-orange-500/50' },
    'Legend': { requirement: { type: 'totalGold', value: 50000 }, color: 'text-yellow-600', glow: 'shadow-yellow-500/50' },
    'Mythic': { requirement: { type: 'prestige', value: 1 }, color: 'text-pink-600', glow: 'shadow-pink-500/50' },
    'Ascended': { requirement: { type: 'prestige', value: 3 }, color: 'text-cyan-400', glow: 'shadow-cyan-400/50' },
    'Divine': { requirement: { type: 'prestige', value: 5 }, color: 'text-yellow-400', glow: 'shadow-yellow-400/50' },
    'Eternal': { requirement: { type: 'prestige', value: 10 }, color: 'text-purple-400', glow: 'shadow-purple-400/50' }
  };

  // Choice events system
  const CHOICE_EVENTS = [
    {
      text: "You discover a mysterious merchant offering a deal...",
      choices: [
        { text: "Trade gold for power", effect: { type: 'tradeGoldForDPC', goldCost: 0.1, dpcMult: 1.5 } },
        { text: "Ignore the merchant", effect: { type: 'smallGoldGain', amount: 0.05 } }
      ]
    },
    {
      text: "A magical fountain appears before you...",
      choices: [
        { text: "Drink from it", effect: { type: 'randomBoon', duration: 30000 } },
        { text: "Fill your pouch with water", effect: { type: 'goldGain', amount: 0.1 } }
      ]
    },
    {
      text: "You find an ancient training ground...",
      choices: [
        { text: "Train intensively", effect: { type: 'permanentDPCBoost', mult: 1.1 } },
        { text: "Rest and meditate", effect: { type: 'temporaryDPSBoost', mult: 3, duration: 60000 } }
      ]
    },
    {
      text: "A cursed artifact calls to you...",
      choices: [
        { text: "Touch the artifact", effect: { type: 'cursedPower', dpcMult: 2, dpsPenalty: 0.5, duration: 120000 } },
        { text: "Leave it alone", effect: { type: 'goldGain', amount: 0.05 } }
      ]
    },
    {
      text: "You encounter a wise sage offering knowledge...",
      choices: [
        { text: "Accept the wisdom", effect: { type: 'upgradeDiscount', discount: 0.3, duration: 300000 } },
        { text: "Politely decline", effect: { type: 'goldGain', amount: 0.2 } }
      ]
    }
  ];

  // Prestige borders
  const getPrestigeBorder = (prestigeLevel) => {
    const borders = [
      '', // No prestige
      'ring-4 ring-yellow-400 ring-opacity-60', // Prestige 1
      'ring-4 ring-orange-400 ring-opacity-60', // Prestige 2
      'ring-4 ring-red-400 ring-opacity-60', // Prestige 3
      'ring-4 ring-purple-400 ring-opacity-60', // Prestige 4
      'ring-4 ring-pink-400 ring-opacity-60', // Prestige 5
      'ring-8 ring-gradient-to-r ring-cyan-400 ring-opacity-80', // Prestige 6+
      'ring-8 ring-rainbow ring-opacity-100 animate-pulse', // Prestige 10+
    ];
    
    if (prestigeLevel >= 10) return borders[7];
    if (prestigeLevel >= 6) return borders[6];
    return borders[Math.min(prestigeLevel, borders.length - 1)] || '';
  };

  // Helper functions
  const fmt = useCallback((n) => {
    if (!isFinite(n)) return '0';
    const abs = Math.abs(n);
    if (abs < 1000) return Math.round(n).toLocaleString();
    const units = ['k', 'M', 'B', 'T', 'q', 'Q', 's', 'S', 'o', 'n'];
    let u = -1;
    let val = abs;
    while (val >= 1000 && u < units.length - 1) {
      val /= 1000;
      u++;
    }
    const out = (Math.sign(n) * val).toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2);
    return out + units[u];
  }, []);

  const costFor = useCallback((artifact) => {
    return Math.floor(artifact.baseCost * Math.pow(1.15, artifact.count));
  }, []);

  const artifactMult = useCallback((key) => {
    return gameState.multipliers[key] || 1;
  }, [gameState.multipliers]);

  const dpc = useCallback(() => {
    let mult = gameState.dpcMult * activeBoonMult('dpc');
    return Math.max(1, gameState.dpcBase * mult);
  }, [gameState.dpcBase, gameState.dpcMult]);

  const dps = useCallback(() => {
    let total = 0;
    for (const a of gameState.artifacts) {
      total += a.count * a.baseDps * artifactMult(a.key);
    }
    total *= gameState.globalDpsMult * activeBoonMult('dps');
    return total;
  }, [gameState.artifacts, gameState.globalDpsMult, artifactMult]);

  const activeBoonMult = useCallback((type) => {
    let m = 1;
    const now = performance.now();
    for (const boon of gameState.boons) {
      if (boon.type === type && now < boon.until) m *= boon.mult;
    }
    return m;
  }, [gameState.boons]);

  const totalArtifacts = useCallback(() => {
    return gameState.artifacts.reduce((sum, a) => sum + a.count, 0);
  }, [gameState.artifacts]);

  const purchasedUpgrades = useCallback(() => {
    return gameState.upgrades.filter(u => u.purchased).length;
  }, [gameState.upgrades]);

  // Prestige calculation
  const canPrestige = useCallback(() => {
    return gameState.totalGold >= 1000000000; // 1B gold required
  }, [gameState.totalGold]);

  const calculatePrestigeGain = useCallback(() => {
    if (!canPrestige()) return 0;
    return Math.floor(Math.sqrt(gameState.totalGold / 1000000000));
  }, [gameState.totalGold, canPrestige]);

  const doPrestige = useCallback(() => {
    if (!canPrestige()) return;
    
    const prestigeGain = calculatePrestigeGain();
    
    setGameState(prev => ({
      ...prev,
      gold: 0,
      totalGold: 0,
      handGold: 0,
      attacks: 0,
      dpcBase: 1,
      dpcMult: 1,
      globalDpsMult: 1,
      multipliers: {},
      artifacts: prev.artifacts.map(a => ({ ...a, count: 0 })),
      upgrades: prev.upgrades.map(u => ({ ...u, purchased: false })),
      boons: [],
      prestige: prev.prestige + 1,
      prestigePoints: prev.prestigePoints + prestigeGain,
      lifetimeEarnings: prev.lifetimeEarnings + prev.totalGold
    }));
    
    addToast(`Prestige ${gameState.prestige + 1} achieved! +${prestigeGain} prestige points!`, 'success');
  }, [canPrestige, calculatePrestigeGain, gameState.prestige, addToast]);

  // Check unlock requirements
  const checkUnlockRequirement = useCallback((requirement) => {
    if (!requirement) return true;
    
    switch (requirement.type) {
      case 'totalGold':
        return gameState.totalGold >= requirement.value;
      case 'attacks':
        return gameState.attacks >= requirement.value;
      case 'artifacts':
        return totalArtifacts() >= requirement.value;
      case 'dps':
        return dps() >= requirement.value;
      case 'upgrades':
        return purchasedUpgrades() >= requirement.value;
      case 'prestige':
        return gameState.prestige >= requirement.value;
      default:
        return false;
    }
  }, [gameState, totalArtifacts, dps, purchasedUpgrades]);

  // Check for new unlocks
  const checkUnlocks = useCallback(() => {
    let newUnlocks = [];

    // Check weapons
    Object.entries(WEAPONS).forEach(([key, weapon]) => {
      if (!gameState.unlockedWeapons.includes(key) && checkUnlockRequirement(weapon.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedWeapons: [...prev.unlockedWeapons, key]
        }));
        newUnlocks.push(`New weapon unlocked: ${weapon.name}!`);
      }
    });

    // Check themes
    Object.entries(THEMES).forEach(([key, theme]) => {
      if (!gameState.unlockedThemes.includes(key) && checkUnlockRequirement(theme.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedThemes: [...prev.unlockedThemes, key]
        }));
        newUnlocks.push(`New theme unlocked: ${theme.name}!`);
      }
    });

    // Check titles
    Object.entries(TITLES).forEach(([key, title]) => {
      if (!gameState.unlockedTitles.includes(key) && checkUnlockRequirement(title.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedTitles: [...prev.unlockedTitles, key]
        }));
        newUnlocks.push(`New title unlocked: ${key}!`);
      }
    });

    // Show unlock notifications
    newUnlocks.forEach(message => {
      addToast(message, 'success');
    });
  }, [gameState, checkUnlockRequirement]);

  // Add floating number
  const addFloatingNumber = useCallback((x, y, text, color = '#ffd700') => {
    const id = Date.now() + Math.random();
    setFloatingNumbers(prev => [...prev, { id, x, y, text, color, time: Date.now() }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(f => f.id !== id));
    }, 800);
  }, []);

  // Add toast notification
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
    
    if (showToast) {
      showToast(message, type);
    }
  }, [showToast]);

  // Add gold with effects
  const addGold = useCallback((amount) => {
    setGameState(prev => {
      const newGold = Math.max(0, prev.gold + amount);
      const newTotalGold = amount > 0 ? prev.totalGold + amount : prev.totalGold;
      return {
        ...prev,
        gold: newGold,
        totalGold: newTotalGold
      };
    });
  }, []);

  // Attack function
  const attack = useCallback((event) => {
    const gain = dpc();
    addGold(gain);
    
    setGameState(prev => ({
      ...prev,
      handGold: prev.handGold + gain,
      attacks: prev.attacks + 1
    }));

    // Add floating number at click position
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    addFloatingNumber(x, y, `+${fmt(gain)}`, '#ffd700');

    // Play sound effect (if available)
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}

    // Check for achievements
    if (gameState.attacks === 0) {
      addToast('Achievement: First Strike!', 'success');
    }
  }, [dpc, addGold, addFloatingNumber, fmt, gameState.attacks, addToast]);

  // Buy artifact
  const buyArtifact = useCallback((artifactIndex, amount) => {
    setGameState(prev => {
      const artifact = prev.artifacts[artifactIndex];
      const newArtifacts = [...prev.artifacts];
      let bought = 0;
      let totalCost = 0;

      for (let i = 0; i < amount; i++) {
        const cost = costFor({ ...artifact, count: artifact.count + bought });
        if (prev.gold >= totalCost + cost) {
          totalCost += cost;
          bought++;
        } else {
          break;
        }
      }

      if (bought > 0) {
        newArtifacts[artifactIndex] = {
          ...artifact,
          count: artifact.count + bought
        };

        addToast(`Acquired ${artifact.name} x${bought}`, 'success');

        return {
          ...prev,
          gold: prev.gold - totalCost,
          artifacts: newArtifacts
        };
      }

      return prev;
    });
  }, [costFor, addToast]);

  // Buy upgrade
  const buyUpgrade = useCallback((upgradeIndex) => {
    setGameState(prev => {
      const upgrade = prev.upgrades[upgradeIndex];
      if (prev.gold >= upgrade.cost && !upgrade.purchased) {
        const newUpgrades = [...prev.upgrades];
        newUpgrades[upgradeIndex] = { ...upgrade, purchased: true };

        // Apply upgrade effect
        let newState = {
          ...prev,
          gold: prev.gold - upgrade.cost,
          upgrades: newUpgrades
        };

        // Apply upgrade effects
        if (upgrade.id === 'orb-1') {
          newState.multipliers = { ...newState.multipliers, orb: (newState.multipliers.orb || 1) * 2 };
        } else if (upgrade.id === 'tome-1') {
          newState.multipliers = { ...newState.multipliers, tome: (newState.multipliers.tome || 1) * 2 };
        } else if (upgrade.id === 'lute-1') {
          newState.multipliers = { ...newState.multipliers, lute: (newState.multipliers.lute || 1) * 2 };
        } else if (upgrade.id === 'shield-1') {
          newState.multipliers = { ...newState.multipliers, shield: (newState.multipliers.shield || 1) * 2 };
        } else if (upgrade.id === 'chalice-1') {
          newState.multipliers = { ...newState.multipliers, chalice: (newState.multipliers.chalice || 1) * 2 };
        } else if (upgrade.id === 'attack-1') {
          newState.dpcMult *= 2;
        } else if (upgrade.id === 'attack-2') {
          newState.dpcMult *= 5;
        } else if (upgrade.id === 'prestige-1') {
          newState.globalDpsMult *= 1.5;
        }

        addToast(`Purchased: ${upgrade.name}`, 'success');
        return newState;
      }
      return prev;
    });
  }, [addToast]);

  // Spawn choice event
  const spawnChoiceEvent = useCallback(() => {
    if (gameState.event.shown) return;
    
    const randomEvent = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)];
    setGameState(prev => ({
      ...prev,
      event: {
        ...prev.event,
        shown: true,
        until: performance.now() + 30000,
        eventText: randomEvent.text,
        choices: randomEvent.choices
      }
    }));
    setShowChoiceEvent(true);
  }, [gameState.event.shown]);

  // Handle choice event
  const handleChoiceEvent = useCallback((choiceIndex) => {
    const choice = gameState.event.choices[choiceIndex];
    if (!choice) return;

    const effect = choice.effect;
    
    setGameState(prev => {
      let newState = { ...prev };
      
      switch (effect.type) {
        case 'tradeGoldForDPC':
          const goldCost = prev.gold * effect.goldCost;
          newState.gold = prev.gold - goldCost;
          newState.dpcMult *= effect.dpcMult;
          addToast(`Traded ${fmt(goldCost)} gold for permanent power!`, 'success');
          break;
          
        case 'smallGoldGain':
          const smallGain = prev.totalGold * effect.amount;
          newState.gold += smallGain;
          newState.totalGold += smallGain;
          addToast(`Found ${fmt(smallGain)} gold!`, 'success');
          break;
          
        case 'goldGain':
          const gain = prev.totalGold * effect.amount;
          newState.gold += gain;
          newState.totalGold += gain;
          addToast(`Earned ${fmt(gain)} gold!`, 'success');
          break;
          
        case 'randomBoon':
          const boonTypes = ['dpc', 'dps'];
          const randomType = boonTypes[Math.floor(Math.random() * boonTypes.length)];
          const mult = 2 + Math.random() * 3;
          newState.boons = [...prev.boons, {
            name: `Mystic ${randomType.toUpperCase()} Boost`,
            type: randomType,
            mult: mult,
            until: performance.now() + effect.duration
          }];
          addToast(`Gained ${randomType.toUpperCase()} x${mult.toFixed(1)} boost!`, 'success');
          break;
          
        case 'permanentDPCBoost':
          newState.dpcMult *= effect.mult;
          addToast(`Permanent attack power increased!`, 'success');
          break;
          
        case 'temporaryDPSBoost':
          newState.boons = [...prev.boons, {
            name: 'Meditation Boost',
            type: 'dps',
            mult: effect.mult,
            until: performance.now() + effect.duration
          }];
          addToast(`Temporary DPS x${effect.mult} boost!`, 'success');
          break;
          
        case 'cursedPower':
          newState.boons = [...prev.boons, 
            {
              name: 'Cursed Strength',
              type: 'dpc',
              mult: effect.dpcMult,
              until: performance.now() + effect.duration
            },
            {
              name: 'Artifact Curse',
              type: 'dps',
              mult: effect.dpsPenalty,
              until: performance.now() + effect.duration
            }
          ];
          addToast(`Cursed power gained! +DPC but -DPS for 2 minutes!`, 'warning');
          break;
      }
      
      newState.event = {
        ...newState.event,
        shown: false,
        nextIn: 60 + Math.random() * 120
      };
      
      return newState;
    });
    
    setShowChoiceEvent(false);
  }, [gameState.event.choices, addToast, fmt]);

  // Close choice event without selecting
  const closeChoiceEvent = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      event: {
        ...prev.event,
        shown: false,
        nextIn: 60 + Math.random() * 120
      }
    }));
    setShowChoiceEvent(false);
  }, []);

  // Save game to Firebase
  const saveGameToFirebase = useCallback(async () => {
    if (!studentData || !updateStudentData) return;

    try {
      const saveData = {
        clickerGameData: {
          ...gameState,
          lastSave: Date.now(),
          version: '2.0'
        }
      };

      await updateStudentData(saveData);
      console.log('✅ Clicker game saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving clicker game:', error);
    }
  }, [gameState, studentData, updateStudentData]);

  // Load game from Firebase
  const loadGameFromFirebase = useCallback(() => {
    if (!studentData?.clickerGameData) return;

    try {
      const loadedData = studentData.clickerGameData;
      
      // Handle offline progress
      const now = Date.now();
      const timeDiff = Math.max(0, (now - (loadedData.lastSave || now)) / 1000);
      const offlineProduction = dps() * timeDiff;

      setGameState(prev => ({
        ...loadedData,
        gold: loadedData.gold + offlineProduction,
        totalGold: loadedData.totalGold + offlineProduction,
        boons: [], // Clear temporary effects
        event: { nextIn: 60 + Math.random() * 120, shown: false, until: 0, choices: [], eventText: '' }
      }));

      if (offlineProduction > 0) {
        addToast(`Welcome back! +${fmt(offlineProduction)} offline gold`, 'success');
      }

      // Load unlockables
      setSelectedWeapon(loadedData.activeWeapon || '1');
      setSelectedTheme(loadedData.activeTheme || 'default');

      console.log('✅ Clicker game loaded from Firebase');
    } catch (error) {
      console.error('❌ Error loading clicker game:', error);
    }
  }, [studentData, dps, addToast, fmt]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      saveGameToFirebase();
    }, 15000); // Save every 15 seconds

    return () => clearInterval(interval);
  }, [saveGameToFirebase]);

  // Load on component mount
  useEffect(() => {
    loadGameFromFirebase();
  }, []);

  // Check unlocks when relevant stats change
  useEffect(() => {
    checkUnlocks();
  }, [gameState.totalGold, gameState.attacks, totalArtifacts(), dps(), purchasedUpgrades(), gameState.prestige, checkUnlocks]);

  // Game loop
  useEffect(() => {
    const gameLoop = (timestamp) => {
      const dt = Math.min(0.25, (timestamp - lastUpdateRef.current) / 1000);
      lastUpdateRef.current = timestamp;

      // Update DPS production
      const production = dps() * dt;
      if (production > 0) {
        addGold(production);
      }

      // Update time played
      setGameState(prev => ({
        ...prev,
        timePlayed: prev.timePlayed + dt
      }));

      // Clean up expired boons
      setGameState(prev => ({
        ...prev,
        boons: prev.boons.filter(boon => timestamp < boon.until)
      }));

      // Choice event system (slower than old diamond events)
      if (!gameState.event.shown) {
        eventAccumRef.current += dt;
        if (eventAccumRef.current >= gameState.event.nextIn) {
          eventAccumRef.current = 0;
          spawnChoiceEvent();
        }
      } else if (timestamp >= gameState.event.until) {
        setGameState(prev => ({
          ...prev,
          event: { ...prev.event, shown: false, nextIn: 60 + Math.random() * 120 }
        }));
        setShowChoiceEvent(false);
      }

      // Auto-save accumulator
      autosaveAccumRef.current += dt;
      if (autosaveAccumRef.current >= 15) {
        autosaveAccumRef.current = 0;
        saveGameToFirebase();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [dps, addGold, gameState.event, spawnChoiceEvent, saveGameToFirebase]);

  // Apply selected weapon and theme
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      activeWeapon: selectedWeapon,
      activeTheme: selectedTheme
    }));
  }, [selectedWeapon, selectedTheme]);

  const currentTheme = THEMES[gameState.activeTheme] || THEMES.default;
  const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
  const currentTitle = TITLES[gameState.activeTitle] || TITLES['Novice'];
  const prestigeBorder = getPrestigeBorder(gameState.prestige);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} p-4 relative transition-all duration-500`}>
      {/* Custom styles */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }
        .float-number {
          animation: float-up 0.8s ease-out forwards;
        }
        .prestige-glow {
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2);
        }
      `}</style>

      {/* Floating Numbers */}
      {floatingNumbers.map(num => (
        <div
          key={num.id}
          className="absolute pointer-events-none font-bold text-lg z-30 float-number"
          style={{
            left: num.x,
            top: num.y,
            color: num.color,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {num.text}
        </div>
      ))}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg text-white font-semibold max-w-sm ${
              toast.type === 'success' ? 'bg-green-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Choice Event Modal */}
      {showChoiceEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-md p-6`}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold mb-4">⚡ Adventure Event</h2>
              <p className="text-gray-600 leading-relaxed">{gameState.event.eventText}</p>
            </div>
            
            <div className="space-y-3">
              {gameState.event.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceEvent(index)}
                  className={`w-full p-3 rounded-lg border-2 border-transparent hover:border-blue-300 bg-gradient-to-r ${currentTheme.accent} text-white font-semibold transition-all hover:shadow-lg`}
                >
                  {choice.text}
                </button>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={closeChoiceEvent}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Walk away...
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Title Display */}
        <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
                ⚔️
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Hero Forge
                </h1>
                <div className="flex items-center space-x-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${currentTitle.color} bg-opacity-20 border-2 border-current ${currentTitle.glow} shadow-lg`}>
                    {gameState.activeTitle} {studentData?.firstName}
                  </div>
                  {gameState.prestige > 0 && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold text-yellow-400 bg-yellow-400 bg-opacity-20 border-2 border-yellow-400 shadow-yellow-400/50 shadow-lg">
                      Prestige {gameState.prestige} ⭐
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {canPrestige() && (
                <button
                  onClick={doPrestige}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-bold prestige-glow"
                >
                  ⭐ Prestige (+{calculatePrestigeGain()})
                </button>
              )}
              <button
                onClick={() => setShowUnlockables(!showUnlockables)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                🎨 Customize
              </button>
              <button
                onClick={saveGameToFirebase}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Weapon Emblem & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Weapon Emblem */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-8`}>
              <div className="text-center">
                <div
                  className={`w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-8xl cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xl relative ${prestigeBorder}`}
                  onClick={attack}
                  style={{
                    boxShadow: `inset 0 20px 60px rgba(0,0,0,0.3), 0 30px 60px rgba(0,0,0,0.3)`
                  }}
                >
                  <img 
                    src={currentWeapon.path} 
                    alt={currentWeapon.name}
                    className="w-32 h-32 object-contain filter drop-shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-8xl hidden">⚔️</div>
                  
                  {/* Enhanced decorative elements */}
                  <div className="absolute top-4 left-12 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse"></div>
                  <div className="absolute top-16 left-6 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-8 left-24 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-12 right-6 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{animationDelay: '1.5s'}}></div>
                  <div className="absolute bottom-16 right-4 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
                  <div className="absolute bottom-24 right-12 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70 animate-pulse" style={{animationDelay: '2.5s'}}></div>
                </div>
                <p className="mt-4 text-gray-600 text-sm">Click to attack!</p>
                <p className="text-sm font-semibold text-purple-600">{currentWeapon.name}</p>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">⚡ Combat Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Gold:</span>
                  <span className="font-bold text-yellow-600">{fmt(Math.floor(gameState.gold))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Damage per Click:</span>
                  <span className="font-bold">{fmt(dpc())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Damage per Second:</span>
                  <span className="font-bold">{fmt(dps())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Earned:</span>
                  <span className="font-bold">{fmt(Math.floor(gameState.totalGold))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attacks:</span>
                  <span className="font-bold">{gameState.attacks.toLocaleString()}</span>
                </div>
                {gameState.prestige > 0 && (
                  <div className="flex justify-between">
                    <span>Lifetime Earnings:</span>
                    <span className="font-bold text-purple-600">{fmt(gameState.lifetimeEarnings)}</span>
                  </div>
                )}
              </div>

              {/* Active Boons */}
              {gameState.boons.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">🔮 Active Effects</h3>
                  {gameState.boons.map((boon, index) => (
                    <div key={index} className="text-sm text-purple-600 font-medium">
                      {boon.name} (x{boon.mult.toFixed(1)})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Columns - Artifacts & Upgrades */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buy Amount Controls */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">🛒 Buy Amount</h2>
              <div className="flex space-x-2">
                {[1, 10, 100].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setGameState(prev => ({ ...prev, buyAmount: amount }))}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      gameState.buyAmount === amount
                        ? `bg-gradient-to-r ${currentTheme.accent} text-white`
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    x{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Artifacts */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">🔮 Mystic Artifacts</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {gameState.artifacts.map((artifact, index) => {
                  const cost = costFor(artifact);
                  const canAfford = gameState.gold >= cost;
                  
                  return (
                    <div
                      key={artifact.key}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        canAfford 
                          ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                          : 'border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img 
                          src={artifact.path} 
                          alt={artifact.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="text-2xl hidden">🔮</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{artifact.name} <span className="text-sm text-gray-600">x{artifact.count}</span></h3>
                        <p className="text-sm text-gray-600">
                          Each: {fmt(artifact.baseDps * artifactMult(artifact.key))} DPS • Cost: {fmt(cost)}
                        </p>
                      </div>
                      <button
                        onClick={() => buyArtifact(index, gameState.buyAmount)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? `bg-gradient-to-r ${currentTheme.accent} text-white hover:shadow-lg`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Acquire
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Upgrades */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">⚡ Power Upgrades</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {gameState.upgrades.filter(upgrade => {
                  if (upgrade.purchased) return false;
                  if (upgrade.req && upgrade.req.key) {
                    const artifact = gameState.artifacts.find(a => a.key === upgrade.req.key);
                    return artifact && artifact.count >= upgrade.req.count;
                  }
                  return true;
                }).map((upgrade, index) => {
                  const canAfford = gameState.gold >= upgrade.cost;
                  const originalIndex = gameState.upgrades.findIndex(u => u.id === upgrade.id);
                  const isLegendary = upgrade.cost >= 1000000000;
                  
                  return (
                    <div
                      key={upgrade.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        canAfford 
                          ? isLegendary 
                            ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 shadow-yellow-200 shadow-lg' 
                            : 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                          : 'border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-bold flex items-center ${isLegendary ? 'text-yellow-700' : ''}`}>
                          {upgrade.name}
                          {isLegendary && <span className="ml-2">✨</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{upgrade.desc}</p>
                      </div>
                      <button
                        onClick={() => buyUpgrade(originalIndex)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? isLegendary
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg prestige-glow'
                              : `bg-gradient-to-r ${currentTheme.accent} text-white hover:shadow-lg`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {fmt(upgrade.cost)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Unlockables Panel */}
        {showUnlockables && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">🎨 Customize Your Legend</h2>
                  <button
                    onClick={() => setShowUnlockables(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Weapons */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">⚔️ Legendary Weapons</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {Object.entries(WEAPONS).map(([key, weapon]) => {
                        const unlocked = gameState.unlockedWeapons.includes(key);
                        const requirement = weapon.requirement;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                              selectedWeapon === key 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                                : unlocked 
                                  ? 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md' 
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setSelectedWeapon(key)}
                          >
                            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                              <img 
                                src={weapon.path} 
                                alt={weapon.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div className="text-2xl hidden">{weapon.icon}</div>
                            </div>
                            <div className="text-xs font-semibold">{weapon.name}</div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                                {requirement.type === 'upgrades' && `${requirement.value} upgrades`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Themes */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🎨 Realm Themes</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(THEMES).map(([key, theme]) => {
                        const unlocked = gameState.unlockedThemes.includes(key);
                        const requirement = theme.requirement;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedTheme === key 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                                : unlocked 
                                  ? 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md' 
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setSelectedTheme(key)}
                          >
                            <div className={`w-full h-6 rounded bg-gradient-to-r ${theme.bg} mb-2`}></div>
                            <div className="text-sm font-semibold">{theme.name}</div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Titles */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🏆 Hero Titles</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(TITLES).map(([key, title]) => {
                        const unlocked = gameState.unlockedTitles.includes(key);
                        const requirement = title.requirement;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              gameState.activeTitle === key 
                                ? `border-blue-500 bg-blue-50 ring-2 ring-blue-300` 
                                : unlocked 
                                  ? 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md' 
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setGameState(prev => ({ ...prev, activeTitle: key }))}
                          >
                            <div className={`text-sm font-bold ${title.color} mb-1`}>{key}</div>
                            <div className={`w-full h-2 rounded ${title.color.replace('text-', 'bg-')} opacity-20 mb-2`}></div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t text-center">
                  <button
                    onClick={() => setShowUnlockables(false)}
                    className={`bg-gradient-to-r ${currentTheme.accent} text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all`}
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClickerGame;