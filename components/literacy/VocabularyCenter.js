// VocabularyCenter.js - Interactive Vocabulary Building Tool
import React, { useState, useEffect } from 'react';

const VocabularyCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activeVocabTab, setActiveVocabTab] = useState('word-wall');
  const [selectedWord, setSelectedWord] = useState(null);
  const [gradeLevel, setGradeLevel] = useState('grade-3');
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Grade-level vocabulary sets
  const vocabularyByGrade = {
    'grade-1': [
      { word: 'happy', definition: 'feeling joy or pleasure', synonyms: ['glad', 'joyful'], antonyms: ['sad', 'unhappy'], sentence: 'The dog was happy to see his owner.', emoji: '😊' },
      { word: 'big', definition: 'large in size', synonyms: ['large', 'huge'], antonyms: ['small', 'tiny'], sentence: 'The elephant is a big animal.', emoji: '🐘' },
      { word: 'fast', definition: 'moving quickly', synonyms: ['quick', 'speedy'], antonyms: ['slow', 'sluggish'], sentence: 'The cheetah runs very fast.', emoji: '🏃‍♂️' },
      { word: 'cold', definition: 'having a low temperature', synonyms: ['chilly', 'freezing'], antonyms: ['hot', 'warm'], sentence: 'Ice cream is cold and delicious.', emoji: '🧊' },
      { word: 'bright', definition: 'giving off light', synonyms: ['shiny', 'brilliant'], antonyms: ['dark', 'dim'], sentence: 'The sun is very bright today.', emoji: '☀️' }
    ],
    'grade-2': [
      { word: 'explore', definition: 'to travel and discover new places', synonyms: ['discover', 'investigate'], antonyms: ['ignore', 'avoid'], sentence: 'We will explore the forest today.', emoji: '🗺️' },
      { word: 'create', definition: 'to make something new', synonyms: ['build', 'construct'], antonyms: ['destroy', 'demolish'], sentence: 'Let\'s create a beautiful picture.', emoji: '🎨' },
      { word: 'courage', definition: 'bravery in facing danger', synonyms: ['bravery', 'valor'], antonyms: ['fear', 'cowardice'], sentence: 'The firefighter showed great courage.', emoji: '🦸‍♂️' },
      { word: 'friendship', definition: 'a close relationship between friends', synonyms: ['companionship', 'bond'], antonyms: ['rivalry', 'hostility'], sentence: 'Their friendship lasted many years.', emoji: '👫' },
      { word: 'adventure', definition: 'an exciting and unusual experience', synonyms: ['journey', 'expedition'], antonyms: ['routine', 'boredom'], sentence: 'Reading is like going on an adventure.', emoji: '🗺️' }
    ],
    'grade-3': [
      { word: 'magnificent', definition: 'extremely beautiful or impressive', synonyms: ['spectacular', 'splendid'], antonyms: ['ordinary', 'plain'], sentence: 'The castle looked magnificent in the sunlight.', emoji: '🏰' },
      { word: 'persevere', definition: 'to continue despite difficulties', synonyms: ['persist', 'endure'], antonyms: ['quit', 'surrender'], sentence: 'You must persevere to achieve your goals.', emoji: '💪' },
      { word: 'compassion', definition: 'feeling concern for others\' suffering', synonyms: ['empathy', 'kindness'], antonyms: ['cruelty', 'indifference'], sentence: 'She showed compassion for the injured bird.', emoji: '❤️' },
      { word: 'analyze', definition: 'to examine something carefully', synonyms: ['examine', 'study'], antonyms: ['ignore', 'overlook'], sentence: 'Let\'s analyze this math problem together.', emoji: '🔍' },
      { word: 'tremendous', definition: 'very great in amount or size', synonyms: ['enormous', 'immense'], antonyms: ['tiny', 'minimal'], sentence: 'The waves were tremendous during the storm.', emoji: '🌊' }
    ],
    'grade-4': [
      { word: 'elaborate', definition: 'involving many carefully arranged parts', synonyms: ['detailed', 'complex'], antonyms: ['simple', 'basic'], sentence: 'She created an elaborate plan for the project.', emoji: '🏗️' },
      { word: 'hypothesis', definition: 'a proposed explanation for something', synonyms: ['theory', 'prediction'], antonyms: ['fact', 'certainty'], sentence: 'Our hypothesis about plant growth was correct.', emoji: '🔬' },
      { word: 'collaborate', definition: 'to work together with others', synonyms: ['cooperate', 'partner'], antonyms: ['compete', 'oppose'], sentence: 'Students collaborate on the science project.', emoji: '🤝' },
      { word: 'resilient', definition: 'able to recover quickly from difficulties', synonyms: ['strong', 'tough'], antonyms: ['fragile', 'weak'], sentence: 'The resilient plant survived the drought.', emoji: '🌱' },
      { word: 'perspective', definition: 'a particular way of viewing things', synonyms: ['viewpoint', 'outlook'], antonyms: ['blindness', 'ignorance'], sentence: 'Each character has a different perspective.', emoji: '👁️' }
    ],
    'grade-5': [
      { word: 'comprehension', definition: 'the ability to understand something', synonyms: ['understanding', 'grasp'], antonyms: ['confusion', 'misunderstanding'], sentence: 'Reading comprehension improved with practice.', emoji: '🧠' },
      { word: 'significance', definition: 'the quality of being important', synonyms: ['importance', 'meaning'], antonyms: ['insignificance', 'triviality'], sentence: 'The discovery had great significance for science.', emoji: '⭐' },
      { word: 'transparent', definition: 'easy to see through or understand', synonyms: ['clear', 'obvious'], antonyms: ['opaque', 'hidden'], sentence: 'The glass window is completely transparent.', emoji: '🪟' },
      { word: 'consequence', definition: 'a result that follows from an action', synonyms: ['result', 'outcome'], antonyms: ['cause', 'origin'], sentence: 'Every choice has a consequence.', emoji: '⚖️' },
      { word: 'extraordinary', definition: 'very unusual or remarkable', synonyms: ['exceptional', 'amazing'], antonyms: ['ordinary', 'common'], sentence: 'Her artistic talent is extraordinary.', emoji: '✨' }
    ]
  };

  const vocabTabs = [
    { id: 'word-wall', name: 'Word Wall', icon: '🧱' },
    { id: 'word-explorer', name: 'Word Explorer', icon: '🔍' },
    { id: 'synonyms-antonyms', name: 'Synonyms & Antonyms', icon: '↔️' },
    { id: 'context-clues', name: 'Context Clues', icon: '🕵️' },
    { id: 'word-building', name: 'Word Building', icon: '🏗️' },
    { id: 'vocabulary-games', name: 'Vocabulary Games', icon: '🎮' }
  ];

  const currentVocabulary = vocabularyByGrade[gradeLevel] || [];

  // Set word of the day on component mount
  useEffect(() => {
    if (currentVocabulary.length > 0) {
      const today = new Date().getDate();
      const wordIndex = today % currentVocabulary.length;
      setWordOfTheDay(currentVocabulary[wordIndex]);
    }
  }, [gradeLevel]);

  const handleWordClick = (word) => {
    setSelectedWord(word);
    if (showToast) {
      showToast(`Exploring word: ${word.word}`, 'info');
    }
  };

  const filteredWords = currentVocabulary.filter(word =>
    word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activeVocabTab === 'word-wall' && (
          <div className="space-y-8">
            {selectedWord ? (
              // Individual Word Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedWord(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to Word Wall
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-5xl mx-auto">
                  <div className="text-8xl mb-8">{selectedWord.emoji}</div>
                  <div className="text-7xl font-bold mb-6 text-yellow-300">{selectedWord.word}</div>
                  <div className="text-3xl mb-8 text-blue-300 italic">"{selectedWord.definition}"</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="bg-green-500/20 rounded-2xl p-6">
                      <h3 className="text-2xl font-bold text-green-300 mb-4">Synonyms (Similar Words)</h3>
                      <div className="space-y-2">
                        {selectedWord.synonyms.map((synonym, index) => (
                          <div key={index} className="text-xl text-green-100">• {synonym}</div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-red-500/20 rounded-2xl p-6">
                      <h3 className="text-2xl font-bold text-red-300 mb-4">Antonyms (Opposite Words)</h3>
                      <div className="space-y-2">
                        {selectedWord.antonyms.map((antonym, index) => (
                          <div key={index} className="text-xl text-red-100">• {antonym}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-purple-500/20 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-purple-300 mb-4">Example Sentence</h3>
                    <div className="text-2xl text-purple-100 italic">"{selectedWord.sentence}"</div>
                  </div>
                </div>
              </div>
            ) : (
              // Word Wall Grid
              <div>
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-6xl font-bold text-white">Word Wall</h2>
                  <div className="text-right">
                    <div className="text-2xl text-blue-300 mb-2">Grade Level: {gradeLevel.replace('-', ' ').toUpperCase()}</div>
                    {wordOfTheDay && (
                      <div className="bg-yellow-500/20 backdrop-blur rounded-xl p-4 border border-yellow-400">
                        <div className="text-lg text-yellow-300">Word of the Day</div>
                        <div className="text-3xl font-bold text-yellow-100 flex items-center">
                          {wordOfTheDay.emoji} {wordOfTheDay.word}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
                  {currentVocabulary.map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordClick(word)}
                      className={`p-6 rounded-2xl border-4 transition-all duration-300 hover:scale-110 ${
                        wordOfTheDay && word.word === wordOfTheDay.word
                          ? 'border-yellow-400 bg-yellow-500/30 shadow-lg shadow-yellow-500/20'
                          : 'border-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
                      }`}
                    >
                      <div className="text-4xl mb-2">{word.emoji}</div>
                      <div className="text-xl font-bold text-white">{word.word}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeVocabTab === 'synonyms-antonyms' && (
          <div className="space-y-8">
            <h2 className="text-6xl font-bold text-center text-white mb-12">Synonyms & Antonyms</h2>
            
            {selectedWord ? (
              <div className="max-w-6xl mx-auto">
                <button
                  onClick={() => setSelectedWord(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Choose Another Word
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Word */}
                  <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-center">
                    <div className="text-6xl mb-4">{selectedWord.emoji}</div>
                    <div className="text-4xl font-bold text-yellow-300">{selectedWord.word}</div>
                    <div className="text-xl text-blue-200 mt-4 italic">"{selectedWord.definition}"</div>
                  </div>

                  {/* Synonyms */}
                  <div className="bg-green-500/20 backdrop-blur rounded-3xl p-8">
                    <h3 className="text-3xl font-bold text-green-300 mb-6 text-center">Synonyms</h3>
                    <div className="space-y-4">
                      {selectedWord.synonyms.map((synonym, index) => (
                        <div key={index} className="text-2xl text-green-100 text-center p-3 bg-green-600/20 rounded-xl">
                          {synonym}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Antonyms */}
                  <div className="bg-red-500/20 backdrop-blur rounded-3xl p-8">
                    <h3 className="text-3xl font-bold text-red-300 mb-6 text-center">Antonyms</h3>
                    <div className="space-y-4">
                      {selectedWord.antonyms.map((antonym, index) => (
                        <div key={index} className="text-2xl text-red-100 text-center p-3 bg-red-600/20 rounded-xl">
                          {antonym}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl text-blue-300 mb-8">Choose a word to explore synonyms and antonyms</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {currentVocabulary.slice(0, 8).map((word, index) => (
                    <button
                      key={index}
                      onClick={() => handleWordClick(word)}
                      className="p-4 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all border border-white/30"
                    >
                      <div className="text-3xl mb-2">{word.emoji}</div>
                      <div className="text-lg font-bold text-white">{word.word}</div>
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
      {/* Grade Level Selector */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-bold text-gray-700">Grade Level:</label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="grade-1">Grade 1</option>
            <option value="grade-2">Grade 2</option>
            <option value="grade-3">Grade 3</option>
            <option value="grade-4">Grade 4</option>
            <option value="grade-5">Grade 5</option>
          </select>
        </div>

        {/* Word of the Day */}
        {wordOfTheDay && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-700 font-bold">Word of the Day</div>
            <div className="text-lg font-bold text-yellow-800 flex items-center">
              {wordOfTheDay.emoji} {wordOfTheDay.word}
            </div>
          </div>
        )}
      </div>

      {/* Vocabulary Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {vocabTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveVocabTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeVocabTab === tab.id
                ? 'bg-green-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Word Wall Tab */}
      {activeVocabTab === 'word-wall' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">Interactive Word Wall</h3>
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  wordOfTheDay && word.word === wordOfTheDay.word
                    ? 'border-yellow-400 bg-yellow-50 shadow-lg'
                    : 'border-green-300 bg-green-50 hover:bg-green-100'
                }`}
              >
                <div className="text-3xl mb-2">{word.emoji}</div>
                <div className="text-sm font-bold text-gray-800">{word.word}</div>
              </button>
            ))}
          </div>

          {selectedWord && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start space-x-6">
                <div className="text-6xl">{selectedWord.emoji}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedWord.word}</h4>
                  <p className="text-lg text-blue-600 mb-4 italic">"{selectedWord.definition}"</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-bold text-green-700 mb-2">Synonyms:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.synonyms.map((synonym, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-bold text-red-700 mb-2">Antonyms:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedWord.antonyms.map((antonym, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                            {antonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h5 className="font-bold text-purple-700 mb-2">Example Sentence:</h5>
                    <p className="text-purple-800 italic">"{selectedWord.sentence}"</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Synonyms & Antonyms Tab */}
      {activeVocabTab === 'synonyms-antonyms' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Synonyms & Antonyms Explorer</h3>
          
          {!selectedWord ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600 mb-6">Select a word to explore its synonyms and antonyms</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
                {currentVocabulary.slice(0, 10).map((word, index) => (
                  <button
                    key={index}
                    onClick={() => handleWordClick(word)}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <div className="text-2xl mb-1">{word.emoji}</div>
                    <div className="text-sm font-bold">{word.word}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Word */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200 text-center">
                <div className="text-5xl mb-4">{selectedWord.emoji}</div>
                <h4 className="text-2xl font-bold text-blue-800 mb-2">{selectedWord.word}</h4>
                <p className="text-blue-600 italic mb-4">"{selectedWord.definition}"</p>
                <button
                  onClick={() => setSelectedWord(null)}
                  className="px-4 py-2 bg-blue-200 text-blue-800 rounded-lg hover:bg-blue-300 text-sm"
                >
                  Choose Different Word
                </button>
              </div>

              {/* Synonyms */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h5 className="text-xl font-bold text-green-800 mb-4 text-center">
                  Synonyms (Similar Meaning)
                </h5>
                <div className="space-y-3">
                  {selectedWord.synonyms.map((synonym, index) => (
                    <div key={index} className="p-3 bg-green-100 rounded-lg text-center">
                      <div className="font-bold text-green-800">{synonym}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Antonyms */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                <h5 className="text-xl font-bold text-red-800 mb-4 text-center">
                  Antonyms (Opposite Meaning)
                </h5>
                <div className="space-y-3">
                  {selectedWord.antonyms.map((antonym, index) => (
                    <div key={index} className="p-3 bg-red-100 rounded-lg text-center">
                      <div className="font-bold text-red-800">{antonym}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabularyCenter;