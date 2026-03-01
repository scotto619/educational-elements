import React, { useState, useEffect } from 'react';

// Massive sentence bank for adjectives
const sentenceBank = [
    { text: "The quick brown fox jumped over the lazy dog.", adjectives: ["quick", "brown", "lazy"] },
    { text: "A shiny red apple fell from the tall tree.", adjectives: ["shiny", "red", "tall"] },
    { text: "The old wooden door creaked in the cold wind.", adjectives: ["old", "wooden", "cold"] },
    { text: "She wore a beautiful blue dress to the grand party.", adjectives: ["beautiful", "blue", "grand"] },
    { text: "Heavy rain soaked the dry cracked earth.", adjectives: ["Heavy", "dry", "cracked"] },
    { text: "The little gray mouse hid under the large couch.", adjectives: ["little", "gray", "large"] },
    { text: "A bright yellow sun warmed the cool morning air.", adjectives: ["bright", "yellow", "cool", "morning"] },
    { text: "He found a smooth round pebble on the sandy beach.", adjectives: ["smooth", "round", "sandy"] },
    { text: "The fluffy white cat slept on the soft green rug.", adjectives: ["fluffy", "white", "soft", "green"] },
    { text: "Loud crashing thunder rattled the fragile window.", adjectives: ["Loud", "crashing", "fragile"] },
    { text: "A tiny green frog sat on a broad green leaf.", adjectives: ["tiny", "green", "broad", "green"] }, // Repeated adjectives handled by text matching if needed, but uniqueness is by word object later
    { text: "The fierce brave lion roared at the dark shadow.", adjectives: ["fierce", "brave", "dark"] },
    { text: "She ate a sweet juicy orange for a healthy snack.", adjectives: ["sweet", "juicy", "healthy"] },
    { text: "A creepy black spider spun a sticky web.", adjectives: ["creepy", "black", "sticky"] },
    { text: "The happy energetic puppy chased a red bouncy ball.", adjectives: ["happy", "energetic", "red", "bouncy"] },
    { text: "He read a long boring book about ancient history.", adjectives: ["long", "boring", "ancient"] },
    { text: "A mysterious cloaked stranger walked into the quiet town.", adjectives: ["mysterious", "cloaked", "quiet"] },
    { text: "The deep blue ocean is full of strange marine creatures.", adjectives: ["deep", "blue", "strange", "marine"] },
    { text: "She bought a fresh crispy loaf of bread.", adjectives: ["fresh", "crispy"] },
    { text: "A tall scary monster lived in the dark spooky cave.", adjectives: ["tall", "scary", "dark", "spooky"] },
    { text: "The hot spicy soup burned my tongue.", adjectives: ["hot", "spicy"] },
    { text: "A clever young boy solved the difficult puzzle.", adjectives: ["clever", "young", "difficult"] },
    { text: "The majestic soaring eagle hunted for small prey.", adjectives: ["majestic", "soaring", "small"] },
    { text: "She drank sour lemonade on a hot summer day.", adjectives: ["sour", "hot", "summer"] },
    { text: "A thick white fog covered the sleepy coastal village.", adjectives: ["thick", "white", "sleepy", "coastal"] },
    { text: "The rich chocolate cake was very delicious.", adjectives: ["rich", "chocolate", "delicious"] },
    { text: "He wore dirty muddy boots into the clean house.", adjectives: ["dirty", "muddy", "clean"] },
    { text: "A loud annoying alarm woke the tired man.", adjectives: ["loud", "annoying", "tired"] },
    { text: "The sparkling diamond ring caught the bright light.", adjectives: ["sparkling", "diamond", "bright"] },
    { text: "She gave a friendly polite smile to the new student.", adjectives: ["friendly", "polite", "new"] },
    { text: "The huge gray elephant sprayed cool water.", adjectives: ["huge", "gray", "cool"] },
    { text: "A wild hungry wolf howled at the full moon.", adjectives: ["wild", "hungry", "full"] },
    { text: "He drove a fast shiny sports car.", adjectives: ["fast", "shiny", "sports"] },
    { text: "The delicate pink flower bloomed in early spring.", adjectives: ["delicate", "pink", "early"] },
    { text: "A thick heavy blanket kept me warm.", adjectives: ["thick", "heavy", "warm"] }, // warm is adj here 
    { text: "The strict old teacher gave a difficult long test.", adjectives: ["strict", "old", "difficult", "long"] },
    { text: "She saw a bright shooting star in the clear night sky.", adjectives: ["bright", "shooting", "clear", "night"] },
    { text: "The fluffy white snow covered the bare brown branches.", adjectives: ["fluffy", "white", "bare", "brown"] },
    { text: "A dangerous venomous snake hid in the tall grass.", adjectives: ["dangerous", "venomous", "tall"] },
    { text: "He ate a huge messy burger for a late lunch.", adjectives: ["huge", "messy", "late"] },
    { text: "The ancient stone ruins were covered in thick green moss.", adjectives: ["ancient", "stone", "thick", "green"] },
    { text: "A magical flying carpet took them on a wild adventure.", adjectives: ["magical", "flying", "wild"] },
    { text: "The grumpy old troll blocked the narrow wooden bridge.", adjectives: ["grumpy", "old", "narrow", "wooden"] },
    { text: "She wore a shiny metallic jacket in the cold rain.", adjectives: ["shiny", "metallic", "cold"] },
    { text: "The sharp pointy needle pricked his careless finger.", adjectives: ["sharp", "pointy", "careless"] },
    { text: "A gentle cool breeze blowing across the calm lake.", adjectives: ["gentle", "cool", "calm"] },
    { text: "The heavy iron gate was shut tight.", adjectives: ["heavy", "iron", "tight"] },
    { text: "He has a loud boisterous laugh that fills the empty room.", adjectives: ["loud", "boisterous", "empty"] },
    { text: "A beautiful colorful rainbow appeared after the sudden violent storm.", adjectives: ["beautiful", "colorful", "sudden", "violent"] },
    { text: "The lazy sleepy bear yawned inside the dark cave.", adjectives: ["lazy", "sleepy", "dark"] },
    { text: "She wrote a long detailed email to her important boss.", adjectives: ["long", "detailed", "important"] }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const AdjectiveDetectiveGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, summary
    const [sentences, setSentences] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct', 'incorrect', null
    const [score, setScore] = useState({ correct: 0, missed: 0, wrong: 0 });

    const startGame = () => {
        // Shuffle sentences and pick 5 unique ones for this round
        setSentences(shuffleArray([...sentenceBank]).slice(0, 5));
        setCurrentIndex(0);
        setSelectedWords([]);
        setFeedback(null);
        setScore({ correct: 0, missed: 0, wrong: 0 });
        setGameState('playing');
    };

    const handleWordClick = (wordIndex) => {
        if (feedback) return; // Can't click after submitting

        setSelectedWords(prev => {
            if (prev.includes(wordIndex)) {
                return prev.filter(i => i !== wordIndex);
            } else {
                return [...prev, wordIndex];
            }
        });
    };

    const normalizeWord = (w) => w.toLowerCase().replace(/[.,!?]/g, '');

    const checkAnswer = () => {
        const currentSentence = sentences[currentIndex];
        const words = currentSentence.text.split(' ');

        let correctCount = 0;
        let wrongCount = 0;
        let adjectivesToFind = [...currentSentence.adjectives.map(a => a.toLowerCase())];

        selectedWords.forEach(index => {
            const word = normalizeWord(words[index]);
            if (adjectivesToFind.includes(word)) {
                correctCount++;
                // Remove one instance from toFind array in case of duplicates
                const idx = adjectivesToFind.indexOf(word);
                if (idx > -1) adjectivesToFind.splice(idx, 1);
            } else {
                wrongCount++;
            }
        });

        const missedCount = adjectivesToFind.length;

        setScore(prev => ({
            correct: prev.correct + correctCount,
            missed: prev.missed + missedCount,
            wrong: prev.wrong + wrongCount
        }));

        setFeedback({
            correctCount,
            wrongCount,
            missedCount
        });

        setTimeout(() => {
            setFeedback(null);
            setSelectedWords([]);
            if (currentIndex + 1 < sentences.length) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setGameState('summary');
            }
        }, 3000); // Show feedback for 3 seconds before next sentence
    };

    const currentSentence = sentences[currentIndex];
    const words = currentSentence ? currentSentence.text.split(' ') : [];

    const getWordStatusClass = (word, index) => {
        if (!feedback) {
            return selectedWords.includes(index) ? 'bg-amber-100 text-amber-800 border-amber-300' : 'hover:bg-slate-100 border-transparent text-slate-700';
        }

        const normalizedWord = normalizeWord(word);
        const isAdjective = currentSentence.adjectives.map(a => a.toLowerCase()).includes(normalizedWord);
        const isSelected = selectedWords.includes(index);

        if (isAdjective && isSelected) return 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'; // Correctly identified
        if (isAdjective && !isSelected) return 'bg-amber-100 text-amber-800 border-amber-400 border-dashed'; // Missed adjective
        if (!isAdjective && isSelected) return 'bg-red-100 text-red-800 border-red-400 line-through'; // Wrongly identified

        return 'opacity-50 border-transparent text-slate-500'; // Ignored non-adjective
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[650px] max-h-[90vh] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-amber-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-amber-500 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl drop-shadow-sm">🕵️‍♂️</span>
                        <h3 className="font-black text-2xl tracking-tight drop-shadow-sm">Adjective Detective</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto relative flex flex-col items-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-slate-50 to-white">

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8 mt-8">
                            <div className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl">🔍</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Find the Describing Words!</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                                Put on your detective hat! Your mission is to read the sentences and <strong className="text-amber-600">highlight every Adjective</strong> (describing word) you can find.
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-amber-500 hover:bg-amber-400 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                START CASE
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && currentSentence && (
                        <div className="w-full max-w-3xl flex flex-col h-full justify-between">
                            {/* Progress & Stats */}
                            <div className="flex justify-between items-center mb-8">
                                <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border shadow-sm">
                                    Case File <span className="text-amber-600 ml-1">{currentIndex + 1}</span> / {sentences.length}
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-2">
                                        <span>✅</span> {score.correct}
                                    </div>
                                    <div className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-xl border border-red-200 shadow-sm flex items-center gap-2">
                                        <span>❌</span> {score.wrong}
                                    </div>
                                </div>
                            </div>

                            {/* Sentence Area */}
                            <div className="flex-1 flex flex-col items-center justify-center min-h-0 mb-8 w-full relative">
                                <div className="w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-200 text-center leading-loose">
                                    {words.map((word, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleWordClick(index)}
                                            className={`text-3xl md:text-5xl font-medium mx-1 md:mx-2 px-2 py-1 rounded-xl transition-all border-b-4 
                                                ${getWordStatusClass(word, index)}
                                            `}
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>

                                {/* Absolute positioning for feedback so it doesn't move UI */}
                                <div className="absolute -bottom-24 left-0 right-0 h-20 flex justify-center items-center">
                                    {feedback && (
                                        <div className="animate-in slide-in-from-bottom-4 fade-in flex gap-4">
                                            {feedback.correctCount > 0 && (
                                                <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-bold font-sm border border-emerald-300 shadow-sm border-b-4">
                                                    +{feedback.correctCount} Correct
                                                </div>
                                            )}
                                            {feedback.missedCount > 0 && (
                                                <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold font-sm border border-amber-300 shadow-sm border-b-4">
                                                    Missed {feedback.missedCount}
                                                </div>
                                            )}
                                            {feedback.wrongCount > 0 && (
                                                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-xl font-bold font-sm border border-red-300 shadow-sm border-b-4">
                                                    {feedback.wrongCount} Incorrect
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={checkAnswer}
                                disabled={feedback !== null || selectedWords.length === 0}
                                className="w-full py-5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:text-slate-500 text-white text-2xl font-black rounded-2xl shadow-lg border-b-[6px] border-amber-600 hover:border-amber-700 disabled:border-slate-400 transition-all active:border-b-0 active:translate-y-[6px]"
                            >
                                Submit Investigation
                            </button>
                        </div>
                    )}

                    {gameState === 'summary' && (
                        <div className="text-center animate-in zoom-in-50 duration-500 mt-8">
                            <span className="text-8xl block mb-6 animate-bounce">📋</span>
                            <h2 className="text-5xl font-black text-slate-800 mb-2">Case Closed!</h2>
                            <p className="text-xl text-slate-500 mb-8 font-medium">Here's your detective report:</p>

                            <div className="grid grid-cols-3 gap-4 mb-12 max-w-xl mx-auto">
                                <div className="bg-emerald-50 border-2 border-emerald-200 p-6 rounded-2xl flex flex-col items-center">
                                    <span className="text-4xl block mb-2">✅</span>
                                    <span className="text-4xl font-black text-emerald-600 mb-1">{score.correct}</span>
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Found</span>
                                </div>
                                <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-2xl flex flex-col items-center">
                                    <span className="text-4xl block mb-2">👀</span>
                                    <span className="text-4xl font-black text-amber-600 mb-1">{score.missed}</span>
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Missed</span>
                                </div>
                                <div className="bg-rose-50 border-2 border-rose-200 p-6 rounded-2xl flex flex-col items-center">
                                    <span className="text-4xl block mb-2">❌</span>
                                    <span className="text-4xl font-black text-rose-600 mb-1">{score.wrong}</span>
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Wrong</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xl font-bold rounded-xl transition-colors border-b-4 border-slate-300 hover:border-slate-400"
                                >
                                    New Case
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold rounded-xl shadow-lg transition-colors border-b-4 border-amber-600"
                                >
                                    Return to Hub
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdjectiveDetectiveGame;
