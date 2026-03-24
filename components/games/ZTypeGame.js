// components/games/ZTypeGame.js — Type Defender (overhauled)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ── Word banks ────────────────────────────────────────────────────────────────
const WORD_BANKS = {
  easy: [
    'the','and','was','for','are','but','not','you','all','can',
    'had','her','one','our','out','day','get','has','him','his',
    'how','may','new','now','old','see','two','way','who','boy',
    'did','say','she','too','use','cat','dog','run','big','red',
    'sun','top','box','cup','hat','map','pig','bed','bus','car',
    'fan','hot','leg','mud','net','pet','rug','sit','win','ant',
    'bat','bug','cub','den','egg','fin','gum','sit','tip','van',
  ],
  medium: [
    'about','after','again','began','being','below','between','both',
    'carry','change','city','close','country','earth','every','found',
    'great','group','house','large','learn','light','means','might',
    'music','never','often','paper','place','plant','point','quite',
    'right','river','round','small','sound','spell','start','still',
    'story','study','table','their','thing','think','three','under',
    'water','where','which','while','woman','world','write','young',
    'answer','animal','before','behind','better','black','bring','class',
    'clean','color','cover','early','family','friend','funny','happy',
  ],
  hard: [
    'although','beautiful','because','believe','building','business',
    'celebrate','character','community','complete','continue','describe',
    'different','discover','education','especially','everyone','example',
    'exercise','experience','favorite','following','government','happened',
    'however','important','including','information','interesting','knowledge',
    'language','listening','literature','measuring','necessary','paragraph',
    'particular','perhaps','possible','president','probably','problem',
    'question','remember','research','resources','sentence','something',
    'sometimes','surprise','temperature','together','tomorrow','understand',
    'vocabulary','whatever','wonderful','yesterday','adventure','alphabet',
  ],
  expert: [
    'abbreviation','accomplish','accordingly','achievement','acknowledge',
    'administration','advertisement','agriculture','alphabetically','announcement',
    'approximately','architecture','autobiography','bibliography','biodiversity',
    'characteristics','civilization','classification','communication','competition',
    'concentration','congratulations','conservation','consideration','constitution',
    'contemporary','contribution','controversial','convenience','cooperation',
    'correspondence','determination','development','disappointment','discrimination',
    'encyclopedia','environment','establishment','extraordinary','imagination',
    'immediately','independence','infrastructure','investigation','manufacturer',
    'mathematics','measurement','multiplication','neighborhood','opportunity',
  ],
};

// ── Particle ──────────────────────────────────────────────────────────────────
class Particle {
  constructor(x, y, color, speed = 1) {
    this.x  = x;
    this.y  = y;
    this.vx = (Math.random() - 0.5) * 9 * speed;
    this.vy = (Math.random() - 0.5) * 9 * speed;
    this.color  = color;
    this.size   = Math.random() * 4 + 1;
    this.life   = 1;
    this.decay  = Math.random() * 0.022 + 0.018;
  }
  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.vy += 0.04; // soft gravity → ember drift
    this.life -= this.decay;
  }
  isAlive() { return this.life > 0; }
}

