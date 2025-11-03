import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SHOP_BASIC_PETS,
  SHOP_PREMIUM_PETS,
  HALLOWEEN_PETS,
  getAvatarImage
} from '../../utils/gameHelpers';
import { getWeaponById } from '../../utils/weaponData';

const GAME_WIDTH = 900;
const GAME_HEIGHT = 540;
const PATH_WIDTH = 88;
const INITIAL_COINS = 650;
const INITIAL_LIVES = 40;
const PROJECTILE_LIFETIME = 3.25;

const PATH_POINTS = [
  { x: 60, y: 100 },
  { x: 820, y: 100 },
  { x: 820, y: 260 },
  { x: 120, y: 260 },
  { x: 120, y: 420 },
  { x: 860, y: 420 }
];

const ENEMY_TYPES = [
  {
    id: 'spark-orb',
    name: 'Spark Orb',
    sprite: '/Loot/Artifacts/2.png',
    baseHealth: 40,
    healthGrowth: 6,
    baseSpeed: 84,
    speedGrowth: 2.4,
    reward: 14,
    lifeCost: 1,
    radius: 22
  },
  {
    id: 'jade-idol',
    name: 'Jade Idol',
    sprite: '/Loot/Artifacts/8.png',
    baseHealth: 90,
    healthGrowth: 12,
    baseSpeed: 76,
    speedGrowth: 2.2,
    reward: 20,
    lifeCost: 2,
    radius: 24
  },
  {
    id: 'obsidian-ward',
    name: 'Obsidian Ward',
    sprite: '/Loot/Artifacts/15.png',
    baseHealth: 180,
    healthGrowth: 22,
    baseSpeed: 68,
    speedGrowth: 2.1,
    reward: 32,
    lifeCost: 3,
    radius: 26
  },
  {
    id: 'celestial-core',
    name: 'Celestial Core',
    sprite: '/Loot/Artifacts/20.png',
    baseHealth: 320,
    healthGrowth: 40,
    baseSpeed: 58,
    speedGrowth: 1.8,
    reward: 48,
    lifeCost: 5,
    radius: 28
  }
];

const petCollections = [...SHOP_BASIC_PETS, ...SHOP_PREMIUM_PETS, ...HALLOWEEN_PETS];
const findPetAsset = (name) => petCollections.find((pet) => pet.name === name)?.path;
const fallbackWeapon = getWeaponById('1');

const createTowerLibrary = () => [
  {
    id: 'arcane-wizard',
    name: 'Arcane Wizard',
    description: 'Wields celestial orbs that burst into arcane splash damage.',
    cost: 180,
    range: 170,
    fireRate: 1.1,
    damage: 26,
    projectileSpeed: 360,
    projectileSize: 34,
    splashRadius: 44,
    pierce: 1,
    baseRadius: 34,
    avatar: getAvatarImage('Wizard F', 4),
    pet: findPetAsset('Wizard Pet'),
    weapon: getWeaponById('9') || fallbackWeapon,
    color: '#6366f1'
  },
  {
    id: 'sky-ranger',
    name: 'Sky Ranger',
    description: 'Rapid volleys with piercing arrows and wide range.',
    cost: 200,
    range: 210,
    fireRate: 1.8,
    damage: 18,
    projectileSpeed: 420,
    projectileSize: 28,
    splashRadius: 0,
    pierce: 2,
    baseRadius: 32,
    avatar: getAvatarImage('Archer F', 4),
    pet: findPetAsset('Beastmaster Pet'),
    weapon: getWeaponById('5') || fallbackWeapon,
    color: '#f97316'
  },
  {
    id: 'mech-engineer',
    name: 'Mech Engineer',
    description: 'Launches guided gauntlets that slow targets on impact.',
    cost: 240,
    range: 165,
    fireRate: 1.4,
    damage: 32,
    projectileSpeed: 330,
    projectileSize: 36,
    splashRadius: 0,
    pierce: 1,
    slowAmount: 0.78,
    slowDuration: 1.25,
    baseRadius: 36,
    avatar: getAvatarImage('Engineer M', 4),
    pet: findPetAsset('Engineer Pet'),
    weapon: getWeaponById('11') || fallbackWeapon,
    color: '#22d3ee'
  },
  {
    id: 'dragon-rider',
    name: 'Dragon Rider',
    description: 'Unleashes blazing tridents that cleave through relics.',
    cost: 310,
    range: 190,
    fireRate: 1.05,
    damage: 60,
    projectileSpeed: 400,
    projectileSize: 38,
    splashRadius: 32,
    pierce: 2,
    baseRadius: 38,
    avatar: getAvatarImage('Knight F', 4),
    pet: findPetAsset('Dragon Pet'),
    weapon: getWeaponById('15') || fallbackWeapon,
    color: '#ef4444'
  }
];

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
  const enemyTiers = Math.min(ENEMY_TYPES.length, Math.max(1, Math.floor((wave + 2) / 3)));
  const availableTypes = ENEMY_TYPES.slice(0, enemyTiers);
  const baseCount = Math.max(10, 8 + wave * 3);
  const spacing = Math.max(0.35, 1.15 - wave * 0.05);
  const groupSize = Math.max(2, Math.floor(baseCount / availableTypes.length));
  for (let i = 0; i < baseCount; i += 1) {
    let tierIndex = Math.min(availableTypes.length - 1, Math.floor(i / groupSize));
    if (i === baseCount - 1 && availableTypes.length > 1) {
      tierIndex = availableTypes.length - 1;
    }
    schedule.push({
      spawnAt: i * spacing,
      typeId: availableTypes[tierIndex].id
    });
  }
  return schedule;
};

