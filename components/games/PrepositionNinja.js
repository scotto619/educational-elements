import React, { useState, useEffect, useRef } from 'react';
import { shuffleArray } from '../../utils/gameHelpers';

const WORD_BANK = [
    // Prepositions (Targets to Slice!)
    { word: 'in', isPreposition: true },
    { word: 'on', isPreposition: true },
    { word: 'under', isPreposition: true },
    { word: 'over', isPreposition: true },
    { word: 'behind', isPreposition: true },
    { word: 'between', isPreposition: true },
    { word: 'next to', isPreposition: true },
    { word: 'beside', isPreposition: true },
    { word: 'above', isPreposition: true },
    { word: 'below', isPreposition: true },
    { word: 'through', isPreposition: true },
    { word: 'across', isPreposition: true },
    { word: 'around', isPreposition: true },
    { word: 'into', isPreposition: true },
    { word: 'onto', isPreposition: true },
    { word: 'toward', isPreposition: true },
    { word: 'from', isPreposition: true },
    { word: 'to', isPreposition: true },
    { word: 'with', isPreposition: true },
    { word: 'without', isPreposition: true },
    { word: 'before', isPreposition: true },
    { word: 'after', isPreposition: true },
    { word: 'during', isPreposition: true },
    { word: 'since', isPreposition: true },
    { word: 'until', isPreposition: true },
    { word: 'about', isPreposition: true },

    // Non-Prepositions (Hazards!) - Nouns, Verbs, Adjectives run amok
    { word: 'run', isPreposition: false },
    { word: 'jump', isPreposition: false },
    { word: 'happy', isPreposition: false },
    { word: 'blue', isPreposition: false },
    { word: 'cat', isPreposition: false },
    { word: 'dog', isPreposition: false },
    { word: 'tree', isPreposition: false },
    { word: 'house', isPreposition: false },
    { word: 'quickly', isPreposition: false }, // adverb
    { word: 'slowly', isPreposition: false },
    { word: 'beautiful', isPreposition: false },
    { word: 'sing', isPreposition: false },
    { word: 'dance', isPreposition: false },
    { word: 'apple', isPreposition: false },
    { word: 'banana', isPreposition: false },
    { word: 'tall', isPreposition: false },
    { word: 'short', isPreposition: false },
    { word: 'funny', isPreposition: false },
    { word: 'sad', isPreposition: false },
    { word: 'play', isPreposition: false },
    { word: 'read', isPreposition: false },
    { word: 'write', isPreposition: false },
    { word: 'car', isPreposition: false },
    { word: 'bus', isPreposition: false },
    { word: 'train', isPreposition: false },
    { word: 'smart', isPreposition: false }
];


