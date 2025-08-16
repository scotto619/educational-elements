// components/games/BattleshipsGame.js - Complete 2-Player Battleships Game
import React, { useState, useEffect } from 'react';

const BattleshipsGame = ({ studentData, showToast }) => {
  // Firebase setup
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
  const [gameState, setGameState] = useState('menu'); // 'menu', 'waiting', 'placing', 'battle', 'finished'
  const [gameRoom, setGameRoom] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [playerRole, setPlayerRole] = useState(null); // 'player1' or 'player2'
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Ship and battle states
  const [myGrid, setMyGrid] = useState(Array(100).fill(null)); // 10x10 grid
  const [enemyGrid, setEnemyGrid] = useState(Array(100).fill(null)); // What I know about enemy
  const [myShips, setMyShips] = useState([]);
  const [currentShipPlacing, setCurrentShipPlacing] = useState(0);
  const [shipOrientation, setShipOrientation] = useState('horizontal'); // 'horizontal' or 'vertical'
  const [placementComplete, setPlacementComplete] = useState(false);
  const [attackHistory, setAttackHistory] = useState([]);
  const [winner, setWinner] = useState(null);

  // Player info
  const playerInfo = {
    id: studentData?.id || `player_${Date.now()}`,
    name: studentData?.firstName || 'Anonymous',
    avatar: studentData?.avatarBase || 'Wizard F',
    level: studentData?.totalPoints ? Math.min(4, Math.max(1, Math.floor(studentData.totalPoints / 100) + 1)) : 1
  };

  // Ship definitions
  const SHIPS = [
    { id: 'carrier', name: 'Carrier', size: 5, emoji: '🚢' },
    { id: 'battleship', name: 'Battleship', size: 4, emoji: '⚓' },
    { id: 'cruiser', name: 'Cruiser', size: 3, emoji: '🛥️' },
    { id: 'submarine', name: 'Submarine', size: 3, emoji: '🚤' },
    { id: 'destroyer', name: 'Destroyer', size: 2, emoji: '⛵' }
  ];

  // Grid helpers
  const getGridIndex = (row, col) => row * 10 + col;
  const getRowCol = (index) => ({ row: Math.floor(index / 10), col: index % 10 });
  const getGridLabel = (row, col) => String.fromCharCode(65 + row) + (col + 1);

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
      
      // Handle different game phases
      if (data.phase === 'waiting' && Object.keys(data.players || {}).length === 2) {
        setGameState('placing');
        showToast('Both players joined! Place your ships.', 'success');
      }
      
      if (data.phase === 'battle' && gameState !== 'battle') {
        setGameState('battle');
        showToast('Battle begins! 🚢💥', 'success');
      }
      
      // Update enemy grid based on my attacks
      if (data.attacks && data.attacks[playerRole]) {
        const myAttacks = data.attacks[playerRole] || [];
        const newEnemyGrid = Array(100).fill(null);
        myAttacks.forEach(attack => {
          const index = getGridIndex(attack.row, attack.col);
          newEnemyGrid[index] = attack.result; // 'hit', 'miss', or 'sunk'
        });
        setEnemyGrid(newEnemyGrid);
      }
      
      // Check for winner
      if (data.winner && !winner) {
        setWinner(data.winner);
        setGameState('finished');
        if (data.winner === playerRole) {
          showToast('🎉 Victory! You sunk all enemy ships!', 'success');
        } else {
          showToast('💀 Defeat! Your fleet was destroyed!', 'error');
        }
      }
      
      // Update turn
      setIsMyTurn(data.currentPlayer === playerRole);
    });
    
    return () => {
      console.log('🧹 Cleaning up Firebase listener');
      firebase.off(gameRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameRoom, playerRole, gameState, winner]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createGame = async () => {
    if (!firebaseReady || !firebase) {
      showToast('Game engine not ready', 'error');
      return;
    }

    setLoading(true);
    const newRoomCode = generateRoomCode();
    
    try {
      const gameRef = firebase.ref(firebase.database, `battleships/${newRoomCode}`);
      const initialData = {
        roomCode: newRoomCode,
        host: playerInfo.id,
        players: {
          [playerInfo.id]: { ...playerInfo, role: 'player1' }
        },
        phase: 'waiting',
        currentPlayer: 'player1',
        ships: {},
        attacks: { player1: [], player2: [] },
        createdAt: Date.now()
      };
      
      await firebase.set(gameRef, initialData);
      
      setGameRoom(newRoomCode);
      setRoomCode(newRoomCode);
      setPlayerRole('player1');
      setGameState('waiting');
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
      
      const snapshot = await new Promise((resolve) => {
        firebase.onValue(gameRef, resolve, { onlyOnce: true });
      });
      
      const gameData = snapshot.val();
      
      if (!gameData) {
        showToast('Game not found', 'error');
        setLoading(false);
        return;
      }
      
      // Check if this is actually a battleships game
      if (gameData.gameType !== 'battleships') {
        showToast('This is not a Battleships game', 'error');
        setLoading(false);
        return;
      }
      
      if (Object.keys(gameData.players || {}).length >= 2) {
        showToast('Game is full', 'error');
        setLoading(false);
        return;
      }
      
      await firebase.update(gameRef, {
        [`players/${playerInfo.id}`]: { ...playerInfo, role: 'player2' },
        phase: 'placing'
      });
      
      setGameRoom(joinCode.toUpperCase());
      setPlayerRole('player2');
      setGameState('placing');
      showToast('Joined game successfully!', 'success');
    } catch (error) {
      console.error('Error joining game:', error);
      showToast('Failed to join game: ' + error.message, 'error');
    }
    
    setLoading(false);
  };

  const canPlaceShip = (startRow, startCol, ship, orientation) => {
    const size = ship.size;
    
    // Check if ship fits in grid
    if (orientation === 'horizontal') {
      if (startCol + size > 10) return false;
    } else {
      if (startRow + size > 10) return false;
    }
    
    // Check for overlapping ships
    for (let i = 0; i < size; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      const index = getGridIndex(row, col);
      
      if (myGrid[index] !== null) return false;
    }
    
    return true;
  };

  const placeShip = (row, col) => {
    if (currentShipPlacing >= SHIPS.length) return;
    
    const ship = SHIPS[currentShipPlacing];
    if (!canPlaceShip(row, col, ship, shipOrientation)) {
      showToast(`Cannot place ${ship.name} here!`, 'warning');
      return;
    }
    
    const newGrid = [...myGrid];
    const shipPositions = [];
    
    for (let i = 0; i < ship.size; i++) {
      const shipRow = shipOrientation === 'horizontal' ? row : row + i;
      const shipCol = shipOrientation === 'horizontal' ? col + i : col;
      const index = getGridIndex(shipRow, shipCol);
      
      newGrid[index] = ship.id;
      shipPositions.push({ row: shipRow, col: shipCol });
    }
    
    setMyGrid(newGrid);
    setMyShips([...myShips, {
      ...ship,
      positions: shipPositions,
      hits: Array(ship.size).fill(false),
      sunk: false
    }]);
    
    setCurrentShipPlacing(currentShipPlacing + 1);
    
    if (currentShipPlacing + 1 >= SHIPS.length) {
      setPlacementComplete(true);
      showToast('All ships placed! Waiting for opponent...', 'success');
    } else {
      showToast(`${ship.name} placed! Place your ${SHIPS[currentShipPlacing + 1].name}`, 'info');
    }
  };

  const submitShipPlacement = async () => {
    if (!placementComplete || !firebaseReady || !firebase) return;
    
    try {
      const shipData = myShips.map(ship => ({
        id: ship.id,
        positions: ship.positions,
        hits: ship.hits,
        sunk: ship.sunk
      }));
      
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), {
        [`ships/${playerRole}`]: shipData
      });
      
      // Check if both players have placed ships
      const gameRef = firebase.ref(firebase.database, `ticTacToe/${gameRoom}`);
      const snapshot = await new Promise((resolve) => {
        firebase.onValue(gameRef, resolve, { onlyOnce: true });
      });
      
      const data = snapshot.val();
      if (data.ships && data.ships.player1 && data.ships.player2) {
        await firebase.update(gameRef, { phase: 'battle' });
      }
      
      showToast('Ships submitted! 🚢', 'success');
    } catch (error) {
      console.error('Error submitting ships:', error);
      showToast('Failed to submit ships', 'error');
    }
  };

  const makeAttack = async (row, col) => {
    if (!isMyTurn || gameState !== 'battle') return;
    
    const index = getGridIndex(row, col);
    if (enemyGrid[index] !== null) {
      showToast('Already attacked this position!', 'warning');
      return;
    }
    
    try {
      const attack = { row, col, timestamp: Date.now() };
      const attackPath = `ticTacToe/${gameRoom}/attacks/${playerRole}`;
      const currentAttacks = gameData?.attacks?.[playerRole] || [];
      
      await firebase.set(firebase.ref(firebase.database, attackPath), [...currentAttacks, attack]);
      
      // Server will process the attack and update the result
      showToast(`Attacking ${getGridLabel(row, col)}...`, 'info');
    } catch (error) {
      console.error('Error making attack:', error);
      showToast('Attack failed!', 'error');
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
    setMyGrid(Array(100).fill(null));
    setEnemyGrid(Array(100).fill(null));
    setMyShips([]);
    setCurrentShipPlacing(0);
    setPlacementComplete(false);
    setAttackHistory([]);
    setWinner(null);
  };

  const playAgain = async () => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    
    try {
      const resetData = {
        phase: 'placing',
        currentPlayer: 'player1',
        ships: {},
        attacks: { player1: [], player2: [] },
        winner: null,
        gameResetAt: Date.now()
      };
      
      await firebase.update(firebase.ref(firebase.database, `ticTacToe/${gameRoom}`), resetData);
      
      // Reset local state
      setMyGrid(Array(100).fill(null));
      setEnemyGrid(Array(100).fill(null));
      setMyShips([]);
      setCurrentShipPlacing(0);
      setPlacementComplete(false);
      setWinner(null);
      setGameState('placing');
      setIsMyTurn(playerRole === 'player1');
      
      showToast('New battle begins! 🚢', 'success');
    } catch (error) {
      console.error('Error starting new game:', error);
      showToast('Failed to start new battle', 'error');
    }
  };

  const renderGridCell = (index, isMyGrid = true) => {
    const { row, col } = getRowCol(index);
    const cellValue = isMyGrid ? myGrid[index] : enemyGrid[index];
    
    let cellClass = `
      aspect-square border border-gray-400 flex items-center justify-center text-xs font-bold
      cursor-pointer transition-all duration-200 relative
    `;
    
    if (isMyGrid) {
      // My grid - show ships during placement/battle
      if (cellValue) {
        const ship = SHIPS.find(s => s.id === cellValue);
        cellClass += ` bg-blue-200 border-blue-400`;
      } else {
        cellClass += ` bg-blue-50 hover:bg-blue-100`;
      }
    } else {
      // Enemy grid - show attack results only
      if (cellValue === 'hit') {
        cellClass += ` bg-red-500 text-white`;
      } else if (cellValue === 'miss') {
        cellClass += ` bg-gray-300 text-gray-600`;
      } else if (cellValue === 'sunk') {
        cellClass += ` bg-red-700 text-white`;
      } else {
        cellClass += ` bg-gray-100 hover:bg-gray-200`;
      }
      
      if (gameState === 'battle' && isMyTurn && !cellValue) {
        cellClass += ` hover:bg-yellow-100 hover:border-yellow-400`;
      }
    }
    
    const handleClick = () => {
      if (isMyGrid && gameState === 'placing') {
        placeShip(row, col);
      } else if (!isMyGrid && gameState === 'battle') {
        makeAttack(row, col);
      }
    };
    
    return (
      <div
        key={index}
        className={cellClass}
        onClick={handleClick}
        data-position={getGridLabel(row, col)}
      >
        {isMyGrid && cellValue && (
          <span className="text-lg">
            {SHIPS.find(s => s.id === cellValue)?.emoji}
          </span>
        )}
        {!isMyGrid && cellValue === 'hit' && '💥'}
        {!isMyGrid && cellValue === 'miss' && '💧'}
        {!isMyGrid && cellValue === 'sunk' && '💀'}
      </div>
    );
  };

  const renderGrid = (isMyGrid = true, title) => (
    <div className="bg-white rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-bold text-center mb-4">{title}</h3>
      
      {/* Column headers */}
      <div className="grid grid-cols-11 gap-1 mb-1">
        <div></div>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="text-center text-xs font-bold p-1">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Grid with row headers */}
      {Array.from({ length: 10 }, (_, row) => (
        <div key={row} className="grid grid-cols-11 gap-1 mb-1">
          <div className="text-center text-xs font-bold p-1 flex items-center justify-center">
            {String.fromCharCode(65 + row)}
          </div>
          {Array.from({ length: 10 }, (_, col) => {
            const index = getGridIndex(row, col);
            return renderGridCell(index, isMyGrid);
          })}
        </div>
      ))}
    </div>
  );

  // Loading state
  if (!firebaseReady) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Naval Command Center...</p>
      </div>
    );
  }

  // Menu State
  if (gameState === 'menu') {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            🚢 Battleships
          </h2>
          <p className="text-gray-600">
            Sink your opponent's fleet in this classic naval battle!
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
          <button
            onClick={createGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '⚓ Creating...' : '🚢 Create New Battle'}
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
              placeholder="Enter battle code"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono text-lg tracking-wider"
              maxLength="6"
            />
            <button
              onClick={joinGame}
              disabled={loading || !joinCode.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? '⚓ Joining...' : '⛵ Join Battle'}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl mb-2">🌊</div>
          <p className="text-blue-800 text-sm font-semibold">Naval Warfare</p>
          <p className="text-blue-700 text-xs mt-1">
            Strategic ship placement, tactical attacks, and naval supremacy!
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
          <div className="animate-pulse text-4xl mb-4">⚓</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Awaiting Admiral...
          </h2>
          <p className="text-gray-600 mb-4">Share this battle code with your opponent:</p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="font-mono text-3xl font-bold tracking-wider text-blue-600">
              {roomCode}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                showToast('Battle code copied!', 'success');
              }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
            >
              📋 Copy Battle Code
            </button>
            
            <button
              onClick={resetGame}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
            >
              ❌ Cancel Battle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ship Placement State
  if (gameState === 'placing') {
    const currentShip = SHIPS[currentShipPlacing];
    
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            🚢 Deploy Your Fleet
          </h2>
          
          {!placementComplete && currentShip && (
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-blue-600">
                Place your {currentShip.name} {currentShip.emoji} (Size: {currentShip.size})
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="orientation"
                    value="horizontal"
                    checked={shipOrientation === 'horizontal'}
                    onChange={(e) => setShipOrientation(e.target.value)}
                  />
                  Horizontal ↔️
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="orientation"
                    value="vertical"
                    checked={shipOrientation === 'vertical'}
                    onChange={(e) => setShipOrientation(e.target.value)}
                  />
                  Vertical ↕️
                </label>
              </div>
            </div>
          )}
          
          {placementComplete && (
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-green-600">
                ✅ Fleet deployed! Ready for battle!
              </p>
              <button
                onClick={submitShipPlacement}
                className="mt-2 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600"
              >
                🚢 Confirm Fleet Deployment
              </button>
            </div>
          )}
          
          {/* Ship placement progress */}
          <div className="mb-4">
            <div className="flex justify-center gap-2">
              {SHIPS.map((ship, index) => (
                <div
                  key={ship.id}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm ${
                    index < currentShipPlacing
                      ? 'bg-green-100 text-green-800'
                      : index === currentShipPlacing
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{ship.emoji}</span>
                  <span>{ship.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {renderGrid(true, "🏴‍☠️ Your Fleet")}
      </div>
    );
  }

  // Battle State
  if (gameState === 'battle') {
    const players = gameData?.players ? Object.values(gameData.players) : [];
    const opponent = players.find(p => p.id !== playerInfo.id);
    
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="font-semibold">⚓ {playerInfo.name}</p>
              <p className="text-sm text-gray-600">Your Fleet</p>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">Naval Battle</h2>
              <p className="text-sm text-gray-600">Room: {gameRoom}</p>
              <div className={`mt-1 px-3 py-1 rounded-lg text-sm font-semibold ${
                isMyTurn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isMyTurn ? '🎯 Your Turn!' : '⏳ Enemy Turn'}
              </div>
            </div>
            
            <div className="text-center">
              <p className="font-semibold">🏴‍☠️ {opponent?.name || 'Enemy'}</p>
              <p className="text-sm text-gray-600">Enemy Fleet</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderGrid(true, "🏴‍☠️ Your Fleet")}
          {renderGrid(false, "🎯 Target Grid")}
        </div>
        
        {/* Attack history */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-bold mb-2">📋 Battle Log</h3>
          <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
            {attackHistory.length === 0 ? (
              <p>No attacks yet. The calm before the storm...</p>
            ) : (
              attackHistory.slice(-5).map((attack, index) => (
                <p key={index}>
                  {attack.player} attacked {attack.position}: {attack.result}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Finished State
  if (gameState === 'finished') {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-6xl mb-4">
            {winner === playerRole ? '🏆' : '💀'}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {winner === playerRole ? 'VICTORY!' : 'DEFEATED!'}
          </h2>
          <p className="text-gray-600 mb-6">
            {winner === playerRole 
              ? 'You have achieved naval supremacy!' 
              : 'Your fleet has been sent to Davy Jones\' locker!'}
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={resetGame}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600"
            >
              🏠 New Battle
            </button>
            <button
              onClick={playAgain}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600"
            >
              ⚓ Rematch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BattleshipsGame;