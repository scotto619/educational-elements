import React, { useEffect, useMemo, useState } from 'react';

const buildStorageKey = (studentId) => `studentPortal.vocabLists.${studentId || 'guest'}`;

const StudentVocabulary = ({ studentData }) => {
  const storageKey = buildStorageKey(studentData?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [result, setResult] = useState(null);
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState('');
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setLists(parsed);
          if (parsed[0]) {
            setActiveListId(parsed[0].id);
          }
        }
      }
    } catch (error) {
      console.warn('Unable to load student vocab lists', error);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify(lists));
  }, [lists, storageKey]);

  const activeList = useMemo(() => lists.find(list => list.id === activeListId) || null, [lists, activeListId]);

  const lookupWord = async (word) => {
    const cleaned = word.trim();
    if (!cleaned) return;
    setIsLoading(true);
    setLookupError('');
    setResult(null);

    try {
      const response = await fetch(`/api/dictionary?word=${encodeURIComponent(cleaned)}`);
      if (!response.ok) {
        throw new Error('Dictionary is snoozing right now. Try again soon.');
      }
      const payload = await response.json();
      if (payload.error) {
        throw new Error(payload.error);
      }
      setResult(payload);
    } catch (error) {
      console.error('Student vocabulary lookup failed', error);
      setLookupError(error.message || 'Something went wrong, please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const createList = () => {
    if (!newListName.trim()) return;
    const id = `list-${Date.now()}`;
    setLists(prev => [...prev, { id, name: newListName.trim(), words: [] }]);
    setActiveListId(id);
    setNewListName('');
  };

  const addWordToList = (listId, word) => {
    if (!word) return;
    setLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, words: Array.from(new Set([...list.words, word.trim().toLowerCase()])) }
          : list
      )
    );
  };

  const removeWord = (listId, word) => {
    setLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, words: list.words.filter(existing => existing !== word) }
          : list
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-white rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span>📚</span>
              Vocabulary Corner
            </h3>
            <p className="text-sm text-slate-100 max-w-xl">
              Search for new words, discover synonyms, and save favourites to build your literacy superpowers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    lookupWord(searchTerm);
                  }
                }}
                placeholder="Type a word like courageous..."
                className="w-full rounded-2xl bg-white/95 text-slate-800 px-4 py-3 pr-12 focus:outline-none focus:ring-4 focus:ring-sky-300"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
            </div>
            <button
              onClick={() => lookupWord(searchTerm)}
              className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold"
            >
              Explore
            </button>
          </div>
        </div>
        {lookupError && (
          <div className="mt-4 bg-white/20 text-white px-4 py-3 rounded-2xl text-sm">
            {lookupError}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">My Word Lists</h4>
            <p className="text-sm text-slate-500 mb-4">Keep track of tricky words, writing gems, and spelling targets.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lists.map(list => (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition ${
                    activeListId === list.id
                      ? 'border-transparent bg-gradient-to-r from-purple-100 to-sky-100 text-slate-900 shadow'
                      : 'border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{list.name}</span>
                    <span className="text-xs text-slate-500">{list.words.length} word{list.words.length === 1 ? '' : 's'}</span>
                  </div>
                </button>
              ))}
              {lists.length === 0 && (
                <p className="text-sm text-slate-500">Create your first list to get started.</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <h4 className="text-lg font-semibold text-slate-900 mb-2">New List</h4>
            <p className="text-sm text-slate-500 mb-3">Organise words by topic, subject, or upcoming test.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="e.g. Science Week"
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={createList}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg p-6 min-h-[280px]">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 animate-spin">🌀</div>
                <p className="text-slate-600">Collecting word magic...</p>
              </div>
            ) : result ? (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-3xl font-bold text-slate-900 capitalize">{result.word}</h4>
                    {result.pronunciation && (
                      <span className="text-sm text-slate-500">/{result.pronunciation}/</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.partOfSpeech?.map(part => (
                      <span key={part} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>

                {result.definitions && result.definitions.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-slate-800 mb-2">Definitions</h5>
                    <ol className="list-decimal ml-6 space-y-1 text-slate-600">
                      {result.definitions.slice(0, 5).map((definition, index) => (
                        <li key={index}>{definition}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {result.synonyms && result.synonyms.length > 0 && (
                  <div>
                    <h5 className="text-lg font-semibold text-slate-800 mb-2">Synonyms</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.synonyms.slice(0, 12).map(synonym => (
                        <button
                          key={synonym}
                          onClick={() => lookupWord(synonym)}
                          className="px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-100 to-purple-100 text-purple-700 text-sm font-semibold hover:from-sky-200 hover:to-purple-200"
                        >
                          {synonym}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-purple-50 to-sky-50 border border-purple-100 rounded-3xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-purple-700">Add this word to a list</p>
                      <p className="text-sm text-purple-600">Keep learning by revisiting your saved words.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lists.length === 0 && (
                        <span className="text-sm text-purple-600">Create a list first.</span>
                      )}
                      {lists.map(list => (
                        <button
                          key={list.id}
                          onClick={() => addWordToList(list.id, result.word)}
                          className="px-3 py-1.5 rounded-full bg-white border border-purple-200 text-purple-600 text-xs font-semibold hover:bg-purple-100"
                        >
                          {list.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <p className="text-lg font-semibold">Search a word to start building your vocabulary toolkit.</p>
                <p className="text-sm mt-2">Tap synonyms to explore new words and add them to your lists.</p>
              </div>
            )}
          </div>

          {activeList && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div>
                  <h5 className="text-xl font-bold text-slate-900">{activeList.name}</h5>
                  <p className="text-sm text-slate-500">Practice these words often to stay sharp!</p>
                </div>
              </div>
              {activeList.words.length === 0 ? (
                <p className="text-slate-500">No words yet. Add some from your latest searches.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {activeList.words.map(word => (
                    <div key={word} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
                      <span>{word}</span>
                      <button
                        onClick={() => removeWord(activeList.id, word)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentVocabulary;
