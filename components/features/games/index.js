// components/features/games/index.js - Classroom Games Components
// These focused components handle various interactive classroom games

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Button, 
  Card, 
  Modal,
  InputField,
  SelectField,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useStudents } from '../../../hooks';
import soundService from '../../../config/services/soundService';

// ===============================================
// MEMORY GAME COMPONENT
// ===============================================

/**
 * Memory card matching game
 */
export const MemoryGame = ({ 
  students, 
  onGameComplete 
}) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const timerRef = useRef(null);

  // Generate cards from student avatars
  const generateCards = useCallback(() => {
    const selectedStudents = students.slice(0, 8); // Use first 8 students
    const cardPairs = selectedStudents.flatMap(student => [
      { id: `${student.id}-1`, studentId: student.id, image: student.avatar, name: student.firstName },
      { id: `${student.id}-2`, studentId: student.id, image: student.avatar, name: student.firstName }
    ]);
    
    // Shuffle cards
    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, [students]);

  const startGame = () => {
    generateCards();
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setTimeElapsed(0);
    setIsPlaying(true);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
  };

  const handleCardClick = (cardId) => {
    if (!isPlaying || flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedCards.includes(cardId)) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstCard, secondCard] = newFlippedCards;
      const firstCardData = cards.find(c => c.id === firstCard);
      const secondCardData = cards.find(c => c.id === secondCard);

      if (firstCardData.studentId === secondCardData.studentId) {
        // Match!
        soundService.playSuccessSound();
        setMatchedCards(prev => [...prev, firstCard, secondCard]);
        setFlippedCards([]);
        
        // Check if game is complete
        if (matchedCards.length + 2 === cards.length) {
          setTimeout(() => {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            onGameComplete?.({ moves: moves + 1, time: timeElapsed });
          }, 500);
        }
      } else {
        // No match
        soundService.playErrorSound();
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <Card title="Memory Match Game">
      <div className="space-y-4">
        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{moves}</div>
            <div className="text-sm text-blue-700">Moves</div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-green-600">{timeElapsed}s</div>
            <div className="text-sm text-green-700">Time</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{matchedCards.length / 2}</div>
            <div className="text-sm text-purple-700">Matches</div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="text-center">
          <Button
            onClick={startGame}
            disabled={students.length < 4}
            className="bg-green-500 hover:bg-green-600"
          >
            {isPlaying ? 'Game in Progress' : 'Start Memory Game'}
          </Button>
          
          {students.length < 4 && (
            <p className="text-sm text-gray-600 mt-2">
              Need at least 4 students to play
            </p>
          )}
        </div>

        {/* Game Board */}
        {cards.length > 0 && (
          <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
            {cards.map(card => {
              const isFlipped = flippedCards.includes(card.id) || matchedCards.includes(card.id);
              
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`
                    aspect-square rounded-lg border-2 transition-all duration-300 transform
                    ${isFlipped ? 'rotate-180' : 'hover:scale-105'}
                    ${matchedCards.includes(card.id) ? 'border-green-500 bg-green-100' : 'border-gray-300'}
                  `}
                  disabled={!isPlaying}
                >
                  {isFlipped ? (
                    <div className="h-full flex flex-col items-center justify-center p-2">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-8 h-8 rounded-full mb-1"
                        onError={(e) => {
                          e.target.src = '/Avatars/Wizard F/Level 1.png';
                        }}
                      />
                      <span className="text-xs font-medium">{card.name}</span>
                    </div>
                  ) : (
                    <div className="h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center text-white text-2xl">
                      ?
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// QUIZ GAME COMPONENT
// ===============================================

/**
 * Interactive quiz game with customizable questions
 */
export const QuizGame = ({ 
  students, 
  onGameComplete 
}) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResult, setShowResult] = useState(false);

  const timerRef = useRef(null);

  const defaultQuestions = [
    {
      question: "What is 5 + 3?",
      answers: ["6", "7", "8", "9"],
      correct: 2
    },
    {
      question: "Which planet is closest to the Sun?",
      answers: ["Venus", "Mercury", "Earth", "Mars"],
      correct: 1
    },
    {
      question: "What is the capital of France?",
      answers: ["London", "Berlin", "Paris", "Rome"],
      correct: 2
    },
    {
      question: "How many days are in a week?",
      answers: ["5", "6", "7", "8"],
      correct: 2
    },
    {
      question: "What color do you get when you mix red and blue?",
      answers: ["Green", "Purple", "Orange", "Yellow"],
      correct: 1
    }
  ];

  const startQuiz = () => {
    setQuestions(defaultQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsPlaying(true);
    setShowResult(false);
    setTimeLeft(15);
    
    // Start timer for first question
    startQuestionTimer();
  };

  const startQuestionTimer = () => {
    setTimeLeft(15);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    clearInterval(timerRef.current);
    setShowResult(true);
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (!isPlaying || selectedAnswer !== null) return;
    
    clearInterval(timerRef.current);
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    if (answerIndex === currentQuestion.correct) {
      setScore(prev => prev + 1);
      soundService.playSuccessSound();
    } else {
      soundService.playErrorSound();
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      startQuestionTimer();
    } else {
      // Quiz complete
      setIsPlaying(false);
      onGameComplete?.({ score, total: questions.length });
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Card title="Class Quiz Game">
      <div className="space-y-6">
        {/* Quiz Stats */}
        {isPlaying && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {currentQuestionIndex + 1}/{questions.length}
              </div>
              <div className="text-sm text-blue-700">Question</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-red-600">{timeLeft}s</div>
              <div className="text-sm text-red-700">Time Left</div>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {!isPlaying && (
          <div className="text-center">
            <Button
              onClick={startQuiz}
              className="bg-purple-500 hover:bg-purple-600"
              size="lg"
            >
              Start Quiz Game
            </Button>
          </div>
        )}

        {/* Current Question */}
        {isPlaying && currentQuestion && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {currentQuestion.question}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-center font-medium
                    ${selectedAnswer === null 
                      ? 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                      : selectedAnswer === index
                        ? index === currentQuestion.correct
                          ? 'border-green-500 bg-green-100 text-green-800'
                          : 'border-red-500 bg-red-100 text-red-800'
                        : index === currentQuestion.correct && showResult
                          ? 'border-green-500 bg-green-100 text-green-800'
                          : 'border-gray-200 bg-gray-50 text-gray-500'
                    }
                  `}
                >
                  {answer}
                  {showResult && index === currentQuestion.correct && (
                    <span className="ml-2">✓</span>
                  )}
                  {showResult && selectedAnswer === index && index !== currentQuestion.correct && (
                    <span className="ml-2">✗</span>
                  )}
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / 15) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Final Results */}
        {!isPlaying && score > 0 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-800">
              Quiz Complete!
            </h3>
            <div className="text-lg text-gray-600">
              Final Score: {score} out of {questions.length}
            </div>
            <div className={`
              text-2xl font-bold
              ${score === questions.length ? 'text-green-600' :
                score >= questions.length * 0.7 ? 'text-blue-600' :
                score >= questions.length * 0.5 ? 'text-yellow-600' : 'text-red-600'}
            `}>
              {score === questions.length ? 'Perfect!' :
               score >= questions.length * 0.7 ? 'Great Job!' :
               score >= questions.length * 0.5 ? 'Good Effort!' : 'Keep Practicing!'}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// WORD SCRAMBLE GAME
// ===============================================

/**
 * Word scrambling game for vocabulary practice
 */
export const WordScrambleGame = ({ onGameComplete }) => {
  const [words] = useState([
    'CLASSROOM', 'LEARNING', 'STUDENT', 'TEACHER', 'HOMEWORK',
    'READING', 'WRITING', 'SCIENCE', 'HISTORY', 'MATHEMATICS'
  ]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const scrambleWord = (word) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const startGame = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setIsPlaying(true);
    setShowResult(false);
    setUserGuess('');
    
    const firstWord = words[0];
    setScrambledWord(scrambleWord(firstWord));
  };

  const handleSubmit = () => {
    const currentWord = words[currentWordIndex];
    const isCorrect = userGuess.toUpperCase() === currentWord;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      soundService.playSuccessSound();
    } else {
      soundService.playErrorSound();
    }
    
    setShowResult(true);
    
    setTimeout(() => {
      if (currentWordIndex + 1 < words.length) {
        setCurrentWordIndex(prev => prev + 1);
        setUserGuess('');
        setShowResult(false);
        
        const nextWord = words[currentWordIndex + 1];
        setScrambledWord(scrambleWord(nextWord));
      } else {
        setIsPlaying(false);
        onGameComplete?.({ score, total: words.length });
      }
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && userGuess.trim() && !showResult) {
      handleSubmit();
    }
  };

  const currentWord = words[currentWordIndex];

  return (
    <Card title="Word Scramble Challenge">
      <div className="space-y-6">
        {/* Game Stats */}
        {isPlaying && (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-blue-600">
                {currentWordIndex + 1}/{words.length}
              </div>
              <div className="text-sm text-blue-700">Word</div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-green-700">Correct</div>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-xl font-bold text-purple-600">
                {Math.round((score / (currentWordIndex + 1)) * 100) || 0}%
              </div>
              <div className="text-sm text-purple-700">Accuracy</div>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {!isPlaying && (
          <div className="text-center">
            <Button
              onClick={startGame}
              className="bg-orange-500 hover:bg-orange-600"
              size="lg"
            >
              Start Word Scramble
            </Button>
          </div>
        )}

        {/* Current Scrambled Word */}
        {isPlaying && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Unscramble this word:
              </h3>
              <div className="text-4xl font-bold text-purple-600 tracking-wider bg-purple-50 p-4 rounded-lg">
                {scrambledWord}
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <InputField
                value={userGuess}
                onChange={setUserGuess}
                onKeyPress={handleKeyPress}
                placeholder="Enter your guess..."
                disabled={showResult}
                className="text-center text-lg"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!userGuess.trim() || showResult}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Submit Guess
            </Button>

            {/* Result Display */}
            {showResult && (
              <div className={`
                p-4 rounded-lg
                ${userGuess.toUpperCase() === currentWord
                  ? 'bg-green-100 border border-green-300'
                  : 'bg-red-100 border border-red-300'}
              `}>
                <div className="text-xl font-bold">
                  {userGuess.toUpperCase() === currentWord ? '✓ Correct!' : '✗ Incorrect'}
                </div>
                <div className="text-lg mt-2">
                  The word was: <strong>{currentWord}</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Final Results */}
        {!isPlaying && score > 0 && (
          <div className="text-center space-y-4">
            <div className="text-6xl">📝</div>
            <h3 className="text-xl font-bold text-gray-800">
              Word Scramble Complete!
            </h3>
            <div className="text-lg text-gray-600">
              You unscrambled {score} out of {words.length} words!
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// GAME SELECTOR COMPONENT
// ===============================================

/**
 * Interface for selecting which game to play
 */
export const GameSelector = ({ 
  selectedGame, 
  onGameSelect 
}) => {
  const games = [
    { 
      id: 'memory', 
      name: 'Memory Match', 
      icon: '🧠', 
      description: 'Match student avatar pairs',
      difficulty: 'Easy'
    },
    { 
      id: 'quiz', 
      name: 'Quick Quiz', 
      icon: '❓', 
      description: 'Answer questions quickly',
      difficulty: 'Medium'
    },
    { 
      id: 'scramble', 
      name: 'Word Scramble', 
      icon: '📝', 
      description: 'Unscramble vocabulary words',
      difficulty: 'Medium'
    },
    { 
      id: 'trivia', 
      name: 'Class Trivia', 
      icon: '🎯', 
      description: 'Educational trivia questions',
      difficulty: 'Hard'
    }
  ];

  return (
    <Card title="Select a Game">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => onGameSelect(game.id)}
            className={`
              p-6 rounded-lg border-2 transition-all text-left
              ${selectedGame === game.id
                ? 'border-blue-500 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
            `}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{game.icon}</div>
              
              <div className="flex-1">
                <h3 className="text-lg font-bold">{game.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{game.description}</p>
                
                <div className="mt-3 flex items-center space-x-2">
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${game.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'}
                  `}>
                    {game.difficulty}
                  </span>
                  
                  {selectedGame === game.id && (
                    <span className="text-blue-600 text-sm font-medium">
                      ✓ Selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};

// ===============================================
// MAIN GAMES TAB COMPONENT
// ===============================================

/**
 * Complete Games tab using smaller game components
 */
export const GamesTab = ({ userId, classId }) => {
  const { students, loading } = useStudents(userId, classId);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameResults, setGameResults] = useState(null);

  const handleGameComplete = (results) => {
    setGameResults(results);
    console.log('Game completed with results:', results);
    
    // Here you could award XP to students based on game performance
    // or save game statistics
  };

  const renderSelectedGame = () => {
    switch (selectedGame) {
      case 'memory':
        return (
          <MemoryGame 
            students={students}
            onGameComplete={handleGameComplete}
          />
        );
      
      case 'quiz':
        return (
          <QuizGame 
            students={students}
            onGameComplete={handleGameComplete}
          />
        );
      
      case 'scramble':
        return (
          <WordScrambleGame 
            onGameComplete={handleGameComplete}
          />
        );
      
      default:
        return (
          <Card title="Game Coming Soon">
            <EmptyState
              icon="🚧"
              title="Under Development"
              description={`The ${selectedGame} game is being developed!`}
            />
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Classroom Games! 🎮
        </h1>
        <p className="text-gray-600 mt-2">
          Fun and educational games to engage your students
        </p>
      </div>

      {/* Game Selection */}
      <GameSelector 
        selectedGame={selectedGame}
        onGameSelect={setSelectedGame}
      />

      {/* Selected Game */}
      {selectedGame && renderSelectedGame()}

      {/* Game Results Summary */}
      {gameResults && (
        <Card title="Game Results">
          <div className="text-center space-y-4">
            <div className="text-4xl">🏆</div>
            <h3 className="text-xl font-bold text-gray-800">
              Game Complete!
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm">
                {JSON.stringify(gameResults, null, 2)}
              </pre>
            </div>

            <Button
              onClick={() => {
                setGameResults(null);
                setSelectedGame(null);
              }}
              variant="secondary"
            >
              Play Another Game
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

// Export all components
