import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

// Subordinating Conjunctions: Although, Because, Since, Unless, While, If etc.
// Correlative Conjunctions: Either/Or, Neither/Nor, Both/And
const SCENARIOS = [
    {
        start: "___ it was raining,",
        end: "we still went to the park.",
        correct: "Although",
        distractors: ["Because", "If"],
        type: "Subordinating",
        explanation: "'Although' shows contrast between the weather and the action."
    },
    {
        start: "I am staying inside ___",
        end: "I have a terrible cold.",
        correct: "because",
        distractors: ["unless", "although"],
        type: "Subordinating",
        explanation: "'Because' introduces the reason for staying inside."
    },
    {
        start: "___ you finish your homework,",
        end: "you cannot play video games.",
        correct: "Unless",
        distractors: ["Since", "Because"],
        type: "Subordinating",
        explanation: "'Unless' introduces a condition that must be met."
    },
    {
        start: "___ my mom AND my dad",
        end: "love to cook Italian food.",
        correct: "Both",
        distractors: ["Either", "Neither"],
        type: "Correlative",
        explanation: "'Both' pairs with 'and' to include two subjects."
    },
    {
        start: "You can have ___ chocolate",
        end: "OR vanilla ice cream.",
        correct: "either",
        distractors: ["neither", "both"],
        type: "Correlative",
        explanation: "'Either' pairs with 'or' to offer a choice."
    },
    {
        start: "___ I was walking to school,",
        end: "I saw a beautiful bluebird.",
        correct: "While",
        distractors: ["If", "Unless"],
        type: "Subordinating",
        explanation: "'While' shows two actions happening at the same time."
    },
    {
        start: "I will help you ___",
        end: "you promise to do your best.",
        correct: "if",
        distractors: ["although", "unless"],
        type: "Subordinating",
        explanation: "'If' introduces a condition."
    },
    {
        start: "___ Sarah NOR Tom",
        end: "knew the answer to the riddle.",
        correct: "Neither",
        distractors: ["Either", "Both"],
        type: "Correlative",
        explanation: "'Neither' pairs with 'nor' to mean 'not one and not the other'."
    }
];

