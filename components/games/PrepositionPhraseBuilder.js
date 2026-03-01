import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

// A phrase builder where users connect a Preposition to a Noun Phrase to complete a sentence logically.
const SCENARIOS = [
    {
        start: 'The brave knight walked',
        preposition: 'into',
        nounPhrase: 'the dark cave.',
        distractors: ['under the bright sun.', 'between the two mountains.']
    },
    {
        start: 'She placed the beautiful vase',
        preposition: 'on',
        nounPhrase: 'the wooden table.',
        distractors: ['in the wooden table.', 'over the wooden table.'] // Testing prepositions with same noun
    },
    {
        start: 'The airplane flew high',
        preposition: 'above',
        nounPhrase: 'the fluffy clouds.',
        distractors: ['under the fluffy clouds.', 'around the fluffy clouds.']
    },
    {
        start: 'The secret treasure is hidden',
        preposition: 'beneath',
        nounPhrase: 'the old oak tree.',
        distractors: ['through the old oak tree.', 'onto the old oak tree.']
    },
    {
        start: 'We walked carefully',
        preposition: 'across',
        nounPhrase: 'the icy bridge.',
        distractors: ['into the icy bridge.', 'beside the icy bridge.']
    },
    {
        start: 'The frightened mouse ran',
        preposition: 'behind',
        nounPhrase: 'the refrigerator.',
        distractors: ['above the refrigerator.', 'on the refrigerator.']
    },
    {
        start: 'The train traveled rapidly',
        preposition: 'through',
        nounPhrase: 'the long tunnel.',
        distractors: ['over the long tunnel.', 'beside the long tunnel.']
    },
    {
        start: 'Please sit',
        preposition: 'next to',
        nounPhrase: 'your partner.',
        distractors: ['inside your partner.', 'under your partner.']
    }
];

const PrepositionPhraseBuilder = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);

    // Draggable / Connectable state
    const [options, setOptions] = useState([]); // Mixed list of { id, text, type: 'preposition' | 'nounPhrase', originalRef }
    const [selectedSlot1, setSelectedSlot1] = useState(null); // the preposition
    const [selectedSlot2, setSelectedSlot2] = useState(null); // the noun phrase

    const [feedback, setFeedback] = useState(null); // { isCorrect: boolean, text: string }

    const TARGET_SCORE = 5;

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
        setSelectedSlot1(null);
        setSelectedSlot2(null);

        // We present the correct preposition + correct noun phrase
        // Plus 2 distractors (which might be wrong prepositions with the correct noun, or just wrong phrases entirely)
        // For simplicity in this UI, we treat the whole "preposition + nounPhrase" as a single block to select, 
        // OR we give them prepositions to drag into slot 1, and noun phrases for slot 2.

        // Let's do: Give 3 full prepositional phrases to choose from logically.
        // It's much cleaner on mobile than dual drag-n-drop.
        const allPhrases = [
            `${scenario.preposition} ${scenario.nounPhrase}`,
            ...scenario.distractors
        ];

        setOptions(shuffleArray(allPhrases));
    };

    const handleAnswer = (selectedPhrase) => {
        if (feedback) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const correctAnswer = `${currentScenario.preposition} ${currentScenario.nounPhrase}`;
        const isCorrect = selectedPhrase === correctAnswer;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Perfect Connection!' });
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
            }, 1200);
        } else {
            setFeedback({ correct: false, text: `Hmm... that doesn't make sense.` });
            setTimeout(() => setFeedback(null), 1200);
        }
    };


    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 text-center shadow-inner border-2 border-blue-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-blue-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🧩
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Phrase Builder</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            A <span className="font-bold text-blue-600">Prepositional Phrase</span> starts with a preposition and ends with a noun or pronoun. <br /><br />
                            Choose the prepositional phrase that logically completes the sentence!
                        </p>
                        <button
                            onClick={startGame}
                            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START BUILDING
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Build {TARGET_SCORE} perfect phrases to win.</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-emerald-50 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🧩
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Master Builder!</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            You know exactly how to use prepositional phrases to add detail and location to your sentences. Great job!
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
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:scale-95"
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
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                            🧩
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Phrase Builder</h2>
                            <p className="text-sm font-semibold text-slate-500">Build {TARGET_SCORE} phrases!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-blue-600 leading-none">{score}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ {TARGET_SCORE}</span>
                            </div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${(score / TARGET_SCORE) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 flex flex-col p-8 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">

                    {/* Sentence Display */}
                    <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-xl border-2 border-slate-200 mb-8 flex flex-col items-center justify-center text-center min-h-[180px]">
                        <span className="text-3xl md:text-4xl font-bold text-slate-700 leading-relaxed mb-4">
                            {currentScenario?.start}
                            <br />
                            <span className={`inline-block border-b-4 border-dashed mx-2 text-3xl pb-1 px-8 rounded-b-sm transition-all duration-300 mt-4
                            ${feedback
                                    ? (feedback.correct ? 'border-emerald-500 text-emerald-600 bg-emerald-50 solid' : 'border-rose-500 text-rose-600 bg-rose-50 shake')
                                    : 'border-slate-300 text-slate-300 bg-slate-50'}
                        `}>
                                {feedback ? (feedback.correct ? `${currentScenario.preposition} ${currentScenario.nounPhrase}` : '...') : '...'}
                            </span>
                        </span>

                        {/* Feedback Message */}
                        {feedback && (
                            <div className={`mt-2 font-black text-xl tracking-widest uppercase animate-in slide-in-from-top-2 ${feedback.correct ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {feedback.text}
                            </div>
                        )}
                    </div>

                    {/* Options / Action Area */}
                    <div className=" mt-auto flex flex-col gap-4">
                        <div className="text-center font-bold text-slate-400 uppercase tracking-widest mb-2">Select the logical phrase:</div>

                        <div className={`flex flex-col gap-4 transition-opacity duration-300 ${feedback ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            {options.map((option, index) => {
                                // Split to style the preposition differently for emphasis
                                const [prep, ...rest] = option.split(' ');
                                const restOfPhrase = rest.join(' ');

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option)}
                                        className="group py-6 px-8 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 text-left shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 active:scale-95 flex items-center justify-between"
                                    >
                                        <div className="text-2xl font-bold text-slate-600 group-hover:text-blue-800 transition-colors">
                                            <span className="text-blue-500 font-black">{prep}</span> {restOfPhrase}
                                        </div>
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-300 group-hover:border-blue-500 flex items-center justify-center transition-colors">
                                            <div className="w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all"></div>
                                        </div>
                                    </button>
                                );
                            })}
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

export default PrepositionPhraseBuilder;
