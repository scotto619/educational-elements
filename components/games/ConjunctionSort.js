import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

// Categories of Conjunctions
const CONJUNCTION_TYPES = [
    { id: 'coordinating', name: 'Coordinating', icon: '⚡', desc: 'FANBOYS (for, and, nor, but, or, yet, so)', color: 'amber' },
    { id: 'subordinating', name: 'Subordinating', icon: '🔗', desc: 'Starts a dependent clause (because, although, since)', color: 'emerald' },
    { id: 'correlative', name: 'Correlative', icon: '🧲', desc: 'Work in pairs (either/or, both/and)', color: 'indigo' }
];

const WORD_BANK = [
    // Coordinating (FANBOYS)
    { word: 'for', type: 'coordinating' },
    { word: 'and', type: 'coordinating' },
    { word: 'nor', type: 'coordinating' },
    { word: 'but', type: 'coordinating' },
    { word: 'or', type: 'coordinating' },
    { word: 'yet', type: 'coordinating' },
    { word: 'so', type: 'coordinating' },

    // Subordinating
    { word: 'because', type: 'subordinating' },
    { word: 'although', type: 'subordinating' },
    { word: 'since', type: 'subordinating' },
    { word: 'unless', type: 'subordinating' },
    { word: 'while', type: 'subordinating' },
    { word: 'if', type: 'subordinating' },
    { word: 'until', type: 'subordinating' },

    // Correlative (We'll show them as pairs for clarity in sorting)
    { word: 'either / or', type: 'correlative' },
    { word: 'neither / nor', type: 'correlative' },
    { word: 'both / and', type: 'correlative' },
    { word: 'not only / but also', type: 'correlative' },
    { word: 'whether / or', type: 'correlative' }
];

