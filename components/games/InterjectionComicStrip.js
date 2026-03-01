import React, { useState, useEffect } from 'react';
import { shuffleArray } from '../../utils/gameHelpers';

const SCENARIOS = [
    {
        character: '🦸',
        scene: 'The superhero finally catches the villain after a long chase.',
        options: ['Phew!', 'Oops!', 'Oh no!'],
        correct: 'Phew!',
        explanation: "'Phew' shows relief that the difficult chase is over."
    },
    {
        character: '🧑‍🍳',
        scene: 'The chef accidentally drops the entire tray formed of freshly baked cupcakes on the floor.',
        options: ['Hooray!', 'Oops!', 'Wow!'],
        correct: 'Oops!',
        explanation: "'Oops' is used when someone makes a mistake or has a minor accident."
    },
    {
        character: '🕵️',
        scene: 'The detective discovers a hidden door behind the bookshelf.',
        options: ['Aha!', 'Yuck!', 'Ouch!'],
        correct: 'Aha!',
        explanation: "'Aha' is used when someone figures something out or makes a discovery."
    },
    {
        character: '🏃',
        scene: 'The runner crosses the finish line in first place!',
        options: ['Uh-oh!', 'Yay!', 'Alas!'],
        correct: 'Yay!',
        explanation: "'Yay' is an exclamation of triumph or joy."
    },
    {
        character: '🚶‍♀️',
        scene: 'A person steps barefoot on a sharp piece of Lego.',
        options: ['Ouch!', 'Phew!', 'Yay!'],
        correct: 'Ouch!',
        explanation: "'Ouch' expresses sudden pain."
    },
    {
        character: '🤢',
        scene: 'A kid opens their lunchbox and finds a moldy sandwich.',
        options: ['Wow!', 'Ew!', 'Phew!'],
        correct: 'Ew!',
        explanation: "'Ew' expresses disgust."
    },
    {
        character: '😲',
        scene: 'A giant dinosaur suddenly appears in the middle of the city.',
        options: ['Yikes!', 'Hooray!', 'Ahem!'],
        correct: 'Yikes!',
        explanation: "'Yikes' shows shock, surprise, or a little bit of fear."
    },
    {
        character: '🤫',
        scene: 'The librarian notices friends talking loudly during study time.',
        options: ['Shh!', 'Wow!', 'Oops!'],
        correct: 'Shh!',
        explanation: "'Shh' is used to tell someone to be quiet."
    }
];

const InterjectionComicStrip = ({ onComplete }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, won
    const [score, setScore] = useState(0);
    const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
    const [shuffledScenarios, setShuffledScenarios] = useState([]);

    const [options, setOptions] = useState([]);
    const [feedback, setFeedback] = useState(null);

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
        setupLevel(scenarios[0]);
    };

    const setupLevel = (scenario) => {
        setOptions(shuffleArray([...scenario.options]));
    };

    const handleAnswer = (selectedWord) => {
        if (feedback) return;

        const currentScenario = shuffledScenarios[currentScenarioIndex];
        const isCorrect = selectedWord === currentScenario.correct;

        if (isCorrect) {
            setFeedback({ correct: true, text: 'Perfect Fit!', explanation: currentScenario.explanation });
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
            setFeedback({ correct: false, text: `Doesn't sound right!`, explanation: "That interjection doesn't match the emotion of the scene." });
            setTimeout(() => setFeedback(null), 2000);
        }
    };


    if (gameState === 'start') {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl p-8 text-center shadow-inner border-2 border-yellow-100 max-w-4xl mx-auto">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-yellow-50 transform hover:scale-105 transition-transform duration-300">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner text-6xl">
                        🗯️
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Comic Creator</h2>
                    <p className="text-slate-600 mb-8 text-lg font-medium leading-relaxed">
                        Every good comic strip needs punchy interjections! <br /><br />
                        Read the scene description and choose the <span className="text-amber-600 font-bold">perfect interjection</span> to put in the character's speech bubble.
                    </p>
                    <button
                        onClick={startGame}
                        className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xl shadow-[0_8px_30px_rgba(245,158,11,0.3)] transition-all hover:-translate-y-1 active:scale-95 tracking-wide"
                    >
                        START DRAWING
                    </button>
                    <p className="mt-4 text-sm font-bold text-slate-400">Complete {TARGET_SCORE} comic panels to win.</p>
                </div>
            </div>
        );
    }

    if (gameState === 'won') {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 rounded-3xl p-8 text-center shadow-inner border-2 border-indigo-100 max-w-4xl mx-auto">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full border border-indigo-50 animate-in zoom-in duration-500">
                    <div className="flex justify-center flex-wrap gap-4 mb-6">
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '0ms' }}>🗯️</span>
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '200ms' }}>💥</span>
                        <span className="text-6xl animate-bounce" style={{ animationDelay: '400ms' }}>💨</span>
                    </div>
                    <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Comic Master!</h2>
                    <p className="text-slate-600 mb-8 text-lg font-medium">
                        Your characters are so expressive! You know exactly which interjection fits every dramatic situation.
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
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-[0_8px_30px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-1 active:scale-95"
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
                        🗯️
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Comic Strip</h2>
                        <span className="text-xs font-bold text-slate-500">Panel {currentScenarioIndex + 1} of {TARGET_SCORE}</span>
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
            <div className="flex-1 flex flex-col p-8 bg-[url('https://www.transparenttextures.com/patterns/white-diamond-dark.png')] bg-sky-100 relative overflow-hidden flex items-center justify-center">


                {/* Comic Panel Container */}
                <div className="w-full max-w-2xl bg-white border-8 border-slate-800 p-2 shadow-[8px_8px_0_rgba(15,23,42,1)] relative transition-transform duration-500 flex flex-col items-center">

                    {/* Scene Description Box (Narrator) */}
                    <div className="w-full bg-yellow-200 border-b-4 border-slate-800 p-4 font-comic-sans text-xl font-bold text-slate-800 tracking-wide text-center">
                        Meanwhile... <br />
                        <span className="text-lg font-medium opacity-90">{currentScenario?.scene}</span>
                    </div>

                    <div className="py-12 flex relative w-full h-full items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/halftone-yellow.png')]">

                        {/* The Character */}
                        <div className={`text-[120px] filter drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)] z-10 transition-transform ${feedback?.correct ? 'animate-bounce' : ''}`}>
                            {currentScenario?.character}
                        </div>

                        {/* Speech Bubble */}
                        <div className="absolute top-4 right-10 md:right-32 z-20">

                            <div className={`
                                relative p-6 border-4 border-slate-800 rounded-[50px] min-w-[160px] text-center shadow-[4px_4px_0_rgba(15,23,42,1)] transition-all duration-300
                                ${feedback
                                    ? (feedback.correct ? 'bg-emerald-300' : 'bg-rose-300 shake')
                                    : 'bg-white'}
                            `}>
                                {/* Tail of speech bubble */}
                                <div className={`absolute -bottom-6 left-10 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[25px] border-transparent border-t-slate-800 transform rotate-[25deg] ${feedback ? (feedback.correct ? 'border-t-emerald-300' : 'border-t-rose-300') : 'border-t-white'} z-30`}></div>
                                <div className="absolute -bottom-8 left-9 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[30px] border-transparent border-t-slate-800 transform rotate-[25deg] z-10"></div>

                                <span className="font-comic-sans text-3xl font-black text-slate-800 uppercase tracking-widest inline-block transform -rotate-3">
                                    {feedback ? (feedback.correct ? currentScenario.correct : '?!!') : '...'}
                                </span>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Feedback Toast */}
                {feedback && (
                    <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 w-full max-w-lg z-30">
                        <div className={`p-4 rounded-xl shadow-2xl text-center border-4 animate-in slide-in-from-bottom-4 ${feedback.correct ? 'bg-emerald-500 border-emerald-600' : 'bg-rose-500 border-rose-600'}`}>
                            <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-widest">
                                {feedback.text}
                            </h3>
                            <p className="text-white font-medium opacity-90">{feedback.explanation}</p>
                        </div>
                    </div>
                )}


                {/* Options / Action Area */}
                <div className="mt-8 relative z-30 flex flex-col items-center w-full">
                    <div className="text-center font-black text-slate-800 uppercase tracking-widest mb-4 bg-white/90 inline-block px-6 py-1 rounded-full border-2 border-slate-800 shadow-[4px_4px_0_rgba(15,23,42,1)]">Select the interjection:</div>

                    <div className={`flex flex-wrap justify-center gap-4 transition-opacity duration-300 w-full max-w-2xl ${feedback ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        {options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(option)}
                                className="flex-1 py-4 px-4 bg-amber-400 hover:bg-amber-300 border-4 border-slate-800 text-2xl font-black font-comic-sans text-slate-900 shadow-[4px_4px_0_rgba(15,23,42,1)] hover:-translate-y-1 active:translate-y-2 active:shadow-none transition-all uppercase min-w-[140px]"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CSS for Shake & Comic Font */}
            <style jsx>{`
                .font-comic-sans {
                    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif;
                }
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

export default InterjectionComicStrip;
