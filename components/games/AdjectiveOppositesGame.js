import React, { useState, useEffect } from 'react';

// Robust 60+ word pair bank
const oppositesBank = [
    { pair: ["Hot", "Cold"] }, { pair: ["Big", "Small"] }, { pair: ["Tall", "Short"] },
    { pair: ["Fast", "Slow"] }, { pair: ["Hard", "Soft"] }, { pair: ["Heavy", "Light"] },
    { pair: ["Loud", "Quiet"] }, { pair: ["Happy", "Sad"] }, { pair: ["Clean", "Dirty"] },
    { pair: ["Old", "New"] }, { pair: ["Thick", "Thin"] }, { pair: ["Wet", "Dry"] },
    { pair: ["Full", "Empty"] }, { pair: ["Rich", "Poor"] }, { pair: ["Strong", "Weak"] },
    { pair: ["Wide", "Narrow"] }, { pair: ["Deep", "Shallow"] }, { pair: ["Rough", "Smooth"] },
    { pair: ["Beautiful", "Ugly"] }, { pair: ["Brave", "Cowardly"] }, { pair: ["Bright", "Dark"] },
    { pair: ["Sharp", "Dull"] }, { pair: ["Early", "Late"] }, { pair: ["Expensive", "Cheap"] },
    { pair: ["Sweet", "Sour"] }, { pair: ["Careful", "Careless"] }, { pair: ["Polite", "Rude"] },
    { pair: ["Safe", "Dangerous"] }, { pair: ["Simple", "Complex"] }, { pair: ["Fresh", "Stale"] },
    { pair: ["Tight", "Loose"] }, { pair: ["Awake", "Asleep"] }, { pair: ["Giant", "Tiny"] },
    { pair: ["Calm", "Anxious"] }, { pair: ["Generous", "Greedy"] }, { pair: ["Humble", "Proud"] },
    { pair: ["Lazy", "Hardworking"] }, { pair: ["Optimistic", "Pessimistic"] }, { pair: ["Patient", "Impatient"] },
    { pair: ["Strict", "Lenient"] }, { pair: ["Tidy", "Messy"] }, { pair: ["Wild", "Tame"] },
    { pair: ["Alive", "Dead"] }, { pair: ["Broad", "Narrow"] }, { pair: ["Careful", "Reckless"] },
    { pair: ["Clever", "Stupid"] }, { pair: ["Cruel", "Kind"] }, { pair: ["Even", "Odd"] },
    { pair: ["Exciting", "Boring"] }, { pair: ["Famous", "Unknown"] }, { pair: ["Fat", "Thin"] },
    { pair: ["Fierce", "Gentle"] }, { pair: ["Firm", "Flabby"] }, { pair: ["Flat", "Hilly"] },
    { pair: ["Frequent", "Rare"] }, { pair: ["Guilty", "Innocent"] }, { pair: ["Healthy", "Sick"] },
    { pair: ["Heavy", "Lightweight"] }, { pair: ["Honest", "Dishonest"] }, { pair: ["Hungry", "Full"] },
    { pair: ["Modern", "Ancient"] }, { pair: ["Near", "Far"] }, { pair: ["Open", "Closed"] },
    { pair: ["Right", "Wrong"] }, { pair: ["Safe", "Risky"] }, { pair: ["Sour", "Sweet"] },
    { pair: ["Straight", "Crooked"] }, { pair: ["True", "False"] }, { pair: ["Useful", "Useless"] }
];

const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
};

const PAIRS_PER_ROUND = 6; // 12 tiles total

