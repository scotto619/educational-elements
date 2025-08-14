// components/tabs/QuizShowTab.js - UPDATED TO FIX GAME START ERROR
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { database } from '../../utils/firebase';
import { ref, onValue, push, set, remove, update, off } from 'firebase/database';
import { generateRoomCode, calculateQuizScore, playQuizSound } from '../../utils/quizShowHelpers';

// Import components
import QuizDashboard from '../quizshow/teacher/QuizDashboard';
import GameLobby from '../quizshow/teacher/GameLobby';
import GamePresentation from '../quizshow/teacher/GamePresentation';

// Import student components
import JoinGame from '../quizshow/student/JoinGame';
import StudentLobby from '../quizshow/student/StudentLobby';

// ===============================================
// MAIN QUIZ SHOW TAB COMPONENT
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
  
  // Student Mode State
  const [studentMode, setStudentMode] = useState(false);
  const [joinedAsStudent, setJoinedAsStudent] = useState(null);

  // ===============================================
  // FIREBASE REAL-TIME LISTENERS
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
          showToast('Game ended by host', 'info');
        }
      });
      
      return () => off(gameRef, 'value', unsubscribe);
    }
  }, [roomCode, activeGame]);

  // ===============================================
  // GAME MANAGEMENT FUNCTIONS
  // ===============================================
  const createGame = async (quiz) => {
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
        settings: {
          showLeaderboard: true,
          allowLateJoin: false,
          timePerQuestion: quiz.defaultTimeLimit || 20,
          showCorrectAnswers: true
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
      setStudentMode(false);
      setJoinedAsStudent(null);
      
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
    } catch (error) {
      console.error('Error awarding game rewards:', error);
    }
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================
  const renderTeacherView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <QuizDashboard
            quizzes={[]}
            onCreateQuiz={() => showToast('Quiz Creator coming soon!', 'info')}
            onEditQuiz={() => showToast('Edit Quiz coming soon!', 'info')}
            onStartGame={createGame}
            onViewLibrary={() => showToast('Quiz Library coming soon!', 'info')}
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
          />
        );
      
      default:
        return <div>View not found</div>;
    }
  };

  const renderStudentView = () => {
    switch (currentView) {
      case 'join':
        return (
          <JoinGame
            students={students}
            onJoinGame={() => showToast('Student join coming soon!', 'info')}
            onCancel={() => {
              setStudentMode(false);
              setCurrentView('dashboard');
            }}
            getAvatarImage={getAvatarImage}
            calculateAvatarLevel={calculateAvatarLevel}
            loading={loading}
          />
        );
      
      default:
        return renderTeacherView();
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
            {!studentMode && (
              <button
                onClick={() => {
                  setStudentMode(true);
                  setCurrentView('join');
                }}
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Join as Student
              </button>
            )}
            
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
        {studentMode ? renderStudentView() : renderTeacherView()}
      </div>
    </div>
  );
};

export default QuizShowTab;