const placeableWithinBounds = (point) => {
  const padding = 50;
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
  const [statusMessage, setStatusMessage] = useState('Select a defender and click the arena to place them.');
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
      if (tower.avatar) sources.add(tower.avatar);
      if (tower.pet) sources.add(tower.pet);
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
    setStatusMessage('Select a defender and click the arena to place them.');
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
        if (projectile.splashRadius > 0) {
          for (let j = 0; j < enemies.length; j += 1) {
            const splashTarget = enemies[j];
            if (splashTarget === target || splashTarget.reachedEnd || splashTarget.health <= 0) continue;
            const splashDistance = Math.hypot(projectile.x - splashTarget.x, projectile.y - splashTarget.y);
            if (splashDistance <= projectile.splashRadius + splashTarget.radius) {
              splashTarget.health -= projectile.damage * 0.6;
            }
          }
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

    for (let i = 0; i < enemies.length; i += 1) {
      const enemy = enemies[i];
      if (enemy.reachedEnd || enemy.health <= 0) continue;

      let speed = enemy.speed;
      if (enemy.slowTimer && enemy.slowTimer > 0) {
        enemy.slowTimer -= dt;
        speed *= enemy.slowFactor || 1;
        if (enemy.slowTimer <= 0) {
          enemy.slowTimer = 0;
          enemy.slowFactor = 1;
        }
      }

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
  }, []);

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

      let chosenEnemy = null;
      let chosenDistance = Infinity;
      for (let j = 0; j < enemies.length; j += 1) {
        const enemy = enemies[j];
        if (enemy.reachedEnd || enemy.health <= 0) continue;
        const distance = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
        if (distance <= option.range && distance < chosenDistance) {
          chosenEnemy = enemy;
          chosenDistance = distance;
        }
      }

      if (!chosenEnemy) continue;

      tower.cooldown = Math.max(0.1, 1 / option.fireRate);

      state.projectiles.push({
        id: `projectile-${state.nextProjectileId}`,
        targetId: chosenEnemy.id,
        x: tower.x,
        y: tower.y,
        speed: option.projectileSpeed,
        damage: option.damage,
        splashRadius: option.splashRadius || 0,
        pierce: option.pierce || 1,
        color: option.color,
        weaponPath: option.weapon?.path,
        size: option.projectileSize || 30,
        lifetime: PROJECTILE_LIFETIME,
        slowAmount: option.slowAmount,
        slowDuration: option.slowDuration
      });
      state.nextProjectileId += 1;
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
          slowFactor: 1
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
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = '#2f2a23';
    ctx.lineWidth = PATH_WIDTH + 26;
    ctx.beginPath();
    ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i += 1) {
      ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = PATH_WIDTH;
    ctx.beginPath();
    ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
    for (let i = 1; i < PATH_POINTS.length; i += 1) {
      ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
    }
    ctx.stroke();

    const state = stateRef.current;

    state.towers.forEach((tower) => {
      const option = towerMap.get(tower.typeId);
      if (!option) return;
      ctx.beginPath();
      ctx.fillStyle = `${option.color}22`;
      ctx.arc(tower.x, tower.y, option.baseRadius + 6, 0, Math.PI * 2);
      ctx.fill();

      const avatar = option.avatar ? assetsRef.current[option.avatar] : null;
      if (avatar) {
        ctx.drawImage(avatar, tower.x - 36, tower.y - 42, 72, 72);
      } else {
        ctx.fillStyle = option.color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, option.baseRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      const pet = option.pet ? assetsRef.current[option.pet] : null;
      if (pet) {
        ctx.drawImage(pet, tower.x + option.baseRadius - 12, tower.y + option.baseRadius - 22, 44, 44);
      }
    });

    state.enemies.forEach((enemy) => {
      const sprite = assetsRef.current[enemy.sprite];
      const size = enemy.radius * 2.1;
      if (sprite) {
        ctx.drawImage(sprite, enemy.x - size / 2, enemy.y - size / 2, size, size);
      } else {
        ctx.fillStyle = '#14b8a6';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#000000aa';
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, enemy.radius * 2, 6);
      ctx.fillStyle = '#22c55e';
      const healthRatio = clamp(enemy.health / enemy.maxHealth, 0, 1);
      ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, enemy.radius * 2 * healthRatio, 6);
    });

    state.projectiles.forEach((projectile) => {
      const weapon = projectile.weaponPath ? assetsRef.current[projectile.weaponPath] : null;
      if (weapon) {
        ctx.drawImage(weapon, projectile.x - projectile.size / 2, projectile.y - projectile.size / 2, projectile.size, projectile.size);
      } else {
        ctx.fillStyle = projectile.color || '#facc15';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (selectedTowerId && hoverPosition) {
      const option = towerMap.get(selectedTowerId);
      if (option) {
        ctx.strokeStyle = `${option.color}55`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(hoverPosition.x, hoverPosition.y, option.range, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (state.phase === 'gameOver') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 42px "Poppins", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Defeat! Reset to rally again.', GAME_WIDTH / 2, GAME_HEIGHT / 2);
      ctx.textAlign = 'left';
    }
  }, [hoverPosition, selectedTowerId, towerMap]);

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
      { id: 'arcane-wizard', x: 210, y: 190 },
      { id: 'sky-ranger', x: 520, y: 140 },
      { id: 'mech-engineer', x: 360, y: 360 },
      { id: 'dragon-rider', x: 660, y: 360 }
    ];

    state.money += 1500;
    presets.forEach((preset) => {
      const tower = towerMap.get(preset.id);
      if (tower) {
        placeTower(tower, { x: preset.x, y: preset.y });
      }
    });
    state.demoSetup = true;
    state.money += 800;
    startWaveInternal();
  }, [assetsReady, demoMode, placeTower, startWaveInternal, towerMap]);

  const renderTowerCard = (tower) => {
    const isSelected = selectedTowerId === tower.id;
    const avatar = tower.avatar ? assetsRef.current[tower.avatar] : null;
    const pet = tower.pet ? assetsRef.current[tower.pet] : null;
    const weapon = tower.weapon?.path ? assetsRef.current[tower.weapon.path] : null;

    return (
      <button
        key={tower.id}
        type="button"
        onClick={() => setSelectedTowerId((prev) => (prev === tower.id ? null : tower.id))}
        className={`w-full text-left rounded-xl border transition shadow-sm bg-slate-800/70 p-4 ${
          isSelected
            ? 'border-emerald-400/80 hover:border-emerald-300/80 ring-2 ring-emerald-400/80 shadow-emerald-500/30'
            : 'border-slate-700/60 hover:border-cyan-400/80'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-900/80 border border-slate-700/60">
            {avatar ? (
              <img src={tower.avatar} alt={tower.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl">🛡️</div>
            )}
            {pet ? (
              <img
                src={tower.pet}
                alt="pet"
                className="absolute -bottom-2 -right-2 w-14 h-14 object-contain drop-shadow-lg"
              />
            ) : null}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold text-white">{tower.name}</div>
                <div className="text-xs text-slate-300">Cost: {tower.cost} coins</div>
              </div>
              {weapon ? (
                <img src={tower.weapon.path} alt="weapon" className="w-10 h-10 object-contain" />
              ) : null}
            </div>
            <p className="text-xs text-slate-200 leading-snug">{tower.description}</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
              <div>
                <div className="font-semibold text-white">{tower.range}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">Range</div>
              </div>
              <div>
                <div className="font-semibold text-white">{tower.damage}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">Damage</div>
              </div>
              <div>
                <div className="font-semibold text-white">{tower.fireRate.toFixed(2)}</div>
                <div className="uppercase tracking-wide text-[10px] text-slate-400">Shots/sec</div>
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
              className="w-full h-full max-h-[540px] rounded-2xl"
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
              Drag your classroom heroes into position away from the relic track. Heroes combine avatars, pets, and Hero Forge weapons to counter enchanted artifacts streaming toward the portal.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wide text-slate-400">Defender Roster</div>
            <div className="space-y-3">
              {towerLibrary.map((tower) => renderTowerCard(tower))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerDefenseGame;
