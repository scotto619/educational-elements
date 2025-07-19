// WritingCenter.js - Complete Writing Instruction Tool
import React, { useState } from 'react';

const WritingCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activeWritingTab, setActiveWritingTab] = useState('prompts');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState('narrative');
  const [writingLevel, setWritingLevel] = useState('elementary');

  // Writing prompts organized by genre and level
  const writingPrompts = {
    narrative: {
      elementary: [
        { prompt: 'Write about a time you felt proud of yourself', emoji: '🏆', theme: 'Personal Growth' },
        { prompt: 'Tell about your best day ever', emoji: '🌟', theme: 'Happy Memories' },
        { prompt: 'Write about a time you helped someone', emoji: '🤝', theme: 'Kindness' },
        { prompt: 'Describe your most exciting adventure', emoji: '🗺️', theme: 'Adventure' },
        { prompt: 'Tell about a time you learned something new', emoji: '💡', theme: 'Learning' },
        { prompt: 'Write about a special friendship', emoji: '👫', theme: 'Relationships' }
      ],
      intermediate: [
        { prompt: 'Write about a moment that changed everything', emoji: '⚡', theme: 'Life Changes' },
        { prompt: 'Tell the story of a family tradition', emoji: '🏠', theme: 'Family Heritage' },
        { prompt: 'Describe a challenge you overcame', emoji: '💪', theme: 'Perseverance' },
        { prompt: 'Write about a place that holds special meaning', emoji: '📍', theme: 'Special Places' },
        { prompt: 'Tell about a time you had to make a difficult choice', emoji: '🤔', theme: 'Decision Making' }
      ]
    },
    descriptive: {
      elementary: [
        { prompt: 'Describe your favorite place in detail', emoji: '🖼️', theme: 'Places' },
        { prompt: 'Write about your ideal bedroom', emoji: '🛏️', theme: 'Personal Space' },
        { prompt: 'Describe the perfect day outside', emoji: '☀️', theme: 'Nature' },
        { prompt: 'Tell about your favorite meal', emoji: '🍽️', theme: 'Food' },
        { prompt: 'Describe a character from your imagination', emoji: '👤', theme: 'Characters' }
      ],
      intermediate: [
        { prompt: 'Describe a setting that creates mystery', emoji: '🕵️', theme: 'Atmosphere' },
        { prompt: 'Paint a picture with words of your dream vacation', emoji: '✈️', theme: 'Travel' },
        { prompt: 'Describe the sounds, smells, and sights of your neighborhood', emoji: '🏘️', theme: 'Community' },
        { prompt: 'Write about a place that feels magical', emoji: '✨', theme: 'Fantasy Settings' }
      ]
    },
    persuasive: {
      elementary: [
        { prompt: 'Convince someone to read your favorite book', emoji: '📚', theme: 'Literature' },
        { prompt: 'Persuade your family to get a pet', emoji: '🐕', theme: 'Pets' },
        { prompt: 'Convince your teacher to have a class party', emoji: '🎉', theme: 'School Life' },
        { prompt: 'Persuade someone to try your favorite hobby', emoji: '🎨', theme: 'Hobbies' }
      ],
      intermediate: [
        { prompt: 'Argue for a later bedtime on weekends', emoji: '🌙', theme: 'Personal Freedom' },
        { prompt: 'Convince your school to add a new subject', emoji: '🏫', theme: 'Education' },
        { prompt: 'Persuade people to help the environment', emoji: '🌍', theme: 'Environmental Issues' },
        { prompt: 'Argue for more recess time at school', emoji: '⏰', theme: 'School Policy' }
      ]
    },
    informative: {
      elementary: [
        { prompt: 'Explain how to make your favorite snack', emoji: '🍪', theme: 'How-To' },
        { prompt: 'Teach someone how to play your favorite game', emoji: '🎲', theme: 'Games' },
        { prompt: 'Describe what makes a good friend', emoji: '👭', theme: 'Friendship' },
        { prompt: 'Explain why exercise is important', emoji: '🏃‍♂️', theme: 'Health' }
      ],
      intermediate: [
        { prompt: 'Explain a scientific process you find interesting', emoji: '🔬', theme: 'Science' },
        { prompt: 'Inform readers about an important historical event', emoji: '📜', theme: 'History' },
        { prompt: 'Explain how technology affects our daily lives', emoji: '💻', theme: 'Technology' },
        { prompt: 'Describe the characteristics of your favorite animal', emoji: '🦁', theme: 'Animals' }
      ]
    }
  };

  // Writing structures and organizers
  const writingStructures = {
    narrative: {
      name: 'Story Mountain',
      description: 'A classic story structure for narratives',
      sections: [
        { name: 'Beginning', description: 'Introduce characters and setting', tips: ['Who is your main character?', 'Where does the story take place?', 'When does it happen?'] },
        { name: 'Rising Action', description: 'Build up to the main problem', tips: ['What challenge or problem appears?', 'How does the character react?', 'What makes the problem worse?'] },
        { name: 'Climax', description: 'The most exciting or important moment', tips: ['This is the turning point', 'Show the biggest challenge', 'Make it exciting!'] },
        { name: 'Falling Action', description: 'Events after the climax', tips: ['How does the character solve the problem?', 'What happens next?', 'Show the character changing'] },
        { name: 'Resolution', description: 'How the story ends', tips: ['Wrap up loose ends', 'Show how the character has changed', 'Give a satisfying ending'] }
      ],
      icon: '⛰️'
    },
    persuasive: {
      name: 'OREO Method',
      description: 'Opinion, Reason, Example, Opinion (restated)',
      sections: [
        { name: 'Opinion', description: 'State your main argument clearly', tips: ['Make it clear and strong', 'Tell the reader exactly what you believe', 'Use confident language'] },
        { name: 'Reasons', description: 'Give at least 3 strong reasons', tips: ['Use facts when possible', 'Think about what matters to your audience', 'Make each reason different'] },
        { name: 'Examples', description: 'Support each reason with examples', tips: ['Use real-life examples', 'Tell short stories to prove your point', 'Use statistics if you have them'] },
        { name: 'Opinion Restated', description: 'End by restating your opinion', tips: ['Remind the reader of your main point', 'Use different words than the beginning', 'End with a call to action'] }
      ],
      icon: '🍪'
    },
    descriptive: {
      name: 'Five Senses Web',
      description: 'Organize details using all five senses',
      sections: [
        { name: 'See', description: 'What does it look like?', tips: ['Colors, shapes, sizes', 'Movement and stillness', 'Light and shadows'] },
        { name: 'Hear', description: 'What sounds are there?', tips: ['Loud or quiet sounds', 'Pleasant or annoying sounds', 'Sounds that come and go'] },
        { name: 'Smell', description: 'What does it smell like?', tips: ['Fresh or stale smells', 'Sweet or bitter scents', 'Familiar or unusual odors'] },
        { name: 'Touch', description: 'How does it feel?', tips: ['Rough or smooth textures', 'Hot or cold temperatures', 'Hard or soft materials'] },
        { name: 'Taste', description: 'What does it taste like?', tips: ['Sweet, sour, salty, bitter', 'Compare to familiar tastes', 'Remember taste memories'] }
      ],
      icon: '👁️'
    },
    informative: {
      name: 'Main Idea & Details',
      description: 'Organize information clearly and logically',
      sections: [
        { name: 'Introduction', description: 'Hook the reader and state your topic', tips: ['Start with an interesting fact', 'Ask a question', 'Tell the reader what they will learn'] },
        { name: 'Main Idea 1', description: 'First important point with details', tips: ['State the main idea clearly', 'Give 2-3 supporting details', 'Use examples or facts'] },
        { name: 'Main Idea 2', description: 'Second important point with details', tips: ['Connect to the first main idea', 'Provide new information', 'Keep details focused'] },
        { name: 'Main Idea 3', description: 'Third important point with details', tips: ['Build on previous information', 'Use strong evidence', 'Make it clear and specific'] },
        { name: 'Conclusion', description: 'Summarize and leave the reader thinking', tips: ['Remind readers of the main points', 'End with something memorable', 'Connect back to the introduction'] }
      ],
      icon: '📊'
    }
  };

  // Writing tools and strategies
  const writingTools = [
    {
      id: 'word-bank',
      name: 'Word Bank Builder',
      description: 'Generate powerful words for any writing topic',
      icon: '📝',
      color: 'blue'
    },
    {
      id: 'sentence-starters',
      name: 'Sentence Starters',
      description: 'Get help beginning sentences and paragraphs',
      icon: '🚀',
      color: 'green'
    },
    {
      id: 'transition-words',
      name: 'Transition Words',
      description: 'Connect ideas smoothly in your writing',
      icon: '🌉',
      color: 'purple'
    },
    {
      id: 'revision-checklist',
      name: 'Revision Checklist',
      description: 'Improve your writing with guided questions',
      icon: '✏️',
      color: 'orange'
    }
  ];

  // Sentence starters by genre
  const sentenceStarters = {
    narrative: [
      'Once upon a time...',
      'It all started when...',
      'I will never forget the day...',
      'The moment I realized...',
      'Everything changed when...',
      'Little did I know...',
      'As I walked into...',
      'The adventure began...'
    ],
    descriptive: [
      'Imagine a place where...',
      'Picture in your mind...',
      'The first thing you notice is...',
      'Standing there, you can see...',
      'The air is filled with...',
      'In every direction...',
      'The most striking feature is...',
      'Your senses are overwhelmed by...'
    ],
    persuasive: [
      'It is clear that...',
      'Everyone should...',
      'The evidence shows...',
      'Without a doubt...',
      'Consider this fact...',
      'The most important reason is...',
      'Studies have proven...',
      'We must take action because...'
    ],
    informative: [
      'Did you know that...',
      'Scientists have discovered...',
      'There are three main reasons...',
      'First, it is important to understand...',
      'Another key fact is...',
      'Research shows that...',
      'The process begins when...',
      'In conclusion, we can see...'
    ]
  };

  const writingTabs = [
    { id: 'prompts', name: 'Writing Prompts', icon: '💭' },
    { id: 'structures', name: 'Text Structures', icon: '🏗️' },
    { id: 'tools', name: 'Writing Tools', icon: '🛠️' },
    { id: 'gallery', name: 'Student Gallery', icon: '🖼️' }
  ];

  const handlePromptClick = (prompt) => {
    setSelectedPrompt(prompt);
    if (showToast) {
      showToast(`Selected prompt: ${prompt.theme}`, 'info');
    }
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activeWritingTab === 'prompts' && (
          <div className="space-y-8">
            {selectedPrompt ? (
              // Individual Prompt Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to All Prompts
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-6xl mx-auto">
                  <div className="text-8xl mb-6">{selectedPrompt.emoji}</div>
                  <div className="text-4xl font-bold mb-6 text-yellow-300">{selectedPrompt.theme}</div>
                  <div className="text-6xl mb-12 text-white italic leading-relaxed">
                    "{selectedPrompt.prompt}"
                  </div>
                  
                  <div className="bg-indigo-500/20 rounded-2xl p-8">
                    <h3 className="text-3xl font-bold text-indigo-300 mb-6">Sentence Starters to Help You Begin:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {sentenceStarters[selectedGenre]?.slice(0, 6).map((starter, index) => (
                        <div key={index} className="text-xl text-indigo-100 bg-indigo-600/20 rounded-lg p-3">
                          {starter}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // All Prompts Grid
              <div>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-6xl font-bold text-white">Writing Prompts</h2>
                  <div className="text-right">
                    <div className="text-2xl text-blue-300 mb-2">Genre: {selectedGenre.toUpperCase()}</div>
                    <div className="text-lg text-gray-300">Level: {writingLevel.toUpperCase()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {writingPrompts[selectedGenre]?.[writingLevel]?.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="p-8 rounded-2xl border-4 border-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/30 transition-all duration-300 hover:scale-105"
                    >
                      <div className="text-6xl mb-4">{prompt.emoji}</div>
                      <div className="text-lg font-bold text-white mb-2">{prompt.theme}</div>
                      <div className="text-sm text-gray-200 leading-relaxed">{prompt.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeWritingTab === 'structures' && (
          <div className="space-y-8">
            <h2 className="text-6xl font-bold text-center text-white mb-12">Writing Structures</h2>
            
            {writingStructures[selectedGenre] && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4">{writingStructures[selectedGenre].icon}</div>
                  <h3 className="text-4xl font-bold text-yellow-300 mb-4">{writingStructures[selectedGenre].name}</h3>
                  <p className="text-2xl text-blue-200">{writingStructures[selectedGenre].description}</p>
                </div>
                
                <div className="space-y-6">
                  {writingStructures[selectedGenre].sections.map((section, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                      <h4 className="text-2xl font-bold text-yellow-300 mb-4">
                        {index + 1}. {section.name}
                      </h4>
                      <p className="text-xl text-blue-200 mb-4">{section.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {section.tips.map((tip, tipIndex) => (
                          <div key={tipIndex} className="bg-white/20 rounded-lg p-3 text-white">
                            • {tip}
                          </div>
                        ))}
                      </div>
                    </div>
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
      {/* Writing Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <label className="font-bold text-gray-700">Genre:</label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="narrative">Narrative</option>
            <option value="descriptive">Descriptive</option>
            <option value="persuasive">Persuasive</option>
            <option value="informative">Informative</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="font-bold text-gray-700">Level:</label>
          <select
            value={writingLevel}
            onChange={(e) => setWritingLevel(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
          </select>
        </div>
      </div>

      {/* Writing Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {writingTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveWritingTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeWritingTab === tab.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Writing Prompts Tab */}
      {activeWritingTab === 'prompts' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 capitalize">{selectedGenre} Writing Prompts</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {writingPrompts[selectedGenre]?.[writingLevel]?.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className="p-6 rounded-xl border-2 border-indigo-300 bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 hover:scale-105 text-left"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{prompt.emoji}</div>
                  <div>
                    <h4 className="font-bold text-lg text-indigo-800 mb-2">{prompt.theme}</h4>
                    <p className="text-sm text-indigo-700">{prompt.prompt}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedPrompt && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-start space-x-6">
                <div className="text-6xl">{selectedPrompt.emoji}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedPrompt.theme}</h4>
                  <p className="text-lg text-indigo-600 mb-4 italic">"{selectedPrompt.prompt}"</p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-bold text-purple-700 mb-3">Sentence Starters to Help Begin:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sentenceStarters[selectedGenre]?.slice(0, 6).map((starter, index) => (
                        <div key={index} className="text-sm text-purple-800 bg-purple-100 rounded px-3 py-2">
                          {starter}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Text Structures Tab */}
      {activeWritingTab === 'structures' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 capitalize">{selectedGenre} Writing Structure</h3>
          
          {writingStructures[selectedGenre] && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">{writingStructures[selectedGenre].icon}</div>
                <h4 className="text-2xl font-bold text-blue-800 mb-2">{writingStructures[selectedGenre].name}</h4>
                <p className="text-blue-600">{writingStructures[selectedGenre].description}</p>
              </div>
              
              <div className="space-y-4">
                {writingStructures[selectedGenre].sections.map((section, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-blue-200">
                    <h5 className="text-lg font-bold text-blue-800 mb-2">
                      {index + 1}. {section.name}
                    </h5>
                    <p className="text-blue-600 mb-3">{section.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {section.tips.map((tip, tipIndex) => (
                        <div key={tipIndex} className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1">
                          • {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Writing Tools Tab */}
      {activeWritingTab === 'tools' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Writing Support Tools</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {writingTools.map(tool => (
              <div key={tool.id} className={`p-6 rounded-xl border-2 border-${tool.color}-300 bg-${tool.color}-50 hover:bg-${tool.color}-100 transition-all`}>
                <div className="text-center">
                  <div className="text-4xl mb-3">{tool.icon}</div>
                  <h4 className={`text-xl font-bold text-${tool.color}-800 mb-2`}>{tool.name}</h4>
                  <p className={`text-${tool.color}-600 mb-4`}>{tool.description}</p>
                  <button className={`px-4 py-2 bg-${tool.color}-600 text-white rounded-lg hover:bg-${tool.color}-700 font-bold`}>
                    Open Tool
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Transition Words Reference */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h4 className="text-xl font-bold text-purple-800 mb-4">Quick Reference: Transition Words</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-bold text-purple-700 mb-2">To Add Information:</h5>
                <div className="text-sm text-purple-600 space-y-1">
                  <div>also, furthermore, additionally</div>
                  <div>in addition, moreover, besides</div>
                </div>
              </div>
              <div>
                <h5 className="font-bold text-purple-700 mb-2">To Show Time:</h5>
                <div className="text-sm text-purple-600 space-y-1">
                  <div>first, next, then, finally</div>
                  <div>meanwhile, afterwards, later</div>
                </div>
              </div>
              <div>
                <h5 className="font-bold text-purple-700 mb-2">To Conclude:</h5>
                <div className="text-sm text-purple-600 space-y-1">
                  <div>in conclusion, therefore, thus</div>
                  <div>as a result, in summary</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingCenter;