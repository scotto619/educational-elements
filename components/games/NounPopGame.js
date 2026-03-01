import React, { useState, useEffect, useRef } from 'react';

const wordsData = [
    // Nouns
    { word: 'Dog', isNoun: true }, { word: 'City', isNoun: true }, { word: 'Paris', isNoun: true },
    { word: 'Happiness', isNoun: true }, { word: 'Flock', isNoun: true }, { word: 'Teacher', isNoun: true },
    { word: 'Car', isNoun: true }, { word: 'Ocean', isNoun: true }, { word: 'Mountain', isNoun: true },
    { word: 'Courage', isNoun: true }, { word: 'Team', isNoun: true }, { word: 'Apple', isNoun: true },
    { word: 'Guitar', isNoun: true }, { word: 'Planet', isNoun: true }, { word: 'Friendship', isNoun: true },
    // Not Nouns (Verbs, Adjectives, Adverbs, etc.)
    { word: 'Run', isNoun: false }, { word: 'Quickly', isNoun: false }, { word: 'Blue', isNoun: false },
    { word: 'Jump', isNoun: false }, { word: 'Happy', isNoun: false }, { word: 'Sing', isNoun: false },
    { word: 'Loud', isNoun: false }, { word: 'Slowly', isNoun: false }, { word: 'Beautiful', isNoun: false },
    { word: 'Eat', isNoun: false }, { word: 'Sleep', isNoun: false }, { word: 'Very', isNoun: false },
    { word: 'Tall', isNoun: false }, { word: 'Dance', isNoun: false }, { word: 'Always', isNoun: false }
];

const BALLOON_COLORS = ['bg-rose-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-teal-500'];

const NounPopGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [balloons, setBalloons] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);
    const timeLeftRef = useRef(60); // Ref to avoid resetting interval on tick
    const gameAreaRef = useRef(null);
    const idCounter = useRef(0);

    // Timer logic
    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0 && lives > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;
                    timeLeftRef.current = newTime;
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft <= 0 || lives <= 0) {
            if (gameState === 'playing') {
                setGameState('end');
            }
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, lives]);

    // Balloon spawning logic using recursive timeout to avoid dependency reset
    useEffect(() => {
        let timeoutId;
        let isActive = true;

        const spawnNextLevel = () => {
            if (!isActive || gameState !== 'playing') return;

            // Spawn rate gets faster as time goes on, using Ref to read current time without causing re-renders
            const currentSpawnRate = Math.max(600, 2000 - ((60 - timeLeftRef.current) * 20));

            const randomWord = wordsData[Math.floor(Math.random() * wordsData.length)];
            const randomColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
            const randomX = Math.floor(Math.random() * 80) + 10;
            const speed = Math.random() * 4 + 4;

            const newBalloon = {
                id: idCounter.current++,
                word: randomWord.word,
                isNoun: randomWord.isNoun,
                color: randomColor,
                left: `${randomX}%`,
                speed: `${speed}s`,
                popped: false,
                isPopping: false
            };

            setBalloons(prev => [...prev, newBalloon]);

            timeoutId = setTimeout(spawnNextLevel, currentSpawnRate);
        };

        if (gameState === 'playing') {
            timeoutId = setTimeout(spawnNextLevel, 500); // initial delay before first spawn
        }

        return () => {
            isActive = false;
            clearTimeout(timeoutId);
        };
    }, [gameState]);

    // Clean up balloons that finish animating offscreen (handled via CSS animation end, simplified here via timeout mapping)
    useEffect(() => {
        // Auto cleanup balloons to prevent memory leaks, checking every 2 seconds
        const cleanup = setInterval(() => {
            setBalloons(prev => prev.filter(b => !b.popped));
        }, 2000);
        return () => clearInterval(cleanup);
    }, []);

    const startGame = () => {
        setScore(0);
        setLives(3);
        setTimeLeft(60);
        timeLeftRef.current = 60; // Reset ref for spawner
        setBalloons([]);
        setGameState('playing');
    };

    const attemptPop = (id, isNoun) => {
        if (gameState !== 'playing') return;

        setBalloons(prev => prev.map(b => {
            if (b.id === id && !b.popped && !b.isPopping) {
                if (isNoun) {
                    setScore(s => s + 10);
                    return { ...b, isPopping: true };
                } else {
                    setLives(l => l - 1);
                    return { ...b, isPopping: true, wrong: true };
                }
            }
            return b;
        }));

        // Remove popped balloon after short animation
        setTimeout(() => {
            setBalloons(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
        }, 150);
    };

    // Note: In a fully robust game we would detect if a true noun escaped off top of screen and dock a life,
    // but for simplicity in this React prototype we are omitting complex intersection observation bounding boxes.

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-5xl h-[700px] flex flex-col bg-sky-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-sky-500">

                {/* Header Overlay (Sky style) */}
                <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 bg-sky-600/90 text-white z-20 shadow-md backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🎈</span>
                        <h3 className="font-black text-2xl tracking-tight hidden sm:block">Noun Pop!</h3>
                    </div>

                    {gameState === 'playing' && (
                        <div className="flex items-center gap-6">
                            <div className="text-xl font-bold bg-white/20 px-4 py-1 rounded-full">
                                ⏳ {timeLeft}s
                            </div>
                            <div className="text-xl font-bold bg-white/20 px-4 py-1 rounded-full">
                                ⭐ {score}
                            </div>
                            <div className="flex gap-1 text-2xl">
                                {[...Array(3)].map((_, i) => (
                                    <span key={i} className={i < lives ? 'opacity-100' : 'opacity-30 grayscale'}>❤️</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Game Area */}
                <div
                    ref={gameAreaRef}
                    className="flex-1 relative overflow-hidden bg-[url('/img/clouds-bg.png')] bg-cover bg-bottom bg-no-repeat"
                >
                    {/* Clouds CSS generated if no actual image exists */}
                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-sky-300 to-sky-500 pointer-events-none -z-10"></div>

                    {gameState === 'start' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                            <div className="w-32 h-32 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl">🎈</span>
                            </div>
                            <h2 className="text-5xl font-black text-sky-800 mb-4 tracking-tight">Pop the Nouns!</h2>
                            <p className="text-xl text-slate-700 mb-10 max-w-lg mx-auto font-medium text-center">
                                Words are floating away! Click on the balloons containing NOUNS to score points.
                                <br /><br />
                                <span className="text-rose-600 font-bold">Careful!</span> Popping verbs or adjectives costs a life!
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-sky-600 hover:bg-sky-500 text-white text-2xl font-black rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                PLAY NOW
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <>
                            {/* Render Balloons */}
                            {balloons.map(balloon => {
                                if (balloon.popped) return null;

                                return (
                                    <div
                                        key={balloon.id}
                                        className={`absolute bottom-[-150px] cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-110 active:scale-95
                                            ${balloon.isPopping ? 'scale-150 opacity-0 duration-150' : ''}
                                            ${balloon.wrong ? 'bg-red-500 mix-blend-multiply' : ''}
                                        `}
                                        style={{
                                            left: balloon.left,
                                            animation: `floatUp ${balloon.speed} linear forwards`
                                        }}
                                        onClick={() => attemptPop(balloon.id, balloon.isNoun)}
                                    >
                                        <div className={`w-28 h-32 rounded-full ${balloon.color} shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2),_0_10px_15px_rgba(0,0,0,0.3)] flex items-center justify-center relative`}>
                                            <span className="text-white font-bold text-lg px-2 text-center break-words drop-shadow-md z-10 w-full leading-tight">
                                                {balloon.word}
                                            </span>
                                            {/* Balloon shine reflection */}
                                            <div className="absolute top-2 left-4 w-6 h-10 bg-white/30 rounded-full rotate-[-30deg]"></div>
                                        </div>
                                        {/* Balloon string */}
                                        <div className="w-[2px] h-20 bg-slate-300 drop-shadow-md origin-top rotate-3 opacity-80"></div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {gameState === 'end' && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
                            <span className="text-8xl block mb-6 animate-bounce">
                                {lives > 0 ? '🌟' : '💥'}
                            </span>
                            <h2 className="text-5xl font-black text-sky-800 mb-2">
                                {lives > 0 ? "Time's Up!" : "Out of Lives!"}
                            </h2>
                            <p className="text-2xl text-slate-500 mb-8 font-medium">Final Score:</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600 mb-12 drop-shadow-sm">
                                {score}
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xl font-bold rounded-xl transition-colors"
                                >
                                    Play Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white text-xl font-bold rounded-xl shadow-lg transition-colors"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-400px) rotate(5deg); }
                    100% { transform: translateY(-1000px) rotate(-5deg); }
                }
            `}} />
        </div>
    );
};

export default NounPopGame;
