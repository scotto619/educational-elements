import React, { useState, useEffect } from 'react';

const wordBank = [
    // Action Verbs
    { word: 'Run', category: 'Action' }, { word: 'Jump', category: 'Action' }, { word: 'Swim', category: 'Action' },
    { word: 'Climb', category: 'Action' }, { word: 'Eat', category: 'Action' }, { word: 'Drink', category: 'Action' },
    { word: 'Sleep', category: 'Action' }, { word: 'Dance', category: 'Action' }, { word: 'Sing', category: 'Action' },
    { word: 'Write', category: 'Action' }, { word: 'Read', category: 'Action' }, { word: 'Draw', category: 'Action' },
    { word: 'Paint', category: 'Action' }, { word: 'Cook', category: 'Action' }, { word: 'Bake', category: 'Action' },
    { word: 'Drive', category: 'Action' }, { word: 'Ride', category: 'Action' }, { word: 'Fly', category: 'Action' },
    { word: 'Throw', category: 'Action' }, { word: 'Catch', category: 'Action' }, { word: 'Kick', category: 'Action' },
    { word: 'Push', category: 'Action' }, { word: 'Pull', category: 'Action' }, { word: 'Carry', category: 'Action' },
    { word: 'Lift', category: 'Action' }, { word: 'Drop', category: 'Action' }, { word: 'Build', category: 'Action' },
    { word: 'Destroy', category: 'Action' }, { word: 'Create', category: 'Action' }, { word: 'Think', category: 'Action' },
    { word: 'Study', category: 'Action' }, { word: 'Learn', category: 'Action' }, { word: 'Teach', category: 'Action' },
    { word: 'Listen', category: 'Action' }, { word: 'Speak', category: 'Action' }, { word: 'Talk', category: 'Action' },
    { word: 'Whisper', category: 'Action' }, { word: 'Shout', category: 'Action' }, { word: 'Laugh', category: 'Action' },
    { word: 'Cry', category: 'Action' }, { word: 'Smile', category: 'Action' }, { word: 'Frown', category: 'Action' },
    { word: 'Walk', category: 'Action' }, { word: 'Crawl', category: 'Action' }, { word: 'Skip', category: 'Action' },
    { word: 'Hop', category: 'Action' }, { word: 'March', category: 'Action' }, { word: 'Sneak', category: 'Action' },

    // Linking Verbs
    { word: 'Am', category: 'Linking' }, { word: 'Is', category: 'Linking' }, { word: 'Are', category: 'Linking' },
    { word: 'Was', category: 'Linking' }, { word: 'Were', category: 'Linking' }, { word: 'Be', category: 'Linking' },
    { word: 'Being', category: 'Linking' }, { word: 'Been', category: 'Linking' }, { word: 'Seem', category: 'Linking' },
    { word: 'Look', category: 'Linking' }, { word: 'Smell', category: 'Linking' }, { word: 'Sound', category: 'Linking' },
    { word: 'Taste', category: 'Linking' }, { word: 'Feel', category: 'Linking' }, { word: 'Appear', category: 'Linking' },
    { word: 'Become', category: 'Linking' }, { word: 'Grow', category: 'Linking' }, { word: 'Remain', category: 'Linking' },
    { word: 'Stay', category: 'Linking' }, { word: 'Turn', category: 'Linking' }, { word: 'Prove', category: 'Linking' },

    // Helping Verbs
    { word: 'Has', category: 'Helping' }, { word: 'Have', category: 'Helping' }, { word: 'Had', category: 'Helping' },
    { word: 'Do', category: 'Helping' }, { word: 'Does', category: 'Helping' }, { word: 'Did', category: 'Helping' },
    { word: 'Can', category: 'Helping' }, { word: 'Could', category: 'Helping' }, { word: 'Will', category: 'Helping' },
    { word: 'Would', category: 'Helping' }, { word: 'Shall', category: 'Helping' }, { word: 'Should', category: 'Helping' },
    { word: 'May', category: 'Helping' }, { word: 'Might', category: 'Helping' }, { word: 'Must', category: 'Helping' }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const VerbSortingGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
    const [shake, setShake] = useState(false); // for incorrect answer animation

    useEffect(() => {
        if (gameState === 'start') {
            setWords(shuffleArray([...wordBank]).slice(0, 15)); // Play 15 random words
        }
    }, [gameState]);

    const startGame = () => {
        setWords(shuffleArray([...wordBank]).slice(0, 15)); // Draw fresh words on each start
        setScore(0);
        setCurrentIndex(0);
        setFeedback(null);
        setGameState('playing');
    };

    const handleAnswer = (category) => {
        if (feedback) return; // prevent spam clicking

        const currentWord = words[currentIndex];

        if (currentWord.category === category) {
            setFeedback('correct');
            setScore(prev => prev + 10);

            setTimeout(() => {
                setFeedback(null);
                if (currentIndex + 1 < words.length) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setGameState('end');
                }
            }, 1000);
        } else {
            setFeedback('incorrect');
            setShake(true);
            setTimeout(() => setShake(false), 500);

            setTimeout(() => {
                setFeedback(null);
            }, 1000); // allow trying again
        }
    };

    const currentWord = words[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
            {/* Glassmorphic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container w/ Fixed Max Height for smaller screens */}
            <div className="relative w-full max-w-4xl h-[650px] max-h-[90vh] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-rose-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-rose-600 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🗂️</span>
                        <h3 className="font-black text-2xl tracking-tight">Verb Master Challenge</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col items-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-100 via-slate-50 to-white">

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8 mt-8">
                            <div className="w-32 h-32 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl">🏃</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">Sort the Verbs!</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                                Can you group the words into <span className="text-rose-600 font-bold">Action</span>, <span className="text-purple-600 font-bold">Linking</span>, and <span className="text-indigo-600 font-bold">Helping</span> verbs? Let's find out!
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-rose-600 hover:bg-rose-500 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                START CHALLENGE
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && currentWord && (
                        <div className="w-full h-full flex flex-col justify-between py-2">
                            {/* Score & Progress */}
                            <div className="flex justify-between items-center w-full max-w-2xl mx-auto mb-4">
                                <div className="text-base font-bold text-slate-500 bg-white px-4 py-1.5 rounded-xl shadow-sm border border-slate-200">
                                    Word <span className="text-rose-600">{currentIndex + 1}</span> / {words.length}
                                </div>
                                <div className="text-xl font-black text-emerald-500 bg-white px-5 py-1.5 rounded-xl shadow-sm border border-emerald-200 flex items-center gap-2">
                                    <span>⭐</span> {score}
                                </div>
                            </div>

                            {/* Target Word Container */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-0 mb-8">
                                <div
                                    key={currentWord.word} // Forces re-animation on new word
                                    className={`relative z-20 w-full max-w-md bg-white rounded-3xl shadow-xl border-b-[8px] border-slate-200 flex items-center justify-center p-8 md:p-12 animate-in slide-in-from-top-8 duration-500
                                        ${shake ? 'animate-[shake_0.5s_ease-in-out] border-red-500 bg-red-50' : ''}
                                        ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 scale-105' : ''}
                                    `}
                                >
                                    <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight text-center drop-shadow-sm">
                                        {currentWord.word}
                                    </h1>

                                    {/* Feedback Icon Overlays */}
                                    {feedback === 'correct' && (
                                        <div className="absolute -top-6 -right-6 text-6xl animate-in zoom-in duration-300 drop-shadow-lg">✨</div>
                                    )}
                                    {feedback === 'incorrect' && (
                                        <div className="absolute -top-6 -right-6 text-6xl animate-in zoom-in duration-300 drop-shadow-lg">❌</div>
                                    )}
                                </div>
                            </div>

                            {/* Categories (Answers) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
                                <button
                                    onClick={() => handleAnswer('Action')}
                                    disabled={feedback !== null}
                                    className="group relative overflow-hidden bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10 relative">
                                        <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">🏃</span>
                                        <span className="font-black text-xl text-rose-800 uppercase tracking-wider">Action</span>
                                        <span className="text-sm font-medium text-rose-600/70 text-center">Shows what something does (run, jump)</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-rose-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>

                                <button
                                    onClick={() => handleAnswer('Linking')}
                                    disabled={feedback !== null}
                                    className="group relative overflow-hidden bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 hover:border-purple-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10 relative">
                                        <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">🔗</span>
                                        <span className="font-black text-xl text-purple-800 uppercase tracking-wider">Linking</span>
                                        <span className="text-sm font-medium text-purple-600/70 text-center">Connects subject to more info (is, am, are)</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>

                                <button
                                    onClick={() => handleAnswer('Helping')}
                                    disabled={feedback !== null}
                                    className="group relative overflow-hidden bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 hover:border-indigo-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10 relative">
                                        <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">🤝</span>
                                        <span className="font-black text-xl text-indigo-800 uppercase tracking-wider">Helping</span>
                                        <span className="text-sm font-medium text-indigo-600/70 text-center">Helps main verb show tense (has, do, will)</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'end' && (
                        <div className="text-center animate-in zoom-in-50 duration-500 mt-8">
                            <span className="text-8xl block mb-6 animate-bounce">🎖️</span>
                            <h2 className="text-5xl font-black text-slate-800 mb-2">Challenge Complete!</h2>
                            <p className="text-2xl text-slate-500 mb-8 font-medium">Your final score is:</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600 mb-12 drop-shadow-sm">
                                {score} <span className="text-4xl text-slate-800">/ 150</span>
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
                                    className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white text-xl font-bold rounded-xl shadow-lg transition-colors"
                                >
                                    Return to Hub
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

export default VerbSortingGame;
