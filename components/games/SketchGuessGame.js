// components/games/SketchGuessGame.js — Sketch & Guess ✏️ (skribbl-style)
// Multiplayer drawing & guessing over Firebase Realtime Database.
// One player draws a secret word; everyone else races to guess it in chat.
// Live-synced canvas (normalized strokes), word choices, letter hints,
// skribbl-style scoring, multiple rounds, and a podium finish.
//
// Firebase layout: sketchGuessRooms/{CODE}
//   phase: lobby | choosing | drawing | turnEnd | gameEnd
//   players/{id}: { id, name, emoji, score, guessedAt, isHost }
//   drawOrder: [ids], turnIndex, roundNumber, settings: { rounds, drawTime }
//   drawerId, wordOptions, word, turnStartAt, turnEndsAt, chooseEndsAt, clearAt
//   strokes/{sid}: { at, color, size, pts: [x0,y0,x1,y1,...] (0–1000 normalized) }
//   guesses/{gid}: { pid, name, emoji, text|null, correct, at }
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { kickPlayer, watchForKick, KickButton, KickConfirmModal } from './shared/kickPlayer';

// ─── Words (kid-friendly) ─────────────────────────────────────────────────────
const WORDS = [
  'apple', 'banana', 'pizza', 'ice cream', 'cupcake', 'hamburger', 'spaghetti', 'pancake', 'watermelon', 'carrot',
  'dog', 'cat', 'elephant', 'giraffe', 'penguin', 'butterfly', 'octopus', 'shark', 'dinosaur', 'kangaroo',
  'snail', 'spider', 'jellyfish', 'unicorn', 'dragon', 'mermaid', 'robot', 'alien', 'ghost', 'wizard',
  'rainbow', 'volcano', 'tornado', 'lightning', 'snowman', 'island', 'waterfall', 'cactus', 'mushroom', 'flower',
  'castle', 'pyramid', 'lighthouse', 'bridge', 'tent', 'igloo', 'windmill', 'rollercoaster', 'playground', 'treehouse',
  'rocket', 'helicopter', 'submarine', 'tractor', 'skateboard', 'bicycle', 'train', 'hot air balloon', 'pirate ship', 'race car',
  'guitar', 'piano', 'drums', 'trumpet', 'microphone', 'violin',
  'soccer', 'basketball', 'tennis', 'bowling', 'fishing', 'surfing', 'karate', 'swimming',
  'glasses', 'umbrella', 'backpack', 'scissors', 'toothbrush', 'ladder', 'candle', 'crown', 'key', 'clock',
  'camera', 'television', 'telephone', 'computer', 'headphones', 'flashlight', 'magnet', 'telescope',
  'doctor', 'firefighter', 'astronaut', 'chef', 'teacher', 'police officer', 'farmer', 'clown',
  'sandcastle', 'campfire', 'birthday cake', 'present', 'balloon', 'kite', 'swing', 'slide',
  'moustache', 'eyebrow', 'skeleton', 'footprint', 'muscle', 'sneeze',
  'cheese', 'popcorn', 'donut', 'pretzel', 'taco', 'sushi', 'lollipop', 'sandwich',
  'whale', 'turtle', 'flamingo', 'hedgehog', 'sloth', 'panda', 'koala', 'llama',
  'mountain', 'beach', 'desert', 'jungle', 'cave', 'swamp',
  'angel', 'ninja', 'knight', 'superhero', 'vampire', 'zombie',
  'book', 'pillow', 'mirror', 'wallet', 'envelope', 'trophy', 'medal', 'anchor', 'feather', 'diamond',
];

const PLAYER_EMOJIS = ['🦊', '🐸', '🐙', '🦄', '🐯', '🐼', '🦁', '🐨', '🦉', '🐺', '🐵', '🦖'];

const COLORS = ['#1f2937', '#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#92400e', '#ffffff'];
const SIZES = [4, 9, 18];

const CANVAS_SCALE = 1000; // normalized coordinate space

const generateRoomCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
};

const pickWordOptions = () => {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
};

const normalizeGuess = (s) => String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');

// Simple closeness check ("you're close!")
const isClose = (guess, word) => {
  const a = normalizeGuess(guess);
  const b = normalizeGuess(word);
  if (!a || !b || Math.abs(a.length - b.length) > 1) return false;
  let diff = 0;
  if (a.length === b.length) {
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return diff === 1;
  }
  // one insertion/deletion
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  let i = 0, j = 0, edits = 0;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) { i++; j++; }
    else { j++; edits++; if (edits > 1) return false; }
  }
  return true;
};

// Masked word with progressive letter hints for guessers
const maskedWord = (word, turnStartAt, turnEndsAt, now) => {
  if (!word) return '';
  const total = turnEndsAt - turnStartAt;
  const elapsed = Math.max(0, now - turnStartAt);
  const frac = total > 0 ? elapsed / total : 0;
  const letters = word.split('');
  const revealable = letters.map((ch, i) => ({ ch, i })).filter((x) => x.ch !== ' ');
  const hintCount = frac > 0.75 ? 2 : frac > 0.45 ? 1 : 0;
  // deterministic "random" reveal order seeded by word
  const seed = word.length * 7 + word.charCodeAt(0);
  const order = revealable.map((x, i) => ({ ...x, k: (i * seed + 13) % 97 })).sort((p, q) => p.k - q.k);
  const revealed = new Set(order.slice(0, hintCount).map((x) => x.i));
  return letters.map((ch, i) => (ch === ' ' ? '  ' : revealed.has(i) ? ch : '_')).join(' ');
};

