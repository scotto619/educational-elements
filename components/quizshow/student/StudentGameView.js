// components/quizshow/student/StudentGameView.js
import React, { useState, useEffect, useRef } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound, calculateQuizScore } from '../../../utils/quizShowHelpers';

const ANSWER_COLORS = [
  { bg: 'bg-red-500',    hover: 'hover:bg-red-600',    ring: 'ring-red-300',    shape: '▲', label: 'A' },
  { bg: 'bg-blue-500',   hover: 'hover:bg-blue-600',   ring: 'ring-blue-300',   shape: '◆', label: 'B' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', ring: 'ring-yellow-300', shape: '●', label: 'C' },
  { bg: 'bg-green-500',  hover: 'hover:bg-green-600',  ring: 'ring-green-300',  shape: '■', label: 'D' },
];


const StudentGameView = ({ roomCode, gameData, playerInfo }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionPhase, setQuestionPhase] = useState('waiting');
  const [score, setScore] = useState(0);
  const [lastPoints, setLastPoints] = useState(null);
  const [showPointsAnim, setShowPointsAnim] = useState(false);

  const answerSubmittedRef = useRef(false);
  const timerRunningRef = useRef(false);
  const currentQuestionRef = useRef(-1);
  const currentPhaseRef = useRef('waiting');
  const answeringStartTimeRef = useRef(null);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  useEffect(() => {
    if (!gameData) return;

    if (gameData.currentQuestion !== undefined && gameData.currentQuestion !== currentQuestionRef.current) {
      currentQuestionRef.current = gameData.currentQuestion;
      setCurrentQuestionIndex(gameData.currentQuestion);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setLastPoints(null);
      answerSubmittedRef.current = false;
      timerRunningRef.current = false;
      setTimeLeft(0);
    }

    if (gameData.questionPhase && gameData.questionPhase !== currentPhaseRef.current) {
      currentPhaseRef.current = gameData.questionPhase;
      setQuestionPhase(gameData.questionPhase);

      if (gameData.questionPhase === 'answering' && !timerRunningRef.current) {
        const timeLimit = currentQuestion?.timeLimit || gameData?.settings?.timePerQuestion || 20;
        setTimeLeft(timeLimit);
        timerRunningRef.current = true;
        answeringStartTimeRef.current = Date.now();
      }
    }

    if (gameData.questionPhase === 'results' && gameData.responses && playerInfo?.playerId) {
      updateScoreFromFirebase(gameData);
    }
  }, [gameData, currentQuestion]);

  useEffect(() => {
    if (timeLeft > 0 && timerRunningRef.current && questionPhase === 'answering') {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          if (next <= 0) { timerRunningRef.current = false; return 0; }
          return next;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, questionPhase]);

  const updateScoreFromFirebase = (data) => {
    let totalScore = 0;
    let latestPoints = null;
    const qIdx = data.currentQuestion ?? currentQuestionIndex;
    Object.entries(data.responses || {}).forEach(([qKey, questionResponses]) => {
      const playerResponse = questionResponses[playerInfo.playerId];
      if (playerResponse?.points !== undefined) {
        totalScore += playerResponse.points;
        if (parseInt(qKey) === qIdx) latestPoints = playerResponse.points;
      }
    });
    setScore(totalScore);
    if (latestPoints !== null) {
      setLastPoints(latestPoints);
      setShowPointsAnim(true);
      setTimeout(() => setShowPointsAnim(false), 2500);
    }
  };

  const submitAnswer = async (answerIndex) => {
    if (answerSubmittedRef.current || hasAnswered || questionPhase !== 'answering') return;

    answerSubmittedRef.current = true;
    setHasAnswered(true);
    setSelectedAnswer(answerIndex);

    if (!currentQuestion?.options) return;

    const correctAnswerIndex = parseInt(currentQuestion.correctAnswer, 10);
    const submittedAnswerIndex = parseInt(answerIndex, 10);
    const isCorrect = submittedAnswerIndex === correctAnswerIndex;

    const timeLimit = currentQuestion?.timeLimit || 20;
    const timeSpent = answeringStartTimeRef.current
      ? Math.min(timeLimit, (Date.now() - answeringStartTimeRef.current) / 1000)
      : timeLimit;
    const basePoints = currentQuestion?.points || 1000;
    const points = calculateQuizScore(timeSpent, timeLimit, basePoints, isCorrect);

    playQuizSound('answerSubmit');

    try {
      await set(ref(database, `gameRooms/${roomCode}/responses/${currentQuestionIndex}/${playerInfo.playerId}`), {
        answer: submittedAnswerIndex,
        timeSpent: Math.round(timeSpent * 10) / 10,
        isCorrect,
        points,
        submittedAt: Date.now()
      });
    } catch (error) {
      answerSubmittedRef.current = false;
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  const getTimeProgress = () => {
    const timeLimit = currentQuestion?.timeLimit || gameData?.settings?.timePerQuestion || 20;
    return timeLeft / timeLimit;
  };

  // ── WAITING / SHOWING screen ──────────────────────────────────────────────
  if (questionPhase === 'waiting' || questionPhase === 'showing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🎯</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Get Ready!</h1>
          <p className="text-xl text-purple-200 mb-2">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <p className="text-purple-300 text-lg">Question starting soon…</p>

          {/* Player info pill */}
          <div className="mt-10 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <img
              src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-white/40"
            />
            <span className="text-white font-bold">{playerInfo?.name}</span>
            <span className="bg-yellow-400 text-yellow-900 text-sm font-black px-3 py-1 rounded-full">
              {score} pts
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── FINISHED screen ───────────────────────────────────────────────────────
  if (questionPhase === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl font-black text-white mb-4">Game Over!</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl px-10 py-6 border border-white/20 mb-6">
            <p className="text-yellow-300 text-lg font-semibold mb-1">Your Final Score</p>
            <p className="text-6xl font-black text-white">{score.toLocaleString()}</p>
            <p className="text-yellow-200 mt-2">points</p>
          </div>
          <p className="text-orange-200 text-lg">Thanks for playing! Check the leaderboard 🎉</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading question…</p>
        </div>
      </div>
    );
  }

  const timeProgress = getTimeProgress();
  const timerColor = timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-yellow-400' : 'text-white';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col">

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Player */}
          <div className="flex items-center gap-3">
            <img
              src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'}
              alt="avatar"
              className="w-9 h-9 rounded-full border-2 border-purple-400"
            />
            <div>
              <p className="text-white font-bold text-sm leading-none">{playerInfo?.name}</p>
              <p className="text-purple-300 text-xs">{score.toLocaleString()} pts</p>
            </div>
          </div>

          {/* Question counter */}
          <div className="text-center">
            <p className="text-purple-300 text-xs uppercase tracking-widest">Question</p>
            <p className="text-white font-black text-lg leading-none">{currentQuestionIndex + 1}<span className="text-purple-400 font-normal text-sm">/{totalQuestions}</span></p>
          </div>

          {/* Timer */}
          <div className="text-right">
            {questionPhase === 'answering' && timerRunningRef.current ? (
              <div className={`font-black text-3xl leading-none ${timerColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
                {timeLeft}
                <span className="text-sm font-normal text-purple-400 ml-1">s</span>
              </div>
            ) : (
              <div className="w-14 h-8" />
            )}
          </div>
        </div>

        {/* Timer bar */}
        {questionPhase === 'answering' && (
          <div className="h-1.5 bg-white/10">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-400'
              }`}
              style={{ width: `${Math.max(0, timeProgress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-6">

        {/* Question card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-2xl">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest text-center mb-3">
            {gameData?.quiz?.title || 'Quiz Show'}
          </p>
          <h1 className="text-white font-black text-2xl md:text-3xl text-center leading-snug">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options?.map((option, index) => {
            const color = ANSWER_COLORS[index % ANSWER_COLORS.length];
            const isSelected = selectedAnswer === index;
            const correctIdx = parseInt(currentQuestion.correctAnswer, 10);
            const isCorrect = index === correctIdx;

            let btnClass = `relative w-full rounded-2xl p-4 font-bold text-white text-lg transition-all duration-200 flex items-center gap-4 shadow-lg `;

            if (questionPhase === 'answering') {
              if (hasAnswered) {
                if (isSelected) {
                  btnClass += `${color.bg} ring-4 ${color.ring} scale-[1.02] shadow-2xl opacity-100`;
                } else {
                  btnClass += `bg-white/10 opacity-40 cursor-not-allowed`;
                }
              } else {
                btnClass += `${color.bg} ${color.hover} hover:scale-[1.02] cursor-pointer active:scale-95`;
              }
            } else if (questionPhase === 'results') {
              if (isCorrect) {
                btnClass += 'bg-green-500 ring-4 ring-green-300 scale-[1.02]';
              } else if (isSelected && !isCorrect) {
                btnClass += 'bg-red-500 ring-4 ring-red-300 opacity-80';
              } else {
                btnClass += 'bg-white/10 opacity-30';
              }
            } else {
              btnClass += 'bg-white/10 opacity-40 cursor-not-allowed';
            }

            return (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={hasAnswered || questionPhase !== 'answering' || timeLeft <= 0}
                className={btnClass}
              >
                {/* Shape icon */}
                <div className={`w-11 h-11 rounded-xl bg-black/20 flex items-center justify-center text-xl font-black shrink-0`}>
                  {color.shape}
                </div>
                <span className="flex-1 text-left leading-snug">{option}</span>

                {/* Selected tick */}
                {isSelected && questionPhase === 'answering' && (
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">✓</div>
                )}

                {/* Results icons */}
                {questionPhase === 'results' && isCorrect && (
                  <div className="text-2xl shrink-0">✅</div>
                )}
                {questionPhase === 'results' && isSelected && !isCorrect && (
                  <div className="text-2xl shrink-0">❌</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Status strip */}
        {questionPhase === 'answering' && !hasAnswered && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-4 px-6 text-center border border-white/20">
            <p className="text-white font-bold text-lg">⏰ Choose your answer!</p>
            <p className="text-purple-300 text-sm mt-1">Faster answers earn more points</p>
          </div>
        )}

        {questionPhase === 'answering' && hasAnswered && (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl py-4 px-6 text-center border border-green-400/40">
            <p className="text-green-300 font-bold text-lg">✅ Answer locked in!</p>
            <p className="text-green-200 text-sm mt-1">Waiting for other players…</p>
          </div>
        )}

        {questionPhase === 'results' && (
          <div className={`rounded-2xl py-5 px-6 text-center border backdrop-blur-sm ${
            selectedAnswer === null
              ? 'bg-gray-500/20 border-gray-400/40'
              : parseInt(selectedAnswer, 10) === parseInt(currentQuestion.correctAnswer, 10)
              ? 'bg-green-500/20 border-green-400/40'
              : 'bg-red-500/20 border-red-400/40'
          }`}>
            {selectedAnswer === null ? (
              <p className="text-gray-300 font-bold text-xl">⏱️ Time's up!</p>
            ) : parseInt(selectedAnswer, 10) === parseInt(currentQuestion.correctAnswer, 10) ? (
              <>
                <p className="text-green-300 font-black text-2xl">🎉 Correct!</p>
                {showPointsAnim && lastPoints !== null && (
                  <p className="text-yellow-300 font-black text-3xl mt-1 animate-bounce">+{lastPoints.toLocaleString()} pts</p>
                )}
              </>
            ) : (
              <>
                <p className="text-red-300 font-black text-2xl">❌ Incorrect</p>
                <p className="text-white/70 text-sm mt-1">
                  Correct answer: <strong className="text-white">{currentQuestion.options[parseInt(currentQuestion.correctAnswer, 10)]}</strong>
                </p>
              </>
            )}

            <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 inline-block">
              <p className="text-white font-bold">Total: {score.toLocaleString()} pts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGameView;
