// components/games/BattleshipsGame.js - COMPLETE OVERHAUL v3
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { kickPlayer, watchForKick, KickButton, KickConfirmModal } from './shared/kickPlayer';

const GRID_SIZE = 8;
const COLS = ['A','B','C','D','E','F','G','H'];
const EMOJI_LIST = ['🚢','💥','💦','🎯','🤔','😭'];

const SHIPS = [
  { name: 'Carrier',    size: 5, id: 'carrier',    color: '#6366f1', bg: 'bg-indigo-600',  border: 'border-indigo-400', icon: '🛳' },
  { name: 'Battleship', size: 4, id: 'battleship', color: '#0ea5e9', bg: 'bg-sky-600',     border: 'border-sky-400',    icon: '⚓' },
  { name: 'Cruiser',    size: 3, id: 'cruiser',    color: '#10b981', bg: 'bg-emerald-600', border: 'border-emerald-400',icon: '🚤' },
  { name: 'Submarine',  size: 3, id: 'submarine',  color: '#f59e0b', bg: 'bg-amber-600',   border: 'border-amber-400',  icon: '🤿' },
  { name: 'Destroyer',  size: 2, id: 'destroyer',  color: '#ef4444', bg: 'bg-red-600',     border: 'border-red-400',    icon: '⛵' },
];
const TOTAL_SHIP_CELLS = SHIPS.reduce((acc, s) => acc + s.size, 0);


// Which of the opponent's ships are fully sunk?
const getSunkShips = (oppBoard) => {
  const hitCounts = {};
  Object.values(oppBoard || {}).forEach(cell => {
    if (cell.type === 'ship' && cell.hit && cell.id) {
      hitCounts[cell.id] = (hitCounts[cell.id] || 0) + 1;
    }
  });
  return SHIPS.filter(s => (hitCounts[s.id] || 0) >= s.size).map(s => s.id);
};

