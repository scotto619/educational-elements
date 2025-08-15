// components/quizshow/teacher/GamePresentation.js - WITH PRIZE SELECTION AND AWARDING
import React, { useState, useEffect } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound, calculateFinalLeaderboard } from '../../../utils/quizShowHelpers';

const GamePresentation = ({ roomCode, gameData, onEndGame, onAwardXP, onAwardCoins, showToast }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionPhase, setQuestionPhase] = useState('showing'); // 'showing', 'answering', 'results', 'finished'
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  
  // Prize Management State
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeType, setPrizeType] = useState('xp'); // 'xp' or 'coins'
  const [prizeAmount, setPrizeAmount] = useState(10);
  const [prizeRecipients, setPrizeRecipients] = useState('all'); // 'all', 'top3', 'winner', 'custom'
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [isAwarding, setIsAwarding] = useState(false);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  // Sync with Firebase data
  useEffect(() => {
    if (gameData) {
      setCurrentQuestionIndex(gameData.currentQuestion || 0);
      setQuestionPhase(gameData.questionPhase || 'showing');
      
      // Check if game is finished
      if (gameData.status === 'finished' || gameData.questionPhase === 'finished') {
        setShowFinalResults(true);
      }
    }
  }, [gameData]);

  // Timer logic
  useEffect(() => {
    if (questionPhase === 'answering' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto-show results when time runs out
            showResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase]);

  // Update Firebase with new game state
  const updateGameState = async (updates) => {
    if (!roomCode || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await update(ref(database, `gameRooms/${roomCode}`), updates);
      console.log('✅ Game state updated:', updates);
    } catch (error) {
      console.error('❌ Error updating game state:', error);
    }
    setIsUpdating(false);
  };

  const startQuestion = async () => {
    const questionTimeLimit = currentQuestion?.timeLimit || 20;
    setTimeLeft(questionTimeLimit);
    
    const updates = {
      questionPhase: 'answering',
      currentQuestion: currentQuestionIndex
    };
    
    await updateGameState(updates);
    playQuizSound('questionReveal');
  };

  const showResults = async () => {
    const updates = {
      questionPhase: 'results'
    };
    
    await updateGameState(updates);
    playQuizSound('correct');
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      const updates = {
        currentQuestion: nextIndex,
        questionPhase: 'showing'
      };
      
      await updateGameState(updates);
    } else {
      // Game finished - show final leaderboard
      const updates = {
        status: 'finished',
        questionPhase: 'finished'
      };
      
      await updateGameState(updates);
      setShowFinalResults(true);
      playQuizSound('gameEnd');
    }
  };

  // ===============================================
  // PRIZE AWARDING FUNCTIONS
  // ===============================================
  
  const handleAwardPrizes = async () => {
    if (!onAwardXP || !onAwardCoins) {
      showToast('Prize awarding not available', 'error');
      return;
    }

    setIsAwarding(true);
    try {
      const leaderboard = calculateFinalLeaderboard(gameData);
      let recipients = [];

      // Determine recipients based on selection
      switch (prizeRecipients) {
        case 'all':
          recipients = leaderboard.filter(player => player.studentId);
          break;
        case 'winner':
          recipients = leaderboard.slice(0, 1).filter(player => player.studentId);
          break;
        case 'top3':
          recipients = leaderboard.slice(0, 3).filter(player => player.studentId);
          break;
        case 'custom':
          recipients = leaderboard.filter(player => 
            player.studentId && selectedPlayers.has(player.playerId)
          );
          break;
        default:
          recipients = [];
      }

      if (recipients.length === 0) {
        showToast('No valid recipients found', 'error');
        setIsAwarding(false);
        return;
      }

      // Award prizes to recipients
      const awardFunction = prizeType === 'xp' ? onAwardXP : onAwardCoins;
      let successCount = 0;

      for (const recipient of recipients) {
        try {
          await awardFunction(
            recipient.studentId, 
            prizeAmount, 
            `Quiz Show - ${gameData?.quiz?.title || 'Game'}`
          );
          successCount++;
        } catch (error) {
          console.error(`❌ Error awarding ${prizeType} to ${recipient.name}:`, error);
        }
      }

      // Show success message
      const prizeTypeName = prizeType === 'xp' ? 'XP' : 'coins';
      showToast(
        `Successfully awarded ${prizeAmount} ${prizeTypeName} to ${successCount} student${successCount !== 1 ? 's' : ''}!`, 
        'success'
      );
      
      playQuizSound('gameEnd');
      setShowPrizeModal(false);
      
    } catch (error) {
      console.error('❌ Error awarding prizes:', error);
      showToast('Error awarding prizes. Please try again.', 'error');
    }
    setIsAwarding(false);
  };

  const togglePlayerSelection = (playerId) => {
    const newSelection = new Set(selectedPlayers);
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId);
    } else {
      newSelection.add(playerId);
    }
    setSelectedPlayers(newSelection);
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  const getPlayerCount = () => {
    return gameData?.players ? Object.keys(gameData.players).length : 0;
  };

  const getResponseCount = () => {
    const responses = gameData?.responses?.[currentQuestionIndex];
    return responses ? Object.keys(responses).length : 0;
  };

  const renderQuestionDisplay = () => {
    if (!currentQuestion) return null;

    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold text-gray-500">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </div>
            
            {questionPhase === 'answering' && timeLeft > 0 && (
              <div className={`text-4xl font-bold px-6 py-3 rounded-full ${
                timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-green-500 text-white'
              }`}>
                {timeLeft}s
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            {currentQuestion.question}
          </h1>

          {/* Answer Options Display */}
          <div className="grid grid-cols-2 gap-6">
            {currentQuestion.options?.map((option, index) => {
              const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
              const isCorrect = index === currentQuestion.correctAnswer;
              
              return (
                <div
                  key={index}
                  className={`p-6 rounded-xl text-white font-bold text-xl ${
                    questionPhase === 'results' && isCorrect
                      ? 'bg-green-600 ring-4 ring-green-300 scale-105'
                      : colors[index % colors.length]
                  } transition-all duration-300`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-2xl">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-1 text-left">{option}</span>
                    {questionPhase === 'results' && isCorrect && (
                      <div className="text-3xl">✅</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderGameControls = () => {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Game Controls</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Players: <span className="font-bold">{getPlayerCount()}</span>
            </div>
            {questionPhase === 'answering' && (
              <div className="text-sm text-gray-600">
                Responses: <span className="font-bold">{getResponseCount()}/{getPlayerCount()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {questionPhase === 'showing' && (
            <button
              onClick={startQuestion}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>▶️</span>
              <span>Start Question</span>
            </button>
          )}

          {questionPhase === 'answering' && (
            <button
              onClick={showResults}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>📊</span>
              <span>Show Results</span>
            </button>
          )}

          {questionPhase === 'results' && (
            <button
              onClick={nextQuestion}
              className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>⏭️</span>
              <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Game'}</span>
            </button>
          )}

          <button
            onClick={onEndGame}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🛑</span>
            <span>End Game</span>
          </button>
        </div>
      </div>
    );
  };

  const renderPrizeModal = () => {
    if (!showPrizeModal) return null;

    const leaderboard = calculateFinalLeaderboard(gameData);
    const studentsInGame = leaderboard.filter(player => player.studentId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">🏆 Award Prizes</h2>
                <p className="text-yellow-100 mt-1">Reward your students for playing!</p>
              </div>
              <button
                onClick={() => setShowPrizeModal(false)}
                className="text-white hover:text-yellow-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Prize Type Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Prize Type</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPrizeType('xp')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    prizeType === 'xp'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="font-semibold">Experience Points</div>
                  <div className="text-sm text-gray-600">Level up progress</div>
                </button>
                
                <button
                  onClick={() => setPrizeType('coins')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    prizeType === 'coins'
                      ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🪙</div>
                  <div className="font-semibold">Coins</div>
                  <div className="text-sm text-gray-600">Shop currency</div>
                </button>
              </div>
            </div>

            {/* Prize Amount */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Prize Amount</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={prizeAmount}
                  onChange={(e) => setPrizeAmount(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-center font-bold"
                />
                <span className="text-gray-600">
                  {prizeType === 'xp' ? 'XP' : 'coins'} per student
                </span>
              </div>
              
              {/* Quick amount buttons */}
              <div className="flex space-x-2 mt-3">
                {[5, 10, 15, 20, 25].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setPrizeAmount(amount)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Award To</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="recipients"
                    value="all"
                    checked={prizeRecipients === 'all'}
                    onChange={(e) => setPrizeRecipients(e.target.value)}
                    className="text-purple-600"
                  />
                  <span>All participants ({studentsInGame.length} students)</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="recipients"
                    value="winner"
                    checked={prizeRecipients === 'winner'}
                    onChange={(e) => setPrizeRecipients(e.target.value)}
                    className="text-purple-600"
                  />
                  <span>Winner only (1st place)</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="recipients"
                    value="top3"
                    checked={prizeRecipients === 'top3'}
                    onChange={(e) => setPrizeRecipients(e.target.value)}
                    className="text-purple-600"
                  />
                  <span>Top 3 players</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="recipients"
                    value="custom"
                    checked={prizeRecipients === 'custom'}
                    onChange={(e) => setPrizeRecipients(e.target.value)}
                    className="text-purple-600"
                  />
                  <span>Custom selection</span>
                </label>
              </div>

              {/* Custom player selection */}
              {prizeRecipients === 'custom' && (
                <div className="mt-4 max-h-48 overflow-y-auto">
                  <h4 className="font-semibold text-gray-700 mb-2">Select Students:</h4>
                  <div className="space-y-2">
                    {studentsInGame.map((player) => (
                      <label key={player.playerId} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.has(player.playerId)}
                          onChange={() => togglePlayerSelection(player.playerId)}
                          className="text-purple-600"
                        />
                        <img 
                          src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                          alt={player.name}
                          className="w-6 h-6 rounded-full border border-gray-300"
                        />
                        <span>{player.name}</span>
                        <span className="text-sm text-gray-500">
                          ({player.totalScore} points, {player.correctAnswers} correct)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total calculation */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Prize Summary:</h4>
              <div className="text-sm text-gray-600">
                {(() => {
                  let recipientCount = 0;
                  switch (prizeRecipients) {
                    case 'all': recipientCount = studentsInGame.length; break;
                    case 'winner': recipientCount = 1; break;
                    case 'top3': recipientCount = Math.min(3, studentsInGame.length); break;
                    case 'custom': recipientCount = selectedPlayers.size; break;
                  }
                  const totalPrize = recipientCount * prizeAmount;
                  return (
                    <div>
                      <p>{recipientCount} student{recipientCount !== 1 ? 's' : ''} × {prizeAmount} {prizeType === 'xp' ? 'XP' : 'coins'} = <strong>{totalPrize} total {prizeType === 'xp' ? 'XP' : 'coins'}</strong></p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPrizeModal(false)}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAwardPrizes}
                disabled={isAwarding || (prizeRecipients === 'custom' && selectedPlayers.size === 0)}
                className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAwarding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Awarding...</span>
                  </>
                ) : (
                  <>
                    <span>🎁</span>
                    <span>Award Prizes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show final leaderboard if game is finished
  if (showFinalResults) {
    const leaderboard = calculateFinalLeaderboard(gameData);
    
    return (
      <div className="space-y-8">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-4xl font-bold text-white mb-4">Game Complete!</h1>
          <p className="text-xl text-purple-100">Great job everyone!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Final Leaderboard</h2>
          
          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <div
                key={player.playerId}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-400' :
                  index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                  index === 2 ? 'bg-orange-100 border-2 border-orange-400' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-500' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <img 
                    src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} 
                    alt={player.name}
                    className="w-8 h-8 rounded-full border border-gray-300"
                  />
                  <span className="font-semibold">{player.name}</span>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">{player.totalScore} points</div>
                  <div className="text-sm text-gray-600">
                    {player.correctAnswers}/{player.totalQuestions} correct ({player.accuracy}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setShowPrizeModal(true)}
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center space-x-2"
            >
              <span>🏆</span>
              <span>Award Prizes</span>
            </button>
            
            <button
              onClick={onEndGame}
              className="bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {renderPrizeModal()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderQuestionDisplay()}
      {renderGameControls()}
      {renderPrizeModal()}
    </div>
  );
};

export default GamePresentation;