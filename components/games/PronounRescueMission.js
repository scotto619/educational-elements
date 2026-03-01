import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const QUESTIONS = [
    {
        q: "Which pronoun would replace 'the dog' in this sentence: The dog chased the cat.",
        options: ["He", "It", "They"],
        answer: "It"
    },
    {
        q: "Which pronoun fits best: ___ went to the movies together.",
        options: ["We", "Us", "Our"],
        answer: "We"
    },
    {
        q: "Is 'him' a subject, object, or possessive pronoun?",
        options: ["Subject", "Object", "Possessive"],
        answer: "Object"
    },
    {
        q: "Replace the words in quotes: The teacher gave the books to 'the students'.",
        options: ["they", "them", "their"],
        answer: "them"
    },
    {
        q: "Replace the noun: 'Sarah' rode her bike to school.",
        options: ["She", "Her", "Hers"],
        answer: "She"
    },
    {
        q: "Choose the correct pronoun: That red car is ___.",
        options: ["mine", "my", "me"],
        answer: "mine"
    },
    {
        q: "Is 'theirs' a subject, object, or possessive pronoun?",
        options: ["Subject", "Object", "Possessive"],
        answer: "Possessive"
    },
    {
        q: "Which pronoun fits best: The cookies were baked by ___.",
        options: ["she", "her", "hers"],
        answer: "her"
    },
    {
        q: "Replace 'John and I': 'John and I' are going to the park.",
        options: ["We", "Us", "They"],
        answer: "We"
    },
    {
        q: "Which pronoun would replace 'the children' in this sentence: The grandmother gave candies to the children.",
        options: ["they", "them", "their"],
        answer: "them"
    }
];

const PronounRescueMission = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won, lost
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);

    // Character Position (X from 10% to 90%, Y dictates jumping)
    const [charPos, setCharPos] = useState({ x: 10, y: 75, jumping: false });
    const [feedback, setFeedback] = useState(null);
    const [rescuedCount, setRescuedCount] = useState(0);

    const TARGET_RESCUES = 7;

    useEffect(() => {
        if (gameState === 'start' && shuffledQuestions.length === 0) {
            setShuffledQuestions(shuffleArray([...QUESTIONS]).slice(0, TARGET_RESCUES + 2));
        }
    }, [gameState, shuffledQuestions]);

    const startGame = () => {
        setGameState('playing');
        setCurrentQuestionIndex(0);
        setRescuedCount(0);
        setCharPos({ x: 10, y: 75, jumping: false });
        setFeedback(null);
        setShuffledQuestions(shuffleArray([...QUESTIONS]).slice(0, TARGET_RESCUES + 2)); // Extra buffer
    };

    const handleAnswer = (selectedOption) => {
        if (feedback || charPos.jumping) return;

        const currentQ = shuffledQuestions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQ.answer;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Correct! Jumping...' });

            // Jump Animation
            setCharPos(prev => ({ ...prev, jumping: true }));

            // Go up
            setTimeout(() => {
                setCharPos(prev => ({ ...prev, y: 40, x: prev.x + (80 / TARGET_RESCUES) / 2 }));

                // Come down at next platform
                setTimeout(() => {
                    const newX = 10 + ((rescuedCount + 1) * (80 / TARGET_RESCUES));
                    setCharPos({ x: newX, y: 75, jumping: false });
                    setRescuedCount(prev => prev + 1);
                    setFeedback(null);
                    setCurrentQuestionIndex(prev => prev + 1);

                    if (rescuedCount + 1 >= TARGET_RESCUES) {
                        setTimeout(() => setGameState('won'), 500);
                    }
                }, 400);
            }, 400);

        } else {
            setFeedback({ correct: false, text: 'Oops! Try again.' });

            // Shake but don't move forward
            setTimeout(() => {
                setFeedback(null);
            }, 1000);
        }
    };

    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-center shadow-inner border-2 border-indigo-700 max-w-4xl mx-auto relative overflow-hidden">
                    {/* Background Stars / Setup */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    <div className="bg-slate-900/90 p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-indigo-500 transform hover:scale-105 transition-transform duration-300 z-10 backdrop-blur-sm">
                        <div className="flex justify-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center text-4xl shadow-inner animate-bounce">
                                🦸
                            </div>
                            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center text-4xl shadow-inner">
                                🐾
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Pronoun Rescue</h2>
                        <p className="text-indigo-200 mb-8 text-lg font-medium leading-relaxed">
                            The grammar pets are stuck on the glowing platforms! <br /><br />
                            Answer the pronoun questions correctly to jump from platform to platform and rescue them all.
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xl shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START MISSION
                        </button>
                        <p className="mt-4 text-sm font-bold text-indigo-400">Rescue {TARGET_RESCUES} pets to win!</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-700 max-w-4xl mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

                    <div className="bg-slate-900/90 p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-emerald-500 animate-in zoom-in duration-500 z-10 backdrop-blur-sm">
                        <div className="flex justify-center flex-wrap gap-2 mb-6">
                            {Array(TARGET_RESCUES).fill('🐾').map((pet, i) => (
                                <span key={i} className="text-3xl animate-bounce" style={{ animationDelay: `${i * 100}ms` }}>{pet}</span>
                            ))}
                        </div>
                        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                            🦸
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Mission Accomplished!</h2>
                        <p className="text-emerald-200 mb-8 text-lg font-medium">
                            You used your pronoun knowledge to jump across the glowing platforms and rescue all the grammar pets. True hero!
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg transition-colors border border-slate-600"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-lg shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Back to Map
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const currentQ = shuffledQuestions[currentQuestionIndex];

        // We render N platforms based on TARGET_RESCUES + 1 (Start platform + N rescue platforms)
        const platforms = Array(TARGET_RESCUES + 1).fill(0).map((_, i) => {
            return 10 + (i * (80 / TARGET_RESCUES)); // Distribute evenly across 10% to 90%
        });

        return (
            <div className="w-full h-[600px] flex flex-col bg-slate-950 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-indigo-900 max-w-4xl mx-auto">
                {/* Header / Top HUD */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-900 to-transparent flex items-start justify-between p-6 z-20 pointer-events-none">
                    <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-indigo-500/30 backdrop-blur-sm shadow-lg pointer-events-auto">
                        <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">🦸</span>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Rescued</span>
                            <div className="flex text-lg font-black text-white tracking-widest gap-1 mt-1">
                                {Array(TARGET_RESCUES).fill(0).map((_, i) => (
                                    <span key={i} className={i < rescuedCount ? 'text-amber-400' : 'text-slate-700'}>🐾</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Game Environment */}
                <div className="flex-1 relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
                    {/* Cyberpunk Grid Background */}
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.5) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                        transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                        transformOrigin: 'top center'
                    }}></div>

                    {/* Platforms */}
                    {platforms.map((leftOffset, i) => (
                        <div
                            key={i}
                            className="absolute bottom-[20%] w-20 h-4 bg-indigo-500 rounded-full transform -translate-x-1/2 shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-indigo-300 z-10"
                            style={{ left: `${leftOffset}%` }}
                        >
                            {/* The glowing inner bit */}
                            <div className="absolute inset-1 bg-white rounded-full opacity-50 blur-[2px]"></div>

                            {/* The pet to rescue on the platform (if not rescued yet) */}
                            {i > 0 && i > rescuedCount && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-2xl animate-pulse drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
                                    🐾
                                </div>
                            )}
                        </div>
                    ))}

                    {/* The Hero */}
                    <div
                        className="absolute bottom-[0%] w-12 h-16 text-5xl transform -translate-x-1/2 -translate-y-full z-20 flex items-center justify-center drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all duration-[400ms] ease-in-out"
                        style={{ left: `${charPos.x}%`, top: `${charPos.y}%` }}
                    >
                        {charPos.jumping ? '🦹' : '🦸'}
                    </div>

                </div>

                {/* Bottom Question Panel HUD */}
                <div className="h-48 bg-slate-900 border-t-4 border-indigo-600 flex items-center justify-center p-6 relative z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] shrink-0">

                    {feedback ? (
                        <div className="flex flex-col items-center justify-center animate-in slide-in-from-bottom-4">
                            <div className={`text-4xl font-black mb-2 animate-bounce ${feedback.correct ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'text-rose-500 shake drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`}>
                                {feedback.text}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex-col flex gap-4 max-w-3xl items-center animate-in zoom-in-95 duration-200">
                            {/* The Question */}
                            <div className="text-xl md:text-2xl font-bold text-white text-center tracking-wide px-8 py-2 bg-slate-800 rounded-2xl w-full shadow-inner border border-slate-700">
                                {currentQ?.q}
                            </div>

                            {/* Options */}
                            <div className="flex flex-wrap justify-center gap-4 w-full">
                                {currentQ?.options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(opt)}
                                        className="flex-1 min-w-[120px] max-w-[200px] py-3 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xl rounded-xl border border-indigo-400 shadow-[0_5px_0_rgba(67,56,202,1)] hover:shadow-[0_2px_0_rgba(67,56,202,1)] hover:translate-y-[3px] transition-all active:translate-y-[5px] active:shadow-none uppercase tracking-wider"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

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

export default PronounRescueMission;
