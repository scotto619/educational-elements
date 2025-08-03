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
  },

  areaPerimeter: {
    concepts: {
      area: {
        definition: "The amount of space inside a 2D shape",
        units: "square units (sq cm, sq m, etc.)",
        realWorld: "carpet for a room, paint for a wall"
      },
      perimeter: {
        definition: "The distance around the outside of a 2D shape",
        units: "linear units (cm, m, etc.)",
        realWorld: "fence around a yard, frame for a picture"
      }
    },
    
    formulas: {
      rectangle: {
        area: "length × width",
        perimeter: "2 × (length + width)"
      },
      square: {
        area: "side × side (or side²)",
        perimeter: "4 × side"
      },
      triangle: {
        area: "(base × height) ÷ 2",
        perimeter: "side₁ + side₂ + side₃"
      },
      circle: {
        area: "π × radius²",
        perimeter: "2 × π × radius (circumference)"
      }
    },

    activities: [
      {
        title: "Room Designer",
        description: "Calculate area needed for carpeting a classroom",
        emoji: "🏠"
      },
      {
        title: "Garden Planner",
        description: "Find perimeter for fencing a school garden",
        emoji: "🌱"
      },
      {
        title: "Art Frame",
        description: "Measure perimeter for picture frames",
        emoji: "🖼️"
      },
      {
        title: "Sports Field",
        description: "Calculate area and perimeter of playground",
        emoji: "⚽"
      }
    ],

    practiceProblems: [
      {
        id: 1,
        shape: "rectangle",
        dimensions: { length: 8, width: 5 },
        question: "What is the area of a rectangle with length 8 units and width 5 units?",
        answer: { area: 40, perimeter: 26 },
        level: "beginner"
      },
      {
        id: 2,
        shape: "square",
        dimensions: { side: 6 },
        question: "A square playground has sides of 6 meters. What is its perimeter?",
        answer: { area: 36, perimeter: 24 },
        level: "beginner"
      },
      {
        id: 3,
        shape: "rectangle",
        dimensions: { length: 12, width: 7 },
        question: "How much carpet is needed for a room that is 12m long and 7m wide?",
        answer: { area: 84, perimeter: 38 },
        level: "intermediate"
      }
    ],

    comparisons: [
      {
        scenario: "Two rectangles with same perimeter",
        shapes: [
          { length: 6, width: 4, area: 24, perimeter: 20 },
          { length: 8, width: 2, area: 16, perimeter: 20 }
        ],
        lesson: "Same perimeter can have different areas"
      },
      {
        scenario: "Two rectangles with same area",
        shapes: [
          { length: 6, width: 4, area: 24, perimeter: 20 },
          { length: 12, width: 2, area: 24, perimeter: 28 }
        ],
        lesson: "Same area can have different perimeters"
      }
    ],

    teachingTips: [
      "Use physical objects like tiles for area visualization",
      "Walk around shapes to demonstrate perimeter",
      "Connect to real-world examples students understand",
      "Show how changing one dimension affects both measurements",
      "Use grid paper for hands-on practice",
      "Compare squares and rectangles with same measurements"
    ],

    vocabulary: {
      area: "The space inside a shape",
      perimeter: "The distance around a shape",
      length: "The longest side of a rectangle",
      width: "The shorter side of a rectangle",
      base: "The bottom side of a triangle",
      height: "The perpendicular distance from base to top",
      square_unit: "A unit for measuring area (like 1 cm²)",
      linear_unit: "A unit for measuring length or perimeter (like 1 cm)"
    }
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
  },

  areaPerimeterChallenge: {
    levels: {
      beginner: {
        maxDimensions: 10,
        shapes: ["rectangle", "square"],
        timeLimit: 90
      },
      intermediate: {
        maxDimensions: 15,
        shapes: ["rectangle", "square", "triangle"],
        timeLimit: 60
      },
      advanced: {
        maxDimensions: 20,
        shapes: ["rectangle", "square", "triangle", "circle"],
        timeLimit: 45
      }
    },
    
    challengeTypes: [
      "Calculate area only",
      "Calculate perimeter only", 
      "Calculate both area and perimeter",
      "Compare two shapes",
      "Find missing dimension"
    ]
  }
};