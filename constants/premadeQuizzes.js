// constants/premadeQuizzes.js - Large library of premade quiz sets for the Quiz Show

export const PREMADE_QUIZZES = [
  // ============================================================
  // 1. SOLAR SYSTEM EXPLORER
  // ============================================================
  {
    id: 'premade_solar_system',
    title: 'Solar System Explorer',
    description: 'Journey through space and test your knowledge of planets, moons, and stars!',
    category: 'science',
    emoji: '🌌',
    difficulty: 'medium',
    gradeLevel: '3-6',
    questions: [
      { id: 'ss_1', question: 'Which planet is closest to the Sun?', type: 'multiple_choice', options: ['Venus', 'Mercury', 'Earth', 'Mars'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ss_2', question: 'How many planets are in our solar system?', type: 'multiple_choice', options: ['7', '8', '9', '10'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'ss_3', question: 'Which is the largest planet in our solar system?', type: 'multiple_choice', options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ss_4', question: 'Which planet is known as the "Red Planet"?', type: 'multiple_choice', options: ['Venus', 'Jupiter', 'Mars', 'Saturn'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ss_5', question: 'What is the name of Earth\'s natural satellite?', type: 'multiple_choice', options: ['Europa', 'The Moon', 'Titan', 'Phobos'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'ss_6', question: 'Which planet has the most moons?', type: 'multiple_choice', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'ss_7', question: 'What is the closest star to Earth?', type: 'multiple_choice', options: ['Alpha Centauri', 'The Sun', 'Sirius', 'Betelgeuse'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ss_8', question: 'Which planet spins on its side?', type: 'multiple_choice', options: ['Neptune', 'Saturn', 'Uranus', 'Venus'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'ss_9', question: 'What is an asteroid belt?', type: 'multiple_choice', options: ['A ring around Saturn', 'A region with many asteroids between Mars and Jupiter', 'A type of comet', 'A galaxy far away'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'ss_10', question: 'Which planet has famous rings visible from Earth?', type: 'multiple_choice', options: ['Jupiter', 'Uranus', 'Saturn', 'Neptune'], correctAnswer: 2, timeLimit: 15, points: 1000 },
    ]
  },

  // ============================================================
  // 2. AMAZING ANIMALS
  // ============================================================
  {
    id: 'premade_amazing_animals',
    title: 'Amazing Animals',
    description: 'From the depths of the ocean to the top of the mountains — how well do you know the animal kingdom?',
    category: 'science',
    emoji: '🦁',
    difficulty: 'easy',
    gradeLevel: '2-5',
    questions: [
      { id: 'aa_1', question: 'What is the largest animal on Earth?', type: 'multiple_choice', options: ['African Elephant', 'Blue Whale', 'Giant Squid', 'Giraffe'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'aa_2', question: 'Which animal is known as the "King of the Jungle"?', type: 'multiple_choice', options: ['Tiger', 'Elephant', 'Lion', 'Gorilla'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'aa_3', question: 'How many legs does a spider have?', type: 'multiple_choice', options: ['6', '8', '10', '12'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'aa_4', question: 'What do we call animals that eat only plants?', type: 'multiple_choice', options: ['Carnivores', 'Omnivores', 'Herbivores', 'Insectivores'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'aa_5', question: 'Which bird cannot fly?', type: 'multiple_choice', options: ['Eagle', 'Penguin', 'Sparrow', 'Parrot'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'aa_6', question: 'What is a baby kangaroo called?', type: 'multiple_choice', options: ['Pup', 'Cub', 'Joey', 'Kitten'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'aa_7', question: 'Which animal has the longest neck?', type: 'multiple_choice', options: ['Camel', 'Ostrich', 'Giraffe', 'Flamingo'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'aa_8', question: 'How many hearts does an octopus have?', type: 'multiple_choice', options: ['1', '2', '3', '4'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'aa_9', question: 'Which is the fastest land animal?', type: 'multiple_choice', options: ['Lion', 'Cheetah', 'Greyhound', 'Horse'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'aa_10', question: 'What type of animal is a dolphin?', type: 'multiple_choice', options: ['Fish', 'Reptile', 'Mammal', 'Amphibian'], correctAnswer: 2, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 3. MATHS MASTERS: TIMES TABLES
  // ============================================================
  {
    id: 'premade_times_tables',
    title: 'Maths Masters: Times Tables',
    description: 'Put your multiplication skills to the test! Race against the clock!',
    category: 'mathematics',
    emoji: '✖️',
    difficulty: 'medium',
    gradeLevel: '3-6',
    questions: [
      { id: 'tt_1', question: 'What is 7 × 8?', type: 'multiple_choice', options: ['54', '56', '58', '63'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'tt_2', question: 'What is 9 × 6?', type: 'multiple_choice', options: ['45', '48', '54', '56'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'tt_3', question: 'What is 12 × 7?', type: 'multiple_choice', options: ['74', '82', '84', '96'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'tt_4', question: 'What is 8 × 8?', type: 'multiple_choice', options: ['56', '60', '64', '72'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'tt_5', question: 'What is 11 × 6?', type: 'multiple_choice', options: ['62', '66', '68', '72'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'tt_6', question: 'What is 4 × 9?', type: 'multiple_choice', options: ['32', '36', '40', '44'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'tt_7', question: 'What is 7 × 7?', type: 'multiple_choice', options: ['42', '47', '49', '56'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'tt_8', question: 'What is 6 × 8?', type: 'multiple_choice', options: ['42', '46', '48', '54'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'tt_9', question: 'What is 9 × 9?', type: 'multiple_choice', options: ['72', '81', '90', '99'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'tt_10', question: 'What is 12 × 12?', type: 'multiple_choice', options: ['120', '132', '144', '156'], correctAnswer: 2, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 4. WORLD CAPITALS CHALLENGE
  // ============================================================
  {
    id: 'premade_world_capitals',
    title: 'World Capitals Challenge',
    description: 'Test your knowledge of capital cities from around the globe!',
    category: 'geography',
    emoji: '🗺️',
    difficulty: 'hard',
    gradeLevel: '4-7',
    questions: [
      { id: 'wc_1', question: 'What is the capital of Australia?', type: 'multiple_choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'wc_2', question: 'What is the capital of France?', type: 'multiple_choice', options: ['Lyon', 'Paris', 'Marseille', 'Nice'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'wc_3', question: 'What is the capital of Japan?', type: 'multiple_choice', options: ['Osaka', 'Kyoto', 'Tokyo', 'Hiroshima'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'wc_4', question: 'What is the capital of Brazil?', type: 'multiple_choice', options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'wc_5', question: 'What is the capital of Canada?', type: 'multiple_choice', options: ['Toronto', 'Vancouver', 'Montreal', 'Ottawa'], correctAnswer: 3, timeLimit: 25, points: 1000 },
      { id: 'wc_6', question: 'What is the capital of the United States?', type: 'multiple_choice', options: ['New York', 'Los Angeles', 'Washington D.C.', 'Chicago'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'wc_7', question: 'What is the capital of Egypt?', type: 'multiple_choice', options: ['Alexandria', 'Cairo', 'Luxor', 'Giza'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'wc_8', question: 'What is the capital of China?', type: 'multiple_choice', options: ['Shanghai', 'Hong Kong', 'Beijing', 'Guangzhou'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'wc_9', question: 'What is the capital of India?', type: 'multiple_choice', options: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'wc_10', question: 'What is the capital of Germany?', type: 'multiple_choice', options: ['Munich', 'Hamburg', 'Frankfurt', 'Berlin'], correctAnswer: 3, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 5. HUMAN BODY EXPLORER
  // ============================================================
  {
    id: 'premade_human_body',
    title: 'Human Body Explorer',
    description: 'Discover the amazing science of the human body!',
    category: 'science',
    emoji: '🫀',
    difficulty: 'medium',
    gradeLevel: '3-6',
    questions: [
      { id: 'hb_1', question: 'How many bones are in the adult human body?', type: 'multiple_choice', options: ['106', '156', '206', '256'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'hb_2', question: 'What organ pumps blood around the body?', type: 'multiple_choice', options: ['Lungs', 'Brain', 'Heart', 'Liver'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'hb_3', question: 'How many chambers does the human heart have?', type: 'multiple_choice', options: ['2', '3', '4', '5'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'hb_4', question: 'What is the largest organ in the human body?', type: 'multiple_choice', options: ['Brain', 'Liver', 'Skin', 'Lungs'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'hb_5', question: 'What do red blood cells carry around the body?', type: 'multiple_choice', options: ['Nutrients', 'Oxygen', 'Water', 'Carbon dioxide'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'hb_6', question: 'Which part of the body controls thinking and memory?', type: 'multiple_choice', options: ['Heart', 'Spine', 'Brain', 'Lungs'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'hb_7', question: 'What is the smallest bone in the human body?', type: 'multiple_choice', options: ['Patella', 'Stirrup (in the ear)', 'Coccyx', 'Finger bone'], correctAnswer: 1, timeLimit: 30, points: 1000 },
      { id: 'hb_8', question: 'How long is the small intestine in an adult?', type: 'multiple_choice', options: ['About 1 metre', 'About 3 metres', 'About 6 metres', 'About 10 metres'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'hb_9', question: 'What liquid do the kidneys filter?', type: 'multiple_choice', options: ['Blood', 'Water', 'Digestive juice', 'Lymph'], correctAnswer: 0, timeLimit: 20, points: 1000 },
      { id: 'hb_10', question: 'Approximately how many muscles are in the human body?', type: 'multiple_choice', options: ['200', '400', '600', '800'], correctAnswer: 2, timeLimit: 25, points: 1000 },
    ]
  },

  // ============================================================
  // 6. GRAMMAR CHAMPIONS
  // ============================================================
  {
    id: 'premade_grammar_champions',
    title: 'Grammar Champions',
    description: 'Show your mastery of English grammar — nouns, verbs, adjectives, and more!',
    category: 'language',
    emoji: '📝',
    difficulty: 'medium',
    gradeLevel: '3-6',
    questions: [
      { id: 'gr_1', question: 'Which word is a NOUN in the sentence "The dog ran fast"?', type: 'multiple_choice', options: ['ran', 'fast', 'The', 'dog'], correctAnswer: 3, timeLimit: 20, points: 1000 },
      { id: 'gr_2', question: 'Which word is a VERB in "She sang a beautiful song"?', type: 'multiple_choice', options: ['She', 'sang', 'beautiful', 'song'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'gr_3', question: 'What is an adjective?', type: 'multiple_choice', options: ['A word that describes a verb', 'A word that describes a noun', 'A word that replaces a noun', 'A joining word'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'gr_4', question: 'Which sentence is written in PAST tense?', type: 'multiple_choice', options: ['I am running', 'I will run', 'I ran', 'I run'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'gr_5', question: 'What is the plural of "child"?', type: 'multiple_choice', options: ['Childs', 'Childes', 'Children', 'Childrens'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'gr_6', question: 'Which punctuation mark ends an exclamatory sentence?', type: 'multiple_choice', options: ['.', '?', '!', ','], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'gr_7', question: 'What word connects two clauses in "I was tired, but I kept going"?', type: 'multiple_choice', options: ['I', 'tired', 'but', 'going'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'gr_8', question: 'Which is a PRONOUN?', type: 'multiple_choice', options: ['quickly', 'they', 'running', 'happy'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'gr_9', question: 'What is a synonym?', type: 'multiple_choice', options: ['A word with opposite meaning', 'A word that sounds the same', 'A word with similar meaning', 'A made-up word'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'gr_10', question: 'Which word is an ADVERB in "She spoke quietly"?', type: 'multiple_choice', options: ['She', 'spoke', 'quietly', 'None'], correctAnswer: 2, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 7. ANCIENT EGYPT UNCOVERED
  // ============================================================
  {
    id: 'premade_ancient_egypt',
    title: 'Ancient Egypt Uncovered',
    description: 'Travel back 3,000 years to the land of pharaohs, pyramids, and hieroglyphs!',
    category: 'history',
    emoji: '🏛️',
    difficulty: 'medium',
    gradeLevel: '4-7',
    questions: [
      { id: 'ae_1', question: 'What were the giant tombs of ancient Egyptian rulers called?', type: 'multiple_choice', options: ['Temples', 'Pyramids', 'Obelisks', 'Sphinxes'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'ae_2', question: 'What river runs through Egypt?', type: 'multiple_choice', options: ['Amazon', 'Congo', 'Nile', 'Ganges'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ae_3', question: 'What were ancient Egyptian rulers called?', type: 'multiple_choice', options: ['Kings', 'Pharaohs', 'Sultans', 'Emperors'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'ae_4', question: 'What writing system did ancient Egyptians use?', type: 'multiple_choice', options: ['Cuneiform', 'Latin', 'Hieroglyphics', 'Sanskrit'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ae_5', question: 'What is the process of preserving a body called in ancient Egypt?', type: 'multiple_choice', options: ['Embalming', 'Mummification', 'Preservation', 'Drying'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ae_6', question: 'Who was the Egyptian god of the sun?', type: 'multiple_choice', options: ['Osiris', 'Anubis', 'Ra', 'Horus'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ae_7', question: 'What was the stone that helped decode hieroglyphics called?', type: 'multiple_choice', options: ['Cairo Stone', 'Rosetta Stone', 'Memphis Tablet', 'Alexandria Slab'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'ae_8', question: 'What animal head does the god Anubis have?', type: 'multiple_choice', options: ['Cat', 'Jackal', 'Falcon', 'Crocodile'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ae_9', question: 'Where is the Great Sphinx of Giza located?', type: 'multiple_choice', options: ['Luxor', 'Alexandria', 'Cairo', 'Giza Plateau'], correctAnswer: 3, timeLimit: 20, points: 1000 },
      { id: 'ae_10', question: 'Which female pharaoh was one of the most powerful in ancient Egypt?', type: 'multiple_choice', options: ['Nefertiti', 'Cleopatra', 'Hatshepsut', 'Isis'], correctAnswer: 2, timeLimit: 25, points: 1000 },
    ]
  },

  // ============================================================
  // 8. FRACTIONS & DECIMALS
  // ============================================================
  {
    id: 'premade_fractions_decimals',
    title: 'Fractions & Decimals',
    description: 'Master fractions and decimals with these tricky number challenges!',
    category: 'mathematics',
    emoji: '🔢',
    difficulty: 'medium',
    gradeLevel: '4-7',
    questions: [
      { id: 'fd_1', question: 'What is 1/2 + 1/4?', type: 'multiple_choice', options: ['2/6', '3/4', '2/4', '1/6'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'fd_2', question: 'What is 0.5 as a fraction?', type: 'multiple_choice', options: ['1/4', '1/3', '1/2', '1/5'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'fd_3', question: 'Which fraction is largest: 1/2, 1/3, 1/4, or 1/5?', type: 'multiple_choice', options: ['1/3', '1/4', '1/5', '1/2'], correctAnswer: 3, timeLimit: 20, points: 1000 },
      { id: 'fd_4', question: 'What is 3/4 as a decimal?', type: 'multiple_choice', options: ['0.34', '0.43', '0.75', '0.73'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'fd_5', question: 'What is 2/5 + 1/5?', type: 'multiple_choice', options: ['3/10', '3/25', '3/5', '2/5'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'fd_6', question: 'What is 1.25 as a fraction?', type: 'multiple_choice', options: ['1/4', '5/4', '4/5', '12/5'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'fd_7', question: 'What is 3/4 of 40?', type: 'multiple_choice', options: ['25', '28', '30', '35'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'fd_8', question: 'Which decimal is equal to 25%?', type: 'multiple_choice', options: ['0.025', '0.25', '2.5', '25.0'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'fd_9', question: 'What is 2/3 × 3?', type: 'multiple_choice', options: ['2/9', '6/9', '2', '3/2'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'fd_10', question: 'Simplify 8/12', type: 'multiple_choice', options: ['4/6', '2/3', '3/4', '1/2'], correctAnswer: 1, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 9. RAINFORESTS & ECOSYSTEMS
  // ============================================================
  {
    id: 'premade_rainforests',
    title: 'Rainforests & Ecosystems',
    description: 'Explore the wonders of rainforests and learn about Earth\'s most biodiverse habitats!',
    category: 'science',
    emoji: '🌿',
    difficulty: 'medium',
    gradeLevel: '3-6',
    questions: [
      { id: 'rf_1', question: 'Which is the largest rainforest in the world?', type: 'multiple_choice', options: ['Congo Rainforest', 'Amazon Rainforest', 'Daintree Rainforest', 'Borneo Rainforest'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'rf_2', question: 'What gas do trees release that humans breathe?', type: 'multiple_choice', options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'rf_3', question: 'What is the process by which plants make their own food called?', type: 'multiple_choice', options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Germination'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'rf_4', question: 'Which layer of the rainforest gets the most sunlight?', type: 'multiple_choice', options: ['Forest floor', 'Understory', 'Canopy', 'Emergent layer'], correctAnswer: 3, timeLimit: 20, points: 1000 },
      { id: 'rf_5', question: 'What is a food chain?', type: 'multiple_choice', options: ['A chain of restaurants', 'The order in which organisms eat each other', 'A type of plant', 'A way to cook food'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'rf_6', question: 'What do we call animals that eat both plants and animals?', type: 'multiple_choice', options: ['Herbivores', 'Carnivores', 'Omnivores', 'Decomposers'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'rf_7', question: 'Why are rainforests important for Earth\'s climate?', type: 'multiple_choice', options: ['They make it rain everywhere', 'They absorb carbon dioxide and produce oxygen', 'They cool the oceans', 'They create wind'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'rf_8', question: 'What is the main threat to rainforests today?', type: 'multiple_choice', options: ['Floods', 'Deforestation', 'Volcanoes', 'Tsunamis'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'rf_9', question: 'What is biodiversity?', type: 'multiple_choice', options: ['A type of biology test', 'The variety of life in a habitat', 'A way to classify animals', 'A scientific instrument'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'rf_10', question: 'Which continent has the Daintree Rainforest?', type: 'multiple_choice', options: ['Africa', 'South America', 'Asia', 'Australia'], correctAnswer: 3, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 10. SPORTS WORLD TRIVIA
  // ============================================================
  {
    id: 'premade_sports_trivia',
    title: 'Sports World Trivia',
    description: 'Are you a sports superstar? Test your knowledge of sports from around the world!',
    category: 'general',
    emoji: '⚽',
    difficulty: 'easy',
    gradeLevel: '2-6',
    questions: [
      { id: 'sp_1', question: 'How many players are on a soccer (football) team on the field?', type: 'multiple_choice', options: ['9', '10', '11', '12'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'sp_2', question: 'In which sport do you use a racket and a shuttlecock?', type: 'multiple_choice', options: ['Tennis', 'Squash', 'Badminton', 'Ping Pong'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'sp_3', question: 'How many rings are on the Olympic flag?', type: 'multiple_choice', options: ['4', '5', '6', '7'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'sp_4', question: 'In swimming, what stroke is the fastest?', type: 'multiple_choice', options: ['Backstroke', 'Breaststroke', 'Butterfly', 'Freestyle'], correctAnswer: 3, timeLimit: 20, points: 1000 },
      { id: 'sp_5', question: 'What sport is played at Wimbledon?', type: 'multiple_choice', options: ['Golf', 'Tennis', 'Cricket', 'Badminton'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'sp_6', question: 'How many points is a try worth in Australian Rules Football?', type: 'multiple_choice', options: ['4', '5', '6', '7'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'sp_7', question: 'In which sport could you score a "birdie"?', type: 'multiple_choice', options: ['Tennis', 'Badminton', 'Golf', 'Cricket'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'sp_8', question: 'How many players are on a basketball team on the court?', type: 'multiple_choice', options: ['4', '5', '6', '7'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'sp_9', question: 'What is the highest score possible from a single throw in cricket?', type: 'multiple_choice', options: ['4', '5', '6', '8'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'sp_10', question: 'In which country did the modern Olympic Games originate?', type: 'multiple_choice', options: ['Rome', 'France', 'Greece', 'England'], correctAnswer: 2, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 11. AUSTRALIAN GEOGRAPHY
  // ============================================================
  {
    id: 'premade_australian_geography',
    title: 'Australian Geography',
    description: 'How well do you know the land Down Under? Test your knowledge of Australia!',
    category: 'geography',
    emoji: '🦘',
    difficulty: 'medium',
    gradeLevel: '3-7',
    questions: [
      { id: 'ag_1', question: 'What is the capital city of Australia?', type: 'multiple_choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ag_2', question: 'How many states does Australia have?', type: 'multiple_choice', options: ['5', '6', '7', '8'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'ag_3', question: 'What is the largest state in Australia?', type: 'multiple_choice', options: ['Queensland', 'New South Wales', 'Western Australia', 'South Australia'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ag_4', question: 'What is the famous red rock in Australia\'s outback?', type: 'multiple_choice', options: ['The Blue Mountains', 'Uluru', 'Mount Kosciuszko', 'The Grampians'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'ag_5', question: 'What is Australia\'s highest mountain?', type: 'multiple_choice', options: ['Mount Warning', 'Mount Bartle Frere', 'Mount Kosciuszko', 'Mount Feathertop'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'ag_6', question: 'Which Australian city is nicknamed "The Harbour City"?', type: 'multiple_choice', options: ['Melbourne', 'Brisbane', 'Perth', 'Sydney'], correctAnswer: 3, timeLimit: 15, points: 1000 },
      { id: 'ag_7', question: 'What is the longest river in Australia?', type: 'multiple_choice', options: ['Murray River', 'Darling River', 'Murrumbidgee River', 'Cooper Creek'], correctAnswer: 0, timeLimit: 25, points: 1000 },
      { id: 'ag_8', question: 'Which ocean is to the west of Australia?', type: 'multiple_choice', options: ['Pacific Ocean', 'Southern Ocean', 'Indian Ocean', 'Arctic Ocean'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ag_9', question: 'In which state is the Great Barrier Reef located?', type: 'multiple_choice', options: ['New South Wales', 'Western Australia', 'Queensland', 'Northern Territory'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ag_10', question: 'What is the capital of Victoria?', type: 'multiple_choice', options: ['Geelong', 'Ballarat', 'Melbourne', 'Bendigo'], correctAnswer: 2, timeLimit: 15, points: 1000 },
    ]
  },

  // ============================================================
  // 12. FAMOUS SCIENTISTS & INVENTORS
  // ============================================================
  {
    id: 'premade_scientists_inventors',
    title: 'Famous Scientists & Inventors',
    description: 'Who discovered what? Test your knowledge of history\'s greatest minds!',
    category: 'history',
    emoji: '🔬',
    difficulty: 'medium',
    gradeLevel: '4-7',
    questions: [
      { id: 'si_1', question: 'Who invented the telephone?', type: 'multiple_choice', options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Guglielmo Marconi'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'si_2', question: 'Who developed the theory of relativity?', type: 'multiple_choice', options: ['Isaac Newton', 'Albert Einstein', 'Charles Darwin', 'Stephen Hawking'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'si_3', question: 'Who invented the light bulb?', type: 'multiple_choice', options: ['Nikola Tesla', 'Benjamin Franklin', 'Thomas Edison', 'Marie Curie'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'si_4', question: 'Who wrote the theory of evolution by natural selection?', type: 'multiple_choice', options: ['Louis Pasteur', 'Charles Darwin', 'Gregor Mendel', 'Alfred Wallace'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'si_5', question: 'Who was the first person to walk on the Moon?', type: 'multiple_choice', options: ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Alan Shepard'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'si_6', question: 'Marie Curie was the first woman to win a Nobel Prize. In which field?', type: 'multiple_choice', options: ['Chemistry', 'Physics', 'Medicine', 'Literature'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'si_7', question: 'Who discovered gravity by (supposedly) watching an apple fall?', type: 'multiple_choice', options: ['Galileo Galilei', 'Johannes Kepler', 'Isaac Newton', 'Albert Einstein'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'si_8', question: 'What did Archimedes famously shout when he discovered water displacement?', type: 'multiple_choice', options: ['Bravo!', 'Eureka!', 'Aha!', 'Brilliant!'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'si_9', question: 'Who is known as the "Father of the Computer"?', type: 'multiple_choice', options: ['Steve Jobs', 'Bill Gates', 'Alan Turing', 'Charles Babbage'], correctAnswer: 3, timeLimit: 25, points: 1000 },
      { id: 'si_10', question: 'Alexander Fleming accidentally discovered which antibiotic?', type: 'multiple_choice', options: ['Aspirin', 'Penicillin', 'Amoxicillin', 'Vaccine'], correctAnswer: 1, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 13. MUSIC & ARTS
  // ============================================================
  {
    id: 'premade_music_arts',
    title: 'Music & Arts',
    description: 'Do you know your Beethoven from your Banksy? Test your arts knowledge!',
    category: 'general',
    emoji: '🎨',
    difficulty: 'medium',
    gradeLevel: '3-6',
    questions: [
      { id: 'ma_1', question: 'Who painted the Mona Lisa?', type: 'multiple_choice', options: ['Michelangelo', 'Raphael', 'Leonardo da Vinci', 'Pablo Picasso'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ma_2', question: 'How many strings does a standard guitar have?', type: 'multiple_choice', options: ['4', '5', '6', '7'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ma_3', question: 'What are the three PRIMARY colours?', type: 'multiple_choice', options: ['Red, Yellow, Blue', 'Red, Green, Blue', 'Yellow, Orange, Green', 'Purple, Red, Orange'], correctAnswer: 0, timeLimit: 20, points: 1000 },
      { id: 'ma_4', question: 'Which of these is a famous painting by Vincent van Gogh?', type: 'multiple_choice', options: ['The Scream', 'The Starry Night', 'Girl with a Pearl Earring', 'Water Lilies'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ma_5', question: 'How many notes are in a musical octave?', type: 'multiple_choice', options: ['6', '7', '8', '9'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ma_6', question: 'What is the term for the speed of music?', type: 'multiple_choice', options: ['Pitch', 'Volume', 'Tempo', 'Rhythm'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ma_7', question: 'Which composer was deaf when he wrote his famous 9th Symphony?', type: 'multiple_choice', options: ['Mozart', 'Bach', 'Beethoven', 'Chopin'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ma_8', question: 'What art style did Pablo Picasso help create?', type: 'multiple_choice', options: ['Impressionism', 'Surrealism', 'Cubism', 'Realism'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'ma_9', question: 'Which instrument family does the flute belong to?', type: 'multiple_choice', options: ['Strings', 'Woodwinds', 'Brass', 'Percussion'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ma_10', question: 'The Sistine Chapel ceiling was painted by which artist?', type: 'multiple_choice', options: ['Leonardo da Vinci', 'Raphael', 'Michelangelo', 'Botticelli'], correctAnswer: 2, timeLimit: 20, points: 1000 },
    ]
  },

  // ============================================================
  // 14. TECHNOLOGY & CODING BASICS
  // ============================================================
  {
    id: 'premade_technology_coding',
    title: 'Technology & Digital World',
    description: 'How much do you know about computers, the internet, and the digital world?',
    category: 'general',
    emoji: '💻',
    difficulty: 'easy',
    gradeLevel: '3-6',
    questions: [
      { id: 'tc_1', question: 'What does "WWW" stand for in a website address?', type: 'multiple_choice', options: ['World Wide Web', 'World Wide Wave', 'Wide World Web', 'Web World Wide'], correctAnswer: 0, timeLimit: 20, points: 1000 },
      { id: 'tc_2', question: 'What does a computer\'s CPU stand for?', type: 'multiple_choice', options: ['Central Processing Unit', 'Computer Power Unit', 'Core Program Unit', 'Central Power Unit'], correctAnswer: 0, timeLimit: 20, points: 1000 },
      { id: 'tc_3', question: 'What do we call a set of instructions that tells a computer what to do?', type: 'multiple_choice', options: ['A file', 'A program/code', 'A database', 'A network'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'tc_4', question: 'What does "Wi-Fi" allow you to do?', type: 'multiple_choice', options: ['Print wirelessly', 'Connect to the internet without cables', 'Store files', 'Play music'], correctAnswer: 1, timeLimit: 15, points: 1000 },
      { id: 'tc_5', question: 'In binary code, what two numbers are used?', type: 'multiple_choice', options: ['1 and 2', '0 and 1', '0 and 9', '1 and 10'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'tc_6', question: 'What is a "bug" in computer programming?', type: 'multiple_choice', options: ['A type of virus', 'An error in the code', 'A type of file', 'A slow computer'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'tc_7', question: 'What does the internet cloud store?', type: 'multiple_choice', options: ['Weather data', 'Files and data on remote servers', 'Photographs only', 'Music only'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'tc_8', question: 'Which company created the iPhone?', type: 'multiple_choice', options: ['Google', 'Samsung', 'Apple', 'Microsoft'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'tc_9', question: 'What is an algorithm?', type: 'multiple_choice', options: ['A type of computer', 'A set of step-by-step instructions to solve a problem', 'A programming language', 'A computer virus'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'tc_10', question: 'What does "AI" stand for in technology?', type: 'multiple_choice', options: ['Advanced Internet', 'Artificial Intelligence', 'Automatic Input', 'Advanced Information'], correctAnswer: 1, timeLimit: 15, points: 1000 },
    ]
  },

  // ============================================================
  // 15. WORLD WAR II: KEY EVENTS
  // ============================================================
  {
    id: 'premade_wwii',
    title: 'World War II: Key Events',
    description: 'Learn about one of the most significant events in modern history.',
    category: 'history',
    emoji: '✈️',
    difficulty: 'hard',
    gradeLevel: '5-8',
    questions: [
      { id: 'ww_1', question: 'In which year did World War II begin?', type: 'multiple_choice', options: ['1935', '1937', '1939', '1941'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ww_2', question: 'Which country did Germany invade to start World War II?', type: 'multiple_choice', options: ['France', 'Poland', 'Russia', 'Belgium'], correctAnswer: 1, timeLimit: 20, points: 1000 },
      { id: 'ww_3', question: 'Who was the British Prime Minister for most of World War II?', type: 'multiple_choice', options: ['Anthony Eden', 'Clement Attlee', 'Winston Churchill', 'Neville Chamberlain'], correctAnswer: 2, timeLimit: 20, points: 1000 },
      { id: 'ww_4', question: 'What was the name of the military operation that landed Allied troops in Normandy in 1944?', type: 'multiple_choice', options: ['Operation Overlord', 'Operation Barbarossa', 'Operation Market Garden', 'Operation Torch'], correctAnswer: 0, timeLimit: 25, points: 1000 },
      { id: 'ww_5', question: 'On which date did the United States enter World War II?', type: 'multiple_choice', options: ['September 1, 1939', 'December 7, 1941', 'June 6, 1944', 'May 8, 1945'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'ww_6', question: 'Which country did Germany NOT occupy during World War II?', type: 'multiple_choice', options: ['France', 'Norway', 'Portugal', 'Netherlands'], correctAnswer: 2, timeLimit: 25, points: 1000 },
      { id: 'ww_7', question: 'Who was the leader of Nazi Germany?', type: 'multiple_choice', options: ['Mussolini', 'Stalin', 'Hitler', 'Hirohito'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ww_8', question: 'In which year did World War II end?', type: 'multiple_choice', options: ['1943', '1944', '1945', '1946'], correctAnswer: 2, timeLimit: 15, points: 1000 },
      { id: 'ww_9', question: 'What was the name of the atomic bomb dropped on Hiroshima?', type: 'multiple_choice', options: ['Fat Man', 'Little Boy', 'Big Bertha', 'Enola Gay'], correctAnswer: 1, timeLimit: 25, points: 1000 },
      { id: 'ww_10', question: 'What were the "Allies" in World War II?', type: 'multiple_choice', options: ['Germany, Italy, and Japan', 'USA, UK, France, and the Soviet Union', 'Germany and Austria', 'Japan and China'], correctAnswer: 1, timeLimit: 20, points: 1000 },
    ]
  },
];

export const getPremadeQuizById = (id) => PREMADE_QUIZZES.find(q => q.id === id) || null;

export const PREMADE_CATEGORIES = {
  all: { name: 'All Topics', icon: '🌟', color: '#6B7280' },
  science: { name: 'Science', icon: '🧪', color: '#10B981' },
  mathematics: { name: 'Mathematics', icon: '🔢', color: '#3B82F6' },
  geography: { name: 'Geography', icon: '🌍', color: '#F59E0B' },
  history: { name: 'History', icon: '🏛️', color: '#8B5CF6' },
  language: { name: 'Language Arts', icon: '📚', color: '#EF4444' },
  general: { name: 'General Knowledge', icon: '🧠', color: '#6B7280' },
};

export default PREMADE_QUIZZES;
