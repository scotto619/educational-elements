// components/games/TicTacToeGame.js - FULLY WORKING REALTIME VERSION
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
  const [board, setBoard] = useState(Array(9).fill(null)); // Flattened board for Firebase

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
      console.log('📦 Firebase data received:', data);
      
      if (!data) {
        resetGame();
        showToast('Game ended', 'info');
        return;
      }
      
      setGameData(data);
      
      // Update board state
      if (data.board) {
        const boardArray = Array.isArray(data.board) ? data.board : Object.values(data.board);
        setBoard(boardArray);
        console.log('🎯 Board updated:', boardArray);
      }
      
      // Check if both players joined
      if (data.players && Object.keys(data.players).length === 2 && gameState === 'waiting') {
        setGameState('playing');
        showToast('Game started! You are ' + playerRole, 'success');
      }
      
      // Check win condition
      const winResult = checkWinner(data.board || Array(9).fill(null));
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
      console.log('🔄 Turn update - Current player:', data.currentPlayer, 'My role:', playerRole, 'My turn:', data.currentPlayer === playerRole);
    });
    
    return () => firebase.off(gameRef, 'value', unsubscribe);
  }, [firebaseReady, firebase, gameRoom, playerRole, gameState]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const checkWinner = (boardData) => {
    const boardArray = Array.isArray(boardData) ? boardData : Array(9).fill(null);
    
    // Convert to 3x3 for checking
    const grid = [
      [boardArray[0], boardArray[1], boardArray[2]],
      [boardArray[3], boardArray[4], boardArray[5]],
      [boardArray[6], boardArray[7], boardArray[8]]
    ];
    
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
        return { winner: grid[i][0], line: 'row', index: i };
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (grid[0][i] && grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i]) {
        return { winner: grid[0][i], line: 'col', index: i };
      }
    }
    
    // Check diagonals
    if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
      return { winner: grid[0][0], line: 'diagonal', index: 0 };
    }
    if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
      return { winner: grid[0][2], line: 'diagonal', index: 1 };
    }
    
    // Check for draw
    const isFull = boardArray.every(cell => cell !== null);
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
      const initialData = {
        roomCode: newRoomCode,
        host: playerInfo.id,
        players: {
          [playerInfo.id]: { ...playerInfo, symbol: 'X' }
        },
        board: Array(9).fill(null), // Flat array for Firebase
        currentPlayer: 'X',
        status: 'waiting',
        createdAt: Date.now()
      };
      
      console.log('🚀 Creating game with data:', initialData);
      await firebase.set(gameRef, initialData);
      
      setGameRoom(newRoomCode);
      setRoomCode(newRoomCode);
      setPlayerRole('X');
      setGameState('waiting');
      setBoard(Array(9).fill(null));
      showToast(`Game created! Room code: ${newRoomCode}`, 'success');
    } catch (error) {
      console.error('Error creating game:', error);
      showToast('Failed to create game: ' + error.message, 'error');
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
      console.log('🔍 Found game data:', gameData);
      
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
      showToast('Failed to join game: ' + error.message, 'error');
    }
    
    setLoading(false);
  };

  const makeMove = async (index) => {
    console.log(`🎯 makeMove called with index: ${index}`);
    console.log(`Current board state:`, board);
    console.log(`Cell ${index} current value:`, board[index]);
    console.log(`Game state: ${gameState}, Is my turn: ${isMyTurn}, Player role: ${playerRole}`);
    
    if (!firebaseReady || !firebase) {
      console.log('❌ Firebase not ready');
      return;
    }
    
    if (!isMyTurn) {
      console.log('❌ Not my turn');
      return;
    }
    
    if (board[index] !== null) {
      console.log('❌ Cell already occupied:', board[index]);
      return;
    }
    
    if (gameState !== 'playing') {
      console.log('❌ Game not in playing state:', gameState);
      return;
    }
    
    console.log(`✅ Making move: placing ${playerRole} at index ${index}`);
    
    const newBoard = [...board];
    newBoard[index] = playerRole;
    
    console.log(`New board will be:`, newBoard);
    
    const nextPlayer = playerRole === 'X' ? 'O' : 'X';
    
    try {
      const updateData = {
        board: newBoard,
        currentPlayer: nextPlayer,
        lastMove: { index, player: playerRole, timestamp: Date.now() }
      };
      
      console.log('📤 Sending to Firebase:', updateData);
      
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), updateData);
      
      console.log('✅ Move sent to Firebase successfully');
    } catch (error) {
      console.error('❌ Error making move:', error);
      showToast('Failed to make move: ' + error.message, 'error');
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

  const renderCell = (index) => {
    const value = board[index];
    const row = Math.floor(index / 3);
    const col = index % 3;
    const isWinningCell = winner && (
      (winner.line === 'row' && winner.index === row) ||
      (winner.line === 'col' && winner.index === col) ||
      (winner.line === 'diagonal' && 
        ((winner.index === 0 && row === col) || 
         (winner.index === 1 && row + col === 2)))
    );

    const handleCellClick = () => {
      console.log(`🖱️ Cell clicked - Index: ${index}, Row: ${row}, Col: ${col}, Value: ${value}, MyTurn: ${isMyTurn}, GameState: ${gameState}`);
      if (isMyTurn && !value && gameState === 'playing') {
        makeMove(index);
      } else {
        console.log('❌ Click blocked:', { isMyTurn, hasValue: !!value, gameState });
      }
    };

    return (
      <div
        key={index}
        onClick={handleCellClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleCellClick();
        }}
        className={`
          aspect-square border-2 border-gray-400 rounded-lg text-2xl md:text-3xl font-bold
          flex items-center justify-center transition-all duration-200 
          min-h-[70px] min-w-[70px] md:min-h-[90px] md:min-w-[90px]
          select-none touch-manipulation
          ${isMyTurn && !value && gameState === 'playing' 
            ? 'hover:bg-blue-100 active:bg-blue-200 cursor-pointer bg-blue-50 border-blue-400' 
            : 'cursor-not-allowed bg-gray-100 border-gray-300'
          }
          ${isWinningCell ? 'bg-green-200 border-green-500' : ''}
          ${value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-red-600' : 'text-gray-400'}
        `}
      >
        {value ? (
          <span className="drop-shadow-lg text-3xl md:text-4xl">
            {value === 'X' ? '❌' : '⭕'}
          </span>
        ) : isMyTurn && gameState === 'playing' ? (
          <span className="opacity-40 text-lg md:text-xl">
            {playerRole === 'X' ? '❌' : '⭕'}
          </span>
        ) : (
          <span className="text-xs text-gray-400 font-normal">
            {index}
          </span>
        )}
      </div>
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
        {/* Debug Info - Always visible for testing */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs space-y-1">
          <p><strong>Debug Info:</strong></p>
          <p>Player: {playerRole} | Current Turn: {gameData?.currentPlayer} | My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
          <p>Game State: {gameState} | Room: {gameRoom}</p>
          <div className="grid grid-cols-3 gap-1 mt-2 max-w-[150px]">
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="border text-center p-1 text-xs bg-white">
                {i}: {board[i] || 'empty'}
              </div>
            ))}
          </div>
        </div>

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
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-[240px] md:max-w-[300px] mx-auto">
            {/* Render cells in correct order: 0,1,2 / 3,4,5 / 6,7,8 */}
            {Array.from({ length: 9 }, (_, index) => renderCell(index))}
          </div>
          
          {/* Mobile-specific instructions */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              {isMyTurn ? 'Tap any empty square to make your move' : 'Wait for your opponent'}
            </p>
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