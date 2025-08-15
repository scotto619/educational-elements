// components/tabs/QuizShowTab.js - COMPLETE QUIZ CREATOR INTEGRATION
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { database } from '../../utils/firebase';
import { ref, onValue, push, set, remove, update, off } from 'firebase/database';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../utils/firebase';
import { generateRoomCode, calculateQuizScore, playQuizSound, createQuizFromPreset, QUESTION_CATEGORIES } from '../../utils/quizShowHelpers';

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
  onAwardCoins 
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

  // ===============================================
  // LOAD SAVED QUIZZES FROM FIREBASE
  // ===============================================
  useEffect(() => {
    if (user && currentClassId) {
      loadSavedQuizzes();
    }
  }, [user, currentClassId]);

  const loadSavedQuizzes = async () => {
    setQuizzesLoading(true);
    try {
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const currentClass = userData.classes?.find(cls => cls.id === currentClassId);
        const quizzes = currentClass?.savedQuizzes || [];
        setSavedQuizzes(quizzes);
        console.log(`✅ Loaded ${quizzes.length} saved quizzes`);
      }
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
      
      // Get current user data
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('User document not found');
      }

      const userData = docSnap.data();
      const updatedClasses = userData.classes.map(cls => {
        if (cls.id === currentClassId) {
          const existingQuizzes = cls.savedQuizzes || [];
          
          // Check if updating existing quiz or creating new one
          const existingIndex = existingQuizzes.findIndex(q => q.id === quiz.id);
          
          let updatedQuizzes;
          if (existingIndex >= 0) {
            // Update existing quiz
            updatedQuizzes = [...existingQuizzes];
            updatedQuizzes[existingIndex] = quiz;
            console.log(`📝 Updated quiz: ${quiz.title}`);
          } else {
            // Add new quiz
            updatedQuizzes = [...existingQuizzes, quiz];
            console.log(`➕ Added new quiz: ${quiz.title}`);
          }
          
          return { ...cls, savedQuizzes: updatedQuizzes };
        }
        return cls;
      });

      // Save to Firebase
      await updateDoc(docRef, { classes: updatedClasses });
      
      // Update local state
      const currentClass = updatedClasses.find(cls => cls.id === currentClassId);
      setSavedQuizzes(currentClass.savedQuizzes || []);
      
      showToast(existingIndex >= 0 ? 'Quiz updated successfully!' : 'Quiz saved successfully!', 'success');
      playQuizSound('gameStart');
      
      // Return to dashboard
      setCurrentView('dashboard');
      setEditingQuiz(null);
      
    } catch (error) {
      console.error('❌ Error saving quiz:', error);
      showToast('Error saving quiz. Please try again.', 'error');
    }
    setLoading(false);
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      const docRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const updatedClasses = userData.classes.map(cls => {
          if (cls.id === currentClassId) {
            const updatedQuizzes = (cls.savedQuizzes || []).filter(q => q.id !== quizId);
            return { ...cls, savedQuizzes: updatedQuizzes };
          }
          return cls;
        });

        await updateDoc(docRef, { classes: updatedClasses });
        
        // Update local state
        setSavedQuizzes(prev => prev.filter(q => q.id !== quizId));
        
        showToast('Quiz deleted successfully!', 'success');
        console.log(`🗑️ Deleted quiz: ${quizId}`);
      }
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
    if (roomCode) {
      // Open join page with room code pre-filled
      window.open(`/join?code=${roomCode}`, '_blank');
    } else {
      // Open join page without room code
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Game Show Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🎪</div>
            <div>
              <h1 className="text-3xl font-bold">Quiz Show</h1>
              <p className="text-purple-100">Educational Elements Game Show</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Back to Dashboard Button (only show when not on dashboard) */}
            {currentView !== 'dashboard' && (
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  setEditingQuiz(null);
                }}
                className="bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-800 transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            )}
            
            <button
              onClick={handleStudentJoin}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center space-x-2"
            >
              <span>📱</span>
              <span>Join as Student</span>
            </button>
            
            {roomCode && (
              <div className="bg-yellow-400 text-purple-900 px-4 py-2 rounded-lg font-bold">
                Room: {roomCode}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {renderView()}
      </div>
    </div>
  );
};

export default QuizShowTab;