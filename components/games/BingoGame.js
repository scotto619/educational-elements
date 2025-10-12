// components/games/BingoGame.js - Teacher BINGO Game Controller (HIDDEN ANSWERS VERSION)
import React, { useState, useEffect } from 'react';

const BINGO_CATEGORIES = {
  'times-tables': {
    name: 'Times Tables',
    icon: '✖️',
    color: 'from-blue-500 to-cyan-600',
    questions: [
      { question: '2 × 3', answer: '6' },
      { question: '3 × 4', answer: '12' },
      { question: '4 × 5', answer: '20' },
      { question: '5 × 6', answer: '30' },
      { question: '6 × 7', answer: '42' },
      { question: '7 × 8', answer: '56' },
      { question: '8 × 9', answer: '72' },
      { question: '9 × 10', answer: '90' },
      { question: '3 × 7', answer: '21' },
      { question: '4 × 8', answer: '32' },
      { question: '5 × 9', answer: '45' },
      { question: '6 × 8', answer: '48' },
      { question: '7 × 9', answer: '63' },
      { question: '8 × 7', answer: '56' },
      { question: '9 × 6', answer: '54' },
      { question: '2 × 8', answer: '16' },
      { question: '3 × 9', answer: '27' },
      { question: '4 × 7', answer: '28' },
      { question: '5 × 5', answer: '25' },
      { question: '6 × 6', answer: '36' },
      { question: '7 × 7', answer: '49' },
      { question: '8 × 8', answer: '64' },
      { question: '9 × 9', answer: '81' },
      { question: '2 × 9', answer: '18' },
      { question: '3 × 8', answer: '24' }
    ]
  },
  'vocabulary': {
    name: 'Vocabulary',
    icon: '📚',
    color: 'from-purple-500 to-pink-600',
    questions: [
      { question: 'A large, natural stream of water', answer: 'River' },
      { question: 'Feeling of great happiness', answer: 'Joy' },
      { question: 'Very large in size', answer: 'Enormous' },
      { question: 'To look at carefully', answer: 'Examine' },
      { question: 'Full of energy', answer: 'Vibrant' },
      { question: 'To make something better', answer: 'Improve' },
      { question: 'Showing courage', answer: 'Brave' },
      { question: 'A long journey', answer: 'Voyage' },
      { question: 'Very old or from long ago', answer: 'Ancient' },
      { question: 'To go somewhere quickly', answer: 'Rush' },
      { question: 'Something you cannot see', answer: 'Invisible' },
      { question: 'To think deeply', answer: 'Ponder' },
      { question: 'Feeling very angry', answer: 'Furious' },
      { question: 'A secret plan', answer: 'Scheme' },
      { question: 'Full of life', answer: 'Lively' },
      { question: 'To move slowly', answer: 'Crawl' },
      { question: 'Extremely big', answer: 'Gigantic' },
      { question: 'A difficult situation', answer: 'Problem' },
      { question: 'To shine brightly', answer: 'Gleam' },
      { question: 'Very clean', answer: 'Spotless' },
      { question: 'A strong feeling', answer: 'Emotion' },
      { question: 'To stay alive', answer: 'Survive' },
      { question: 'Very important', answer: 'Crucial' },
      { question: 'To work together', answer: 'Cooperate' },
      { question: 'A magical power', answer: 'Enchant' }
    ]
  },
  'science': {
    name: 'Science Facts',
    icon: '🔬',
    color: 'from-green-500 to-emerald-600',
    questions: [
      { question: 'The center of an atom', answer: 'Nucleus' },
      { question: 'Process plants use to make food', answer: 'Photosynthesis' },
      { question: 'Planet closest to the sun', answer: 'Mercury' },
      { question: 'H2O is the formula for', answer: 'Water' },
      { question: 'The largest planet', answer: 'Jupiter' },
      { question: 'Force that pulls objects down', answer: 'Gravity' },
      { question: 'Negatively charged particle', answer: 'Electron' },
      { question: 'The red planet', answer: 'Mars' },
      { question: 'Study of living things', answer: 'Biology' },
      { question: 'Powerhouse of the cell', answer: 'Mitochondria' },
      { question: 'Speed of light constant', answer: '299,792 km/s' },
      { question: 'Gas we breathe in', answer: 'Oxygen' },
      { question: 'Smallest unit of matter', answer: 'Atom' },
      { question: 'Layer protecting Earth', answer: 'Atmosphere' },
      { question: 'Liquid at room temperature metal', answer: 'Mercury' },
      { question: 'What ice turns into', answer: 'Water' },
      { question: 'Energy from the sun', answer: 'Solar' },
      { question: 'Three states of matter', answer: 'Solid, Liquid, Gas' },
      { question: 'Hard outer skeleton', answer: 'Exoskeleton' },
      { question: 'Study of weather', answer: 'Meteorology' },
      { question: 'Animals with backbones', answer: 'Vertebrates' },
      { question: 'Green pigment in plants', answer: 'Chlorophyll' },
      { question: 'Unit of electric current', answer: 'Ampere' },
      { question: 'Fastest land animal', answer: 'Cheetah' },
      { question: 'Number of planets', answer: 'Eight' }
    ]
  },
  'history': {
    name: 'History',
    icon: '🏛️',
    color: 'from-orange-500 to-red-600',
    questions: [
      { question: 'First president of USA', answer: 'Washington' },
      { question: 'Ancient Egyptian king', answer: 'Pharaoh' },
      { question: 'Ship that sank in 1912', answer: 'Titanic' },
      { question: 'Roman military unit', answer: 'Legion' },
      { question: 'Medieval fortress', answer: 'Castle' },
      { question: 'Ancient wonder in Egypt', answer: 'Pyramids' },
      { question: 'Viking explorer to America', answer: 'Leif Erikson' },
      { question: 'Language of ancient Rome', answer: 'Latin' },
      { question: 'First man on moon', answer: 'Armstrong' },
      { question: 'Wall in ancient China', answer: 'Great Wall' },
      { question: 'Ancient Greek warrior', answer: 'Spartan' },
      { question: 'Year WWII ended', answer: '1945' },
      { question: 'Ancient trading route', answer: 'Silk Road' },
      { question: 'Medieval plague', answer: 'Black Death' },
      { question: 'Ancient Greek city', answer: 'Athens' },
      { question: 'Roman arena', answer: 'Colosseum' },
      { question: 'Explorer of Americas', answer: 'Columbus' },
      { question: 'Ancient civilization in Iraq', answer: 'Mesopotamia' },
      { question: 'Iron curtain continent', answer: 'Europe' },
      { question: 'Renaissance country', answer: 'Italy' },
      { question: 'Ancient Egyptian paper', answer: 'Papyrus' },
      { question: 'Viking homeland', answer: 'Scandinavia' },
      { question: 'Ancient library city', answer: 'Alexandria' },
      { question: 'Medieval weapon', answer: 'Sword' },
      { question: 'Ancient Greek games', answer: 'Olympics' }
    ]
  },
  'geography': {
    name: 'Geography',
    icon: '🗺️',
    color: 'from-teal-500 to-blue-600',
    questions: [
      { question: 'Largest ocean', answer: 'Pacific' },
      { question: 'Longest river', answer: 'Nile' },
      { question: 'Highest mountain', answer: 'Everest' },
      { question: 'Largest continent', answer: 'Asia' },
      { question: 'Capital of France', answer: 'Paris' },
      { question: 'Country with most people', answer: 'China' },
      { question: 'Smallest continent', answer: 'Australia' },
      { question: 'Desert in Africa', answer: 'Sahara' },
      { question: 'Capital of Japan', answer: 'Tokyo' },
      { question: 'Largest country', answer: 'Russia' },
      { question: 'Great Barrier location', answer: 'Australia' },
      { question: 'Amazon rainforest continent', answer: 'South America' },
      { question: 'Capital of Italy', answer: 'Rome' },
      { question: 'Island country near India', answer: 'Sri Lanka' },
      { question: 'Frozen continent', answer: 'Antarctica' },
      { question: 'Mountain range in Asia', answer: 'Himalayas' },
      { question: 'Great Lakes continent', answer: 'North America' },
      { question: 'Capital of UK', answer: 'London' },
      { question: 'Country shaped like boot', answer: 'Italy' },
      { question: 'Waterfall in South America', answer: 'Angel Falls' },
      { question: 'US state with volcanoes', answer: 'Hawaii' },
      { question: 'River in Egypt', answer: 'Nile' },
      { question: 'Capital of Australia', answer: 'Canberra' },
      { question: 'Sea between Europe and Africa', answer: 'Mediterranean' },
      { question: 'Largest island', answer: 'Greenland' }
    ]
  }
};

