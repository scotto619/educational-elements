// components/tabs/QuizShowTab.js - COMPLETE QUIZ CREATOR INTEGRATION
import React, { useState, useEffect, useCallback } from 'react';
import { database } from '../../utils/firebase';
import { ref, onValue, set, remove, update, off } from 'firebase/database';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';
import { generateRoomCode, playQuizSound, createQuizFromPreset, QUESTION_CATEGORIES } from '../../utils/quizShowHelpers';

// Import components
import QuizDashboard from '../quizshow/teacher/QuizDashboard';
import QuizCreator from '../quizshow/teacher/QuizCreator';
import GameLobby from '../quizshow/teacher/GameLobby';
import GamePresentation from '../quizshow/teacher/GamePresentation';

// ===============================================
// MAIN QUIZ SHOW TAB COMPONENT WITH QUIZ CREATOR
// ===============================================
const QuizShowTab = ({
  students,
  user,
  showToast,
  userData,
  currentClassId,
  getAvatarImage,
  calculateAvatarLevel,
  onAwardXP,
  onAwardCoins,
  architectureVersion = 'v1',
  currentClassData
}) => {
  // UI State
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // Game State
  const [activeGame, setActiveGame] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [gameRoomData, setGameRoomData] = useState(null);
  
  // Quiz Management State
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  const resolvedArchitecture = architectureVersion || userData?.architectureVersion || 'v1';

  const extractSavedQuizzes = useCallback((classRecord) => {
    if (!classRecord) return [];
    if (Array.isArray(classRecord.savedQuizzes)) {
      return classRecord.savedQuizzes;
    }
    if (Array.isArray(classRecord.quizShow?.quizzes)) {
      return classRecord.quizShow.quizzes;
    }
    return [];
  }, []);

  const fetchClassContext = useCallback(async () => {
    if (!user || !currentClassId) {
      throw new Error('No active class selected');
    }

    if (resolvedArchitecture === 'v2') {
      const classRef = doc(firestore, 'classes', currentClassId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) {
        throw new Error('Class document not found');
      }

      return {
        mode: 'classDocument',
        docRef: classRef,
        classData: classSnap.data()
      };
    }

    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User document not found');
    }

    const snapshotData = userSnap.data();
    const classes = snapshotData.classes || [];
    const classIndex = classes.findIndex(cls => cls.id === currentClassId);

    if (classIndex === -1) {
      throw new Error('Selected class not found for this teacher');
    }

    return {
      mode: 'embeddedClass',
      docRef: userRef,
      userData: snapshotData,
      classIndex,
      classData: classes[classIndex]
    };
  }, [currentClassId, resolvedArchitecture, user]);

  // ===============================================
  // LOAD SAVED QUIZZES FROM FIREBASE
  // ===============================================
  useEffect(() => {
    if (user && currentClassId) {
      loadSavedQuizzes();
    }
  }, [user, currentClassId, resolvedArchitecture, fetchClassContext]);

  useEffect(() => {
    if (!currentClassData) return;

    const freshQuizzes = extractSavedQuizzes(currentClassData);
    const hasDifference =
      freshQuizzes.length !== savedQuizzes.length ||
      freshQuizzes.some((quiz, index) => quiz.id !== savedQuizzes[index]?.id);

    if (hasDifference) {
      setSavedQuizzes(freshQuizzes);
    }
  }, [currentClassData, extractSavedQuizzes, savedQuizzes]);

  const loadSavedQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const context = await fetchClassContext();
      const quizzes = extractSavedQuizzes(context.classData);
      setSavedQuizzes(quizzes);
      console.log(`✅ Loaded ${quizzes.length} saved quizzes`);
    } catch (error) {
      console.error('❌ Error loading quizzes:', error);
      showToast('Error loading saved quizzes', 'error');
    }
    setQuizzesLoading(false);
  };

  // ===============================================
  // QUIZ CRUD OPERATIONS
  // ===============================================
  const saveQuizToFirebase = async (quiz) => {
    if (!user || !currentClassId) {
      showToast('Error: No active class found', 'error');
      return;
    }

    try {
      setLoading(true);

      const context = await fetchClassContext();
      const existingQuizzes = extractSavedQuizzes(context.classData);
      const existingIndex = existingQuizzes.findIndex(q => q.id === quiz.id);
      const isUpdating = existingIndex >= 0;

      let updatedQuizzes;
      if (isUpdating) {
        updatedQuizzes = [...existingQuizzes];
        updatedQuizzes[existingIndex] = quiz;
        console.log(`📝 Updated quiz: ${quiz.title}`);
      } else {
        updatedQuizzes = [...existingQuizzes, quiz];
        console.log(`➕ Added new quiz: ${quiz.title}`);
      }

      if (context.mode === 'classDocument') {
        const updatedQuizShow = {
          ...(context.classData.quizShow || {}),
          quizzes: updatedQuizzes,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid
        };

        await updateDoc(context.docRef, {
          quizShow: updatedQuizShow,
          updatedAt: new Date().toISOString()
        });
      } else {
        const updatedClasses = [...(context.userData.classes || [])];
        updatedClasses[context.classIndex] = {
          ...context.classData,
          savedQuizzes: updatedQuizzes,
          updatedAt: new Date().toISOString()
        };

        await updateDoc(context.docRef, { classes: updatedClasses });
      }

      setSavedQuizzes(updatedQuizzes);

      showToast(isUpdating ? 'Quiz updated successfully!' : 'Quiz saved successfully!', 'success');
      playQuizSound('gameStart');

      setCurrentView('dashboard');
      setEditingQuiz(null);

    } catch (error) {
      console.error('❌ Error saving quiz:', error);
      showToast('Error saving quiz. Please try again.', 'error');
    }
    setLoading(false);
  };

  const deleteQuiz = async (quizId) => {
    if (typeof window !== 'undefined' && !window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      const context = await fetchClassContext();
      const existingQuizzes = extractSavedQuizzes(context.classData);
      const filteredQuizzes = existingQuizzes.filter(q => q.id !== quizId);

      if (context.mode === 'classDocument') {
        await updateDoc(context.docRef, {
          quizShow: {
            ...(context.classData.quizShow || {}),
            quizzes: filteredQuizzes,
            updatedAt: new Date().toISOString(),
            updatedBy: user.uid
          },
          updatedAt: new Date().toISOString()
        });
      } else {
        const updatedClasses = [...(context.userData.classes || [])];
        updatedClasses[context.classIndex] = {
          ...context.classData,
          savedQuizzes: filteredQuizzes,
          updatedAt: new Date().toISOString()
        };

        await updateDoc(context.docRef, { classes: updatedClasses });
      }

      setSavedQuizzes(filteredQuizzes);

      showToast('Quiz deleted successfully!', 'success');
      console.log(`🗑️ Deleted quiz: ${quizId}`);
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      showToast('Error deleting quiz', 'error');
    }
    setLoading(false);
  };

  const duplicateQuiz = async (quiz) => {
    const duplicatedQuiz = {
      ...quiz,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${quiz.title} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await saveQuizToFirebase(duplicatedQuiz);
    showToast('Quiz duplicated successfully!', 'success');
  };

  // ===============================================
  // PRESET QUIZ CREATION
  // ===============================================
  const createPresetQuiz = async (category, questionCount = 5) => {
    try {
      setLoading(true);
      const presetQuiz = createQuizFromPreset(category, questionCount);
      
      // Save preset quiz to user's collection
      await saveQuizToFirebase(presetQuiz);
      
      showToast(`Created ${presetQuiz.title} with ${presetQuiz.questions.length} questions!`, 'success');
    } catch (error) {
      console.error('❌ Error creating preset quiz:', error);
      showToast('Error creating preset quiz', 'error');
    }
    setLoading(false);
  };

  // ===============================================
  // FIREBASE REAL-TIME LISTENERS (GAME)
  // ===============================================
  useEffect(() => {
    if (roomCode) {
      const gameRef = ref(database, `gameRooms/${roomCode}`);
      const unsubscribe = onValue(gameRef, (snapshot) => {
        const data = snapshot.val();
        setGameRoomData(data);
        
        if (!data && activeGame) {
          // Game was ended by host
          setActiveGame(null);
          setRoomCode(null);
          setGameRoomData(null);
          setCurrentView('dashboard');
          showToast('Game ended', 'info');
        }
      });
      
      return () => off(gameRef, 'value', unsubscribe);
    }
  }, [roomCode, activeGame]);

  // ===============================================
  // GAME MANAGEMENT FUNCTIONS
  // ===============================================
  const createGame = async (quiz) => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      showToast('Cannot start game: Quiz has no questions', 'error');
      return;
    }

    setLoading(true);
    try {
      const newRoomCode = generateRoomCode();
      const gameData = {
        hostId: user.uid,
        quizId: quiz.id,
        quiz: quiz,
        status: 'waiting',
        currentQuestion: 0,
        startTime: null,
        questionPhase: 'showing',
        settings: {
          showLeaderboard: true,
          allowLateJoin: false,
          timePerQuestion: quiz.defaultTimeLimit || 20,
          showCorrectAnswers: quiz.settings?.showCorrectAnswers ?? true
        },
        players: {},
        responses: {},
        createdAt: Date.now()
      };
      
      await set(ref(database, `gameRooms/${newRoomCode}`), gameData);
      
      setRoomCode(newRoomCode);
      setActiveGame(gameData);
      setIsHost(true);
      setCurrentView('lobby');
      
      playQuizSound('gameStart');
      showToast(`Game created! Room code: ${newRoomCode}`, 'success');
    } catch (error) {
      console.error('Error creating game:', error);
      showToast('Failed to create game', 'error');
    }
    setLoading(false);
  };

  const startGame = async () => {
    if (!roomCode || !activeGame) return;
    
    setLoading(true);
    try {
      const updates = {
        status: 'playing',
        startTime: Date.now(),
        currentQuestion: 0,
        questionPhase: 'showing'
      };
      
      await update(ref(database, `gameRooms/${roomCode}`), updates);
      setCurrentView('presentation');
      playQuizSound('gameStart');
      showToast('Game started!', 'success');
    } catch (error) {
      console.error('Error starting game:', error);
      showToast('Failed to start game. Please try again.', 'error');
    }
    setLoading(false);
  };

  const endGame = async () => {
    if (!roomCode) return;
    
    try {
      // Calculate final results and award XP/coins
      if (gameRoomData?.players) {
        const finalResults = calculateFinalResults(gameRoomData);
        await awardGameRewards(finalResults);
      }
      
      // Remove game room
      await remove(ref(database, `gameRooms/${roomCode}`));
      
      // Reset state
      setActiveGame(null);
      setRoomCode(null);
      setGameRoomData(null);
      setCurrentView('dashboard');
      
      showToast('Game ended successfully!', 'success');
    } catch (error) {
      console.error('Error ending game:', error);
      showToast('Error ending game', 'error');
    }
  };

  const calculateFinalResults = (gameData) => {
    if (!gameData?.players || !gameData?.responses) return [];
    
    const results = Object.entries(gameData.players).map(([playerId, player]) => {
      let totalScore = 0;
      let correctAnswers = 0;
      
      Object.entries(gameData.responses).forEach(([questionIndex, responses]) => {
        const response = responses[playerId];
        if (response?.isCorrect) {
          correctAnswers++;
          totalScore += response.points || 0;
        }
      });
      
      return {
        playerId,
        ...player,
        totalScore,
        correctAnswers,
        totalQuestions: gameData.quiz?.questions?.length || 0
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
    
    return results;
  };

  const awardGameRewards = async (results) => {
    if (!results.length) return;
    
    try {
      results.forEach((result, index) => {
        const student = students.find(s => s.id === result.studentId);
        if (!student) return;
        
        // Base participation XP
        let xpReward = 10;
        
        // Correct answer bonus
        xpReward += result.correctAnswers * 5;
        
        // Position bonus
        if (index === 0) xpReward += 25; // 1st place
        else if (index === 1) xpReward += 15; // 2nd place  
        else if (index === 2) xpReward += 10; // 3rd place
        
        // Perfect score bonus
        if (result.correctAnswers === result.totalQuestions) {
          xpReward += 50;
        }
        
        // Award XP
        onAwardXP(result.studentId, xpReward, 'Quiz Show participation');
        
        // Award coins based on score
        const coinReward = Math.floor(result.totalScore / 100);
        if (coinReward > 0) {
          onAwardCoins(result.studentId, coinReward, 'Quiz Show performance');
        }
      });
      
      showToast('XP and coins awarded to participants!', 'success');
    } catch (error) {
      console.error('Error awarding game rewards:', error);
    }
  };

  // Handle student join button
  const handleStudentJoin = () => {
    if (typeof window === 'undefined') return;

    if (roomCode) {
      window.open(`/join?code=${roomCode}`, '_blank');
    } else {
      window.open('/join', '_blank');
    }
  };

  // ===============================================
  // VIEW NAVIGATION FUNCTIONS
  // ===============================================
  const handleCreateQuiz = () => {
    setEditingQuiz(null);
    setCurrentView('creator');
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setCurrentView('creator');
  };

  const handleCancelQuizCreation = () => {
    setEditingQuiz(null);
    setCurrentView('dashboard');
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <QuizDashboard
            quizzes={savedQuizzes}
            onCreateQuiz={handleCreateQuiz}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={deleteQuiz}
            onDuplicateQuiz={duplicateQuiz}
            onStartGame={createGame}
            onCreatePreset={createPresetQuiz}
            loading={quizzesLoading || loading}
            QUESTION_CATEGORIES={QUESTION_CATEGORIES}
          />
        );
      
      case 'creator':
        return (
          <QuizCreator
            quiz={editingQuiz}
            onSave={saveQuizToFirebase}
            onCancel={handleCancelQuizCreation}
            loading={loading}
            showToast={showToast}
          />
        );
      
      case 'lobby':
        return (
          <GameLobby
            roomCode={roomCode}
            gameData={gameRoomData}
            onStartGame={startGame}
            onEndGame={endGame}
            loading={loading}
          />
        );
      
      case 'presentation':
        return (
          <GamePresentation
            roomCode={roomCode}
            gameData={gameRoomData}
            onEndGame={endGame}
            onAwardXP={onAwardXP}
            onAwardCoins={onAwardCoins}
            showToast={showToast}
          />
        );
      
      default:
        return <div className="text-center text-white">View not found</div>;
    }
  };

  // ===============================================
  // MAIN RENDER
  // ===============================================
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-purple-600/40 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 h-[28rem] w-[28rem] rounded-full bg-blue-600/30 blur-3xl animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/30 blur-3xl"></div>
      </div>

      {/* Game Show Header */}
      <div className="relative z-10 border-b border-white/10 bg-gradient-to-br from-purple-800/80 via-purple-700/60 to-blue-700/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-purple-400/60 blur-xl"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/70 text-4xl shadow-lg shadow-purple-900/30 ring-2 ring-purple-300/60">
                🎪
              </div>
            </div>
            <div>
              <p className="uppercase tracking-[0.35em] text-xs text-purple-200/80">Educational Elements</p>
              <h1 className="text-4xl md:text-5xl font-black leading-tight bg-gradient-to-r from-white via-purple-100 to-fuchsia-200 bg-clip-text text-transparent">
                Quiz Show Arena
              </h1>
              <p className="mt-3 max-w-xl text-sm md:text-base text-purple-100/80">
                Craft legendary quizzes, launch live shows, and reward your class with an unforgettable game show experience.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-purple-100/70">
                <span className="rounded-full border border-purple-300/40 px-3 py-1">Real-time Multiplayer</span>
                <span className="rounded-full border border-purple-300/40 px-3 py-1">Custom Quiz Builder</span>
                <span className="rounded-full border border-purple-300/40 px-3 py-1">Epic Rewards</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {roomCode && (
              <div className="relative overflow-hidden rounded-2xl border border-yellow-400/60 bg-yellow-300/20 px-5 py-3 text-sm font-bold text-yellow-100 shadow-lg shadow-yellow-500/30">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-transparent to-yellow-500/20 animate-[shine_3s_linear_infinite]"></div>
                <div className="relative flex items-center gap-2">
                  <span className="text-lg">🎟️</span>
                  <div>
                    <span className="block text-[0.65rem] font-semibold tracking-widest uppercase text-yellow-200/80">Room Code</span>
                    <span className="text-xl tabular-nums">{roomCode}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleStudentJoin}
              className="group relative overflow-hidden rounded-2xl bg-white/95 px-5 py-3 font-semibold text-purple-700 shadow-lg shadow-purple-900/40 transition-all hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-lg">📱</span>
                <span>Launch Student View</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-purple-200/40 via-transparent to-purple-200/60 opacity-0 transition-opacity group-hover:opacity-100"></span>
            </button>

            {currentView !== 'dashboard' && (
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setEditingQuiz(null);
                }}
                className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white shadow-inner shadow-purple-900/40 transition hover:bg-white/10"
              >
                ← Back to Command Center
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto p-6 lg:p-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 lg:p-8 shadow-[0_40px_120px_-60px_rgba(124,58,237,0.8)] backdrop-blur-xl">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default QuizShowTab;