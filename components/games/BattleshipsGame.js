// components/games/BattleshipsGame.js - FULLY FUNCTIONAL MOBILE-OPTIMIZED VERSION
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
  const [winner, setWinner] = useState(null);
  const [battleLog, setBattleLog] = useState([]);

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

  // FIXED: Process attack results
  const processAttack = (attackerRole, targetRow, targetCol, opponentShips) => {
    const targetIndex = getGridIndex(targetRow, targetCol);
    let result = 'miss';
    let sunkShip = null;

    // Check if attack hits any ship
    if (opponentShips) {
      for (let ship of opponentShips) {
        const hitIndex = ship.positions.findIndex(pos => 
          pos.row === targetRow && pos.col === targetCol
        );
        
        if (hitIndex !== -1) {
          // Hit!
          result = 'hit';
          ship.hits[hitIndex] = true;
          
          // Check if ship is sunk
          if (ship.hits.every(hit => hit === true)) {
            ship.sunk = true;
            result = 'sunk';
            sunkShip = ship;
          }
          break;
        }
      }
    }

    return { result, sunkShip, updatedShips: opponentShips };
  };

  // FIXED: Check for game winner
  const checkGameWinner = (ships) => {
    if (!ships) return null;
    
    const allShipsSunk = Object.values(ships).every(playerShips => 
      playerShips.every(ship => ship.sunk === true)
    );
    
    if (allShipsSunk) {
      // Find which player's ships are all sunk
      for (let [player, playerShips] of Object.entries(ships)) {
        if (playerShips.every(ship => ship.sunk === true)) {
          return player === 'player1' ? 'player2' : 'player1'; // Winner is the other player
        }
      }
    }
    
    return null;
  };

  // FIXED: Firebase listener with better game state management
  useEffect(() => {
    if (!firebaseReady || !firebase || !gameRoom) return;

    const gameRef = firebase.ref(firebase.database, `battleships/${gameRoom}`);
    
    const unsubscribe = firebase.onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📦 Firebase data received:', data);
      
      if (!data) {
        resetGame();
        showToast('Game ended', 'info');
        return;
      }
      
      setGameData(data);

      // FIXED: Better game state transitions with debugging
      const currentPhase = data.phase;
      const playerCount = Object.keys(data.players || {}).length;
      
      console.log(`🎮 State Check - Phase: ${currentPhase}, Players: ${playerCount}, Local State: ${gameState}, My Role: ${playerRole}`);

      // FIXED: Better state transitions - sync local state with Firebase
      if (currentPhase === 'placing' && gameState !== 'placing') {
        console.log('✅ Transitioning to ship placement phase');
        setGameState('placing');
        showToast('Both players joined! Place your ships.', 'success');
        
        // Check if opponent has already placed ships
        const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
        if (data.ships && data.ships[opponentRole]) {
          showToast('Opponent has already placed ships! Hurry up!', 'info');
        }
      }
      
      if (currentPhase === 'battle' && gameState !== 'battle') {
        console.log('⚔️ Battle phase started');
        setGameState('battle');
        showToast('Battle begins! 🚢💥', 'success');
      }
      
      // Handle case where we're waiting but game has already progressed
      if (gameState === 'waiting' && currentPhase !== 'waiting') {
        console.log(`🔄 Syncing state: local=${gameState}, remote=${currentPhase}`);
        if (currentPhase === 'placing') {
          setGameState('placing');
          showToast('Joining ship placement!', 'success');
        } else if (currentPhase === 'battle') {
          setGameState('battle');
          showToast('Joining battle!', 'success');
        }
      }

      // Update enemy grid based on my attacks
      if (data.attackResults && data.attackResults[playerRole]) {
        const myAttackResults = data.attackResults[playerRole] || [];
        const newEnemyGrid = Array(100).fill(null);
        myAttackResults.forEach(attack => {
          const index = getGridIndex(attack.row, attack.col);
          newEnemyGrid[index] = attack.result; // 'hit', 'miss', or 'sunk'
        });
        setEnemyGrid(newEnemyGrid);
      }

      // Update battle log
      if (data.battleLog) {
        setBattleLog(data.battleLog);
      }
      
      // Check for winner
      const gameWinner = data.winner;
      if (gameWinner && gameWinner !== winner) {
        setWinner(gameWinner);
        setGameState('finished');
        if (gameWinner === playerRole) {
          showToast('🎉 Victory! You sunk all enemy ships!', 'success');
        } else {
          showToast('💀 Defeat! Your fleet was destroyed!', 'error');
        }
      }
      
      // Update turn
      setIsMyTurn(data.currentPlayer === playerRole);
      
      // FINAL SAFETY CHECK: Force state sync if we're out of sync
      setTimeout(() => {
        if (gameState === 'waiting' && data.phase === 'placing') {
          console.log('🚨 FORCE SYNC: Transitioning stuck waiting state to placing');
          setGameState('placing');
        }
      }, 100);
    });
    
    return () => {
      console.log('🧹 Cleaning up Firebase listener');
      firebase.off(gameRef, 'value', unsubscribe);
    };
  }, [firebaseReady, firebase, gameRoom, playerRole]); // Removed gameState and winner from deps

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
        gameType: 'battleships',
        host: playerInfo.id,
        players: {
          [playerInfo.id]: { ...playerInfo, role: 'player1' }
        },
        phase: 'waiting',
        currentPlayer: 'player1',
        ships: {},
        attackResults: { player1: [], player2: [] },
        battleLog: [],
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
      const gameRef = firebase.ref(firebase.database, `battleships/${joinCode.toUpperCase()}`);
      
      const snapshot = await new Promise((resolve) => {
        firebase.onValue(gameRef, resolve, { onlyOnce: true });
      });
      
      const gameData = snapshot.val();
      
      if (!gameData) {
        showToast('Game not found', 'error');
        setLoading(false);
        return;
      }
      
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
      
      // FIXED: Properly transition to placing phase when second player joins
      await firebase.update(gameRef, {
        [`players/${playerInfo.id}`]: { ...playerInfo, role: 'player2' },
        phase: 'placing',
        lastUpdate: Date.now() // Force listener refresh
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

  // FIXED: Better ship placement submission
  const submitShipPlacement = async () => {
    if (!placementComplete || !firebaseReady || !firebase) return;
    
    try {
      const shipData = myShips.map(ship => ({
        id: ship.id,
        positions: ship.positions,
        hits: ship.hits,
        sunk: ship.sunk
      }));
      
      const gameRef = firebase.ref(firebase.database, `battleships/${gameRoom}`);
      
      // Update ships for this player
      await firebase.update(gameRef, {
        [`ships/${playerRole}`]: shipData
      });
      
      // Check if both players have placed ships
      const snapshot = await new Promise((resolve) => {
        firebase.onValue(gameRef, resolve, { onlyOnce: true });
      });
      
      const data = snapshot.val();
      console.log('🚢 Checking if both players placed ships:', data.ships);
      
      if (data.ships?.player1 && data.ships?.player2) {
        console.log('⚔️ Both players ready, starting battle!');
        await firebase.update(gameRef, { 
          phase: 'battle'
        });
        showToast('Battle ready! ⚔️', 'success');
      } else {
        showToast('Ships submitted! Waiting for opponent...', 'success');
      }
    } catch (error) {
      console.error('Error submitting ships:', error);
      showToast('Failed to submit ships', 'error');
    }
  };

  // FIXED: Complete attack processing
  const makeAttack = async (row, col) => {
    if (!isMyTurn || gameState !== 'battle') return;
    
    const index = getGridIndex(row, col);
    if (enemyGrid[index] !== null) {
      showToast('Already attacked this position!', 'warning');
      return;
    }
    
    try {
      const gameRef = firebase.ref(firebase.database, `battleships/${gameRoom}`);
      const gameSnapshot = await new Promise((resolve) => {
        firebase.onValue(gameRef, resolve, { onlyOnce: true });
      });
      
      const currentGameData = gameSnapshot.val();
      const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
      const opponentShips = currentGameData.ships[opponentRole];
      
      // Process the attack
      const attackResult = processAttack(playerRole, row, col, opponentShips);
      
      // Update attack results
      const currentAttackResults = currentGameData.attackResults[playerRole] || [];
      const newAttackResult = {
        row,
        col,
        result: attackResult.result,
        timestamp: Date.now()
      };
      
      // Update battle log
      const currentBattleLog = currentGameData.battleLog || [];
      const logEntry = `${playerInfo.name} attacked ${getGridLabel(row, col)}: ${attackResult.result.toUpperCase()}${attackResult.sunkShip ? ` (${attackResult.sunkShip.name} sunk!)` : ''}`;
      
      // Check for winner
      const gameWinner = checkGameWinner(currentGameData.ships);
      
      const updateData = {
        [`attackResults/${playerRole}`]: [...currentAttackResults, newAttackResult],
        [`ships/${opponentRole}`]: attackResult.updatedShips,
        battleLog: [...currentBattleLog, logEntry],
        currentPlayer: attackResult.result === 'miss' ? opponentRole : playerRole // Continue turn on hit
      };
      
      if (gameWinner) {
        updateData.winner = gameWinner;
        updateData.phase = 'finished';
      }
      
      await firebase.update(gameRef, updateData);
      
      // Show result
      if (attackResult.result === 'hit') {
        showToast(`💥 Hit at ${getGridLabel(row, col)}!`, 'success');
      } else if (attackResult.result === 'sunk') {
        showToast(`🔥 ${attackResult.sunkShip.name} sunk at ${getGridLabel(row, col)}!`, 'success');
      } else {
        showToast(`💧 Miss at ${getGridLabel(row, col)}`, 'info');
      }
      
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
    setWinner(null);
    setBattleLog([]);
  };

  const playAgain = async () => {
    if (!firebaseReady || !firebase || !gameRoom) return;
    
    try {
      const resetData = {
        phase: 'placing',
        currentPlayer: 'player1',
        ships: {},
        attackResults: { player1: [], player2: [] },
        battleLog: [],
        winner: null,
        gameResetAt: Date.now()
      };
      
      const gameRef = firebase.ref(firebase.database, `battleships/${gameRoom}`);
      await firebase.update(gameRef, resetData);
      
      // Reset local state
      setMyGrid(Array(100).fill(null));
      setEnemyGrid(Array(100).fill(null));
      setMyShips([]);
      setCurrentShipPlacing(0);
      setPlacementComplete(false);
      setWinner(null);
      setBattleLog([]);
      setGameState('placing');
      setIsMyTurn(playerRole === 'player1');
      
      showToast('New battle begins! 🚢', 'success');
    } catch (error) {
      console.error('Error starting new game:', error);
      showToast('Failed to start new battle', 'error');
    }
  };

  // MOBILE OPTIMIZED: Grid cell rendering
  const renderGridCell = (index, isMyGrid = true) => {
    const { row, col } = getRowCol(index);
    const cellValue = isMyGrid ? myGrid[index] : enemyGrid[index];
    
    let cellClass = `
      aspect-square border border-gray-400 flex items-center justify-center text-xs font-bold
      cursor-pointer transition-all duration-200 relative
      touch-manipulation select-none
      min-h-[28px] min-w-[28px] sm:min-h-[32px] sm:min-w-[32px] md:min-h-[40px] md:min-w-[40px]
    `;
    
    if (isMyGrid) {
      // My grid - show ships during placement/battle
      if (cellValue) {
        cellClass += ` bg-blue-200 border-blue-400`;
      } else {
        cellClass += ` bg-blue-50 hover:bg-blue-100 active:bg-blue-200`;
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
        cellClass += ` bg-gray-100 hover:bg-gray-200 active:bg-yellow-100`;
      }
      
      if (gameState === 'battle' && isMyTurn && !cellValue) {
        cellClass += ` hover:bg-yellow-100 hover:border-yellow-400 active:bg-yellow-200`;
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
          <span className="text-xs sm:text-sm md:text-base">
            {SHIPS.find(s => s.id === cellValue)?.emoji}
          </span>
        )}
        {!isMyGrid && cellValue === 'hit' && <span className="text-xs sm:text-sm">💥</span>}
        {!isMyGrid && cellValue === 'miss' && <span className="text-xs sm:text-sm">💧</span>}
        {!isMyGrid && cellValue === 'sunk' && <span className="text-xs sm:text-sm">💀</span>}
      </div>
    );
  };

  // MOBILE OPTIMIZED: Grid rendering
  const renderGrid = (isMyGrid = true, title) => (
    <div className="bg-white rounded-xl p-2 sm:p-4 shadow-lg w-full">
      <h3 className="text-sm sm:text-lg font-bold text-center mb-2 sm:mb-4">{title}</h3>
      
      {/* Column headers */}
      <div className="grid grid-cols-11 gap-0.5 sm:gap-1 mb-1">
        <div></div>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="text-center text-xs font-bold p-0.5 sm:p-1">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Grid with row headers */}
      {Array.from({ length: 10 }, (_, row) => (
        <div key={row} className="grid grid-cols-11 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
          <div className="text-center text-xs font-bold p-0.5 sm:p-1 flex items-center justify-center">
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
      <div className="max-w-md mx-auto space-y-6 p-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            🚢 Battleships
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Sink your opponent's fleet in this classic naval battle!
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg space-y-4">
          <button
            onClick={createGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono text-base sm:text-lg tracking-wider"
              maxLength="6"
            />
            <button
              onClick={joinGame}
              disabled={loading || !joinCode.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:shadow-lg transition-all disabled:opacity-50 active:scale-95"
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
      <div className="max-w-md mx-auto text-center p-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="animate-pulse text-4xl mb-4">⚓</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Awaiting Admiral...
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Share this battle code with your opponent:</p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <p className="font-mono text-2xl sm:text-3xl font-bold tracking-wider text-blue-600">
              {roomCode}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                showToast('Battle code copied!', 'success');
              }}
              className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 active:scale-95"
            >
              📋 Copy Battle Code
            </button>
            
            <button
              onClick={resetGame}
              className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 active:scale-95"
            >
              ❌ Cancel Battle
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ship Placement State - MOBILE OPTIMIZED
  if (gameState === 'placing') {
    const currentShip = SHIPS[currentShipPlacing];
    
    return (
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-2 sm:p-4">
        <div className="bg-white rounded-xl p-3 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-2xl font-bold text-center text-gray-800 mb-3 sm:mb-4">
            🚢 Deploy Your Fleet
          </h2>
          
          {!placementComplete && currentShip && (
            <div className="text-center mb-4">
              <p className="text-sm sm:text-lg font-semibold text-blue-600 mb-2">
                Place your {currentShip.name} {currentShip.emoji} (Size: {currentShip.size})
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-4">
                <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                  <input
                    type="radio"
                    name="orientation"
                    value="horizontal"
                    checked={shipOrientation === 'horizontal'}
                    onChange={(e) => setShipOrientation(e.target.value)}
                  />
                  Horizontal ↔️
                </label>
                <label className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
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
              <p className="text-sm sm:text-lg font-semibold text-green-600 mb-2">
                ✅ Fleet deployed! Ready for battle!
              </p>
              <button
                onClick={submitShipPlacement}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-green-600 text-sm sm:text-base active:scale-95"
              >
                🚢 Confirm Fleet Deployment
              </button>
            </div>
          )}
          
          {/* Ship placement progress - MOBILE OPTIMIZED */}
          <div className="mb-4">
            <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
              {SHIPS.map((ship, index) => (
                <div
                  key={ship.id}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm ${
                    index < currentShipPlacing
                      ? 'bg-green-100 text-green-800'
                      : index === currentShipPlacing
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span>{ship.emoji}</span>
                  <span className="hidden sm:inline">{ship.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          {renderGrid(true, "🏴‍☠️ Your Fleet")}
        </div>
      </div>
    );
  }

  // Battle State - MOBILE OPTIMIZED
  if (gameState === 'battle') {
    const players = gameData?.players ? Object.values(gameData.players) : [];
    const opponent = players.find(p => p.id !== playerInfo.id);
    
    return (
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6 p-2 sm:p-4">
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 sm:mb-4 text-xs sm:text-sm">
            <div className="text-center flex-1">
              <p className="font-semibold">⚓ {playerInfo.name}</p>
              <p className="text-gray-600">Your Fleet</p>
            </div>
            
            <div className="text-center flex-1">
              <h2 className="text-sm sm:text-xl font-bold text-gray-800">Naval Battle</h2>
              <p className="text-gray-600">Room: {gameRoom}</p>
              <div className={`mt-1 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${
                isMyTurn ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isMyTurn ? '🎯 Your Turn!' : '⏳ Enemy Turn'}
              </div>
            </div>
            
            <div className="text-center flex-1">
              <p className="font-semibold">🏴‍☠️ {opponent?.name || 'Enemy'}</p>
              <p className="text-gray-600">Enemy Fleet</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {renderGrid(true, "🏴‍☠️ Your Fleet")}
          {renderGrid(false, "🎯 Target Grid")}
        </div>
        
        {/* Battle log - MOBILE OPTIMIZED */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-lg">
          <h3 className="text-sm sm:text-lg font-bold mb-2">📋 Battle Log</h3>
          <div className="text-xs sm:text-sm text-gray-600 max-h-16 sm:max-h-20 overflow-y-auto">
            {battleLog.length === 0 ? (
              <p>No attacks yet. The calm before the storm...</p>
            ) : (
              battleLog.slice(-5).map((entry, index) => (
                <p key={index} className="mb-1">{entry}</p>
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
      <div className="max-w-md mx-auto text-center p-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
          <div className="text-4xl sm:text-6xl mb-4">
            {winner === playerRole ? '🏆' : '💀'}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {winner === playerRole ? 'VICTORY!' : 'DEFEATED!'}
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {winner === playerRole 
              ? 'You have achieved naval supremacy!' 
              : 'Your fleet has been sent to Davy Jones\' locker!'}
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={resetGame}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 text-sm sm:text-base active:scale-95"
            >
              🏠 New Battle
            </button>
            <button
              onClick={playAgain}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 text-sm sm:text-base active:scale-95"
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