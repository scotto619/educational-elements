// utils/quizShowHelpers.js — QUIZ SHOW ENGINE
// Game modes, power-ups, teams, estimation scoring, minigames + original helpers.
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
// GAME MODES
// ===============================================
export const GAME_MODES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    icon: '⚡',
    tagline: 'Speed scoring, streaks & power-ups',
    description: 'Everyone answers together. Faster correct answers earn more points, streaks build bonuses, and each player gets one-shot power-ups.',
    gradient: 'from-violet-600 to-fuchsia-600',
    color: '#a855f7',
  },
  team: {
    id: 'team',
    name: 'Team Battle',
    icon: '🛡️',
    tagline: 'Squads combine scores for team glory',
    description: 'Players are split into teams. Every point a player scores counts toward their team. Highest team average wins!',
    gradient: 'from-amber-500 to-orange-600',
    color: '#f59e0b',
  },
  elimination: {
    id: 'elimination',
    name: 'Sudden Death',
    icon: '💀',
    tagline: 'One wrong answer and you\'re out!',
    description: 'A wrong (or missed) answer eliminates you — unless your Shield saves you. Eliminated players keep watching as spectators. Last champions standing win.',
    gradient: 'from-rose-600 to-red-700',
    color: '#f43f5e',
  },
  race: {
    id: 'race',
    name: 'Quiz Race',
    icon: '🏁',
    tagline: 'Answer at your own pace — first to finish wins',
    description: 'No waiting between questions! Everyone races through the quiz at their own speed. Finish fast AND accurately — the first three across the line earn big bonuses.',
    gradient: 'from-cyan-500 to-blue-600',
    color: '#06b6d4',
  },
};

export const RACE_FINISH_BONUS = [1000, 600, 300];

// ===============================================
// TEAMS
// ===============================================
export const TEAM_PRESETS = [
  { id: 'comets',   name: 'Crimson Comets',  emoji: '☄️', color: '#ef4444', bg: 'bg-red-500',     soft: 'bg-red-500/15',     border: 'border-red-400' },
  { id: 'sharks',   name: 'Azure Sharks',    emoji: '🦈', color: '#3b82f6', bg: 'bg-blue-500',    soft: 'bg-blue-500/15',    border: 'border-blue-400' },
  { id: 'griffins', name: 'Golden Griffins', emoji: '🦅', color: '#f59e0b', bg: 'bg-amber-500',   soft: 'bg-amber-500/15',   border: 'border-amber-400' },
  { id: 'dragons',  name: 'Emerald Dragons', emoji: '🐉', color: '#10b981', bg: 'bg-emerald-500', soft: 'bg-emerald-500/15', border: 'border-emerald-400' },
];

// Evenly (and randomly) assign a list of playerIds to N teams.
export const buildTeamAssignment = (playerIds, teamCount = 2) => {
  const count = Math.min(Math.max(2, teamCount), TEAM_PRESETS.length);
  const shuffled = shuffleArray(playerIds);
  const teams = {};
  for (let i = 0; i < count; i++) {
    const preset = TEAM_PRESETS[i];
    teams[preset.id] = { ...preset, members: {} };
  }
  const teamIds = Object.keys(teams);
  shuffled.forEach((pid, i) => {
    teams[teamIds[i % teamIds.length]].members[pid] = true;
  });
  return teams;
};

export const getTeamForPlayer = (teams, playerId) => {
  if (!teams || !playerId) return null;
  for (const [teamId, team] of Object.entries(teams)) {
    if (team?.members?.[playerId]) return { teamId, ...team };
  }
  return null;
};

// ===============================================
// POWER-UPS
// ===============================================
export const POWER_UPS = {
  fifty: {
    id: 'fifty',
    name: '50 / 50',
    icon: '✂️',
    description: 'Removes two wrong answers',
    modes: ['classic', 'team', 'elimination', 'race'],
  },
  double: {
    id: 'double',
    name: 'Double Points',
    icon: '💎',
    description: 'Doubles your points this question',
    modes: ['classic', 'team', 'race'],
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    icon: '🛡️',
    description: 'Auto-saves you from one wrong answer',
    modes: ['elimination'],
  },
};

export const getPowerUpsForMode = (mode) =>
  Object.values(POWER_UPS).filter(p => p.modes.includes(mode));

// ===============================================
// EMOJI REACTIONS
// ===============================================
export const REACTION_EMOJIS = ['🔥', '😂', '🤯', '👏', '😱', '💜', '🎉', '🫠'];

