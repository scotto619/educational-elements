// components/games/BingoGame.js - Teacher BINGO Game Controller (HIDDEN ANSWERS VERSION)
import React, { useEffect, useMemo, useState } from 'react';
import BINGO_CATEGORIES, { listBingoCategories } from '../../constants/bingoCategories';

const shuffleQuestions = (questions) => {
  const result = [...questions];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const BingoGame = ({ showToast }) => {
  const categoryCards = useMemo(() => listBingoCategories(), []);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [calledQuestions, setCalledQuestions] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [showCurrentAnswer, setShowCurrentAnswer] = useState(false);
  const [revealedAnswers, setRevealedAnswers] = useState(new Set());

  const selectedCategory = useMemo(
    () => (selectedCategoryKey ? BINGO_CATEGORIES[selectedCategoryKey] : null),
    [selectedCategoryKey]
  );

  useEffect(() => {
    if (!selectedCategoryKey) {
      setAvailableQuestions([]);
      return;
    }

    const shuffled = shuffleQuestions(BINGO_CATEGORIES[selectedCategoryKey].questions);
    setAvailableQuestions(shuffled);
    setCalledQuestions([]);
    setCurrentQuestion(null);
    setShowCurrentAnswer(false);
    setRevealedAnswers(new Set());
  }, [selectedCategoryKey]);

  const handleStartGame = () => {
    if (!selectedCategory || availableQuestions.length === 0) {
      showToast('Please select a category first!', 'error');
      return;
    }

    setGameStarted(true);
    setCalledQuestions([]);
    setCurrentQuestion(null);
    setShowCurrentAnswer(false);
    setRevealedAnswers(new Set());
    showToast(`${selectedCategory.name} BINGO ready to launch!`, 'success');
  };

  const handleCallNext = () => {
    if (availableQuestions.length === 0) {
      showToast('All questions have been called!', 'info');
      return;
    }

    const [nextQuestion, ...remaining] = availableQuestions;
    setCurrentQuestion(nextQuestion);
    setShowCurrentAnswer(false);
    setCalledQuestions((prev) => [...prev, nextQuestion]);
    setAvailableQuestions(remaining);
  };

  const toggleAnswerReveal = (questionIndex) => {
    setRevealedAnswers((prev) => {
      const updated = new Set(prev);
      if (updated.has(questionIndex)) {
        updated.delete(questionIndex);
      } else {
        updated.add(questionIndex);
      }
      return updated;
    });
  };

  const handleReset = () => {
    setGameStarted(false);
    setCurrentQuestion(null);
    setCalledQuestions([]);
    setSelectedCategoryKey(null);
    setAvailableQuestions([]);
    setShowCurrentAnswer(false);
    setRevealedAnswers(new Set());
    showToast('Game reset! Select a new category to play again.', 'info');
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4 animate-bounce">🎯</div>
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Launch a Legendary BINGO Round
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pick a category below and have students choose the same one in their portal to sync the experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCards.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategoryKey(category.key)}
              className="group relative overflow-hidden rounded-2xl p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-white"
            >
              <div
                className={`absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${category.color}`}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent)]" />
              <div className="relative z-10 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-5xl transform transition-transform group-hover:scale-110">
                    {category.icon}
                  </span>
                  <span className="text-sm font-semibold uppercase tracking-wide bg-white/20 px-3 py-1 rounded-full">
                    {category.type === 'math' ? 'Math Focus' : 'Curriculum'}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-black leading-snug">{category.name}</h3>
                  <p className="text-sm text-white/80 mt-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{category.questions.length} prompts</span>
                  <span className="flex items-center space-x-1">
                    <span>Start</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            How to Play
          </h3>
          <ol className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">1.</span>
              <span>Select a category above to prepare your game board.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">2.</span>
              <span>Students choose the same category on their portal to receive matching BINGO cards.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">3.</span>
              <span>Press <strong>Start Game</strong>, then call each question with the "Call Next" button.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">4.</span>
              <span>Reveal answers when you are ready so students can mark their boards.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">5.</span>
              <span>First student with five in a row (any direction) wins!</span>
            </li>
          </ol>
        </div>
      </div>
    );
  }

  const totalQuestions = selectedCategory.questions.length;
  const remainingQuestions = availableQuestions.length;
  const questionsCalled = totalQuestions - remainingQuestions;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${selectedCategory.color} rounded-2xl p-6 text-white shadow-xl relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent)]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl md:text-6xl">{selectedCategory.icon}</div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black">{selectedCategory.name} BINGO</h2>
              <p className="text-white/85 max-w-xl">{selectedCategory.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm md:text-base">
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-center">
              <div className="text-xs uppercase tracking-wide text-white/70">Questions Called</div>
              <div className="text-lg font-bold">{questionsCalled}</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl text-center">
              <div className="text-xs uppercase tracking-wide text-white/70">Remaining</div>
              <div className="text-lg font-bold">{remainingQuestions}</div>
            </div>
            <button
              onClick={handleReset}
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl font-semibold"
            >
              🔁 Change Category
            </button>
          </div>
        </div>
      </div>

      {!gameStarted ? (
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.5),transparent)]" />
          <div className="relative z-10">
            <div className="text-7xl mb-4">🚀</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to launch {selectedCategory.name}?</h3>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Tell your students to open the "{selectedCategory.name}" BINGO card on their portal. When everyone is ready, start the countdown!
            </p>
            <button
              onClick={handleStartGame}
              className={`bg-gradient-to-r ${selectedCategory.color} text-white px-12 py-4 rounded-xl font-bold text-xl hover:shadow-2xl transition-transform transform hover:-translate-y-1`}
            >
              🎉 Start Game
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[360px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(14,116,144,0.6),transparent)]" />
            <div className="relative z-10 w-full">
              {currentQuestion ? (
                <div className="text-center space-y-6 animate-fade-in">
                  <div className="text-6xl">📣</div>
                  <div className={`bg-gradient-to-r ${selectedCategory.color} text-white rounded-2xl p-10 shadow-lg`}> 
                    <div className="text-sm uppercase tracking-widest text-white/75 mb-2">Question</div>
                    <div className="text-4xl md:text-5xl font-black">{currentQuestion.question}</div>
                    <div className="mt-6 pt-6 border-t border-white/30">
                      {showCurrentAnswer ? (
                        <div className="space-y-2">
                          <div className="text-lg uppercase tracking-widest text-white/70">Answer</div>
                          <div className="text-4xl font-black">{currentQuestion.answer}</div>
                        </div>
                      ) : (
                        <div className="text-xl font-semibold text-white/75">🔒 Answer hidden</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCurrentAnswer((prev) => !prev)}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                      showCurrentAnswer
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : `bg-gradient-to-r ${selectedCategory.color} text-white hover:shadow-xl`
                    }`}
                  >
                    {showCurrentAnswer ? 'Hide Answer' : 'Reveal Answer'}
                  </button>
                  <p className="text-gray-500">
                    {showCurrentAnswer
                      ? 'Students can now mark this answer on their boards!'
                      : 'Reveal when you are ready for students to check their cards.'}
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="text-6xl">✨</div>
                  <h3 className="text-2xl font-bold text-gray-800">Call your first question!</h3>
                  <p className="text-gray-500">Press "Call Next Question" to get the game rolling.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleCallNext}
              disabled={remainingQuestions === 0}
              className={`flex-1 bg-gradient-to-r ${selectedCategory.color} text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {remainingQuestions > 0 ? (
                <>🎯 Call Next Question ({remainingQuestions} left)</>
              ) : (
                <>✅ All Questions Called</>
              )}
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-xl font-semibold"
            >
              Reset Game
            </button>
          </div>

          {calledQuestions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📜 Question History</span>
                  <span className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    {calledQuestions.length} called
                  </span>
                </h3>
                <span className="text-sm text-gray-500">Toggle answers any time for quick reviews.</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {calledQuestions.map((question, index) => (
                  <div
                    key={`${question.question}-${index}`}
                    className="rounded-xl border border-gray-200 p-4 bg-gradient-to-br from-gray-50 to-white"
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Question #{index + 1}</div>
                    <div className="text-gray-800 font-semibold mb-3 leading-relaxed">{question.question}</div>
                    {revealedAnswers.has(index) ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-500">Answer</div>
                        <div className="text-lg font-bold text-indigo-600">{question.answer}</div>
                        <button
                          onClick={() => toggleAnswerReveal(index)}
                          className="text-xs text-indigo-500 hover:text-indigo-600 font-semibold"
                        >
                          Hide answer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => toggleAnswerReveal(index)}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-semibold py-2 rounded-lg"
                      >
                        Reveal answer
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
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default BingoGame;
