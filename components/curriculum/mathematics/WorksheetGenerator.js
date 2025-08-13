// components/curriculum/mathematics/WorksheetGenerator.js
import React, { useState } from 'react';

const WorksheetGenerator = ({ showToast = () => {} }) => {
  // State for worksheet configuration
  const [selectedTopic, setSelectedTopic] = useState('addition');
  const [difficulty, setDifficulty] = useState('easy');
  const [numberOfProblems, setNumberOfProblems] = useState(20);
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [worksheetTitle, setWorksheetTitle] = useState('Math Practice Worksheet');
  const [generatedWorksheet, setGeneratedWorksheet] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Math topics configuration
  const mathTopics = {
    addition: {
      name: 'Addition',
      icon: '➕',
      difficulties: {
        easy: { name: 'Easy (1-20)', range: [1, 20], digits: 1 },
        medium: { name: 'Medium (1-100)', range: [1, 100], digits: 2 },
        hard: { name: 'Hard (1-1000)', range: [1, 1000], digits: 3 }
      }
    },
    subtraction: {
      name: 'Subtraction',
      icon: '➖',
      difficulties: {
        easy: { name: 'Easy (1-20)', range: [1, 20], digits: 1 },
        medium: { name: 'Medium (1-100)', range: [1, 100], digits: 2 },
        hard: { name: 'Hard (1-1000)', range: [1, 1000], digits: 3 }
      }
    },
    multiplication: {
      name: 'Multiplication',
      icon: '✖️',
      difficulties: {
        easy: { name: 'Times Tables (1-10)', range: [1, 10], digits: 1 },
        medium: { name: 'Medium (1-50)', range: [1, 50], digits: 2 },
        hard: { name: 'Hard (1-100)', range: [1, 100], digits: 2 }
      }
    },
    division: {
      name: 'Division',
      icon: '➗',
      difficulties: {
        easy: { name: 'Easy (÷1-10)', range: [1, 10], digits: 1 },
        medium: { name: 'Medium (÷1-50)', range: [1, 50], digits: 2 },
        hard: { name: 'Hard (÷1-100)', range: [1, 100], digits: 2 }
      }
    },
    fractions: {
      name: 'Fractions',
      icon: '½',
      difficulties: {
        easy: { name: 'Simple Fractions', range: [2, 10], digits: 1 },
        medium: { name: 'Mixed Operations', range: [2, 20], digits: 1 },
        hard: { name: 'Complex Fractions', range: [2, 50], digits: 2 }
      }
    },
    decimals: {
      name: 'Decimals',
      icon: '🔢',
      difficulties: {
        easy: { name: 'One Decimal Place', range: [1, 50], digits: 1 },
        medium: { name: 'Two Decimal Places', range: [1, 100], digits: 2 },
        hard: { name: 'Three Decimal Places', range: [1, 1000], digits: 3 }
      }
    },
    wordProblems: {
      name: 'Word Problems',
      icon: '📝',
      difficulties: {
        easy: { name: 'Simple Problems', range: [1, 20], digits: 1 },
        medium: { name: 'Multi-Step Problems', range: [1, 100], digits: 2 },
        hard: { name: 'Complex Problems', range: [1, 1000], digits: 3 }
      }
    }
  };

  // Generate random number within range
  const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // Generate fraction
  const generateFraction = (maxDenom) => {
    const denominator = randomInRange(2, maxDenom);
    const numerator = randomInRange(1, denominator - 1);
    return { numerator, denominator };
  };

  // Generate decimal
  const generateDecimal = (range, places) => {
    const whole = randomInRange(range[0], range[1]);
    const decimal = randomInRange(1, Math.pow(10, places) - 1);
    return parseFloat(`${whole}.${decimal.toString().padStart(places, '0')}`);
  };

  // Generate word problem templates
  const wordProblemTemplates = {
    easy: [
      (a, b) => `Sarah has ${a} apples. She buys ${b} more apples. How many apples does she have in total?`,
      (a, b) => `There are ${a} birds in a tree. ${b} more birds join them. How many birds are there now?`,
      (a, b) => `Tom has ${a} stickers. He gives away ${Math.min(a, b)} stickers. How many stickers does he have left?`
    ],
    medium: [
      (a, b) => `A school has ${a} students in Grade 3 and ${b} students in Grade 4. How many students are in both grades combined?`,
      (a, b) => `Emma saves $${a} each week. How much money will she have saved after ${b} weeks?`,
      (a, b) => `A recipe calls for ${a} cups of flour. If you want to make ${b} batches, how many cups of flour do you need?`
    ],
    hard: [
      (a, b) => `A store sells ${a} items per day. If each item costs $${b}, what is the total revenue for one day?`,
      (a, b) => `A factory produces ${a} widgets per hour. How many widgets will it produce in ${b} hours?`,
      (a, b) => `A garden has ${a} rows of plants with ${b} plants in each row. How many plants are there in total?`
    ]
  };

  // Generate problems based on topic and difficulty
  const generateProblems = () => {
    const topic = mathTopics[selectedTopic];
    const diffConfig = topic.difficulties[difficulty];
    const problems = [];

    for (let i = 0; i < numberOfProblems; i++) {
      let problem, answer;

      switch (selectedTopic) {
        case 'addition':
          const addA = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          const addB = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          problem = `${addA} + ${addB} = ____`;
          answer = addA + addB;
          break;

        case 'subtraction':
          const subB = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          const subA = randomInRange(subB, diffConfig.range[1] + subB); // Ensure positive result
          problem = `${subA} - ${subB} = ____`;
          answer = subA - subB;
          break;

        case 'multiplication':
          const mulA = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          const mulB = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          problem = `${mulA} × ${mulB} = ____`;
          answer = mulA * mulB;
          break;

        case 'division':
          const divB = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          const divAnswer = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          const divA = divB * divAnswer;
          problem = `${divA} ÷ ${divB} = ____`;
          answer = divAnswer;
          break;

        case 'fractions':
          const frac1 = generateFraction(diffConfig.range[1]);
          const frac2 = generateFraction(diffConfig.range[1]);
          const operation = Math.random() > 0.5 ? '+' : '-';
          problem = `${frac1.numerator}/${frac1.denominator} ${operation} ${frac2.numerator}/${frac2.denominator} = ____`;
          // Simplified answer calculation
          if (operation === '+') {
            answer = `${frac1.numerator * frac2.denominator + frac2.numerator * frac1.denominator}/${frac1.denominator * frac2.denominator}`;
          } else {
            answer = `${frac1.numerator * frac2.denominator - frac2.numerator * frac1.denominator}/${frac1.denominator * frac2.denominator}`;
          }
          break;

        case 'decimals':
          const decA = generateDecimal(diffConfig.range, diffConfig.digits);
          const decB = generateDecimal(diffConfig.range, diffConfig.digits);
          const decOp = ['+', '-', '×'][Math.floor(Math.random() * 3)];
          problem = `${decA} ${decOp} ${decB} = ____`;
          switch (decOp) {
            case '+': answer = (decA + decB).toFixed(diffConfig.digits); break;
            case '-': answer = Math.abs(decA - decB).toFixed(diffConfig.digits); break;
            case '×': answer = (decA * decB).toFixed(diffConfig.digits); break;
          }
          break;

        case 'wordProblems':
          const templates = wordProblemTemplates[difficulty];
          const template = templates[Math.floor(Math.random() * templates.length)];
          const wpA = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          const wpB = randomInRange(diffConfig.range[0], diffConfig.range[1]);
          problem = template(wpA, wpB);
          // Simple answer calculation for demonstration
          answer = wpA + wpB;
          break;

        default:
          problem = 'Error generating problem';
          answer = 0;
      }

      problems.push({ problem, answer, id: i + 1 });
    }

    return problems;
  };

  // Generate worksheet
  const handleGenerateWorksheet = () => {
    const problems = generateProblems();
    setGeneratedWorksheet({
      title: worksheetTitle,
      topic: mathTopics[selectedTopic].name,
      difficulty: mathTopics[selectedTopic].difficulties[difficulty].name,
      problems,
      createdAt: new Date().toLocaleDateString()
    });
    setShowPreview(true);
    showToast('Worksheet generated successfully!', 'success');
  };

  // Print worksheet
  const handlePrint = () => {
    window.print();
    showToast('Printing worksheet...', 'info');
  };

  // Download as PDF (simplified - in real implementation you'd use a PDF library)
  const handleDownload = () => {
    showToast('PDF download feature coming soon!', 'info');
  };

  if (showPreview && generatedWorksheet) {
    return (
      <div className="space-y-6">
        {/* Preview Controls */}
        <div className="bg-white rounded-xl shadow-lg p-4 print:hidden">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Worksheet Preview</h3>
              <p className="text-gray-600">Ready to print or download</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back to Generator
              </button>
              <button
                onClick={handleDownload}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                📄 Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* Printable Worksheet */}
        <div className="bg-white shadow-xl print:shadow-none print:p-0" style={{ 
          width: '8.5in', 
          minHeight: '11in', 
          margin: '0 auto',
          padding: '0.75in',
          fontFamily: 'serif'
        }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-300">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{generatedWorksheet.title}</h1>
              <p className="text-lg text-gray-600">{generatedWorksheet.topic} - {generatedWorksheet.difficulty}</p>
              <p className="text-sm text-gray-500 mt-2">Generated: {generatedWorksheet.createdAt}</p>
            </div>
            <div className="text-right">
              <img 
                src="/Logo/LOGO_NoBG.png" 
                alt="Educational Elements" 
                className="h-16 w-16 mb-2"
              />
              <p className="text-xs text-gray-500 font-semibold">Educational Elements</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="mb-8 grid grid-cols-3 gap-8">
            <div>
              <label className="text-sm font-semibold text-gray-700">Name:</label>
              <div className="border-b-2 border-gray-300 h-8"></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Date:</label>
              <div className="border-b-2 border-gray-300 h-8"></div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Score:</label>
              <div className="border-b-2 border-gray-300 h-8"></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-800 mb-2">📝 Instructions:</h3>
            <p className="text-gray-700">
              {selectedTopic === 'wordProblems' 
                ? 'Read each problem carefully and show your work. Write your final answer in the space provided.'
                : 'Solve each problem and write your answer in the blank space. Show your work when necessary.'
              }
            </p>
          </div>

          {/* Problems Grid */}
          <div className={`grid gap-6 ${
            selectedTopic === 'wordProblems' 
              ? 'grid-cols-1' 
              : numberOfProblems <= 15 
                ? 'grid-cols-2' 
                : 'grid-cols-3'
          }`}>
            {generatedWorksheet.problems.map((item, index) => (
              <div key={index} className="bg-white">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 font-bold text-sm px-2 py-1 rounded min-w-[2rem] text-center">
                    {item.id}
                  </span>
                  <div className="flex-1">
                    {selectedTopic === 'wordProblems' ? (
                      <div>
                        <p className="text-gray-800 text-sm leading-relaxed mb-3">{item.problem}</p>
                        <div className="border-b-2 border-gray-300 h-6 mb-2"></div>
                        <div className="border-b-2 border-gray-300 h-6"></div>
                      </div>
                    ) : (
                      <div className="text-lg font-mono">
                        {item.problem}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-500">
              Created with Educational Elements - Empowering Teachers, Inspiring Students
            </p>
          </div>
        </div>

        {/* Answer Key (if enabled) */}
        {includeAnswerKey && (
          <div className="bg-white shadow-xl print:shadow-none print:p-0 print:break-before-page" style={{ 
            width: '8.5in', 
            minHeight: '11in', 
            margin: '0 auto',
            padding: '0.75in',
            fontFamily: 'serif'
          }}>
            {/* Answer Key Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-300">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Answer Key</h1>
                <p className="text-lg text-gray-600">{generatedWorksheet.title}</p>
                <p className="text-sm text-gray-500 mt-2">{generatedWorksheet.topic} - {generatedWorksheet.difficulty}</p>
              </div>
              <div className="text-right">
                <img 
                  src="/Logo/LOGO_NoBG.png" 
                  alt="Educational Elements" 
                  className="h-16 w-16 mb-2"
                />
                <p className="text-xs text-gray-500 font-semibold">Educational Elements</p>
              </div>
            </div>

            {/* Answer Grid */}
            <div className="grid grid-cols-4 gap-4">
              {generatedWorksheet.problems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 py-2">
                  <span className="bg-green-100 text-green-800 font-bold text-sm px-2 py-1 rounded min-w-[2rem] text-center">
                    {item.id}
                  </span>
                  <span className="font-mono text-sm">{item.answer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <span className="text-3xl mr-3">📄</span>
            Math Worksheet Generator
            <span className="text-3xl ml-3">🖨️</span>
          </h2>
          <p className="text-xl opacity-90">Create professional, printable math worksheets in seconds</p>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">🔧 Worksheet Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📚 Math Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(mathTopics).map(([key, topic]) => (
                <option key={key} value={key}>
                  {topic.icon} {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              ⚡ Difficulty Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(mathTopics[selectedTopic].difficulties).map(([key, diff]) => (
                <option key={key} value={key}>
                  {diff.name}
                </option>
              ))}
            </select>
          </div>

          {/* Number of Problems */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🔢 Number of Problems
            </label>
            <select
              value={numberOfProblems}
              onChange={(e) => setNumberOfProblems(parseInt(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10 Problems</option>
              <option value={15}>15 Problems</option>
              <option value={20}>20 Problems</option>
              <option value={25}>25 Problems</option>
              <option value={30}>30 Problems</option>
            </select>
          </div>

          {/* Worksheet Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              📝 Worksheet Title
            </label>
            <input
              type="text"
              value={worksheetTitle}
              onChange={(e) => setWorksheetTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter custom worksheet title..."
            />
          </div>

          {/* Answer Key Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="answerKey"
              checked={includeAnswerKey}
              onChange={(e) => setIncludeAnswerKey(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="answerKey" className="text-sm font-semibold text-gray-700">
              📋 Include Answer Key
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleGenerateWorksheet}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✨ Generate Worksheet
          </button>
        </div>
      </div>

      {/* Preview of Selected Topic */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {mathTopics[selectedTopic].icon} Preview: {mathTopics[selectedTopic].name}
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-700 mb-2">
            <strong>Selected Difficulty:</strong> {mathTopics[selectedTopic].difficulties[difficulty].name}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Number of Problems:</strong> {numberOfProblems}
          </p>
          <p className="text-gray-700">
            <strong>Answer Key:</strong> {includeAnswerKey ? 'Included' : 'Not included'}
          </p>
        </div>
      </div>

      {/* Features Info */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-purple-800 mb-4">🌟 Worksheet Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Professional print-ready format</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Automatic answer key generation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Educational Elements branding</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Student information fields</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Multiple difficulty levels</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Optimized for standard paper size</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Clear instructions included</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✅</span>
              <span className="text-purple-700">Customizable problem count</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorksheetGenerator;