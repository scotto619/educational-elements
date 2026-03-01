import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

// We use emojis to represent the relations
const SCENARIOS = [
    { catPos: 'top', cat: '🐈', object: '📦', correctAns: 'on', phrase: 'The cat is ___ the box.' },
    { catPos: 'bottom', cat: '🐈', object: '📦', correctAns: 'under', phrase: 'The cat is ___ the box.' },
    { catPos: 'center', cat: '🐈', object: '📦', correctAns: 'in', phrase: 'The cat is ___ the box.', isInside: true },
    { catPos: 'left', cat: '🐈', object: '📦', correctAns: 'next to', phrase: 'The cat is ___ the box.' },
    { catPos: 'right', cat: '🐈', object: '📦', correctAns: 'beside', phrase: 'The cat is ___ the box.' },
    { catPos: 'behind', cat: '🐈', object: '📦', correctAns: 'behind', phrase: 'The cat is ___ the box.', isBehind: true }, // custom render layer
    { catPos: 'between', cat: '🐈', object: '📦📦', correctAns: 'between', phrase: 'The cat is ___ the boxes.', isBetween: true },
    { catPos: 'above', cat: '🦅', object: '☁️', correctAns: 'above', phrase: 'The bird is flying ___ the clouds.' },
    { catPos: 'through', cat: '🚗', object: '🚇', correctAns: 'through', phrase: 'The car drives ___ the tunnel.' }
];

const PREPOSITION_OPTIONS = ['in', 'on', 'under', 'next to', 'beside', 'behind', 'between', 'above', 'through', 'over', 'around', 'near'];

const PrepositionLocationGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);
    const [currentOptions, setCurrentOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);

    const TARGET_SCORE = 8;

    useEffect(() => {
        if (gameState === 'start' && shuffledScenarios.length === 0) {
            setShuffledScenarios(shuffleArray([...SCENARIOS]).slice(0, TARGET_SCORE));
        }
    }, [gameState, shuffledScenarios]);

    const startGame = () => {
        const scenarios = shuffleArray([...SCENARIOS]).slice(0, TARGET_SCORE);
        setShuffledScenarios(scenarios);
        setGameState('playing');
        setScore(0);
        setCurrentScenarioIndex(0);
        setFeedback(null);
        setupOptions(scenarios[0]);
    };

    const setupOptions = (scenario) => {
        const pool = PREPOSITION_OPTIONS.filter(p => p !== scenario.correctAns);
        // Special case: bedside and next to are often synonymous here, let's avoid putting both as options if one is correct unless we want it tricky.
        // Actually, let's just use random for now but ensure we only have 4 options total.
        const distractors = shuffleArray(pool).slice(0, 3);
        setCurrentOptions(shuffleArray([scenario.correctAns, ...distractors]));
    };

    const handleAnswer = (selectedAns) => {
        if (feedback) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const isCorrect = selectedAns === currentScenario.correctAns;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Spot on!' });
            const newScore = score + 1;
            setScore(newScore);

            setTimeout(() => {
                if (newScore >= TARGET_SCORE) {
                    setGameState('won');
                } else {
                    const nextIndex = currentScenarioIndex + 1;
                    setCurrentScenarioIndex(nextIndex);
                    setupOptions(shuffledScenarios[nextIndex]);
                    setFeedback(null);
                }
            }, 1000);
        } else {
            setFeedback({ correct: false, text: `Oops! Try looking closer.` });
            setTimeout(() => setFeedback(null), 1000);
        }
    };

    // --- Rendering the Visual Scene ---
    const renderScene = (scenario) => {
        if (!scenario) return null;

        const { catPos, cat, object, isInside, isBehind, isBetween } = scenario;

        return (
            <div className="relative w-64 h-64 bg-sky-100 rounded-3xl border-4 border-sky-200 flex items-center justify-center overflow-hidden shadow-inner mx-auto mb-8">
                {/* Visual rendering logic based on 'catPos' */}

                {isBetween ? (
                    <div className="flex items-end justify-center h-full pb-8">
                        <span className="text-6xl z-10 mx-2">{object.substring(0, 2)}</span> {/* 📦 */}
                        <span className="text-6xl z-20 mb-2 transform hover:scale-110 transition-transform">{cat}</span>
                        <span className="text-6xl z-10 mx-2">{object.substring(2)}</span> {/* 📦 */}
                    </div>
                ) : isInside ? (
                    <div className="relative flex items-center justify-center h-full">
                        {/* We fake "inside" by clipping or layering */}
                        <div className="text-[120px] absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-90">{object}</div>
                        <div className="text-5xl absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mb-4 animate-bounce">{cat}</div>
                    </div>
                ) : isBehind ? (
                    <div className="relative flex items-center justify-center h-full">
                        <div className="text-[100px] absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{object}</div>
                        <div className="text-5xl absolute z-10 top-1/2 left-1/2 transform translate-x-4 -translate-y-6 pt-2">{cat}</div>
                    </div>
                ) : (
                    <div className="relative flex items-center justify-center w-full h-full">
                        <div className="text-[100px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">{object}</div>

                        {catPos === 'top' && <div className="text-6xl absolute z-20 top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-4 animate-bounce">{cat}</div>}
                        {catPos === 'bottom' && <div className="text-6xl absolute z-20 bottom-[10%] left-1/2 transform -translate-x-1/2 translate-y-2">{cat}</div>}
                        {catPos === 'left' && <div className="text-6xl absolute z-20 top-1/2 left-1/4 transform -translate-x-8 -translate-y-1/2">{cat}</div>}
                        {catPos === 'right' && <div className="text-6xl absolute z-20 top-1/2 right-1/4 transform translate-x-8 -translate-y-1/2">{cat}</div>}

                        {catPos === 'above' && <div className="text-6xl absolute z-20 top-[15%] left-1/2 transform -translate-x-1/2 -translate-y-6 animate-pulse">{cat}</div>}
                        {catPos === 'through' && <div className="text-6xl absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-125 opacity-80">{cat}</div>}
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-emerald-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🐈
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Where is the Cat?</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            Prepositions help us understand where things are in relation to each other. <br /><br />
                            Look at the picture and choose the <span className="font-bold text-emerald-600">correct preposition</span> to complete the sentence!
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START SEARCH
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Complete {TARGET_SCORE} locations to win.</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 rounded-3xl p-8 text-center shadow-inner border-2 border-indigo-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-indigo-50 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🏆
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Finder!</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            You successfully identified all the spatial relationships using prepositions. Excellent observation skills!
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
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Back to Map
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const currentScenario = shuffledScenarios[currentScenarioIndex];

        return (
            <div className="w-full h-[600px] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-slate-100 max-w-4xl mx-auto">
                {/* Header */}
                <div className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                            📍
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Where is it?</h2>
                            <p className="text-sm font-semibold text-slate-500">Find {TARGET_SCORE} locations!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-emerald-600 leading-none">{score}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                            </div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(score / TARGET_SCORE) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">

                    <div className={`
                    bg-white p-8 rounded-3xl shadow-xl border-4 transition-all duration-300 w-full max-w-2xl
                    ${feedback ? (feedback.correct ? 'border-emerald-400 ring-4 ring-emerald-100 scale-105' : 'border-rose-400 ring-4 ring-rose-100 shake') : 'border-slate-100 hover:-translate-y-2'}
                `}>

                        {/* The Visual Scene */}
                        {renderScene(currentScenario)}

                        {/* The Sentence */}
                        <div className="text-center mt-4 mb-8">
                            <p className="text-2xl font-bold text-slate-700 tracking-wide">
                                {currentScenario?.phrase.split('___')[0]}
                                <span className="inline-block min-w-[100px] border-b-4 border-emerald-300 mx-2 text-emerald-600 text-3xl pb-1 px-4 empty:bg-slate-100 empty:h-8 rounded-t-lg transition-all">
                                    {feedback?.correct ? currentScenario.correctAns : '?'}
                                </span>
                                {currentScenario?.phrase.split('___')[1]}
                            </p>
                        </div>

                        {/* Feedback Overlay */}
                        {feedback ? (
                            <div className={`text-center py-4 rounded-xl font-black text-2xl uppercase tracking-widest animate-in slide-in-from-bottom-2 ${feedback.correct ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'}`}>
                                {feedback.text}
                            </div>
                        ) : (
                            /* Options Grid */
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4">
                                {currentOptions.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        className="py-4 px-2 bg-slate-50 hover:bg-emerald-50 rounded-xl border-2 border-slate-200 hover:border-emerald-400 text-xl font-black text-slate-600 hover:text-emerald-700 shadow-sm transition-all hover:-translate-y-1 active:scale-95 capitalize"
                                    >
                                        {opt}
                                    </button>
                                ))}
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

export default PrepositionLocationGame;
