import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_PETS,
  getAvatarImage
} from '../../utils/gameHelpers';
import { getWeaponById } from '../../utils/weaponData';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const PATH_WIDTH = 104;
const INITIAL_COINS = 750;
const INITIAL_LIVES = 50;
const PROJECTILE_LIFETIME = 3.5;

const PATH_POINTS = [
  { x: 120, y: 96 },
  { x: 1160, y: 96 },
  { x: 1160, y: 240 },
  { x: 360, y: 240 },
  { x: 360, y: 420 },
  { x: 1020, y: 420 },
  { x: 1020, y: 600 },
  { x: 220, y: 600 },
  { x: 220, y: 360 },
  { x: 1140, y: 360 },
  { x: 1140, y: 660 }
];

const ENEMY_TYPES = [
  {
    id: 'spark-orb',
    name: 'Spark Orb',
    sprite: '/Loot/Artifacts/2.png',
    baseHealth: 45,
    healthGrowth: 7,
    baseSpeed: 88,
    speedGrowth: 2.6,
    reward: 14,
    lifeCost: 1,
    radius: 22
  },
  {
    id: 'jade-idol',
    name: 'Jade Idol',
    sprite: '/Loot/Artifacts/8.png',
    baseHealth: 110,
    healthGrowth: 14,
    baseSpeed: 82,
    speedGrowth: 2.4,
    reward: 22,
    lifeCost: 2,
    radius: 24
  },
  {
    id: 'obsidian-ward',
    name: 'Obsidian Ward',
    sprite: '/Loot/Artifacts/15.png',
    baseHealth: 220,
    healthGrowth: 26,
    baseSpeed: 72,
    speedGrowth: 2.15,
    reward: 34,
    lifeCost: 3,
    radius: 26
  },
  {
    id: 'celestial-core',
    name: 'Celestial Core',
    sprite: '/Loot/Artifacts/20.png',
    baseHealth: 360,
    healthGrowth: 44,
    baseSpeed: 64,
    speedGrowth: 1.9,
    reward: 50,
    lifeCost: 4,
    radius: 28
  },
  {
    id: 'void-engine',
    name: 'Void Engine',
    sprite: '/Loot/Artifacts/24.png',
    baseHealth: 520,
    healthGrowth: 60,
    baseSpeed: 60,
    speedGrowth: 1.8,
    reward: 64,
    lifeCost: 5,
    radius: 30
  },
  {
    id: 'astral-colossus',
    name: 'Astral Colossus',
    sprite: '/Loot/Artifacts/28.png',
    baseHealth: 880,
    healthGrowth: 90,
    baseSpeed: 48,
    speedGrowth: 1.6,
    reward: 90,
    lifeCost: 7,
    radius: 34
  }
];

const petCollections = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS];
const findPetAsset = (name) => petCollections.find((pet) => pet.name === name)?.path;
const fallbackWeapon = getWeaponById('1');

