import React, { useEffect, useMemo, useRef, useState } from 'react';

const COLOR_CHOICES = [
  'from-amber-400 to-orange-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-purple-400 to-fuchsia-500',
  'from-sky-400 to-blue-500',
  'from-lime-400 to-emerald-500'
];

const defaultDecks = [
  {
    id: 'times-tables',
    name: 'Times Tables Sprint',
    description: 'Quick-fire multiplication facts to sharpen number recall.',
    color: 'from-amber-400 to-orange-500',
    cards: [
      { prompt: '6 × 7', response: '42' },
      { prompt: '8 × 9', response: '72' },
      { prompt: '12 × 6', response: '72' },
      { prompt: '7 × 7', response: '49' },
      { prompt: '9 × 9', response: '81' }
    ]
  },
  {
    id: 'history-heroes',
    name: 'History Heroes',
    description: 'Discover key moments and people that changed the world.',
    color: 'from-blue-400 to-indigo-500',
    cards: [
      { prompt: 'Who was the first person to step on the moon?', response: 'Neil Armstrong in 1969.' },
      { prompt: 'What sparked World War I?', response: 'The assassination of Archduke Franz Ferdinand in 1914.' },
      { prompt: 'Which civilisation built Machu Picchu?', response: 'The Inca civilisation in the 15th century.' },
      { prompt: 'Who was known as the Maid of Orléans?', response: 'Joan of Arc, a French heroine.' }
    ]
  },
  {
    id: 'science-scoop',
    name: 'Science Scoop',
    description: 'Curious questions and awe-inspiring science facts.',
    color: 'from-emerald-400 to-teal-500',
    cards: [
      { prompt: 'What gas do plants breathe in?', response: 'Carbon dioxide.' },
      { prompt: 'How many planets are in our solar system?', response: 'Eight planets orbit our sun.' },
      { prompt: 'What is the force that keeps us on the ground?', response: 'Gravity.' },
      { prompt: 'What part of the cell holds DNA?', response: 'The nucleus.' }
    ]
  },
  {
    id: 'wellbeing-wisdom',
    name: 'Wellbeing Wisdom',
    description: 'SEL prompts for thoughtful class conversations.',
    color: 'from-rose-400 to-pink-500',
    cards: [
      { prompt: 'Name one way to show kindness today.', response: 'Offer help, give a compliment, or include someone new.' },
      { prompt: 'How can you calm down when you feel worried?', response: 'Take deep breaths, talk to someone you trust, or count backwards from ten.' },
      { prompt: 'What is gratitude?', response: 'Being thankful for the people, places, and things in your life.' }
    ]
  }
];

const STORAGE_KEY = 'curriculumCorner.flipCardsDecks.v1';

const parseImportedList = (text) => {
  if (!text) return [];
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [rawPrompt, rawResponse] = line.split(/\s*[\|\-\u2013\u2014]\s*/);
      const prompt = rawPrompt?.trim();
      const response = rawResponse?.trim();
      if (!prompt || !response) {
        return null;
      }
      return { prompt, response };
    })
    .filter(Boolean);
};

