// FluencyCenter.js - Complete Reading Fluency Practice Tool
import React, { useState, useEffect } from 'react';

const FluencyCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activeFluencyTab, setActiveFluencyTab] = useState('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [readingGoal, setReadingGoal] = useState(60); // words per minute

  // Reading fluency strategies
  const fluencyStrategies = [
    {
      id: 'repeated-reading',
      name: 'Repeated Reading',
      icon: '🔄',
      description: 'Read the same passage multiple times to build automaticity',
      steps: [
        'Choose an appropriate passage (90-95% accuracy)',
        'Time the first reading and count words',
        'Practice reading the passage 3-4 times',
        'Time the final reading and compare improvement',
        'Focus on expression and comprehension'
      ],
      benefits: 'Builds word recognition speed and reading confidence',
      color: 'blue'
    },
    {
      id: 'echo-reading',
      name: 'Echo Reading',
      icon: '📢',
      description: 'Teacher reads first, students echo back with same expression',
      steps: [
        'Teacher reads a sentence with expression',
        'Students repeat with same pace and expression',
        'Continue sentence by sentence',
        'Gradually increase length of sections',
        'Focus on matching the model'
      ],
      benefits: 'Develops prosody and expression skills',
      color: 'green'
    },
    {
      id: 'choral-reading',
      name: 'Choral Reading',
      icon: '🎵',
      description: 'Read together as a group with rhythm and expression',
      steps: [
        'Choose a text everyone can see',
        'Establish a steady rhythm',
        'Read together at the same pace',
        'Use pointer to keep everyone together',
        'Practice with poems, songs, or scripts'
      ],
      benefits: 'Builds confidence and community reading',
      color: 'purple'
    },
    {
      id: 'partner-reading',
      name: 'Partner Reading',
      icon: '👫',
      description: 'Take turns reading with a partner for support and feedback',
      steps: [
        'Pair stronger and weaker readers',
        'Take turns reading paragraphs or pages',
        'Provide gentle correction and support',
        'Discuss the story together',
        'Switch roles regularly'
      ],
      benefits: 'Provides peer support and motivation',
      color: 'orange'
    },
    {
      id: 'readers-theater',
      name: 'Readers Theater',
      icon: '🎭',
      description: 'Perform scripts with expression but without costumes or sets',
      steps: [
        'Choose or create simple scripts',
        'Assign character parts',
        'Practice reading with character voices',
        'Focus on expression over memorization',
        'Perform for an audience'
      ],
      benefits: 'Makes reading fun and meaningful',
      color: 'pink'
    },
    {
      id: 'phrase-reading',
      name: 'Phrase Reading',
      icon: '📏',
      description: 'Practice reading in meaningful phrases rather than word-by-word',
      steps: [
        'Mark phrase boundaries with slashes',
        'Practice reading each phrase smoothly',
        'Combine phrases into sentences',
        'Focus on meaning chunks',
        'Gradually remove phrase marks'
      ],
      benefits: 'Improves comprehension and natural flow',
      color: 'indigo'
    }
  ];

  // Reading passages for fluency practice
  const fluencyPassages = [
    {
      id: 'autumn-leaves',
      title: 'Autumn Leaves',
      level: 'Grade 2-3',
      wordCount: 89,
      text: `The autumn leaves dance in the wind. Red, yellow, and orange leaves fall from the tall oak trees. Children love to jump in the big piles of crunchy leaves. The leaves make a rustling sound as they blow across the sidewalk.

Sarah rakes the leaves in her yard every Saturday. She makes huge piles for her little brother to jump in. He laughs and throws leaves high in the air. The colorful leaves flutter down like confetti at a party.

Soon winter will come and all the leaves will be gone.`,
      comprehensionQuestions: [
        'What colors are the autumn leaves?',
        'What does Sarah do every Saturday?',
        'How do the leaves sound when they blow across the sidewalk?'
      ]
    },
    {
      id: 'space-adventure',
      title: 'Space Adventure',
      level: 'Grade 3-4',
      wordCount: 95,
      text: `Captain Luna fastened her helmet and checked her oxygen tank. Today was the day she would walk on Mars for the first time. The red planet looked mysterious and beautiful through the spaceship window.

"Mission Control, this is Captain Luna. Ready for Mars walk," she spoke into her radio. The reply crackled back, "You are go for Mars walk, Captain. Make history!"

Luna opened the airlock door and stepped onto the rusty red surface. Her boots made the first human footprints on Mars. She planted a flag and collected rock samples for the scientists back on Earth.`,
      comprehensionQuestions: [
        'What planet is Captain Luna visiting?',
        'What did she collect for the scientists?',
        'What did her boots make on Mars?'
      ]
    },
    {
      id: 'friendship-garden',
      title: 'The Friendship Garden',
      level: 'Grade 4-5',
      wordCount: 102,
      text: `Maya and Alex decided to plant a garden together behind the school. They wanted to grow vegetables to share with their classmates. Every day after school, they would water their plants and pull the weeds.

"Look how big our tomatoes are getting!" Maya exclaimed one sunny afternoon. The red tomatoes hung heavy on the green vines. The carrots were ready to harvest too.

When harvest time came, Maya and Alex invited their whole class to a garden party. Everyone enjoyed fresh vegetables and learned about growing food. The friendship garden brought the whole class together and taught them about working as a team.`,
      comprehensionQuestions: [
        'Where did Maya and Alex plant their garden?',
        'What vegetables did they grow?',
        'What did the garden teach the class?'
      ]
    }
  ];

  // Fluency assessment rubrics
  const fluencyRubric = {
    rate: {
      1: 'Very slow, laborious reading',
      2: 'Slow reading with some pauses',
      3: 'Appropriate rate most of the time',
      4: 'Consistently appropriate rate'
    },
    accuracy: {
      1: 'Many errors that interfere with meaning',
      2: 'Some errors that may interfere with meaning',
      3: 'Few errors that don\'t interfere with meaning',
      4: 'Very few or no errors'
    },
    expression: {
      1: 'Little expression, monotone',
      2: 'Some expression, mostly monotone',
      3: 'Good expression most of the time',
      4: 'Excellent expression throughout'
    }
  };

  const fluencyTabs = [
    { id: 'strategies', name: 'Fluency Strategies', icon: '🎯' },
    { id: 'passages', name: 'Practice Passages', icon: '📖' },
    { id: 'assessment', name: 'Fluency Assessment', icon: '📊' },
    { id: 'games', name: 'Fluency Games', icon: '🎮' }
  ];

  // Timer functionality
  useEffect(() => {
    let interval = null;
    if (isReading) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 100);
    } else if (!isReading && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isReading, timer]);

  const startReading = () => {
    setIsReading(true);
    setTimer(0);
    if (showToast) {
      showToast('Reading timer started!', 'success');
    }
  };

  const stopReading = () => {
    setIsReading(false);
    if (showToast) {
      showToast(`Reading time: ${(timer / 10).toFixed(1)} seconds`, 'info');
    }
  };

  const calculateWPM = (wordCount, timeInSeconds) => {
    return Math.round((wordCount / timeInSeconds) * 60);
  };

  const handleStrategyClick = (strategy) => {
    setSelectedStrategy(strategy);
    if (showToast) {
      showToast(`Teaching strategy: ${strategy.name}`, 'info');
    }
  };

  const handlePassageClick = (passage) => {
    setSelectedPassage(passage);
    if (showToast) {
      showToast(`Selected passage: ${passage.title}`, 'info');
    }
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activeFluencyTab === 'strategies' && (
          <div className="space-y-8">
            {selectedStrategy ? (
              // Individual Strategy Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to All Strategies
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-6xl mx-auto">
                  <div className="text-8xl mb-6">{selectedStrategy.icon}</div>
                  <div className="text-6xl font-bold mb-6 text-yellow-300">{selectedStrategy.name}</div>
                  <div className="text-3xl mb-12 text-blue-300 italic">"{selectedStrategy.description}"</div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                    <div className={`bg-${selectedStrategy.color}-500/20 rounded-2xl p-8`}>
                      <h3 className="text-3xl font-bold text-white mb-6">How to Use This Strategy:</h3>
                      <div className="space-y-4">
                        {selectedStrategy.steps.map((step, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className={`w-8 h-8 bg-${selectedStrategy.color}-500 text-white rounded-full flex items-center justify-center font-bold text-lg`}>
                              {index + 1}
                            </div>
                            <div className="text-xl text-white">{step}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-green-500/20 rounded-2xl p-8">
                      <h3 className="text-3xl font-bold text-green-300 mb-6">Benefits:</h3>
                      <div className="text-2xl text-green-100 leading-relaxed">
                        {selectedStrategy.benefits}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // All Strategies Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Reading Fluency Strategies</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {fluencyStrategies.map(strategy => (
                    <button
                      key={strategy.id}
                      onClick={() => handleStrategyClick(strategy)}
                      className={`p-8 rounded-2xl border-4 border-${strategy.color}-400 bg-${strategy.color}-500/20 hover:bg-${strategy.color}-500/30 transition-all duration-300 hover:scale-105`}
                    >
                      <div className="text-6xl mb-4">{strategy.icon}</div>
                      <div className="text-2xl font-bold text-white mb-2">{strategy.name}</div>
                      <div className="text-lg text-gray-200">{strategy.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeFluencyTab === 'passages' && (
          <div className="space-y-8">
            {selectedPassage ? (
              // Individual Passage Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedPassage(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to All Passages
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-6xl mx-auto">
                  <h2 className="text-5xl font-bold mb-4 text-yellow-300">{selectedPassage.title}</h2>
                  <div className="text-2xl text-blue-300 mb-8">{selectedPassage.level} • {selectedPassage.wordCount} words</div>
                  
                  <div className="bg-white/20 rounded-2xl p-8 text-left mb-8">
                    <div className="text-xl text-white leading-relaxed whitespace-pre-line">
                      {selectedPassage.text}
                    </div>
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={startReading}
                      disabled={isReading}
                      className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-500 font-bold"
                    >
                      ▶️ Start Reading
                    </button>
                    <button
                      onClick={stopReading}
                      disabled={!isReading}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:bg-gray-500 font-bold"
                    >
                      ⏹️ Stop Reading
                    </button>
                  </div>
                  
                  {timer > 0 && (
                    <div className="mt-6 bg-blue-500/20 rounded-xl p-4">
                      <div className="text-2xl text-blue-200">
                        Time: {(timer / 10).toFixed(1)} seconds
                      </div>
                      {!isReading && timer > 0 && (
                        <div className="text-3xl font-bold text-yellow-300">
                          WPM: {calculateWPM(selectedPassage.wordCount, timer / 10)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // All Passages Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Practice Passages</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {fluencyPassages.map(passage => (
                    <button
                      key={passage.id}
                      onClick={() => handlePassageClick(passage)}
                      className="p-8 rounded-2xl border-4 border-red-400 bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <div className="text-6xl mb-4">📖</div>
                      <div className="text-2xl font-bold text-white mb-2">{passage.title}</div>
                      <div className="text-lg text-gray-200 mb-2">{passage.level}</div>
                      <div className="text-sm text-gray-300">{passage.wordCount} words</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Teacher Mode
  return (
    <div className="p-6">
      {/* Fluency Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {fluencyTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFluencyTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeFluencyTab === tab.id
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Fluency Strategies Tab */}
      {activeFluencyTab === 'strategies' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Reading Fluency Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fluencyStrategies.map(strategy => (
              <button
                key={strategy.id}
                onClick={() => handleStrategyClick(strategy)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-left border-${strategy.color}-300 bg-${strategy.color}-50 hover:bg-${strategy.color}-100`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{strategy.icon}</div>
                  <div>
                    <h4 className={`font-bold text-lg text-${strategy.color}-800 mb-2`}>{strategy.name}</h4>
                    <p className={`text-sm text-${strategy.color}-700`}>{strategy.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedStrategy && (
            <div className={`bg-gradient-to-r from-${selectedStrategy.color}-50 to-purple-50 rounded-xl p-6 border border-${selectedStrategy.color}-200`}>
              <div className="flex items-start space-x-6">
                <div className="text-6xl">{selectedStrategy.icon}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedStrategy.name}</h4>
                  <p className="text-lg text-gray-600 mb-4 italic">"{selectedStrategy.description}"</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className={`font-bold text-${selectedStrategy.color}-700 mb-3`}>Implementation Steps:</h5>
                      <ol className="space-y-2">
                        {selectedStrategy.steps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className={`w-6 h-6 bg-${selectedStrategy.color}-500 text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                              {index + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-bold text-green-700 mb-2">Benefits:</h5>
                      <p className="text-green-800">{selectedStrategy.benefits}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStrategy(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Practice Passages Tab */}
      {activeFluencyTab === 'passages' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">Fluency Practice Passages</h3>
            <div className="flex items-center space-x-4">
              <label className="font-bold text-gray-700">Reading Goal:</label>
              <input
                type="number"
                value={readingGoal}
                onChange={(e) => setReadingGoal(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-lg w-20"
              />
              <span className="text-gray-600">WPM</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {fluencyPassages.map(passage => (
              <div key={passage.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{passage.title}</h4>
                    <span className="text-sm text-red-600 font-medium">{passage.level}</span>
                    <div className="text-sm text-gray-600">{passage.wordCount} words</div>
                  </div>
                  <button
                    onClick={() => handlePassageClick(passage)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Practice
                  </button>
                </div>
                
                {selectedPassage === passage && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <div className="text-sm leading-relaxed whitespace-pre-line">{passage.text}</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button
                          onClick={startReading}
                          disabled={isReading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm font-bold"
                        >
                          ▶️ Start
                        </button>
                        <button
                          onClick={stopReading}
                          disabled={!isReading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm font-bold"
                        >
                          ⏹️ Stop
                        </button>
                      </div>
                      
                      {timer > 0 && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {(timer / 10).toFixed(1)}s
                          </div>
                          {!isReading && timer > 0 && (
                            <div className={`text-lg font-bold ${
                              calculateWPM(passage.wordCount, timer / 10) >= readingGoal 
                                ? 'text-green-600' 
                                : 'text-orange-600'
                            }`}>
                              {calculateWPM(passage.wordCount, timer / 10)} WPM
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <details className="mt-4">
                      <summary className="text-blue-600 cursor-pointer font-medium">Comprehension Questions</summary>
                      <div className="mt-2 space-y-2">
                        {passage.comprehensionQuestions.map((question, index) => (
                          <div key={index} className="text-sm text-gray-700">
                            {index + 1}. {question}
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Tab */}
      {activeFluencyTab === 'assessment' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Fluency Assessment Tools</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rate */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                <span className="mr-2">⏱️</span>
                Reading Rate
              </h4>
              {Object.entries(fluencyRubric.rate).map(([level, description]) => (
                <div key={level} className="mb-2 p-2 bg-white rounded border">
                  <span className="font-bold text-blue-600">{level}:</span> {description}
                </div>
              ))}
            </div>

            {/* Accuracy */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Accuracy
              </h4>
              {Object.entries(fluencyRubric.accuracy).map(([level, description]) => (
                <div key={level} className="mb-2 p-2 bg-white rounded border">
                  <span className="font-bold text-green-600">{level}:</span> {description}
                </div>
              ))}
            </div>

            {/* Expression */}
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
                <span className="mr-2">🎭</span>
                Expression
              </h4>
              {Object.entries(fluencyRubric.expression).map(([level, description]) => (
                <div key={level} className="mb-2 p-2 bg-white rounded border">
                  <span className="font-bold text-purple-600">{level}:</span> {description}
                </div>
              ))}
            </div>
          </div>

          {/* WPM Guidelines */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <h4 className="text-xl font-bold text-orange-800 mb-4">Words Per Minute Guidelines</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">60</div>
                <div className="text-sm text-gray-600">Grade 1 Goal</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">90</div>
                <div className="text-sm text-gray-600">Grade 2 Goal</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">110</div>
                <div className="text-sm text-gray-600">Grade 3 Goal</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">130</div>
                <div className="text-sm text-gray-600">Grade 4+ Goal</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FluencyCenter;