const BingoGame = ({ showToast }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [calledQuestions, setCalledQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());

  useEffect(() => {
    if (selectedCategory) {
      setAvailableQuestions([...BINGO_CATEGORIES[selectedCategory].questions]);
    }
  }, [selectedCategory]);

  const handleStartGame = () => {
    if (!selectedCategory) {
      showToast('Please select a category first!', 'error');
      return;
    }
    setGameStarted(true);
    setCalledQuestions([]);
    setCurrentQuestion(null);
    setAvailableQuestions([...BINGO_CATEGORIES[selectedCategory].questions]);
    setRevealedAnswers(new Set());
    showToast(`${BINGO_CATEGORIES[selectedCategory].name} BINGO Started!`, 'success');
  };

  const handleCallNext = () => {
    if (availableQuestions.length === 0) {
      showToast('All questions have been called!', 'info');
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    
    setCurrentQuestion(question);
    setShowCurrentAnswer(false); // Hide answer by default for new question
    setCalledQuestions(prev => [...prev, question]);
    setAvailableQuestions(prev => prev.filter((_, index) => index !== randomIndex));
  };

  const toggleAnswerReveal = (questionIndex) => {
    const newRevealed = new Set(revealedAnswers);
    if (newRevealed.has(questionIndex)) {
      newRevealed.delete(questionIndex);
    } else {
      newRevealed.add(questionIndex);
    }
    setRevealedAnswers(newRevealed);
  };

  const handleReset = () => {
    setGameStarted(false);
    setCurrentQuestion(null);
    setCalledQuestions([]);
    setSelectedCategory(null);
    setAvailableQuestions([]);
    setShowCurrentAnswer(false);
    setRevealedAnswers(new Set());
    showToast('Game reset!', 'info');
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            BINGO Game
          </h2>
          <p className="text-gray-600">Select a category to start the game</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(BINGO_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className="group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${category.color.split(' ')[0].replace('from-', '')} 0%, ${category.color.split(' ')[1].replace('to-', '')} 100%)`
              }}
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-white text-opacity-90 text-sm">
                  {category.questions.length} questions available
                </p>
                <div className="mt-4 inline-flex items-center text-white font-semibold">
                  <span>Start Game</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How to Play
          </h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">1.</span>
              <span>Select a category above to start the game</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">2.</span>
              <span>Students should select the same category on their devices to get their BINGO cards</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">3.</span>
              <span>Click "Call Next" to display questions - <strong>answers are hidden by default</strong></span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">4.</span>
              <span>Click "Reveal Answer" when ready to show the correct answer to students</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">5.</span>
              <span>First student to get 5 in a row (horizontal, vertical, or diagonal) wins!</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  const category = BINGO_CATEGORIES[selectedCategory];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${category.color} rounded-2xl p-6 text-white shadow-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-6xl">{category.icon}</div>
            <div>
              <h2 className="text-3xl font-bold">{category.name} BINGO</h2>
              <p className="text-white text-opacity-90">
                {calledQuestions.length} / {category.questions.length} questions called
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            🔄 Change Category
          </button>
        </div>
      </div>

      {!gameStarted ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-8xl mb-6 animate-bounce">🎲</div>
          <h3 className="text-4xl font-bold text-gray-800 mb-4">Ready to Play?</h3>
          <p className="text-xl text-gray-600 mb-8">
            Tell your students to select "{category.name}" on their devices and get their BINGO cards ready!
          </p>
          <button
            onClick={handleStartGame}
            className={`bg-gradient-to-r ${category.color} text-white px-12 py-6 rounded-xl font-bold text-2xl hover:shadow-2xl transition-all transform hover:scale-105`}
          >
            🚀 Start Game
          </button>
        </div>
      ) : (
        <>
          {/* Current Question Display */}
          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
            {currentQuestion ? (
              <div className="text-center animate-fade-in w-full">
                <div className="text-6xl mb-6">📢</div>
                <div className={`bg-gradient-to-r ${category.color} text-white rounded-2xl p-12 mb-6 transform hover:scale-105 transition-transform`}>
                  <div className="text-2xl font-semibold mb-4 opacity-90">Question:</div>
                  <div className="text-6xl font-bold mb-6">{currentQuestion.question}</div>
                  
                  {/* Answer Section - Hidden by Default */}
                  <div className="border-t-2 border-white border-opacity-30 pt-6 mt-6">
                    {showCurrentAnswer ? (
                      <div className="animate-fade-in">
                        <div className="text-3xl font-semibold opacity-90">Answer:</div>
                        <div className="text-5xl font-bold mt-2">{currentQuestion.answer}</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-semibold opacity-75">
                        🔒 Answer Hidden
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Reveal Answer Button */}
                <button
                  onClick={() => setShowCurrentAnswer(!showCurrentAnswer)}
                  className={`px-8 py-4 rounded-xl font-bold text-xl transition-all transform hover:scale-105 ${
                    showCurrentAnswer 
                      ? 'bg-gray-500 hover:bg-gray-600 text-white' 
                      : `bg-gradient-to-r ${category.color} text-white hover:shadow-xl`
                  }`}
                >
                  {showCurrentAnswer ? '🔒 Hide Answer' : '👁️ Reveal Answer'}
                </button>
                
                <div className="text-gray-500 text-lg mt-4">
                  {showCurrentAnswer 
                    ? 'Students: Mark this answer on your BINGO card!' 
                    : 'Click to reveal the answer to students'}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-6">✨</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to call the first question?</h3>
                <p className="text-xl text-gray-600">Click "Call Next Question" below to begin!</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={handleCallNext}
              disabled={availableQuestions.length === 0}
              className={`flex-1 bg-gradient-to-r ${category.color} text-white px-8 py-6 rounded-xl font-bold text-2xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {availableQuestions.length > 0 ? (
                <>🎯 Call Next Question ({availableQuestions.length} left)</>
              ) : (
                <>✅ All Questions Called!</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-6 rounded-xl font-bold text-xl transition-all"
            >
              🔄 Reset Game
            </button>
          </div>

          {/* Called Questions History */}
          {calledQuestions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">📜</span>
                Called Questions ({calledQuestions.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {calledQuestions.map((q, index) => (
                  <div
                    key={index}
                    className={`bg-gradient-to-br ${category.color} bg-opacity-10 border-2 border-gray-200 rounded-lg p-4 relative`}
                  >
                    <div className="text-sm font-semibold text-gray-600 mb-2">#{index + 1}</div>
                    <div className="text-sm text-gray-600 mb-2">{q.question}</div>
                    
                    {/* Answer Toggle for History */}
                    {revealedAnswers.has(index) ? (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <div className="font-bold text-gray-800 text-lg mb-1">{q.answer}</div>
                        <button
                          onClick={() => toggleAnswerReveal(index)}
                          className="text-xs text-gray-500 hover:text-gray-700 underline"
                        >
                          Hide Answer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAnswerReveal(index)}
                        className="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded text-xs font-semibold transition-all"
                      >
                        👁️ Show Answer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BingoGame;