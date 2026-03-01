import React, { useState, useEffect, useRef } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const SCENARIOS = [
    { sentence: "The dog barked at the mailman.", noun: "The dog", pronoun: "It" },
    { sentence: "Sarah loves to read books.", noun: "Sarah", pronoun: "She" },
    { sentence: "John and I went to the park.", noun: "John and I", pronoun: "We" },
    { sentence: "The students studied for the test.", noun: "The students", pronoun: "They" },
    { sentence: "Give the ball to Mark.", noun: "Mark", pronoun: "him" },
    { sentence: "Please tell Sarah the news.", noun: "Sarah", pronoun: "her" },
    { sentence: "This is David's jacket.", noun: "David's", pronoun: "his" },
    { sentence: "The book belongs to the students.", noun: "the students", pronoun: "them" },
    { sentence: "The car is my parent's car.", noun: "my parent's car", pronoun: "theirs" },
    { sentence: "The cat licked the cat's paw.", noun: "the cat's", pronoun: "its" },
    { sentence: "Are you and Tom going to the party?", noun: "you and Tom", pronoun: "You" },
    { sentence: "Mr. Smith is a great teacher.", noun: "Mr. Smith", pronoun: "He" },
    { sentence: "The cookies are for Emily and me.", noun: "Emily and me", pronoun: "us" },
    { sentence: "That beautiful house is our house.", noun: "our house", pronoun: "ours" },
    { sentence: "The sun is shining brightly today.", noun: "The sun", pronoun: "It" }
];

const PRONOUN_OPTIONS = ["He", "She", "It", "They", "We", "You", "I", "him", "her", "them", "us", "me", "his", "hers", "theirs", "ours", "its", "mine"];

const PronounReplacementRace = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won, lost
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);

    const timerRef = useRef(null);
    const TARGET_SCORE = 10;

    const generateOptions = (correctAns) => {
        const pool = PRONOUN_OPTIONS.filter(p => p !== correctAns);
        const distractors = shuffleArray(pool).slice(0, 3);
        return shuffleArray([correctAns, ...distractors]);
    };

    const nextQuestion = () => {
        const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        setCurrentScenario(randomScenario);
        setOptions(generateOptions(randomScenario.pronoun));
    };

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setTimeLeft(60);
        setFeedback(null);
        nextQuestion();

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setGameState('lost');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAnswer = (selectedPronoun) => {
        if (feedback) return; // Wait during feedback animation

        const isCorrect = selectedPronoun === currentScenario.pronoun;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'NICE!' });
            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= TARGET_SCORE) {
                clearInterval(timerRef.current);
                setTimeout(() => setGameState('won'), 1000);
            } else {
                setTimeout(() => {
                    setFeedback(null);
                    nextQuestion();
                }, 1000);
            }
        } else {
            setFeedback({ correct: false, text: '+5 SECONDS!' });
            setTimeLeft(prev => prev > 5 ? prev - 5 : 0); // Penality!

            setTimeout(() => {
                setFeedback(null);
            }, 1000);
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Helper to format the sentence with the noun highlighted
    const renderSentence = () => {
        if (!currentScenario) return null;
        const parts = currentScenario.sentence.split(currentScenario.noun);
        return (
            <span className="text-3xl font-bold text-slate-700 leading-relaxed md:text-left flex-1">
                {parts[0]}
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded border-b-4 border-amber-300 mx-1 shadow-sm relative group cursor-help">
                    {currentScenario.noun}
                    <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Replace this noun!</span>
                </span>
                {parts[1]}
            </span>
        );
    };

    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 rounded-3xl p-8 text-center shadow-inner border-2 border-amber-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-amber-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            ⏱️
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Pronoun Race</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            A pronoun takes the place of a noun. <br /><br />
                            Race against the clock to replace the <span className="bg-amber-100 text-amber-800 px-1 rounded font-bold">highlighted noun</span> with the correct pronoun! Mistakes cost you 5 seconds.
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START RACE
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Score {TARGET_SCORE} before time runs out!</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won' || gameState === 'lost') {
            const isWin = gameState === 'won';
            return (
                <div className={`w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br ${isWin ? 'from-emerald-50 to-teal-100 border-emerald-100' : 'from-rose-50 to-red-100 border-rose-100'} rounded-3xl p-8 text-center shadow-inner border-2 max-w-4xl mx-auto`}>
                    <div className={`bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border ${isWin ? 'border-emerald-50' : 'border-rose-50'} animate-in zoom-in duration-500`}>
                        <div className={`w-24 h-24 ${isWin ? 'bg-emerald-100' : 'bg-rose-100'} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl`}>
                            {isWin ? '🏆' : '⏰'}
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                            {isWin ? 'Race Won!' : 'Time\'s Up!'}
                        </h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            {isWin
                                ? `Incredible! You rapidly replaced ${TARGET_SCORE} nouns with their correct pronouns and saved the day with ${timeLeft} seconds left.`
                                : `You ran out of time! You replaced ${score} nouns before the clock hit zero. Keep practicing to get faster!`
                            }
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={startGame}
                                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-colors border border-slate-200"
                            >
                                {isWin ? 'Play Again' : 'Try Again'}
                            </button>
                            {isWin && (
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(5,150,105,0.3)] transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    Back to Map
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="w-full h-[600px] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-slate-100 max-w-4xl mx-auto">
                {/* Header */}
                <div className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl shadow-inner animate-pulse">
                            ⏱️
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Pronoun Race</h2>
                            <p className="text-sm font-semibold text-slate-500">Fast replacements!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Timer */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</span>
                            <span className={`text-3xl font-black leading-none ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                                0:{timeLeft.toString().padStart(2, '0')}
                            </span>
                        </div>

                        <div className="w-px h-10 bg-slate-200"></div>

                        {/* Score */}
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-amber-500 leading-none">{score}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 relative flex flex-col p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] justify-center items-center">

                    <div className={`
                    w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl border-4 transition-all duration-300 flex flex-col items-center min-h-[220px] justify-center text-center
                    ${feedback ? (feedback.correct ? 'border-emerald-400 scale-105' : 'border-rose-400 shake') : 'border-slate-100'}
                `}>

                        {renderSentence()}

                        {feedback && (
                            <div className={`absolute -bottom-6 px-8 py-2 rounded-full font-black text-xl shadow-lg capitalize animate-in slide-in-from-top-2 ${feedback.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {feedback.text}
                            </div>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className={`mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl transition-opacity duration-200 ${feedback ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleAnswer(option)}
                                className="py-6 px-4 bg-white hover:bg-amber-50 rounded-2xl border-2 border-slate-200 hover:border-amber-400 text-2xl font-black text-slate-700 hover:text-amber-600 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
                            >
                                {option}
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

export default PronounReplacementRace;
