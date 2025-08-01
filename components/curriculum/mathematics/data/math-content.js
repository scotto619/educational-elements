// components/curriculum/mathematics/data/math-content.js
// MATHEMATICS CONTENT DATA - EXAMPLE OF SUBJECT-SPECIFIC DATA STRUCTURE

export const mathContent = {
  numbersBoard: {
    patterns: {
      evens: "Even numbers follow a pattern of +2",
      odds: "Odd numbers also follow a pattern of +2",
      fives: "Multiples of 5 end in 0 or 5",
      tens: "Multiples of 10 end in 0"
    },
    activities: [
      "Find all numbers that end in 5",
      "Count by 2s starting from any even number",
      "Find patterns in the numbers",
      "Skip count by different amounts"
    ]
  },
  
  timesTables: {
    tables: {
      2: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      3: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
      4: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
      5: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    },
    strategies: {
      2: "Double the number",
      5: "Count by hands (5 fingers)",
      10: "Add a zero to the number"
    }
  },

  problemSolving: {
    wordProblems: [
      {
        id: 1,
        level: "beginner",
        problem: "Sarah has 5 apples. She gives 2 to her friend. How many does she have left?",
        answer: 3,
        hint: "Subtraction: 5 - 2 = ?"
      },
      {
        id: 2,
        level: "intermediate", 
        problem: "There are 4 boxes with 6 pencils in each box. How many pencils are there in total?",
        answer: 24,
        hint: "Multiplication: 4 × 6 = ?"
      }
    ]
  },

  fractions: {
    basicFractions: [
      { fraction: "1/2", decimal: 0.5, percentage: "50%", visual: "half" },
      { fraction: "1/4", decimal: 0.25, percentage: "25%", visual: "quarter" },
      { fraction: "3/4", decimal: 0.75, percentage: "75%", visual: "three quarters" }
    ],
    activities: [
      "Cut shapes into equal parts",
      "Compare fraction sizes",
      "Find equivalent fractions",
      "Add simple fractions"
    ]
  }
};

export const mathGameData = {
  speedMath: {
    levels: ["beginner", "intermediate", "advanced"],
    operations: ["addition", "subtraction", "multiplication", "division"],
    timeLimit: 60
  },
  
  mathBingo: {
    cardSize: 5,
    numberRange: { min: 1, max: 100 },
    operations: ["addition", "subtraction"]
  }
};