const ConjunctionBridgeBuilder = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);

    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [bridgeBuilt, setBridgeBuilt] = useState(false);

    const TARGET_SCORE = 6;

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
        setBridgeBuilt(false);
        setupLevel(scenarios[0]);
    };

    const setupLevel = (scenario) => {
        setBridgeBuilt(false);
        const levelOptions = [scenario.correct, ...scenario.distractors];
        setOptions(shuffleArray(levelOptions));
    };

    const handleAnswer = (selectedWord) => {
        if (feedback) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const isCorrect = selectedWord === currentScenario.correct;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Bridge Built!', explanation: currentScenario.explanation });
            setBridgeBuilt(true);
            const newScore = score + 1;
            setScore(newScore);

            setTimeout(() => {
                if (newScore >= TARGET_SCORE) {
                    setGameState('won');
                } else {
                    const nextIndex = currentScenarioIndex + 1;
                    setCurrentScenarioIndex(nextIndex);
                    setupLevel(shuffledScenarios[nextIndex]);
                    setFeedback(null);
                }
            }, 3000);
        } else {
            setFeedback({ correct: false, text: `Bridge Collapsed!`, explanation: "That conjunction doesn't fit the context." });

            // Re-enable after short delay
            setTimeout(() => setFeedback(null), 1500);
        }
    };


    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 rounded-3xl p-8 text-center shadow-inner border-2 border-indigo-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-indigo-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🌉
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Bridge Builder</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            <span className="font-bold">Subordinating</span> and <span className="font-bold">Correlative</span> conjunctions build strong bridges between complex ideas. <br /><br />
                            Choose the right conjunction block to complete the bridge so the car can cross safely!
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START BUILDING
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Build {TARGET_SCORE} bridges to win.</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-emerald-50 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🌉
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Engineer!</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            You've built strong grammatical bridges linking complex thoughts and conditions perfectly. Incredible work!
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
        // Check if the blank is at the start or in the middle for rendering
        const startsWithBlank = currentScenario.start.startsWith('___');

        return (
            <div className="w-full h-[600px] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-slate-100 max-w-4xl mx-auto">
                {/* Header */}
                <div className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                            🌉
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Bridge Builder</h2>
                            <span className="text-xs font-bold px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-500 tracking-wider">
                                {currentScenario?.type}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-indigo-500 leading-none">{score}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                            </div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                            <div
                                className="h-full bg-indigo-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(score / TARGET_SCORE) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 flex flex-col p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-sky-200 relative overflow-hidden">

                    {/* River Background */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-blue-500 opacity-80 z-0 border-t-8 border-blue-400 flex items-center justify-around overflow-hidden">
                        {/* Waves */}
                        <div className="w-full h-full relative">
                            <div className="absolute top-4 left-10 text-white/30 text-2xl font-black animate-pulse">~ ~ ~</div>
                            <div className="absolute top-10 right-20 text-white/30 text-2xl font-black animate-pulse" style={{ animationDelay: '0.5s' }}>~ ~ ~</div>
                            <div className="absolute top-20 left-1/2 text-white/30 text-2xl font-black animate-pulse" style={{ animationDelay: '1s' }}>~ ~ ~</div>
                        </div>
                    </div>


                    {/* Bridge Structure */}
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full gap-2 mt-8">

                        {/* The Car waiting to cross */}
                        <div className={`absolute left-0 bottom-44 text-5xl z-20 transition-all duration-[3000ms] ease-in-out ${bridgeBuilt ? 'translate-x-[600px]' : ''}`}>
                            🚗
                        </div>

                        {/* Left Cliff */}
                        <div className="absolute left-[-20%] bottom-[-10%] w-[40%] h-[300px] bg-emerald-700 rounded-t-full z-10 border-r-[16px] border-emerald-800"></div>
                        {/* Right Cliff */}
                        <div className="absolute right-[-20%] bottom-[-10%] w-[40%] h-[300px] bg-emerald-700 rounded-t-full z-10 border-l-[16px] border-emerald-800"></div>


                        {/* Context Frame - shows the sentence components */}
                        <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl shadow-xl w-full max-w-2xl border-4 border-indigo-200 text-center mb-[180px] z-20 relative">

                            {/* Sentence Render */}
                            <div className="text-2xl md:text-3xl font-bold text-slate-700 leading-relaxed flex flex-wrap justify-center items-end gap-x-2 gap-y-4">

                                {startsWithBlank ? (
                                    <>
                                        <div className={`
                                        min-w-[140px] text-center pb-1 border-b-4 border-dashed rounded-b-sm transition-all shadow-inner px-4 text-3xl
                                        ${feedback
                                                ? (feedback.correct ? 'bg-emerald-100 border-emerald-500 text-emerald-700 solid border-b-8' : 'bg-rose-100 border-rose-500 text-rose-700 shake')
                                                : 'bg-indigo-50 border-indigo-300 text-indigo-400'}
                                    `}>
                                            {feedback ? (feedback.correct ? currentScenario.correct : '?') : '___'}
                                        </div>
                                        <span>{currentScenario.start.replace('___ ', '')}</span>
                                        <span>{currentScenario.end}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{currentScenario.start.split('___')[0]}</span>
                                        <div className={`
                                        min-w-[140px] text-center pb-1 border-b-4 border-dashed rounded-b-sm transition-all shadow-inner px-4 text-3xl
                                        ${feedback
                                                ? (feedback.correct ? 'bg-emerald-100 border-emerald-500 text-emerald-700 solid border-b-8' : 'bg-rose-100 border-rose-500 text-rose-700 shake')
                                                : 'bg-indigo-50 border-indigo-300 text-indigo-400'}
                                    `}>
                                            {feedback ? (feedback.correct ? currentScenario.correct : '?') : '___'}
                                        </div>
                                        <span>{currentScenario.start.split('___')[1]}</span>
                                        <span>{currentScenario.end}</span>
                                    </>
                                )}
                            </div>

                            {/* Explanation / Feedback details */}
                            {feedback && (
                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 min-w-full">
                                    <div className={`px-6 py-2 rounded-xl text-white font-bold text-lg shadow-lg whitespace-nowrap animate-in slide-in-from-top-2 ${feedback.correct ? 'bg-emerald-600 border-2 border-emerald-400' : 'bg-rose-600 border-2 border-rose-400'}`}>
                                        {feedback.explanation}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* The physical bridge segment (visual only) */}
                        <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 w-80 h-4 bg-slate-300 z-10 flex justify-between px-4">
                            <div className="w-2 h-full bg-slate-400"></div><div className="w-2 h-full bg-slate-400"></div><div className="w-2 h-full bg-slate-400"></div>

                            {/* The missing block that drops in */}
                            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-4 transition-all duration-300
                            ${bridgeBuilt ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,1)]' : 'bg-transparent border-t-4 border-dashed border-red-400'}
                        `}></div>
                        </div>


                    </div>

                    {/* Options / Action Area */}
                    <div className="mt-auto relative z-30 flex flex-col items-center">
                        <div className={`flex flex-wrap justify-center gap-4 transition-opacity duration-300 ${feedback ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswer(option)}
                                    className="py-4 px-8 bg-white hover:bg-indigo-50 rounded-xl border-4 border-slate-300 hover:border-indigo-400 text-2xl font-black text-slate-700 shadow-[0_6px_0_rgba(148,163,184,1)] hover:-translate-y-1 active:translate-y-2 active:shadow-none transition-all uppercase min-w-[140px]"
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
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

export default ConjunctionBridgeBuilder;
