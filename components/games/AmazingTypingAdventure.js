import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const typingTracks = [
  {
    id: 'cosmic-sprint',
    name: 'Cosmic Sprint',
    difficulty: 'Explorer',
    timeLimit: 90,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    description: 'Ride neon constellations while you chase down shimmering sentences.',
    bonus: 'Earn bonus score for maintaining 98% accuracy or better.',
    pool: 'space'
  },
  {
    id: 'ocean-odyssey',
    name: 'Ocean Odyssey',
    difficulty: 'Navigator',
    timeLimit: 105,
    gradient: 'from-blue-500 via-cyan-500 to-emerald-500',
    description: 'Glide beneath glowing coral reefs and keep your rhythm with rolling waves.',
    bonus: 'Combo meter fills faster when you keep a steady pace.',
    pool: 'ocean'
  },
  {
    id: 'retro-rhythm',
    name: 'Retro Rhythm Rush',
    difficulty: 'Speedster',
    timeLimit: 75,
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    description: 'Step into an arcade skyline where every keystroke fires pixel fireworks.',
    bonus: 'Massive combo bonus for flawless streaks.',
    pool: 'arcade'
  },
  {
    id: 'skyline-surge',
    name: 'Skyline Surge',
    difficulty: 'Challenger',
    timeLimit: 85,
    gradient: 'from-sky-500 via-indigo-500 to-fuchsia-500',
    description: 'Drift between hover lanes above a cyber city while neon billboards flash your pace.',
    bonus: 'Extra points for steady pacing and maintaining high speed.',
    pool: 'city'
  },
  {
    id: 'crystal-caverns',
    name: 'Crystal Caverns',
    difficulty: 'Precisionist',
    timeLimit: 95,
    gradient: 'from-emerald-500 via-teal-500 to-lime-400',
    description: 'Navigate glowing caves where every keystroke echoes against sparkling walls.',
    bonus: 'Accuracy grants shield multipliers and protects your combo.',
    pool: 'cavern'
  }
];

const snippetBanks = {
  space: [
    'Starlight shimmers as rockets whisper across the cosmic highway.',
    'Orbiting satellites share secret songs about gravity and grace.',
    'Comets paint glittering tails while nebulae bloom like velvet gardens.',
    'Mission control cheers as explorers discover a brand new galaxy.',
    'Spacesuit boots bounce softly over pale moon dust and silent craters.',
    'The midnight sky hums with thrusters guiding pilots toward distant suns.'
  ],
  ocean: [
    'Crystal tides sparkle while dolphins spin through coral arches.',
    'Sea turtles glide past shipwrecks covered in shimmering treasure moss.',
    'A choir of whales echoes through the endless sapphire ballroom.',
    'Surfboards carve silver ribbons across the glowing sunrise waves.',
    'Octopus artists rearrange seashells into swirling spirals of colour.',
    'Tiny plankton pulse like fairy lights in the deep blue twilight.'
  ],
  arcade: [
    'Pixel racers drift around neon corners chasing the perfect combo streak.',
    'Synth beats thunder as laser grids pulse with rainbow electricity.',
    'Retro heroes dodge glitchy ghosts while collecting holographic coins.',
    'Joystick champions tap rapid rhythms to blast through shimmering portals.',
    'A shower of fireworks celebrates each flawless level up sequence.',
    'Press start lights blaze while cheering crowds chant for a new high score.'
  ],
  city: [
    'Hover cars weave between sky towers as holograms cheer every crisp keystroke.',
    'Neon trains glide across glass bridges while keyboards glow in sync.',
    'Billboards flash leaderboards above the skyline as you chase the next combo.',
    'Wind turbines hum softly while drones deliver snacks to the rooftop arcade.',
    'Laser trails sparkle behind bikes racing across sunset clouds.',
    'Street musicians sample your key taps into a soaring synth chorus.'
  ],
  cavern: [
    'Crystal shards ring like bells each time you land a perfect letter.',
    'Bioluminescent vines sway as your typing sends ripples through the cavern lake.',
    'Echoes of ancient explorers cheer you on from deep crystal chambers.',
    'Gemstone bridges gleam beneath your boots while you sprint through sentences.',
    'Soft moss quiets your steps as glowing bats trace patterns above.',
    'Silver waterfalls glitter beside hidden tunnels lined with runes.'
  ]
};

const floatingMotivators = [
  'Keep the rhythm! ⚡',
  'Precision unlocked! 🎯',
  'Combo rising! 🔥',
  'Laser focus! 🛸',
  'Ocean flow! 🌊',
  'Skyline streak! 🌆',
  'You are unstoppable! 🚀'
];

const initialStats = {
  score: 0,
  typedChars: 0,
  correctChars: 0,
  totalWords: 0,
  combo: 0,
  bestCombo: 0,
  flawlessRuns: 0,
  snippetHistory: []
};

const AmazingTypingAdventure = ({
  gameMode = 'digital',
  showToast = () => {},
  storageKeySuffix = 'shared',
  studentData,
  updateStudentData
}) => {
  const [phase, setPhase] = useState('menu'); // menu | countdown | playing | results
  const [selectedTrack, setSelectedTrack] = useState(typingTracks[0]);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(typingTracks[0].timeLimit);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [stats, setStats] = useState(initialStats);
  const [finalResults, setFinalResults] = useState(null);
  const [motivation, setMotivation] = useState(floatingMotivators[0]);
  const [feedback, setFeedback] = useState({ progress: 0, matches: 0, mistakes: 0, breakdown: [] });
  const [highScore, setHighScore] = useState(null);
  const [usedSnippets, setUsedSnippets] = useState([]);
  const [sessionStart, setSessionStart] = useState(null);
  const [snippetStart, setSnippetStart] = useState(null);

  const inputRef = useRef(null);
  const highScoreKeyRef = useRef('typing-hero-highscore');

  const modeLabel = useMemo(
    () => (gameMode === 'teacher' ? 'Classroom Broadcast Mode' : 'Solo Pilot Mode'),
    [gameMode]
  );

  const highScoreKey = useMemo(() => {
    const suffix = storageKeySuffix || 'shared';
    return `typing-hero-highscore-${suffix}`;
  }, [storageKeySuffix]);

  useEffect(() => {
    highScoreKeyRef.current = highScoreKey;
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(highScoreKey);
      if (stored) {
        try {
          setHighScore(JSON.parse(stored));
        } catch (error) {
          console.warn('Unable to parse typing game high score', error);
        }
      }
    }
  }, [highScoreKey]);

  const randomFromPool = useCallback((track) => {
    const pool = snippetBanks[track.pool] || snippetBanks.space;
    const available = pool.filter(snippet => !usedSnippets.includes(snippet));
    const candidatePool = available.length > 0 ? available : pool;
    const snippet = candidatePool[Math.floor(Math.random() * candidatePool.length)];
    setUsedSnippets(prev => {
      const limit = Math.min(pool.length, 6);
      const next = [...prev.filter(item => item !== snippet), snippet];
      return next.slice(-limit);
    });
    return {
      text: snippet,
      tip: track.bonus
    };
  }, [usedSnippets]);

  const resetStats = useCallback(() => {
    setStats(initialStats);
    setFeedback({ progress: 0, matches: 0, mistakes: 0, breakdown: [] });
    setFinalResults(null);
    setMotivation(floatingMotivators[Math.floor(Math.random() * floatingMotivators.length)]);
  }, []);

  const startCountdown = useCallback((track) => {
    resetStats();
    setSelectedTrack(track);
    setTimeLeft(track.timeLimit);
    setCountdown(3);
    const snippet = randomFromPool(track);
    setCurrentSnippet(snippet);
    setPhase('countdown');
  }, [randomFromPool, resetStats]);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) {
      setPhase('playing');
      setSessionStart(Date.now());
      setSnippetStart(Date.now());
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  const finishGame = useCallback(() => {
    setPhase('results');
    setInputValue('');
    const elapsedMinutes = sessionStart ? (Date.now() - sessionStart) / 60000 : 1;
    const accuracy = stats.typedChars > 0 ? Math.round((stats.correctChars / stats.typedChars) * 100) : 100;
    const wpm = elapsedMinutes > 0 ? Math.round(stats.totalWords / elapsedMinutes) : stats.totalWords;
    const finalScore = Math.max(0, Math.round(stats.score + accuracy * 5 + wpm * 3 + stats.bestCombo * 25));

    const results = {
      score: finalScore,
      accuracy,
      wpm,
      bestCombo: stats.bestCombo,
      flawlessRuns: stats.flawlessRuns,
      snippetsCompleted: stats.snippetHistory.length,
      snippetHistory: stats.snippetHistory
    };

    setFinalResults(results);

    if (!highScore || finalScore > highScore.score) {
      setHighScore(results);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(highScoreKeyRef.current, JSON.stringify(results));
      }
      showToast(`New typing legend! Score ${finalScore}`, 'success');
    }

    if (updateStudentData && studentData) {
      try {
        const rewards = { typingChampion: { score: finalScore, timestamp: Date.now() } };
        updateStudentData({
          ...studentData,
          achievements: {
            ...(studentData.achievements || {}),
            ...rewards
          }
        });
      } catch (error) {
        console.warn('Unable to update student typing achievements', error);
      }
    }
  }, [stats, highScore, showToast, sessionStart, updateStudentData, studentData]);

  const handleInputChange = useCallback((event) => {
    if (!currentSnippet || phase !== 'playing') return;
    const value = event.target.value;
    if (value.length > currentSnippet.text.length) return;

    setInputValue(value);

    const breakdown = currentSnippet.text.split('').map((char, index) => {
      const typed = value[index];
      if (typed === undefined) return 'pending';
      return typed === char ? 'correct' : 'wrong';
    });

    const matches = breakdown.filter(status => status === 'correct').length;
    const mistakes = value.length - matches;
    const progress = Math.min(100, Math.round((value.length / currentSnippet.text.length) * 100));

    setFeedback({ breakdown, matches, mistakes, progress });

    if (value.length === currentSnippet.text.length) {
      completeSnippet(mistakes);
    }
  }, [currentSnippet, phase]);

  const completeSnippet = useCallback((mistakes) => {
    if (!currentSnippet) return;
    const duration = snippetStart ? (Date.now() - snippetStart) / 1000 : 1;
    const words = currentSnippet.text.trim().split(/\s+/).length;
    const accuracy = Math.max(0, Math.round(((currentSnippet.text.length - mistakes) / currentSnippet.text.length) * 100));
    const snippetWpm = duration > 0 ? Math.round((words / duration) * 60) : words * 60;

    setStats(prev => {
      const newCombo = mistakes === 0 ? prev.combo + 1 : 0;
      const comboBonus = newCombo > 0 ? newCombo * 25 : 0;
      const timeBonus = Math.round(Math.max(0, (selectedTrack.timeLimit / Math.max(1, duration)) * 2));
      const baseScore = Math.round((accuracy / 100) * 150 + snippetWpm * 2);
      const penalty = mistakes * 10;

      return {
        score: Math.max(0, prev.score + baseScore + comboBonus + timeBonus - penalty),
        typedChars: prev.typedChars + currentSnippet.text.length,
        correctChars: prev.correctChars + currentSnippet.text.length - mistakes,
        totalWords: prev.totalWords + words,
        combo: newCombo,
        bestCombo: Math.max(prev.bestCombo, newCombo),
        flawlessRuns: prev.flawlessRuns + (mistakes === 0 ? 1 : 0),
        snippetHistory: [
          {
            id: prev.snippetHistory.length + 1,
            text: currentSnippet.text,
            accuracy,
            wpm: snippetWpm,
            mistakes,
            time: duration.toFixed(1)
          },
          ...prev.snippetHistory
        ].slice(0, 8)
      };
    });

    setFeedback({ progress: 0, matches: 0, mistakes: 0, breakdown: [] });
    setInputValue('');
    setSnippetStart(Date.now());

    const nextSnippet = randomFromPool(selectedTrack);
    setCurrentSnippet(nextSnippet);
    setMotivation(floatingMotivators[Math.floor(Math.random() * floatingMotivators.length)]);
  }, [currentSnippet, randomFromPool, selectedTrack, snippetStart]);

  const liveAccuracy = useMemo(() => {
    const typedTotal = stats.typedChars + inputValue.length;
    const correctTotal = stats.correctChars + (feedback.matches || 0);
    if (typedTotal === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((correctTotal / typedTotal) * 100)));
  }, [stats, feedback, inputValue.length]);

  const liveWpm = useMemo(() => {
    if (!sessionStart || phase === 'menu') return 0;
    const elapsedMinutes = (Date.now() - sessionStart) / 60000;
    if (elapsedMinutes <= 0) return 0;
    const wordsInProgress = inputValue.trim().length > 0 ? inputValue.trim().split(/\s+/).length : 0;
    return Math.max(0, Math.round((stats.totalWords + wordsInProgress) / elapsedMinutes));
  }, [stats.totalWords, inputValue, sessionStart, phase]);

  const progressGradient = useMemo(() => {
    if (!selectedTrack) return 'from-blue-500 to-purple-500';
    return selectedTrack.gradient;
  }, [selectedTrack]);

  const renderMenu = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <p className="uppercase tracking-[0.4em] text-xs text-white/60 mb-3">{modeLabel}</p>
        <h2 className="text-3xl font-black tracking-tight mb-2">⚡ Typing Legends Academy</h2>
        <p className="text-slate-200 text-base md:text-lg max-w-2xl">
          Choose a challenge track, charge up your boosters, and blast through immersive stories that train precision, rhythm,
          and blazing typing speed. Earn combos, unlock flawless streaks, and chase legendary high scores every day!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {typingTracks.map(track => (
          <button
            key={track.id}
            onClick={() => startCountdown(track)}
            className={`relative overflow-hidden rounded-2xl p-6 text-left shadow-lg transition transform hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br ${track.gradient}`}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_55%)]" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-white drop-shadow">{track.name}</h3>
                <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold text-white">
                  {track.difficulty}
                </span>
              </div>
              <p className="text-white/90 text-sm leading-relaxed">{track.description}</p>
              <div className="bg-black/20 rounded-xl p-3 text-white/80 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span>⏱️ Time Limit</span>
                  <strong>{track.timeLimit} seconds</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>🎁 Bonus</span>
                  <span className="text-white font-semibold">{track.bonus}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70">
                <span>Start Challenge</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {highScore && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
          <h3 className="text-xl font-bold text-indigo-700 mb-4">🏆 Personal Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-black text-indigo-600">{highScore.score}</div>
              <p className="text-sm text-slate-500">Score</p>
            </div>
            <div>
              <div className="text-3xl font-black text-emerald-600">{highScore.accuracy}%</div>
              <p className="text-sm text-slate-500">Accuracy</p>
            </div>
            <div>
              <div className="text-3xl font-black text-orange-500">{highScore.wpm}</div>
              <p className="text-sm text-slate-500">Words / min</p>
            </div>
            <div>
              <div className="text-3xl font-black text-pink-500">{highScore.bestCombo}</div>
              <p className="text-sm text-slate-500">Best Combo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderCountdown = () => (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white shadow-2xl p-10 md:p-16">
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,_rgba(255,255,255,0.25),_transparent_70%)]" />
      <div className="relative text-center space-y-6">
        <p className="uppercase tracking-[0.5em] text-white/70 text-sm">Launching in</p>
        <div className="text-7xl md:text-9xl font-black drop-shadow-lg animate-pulse">{countdown}</div>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
          Align your fingers on the home row, breathe deep, and get ready to glide through the {selectedTrack.name} challenge!
        </p>
      </div>
    </div>
  );

  const renderSnippet = () => {
    if (!currentSnippet) return null;
    return (
      <div className="rounded-2xl bg-slate-900 text-slate-100 p-6 md:p-8 shadow-inner border border-slate-700">
        <p className="uppercase text-xs tracking-[0.4em] text-slate-400 mb-4">Current Story Beat</p>
        <div className="text-lg md:text-2xl leading-relaxed font-medium">
          {currentSnippet.text.split('').map((char, index) => {
            const status = feedback.breakdown?.[index];
            const classes =
              status === 'correct'
                ? 'text-emerald-400'
                : status === 'wrong'
                  ? 'text-rose-400 underline decoration-rose-400'
                  : 'text-slate-200';
            return (
              <span key={`${char}-${index}`} className={`${classes} transition-colors duration-150`}>
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderHud = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 bg-white rounded-2xl p-4 shadow border border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">⏱️</span>
            <span>Time Left</span>
            <span className="text-lg text-slate-800 font-bold">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">⚡</span>
            <span>Score</span>
            <span className="text-lg text-indigo-600 font-black">{stats.score}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🎯</span>
            <span>Accuracy</span>
            <span className="text-lg text-emerald-600 font-black">{liveAccuracy}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">🚀</span>
            <span>Speed</span>
            <span className="text-lg text-orange-500 font-black">{liveWpm} wpm</span>
          </div>
        </div>
        <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${progressGradient} transition-all duration-300`}
            style={{ width: `${feedback.progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">Finish the sentence to boost your combo streak.</p>
      </div>
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-inner border border-slate-700">
        <p className="uppercase text-[10px] tracking-[0.4em] text-white/60 mb-1">Combo Meter</p>
        <div className="text-3xl font-black text-emerald-400">x{stats.combo}</div>
        <p className="text-sm text-white/80">Best: <span className="font-semibold text-amber-300">x{stats.bestCombo}</span></p>
        <p className="text-xs text-white/60 mt-2">{motivation}</p>
      </div>
    </div>
  );

  const renderInputArea = () => (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg border border-slate-100">
      <label className="text-xs uppercase tracking-[0.4em] text-slate-400">Type Here</label>
      <textarea
        ref={inputRef}
        rows={3}
        value={inputValue}
        onChange={handleInputChange}
        className="mt-2 w-full rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 p-4 text-lg font-semibold text-slate-800 tracking-wide bg-slate-50"
        placeholder="Stay on the home row and fly!"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>💡 Tip: {selectedTrack.bonus}</span>
        <span>✨ Flawless runs: <strong className="text-emerald-500">{stats.flawlessRuns}</strong></span>
        <span>📚 Snippets cleared: <strong className="text-indigo-500">{stats.snippetHistory.length}</strong></span>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-2xl p-4 md:p-6 shadow border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Recent Highlights</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Last {stats.snippetHistory.length} runs</span>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {stats.snippetHistory.length === 0 ? (
          <p className="text-sm text-slate-500">Complete your first snippet to see live analytics!</p>
        ) : (
          stats.snippetHistory.map(history => (
            <div key={history.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center">
                {history.wpm}
              </div>
              <div className="flex-1 px-3">
                <p className="text-sm font-semibold text-slate-700 truncate">{history.text}</p>
                <p className="text-xs text-slate-500">Accuracy {history.accuracy}% • {history.time}s</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${history.mistakes === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {history.mistakes === 0 ? 'Flawless!' : `-${history.mistakes} mistakes`}
                </p>
                <p className="text-xs text-slate-400">Combo {history.mistakes === 0 ? '+2' : '+0'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderResults = () => {
    if (!finalResults) return null;
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_rgba(255,255,255,0.35),_transparent_60%)]" />
          <div className="relative text-center space-y-4">
            <p className="uppercase tracking-[0.6em] text-white/70 text-xs">Challenge Complete</p>
            <h2 className="text-4xl md:text-5xl font-black">Legendary Run!</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              You cleared {finalResults.snippetsCompleted} story beats with {finalResults.accuracy}% accuracy at {finalResults.wpm} WPM.
              Keep training to push that combo streak even higher!
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Score</p>
              <div className="text-4xl font-black">{finalResults.score}</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Accuracy</p>
              <div className="text-4xl font-black">{finalResults.accuracy}%</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Speed</p>
              <div className="text-4xl font-black">{finalResults.wpm} WPM</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Best Combo</p>
              <div className="text-4xl font-black">x{finalResults.bestCombo}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Performance Timeline</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
              {finalResults.snippetHistory.length === 0 ? (
                <p className="text-sm text-slate-500">No snippets recorded. Try another run!</p>
              ) : (
                finalResults.snippetHistory.map(history => (
                  <div key={`result-${history.id}`} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex-1 pr-3">
                      <p className="text-sm font-semibold text-slate-700 truncate">{history.text}</p>
                      <p className="text-xs text-slate-500">{history.time}s • {history.wpm} WPM</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${history.mistakes === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {history.accuracy}% accuracy
                      </p>
                      <p className="text-xs text-slate-400">Mistakes: {history.mistakes}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-slate-100 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Next Goals</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li>• Keep accuracy above 97% for three runs in a row.</li>
                <li>• Push your combo streak past x{Math.max(finalResults.bestCombo + 1, 5)}.</li>
                <li>• Beat your WPM by +{Math.max(5, Math.round(finalResults.wpm * 0.15))} on the next attempt.</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl p-4">
              <h4 className="text-sm uppercase tracking-[0.3em] text-white/70">Coach Tip</h4>
              <p className="text-sm mt-1">
                Relax your shoulders, hover over the home row, and let every finger pull its own weight. Smooth, steady typing is faster than frantic typing!
              </p>
            </div>
            {highScore && (
              <div className="text-sm text-slate-500">
                Personal Best: <span className="font-semibold text-indigo-600">{highScore.score}</span> points • {highScore.wpm} WPM
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => startCountdown(selectedTrack)}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700"
          >
            Replay {selectedTrack.name}
          </button>
          <button
            onClick={() => setPhase('menu')}
            className="px-6 py-3 rounded-xl bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300"
          >
            Choose Another Track
          </button>
        </div>
      </div>
    );
  };

  if (phase === 'menu') {
    return renderMenu();
  }

  if (phase === 'countdown') {
    return renderCountdown();
  }

  if (phase === 'results') {
    return renderResults();
  }

  return (
    <div className="space-y-6">
      {renderHud()}
      {renderSnippet()}
      {renderInputArea()}
      {renderHistory()}
      <div className="flex justify-center">
        <button
          onClick={() => {
            finishGame();
          }}
          className="px-5 py-2 rounded-xl bg-rose-500 text-white font-semibold shadow hover:bg-rose-600"
        >
          End Run Early
        </button>
      </div>
    </div>
  );
};

export default AmazingTypingAdventure;
