const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const normalizeAnswer = (answer) => `${answer}`.trim().toLowerCase();

const buildUniqueFacts = (facts) => {
  const seen = new Set();
  const unique = [];

  facts.forEach((fact) => {
    const key = normalizeAnswer(fact.answer);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push({
        question: fact.question,
        answer: `${fact.answer}`
      });
    }
  });

  return unique;
};

const makeFactSet = (facts, limit = 64) => shuffle(buildUniqueFacts(facts)).slice(0, limit);

const createTimesTableFacts = () => {
  const facts = [];
  for (let a = 2; a <= 12; a += 1) {
    for (let b = 2; b <= 12; b += 1) {
      const product = a * b;
      facts.push({
        question: `${a} × ${b}`,
        answer: product
      });
    }
  }
  return makeFactSet(facts);
};

const createAdditionFacts = () => {
  const facts = [];
  for (let a = 12; a <= 48; a += 1) {
    for (let b = 6; b <= 36; b += 1) {
      const sum = a + b;
      if (sum <= 99) {
        facts.push({
          question: `${a} + ${b}`,
          answer: sum
        });
      }
    }
  }
  return makeFactSet(facts);
};

const createSubtractionFacts = () => {
  const facts = [];
  for (let a = 30; a <= 99; a += 1) {
    for (let b = 4; b < a; b += 1) {
      const diff = a - b;
      if (diff >= 8 && diff <= 90) {
        facts.push({
          question: `${a} − ${b}`,
          answer: diff
        });
      }
    }
  }
  return makeFactSet(facts);
};

