// components/games/ZTypeGame.js - Type Defender: A ZType-style typing space shooter
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Educational vocabulary word banks by difficulty
const WORD_BANKS = {
    easy: [
        // Sight words and basic vocabulary
        'the', 'and', 'was', 'for', 'are', 'but', 'not', 'you', 'all', 'can',
        'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him',
        'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way',
        'who', 'boy', 'did', 'own', 'say', 'she', 'too', 'use', 'cat', 'dog',
        'run', 'big', 'red', 'sun', 'top', 'box', 'cup', 'hat', 'map', 'pig',
        'bed', 'bus', 'car', 'fan', 'hot', 'leg', 'mud', 'net', 'pet', 'rug',
        'sit', 'win', 'ant', 'bat', 'bug', 'cub', 'den', 'egg', 'fin', 'gum'
    ],
    medium: [
        // Academic vocabulary and common words
        'about', 'after', 'again', 'began', 'being', 'below', 'between', 'both',
        'carry', 'change', 'city', 'close', 'country', 'earth', 'every', 'found',
        'great', 'group', 'house', 'large', 'learn', 'light', 'means', 'might',
        'music', 'never', 'often', 'paper', 'place', 'plant', 'point', 'quite',
        'right', 'river', 'round', 'small', 'sound', 'spell', 'start', 'still',
        'story', 'study', 'table', 'their', 'thing', 'think', 'three', 'under',
        'water', 'where', 'which', 'while', 'woman', 'world', 'write', 'young',
        'answer', 'animal', 'before', 'behind', 'better', 'black', 'bring', 'class',
        'clean', 'color', 'cover', 'doesn\'t', 'early', 'family', 'friend', 'funny'
    ],
    hard: [
        // Advanced vocabulary
        'although', 'beautiful', 'because', 'believe', 'building', 'business',
        'celebrate', 'character', 'community', 'complete', 'continue', 'describe',
        'different', 'discover', 'education', 'especially', 'everyone', 'example',
        'exercise', 'experience', 'favorite', 'following', 'government', 'happened',
        'however', 'important', 'including', 'information', 'interesting', 'knowledge',
        'language', 'listening', 'literature', 'measuring', 'necessary', 'paragraph',
        'particular', 'perhaps', 'possible', 'president', 'probably', 'problem',
        'question', 'remember', 'research', 'resources', 'sentence', 'something',
        'sometimes', 'surprise', 'temperature', 'together', 'tomorrow', 'understand',
        'vocabulary', 'whatever', 'wonderful', 'yesterday', 'adventure', 'alphabet'
    ],
    expert: [
        // Challenging vocabulary
        'abbreviation', 'accomplish', 'accordingly', 'achievement', 'acknowledge',
        'administration', 'advertisement', 'agriculture', 'alphabetically', 'announcement',
        'approximately', 'architecture', 'autobiography', 'bibliography', 'biodiversity',
        'characteristics', 'civilization', 'classification', 'communication', 'competition',
        'concentration', 'congratulations', 'conservation', 'consideration', 'constitution',
        'contemporary', 'contribution', 'controversial', 'convenience', 'cooperation',
        'correspondence', 'determination', 'development', 'disappointment', 'discrimination',
        'encyclopedia', 'environment', 'establishment', 'extraordinary', 'imagination',
        'immediately', 'independence', 'infrastructure', 'investigation', 'manufacturer',
        'mathematics', 'measurement', 'multiplication', 'neighborhood', 'opportunity'
    ]
};

// Particle class for explosions
class Particle {
    constructor(x, y, color, speed = 1) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6 * speed;
        this.vy = (Math.random() - 0.5) * 6 * speed;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
    }

    isAlive() {
        return this.life > 0;
    }
}

// Star for background
class Star {
    constructor(canvasWidth, canvasHeight) {
        this.reset(canvasWidth, canvasHeight, true);
    }

