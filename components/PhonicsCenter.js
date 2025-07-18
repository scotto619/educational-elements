// PhonicsCenter.js - Interactive Phonics and Sounds Teaching Tool
import React, { useState, useEffect } from 'react';

const PhonicsCenter = ({ showToast, displayMode = 'teacher' }) => {
  const [activePhonicsTab, setActivePhonicsTab] = useState('letter-sounds');
  const [selectedSound, setSelectedSound] = useState(null);
  const [practiceMode, setPracticeMode] = useState('show-all');
  const [currentBlend, setCurrentBlend] = useState(null);

  // Comprehensive phonics data
  const letterSounds = [
    { letter: 'A', sound: '/a/', example: 'Apple', image: '🍎', type: 'vowel' },
    { letter: 'B', sound: '/b/', example: 'Ball', image: '⚽', type: 'consonant' },
    { letter: 'C', sound: '/k/', example: 'Cat', image: '🐱', type: 'consonant' },
    { letter: 'D', sound: '/d/', example: 'Dog', image: '🐕', type: 'consonant' },
    { letter: 'E', sound: '/e/', example: 'Egg', image: '🥚', type: 'vowel' },
    { letter: 'F', sound: '/f/', example: 'Fish', image: '🐟', type: 'consonant' },
    { letter: 'G', sound: '/g/', example: 'Goat', image: '🐐', type: 'consonant' },
    { letter: 'H', sound: '/h/', example: 'Hat', image: '👒', type: 'consonant' },
    { letter: 'I', sound: '/i/', example: 'Igloo', image: '🏠', type: 'vowel' },
    { letter: 'J', sound: '/j/', example: 'Jam', image: '🍯', type: 'consonant' },
    { letter: 'K', sound: '/k/', example: 'Kite', image: '🪁', type: 'consonant' },
    { letter: 'L', sound: '/l/', example: 'Lion', image: '🦁', type: 'consonant' },
    { letter: 'M', sound: '/m/', example: 'Moon', image: '🌙', type: 'consonant' },
    { letter: 'N', sound: '/n/', example: 'Net', image: '🥅', type: 'consonant' },
    { letter: 'O', sound: '/o/', example: 'Octopus', image: '🐙', type: 'vowel' },
    { letter: 'P', sound: '/p/', example: 'Penguin', image: '🐧', type: 'consonant' },
    { letter: 'Q', sound: '/kw/', example: 'Queen', image: '👸', type: 'consonant' },
    { letter: 'R', sound: '/r/', example: 'Robot', image: '🤖', type: 'consonant' },
    { letter: 'S', sound: '/s/', example: 'Sun', image: '☀️', type: 'consonant' },
    { letter: 'T', sound: '/t/', example: 'Tiger', image: '🐅', type: 'consonant' },
    { letter: 'U', sound: '/u/', example: 'Umbrella', image: '☂️', type: 'vowel' },
    { letter: 'V', sound: '/v/', example: 'Violin', image: '🎻', type: 'consonant' },
    { letter: 'W', sound: '/w/', example: 'Whale', image: '🐋', type: 'consonant' },
    { letter: 'X', sound: '/ks/', example: 'X-ray', image: '🩻', type: 'consonant' },
    { letter: 'Y', sound: '/y/', example: 'Yak', image: '🐃', type: 'consonant' },
    { letter: 'Z', sound: '/z/', example: 'Zebra', image: '🦓', type: 'consonant' }
  ];

  const commonBlends = [
    { blend: 'bl', examples: ['blue', 'block', 'blend'], sound: '/bl/' },
    { blend: 'br', examples: ['brown', 'bread', 'brick'], sound: '/br/' },
    { blend: 'cl', examples: ['clock', 'cloud', 'clean'], sound: '/kl/' },
    { blend: 'cr', examples: ['crab', 'crown', 'crash'], sound: '/kr/' },
    { blend: 'dr', examples: ['dragon', 'drum', 'drop'], sound: '/dr/' },
    { blend: 'fl', examples: ['flag', 'flower', 'fly'], sound: '/fl/' },
    { blend: 'fr', examples: ['frog', 'fruit', 'fresh'], sound: '/fr/' },
    { blend: 'gl', examples: ['glass', 'glue', 'globe'], sound: '/gl/' },
    { blend: 'gr', examples: ['green', 'grass', 'grape'], sound: '/gr/' },
    { blend: 'pl', examples: ['plant', 'play', 'plus'], sound: '/pl/' },
    { blend: 'pr', examples: ['prince', 'pretty', 'prize'], sound: '/pr/' },
    { blend: 'sc', examples: ['school', 'scare', 'score'], sound: '/sk/' },
    { blend: 'sk', examples: ['sky', 'skip', 'skull'], sound: '/sk/' },
    { blend: 'sl', examples: ['slide', 'slow', 'sleep'], sound: '/sl/' },
    { blend: 'sm', examples: ['smile', 'small', 'smoke'], sound: '/sm/' },
    { blend: 'sn', examples: ['snake', 'snow', 'snack'], sound: '/sn/' },
    { blend: 'sp', examples: ['spider', 'spoon', 'spot'], sound: '/sp/' },
    { blend: 'st', examples: ['star', 'stop', 'story'], sound: '/st/' },
    { blend: 'sw', examples: ['swim', 'sweet', 'swing'], sound: '/sw/' },
    { blend: 'tr', examples: ['tree', 'truck', 'train'], sound: '/tr/' }
  ];

  const digraphs = [
    { digraph: 'ch', examples: ['chair', 'cheese', 'church'], sound: '/ch/' },
    { digraph: 'sh', examples: ['ship', 'shoe', 'sheep'], sound: '/sh/' },
    { digraph: 'th', examples: ['think', 'three', 'thumb'], sound: '/th/' },
    { digraph: 'wh', examples: ['whale', 'wheel', 'white'], sound: '/wh/' },
    { digraph: 'ph', examples: ['phone', 'photo', 'graph'], sound: '/f/' },
    { digraph: 'ck', examples: ['duck', 'rock', 'truck'], sound: '/k/' }
  ];

  const phonicsTabs = [
    { id: 'letter-sounds', name: 'Letter Sounds', icon: '🔤' },
    { id: 'blends', name: 'Consonant Blends', icon: '🌊' },
    { id: 'digraphs', name: 'Digraphs', icon: '🔗' },
    { id: 'vowel-teams', name: 'Vowel Teams', icon: '👥' },
    { id: 'word-families', name: 'Word Families', icon: '👨‍👩‍👧‍👦' },
    { id: 'practice', name: 'Sound Practice', icon: '🎯' }
  ];

  const handleSoundClick = (sound) => {
    setSelectedSound(sound);
    if (showToast) {
      showToast(`Teaching: ${sound.letter} says ${sound.sound}`, 'info');
    }
  };

  const handleBlendClick = (blend) => {
    setCurrentBlend(blend);
    if (showToast) {
      showToast(`Teaching blend: ${blend.blend} says ${blend.sound}`, 'info');
    }
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen p-8">
        {activePhonicsTab === 'letter-sounds' && (
          <div className="space-y-8">
            {selectedSound ? (
              // Individual Sound Display
              <div className="text-center">
                <button
                  onClick={() => setSelectedSound(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to All Sounds
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-4xl mx-auto">
                  <div className="text-9xl mb-8">{selectedSound.image}</div>
                  <div className="text-8xl font-bold mb-4 text-yellow-300">{selectedSound.letter}</div>
                  <div className="text-6xl mb-8 text-blue-300">{selectedSound.sound}</div>
                  <div className="text-4xl mb-4 text-green-300">{selectedSound.example}</div>
                  <div className={`text-2xl px-6 py-3 rounded-full inline-block ${
                    selectedSound.type === 'vowel' ? 'bg-red-500/30' : 'bg-blue-500/30'
                  }`}>
                    {selectedSound.type === 'vowel' ? 'Vowel' : 'Consonant'}
                  </div>
                </div>
              </div>
            ) : (
              // All Sounds Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Letter Sounds</h2>
                <div className="grid grid-cols-6 gap-6 max-w-7xl mx-auto">
                  {letterSounds.map(sound => (
                    <button
                      key={sound.letter}
                      onClick={() => handleSoundClick(sound)}
                      className={`p-6 rounded-2xl border-4 transition-all duration-300 hover:scale-110 ${
                        sound.type === 'vowel' 
                          ? 'border-red-400 bg-red-500/20 hover:bg-red-500/30' 
                          : 'border-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
                      }`}
                    >
                      <div className="text-4xl mb-2">{sound.image}</div>
                      <div className="text-4xl font-bold text-white">{sound.letter}</div>
                      <div className="text-lg text-gray-200">{sound.sound}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activePhonicsTab === 'blends' && (
          <div className="space-y-8">
            {currentBlend ? (
              // Individual Blend Display
              <div className="text-center">
                <button
                  onClick={() => setCurrentBlend(null)}
                  className="mb-8 px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all"
                >
                  ← Back to All Blends
                </button>
                <div className="bg-white/10 backdrop-blur rounded-3xl p-16 max-w-4xl mx-auto">
                  <div className="text-8xl font-bold mb-8 text-yellow-300">{currentBlend.blend}</div>
                  <div className="text-5xl mb-8 text-blue-300">{currentBlend.sound}</div>
                  <div className="space-y-4">
                    {currentBlend.examples.map((example, index) => (
                      <div key={index} className="text-3xl text-green-300">
                        <span className="font-bold text-yellow-300">{currentBlend.blend}</span>
                        {example.substring(currentBlend.blend.length)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // All Blends Grid
              <div>
                <h2 className="text-6xl font-bold text-center mb-12 text-white">Consonant Blends</h2>
                <div className="grid grid-cols-5 gap-6 max-w-6xl mx-auto">
                  {commonBlends.map(blend => (
                    <button
                      key={blend.blend}
                      onClick={() => handleBlendClick(blend)}
                      className="p-6 rounded-2xl border-4 border-green-400 bg-green-500/20 hover:bg-green-500/30 transition-all duration-300 hover:scale-110"
                    >
                      <div className="text-4xl font-bold text-white mb-2">{blend.blend}</div>
                      <div className="text-lg text-gray-200">{blend.sound}</div>
                      <div className="text-sm text-green-200 mt-2">
                        {blend.examples[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activePhonicsTab === 'digraphs' && (
          <div>
            <h2 className="text-6xl font-bold text-center mb-12 text-white">Digraphs</h2>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              {digraphs.map(digraph => (
                <div key={digraph.digraph} className="p-8 rounded-2xl border-4 border-purple-400 bg-purple-500/20">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white mb-4">{digraph.digraph}</div>
                    <div className="text-3xl text-purple-200 mb-6">{digraph.sound}</div>
                    <div className="space-y-2">
                      {digraph.examples.map((example, index) => (
                        <div key={index} className="text-xl text-purple-100">
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
      </div>
    );
  }

  // Teacher Mode
  return (
    <div className="p-6">
      {/* Phonics Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {phonicsTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePhonicsTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
              activePhonicsTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Letter Sounds Tab */}
      {activePhonicsTab === 'letter-sounds' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">Letter Sounds</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setPracticeMode('vowels')}
                className={`px-4 py-2 rounded-lg ${practiceMode === 'vowels' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Vowels Only
              </button>
              <button
                onClick={() => setPracticeMode('consonants')}
                className={`px-4 py-2 rounded-lg ${practiceMode === 'consonants' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Consonants Only
              </button>
              <button
                onClick={() => setPracticeMode('show-all')}
                className={`px-4 py-2 rounded-lg ${practiceMode === 'show-all' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
              >
                Show All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {letterSounds
              .filter(sound => 
                practiceMode === 'show-all' || 
                (practiceMode === 'vowels' && sound.type === 'vowel') ||
                (practiceMode === 'consonants' && sound.type === 'consonant')
              )
              .map(sound => (
                <button
                  key={sound.letter}
                  onClick={() => handleSoundClick(sound)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    sound.type === 'vowel' 
                      ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                      : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="text-2xl mb-1">{sound.image}</div>
                  <div className="text-xl font-bold">{sound.letter}</div>
                  <div className="text-sm text-gray-600">{sound.sound}</div>
                </button>
              ))}
          </div>

          {selectedSound && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-6">
                <div className="text-6xl">{selectedSound.image}</div>
                <div className="flex-1">
                  <h4 className="text-3xl font-bold text-gray-800 mb-2">{selectedSound.letter}</h4>
                  <p className="text-xl text-blue-600 mb-2">Sound: {selectedSound.sound}</p>
                  <p className="text-lg text-gray-700">Example: {selectedSound.example}</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${
                    selectedSound.type === 'vowel' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedSound.type === 'vowel' ? 'Vowel' : 'Consonant'}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSound(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blends Tab */}
      {activePhonicsTab === 'blends' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Consonant Blends</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {commonBlends.map(blend => (
              <button
                key={blend.blend}
                onClick={() => handleBlendClick(blend)}
                className="p-4 rounded-xl border-2 border-green-300 bg-green-50 hover:bg-green-100 transition-all duration-200 hover:scale-105"
              >
                <div className="text-xl font-bold text-green-800">{blend.blend}</div>
                <div className="text-sm text-green-600">{blend.sound}</div>
              </button>
            ))}
          </div>

          {currentBlend && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-6">
                <div className="text-6xl font-bold text-green-600">{currentBlend.blend}</div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Blend: {currentBlend.blend}</h4>
                  <p className="text-lg text-green-600 mb-3">Sound: {currentBlend.sound}</p>
                  <div className="space-y-2">
                    <p className="font-bold text-gray-700">Example Words:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentBlend.examples.map((example, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-bold">
                          <span className="text-green-600">{currentBlend.blend}</span>
                          {example.substring(currentBlend.blend.length)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentBlend(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Digraphs Tab */}
      {activePhonicsTab === 'digraphs' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800">Digraphs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {digraphs.map(digraph => (
              <div key={digraph.digraph} className="p-6 rounded-xl border-2 border-purple-300 bg-purple-50">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-800 mb-2">{digraph.digraph}</div>
                  <div className="text-lg text-purple-600 mb-4">{digraph.sound}</div>
                  <div className="space-y-1">
                    {digraph.examples.map((example, index) => (
                      <div key={index} className="text-sm text-purple-700 font-medium">
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
    </div>
  );
};

export default PhonicsCenter;