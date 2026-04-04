import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Zap,
  Pause,
  Play,
} from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const INITIAL_SPEED = 800;
const SPEED_INCREMENT = 0.85;

const SHAPES = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
  ],
  O: [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
};

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000',
};

const SHAPE_KEYS = Object.keys(SHAPES);

class AudioManager {
  constructor() {
    this.audioContext = null;
  }

  initContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(freq, type, duration, volume = 0.3) {
    this.initContext();
    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.value = freq;
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  move() {
    this.playTone(400, 'sine', 0.1, 0.2);
  }

  rotate() {
    this.playTone(600, 'square', 0.15, 0.25);
  }

  drop() {
    this.playTone(200, 'sine', 0.2, 0.3);
  }

  lineClear() {
    this.initContext();
    const ctx = this.audioContext;
    for (let i = 0; i < 4; i++) {
      const freq = 400 + i * 150;
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.4), i * 100);
    }
  }

  levelUp() {
    this.initContext();
    const ctx = this.audioContext;
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.4), i * 100);
    });
  }

  gameOver() {
    this.playTone(300, 'sine', 0.3, 0.4);
    setTimeout(() => this.playTone(200, 'sine', 0.5, 0.4), 300);
  }
}

const NeonTetrisGame = ({ studentData, showToast, updateStudentData, classData, classmates }) => {
  const canvasRef = useRef(null);
  const gameStateRef = useRef({
    grid: createEmptyGrid(),
    currentPiece: null,
    nextPieces: [],
    heldPiece: null,
    canHold: true,
    score: 0,
    level: 1,
    lines: 0,
    gameState: 'menu',
    speed: INITIAL_SPEED,
    lastDropTime: 0,
    audioManager: new AudioManager(),
  });

  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [scorePopups, setScorePopups] = useState([]);
  const animationFrameRef = useRef(null);
  const keyPressedRef = useRef({});

  useEffect(() => {
    const storedHighScore = localStorage.getItem(`tetris-highscore-${studentData?.id}`);
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, [studentData?.id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keyPressedRef.current[e.key.toLowerCase()] = true;

      if (gameStateRef.current.gameState === 'menu' || gameStateRef.current.gameState === 'gameover') {
        if (e.key) {
          initGame();
        }
      }

      if (gameStateRef.current.gameState === 'playing') {
        if (['arrowleft', 'arrowright', 'arrowdown', 'arrowup', 'x', 'z', ' ', 'h', 'p'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }

        if (e.key === 'ArrowLeft') movePiece(-1, 0);
        if (e.key === 'ArrowRight') movePiece(1, 0);
        if (e.key === 'ArrowDown') movePiece(0, 1);
        if (e.key === 'ArrowUp' || e.key === 'x') rotatePiece();
        if (e.key === 'z') rotatePiece(true);
        if (e.key === ' ') hardDrop();
        if (e.key.toLowerCase() === 'h') toggleHold();
        if (e.key.toLowerCase() === 'p') togglePause();
      }
    };

    const handleKeyUp = (e) => {
      keyPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  function createEmptyGrid() {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(null));
  }

  function getRandomPiece() {
    const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const rotationIndex = 0;
    return {
      shape: shapeKey,
      rotation: rotationIndex,
      x: Math.floor(COLS / 2) - 1,
      y: 0,
    };
  }

  function rotatePieceShape(shape, counter = false) {
    const rotations = SHAPES[shape];
    if (!rotations) return 0;
    return rotations.length;
  }

  function getShapeMatrix(shape, rotation) {
    const rotations = SHAPES[shape];
    if (!rotations) return [];
    return rotations[rotation % rotations.length];
  }

  function isValidMove(piece, offsetX = 0, offsetY = 0) {
    const grid = gameStateRef.current.grid;
    const matrix = getShapeMatrix(piece.shape, piece.rotation);
    const newX = piece.x + offsetX;
    const newY = piece.y + offsetY;

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] === 1) {
          const gridX = newX + col;
          const gridY = newY + row;

          if (gridX < 0 || gridX >= COLS || gridY >= ROWS) {
            return false;
          }

          if (gridY >= 0 && grid[gridY] && grid[gridY][gridX] !== null) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function movePiece(dx, dy) {
    if (gameStateRef.current.gameState !== 'playing') return;

    const newPiece = { ...gameStateRef.current.currentPiece, x: gameStateRef.current.currentPiece.x + dx, y: gameStateRef.current.currentPiece.y + dy };
    if (isValidMove(newPiece)) {
      gameStateRef.current.currentPiece = newPiece;
      gameStateRef.current.audioManager.move();
    }
  }

  function rotatePiece(counter = false) {
    if (gameStateRef.current.gameState !== 'playing' || !gameStateRef.current.currentPiece) return;

    const rotations = rotatePieceShape(gameStateRef.current.currentPiece.shape);
    let newRotation = gameStateRef.current.currentPiece.rotation;

    if (counter) {
      newRotation = (newRotation - 1 + rotations) % rotations;
    } else {
      newRotation = (newRotation + 1) % rotations;
    }

    const newPiece = { ...gameStateRef.current.currentPiece, rotation: newRotation };
    if (isValidMove(newPiece)) {
      gameStateRef.current.currentPiece = newPiece;
      gameStateRef.current.audioManager.rotate();
    }
  }

  function placePiece(piece) {
    const grid = gameStateRef.current.grid;
    const matrix = getShapeMatrix(piece.shape, piece.rotation);
    const color = COLORS[piece.shape];

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] === 1) {
          const y = piece.y + row;
          const x = piece.x + col;
          if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            grid[y][x] = color;
          }
        }
      }
    }
  }

  function clearLines() {
    const grid = gameStateRef.current.grid;
    let linesCleared = 0;

    for (let row = ROWS - 1; row >= 0; row--) {
      if (grid[row].every((cell) => cell !== null)) {
        grid.splice(row, 1);
        grid.unshift(Array(COLS).fill(null));
        linesCleared++;
        row++;
      }
    }

    return linesCleared;
  }

  function getGhostPosition(piece) {
    let ghostPiece = { ...piece };
    while (isValidMove(ghostPiece, 0, 1)) {
      ghostPiece.y += 1;
    }
    return ghostPiece;
  }

  function hardDrop() {
    if (gameStateRef.current.gameState !== 'playing') return;

    const ghostPos = getGhostPosition(gameStateRef.current.currentPiece);
    gameStateRef.current.currentPiece.y = ghostPos.y;
    gameStateRef.current.audioManager.drop();
    dropPiece();
  }

  function dropPiece() {
    placePiece(gameStateRef.current.currentPiece);
    const linesCleared = clearLines();

    if (linesCleared > 0) {
      gameStateRef.current.audioManager.lineClear();
      const pointsMultiplier = gameStateRef.current.level;
      const points = {
        1: 100,
        2: 300,
        3: 500,
        4: 800,
      }[Math.min(linesCleared, 4)] * pointsMultiplier;

      gameStateRef.current.score += points;
      gameStateRef.current.lines += linesCleared;

      setScore(gameStateRef.current.score);
      setLines(gameStateRef.current.lines);

      addScorePopup(points);

      if (gameStateRef.current.lines >= gameStateRef.current.level * 10) {
        levelUp();
      }
    }

    gameStateRef.current.nextPieces = gameStateRef.current.nextPieces || [];
    if (gameStateRef.current.nextPieces.length === 0) {
      gameStateRef.current.nextPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
    }

    gameStateRef.current.currentPiece = gameStateRef.current.nextPieces.shift();
    gameStateRef.current.canHold = true;

    if (!isValidMove(gameStateRef.current.currentPiece)) {
      endGame();
    }
  }

  function toggleHold() {
    if (gameStateRef.current.gameState !== 'playing' || !gameStateRef.current.canHold) return;

    const temp = gameStateRef.current.currentPiece;
    gameStateRef.current.currentPiece = gameStateRef.current.heldPiece || gameStateRef.current.nextPieces.shift();
    gameStateRef.current.currentPiece.x = Math.floor(COLS / 2) - 1;
    gameStateRef.current.currentPiece.y = 0;
    gameStateRef.current.heldPiece = temp;
    gameStateRef.current.canHold = false;

    if (gameStateRef.current.nextPieces.length === 0) {
      gameStateRef.current.nextPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
    }
  }

  function togglePause() {
    if (gameStateRef.current.gameState === 'playing') {
      gameStateRef.current.gameState = 'paused';
      setGameState('paused');
    } else if (gameStateRef.current.gameState === 'paused') {
      gameStateRef.current.gameState = 'playing';
      gameStateRef.current.lastDropTime = Date.now();
      setGameState('playing');
    }
  }

  function levelUp() {
    gameStateRef.current.level += 1;
    gameStateRef.current.speed = gameStateRef.current.speed * SPEED_INCREMENT;
    gameStateRef.current.audioManager.levelUp();
    setLevel(gameStateRef.current.level);

    if (showToast) {
      showToast(`Level Up! You reached level ${gameStateRef.current.level}!`, 'success');
    }
  }

  function addScorePopup(points) {
    const id = Math.random();
    setScorePopups((prev) => [...prev, { id, points }]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  }

  function initGame() {
    gameStateRef.current.grid = createEmptyGrid();
    gameStateRef.current.nextPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
    gameStateRef.current.currentPiece = gameStateRef.current.nextPieces.shift();
    gameStateRef.current.heldPiece = null;
    gameStateRef.current.canHold = true;
    gameStateRef.current.score = 0;
    gameStateRef.current.level = 1;
    gameStateRef.current.lines = 0;
    gameStateRef.current.speed = INITIAL_SPEED;
    gameStateRef.current.lastDropTime = Date.now();
    gameStateRef.current.gameState = 'playing';

    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLines(0);
  }

  function endGame() {
    gameStateRef.current.gameState = 'gameover';
    gameStateRef.current.audioManager.gameOver();
    setGameState('gameover');

    const finalScore = gameStateRef.current.score;
    const finalLines = gameStateRef.current.lines;

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem(`tetris-highscore-${studentData?.id}`, finalScore.toString());
    }

    const coins = Math.max(5, Math.min(200, Math.floor(finalScore / 100)));

    if (showToast) {
      showToast(`Game Over! Score: ${finalScore} | Lines: ${finalLines} | Earned ${coins} coins!`, 'success');
    }
  }

  function drawGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = COLS * BLOCK_SIZE;
    const height = ROWS * BLOCK_SIZE;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= COLS; i++) {
      ctx.beginPath();
      ctx.moveTo(i * BLOCK_SIZE, 0);
      ctx.lineTo(i * BLOCK_SIZE, height);
      ctx.stroke();
    }
    for (let i = 0; i <= ROWS; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * BLOCK_SIZE);
      ctx.lineTo(width, i * BLOCK_SIZE);
      ctx.stroke();
    }

    const grid = gameStateRef.current.grid;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (grid[row][col]) {
          drawBlock(ctx, col, row, grid[row][col], false);
        }
      }
    }

    if (gameStateRef.current.currentPiece) {
      const ghost = getGhostPosition(gameStateRef.current.currentPiece);
      const ghostMatrix = getShapeMatrix(ghost.shape, ghost.rotation);
      const ghostColor = COLORS[ghost.shape];

      for (let row = 0; row < ghostMatrix.length; row++) {
        for (let col = 0; col < ghostMatrix[row].length; col++) {
          if (ghostMatrix[row][col] === 1) {
            const x = ghost.x + col;
            const y = ghost.y + row;
            if (y >= 0) {
              ctx.strokeStyle = ghostColor;
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
              ctx.setLineDash([]);
            }
          }
        }
      }

      const pieceMatrix = getShapeMatrix(gameStateRef.current.currentPiece.shape, gameStateRef.current.currentPiece.rotation);
      for (let row = 0; row < pieceMatrix.length; row++) {
        for (let col = 0; col < pieceMatrix[row].length; col++) {
          if (pieceMatrix[row][col] === 1) {
            const x = gameStateRef.current.currentPiece.x + col;
            const y = gameStateRef.current.currentPiece.y + row;
            if (y >= 0) {
              drawBlock(ctx, x, y, COLORS[gameStateRef.current.currentPiece.shape], false);
            }
          }
        }
      }
    }
  }

  function drawBlock(ctx, col, row, color, isGhost = false) {
    const x = col * BLOCK_SIZE;
    const y = row * BLOCK_SIZE;
    const alpha = isGhost ? 0.2 : 1;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

    const gradient = ctx.createLinearGradient(x, y, x + BLOCK_SIZE, y + BLOCK_SIZE);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '10');
    ctx.fillStyle = gradient;
    ctx.fillRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

    ctx.shadowColor = color + 'aa';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  useEffect(() => {
    const gameLoop = (timestamp) => {
      drawGame();

      if (gameStateRef.current.gameState === 'playing') {
        const now = Date.now();
        if (now - gameStateRef.current.lastDropTime > gameStateRef.current.speed) {
          const newPiece = {
            ...gameStateRef.current.currentPiece,
            y: gameStateRef.current.currentPiece.y + 1,
          };

          if (isValidMove(newPiece)) {
            gameStateRef.current.currentPiece = newPiece;
          } else {
            dropPiece();
          }

          gameStateRef.current.lastDropTime = now;
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const canvasWidth = COLS * BLOCK_SIZE;
  const canvasHeight = ROWS * BLOCK_SIZE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-2" style={{
            color: '#00f0f0',
            textShadow: '0 0 20px #00f0f0, 0 0 40px #00f0f0',
            letterSpacing: '4px',
          }}>
            NEON TETRIS
          </h1>
          <p className="text-cyan-400 text-sm md:text-lg tracking-[3px] font-light">
            PREMIUM ARCADE EXPERIENCE
          </p>
        </motion.div>

        {gameState === 'menu' && (
          <motion.div
            className="flex flex-col items-center justify-center gap-8 py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-2xl md:text-4xl text-cyan-300 animate-pulse">
              Tap or Press Any Key to Start
            </h2>
            <div className="grid grid-cols-2 gap-6 md:gap-8 text-center">
              <div>
                <p className="text-yellow-400 font-bold mb-2">MOVE</p>
                <p className="text-gray-300 text-sm">ARROW KEYS</p>
              </div>
              <div>
                <p className="text-yellow-400 font-bold mb-2">ROTATE</p>
                <p className="text-gray-300 text-sm">UP / Z</p>
              </div>
              <div>
                <p className="text-yellow-400 font-bold mb-2">DROP</p>
                <p className="text-gray-300 text-sm">SPACE</p>
              </div>
              <div>
                <p className="text-yellow-400 font-bold mb-2">HOLD</p>
                <p className="text-gray-300 text-sm">H</p>
              </div>
            </div>
            <button
              onClick={() => initGame()}
              className="mt-8 px-8 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 transition-all"
              style={{
                boxShadow: '0 0 20px #00f0f0',
              }}
            >
              START GAME
            </button>
          </motion.div>
        )}

        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <motion.div
              className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-4 md:p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-cyan-400 font-bold mb-4 text-lg">HOLD</h3>
              <div className="bg-black/50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                {gameStateRef.current.heldPiece ? (
                  <div className="text-cyan-400 font-bold">
                    {gameStateRef.current.heldPiece.shape}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No piece held</div>
                )}
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">High Score</p>
                  <p className="text-cyan-400 text-2xl font-bold">{highScore.toLocaleString()}</p>
                </div>
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Lines</p>
                  <p className="text-green-400 text-2xl font-bold">{lines}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="bg-black/50 rounded-xl border-2 border-cyan-500/50"
                style={{
                  boxShadow: '0 0 30px rgba(0, 240, 240, 0.5), inset 0 0 20px rgba(0, 240, 240, 0.1)',
                  imageRendering: 'pixelated',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="w-full text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Score</p>
                <p className="text-cyan-400 text-3xl font-bold">{score.toLocaleString()}</p>
              </div>

              <div className="hidden md:flex gap-2 flex-wrap justify-center text-xs text-gray-400">
                <span>⬅️ ➡️ ↓ MOVE</span>
                <span>| ⬆️ X ROTATE</span>
                <span>| Z CCW</span>
                <span>| SPACE DROP</span>
                <span>| H HOLD</span>
                <span>| P PAUSE</span>
              </div>

              <div className="md:hidden grid grid-cols-3 gap-2 w-full">
                <button
                  onTouchStart={() => movePiece(-1, 0)}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-6 h-6 text-cyan-400 mx-auto" />
                </button>
                <button
                  onTouchStart={() => movePiece(0, 1)}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform"
                >
                  <ArrowDown className="w-6 h-6 text-cyan-400 mx-auto" />
                </button>
                <button
                  onTouchStart={() => movePiece(1, 0)}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform"
                >
                  <ArrowRight className="w-6 h-6 text-cyan-400 mx-auto" />
                </button>

                <button
                  onTouchStart={() => rotatePiece()}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform"
                >
                  <RotateCw className="w-6 h-6 text-purple-400 mx-auto" />
                </button>
                <button
                  onTouchStart={() => rotatePiece(true)}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-6 h-6 text-purple-400 mx-auto" />
                </button>
                <button
                  onTouchStart={() => hardDrop()}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform"
                >
                  <Zap className="w-6 h-6 text-yellow-400 mx-auto" />
                </button>

                <button
                  onTouchStart={() => toggleHold()}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform col-span-1"
                >
                  <span className="text-cyan-400 text-xs font-bold">HOLD</span>
                </button>
                <button
                  onTouchStart={() => togglePause()}
                  className="bg-gray-800/80 rounded-xl p-3 active:scale-95 transition-transform col-span-1"
                >
                  {gameState === 'playing' ? (
                    <Pause className="w-6 h-6 text-orange-400 mx-auto" />
                  ) : (
                    <Play className="w-6 h-6 text-green-400 mx-auto" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-xl p-4 md:p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-cyan-400 font-bold mb-4 text-lg">NEXT</h3>
              <div className="space-y-3">
                {gameStateRef.current.nextPieces.map((piece, idx) => (
                  <div key={idx} className="bg-black/50 rounded-lg p-3 text-center text-cyan-300 font-bold text-sm">
                    {piece?.shape || '?'}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">LEVEL</p>
                  <p className="text-purple-400 text-4xl font-bold">{level}</p>
                  <p className="text-gray-500 text-xs mt-1">STAGE {level}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {gameState === 'gameover' && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900/95 border-2 border-red-500/50 rounded-2xl p-8 md:p-12 max-w-md text-center"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <h2
                className="text-5xl font-bold mb-6"
                style={{
                  color: '#f00000',
                  textShadow: '0 0 20px #f00000',
                  letterSpacing: '2px',
                }}
              >
                GAME OVER
              </h2>

              <div className="space-y-4 mb-8">
                <div className="bg-black/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Final Score</p>
                  <p className="text-cyan-400 text-3xl font-bold">{score.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Level</p>
                    <p className="text-purple-400 text-2xl font-bold">{level}</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Lines</p>
                    <p className="text-green-400 text-2xl font-bold">{lines}</p>
                  </div>
                </div>
                {score > highScore && (
                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                    <p className="text-yellow-300 text-sm font-bold">NEW HIGH SCORE!</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => initGame()}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all text-lg"
                style={{
                  boxShadow: '0 0 20px #00f0f0',
                }}
              >
                PLAY AGAIN
              </button>
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence>
          {scorePopups.map((popup) => (
            <motion.div
              key={popup.id}
              className="fixed pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -60 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="text-2xl font-bold text-cyan-400" style={{
                textShadow: '0 0 10px #00f0f0',
              }}>
                +{popup.points}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NeonTetrisGame;
