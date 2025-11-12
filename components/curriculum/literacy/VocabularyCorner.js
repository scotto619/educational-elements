import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'curriculumCorner.vocabularyLists.v1';

const defaultWordLists = [
  {
    id: 'storytelling-stars',
    name: 'Storytelling Stars',
    color: 'from-purple-400 to-fuchsia-500',
    words: ['vivid', 'mystery', 'courage', 'whisper']
  },
  {
    id: 'persuasive-power',
    name: 'Persuasive Power Words',
    color: 'from-amber-400 to-orange-500',
    words: ['essential', 'transform', 'discover', 'imagine']
  },
  {
    id: 'science-spark',
    name: 'Science Spark',
    color: 'from-emerald-400 to-teal-500',
    words: ['photosynthesis', 'gravity', 'ecosystem', 'experiment']
  }
];

const VocabularyCorner = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [dictionaryData, setDictionaryData] = useState(null);
  const [customLists, setCustomLists] = useState([]);
  const [activeListId, setActiveListId] = useState('');
  const [newListName, setNewListName] = useState('');
  const [selectedWord, setSelectedWord] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomLists(parsed);
        }
      }
    } catch (error) {
      console.warn('Failed to load vocabulary lists', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customLists));
  }, [customLists]);

  const allLists = useMemo(() => [...defaultWordLists, ...customLists], [customLists]);

  const activeList = useMemo(() => {
    if (!activeListId) return null;
    return allLists.find(list => list.id === activeListId) ?? null;
  }, [activeListId, allLists]);

  useEffect(() => {
    if (!activeListId && allLists.length > 0) {
      setActiveListId(allLists[0].id);
    }
  }, [activeListId, allLists]);

  const fetchDictionaryData = async (word) => {
    if (!word) return;
    setIsLoading(true);
    setLookupError('');
    setDictionaryData(null);

    try {
      const response = await fetch(`/api/dictionary?word=${encodeURIComponent(word)}`);
      if (!response.ok) {
        throw new Error('Unable to reach dictionary service');
      }
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error);
      }
      setDictionaryData(payload);
      setSelectedWord(payload.word || word);
    } catch (error) {
      console.error('Dictionary lookup failed', error);
      setLookupError(error.message || 'Something went wrong fetching that word.');
    } finally {
      setIsLoading(false);
    }
  };

  const addWordToList = (listId, word) => {
    if (!word) return;
    const cleanedWord = word.trim();
    if (!cleanedWord) return;

    let createdList = null;
    setCustomLists(prev => {
      const existingIndex = prev.findIndex(list => list.id === listId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const updatedWords = Array.from(new Set([...updated[existingIndex].words, cleanedWord]));
        updated[existingIndex] = { ...updated[existingIndex], words: updatedWords };
        return updated;
      }

      const template = defaultWordLists.find(list => list.id === listId);
      if (template) {
        const clone = {
          id: `${listId}-custom-${Date.now()}`,
          name: `${template.name} (My List)`,
          color: template.color,
          words: Array.from(new Set([...template.words, cleanedWord]))
        };
        createdList = clone;
        return [...prev, clone];
      }

      const fallbackList = {
        id: `custom-${Date.now()}`,
        name: 'New Vocabulary List',
        color: 'from-blue-400 to-indigo-500',
        words: [cleanedWord]
      };
      createdList = fallbackList;
      return [
        ...prev,
        fallbackList
      ];
    });
    if (createdList) {
      setActiveListId(createdList.id);
    }
  };

  const createList = () => {
    if (!newListName.trim()) return;
    const id = `custom-${Date.now()}`;
    const newList = {
      id,
      name: newListName.trim(),
      color: 'from-sky-400 to-blue-500',
      words: []
    };
    setCustomLists(prev => [...prev, newList]);
    setActiveListId(id);
    setNewListName('');
  };

  const removeWord = (listId, word) => {
    setCustomLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, words: list.words.filter(existing => existing !== word) }
          : list
      )
    );
  };

  const handleListSelection = (listId) => {
    setActiveListId(listId);
  };

  const copyWordsToClipboard = (words) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      console.warn('Clipboard API is not available in this environment');
      return;
    }
    navigator.clipboard.writeText(words).catch(error => {
      console.warn('Unable to copy words', error);
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-4 space-y-4">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-3">Vocabulary Lists</h3>
          <p className="text-sm text-slate-500 mb-4">Keep your favourite words organised by unit, genre, or learning goal.</p>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {allLists.map(list => {
              const isActive = activeListId === list.id;
              const gradient = isActive ? `bg-gradient-to-r ${list.color || 'from-amber-50 to-orange-50'}` : '';
              return (
                <button
                  key={list.id}
                  onClick={() => handleListSelection(list.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isActive
                      ? `border-transparent ring-2 ring-offset-2 ring-amber-400 ${gradient}`
                      : 'border-slate-200 hover:border-amber-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-800">{list.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{list.words.length} word{list.words.length === 1 ? '' : 's'}</p>
                    </div>
                    <span className="text-xl">🔤</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 rounded-3xl p-5">
          <h4 className="text-lg font-semibold text-amber-800 mb-2">Create a list</h4>
          <p className="text-sm text-amber-700 mb-3">Name a set of words to track vocabulary by unit, reading group, or spelling focus.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newListName}
              onChange={(event) => setNewListName(event.target.value)}
              placeholder="e.g. Space Exploration"
              className="flex-1 rounded-xl border border-amber-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={createList}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold shadow hover:bg-amber-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="xl:col-span-8 space-y-6">
        <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">📚 Literacy Corner: Vocabulary Lab</h3>
              <p className="text-sm text-slate-100">Powered by the Dictionary.com API with classroom-friendly word banks.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      fetchDictionaryData(searchTerm);
                    }
                  }}
                  placeholder="Search a new word..."
                  className="w-full rounded-2xl bg-white/95 text-slate-800 px-4 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-sky-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>
              <button
                onClick={() => fetchDictionaryData(searchTerm)}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold"
              >
                Look up
              </button>
            </div>
          </div>
          {lookupError && (
            <div className="mt-4 bg-white/20 text-white px-4 py-3 rounded-2xl text-sm">
              {lookupError}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3 animate-spin">🌀</div>
              <p className="text-slate-600">Finding word magic...</p>
            </div>
          ) : dictionaryData ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <h4 className="text-3xl font-bold text-slate-900">{dictionaryData.word}</h4>
                {dictionaryData.pronunciation && (
                  <p className="text-sm text-slate-500">/{dictionaryData.pronunciation}/</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {dictionaryData.partOfSpeech?.map(part => (
                    <span key={part} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              {dictionaryData.definitions && dictionaryData.definitions.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-slate-800 mb-2">Definitions</h5>
                  <ol className="list-decimal ml-6 space-y-2 text-slate-600">
                    {dictionaryData.definitions.map((definition, index) => (
                      <li key={index}>{definition}</li>
                    ))}
                  </ol>
                </div>
              )}

              {dictionaryData.examples && dictionaryData.examples.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-slate-800 mb-2">Example sentences</h5>
                  <ul className="space-y-2 text-slate-600">
                    {dictionaryData.examples.map((example, index) => (
                      <li key={index} className="bg-slate-50 rounded-2xl px-4 py-3">“{example}”</li>
                    ))}
                  </ul>
                </div>
              )}

              {dictionaryData.synonyms && dictionaryData.synonyms.length > 0 && (
                <div>
                  <h5 className="text-lg font-semibold text-slate-800 mb-2">Synonyms</h5>
                  <div className="flex flex-wrap gap-2">
                    {dictionaryData.synonyms.map(synonym => (
                      <button
                        key={synonym}
                        onClick={() => fetchDictionaryData(synonym)}
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold hover:from-purple-200 hover:to-pink-200"
                      >
                        {synonym}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-3xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-amber-800">Add “{selectedWord || dictionaryData.word}” to a list</p>
                    <p className="text-sm text-amber-700">Choose a class list to revisit vocabulary in reading groups, spelling, or writing.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customLists.length === 0 && (
                      <p className="text-sm text-amber-700">Create a list to start saving words.</p>
                    )}
                    {customLists.map(list => (
                      <button
                        key={list.id}
                        onClick={() => addWordToList(list.id, dictionaryData.word)}
                        className="px-3 py-1.5 rounded-full bg-white border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-100"
                      >
                        {list.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <p className="text-lg font-semibold mb-2">Search a word to explore definitions and synonyms.</p>
              <p>Use it for quick-fire warm ups, reading conferences, or writing conferences.</p>
            </div>
          )}
        </div>

        {activeList && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span>📝</span>
                  {activeList.name}
                </h4>
                <p className="text-sm text-slate-500">Share this list with students or use it to differentiate vocabulary work.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyWordsToClipboard(activeList.words.join(', '))}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold"
                >
                  Copy words
                </button>
                <button
                  onClick={() => addWordToList(activeList.id, dictionaryData?.word || searchTerm)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow"
                >
                  Add current word
                </button>
              </div>
            </div>
            {activeList.words.length === 0 ? (
              <p className="text-slate-500">This list is empty. Search and add words to start building it.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeList.words.map(word => (
                  <div key={word} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                    <span>{word}</span>
                    {!defaultWordLists.some(list => list.id === activeList.id) && (
                      <button
                        onClick={() => removeWord(activeList.id, word)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyCorner;
