// components/games/CoordinateQuestGame.js - Space Themed Coordinate Game
import React, { useState, useEffect, useRef, useCallback } from 'react';

const CoordinateQuestGame = ({ showToast, difficulty: initialDifficulty }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Game State
    const [target, setTarget] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
    const [highScore, setHighScore] = useState(0);

    // Constants
    const AXIS_COLOR = '#4ecdc4';
    const GRID_COLOR = 'rgba(78, 205, 196, 0.2)';
    const MOUSE_COLOR = '#ffe66d';

    // Initialize Game
    const startGame = () => {
        setIsActive(true);
        setScore(0);
        setStreak(0);
        setTimeLeft(60);
        setFeedback(null);
        generateTarget();
    };

    const stopGame = () => {
        setIsActive(false);
        if (score > highScore) {
            setHighScore(score);
            showToast(`New High Score: ${score}!`, 'success');
        }
    };

    // Generate a random target based on difficulty
    const generateTarget = useCallback(() => {
        let min, max;

        switch (difficulty) {
            case 'easy': // Quadrant 1 only (0 to 10)
                min = 0;
                max = 10;
                break;
            case 'medium': // 4 Quadrants (-10 to 10)
                min = -10;
                max = 10;
                break;
            case 'hard': // 4 Quadrants (-15 to 15)
                min = -15;
                max = 15;
                break;
            default:
                min = 0;
                max = 10;
        }

        // Ensure we don't pick (0,0) too often or same point twice
        let newX, newY;
        do {
            newX = Math.floor(Math.random() * (max - min + 1)) + min;
            newY = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (newX === target.x && newY === target.y);

        setTarget({ x: newX, y: newY });
    }, [difficulty, target]);

    // Timer Effect
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            stopGame();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Drawing Logic
    const draw = useCallback((mouseX, mouseY) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.fillStyle = '#0f172a'; // Dark space background
        ctx.fillRect(0, 0, width, height);

        // Calculate grid properties
        let range = 10;
        if (difficulty === 'hard') range = 15;
        if (difficulty === 'easy') {
            range = 10;
        }

        const outputRange = range + 1; // Add some padding
        const cellSize = Math.min(width, height) / (outputRange * 2);
        const centerX = width / 2;
        const centerY = height / 2;

        // Draw Starfield Background (static for now, could animate)
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (Math.sin(i * 132.1) * 43758.5453) % width;
            const y = (Math.cos(i * 432.1) * 23421.5231) % height;
            ctx.globalAlpha = Math.random() * 0.5 + 0.1;
            ctx.fillRect(Math.abs(x), Math.abs(y), 1 + Math.random(), 1 + Math.random());
        }
        ctx.globalAlpha = 1.0;


        // Helper to convert grid coord to pixel coord
        const gridToPixel = (gx, gy) => ({
            x: centerX + (gx * cellSize),
            y: centerY - (gy * cellSize)
        });

        // Draw Grid Lines
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 1;

        for (let i = -range; i <= range; i++) {
            // Vertical lines
            const xProps = gridToPixel(i, 0);
            ctx.beginPath();
            ctx.moveTo(xProps.x, 0);
            ctx.lineTo(xProps.x, height);
            ctx.stroke();

            // Horizontal lines
            const yProps = gridToPixel(0, i);
            ctx.beginPath();
            ctx.moveTo(0, yProps.y);
            ctx.lineTo(width, yProps.y);
            ctx.stroke();
        }

        // Draw Axes
        ctx.strokeStyle = AXIS_COLOR;
        ctx.lineWidth = 3;

        // X Axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Y Axis
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();

        // Draw Labels
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = -range; i <= range; i += (range > 10 ? 5 : 1)) {
            if (i === 0) continue; // Skip 0
            const pX = gridToPixel(i, 0);
            const pY = gridToPixel(0, i);

            // X Axis Labels
            ctx.fillText(i.toString(), pX.x, centerY + 15);

            // Y Axis Labels
            ctx.fillText(i.toString(), centerX - 15, pY.y);
        }
        ctx.fillText("0", centerX - 10, centerY + 15);


        // Highlight Mouse Position if active
        if (isActive && mouseX !== null && mouseY !== null) {
            // Snap to nearest grid point
            // local coord relative to center
            const localX = mouseX - centerX;
            const localY = mouseY - centerY;

            const gridX = Math.round(localX / cellSize);
            const gridY = Math.round(-localY / cellSize); // Y is inverted in canvas

            const snapX = centerX + (gridX * cellSize);
            const snapY = centerY - (gridY * cellSize);

            // Draw Cursor Highlight
            ctx.fillStyle = MOUSE_COLOR;
            ctx.beginPath();
            ctx.arc(snapX, snapY, 5, 0, Math.PI * 2);
            ctx.fill();

            // Draw Coordinates near mouse
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter';
            ctx.fillText(`(${gridX}, ${gridY})`, mouseX + 20, mouseY - 20);

            return { gridX, gridY };
        }

        return null;

    }, [difficulty, isActive, target]); // Dependencies for draw function


    // Handle Mouse Move
    const handleMouseMove = (e) => {
        if (!isActive) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Trigger redraw with mouse pos
        draw(x, y);
    };

    // Handle Click
    const handleClick = (e) => {
        if (!isActive) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get grid coords from draw function (it returns them)
        const coords = draw(x, y);

        if (coords) {
            checkAnswer(coords.gridX, coords.gridY);
        }
    };

    const checkAnswer = (x, y) => {
        if (x === target.x && y === target.y) {
            // Correct!
            const bonus = Math.max(10, 20 - Math.floor((60 - timeLeft) / 5)); // Speed bonus (placeholder calc)
            const points = 100 + (streak * 10);

            setScore(s => s + points);
            setStreak(s => s + 1);
            setFeedback({ type: 'correct', message: 'Nice Shot!', points });
            showToast('Correct! Target Neutralized', 'success');
            generateTarget();
        } else {
            // Incorrect
            setStreak(0);
            setFeedback({ type: 'incorrect', message: 'Missed!', correct: target });
            showToast('Missed! Check your coordinates.', 'error');
            // Penalty?
            setTimeLeft(t => Math.max(0, t - 5));
        }

        setTimeout(() => setFeedback(null), 1500);
    };

    // Initial Draw & Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                const size = Math.min(containerRef.current.clientWidth, 500);
                canvasRef.current.width = size;
                canvasRef.current.height = size;
                draw(null, null);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [draw]);

    // Redraw when target changes or just periodically for animations
    useEffect(() => {
        draw(null, null);
    }, [target, draw]);


    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-6xl mx-auto">
            {/* Game Area */}
            <div className="flex-1 flex flex-col items-center">
                {/* Target Indicator - Moved outside to prevent blocking */}
                {isActive && (
                    <div className="mb-4 bg-gray-900/90 px-8 py-3 rounded-2xl border-2 border-cyan-500/50 text-cyan-400 font-mono text-2xl shadow-xl flex items-center gap-3 backdrop-blur-sm z-10">
                        <span className="text-gray-400 text-base font-sans font-bold tracking-wider uppercase">Target</span>
                        <span className="text-white font-bold tracking-widest">({target.x}, {target.y})</span>
                    </div>
                )}

                <div className="w-full max-w-[500px] aspect-square bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative border-4 border-indigo-500" ref={containerRef}>
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair"
                        onMouseMove={handleMouseMove}
                        onClick={handleClick}
                    />

                    {!isActive && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-6 text-center backdrop-blur-sm z-10">
                            <h2 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                                Coordinate Quest
                            </h2>
                            <p className="mb-6 text-gray-300">Locate the hidden targets in the galaxy!</p>

                            <div className="flex gap-4 mb-6">
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    className="bg-gray-800 text-white border border-gray-600 rounded px-4 py-2"
                                >
                                    <option value="easy">Cadet (Quadrant 1)</option>
                                    <option value="medium">Scout (4 Quadrants)</option>
                                    <option value="hard">Commander (Large Grid)</option>
                                </select>
                            </div>

                            <button
                                onClick={startGame}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-lg hover:shadow-cyan-500/20"
                            >
                                Launch Mission 🚀
                            </button>
                        </div>
                    )}

                    {/* HUD Overlay */}
                    {isActive && (
                        <>
                            {/* Feedback Overlay */}
                            {feedback && (
                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-xl font-bold text-2xl animate-bounce shadow-xl z-20 pointer-events-none ${feedback.type === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                    {feedback.message}
                                    {feedback.type === 'correct' && <div className="text-sm font-normal text-green-100">+{feedback.points} pts</div>}
                                    {feedback.type === 'incorrect' && <div className="text-sm font-normal text-red-100">Target was at ({feedback.correct.x}, {feedback.correct.y})</div>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Sidebar Controls & Stats */}
            <div className="w-full lg:w-80 space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📊</span> Mission Stats
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-sm text-blue-600 font-semibold">Score</div>
                            <div className="text-2xl font-bold text-blue-800">{score}</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-sm text-purple-600 font-semibold">Streak</div>
                            <div className="text-2xl font-bold text-purple-800">{streak} 🔥</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="text-sm text-orange-600 font-semibold">Time</div>
                            <div className={`text-2xl font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-orange-800'}`}>
                                {timeLeft}s
                            </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-sm text-green-600 font-semibold">High Score</div>
                            <div className="text-2xl font-bold text-green-800">{highScore}</div>
                        </div>
                    </div>

                    {isActive && (
                        <button
                            onClick={stopGame}
                            className="w-full mt-6 py-3 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                        >
                            Abort Mission
                        </button>
                    )}
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                    <h3 className="font-bold text-indigo-900 mb-2">How to Play</h3>
                    <ul className="text-sm text-indigo-800 space-y-2 list-disc pl-4">
                        <li>Look at the <strong>TARGET</strong> coordinates at the top.</li>
                        <li>Find that point on the grid.</li>
                        <li><strong>(X, Y)</strong> means moves Right/Left first (X), then Up/Down (Y).</li>
                        <li>Click accurately to score points!</li>
                        <li>Be fast to keep your streak alive!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CoordinateQuestGame;
