// ComprehensionCenter.js - Reading Comprehension Strategies Tool
import React, { useState } from 'react';

const ComprehensionCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activeCompTab, setActiveCompTab] = useState('strategies');
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [questionType, setQuestionType] = useState('all');

  // Reading strategies with visual aids
  const readingStrategies = [
    {
      id: 'predict',
      name: 'Make Predictions',
      icon: '🔮',
      description: 'Use clues to guess what might happen next',
      steps: [
        'Look at the title and pictures',
        'Think about what you already know',
        'Make a guess about what will happen',
        'Read to check your prediction'
      ],
      example: 'If you see storm clouds in a picture, you might predict it will rain in the story.',
      color: 'blue'
    },
    {
      id: 'visualize',
      name: 'Visualize',
      icon: '🎬',
      description: 'Create pictures in your mind as you read',
      steps: [
        'Read the descriptive words carefully',
        'Close your eyes and imagine the scene',
        'Use all five senses in your mental picture',
        'Draw or describe what you see'
      ],
      example: 'When reading about a beach, imagine the sand, waves, and seagulls.',
      color: 'green'
    },
    {
      id: 'connect',
      name: 'Make Connections',
      icon: '🔗',
      description: 'Connect the text to your life and other books',
      steps: [
        'Text-to-Self: How does this relate to me?',
        'Text-to-Text: What other books is this like?',
        'Text-to-World: How does this connect to the world?',
        'Share your connections with others'
      ],
      example: 'This character reminds me of my little brother who is also curious.',
      color: 'purple'
    },
    {
      id: 'question',
      name: 'Ask Questions',
      icon: '❓',
      description: 'Ask questions before, during, and after reading',
      steps: [
        'Before: What do I think this will be about?',
        'During: Why did the character do that?',
        'After: What was the main message?',
        'Look for answers as you read'
      ],
      example: 'Why is the character feeling sad? What might make them happy?',
      color: 'orange'
    },
    {
      id: 'summarize',
      name: 'Summarize',
      icon: '📝',
      description: 'Retell the most important parts',
      steps: [
        'Identify the main characters',
        'Find the main problem or event',
        'Tell what happened in order',
        'Include only the most important details'
      ],
      example: 'This story is about a lost puppy who finds his way home with help from friends.',
      color: 'red'
    },
    {
      id: 'infer',
      name: 'Make Inferences',
      icon: '🕵️',
      description: 'Use clues to figure out things not directly stated',
      steps: [
        'Find clues in the text',
        'Think about what you know',
        'Put clues together',
        'Make a smart guess'
      ],
      example: 'The character is shivering and wearing a coat - they must be cold.',
      color: 'indigo'
    }
  ];

  // Sample reading passages with questions
  const readingPassages = [
    {
      id: 'butterfly',
      title: 'The Amazing Butterfly',
      level: 'Grade 2-3',
      text: `Maya loved spending time in her grandmother's garden. One sunny morning, she noticed something special. A tiny green caterpillar was munching on a milkweed leaf.

"Grandma, look!" Maya called excitedly.

Her grandmother smiled. "That little caterpillar will become something beautiful soon," she said mysteriously.

Every day, Maya watched the caterpillar grow bigger and bigger. Then one day, it was gone! In its place hung a strange green case.

"Don't worry," Grandma said. "Magic is happening inside."

Two weeks later, Maya gasped. A beautiful orange and black monarch butterfly emerged from the case, spread its wings, and flew away.

"Now you know the secret of metamorphosis," Grandma said with a twinkle in her eye.`,
      questions: [
        { type: 'literal', question: 'What was the caterpillar eating?', answer: 'A milkweed leaf' },
        { type: 'inferential', question: 'How did Maya feel when she saw the caterpillar?', answer: 'Excited/happy' },
        { type: 'vocabulary', question: 'What does "metamorphosis" mean?', answer: 'The process of changing form' },
        { type: 'main-idea', question: 'What is this story mainly about?', answer: 'A caterpillar changing into a butterfly' }
      ]
    },
    {
      id: 'friendship',
      title: 'The New Student',
      level: 'Grade 3-4',
      text: `Emma nervously walked into her new classroom. She didn't know anyone, and her stomach felt like it was full of butterflies. All the students seemed to already have friends.

During lunch, Emma sat alone at a table, picking at her sandwich. She watched the other kids laughing and talking together.

"Hi! I'm Marcus," said a friendly voice. A boy with a big smile sat down next to her. "You must be the new student. Want to join our soccer game after lunch?"

Emma's face lit up. "I'd love to! I used to play soccer at my old school."

"Great! Sarah and I are team captains. You can be on my team," Marcus said.

From that day on, Emma looked forward to coming to school. She had found not just one friend, but a whole group of kids who welcomed her with open arms.`,
      questions: [
        { type: 'literal', question: 'Who invited Emma to play soccer?', answer: 'Marcus' },
        { type: 'inferential', question: 'How did Emma feel at the beginning of the story?', answer: 'Nervous, scared, worried' },
        { type: 'vocabulary', question: 'What does "her stomach felt like it was full of butterflies" mean?', answer: 'She felt nervous' },
        { type: 'theme', question: 'What is the main message of this story?', answer: 'Being kind to new people/the importance of friendship' }
      ]
    }
  ];

  // Question types for comprehension practice
  const questionTypes = [
    { id: 'literal', name: 'Right There Questions', description: 'Answers found directly in the text', icon: '📍' },
    { id: 'inferential', name: 'Think & Search Questions', description: 'Answers require thinking about clues', icon: '🤔' },
    { id: 'vocabulary', name: 'Vocabulary Questions', description: 'Understanding word meanings', icon: '📚' },
    { id: 'main-idea', name: 'Main Idea Questions', description: 'Central message or theme', icon: '🎯' },
    { id: 'theme', name: 'Theme Questions', description: 'Life lessons or deeper meanings', icon: '💡' }
  ];

  const compTabs = [
    { id: 'strategies', name: 'Reading Strategies', icon: '🧠' },
    { id: 'passages', name: 'Practice Passages', icon: '📖' },
    { id: 'question-types', name: 'Question Types', icon: '❓' },
    { id: 'graphic-organizers', name: 'Graphic Organizers', icon: '📊' }
  ];

  const handleStrategyClick = (strategy) => {
    setSelectedStrategy(strategy);
    if (showToast) {
      showToast(`Teaching strategy: ${strategy.name}`, 'info');
    }
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activeCompTab === 'strategies' && (
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
                    
                    <div className="bg-purple-500/20 rounded-2xl p-8">
                      <h3 className="text-3xl font-bold text-purple-300 mb-6">Example:</h3>
                      <div className="text-2xl text-purple-100 italic leading-relaxed">
                        "{selectedStrategy.example}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // All Strategies Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Reading Strategies</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {readingStrategies.map(strategy => (
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

        {activeCompTab === 'question-types' && (
          <div className="space-y-8">
            <h2 className="text-6xl font-bold text-center text-white mb-12">Types of Reading Questions</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {questionTypes.map((type, index) => (
                <div key={type.id} className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                  <div className="text-center">
                    <div className="text-5xl mb-4">{type.icon}</div>
                    <h3 className="text-3xl font-bold text-yellow-300 mb-4">{type.name}</h3>
                    <p className="text-xl text-blue-200">{type.description}</p>
                  </div>
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
      {/* Comprehension Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {compTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCompTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeCompTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Reading Strategies Tab */}
      {activeCompTab === 'strategies' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Reading Comprehension Strategies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readingStrategies.map(strategy => (
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
                      <h5 className={`font-bold text-${selectedStrategy.color}-700 mb-3`}>Steps to Teach:</h5>
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
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h5 className="font-bold text-purple-700 mb-2">Example:</h5>
                      <p className="text-purple-800 italic">"{selectedStrategy.example}"</p>
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
      {activeCompTab === 'passages' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Practice Reading Passages</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {readingPassages.map(passage => (
              <div key={passage.id} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{passage.title}</h4>
                    <span className="text-sm text-blue-600 font-medium">{passage.level}</span>
                  </div>
                  <button
                    onClick={() => setSelectedPassage(selectedPassage === passage.id ? null : passage.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    {selectedPassage === passage.id ? 'Hide' : 'View'}
                  </button>
                </div>
                
                {selectedPassage === passage.id && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm leading-relaxed whitespace-pre-line">{passage.text}</div>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-gray-800 mb-3">Comprehension Questions:</h5>
                      <div className="space-y-3">
                        {passage.questions.map((q, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-600 font-bold">{index + 1}.</span>
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium">{q.question}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-bold">Type:</span> {q.type.replace('-', ' ')}
                                </p>
                                <details className="mt-2">
                                  <summary className="text-blue-600 cursor-pointer text-sm">Show Answer</summary>
                                  <p className="text-green-700 font-medium mt-1">{q.answer}</p>
                                </details>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Types Tab */}
      {activeCompTab === 'question-types' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Understanding Question Types</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {questionTypes.map(type => (
              <div key={type.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{type.name}</h4>
                  <p className="text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprehensionCenter;