import React, { useState, useEffect } from 'react';

const SCENARIOS = [
    {
        prefix: 'The hungry lion roared',
        suffix: 'at the hyenas.',
        options: ['fiercely', 'politely', 'quietly'],
        correctAnswer: 'fiercely',
        explanation: 'A hungry lion roars in a fierce way, not polite or quiet!'
    },
    {
        prefix: 'She tiptoed',
        suffix: 'past the sleeping dragon.',
        options: ['carefully', 'loudly', 'clumsily'],
        correctAnswer: 'carefully',
        explanation: 'You must tip-toe carefully so you don\'t wake the dragon!'
    },
    {
        prefix: 'The turtle crossed the road',
        suffix: '.',
        options: ['slowly', 'quickly', 'instantly'],
        correctAnswer: 'slowly',
        explanation: 'Turtles are known for moving very slowly.'
    },
    {
        prefix: 'We searched',
        suffix: 'for the lost treasure.',
        options: ['everywhere', 'nowhere', 'rarely'],
        correctAnswer: 'everywhere',
        explanation: '"Everywhere" is an adverb of place that shows you looked in all locations.'
    },
    {
        prefix: 'My grandfather',
        suffix: 'tells us amazing stories.',
        options: ['often', 'never', 'outside'],
        correctAnswer: 'often',
        explanation: '"Often" is an adverb of frequency showing it happens many times.'
    },
    {
        prefix: 'The rain fell',
        suffix: 'during the thunderstorm.',
        options: ['heavily', 'neatly', 'gently'],
        correctAnswer: 'heavily',
        explanation: 'Thunderstorms have heavy rain, not neat or gentle rain.'
    },
    {
        prefix: 'He ran',
        suffix: 'to catch the departing bus.',
        options: ['quickly', 'lazily', 'calmly'],
        correctAnswer: 'quickly',
        explanation: 'You must run quickly if you don\'t want to miss the bus!'
    },
    {
        prefix: 'The fireworks exploded',
        suffix: 'in the night sky.',
        options: ['brightly', 'sadly', 'silently'],
        correctAnswer: 'brightly',
        explanation: 'Fireworks are known for exploding brightly and loudly.'
    },
    {
        prefix: 'They waited',
        suffix: 'for the concert to start.',
        options: ['eagerly', 'angrily', 'rudely'],
        correctAnswer: 'eagerly',
        explanation: 'Fans usually wait eagerly (excitedly) for a concert to begin.'
    },
    {
        prefix: 'The snow is melting',
        suffix: ',',
        options: ['now', 'yesterday', 'inside'],
        correctAnswer: 'now',
        explanation: '"Now" is an adverb of time telling us when it is happening.'
    }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const AdverbActionBuilder = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAdverb, setSelectedAdverb] = useState(null);
    const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, message: string }
    const [shuffledScenarios, setShuffledScenarios] = useState([]);
    const [shuffledOptions, setShuffledOptions] = useState([]);

    const TARGET_SCORE = Math.min(5, SCENARIOS.length);

    useEffect(() => {
        if (gameState === 'start') {
            const shuffled = shuffleArray([...SCENARIOS]);
            setShuffledScenarios(shuffled);
            setShuffledOptions(shuffleArray([...shuffled[0].options]));
        }
    }, [gameState]);

    const startGame = () => {
        setGameState('playing');
        setScore(0);
        setCurrentScenarioIndex(0);
        setSelectedAdverb(null);
        setFeedback(null);

        const shuffled = shuffleArray([...SCENARIOS]);
        setShuffledScenarios(shuffled);
        setShuffledOptions(shuffleArray([...shuffled[0].options]));
    };

    const handleSelectOption = (option) => {
        if (feedback) return; // Prevent selection during feedback
        setSelectedAdverb(option);
    };

    const checkAnswer = () => {
        if (!selectedAdverb) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const isCorrect = selectedAdverb === currentScenario.correctAnswer;

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback({ isCorrect: true, message: 'Excellent fit!' });
        } else {
            setFeedback({ isCorrect: false, message: currentScenario.explanation });
        }

        setTimeout(() => {
            if (score + (isCorrect ? 1 : 0) >= TARGET_SCORE) {
                setGameState('won');
            } else {
                nextScenario();
            }
        }, 3000);
    };

    const nextScenario = () => {
        setSelectedAdverb(null);
        setFeedback(null);
        const nextIndex = (currentScenarioIndex + 1) % shuffledScenarios.length;
        setCurrentScenarioIndex(nextIndex);
        setShuffledOptions(shuffleArray([...shuffledScenarios[nextIndex].options]));
    };

    const currentScenario = shuffledScenarios[currentScenarioIndex];

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
                            🏗️
                        </div>
                        <h3 className="font-black text-2xl tracking-tight uppercase">Action Builder</h3>
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

                {/* Play Area */}
                <div className="flex-1 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] bg-purple-50">

                    {gameState === 'start' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-900/10 backdrop-blur-sm z-30 p-4">
                            <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-purple-100 transform hover:scale-105 transition-transform duration-300 text-center">
                                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                                    🏗️
                                </div>
                                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Action Builder</h2>
                                <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                                    Adverbs change the meaning of a sentence by modifying the verb. <br /><br />
                                    Choose the adverb that makes the <span className="font-bold text-purple-600">most sense</span> to complete the action!
                                </p>
                                <button
                                    onClick={startGame}
                                    className="w-full py-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(147,51,234,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                                >
                                    START BUILDING
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
                                <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Builder!</h2>
                                <p className="text-slate-600 mb-8 text-lg font-medium">
                                    You know exactly how to use adverbs to enhance your sentences. Great job identifying context!
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

                    {gameState === 'playing' && currentScenario && (
                        <div className="absolute inset-0 flex flex-col p-8 md:p-12 overflow-y-auto">

                            {/* Sentence Display */}
                            <div className="bg-white/95 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-xl border-b-8 border-purple-200 mb-8 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left min-h-[220px]">

                                <span className="text-3xl md:text-4xl font-bold text-slate-700 leading-snug md:text-right flex-1 break-words">
                                    {currentScenario.prefix}
                                </span>

                                {/* The Blank / Selected Word */}
                                <div className={`
                                    min-w-[200px] h-20 rounded-2xl border-4 border-dashed flex items-center justify-center px-6 transition-all duration-300 shadow-inner
                                    ${selectedAdverb
                                        ? 'bg-purple-100 border-purple-400 border-solid scale-105 shadow-md text-purple-800'
                                        : 'bg-slate-100 border-slate-300'}
                                    ${feedback && feedback.isCorrect ? 'bg-emerald-100 border-emerald-500 text-emerald-800 border-solid' : ''}
                                    ${feedback && !feedback.isCorrect ? 'bg-rose-100 border-rose-500 text-rose-800 border-solid shake' : ''}
                                `}>
                                    <span className={`text-4xl font-black lowercase tracking-wide drop-shadow-sm ${!selectedAdverb ? 'text-slate-300' : ''}`}>
                                        {selectedAdverb || '?'}
                                    </span>
                                </div>

                                <span className="text-3xl md:text-4xl font-bold text-slate-700 leading-snug md:text-left flex-1 break-words">
                                    {currentScenario.suffix}
                                </span>
                            </div>

                            {/* Feedback Panel */}
                            <div className="h-20 mb-6 flex items-center justify-center">
                                {feedback && (
                                    <div className={`px-10 py-4 rounded-3xl font-bold text-xl shadow-2xl animate-in slide-in-from-bottom-2 border-b-4 max-w-2xl text-center ${feedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                                        {feedback.message}
                                    </div>
                                )}
                            </div>

                            {/* Options / Action Area */}
                            <div className="mt-auto">
                                {!feedback && selectedAdverb ? (
                                    <div className="flex justify-center animate-in slide-in-from-bottom-4">
                                        <button
                                            onClick={checkAnswer}
                                            className="px-16 py-6 bg-purple-600 hover:bg-purple-700 text-white text-3xl font-black rounded-3xl shadow-[0_10px_40px_rgba(147,51,234,0.4)] transition-all hover:scale-105 active:scale-95 border-b-8 border-purple-800 active:border-b-0"
                                        >
                                            CHECK SENTENCE
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 transition-opacity duration-300 ${feedback ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                        {shuffledOptions.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSelectOption(option)}
                                                className={`
                                                    py-8 px-4 bg-white rounded-3xl border-b-8 font-black text-3xl tracking-wide lowercase transition-all duration-200 transform border-slate-200
                                                    ${selectedAdverb === option
                                                        ? 'border-b-8 border-purple-500 text-purple-700 bg-purple-50 ring-4 ring-purple-200 scale-105 shadow-2xl'
                                                        : 'text-slate-600 hover:border-slate-300 hover:shadow-xl hover:-translate-y-2 active:translate-y-2 active:border-b-0'}
                                                `}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
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

export default AdverbActionBuilder;
