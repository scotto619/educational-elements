'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, RefreshCw, User, Users, Zap, Shield } from 'lucide-react';
import { database } from '../../../utils/firebase';
import {
  ref, set, update, remove,
  onChildAdded, onChildChanged, onChildRemoved,
  off, onDisconnect,
} from 'firebase/database';

// ─── Constants ────────────────────────────────────────────────────────────────
const WORLD_SIZE    = 4000;
const INITIAL_RADIUS = 30;
const MIN_SPLIT_RADIUS = 60;
const MAX_CELLS      = 8;
const FOOD_COUNT     = 600;
const VIRUS_COUNT    = 20;
const VIRUS_RADIUS   = 80;
const RECOMBINE_MS   = 15000; // ms before split cells can merge
const EJECT_SIZE     = 14;
const SPLIT_SPEED    = 1100;
const NETWORK_RATE   = 100; // ms between Firebase syncs
const LERP_FACTOR    = 0.14; // how fast velocity lerps to target (0=instant, 1=never)

const PASTEL_COLORS = [
  '#FFB7B2','#FFDAC1','#E2F0CB','#B5EAD7',
  '#C7CEEA','#F3D1F4','#FF9AA2','#FFEAA7',
  '#DDA0DD','#98FB98','#87CEEB','#F0E68C',
];

const BOT_NAMES = [
  'Puffy','Bubbles','Mochi','Cloudy','Squishy',
  'Berry','Noodle','Peachy','Sunny','Luna',
  'Cookie','Tofu','Boba','Matcha','Sprout',
];

enum PowerUpType { SPEED = 'SPEED', SHIELD = 'SHIELD', DOUBLE_MASS = 'DOUBLE_MASS' }
const POWERUP_COLORS: Record<string, string> = {
  [PowerUpType.SPEED]: '#FFD700',
  [PowerUpType.SHIELD]: '#00E5FF',
  [PowerUpType.DOUBLE_MASS]: '#FF69B4',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Vec2 { x: number; y: number; }

interface Cell {
  id: string; x: number; y: number;
  radius: number; color: string; name: string;
  vx: number; vy: number;
  faceType: number;
  splitTimer?: number;
  powerUps?: Record<string, number>;
  isBot?: boolean;
}

interface FoodItem { id: string; x: number; y: number; radius: number; color: string; }
interface VirusItem extends FoodItem { isVirus: true; }
interface PowerUpItem extends FoodItem { type: PowerUpType; isPowerUp: true; }
interface EjectedMass extends FoodItem { vx: number; vy: number; ownerId: string; }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; }
interface KillEvent { id: string; eater: string; eaten: string; time: number; }

interface RemotePlayer {
  x: number; y: number;
  targetX: number; targetY: number;
  radius: number; color: string; name: string;
  faceType: number; active: boolean;
}

