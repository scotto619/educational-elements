// components/games/TicTacToeGame.js - SIMPLE REALTIME DATABASE VERSION
import React, { useState, useEffect } from 'react';

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
        console.log('✅ Firebase Realtime Database loaded successfully');
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
      
      setGameData(data);
      
      // Check if both players joined
      if (data.players && Object.keys(data.players).length === 2 && gameState === 'waiting') {
        setGameState('playing');
        showToast('Game started! You are ' + playerRole, 'success');
      }
      
      // Check win condition
      const winResult = checkWinner(data.board);
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
      
      // Update turn status
      setIsMyTurn(data.currentPlayer === playerRole);
    });
    
    return () => firebase.off(gameRef, 'value', unsubscribe);
  }, [firebaseReady, firebase, gameRoom, playerRole, gameState]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const checkWinner = (board) => {
    if (!board) return { winner: null };
    
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i] && board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return { winner: board[i][0], line: 'row', index: i };
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (board[0] && board[1] && board[2] && 
          board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
        return { winner: board[0][i], line: 'col', index: i };
      }
    }
    
    // Check diagonals
    if (board[0] && board[1] && board[2] && 
        board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return { winner: board[0][0], line: 'diagonal', index: 0 };
    }
    if (board[0] && board[1] && board[2] && 
        board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return { winner: board[0][2], line: 'diagonal', index: 1 };
    }
    
    // Check for draw
    const isFull = board.every(row => row && row.every(cell => cell !== null));
    if (isFull) {
      return { winner: 'draw' };
    }
    
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
        players: {
          [playerInfo.id]: { ...playerInfo, symbol: 'X' }
        },
        board: [
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ],
        currentPlayer: 'X',
        status: 'waiting',
        createdAt: Date.now()
      });
      
      setGameRoom(newRoomCode);
      setRoomCode(newRoomCode);
      setPlayerRole('X');
      setGameState('waiting');
      showToast(`Game created! Room code: ${newRoomCode}`, 'success');
    } catch (error) {
      console.error('Error creating game:', error);
      showToast('Failed to create game. Please try again.', 'error');
    }
    
    setLoading(false);
  };

  const joinGame = async () => {
    if (!firebaseReady || !firebase) {
      showToast('Game engine not ready', 'error');
      return;
    }

    if (!joinCode.trim()) {
      showToast('Please enter a room code', 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const gameRef = firebase.ref(firebase.database, `ticTacToe/${joinCode.toUpperCase()}`);
      
      // Check if game exists
      const snapshot = await new Promise((resolve) => {
        firebase.onValue(gameRef, resolve, { onlyOnce: true });
      });
      
      const gameData = snapshot.val();
      
      if (!gameData) {
        showToast('Game not found', 'error');
        setLoading(false);
        return;
      }
      
      if (Object.keys(gameData.players || {}).length >= 2) {
        showToast('Game is full', 'error');
        setLoading(false);
        return;
      }
      
      // Join the game
      await firebase.update(gameRef, {
        [`players/${playerInfo.id}`]: { ...playerInfo, symbol: 'O' },
        status: 'playing'
      });
      
      setGameRoom(joinCode.toUpperCase());
      setPlayerRole('O');
      setGameState('playing');
      showToast('Joined game successfully!', 'success');
    } catch (error) {
      console.error('Error joining game:', error);
      showToast('Failed to join game', 'error');
    }
    
    setLoading(false);
  };

  const makeMove = async (row, col) => {
    if (!firebaseReady || !firebase || !isMyTurn || !gameData || 
        gameData.board[row][col] !== null || gameState !== 'playing') {
      return;
    }
    
    const newBoard = gameData.board.map(r => [...r]);
    newBoard[row][col] = playerRole;
    
    const nextPlayer = playerRole === 'X' ? 'O' : 'X';
    
    try {
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
        board: newBoard,
        currentPlayer: nextPlayer,
        lastMove: { row, col, player: playerRole, timestamp: Date.now() }
      });
    } catch (error) {
      console.error('Error making move:', error);
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
  };

  const endGame = async () => {
    if (firebaseReady && firebase && gameRoom) {
      try {
        await firebase.remove(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`));
      } catch (error) {
        console.error('Error ending game:', error);
      }
    }
    resetGame();
  };

  const renderCell = (row, col) => {
    const value = gameData?.board?.[row]?.[col];
    const isWinningCell = winner && (
      (winner.line === 'row' && winner.index === row) ||
      (winner.line === 'col' && winner.index === col) ||
      (winner.line === 'diagonal' && 
        ((winner.index === 0 && row === col) || 
         (winner.index === 1 && row + col === 2)))
    );

    return (
      <button
        key={`${row}-${col}`}
        onClick={() => makeMove(row, col)}
        disabled={!isMyTurn || value !== null || gameState !== 'playing'}
        className={`
          aspect-square border-2 border-gray-300 rounded-lg text-3xl md:text-4xl font-bold
          flex items-center justify-center transition-all duration-200
          ${isMyTurn && !value && gameState === 'playing' 
            ? 'hover:bg-blue-50 hover:border-blue-400 cursor-pointer active:scale-95' 
            : 'cursor-not-allowed'
          }
          ${isWinningCell ? 'bg-green-200 border-green-500' : 'bg-white'}
          ${value === 'X' ? 'text-blue-600' : 'text-red-600'}
        `}
      >
        {value && (
          <span className="drop-shadow-lg">
            {value === 'X' ? '❌' : '⭕'}
          </span>
        )}
      </button>
    );
  };

  // Loading state while Firebase initializes
  if (!firebaseReady) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading game engine...</p>
      </div>
    );
  }

  // Menu State
  if (gameState === 'menu') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            🎯 Tic Tac Toe
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            Challenge a friend to a real-time game!
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
          <button
            onClick={createGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? '🎮 Creating...' : '🚀 Create New Game'}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono text-lg tracking-wider"
              maxLength="6"
            />
            <button
              onClick={joinGame}
              disabled={loading || !joinCode.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? '🔄 Joining...' : '🎯 Join Game'}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-blue-800 text-sm font-semibold">Real-Time Gaming</p>
          <p className="text-blue-700 text-xs mt-1">
            Moves sync instantly between devices! 
            One player creates a game, the other joins using the room code.
          </p>
        </div>
      </div>
    );
  }

  // Waiting State
  if (gameState === 'waiting') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="animate-pulse text-4xl mb-4">⏳</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Waiting for Player 2...
          </h2>
          <p className="text-gray-600 mb-4">Share this room code with your friend:</p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="font-mono text-2xl md:text-3xl font-bold tracking-wider text-blue-600">
              {roomCode}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                showToast('Room code copied!', 'success');
              }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              📋 Copy Room Code
            </button>
            
            <button
              onClick={endGame}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              ❌ Cancel Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing/Finished State
  if (gameState === 'playing' || gameState === 'finished') {
    const players = gameData?.players ? Object.values(gameData.players) : [];
    const opponent = players.find(p => p.id !== playerInfo.id);

    return (
      <div className="max-w-lg mx-auto space-y-6">
        {/* Game Header */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">
                {playerRole === 'X' ? '❌' : '⭕'}
              </span>
              <div>
                <p className="font-semibold text-sm">{playerInfo.name}</p>
                <p className="text-xs text-gray-500">You</p>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">VS</p>
              <p className="text-xs font-semibold">Room: {gameRoom}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="font-semibold text-sm">{opponent?.name || 'Waiting...'}</p>
                <p className="text-xs text-gray-500">Opponent</p>
              </div>
              <span className="text-2xl">
                {playerRole === 'X' ? '⭕' : '❌'}
              </span>
            </div>
          </div>
          
          {/* Turn Indicator */}
          {gameState === 'playing' && (
            <div className={`text-center py-2 px-4 rounded-lg font-semibold ${
              isMyTurn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isMyTurn ? '🎯 Your Turn!' : '⏳ Opponent\'s Turn'}
            </div>
          )}
          
          {/* Game Result */}
          {gameState === 'finished' && winner && (
            <div className={`text-center py-3 px-4 rounded-lg font-bold text-lg ${
              winner.winner === playerRole ? 'bg-green-100 text-green-800' :
              winner.winner === 'draw' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {winner.winner === playerRole ? '🎉 You Won!' :
               winner.winner === 'draw' ? '🤝 Draw!' :
               '😔 You Lost!'}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-xs mx-auto">
            {gameData?.board?.map((row, rowIndex) =>
              row?.map((_, colIndex) => renderCell(rowIndex, colIndex))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={resetGame}
            className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            🏠 New Game
          </button>
          
          {gameState === 'finished' && (
            <button
              onClick={endGame}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              🎮 Play Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default TicTacToeGame;