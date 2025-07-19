// SpellingCenter.js - Complete Interactive Spelling Tool
import React, { useState } from 'react';

const SpellingCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activeSpellingTab, setActiveSpellingTab] = useState('patterns');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [selectedWordList, setSelectedWordList] = useState(null);
  const [practiceMode, setPracticeMode] = useState('study');

  // Comprehensive spelling patterns
  const spellingPatterns = [
    {
      id: 'cvc',
      name: 'CVC Words',
      pattern: 'Consonant-Vowel-Consonant',
      examples: ['cat', 'dog', 'run', 'big', 'sun', 'hat', 'pen', 'sit', 'cup', 'leg'],
      description: 'Simple three-letter words that are great for beginning readers',
      icon: '🔤',
      color: 'blue',
      rule: 'Each word has one vowel in the middle, making a short vowel sound'
    },
    {
      id: 'silent-e',
      name: 'Silent E (Magic E)',
      pattern: 'Consonant-Vowel-Consonant-E',
      examples: ['make', 'bike', 'cute', 'hope', 'snake', 'cake', 'time', 'bone', 'tube', 'game'],
      description: 'The silent E at the end makes the vowel say its name',
      icon: '🤫',
      color: 'green',
      rule: 'When E comes at the end, it makes the vowel long but stays silent itself'
    },
    {
      id: 'double-consonants',
      name: 'Double Consonants',
      pattern: 'Words ending with double letters',
      examples: ['bell', 'kiss', 'ball', 'buff', 'doll', 'pill', 'mess', 'buzz', 'will', 'boss'],
      description: 'Two of the same consonant at the end',
      icon: '👥',
      color: 'purple',
      rule: 'Double the final consonant to keep the vowel sound short'
    },
    {
      id: 'r-controlled',
      name: 'R-Controlled Vowels',
      pattern: 'Vowel + R combinations',
      examples: ['car', 'bird', 'hurt', 'corn', 'farm', 'girl', 'turn', 'park', 'work', 'start'],
      description: 'When R comes after a vowel, it changes the vowel sound',
      icon: '🚗',
      color: 'orange',
      rule: 'R makes the vowel sound different - neither long nor short'
    },
    {
      id: 'vowel-teams',
      name: 'Vowel Teams',
      pattern: 'Two vowels working together',
      examples: ['rain', 'boat', 'team', 'coat', 'read', 'soap', 'meat', 'road', 'bean', 'goal'],
      description: 'When two vowels go walking, the first one does the talking',
      icon: '👯',
      color: 'pink',
      rule: 'Usually the first vowel says its name and the second is silent'
    },
    {
      id: 'ending-sounds',
      name: 'Common Endings',
      pattern: 'Words with -ing, -ed, -er endings',
      examples: ['running', 'jumped', 'bigger', 'playing', 'helped', 'smaller', 'singing', 'walked', 'faster', 'looking'],
      description: 'Common word endings that change meaning',
      icon: '🔚',
      color: 'indigo',
      rule: 'Add endings to base words to change when or how something happens'
    }
  ];

  // Word lists for different grades/levels
  const wordLists = [
    {
      id: 'grade-1',
      name: 'Grade 1 Words',
      level: 'Beginner',
      words: ['and', 'the', 'you', 'to', 'a', 'I', 'it', 'in', 'said', 'for', 'up', 'look', 'is', 'go', 'we', 'little', 'down', 'can', 'see', 'not'],
      icon: '1️⃣'
    },
    {
      id: 'grade-2',
      name: 'Grade 2 Words',
      level: 'Elementary',
      words: ['always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold', 'does', 'don\'t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its'],
      icon: '2️⃣'
    },
    {
      id: 'grade-3',
      name: 'Grade 3 Words',
      level: 'Intermediate',
      words: ['about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'keep', 'kind'],
      icon: '3️⃣'
    }
  ];

  // Spelling activities
  const spellingActivities = [
    {
      id: 'word-building',
      name: 'Word Building',
      description: 'Build words letter by letter',
      icon: '🏗️',
      activity: 'drag-letters'
    },
    {
      id: 'pattern-sort',
      name: 'Pattern Sorting',
      description: 'Sort words by spelling patterns',
      icon: '📋',
      activity: 'sort-words'
    },
    {
      id: 'missing-letters',
      name: 'Missing Letters',
      description: 'Fill in the missing letters',
      icon: '🔍',
      activity: 'fill-blanks'
    },
    {
      id: 'rhyme-time',
      name: 'Rhyme Time',
      description: 'Find words that rhyme',
      icon: '🎵',
      activity: 'match-rhymes'
    }
  ];

  const spellingTabs = [
    { id: 'patterns', name: 'Spelling Patterns', icon: '🔍' },
    { id: 'word-lists', name: 'Word Lists', icon: '📝' },
    { id: 'activities', name: 'Practice Activities', icon: '🎯' },
    { id: 'assessment', name: 'Spelling Test', icon: '✅' }
  ];

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
    if (showToast) {
      showToast(`Teaching pattern: ${pattern.name}`, 'info');
    }
  };

  const handleWordListClick = (wordList) => {
    setSelectedWordList(wordList);
    if (showToast) {
      showToast(`Studying: ${wordList.name}`, 'info');
    }
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activeSpellingTab === 'patterns' && (
          <div className="space-y-8">
            {selectedPattern ? (
              // Individual Pattern Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedPattern(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to All Patterns
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-6xl mx-auto">
                  <div className="text-8xl mb-6">{selectedPattern.icon}</div>
                  <div className="text-6xl font-bold mb-6 text-yellow-300">{selectedPattern.name}</div>
                  <div className="text-3xl mb-8 text-blue-300 italic">"{selectedPattern.description}"</div>
                  
                  <div className={`bg-${selectedPattern.color}-500/20 rounded-2xl p-8 mb-8`}>
                    <h3 className="text-3xl font-bold text-white mb-4">Spelling Rule:</h3>
                    <div className="text-2xl text-gray-200 italic">{selectedPattern.rule}</div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
                    {selectedPattern.examples.map((word, index) => (
                      <div key={index} className={`p-4 bg-${selectedPattern.color}-500/30 rounded-xl border-2 border-${selectedPattern.color}-400`}>
                        <div className="text-2xl font-bold text-white">{word}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // All Patterns Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Spelling Patterns</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {spellingPatterns.map(pattern => (
                    <button
                      key={pattern.id}
                      onClick={() => handlePatternClick(pattern)}
                      className={`p-8 rounded-2xl border-4 border-${pattern.color}-400 bg-${pattern.color}-500/20 hover:bg-${pattern.color}-500/30 transition-all duration-300 hover:scale-105`}
                    >
                      <div className="text-6xl mb-4">{pattern.icon}</div>
                      <div className="text-2xl font-bold text-white mb-2">{pattern.name}</div>
                      <div className="text-lg text-gray-200">{pattern.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSpellingTab === 'word-lists' && (
          <div className="space-y-8">
            {selectedWordList ? (
              // Individual Word List Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedWordList(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to Word Lists
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-6xl mx-auto">
                  <div className="text-8xl mb-6">{selectedWordList.icon}</div>
                  <div className="text-6xl font-bold mb-6 text-yellow-300">{selectedWordList.name}</div>
                  <div className="text-3xl mb-12 text-blue-300">{selectedWordList.level} Level</div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
                    {selectedWordList.words.map((word, index) => (
                      <div key={index} className="p-4 bg-blue-500/30 rounded-xl border-2 border-blue-400">
                        <div className="text-xl font-bold text-white">{word}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // All Word Lists Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Spelling Word Lists</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {wordLists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => handleWordListClick(list)}
                      className="p-8 rounded-2xl border-4 border-green-400 bg-green-500/20 hover:bg-green-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <div className="text-6xl mb-4">{list.icon}</div>
                      <div className="text-2xl font-bold text-white mb-2">{list.name}</div>
                      <div className="text-lg text-gray-200">{list.level}</div>
                      <div className="text-sm text-gray-300 mt-2">{list.words.length} words</div>
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
      {/* Spelling Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {spellingTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSpellingTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeSpellingTab === tab.id
                ? 'bg-orange-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Spelling Patterns Tab */}
      {activeSpellingTab === 'patterns' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Spelling Patterns & Rules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spellingPatterns.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => handlePatternClick(pattern)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-left border-${pattern.color}-300 bg-${pattern.color}-50 hover:bg-${pattern.color}-100`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{pattern.icon}</div>
                  <div>
                    <h4 className={`font-bold text-lg text-${pattern.color}-800 mb-2`}>{pattern.name}</h4>
                    <p className={`text-sm text-${pattern.color}-700 mb-2`}>{pattern.description}</p>
                    <div className="text-xs text-gray-600">{pattern.examples.length} examples</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedPattern && (
            <div className={`bg-gradient-to-r from-${selectedPattern.color}-50 to-purple-50 rounded-xl p-6 border border-${selectedPattern.color}-200`}>
              <div className="flex items-start space-x-6">
                <div className="text-6xl">{selectedPattern.icon}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedPattern.name}</h4>
                  <p className="text-lg text-gray-600 mb-4 italic">"{selectedPattern.description}"</p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h5 className="font-bold text-purple-700 mb-2">Spelling Rule:</h5>
                    <p className="text-purple-800">{selectedPattern.rule}</p>
                  </div>
                  
                  <div>
                    <h5 className={`font-bold text-${selectedPattern.color}-700 mb-3`}>Example Words:</h5>
                    <div className="grid grid-cols-5 gap-2">
                      {selectedPattern.examples.map((word, index) => (
                        <span key={index} className={`px-3 py-2 bg-${selectedPattern.color}-100 text-${selectedPattern.color}-800 rounded-lg font-bold text-center`}>
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPattern(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Word Lists Tab */}
      {activeSpellingTab === 'word-lists' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Grade-Level Word Lists</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wordLists.map(list => (
              <button
                key={list.id}
                onClick={() => handleWordListClick(list)}
                className="p-6 rounded-xl border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:scale-105 text-left"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{list.icon}</div>
                  <h4 className="text-xl font-bold text-green-800 mb-2">{list.name}</h4>
                  <p className="text-green-600 mb-2">{list.level}</p>
                  <div className="text-sm text-gray-600">{list.words.length} words to master</div>
                </div>
              </button>
            ))}
          </div>

          {selectedWordList && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start space-x-6">
                <div className="text-6xl">{selectedWordList.icon}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedWordList.name}</h4>
                  <p className="text-lg text-green-600 mb-4">{selectedWordList.level} Level • {selectedWordList.words.length} Words</p>
                  
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {selectedWordList.words.map((word, index) => (
                      <div key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-center text-sm">
                        {word}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWordList(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activities Tab */}
      {activeSpellingTab === 'activities' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Spelling Practice Activities</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {spellingActivities.map(activity => (
              <div key={activity.id} className="p-6 rounded-xl border-2 border-purple-300 bg-purple-50 hover:bg-purple-100 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-3">{activity.icon}</div>
                  <h4 className="text-xl font-bold text-purple-800 mb-2">{activity.name}</h4>
                  <p className="text-purple-600 mb-4">{activity.description}</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold">
                    Start Activity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assessment Tab */}
      {activeSpellingTab === 'assessment' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Spelling Assessment Tools</h3>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-2xl font-bold text-blue-800 mb-4">Digital Spelling Test</h4>
              <p className="text-blue-600 mb-6">Create and administer spelling tests with automatic grading</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">📝</div>
                  <h5 className="font-bold text-blue-800">Create Test</h5>
                  <p className="text-blue-600 text-sm">Select words from any list</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">🎧</div>
                  <h5 className="font-bold text-blue-800">Audio Prompts</h5>
                  <p className="text-blue-600 text-sm">Hear each word pronounced</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-3xl mb-2">📊</div>
                  <h5 className="font-bold text-blue-800">Results</h5>
                  <p className="text-blue-600 text-sm">Instant feedback and scores</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellingCenter;