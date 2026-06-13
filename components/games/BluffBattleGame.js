// components/games/BluffBattleGame.js — Bluff Battle 🎭 (Fibbage-style party game)
// Turn-based, host-authoritative multiplayer over Firebase Realtime Database.
// Each round shows a true-fact prompt with a blank. Players secretly invent a
// believable LIE to fill the blank. Then every lie + the real truth are shown
// shuffled, and everyone votes for the answer they think is TRUE.
//   • +1000 for finding the truth
//   • +500 each time another player is fooled by YOUR lie
//   • +1000 if your "lie" happens to match the actual truth
//
// Firebase layout: bluffBattleRooms/{CODE}
//   phase: lobby | writing | voting | reveal | gameEnd
//   hostId, createdAt, roundNumber, settings: { rounds, writeTime, voteTime }
//   prompt: { text, truth }
//   writeEndsAt, voteEndsAt, revealAt
//   players/{id}: { id, name, emoji, score, isHost, roundScore }
//   answers/{id}: { text, by }
//   options: [ { oid, text, ownerIds, isTruth } ]  (built by host for voting)
//   votes/{id}: optionId
//   summary: { truth, results: [...], scoredAt }
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Prompt bank (kid-friendly fun facts; blank = the hidden truth) ───────────
const PROMPTS = [
  { text: "A group of flamingos is called a ____.", truth: "flamboyance" },
  { text: "A baby kangaroo is called a ____.", truth: "joey" },
  { text: "A ____ has three hearts.", truth: "octopus" },
  { text: "The largest ocean on Earth is the ____ Ocean.", truth: "Pacific" },
  { text: "A group of crows is called a ____.", truth: "murder" },
  { text: "The only mammal that can truly fly is the ____.", truth: "bat" },
  { text: "The hardest natural substance on Earth is ____.", truth: "diamond" },
  { text: "An ostrich's eye is bigger than its ____.", truth: "brain" },
  { text: "The planet that spins on its side is ____.", truth: "Uranus" },
  { text: "A ____ can sleep for up to three years.", truth: "snail" },
  { text: "Honey found in ancient tombs is still safe to ____.", truth: "eat" },
  { text: "A group of lions is called a ____.", truth: "pride" },
  { text: "The fastest land animal is the ____.", truth: "cheetah" },
  { text: "A ____'s heart is about the size of a small car.", truth: "blue whale" },
  { text: "The tallest animal in the world is the ____.", truth: "giraffe" },
  { text: "A ____ can regrow a lost arm.", truth: "starfish" },
  { text: "The smallest bone in your body is in your ____.", truth: "ear" },
  { text: "A group of jellyfish is called a ____.", truth: "smack" },
  { text: "Sharks have been around longer than ____.", truth: "trees" },
  { text: "The longest river in the world is the ____.", truth: "Nile" },
  { text: "A baby goat is called a ____.", truth: "kid" },
  { text: "The loudest animal in the ocean is the ____.", truth: "sperm whale" },
  { text: "A ____ never stops growing throughout its life.", truth: "lobster" },
  { text: "Bananas grow pointing ____.", truth: "up" },
  { text: "The only continent with no spiders is ____.", truth: "Antarctica" },
  { text: "A ____ can taste with its entire body.", truth: "catfish" },
  { text: "The dot over a lowercase 'i' is called a ____.", truth: "tittle" },
  { text: "A group of owls is called a ____.", truth: "parliament" },
  { text: "Cows have best friends and get stressed when they are ____.", truth: "separated" },
  { text: "The fear of spiders is called ____.", truth: "arachnophobia" },
  { text: "A ____ can change colour to match its surroundings.", truth: "chameleon" },
  { text: "The largest planet in our solar system is ____.", truth: "Jupiter" },
  { text: "A group of frogs is called an ____.", truth: "army" },
  { text: "Octopuses have blue ____.", truth: "blood" },
  { text: "The fastest bird in the world is the peregrine ____.", truth: "falcon" },
  { text: "A ____'s tongue can be as long as its body.", truth: "chameleon" },
  { text: "The world's largest desert is ____.", truth: "Antarctica" },
  { text: "Wombats produce poop shaped like a ____.", truth: "cube" },
  { text: "A group of pandas is called an ____.", truth: "embarrassment" },
  { text: "Sea otters hold ____ while they sleep so they don't drift apart.", truth: "hands" },
  { text: "The hottest planet in our solar system is ____.", truth: "Venus" },
  { text: "A ____ has no bones and is made mostly of water.", truth: "jellyfish" },
  { text: "The national animal of Scotland is the ____.", truth: "unicorn" },
  { text: "A snail can have over 10,000 tiny ____.", truth: "teeth" },
  { text: "The colour of the sun is actually ____.", truth: "white" },
];

const PLAYER_EMOJIS = ['🦊', '🐸', '🐙', '🦄', '🐯', '🐼', '🦁', '🐨', '🦉', '🐺', '🐵', '🦖'];

const generateRoomCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
};

const normalize = (s) => String(s || '').toLowerCase().trim().replace(/[.\s]+$/, '').replace(/\s+/g, ' ');

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─── Confetti for the podium ──────────────────────────────────────────────────
const Confetti = () => {
  const particles = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#fb7185'][i % 6],
    size: Math.random() * 10 + 5,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.1 + 0.8,
    rotate: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.isCircle ? '50%' : '2px', top: 0 }}
          className="absolute"
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: 600, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
};

// ─── Scoreboard sidebar ───────────────────────────────────────────────────────
const Scoreboard = ({ players, title = 'Scores' }) => {
  const sorted = useMemo(() => [...players].sort((a, b) => (b.score || 0) - (a.score || 0)), [players]);
  return (
    <div className="bg-white/10 border border-white/15 rounded-2xl p-3">
      <h3 className="text-white/80 text-xs font-bold uppercase tracking-wide mb-2 px-1">{title}</h3>
      <div className="space-y-1.5">
        {sorted.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm ${i === 0 ? 'bg-yellow-400/25 border border-yellow-300/40' : 'bg-white/5 border border-white/10'}`}>
            <span className="text-base">{i === 0 ? '👑' : p.emoji}</span>
            <span className="text-white font-semibold truncate flex-1">{p.name}</span>
            {typeof p.roundScore === 'number' && p.roundScore > 0 && (
              <span className="text-emerald-300 font-bold text-xs">+{p.roundScore}</span>
            )}
            <span className="text-yellow-300 font-bold tabular-nums">{p.score || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const BluffBattleGame = ({ studentData, showToast }) => {
  const [screen, setScreen] = useState('home'); // home | lobby | game
  const [nameInput, setNameInput] = useState(studentData?.firstName || studentData?.name || '');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [myId] = useState(() => `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  const [roomData, setRoomData] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [fb, setFb] = useState(null);
  const [rounds, setRounds] = useState(5);

  const [lieInput, setLieInput] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const screenRef = useRef(screen);
  screenRef.current = screen;
  const roomDataRef = useRef(null);
  roomDataRef.current = roomData;

  // ── Load Firebase (same pattern as other multiplayer games) ──
  useEffect(() => {
    const load = async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, set, onValue, update, off, get, remove } = await import('firebase/database');
        setFb({ database, ref, set, onValue, update, off, get, remove });
      } catch {
        showToast?.('Failed to load game engine', 'error');
      }
    };
    load();
  }, []);

  const roomRef = useCallback((path = '') => fb.ref(fb.database, `bluffBattleRooms/${roomCode}${path}`), [fb, roomCode]);

  // ── Room listener ──
  useEffect(() => {
    if (!roomCode || !fb) return;
    const rRef = fb.ref(fb.database, `bluffBattleRooms/${roomCode}`);
    const handler = fb.onValue(rRef, (snap) => {
      const data = snap.val();
      if (!data) { showToast?.('The room was closed.', 'info'); setScreen('home'); setRoomCode(''); return; }
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
          fb.remove(fb.ref(fb.database, `bluffBattleRooms/${roomCode}/players/${myId}`));
        }
      } catch {}
    };
  }, [fb, roomCode, myId]);

  // ── Create / Join ──
  const createRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = generateRoomCode();
    await fb.set(fb.ref(fb.database, `bluffBattleRooms/${code}`), {
      roomCode: code,
      phase: 'lobby',
      hostId: myId,
      createdAt: Date.now(),
      roundNumber: 0,
      settings: { rounds, writeTime: 50, voteTime: 30 },
      players: {
        [myId]: { id: myId, name: nameInput.trim(), score: 0, roundScore: 0, emoji: PLAYER_EMOJIS[0], isHost: true },
      },
    });
    setRoomCode(code);
    setIsHost(true);
    setScreen('lobby');
  }, [fb, nameInput, myId, rounds, showToast]);

  const joinRoom = useCallback(async () => {
    if (!fb || !nameInput.trim()) { showToast?.('Enter your name first!', 'error'); return; }
    const code = roomCodeInput.trim().toUpperCase();
    if (code.length !== 4) { showToast?.('Room code must be 4 letters!', 'error'); return; }
    const snap = await fb.get(fb.ref(fb.database, `bluffBattleRooms/${code}`));
    const data = snap.val();
    if (!data) { showToast?.('Room not found! Check the code.', 'error'); return; }
    if (data.phase !== 'lobby') { showToast?.('That game already started!', 'error'); return; }
    const playerCount = Object.keys(data.players || {}).length;
    if (playerCount >= 12) { showToast?.('Room is full!', 'error'); return; }
    await fb.update(fb.ref(fb.database, `bluffBattleRooms/${code}/players/${myId}`), {
      id: myId, name: nameInput.trim(), score: 0, roundScore: 0,
      emoji: PLAYER_EMOJIS[playerCount % PLAYER_EMOJIS.length], isHost: false,
    });
    setRoomCode(code);
    setIsHost(false);
    setScreen('lobby');
  }, [fb, nameInput, roomCodeInput, myId, showToast]);

  const leaveRoom = useCallback(async () => {
    try {
      const rd = roomDataRef.current;
      if (fb && roomCode) {
        if (rd?.hostId === myId) {
          await fb.remove(roomRef());
        } else {
          await fb.remove(roomRef(`/players/${myId}`));
        }
      }
    } catch {}
    setScreen('home');
    setRoomCode('');
    setRoomData(null);
  }, [fb, roomCode, myId, roomRef]);

  // ── Round orchestration (host only) ──
  const beginRound = useCallback(async (roundNumber, promptPool) => {
    const prompt = promptPool[(roundNumber - 1) % promptPool.length];
    const playerUpdates = {};
    Object.keys(roomDataRef.current?.players || {}).forEach((pid) => { playerUpdates[`${pid}/roundScore`] = 0; });
    await fb.update(roomRef('/players'), playerUpdates);
    await fb.update(roomRef(), {
      phase: 'writing',
      roundNumber,
      prompt,
      answers: null,
      options: null,
      votes: null,
      summary: null,
      truthMatchers: null,
      writeEndsAt: Date.now() + ((roomDataRef.current?.settings?.writeTime || 50) * 1000),
    });
  }, [fb, roomRef]);

  const startGame = useCallback(async () => {
    if (!fb || !isHost || !roomData) return;
    const playerList = Object.values(roomData.players || {});
    if (playerList.length < 2) { showToast?.('Need at least 2 players to start!', 'error'); return; }
    const pool = shuffle(PROMPTS);
    await fb.update(roomRef(), { settings: { rounds, writeTime: 50, voteTime: 30 }, promptPool: pool });
    await beginRound(1, pool);
  }, [fb, isHost, roomData, rounds, roomRef, beginRound, showToast]);

  // Build the shuffled voting options from everyone's lies + the truth.
  const buildOptions = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd || rd.phase !== 'writing') return;
    const truth = rd.prompt?.truth || '';
    const truthNorm = normalize(truth);
    const answers = rd.answers || {};
    const options = [];
    const truthMatchers = []; // players who accidentally wrote the truth
    let oid = 0;
    Object.entries(answers).forEach(([pid, ans]) => {
      const text = String(ans?.text || '').trim();
      if (!text) return;
      if (normalize(text) === truthNorm) { truthMatchers.push(pid); return; }
      // merge identical lies from different players
      const existing = options.find((o) => normalize(o.text) === normalize(text));
      if (existing) { existing.ownerIds.push(pid); return; }
      options.push({ oid: `o${oid++}`, text, ownerIds: [pid], isTruth: false });
    });
    options.push({ oid: 'truth', text: truth, ownerIds: [], isTruth: true });
    await fb.update(roomRef(), {
      phase: 'voting',
      options: shuffle(options),
      truthMatchers,
      voteEndsAt: Date.now() + ((rd.settings?.voteTime || 30) * 1000),
    });
  }, [fb, roomRef]);

  // Tally votes and award points.
  const scoreRound = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd || rd.phase !== 'voting') return;
    const options = rd.options || [];
    const votes = rd.votes || {};
    const playersObj = rd.players || {};
    const truthMatchers = rd.truthMatchers || [];

    const gains = {}; // pid -> points this round
    Object.keys(playersObj).forEach((pid) => { gains[pid] = 0; });

    Object.entries(votes).forEach(([voterId, oid]) => {
      const opt = options.find((o) => o.oid === oid);
      if (!opt) return;
      if (opt.isTruth) {
        if (gains[voterId] != null) gains[voterId] += 1000;
      } else {
        (opt.ownerIds || []).forEach((owner) => { if (gains[owner] != null) gains[owner] += 500; });
      }
    });
    truthMatchers.forEach((pid) => { if (gains[pid] != null) gains[pid] += 1000; });

    const results = options.map((o) => ({
      text: o.text,
      isTruth: !!o.isTruth,
      owners: (o.ownerIds || []).map((id) => playersObj[id]?.name || '???'),
      voters: Object.entries(votes).filter(([, vo]) => vo === o.oid).map(([vid]) => playersObj[vid]?.name || '???'),
    }));

    const updates = {
      phase: 'reveal',
      summary: { truth: rd.prompt?.truth || '', results, matchers: truthMatchers.map((id) => playersObj[id]?.name || '???'), scoredAt: Date.now() },
    };
    Object.keys(playersObj).forEach((pid) => {
      updates[`players/${pid}/roundScore`] = gains[pid] || 0;
      updates[`players/${pid}/score`] = (playersObj[pid].score || 0) + (gains[pid] || 0);
    });
    await fb.update(roomRef(), updates);
  }, [fb, roomRef]);

  const nextRound = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd) return;
    const next = (rd.roundNumber || 1) + 1;
    if (next > (rd.settings?.rounds || 5)) {
      await fb.update(roomRef(), { phase: 'gameEnd' });
    } else {
      await beginRound(next, rd.promptPool || PROMPTS);
    }
  }, [fb, roomRef, beginRound]);

  const playAgain = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd) return;
    const resetPlayers = {};
    Object.keys(rd.players || {}).forEach((pid) => { resetPlayers[`${pid}/score`] = 0; resetPlayers[`${pid}/roundScore`] = 0; });
    await fb.update(roomRef('/players'), resetPlayers);
    await fb.update(roomRef(), { phase: 'lobby', roundNumber: 0, prompt: null, answers: null, options: null, votes: null, summary: null, truthMatchers: null });
  }, [fb, roomRef]);

  // ── Host watchdog: phase timeouts & "everyone done" early advance ──
  useEffect(() => {
    if (!isHost || !fb || !roomData) return;
    const t = setInterval(() => {
      const rd = roomDataRef.current;
      if (!rd) return;
      const ts = Date.now();
      const playerIds = Object.keys(rd.players || {});
      if (rd.phase === 'writing') {
        const answered = Object.keys(rd.answers || {}).length;
        if ((playerIds.length > 0 && answered >= playerIds.length) || ts > (rd.writeEndsAt || 0)) buildOptions();
      } else if (rd.phase === 'voting') {
        const voted = Object.keys(rd.votes || {}).length;
        const expected = playerIds.length - (rd.truthMatchers || []).length;
        if ((expected > 0 && voted >= expected) || ts > (rd.voteEndsAt || 0)) scoreRound();
      } else if (rd.phase === 'reveal' && rd.summary?.scoredAt && ts > rd.summary.scoredAt + 9000) {
        nextRound();
      }
    }, 600);
    return () => clearInterval(t);
  }, [isHost, fb, roomData, buildOptions, scoreRound, nextRound]);

  // ── Player actions ──
  const submitLie = useCallback(async () => {
    const rd = roomDataRef.current;
    if (!fb || !rd || rd.phase !== 'writing') return;
    const text = lieInput.trim();
    if (!text) { showToast?.('Type a bluff first!', 'error'); return; }
    if (text.length > 60) { showToast?.('Keep your bluff short and snappy!', 'error'); return; }
    await fb.update(roomRef(`/answers/${myId}`), { text, by: rd.players?.[myId]?.name || 'Player' });
    setLieInput('');
  }, [fb, roomRef, lieInput, myId, showToast]);

  const castVote = useCallback(async (oid) => {
    const rd = roomDataRef.current;
    if (!fb || !rd || rd.phase !== 'voting') return;
    await fb.update(roomRef('/votes'), { [myId]: oid });
  }, [fb, roomRef, myId]);

  // ── Derived state ──
  const players = useMemo(() => Object.values(roomData?.players || {}), [roomData]);
  const phase = roomData?.phase;
  const myAnswered = !!(roomData?.answers && roomData.answers[myId]);
  const myVote = roomData?.votes?.[myId];
  const amTruthMatcher = (roomData?.truthMatchers || []).includes(myId);
  const secondsLeft = (endsAt) => Math.max(0, Math.ceil(((endsAt || 0) - now) / 1000));

  // ═══════════════════════ HOME SCREEN ═══════════════════════
  if (screen === 'home') {
    return (
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 md:p-8 shadow-2xl">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <motion.div initial={{ scale: 0.8, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="text-6xl mb-2">🎭</motion.div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow">Bluff Battle</h1>
            <p className="text-white/80 mt-2 text-sm md:text-base">Invent a believable <b>lie</b>, then sniff out the <b>truth</b> hidden among everyone&apos;s bluffs. Fool your friends to win!</p>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 space-y-4">
            <div>
              <label className="text-white/80 text-xs font-bold uppercase tracking-wide">Your Name</label>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={14}
                placeholder="Enter your name"
                className="w-full mt-1 px-4 py-3 rounded-xl bg-white/90 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
            </div>

            <button onClick={createRoom} disabled={!fb} className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-extrabold text-lg shadow-lg transition disabled:opacity-50">
              ✨ Create a Room
            </button>

            <div className="flex items-center gap-3 text-white/50 text-xs">
              <div className="flex-1 h-px bg-white/20" /> OR <div className="flex-1 h-px bg-white/20" />
            </div>

            <div className="flex gap-2">
              <input
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="CODE"
                className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-gray-800 font-extrabold text-center tracking-[0.4em] uppercase focus:outline-none focus:ring-2 focus:ring-yellow-300"
              />
              <button onClick={joinRoom} disabled={!fb} className="px-6 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold transition disabled:opacity-50">
                Join
              </button>
            </div>
          </div>

          <p className="text-center text-white/60 text-xs mt-4">2–12 players • Best with a big group • Grab a few friends!</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════ LOBBY SCREEN ═══════════════════════
  if (screen === 'lobby') {
    return (
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5 md:p-8 shadow-2xl">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-white/70 text-sm font-semibold uppercase tracking-wide">Room Code</p>
            <div className="text-5xl md:text-6xl font-black text-yellow-300 tracking-[0.3em] drop-shadow my-2">{roomCode}</div>
            <button
              onClick={() => { try { navigator.clipboard.writeText(roomCode); showToast?.('Room code copied!', 'success'); } catch {} }}
              className="text-white/70 hover:text-white text-xs underline"
            >
              📋 Copy code & share with friends
            </button>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-2xl p-4 mb-5">
            <h3 className="text-white font-bold mb-3 flex items-center justify-between">
              <span>Players ({players.length})</span>
              <span className="text-white/60 text-sm font-normal">Need 2+ to start</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((p) => (
                <motion.div key={p.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-white font-semibold truncate">{p.name}</span>
                  {p.isHost && <span className="text-yellow-300 text-xs">👑</span>}
                </motion.div>
              ))}
            </div>
          </div>

          {isHost ? (
            <div className="space-y-3">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-white font-semibold">Number of rounds</span>
                <div className="flex gap-2">
                  {[3, 5, 7].map((r) => (
                    <button key={r} onClick={() => setRounds(r)} className={`w-11 h-11 rounded-xl font-bold transition ${rounds === r ? 'bg-yellow-400 text-purple-900' : 'bg-white/15 text-white hover:bg-white/25'}`}>{r}</button>
                  ))}
                </div>
              </div>
              <button onClick={startGame} className="w-full py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-extrabold text-lg shadow-lg transition">
                🚀 Start Bluff Battle
              </button>
            </div>
          ) : (
            <div className="text-center text-white/80 py-4 animate-pulse">Waiting for the host to start the game…</div>
          )}

          <button onClick={leaveRoom} className="w-full mt-3 py-2 text-white/60 hover:text-white text-sm transition">← Leave room</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════ GAME SCREEN ═══════════════════════
  const roundLabel = `Round ${roomData?.roundNumber || 1} of ${roomData?.settings?.rounds || 5}`;

  return (
    <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 p-4 md:p-6 shadow-2xl relative">
      {phase === 'gameEnd' && <Confetti />}
      <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_240px] gap-4">
        {/* Main panel */}
        <div className="min-h-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full bg-white/15 text-white text-sm font-bold">{roundLabel}</span>
            {(phase === 'writing' || phase === 'voting') && (
              <span className="px-3 py-1 rounded-full bg-black/25 text-yellow-300 font-bold tabular-nums">
                ⏱ {secondsLeft(phase === 'writing' ? roomData?.writeEndsAt : roomData?.voteEndsAt)}s
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* WRITING */}
            {phase === 'writing' && (
              <motion.div key="writing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="bg-white rounded-2xl p-5 md:p-6 shadow-lg">
                  <p className="text-purple-600 font-bold text-sm uppercase tracking-wide mb-2">Fill in the blank with a believable lie 🤥</p>
                  <p className="text-xl md:text-2xl font-extrabold text-gray-800 leading-snug">
                    {(roomData?.prompt?.text || '').replace('____', '________')}
                  </p>
                </div>
                {!myAnswered ? (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input
                      value={lieInput}
                      onChange={(e) => setLieInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitLie()}
                      maxLength={60}
                      autoFocus
                      placeholder="Type your sneaky answer…"
                      className="flex-1 px-4 py-3 rounded-xl bg-white/95 text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    />
                    <button onClick={submitLie} className="px-6 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-extrabold shadow-lg transition">Submit Bluff</button>
                  </div>
                ) : (
                  <div className="mt-4 bg-emerald-500/20 border border-emerald-300/40 rounded-xl p-4 text-center text-white font-semibold">
                    ✅ Bluff locked in! Waiting for the others…
                    <div className="text-white/70 text-sm mt-1">{Object.keys(roomData?.answers || {}).length} / {players.length} ready</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* VOTING */}
            {phase === 'voting' && (
              <motion.div key="voting" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <div className="bg-white rounded-2xl p-4 md:p-5 shadow-lg mb-4">
                  <p className="text-purple-600 font-bold text-sm uppercase tracking-wide mb-1">Which one is the TRUTH? 🔍</p>
                  <p className="text-lg md:text-xl font-extrabold text-gray-800 leading-snug">{(roomData?.prompt?.text || '').replace('____', '________')}</p>
                </div>
                {amTruthMatcher ? (
                  <div className="bg-yellow-400/20 border border-yellow-300/40 rounded-xl p-4 text-center text-white font-semibold">
                    🎯 Whoa — your bluff was actually the truth! You score big this round. Sit back and watch.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {(roomData?.options || []).map((o) => {
                      const mine = (o.ownerIds || []).includes(myId);
                      const chosen = myVote === o.oid;
                      return (
                        <button
                          key={o.oid}
                          disabled={mine || !!myVote}
                          onClick={() => castVote(o.oid)}
                          className={`text-left px-4 py-3 rounded-xl font-bold transition border-2 ${
                            chosen ? 'bg-yellow-400 text-purple-900 border-yellow-200 scale-[1.02]'
                            : mine ? 'bg-white/10 text-white/40 border-white/10 cursor-not-allowed'
                            : 'bg-white/90 text-gray-800 border-transparent hover:border-yellow-300 hover:scale-[1.02]'
                          }`}
                        >
                          {o.text}
                          {mine && <span className="block text-xs font-normal mt-0.5">(your bluff — can&apos;t vote this)</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
                {myVote && !amTruthMatcher && (
                  <div className="mt-3 text-center text-white/80 font-semibold">Vote locked in! Waiting for everyone… ({Object.keys(roomData?.votes || {}).length} / {players.length - (roomData?.truthMatchers || []).length})</div>
                )}
              </motion.div>
            )}

            {/* REVEAL */}
            {phase === 'reveal' && roomData?.summary && (
              <motion.div key="reveal" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-white rounded-2xl p-5 shadow-lg mb-3 text-center">
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">The truth was</p>
                  <p className="text-2xl md:text-3xl font-black text-emerald-600 mt-1">{roomData.summary.truth}</p>
                </div>
                <div className="space-y-2">
                  {(roomData.summary.results || []).map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className={`rounded-xl p-3 border ${r.isTruth ? 'bg-emerald-500/25 border-emerald-300/50' : 'bg-white/10 border-white/15'}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white font-bold">{r.isTruth ? '✅ ' : '🤥 '}{r.text}</span>
                        <span className="text-white/70 text-sm whitespace-nowrap">{(r.voters || []).length} vote{(r.voters || []).length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="text-white/60 text-xs mt-1">
                        {!r.isTruth && (r.owners || []).length > 0 && <>Bluff by <b className="text-pink-200">{r.owners.join(', ')}</b>. </>}
                        {(r.voters || []).length > 0 && <>Fooled: {r.voters.join(', ')}</>}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {(roomData.summary.matchers || []).length > 0 && (
                  <p className="text-center text-yellow-300 text-sm font-semibold mt-3">🎯 {roomData.summary.matchers.join(', ')} guessed the actual truth!</p>
                )}
              </motion.div>
            )}

            {/* GAME END */}
            {phase === 'gameEnd' && (
              <motion.div key="end" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <h2 className="text-3xl font-black text-white mb-1">🏆 Final Results</h2>
                <p className="text-white/70 mb-5">What a battle of wits!</p>
                <div className="space-y-2 max-w-md mx-auto">
                  {[...players].sort((a, b) => (b.score || 0) - (a.score || 0)).map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                        i === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-900'
                        : i === 1 ? 'bg-gray-200 text-gray-800'
                        : i === 2 ? 'bg-amber-700/70 text-white' : 'bg-white/10 text-white'
                      }`}
                    >
                      <span className="text-2xl font-black w-8">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <span className="text-2xl">{p.emoji}</span>
                      <span className="font-extrabold flex-1 text-left truncate">{p.name}</span>
                      <span className="font-black text-lg tabular-nums">{p.score || 0}</span>
                    </motion.div>
                  ))}
                </div>
                {isHost && (
                  <button onClick={playAgain} className="mt-6 px-8 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-extrabold shadow-lg transition">🔁 Play Again</button>
                )}
                <button onClick={leaveRoom} className="block mx-auto mt-3 text-white/60 hover:text-white text-sm transition">← Leave room</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Scoreboard players={players} title={phase === 'reveal' ? 'This Round' : 'Scores'} />
          {phase !== 'gameEnd' && (
            <button onClick={leaveRoom} className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition">Leave game</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BluffBattleGame;