// ===============================================
// SPEED-BASED SCORE CALCULATION SYSTEM
// ===============================================
export const calculateQuizScore = (timeSpent, timeLimit, basePoints = 1000, isCorrect = true) => {
  if (!isCorrect) return 0;
  // Speed bonus: full marks for instant answer, minimum 30% at time limit
  const safeTL = Math.max(1, timeLimit);
  const safeTS = Math.min(Math.max(0, timeSpent), safeTL);
  const minPoints = Math.round(basePoints * 0.3);
  const timeRatio = safeTS / safeTL;
  return Math.round(basePoints - (basePoints - minPoints) * timeRatio);
};

export const calculateStreakBonus = (streak) => {
  // Streak bonus: 50 points per question in streak, max 250
  if (streak <= 1) return 0;
  return Math.min(50 * (streak - 1), 250);
};

// Estimation questions: closer guess = more points.
// Full points for exact, 0 points at 50%+ relative error. "Correct" within 25%.
export const calculateEstimationScore = (guess, answer, basePoints = 1000) => {
  const g = Number(guess);
  const a = Number(answer);
  if (!Number.isFinite(g) || !Number.isFinite(a)) {
    return { points: 0, isCorrect: false, error: 1 };
  }
  const denom = Math.max(1, Math.abs(a));
  const error = Math.abs(g - a) / denom;
  const isCorrect = error <= 0.25;
  const points = Math.round(basePoints * Math.max(0, 1 - Math.min(1, error * 2)));
  return { points, isCorrect, error };
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
      'tick': '/sounds/quizshow/tick.mp3',
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
// QUESTION TYPES
// ===============================================
export const QUESTION_TYPES = {
  multiple_choice: { id: 'multiple_choice', name: 'Multiple Choice', icon: '🔤', description: 'Pick the right answer from up to 6 options' },
  true_false:      { id: 'true_false',      name: 'True / False',    icon: '⚖️', description: 'A quick two-option showdown' },
  image:           { id: 'image',           name: 'Picture Question', icon: '🖼️', description: 'Show an image with the question' },
  estimation:      { id: 'estimation',      name: 'Closest Wins',    icon: '🎯', description: 'Guess a number — closest to the answer scores most' },
};

// ===============================================
// QUESTION VALIDATION
// ===============================================
export const validateQuestion = (question) => {
  const errors = [];
  const type = question.type || 'multiple_choice';

  if (!question.question?.trim()) {
    errors.push('Question text is required');
  }

  if (type === 'estimation') {
    if (question.answerValue === undefined || question.answerValue === null || question.answerValue === '' || !Number.isFinite(Number(question.answerValue))) {
      errors.push('A numeric answer is required for Closest Wins questions');
    }
  } else {
    const options = question.options || [];
    if (options.length < 2) {
      errors.push('At least 2 answer options are required');
    }
    if (question.correctAnswer === undefined || question.correctAnswer < 0 || question.correctAnswer >= options.length) {
      errors.push('Valid correct answer must be selected');
    }
    const emptyOptions = options.some(option => !option?.trim());
    if (emptyOptions) {
      errors.push('All answer options must have text');
    }
  }

  if (type === 'image' && !question.media?.url?.trim()) {
    errors.push('Picture questions need an image URL');
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
  },
  animals: {
    name: 'Animals & Nature',
    icon: '🦁',
    color: '#059669',
    description: 'Wildlife, ecosystems, and the natural world'
  },
  health: {
    name: 'Health & Body',
    icon: '🫀',
    color: '#DC2626',
    description: 'Human body, nutrition, and wellbeing'
  }
};

// ===============================================
// PRESET QUESTIONS DATABASE (unchanged)
// ===============================================
export const PRESET_QUESTIONS = {
  mathematics: [
    { id: 'math_1', question: 'What is 7 + 8?', type: 'multiple_choice', options: ['14', '15', '16', '17'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'math_2', question: 'Which number comes next: 2, 4, 6, 8, __?', type: 'multiple_choice', options: ['9', '10', '11', '12'], correctAnswer: 1, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'math_3', question: 'What is 12 × 5?', type: 'multiple_choice', options: ['50', '55', '60', '65'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'math_4', question: 'How many sides does a triangle have?', type: 'multiple_choice', options: ['2', '3', '4', '5'], correctAnswer: 1, timeLimit: 10, difficulty: 'easy', points: 1000 },
    { id: 'math_5', question: 'What is 100 ÷ 4?', type: 'multiple_choice', options: ['20', '25', '30', '35'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'math_6', question: 'What is 9 × 8?', type: 'multiple_choice', options: ['63', '72', '81', '56'], correctAnswer: 1, timeLimit: 15, difficulty: 'medium', points: 1000 },
    { id: 'math_7', question: 'What is 1/2 + 1/4?', type: 'multiple_choice', options: ['2/6', '3/4', '2/4', '1/6'], correctAnswer: 1, timeLimit: 25, difficulty: 'medium', points: 1000 },
    { id: 'math_8', question: 'What is the perimeter of a square with side 5cm?', type: 'multiple_choice', options: ['10cm', '15cm', '20cm', '25cm'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'math_9', question: 'What is 256 ÷ 8?', type: 'multiple_choice', options: ['28', '30', '32', '36'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'math_10', question: 'What is 15% of 200?', type: 'multiple_choice', options: ['20', '25', '30', '35'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'math_11', question: 'What is the area of a rectangle 6m × 4m?', type: 'multiple_choice', options: ['20m²', '22m²', '24m²', '26m²'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'math_12', question: 'What is 7²?', type: 'multiple_choice', options: ['14', '42', '49', '56'], correctAnswer: 2, timeLimit: 15, difficulty: 'medium', points: 1000 },
    { id: 'math_13', question: 'Which is the largest: 3/4, 2/3, 5/6?', type: 'multiple_choice', options: ['3/4', '2/3', '5/6', 'They\'re equal'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'math_14', question: 'What is 0.75 as a percentage?', type: 'multiple_choice', options: ['7.5%', '70%', '75%', '750%'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'math_15', question: 'What is the next prime number after 13?', type: 'multiple_choice', options: ['14', '15', '16', '17'], correctAnswer: 3, timeLimit: 25, difficulty: 'hard', points: 1000 },
  ],

  science: [
    { id: 'sci_1', question: 'How many planets are in our solar system?', type: 'multiple_choice', options: ['7', '8', '9', '10'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'sci_2', question: 'What gas do plants take in during photosynthesis?', type: 'multiple_choice', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'sci_3', question: 'What are the three states of matter?', type: 'multiple_choice', options: ['Hot, Cold, Warm', 'Solid, Liquid, Gas', 'Big, Medium, Small', 'Fast, Medium, Slow'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'sci_4', question: 'Which planet is closest to the Sun?', type: 'multiple_choice', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'sci_5', question: 'What is the chemical symbol for water?', type: 'multiple_choice', options: ['WA', 'H2O', 'HO2', 'OW'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'sci_6', question: 'Which is the largest planet in our solar system?', type: 'multiple_choice', options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'sci_7', question: 'What do we call animals that eat only plants?', type: 'multiple_choice', options: ['Carnivores', 'Omnivores', 'Herbivores', 'Parasites'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'sci_8', question: 'How many legs does an insect have?', type: 'multiple_choice', options: ['4', '6', '8', '10'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'sci_9', question: 'What force pulls objects toward Earth?', type: 'multiple_choice', options: ['Magnetism', 'Gravity', 'Friction', 'Wind'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'sci_10', question: 'What is the process plants use to make food from sunlight?', type: 'multiple_choice', options: ['Respiration', 'Digestion', 'Photosynthesis', 'Germination'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'sci_11', question: 'What is the powerhouse of the cell?', type: 'multiple_choice', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Cell wall'], correctAnswer: 1, timeLimit: 20, difficulty: 'hard', points: 1000 },
    { id: 'sci_12', question: 'What type of energy does the Sun produce?', type: 'multiple_choice', options: ['Nuclear', 'Chemical', 'Light and Heat', 'Electrical'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'sci_13', question: 'Which gas makes up most of Earth\'s atmosphere?', type: 'multiple_choice', options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'], correctAnswer: 2, timeLimit: 20, difficulty: 'hard', points: 1000 },
    { id: 'sci_14', question: 'What do we call the remains of ancient organisms preserved in rock?', type: 'multiple_choice', options: ['Rocks', 'Fossils', 'Crystals', 'Minerals'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'sci_15', question: 'What is the speed of light approximately?', type: 'multiple_choice', options: ['300 km/s', '3,000 km/s', '300,000 km/s', '3,000,000 km/s'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
  ],

  geography: [
    { id: 'geo_1', question: 'What is the capital of Australia?', type: 'multiple_choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'geo_2', question: 'Which continent is the largest?', type: 'multiple_choice', options: ['Africa', 'Asia', 'North America', 'Europe'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_3', question: 'How many continents are there?', type: 'multiple_choice', options: ['5', '6', '7', '8'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_4', question: 'Which ocean is the largest?', type: 'multiple_choice', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correctAnswer: 3, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'geo_5', question: 'What is the longest river in the world?', type: 'multiple_choice', options: ['Amazon', 'Nile', 'Mississippi', 'Yangtze'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'geo_6', question: 'Which country has the most people in the world?', type: 'multiple_choice', options: ['USA', 'India', 'Russia', 'China'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'geo_7', question: 'What is the capital of France?', type: 'multiple_choice', options: ['Lyon', 'Paris', 'Marseille', 'Nice'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_8', question: 'Which is the smallest continent?', type: 'multiple_choice', options: ['Europe', 'Antarctica', 'Australia', 'South America'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'geo_9', question: 'In which country is the Amazon Rainforest mainly located?', type: 'multiple_choice', options: ['Colombia', 'Venezuela', 'Brazil', 'Peru'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'geo_10', question: 'What is the capital of Japan?', type: 'multiple_choice', options: ['Osaka', 'Kyoto', 'Tokyo', 'Hiroshima'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_11', question: 'What is the highest mountain in the world?', type: 'multiple_choice', options: ['K2', 'Kangchenjunga', 'Mount Everest', 'Lhotse'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_12', question: 'On which continent is Egypt located?', type: 'multiple_choice', options: ['Asia', 'Europe', 'Africa', 'Middle East'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_13', question: 'What is the capital of Brazil?', type: 'multiple_choice', options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'geo_14', question: 'Which country is home to the Eiffel Tower?', type: 'multiple_choice', options: ['Italy', 'Germany', 'France', 'Spain'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'geo_15', question: 'Which sea is between Europe and Africa?', type: 'multiple_choice', options: ['Red Sea', 'Caribbean Sea', 'Mediterranean Sea', 'Arabian Sea'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
  ],

  history: [
    { id: 'hist_1', question: 'Who was the first person to walk on the Moon?', type: 'multiple_choice', options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hist_2', question: 'In which year did World War II end?', type: 'multiple_choice', options: ['1943', '1944', '1945', '1946'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hist_3', question: 'Who invented the telephone?', type: 'multiple_choice', options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Marconi'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hist_4', question: 'The ancient pyramids were built in which country?', type: 'multiple_choice', options: ['Iraq', 'Mexico', 'Egypt', 'Greece'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hist_5', question: 'Who painted the Mona Lisa?', type: 'multiple_choice', options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Picasso'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hist_6', question: 'What year did Australia become a federation?', type: 'multiple_choice', options: ['1888', '1895', '1901', '1910'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hist_7', question: 'Which empire was ruled by Julius Caesar?', type: 'multiple_choice', options: ['Greek', 'Roman', 'Byzantine', 'Ottoman'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hist_8', question: 'Who developed the theory of relativity?', type: 'multiple_choice', options: ['Isaac Newton', 'Albert Einstein', 'Charles Darwin', 'Galileo'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hist_9', question: 'In which year did the Berlin Wall fall?', type: 'multiple_choice', options: ['1985', '1987', '1989', '1991'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hist_10', question: 'Who was the first Prime Minister of Australia?', type: 'multiple_choice', options: ['Alfred Deakin', 'Edmund Barton', 'John Curtin', 'Robert Menzies'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hist_11', question: 'What was the name of the ship Charles Darwin sailed on?', type: 'multiple_choice', options: ['HMS Victory', 'HMS Endeavour', 'HMS Beagle', 'HMS Challenger'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hist_12', question: 'The Great Wall of China was mainly built to protect against which group?', type: 'multiple_choice', options: ['Mongols', 'Japanese', 'Romans', 'Persians'], correctAnswer: 0, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hist_13', question: 'Who wrote the play "Romeo and Juliet"?', type: 'multiple_choice', options: ['Charles Dickens', 'Jane Austen', 'William Shakespeare', 'Geoffrey Chaucer'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hist_14', question: 'What event started World War I?', type: 'multiple_choice', options: ['The bombing of Pearl Harbor', 'The assassination of Archduke Franz Ferdinand', 'Germany invading France', 'Russia declaring war'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hist_15', question: 'Which ancient wonder is still standing today?', type: 'multiple_choice', options: ['Hanging Gardens of Babylon', 'Colossus of Rhodes', 'Great Pyramid of Giza', 'Lighthouse of Alexandria'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
  ],

  language: [
    { id: 'lang_1', question: 'What is a word that describes a noun called?', type: 'multiple_choice', options: ['Verb', 'Adverb', 'Adjective', 'Pronoun'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'lang_2', question: 'What punctuation ends a question?', type: 'multiple_choice', options: ['.', '!', '?', ','], correctAnswer: 2, timeLimit: 10, difficulty: 'easy', points: 1000 },
    { id: 'lang_3', question: 'What is a synonym?', type: 'multiple_choice', options: ['A word with opposite meaning', 'A word with similar meaning', 'A word that sounds the same', 'A rhyming word'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'lang_4', question: 'What is the plural of "child"?', type: 'multiple_choice', options: ['Childs', 'Childes', 'Children', 'Childrens'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'lang_5', question: 'Which sentence is in PAST tense?', type: 'multiple_choice', options: ['I am running', 'I will run', 'I ran', 'I run'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'lang_6', question: 'What word class is "quickly" in the sentence "She ran quickly"?', type: 'multiple_choice', options: ['Noun', 'Verb', 'Adjective', 'Adverb'], correctAnswer: 3, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'lang_7', question: 'What is an antonym?', type: 'multiple_choice', options: ['A word with similar meaning', 'A word with opposite meaning', 'A made-up word', 'A very long word'], correctAnswer: 1, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'lang_8', question: 'In the sentence "The cat sat on the mat", what is "on" an example of?', type: 'multiple_choice', options: ['Conjunction', 'Preposition', 'Pronoun', 'Adverb'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'lang_9', question: 'What is a metaphor?', type: 'multiple_choice', options: ['Comparing using "like" or "as"', 'A direct comparison without "like" or "as"', 'A type of poem', 'An exaggeration'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'lang_10', question: 'Which word is spelled correctly?', type: 'multiple_choice', options: ['Recieve', 'Beleive', 'Achieve', 'Releive'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'lang_11', question: 'What is the collective noun for a group of wolves?', type: 'multiple_choice', options: ['A herd', 'A flock', 'A pack', 'A swarm'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'lang_12', question: 'What figure of speech is: "The thunder roared angrily"?', type: 'multiple_choice', options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'lang_13', question: 'What is a homophone?', type: 'multiple_choice', options: ['A word with the same spelling but different meaning', 'A word that sounds the same but has different spelling/meaning', 'A word from another language', 'A very old word'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'lang_14', question: 'What do we call the main idea of a text?', type: 'multiple_choice', options: ['Theme', 'Plot', 'Setting', 'Character'], correctAnswer: 0, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'lang_15', question: 'Which of these is NOT a conjunction?', type: 'multiple_choice', options: ['and', 'but', 'because', 'quickly'], correctAnswer: 3, timeLimit: 20, difficulty: 'medium', points: 1000 },
  ],

  general: [
    { id: 'gen_1', question: 'How many colours are in a rainbow?', type: 'multiple_choice', options: ['5', '6', '7', '8'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_2', question: 'What is the hardest natural substance on Earth?', type: 'multiple_choice', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'gen_3', question: 'How many hours are in a day?', type: 'multiple_choice', options: ['12', '20', '24', '36'], correctAnswer: 2, timeLimit: 10, difficulty: 'easy', points: 1000 },
    { id: 'gen_4', question: 'Which sport uses a bat and a ball and has wickets?', type: 'multiple_choice', options: ['Baseball', 'Softball', 'Cricket', 'Rounders'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_5', question: 'What does "LOL" stand for in texting?', type: 'multiple_choice', options: ['Lots of Love', 'Laugh Out Loud', 'Lots of Luck', 'Loads of Laughs'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_6', question: 'How many sides does a hexagon have?', type: 'multiple_choice', options: ['5', '6', '7', '8'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_7', question: 'What is the most spoken language in the world?', type: 'multiple_choice', options: ['Spanish', 'English', 'Hindi', 'Mandarin Chinese'], correctAnswer: 3, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'gen_8', question: 'Which country invented pizza?', type: 'multiple_choice', options: ['Greece', 'Spain', 'Italy', 'France'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_9', question: 'How many Olympic rings are there?', type: 'multiple_choice', options: ['4', '5', '6', '7'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_10', question: 'Who wrote "Harry Potter"?', type: 'multiple_choice', options: ['Roald Dahl', 'J.K. Rowling', 'C.S. Lewis', 'Tolkien'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_11', question: 'What is the currency of the United Kingdom?', type: 'multiple_choice', options: ['Euro', 'Dollar', 'Pound', 'Franc'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'gen_12', question: 'In which city are the headquarters of the United Nations?', type: 'multiple_choice', options: ['Washington D.C.', 'Geneva', 'New York', 'London'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'gen_13', question: 'How many strings does a standard violin have?', type: 'multiple_choice', options: ['3', '4', '5', '6'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'gen_14', question: 'What is the name of the longest bone in the human body?', type: 'multiple_choice', options: ['Tibia', 'Spine', 'Femur', 'Humerus'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'gen_15', question: 'Which planet is known as the "Red Planet"?', type: 'multiple_choice', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
  ],

  animals: [
    { id: 'anim_1', question: 'What is the largest land animal?', type: 'multiple_choice', options: ['Hippo', 'Rhino', 'African Elephant', 'Giraffe'], correctAnswer: 2, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'anim_2', question: 'How many legs does a spider have?', type: 'multiple_choice', options: ['6', '8', '10', '12'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'anim_3', question: 'What is a baby kangaroo called?', type: 'multiple_choice', options: ['Pup', 'Cub', 'Joey', 'Kitten'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'anim_4', question: 'Which bird is the symbol of Australia?', type: 'multiple_choice', options: ['Parrot', 'Emu', 'Kookaburra', 'Cockatoo'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'anim_5', question: 'How many hearts does an octopus have?', type: 'multiple_choice', options: ['1', '2', '3', '4'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'anim_6', question: 'What is the fastest land animal?', type: 'multiple_choice', options: ['Lion', 'Cheetah', 'Greyhound', 'Horse'], correctAnswer: 1, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'anim_7', question: 'What is a group of fish called?', type: 'multiple_choice', options: ['A herd', 'A flock', 'A school', 'A pack'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'anim_8', question: 'Which mammal can fly?', type: 'multiple_choice', options: ['Flying squirrel', 'Bat', 'Sugar glider', 'Lemur'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'anim_9', question: 'How long is a crocodile\'s gestation (egg incubation) period?', type: 'multiple_choice', options: ['1 month', '3 months', '6 months', '9 months'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'anim_10', question: 'What is the only continent with no native snakes?', type: 'multiple_choice', options: ['Antarctica', 'Greenland', 'Iceland', 'New Zealand'], correctAnswer: 0, timeLimit: 25, difficulty: 'hard', points: 1000 },
  ],

  health: [
    { id: 'hlth_1', question: 'How many glasses of water should you drink per day?', type: 'multiple_choice', options: ['2-4', '4-6', '6-8', '10-12'], correctAnswer: 2, timeLimit: 20, difficulty: 'easy', points: 1000 },
    { id: 'hlth_2', question: 'Which vitamin do we get from sunlight?', type: 'multiple_choice', options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'], correctAnswer: 3, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hlth_3', question: 'How many chambers does the human heart have?', type: 'multiple_choice', options: ['2', '3', '4', '5'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hlth_4', question: 'Which food group provides the most energy?', type: 'multiple_choice', options: ['Proteins', 'Fats', 'Carbohydrates', 'Vitamins'], correctAnswer: 2, timeLimit: 25, difficulty: 'medium', points: 1000 },
    { id: 'hlth_5', question: 'How many bones are in the adult human body?', type: 'multiple_choice', options: ['106', '156', '206', '256'], correctAnswer: 2, timeLimit: 25, difficulty: 'hard', points: 1000 },
    { id: 'hlth_6', question: 'What organ filters waste from the blood?', type: 'multiple_choice', options: ['Liver', 'Lungs', 'Kidneys', 'Spleen'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hlth_7', question: 'How often should you brush your teeth?', type: 'multiple_choice', options: ['Once a day', 'Twice a day', 'Three times a day', 'Once a week'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hlth_8', question: 'What does the skeleton do?', type: 'multiple_choice', options: ['Makes blood', 'Supports and protects the body', 'Digests food', 'Breathes oxygen'], correctAnswer: 1, timeLimit: 15, difficulty: 'easy', points: 1000 },
    { id: 'hlth_9', question: 'Which nutrient builds and repairs muscles?', type: 'multiple_choice', options: ['Carbohydrates', 'Fat', 'Protein', 'Fibre'], correctAnswer: 2, timeLimit: 20, difficulty: 'medium', points: 1000 },
    { id: 'hlth_10', question: 'What is the average resting heart rate for an adult?', type: 'multiple_choice', options: ['40-50 bpm', '60-100 bpm', '100-120 bpm', '120-140 bpm'], correctAnswer: 1, timeLimit: 25, difficulty: 'hard', points: 1000 },
  ],
};

// ===============================================
// GAME LOGIC HELPERS
// ===============================================
export const createQuizFromPreset = (category, questionCount = 10) => {
  const categoryQuestions = PRESET_QUESTIONS[category] || [];
  if (categoryQuestions.length === 0) {
    throw new Error(`No preset questions available for category: ${category}`);
  }

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

export const sanitizeQuizForGame = (quiz) => {
  if (!quiz) return null;

  const safeQuestions = (quiz.questions || [])
    .filter((question) => question && typeof question === 'object')
    .map((question, index) => {
      const type = QUESTION_TYPES[question.type] ? question.type : 'multiple_choice';
      const rawQuestion = typeof question.question === 'string' ? question.question.trim() : '';
      if (!rawQuestion) return null;

      const rawTimeLimit = Number.parseInt(question.timeLimit, 10);
      const fallbackTime = Number.parseInt(quiz.settings?.timePerQuestion ?? quiz.defaultTimeLimit ?? 20, 10) || 20;
      const timeLimit = Math.min(Math.max(Number.isFinite(rawTimeLimit) ? rawTimeLimit : fallbackTime, 5), 300);

      const rawPoints = Number.parseInt(question.points, 10);
      const points = Number.isFinite(rawPoints) ? rawPoints : 1000;

      const media = question.media?.url
        ? { type: question.media.type || 'image', url: String(question.media.url) }
        : null;

      // Estimation ("Closest Wins") questions carry a numeric answer instead of options
      if (type === 'estimation') {
        const answerValue = Number(question.answerValue);
        if (!Number.isFinite(answerValue)) return null;
        return {
          id: question.id || `q_${index}`,
          question: rawQuestion,
          type,
          options: [],
          answerValue,
          unit: typeof question.unit === 'string' ? question.unit : '',
          correctAnswer: 0,
          timeLimit,
          points,
          media,
        };
      }

      const options = Array.isArray(question.options)
        ? question.options.map((option) => (typeof option === 'string' ? option : '')).filter(Boolean)
        : [];
      if (options.length < 2) return null;

      const numericAnswer = Number.parseInt(question.correctAnswer, 10);
      const safeCorrectAnswer = Number.isInteger(numericAnswer) && numericAnswer >= 0 && numericAnswer < options.length
        ? numericAnswer
        : 0;

      return {
        id: question.id || `q_${index}`,
        question: rawQuestion,
        type,
        options,
        correctAnswer: safeCorrectAnswer,
        timeLimit,
        points,
        media,
      };
    })
    .filter(Boolean);

  if (safeQuestions.length === 0) {
    return null;
  }

  const baseTimePerQuestion = Number.parseInt(
    quiz.settings?.timePerQuestion ?? quiz.defaultTimeLimit ?? 20,
    10
  ) || 20;

  const clampedTimePerQuestion = Math.min(Math.max(baseTimePerQuestion, 5), 300);

  return {
    id: quiz.id || `quiz_${Date.now()}`,
    title: (quiz.title || 'Untitled Quiz').trim(),
    description: (quiz.description || '').trim(),
    category: quiz.category || 'general',
    isPreset: Boolean(quiz.isPreset),
    questions: safeQuestions,
    settings: {
      showLeaderboard: quiz.settings?.showLeaderboard ?? true,
      allowLateJoin: quiz.settings?.allowLateJoin ?? false,
      timePerQuestion: clampedTimePerQuestion,
      showCorrectAnswers: quiz.settings?.showCorrectAnswers ?? true,
      allowRetakes: quiz.settings?.allowRetakes ?? false,
      shuffleQuestions: quiz.settings?.shuffleQuestions ?? false,
      shuffleAnswers: quiz.settings?.shuffleAnswers ?? true,
    },
    createdAt: quiz.createdAt || Date.now(),
    updatedAt: Date.now(),
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
  return score.toString();
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
// LEADERBOARD CALCULATION
// Handles bonus points (minigames), race finish bonuses,
// team info, eliminations and streaks.
// ===============================================
export const calculateFinalLeaderboard = (gameData) => {
  if (!gameData?.players) return [];

  const responses = gameData.responses || {};
  const bonusPoints = gameData.bonusPoints || {};
  const mode = gameData.mode || 'classic';

  // Race finishing bonuses — deterministic from raceProgress, no extra writes needed
  const raceBonusByPlayer = {};
  if (mode === 'race' && gameData.raceProgress) {
    Object.entries(gameData.raceProgress)
      .filter(([, p]) => p?.finished && p?.finishedAt)
      .sort((a, b) => a[1].finishedAt - b[1].finishedAt)
      .forEach(([pid], i) => {
        raceBonusByPlayer[pid] = RACE_FINISH_BONUS[i] || 0;
      });
  }

  const results = Object.entries(gameData.players).map(([playerId, player]) => {
    let totalScore = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let totalAnswered = 0;
    let bestStreak = 0;

    Object.values(responses).forEach((questionResponses) => {
      const response = questionResponses?.[playerId];
      if (response && response.points !== undefined) {
        totalScore += response.points;
        totalAnswered++;
        if (response.isCorrect) {
          correctAnswers++;
        } else {
          incorrectAnswers++;
        }
        if ((response.streak || 0) > bestStreak) bestStreak = response.streak || 0;
      }
    });

    const bonus = (bonusPoints[playerId] || 0) + (raceBonusByPlayer[playerId] || 0);
    totalScore += bonus;

    const totalQuestions = gameData.quiz?.questions?.length || 0;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

    const team = getTeamForPlayer(gameData.teams, playerId);
    const eliminatedInfo = gameData.eliminated?.[playerId] || null;

    return {
      playerId,
      name: player.name,
      avatar: player.avatar,
      studentId: player.studentId,
      totalScore,
      bonusPoints: bonus,
      raceBonus: raceBonusByPlayer[playerId] || 0,
      correctAnswers,
      incorrectAnswers,
      totalAnswered,
      totalQuestions,
      accuracy,
      bestStreak,
      teamId: team?.teamId || null,
      teamName: team?.name || null,
      teamEmoji: team?.emoji || null,
      teamColor: team?.color || null,
      eliminated: Boolean(eliminatedInfo),
      eliminatedAtQuestion: eliminatedInfo?.questionIndex ?? null,
      finishedRaceAt: gameData.raceProgress?.[playerId]?.finishedAt || null,
    };
  });

  if (mode === 'elimination') {
    // Survivors first (by score); among eliminated, surviving longer ranks higher
    results.sort((a, b) => {
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      if (a.eliminated && b.eliminated) {
        const aq = a.eliminatedAtQuestion ?? -1;
        const bq = b.eliminatedAtQuestion ?? -1;
        if (bq !== aq) return bq - aq;
      }
      return b.totalScore - a.totalScore;
    });
  } else {
    results.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.correctAnswers - a.correctAnswers;
    });
  }

  return results;
};

// Aggregate player results into a team leaderboard (uses average score so
// uneven team sizes stay fair). Returns a sorted array of team entries.
export const calculateTeamLeaderboard = (gameData) => {
  if (!gameData?.teams) return [];
  const playerResults = calculateFinalLeaderboard(gameData);

  const teams = Object.entries(gameData.teams).map(([teamId, team]) => {
    const members = playerResults.filter(p => p.teamId === teamId);
    const totalScore = members.reduce((s, m) => s + m.totalScore, 0);
    const avgScore = members.length ? Math.round(totalScore / members.length) : 0;
    const correct = members.reduce((s, m) => s + m.correctAnswers, 0);
    return {
      teamId,
      name: team.name,
      emoji: team.emoji,
      color: team.color,
      bg: team.bg,
      memberCount: members.length,
      members,
      totalScore,
      avgScore,
      correctAnswers: correct,
    };
  });

  teams.sort((a, b) => b.avgScore - a.avgScore || b.totalScore - a.totalScore);
  return teams;
};

// ===============================================
// ANIMATION & EFFECTS HELPERS
// ===============================================
export const triggerConfetti = () => {
  try {
    const pieces = ['🎉', '✨', '🎊', '⭐', '💜'];

    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = pieces[Math.floor(Math.random() * pieces.length)];
        confetti.style.position = 'fixed';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.fontSize = 14 + Math.random() * 14 + 'px';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.transition = 'all 3s ease-out';

        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`;
          confetti.style.opacity = '0';
        }, 10);

        setTimeout(() => {
          if (confetti.parentNode) document.body.removeChild(confetti);
        }, 3100);
      }, i * 40);
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
  GAME_MODES,
  TEAM_PRESETS,
  POWER_UPS,
  QUESTION_TYPES,
  REACTION_EMOJIS,
  RACE_FINISH_BONUS,
  buildTeamAssignment,
  getTeamForPlayer,
  getPowerUpsForMode,
  calculateQuizScore,
  calculateStreakBonus,
  calculateEstimationScore,
  playQuizSound,
  validateQuestion,
  validateQuiz,
  QUESTION_CATEGORIES,
  PRESET_QUESTIONS,
  createQuizFromPreset,
  sanitizeQuizForGame,
  shuffleArray,
  formatTime,
  formatScore,
  checkGameRoomExists,
  getGameRoomData,
  calculateFinalLeaderboard,
  calculateTeamLeaderboard,
  triggerConfetti,
  animateScoreIncrease
};
