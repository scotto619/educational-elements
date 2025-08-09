// components/curriculum/mathematics/data/math-warmup-content.js
// COMPREHENSIVE MATH WARMUP CONTENT DATA FOR ALL GRADE LEVELS

// ===============================================
// QUESTION GENERATORS
// ===============================================
export const questionGenerators = {
  // PREP LEVEL GENERATORS
  generateCountingQuestions: (subcategory) => {
    const questions = [];
    const max = subcategory === "count-to-10" ? 10 : 20;
    
    const countingQuestions = [
      // Count to 10
      { question: "Count from 1 to 5", answer: "1, 2, 3, 4, 5", type: 'counting' },
      { question: "Count from 3 to 7", answer: "3, 4, 5, 6, 7", type: 'counting' },
      { question: "Count from 6 to 10", answer: "6, 7, 8, 9, 10", type: 'counting' },
      { question: "Count from 2 to 6", answer: "2, 3, 4, 5, 6", type: 'counting' },
      { question: "Count from 4 to 8", answer: "4, 5, 6, 7, 8", type: 'counting' },
      // Count to 20
      { question: "Count from 11 to 15", answer: "11, 12, 13, 14, 15", type: 'counting' },
      { question: "Count from 16 to 20", answer: "16, 17, 18, 19, 20", type: 'counting' },
      { question: "Count from 8 to 12", answer: "8, 9, 10, 11, 12", type: 'counting' },
      { question: "Count from 13 to 17", answer: "13, 14, 15, 16, 17", type: 'counting' },
      { question: "Count from 5 to 9", answer: "5, 6, 7, 8, 9", type: 'counting' }
    ];
    
    return countingQuestions.filter(q => 
      subcategory === "count-to-10" ? 
      parseInt(q.answer.split(', ').pop()) <= 10 : 
      parseInt(q.answer.split(', ').pop()) <= 20
    ).slice(0, 10);
  },

  generateOneMoreQuestions: () => {
    const baseQuestions = [
      { question: "What is one more than 3?", answer: 4 },
      { question: "What is one more than 7?", answer: 8 },
      { question: "What is one more than 12?", answer: 13 },
      { question: "What is one more than 9?", answer: 10 },
      { question: "What is one more than 15?", answer: 16 },
      { question: "What is one more than 6?", answer: 7 },
      { question: "What is one more than 18?", answer: 19 },
      { question: "What is one more than 4?", answer: 5 },
      { question: "What is one more than 11?", answer: 12 },
      { question: "What is one more than 8?", answer: 9 }
    ];
    return baseQuestions.map(q => ({ ...q, type: 'one-more' }));
  },

  generateOneLessQuestions: () => {
    const baseQuestions = [
      { question: "What is one less than 5?", answer: 4 },
      { question: "What is one less than 9?", answer: 8 },
      { question: "What is one less than 13?", answer: 12 },
      { question: "What is one less than 7?", answer: 6 },
      { question: "What is one less than 16?", answer: 15 },
      { question: "What is one less than 10?", answer: 9 },
      { question: "What is one less than 20?", answer: 19 },
      { question: "What is one less than 8?", answer: 7 },
      { question: "What is one less than 14?", answer: 13 },
      { question: "What is one less than 6?", answer: 5 }
    ];
    return baseQuestions.map(q => ({ ...q, type: 'one-less' }));
  },

  generateShapeQuestions: () => {
    const shapeQuestions = [
      { question: "How many sides does a triangle have?", answer: "3 sides" },
      { question: "How many sides does a square have?", answer: "4 sides" },
      { question: "How many sides does a circle have?", answer: "0 sides (it's round)" },
      { question: "What shape has 3 corners?", answer: "Triangle" },
      { question: "What shape has 4 equal sides?", answer: "Square" },
      { question: "How many corners does a rectangle have?", answer: "4 corners" },
      { question: "What shape is completely round?", answer: "Circle" },
      { question: "How many sides does a rectangle have?", answer: "4 sides" },
      { question: "What shape has 3 sides and 3 corners?", answer: "Triangle" },
      { question: "Which shape has no corners?", answer: "Circle" }
    ];
    return shapeQuestions.map(q => ({ ...q, type: 'shapes' }));
  },

  generateShapePropertiesQuestions: () => {
    const propertyQuestions = [
      { question: "Are all sides of a square the same length?", answer: "Yes" },
      { question: "Does a triangle have more sides than a square?", answer: "No" },
      { question: "Is a circle flat or round?", answer: "Round" },
      { question: "How many long sides does a rectangle have?", answer: "2 long sides" },
      { question: "How many short sides does a rectangle have?", answer: "2 short sides" },
      { question: "Can you roll a circle?", answer: "Yes" },
      { question: "Can you roll a square?", answer: "No" },
      { question: "Which has more corners: triangle or square?", answer: "Square" },
      { question: "Are opposite sides of a rectangle equal?", answer: "Yes" },
      { question: "Does a triangle have any curved sides?", answer: "No" }
    ];
    return propertyQuestions.map(q => ({ ...q, type: 'shape-properties' }));
  },

  // GRADE 1 GENERATORS
  generateAdditionQuestions: (subcategory) => {
    const questions = [];
    let questionSet = [];
    
    if (subcategory === 'add-to-5') {
      questionSet = [
        { question: "2 + 1 = ?", answer: 3 },
        { question: "1 + 3 = ?", answer: 4 },
        { question: "3 + 2 = ?", answer: 5 },
        { question: "2 + 2 = ?", answer: 4 },
        { question: "1 + 1 = ?", answer: 2 },
        { question: "4 + 1 = ?", answer: 5 },
        { question: "1 + 2 = ?", answer: 3 },
        { question: "3 + 1 = ?", answer: 4 },
        { question: "2 + 3 = ?", answer: 5 },
        { question: "0 + 4 = ?", answer: 4 }
      ];
    } else if (subcategory === 'add-to-10') {
      questionSet = [
        { question: "5 + 3 = ?", answer: 8 },
        { question: "4 + 4 = ?", answer: 8 },
        { question: "6 + 2 = ?", answer: 8 },
        { question: "7 + 1 = ?", answer: 8 },
        { question: "3 + 5 = ?", answer: 8 },
        { question: "6 + 4 = ?", answer: 10 },
        { question: "7 + 3 = ?", answer: 10 },
        { question: "8 + 2 = ?", answer: 10 },
        { question: "5 + 4 = ?", answer: 9 },
        { question: "6 + 3 = ?", answer: 9 }
      ];
    } else if (subcategory === 'add-to-20') {
      questionSet = [
        { question: "12 + 3 = ?", answer: 15 },
        { question: "11 + 5 = ?", answer: 16 },
        { question: "13 + 4 = ?", answer: 17 },
        { question: "14 + 2 = ?", answer: 16 },
        { question: "15 + 3 = ?", answer: 18 },
        { question: "10 + 7 = ?", answer: 17 },
        { question: "12 + 6 = ?", answer: 18 },
        { question: "11 + 8 = ?", answer: 19 },
        { question: "10 + 9 = ?", answer: 19 },
        { question: "13 + 7 = ?", answer: 20 }
      ];
    } else if (subcategory === 'add-to-50') {
      questionSet = [
        { question: "23 + 12 = ?", answer: 35 },
        { question: "31 + 14 = ?", answer: 45 },
        { question: "25 + 20 = ?", answer: 45 },
        { question: "30 + 15 = ?", answer: 45 },
        { question: "22 + 16 = ?", answer: 38 },
        { question: "27 + 13 = ?", answer: 40 },
        { question: "34 + 11 = ?", answer: 45 },
        { question: "26 + 19 = ?", answer: 45 },
        { question: "32 + 18 = ?", answer: 50 },
        { question: "29 + 16 = ?", answer: 45 }
      ];
    } else if (subcategory === 'add-to-100') {
      questionSet = [
        { question: "45 + 25 = ?", answer: 70 },
        { question: "37 + 33 = ?", answer: 70 },
        { question: "42 + 38 = ?", answer: 80 },
        { question: "56 + 24 = ?", answer: 80 },
        { question: "48 + 32 = ?", answer: 80 },
        { question: "39 + 41 = ?", answer: 80 },
        { question: "47 + 43 = ?", answer: 90 },
        { question: "52 + 38 = ?", answer: 90 },
        { question: "46 + 44 = ?", answer: 90 },
        { question: "55 + 35 = ?", answer: 90 }
      ];
    } else if (subcategory === 'add-hundreds') {
      questionSet = [
        { question: "145 + 123 = ?", answer: 268 },
        { question: "234 + 156 = ?", answer: 390 },
        { question: "187 + 142 = ?", answer: 329 },
        { question: "256 + 133 = ?", answer: 389 },
        { question: "178 + 221 = ?", answer: 399 },
        { question: "345 + 154 = ?", answer: 499 },
        { question: "267 + 132 = ?", answer: 399 },
        { question: "189 + 210 = ?", answer: 399 },
        { question: "234 + 165 = ?", answer: 399 },
        { question: "278 + 121 = ?", answer: 399 }
      ];
    } else if (subcategory === 'add-thousands') {
      questionSet = [
        { question: "1245 + 1234 = ?", answer: 2479 },
        { question: "2356 + 1423 = ?", answer: 3779 },
        { question: "1789 + 2110 = ?", answer: 3899 },
        { question: "2467 + 1332 = ?", answer: 3799 },
        { question: "1678 + 2221 = ?", answer: 3899 },
        { question: "3456 + 1543 = ?", answer: 4999 },
        { question: "2789 + 2110 = ?", answer: 4899 },
        { question: "1567 + 3332 = ?", answer: 4899 },
        { question: "2345 + 2654 = ?", answer: 4999 },
        { question: "1876 + 3123 = ?", answer: 4999 }
      ];
    }
    
    return questionSet.map(q => ({ ...q, type: 'addition' }));
  },

  generateSubtractionQuestions: (subcategory) => {
    let questionSet = [];
    
    if (subcategory === 'subtract-from-10') {
      questionSet = [
        { question: "8 - 3 = ?", answer: 5 },
        { question: "7 - 2 = ?", answer: 5 },
        { question: "9 - 4 = ?", answer: 5 },
        { question: "10 - 5 = ?", answer: 5 },
        { question: "6 - 1 = ?", answer: 5 },
        { question: "10 - 3 = ?", answer: 7 },
        { question: "9 - 2 = ?", answer: 7 },
        { question: "8 - 1 = ?", answer: 7 },
        { question: "10 - 4 = ?", answer: 6 },
        { question: "9 - 3 = ?", answer: 6 }
      ];
    } else if (subcategory === 'subtract-from-20') {
      questionSet = [
        { question: "15 - 5 = ?", answer: 10 },
        { question: "18 - 8 = ?", answer: 10 },
        { question: "17 - 7 = ?", answer: 10 },
        { question: "16 - 6 = ?", answer: 10 },
        { question: "19 - 9 = ?", answer: 10 },
        { question: "20 - 5 = ?", answer: 15 },
        { question: "18 - 3 = ?", answer: 15 },
        { question: "17 - 2 = ?", answer: 15 },
        { question: "19 - 4 = ?", answer: 15 },
        { question: "16 - 1 = ?", answer: 15 }
      ];
    } else if (subcategory === 'subtract-to-50') {
      questionSet = [
        { question: "35 - 15 = ?", answer: 20 },
        { question: "42 - 22 = ?", answer: 20 },
        { question: "48 - 28 = ?", answer: 20 },
        { question: "36 - 16 = ?", answer: 20 },
        { question: "45 - 25 = ?", answer: 20 },
        { question: "50 - 20 = ?", answer: 30 },
        { question: "47 - 17 = ?", answer: 30 },
        { question: "43 - 13 = ?", answer: 30 },
        { question: "49 - 19 = ?", answer: 30 },
        { question: "41 - 11 = ?", answer: 30 }
      ];
    } else if (subcategory === 'subtract-to-100') {
      questionSet = [
        { question: "75 - 25 = ?", answer: 50 },
        { question: "82 - 32 = ?", answer: 50 },
        { question: "68 - 18 = ?", answer: 50 },
        { question: "96 - 46 = ?", answer: 50 },
        { question: "87 - 37 = ?", answer: 50 },
        { question: "90 - 30 = ?", answer: 60 },
        { question: "85 - 25 = ?", answer: 60 },
        { question: "93 - 33 = ?", answer: 60 },
        { question: "88 - 28 = ?", answer: 60 },
        { question: "91 - 31 = ?", answer: 60 }
      ];
    } else if (subcategory === 'subtract-hundreds') {
      questionSet = [
        { question: "375 - 125 = ?", answer: 250 },
        { question: "482 - 232 = ?", answer: 250 },
        { question: "568 - 318 = ?", answer: 250 },
        { question: "396 - 146 = ?", answer: 250 },
        { question: "487 - 237 = ?", answer: 250 },
        { question: "590 - 240 = ?", answer: 350 },
        { question: "685 - 335 = ?", answer: 350 },
        { question: "593 - 243 = ?", answer: 350 },
        { question: "788 - 438 = ?", answer: 350 },
        { question: "691 - 341 = ?", answer: 350 }
      ];
    }
    
    return questionSet.map(q => ({ ...q, type: 'subtraction' }));
  },

  generateBondsQuestions: () => {
    const bondsQuestions = [
      { question: "5 + ? = 10", answer: 5 },
      { question: "3 + ? = 10", answer: 7 },
      { question: "7 + ? = 10", answer: 3 },
      { question: "2 + ? = 10", answer: 8 },
      { question: "8 + ? = 10", answer: 2 },
      { question: "4 + ? = 10", answer: 6 },
      { question: "6 + ? = 10", answer: 4 },
      { question: "1 + ? = 10", answer: 9 },
      { question: "9 + ? = 10", answer: 1 },
      { question: "0 + ? = 10", answer: 10 }
    ];
    return bondsQuestions.map(q => ({ ...q, type: 'bonds' }));
  },

  generateMissingNumberQuestions: () => {
    const missingQuestions = [
      { question: "4 + ? = 7", answer: 3 },
      { question: "? + 5 = 9", answer: 4 },
      { question: "6 + ? = 11", answer: 5 },
      { question: "? + 3 = 8", answer: 5 },
      { question: "7 + ? = 12", answer: 5 },
      { question: "? + 4 = 10", answer: 6 },
      { question: "8 + ? = 15", answer: 7 },
      { question: "? + 6 = 13", answer: 7 },
      { question: "9 + ? = 16", answer: 7 },
      { question: "? + 7 = 14", answer: 7 }
    ];
    return missingQuestions.map(q => ({ ...q, type: 'missing-numbers' }));
  },

  generateOrderingQuestions: () => {
    const orderingQuestions = [
      { question: "Put in order: 5, 2, 8, 1", answer: "1, 2, 5, 8" },
      { question: "Put in order: 12, 7, 15, 9", answer: "7, 9, 12, 15" },
      { question: "Put in order: 6, 18, 3, 11", answer: "3, 6, 11, 18" },
      { question: "Put in order: 14, 4, 19, 8", answer: "4, 8, 14, 19" },
      { question: "Put in order: 17, 13, 20, 16", answer: "13, 16, 17, 20" },
      { question: "Put in order: 10, 1, 5, 3", answer: "1, 3, 5, 10" },
      { question: "Put in order: 9, 16, 2, 12", answer: "2, 9, 12, 16" },
      { question: "Put in order: 7, 18, 11, 4", answer: "4, 7, 11, 18" },
      { question: "Put in order: 15, 6, 13, 8", answer: "6, 8, 13, 15" },
      { question: "Put in order: 19, 14, 17, 10", answer: "10, 14, 17, 19" }
    ];
    return orderingQuestions.map(q => ({ ...q, type: 'ordering' }));
  },

  generateBeforeAfterQuestions: () => {
    const beforeAfterQuestions = [
      { question: "What comes before 8?", answer: 7 },
      { question: "What comes after 12?", answer: 13 },
      { question: "What comes before 15?", answer: 14 },
      { question: "What comes after 6?", answer: 7 },
      { question: "What comes before 20?", answer: 19 },
      { question: "What comes after 18?", answer: 19 },
      { question: "What comes before 11?", answer: 10 },
      { question: "What comes after 9?", answer: 10 },
      { question: "What comes before 17?", answer: 16 },
      { question: "What comes after 14?", answer: 15 }
    ];
    return beforeAfterQuestions.map(q => ({ ...q, type: 'before-after' }));
  },

  generateDoublesQuestions: () => {
    const doublesQuestions = [
      { question: "Double 3", answer: 6 },
      { question: "Double 5", answer: 10 },
      { question: "Double 4", answer: 8 },
      { question: "Double 6", answer: 12 },
      { question: "Double 7", answer: 14 },
      { question: "Double 8", answer: 16 },
      { question: "Double 2", answer: 4 },
      { question: "Double 9", answer: 18 },
      { question: "Double 1", answer: 2 },
      { question: "Double 10", answer: 20 }
    ];
    return doublesQuestions.map(q => ({ ...q, type: 'doubles' }));
  },

  generateThreeNumberQuestions: () => {
    const threeNumberQuestions = [
      { question: "2 + 3 + 4 = ?", answer: 9 },
      { question: "1 + 5 + 3 = ?", answer: 9 },
      { question: "4 + 2 + 6 = ?", answer: 12 },
      { question: "3 + 4 + 5 = ?", answer: 12 },
      { question: "2 + 2 + 8 = ?", answer: 12 },
      { question: "5 + 3 + 7 = ?", answer: 15 },
      { question: "4 + 6 + 5 = ?", answer: 15 },
      { question: "2 + 8 + 5 = ?", answer: 15 },
      { question: "6 + 4 + 8 = ?", answer: 18 },
      { question: "7 + 5 + 6 = ?", answer: 18 }
    ];
    return threeNumberQuestions.map(q => ({ ...q, type: 'three-numbers' }));
  },

  generateDifferenceQuestions: () => {
    const differenceQuestions = [
      { question: "What is the difference between 8 and 5?", answer: 3 },
      { question: "What is the difference between 12 and 7?", answer: 5 },
      { question: "What is the difference between 15 and 9?", answer: 6 },
      { question: "What is the difference between 20 and 13?", answer: 7 },
      { question: "What is the difference between 18 and 10?", answer: 8 },
      { question: "What is the difference between 14 and 8?", answer: 6 },
      { question: "What is the difference between 17 and 11?", answer: 6 },
      { question: "What is the difference between 16 and 9?", answer: 7 },
      { question: "What is the difference between 19 and 12?", answer: 7 },
      { question: "What is the difference between 13 and 6?", answer: 7 }
    ];
    return differenceQuestions.map(q => ({ ...q, type: 'difference' }));
  },

  // MULTIPLICATION GENERATORS
  generateTimesTableQuestions: (subcategory) => {
    const table = parseInt(subcategory.split('-')[1]);
    const timesQuestions = [];
    
    for (let i = 1; i <= 12; i++) {
      timesQuestions.push({
        question: `${table} × ${i} = ?`,
        answer: table * i,
        type: 'multiplication'
      });
    }
    
    // Return 10 random questions from the times table
    return timesQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
  },

  generateMixedTablesQuestions: () => {
    const tables = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const mixedQuestions = [];
    
    for (let i = 0; i < 10; i++) {
      const table = tables[Math.floor(Math.random() * tables.length)];
      const multiplier = Math.floor(Math.random() * 12) + 1;
      mixedQuestions.push({
        question: `${table} × ${multiplier} = ?`,
        answer: table * multiplier,
        type: 'multiplication'
      });
    }
    
    return mixedQuestions;
  },

  // DIVISION GENERATORS
  generateDivisionQuestions: (subcategory) => {
    const divisor = parseInt(subcategory.split('-')[2]);
    const divisionQuestions = [];
    
    for (let i = 1; i <= 10; i++) {
      const dividend = divisor * i;
      divisionQuestions.push({
        question: `${dividend} ÷ ${divisor} = ?`,
        answer: i,
        type: 'division'
      });
    }
    
    return divisionQuestions;
  },

  generateLongDivisionQuestions: () => {
    const longDivisionQuestions = [
      { question: "84 ÷ 4 = ?", answer: 21 },
      { question: "96 ÷ 3 = ?", answer: 32 },
      { question: "72 ÷ 6 = ?", answer: 12 },
      { question: "88 ÷ 8 = ?", answer: 11 },
      { question: "91 ÷ 7 = ?", answer: 13 },
      { question: "65 ÷ 5 = ?", answer: 13 },
      { question: "78 ÷ 6 = ?", answer: 13 },
      { question: "99 ÷ 9 = ?", answer: 11 },
      { question: "76 ÷ 4 = ?", answer: 19 },
      { question: "85 ÷ 5 = ?", answer: 17 }
    ];
    return longDivisionQuestions.map(q => ({ ...q, type: 'long-division' }));
  },

  generateRemainderQuestions: () => {
    const remainderQuestions = [
      { question: "17 ÷ 3 = ? remainder ?", answer: "5 remainder 2" },
      { question: "23 ÷ 4 = ? remainder ?", answer: "5 remainder 3" },
      { question: "19 ÷ 5 = ? remainder ?", answer: "3 remainder 4" },
      { question: "26 ÷ 7 = ? remainder ?", answer: "3 remainder 5" },
      { question: "31 ÷ 6 = ? remainder ?", answer: "5 remainder 1" },
      { question: "29 ÷ 8 = ? remainder ?", answer: "3 remainder 5" },
      { question: "37 ÷ 9 = ? remainder ?", answer: "4 remainder 1" },
      { question: "22 ÷ 5 = ? remainder ?", answer: "4 remainder 2" },
      { question: "33 ÷ 7 = ? remainder ?", answer: "4 remainder 5" },
      { question: "41 ÷ 6 = ? remainder ?", answer: "6 remainder 5" }
    ];
    return remainderQuestions.map(q => ({ ...q, type: 'remainders' }));
  },

  // FRACTION GENERATORS
  generateFractionQuestions: () => {
    const fractionQuestions = [
      { question: "What is 1/2 of 8?", answer: 4 },
      { question: "What is 1/3 of 12?", answer: 4 },
      { question: "What is 1/4 of 16?", answer: 4 },
      { question: "What is 1/2 of 10?", answer: 5 },
      { question: "What is 1/3 of 15?", answer: 5 },
      { question: "What is 1/4 of 20?", answer: 5 },
      { question: "What is 1/2 of 14?", answer: 7 },
      { question: "What is 1/3 of 18?", answer: 6 },
      { question: "What is 1/4 of 24?", answer: 6 },
      { question: "What is 1/5 of 25?", answer: 5 }
    ];
    return fractionQuestions.map(q => ({ ...q, type: 'fractions' }));
  },

  generateEquivalentFractionQuestions: () => {
    const equivalentQuestions = [
      { question: "1/2 = ?/4", answer: "2/4" },
      { question: "1/3 = ?/6", answer: "2/6" },
      { question: "2/4 = ?/8", answer: "4/8" },
      { question: "1/2 = ?/6", answer: "3/6" },
      { question: "2/3 = ?/6", answer: "4/6" },
      { question: "1/4 = ?/8", answer: "2/8" },
      { question: "3/4 = ?/8", answer: "6/8" },
      { question: "1/2 = ?/10", answer: "5/10" },
      { question: "2/5 = ?/10", answer: "4/10" },
      { question: "1/3 = ?/9", answer: "3/9" }
    ];
    return equivalentQuestions.map(q => ({ ...q, type: 'equivalent-fractions' }));
  },

  generateCompareFractionQuestions: () => {
    const compareQuestions = [
      { question: "Which is bigger: 1/2 or 1/3?", answer: "1/2" },
      { question: "Which is bigger: 2/3 or 1/2?", answer: "2/3" },
      { question: "Which is bigger: 1/4 or 1/3?", answer: "1/3" },
      { question: "Which is bigger: 3/4 or 2/3?", answer: "3/4" },
      { question: "Which is bigger: 1/2 or 2/5?", answer: "1/2" },
      { question: "Which is bigger: 3/5 or 1/2?", answer: "3/5" },
      { question: "Which is bigger: 1/3 or 2/5?", answer: "2/5" },
      { question: "Which is bigger: 2/4 or 1/3?", answer: "2/4 (or 1/2)" },
      { question: "Which is bigger: 4/5 or 3/4?", answer: "4/5" },
      { question: "Which is bigger: 1/6 or 1/4?", answer: "1/4" }
    ];
    return compareQuestions.map(q => ({ ...q, type: 'compare-fractions' }));
  },

  // DECIMAL GENERATORS
  generateDecimalQuestions: () => {
    const decimalQuestions = [
      { question: "2.5 + 1.3 = ?", answer: 3.8 },
      { question: "4.7 + 2.2 = ?", answer: 6.9 },
      { question: "3.6 + 1.4 = ?", answer: 5.0 },
      { question: "5.8 + 2.1 = ?", answer: 7.9 },
      { question: "1.9 + 3.5 = ?", answer: 5.4 },
      { question: "6.4 - 2.3 = ?", answer: 4.1 },
      { question: "8.7 - 3.5 = ?", answer: 5.2 },
      { question: "7.2 - 1.6 = ?", answer: 5.6 },
      { question: "9.1 - 4.4 = ?", answer: 4.7 },
      { question: "5.5 - 2.8 = ?", answer: 2.7 }
    ];
    return decimalQuestions.map(q => ({ ...q, type: 'decimals' }));
  },

  // PERCENTAGE GENERATORS
  generatePercentageQuestions: () => {
    const percentageQuestions = [
      { question: "What is 50% of 20?", answer: 10 },
      { question: "What is 25% of 16?", answer: 4 },
      { question: "What is 10% of 30?", answer: 3 },
      { question: "What is 50% of 14?", answer: 7 },
      { question: "What is 25% of 12?", answer: 3 },
      { question: "What is 10% of 50?", answer: 5 },
      { question: "What is 50% of 18?", answer: 9 },
      { question: "What is 25% of 20?", answer: 5 },
      { question: "What is 10% of 40?", answer: 4 },
      { question: "What is 75% of 8?", answer: 6 }
    ];
    return percentageQuestions.map(q => ({ ...q, type: 'percentage' }));
  },

  generatePercentageOfQuestions: () => {
    const percentageOfQuestions = [
      { question: "What is 20% of 25?", answer: 5 },
      { question: "What is 30% of 20?", answer: 6 },
      { question: "What is 40% of 15?", answer: 6 },
      { question: "What is 60% of 10?", answer: 6 },
      { question: "What is 80% of 15?", answer: 12 },
      { question: "What is 70% of 20?", answer: 14 },
      { question: "What is 90% of 10?", answer: 9 },
      { question: "What is 35% of 20?", answer: 7 },
      { question: "What is 45% of 20?", answer: 9 },
      { question: "What is 65% of 20?", answer: 13 }
    ];
    return percentageOfQuestions.map(q => ({ ...q, type: 'percentage-of' }));
  },

  // MENTAL MATH GENERATORS
  generateMentalMathQuestions: () => {
    const mentalQuestions = [
      { question: "47 + 38 (use rounding)", answer: "85 (round 47 to 50, add 38 = 88, subtract 3)" },
      { question: "83 - 29 (use rounding)", answer: "54 (round 29 to 30, subtract from 83 = 53, add 1)" },
      { question: "25 × 4 (use doubling)", answer: "100 (25 × 2 = 50, then double = 100)" },
      { question: "16 × 5 (use halving and × 10)", answer: "80 (16 ÷ 2 = 8, then 8 × 10 = 80)" },
      { question: "99 + 67 (use compensation)", answer: "166 (100 + 67 = 167, subtract 1)" },
      { question: "74 - 19 (use compensation)", answer: "55 (74 - 20 = 54, add 1)" },
      { question: "35 + 28 (break apart)", answer: "63 (30 + 20 = 50, 5 + 8 = 13, total = 63)" },
      { question: "62 - 27 (break apart)", answer: "35 (60 - 20 = 40, 2 - 7 = -5, total = 35)" },
      { question: "24 × 5 (use × 10 ÷ 2)", answer: "120 (24 × 10 = 240, ÷ 2 = 120)" },
      { question: "18 × 9 (use × 10 - original)", answer: "162 (18 × 10 = 180, - 18 = 162)" }
    ];
    return mentalQuestions.map(q => ({ ...q, type: 'mental-math' }));
  },

  // WORD PROBLEM GENERATORS
  generateWordProblemQuestions: () => {
    const wordProblems = [
      { 
        question: "Sarah has 156 stickers. She gives 47 to her brother. How many stickers does she have left?", 
        answer: "109 stickers" 
      },
      { 
        question: "A school has 234 students. 89 are boys. How many are girls?", 
        answer: "145 girls" 
      },
      { 
        question: "Tom buys 3 packs of cards with 24 cards in each pack. How many cards does he have in total?", 
        answer: "72 cards" 
      },
      { 
        question: "A bakery makes 144 cupcakes. They put them in boxes of 12. How many boxes do they need?", 
        answer: "12 boxes" 
      },
      { 
        question: "Emma saves $15 each week. How much will she save in 8 weeks?", 
        answer: "$120" 
      },
      { 
        question: "A cinema has 6 rows with 18 seats in each row. How many seats are there in total?", 
        answer: "108 seats" 
      },
      { 
        question: "Jake has 96 marbles. He shares them equally among 8 friends. How many marbles does each friend get?", 
        answer: "12 marbles" 
      },
      { 
        question: "A library has 567 books. They buy 238 more books. How many books do they have now?", 
        answer: "805 books" 
      },
      { 
        question: "Lisa has $45. She spends $28 on a game. How much money does she have left?", 
        answer: "$17" 
      },
      { 
        question: "A factory produces 125 toys per hour. How many toys will they produce in 4 hours?", 
        answer: "500 toys" 
      }
    ];
    return wordProblems.map(q => ({ ...q, type: 'word-problems' }));
  },

  // COLUMN ADDITION/SUBTRACTION GENERATORS
  generateColumnAdditionQuestions: () => {
    const columnQuestions = [
      { question: "  234\n+ 156\n-----", answer: "390" },
      { question: "  187\n+ 245\n-----", answer: "432" },
      { question: "  349\n+ 178\n-----", answer: "527" },
      { question: "  256\n+ 367\n-----", answer: "623" },
      { question: "  189\n+ 234\n-----", answer: "423" },
      { question: "  345\n+ 289\n-----", answer: "634" },
      { question: "  278\n+ 156\n-----", answer: "434" },
      { question: "  167\n+ 298\n-----", answer: "465" },
      { question: "  389\n+ 234\n-----", answer: "623" },
      { question: "  456\n+ 178\n-----", answer: "634" }
    ];
    return columnQuestions.map(q => ({ ...q, type: 'column-addition' }));
  },

  generateColumnSubtractionQuestions: () => {
    const columnQuestions = [
      { question: "  456\n- 234\n-----", answer: "222" },
      { question: "  578\n- 189\n-----", answer: "389" },
      { question: "  634\n- 267\n-----", answer: "367" },
      { question: "  723\n- 156\n-----", answer: "567" },
      { question: "  845\n- 278\n-----", answer: "567" },
      { question: "  567\n- 189\n-----", answer: "378" },
      { question: "  689\n- 234\n-----", answer: "455" },
      { question: "  734\n- 267\n-----", answer: "467" },
      { question: "  856\n- 189\n-----", answer: "667" },
      { question: "  623\n- 156\n-----", answer: "467" }
    ];
    return columnQuestions.map(q => ({ ...q, type: 'column-subtraction' }));
  },

  // Default generator for any missing subcategories
  generateSampleQuestions: (subcategory) => {
    return Array.from({length: 10}, (_, i) => ({
      question: `${subcategory} question ${i + 1}`,
      answer: `Answer ${i + 1}`,
      type: 'sample'
    }));
  }
};

