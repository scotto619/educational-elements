import React, { useState, useEffect } from 'react';

const wordBank = [
    // Common Nouns
    { word: 'Dog', category: 'Common' }, { word: 'City', category: 'Common' }, { word: 'Teacher', category: 'Common' },
    { word: 'Car', category: 'Common' }, { word: 'Book', category: 'Common' }, { word: 'Table', category: 'Common' },
    { word: 'Chair', category: 'Common' }, { word: 'House', category: 'Common' }, { word: 'Tree', category: 'Common' },
    { word: 'Flower', category: 'Common' }, { word: 'River', category: 'Common' }, { word: 'Mountain', category: 'Common' },
    { word: 'Ocean', category: 'Common' }, { word: 'Bird', category: 'Common' }, { word: 'Fish', category: 'Common' },
    { word: 'Cat', category: 'Common' }, { word: 'Computer', category: 'Common' }, { word: 'Phone', category: 'Common' },
    { word: 'Shoe', category: 'Common' }, { word: 'Shirt', category: 'Common' }, { word: 'Guitar', category: 'Common' },
    { word: 'Piano', category: 'Common' }, { word: 'Bus', category: 'Common' }, { word: 'Train', category: 'Common' },
    { word: 'Plane', category: 'Common' }, { word: 'Bicycle', category: 'Common' }, { word: 'Road', category: 'Common' },
    { word: 'Bridge', category: 'Common' },

    // Proper Nouns
    { word: 'Paris', category: 'Proper' }, { word: 'Mr. Smith', category: 'Proper' }, { word: 'Australia', category: 'Proper' },
    { word: 'Jupiter', category: 'Proper' }, { word: 'Google', category: 'Proper' }, { word: 'London', category: 'Proper' },
    { word: 'Tokyo', category: 'Proper' }, { word: 'New York', category: 'Proper' }, { word: 'Amazon', category: 'Proper' },
    { word: 'Microsoft', category: 'Proper' }, { word: 'Apple', category: 'Proper' }, { word: 'McDonalds', category: 'Proper' },
    { word: 'Coca-Cola', category: 'Proper' }, { word: 'Nike', category: 'Proper' }, { word: 'Adidas', category: 'Proper' },
    { word: 'Disney', category: 'Proper' }, { word: 'Netflix', category: 'Proper' }, { word: 'Earth', category: 'Proper' },
    { word: 'Mars', category: 'Proper' }, { word: 'Venus', category: 'Proper' }, { word: 'Saturn', category: 'Proper' },
    { word: 'Pacific Ocean', category: 'Proper' }, { word: 'Mount Everest', category: 'Proper' }, { word: 'Eiffel Tower', category: 'Proper' },
    { word: 'Statue of Liberty', category: 'Proper' }, { word: 'Colosseum', category: 'Proper' }, { word: 'Taj Mahal', category: 'Proper' },
    { word: 'Great Wall', category: 'Proper' },

    // Abstract Nouns
    { word: 'Happiness', category: 'Abstract' }, { word: 'Bravery', category: 'Abstract' }, { word: 'Freedom', category: 'Abstract' },
    { word: 'Anger', category: 'Abstract' }, { word: 'Love', category: 'Abstract' }, { word: 'Courage', category: 'Abstract' },
    { word: 'Justice', category: 'Abstract' }, { word: 'Truth', category: 'Abstract' }, { word: 'Honesty', category: 'Abstract' },
    { word: 'Loyalty', category: 'Abstract' }, { word: 'Wisdom', category: 'Abstract' }, { word: 'Knowledge', category: 'Abstract' },
    { word: 'Patience', category: 'Abstract' }, { word: 'Peace', category: 'Abstract' }, { word: 'Joy', category: 'Abstract' },
    { word: 'Sorrow', category: 'Abstract' }, { word: 'Fear', category: 'Abstract' }, { word: 'Hope', category: 'Abstract' },
    { word: 'Trust', category: 'Abstract' }, { word: 'Belief', category: 'Abstract' }, { word: 'Faith', category: 'Abstract' },
    { word: 'Beauty', category: 'Abstract' }, { word: 'Brilliance', category: 'Abstract' }, { word: 'Chaos', category: 'Abstract' },
    { word: 'Success', category: 'Abstract' }, { word: 'Failure', category: 'Abstract' }, { word: 'Childhood', category: 'Abstract' },
    { word: 'Friendship', category: 'Abstract' },

    // Collective Nouns
    { word: 'Flock', category: 'Collective' }, { word: 'Herd', category: 'Collective' }, { word: 'Swarm', category: 'Collective' },
    { word: 'Team', category: 'Collective' }, { word: 'Class', category: 'Collective' }, { word: 'Crowd', category: 'Collective' },
    { word: 'Group', category: 'Collective' }, { word: 'Family', category: 'Collective' }, { word: 'Audience', category: 'Collective' },
    { word: 'Committee', category: 'Collective' }, { word: 'Jury', category: 'Collective' }, { word: 'Choir', category: 'Collective' },
    { word: 'Band', category: 'Collective' }, { word: 'Orchestra', category: 'Collective' }, { word: 'Staff', category: 'Collective' },
    { word: 'Crew', category: 'Collective' }, { word: 'Army', category: 'Collective' }, { word: 'Navy', category: 'Collective' },
    { word: 'Fleet', category: 'Collective' }, { word: 'School', category: 'Collective' }, { word: 'Pod', category: 'Collective' },
    { word: 'Pride', category: 'Collective' }, { word: 'Pack', category: 'Collective' }, { word: 'Gaggle', category: 'Collective' },
    { word: 'Bunch', category: 'Collective' }, { word: 'Bundle', category: 'Collective' }, { word: 'Set', category: 'Collective' },
    { word: 'Stack', category: 'Collective' }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const NounSortingGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect'
    const [shake, setShake] = useState(false);

    useEffect(() => {
        if (gameState === 'start') {
            setWords(shuffleArray([...wordBank]).slice(0, 10)); // Play 10 random words
        }
    }, [gameState]);

    const startGame = () => {
        setWords(shuffleArray([...wordBank]).slice(0, 10)); // Draw fresh words on each start
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

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[600px] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-indigo-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🎮</span>
                        <h3 className="font-black text-2xl tracking-tight">Noun Master Challenge</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8">
                            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl">👑</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">Ready to Rule?</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                                Prove your grammar skills! Sort the nouns into the correct kingdom bins before time runs out.
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                START CHALLENGE
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="w-full h-full flex flex-col justify-between">
                            {/* Score & Progress */}
                            <div className="flex justify-between items-center w-full max-w-2xl mx-auto mb-8">
                                <div className="text-lg font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                                    Word <span className="text-indigo-600">{currentIndex + 1}</span> / {words.length}
                                </div>
                                <div className="text-2xl font-black text-amber-500 bg-white px-6 py-2 rounded-xl shadow-sm border border-amber-200 flex items-center gap-2">
                                    <span>⭐</span> {score}
                                </div>
                            </div>

                            {/* The Word Panel */}
                            <div className={`relative flex items-center justify-center flex-1 w-full max-w-2xl mx-auto
                                ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}
                            `}>
                                <div className={`w-full py-16 px-8 rounded-3xl shadow-xl border-4 text-center transition-all duration-300 transform
                                    ${feedback === 'correct' ? 'bg-emerald-500 border-emerald-600 scale-105 shadow-emerald-500/50' :
                                        feedback === 'incorrect' ? 'bg-rose-500 border-rose-600 scale-95 shadow-rose-500/50' :
                                            'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-2xl'}
                                `}>
                                    <h1 className={`text-6xl md:text-8xl font-black tracking-tight ${feedback ? 'text-white' : 'text-slate-800'}`}>
                                        {currentWord?.word}
                                    </h1>

                                    {/* Feedback Badges */}
                                    {feedback === 'correct' && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-emerald-600 font-bold px-6 py-2 rounded-full shadow-lg border-2 border-emerald-200 animate-in slide-in-from-top-4">
                                            +10 POINTS! 🎉
                                        </div>
                                    )}
                                    {feedback === 'incorrect' && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-rose-600 font-bold px-6 py-2 rounded-full shadow-lg border-2 border-rose-200 animate-in slide-in-from-top-4">
                                            TRY AGAIN! ❌
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* The Buttons / Buckets */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                                {[
                                    { id: 'Common', icon: '🌍', color: 'blue' },
                                    { id: 'Proper', icon: '🏛️', color: 'purple' },
                                    { id: 'Abstract', icon: '💭', color: 'rose' },
                                    { id: 'Collective', icon: '👥', color: 'teal' }
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleAnswer(cat.id)}
                                        disabled={!!feedback}
                                        className={`p-6 rounded-2xl border-b-4 bg-white hover:-translate-y-1 active:translate-y-1 transition-all shadow-md group
                                            ${cat.color === 'blue' ? 'border-blue-500 hover:bg-blue-50' : ''}
                                            ${cat.color === 'purple' ? 'border-purple-500 hover:bg-purple-50' : ''}
                                            ${cat.color === 'rose' ? 'border-rose-500 hover:bg-rose-50' : ''}
                                            ${cat.color === 'teal' ? 'border-teal-500 hover:bg-teal-50' : ''}
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <span className={`text-4xl block mb-2 group-hover:scale-110 transition-transform`}>{cat.icon}</span>
                                        <div className="font-bold text-slate-700">{cat.id} Noun</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {gameState === 'end' && (
                        <div className="text-center animate-in zoom-in-50 duration-500">
                            <span className="text-8xl block mb-6 animate-bounce">🏆</span>
                            <h2 className="text-5xl font-black text-slate-800 mb-2">Challenge Complete!</h2>
                            <p className="text-2xl text-slate-500 mb-8 font-medium">You scored a massive</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-12 drop-shadow-sm">
                                {score} <span className="text-4xl">pts</span>
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
                                    className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold rounded-xl shadow-lg transition-colors"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Inject custom shake animation inline for simplicity */}
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

export default NounSortingGame;