// ── Star ──────────────────────────────────────────────────────────────────────
class Star {
  constructor(cw, ch) { this.reset(cw, ch, true); }
  reset(cw, ch, initial = false) {
    this.x  = Math.random() * cw;
    this.y  = initial ? Math.random() * ch : -10;
    this.size  = Math.random() * 2 + 0.5;
    this.speed = this.size * 0.4 + 0.3;
    this.brightness = Math.random() * 0.5 + 0.5;
  }
  update(ch, cw) {
    this.y += this.speed;
    if (this.y > ch) this.reset(cw, ch);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const roundRect = (ctx, x, y, w, h, r = 8) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const glassPanel = (ctx, x, y, w, h, accent = 'rgba(99,102,241,0.45)') => {
  ctx.save();
  ctx.fillStyle = 'rgba(5,8,28,0.78)';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.restore();
};

// ── Component ─────────────────────────────────────────────────────────────────
const ZTypeGame = ({ studentData, updateStudentData, showToast, classmates = [] }) => {

  const [gamePhase,      setGamePhase]      = useState('menu');
  const [countdown,      setCountdown]      = useState(3);
  const [score,          setScore]          = useState(0);
  const [wave,           setWave]           = useState(1);
  const [lives,          setLives]          = useState(3);
  const [bombs,          setBombs]          = useState(2);
  const [combo,          setCombo]          = useState(0);
  const [maxCombo,       setMaxCombo]       = useState(0);
  const [wordsDestroyed, setWordsDestroyed] = useState(0);
  const [accuracy,       setAccuracy]       = useState(100);
  const [totalTyped,     setTotalTyped]     = useState(0);
  const [correctTyped,   setCorrectTyped]   = useState(0);
  const [personalBest,   setPersonalBest]   = useState(null);

  const canvasRef = useRef(null);
  const gameRef   = useRef({
    enemies:       [],
    projectiles:   [],
    particles:     [],
    shockwaves:    [],   // { x, y, radius, life }
    floatingTexts: [],   // { x, y, text, color, life, vy }
    stars:         [],
    targetEnemy:   null,
    typedChars:    '',
    player:        { x: 0, y: 0 },
    animationId:   null,
    lastSpawnTime: 0,
    waveEnemies:   0,
    waveEnemiesDestroyed: 0,
    screenShake:   0,    // frames remaining
    nebulaCanvas:  null, // offscreen nebula layer
  });

  // Class leaderboard
  const classLeaderboard = (classmates || [])
    .filter(s => s?.gameScores?.ztype)
    .map(s => ({
      id:    s.id,
      name:  `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
      score: s.gameScores.ztype.highScore || 0,
      wave:  s.gameScores.ztype.maxWave   || 1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  useEffect(() => {
    if (studentData?.gameScores?.ztype) setPersonalBest(studentData.gameScores.ztype);
  }, [studentData]);

  // ── Game helpers ────────────────────────────────────────────────────────────

  const getRandomWord = useCallback((waveNum) => {
    let pool;
    if (waveNum <= 2)      pool = WORD_BANKS.easy;
    else if (waveNum <= 5) pool = [...WORD_BANKS.easy,   ...WORD_BANKS.medium];
    else if (waveNum <= 8) pool = [...WORD_BANKS.medium, ...WORD_BANKS.hard];
    else                   pool = [...WORD_BANKS.hard,   ...WORD_BANKS.expert];
    return pool[Math.floor(Math.random() * pool.length)].toUpperCase();
  }, []);

  const createExplosion = useCallback((x, y, color = '#ff6b6b', count = 18) => {
    const game = gameRef.current;
    for (let i = 0; i < count; i++) game.particles.push(new Particle(x, y, color));
    // Shockwave ring
    game.shockwaves.push({ x, y, radius: 4, life: 1, color });
  }, []);

  const spawnEnemy = useCallback((cw, currentWaveEnemies, waveEnemyCap) => {
    const game = gameRef.current;
    if (currentWaveEnemies >= waveEnemyCap) return false;

    const word = getRandomWord(wave);
    let x, attempts = 0;
    do {
      x = Math.random() * (cw - 220) + 110;
      attempts++;
    } while (attempts < 10 && game.enemies.some(e => Math.abs(e.x - x) < 140));

    const speed    = 0.28 + wave * 0.07 + Math.random() * 0.2;
    const size     = 18 + word.length * 2;
    const hue      = Math.random() * 60 + 180;
    const shipType = word.length <= 4 ? 'scout' : word.length <= 7 ? 'fighter' : 'destroyer';

    game.enemies.push({
      id:        Date.now() + Math.random(),
      x, y: -35,
      word, typed: '',
      speed, size, shipType,
      color:     `hsl(${hue}, 70%, 52%)`,
      glowColor: `hsl(${hue}, 85%, 65%)`,
    });
    game.waveEnemies++;
    return true;
  }, [wave, getRandomWord]);

  const fireProjectile = useCallback((tx, ty) => {
    const game  = gameRef.current;
    const angle = Math.atan2(ty - game.player.y, tx - game.player.x);
    game.projectiles.push({
      x: game.player.x,
      y: game.player.y - 25,
      vx: Math.cos(angle) * 16,
      vy: Math.sin(angle) * 16,
      trail: [],
    });
  }, []);

  const useEMP = useCallback(() => {
    if (bombs <= 0 || gamePhase !== 'playing') return;
    const game   = gameRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    setBombs(prev => prev - 1);
    const destroyed = game.enemies.length;
    game.enemies.forEach(e => {
      createExplosion(e.x, e.y, '#00ffff', 30);
      setScore(prev => prev + e.word.length * 10);
    });
    game.enemies        = [];
    game.targetEnemy    = null;
    game.typedChars     = '';
    game.screenShake    = 18;

    if (destroyed > 0) {
      setWordsDestroyed(prev => prev + destroyed);
      game.waveEnemiesDestroyed += destroyed;
      game.floatingTexts.push({ x: canvas.width / 2, y: canvas.height / 2, text: `💥 EMP! ×${destroyed}`, color: '#00ffff', life: 1.8, vy: -1.2 });
      showToast?.(`💥 EMP! ${destroyed} enemies cleared!`, 'success');
    }
  }, [bombs, gamePhase, createExplosion, showToast]);

  // ── Keyboard ────────────────────────────────────────────────────────────────

  const handleKeyDown = useCallback((e) => {
    if (gamePhase !== 'playing') return;
    if (e.key === 'Enter') { e.preventDefault(); useEMP(); return; }
    if (!/^[a-zA-Z]$/.test(e.key)) return;
    e.preventDefault();

    const game = gameRef.current;
    const char = e.key.toUpperCase();
    setTotalTyped(prev => prev + 1);

    if (!game.targetEnemy) {
      const target = game.enemies.find(en => en.typed === '' && en.word[0] === char);
      if (target) {
        game.targetEnemy  = target;
        game.typedChars   = char;
        target.typed      = char;
        setCorrectTyped(prev => prev + 1);
        setCombo(prev => prev + 1);
        fireProjectile(target.x, target.y);
      } else {
        setCombo(0);
      }
    } else {
      const nextIdx = game.typedChars.length;
      if (game.targetEnemy.word[nextIdx] === char) {
        game.typedChars        += char;
        game.targetEnemy.typed  = game.typedChars;
        setCorrectTyped(prev => prev + 1);
        setCombo(prev => {
          const nc = prev + 1;
          setMaxCombo(cur => Math.max(cur, nc));
          // Milestone announcements
          if (nc === 10 || nc === 20 || nc === 30) {
            game.floatingTexts.push({
              x: canvasRef.current ? canvasRef.current.width / 2 : 400,
              y: canvasRef.current ? canvasRef.current.height / 2 + 20 : 310,
              text: `🔥 ${nc}× COMBO!`, color: '#fbbf24', life: 1.5, vy: -1,
            });
          }
          return nc;
        });
        fireProjectile(game.targetEnemy.x, game.targetEnemy.y);

        // Word complete?
        if (game.typedChars === game.targetEnemy.word) {
          const enemy     = game.targetEnemy;
          createExplosion(enemy.x, enemy.y, enemy.glowColor, 22);

          const baseScore  = enemy.word.length * 10;
          const comboBonus = Math.floor(combo / 5) * 5;
          const total      = baseScore + comboBonus;
          setScore(prev => prev + total);
          setWordsDestroyed(prev => prev + 1);

          // Floating score text
          game.floatingTexts.push({
            x: enemy.x, y: enemy.y - 20,
            text:  combo >= 10 ? `+${total} 🔥` : `+${total}`,
            color: combo >= 10 ? '#fbbf24' : '#00ff99',
            life: 1.2, vy: -2,
          });

          game.enemies           = game.enemies.filter(en => en.id !== enemy.id);
          game.targetEnemy       = null;
          game.typedChars        = '';
          game.waveEnemiesDestroyed++;
        }
      } else {
        setCombo(0);
      }
    }

    setAccuracy(() => {
      const t = totalTyped + 1;
      const c = correctTyped + (game.targetEnemy ? 1 : 0);
      return Math.round((c / t) * 100) || 100;
    });
  }, [gamePhase, combo, totalTyped, correctTyped, useEMP, fireProjectile, createExplosion]);

  // ── Save score ──────────────────────────────────────────────────────────────

  const saveScore = useCallback(async (finalScore, finalWave) => {
    if (!updateStudentData || !studentData) return;
    const best    = studentData?.gameScores?.ztype?.highScore || 0;
    const bestWave = studentData?.gameScores?.ztype?.maxWave  || 1;
    const newHigh  = Math.max(best, finalScore);
    const newWave  = Math.max(bestWave, finalWave);
    try {
      await updateStudentData({
        ...studentData,
        gameScores: {
          ...(studentData.gameScores || {}),
          ztype: { highScore: newHigh, maxWave: newWave, lastPlayed: new Date().toISOString(), gamesPlayed: (studentData.gameScores?.ztype?.gamesPlayed || 0) + 1 },
        },
      });
      setPersonalBest({ highScore: newHigh, maxWave: newWave });
      if (finalScore > best) showToast?.(`🏆 NEW HIGH SCORE: ${finalScore}!`, 'success');
    } catch (err) { console.error('Failed to save score:', err); }
  }, [studentData, updateStudentData, showToast]);

  const endGame = useCallback(() => {
    const game = gameRef.current;
    if (game.animationId) { cancelAnimationFrame(game.animationId); game.animationId = null; }
    setGamePhase('gameover');
    saveScore(score, wave);
  }, [score, wave, saveScore]);

  // ── Game loop ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const game = gameRef.current;

    game.player.x = canvas.width  / 2;
    game.player.y = canvas.height - 65;

    // Stars
    if (game.stars.length === 0) {
      for (let i = 0; i < 120; i++) game.stars.push(new Star(canvas.width, canvas.height));
    }

    // Offscreen nebula (drawn once)
    if (!game.nebulaCanvas) {
      const nc  = document.createElement('canvas');
      nc.width  = canvas.width;
      nc.height = canvas.height;
      const nc2 = nc.getContext('2d');
      const addNebula = (cx, cy, r, hue) => {
        const g = nc2.createRadialGradient(cx, cy, 10, cx, cy, r);
        g.addColorStop(0, `hsla(${hue},80%,40%,0.35)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        nc2.fillStyle = g;
        nc2.fillRect(0, 0, nc.width, nc.height);
      };
      addNebula(canvas.width * 0.25, canvas.height * 0.35, 260, 260); // purple
      addNebula(canvas.width * 0.75, canvas.height * 0.55, 220, 210); // blue
      addNebula(canvas.width * 0.5,  canvas.height * 0.8,  180, 200); // teal
      game.nebulaCanvas = nc;
    }

    const gameLoop = (timestamp) => {

      // Screen shake
      const shk = game.screenShake > 0
        ? { x: (Math.random() - 0.5) * game.screenShake * 1.8, y: (Math.random() - 0.5) * game.screenShake * 1.8 }
        : { x: 0, y: 0 };
      if (game.screenShake > 0) game.screenShake = Math.max(0, game.screenShake - 1);

      ctx.save();
      ctx.translate(shk.x, shk.y);

      // Background
      ctx.fillStyle = '#050510';
      ctx.fillRect(-10, -10, canvas.width + 20, canvas.height + 20);
      ctx.drawImage(game.nebulaCanvas, 0, 0);

      // Stars
      game.stars.forEach(s => {
        s.update(canvas.height, canvas.width);
        ctx.fillStyle = `rgba(255,255,255,${s.brightness * 0.6})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Wave logic ──
      const waveEnemyCap = 5 + wave * 2;

      if (game.waveEnemiesDestroyed >= waveEnemyCap && game.enemies.length === 0) {
        const nextWave = wave + 1;
        setWave(nextWave);
        game.waveEnemies         = 0;
        game.waveEnemiesDestroyed = 0;
        game.floatingTexts.push({ x: canvas.width / 2, y: canvas.height / 2 - 40, text: `WAVE ${nextWave}`, color: '#a78bfa', life: 1.8, vy: -0.6 });

        if (studentData && updateStudentData) {
          const today  = new Date().toDateString();
          const lrd    = studentData.gameProgress?.ztype?.lastRewardDate;
          let hwr      = studentData.gameProgress?.ztype?.highestWaveRewarded || 0;
          if (lrd !== today) hwr = 0;
          if (wave > hwr) {
            updateStudentData({
              ...studentData,
              currency: (studentData.currency || 0) + 2,
              gameProgress: { ...studentData.gameProgress, ztype: { ...studentData.gameProgress?.ztype, lastRewardDate: today, highestWaveRewarded: wave } },
            }).then(() => showToast?.('💰 Wave Cleared! +2 Coins', 'success'))
              .catch(() => {});
          }
        }

        if (nextWave % 3 === 0) {
          setBombs(prev => prev + 1);
          game.floatingTexts.push({ x: canvas.width / 2, y: canvas.height / 2 + 20, text: '💣 EMP Bonus!', color: '#00ffff', life: 1.5, vy: -0.8 });
        }
      }

      // Spawn enemies
      const spawnInterval = Math.max(1400 - wave * 90, 550);
      if (timestamp - game.lastSpawnTime > spawnInterval && game.enemies.length < 8 && game.waveEnemies < waveEnemyCap) {
        spawnEnemy(canvas.width, game.waveEnemies, waveEnemyCap);
        game.lastSpawnTime = timestamp;
      }

      // ── Targeting laser ──
      if (game.targetEnemy) {
        const te = game.targetEnemy;
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth   = 2;
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur  = 10;
        ctx.setLineDash([6, 10]);
        ctx.beginPath();
        ctx.moveTo(game.player.x, game.player.y - 25);
        ctx.lineTo(te.x, te.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // ── Enemies ──
      game.enemies = game.enemies.filter(enemy => {
        enemy.y += enemy.speed;

        if (enemy.y > canvas.height - 30) {
          setLives(prev => {
            const nl = prev - 1;
            if (nl <= 0) endGame();
            return nl;
          });
          game.screenShake = 14;
          createExplosion(enemy.x, canvas.height - 40, '#ff4444', 12);
          if (game.targetEnemy?.id === enemy.id) { game.targetEnemy = null; game.typedChars = ''; }
          setCombo(0);
          return false;
        }

        const isTarget = game.targetEnemy?.id === enemy.id;
        const s = enemy.size;
        const x = enemy.x, y = enemy.y;

        // Engine exhaust
        const exhaustFlicker = Math.sin(timestamp * 0.025) * s * 0.12;
        ctx.save();
        ctx.globalAlpha = 0.55;
        ctx.fillStyle   = '#ff7a30';
        ctx.shadowColor = '#ff7a30';
        ctx.shadowBlur  = 10;
        if (enemy.shipType === 'scout') {
          ctx.beginPath();
          ctx.moveTo(x - s * 0.12, y + s * 0.5);
          ctx.lineTo(x, y + s * 0.9 + exhaustFlicker);
          ctx.lineTo(x + s * 0.12, y + s * 0.5);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.shipType === 'fighter') {
          // Two exhausts
          [-0.28, 0.28].forEach(offset => {
            ctx.beginPath();
            ctx.moveTo(x + s * (offset - 0.1), y + s * 0.38);
            ctx.lineTo(x + s * offset, y + s * 0.72 + exhaustFlicker);
            ctx.lineTo(x + s * (offset + 0.1), y + s * 0.38);
            ctx.closePath();
            ctx.fill();
          });
        } else {
          // Three exhausts
          [-0.4, 0, 0.4].forEach(offset => {
            ctx.beginPath();
            ctx.moveTo(x + s * (offset - 0.09), y + s * 0.45);
            ctx.lineTo(x + s * offset, y + s * 0.82 + exhaustFlicker);
            ctx.lineTo(x + s * (offset + 0.09), y + s * 0.45);
            ctx.closePath();
            ctx.fill();
          });
        }
        ctx.restore();

        // Ship body
        if (isTarget) { ctx.shadowColor = '#00ff88'; ctx.shadowBlur = 28; }
        ctx.fillStyle = enemy.color;

        if (enemy.shipType === 'scout') {
          ctx.beginPath();
          ctx.moveTo(x, y - s * 0.75);
          ctx.lineTo(x - s * 0.38, y + s * 0.52);
          ctx.lineTo(x + s * 0.38, y + s * 0.52);
          ctx.closePath();
          ctx.fill();
        } else if (enemy.shipType === 'fighter') {
          ctx.beginPath();
          ctx.moveTo(x, y - s * 0.72);
          ctx.lineTo(x - s * 0.72, y + s * 0.38);
          ctx.lineTo(x - s * 0.28, y + s * 0.18);
          ctx.lineTo(x, y + s * 0.52);
          ctx.lineTo(x + s * 0.28, y + s * 0.18);
          ctx.lineTo(x + s * 0.72, y + s * 0.38);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x, y - s);
          ctx.lineTo(x - s * 0.45, y - s * 0.18);
          ctx.lineTo(x - s * 0.82, y + s * 0.48);
          ctx.lineTo(x + s * 0.82, y + s * 0.48);
          ctx.lineTo(x + s * 0.45, y - s * 0.18);
          ctx.closePath();
          ctx.fill();
        }

        // Cockpit
        ctx.fillStyle = isTarget ? '#00ff88' : enemy.glowColor;
        ctx.beginPath();
        ctx.arc(x, y - s * 0.12, s * 0.22, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Word label
        const wordY    = enemy.y - s - 20;
        ctx.font       = 'bold 16px monospace';
        ctx.textAlign  = 'center';
        const ww       = ctx.measureText(enemy.word).width;
        glassPanel(ctx, x - ww / 2 - 10, wordY - 18, ww + 20, 26, isTarget ? 'rgba(0,255,136,0.5)' : 'rgba(99,102,241,0.35)');

        for (let i = 0; i < enemy.word.length; i++) {
          const charX = x - ww / 2 + ctx.measureText(enemy.word.substring(0, i)).width + 2;
          ctx.fillStyle = i < enemy.typed.length
            ? '#00ff88'
            : (i === enemy.typed.length && isTarget ? '#ffff55' : '#e2e8f0');
          ctx.fillText(enemy.word[i], charX, wordY);
        }
        return true;
      });

      // ── Projectiles ──
      game.projectiles = game.projectiles.filter(proj => {
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.trail.push({ x: proj.x, y: proj.y });
        if (proj.trail.length > 7) proj.trail.shift();

        proj.trail.forEach((pt, i) => {
          const a = i / proj.trail.length;
          ctx.fillStyle = `rgba(0,230,255,${a * 0.55})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3 - i * 0.35, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle   = '#00e6ff';
        ctx.shadowColor = '#00e6ff';
        ctx.shadowBlur  = 14;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        return proj.y > 0 && proj.y < canvas.height && proj.x > 0 && proj.x < canvas.width;
      });

      // ── Shockwaves ──
      game.shockwaves = game.shockwaves.filter(sw => {
        sw.radius += 5;
        sw.life   -= 0.04;
        if (sw.life <= 0) return false;
        ctx.save();
        ctx.globalAlpha = sw.life * 0.7;
        ctx.strokeStyle = sw.color || '#ff6b6b';
        ctx.lineWidth   = 2;
        ctx.shadowColor = sw.color || '#ff6b6b';
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      });

      // ── Particles ──
      game.particles = game.particles.filter(p => {
        p.update();
        if (!p.isAlive()) return false;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return true;
      });

      // ── Floating texts ──
      game.floatingTexts = game.floatingTexts.filter(ft => {
        ft.y    += ft.vy;
        ft.life -= 0.018;
        if (ft.life <= 0) return false;
        ctx.save();
        ctx.globalAlpha = Math.min(ft.life, 1);
        ctx.font        = 'bold 20px monospace';
        ctx.fillStyle   = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur  = 10;
        ctx.textAlign   = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
        return true;
      });

      // ── Player ship ──
      const px = game.player.x, py = game.player.y;
      const flame = Math.sin(timestamp * 0.025) * 5;

      ctx.shadowColor = '#4488ff';
      ctx.shadowBlur  = 18;

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(px, py - 28);
      ctx.lineTo(px - 22, py + 18);
      ctx.lineTo(px, py + 8);
      ctx.lineTo(px + 22, py + 18);
      ctx.closePath();
      ctx.fill();

      // Wing stripes
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.moveTo(px - 6, py - 4);
      ctx.lineTo(px - 20, py + 16);
      ctx.lineTo(px - 14, py + 16);
      ctx.lineTo(px - 2, py - 2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(px + 6, py - 4);
      ctx.lineTo(px + 20, py + 16);
      ctx.lineTo(px + 14, py + 16);
      ctx.lineTo(px + 2, py - 2);
      ctx.closePath();
      ctx.fill();

      // Cockpit
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.ellipse(px, py - 8, 6, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Engine exhaust
      ctx.fillStyle   = '#ff8c42';
      ctx.shadowColor = '#ff8c42';
      ctx.shadowBlur  = 16;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(px - 9, py + 18);
      ctx.lineTo(px, py + 38 + flame);
      ctx.lineTo(px + 9, py + 18);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#ffdd88';
      ctx.beginPath();
      ctx.moveTo(px - 5, py + 18);
      ctx.lineTo(px, py + 28 + flame * 0.5);
      ctx.lineTo(px + 5, py + 18);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      // ── HUD ──

      // Left panel: Score / Wave / Combo
      glassPanel(ctx, 10, 10, 148, combo >= 3 ? 105 : 82, 'rgba(99,102,241,0.45)');
      ctx.font      = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.8)';
      ctx.textAlign = 'left';
      ctx.fillText('SCORE', 24, 28);
      ctx.font      = 'bold 24px monospace';
      ctx.fillStyle = '#67e8f9';
      ctx.fillText(score.toLocaleString(), 24, 54);
      ctx.font      = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.fillText(`WAVE  ${wave}`, 24, 72);
      if (combo >= 3) {
        ctx.font      = 'bold 13px monospace';
        ctx.fillStyle = combo >= 10 ? '#fbbf24' : '#a78bfa';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur  = 8;
        ctx.fillText(`× ${combo} COMBO`, 24, 94);
        ctx.shadowBlur  = 0;
      }

      // Right panel: Lives / Accuracy / Bombs
      glassPanel(ctx, canvas.width - 158, 10, 148, 100, 'rgba(239,68,68,0.35)');
      ctx.textAlign = 'right';
      ctx.font      = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.8)';
      ctx.fillText('LIVES', canvas.width - 24, 28);
      ctx.font      = '20px serif';
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = i < lives ? 1 : 0.18;
        ctx.fillStyle = i < lives ? '#f87171' : '#666';
        ctx.fillText('♥', canvas.width - 24 - i * 26, 52);
      }
      ctx.globalAlpha = 1;
      ctx.font      = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(148,163,184,0.7)';
      ctx.fillText(`ACC ${accuracy}%`, canvas.width - 24, 72);
      ctx.fillStyle = 'rgba(148,163,184,0.55)';
      ctx.fillText(`💣 ×${bombs}`, canvas.width - 24, 90);

      // Typing indicator bar (bottom centre)
      if (game.targetEnemy) {
        const typed   = game.typedChars;
        const full    = game.targetEnemy.word;
        ctx.font      = 'bold 22px monospace';
        const tw      = Math.max(200, ctx.measureText(full + '▋').width + 50);
        const bx      = canvas.width / 2 - tw / 2;
        const by      = canvas.height - 58;
        glassPanel(ctx, bx, by, tw, 46, 'rgba(0,255,180,0.5)');

        ctx.textAlign = 'center';
        ctx.font      = 'bold 22px monospace';
        const cx      = canvas.width / 2;

        // typed part
        ctx.fillStyle   = '#00ff99';
        ctx.shadowColor = '#00ff99';
        ctx.shadowBlur  = 10;
        const typedW    = ctx.measureText(typed).width;
        const totalW    = ctx.measureText(full).width;
        const startX    = cx - totalW / 2;
        ctx.fillText(typed, startX + typedW / 2, by + 30);

        // remaining part
        ctx.shadowBlur  = 0;
        ctx.fillStyle   = 'rgba(226,232,240,0.6)';
        ctx.fillText(full.slice(typed.length), startX + typedW + ctx.measureText(full.slice(typed.length)).width / 2, by + 30);

        // cursor
        ctx.fillStyle = '#00ff99';
        ctx.globalAlpha = (Math.sin(timestamp * 0.01) + 1) / 2;
        ctx.fillText('▋', startX + totalW + 14, by + 30);
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      ctx.restore(); // end screen shake translate
      game.animationId = requestAnimationFrame(gameLoop);
    };

    game.animationId = requestAnimationFrame(gameLoop);
    return () => { if (game.animationId) cancelAnimationFrame(game.animationId); };
  }, [gamePhase, wave, score, combo, lives, bombs, accuracy, spawnEnemy, createExplosion, endGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gamePhase !== 'countdown') return;
    if (countdown === 0) { setGamePhase('playing'); return; }
    const t = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [gamePhase, countdown]);

  // ── Start game ──────────────────────────────────────────────────────────────

  const startGame = () => {
    const game = gameRef.current;
    game.enemies            = [];
    game.projectiles        = [];
    game.particles          = [];
    game.shockwaves         = [];
    game.floatingTexts      = [];
    game.stars              = [];
    game.targetEnemy        = null;
    game.typedChars         = '';
    game.lastSpawnTime      = 0;
    game.waveEnemies        = 0;
    game.waveEnemiesDestroyed = 0;
    game.screenShake        = 0;
    game.nebulaCanvas       = null;

    setScore(0); setWave(1); setLives(3); setBombs(2);
    setCombo(0); setMaxCombo(0); setWordsDestroyed(0);
    setAccuracy(100); setTotalTyped(0); setCorrectTyped(0);
    setCountdown(3);
    setGamePhase('countdown');
  };

  // ── Stable star dots for menu ───────────────────────────────────────────────
  const menuStars = React.useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      left:  `${((i * 137.5) % 100).toFixed(1)}%`,
      top:   `${((i * 97.3)  % 100).toFixed(1)}%`,
      delay: `${((i * 0.4)   % 3).toFixed(1)}s`,
      size:  i % 4 === 0 ? 2 : 1,
    })), []
  );

  // ── Renders ─────────────────────────────────────────────────────────────────

  // MENU
  if (gamePhase === 'menu') {
    return (
      <div className="min-h-[580px] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 rounded-2xl overflow-hidden relative">
        {/* Star field */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {menuStars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white animate-pulse"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.2, animationDelay: s.delay }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row min-h-[580px]">
          {/* Main content */}
          <div className="flex-1 p-8 flex flex-col justify-center space-y-5">
            {/* Title */}
            <div className="text-center">
              <div className="text-5xl mb-2 drop-shadow-lg">🚀</div>
              <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300">
                TYPE DEFENDER
              </h1>
              <p className="text-slate-400 mt-1.5 text-sm">Destroy enemy ships by typing their words!</p>
            </div>

            {/* Personal best */}
            {personalBest && (
              <div className="bg-white/8 border border-white/10 rounded-2xl p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-black text-cyan-300">{(personalBest.highScore || 0).toLocaleString()}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Best Score</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-indigo-300">{personalBest.maxWave || 1}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Max Wave</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-purple-300">{personalBest.gamesPlayed || 0}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Games</div>
                </div>
              </div>
            )}

            {/* How to play */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: '⌨️', title: 'Type to lock on',  desc: 'Type the first letter to target a ship' },
                { icon: '💥', title: 'ENTER = EMP bomb', desc: 'Clears all enemies from the screen' },
                { icon: '🔥', title: 'Build combos',     desc: 'Fast typing earns bonus score' },
                { icon: '🌊', title: 'Survive waves',    desc: 'Words get harder every wave' },
              ].map(tip => (
                <div key={tip.title} className="bg-white/5 border border-white/8 rounded-xl p-3">
                  <div className="text-xl mb-1">{tip.icon}</div>
                  <div className="text-white text-xs font-bold">{tip.title}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{tip.desc}</div>
                </div>
              ))}
            </div>

            <button onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xl font-black rounded-2xl shadow-xl hover:shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-95">
              🚀 LAUNCH
            </button>
            <p className="text-slate-500 text-xs text-center">Best with a physical keyboard · ENTER fires EMP bombs</p>
          </div>

          {/* Leaderboard sidebar */}
          {classLeaderboard.length > 0 && (
            <div className="lg:w-64 bg-black/30 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col gap-3">
              <h3 className="text-white font-black text-xs uppercase tracking-widest">🏆 Class Leaderboard</h3>
              <div className="space-y-2">
                {classLeaderboard.map((player, i) => (
                  <div key={player.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl ${i === 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm flex-shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <span className="text-white text-sm font-bold truncate">{player.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-cyan-300 text-sm font-black">{player.score.toLocaleString()}</div>
                      <div className="text-slate-400 text-xs">W{player.wave}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // COUNTDOWN
  if (gamePhase === 'countdown') {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {menuStars.slice(0, 20).map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.15 }} />
          ))}
        </div>
        <div className="relative z-10 text-center space-y-5">
          <p className="uppercase tracking-[0.5em] text-slate-400 text-sm">Get Ready</p>
          <motion.div
            key={countdown}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-indigo-400 drop-shadow-2xl">
            {countdown || 'GO!'}
          </motion.div>
          <p className="text-slate-400 text-sm">Position your fingers on the keyboard</p>
        </div>
      </div>
    );
  }

  // GAME OVER
  if (gamePhase === 'gameover') {
    const isNew = personalBest && score >= (personalBest.highScore || 0);
    return (
      <div className="min-h-[520px] bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950 rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {menuStars.map((s, i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: 0.12 }} />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="relative z-10 w-full max-w-md text-center space-y-5">

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
            className="text-7xl">{isNew ? '🏆' : '💫'}</motion.div>

          <div>
            {isNew && <p className="text-amber-400 text-xs font-black uppercase tracking-widest mb-1">🎉 New High Score!</p>}
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
              {isNew ? 'LEGENDARY!' : 'GAME OVER'}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { val: score.toLocaleString(), label: 'Score',    color: 'text-cyan-300'   },
              { val: `Wave ${wave}`,          label: 'Reached',  color: 'text-indigo-300' },
              { val: wordsDestroyed,           label: 'Words',    color: 'text-emerald-300'},
              { val: `${accuracy}%`,           label: 'Accuracy', color: 'text-amber-300'  },
            ].map(stat => (
              <div key={stat.label} className="bg-white/8 border border-white/10 rounded-2xl p-4">
                <div className={`text-3xl font-black ${stat.color}`}>{stat.val}</div>
                <div className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-8 py-3 bg-white/5 border border-white/10 rounded-2xl">
            <div>
              <div className="text-xl font-black text-purple-300">×{maxCombo}</div>
              <div className="text-xs text-slate-400">Best Combo</div>
            </div>
            <div>
              <div className="text-xl font-black text-blue-300">{correctTyped}/{totalTyped}</div>
              <div className="text-xs text-slate-400">Keystrokes</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={startGame}
              className="flex-1 py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-lg hover:shadow-cyan-500/30 transition-all active:scale-95">
              🔄 Play Again
            </button>
            <button onClick={() => setGamePhase('menu')}
              className="flex-1 py-4 rounded-2xl font-bold bg-white/8 border border-white/10 text-slate-300 hover:bg-white/15 transition-all active:scale-95">
              ← Menu
            </button>
          </div>

          {personalBest && (
            <p className="text-slate-500 text-sm">
              Best: <span className="text-cyan-400 font-bold">{(personalBest.highScore || 0).toLocaleString()}</span>
              {' · '}Wave <span className="text-indigo-400 font-bold">{personalBest.maxWave || 1}</span>
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="relative">
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-indigo-900/60">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full block max-w-4xl mx-auto"
          style={{ backgroundColor: '#050510', display: 'block' }}
        />
      </div>
      <p className="text-center mt-2.5 text-xs text-slate-500">
        Type to target · <kbd className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">Enter</kbd> fires EMP bomb · Click canvas to focus
      </p>
    </div>
  );
};

export default ZTypeGame;
