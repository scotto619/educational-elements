import React, { useState, useEffect, useRef } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const WORD_BANK = [
    // Interjections
    { word: 'Wow!', isInterjection: true },
    { word: 'Ouch!', isInterjection: true },
    { word: 'Yay!', isInterjection: true },
    { word: 'Oops!', isInterjection: true },
    { word: 'Uh-oh!', isInterjection: true },
    { word: 'Phew!', isInterjection: true },
    { word: 'Hey!', isInterjection: true },
    { word: 'Oh!', isInterjection: true },
    { word: 'Ah!', isInterjection: true },
    { word: 'Ew!', isInterjection: true },
    { word: 'Yuck!', isInterjection: true },
    { word: 'Aha!', isInterjection: true },
    { word: 'Brr!', isInterjection: true },
    { word: 'Shh!', isInterjection: true },
    { word: 'Hmm...', isInterjection: true },
    { word: 'Yikes!', isInterjection: true },
    { word: 'Hooray!', isInterjection: true },

    // Non-Interjections (Nouns, Verbs, Adjectives, etc.)
    { word: 'Run', isInterjection: false },
    { word: 'Jump', isInterjection: false },
    { word: 'Happy', isInterjection: false },
    { word: 'Blue', isInterjection: false },
    { word: 'Cat', isInterjection: false },
    { word: 'Dog', isInterjection: false },
    { word: 'Tree', isInterjection: false },
    { word: 'House', isInterjection: false },
    { word: 'Quickly', isInterjection: false },
    { word: 'Beautiful', isInterjection: false },
    { word: 'Sing', isInterjection: false },
    { word: 'Apple', isInterjection: false },
    { word: 'Smart', isInterjection: false },
    { word: 'Funny', isInterjection: false },
    { word: 'Car', isInterjection: false },
    { word: 'Because', isInterjection: false },
    { word: 'With', isInterjection: false }
];

const InterjectionPopGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won, lost
    const [score, setScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(60);
    const [balloons, setBalloons] = useState([]);

    // Feedback pops up exactly where the user clicked
    const [feedback, setFeedback] = useState([]); // { id, x, y, text, isPositive }

    const timerRef = useRef(null);
    const gameAreaRef = useRef(null);
    const lastSpawnTime = useRef(0);
    const requestRef = useRef();

    const TARGET_SCORE = 20;
    const SPAWN_INTERVAL = 800; // ms

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeRemaining(60);
        setBalloons([]);
        setFeedback([]);
        lastSpawnTime.current = performance.now();

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setGameState('lost'); // Time's up
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // --- Physics and Spawning Loop ---
    const updateGame = (time) => {
        if (gameState !== 'playing') return;

        // 1. Spawning
        if (time - lastSpawnTime.current > SPAWN_INTERVAL) {
            const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

            // Random start position at bottom X (10% to 90%)
            const startX = 10 + Math.random() * 80;
            // Float upward speed
            const floatSpeed = 0.5 + Math.random() * 1.5;
            // Wobble attributes
            const wobbleOffset = Math.random() * Math.PI * 2;
            const wobbleSpeed = 0.02 + Math.random() * 0.03;
            const colorHue = Math.floor(Math.random() * 360);

            setBalloons(prev => [...prev, {
                id: Math.random().toString(),
                word: randomWord.word,
                isInterjection: randomWord.isInterjection,
                x: startX,
                baseX: startX,
                y: 110, // Start below bottom edge
                speedY: floatSpeed,
                wobbleOffset: wobbleOffset,
                wobbleSpeed: wobbleSpeed,
                hue: colorHue,
                popping: false
            }]);

            lastSpawnTime.current = time;
        }

        // 2. Movement
        setBalloons(prev => {
            return prev.map(b => {
                if (b.popping) return b;

                // Wobble effect
                const newWobble = b.wobbleOffset + b.wobbleSpeed;
                const newX = b.baseX + Math.sin(newWobble) * 5; // Wobble back and forth 5%
                const newY = b.y - b.speedY;

                return {
                    ...b,
                    x: newX,
                    y: newY,
                    wobbleOffset: newWobble
                };
            }).filter(b => b.y > -20); // Keep if they haven't floated totally off top
        });

        // 3. Clear old feedback
        setFeedback(prev => prev.filter(f => time - f.time < 1000));

        requestRef.current = requestAnimationFrame(updateGame);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateGame);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);


    // --- Interactions ---
    const handleBalloonClick = (e, balloon) => {
        e.stopPropagation(); // prevent clicking game area
        if (balloon.popping) return;

        const isCorrect = balloon.isInterjection;

        // Find click coords for feedback
        const rect = gameAreaRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const clickX = ((clientX - rect.left) / rect.width) * 100;
        const clickY = ((clientY - rect.top) / rect.height) * 100;

        // Popping visual state
        setBalloons(prev => prev.map(b =>
            b.id === balloon.id ? { ...b, popping: true } : b
        ));

        // Let animation play, then remove
        setTimeout(() => {
            setBalloons(prev => prev.filter(b => b.id !== balloon.id));
        }, 300); // .pop animation duration

        if (isCorrect) {
            setScore(s => {
                const newScore = s + 1;
                if (newScore >= TARGET_SCORE) {
                    clearInterval(timerRef.current);
                    setTimeout(() => setGameState('won'), 500);
                }
                return newScore;
            });
            setFeedback(prev => [...prev, {
                id: Math.random().toString(),
                x: clickX, y: clickY,
                text: '+1', isPositive: true, time: performance.now()
            }]);
        } else {
            // Negative feedback, maybe a small time penalty?
            setTimeRemaining(prev => Math.max(0, prev - 3));
            setFeedback(prev => [...prev, {
                id: Math.random().toString(),
                x: clickX, y: clickY,
                text: '-3s', isPositive: false, time: performance.now()
            }]);
            // Add brief screen shake here? (complex from child)
        }
    };


    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-100 rounded-3xl p-8 text-center shadow-inner border-2 border-purple-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-purple-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🎈
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Interjection Pop!</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            Interjections are short words showing strong emotion (e.g., <span className="font-bold">Ouch! Wow! Yay!</span>). <br /><br />
                            <span className="text-purple-600 font-black">POP</span> the balloons carrying Interjections as fast as you can! <br />
                            <span className="text-rose-600 font-black">AVOID</span> other words, or you lose time!
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(168,85,247,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START POPPING
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Pop {TARGET_SCORE} interjections before time runs out.</p>
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
                            {isWin ? '🎉' : '⏰'}
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                            {isWin ? 'Pop-tastic!' : 'Time\'s Up!'}
                        </h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            {isWin
                                ? `Wow! You popped ${TARGET_SCORE} interjections with ${timeRemaining} seconds left. Great reflexes!`
                                : `You popped ${score} out of ${TARGET_SCORE} before time ran out. Be careful not to pop the regular words—they steal your time!`
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
                                    onClick={onClose}
                                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(147,51,234,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    Back to Map
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-[600px] flex flex-col bg-sky-50 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-sky-100 max-w-4xl mx-auto select-none">

                {/* Header HUD */}
                <div className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-sky-200 z-20 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl shadow-inner animate-pulse">
                            📍
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Pop!</h2>
                            <p className="text-sm font-semibold text-slate-500">Need {TARGET_SCORE}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Timer */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</span>
                            <span className={`text-3xl font-black leading-none ${timeRemaining <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                                {timeRemaining}s
                            </span>
                        </div>

                        <div className="w-px h-10 bg-slate-200"></div>

                        {/* Score */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-purple-600 leading-none">{score}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Canvas container */}
                <div
                    ref={gameAreaRef}
                    className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-sky-100 touch-none cursor-crosshair"
                // No click handler on the container so they ONLY hit balloons or nothing happens
                >

                    {/* Floating Clouds (Scenery) */}
                    <div className="absolute top-10 left-10 text-6xl opacity-40 mix-blend-overlay">☁️</div>
                    <div className="absolute top-32 right-20 text-5xl opacity-30 mix-blend-overlay">☁️</div>
                    <div className="absolute top-1/2 left-1/3 text-7xl opacity-20 mix-blend-overlay">☁️</div>


                    {/* Balloons */}
                    {balloons.map(balloon => {
                        if (balloon.popping) {
                            return (
                                <div
                                    key={balloon.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-purple-600 z-10 animate-ping opacity-0"
                                    style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
                                >
                                    💥
                                </div>
                            )
                        }

                        // The Balloon visual
                        return (
                            <div
                                key={balloon.id}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 hover:scale-110 transition-transform flex flex-col items-center group"
                                style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
                                onPointerDown={(e) => handleBalloonClick(e, balloon)}
                            >
                                {/* Balloon SVG / Custom Shape */}
                                <div
                                    className="w-24 h-[110px] rounded-[50%] flex items-center justify-center relative shadow-xl border border-white/40"
                                    style={{
                                        backgroundColor: `hsl(${balloon.hue}, 80%, 65%)`,
                                        // Giving it a balloon-like highlight
                                        backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 20%)'
                                    }}
                                >
                                    {/* The knot */}
                                    <div className="absolute -bottom-3 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-transparent" style={{ borderBottomColor: `hsl(${balloon.hue}, 80%, 55%)` }}></div>
                                    {/* The string */}
                                    <div className="absolute -bottom-16 w-0.5 h-16 bg-white/50 origin-top animate-[wiggle_1s_ease-in-out_infinite_alternate]"></div>

                                    <span className="font-black text-white text-xl uppercase tracking-widest drop-shadow-md text-center leading-tight mx-2 break-all pointer-events-none select-none -translate-y-1">
                                        {balloon.word}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Feedback Texts (Clicks) */}
                    {feedback.map(f => (
                        <div
                            key={f.id}
                            className={`absolute transform -translate-x-1/2 pointer-events-none font-black text-3xl uppercase tracking-widest z-30 animate-in slide-in-from-bottom-8 fade-in duration-500
                            ${f.isPositive ? 'text-emerald-500 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-rose-600 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]'}
                        `}
                            style={{ left: `${f.x}%`, top: `${f.y}%` }}
                        >
                            {f.text}
                        </div>
                    ))}
                </div>

                {/* Add custom keyframe for string wiggle */}
                <style jsx>{`
                @keyframes wiggle {
                    0% { transform: rotate(-10deg); }
                    100% { transform: rotate(10deg); }
                }
            `}</style>

            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300 font-sans select-none">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl h-[600px] flex flex-col rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {renderContent()}
            </div>
        </div>
    );
};

export default InterjectionPopGame;
