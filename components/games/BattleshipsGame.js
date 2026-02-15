import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Grid: 8x8
const GRID_SIZE = 8;

const BattleshipsGame = ({ showToast }) => {
  const [phase, setPhase] = useState('setup'); // setup, playing, gameover
  const [playerGrid, setPlayerGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill({ type: null, hit: false })));
  const [enemyGrid, setEnemyGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill({ type: null, hit: false })));
  const [myTurn, setMyTurn] = useState(true);
  const [shipsToPlace, setShipsToPlace] = useState([
    { name: 'Carrier', size: 5, id: 'carrier' },
    { name: 'Battleship', size: 4, id: 'battleship' },
    { name: 'Cruiser', size: 3, id: 'cruiser' },
    { name: 'Submarine', size: 3, id: 'submarine' },
    { name: 'Destroyer', size: 2, id: 'destroyer' }
  ]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState('horizontal'); // horizontal, vertical

  // --- SETUP PHASE ---
  const handlePlaceShip = (r, c) => {
    if (phase !== 'setup' || currentShipIndex >= shipsToPlace.length) return;

    const ship = shipsToPlace[currentShipIndex];
    if (canPlaceShip(playerGrid, r, c, ship.size, orientation)) {
      const newGrid = [...playerGrid];
      // Place ship
      for (let i = 0; i < ship.size; i++) {
        if (orientation === 'horizontal') newGrid[r][c + i] = { type: 'ship', id: ship.id };
        else newGrid[r + i][c] = { type: 'ship', id: ship.id };
      }
      setPlayerGrid(newGrid);
      setCurrentShipIndex(prev => prev + 1);

      if (currentShipIndex + 1 >= shipsToPlace.length) {
        showToast('All systems go! Engaging enemy...', 'success');
        // Setup enemy grid randomly
        setTimeout(() => {
          placeEnemyShips();
          setPhase('playing');
        }, 1000);
      }
    } else {
      showToast('Invalid placement commander!', 'error');
    }
  };

  const canPlaceShip = (grid, r, c, size, orientation) => {
    if (orientation === 'horizontal') {
      if (c + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) { if (grid[r][c + i].type) return false; }
    } else {
      if (r + size > GRID_SIZE) return false;
      for (let i = 0; i < size; i++) { if (grid[r + i][c].type) return false; }
    }
    return true;
  };

  const placeEnemyShips = () => {
    let newEnemyGrid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill({ type: null, hit: false }));
    shipsToPlace.forEach(ship => {
      let placed = false;
      while (!placed) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        const o = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        if (canPlaceShip(newEnemyGrid, r, c, ship.size, o)) {
          for (let i = 0; i < ship.size; i++) {
            if (o === 'horizontal') newEnemyGrid[r][c + i] = { type: 'ship', id: ship.id };
            else newEnemyGrid[r + i][c] = { type: 'ship', id: ship.id };
          }
          placed = true;
        }
      }
    });
    setEnemyGrid(newEnemyGrid);
  };

  // --- GAMEPLAY PHASE ---
  const handleAttack = (r, c) => {
    if (phase !== 'playing' || !myTurn || enemyGrid[r][c].hit) return;

    const newGrid = [...enemyGrid];
    const target = newGrid[r][c];
    newGrid[r][c] = { ...target, hit: true };
    setEnemyGrid(newGrid);

    if (target.type === 'ship') {
      showToast('HIT confirmed!', 'success');
      // Check win
      if (checkWin(newGrid)) {
        setPhase('won');
      }
    } else {
      showToast('Miss.', 'info');
      setMyTurn(false);
      setTimeout(enemyTurn, 1000);
    }
  };

  const enemyTurn = () => {
    // Simple AI
    let r, c;
    let valid = false;
    while (!valid) {
      r = Math.floor(Math.random() * GRID_SIZE);
      c = Math.floor(Math.random() * GRID_SIZE);
      if (!playerGrid[r][c].hit) valid = true;
    }

    setPlayerGrid(prev => {
      const newGrid = [...prev];
      const target = newGrid[r][c];
      newGrid[r][c] = { ...target, hit: true };

      if (target.type === 'ship') {
        showToast('WARNING: We have been hit!', 'error');
        setTimeout(enemyTurn, 1000); // AI attacks again on hit
      } else {
        setMyTurn(true);
      }
      // Check loss
      if (checkWin(newGrid)) {
        setPhase('lost');
      }
      return newGrid;
    });
  };

  const checkWin = (grid) => {
    // If all ship cells are hit
    let shipCells = 0;
    let hitShipCells = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c].type === 'ship') {
          shipCells++;
          if (grid[r][c].hit) hitShipCells++;
        }
      }
    }
    return shipCells > 0 && shipCells === hitShipCells;
  };

  const renderCell = (cell, onClick, isFog = false) => { // isFog = hide ships (enemy grid)
    let color = 'bg-blue-900/40 border-blue-800/30';
    if (cell.type === 'ship' && !isFog) color = 'bg-gray-600 border-gray-500';

    return (
      <div
        onClick={onClick}
        className={`w-full h-full border relative flex items-center justify-center cursor-pointer transition-colors hover:bg-white/10 ${color}`}
      >
        {cell.hit && cell.type === 'ship' && <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />}
        {cell.hit && !cell.type && <div className="w-2 h-2 rounded-full bg-white/50" />}
      </div>
    );
  };

  return (
    <div className="min-h-[600px] bg-slate-900 text-white p-6 rounded-xl flex flex-col items-center">
      <h2 className="text-3xl font-black mb-6 tracking-widest text-cyan-400">NAVAL COMMAND</h2>

      {phase === 'setup' && (
        <div className="text-center mb-6">
          <p className="mb-4">Place your {shipsToPlace[currentShipIndex].name} ({shipsToPlace[currentShipIndex].size} cells)</p>
          <button
            onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
            className="px-4 py-2 bg-blue-600 rounded-lg font-bold"
          >
            Rotate: {orientation.toUpperCase()}
          </button>
        </div>
      )}

      <div className="flex gap-12 flex-wrap justify-center">
        {/* Player Grid */}
        <div className="relative">
          <h3 className="text-center text-cyan-400 font-bold mb-2">FRIENDLY WATERS</h3>
          <div
            className="grid w-64 h-64 md:w-80 md:h-80 bg-[url('/grid-bg.png')] bg-cover border-2 border-cyan-900"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {playerGrid.map((row, r) =>
              row.map((cell, c) => (
                <div key={`p-${r}-${c}`} className="w-full h-full">
                  {renderCell(cell, () => handlePlaceShip(r, c))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enemy Grid */}
        {(phase === 'playing' || phase === 'won' || phase === 'lost') && (
          <div className="relative">
            <h3 className="text-center text-red-400 font-bold mb-2">HOSTILE SECTOR</h3>
            <div
              className={`grid w-64 h-64 md:w-80 md:h-80 bg-black border-2 border-red-900 transition-opacity ${!myTurn && 'opacity-50'}`}
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {enemyGrid.map((row, r) =>
                row.map((cell, c) => (
                  <div key={`e-${r}-${c}`} className="w-full h-full">
                    {renderCell(cell, () => handleAttack(r, c), true)}
                  </div>
                ))
              )}
            </div>
            {!myTurn && (
              <div className="absolute inset-0 flex items-center justify-center bg-transparent">
                <span className="text-red-500 font-bold bg-black/80 px-4 py-2 rounded">ENEMY FIRING...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {phase === 'won' && <div className="mt-8 text-4xl font-bold text-green-400">VICTORY START!</div>}
      {phase === 'lost' && <div className="mt-8 text-4xl font-bold text-red-500">DEFEAT!</div>}
    </div>
  );
};

export default BattleshipsGame;