// components/games/ClickerGame.js - ENHANCED WITH MUSIC, NEW EVENTS & HIGH-LEVEL REWARDS
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WEAPONS } from '../../utils/weaponData';

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
      { key: 'orb', name: 'Crystal Orb', baseCost: 15, count: 0, baseDps: 0.1, icon: '1', path: '/Loot/Artifacts/1.png' },
      { key: 'tome', name: 'Ancient Tome', baseCost: 100, count: 0, baseDps: 1, icon: '2', path: '/Loot/Artifacts/2.png' },
      { key: 'lute', name: 'Mystic Lute', baseCost: 1100, count: 0, baseDps: 8, icon: '3', path: '/Loot/Artifacts/3.png' },
      { key: 'shield', name: 'Guardian Shield', baseCost: 12000, count: 0, baseDps: 47, icon: '4', path: '/Loot/Artifacts/4.png' },
      { key: 'chalice', name: 'Divine Chalice', baseCost: 130000, count: 0, baseDps: 260, icon: '5', path: '/Loot/Artifacts/5.png' },
      { key: 'crown', name: 'Crown of Ages', baseCost: 1400000, count: 0, baseDps: 1400, icon: '6', path: '/Loot/Artifacts/6.png' },
      { key: 'mask', name: 'Shadow Mask', baseCost: 20000000, count: 0, baseDps: 7800, icon: '7', path: '/Loot/Artifacts/7.png' },
      { key: 'totem', name: 'Primal Totem', baseCost: 330000000, count: 0, baseDps: 44000, icon: '8', path: '/Loot/Artifacts/8.png' },
      { key: 'phoenix', name: 'Phoenix Feather', baseCost: 5100000000, count: 0, baseDps: 260000, icon: '9', path: '/Loot/Artifacts/9.png' },
      { key: 'cauldron', name: 'Void Cauldron', baseCost: 75000000000, count: 0, baseDps: 1600000, icon: '10', path: '/Loot/Artifacts/10.png' }
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
    lifetimeEarnings: 0,
    
    // NEW: Music and high-level features
    musicEnabled: false,
    masterLevel: 0,
    challengesCompleted: [],
    bossesDefeated: [],
    skillPoints: 0,
    masteries: {}
  });

  const [selectedWeapon, setSelectedWeapon] = useState('1');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [floatingNumbers, setFloatingNumbers] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [showChoiceEvent, setShowChoiceEvent] = useState(false);
  const [eventTimeLeft, setEventTimeLeft] = useState(0);
  
  // NEW: Challenge and boss states
  const [activeBoss, setActiveBoss] = useState(null);
  const [bossHealth, setBossHealth] = useState(0);
  const [maxBossHealth, setMaxBossHealth] = useState(0);
  const [showSkillChallenge, setShowSkillChallenge] = useState(false);
  const [challengeData, setChallengeData] = useState(null);

  // LOADING STATE
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  const gameLoopRef = useRef();
  const lastUpdateRef = useRef();
  const eventAccumRef = useRef(0);
  const lastSaveRef = useRef(0);
  const musicRef = useRef(null); // Background music reference

  // EXPANDED Theme definitions with PRESTIGE themes
  const THEMES = {
    default: { 
      name: 'Hero\'s Dawn', 
      bg: 'from-blue-50 to-purple-100',
      panel: 'bg-white text-gray-800',
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
      panel: 'bg-green-50 text-gray-800',
      accent: 'from-green-500 to-emerald-600',
      requirement: { type: 'attacks', value: 500 } 
    },
    fire: { 
      name: 'Dragon\'s Lair', 
      bg: 'from-red-100 to-orange-200',
      panel: 'bg-red-50 text-gray-800',
      accent: 'from-red-500 to-orange-600',
      requirement: { type: 'artifacts', value: 25 } 
    },
    ice: { 
      name: 'Frozen Peaks', 
      bg: 'from-cyan-100 to-blue-200',
      panel: 'bg-cyan-50 text-gray-800',
      accent: 'from-cyan-500 to-blue-600',
      requirement: { type: 'dps', value: 50 } 
    },
    cosmic: {
      name: 'Void Dimension',
      bg: 'from-purple-900 to-indigo-900',
      panel: 'bg-purple-800 text-white',
      accent: 'from-pink-500 to-purple-600',
      requirement: { type: 'prestige', value: 1 }
    },
    desert: {
      name: 'Desert Oasis',
      bg: 'from-yellow-100 to-orange-200',
      panel: 'bg-yellow-50 text-gray-800',
      accent: 'from-yellow-500 to-orange-600',
      requirement: { type: 'totalGold', value: 50000 }
    },
    ocean: {
      name: 'Ocean Depths',
      bg: 'from-blue-200 to-teal-300',
      panel: 'bg-blue-50 text-gray-800',
      accent: 'from-blue-600 to-teal-600',
      requirement: { type: 'attacks', value: 2000 }
    },
    mystic: {
      name: 'Mystic Grove',
      bg: 'from-purple-200 to-pink-200',
      panel: 'bg-purple-50 text-gray-800',
      accent: 'from-purple-600 to-pink-600',
      requirement: { type: 'artifacts', value: 75 }
    },
    celestial: {
      name: 'Celestial Realm',
      bg: 'from-indigo-200 to-purple-300',
      panel: 'bg-indigo-50 text-gray-800',
      accent: 'from-indigo-600 to-purple-600',
      requirement: { type: 'totalGold', value: 500000 }
    },
    volcanic: {
      name: 'Volcanic Forge',
      bg: 'from-red-200 to-gray-400',
      panel: 'bg-red-100 text-gray-800',
      accent: 'from-red-600 to-gray-700',
      requirement: { type: 'prestige', value: 3 }
    },
    
    // NEW: Ultra-exclusive prestige themes
    transcendent: {
      name: 'Transcendent Plane',
      bg: 'from-yellow-200 via-pink-300 to-purple-400',
      panel: 'bg-gradient-to-br from-white to-yellow-50 text-gray-800',
      accent: 'from-yellow-600 to-pink-600',
      requirement: { type: 'prestige', value: 10 }
    },
    omnipotent: {
      name: 'Omnipotent Realm',
      bg: 'from-black via-purple-900 to-pink-900',
      panel: 'bg-black text-white border-2 border-purple-500',
      accent: 'from-purple-500 to-pink-500',
      requirement: { type: 'prestige', value: 20 }
    },
    infinite: {
      name: 'Infinite Cosmos',
      bg: 'from-indigo-900 via-purple-900 to-pink-900',
      panel: 'bg-gray-900 text-white border-2 border-yellow-400',
      accent: 'from-yellow-400 to-orange-500',
      requirement: { type: 'masterLevel', value: 5 }
    }
  };

  // EXPANDED title definitions with MASTER tiers
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
    'Eternal': { requirement: { type: 'prestige', value: 10 }, color: 'text-purple-400', glow: 'shadow-purple-400/50' },
    
    // NEW: Master tier titles
    'Transcendent': { requirement: { type: 'prestige', value: 15 }, color: 'text-gradient-to-r from-yellow-400 to-pink-400', glow: 'shadow-yellow-400/70' },
    'Omnipotent': { requirement: { type: 'prestige', value: 20 }, color: 'text-gradient-to-r from-purple-400 to-pink-400', glow: 'shadow-purple-400/90' },
    'Cosmic Master': { requirement: { type: 'prestige', value: 25 }, color: 'text-gradient-to-r from-blue-300 to-purple-300', glow: 'shadow-blue-400/90' },
    'Reality Shaper': { requirement: { type: 'masterLevel', value: 1 }, color: 'text-gradient-to-r from-red-300 to-yellow-300', glow: 'shadow-red-400/90' },
    'Infinity Lord': { requirement: { type: 'masterLevel', value: 10 }, color: 'text-white', glow: 'shadow-white/100 animate-pulse' }
  };

  // NEW: Boss definitions for epic encounters
  const BOSS_ENCOUNTERS = [
    {
      id: 'shadow_king',
      name: 'Shadow King',
      health: 50000,
      goldReward: 25000,
      specialReward: { type: 'dpcMult', value: 1.5 },
      requirement: { type: 'totalGold', value: 100000 },
      phases: [
        { healthPercent: 100, message: 'The Shadow King emerges from the darkness!' },
        { healthPercent: 50, message: 'The Shadow King calls forth minions!' },
        { healthPercent: 10, message: 'The Shadow King enters a rage!' }
      ]
    },
    {
      id: 'crystal_dragon',
      name: 'Crystal Dragon',
      health: 500000,
      goldReward: 250000,
      specialReward: { type: 'globalDpsMult', value: 2.0 },
      requirement: { type: 'prestige', value: 2 },
      phases: [
        { healthPercent: 100, message: 'A massive Crystal Dragon blocks your path!' },
        { healthPercent: 30, message: 'The Crystal Dragon breathes devastating fire!' },
        { healthPercent: 5, message: 'The Crystal Dragon makes one final desperate attack!' }
      ]
    },
    {
      id: 'void_emperor',
      name: 'Void Emperor',
      health: 10000000,
      goldReward: 2000000,
      specialReward: { type: 'masterLevel', value: 1 },
      requirement: { type: 'prestige', value: 10 },
      phases: [
        { healthPercent: 100, message: 'The Void Emperor materializes from nothingness!' },
        { healthPercent: 66, message: 'Reality bends around the Void Emperor!' },
        { healthPercent: 33, message: 'The Void Emperor summons cosmic storms!' },
        { healthPercent: 10, message: 'The Void Emperor prepares for annihilation!' }
      ]
    }
  ];

  // NEW: Interactive skill challenges
  const SKILL_CHALLENGES = [
    {
      id: 'timing_challenge',
      name: 'Perfect Timing',
      description: 'Click when the indicator hits the green zone!',
      type: 'timing',
      difficulty: 'medium',
      goldReward: 5000,
      duration: 10000
    },
    {
      id: 'sequence_challenge',
      name: 'Memory Sequence',
      description: 'Repeat the sequence of clicks!',
      type: 'sequence',
      difficulty: 'hard',
      goldReward: 15000,
      duration: 30000
    },
    {
      id: 'rapid_fire',
      name: 'Rapid Fire',
      description: 'Click as fast as you can!',
      type: 'speed',
      difficulty: 'easy',
      goldReward: 3000,
      duration: 5000
    }
  ];

  // NEW: Enhanced choice events with multi-stage and interactive elements
  const CHOICE_EVENTS = [
    {
      text: "🎰 You find a magical Lucky Wheel! Spin to win fantastic prizes!",
      choices: [
        { text: "🎰 Spin the Wheel!", effect: { type: 'luckyWheel' } },
        { text: "Walk away safely", effect: { type: 'smallGoldGain', amount: 0.02 } }
      ]
    },
    {
      text: "⚔️ A legendary warrior challenges you! Do you accept their trial?",
      choices: [
        { text: "🗡️ Accept the duel!", effect: { type: 'skillChallenge', challengeType: 'timing_challenge' } },
        { text: "🏃 Decline respectfully", effect: { type: 'goldGain', amount: 0.05 } }
      ]
    },
    {
      text: "🐉 A mighty boss appears on the horizon! Will you face this legendary foe?",
      choices: [
        { text: "⚔️ Engage in epic battle!", effect: { type: 'bossEncounter' } },
        { text: "🏃 Retreat for now", effect: { type: 'goldGain', amount: 0.1 } }
      ]
    },
    {
      text: "🧙‍♂️ An ancient wizard offers to test your magical abilities...",
      choices: [
        { text: "✨ Accept the magical test", effect: { type: 'skillChallenge', challengeType: 'sequence_challenge' } },
        { text: "🚶 Politely decline", effect: { type: 'smallGoldGain', amount: 0.03 } }
      ]
    },
    {
      text: "🏃‍♂️ A speed demon challenges you to a contest of reflexes!",
      choices: [
        { text: "⚡ Show your lightning reflexes!", effect: { type: 'skillChallenge', challengeType: 'rapid_fire' } },
        { text: "🚶 Walk away calmly", effect: { type: 'goldGain', amount: 0.04 } }
      ]
    },
    {
      text: "🌟 A cosmic rift opens, revealing treasures beyond imagination!",
      choices: [
        { text: "🌀 Enter the rift", effect: { type: 'cosmicRift' } },
        { text: "🛡️ Stay in this reality", effect: { type: 'goldGain', amount: 0.08 } }
      ]
    },
    {
      text: "🎭 A mysterious carnival appears with games of chance and skill...",
      choices: [
        { text: "🎪 Play the carnival games", effect: { type: 'carnival' } },
        { text: "👀 Just watch from afar", effect: { type: 'smallGoldGain', amount: 0.02 } }
      ]
    },
    {
      text: "⚡ A storm of pure energy surrounds you! How do you respond?",
      choices: [
        { text: "🌩️ Absorb the energy", effect: { type: 'energyStorm' } },
        { text: "🛡️ Shield yourself", effect: { type: 'goldGain', amount: 0.06 } },
        { text: "🏃 Run through it", effect: { type: 'randomBoon', duration: 120000 } }
      ]
    }
  ];

  // Helper functions
  const fmt = useCallback((n) => {
    if (!isFinite(n) || isNaN(n)) return '0';
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

  const activeBoonMult = useCallback((type) => {
    let m = 1;
    const now = Date.now();
    for (const boon of gameState.boons) {
      if (boon.type === type && now < boon.until) m *= boon.mult;
    }
    return m;
  }, [gameState.boons]);

  const dpc = useCallback(() => {
    const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
    const weaponMultiplier = currentWeapon.dpcMultiplier || 1;
    
    let mult = gameState.dpcMult * activeBoonMult('dpc') * weaponMultiplier;
    return Math.max(1, gameState.dpcBase * mult);
  }, [gameState.dpcBase, gameState.dpcMult, gameState.activeWeapon, activeBoonMult]);

  const dps = useCallback(() => {
    let total = 0;
    if (gameState.artifacts && Array.isArray(gameState.artifacts)) {
      for (const a of gameState.artifacts) {
        if (a && typeof a === 'object' && typeof a.count === 'number' && typeof a.baseDps === 'number') {
          total += a.count * a.baseDps * artifactMult(a.key);
        }
      }
    }
    total *= gameState.globalDpsMult * activeBoonMult('dps');
    return total;
  }, [gameState.artifacts, gameState.globalDpsMult, artifactMult, activeBoonMult]);

  const totalArtifacts = useCallback(() => {
    if (!gameState.artifacts || !Array.isArray(gameState.artifacts)) return 0;
    return gameState.artifacts.reduce((sum, a) => {
      if (a && typeof a.count === 'number') {
        return sum + a.count;
      }
      return sum;
    }, 0);
  }, [gameState.artifacts]);

  const purchasedUpgrades = useCallback(() => {
    if (!gameState.upgrades || !Array.isArray(gameState.upgrades)) return 0;
    return gameState.upgrades.filter(u => u && u.purchased).length;
  }, [gameState.upgrades]);

  // NEW: Background Music Functions
  const initializeMusic = useCallback(() => {
    if (!musicRef.current) {
      musicRef.current = new Audio('/sounds/clickermusic.mp3');
      musicRef.current.loop = true;
      musicRef.current.volume = 0.3;
      
      // Handle loading errors gracefully
      musicRef.current.addEventListener('error', () => {
        console.log('Background music failed to load');
      });
    }
  }, []);

  const toggleMusic = useCallback(() => {
    initializeMusic();
    
    setGameState(prev => {
      const newMusicEnabled = !prev.musicEnabled;
      
      if (newMusicEnabled) {
        musicRef.current.play().catch(e => {
          console.log('Music playback failed:', e);
        });
      } else {
        musicRef.current.pause();
      }
      
      return { ...prev, musicEnabled: newMusicEnabled };
    });
  }, [initializeMusic]);

  // Prestige functions
  const canPrestige = useCallback(() => {
    return gameState.totalGold >= 1000000000;
  }, [gameState.totalGold]);

  const calculatePrestigeGain = useCallback(() => {
    if (!canPrestige()) return 0;
    return Math.floor(Math.sqrt(gameState.totalGold / 1000000000));
  }, [gameState.totalGold, canPrestige]);

  const getPrestigeBorder = (prestigeLevel) => {
    if (prestigeLevel <= 0) return '';
    if (prestigeLevel >= 20) return 'ring-8 ring-white ring-opacity-100 animate-pulse shadow-2xl shadow-white/50';
    if (prestigeLevel >= 15) return 'ring-8 ring-yellow-300 ring-opacity-100 animate-pulse shadow-2xl shadow-yellow-400/50';
    if (prestigeLevel >= 10) return 'ring-8 ring-purple-400 ring-opacity-100 animate-pulse shadow-2xl shadow-purple-400/50';
    if (prestigeLevel >= 6) return 'ring-8 ring-cyan-400 ring-opacity-80 shadow-xl shadow-cyan-400/30';
    const borders = ['', 'ring-4 ring-yellow-400 ring-opacity-60', 'ring-4 ring-orange-400 ring-opacity-60', 'ring-4 ring-red-400 ring-opacity-60', 'ring-4 ring-purple-400 ring-opacity-60', 'ring-4 ring-pink-400 ring-opacity-60'];
    return borders[Math.min(prestigeLevel, borders.length - 1)] || '';
  };

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
      case 'masterLevel':
        return gameState.masterLevel >= requirement.value;
      default:
        return false;
    }
  }, [gameState.totalGold, gameState.attacks, gameState.prestige, gameState.masterLevel, totalArtifacts, dps, purchasedUpgrades]);

  // Add floating number
  const addFloatingNumber = useCallback((x, y, text, color = '#ffd700') => {
    const id = Date.now() + Math.random();
    setFloatingNumbers(prev => [...prev, { id, x, y, text, color, time: Date.now() }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(f => f.id !== id));
    }, 800);
  }, []);

  // Add gold with effects
  const addGold = useCallback((amount) => {
    if (!isFinite(amount) || isNaN(amount)) return;
    
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

  // NEW: Boss encounter functions
  const startBossEncounter = useCallback((bossId) => {
    const boss = BOSS_ENCOUNTERS.find(b => b.id === bossId);
    if (!boss) return;

    setActiveBoss(boss);
    setBossHealth(boss.health);
    setMaxBossHealth(boss.health);
    addToast(`${boss.name} appears! Prepare for battle!`, 'warning');
  }, [addToast]);

  const attackBoss = useCallback((damage) => {
    if (!activeBoss || bossHealth <= 0) return;

    const newHealth = Math.max(0, bossHealth - damage);
    setBossHealth(newHealth);

    // Check for phase transitions
    const healthPercent = (newHealth / maxBossHealth) * 100;
    const currentPhase = activeBoss.phases.find(p => 
      healthPercent <= p.healthPercent && healthPercent > (activeBoss.phases[activeBoss.phases.indexOf(p) + 1]?.healthPercent || 0)
    );

    if (currentPhase && newHealth !== bossHealth) {
      addToast(currentPhase.message, 'info');
    }

    // Boss defeated
    if (newHealth <= 0) {
      const reward = activeBoss.goldReward;
      addGold(reward);
      
      // Apply special reward
      setGameState(prev => {
        let newState = { ...prev };
        if (activeBoss.specialReward.type === 'dpcMult') {
          newState.dpcMult *= activeBoss.specialReward.value;
        } else if (activeBoss.specialReward.type === 'globalDpsMult') {
          newState.globalDpsMult *= activeBoss.specialReward.value;
        } else if (activeBoss.specialReward.type === 'masterLevel') {
          newState.masterLevel += activeBoss.specialReward.value;
        }
        
        newState.bossesDefeated = [...(prev.bossesDefeated || []), activeBoss.id];
        return newState;
      });

      addToast(`${activeBoss.name} defeated! Gained ${fmt(reward)} gold and special power!`, 'success');
      setActiveBoss(null);
      setBossHealth(0);
      setMaxBossHealth(0);
    }
  }, [activeBoss, bossHealth, maxBossHealth, addGold, addToast, fmt]);

  // NEW: Skill challenge functions
  const startSkillChallenge = useCallback((challengeType) => {
    const challenge = SKILL_CHALLENGES.find(c => c.id === challengeType);
    if (!challenge) return;

    setChallengeData({
      ...challenge,
      startTime: Date.now(),
      progress: 0,
      completed: false
    });
    setShowSkillChallenge(true);
  }, []);

  const completeSkillChallenge = useCallback((success) => {
    if (!challengeData) return;

    if (success) {
      addGold(challengeData.goldReward);
      setGameState(prev => ({
        ...prev,
        skillPoints: prev.skillPoints + 1,
        challengesCompleted: [...(prev.challengesCompleted || []), challengeData.id]
      }));
      addToast(`Challenge completed! Gained ${fmt(challengeData.goldReward)} gold and 1 skill point!`, 'success');
    } else {
      const consolationGold = challengeData.goldReward * 0.1;
      addGold(consolationGold);
      addToast(`Challenge failed, but you gained ${fmt(consolationGold)} gold for trying!`, 'warning');
    }

    setShowSkillChallenge(false);
    setChallengeData(null);
  }, [challengeData, addGold, addToast, fmt]);

  // Attack function
  const attack = useCallback((event) => {
    const gain = dpc();
    
    // If boss is active, deal damage to boss instead
    if (activeBoss && bossHealth > 0) {
      attackBoss(gain);
    } else {
      addGold(gain);
    }
    
    setGameState(prev => ({
      ...prev,
      handGold: prev.handGold + gain,
      attacks: prev.attacks + 1
    }));

    // Add floating number at click position
    if (event && event.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const color = activeBoss ? '#ff4444' : '#ffd700';
      addFloatingNumber(x, y, `${activeBoss ? 'DMG: ' : '+'}${fmt(gain)}`, color);
    }

    // Play sound effect
    try {
      const audio = new Audio('/sounds/ding.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (e) {}

    // Check for achievements
    if (gameState.attacks === 0) {
      addToast('Achievement: First Strike!', 'success');
    }
  }, [dpc, addGold, activeBoss, bossHealth, attackBoss, addFloatingNumber, fmt, gameState.attacks, addToast]);

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
        newUnlocks.push(`New weapon unlocked: ${weapon.name}! (+${weapon.dpcMultiplier}x damage)`);
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
  }, [gameState.unlockedWeapons, gameState.unlockedThemes, gameState.unlockedTitles, checkUnlockRequirement, addToast]);

  // Buy artifact
  const buyArtifact = useCallback((artifactIndex, amount) => {
    setGameState(prev => {
      if (!prev.artifacts || !Array.isArray(prev.artifacts) || artifactIndex < 0 || artifactIndex >= prev.artifacts.length) {
        console.error('Invalid artifacts array or index');
        return prev;
      }

      const artifact = prev.artifacts[artifactIndex];
      if (!artifact || typeof artifact.count !== 'number') {
        console.error('Invalid artifact at index', artifactIndex);
        return prev;
      }

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
      if (!prev.upgrades || !Array.isArray(prev.upgrades) || upgradeIndex < 0 || upgradeIndex >= prev.upgrades.length) {
        console.error('Invalid upgrades array or index');
        return prev;
      }

      const upgrade = prev.upgrades[upgradeIndex];
      if (!upgrade || typeof upgrade.cost !== 'number' || upgrade.purchased) {
        console.error('Invalid upgrade at index', upgradeIndex);
        return prev;
      }

      if (prev.gold >= upgrade.cost && !upgrade.purchased) {
        const newUpgrades = [...prev.upgrades];
        newUpgrades[upgradeIndex] = { ...upgrade, purchased: true };

        // Apply upgrade effect
        let newState = {
          ...prev,
          gold: prev.gold - upgrade.cost,
          upgrades: newUpgrades
        };

        // Apply upgrade effects based on ID
        switch (upgrade.id) {
          case 'orb-1':
            newState.multipliers = { ...newState.multipliers, orb: (newState.multipliers.orb || 1) * 2 };
            break;
          case 'tome-1':
            newState.multipliers = { ...newState.multipliers, tome: (newState.multipliers.tome || 1) * 2 };
            break;
          case 'lute-1':
            newState.multipliers = { ...newState.multipliers, lute: (newState.multipliers.lute || 1) * 2 };
            break;
          case 'shield-1':
            newState.multipliers = { ...newState.multipliers, shield: (newState.multipliers.shield || 1) * 2 };
            break;
          case 'chalice-1':
            newState.multipliers = { ...newState.multipliers, chalice: (newState.multipliers.chalice || 1) * 2 };
            break;
          case 'attack-1':
            newState.dpcMult *= 2;
            break;
          case 'attack-2':
            newState.dpcMult *= 5;
            break;
          case 'prestige-1':
            newState.globalDpsMult *= 1.5;
            break;
        }

        addToast(`Purchased: ${upgrade.name}`, 'success');
        return newState;
      }
      return prev;
    });
  }, [addToast]);

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
      artifacts: Array.isArray(prev.artifacts) ? prev.artifacts.map(a => ({ ...a, count: 0 })) : [],
      upgrades: Array.isArray(prev.upgrades) ? prev.upgrades.map(u => ({ ...u, purchased: false })) : [],
      boons: [],
      prestige: prev.prestige + 1,
      prestigePoints: prev.prestigePoints + prestigeGain,
      lifetimeEarnings: prev.lifetimeEarnings + prev.totalGold
    }));
    
    addToast(`Prestige ${gameState.prestige + 1} achieved! +${prestigeGain} prestige points!`, 'success');
  }, [canPrestige, calculatePrestigeGain, gameState.prestige, addToast]);

  // Spawn choice event
  const spawnChoiceEvent = useCallback(() => {
    if (gameState.event.shown) return;
    
    const randomEvent = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)];
    setGameState(prev => ({
      ...prev,
      event: {
        ...prev.event,
        shown: true,
        until: Date.now() + 60000,
        eventText: randomEvent.text,
        choices: randomEvent.choices
      }
    }));
    setShowChoiceEvent(true);
  }, [gameState.event.shown]);

  // Enhanced choice event handler with new event types
  const handleChoiceEvent = useCallback((choiceIndex) => {
    const choice = gameState.event.choices[choiceIndex];
    if (!choice) return;

    const effect = choice.effect;
    
    setGameState(prev => {
      let newState = { ...prev };
      
      switch (effect.type) {
        case 'skillChallenge':
          startSkillChallenge(effect.challengeType);
          break;

        case 'bossEncounter':
          // Find an appropriate boss based on player progress
          const availableBosses = BOSS_ENCOUNTERS.filter(boss => 
            checkUnlockRequirement(boss.requirement) && 
            !gameState.bossesDefeated.includes(boss.id)
          );
          if (availableBosses.length > 0) {
            const randomBoss = availableBosses[Math.floor(Math.random() * availableBosses.length)];
            setTimeout(() => startBossEncounter(randomBoss.id), 500);
          } else {
            const fallbackGold = Math.max(10000, prev.totalGold * 0.2);
            newState.gold += fallbackGold;
            newState.totalGold += fallbackGold;
            addToast(`No worthy opponents found! Gained ${fmt(fallbackGold)} gold instead!`, 'info');
          }
          break;

        case 'cosmicRift':
          const riftRewards = [
            { gold: 0.5, message: '🌟 The rift showered you with cosmic gold!' },
            { dpc: 2.0, message: '⚡ Cosmic energy enhances your power!' },
            { masterLevel: 1, message: '🌌 You gained cosmic understanding!' }
          ];
          const riftReward = riftRewards[Math.floor(Math.random() * riftRewards.length)];
          
          if (riftReward.gold) {
            const cosmicGold = Math.max(20000, prev.totalGold * riftReward.gold);
            newState.gold += cosmicGold;
            newState.totalGold += cosmicGold;
          } else if (riftReward.dpc) {
            newState.dpcMult *= riftReward.dpc;
          } else if (riftReward.masterLevel) {
            newState.masterLevel = (newState.masterLevel || 0) + riftReward.masterLevel;
          }
          addToast(riftReward.message, 'success');
          break;

        case 'carnival':
          const carnivalGames = [
            { type: 'big_win', gold: 0.3, message: '🎪 JACKPOT! You won big at the carnival!' },
            { type: 'skill_point', skill: 1, message: '🎯 Your carnival skills earned you a skill point!' },
            { type: 'small_prize', gold: 0.1, message: '🎈 You won a small carnival prize!' }
          ];
          const carnivalResult = carnivalGames[Math.floor(Math.random() * carnivalGames.length)];
          
          if (carnivalResult.gold) {
            const carnivalGold = Math.max(5000, prev.totalGold * carnivalResult.gold);
            newState.gold += carnivalGold;
            newState.totalGold += carnivalGold;
          } else if (carnivalResult.skill) {
            newState.skillPoints = (newState.skillPoints || 0) + carnivalResult.skill;
          }
          addToast(carnivalResult.message, 'success');
          break;

        case 'energyStorm':
          const stormEffects = [
            { type: 'power_surge', mult: 3, duration: 180000 },
            { type: 'gold_rain', gold: 0.4 },
            { type: 'energy_overload', mult: 1.5, permanent: true }
          ];
          const stormEffect = stormEffects[Math.floor(Math.random() * stormEffects.length)];
          
          if (stormEffect.type === 'power_surge') {
            newState.boons = [...prev.boons, {
              name: 'Energy Storm Surge',
              type: 'dps',
              mult: stormEffect.mult,
              until: Date.now() + stormEffect.duration
            }];
            addToast(`⚡ Energy storm grants ${stormEffect.mult}x DPS for ${stormEffect.duration/1000}s!`, 'success');
          } else if (stormEffect.type === 'gold_rain') {
            const stormGold = Math.max(15000, prev.totalGold * stormEffect.gold);
            newState.gold += stormGold;
            newState.totalGold += stormGold;
            addToast(`💰 Energy storm brings gold rain: ${fmt(stormGold)}!`, 'success');
          } else if (stormEffect.type === 'energy_overload') {
            newState.dpcMult *= stormEffect.mult;
            addToast(`⚡ Permanent energy overload! +50% attack power!`, 'success');
          }
          break;

        case 'luckyWheel':
          const wheelOutcomes = [
            { type: 'gold', amount: 0.5, message: '🎰 JACKPOT! Huge gold bonus!' },
            { type: 'gold', amount: 0.2, message: '🎰 Big win! Gold bonus!' },
            { type: 'gold', amount: 0.1, message: '🎰 Nice! Small gold bonus!' },
            { type: 'dpc', mult: 2, message: '🎰 Amazing! Double click power!' },
            { type: 'boon', mult: 4, duration: 90000, message: '🎰 Incredible! Temporary super boost!' },
            { type: 'nothing', message: '🎰 Almost! Better luck next time!' }
          ];
          const wheelResult = wheelOutcomes[Math.floor(Math.random() * wheelOutcomes.length)];
          
          if (wheelResult.type === 'gold') {
            const wheelGold = Math.max(1000, prev.totalGold * wheelResult.amount);
            newState.gold += wheelGold;
            newState.totalGold += wheelGold;
          } else if (wheelResult.type === 'dpc') {
            newState.dpcMult *= wheelResult.mult;
          } else if (wheelResult.type === 'boon') {
            newState.boons = [...prev.boons, {
              name: 'Lucky Wheel Boost',
              type: 'dps',
              mult: wheelResult.mult,
              until: Date.now() + wheelResult.duration
            }];
          }
          addToast(wheelResult.message, 'success');
          break;

        case 'smallGoldGain':
          const smallGain = Math.max(100, prev.totalGold * effect.amount);
          newState.gold += smallGain;
          newState.totalGold += smallGain;
          addToast(`Found ${fmt(smallGain)} gold!`, 'success');
          break;

        case 'goldGain':
          const gain = Math.max(500, prev.totalGold * effect.amount);
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
            until: Date.now() + effect.duration
          }];
          addToast(`Gained ${randomType.toUpperCase()} x${mult.toFixed(1)} boost for ${effect.duration/1000}s!`, 'success');
          break;

        default:
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
  }, [gameState.event.choices, gameState.bossesDefeated, startSkillChallenge, startBossEncounter, checkUnlockRequirement, addToast, fmt]);

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

  // Save to Firebase with enhanced data
  const saveToFirebase = useCallback(async () => {
    if (!studentData || !updateStudentData || !isLoaded || saveInProgress) {
      return;
    }

    setSaveInProgress(true);
    try {
      const cleanGameState = {
        gold: gameState.gold,
        totalGold: gameState.totalGold,
        handGold: gameState.handGold,
        attacks: gameState.attacks,
        dpcBase: gameState.dpcBase,
        dpcMult: gameState.dpcMult,
        globalDpsMult: gameState.globalDpsMult,
        buyAmount: gameState.buyAmount,
        timePlayed: gameState.timePlayed,
        multipliers: gameState.multipliers,
        artifacts: gameState.artifacts,
        upgrades: gameState.upgrades,
        boons: [],
        unlockedWeapons: gameState.unlockedWeapons,
        activeWeapon: gameState.activeWeapon,
        unlockedThemes: gameState.unlockedThemes,
        activeTheme: gameState.activeTheme,
        unlockedTitles: gameState.unlockedTitles,
        activeTitle: gameState.activeTitle,
        achievements: gameState.achievements,
        prestige: gameState.prestige,
        prestigePoints: gameState.prestigePoints,
        lifetimeEarnings: gameState.lifetimeEarnings,
        musicEnabled: gameState.musicEnabled,
        masterLevel: gameState.masterLevel,
        challengesCompleted: gameState.challengesCompleted,
        bossesDefeated: gameState.bossesDefeated,
        skillPoints: gameState.skillPoints,
        masteries: gameState.masteries,
        lastSave: Date.now(),
        version: '3.0'
      };

      const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
      const currentTheme = THEMES[gameState.activeTheme] || THEMES.default;
      const clickerAchievements = {
        title: gameState.activeTitle,
        prestige: gameState.prestige,
        theme: gameState.activeTheme,
        themeName: currentTheme.name,
        weapon: currentWeapon.name,
        totalGold: gameState.totalGold,
        masterLevel: gameState.masterLevel,
        level: Math.min(Math.floor(gameState.totalGold / 10000) + 1, 100),
        lastPlayed: Date.now()
      };

      await updateStudentData({ 
        clickerGameData: cleanGameState,
        clickerAchievements: clickerAchievements
      });

      console.log('✅ Enhanced clicker game saved successfully to Firebase');
      lastSaveRef.current = Date.now();

    } catch (error) {
      console.error('⚠️ Error saving clicker game to Firebase:', error);
      addToast('Save failed! Please try again.', 'error');
    } finally {
      setSaveInProgress(false);
    }
  }, [gameState, studentData, updateStudentData, isLoaded, saveInProgress, addToast]);

  // Load from Firebase
  const loadFromFirebase = useCallback(() => {
    if (isLoaded) return;

    try {
      console.log('📄 Loading clicker game from Firebase...');
      
      if (!studentData?.clickerGameData) {
        console.log('🎮 No existing game data found, starting new game for student');
        setIsLoaded(true);
        addToast('New adventure begins! Welcome to Hero Forge!', 'success');
        return;
      }
      
      const data = studentData.clickerGameData;

      const loadedState = {
        gold: typeof data.gold === 'number' ? data.gold : 0,
        totalGold: typeof data.totalGold === 'number' ? data.totalGold : 0,
        handGold: typeof data.handGold === 'number' ? data.handGold : 0,
        attacks: typeof data.attacks === 'number' ? data.attacks : 0,
        dpcBase: typeof data.dpcBase === 'number' ? data.dpcBase : 1,
        dpcMult: typeof data.dpcMult === 'number' ? data.dpcMult : 1,
        globalDpsMult: typeof data.globalDpsMult === 'number' ? data.globalDpsMult : 1,
        buyAmount: typeof data.buyAmount === 'number' ? data.buyAmount : 1,
        timePlayed: typeof data.timePlayed === 'number' ? data.timePlayed : 0,
        lastSave: typeof data.lastSave === 'number' ? data.lastSave : Date.now(),
        multipliers: data.multipliers && typeof data.multipliers === 'object' ? data.multipliers : {},
        artifacts: Array.isArray(data.artifacts) ? data.artifacts : gameState.artifacts,
        upgrades: Array.isArray(data.upgrades) ? data.upgrades : gameState.upgrades,
        boons: [],
        unlockedWeapons: Array.isArray(data.unlockedWeapons) ? data.unlockedWeapons : ['1'],
        activeWeapon: typeof data.activeWeapon === 'string' ? data.activeWeapon : '1',
        unlockedThemes: Array.isArray(data.unlockedThemes) ? data.unlockedThemes : ['default'],
        activeTheme: typeof data.activeTheme === 'string' ? data.activeTheme : 'default',
        unlockedTitles: Array.isArray(data.unlockedTitles) ? data.unlockedTitles : ['Novice'],
        activeTitle: typeof data.activeTitle === 'string' ? data.activeTitle : 'Novice',
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        prestige: typeof data.prestige === 'number' ? data.prestige : 0,
        prestigePoints: typeof data.prestigePoints === 'number' ? data.prestigePoints : 0,
        lifetimeEarnings: typeof data.lifetimeEarnings === 'number' ? data.lifetimeEarnings : 0,
        musicEnabled: typeof data.musicEnabled === 'boolean' ? data.musicEnabled : false,
        masterLevel: typeof data.masterLevel === 'number' ? data.masterLevel : 0,
        challengesCompleted: Array.isArray(data.challengesCompleted) ? data.challengesCompleted : [],
        bossesDefeated: Array.isArray(data.bossesDefeated) ? data.bossesDefeated : [],
        skillPoints: typeof data.skillPoints === 'number' ? data.skillPoints : 0,
        masteries: data.masteries && typeof data.masteries === 'object' ? data.masteries : {},
        event: { nextIn: 60 + Math.random() * 120, shown: false, until: 0, choices: [], eventText: '' }
      };

      setGameState(loadedState);
      setSelectedWeapon(loadedState.activeWeapon);
      setSelectedTheme(loadedState.activeTheme);
      
      // Initialize music based on saved preference
      if (loadedState.musicEnabled) {
        setTimeout(() => {
          initializeMusic();
          if (musicRef.current) {
            musicRef.current.play().catch(e => {
              console.log('Auto-play music failed:', e);
            });
          }
        }, 1000);
      }
      
      setIsLoaded(true);

      console.log('✅ Enhanced clicker game loaded successfully from Firebase');
      addToast('Game loaded successfully!', 'success');

    } catch (error) {
      console.error('⚠️ Error loading clicker game from Firebase:', error);
      setIsLoaded(true);
      addToast('Load failed, starting new game!', 'warning');
    }
  }, [studentData, isLoaded, gameState.artifacts, gameState.upgrades, addToast, initializeMusic]);

  // Manual save function
  const manualSave = useCallback(() => {
    saveToFirebase();
    addToast('Game saved!', 'success');
  }, [saveToFirebase, addToast]);

  // Load on component mount
  useEffect(() => {
    if (studentData && !isLoaded) {
      loadFromFirebase();
    }
  }, [studentData, loadFromFirebase, isLoaded]);

  // Auto-save
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveRef.current > 25000) {
        console.log('⏰ Auto-saving enhanced clicker game...');
        saveToFirebase();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, saveToFirebase]);

  // Update event timer
  useEffect(() => {
    if (!showChoiceEvent) return;
    
    const updateTimer = () => {
      const timeLeft = Math.max(0, Math.ceil((gameState.event.until - Date.now()) / 1000));
      setEventTimeLeft(timeLeft);
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(timerInterval);
  }, [showChoiceEvent, gameState.event.until]);

  // Check unlocks
  useEffect(() => {
    if (isLoaded) {
      checkUnlocks();
    }
  }, [checkUnlocks, isLoaded]);

  // Apply selected weapon and theme
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      activeWeapon: selectedWeapon,
      activeTheme: selectedTheme
    }));
  }, [selectedWeapon, selectedTheme]);

  // Game loop
  useEffect(() => {
    if (!isLoaded) return;

    const gameLoop = () => {
      const now = Date.now();
      const dt = Math.min(0.25, (now - (lastUpdateRef.current || now)) / 1000);
      lastUpdateRef.current = now;

      // Update DPS production
      const production = dps() * dt;
      if (production > 0 && isFinite(production)) {
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
        boons: prev.boons.filter(boon => now < boon.until)
      }));

      // Choice event system
      if (!gameState.event.shown) {
        eventAccumRef.current += dt;
        if (eventAccumRef.current >= gameState.event.nextIn) {
          eventAccumRef.current = 0;
          spawnChoiceEvent();
        }
      } else if (now >= gameState.event.until) {
        setGameState(prev => ({
          ...prev,
          event: { ...prev.event, shown: false, nextIn: 60 + Math.random() * 120 }
        }));
        setShowChoiceEvent(false);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [isLoaded, dps, addGold, gameState.event, spawnChoiceEvent]);

  // Show loading screen
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-700">Loading Hero Forge...</h2>
          <p className="text-gray-500 mt-2">Preparing your enhanced adventure!</p>
        </div>
      </div>
    );
  }

  const currentTheme = THEMES[gameState.activeTheme] || THEMES.default;
  const currentWeapon = WEAPONS[gameState.activeWeapon] || WEAPONS['1'];
  const currentTitle = TITLES[gameState.activeTitle] || TITLES['Novice'];
  const prestigeBorder = getPrestigeBorder(gameState.prestige);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bg} p-4 relative transition-all duration-500`}>
      {/* Custom styles */}
      <style jsx>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0px); }
          100% { opacity: 0; transform: translateY(-40px); }
        }
        .float-number { animation: float-up 0.8s ease-out forwards; }
        .prestige-glow { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2); }
        .boss-health-bar {
          background: linear-gradient(90deg, #ff4444 0%, #ff6666 50%, #ff4444 100%);
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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

      {/* Boss Health Bar */}
      {activeBoss && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-black bg-opacity-80 rounded-xl p-4 min-w-96">
          <div className="text-center text-white mb-2">
            <h3 className="text-xl font-bold text-red-400">{activeBoss.name}</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-6 mb-2">
            <div 
              className="boss-health-bar h-6 rounded-full transition-all duration-300"
              style={{ width: `${(bossHealth / maxBossHealth) * 100}%` }}
            ></div>
          </div>
          <div className="text-center text-white text-sm">
            {fmt(bossHealth)} / {fmt(maxBossHealth)} HP
          </div>
        </div>
      )}

      {/* Enhanced Choice Event Modal */}
      {showChoiceEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-lg p-6 border-4 border-yellow-400 ${
            eventTimeLeft <= 10 ? 'animate-pulse' : eventTimeLeft <= 30 ? 'animate-bounce' : ''
          }`}>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <h2 className="text-xl font-bold text-yellow-600">⚡ Adventure Event ⚡</h2>
              </div>
              
              <div className={`mb-4 p-2 rounded-lg border-2 ${
                eventTimeLeft <= 10 
                  ? 'bg-red-100 border-red-400' 
                  : eventTimeLeft <= 30 
                    ? 'bg-orange-100 border-orange-300' 
                    : 'bg-yellow-100 border-yellow-300'
              }`}>
                <div className={`text-sm font-semibold ${
                  eventTimeLeft <= 10 ? 'text-red-700' : eventTimeLeft <= 30 ? 'text-orange-700' : 'text-yellow-700'
                }`}>
                  ⏰ Time remaining: {eventTimeLeft}s {eventTimeLeft <= 10 ? '⚠️' : ''}
                </div>
                <div className={`w-full rounded-full h-2 mt-1 ${
                  eventTimeLeft <= 10 ? 'bg-red-200' : eventTimeLeft <= 30 ? 'bg-orange-200' : 'bg-yellow-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      eventTimeLeft <= 10 ? 'bg-red-500' : eventTimeLeft <= 30 ? 'bg-orange-500' : 'bg-yellow-500'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (eventTimeLeft / 60) * 100))}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200 mb-4">
                <p className="text-gray-700 leading-relaxed font-medium">{gameState.event.eventText}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {gameState.event.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleChoiceEvent(index)}
                  className={`w-full p-4 rounded-lg border-2 border-transparent hover:border-yellow-300 bg-gradient-to-r ${currentTheme.accent} text-white font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-base`}
                >
                  {choice.text}
                </button>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button
                onClick={closeChoiceEvent}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Walk away and ignore the event...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Skill Challenge Modal */}
      {showSkillChallenge && challengeData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className={`${currentTheme.panel} rounded-xl shadow-2xl w-full max-w-md p-6 border-4 border-purple-400`}>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-600 mb-2">🎯 {challengeData.name}</h2>
              <p className="text-gray-700 mb-4">{challengeData.description}</p>
              <div className="text-lg font-semibold text-green-600">
                Reward: {fmt(challengeData.goldReward)} gold + 1 skill point
              </div>
            </div>
            
            <div className="mb-6">
              {challengeData.type === 'timing' && (
                <TimingChallenge 
                  onComplete={completeSkillChallenge}
                  duration={challengeData.duration}
                />
              )}
              {challengeData.type === 'sequence' && (
                <SequenceChallenge 
                  onComplete={completeSkillChallenge}
                  duration={challengeData.duration}
                />
              )}
              {challengeData.type === 'speed' && (
                <SpeedChallenge 
                  onComplete={completeSkillChallenge}
                  duration={challengeData.duration}
                />
              )}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => completeSkillChallenge(false)}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Give up challenge
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Music Button */}
        <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
                ⚔️
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Hero Forge Enhanced
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
                  {gameState.masterLevel > 0 && (
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-bold text-purple-300 bg-purple-300 bg-opacity-20 border-2 border-purple-300 shadow-purple-300/50 shadow-lg">
                      Master Level {gameState.masterLevel} 🌌
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* NEW: Music Toggle Button */}
              <button
                onClick={toggleMusic}
                className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                  gameState.musicEnabled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
                title={gameState.musicEnabled ? 'Turn off music' : 'Turn on music'}
              >
                {gameState.musicEnabled ? '🎵 Music On' : '🔇 Music Off'}
              </button>

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
                onClick={manualSave}
                disabled={saveInProgress}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  saveInProgress 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
              >
                {saveInProgress ? '⏳ Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Enhanced with Master Level display */}
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
                <p className="mt-4 text-gray-600 text-sm">
                  {activeBoss ? `Click to attack ${activeBoss.name}!` : 'Click to attack!'}
                </p>
                <p className="text-sm font-semibold text-purple-600">{currentWeapon.name}</p>
                <p className="text-xs text-green-600 font-semibold">+{currentWeapon.dpcMultiplier}x Damage</p>
              </div>
            </div>

            {/* Enhanced Stats with new metrics */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-6`}>
              <h2 className="text-xl font-bold mb-4">⚡ Combat Stats</h2>
              <div className="space-y-3">
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
                
                {/* NEW: Enhanced progression stats */}
                {gameState.skillPoints > 0 && (
                  <div className="flex justify-between">
                    <span>Skill Points:</span>
                    <span className="font-bold text-purple-600">{gameState.skillPoints}</span>
                  </div>
                )}
                
                {gameState.challengesCompleted && gameState.challengesCompleted.length > 0 && (
                  <div className="flex justify-between">
                    <span>Challenges Won:</span>
                    <span className="font-bold text-blue-600">{gameState.challengesCompleted.length}</span>
                  </div>
                )}
                
                {gameState.bossesDefeated && gameState.bossesDefeated.length > 0 && (
                  <div className="flex justify-between">
                    <span>Bosses Defeated:</span>
                    <span className="font-bold text-red-600">{gameState.bossesDefeated.length}</span>
                  </div>
                )}
                
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

          {/* Right Columns - Enhanced content */}
          <div className="lg:col-span-2 space-y-6">
            {/* PROMINENT GOLD DISPLAY */}
            <div className={`${currentTheme.panel} rounded-xl shadow-lg p-8 border-4 border-yellow-400`}>
              <div className="text-center">
                <div className="text-6xl mb-4">💰</div>
                <div className="text-5xl font-bold text-yellow-600 mb-2">
                  {fmt(Math.floor(gameState.gold))}
                </div>
                <div className="text-xl font-semibold text-yellow-700 bg-yellow-100 px-4 py-2 rounded-full inline-block">
                  GOLD
                </div>
              </div>
            </div>

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
                {(gameState.artifacts && Array.isArray(gameState.artifacts) ? gameState.artifacts : []).map((artifact, index) => {
                  if (!artifact || typeof artifact !== 'object') return null;
                  
                  const cost = costFor(artifact);
                  const canAfford = gameState.gold >= cost;
                  
                  return (
                    <div
                      key={artifact.key || index}
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
                        <h3 className="font-bold text-gray-800">{artifact.name} <span className="text-sm text-gray-600">x{artifact.count || 0}</span></h3>
                        <p className="text-sm text-gray-600">
                          Each: {fmt((artifact.baseDps || 0) * artifactMult(artifact.key))} DPS • Cost: {fmt(cost)}
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
                {(gameState.upgrades && Array.isArray(gameState.upgrades) ? gameState.upgrades : []).filter(upgrade => {
                  if (!upgrade || upgrade.purchased) return false;
                  if (upgrade.req && upgrade.req.key) {
                    const artifact = (gameState.artifacts && Array.isArray(gameState.artifacts)) 
                      ? gameState.artifacts.find(a => a && a.key === upgrade.req.key) 
                      : null;
                    return artifact && (artifact.count || 0) >= (upgrade.req.count || 0);
                  }
                  return true;
                }).map((upgrade, index) => {
                  if (!upgrade) return null;
                  
                  const canAfford = gameState.gold >= (upgrade.cost || 0);
                  const originalIndex = (gameState.upgrades && Array.isArray(gameState.upgrades)) 
                    ? gameState.upgrades.findIndex(u => u && u.id === upgrade.id) 
                    : -1;
                  const isLegendary = (upgrade.cost || 0) >= 1000000000;
                  
                  return (
                    <div
                      key={upgrade.id || index}
                      className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                        canAfford 
                          ? isLegendary 
                            ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 shadow-yellow-200 shadow-lg' 
                            : 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                          : 'border-gray-300 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-bold flex items-center text-gray-800 ${isLegendary ? 'text-yellow-700' : ''}`}>
                          {upgrade.name || 'Unknown Upgrade'}
                          {isLegendary && <span className="ml-2">✨</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{upgrade.desc || 'No description'}</p>
                      </div>
                      <button
                        onClick={() => originalIndex >= 0 && buyUpgrade(originalIndex)}
                        disabled={!canAfford || originalIndex < 0}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          canAfford && originalIndex >= 0
                            ? isLegendary
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:shadow-lg prestige-glow'
                              : `bg-gradient-to-r ${currentTheme.accent} text-white hover:shadow-lg`
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {fmt(upgrade.cost || 0)}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Unlockables Panel with new content */}
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
                  {/* Enhanced Weapons with ultra-rare options */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">⚔️ Legendary Weapons</h3>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {Object.entries(WEAPONS).map(([key, weapon]) => {
                        const unlocked = gameState.unlockedWeapons.includes(key);
                        const requirement = weapon.requirement;
                        const isUltraRare = parseInt(key) >= 18;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 text-center cursor-pointer transition-all ${
                              selectedWeapon === key 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                                : unlocked 
                                  ? isUltraRare
                                    ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-yellow-500 hover:shadow-md'
                                    : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
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
                            <div className={`text-xs font-semibold ${isUltraRare ? 'text-yellow-700' : ''}`}>
                              {weapon.name}
                              {isUltraRare && <span className="ml-1">✨</span>}
                            </div>
                            <div className={`text-xs font-bold ${isUltraRare ? 'text-orange-600' : 'text-green-600'}`}>
                              +{weapon.dpcMultiplier.toLocaleString()}x
                            </div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                                {requirement.type === 'upgrades' && `${requirement.value} upgrades`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                                {requirement.type === 'masterLevel' && `Master Level ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Themes with prestige themes */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🎨 Realm Themes</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(THEMES).map(([key, theme]) => {
                        const unlocked = gameState.unlockedThemes.includes(key);
                        const requirement = theme.requirement;
                        const isPrestigeTheme = ['transcendent', 'omnipotent', 'infinite'].includes(key);
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedTheme === key 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                                : unlocked 
                                  ? isPrestigeTheme
                                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-500 hover:shadow-md'
                                    : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setSelectedTheme(key)}
                          >
                            <div className={`w-full h-6 rounded bg-gradient-to-r ${theme.bg} mb-2 ${isPrestigeTheme ? 'shadow-lg' : ''}`}></div>
                            <div className={`text-sm font-semibold ${isPrestigeTheme ? 'text-purple-700' : ''}`}>
                              {theme.name}
                              {isPrestigeTheme && <span className="ml-1">⭐</span>}
                            </div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'dps' && `${requirement.value} DPS`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                                {requirement.type === 'masterLevel' && `Master Level ${requirement.value}`}
                              </div>
                            )}
                            {unlocked && <div className="text-xs text-green-600 mt-1">Unlocked!</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enhanced Titles with master tiers */}
                  <div>
                    <h3 className="text-lg font-bold mb-4">🏆 Hero Titles</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {Object.entries(TITLES).map(([key, title]) => {
                        const unlocked = gameState.unlockedTitles.includes(key);
                        const requirement = title.requirement;
                        const isMasterTitle = ['Transcendent', 'Omnipotent', 'Cosmic Master', 'Reality Shaper', 'Infinity Lord'].includes(key);
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              gameState.activeTitle === key 
                                ? `border-blue-500 bg-blue-50 ring-2 ring-blue-300` 
                                : unlocked 
                                  ? isMasterTitle
                                    ? 'border-gold-400 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-gold-500 hover:shadow-lg'
                                    : 'border-gray-300 hover:border-gray-400 bg-white hover:shadow-md'
                                  : 'border-gray-200 bg-gray-100 opacity-60'
                            }`}
                            onClick={() => unlocked && setGameState(prev => ({ ...prev, activeTitle: key }))}
                          >
                            <div className={`text-sm font-bold ${title.color} mb-1`}>
                              {key}
                              {isMasterTitle && <span className="ml-1">🌟</span>}
                            </div>
                            <div className={`w-full h-2 rounded ${title.color.replace('text-', 'bg-')} opacity-20 mb-2 ${isMasterTitle ? 'shadow-md' : ''}`}></div>
                            {!unlocked && requirement && (
                              <div className="text-xs text-gray-500 mt-1">
                                {requirement.type === 'totalGold' && `${fmt(requirement.value)} gold`}
                                {requirement.type === 'attacks' && `${requirement.value} attacks`}
                                {requirement.type === 'artifacts' && `${requirement.value} artifacts`}
                                {requirement.type === 'prestige' && `Prestige ${requirement.value}`}
                                {requirement.type === 'masterLevel' && `Master Level ${requirement.value}`}
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

// NEW: Skill Challenge Components

// Timing Challenge Component
const TimingChallenge = ({ onComplete, duration }) => {
  const [indicator, setIndicator] = useState(0);
  const [direction, setDirection] = useState(1);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [hasClicked, setHasClicked] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndicator(prev => {
        const newVal = prev + direction * 2;
        if (newVal >= 100) {
          setDirection(-1);
          return 100;
        }
        if (newVal <= 0) {
          setDirection(1);
          return 0;
        }
        return newVal;
      });
    }, 50);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1 && !hasClicked) {
          onComplete(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [direction, onComplete, hasClicked]);

  const handleClick = () => {
    if (hasClicked) return;
    setHasClicked(true);
    
    const success = indicator >= 40 && indicator <= 60;
    onComplete(success);
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">Click when the indicator is in the green zone!</div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
      </div>
      
      <div className="relative w-full h-8 bg-gray-300 rounded-lg mb-4">
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 rounded-lg"></div>
        <div className="absolute left-[35%] top-0 w-[30%] h-full bg-green-400 rounded-lg"></div>
        <div 
          className="absolute top-0 w-2 h-full bg-blue-600 rounded-lg transition-all duration-100"
          style={{ left: `${indicator}%` }}
        ></div>
      </div>
      
      <button
        onClick={handleClick}
        disabled={hasClicked}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
      >
        {hasClicked ? 'Clicked!' : 'Click Now!'}
      </button>
    </div>
  );
};

// Sequence Challenge Component
const SequenceChallenge = ({ onComplete, duration }) => {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [showingSequence, setShowingSequence] = useState(true);
  const [currentShow, setCurrentShow] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);

  useEffect(() => {
    // Generate random sequence
    const newSequence = [];
    for (let i = 0; i < 5; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);

    // Show sequence
    let showIndex = 0;
    const showInterval = setInterval(() => {
      if (showIndex < newSequence.length) {
        setCurrentShow(newSequence[showIndex]);
        showIndex++;
      } else {
        setShowingSequence(false);
        clearInterval(showInterval);
      }
    }, 800);

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(showInterval);
      clearInterval(timer);
    };
  }, [onComplete]);

  const handleButtonClick = (index) => {
    if (showingSequence) return;

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      onComplete(false);
    } else if (newPlayerSequence.length === sequence.length) {
      onComplete(true);
    }
  };

  const buttons = [
    { color: 'bg-red-500', activeColor: 'bg-red-300' },
    { color: 'bg-blue-500', activeColor: 'bg-blue-300' },
    { color: 'bg-green-500', activeColor: 'bg-green-300' },
    { color: 'bg-yellow-500', activeColor: 'bg-yellow-300' }
  ];

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">
          {showingSequence ? 'Watch the sequence...' : 'Repeat the sequence!'}
        </div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
        <div className="text-sm text-gray-600">Progress: {playerSequence.length}/{sequence.length}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={showingSequence}
            className={`w-20 h-20 rounded-lg font-bold text-white transition-all ${
              showingSequence && currentShow === index 
                ? button.activeColor 
                : button.color
            } ${
              !showingSequence ? 'hover:opacity-80 active:scale-95' : ''
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// Speed Challenge Component
const SpeedChallenge = ({ onComplete, duration }) => {
  const [clicks, setClicks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration / 1000);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          const success = clicks >= 25; // Need 25 clicks in 5 seconds
          onComplete(success);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clicks, onComplete]);

  const handleClick = () => {
    if (isActive) {
      setClicks(prev => prev + 1);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="text-lg font-bold mb-2">Click as fast as you can!</div>
        <div className="text-sm text-gray-600">Time left: {timeLeft}s</div>
        <div className="text-lg font-semibold text-blue-600">Clicks: {clicks}</div>
        <div className="text-sm text-gray-600">Target: 25 clicks</div>
      </div>
      
      <button
        onClick={handleClick}
        disabled={!isActive}
        className="w-32 h-32 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full font-bold text-xl transition-all active:scale-95"
      >
        {isActive ? 'CLICK!' : 'Done!'}
      </button>
      
      <div className="mt-4">
        <div className="w-full bg-gray-300 rounded-full h-4">
          <div 
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (clicks / 25) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ClickerGame;