const BattleshipsGame = ({ studentData, showToast }) => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, onValue, set, update, remove, off } = await import('firebase/database');
        setFirebase({ database, ref, onValue, set, update, remove, off });
        setFirebaseReady(true);
      } catch {
        showToast('Failed to load game engine', 'error');
      }
    };
    initFirebase();
  }, []);

  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Admiral',
  };

  const [gameState, setGameState] = useState('menu');
  const [gameRoom, setGameRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [gameData, setGameData] = useState(null);
  const [localGrid, setLocalGrid] = useState(() => initEmptyGrid());
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal');
  const [hoverCell, setHoverCell] = useState(null);
  const [activeReaction, setActiveReaction] = useState(null);
  const [lastProcessedReactionId, setLastProcessedReactionId] = useState(null);
  const [sunkShips, setSunkShips] = useState([]);
  const [showKickConfirm, setShowKickConfirm] = useState(false);

  const isHost = gameData?.host === playerInfo.id;

  function initEmptyGrid() {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ type: null, hit: false, id: null })));
  }

  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    const gameRef = firebase.ref(firebase.database, `battleships/${gameRoom}`);
    const unsubscribe = firebase.onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { resetGame(); showToast('Game ended', 'info'); return; }

      setGameData(data);

      if (data.reaction && data.reaction.id !== lastProcessedReactionId) {
        if (data.reaction.sender !== playerInfo.id) {
          setActiveReaction({ emoji: data.reaction.emoji, isMine: false, id: Date.now() });
          setTimeout(() => setActiveReaction(null), 2500);
        }
        setLastProcessedReactionId(data.reaction.id);
      }

      if (gameState === 'waiting' && data.players && Object.keys(data.players).length === 2) {
        setGameState('setup');
        showToast('Opponent joined! Deploy your fleet.', 'success');
      }

      const me = data.players?.[playerInfo.id];
      const opponentId = Object.keys(data.players || {}).find(id => id !== playerInfo.id);
      const opponent = opponentId ? data.players[opponentId] : null;

      if (gameState === 'setup' && me?.ready && opponent?.ready && data.status === 'playing') {
        setGameState('playing');
        showToast('Battle commencing!', 'success');
      }

      if (data.status === 'finished' && gameState !== 'finished') {
        setGameState('finished');
        showToast(data.winner === playerInfo.id ? '🏆 VICTORY!' : 'Defeat...', data.winner === playerInfo.id ? 'success' : 'error');
      }

      // Track newly sunk ships
      if (opponentId && data.players[opponentId]?.board) {
        const newSunk = getSunkShips(data.players[opponentId].board);
        if (newSunk.length > sunkShips.length) {
          const justSunk = newSunk.find(id => !sunkShips.includes(id));
          if (justSunk) {
            const ship = SHIPS.find(s => s.id === justSunk);
            showToast(`${ship?.icon || '💥'} You sunk their ${ship?.name}!`, 'success');
          }
          setSunkShips(newSunk);
        }
      }

    });

    return () => firebase.off(gameRef, 'value', unsubscribe);
  }, [firebaseReady, firebase, gameRoom, gameState, lastProcessedReactionId, sunkShips]);

  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    const unsubscribeKick = watchForKick(firebase.database, `battleships/${gameRoom}`, playerInfo.id, (info) => {
      showToast(`You were removed from the game by ${info?.by || 'the host'}.`, 'info');
      resetGame();
    });
    return () => unsubscribeKick();
  }, [firebaseReady, firebase, gameRoom]);

  const sendReaction = async (emoji) => {
    setActiveReaction({ emoji, isMine: true, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
    if (firebaseReady && firebase && gameRoom) {
      try {
        await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}`), {
          reaction: { emoji, sender: playerInfo.id, id: Date.now() }
        });
      } catch {}
    }
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGame = async () => {
    if (!firebaseReady || !firebase) return;
    const code = generateRoomCode();
    try {
      await firebase.set(firebase.ref(firebase.database, `battleships/${code}`), {
        roomCode: code, host: playerInfo.id, status: 'waiting',
        currentPlayer: playerInfo.id,
        players: { [playerInfo.id]: { id: playerInfo.id, name: playerInfo.name, ready: false } }
      });
      setGameRoom(code); setRoomCode(code); setGameState('waiting');
      setLocalGrid(initEmptyGrid()); setCurrentShipIndex(0); setOrientation('horizontal');
    } catch { showToast('Error creating game', 'error'); }
  };

  const joinGame = async () => {
    if (!firebaseReady || !firebase || !joinCode.trim()) return;
    const code = joinCode.toUpperCase();
    try {
      const snap = await new Promise(res => firebase.onValue(firebase.ref(firebase.database, `battleships/${code}`), res, { onlyOnce: true }));
      const data = snap.val();
      if (!data) return showToast('Game not found', 'error');
      if (Object.keys(data.players || {}).length >= 2) return showToast('Game is full', 'error');
      await firebase.update(firebase.ref(firebase.database, `battleships/${code}`), {
        [`players/${playerInfo.id}`]: { id: playerInfo.id, name: playerInfo.name, ready: false },
        status: 'setup'
      });
      setGameRoom(code); setGameState('setup');
      setLocalGrid(initEmptyGrid()); setCurrentShipIndex(0); setOrientation('horizontal');
    } catch { showToast('Error joining game', 'error'); }
  };

  const canPlaceShip = (grid, r, c, size, orient) => {
    if (orient === 'horizontal') {
      if (c + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) if (grid[r][c + i].type) return false;
    } else {
      if (r + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) if (grid[r + i][c].type) return false;
    }
    return true;
  };

  const getPreviewCells = (r, c) => {
    if (currentShipIndex >= SHIPS.length) return [];
    const ship = SHIPS[currentShipIndex];
    const cells = [];
    const valid = canPlaceShip(localGrid, r, c, ship.size, orientation);
    for (let i = 0; i < ship.size; i++) {
      const pr = orientation === 'vertical' ? r + i : r;
      const pc = orientation === 'horizontal' ? c + i : c;
      if (pr < GRID_SIZE && pc < GRID_SIZE) cells.push({ r: pr, c: pc, valid });
    }
    return cells;
  };

  const handlePlaceShip = async (r, c) => {
    if (gameState !== 'setup' || currentShipIndex >= SHIPS.length) return;
    const ship = SHIPS[currentShipIndex];
    if (!canPlaceShip(localGrid, r, c, ship.size, orientation)) {
      showToast('Cannot place ship there!', 'warning');
      return;
    }
    const newGrid = localGrid.map(row => row.map(cell => ({ ...cell })));
    for (let i = 0; i < ship.size; i++) {
      if (orientation === 'horizontal') newGrid[r][c + i] = { type: 'ship', id: ship.id, hit: false };
      else newGrid[r + i][c] = { type: 'ship', id: ship.id, hit: false };
    }
    setLocalGrid(newGrid);
    const nextIndex = currentShipIndex + 1;
    setCurrentShipIndex(nextIndex);

    if (nextIndex >= SHIPS.length) {
      try {
        const flatGrid = {};
        newGrid.forEach((row, ri) => row.forEach((cell, ci) => { flatGrid[`${ri}_${ci}`] = cell; }));
        await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}/players/${playerInfo.id}`), {
          board: flatGrid, ready: true
        });
        const snap = await new Promise(res => firebase.onValue(firebase.ref(firebase.database, `battleships/${gameRoom}`), res, { onlyOnce: true }));
        const currentData = snap.val();
        const opponentId = Object.keys(currentData.players).find(id => id !== playerInfo.id);
        if (opponentId && currentData.players[opponentId].ready) {
          await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}`), { status: 'playing' });
        } else {
          showToast('Fleet deployed! Awaiting enemy...', 'info');
        }
      } catch { showToast('Error deploying fleet', 'error'); }
    }
  };

  const handleAttack = async (r, c) => {
    if (gameState !== 'playing' || !gameData) return;
    if (gameData.currentPlayer !== playerInfo.id) { showToast('Not your turn!', 'warning'); return; }
    const opponentId = Object.keys(gameData.players).find(id => id !== playerInfo.id);
    const opponentBoard = gameData.players[opponentId].board;
    const cellKey = `${r}_${c}`;
    const targetCell = opponentBoard[cellKey] || { type: null, hit: false };
    if (targetCell.hit) { showToast('Already targeted!', 'warning'); return; }

    const isHit = targetCell.type === 'ship';
    const nextPlayer = isHit ? playerInfo.id : opponentId;
    const updates = {};
    updates[`players/${opponentId}/board/${cellKey}/hit`] = true;
    updates['currentPlayer'] = nextPlayer;
    updates['lastAction'] = { r, c, hit: isHit, by: playerInfo.id, timestamp: Date.now() };

    let hitCount = 0;
    Object.keys(opponentBoard).forEach(k => {
      if (opponentBoard[k].type === 'ship' && opponentBoard[k].hit) hitCount++;
    });
    if (isHit) hitCount++;

    if (hitCount >= TOTAL_SHIP_CELLS) {
      updates['status'] = 'finished';
      updates['winner'] = playerInfo.id;
    }

    try {
      await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}`), updates);
      if (isHit && hitCount < TOTAL_SHIP_CELLS) showToast('Direct hit! Fire again! 🎯', 'success');
    } catch { showToast('Attack failed', 'error'); }
  };

  const kickOpponent = async () => {
    setShowKickConfirm(false);
    if (!firebaseReady || !firebase || !gameRoom || !gameData) return;
    const opponentId = Object.keys(gameData.players || {}).find(id => id !== playerInfo.id);
    if (!opponentId) return;
    const opponentName = gameData.players[opponentId]?.name || 'Opponent';
    try {
      await kickPlayer({
        database: firebase.database,
        roomPath: `battleships/${gameRoom}`,
        targetId: opponentId,
        targetName: opponentName,
        hostName: playerInfo.name,
        extraUpdates: {
          [`battleships/${gameRoom}/status`]: 'finished',
          [`battleships/${gameRoom}/winner`]: playerInfo.id,
          [`battleships/${gameRoom}/forfeitReason`]: 'kicked',
        },
      });
    } catch { showToast('Error removing player', 'error'); }
  };

  const resetGame = () => {
    setGameState('menu'); setGameRoom(null); setGameData(null); setActiveReaction(null);
    setLocalGrid(initEmptyGrid()); setCurrentShipIndex(0); setSunkShips([]); setShowKickConfirm(false);
  };

  const endGame = async () => {
    if (firebaseReady && firebase && gameRoom) {
      try { await firebase.remove(firebase.ref(firebase.database, `battleships/${gameRoom}`)); } catch {}
    }
    resetGame();
  };

  // ---- LOADING ----
  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-cyan-400">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full mb-4" />
        <p className="font-mono tracking-widest animate-pulse text-sm">ESTABLISHING LINK...</p>
      </div>
    );
  }

  // ---- MENU ----
  if (gameState === 'menu') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <div className="relative bg-gradient-to-b from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-900/50 rounded-3xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.12)] overflow-hidden">
          {/* Animated grid dots background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Ocean wave decoration */}
          <div className="flex justify-center mb-5">
            <div className="text-6xl">⚓</div>
          </div>

          <div className="text-center mb-7 relative z-10">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 tracking-tight leading-none mb-1">
              BATTLESHIPS
            </h2>
            <p className="text-slate-600 text-xs font-semibold tracking-[0.2em] uppercase">Naval Warfare · 1v1</p>
          </div>

          {/* Ship list preview */}
          <div className="mb-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-1.5 relative z-10">
            {SHIPS.map(ship => (
              <div key={ship.id} className="flex items-center gap-2">
                <span className="text-sm w-5">{ship.icon}</span>
                <span className="text-slate-400 text-xs font-medium w-20">{ship.name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: ship.size }).map((_, i) => (
                    <div key={i} style={{ backgroundColor: ship.color + '80', borderColor: ship.color }}
                      className="w-4 h-3 rounded-sm border" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 relative z-10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={createGame}
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white py-4 rounded-2xl font-bold tracking-wide shadow-[0_4px_24px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <span>🛳</span> Create Game
            </motion.button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-slate-600 text-xs font-semibold tracking-widest">OR JOIN</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full bg-slate-800/60 border-2 border-slate-700 focus:border-cyan-500 text-white px-4 py-3.5 rounded-2xl outline-none text-center font-mono text-2xl tracking-[0.4em] uppercase transition-all placeholder:text-slate-700 placeholder:text-sm placeholder:tracking-[0.15em]"
              maxLength="6"
            />

            <motion.button whileHover={joinCode.trim() ? { scale: 1.02 } : {}} whileTap={joinCode.trim() ? { scale: 0.97 } : {}}
              onClick={joinGame} disabled={!joinCode.trim()}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-4 rounded-2xl font-bold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>🎯</span> Join Game
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- WAITING ----
  if (gameState === 'waiting') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm mx-auto text-center">
        <div className="bg-gradient-to-b from-slate-900 to-cyan-950/20 border border-cyan-900/40 rounded-3xl p-8 shadow-2xl">
          {/* Sonar animation */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            {[0, 0.5, 1].map((delay, i) => (
              <motion.div key={i}
                className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center text-4xl">📡</div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Broadcasting frequency</h2>
          <p className="text-slate-500 text-sm mb-6">Give this code to your opponent</p>

          <motion.div onClick={() => { navigator.clipboard.writeText(roomCode); showToast('Copied!', 'success'); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="cursor-pointer bg-slate-800/80 border-2 border-cyan-700/50 hover:border-cyan-500 rounded-2xl p-5 mb-5 transition-all group"
          >
            <p className="font-mono text-5xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
              {roomCode}
            </p>
            <p className="text-slate-600 text-xs mt-2 tracking-widest uppercase group-hover:text-cyan-500 transition-colors flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Tap to copy
            </p>
          </motion.div>

          <button onClick={endGame} className="w-full py-3 rounded-xl font-semibold text-sm bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-all">
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  // ---- SETUP ----
  if (gameState === 'setup') {
    const isMeReady = gameData?.players?.[playerInfo.id]?.ready;
    const currentShip = SHIPS[currentShipIndex];
    const previewCells = hoverCell ? getPreviewCells(hoverCell.r, hoverCell.c) : [];

    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-b from-slate-900 to-cyan-950/10 border border-cyan-900/40 rounded-3xl p-5 shadow-2xl">
          <h2 className="text-xl font-black text-cyan-400 mb-1 tracking-widest text-center uppercase">Deploy Your Fleet</h2>
          <p className="text-center text-slate-500 text-xs mb-4 font-mono tracking-wide">Place ships on the grid to start the battle</p>

          <AnimatePresence mode="wait">
            {!isMeReady ? (
              <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Current ship info */}
                {currentShip && (
                  <div className="flex items-center justify-between mb-4 bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentShip.icon}</span>
                      <div>
                        <div className="text-white font-bold text-sm">{currentShip.name}</div>
                        <div className="flex gap-1 mt-0.5">
                          {Array.from({ length: currentShip.size }).map((_, i) => (
                            <div key={i} style={{ backgroundColor: currentShip.color + '90', borderColor: currentShip.color }}
                              className="w-4 h-3 rounded-sm border" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                      onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
                      className="flex items-center gap-2 px-3 py-2 bg-cyan-900/40 border border-cyan-700 text-cyan-300 rounded-xl font-mono font-bold text-xs hover:bg-cyan-800/40 transition-all"
                    >
                      <motion.span animate={{ rotate: orientation === 'vertical' ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        ↔
                      </motion.span>
                      {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
                    </motion.button>
                  </div>
                )}

                {/* Ship progress */}
                <div className="flex gap-1.5 mb-4 justify-center">
                  {SHIPS.map((ship, i) => (
                    <div key={ship.id} style={{ borderColor: i < currentShipIndex ? ship.color : i === currentShipIndex ? ship.color : '#374151' }}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm transition-all ${
                        i < currentShipIndex ? 'opacity-50 bg-slate-800/40' : i === currentShipIndex ? 'bg-slate-800 scale-110 shadow-lg' : 'opacity-30 bg-slate-800/20'
                      }`}>
                      {i < currentShipIndex ? '✓' : ship.icon}
                    </div>
                  ))}
                </div>

                {/* Grid with labels */}
                <div className="flex justify-center">
                  <div>
                    {/* Column labels */}
                    <div className="flex mb-1 ml-6">
                      {COLS.map(col => (
                        <div key={col} className="text-slate-600 text-xs font-mono font-bold text-center" style={{ width: '10%', minWidth: 28 }}>{col}</div>
                      ))}
                    </div>
                    <div className="flex">
                      {/* Row labels */}
                      <div className="flex flex-col justify-around mr-1">
                        {Array.from({ length: GRID_SIZE }).map((_, r) => (
                          <div key={r} className="text-slate-600 text-xs font-mono font-bold flex items-center justify-center" style={{ height: 28 }}>{r + 1}</div>
                        ))}
                      </div>
                      {/* The grid */}
                      <div className="border border-cyan-900/60 rounded-lg overflow-hidden"
                        style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                        {localGrid.map((row, r) => row.map((cell, c) => {
                          const isPreview = previewCells.find(p => p.r === r && p.c === c);
                          const shipDef = cell.type === 'ship' ? SHIPS.find(s => s.id === cell.id) : null;
                          return (
                            <div key={`p-${r}-${c}`}
                              className={`border border-cyan-950/60 relative transition-all cursor-pointer flex items-center justify-center
                                ${!cell.type || !shipDef
                                  ? isPreview
                                    ? isPreview.valid ? 'bg-cyan-500/30 border-cyan-400/60' : 'bg-red-500/30 border-red-400/60'
                                    : 'bg-slate-900/70 hover:bg-cyan-950/40'
                                  : ''
                                }
                              `}
                              style={{
                                width: 28, height: 28,
                                backgroundColor: cell.type === 'ship' && shipDef ? shipDef.color + '60' : undefined,
                                borderColor: cell.type === 'ship' && shipDef ? shipDef.color + '80' : undefined,
                              }}
                              onMouseEnter={() => setHoverCell({ r, c })}
                              onMouseLeave={() => setHoverCell(null)}
                              onClick={() => handlePlaceShip(r, c)}
                            />
                          );
                        }))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-3 font-mono">
                  {SHIPS.length - currentShipIndex} ship{SHIPS.length - currentShipIndex !== 1 ? 's' : ''} remaining
                </p>
              </motion.div>
            ) : (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-10">
                <div className="text-5xl mb-4">⚓</div>
                <h3 className="text-xl font-bold text-cyan-400 tracking-widest font-mono mb-2">FLEET DEPLOYED</h3>
                <p className="text-slate-500 font-mono text-sm animate-pulse">Awaiting enemy deployment...</p>
                <div className="flex gap-1.5 mt-4">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay }}
                      className="w-2 h-2 bg-cyan-500 rounded-full" />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ---- PLAYING / FINISHED ----
  if (gameState === 'playing' || gameState === 'finished') {
    const isMyTurn = gameData.currentPlayer === playerInfo.id;
    const opponentId = Object.keys(gameData.players).find(id => id !== playerInfo.id);
    const opponentName = gameData.players[opponentId]?.name || 'Enemy';
    const myFlatBoard = gameData.players[playerInfo.id]?.board || {};
    const oppFlatBoard = opponentId ? (gameData.players[opponentId].board || {}) : {};
    const mySunkCount = getSunkShips(myFlatBoard).length;

    const renderGridCell = (cell, onClick, isFog, isAttackable) => {
      const isShip = cell.type === 'ship';
      const isHit = cell.hit;
      const shipDef = isShip && !isFog ? SHIPS.find(s => s.id === cell.id) : null;

      return (
        <div
          onClick={onClick}
          className={`w-full h-full relative flex items-center justify-center transition-all
            ${isAttackable && !isHit ? 'cursor-crosshair hover:bg-cyan-500/25 hover:border-cyan-400' : 'cursor-default'}
          `}
          style={{
            backgroundColor: isHit && isShip ? 'rgba(239,68,68,0.2)'
              : isHit && !isShip ? 'rgba(255,255,255,0.04)'
              : isShip && shipDef ? shipDef.color + '45'
              : 'transparent',
          }}
        >
          {isHit && isShip && (
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
              className="text-base leading-none">💥</motion.div>
          )}
          {isHit && !isShip && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-slate-500/60" />
          )}
        </div>
      );
    };

    const GridWithLabels = ({ flatBoard, onCellClick, isFog, isActive, title, titleColor }) => (
      <div className="flex flex-col items-center">
        <div className={`text-xs font-bold tracking-widest mb-2 uppercase font-mono ${titleColor}`}>{title}</div>
        <div className="flex">
          <div className="flex flex-col justify-around mr-1">
            {Array.from({ length: GRID_SIZE }).map((_, r) => (
              <div key={r} className="text-slate-700 text-xs font-mono font-bold flex items-center justify-center" style={{ height: 26 }}>{r + 1}</div>
            ))}
          </div>
          <div>
            <div className="flex mb-0.5 ml-0">
              {COLS.map(col => (
                <div key={col} className="text-slate-700 text-xs font-mono font-bold text-center" style={{ width: 26 }}>{col}</div>
              ))}
            </div>
            <div className={`border-2 rounded-lg overflow-hidden relative transition-all ${
              isActive && gameState === 'playing' ? 'border-red-600/70 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'border-slate-800/60'
            }`}
              style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, width: GRID_SIZE * 26, height: GRID_SIZE * 26 }}>
              {/* Scanline on active attack grid */}
              {isActive && gameState === 'playing' && (
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-md">
                  <motion.div animate={{ top: ['-5%', '105%'] }} transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                    className="absolute w-full h-[2px] bg-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.8)]" style={{ position: 'absolute' }} />
                </div>
              )}
              {Array.from({ length: GRID_SIZE }).map((_, r) => Array.from({ length: GRID_SIZE }).map((_, c) => {
                const cell = flatBoard[`${r}_${c}`] || { type: null, hit: false };
                return (
                  <div key={`${r}-${c}`} className="border border-slate-800/50 relative" style={{ width: 26, height: 26 }}>
                    {renderGridCell(cell, () => onCellClick(r, c), isFog, isActive && !cell.hit)}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="max-w-2xl mx-auto">
        {/* Kick confirmation */}
        {showKickConfirm && (
          <KickConfirmModal
            playerName={opponentName}
            onConfirm={kickOpponent}
            onCancel={() => setShowKickConfirm(false)}
          />
        )}

        {/* Reaction overlay */}
        <AnimatePresence>
          {activeReaction && (
            <motion.div initial={{ opacity: 0, scale: 0.4, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.8, y: -50 }}
              className={`fixed z-50 text-7xl pointer-events-none ${activeReaction.isMine ? 'bottom-24 left-8' : 'top-32 right-8'}`}>
              {activeReaction.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status header */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
            isMyTurn && gameState === 'playing' ? 'bg-cyan-950/60 border-cyan-700 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'bg-slate-800/40 border-slate-700/50 opacity-60'
          }`}>
            <motion.div animate={isMyTurn && gameState === 'playing' ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.9 }}
              className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            <span className={`text-xs font-bold tracking-wider ${isMyTurn && gameState === 'playing' ? 'text-cyan-300' : 'text-slate-500'}`}>
              {isMyTurn && gameState === 'playing' ? 'YOUR ATTACK' : 'STANDING BY'}
            </span>
          </div>

          {gameState === 'playing' && (
            <div className="flex items-center gap-1">
              <div className="text-xs text-slate-600 mr-1 font-mono">REACT</div>
              {EMOJI_LIST.map(e => (
                <motion.button key={e} whileHover={{ scale: 1.3, y: -3 }} whileTap={{ scale: 0.8 }}
                  onClick={() => sendReaction(e)}
                  className="text-sm w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 border border-slate-700/80 hover:border-cyan-700 transition-all">
                  {e}
                </motion.button>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
            !isMyTurn && gameState === 'playing' ? 'bg-red-950/40 border-red-800 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : 'bg-slate-800/40 border-slate-700/50 opacity-60'
          }`}>
            <span className={`text-xs font-bold tracking-wider ${!isMyTurn && gameState === 'playing' ? 'text-red-400' : 'text-slate-500'}`}>
              {!isMyTurn && gameState === 'playing' ? `${opponentName} attacking` : opponentName.toUpperCase()}
            </span>
            {isHost && gameState === 'playing' && opponentId && (
              <KickButton onClick={() => setShowKickConfirm(true)} name={opponentName} />
            )}
          </div>
        </div>

        {/* Sunk ships tracker */}
        {sunkShips.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-xs font-mono tracking-widest">SUNK:</span>
            {sunkShips.map(id => {
              const ship = SHIPS.find(s => s.id === id);
              return (
                <span key={id} className="flex items-center gap-1 text-xs font-semibold" style={{ color: ship?.color }}>
                  {ship?.icon} {ship?.name}
                </span>
              );
            })}
          </motion.div>
        )}

        {/* Dual grids */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-start">
          <GridWithLabels
            flatBoard={myFlatBoard}
            onCellClick={() => {}}
            isFog={false}
            isActive={false}
            title={`Your Waters${mySunkCount > 0 ? ` · ${mySunkCount} lost` : ''}`}
            titleColor="text-cyan-600"
          />
          <GridWithLabels
            flatBoard={oppFlatBoard}
            onCellClick={(r, c) => handleAttack(r, c)}
            isFog={true}
            isActive={isMyTurn}
            title={`${opponentName}'s Waters · ${sunkShips.length}/${SHIPS.length} sunk`}
            titleColor="text-red-500"
          />
        </div>

        {/* Ships remaining legend */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {SHIPS.map(ship => {
            const isSunk = sunkShips.includes(ship.id);
            return (
              <div key={ship.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                isSunk ? 'border-red-900/50 bg-red-950/20 opacity-60' : 'border-slate-800 bg-slate-900/50'
              }`}>
                <span className="text-base">{isSunk ? '💀' : ship.icon}</span>
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {Array.from({ length: ship.size }).map((_, i) => (
                    <div key={i} style={{ backgroundColor: isSunk ? '#374151' : ship.color + '80', borderColor: isSunk ? '#4b5563' : ship.color }}
                      className="w-2.5 h-2 rounded-sm border" />
                  ))}
                </div>
                <span className={`text-xs font-mono ${isSunk ? 'text-slate-600 line-through' : 'text-slate-500'}`}>{ship.name}</span>
              </div>
            );
          })}
        </div>

        {/* Game over panel */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-slate-900/98 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.1 }} className="text-5xl mb-3">
                {gameData.winner === playerInfo.id ? '🏆' : '🌊'}
              </motion.div>
              <h3 className={`text-3xl font-black mb-1 ${gameData.winner === playerInfo.id ? 'text-amber-400' : 'text-red-400'}`}>
                {gameData.winner === playerInfo.id ? 'Victory!' : 'Defeat!'}
              </h3>
              <p className="text-slate-500 text-sm mb-5">
                {gameData.forfeitReason === 'kicked'
                  ? (gameData.winner === playerInfo.id ? 'You won — the opponent was removed from the game.' : 'You were removed from the game.')
                  : (gameData.winner === playerInfo.id ? 'You sank the entire enemy fleet!' : 'Your fleet has been destroyed.')}
              </p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={endGame}
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-4 rounded-2xl font-bold tracking-wide shadow-[0_4px_20px_rgba(6,182,212,0.35)] transition-all">
                Return to Port
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default BattleshipsGame;
