import React, { useEffect, useMemo, useRef, useState } from 'react';
import { calculateAvatarLevel, getAvatarImage } from '../../utils/gameHelpers';

const ARENA_WIDTH = 960;
const ARENA_HEIGHT = 520;
const PLAYER_RADIUS = 28;
const PLAYER_SPEED = 320;
const BALL_BASE_SPEED = 160;
const BALL_RADIUS = 16;
const BALL_ADD_INTERVAL_MS = 10000;
const POWERUP_CHECK_INTERVAL = 1000;
const POWERUP_LIFETIME_MS = 12000;
const POWERUP_TYPES = ['shield', 'dash', 'slow'];

const TROPHY_THRESHOLDS = [
  { id: 'bronze', label: 'Bronze Survivor', seconds: 30, icon: '🥉' },
  { id: 'silver', label: 'Silver Survivor', seconds: 60, icon: '🥈' },
  { id: 'gold', label: 'Gold Survivor', seconds: 90, icon: '🥇' },
  { id: 'diamond', label: 'Diamond Survivor', seconds: 120, icon: '💎' }
];

const randomPosition = (padding = 60) => ({
  x: padding + Math.random() * (ARENA_WIDTH - padding * 2),
  y: padding + Math.random() * (ARENA_HEIGHT - padding * 2)
});

const createBall = (index = 0) => {
  const speed = BALL_BASE_SPEED + index * 12;
  const angle = Math.random() * Math.PI * 2;
  const { x, y } = randomPosition();
  return {
    id: `ball-${Date.now()}-${index}-${Math.random()}`,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    hue: Math.floor(Math.random() * 360)
  };
};

const createPowerup = (type) => {
  const { x, y } = randomPosition();
  return {
    id: `power-${type}-${Date.now()}-${Math.random()}`,
    type,
    x,
    y,
    spawnedAt: Date.now()
  };
};

const formatTime = (ms) => (ms / 1000).toFixed(1);

