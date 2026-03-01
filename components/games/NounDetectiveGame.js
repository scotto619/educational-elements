import React, { useState, useEffect } from 'react';

// Robust dataset of sentences where Nouns are identified 
// Format: text is the full sentence. nouns is an array of zero-indexed word positions of the nouns.
const sentenceBank = [
    // Simple Sentences
    { text: "The happy dog buried his bone in the garden.", nouns: [2, 5, 8] },
    { text: "My teacher wrote the answer on the board.", nouns: [1, 4, 7] },
    { text: "A large flock of birds flew over the ocean.", nouns: [2, 4, 8] },
    { text: "Happiness is sitting by the warm fire in winter.", nouns: [0, 6, 8] },
    { text: "Sarah and John visited Paris during the summer.", nouns: [0, 2, 4, 7] },
    { text: "The giant elephant sprayed water from its trunk.", nouns: [2, 4, 7] },
    { text: "Australia has beautiful beaches and deadly snakes.", nouns: [0, 3, 6] },
    { text: "Her bravery saved the tiny kitten from danger.", nouns: [1, 5, 7] },
    { text: "A team of researchers discovered a new planet.", nouns: [1, 3, 7] },
    { text: "The loud thunder shook the windows of my house.", nouns: [2, 5, 8] },

    // Expanded Set 1
    { text: "The quick brown fox jumped over the lazy dog.", nouns: [3, 8] },
    { text: "My mother baked a delicious chocolate cake for my birthday.", nouns: [1, 6, 9] },
    { text: "The brave knight fought the fierce dragon in the dark cave.", nouns: [2, 6, 10] },
    { text: "A beautiful rainbow appeared in the sky after the rain.", nouns: [2, 6, 9] },
    { text: "The clever detective solved the mysterious crime.", nouns: [2, 6] },
    { text: "We watched a funny movie at the cinema last night.", nouns: [4, 7, 9] },
    { text: "The talented musician played a beautiful melody on the piano.", nouns: [2, 6, 9] },
    { text: "My little sister lost her favorite toy in the park.", nouns: [2, 6, 9] },
    { text: "The hungry lion roared loudly in the dense jungle.", nouns: [2, 7] },
    { text: "A brilliant scientist invented a revolutionary machine.", nouns: [2, 6] },

    // Expanded Set 2
    { text: "The majestic eagle soared high above the snow-capped mountains.", nouns: [2, 8] },
    { text: "Our family enjoyed a relaxing vacation at the beach.", nouns: [1, 5, 8] },
    { text: "The tiny spaceship landed gracefully on the mysterious planet.", nouns: [2, 8] },
    { text: "A wise old owl hooted softly from the tall oak tree.", nouns: [3, 9] },
    { text: "My best friend gave me a thoughtful gift for Christmas.", nouns: [2, 7, 9] },
    { text: "The energetic puppy chased the brightly colored butterfly.", nouns: [2, 7] },
    { text: "We explored ancient ruins during our trip to Greece.", nouns: [3, 6, 8] },
    { text: "The skilled chef prepared a mouth-watering feast.", nouns: [2, 6] },
    { text: "A gentle breeze rustled the green leaves on the trees.", nouns: [2, 6, 9] },
    { text: "The curious cat explored the dark, dusty attic.", nouns: [2, 7] },

    // Expanded Set 3
    { text: "My grandfather told us a fascinating story about his youth.", nouns: [1, 7, 10] },
    { text: "The powerful rocket launched perfectly into space.", nouns: [2, 6] },
    { text: "A talented artist painted a stunning portrait of the queen.", nouns: [2, 6, 9] },
    { text: "We hiked through a dense forest to reach the hidden waterfall.", nouns: [5, 10] },
    { text: "The wise king ruled his kingdom with justice and fairness.", nouns: [2, 5, 7, 9] },
    { text: "A playful dolphin jumped playfully out of the blue sea.", nouns: [2, 9] },
    { text: "My talented sister won the prestigious spelling bee.", nouns: [2, 7] },
    { text: "The brave astronaut floated weightlessly outside the space station.", nouns: [2, 8] },
    { text: "We found a beautifully decorated seashell on the sandy beach.", nouns: [5, 9] },
    { text: "The massive whale breached the surface of the ocean.", nouns: [2, 5, 8] },

    // Expanded Set 4
    { text: "A sudden storm brought heavy rain and strong winds.", nouns: [2, 5, 8] },
    { text: "The dedicated doctor worked tirelessly to save his patients.", nouns: [2, 8] },
    { text: "We marvelled at the brilliant stars in the clear night sky.", nouns: [5, 10] },
    { text: "A mischievous monkey stole my delicious banana.", nouns: [2, 6] },
    { text: "The talented acrobat performed incredible stunts at the circus.", nouns: [2, 5, 8] },
    { text: "We sailed across the calm lake in a small wooden boat.", nouns: [5, 10] },
    { text: "The ancient castle was surrounded by a deep, dark moat.", nouns: [2, 9] },
    { text: "A majestic tiger prowled silently through the dense jungle.", nouns: [2, 8] },
    { text: "My favorite author released a thrilling new novel.", nouns: [2, 8] },
    { text: "The busy bees gathered sweet nectar from the colorful flowers.", nouns: [2, 5, 9] }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const NounDetectiveGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [sentences, setSentences] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]); // Array of clicked word indices
    const [feedback, setFeedback] = useState(null); // 'checking', 'correct', 'incorrect'

    useEffect(() => {
        if (gameState === 'start') {
            setSentences(shuffleArray([...sentenceBank]).slice(0, 5));
        }
    }, [gameState]);

    const startGame = () => {
        setSentences(shuffleArray([...sentenceBank]).slice(0, 5)); // Draw fresh sentences
        setScore(0);
        setCurrentIndex(0);
        setSelectedWords([]);
        setFeedback(null);
        setGameState('playing');
    };

    const toggleWord = (index) => {
        if (feedback) return; // prevent clicking while checking

        setSelectedWords(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const checkAnswer = () => {
        setFeedback('checking');

        const currentSentence = sentences[currentIndex];
        const targetNouns = currentSentence.nouns;

        // Check if exact match (all selected words are nouns, and all nouns are selected)
        const isCorrect =
            selectedWords.length === targetNouns.length &&
            selectedWords.every(val => targetNouns.includes(val));

        setTimeout(() => {
            if (isCorrect) {
                setFeedback('correct');
                setScore(prev => prev + 20); // 20 pts per sentence
            } else {
                setFeedback('incorrect');
            }

            // Move to next after a delay to show feedback colors
            setTimeout(() => {
                setFeedback(null);
                setSelectedWords([]);
                if (currentIndex + 1 < sentences.length) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setGameState('end');
                }
            }, 2000);
        }, 500); // Simulate checking animation delay
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
            {/* Glassmorphic Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container (Fixed Height to fit on most screens including 13" laptops) */}
            <div className="relative w-full max-w-4xl h-[650px] max-h-[90vh] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-amber-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-amber-600 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🕵️</span>
                        <h3 className="font-black text-2xl tracking-tight">Noun Detective</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col items-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100 via-slate-50 to-white">

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8">
                            <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl">🔍</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight">Case of the Missing Nouns</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                                Put on your detective hat! Read the sentences and click to highlight EVERY noun.
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                START INVESTIGATION
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="w-full h-full flex flex-col justify-between py-2">
                            {/* Score & Progress */}
                            <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-4">
                                <div className="text-base font-bold text-slate-500 bg-white px-4 py-1.5 rounded-xl shadow-sm border border-slate-200">
                                    Case File <span className="text-amber-600">{currentIndex + 1}</span> / {sentences.length}
                                </div>
                                <div className="text-xl font-black text-emerald-500 bg-white px-5 py-1.5 rounded-xl shadow-sm border border-emerald-200 flex items-center gap-2">
                                    <span>⭐</span> {score}
                                </div>
                            </div>

                            {/* Sentence Area */}
                            <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-0">
                                <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl border border-slate-200 text-center w-full">

                                    <div className="text-xs md:text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">
                                        Click all the nouns in the sentence below:
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 text-2xl md:text-4xl font-bold leading-tight">
                                        {sentences[currentIndex].text.split(' ').map((word, index) => {

                                            // Determine styles based on feedback state
                                            const isSelected = selectedWords.includes(index);
                                            const isTargetNoun = sentences[currentIndex].nouns.includes(index);

                                            let styles = "px-2 py-1 rounded-xl cursor-pointer transition-all duration-200 border-b-4 ";

                                            if (!feedback) {
                                                styles += isSelected
                                                    ? 'bg-amber-200 border-amber-400 text-slate-800 scale-105 shadow-md'
                                                    : 'bg-transparent border-transparent text-slate-700 hover:bg-slate-100';
                                            } else {
                                                // Showcase answers
                                                if (isTargetNoun && isSelected) {
                                                    styles += 'bg-emerald-400 border-emerald-600 text-white scale-110 shadow-lg animate-pulse'; // Found it!
                                                } else if (isTargetNoun && !isSelected) {
                                                    styles += 'bg-transparent border-rose-500 text-rose-500 underline decoration-wavy decoration-rose-500'; // Missed it
                                                } else if (!isTargetNoun && isSelected) {
                                                    styles += 'bg-rose-400 border-rose-600 text-white shake'; // Wrong selection
                                                } else {
                                                    styles += 'bg-transparent border-transparent text-slate-400 opacity-50'; // Background words
                                                }
                                            }

                                            return (
                                                <span
                                                    key={index}
                                                    onClick={() => toggleWord(index)}
                                                    className={styles}
                                                >
                                                    {word}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    {/* Feedback Message */}
                                    <div className="h-8 mt-4 flex items-center justify-center">
                                        {feedback === 'correct' && (
                                            <div className="text-emerald-500 font-black text-xl animate-in slide-in-from-bottom-2">
                                                Brilliant Detective Work! +20 Points
                                            </div>
                                        )}
                                        {feedback === 'incorrect' && (
                                            <div className="text-rose-500 font-black text-xl animate-in slide-in-from-bottom-2">
                                                Not quite right! Review the red marks.
                                            </div>
                                        )}
                                        {feedback === 'checking' && (
                                            <div className="text-amber-500 font-bold text-lg flex items-center gap-2">
                                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Gathering Clues...
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center mt-4">
                                <button
                                    onClick={checkAnswer}
                                    disabled={selectedWords.length === 0 || feedback !== null}
                                    className="px-10 py-3 md:py-4 bg-slate-800 text-white font-bold text-lg md:text-xl rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors shadow-lg"
                                >
                                    Submit Investigation
                                </button>
                            </div>
                        </div>
                    )}

                    {gameState === 'end' && (
                        <div className="text-center animate-in zoom-in-50 duration-500">
                            <span className="text-8xl block mb-6 animate-bounce">🎖️</span>
                            <h2 className="text-5xl font-black text-slate-800 mb-2">Case Closed!</h2>
                            <p className="text-2xl text-slate-500 mb-8 font-medium">Your Detective Score:</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-12 drop-shadow-sm">
                                {score} <span className="text-4xl text-slate-800">/ 100</span>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xl font-bold rounded-xl transition-colors"
                                >
                                    New Cases
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white text-xl font-bold rounded-xl shadow-lg transition-colors"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default NounDetectiveGame;
