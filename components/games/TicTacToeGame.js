// components/games/TicTacToeGame.js - FIXED VERSION with improved mobile and PC support
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
  const [board, setBoard] = useState(Array(9).fill(null));

  // Player info
  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Anonymous',
    avatar: studentData?.avatarBase || 'Wizard F',
    level: studentData?.totalPoints ? Math.min(4, Math.max(1, Math.floor(studentData.totalPoints / 100) + 1)) : 1
  };

  // Firebase listener - FIXED to properly handle board state
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
      
      // Update game data
      setGameData(data);
      
      // FIXED: Ensure board is always a proper array with null values
      if (data.board) {
        let boardArray;
        if (Array.isArray(data.board)) {
          boardArray = data.board;
        } else if (typeof data.board === 'object') {
          // Convert Firebase object to array, filling missing indices with null
          boardArray = Array(9).fill(null);
          Object.keys(data.board).forEach(key => {
            const index = parseInt(key);
            if (!isNaN(index) && index >= 0 && index < 9) {
              boardArray[index] = data.board[key];
            }
          });
        } else {
          boardArray = Array(9).fill(null);
        }
        
        // Ensure all empty cells are explicitly null
        boardArray = boardArray.map(cell => {
          if (cell === undefined || cell === '') {
            return null;
          }
          return cell;
        });
        
        console.log('🎯 Board processed from Firebase:', boardArray);
        setBoard(boardArray);
      } else {
        // No board data, initialize empty board
        console.log('🎯 No board data, initializing empty board');
        setBoard(Array(9).fill(null));
      }
      
      // Check if both players joined
      if (data.players && Object.keys(data.players).length === 2 && gameState === 'waiting') {
        setGameState('playing');
        showToast('Game started! You are ' + playerRole, 'success');
      }
      
      // Check win condition - FIXED to prevent false draws
      if (gameState === 'playing') { // Only check for winner during active gameplay
        const currentBoard = data.board || Array(9).fill(null);
        const winResult = checkWinner(currentBoard);
        if (winResult.winner && !winner) {
          console.log('🏆 Game ending with winner:', winResult.winner);
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
        console.log('🔄 Turn changed - Current player:', data.currentPlayer, 'My role:', playerRole, 'My turn:', newIsMyTurn);
        setIsMyTurn(newIsMyTurn);
      }
    });
    
    return () => {
      console.log('🧹 Cleaning up Firebase listener');
      firebase.off(gameRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameRoom, playerRole, gameState, winner, isMyTurn]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const checkWinner = (boardData) => {
    // FIXED: Better board processing and draw detection
    let boardArray;
    if (Array.isArray(boardData)) {
      boardArray = boardData;
    } else if (boardData && typeof boardData === 'object') {
      // Convert Firebase object to array
      boardArray = Array(9).fill(null);
      Object.keys(boardData).forEach(key => {
        const index = parseInt(key);
        if (!isNaN(index) && index >= 0 && index < 9) {
          boardArray[index] = boardData[key];
        }
      });
    } else {
      boardArray = Array(9).fill(null);
    }
    
    // Normalize empty cells to null
    boardArray = boardArray.map(cell => {
      if (cell === undefined || cell === '' || cell === null) {
        return null;
      }
      return cell;
    });
    
    console.log('🎯 CheckWinner - Board array:', boardArray);
    
    // Convert to 3x3 for checking
    const grid = [
      [boardArray[0], boardArray[1], boardArray[2]],
      [boardArray[3], boardArray[4], boardArray[5]],
      [boardArray[6], boardArray[7], boardArray[8]]
    ];
    
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (grid[i][0] && grid[i][0] === grid[i][1] && grid[i][1] === grid[i][2]) {
        console.log('🏆 Winner found - Row', i, ':', grid[i][0]);
        return { winner: grid[i][0], line: 'row', index: i };
      }
    }
    
    // Check columns
    for (let i = 0; i < 3; i++) {
      if (grid[0][i] && grid[0][i] === grid[1][i] && grid[1][i] === grid[2][i]) {
        console.log('🏆 Winner found - Column', i, ':', grid[0][i]);
        return { winner: grid[0][i], line: 'col', index: i };
      }
    }
    
    // Check diagonals
    if (grid[0][0] && grid[0][0] === grid[1][1] && grid[1][1] === grid[2][2]) {
      console.log('🏆 Winner found - Diagonal 1:', grid[0][0]);
      return { winner: grid[0][0], line: 'diagonal', index: 0 };
    }
    if (grid[0][2] && grid[0][2] === grid[1][1] && grid[1][1] === grid[2][0]) {
      console.log('🏆 Winner found - Diagonal 2:', grid[0][2]);
      return { winner: grid[0][2], line: 'diagonal', index: 1 };
    }
    
    // FIXED: Better draw detection - count actual filled cells
    const filledCells = boardArray.filter(cell => cell === 'X' || cell === 'O').length;
    const emptyCells = boardArray.filter(cell => cell === null).length;
    
    console.log('🎯 CheckWinner - Filled cells:', filledCells, 'Empty cells:', emptyCells);
    
    // Only declare draw if all 9 cells are actually filled with X or O
    if (filledCells === 9 && emptyCells === 0) {
      console.log('🤝 Draw detected - board is full');
      return { winner: 'draw' };
    }
    
    console.log('🎮 Game continues - no winner yet');
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
        board: Array(9).fill(null),
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

  // FIXED: Completely new approach using event delegation and data attributes
  const handleCellInteraction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the cell index from data attribute
    const cellIndex = parseInt(e.currentTarget.getAttribute('data-cell-index'));
    
    console.log(`🎯 Cell interaction - Index: ${cellIndex}`);
    console.log(`Current board:`, board);
    console.log(`Cell ${cellIndex} value:`, board[cellIndex]);
    console.log(`Is my turn: ${isMyTurn}, Game state: ${gameState}`);
    
    if (isNaN(cellIndex) || cellIndex < 0 || cellIndex > 8) {
      console.error('❌ Invalid cell index:', cellIndex);
      return;
    }
    
    if (!isMyTurn) {
      console.log('❌ Not my turn');
      showToast('Wait for your turn!', 'warning');
      return;
    }
    
    if (board[cellIndex] !== null && board[cellIndex] !== undefined) {
      console.log('❌ Cell already occupied:', board[cellIndex]);
      showToast('That square is already taken!', 'warning');
      return;
    }
    
    if (gameState !== 'playing') {
      console.log('❌ Game not in playing state:', gameState);
      return;
    }
    
    // Make the move
    makeMove(cellIndex);
  };

  const makeMove = async (cellIndex) => {
    console.log(`🚀 Making move at index ${cellIndex} with symbol ${playerRole}`);
    
    if (!firebaseReady || !firebase || !gameRoom) {
      console.log('❌ Firebase not ready');
      return;
    }
    
    // Create new board with the move
    const newBoard = [...board];
    newBoard[cellIndex] = playerRole;
    
    console.log(`📤 Sending board to Firebase:`, newBoard);
    
    const nextPlayer = playerRole === 'X' ? 'O' : 'X';
    
    try {
      const updateData = {
        board: newBoard,
        currentPlayer: nextPlayer,
        lastMove: { 
          index: cellIndex, 
          player: playerRole, 
          timestamp: Date.now() 
        }
      };
      
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), updateData);
      console.log('✅ Move sent successfully');
    } catch (error) {
      console.error('❌ Error making move:', error);
      showToast('Failed to make move: ' + error.message, 'error');
    }
  };

  // FIXED: Prevent potential infinite loops by batching state updates
  const resetGame = () => {
    console.log('🧹 Resetting game state');
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

  // FIXED: Completely rewritten cell rendering with data attributes
  const renderCell = (cellIndex) => {
    const value = board[cellIndex];
    const row = Math.floor(cellIndex / 3);
    const col = cellIndex % 3;
    const isWinningCell = winner && (
      (winner.line === 'row' && winner.index === row) ||
      (winner.line === 'col' && winner.index === col) ||
      (winner.line === 'diagonal' && 
        ((winner.index === 0 && row === col) || 
         (winner.index === 1 && row + col === 2)))
    );

    const canPlay = isMyTurn && (value === null || value === undefined) && gameState === 'playing';

    return (
      <button
        key={`cell-${cellIndex}`}
        data-cell-index={cellIndex}
        onClick={handleCellInteraction}
        onTouchEnd={handleCellInteraction}
        disabled={!canPlay}
        className={`
          aspect-square border-2 border-gray-400 rounded-lg text-2xl md:text-3xl font-bold
          flex items-center justify-center transition-all duration-200 
          min-h-[70px] min-w-[70px] md:min-h-[90px] md:min-w-[90px]
          select-none touch-manipulation focus:outline-none
          ${canPlay
            ? 'hover:bg-blue-100 active:bg-blue-200 cursor-pointer bg-blue-50 border-blue-400' 
            : 'cursor-not-allowed bg-gray-100 border-gray-300 disabled:opacity-60'
          }
          ${isWinningCell ? 'bg-green-200 border-green-500' : ''}
          ${value === 'X' ? 'text-blue-600' : value === 'O' ? 'text-red-600' : 'text-gray-400'}
        `}
        aria-label={`Cell ${cellIndex + 1} ${value ? `occupied by ${value}` : 'empty'}`}
      >
        {value ? (
          <span className="drop-shadow-lg text-3xl md:text-4xl pointer-events-none">
            {value === 'X' ? '❌' : '⭕'}
          </span>
        ) : canPlay ? (
          <span className="opacity-40 text-lg md:text-xl pointer-events-none">
            {playerRole === 'X' ? '❌' : '⭕'}
          </span>
        ) : null}
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

        {/* Game Board - FIXED with debugging */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
          {/* Debug Info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <p><strong>Debug:</strong> Player: {playerRole} | Turn: {gameData?.currentPlayer} | My Turn: {isMyTurn ? 'Yes' : 'No'}</p>
            <p><strong>Board:</strong> [{board.map((cell, i) => `${i}:${cell || 'null'}`).join(', ')}]</p>
            <p><strong>Filled:</strong> {board.filter(cell => cell === 'X' || cell === 'O').length}/9 | <strong>Empty:</strong> {board.filter(cell => cell === null).length}/9</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-[240px] md:max-w-[300px] mx-auto">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => renderCell(index))}
          </div>
          
          {/* Instructions */}
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
          
          {/* Emergency reset button for debugging */}
          {gameState === 'finished' && (
            <button
              onClick={() => {
                console.log('🔄 Manual game reset');
                setWinner(null);
                setGameState('playing');
                showToast('Game state reset - continue playing!', 'info');
              }}
              className="bg-orange-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm"
            >
              🔄 Reset
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default TicTacToeGame;