// components/tabs/CurriculumCornerTab.js - Subject-Based Educational Tools
import React, { useState } from 'react';

// ===============================================
// EDUCATIONAL TOOL COMPONENTS
// ===============================================

// Simplified Literacy Companion
const LiteracyCompanion = ({ showToast }) => {
  const [currentWord, setCurrentWord] = useState('');
  const [wordBank, setWordBank] = useState(['apple', 'book', 'cat', 'dog', 'elephant']);
  const [customWords, setCustomWords] = useState([]);

  const getRandomWord = () => {
    const allWords = [...wordBank, ...customWords];
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    setCurrentWord(randomWord);
    showToast(`New word: ${randomWord}`, 'success');
  };

  const addCustomWord = () => {
    const word = prompt('Enter a new word:');
    if (word && word.trim()) {
      setCustomWords([...customWords, word.trim().toLowerCase()]);
      showToast(`Added "${word}" to word bank!`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center bg-blue-50 rounded-lg p-8">
        <h4 className="text-2xl font-bold text-blue-800 mb-4">Word of the Moment</h4>
        <div className="text-6xl font-bold text-blue-600 mb-4">
          {currentWord || 'Click to start!'}
        </div>
        <button
          onClick={getRandomWord}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all font-semibold"
        >
          🎲 Get Random Word
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-6">
          <h5 className="font-bold text-green-800 mb-4">📖 Word Bank</h5>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[...wordBank, ...customWords].map((word, index) => (
              <div key={index} className="bg-white p-2 rounded text-center text-sm border">
                {word}
              </div>
            ))}
          </div>
          <button
            onClick={addCustomWord}
            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-all"
          >
            + Add Word
          </button>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h5 className="font-bold text-purple-800 mb-4">📝 Word Activities</h5>
          <div className="space-y-3">
            <button
              onClick={() => showToast('Spell the word aloud!', 'info')}
              className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-all"
            >
              🔤 Spelling Practice
            </button>
            <button
              onClick={() => showToast('Use the word in a sentence!', 'info')}
              className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-all"
            >
              📝 Sentence Building
            </button>
            <button
              onClick={() => showToast('Find words that rhyme!', 'info')}
              className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-all"
            >
              🎵 Rhyming Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Numbers Board
const NumbersBoard = ({ showToast }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [highlightedNumbers, setHighlightedNumbers] = useState([]);

  const handleNumberClick = (num) => {
    setSelectedNumber(num);
    showToast(`Selected number: ${num}`, 'info');
  };

  const highlightEvens = () => {
    const evens = Array.from({length: 100}, (_, i) => i + 1).filter(n => n % 2 === 0);
    setHighlightedNumbers(evens);
    showToast('Highlighted all even numbers!', 'success');
  };

  const highlightOdds = () => {
    const odds = Array.from({length: 100}, (_, i) => i + 1).filter(n => n % 2 === 1);
    setHighlightedNumbers(odds);
    showToast('Highlighted all odd numbers!', 'success');
  };

  const clearHighlights = () => {
    setHighlightedNumbers([]);
    showToast('Cleared all highlights!', 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={highlightEvens}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
        >
          📊 Even Numbers
        </button>
        <button
          onClick={highlightOdds}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
        >
          📈 Odd Numbers
        </button>
        <button
          onClick={clearHighlights}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
        >
          🧹 Clear
        </button>
      </div>

      <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({length: 100}, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={`
                w-8 h-8 text-xs font-semibold rounded border transition-all
                ${selectedNumber === num 
                  ? 'bg-red-500 text-white border-red-600' 
                  : highlightedNumbers.includes(num)
                  ? 'bg-yellow-200 text-gray-800 border-yellow-300'
                  : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {selectedNumber && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <h5 className="font-bold text-blue-800 mb-2">Selected Number: {selectedNumber}</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Even/Odd:</strong><br />
              {selectedNumber % 2 === 0 ? 'Even' : 'Odd'}
            </div>
            <div>
              <strong>+ 10:</strong><br />
              {selectedNumber + 10}
            </div>
            <div>
              <strong>- 10:</strong><br />
              {Math.max(0, selectedNumber - 10)}
            </div>
            <div>
              <strong>× 2:</strong><br />
              {selectedNumber * 2}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified Dice Roller
const DiceRoller = ({ showToast }) => {
  const [diceResults, setDiceResults] = useState([]);
  const [numDice, setNumDice] = useState(2);
  const [diceType, setDiceType] = useState(6);

  const rollDice = () => {
    const results = Array.from({length: numDice}, () => 
      Math.floor(Math.random() * diceType) + 1
    );
    setDiceResults(results);
    const sum = results.reduce((a, b) => a + b, 0);
    showToast(`Rolled: ${results.join(', ')} (Sum: ${sum})`, 'success');
  };

  const getDiceEmoji = (value, type) => {
    if (type === 6) {
      const emojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      return emojis[value - 1] || value;
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-6">
        <h5 className="font-bold text-green-800 mb-4">🎲 Dice Settings</h5>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Dice</label>
            <select
              value={numDice}
              onChange={(e) => setNumDice(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} dice</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dice Type</label>
            <select
              value={diceType}
              onChange={(e) => setDiceType(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value={4}>4-sided</option>
              <option value={6}>6-sided</option>
              <option value={8}>8-sided</option>
              <option value={10}>10-sided</option>
              <option value={12}>12-sided</option>
              <option value={20}>20-sided</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={rollDice}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-all font-bold text-lg"
        >
          🎲 Roll Dice!
        </button>
      </div>

      {diceResults.length > 0 && (
        <div className="bg-white rounded-lg p-6 border-2 border-green-200">
          <h5 className="font-bold text-gray-800 mb-4 text-center">Results</h5>
          <div className="flex justify-center space-x-4 mb-4">
            {diceResults.map((result, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">
                  {getDiceEmoji(result, diceType)}
                </div>
                <div className="text-sm font-semibold">{result}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-800">
              Sum: {diceResults.reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Average: {(diceResults.reduce((a, b) => a + b, 0) / diceResults.length).toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simplified Geography Explorer
const GeographyExplorer = ({ showToast }) => {
  const [selectedContinent, setSelectedContinent] = useState('North America');
  const [showCountries, setShowCountries] = useState(false);

  const continents = {
    'North America': {
      emoji: '🌎',
      countries: ['United States', 'Canada', 'Mexico', 'Guatemala', 'Cuba'],
      facts: ['Third largest continent', 'Home to 580 million people', 'Contains the longest cave system']
    },
    'South America': {
      emoji: '🌎',
      countries: ['Brazil', 'Argentina', 'Peru', 'Colombia', 'Chile'],
      facts: ['Home to Amazon rainforest', 'Contains Angel Falls', 'Andes Mountains run through it']
    },
    'Europe': {
      emoji: '🌍',
      countries: ['Germany', 'France', 'Italy', 'Spain', 'United Kingdom'],
      facts: ['Smallest continent by land area', '44 countries', 'Rich in history and culture']
    },
    'Asia': {
      emoji: '🌏',
      countries: ['China', 'India', 'Japan', 'Thailand', 'Philippines'],
      facts: ['Largest continent', 'Most populous continent', 'Home to Mount Everest']
    },
    'Africa': {
      emoji: '🌍',
      countries: ['Nigeria', 'Kenya', 'Egypt', 'South Africa', 'Morocco'],
      facts: ['Cradle of humanity', 'Home to Sahara Desert', '54 countries']
    },
    'Australia': {
      emoji: '🌏',
      countries: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa'],
      facts: ['Smallest continent', 'Unique wildlife', 'Great Barrier Reef located here']
    }
  };

  const exploreContinent = (continent) => {
    setSelectedContinent(continent);
    setShowCountries(true);
    showToast(`Exploring ${continent}!`, 'success');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(continents).map(([name, data]) => (
          <button
            key={name}
            onClick={() => exploreContinent(name)}
            className={`p-4 rounded-lg border-2 transition-all text-center ${
              selectedContinent === name
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="text-3xl mb-2">{data.emoji}</div>
            <div className="font-semibold text-sm">{name}</div>
          </button>
        ))}
      </div>

      {selectedContinent && (
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">{continents[selectedContinent].emoji}</div>
            <h4 className="text-2xl font-bold text-gray-800">{selectedContinent}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-bold text-gray-800 mb-3">🏛️ Countries</h5>
              <div className="space-y-2">
                {continents[selectedContinent].countries.map((country, index) => (
                  <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                    {country}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-bold text-gray-800 mb-3">📚 Fun Facts</h5>
              <div className="space-y-2">
                {continents[selectedContinent].facts.map((fact, index) => (
                  <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                    • {fact}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => showToast(`Let's learn more about ${selectedContinent}!`, 'info')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              🔍 Explore More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Coming Soon Component
const ComingSoon = ({ toolName, subjectName }) => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">🚧</div>
    <h3 className="text-2xl font-bold text-gray-800 mb-4">{toolName}</h3>
    <p className="text-gray-600 mb-6">
      Exciting {subjectName.toLowerCase()} tools are being developed and will be available soon!
    </p>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
      <h4 className="font-bold text-blue-800 mb-2">🌟 What's Coming:</h4>
      <ul className="text-blue-700 text-sm text-left space-y-1">
        <li>• Interactive learning activities</li>
        <li>• Student progress tracking</li>
        <li>• XP and rewards integration</li>
        <li>• Engaging visual content</li>
      </ul>
    </div>
    <p className="text-gray-500 mt-6 text-sm">
      💡 Have suggestions for {subjectName.toLowerCase()} tools? Send us feedback!
    </p>
  </div>
);

// ===============================================
// MAIN CURRICULUM CORNER COMPONENT
// ===============================================

const CurriculumCornerTab = ({ 
  students = [],
  showToast = () => {},
  userData = {}
}) => {
  const [activeSubject, setActiveSubject] = useState('literacy');
  const [activeSubjectTool, setActiveSubjectTool] = useState('literacy-companion');

  // Define subject areas and their tools
  const subjects = [
    {
      id: 'literacy',
      name: 'Literacy',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      description: 'Reading, writing, and language arts tools',
      tools: [
        {
          id: 'literacy-companion',
          name: 'Literacy Companion',
          icon: '📖',
          description: 'Complete literacy teaching system',
          component: LiteracyCompanion
        },
        {
          id: 'word-study',
          name: 'Word Study',
          icon: '🔤',
          description: 'Interactive word analysis tools',
          component: ComingSoon
        }
      ]
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: '🔢',
      color: 'from-green-500 to-green-600',
      description: 'Math tools and number activities',
      tools: [
        {
          id: 'numbers-board',
          name: 'Numbers Board',
          icon: '💯',
          description: 'Interactive hundreds board',
          component: NumbersBoard
        },
        {
          id: 'dice-roller',
          name: 'Dice Roller',
          icon: '🎲',
          description: 'Digital dice for math activities',
          component: DiceRoller
        }
      ]
    },
    {
      id: 'geography',
      name: 'Geography',
      icon: '🌍',
      color: 'from-purple-500 to-purple-600',
      description: 'World geography exploration',
      tools: [
        {
          id: 'geography-explorer',
          name: 'Geography Explorer',
          icon: '🗺️',
          description: 'Interactive world geography learning',
          component: GeographyExplorer
        }
      ]
    },
    {
      id: 'science',
      name: 'Science',
      icon: '🔬',
      color: 'from-orange-500 to-orange-600',
      description: 'Science exploration and experiments',
      tools: [
        {
          id: 'science-tools',
          name: 'Science Tools',
          icon: '⚗️',
          description: 'Interactive science activities',
          component: ComingSoon
        }
      ]
    },
    {
      id: 'social-studies',
      name: 'Social Studies',
      icon: '🏛️',
      color: 'from-red-500 to-red-600',
      description: 'History, civics, and culture',
      tools: [
        {
          id: 'history-explorer',
          name: 'History Explorer',
          icon: '📜',
          description: 'Historical timelines and events',
          component: ComingSoon
        }
      ]
    },
    {
      id: 'arts',
      name: 'Arts & Creativity',
      icon: '🎨',
      color: 'from-pink-500 to-pink-600',
      description: 'Creative expression and arts',
      tools: [
        {
          id: 'art-studio',
          name: 'Art Studio',
          icon: '🖌️',
          description: 'Digital art and creativity tools',
          component: ComingSoon
        }
      ]
    }
  ];

  // Get current subject and tool
  const currentSubject = subjects.find(s => s.id === activeSubject);
  const currentTool = currentSubject?.tools.find(t => t.id === activeSubjectTool);

  // Handle subject change
  const handleSubjectChange = (subjectId) => {
    setActiveSubject(subjectId);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject && subject.tools.length > 0) {
      setActiveSubjectTool(subject.tools[0].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">📖</span>
            Curriculum Corner
            <span className="text-4xl ml-4 animate-bounce">🎓</span>
          </h2>
          <p className="text-xl opacity-90">Subject-based teaching tools for every classroom need</p>
        </div>
        
        {/* Floating decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🔬</div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🎨</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🌍</div>
      </div>

      {/* Subject Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Subject Area</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => handleSubjectChange(subject.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-center hover:scale-105 ${
                activeSubject === subject.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 bg-white shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{subject.icon}</div>
              <h4 className="font-bold text-gray-800 text-sm mb-2">{subject.name}</h4>
              <p className="text-xs text-gray-600 leading-tight">{subject.description}</p>
              <div className="mt-3 text-xs text-gray-500">
                {subject.tools.length} tool{subject.tools.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Tools */}
      {currentSubject && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Subject Header */}
          <div className={`bg-gradient-to-r ${currentSubject.color} text-white p-6`}>
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{currentSubject.icon}</div>
              <div>
                <h3 className="text-3xl font-bold">{currentSubject.name}</h3>
                <p className="text-lg opacity-90">{currentSubject.description}</p>
              </div>
            </div>
          </div>

          {/* Tools Navigation */}
          {currentSubject.tools.length > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {currentSubject.tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveSubjectTool(tool.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeSubjectTool === tool.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool Content */}
          <div className="p-6">
            {currentTool && (
              <>
                {/* Tool Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{currentTool.icon}</span>
                    <h4 className="text-2xl font-bold text-gray-800">{currentTool.name}</h4>
                  </div>
                  <p className="text-gray-600">{currentTool.description}</p>
                </div>

                {/* Render the actual component */}
                {currentTool.component === ComingSoon ? (
                  <ComingSoon 
                    toolName={currentTool.name} 
                    subjectName={currentSubject.name}
                  />
                ) : (
                  <currentTool.component
                    students={students}
                    showToast={showToast}
                    userData={userData}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Curriculum Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map(subject => {
            const availableTools = subject.tools.filter(tool => tool.component !== ComingSoon).length;
            const totalTools = subject.tools.length;
            
            return (
              <div key={subject.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{subject.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{subject.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {availableTools}/{totalTools} tools ready
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${subject.color}`}
                    style={{ width: `${(availableTools / totalTools) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pro Feature Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">⭐</span>
          <div>
            <h4 className="font-bold text-yellow-800 mb-2">Unlock More Curriculum Tools</h4>
            <p className="text-yellow-700 mb-4">
              Get access to advanced teaching tools, unlimited classes, and new subject areas with Classroom Champions PRO!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-700 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span>🔬</span>
                  <span>Interactive Science Experiments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎨</span>
                  <span>Digital Art & Music Studio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📜</span>
                  <span>Historical Timeline Builder</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span>🌐</span>
                  <span>Extended Geography Adventures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Advanced Analytics Dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>Custom Learning Pathways</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => showToast('Upgrade feature coming soon!', 'info')}
              className="mt-4 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold text-sm"
            >
              Upgrade to PRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCornerTab;