import React, { useState, useEffect } from 'react';

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

// Categories of Pronouns
const PRONOUN_TYPES = [
    { id: 'subject', name: 'Subject', desc: 'Does the action (he, she, they)' },
    { id: 'object', name: 'Object', desc: 'Receives the action (him, us, them)' },
    { id: 'possessive', name: 'Possessive', desc: 'Shows ownership (mine, yours, theirs)' }
];

const PRONOUN_BANK = [
    // Subject
    { word: 'I', type: 'subject' },
    { word: 'you', type: 'subject' },
    { word: 'he', type: 'subject' },
    { word: 'she', type: 'subject' },
    { word: 'it', type: 'subject' },
    { word: 'we', type: 'subject' },
    { word: 'they', type: 'subject' },

    // Object
    { word: 'me', type: 'object' },
    { word: 'you', type: 'object' }, // Can be both, but we'll try to keep it clear in context or just accept either if we built a complex engine. For this simple match, we'll use distinct ones.
    { word: 'him', type: 'object' },
    { word: 'her', type: 'object' },
    { word: 'it', type: 'object' },
    { word: 'us', type: 'object' },
    { word: 'them', type: 'object' },

    // Possessive
    { word: 'mine', type: 'possessive' },
    { word: 'yours', type: 'possessive' },
    { word: 'his', type: 'possessive' },
    { word: 'hers', type: 'possessive' },
    { word: 'its', type: 'possessive' },
    { word: 'ours', type: 'possessive' },
    { word: 'theirs', type: 'possessive' }
];

// For the game, let's filter out ambiguous ones like 'you' and 'it' to avoid unfair questions.
const FILTERED_BANK = PRONOUN_BANK.filter(p => !['you', 'it', 'his'].includes(p.word) || p.type === 'possessive'); // 'his' is both possessive adjective and pronoun, but acceptable here. 'you' and 'it' are identical in subject/object. Let's just remove 'you' and 'it' entirely for clarity.

const UNAMBIGUOUS_BANK = [
    { word: 'I', type: 'subject' },
    { word: 'he', type: 'subject' },
    { word: 'she', type: 'subject' },
    { word: 'we', type: 'subject' },
    { word: 'they', type: 'subject' },
    { word: 'me', type: 'object' },
    { word: 'him', type: 'object' },
    { word: 'her', type: 'object' },
    { word: 'us', type: 'object' },
    { word: 'them', type: 'object' },
    { word: 'mine', type: 'possessive' },
    { word: 'yours', type: 'possessive' },
    { word: 'hers', type: 'possessive' },
    { word: 'ours', type: 'possessive' },
    { word: 'theirs', type: 'possessive' }
];


const PronounTypeMatch = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [matches, setMatches] = useState([]); // List of { pronoun, type, isMatched }
    const [selectedPronoun, setSelectedPronoun] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [feedback, setFeedback] = useState(null);

    const [leftColumn, setLeftColumn] = useState([]);
    const [rightColumn, setRightColumn] = useState([]);

    const TARGET_PAIRS = 5; // 5 pairs per round

    const startRound = (currentScore = 0) => {
        setScore(currentScore);
        setSelectedPronoun(null);
        setSelectedType(null);
        setFeedback(null);

        // Pick 5 random unique pronouns
        const selected = shuffleArray([...UNAMBIGUOUS_BANK]).slice(0, TARGET_PAIRS);

        // Left column is the pronouns
        setLeftColumn(shuffleArray([...selected]));

        // Right column is the types (guaranteed to match the left column)
        const typesNeeded = selected.map(p => PRONOUN_TYPES.find(t => t.id === p.type));
        setRightColumn(shuffleArray([...typesNeeded]));

        setMatches(selected.map(p => ({ word: p.word, typeId: p.type, matched: false })));
        setGameState('playing');
    };

    useEffect(() => {
        // Check for match when both are selected
        if (selectedPronoun && selectedType) {
            const isMatch = selectedPronoun.typeId === selectedType.id;

            if (isMatch) {
                setFeedback({ isCorrect: true, text: 'Match!' });

                // Mark as matched
                setMatches(prev => prev.map(m =>
                    m.word === selectedPronoun.word ? { ...m, matched: true } : m
                ));

                setTimeout(() => {
                    setSelectedPronoun(null);
                    setSelectedType(null);
                    setFeedback(null);

                    // Check if round won
                    setMatches(currentMatches => {
                        const allMatched = currentMatches.every(m => m.matched);
                        if (allMatched) {
                            const newScore = score + TARGET_PAIRS;
                            if (newScore >= 15) { // 3 rounds total
                                setGameState('won');
                            } else {
                                startRound(newScore); // Next round
                            }
                        }
                        return currentMatches;
                    });
                }, 800);

            } else {
                setFeedback({ isCorrect: false, text: 'Try again!' });
                setTimeout(() => {
                    setSelectedPronoun(null);
                    setSelectedType(null);
                    setFeedback(null);
                }, 800);
            }
        }
    }, [selectedPronoun, selectedType]);


    const renderContent = () => {
        if (gameState === 'start') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100 rounded-3xl p-8 text-center shadow-inner border-2 border-cyan-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-cyan-50 transform hover:scale-105 transition-transform duration-300">
                        <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🔗
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Pronoun Match</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                            Pronouns have different jobs in a sentence. <br /><br />
                            Connect the <span className="font-bold text-cyan-600">pronoun</span> to its correct <span className="font-bold text-indigo-600">type</span> (Subject, Object, or Possessive).
                        </p>
                        <button
                            onClick={() => startRound(0)}
                            className="w-full py-5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(6,182,212,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                        >
                            START MATCHING
                        </button>
                        <p className="mt-4 text-sm font-bold text-slate-400">Complete 3 rounds to win!</p>
                    </div>
                </div>
            );
        }

        if (gameState === 'won') {
            return (
                <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 text-center shadow-inner border-2 border-emerald-100 max-w-4xl mx-auto">
                    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-emerald-50 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                            🔗
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Perfect Match!</h2>
                        <p className="text-slate-600 mb-8 text-lg font-medium">
                            You've mastered the different types of pronouns! Knowing whether to use "I" or "me" is crucial for perfect grammar.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => startRound(0)}
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
            );
        }

        // Helper to get status of a left column item
        const getPronounStatus = (word) => {
            const matchData = matches.find(m => m.word === word);
            if (matchData?.matched) return 'matched';
            if (selectedPronoun?.word === word) {
                if (feedback && feedback.isCorrect) return 'correct';
                if (feedback && !feedback.isCorrect) return 'incorrect';
                return 'selected';
            }
            return 'idle';
        };

        // Helper to get status of a right column item
        const getTypeStatus = (typeId) => {
            // A type is matched if ALL pronouns mapped to it in THIS ROUND are matched.
            // Actually, since there might be duplicates on the right side (multiple Subjects), 
            // we need a strict 1-to-1 visual matching structure, or we unique-ify the right column.

            // Wait, rightColumn has 5 items. What if two are "Subject"?
            // It's better if rightColumn only has unique types (3 items), and left column has 5 words. User connects many to one.
            // Let's adjust logic: 
            if (selectedType?.id === typeId) {
                if (feedback && feedback.isCorrect) return 'correct';
                if (feedback && !feedback.isCorrect) return 'incorrect';
                return 'selected';
            }
            return 'idle';
        };

        // Correct right column generation (unique types only, fixed 3 buttons)
        const uniqueTypes = PRONOUN_TYPES;

        return (
            <div className="w-full h-[600px] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl relative font-sans border-2 border-slate-100 max-w-4xl mx-auto">
                {/* Header */}
                <div className="h-20 bg-white flex items-center justify-between px-8 border-b border-slate-200 z-10 shadow-sm shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-2xl shadow-inner">
                            🔗
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Pronoun Match</h2>
                            <p className="text-sm font-semibold text-slate-500">Connect the pairs!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
                            <div className="flex items-end gap-1">
                                <span className="text-3xl font-black text-cyan-600 leading-none">{score + matches.filter(m => m.matched).length}</span>
                                <span className="text-lg font-bold text-slate-400 leading-none mb-0.5">/ 15</span>
                            </div>
                        </div>
                        {/* Visual Progress Bar */}
                        <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner hidden sm:block">
                            <div
                                className="h-full bg-cyan-500 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${((score + matches.filter(m => m.matched).length) / 15) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Play Area */}
                <div className="flex-1 relative flex p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] gap-12 justify-center items-center">

                    {/* Left Column: Pronouns */}
                    <div className="flex flex-col gap-4 w-1/3">
                        <div className="text-center font-bold text-slate-400 uppercase tracking-widest mb-2">Pronouns</div>
                        {leftColumn.map((item, idx) => {
                            const status = getPronounStatus(item.word);
                            return (
                                <button
                                    key={idx}
                                    disabled={status === 'matched' || feedback !== null}
                                    onClick={() => setSelectedPronoun({ word: item.word, typeId: item.type })}
                                    className={`
                                    relative py-4 px-6 rounded-2xl border-2 font-black text-xl transition-all duration-300 w-full text-center
                                    ${status === 'idle' ? 'bg-white border-slate-200 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:-translate-y-1 shadow-sm' : ''}
                                    ${status === 'selected' ? 'bg-cyan-100 border-cyan-500 text-cyan-800 scale-105 shadow-md ring-4 ring-cyan-50' : ''}
                                    ${status === 'correct' ? 'bg-emerald-500 border-emerald-600 text-white scale-105 shadow-md' : ''}
                                    ${status === 'incorrect' ? 'bg-rose-500 border-rose-600 text-white shake' : ''}
                                    ${status === 'matched' ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 scale-95' : ''}
                                `}
                                >
                                    {item.word}

                                    {/* Connector Node (Visual only) */}
                                    <div className={`absolute right-[-10px] top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 
                                    ${status === 'selected' || status === 'correct' ? 'bg-cyan-500 border-white' : 'bg-slate-200 border-slate-300'}
                                    ${status === 'matched' ? 'hidden' : ''}
                                `}></div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column: Types */}
                    <div className="flex flex-col gap-6 w-1/3 justify-center">
                        <div className="text-center font-bold text-slate-400 uppercase tracking-widest mb-2">Types</div>
                        {uniqueTypes.map((type, idx) => {
                            const status = getTypeStatus(type.id);
                            return (
                                <button
                                    key={idx}
                                    disabled={feedback !== null}
                                    onClick={() => setSelectedType(type)}
                                    className={`
                                    relative py-6 px-4 rounded-2xl border-2 transition-all duration-300 w-full text-center flex flex-col items-center justify-center
                                    ${status === 'idle' ? 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:-translate-y-1 shadow-sm' : ''}
                                    ${status === 'selected' ? 'bg-indigo-100 border-indigo-500 scale-105 shadow-md ring-4 ring-indigo-50' : ''}
                                    ${status === 'correct' ? 'bg-emerald-500 border-emerald-600 scale-105 shadow-md' : ''}
                                    ${status === 'incorrect' ? 'bg-rose-500 border-rose-600 shake' : ''}
                                `}
                                >
                                    {/* Connector Node (Visual only) */}
                                    <div className={`absolute left-[-10px] top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 
                                    ${status === 'selected' || status === 'correct' ? 'bg-indigo-500 border-white' : 'bg-slate-200 border-slate-300'}
                                `}></div>

                                    <span className={`font-black text-xl mb-1 ${status.includes('correct') ? 'text-white' : (status === 'selected' ? 'text-indigo-800' : 'text-slate-700')}`}>
                                        {type.name}
                                    </span>
                                    <span className={`text-xs font-bold leading-tight ${status.includes('correct') ? 'text-emerald-100' : (status === 'selected' ? 'text-indigo-500' : 'text-slate-400')}`}>
                                        {type.desc}
                                    </span>
                                </button>
                            );
                        })}
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

export default PronounTypeMatch;
