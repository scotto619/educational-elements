import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/gameHelpers';

// FANBOYS: For, And, Nor, But, Or, Yet, So
const SCENARIOS = [
    {
        part1: "I wanted to go to the park,",
        part2: "it started raining.",
        correct: "but",
        distractors: ["and", "or", "so"],
        explanation: "'But' shows a contrast or exception."
    },
    {
        part1: "Do you want chocolate",
        part2: "vanilla ice cream?",
        correct: "or",
        distractors: ["and", "but", "so"],
        explanation: "'Or' presents a choice."
    },
    {
        part1: "She studied hard for the test,",
        part2: "she got an A+.",
        correct: "so",
        distractors: ["but", "or", "yet"],
        explanation: "'So' shows a consequence or result."
    },
    {
        part1: "He likes apples",
        part2: "he likes bananas too.",
        correct: "and",
        distractors: ["but", "or", "yet"],
        explanation: "'And' adds information together."
    },
    {
        part1: "The movie was very long,",
        part2: "it was incredibly boring.",
        correct: "and",
        distractors: ["but", "for", "or"],
        explanation: "'And' connects two similar ideas."
    },
    {
        part1: "I am allergic to cats,",
        part2: "I have three of them.",
        correct: "yet",
        distractors: ["so", "and", "or"],
        explanation: "'Yet' shows a surprising contrast (similar to 'but')."
    },
    {
        part1: "He didn't want to wake up early,",
        part2: "he set his alarm anyway.",
        correct: "but",
        distractors: ["so", "for", "and"],
        explanation: "'But' shows opposition."
    },
    {
        part1: "We could go to the museum,",
        part2: "we could stay home and read.",
        correct: "or",
        distractors: ["so", "and", "but"],
        explanation: "'Or' presents alternatives."
    },
    {
        part1: "I brought an umbrella,",
        part2: "the forecast predicted rain.",
        correct: "for",
        distractors: ["but", "and", "so"],
        explanation: "'For' explains a reason (similar to 'because')."
    },
    {
        part1: "She was very tired,",
        part2: "she kept working until midnight.",
        correct: "yet",
        distractors: ["so", "or", "and"],
        explanation: "'Yet' shows contrast despite the first statement."
    }
];

const ConjunctionConductor = ({ onComplete }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);

    // Train Car states
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, text: string, explanation?: string }

    const TARGET_SCORE = 7;

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
        setupLevel(scenarios[0]);
    };

    const setupLevel = (scenario) => {
        // Options are the correct conjunction + distractors
        const levelOptions = [scenario.correct, ...shuffleArray(scenario.distractors).slice(0, 3)];
        setOptions(shuffleArray(levelOptions));
    };

    const handleAnswer = (selectedConjunction) => {
        if (feedback) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const isCorrect = selectedConjunction === currentScenario.correct;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Cars Connected!', explanation: currentScenario.explanation });
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
            }, 3000); // Wait longer so they can read the explanation
        } else {
            setFeedback({ correct: false, text: `Derailment! Try another car.`, explanation: "That conjunction doesn't logically connect the sentences." });
            setTimeout(() => setFeedback(null), 1500);
        }
    };


    if (gameState === 'start') {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-yellow-100 rounded-3xl p-8 text-center shadow-inner border-2 border-amber-100 max-w-4xl mx-auto">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-amber-50 transform hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                        🚂
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Conjunction Conductor</h2>
                    <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                        Conjunctions are the linking words that hook sentences together (like <span className="font-bold">and, but, or, so</span>). <br /><br />
                        Act as the train conductor and choose the right conjunction car to hook the two train cars together!
                    </p>
                    <button
                        onClick={startGame}
                        className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                    >
                        START ENGINE
                    </button>
                    <p className="mt-4 text-sm font-bold text-slate-400">Connect {TARGET_SCORE} trains to win.</p>
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
                    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Conductor!</h2>
                    <p className="text-slate-600 mb-8 text-lg font-medium">
                        You've expertly linked ideas together using FANBOYS conjunctions. The grammar train is running smoothly!
                    </p>
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-colors border border-slate-200"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={onComplete}
                            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(217,119,6,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                        >
                            Continue Learning
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
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                        🚂
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Conductor</h2>
                        <p className="text-sm font-semibold text-slate-500">Link the trains!</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-black text-amber-500 leading-none">{score}</span>
                            <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                        </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                        <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(score / TARGET_SCORE) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Play Area */}
            <div className="flex-1 flex flex-col p-8 bg-sky-100 relative overflow-hidden">

                {/* Scenery (Clouds, Tracks) */}
                <div className="absolute top-10 left-10 text-6xl opacity-40 animate-pulse">☁️</div>
                <div className="absolute top-20 right-20 text-5xl opacity-30">☁️</div>
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-emerald-600 rounded-t-full -mb-16"></div>
                <div className="absolute bottom-16 left-0 right-0 h-4 bg-slate-800 border-y-2 border-slate-900 flex justify-around opacity-80">
                    {/* Track ties */}
                    {Array(20).fill(0).map((_, i) => (
                        <div key={i} className="w-2 h-full bg-amber-900 border-l border-amber-800"></div>
                    ))}
                </div>


                {/* Train Cars Area */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full gap-4 mt-8">

                    <div className={`flex flex-col md:flex-row items-center gap-2 md:gap-4 transition-transform duration-500 ${feedback?.correct ? 'translate-x-full opacity-0' : ''}`} style={{ transitionDelay: feedback?.correct ? '1.5s' : '0s' }}>

                        {/* Part 1 Train Car */}
                        <div className="bg-rose-500 border-4 border-rose-700 rounded-xl p-6 shadow-[0_10px_0_rgba(159,18,57,1)] text-white max-w-xs relative flex items-center justify-center min-h-[140px]">
                            {/* Locomotive detailing */}
                            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-slate-800 rounded-r-md"></div>
                            <div className="absolute -top-6 left-4 w-6 h-8 bg-rose-600 rounded-t-md"></div>

                            <p className="text-xl font-bold text-center drop-shadow-md z-10">{currentScenario?.part1}</p>

                            {/* Connector socket Right */}
                            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-6 h-4 bg-slate-800 rounded-l-md"></div>
                        </div>

                        {/* Connecting Conjunction (The Missing Piece) */}
                        <div className={`
                            w-32 h-20 border-4 border-dashed rounded-xl flex items-center justify-center relative
                            ${feedback
                                ? (feedback.correct ? 'bg-amber-400 border-amber-600 solid' : 'bg-rose-100 border-rose-400 shake')
                                : 'bg-white/50 border-slate-400'}
                        `}>
                            {/* Connectors left/right */}
                            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-slate-800"></div>
                            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-2 bg-slate-800"></div>

                            <span className="text-2xl font-black text-slate-800 uppercase tracking-widest">
                                {feedback ? (feedback.correct ? currentScenario.correct : '?') : '?'}
                            </span>
                        </div>

                        {/* Part 2 Train Car */}
                        <div className="bg-indigo-500 border-4 border-indigo-700 rounded-xl p-6 shadow-[0_10px_0_rgba(55,48,163,1)] text-white max-w-xs relative flex items-center justify-center min-h-[140px]">
                            {/* Connector socket Left */}
                            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-6 h-4 bg-slate-800 rounded-r-md"></div>

                            <p className="text-xl font-bold text-center drop-shadow-md z-10">{currentScenario?.part2}</p>
                        </div>

                    </div>

                    {/* Feedback Ribbon */}
                    {feedback && (
                        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-20">
                            <div className={`p-4 rounded-2xl shadow-xl text-center border-4 animate-in slide-in-from-top-4 ${feedback.correct ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-rose-500 border-rose-600 text-white'}`}>
                                <h3 className="text-2xl font-black mb-1 tracking-wider">{feedback.text}</h3>
                                {feedback.explanation && (
                                    <p className="text-lg font-medium opacity-90">{feedback.explanation}</p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* Options / Action Area */}
                <div className="mt-auto relative z-20 pb-4">
                    <div className="text-center font-bold text-slate-800 uppercase tracking-widest mb-4 bg-white/80 inline-block px-4 py-1 rounded-full mx-auto shadow-sm backdrop-blur-sm">Select the linking car:</div>

                    <div className={`flex flex-wrap justify-center gap-4 transition-opacity duration-300 ${feedback ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="py-4 px-8 bg-amber-400 hover:bg-amber-300 rounded-xl border-4 border-amber-600 text-2xl font-black text-slate-900 shadow-[0_8px_0_rgba(180,83,9,1)] hover:-translate-y-1 active:translate-y-2 active:shadow-none transition-all uppercase tracking-widest min-w-[120px]"
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

export default ConjunctionConductor;
