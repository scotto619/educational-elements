import React, { useState, useEffect, useRef } from 'react';

const WORD_BANK = [
    { word: 'quickly', isAdverb: true }, { word: 'loudly', isAdverb: true },
    { word: 'happily', isAdverb: true }, { word: 'sadly', isAdverb: true },
    { word: 'quietly', isAdverb: true }, { word: 'slowly', isAdverb: true },
    { word: 'gently', isAdverb: true }, { word: 'angrily', isAdverb: true },
    { word: 'bravely', isAdverb: true }, { word: 'carefully', isAdverb: true },
    { word: 'always', isAdverb: true }, { word: 'never', isAdverb: true },
    { word: 'often', isAdverb: true }, { word: 'rarely', isAdverb: true },
    { word: 'everywhere', isAdverb: true }, { word: 'here', isAdverb: true },
    { word: 'now', isAdverb: true }, { word: 'today', isAdverb: true },
    { word: 'very', isAdverb: true }, { word: 'quite', isAdverb: true },
    { word: 'quick', isAdverb: false }, { word: 'loud', isAdverb: false },
    { word: 'happy', isAdverb: false }, { word: 'sad', isAdverb: false },
    { word: 'quiet', isAdverb: false }, { word: 'slow', isAdverb: false },
    { word: 'gentle', isAdverb: false }, { word: 'angry', isAdverb: false },
    { word: 'red', isAdverb: false }, { word: 'blue', isAdverb: false },
    { word: 'big', isAdverb: false }, { word: 'small', isAdverb: false },
    { word: 'hot', isAdverb: false }, { word: 'cold', isAdverb: false },
    { word: 'strong', isAdverb: false }, { word: 'weak', isAdverb: false }
];

const AdverbAsteroidsGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [asteroids, setAsteroids] = useState([]);
    const [lasers, setLasers] = useState([]);
    const [explosions, setExplosions] = useState([]);
    const [shipPos, setShipPos] = useState({ x: 50, y: 85 });

    const requestRef = useRef();
    const keysPressed = useRef({});
    const lastAsteroidTime = useRef(0);

    const TARGET_SCORE = 15;
    const ASTEROID_SPAWN_RATE = 1500;

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setAsteroids([]);
        setLasers([]);
        setExplosions([]);
        setShipPos({ x: 50, y: 85 });
        keysPressed.current = {};
        lastAsteroidTime.current = performance.now();
    };

    useEffect(() => {
        if (gameState !== 'playing') return;

        const handleKeyDown = (e) => {
            keysPressed.current[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault();
                setLasers(prev => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    x: shipPos.x,
                    y: shipPos.y - 5
                }]);
            }
        };

        const handleKeyUp = (e) => {
            keysPressed.current[e.key] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, shipPos]);

    const updateGame = (time) => {
        if (gameState !== 'playing') return;

        setShipPos(prev => {
            let newX = prev.x;
            const SPEED = 0.8;
            if (keysPressed.current['ArrowLeft'] && prev.x > 5) newX -= SPEED;
            if (keysPressed.current['ArrowRight'] && prev.x < 95) newX += SPEED;
            return { ...prev, x: newX };
        });

        setLasers(prev => prev.map(l => ({ ...l, y: l.y - 3 })).filter(l => l.y > 0));

        if (time - lastAsteroidTime.current > ASTEROID_SPAWN_RATE) {
            const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
            const randomX = 10 + Math.random() * 80;
            setAsteroids(prev => [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                x: randomX,
                y: -10,
                word: randomWord.word,
                isAdverb: randomWord.isAdverb,
                speed: 0.15 + Math.random() * 0.2
            }]);
            lastAsteroidTime.current = time;
        }

        setAsteroids(prev => prev.map(a => ({ ...a, y: a.y + a.speed })).filter(a => a.y < 110));

        let hitAsteroids = new Set();
        let hitLasers = new Set();
        let pointsToAdd = 0;
        let healthLost = false;

        // Compare current states
        setLasers(currentLasers => {
            setAsteroids(currentAsteroids => {
                currentLasers.forEach(laser => {
                    currentAsteroids.forEach(asteroid => {
                        const dx = Math.abs(laser.x - asteroid.x);
                        const dy = Math.abs(laser.y - asteroid.y);

                        if (dx < 6 && dy < 6) {
                            hitAsteroids.add(asteroid.id);
                            hitLasers.add(laser.id);
                            setExplosions(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), x: asteroid.x, y: asteroid.y }]);

                            if (asteroid.isAdverb) {
                                pointsToAdd += 1;
                            } else {
                                healthLost = true;
                            }
                        }
                    });
                });

                if (pointsToAdd > 0) {
                    setScore(s => {
                        const newScore = s + pointsToAdd;
                        if (newScore >= TARGET_SCORE) setGameState('won');
                        return newScore;
                    });
                }
                if (healthLost) {
                    setScore(s => Math.max(0, s - 2));
                }

                return currentAsteroids.filter(a => !hitAsteroids.has(a.id));
            });
            return currentLasers.filter(l => !hitLasers.has(l.id));
        });

        setExplosions(prev => prev.filter(() => Math.random() > 0.05));

        requestRef.current = requestAnimationFrame(updateGame);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300 font-sans select-none">
            {/* Glassmorphic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[600px] md:h-[700px] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-indigo-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white z-20 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🚀</span>
                        <h3 className="font-black text-2xl tracking-tight">Adverb Asteroids</h3>
                    </div>
                    {gameState === 'playing' && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold uppercase tracking-wider text-indigo-200">Score</span>
                            <span className="text-2xl font-black text-white">{score} / {TARGET_SCORE}</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Game Canvas container */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-950 to-indigo-950">
                    {/* Star Background Parallax */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                    {gameState === 'start' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-30">
                            <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 max-w-md text-center shadow-2xl transform transition-transform hover:scale-105 duration-300">
                                <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-4xl">
                                    ☄️
                                </div>
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Space Defender</h3>
                                <p className="text-slate-300 mb-8 font-medium">
                                    Defend the galaxy from modifier asteroids! <br /><br />
                                    <span className="text-emerald-400 font-bold">SHOOT words that are ADVERBS (how, when, where).</span><br />
                                    <span className="text-rose-400 font-bold">AVOID words that are ADJECTIVES.</span><br /><br />
                                    Use <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Left/Right</kbd> to move and <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Space</kbd> or <kbd className="bg-slate-700 px-2 py-1 rounded text-white">Up</kbd> to fire!
                                </p>
                                <button
                                    onClick={startGame}
                                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
                                >
                                    START MISSION
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'won' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/90 backdrop-blur-md z-30 animate-in fade-in duration-500">
                            <div className="bg-white p-8 rounded-3xl max-w-md text-center shadow-2xl transform animate-in zoom-in-50 duration-500">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl">
                                    🌟
                                </div>
                                <h3 className="text-3xl font-black text-slate-800 mb-2">Galaxy Saved!</h3>
                                <p className="text-slate-500 mb-8 max-w-[250px] mx-auto">
                                    You correctly identified all the adverbs and saved the English language.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={startGame}
                                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                                    >
                                        Play Again
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1"
                                    >
                                        Back to Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Game Elements Render */}
                    {/* Ship */}
                    <div
                        className="absolute bottom-4 w-12 h-16 transform -translate-x-1/2 flex flex-col items-center justify-end z-20 transition-transform duration-75"
                        style={{ left: `${shipPos.x}%`, top: `${shipPos.y}%` }}
                    >
                        <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🚀</div>
                        {/* Thruster flame */}
                        <div className="w-2 h-4 bg-orange-500 rounded-full mt-1 animate-pulse blur-[2px]"></div>
                    </div>

                    {/* Lasers */}
                    {lasers.map(laser => (
                        <div
                            key={laser.id}
                            className="absolute w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee] transform -translate-x-1/2 z-10"
                            style={{ left: `${laser.x}%`, top: `${laser.y}%` }}
                        />
                    ))}

                    {/* Asteroids */}
                    {asteroids.map(asteroid => (
                        <div
                            key={asteroid.id}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
                            style={{ left: `${asteroid.x}%`, top: `${asteroid.y}%` }}
                        >
                            <div className="relative flex items-center justify-center">
                                <div className={`w-36 h-16 sm:w-40 sm:h-20 rounded-full bg-slate-700 shadow-inner flex items-center justify-center border-4 ${asteroid.isAdverb ? 'border-slate-500' : 'border-rose-900/50'}`}>
                                    <span className={`font-black text-sm sm:text-lg tracking-wide ${asteroid.isAdverb ? 'text-white' : 'text-slate-300'}`}>
                                        {asteroid.word}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Explosions */}
                    {explosions.map(exp => (
                        <div
                            key={exp.id}
                            className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 z-[15] flex items-center justify-center pointer-events-none"
                            style={{ left: `${exp.x}%`, top: `${exp.y}%` }}
                        >
                            <div className="absolute w-full h-full bg-orange-500 rounded-full animate-ping opacity-75"></div>
                            <div className="absolute w-1/2 h-1/2 bg-yellow-400 rounded-full animate-ping opacity-100" style={{ animationDuration: '0.5s' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdverbAsteroidsGame;
