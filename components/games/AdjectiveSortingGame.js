import React, { useState, useEffect } from 'react';

const wordBank = [
    // Emotion / Feeling (Internal states, personality)
    { word: 'Happy', category: 'Emotion/Feeling' }, { word: 'Sad', category: 'Emotion/Feeling' }, { word: 'Angry', category: 'Emotion/Feeling' },
    { word: 'Excited', category: 'Emotion/Feeling' }, { word: 'Bored', category: 'Emotion/Feeling' }, { word: 'Nervous', category: 'Emotion/Feeling' },
    { word: 'Proud', category: 'Emotion/Feeling' }, { word: 'Embarrassed', category: 'Emotion/Feeling' }, { word: 'Jealous', category: 'Emotion/Feeling' },
    { word: 'Scared', category: 'Emotion/Feeling' }, { word: 'Brave', category: 'Emotion/Feeling' }, { word: 'Calm', category: 'Emotion/Feeling' },
    { word: 'Anxious', category: 'Emotion/Feeling' }, { word: 'Cheerful', category: 'Emotion/Feeling' }, { word: 'Lonely', category: 'Emotion/Feeling' },
    { word: 'Grumpy', category: 'Emotion/Feeling' }, { word: 'Curious', category: 'Emotion/Feeling' }, { word: 'Eager', category: 'Emotion/Feeling' },
    { word: 'Shy', category: 'Emotion/Feeling' }, { word: 'Silly', category: 'Emotion/Feeling' }, { word: 'Serious', category: 'Emotion/Feeling' },
    { word: 'Lazy', category: 'Emotion/Feeling' }, { word: 'Energetic', category: 'Emotion/Feeling' }, { word: 'Peaceful', category: 'Emotion/Feeling' },
    { word: 'Confused', category: 'Emotion/Feeling' }, { word: 'Frustrated', category: 'Emotion/Feeling' }, { word: 'Hopeful', category: 'Emotion/Feeling' },
    { word: 'Guilty', category: 'Emotion/Feeling' }, { word: 'Joyful', category: 'Emotion/Feeling' }, { word: 'Miserable', category: 'Emotion/Feeling' },
    { word: 'Relaxed', category: 'Emotion/Feeling' }, { word: 'Surprised', category: 'Emotion/Feeling' }, { word: 'Terrified', category: 'Emotion/Feeling' },
    { word: 'Stubborn', category: 'Emotion/Feeling' }, { word: 'Gentle', category: 'Emotion/Feeling' }, { word: 'Fierce', category: 'Emotion/Feeling' },

    // Appearance / Color (Visual description, texture, condition)
    { word: 'Red', category: 'Appearance/Color' }, { word: 'Blue', category: 'Appearance/Color' }, { word: 'Green', category: 'Appearance/Color' },
    { word: 'Shiny', category: 'Appearance/Color' }, { word: 'Dull', category: 'Appearance/Color' }, { word: 'Bright', category: 'Appearance/Color' },
    { word: 'Dark', category: 'Appearance/Color' }, { word: 'Colorful', category: 'Appearance/Color' }, { word: 'Invisible', category: 'Appearance/Color' },
    { word: 'Sparkling', category: 'Appearance/Color' }, { word: 'Beautiful', category: 'Appearance/Color' }, { word: 'Ugly', category: 'Appearance/Color' },
    { word: 'Clean', category: 'Appearance/Color' }, { word: 'Dirty', category: 'Appearance/Color' }, { word: 'Messy', category: 'Appearance/Color' },
    { word: 'Neat', category: 'Appearance/Color' }, { word: 'Fuzzy', category: 'Appearance/Color' }, { word: 'Smooth', category: 'Appearance/Color' },
    { word: 'Rough', category: 'Appearance/Color' }, { word: 'Soft', category: 'Appearance/Color' }, { word: 'Hard', category: 'Appearance/Color' },
    { word: 'Wet', category: 'Appearance/Color' }, { word: 'Dry', category: 'Appearance/Color' }, { word: 'Sticky', category: 'Appearance/Color' },
    { word: 'Slippery', category: 'Appearance/Color' }, { word: 'Clear', category: 'Appearance/Color' }, { word: 'Muddy', category: 'Appearance/Color' },
    { word: 'Old', category: 'Appearance/Color' }, { word: 'New', category: 'Appearance/Color' }, { word: 'Broken', category: 'Appearance/Color' },
    { word: 'Golden', category: 'Appearance/Color' }, { word: 'Silver', category: 'Appearance/Color' }, { word: 'Wooden', category: 'Appearance/Color' },
    { word: 'Metallic', category: 'Appearance/Color' }, { word: 'Transparent', category: 'Appearance/Color' }, { word: 'Glowing', category: 'Appearance/Color' },

    // Size / Shape (Dimensions, form)
    { word: 'Big', category: 'Size/Shape' }, { word: 'Small', category: 'Size/Shape' }, { word: 'Tall', category: 'Size/Shape' },
    { word: 'Short', category: 'Size/Shape' }, { word: 'Long', category: 'Size/Shape' }, { word: 'Wide', category: 'Size/Shape' },
    { word: 'Narrow', category: 'Size/Shape' }, { word: 'Round', category: 'Size/Shape' }, { word: 'Square', category: 'Size/Shape' },
    { word: 'Flat', category: 'Size/Shape' }, { word: 'Thick', category: 'Size/Shape' }, { word: 'Thin', category: 'Size/Shape' },
    { word: 'Huge', category: 'Size/Shape' }, { word: 'Tiny', category: 'Size/Shape' }, { word: 'Giant', category: 'Size/Shape' },
    { word: 'Microscopic', category: 'Size/Shape' }, { word: 'Enormous', category: 'Size/Shape' }, { word: 'Massive', category: 'Size/Shape' },
    { word: 'Deep', category: 'Size/Shape' }, { word: 'Shallow', category: 'Size/Shape' }, { word: 'Triangular', category: 'Size/Shape' },
    { word: 'Oval', category: 'Size/Shape' }, { word: 'Curved', category: 'Size/Shape' }, { word: 'Straight', category: 'Size/Shape' },
    { word: 'Crooked', category: 'Size/Shape' }, { word: 'Pointy', category: 'Size/Shape' }, { word: 'Hollow', category: 'Size/Shape' },
    { word: 'Solid', category: 'Size/Shape' }, { word: 'Bulky', category: 'Size/Shape' }, { word: 'Slim', category: 'Size/Shape' },
    { word: 'Steep', category: 'Size/Shape' }, { word: 'Broad', category: 'Size/Shape' }, { word: 'Gigantic', category: 'Size/Shape' },
    { word: 'Miniature', category: 'Size/Shape' }, { word: 'Petite', category: 'Size/Shape' }, { word: 'Chubby', category: 'Size/Shape' }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const AdjectiveSortingGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
    const [shake, setShake] = useState(false);

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
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[650px] max-h-[90vh] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-yellow-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-yellow-500 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🗂️</span>
                        <h3 className="font-black text-2xl tracking-tight drop-shadow-sm">Adjective Master Challenge</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col items-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-50 via-slate-50 to-white">

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8 mt-8">
                            <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl">🎨</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">Sort the Adjectives!</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                                Can you categorize the describing words into <span className="text-rose-500 font-bold">Emotion/Feeling</span>, <span className="text-sky-500 font-bold">Appearance/Color</span>, and <span className="text-emerald-500 font-bold">Size/Shape</span>?
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-yellow-500 hover:bg-yellow-400 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
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
                                    Word <span className="text-yellow-600">{currentIndex + 1}</span> / {words.length}
                                </div>
                                <div className="text-xl font-black text-emerald-500 bg-white px-5 py-1.5 rounded-xl shadow-sm border border-emerald-200 flex items-center gap-2">
                                    <span>⭐</span> {score}
                                </div>
                            </div>

                            {/* Target Word Container */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-0 mb-8">
                                <div
                                    key={currentWord.word}
                                    className={`relative z-20 w-full max-w-md bg-white rounded-3xl shadow-xl border-b-[8px] border-slate-200 flex items-center justify-center p-8 md:p-12 animate-in slide-in-from-top-8 duration-500
                                        ${shake ? 'animate-[shake_0.5s_ease-in-out] border-red-500 bg-red-50' : ''}
                                        ${feedback === 'correct' ? 'border-emerald-500 bg-emerald-50 scale-105' : ''}
                                    `}
                                >
                                    <h1 className="text-5xl md:text-7xl font-black text-slate-800 tracking-tight text-center drop-shadow-sm">
                                        {currentWord.word}
                                    </h1>

                                    {/* Feedback Icons */}
                                    {feedback === 'correct' && (
                                        <div className="absolute -top-6 -right-6 text-6xl animate-in zoom-in duration-300 drop-shadow-lg">✨</div>
                                    )}
                                    {feedback === 'incorrect' && (
                                        <div className="absolute -top-6 -right-6 text-6xl animate-in zoom-in duration-300 drop-shadow-lg">❌</div>
                                    )}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mx-auto">
                                <button
                                    onClick={() => handleAnswer('Emotion/Feeling')}
                                    disabled={feedback !== null}
                                    className="group relative overflow-hidden bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 hover:border-rose-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10 relative">
                                        <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">❤️</span>
                                        <span className="font-black text-xl text-rose-800 uppercase tracking-wider whitespace-nowrap">Emotion / Feeling</span>
                                        <span className="text-sm font-medium text-rose-600/70 text-center">Happy, Sad, Angry</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-rose-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>

                                <button
                                    onClick={() => handleAnswer('Appearance/Color')}
                                    disabled={feedback !== null}
                                    className="group relative overflow-hidden bg-sky-50 hover:bg-sky-100 border-2 border-sky-200 hover:border-sky-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10 relative">
                                        <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">👀</span>
                                        <span className="font-black text-xl text-sky-800 uppercase tracking-wider whitespace-nowrap">Appearance / Color</span>
                                        <span className="text-sm font-medium text-sky-600/70 text-center">Blue, Shiny, Dirty</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-sky-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>

                                <button
                                    onClick={() => handleAnswer('Size/Shape')}
                                    disabled={feedback !== null}
                                    className="group relative overflow-hidden bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-400 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                                >
                                    <div className="flex flex-col items-center gap-2 z-10 relative">
                                        <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">📏</span>
                                        <span className="font-black text-xl text-emerald-800 uppercase tracking-wider whitespace-nowrap">Size / Shape</span>
                                        <span className="text-sm font-medium text-emerald-600/70 text-center">Big, Round, Tall</span>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-200/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'end' && (
                        <div className="text-center animate-in zoom-in-50 duration-500 mt-8">
                            <span className="text-8xl block mb-6 animate-bounce">🎖️</span>
                            <h2 className="text-5xl font-black text-slate-800 mb-2">Challenge Complete!</h2>
                            <p className="text-2xl text-slate-500 mb-8 font-medium">Your final score is:</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600 mb-12 drop-shadow-sm">
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
                                    className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white text-xl font-bold rounded-xl shadow-lg transition-colors border-b-4 border-yellow-600"
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

export default AdjectiveSortingGame;
