import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

// Categories of Interjections based on emotion
const EMOTIONS = [
    { id: 'joy', name: 'Joy / Excitement', icon: '😄', color: 'amber' },
    { id: 'surprise', name: 'Surprise', icon: '😲', color: 'indigo' },
    { id: 'pain', name: 'Pain', icon: '🤕', color: 'rose' },
    { id: 'disgust', name: 'Disgust', icon: '🤢', color: 'emerald' },
    { id: 'relief', name: 'Relief', icon: '😌', color: 'cyan' },
    { id: 'hesitation', name: 'Hesitation', icon: '🤔', color: 'slate' } // filler words
];

const SCENARIOS = [
    { word: 'Yay!', emotion: 'joy', phrase: '___ We won the game!' },
    { word: 'Hooray!', emotion: 'joy', phrase: '___ School is out for summer!' },
    { word: 'Wow!', emotion: 'surprise', phrase: '___ Look at that huge shooting star!' },
    { word: 'Woah!', emotion: 'surprise', phrase: '___ This roller coaster is fast!' },
    { word: 'Ouch!', emotion: 'pain', phrase: '___ I stubbed my toe on the door.' },
    { word: 'Yikes!', emotion: 'pain', phrase: '___ That looks like it hurt.' },
    { word: 'Ew!', emotion: 'disgust', phrase: '___ There is a bug in my soup.' },
    { word: 'Yuck!', emotion: 'disgust', phrase: '___ I do not like broccoli.' },
    { word: 'Phew!', emotion: 'relief', phrase: '___ That was a close call.' },
    { word: 'Um...', emotion: 'hesitation', phrase: '___ I am not sure what the answer is.' },
    { word: 'Uh...', emotion: 'hesitation', phrase: '___ where did I leave my keys?' },
    { word: 'Ah!', emotion: 'surprise', phrase: '___ I didn\'t see you standing there.' },
    { word: 'Oof!', emotion: 'pain', phrase: '___ That was a heavy box to lift.' }
];

const InterjectionEmotionMatch = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);

    const [options, setOptions] = useState([]); // List of emotions to choose from
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
        setupLevel(scenarios[0]);
    };

    const setupLevel = (scenario) => {
        // We present the interjection inside a mini-sentence context.
        // The user must identify the emotion it conveys.

        // Options should include the correct emotion and 3 distractors
        const correctEmotion = EMOTIONS.find(e => e.id === scenario.emotion);
        const distractors = EMOTIONS.filter(e => e.id !== scenario.emotion);
        const selectedDistractors = shuffleArray(distractors).slice(0, 3);

        setOptions(shuffleArray([correctEmotion, ...selectedDistractors]));
    };

    const handleAnswer = (selectedEmotionId) => {
        if (feedback) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const isCorrect = selectedEmotionId === currentScenario.emotion;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Nailed it!' });
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
            }, 1000);
        } else {
            setFeedback({ correct: false, text: `Not quite!` });
            setTimeout(() => setFeedback(null), 1000);
        }
    };


    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 rounded-3xl p-8 text-center shadow-inner border-2 border-pink-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-pink-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🎭
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Emotion Match</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            Interjections are words that express strong feelings or sudden emotions. <br /><br />
                            Read the sentence and match the <span className="font-bold text-pink-600">Interjection</span> to the emotion it represents!
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(236,72,153,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START MATCHING
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Match {TARGET_SCORE} emotions to win.</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-emerald-50 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🎭
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Emotional Genius!</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            You seamlessly identified the feelings behind the interjections! Wow! Hooray!
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
                                className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(219,39,119,0.3)] transition-all hover:-translate-y-1 active:scale-95"
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
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                            🎭
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Emotion Match</h2>
                            <p className="text-sm font-semibold text-slate-500">Read the feeling!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-pink-500 leading-none">{score}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                            </div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                            <div
                                className="h-full bg-pink-400 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(score / TARGET_SCORE) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 flex flex-col p-8 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] items-center justify-center">

                    {/* The Scenario Card */}
                    <div className={`
                    w-full max-w-2xl bg-white p-10 rounded-3xl shadow-xl border-4 transition-all duration-300 flex flex-col items-center justify-center min-h-[240px] text-center mb-8 relative
                    ${feedback ? (feedback.correct ? 'border-emerald-400 ring-4 ring-emerald-50 scale-105' : 'border-rose-400 ring-4 ring-rose-50 shake') : 'border-slate-100 hover:-translate-y-1'}
                `}>

                        {/* Floating emoji hint */}
                        <div className="absolute -top-6 -right-6 text-6xl opacity-20 transform rotate-12 pointer-events-none">💬</div>

                        <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">What emotion is this?</h3>

                        <p className="text-3xl md:text-4xl font-black text-slate-700 leading-relaxed">
                            <span className={`px-2 py-1 rounded bg-pink-100 text-pink-600 border-b-4 border-pink-300 mx-1 ${feedback?.correct ? 'animate-pulse' : ''}`}>
                                {currentScenario?.word}
                            </span>
                            {currentScenario?.phrase.replace('___ ', ' ')}
                        </p>

                        {/* Feedback Popup */}
                        {feedback && (
                            <div className={`absolute -bottom-6 px-8 py-2 rounded-full font-black text-2xl uppercase tracking-widest animate-in slide-in-from-top-2 shadow-lg z-20 ${feedback.correct ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {feedback.text}
                            </div>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className={`w-full max-w-3xl grid grid-cols-2 gap-4 transition-opacity duration-300 ${feedback ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(opt.id)}
                                className={`py-6 px-4 bg-white rounded-2xl border-2 border-slate-200 hover:border-${opt.color}-400 hover:bg-${opt.color}-50 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-4 group`}
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                                <span className={`text-2xl font-black text-slate-700 group-hover:text-${opt.color}-700 transition-colors uppercase tracking-wider`}>{opt.name}</span>
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

export default InterjectionEmotionMatch;