const FlipCardsStudio = () => {
  const [customDecks, setCustomDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(defaultDecks[0]?.id ?? '');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorDeck, setEditorDeck] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenContainerRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedDecks = window.localStorage.getItem(STORAGE_KEY);
    if (savedDecks) {
      try {
        const parsed = JSON.parse(savedDecks);
        if (Array.isArray(parsed)) {
          setCustomDecks(parsed);
          if (parsed.length > 0) {
            setSelectedDeckId(parsed[0].id);
          }
        }
      } catch (error) {
        console.warn('Unable to parse saved flip decks', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customDecks));
  }, [customDecks]);

  const allDecks = useMemo(() => {
    const deckMap = new Map();
    [...defaultDecks, ...customDecks].forEach(deck => {
      deckMap.set(deck.id, deck);
    });
    return Array.from(deckMap.values());
  }, [customDecks]);

  useEffect(() => {
    const selectedExists = allDecks.some(deck => deck.id === selectedDeckId);
    if (!selectedExists && allDecks.length > 0) {
      setSelectedDeckId(allDecks[0].id);
      setActiveIndex(0);
      setIsFlipped(false);
    }
  }, [allDecks, selectedDeckId]);

  const selectedDeck = useMemo(
    () => allDecks.find(deck => deck.id === selectedDeckId) ?? allDecks[0] ?? null,
    [allDecks, selectedDeckId]
  );

  useEffect(() => {
    setActiveIndex(0);
    setIsFlipped(false);
  }, [selectedDeckId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedDeck || (!isFullscreen && document.fullscreenElement == null)) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextCard();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePreviousCard();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (event.key === 'Escape') {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeck, isFullscreen, activeIndex]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (!active) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleNextCard = () => {
    setActiveIndex(prev => {
      const nextIndex = (prev + 1) % (selectedDeck?.cards?.length || 1);
      return nextIndex;
    });
    setIsFlipped(false);
  };

  const handlePreviousCard = () => {
    setActiveIndex(prev => {
      if (!selectedDeck?.cards?.length) return 0;
      const nextIndex = (prev - 1 + selectedDeck.cards.length) % selectedDeck.cards.length;
      return nextIndex;
    });
    setIsFlipped(false);
  };

  const openEditor = (deck) => {
    const deckToEdit = deck ?? {
      id: `custom-${Date.now()}`,
      name: 'New Deck',
      description: 'Add a deck description',
      color: COLOR_CHOICES[Math.floor(Math.random() * COLOR_CHOICES.length)],
      cards: [
        { prompt: 'Question', response: 'Answer' }
      ]
    };
    setEditorDeck(deckToEdit);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorDeck(null);
  };

  const saveDeck = () => {
    if (!editorDeck) return;
    setCustomDecks(prev => {
      const existingIndex = prev.findIndex(deck => deck.id === editorDeck.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = editorDeck;
        return updated;
      }
      return [...prev, editorDeck];
    });
    setSelectedDeckId(editorDeck.id);
    closeEditor();
  };

  const deleteDeck = (id) => {
    setCustomDecks(prev => prev.filter(deck => deck.id !== id));
    if (selectedDeckId === id) {
      setSelectedDeckId(defaultDecks[0]?.id ?? '');
    }
  };

  const handleImport = (text) => {
    const cards = parseImportedList(text);
    if (cards.length === 0) return;
    setEditorDeck(prev => ({
      ...prev,
      cards
    }));
  };

  const enterFullscreen = async () => {
    setIsFullscreen(true);
    setTimeout(() => {
      const element = fullscreenContainerRef.current;
      if (element && element.requestFullscreen) {
        element.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      }
    }, 50);
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        setIsFullscreen(false);
      });
    }
    setIsFullscreen(false);
  };

  if (!selectedDeck) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-slate-800 mb-4">Create your first deck</h3>
        <p className="text-slate-600 mb-6">Use the deck builder to add questions and answers or import them from a list.</p>
        <button
          onClick={() => openEditor(null)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow"
        >
          Create Deck
        </button>
      </div>
    );
  }

  const totalCards = selectedDeck.cards?.length ?? 0;
  const currentCard = selectedDeck.cards?.[activeIndex] ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Deck Library</h3>
            <button
              onClick={() => openEditor(null)}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow"
            >
              + New Deck
            </button>
          </div>
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {allDecks.map(deck => {
              const isSelected = deck.id === selectedDeck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => setSelectedDeckId(deck.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? 'border-transparent ring-2 ring-offset-2 ring-purple-400 bg-gradient-to-r from-slate-50 to-purple-50'
                      : 'border-slate-200 hover:border-purple-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="text-lg">{deck.icon ?? '🃏'}</span>
                        {deck.name}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{deck.description}</p>
                    </div>
                    {deck.cards && (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        {deck.cards.length} cards
                      </span>
                    )}
                  </div>
                  {deck.id.startsWith('custom-') && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditor(deck);
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-white border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDeck(deck.id);
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-2xl p-5 shadow-inner">
          <h4 className="text-lg font-semibold text-purple-800 mb-2">Quick Tips</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Use ← and → to move between cards in fullscreen.</li>
            <li>• Press the space bar to flip the current card.</li>
            <li>• Import decks by pasting <code>Question | Answer</code> pairs.</li>
            <li>• Save decks for future lessons – they stay on this device.</li>
          </ul>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 opacity-70"></div>
          <div className="relative z-10" ref={fullscreenContainerRef}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <span className="text-3xl">🎴</span>
                  {selectedDeck.name}
                </h3>
                <p className="text-slate-500 text-sm max-w-xl">{selectedDeck.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDeck.id.startsWith('custom-') && (
                  <button
                    onClick={() => openEditor(selectedDeck)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    Edit deck
                  </button>
                )}
                <button
                  onClick={() => setIsFlipped(prev => !prev)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Flip card
                </button>
                <button
                  onClick={enterFullscreen}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow hover:shadow-lg"
                >
                  Fullscreen
                </button>
              </div>
            </div>

            <div className="relative h-[320px] md:h-[360px] flex items-center justify-center">
              <div
                className={`relative w-full max-w-xl h-full transition-transform duration-500 transform perspective group`}
              >
                <div
                  className={`absolute inset-0 rounded-3xl shadow-xl bg-gradient-to-br ${selectedDeck.color} text-white flex flex-col justify-between p-8 backface-hidden transition-transform duration-500`}
                  style={{
                    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                    opacity: isFlipped ? 0 : 1
                  }}
                >
                  <div className="text-sm uppercase tracking-widest font-semibold">Prompt</div>
                  <div className="text-3xl font-bold leading-snug">{currentCard?.prompt}</div>
                  <div className="text-sm opacity-90">Card {activeIndex + 1} of {totalCards}</div>
                </div>
                <div
                  className="absolute inset-0 rounded-3xl shadow-xl bg-white text-slate-800 flex flex-col justify-between p-8 backface-hidden transition-transform duration-500"
                  style={{
                    transform: `rotateY(${isFlipped ? 0 : 180}deg)`,
                    opacity: isFlipped ? 1 : 0
                  }}
                >
                  <div className="text-sm uppercase tracking-widest font-semibold text-slate-400">Answer</div>
                  <div className="text-3xl font-bold leading-snug">{currentCard?.response}</div>
                  <div className="text-sm text-slate-500">Tap or press space to flip back.</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={handlePreviousCard}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600"
              >
                ← Previous
              </button>
              <div className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{activeIndex + 1}</span> of {totalCards}
              </div>
              <button
                onClick={handleNextCard}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-600"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-slate-900 bg-opacity-90 z-50 flex flex-col"
        >
          <div className="flex justify-between items-center px-6 py-4 text-white">
            <div>
              <h3 className="text-xl font-semibold">{selectedDeck.name}</h3>
              <p className="text-sm text-slate-200">Use ← → to navigate • Space to flip • Esc to exit</p>
            </div>
            <button
              onClick={exitFullscreen}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold"
            >
              Close
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 pb-10">
            <div className="w-full max-w-4xl h-[70vh]">
              <div
                className={`relative w-full h-full transition-transform duration-500 transform perspective`}
              >
                <div
                  className={`absolute inset-0 rounded-[40px] shadow-2xl bg-gradient-to-br ${selectedDeck.color} text-white flex flex-col justify-between p-16 backface-hidden transition-transform duration-500`}
                  style={{
                    transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
                    opacity: isFlipped ? 0 : 1
                  }}
                >
                  <div className="text-xl uppercase tracking-[0.4em] font-semibold">Prompt</div>
                  <div className="text-5xl font-extrabold leading-snug">{currentCard?.prompt}</div>
                  <div className="text-lg opacity-90">Card {activeIndex + 1} of {totalCards}</div>
                </div>
                <div
                  className="absolute inset-0 rounded-[40px] shadow-2xl bg-white text-slate-900 flex flex-col justify-between p-16 backface-hidden transition-transform duration-500"
                  style={{
                    transform: `rotateY(${isFlipped ? 0 : 180}deg)`,
                    opacity: isFlipped ? 1 : 0
                  }}
                >
                  <div className="text-xl uppercase tracking-[0.4em] font-semibold text-slate-400">Answer</div>
                  <div className="text-5xl font-extrabold leading-snug">{currentCard?.response}</div>
                  <div className="text-lg text-slate-500">Press space to flip back.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && editorDeck && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Deck Builder</h3>
                <p className="text-sm text-slate-500">Craft colourful card sets or paste a list to import instantly.</p>
              </div>
              <button onClick={closeEditor} className="px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Deck name</label>
                  <input
                    type="text"
                    value={editorDeck.name}
                    onChange={(event) => setEditorDeck(prev => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Colour palette</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_CHOICES.map(choice => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setEditorDeck(prev => ({ ...prev, color: choice }))}
                        className={`h-10 w-16 rounded-lg bg-gradient-to-r ${choice} border-2 ${
                          editorDeck.color === choice ? 'border-slate-900' : 'border-transparent'
                        }`}
                        aria-label={`Use ${choice} gradient`}
                      />
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editorDeck.description}
                    onChange={(event) => setEditorDeck(prev => ({ ...prev, description: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    rows={2}
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-slate-800">Cards</h4>
                    <button
                      type="button"
                      onClick={() =>
                        setEditorDeck(prev => ({
                          ...prev,
                          cards: [...prev.cards, { prompt: '', response: '' }]
                        }))
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow"
                    >
                      + Add Card
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editorDeck.cards.map((card, index) => (
                      <div key={index} className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Card {index + 1}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditorDeck(prev => ({
                                ...prev,
                                cards: prev.cards.filter((_, cardIndex) => cardIndex !== index)
                              }))
                            }
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                        <label className="block text-xs font-semibold text-slate-600">Prompt</label>
                        <input
                          type="text"
                          value={card.prompt}
                          onChange={(event) =>
                            setEditorDeck(prev => {
                              const updated = [...prev.cards];
                              updated[index] = { ...updated[index], prompt: event.target.value };
                              return { ...prev, cards: updated };
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        <label className="block text-xs font-semibold text-slate-600">Answer</label>
                        <input
                          type="text"
                          value={card.response}
                          onChange={(event) =>
                            setEditorDeck(prev => {
                              const updated = [...prev.cards];
                              updated[index] = { ...updated[index], response: event.target.value };
                              return { ...prev, cards: updated };
                            })
                          }
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 border border-blue-100">
                  <h4 className="text-lg font-semibold text-blue-700 mb-3">Import a list</h4>
                  <p className="text-sm text-blue-600 mb-3">
                    Paste <strong>Question | Answer</strong> pairs on individual lines. Use hyphens if you prefer: <em>Question - Answer</em>.
                  </p>
                  <textarea
                    rows={10}
                    placeholder={`Example:\nWhat is 7 x 8? | 56\nWho wrote "Charlotte's Web"? | E. B. White`}
                    onBlur={(event) => handleImport(event.target.value)}
                    className="w-full rounded-2xl border border-blue-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
                  ></textarea>
                  <p className="text-xs text-blue-500 mt-2">Tip: You can quickly paste from spreadsheets or planning docs.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="text-xs text-slate-500">
                Decks save locally on this device. Export support is coming soon!
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeEditor}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={saveDeck}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow"
                >
                  Save deck
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipCardsStudio;