const ConjunctionSort = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentWord, setCurrentWord] = useState(null);
    const [wordQueue, setWordQueue] = useState([]);
    const [feedback, setFeedback] = useState(null);

    const [streak, setStreak] = useState(0);
    const [multiplier, setMultiplier] = useState(1);

    // Bins for visual drop effect
    const [activeBin, setActiveBin] = useState(null);

    const TARGET_WORDS = 15; // Number of words to sort to win

    useEffect(() => {
        if (gameState === 'start' && wordQueue.length === 0) {
            setWordQueue(shuffleArray([...WORD_BANK]));
        }
    }, [gameState, wordQueue]);

    const startGame = () => {
        const shuffled = shuffleArray([...WORD_BANK]);
        setWordQueue(shuffled.slice(1));
        setCurrentWord(shuffled[0]);
        setGameState('playing');
        setScore(0);
        setStreak(0);
        setMultiplier(1);
        setFeedback(null);
        setActiveBin(null);
    };

    const handleSort = (typeId) => {
        if (feedback || !currentWord) return;

        const isCorrect = currentWord.type === typeId;
        setActiveBin(typeId);

        if (isCorrect) {
            const pointsEarned = 10 * multiplier;
            setFeedback({ correct: true, text: `+${pointsEarned}` });
            setScore(s => s + pointsEarned);

            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak >= 3) setMultiplier(2);
            if (newStreak >= 6) setMultiplier(3);

        } else {
            setFeedback({ correct: false, text: 'Wrong Bin!' });
            setStreak(0);
            setMultiplier(1);
        }

        setTimeout(() => {
            setFeedback(null);
            setActiveBin(null);

            // Generate next word or win
            // Let's win based on total sorted words rather than score
            // Actually score is fun, let's win after sorting TARGET_WORDS
            const sortedCount = TARGET_WORDS - wordQueue.length;

            if (sortedCount >= TARGET_WORDS) {
                setGameState('won');
            } else {
                const nextQueue = [...wordQueue];
                const nextWord = nextQueue.shift();

                // If we run out of words before hitting target, re-shuffle
                if (!nextWord) {
                    const reshuffled = shuffleArray([...WORD_BANK]);
                    setCurrentWord(reshuffled[0]);
                    setWordQueue(reshuffled.slice(1));
                } else {
                    setCurrentWord(nextWord);
                    setWordQueue(nextQueue);
                }
            }
        }, 800);
    };


    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-8 text-center shadow-inner border-2 border-slate-300 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-slate-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🗂️
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Conjunction Sort</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            Conjunctions come in three main flavors! <br /><br />
                            Sort the conjunctions into the correct bins: <span className="text-amber-600 font-bold">Coordinating</span> (FANBOYS), <span className="text-emerald-600 font-bold">Subordinating</span>, or <span className="text-indigo-600 font-bold">Correlative</span>.
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(51,65,85,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START SORTING
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Sort {TARGET_WORDS} words to win. Build a streak for bonus points!</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-emerald-50 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🏆
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Organizer!</h2>
                        <p className="text-slate-600 mb-6 text-lg font-medium">
                            You've accurately sorted all those conjunctions into their classes. Excellent work categorizing!
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-1">Final Score</span>
                            <span className="text-5xl font-black text-emerald-600">{score}</span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-colors border border-slate-200"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(30,41,59,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Back to Map
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const wordsRemaining = TARGET_WORDS - ((TARGET_WORDS - wordQueue.length - 1) % TARGET_WORDS); // Approximate remaining for UI

        return (
            <div className="w-full h-[600px] flex flex-col bg-slate-100 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-slate-200 max-w-4xl mx-auto">
                {/* Header */}
                <div className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                            🗂️
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Sort It!</h2>
                            <p className="text-sm font-semibold text-slate-500">{wordsRemaining} left to sort</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Streak / Multiplier */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</span>
                            <div className="flex items-center gap-2">
                                {multiplier > 1 && <span className="text-sm font-black text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse px-2">{multiplier}x</span>}
                                <div className="flex gap-1 h-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`w-2 h-full rounded-full transition-all duration-300 ${i < Math.min(streak, 5) ? 'bg-amber-400' : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-10 bg-slate-200"></div>

                        {/* Score */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <span className="text-3xl font-black text-slate-700 leading-none">{score}</span>
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 flex flex-col items-center justify-between p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 relative">

                    {/* Active Word Card */}
                    <div className="mt-8 relative w-full flex justify-center h-[200px]">
                        {currentWord && (
                            <div className={`
                            absolute top-0 w-80 p-8 rounded-3xl border-4 text-center transition-all duration-300 transform
                            ${feedback
                                    ? (feedback.correct
                                        ? `bg-${CONJUNCTION_TYPES.find(t => t.id === currentWord.type).color}-100 border-${CONJUNCTION_TYPES.find(t => t.id === currentWord.type).color}-400 translate-y-32 scale-50 opacity-0`
                                        : 'bg-rose-100 border-rose-400 shake')
                                    : 'bg-white border-slate-300 shadow-xl hover:-translate-y-2 cursor-grab'}
                        `} style={{ transitionProperty: 'transform, opacity, background-color, border-color' }}>
                                <span className="text-4xl font-black text-slate-800 tracking-wider">
                                    {currentWord.word}
                                </span>
                            </div>
                        )}

                        {/* Feedback Floating Text */}
                        {feedback && (
                            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-black z-20 animate-in slide-in-from-bottom-4 fade-in duration-300 ${feedback.correct ? 'text-emerald-500 drop-shadow-md' : 'text-rose-500'}`}>
                                {feedback.text}
                            </div>
                        )}
                    </div>


                    {/* Sorting Bins */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-auto">
                        {CONJUNCTION_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => handleSort(type.id)}
                                disabled={feedback !== null}
                                className={`
                                relative p-6 rounded-3xl border-4 border-b-[8px] flex flex-col items-center justify-center transition-all duration-200
                                ${activeBin === type.id && !feedback?.correct ? `bg-${type.color}-200 border-${type.color}-500 scale-95` : `bg-${type.color}-50 border-${type.color}-300 hover:bg-${type.color}-100 hover:-translate-y-2`}
                                ${activeBin === type.id && feedback?.correct ? `bg-${type.color}-300 border-${type.color}-600 ring-4 ring-${type.color}-200 scale-105` : ''}
                            `}
                            >
                                <span className="text-5xl mb-4 drop-shadow-sm">{type.icon}</span>
                                <span className={`text-2xl font-black uppercase tracking-wider mb-2 text-${type.color}-800`}>{type.name}</span>
                                <span className={`text-sm font-bold text-center leading-tight text-${type.color}-600/80`}>{type.desc}</span>
                            </button>
                        ))}
                    </div>

                </div>

                {/* CSS for Shake animation */}
                <style jsx>{`
                .shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-2px, 0, 0); }
                    20%, 80% { transform: translate3d(4px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
                    40%, 60% { transform: translate3d(8px, 0, 0); }
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

export default ConjunctionSort;
