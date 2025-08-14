// utils/quizShowHelpers.js - QUIZ SHOW CORE UTILITIES
import { database } from './firebase';
import { ref, get } from 'firebase/database';

// ===============================================
// ROOM CODE GENERATION
// ===============================================
export const generateRoomCode = () => {
  // Generate a 6-digit room code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const validateRoomCode = (code) => {
  return /^\d{6}$/.test(code);
};

// ===============================================
// SCORE CALCULATION SYSTEM
// ===============================================
export const calculateQuizScore = (timeSpent, timeLimit, basePoints = 1000, isCorrect = true) => {
  if (!isCorrect) return 0;
  
  // Time bonus: faster answers get more points
  const timeRatio = Math.max(0, (timeLimit - timeSpent) / timeLimit);
  const timeBonus = Math.floor(timeRatio * 500); // Up to 500 bonus points
  
  return Math.max(100, basePoints + timeBonus); // Minimum 100 points for correct answers
};

export const calculateStreakBonus = (streak) => {
  if (streak < 2) return 0;
  return streak * 50; // 50 points per consecutive correct answer
};

// ===============================================
// SOUND SYSTEM
// ===============================================
export const playQuizSound = (soundType, volume = 0.5) => {
  try {
    const soundMap = {
      'join': '/sounds/quizshow/chime.mp3',
      'gameStart': '/sounds/quizshow/fanfare.mp3',
      'questionReveal': '/sounds/quizshow/swoosh.mp3',
      'answerSubmit': '/sounds/quizshow/click.mp3',
      'correct': '/sounds/quizshow/success.mp3',
      'incorrect': '/sounds/quizshow/buzzer.mp3',
      'timeWarning': '/sounds/quizshow/tick.mp3',
      'leaderboard': '/sounds/quizshow/dramatic.mp3',
      'gameEnd': '/sounds/quizshow/finale.mp3'
    };
    
    const audio = new Audio(soundMap[soundType]);
    audio.volume = volume;
    audio.play().catch(e => {
      console.warn('Could not play sound:', soundType, e);
    });
  } catch (error) {
    console.warn('Sound system error:', error);
  }
};