    reset(canvasWidth, canvasHeight, initial = false) {
        this.x = Math.random() * canvasWidth;
        this.y = initial ? Math.random() * canvasHeight : -10;
        this.size = Math.random() * 2 + 0.5;
        this.speed = this.size * 0.5 + 0.5;
        this.brightness = Math.random() * 0.5 + 0.5;
    }

    update(canvasHeight, canvasWidth) {
        this.y += this.speed;
        if (this.y > canvasHeight) {
            this.reset(canvasWidth, canvasHeight);
        }
    }
}

const ZTypeGame = ({ studentData, updateStudentData, showToast, classmates = [], classData }) => {
    // Game state
    const [gamePhase, setGamePhase] = useState('menu'); // menu, countdown, playing, paused, gameover
    const [countdown, setCountdown] = useState(3);
    const [score, setScore] = useState(0);
    const [wave, setWave] = useState(1);
    const [lives, setLives] = useState(3);
    const [bombs, setBombs] = useState(2);
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);
    const [wordsDestroyed, setWordsDestroyed] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [totalTyped, setTotalTyped] = useState(0);
    const [correctTyped, setCorrectTyped] = useState(0);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [personalBest, setPersonalBest] = useState(null);

    // Game refs
    const canvasRef = useRef(null);
    const gameRef = useRef({
        enemies: [],
        projectiles: [],
        particles: [],
        stars: [],
        targetEnemy: null,
        typedChars: '',
        player: { x: 0, y: 0 },
        animationId: null,
        lastSpawnTime: 0,
        waveEnemies: 0,
        waveEnemiesDestroyed: 0
    });

    // Get high scores from classmates
    const classLeaderboard = (classmates || [])
        .filter(s => s?.gameScores?.ztype)
        .map(s => ({
            id: s.id,
            name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Unknown',
            score: s.gameScores.ztype.highScore || 0,
            wave: s.gameScores.ztype.maxWave || 1
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

    // Load personal best
    useEffect(() => {
        if (studentData?.gameScores?.ztype) {
            setPersonalBest(studentData.gameScores.ztype);
        }
    }, [studentData]);

    // Get word based on wave difficulty
    const getRandomWord = useCallback((waveNum) => {
        let wordPool;
        if (waveNum <= 2) {
            wordPool = WORD_BANKS.easy;
        } else if (waveNum <= 5) {
            wordPool = [...WORD_BANKS.easy, ...WORD_BANKS.medium];
        } else if (waveNum <= 8) {
            wordPool = [...WORD_BANKS.medium, ...WORD_BANKS.hard];
        } else {
            wordPool = [...WORD_BANKS.hard, ...WORD_BANKS.expert];
        }
        return wordPool[Math.floor(Math.random() * wordPool.length)].toUpperCase();
    }, []);

    // Create explosion particles
    const createExplosion = useCallback((x, y, color = '#ff6b6b', count = 15) => {
        const game = gameRef.current;
        for (let i = 0; i < count; i++) {
            game.particles.push(new Particle(x, y, color));
        }
    }, []);

    // Spawn enemy
    const spawnEnemy = useCallback((canvasWidth, currentWaveEnemies, waveEnemyCap) => {
        const game = gameRef.current;

        // Don't spawn if we've already spawned the max for this wave
        if (currentWaveEnemies >= waveEnemyCap) {
            return false;
        }

        const word = getRandomWord(wave);

        // Avoid spawning too close to existing enemies
        let x;
        let attempts = 0;
        do {
            x = Math.random() * (canvasWidth - 200) + 100;
            attempts++;
        } while (
            attempts < 10 &&
            game.enemies.some(e => Math.abs(e.x - x) < 150)
        );

        const speed = 0.3 + (wave * 0.08) + Math.random() * 0.2;

        game.enemies.push({
            id: Date.now() + Math.random(),
            x,
            y: -30,
            word,
            typed: '',
            speed,
            size: 20 + word.length * 2,
            color: `hsl(${Math.random() * 60 + 180}, 70%, 50%)`,
            glowColor: `hsl(${Math.random() * 60 + 180}, 80%, 60%)`
        });
        game.waveEnemies++;
        return true;
    }, [wave, getRandomWord]);

    // Fire projectile
    const fireProjectile = useCallback((targetX, targetY) => {
        const game = gameRef.current;
        const angle = Math.atan2(targetY - game.player.y, targetX - game.player.x);

        game.projectiles.push({
            x: game.player.x,
            y: game.player.y,
            vx: Math.cos(angle) * 15,
            vy: Math.sin(angle) * 15,
            targetX,
            targetY,
            trail: []
        });
    }, []);

    // Use EMP bomb
    const useEMP = useCallback(() => {
        if (bombs <= 0 || gamePhase !== 'playing') return;

        const game = gameRef.current;
        const canvas = canvasRef.current;
        if (!canvas) return;

        setBombs(prev => prev - 1);

        // Destroy all enemies on screen
        const destroyed = game.enemies.length;
        game.enemies.forEach(enemy => {
            createExplosion(enemy.x, enemy.y, '#00ffff', 25);
            setScore(prev => prev + enemy.word.length * 10);
        });

        game.enemies = [];
        game.targetEnemy = null;
        game.typedChars = '';

        if (destroyed > 0) {
            setWordsDestroyed(prev => prev + destroyed);
            showToast(`💥 EMP BLAST! ${destroyed} enemies destroyed!`, 'success');
        }

        // Screen flash effect
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [bombs, gamePhase, createExplosion, showToast]);

    // Handle typing
    const handleKeyDown = useCallback((e) => {
        if (gamePhase !== 'playing') return;

        // EMP bomb
        if (e.key === 'Enter') {
            e.preventDefault();
            useEMP();
            return;
        }

        // Only handle letters
        if (!/^[a-zA-Z]$/.test(e.key)) return;
        e.preventDefault();

        const game = gameRef.current;
        const char = e.key.toUpperCase();

        setTotalTyped(prev => prev + 1);

        // If no target, find one that starts with this letter
        if (!game.targetEnemy) {
            const target = game.enemies.find(enemy =>
                enemy.typed === '' && enemy.word[0] === char
            );

            if (target) {
                game.targetEnemy = target;
                game.typedChars = char;
                target.typed = char;
                setCorrectTyped(prev => prev + 1);
                setCombo(prev => prev + 1);
                fireProjectile(target.x, target.y);
            } else {
                // Wrong letter - no matching enemy
                setCombo(0);
            }
        } else {
            // Continue typing current target
            const nextCharIndex = game.typedChars.length;
            if (game.targetEnemy.word[nextCharIndex] === char) {
                game.typedChars += char;
                game.targetEnemy.typed = game.typedChars;
                setCorrectTyped(prev => prev + 1);
                setCombo(prev => {
                    const newCombo = prev + 1;
                    setMaxCombo(current => Math.max(current, newCombo));
                    return newCombo;
                });
                fireProjectile(game.targetEnemy.x, game.targetEnemy.y);

                // Check if word complete
                if (game.typedChars === game.targetEnemy.word) {
                    // Destroy enemy
                    const enemy = game.targetEnemy;
                    createExplosion(enemy.x, enemy.y, enemy.glowColor, 20);

                    // Score: base + length bonus + combo bonus
                    const baseScore = enemy.word.length * 10;
                    const comboBonus = Math.floor(combo / 5) * 5;
                    const totalScore = baseScore + comboBonus;
                    setScore(prev => prev + totalScore);
                    setWordsDestroyed(prev => prev + 1);

                    game.enemies = game.enemies.filter(e => e.id !== enemy.id);
                    game.targetEnemy = null;
                    game.typedChars = '';
                    game.waveEnemiesDestroyed++;
                    // Wave progression is handled in the game loop
                }
            } else {
                // Wrong letter
                setCombo(0);
            }
        }

        // Update accuracy
        setAccuracy(prev => {
            const newTotal = totalTyped + 1;
            const newCorrect = correctTyped + (game.targetEnemy ? 1 : 0);
            return Math.round((newCorrect / newTotal) * 100) || 100;
        });
    }, [gamePhase, combo, totalTyped, correctTyped, wave, useEMP, fireProjectile, createExplosion, showToast]);

    // Save score
    const saveScore = useCallback(async (finalScore, finalWave) => {
        if (!updateStudentData || !studentData) return;

        const currentBest = studentData?.gameScores?.ztype?.highScore || 0;
        const currentMaxWave = studentData?.gameScores?.ztype?.maxWave || 1;

        const newHighScore = Math.max(currentBest, finalScore);
        const newMaxWave = Math.max(currentMaxWave, finalWave);

        try {
            await updateStudentData({
                ...studentData,
                gameScores: {
                    ...(studentData.gameScores || {}),
                    ztype: {
                        highScore: newHighScore,
                        maxWave: newMaxWave,
                        lastPlayed: new Date().toISOString(),
                        gamesPlayed: (studentData.gameScores?.ztype?.gamesPlayed || 0) + 1
                    }
                }
            });

            setPersonalBest({
                highScore: newHighScore,
                maxWave: newMaxWave
            });

            if (finalScore > currentBest) {
                showToast(`🏆 NEW HIGH SCORE: ${finalScore}!`, 'success');
            }
        } catch (error) {
            console.error('Failed to save score:', error);
        }
    }, [studentData, updateStudentData, showToast]);

    // Game over
    const endGame = useCallback(() => {
        const game = gameRef.current;
        if (game.animationId) {
            cancelAnimationFrame(game.animationId);
            game.animationId = null;
        }
        setGamePhase('gameover');
        saveScore(score, wave);
    }, [score, wave, saveScore]);

    // Game loop
    useEffect(() => {
        if (gamePhase !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const game = gameRef.current;

        // Initialize player position
        game.player.x = canvas.width / 2;
        game.player.y = canvas.height - 60;

        // Initialize stars
        if (game.stars.length === 0) {
            for (let i = 0; i < 100; i++) {
                game.stars.push(new Star(canvas.width, canvas.height));
            }
        }

        let lastTime = 0;
        const gameLoop = (timestamp) => {
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            // Clear canvas
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw and update stars
            game.stars.forEach(star => {
                star.update(canvas.height, canvas.width);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Calculate enemies needed for this wave (5 + wave * 2)
            // Wave 1 = 7 enemies, Wave 2 = 9, Wave 3 = 11, etc.
            const waveEnemyCap = 5 + wave * 2;

            // Check if wave is complete (all enemies spawned AND destroyed)
            if (game.waveEnemiesDestroyed >= waveEnemyCap && game.enemies.length === 0) {
                // Wave complete! Move to next wave
                const nextWave = wave + 1;
                setWave(nextWave);
                game.waveEnemies = 0;
                game.waveEnemiesDestroyed = 0;
                showToast(`🌟 Wave ${nextWave} Starting!`, 'success');

                // Reward Logic: 2 Coins per wave (Daily reset)
                if (studentData && updateStudentData) {
                    const today = new Date().toDateString();
                    const lastRewardDate = studentData.gameProgress?.ztype?.lastRewardDate;
                    let highestWaveRewarded = studentData.gameProgress?.ztype?.highestWaveRewarded || 0;

                    // Reset daily
                    if (lastRewardDate !== today) {
                        highestWaveRewarded = 0;
                    }

                    // Award if this wave hasn't been rewarded today (using 'wave' which is the one just completed)
                    if (wave > highestWaveRewarded) {
                        const newCurrency = (studentData.currency || 0) + 2;

                        updateStudentData({
                            ...studentData,
                            currency: newCurrency,
                            gameProgress: {
                                ...studentData.gameProgress,
                                ztype: {
                                    ...studentData.gameProgress?.ztype,
                                    lastRewardDate: today,
                                    highestWaveRewarded: wave
                                }
                            }
                        }).then(() => {
                            showToast('💰 Wave Cleared! +2 Coins', 'success');
                        }).catch(err => console.error('Error awarding coins:', err));
                    }
                }

                // Give bonus bomb every 3 waves
                if (nextWave % 3 === 0) {
                    setBombs(prev => prev + 1);
                    showToast(`💣 Bonus EMP earned!`, 'success');
                }
            }

            // Spawn enemies (only if we haven't reached the cap for this wave)
            const spawnInterval = Math.max(1500 - wave * 100, 600);
            if (timestamp - game.lastSpawnTime > spawnInterval &&
                game.enemies.length < 8 &&
                game.waveEnemies < waveEnemyCap) {
                spawnEnemy(canvas.width, game.waveEnemies, waveEnemyCap);
                game.lastSpawnTime = timestamp;
            }

            // Update and draw enemies
            game.enemies = game.enemies.filter(enemy => {
                enemy.y += enemy.speed;

                // Check if enemy reached bottom
                if (enemy.y > canvas.height - 40) {
                    setLives(prev => {
                        const newLives = prev - 1;
                        if (newLives <= 0) {
                            endGame();
                        }
                        return newLives;
                    });
                    createExplosion(enemy.x, canvas.height - 40, '#ff4444', 10);
                    if (game.targetEnemy?.id === enemy.id) {
                        game.targetEnemy = null;
                        game.typedChars = '';
                    }
                    setCombo(0);
                    return false;
                }

                // Draw enemy ship
                const isTarget = game.targetEnemy?.id === enemy.id;

                // Glow effect for targeted enemy
                if (isTarget) {
                    ctx.shadowColor = '#00ff00';
                    ctx.shadowBlur = 20;
                }

                // Enemy body (triangle ship)
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.moveTo(enemy.x, enemy.y + enemy.size);
                ctx.lineTo(enemy.x - enemy.size * 0.6, enemy.y - enemy.size * 0.3);
                ctx.lineTo(enemy.x + enemy.size * 0.6, enemy.y - enemy.size * 0.3);
                ctx.closePath();
                ctx.fill();

                // Enemy cockpit
                ctx.fillStyle = isTarget ? '#00ff00' : enemy.glowColor;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size * 0.25, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;

                // Draw word above enemy
                const wordY = enemy.y - enemy.size - 15;
                ctx.font = 'bold 18px monospace';
                ctx.textAlign = 'center';

                // Background for word
                const wordWidth = ctx.measureText(enemy.word).width;
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(enemy.x - wordWidth / 2 - 8, wordY - 15, wordWidth + 16, 24);

                // Draw each character
                for (let i = 0; i < enemy.word.length; i++) {
                    const char = enemy.word[i];
                    const charX = enemy.x - wordWidth / 2 + ctx.measureText(enemy.word.substring(0, i)).width + 5;

                    if (i < enemy.typed.length) {
                        ctx.fillStyle = '#00ff00'; // Typed - green
                    } else if (i === enemy.typed.length && isTarget) {
                        ctx.fillStyle = '#ffff00'; // Current - yellow
                    } else {
                        ctx.fillStyle = '#ffffff'; // Not typed - white
                    }
                    ctx.fillText(char, charX, wordY);
                }

                return true;
            });

            // Update and draw projectiles
            game.projectiles = game.projectiles.filter(proj => {
                proj.x += proj.vx;
                proj.y += proj.vy;

                // Add trail
                proj.trail.push({ x: proj.x, y: proj.y });
                if (proj.trail.length > 5) proj.trail.shift();

                // Draw trail
                proj.trail.forEach((point, i) => {
                    const alpha = i / proj.trail.length;
                    ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.5})`;
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, 3 - i * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Draw projectile
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Remove if off screen
                return proj.y > 0 && proj.y < canvas.height && proj.x > 0 && proj.x < canvas.width;
            });

            // Update and draw particles
            game.particles = game.particles.filter(particle => {
                particle.update();

                if (particle.isAlive()) {
                    ctx.fillStyle = particle.color;
                    ctx.globalAlpha = particle.life;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    return true;
                }
                return false;
            });

            // Draw player ship
            const px = game.player.x;
            const py = game.player.y;

            // Ship glow
            ctx.shadowColor = '#00aaff';
            ctx.shadowBlur = 15;

            // Main body
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(px, py - 25);
            ctx.lineTo(px - 20, py + 20);
            ctx.lineTo(px, py + 10);
            ctx.lineTo(px + 20, py + 20);
            ctx.closePath();
            ctx.fill();

            // Cockpit
            ctx.fillStyle = '#60a5fa';
            ctx.beginPath();
            ctx.ellipse(px, py - 5, 6, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            // Engine glow
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.moveTo(px - 8, py + 20);
            ctx.lineTo(px, py + 35 + Math.sin(timestamp * 0.02) * 5);
            ctx.lineTo(px + 8, py + 20);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            // Draw HUD
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${score}`, 20, 30);
            ctx.fillText(`Wave: ${wave}`, 20, 55);
            ctx.fillText(`Combo: x${combo}`, 20, 80);

            // Lives
            ctx.textAlign = 'right';
            for (let i = 0; i < lives; i++) {
                ctx.fillText('❤️', canvas.width - 20 - i * 25, 30);
            }

            // Bombs
            for (let i = 0; i < bombs; i++) {
                ctx.fillText('💥', canvas.width - 20 - i * 25, 55);
            }

            ctx.fillText(`Accuracy: ${accuracy}%`, canvas.width - 20, 80);

            // Current typing indicator
            if (game.targetEnemy) {
                ctx.textAlign = 'center';
                ctx.font = 'bold 24px monospace';
                ctx.fillStyle = '#00ff00';
                ctx.fillText(game.typedChars + '_', canvas.width / 2, canvas.height - 20);
            }

            game.animationId = requestAnimationFrame(gameLoop);
        };

        game.animationId = requestAnimationFrame(gameLoop);

        return () => {
            if (game.animationId) {
                cancelAnimationFrame(game.animationId);
            }
        };
    }, [gamePhase, wave, score, combo, lives, bombs, accuracy, spawnEnemy, createExplosion, endGame]);

    // Add keyboard listener
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Countdown effect
    useEffect(() => {
        if (gamePhase !== 'countdown') return;

        if (countdown === 0) {
            setGamePhase('playing');
            return;
        }

        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [gamePhase, countdown]);

    // Start game
    const startGame = () => {
        const game = gameRef.current;
        game.enemies = [];
        game.projectiles = [];
        game.particles = [];
        game.stars = [];
        game.targetEnemy = null;
        game.typedChars = '';
        game.lastSpawnTime = 0;
        game.waveEnemies = 0;
        game.waveEnemiesDestroyed = 0;

        setScore(0);
        setWave(1);
        setLives(3);
        setBombs(2);
        setCombo(0);
        setMaxCombo(0);
        setWordsDestroyed(0);
        setAccuracy(100);
        setTotalTyped(0);
        setCorrectTyped(0);
        setCountdown(3);
        setGamePhase('countdown');
    };

    // Render menu
    if (gamePhase === 'menu') {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.4),_transparent_55%)]" />
                    <div className="relative text-center">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">🚀 TYPE DEFENDER</h2>
                        <p className="text-slate-200 text-base md:text-lg max-w-2xl mx-auto">
                            Destroy enemy ships by typing their words! Target enemies by typing the first letter
                            of their word, then complete the word to destroy them. Press ENTER to use EMP bombs!
                        </p>
                    </div>
                </div>

                {/* Game instructions and controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 How to Play</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 font-bold">•</span>
                                Type the first letter of a word to target that enemy
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 font-bold">•</span>
                                Complete the word to destroy the enemy ship
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 font-bold">•</span>
                                Don't let enemies reach the bottom!
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-yellow-500 font-bold">•</span>
                                Press ENTER to use EMP bomb (destroys all enemies)
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">⚡ Scoring</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">•</span>
                                Points = Word length × 10
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-500 font-bold">•</span>
                                Combo bonus every 5 words
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500 font-bold">•</span>
                                Higher waves = harder words + more points
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500 font-bold">•</span>
                                Mistakes break your combo!
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Personal Best */}
                {personalBest && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                        <h3 className="text-lg font-bold text-amber-800 mb-3">🏆 Your Best</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-3xl font-black text-amber-600">{personalBest.highScore}</div>
                                <div className="text-sm text-amber-700">High Score</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-amber-600">Wave {personalBest.maxWave}</div>
                                <div className="text-sm text-amber-700">Best Wave</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Start button */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={startGame}
                        className="px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                        🚀 Start Game
                    </button>

                    <button
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                    >
                        {showLeaderboard ? 'Hide Leaderboard' : '📊 Class Leaderboard'}
                    </button>
                </div>

                {/* Class Leaderboard */}
                {showLeaderboard && (
                    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Class Leaderboard</h3>
                        {classLeaderboard.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No scores yet. Be the first to play!</p>
                        ) : (
                            <div className="space-y-2">
                                {classLeaderboard.map((player, index) => (
                                    <div
                                        key={player.id}
                                        className={`flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-gradient-to-r from-amber-100 to-yellow-100' :
                                            index === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100' :
                                                index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50' :
                                                    'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl font-bold">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </span>
                                            <span className="font-semibold text-gray-800">{player.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-indigo-600">{player.score}</div>
                                            <div className="text-xs text-gray-500">Wave {player.wave}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Render countdown
    if (gamePhase === 'countdown') {
        return (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white shadow-2xl p-10 md:p-16">
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,_rgba(255,255,255,0.25),_transparent_70%)]" />
                <div className="relative text-center space-y-6">
                    <p className="uppercase tracking-[0.5em] text-white/70 text-sm">Get Ready!</p>
                    <div className="text-7xl md:text-9xl font-black drop-shadow-lg animate-pulse">{countdown}</div>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                        Position your fingers on the keyboard and prepare to defend!
                    </p>
                </div>
            </div>
        );
    }

    // Render game over
    if (gamePhase === 'gameover') {
        const isNewHighScore = personalBest && score >= personalBest.highScore;

        return (
            <div className="space-y-6">
                <div className={`rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white ${isNewHighScore
                    ? 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500'
                    : 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600'
                    }`}>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_rgba(255,255,255,0.35),_transparent_60%)]" />
                    <div className="relative text-center space-y-4">
                        <p className="uppercase tracking-[0.6em] text-white/70 text-xs">
                            {isNewHighScore ? '🎉 NEW HIGH SCORE!' : 'Game Over'}
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black">
                            {isNewHighScore ? 'LEGENDARY!' : 'Great Run!'}
                        </h2>
                    </div>

                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white/10 rounded-2xl p-4">
                            <div className="text-3xl font-black">{score}</div>
                            <div className="text-sm text-white/70">Score</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4">
                            <div className="text-3xl font-black">{wave}</div>
                            <div className="text-sm text-white/70">Wave</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4">
                            <div className="text-3xl font-black">{wordsDestroyed}</div>
                            <div className="text-sm text-white/70">Words</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4">
                            <div className="text-3xl font-black">{accuracy}%</div>
                            <div className="text-sm text-white/70">Accuracy</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Game Stats</h3>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">x{maxCombo}</div>
                            <div className="text-sm text-gray-500">Best Combo</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-600">{correctTyped}/{totalTyped}</div>
                            <div className="text-sm text-gray-500">Correct Keys</div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={startGame}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        🔄 Play Again
                    </button>
                    <button
                        onClick={() => setGamePhase('menu')}
                        className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                    >
                        📋 Back to Menu
                    </button>
                </div>
            </div>
        );
    }

    // Render game
    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl border-4 border-indigo-900"
                style={{ backgroundColor: '#0a0a1a' }}
            />
            <div className="text-center mt-4 text-sm text-gray-500">
                Type to target enemies • ENTER = EMP Bomb • Click game to focus
            </div>
        </div>
    );
};

export default ZTypeGame;