// ── Turn-order recompute after a host kick ──────────────────────────────────
// Splicing a player out of `drawOrder` shifts everyone after them down by one
// array slot, so `turnIndex` has to be corrected to keep pointing at the
// right actual player (or hand off the turn correctly if it was the kicked
// player's own turn). Three cases:
//   1. Kicked player's slot was BEFORE the current turn index → the current
//      drawer's absolute position shifted down by one, so decrement the
//      index by 1 to keep pointing at the same person.
//   2. Kicked player WAS the current turn holder → do NOT decrement; whoever
//      now sits at that same index in the shortened array draws next. If the
//      kicked player was last in the array this index runs one past the end
//      of the new (shorter) array — wrap it back with modulo.
//   3. Kicked player's slot was AFTER the current turn index → nothing
//      before the current index moved, so it's left untouched.
const recomputeDrawTurnAfterKick = (drawOrder, turnIndex, kickedId) => {
  const kickedIndex = drawOrder.indexOf(kickedId);
  const newDrawOrder = drawOrder.filter((id) => id !== kickedId);
  if (kickedIndex === -1 || newDrawOrder.length === 0) {
    return { newDrawOrder, newTurnIndex: 0, wasCurrentDrawer: false };
  }
  let newTurnIndex;
  const wasCurrentDrawer = kickedIndex === turnIndex;
  if (kickedIndex < turnIndex) {
    newTurnIndex = turnIndex - 1;
  } else if (wasCurrentDrawer) {
    newTurnIndex = turnIndex % newDrawOrder.length; // wrap if they were last
  } else {
    newTurnIndex = turnIndex;
  }
  return { newDrawOrder, newTurnIndex, wasCurrentDrawer };
};

