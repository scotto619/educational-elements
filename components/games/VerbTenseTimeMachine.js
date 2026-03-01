import React, { useState, useEffect } from 'react';

const wordBank = [
    // Past Tense
    { word: 'Walked', tense: 'Past' }, { word: 'Ran', tense: 'Past' }, { word: 'Ate', tense: 'Past' },
    { word: 'Slept', tense: 'Past' }, { word: 'Swam', tense: 'Past' }, { word: 'Flew', tense: 'Past' },
    { word: 'Wrote', tense: 'Past' }, { word: 'Read', tense: 'Past' }, { word: 'Saw', tense: 'Past' },
    { word: 'Thought', tense: 'Past' }, { word: 'Felt', tense: 'Past' }, { word: 'Spoke', tense: 'Past' },
    { word: 'Heard', tense: 'Past' }, { word: 'Played', tense: 'Past' }, { word: 'Danced', tense: 'Past' },
    { word: 'Jumped', tense: 'Past' }, { word: 'Cried', tense: 'Past' }, { word: 'Laughed', tense: 'Past' },
    { word: 'Smiled', tense: 'Past' }, { word: 'Told', tense: 'Past' }, { word: 'Knew', tense: 'Past' },
    { word: 'Forgot', tense: 'Past' }, { word: 'Remembered', tense: 'Past' }, { word: 'Tried', tense: 'Past' },
    { word: 'Failed', tense: 'Past' }, { word: 'Succeeded', tense: 'Past' }, { word: 'Won', tense: 'Past' },
    { word: 'Lost', tense: 'Past' }, { word: 'Found', tense: 'Past' }, { word: 'Hid', tense: 'Past' },

    // Present Tense (Continuous and Simple)
    { word: 'Walks', tense: 'Present' }, { word: 'Is Running', tense: 'Present' }, { word: 'Eats', tense: 'Present' },
    { word: 'Are Sleeping', tense: 'Present' }, { word: 'Swims', tense: 'Present' }, { word: 'Am Flying', tense: 'Present' },
    { word: 'Writes', tense: 'Present' }, { word: 'Is Reading', tense: 'Present' }, { word: 'Sees', tense: 'Present' },
    { word: 'Is Thinking', tense: 'Present' }, { word: 'Feels', tense: 'Present' }, { word: 'Are Speaking', tense: 'Present' },
    { word: 'Hears', tense: 'Present' }, { word: 'Is Playing', tense: 'Present' }, { word: 'Dances', tense: 'Present' },
    { word: 'Am Jumping', tense: 'Present' }, { word: 'Cries', tense: 'Present' }, { word: 'Is Laughing', tense: 'Present' },
    { word: 'Smiles', tense: 'Present' }, { word: 'Are Telling', tense: 'Present' }, { word: 'Knows', tense: 'Present' },
    { word: 'Forgets', tense: 'Present' }, { word: 'Is Remembering', tense: 'Present' }, { word: 'Tries', tense: 'Present' },
    { word: 'Is Failing', tense: 'Present' }, { word: 'Succeeds', tense: 'Present' }, { word: 'Are Winning', tense: 'Present' },
    { word: 'Loses', tense: 'Present' }, { word: 'Is Finding', tense: 'Present' }, { word: 'Hides', tense: 'Present' },

    // Future Tense
    { word: 'Will Walk', tense: 'Future' }, { word: 'Will Run', tense: 'Future' }, { word: 'Shall Eat', tense: 'Future' },
    { word: 'Will Sleep', tense: 'Future' }, { word: 'Shall Swim', tense: 'Future' }, { word: 'Will Fly', tense: 'Future' },
    { word: 'Will Write', tense: 'Future' }, { word: 'Shall Read', tense: 'Future' }, { word: 'Will See', tense: 'Future' },
    { word: 'Shall Think', tense: 'Future' }, { word: 'Will Feel', tense: 'Future' }, { word: 'Will Speak', tense: 'Future' },
    { word: 'Shall Hear', tense: 'Future' }, { word: 'Will Play', tense: 'Future' }, { word: 'Will Dance', tense: 'Future' },
    { word: 'Shall Jump', tense: 'Future' }, { word: 'Will Cry', tense: 'Future' }, { word: 'Will Laugh', tense: 'Future' },
    { word: 'Shall Smile', tense: 'Future' }, { word: 'Will Tell', tense: 'Future' }, { word: 'Will Know', tense: 'Future' },
    { word: 'Shall Forget', tense: 'Future' }, { word: 'Will Remember', tense: 'Future' }, { word: 'Will Try', tense: 'Future' },
    { word: 'Shall Fail', tense: 'Future' }, { word: 'Will Succeed', tense: 'Future' }, { word: 'Will Win', tense: 'Future' },
    { word: 'Shall Lose', tense: 'Future' }, { word: 'Will Find', tense: 'Future' }, { word: 'Will Hide', tense: 'Future' }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const VerbTenseTimeMachine = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
    const [portalActive, setPortalActive] = useState(null); // 'Past', 'Present', 'Future'
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (gameState === 'start') {
            setWords(shuffleArray([...wordBank]).slice(0, 15)); // Play 15 random words
        }
    }, [gameState]);

    const startGame = () => {
        setWords(shuffleArray([...wordBank]).slice(0, 15)); // Draw fresh words
        setScore(0);
        setCurrentIndex(0);
        setFeedback(null);
        setPortalActive(null);
        setGameState('playing');
    };

    const handleAnswer = (tense) => {
        if (feedback) return; // prevent spam clicking

        const currentWord = words[currentIndex];
        setPortalActive(tense);

        if (currentWord.tense === tense) {
            setFeedback('correct');
            setScore(prev => prev + 10);

            setTimeout(() => {
                setFeedback(null);
                setPortalActive(null);
                if (currentIndex + 1 < words.length) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setGameState('end');
                }
            }, 1000); // 1 second portal animation delay
        } else {
            setFeedback('incorrect');
            setShake(true);

            setTimeout(() => {
                setShake(false);
            }, 500);

            setTimeout(() => {
                setFeedback(null);
                setPortalActive(null);
            }, 1000); // allow trying again
        }
    };

    const currentWord = words[currentIndex];

    // CSS classes for different portals
    const portalStyles = {
        Past: "from-amber-500 to-orange-700 shadow-amber-500/50 border-amber-300",
        Present: "from-emerald-500 to-teal-700 shadow-emerald-500/50 border-emerald-300",
        Future: "from-fuchsia-500 to-purple-700 shadow-fuchsia-500/50 border-fuchsia-300"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
            {/* Darker sci-fi backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container w/ Sci-Fi styling */}
            <div className="relative w-full max-w-5xl h-[700px] max-h-[90vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.3)] animate-in zoom-in-95 duration-300 border border-slate-700">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 text-sky-100 z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">⏳</span>
                        <h3 className="font-black text-2xl tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-fuchsia-400">Time Machine</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col items-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">

                    {/* Starfield background effect */}
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8 mt-12 z-10 w-full max-w-2xl bg-slate-800/80 p-10 rounded-3xl border border-slate-700 backdrop-blur-sm shadow-2xl">
                            <span className="text-7xl block mb-6 animate-pulse">🛸</span>
                            <h2 className="text-5xl font-black text-sky-300 mb-6 tracking-tight drop-shadow-md">Verb Tense Explorer</h2>
                            <p className="text-xl text-slate-300 mb-10 font-medium leading-relaxed">
                                Fire up the temporal engine! Send the <strong className="text-sky-400">Verbs</strong> to their correct time period:<br />
                                <span className="text-amber-400">Past</span>, <span className="text-emerald-400">Present</span>, or <span className="text-fuchsia-400">Future</span>.
                            </p>
                            <button
                                onClick={startGame}
                                className="px-12 py-5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-2xl font-black rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.5)] hover:shadow-[0_0_30px_rgba(56,189,248,0.8)] hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                START ENGINES
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && currentWord && (
                        <div className="w-full h-full flex flex-col justify-between py-2 z-10">

                            {/* Score & Progress (HUD style) */}
                            <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-4 bg-slate-800/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700 shadow-lg">
                                <div className="text-sm md:text-base font-bold text-sky-400 uppercase tracking-widest">
                                    Entity <span className="text-white ml-2">{currentIndex + 1}</span> / {words.length}
                                </div>
                                <div className="text-xl font-black text-yellow-400 flex items-center gap-2">
                                    <span>⚡</span> {score}
                                </div>
                            </div>

                            {/* Target Verb Payload */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-0 mb-10">
                                <div
                                    key={currentWord.word}
                                    className={`relative z-20 w-full max-w-lg bg-slate-800/90 rounded-full border-4 shadow-2xl flex items-center justify-center py-10 px-6 animate-in slide-in-from-top-12 duration-500 backdrop-blur-md
                                        ${shake ? 'animate-[shake_0.5s_ease-in-out] border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-slate-600 shadow-[0_0_30px_rgba(255,255,255,0.1)]'}
                                        ${feedback === 'correct' ? '!border-emerald-400 scale-90 opacity-0 transition-all duration-700 ease-in' : ''} 
                                    `}
                                // Make word shrink and disappear on correct answer to simulate going into portal
                                >
                                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest text-center uppercase drop-shadow-lg">
                                        {currentWord.word}
                                    </h1>
                                </div>
                                {feedback === 'incorrect' && (
                                    <div className="text-red-400 font-bold mt-4 tracking-widest uppercase animate-pulse">Temporal Anomaly Detected! Try again.</div>
                                )}
                            </div>

                            {/* Time Portals (Answers) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-5xl mx-auto pb-4">
                                {['Past', 'Present', 'Future'].map((tense) => (
                                    <button
                                        key={tense}
                                        onClick={() => handleAnswer(tense)}
                                        disabled={feedback !== null}
                                        className={`group relative flex flex-col items-center justify-center p-8 rounded-[40px] border-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 bg-slate-900
                                            ${portalStyles[tense].split(' ')[2]} // Pulling just the border color from styles
                                            ${portalActive === tense ? 'scale-110' : 'hover:-translate-y-2 hover:shadow-2xl'}
                                        `}
                                    >
                                        {/* Portal Inner Glow */}
                                        <div className={`absolute inset-2 rounded-[32px] bg-gradient-to-b opacity-20 group-hover:opacity-40 transition-opacity duration-300 ${portalStyles[tense].split(' ').slice(0, 2).join(' ')}`}></div>

                                        {/* Swirling Portal Effect (simulated with CSS pulse/spin if active) */}
                                        <div className={`absolute inset-0 rounded-[40px] border-[8px] border-transparent transition-all duration-500 ${portalActive === tense ? `border-t-white/50 animate-spin shadow-[0_0_40px_rgba(255,255,255,0.8)]` : ''}`}></div>

                                        <div className="z-10 flex flex-col items-center">
                                            <span className="text-5xl mb-4 drop-shadow-md">
                                                {tense === 'Past' ? '🦖' : tense === 'Present' ? '👤' : '🤖'}
                                            </span>
                                            <span className="font-black text-3xl text-white uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                                {tense}
                                            </span>
                                            <span className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-wide">
                                                {tense === 'Past' ? 'Already happened' : tense === 'Present' ? 'Happening right now' : 'Will happen later'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState === 'end' && (
                        <div className="text-center animate-in zoom-in-50 duration-500 mt-12 z-20 bg-slate-800/90 p-12 rounded-3xl border border-slate-700 backdrop-blur-md shadow-[0_0_50px_rgba(56,189,248,0.2)]">
                            <span className="text-8xl block mb-6 animate-bounce">⚡</span>
                            <h2 className="text-5xl font-black text-white mb-2 tracking-widest uppercase">Mission Complete</h2>
                            <p className="text-2xl text-sky-400 mb-8 font-medium">Temporal Energy Collected:</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 mb-12 drop-shadow-sm">
                                {score} <span className="text-4xl text-slate-500">/ 150</span>
                            </div>
                            <div className="flex justify-center gap-6">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-white text-xl font-bold rounded-2xl transition-colors"
                                >
                                    New Mission
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xl font-bold rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
                                >
                                    Return to Base
                                </button>
                            </div>
                        </div>
                    )}

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

export default VerbTenseTimeMachine;
