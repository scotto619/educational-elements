import React, { useState, useEffect, useRef } from 'react';

const wordBank = [
    // Verbs (Correct Answers)
    { word: "Run", isVerb: true }, { word: "Jump", isVerb: true }, { word: "Dance", isVerb: true },
    { word: "Sing", isVerb: true }, { word: "Eat", isVerb: true }, { word: "Sleep", isVerb: true },
    { word: "Think", isVerb: true }, { word: "Create", isVerb: true }, { word: "Build", isVerb: true },
    { word: "Destroy", isVerb: true }, { word: "Fly", isVerb: true }, { word: "Swim", isVerb: true },
    { word: "Climb", isVerb: true }, { word: "Read", isVerb: true }, { word: "Write", isVerb: true },
    { word: "Listen", isVerb: true }, { word: "Speak", isVerb: true }, { word: "Catch", isVerb: true },
    { word: "Throw", isVerb: true }, { word: "Kick", isVerb: true }, { word: "Push", isVerb: true },
    { word: "Pull", isVerb: true }, { word: "Laugh", isVerb: true }, { word: "Cry", isVerb: true },
    { word: "Smile", isVerb: true }, { word: "Frown", isVerb: true }, { word: "Walk", isVerb: true },
    { word: "Crawl", isVerb: true }, { word: "Explore", isVerb: true }, { word: "Discover", isVerb: true },

    // Nouns/Adjectives/Adverbs (Incorrect Answers)
    { word: "Dog", isVerb: false }, { word: "Cat", isVerb: false }, { word: "House", isVerb: false },
    { word: "Tree", isVerb: false }, { word: "Car", isVerb: false }, { word: "Book", isVerb: false },
    { word: "Happy", isVerb: false }, { word: "Sad", isVerb: false }, { word: "Angry", isVerb: false },
    { word: "Fast", isVerb: false }, { word: "Slow", isVerb: false }, { word: "Beautiful", isVerb: false },
    { word: "Quickly", isVerb: false }, { word: "Slowly", isVerb: false }, { word: "Loudly", isVerb: false },
    { word: "Quietly", isVerb: false }, { word: "Very", isVerb: false }, { word: "Almost", isVerb: false },
    { word: "Never", isVerb: false }, { word: "Always", isVerb: false }, { word: "Red", isVerb: false },
    { word: "Blue", isVerb: false }, { word: "Green", isVerb: false }, { word: "Yellow", isVerb: false },
    { word: "Big", isVerb: false }, { word: "Small", isVerb: false }, { word: "Tall", isVerb: false },
    { word: "Short", isVerb: false }, { word: "Hot", isVerb: false }, { word: "Cold", isVerb: false }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const TOTAL_DISTANCE = 100; // Total distance to finish line

const VerbActionRace = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [distance, setDistance] = useState(0); // 0 to 100
    const [cpuDistance, setCpuDistance] = useState(0); // CPU opponent
    const [options, setOptions] = useState([]);
    const [streak, setStreak] = useState(0);
    const [shake, setShake] = useState(false);
    const raceInterval = useRef(null);

    // Initialize/Refresh options
    const generateOptions = () => {
        const shuffled = shuffleArray([...wordBank]);
        // Get 1 verb and 3 non-verbs
        const verbs = shuffled.filter(w => w.isVerb);
        const nonVerbs = shuffled.filter(w => !w.isVerb);

        const selectedOptions = shuffleArray([
            verbs[0],
            nonVerbs[0],
            nonVerbs[1],
            nonVerbs[2]
        ]);

        setOptions(selectedOptions);
    };

    const startGame = () => {
        setDistance(0);
        setCpuDistance(0);
        setStreak(0);
        generateOptions();
        setGameState('playing');

        // Start CPU movement
        if (raceInterval.current) clearInterval(raceInterval.current);
        raceInterval.current = setInterval(() => {
            setCpuDistance(prev => {
                const newDist = prev + (Math.random() * 2 + 1); // CPU speed
                if (newDist >= TOTAL_DISTANCE) {
                    clearInterval(raceInterval.current);
                    setGameState('end_lose');
                    return TOTAL_DISTANCE;
                }
                return newDist;
            });
        }, 1000);
    };

    const handleAnswer = (isVerb) => {
        if (isVerb) {
            // Correct! Move forward
            const boost = 10 + (streak * 2); // Streak multiplier
            setDistance(prev => {
                const newDist = prev + boost;
                if (newDist >= TOTAL_DISTANCE) {
                    if (raceInterval.current) clearInterval(raceInterval.current);
                    setGameState('end_win');
                    return TOTAL_DISTANCE;
                }
                return newDist;
            });
            setStreak(prev => prev + 1);
            generateOptions();
        } else {
            // Incorrect! Stumble
            setStreak(0);
            setShake(true);
            setTimeout(() => setShake(false), 400);
            // Deduct some distance, but don't go below 0
            setDistance(prev => Math.max(0, prev - 5));
        }
    };

    useEffect(() => {
        return () => {
            if (raceInterval.current) clearInterval(raceInterval.current);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-5xl h-[750px] max-h-[95vh] flex flex-col bg-emerald-50 rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500">

                {/* Header Section */}
                <div className="flex items-center justify-between px-6 py-4 bg-emerald-600 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🏃‍♂️</span>
                        <h3 className="font-black text-2xl tracking-tight">Verb Action Race</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative flex flex-col overflow-hidden">

                    {/* Race Track Background */}
                    <div className="absolute inset-x-0 top-0 h-36 bg-emerald-700/10 border-b-8 border-emerald-800/20">
                        {/* Finish Line Marking */}
                        <div className="absolute right-12 top-0 bottom-0 w-8 flex flex-col justify-between">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className={`h-full w-full ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* Runners */}
                    <div className="relative h-36 w-full px-12 z-10">
                        {/* CPU Track */}
                        <div className="absolute top-6 left-12 right-12 h-1 bg-red-500/20 rounded-full border-b border-dashed border-red-500/50"></div>
                        <div
                            className="absolute top-2 w-12 h-12 flex items-center justify-center text-4xl transition-all duration-1000 ease-linear"
                            style={{ left: `calc(3rem + ${cpuDistance}% * 0.8)` }} // 0.8 multiplier keeps it within padding
                        >
                            🤖
                        </div>

                        {/* Player Track */}
                        <div className="absolute top-20 left-12 right-12 h-1 bg-emerald-500/20 rounded-full border-b border-dashed border-emerald-500/50"></div>
                        <div
                            className={`absolute top-16 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-emerald-500 flex items-center justify-center text-4xl transition-all duration-300 ease-out z-20
                                ${shake ? 'animate-[shake_0.4s_ease-in-out] bg-red-100 border-red-500' : ''}
                            `}
                            style={{ left: `calc(3rem + ${distance}% * 0.8)` }}
                        >
                            🏃
                            {streak >= 3 && (
                                <div className="absolute -top-6 -right-4 text-2xl animate-bounce">🔥</div>
                            )}
                        </div>
                    </div>

                    {/* Game Interface */}
                    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-emerald-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 z-20">

                        {gameState === 'start' && (
                            <div className="text-center w-full max-w-2xl bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 animate-in slide-in-from-bottom-8">
                                <span className="text-6xl block mb-4">⏱️</span>
                                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Race to the Finish!</h2>
                                <p className="text-lg text-slate-600 mb-8 font-medium">
                                    Power your runner by clicking the <strong className="text-emerald-600">VERB</strong> (Doing Word).
                                    <br />String correct answers together for a speed boost! Watch out for the robot!
                                </p>
                                <button
                                    onClick={startGame}
                                    className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-2xl font-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    START RACE
                                </button>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <div className="w-full max-w-3xl flex flex-col items-center text-center">
                                <h2 className="text-3xl font-black text-slate-800 mb-8 bg-white px-8 py-3 rounded-full shadow-sm border border-slate-200">
                                    Click the VERB to run!
                                </h2>

                                <div className="grid grid-cols-2 gap-4 md:gap-6 w-full">
                                    {options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswer(opt.isVerb)}
                                            className="px-4 py-6 md:py-8 bg-white text-slate-700 font-bold text-3xl md:text-5xl rounded-3xl shadow-lg border-b-[8px] border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 active:border-b-0 active:translate-y-[8px] transition-all"
                                        >
                                            {opt.word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(gameState === 'end_win' || gameState === 'end_lose') && (
                            <div className="text-center w-full max-w-2xl bg-white p-12 rounded-3xl shadow-2xl border-4 animate-in zoom-in-75 duration-500
                                ${gameState === 'end_win' ? 'border-emerald-500' : 'border-red-500'}
                            ">
                                <span className="text-8xl block mb-6 animate-bounce">
                                    {gameState === 'end_win' ? '🏆' : '💥'}
                                </span>
                                <h2 className="text-5xl font-black mb-4">
                                    {gameState === 'end_win' ? <span className="text-emerald-600">You Won!</span> : <span className="text-red-600">Robot Wins!</span>}
                                </h2>
                                <p className="text-xl text-slate-600 mb-8 font-medium">
                                    {gameState === 'end_win'
                                        ? "Your vocabulary speed is unmatched! The crowd goes wild!"
                                        : "You stumbled too many times! The robot beat you to the finish line."}
                                </p>
                                <div className="flex justify-center gap-4 border-t pt-8">
                                    <button
                                        onClick={startGame}
                                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-bold rounded-xl shadow-lg transition-colors"
                                    >
                                        Race Again
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                }
            `}</style>
        </div>
    );
};

export default VerbActionRace;