const createDivisionFacts = () => {
  const facts = [];
  for (let divisor = 2; divisor <= 12; divisor += 1) {
    for (let quotient = 2; quotient <= 60; quotient += 1) {
      const dividend = divisor * quotient;
      if (dividend <= 360) {
        facts.push({
          question: `${dividend} ÷ ${divisor}`,
          answer: quotient
        });
      }
    }
  }
  return makeFactSet(facts);
};
const FRACTION_FACTS = makeFactSet([
  { question: 'Simplify 12/24', answer: '1/2' },
  { question: 'Simplify 6/18', answer: '1/3' },
  { question: 'Simplify 18/27', answer: '2/3' },
  { question: 'Simplify 9/12', answer: '3/4' },
  { question: 'Simplify 6/24', answer: '1/4' },
  { question: 'Simplify 16/20', answer: '4/5' },
  { question: 'Simplify 8/20', answer: '2/5' },
  { question: 'Simplify 9/15', answer: '3/5' },
  { question: 'Simplify 6/30', answer: '1/5' },
  { question: 'Simplify 25/30', answer: '5/6' },
  { question: 'Simplify 15/24', answer: '5/8' },
  { question: 'Simplify 9/24', answer: '3/8' },
  { question: 'Simplify 21/24', answer: '7/8' },
  { question: 'Simplify 10/24', answer: '5/12' },
  { question: 'Simplify 14/24', answer: '7/12' },
  { question: 'Simplify 22/24', answer: '11/12' },
  { question: 'Simplify 8/28', answer: '2/7' },
  { question: 'Simplify 9/21', answer: '3/7' },
  { question: 'Simplify 12/21', answer: '4/7' },
  { question: 'Simplify 15/21', answer: '5/7' },
  { question: 'Simplify 18/21', answer: '6/7' },
  { question: 'Simplify 8/36', answer: '2/9' },
  { question: 'Simplify 16/36', answer: '4/9' },
  { question: 'Simplify 20/36', answer: '5/9' },
  { question: 'Simplify 28/36', answer: '7/9' },
  { question: 'Simplify 32/36', answer: '8/9' },
  { question: 'Simplify 9/30', answer: '3/10' },
  { question: 'Simplify 21/30', answer: '7/10' },
  { question: 'Simplify 27/30', answer: '9/10' },
  { question: 'Convert 150% to a fraction', answer: '3/2' },
  { question: 'Convert 1.25 to an improper fraction', answer: '5/4' },
  { question: 'Write 2 1/2 as an improper fraction', answer: '5/2' },
  { question: 'Write 1 3/4 as an improper fraction', answer: '7/4' },
  { question: 'Convert 225% to a fraction', answer: '9/4' },
  { question: 'Write 3 1/3 as an improper fraction', answer: '10/3' },
  { question: 'Write 1 3/8 as an improper fraction', answer: '11/8' },
  { question: 'Write 2 2/3 as an improper fraction', answer: '8/3' },
  { question: 'Write 2 1/6 as an improper fraction', answer: '13/6' },
  { question: 'Simplify 18/15', answer: '6/5' },
  { question: 'Simplify 48/30', answer: '8/5' },
  { question: 'Write 3 1/2 as an improper fraction', answer: '7/2' },
]);
const DECIMAL_FACTS = makeFactSet([
  { question: '0.6 + 0.2', answer: '0.8' },
  { question: '0.5 + 0.45', answer: '0.95' },
  { question: '0.7 + 0.5', answer: '1.2' },
  { question: '2.0 - 1.3', answer: '0.7' },
  { question: '0.9 + 0.45', answer: '1.35' },
  { question: '0.7 × 3', answer: '2.1' },
  { question: '1.4 + 2.1', answer: '3.5' },
  { question: '5.5 ÷ 2', answer: '2.75' },
  { question: '0.6 - 0.3', answer: '0.3' },
  { question: '0.2 × 0.2', answer: '0.04' },
  { question: '1.5 ÷ 2.5', answer: '0.6' },
  { question: '0.9 - 0.45', answer: '0.45' },
  { question: '0.3 × 0.6', answer: '0.18' },
  { question: '0.9 × 0.3', answer: '0.27' },
  { question: '0.5 + 1.0', answer: '1.5' },
  { question: '0.1 × 0.2', answer: '0.02' },
  { question: '0.99 ÷ 3', answer: '0.33' },
  { question: '0.25 ÷ 2', answer: '0.125' },
  { question: '0.4 + 0.5', answer: '0.9' },
  { question: '1.1 - 0.55', answer: '0.55' },
  { question: '5.0 ÷ 2', answer: '2.5' },
  { question: '7.5 ÷ 2', answer: '3.75' },
  { question: '2.1 ÷ 2', answer: '1.05' },
  { question: '1.32 ÷ 2', answer: '0.66' },
  { question: '0.9 + 0.9', answer: '1.8' },
  { question: '4.5 ÷ 2', answer: '2.25' },
  { question: '0.2 × 0.8', answer: '0.16' },
  { question: '0.6 × 0.8', answer: '0.48' },
  { question: '0.7 + 1.05', answer: '1.75' },
  { question: '1.2 × 2', answer: '2.4' },
  { question: '0.1 - 0.03', answer: '0.07' },
  { question: '0.12 + 0.12', answer: '0.24' },
  { question: '0.75 + 0.375', answer: '1.125' },
  { question: '1.33 + 1.32', answer: '2.65' },
]);
const GEOMETRY_FACTS = makeFactSet([
  { question: 'An angle less than 90°', answer: 'Acute angle' },
  { question: 'An angle exactly 90°', answer: 'Right angle' },
  { question: 'An angle between 90° and 180°', answer: 'Obtuse angle' },
  { question: 'Lines that never intersect', answer: 'Parallel lines' },
  { question: 'Lines that meet at 90°', answer: 'Perpendicular lines' },
  { question: 'Triangle with all equal sides', answer: 'Equilateral triangle' },
  { question: 'Triangle with two equal sides', answer: 'Isosceles triangle' },
  { question: 'Triangle with no equal sides', answer: 'Scalene triangle' },
  { question: 'Distance from center to circle edge', answer: 'Radius' },
  { question: 'Line through the center of a circle', answer: 'Diameter' },
  { question: 'Distance around a circle', answer: 'Circumference' },
  { question: 'Number of square units inside a shape', answer: 'Area' },
  { question: 'Space occupied by a 3D object', answer: 'Volume' },
  { question: 'A many-sided closed figure', answer: 'Polygon' },
  { question: 'A five-sided polygon', answer: 'Pentagon' },
  { question: 'A six-sided polygon', answer: 'Hexagon' },
  { question: 'An eight-sided polygon', answer: 'Octagon' },
  { question: 'Corner of a shape', answer: 'Vertex' },
  { question: 'Straight path with one endpoint', answer: 'Ray' },
  { question: 'Segment joining two points on a circle', answer: 'Chord' },
  { question: 'Longest side of a right triangle', answer: 'Hypotenuse' },
  { question: 'Four-sided polygon', answer: 'Quadrilateral' },
  { question: 'Opposite sides parallel and equal', answer: 'Parallelogram' },
  { question: '3D shape with circular base and point', answer: 'Cone' },
  { question: '3D shape with two circular bases', answer: 'Cylinder' },
  { question: '3D shape with rectangular faces', answer: 'Rectangular prism' },
  { question: '3D shape with triangle faces meeting at a point', answer: 'Pyramid' },
  { question: 'Flat surface on a 3D shape', answer: 'Face' },
  { question: 'Line where two faces meet', answer: 'Edge' },
  { question: 'Figure that folds onto itself evenly', answer: 'Line of symmetry' },
  { question: 'Shape with all points equal distance from center', answer: 'Circle' },
  { question: 'Part of a circle between two radii', answer: 'Sector' },
]);
const MEASUREMENT_FACTS = makeFactSet([
  { question: '1 kilometer equals how many meters?', answer: '1000 meters' },
  { question: 'How many minutes are in an hour?', answer: '60 minutes' },
  { question: 'How many inches are in a foot?', answer: '12 inches' },
  { question: 'How many feet are in a yard?', answer: '3 feet' },
  { question: 'How many centimeters are in a meter?', answer: '100 centimeters' },
  { question: 'How many milliliters are in a liter?', answer: '1000 milliliters' },
  { question: 'Measure of a right angle', answer: '90 degrees' },
  { question: 'Measure of a full rotation', answer: '360 degrees' },
  { question: 'How many hours are in a day?', answer: '24 hours' },
  { question: 'How many days are in a week?', answer: '7 days' },
  { question: 'How many weeks are in a year?', answer: '52 weeks' },
  { question: 'How many grams are in a kilogram?', answer: '1000 grams' },
  { question: 'Freezing point of water (Celsius)', answer: '0 °C' },
  { question: 'Freezing point of water (Fahrenheit)', answer: '32 °F' },
  { question: 'Boiling point of water (Celsius)', answer: '100 °C' },
  { question: 'Boiling point of water (Fahrenheit)', answer: '212 °F' },
  { question: 'How many feet are in a mile?', answer: '5280 feet' },
  { question: 'How many ounces are in a pound?', answer: '16 ounces' },
  { question: 'How many pounds are in a ton?', answer: '2000 pounds' },
  { question: 'How many cups are in a gallon?', answer: '16 cups' },
  { question: 'How many pints are in a gallon?', answer: '8 pints' },
  { question: 'How many quarts are in a gallon?', answer: '4 quarts' },
  { question: 'Measure of a straight line angle', answer: '180 degrees' },
  { question: 'How many seconds are in a minute?', answer: '60 seconds' },
  { question: 'How many meters are in a centimeter?', answer: '0.01 meters' },
  { question: 'How many millimeters are in a meter?', answer: '1000 millimeters' },
  { question: 'One yard equals how many meters (approx)?', answer: '0.914 meters' },
  { question: 'How many liters are in a kiloliter?', answer: '1000 liters' },
  { question: 'How many centimeters are in a kilometer?', answer: '100000 centimeters' },
  { question: 'How many days are in a leap year?', answer: '366 days' },
  { question: 'How many minutes are in a day?', answer: '1440 minutes' },
  { question: 'How many seconds are in an hour?', answer: '3600 seconds' },
  { question: 'How many meters are in a mile (approx)?', answer: '1609 meters' },
  { question: 'How many milligrams are in a gram?', answer: '1000 milligrams' },
]);
const MATH_VOCAB_FACTS = makeFactSet([
  { question: 'A number with only two factors, 1 and itself', answer: 'Prime number' },
  { question: 'A number with more than two factors', answer: 'Composite number' },
  { question: 'A whole number divisible by 2', answer: 'Even number' },
  { question: 'A whole number not divisible by 2', answer: 'Odd number' },
  { question: 'A number that divides another evenly', answer: 'Factor' },
  { question: 'The result of multiplication', answer: 'Product' },
  { question: 'The result of addition', answer: 'Sum' },
  { question: 'The result of subtraction', answer: 'Difference' },
  { question: 'The result of division', answer: 'Quotient' },
  { question: 'Number being divided', answer: 'Dividend' },
  { question: 'Number you divide by', answer: 'Divisor' },
  { question: 'Part left over after division', answer: 'Remainder' },
  { question: 'A number written with a power', answer: 'Exponent' },
  { question: 'Number being raised to a power', answer: 'Base' },
  { question: 'Number multiplied by itself', answer: 'Square number' },
  { question: 'Number multiplied by itself twice', answer: 'Cube number' },
  { question: 'Average of a set of numbers', answer: 'Mean' },
  { question: 'Middle value in an ordered set', answer: 'Median' },
  { question: 'Number occurring most often', answer: 'Mode' },
  { question: 'Difference between highest and lowest', answer: 'Range' },
  { question: 'Chance of an event happening', answer: 'Probability' },
  { question: 'Comparison of two quantities', answer: 'Ratio' },
  { question: 'Equation showing two ratios equal', answer: 'Proportion' },
  { question: 'Letter representing an unknown', answer: 'Variable' },
  { question: 'Number multiplying a variable', answer: 'Coefficient' },
  { question: 'A value that does not change', answer: 'Constant' },
  { question: 'Numbers, variables, and operations together', answer: 'Expression' },
  { question: 'Statement that two expressions are equal', answer: 'Equation' },
  { question: 'Statement comparing values with <, >, or ≤', answer: 'Inequality' },
  { question: 'Part of an expression separated by + or −', answer: 'Term' },
  { question: 'Top number of a fraction', answer: 'Numerator' },
  { question: 'Bottom number of a fraction', answer: 'Denominator' },
  { question: 'Whole number with a fraction', answer: 'Mixed number' },
  { question: 'Fraction with numerator larger than denominator', answer: 'Improper fraction' },
  { question: 'Per hundred', answer: 'Percent' },
  { question: 'Number without fractions or decimals', answer: 'Integer' },
  { question: 'Set of all non-negative integers', answer: 'Whole number' },
  { question: 'Counting numbers starting at 1', answer: 'Natural number' },
  { question: 'Distance from zero on a number line', answer: 'Absolute value' },
  { question: 'Quick reasonable answer', answer: 'Estimate' },
]);
const PATTERN_FACTS = makeFactSet([
  { question: 'Sequence: 5, 10, 15, 20, ?', answer: '25' },
  { question: 'Sequence: 3, 6, 12, 24, ?', answer: '48' },
  { question: 'Sequence: 2, 5, 10, 17, ?', answer: '26' },
  { question: 'Sequence: 4, 9, 16, 25, ?', answer: '36' },
  { question: 'Sequence: 8, 6, 4, 2, ?', answer: '0' },
  { question: 'Sequence: 7, 14, 28, 56, ?', answer: '112' },
  { question: 'Sequence: 1, 3, 6, 10, ?', answer: '15' },
  { question: 'Sequence: 11, 22, 33, 44, ?', answer: '55' },
  { question: 'Sequence: 100, 90, 80, 70, ?', answer: '60' },
  { question: 'Sequence: 2, 4, 8, 16, ?', answer: '32' },
  { question: 'Sequence: 81, 72, 63, 54, ?', answer: '45' },
  { question: 'Sequence: 13, 17, 21, 25, ?', answer: '29' },
  { question: 'Sequence: 9, 16, 23, 30, ?', answer: '37' },
  { question: 'Sequence: 6, 13, 20, 27, ?', answer: '34' },
  { question: 'Sequence: 50, 45, 40, 35, ?', answer: '30' },
  { question: 'Sequence: 1, 2, 4, 7, 11, ?', answer: '16' },
  { question: 'Sequence: 10, 13, 16, 19, ?', answer: '22' },
  { question: 'Sequence: 90, 81, 72, 63, ?', answer: '54' },
  { question: 'Sequence: 4, 8, 12, 16, ?', answer: '20' },
  { question: 'Sequence: 1, 8, 27, 64, ?', answer: '125' },
  { question: 'Sequence: 0, 1, 1, 2, 3, 5, ?', answer: '8' },
  { question: 'Sequence: 3, 7, 15, 31, ?', answer: '63' },
  { question: 'Sequence: 5, 9, 13, 17, ?', answer: '21' },
  { question: 'Sequence: 2, 12, 30, 56, ?', answer: '90' },
  { question: 'Sequence: 4, 18, 48, 100, ?', answer: '180' },
]);
const WORD_PROBLEM_FACTS = makeFactSet([
  { question: 'Sarah has 12 apples and buys 7 more. How many apples now?', answer: '19' },
  { question: '24 students split evenly into 4 teams. Students per team?', answer: '6' },
  { question: 'A bus has 48 seats and 35 are filled. How many seats left?', answer: '13' },
  { question: 'A baker bakes 5 trays with 8 cupcakes each. Total cupcakes?', answer: '40' },
  { question: 'A pool fills at 6 liters per minute for 9 minutes. Liters added?', answer: '54' },
  { question: 'A book has 12 chapters with 18 pages each. Total pages?', answer: '216' },
  { question: 'Runner completes 3 laps of a 400m track. Distance run?', answer: '1200' },
  { question: 'A pizza has 8 slices and 3 are eaten. Slices left?', answer: '5' },
  { question: 'Box holds 7 pencils and a teacher fills 2 boxes. Total pencils?', answer: '14' },
  { question: 'There are 4 rows of 8 chairs. Total chairs?', answer: '32' },
  { question: 'A student saves $9 each week for 3 weeks. Total saved?', answer: '27' },
  { question: 'You read 6 pages per night for 3 nights. Pages read?', answer: '18' },
  { question: 'A gardener plants 7 rows with 9 flowers each. Flowers planted?', answer: '63' },
  { question: 'A game awards 15 points per level for 6 levels. Points earned?', answer: '90' },
  { question: 'A teacher hands out 8 markers to each of 3 tables. Total markers?', answer: '24' },
  { question: 'A video is 9 minutes long. You watch it 9 times. Minutes watched?', answer: '81' },
  { question: 'A farmer collects 5 eggs each day for 7 days. Eggs collected?', answer: '35' },
  { question: 'A class sells 14 tickets at $3 each. Money earned?', answer: '42' },
  { question: 'A baker stacks 4 cakes with 7 layers each. Layers total?', answer: '28' },
  { question: 'You have 11 marbles and your friend gives you 11 more. Total marbles?', answer: '22' },
  { question: 'A music teacher buys 6 packs of strings with 8 strings each. Strings total?', answer: '48' },
  { question: 'A coach orders 9 boxes of balls with 4 balls each. Balls total?', answer: '36' },
  { question: 'A store has 20 notebooks and sells 3. How many remain?', answer: '17' },
  { question: 'A cyclist rides 15 km each day for 4 days. Distance traveled?', answer: '60' },
]);
const BINGO_CATEGORIES = {
  'times-tables': {
    name: 'Times Tables',
    icon: '✖️',
    color: 'from-indigo-500 to-sky-500',
    description: 'Quick-fire multiplication facts from 2× up to 12×.',
    questions: createTimesTableFacts(),
    type: 'math'
  },
  'addition-adventure': {
    name: 'Addition Adventure',
    icon: '➕',
    color: 'from-emerald-500 to-green-500',
    description: 'Double-digit addition challenges to warm up number fluency.',
    questions: createAdditionFacts(),
    type: 'math'
  },
  'subtraction-showdown': {
    name: 'Subtraction Showdown',
    icon: '➖',
    color: 'from-rose-500 to-orange-500',
    description: 'Sharpen regrouping skills with trickier subtraction puzzles.',
    questions: createSubtractionFacts(),
    type: 'math'
  },
  'division-duel': {
    name: 'Division Duel',
    icon: '➗',
    color: 'from-purple-500 to-pink-500',
    description: 'Battle through quotients with clean division facts and remainders.',
    questions: createDivisionFacts(),
    type: 'math'
  },
  'fraction-frenzy': {
    name: 'Fraction Frenzy',
    icon: '🧮',
    color: 'from-amber-500 to-rose-500',
    description: 'Simplify, convert, and conquer fraction challenges.',
    questions: FRACTION_FACTS,
    type: 'math'
  },
  'decimal-dash': {
    name: 'Decimal Dash',
    icon: '💠',
    color: 'from-cyan-500 to-blue-500',
    description: 'Race through decimal operations and comparisons.',
    questions: DECIMAL_FACTS,
    type: 'math'
  },
  'geometry-quest': {
    name: 'Geometry Quest',
    icon: '📐',
    color: 'from-fuchsia-500 to-indigo-500',
    description: 'Identify shapes, angles, and spatial vocabulary.',
    questions: GEOMETRY_FACTS,
    type: 'math'
  },
  'measurement-mania': {
    name: 'Measurement Mania',
    icon: '📏',
    color: 'from-teal-500 to-emerald-500',
    description: 'Convert units and estimate using real-world measures.',
    questions: MEASUREMENT_FACTS,
    type: 'math'
  },
  'math-vocabulary': {
    name: 'Math Vocabulary',
    icon: '🧠',
    color: 'from-blue-600 to-indigo-600',
    description: 'Master the language behind every math lesson.',
    questions: MATH_VOCAB_FACTS,
    type: 'math'
  },
  'pattern-power': {
    name: 'Pattern Power',
    icon: '🔁',
    color: 'from-purple-500 to-violet-600',
    description: 'Spot the rule, predict the next value, and unlock number sense.',
    questions: PATTERN_FACTS,
    type: 'math'
  },
  'word-problems': {
    name: 'Word Problem Warriors',
    icon: '📚',
    color: 'from-orange-500 to-amber-500',
    description: 'Solve story problems that mix operations and reasoning.',
    questions: WORD_PROBLEM_FACTS,
    type: 'math'
  }
};

export const getBingoCategoryAnswers = (categoryKey) =>
  BINGO_CATEGORIES[categoryKey]?.questions.map((question) => question.answer) ?? [];

export const listBingoCategories = () =>
  Object.entries(BINGO_CATEGORIES).map(([key, value]) => ({ key, ...value }));

export default BINGO_CATEGORIES;