// ─── Firebase Props ────────────────────────────────────────────────────────
interface FirebaseProps {
  studentData?: any;
  updateStudentData?: (data: any) => Promise<void>;
  showToast?: (msg: string, type?: string) => void;
  classData?: { classCode?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rnd  = (n: number) => Math.random() * n;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const dist2 = (ax: number, ay: number, bx: number, by: number) =>
  Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

function makeCell(name: string, color?: string): Cell {
  return {
    id: Math.random().toString(36).slice(2, 11),
    x: rnd(WORLD_SIZE), y: rnd(WORLD_SIZE),
    radius: INITIAL_RADIUS, color: color ?? PASTEL_COLORS[Math.floor(rnd(PASTEL_COLORS.length))],
    name, vx: 0, vy: 0, faceType: Math.floor(rnd(4)),
  };
}
function makeFood(): FoodItem {
  return { id: Math.random().toString(36).slice(2), x: rnd(WORLD_SIZE), y: rnd(WORLD_SIZE), radius: 5, color: PASTEL_COLORS[Math.floor(rnd(PASTEL_COLORS.length))] };
}
function makeVirus(): VirusItem {
  return { id: Math.random().toString(36).slice(2), x: rnd(WORLD_SIZE), y: rnd(WORLD_SIZE), radius: VIRUS_RADIUS, color: '#44ff44', isVirus: true };
}
function makePowerUp(): PowerUpItem {
  const types = Object.values(PowerUpType);
  const type  = types[Math.floor(rnd(types.length))];
  return { id: Math.random().toString(36).slice(2), x: rnd(WORLD_SIZE), y: rnd(WORLD_SIZE), radius: 18, color: POWERUP_COLORS[type], type, isPowerUp: true };
}
function getSpeed(radius: number) { return 10.0 * Math.pow(radius, -0.45) * 100; }

// ─── Main Component ───────────────────────────────────────────────────────────
export default function KawaiiAgarApp(props: FirebaseProps) {
  const { studentData, showToast, classData } = props;

  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const frameRef   = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const netIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerFirebaseRef = useRef<ReturnType<typeof ref> | null>(null);
  const roomIdRef  = useRef<string | null>(null);

  // ── game world lives in a ref (not state) for perf ──
  const G = useRef({
    playerCells: [] as Cell[],
    bots:        [] as Cell[],
    food:        [] as FoodItem[],
    viruses:     [] as VirusItem[],
    powerUps:    [] as PowerUpItem[],
    ejected:     [] as EjectedMass[],
    particles:   [] as Particle[],
    killFeed:    [] as KillEvent[],
    camera:      { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 } as Vec2,
    zoom:        1,
    mouse:       { x: 0, y: 0 } as Vec2,
    splitTimers: {} as Record<string, number>,
    score:       0,
    remotePlayers: {} as Record<string, RemotePlayer>,
    isMultiplayer: false,
  });

  // ── React UI state ──
  const [phase, setPhase]         = useState<'menu' | 'playing' | 'dead'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [scoreUI, setScoreUI]     = useState(0);
  const [lbUI, setLbUI]           = useState<{ name: string; score: number }[]>([]);
  const [killFeedUI, setKillFeedUI] = useState<KillEvent[]>([]);
  const [multiplayerOn, setMultiplayerOn] = useState(false);

  const isPlayingRef = useRef(false);

  // ── Explosion helper ──
  const explode = useCallback((x: number, y: number, color: string, n = 10) => {
    for (let i = 0; i < n; i++) {
      const a = rnd(Math.PI * 2);
      const s = rnd(250) + 100;
      G.current.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
    }
  }, []);

  // ─── Init ────────────────────────────────────────────────────────────────────
  const initGame = useCallback((name: string, mp: boolean) => {
    const color = PASTEL_COLORS[
      studentData?.firstName
        ? (studentData.firstName.charCodeAt(0) + (studentData.lastName?.charCodeAt(0) ?? 0)) % PASTEL_COLORS.length
        : Math.floor(rnd(PASTEL_COLORS.length))
    ];
    const player = makeCell(name || studentData?.firstName || 'Me', color);

    // Always include bots — fewer in multiplayer to leave room for real players
    const botCount = mp ? 6 : 15;
    const bots = Array.from({ length: botCount }, (_, i) =>
      Object.assign(makeCell(BOT_NAMES[i % BOT_NAMES.length]), { isBot: true })
    );

    G.current = {
      playerCells: [player],
      bots,
      food:        Array.from({ length: FOOD_COUNT }, makeFood),
      viruses:     Array.from({ length: VIRUS_COUNT }, makeVirus),
      powerUps:    Array.from({ length: 6 }, makePowerUp),
      ejected:     [],
      particles:   [],
      killFeed:    [],
      camera:      { x: player.x, y: player.y },
      zoom:        1,
      mouse:       { x: (canvasRef.current?.width ?? 800) / 2, y: (canvasRef.current?.height ?? 500) / 2 },
      splitTimers: {},
      score:       INITIAL_RADIUS,
      remotePlayers: {},
      isMultiplayer: mp,
    };

    isPlayingRef.current = true;
    setScoreUI(INITIAL_RADIUS);
    setPhase('playing');
    lastTimeRef.current = performance.now();
  }, [studentData]);

  // ─── Firebase join ────────────────────────────────────────────────────────────
  const joinMultiplayer = useCallback(async (name: string) => {
    if (!classData?.classCode) {
      showToast?.('No class code found', 'error');
      return;
    }
    const roomId = `kawaii_agar_${classData.classCode.toLowerCase()}`;
    roomIdRef.current = roomId;
    initGame(name, true);

    const color = G.current.playerCells[0]?.color ?? PASTEL_COLORS[0];
    const playerId = studentData?.id ?? `anon_${Date.now()}`;
    const cell = G.current.playerCells[0];

    const pRef = ref(database, `gameRooms/${roomId}/players/${playerId}`);
    playerFirebaseRef.current = pRef;

    // Write room metadata (required by Firebase rules)
    await update(ref(database, `gameRooms/${roomId}`), {
      roomCode: classData.classCode,
      gameType: 'kawaii-agar',
      lastActivity: Date.now(),
    });

    // Write initial player data
    await set(pRef, {
      id: playerId,
      name: name || studentData?.firstName || 'Me',
      x: Math.round(cell.x),
      y: Math.round(cell.y),
      targetX: Math.round(cell.x),
      targetY: Math.round(cell.y),
      radius: cell.radius,
      color,
      faceType: cell.faceType,
      active: true,
      timestamp: Date.now(),
    });

    // Cleanup on disconnect
    onDisconnect(pRef).update({ active: false, radius: 0 });

    // ── Listeners ──
    const playersPath = ref(database, `gameRooms/${roomId}/players`);
    const foodPath    = ref(database, `gameRooms/${roomId}/food`);

    onChildAdded(playersPath, snap => {
      if (!snap.exists()) return;
      const p = snap.val();
      if (p.id === playerId || !p.active) return;
      G.current.remotePlayers[snap.key!] = { ...p, targetX: p.x, targetY: p.y };
    });

    onChildChanged(playersPath, snap => {
      if (!snap.exists()) return;
      const p = snap.val();
      if (p.id === playerId) {
        if (!p.active) { handleDeath(); }
        return;
      }
      const existing = G.current.remotePlayers[snap.key!];
      if (p.active) {
        if (existing) {
          existing.targetX = p.x;
          existing.targetY = p.y;
          existing.radius  = p.radius;
          existing.name    = p.name;
          existing.color   = p.color;
          // Snap if very far behind
          if (dist2(existing.x, existing.y, p.x, p.y) > 200) {
            existing.x = p.x; existing.y = p.y;
          }
        } else {
          G.current.remotePlayers[snap.key!] = { ...p, targetX: p.x, targetY: p.y };
        }
      } else {
        delete G.current.remotePlayers[snap.key!];
      }
    });

    onChildRemoved(playersPath, snap => { delete G.current.remotePlayers[snap.key!]; });

    onChildAdded(foodPath, snap => {
      if (snap.exists()) {
        const f = snap.val();
        if (!G.current.food.find(x => x.id === f.id)) G.current.food.push(f);
      }
    });
    onChildRemoved(foodPath, snap => {
      G.current.food = G.current.food.filter(f => f.id !== snap.key);
    });

    // Seed initial food if room is sparse
    setTimeout(() => seedFoodIfNeeded(roomId), 1000);

    // Network sync interval
    netIntervalRef.current = setInterval(() => syncToFirebase(playerId, roomId), NETWORK_RATE);
    showToast?.('Joined the arena! 🎮', 'success');
  }, [classData, studentData, showToast]);

  const syncToFirebase = useCallback((playerId: string, roomId: string) => {
    const pRef = playerFirebaseRef.current;
    if (!pRef || !isPlayingRef.current) return;
    const cell = G.current.playerCells[0];
    if (!cell) return;
    update(pRef, {
      x: Math.round(cell.x),
      y: Math.round(cell.y),
      targetX: Math.round(cell.x),
      targetY: Math.round(cell.y),
      radius: Math.round(cell.radius * 10) / 10,
      timestamp: Date.now(),
    }).catch(() => {});

    // Occasionally spawn food
    if (Math.random() < 0.3 && G.current.food.length < FOOD_COUNT) {
      const food = makeFood();
      set(ref(database, `gameRooms/${roomId}/food/${food.id}`), food).catch(() => {});
    }
  }, []);

  const seedFoodIfNeeded = async (roomId: string) => {
    if (G.current.food.length < 100) {
      const updates: Record<string, any> = {};
      for (let i = 0; i < 150; i++) {
        const f = makeFood();
        updates[f.id] = f;
      }
      update(ref(database, `gameRooms/${roomId}/food`), updates).catch(() => {});
    }
  };

  const leaveMultiplayer = useCallback(() => {
    if (netIntervalRef.current) clearInterval(netIntervalRef.current);
    if (playerFirebaseRef.current) update(playerFirebaseRef.current, { active: false, radius: 0 }).catch(() => {});
    const roomId = roomIdRef.current;
    if (roomId) {
      off(ref(database, `gameRooms/${roomId}/players`));
      off(ref(database, `gameRooms/${roomId}/food`));
    }
    playerFirebaseRef.current = null;
    roomIdRef.current = null;
  }, []);

  const handleDeath = useCallback(() => {
    isPlayingRef.current = false;
    setPhase('dead');
    if (G.current.isMultiplayer) leaveMultiplayer();
  }, [leaveMultiplayer]);

  // ─── Input handlers ───────────────────────────────────────────────────────────
  useEffect(() => {
    const toCanvasCoords = (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: clientX, y: clientY };
      const rect = canvas.getBoundingClientRect();
      // Scale from CSS pixels → canvas pixel space (canvas may be stretched by CSS)
      const scaleX = canvas.width  / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top)  * scaleY,
      };
    };

    const onMouseMove = (e: MouseEvent) => {
      G.current.mouse = toCanvasCoords(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      G.current.mouse = toCanvasCoords(t.clientX, t.clientY);
    };

    const onKey = (e: KeyboardEvent) => {
      if (!isPlayingRef.current) return;
      const state = G.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const worldMouse = {
        x: state.camera.x + (state.mouse.x - canvas.width / 2) / state.zoom,
        y: state.camera.y + (state.mouse.y - canvas.height / 2) / state.zoom,
      };

      if (e.code === 'Space') {
        e.preventDefault();
        const newCells: Cell[] = [];
        state.playerCells.forEach(cell => {
          if (state.playerCells.length + newCells.length >= MAX_CELLS) return;
          if (cell.radius < MIN_SPLIT_RADIUS) return;
          const dx = worldMouse.x - cell.x, dy = worldMouse.y - cell.y;
          const angle = Math.atan2(dy, dx);
          const newR = cell.radius / Math.SQRT2;
          cell.radius = newR;
          const now = Date.now();
          state.splitTimers[cell.id] = now;
          const nc: Cell = {
            ...cell, id: Math.random().toString(36).slice(2),
            radius: newR, vx: Math.cos(angle) * SPLIT_SPEED, vy: Math.sin(angle) * SPLIT_SPEED,
          };
          state.splitTimers[nc.id] = now;
          newCells.push(nc);
        });
        state.playerCells.push(...newCells);
      } else if (e.code === 'KeyW') {
        const worldMouseW = {
          x: state.camera.x + (state.mouse.x - canvas.width / 2) / state.zoom,
          y: state.camera.y + (state.mouse.y - canvas.height / 2) / state.zoom,
        };
        state.playerCells.forEach(cell => {
          if (cell.radius > 35) {
            const dx = worldMouseW.x - cell.x, dy = worldMouseW.y - cell.y;
            const angle = Math.atan2(dy, dx);
            const mass: EjectedMass = {
              id: Math.random().toString(36).slice(2),
              x: cell.x + Math.cos(angle) * cell.radius * 1.1,
              y: cell.y + Math.sin(angle) * cell.radius * 1.1,
              radius: EJECT_SIZE, color: cell.color,
              vx: Math.cos(angle) * 800, vy: Math.sin(angle) * 800,
              ownerId: cell.id,
            };
            state.ejected.push(mass);
            cell.radius = Math.sqrt(cell.radius ** 2 - EJECT_SIZE ** 2);
          }
        });
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  // ─── Canvas resize ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        const el = canvasRef.current.parentElement;
        canvasRef.current.width  = el?.clientWidth  ?? window.innerWidth;
        canvasRef.current.height = el?.clientHeight ?? window.innerHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ─── Game loop ────────────────────────────────────────────────────────────────
  const gameLoop = useCallback((time: number) => {
    frameRef.current = requestAnimationFrame(gameLoop);

    if (!isPlayingRef.current) return;
    const dt  = Math.min(0.05, (time - lastTimeRef.current) / 1000);
    lastTimeRef.current = time;

    const state = G.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    if (!ctx)   return;
    const now   = Date.now();
    const W     = canvas.width, H = canvas.height;

    // ── 1. UPDATE ────────────────────────────────────────────────────────────────
    const mouseDx = state.mouse.x - W / 2;
    const mouseDy = state.mouse.y - H / 2;
    const mouseAngle = Math.atan2(mouseDy, mouseDx);
    const mouseDist  = Math.sqrt(mouseDx ** 2 + mouseDy ** 2);

    let avgX = 0, avgY = 0, totalR = 0;

    state.playerCells.forEach(cell => {
      const hasMomentum = Math.abs(cell.vx) > 20 || Math.abs(cell.vy) > 20;
      if (hasMomentum) {
        // Momentum phase (after split / eject) — decelerate gradually
        cell.x += cell.vx * dt;
        cell.y += cell.vy * dt;
        cell.vx *= 0.93;
        cell.vy *= 0.93;
      } else {
        // Normal movement — LERP velocity toward target velocity (fixes jerkiness)
        if (mouseDist > 10) {
          const speedMult = cell.powerUps?.[PowerUpType.SPEED] && cell.powerUps[PowerUpType.SPEED] > now ? 2 : 1;
          const speed = getSpeed(cell.radius) * speedMult;
          const targetVx = Math.cos(mouseAngle) * speed;
          const targetVy = Math.sin(mouseAngle) * speed;
          cell.vx += (targetVx - cell.vx) * LERP_FACTOR;
          cell.vy += (targetVy - cell.vy) * LERP_FACTOR;
        } else {
          cell.vx += (0 - cell.vx) * LERP_FACTOR;
          cell.vy += (0 - cell.vy) * LERP_FACTOR;
        }
        cell.x += cell.vx * dt;
        cell.y += cell.vy * dt;
      }
      cell.x = clamp(cell.x, cell.radius, WORLD_SIZE - cell.radius);
      cell.y = clamp(cell.y, cell.radius, WORLD_SIZE - cell.radius);
      avgX += cell.x * cell.radius;
      avgY += cell.y * cell.radius;
      totalR += cell.radius;
    });

    // Camera follow
    if (state.playerCells.length > 0) {
      const cx = avgX / totalR, cy = avgY / totalR;
      state.camera.x += (cx - state.camera.x) * 0.1;
      state.camera.y += (cy - state.camera.y) * 0.1;
      const maxR = Math.max(...state.playerCells.map(c => c.radius));
      const targetZoom = clamp(1 / (maxR / 90 + 0.8), 0.15, 1);
      state.zoom += (targetZoom - state.zoom) * 0.05;
    }

    // Remote player interpolation
    Object.values(state.remotePlayers).forEach(rp => {
      rp.x += (rp.targetX - rp.x) * 0.15;
      rp.y += (rp.targetY - rp.y) * 0.15;
    });

    // Bots (single-player only)
    state.bots.forEach(bot => {
      let target: Vec2 = { x: bot.x, y: bot.y };
      let nearDist = Infinity;
      // Avoid larger players
      let danger: Vec2 | null = null;
      const allCells = [...state.playerCells, ...state.bots].filter(c => c.id !== bot.id);
      for (const other of allCells) {
        const d = dist2(bot.x, bot.y, other.x, other.y);
        if (other.radius > bot.radius * 1.1 && d < bot.radius * 5) { danger = { x: bot.x * 2 - other.x, y: bot.y * 2 - other.y }; break; }
      }
      if (danger) { target = danger; }
      else {
        for (const f of state.food) {
          const d = dist2(bot.x, bot.y, f.x, f.y);
          if (d < nearDist) { nearDist = d; target = { x: f.x, y: f.y }; }
        }
        for (const other of allCells) {
          if (other.radius < bot.radius * 0.9) {
            const d = dist2(bot.x, bot.y, other.x, other.y);
            if (d < bot.radius * 10 && d < nearDist) { nearDist = d; target = { x: other.x, y: other.y }; }
          }
        }
      }
      // Lerp bot velocity — capped at 60% of player speed so bots feel fair
      const bdx = target.x - bot.x, bdy = target.y - bot.y;
      const bdist = Math.sqrt(bdx ** 2 + bdy ** 2);
      if (bdist > 1) {
        const bs = getSpeed(bot.radius) * 0.60;
        const tvx = (bdx / bdist) * bs, tvy = (bdy / bdist) * bs;
        bot.vx += (tvx - bot.vx) * LERP_FACTOR;
        bot.vy += (tvy - bot.vy) * LERP_FACTOR;
      }
      bot.x = clamp(bot.x + bot.vx * dt, bot.radius, WORLD_SIZE - bot.radius);
      bot.y = clamp(bot.y + bot.vy * dt, bot.radius, WORLD_SIZE - bot.radius);
    });

    // Ejected mass physics
    state.ejected = state.ejected.filter(m => {
      m.x += m.vx * dt; m.y += m.vy * dt;
      m.vx *= 0.88; m.vy *= 0.88;
      m.x = clamp(m.x, m.radius, WORLD_SIZE - m.radius);
      m.y = clamp(m.y, m.radius, WORLD_SIZE - m.radius);
      return Math.abs(m.vx) > 0.5 || Math.abs(m.vy) > 0.5;
    });

    // Particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 2.5; return p.life > 0;
    });

    // Collisions: food
    const allActiveCells = [...state.playerCells, ...state.bots];
    state.food = state.food.filter(f => {
      for (const cell of allActiveCells) {
        if (dist2(cell.x, cell.y, f.x, f.y) < cell.radius) {
          const mult = (cell.powerUps?.[PowerUpType.DOUBLE_MASS] ?? 0) > now ? 2 : 1;
          cell.radius = Math.sqrt(cell.radius ** 2 + f.radius ** 2 * mult);
          if (state.isMultiplayer && !cell.isBot) {
            remove(ref(database, `gameRooms/${roomIdRef.current}/food/${f.id}`)).catch(() => {});
          }
          return false;
        }
      }
      return true;
    });

    state.ejected = state.ejected.filter(m => {
      for (const cell of allActiveCells) {
        if (cell.id !== m.ownerId && dist2(cell.x, cell.y, m.x, m.y) < cell.radius) {
          cell.radius = Math.sqrt(cell.radius ** 2 + m.radius ** 2);
          return false;
        }
      }
      return true;
    });

    state.powerUps = state.powerUps.filter(p => {
      for (const cell of allActiveCells) {
        if (dist2(cell.x, cell.y, p.x, p.y) < cell.radius + p.radius) {
          if (!cell.powerUps) cell.powerUps = {};
          cell.powerUps[p.type] = now + 10000;
          explode(p.x, p.y, p.color, 20);
          return false;
        }
      }
      return true;
    });

    // Replenish food / powerups (single player only)
    if (!state.isMultiplayer) {
      while (state.food.length < FOOD_COUNT) state.food.push(makeFood());
    }
    while (state.powerUps.length < 6) state.powerUps.push(makePowerUp());

    // Virus collisions
    const virusSplits: Cell[] = [];
    state.viruses = state.viruses.filter(v => {
      for (const cell of allActiveCells) {
        if (cell.radius > v.radius * 1.1 && dist2(cell.x, cell.y, v.x, v.y) < cell.radius + v.radius) {
          if ((cell.powerUps?.[PowerUpType.SHIELD] ?? 0) > now) return true;
          const splits = Math.min(6, MAX_CELLS - (!cell.isBot ? state.playerCells.length : 0));
          if (splits > 1) {
            const newR = cell.radius / Math.sqrt(splits);
            cell.radius = newR;
            for (let i = 0; i < splits - 1; i++) {
              const a = rnd(Math.PI * 2);
              virusSplits.push({ ...cell, id: Math.random().toString(36).slice(2), radius: newR, vx: Math.cos(a) * 600, vy: Math.sin(a) * 600 });
            }
          }
          return false;
        }
      }
      return true;
    });
    virusSplits.forEach(c => { if (!c.isBot) state.playerCells.push(c); else state.bots.push(c); });
    while (state.viruses.length < VIRUS_COUNT) state.viruses.push(makeVirus());

    // Player cell merging
    const cellsToRemove = new Set<string>();
    if (state.playerCells.length > 1) {
      for (let i = 0; i < state.playerCells.length; i++) {
        for (let j = i + 1; j < state.playerCells.length; j++) {
          const c1 = state.playerCells[i], c2 = state.playerCells[j];
          if (cellsToRemove.has(c1.id) || cellsToRemove.has(c2.id)) continue;
          const t1 = state.splitTimers[c1.id] ?? 0, t2 = state.splitTimers[c2.id] ?? 0;
          const canMerge = now - t1 > RECOMBINE_MS && now - t2 > RECOMBINE_MS;
          const d = dist2(c1.x, c1.y, c2.x, c2.y);
          if (canMerge && d < c1.radius + c2.radius) {
            c1.radius = Math.sqrt(c1.radius ** 2 + c2.radius ** 2);
            cellsToRemove.add(c2.id);
          } else if (d < c1.radius + c2.radius) {
            const angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);
            const overlap = c1.radius + c2.radius - d;
            c1.x -= Math.cos(angle) * overlap * 0.5;
            c1.y -= Math.sin(angle) * overlap * 0.5;
            c2.x += Math.cos(angle) * overlap * 0.5;
            c2.y += Math.sin(angle) * overlap * 0.5;
          }
        }
      }
    }

    // Cell vs cell eating
    for (const eater of allActiveCells) {
      if (cellsToRemove.has(eater.id)) continue;
      for (const eaten of allActiveCells) {
        if (eater.id === eaten.id || cellsToRemove.has(eaten.id)) continue;
        if (eater.isBot && eaten.isBot) continue;
        if (!eater.isBot && !eaten.isBot && eater.name === eaten.name) continue; // same player's split cells handled above
        if (eater.radius > eaten.radius * 1.1 && dist2(eater.x, eater.y, eaten.x, eaten.y) < eater.radius - eaten.radius * 0.5) {
          if ((eaten.powerUps?.[PowerUpType.SHIELD] ?? 0) > now) continue;
          eater.radius = Math.sqrt(eater.radius ** 2 + eaten.radius ** 2);
          cellsToRemove.add(eaten.id);
          explode(eaten.x, eaten.y, eaten.color, 12);
          state.killFeed.push({ id: Math.random().toString(36), eater: eater.name, eaten: eaten.name, time: now });
          // If a remote player "eats" our local cell — trigger death
          if (!eaten.isBot && eater.isBot) {
            // handled below by checking playerCells length
          }
        }
      }
    }

    // Multiplayer: check if remote player ate us (compare size reduction)
    if (state.isMultiplayer) {
      const localRadius = state.playerCells[0]?.radius ?? 0;
      Object.values(state.remotePlayers).forEach(rp => {
        if (rp.radius > localRadius * 1.1 && dist2(rp.x, rp.y, state.playerCells[0]?.x ?? 9999, state.playerCells[0]?.y ?? 9999) < rp.radius) {
          cellsToRemove.add(state.playerCells[0]?.id ?? '');
        }
      });
    }

    state.playerCells = state.playerCells.filter(c => !cellsToRemove.has(c.id));
    state.bots = state.bots.filter(c => !cellsToRemove.has(c.id));
    state.score = Math.floor(state.playerCells.reduce((a, c) => a + c.radius, 0));

    const targetBotCount = state.isMultiplayer ? 6 : 15;
    while (state.bots.length < targetBotCount) {
      state.bots.push(Object.assign(makeCell(BOT_NAMES[Math.floor(rnd(BOT_NAMES.length))]), { isBot: true }));
    }

    if (state.playerCells.length === 0) { handleDeath(); return; }

    // ── 2. RENDER ─────────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(-state.camera.x, -state.camera.y);

    // Grid
    ctx.strokeStyle = 'rgba(200,180,200,0.25)';
    ctx.lineWidth = 1;
    const gs = 100;
    for (let x = 0; x <= WORLD_SIZE; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, WORLD_SIZE); ctx.stroke(); }
    for (let y = 0; y <= WORLD_SIZE; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WORLD_SIZE, y); ctx.stroke(); }

    // Border
    ctx.strokeStyle = '#ffb7c5';
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Food
    state.food.forEach(f => {
      ctx.fillStyle = f.color;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2); ctx.fill();
    });

    // Ejected mass
    state.ejected.forEach(m => {
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2); ctx.fill();
    });

    // Power-ups
    state.powerUps.forEach(p => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(now / 600);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 12; ctx.shadowColor = p.color;
      ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.font = `bold ${p.radius}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.type === PowerUpType.SPEED ? '⚡' : p.type === PowerUpType.SHIELD ? '🛡' : '2×', 0, 0);
      ctx.restore();
    });

    // Viruses
    state.viruses.forEach(v => {
      ctx.save(); ctx.translate(v.x, v.y);
      ctx.fillStyle = '#66ff66'; ctx.strokeStyle = '#33cc33'; ctx.lineWidth = 4;
      ctx.beginPath();
      const spikes = 24;
      for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? v.radius : v.radius * 0.82;
        const a = (i / spikes) * Math.PI;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    });

    // Particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    // All cells (sorted by radius so big overlap small)
    const drawCells: (Cell | (RemotePlayer & { isRemote?: boolean }))[] = [
      ...state.bots,
      ...Object.values(state.remotePlayers).map(rp => ({ ...rp, isRemote: true })),
      ...state.playerCells,
    ].sort((a, b) => a.radius - b.radius);

    drawCells.forEach((cellRaw: any) => {
      const cell = cellRaw;
      ctx.save();
      ctx.translate(cell.x, cell.y);

      // Body
      const grad = ctx.createRadialGradient(-cell.radius * 0.2, -cell.radius * 0.2, 0, 0, 0, cell.radius);
      grad.addColorStop(0, cell.color);
      grad.addColorStop(1, cell.color + 'AA');
      ctx.fillStyle = grad;
      ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.beginPath(); ctx.arc(0, 0, cell.radius, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // Local player outline
      if (!cell.isBot && !cell.isRemote) {
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, cell.radius + 2, 0, Math.PI * 2); ctx.stroke();
      }

      // Power-up rings
      if (cell.powerUps?.[PowerUpType.SHIELD] > now) {
        ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(0, 0, cell.radius + 6, 0, Math.PI * 2); ctx.stroke();
      }
      if (cell.powerUps?.[PowerUpType.SPEED] > now) {
        ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.arc(0, 0, cell.radius + 10, now / 120, now / 120 + Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, cell.radius, 0, Math.PI * 2); ctx.stroke();

      // Kawaii face
      const es = cell.radius * 0.15;
      const eo = cell.radius * 0.28;
      const ms = cell.radius * 0.2;
      const ft = cell.faceType ?? 0;

      // Blush
      ctx.fillStyle = 'rgba(255,182,193,0.4)';
      ctx.beginPath(); ctx.arc(-eo * 1.3, eo * 0.1, es * 0.9, 0, Math.PI * 2);
      ctx.arc( eo * 1.3, eo * 0.1, es * 0.9, 0, Math.PI * 2); ctx.fill();

      // Eyes white
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-eo, -eo * 0.5, es, 0, Math.PI * 2);
      ctx.arc( eo, -eo * 0.5, es, 0, Math.PI * 2); ctx.fill();

      // Pupils
      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.arc(-eo, -eo * 0.5, es * 0.5, 0, Math.PI * 2);
      ctx.arc( eo, -eo * 0.5, es * 0.5, 0, Math.PI * 2); ctx.fill();

      // Highlight
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-eo + es * 0.25, -eo * 0.5 - es * 0.25, es * 0.2, 0, Math.PI * 2);
      ctx.arc( eo + es * 0.25, -eo * 0.5 - es * 0.25, es * 0.2, 0, Math.PI * 2); ctx.fill();

      // Mouth
      ctx.strokeStyle = '#333'; ctx.lineWidth = Math.max(1.5, cell.radius * 0.03);
      ctx.lineCap = 'round';
      ctx.beginPath();
      if (ft === 0) ctx.arc(0, eo * 0.2, ms, 0.1 * Math.PI, 0.9 * Math.PI);
      else if (ft === 1) ctx.arc(0, eo * 0.5, ms * 0.5, 0, Math.PI * 2);
      else if (ft === 2) { ctx.moveTo(-ms, eo * 0.5); ctx.lineTo(ms, eo * 0.5); }
      else ctx.arc(0, eo * 0.25, ms * 0.5, Math.PI, 0);
      ctx.stroke();

      // Name
      const fSize = Math.max(12, cell.radius * 0.28);
      ctx.font = `bold ${fSize}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 3; ctx.strokeText(cell.name, 0, cell.radius * 0.5 + 4);
      ctx.fillStyle = 'white'; ctx.fillText(cell.name, 0, cell.radius * 0.5 + 4);

      ctx.restore();
    });

    ctx.restore();

    // Minimap
    const MAP = 130, MP = 14;
    ctx.save(); ctx.translate(W - MAP - MP, H - MAP - MP);
    ctx.fillStyle = 'rgba(255,240,245,0.7)';
    ctx.strokeStyle = 'rgba(255,180,200,0.5)'; ctx.lineWidth = 2;
    ctx.fillRect(0, 0, MAP, MAP); ctx.strokeRect(0, 0, MAP, MAP);
    const ms2 = MAP / WORLD_SIZE;
    state.food.slice(0, 200).forEach(f => {
      ctx.fillStyle = f.color;
      ctx.fillRect(f.x * ms2 - 1, f.y * ms2 - 1, 2, 2);
    });
    Object.values(state.remotePlayers).forEach(rp => {
      ctx.fillStyle = rp.color;
      ctx.beginPath(); ctx.arc(rp.x * ms2, rp.y * ms2, 3, 0, Math.PI * 2); ctx.fill();
    });
    state.bots.forEach(b => { ctx.fillStyle = 'rgba(150,150,180,0.6)'; ctx.beginPath(); ctx.arc(b.x * ms2, b.y * ms2, 2, 0, Math.PI * 2); ctx.fill(); });
    state.playerCells.forEach(c => {
      ctx.fillStyle = '#FF1493';
      ctx.beginPath(); ctx.arc(c.x * ms2, c.y * ms2, 4, 0, Math.PI * 2); ctx.fill();
    });
    ctx.restore();
  }, [explode, handleDeath]);

  // Start / stop loop
  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [gameLoop]);

  // Throttled UI update
  useEffect(() => {
    const iv = setInterval(() => {
      if (!isPlayingRef.current) return;
      const state = G.current;
      setScoreUI(state.score);
      const all = [
        ...state.playerCells.map(c => ({ name: c.name, score: Math.floor(c.radius) })),
        ...state.bots.map(c => ({ name: c.name, score: Math.floor(c.radius) })),
        ...Object.values(state.remotePlayers).map(rp => ({ name: rp.name, score: Math.floor(rp.radius) })),
      ].sort((a, b) => b.score - a.score).slice(0, 10);
      setLbUI(all);
      const now2 = Date.now();
      state.killFeed = state.killFeed.filter(k => now2 - k.time < 5000);
      setKillFeedUI([...state.killFeed]);
    }, 200);
    return () => clearInterval(iv);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    isPlayingRef.current = false;
    leaveMultiplayer();
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, [leaveMultiplayer]);

  const handlePlay = async () => {
    if (multiplayerOn && classData?.classCode) {
      await joinMultiplayer(playerName);
    } else {
      initGame(playerName, false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full bg-[#FFF0F5] overflow-hidden" style={{ height: '100%', minHeight: 480 }}>
      <canvas ref={canvasRef} className="block w-full h-full" style={{ cursor: phase === 'playing' ? 'none' : 'default' }} />

      {/* HUD */}
      {phase === 'playing' && (
        <>
          <div className="absolute top-4 left-4 bg-white/85 backdrop-blur rounded-2xl px-4 py-3 shadow-lg border border-pink-100">
            <div className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">Mass</div>
            <div className="text-3xl font-black text-gray-800">{scoreUI}</div>
          </div>

          <div className="absolute top-4 right-4 bg-white/85 backdrop-blur rounded-2xl p-3 shadow-lg border border-pink-100 w-44">
            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black text-gray-700 uppercase tracking-widest">
              <Trophy className="w-3 h-3 text-yellow-500" /> Leaderboard
            </div>
            {lbUI.map((e, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className={`truncate max-w-[100px] ${e.name === (playerName || studentData?.firstName || 'Me') ? 'font-black text-pink-500' : 'text-gray-600'}`}>{i + 1}. {e.name}</span>
                <span className="text-gray-400 font-mono font-bold">{e.score}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {killFeedUI.map(k => (
              <motion.div key={k.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="absolute top-4 right-52 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs font-bold pointer-events-none mb-1">
                <span className="text-pink-400">{k.eater}</span> <span className="text-gray-400">ate</span> <span className="text-blue-300">{k.eaten}</span>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 px-5 py-2 bg-black/15 backdrop-blur rounded-full text-white text-xs font-bold uppercase tracking-wider select-none">
            <span className="bg-white/20 px-2 py-0.5 rounded">Space</span> Split
            <span className="mx-1 opacity-30">|</span>
            <span className="bg-white/20 px-2 py-0.5 rounded">W</span> Eject
          </div>
        </>
      )}

      {/* Main Menu */}
      <AnimatePresence>
        {phase === 'menu' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-pink-50/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-pink-100 w-full max-w-sm text-center mx-4">

              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg">
                <div className="flex gap-2.5">
                  <div className="w-3.5 h-3.5 bg-gray-800 rounded-full" />
                  <div className="w-3.5 h-3.5 bg-gray-800 rounded-full" />
                </div>
              </motion.div>

              <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-1">
                KAWAII <span className="text-pink-500">AGAR</span>
              </h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-7">Cute cell battle</p>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <input type="text" placeholder={studentData?.firstName ? `${studentData.firstName}` : 'Your nickname...'}
                    value={playerName} onChange={e => setPlayerName(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-pink-200 rounded-2xl outline-none font-bold text-gray-700"
                    maxLength={15} />
                </div>

                {classData?.classCode && (
                  <button onClick={() => setMultiplayerOn(m => !m)}
                    className={`w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border-2 ${multiplayerOn ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-500 border-gray-200 hover:border-pink-200'}`}>
                    <Users className="w-4 h-4" />
                    {multiplayerOn ? '✓ Multiplayer (vs classmates)' : 'Solo vs Bots'}
                  </button>
                )}

                <button onClick={handlePlay}
                  className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-black text-lg shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" /> PLAY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      <AnimatePresence>
        {phase === 'dead' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-xs w-full mx-4">
              <div className="text-6xl mb-4">🥺</div>
              <h2 className="text-3xl font-black text-gray-800 mb-1">Eaten!</h2>
              <p className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-6">you were so tasty...</p>
              <div className="bg-pink-50 rounded-2xl p-5 mb-6 border border-pink-100">
                <div className="text-[10px] text-pink-400 uppercase font-black tracking-widest mb-1">Final Mass</div>
                <div className="text-5xl font-black text-gray-800">{scoreUI}</div>
              </div>
              <button onClick={() => { setPhase('menu'); isPlayingRef.current = false; }}
                className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg transition-all">
                <RefreshCw className="w-5 h-5" /> RETRY
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
