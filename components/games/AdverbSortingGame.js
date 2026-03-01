import React, { useState, useEffect } from 'react';

const WORD_BANK = [
    // How (Adverbs of Manner)
    { word: 'quickly', category: 'how' }, { word: 'slowly', category: 'how' },
    { word: 'carefully', category: 'how' }, { word: 'loudly', category: 'how' },
    { word: 'quietly', category: 'how' }, { word: 'happily', category: 'how' },
    { word: 'sadly', category: 'how' }, { word: 'eagerly', category: 'how' },
    { word: 'gently', category: 'how' }, { word: 'angrily', category: 'how' },
    { word: 'bravely', category: 'how' }, { word: 'fiercely', category: 'how' },
    { word: 'kindly', category: 'how' }, { word: 'neatly', category: 'how' },
    { word: 'politely', category: 'how' },

    // When (Adverbs of Time/Frequency)
    { word: 'now', category: 'when' }, { word: 'then', category: 'when' },
    { word: 'today', category: 'when' }, { word: 'tomorrow', category: 'when' },
    { word: 'yesterday', category: 'when' }, { word: 'always', category: 'when' },
    { word: 'never', category: 'when' }, { word: 'often', category: 'when' },
    { word: 'rarely', category: 'when' }, { word: 'sometimes', category: 'when' },
    { word: 'soon', category: 'when' }, { word: 'later', category: 'when' },
    { word: 'early', category: 'when' }, { word: 'tonight', category: 'when' },
    { word: 'already', category: 'when' },

    // Where (Adverbs of Place)
    { word: 'here', category: 'where' }, { word: 'there', category: 'where' },
    { word: 'everywhere', category: 'where' }, { word: 'nowhere', category: 'where' },
    { word: 'inside', category: 'where' }, { word: 'outside', category: 'where' },
    { word: 'upstairs', category: 'where' }, { word: 'downstairs', category: 'where' },
    { word: 'nearby', category: 'where' }, { word: 'far', category: 'where' },
    { word: 'away', category: 'where' }, { word: 'above', category: 'where' },
    { word: 'below', category: 'where' }, { word: 'ahead', category: 'where' },
    { word: 'behind', category: 'where' }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const AdverbSortingGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, message: string }
    const [shuffledBank, setShuffledBank] = useState([]);

    const TARGET_SCORE = 15;

    useEffect(() => {
        if (gameState === 'start') {
            setShuffledBank(shuffleArray([...WORD_BANK]).slice(0, 20));
        }
    }, [gameState]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setCurrentWordIndex(0);
        setFeedback(null);
        setShuffledBank(shuffleArray([...WORD_BANK]).slice(0, 20));
    };

    const handleSort = (selectedCategory) => {
        if (feedback) return; // Prevent clicking while animating feedback

        const currentWord = shuffledBank[currentWordIndex];
        const isCorrect = selectedCategory === currentWord.category;

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ isCorrect: true, message: 'Correct!' });
        } else {
            let properCategory = '';
            switch (currentWord.category) {
                case 'how': properCategory = 'How (Manner)'; break;
                case 'when': properCategory = 'When (Time)'; break;
                case 'where': properCategory = 'Where (Place)'; break;
                default: properCategory = 'Unknown';
            }
            setFeedback({ isCorrect: false, message: `Oops! "${currentWord.word}" tells us ${properCategory}.` });
        }

        setTimeout(() => {
            setFeedback(null);

            if (score + (isCorrect ? 1 : 0) >= TARGET_SCORE) {
                setGameState('won');
            } else {
                setCurrentWordIndex((prev) => (prev + 1) % shuffledBank.length);
            }
        }, 1500);
    };

    const currentWord = shuffledBank[currentWordIndex];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300 font-sans select-none">
            {/* Glassmorphic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[600px] md:h-[700px] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-indigo-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white z-20 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shadow-inner">
                            🗂️
                        </div>
                        <h3 className="font-black text-2xl tracking-tight uppercase">Adverb Sort</h3>
                    </div>
                    {gameState === 'playing' && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold uppercase tracking-wider text-indigo-200">Score</span>
                            <span className="text-2xl font-black text-white">{score} / {TARGET_SCORE}</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors z-50"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Play Area Container */}
                <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-indigo-50/30">

                    {gameState === 'start' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/10 backdrop-blur-sm z-30 p-4">
                            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-indigo-100 transform hover:scale-105 transition-transform duration-300 text-center">
                                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                                    🗂️
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">How, When, Where?</h2>
                                <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                                    Adverbs give us more detail about an action. <br /><br />Sort the adverbs into the correct category based on whether they tell us <span className="font-bold text-indigo-600">HOW</span>, <span className="font-bold text-emerald-600">WHEN</span>, or <span className="font-bold text-rose-600">WHERE</span> the action happened!
                                </p>
                                <button
                                    onClick={startGame}
                                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                                >
                                    START SORTING
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'won' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/90 backdrop-blur-md z-30 p-4 animate-in fade-in duration-500">
                            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-emerald-50 text-center animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                                    🏆
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Sorter!</h2>
                                <p className="text-slate-600 mb-8 text-lg font-medium">
                                    You successfully categorized the adverbs! Excellent job analyzing how, when, and where actions occur.
                                </p>
                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={startGame}
                                        className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-colors border border-slate-200"
                                    >
                                        Play Again
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                                    >
                                        Back to Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'playing' && currentWord && (
                        <div className="absolute inset-0 flex flex-col items-center justify-between p-8">
                            {/* Active Word Display */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mb-8">
                                <div className={`
                                    w-full bg-white px-8 py-16 rounded-3xl shadow-xl border-4 flex flex-col items-center justify-center relative
                                    ${feedback ? (feedback.isCorrect ? 'border-emerald-400 ring-4 ring-emerald-100' : 'border-rose-400 ring-4 ring-rose-100') : 'border-indigo-100'} 
                                    transform transition-all duration-500
                                    ${feedback ? (feedback.isCorrect ? 'scale-105 -translate-y-2' : 'shake') : 'hover:-translate-y-1 hover:shadow-2xl'}
                                `}>
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Sort This Adverb</span>
                                    <span className="text-6xl md:text-7xl font-black text-slate-800 tracking-tight capitalize drop-shadow-sm text-center break-words w-full">
                                        {currentWord.word}
                                    </span>

                                    {/* Feedback Message */}
                                    {feedback && (
                                        <div className={`absolute -bottom-6 px-8 py-3 rounded-full font-bold text-base shadow-lg whitespace-nowrap animate-in slide-in-from-top-2 z-10 ${feedback.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                            {feedback.message}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-auto shrink-0">
                                <button
                                    onClick={() => handleSort('how')}
                                    disabled={!!feedback}
                                    className="group flex flex-col items-center justify-center bg-white p-6 rounded-3xl border-b-8 border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:translate-y-2 active:border-b-0"
                                >
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner group-hover:scale-110 transition-transform">
                                        🎭
                                    </div>
                                    <span className="text-3xl font-black text-indigo-900 tracking-wide">HOW</span>
                                    <span className="text-sm font-bold text-indigo-500 mt-1 uppercase">(Manner)</span>
                                </button>

                                <button
                                    onClick={() => handleSort('when')}
                                    disabled={!!feedback}
                                    className="group flex flex-col items-center justify-center bg-white p-6 rounded-3xl border-b-8 border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:translate-y-2 active:border-b-0"
                                >
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner group-hover:scale-110 transition-transform">
                                        ⏰
                                    </div>
                                    <span className="text-3xl font-black text-emerald-900 tracking-wide">WHEN</span>
                                    <span className="text-sm font-bold text-emerald-500 mt-1 uppercase">(Time)</span>
                                </button>

                                <button
                                    onClick={() => handleSort('where')}
                                    disabled={!!feedback}
                                    className="group flex flex-col items-center justify-center bg-white p-6 rounded-3xl border-b-8 border-rose-200 hover:border-rose-500 hover:bg-rose-50 shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:translate-y-2 active:border-b-0"
                                >
                                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner group-hover:scale-110 transition-transform">
                                        📍
                                    </div>
                                    <span className="text-3xl font-black text-rose-900 tracking-wide">WHERE</span>
                                    <span className="text-sm font-bold text-rose-500 mt-1 uppercase">(Place)</span>
                                </button>
                            </div>
                        </div>
                    )}
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

export default AdverbSortingGame;
