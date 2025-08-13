// components/curriculum/mathematics/data/grade5-math-data.js
// GRADE 5 MATH WARMUP - 20 MENTAL MATH QUESTIONS

export const grade5MathQuestions = [
  // FIRST 10 QUESTIONS: NUMBER FACTS & NUMBER OPERATIONS
  {
    id: 1,
    question: "7 × 8 = ?",
    answer: "56",
    type: "multiplication"
  },
  {
    id: 2,
    question: "72 ÷ 9 = ?",
    answer: "8",
    type: "division"
  },
  {
    id: 3,
    question: "What is 6²?",
    answer: "36",
    type: "squares"
  },
  {
    id: 4,
    question: "45 + 37 = ?",
    answer: "82",
    type: "addition"
  },
  {
    id: 5,
    question: "100 - 64 = ?",
    answer: "36",
    type: "subtraction"
  },
  {
    id: 6,
    question: "9 × 12 = ?",
    answer: "108",
    type: "multiplication"
  },
  {
    id: 7,
    question: "84 ÷ 12 = ?",
    answer: "7",
    type: "division"
  },
  {
    id: 8,
    question: "Double 45",
    answer: "90",
    type: "doubling"
  },
  {
    id: 9,
    question: "Half of 86",
    answer: "43",
    type: "halving"
  },
  {
    id: 10,
    question: "8 × 7 = ?",
    answer: "56",
    type: "multiplication"
  },

  // FINAL 10 QUESTIONS: MIXED MATH AREAS
  {
    id: 11,
    question: "What is 50% of 80?",
    answer: "40",
    type: "percentage"
  },
  {
    id: 12,
    question: "1/4 of 48 = ?",
    answer: "12",
    type: "fractions"
  },
  {
    id: 13,
    question: "2.5 + 1.7 = ?",
    answer: "4.2",
    type: "decimals"
  },
  {
    id: 14,
    question: "Round 347 to the nearest 10",
    answer: "350",
    type: "rounding"
  },
  {
    id: 15,
    question: "If x + 15 = 32, what is x?",
    answer: "17",
    type: "algebra"
  },
  {
    id: 16,
    question: "What is 25% of 60?",
    answer: "15",
    type: "percentage"
  },
  {
    id: 17,
    question: "3/5 = how many tenths?",
    answer: "6 tenths",
    type: "fractions"
  },
  {
    id: 18,
    question: "4.8 - 2.3 = ?",
    answer: "2.5",
    type: "decimals"
  },
  {
    id: 19,
    question: "Estimate: 297 + 158",
    answer: "450 (or 455)",
    type: "estimation"
  },
  {
    id: 20,
    question: "24 students, 3/4 are girls. How many girls?",
    answer: "18",
    type: "word_problem"
  }
];

// Alternative question sets for variety (can be randomly selected from)
export const grade5AlternativeQuestions = {
  numberFacts: [
    { question: "6 × 9 = ?", answer: "54" },
    { question: "56 ÷ 7 = ?", answer: "8" },
    { question: "What is 5²?", answer: "25" },
    { question: "38 + 45 = ?", answer: "83" },
    { question: "120 - 47 = ?", answer: "73" },
    { question: "11 × 6 = ?", answer: "66" },
    { question: "96 ÷ 8 = ?", answer: "12" },
    { question: "Double 37", answer: "74" },
    { question: "Half of 74", answer: "37" },
    { question: "7 × 6 = ?", answer: "42" }
  ],
  mixedQuestions: [
    { question: "What is 75% of 40?", answer: "30" },
    { question: "2/3 of 36 = ?", answer: "24" },
    { question: "3.6 + 2.8 = ?", answer: "6.4" },
    { question: "Round 563 to nearest 100", answer: "600" },
    { question: "If y - 23 = 45, what is y?", answer: "68" },
    { question: "What is 20% of 75?", answer: "15" },
    { question: "4/5 = how many tenths?", answer: "8 tenths" },
    { question: "7.2 - 3.9 = ?", answer: "3.3" },
    { question: "Estimate: 384 + 267", answer: "650" },
    { question: "30 books, 2/5 are fiction. How many?", answer: "12" }
  ]
};

// Question type categories for tracking
export const questionTypes = {
  numberFacts: ["multiplication", "division", "squares", "addition", "subtraction", "doubling", "halving"],
  mixedAreas: ["percentage", "fractions", "decimals", "rounding", "algebra", "estimation", "word_problem"]
};