// ===============================================
// GRADE LEVEL CONFIGURATION
// ===============================================
export const GRADE_LEVELS = {
  prep: {
    name: "Prep",
    description: "Foundation mathematics",
    categories: {
      counting: {
        name: "Counting",
        icon: "🔢",
        subcategories: {
          "count-to-10": { name: "Count to 10", generator: "generateCountingQuestions" },
          "count-to-20": { name: "Count to 20", generator: "generateCountingQuestions" },
          "one-more": { name: "One More", generator: "generateOneMoreQuestions" },
          "one-less": { name: "One Less", generator: "generateOneLessQuestions" }
        }
      },
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-to-5": { name: "Add to 5", generator: "generateAdditionQuestions" },
          "add-to-10": { name: "Add to 10", generator: "generateAdditionQuestions" },
          "doubles": { name: "Doubles", generator: "generateDoublesQuestions" }
        }
      },
      shapes: {
        name: "Shapes",
        icon: "🔷",
        subcategories: {
          "basic-shapes": { name: "Basic Shapes", generator: "generateShapeQuestions" },
          "shape-properties": { name: "Shape Properties", generator: "generateShapePropertiesQuestions" }
        }
      }
    }
  },
  grade1: {
    name: "Grade 1",
    description: "Year 1 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "bonds-to-10": { name: "Bonds to Make 10", generator: "generateBondsQuestions" },
          "add-to-20": { name: "Add to 20", generator: "generateAdditionQuestions" },
          "one-more": { name: "One More", generator: "generateOneMoreQuestions" },
          "missing-numbers": { name: "Missing Numbers", generator: "generateMissingNumberQuestions" }
        }
      },
      subtraction: {
        name: "Subtraction",
        icon: "➖",
        subcategories: {
          "subtract-from-10": { name: "Subtract from 10", generator: "generateSubtractionQuestions" },
          "subtract-from-20": { name: "Subtract from 20", generator: "generateSubtractionQuestions" },
          "one-less": { name: "One Less", generator: "generateOneLessQuestions" }
        }
      },
      ordering: {
        name: "Ordering",
        icon: "📊",
        subcategories: {
          "order-to-20": { name: "Order to 20", generator: "generateOrderingQuestions" },
          "before-after": { name: "Before and After", generator: "generateBeforeAfterQuestions" }
        }
      }
    }
  },
  grade2: {
    name: "Grade 2",
    description: "Year 2 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-to-50": { name: "Add to 50", generator: "generateAdditionQuestions" },
          "add-to-100": { name: "Add to 100", generator: "generateAdditionQuestions" },
          "doubles-near": { name: "Doubles and Near Doubles", generator: "generateDoublesQuestions" },
          "three-numbers": { name: "Three Numbers", generator: "generateThreeNumberQuestions" }
        }
      },
      subtraction: {
        name: "Subtraction",
        icon: "➖",
        subcategories: {
          "subtract-to-50": { name: "Subtract to 50", generator: "generateSubtractionQuestions" },
          "subtract-to-100": { name: "Subtract to 100", generator: "generateSubtractionQuestions" },
          "difference": { name: "Find the Difference", generator: "generateDifferenceQuestions" }
        }
      },
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "times-2": { name: "2 Times Table", generator: "generateTimesTableQuestions" },
          "times-5": { name: "5 Times Table", generator: "generateTimesTableQuestions" },
          "times-10": { name: "10 Times Table", generator: "generateTimesTableQuestions" }
        }
      }
    }
  },
  grade3: {
    name: "Grade 3",
    description: "Year 3 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-hundreds": { name: "Add Hundreds", generator: "generateAdditionQuestions" },
          "mental-add": { name: "Mental Addition", generator: "generateMentalMathQuestions" },
          "column-add": { name: "Column Addition", generator: "generateColumnAdditionQuestions" }
        }
      },
      subtraction: {
        name: "Subtraction",
        icon: "➖",
        subcategories: {
          "subtract-hundreds": { name: "Subtract Hundreds", generator: "generateSubtractionQuestions" },
          "mental-subtract": { name: "Mental Subtraction", generator: "generateMentalMathQuestions" },
          "column-subtract": { name: "Column Subtraction", generator: "generateColumnSubtractionQuestions" }
        }
      },
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "times-3": { name: "3 Times Table", generator: "generateTimesTableQuestions" },
          "times-4": { name: "4 Times Table", generator: "generateTimesTableQuestions" },
          "times-6": { name: "6 Times Table", generator: "generateTimesTableQuestions" },
          "times-8": { name: "8 Times Table", generator: "generateTimesTableQuestions" },
          "mixed-tables": { name: "Mixed Tables", generator: "generateMixedTablesQuestions" }
        }
      },
      division: {
        name: "Division",
        icon: "➗",
        subcategories: {
          "divide-by-2": { name: "Divide by 2", generator: "generateDivisionQuestions" },
          "divide-by-5": { name: "Divide by 5", generator: "generateDivisionQuestions" },
          "divide-by-10": { name: "Divide by 10", generator: "generateDivisionQuestions" }
        }
      }
    }
  },
  grade4: {
    name: "Grade 4",
    description: "Year 4 mathematics",
    categories: {
      addition: {
        name: "Addition",
        icon: "➕",
        subcategories: {
          "add-thousands": { name: "Add Thousands", generator: "generateAdditionQuestions" },
          "decimal-add": { name: "Decimal Addition", generator: "generateDecimalQuestions" },
          "word-problems": { name: "Word Problems", generator: "generateWordProblemQuestions" }
        }
      },
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "times-7": { name: "7 Times Table", generator: "generateTimesTableQuestions" },
          "times-9": { name: "9 Times Table", generator: "generateTimesTableQuestions" },
          "times-11": { name: "11 Times Table", generator: "generateTimesTableQuestions" },
          "times-12": { name: "12 Times Table", generator: "generateTimesTableQuestions" },
          "all-tables": { name: "All Tables", generator: "generateMixedTablesQuestions" }
        }
      },
      fractions: {
        name: "Fractions",
        icon: "½",
        subcategories: {
          "simple-fractions": { name: "Simple Fractions", generator: "generateFractionQuestions" },
          "equivalent": { name: "Equivalent Fractions", generator: "generateEquivalentFractionQuestions" },
          "compare-fractions": { name: "Compare Fractions", generator: "generateCompareFractionQuestions" }
        }
      }
    }
  },
  grade5: {
    name: "Grade 5",
    description: "Year 5 mathematics",
    categories: {
      multiplication: {
        name: "Multiplication",
        icon: "✖️",
        subcategories: {
          "multiply-decimals": { name: "Multiply Decimals", generator: "generateDecimalQuestions" },
          "large-numbers": { name: "Large Numbers", generator: "generateAdditionQuestions" },
          "mixed-tables": { name: "Mixed Tables", generator: "generateMixedTablesQuestions" }
        }
      },
      division: {
        name: "Division",
        icon: "➗",
        subcategories: {
          "long-division": { name: "Long Division", generator: "generateLongDivisionQuestions" },
          "divide-decimals": { name: "Divide Decimals", generator: "generateDecimalQuestions" },
          "remainders": { name: "Remainders", generator: "generateRemainderQuestions" }
        }
      },
      fractions: {
        name: "Fractions",
        icon: "½",
        subcategories: {
          "add-fractions": { name: "Add Fractions", generator: "generateFractionQuestions" },
          "subtract-fractions": { name: "Subtract Fractions", generator: "generateFractionQuestions" },
          "equivalent": { name: "Equivalent Fractions", generator: "generateEquivalentFractionQuestions" }
        }
      },
      percentages: {
        name: "Percentages",
        icon: "%",
        subcategories: {
          "simple-percentages": { name: "Simple Percentages", generator: "generatePercentageQuestions" },
          "percentage-of": { name: "Percentage Of", generator: "generatePercentageOfQuestions" }
        }
      }
    }
  },
  grade6: {
    name: "Grade 6",
    description: "Year 6 mathematics",
    categories: {
      decimals: {
        name: "Decimals",
        icon: ".",
        subcategories: {
          "decimal-operations": { name: "Decimal Operations", generator: "generateDecimalQuestions" },
          "rounding-decimals": { name: "Rounding Decimals", generator: "generateDecimalQuestions" },
          "decimal-word-problems": { name: "Decimal Word Problems", generator: "generateWordProblemQuestions" }
        }
      },
      fractions: {
        name: "Fractions",
        icon: "½",
        subcategories: {
          "multiply-fractions": { name: "Multiply Fractions", generator: "generateFractionQuestions" },
          "divide-fractions": { name: "Divide Fractions", generator: "generateFractionQuestions" },
          "equivalent": { name: "Equivalent Fractions", generator: "generateEquivalentFractionQuestions" }
        }
      },
      percentages: {
        name: "Percentages",
        icon: "%",
        subcategories: {
          "percentage-increase": { name: "Percentage Increase", generator: "generatePercentageOfQuestions" },
          "percentage-decrease": { name: "Percentage Decrease", generator: "generatePercentageOfQuestions" },
          "percentage-problems": { name: "Percentage Problems", generator: "generateWordProblemQuestions" }
        }
      },
      algebra: {
        name: "Algebra",
        icon: "x",
        subcategories: {
          "simple-equations": { name: "Simple Equations", generator: "generateMissingNumberQuestions" },
          "substitution": { name: "Substitution", generator: "generateMissingNumberQuestions" }
        }
      }
    }
  }
};

// Helper function to get questions for a specific subcategory
export const getQuestionsForSubcategory = (gradeKey, categoryKey, subcategoryKey) => {
  const grade = GRADE_LEVELS[gradeKey];
  if (!grade) return [];
  
  const category = grade.categories[categoryKey];
  if (!category) return [];
  
  const subcategory = category.subcategories[subcategoryKey];
  if (!subcategory) return [];
  
  const generator = questionGenerators[subcategory.generator];
  if (!generator) return questionGenerators.generateSampleQuestions(subcategoryKey);
  
  return generator(subcategoryKey);
};