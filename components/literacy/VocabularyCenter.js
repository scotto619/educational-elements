// VocabularyCenter.js - Complete Enhanced Version with Wikimedia Images
import React, { useState, useEffect, useRef } from 'react';

const VocabularyCenter = ({ showToast, saveVocabularyDataToFirebase, currentClassId }) => {
  const [activeTab, setActiveTab] = useState('word-wall');
  const [wordWall, setWordWall] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, cards
  const [editingWord, setEditingWord] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Word Categories for organization
  const categories = [
    'all', 'noun', 'verb', 'adjective', 'adverb', 'academic', 'science', 
    'math', 'social-studies', 'literature', 'tier-2', 'tier-3', 'custom'
  ];

  // Load saved word wall data
  useEffect(() => {
    const savedWords = localStorage.getItem(`wordWall_${currentClassId}`);
    if (savedWords) {
      setWordWall(JSON.parse(savedWords));
    }
  }, [currentClassId]);

  // Save to Firebase whenever wordWall changes
  useEffect(() => {
    if (wordWall.length > 0) {
      localStorage.setItem(`wordWall_${currentClassId}`, JSON.stringify(wordWall));
      if (saveVocabularyDataToFirebase) {
        saveVocabularyDataToFirebase({ wordWall });
      }
    }
  }, [wordWall, currentClassId, saveVocabularyDataToFirebase]);

  // Dictionary API Integration (KEPT EXACTLY THE SAME)
  const fetchWordData = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error('Word not found in dictionary');
      }

      const data = await response.json();
      const entry = data[0];

      // Extract comprehensive word data
      const meanings = entry.meanings || [];
      const definitions = [];
      const synonyms = new Set();
      const antonyms = new Set();
      const examples = new Set();

      meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example || null
          });

          if (def.example) {
            examples.add(def.example);
          }

          // Collect synonyms and antonyms
          if (def.synonyms) def.synonyms.forEach(syn => synonyms.add(syn));
          if (def.antonyms) def.antonyms.forEach(ant => antonyms.add(ant));
        });

        // Also check meaning-level synonyms/antonyms
        if (meaning.synonyms) meaning.synonyms.forEach(syn => synonyms.add(syn));
        if (meaning.antonyms) meaning.antonyms.forEach(ant => antonyms.add(ant));
      });

      // Extract phonetics
      const phonetics = entry.phonetics?.find(p => p.text)?.text || '';

      return {
        word: entry.word,
        phonetics,
        definitions,
        synonyms: Array.from(synonyms).slice(0, 8), // Limit to 8 most relevant
        antonyms: Array.from(antonyms).slice(0, 8),
        examples: Array.from(examples).slice(0, 3), // Limit to 3 examples
        etymology: entry.origin || '',
        partOfSpeech: meanings[0]?.partOfSpeech || 'unknown'
      };
    } catch (error) {
      console.error('Dictionary API error:', error);
      throw error;
    }
  };

  // Wikimedia Image API (Simple and Free)
  const fetchWikimediaImage = async (word) => {
    try {
      // Try direct page lookup first
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(word)}`
      );
      const data = await response.json();
      
      if (data.thumbnail?.source) {
        return data.thumbnail.source;
      }

      // If no direct match, try search
      const searchResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(word)}&srlimit=3`
      );
      const searchData = await searchResponse.json();
      
      // Try the first few search results
      for (const result of searchData.query?.search || []) {
        try {
          const pageResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(result.title)}`
          );
          const pageData = await pageResponse.json();
          
          if (pageData.thumbnail?.source) {
            return pageData.thumbnail.source;
          }
        } catch (e) {
          continue; // Try next result
        }
      }
      
      return null;
    } catch (error) {
      console.error('Wikimedia API error:', error);
      return null;
    }
  };

  // Add new word to word wall (ENHANCED with images)
  const handleAddWord = async () => {
    if (!newWord.trim()) {
      showToast('Please enter a word', 'error');
      return;
    }

    const wordExists = wordWall.find(w => w.word.toLowerCase() === newWord.toLowerCase());
    if (wordExists) {
      showToast('Word already exists in word wall', 'error');
      return;
    }

    setIsLoadingWord(true);

    try {
      // Fetch dictionary data and image simultaneously
      const [apiData, imageUrl] = await Promise.all([
        fetchWordData(newWord).catch(() => null),
        fetchWikimediaImage(newWord).catch(() => null)
      ]);

      if (apiData) {
        // Got dictionary data
        const wordData = {
          id: Date.now(),
          word: apiData.word,
          phonetics: apiData.phonetics,
          definitions: apiData.definitions,
          synonyms: apiData.synonyms,
          antonyms: apiData.antonyms,
          examples: apiData.examples,
          etymology: apiData.etymology,
          partOfSpeech: apiData.partOfSpeech,
          category: determineCategory(apiData.partOfSpeech),
          dateAdded: new Date().toISOString(),
          isCustom: false,
          notes: '',
          difficulty: 'medium',
          imageUrl: imageUrl
        };

        setWordWall(prev => [...prev, wordData]);
        setNewWord('');
        showToast(`Added "${apiData.word}" with dictionary data${imageUrl ? ' and image' : ''}!`, 'success');
        
      } else {
        // Create basic word entry for manual editing
        const basicWordData = {
          id: Date.now(),
          word: newWord.toLowerCase(),
          phonetics: '',
          definitions: [{ partOfSpeech: '', definition: '', example: '' }],
          synonyms: [],
          antonyms: [],
          examples: [],
          etymology: '',
          partOfSpeech: '',
          category: 'custom',
          dateAdded: new Date().toISOString(),
          isCustom: true,
          notes: '',
          difficulty: 'medium',
          imageUrl: imageUrl
        };

        setWordWall(prev => [...prev, basicWordData]);
        setEditingWord(basicWordData);
        setNewWord('');
        showToast(`Added "${newWord}"${imageUrl ? ' with image' : ''} - please add definition manually`, 'info');
      }
      
    } catch (error) {
      showToast('Error adding word. Please try again.', 'error');
    } finally {
      setIsLoadingWord(false);
    }
  };

  // Determine category based on part of speech
  const determineCategory = (partOfSpeech) => {
    const categoryMap = {
      'noun': 'noun',
      'verb': 'verb',
      'adjective': 'adjective',
      'adverb': 'adverb'
    };
    return categoryMap[partOfSpeech] || 'custom';
  };

  // Filter words based on search and category
  const filteredWords = wordWall.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         word.definitions.some(def => def.definition.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || word.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Update word data
  const handleUpdateWord = (wordId, updatedData) => {
    setWordWall(prev => prev.map(word => 
      word.id === wordId ? { ...word, ...updatedData } : word
    ));
    setEditingWord(null);
    showToast('Word updated successfully!', 'success');
  };

  // Delete word
  const handleDeleteWord = (wordId) => {
    setWordWall(prev => prev.filter(word => word.id !== wordId));
    showToast('Word removed from word wall', 'success');
  };

  // Refresh word data from API
  const handleRefreshWord = async (word) => {
    setIsLoadingWord(true);
    try {
      const [apiData, imageUrl] = await Promise.all([
        fetchWordData(word.word).catch(() => null),
        fetchWikimediaImage(word.word).catch(() => null)
      ]);

      if (apiData) {
        const updatedWord = {
          ...word,
          phonetics: apiData.phonetics,
          definitions: apiData.definitions,
          synonyms: apiData.synonyms,
          antonyms: apiData.antonyms,
          examples: apiData.examples,
          etymology: apiData.etymology,
          partOfSpeech: apiData.partOfSpeech,
          category: determineCategory(apiData.partOfSpeech),
          isCustom: false,
          imageUrl: imageUrl || word.imageUrl // Keep existing image if new one not found
        };
        
        setWordWall(prev => prev.map(w => w.id === word.id ? updatedWord : w));
        showToast(`Updated "${word.word}" with latest dictionary data!`, 'success');
      } else {
        showToast(`Could not refresh "${word.word}" - dictionary data unavailable`, 'error');
      }
    } catch (error) {
      showToast(`Could not refresh "${word.word}" - dictionary data unavailable`, 'error');
    } finally {
      setIsLoadingWord(false);
    }
  };

  // Add/Change image for existing word
  const handleAddImageToWord = async (wordId) => {
    const word = wordWall.find(w => w.id === wordId);
    if (!word) return;

    setIsLoadingImage(true);
    try {
      const imageUrl = await fetchWikimediaImage(word.word);
      if (imageUrl) {
        setWordWall(prev => prev.map(w => 
          w.id === wordId 
            ? { ...w, imageUrl }
            : w
        ));
        showToast(`Image added to "${word.word}"!`, 'success');
      } else {
        showToast(`No image found for "${word.word}" on Wikipedia`, 'info');
      }
    } catch (error) {
      showToast('Error fetching image', 'error');
    } finally {
      setIsLoadingImage(false);
    }
  };

  // Export word wall data
  const exportWordWall = () => {
    const dataStr = JSON.stringify(wordWall, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `word-wall-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Word wall exported!', 'success');
  };

  // Import word wall data
  const importWordWall = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedWords = JSON.parse(e.target.result);
        if (Array.isArray(importedWords)) {
          setWordWall(prev => [...prev, ...importedWords]);
          showToast(`Imported ${importedWords.length} words!`, 'success');
        }
      } catch (error) {
        showToast('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">📚 Vocabulary Center</h2>
        <p className="text-gray-600">Build and manage your interactive classroom word wall with automatic images</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {[
          { id: 'word-wall', label: 'Word Wall', icon: '🧱' },
          { id: 'word-games', label: 'Word Games', icon: '🎮' },
          { id: 'vocabulary-builder', label: 'Vocab Builder', icon: '🏗️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeTab === tab.id
                ? "bg-green-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Word Wall Tab */}
      {activeTab === 'word-wall' && (
        <div className="space-y-6">
          {/* Add New Word */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-3">➕</span>
              Add New Word
            </h3>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                  placeholder="Enter a word to add to the word wall..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isLoadingWord}
                />
              </div>
              <button
                onClick={handleAddWord}
                disabled={isLoadingWord}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoadingWord ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Word + Image'
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-2">
              💡 Words are automatically enriched with definitions, synonyms, antonyms, examples, and Wikipedia images
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search words or definitions..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex space-x-2">
                {[
                  { mode: 'grid', icon: '⊞', label: 'Grid' },
                  { mode: 'list', icon: '☰', label: 'List' },
                  { mode: 'cards', icon: '🃏', label: 'Cards' }
                ].map(({ mode, icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === mode 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              {/* Export/Import */}
              <div className="flex space-x-2">
                <button
                  onClick={exportWordWall}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📤 Export
                </button>
                <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                  📥 Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importWordWall}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredWords.length} of {wordWall.length} words
              </div>
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>🖼️ {wordWall.filter(w => w.imageUrl).length} with images</span>
                <span>📖 {wordWall.filter(w => w.category === 'noun').length} Nouns</span>
                <span>⚡ {wordWall.filter(w => w.category === 'verb').length} Verbs</span>
                <span>🎨 {wordWall.filter(w => w.category === 'adjective').length} Adjectives</span>
                <span>🏃 {wordWall.filter(w => w.category === 'adverb').length} Adverbs</span>
              </div>
            </div>
          </div>

          {/* Word Wall Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="mr-3">🧱</span>
              Word Wall ({filteredWords.length} words)
            </h3>

            {filteredWords.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No words yet</h3>
                <p className="text-gray-500">Add your first word to get started!</p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredWords.map(word => (
                      <WordCard
                        key={word.id}
                        word={word}
                        onSelect={() => setSelectedWord(word)}
                        onEdit={() => setEditingWord(word)}
                        onDelete={() => handleDeleteWord(word.id)}
                        onRefresh={() => handleRefreshWord(word)}
                        onAddImage={() => handleAddImageToWord(word.id)}
                        isLoadingImage={isLoadingImage}
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-2">
                    {filteredWords.map(word => (
                      <WordListItem
                        key={word.id}
                        word={word}
                        onSelect={() => setSelectedWord(word)}
                        onEdit={() => setEditingWord(word)}
                        onDelete={() => handleDeleteWord(word.id)}
                        onRefresh={() => handleRefreshWord(word)}
                        onAddImage={() => handleAddImageToWord(word.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Cards View */}
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWords.map(word => (
                      <DetailedWordCard
                        key={word.id}
                        word={word}
                        onEdit={() => setEditingWord(word)}
                        onDelete={() => handleDeleteWord(word.id)}
                        onRefresh={() => handleRefreshWord(word)}
                        onAddImage={() => handleAddImageToWord(word.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Word Games Tab Placeholder */}
      {activeTab === 'word-games' && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Word Games</h3>
          <p className="text-gray-600 mb-6">Interactive vocabulary games using your word wall</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-bold text-gray-800">Word Matching</h4>
              <p className="text-sm text-gray-600">Match words with definitions</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-3xl mb-2">🧩</div>
              <h4 className="font-bold text-gray-800">Synonym Hunt</h4>
              <p className="text-sm text-gray-600">Find words with similar meanings</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-bold text-gray-800">Fill the Blank</h4>
              <p className="text-sm text-gray-600">Complete sentences with vocabulary words</p>
            </div>
          </div>
          <p className="text-gray-500 mt-6">Coming soon in the next update!</p>
        </div>
      )}

      {/* Vocabulary Builder Tab Placeholder */}
      {activeTab === 'vocabulary-builder' && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Vocabulary Builder</h3>
          <p className="text-gray-600 mb-6">Advanced tools for building student vocabulary</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-bold text-gray-800">Word Frequency Analysis</h4>
              <p className="text-sm text-gray-600">Analyze which words students struggle with most</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-xl">
              <div className="text-3xl mb-2">🎓</div>
              <h4 className="font-bold text-gray-800">Tiered Vocabulary</h4>
              <p className="text-sm text-gray-600">Organize words by academic tier and complexity</p>
            </div>
          </div>
          <p className="text-gray-500 mt-6">Coming soon in the next update!</p>
        </div>
      )}

      {/* Word Detail Modal */}
      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onEdit={() => {
            setEditingWord(selectedWord);
            setSelectedWord(null);
          }}
        />
      )}

      {/* Edit Word Modal */}
      {editingWord && (
        <EditWordModal
          word={editingWord}
          onSave={(updatedData) => handleUpdateWord(editingWord.id, updatedData)}
          onCancel={() => setEditingWord(null)}
        />
      )}
    </div>
  );
};

// Enhanced Word Card Component with Image
const WordCard = ({ word, onSelect, onEdit, onDelete, onRefresh, onAddImage, isLoadingImage }) => {
  const categoryColors = {
    noun: 'bg-blue-100 border-blue-300 text-blue-800',
    verb: 'bg-green-100 border-green-300 text-green-800',
    adjective: 'bg-purple-100 border-purple-300 text-purple-800',
    adverb: 'bg-orange-100 border-orange-300 text-orange-800',
    custom: 'bg-gray-100 border-gray-300 text-gray-800'
  };

  return (
    <div className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg group ${
      categoryColors[word.category] || categoryColors.custom
    }`}>
      {/* Word Image */}
      {word.imageUrl ? (
        <div className="mb-3">
          <img
            src={word.imageUrl}
            alt={word.word}
            className="w-full h-20 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="mb-3 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">📷</span>
        </div>
      )}

      {/* Word */}
      <div className="text-center mb-2">
        <h4 className="text-lg font-bold truncate" title={word.word}>
          {word.word}
        </h4>
        {word.phonetics && (
          <p className="text-xs opacity-70">{word.phonetics}</p>
        )}
      </div>

      {/* Quick Info */}
      <div className="text-xs text-center space-y-1">
        <div className="font-medium">{word.partOfSpeech}</div>
        {word.definitions[0]?.definition && (
          <div className="truncate opacity-70" title={word.definitions[0].definition}>
            {word.definitions[0].definition}
          </div>
        )}
      </div>

      {/* Action Buttons (show on hover) */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col space-y-1">
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
            title="View Details"
          >
            👁️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-6 h-6 bg-yellow-600 text-white rounded-full text-xs hover:bg-yellow-700"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddImage(); }}
            className="w-6 h-6 bg-green-600 text-white rounded-full text-xs hover:bg-green-700"
            title="Add/Change Image"
            disabled={isLoadingImage}
          >
            {isLoadingImage ? '⏳' : '🖼️'}
          </button>
          {!word.isCustom && (
            <button
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              className="w-6 h-6 bg-purple-600 text-white rounded-full text-xs hover:bg-purple-700"
              title="Refresh from Dictionary"
            >
              🔄
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Custom Word Indicator */}
      {word.isCustom && (
        <div className="absolute top-2 left-2">
          <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
            CUSTOM
          </span>
        </div>
      )}
    </div>
  );
};

// Word List Item Component with Image
const WordListItem = ({ word, onSelect, onEdit, onDelete, onRefresh, onAddImage }) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4 flex-1 cursor-pointer" onClick={onSelect}>
        {/* Image */}
        {word.imageUrl ? (
          <img
            src={word.imageUrl}
            alt={word.word}
            className="w-12 h-12 object-cover rounded border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">📷</span>
          </div>
        )}
        
        <div>
          <h4 className="text-lg font-bold">{word.word}</h4>
          {word.phonetics && <p className="text-sm text-gray-500">{word.phonetics}</p>}
        </div>
        <div className="text-sm text-gray-600">
          <span className="bg-gray-100 px-2 py-1 rounded">{word.partOfSpeech}</span>
        </div>
        <div className="flex-1 text-sm text-gray-700 truncate">
          {word.definitions[0]?.definition}
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Edit
        </button>
        <button
          onClick={onAddImage}
          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          🖼️
        </button>
        {!word.isCustom && (
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Refresh
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Detailed Word Card Component with Image
const DetailedWordCard = ({ word, onEdit, onDelete, onRefresh, onAddImage }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
      {/* Image */}
      {word.imageUrl && (
        <div className="mb-4">
          <img
            src={word.imageUrl}
            alt={word.word}
            className="w-full h-32 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-2xl font-bold text-gray-800">{word.word}</h4>
          {word.phonetics && (
            <p className="text-gray-500 italic">{word.phonetics}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={onAddImage}
            className="text-green-600 hover:text-green-800"
            title="Add/Change Image"
          >
            🖼️
          </button>
          {!word.isCustom && (
            <button
              onClick={onRefresh}
              className="text-purple-600 hover:text-purple-800"
              title="Refresh"
            >
              🔄
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Part of Speech */}
      <div className="mb-3">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
          {word.partOfSpeech}
        </span>
      </div>

      {/* Definitions */}
      <div className="mb-4">
        <h5 className="font-semibold text-gray-700 mb-2">Definitions:</h5>
        {word.definitions.slice(0, 2).map((def, index) => (
          <div key={index} className="mb-2">
            <p className="text-gray-800">{def.definition}</p>
            {def.example && (
              <p className="text-gray-600 italic text-sm mt-1">
                Example: "{def.example}"
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Synonyms */}
      {word.synonyms.length > 0 && (
        <div className="mb-3">
          <h5 className="font-semibold text-gray-700 mb-1">Synonyms:</h5>
          <div className="flex flex-wrap gap-1">
            {word.synonyms.slice(0, 4).map((synonym, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {synonym}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Antonyms */}
      {word.antonyms.length > 0 && (
        <div className="mb-3">
          <h5 className="font-semibold text-gray-700 mb-1">Antonyms:</h5>
          <div className="flex flex-wrap gap-1">
            {word.antonyms.slice(0, 4).map((antonym, index) => (
              <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                {antonym}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Word Detail Modal (COMPLETE VERSION)
const WordDetailModal = ({ word, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Image at top */}
          {word.imageUrl && (
            <div className="mb-6">
              <img
                src={word.imageUrl}
                alt={word.word}
                className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Image from Wikipedia</p>
            </div>
          )}
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-800">{word.word}</h2>
              {word.phonetics && (
                <p className="text-xl text-gray-500 italic mt-1">{word.phonetics}</p>
              )}
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block">
                {word.partOfSpeech}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Word
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Definitions */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">📖 Definitions</h3>
              <div className="space-y-3">
                {word.definitions.map((def, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 font-medium">{def.definition}</p>
                    {def.example && (
                      <p className="text-gray-600 italic mt-2">
                        <strong>Example:</strong> "{def.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Synonyms & Antonyms */}
            <div className="space-y-6">
              {word.synonyms.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">🔗 Synonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {word.synonyms.map((synonym, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {word.antonyms.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">⚡ Antonyms</h3>
                  <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((antonym, index) => (
                      <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {antonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {word.examples.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Example Sentences</h3>
                  <div className="space-y-2">
                    {word.examples.map((example, index) => (
                      <p key={index} className="text-gray-700 italic p-3 bg-blue-50 rounded-lg">
                        "{example}"
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {word.etymology && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">🏛️ Etymology</h3>
                  <p className="text-gray-700 p-3 bg-purple-50 rounded-lg">
                    {word.etymology}
                  </p>
                </div>
              )}
            </div>
          </div>

          {word.notes && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">📝 Teacher Notes</h3>
              <p className="text-gray-700 p-4 bg-yellow-50 rounded-lg">
                {word.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Word Modal (COMPLETE VERSION)
const EditWordModal = ({ word, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    word: word.word,
    phonetics: word.phonetics,
    partOfSpeech: word.partOfSpeech,
    category: word.category,
    definitions: word.definitions.length ? word.definitions : [{ partOfSpeech: '', definition: '', example: '' }],
    synonyms: word.synonyms.join(', '),
    antonyms: word.antonyms.join(', '),
    notes: word.notes || '',
    difficulty: word.difficulty || 'medium'
  });

  const handleSave = () => {
    const updatedData = {
      ...editData,
      synonyms: editData.synonyms.split(',').map(s => s.trim()).filter(s => s),
      antonyms: editData.antonyms.split(',').map(s => s.trim()).filter(s => s),
      isCustom: true // Mark as custom when manually edited
    };
    onSave(updatedData);
  };

  const addDefinition = () => {
    setEditData(prev => ({
      ...prev,
      definitions: [...prev.definitions, { partOfSpeech: '', definition: '', example: '' }]
    }));
  };

  const updateDefinition = (index, field, value) => {
    setEditData(prev => ({
      ...prev,
      definitions: prev.definitions.map((def, i) => 
        i === index ? { ...def, [field]: value } : def
      )
    }));
  };

  const removeDefinition = (index) => {
    if (editData.definitions.length > 1) {
      setEditData(prev => ({
        ...prev,
        definitions: prev.definitions.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Word: {word.word}</h2>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Word</label>
                <input
                  type="text"
                  value={editData.word}
                  onChange={(e) => setEditData(prev => ({ ...prev, word: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phonetics</label>
                <input
                  type="text"
                  value={editData.phonetics}
                  onChange={(e) => setEditData(prev => ({ ...prev, phonetics: e.target.value }))}
                  placeholder="/fəˈnɛtɪks/"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Part of Speech</label>
                <select
                  value={editData.partOfSpeech}
                  onChange={(e) => setEditData(prev => ({ ...prev, partOfSpeech: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select...</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="pronoun">Pronoun</option>
                  <option value="preposition">Preposition</option>
                  <option value="conjunction">Conjunction</option>
                  <option value="interjection">Interjection</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="custom">Custom</option>
                  <option value="academic">Academic</option>
                  <option value="science">Science</option>
                  <option value="math">Math</option>
                  <option value="social-studies">Social Studies</option>
                  <option value="literature">Literature</option>
                  <option value="tier-2">Tier 2</option>
                  <option value="tier-3">Tier 3</option>
                </select>
              </div>
            </div>

            {/* Definitions */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-gray-700">Definitions</label>
                <button
                  onClick={addDefinition}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Definition
                </button>
              </div>
              <div className="space-y-3">
                {editData.definitions.map((def, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Definition {index + 1}</span>
                      {editData.definitions.length > 1 && (
                        <button
                          onClick={() => removeDefinition(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <textarea
                        value={def.definition}
                        onChange={(e) => updateDefinition(index, 'definition', e.target.value)}
                        placeholder="Definition..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                      />
                      <textarea
                        value={def.example || ''}
                        onChange={(e) => updateDefinition(index, 'example', e.target.value)}
                        placeholder="Example sentence..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synonyms and Antonyms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Synonyms</label>
                <textarea
                  value={editData.synonyms}
                  onChange={(e) => setEditData(prev => ({ ...prev, synonyms: e.target.value }))}
                  placeholder="Similar words (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Antonyms</label>
                <textarea
                  value={editData.antonyms}
                  onChange={(e) => setEditData(prev => ({ ...prev, antonyms: e.target.value }))}
                  placeholder="Opposite words (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            {/* Teacher Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Notes</label>
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes for teaching this word..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyCenter;