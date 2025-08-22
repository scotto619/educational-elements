// components/games/ClickerGame.js - Hero Forge Fantasy Clicker with Firebase Integration
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
    buildings: [
      { key: 'squire', name: 'Squire', baseCost: 15, count: 0, baseDps: 0.1, icon: '🗡️' },
      { key: 'archer', name: 'Archer', baseCost: 100, count: 0, baseDps: 1, icon: '🏹' },
      { key: 'mage', name: 'Mage Tower', baseCost: 1100, count: 0, baseDps: 8, icon: '🧙‍♂️' },
      { key: 'guild', name: 'Guild Hall', baseCost: 12000, count: 0, baseDps: 47, icon: '🛡️' },
      { key: 'castle', name: 'Castle', baseCost: 130000, count: 0, baseDps: 260, icon: '🏰' },
    ],
    upgrades: [
      { id: 'squire-1', name: 'Drill the Recruits', desc: 'Squires are twice as efficient', cost: 100, req: { key: 'squire', count: 10 }, purchased: false },
      { id: 'archer-1', name: 'Elven Bowstrings', desc: 'Archers are twice as efficient', cost: 1000, req: { key: 'archer', count: 10 }, purchased: false },
      { id: 'mage-1', name: 'Runic Tomes', desc: 'Mage Towers are twice as efficient', cost: 11000, req: { key: 'mage', count: 10 }, purchased: false },
      { id: 'attack-1', name: 'Sharpened Blade', desc: 'Attacks earn twice the gold', cost: 500, req: { key: null, count: 0 }, purchased: false },
    ],
    boons: [],
    event: { nextIn: 40 + Math.random() * 50, shown: false, until: 0 },
    
    // NEW: Unlockables system
    unlockedCursors: ['default'],
    activeCursor: 'default',
    unlockedThemes: ['default'],
    activeTheme: 'default',
    unlockedTitles: ['Novice'],
    activeTitle: 'Novice',
    achievements: [],
    prestige: 0,
    prestigePoints: 0
  });

  const [selectedCursor, setSelectedCursor] = useState('default');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [toasts, setToasts] = useState([]);

  const gameLoopRef = useRef();
  const lastUpdateRef = useRef(performance.now());
  const eventAccumRef = useRef(0);
  const autosaveAccumRef = useRef(0);

  // Cursor definitions with unlock requirements
  const CURSORS = {
    default: { name: 'Default', icon: '⚔️', color: '#ffffff', requirement: null },
    golden: { name: 'Golden Blade', icon: '⚔️', color: '#ffd700', requirement: { type: 'totalGold', value: 1000 } },
    silver: { name: 'Silver Edge', icon: '⚔️', color: '#c0c0c0', requirement: { type: 'totalGold', value: 5000 } },
    ruby: { name: 'Ruby Sword', icon: '⚔️', color: '#ff0000', requirement: { type: 'totalGold', value: 25000 } },
    sapphire: { name: 'Sapphire Blade', icon: '⚔️', color: '#0000ff', requirement: { type: 'attacks', value: 1000 } },
    emerald: { name: 'Emerald Cutter', icon: '⚔️', color: '#00ff00', requirement: { type: 'buildings', value: 50 } },
    diamond: { name: 'Diamond Edge', icon: '⚔️', color: '#b9f2ff', requirement: { type: 'totalGold', value: 100000 } },
    mythril: { name: 'Mythril Sword', icon: '⚔️', color: '#800080', requirement: { type: 'upgrades', value: 3 } },
    dragon: { name: 'Dragon Fang', icon: '🐲', color: '#ff4500', requirement: { type: 'dps', value: 100 } },
    phoenix: { name: 'Phoenix Talon', icon: '🔥', color: '#ff6600', requirement: { type: 'prestige', value: 1 } }
  };

  // Theme definitions
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
      requirement: { type: 'buildings', value: 25 } 
    },
    ice: { 
      name: 'Frozen Peaks', 
      bg: 'from-cyan-100 to-blue-200',
      panel: 'bg-cyan-50',
      accent: 'from-cyan-500 to-blue-600',
      requirement: { type: 'dps', value: 50 } 
    }
  };

  // Title definitions
  const TITLES = {
    'Novice': { requirement: null },
    'Apprentice': { requirement: { type: 'totalGold', value: 500 } },
    'Warrior': { requirement: { type: 'attacks', value: 100 } },
    'Hero': { requirement: { type: 'totalGold', value: 5000 } },
    'Champion': { requirement: { type: 'buildings', value: 10 } },
    'Legend': { requirement: { type: 'totalGold', value: 50000 } },
    'Mythic': { requirement: { type: 'prestige', value: 1 } }
  };

  // Helper functions
  const fmt = useCallback((n) => {
    if (!isFinite(n)) return '0';
    const abs = Math.abs(n);
    if (abs < 1000) return Math.round(n).toLocaleString();
    const units = ['k', 'M', 'B', 'T', 'q', 'Q'];
    let u = -1;
    let val = abs;
    while (val >= 1000 && u < units.length - 1) {
      val /= 1000;
      u++;
    }
    const out = (Math.sign(n) * val).toFixed(val >= 100 ? 0 : val >= 10 ? 1 : 2);
    return out + units[u];
  }, []);

  const costFor = useCallback((building) => {
    return Math.floor(building.baseCost * Math.pow(1.15, building.count));
  }, []);

  const buildingMult = useCallback((key) => {
    return gameState.multipliers[key] || 1;
  }, [gameState.multipliers]);

  const dpc = useCallback(() => {
    let mult = gameState.dpcMult * activeBoonMult('dpc');
    return Math.max(1, gameState.dpcBase * mult);
  }, [gameState.dpcBase, gameState.dpcMult]);

  const dps = useCallback(() => {
    let total = 0;
    for (const b of gameState.buildings) {
      total += b.count * b.baseDps * buildingMult(b.key);
    }
    total *= gameState.globalDpsMult * activeBoonMult('dps');
    return total;
  }, [gameState.buildings, gameState.globalDpsMult, buildingMult]);

  const activeBoonMult = useCallback((type) => {
    let m = 1;
    const now = performance.now();
    for (const boon of gameState.boons) {
      if (boon.type === type && now < boon.until) m *= boon.mult;
    }
    return m;
  }, [gameState.boons]);

  const totalBuildings = useCallback(() => {
    return gameState.buildings.reduce((sum, b) => sum + b.count, 0);
  }, [gameState.buildings]);

  const purchasedUpgrades = useCallback(() => {
    return gameState.upgrades.filter(u => u.purchased).length;
  }, [gameState.upgrades]);

  // Check unlock requirements
  const checkUnlockRequirement = useCallback((requirement) => {
    if (!requirement) return true;
    
    switch (requirement.type) {
      case 'totalGold':
        return gameState.totalGold >= requirement.value;
      case 'attacks':
        return gameState.attacks >= requirement.value;
      case 'buildings':
        return totalBuildings() >= requirement.value;
      case 'dps':
        return dps() >= requirement.value;
      case 'upgrades':
        return purchasedUpgrades() >= requirement.value;
      case 'prestige':
        return gameState.prestige >= requirement.value;
      default:
        return false;
    }
  }, [gameState, totalBuildings, dps, purchasedUpgrades]);

  // Check for new unlocks
  const checkUnlocks = useCallback(() => {
    let newUnlocks = [];

    // Check cursors
    Object.entries(CURSORS).forEach(([key, cursor]) => {
      if (!gameState.unlockedCursors.includes(key) && checkUnlockRequirement(cursor.requirement)) {
        setGameState(prev => ({
          ...prev,
          unlockedCursors: [...prev.unlockedCursors, key]
        }));
        newUnlocks.push(`New cursor unlocked: ${cursor.name}!`);
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
    
    // Also use the external showToast if available
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
    addFloatingNumber(x, y, `+${fmt(gain)}`, CURSORS[gameState.activeCursor]?.color || '#ffd700');

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
  }, [dpc, addGold, addFloatingNumber, fmt, gameState.activeCursor, gameState.attacks, addToast]);

  // Buy building
  const buyBuilding = useCallback((buildingIndex, amount) => {
    setGameState(prev => {
      const building = prev.buildings[buildingIndex];
      const newBuildings = [...prev.buildings];
      let bought = 0;
      let totalCost = 0;

      for (let i = 0; i < amount; i++) {
        const cost = costFor({ ...building, count: building.count + bought });
        if (prev.gold >= totalCost + cost) {
          totalCost += cost;
          bought++;
        } else {
          break;
        }
      }

      if (bought > 0) {
        newBuildings[buildingIndex] = {
          ...building,
          count: building.count + bought
        };

        addToast(`Recruited ${building.name} x${bought}`, 'success');

        return {
          ...prev,
          gold: prev.gold - totalCost,
          buildings: newBuildings
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
        if (upgrade.id === 'squire-1') {
          newState.multipliers = { ...newState.multipliers, squire: (newState.multipliers.squire || 1) * 2 };
        } else if (upgrade.id === 'archer-1') {
          newState.multipliers = { ...newState.multipliers, archer: (newState.multipliers.archer || 1) * 2 };
        } else if (upgrade.id === 'mage-1') {
          newState.multipliers = { ...newState.multipliers, mage: (newState.multipliers.mage || 1) * 2 };
        } else if (upgrade.id === 'attack-1') {
          newState.dpcMult *= 2;
        }

        addToast(`Purchased: ${upgrade.name}`, 'success');
        return newState;
      }
      return prev;
    });
  }, [addToast]);

  // Spawn treasure event
  const spawnEvent = useCallback(() => {
    if (gameState.event.shown) return;
    
    setGameState(prev => ({
      ...prev,
      event: {
        ...prev.event,
        shown: true,
        until: performance.now() + 13000
      }
    }));
  }, [gameState.event.shown]);

  // Handle treasure event click
  const handleEventClick = useCallback(() => {
    const roll = Math.random();
    if (roll < 0.4) {
      // DPS Frenzy
      const mult = 7;
      const dur = 20000;
      const until = performance.now() + dur;
      setGameState(prev => ({
        ...prev,
        boons: [...prev.boons, { name: 'War Horn', type: 'dps', mult, until }],
        event: { ...prev.event, shown: false, nextIn: 40 + Math.random() * 50 }
      }));
      addToast(`War Horn! DPS x${mult} for ${Math.round(dur/1000)}s`, 'success');
    } else if (roll < 0.75) {
      // DPC Frenzy
      const mult = 10;
      const dur = 10000;
      const until = performance.now() + dur;
      setGameState(prev => ({
        ...prev,
        boons: [...prev.boons, { name: 'Blade Flurry', type: 'dpc', mult, until }],
        event: { ...prev.event, shown: false, nextIn: 40 + Math.random() * 50 }
      }));
      addToast(`Blade Flurry! DPC x${mult} for ${Math.round(dur/1000)}s`, 'success');
    } else {
      // Treasure
      const gain = Math.max(13, dps() * 120) * (0.5 + Math.random());
      addGold(gain);
      setGameState(prev => ({
        ...prev,
        event: { ...prev.event, shown: false, nextIn: 40 + Math.random() * 50 }
      }));
      addToast(`Treasure! +${fmt(gain)} gold`, 'success');
    }
  }, [dps, addGold, addToast, fmt]);

  // Save game to Firebase
  const saveGameToFirebase = useCallback(async () => {
    if (!studentData || !updateStudentData) return;

    try {
      const saveData = {
        clickerGameData: {
          ...gameState,
          lastSave: Date.now(),
          version: '1.0'
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
        event: { nextIn: 40 + Math.random() * 50, shown: false, until: 0 }
      }));

      if (offlineProduction > 0) {
        addToast(`Welcome back! +${fmt(offlineProduction)} offline gold`, 'success');
      }

      // Load unlockables
      setSelectedCursor(loadedData.activeCursor || 'default');
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
  }, [gameState.totalGold, gameState.attacks, totalBuildings(), dps(), purchasedUpgrades(), checkUnlocks]);

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

      // Event system
      if (!gameState.event.shown) {
        eventAccumRef.current += dt;
        if (eventAccumRef.current >= gameState.event.nextIn) {
          eventAccumRef.current = 0;
          spawnEvent();
        }
      } else if (timestamp >= gameState.event.until) {
        setGameState(prev => ({
          ...prev,
          event: { ...prev.event, shown: false, nextIn: 40 + Math.random() * 50 }
        }));
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
  }, [dps, addGold, gameState.event, spawnEvent, saveGameToFirebase]);

  // Apply selected cursor and theme
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      activeCursor: selectedCursor,
      activeTheme: selectedTheme
    }));
  }, [selectedCursor, selectedTheme]);

  const currentTheme = THEMES[gameState.activeTheme] || THEMES.default;
  const currentCursor = CURSORS[gameState.activeCursor] || CURSORS.default;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} p-4 relative transition-all duration-500`}>
      {/* Custom cursor styles */}
      <style jsx>{`
        .custom-cursor {
          cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewport='0 0 32 32'><text y='24' font-size='24' fill='${currentCursor.color}'>${currentCursor.icon}</text></svg>") 16 16, auto;
        }
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
              'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {/* Treasure Event */}
      {gameState.event.shown && (
        <div
          className="fixed text-6xl cursor-pointer animate-bounce z-40 custom-cursor"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={handleEventClick}
        >
          💎
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
                <p className="text-sm text-gray-600">
                  {gameState.activeTitle} {studentData?.firstName} • Level {Math.floor(Math.log10(Math.max(1, gameState.totalGold)) + 1)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
          {/* Left Column - Hero Emblem & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hero Emblem */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-8`}>
              <div className="text-center">
                <div
                  className="w-64 h-64 mx-auto rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-8xl cursor-pointer transition-transform hover:scale-105 active:scale-95 custom-cursor shadow-2xl relative"
                  onClick={attack}
                  style={{
                    boxShadow: `inset 0 20px 60px rgba(0,0,0,0.3), 0 30px 60px rgba(0,0,0,0.3)`
                  }}
                >
                  {currentCursor.icon}
                  
                  {/* Decorative runes */}
                  <div className="absolute top-4 left-12 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70"></div>
                  <div className="absolute top-16 left-6 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70"></div>
                  <div className="absolute bottom-8 left-24 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70"></div>
                  <div className="absolute top-12 right-6 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70"></div>
                  <div className="absolute bottom-16 right-4 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70"></div>
                  <div className="absolute bottom-24 right-12 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-70"></div>
                </div>
                <p className="mt-4 text-gray-600 text-sm">Click to attack!</p>
              </div>
            </div>

            {/* Stats */}
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
              </div>

              {/* Active Boons */}
              {gameState.boons.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-semibold mb-2">🔮 Active Boons</h3>
                  {gameState.boons.map((boon, index) => (
                    <div key={index} className="text-sm text-purple-600 font-medium">
                      {boon.name} (x{boon.mult})
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Columns - Buildings & Upgrades */}
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

            {/* Buildings */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">🏰 Guild Store</h2>
              <div className="space-y-3">
                {gameState.buildings.map((building, index) => {
                  const cost = costFor(building);
                  const canAfford = gameState.gold >= cost;
                  
                  return (
                    <div
                      key={building.key}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        canAfford 
                          ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                          : 'border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-3xl">{building.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{building.name} <span className="text-sm text-gray-600">x{building.count}</span></h3>
                        <p className="text-sm text-gray-600">
                          Each: {fmt(building.baseDps * buildingMult(building.key))} DPS • Cost: {fmt(cost)}
                        </p>
                      </div>
                      <button
                        onClick={() => buyBuilding(index, gameState.buyAmount)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? `bg-gradient-to-r ${currentTheme.accent} text-white hover:shadow-lg`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Hire
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrades */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">⚡ Upgrades</h2>
              <div className="space-y-3">
                {gameState.upgrades.filter(upgrade => {
                  if (upgrade.purchased) return false;
                  if (upgrade.req && upgrade.req.key) {
                    const building = gameState.buildings.find(b => b.key === upgrade.req.key);
                    return building && building.count >= upgrade.req.count;
                  }
                  return true;
                }).map((upgrade, index) => {
                  const canAfford = gameState.gold >= upgrade.cost;
                  const originalIndex = gameState.upgrades.findIndex(u => u.id === upgrade.id);
                  
                  return (
                    <div
                      key={upgrade.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        canAfford 
                          ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                          : 'border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className="font-bold">{upgrade.name}</h3>
                        <p className="text-sm text-gray-600">{upgrade.desc}</p>
                      </div>
                      <button
                        onClick={() => buyUpgrade(originalIndex)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? `bg-gradient-to-r ${currentTheme.accent} text-white hover:shadow-lg`
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

        {/* Unlockables Panel */}
        {showUnlockables && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">🎨 Customize Your Adventure</h2>
                  <button
                    onClick={() => setShowUnlockables(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Cursors */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">⚔️ Battle Cursors</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(CURSORS).map(([key, cursor]) => {
                        const unlocked = gameState.unlockedCursors.includes(key);
                        const requirement = cursor.requirement;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                              selectedCursor === key 
                                ? 'border-blue-500 bg-blue-50' 
                                : unlocked 
                                  ? 'border-gray-300 hover:border-gray-400 bg-white' 
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setSelectedCursor(key)}
                          >
                            <div 
                              className="text-2xl mb-1" 
                              style={{ color: cursor.color }}
                            >
                              {cursor.icon}
                            </div>
                            <div className="text-sm font-semibold">{cursor.name}</div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'buildings' && `${requirement.value} buildings`}
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
                    <div className="space-y-3">
                      {Object.entries(THEMES).map(([key, theme]) => {
                        const unlocked = gameState.unlockedThemes.includes(key);
                        const requirement = theme.requirement;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedTheme === key 
                                ? 'border-blue-500 bg-blue-50' 
                                : unlocked 
                                  ? 'border-gray-300 hover:border-gray-400 bg-white' 
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setSelectedTheme(key)}
                          >
                            <div className={`w-full h-8 rounded bg-gradient-to-r ${theme.bg} mb-2`}></div>
                            <div className="text-sm font-semibold">{theme.name}</div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'buildings' && `${requirement.value} buildings`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Titles */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🏆 Hero Titles</h3>
                    <div className="space-y-3">
                      {Object.entries(TITLES).map(([key, title]) => {
                        const unlocked = gameState.unlockedTitles.includes(key);
                        const requirement = title.requirement;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              gameState.activeTitle === key 
                                ? 'border-blue-500 bg-blue-50' 
                                : unlocked 
                                  ? 'border-gray-300 hover:border-gray-400 bg-white' 
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setGameState(prev => ({ ...prev, activeTitle: key }))}
                          >
                            <div className="text-sm font-semibold">{key}</div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'buildings' && `${requirement.value} buildings`}
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