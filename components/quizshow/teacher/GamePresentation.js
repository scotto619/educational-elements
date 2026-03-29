// components/quizshow/teacher/GamePresentation.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import { playQuizSound, calculateFinalLeaderboard } from '../../../utils/quizShowHelpers';

const ANSWER_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
const ANSWER_SHAPES = ['▲', '◆', '●', '■'];

const GamePresentation = ({ roomCode, gameData, onEndGame, onAwardXP, onAwardCoins, showToast }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionPhase, setQuestionPhase] = useState('showing');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [countdown, setCountdown] = useState(null); // 3-2-1 before answering
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeType, setPrizeType] = useState('xp');
  const [prizeAmount, setPrizeAmount] = useState(10);
  const [prizeRecipients, setPrizeRecipients] = useState('all');
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [isAwarding, setIsAwarding] = useState(false);

  const updatingRef = useRef(false);
  const autoAdvancedRef = useRef(false); // prevent double auto-advance to results

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;

  // ─── Sync local state from Firebase ─────────────────────────────────────
  useEffect(() => {
    if (!gameData) return;
    const idx = gameData.currentQuestion ?? 0;
    setCurrentQuestionIndex(idx);
    setQuestionPhase(gameData.questionPhase || 'showing');

    if (gameData.status === 'finished' || gameData.questionPhase === 'finished') {
      setShowFinalResults(true);
    }
    if (gameData.questionPhase === 'showing') {
      const q = gameData.quiz?.questions?.[idx];
      setTimeLeft(q?.timeLimit || gameData.settings?.timePerQuestion || 20);
      autoAdvancedRef.current = false;
    }
    if (gameData.questionPhase === 'answering') {
      autoAdvancedRef.current = false;
    }
  }, [gameData]);

  // ─── Update Firebase helper ──────────────────────────────────────────────
  const updateGameState = useCallback(async (updates) => {
    if (!roomCode || updatingRef.current) return;
    updatingRef.current = true;
    setIsUpdating(true);
    try {
      await update(ref(database, `gameRooms/${roomCode}`), updates);
    } catch (err) {
      console.error('Game state update failed:', err);
    }
    updatingRef.current = false;
    setIsUpdating(false);
  }, [roomCode]);

  // ─── 3-2-1 countdown then auto-start answering ───────────────────────────
  useEffect(() => {
    if (questionPhase !== 'showing') { setCountdown(null); return; }
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 1000);
    const t2 = setTimeout(() => setCountdown(1), 2000);
    const t3 = setTimeout(async () => {
      setCountdown(null);
      const questionTimeLimit = currentQuestion?.timeLimit || gameData?.settings?.timePerQuestion || 20;
      setTimeLeft(questionTimeLimit);
      await updateGameState({
        status: 'playing',
        questionPhase: 'answering',
        currentQuestion: currentQuestionIndex,
      });
      playQuizSound('questionReveal');
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [questionPhase, currentQuestionIndex]);

  // ─── Teacher-side countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (questionPhase !== 'answering' || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { showResults(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, questionPhase]);

  // ─── Auto-advance to results when ALL players answered ───────────────────
  useEffect(() => {
    if (questionPhase !== 'answering' || autoAdvancedRef.current) return;
    if (!gameData?.players || !gameData?.responses) return;

    const playerIds = Object.keys(gameData.players);
    if (playerIds.length === 0) return;

    const responses = gameData.responses?.[currentQuestionIndex] || {};
    const answeredCount = Object.keys(responses).length;

    if (answeredCount >= playerIds.length) {
      autoAdvancedRef.current = true;
      // Small delay so the last student sees their selection register
      setTimeout(() => showResults(), 600);
    }
  }, [gameData?.responses, gameData?.players, questionPhase, currentQuestionIndex]);

  const showResults = useCallback(async () => {
    await updateGameState({ questionPhase: 'results' });
    playQuizSound('correct');
  }, [updateGameState]);

  const nextQuestion = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      const nextIdx = currentQuestionIndex + 1;
      await updateGameState({ currentQuestion: nextIdx, questionPhase: 'showing' });
    } else {
      await updateGameState({ status: 'finished', questionPhase: 'finished' });
      setShowFinalResults(true);
      playQuizSound('gameEnd');
    }
  };

  // ─── Prize helpers ───────────────────────────────────────────────────────
  const handleAwardPrizes = async () => {
    if (!onAwardXP || !onAwardCoins) { showToast?.('Prize awarding not available', 'error'); return; }
    setIsAwarding(true);
    try {
      const leaderboard = calculateFinalLeaderboard(gameData);
      let recipients = [];
      switch (prizeRecipients) {
        case 'all':    recipients = leaderboard.filter(p => p.studentId); break;
        case 'winner': recipients = leaderboard.slice(0, 1).filter(p => p.studentId); break;
        case 'top3':   recipients = leaderboard.slice(0, 3).filter(p => p.studentId); break;
        case 'custom': recipients = leaderboard.filter(p => p.studentId && selectedPlayers.has(p.playerId)); break;
      }
      if (recipients.length === 0) { showToast?.('No valid recipients found', 'error'); setIsAwarding(false); return; }
      const awardFn = prizeType === 'xp' ? onAwardXP : onAwardCoins;
      let count = 0;
      for (const r of recipients) {
        try { await awardFn(r.studentId, prizeAmount, `Quiz Show — ${gameData?.quiz?.title || 'Game'}`); count++; }
        catch {}
      }
      showToast?.(`Awarded ${prizeAmount} ${prizeType === 'xp' ? 'XP' : 'coins'} to ${count} student${count !== 1 ? 's' : ''}!`, 'success');
      setShowPrizeModal(false);
    } catch { showToast?.('Error awarding prizes.', 'error'); }
    setIsAwarding(false);
  };

  const togglePlayer = (id) => {
    const s = new Set(selectedPlayers);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedPlayers(s);
  };

  const getPlayerCount = () => Object.keys(gameData?.players || {}).length;
  const getResponseCount = () => Object.keys(gameData?.responses?.[currentQuestionIndex] || {}).length;

  // ─── FINISHED screen ─────────────────────────────────────────────────────
  if (showFinalResults) {
    const leaderboard = calculateFinalLeaderboard(gameData);
    const medals = ['🥇', '🥈', '🥉'];
    const podiumColors = ['bg-yellow-50 border-yellow-300', 'bg-gray-50 border-gray-300', 'bg-orange-50 border-orange-300'];

    return (
      <div className="space-y-6">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-pink-600 p-10 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_70%)]" />
          <div className="relative">
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-5xl font-black mb-2">Game Complete!</h1>
            <p className="text-yellow-100 text-lg">{gameData?.quiz?.title}</p>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Final Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.map((player, i) => (
              <div key={player.playerId}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${podiumColors[i] || 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xl ${
                  i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {i < 3 ? medals[i] : i + 1}
                </div>
                <img src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={player.name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{player.name}</p>
                  <p className="text-sm text-gray-500">{player.correctAnswers}/{player.totalQuestions} correct</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-purple-600">{player.totalScore?.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => setShowPrizeModal(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
            🏆 Award Prizes
          </button>
          <button onClick={onEndGame}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2">
            ✨ Back to Dashboard
          </button>
        </div>

        {showPrizeModal && renderPrizeModal(leaderboard)}
      </div>
    );
  }

  // ─── ACTIVE GAME screen ──────────────────────────────────────────────────
  const responseCount = getResponseCount();
  const playerCount = getPlayerCount();
  const allAnswered = playerCount > 0 && responseCount >= playerCount;
  const timeLimit = currentQuestion?.timeLimit || gameData?.settings?.timePerQuestion || 20;
  const timeProgress = timeLeft / timeLimit;

  return (
    <div className="space-y-6">

      {/* ── Question card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative p-8">
          {/* Meta row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase">
                Q {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              {/* Response count badge */}
              {questionPhase === 'answering' && (
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${allAnswered ? 'bg-green-400 text-green-900' : 'bg-white/20'}`}>
                  {responseCount}/{playerCount} answered
                </span>
              )}
            </div>

            {/* Countdown / Timer */}
            {questionPhase === 'showing' && countdown !== null && (
              <div className="text-7xl font-black animate-bounce text-yellow-300">{countdown}</div>
            )}
            {questionPhase === 'answering' && (
              <div className={`text-5xl font-black ${timeLeft <= 5 ? 'text-red-300 animate-pulse' : timeLeft <= 10 ? 'text-yellow-300' : 'text-white'}`}>
                {timeLeft}s
              </div>
            )}
          </div>

          {/* Timer bar */}
          {questionPhase === 'answering' && (
            <div className="h-2 bg-white/20 rounded-full mb-6 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                timeLeft <= 5 ? 'bg-red-400' : timeLeft <= 10 ? 'bg-yellow-400' : 'bg-green-400'
              }`} style={{ width: `${Math.max(0, timeProgress * 100)}%` }} />
            </div>
          )}

          {/* Question text */}
          <h1 className="text-3xl md:text-4xl font-black text-center leading-snug">
            {currentQuestion?.question}
          </h1>

          {questionPhase === 'showing' && (
            <p className="text-center text-purple-200 mt-4 text-lg">Starting in {countdown}…</p>
          )}
        </div>
      </div>

      {/* ── Answer grid ── */}
      <div className="grid grid-cols-2 gap-4">
        {currentQuestion?.options?.map((option, i) => {
          const isCorrect = i === parseInt(currentQuestion.correctAnswer, 10);
          let cls = `relative p-5 rounded-2xl text-white font-bold text-lg flex items-center gap-4 shadow-lg transition-all duration-300 ${ANSWER_COLORS[i % 4]}`;
          if (questionPhase === 'results' && isCorrect) cls += ' ring-4 ring-white scale-[1.02] shadow-2xl';
          if (questionPhase === 'results' && !isCorrect) cls += ' opacity-50';
          return (
            <div key={i} className={cls}>
              <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center text-2xl font-black shrink-0">
                {ANSWER_SHAPES[i % 4]}
              </div>
              <span className="flex-1">{option}</span>
              {questionPhase === 'results' && isCorrect && <span className="text-3xl">✅</span>}
            </div>
          );
        })}
      </div>

      {/* ── Control bar ── */}
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>👥 <strong className="text-gray-800">{playerCount}</strong> players</span>
            {questionPhase === 'answering' && (
              <span>✅ <strong className="text-gray-800">{responseCount}</strong> answered</span>
            )}
          </div>

          <div className="flex gap-3">
            {questionPhase === 'results' && (
              <button onClick={nextQuestion} disabled={isUpdating}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2">
                {currentQuestionIndex < totalQuestions - 1 ? '⏭ Next Question' : '🏁 Finish Game'}
              </button>
            )}
            {questionPhase === 'answering' && (
              <button onClick={showResults} disabled={isUpdating}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2">
                📊 Show Results Now
              </button>
            )}
            <button onClick={onEndGame}
              className="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors flex items-center gap-2">
              🛑 End
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  function renderPrizeModal(leaderboard) {
    const studentsInGame = leaderboard.filter(p => p.studentId);
    let recipientCount = 0;
    switch (prizeRecipients) {
      case 'all':    recipientCount = studentsInGame.length; break;
      case 'winner': recipientCount = 1; break;
      case 'top3':   recipientCount = Math.min(3, studentsInGame.length); break;
      case 'custom': recipientCount = selectedPlayers.size; break;
    }

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-t-3xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">🏆 Award Prizes</h2>
              <p className="text-yellow-100 text-sm mt-1">Reward your students for playing!</p>
            </div>
            <button onClick={() => setShowPrizeModal(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-xl font-bold">×</button>
          </div>

          <div className="p-6 space-y-5">
            {/* Type */}
            <div>
              <p className="font-bold text-gray-700 mb-3">Prize Type</p>
              <div className="grid grid-cols-2 gap-3">
                {[['xp', '⭐', 'XP', 'Level up progress'], ['coins', '🪙', 'Coins', 'Shop currency']].map(([val, icon, label, sub]) => (
                  <button key={val} onClick={() => setPrizeType(val)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${prizeType === val ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                    <div className="text-2xl mb-1">{icon}</div>
                    <p className="font-bold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="font-bold text-gray-700 mb-3">Amount per student</p>
              <div className="flex items-center gap-3">
                <input type="number" min="1" max="500" value={prizeAmount}
                  onChange={e => setPrizeAmount(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 border-2 border-gray-300 rounded-xl text-center font-bold focus:border-purple-500 focus:outline-none" />
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 25, 50].map(n => (
                    <button key={n} onClick={() => setPrizeAmount(n)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-purple-100 rounded-lg text-sm font-semibold transition-colors">{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <p className="font-bold text-gray-700 mb-3">Award to</p>
              <div className="space-y-2">
                {[['all', `Everyone (${studentsInGame.length} students)`], ['winner', 'Winner only'], ['top3', 'Top 3'], ['custom', 'Custom selection']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="recipients" value={val} checked={prizeRecipients === val} onChange={() => setPrizeRecipients(val)} className="accent-purple-600" />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              {prizeRecipients === 'custom' && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-3">
                  {studentsInGame.map(p => (
                    <label key={p.playerId} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={selectedPlayers.has(p.playerId)} onChange={() => togglePlayer(p.playerId)} className="accent-purple-600" />
                      <img src={p.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={p.name} className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-gray-700">{p.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{p.totalScore} pts</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-purple-50 rounded-2xl p-4 text-sm text-gray-700">
              Awarding <strong>{prizeAmount} {prizeType === 'xp' ? 'XP' : 'coins'}</strong> to <strong>{recipientCount} student{recipientCount !== 1 ? 's' : ''}</strong> = <strong>{recipientCount * prizeAmount} total</strong>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPrizeModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleAwardPrizes} disabled={isAwarding || (prizeRecipients === 'custom' && selectedPlayers.size === 0)}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isAwarding ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Awarding…</> : '🎁 Award Prizes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default GamePresentation;