// ─── Scoreboard sidebar ───────────────────────────────────────────────────────
const PlayerList = ({ players, drawerId, turnStartAt, isHost, myId, onKick }) => {
  const sorted = useMemo(() => [...players].sort((a, b) => (b.score || 0) - (a.score || 0)), [players]);
  return (
    <div className="space-y-1.5">
      {sorted.map((p, i) => {
        const guessed = p.guessedAt && turnStartAt && p.guessedAt >= turnStartAt;
        return (
          <div
            key={p.id}
            className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm ${
              guessed ? 'bg-emerald-500/25 border border-emerald-300/40' : 'bg-white/10 border border-white/10'
            }`}
          >
            <span className="text-base">{i === 0 ? '👑' : p.emoji}</span>
            <span className="text-white font-semibold truncate flex-1">
              {p.name}
              {p.id === drawerId && <span className="ml-1">✏️</span>}
            </span>
            <span className="text-yellow-300 font-bold">{p.score || 0}</span>
            {isHost && p.id !== myId && (
              <KickButton onClick={() => onKick?.(p)} name={p.name} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const SketchGuessGame = ({ studentData, showToast }) => {
  const [screen, setScreen] = useState('home'); // home | lobby | game
  const [nameInput, setNameInput] = useState(studentData?.firstName || studentData?.name || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId] = useState(() => `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [fb, setFb] = useState(null);
  const [kickTarget, setKickTarget] = useState(null); // { id, name } pending confirm
  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(80);

  // Drawing state
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const drawingRef = useRef(false);
  const currentStroke = useRef(null); // {color,size,pts:[]}
  const myStrokeIds = useRef([]);
  const lastSentChunk = useRef(0);

  // Guess chat
  const [guessInput, setGuessInput] = useState('');
  const chatEndRef = useRef(null);

  // Clock (re-render every second for timers/hints)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const screenRef = useRef(screen);
  screenRef.current = screen;
  const roomDataRef = useRef(null);
  roomDataRef.current = roomData;

  // ── Load Firebase (same pattern as other multiplayer games) ──
  useEffect(() => {
    const load = async () => {
      const { database } = await import('../../utils/firebase');
      const { ref, set, onValue, update, off, get, remove } = await import('firebase/database');
      setFb({ database, ref, set, onValue, update, off, get, remove });
    };
    load();
  }, []);

  const roomRef = useCallback((path = '') => fb.ref(fb.database, `sketchGuessRooms/${roomCode}${path}`), [fb, roomCode]);

  // ── Room listener ──
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `sketchGuessRooms/${roomCode}`);
    const handler = fb.onValue(rRef, (snap) => {
      const data = snap.val();
      if (!data) return;
      setRoomData(data);
      const cur = screenRef.current;
      if (data.phase === 'lobby' && cur !== 'lobby') setScreen('lobby');
      if (data.phase !== 'lobby' && cur !== 'game') setScreen('game');
    });
    return () => fb.off(rRef, 'value', handler);
  }, [roomCode, fb]);

  // ── Leave on unmount (lobby only) ──
  useEffect(() => {
    return () => {
      try {
        const rd = roomDataRef.current;
        if (fb && roomCode && rd?.phase === 'lobby') {
          fb.remove(fb.ref(fb.database, `sketchGuessRooms/${roomCode}/players/${myId}`));
        }
      } catch {}
    };
  }, [fb, roomCode, myId]);

  // ── Kick watcher (local player) ──
  useEffect(() => {
    if (!fb || !roomCode) return;
    const unsub = watchForKick(fb.database, `sketchGuessRooms/${roomCode}`, myId, () => {
      showToast?.('You were removed from the game by the host.', 'error');
      setRoomCode('');
      setRoomData(null);
      setIsHost(false);
      setScreen('home');
    });
    return () => unsub();
  }, [fb, roomCode, myId, showToast]);

  // ── Create / Join ──
  const createRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = generateRoomCode();
    await fb.set(fb.ref(fb.database, `sketchGuessRooms/${code}`), {
      roomCode: code,
      phase: 'lobby',
      hostId: myId,
      createdAt: Date.now(),
      roundNumber: 0,
      turnIndex: 0,
      settings: { rounds: 3, drawTime: 80 },
      players: {
        [myId]: { id: myId, name: nameInput.trim(), score: 0, emoji: PLAYER_EMOJIS[0], isHost: true },
      },
    });
    setRoomCode(code);
    setIsHost(true);
    setScreen('lobby');
  }, [fb, nameInput, myId, showToast]);

  const joinRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 4) { showToast?.('Room code must be 4 letters!', 'error'); return; }
    const snap = await fb.get(fb.ref(fb.database, `sketchGuessRooms/${code}`));
    const data = snap.val();
    if (!data) { showToast?.('Room not found! Check the code.', 'error'); return; }
    if (data.phase !== 'lobby') { showToast?.('Game already started!', 'error'); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= 12) { showToast?.('Room is full!', 'error'); return; }
    await fb.update(fb.ref(fb.database, `sketchGuessRooms/${code}/players/${myId}`), {
      id: myId,
      name: nameInput.trim(),
      score: 0,
      emoji: PLAYER_EMOJIS[playerCount % PLAYER_EMOJIS.length],
      isHost: false,
    });
    setRoomCode(code);
    setIsHost(false);
    setScreen('lobby');
  }, [fb, nameInput, roomCodeInput, myId, showToast]);

  // ── Turn orchestration (host only) ──
  const beginTurn = useCallback(async (turnIndex, roundNumber, drawOrder, playersObj) => {
    // reset per-turn player state
    const playerUpdates = {};
    Object.keys(playersObj || {}).forEach((pid) => {
      playerUpdates[`${pid}/guessedAt`] = null;
    });
    await fb.update(roomRef('/players'), playerUpdates);
    await fb.update(roomRef(), {
      phase: 'choosing',
      drawerId: drawOrder[turnIndex],
      wordOptions: pickWordOptions(),
      word: null,
      turnIndex,
      roundNumber,
      chooseEndsAt: Date.now() + 20000,
      strokes: null,
      guesses: null,
      clearAt: Date.now(),
      turnSummary: null,
    });
  }, [fb, roomRef]);

  const startGame = useCallback(async () => {
    if (!fb || !isHost || !roomData) return;
    const players = Object.values(roomData.players || {});
    if (players.length < 2) { showToast?.('Need at least 2 players to start!', 'error'); return; }
    const drawOrder = [...players].sort(() => Math.random() - 0.5).map((p) => p.id);
    await fb.update(roomRef(), {
      settings: { rounds, drawTime },
      drawOrder,
    });
    await beginTurn(0, 1, drawOrder, roomData.players);
  }, [fb, isHost, roomData, rounds, drawTime, roomRef, beginTurn, showToast]);

  const endTurn = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd || rd.phase !== 'drawing') return;
    const players = Object.values(rd.players || {});
    const correctGuessers = players.filter((p) => p.id !== rd.drawerId && p.guessedAt && p.guessedAt >= rd.turnStartAt);
    const drawerBonus = correctGuessers.length * 40;
    const updates = {
      phase: 'turnEnd',
      turnSummary: {
        word: rd.word,
        drawerId: rd.drawerId,
        drawerBonus,
        correctCount: correctGuessers.length,
        endedAt: Date.now(),
      },
    };
    if (drawerBonus > 0 && rd.players?.[rd.drawerId]) {
      updates[`players/${rd.drawerId}/score`] = (rd.players[rd.drawerId].score || 0) + drawerBonus;
    }
    await fb.update(roomRef(), updates);
  }, [fb, roomRef]);

  const nextTurn = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd) return;
    const drawOrder = rd.drawOrder || [];
    let turnIndex = (rd.turnIndex || 0) + 1;
    let roundNumber = rd.roundNumber || 1;
    if (turnIndex >= drawOrder.length) {
      turnIndex = 0;
      roundNumber += 1;
    }
    if (roundNumber > (rd.settings?.rounds || 3)) {
      await fb.update(roomRef(), { phase: 'gameEnd' });
    } else {
      await beginTurn(turnIndex, roundNumber, drawOrder, rd.players);
    }
  }, [fb, roomRef, beginTurn]);

  // Host watchdog: choosing timeout, drawing timeout, everyone-guessed, turnEnd auto-advance
  useEffect(() => {
    if (!isHost || !fb || !roomData) return;
    const t = setInterval(() => {
      const rd = roomDataRef.current;
      if (!rd) return;
      const ts = Date.now();
      if (rd.phase === 'choosing' && rd.chooseEndsAt && ts > rd.chooseEndsAt) {
        // auto-pick first word for a sleepy drawer
        const w = (rd.wordOptions && rd.wordOptions[0]) || WORDS[0];
        fb.update(roomRef(), {
          phase: 'drawing',
          word: w,
          turnStartAt: ts,
          turnEndsAt: ts + (rd.settings?.drawTime || 80) * 1000,
        });
      } else if (rd.phase === 'drawing') {
        const players = Object.values(rd.players || {});
        const guessers = players.filter((p) => p.id !== rd.drawerId);
        const allGuessed = guessers.length > 0 && guessers.every((p) => p.guessedAt && p.guessedAt >= rd.turnStartAt);
        if (ts > (rd.turnEndsAt || 0) || allGuessed) endTurn();
      } else if (rd.phase === 'turnEnd' && rd.turnSummary?.endedAt && ts > rd.turnSummary.endedAt + 6000) {
        nextTurn();
      }
    }, 700);
    return () => clearInterval(t);
  }, [isHost, fb, roomData, roomRef, endTurn, nextTurn]);

  // ── Drawer: choose word ──
  const chooseWord = useCallback(async (w) => {
    if (!fb) return;
    const ts = Date.now();
    await fb.update(roomRef(), {
      phase: 'drawing',
      word: w,
      turnStartAt: ts,
      turnEndsAt: ts + ((roomDataRef.current?.settings?.drawTime || 80) * 1000),
    });
  }, [fb, roomRef]);

  // ── Drawing (drawer only) ──
  const amDrawer = roomData?.drawerId === myId;
  const phase = roomData?.phase;

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * CANVAS_SCALE);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * CANVAS_SCALE);
    return { x: Math.max(0, Math.min(CANVAS_SCALE, x)), y: Math.max(0, Math.min(CANVAS_SCALE, y)) };
  };

  const sendStrokeChunk = useCallback(async (finalize = false) => {
    const stroke = currentStroke.current;
    if (!fb || !stroke || stroke.pts.length < 4) {
      if (finalize) currentStroke.current = null;
      return;
    }
    const sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const payload = { at: Date.now(), color: stroke.color, size: stroke.size, pts: stroke.pts };
    myStrokeIds.current.push(sid);
    if (finalize) {
      currentStroke.current = null;
    } else {
      // keep the last point so chunks connect seamlessly
      const lastX = stroke.pts[stroke.pts.length - 2];
      const lastY = stroke.pts[stroke.pts.length - 1];
      currentStroke.current = { ...stroke, pts: [lastX, lastY] };
    }
    try {
      await fb.update(roomRef('/strokes'), { [sid]: payload });
    } catch (e) { /* non-fatal */ }
  }, [fb, roomRef]);

  const onCanvasPointerDown = (e) => {
    if (!amDrawer || phase !== 'drawing') return;
    e.preventDefault();
    canvasRef.current.setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    const p = getCanvasPoint(e);
    currentStroke.current = { color, size, pts: [p.x, p.y] };
    lastSentChunk.current = Date.now();
  };

  const onCanvasPointerMove = (e) => {
    if (!drawingRef.current || !amDrawer || phase !== 'drawing') return;
    e.preventDefault();
    const p = getCanvasPoint(e);
    const stroke = currentStroke.current;
    if (!stroke) return;
    const n = stroke.pts.length;
    const dx = p.x - stroke.pts[n - 2];
    const dy = p.y - stroke.pts[n - 1];
    if (dx * dx + dy * dy < 16) return; // skip micro-moves
    stroke.pts.push(p.x, p.y);
    // live chunking so others see the line appear as you draw
    if (Date.now() - lastSentChunk.current > 300 || stroke.pts.length > 60) {
      lastSentChunk.current = Date.now();
      sendStrokeChunk(false);
    }
    redraw(); // local immediate feedback
  };

  const onCanvasPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    sendStrokeChunk(true);
  };

  const undoStroke = useCallback(async () => {
    if (!fb || !myStrokeIds.current.length) return;
    // remove the last ~3 chunks (one visual stroke may be several chunks)
    const toRemove = myStrokeIds.current.splice(-3);
    const updates = {};
    toRemove.forEach((sid) => { updates[sid] = null; });
    await fb.update(roomRef('/strokes'), updates);
  }, [fb, roomRef]);

  const clearCanvas = useCallback(async () => {
    if (!fb) return;
    myStrokeIds.current = [];
    await fb.update(roomRef(), { clearAt: Date.now(), strokes: null });
  }, [fb, roomRef]);

  // ── Canvas rendering ──
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    const rd = roomDataRef.current;
    const clearAt = rd?.clearAt || 0;
    const strokes = Object.values(rd?.strokes || {})
      .filter((s) => s.at >= clearAt && Array.isArray(s.pts) && s.pts.length >= 2)
      .sort((a, b) => a.at - b.at);
    const drawStroke = (s) => {
      ctx.strokeStyle = s.color;
      ctx.lineWidth = (s.size / CANVAS_SCALE) * w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo((s.pts[0] / CANVAS_SCALE) * w, (s.pts[1] / CANVAS_SCALE) * h);
      if (s.pts.length === 2) ctx.lineTo((s.pts[0] / CANVAS_SCALE) * w + 0.1, (s.pts[1] / CANVAS_SCALE) * h);
      for (let i = 2; i < s.pts.length; i += 2) {
        ctx.lineTo((s.pts[i] / CANVAS_SCALE) * w, (s.pts[i + 1] / CANVAS_SCALE) * h);
      }
      ctx.stroke();
    };
    strokes.forEach(drawStroke);
    if (currentStroke.current) drawStroke({ ...currentStroke.current, at: Infinity });
  }, []);

  // Redraw when strokes change or canvas resizes
  useEffect(() => { redraw(); }, [roomData?.strokes, roomData?.clearAt, phase, redraw]);

  useEffect(() => {
    const sizeCanvas = () => {
      const canvas = canvasRef.current;
      const wrap = canvasWrapRef.current;
      if (!canvas || !wrap) return;
      const w = wrap.clientWidth;
      const h = Math.round(w * 0.66);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      redraw();
    };
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);
    return () => window.removeEventListener('resize', sizeCanvas);
  }, [screen, redraw]);

  // ── Guessing ──
  const submitGuess = useCallback(async () => {
    const text = guessInput.trim();
    setGuessInput('');
    if (!fb || !text || !roomData || phase !== 'drawing') return;
    if (amDrawer) { showToast?.("You're the artist — no guessing!", 'error'); return; }
    const me = roomData.players?.[myId];
    const alreadyGuessed = me?.guessedAt && me.guessedAt >= roomData.turnStartAt;
    const gid = `g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const word = roomData.word || '';

    if (!alreadyGuessed && normalizeGuess(text) === normalizeGuess(word)) {
      // Correct! Score by time remaining (skribbl-style)
      const totalMs = (roomData.settings?.drawTime || 80) * 1000;
      const remaining = Math.max(0, (roomData.turnEndsAt || 0) - Date.now());
      const pts = 120 + Math.round((remaining / totalMs) * 180);
      await fb.update(roomRef(), {
        [`players/${myId}/guessedAt`]: Date.now(),
        [`players/${myId}/score`]: (me?.score || 0) + pts,
        [`guesses/${gid}`]: { pid: myId, name: me?.name || 'Player', emoji: me?.emoji || '🎨', text: null, correct: true, pts, at: Date.now() },
      });
    } else {
      const close = !alreadyGuessed && isClose(text, word);
      await fb.update(roomRef('/guesses'), {
        [gid]: { pid: myId, name: me?.name || 'Player', emoji: me?.emoji || '🎨', text, correct: false, close, at: Date.now() },
      });
      if (close) showToast?.("So close! Check your spelling!", 'info');
    }
  }, [fb, guessInput, roomData, phase, amDrawer, myId, roomRef, showToast]);

  // Auto-scroll chat
  const guesses = useMemo(
    () => Object.values(roomData?.guesses || {}).sort((a, b) => a.at - b.at).slice(-60),
    [roomData?.guesses]
  );
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [guesses.length]);

  // ── Play again / leave ──
  const playAgain = useCallback(async () => {
    if (!fb || !isHost) return;
    const rd = roomDataRef.current;
    const playerUpdates = {};
    Object.keys(rd?.players || {}).forEach((pid) => {
      playerUpdates[`${pid}/score`] = 0;
      playerUpdates[`${pid}/guessedAt`] = null;
    });
    await fb.update(roomRef('/players'), playerUpdates);
    await fb.update(roomRef(), { phase: 'lobby', roundNumber: 0, turnIndex: 0, strokes: null, guesses: null, turnSummary: null, word: null });
  }, [fb, isHost, roomRef]);

  const leaveGame = useCallback(async () => {
    try {
      if (fb && roomCode) {
        await fb.remove(fb.ref(fb.database, `sketchGuessRooms/${roomCode}/players/${myId}`));
      }
    } catch {}
    setRoomCode('');
    setRoomData(null);
    setIsHost(false);
    setScreen('home');
  }, [fb, roomCode, myId]);

  // ── Host: remove another player from the game ──
  const kickGuesser = useCallback(async (targetId) => {
    const rd = roomDataRef.current;
    if (!fb || !isHost || !rd || !roomCode || targetId === myId) return;
    const target = rd.players?.[targetId];
    const roomPath = `sketchGuessRooms/${roomCode}`;
    const remainingIds = Object.keys(rd.players || {}).filter((id) => id !== targetId);
    const extraUpdates = {};

    if (rd.phase !== 'lobby' && remainingIds.length < 2) {
      // Not enough players left to keep the game going — end it gracefully.
      extraUpdates[`${roomPath}/phase`] = 'gameEnd';
    } else if (Array.isArray(rd.drawOrder) && rd.drawOrder.includes(targetId)) {
      const { newDrawOrder, newTurnIndex, wasCurrentDrawer } =
        recomputeDrawTurnAfterKick(rd.drawOrder, rd.turnIndex || 0, targetId);
      extraUpdates[`${roomPath}/drawOrder`] = newDrawOrder;
      extraUpdates[`${roomPath}/turnIndex`] = newTurnIndex;

      if (wasCurrentDrawer && (rd.phase === 'choosing' || rd.phase === 'drawing')) {
        // The kicked player was mid-turn as the drawer — deal a fresh turn to
        // whoever slid into their slot right here in the same atomic write
        // (mirrors beginTurn()), instead of leaving drawerId/turnEndsAt
        // dangling for the host watchdog to spin on with nobody able to draw.
        remainingIds.forEach((pid) => {
          extraUpdates[`${roomPath}/players/${pid}/guessedAt`] = null;
        });
        extraUpdates[`${roomPath}/phase`] = 'choosing';
        extraUpdates[`${roomPath}/drawerId`] = newDrawOrder[newTurnIndex];
        extraUpdates[`${roomPath}/wordOptions`] = pickWordOptions();
        extraUpdates[`${roomPath}/word`] = null;
        extraUpdates[`${roomPath}/chooseEndsAt`] = Date.now() + 20000;
        extraUpdates[`${roomPath}/strokes`] = null;
        extraUpdates[`${roomPath}/guesses`] = null;
        extraUpdates[`${roomPath}/clearAt`] = Date.now();
        extraUpdates[`${roomPath}/turnSummary`] = null;
      }
    }

    try {
      await kickPlayer({
        database: fb.database,
        roomPath,
        targetId,
        targetName: target?.name,
        hostName: rd.players?.[myId]?.name,
        extraUpdates,
      });
    } catch {
      showToast?.('Failed to remove player', 'error');
    }
  }, [fb, isHost, myId, roomCode, showToast]);

  // ── Derived ──
  const players = useMemo(() => Object.values(roomData?.players || {}), [roomData?.players]);
  const drawer = roomData?.players?.[roomData?.drawerId];
  const me = roomData?.players?.[myId];
  const iGuessed = me?.guessedAt && roomData?.turnStartAt && me.guessedAt >= roomData.turnStartAt;
  const timeLeft = phase === 'drawing' ? Math.max(0, Math.ceil(((roomData?.turnEndsAt || 0) - now) / 1000)) : 0;
  const chooseLeft = phase === 'choosing' ? Math.max(0, Math.ceil(((roomData?.chooseEndsAt || 0) - now) / 1000)) : 0;

  // ════════════════════════════════════════════════════════════════════════════
  // UI
  // ════════════════════════════════════════════════════════════════════════════

  // ── HOME ──
  if (screen === 'home') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl p-6 md:p-8 text-center">
          <div className="text-6xl mb-2">🎨</div>
          <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
            Sketch & <span className="text-yellow-300">Guess</span>
          </h2>
          <p className="text-white/80 text-sm md:text-base max-w-md mx-auto mt-2">
            One artist draws a secret word — everyone else races to guess it in the chat! Faster guesses earn more points.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm text-white/90 mt-4">
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">✏️ Everyone gets a turn to draw</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">💡 Letter hints appear over time</span>
            <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">👥 2–12 players</span>
          </div>

          <div className="max-w-sm mx-auto mt-6 space-y-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value.slice(0, 16))}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-300"
            />
            <button
              onClick={createRoom}
              disabled={!fb}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg py-3.5 rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              🎨 Create a Room
            </button>
            <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
              <div className="flex-1 h-px bg-white/15" />OR<div className="flex-1 h-px bg-white/15" />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="CODE"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 text-center font-black tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button
                onClick={joinRoom}
                disabled={!fb}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black px-6 py-3 rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
          {!fb && <p className="text-white/50 text-xs mt-3">Connecting…</p>}
        </div>
      </div>
    );
  }

  // ── LOBBY ──
  if (screen === 'lobby') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="text-center">
            <div className="text-4xl mb-1">🎨</div>
            <h3 className="text-white text-2xl font-black mb-1">Game Lobby</h3>
            <p className="text-white/60 text-sm mb-3">Share this code with your classmates:</p>
            <div className="inline-block bg-white/10 border-2 border-dashed border-yellow-300/60 rounded-2xl px-8 py-3 mb-4">
              <span className="text-yellow-300 text-4xl font-black tracking-[0.35em]">{roomCode}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
            {players.map((p) => (
              <div key={p.id} className="bg-white/10 border border-white/15 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-white font-semibold text-sm truncate">{p.name}</span>
                {p.isHost && <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-bold px-1.5 py-0.5 rounded-full ml-auto">HOST</span>}
                {isHost && p.id !== myId && (
                  <KickButton onClick={() => setKickTarget(p)} name={p.name} className={p.isHost ? '' : 'ml-auto'} />
                )}
              </div>
            ))}
          </div>

          {isHost ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <label className="block text-white/60 text-xs font-bold mb-1.5">Rounds</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 5].map((r) => (
                      <button key={r} onClick={() => setRounds(r)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold ${rounds === r ? 'bg-yellow-400 text-yellow-950' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{r}</button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <label className="block text-white/60 text-xs font-bold mb-1.5">Draw time</label>
                  <div className="flex gap-1.5">
                    {[60, 80, 100].map((t) => (
                      <button key={t} onClick={() => setDrawTime(t)} className={`flex-1 py-1.5 rounded-lg text-sm font-bold ${drawTime === t ? 'bg-yellow-400 text-yellow-950' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>{t}s</button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg py-3.5 rounded-xl hover:shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-40"
              >
                {players.length < 2 ? 'Waiting for players… (need 2+)' : `🚀 Start Game (${players.length} players)`}
              </button>
            </div>
          ) : (
            <p className="text-center text-white/60 text-sm animate-pulse">Waiting for the host to start…</p>
          )}

          <button onClick={leaveGame} className="block mx-auto mt-4 text-white/40 text-sm hover:text-white transition-colors">
            ← Leave room
          </button>
        </div>
        {kickTarget && (
          <KickConfirmModal
            playerName={kickTarget.name}
            onConfirm={() => { kickGuesser(kickTarget.id); setKickTarget(null); }}
            onCancel={() => setKickTarget(null)}
          />
        )}
      </div>
    );
  }

  // ── GAME (choosing / drawing / turnEnd / gameEnd) ──
  const sortedFinal = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-fuchsia-900 rounded-3xl shadow-2xl p-3 md:p-5">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="bg-white/10 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full">
              Round {Math.min(roomData?.roundNumber || 1, roomData?.settings?.rounds || 3)}/{roomData?.settings?.rounds || 3}
            </span>
            <span className="bg-white/10 text-white/80 text-xs font-bold px-3 py-1.5 rounded-full">Room {roomCode}</span>
          </div>

          {/* Word display */}
          <div className="flex-1 text-center min-w-[180px]">
            {phase === 'drawing' && (
              <div className="text-white font-black text-lg md:text-2xl tracking-widest">
                {amDrawer ? (
                  <span className="text-yellow-300">✏️ {roomData.word}</span>
                ) : iGuessed ? (
                  <span className="text-emerald-300">✅ {roomData.word}</span>
                ) : (
                  <span>{maskedWord(roomData.word, roomData.turnStartAt, roomData.turnEndsAt, now)}</span>
                )}
              </div>
            )}
            {phase === 'choosing' && (
              <div className="text-white/80 font-bold text-sm md:text-base animate-pulse">
                {amDrawer ? 'Pick a word to draw!' : `${drawer?.emoji || '✏️'} ${drawer?.name || 'Artist'} is choosing a word… (${chooseLeft}s)`}
              </div>
            )}
          </div>

          {phase === 'drawing' && (
            <div className={`font-black text-xl md:text-2xl px-3.5 py-1.5 rounded-xl ${timeLeft <= 10 ? 'bg-rose-500/30 text-rose-300 animate-pulse' : 'bg-white/10 text-white'}`}>
              ⏱ {timeLeft}
            </div>
          )}
          <button onClick={leaveGame} className="bg-white/10 border border-white/20 text-white/70 px-3 py-1.5 rounded-xl hover:bg-white/20 text-sm">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-3">
          {/* Players sidebar */}
          <div className="order-2 lg:order-1">
            <PlayerList
              players={players}
              drawerId={roomData?.drawerId}
              turnStartAt={roomData?.turnStartAt}
              isHost={isHost}
              myId={myId}
              onKick={(p) => setKickTarget(p)}
            />
          </div>

          {/* Canvas area */}
          <div className="order-1 lg:order-2">
            <div ref={canvasWrapRef} className="relative rounded-2xl overflow-hidden shadow-lg bg-white" style={{ touchAction: 'none' }}>
              <canvas
                ref={canvasRef}
                className={`block w-full ${amDrawer && phase === 'drawing' ? 'cursor-crosshair' : 'cursor-default'}`}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerLeave={onCanvasPointerUp}
                onPointerCancel={onCanvasPointerUp}
              />

              {/* Choosing overlay */}
              {phase === 'choosing' && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
                  {amDrawer ? (
                    <>
                      <h4 className="text-white text-xl font-black">Your turn to draw! Pick a word:</h4>
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        {(roomData.wordOptions || []).map((w) => (
                          <button
                            key={w}
                            onClick={() => chooseWord(w)}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-950 font-black text-lg px-6 py-3 rounded-xl hover:scale-105 hover:shadow-2xl transition-all"
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                      <p className="text-white/50 text-xs">Auto-picks in {chooseLeft}s…</p>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl animate-bounce">{drawer?.emoji || '✏️'}</div>
                      <h4 className="text-white text-xl font-black">{drawer?.name || 'The artist'} is choosing a word…</h4>
                    </>
                  )}
                </div>
              )}

              {/* Turn end overlay */}
              {phase === 'turnEnd' && roomData.turnSummary && (
                <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className="text-4xl">{roomData.turnSummary.correctCount > 0 ? '🎉' : '😅'}</div>
                  <p className="text-white/70 text-sm">The word was</p>
                  <div className="text-yellow-300 text-3xl md:text-4xl font-black">{roomData.turnSummary.word}</div>
                  <p className="text-white/80 text-sm">
                    {roomData.turnSummary.correctCount} player{roomData.turnSummary.correctCount === 1 ? '' : 's'} guessed it!
                    {roomData.turnSummary.drawerBonus > 0 && ` ${drawer?.name || 'The artist'} earns +${roomData.turnSummary.drawerBonus} 🎨`}
                  </p>
                  <p className="text-white/40 text-xs animate-pulse mt-1">Next turn coming up…</p>
                </div>
              )}

              {/* Game end overlay */}
              {phase === 'gameEnd' && (
                <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4 text-center overflow-y-auto">
                  <div className="text-5xl">🏆</div>
                  <h3 className="text-white text-2xl md:text-3xl font-black">Final Results!</h3>
                  <div className="flex items-end justify-center gap-3">
                    {[1, 0, 2].map((rank) => {
                      const p = sortedFinal[rank];
                      if (!p) return null;
                      const heights = { 0: 'h-24', 1: 'h-16', 2: 'h-12' };
                      const medals = { 0: '🥇', 1: '🥈', 2: '🥉' };
                      return (
                        <div key={p.id} className="flex flex-col items-center gap-1">
                          <span className="text-2xl">{medals[rank]}</span>
                          <span className="text-white font-bold text-sm">{p.emoji} {p.name}</span>
                          <span className="text-yellow-300 font-black">{p.score || 0}</span>
                          <div className={`w-20 ${heights[rank]} bg-gradient-to-t from-purple-600 to-fuchsia-500 rounded-t-lg`} />
                        </div>
                      );
                    })}
                  </div>
                  {sortedFinal.length > 3 && (
                    <div className="text-white/60 text-xs space-y-0.5">
                      {sortedFinal.slice(3).map((p, i) => (
                        <div key={p.id}>{i + 4}. {p.emoji} {p.name} — {p.score || 0}</div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2.5 mt-2">
                    {isHost && (
                      <button onClick={playAgain} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all">
                        🔄 Play Again
                      </button>
                    )}
                    <button onClick={leaveGame} className="bg-white/15 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/25 transition-all">
                      🏠 Leave
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drawing tools (drawer only) */}
            {amDrawer && phase === 'drawing' && (
              <div className="mt-2.5 bg-white/10 border border-white/15 rounded-2xl p-2.5 flex flex-wrap items-center gap-2 justify-center">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${color === c ? 'border-yellow-300 scale-115 shadow-lg' : 'border-white/20 hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                    title={c === '#ffffff' ? 'Eraser (white)' : c}
                  />
                ))}
                <div className="w-px h-7 bg-white/20 mx-1" />
                {SIZES.map((s2) => (
                  <button
                    key={s2}
                    onClick={() => setSize(s2)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${size === s2 ? 'bg-yellow-400/30 ring-2 ring-yellow-300' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    <span className="rounded-full bg-white" style={{ width: 4 + s2 / 2, height: 4 + s2 / 2 }} />
                  </button>
                ))}
                <div className="w-px h-7 bg-white/20 mx-1" />
                <button onClick={undoStroke} className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-3 py-2 rounded-lg">↩️ Undo</button>
                <button onClick={clearCanvas} className="bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 text-sm font-bold px-3 py-2 rounded-lg">🗑️ Clear</button>
              </div>
            )}
          </div>

          {/* Guess chat */}
          <div className="order-3 flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden" style={{ minHeight: 260, maxHeight: 420 }}>
            <div className="px-3 py-2 bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest">💬 Guesses</div>
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 text-sm">
              {guesses.map((gu, i) => (
                <div key={i} className="leading-snug">
                  {gu.correct ? (
                    <span className="text-emerald-300 font-bold">🎉 {gu.name} guessed the word! +{gu.pts}</span>
                  ) : (
                    <span className="text-white/85">
                      <span className="font-bold text-white">{gu.emoji} {gu.name}:</span> {gu.text}
                      {gu.close && <span className="text-yellow-300 font-semibold"> (so close!)</span>}
                    </span>
                  )}
                </div>
              ))}
              {guesses.length === 0 && <p className="text-white/30 text-xs">Guesses will appear here…</p>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-2 bg-white/5 border-t border-white/10">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value.slice(0, 40))}
                  onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                  placeholder={amDrawer ? "You're drawing!" : iGuessed ? 'You got it! 🎉' : 'Type your guess…'}
                  disabled={amDrawer || phase !== 'drawing' || Boolean(iGuessed)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 disabled:opacity-40"
                />
                <button
                  onClick={submitGuess}
                  disabled={amDrawer || phase !== 'drawing' || Boolean(iGuessed)}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-950 font-black px-4 py-2 rounded-lg hover:shadow-lg disabled:opacity-40 text-sm"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How to play */}
      <div className="mt-4 bg-white rounded-2xl shadow p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-start gap-2">
          <span className="text-2xl">✏️</span>
          <span className="text-gray-600"><strong className="text-gray-800">Take turns drawing</strong> — pick one of 3 secret words and sketch it.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">💬</span>
          <span className="text-gray-600"><strong className="text-gray-800">Guess in chat</strong> — faster correct guesses earn more points.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">💡</span>
          <span className="text-gray-600"><strong className="text-gray-800">Letter hints</strong> appear as the timer runs down.</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🚫</span>
          <span className="text-gray-600"><strong className="text-gray-800">No letters or spelling</strong> in your drawing — pictures only!</span>
        </div>
      </div>

      {kickTarget && (
        <KickConfirmModal
          playerName={kickTarget.name}
          onConfirm={() => { kickGuesser(kickTarget.id); setKickTarget(null); }}
          onCancel={() => setKickTarget(null)}
        />
      )}
    </div>
  );
};

export default SketchGuessGame;
