// components/games/UNOGame.js - Full multiplayer UNO (up to 4 players)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { kickPlayer, watchForKick, KickButton, KickConfirmModal } from './shared/kickPlayer';

// ─── Card Data ────────────────────────────────────────────────────────────────
const COLORS = ['red', 'yellow', 'green', 'blue'];
const COLOR_HEX   = { red: '#ef4444', yellow: '#eab308', green: '#22c55e', blue: '#3b82f6' };
const COLOR_DARK  = { red: '#991b1b', yellow: '#713f12', green: '#14532d', blue: '#1e3a8a' };

function buildDeck() {
  const deck = [];
  let id = 0;
  COLORS.forEach(color => {
    deck.push({ id: id++, color, value: '0', type: 'number' });
    for (let n = 1; n <= 9; n++) {
      deck.push({ id: id++, color, value: String(n), type: 'number' });
      deck.push({ id: id++, color, value: String(n), type: 'number' });
    }
    ['Skip', 'Reverse', '+2'].forEach(action => {
      deck.push({ id: id++, color, value: action, type: 'action' });
      deck.push({ id: id++, color, value: action, type: 'action' });
    });
  });
  for (let i = 0; i < 4; i++) {
    deck.push({ id: id++, color: 'wild', value: 'Wild', type: 'wild' });
    deck.push({ id: id++, color: 'wild', value: '+4',   type: 'wild4' });
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

function sortHand(hand, mode) {
  if (mode === 'none') return hand;
  const colorOrder = { red: 0, yellow: 1, green: 2, blue: 3, wild: 4 };
  const valueOrder = v => {
    if (!isNaN(v)) return parseInt(v);
    if (v === 'Skip')    return 10;
    if (v === 'Reverse') return 11;
    if (v === '+2')      return 12;
    if (v === 'Wild')    return 13;
    if (v === '+4')      return 14;
    return 99;
  };
  const sorted = [...hand];
  sorted.sort((a, b) => {
    if (mode === 'color') {
      const cd = colorOrder[a.color] - colorOrder[b.color];
      return cd !== 0 ? cd : valueOrder(a.value) - valueOrder(b.value);
    }
    if (mode === 'value') {
      const vd = valueOrder(a.value) - valueOrder(b.value);
      return vd !== 0 ? vd : colorOrder[a.color] - colorOrder[b.color];
    }
    return 0;
  });
  return sorted;
}

// ─── Card Visual ──────────────────────────────────────────────────────────────
const UNOCard = ({
  card, onClick, disabled, small, selected, faceDown,
  draggable: isDraggable, onDragStart, onDragEnd, isDragOver
}) => {
  if (!card) return null;
  const isWild = card.color === 'wild';
  const hex    = isWild ? null : COLOR_HEX[card.color];
  const dark   = isWild ? null : COLOR_DARK[card.color];

  const sizeClass = small
    ? 'w-10 h-16 rounded-lg'
    : 'w-16 h-24 md:w-20 md:h-28 rounded-xl';

  const inner = () => {
    if (faceDown) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-[inherit] flex items-center justify-center border-4 border-white/20">
          <span className="text-white/20 font-black text-sm">UNO</span>
        </div>
      );
    }
    if (isWild) {
      return (
        <div className="w-full h-full bg-black rounded-[inherit] flex flex-col items-center justify-center relative overflow-hidden border-4 border-white/30">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-red-500/85" /><div className="bg-yellow-500/85" />
            <div className="bg-blue-500/85" /><div className="bg-green-500/85" />
          </div>
          <div className="relative z-10 bg-black/50 rounded-full px-2 py-0.5">
            <span className="text-white font-black text-xs drop-shadow-lg">
              {card.value === 'Wild' ? 'WILD' : '+4'}
            </span>
          </div>
        </div>
      );
    }
    return (
      <div
        className="w-full h-full rounded-[inherit] flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${hex}, ${dark})` }}
      >
        <span className="absolute top-1 left-1.5 text-white font-black leading-none drop-shadow"
          style={{ fontSize: small ? '0.6rem' : '0.7rem', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {card.value}
        </span>
        <span className="absolute bottom-1 right-1.5 text-white font-black leading-none rotate-180 drop-shadow"
          style={{ fontSize: small ? '0.6rem' : '0.7rem', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
          {card.value}
        </span>
        <div className="absolute inset-[10%] rounded-full rotate-[-30deg] opacity-25 bg-white" />
        <span className="relative z-10 text-white font-black drop-shadow-lg select-none"
          style={{
            fontSize: small ? '0.8rem' : card.value.length > 2 ? '1rem' : '1.4rem',
            textShadow: '0 2px 6px rgba(0,0,0,0.7)'
          }}>
          {card.value === 'Skip' ? '🚫' : card.value === 'Reverse' ? '🔄' : card.value}
        </span>
      </div>
    );
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileHover={!disabled ? { y: -14, scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.93 } : {}}
      className={`
        ${sizeClass} relative flex-shrink-0 shadow-2xl select-none
        border-4 transition-colors duration-150 focus:outline-none
        ${selected    ? 'border-yellow-400 ring-4 ring-yellow-300/70 -translate-y-5 scale-110 z-10' : 'border-white/40'}
        ${isDragOver  ? 'border-green-400 ring-4 ring-green-300/70' : ''}
        ${disabled    ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-white'}
        ${isDraggable && !disabled ? 'cursor-grab active:cursor-grabbing' : ''}
      `}
      style={{ touchAction: 'none' }}
    >
      {inner()}
    </motion.button>
  );
};

// ─── Color Picker ─────────────────────────────────────────────────────────────
const ColorPicker = ({ onPick }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
  >
    <motion.div initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}
      className="bg-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
      <h3 className="text-white font-black text-2xl mb-6">Choose a Color</h3>
      <div className="grid grid-cols-2 gap-4">
        {COLORS.map(color => (
          <motion.button key={color} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
            onClick={() => onPick(color)}
            className="w-24 h-24 rounded-2xl shadow-xl border-4 border-white/30 font-black text-white text-lg capitalize"
            style={{ background: `linear-gradient(135deg, ${COLOR_HEX[color]}, ${COLOR_DARK[color]})` }}>
            {color}
          </motion.button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Leaderboard ──────────────────────────────────────────────────────────────
const Leaderboard = ({ entries, currentPlayerId }) => (
  <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-white/10 p-4 h-full">
    <h3 className="text-yellow-400 font-black text-lg mb-3 flex items-center gap-2">🏆 UNO Leaderboard</h3>
    {entries.length === 0 ? (
      <p className="text-slate-500 text-sm text-center py-6">No wins yet — be the first!</p>
    ) : (
      <div className="space-y-2">
        {entries.map((entry, i) => (
          <div key={entry.id}
            className={`flex items-center gap-3 p-2 rounded-xl ${entry.id === currentPlayerId ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'}`}>
            <span className="text-lg font-black w-7 text-center">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
            </span>
            <span className={`flex-1 font-bold text-sm truncate ${entry.id === currentPlayerId ? 'text-yellow-300' : 'text-white'}`}>
              {entry.name}
            </span>
            <div className="text-right flex-shrink-0">
              <div className="text-yellow-400 font-black text-sm">{entry.wins}W</div>
              <div className="text-slate-500 text-xs">{entry.gamesPlayed}GP</div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UNOGame = ({ studentData, showToast, classmates }) => {
  const [firebase, setFirebase]           = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);

  const [screen,          setScreen]          = useState('menu');
  const [joinCode,        setJoinCode]        = useState('');
  const [roomCode,        setRoomCode]        = useState('');
  const [loading,         setLoading]         = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWild,     setPendingWild]     = useState(null);
  const [selectedCardId,  setSelectedCardId]  = useState(null);
  const [dragCardId,      setDragCardId]      = useState(null);
  const [discardHover,    setDiscardHover]    = useState(false);
  const [sortMode,        setSortMode]        = useState('none'); // none | color | value
  const [leaderboard,     setLeaderboard]     = useState([]);
  const [gameData,        setGameData]        = useState(null);
  const [kickTarget,      setKickTarget]      = useState(null); // { id, name } pending confirm

  const [myPlayerId]  = useState(() => studentData?.id || `guest_${Date.now()}`);
  const gameRoom      = useRef(null);
  const isProcessing  = useRef(false); // prevents double-plays

  const playerInfo = { id: myPlayerId, name: studentData?.firstName || 'Player' };
  const isHost      = gameData?.hostId === myPlayerId;

  // ── Firebase ──
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

  // ── Leaderboard ──
  useEffect(() => {
    try { setLeaderboard(JSON.parse(localStorage.getItem('uno_leaderboard') || '[]')); }
    catch { setLeaderboard([]); }
  }, []);

  const saveLeaderboard = (entries) => {
    setLeaderboard(entries);
    localStorage.setItem('uno_leaderboard', JSON.stringify(entries));
  };

  const recordWin = useCallback((winnerId, winnerName, allIds) => {
    const stored = JSON.parse(localStorage.getItem('uno_leaderboard') || '[]');
    const updated = [...stored];
    allIds.forEach(pid => {
      const idx = updated.findIndex(e => e.id === pid);
      if (idx >= 0) updated[idx] = { ...updated[idx], gamesPlayed: (updated[idx].gamesPlayed || 0) + 1 };
    });
    const wi = updated.findIndex(e => e.id === winnerId);
    if (wi >= 0) { updated[wi] = { ...updated[wi], wins: (updated[wi].wins || 0) + 1 }; }
    else         { updated.push({ id: winnerId, name: winnerName, wins: 1, gamesPlayed: 1 }); }
    updated.sort((a, b) => (b.wins || 0) - (a.wins || 0));
    saveLeaderboard(updated.slice(0, 20));
  }, []);

  const ensureInLeaderboard = (pid, pname) => {
    const stored = JSON.parse(localStorage.getItem('uno_leaderboard') || '[]');
    if (!stored.find(e => e.id === pid)) saveLeaderboard([...stored, { id: pid, name: pname, wins: 0, gamesPlayed: 0 }]);
  };

  // ── Firebase Listener ──
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom.current) return;
    const roomRef = firebase.ref(firebase.database, `uno/${gameRoom.current}`);
    const unsub = firebase.onValue(roomRef, snap => {
      const data = snap.val();
      if (!data) { setScreen('menu'); setGameData(null); showToast('Room closed.', 'info'); return; }
      setGameData(data);
      if (data.status === 'playing'  && screen === 'waiting')  setScreen('playing');
      if (data.status === 'finished' && screen !== 'finished') {
        setScreen('finished');
        if (data.winnerId) {
          showToast(data.winnerId === myPlayerId ? '🎉 You won!' : `${data.winnerName} wins!`,
            data.winnerId === myPlayerId ? 'success' : 'info');
          recordWin(data.winnerId, data.winnerName, Object.keys(data.players || {}));
          setLeaderboard(JSON.parse(localStorage.getItem('uno_leaderboard') || '[]'));
        } else {
          showToast('Not enough players remaining — game ended.', 'info');
        }
      }
    });
    return () => firebase.off(roomRef, 'value', unsub);
  }, [firebaseReady, firebase, screen, myPlayerId]);

  // ── Kick Watcher (local player) ──
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom.current) return;
    const roomPath = `uno/${gameRoom.current}`;
    const unsub = watchForKick(firebase.database, roomPath, myPlayerId, () => {
      showToast('You were removed from the game by the host.', 'info');
      gameRoom.current = null; setGameData(null); setScreen('menu');
      setJoinCode(''); setRoomCode(''); setSelectedCardId(null);
      setShowColorPicker(false); isProcessing.current = false;
    });
    return () => unsub();
  }, [firebaseReady, firebase, roomCode]);

  // ── Helpers ──
  const genCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

  const canPlay = (card, topCard, currentColor) => {
    if (!topCard) return true;
    if (card.type === 'wild' || card.type === 'wild4') return true;
    if (card.color === currentColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  const nextIdx = (cur, total, dir, skip = false) => {
    const step = dir === 1 ? 1 : -1;
    let n = ((cur + step) % total + total) % total;
    if (skip) n = ((n + step) % total + total) % total;
    return n;
  };

  // ── Turn-order recompute after a host kick ──────────────────────────────
  // Splicing a player out of `playerOrder` shifts everyone after them down
  // by one array slot, so `currentPlayerIndex` has to be corrected to keep
  // pointing at the right actual player (or hand off the turn correctly if
  // it was the kicked player's own turn). Three cases:
  //   1. Kicked player's slot was BEFORE the current player's slot → the
  //      current player's absolute position shifted down by one, so
  //      decrement the index by 1 to keep pointing at the same person.
  //   2. Kicked player WAS the current player (it was their turn) → their
  //      turn is simply forfeit; whoever now sits at that same index in the
  //      shortened array goes next, so do NOT decrement. If the kicked
  //      player was last in the array this index runs one past the end of
  //      the new (shorter) array — wrap it back to 0 with modulo.
  //   3. Kicked player's slot was AFTER the current player → nothing before
  //      the current player moved, so the index is left untouched.
  const recomputeTurnAfterKick = (playerOrder, currentPlayerIndex, kickedId) => {
    const kickedIdx = playerOrder.indexOf(kickedId);
    const newPlayerOrder = playerOrder.filter(id => id !== kickedId);
    if (kickedIdx === -1 || newPlayerOrder.length === 0) {
      return { newPlayerOrder, newCurrentPlayerIndex: 0 };
    }
    let newCurrentPlayerIndex;
    if (kickedIdx < currentPlayerIndex) {
      newCurrentPlayerIndex = currentPlayerIndex - 1;
    } else if (kickedIdx === currentPlayerIndex) {
      newCurrentPlayerIndex = currentPlayerIndex % newPlayerOrder.length; // wrap if they were last
    } else {
      newCurrentPlayerIndex = currentPlayerIndex;
    }
    return { newPlayerOrder, newCurrentPlayerIndex };
  };

  const buildInitialState = (players) => {
    let deck = shuffle(buildDeck());
    const hands = {};
    players.forEach(p => { hands[p.id] = deck.splice(0, 7); });
    let topIdx = deck.findIndex(c => c.color !== 'wild' && c.type !== 'wild4');
    if (topIdx < 0) topIdx = 0;
    const [top] = deck.splice(topIdx, 1);
    return { deck, hands, discardPile: [top], currentColor: top.color,
      currentPlayerIndex: 0, direction: 1, status: 'playing',
      lastAction: null, winnerId: null, winnerName: null };
  };

  // ── Create / Join / Start ──
  const createGame = async () => {
    if (!firebaseReady || !firebase) { showToast('Connecting...', 'info'); return; }
    setLoading(true);
    const code = genCode();
    gameRoom.current = code;
    try {
      await firebase.set(firebase.ref(firebase.database, `uno/${code}`), {
        roomCode: code, hostId: myPlayerId,
        players: { [myPlayerId]: { id: myPlayerId, name: playerInfo.name, handSize: 7, order: 0 } },
        playerOrder: [myPlayerId], status: 'waiting', createdAt: Date.now(),
      });
      setRoomCode(code); setScreen('waiting');
      ensureInLeaderboard(myPlayerId, playerInfo.name);
      showToast(`Room created! Code: ${code}`, 'success');
    } catch { showToast('Failed to create room', 'error'); gameRoom.current = null; }
    setLoading(false);
  };

  const joinGame = async () => {
    if (!firebaseReady || !firebase) return;
    const code = joinCode.trim().toUpperCase();
    if (!code) { showToast('Enter a room code', 'error'); return; }
    setLoading(true);
    try {
      const snap = await firebase.get(firebase.ref(firebase.database, `uno/${code}`));
      const data = snap.val();
      if (!data)                                             { showToast('Room not found', 'error');          setLoading(false); return; }
      if (data.status !== 'waiting')                        { showToast('Game already started', 'error');     setLoading(false); return; }
      const cur = Object.keys(data.players || {});
      if (cur.length >= 4)                                  { showToast('Room is full (max 4)', 'error');     setLoading(false); return; }
      if (cur.includes(myPlayerId))                         { showToast('Already in this room', 'info');      setLoading(false); return; }
      await firebase.update(firebase.ref(firebase.database, `uno/${code}`), {
        [`players/${myPlayerId}`]: { id: myPlayerId, name: playerInfo.name, handSize: 0, order: cur.length },
        playerOrder: [...cur, myPlayerId],
      });
      gameRoom.current = code; setRoomCode(code); setScreen('waiting');
      ensureInLeaderboard(myPlayerId, playerInfo.name);
      showToast('Joined!', 'success');
    } catch { showToast('Failed to join', 'error'); }
    setLoading(false);
  };

  const startGame = async () => {
    if (!gameData || !firebase) return;
    const po = gameData.playerOrder || [];
    if (po.length < 2) { showToast('Need at least 2 players', 'error'); return; }
    const players = po.map(id => ({ id, name: gameData.players[id]?.name || id }));
    const state = buildInitialState(players);
    await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), { ...state, playerOrder: po });
    setScreen('playing');
  };

  // ── Play Card (core) ──
  const executePlay = async (card, chosenColor) => {
    if (!gameData || !firebase || isProcessing.current) return;
    isProcessing.current = true;

    const { hands, discardPile, currentPlayerIndex, playerOrder, direction } = gameData;
    const myHand = [...(hands[myPlayerId] || [])];
    const cardIdx = myHand.findIndex(c => c.id === card.id);
    if (cardIdx < 0) { isProcessing.current = false; return; }
    myHand.splice(cardIdx, 1);

    const newDiscardPile = [...discardPile, card];
    let newColor    = chosenColor || card.color;
    let newDirection = direction;
    let skipNext    = false;
    let drawAmount  = 0;

    if (card.value === 'Reverse') {
      newDirection = direction === 1 ? -1 : 1;
      if (playerOrder.length === 2) skipNext = true;
    }
    if (card.value === 'Skip')    skipNext   = true;
    if (card.value === '+2')      drawAmount = 2;
    if (card.type  === 'wild4')   drawAmount = 4;

    const ni = nextIdx(currentPlayerIndex, playerOrder.length, newDirection, skipNext);
    const newHands = { ...hands, [myPlayerId]: myHand };

    if (drawAmount > 0) {
      const nextPid  = playerOrder[ni];
      const nextHand = [...(newHands[nextPid] || [])];
      let   { deck } = gameData;
      for (let i = 0; i < drawAmount; i++) {
        if (deck.length === 0) deck = shuffle(newDiscardPile.slice(0, -1));
        if (deck.length > 0) nextHand.push(deck.shift());
      }
      newHands[nextPid] = nextHand;
      // Update deck in gameData reference for the firebase update below
      gameData.deck = deck;
    }

    const winnerId   = myHand.length === 0 ? myPlayerId   : null;
    const winnerName = myHand.length === 0 ? playerInfo.name : null;

    const updatedPlayers = { ...gameData.players };
    Object.keys(newHands).forEach(pid => {
      if (updatedPlayers[pid]) updatedPlayers[pid] = { ...updatedPlayers[pid], handSize: newHands[pid].length };
    });

    try {
      await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), {
        hands:                newHands,
        deck:                 gameData.deck,
        discardPile:          newDiscardPile,
        currentColor:         newColor,
        currentPlayerIndex:   ni,
        direction:            newDirection,
        lastAction:           { type: 'play', playerId: myPlayerId, card, timestamp: Date.now() },
        players:              updatedPlayers,
        status:               winnerId ? 'finished' : 'playing',
        winnerId,
        winnerName,
      });
    } catch (e) {
      showToast('Failed to play card', 'error');
    }

    setSelectedCardId(null);
    isProcessing.current = false;
  };

  // ── Draw Card ──
  const drawCard = async () => {
    if (!gameData || !firebase || isProcessing.current) return;
    isProcessing.current = true;

    let { deck, discardPile } = gameData;
    const { hands, currentPlayerIndex, playerOrder, direction } = gameData;

    if (deck.length === 0) deck = shuffle(discardPile.slice(0, -1));
    if (deck.length === 0) { showToast('No cards left!', 'info'); isProcessing.current = false; return; }

    const drawn   = deck[0];
    const newDeck = deck.slice(1);
    const myHand  = [...(hands[myPlayerId] || []), drawn];
    const ni      = nextIdx(currentPlayerIndex, playerOrder.length, direction);
    const newHands = { ...hands, [myPlayerId]: myHand };

    const updatedPlayers = { ...gameData.players };
    if (updatedPlayers[myPlayerId]) updatedPlayers[myPlayerId] = { ...updatedPlayers[myPlayerId], handSize: myHand.length };

    try {
      await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), {
        deck: newDeck, hands: newHands,
        currentPlayerIndex: ni,
        lastAction: { type: 'draw', playerId: myPlayerId, timestamp: Date.now() },
        players: updatedPlayers,
      });
    } catch { showToast('Failed to draw card', 'error'); }

    isProcessing.current = false;
  };

  // ── Handle card interaction (click or drop) ──
  const handleAttemptPlay = (card) => {
    if (isProcessing.current) return;
    if (!gameData) return;
    const { discardPile, currentColor, currentPlayerIndex, playerOrder } = gameData;
    const isMyTurn = playerOrder[currentPlayerIndex] === myPlayerId;
    if (!isMyTurn) { showToast("It's not your turn!", 'warning'); return; }
    const topCard = discardPile[discardPile.length - 1];
    if (!canPlay(card, topCard, currentColor)) { showToast("Can't play that card!", 'warning'); return; }

    if (card.type === 'wild' || card.type === 'wild4') {
      setSelectedCardId(card.id);
      setPendingWild(card);
      setShowColorPicker(true);
      return;
    }
    setSelectedCardId(card.id);
    executePlay(card, null);
  };

  const handleColorPick = (color) => {
    setShowColorPicker(false);
    if (pendingWild) {
      executePlay(pendingWild, color);
      setPendingWild(null);
    }
  };

  // ── Drag handlers ──
  const handleDragStart = (e, card) => {
    if (!gameData) return;
    const { discardPile, currentColor, currentPlayerIndex, playerOrder } = gameData;
    const isMyTurn = playerOrder[currentPlayerIndex] === myPlayerId;
    if (!isMyTurn || !canPlay(card, discardPile[discardPile.length - 1], currentColor)) {
      e.preventDefault(); return;
    }
    setDragCardId(card.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd  = ()      => { setDragCardId(null); setDiscardHover(false); };
  const handleDragOver = (e)     => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDiscardHover(true); };
  const handleDragLeave = ()     => setDiscardHover(false);
  const handleDrop     = (e)     => {
    e.preventDefault(); setDiscardHover(false);
    if (!dragCardId || !gameData) return;
    const card = (gameData.hands[myPlayerId] || []).find(c => c.id === dragCardId);
    if (card) handleAttemptPlay(card);
    setDragCardId(null);
  };

  const leaveGame = async () => {
    if (firebase && gameRoom.current) {
      try {
        if (gameData?.hostId === myPlayerId) {
          await firebase.remove(firebase.ref(firebase.database, `uno/${gameRoom.current}`));
        } else {
          const po = (gameData?.playerOrder || []).filter(id => id !== myPlayerId);
          const pl = { ...(gameData?.players || {}) };
          delete pl[myPlayerId];
          await firebase.update(firebase.ref(firebase.database, `uno/${gameRoom.current}`), { playerOrder: po, players: pl });
        }
      } catch { /* ignore */ }
    }
    gameRoom.current = null; setGameData(null); setScreen('menu');
    setJoinCode(''); setRoomCode(''); setSelectedCardId(null);
    setShowColorPicker(false); isProcessing.current = false;
  };

  // ── Host: remove another player from the game ──
  const kickTablePlayer = async (targetId) => {
    if (!gameData || !firebase || !gameRoom.current || !isHost || targetId === myPlayerId) return;
    const targetName = gameData.players?.[targetId]?.name || targetId;
    const po = gameData.playerOrder || [];
    const { newPlayerOrder, newCurrentPlayerIndex } =
      recomputeTurnAfterKick(po, gameData.currentPlayerIndex ?? 0, targetId);

    const roomPath     = `uno/${gameRoom.current}`;
    const kickedHand    = gameData.hands?.[targetId] || [];
    const newDeck       = [...(gameData.deck || []), ...kickedHand]; // cards go back to the draw pile

    const extraUpdates = {
      [`${roomPath}/playerOrder`]:         newPlayerOrder,
      [`${roomPath}/currentPlayerIndex`]:  newCurrentPlayerIndex,
      [`${roomPath}/hands/${targetId}`]:   null,
      [`${roomPath}/deck`]:                newDeck,
    };

    if (newPlayerOrder.length < 2) {
      // Not enough players left to keep the game going — end it gracefully.
      extraUpdates[`${roomPath}/status`]     = 'finished';
      extraUpdates[`${roomPath}/winnerId`]   = null;
      extraUpdates[`${roomPath}/winnerName`] = null;
    }

    try {
      await kickPlayer({
        database: firebase.database,
        roomPath,
        targetId,
        targetName,
        hostName: playerInfo.name,
        extraUpdates,
      });
    } catch {
      showToast('Failed to remove player', 'error');
    }
  };

  // ─────────────────── RENDER ───────────────────────────────────────────────

  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-white bg-gradient-to-br from-red-900 via-slate-900 to-blue-900 rounded-3xl p-12">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-14 h-14 border-4 border-red-400 border-t-transparent rounded-full mb-4" />
        <p className="text-red-200 font-bold animate-pulse">Connecting to UNO server...</p>
      </div>
    );
  }

  // ── MENU ──────────────────────────────────────────────────────────────────
  if (screen === 'menu') {
    const board = [...leaderboard].sort((a, b) => (b.wins || 0) - (a.wins || 0));
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center relative py-4">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/20 to-blue-500/20 blur-3xl rounded-full" />
            <h1 className="relative font-black tracking-tight drop-shadow-2xl" style={{ fontSize: 'clamp(4rem, 12vw, 7rem)' }}>
              <span className="text-red-400">U</span>
              <span className="text-yellow-400">N</span>
              <span className="text-green-400">O</span>
            </h1>
            <p className="text-slate-400 text-base font-semibold mt-1">Up to 4 Players · Live Multiplayer</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
              className="bg-slate-900/80 backdrop-blur rounded-3xl border border-white/10 p-6 space-y-5 shadow-2xl">
              <h2 className="text-white font-black text-2xl">Play</h2>
              <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(239,68,68,0.35)' }} whileTap={{ scale: 0.98 }}
                onClick={createGame} disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:opacity-60 transition-all">
                {loading ? 'Creating...' : '🎮 Create Room'}
              </motion.button>
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-white/10" />
                <span className="mx-3 text-slate-500 text-xs font-bold uppercase tracking-wider">or join</span>
                <div className="flex-1 border-t border-white/10" />
              </div>
              <div className="space-y-3">
                <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && joinGame()}
                  placeholder="ROOM CODE" maxLength={6}
                  className="w-full bg-slate-800 border-2 border-slate-700 text-white px-4 py-4 rounded-xl text-center font-mono text-2xl tracking-widest uppercase focus:border-yellow-400 focus:outline-none transition-colors placeholder:text-slate-600" />
                <motion.button whileHover={joinCode.trim() ? { scale: 1.02 } : {}} whileTap={joinCode.trim() ? { scale: 0.98 } : {}}
                  onClick={joinGame} disabled={loading || !joinCode.trim()}
                  className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all">
                  {loading ? 'Joining...' : '🔗 Join Room'}
                </motion.button>
              </div>
              <div className="bg-slate-800/50 rounded-2xl p-4 space-y-1.5 text-sm text-slate-400">
                <div className="text-white font-bold mb-2">How to Play</div>
                <div>🃏 Match top card by <strong className="text-white">colour or number</strong></div>
                <div>🔄 Skip · Reverse · +2 action cards</div>
                <div>🌈 Wild & +4 change the colour</div>
                <div>🖱️ <strong className="text-white">Drag</strong> a card onto the pile, or click it</div>
                <div>🔀 Sort your hand by colour or value</div>
                <div>🏆 First to empty their hand wins!</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}>
              <Leaderboard entries={board} currentPlayerId={myPlayerId} />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING ───────────────────────────────────────────────────────────────
  if (screen === 'waiting') {
    const isHost = gameData?.hostId === myPlayerId;
    const po     = gameData?.playerOrder || [];
    const pl     = gameData?.players    || {};
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/90 backdrop-blur border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div>
            <h2 className="text-3xl font-black text-white mb-1">Waiting Room</h2>
            <p className="text-slate-400">{po.length}/4 players</p>
          </div>
          <div className="bg-slate-800 border-2 border-slate-600 hover:border-yellow-400 rounded-2xl p-5 cursor-pointer transition-colors"
            onClick={() => { navigator.clipboard?.writeText(roomCode); showToast('Copied!', 'success'); }}>
            <p className="font-mono text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">{roomCode}</p>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">Tap to copy code</p>
          </div>
          <div className="space-y-2">
            {po.map((pid, i) => (
              <div key={pid} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white"
                  style={{ background: `linear-gradient(135deg, ${COLOR_HEX[COLORS[i % 4]]}, ${COLOR_DARK[COLORS[i % 4]]})` }}>
                  {i + 1}
                </div>
                <span className="text-white font-bold flex-1 text-left">{pl[pid]?.name || pid}</span>
                {pid === gameData?.hostId && <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">HOST</span>}
                {pid === myPlayerId        && <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-0.5 rounded-full">YOU</span>}
              </div>
            ))}
            {Array.from({ length: 4 - po.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 text-sm">?</div>
                <span className="text-slate-600 italic text-sm">Waiting...</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {isHost && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={startGame} disabled={po.length < 2}
                className="w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl transition-all">
                {po.length < 2 ? 'Need 2+ Players' : '🚀 Start Game!'}
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

  // ── PLAYING / FINISHED ────────────────────────────────────────────────────
  if (screen === 'playing' || screen === 'finished') {
    if (!gameData?.hands) {
      return (
        <div className="flex items-center justify-center min-h-96 bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 rounded-3xl">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading game...</p>
          </div>
        </div>
      );
    }

    const { hands, discardPile, currentColor, currentPlayerIndex, playerOrder, direction, players, status, winnerId, winnerName } = gameData;
    const rawHand   = hands[myPlayerId] || [];
    const myHand    = sortHand(rawHand, sortMode);
    const topCard   = discardPile[discardPile.length - 1];
    const isMyTurn  = playerOrder[currentPlayerIndex] === myPlayerId;
    const playable  = isMyTurn ? myHand.filter(c => canPlay(c, topCard, currentColor)) : [];
    const opponents = playerOrder.filter(pid => pid !== myPlayerId);
    const pColors   = {};
    playerOrder.forEach((pid, i) => { pColors[pid] = COLORS[i % 4]; });
    const curPlayer = players[playerOrder[currentPlayerIndex]];

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-slate-900 to-blue-950 p-3 md:p-5 flex flex-col gap-3">
        <AnimatePresence>{showColorPicker && <ColorPicker onPick={handleColorPick} />}</AnimatePresence>
        {kickTarget && (
          <KickConfirmModal
            playerName={kickTarget.name}
            onConfirm={() => { kickTablePlayer(kickTarget.id); setKickTarget(null); }}
            onCancel={() => setKickTarget(null)}
          />
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur rounded-2xl px-4 py-3 border border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black">
              <span className="text-red-400">U</span><span className="text-yellow-400">N</span><span className="text-green-400">O</span>
            </span>
            <span className="bg-slate-800 text-slate-400 text-xs font-mono px-2 py-1 rounded-lg border border-slate-700">{roomCode}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={`turn-${currentPlayerIndex}`} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`text-sm font-black px-3 py-1.5 rounded-full ${isMyTurn ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
              {isMyTurn ? '⚡ Your Turn!' : `${curPlayer?.name}'s turn`}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs hidden md:block">{direction === 1 ? '↻ CW' : '↺ CCW'}</span>
            <button onClick={leaveGame} className="text-slate-600 hover:text-red-400 text-xs font-bold transition-colors px-2 py-1 rounded-lg hover:bg-red-400/10">Leave</button>
          </div>
        </div>

        {/* ── Opponents ── */}
        {opponents.length > 0 && (
          <div className={`grid gap-3 flex-shrink-0 ${opponents.length === 1 ? 'grid-cols-1' : opponents.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {opponents.map(pid => {
              const p        = players[pid];
              const hSize    = p?.handSize ?? (hands[pid]?.length ?? 0);
              const theirTurn = playerOrder[currentPlayerIndex] === pid;
              const pc       = pColors[pid];
              return (
                <motion.div key={pid}
                  animate={theirTurn ? { boxShadow: [`0 0 0 ${COLOR_HEX[pc]}00`, `0 0 18px ${COLOR_HEX[pc]}70`, `0 0 0 ${COLOR_HEX[pc]}00`] } : { boxShadow: '0 0 0 transparent' }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                  className="bg-slate-900/70 backdrop-blur rounded-xl p-3 border-2 transition-colors"
                  style={{ borderColor: theirTurn ? COLOR_HEX[pc] : 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs"
                        style={{ background: `linear-gradient(135deg, ${COLOR_HEX[pc]}, ${COLOR_DARK[pc]})` }}>
                        {p?.name?.[0] || '?'}
                      </div>
                      <span className="text-white font-bold text-sm truncate max-w-[80px]">{p?.name || pid}</span>
                      {isHost && (
                        <KickButton
                          name={p?.name || pid}
                          onClick={() => setKickTarget({ id: pid, name: p?.name || pid })}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hSize === 1 && (
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                          className="bg-red-500 text-white text-xs font-black px-1.5 py-0.5 rounded-full">UNO!</motion.span>
                      )}
                      <span className="text-slate-400 text-xs font-bold">{hSize}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 overflow-hidden">
                    {Array.from({ length: Math.min(hSize, 12) }).map((_, i) => (
                      <div key={i} className="w-6 h-9 rounded flex-shrink-0 border border-white/10"
                        style={{ background: `linear-gradient(135deg, #334155, #1e293b)` }} />
                    ))}
                    {hSize > 12 && <span className="text-slate-500 text-xs self-center ml-1">+{hSize - 12}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── Play Area ── */}
        <div className="flex items-center justify-center gap-8 md:gap-16 py-2 flex-shrink-0">
          {/* Discard pile drop zone */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Discard</p>
            <div
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              className={`relative rounded-xl transition-all duration-200 p-1 ${discardHover ? 'ring-4 ring-green-400/80 bg-green-400/10 scale-105' : ''}`}
            >
              {discardPile.length > 1 && (
                <div className="absolute top-2 left-2 opacity-30 pointer-events-none">
                  <UNOCard card={discardPile[discardPile.length - 2]} disabled />
                </div>
              )}
              <AnimatePresence mode="wait">
                <motion.div key={topCard?.id}
                  initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, rotate: (topCard?.id % 12) - 6, opacity: 1 }}
                  exit={{ scale: 1.3, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}>
                  <UNOCard card={topCard} disabled />
                </motion.div>
              </AnimatePresence>
              {discardHover && (
                <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none">
                  <span className="text-green-400 font-black text-2xl drop-shadow-lg">DROP</span>
                </div>
              )}
            </div>
            {/* Active colour dot */}
            <div className="flex items-center gap-2 bg-slate-800/80 rounded-full px-3 py-1.5 border border-white/10">
              <div className="w-3.5 h-3.5 rounded-full shadow-lg flex-shrink-0"
                style={{ background: COLOR_HEX[currentColor], boxShadow: `0 0 8px ${COLOR_HEX[currentColor]}` }} />
              <span className="text-white text-xs font-bold capitalize">{currentColor}</span>
            </div>
          </div>

          {/* Draw pile */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Draw</p>
            <motion.button
              onClick={isMyTurn && !isProcessing.current ? drawCard : undefined}
              disabled={!isMyTurn}
              whileHover={isMyTurn ? { y: -10, scale: 1.06 } : {}}
              whileTap={isMyTurn ? { scale: 0.94 } : {}}
              className={`w-16 h-24 md:w-20 md:h-28 rounded-xl border-4 flex flex-col items-center justify-center shadow-2xl transition-colors
                ${isMyTurn ? 'border-yellow-400/60 hover:border-yellow-400 cursor-pointer bg-gradient-to-br from-slate-700 to-slate-900' : 'border-white/10 cursor-not-allowed opacity-60 bg-gradient-to-br from-slate-800 to-slate-950'}`}>
              <span className="text-white/25 font-black text-sm">UNO</span>
              {isMyTurn && <span className="text-yellow-400 text-xs font-bold mt-1">Draw</span>}
            </motion.button>
            <span className="text-slate-600 text-xs">{gameData.deck?.length ?? 0} left</span>
          </div>
        </div>

        {/* ── My Hand ── */}
        <div className="bg-slate-900/80 backdrop-blur rounded-2xl border border-white/10 p-3 md:p-4 flex-1 min-h-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white font-bold text-sm">Your Hand</span>
            <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold">{rawHand.length}</span>
            {rawHand.length === 1 && (
              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">UNO!</motion.span>
            )}
            {isMyTurn && playable.length === 0 && rawHand.length > 0 && (
              <span className="text-orange-400 text-xs font-semibold ml-1 animate-pulse">No match — draw!</span>
            )}
            {/* Sort buttons */}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-slate-500 text-xs font-bold hidden md:block">Sort:</span>
              {(['none', 'color', 'value']).map(mode => (
                <button key={mode} onClick={() => setSortMode(mode)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${sortMode === mode ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/10'}`}>
                  {mode === 'none' ? 'Deal' : mode === 'color' ? '🎨' : '🔢'}
                </button>
              ))}
            </div>
          </div>

          {/* Cards row */}
          <div className="flex gap-1 md:gap-1.5 overflow-x-auto pb-2 min-h-[110px] items-end"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
            <AnimatePresence>
              {myHand.map((card, i) => {
                const isPlayable = playable.some(c => c.id === card.id);
                const isDragging = dragCardId === card.id;
                return (
                  <motion.div key={card.id}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: isDragging ? 0.4 : 1 }}
                    exit={{ y: -60, scale: 0.5, opacity: 0 }}
                    transition={{ delay: i * 0.025, type: 'spring', stiffness: 300, damping: 25 }}
                    layout>
                    <UNOCard
                      card={card}
                      onClick={() => handleAttemptPlay(card)}
                      disabled={!isMyTurn || !isPlayable || isProcessing.current}
                      selected={selectedCardId === card.id}
                      draggable={isMyTurn && isPlayable}
                      onDragStart={e => handleDragStart(e, card)}
                      onDragEnd={handleDragEnd}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Finished overlay ── */}
        <AnimatePresence>
          {status === 'finished' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.5, y: 60 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="bg-slate-900 border border-white/20 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl space-y-5">
                <div className="text-7xl">{winnerId === myPlayerId ? '🎉' : winnerId ? '😔' : '🚪'}</div>
                <h2 className={`text-4xl font-black ${winnerId === myPlayerId ? 'text-yellow-400' : 'text-slate-300'}`}>
                  {winnerId === myPlayerId ? 'YOU WIN!' : winnerId ? `${winnerName} Wins!` : 'Not Enough Players'}
                </h2>
                {winnerId === myPlayerId && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-3">
                    <p className="text-yellow-300 font-bold text-sm">🏆 Win recorded on leaderboard!</p>
                  </div>
                )}
                <button onClick={leaveGame}
                  className="w-full py-4 rounded-2xl font-black text-white text-lg bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 transition-all shadow-xl">
                  Back to Menu
                </button>
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