const createTowerLibrary = () => {
  const heroDefenders = [
    {
      id: 'starlight-warden',
      category: 'Heroes',
      name: 'Starlight Warden',
      description: 'Astral lances pierce deep into relic ranks with bonus reach.',
      cost: 260,
      range: 240,
      fireRate: 1.35,
      damage: 34,
      projectileSpeed: 480,
      projectileSize: 34,
      splashRadius: 12,
      pierce: 3,
      baseRadius: 36,
      color: '#38bdf8',
      artwork: getAvatarImage('Astronaut', 4),
      artworkType: 'avatar',
      artworkScale: 1.1,
      weapon: getWeaponById('13') || fallbackWeapon,
      tags: ['Piercing', 'Long Range']
    },
    {
      id: 'shadow-duelist',
      category: 'Heroes',
      name: 'Shadow Duelist',
      description: 'Twin glaives lash the lead threats, carving through progressers.',
      cost: 230,
      range: 180,
      fireRate: 2.4,
      damage: 22,
      projectileSpeed: 420,
      projectileSize: 28,
      splashRadius: 0,
      pierce: 1,
      shotCount: 2,
      baseRadius: 34,
      color: '#a855f7',
      artwork: getAvatarImage('Demon Hunter F', 4),
      artworkType: 'avatar',
      weapon: getWeaponById('4') || fallbackWeapon,
      tags: ['Twin Strike', 'High Speed']
    },
    {
      id: 'ember-vanguard',
      category: 'Heroes',
      name: 'Ember Vanguard',
      description: 'Burning spears soften enemies with lingering flames.',
      cost: 280,
      range: 200,
      fireRate: 1.55,
      damage: 36,
      projectileSpeed: 360,
      projectileSize: 36,
      splashRadius: 28,
      pierce: 1,
      burnDamage: 9,
      burnDuration: 2.8,
      baseRadius: 38,
      color: '#f97316',
      artwork: getAvatarImage('Spartan', 4),
      artworkType: 'avatar',
      weapon: getWeaponById('7') || fallbackWeapon,
      tags: ['Splash', 'Burn']
    },
    {
      id: 'chrono-sage',
      category: 'Heroes',
      name: 'Chrono Sage',
      description: 'Time pulses slow relics while precise bolts finish them.',
      cost: 310,
      range: 210,
      fireRate: 1.7,
      damage: 28,
      projectileSpeed: 340,
      projectileSize: 30,
      splashRadius: 0,
      pierce: 2,
      slowAmount: 0.7,
      slowDuration: 1.8,
      baseRadius: 34,
      color: '#38d9a9',
      artwork: getAvatarImage('Terminator', 4),
      artworkType: 'avatar',
      weapon: getWeaponById('14') || fallbackWeapon,
      tags: ['Slow', 'Pierce']
    },
    {
      id: 'storm-channeler',
      category: 'Heroes',
      name: 'Storm Channeler',
      description: 'Chain lightning ricochets through clustered artifacts.',
      cost: 325,
      range: 195,
      fireRate: 1.35,
      damage: 44,
      projectileSpeed: 400,
      projectileSize: 34,
      splashRadius: 0,
      pierce: 1,
      chainCount: 2,
      chainRange: 150,
      chainFalloff: 0.65,
      baseRadius: 36,
      color: '#38bdf8',
      artwork: getAvatarImage('Wizard F', 4),
      artworkType: 'avatar',
      weapon: getWeaponById('9') || fallbackWeapon,
      tags: ['Chain', 'Burst']
    },
    {
      id: 'royal-bulwark',
      category: 'Heroes',
      name: 'Royal Bulwark',
      description: 'Heavy hammer blows stagger elites with immense impact.',
      cost: 360,
      range: 175,
      fireRate: 1,
      damage: 72,
      projectileSpeed: 340,
      projectileSize: 40,
      splashRadius: 24,
      pierce: 1,
      baseRadius: 40,
      color: '#facc15',
      artwork: getAvatarImage('Queen', 4),
      artworkType: 'avatar',
      weapon: getWeaponById('12') || fallbackWeapon,
      tags: ['Impact', 'Elite Killer']
    }
  ];

  const companionDefenders = [
    {
      id: 'aurora-drake',
      category: 'Companions',
      name: 'Aurora Drake',
      description: 'Chromatic fire breath blankets lanes with burning splash.',
      cost: 300,
      range: 190,
      fireRate: 1.25,
      damage: 38,
      projectileSpeed: 360,
      projectileSize: 42,
      splashRadius: 44,
      pierce: 1,
      burnDamage: 12,
      burnDuration: 3.2,
      baseRadius: 38,
      color: '#f472b6',
      artwork: findPetAsset('Dragon Pet'),
      artworkType: 'pet',
      artworkScale: 1.2,
      weapon: getWeaponById('15') || fallbackWeapon,
      tags: ['Burn', 'Splash']
    },
    {
      id: 'crystal-aegis',
      category: 'Companions',
      name: 'Crystal Aegis',
      description: 'Crystalline pulses chill relics caught in its aura.',
      cost: 260,
      range: 0,
      fireRate: 0.85,
      damage: 0,
      projectileSpeed: 0,
      projectileSize: 0,
      splashRadius: 0,
      pierce: 0,
      auraSlowAmount: 0.65,
      auraRadius: 200,
      baseRadius: 36,
      color: '#67e8f9',
      artwork: findPetAsset('Crystal Sage Pet'),
      artworkType: 'pet',
      artworkScale: 1.15,
      tags: ['Aura Slow']
    },
    {
      id: 'thunder-sprites',
      category: 'Companions',
      name: 'Thunder Sprites',
      description: 'Static wisps lash multiple foes with forking bolts.',
      cost: 285,
      range: 205,
      fireRate: 1.6,
      damage: 32,
      projectileSpeed: 460,
      projectileSize: 30,
      splashRadius: 0,
      pierce: 1,
      chainCount: 3,
      chainRange: 170,
      chainFalloff: 0.6,
      baseRadius: 32,
      color: '#60a5fa',
      artwork: findPetAsset('Lightning Pet'),
      artworkType: 'pet',
      weapon: getWeaponById('17') || fallbackWeapon,
      tags: ['Chain', 'Support']
    },
    {
      id: 'red-panda-sentinel',
      category: 'Companions',
      name: 'Red Panda Sentinel',
      description: 'Launches energised lanterns that pierce and slow.',
      cost: 210,
      range: 175,
      fireRate: 2,
      damage: 20,
      projectileSpeed: 380,
      projectileSize: 26,
      splashRadius: 0,
      pierce: 2,
      slowAmount: 0.8,
      slowDuration: 1.4,
      baseRadius: 30,
      color: '#fb7185',
      artwork: findPetAsset('Red Panda Pal'),
      artworkType: 'pet',
      tags: ['Pierce', 'Slow']
    },
    {
      id: 'abyssal-shark',
      category: 'Companions',
      name: 'Abyssal Shark',
      description: 'High velocity torpedoes bite hard into shielded relics.',
      cost: 330,
      range: 220,
      fireRate: 1.1,
      damage: 58,
      projectileSpeed: 520,
      projectileSize: 32,
      splashRadius: 18,
      pierce: 2,
      baseRadius: 34,
      color: '#38bdf8',
      artwork: findPetAsset('Shark Buddy'),
      artworkType: 'pet',
      artworkScale: 1.25,
      weapon: getWeaponById('16') || fallbackWeapon,
      tags: ['Burst', 'Pierce']
    }
  ];

  return [...heroDefenders, ...companionDefenders];
};

const buildSegments = (points) => {
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    const unitX = length === 0 ? 0 : dx / length;
    const unitY = length === 0 ? 0 : dy / length;
    segments.push({ start, end, dx, dy, length, unitX, unitY });
  }
  return segments;
};

const PATH_SEGMENTS = buildSegments(PATH_POINTS);

const distancePointToSegment = (point, segment) => {
  const vx = segment.dx;
  const vy = segment.dy;
  const lenSq = segment.length * segment.length;
  if (lenSq === 0) {
    return Math.hypot(point.x - segment.start.x, point.y - segment.start.y);
  }
  const t = ((point.x - segment.start.x) * vx + (point.y - segment.start.y) * vy) / lenSq;
  const clamped = Math.max(0, Math.min(1, t));
  const projX = segment.start.x + clamped * vx;
  const projY = segment.start.y + clamped * vy;
  return Math.hypot(point.x - projX, point.y - projY);
};

const shallowEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const createWaveSchedule = (wave) => {
  const schedule = [];
  const enemyTiers = Math.min(ENEMY_TYPES.length, Math.max(1, Math.floor((wave + 3) / 2)));
  const availableTypes = ENEMY_TYPES.slice(0, enemyTiers);
  const baseCount = Math.max(12, 10 + wave * 4);
  const spacing = Math.max(0.22, 1.05 - wave * 0.04);
  const eliteInterval = Math.max(2, Math.floor(8 - wave * 0.35));

  for (let i = 0; i < baseCount; i += 1) {
    const tierIndex = Math.min(availableTypes.length - 1, Math.floor(i / eliteInterval));
    schedule.push({
      spawnAt: i * spacing,
      typeId: availableTypes[tierIndex].id
    });
  }

  if (wave % 5 === 0) {
    const boss = availableTypes[availableTypes.length - 1];
    schedule.push({
      spawnAt: baseCount * spacing + 1.2,
      typeId: boss.id
    });
  }

  return schedule;
};

const placeableWithinBounds = (point) => {
  const padding = 80;
  return (
    point.x >= padding &&
    point.x <= GAME_WIDTH - padding &&
    point.y >= padding &&
    point.y <= GAME_HEIGHT - padding
  );
};

const TowerDefenseGame = ({ demoMode = false, storageKeySuffix }) => {
  const canvasRef = useRef(null);
  const assetsRef = useRef({});
  const towerLibrary = useMemo(() => createTowerLibrary(), []);
  const towerMap = useMemo(() => {
    const map = new Map();
    towerLibrary.forEach((tower) => map.set(tower.id, tower));
    return map;
  }, [towerLibrary]);
  const groupedLibrary = useMemo(() => {
    const categories = new Map();
    towerLibrary.forEach((tower) => {
      const key = tower.category || 'Defenders';
      if (!categories.has(key)) {
        categories.set(key, []);
      }
      categories.get(key).push(tower);
    });
    return Array.from(categories.entries()).map(([category, towers]) => ({
      category,
      towers: towers.slice().sort((a, b) => a.cost - b.cost)
    }));
  }, [towerLibrary]);
  const enemyMap = useMemo(() => {
    const map = new Map();
    ENEMY_TYPES.forEach((enemy) => map.set(enemy.id, enemy));
    return map;
  }, []);

  const stateRef = useRef({
    money: INITIAL_COINS,
    lives: INITIAL_LIVES,
    currentWave: 0,
    phase: 'build',
    bestWave: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    spawnQueue: [],
    waveTime: 0,
    nextTowerId: 1,
    nextEnemyId: 1,
    nextProjectileId: 1,
    autoStartDelay: 0,
    demoSetup: false
  });
  const viewCacheRef = useRef(null);

  const [viewState, setViewState] = useState({
    money: INITIAL_COINS,
    lives: INITIAL_LIVES,
    phase: 'build',
    wave: 0,
    bestWave: 0
  });
  const [selectedTowerId, setSelectedTowerId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Select a hero or companion and click the arena to deploy them.');
  const [assetsReady, setAssetsReady] = useState(false);

  const storageKey = storageKeySuffix ? `tower-defense-legends:${storageKeySuffix}` : 'tower-defense-legends';

  const syncView = useCallback(() => {
    const state = stateRef.current;
    const summary = {
      money: Math.round(state.money),
      lives: state.lives,
      phase: state.phase,
      wave: state.currentWave,
      bestWave: state.bestWave
    };
    if (!shallowEqual(viewCacheRef.current, summary)) {
      viewCacheRef.current = summary;
      setViewState(summary);
    }
  }, []);

  const persistBestWave = useCallback((value) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, String(value));
    } catch (error) {
      // ignore storage errors in restricted environments
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      const bestWave = stored ? Number(stored) : 0;
      if (!Number.isNaN(bestWave) && bestWave > 0) {
        stateRef.current.bestWave = bestWave;
        syncView();
      }
    } catch (error) {
      // ignore
    }
  }, [storageKey, syncView]);

  useEffect(() => {
    let cancelled = false;
    const sources = new Set();
    towerLibrary.forEach((tower) => {
      if (tower.artwork) sources.add(tower.artwork);
      if (tower.weapon?.path) sources.add(tower.weapon.path);
    });
    ENEMY_TYPES.forEach((enemy) => sources.add(enemy.sprite));

    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ src, img });
      img.onerror = () => resolve({ src, img: null });
      img.src = src;
    });

    Promise.all(Array.from(sources).map((src) => loadImage(src))).then((results) => {
      if (cancelled) return;
      const assetMap = {};
      results.forEach(({ src, img }) => {
        if (img) assetMap[src] = img;
      });
      assetsRef.current = assetMap;
      setAssetsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [towerLibrary]);

  const resetGame = useCallback(() => {
    const bestWave = stateRef.current.bestWave;
    stateRef.current = {
      money: INITIAL_COINS,
      lives: INITIAL_LIVES,
      currentWave: 0,
      phase: 'build',
      bestWave,
      towers: [],
      enemies: [],
      projectiles: [],
      spawnQueue: [],
      waveTime: 0,
      nextTowerId: 1,
      nextEnemyId: 1,
      nextProjectileId: 1,
      autoStartDelay: 0,
      demoSetup: false
    };
    viewCacheRef.current = null;
    setSelectedTowerId(null);
    setHoverPosition(null);
    setStatusMessage('Select a hero or companion and click the arena to deploy them.');
    syncView();
  }, [demoMode, syncView]);

  useEffect(() => resetGame(), [resetGame]);

  const canPlaceTower = useCallback((towerOption, point) => {
    if (!towerOption || !placeableWithinBounds(point)) return false;

    const distanceToPath = PATH_SEGMENTS.reduce((min, segment) => {
      const distance = distancePointToSegment(point, segment);
      return Math.min(min, distance);
    }, Infinity);

    if (distanceToPath < PATH_WIDTH / 2 + 18) return false;

    const towers = stateRef.current.towers;
    for (let i = 0; i < towers.length; i += 1) {
      const placed = towers[i];
      if (!placed) continue;
      const existing = towerMap.get(placed.typeId);
      const separation = Math.hypot(point.x - placed.x, point.y - placed.y);
      const buffer = (existing?.baseRadius || 30) + towerOption.baseRadius + 16;
      if (separation < buffer) return false;
    }

    return true;
  }, [towerMap]);

  const placeTower = useCallback((towerOption, point) => {
    if (!towerOption) return;
    const state = stateRef.current;
    if (state.money < towerOption.cost) {
      setStatusMessage('Not enough coins for that defender. Clear waves to earn more.');
      return;
    }
    if (!canPlaceTower(towerOption, point)) {
      setStatusMessage('Choose a spot away from the track and other defenders.');
      return;
    }

    state.money -= towerOption.cost;
    state.towers.push({
      id: `tower-${state.nextTowerId}`,
      typeId: towerOption.id,
      x: point.x,
      y: point.y,
      cooldown: 0
    });
    state.nextTowerId += 1;
    syncView();
    setStatusMessage(`${towerOption.name} deployed!`);
  }, [canPlaceTower, syncView]);

  const startWaveInternal = useCallback(() => {
    const state = stateRef.current;
    if (state.phase === 'running' || state.phase === 'gameOver') return false;
    if (state.towers.length === 0) {
      setStatusMessage('Place at least one defender before starting the wave.');
      return false;
    }

    state.phase = 'running';
    state.currentWave += 1;
    state.waveTime = 0;
    state.spawnQueue = createWaveSchedule(state.currentWave);
    state.autoStartDelay = 0;
    setStatusMessage(`Wave ${state.currentWave} has begun!`);
    syncView();
    return true;
  }, [syncView]);

  const handleStartWave = useCallback(() => {
    startWaveInternal();
  }, [startWaveInternal]);

  const handleCanvasClick = useCallback((event) => {
    if (!selectedTowerId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const towerOption = towerMap.get(selectedTowerId);
    placeTower(towerOption, { x, y });
  }, [placeTower, selectedTowerId, towerMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const handleMove = (event) => {
      if (!selectedTowerId) {
        setHoverPosition(null);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;
      setHoverPosition({ x, y });
    };

    const handleLeave = () => {
      setHoverPosition(null);
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('click', handleCanvasClick);
    };
  }, [handleCanvasClick, selectedTowerId]);

  useEffect(() => {
    let messageTimer;
    if (statusMessage) {
      messageTimer = setTimeout(() => {
        setStatusMessage(null);
      }, 3200);
    }
    return () => {
      if (messageTimer) clearTimeout(messageTimer);
    };
  }, [statusMessage]);

  const updateProjectiles = useCallback((dt) => {
    const state = stateRef.current;
    const projectiles = state.projectiles;
    const enemies = state.enemies;

    for (let i = projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = projectiles[i];
      projectile.lifetime -= dt;
      if (projectile.lifetime <= 0) {
        projectiles.splice(i, 1);
        continue;
      }

      const target = enemies.find((enemy) => enemy.id === projectile.targetId);
      if (!target || target.reachedEnd || target.health <= 0) {
        projectiles.splice(i, 1);
        continue;
      }

      const dx = target.x - projectile.x;
      const dy = target.y - projectile.y;
      const distance = Math.hypot(dx, dy);
      const travel = projectile.speed * dt;

      if (distance <= travel + target.radius) {
        target.health -= projectile.damage;
        if (projectile.slowAmount && projectile.slowDuration) {
          target.slowTimer = Math.max(target.slowTimer || 0, projectile.slowDuration);
          target.slowFactor = projectile.slowAmount;
        }
        if (projectile.burnDamage && projectile.burnDuration) {
          target.burnTimer = Math.max(target.burnTimer || 0, projectile.burnDuration);
          target.burnDamage = Math.max(target.burnDamage || 0, projectile.burnDamage);
        }
        if (projectile.splashRadius > 0) {
          for (let j = 0; j < enemies.length; j += 1) {
            const splashTarget = enemies[j];
            if (splashTarget === target || splashTarget.reachedEnd || splashTarget.health <= 0) continue;
            const splashDistance = Math.hypot(projectile.x - splashTarget.x, projectile.y - splashTarget.y);
            if (splashDistance <= projectile.splashRadius + splashTarget.radius) {
              splashTarget.health -= projectile.damage * 0.6;
              if (projectile.burnDamage && projectile.burnDuration) {
                splashTarget.burnTimer = Math.max(splashTarget.burnTimer || 0, projectile.burnDuration * 0.6);
                splashTarget.burnDamage = Math.max(
                  splashTarget.burnDamage || 0,
                  projectile.burnDamage * 0.7
                );
              }
            }
          }
        }
        if (projectile.chainCount && projectile.chainCount > 0) {
          const available = [];
          for (let k = 0; k < enemies.length; k += 1) {
            const chainCandidate = enemies[k];
            if (chainCandidate === target || chainCandidate.reachedEnd || chainCandidate.health <= 0) continue;
            const chainDistance = Math.hypot(chainCandidate.x - projectile.x, chainCandidate.y - projectile.y);
            if (chainDistance <= (projectile.chainRange || 160)) {
              available.push({ enemy: chainCandidate, distance: chainDistance });
            }
          }
          available.sort((a, b) => a.distance - b.distance);
          const forks = Math.min(projectile.chainCount, available.length);
          for (let k = 0; k < forks; k += 1) {
            const fork = available[k];
            state.projectiles.push({
              id: `projectile-${state.nextProjectileId}`,
              targetId: fork.enemy.id,
              x: projectile.x,
              y: projectile.y,
              speed: projectile.speed,
              damage: projectile.damage * (projectile.chainFalloff || 0.65),
              splashRadius: 0,
              pierce: 1,
              color: projectile.color,
              weaponPath: projectile.weaponPath,
              size: projectile.size * 0.85,
              lifetime: PROJECTILE_LIFETIME,
              slowAmount: projectile.slowAmount,
              slowDuration: projectile.slowDuration ? Math.max(projectile.slowDuration * 0.6, 0.35) : undefined,
              burnDamage: projectile.burnDamage ? projectile.burnDamage * 0.75 : undefined,
              burnDuration: projectile.burnDuration ? Math.max(projectile.burnDuration * 0.7, 0.5) : undefined,
              chainCount: 0,
              chainRange: 0,
              chainFalloff: projectile.chainFalloff
            });
            state.nextProjectileId += 1;
          }
          projectile.chainCount = 0;
        }
        projectile.pierce -= 1;
        if (projectile.pierce <= 0) {
          projectiles.splice(i, 1);
        }
        continue;
      }

      if (distance > 0) {
        projectile.x += (dx / distance) * travel;
        projectile.y += (dy / distance) * travel;
      }
    }
  }, []);

  const updateEnemies = useCallback((dt) => {
    const state = stateRef.current;
    const enemies = state.enemies;
    const towers = state.towers;

    for (let i = 0; i < enemies.length; i += 1) {
      const enemy = enemies[i];
      if (enemy.reachedEnd || enemy.health <= 0) continue;

      if (enemy.burnTimer && enemy.burnTimer > 0 && enemy.burnDamage) {
        enemy.burnTimer -= dt;
        enemy.health -= enemy.burnDamage * dt;
        if (enemy.burnTimer <= 0) {
          enemy.burnTimer = 0;
          enemy.burnDamage = 0;
        }
      }

      let speed = enemy.speed;
      if (enemy.slowTimer && enemy.slowTimer > 0) {
        enemy.slowTimer -= dt;
        speed *= enemy.slowFactor || 1;
        if (enemy.slowTimer <= 0) {
          enemy.slowTimer = 0;
          enemy.slowFactor = 1;
        }
      }

      let auraFactor = 1;
      for (let t = 0; t < towers.length; t += 1) {
        const tower = towers[t];
        const option = towerMap.get(tower.typeId);
        if (!option || !option.auraSlowAmount || !option.auraRadius) continue;
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const distance = Math.hypot(dx, dy);
        if (distance <= option.auraRadius) {
          auraFactor = Math.min(auraFactor, option.auraSlowAmount);
        }
      }

      speed *= auraFactor;

      let remaining = speed * dt;
      while (remaining > 0 && !enemy.reachedEnd) {
        const segment = PATH_SEGMENTS[enemy.segmentIndex];
        if (!segment) {
          enemy.reachedEnd = true;
          break;
        }
        const distanceToEnd = segment.length - enemy.distanceOnSegment;
        const travel = Math.min(distanceToEnd, remaining);
        enemy.distanceOnSegment += travel;
        enemy.x = segment.start.x + segment.unitX * enemy.distanceOnSegment;
        enemy.y = segment.start.y + segment.unitY * enemy.distanceOnSegment;
        remaining -= travel;

        if (enemy.distanceOnSegment >= segment.length) {
          enemy.segmentIndex += 1;
          enemy.distanceOnSegment = 0;
          if (enemy.segmentIndex >= PATH_SEGMENTS.length) {
            enemy.reachedEnd = true;
          }
        }
      }
    }
  }, [towerMap]);

  const fireTowers = useCallback((dt) => {
    const state = stateRef.current;
    const towers = state.towers;
    const enemies = state.enemies;

    for (let i = 0; i < towers.length; i += 1) {
      const tower = towers[i];
      const option = towerMap.get(tower.typeId);
      if (!option) continue;

      if (tower.cooldown > 0) {
        tower.cooldown -= dt;
        continue;
      }

      if (!option.range || option.range <= 0 || !option.fireRate || option.fireRate <= 0 || option.damage <= 0) {
        tower.cooldown = 0;
        continue;
      }

      const inRange = [];
      for (let j = 0; j < enemies.length; j += 1) {
        const enemy = enemies[j];
        if (enemy.reachedEnd || enemy.health <= 0) continue;
        const distance = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
        if (distance <= option.range) {
          const progress = enemy.segmentIndex * 10000 + enemy.distanceOnSegment;
          inRange.push({ enemy, distance, progress });
        }
      }

      if (inRange.length === 0) continue;

      inRange.sort((a, b) => b.progress - a.progress || a.distance - b.distance);

      const shots = Math.min(inRange.length, Math.max(1, option.shotCount || 1));
      tower.cooldown = Math.max(0.1, 1 / option.fireRate);

      for (let s = 0; s < shots; s += 1) {
        const targetData = inRange[s];
        const projectileId = `projectile-${state.nextProjectileId}`;
        state.projectiles.push({
          id: projectileId,
          targetId: targetData.enemy.id,
          x: tower.x,
          y: tower.y,
          speed: option.projectileSpeed,
          damage: option.damage,
          splashRadius: option.splashRadius || 0,
          pierce: Math.max(1, option.pierce || 1),
          color: option.color,
          weaponPath: option.weapon?.path,
          size: option.projectileSize || 30,
          lifetime: PROJECTILE_LIFETIME,
          slowAmount: option.slowAmount,
          slowDuration: option.slowDuration,
          burnDamage: option.burnDamage,
          burnDuration: option.burnDuration,
          chainCount: option.chainCount || 0,
          chainRange: option.chainRange || Math.max(option.range * 0.6, 140),
          chainFalloff: option.chainFalloff || 0.7
        });
        state.nextProjectileId += 1;
      }
    }
  }, [towerMap]);

  const resolveCombat = useCallback(() => {
    const state = stateRef.current;
    const enemies = state.enemies;
    let livesLost = 0;
    let coinsEarned = 0;

    for (let i = enemies.length - 1; i >= 0; i -= 1) {
      const enemy = enemies[i];
      if (enemy.reachedEnd) {
        livesLost += enemy.lifeCost;
        enemies.splice(i, 1);
      } else if (enemy.health <= 0) {
        coinsEarned += enemy.reward;
        enemies.splice(i, 1);
      }
    }

    if (livesLost > 0) {
      state.lives = Math.max(0, state.lives - livesLost);
      if (state.lives <= 0) {
        state.phase = 'gameOver';
        state.spawnQueue = [];
        state.projectiles = [];
        setStatusMessage('The realm has fallen! Reset to try again.');
      }
    }

    if (coinsEarned > 0) {
      state.money += coinsEarned;
    }
  }, []);

  const updateLoop = useCallback((dt) => {
    const state = stateRef.current;
    if (state.phase === 'running') {
      state.waveTime += dt;
      while (state.spawnQueue.length > 0 && state.spawnQueue[0].spawnAt <= state.waveTime) {
        const spawn = state.spawnQueue.shift();
        const blueprint = enemyMap.get(spawn.typeId) || ENEMY_TYPES[0];
        const waveScaling = state.currentWave - 1;
        const health = blueprint.baseHealth + blueprint.healthGrowth * waveScaling;
        const speed = blueprint.baseSpeed + blueprint.speedGrowth * waveScaling * 0.12;
        state.enemies.push({
          id: `enemy-${state.nextEnemyId}`,
          typeId: blueprint.id,
          x: PATH_POINTS[0].x,
          y: PATH_POINTS[0].y,
          health,
          maxHealth: health,
          speed,
          reward: Math.round(blueprint.reward * (1 + waveScaling * 0.12)),
          lifeCost: blueprint.lifeCost,
          radius: blueprint.radius,
          sprite: blueprint.sprite,
          segmentIndex: 0,
          distanceOnSegment: 0,
          reachedEnd: false,
          slowTimer: 0,
          slowFactor: 1,
          burnTimer: 0,
          burnDamage: 0
        });
        state.nextEnemyId += 1;
      }
    }

    updateEnemies(dt);
    updateProjectiles(dt);
    fireTowers(dt);
    resolveCombat();

    if (state.phase === 'running' && state.spawnQueue.length === 0 && state.enemies.length === 0) {
      state.phase = 'build';
      const bonus = Math.round(140 + state.currentWave * 25);
      state.money += bonus;
      state.bestWave = Math.max(state.bestWave, state.currentWave);
      persistBestWave(state.bestWave);
      setStatusMessage(`Wave ${state.currentWave} cleared! Bonus ${bonus} coins.`);
      syncView();
      if (demoMode) {
        state.autoStartDelay = 1.6;
      }
    }

    if (demoMode && state.phase === 'build' && state.currentWave > 0 && state.autoStartDelay > 0) {
      state.autoStartDelay -= dt;
      if (state.autoStartDelay <= 0) {
        startWaveInternal();
      }
    }

    syncView();
  }, [demoMode, enemyMap, fireTowers, persistBestWave, resolveCombat, startWaveInternal, syncView, updateEnemies, updateProjectiles]);

  const drawScene = useCallback((ctx) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const backgroundGradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    backgroundGradient.addColorStop(0, '#111827');
    backgroundGradient.addColorStop(0.5, '#0b1120');
    backgroundGradient.addColorStop(1, '#020617');
    ctx.fillStyle = backgroundGradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.save();
    ctx.strokeStyle = 'rgba(94, 234, 212, 0.05)';
    ctx.lineWidth = 1;
    const tile = 80;
    for (let x = 0; x <= GAME_WIDTH; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= GAME_HEIGHT; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_WIDTH, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    const terrainGradient = ctx.createLinearGradient(0, GAME_HEIGHT * 0.45, GAME_WIDTH, GAME_HEIGHT);
    terrainGradient.addColorStop(0, 'rgba(30, 64, 175, 0.08)');
    terrainGradient.addColorStop(1, 'rgba(12, 74, 110, 0.3)');
    ctx.fillStyle = terrainGradient;
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT * 0.7);
    ctx.bezierCurveTo(GAME_WIDTH * 0.18, GAME_HEIGHT * 0.55, GAME_WIDTH * 0.42, GAME_HEIGHT * 0.78, GAME_WIDTH * 0.58, GAME_HEIGHT * 0.66);
    ctx.bezierCurveTo(GAME_WIDTH * 0.74, GAME_HEIGHT * 0.55, GAME_WIDTH * 0.88, GAME_HEIGHT * 0.82, GAME_WIDTH, GAME_HEIGHT * 0.7);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ctx.lineTo(0, GAME_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.lineWidth = PATH_WIDTH + 56;
    ctx.beginPath();
    ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i += 1) {
      ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(30, 41, 59, 0.95)';
    ctx.lineWidth = PATH_WIDTH + 28;
    ctx.beginPath();
    ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i += 1) {
      ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    ctx.stroke();

    const laneGradient = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    laneGradient.addColorStop(0, '#f59e0b');
    laneGradient.addColorStop(0.5, '#d97706');
    laneGradient.addColorStop(1, '#f97316');
    ctx.strokeStyle = laneGradient;
    ctx.lineWidth = PATH_WIDTH;
    ctx.beginPath();
    ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i += 1) {
      ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    ctx.stroke();

    ctx.setLineDash([34, 22]);
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.22)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i += 1) {
      ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.beginPath();
    ctx.arc(PATH_POINTS[0].x, PATH_POINTS[0].y, PATH_WIDTH * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(PATH_POINTS[0].x, PATH_POINTS[0].y, PATH_WIDTH * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(248, 113, 113, 0.4)';
    ctx.beginPath();
    const lastPoint = PATH_POINTS[PATH_POINTS.length - 1];
    ctx.arc(lastPoint.x, lastPoint.y, PATH_WIDTH * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, PATH_WIDTH * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const state = stateRef.current;

    ctx.save();
    state.towers.forEach((tower) => {
      const option = towerMap.get(tower.typeId);
      if (!option || !option.auraSlowAmount || !option.auraRadius) return;
      const auraGradient = ctx.createRadialGradient(
        tower.x,
        tower.y,
        option.baseRadius,
        tower.x,
        tower.y,
        option.auraRadius
      );
      auraGradient.addColorStop(0, `${option.color}55`);
      auraGradient.addColorStop(1, `${option.color}00`);
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, option.auraRadius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    state.towers.forEach((tower) => {
      const option = towerMap.get(tower.typeId);
      if (!option) return;

      ctx.save();
      ctx.shadowColor = `${option.color}66`;
      ctx.shadowBlur = 24;
      ctx.fillStyle = `${option.color}26`;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, option.baseRadius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = `${option.color}55`;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, option.baseRadius, 0, Math.PI * 2);
      ctx.fill();

      const art = option.artwork ? assetsRef.current[option.artwork] : null;
      if (art) {
        if (option.artworkType === 'pet') {
          const baseSize = option.baseRadius * 2;
          const size = baseSize * (option.artworkScale || 1.5);
          ctx.drawImage(art, tower.x - size / 2, tower.y - size / 2, size, size);
        } else {
          const baseSize = option.baseRadius * 2;
          const width = baseSize * (option.artworkScale || 1.9);
          const height = width * 1.25;
          const x = tower.x - width / 2;
          const y = tower.y - height + option.baseRadius * 0.9;
          ctx.drawImage(art, x, y, width, height);
        }
      } else {
        ctx.fillStyle = option.color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, option.baseRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      if (option.weapon?.path) {
        const accent = assetsRef.current[option.weapon.path];
        if (accent) {
          const accentSize = option.baseRadius * 0.9;
          ctx.drawImage(accent, tower.x - accentSize / 2, tower.y - option.baseRadius - accentSize * 0.3, accentSize, accentSize);
        }
      }

      ctx.restore();
    });

    state.enemies.forEach((enemy) => {
      const sprite = assetsRef.current[enemy.sprite];
      const size = enemy.radius * 2.2;
      ctx.save();
      if (enemy.burnTimer && enemy.burnTimer > 0) {
        ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
        ctx.shadowBlur = 22;
      } else if (enemy.slowTimer && enemy.slowTimer > 0) {
        ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        ctx.shadowBlur = 18;
      } else {
        ctx.shadowColor = 'rgba(15, 23, 42, 0.6)';
        ctx.shadowBlur = 12;
      }
      if (sprite) {
        ctx.drawImage(sprite, enemy.x - size / 2, enemy.y - size / 2, size, size);
      } else {
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000000aa';
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 12, enemy.radius * 2, 7);
      ctx.fillStyle = '#22c55e';
      const healthRatio = clamp(enemy.health / enemy.maxHealth, 0, 1);
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 12, enemy.radius * 2 * healthRatio, 7);
      ctx.restore();
    });

    state.projectiles.forEach((projectile) => {
      const weapon = projectile.weaponPath ? assetsRef.current[projectile.weaponPath] : null;
      ctx.save();
      ctx.shadowColor = `${projectile.color || '#fde68a'}55`;
      ctx.shadowBlur = 18;
      if (weapon) {
        ctx.drawImage(weapon, projectile.x - projectile.size / 2, projectile.y - projectile.size / 2, projectile.size, projectile.size);
      } else {
        ctx.fillStyle = projectile.color || '#facc15';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    if (selectedTowerId && hoverPosition) {
      const option = towerMap.get(selectedTowerId);
      if (option) {
        const valid = canPlaceTower(option, hoverPosition);
        ctx.save();
        ctx.strokeStyle = valid ? `${option.color}aa` : '#f87171aa';
        ctx.lineWidth = 3;
        ctx.setLineDash([16, 10]);
        ctx.beginPath();
        ctx.arc(hoverPosition.x, hoverPosition.y, option.range || option.auraRadius || 120, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = valid ? `${option.color}33` : 'rgba(248, 113, 113, 0.25)';
        ctx.beginPath();
        ctx.arc(hoverPosition.x, hoverPosition.y, option.baseRadius + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    if (state.phase === 'gameOver') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 46px "Poppins", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('The relic surge overwhelmed the arena!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 20px "Poppins", sans-serif';
      ctx.fillText('Reset and experiment with new hero & companion synergies.', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 24);
      ctx.textAlign = 'left';
    }
  }, [canPlaceTower, hoverPosition, selectedTowerId, towerMap]);

  useEffect(() => {
    if (!assetsReady) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrame;
    let lastTime = performance.now();

    const render = (timestamp) => {
      const dt = Math.min(0.1, (timestamp - lastTime) / 1000);
      lastTime = timestamp;
      updateLoop(dt);
      drawScene(ctx);
      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);
    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [assetsReady, drawScene, updateLoop]);

  useEffect(() => {
    if (!demoMode || !assetsReady) return;
    const state = stateRef.current;
    if (state.demoSetup) return;

    const presets = [
      { id: 'starlight-warden', x: 280, y: 210 },
      { id: 'ember-vanguard', x: 640, y: 260 },
      { id: 'crystal-aegis', x: 520, y: 420 },
      { id: 'thunder-sprites', x: 920, y: 340 }
    ];

    state.money += 2200;
    presets.forEach((preset) => {
      const tower = towerMap.get(preset.id);
      if (tower) {
        placeTower(tower, { x: preset.x, y: preset.y });
      }
    });
    state.demoSetup = true;
    state.money += 1200;
    startWaveInternal();
  }, [assetsReady, demoMode, placeTower, startWaveInternal, towerMap]);

  const renderTowerCard = (tower) => {
    const isSelected = selectedTowerId === tower.id;
    const portrait = tower.artwork ? assetsRef.current[tower.artwork] : null;
    const weapon = tower.weapon?.path ? assetsRef.current[tower.weapon.path] : null;
    const rangeValue = tower.range && tower.range > 0 ? tower.range : tower.auraRadius || '—';
    const damageValue = tower.damage && tower.damage > 0 ? tower.damage : '—';
    const rateValue =
      tower.damage && tower.damage > 0 && tower.fireRate && tower.fireRate > 0
        ? tower.fireRate.toFixed(2)
        : tower.auraSlowAmount
          ? 'Aura'
          : 'Passive';

    return (
      <button
        key={tower.id}
        type="button"
        onClick={() => setSelectedTowerId((prev) => (prev === tower.id ? null : tower.id))}
        className={`w-full text-left rounded-xl border transition shadow-sm bg-slate-900/70 p-4 ${
          isSelected
            ? 'border-emerald-400/80 hover:border-emerald-300/80 ring-2 ring-emerald-400/80 shadow-emerald-500/30'
            : 'border-slate-800/60 hover:border-cyan-400/70'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border ${
              tower.artworkType === 'pet' ? 'bg-slate-900/60 border-sky-500/40' : 'bg-slate-900/80 border-slate-700/60'
            }`}
          >
            {portrait ? (
              <img src={tower.artwork} alt={tower.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🛡️</div>
            )}
            {tower.artworkType === 'avatar' && weapon ? (
              <img
                src={tower.weapon.path}
                alt="weapon accent"
                className="absolute -bottom-2 -right-2 w-12 h-12 object-contain drop-shadow-lg"
              />
            ) : null}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">{tower.category}</div>
                <div className="text-lg font-semibold text-white">{tower.name}</div>
                <div className="text-xs text-slate-300">Cost: {tower.cost} coins</div>
              </div>
              {tower.artworkType === 'pet' && weapon ? (
                <img src={tower.weapon.path} alt="weapon" className="w-12 h-12 object-contain" />
              ) : null}
            </div>
            <p className="text-xs text-slate-200 leading-snug">{tower.description}</p>
            {tower.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {tower.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide bg-slate-800/70 text-slate-200 border border-slate-700/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div>
                <div className="font-semibold text-white">{rangeValue}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">Reach</div>
              </div>
              <div>
                <div className="font-semibold text-white">{damageValue}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">Damage</div>
              </div>
              <div>
                <div className="font-semibold text-white">{rateValue}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">Tempo</div>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full text-slate-100">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="w-full h-full max-h-[720px] rounded-2xl"
            />
            {!assetsReady ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="text-slate-200 text-sm">Loading defenders and relics…</div>
              </div>
            ) : null}
            <div className="absolute top-4 left-4 flex items-center gap-3 bg-slate-900/70 px-4 py-2 rounded-full border border-slate-700/70">
              <div className="flex items-center gap-2 text-emerald-300 text-sm">
                <span className="text-lg">💰</span>
                <span>{viewState.money} coins</span>
              </div>
              <div className="flex items-center gap-2 text-rose-300 text-sm">
                <span className="text-lg">❤️</span>
                <span>{viewState.lives} lives</span>
              </div>
              <div className="flex items-center gap-2 text-sky-300 text-sm">
                <span className="text-lg">🌊</span>
                <span>{viewState.phase === 'build' ? 'Build Phase' : viewState.phase === 'running' ? 'Wave Active' : 'Game Over'}</span>
              </div>
            </div>
            {statusMessage ? (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-slate-700/60 px-4 py-2 rounded-full text-xs text-slate-200 shadow-lg">
                {statusMessage}
              </div>
            ) : null}
          </div>
        </div>
        <div className="lg:w-1/3 space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-wide text-slate-400">Wave</div>
                <div className="text-2xl font-semibold text-white">{viewState.wave}</div>
              </div>
              <div className="text-right">
                <div className="text-sm uppercase tracking-wide text-slate-400">Best</div>
                <div className="text-2xl font-semibold text-emerald-300">{viewState.bestWave}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleStartWave}
                disabled={viewState.phase !== 'build' || !assetsReady}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                  viewState.phase === 'build' && assetsReady
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Start Next Wave
              </button>
              <button
                type="button"
                onClick={resetGame}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
              >
                Reset Run
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Drag bespoke classroom heroes or standalone companion pets into strategic lanes away from the relic track. Heroes wield avatar art with Hero Forge weapons, while companions bring raw pet energy and battlefield auras to counter enchanted artifacts surging toward the portal.
            </p>
          </div>
          <div className="space-y-5">
            {groupedLibrary.map(({ category, towers }) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm uppercase tracking-wide text-slate-400">{category}</div>
                  <div className="text-[11px] text-slate-500">{towers.length} options</div>
                </div>
                <div className="space-y-3">
                  {towers.map((tower) => renderTowerCard(tower))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerDefenseGame;
