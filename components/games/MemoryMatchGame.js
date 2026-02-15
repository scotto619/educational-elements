import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Card content types: 'avatar', 'pet', 'item'
const CARD_THEMES = {
  space: { bg: 'bg-slate-900', cardBack: 'bg-indigo-600', accent: 'text-indigo-400' },
  nature: { bg: 'bg-green-900', cardBack: 'bg-green-600', accent: 'text-green-400' },
  magic: { bg: 'bg-purple-900', cardBack: 'bg-purple-600', accent: 'text-purple-400' }
};

// Default fallback images if student doesn't have enough unlocked items
const DEFAULTS = [
  { id: 'd1', type: 'icon', content: '🚀' },
  { id: 'd2', type: 'icon', content: '⭐' },
  { id: 'd3', type: 'icon', content: '💎' },
  { id: 'd4', type: 'icon', content: '🛡️' },
  { id: 'd5', type: 'icon', content: '👑' },
  { id: 'd6', type: 'icon', content: '🧬' },
  { id: 'd7', type: 'icon', content: '🐉' },
  { id: 'd8', type: 'icon', content: '🍎' },
];

const MemoryMatchGame = ({ studentData, showToast, onAwardXP, onAwardCoins }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('menu'); // menu, playing, won
  const [difficulty, setDifficulty] = useState('medium'); // easy, medium, hard
  const [currentTheme, setCurrentTheme] = useState(CARD_THEMES.space);

  // Generate deck based on difficulty and student inventory
  const generateDeck = () => {
    let pairsCount = 6;
    if (difficulty === 'easy') pairsCount = 4;
    if (difficulty === 'hard') pairsCount = 8;

    // Collect available images from student data
    let pool = [];

    // Add avatars
    if (studentData?.ownedAvatars) {
      pool.push(...studentData.ownedAvatars.map(a => ({ id: `av-${a.id}`, type: 'avatar', content: a.url || '👤' })));
    }
    // Add items? (If available in data structure, for now mix in defaults)
    pool.push(...DEFAULTS);

    // Shuffle pool and take needed amount
    pool = pool.sort(() => Math.random() - 0.5).slice(0, pairsCount);

    // Duplicate and shuffle
    const deck = [...pool, ...pool]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, uniqueId: index }));

    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameState('playing');
  };

  // Handle card click
  const handleCardClick = (id) => {
    // Prevent clicking if 2 cards already flipped or card matches or card already flipped
    if (flipped.length >= 2 || matched.includes(cards.find(c => c.uniqueId === id).id) || flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    // Check match
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const card1 = cards.find(c => c.uniqueId === newFlipped[0]);
      const card2 = cards.find(c => c.uniqueId === newFlipped[1]);

      if (card1.id === card2.id) {
        // Match!
        setTimeout(() => {
          setMatched(prev => [...prev, card1.id]);
          setFlipped([]);
          setScore(s => s + 100);
          showToast('Match found! +100pts', 'success');
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  // Check win condition
  useEffect(() => {
    if (gameState === 'playing' && matched.length === cards.length / 2 && cards.length > 0) {
      setTimeout(() => {
        setGameState('won');
        // Calculate bonus
        const bonus = Math.max(0, 1000 - (moves * 20));
        const finalScore = score + bonus;
        setScore(finalScore);

        // Award rewards
        if (onAwardCoins) {
          const coins = Math.floor(finalScore / 100);
          onAwardCoins(coins, 'Memory Match Win');
          showToast(`Game Complete! +${coins} Coins`, 'success');
        }
      }, 500);
    }
  }, [matched, cards]);

  return (
    <div className={`min-h-[600px] flex flex-col items-center justify-center p-6 rounded-3xl ${currentTheme.bg} text-white transition-colors duration-500`}>

      {gameState === 'menu' && (
        <div className="text-center space-y-8 max-w-lg">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              MEMORY MATCH
            </h2>
            <p className="text-gray-300 text-lg">
              Train your brain and unlock rewards! Match pairs of avatars and items.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4">
            {['easy', 'medium', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg capitalize font-bold transition-all ${difficulty === d ? 'bg-white text-gray-900 scale-105' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={generateDeck}
            className="px-12 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-4xl flex flex-col items-center">
          {/* HUD */}
          <div className="flex justify-between w-full mb-8 px-4">
            <div className="text-2xl font-bold">Score: <span className={currentTheme.accent}>{score}</span></div>
            <div className="text-2xl font-bold">Moves: <span className="text-gray-400">{moves}</span></div>
          </div>

          {/* Grid */}
          <div className={`grid gap-4 w-full justify-items-center ${difficulty === 'easy' ? 'grid-cols-4 max-w-2xl' :
              difficulty === 'hard' ? 'grid-cols-4 md:grid-cols-8 max-w-6xl' :
                'grid-cols-4 md:grid-cols-6 max-w-4xl'
            }`}>
            {cards.map(card => {
              const isFlipped = flipped.includes(card.uniqueId) || matched.includes(card.id);
              return (
                <div
                  key={card.uniqueId}
                  onClick={() => handleCardsClick(card.uniqueId)}
                  className="relative w-20 h-24 md:w-24 md:h-32 cursor-pointer perspective-1000 group"
                >
                  <motion.div
                    className="w-full h-full relative preserve-3d transition-transform duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    onClick={() => handleCardClick(card.uniqueId)}
                  >
                    {/* Front (Hidden) */}
                    <div className={`absolute inset-0 backface-hidden rounded-xl shadow-lg border-2 border-white/10 ${currentTheme.cardBack} flex items-center justify-center`}>
                      <span className="text-3xl opacity-50">?</span>
                    </div>

                    {/* Back (Revealed) */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl shadow-xl flex items-center justify-center overflow-hidden border-4 border-white">
                      {card.type === 'avatar' && card.content.startsWith('/') ? (
                        <img src={card.content} alt="card" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{card.content}</span>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <div className="text-center space-y-6 bg-white/10 backdrop-blur-md p-12 rounded-3xl border border-white/20">
          <h2 className="text-5xl font-black text-yellow-400 mb-2">VICTORY!</h2>
          <p className="text-xl">All pairs matched!</p>

          <div className="grid grid-cols-2 gap-8 text-left bg-black/20 p-6 rounded-xl">
            <div>
              <div className="text-gray-400 text-sm">Final Score</div>
              <div className="text-3xl font-bold">{score}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Moves Taken</div>
              <div className="text-3xl font-bold">{moves}</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={generateDeck}
              className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;