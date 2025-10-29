// components/games/MazeGame.js - OPTIMIZED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Seeded random number generator for reproducible mazes
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

const MazeGame = ({ gameMode, showToast }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const holdIntervalRef = useRef(null);
  const gameStateRef = useRef({
    player: { x: 0, y: 0, px: 0, py: 0 },
    pressing: { up: false, down: false, left: false, right: false },
    isWon: false
  });

  // UI state
  const [cols, setCols] = useState(20);
  const [rows, setRows] = useState(20);
  const [cellSize, setCellSize] = useState(24);
  const [showSolution, setShowSolution] = useState(false);
  const [showGhost, setShowGhost] = useState(true);
  const [seed, setSeed] = useState(Date.now());
  const [seedInput, setSeedInput] = useState('');
  const [maze, setMaze] = useState(null);
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [end, setEnd] = useState({ x: 0, y: 0 });
  const [path, setPath] = useState([]);
  const [needsRedraw, setNeedsRedraw] = useState(true);

  // Shuffle array using seeded random
  const shuffle = (arr, rng) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Maze generation class
  class Maze {
    constructor(cols, rows, seed) {
      this.cols = cols;
      this.rows = rows;
      this.rng = new SeededRandom(seed);
      this.grid = Array.from({ length: rows }, (_, y) =>
        Array.from({ length: cols }, (_, x) => ({ x, y, w: [1, 1, 1, 1], v: false }))
      );
      this.carve();
    }

    inb(x, y) {
      return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
    }

    cell(x, y) {
      return this.grid[y][x];
    }

    carve() {
      const stx = Math.floor(this.rng.next() * this.cols);
      const sty = Math.floor(this.rng.next() * this.rows);
      const stack = [this.cell(stx, sty)];
      stack[0].v = true;

      while (stack.length) {
        const cur = stack[stack.length - 1];
        const dirs = shuffle(
          [[0, -1, 0], [1, 0, 1], [0, 1, 2], [-1, 0, 3]],
          this.rng
        );
        let moved = false;

        for (const [dx, dy, wi] of dirs) {
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          if (!this.inb(nx, ny)) continue;
          const n = this.cell(nx, ny);
          if (!n.v) {
            cur.w[wi] = 0;
            n.w[(wi + 2) % 4] = 0;
            n.v = true;
            stack.push(n);
            moved = true;
            break;
          }
        }
        if (!moved) stack.pop();
      }
    }

    neighbours(x, y) {
      const res = [];
      const c = this.cell(x, y);
      const deltas = [[0, -1, 0], [1, 0, 1], [0, 1, 2], [-1, 0, 3]];
      for (const [dx, dy, wi] of deltas) {
        const nx = x + dx;
        const ny = y + dy;
        if (!this.inb(nx, ny)) continue;
        if (c.w[wi] === 0) res.push({ x: nx, y: ny });
      }
      return res;
    }

    solvePath(sx, sy, ex, ey) {
      const q = [{ x: sx, y: sy }];
      const prev = new Map();
      const key = (x, y) => `${x},${y}`;
      prev.set(key(sx, sy), null);

      while (q.length) {
        const { x, y } = q.shift();
        if (x === ex && y === ey) break;
        for (const n of this.neighbours(x, y)) {
          const k = key(n.x, n.y);
          if (!prev.has(k)) {
            prev.set(k, { x, y });
            q.push(n);
          }
        }
      }

      const resultPath = [];
      let cur = { x: ex, y: ey };
      while (cur) {
        resultPath.push(cur);
        cur = prev.get(key(cur.x, cur.y));
      }
      return resultPath.reverse();
    }
  }

  // Generate new maze
  const generateMaze = useCallback((newSeed = null) => {
    const mazeSeed = newSeed || Date.now();
    setSeed(mazeSeed);
    setSeedInput(mazeSeed.toString());
    
    const newMaze = new Maze(cols, rows, mazeSeed);
    setMaze(newMaze);

    // Generate random start and end corners
    const rng = new SeededRandom(mazeSeed + 1);
    const corners = [
      { x: 0, y: 0 },
      { x: cols - 1, y: 0 },
      { x: 0, y: rows - 1 },
      { x: cols - 1, y: rows - 1 }
    ];
    shuffle(corners, rng);
    
    const newStart = corners[0];
    const newEnd = corners[1];
    
    setStart(newStart);
    setEnd(newEnd);
    
    gameStateRef.current.player = { x: newStart.x, y: newStart.y, px: newStart.x, py: newStart.y };
    gameStateRef.current.isWon = false;

    const solutionPath = newMaze.solvePath(newStart.x, newStart.y, newEnd.x, newEnd.y);
    setPath(solutionPath);
    setNeedsRedraw(true);
  }, [cols, rows]);

  // Reset player position
  const resetPlayer = () => {
    gameStateRef.current.player = { x: start.x, y: start.y, px: start.x, py: start.y };
    gameStateRef.current.isWon = false;
    setNeedsRedraw(true);
  };

  // Load maze from seed
  const loadFromSeed = () => {
    const parsedSeed = parseInt(seedInput);
    if (isNaN(parsedSeed) || parsedSeed <= 0) {
      if (showToast) showToast('Please enter a valid seed number', 'error');
      return;
    }
    generateMaze(parsedSeed);
    if (showToast) showToast('Maze loaded from seed!', 'success');
  };

  // Copy seed to clipboard
  const copySeed = async () => {
    try {
      await navigator.clipboard.writeText(seed.toString());
      if (showToast) showToast('Seed copied to clipboard!', 'success');
    } catch (err) {
      if (showToast) showToast('Failed to copy seed', 'error');
    }
  };

  // Initialize maze on mount
  useEffect(() => {
    generateMaze();
  }, []);

  // Redraw when settings change
  useEffect(() => {
    setNeedsRedraw(true);
  }, [cellSize, showGhost, showSolution]);

  // Try to move player
  const tryMove = useCallback((dx, dy) => {
    if (!maze) return;

    const player = gameStateRef.current.player;
    const wi = dx === 0 ? (dy === -1 ? 0 : 2) : (dx === 1 ? 1 : 3);
    const cur = maze.cell(player.x, player.y);
    
    if (cur.w[wi] === 0) {
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) {
        gameStateRef.current.player.x = nx;
        gameStateRef.current.player.y = ny;
        
        // Check if reached end
        if (nx === end.x && ny === end.y && !gameStateRef.current.isWon) {
          gameStateRef.current.isWon = true;
          if (showToast) showToast('🎉 You completed the maze!', 'success');
          setNeedsRedraw(true);
        }
      }
    }
  }, [maze, cols, rows, end, showToast]);

  // Keyboard controls
  useEffect(() => {
    const keys = {
      ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
      w: 'up', s: 'down', a: 'left', d: 'right',
      W: 'up', S: 'down', A: 'left', D: 'right'
    };

    const onKeyDown = (e) => {
      const k = keys[e.key];
      if (!k) return;
      e.preventDefault();
      
      const pressing = gameStateRef.current.pressing;
      if (pressing[k]) return; // Already pressed
      
      pressing[k] = true;
      
      if (!holdIntervalRef.current) {
        // Immediate first move
        if (k === 'up') tryMove(0, -1);
        else if (k === 'down') tryMove(0, 1);
        else if (k === 'left') tryMove(-1, 0);
        else if (k === 'right') tryMove(1, 0);
        
        // Then continuous movement
        holdIntervalRef.current = setInterval(() => {
          const p = gameStateRef.current.pressing;
          if (p.up) tryMove(0, -1);
          else if (p.down) tryMove(0, 1);
          else if (p.left) tryMove(-1, 0);
          else if (p.right) tryMove(1, 0);
          else {
            clearInterval(holdIntervalRef.current);
            holdIntervalRef.current = null;
          }
        }, 100);
      }
    };

    const onKeyUp = (e) => {
      const k = keys[e.key];
      if (!k) return;
      e.preventDefault();
      
      gameStateRef.current.pressing[k] = false;
      
      const pressing = gameStateRef.current.pressing;
      if (!pressing.up && !pressing.down && !pressing.left && !pressing.right) {
        if (holdIntervalRef.current) {
          clearInterval(holdIntervalRef.current);
          holdIntervalRef.current = null;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, [tryMove]);

  // Touch controls
  const touchStartRef = useRef(null);
  
  const handleTouchStart = (e) => {
    if (e.touches[0]) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current || !e.touches[0]) return;
    
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    
    if (Math.hypot(dx, dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        tryMove(dx > 0 ? 1 : -1, 0);
      } else {
        tryMove(0, dy > 0 ? 1 : -1);
      }
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  // Download maze as image
  const downloadMaze = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `maze-${seed}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    if (showToast) showToast('Maze image saved!', 'success');
  };

  // Optimized drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let lastDrawTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const draw = (timestamp) => {
      // Throttle to target FPS
      if (timestamp - lastDrawTime < frameInterval && !needsRedraw) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }
      lastDrawTime = timestamp;

      const player = gameStateRef.current.player;
      const w = canvas.width;
      const h = canvas.height;
      const margin = 20;
      const gridW = cols * cellSize;
      const gridH = rows * cellSize;
      const scale = Math.min((w - 2 * margin) / gridW, (h - 2 * margin) / gridH);
      const ox = (w - gridW * scale) / 2;
      const oy = (h - gridH * scale) / 2;

      // Smooth easing
      const ease = 0.25;
      const oldPx = player.px;
      const oldPy = player.py;
      player.px += (player.x - player.px) * ease;
      player.py += (player.y - player.py) * ease;
      
      // Only redraw if something changed
      const hasMovement = Math.abs(player.px - oldPx) > 0.001 || Math.abs(player.py - oldPy) > 0.001;
      if (!hasMovement && !needsRedraw) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      setNeedsRedraw(false);

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(scale, scale);

      // Backdrop
      const g = ctx.createRadialGradient(gridW / 2, gridH / 2, Math.min(gridW, gridH) / 10, gridW / 2, gridH / 2, Math.max(gridW, gridH));
      g.addColorStop(0, 'rgba(20,35,75,0.9)');
      g.addColorStop(1, 'rgba(4,8,20,0.9)');
      ctx.fillStyle = g;
      ctx.fillRect(-100, -100, gridW + 200, gridH + 200);

      // Ghost walls
      if (showGhost) {
        ctx.strokeStyle = '#23365f';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
          }
        }
        ctx.globalAlpha = 1;
      }

      // Maze walls
      ctx.strokeStyle = '#8cc4ff';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = '#39b0ff';
      ctx.shadowBlur = 6;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const c = maze.cell(x, y);
          const cx = x * cellSize;
          const cy = y * cellSize;
          ctx.beginPath();
          if (c.w[0]) { ctx.moveTo(cx, cy); ctx.lineTo(cx + cellSize, cy); }
          if (c.w[1]) { ctx.moveTo(cx + cellSize, cy); ctx.lineTo(cx + cellSize, cy + cellSize); }
          if (c.w[2]) { ctx.moveTo(cx, cy + cellSize); ctx.lineTo(cx + cellSize, cy + cellSize); }
          if (c.w[3]) { ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + cellSize); }
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;

      // Start & End tiles
      const drawGate = (gx, gy, colour) => {
        ctx.save();
        ctx.translate(gx * cellSize + cellSize / 2, gy * cellSize + cellSize / 2);
        ctx.fillStyle = colour;
        ctx.shadowColor = colour;
        ctx.shadowBlur = 18;
        ctx.fillRect(-cellSize * 0.42, -cellSize * 0.42, cellSize * 0.84, cellSize * 0.84);
        ctx.restore();
      };
      drawGate(start.x, start.y, '#3ef6');
      drawGate(end.x, end.y, '#ffd166');

      // Solution path
      if (showSolution && path.length) {
        ctx.save();
        ctx.strokeStyle = '#a0ff7a';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#a0ff7a';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const p0 = path[0];
        ctx.moveTo(p0.x * cellSize + cellSize / 2, p0.y * cellSize + cellSize / 2);
        for (const p of path) {
          ctx.lineTo(p.x * cellSize + cellSize / 2, p.y * cellSize + cellSize / 2);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Player
      const px = player.px * cellSize + cellSize / 2;
      const py = player.py * cellSize + cellSize / 2;

      const gradient = ctx.createRadialGradient(px, py, 2, px, py, cellSize * 0.9);
      gradient.addColorStop(0, '#5ee1ff');
      gradient.addColorStop(1, 'rgba(94,225,255,0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.46, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = '#5ee1ff';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#b9f4ff';
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Win text
      if (gameStateRef.current.isWon) {
        ctx.save();
        ctx.shadowColor = '#ffd166';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#ffd166';
        ctx.font = `${Math.max(18, cellSize * 0.9)}px ui-sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('You made it! Press 🎲 New Maze', gridW / 2, -8 + gridH + cellSize * 0.9);
        ctx.restore();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [maze, cols, rows, cellSize, showGhost, showSolution, path, start, end, needsRedraw]);

  return (
    <div className="w-full">
      {/* Header with seed info */}
      <div className="mb-4 bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-4 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-1">🧩 Random Maze Runner</h2>
            <p className="text-sm text-blue-200">Move the glowing dot from <span className="text-cyan-400 font-semibold">Start</span> to <span className="text-yellow-400 font-semibold">Exit</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-blue-800 px-3 py-1.5 rounded-lg text-xs font-mono">
              Seed: {seed}
            </div>
            <button
              onClick={copySeed}
              className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              📋 Copy Seed
            </button>
          </div>
        </div>
        
        {/* Controls info */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <div className="bg-blue-800/50 px-3 py-1 rounded-full flex items-center gap-1">
            <span className="text-blue-200">Controls:</span>
            <kbd className="bg-blue-900 px-2 py-0.5 rounded text-white font-semibold">W</kbd>
            <kbd className="bg-blue-900 px-2 py-0.5 rounded text-white font-semibold">A</kbd>
            <kbd className="bg-blue-900 px-2 py-0.5 rounded text-white font-semibold">S</kbd>
            <kbd className="bg-blue-900 px-2 py-0.5 rounded text-white font-semibold">D</kbd>
            <span className="text-blue-200">or Arrow Keys</span>
          </div>
          <div className="bg-purple-800/50 px-3 py-1 rounded-full text-purple-200">
            📱 Touch: Swipe to move
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        {/* Canvas */}
        <div className="relative bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl p-3 border-2 border-blue-500/30 shadow-2xl">
          <canvas
            ref={canvasRef}
            width={1100}
            height={1100}
            className="w-full h-auto rounded-lg"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Controls panel */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-700 space-y-4">
          {/* Settings */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg mb-3">⚙️ Maze Settings</h3>
            
            {/* Columns */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label className="text-gray-300">Columns</label>
                <span className="text-blue-400 font-semibold">{cols}</span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Rows */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label className="text-gray-300">Rows</label>
                <span className="text-blue-400 font-semibold">{rows}</span>
              </div>
              <input
                type="range"
                min="8"
                max="50"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Cell Size */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <label className="text-gray-300">Cell Size</label>
                <span className="text-blue-400 font-semibold">{cellSize}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="40"
                value={cellSize}
                onChange={(e) => setCellSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={showSolution}
                  onChange={(e) => setShowSolution(e.target.checked)}
                  className="w-4 h-4 rounded accent-green-500"
                />
                <span>Show solution path</span>
              </label>
              <label className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={showGhost}
                  onChange={(e) => setShowGhost(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span>Show ghost walls (preview)</span>
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <button
              onClick={() => generateMaze()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              🎲 Generate New Maze
            </button>
            <button
              onClick={resetPlayer}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-lg font-semibold transition-all active:scale-95"
            >
              ↺ Reset Player
            </button>
            <button
              onClick={downloadMaze}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all active:scale-95"
            >
              📸 Save as Image
            </button>
          </div>

          {/* Seed input */}
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <h3 className="text-white font-bold text-sm">🔗 Load from Seed</h3>
            <p className="text-xs text-gray-400">Share seeds with friends to race on the same maze!</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={seedInput}
                onChange={(e) => setSeedInput(e.target.value)}
                placeholder="Enter seed number"
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={loadFromSeed}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors active:scale-95"
              >
                Load
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <h3 className="text-white font-bold text-sm">📋 Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
                <span className="text-gray-300">Player</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-cyan-400 border-2 border-cyan-400 shadow-lg shadow-cyan-400/50"></div>
                <span className="text-gray-300">Start</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded bg-yellow-400 border-2 border-yellow-400 shadow-lg shadow-yellow-400/50"></div>
                <span className="text-gray-300">Exit</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-700/50">
            <p className="text-xs text-blue-200">
              💡 <span className="font-semibold">Tip:</span> Hold a direction key to glide smoothly through passages. Generate a new maze to randomize start & exit positions!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MazeGame;