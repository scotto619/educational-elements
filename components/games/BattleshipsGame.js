// components/games/BattleshipsGame.js - FIREBASE MULTIPLAYER & MODERN UI OVERHAUL
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GRID_SIZE = 8;
const EMOJI_LIST = ['🚢', '💥', '💦', '🎯', '🤔', '😭'];

const SHIPS_TO_PLACE = [
  { name: 'Carrier', size: 5, id: 'carrier' },
  { name: 'Battleship', size: 4, id: 'battleship' },
  { name: 'Cruiser', size: 3, id: 'cruiser' },
  { name: 'Submarine', size: 3, id: 'submarine' },
  { name: 'Destroyer', size: 2, id: 'destroyer' }
];

const BattleshipsGame = ({ studentData, showToast }) => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, onValue, set, update, remove, off } = await import('firebase/database');
        setFirebase({ database, ref, onValue, set, update, remove, off });
        setFirebaseReady(true);
      } catch (error) {
        console.error('Failed to load Firebase:', error);
        showToast('Failed to load game engine', 'error');
      }
    };
    initFirebase();
  }, []);

  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Commander',
  };

  const [gameState, setGameState] = useState('menu'); // menu, waiting, setup, playing, finished
  const [gameRoom, setGameRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [gameData, setGameData] = useState(null);
  
  // Local Setup State
  const [localGrid, setLocalGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill({ type: null, hit: false })));
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal'); // horizontal, vertical

  const [activeReaction, setActiveReaction] = useState(null);
  const [lastProcessedReactionId, setLastProcessedReactionId] = useState(null);

  // Firebase listener
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;

    const gameRef = firebase.ref(firebase.database, `battleships/${gameRoom}`);
    const unsubscribe = firebase.onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        resetGame();
        showToast('Game ended', 'info');
        return;
      }

      setGameData(data);

      if (data.reaction && data.reaction.id !== lastProcessedReactionId) {
        if (data.reaction.sender !== playerInfo.id) {
          showOpponentReaction(data.reaction.emoji);
        }
        setLastProcessedReactionId(data.reaction.id);
      }

      // State transitions
      if (gameState === 'waiting' && data.players && Object.keys(data.players).length === 2) {
        setGameState('setup');
        showToast('Opponent joined! Prepare your fleet.', 'success');
      }

      const me = data.players[playerInfo.id];
      const opponentId = Object.keys(data.players).find(id => id !== playerInfo.id);
      const opponent = opponentId ? data.players[opponentId] : null;

      if (gameState === 'setup' && me?.ready && opponent?.ready && data.status === 'playing') {
        setGameState('playing');
        showToast('Battle Commenced!', 'success');
      }

      if (data.status === 'finished' && gameState !== 'finished') {
        setGameState('finished');
        if (data.winner === playerInfo.id) showToast('VICTORY!', 'success');
        else showToast('DEFEAT!', 'error');
      }
    });

    return () => firebase.off(gameRef, 'value', unsubscribe);
  }, [firebaseReady, firebase, gameRoom, gameState, lastProcessedReactionId]);

  const showOpponentReaction = (emoji) => {
    setActiveReaction({ emoji, isMine: false, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
  };

  const sendReaction = async (emoji) => {
    setActiveReaction({ emoji, isMine: true, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
    if (firebaseReady && firebase && gameRoom) {
      await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}`), {
        reaction: { emoji, sender: playerInfo.id, id: Date.now() }
      });
    }
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGame = async () => {
    if (!firebaseReady || !firebase) return;
    const code = generateRoomCode();
    try {
      await firebase.set(firebase.ref(firebase.database, `battleships/${code}`), {
        roomCode: code,
        host: playerInfo.id,
        status: 'waiting',
        currentPlayer: playerInfo.id, // Host goes first
        players: {
          [playerInfo.id]: { id: playerInfo.id, name: playerInfo.name, ready: false }
        }
      });
      setGameRoom(code);
      setRoomCode(code);
      setGameState('waiting');
      initLocalGrid();
    } catch (e) {
      showToast('Error creating game', 'error');
    }
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
      setGameRoom(code);
      setGameState('setup');
      initLocalGrid();
    } catch (e) {
      showToast('Error joining game', 'error');
    }
  };

  const initLocalGrid = () => {
    setLocalGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill({ type: null, hit: false })));
    setCurrentShipIndex(0);
    setOrientation('horizontal');
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

  const handlePlaceShip = async (r, c) => {
    if (gameState !== 'setup' || currentShipIndex >= SHIPS_TO_PLACE.length) return;
    const ship = SHIPS_TO_PLACE[currentShipIndex];
    
    if (canPlaceShip(localGrid, r, c, ship.size, orientation)) {
      const newGrid = [...localGrid];
      for (let i = 0; i < ship.size; i++) {
        if (orientation === 'horizontal') newGrid[r][c + i] = { type: 'ship', id: ship.id, hit: false };
        else newGrid[r + i][c] = { type: 'ship', id: ship.id, hit: false };
      }
      setLocalGrid(newGrid);
      
      const nextIndex = currentShipIndex + 1;
      setCurrentShipIndex(nextIndex);
      
      if (nextIndex >= SHIPS_TO_PLACE.length) {
        // All ships placed, mark ready
        try {
          // Convert 2D array to a flat object to store in Firebase more reliably
          const flatGrid = {};
          newGrid.forEach((row, rowIndex) => {
             row.forEach((cell, colIndex) => {
               flatGrid[`${rowIndex}_${colIndex}`] = cell;
             });
          });

          await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}/players/${playerInfo.id}`), {
            board: flatGrid,
            ready: true
          });
          
          // Check if opponent is also ready gracefully
          const snap = await new Promise(res => firebase.onValue(firebase.ref(firebase.database, `battleships/${gameRoom}`), res, { onlyOnce: true }));
          const currentData = snap.val();
          const opponentId = Object.keys(currentData.players).find(id => id !== playerInfo.id);
          
          if (opponentId && currentData.players[opponentId].ready) {
            await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}`), { status: 'playing' });
          } else {
            showToast('Awaiting opponent deployment...', 'info');
          }
        } catch (e) {
          showToast('Error saving deployment', 'error');
        }
      }
    } else {
      showToast('Invalid coordinate, Admiral!', 'warning');
    }
  };

  const handleAttack = async (r, c) => {
    if (gameState !== 'playing' || !gameData) return;
    if (gameData.currentPlayer !== playerInfo.id) return showToast('Not your turn!', 'warning');
    
    const opponentId = Object.keys(gameData.players).find(id => id !== playerInfo.id);
    const opponentBoard = gameData.players[opponentId].board;
    const cellKey = `${r}_${c}`;
    const targetCell = opponentBoard[cellKey] || { type: null, hit: false };
    
    if (targetCell.hit) return showToast('Already fired at this sector!', 'warning');

    // Make attack
    const isHit = targetCell.type === 'ship';
    const nextPlayer = isHit ? playerInfo.id : opponentId; // Play again if hit!

    const updates = {};
    updates[`players/${opponentId}/board/${cellKey}/hit`] = true;
    updates[`currentPlayer`] = nextPlayer;
    updates[`lastAction`] = { r, c, hit: isHit, by: playerInfo.id, timestamp: Date.now() };

    // Check Win
    let hitCount = 0;
    const totalShipCells = SHIPS_TO_PLACE.reduce((acc, s) => acc + s.size, 0);
    
    // Count hits in the current state + the new hit
    Object.keys(opponentBoard).forEach(k => {
      if (opponentBoard[k].type === 'ship' && opponentBoard[k].hit) hitCount++;
    });
    if (isHit) hitCount++;

    if (hitCount >= totalShipCells) {
      updates['status'] = 'finished';
      updates['winner'] = playerInfo.id;
    }

    try {
      await firebase.update(firebase.ref(firebase.database, `battleships/${gameRoom}`), updates);
      if (isHit && hitCount < totalShipCells) showToast('Direct Hit! Fire again!', 'success');
    } catch (e) {
      showToast('Attack failed to transmit', 'error');
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setGameRoom(null);
    setGameData(null);
    setActiveReaction(null);
  };

  const endGame = async () => {
    if (firebaseReady && firebase && gameRoom) {
      try { await firebase.remove(firebase.ref(firebase.database, `battleships/${gameRoom}`)); } catch (e) {}
    }
    resetGame();
  };

  const renderCell = (cell, onClick, isFog = false, highlightHover = false) => {
    const isShip = cell.type === 'ship';
    const isHit = cell.hit;
    
    let baseColor = 'bg-slate-900/60 border-cyan-900/40';
    if (isShip && !isFog) baseColor = 'bg-slate-500 border-slate-400';
    
    return (
      <motion.div
        onClick={onClick}
        whileHover={highlightHover ? { scale: 1.1, backgroundColor: 'rgba(6, 182, 212, 0.4)' } : {}}
        className={`w-full h-full border relative flex items-center justify-center transition-colors cursor-pointer ${baseColor}`}
      >
        {isHit && isShip && (
           <motion.div 
             initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
             className="w-3/4 h-3/4 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] flex items-center justify-center font-bold text-xl md:text-2xl"
           >
             💥
           </motion.div>
        )}
        {isHit && !isShip && (
           <motion.div 
             initial={{ scale: 0 }} animate={{ scale: 1 }}
             className="w-1/2 h-1/2 rounded-full bg-white/40 shadow-[0_0_5px_rgba(255,255,255,0.5)]" 
           />
        )}
      </motion.div>
    );
  };

  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-cyan-500">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mb-4" />
        <p className="font-mono tracking-widest animate-pulse">ESTABLISHING SECURE LINK...</p>
      </div>
    );
  }

  // ---- MENU ----
  if (gameState === 'menu') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto group">
        <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-900/50 rounded-3xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
          {/* Radar Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.2)_0%,transparent_70%)]"></div>
          
          <div className="text-center mb-8 relative z-10">
            <h2 className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-lg tracking-widest">
              NAVAL COMMAND
            </h2>
            <p className="text-cyan-600 font-mono tracking-widest text-sm">SECURE MULTIPLAYER TERMINAL</p>
          </div>

          <div className="space-y-6 relative z-10 flex flex-col items-center">
            <button
              onClick={createGame}
              className="w-full bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500 text-cyan-300 py-4 rounded-xl font-bold tracking-widest transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            >
              INITIALIZE FLEET (HOST)
            </button>
            
            <div className="text-cyan-800 text-sm font-mono tracking-widest">- OR -</div>
            
            <div className="w-full space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER FREQUENCY"
                className="w-full bg-slate-950/80 border-2 border-cyan-900 focus:border-cyan-400 text-cyan-300 px-4 py-4 rounded-xl outline-none text-center font-mono text-xl tracking-[0.3em] uppercase transition-all"
                maxLength="6"
              />
              <button
                onClick={joinGame}
                disabled={!joinCode.trim()}
                className="w-full bg-blue-600/20 hover:bg-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500 text-blue-300 py-4 rounded-xl font-bold tracking-widest transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              >
                INTERCEPT (JOIN)
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- WAITING ----
  if (gameState === 'waiting') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
        <div className="bg-slate-900/90 border-2 border-cyan-900/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(6,182,212,0.1)_50%,rgba(0,0,0,0)_100%)] animate-[spin_3s_linear_infinite]"></div>
          <div className="relative z-10">
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-5xl mb-6">📡</motion.div>
            <h2 className="text-2xl font-bold text-cyan-400 mb-2 tracking-widest font-mono">BROADCASTING...</h2>
            <p className="text-cyan-600 mb-6 font-mono text-sm">Provide frequency to allied commander:</p>
            
            <div className="bg-slate-950 border border-cyan-800 rounded-xl p-6 mb-8 inline-block cursor-pointer hover:border-cyan-400 transition-colors"
                 onClick={() => { navigator.clipboard.writeText(roomCode); showToast('Copied!', 'success'); }}>
              <p className="font-mono text-5xl font-black tracking-widest text-cyan-400">{roomCode}</p>
            </div>
            
            <button onClick={endGame} className="w-full bg-slate-800/80 text-red-400 hover:text-red-300 py-3 rounded-xl font-bold tracking-widest border border-red-900/50 hover:bg-red-900/30">
              CANCEL OPERATIONS
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ---- SETUP Phase ----
  if (gameState === 'setup') {
    const isMeReady = gameData?.players?.[playerInfo.id]?.ready;
    const currentShip = SHIPS_TO_PLACE[currentShipIndex];

    return (
      <div className="max-w-xl mx-auto flex flex-col items-center">
        <div className="bg-slate-900/80 border border-cyan-900 rounded-2xl p-6 shadow-2xl w-full relative overflow-hidden">
          <h2 className="text-2xl font-black text-cyan-400 mb-4 tracking-widest text-center">DEPLOYMENT PHASE</h2>
          
          <AnimatePresence mode="wait">
            {!isMeReady ? (
              <motion.div key="deploying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center flex flex-col items-center">
                <div className="mb-4 bg-slate-800 border border-slate-700 rounded-lg p-3 inline-block">
                  <p className="text-slate-300 font-mono text-sm">Awaiting placement:</p>
                  <p className="text-cyan-400 font-bold tracking-widest">{currentShip.name} ({currentShip.size} Units)</p>
                </div>
                
                <button
                  onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
                  className="px-6 py-2 mb-6 bg-cyan-900/40 border border-cyan-600 text-cyan-300 rounded-lg font-mono font-bold hover:bg-cyan-800/40 transition-colors"
                >
                  [ ROTATE: {orientation.toUpperCase()} ]
                </button>

                <div className="relative inline-block border-2 border-cyan-800 bg-slate-950 rounded-lg p-1">
                  <div className="grid w-64 h-64 md:w-80 md:h-80 relative" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                    {localGrid.map((row, r) => row.map((cell, c) => (
                      <div key={`p-${r}-${c}`} className="w-full h-full p-[1px]">
                        {renderCell(cell, () => handlePlaceShip(r, c), false, true)}
                      </div>
                    )))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
                 <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                 <h3 className="text-xl font-bold text-cyan-400 tracking-widest font-mono">STAND BY</h3>
                 <p className="text-slate-400 mt-2 font-mono text-sm">Awaiting opponent deployment...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ---- PLAYING / FINISHED Phase ----
  if (gameState === 'playing' || gameState === 'finished') {
    const isMyTurn = gameData.currentPlayer === playerInfo.id;
    const opponentId = Object.keys(gameData.players).find(id => id !== playerInfo.id);
    const opponentName = gameData.players[opponentId]?.name || 'Unknown';
    
    const myFlatBoard = gameData.players[playerInfo.id].board;
    const oppFlatBoard = opponentId ? gameData.players[opponentId].board : {};

    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Status Header */}
        <div className="w-full bg-slate-900 border border-cyan-800 rounded-2xl p-4 flex justify-between items-center mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
           <div className={`px-4 py-2 rounded-lg border ${isMyTurn ? 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 border-slate-700'}`}>
             <p className={`font-black tracking-widest ${isMyTurn ? 'text-cyan-400' : 'text-slate-500'}`}>
               {isMyTurn ? '> YOUR ORDERS' : 'STANDING BY'}
             </p>
           </div>
           
           {gameState === 'finished' && (
             <div className="px-6 py-2 bg-red-900/40 border border-red-500 rounded-lg absolute left-1/2 -translate-x-1/2 z-50">
               <p className="text-red-400 font-black tracking-widest animate-pulse">
                 {gameData.winner === playerInfo.id ? 'MISSION SUCCESS' : 'MISSION FAILED'}
               </p>
             </div>
           )}

           <div className="flex gap-2">
             {EMOJI_LIST.map(e => (
               <button key={e} onClick={() => sendReaction(e)} className="hover:scale-125 transition-transform text-xl bg-slate-800 p-2 rounded-md border border-slate-700">{e}</button>
             ))}
           </div>
        </div>

        {/* Reaction Display */}
        <AnimatePresence>
          {activeReaction && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 2 }} className={`fixed z-50 text-7xl md:text-9xl pointer-events-none ${activeReaction.isMine ? 'bottom-20 left-20' : 'top-40 right-20'}`}>
              {activeReaction.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 w-full justify-center">
          
          {/* My Grid (Defensive) */}
          <div className="flex flex-col items-center">
            <h3 className="text-cyan-500 font-mono font-bold tracking-widest mb-3 opacity-70">DEFENSIVE PERIMETER</h3>
            <div className="relative inline-block border-2 border-cyan-900 bg-slate-950 rounded-lg p-1 opacity-80 backdrop-blur-md transition-all hover:opacity-100">
               <div className="grid w-56 h-56 md:w-72 md:h-72" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                 {Array(GRID_SIZE).fill().map((_, r) => Array(GRID_SIZE).fill().map((_, c) => {
                   const cell = myFlatBoard[`${r}_${c}`] || { type: null, hit: false };
                   return (
                     <div key={`my-${r}-${c}`} className="p-[1px]">
                       {renderCell(cell, () => {}, false, false)}
                     </div>
                   )
                 }))}
               </div>
            </div>
          </div>

          {/* Opponent Grid (Offensive) */}
          <div className="flex flex-col items-center">
            <h3 className="text-red-400 font-mono font-bold tracking-widest mb-3">OFFENSIVE TARGET : {opponentName.toUpperCase()}</h3>
            <div className={`relative inline-block border-2 p-1 rounded-lg bg-slate-950 transition-all ${isMyTurn && gameState === 'playing' ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'border-red-900/50 opacity-60'}`}>
               
               {/* Scanline effect */}
               {isMyTurn && gameState === 'playing' && (
                 <div className="absolute inset-0 z-20 pointer-events-none rounded-lg overflow-hidden">
                   <motion.div animate={{ top: ['-10%', '110%'] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute w-full h-[2px] bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,1)]" />
                 </div>
               )}

               <div className="grid w-64 h-64 md:w-80 md:h-80 relative z-10" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                 {Array(GRID_SIZE).fill().map((_, r) => Array(GRID_SIZE).fill().map((_, c) => {
                   const cell = oppFlatBoard[`${r}_${c}`] || { type: null, hit: false };
                   return (
                     <div key={`opp-${r}-${c}`} className="p-[1px]">
                       {renderCell(cell, () => handleAttack(r, c), true, isMyTurn && !cell.hit)}
                     </div>
                   )
                 }))}
               </div>
            </div>
            {!isMyTurn && gameState === 'playing' && (
              <div className="mt-4 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono animate-pulse">
                 AWAITING ENEMY MANEUVER...
              </div>
            )}
          </div>
        </div>

        {gameState === 'finished' && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-12 text-center">
             <button onClick={endGame} className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-cyan-800 text-cyan-400 font-bold tracking-widest rounded-xl transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
               RETURN TO COMMAND
             </button>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
};

export default BattleshipsGame;