// ===============================================
// QUESTION VALIDATION
// ===============================================
export const validateQuestion = (question) => {
  const errors = [];
  
  if (!question.question?.trim()) {
    errors.push('Question text is required');
  }
  
  if (question.type === 'multiple_choice') {
    if (!question.options || question.options.length < 2) {
      errors.push('At least 2 answer options are required');
    }
    
    if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
      errors.push('Valid correct answer must be selected');
    }
    
    // Check for empty options
    const emptyOptions = question.options.some(option => !option?.trim());
    if (emptyOptions) {
      errors.push('All answer options must have text');
    }
  }
  
  if (!question.timeLimit || question.timeLimit < 5 || question.timeLimit > 120) {
    errors.push('Time limit must be between 5 and 120 seconds');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateQuiz = (quiz) => {
  const errors = [];
  
  if (!quiz.title?.trim()) {
    errors.push('Quiz title is required');
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push('Quiz must have at least one question');
  }
  
  // Validate each question
  if (quiz.questions) {
    quiz.questions.forEach((question, index) => {
      const questionValidation = validateQuestion(question);
      if (!questionValidation.isValid) {
        errors.push(`Question ${index + 1}: ${questionValidation.errors.join(', ')}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===============================================
// PRESET QUESTION CATEGORIES
// ===============================================
export const QUESTION_CATEGORIES = {
  mathematics: {
    name: 'Mathematics',
    icon: '🔢',
    color: '#3B82F6',
    description: 'Numbers, arithmetic, and math concepts'
  },
  science: {
    name: 'Science',
    icon: '🧪',
    color: '#10B981',
    description: 'Natural sciences and scientific concepts'
  },
  geography: {
    name: 'Geography',
    icon: '🌍',
    color: '#F59E0B',
    description: 'Countries, capitals, and world knowledge'
  },
  history: {
    name: 'History',
    icon: '🏛️',
    color: '#8B5CF6',
    description: 'Historical events and figures'
  },
  language: {
    name: 'Language Arts',
    icon: '📚',
    color: '#EF4444',
    description: 'Grammar, vocabulary, and language skills'
  },
  general: {
    name: 'General Knowledge',
    icon: '🧠',
    color: '#6B7280',
    description: 'Mixed topics and trivia'
  }
};

// ===============================================
// PRESET QUESTIONS DATABASE
// ===============================================
export const PRESET_QUESTIONS = {
  mathematics: [
    {
      id: 'math_1',
      question: 'What is 7 + 8?',
      type: 'multiple_choice',
      options: ['14', '15', '16', '17'],
      correctAnswer: 1,
      timeLimit: 15,
      difficulty: 'easy',
      points: 1000
    },
    {
      id: 'math_2',
      question: 'Which number comes next: 2, 4, 6, 8, __?',
      type: 'multiple_choice',
      options: ['9', '10', '11', '12'],
      correctAnswer: 1,
      timeLimit: 20,
      difficulty: 'easy',
      points: 1000
    },
    {
      id: 'math_3',
      question: 'What is 12 × 5?',
      type: 'multiple_choice',
      options: ['50', '55', '60', '65'],
      correctAnswer: 2,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    },
    {
      id: 'math_4',
      question: 'How many sides does a triangle have?',
      type: 'multiple_choice',
      options: ['2', '3', '4', '5'],
      correctAnswer: 1,
      timeLimit: 10,
      difficulty: 'easy',
      points: 800
    },
    {
      id: 'math_5',
      question: 'What is 100 ÷ 4?',
      type: 'multiple_choice',
      options: ['20', '25', '30', '35'],
      correctAnswer: 1,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    }
  ],
  
  science: [
    {
      id: 'sci_1',
      question: 'How many planets are in our solar system?',
      type: 'multiple_choice',
      options: ['7', '8', '9', '10'],
      correctAnswer: 1,
      timeLimit: 15,
      difficulty: 'easy',
      points: 1000
    },
    {
      id: 'sci_2',
      question: 'What gas do plants take in during photosynthesis?',
      type: 'multiple_choice',
      options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
      correctAnswer: 1,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    },
    {
      id: 'sci_3',
      question: 'Which animal is known as the "King of the Jungle"?',
      type: 'multiple_choice',
      options: ['Tiger', 'Elephant', 'Lion', 'Gorilla'],
      correctAnswer: 2,
      timeLimit: 15,
      difficulty: 'easy',
      points: 1000
    },
    {
      id: 'sci_4',
      question: 'What are the three states of matter?',
      type: 'multiple_choice',
      options: ['Hot, Cold, Warm', 'Solid, Liquid, Gas', 'Big, Medium, Small', 'Fast, Medium, Slow'],
      correctAnswer: 1,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    },
    {
      id: 'sci_5',
      question: 'Which planet is closest to the Sun?',
      type: 'multiple_choice',
      options: ['Venus', 'Mercury', 'Earth', 'Mars'],
      correctAnswer: 1,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    }
  ],
  
  geography: [
    {
      id: 'geo_1',
      question: 'What is the capital of Australia?',
      type: 'multiple_choice',
      options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
      correctAnswer: 2,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    },
    {
      id: 'geo_2',
      question: 'Which continent is the largest?',
      type: 'multiple_choice',
      options: ['Africa', 'Asia', 'North America', 'Europe'],
      correctAnswer: 1,
      timeLimit: 15,
      difficulty: 'easy',
      points: 1000
    },
    {
      id: 'geo_3',
      question: 'How many continents are there?',
      type: 'multiple_choice',
      options: ['5', '6', '7', '8'],
      correctAnswer: 2,
      timeLimit: 15,
      difficulty: 'easy',
      points: 1000
    },
    {
      id: 'geo_4',
      question: 'Which ocean is the largest?',
      type: 'multiple_choice',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correctAnswer: 3,
      timeLimit: 20,
      difficulty: 'medium',
      points: 1200
    },
    {
      id: 'geo_5',
      question: 'What is the longest river in the world?',
      type: 'multiple_choice',
      options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'],
      correctAnswer: 1,
      timeLimit: 25,
      difficulty: 'hard',
      points: 1500
    }
  ]
};

// ===============================================
// GAME LOGIC HELPERS
// ===============================================
export const createQuizFromPreset = (category, questionCount = 10) => {
  const categoryQuestions = PRESET_QUESTIONS[category] || [];
  if (categoryQuestions.length === 0) {
    throw new Error(`No preset questions available for category: ${category}`);
  }
  
  // Shuffle and select questions
  const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
  
  const categoryInfo = QUESTION_CATEGORIES[category];
  
  return {
    id: `preset_${category}_${Date.now()}`,
    title: `${categoryInfo?.name || 'Quiz'} - ${selectedQuestions.length} Questions`,
    description: `Auto-generated quiz from ${categoryInfo?.name || 'preset'} questions`,
    category: category,
    isPreset: true,
    questions: selectedQuestions.map((q, index) => ({
      ...q,
      id: `${q.id}_${index}`,
      index: index
    })),
    settings: {
      showCorrectAnswers: true,
      allowRetakes: true,
      shuffleQuestions: false,
      shuffleAnswers: true
    },
    createdAt: Date.now(),
    defaultTimeLimit: 20
  };
};

export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatScore = (score) => {
  return score.toLocaleString();
};

// ===============================================
// REAL-TIME HELPER FUNCTIONS
// ===============================================
export const checkGameRoomExists = async (roomCode) => {
  try {
    const gameRef = ref(database, `gameRooms/${roomCode}`);
    const snapshot = await get(gameRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking game room:', error);
    return false;
  }
};

export const getGameRoomData = async (roomCode) => {
  try {
    const gameRef = ref(database, `gameRooms/${roomCode}`);
    const snapshot = await get(gameRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting game room data:', error);
    return null;
  }
};

// ===============================================
// ANIMATION & EFFECTS HELPERS
// ===============================================
export const triggerConfetti = () => {
  // Create confetti effect
  try {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = '🎉';
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.fontSize = '20px';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.transition = 'all 3s ease-out';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
          confetti.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`;
          confetti.style.opacity = '0';
        }, 10);
        
        setTimeout(() => {
          document.body.removeChild(confetti);
        }, 3000);
      }, i * 50);
    }
  } catch (error) {
    console.warn('Confetti animation error:', error);
  }
};

export const animateScoreIncrease = (element, newScore, duration = 1000) => {
  if (!element) return;
  
  const startScore = parseInt(element.textContent) || 0;
  const scoreDiff = newScore - startScore;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentScore = Math.floor(startScore + (scoreDiff * easeOut));
    
    element.textContent = formatScore(currentScore);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      element.textContent = formatScore(newScore);
    }
  };
  
  requestAnimationFrame(animate);
};

// ===============================================
// EXPORT ALL UTILITIES
// ===============================================
export default {
  generateRoomCode,
  validateRoomCode,
  calculateQuizScore,
  calculateStreakBonus,
  playQuizSound,
  validateQuestion,
  validateQuiz,
  QUESTION_CATEGORIES,
  PRESET_QUESTIONS,
  createQuizFromPreset,
  shuffleArray,
  formatTime,
  formatScore,
  checkGameRoomExists,
  getGameRoomData,
  triggerConfetti,
  animateScoreIncrease
};