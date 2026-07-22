// components/quizshow/student/StudentGameView.js — STUDENT PLAY SCREEN
// Handles all four game modes with streaks, one-shot power-ups, estimation
// questions, Tap Frenzy minigames, spectator mode and the self-paced race.
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, set, update } from 'firebase/database';
import { database } from '../../../utils/firebase';
import {
  playQuizSound,
  calculateQuizScore,
  calculateStreakBonus,
  calculateEstimationScore,
  getTeamForPlayer,
  getPowerUpsForMode,
  GAME_MODES,
} from '../../../utils/quizShowHelpers';
import { ReactionBar } from '../shared/Reactions';

const ANSWER_COLORS = [
  { bg: 'bg-rose-500',    hover: 'hover:bg-rose-400',    ring: 'ring-rose-300',    shape: '▲' },
  { bg: 'bg-blue-500',    hover: 'hover:bg-blue-400',    ring: 'ring-blue-300',    shape: '◆' },
  { bg: 'bg-amber-500',   hover: 'hover:bg-amber-400',   ring: 'ring-amber-300',   shape: '●' },
  { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-400', ring: 'ring-emerald-300', shape: '■' },
  { bg: 'bg-violet-500',  hover: 'hover:bg-violet-400',  ring: 'ring-violet-300',  shape: '★' },
  { bg: 'bg-cyan-500',    hover: 'hover:bg-cyan-400',    ring: 'ring-cyan-300',    shape: '⬟' },
];

const PAGE_BG = 'min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950';

const StudentGameView = ({ roomCode, gameData, playerInfo }) => {
  const mode = gameData?.mode || 'classic';
  const isRace = mode === 'race';
  const modeInfo = GAME_MODES[mode] || GAME_MODES.classic;
  const totalQuestions = gameData?.quiz?.questions?.length || 0;
  const powerUpsEnabled = gameData?.settings?.powerUpsEnabled !== false;
  const availablePowerUps = powerUpsEnabled ? getPowerUpsForMode(mode) : [];

  // ── Shared state ────────────────────────────────────────────────────────
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionPhase, setQuestionPhase] = useState('waiting');
  const [score, setScore] = useState(0);
  const [lastPoints, setLastPoints] = useState(null);
  const [showPointsAnim, setShowPointsAnim] = useState(false);
  const [streak, setStreak] = useState(0);
  const [guess, setGuess] = useState('');
  const [lastOutcome, setLastOutcome] = useState(null); // {isCorrect, points, shieldSaved} for race flash

  // Power-ups: remaining uses + per-question effects
  const [powerUps, setPowerUps] = useState({ fifty: 1, double: 1, shield: 1 });
  const [doubleActive, setDoubleActive] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);

  // Minigame
  const [tapCount, setTapCount] = useState(0);
  const tapWriteRef = useRef(0);
  const minigameRoundRef = useRef(null);

  const answerSubmittedRef = useRef(false);
  const timerRunningRef = useRef(false);
  const currentQuestionRef = useRef(-1);
  const currentPhaseRef = useRef('waiting');
  const answeringStartTimeRef = useRef(null);
  const streakRef = useRef(0);
  const raceInitRef = useRef(false);
  const raceAdvanceRef = useRef(false);

  const currentQuestion = gameData?.quiz?.questions?.[currentQuestionIndex];
  const isEstimation = currentQuestion?.type === 'estimation';
  const myTeam = mode === 'team' ? getTeamForPlayer(gameData?.teams, playerInfo?.playerId) : null;
  const isEliminated = mode === 'elimination' && Boolean(gameData?.eliminated?.[playerInfo?.playerId]);
  const minigame = gameData?.minigame;
  const minigameActive = Boolean(minigame?.active);

  // ══════════════════════════════════════════════════════════════════════
  // SYNCED MODES: follow the teacher's phase machine
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!gameData || isRace) return;

    if (gameData.currentQuestion !== undefined && gameData.currentQuestion !== currentQuestionRef.current) {
      currentQuestionRef.current = gameData.currentQuestion;
      setCurrentQuestionIndex(gameData.currentQuestion);
      setSelectedAnswer(null);
      setHasAnswered(false);
      setLastPoints(null);
      setGuess('');
      setDoubleActive(false);
      setHiddenOptions([]);
      answerSubmittedRef.current = false;
      timerRunningRef.current = false;
      setTimeLeft(0);
    }

    if (gameData.questionPhase && gameData.questionPhase !== currentPhaseRef.current) {
      currentPhaseRef.current = gameData.questionPhase;
      setQuestionPhase(gameData.questionPhase);

      if (gameData.questionPhase === 'answering' && !timerRunningRef.current) {
        const q = gameData.quiz?.questions?.[gameData.currentQuestion ?? 0];
        const timeLimit = q?.timeLimit || gameData?.settings?.timePerQuestion || 20;
        setTimeLeft(timeLimit);
        timerRunningRef.current = true;
        answeringStartTimeRef.current = Date.now();
      }
    }

    if (gameData.questionPhase === 'results' && gameData.responses && playerInfo?.playerId) {
      updateScoreFromFirebase(gameData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameData, isRace]);

  // Countdown ticker (synced modes)
  useEffect(() => {
    if (isRace) return;
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
  }, [timeLeft, questionPhase, isRace]);

  const updateScoreFromFirebase = (data) => {
    let totalScore = 0;
    let latestPoints = null;
    const qIdx = data.currentQuestion ?? currentQuestionIndex;
    Object.entries(data.responses || {}).forEach(([qKey, questionResponses]) => {
      const playerResponse = questionResponses?.[playerInfo.playerId];
      if (playerResponse?.points !== undefined) {
        totalScore += playerResponse.points;
        if (parseInt(qKey) === qIdx) latestPoints = playerResponse.points;
      }
    });
    totalScore += (data.bonusPoints?.[playerInfo.playerId] || 0);
    setScore(totalScore);
    if (latestPoints !== null && latestPoints > 0) {
      setLastPoints(latestPoints);
      setShowPointsAnim(true);
      setTimeout(() => setShowPointsAnim(false), 2500);
    }
  };

  // ── Build + write a response ────────────────────────────────────────────
  const buildAndSubmit = useCallback(async (qIdx, question, payload) => {
    try {
      await set(ref(database, `gameRooms/${roomCode}/responses/${qIdx}/${playerInfo.playerId}`), {
        ...payload,
        submittedAt: Date.now()
      });
      return true;
    } catch (error) {
      return false;
    }
  }, [roomCode, playerInfo?.playerId]);

  const computeAnswerResult = (question, answerIndex, timeSpent) => {
    const timeLimit = question?.timeLimit || 20;
    const basePoints = question?.points || 1000;
    let isCorrect, points, value = null;

    if (question.type === 'estimation') {
      const est = calculateEstimationScore(answerIndex, question.answerValue, basePoints);
      isCorrect = est.isCorrect;
      points = est.points;
      value = Number(answerIndex);
    } else {
      const correctAnswerIndex = parseInt(question.correctAnswer, 10);
      isCorrect = parseInt(answerIndex, 10) === correctAnswerIndex;
      points = calculateQuizScore(timeSpent, timeLimit, basePoints, isCorrect);
    }

    // Streak
    const newStreak = isCorrect ? streakRef.current + 1 : 0;
    if (isCorrect) points += calculateStreakBonus(newStreak);

    // Double points power-up
    let usedDouble = false;
    if (doubleActive && isCorrect) { points *= 2; usedDouble = true; }
    if (doubleActive && !isCorrect) usedDouble = true; // consumed either way

    // Shield (elimination only, auto-consumes on a wrong answer)
    let shieldSaved = false;
    if (mode === 'elimination' && !isCorrect && powerUps.shield > 0 && availablePowerUps.some(p => p.id === 'shield')) {
      shieldSaved = true;
      setPowerUps(prev => ({ ...prev, shield: 0 }));
    }

    streakRef.current = newStreak;
    setStreak(newStreak);
    if (usedDouble) setDoubleActive(false);

    return { isCorrect, points, value, newStreak, usedDouble, shieldSaved };
  };

  // ── Submit (synced modes) ───────────────────────────────────────────────
  const submitAnswer = async (answerIndex) => {
    if (answerSubmittedRef.current || hasAnswered || questionPhase !== 'answering' || isEliminated) return;
    if (!currentQuestion) return;

    answerSubmittedRef.current = true;
    setHasAnswered(true);
    setSelectedAnswer(answerIndex);

    const timeLimit = currentQuestion?.timeLimit || 20;
    const timeSpent = answeringStartTimeRef.current
      ? Math.min(timeLimit, (Date.now() - answeringStartTimeRef.current) / 1000)
      : timeLimit;

    const result = computeAnswerResult(currentQuestion, answerIndex, timeSpent);
    playQuizSound('answerSubmit');

    const ok = await buildAndSubmit(currentQuestionIndex, currentQuestion, {
      answer: isEstimation ? null : parseInt(answerIndex, 10),
      value: result.value,
      timeSpent: Math.round(timeSpent * 10) / 10,
      isCorrect: result.isCorrect,
      points: result.points,
      streak: result.newStreak,
      usedDouble: result.usedDouble,
      shieldSaved: result.shieldSaved,
    });
    if (!ok) {
      answerSubmittedRef.current = false;
      setHasAnswered(false);
      setSelectedAnswer(null);
    }
  };

  // ══════════════════════════════════════════════════════════════════════
  // RACE MODE: self-paced engine
  // ══════════════════════════════════════════════════════════════════════
  const [raceIndex, setRaceIndex] = useState(0);
  const [raceCorrect, setRaceCorrect] = useState(0);
  const [raceFinished, setRaceFinished] = useState(false);
  const [raceFlash, setRaceFlash] = useState(null); // outcome flash between questions

  useEffect(() => {
    if (!isRace || raceInitRef.current || !gameData) return;
    raceInitRef.current = true;
    const rp = gameData.raceProgress?.[playerInfo?.playerId];
    if (rp) {
      setRaceIndex(Math.min(rp.index || 0, totalQuestions));
      setRaceCorrect(rp.correct || 0);
      setRaceFinished(Boolean(rp.finished));
    }
    // Recover score
    updateScoreFromFirebase(gameData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRace, gameData]);

  const raceQuestion = isRace ? gameData?.quiz?.questions?.[raceIndex] : null;

  // Start timer for each race question
  useEffect(() => {
    if (!isRace || raceFinished || !raceQuestion || raceFlash) return;
    const timeLimit = raceQuestion.timeLimit || 20;
    setTimeLeft(timeLimit);
    answeringStartTimeRef.current = Date.now();
    answerSubmittedRef.current = false;
    raceAdvanceRef.current = false;
    setSelectedAnswer(null);
    setGuess('');
    setDoubleActive(false);
    setHiddenOptions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRace, raceIndex, raceFinished, raceFlash]);

  useEffect(() => {
    if (!isRace || raceFinished || raceFlash || timeLeft <= 0) return;
    const t = setTimeout(() => {
      if (timeLeft <= 1) {
        // Time out — counts as wrong
        setTimeLeft(0);
        submitRaceAnswer(null, true);
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRace, timeLeft, raceFinished, raceFlash]);

  const submitRaceAnswer = async (answerIndex, timedOut = false) => {
    if (!isRace || raceAdvanceRef.current || raceFinished || !raceQuestion) return;
    raceAdvanceRef.current = true;
    setSelectedAnswer(answerIndex);

    const timeLimit = raceQuestion.timeLimit || 20;
    const timeSpent = answeringStartTimeRef.current
      ? Math.min(timeLimit, (Date.now() - answeringStartTimeRef.current) / 1000)
      : timeLimit;

    let result;
    if (timedOut) {
      streakRef.current = 0;
      setStreak(0);
      result = { isCorrect: false, points: 0, value: null, newStreak: 0, usedDouble: false, shieldSaved: false };
    } else {
      result = computeAnswerResult(raceQuestion, answerIndex, timeSpent);
    }

    playQuizSound(result.isCorrect ? 'correct' : 'incorrect', 0.35);

    await buildAndSubmit(raceIndex, raceQuestion, {
      answer: (timedOut || raceQuestion.type === 'estimation') ? null : parseInt(answerIndex, 10),
      value: result.value,
      timeSpent: Math.round(timeSpent * 10) / 10,
      isCorrect: result.isCorrect,
      points: result.points,
      streak: result.newStreak,
      usedDouble: result.usedDouble,
      shieldSaved: false,
      timedOut,
    });

    const nextIndex = raceIndex + 1;
    const nowFinished = nextIndex >= totalQuestions;
    const newCorrect = raceCorrect + (result.isCorrect ? 1 : 0);

    try {
      const progress = {
        index: nextIndex,
        correct: newCorrect,
        finished: nowFinished,
        updatedAt: Date.now(),
      };
      if (nowFinished) progress.finishedAt = Date.now();
      await update(ref(database, `gameRooms/${roomCode}/raceProgress/${playerInfo.playerId}`), progress);
    } catch (e) { /* keep going locally */ }

    setScore(s => s + result.points);
    setRaceCorrect(newCorrect);
    setRaceFlash({ ...result, timedOut });

    setTimeout(() => {
      setRaceFlash(null);
      setRaceIndex(nextIndex);
      if (nowFinished) {
        setRaceFinished(true);
        playQuizSound('gameEnd', 0.4);
      }
    }, 1300);
  };

  // ══════════════════════════════════════════════════════════════════════
  // POWER-UP ACTIONS
  // ══════════════════════════════════════════════════════════════════════
  const activeQuestion = isRace ? raceQuestion : currentQuestion;
  const canAnswerNow = isRace
    ? (!raceFinished && !raceFlash && !raceAdvanceRef.current)
    : (questionPhase === 'answering' && !hasAnswered && !isEliminated && timeLeft > 0);

  const useFifty = () => {
    if (powerUps.fifty <= 0 || !canAnswerNow || !activeQuestion) return;
    if (activeQuestion.type === 'estimation' || (activeQuestion.options || []).length < 3) return;
    const correctIdx = parseInt(activeQuestion.correctAnswer, 10);
    const wrongIdxs = activeQuestion.options.map((_, i) => i).filter(i => i !== correctIdx);
    // Keep one random wrong option, hide the rest
    const keepWrong = wrongIdxs[Math.floor(Math.random() * wrongIdxs.length)];
    setHiddenOptions(wrongIdxs.filter(i => i !== keepWrong));
    setPowerUps(prev => ({ ...prev, fifty: 0 }));
    playQuizSound('questionReveal', 0.4);
  };

  const useDouble = () => {
    if (powerUps.double <= 0 || !canAnswerNow || doubleActive) return;
    setDoubleActive(true);
    setPowerUps(prev => ({ ...prev, double: 0 }));
    playQuizSound('questionReveal', 0.4);
  };

  const PowerUpBar = () => {
    if (!powerUpsEnabled || availablePowerUps.length === 0) return null;
    return (
      <div className="flex justify-center gap-2">
        {availablePowerUps.map(p => {
          const remaining = powerUps[p.id] || 0;
          const isShield = p.id === 'shield';
          const usable = !isShield && remaining > 0 && canAnswerNow &&
            (p.id !== 'fifty' || (activeQuestion?.options || []).length >= 3);
          const isActive = p.id === 'double' && doubleActive;
          return (
            <button key={p.id}
              onClick={p.id === 'fifty' ? useFifty : p.id === 'double' ? useDouble : undefined}
              disabled={!usable && !isShield}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 border-2 text-sm font-bold transition-all ${
                isActive
                  ? 'bg-fuchsia-500/30 border-fuchsia-400 text-fuchsia-200 animate-pulse'
                  : remaining > 0
                    ? isShield
                      ? 'bg-white/5 border-emerald-400/40 text-emerald-300'
                      : usable
                        ? 'bg-white/10 border-white/25 text-white hover:border-fuchsia-400 hover:bg-fuchsia-500/15 active:scale-95'
                        : 'bg-white/5 border-white/10 text-slate-500'
                    : 'bg-white/5 border-white/10 text-slate-600 line-through'
              }`}>
              <span className="text-lg">{p.icon}</span>
              <span>{p.name}</span>
              {isActive && <span className="text-xs">ACTIVE</span>}
            </button>
          );
        })}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════
  // TOP BAR (shared)
  // ══════════════════════════════════════════════════════════════════════
  const TopBar = ({ qNumber, qTotal, showTimer }) => {
    const timeLimit = activeQuestion?.timeLimit || 20;
    const timeProgress = timeLimit ? timeLeft / timeLimit : 0;
    const timerColor = timeLeft <= 5 ? 'text-rose-400' : timeLeft <= 10 ? 'text-amber-400' : 'text-white';
    return (
      <div className="bg-black/40 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt="avatar"
              className="w-9 h-9 rounded-full border-2 shrink-0"
              style={{ borderColor: myTeam ? myTeam.color : '#c084fc' }} />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none truncate">{playerInfo?.name}</p>
              <p className="text-fuchsia-300 text-xs mt-0.5">
                {score.toLocaleString()} pts
                {myTeam && <span className="ml-1.5" style={{ color: myTeam.color }}>{myTeam.emoji}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Streak flame */}
            {streak > 1 && (
              <div className="bg-orange-500/20 border border-orange-400/50 rounded-full px-2.5 py-1 text-orange-300 font-black text-sm animate-pulse">
                🔥 {streak}
              </div>
            )}
            <div className="text-center">
              <p className="text-slate-400 text-[10px] uppercase tracking-widest leading-none">Question</p>
              <p className="text-white font-black leading-tight">{qNumber}<span className="text-slate-500 font-normal text-sm">/{qTotal}</span></p>
            </div>
            {showTimer ? (
              <div className={`font-black text-3xl leading-none tabular-nums ${timerColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
                {timeLeft}<span className="text-xs font-normal text-slate-500 ml-0.5">s</span>
              </div>
            ) : <div className="w-10" />}
          </div>
        </div>
        {showTimer && (
          <div className="h-1.5 bg-white/10">
            <div className={`h-full transition-all duration-1000 ease-linear ${
              timeLeft <= 5 ? 'bg-rose-500' : timeLeft <= 10 ? 'bg-amber-500' : 'bg-emerald-400'
            }`} style={{ width: `${Math.max(0, timeProgress * 100)}%` }} />
          </div>
        )}
      </div>
    );
  };

  // ── Answer options (shared renderer) ────────────────────────────────────
  const AnswerGrid = ({ onPick, revealCorrect }) => (
    <div className="grid grid-cols-1 gap-3">
      {activeQuestion?.options?.map((option, index) => {
        const color = ANSWER_COLORS[index % ANSWER_COLORS.length];
        const isSelected = selectedAnswer === index;
        const correctIdx = parseInt(activeQuestion.correctAnswer, 10);
        const isCorrect = index === correctIdx;
        const isHidden = hiddenOptions.includes(index);

        let btnClass = 'relative w-full rounded-2xl p-4 font-bold text-white text-lg transition-all duration-200 flex items-center gap-4 shadow-lg ';
        if (isHidden) {
          btnClass += 'bg-white/5 opacity-20 cursor-not-allowed scale-95';
        } else if (revealCorrect) {
          if (isCorrect) btnClass += 'bg-emerald-500 ring-4 ring-emerald-300 scale-[1.02]';
          else if (isSelected) btnClass += 'bg-rose-500 ring-4 ring-rose-300 opacity-80';
          else btnClass += 'bg-white/10 opacity-30';
        } else if (!canAnswerNow) {
          if (isSelected) btnClass += `${color.bg} ring-4 ${color.ring} scale-[1.02] shadow-2xl`;
          else btnClass += 'bg-white/10 opacity-40 cursor-not-allowed';
        } else {
          btnClass += `${color.bg} ${color.hover} hover:scale-[1.01] cursor-pointer active:scale-95`;
        }

        return (
          <button key={index}
            onClick={() => !isHidden && onPick(index)}
            disabled={!canAnswerNow || isHidden}
            className={btnClass}>
            <div className="w-11 h-11 rounded-xl bg-black/25 flex items-center justify-center text-xl font-black shrink-0">
              {isHidden ? '✂️' : color.shape}
            </div>
            <span className="flex-1 text-left leading-snug">{isHidden ? '' : option}</span>
            {isSelected && !revealCorrect && (
              <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center font-black text-sm shrink-0">✓</div>
            )}
            {revealCorrect && isCorrect && <div className="text-2xl shrink-0">✅</div>}
            {revealCorrect && isSelected && !isCorrect && <div className="text-2xl shrink-0">❌</div>}
          </button>
        );
      })}
    </div>
  );

  // ── Estimation input ────────────────────────────────────────────────────
  const EstimationInput = ({ onSubmit }) => (
    <div className="bg-white/5 border border-white/15 rounded-2xl p-5">
      <p className="text-center text-slate-300 font-semibold mb-3">
        🎯 Type your best guess{activeQuestion?.unit ? <span className="text-cyan-300"> ({activeQuestion.unit})</span> : ''} — closest wins!
      </p>
      <div className="flex gap-3">
        <input
          type="number"
          inputMode="decimal"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && guess !== '') onSubmit(guess); }}
          placeholder="Your number…"
          disabled={!canAnswerNow}
          className="flex-1 px-4 py-4 text-2xl text-center font-black bg-white/10 border-2 border-white/20 text-white placeholder-white/20 rounded-2xl focus:border-cyan-400 focus:outline-none disabled:opacity-50 tabular-nums"
        />
        <button
          onClick={() => onSubmit(guess)}
          disabled={!canAnswerNow || guess === ''}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 rounded-2xl font-black text-lg hover:brightness-110 transition disabled:opacity-40">
          Lock In
        </button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // MINIGAME: TAP FRENZY (synced modes, during results)
  // ══════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (minigameActive && minigame?.round !== minigameRoundRef.current) {
      minigameRoundRef.current = minigame.round;
      setTapCount(0);
      tapWriteRef.current = 0;
    }
  }, [minigameActive, minigame?.round]);

  const handleTap = () => {
    if (!minigameActive) return;
    const next = tapCount + 1;
    setTapCount(next);
    // Throttled write (every 5 taps or 400ms would need timers; count-based is simplest)
    if (next - tapWriteRef.current >= 3) {
      tapWriteRef.current = next;
      set(ref(database, `gameRooms/${roomCode}/minigame/taps/${playerInfo.playerId}`), next).catch(() => {});
    }
  };

  // Final flush when minigame ends
  useEffect(() => {
    if (!minigameActive && tapCount > 0 && tapWriteRef.current !== tapCount) {
      tapWriteRef.current = tapCount;
      set(ref(database, `gameRooms/${roomCode}/minigame/taps/${playerInfo.playerId}`), tapCount).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minigameActive]);

  if (!isRace && minigameActive) {
    const secondsLeft = Math.max(0, Math.ceil(((minigame.endsAt || 0) - Date.now()) / 1000));
    return (
      <div className={`${PAGE_BG} flex flex-col`}>
        <TopBar qNumber={Math.min(currentQuestionIndex + 1, totalQuestions)} qTotal={totalQuestions} showTimer={false} />
        <button
          onClick={handleTap}
          className="flex-1 flex flex-col items-center justify-center select-none active:bg-yellow-500/10 transition-colors"
        >
          <p className="text-yellow-300 font-black text-3xl mb-2 animate-pulse">⚡ TAP FRENZY ⚡</p>
          <p className="text-slate-300 font-semibold mb-8">Tap anywhere as fast as you can! ({secondsLeft}s)</p>
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-2xl border-8 border-yellow-300/40 active:scale-90 transition-transform">
            <span className="text-6xl font-black text-white tabular-nums">{tapCount}</span>
          </div>
          <p className="text-yellow-200/70 font-bold mt-8">Top 3 tappers win bonus points! 🏆</p>
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // RACE MODE RENDER
  // ══════════════════════════════════════════════════════════════════════
  if (isRace) {
    // Finished screen
    if (raceFinished) {
      const progress = gameData?.raceProgress || {};
      const finishers = Object.entries(progress)
        .filter(([, p]) => p?.finished && p?.finishedAt)
        .sort((a, b) => a[1].finishedAt - b[1].finishedAt);
      const myPosition = finishers.findIndex(([pid]) => pid === playerInfo?.playerId) + 1;
      const medal = myPosition === 1 ? '🥇' : myPosition === 2 ? '🥈' : myPosition === 3 ? '🥉' : '🏁';

      return (
        <div className={`${PAGE_BG} flex flex-col items-center justify-center p-6`}>
          <div className="text-center max-w-sm w-full">
            <div className="text-8xl mb-4 animate-bounce">{medal}</div>
            <h1 className="text-4xl font-black text-white mb-2">
              {myPosition === 1 ? 'RACE CHAMPION!' : myPosition > 0 ? `Finished ${myPosition}${myPosition === 2 ? 'nd' : myPosition === 3 ? 'rd' : 'th'}!` : 'Finished!'}
            </h1>
            <p className="text-cyan-300 font-semibold mb-6">You crossed the line — nice racing! 🏎️</p>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Your Score</p>
              <p className="text-5xl font-black text-white mb-3">{score.toLocaleString()}</p>
              <p className="text-emerald-300 font-bold">✔ {raceCorrect}/{totalQuestions} correct</p>
              {myPosition > 0 && myPosition <= 3 && (
                <p className="text-amber-300 font-bold mt-1">+{[1000, 600, 300][myPosition - 1]} finish bonus!</p>
              )}
            </div>
            <p className="text-slate-400 text-sm mb-4">Waiting for the other racers…</p>
            <ReactionBar roomCode={roomCode} playerInfo={playerInfo} compact />
          </div>
        </div>
      );
    }

    // Outcome flash
    if (raceFlash) {
      return (
        <div className={`${PAGE_BG} flex items-center justify-center p-6`}>
          <div className="text-center">
            {raceFlash.isCorrect ? (
              <>
                <div className="text-8xl mb-4 animate-bounce">🎉</div>
                <h1 className="text-4xl font-black text-emerald-300 mb-2">Correct!</h1>
                <p className="text-3xl font-black text-amber-300">+{raceFlash.points.toLocaleString()} pts</p>
                {streak > 1 && <p className="text-orange-300 font-bold mt-2">🔥 {streak} streak!</p>}
              </>
            ) : (
              <>
                <div className="text-8xl mb-4">{raceFlash.timedOut ? '⏱️' : '❌'}</div>
                <h1 className="text-4xl font-black text-rose-300 mb-2">{raceFlash.timedOut ? "Time's up!" : 'Not quite!'}</h1>
                <p className="text-slate-400 font-semibold">Keep racing — next question coming up!</p>
              </>
            )}
          </div>
        </div>
      );
    }

    if (!raceQuestion) {
      return (
        <div className={`${PAGE_BG} flex items-center justify-center`}>
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-semibold">Loading race…</p>
          </div>
        </div>
      );
    }

    // Active race question
    return (
      <div className={`${PAGE_BG} flex flex-col`}>
        <TopBar qNumber={raceIndex + 1} qTotal={totalQuestions} showTimer={true} />
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-5 gap-4">
          {/* Race progress */}
          <div className="flex items-center gap-2">
            <span className="text-lg">🏎️</span>
            <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(raceIndex / totalQuestions) * 100}%` }} />
            </div>
            <span className="text-xs font-black text-white/50">🏁</span>
          </div>

          {/* Question */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 shadow-2xl">
            <p className="text-cyan-300 text-xs font-black uppercase tracking-widest text-center mb-2">
              🏁 Quiz Race — go go go!
            </p>
            <h1 className="text-white font-black text-xl md:text-2xl text-center leading-snug">
              {raceQuestion.question}
            </h1>
            {raceQuestion.media?.url && (
              <div className="mt-3 flex justify-center">
                <img src={raceQuestion.media.url} alt="Question"
                  className="max-h-44 rounded-xl border-2 border-white/25 object-contain" />
              </div>
            )}
          </div>

          <PowerUpBar />

          {raceQuestion.type === 'estimation'
            ? <EstimationInput onSubmit={(g) => submitRaceAnswer(g)} />
            : <AnswerGrid onPick={(i) => submitRaceAnswer(i)} revealCorrect={false} />}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // SYNCED MODES RENDER
  // ══════════════════════════════════════════════════════════════════════

  // ── Eliminated spectator overlay state ───────────────────────────────────
  const spectating = isEliminated;

  // ── WAITING / SHOWING ────────────────────────────────────────────────────
  if (questionPhase === 'waiting' || questionPhase === 'showing') {
    return (
      <div className={`${PAGE_BG} flex flex-col items-center justify-center p-6`}>
        <div className="text-center w-full max-w-sm">
          <div className="text-8xl mb-6 animate-bounce">{spectating ? '👻' : modeInfo.icon}</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            {spectating ? 'Spectating…' : 'Get Ready!'}
          </h1>
          <p className="text-xl text-fuchsia-200 mb-1">
            Question {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
          </p>
          <p className="text-slate-400">
            {spectating ? 'You\'re out — but the show goes on!' : 'Question starting soon…'}
          </p>

          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <img src={playerInfo?.avatar?.image || '/avatars/Wizard F/Level 1.png'} alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-white/40" />
            <span className="text-white font-bold">{playerInfo?.name}</span>
            <span className="bg-amber-400 text-amber-950 text-sm font-black px-3 py-1 rounded-full">
              {score.toLocaleString()} pts
            </span>
          </div>

          {myTeam && (
            <p className="mt-4 font-black text-lg" style={{ color: myTeam.color }}>
              {myTeam.emoji} {myTeam.name}
            </p>
          )}

          {streak > 1 && !spectating && (
            <p className="mt-3 text-orange-300 font-black text-lg">🔥 {streak} answer streak — keep it alive!</p>
          )}

          <div className="mt-8">
            <ReactionBar roomCode={roomCode} playerInfo={playerInfo} compact />
          </div>
        </div>
      </div>
    );
  }

  // ── FINISHED (brief — parent flips to results screen) ────────────────────
  if (questionPhase === 'finished') {
    return (
      <div className={`${PAGE_BG} flex flex-col items-center justify-center p-6`}>
        <div className="text-center">
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-5xl font-black text-white mb-4">Game Over!</h1>
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl px-10 py-6 border border-white/20">
            <p className="text-amber-300 text-lg font-semibold mb-1">Your Final Score</p>
            <p className="text-6xl font-black text-white">{score.toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading question…</p>
        </div>
      </div>
    );
  }

  // ── ANSWERING / RESULTS ──────────────────────────────────────────────────
  const myResponse = gameData?.responses?.[currentQuestionIndex]?.[playerInfo?.playerId];
  const answeredCorrect = myResponse?.isCorrect;
  const wasShieldSaved = myResponse?.shieldSaved;
  const justEliminated = mode === 'elimination' && questionPhase === 'results' &&
    (!myResponse || (!answeredCorrect && !wasShieldSaved)) && !spectating;

  return (
    <div className={`${PAGE_BG} flex flex-col`}>
      <TopBar qNumber={currentQuestionIndex + 1} qTotal={totalQuestions} showTimer={questionPhase === 'answering' && !spectating} />

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-5 gap-4">
        {/* Spectator banner */}
        {spectating && (
          <div className="bg-slate-500/15 border border-slate-400/30 rounded-2xl py-2.5 px-4 text-center">
            <p className="text-slate-300 font-bold text-sm">👻 Spectator mode — cheer on the survivors!</p>
          </div>
        )}

        {/* Question card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 border border-white/20 shadow-2xl">
          <p className="text-fuchsia-300 text-xs font-black uppercase tracking-widest text-center mb-2">
            {modeInfo.icon} {gameData?.quiz?.title || 'Quiz Show'}
          </p>
          <h1 className="text-white font-black text-xl md:text-2xl text-center leading-snug">
            {currentQuestion.question}
          </h1>
          {currentQuestion.media?.url && (
            <div className="mt-3 flex justify-center">
              <img src={currentQuestion.media.url} alt="Question"
                className="max-h-44 rounded-xl border-2 border-white/25 object-contain" />
            </div>
          )}
        </div>

        {/* Power-ups */}
        {questionPhase === 'answering' && !spectating && <PowerUpBar />}

        {/* Answers / estimation */}
        {isEstimation ? (
          questionPhase === 'answering' && !spectating && !hasAnswered ? (
            <EstimationInput onSubmit={(g) => submitAnswer(g)} />
          ) : questionPhase === 'answering' && hasAnswered ? null : null
        ) : (
          !spectating || questionPhase === 'results' ? (
            <AnswerGrid
              onPick={(i) => submitAnswer(i)}
              revealCorrect={questionPhase === 'results'}
            />
          ) : null
        )}

        {/* Status strips */}
        {questionPhase === 'answering' && !spectating && !hasAnswered && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-3.5 px-5 text-center border border-white/20">
            <p className="text-white font-bold">
              {mode === 'elimination' ? '💀 Answer carefully — wrong means OUT!' : '⏰ Choose your answer!'}
            </p>
            <p className="text-fuchsia-300 text-sm mt-0.5">
              {doubleActive ? '💎 Double Points is ACTIVE!' : 'Faster answers earn more points'}
            </p>
          </div>
        )}

        {questionPhase === 'answering' && hasAnswered && (
          <div className="bg-emerald-500/15 backdrop-blur-sm rounded-2xl py-3.5 px-5 text-center border border-emerald-400/40">
            <p className="text-emerald-300 font-bold">✅ {isEstimation ? `Guess locked in: ${Number(guess || myResponse?.value || selectedAnswer).toLocaleString()}` : 'Answer locked in!'}</p>
            <p className="text-emerald-200/70 text-sm mt-0.5">Waiting for other players…</p>
          </div>
        )}

        {questionPhase === 'answering' && spectating && (
          <div className="text-center">
            <ReactionBar roomCode={roomCode} playerInfo={playerInfo} compact />
          </div>
        )}

        {/* Results strip */}
        {questionPhase === 'results' && (
          <div className={`rounded-2xl py-4 px-5 text-center border backdrop-blur-sm ${
            spectating
              ? 'bg-slate-500/15 border-slate-400/30'
              : justEliminated
                ? 'bg-rose-500/20 border-rose-400/50'
                : !myResponse
                  ? 'bg-slate-500/20 border-slate-400/40'
                  : answeredCorrect
                    ? 'bg-emerald-500/20 border-emerald-400/40'
                    : wasShieldSaved
                      ? 'bg-sky-500/20 border-sky-400/50'
                      : 'bg-rose-500/20 border-rose-400/40'
          }`}>
            {spectating ? (
              <p className="text-slate-300 font-bold text-lg">👻 {isEstimation ? `Answer: ${currentQuestion.answerValue?.toLocaleString()} ${currentQuestion.unit || ''}` : 'Watching from the sidelines…'}</p>
            ) : !myResponse ? (
              <>
                <p className="text-slate-300 font-black text-xl">⏱️ Time's up!</p>
                {justEliminated && <p className="text-rose-300 font-black text-lg mt-1">💀 You've been eliminated!</p>}
              </>
            ) : answeredCorrect ? (
              <>
                <p className="text-emerald-300 font-black text-2xl">🎉 Correct!</p>
                {isEstimation && (
                  <p className="text-white/80 text-sm mt-1">
                    Answer: <strong className="text-white">{currentQuestion.answerValue?.toLocaleString()} {currentQuestion.unit}</strong> · you guessed {Number(myResponse.value).toLocaleString()}
                  </p>
                )}
                {showPointsAnim && lastPoints !== null && (
                  <p className="text-amber-300 font-black text-3xl mt-1 animate-bounce">
                    +{lastPoints.toLocaleString()} pts{myResponse.usedDouble ? ' 💎' : ''}
                  </p>
                )}
                {(myResponse.streak || 0) > 1 && (
                  <p className="text-orange-300 font-bold mt-1">🔥 {myResponse.streak} in a row!</p>
                )}
              </>
            ) : wasShieldSaved ? (
              <>
                <p className="text-sky-300 font-black text-2xl">🛡️ Shield saved you!</p>
                <p className="text-sky-200/80 text-sm mt-1">Wrong answer — but you live to fight another round!</p>
              </>
            ) : (
              <>
                <p className="text-rose-300 font-black text-2xl">{justEliminated ? '💀 Eliminated!' : '❌ Incorrect'}</p>
                {isEstimation ? (
                  <p className="text-white/70 text-sm mt-1">
                    Answer: <strong className="text-white">{currentQuestion.answerValue?.toLocaleString()} {currentQuestion.unit}</strong>
                    {myResponse.value !== null && <> · you guessed {Number(myResponse.value).toLocaleString()}</>}
                  </p>
                ) : (
                  <p className="text-white/70 text-sm mt-1">
                    Correct answer: <strong className="text-white">{currentQuestion.options?.[parseInt(currentQuestion.correctAnswer, 10)]}</strong>
                  </p>
                )}
                {justEliminated && <p className="text-rose-200/80 text-sm mt-1">You can keep watching as a spectator 👻</p>}
              </>
            )}

            {!spectating && (
              <div className="mt-3 bg-white/10 rounded-xl px-4 py-2 inline-block">
                <p className="text-white font-bold">Total: {score.toLocaleString()} pts</p>
              </div>
            )}

            {/* Reactions between questions */}
            <div className="mt-4">
              <ReactionBar roomCode={roomCode} playerInfo={playerInfo} compact />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGameView;