const PrepositionNinja = ({ onComplete }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won, lost
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [words, setWords] = useState([]);
    const [slashes, setSlashes] = useState([]);

    const gameAreaRef = useRef(null);
    const requestRef = useRef();
    const lastSpawnTime = useRef(0);
    const isMouseDown = useRef(false);

    // Track mouse path for slicing
    const mousePath = useRef([]);

    const TARGET_SCORE = 20;
    const SPAWN_RATE = 1200; // ms between spawns

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setLives(3);
        setWords([]);
        setSlashes([]);
        lastSpawnTime.current = performance.now();
        mousePath.current = [];
    };

    // --- Input Handling ---
    const handlePointerDown = (e) => {
        isMouseDown.current = true;
        updateMousePath(e);
    };

    const handlePointerMove = (e) => {
        if (!isMouseDown.current) return;
        updateMousePath(e);
        checkSlices();
    };

    const handlePointerUp = () => {
        isMouseDown.current = false;
        mousePath.current = [];
    };

    const updateMousePath = (e) => {
        if (!gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();

        // Handle touches or mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;

        mousePath.current.push({ x, y, time: performance.now() });

        // Keep path short (only last ~100ms)
        const now = performance.now();
        mousePath.current = mousePath.current.filter(p => now - p.time < 150);

        // Add visual slash
        if (mousePath.current.length > 1) {
            const p1 = mousePath.current[mousePath.current.length - 2];
            const p2 = mousePath.current[mousePath.current.length - 1];
            setSlashes(prev => [...prev, {
                id: Math.random().toString(),
                x1: p1.x, y1: p1.y,
                x2: p2.x, y2: p2.y,
                time: now
            }]);
        }
    };

    const checkSlices = () => {
        if (mousePath.current.length < 2) return;
        const latestPoint = mousePath.current[mousePath.current.length - 1];

        setWords(currentWords => {
            let hitAny = false;
            let pointsGained = 0;
            let lifeLost = false;

            const newWords = currentWords.map(word => {
                if (word.sliced) return word;

                // Simple distance check: if mouse is within 6% of center of word
                const dx = word.x - latestPoint.x;
                const dy = word.y - latestPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 8) { // IT'S A HIT
                    hitAny = true;
                    if (word.isPreposition) {
                        pointsGained++;
                    } else {
                        lifeLost = true;
                    }
                    return { ...word, sliced: true, sliceTime: performance.now() };
                }
                return word;
            });

            if (hitAny) {
                if (pointsGained > 0) {
                    setScore(s => {
                        const newScore = s + pointsGained;
                        if (newScore >= TARGET_SCORE) {
                            // Delay slightly so player sees the slice before winning screen
                            setTimeout(() => setGameState('won'), 500);
                        }
                        return newScore;
                    });
                }
                if (lifeLost) {
                    setLives(l => {
                        const newLives = l - 1;
                        if (newLives <= 0) {
                            setTimeout(() => setGameState('lost'), 500);
                        }
                        return newLives;
                    });
                }
            }

            return hitAny ? newWords : currentWords;
        });
    };


    // --- Game Loop ---
    const updateGame = (time) => {
        if (gameState !== 'playing') return;

        // 1. Spawning
        if (time - lastSpawnTime.current > SPAWN_RATE) {
            const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

            // Random start position at bottom (20% to 80% width)
            const startX = 20 + Math.random() * 60;

            // Arc trajectory
            // Velocity X: leans towards center. If starting left, move right.
            const vx = startX < 50 ? (1 + Math.random() * 2) : -(1 + Math.random() * 2);
            // Velocity Y: strong upward (negative is up)
            const vy = -(3.5 + Math.random() * 1.5);

            setWords(prev => [...prev, {
                id: Math.random().toString(),
                word: randomWord.word,
                isPreposition: randomWord.isPreposition,
                x: startX,
                y: 110, // Start below screen
                vx: vx,
                vy: vy,
                sliced: false,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 4
            }]);

            lastSpawnTime.current = time;
        }

        // 2. Movement & Physics
        setWords(prev => {
            const GRAVITY = 0.05;

            return prev.map(word => {
                if (word.sliced) {
                    // Fall apart physics if sliced
                    return {
                        ...word,
                        y: word.y + 2, // Fall straight down fast
                        rotation: word.rotation + (word.rotSpeed * 2)
                    };
                }

                // Normal arcing physics
                const newVy = word.vy + GRAVITY;
                const newX = word.x + (word.vx * 0.2); // Scaling down velocity for screen %
                const newY = word.y + (newVy * 0.4);

                return {
                    ...word,
                    x: newX,
                    y: newY,
                    vy: newVy,
                    rotation: word.rotation + word.rotSpeed
                };
            }).filter(word => word.y < 120); // Remove if fallen way off bottom
        });

        // 3. Fade out slashes
        setSlashes(prev => {
            const now = performance.now();
            return prev.filter(s => now - s.time < 300); // Slashes last 300ms
        });

        requestRef.current = requestAnimationFrame(updateGame);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);


    // --- UI Render ---
    if (gameState === 'start') {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 rounded-3xl p-8 text-center shadow-inner border-2 border-red-100 max-w-4xl mx-auto">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-red-50 transform hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                        🥷
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Preposition Ninja</h2>
                    <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                        Prepositions show direction, location, or time (e.g., <span className="font-bold">in, on, under</span>). <br /><br />
                        <span className="text-emerald-600 font-black">SLICE</span> the prepositions that pop up! <br />
                        <span className="text-rose-600 font-black">AVOID</span> slicing other words, or you lose a life!
                    </p>
                    <button
                        onClick={startGame}
                        className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(220,38,38,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                    >
                        START TRAINING
                    </button>
                    <p className="mt-4 text-sm font-bold text-slate-400">Slice {TARGET_SCORE} prepositions to earn your black belt.</p>
                </div>
            </div>
        );
    }

    if (gameState === 'won' || gameState === 'lost') {
        const isWin = gameState === 'won';
        return (
            <div className={`w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br ${isWin ? 'from-emerald-50 to-teal-100 border-emerald-100' : 'from-rose-50 to-red-100 border-rose-100'} rounded-3xl p-8 text-center shadow-inner border-2 max-w-4xl mx-auto`}>
                <div className={`bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border ${isWin ? 'border-emerald-50' : 'border-rose-50'} animate-in zoom-in duration-500`}>
                    <div className={`w-24 h-24 ${isWin ? 'bg-emerald-100' : 'bg-rose-100'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl`}>
                        {isWin ? '🥋' : '💥'}
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                        {isWin ? 'Black Belt Earned!' : 'Training Failed!'}
                    </h2>
                    <p className="text-slate-600 mb-8 text-lg font-medium">
                        {isWin
                            ? `Masterful slicing! You successfully identified ${TARGET_SCORE} prepositions.`
                            : `You sliced too many incorrect words! You got ${score} before losing your lives. Remember to only slice words that show location, direction, or time.`
                        }
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-colors border border-slate-200"
                        >
                            {isWin ? 'Play Again' : 'Try Again'}
                        </button>
                        {isWin && (
                            <button
                                onClick={onComplete}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Continue Learning
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-full h-[600px] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-slate-700 max-w-4xl mx-auto select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            style={{ touchAction: 'none' }} // Prevent scrolling on mobile while slicing
        >
            {/* Header HUD */}
            <div className="h-16 flex items-center justify-between px-8 bg-black/40 backdrop-blur-sm z-20 border-b border-white/10 pointer-events-none absolute top-0 w-full">
                <div className="flex items-center gap-4">
                    <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">🥷</span>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Ninja</h2>
                </div>

                <div className="flex items-center gap-8">
                    {/* Lives */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3].map(heartNum => (
                            <span key={heartNum} className={`text-2xl transition-all duration-300 ${heartNum <= lives ? 'text-rose-500 scale-100' : 'text-slate-700 scale-75 blur-[1px]'}`}>
                                ❤️
                            </span>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-white/20"></div>

                    {/* Score */}
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Score</span>
                        <div className="flex items-end gap-1 mt-1">
                            <span className="text-2xl font-black text-red-400 leading-none">{score}</span>
                            <span className="text-sm font-bold text-slate-500 leading-none mb-[2px]">/ {TARGET_SCORE}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Game Canvas container */}
            <div ref={gameAreaRef} className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] bg-slate-800 touch-none">

                {/* Dojo Dojo Background Elements */}
                <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>

                {/* Draw Slashes */}
                {slashes.map(s => {
                    const length = Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2));
                    const angle = Math.atan2(s.y2 - s.y1, s.x2 - s.x1) * 180 / Math.PI;

                    return (
                        <div
                            key={s.id}
                            className="absolute bg-white/80 rounded-full origin-left shadow-[0_0_10px_#fff]"
                            style={{
                                left: `${s.x1}%`,
                                top: `${s.y1}%`,
                                width: `${length}%`,
                                height: '2px',
                                transform: `rotate(${angle}deg)`,
                                transition: 'opacity 0.3s ease-out',
                                opacity: (300 - (performance.now() - s.time)) / 300 // Fade out over 300ms
                            }}
                        />
                    );
                })}

                {/* Draw Words */}
                {words.map(word => {
                    if (word.sliced) {
                        // Render Sliced Halves
                        return (
                            <div key={word.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${word.x}%`, top: `${word.y}%` }}>
                                <div className="flex flex-col gap-1 items-center">
                                    <div className="text-xl font-black uppercase tracking-widest opacity-50 text-white translate-y-2 -rotate-12 blur-[1px]">
                                        {word.word.substring(0, Math.ceil(word.word.length / 2))}
                                    </div>
                                    <div className="text-xl font-black uppercase tracking-widest opacity-50 text-white -translate-y-2 rotate-12 blur-[1px]">
                                        {word.word.substring(Math.ceil(word.word.length / 2))}
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-150 animate-ping"></div>
                            </div>
                        )
                    }

                    // Normal Render
                    return (
                        <div
                            key={word.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 py-3 px-6 rounded-2xl border-4 font-black text-2xl uppercase tracking-widest shadow-xl flex items-center justify-center select-none
                                ${word.isPreposition ? 'bg-indigo-900 border-indigo-400 text-indigo-100' : 'bg-amber-900 border-amber-600 text-amber-100'}
                            `}
                            style={{
                                left: `${word.x}%`,
                                top: `${word.y}%`,
                                transform: `translate(-50%, -50%) rotate(${word.rotation}deg)`
                            }}
                        >
                            {word.word}
                            {/* Add an inner glow shadow for depth */}
                            <div className="absolute inset-0 rounded-xl shadow-inner pointer-events-none border border-white/10"></div>
                        </div>
                    );
                })}
            </div>

            {/* Hint overlay at bottom */}
            <div className="absolute bottom-4 w-full text-center pointer-events-none">
                <span className="bg-black/50 text-white/50 px-4 py-2 rounded-full font-bold text-sm tracking-widest backdrop-blur-sm">DRAG TO SLICE</span>
            </div>

        </div>
    );
};

export default PrepositionNinja;
