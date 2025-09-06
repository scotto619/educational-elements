// components/games/MathSpaceInvadersGame.js - COMPLETE Math Space Invaders Game
import React, { useState, useEffect, useRef, useCallback } from 'react';

const MathSpaceInvadersGame = ({ studentData, updateStudentData, showToast }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const gameLoopRef = useRef(null);
  
  // Ship configurations
  const shipColors = [
    { name: 'Cyan Explorer', primary: '#00d2ff', secondary: '#ffffff', accent: '#ff6b6b', unlock: 0, description: 'Your first ship!' },
    { name: 'Emerald Ranger', primary: '#00ff88', secondary: '#ffffff', accent: '#ff6b6b', unlock: 2, description: 'Fast and agile' },
    { name: 'Purple Phantom', primary: '#8b5cf6', secondary: '#ffffff', accent: '#fbbf24', unlock: 4, description: 'Stealth capabilities' },
    { name: 'Golden Eagle', primary: '#fbbf24', secondary: '#ffffff', accent: '#ef4444', unlock: 6, description: 'Powerful and bold' },
    { name: 'Rose Fighter', primary: '#f43f5e', secondary: '#ffffff', accent: '#22d3ee', unlock: 8, description: 'Elegant warrior' },
    { name: 'Rainbow Cosmic', primary: '#ff6b6b', secondary: '#4ecdc4', accent: '#45b7d1', unlock: 10, description: 'Legendary vessel' },
    { name: 'Shadow Hunter', primary: '#1a1a2e', secondary: '#9d4edd', accent: '#ffd700', unlock: 12, description: 'Dark energy master' },
    { name: 'Crystal Guardian', primary: '#00f5ff', secondary: '#e0e0e0', accent: '#ff69b4', unlock: 15, description: 'Pure light energy' },
    { name: 'Flame Phoenix', primary: '#ff4500', secondary: '#ffd700', accent: '#ff0080', unlock: 18, description: 'Reborn from fire' },
    { name: 'Void Destroyer', primary: '#4b0082', secondary: '#00ffff', accent: '#ffff00', unlock: 20, description: 'Ultimate power' }
  ];

  // Game state
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    lives: 3,
    questionsAnswered: 0,
    questionsPerLevel: 5,
    paused: false,
    gameOver: false,
    gameStarted: false,
    selectedShip: 0,
    unlockedShips: [0],
    maxLevelReached: 0,
    showStartScreen: true,
    showLevelComplete: false,
    showGameWin: false
  });

  // Player state
  const [player, setPlayer] = useState({
    x: 400,
    y: 520,
    vx: 0,
    vy: 0,
    angle: 0,
    trail: []
  });

  // Game objects
  const [numbers, setNumbers] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [particles, setParticles] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({ question: '', answer: 0, options: [] });
  
  // Input state
  const [keys, setKeys] = useState({});

  // Load saved progress
  useEffect(() => {
    const savedProgress = studentData?.gameProgress?.mathSpaceInvaders;
    if (savedProgress) {
      setGameState(prev => ({
        ...prev,
        unlockedShips: savedProgress.unlockedShips || [0],
        maxLevelReached: savedProgress.maxLevelReached || 0,
        selectedShip: savedProgress.selectedShip || 0
      }));
    }
  }, [studentData]);

  // Save progress function
  const saveProgress = useCallback(async (progressData) => {
    if (!updateStudentData) return;

    const updatedGameProgress = {
      ...studentData.gameProgress,
      mathSpaceInvaders: {
        ...studentData.gameProgress?.mathSpaceInvaders,
        ...progressData,
        lastPlayed: new Date().toISOString()
      }
    };

    try {
      await updateStudentData({
        gameProgress: updatedGameProgress
      });
    } catch (error) {
      console.error('Failed to save Math Space Invaders progress:', error);
    }
  }, [studentData, updateStudentData]);

  // Particle class
  class Particle {
    constructor(x, y, color, size = 3) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = (Math.random() - 0.5) * 8;
      this.color = color;
      this.size = size;
      this.life = 1;
      this.decay = 0.02;
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.size *= 0.98;
    }
    
    isAlive() {
      return this.life > 0;
    }
  }

  // Generate math questions
  const generateQuestion = useCallback(() => {
    let a, b, operation, answer;
    const level = gameState.level;
    
    if (level <= 2) {
      // Basic addition and subtraction
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      operation = Math.random() > 0.5 ? '+' : '-';
      if (operation === '-' && a < b) [a, b] = [b, a];
      answer = operation === '+' ? a + b : a - b;
    } else if (level <= 4) {
      // Multiplication tables
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      operation = '×';
      answer = a * b;
    } else if (level <= 6) {
      // Division
      b = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 15) + 1;
      a = b * answer;
      operation = '÷';
    } else if (level <= 8) {
      // Mixed operations with larger numbers
      if (Math.random() > 0.5) {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 30) + 5;
        operation = '+';
        answer = a + b;
      } else {
        a = Math.floor(Math.random() * 15) + 1;
        b = Math.floor(Math.random() * 15) + 1;
        operation = '×';
        answer = a * b;
      }
    } else if (level <= 12) {
      // Advanced operations
      let opChoice = Math.random();
      if (opChoice < 0.3) {
        // Order of operations
        a = Math.floor(Math.random() * 20) + 5;
        b = Math.floor(Math.random() * 10) + 2;
        let c = Math.floor(Math.random() * 10) + 1;
        answer = (a + b) * c;
        return {
          question: `(${a} + ${b}) × ${c} = ?`,
          answer,
          options: generateOptions(answer)
        };
      } else if (opChoice < 0.6) {
        // Large multiplication
        a = Math.floor(Math.random() * 25) + 10;
        b = Math.floor(Math.random() * 20) + 5;
        operation = '×';
        answer = a * b;
      } else {
        // Complex division
        b = Math.floor(Math.random() * 15) + 5;
        answer = Math.floor(Math.random() * 25) + 10;
        a = b * answer;
        operation = '÷';
      }
    } else if (level <= 16) {
      // Expert operations
      let opChoice = Math.random();
      if (opChoice < 0.4) {
        // Square numbers
        a = Math.floor(Math.random() * 15) + 1;
        answer = a * a;
        return {
          question: `${a}² = ?`,
          answer,
          options: generateOptions(answer)
        };
      } else if (opChoice < 0.7) {
        // Percentage calculations
        a = Math.floor(Math.random() * 20) + 10;
        let percentages = [10, 20, 25, 50, 75];
        b = percentages[Math.floor(Math.random() * percentages.length)];
        answer = Math.floor(a * b / 100);
        return {
          question: `${b}% of ${a} = ?`,
          answer,
          options: generateOptions(answer)
        };
      } else {
        // Multi-step problems
        a = Math.floor(Math.random() * 12) + 3;
        b = Math.floor(Math.random() * 8) + 2;
        let c = Math.floor(Math.random() * 5) + 1;
        answer = a * b + c;
        return {
          question: `${a} × ${b} + ${c} = ?`,
          answer,
          options: generateOptions(answer)
        };
      }
    } else {
      // Master level
      let opChoice = Math.random();
      if (opChoice < 0.25) {
        // Cube numbers
        a = Math.floor(Math.random() * 8) + 2;
        answer = a * a * a;
        return {
          question: `${a}³ = ?`,
          answer,
          options: generateOptions(answer)
        };
      } else if (opChoice < 0.5) {
        // Square roots
        answer = Math.floor(Math.random() * 12) + 1;
        a = answer * answer;
        return {
          question: `√${a} = ?`,
          answer,
          options: generateOptions(answer)
        };
      } else if (opChoice < 0.75) {
        // Complex order of operations
        a = Math.floor(Math.random() * 15) + 5;
        b = Math.floor(Math.random() * 8) + 2;
        let c = Math.floor(Math.random() * 6) + 1;
        let d = Math.floor(Math.random() * 4) + 1;
        answer = a * b - c * d;
        return {
          question: `${a} × ${b} - ${c} × ${d} = ?`,
          answer,
          options: generateOptions(answer)
        };
      } else {
        // Mixed fractions as decimals
        a = Math.floor(Math.random() * 10) + 1;
        answer = a + 0.5;
        return {
          question: `${a} + 0.5 = ?`,
          answer,
          options: generateOptions(answer, true)
        };
      }
    }
    
    return {
      question: `${a} ${operation} ${b} = ?`,
      answer,
      options: generateOptions(answer)
    };
  }, [gameState.level]);

  // Generate wrong answer options
  const generateOptions = (correctAnswer, isDecimal = false) => {
    const options = [correctAnswer];
    while (options.length < 6) {
      let wrong;
      if (isDecimal) {
        wrong = correctAnswer + (Math.random() > 0.5 ? 0.5 : -0.5) * (Math.floor(Math.random() * 5) + 1);
      } else {
        wrong = correctAnswer + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 15) + 1);
      }
      if (wrong > 0 && !options.includes(wrong)) {
        options.push(wrong);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  // Create explosion particles
  const createExplosion = (x, y, color = '#ff6b6b') => {
    const newParticles = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push(new Particle(x, y, color, Math.random() * 5 + 3));
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Draw ship
  const drawShip = (ctx, x, y, angle, colors, scale = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);
    
    // Main body
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-15, 15);
    ctx.lineTo(0, 10);
    ctx.lineTo(15, 15);
    ctx.closePath();
    ctx.fill();
    
    // Inner detail
    ctx.fillStyle = colors.secondary;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-8, 0);
    ctx.lineTo(0, -5);
    ctx.lineTo(8, 0);
    ctx.closePath();
    ctx.fill();
    
    // Engine
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(0, 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };

  // Draw particle
  const drawParticle = (ctx, particle) => {
    ctx.save();
    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Spawn number options
  const spawnNumbers = useCallback((question) => {
    const newNumbers = [];
    const positions = [];
    
    question.options.forEach((num, index) => {
      let validPosition = false;
      let attempts = 0;
      let x, y;
      
      while (!validPosition && attempts < 100) {
        x = Math.random() * (800 - 100) + 50;
        y = Math.random() * (600 - 250) + 120;
        
        let distanceFromPlayer = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        validPosition = distanceFromPlayer > 120;
        
        if (validPosition) {
          for (let pos of positions) {
            let dx = x - pos.x;
            let dy = y - pos.y;
            if (Math.sqrt(dx * dx + dy * dy) < 80) {
              validPosition = false;
              break;
            }
          }
        }
        attempts++;
      }
      
      if (!validPosition) {
        x = 50 + (index * 120) % (800 - 100);
        y = 120 + Math.floor(index / 6) * 80;
      }
      
      positions.push({x, y});
      newNumbers.push({
        x: x,
        y: y,
        value: num,
        correct: num === question.answer,
        size: 30,
        pulse: Math.random() * Math.PI * 2,
        collected: false
      });
    });
    
    return newNumbers;
  }, [player.x, player.y]);

  // Spawn enemies
  const spawnEnemies = useCallback((level) => {
    const newEnemies = [];
    let enemyCount = Math.min(level + 1, 8);
    
    for (let i = 0; i < enemyCount; i++) {
      let validPosition = false;
      let attempts = 0;
      let x, y;
      
      while (!validPosition && attempts < 100) {
        x = Math.random() * (800 - 40);
        y = Math.random() * (600 - 400) + 50;
        
        let distanceFromPlayer = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
        validPosition = distanceFromPlayer > 150;
        
        attempts++;
      }
      
      if (!validPosition) {
        x = (i % 4) * (800 / 4) + 50;
        y = Math.floor(i / 4) * 80 + 50;
      }
      
      newEnemies.push({
        x: x,
        y: y,
        width: 35,
        height: 35,
        speed: 0.8 + level * 0.2,
        vx: 0,
        vy: 0,
        angle: 0,
        lastPlayerX: player.x,
        lastPlayerY: player.y,
        updateTimer: Math.random() * 60,
        health: 1
      });
    }
    
    return newEnemies;
  }, [player.x, player.y]);

  // Check ship unlocks
  const checkShipUnlocks = useCallback(async () => {
    const currentLevel = Math.max(gameState.level, gameState.maxLevelReached);
    const newUnlocks = [];
    
    shipColors.forEach((ship, index) => {
      if (currentLevel >= ship.unlock && !gameState.unlockedShips.includes(index)) {
        newUnlocks.push({ index, name: ship.name });
      }
    });
    
    if (newUnlocks.length > 0) {
      const updatedUnlocks = [...gameState.unlockedShips, ...newUnlocks.map(u => u.index)];
      const updatedMaxLevel = Math.max(gameState.maxLevelReached, gameState.level);
      
      setGameState(prev => ({
        ...prev,
        unlockedShips: updatedUnlocks,
        maxLevelReached: updatedMaxLevel
      }));
      
      // Save progress
      await saveProgress({
        unlockedShips: updatedUnlocks,
        maxLevelReached: updatedMaxLevel,
        selectedShip: gameState.selectedShip
      });
      
      setTimeout(() => {
        showToast(`New ship${newUnlocks.length > 1 ? 's' : ''} unlocked: ${newUnlocks.map(u => u.name).join(', ')}!`, 'success');
      }, 1000);
    }
    
    const updatedMaxLevel = Math.max(gameState.maxLevelReached, gameState.level);
    if (updatedMaxLevel > gameState.maxLevelReached) {
      setGameState(prev => ({
        ...prev,
        maxLevelReached: updatedMaxLevel
      }));
      
      await saveProgress({
        unlockedShips: gameState.unlockedShips,
        maxLevelReached: updatedMaxLevel,
        selectedShip: gameState.selectedShip
      });
    }
  }, [gameState, saveProgress, showToast]);

  // Start new game
  const startGame = () => {
    const question = generateQuestion();
    setGameState(prev => ({
      ...prev,
      level: 1,
      score: 0,
      lives: 3,
      questionsAnswered: 0,
      paused: false,
      gameOver: false,
      gameStarted: true,
      showStartScreen: false,
      showLevelComplete: false,
      showGameWin: false
    }));
    
    setPlayer({
      x: 400,
      y: 520,
      vx: 0,
      vy: 0,
      angle: 0,
      trail: []
    });
    
    setCurrentQuestion(question);
    setNumbers(spawnNumbers(question));
    setEnemies(spawnEnemies(1));
    setParticles([]);
  };

  // Next level
  const nextLevel = () => {
    const newLevel = gameState.level + 1;
    const question = generateQuestion();
    
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      questionsAnswered: 0,
      paused: false,
      showLevelComplete: false
    }));
    
    setCurrentQuestion(question);
    setNumbers(spawnNumbers(question));
    setEnemies(spawnEnemies(newLevel));
    
    checkShipUnlocks();
  };

  // Handle answer selection
  const handleAnswer = useCallback(async (isCorrect) => {
    if (isCorrect) {
      const points = 20 * gameState.level;
      setGameState(prev => ({
        ...prev,
        score: prev.score + points,
        questionsAnswered: prev.questionsAnswered + 1
      }));
      
      createExplosion(player.x, player.y, '#00ff88');
      
      
      // Check if level complete
      if (gameState.questionsAnswered + 1 >= gameState.questionsPerLevel) {
        if (gameState.level >= 20) {
          setGameState(prev => ({ ...prev, showGameWin: true, paused: true }));
        } else {
          setGameState(prev => ({ ...prev, showLevelComplete: true, paused: true }));
        }
      } else {
        // Generate new question
        const newQuestion = generateQuestion();
        setCurrentQuestion(newQuestion);
        setNumbers(spawnNumbers(newQuestion));
      }
    } else {
      setGameState(prev => ({
        ...prev,
        lives: prev.lives - 1
      }));
      
      createExplosion(player.x, player.y, '#ff6b6b');
      
      if (gameState.lives <= 1) {
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          paused: true
        }));
      }
    }
  }, [gameState, player, generateQuestion, spawnNumbers, updateStudentData, studentData]);

  // Main game loop
  useEffect(() => {
    if (!gameState.gameStarted || gameState.paused || gameState.gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const acceleration = 0.8;
    const friction = 0.85;
    const maxSpeed = 6;

    gameLoopRef.current = setInterval(() => {
      // Clear canvas
      ctx.clearRect(0, 0, 800, 600);

      // Update player movement
      setPlayer(prev => {
        let newVx = prev.vx;
        let newVy = prev.vy;
        let newAngle = prev.angle;
        
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) newVx -= acceleration;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) newVx += acceleration;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) newVy -= acceleration;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) newVy += acceleration;
        
        if (!(keys['ArrowLeft'] || keys['a'] || keys['A']) && 
            !(keys['ArrowRight'] || keys['d'] || keys['D'])) {
          newVx *= friction;
        }
        if (!(keys['ArrowUp'] || keys['w'] || keys['W']) && 
            !(keys['ArrowDown'] || keys['s'] || keys['S'])) {
          newVy *= friction;
        }
        
        newVx = Math.max(-maxSpeed, Math.min(maxSpeed, newVx));
        newVy = Math.max(-maxSpeed, Math.min(maxSpeed, newVy));
        
        if (Math.abs(newVx) > 0.1 || Math.abs(newVy) > 0.1) {
          newAngle = Math.atan2(newVy, newVx) + Math.PI / 2;
        }
        
        const newX = Math.max(20, Math.min(780, prev.x + newVx));
        const newY = Math.max(20, Math.min(580, prev.y + newVy));
        
        const newTrail = [...prev.trail, { x: newX, y: newY }];
        if (newTrail.length > 8) newTrail.shift();
        
        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          angle: newAngle,
          trail: newTrail
        };
      });

      // Update enemies
      setEnemies(prev => prev.map(enemy => {
        enemy.updateTimer++;
        
        if (enemy.updateTimer > 30 + Math.random() * 60) {
          enemy.updateTimer = 0;
          enemy.lastPlayerX = player.x + (Math.random() - 0.5) * 100;
          enemy.lastPlayerY = player.y + (Math.random() - 0.5) * 100;
        }
        
        let dx = enemy.lastPlayerX - enemy.x;
        let dy = enemy.lastPlayerY - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
          let moveX = (dx / distance) * enemy.speed;
          let moveY = (dy / distance) * enemy.speed;
          
          enemy.vx = moveX;
          enemy.vy = moveY;
          enemy.angle = Math.atan2(moveY, moveX) + Math.PI / 2;
          
          enemy.x += moveX;
          enemy.y += moveY;
        }
        
        return enemy;
      }));

      // Update particles
      setParticles(prev => {
        const updated = prev.map(particle => {
          particle.update();
          return particle;
        }).filter(particle => particle.isAlive());
        return updated;
      });

      // Update number pulse
      setNumbers(prev => prev.map(num => ({
        ...num,
        pulse: num.pulse + 0.1
      })));

    }, 1000 / 60); // 60 FPS

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, keys, player]);

  // Collision detection
  useEffect(() => {
    if (!gameState.gameStarted || gameState.paused) return;
    
    // Check number collisions
    numbers.forEach(num => {
      if (num.collected) return;
      
      let dx = player.x - num.x;
      let dy = player.y - num.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 40) {
        num.collected = true;
        handleAnswer(num.correct);
      }
    });
    
    // Check enemy collisions with dynamic sizes
    enemies.forEach((enemy, index) => {
      let dx = player.x - enemy.x;
      let dy = player.y - enemy.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      
      // Collision radius based on enemy size
      let collisionRadius = enemy.size * 0.6;
      
      if (distance < collisionRadius) {
        setEnemies(prev => prev.filter((_, i) => i !== index));
        
        setGameState(prev => ({
          ...prev,
          lives: prev.lives - 1
        }));
        
        createExplosion(enemy.x, enemy.y, enemy.type.color);
        
        if (gameState.lives <= 1) {
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            paused: true
          }));
        }
      }
    });
  }, [gameState, numbers, enemies, player, handleAnswer]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState.gameStarted) return;

    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // Clear with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, '#000011');
      gradient.addColorStop(1, '#000033');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      const selectedColors = shipColors[gameState.selectedShip];
      
      // Draw player trail
      ctx.save();
      player.trail.forEach((point, index) => {
        ctx.globalAlpha = index / player.trail.length * 0.5;
        ctx.fillStyle = selectedColors.primary;
        ctx.beginPath();
        ctx.arc(point.x, point.y, (index / player.trail.length) * 15, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      
      // Draw player ship
      drawShip(ctx, player.x, player.y, player.angle, selectedColors);
      
      // Draw numbers
      numbers.forEach(num => {
        if (num.collected) return;
        
        let glowSize = Math.sin(num.pulse) * 3 + 35;
        
        ctx.save();
        ctx.translate(num.x, num.y);
        
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = '#00aadd';
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num.value, 0, 0);
        
        ctx.restore();
      });
      
      // Draw enemies
      enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);
        
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-20, 10);
        ctx.lineTo(-10, 15);
        ctx.lineTo(0, 5);
        ctx.lineTo(10, 15);
        ctx.lineTo(20, 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, -5, 3, 0, Math.PI * 2);
        ctx.arc(8, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(0, 18, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
      
      // Draw particles
      particles.forEach(particle => drawParticle(ctx, particle));

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, player, numbers, enemies, particles]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState.showLevelComplete) {
          nextLevel();
        } else if (gameState.showStartScreen) {
          startGame();
        }
      }
    };
    
    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Ship selection
  const selectShip = async (shipIndex) => {
    if (gameState.unlockedShips.includes(shipIndex)) {
      setGameState(prev => ({ ...prev, selectedShip: shipIndex }));
      await saveProgress({
        unlockedShips: gameState.unlockedShips,
        maxLevelReached: gameState.maxLevelReached,
        selectedShip: shipIndex
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-black min-h-screen text-white">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
          Math Space Invaders
        </h2>
        <p className="text-gray-300">Solve math problems while flying through space!</p>
      </div>

      {/* Game Stats */}
      {gameState.gameStarted && (
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="bg-cyan-500/20 backdrop-blur border border-cyan-400 px-3 py-2 rounded-lg">
            Level: {gameState.level}
          </div>
          <div className="bg-green-500/20 backdrop-blur border border-green-400 px-3 py-2 rounded-lg">
            Score: {gameState.score}
          </div>
          <div className="bg-red-500/20 backdrop-blur border border-red-400 px-3 py-2 rounded-lg">
            Lives: {gameState.lives}
          </div>
          <div className="bg-purple-500/20 backdrop-blur border border-purple-400 px-3 py-2 rounded-lg">
            Questions: {gameState.questionsAnswered}/{gameState.questionsPerLevel}
          </div>
        </div>
      )}

      {/* Current Question */}
      {gameState.gameStarted && !gameState.paused && (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4 rounded-xl border-4 border-white text-center">
          <div className="text-2xl md:text-3xl font-bold">
            {currentQuestion.question}
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50 bg-gradient-to-b from-gray-900 to-blue-900"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        {/* Overlays */}
        {gameState.showStartScreen && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 rounded-xl text-center max-w-lg">
              <h3 className="text-2xl font-bold mb-4">Math Space Invaders</h3>
              <p className="mb-4">Fly through space and solve math problems!</p>
              <p className="mb-6">Answer {gameState.questionsPerLevel} questions correctly to advance each level.</p>
              
              {/* Ship Selection */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3">Choose Your Ship:</h4>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {shipColors.map((ship, index) => (
                    <button
                      key={index}
                      onClick={() => selectShip(index)}
                      disabled={!gameState.unlockedShips.includes(index)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        gameState.selectedShip === index
                          ? 'border-yellow-400 bg-yellow-400/20'
                          : gameState.unlockedShips.includes(index)
                          ? 'border-gray-300 hover:border-yellow-300 bg-white/10'
                          : 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                      }`}
                      title={gameState.unlockedShips.includes(index) ? ship.description : `Unlock at level ${ship.unlock}`}
                    >
                      <div className="text-xs font-semibold truncate">{ship.name}</div>
                      {gameState.unlockedShips.includes(index) ? (
                        <div className="w-8 h-8 mx-auto mt-1 rounded-full" style={{ backgroundColor: ship.primary }}>
                          <div className="w-full h-full rounded-full border-2 border-white/50"></div>
                        </div>
                      ) : (
                        <div className="text-2xl">🔒</div>
                      )}
                      <div className="text-xs text-gray-300">Level {ship.unlock}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <p className="text-sm mb-4"><strong>Controls:</strong> Arrow Keys or WASD to move</p>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Start Game
              </button>
              <p className="text-sm mt-2 opacity-80">Press SPACEBAR to start!</p>
            </div>
          </div>
        )}
        
        {gameState.showLevelComplete && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-gradient-to-br from-green-600 to-blue-700 p-8 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">Level Complete!</h3>
              <p className="mb-4">Great job! You answered all {gameState.questionsPerLevel} questions correctly!</p>
              <p className="mb-6">Press SPACEBAR to continue to level {gameState.level + 1}</p>
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        
        {gameState.showGameWin && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">Congratulations!</h3>
              <p className="mb-4">You've completed all 20 levels!</p>
              <p className="mb-4">Final Score: {gameState.score}</p>
              <p className="mb-6">All ships have been unlocked!</p>
              <button
                onClick={() => setGameState(prev => ({ ...prev, showStartScreen: true, showGameWin: false, gameStarted: false }))}
                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
        
        {gameState.gameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="bg-gradient-to-br from-red-600 to-purple-700 p-8 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
              <p className="mb-4">Final Score: {gameState.score}</p>
              <p className="mb-6">Level Reached: {gameState.level}</p>
              <button
                onClick={() => setGameState(prev => ({ ...prev, showStartScreen: true, gameOver: false, gameStarted: false }))}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:shadow-lg transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ship Collection */}
      <div className="bg-black/40 backdrop-blur border border-cyan-400 rounded-lg p-4 max-w-2xl">
        <h3 className="text-lg font-semibold mb-3 text-center">Ship Collection</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {shipColors.map((ship, index) => (
            <div
              key={index}
              className={`p-2 rounded border text-center transition-all ${
                gameState.unlockedShips.includes(index)
                  ? gameState.selectedShip === index
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-green-400 bg-green-400/10'
                  : 'border-gray-600 bg-gray-800/50 opacity-50'
              }`}
            >
              <div className="font-semibold truncate">{ship.name}</div>
              {gameState.unlockedShips.includes(index) ? (
                <div className="w-6 h-6 mx-auto my-1 rounded-full" style={{ backgroundColor: ship.primary }}></div>
              ) : (
                <div className="text-lg">🔒</div>
              )}
              <div className="text-gray-300">Lvl {ship.unlock}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/40 backdrop-blur border border-blue-400 rounded-lg p-4 text-center text-sm max-w-2xl">
        <p className="mb-2"><strong>Controls:</strong> Use ARROW KEYS or WASD to move</p>
        <p>Fly into the correct answer • Avoid enemy ships and wrong answers!</p>
      </div>

      {/* Game Controls */}
      <div className="flex gap-4">
        {!gameState.gameStarted && (
          <button
            onClick={() => setGameState(prev => ({ ...prev, showStartScreen: true }))}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            New Game
          </button>
        )}
        {gameState.gameStarted && (
          <button
            onClick={() => setGameState(prev => ({ ...prev, showStartScreen: true, gameStarted: false, paused: false }))}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
          >
            Reset Game
          </button>
        )}
      </div>
    </div>
  );
};

export default MathSpaceInvadersGame;