const DodgeballGame = ({ studentData, showToast, storageKeySuffix = 'student-dodgeball' }) => {
  const [player, setPlayer] = useState({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 });
  const [balls, setBalls] = useState([createBall()]);
  const [powerups, setPowerups] = useState([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [bestMs, setBestMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [ballAdds, setBallAdds] = useState(0);
  const [activeShield, setActiveShield] = useState(false);
  const [dashActive, setDashActive] = useState(false);
  const [slowActive, setSlowActive] = useState(false);
  const [lastTrophy, setLastTrophy] = useState(null);

  const pressedKeys = useRef({});
  const animationRef = useRef(null);
  const lastFrameRef = useRef(null);
  const startRef = useRef(null);
  const speedBoostTimeout = useRef(null);
  const slowTimeout = useRef(null);
  const playerRef = useRef({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 });
  const shieldRef = useRef(false);
  const dashRef = useRef(false);
  const slowRef = useRef(false);

  const avatarSrc = useMemo(() => {
    const level = calculateAvatarLevel(studentData?.totalPoints || 0);
    return getAvatarImage(studentData?.avatarBase, level);
  }, [studentData]);

  useEffect(() => {
    const saved = localStorage.getItem(`dodgeball-best-${storageKeySuffix}`);
    if (saved) {
      setBestMs(Number(saved));
    }
  }, [storageKeySuffix]);

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    shieldRef.current = activeShield;
  }, [activeShield]);

  useEffect(() => {
    dashRef.current = dashActive;
  }, [dashActive]);

  useEffect(() => {
    slowRef.current = slowActive;
  }, [slowActive]);

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (speedBoostTimeout.current) clearTimeout(speedBoostTimeout.current);
    if (slowTimeout.current) clearTimeout(slowTimeout.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      pressedKeys.current[event.key.toLowerCase()] = true;
    };
    const handleKeyUp = (event) => {
      pressedKeys.current[event.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = setInterval(() => {
      setBalls((prev) => [...prev, createBall(prev.length)]);
      setBallAdds((count) => count + 1);
    }, BALL_ADD_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || ballAdds === 0 || ballAdds % 5 !== 0) return;

    setPowerups((prev) => {
      const capped = prev.filter((p) => Date.now() - p.spawnedAt < POWERUP_LIFETIME_MS);
      if (capped.length >= 2) return capped;
      const type = POWERUP_TYPES[ballAdds % POWERUP_TYPES.length];
      return [...capped, createPowerup(type)];
    });
  }, [ballAdds, isRunning]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = setInterval(() => {
      setPowerups((prev) => prev.filter((p) => Date.now() - p.spawnedAt < POWERUP_LIFETIME_MS));
    }, POWERUP_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning]);

  const resetGame = () => {
    setPlayer({ x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 });
    playerRef.current = { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT / 2 };
    setBalls([createBall()]);
    setPowerups([]);
    setElapsedMs(0);
    setBallAdds(0);
    setActiveShield(false);
    shieldRef.current = false;
    setDashActive(false);
    dashRef.current = false;
    setSlowActive(false);
    slowRef.current = false;
    setGameOver(false);
    setLastTrophy(null);
    startRef.current = Date.now();
    lastFrameRef.current = null;
    setIsRunning(true);
    animationRef.current = requestAnimationFrame(stepFrame);
  };

  const handlePowerup = (type) => {
    if (type === 'shield') {
      setActiveShield(true);
      shieldRef.current = true;
      showToast?.('🛡️ Shield activated! One hit protection.');
      return;
    }

    if (type === 'dash') {
      setDashActive(true);
      dashRef.current = true;
      showToast?.('⚡ Dodge boost! Move super fast for 4s.');
      if (speedBoostTimeout.current) clearTimeout(speedBoostTimeout.current);
      speedBoostTimeout.current = setTimeout(() => {
        dashRef.current = false;
        setDashActive(false);
      }, 4000);
      return;
    }

    if (type === 'slow') {
      setSlowActive(true);
      slowRef.current = true;
      showToast?.('⏳ Time warp! Balls slowed for 5s.');
      if (slowTimeout.current) clearTimeout(slowTimeout.current);
      slowTimeout.current = setTimeout(() => {
        slowRef.current = false;
        setSlowActive(false);
      }, 5000);
    }
  };

  const handleGameOver = (hitBall) => {
    setIsRunning(false);
    setGameOver(true);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const survivalMs = Date.now() - (startRef.current || Date.now());
    setElapsedMs(survivalMs);

    setBestMs((prev) => {
      const nextBest = Math.max(prev, survivalMs);
      localStorage.setItem(`dodgeball-best-${storageKeySuffix}`, nextBest);
      return nextBest;
    });

    const trophy = TROPHY_THRESHOLDS.slice().reverse().find((tier) => survivalMs / 1000 >= tier.seconds) || null;
    setLastTrophy(trophy);
    if (trophy) {
      showToast?.(`${trophy.icon} ${trophy.label}! You survived ${formatTime(survivalMs)}s`);
    } else {
      showToast?.(`Ouch! You lasted ${formatTime(survivalMs)}s. Try again!`);
    }

    if (hitBall) {
      setBalls((prev) => prev.map((ball) => (ball.id === hitBall.id ? { ...ball, hue: 0 } : ball)));
    }
  };

  const stepFrame = (timestamp) => {
    if (!isRunning) return;

    if (!startRef.current) startRef.current = Date.now();
    if (!lastFrameRef.current) lastFrameRef.current = timestamp;
    const deltaSeconds = Math.min((timestamp - lastFrameRef.current) / 1000, 0.05);
    lastFrameRef.current = timestamp;

    const speedMultiplier = dashRef.current ? 1.8 : 1;
    const slowMultiplier = slowRef.current ? 0.6 : 1;

    setElapsedMs(Date.now() - startRef.current);

    setPlayer((prev) => {
      const next = { ...prev };
      const up = pressedKeys.current['arrowup'] || pressedKeys.current['w'];
      const down = pressedKeys.current['arrowdown'] || pressedKeys.current['s'];
      const left = pressedKeys.current['arrowleft'] || pressedKeys.current['a'];
      const right = pressedKeys.current['arrowright'] || pressedKeys.current['d'];
      const speed = PLAYER_SPEED * speedMultiplier * deltaSeconds;

      if (up) next.y -= speed;
      if (down) next.y += speed;
      if (left) next.x -= speed;
      if (right) next.x += speed;

      next.x = Math.max(PLAYER_RADIUS, Math.min(ARENA_WIDTH - PLAYER_RADIUS, next.x));
      next.y = Math.max(PLAYER_RADIUS, Math.min(ARENA_HEIGHT - PLAYER_RADIUS, next.y));
      playerRef.current = next;
      return next;
    });

    let hitDetected = null;

    setBalls((prev) => {
      const updated = prev.map((ball) => {
        let { x, y, vx, vy } = ball;
        x += (vx * deltaSeconds) * slowMultiplier;
        y += (vy * deltaSeconds) * slowMultiplier;

        if (x <= BALL_RADIUS || x >= ARENA_WIDTH - BALL_RADIUS) {
          vx = -vx;
          x = Math.max(BALL_RADIUS, Math.min(ARENA_WIDTH - BALL_RADIUS, x));
        }
        if (y <= BALL_RADIUS || y >= ARENA_HEIGHT - BALL_RADIUS) {
          vy = -vy;
          y = Math.max(BALL_RADIUS, Math.min(ARENA_HEIGHT - BALL_RADIUS, y));
        }

        return { ...ball, x, y, vx, vy };
      });

      for (let i = 0; i < updated.length; i += 1) {
        for (let j = i + 1; j < updated.length; j += 1) {
          const a = updated[i];
          const b = updated[j];
          const dx = (b.x || 0) - (a.x || 0);
          const dy = (b.y || 0) - (a.y || 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
          const minDist = BALL_RADIUS * 2;

          if (dist < minDist) {
            const overlap = minDist - dist;
            const nx = dx / dist;
            const ny = dy / dist;

            a.x -= nx * (overlap / 2);
            a.y -= ny * (overlap / 2);
            b.x += nx * (overlap / 2);
            b.y += ny * (overlap / 2);

            const tx = -ny;
            const ty = nx;
            const v1n = a.vx * nx + a.vy * ny;
            const v1t = a.vx * tx + a.vy * ty;
            const v2n = b.vx * nx + b.vy * ny;
            const v2t = b.vx * tx + b.vy * ty;

            if (v1n - v2n < 0) continue;

            const v1nAfter = v2n;
            const v2nAfter = v1n;

            a.vx = v1nAfter * nx + v1t * tx;
            a.vy = v1nAfter * ny + v1t * ty;
            b.vx = v2nAfter * nx + v2t * tx;
            b.vy = v2nAfter * ny + v2t * ty;

            a.x = Math.max(BALL_RADIUS, Math.min(ARENA_WIDTH - BALL_RADIUS, a.x));
            a.y = Math.max(BALL_RADIUS, Math.min(ARENA_HEIGHT - BALL_RADIUS, a.y));
            b.x = Math.max(BALL_RADIUS, Math.min(ARENA_WIDTH - BALL_RADIUS, b.x));
            b.y = Math.max(BALL_RADIUS, Math.min(ARENA_HEIGHT - BALL_RADIUS, b.y));
          }
        }
      }

      const playerNow = playerRef.current;
      for (const ball of updated) {
        const dx = (ball.x || 0) - (playerNow.x || 0);
        const dy = (ball.y || 0) - (playerNow.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= BALL_RADIUS + PLAYER_RADIUS) {
          hitDetected = ball;
          break;
        }
      }

      return updated;
    });

    setPowerups((prev) => {
      const filtered = prev.filter((p) => Date.now() - p.spawnedAt < POWERUP_LIFETIME_MS);
      const collected = filtered.filter((p) => {
        const dx = (p.x || 0) - (playerRef.current.x || 0);
        const dy = (p.y || 0) - (playerRef.current.y || 0);
        return Math.sqrt(dx * dx + dy * dy) <= PLAYER_RADIUS + 10;
      });

      if (collected.length) {
        collected.forEach((p) => handlePowerup(p.type));
        return filtered.filter((p) => !collected.some((c) => c.id === p.id));
      }

      return filtered;
    });

    if (hitDetected) {
      if (shieldRef.current) {
        setActiveShield(false);
        shieldRef.current = false;
        setBalls((prev) => prev.filter((ball) => ball.id !== hitDetected.id));
      } else {
        handleGameOver(hitDetected);
        return;
      }
    }

    animationRef.current = requestAnimationFrame(stepFrame);
  };

  const startGame = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setIsRunning(false);
    setTimeout(() => resetGame(), 0);
  };

  const trophyStatus = TROPHY_THRESHOLDS.map((tier) => ({
    ...tier,
    unlocked: elapsedMs / 1000 >= tier.seconds || (bestMs / 1000 >= tier.seconds)
  }));

  return (
    <div className="bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl border border-purple-100">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-purple-500 font-semibold">Arcade Challenge</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="text-3xl">🥎</span>
              Dodgeball Frenzy
            </h2>
            <p className="text-gray-600">Survive the chaos, dodge the glowing balls, and claim shiny trophies.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white shadow-sm rounded-xl px-4 py-3 border border-purple-100 text-center">
              <div className="text-xs text-gray-500">Current Run</div>
              <div className="text-2xl font-bold text-purple-700">{formatTime(elapsedMs)}s</div>
            </div>
            <div className="bg-white shadow-sm rounded-xl px-4 py-3 border border-green-100 text-center">
              <div className="text-xs text-gray-500">Best Time</div>
              <div className="text-2xl font-bold text-green-600">{bestMs ? `${formatTime(bestMs)}s` : '—'}</div>
            </div>
            <button
              type="button"
              onClick={startGame}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              {isRunning ? 'Restart Run' : gameOver ? 'Play Again' : 'Start Dodgeball'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-3">
            <div
              className="relative overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"
              style={{ width: '100%', minHeight: ARENA_HEIGHT, maxHeight: ARENA_HEIGHT }}
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.08),transparent_30%)]" />

              {balls.map((ball) => (
                <div
                  key={ball.id}
                  className="absolute rounded-full shadow-lg border border-white/20"
                  style={{
                    width: BALL_RADIUS * 2,
                    height: BALL_RADIUS * 2,
                    left: ball.x - BALL_RADIUS,
                    top: ball.y - BALL_RADIUS,
                    background: `radial-gradient(circle at 30% 30%, #fff, hsl(${ball.hue}, 85%, 60%))`,
                    boxShadow: `0 0 20px rgba(255,255,255,0.4), 0 0 40px hsl(${ball.hue}, 90%, 60%)`
                  }}
                />
              ))}

              {powerups.map((power) => (
                <div
                  key={power.id}
                  className="absolute w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold bg-white shadow-xl border border-purple-200 animate-pulse"
                  style={{ left: power.x - 24, top: power.y - 24 }}
                >
                  {power.type === 'shield' && '🛡️'}
                  {power.type === 'dash' && '⚡'}
                  {power.type === 'slow' && '⏳'}
                </div>
              ))}

              <div
                className={`absolute transition-transform duration-150 ease-out ${dashActive ? 'scale-110' : ''}`}
                style={{
                  left: player.x - PLAYER_RADIUS,
                  top: player.y - PLAYER_RADIUS,
                  width: PLAYER_RADIUS * 2,
                  height: PLAYER_RADIUS * 2,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  boxShadow: activeShield
                    ? '0 0 0 6px rgba(255,255,255,0.25), 0 0 25px rgba(59,130,246,0.8)'
                    : '0 0 0 4px rgba(255,255,255,0.15)',
                  background: '#fff'
                }}
              >
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt="Player avatar"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">😀</div>
                )}
              </div>

              {gameOver && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center text-white space-y-3">
                  <div className="text-4xl">💥</div>
                  <p className="text-lg font-semibold">Knocked out!</p>
                  <p className="text-sm text-purple-100">You survived {formatTime(elapsedMs)} seconds.</p>
                  {lastTrophy ? (
                    <p className="text-xl font-bold flex items-center gap-2">
                      <span>{lastTrophy.icon}</span>
                      {lastTrophy.label}
                    </p>
                  ) : (
                    <p className="text-sm text-white/80">Grab a shield or dash boost to last longer.</p>
                  )}
                  <button
                    type="button"
                    onClick={startGame}
                    className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full font-semibold shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-purple-100 shadow-lg p-4 md:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Balls Active</p>
                <p className="text-2xl font-bold text-purple-700">{balls.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Power-ups</p>
                <p className="text-lg font-semibold text-green-600">Every 5 balls</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-3 space-y-2">
              <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                <span>🎯 Tips</span>
              </h4>
              <ul className="text-xs text-purple-900 space-y-1 list-disc list-inside">
                <li>Use WASD or arrow keys to glide around the arena.</li>
                <li>New balls spawn every 10 seconds—plan your escape routes.</li>
                <li>Grab power-ups: 🛡️ shield, ⚡ dodge boost, ⏳ slow the storm.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span>🏆 Trophy Cabinet</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {trophyStatus.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-xl border p-2 text-center ${
                      tier.unlocked ? 'border-green-300 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}
                  >
                    <div className="text-lg">{tier.icon}</div>
                    <div className="text-xs font-semibold">{tier.label}</div>
                    <div className="text-[11px]">{tier.seconds}s</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <span>Active Buffs</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeShield && (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">🛡️ Shielded</span>
                )}
                {dashActive && (
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">⚡ Dodge Boost</span>
                )}
                {slowActive && (
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold">⏳ Time Warp</span>
                )}
                {!activeShield && !dashActive && !slowActive && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">No buffs currently</span>
                )}
              </div>
            </div>

            <div className="space-y-1 text-xs text-gray-500">
              <p>🎮 Survive as long as possible while the arena fills with glowing dodgeballs.</p>
              <p>✨ Power-ups spawn every 5 new balls. Stay alert and collect them fast!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DodgeballGame;
