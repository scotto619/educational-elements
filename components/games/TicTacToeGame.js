// components/games/TicTacToeGame.js - MODERN OVERHAUL
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_LIST = ['👍', '😂', '😲', '😠', '🎉', '🔥'];

const TicTacToeGame = ({ studentData, showToast }) => {
  // Import Firebase functions dynamically to avoid conflicts
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
        console.error('❌ Failed to load Firebase:', error);
        showToast('Failed to load game engine', 'error');
      }
    };
    
    initFirebase();
  }, []);

  // Game states
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
  
  // Reaction states
  const [activeReaction, setActiveReaction] = useState(null);
  const [lastProcessedReactionId, setLastProcessedReactionId] = useState(null);

  // Player info
  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Anonymous',
    avatar: studentData?.avatarBase || 'Wizard F',
    level: studentData?.totalPoints ? Math.min(4, Math.max(1, Math.floor(studentData.totalPoints / 100) + 1)) : 1
  };

  // Firebase listener
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;

    const gameRef = firebase.ref(firebase.database, `ticTacToe/${gameRoom}`);
    
    const unsubscribe = firebase.onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      
      if (!data) {
        resetGame();
        showToast('Game ended', 'info');
        return;
      }
      
      // Handle game reset
      if (data.gameResetAt && data.gameResetAt > (Date.now() - 5000)) {
        setWinner(null);
        setGameState('playing');
        setIsMyTurn(data.currentPlayer === playerRole);
      }
      
      setGameData(data);
      
      // Listen for reactions
      if (data.reaction && data.reaction.id !== lastProcessedReactionId) {
        if (data.reaction.sender !== playerInfo.id) {
          showOpponentReaction(data.reaction.emoji);
        }
        setLastProcessedReactionId(data.reaction.id);
      }
      
      // Process board
      let processedBoard = Array(9).fill(null);
      if (data.board) {
        if (Array.isArray(data.board)) {
          for (let i = 0; i < 9; i++) {
            const cellValue = data.board[i];
            if (cellValue === 'X' || cellValue === 'O') processedBoard[i] = cellValue;
          }
        } else if (typeof data.board === 'object') {
          Object.keys(data.board).forEach(key => {
            const index = parseInt(key);
            const cellValue = data.board[key];
            if (!isNaN(index) && index >= 0 && index < 9) {
              if (cellValue === 'X' || cellValue === 'O') processedBoard[index] = cellValue;
            }
          });
        }
      }
      setBoard(processedBoard);
      
      // Check if both joined
      if (data.players && Object.keys(data.players).length === 2 && gameState === 'waiting') {
        setGameState('playing');
        showToast('Game started! You are ' + playerRole, 'success');
      }
      
      // Check win condition
      if (gameState === 'playing' && !winner) {
        const winResult = checkWinner(processedBoard);
        if (winResult.winner) {
          setWinner(winResult);
          setGameState('finished');
          if (winResult.winner === playerRole) {
            showToast('🎉 You Won!', 'success');
          } else if (winResult.winner === 'draw') {
            showToast('🤝 It\'s a Draw!', 'info');
          } else {
            showToast('😔 You Lost!', 'error');
          }
        }
      }
      
      // Update turn status
      const newIsMyTurn = data.currentPlayer === playerRole;
      if (newIsMyTurn !== isMyTurn) {
        setIsMyTurn(newIsMyTurn);
      }
    });
    
    return () => firebase.off(gameRef, 'value', unsubscribe);
  }, [firebaseReady, firebase, gameRoom, playerRole, gameState, winner, isMyTurn, lastProcessedReactionId]);

  const showOpponentReaction = (emoji) => {
    setActiveReaction({ emoji, isMine: false, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
  };

  const sendReaction = async (emoji) => {
    setActiveReaction({ emoji, isMine: true, id: Date.now() });
    setTimeout(() => setActiveReaction(null), 2500);
    
    if (firebaseReady && firebase && gameRoom) {
      const reactionData = {
        emoji,
        sender: playerInfo.id,
        id: Date.now(),
        timestamp: Date.now()
      };
      try {
        await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), { reaction: reactionData });
      } catch (err) {
        console.error('Failed to send reaction', err);
      }
    }
  };

  const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const checkWinner = (boardArray) => {
    boardArray = boardArray.map(c => (c === undefined || c === '' ? null : c));
    const grid = [
      [boardArray[0], boardArray[1], boardArray[2]],
      [boardArray[3], boardArray[4], boardArray[5]],
      [boardArray[6], boardArray[7], boardArray[8]]
    ];
    
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) return { winner: grid[i][0], line: 'row', index: i };
      if (grid[0][i] && grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i]) return { winner: grid[0][i], line: 'col', index: i };
    }
    if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) return { winner: grid[0][0], line: 'diagonal', index: 0 };
    if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) return { winner: grid[0][2], line: 'diagonal', index: 1 };
    
    const filledCells = boardArray.filter(cell => cell === 'X' || cell === 'O').length;
    if (filledCells === 9) return { winner: 'draw' };
    return { winner: null };
  };

  const createGame = async () => {
    if (!firebaseReady || !firebase) {
      showToast('Game engine not ready', 'error');
      return;
    }
    setLoading(true);
    const newRoomCode = generateRoomCode();
    
    try {
      const gameRef = firebase.ref(firebase.database, `ticTacToe/${newRoomCode}`);
      await firebase.set(gameRef, {
        roomCode: newRoomCode,
        host: playerInfo.id,
        players: { [playerInfo.id]: { ...playerInfo, symbol: 'X' } },
        board: Array(9).fill(null),
        currentPlayer: 'X',
        status: 'waiting',
        createdAt: Date.now(),
        gamesPlayed: 0
      });
      
      setGameRoom(newRoomCode);
      setRoomCode(newRoomCode);
      setPlayerRole('X');
      setGameState('waiting');
      setBoard(Array(9).fill(null));
      showToast(`Game created! Room code: ${newRoomCode}`, 'success');
    } catch (error) {
      showToast('Failed to create game', 'error');
    }
    setLoading(false);
  };

  const joinGame = async () => {
    if (!firebaseReady || !firebase) return;
    if (!joinCode.trim()) { showToast('Please enter a room code', 'error'); return; }
    
    setLoading(true);
    try {
      const code = joinCode.toUpperCase();
      const gameRef = firebase.ref(firebase.database, `ticTacToe/${code}`);
      const snapshot = await new Promise(resolve => firebase.onValue(gameRef, resolve, { onlyOnce: true }));
      const gameData = snapshot.val();
      
      if (!gameData) { showToast('Game not found', 'error'); setLoading(false); return; }
      if (Object.keys(gameData.players || {}).length >= 2) { showToast('Game is full', 'error'); setLoading(false); return; }
      
      await firebase.update(gameRef, {
        [`players/${playerInfo.id}`]: { ...playerInfo, symbol: 'O' },
        status: 'playing'
      });
      
      setGameRoom(code);
      setPlayerRole('O');
      setGameState('playing');
      showToast('Joined game successfully!', 'success');
    } catch (error) {
      showToast('Failed to join game', 'error');
    }
    setLoading(false);
  };

  const handleCellInteraction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cellIndex = parseInt(e.currentTarget.getAttribute('data-cell-index'));
    
    if (isNaN(cellIndex) || cellIndex < 0 || cellIndex > 8) return;
    if (!isMyTurn) { showToast('Wait for your turn!', 'warning'); return; }
    if (board[cellIndex] !== null) { showToast('That square is already taken!', 'warning'); return; }
    if (gameState !== 'playing') return;
    
    makeMove(cellIndex);
  };

  const makeMove = async (cellIndex) => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    const newBoard = [...board];
    newBoard[cellIndex] = playerRole;
    
    const nextPlayer = playerRole === 'X' ? 'O' : 'X';
    try {
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
        board: newBoard,
        currentPlayer: nextPlayer,
        lastMove: { index: cellIndex, player: playerRole, timestamp: Date.now() }
      });
    } catch (error) {
      showToast('Failed to make move', 'error');
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setGameRoom(null);
    setRoomCode('');
    setJoinCode('');
    setPlayerRole(null);
    setIsMyTurn(false);
    setGameData(null);
    setWinner(null);
    setBoard(Array(9).fill(null));
    setActiveReaction(null);
  };

  const playAgain = async () => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    try {
      const newGamesPlayed = (gameData?.gamesPlayed || 0) + 1;
      const firstPlayer = newGamesPlayed % 2 === 1 ? 'X' : 'O';
      
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
        board: Array(9).fill(null),
        currentPlayer: firstPlayer,
        status: 'playing',
        lastMove: null,
        gameResetAt: Date.now(),
        gamesPlayed: newGamesPlayed
      });
      
      setBoard(Array(9).fill(null));
      setWinner(null);
      setGameState('playing');
      setIsMyTurn(playerRole === firstPlayer);
      setActiveReaction(null);
    } catch (error) {
      showToast('Failed to start new game', 'error');
    }
  };

  const endGame = async () => {
    if (firebaseReady && firebase && gameRoom) {
      try { await firebase.remove(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`)); } catch (e) {}
    }
    resetGame();
  };

  const renderCell = (cellIndex) => {
    const value = board[cellIndex];
    const row = Math.floor(cellIndex / 3);
    const col = cellIndex % 3;
    const isWinningCell = winner && winner.winner !== 'draw' && (
      (winner.line === 'row' && winner.index === row) ||
      (winner.line === 'col' && winner.index === col) ||
      (winner.line === 'diagonal' && ((winner.index === 0 && row === col) || (winner.index === 1 && row + col === 2)))
    );

    const canPlay = isMyTurn && (value === null || value === undefined) && gameState === 'playing';

    return (
      <motion.button
        key={`cell-${cellIndex}`}
        data-cell-index={cellIndex}
        onClick={handleCellInteraction}
        onTouchEnd={handleCellInteraction}
        disabled={!canPlay && !value} // Allow clicking disabled cells if we want to show it's taken, but we just disable it
        whileHover={canPlay ? { scale: 1.05, boxShadow: "0px 0px 15px rgba(56, 189, 248, 0.4)" } : {}}
        whileTap={canPlay ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: cellIndex * 0.05 }}
        className={`
          aspect-square rounded-2xl text-4xl md:text-5xl font-black
          flex items-center justify-center transition-all duration-300
          min-h-[80px] min-w-[80px] md:min-h-[100px] md:min-w-[100px]
          select-none focus:outline-none relative overflow-hidden backdrop-blur-sm
          ${canPlay ? 'cursor-pointer hover:bg-white/10' : 'cursor-not-allowed'}
          ${!value ? 'bg-slate-800/50 border-2 border-slate-700/50 hover:border-blue-500/50' : ''}
          ${value === 'X' ? 'bg-blue-900/30 border-2 border-blue-500/50 text-blue-400' : ''}
          ${value === 'O' ? 'bg-pink-900/30 border-2 border-pink-500/50 text-pink-400' : ''}
          ${isWinningCell ? 'ring-4 ring-green-400 ring-offset-4 ring-offset-slate-900 !bg-green-900/40 !border-green-400 saturate-150 shadow-[0_0_30px_rgba(74,222,128,0.5)]' : ''}
        `}
      >
        <AnimatePresence mode="wait">
          {value && (
            <motion.span
              key={value}
              initial={{ scale: 0, rotate: value === 'X' ? -45 : 45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="drop-shadow-[0_0_10px_currentColor] pointer-events-none"
            >
              {value}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Hover preview */}
        {canPlay && !value && (
          <span className="opacity-0 hover:opacity-20 transition-opacity duration-200 pointer-events-none">
            {playerRole}
          </span>
        )}
      </motion.button>
    );
  };

  if (!firebaseReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-white">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
        />
        <p className="text-blue-200 font-medium tracking-wide animate-pulse">Initializing Neural Link...</p>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto relative group"
      >
        {/* Glow effect behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <motion.h2 
              className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 drop-shadow-lg"
            >
              TIC TAC TOE
            </motion.h2>
            <p className="text-slate-400 font-medium">Neon Tactical Edition</p>
          </div>

          <div className="space-y-6">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              onClick={createGame}
              disabled={loading}
              className="w-full relative overflow-hidden bg-blue-600 text-white py-4 rounded-xl font-bold text-lg transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? 'INITIALIZING...' : 'HOST GAME'}
            </motion.button>
            
            <div className="relative flex items-center py-2">
               <div className="flex-grow border-t border-slate-700"></div>
               <span className="flex-shrink-0 mx-4 text-slate-500 text-sm font-bold uppercase tracking-wider">or join</span>
               <div className="flex-grow border-t border-slate-700"></div>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="ENTER ROOM CODE"
                className="w-full bg-slate-800/50 border-2 border-slate-700 text-white px-4 py-4 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none text-center font-mono text-xl tracking-[0.3em] uppercase transition-all placeholder:text-slate-600 placeholder:tracking-normal"
                maxLength="6"
              />
              <motion.button
                whileHover={!joinCode.trim() ? {} : { scale: 1.02, boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)" }}
                whileTap={!joinCode.trim() ? {} : { scale: 0.98 }}
                onClick={joinGame}
                disabled={loading || !joinCode.trim()}
                className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'CONNECTING...' : 'JOIN MATCH'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Radar sweep effect */}
          <div className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(0,0,0,0)_0%,rgba(59,130,246,0.1)_50%,rgba(0,0,0,0)_100%)] animate-[spin_4s_linear_infinite]"></div>
          
          <div className="relative z-10">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-5xl mb-6"
            >
              📡
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">AWAITING CHALLENGER</h2>
            <p className="text-slate-400 mb-8 font-medium">Transmit this code to your opponent:</p>
            
            <div className="bg-slate-800/80 border-2 border-slate-600 rounded-2xl p-6 mb-8 cursor-pointer hover:border-blue-500 transition-colors group"
                 onClick={() => {
                   navigator.clipboard.writeText(roomCode);
                   showToast('Code copied to clipboard!', 'success');
                 }}>
              <p className="font-mono text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400 group-hover:scale-110 transition-transform">
                {roomCode}
              </p>
              <p className="text-slate-500 text-sm mt-3 font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
                <span>Click to Copy</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
              </p>
            </div>
            
            <button
              onClick={endGame}
              className="w-full bg-slate-800 text-slate-300 hover:text-white py-4 rounded-xl font-bold transition-colors border border-slate-700 hover:border-red-500/50 hover:bg-red-900/20"
            >
              ABORT MISSION
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (gameState === 'playing' || gameState === 'finished') {
    const players = gameData?.players ? Object.values(gameData.players) : [];
    const opponent = players.find(p => p.id !== playerInfo.id);
    const gamesPlayed = gameData?.gamesPlayed || 0;
    
    // Determine gradient based on turn
    const bgGradient = isMyTurn 
      ? 'from-blue-900/20 via-slate-900 to-slate-900' 
      : 'from-pink-900/20 via-slate-900 to-slate-900';

    return (
      <div className={`max-w-lg mx-auto space-y-6 transition-colors duration-1000 p-4 md:p-6 rounded-3xl bg-gradient-to-br ${bgGradient} border border-slate-800/50 shadow-2xl`}>
        
        {/* Game Header */}
        <div className="flex items-center justify-between text-white">
          <div className={`flex flex-col items-center p-3 rounded-2xl transition-all ${isMyTurn ? 'bg-blue-900/40 ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'opacity-60'}`}>
            <span className="text-3xl font-black text-blue-400 drop-shadow-[0_0_8px_currentColor] mb-1">{playerRole}</span>
            <span className="text-xs font-bold tracking-wider text-slate-300">YOU</span>
          </div>
          
          <div className="text-center px-4">
            <div className="bg-slate-800/80 rounded-full px-4 py-1 border border-slate-700 mb-2 inline-block">
              <span className="text-xs font-mono tracking-widest text-slate-400">ROOM:{gameRoom}</span>
            </div>
            {gameState === 'playing' ? (
              <motion.div 
                key={isMyTurn}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-sm font-black tracking-widest uppercase ${isMyTurn ? 'text-blue-400' : 'text-pink-400'}`}
              >
                {isMyTurn ? "Your Turn" : "Opponent's Turn"}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-black tracking-widest text-yellow-400 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)] uppercase"
              >
                Match Over
              </motion.div>
            )}
          </div>
          
          <div className={`flex flex-col items-center p-3 rounded-2xl transition-all ${!isMyTurn && gameState === 'playing' ? 'bg-pink-900/40 ring-2 ring-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'opacity-60'}`}>
             <span className="text-3xl font-black text-pink-400 drop-shadow-[0_0_8px_currentColor] mb-1">{playerRole === 'X' ? 'O' : 'X'}</span>
             <span className="text-xs font-bold tracking-wider text-slate-300 truncate max-w-[60px]">{opponent?.name || '...'}</span>
          </div>
        </div>

        {/* The Board */}
        <div className="relative">
          {/* Reaction Overlay */}
          <AnimatePresence>
            {activeReaction && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.5, y: -50 }}
                className={`absolute z-50 text-8xl pointer-events-none drop-shadow-2xl ${
                  activeReaction.isMine ? 'bottom-0 left-10' : 'top-0 right-10'
                }`}
              >
                {activeReaction.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-[280px] md:max-w-[340px] mx-auto p-3 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-700 shadow-inner">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderCell(index))}
          </div>

          {/* Win Line Overlay (Simplified CSS version instead of canvas) */}
          {gameState === 'finished' && winner && winner.winner !== 'draw' && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden rounded-3xl"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent mix-blend-overlay"></div>
             </motion.div>
          )}
        </div>

        {/* Reaction Tray */}
        {gameState === 'playing' && (
          <div className="pt-4 border-t border-slate-800">
            <p className="text-center text-xs font-bold tracking-widest text-slate-500 mb-3">SEND REACTION</p>
            <div className="flex justify-center gap-2 md:gap-4">
              {EMOJI_LIST.map(emoji => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendReaction(emoji)}
                  className="text-2xl md:text-3xl hover:bg-slate-800 p-2 rounded-full transition-colors"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Result & Actions */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4 pt-4 border-t border-slate-800 text-center"
            >
              <h3 className={`text-3xl font-black tracking-widest mb-4 ${
                winner.winner === playerRole ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]' : 
                winner.winner === 'draw' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {winner.winner === playerRole ? 'VICTORY!' : winner.winner === 'draw' ? 'STALEMATE' : 'DEFEATED'}
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={playAgain}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-bold tracking-widest shadow-lg transition-all"
                >
                  REMATCH
                </button>
                <button
                  onClick={endGame}
                  className="bg-slate-800 hover:bg-slate-700 text-red-400 px-6 py-4 rounded-xl font-bold tracking-widest transition-colors border border-slate-700"
                >
                  LEAVE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
};

export default TicTacToeGame;