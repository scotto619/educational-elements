// components/games/TicTacToeGame.js - COMPLETE OVERHAUL v3
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { kickPlayer, watchForKick, KickButton, KickConfirmModal } from './shared/kickPlayer';

const EMOJI_LIST = ['👍', '😂', '😲', '😠', '🎉', '🔥'];

// Confetti burst on win
const Confetti = () => {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#fb7185'][i % 6],
    size: Math.random() * 9 + 5,
    delay: Math.random() * 0.4,
    duration: Math.random() * 0.9 + 0.7,
    rotate: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{ left: `${p.x}%`, width: p.size, height: p.size, backgroundColor: p.color, borderRadius: p.isCircle ? '50%' : '2px', top: 0 }}
          className="absolute"
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: 320, opacity: 0, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
};

const TicTacToeGame = ({ studentData, showToast }) => {
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

  const [gameState, setGameState] = useState('menu');
  const [gameRoom, setGameRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerRole, setPlayerRole] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [scores, setScores] = useState({ me: 0, opponent: 0, draws: 0 });
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeReaction, setActiveReaction] = useState(null);
  const [lastProcessedReactionId, setLastProcessedReactionId] = useState(null);
  const [showKickConfirm, setShowKickConfirm] = useState(false);

  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Player',
    avatar: studentData?.avatarBase || 'Wizard F',
    level: studentData?.totalPoints ? Math.min(4, Math.max(1, Math.floor(studentData.totalPoints / 100) + 1)) : 1
  };

  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    const gameRef = firebase.ref(firebase.database, `ticTacToe/${gameRoom}`);
    const unsubscribe = firebase.onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { resetGame(); showToast('Game ended', 'info'); return; }

      if (data.gameResetAt && data.gameResetAt > (Date.now() - 5000)) {
        setWinner(null);
        setShowConfetti(false);
        setGameState('playing');
        setIsMyTurn(data.currentPlayer === playerRole);
      }

      setGameData(data);

      if (data.reaction && data.reaction.id !== lastProcessedReactionId) {
        if (data.reaction.sender !== playerInfo.id) {
          setActiveReaction({ emoji: data.reaction.emoji, isMine: false, id: Date.now() });
          setTimeout(() => setActiveReaction(null), 2500);
        }
        setLastProcessedReactionId(data.reaction.id);
      }

      let processedBoard = Array(9).fill(null);
      if (data.board) {
        if (Array.isArray(data.board)) {
          for (let i = 0; i < 9; i++) {
            if (data.board[i] === 'X' || data.board[i] === 'O') processedBoard[i] = data.board[i];
          }
        } else if (typeof data.board === 'object') {
          Object.keys(data.board).forEach(key => {
            const index = parseInt(key);
            if (!isNaN(index) && index >= 0 && index < 9 && (data.board[key] === 'X' || data.board[key] === 'O')) {
              processedBoard[index] = data.board[key];
            }
          });
        }
      }
      setBoard(processedBoard);

      if (data.players && Object.keys(data.players).length === 2 && gameState === 'waiting') {
        setGameState('playing');
        showToast('Opponent connected!', 'success');
      }

      if (gameState === 'playing' && !winner) {
        if (data.forfeitWinner) {
          if (data.forfeitWinner === playerRole) {
            const forfeitResult = { winner: data.forfeitWinner, line: [], reason: data.forfeitReason || 'Opponent was removed from the game.' };
            setWinner(forfeitResult);
            setGameState('finished');
            setShowConfetti(true);
            setScores(s => ({ ...s, me: s.me + 1 }));
            showToast('🏆 Opponent removed — you win!', 'success');
          }
        } else {
          const winResult = checkWinner(processedBoard);
          if (winResult.winner) {
            setWinner(winResult);
            setGameState('finished');
            if (winResult.winner === playerRole) {
              setShowConfetti(true);
              setScores(s => ({ ...s, me: s.me + 1 }));
              showToast('🏆 You Won!', 'success');
            } else if (winResult.winner === 'draw') {
              setScores(s => ({ ...s, draws: s.draws + 1 }));
              showToast("It's a Draw!", 'info');
            } else {
              setScores(s => ({ ...s, opponent: s.opponent + 1 }));
              showToast('You Lost!', 'error');
            }
          }
        }
      }

      const newIsMyTurn = data.currentPlayer === playerRole;
      if (newIsMyTurn !== isMyTurn) setIsMyTurn(newIsMyTurn);
    });

    return () => firebase.off(gameRef, 'value', unsubscribe);
  }, [firebaseReady, firebase, gameRoom, playerRole, gameState, winner, isMyTurn, lastProcessedReactionId]);

  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    const unsubscribeKick = watchForKick(firebase.database, `ticTacToe/${gameRoom}`, playerInfo.id, () => {
      showToast('You were removed from the game by the host.', 'error');
      resetGame();
    });
    return () => unsubscribeKick();
  }, [firebaseReady, firebase, gameRoom]);

  const checkWinner = (b) => {
    b = b.map(c => (c === undefined || c === '' ? null : c));
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, i, c] of lines) {
      if (b[a] && b[a] === b[i] && b[i] === b[c]) return { winner: b[a], line: [a, i, c] };
    }
    if (b.filter(c => c === 'X' || c === 'O').length === 9) return { winner: 'draw', line: [] };
    return { winner: null, line: [] };
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const createGame = async () => {
    if (!firebaseReady || !firebase) { showToast('Game engine not ready', 'error'); return; }
    setLoading(true);
    const code = generateRoomCode();
    try {
      await firebase.set(firebase.ref(firebase.database, `ticTacToe/${code}`), {
        roomCode: code, host: playerInfo.id,
        players: { [playerInfo.id]: { ...playerInfo, symbol: 'X' } },
        board: Array(9).fill(null), currentPlayer: 'X',
        status: 'waiting', createdAt: Date.now(), gamesPlayed: 0
      });
      setGameRoom(code); setRoomCode(code); setPlayerRole('X');
      setGameState('waiting'); setBoard(Array(9).fill(null));
    } catch { showToast('Failed to create game', 'error'); }
    setLoading(false);
  };

  const joinGame = async () => {
    if (!firebaseReady || !firebase || !joinCode.trim()) return;
    setLoading(true);
    try {
      const code = joinCode.toUpperCase();
      const snap = await new Promise(res => firebase.onValue(firebase.ref(firebase.database, `ticTacToe/${code}`), res, { onlyOnce: true }));
      const data = snap.val();
      if (!data) { showToast('Game not found', 'error'); setLoading(false); return; }
      if (Object.keys(data.players || {}).length >= 2) { showToast('Game is full', 'error'); setLoading(false); return; }
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${code}`), {
        [`players/${playerInfo.id}`]: { ...playerInfo, symbol: 'O' }, status: 'playing'
      });
      setGameRoom(code); setPlayerRole('O'); setGameState('playing');
    } catch { showToast('Failed to join game', 'error'); }
    setLoading(false);
  };

  const makeMove = async (cellIndex) => {
    if (!isMyTurn || board[cellIndex] !== null || gameState !== 'playing') return;
    if (!firebaseReady || !firebase || !gameRoom) return;
    const newBoard = [...board];
    newBoard[cellIndex] = playerRole;
    try {
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
        board: newBoard, currentPlayer: playerRole === 'X' ? 'O' : 'X',
        lastMove: { index: cellIndex, player: playerRole, timestamp: Date.now() }
      });
    } catch { showToast('Move failed', 'error'); }
  };

  const sendReaction = async (emoji) => {
    setActiveReaction({ emoji, isMine: true, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
    if (firebaseReady && firebase && gameRoom) {
      try {
        await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
          reaction: { emoji, sender: playerInfo.id, id: Date.now(), timestamp: Date.now() }
        });
      } catch {}
    }
  };

  const resetGame = () => {
    setGameState('menu'); setGameRoom(null); setRoomCode(''); setJoinCode('');
    setPlayerRole(null); setIsMyTurn(false); setGameData(null); setWinner(null);
    setBoard(Array(9).fill(null)); setActiveReaction(null);
    setShowConfetti(false); setScores({ me: 0, opponent: 0, draws: 0 });
    setShowKickConfirm(false);
  };

  const playAgain = async () => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    try {
      const newGamesPlayed = (gameData?.gamesPlayed || 0) + 1;
      const firstPlayer = newGamesPlayed % 2 === 1 ? 'X' : 'O';
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
        board: Array(9).fill(null), currentPlayer: firstPlayer,
        status: 'playing', lastMove: null, gameResetAt: Date.now(), gamesPlayed: newGamesPlayed,
        forfeitWinner: null, forfeitReason: null
      });
      setBoard(Array(9).fill(null)); setWinner(null); setShowConfetti(false);
      setGameState('playing'); setIsMyTurn(playerRole === firstPlayer); setActiveReaction(null);
    } catch { showToast('Failed to start new game', 'error'); }
  };

  const endGame = async () => {
    if (firebaseReady && firebase && gameRoom) {
      try { await firebase.remove(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`)); } catch {}
    }
    resetGame();
  };

  const kickOpponent = async (target) => {
    if (!firebaseReady || !firebase || !gameRoom || !target) { setShowKickConfirm(false); return; }
    const roomPath = `ticTacToe/${gameRoom}`;
    try {
      await kickPlayer({
        database: firebase.database,
        roomPath,
        targetId: target.id,
        targetName: target.name,
        hostName: playerInfo.name,
        extraUpdates: {
          [`${roomPath}/forfeitWinner`]: playerRole,
          [`${roomPath}/forfeitReason`]: 'Opponent was removed from the game.',
          [`${roomPath}/status`]: 'finished'
        }
      });
    } catch { showToast('Failed to remove player', 'error'); }
    setShowKickConfirm(false);
  };

  // LOADING
  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full mb-4" />
        <p className="text-violet-300 font-medium tracking-wide animate-pulse">Loading game...</p>
      </div>
    );
  }

  // MENU
  if (gameState === 'menu') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <div className="relative bg-gradient-to-b from-slate-900 via-violet-950/30 to-slate-900 border border-violet-800/40 rounded-3xl p-8 shadow-[0_0_60px_rgba(139,92,246,0.15)] overflow-hidden">
          {/* Floating stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div key={i} className="absolute w-[2px] h-[2px] bg-white rounded-full pointer-events-none"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ opacity: [0.1, 0.7, 0.1] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}

          {/* Mini board preview */}
          <div className="flex justify-center mb-5">
            <div className="grid grid-cols-3 gap-1.5">
              {['X','O','X','','X','','O','','O'].map((v, i) => (
                <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black ${
                  v === 'X' ? 'bg-violet-900/70 border border-violet-700' :
                  v === 'O' ? 'bg-pink-900/70 border border-pink-700' :
                  'bg-slate-800/50 border border-slate-700/50'
                }`}>
                  {v === 'X' && <svg viewBox="0 0 30 30" className="w-5 h-5"><line x1="5" y1="5" x2="25" y2="25" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round"/><line x1="25" y1="5" x2="5" y2="25" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round"/></svg>}
                  {v === 'O' && <svg viewBox="0 0 30 30" className="w-5 h-5"><circle cx="15" cy="15" r="9" stroke="#f472b6" strokeWidth="3.5" fill="none"/></svg>}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-7 relative z-10">
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 tracking-tight leading-none mb-1">
              TIC TAC TOE
            </h2>
            <p className="text-slate-600 text-xs font-semibold tracking-[0.25em] uppercase">1v1 Multiplayer</p>
          </div>

          <div className="space-y-3 relative z-10">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={createGame} disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white py-4 rounded-2xl font-bold text-base tracking-wide shadow-[0_4px_24px_rgba(139,92,246,0.45)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>⚔️</span> {loading ? 'Creating...' : 'Create Game'}
            </motion.button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-slate-600 text-xs font-semibold tracking-widest">OR JOIN</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              className="w-full bg-slate-800/60 border-2 border-slate-700 focus:border-fuchsia-500 text-white px-4 py-3.5 rounded-2xl outline-none text-center font-mono text-2xl tracking-[0.4em] uppercase transition-all placeholder:text-slate-700 placeholder:text-sm placeholder:tracking-[0.15em]"
              maxLength="6"
            />

            <motion.button whileHover={joinCode.trim() ? { scale: 1.02 } : {}} whileTap={joinCode.trim() ? { scale: 0.97 } : {}}
              onClick={joinGame} disabled={loading || !joinCode.trim()}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white py-4 rounded-2xl font-bold text-base tracking-wide disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_24px_rgba(236,72,153,0.3)] transition-all flex items-center justify-center gap-2"
            >
              <span>🎮</span> {loading ? 'Joining...' : 'Join Game'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // WAITING
  if (gameState === 'waiting') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-sm mx-auto text-center">
        <div className="bg-gradient-to-b from-slate-900 to-violet-950/20 border border-violet-800/40 rounded-3xl p-8 shadow-[0_0_40px_rgba(139,92,246,0.12)]">
          {/* Animated ring */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-violet-600/40" />
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-3 rounded-full border-2 border-dashed border-fuchsia-600/30" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">♟</div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Waiting for opponent</h2>
          <p className="text-slate-500 text-sm mb-6">Share this code with a friend</p>

          <motion.div onClick={() => { navigator.clipboard.writeText(roomCode); showToast('Copied!', 'success'); }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="cursor-pointer bg-slate-800/80 border-2 border-violet-700/50 hover:border-violet-500 rounded-2xl p-5 mb-5 transition-all group"
          >
            <p className="font-mono text-5xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              {roomCode}
            </p>
            <p className="text-slate-600 text-xs mt-2 tracking-widest uppercase group-hover:text-violet-500 transition-colors flex items-center justify-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              Tap to copy
            </p>
          </motion.div>

          <div className="flex items-center justify-center gap-2 mb-5">
            {[0, 0.2, 0.4].map((delay, i) => (
              <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2, delay }}
                className={`w-2 h-2 rounded-full ${['bg-violet-500','bg-fuchsia-500','bg-pink-500'][i]}`} />
            ))}
          </div>

          <button onClick={endGame} className="w-full py-3 rounded-xl font-semibold text-sm transition-all bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/20">
            Cancel
          </button>
        </div>
      </motion.div>
    );
  }

  // PLAYING / FINISHED
  if (gameState === 'playing' || gameState === 'finished') {
    const players = gameData?.players ? Object.values(gameData.players) : [];
    const opponent = players.find(p => p.id !== playerInfo.id);
    const winLine = winner?.line || [];
    const isHost = gameData?.host === playerInfo.id;

    return (
      <div className="max-w-sm mx-auto select-none relative">
        {showConfetti && <Confetti />}

        {/* Floating reactions */}
        <AnimatePresence>
          {activeReaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.8, y: -50 }}
              className={`fixed z-50 text-7xl pointer-events-none ${activeReaction.isMine ? 'bottom-24 left-8' : 'top-32 right-8'}`}
            >
              {activeReaction.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score tracker */}
        <div className="flex justify-between items-center mb-4 bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-900/70 border border-violet-700/60 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><line x1="4" y1="4" x2="20" y2="20" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/><line x1="20" y1="4" x2="4" y2="20" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">{playerInfo.name}</div>
              <div className="text-violet-300 font-black text-xl leading-tight">{scores.me}</div>
            </div>
          </div>
          <div className="text-center px-3">
            <div className="text-slate-600 text-xs font-mono tracking-widest">DRAWS</div>
            <div className="text-slate-400 font-bold text-lg">{scores.draws}</div>
          </div>
          <div className="flex items-center gap-2.5 flex-row-reverse">
            <div className="w-9 h-9 rounded-xl bg-pink-900/70 border border-pink-700/60 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><circle cx="12" cy="12" r="8" stroke="#f472b6" strokeWidth="2.5" fill="none"/></svg>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-sm leading-tight flex items-center gap-1.5 justify-end">
                {isHost && opponent && gameState === 'playing' && (
                  <KickButton onClick={() => setShowKickConfirm(true)} name={opponent.name} />
                )}
                {opponent?.name || '...'}
              </div>
              <div className="text-pink-300 font-black text-xl leading-tight">{scores.opponent}</div>
            </div>
          </div>
        </div>

        {/* Turn status pill */}
        <div className="flex justify-center mb-4 h-9">
          {gameState === 'playing' && (
            <motion.div
              key={`turn-${isMyTurn}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                isMyTurn
                  ? 'bg-violet-950/60 border-violet-700 text-violet-200 shadow-[0_0_16px_rgba(139,92,246,0.3)]'
                  : 'bg-slate-900/60 border-slate-700/60 text-slate-500'
              }`}
            >
              <motion.div
                animate={isMyTurn ? { scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] } : { opacity: 0.4 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-violet-400' : 'bg-slate-600'}`}
              />
              {isMyTurn ? 'Your turn — make your move!' : `${opponent?.name || 'Opponent'} is thinking...`}
            </motion.div>
          )}
        </div>

        {/* THE BOARD */}
        <div className="relative bg-gradient-to-br from-slate-900 to-violet-950/15 border-2 border-slate-800/80 rounded-3xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-3 gap-3">
            {[0,1,2,3,4,5,6,7,8].map(idx => {
              const value = board[idx];
              const isWinCell = winLine.includes(idx);
              const canPlay = isMyTurn && !value && gameState === 'playing';

              return (
                <motion.button
                  key={idx}
                  onClick={() => makeMove(idx)}
                  disabled={!canPlay && !value}
                  whileHover={canPlay ? { scale: 1.06, y: -1 } : {}}
                  whileTap={canPlay ? { scale: 0.91 } : {}}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`
                    aspect-square rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200
                    ${isWinCell
                      ? 'bg-amber-950/60 border-2 border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.5)]'
                      : value === 'X'
                        ? 'bg-violet-950/60 border-2 border-violet-700/50'
                        : value === 'O'
                          ? 'bg-pink-950/60 border-2 border-pink-700/50'
                          : canPlay
                            ? 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-violet-700/70 hover:bg-violet-950/25 cursor-pointer'
                            : 'bg-slate-800/50 border-2 border-slate-700/40 cursor-default opacity-60'
                    }
                  `}
                >
                  <AnimatePresence>
                    {value === 'X' && (
                      <motion.div key="x" initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }} className="w-full h-full p-3.5">
                        <svg viewBox="0 0 60 60" className="w-full h-full">
                          <motion.line x1="10" y1="10" x2="50" y2="50"
                            stroke={isWinCell ? "#fbbf24" : "#a78bfa"} strokeWidth="7" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.2 }}
                          />
                          <motion.line x1="50" y1="10" x2="10" y2="50"
                            stroke={isWinCell ? "#fbbf24" : "#a78bfa"} strokeWidth="7" strokeLinecap="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.2, delay: 0.1 }}
                          />
                        </svg>
                      </motion.div>
                    )}
                    {value === 'O' && (
                      <motion.div key="o" initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 18 }} className="w-full h-full p-3">
                        <svg viewBox="0 0 60 60" className="w-full h-full">
                          <motion.circle cx="30" cy="30" r="19"
                            stroke={isWinCell ? "#fbbf24" : "#f472b6"} strokeWidth="7" fill="none" strokeLinecap="round"
                            strokeDasharray="119" initial={{ strokeDashoffset: 119 }}
                            animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.35 }}
                          />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Shine effect on finished board */}
          {gameState === 'finished' && winner?.winner !== 'draw' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-3xl pointer-events-none bg-gradient-to-br from-amber-500/5 to-transparent" />
          )}
        </div>

        {/* Emoji reactions */}
        {gameState === 'playing' && (
          <div className="flex justify-center gap-2 mt-4">
            {EMOJI_LIST.map(emoji => (
              <motion.button key={emoji} whileHover={{ scale: 1.3, y: -4 }} whileTap={{ scale: 0.8 }}
                onClick={() => sendReaction(emoji)}
                className="text-xl w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-violet-700/60 hover:bg-violet-950/30 transition-all"
              >
                {emoji}
              </motion.button>
            ))}
          </div>
        )}

        {/* Result panel */}
        <AnimatePresence>
          {gameState === 'finished' && winner && (
            <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="mt-4 bg-slate-900/98 border border-slate-700/60 rounded-3xl p-6 text-center backdrop-blur-md shadow-2xl"
            >
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, delay: 0.15 }} className="text-5xl mb-2">
                {winner.winner === playerRole ? '🏆' : winner.winner === 'draw' ? '🤝' : '😔'}
              </motion.div>
              <h3 className={`text-3xl font-black tracking-tight mb-1 ${
                winner.winner === playerRole ? 'text-amber-400' :
                winner.winner === 'draw' ? 'text-slate-300' : 'text-rose-400'
              }`}>
                {winner.winner === playerRole ? 'You Win!' : winner.winner === 'draw' ? "It's a Draw!" : 'You Lose!'}
              </h3>
              <p className="text-slate-600 text-sm mb-5">
                {winner.winner === playerRole ? (winner.reason || 'Excellent play!') : winner.winner === 'draw' ? 'Evenly matched!' : 'Better luck next round!'}
              </p>
              <div className="flex gap-2.5">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                  onClick={playAgain}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white py-3.5 rounded-2xl font-bold shadow-[0_4px_18px_rgba(139,92,246,0.45)] transition-all flex items-center justify-center gap-1.5"
                >
                  🔄 Rematch
                </motion.button>
                <button onClick={endGame}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-5 py-3.5 rounded-2xl font-semibold text-sm border border-slate-700 transition-all">
                  Leave
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showKickConfirm && opponent && (
          <KickConfirmModal
            playerName={opponent.name}
            onConfirm={() => kickOpponent(opponent)}
            onCancel={() => setShowKickConfirm(false)}
          />
        )}
      </div>
    );
  }

  return null;
};

export default TicTacToeGame;
