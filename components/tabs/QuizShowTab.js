// components/tabs/QuizShowTab.js - Full Quiz Show Management for Teachers
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { firestore, database } from '../../utils/firebase';
import {
  collection, addDoc, getDocs, query, where,
  deleteDoc, doc, setDoc
} from 'firebase/firestore';
import { ref, set, onValue, off, update, remove } from 'firebase/database';
import {
  generateRoomCode,
  sanitizeQuizForGame,
  createQuizFromPreset,
  calculateFinalLeaderboard,
  QUESTION_CATEGORIES,
  playQuizSound
} from '../../utils/quizShowHelpers';
import { PREMADE_QUIZZES, PREMADE_CATEGORIES } from '../../constants/premadeQuizzes';

// Sub-components
import QuizDashboard from '../quizshow/teacher/QuizDashboard';
import QuizCreator from '../quizshow/teacher/QuizCreator';
import GameLobby from '../quizshow/teacher/GameLobby';
import GamePresentation from '../quizshow/teacher/GamePresentation';
import GameResults from '../quizshow/teacher/GameResults';

// ============================================================
// AI GENERATOR MODAL
// ============================================================
const AIGeneratorModal = ({ onClose, onQuizGenerated }) => {
  const [topic, setTopic] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Primary school (Years 3-6)');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) { setError('Please enter a topic'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim(), gradeLevel, numQuestions, difficulty })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to generate quiz. Please try again.');
        return;
      }
      onQuizGenerated(data.quiz);
    } catch (e) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const gradeLevels = [
    'Foundation - Year 2 (Ages 5-8)',
    'Primary school (Years 3-6)',
    'Middle school (Years 7-9)',
    'High school (Years 10-12)',
  ];

  const topics = ['Solar System', 'Ancient Egypt', 'Fractions', 'World War II', 'Animals of Australia', 'Grammar', 'Human Body', 'Australian History'];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">✨</span>
                <h2 className="text-2xl font-black">AI Quiz Generator</h2>
              </div>
              <p className="text-violet-200 text-sm">Powered by AI — free, instant, no setup required</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-xl font-bold">×</button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Topic *</label>
            <input
              type="text"
              value={topic}
              onChange={e => { setTopic(e.target.value); setError(''); }}
              placeholder="e.g. Solar System, Fractions, World War II..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-800"
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
            {/* Quick topic chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {topics.map(t => (
                <button key={t} onClick={() => { setTopic(t); setError(''); }}
                  className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2 py-1 rounded-full hover:bg-violet-100 transition">
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Level */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level</label>
            <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-800">
              {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Difficulty & Questions Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition capitalize ${
                      difficulty === d
                        ? 'bg-violet-500 text-white border-violet-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Questions</label>
              <select value={numQuestions} onChange={e => setNumQuestions(parseInt(e.target.value))}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-violet-400 text-gray-800">
                {[5, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button onClick={handleGenerate} disabled={loading || !topic.trim()}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate Quiz
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            ✅ Completely free — no account or setup needed
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PREMADE QUIZ LIBRARY MODAL
// ============================================================
const QuizLibraryModal = ({ onClose, onSelectQuiz, onStartQuiz }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = PREMADE_QUIZZES.filter(q => {
    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesSearch = !search || q.title.toLowerCase().includes(search.toLowerCase()) || q.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const difficultyColor = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">📚</span>
                <h2 className="text-2xl font-black">Quiz Library</h2>
              </div>
              <p className="text-sky-100 text-sm">{PREMADE_QUIZZES.length} expertly crafted quizzes ready to play</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-xl font-bold">×</button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search quizzes..."
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:bg-white/30" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b bg-gray-50 flex gap-2 overflow-x-auto flex-shrink-0">
          {Object.entries(PREMADE_CATEGORIES).map(([key, cat]) => (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === key
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-sky-300'
              }`}>
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Quiz Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(quiz => (
              <div key={quiz.id}
                className="bg-white rounded-2xl border-2 border-gray-100 hover:border-sky-300 shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="p-5 flex-1">
                  <div className="text-4xl mb-3">{quiz.emoji}</div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-sky-600 transition">{quiz.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${difficultyColor[quiz.difficulty] || difficultyColor.medium}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {quiz.questions.length} questions
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Yr {quiz.gradeLevel}
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-4 flex gap-2">
                  <button onClick={() => onStartQuiz(quiz)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-sm font-bold text-center hover:bg-green-600 transition">
                    ▶ Start Now
                  </button>
                  <button onClick={() => onSelectQuiz(quiz)}
                    className="flex-1 bg-sky-100 text-sky-700 py-2 rounded-xl text-sm font-bold text-center hover:bg-sky-200 transition">
                    ✏ Customise
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold">No quizzes found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN QUIZ SHOW TAB
// ============================================================
const QuizShowTab = ({
  students = [],
  user,
  onAwardXP,
  onAwardCoins,
  getAvatarImage,
  calculateAvatarLevel,
  currentClassId,
  userData,
  showToast
}) => {
  // ---- View state ----
  const [view, setView] = useState('dashboard'); // dashboard, creating, editing, lobby, playing, results
  const [editingQuiz, setEditingQuiz] = useState(null);

  // ---- Quiz library state ----
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // ---- Game state ----
  const [roomCode, setRoomCode] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const gameListenerRef = useRef(null);

  // ---- Modal state ----
  const [showAIModal, setShowAIModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  // ---- Error/status for start game ----
  const [startError, setStartError] = useState('');
  const [starting, setStarting] = useState(false);

  // ---- Load teacher's saved quizzes from Firestore ----
  const loadQuizzes = useCallback(async () => {
    if (!user?.uid) return;
    setLoadingQuizzes(true);
    try {
      const q = query(collection(firestore, 'quizzes'), where('teacherId', '==', user.uid));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
      // Sort newest first
      list.sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
      setQuizzes(list);
    } catch (err) {
      console.error('Error loading quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  }, [user?.uid]);

  useEffect(() => { loadQuizzes(); }, [loadQuizzes]);

  // ---- Firestore: Save quiz ----
  const saveQuiz = async (quizData) => {
    if (!user?.uid) return;
    try {
      const toSave = {
        ...quizData,
        teacherId: user.uid,
        updatedAt: Date.now(),
        createdAt: quizData.createdAt || Date.now(),
      };

      if (quizData.firestoreId) {
        await setDoc(doc(firestore, 'quizzes', quizData.firestoreId), toSave);
      } else {
        const quizRef = await addDoc(collection(firestore, 'quizzes'), toSave);
        toSave.firestoreId = quizRef.id;
      }
      await loadQuizzes();
      return toSave;
    } catch (err) {
      console.error('Error saving quiz:', err);
      throw err;
    }
  };

  // ---- Firestore: Delete quiz ----
  const deleteQuiz = async (firestoreId) => {
    if (!firestoreId) return;
    try {
      await deleteDoc(doc(firestore, 'quizzes', firestoreId));
      await loadQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  // ---- Firestore: Duplicate quiz ----
  const duplicateQuiz = async (quiz) => {
    const copy = {
      ...quiz,
      id: undefined,
      firestoreId: undefined,
      title: `${quiz.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveQuiz(copy);
  };

  // ---- Start a game: create Firebase Realtime Database room ----
  const startGame = async (quiz) => {
    setStartError('');
    setStarting(true);

    const hostId = user?.uid;
    if (!hostId) {
      setStartError('Not logged in. Please refresh the page and try again.');
      setStarting(false);
      return;
    }

    const sanitized = sanitizeQuizForGame(quiz);
    if (!sanitized) {
      setStartError('This quiz has no valid questions. Please edit it and try again.');
      setStarting(false);
      return;
    }

    const code = generateRoomCode();
    const gameRoom = {
      quiz: sanitized,
      status: 'waiting',
      questionPhase: 'waiting',
      currentQuestion: 0,
      hostId,
      hostName: userData?.displayName || user?.email || 'Teacher',
      createdAt: Date.now(),
      players: {},
      responses: {},
      settings: {
        showLeaderboard: true,
        allowLateJoin: false,
        showCorrectAnswers: true,
        timePerQuestion: sanitized.settings?.timePerQuestion || 20,
      }
    };

    try {
      await set(ref(database, `gameRooms/${code}`), gameRoom);
      setRoomCode(code);
      setGameData(gameRoom);

      // Attach real-time listener
      if (gameListenerRef.current) off(gameListenerRef.current);
      const gameRef = ref(database, `gameRooms/${code}`);
      gameListenerRef.current = gameRef;
      onValue(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setGameData(data);
          if (data.status === 'finished' || data.questionPhase === 'finished') {
            setGameResults(calculateFinalLeaderboard(data));
          }
        }
      });

      setStarting(false);
      setView('lobby');
      playQuizSound('gameStart');
    } catch (err) {
      console.error('Error creating game room:', err);
      setStartError(`Failed to create game: ${err.message || 'Check your Firebase connection.'}`);
      setStarting(false);
    }
  };

  // ---- End game ----
  const endGame = async () => {
    if (roomCode) {
      try {
        await update(ref(database, `gameRooms/${roomCode}`), {
          status: 'finished',
          questionPhase: 'finished',
          finishedAt: Date.now()
        });
        const results = calculateFinalLeaderboard(gameData);
        setGameResults(results);
        setView('results');
      } catch (err) {
        console.error('Error ending game:', err);
      }
    }
  };

  // ---- Back to dashboard (cleanup) ----
  const backToDashboard = () => {
    if (gameListenerRef.current) {
      off(gameListenerRef.current);
      gameListenerRef.current = null;
    }
    // Clean up finished game room after a delay
    if (roomCode) {
      setTimeout(() => {
        remove(ref(database, `gameRooms/${roomCode}`)).catch(() => {});
      }, 5000);
    }
    setRoomCode(null);
    setGameData(null);
    setGameResults(null);
    setView('dashboard');
  };

  // ---- Handle quiz creator save ----
  const handleQuizSave = async (quiz) => {
    try {
      await saveQuiz(quiz);
      setView('dashboard');
      setEditingQuiz(null);
    } catch (err) {
      alert('Failed to save quiz. Please try again.');
    }
  };

  // ---- Handle AI-generated quiz ----
  const handleAIQuizGenerated = (generatedQuiz) => {
    setShowAIModal(false);
    // Open the quiz creator pre-filled with AI questions
    setEditingQuiz({
      ...generatedQuiz,
      id: `ai_${Date.now()}`,
      questions: generatedQuiz.questions,
      settings: {
        showCorrectAnswers: true,
        allowRetakes: false,
        shuffleQuestions: false,
        shuffleAnswers: true,
        timePerQuestion: 20
      }
    });
    setView('creating');
  };

  // ---- Handle premade quiz selection ----
  const handlePremadeSelect = (quiz) => {
    setShowLibraryModal(false);
    // Option A: start directly or open in editor - we'll open in editor first
    setEditingQuiz({
      ...quiz,
      id: `premade_copy_${Date.now()}`,
      settings: {
        showCorrectAnswers: true,
        allowRetakes: false,
        shuffleQuestions: false,
        shuffleAnswers: true,
        timePerQuestion: 20
      }
    });
    setView('creating');
  };

  // ---- Handle preset quiz ----
  const handleCreatePreset = (category, questionCount) => {
    try {
      const preset = createQuizFromPreset(category, questionCount);
      startGame(preset);
    } catch (err) {
      setStartError(err.message || 'Could not create preset quiz');
    }
  };

  // ---- Cleanup listener on unmount ----
  useEffect(() => {
    return () => {
      if (gameListenerRef.current) {
        off(gameListenerRef.current);
      }
    };
  }, []);

  // ---- When game data changes to finished, navigate to results ----
  useEffect(() => {
    if (gameData?.status === 'finished' && view === 'playing') {
      const results = calculateFinalLeaderboard(gameData);
      setGameResults(results);
      setView('results');
    }
  }, [gameData?.status, view]);

  // ============================================================
  // RENDER VIEWS
  // ============================================================

  // --- Dashboard ---
  if (view === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Start error banner */}
        {startError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-red-700 text-sm font-medium">⚠️ {startError}</span>
            <button onClick={() => setStartError('')} className="text-red-400 hover:text-red-600 text-lg font-bold ml-4">×</button>
          </div>
        )}
        {/* Starting overlay */}
        {starting && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-blue-700 text-sm font-medium">Creating game room...</span>
          </div>
        )}
        {/* Action bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Library */}
          <button onClick={() => !starting && setShowLibraryModal(true)}
            disabled={starting}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 p-5 text-left text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60">
            <div className="text-4xl mb-2">📚</div>
            <div className="font-bold text-lg">Premade Library</div>
            <div className="text-sky-100 text-sm mt-1">{PREMADE_QUIZZES.length} ready-to-use quizzes</div>
          </button>

          {/* AI Generator */}
          <button onClick={() => !starting && setShowAIModal(true)}
            disabled={starting}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 p-5 text-left text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60">
            <div className="text-4xl mb-2">✨</div>
            <div className="font-bold text-lg">AI Generator</div>
            <div className="text-violet-100 text-sm mt-1">Free AI — any topic, no setup</div>
          </button>

          {/* Custom Quiz */}
          <button onClick={() => !starting && (setEditingQuiz(null), setView('creating'))}
            disabled={starting}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 p-5 text-left text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60">
            <div className="text-4xl mb-2">🎨</div>
            <div className="font-bold text-lg">Build Custom Quiz</div>
            <div className="text-purple-100 text-sm mt-1">Design your own questions from scratch</div>
          </button>
        </div>

        {/* Quiz dashboard component */}
        <QuizDashboard
          quizzes={quizzes}
          onCreateQuiz={() => { setEditingQuiz(null); setView('creating'); }}
          onEditQuiz={(quiz) => { setEditingQuiz(quiz); setView('creating'); }}
          onDeleteQuiz={(id) => {
            const quiz = quizzes.find(q => q.id === id || q.firestoreId === id);
            if (quiz && window.confirm(`Delete "${quiz.title}"?`)) {
              deleteQuiz(quiz.firestoreId || quiz.id);
            }
          }}
          onDuplicateQuiz={duplicateQuiz}
          onStartGame={startGame}
          onOpenLibrary={() => setShowLibraryModal(true)}
          loading={loadingQuizzes}
          QUESTION_CATEGORIES={QUESTION_CATEGORIES}
        />

        {/* Modals */}
        {showAIModal && (
          <AIGeneratorModal
            onClose={() => setShowAIModal(false)}
            onQuizGenerated={handleAIQuizGenerated}
          />
        )}
        {showLibraryModal && (
          <QuizLibraryModal
            onClose={() => setShowLibraryModal(false)}
            onSelectQuiz={handlePremadeSelect}
            onStartQuiz={(quiz) => { setShowLibraryModal(false); setStartError(''); startGame(quiz); }}
          />
        )}
      </div>
    );
  }

  // --- Quiz Creator ---
  if (view === 'creating') {
    return (
      <div>
        <button onClick={() => { setView('dashboard'); setEditingQuiz(null); }}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition">
          ← Back to Dashboard
        </button>
        <QuizCreator
          quiz={editingQuiz}
          onSave={handleQuizSave}
          onCancel={() => { setView('dashboard'); setEditingQuiz(null); }}
        />
      </div>
    );
  }

  // --- Game Lobby ---
  if (view === 'lobby') {
    return (
      <div>
        <button onClick={() => {
          if (window.confirm('End the game and return to dashboard?')) {
            endGame();
            backToDashboard();
          }
        }} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition">
          ← End Game & Return
        </button>
        <GameLobby
          roomCode={roomCode}
          gameData={gameData}
          onStartGame={() => setView('playing')}
          onEndGame={backToDashboard}
          loading={false}
        />
      </div>
    );
  }

  // --- Game Presentation (Active Game) ---
  if (view === 'playing') {
    return (
      <GamePresentation
        roomCode={roomCode}
        gameData={gameData}
        onEndGame={endGame}
        onAwardXP={onAwardXP}
        onAwardCoins={onAwardCoins}
        showToast={showToast}
      />
    );
  }

  // --- Game Results ---
  if (view === 'results') {
    return (
      <div>
        <GameResults
          results={gameResults || []}
          onNewGame={backToDashboard}
          getAvatarImage={getAvatarImage}
        />
        <div className="mt-4 text-center">
          <button onClick={backToDashboard}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default QuizShowTab;
