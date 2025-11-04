import React, { useEffect, useMemo, useRef, useState } from 'react';

const MIN_TARGET_SECONDS = 3;
const MAX_TARGET_SECONDS = 10;
const SCOREBOARD_SIZE = 5;

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

const PrecisionTimerGame = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMillis, setElapsedMillis] = useState(0);
  const [targetSeconds, setTargetSeconds] = useState(() => generateTargetSeconds());
  const [scoreboard, setScoreboard] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const startTimeRef = useRef(null);
  const rafRef = useRef(null);

  const bestAttempt = useMemo(() => (scoreboard.length ? scoreboard[0] : null), [scoreboard]);

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

  const startTimer = () => {
    setElapsedMillis(0);
    setLastResult(null);
    startTimeRef.current = performance.now();
    setIsRunning(true);
  };

  const stopTimer = () => {
    if (!isRunning) {
      return;
    }

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
      targetSeconds
    };

    setScoreboard((previous) => {
      const combined = [...previous, attempt].sort((a, b) => a.differenceSeconds - b.differenceSeconds);
      return combined.slice(0, SCOREBOARD_SIZE);
    });

    setLastResult({
      elapsedSeconds,
      differenceSeconds: difference,
      targetSeconds
    });

    setTargetSeconds(generateTargetSeconds());
    startTimeRef.current = null;
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

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <div className="bg-black text-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[360px]">
          <div className="text-sm uppercase tracking-[0.4em] text-gray-400 mb-3">Target Time</div>
          <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-6">{formatSeconds(targetSeconds)}</div>

          <div className="w-full max-w-md bg-gray-900/70 rounded-2xl py-10 px-4 sm:px-6 text-center border border-gray-800 shadow-inner">
            <div className="text-xs uppercase tracking-[0.35em] text-gray-500 mb-2">Current Timer</div>
            <div className="font-mono text-5xl sm:text-6xl md:text-7xl text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]">
              {formatMillis(elapsedMillis)}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            {!isRunning ? (
              <button
                type="button"
                onClick={startTimer}
                className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Start Timer
              </button>
            ) : (
              <button
                type="button"
                onClick={stopTimer}
                className="px-8 py-3 rounded-full bg-red-500 hover:bg-red-400 text-white font-semibold shadow-lg animate-pulse"
              >
                Stop!
              </button>
            )}
            <button
              type="button"
              onClick={resetGame}
              className="px-6 py-3 rounded-full border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition"
            >
              Reset
            </button>
          </div>

          {lastResult && (
            <div className="mt-8 w-full max-w-md bg-gray-900/80 rounded-2xl p-5 border border-gray-800 text-center">
              <div className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Last Attempt</div>
              <div className="text-lg text-gray-200">
                You stopped at{' '}
                <span className="text-emerald-400 font-semibold">{formatMillis(lastResult.elapsedSeconds * 1000)}</span>
              </div>
              <div className="mt-2 text-base">
                Off by{' '}
                <span className="font-semibold text-red-400">
                  {formatMillis(lastResult.differenceSeconds * 1000)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-80">
        <div className="bg-gray-900 text-white rounded-3xl shadow-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              🏆 Closest Times
            </h2>
            {bestAttempt && (
              <span className="text-xs uppercase tracking-widest text-emerald-300">
                Best: {formatMillis(bestAttempt.differenceSeconds * 1000)}
              </span>
            )}
          </div>

          {scoreboard.length === 0 ? (
            <p className="text-gray-400 text-sm">
              Start playing to see your best attempts here! Try to stop the timer as close to the target as possible.
            </p>
          ) : (
            <ol className="space-y-3">
              {scoreboard.map((entry, index) => (
                <li
                  key={entry.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    index === 0
                      ? 'bg-emerald-500/10 border-emerald-400/40 shadow-lg shadow-emerald-500/10'
                      : 'bg-gray-900 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span className="font-semibold text-white">Attempt {index + 1}</span>
                    <span className="text-gray-400">Target {formatSeconds(entry.targetSeconds)}</span>
                  </div>
                  <div className="mt-2 flex items-end justify-between">
                    <div className="text-2xl font-mono text-emerald-300">
                      {formatMillis(entry.elapsedMillis)}
                    </div>
                    <div className="text-sm text-red-300 font-semibold">
                      Δ {formatMillis(entry.differenceSeconds * 1000)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrecisionTimerGame;
