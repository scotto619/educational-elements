// components/quizshow/teacher/GamePresentation.js — LIVE GAME STAGE
// Drives all four game modes, dramatic reveals, the between-round Tap Frenzy
// minigame, live emoji reactions, and the final podium ceremony.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import {
  playQuizSound,
  calculateFinalLeaderboard,
  calculateTeamLeaderboard,
  triggerConfetti,
  GAME_MODES,
} from '../../../utils/quizShowHelpers';
import { ReactionOverlay } from '../shared/Reactions';

const ANSWER_STYLES = [
  { bg: 'bg-rose-500',    bar: 'bg-rose-400',    shape: '▲' },
  { bg: 'bg-blue-500',    bar: 'bg-blue-400',    shape: '◆' },
  { bg: 'bg-amber-500',   bar: 'bg-amber-400',   shape: '●' },
  { bg: 'bg-emerald-500', bar: 'bg-emerald-400', shape: '■' },
  { bg: 'bg-violet-500',  bar: 'bg-violet-400',  shape: '★' },
  { bg: 'bg-cyan-500',    bar: 'bg-cyan-400',    shape: '⬟' },
];

const MINIGAME_DURATION = 12000;
const MINIGAME_PRIZES = [300, 200, 100];

const GamePresentation = ({ roomCode, gameData, onEndGame, onExit, onShowRecap, onAwardXP, onAwardCoins, showToast }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [questionPhase, setQuestionPhase] = useState('showing');
  const [isUpdating, setIsUpdating] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Reveals & extras
  const [showLeaderboardReveal, setShowLeaderboardReveal] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const [minigameTimeLeft, setMinigameTimeLeft] = useState(0);

  // Prize modal
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [prizeType, setPrizeType] = useState('xp');
  const [prizeAmount, setPrizeAmount] = useState(10);
  const [prizeRecipients, setPrizeRecipients] = useState('all');
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [isAwarding, setIsAwarding] = useState(false);

  const updatingRef = useRef(false);
  const autoAdvancedRef = useRef(false);
  const sweepDoneRef = useRef({});
  const minigameAwardRef = useRef(false);
  const confettiFiredRef = useRef(false);

  const mode = gameData?.mode || 'classic';
  const modeInfo = GAME_MODES[mode] || GAME_MODES.classic;
  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = gameData?.quiz?.questions?.length || 0;
  const isEstimation = currentQuestion?.type === 'estimation';
  const isFinished = gameData?.status === 'finished' || gameData?.questionPhase === 'finished';
  const minigame = gameData?.minigame;

  // ─── Sync local state from Firebase ─────────────────────────────────────
  useEffect(() => {
    if (!gameData) return;
    const idx = gameData.currentQuestion ?? 0;
    setCurrentQuestionIndex(idx);
    setQuestionPhase(gameData.questionPhase || 'showing');

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

  // ─── Player helpers ──────────────────────────────────────────────────────
  const allPlayerIds = Object.keys(gameData?.players || {});
  const eliminatedIds = Object.keys(gameData?.eliminated || {});
  const activePlayerIds = mode === 'elimination'
    ? allPlayerIds.filter(id => !gameData?.eliminated?.[id])
    : allPlayerIds;
  const responses = gameData?.responses?.[currentQuestionIndex] || {};
  const responseCount = activePlayerIds.filter(id => responses[id]).length;

  // ─── 3-2-1 countdown then auto-start answering (not in race mode) ────────
  useEffect(() => {
    if (mode === 'race' || isFinished) { setCountdown(null); return; }
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
        answeringStartedAt: Date.now(),
      });
      playQuizSound('questionReveal');
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionPhase, currentQuestionIndex, mode, isFinished]);

  // ─── Teacher-side countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (mode === 'race' || questionPhase !== 'answering' || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { showResults(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, questionPhase, mode]);

  // ─── Auto-advance to results when all ACTIVE players answered ────────────
  useEffect(() => {
    if (mode === 'race' || questionPhase !== 'answering' || autoAdvancedRef.current) return;
    if (activePlayerIds.length === 0) return;
    if (responseCount >= activePlayerIds.length) {
      autoAdvancedRef.current = true;
      setTimeout(() => showResults(), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData?.responses, questionPhase, currentQuestionIndex]);

  // ─── Show results (+ elimination sweep for non-responders) ───────────────
  const showResults = useCallback(async () => {
    const updates = { questionPhase: 'results' };

    if (mode === 'elimination' && !sweepDoneRef.current[currentQuestionIndex]) {
      sweepDoneRef.current[currentQuestionIndex] = true;
      const resp = gameData?.responses?.[currentQuestionIndex] || {};
      const alive = Object.keys(gameData?.players || {}).filter(id => !gameData?.eliminated?.[id]);
      alive.forEach(pid => {
        const r = resp[pid];
        // No answer, or wrong answer without a shield save → eliminated
        if (!r || (!r.isCorrect && !r.shieldSaved)) {
          updates[`eliminated/${pid}`] = { at: Date.now(), questionIndex: currentQuestionIndex };
        }
      });
    }

    await updateGameState(updates);
    playQuizSound('correct');
  }, [updateGameState, mode, currentQuestionIndex, gameData]);

  // ─── Next question / finish ──────────────────────────────────────────────
  const survivorsAfterThisQuestion = mode === 'elimination'
    ? allPlayerIds.filter(id => !gameData?.eliminated?.[id]).length
    : null;

  const shouldEndEarly = mode === 'elimination' && questionPhase === 'results' && survivorsAfterThisQuestion <= 1;

  const nextQuestion = async () => {
    setShowLeaderboardReveal(false);
    if (currentQuestionIndex < totalQuestions - 1 && !shouldEndEarly) {
      const nextIdx = currentQuestionIndex + 1;
      await updateGameState({ currentQuestion: nextIdx, questionPhase: 'showing' });
    } else {
      await onEndGame();
      playQuizSound('gameEnd');
    }
  };

  // ─── Leaderboard reveal overlay ──────────────────────────────────────────
  const openLeaderboardReveal = () => {
    setRevealStep(0);
    setShowLeaderboardReveal(true);
    playQuizSound('leaderboard');
  };

  useEffect(() => {
    if (!showLeaderboardReveal) return;
    if (revealStep >= 5) return;
    const t = setTimeout(() => setRevealStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [showLeaderboardReveal, revealStep]);

  // ─── Tap Frenzy minigame ─────────────────────────────────────────────────
  const startMinigame = async () => {
    minigameAwardRef.current = false;
    const now = Date.now();
    await updateGameState({
      minigame: { active: true, type: 'tap', startedAt: now, endsAt: now + MINIGAME_DURATION, round: currentQuestionIndex, taps: {} }
    });
    playQuizSound('gameStart');
  };

  useEffect(() => {
    if (!minigame?.active || !minigame?.endsAt) { setMinigameTimeLeft(0); return; }
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((minigame.endsAt - Date.now()) / 1000));
      setMinigameTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        finishMinigame();
      }
    }, 250);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minigame?.active, minigame?.endsAt]);

  const finishMinigame = async () => {
    if (minigameAwardRef.current) return;
    minigameAwardRef.current = true;
    const taps = gameData?.minigame?.taps || {};
    const ranked = Object.entries(taps).sort((a, b) => (b[1] || 0) - (a[1] || 0)).slice(0, 3);
    const updates = { 'minigame/active': false, 'minigame/awarded': true };
    const existing = gameData?.bonusPoints || {};
    const winners = [];
    ranked.forEach(([pid, count], i) => {
      if (!count) return;
      updates[`bonusPoints/${pid}`] = (existing[pid] || 0) + MINIGAME_PRIZES[i];
      winners.push({ pid, count, prize: MINIGAME_PRIZES[i] });
    });
    updates['minigame/winners'] = winners;
    await updateGameState(updates);
    playQuizSound('gameEnd');
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
        default: break;
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
    if (s.has(id)) { s.delete(id); } else { s.add(id); }
    setSelectedPlayers(s);
  };

  // ─── Race mode: auto-finish when everyone crosses the line ───────────────
  useEffect(() => {
    if (mode !== 'race' || isFinished) return;
    const progress = gameData?.raceProgress || {};
    if (allPlayerIds.length > 0 && allPlayerIds.every(id => progress[id]?.finished)) {
      const t = setTimeout(() => onEndGame(), 1500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData?.raceProgress, mode, isFinished]);

  // ─── Confetti on podium ─────────────────────────────────────────────────
  useEffect(() => {
    if (isFinished && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      setTimeout(() => triggerConfetti(), 400);
    }
  }, [isFinished]);

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: PODIUM CEREMONY (finished)
  // ══════════════════════════════════════════════════════════════════════
  if (isFinished) {
    const leaderboard = calculateFinalLeaderboard(gameData);
    const teamBoard = mode === 'team' ? calculateTeamLeaderboard(gameData) : [];
    const podium = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);
    const podiumHeights = ['h-40', 'h-28', 'h-20'];
    const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visual order
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden relative">
        <ReactionOverlay reactions={gameData?.reactions} />
        <style>{`@keyframes qsRise { 0% { transform: translateY(60px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }`}</style>

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-fuchsia-700 px-6 py-10 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent_65%)]" />
          <div className="relative">
            <div className="text-7xl mb-3">🏆</div>
            <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow mb-1">That's a Wrap!</h1>
            <p className="text-white/85 text-lg font-semibold">{gameData?.quiz?.title} · {modeInfo.icon} {modeInfo.name}</p>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          {/* Team podium */}
          {mode === 'team' && teamBoard.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-black text-white text-center mb-5">🛡️ Team Standings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {teamBoard.map((team, i) => (
                  <div key={team.teamId}
                    className="rounded-2xl border-2 p-5 text-center"
                    style={{ borderColor: `${team.color}88`, background: `${team.color}15`, animation: `qsRise 0.6s ease-out ${i * 0.15}s both` }}>
                    <div className="text-4xl mb-1">{i === 0 ? '👑' : team.emoji}</div>
                    <p className="font-black text-lg" style={{ color: team.color }}>{team.name}</p>
                    <p className="text-3xl font-black text-white mt-2">{team.avgScore.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">avg points · {team.memberCount} players</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player podium */}
          {podium.length > 0 && (
            <div className="flex items-end justify-center gap-3 md:gap-6 pt-6">
              {podiumOrder.filter(i => podium[i]).map(i => {
                const p = podium[i];
                return (
                  <div key={p.playerId} className="flex flex-col items-center w-28 md:w-40"
                    style={{ animation: `qsRise 0.7s ease-out ${(2 - i) * 0.3}s both` }}>
                    <div className="text-4xl mb-1">{medals[i]}</div>
                    <img src={p.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={p.name}
                      className={`rounded-full border-4 shadow-xl mb-2 ${i === 0 ? 'w-20 h-20 md:w-24 md:h-24 border-amber-300' : 'w-14 h-14 md:w-16 md:h-16 border-white/40'}`} />
                    <p className="font-black text-white text-center leading-tight mb-1 text-sm md:text-base">{p.name}</p>
                    <p className="text-amber-300 font-black text-lg md:text-2xl mb-2">{p.totalScore.toLocaleString()}</p>
                    <div className={`w-full rounded-t-2xl ${podiumHeights[i]} ${i === 0 ? 'bg-gradient-to-t from-amber-600 to-amber-400' : i === 1 ? 'bg-gradient-to-t from-slate-600 to-slate-400' : 'bg-gradient-to-t from-orange-800 to-orange-600'} flex items-start justify-center pt-2`}>
                      <span className="text-white/80 font-black text-2xl">{i + 1}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest of the field */}
          {rest.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-2xl mx-auto">
              <div className="space-y-2">
                {rest.map((player, i) => (
                  <div key={player.playerId} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                    <span className="w-8 text-center font-black text-slate-400">{i + 4}</span>
                    <img src={player.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={player.name}
                      className="w-9 h-9 rounded-full border-2 border-white/20" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{player.name}
                        {player.eliminated && <span className="ml-2 text-xs text-rose-400 font-semibold">💀 Q{(player.eliminatedAtQuestion ?? 0) + 1}</span>}
                      </p>
                      <p className="text-xs text-slate-400">{player.correctAnswers}/{player.totalQuestions} correct{player.bestStreak > 1 ? ` · 🔥 ${player.bestStreak} streak` : ''}</p>
                    </div>
                    <p className="font-black text-fuchsia-300">{player.totalScore.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => setShowPrizeModal(true)}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-7 py-3 rounded-2xl font-black shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all">
              🎁 Award Prizes
            </button>
            <button onClick={onShowRecap}
              className="bg-white/10 text-white px-7 py-3 rounded-2xl font-black hover:bg-white/20 transition-all">
              📊 Detailed Recap
            </button>
            <button onClick={onExit}
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-7 py-3 rounded-2xl font-black shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all">
              ✨ Back to Dashboard
            </button>
          </div>
        </div>

        {showPrizeModal && renderPrizeModal(calculateFinalLeaderboard(gameData))}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: RACE MODE TRACK
  // ══════════════════════════════════════════════════════════════════════
  if (mode === 'race') {
    const progress = gameData?.raceProgress || {};
    const racers = allPlayerIds.map(id => {
      const p = gameData.players[id];
      const rp = progress[id] || {};
      return {
        id,
        name: p?.name,
        avatar: p?.avatar,
        index: Math.min(rp.index || 0, totalQuestions),
        correct: rp.correct || 0,
        finished: Boolean(rp.finished),
        finishedAt: rp.finishedAt || null,
      };
    }).sort((a, b) => {
      if (a.finished !== b.finished) return a.finished ? -1 : 1;
      if (a.finished && b.finished) return a.finishedAt - b.finishedAt;
      return b.index - a.index || b.correct - a.correct;
    });
    const finishedCount = racers.filter(r => r.finished).length;

    return (
      <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden relative">
        <ReactionOverlay reactions={gameData?.reactions} />

        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">🏁 Quiz Race — Live Track</h1>
            <p className="text-cyan-100 font-semibold text-sm mt-1">
              {gameData?.quiz?.title} · {totalQuestions} questions · {finishedCount}/{racers.length} finished
            </p>
          </div>
          <button onClick={onEndGame}
            className="bg-white/15 border border-white/30 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-rose-500/40 transition">
            🏁 End Race
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-3">
          {racers.length === 0 && (
            <p className="text-center text-slate-400 py-10">No racers yet…</p>
          )}
          {racers.map((r, rank) => {
            const pct = totalQuestions ? Math.round((r.index / totalQuestions) * 100) : 0;
            return (
              <div key={r.id} className={`rounded-2xl border p-4 ${r.finished ? 'bg-emerald-500/10 border-emerald-400/40' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black shrink-0 ${
                    rank === 0 ? 'bg-amber-400 text-amber-950' : rank === 1 ? 'bg-slate-300 text-slate-800' : rank === 2 ? 'bg-orange-400 text-orange-950' : 'bg-white/10 text-slate-300'
                  }`}>{rank + 1}</span>
                  <img src={r.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={r.name} className="w-9 h-9 rounded-full border-2 border-white/30" />
                  <p className="font-bold text-white flex-1 truncate">{r.name}</p>
                  <p className="text-sm font-semibold text-slate-300">
                    {r.finished ? <span className="text-emerald-300 font-black">🏁 Finished!</span> : `Q${Math.min(r.index + 1, totalQuestions)}/${totalQuestions}`}
                    <span className="ml-3 text-cyan-300">✔ {r.correct}</span>
                  </p>
                </div>
                {/* Track */}
                <div className="relative h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                  <div className={`h-full transition-all duration-700 ease-out ${r.finished ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-600 to-blue-500'}`}
                    style={{ width: `${pct}%` }} />
                  <span className="absolute top-1/2 -translate-y-1/2 text-lg transition-all duration-700 ease-out" style={{ left: `calc(${pct}% - 12px)` }}>
                    {r.finished ? '🏆' : '🏎️'}
                  </span>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-white/40 font-black">FINISH</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RENDER: ACTIVE QUESTION (classic / team / elimination)
  // ══════════════════════════════════════════════════════════════════════
  const timeLimit = currentQuestion?.timeLimit || gameData?.settings?.timePerQuestion || 20;
  const timeProgress = timeLeft / timeLimit;
  const optionCounts = (currentQuestion?.options || []).map((_, i) =>
    Object.values(responses).filter(r => r.answer === i).length
  );
  const maxCount = Math.max(1, ...optionCounts);

  return (
    <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden relative">
      <ReactionOverlay reactions={gameData?.reactions} />

      <div className="p-5 md:p-8 space-y-5">
        {/* ── Question card ── */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${modeInfo.gradient} shadow-2xl`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_60%)]" />
          <div className="relative p-6 md:p-8">
            {/* Meta row */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-black/25 px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase text-white">
                  {modeInfo.icon} Q{currentQuestionIndex + 1}/{totalQuestions}
                </span>
                {questionPhase === 'answering' && (
                  <span className={`px-4 py-1.5 rounded-full text-sm font-black ${responseCount >= activePlayerIds.length && activePlayerIds.length > 0 ? 'bg-emerald-400 text-emerald-950' : 'bg-black/25 text-white'}`}>
                    ✋ {responseCount}/{activePlayerIds.length}
                  </span>
                )}
                {mode === 'elimination' && (
                  <span className="px-4 py-1.5 rounded-full text-sm font-black bg-black/25 text-white">
                    💀 {eliminatedIds.length} out · {activePlayerIds.length} alive
                  </span>
                )}
              </div>

              {questionPhase === 'showing' && countdown !== null && (
                <div className="text-6xl md:text-7xl font-black animate-bounce text-yellow-300 drop-shadow">{countdown}</div>
              )}
              {questionPhase === 'answering' && (
                <div className={`text-5xl font-black drop-shadow ${timeLeft <= 5 ? 'text-red-200 animate-pulse' : timeLeft <= 10 ? 'text-yellow-200' : 'text-white'}`}>
                  {timeLeft}s
                </div>
              )}
            </div>

            {/* Timer bar */}
            {questionPhase === 'answering' && (
              <div className="h-2.5 bg-black/25 rounded-full mb-5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 5 ? 'bg-red-400' : timeLeft <= 10 ? 'bg-yellow-300' : 'bg-emerald-300'
                }`} style={{ width: `${Math.max(0, timeProgress * 100)}%` }} />
              </div>
            )}

            {/* Question text + media */}
            <h1 className="text-2xl md:text-4xl font-black text-center leading-snug text-white drop-shadow">
              {currentQuestion?.question}
            </h1>
            {currentQuestion?.media?.url && (
              <div className="mt-4 flex justify-center">
                <img src={currentQuestion.media.url} alt="Question"
                  className="max-h-64 rounded-2xl border-4 border-white/30 shadow-xl object-contain bg-black/20" />
              </div>
            )}
            {isEstimation && questionPhase !== 'results' && (
              <p className="text-center text-white/85 mt-4 font-bold text-lg">
                🎯 Closest Wins — students type their best guess{currentQuestion?.unit ? ` (${currentQuestion.unit})` : ''}!
              </p>
            )}
          </div>
        </div>

        {/* ── Answers / estimation reveal ── */}
        {isEstimation ? (
          questionPhase === 'results' && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">The answer was</p>
              <p className="text-5xl font-black text-emerald-300 mb-5">
                {currentQuestion.answerValue?.toLocaleString()} {currentQuestion.unit}
              </p>
              <div className="max-w-md mx-auto space-y-2">
                {Object.entries(responses)
                  .sort((a, b) => Math.abs((a[1].value ?? Infinity) - currentQuestion.answerValue) - Math.abs((b[1].value ?? Infinity) - currentQuestion.answerValue))
                  .slice(0, 5)
                  .map(([pid, r], i) => (
                    <div key={pid} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2">
                      <span className="font-black text-slate-400 w-6">{i + 1}</span>
                      <span className="font-bold text-white flex-1 text-left truncate">{gameData?.players?.[pid]?.name}</span>
                      <span className="font-black text-cyan-300">{Number(r.value).toLocaleString()}</span>
                      <span className="font-black text-fuchsia-300 w-16 text-right">+{r.points}</span>
                    </div>
                  ))}
                {Object.keys(responses).length === 0 && <p className="text-slate-500">No guesses came in!</p>}
              </div>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion?.options?.map((option, i) => {
              const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
              const isCorrect = i === parseInt(currentQuestion.correctAnswer, 10);
              const count = optionCounts[i] || 0;
              let cls = `relative p-4 md:p-5 rounded-2xl text-white font-bold text-lg flex items-center gap-4 shadow-lg transition-all duration-500 ${style.bg}`;
              if (questionPhase === 'results' && isCorrect) cls += ' ring-4 ring-white scale-[1.02] shadow-2xl';
              if (questionPhase === 'results' && !isCorrect) cls += ' opacity-40 saturate-50';
              return (
                <div key={i} className={cls}>
                  <div className="w-11 h-11 bg-black/25 rounded-xl flex items-center justify-center text-xl font-black shrink-0">
                    {style.shape}
                  </div>
                  <span className="flex-1">{option}</span>
                  {questionPhase === 'results' && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Response distribution bar */}
                      <div className="w-20 h-3 bg-black/30 rounded-full overflow-hidden hidden sm:block">
                        <div className={`h-full ${style.bar} transition-all duration-700`} style={{ width: `${(count / maxCount) * 100}%` }} />
                      </div>
                      <span className="bg-black/30 rounded-full px-2.5 py-0.5 text-sm font-black">{count}</span>
                      {isCorrect && <span className="text-2xl">✅</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Minigame banner (active) ── */}
        {minigame?.active && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-5 text-center shadow-2xl">
            <p className="text-white font-black text-2xl mb-1">⚡ TAP FRENZY — {minigameTimeLeft}s</p>
            <p className="text-yellow-100 font-semibold text-sm mb-3">Students: TAP AS FAST AS YOU CAN! Top 3 tappers win bonus points!</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {Object.entries(minigame.taps || {})
                .sort((a, b) => (b[1] || 0) - (a[1] || 0))
                .slice(0, 5)
                .map(([pid, count], i) => (
                  <div key={pid} className="bg-black/25 rounded-xl px-4 py-2">
                    <p className="text-white font-black">{i === 0 ? '👑 ' : ''}{gameData?.players?.[pid]?.name}</p>
                    <p className="text-yellow-200 font-black text-xl">{count}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Minigame results flash */}
        {!minigame?.active && minigame?.awarded && questionPhase === 'results' && (minigame.winners || []).length > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-400/40 rounded-2xl p-4 text-center">
            <p className="text-yellow-200 font-bold">
              ⚡ Tap Frenzy: {(minigame.winners || []).map((w, i) => `${['🥇', '🥈', '🥉'][i]} ${gameData?.players?.[w.pid]?.name} +${w.prize}`).join('  ·  ')}
            </p>
          </div>
        )}

        {/* ── Control bar ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 text-sm text-slate-400 font-semibold">
              <span>👥 <strong className="text-white">{allPlayerIds.length}</strong> players</span>
              {mode === 'elimination' && <span>❤️ <strong className="text-white">{activePlayerIds.length}</strong> alive</span>}
            </div>

            <div className="flex gap-2 flex-wrap">
              {questionPhase === 'results' && !minigame?.active && (
                <>
                  <button onClick={openLeaderboardReveal}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-3 rounded-xl font-black shadow-lg hover:brightness-110 transition-all">
                    🏆 Leaderboard Reveal
                  </button>
                  {currentQuestionIndex < totalQuestions - 1 && !shouldEndEarly && (
                    <button onClick={startMinigame}
                      className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-5 py-3 rounded-xl font-black shadow-lg hover:brightness-110 transition-all">
                      ⚡ Tap Frenzy
                    </button>
                  )}
                  <button onClick={nextQuestion} disabled={isUpdating}
                    className={`bg-gradient-to-r ${modeInfo.gradient} text-white px-6 py-3 rounded-xl font-black shadow-lg hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-50`}>
                    {currentQuestionIndex < totalQuestions - 1 && !shouldEndEarly ? '⏭ Next Question' : '🏁 Finish Game'}
                  </button>
                </>
              )}
              {questionPhase === 'answering' && (
                <button onClick={showResults} disabled={isUpdating}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-5 py-3 rounded-xl font-black shadow-lg hover:brightness-110 transition-all disabled:opacity-50">
                  📊 Reveal Answers Now
                </button>
              )}
              <button onClick={() => { if (window.confirm('End the game now?')) onEndGame(); }}
                className="bg-rose-500/20 text-rose-300 border border-rose-400/30 px-4 py-3 rounded-xl font-bold hover:bg-rose-500/40 transition-colors">
                🛑 End
              </button>
            </div>
          </div>
          {shouldEndEarly && (
            <p className="text-rose-300 font-bold text-sm mt-3 text-center">
              💀 {survivorsAfterThisQuestion === 1 ? 'Only one champion remains!' : 'Everyone is out!'} Hit Finish for the ceremony.
            </p>
          )}
        </div>
      </div>

      {/* ── Leaderboard reveal overlay ── */}
      {showLeaderboardReveal && renderLeaderboardReveal()}
      {showPrizeModal && renderPrizeModal(calculateFinalLeaderboard(gameData))}
    </div>
  );

  // ── Leaderboard reveal: top-5 countdown, 5th → 1st ──────────────────────
  function renderLeaderboardReveal() {
    const board = calculateFinalLeaderboard(gameData).slice(0, 5);
    const teamBoard = mode === 'team' ? calculateTeamLeaderboard(gameData) : [];
    // Reveal from the bottom of the top-5 upward
    const revealedCount = Math.min(revealStep + 1, board.length);
    const visible = board.slice(0, board.length).map((p, i) => ({ ...p, rank: i + 1 }))
      .filter(p => p.rank > board.length - revealedCount);

    return (
      <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
        onClick={() => { if (revealStep >= board.length) setShowLeaderboardReveal(false); }}>
        <style>{`@keyframes qsSlide { 0% { transform: translateX(-40px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }`}</style>
        <h2 className="text-3xl md:text-4xl font-black text-white mb-6">🏆 Top 5 — Q{currentQuestionIndex + 1}</h2>

        {mode === 'team' && teamBoard.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap justify-center">
            {teamBoard.map((t, i) => (
              <div key={t.teamId} className="rounded-xl px-4 py-2 border-2 text-center" style={{ borderColor: `${t.color}88`, background: `${t.color}18` }}>
                <p className="font-black text-sm" style={{ color: t.color }}>{i === 0 ? '👑 ' : ''}{t.emoji} {t.name}</p>
                <p className="text-white font-black text-lg">{t.avgScore.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="w-full max-w-lg space-y-2.5">
          {board.map((p, i) => {
            const rank = i + 1;
            const isRevealed = visible.some(v => v.playerId === p.playerId);
            return (
              <div key={p.playerId}
                className={`flex items-center gap-3 rounded-2xl px-5 py-3 border transition-all ${
                  rank === 1 && isRevealed ? 'bg-amber-500/20 border-amber-400/60 scale-105' : 'bg-white/5 border-white/10'
                } ${isRevealed ? '' : 'opacity-0'}`}
                style={isRevealed ? { animation: 'qsSlide 0.5s ease-out both' } : {}}>
                <span className={`w-9 h-9 rounded-full flex items-center justify-center font-black ${
                  rank === 1 ? 'bg-amber-400 text-amber-950' : rank === 2 ? 'bg-slate-300 text-slate-800' : rank === 3 ? 'bg-orange-400 text-orange-950' : 'bg-white/10 text-slate-300'
                }`}>{rank}</span>
                <img src={p.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={p.name} className="w-10 h-10 rounded-full border-2 border-white/30" />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white truncate">{isRevealed ? p.name : '???'}</p>
                  {p.teamName && <p className="text-xs font-semibold" style={{ color: p.teamColor }}>{p.teamEmoji} {p.teamName}</p>}
                </div>
                <p className="font-black text-xl text-fuchsia-300">{isRevealed ? p.totalScore.toLocaleString() : '•••'}</p>
              </div>
            );
          })}
        </div>

        <button onClick={() => setShowLeaderboardReveal(false)}
          className="mt-8 bg-white/10 text-white px-8 py-3 rounded-2xl font-black hover:bg-white/20 transition">
          {revealStep >= board.length ? 'Continue →' : 'Skip'}
        </button>
      </div>
    );
  }

  // ── Prize modal ──────────────────────────────────────────────────────────
  function renderPrizeModal(leaderboard) {
    const studentsInGame = leaderboard.filter(p => p.studentId);
    let recipientCount = 0;
    switch (prizeRecipients) {
      case 'all':    recipientCount = studentsInGame.length; break;
      case 'winner': recipientCount = Math.min(1, studentsInGame.length); break;
      case 'top3':   recipientCount = Math.min(3, studentsInGame.length); break;
      case 'custom': recipientCount = selectedPlayers.size; break;
      default: break;
    }

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-3xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">🎁 Award Prizes</h2>
              <p className="text-amber-100 text-sm mt-1">Reward your students for playing!</p>
            </div>
            <button onClick={() => setShowPrizeModal(false)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 text-xl font-bold">×</button>
          </div>

          <div className="p-6 space-y-5">
            {/* Type */}
            <div>
              <p className="font-bold text-white mb-3">Prize Type</p>
              <div className="grid grid-cols-2 gap-3">
                {[['xp', '⭐', 'XP', 'Level up progress'], ['coins', '🪙', 'Coins', 'Shop currency']].map(([val, icon, label, sub]) => (
                  <button key={val} onClick={() => setPrizeType(val)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${prizeType === val ? 'border-fuchsia-400 bg-fuchsia-500/15' : 'border-white/10 bg-white/5 hover:border-fuchsia-400/50'}`}>
                    <div className="text-2xl mb-1">{icon}</div>
                    <p className="font-bold text-white">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div>
              <p className="font-bold text-white mb-3">Amount per student</p>
              <div className="flex items-center gap-3">
                <input type="number" min="1" max="500" value={prizeAmount}
                  onChange={e => setPrizeAmount(parseInt(e.target.value) || 1)}
                  className="w-24 px-3 py-2 bg-white/5 border-2 border-white/15 text-white rounded-xl text-center font-bold focus:border-fuchsia-400 focus:outline-none" />
                <div className="flex gap-2 flex-wrap">
                  {[5, 10, 25, 50].map(n => (
                    <button key={n} onClick={() => setPrizeAmount(n)}
                      className="px-3 py-1.5 bg-white/10 text-slate-200 hover:bg-fuchsia-500/25 rounded-lg text-sm font-semibold transition-colors">{n}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <p className="font-bold text-white mb-3">Award to</p>
              <div className="space-y-2">
                {[['all', `Everyone (${studentsInGame.length} students)`], ['winner', 'Winner only'], ['top3', 'Top 3'], ['custom', 'Custom selection']].map(([val, label]) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer text-slate-200">
                    <input type="radio" name="recipients" value={val} checked={prizeRecipients === val} onChange={() => setPrizeRecipients(val)} className="accent-fuchsia-500" />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {prizeRecipients === 'custom' && (
                <div className="mt-3 max-h-40 overflow-y-auto space-y-1 border border-white/10 rounded-xl p-3 bg-white/5">
                  {studentsInGame.map(p => (
                    <label key={p.playerId} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={selectedPlayers.has(p.playerId)} onChange={() => togglePlayer(p.playerId)} className="accent-fuchsia-500" />
                      <img src={p.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt={p.name} className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-slate-200">{p.name}</span>
                      <span className="text-xs text-slate-500 ml-auto">{p.totalScore} pts</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-fuchsia-500/10 border border-fuchsia-400/30 rounded-2xl p-4 text-sm text-slate-200">
              Awarding <strong className="text-white">{prizeAmount} {prizeType === 'xp' ? 'XP' : 'coins'}</strong> to <strong className="text-white">{recipientCount} student{recipientCount !== 1 ? 's' : ''}</strong> = <strong className="text-fuchsia-300">{recipientCount * prizeAmount} total</strong>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPrizeModal(false)} className="flex-1 bg-white/10 text-slate-200 py-3 rounded-2xl font-bold hover:bg-white/20 transition-colors">Cancel</button>
              <button onClick={handleAwardPrizes} disabled={isAwarding || (prizeRecipients === 'custom' && selectedPlayers.size === 0)}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-2xl font-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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
