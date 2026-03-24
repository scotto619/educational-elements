import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MIN_TARGET_SECONDS = 3;
const MAX_TARGET_SECONDS = 10;
const SCOREBOARD_SIZE = 5;
const CLASS_LEADERBOARD_SIZE = 7;

const GAUGE_RADIUS = 120;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const getStudentIdentifier = (student) =>
  student?.id ||
  student?.studentId ||
  student?.uid ||
  student?.userId ||
  student?.email ||
  null;

const parseNumber = (value) => {
  if (value == null) return null;
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStoredAttempt = (attempt, index) => {
  if (!attempt) return null;

  const elapsedMillis =
    parseNumber(attempt.elapsedMillis) ??
    (parseNumber(attempt.elapsedSeconds) != null
      ? parseNumber(attempt.elapsedSeconds) * 1000
      : null);

  const differenceSeconds =
    parseNumber(attempt.differenceSeconds) ??
    (parseNumber(attempt.differenceMillis) != null
      ? parseNumber(attempt.differenceMillis) / 1000
      : null);

  const targetSeconds =
    parseNumber(attempt.targetSeconds) ??
    (parseNumber(attempt.targetMillis) != null
      ? parseNumber(attempt.targetMillis) / 1000
      : null);

  if (
    !Number.isFinite(elapsedMillis) ||
    !Number.isFinite(differenceSeconds) ||
    !Number.isFinite(targetSeconds)
  ) {
    return null;
  }

  return {
    id: attempt.id || attempt.key || `stored-attempt-${index}`,
    elapsedMillis,
    differenceSeconds,
    targetSeconds,
    createdAt: attempt.createdAt || attempt.timestamp || null
  };
};

const formatTimestamp = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
};

const generateTargetSeconds = () => {
  const random = Math.random() * (MAX_TARGET_SECONDS - MIN_TARGET_SECONDS) + MIN_TARGET_SECONDS;
  return parseFloat(random.toFixed(3));
};

const formatMillis = (milliseconds) => {
  const ms = Math.max(0, milliseconds);
  const totalSeconds = ms / 1000;
  const wholeSeconds = Math.floor(totalSeconds);
  const milliPart = Math.floor(ms % 1000);
  return `${wholeSeconds.toString().padStart(2, '0')}.${milliPart.toString().padStart(3, '0')}s`;
};

const formatSeconds = (seconds) => {
  const wholeSeconds = Math.floor(seconds);
  const milliPart = Math.round((seconds - wholeSeconds) * 1000);
  return `${wholeSeconds.toString().padStart(2, '0')}.${milliPart.toString().padStart(3, '0')}s`;
};

const getAccuracyGrade = (differenceSeconds) => {
  if (differenceSeconds < 0.05) return { label: 'INHUMAN', color: 'text-fuchsia-400', bgColor: 'from-fuchsia-600/30 to-purple-600/30', borderColor: 'border-fuchsia-500/50', ring: 'ring-fuchsia-400', emoji: '🤯' };
  if (differenceSeconds < 0.15) return { label: 'PERFECT', color: 'text-emerald-400', bgColor: 'from-emerald-600/30 to-teal-600/30', borderColor: 'border-emerald-500/50', ring: 'ring-emerald-400', emoji: '🎯' };
  if (differenceSeconds < 0.3) return { label: 'EXCELLENT', color: 'text-blue-400', bgColor: 'from-blue-600/30 to-cyan-600/30', borderColor: 'border-blue-500/50', ring: 'ring-blue-400', emoji: '🔥' };
  if (differenceSeconds < 0.5) return { label: 'GREAT', color: 'text-cyan-400', bgColor: 'from-cyan-600/30 to-sky-600/30', borderColor: 'border-cyan-500/50', ring: 'ring-cyan-400', emoji: '⚡' };
  if (differenceSeconds < 1.0) return { label: 'GOOD', color: 'text-yellow-400', bgColor: 'from-yellow-600/30 to-amber-600/30', borderColor: 'border-yellow-500/50', ring: 'ring-yellow-400', emoji: '👍' };
  if (differenceSeconds < 2.0) return { label: 'OK', color: 'text-orange-400', bgColor: 'from-orange-600/30 to-red-600/30', borderColor: 'border-orange-500/50', ring: 'ring-orange-400', emoji: '😬' };
  return { label: 'MISS', color: 'text-red-400', bgColor: 'from-red-600/30 to-rose-600/30', borderColor: 'border-red-500/50', ring: 'ring-red-400', emoji: '💀' };
};

const getRankEmoji = (index) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return `#${index + 1}`;
};

