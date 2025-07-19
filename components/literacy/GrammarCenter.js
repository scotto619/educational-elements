// GrammarCenter.js - Complete Grammar Instruction Tool
import React, { useState } from 'react';

const GrammarCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activeGrammarTab, setActiveGrammarTab] = useState('parts-of-speech');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [grammarLevel, setGrammarLevel] = useState('elementary');

  // Grammar topics organized by category and level
  const grammarTopics = {
    'parts-of-speech': {
      elementary: [
        {
          id: 'nouns',
          name: 'Nouns',
          icon: '🏷️',
          definition: 'Words that name people, places, things, or ideas',
          examples: ['cat', 'school', 'happiness', 'teacher', 'playground'],
          types: ['Person: teacher, friend, sister', 'Place: school, park, home', 'Thing: book, car, toy', 'Idea: love, freedom, fun'],
          activities: ['Noun Hunt in sentences', 'Sort common vs proper nouns', 'Identify singular vs plural'],
          color: 'blue'
        },
        {
          id: 'verbs',
          name: 'Verbs',
          icon: '🏃‍♂️',
          definition: 'Words that show action or state of being',
          examples: ['run', 'jump', 'is', 'are', 'think'],
          types: ['Action: run, jump, swim, write', 'Being: is, are, was, were', 'Helping: have, has, will, can'],
          activities: ['Act out action verbs', 'Find verbs in stories', 'Practice verb tenses'],
          color: 'green'
        },
        {
          id: 'adjectives',
          name: 'Adjectives',
          icon: '🎨',
          definition: 'Words that describe or modify nouns',
          examples: ['big', 'red', 'happy', 'beautiful', 'three'],
          types: ['Size: big, small, tiny, huge', 'Color: red, blue, green, yellow', 'Feeling: happy, sad, excited', 'Number: one, two, many, few'],
          activities: ['Describe pictures with adjectives', 'Compare objects using adjectives', 'Add adjectives to boring sentences'],
          color: 'purple'
        },
        {
          id: 'adverbs',
          name: 'Adverbs',
          icon: '⚡',
          definition: 'Words that describe verbs, adjectives, or other adverbs',
          examples: ['quickly', 'carefully', 'very', 'loudly', 'often'],
          types: ['How: quickly, slowly, carefully', 'When: yesterday, today, often', 'Where: here, there, everywhere', 'How much: very, quite, extremely'],
          activities: ['Act out actions with different adverbs', 'Find adverbs ending in -ly', 'Improve sentences with adverbs'],
          color: 'orange'
        }
      ],
      intermediate: [
        {
          id: 'pronouns',
          name: 'Pronouns',
          icon: '👤',
          definition: 'Words that take the place of nouns',
          examples: ['he', 'she', 'it', 'they', 'we', 'him', 'her'],
          types: ['Subject pronouns: I, you, he, she, it, we, they', 'Object pronouns: me, you, him, her, it, us, them', 'Possessive: my, your, his, her, its, our, their'],
          activities: ['Replace nouns with pronouns', 'Identify pronoun types', 'Fix pronoun agreement errors'],
          color: 'pink'
        },
        {
          id: 'prepositions',
          name: 'Prepositions',
          icon: '📍',
          definition: 'Words that show relationships between other words',
          examples: ['in', 'on', 'under', 'beside', 'through'],
          types: ['Location: in, on, under, above, beside', 'Time: before, after, during, until', 'Direction: to, from, through, toward'],
          activities: ['Use objects to show preposition meanings', 'Complete prepositional phrases', 'Draw pictures showing prepositions'],
          color: 'indigo'
        }
      ]
    },
    'sentence-structure': {
      elementary: [
        {
          id: 'simple-sentences',
          name: 'Simple Sentences',
          icon: '📝',
          definition: 'A complete thought with a subject and predicate',
          examples: ['Dogs bark.', 'The cat sleeps.', 'Children play outside.'],
          types: ['Subject + Verb: Dogs bark', 'Subject + Verb + Object: Cat caught mouse', 'Subject + Verb + Complement: Sky is blue'],
          activities: ['Identify subjects and predicates', 'Build sentences with word cards', 'Fix sentence fragments'],
          color: 'blue'
        },
        {
          id: 'sentence-types',
          name: 'Types of Sentences',
          icon: '❓',
          definition: 'Sentences that make statements, ask questions, give commands, or show excitement',
          examples: ['I like pizza. (statement)', 'Do you like pizza? (question)', 'Eat your pizza! (command)', 'What delicious pizza! (exclamation)'],
          types: ['Statement (.): tells something', 'Question (?): asks something', 'Command (.): tells someone to do something', 'Exclamation (!): shows strong feeling'],
          activities: ['Sort sentences by type', 'Change statements to questions', 'Practice using correct punctuation'],
          color: 'green'
        }
      ],
      intermediate: [
        {
          id: 'compound-sentences',
          name: 'Compound Sentences',
          icon: '🔗',
          definition: 'Two simple sentences joined by a conjunction',
          examples: ['I like pizza, and she likes tacos.', 'It was raining, so we stayed inside.'],
          types: ['and: adds information', 'but: shows contrast', 'or: shows choice', 'so: shows result'],
          activities: ['Combine simple sentences', 'Identify conjunctions', 'Practice comma placement'],
          color: 'purple'
        }
      ]
    },
    'punctuation': {
      elementary: [
        {
          id: 'end-marks',
          name: 'End Punctuation',
          icon: '🔚',
          definition: 'Marks that end sentences',
          examples: ['I like school.', 'Do you like school?', 'School is great!'],
          types: ['Period (.): ends statements and commands', 'Question mark (?): ends questions', 'Exclamation point (!): ends exclamations'],
          activities: ['Add correct end marks', 'Read sentences with proper expression', 'Sort sentences by end punctuation'],
          color: 'red'
        },
        {
          id: 'commas',
          name: 'Commas',
          icon: '🪃',
          definition: 'Marks that separate parts of sentences',
          examples: ['I like apples, oranges, and bananas.', 'Yes, I will help you.'],
          types: ['Lists: red, blue, and green', 'Before conjunctions: happy, but tired', 'After introductory words: Yes, I agree'],
          activities: ['Add commas to lists', 'Practice comma rules', 'Read with comma pauses'],
          color: 'orange'
        }
      ]
    },
    'capitalization': {
      elementary: [
        {
          id: 'basic-caps',
          name: 'Basic Capitalization',
          icon: '🔠',
          definition: 'When to use capital letters',
          examples: ['John goes to Lincoln School.', 'We celebrate Christmas in December.'],
          types: ['First word of sentence', 'Names of people', 'Names of places', 'Names of holidays', 'Days and months', 'The word "I"'],
          activities: ['Fix capitalization errors', 'Identify words that need capitals', 'Practice proper noun capitalization'],
          color: 'blue'
        }
      ]
    }
  };

  // Grammar games and activities
  const grammarGames = [
    {
      id: 'word-sorting',
      name: 'Grammar Word Sort',
      description: 'Sort words into grammar categories',
      icon: '📋',
      activity: 'drag-drop'
    },
    {
      id: 'sentence-building',
      name: 'Sentence Builder',
      description: 'Build sentences using different parts of speech',
      icon: '🏗️',
      activity: 'construction'
    },
    {
      id: 'grammar-detective',
      name: 'Grammar Detective',
      description: 'Find and fix grammar mistakes',
      icon: '🕵️',
      activity: 'error-finding'
    },
    {
      id: 'mad-libs',
      name: 'Grammar Mad Libs',
      description: 'Fill in missing parts of speech',
      icon: '😄',
      activity: 'fill-in'
    }
  ];

  // Common grammar rules and tips
  const grammarRules = {
    'subject-verb-agreement': {
      rule: 'Subjects and verbs must agree in number',
      examples: ['Correct: The cat runs.', 'Incorrect: The cat run.', 'Correct: The cats run.', 'Incorrect: The cats runs.'],
      tip: 'Singular subjects need singular verbs, plural subjects need plural verbs'
    },
    'pronoun-agreement': {
      rule: 'Pronouns must agree with the nouns they replace',
      examples: ['Correct: Sarah likes her book.', 'Incorrect: Sarah likes their book.', 'Correct: The boys finished their homework.'],
      tip: 'Make sure the pronoun matches in number and gender'
    },
    'apostrophes': {
      rule: 'Use apostrophes for contractions and possessives',
      examples: ['Contraction: can\'t, won\'t, it\'s', 'Possessive: cat\'s toy, dogs\' bowls', 'NOT plural: cats (not cat\'s)'],
      tip: 'Remember: it\'s = it is, its = belonging to it'
    }
  };

  const grammarTabs = [
    { id: 'parts-of-speech', name: 'Parts of Speech', icon: '🏷️' },
    { id: 'sentence-structure', name: 'Sentence Structure', icon: '🏗️' },
    { id: 'punctuation', name: 'Punctuation', icon: '🔚' },
    { id: 'capitalization', name: 'Capitalization', icon: '🔠' },
    { id: 'games', name: 'Grammar Games', icon: '🎮' },
    { id: 'rules', name: 'Grammar Rules', icon: '📏' }
  ];

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
    if (showToast) {
      showToast(`Teaching: ${topic.name}`, 'info');
    }
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activeGrammarTab === 'parts-of-speech' && (
          <div className="space-y-8">
            {selectedTopic ? (
              // Individual Topic Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to Parts of Speech
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-6xl mx-auto">
                  <div className="text-8xl mb-6">{selectedTopic.icon}</div>
                  <div className="text-6xl font-bold mb-6 text-yellow-300">{selectedTopic.name}</div>
                  <div className="text-3xl mb-12 text-blue-300 italic">"{selectedTopic.definition}"</div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
                    <div className={`bg-${selectedTopic.color}-500/20 rounded-2xl p-8`}>
                      <h3 className="text-3xl font-bold text-white mb-6">Types & Examples:</h3>
                      <div className="space-y-4">
                        {selectedTopic.types.map((type, index) => (
                          <div key={index} className="text-xl text-white bg-white/20 rounded-lg p-4">
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-green-500/20 rounded-2xl p-8">
                      <h3 className="text-3xl font-bold text-green-300 mb-6">Example Words:</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedTopic.examples.map((example, index) => (
                          <div key={index} className="text-2xl text-green-100 text-center bg-green-600/20 rounded-lg p-3">
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // All Topics Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Parts of Speech</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {grammarTopics['parts-of-speech'][grammarLevel]?.map(topic => (
                    <button
                      key={topic.id}
                      onClick={() => handleTopicClick(topic)}
                      className={`p-8 rounded-2xl border-4 border-${topic.color}-400 bg-${topic.color}-500/20 hover:bg-${topic.color}-500/30 transition-all duration-300 hover:scale-105`}
                    >
                      <div className="text-6xl mb-4">{topic.icon}</div>
                      <div className="text-2xl font-bold text-white mb-2">{topic.name}</div>
                      <div className="text-lg text-gray-200">{topic.definition}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeGrammarTab === 'sentence-structure' && (
          <div className="space-y-8">
            <h2 className="text-6xl font-bold text-center text-white mb-12">Sentence Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {grammarTopics['sentence-structure'][grammarLevel]?.map(topic => (
                <div key={topic.id} className={`bg-${topic.color}-500/20 backdrop-blur rounded-2xl p-8 border border-${topic.color}-400`}>
                  <div className="text-center">
                    <div className="text-5xl mb-4">{topic.icon}</div>
                    <h3 className="text-3xl font-bold text-white mb-4">{topic.name}</h3>
                    <p className="text-xl text-gray-200 mb-6">{topic.definition}</p>
                    <div className="space-y-3">
                      {topic.examples.map((example, index) => (
                        <div key={index} className="text-lg text-white bg-white/20 rounded-lg p-3">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeGrammarTab === 'games' && (
          <div className="space-y-8">
            <h2 className="text-6xl font-bold text-center text-white mb-12">Grammar Games</h2>
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
              {grammarGames.map(game => (
                <div key={game.id} className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 text-center">
                  <div className="text-5xl mb-4">{game.icon}</div>
                  <h3 className="text-2xl font-bold text-yellow-300 mb-4">{game.name}</h3>
                  <p className="text-xl text-blue-200">{game.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Teacher Mode
  return (
    <div className="p-6">
      {/* Grammar Level Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700">Grammar Level:</label>
          <select
            value={grammarLevel}
            onChange={(e) => setGrammarLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
          >
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {/* Grammar Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {grammarTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveGrammarTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeGrammarTab === tab.id
                ? 'bg-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Parts of Speech Tab */}
      {activeGrammarTab === 'parts-of-speech' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Parts of Speech</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grammarTopics['parts-of-speech'][grammarLevel]?.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicClick(topic)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-left border-${topic.color}-300 bg-${topic.color}-50 hover:bg-${topic.color}-100`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{topic.icon}</div>
                  <div>
                    <h4 className={`font-bold text-lg text-${topic.color}-800 mb-2`}>{topic.name}</h4>
                    <p className={`text-sm text-${topic.color}-700 mb-2`}>{topic.definition}</p>
                    <div className="text-xs text-gray-600">{topic.examples.length} examples</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedTopic && (
            <div className={`bg-gradient-to-r from-${selectedTopic.color}-50 to-purple-50 rounded-xl p-6 border border-${selectedTopic.color}-200`}>
              <div className="flex items-start space-x-6">
                <div className="text-6xl">{selectedTopic.icon}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedTopic.name}</h4>
                  <p className="text-lg text-gray-600 mb-4 italic">"{selectedTopic.definition}"</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className={`font-bold text-${selectedTopic.color}-700 mb-3`}>Types & Examples:</h5>
                      <div className="space-y-2">
                        {selectedTopic.types.map((type, index) => (
                          <div key={index} className={`text-sm text-${selectedTopic.color}-800 bg-${selectedTopic.color}-100 rounded px-3 py-2`}>
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-green-700 mb-3">Example Words:</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTopic.examples.map((example, index) => (
                          <span key={index} className="px-3 py-2 bg-green-100 text-green-800 rounded-lg font-bold text-center text-sm">
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-bold text-blue-700 mb-2">Teaching Activities:</h5>
                    <div className="space-y-1">
                      {selectedTopic.activities.map((activity, index) => (
                        <div key={index} className="text-sm text-blue-600">• {activity}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sentence Structure Tab */}
      {activeGrammarTab === 'sentence-structure' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Sentence Structure</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grammarTopics['sentence-structure'][grammarLevel]?.map(topic => (
              <div key={topic.id} className={`p-6 rounded-xl border-2 border-${topic.color}-300 bg-${topic.color}-50`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">{topic.icon}</div>
                  <h4 className={`text-xl font-bold text-${topic.color}-800 mb-2`}>{topic.name}</h4>
                  <p className={`text-${topic.color}-600 mb-4`}>{topic.definition}</p>
                  <div className="space-y-2">
                    {topic.examples.map((example, index) => (
                      <div key={index} className="text-sm text-gray-700 bg-white rounded px-3 py-2">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Punctuation Tab */}
      {activeGrammarTab === 'punctuation' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Punctuation Rules</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grammarTopics['punctuation'][grammarLevel]?.map(topic => (
              <div key={topic.id} className={`p-6 rounded-xl border-2 border-${topic.color}-300 bg-${topic.color}-50`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">{topic.icon}</div>
                  <h4 className={`text-xl font-bold text-${topic.color}-800 mb-2`}>{topic.name}</h4>
                  <p className={`text-${topic.color}-600 mb-4`}>{topic.definition}</p>
                  <div className="space-y-2">
                    {topic.examples.map((example, index) => (
                      <div key={index} className="text-sm text-gray-700 bg-white rounded px-3 py-2">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Games Tab */}
      {activeGrammarTab === 'games' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Interactive Grammar Games</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {grammarGames.map(game => (
              <div key={game.id} className="p-6 rounded-xl border-2 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-all">
                <div className="text-center">
                  <div className="text-4xl mb-3">{game.icon}</div>
                  <h4 className="text-xl font-bold text-yellow-800 mb-2">{game.name}</h4>
                  <p className="text-yellow-600 mb-4">{game.description}</p>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold">
                    Play Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Rules Tab */}
      {activeGrammarTab === 'rules' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Important Grammar Rules</h3>
          
          <div className="space-y-6">
            {Object.entries(grammarRules).map(([ruleId, rule]) => (
              <div key={ruleId} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-xl font-bold text-blue-800 mb-4">{rule.rule}</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-blue-700 mb-2">Examples:</h5>
                    <div className="space-y-2">
                      {rule.examples.map((example, index) => (
                        <div key={index} className="text-sm text-blue-600 bg-blue-100 rounded px-3 py-2">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-bold text-green-700 mb-2">Teaching Tip:</h5>
                    <p className="text-green-800 text-sm">{rule.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarCenter;