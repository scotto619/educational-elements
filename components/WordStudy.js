// WordStudy.js - Interactive Vocabulary Anchor Chart Tool
import React, { useState, useRef } from 'react';

const WordStudy = ({ showToast }) => {
  const [centerWord, setCenterWord] = useState('');
  const [sections, setSections] = useState({
    definition: '',
    partOfSpeech: '',
    sentences: '',
    synonyms: '',
    antonyms: '',
    wordFamily: '',
    syllables: '',
    phonics: '',
    etymology: '',
    relatedWords: '',
    examples: '',
    nonExamples: ''
  });
  const [fontSize, setFontSize] = useState('medium');
  const [colorTheme, setColorTheme] = useState('teal');
  const [showGrid, setShowGrid] = useState(true);
  const [savedCharts, setSavedCharts] = useState([]);
  const chartRef = useRef(null);

  const colorThemes = {
    teal: {
      primary: 'bg-teal-100',
      secondary: 'bg-teal-50', 
      border: 'border-teal-300',
      text: 'text-teal-900',
      accent: 'bg-teal-600'
    },
    indigo: {
      primary: 'bg-indigo-100',
      secondary: 'bg-indigo-50',
      border: 'border-indigo-300', 
      text: 'text-indigo-900',
      accent: 'bg-indigo-600'
    },
    rose: {
      primary: 'bg-rose-100',
      secondary: 'bg-rose-50',
      border: 'border-rose-300',
      text: 'text-rose-900',
      accent: 'bg-rose-600'
    },
    emerald: {
      primary: 'bg-emerald-100',
      secondary: 'bg-emerald-50',
      border: 'border-emerald-300',
      text: 'text-emerald-900',
      accent: 'bg-emerald-600'
    }
  };

  const fontSizes = {
    small: { main: 'text-base', center: 'text-4xl', label: 'text-xs' },
    medium: { main: 'text-lg', center: 'text-6xl', label: 'text-sm' },
    large: { main: 'text-xl', center: 'text-7xl', label: 'text-base' }
  };

  const currentTheme = colorThemes[colorTheme];
  const currentFont = fontSizes[fontSize];

  // Common parts of speech for quick selection
  const partsOfSpeech = [
    'Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 
    'Preposition', 'Conjunction', 'Interjection'
  ];

  // Auto-analyze word when it changes
  const updateCenterWord = (word) => {
    setCenterWord(word);
    
    if (word && word.trim()) {
      const newSections = { ...sections };
      
      // Auto-calculate syllables
      const syllableCount = countSyllables(word.toLowerCase());
      newSections.syllables = `${syllableCount} syllable${syllableCount !== 1 ? 's' : ''}`;
      
      // Basic phonics analysis
      const vowels = word.toLowerCase().match(/[aeiou]/g);
      const consonants = word.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g);
      newSections.phonics = `${vowels ? vowels.length : 0} vowels, ${consonants ? consonants.length : 0} consonants`;
      
      setSections(newSections);
    }
  };

  // Simple syllable counter
  const countSyllables = (word) => {
    if (!word) return 0;
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  // Update individual section
  const updateSection = (sectionKey, value) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: value
    }));
  };

  // Quick set part of speech
  const setPartOfSpeech = (pos) => {
    updateSection('partOfSpeech', pos);
  };

  // Clear all content
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setCenterWord('');
      setSections({
        definition: '',
        partOfSpeech: '',
        sentences: '',
        synonyms: '',
        antonyms: '',
        wordFamily: '',
        syllables: '',
        phonics: '',
        etymology: '',
        relatedWords: '',
        examples: '',
        nonExamples: ''
      });
      showToast('Word study chart cleared!');
    }
  };

  // Save current chart
  const saveChart = () => {
    if (!centerWord.trim()) {
      showToast('Please enter a center word first!');
      return;
    }
    
    const name = prompt('Enter a name for this word chart:');
    if (name) {
      const chart = {
        id: Date.now(),
        name,
        centerWord,
        sections: { ...sections },
        fontSize,
        colorTheme,
        createdAt: new Date().toISOString()
      };
      
      setSavedCharts(prev => [chart, ...prev]);
      showToast(`Chart "${name}" saved!`);
    }
  };

  // Load saved chart
  const loadChart = (chart) => {
    setCenterWord(chart.centerWord);
    setSections(chart.sections);
    setFontSize(chart.fontSize);
    setColorTheme(chart.colorTheme);
    showToast(`Loaded chart "${chart.name}"`);
  };

  // Delete saved chart
  const deleteChart = (chartId) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      setSavedCharts(prev => prev.filter(chart => chart.id !== chartId));
      showToast('Chart deleted!');
    }
  };

  // Print/Export functionality
  const printChart = () => {
    const printWindow = window.open('', '_blank');
    const chartHTML = chartRef.current.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Word Study Chart - ${centerWord}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${chartHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📚 Word Study Anchor Chart</h2>
        <p className="text-gray-600">Create interactive vocabulary exploration charts for language arts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Center Word Input */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Center Word</h3>
            <input
              type="text"
              value={centerWord}
              onChange={(e) => updateCenterWord(e.target.value)}
              placeholder="Enter word"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl font-bold"
            />
          </div>

          {/* Quick Part of Speech */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Quick Part of Speech</h3>
            <div className="grid grid-cols-2 gap-1">
              {partsOfSpeech.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPartOfSpeech(pos)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold transition-colors"
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Display Options</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Color Theme</label>
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="teal">Teal</option>
                  <option value="indigo">Indigo</option>
                  <option value="rose">Rose</option>
                  <option value="emerald">Emerald</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Show grid lines</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={saveChart}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
              >
                💾 Save Chart
              </button>
              <button
                onClick={printChart}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                🖨️ Print Chart
              </button>
              <button
                onClick={clearAll}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Saved Charts */}
          {savedCharts.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">Saved Charts</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedCharts.map(chart => (
                  <div key={chart.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{chart.name}</div>
                      <div className="text-xs text-gray-500">Word: {chart.centerWord}</div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => loadChart(chart)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteChart(chart.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Word Study Chart Display */}
        <div className="lg:col-span-3">
          <div 
            ref={chartRef}
            className={`
              ${currentTheme.secondary} ${currentTheme.border} 
              border-2 rounded-xl p-6 shadow-lg
              ${showGrid ? 'bg-grid-pattern' : ''}
            `}
          >
            {/* Main Grid Layout */}
            <div className="grid grid-cols-4 gap-4 h-full min-h-[600px]">
              {/* Top Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Definition
                </label>
                <textarea
                  value={sections.definition}
                  onChange={(e) => updateSection('definition', e.target.value)}
                  placeholder="What does this word mean?"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Part of Speech
                </label>
                <textarea
                  value={sections.partOfSpeech}
                  onChange={(e) => updateSection('partOfSpeech', e.target.value)}
                  placeholder="noun, verb, adjective..."
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`col-span-2 ${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Use in Sentences
                </label>
                <textarea
                  value={sections.sentences}
                  onChange={(e) => updateSection('sentences', e.target.value)}
                  placeholder="Write example sentences using this word..."
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* Second Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Synonyms
                </label>
                <textarea
                  value={sections.synonyms}
                  onChange={(e) => updateSection('synonyms', e.target.value)}
                  placeholder="Words with similar meaning"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* CENTER WORD */}
              <div className={`col-span-2 ${currentTheme.accent} text-white rounded-lg flex items-center justify-center text-center p-4`}>
                <div>
                  <div className={`${currentFont.center} font-bold leading-none break-all`}>
                    {centerWord || 'WORD'}
                  </div>
                  <div className={`${currentFont.main} opacity-90 mt-2`}>
                    {sections.syllables && sections.syllables}
                  </div>
                </div>
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Antonyms
                </label>
                <textarea
                  value={sections.antonyms}
                  onChange={(e) => updateSection('antonyms', e.target.value)}
                  placeholder="Words with opposite meaning"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* Third Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Word Family
                </label>
                <textarea
                  value={sections.wordFamily}
                  onChange={(e) => updateSection('wordFamily', e.target.value)}
                  placeholder="Related words (root, prefix, suffix)"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Phonics / Sounds
                </label>
                <textarea
                  value={sections.phonics}
                  onChange={(e) => updateSection('phonics', e.target.value)}
                  placeholder="Sounds, phonemes, blends"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Etymology / Origin
                </label>
                <textarea
                  value={sections.etymology}
                  onChange={(e) => updateSection('etymology', e.target.value)}
                  placeholder="Where does this word come from?"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Related Words
                </label>
                <textarea
                  value={sections.relatedWords}
                  onChange={(e) => updateSection('relatedWords', e.target.value)}
                  placeholder="Words in the same topic/theme"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* Bottom Row */}
              <div className={`col-span-2 ${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Examples
                </label>
                <textarea
                  value={sections.examples}
                  onChange={(e) => updateSection('examples', e.target.value)}
                  placeholder="What are examples of this word in action?"
                  className={`w-full h-24 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`col-span-2 ${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Non-Examples
                </label>
                <textarea
                  value={sections.nonExamples}
                  onChange={(e) => updateSection('nonExamples', e.target.value)}
                  placeholder="What would NOT be examples of this word?"
                  className={`w-full h-24 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default WordStudy;