// components/games/UNOGame.js - Full multiplayer UNO (up to 4 players)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Card Data ────────────────────────────────────────────────────────────────
const COLORS = ['red', 'yellow', 'green', 'blue'];
const COLOR_HEX = { red: '#ef4444', yellow: '#eab308', green: '#22c55e', blue: '#3b82f6' };
const COLOR_DARK = { red: '#991b1b', yellow: '#713f12', green: '#14532d', blue: '#1e3a8a' };
const COLOR_LIGHT = { red: '#fca5a5', yellow: '#fde68a', green: '#86efac', blue: '#93c5fd' };
const COLOR_BG = { red: 'from-red-600 to-red-800', yellow: 'from-yellow-500 to-yellow-700', green: 'from-green-600 to-green-800', blue: 'from-blue-600 to-blue-800', wild: 'from-purple-600 via-red-500 to-yellow-500' };

function buildDeck() {
  const deck = [];
  let id = 0;
  COLORS.forEach(color => {
    // 0 card (one of each)
    deck.push({ id: id++, color, value: '0', type: 'number' });
    // 1-9 twice each
    for (let n = 1; n <= 9; n++) {
      deck.push({ id: id++, color, value: String(n), type: 'number' });
      deck.push({ id: id++, color, value: String(n), type: 'number' });
    }
    // Action cards x2
    ['Skip', 'Reverse', '+2'].forEach(action => {
      deck.push({ id: id++, color, value: action, type: 'action' });
      deck.push({ id: id++, color, value: action, type: 'action' });
    });
  });
  // Wild x4, Wild +4 x4
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'wild', value: 'Wild', type: 'wild' });
    deck.push({ id: id++, color: 'wild', value: '+4', type: 'wild4' });
  }
  return deck;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Card Visual Component ────────────────────────────────────────────────────
const UNOCard = ({ card, onClick, disabled, small, selected, faceDown, style }) => {
  if (!card) return null;
  const isWild = card.color === 'wild';
  const hex = isWild ? null : COLOR_HEX[card.color];

  const sizeClass = small
    ? 'w-10 h-16 text-sm rounded-lg'
    : 'w-20 h-28 md:w-24 md:h-32 text-lg rounded-xl';

  const innerContent = () => {
    if (faceDown) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-[inherit] flex items-center justify-center border-4 border-white/20">
          <div className="text-white font-black text-xl opacity-40">UNO</div>
        </div>
      );
    }
    if (isWild) {
      return (
        <div className="w-full h-full bg-black rounded-[inherit] flex flex-col items-center justify-center relative overflow-hidden border-4 border-white/30">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-red-500/80" />
            <div className="bg-yellow-500/80" />
            <div className="bg-blue-500/80" />
            <div className="bg-green-500/80" />
          </div>
          <div className="relative z-10 bg-black/60 rounded-full px-2 py-0.5">
            <span className="text-white font-black text-xs md:text-sm drop-shadow-lg">
              {card.value === 'Wild' ? 'WILD' : '+4'}
            </span>
          </div>
        </div>
      );
    }
    return (
      <div
        className="w-full h-full rounded-[inherit] flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${hex}, ${COLOR_DARK[card.color]})` }}
      >
        {/* Corner values */}
        <span className="absolute top-1 left-1.5 text-white font-black text-xs leading-none drop-shadow" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{card.value}</span>
        <span className="absolute bottom-1 right-1.5 text-white font-black text-xs leading-none rotate-180 drop-shadow">{card.value}</span>
        {/* Center oval */}
        <div
          className="absolute inset-[12%] rounded-full rotate-[-30deg] opacity-30"
          style={{ background: 'rgba(255,255,255,0.3)' }}
        />
        {/* Center value */}
        <span className="relative z-10 text-white font-black drop-shadow-lg"
          style={{ fontSize: small ? '1rem' : card.value.length > 2 ? '0.9rem' : '1.5rem', textShadow: '0 2px 6px rgba(0,0,0,0.6)' }}>
          {card.value === 'Skip' ? '🚫' : card.value === 'Reverse' ? '🔄' : card.value === '+2' ? '+2' : card.value}
        </span>
      </div>
    );
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      style={style}
      whileHover={!disabled ? { y: -12, scale: 1.08 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`
        ${sizeClass} relative flex-shrink-0 shadow-xl cursor-pointer select-none
        border-4 transition-all duration-150
        ${selected ? 'border-yellow-400 ring-4 ring-yellow-400/60 -translate-y-4 scale-110' : 'border-white/50'}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-white'}
        focus:outline-none
      `}
    >
      {innerContent()}
    </motion.button>
  );
};

// ─── Color Picker ─────────────────────────────────────────────────────────────
const ColorPicker = ({ onPick }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0, opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
  >
    <div className="bg-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
      <h3 className="text-white font-black text-2xl mb-6">Choose a Color</h3>
      <div className="grid grid-cols-2 gap-4">
        {COLORS.map(color => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPick(color)}
            className="w-24 h-24 rounded-2xl shadow-xl border-4 border-white/30 font-black text-white text-lg capitalize"
            style={{ background: `linear-gradient(135deg, ${COLOR_HEX[color]}, ${COLOR_DARK[color]})` }}
          >
            {color}
          </motion.button>
        ))}
      </div>
    </div>
  </motion.div>
);

// ─── Leaderboard ─────────────────────────────────────────────────────────────
const Leaderboard = ({ entries, currentPlayerId }) => (
  <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-white/10 p-4">
    <h3 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2">
      🏆 UNO Leaderboard
    </h3>
    {entries.length === 0 ? (
      <p className="text-slate-400 text-sm text-center py-4">No wins recorded yet. Play to get on the board!</p>
    ) : (
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={entry.id} className={`flex items-center gap-3 p-2 rounded-xl ${entry.id === currentPlayerId ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'}`}>
            <span className="text-lg font-black w-7 text-center">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
            <span className={`flex-1 font-bold text-sm ${entry.id === currentPlayerId ? 'text-yellow-300' : 'text-white'}`}>{entry.name}</span>
            <div className="text-right">
              <div className="text-yellow-400 font-black text-sm">{entry.wins}W</div>
              <div className="text-slate-500 text-xs">{entry.gamesPlayed}GP</div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Main Game Component ───────────────────────────────────────────────────────
const UNOGame = ({ studentData, showToast, classmates }) => {
  // Firebase
  const [firebase, setFirebase] = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // UI State
  const [screen, setScreen] = useState('menu'); // menu | waiting | playing | finished
  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [animatingCard, setAnimatingCard] = useState(null);

  // Game State (synced from Firebase)
  const [gameData, setGameData] = useState(null);
  const [myPlayerId] = useState(() => studentData?.id || `guest_${Date.now()}`);

  // Local Stats (localStorage)
  const [leaderboard, setLeaderboard] = useState([]);

  const gameRoom = useRef(null);
  const listenerRef = useRef(null);

  const playerInfo = {
    id: myPlayerId,
    name: studentData?.firstName || 'Player',
  };

  // ── Init Firebase ──
  useEffect(() => {
    (async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, onValue, set, update, remove, off, get } = await import('firebase/database');
        setFirebase({ database, ref, onValue, set, update, remove, off, get });
        setFirebaseReady(true);
      } catch (e) {
        console.error('Firebase init failed', e);
        showToast('Could not connect to game server', 'error');
      }
    })();
  }, []);

  // ── Load Leaderboard from localStorage ──
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('uno_leaderboard') || '[]');
      setLeaderboard(stored);
    } catch { setLeaderboard([]); }
  }, []);

  const saveLeaderboard = (entries) => {
    setLeaderboard(entries);
    localStorage.setItem('uno_leaderboard', JSON.stringify(entries));
  };

  const recordWin = useCallback((winnerId, winnerName, allPlayerIds) => {
    const stored = JSON.parse(localStorage.getItem('uno_leaderboard') || '[]');
    const updated = [...stored];
    allPlayerIds.forEach(pid => {
      const idx = updated.findIndex(e => e.id === pid);
      if (idx >= 0) {
        updated[idx] = { ...updated[idx], gamesPlayed: (updated[idx].gamesPlayed || 0) + 1 };
      }
    });
    const winnerIdx = updated.findIndex(e => e.id === winnerId);
    if (winnerIdx >= 0) {
      updated[winnerIdx] = { ...updated[winnerIdx], wins: (updated[winnerIdx].wins || 0) + 1 };
    } else {
      updated.push({ id: winnerId, name: winnerName, wins: 1, gamesPlayed: 1 });
    }
    updated.sort((a, b) => (b.wins || 0) - (a.wins || 0));
    saveLeaderboard(updated.slice(0, 20));
  }, []);

  // Ensure player is in leaderboard entries
  const ensurePlayerInLeaderboard = useCallback((pid, pname) => {
    const stored = JSON.parse(localStorage.getItem('uno_leaderboard') || '[]');
    if (!stored.find(e => e.id === pid)) {
      const updated = [...stored, { id: pid, name: pname, wins: 0, gamesPlayed: 0 }];
      saveLeaderboard(updated);
    }
  }, []);

  // ── Firebase Listener ──
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom.current) return;
    const roomRef = firebase.ref(firebase.database, `uno/${gameRoom.current}`);
    const unsub = firebase.onValue(roomRef, snap => {
      const data = snap.val();
      if (!data) {
        setScreen('menu');
        setGameData(null);
        showToast('The game room was closed.', 'info');
        return;
      }
      setGameData(data);
      if (data.status === 'playing' && screen === 'waiting') setScreen('playing');
      if (data.status === 'finished' && screen !== 'finished') {
        setScreen('finished');
        if (data.winnerId) {
          const isWinner = data.winnerId === myPlayerId;
          showToast(isWinner ? '🎉 You won! 🎉' : `${data.winnerName} wins!`, isWinner ? 'success' : 'info');
          recordWin(data.winnerId, data.winnerName, Object.keys(data.players || {}));
          // Reload leaderboard
          const stored = JSON.parse(localStorage.getItem('uno_leaderboard') || '[]');
          setLeaderboard(stored);
        }
      }
    });
    listenerRef.current = () => firebase.off(roomRef, 'value', unsub);
    return () => { if (listenerRef.current) listenerRef.current(); };
  }, [firebaseReady, firebase, screen, myPlayerId]);

  // ── Game Logic Helpers ──
  const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

  const canPlayCard = (card, topCard, currentColor) => {
    if (!topCard) return true;
    if (card.type === 'wild' || card.type === 'wild4') return true;
    if (card.color === currentColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  const getNextPlayerIndex = (currentIdx, players, direction, skip = false) => {
    const n = players.length;
    const step = direction === 1 ? 1 : -1;
    let next = ((currentIdx + step) % n + n) % n;
    if (skip) next = ((next + step) % n + n) % n;
    return next;
  };

  const buildInitialGameState = (players) => {
    let deck = shuffle(buildDeck());
    const hands = {};
    players.forEach(p => {
      hands[p.id] = deck.splice(0, 7);
    });
    // Find a non-wild starting card
    let topIdx = deck.findIndex(c => c.color !== 'wild' && c.type !== 'wild4');
    if (topIdx < 0) topIdx = 0;
    const [topCard] = deck.splice(topIdx, 1);
    return {
      deck,
      hands,
      discardPile: [topCard],
      currentColor: topCard.color,
      currentPlayerIndex: 0,
      direction: 1,
      status: 'playing',
      lastAction: null,
      winnerId: null,
      winnerName: null,
      drawStack: 0,
    };
  };

  // ── Create Game ──
  const createGame = async () => {
    if (!firebaseReady || !firebase) { showToast('Connecting...', 'info'); return; }
    setLoading(true);
    const code = generateRoomCode();
    gameRoom.current = code;
    try {
      await firebase.set(firebase.ref(firebase.database, `uno/${code}`), {
        roomCode: code,
        hostId: myPlayerId,
        players: { [myPlayerId]: { id: myPlayerId, name: playerInfo.name, handSize: 7, order: 0 } },
        playerOrder: [myPlayerId],
        status: 'waiting',
        createdAt: Date.now(),
      });
      setRoomCode(code);
      setScreen('waiting');
      ensurePlayerInLeaderboard(myPlayerId, playerInfo.name);
      showToast(`Room created! Code: ${code}`, 'success');
    } catch (e) {
      showToast('Failed to create room', 'error');
      gameRoom.current = null;
    }
    setLoading(false);
  };

  // ── Join Game ──
  const joinGame = async () => {
    if (!firebaseReady || !firebase) return;
    const code = joinCode.trim().toUpperCase();
    if (!code) { showToast('Enter a room code', 'error'); return; }
    setLoading(true);
    try {
      const snap = await firebase.get(firebase.ref(firebase.database, `uno/${code}`));
      const data = snap.val();
      if (!data) { showToast('Room not found', 'error'); setLoading(false); return; }
      if (data.status !== 'waiting') { showToast('Game already started', 'error'); setLoading(false); return; }
      const currentPlayers = Object.keys(data.players || {});
      if (currentPlayers.length >= 4) { showToast('Room is full (max 4 players)', 'error'); setLoading(false); return; }
      if (currentPlayers.includes(myPlayerId)) { showToast('You are already in this room', 'info'); setLoading(false); return; }
      const order = currentPlayers.length;
      await firebase.update(firebase.ref(firebase.database, `uno/${code}`), {
        [`players/${myPlayerId}`]: { id: myPlayerId, name: playerInfo.name, handSize: 0, order },
        playerOrder: [...currentPlayers, myPlayerId],
      });
      gameRoom.current = code;
      setRoomCode(code);
      setScreen('waiting');
      ensurePlayerInLeaderboard(myPlayerId, playerInfo.name);
      showToast('Joined room!', 'success');
    } catch (e) {
      showToast('Failed to join', 'error');
    }
    setLoading(false);
  };

  // ── Start Game (host only) ──
  const startGame = async () => {
    if (!gameData || !firebase) return;
    const playerOrder = gameData.playerOrder || [];
    if (playerOrder.length < 2) { showToast('Need at least 2 players', 'error'); return; }
    const players = playerOrder.map(id => ({ id, name: gameData.players[id]?.name || id }));
    const state = buildInitialGameState(players);
    await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), {
      ...state,
      playerOrder,
    });
    setScreen('playing');
  };

  // ── Play a Card ──
  const playCard = async (card, chosenColor) => {
    if (!gameData || !firebase) return;
    const { hands, discardPile, currentPlayerIndex, playerOrder, direction, drawStack } = gameData;
    const myHand = [...(hands[myPlayerId] || [])];
    const cardIdx = myHand.findIndex(c => c.id === card.id);
    if (cardIdx < 0) return;
    myHand.splice(cardIdx, 1);

    const newDiscardPile = [...discardPile, card];
    let newColor = chosenColor || card.color;
    let newDirection = direction;
    let newDrawStack = 0;
    let skipCount = 0;

    if (card.value === 'Reverse') {
      newDirection = direction === 1 ? -1 : 1;
      if (playerOrder.length === 2) skipCount = 1; // In 2-player, reverse acts as skip
    }
    if (card.value === 'Skip') skipCount = 1;
    if (card.value === '+2') newDrawStack = (drawStack || 0) + 2;
    if (card.type === 'wild4') newDrawStack = (drawStack || 0) + 4;

    const nextIdx = getNextPlayerIndex(currentPlayerIndex, playerOrder, newDirection, skipCount > 0);
    const newHands = { ...hands, [myPlayerId]: myHand };

    // Force next player to draw if drawStack
    if (newDrawStack > 0) {
      const nextPlayerId = playerOrder[nextIdx];
      const nextHand = [...(newHands[nextPlayerId] || [])];
      let { deck } = gameData;
      for (let i = 0; i < newDrawStack; i++) {
        if (deck.length === 0) deck = shuffle(newDiscardPile.slice(0, -1));
        if (deck.length > 0) nextHand.push(deck.shift());
      }
      newHands[nextPlayerId] = nextHand;
    }

    // Check win
    let winnerId = null, winnerName = null;
    if (myHand.length === 0) {
      winnerId = myPlayerId;
      winnerName = playerInfo.name;
    }

    // Update handSizes
    const updatedPlayers = { ...gameData.players };
    Object.keys(newHands).forEach(pid => {
      if (updatedPlayers[pid]) updatedPlayers[pid] = { ...updatedPlayers[pid], handSize: newHands[pid].length };
    });

    await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), {
      hands: newHands,
      discardPile: newDiscardPile,
      currentColor: newColor,
      currentPlayerIndex: nextIdx,
      direction: newDirection,
      drawStack: newDrawStack > 0 ? 0 : 0, // stack already resolved
      lastAction: { type: 'play', playerId: myPlayerId, card, timestamp: Date.now() },
      players: updatedPlayers,
      status: winnerId ? 'finished' : 'playing',
      winnerId,
      winnerName,
    });

    setSelectedCard(null);
    setAnimatingCard(card.id);
    setTimeout(() => setAnimatingCard(null), 600);
  };

  // ── Draw a Card ──
  const drawCard = async () => {
    if (!gameData || !firebase) return;
    let { deck, discardPile } = gameData;
    const { hands, currentPlayerIndex, playerOrder, direction } = gameData;

    if (deck.length === 0) {
      const newDeck = shuffle(discardPile.slice(0, -1));
      deck = newDeck;
    }
    if (deck.length === 0) { showToast('No cards left to draw!', 'info'); return; }

    const drawn = deck[0];
    const newDeck = deck.slice(1);
    const myHand = [...(hands[myPlayerId] || []), drawn];
    const nextIdx = getNextPlayerIndex(currentPlayerIndex, playerOrder, direction);
    const newHands = { ...hands, [myPlayerId]: myHand };

    const updatedPlayers = { ...gameData.players };
    if (updatedPlayers[myPlayerId]) updatedPlayers[myPlayerId] = { ...updatedPlayers[myPlayerId], handSize: myHand.length };

    await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), {
      deck: newDeck,
      hands: newHands,
      currentPlayerIndex: nextIdx,
      lastAction: { type: 'draw', playerId: myPlayerId, timestamp: Date.now() },
      players: updatedPlayers,
    });
  };

  // ── Handle card click ──
  const handleCardClick = (card) => {
    if (!gameData) return;
    const { discardPile, currentColor, currentPlayerIndex, playerOrder } = gameData;
    const isMyTurn = playerOrder[currentPlayerIndex] === myPlayerId;
    if (!isMyTurn) { showToast("It's not your turn!", 'warning'); return; }
    const topCard = discardPile[discardPile.length - 1];
    if (!canPlayCard(card, topCard, currentColor)) { showToast("You can't play that card!", 'warning'); return; }

    if (card.type === 'wild' || card.type === 'wild4') {
      setPendingWildCard(card);
      setShowColorPicker(true);
      return;
    }
    setSelectedCard(card.id);
    setTimeout(() => playCard(card, null), 200);
  };

  const handleColorPick = (color) => {
    setShowColorPicker(false);
    if (pendingWildCard) {
      setSelectedCard(pendingWildCard.id);
      setTimeout(() => { playCard(pendingWildCard, color); setPendingWildCard(null); }, 200);
    }
  };

  const leaveGame = async () => {
    if (firebase && gameRoom.current) {
      try {
        if (gameData?.hostId === myPlayerId) {
          await firebase.remove(firebase.ref(firebase.database, `uno/${gameRoom.current}`));
        } else {
          const playerOrder = (gameData?.playerOrder || []).filter(id => id !== myPlayerId);
          const players = { ...(gameData?.players || {}) };
          delete players[myPlayerId];
          await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), { playerOrder, players });
        }
      } catch (e) { /* ignore */ }
    }
    gameRoom.current = null;
    setGameData(null);
    setScreen('menu');
    setJoinCode('');
    setRoomCode('');
    setSelectedCard(null);
    setShowColorPicker(false);
  };

  // ─────────────────── RENDER ────────────────────────────────────────────────

  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white bg-gradient-to-br from-red-900 via-slate-900 to-blue-900 rounded-3xl p-12">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-14 h-14 border-4 border-red-400 border-t-transparent rounded-full mb-4" />
        <p className="text-red-200 font-bold text-lg animate-pulse">Connecting to UNO server...</p>
      </div>
    );
  }

  // ── MENU ──
  if (screen === 'menu') {
    const sortedBoard = [...leaderboard].sort((a, b) => (b.wins || 0) - (a.wins || 0));
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 blur-3xl rounded-full" />
            <h1 className="relative text-6xl md:text-8xl font-black tracking-tight drop-shadow-2xl">
              <span className="text-red-400">U</span>
              <span className="text-yellow-400">N</span>
              <span className="text-green-400">O</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium mt-2">Up to 4 Players · Live Multiplayer</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Join/Host Panel */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
              className="bg-slate-900/80 backdrop-blur rounded-3xl border border-white/10 p-6 space-y-5 shadow-2xl">
              <h2 className="text-white font-black text-2xl">Play UNO</h2>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(239,68,68,0.4)' }}
                whileTap={{ scale: 0.98 }}
                onClick={createGame}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-60"
              >
                {loading ? 'Creating...' : '🎮 Create Room'}
              </motion.button>

              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/10" />
                <span className="mx-3 text-slate-500 text-sm font-bold uppercase tracking-wider">or join</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <div className="space-y-3">
                <input
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  maxLength={6}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-4 rounded-xl text-center font-mono text-2xl tracking-widest uppercase focus:border-yellow-400 focus:outline-none transition-colors placeholder:text-slate-600"
                />
                <motion.button
                  whileHover={joinCode.trim() ? { scale: 1.02 } : {}}
                  whileTap={joinCode.trim() ? { scale: 0.98 } : {}}
                  onClick={joinGame}
                  disabled={loading || !joinCode.trim()}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? 'Joining...' : '🔗 Join Room'}
                </motion.button>
              </div>

              {/* Quick rules */}
              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-1.5 text-sm text-slate-400">
                <div className="text-white font-bold mb-2">How to Play</div>
                <div>🃏 Match top card by <strong className="text-white">color or number</strong></div>
                <div>🔄 Action cards: Skip, Reverse, +2</div>
                <div>🌈 Wild & +4 cards change the color</div>
                <div>🏆 First to empty their hand wins!</div>
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}>
              <Leaderboard entries={sortedBoard} currentPlayerId={myPlayerId} />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING ──
  if (screen === 'waiting') {
    const isHost = gameData?.hostId === myPlayerId;
    const playerOrder = gameData?.playerOrder || [];
    const players = gameData?.players || {};

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-1">Waiting for Players</h2>
            <p className="text-slate-400">{playerOrder.length}/4 players joined</p>
          </div>

          {/* Room Code */}
          <div
            className="bg-slate-800 border-2 border-slate-600 hover:border-yellow-400 rounded-2xl p-5 cursor-pointer transition-colors group"
            onClick={() => { navigator.clipboard?.writeText(roomCode); showToast('Copied!', 'success'); }}
          >
            <p className="font-mono text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">
              {roomCode}
            </p>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">Tap to copy room code</p>
          </div>

          {/* Player List */}
          <div className="space-y-2">
            {playerOrder.map((pid, i) => (
              <div key={pid} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${COLOR_HEX[COLORS[i % 4]]}, ${COLOR_DARK[COLORS[i % 4]]})` }}>
                  {i + 1}
                </div>
                <span className="text-white font-bold">{players[pid]?.name || pid}</span>
                {pid === gameData?.hostId && <span className="ml-auto text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">HOST</span>}
                {pid === myPlayerId && <span className="ml-auto text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">YOU</span>}
              </div>
            ))}
            {Array.from({ length: 4 - playerOrder.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 text-sm">?</div>
                <span className="text-slate-600 font-medium italic">Waiting...</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={startGame}
                disabled={playerOrder.length < 2}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all"
              >
                {playerOrder.length < 2 ? 'Need 2+ Players' : '🚀 Start Game!'}
              </motion.button>
            )}
            <button onClick={leaveGame} className="w-full py-3 rounded-2xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-red-400 transition-colors">
              Leave Room
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── PLAYING / FINISHED ──
  if (screen === 'playing' || screen === 'finished') {
    if (!gameData || !gameData.hands) {
      return (
        <div className="flex items-center justify-center min-h-96 text-white">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading game...</p>
          </div>
        </div>
      );
    }

    const { hands, discardPile, currentColor, currentPlayerIndex, playerOrder, direction, players, status, winnerId, winnerName } = gameData;
    const myHand = hands[myPlayerId] || [];
    const topCard = discardPile[discardPile.length - 1];
    const isMyTurn = playerOrder[currentPlayerIndex] === myPlayerId;
    const currentPlayer = players[playerOrder[currentPlayerIndex]];

    const playableCards = isMyTurn ? myHand.filter(c => canPlayCard(c, topCard, currentColor)) : [];
    const opponents = playerOrder.filter(pid => pid !== myPlayerId);

    const playerColors = {};
    playerOrder.forEach((pid, i) => { playerColors[pid] = COLORS[i % 4]; });

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 p-3 md:p-6 flex flex-col gap-4">
        <AnimatePresence>{showColorPicker && <ColorPicker onPick={handleColorPick} />}</AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur rounded-2xl px-4 py-3 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">
              <span className="text-red-400">U</span><span className="text-yellow-400">N</span><span className="text-green-400">O</span>
            </span>
            <span className="bg-slate-800 text-slate-400 text-xs font-mono px-2 py-1 rounded-lg">{roomCode}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.div key={currentPlayerIndex} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className={`text-sm font-black px-3 py-1 rounded-full ${isMyTurn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-slate-700 text-slate-300'}`}>
                  {isMyTurn ? '⚡ Your Turn!' : `${currentPlayer?.name}'s turn`}
                </motion.div>
              </AnimatePresence>
              <div className="text-xs text-slate-500 mt-0.5">
                {direction === 1 ? '↻ Clockwise' : '↺ Counter-clockwise'}
              </div>
            </div>
            <button onClick={leaveGame} className="text-slate-600 hover:text-red-400 text-sm font-bold transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10">
              Leave
            </button>
          </div>
        </div>

        {/* Opponent hands */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {opponents.map(pid => {
            const p = players[pid];
            const handSize = p?.handSize ?? (hands[pid]?.length ?? 0);
            const isTheirTurn = playerOrder[currentPlayerIndex] === pid;
            const pColor = playerColors[pid];
            return (
              <motion.div key={pid}
                animate={isTheirTurn ? { boxShadow: [`0 0 0px ${COLOR_HEX[pColor]}00`, `0 0 20px ${COLOR_HEX[pColor]}80`, `0 0 0px ${COLOR_HEX[pColor]}00`] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`bg-slate-900/60 backdrop-blur rounded-2xl p-3 border-2 transition-colors ${isTheirTurn ? `border-[${COLOR_HEX[pColor]}] bg-slate-800/80` : 'border-white/5'}`}
                style={{ borderColor: isTheirTurn ? COLOR_HEX[pColor] : undefined }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs"
                      style={{ background: `linear-gradient(135deg, ${COLOR_HEX[pColor]}, ${COLOR_DARK[pColor]})` }}>
                      {p?.name?.[0] || '?'}
                    </div>
                    <span className="text-white font-bold text-sm">{p?.name || pid}</span>
                  </div>
                  {handSize === 1 && (
                    <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                      className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">UNO!</motion.span>
                  )}
                  <span className="text-slate-400 text-sm font-bold">{handSize} cards</span>
                </div>
                {/* Face-down cards */}
                <div className="flex gap-0.5 overflow-hidden max-w-full">
                  {Array.from({ length: Math.min(handSize, 10) }).map((_, i) => (
                    <div key={i} className="w-7 h-10 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-white/20 text-xs font-black">U</span>
                    </div>
                  ))}
                  {handSize > 10 && <span className="text-slate-500 text-xs self-center ml-1">+{handSize - 10}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main Play Area */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-4">
          {/* Discard pile */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Discard Pile</p>
            <div className="relative">
              {discardPile.length > 1 && (
                <div className="absolute top-1 left-1 opacity-40">
                  <UNOCard card={discardPile[discardPile.length - 2]} disabled />
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={topCard?.id} initial={{ scale: 0.5, rotate: -15, opacity: 0 }} animate={{ scale: 1, rotate: Math.random() * 10 - 5, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <UNOCard card={topCard} disabled />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Current color indicator */}
            <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1.5">
              <div className="w-4 h-4 rounded-full shadow-lg" style={{ background: COLOR_HEX[currentColor], boxShadow: `0 0 10px ${COLOR_HEX[currentColor]}` }} />
              <span className="text-white text-xs font-bold capitalize">{currentColor}</span>
            </div>
          </div>

          {/* Draw pile */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Draw Pile</p>
            <motion.div whileHover={isMyTurn ? { y: -8 } : {}} whileTap={isMyTurn ? { scale: 0.95 } : {}}>
              <button
                onClick={isMyTurn ? drawCard : undefined}
                disabled={!isMyTurn}
                className={`w-20 h-28 md:w-24 md:h-32 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-4 border-white/20 flex flex-col items-center justify-center shadow-2xl transition-all ${isMyTurn ? 'cursor-pointer hover:border-yellow-400' : 'cursor-not-allowed opacity-70'}`}
              >
                <span className="text-white/30 font-black text-2xl">UNO</span>
                {isMyTurn && <span className="text-yellow-400 text-xs font-bold mt-1">Draw</span>}
              </button>
            </motion.div>
            <span className="text-slate-500 text-xs">{gameData.deck?.length || 0} left</span>
          </div>
        </div>

        {/* My hand */}
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">Your Hand</span>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold">{myHand.length}</span>
              {myHand.length === 1 && (
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                  className="bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">UNO!</motion.span>
              )}
            </div>
            {isMyTurn && playableCards.length === 0 && (
              <span className="text-red-400 text-xs font-bold animate-pulse">No playable cards — draw one!</span>
            )}
          </div>
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2 min-h-[140px] items-end" style={{ scrollbarWidth: 'thin' }}>
            <AnimatePresence>
              {myHand.map((card, i) => {
                const canPlay = playableCards.some(c => c.id === card.id);
                return (
                  <motion.div key={card.id} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0, scale: 0.5 }}
                    transition={{ delay: i * 0.03 }}>
                    <UNOCard
                      card={card}
                      onClick={() => handleCardClick(card)}
                      disabled={!isMyTurn || !canPlay}
                      selected={selectedCard === card.id || animatingCard === card.id}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Finished overlay */}
        <AnimatePresence>
          {status === 'finished' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200 }}
                className="bg-slate-900 border border-white/20 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl space-y-5">
                <div className="text-7xl">{winnerId === myPlayerId ? '🎉' : '😔'}</div>
                <h2 className={`text-4xl font-black ${winnerId === myPlayerId ? 'text-yellow-400' : 'text-slate-300'}`}>
                  {winnerId === myPlayerId ? 'YOU WIN!' : `${winnerName} Wins!`}
                </h2>
                {winnerId === myPlayerId && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3">
                    <p className="text-yellow-300 font-bold">🏆 Win recorded on the leaderboard!</p>
                  </div>
                )}
                <div className="space-y-3 pt-2">
                  <button onClick={leaveGame}
                    className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all shadow-xl">
                    Back to Menu
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default UNOGame;