const PrecisionTimerGame = ({
  studentData,
  updateStudentData,
  showToast = () => {},
  classmates = []
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMillis, setElapsedMillis] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(() => generateTargetSeconds());
  const [scoreboard, setScoreboard] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  const bestAttempt = useMemo(() => (scoreboard.length ? scoreboard[0] : null), [scoreboard]);

  useEffect(() => {
    const saved = studentData?.gameProgress?.precisionTimer;

    if (!saved) {
      setScoreboard([]);
      setAttemptCount(0);
      setLastSavedAt(null);
      return;
    }

    const normalizedAttempts = Array.isArray(saved.scoreboard)
      ? saved.scoreboard
          .map((entry, index) => normalizeStoredAttempt(entry, index))
          .filter(Boolean)
          .sort((a, b) => a.differenceSeconds - b.differenceSeconds)
          .slice(0, SCOREBOARD_SIZE)
      : [];

    setScoreboard(normalizedAttempts);
    setAttemptCount(saved.attemptCount || normalizedAttempts.length || 0);

    if (saved.lastPlayed) {
      const timestamp = new Date(saved.lastPlayed);
      if (!Number.isNaN(timestamp.getTime())) {
        setLastSavedAt(timestamp);
      }
    } else if (normalizedAttempts[0]?.createdAt) {
      const fallbackTimestamp = new Date(normalizedAttempts[0].createdAt);
      if (!Number.isNaN(fallbackTimestamp.getTime())) {
        setLastSavedAt(fallbackTimestamp);
      }
    }
  }, [studentData?.gameProgress?.precisionTimer]);

  useEffect(() => {
    if (!isRunning) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return undefined;
    }

    const updateTimer = () => {
      if (!startTimeRef.current) return;
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      setElapsedMillis(elapsed);
      rafRef.current = requestAnimationFrame(updateTimer);
    };

    rafRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning]);

  const persistProgress = useCallback(
    async (nextScoreboard, totalAttempts) => {
      if (!updateStudentData || !studentData) {
        return;
      }

      const sanitizedScoreboard = nextScoreboard.map((entry, index) => ({
        id: entry.id || `attempt-${index}`,
        elapsedMillis: Math.round(entry.elapsedMillis),
        differenceSeconds: Number(entry.differenceSeconds.toFixed(6)),
        targetSeconds: Number(entry.targetSeconds.toFixed(3)),
        createdAt: entry.createdAt || new Date().toISOString()
      }));

      const bestEntry = sanitizedScoreboard[0] || null;

      const payload = {
        scoreboard: sanitizedScoreboard,
        bestDifference: bestEntry ? bestEntry.differenceSeconds : null,
        bestElapsedMillis: bestEntry ? bestEntry.elapsedMillis : null,
        bestTargetSeconds: bestEntry ? bestEntry.targetSeconds : null,
        attemptCount: totalAttempts,
        lastPlayed: new Date().toISOString()
      };

      try {
        setIsSaving(true);
        await updateStudentData({
          gameProgress: {
            ...(studentData.gameProgress || {}),
            precisionTimer: payload
          }
        });
        setLastSavedAt(new Date(payload.lastPlayed));
      } catch (error) {
        console.error('Failed to save Precision Timer progress:', error);
        showToast('Could not save your progress.', 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [studentData, updateStudentData, showToast]
  );

  const startTimer = () => {
    setElapsedMillis(0);
    setLastResult(null);
    startTimeRef.current = performance.now();
    setIsRunning(true);
  };

  const stopTimer = () => {
    if (!isRunning) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const now = performance.now();
    const elapsed = now - (startTimeRef.current || now);
    setElapsedMillis(elapsed);
    setIsRunning(false);

    const elapsedSeconds = elapsed / 1000;
    const difference = Math.abs(elapsedSeconds - targetSeconds);

    const attempt = {
      id: `${Date.now()}-${Math.random()}`,
      elapsedMillis: elapsed,
      differenceSeconds: difference,
      targetSeconds,
      createdAt: new Date().toISOString()
    };

    const previousBestDifference = scoreboard.length ? scoreboard[0].differenceSeconds : null;
    const newScoreboard = [...scoreboard, attempt]
      .sort((a, b) => a.differenceSeconds - b.differenceSeconds)
      .slice(0, SCOREBOARD_SIZE);

    const nextAttemptCount = attemptCount + 1;

    setScoreboard(newScoreboard);
    setAttemptCount(nextAttemptCount);

    if (
      previousBestDifference == null ||
      difference < previousBestDifference - 0.0000005
    ) {
      showToast('New personal best! 🔥', 'success');
    }

    setLastResult({
      elapsedSeconds,
      differenceSeconds: difference,
      targetSeconds,
      grade: getAccuracyGrade(difference)
    });

    setTargetSeconds(generateTargetSeconds());
    startTimeRef.current = null;

    persistProgress(newScoreboard, nextAttemptCount);
  };

  const resetGame = () => {
    setIsRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setElapsedMillis(0);
    setTargetSeconds(generateTargetSeconds());
    setLastResult(null);
    startTimeRef.current = null;
  };

  const classLeaderboard = useMemo(() => {
    const roster = Array.isArray(classmates) ? classmates : [];
    const entriesMap = new Map();

    roster.forEach((student) => {
      const identifier = getStudentIdentifier(student);
      if (!identifier) return;
      entriesMap.set(identifier, student);
    });

    if (studentData) {
      const identifier = getStudentIdentifier(studentData);
      if (identifier) {
        entriesMap.set(identifier, { ...entriesMap.get(identifier), ...studentData });
      }
    }

    const entries = Array.from(entriesMap.entries())
      .map(([identifier, student]) => {
        if (!student) return null;

        const progress =
          studentData && identifier === getStudentIdentifier(studentData)
            ? {
                scoreboard,
                bestDifference:
                  scoreboard[0]?.differenceSeconds ??
                  studentData?.gameProgress?.precisionTimer?.bestDifference ??
                  null,
                attemptCount
              }
            : student.gameProgress?.precisionTimer;

        if (!progress) return null;

        const attempts = Array.isArray(progress.scoreboard)
          ? progress.scoreboard
              .map((entry, index) => normalizeStoredAttempt(entry, index))
              .filter(Boolean)
              .sort((a, b) => a.differenceSeconds - b.differenceSeconds)
          : [];

        const bestEntry = attempts[0] || null;
        const bestDifference =
          (typeof progress.bestDifference === 'number' && Number.isFinite(progress.bestDifference)
            ? progress.bestDifference
            : bestEntry?.differenceSeconds) ?? null;

        if (bestDifference == null) return null;

        const name = [student.firstName, student.lastName ? `${student.lastName[0]}.` : null]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Student';

        return {
          id: identifier,
          name,
          bestDifference,
          bestEntry,
          attemptCount: progress.attemptCount || attempts.length || 0,
          lastPlayed: progress.lastPlayed || bestEntry?.createdAt || null,
          isCurrent: studentData && identifier === getStudentIdentifier(studentData)
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.bestDifference - b.bestDifference)
      .slice(0, CLASS_LEADERBOARD_SIZE);

    return entries;
  }, [classmates, studentData, scoreboard, attemptCount]);

  // Calculate gauge progress
  const elapsedSec = elapsedMillis / 1000;
  const progress = Math.min(elapsedSec / (targetSeconds * 1.5), 1); // Cap at 150% of target for visual
  const strokeOffset = GAUGE_CIRCUMFERENCE - progress * GAUGE_CIRCUMFERENCE;
  
  // Color based on proximity to target
  const getGaugeColor = () => {
    const ratio = elapsedSec / targetSeconds;
    if (ratio < 0.7) return '#22d3ee'; // cyan
    if (ratio < 0.9) return '#34d399'; // emerald
    if (ratio < 1.05) return '#a3e635'; // lime (sweet spot!)
    if (ratio < 1.15) return '#fbbf24'; // amber
    return '#ef4444'; // red (overshot)
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Game Area */}
      <div className="flex-1">
        <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[500px] border border-slate-800 overflow-hidden">
          
          {/* Background Pulse when running */}
          {isRunning && (
            <motion.div 
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-emerald-500 pointer-events-none"
            />
          )}

          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* Target Time Badge */}
          <motion.div 
            key={targetSeconds}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 mb-6"
          >
            <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-full px-6 py-2 flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400 font-bold">Target</span>
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-wider">{formatSeconds(targetSeconds)}</span>
            </div>
          </motion.div>

          {/* Circular Gauge */}
          <div className="relative z-10 w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] flex items-center justify-center mb-6">
            {/* SVG Ring */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 280 280">
              {/* Background Ring */}
              <circle
                cx="140" cy="140" r={GAUGE_RADIUS}
                fill="none"
                stroke="rgba(148,163,184,0.1)"
                strokeWidth="8"
              />
              {/* Target marker */}
              <circle
                cx="140" cy="140" r={GAUGE_RADIUS}
                fill="none"
                stroke="rgba(52,211,153,0.2)"
                strokeWidth="8"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                strokeDashoffset={GAUGE_CIRCUMFERENCE - (1 / 1.5) * GAUGE_CIRCUMFERENCE}
                strokeLinecap="round"
              />
              {/* Progress Ring */}
              <motion.circle
                cx="140" cy="140" r={GAUGE_RADIUS}
                fill="none"
                stroke={isRunning ? getGaugeColor() : (lastResult ? getAccuracyGrade(lastResult.differenceSeconds).color.replace('text-', '').includes('emerald') ? '#34d399' : '#94a3b8' : '#94a3b8')}
                strokeWidth="10"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                strokeDashoffset={isRunning ? strokeOffset : (lastResult ? GAUGE_CIRCUMFERENCE - (Math.min(lastResult.elapsedSeconds / (lastResult.targetSeconds * 1.5), 1)) * GAUGE_CIRCUMFERENCE : GAUGE_CIRCUMFERENCE)}
                strokeLinecap="round"
                style={{ filter: isRunning ? `drop-shadow(0 0 8px ${getGaugeColor()})` : 'none' }}
                transition={{ duration: 0.05 }}
              />
            </svg>

            {/* Center Content */}
            <div className="relative flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {lastResult && !isRunning ? (
                  <motion.div
                    key="result"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-4xl mb-1">{lastResult.grade.emoji}</span>
                    <span className={`text-lg font-black tracking-widest ${lastResult.grade.color}`}>{lastResult.grade.label}</span>
                    <span className="font-mono text-3xl sm:text-4xl text-white font-bold mt-1">
                      {formatMillis(lastResult.elapsedSeconds * 1000)}
                    </span>
                    <span className="text-xs text-slate-400 mt-2 font-mono">
                      Δ {formatMillis(lastResult.differenceSeconds * 1000)}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="timer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-500 mb-2 font-bold">Elapsed</span>
                    <motion.span 
                      className={`font-mono text-4xl sm:text-5xl font-black ${isRunning ? 'text-cyan-400' : 'text-slate-500'}`}
                      style={isRunning ? { textShadow: '0 0 20px rgba(34,211,238,0.5)' } : {}}
                    >
                      {formatMillis(elapsedMillis)}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 flex flex-wrap gap-4 justify-center">
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={startTimer}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/20 tracking-wider transition-all"
              >
                {lastResult ? 'TRY AGAIN' : 'START'}
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 30px rgba(239,68,68,0.6)', '0 0 0px rgba(239,68,68,0)'] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                type="button"
                onClick={stopTimer}
                className="px-12 py-5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xl tracking-[0.2em] shadow-lg shadow-red-500/30"
              >
                STOP!
              </motion.button>
            )}
            {(lastResult || elapsedMillis > 0) && !isRunning && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                type="button"
                onClick={resetGame}
                className="px-6 py-4 rounded-2xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all font-semibold"
              >
                New Target
              </motion.button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="relative z-10 mt-8 flex items-center gap-6 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <span>Attempts: <span className="text-slate-300">{attemptCount}</span></span>
            {bestAttempt && <span>Best: <span className="text-emerald-400">{formatMillis(bestAttempt.differenceSeconds * 1000)}</span></span>}
            {isSaving && <span className="text-amber-400 animate-pulse">Saving...</span>}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Personal Scoreboard */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black tracking-wider flex items-center gap-2 text-emerald-400">
              <span>🏆</span> Your Best
            </h2>
            {bestAttempt && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  Δ{formatMillis(bestAttempt.differenceSeconds * 1000)}
                </span>
              </div>
            )}
          </div>

          {scoreboard.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⏱️</div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Stop the timer as close to the target as you can!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {scoreboard.map((entry, index) => {
                const grade = getAccuracyGrade(entry.differenceSeconds);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-xl p-3 border transition-all bg-gradient-to-r ${grade.bgColor} ${grade.borderColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getRankEmoji(index)}</span>
                        <div>
                          <div className="font-mono text-lg text-white font-bold">
                            {formatMillis(entry.elapsedMillis)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Target: {formatSeconds(entry.targetSeconds)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold font-mono ${grade.color}`}>
                          Δ{formatMillis(entry.differenceSeconds * 1000)}
                        </div>
                        <div className={`text-[10px] font-black tracking-widest ${grade.color}`}>
                          {grade.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Class Leaderboard */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl shadow-xl border border-slate-800 overflow-hidden">
          <button 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <h2 className="text-lg font-black tracking-wider flex items-center gap-2 text-blue-400">
              <span>🧮</span> Class Leaderboard
            </h2>
            <motion.span 
              animate={{ rotate: showLeaderboard ? 180 : 0 }}
              className="text-slate-400 text-xl"
            >
              ▾
            </motion.span>
          </button>

          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  {classLeaderboard.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">
                      No class scores yet. Be the first!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {classLeaderboard.map((entry, index) => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-xl p-3 border transition-all ${
                            entry.isCurrent
                              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/40 ring-1 ring-blue-500/30'
                              : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold w-8 text-center">{getRankEmoji(index)}</span>
                              <div>
                                <div className="font-semibold text-sm text-white">
                                  {entry.name}
                                  {entry.isCurrent && <span className="text-xs text-blue-400 ml-2 font-mono">(You)</span>}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">
                                  {entry.attemptCount} attempt{entry.attemptCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className={`text-sm font-bold font-mono ${getAccuracyGrade(entry.bestDifference).color}`}>
                              Δ{formatMillis(entry.bestDifference * 1000)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PrecisionTimerGame;
