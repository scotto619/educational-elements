// components/tabs/QuizShowTab.js - Quiz Show Command Centre (teacher side)
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
  GAME_MODES,
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
// GAME MODE SELECT MODAL — shown after picking a quiz to launch
// ============================================================
const ModeSelectModal = ({ quiz, onClose, onLaunch, starting }) => {
  const [selectedMode, setSelectedMode] = useState('classic');
  const [teamCount, setTeamCount] = useState(2);
  const [powerUpsEnabled, setPowerUpsEnabled] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between sticky top-0 bg-slate-900/95 backdrop-blur rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-black text-white">🎛️ Choose a Game Mode</h2>
            <p className="text-slate-400 text-sm mt-1">
              Launching <span className="text-fuchsia-300 font-semibold">{quiz?.title}</span> · {quiz?.questions?.length || 0} questions
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 text-xl font-bold shrink-0">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(GAME_MODES).map(mode => {
              const active = selectedMode === mode.id;
              return (
                <button key={mode.id} onClick={() => setSelectedMode(mode.id)}
                  className={`relative text-left rounded-2xl p-5 border-2 transition-all ${
                    active
                      ? 'border-white/70 bg-gradient-to-br ' + mode.gradient + ' shadow-xl scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                  }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{mode.icon}</span>
                    <div>
                      <div className="font-black text-white text-lg leading-tight">{mode.name}</div>
                      <div className={`text-xs font-semibold ${active ? 'text-white/90' : 'text-slate-400'}`}>{mode.tagline}</div>
                    </div>
                    {active && <span className="ml-auto text-2xl">✅</span>}
                  </div>
                  <p className={`text-sm leading-snug ${active ? 'text-white/85' : 'text-slate-400'}`}>
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Mode-specific options */}
          {selectedMode === 'team' && (
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4">
              <p className="text-amber-200 font-bold mb-3">🛡️ Number of teams</p>
              <div className="flex gap-2">
                {[2, 3, 4].map(n => (
                  <button key={n} onClick={() => setTeamCount(n)}
                    className={`flex-1 py-2.5 rounded-xl font-black text-lg border-2 transition ${
                      teamCount === n
                        ? 'bg-amber-500 text-amber-950 border-amber-400'
                        : 'bg-white/5 text-amber-200 border-white/10 hover:border-amber-400/50'
                    }`}>
                    {n} teams
                  </button>
                ))}
              </div>
              <p className="text-amber-200/70 text-xs mt-2">You'll shuffle players into teams from the lobby once everyone has joined.</p>
            </div>
          )}

          {/* Power-ups toggle */}
          <label className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 cursor-pointer hover:bg-white/10 transition">
            <div>
              <p className="text-white font-bold">✨ Power-ups</p>
              <p className="text-slate-400 text-sm">
                {selectedMode === 'elimination'
                  ? 'Students get a 50/50 and a Shield that saves them from one wrong answer'
                  : 'Students get one 50/50 and one Double Points to use when it counts'}
              </p>
            </div>
            <div onClick={(e) => { e.preventDefault(); setPowerUpsEnabled(v => !v); }}
              className={`w-14 h-8 rounded-full p-1 transition-colors shrink-0 ml-4 ${powerUpsEnabled ? 'bg-fuchsia-500' : 'bg-slate-700'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${powerUpsEnabled ? 'translate-x-6' : ''}`} />
            </div>
          </label>

          <button onClick={() => onLaunch(selectedMode, { teamCount, powerUpsEnabled })} disabled={starting}
            className={`w-full py-4 rounded-2xl font-black text-lg text-white bg-gradient-to-r ${GAME_MODES[selectedMode].gradient} hover:brightness-110 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3`}>
            {starting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating game room…
              </>
            ) : (
              <>
                {GAME_MODES[selectedMode].icon} Open the {GAME_MODES[selectedMode].name} Lobby
              </>
            )}
          </button>
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

  const difficultyStyle = {
    easy: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
    medium: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
    hard: 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-cyan-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl">📚</span>
                <h2 className="text-2xl font-black">Quiz Library</h2>
              </div>
              <p className="text-sky-100 text-sm">{PREMADE_QUIZZES.length} ready-to-play quizzes</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-xl font-bold">×</button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search quizzes…"
              className="w-full bg-white/15 border border-white/30 rounded-xl px-4 py-2 text-white placeholder-white/60 focus:outline-none focus:bg-white/25" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900 flex gap-2 overflow-x-auto flex-shrink-0">
          {Object.entries(PREMADE_CATEGORIES).map(([key, cat]) => (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCategory === key
                  ? 'bg-sky-500 text-white shadow'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:border-sky-400/50 hover:text-white'
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
                className="bg-white/5 rounded-2xl border-2 border-white/10 hover:border-sky-400/50 transition-all group flex flex-col">
                <div className="p-5 flex-1">
                  <div className="text-4xl mb-3">{quiz.emoji}</div>
                  <h3 className="font-bold text-white text-lg mb-1 group-hover:text-sky-300 transition">{quiz.title}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{quiz.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${difficultyStyle[quiz.difficulty] || difficultyStyle.medium}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded-full">
                      {quiz.questions.length} questions
                    </span>
                    <span className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded-full">
                      Yr {quiz.gradeLevel}
                    </span>
                  </div>
                </div>
                <div className="px-5 pb-4 flex gap-2">
                  <button onClick={() => onStartQuiz(quiz)}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-sm font-bold text-center hover:bg-emerald-400 transition">
                    ▶ Play
                  </button>
                  <button onClick={() => onSelectQuiz(quiz)}
                    className="flex-1 bg-white/10 text-sky-300 py-2 rounded-xl text-sm font-bold text-center hover:bg-white/20 transition">
                    ✏ Customise
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-semibold text-white">No quizzes found</p>
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
  const [view, setView] = useState('dashboard'); // dashboard, creating, lobby, playing, recap
  const [editingQuiz, setEditingQuiz] = useState(null);

  // ---- Quiz library state ----
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  // ---- Game state ----
  const [roomCode, setRoomCode] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [gameResults, setGameResults] = useState(null);
  const [finalGameData, setFinalGameData] = useState(null);
  const gameListenerRef = useRef(null);

  // ---- Modal state ----
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [pendingQuiz, setPendingQuiz] = useState(null); // quiz waiting for mode selection

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

  // ---- Launch flow: pick quiz → choose mode → create room ----
  const requestStartGame = (quiz) => {
    setStartError('');
    setPendingQuiz(quiz);
  };

  const startGame = async (quiz, mode = 'classic', modeOptions = {}) => {
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
      mode,
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
        powerUpsEnabled: modeOptions.powerUpsEnabled !== false,
        teamCount: mode === 'team' ? (modeOptions.teamCount || 2) : null,
      }
    };

    try {
      await set(ref(database, `gameRooms/${code}`), gameRoom);
      setRoomCode(code);
      setGameData(gameRoom);
      setFinalGameData(null);
      setGameResults(null);

      // Attach real-time listener
      if (gameListenerRef.current) off(gameListenerRef.current);
      const gameRef = ref(database, `gameRooms/${code}`);
      gameListenerRef.current = gameRef;
      onValue(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          setGameData(snapshot.val());
        }
      });

      setStarting(false);
      setPendingQuiz(null);
      setView('lobby');
      playQuizSound('gameStart');
    } catch (err) {
      console.error('Error creating game room:', err);
      setStartError(`Failed to create game: ${err.message || 'Check your Firebase connection.'}`);
      setStarting(false);
    }
  };

  // ---- End game (mark finished — podium shows inside GamePresentation) ----
  const endGame = async () => {
    if (!roomCode) return;
    try {
      await update(ref(database, `gameRooms/${roomCode}`), {
        status: 'finished',
        questionPhase: 'finished',
        finishedAt: Date.now()
      });
    } catch (err) {
      console.error('Error ending game:', err);
    }
  };

  // ---- Back to dashboard (cleanup) ----
  const backToDashboard = () => {
    if (gameListenerRef.current) {
      off(gameListenerRef.current);
      gameListenerRef.current = null;
    }
    if (roomCode) {
      const code = roomCode;
      setTimeout(() => {
        remove(ref(database, `gameRooms/${code}`)).catch(() => {});
      }, 5000);
    }
    setRoomCode(null);
    setGameData(null);
    setGameResults(null);
    setFinalGameData(null);
    setView('dashboard');
  };

  // ---- Recap view (detailed results after the podium) ----
  const showRecap = () => {
    setFinalGameData(gameData);
    setGameResults(calculateFinalLeaderboard(gameData));
    setView('recap');
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

  // ---- Handle premade quiz selection (customise) ----
  const handlePremadeSelect = (quiz) => {
    setShowLibraryModal(false);
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
      requestStartGame(preset);
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
          onStartGame={requestStartGame}
          onOpenLibrary={() => setShowLibraryModal(true)}
          onCreatePreset={handleCreatePreset}
          loading={loadingQuizzes}
          QUESTION_CATEGORIES={QUESTION_CATEGORIES}
        />

        {/* Modals */}
        {showLibraryModal && (
          <QuizLibraryModal
            onClose={() => setShowLibraryModal(false)}
            onSelectQuiz={handlePremadeSelect}
            onStartQuiz={(quiz) => { setShowLibraryModal(false); requestStartGame(quiz); }}
          />
        )}
        {pendingQuiz && (
          <ModeSelectModal
            quiz={pendingQuiz}
            starting={starting}
            onClose={() => { if (!starting) setPendingQuiz(null); }}
            onLaunch={(mode, options) => startGame(pendingQuiz, mode, options)}
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
      <GameLobby
        roomCode={roomCode}
        gameData={gameData}
        onStartGame={async () => {
          try {
            const mode = gameData?.mode || 'classic';
            await update(ref(database, `gameRooms/${roomCode}`), {
              status: 'playing',
              questionPhase: mode === 'race' ? 'race' : 'showing',
              currentQuestion: 0,
              startedAt: Date.now()
            });
            setView('playing');
          } catch (err) {
            console.error('Failed to start game:', err);
          }
        }}
        onCancelGame={() => {
          if (window.confirm('Cancel this game and return to the dashboard?')) {
            backToDashboard();
          }
        }}
        loading={false}
      />
    );
  }

  // --- Game Presentation (active game + podium) ---
  if (view === 'playing') {
    return (
      <GamePresentation
        roomCode={roomCode}
        gameData={gameData}
        onEndGame={endGame}
        onExit={backToDashboard}
        onShowRecap={showRecap}
        onAwardXP={onAwardXP}
        onAwardCoins={onAwardCoins}
        showToast={showToast}
      />
    );
  }

  // --- Detailed recap ---
  if (view === 'recap') {
    return (
      <GameResults
        results={gameResults || []}
        gameData={finalGameData}
        onDone={backToDashboard}
        getAvatarImage={getAvatarImage}
      />
    );
  }

  return null;
};

export default QuizShowTab;