const AdjectiveOppositesGame = ({ onClose }) => {
    const [gameState, setGameState] = useState('start'); // start, playing, end
    const [tiles, setTiles] = useState([]);
    const [selectedTileIndex, setSelectedTileIndex] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [score, setScore] = useState(0);
    const [shakeTiles, setShakeTiles] = useState([]); // indices of tiles to shake

    useEffect(() => {
        if (gameState === 'start') {
            generateBoard();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);

    const generateBoard = () => {
        // Select 6 random pairs
        const selectedPairs = shuffleArray([...oppositesBank]).slice(0, PAIRS_PER_ROUND);

        // Flatten pairs into individual tiles, keeping track of their pairId
        let newTiles = [];
        selectedPairs.forEach((pairObj, idx) => {
            newTiles.push({ word: pairObj.pair[0], pairId: idx, isMatched: false });
            newTiles.push({ word: pairObj.pair[1], pairId: idx, isMatched: false });
        });

        // Shuffle the tiles
        setTiles(shuffleArray(newTiles));
    };

    const startGame = () => {
        generateBoard();
        setMatchedPairs(0);
        setScore(0);
        setSelectedTileIndex(null);
        setGameState('playing');
    };

    const handleTileClick = (index) => {
        // Prevent clicking matched tiles, currently selected tile, or clicking during animation
        if (tiles[index].isMatched || selectedTileIndex === index || shakeTiles.length > 0) return;

        if (selectedTileIndex === null) {
            // First selection
            setSelectedTileIndex(index);
        } else {
            // Second selection
            const firstTile = tiles[selectedTileIndex];
            const secondTile = tiles[index];

            if (firstTile.pairId === secondTile.pairId) {
                // Match!
                setScore(prev => prev + 20);
                const newTiles = [...tiles];
                newTiles[selectedTileIndex].isMatched = true;
                newTiles[index].isMatched = true;
                setTiles(newTiles);
                setSelectedTileIndex(null);
                setMatchedPairs(prev => prev + 1);

                if (matchedPairs + 1 === PAIRS_PER_ROUND) {
                    setTimeout(() => setGameState('end'), 1000);
                }
            } else {
                // Mismatch!
                setScore(prev => Math.max(0, prev - 5)); // Penalty, but don't go below 0
                setShakeTiles([selectedTileIndex, index]);

                setTimeout(() => {
                    setShakeTiles([]);
                    setSelectedTileIndex(null);
                }, 600);
            }
        }
    };

    // Array of nice subtle background colors for the tiles
    const tileColors = [
        "bg-rose-100 border-rose-300 text-rose-800", "bg-sky-100 border-sky-300 text-sky-800",
        "bg-emerald-100 border-emerald-300 text-emerald-800", "bg-amber-100 border-amber-300 text-amber-800",
        "bg-purple-100 border-purple-300 text-purple-800", "bg-indigo-100 border-indigo-300 text-indigo-800",
        "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800", "bg-teal-100 border-teal-300 text-teal-800"
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity"
                onClick={onClose}
            ></div>

            {/* Game Container */}
            <div className="relative w-full max-w-4xl h-[650px] max-h-[90vh] flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border-4 border-fuchsia-500">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-fuchsia-600 text-white z-10 shadow-md">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🧲</span>
                        <h3 className="font-black text-2xl tracking-tight drop-shadow-sm">Adjective Opposites Match</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto relative flex flex-col items-center p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-50 via-slate-50 to-white">

                    {gameState === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-8 mt-8">
                            <div className="w-32 h-32 bg-fuchsia-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-white">
                                <span className="text-6xl animate-pulse">☯️</span>
                            </div>
                            <h2 className="text-5xl font-black text-slate-800 mb-4 tracking-tight -ml-2">Opposites Attract!</h2>
                            <p className="text-xl text-slate-600 mb-10 max-w-lg mx-auto font-medium">
                                Do you know your antonyms? Find and pair the <strong className="text-fuchsia-600">Adjectives</strong> that mean the exact opposite of each other!
                            </p>
                            <button
                                onClick={startGame}
                                className="px-10 py-5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-2xl font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-3 mx-auto"
                            >
                                START MATCHING
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                            </button>
                        </div>
                    )}

                    {gameState === 'playing' && (
                        <div className="w-full flex-1 flex flex-col max-w-4xl mx-auto">

                            {/* Score & Progress HUD */}
                            <div className="flex justify-between items-center w-full mb-6">
                                <div className="text-base font-bold text-slate-500 bg-white px-5 py-2 rounded-xl shadow-sm border border-slate-200">
                                    Matches <span className="text-fuchsia-600">{matchedPairs}</span> / {PAIRS_PER_ROUND}
                                </div>
                                <div className="text-2xl font-black text-emerald-500 bg-white px-6 py-2 rounded-xl shadow-sm border border-emerald-200 flex items-center gap-2">
                                    <span>⭐</span> {score}
                                </div>
                            </div>

                            {/* Game Grid */}
                            <div className="flex-1 w-full flex items-center justify-center">
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-5 w-full">
                                    {tiles.map((tile, index) => {
                                        const isSelected = selectedTileIndex === index;
                                        const isShaking = shakeTiles.includes(index);
                                        const tileColor = tileColors[index % tileColors.length]; // Give each tile a random feeling color

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => handleTileClick(index)}
                                                disabled={tile.isMatched}
                                                className={`
                                                    relative h-24 md:h-32 rounded-2xl md:rounded-3xl border-b-[6px] transition-all duration-300 flex items-center justify-center p-2 
                                                    ${tile.isMatched
                                                        ? 'opacity-0 scale-50 pointer-events-none' // Pop out animation
                                                        : `shadow-md hover:shadow-xl hover:-translate-y-1 active:border-b-0 active:translate-y-[6px] ${tileColor} ${isSelected ? '!border-fuchsia-500 ring-4 ring-fuchsia-500/50 scale-105' : ''}`
                                                    }
                                                    ${isShaking ? 'animate-[shake_0.4s_ease-in-out] !border-red-500 !bg-red-50 !text-red-800' : ''}
                                                `}
                                            >
                                                {!tile.isMatched && (
                                                    <span className={`text-xl md:text-3xl font-black text-center tracking-tight break-words 
                                                        ${isSelected ? 'text-fuchsia-700' : ''}
                                                    `}>
                                                        {tile.word}
                                                    </span>
                                                )}

                                                {/* Selection Highlight Ring */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-fuchsia-500/10 pointer-events-none"></div>
                                                )}
                                                {/* Error State Highlight Ring */}
                                                {isShaking && (
                                                    <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-red-500/20 pointer-events-none"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {gameState === 'end' && (
                        <div className="text-center animate-in zoom-in-50 duration-500 mt-12">
                            <span className="text-8xl block mb-6 animate-bounce">🧲</span>
                            <h2 className="text-5xl font-black text-slate-800 mb-2 tracking-tight">Perfect Matches!</h2>
                            <p className="text-2xl text-slate-500 mb-8 font-medium">Vocabulary Score:</p>
                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-indigo-500 mb-12 drop-shadow-sm">
                                {score}
                            </div>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={startGame}
                                    className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xl font-bold rounded-xl transition-colors border-b-4 border-slate-300 active:border-b-0"
                                >
                                    Play Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xl font-bold rounded-xl shadow-lg transition-all border-b-4 border-fuchsia-700 active:border-b-0"
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
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                }
            `}</style>
        </div>
    );
};

export default AdjectiveOppositesGame;
