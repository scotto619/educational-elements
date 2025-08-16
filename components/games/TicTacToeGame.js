// components/games/TicTacToeGame.js - FIXED VERSION with improved mobile and PC support
import React, { useState, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

// Game reducer to better manage state
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_GAME':
      return {
        ...state,
        gameState: 'menu',
        gameRoom: null,
        roomCode: '',
        joinCode: '',
        playerRole: null,
        isMyTurn: false,
        gameData: null,
        winner: null,
        board: Array(9).fill(null)
      };
    case 'UPDATE_BOARD':
      return {
        ...state,
        board: action.payload
      };
    case 'SET_GAME_STATE':
      return {
        ...state,
        gameState: action.payload
      };
    default:
      return state;
  }
};

const TicTacToeGame = ({ studentData, showToast }) => {
  // Firebase state
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [firebase, setFirebase] = useState(null);
  const [loading, setLoading] = useState(false);

  // Game state using reducer
  const [gameState, dispatch] = useReducer(gameReducer, {
    gameState: 'menu',
    gameRoom: null,
    roomCode: '',
    joinCode: '',
    playerRole: null,
    isMyTurn: false,
    gameData: null,
    winner: null,
    board: Array(9).fill(null)
  });

  // Player info
  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Anonymous',
    avatar: studentData?.avatarBase || 'Wizard F',
    level: studentData?.totalPoints ? Math.min(4, Math.max(1, Math.floor(studentData.totalPoints / 100) + 1)) : 1
  };

  // Initialize Firebase
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, onValue, set, update, remove } = await import('firebase/database');
        
        setFirebase({ database, ref, onValue, set, update, remove });
        setFirebaseReady(true);
        console.log('✅ Firebase Realtime Database loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load Firebase:', error);
        showToast('Failed to load game engine', 'error');
      }
    };
    
    initFirebase();
  }, []);

  // Fixed Firebase listener with proper cleanup
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameState.gameRoom) return;

    const gameRef = firebase.ref(firebase.database, `ticTacToe/${gameState.gameRoom}`);
    
    const unsubscribe = firebase.onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        dispatch({ type: 'RESET_GAME' });
        showToast('Game ended', 'info');
        return;
      }

      // Update game data
      if (data.board) {
        const boardArray = Array.isArray(data.board) ? data.board : Object.values(data.board);
        dispatch({ type: 'UPDATE_BOARD', payload: boardArray });
      }

      // Game state updates
      if (data.players && Object.keys(data.players).length === 2 && gameState.gameState === 'waiting') {
        dispatch({ type: 'SET_GAME_STATE', payload: 'playing' });
        showToast(`Game started! You are ${gameState.playerRole}`, 'success');
      }
    });

    // Proper cleanup
    return () => {
      console.log('🧹 Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [firebaseReady, firebase, gameState.gameRoom]);

  // Fixed makeMove function with better error handling
  const makeMove = async (cellIndex) => {
    if (!firebaseReady || !firebase) {
      showToast('Game engine not ready', 'error');
      return;
    }

    try {
      const gameRef = firebase.ref(firebase.database, `ticTacToe/${gameState.gameRoom}`);
      const newBoard = [...gameState.board];
      newBoard[cellIndex] = gameState.playerRole;

      await firebase.update(gameRef, {
        board: newBoard,
        currentPlayer: gameState.playerRole === 'X' ? 'O' : 'X',
        lastMove: {
          index: cellIndex,
          player: gameState.playerRole,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to make move:', error);
      showToast('Error making move', 'error');
    }
  };

  // Accessible cell component
  const Cell = ({ index, value, onClick, isWinning }) => (
    <button
      onClick={onClick}
      disabled={!!value || !gameState.isMyTurn}
      className={`
        cell
        ${isWinning ? 'winning' : ''}
        ${value ? 'occupied' : 'empty'}
      `}
      aria-label={`Cell ${index + 1}, ${value || 'empty'}`}
      role="gridcell"
    >
      {value || ''}
    </button>
  );

  Cell.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    isWinning: PropTypes.bool
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
  if (gameState.gameState === 'menu') {
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
  if (gameState.gameState === 'waiting') {
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
  if (gameState.gameState === 'playing' || gameState.gameState === 'finished') {
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
          {gameState.gameState === 'playing' && (
            <div className={`text-center py-2 px-4 rounded-lg font-semibold ${
              isMyTurn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isMyTurn ? '🎯 Your Turn!' : '⏳ Opponent\'s Turn'}
            </div>
          )}
          
          {/* Game Result */}
          {gameState.gameState === 'finished' && winner && (
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

        {/* Game Board - FIXED */}
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg">
          <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-[240px] md:max-w-[300px] mx-auto">
            {/* FIXED: Ensure proper index mapping */}
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
          
          {gameState.gameState === 'finished' && (
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

TicTacToeGame.propTypes = {
  studentData: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    avatarBase: PropTypes.string,
    totalPoints: PropTypes.number
  }),
  showToast: PropTypes.func.isRequired
};

export default TicTacToeGame;