// components/games/MathGrandPrixGame.js — Math Grand Prix 🏎️
// A mental-math kart race! In SOLO mode three AI karts cruise toward the finish
// line; in MULTIPLAYER mode up to 8 classmates race each other live over
// Firebase Realtime Database (same room-code pattern as Sketch & Guess).
// Every correct answer gives a burst of acceleration, every 3rd in a row
// triggers a TURBO, and a wrong answer means a spin-out (plus you get shown
// the right answer to learn from). Integrates with the Math Mentals program —
// solo mode uses the student's assigned Math Mentals level when available.
//
// Firebase layout: mathGrandPrixRooms/{CODE}
//   roomCode, phase: lobby | racing | finished
//   hostId, level (1-4), startAt (ms timestamp), createdAt
//   players/{id}: { id, name, emoji, pos, correct, streak, joinTime,
//                   finishedAt|null, isHost }
'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MATH_SUBLEVELS, generateQuestion } from '../student/StudentMathMentals';

// ── Tuning ───────────────────────────────────────────────────────────────────
const TRACK_LEN = 100;          // units to the finish line
const CORRECT_BOOST = 7;        // units per correct answer
const TURBO_BONUS = 4;          // extra units on every 3rd consecutive correct
const IDLE_CRAWL = 1.1;         // units/s the player creeps forward (solo only)
const SPIN_OUT_TIME = 2.2;      // seconds frozen after a wrong answer
const AI_FINISH_TIMES = [72, 88, 104]; // target seconds for the 3 AI karts
const REWARD_COINS = 5;
const REWARD_MIN_CORRECT = 10;  // must also answer 10+ correctly to earn coins
const BEST_KEY = 'mathGrandPrixBestScore';
const MP_COUNTDOWN_MS = 4000;   // synced countdown before a multiplayer race
const MAX_PLAYERS = 8;

const AI_KARTS = [
  { emoji: '🚙', name: 'Turbo Tia', color: 'text-blue-500' },
  { emoji: '🚗', name: 'Racing Rex', color: 'text-red-500' },
  { emoji: '🛻', name: 'Zoomer Zed', color: 'text-green-500' },
];
const MEDALS = ['🥇', '🥈', '🥉'];
const PLAYER_KARTS = ['🏎️', '🚓', '🚕', '🚌', '🚑', '🚒', '🚜', '🛵'];
const rand = (min, max) => min + Math.random() * (max - min);

const generateRoomCode = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
};

// ── Tiny WebAudio synth ───────────────────────────────────────────────────────
function createSynth(mutedRef) {
  let ctx = null;
  const ensure = () => {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { ctx = null; }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  };
  const tone = (freq, dur, type = 'sine', vol = 0.1, when = 0, slide = 0) => {
    if (mutedRef.current) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };
  return {
    beep: () => tone(440, 0.18, 'square', 0.09),
    go: () => tone(880, 0.4, 'square', 0.1),
    correct: () => { tone(660, 0.08, 'sine', 0.09); tone(990, 0.12, 'sine', 0.09, 0.07); },
    turbo: () => { tone(300, 0.3, 'sawtooth', 0.09, 0, 700); tone(1200, 0.15, 'square', 0.06, 0.18); },
    wrong: () => { tone(200, 0.2, 'sawtooth', 0.1, 0, -80); tone(140, 0.3, 'sawtooth', 0.09, 0.14, -50); },
    finish: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, 'sine', 0.1, i * 0.11)); },
    lose: () => { [400, 300, 220].forEach((f, i) => tone(f, 0.25, 'triangle', 0.09, i * 0.2)); },
    join: () => { tone(520, 0.1, 'sine', 0.08); tone(780, 0.12, 'sine', 0.08, 0.09); },
    reward: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.09, i * 0.1)); },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const MathGrandPrixGame = ({ studentData, updateStudentData, showToast, classData }) => {
  // screens: menu | countdown | racing | finished (solo)
  //          mpHome | mpLobby | mpRace (multiplayer)
  const [screen, setScreen] = useState('menu');
  const [modeName, setModeName] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [positions, setPositions] = useState([0, 0, 0, 0]); // solo: [player, ai1, ai2, ai3]
  const [question, setQuestion] = useState(null);
  const [typed, setTyped] = useState('');
  const [spinOut, setSpinOut] = useState(false);
  const [turboFlash, setTurboFlash] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [place, setPlace] = useState(null);
  const [raceTime, setRaceTime] = useState(0);
  const [missed, setMissed] = useState([]);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  // multiplayer state
  const [fb, setFb] = useState(null);
  const [mpName, setMpName] = useState(studentData?.firstName || studentData?.name || '');
  const [mpCodeInput, setMpCodeInput] = useState('');
  const [mpRoomCode, setMpRoomCode] = useState('');
  const [mpRoom, setMpRoom] = useState(null);
  const [mpLevel, setMpLevel] = useState(2);
  const [mpMsg, setMpMsg] = useState('');
  const [now, setNow] = useState(Date.now());
  const [myId] = useState(() =>
    studentData?.id ? `s_${studentData.id}` : `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);

  const mutedRef = useRef(false);
  const synthRef = useRef(null);
  const posRef = useRef([0, 0, 0, 0]);
  const aiSpeedRef = useRef([1, 1, 1]);
  const frozenRef = useRef(false);
  const finishedAIRef = useRef(0);
  const questionPickerRef = useRef(null);
  const startTimeRef = useRef(0);
  const rewardedRef = useRef(false);
  const inputRef = useRef(null);
  const correctRef = useRef(0);
  const mpPosRef = useRef(0);
  const mpStartedRef = useRef(false);
  const mpFinishedRef = useRef(false);
  const mpRoomRef = useRef(null);
  mpRoomRef.current = mpRoom;

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    try { setBest(parseInt(localStorage.getItem(BEST_KEY) || '0', 10) || 0); } catch { /* ignore */ }
  }, []);

  // ticking clock for multiplayer countdowns/timers
  useEffect(() => {
    if (screen !== 'mpRace' && screen !== 'mpLobby') return undefined;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [screen]);

  // ── Which Math Mentals level is this student assigned to? ─────────────────
  const assignedLevel = useMemo(() => {
    const groups = Array.isArray(classData?.toolkitData?.mathMentalsGroups)
      ? classData.toolkitData.mathMentalsGroups
      : [];
    const myGroup = groups.find((g) =>
      Array.isArray(g?.students) && g.students.some((s) => s.id === studentData?.id)
    );
    if (!myGroup) return null;
    const me = myGroup.students.find((s) => s.id === studentData?.id);
    const level = studentData?.mathMentalsProgress?.currentLevel || me?.currentLevel;
    return level && MATH_SUBLEVELS[level] ? level : null;
  }, [classData, studentData]);

  const levelKeys = useCallback((lvl) =>
    Object.keys(MATH_SUBLEVELS).filter((k) => k.startsWith(`${lvl}.`)), []);

  const nextQuestion = useCallback(() => {
    const pick = questionPickerRef.current;
    if (!pick) return;
    const key = pick();
    const q = generateQuestion(key, MATH_SUBLEVELS[key]);
    setQuestion({ ...q, sublevelName: MATH_SUBLEVELS[key].name });
    setTyped('');
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const resetLocalRaceStats = useCallback(() => {
    correctRef.current = 0;
    setStreak(0);
    setCorrect(0);
    setAttempts(0);
    setMissed([]);
    setFeedback(null);
    setSpinOut(false);
    setPlace(null);
    setRewardMsg('');
    rewardedRef.current = false;
  }, []);

  // ── Daily coins (shared by solo + multiplayer wins) ─────────────────────────
  const maybeAwardCoins = useCallback((finalPlace, finalCorrect, finalScore) => {
    if (rewardedRef.current) return;
    if (finalPlace === 1 && finalCorrect >= REWARD_MIN_CORRECT && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const last = studentData?.gameProgress?.mathGrandPrix?.lastRewardDate;
      if (last !== today) {
        rewardedRef.current = true;
        Promise.resolve(
          updateStudentData({
            ...studentData,
            currency: (studentData.currency || 0) + REWARD_COINS,
            gameProgress: {
              ...studentData.gameProgress,
              mathGrandPrix: {
                ...studentData.gameProgress?.mathGrandPrix,
                bestScore: Math.max(finalScore, studentData.gameProgress?.mathGrandPrix?.bestScore || 0),
                lastRewardDate: today,
              },
            },
          })
        )
          .then(() => {
            setRewardMsg(`🪙 Daily reward earned: +${REWARD_COINS} coins!`);
            showToast?.(`🏎️ Math Grand Prix reward: +${REWARD_COINS} coins!`, 'success');
            synthRef.current?.reward();
          })
          .catch((err) => console.error('Error awarding coins:', err));
      }
    }
  }, [studentData, updateStudentData, showToast]);

  // ════════════════════════════════════════════════════════════════════════════
  // SOLO MODE
  // ════════════════════════════════════════════════════════════════════════════
  const startRace = useCallback((picker, name, difficultyLevel) => {
    questionPickerRef.current = picker;
    setModeName(name);
    posRef.current = [0, 0, 0, 0];
    setPositions([0, 0, 0, 0]);
    const speedUp = 1 + (difficultyLevel - 1) * 0.05;
    aiSpeedRef.current = AI_FINISH_TIMES.map((t) => (TRACK_LEN / (t * rand(0.92, 1.08))) * speedUp);
    finishedAIRef.current = 0;
    frozenRef.current = true;
    resetLocalRaceStats();
    setScreen('countdown');
    setCountdown(3);
    [3, 2, 1].forEach((n, i) => setTimeout(() => { setCountdown(n); synthRef.current?.beep(); }, i * 900));
    setTimeout(() => {
      synthRef.current?.go();
      setScreen('racing');
      frozenRef.current = false;
      startTimeRef.current = performance.now();
      nextQuestion();
    }, 2800);
  }, [nextQuestion, resetLocalRaceStats]);

  const finishRace = useCallback(() => {
    frozenRef.current = true;
    const finalPlace = finishedAIRef.current + 1;
    const secs = Math.round((performance.now() - startTimeRef.current) / 1000);
    setPlace(finalPlace);
    setRaceTime(secs);
    setScreen('finished');
    const finalCorrect = correctRef.current;
    const score = Math.max(0, (5 - finalPlace) * 100 + finalCorrect * 10 - secs);
    setBest((prev) => {
      const nb = Math.max(prev, score);
      try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
      return nb;
    });
    if (finalPlace === 1) synthRef.current?.finish(); else synthRef.current?.lose();
    maybeAwardCoins(finalPlace, finalCorrect, score);
  }, [maybeAwardCoins]);

  // solo movement loop
  useEffect(() => {
    if (screen !== 'racing') return undefined;
    let raf;
    let last = performance.now();
    const step = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const p = posRef.current;
      for (let i = 0; i < 3; i++) {
        if (p[i + 1] < TRACK_LEN) {
          p[i + 1] += aiSpeedRef.current[i] * dt;
          if (p[i + 1] >= TRACK_LEN && p[0] < TRACK_LEN) finishedAIRef.current += 1;
        }
      }
      if (!frozenRef.current && p[0] < TRACK_LEN) p[0] += IDLE_CRAWL * dt;
      setPositions([...p]);
      if (p[0] >= TRACK_LEN) { finishRace(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [screen, finishRace]);

  const submitAnswer = useCallback(() => {
    if (!question || frozenRef.current || spinOut) return;
    const guess = typed.trim();
    if (guess === '') return;
    setAttempts((a) => a + 1);

    if (Number(guess) === Number(question.answer)) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrect((c) => c + 1);
      correctRef.current += 1;
      let boost = CORRECT_BOOST;
      if (newStreak % 3 === 0) {
        boost += TURBO_BONUS;
        setTurboFlash(true);
        setTimeout(() => setTurboFlash(false), 700);
        synthRef.current?.turbo();
      } else {
        synthRef.current?.correct();
      }
      posRef.current[0] = Math.min(TRACK_LEN, posRef.current[0] + boost);
      setFeedback({ type: 'correct', text: newStreak % 3 === 0 ? '🔥 TURBO BOOST!' : '✅ Vroom! Nice one!' });
      setTimeout(() => setFeedback(null), 900);
      nextQuestion();
    } else {
      synthRef.current?.wrong();
      setStreak(0);
      setSpinOut(true);
      setMissed((prev) => [...prev, { q: question.display ? `${question.question} ${question.display}` : question.question, a: question.answer }]);
      setFeedback({ type: 'wrong', text: `🌀 Spin out! The answer was ${question.answer}.` });
      frozenRef.current = true;
      setTimeout(() => {
        setSpinOut(false);
        setFeedback(null);
        frozenRef.current = false;
        nextQuestion();
      }, SPIN_OUT_TIME * 1000);
    }
  }, [question, typed, streak, spinOut, nextQuestion]);

  // ════════════════════════════════════════════════════════════════════════════
  // MULTIPLAYER MODE (Firebase Realtime Database)
  // ════════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (screen !== 'mpHome' || fb) return;
    (async () => {
      try {
        const { database } = await import('../../utils/firebase');
        const { ref, set, onValue, update, off, get, remove } = await import('firebase/database');
        setFb({ database, ref, set, onValue, update, off, get, remove });
      } catch (err) {
        console.error('Firebase load failed:', err);
        setMpMsg('⚠️ Could not connect to multiplayer. Check your internet connection.');
      }
    })();
  }, [screen, fb]);

  const roomRef = useCallback((path = '') =>
    fb.ref(fb.database, `mathGrandPrixRooms/${mpRoomCode}${path}`), [fb, mpRoomCode]);

  const isHost = mpRoom?.hostId === myId;
  const mpPlayers = useMemo(() => {
    const list = Object.values(mpRoom?.players || {});
    return list.sort((a, b) => (a.joinTime || 0) - (b.joinTime || 0));
  }, [mpRoom]);

  // subscribe to the room
  useEffect(() => {
    if (!fb || !mpRoomCode) return undefined;
    const rRef = fb.ref(fb.database, `mathGrandPrixRooms/${mpRoomCode}`);
    const handler = fb.onValue(rRef, (snap) => {
      const data = snap.val();
      if (!data) {
        // room deleted (host left)
        setMpRoom(null);
        setMpRoomCode('');
        setScreen('mpHome');
        setMpMsg('The room was closed by the host.');
        return;
      }
      setMpRoom(data);
    });
    return () => fb.off(rRef, 'value', handler);
  }, [fb, mpRoomCode]);

  // remove my player (or the whole room, if hosting) when the tab closes
  useEffect(() => {
    if (!fb || !mpRoomCode) return undefined;
    const cleanup = () => {
      try {
        const room = mpRoomRef.current;
        if (room?.hostId === myId && room?.phase === 'lobby') {
          fb.remove(fb.ref(fb.database, `mathGrandPrixRooms/${mpRoomCode}`));
        } else {
          fb.remove(fb.ref(fb.database, `mathGrandPrixRooms/${mpRoomCode}/players/${myId}`));
        }
      } catch { /* ignore */ }
    };
    window.addEventListener('beforeunload', cleanup);
    return () => window.removeEventListener('beforeunload', cleanup);
  }, [fb, mpRoomCode, myId]);

  const mpCreateRoom = useCallback(async () => {
    if (!fb) return;
    const name = mpName.trim().slice(0, 16);
    if (!name) { setMpMsg('Enter your name first!'); return; }
    const code = generateRoomCode();
    try {
      await fb.set(fb.ref(fb.database, `mathGrandPrixRooms/${code}`), {
        roomCode: code,
        phase: 'lobby',
        hostId: myId,
        level: mpLevel,
        createdAt: Date.now(),
        players: {
          [myId]: {
            id: myId, name, emoji: PLAYER_KARTS[0], pos: 0, correct: 0, streak: 0,
            joinTime: Date.now(), finishedAt: null, isHost: true,
          },
        },
      });
      setMpRoomCode(code);
      setMpMsg('');
      setScreen('mpLobby');
      synthRef.current?.join();
    } catch (err) {
      console.error('Create room failed:', err);
      setMpMsg('⚠️ Could not create the room. Try again.');
    }
  }, [fb, mpName, mpLevel, myId]);

  const mpJoinRoom = useCallback(async () => {
    if (!fb) return;
    const name = mpName.trim().slice(0, 16);
    const code = mpCodeInput.trim().toUpperCase();
    if (!name) { setMpMsg('Enter your name first!'); return; }
    if (code.length !== 4) { setMpMsg('Room codes are 4 letters, e.g. ABCD.'); return; }
    try {
      const snap = await fb.get(fb.ref(fb.database, `mathGrandPrixRooms/${code}`));
      const data = snap.val();
      if (!data) { setMpMsg(`Room ${code} was not found. Check the code!`); return; }
      if (data.phase !== 'lobby') { setMpMsg('That race has already started — ask for a new room.'); return; }
      const count = Object.keys(data.players || {}).length;
      if (count >= MAX_PLAYERS && !data.players?.[myId]) { setMpMsg('That room is full (8 racers max).'); return; }
      await fb.update(fb.ref(fb.database, `mathGrandPrixRooms/${code}/players/${myId}`), {
        id: myId, name, emoji: PLAYER_KARTS[count % PLAYER_KARTS.length], pos: 0, correct: 0, streak: 0,
        joinTime: Date.now(), finishedAt: null, isHost: false,
      });
      setMpRoomCode(code);
      setMpMsg('');
      setScreen('mpLobby');
      synthRef.current?.join();
    } catch (err) {
      console.error('Join room failed:', err);
      setMpMsg('⚠️ Could not join the room. Try again.');
    }
  }, [fb, mpName, mpCodeInput, myId]);

  const mpLeaveRoom = useCallback(async () => {
    if (fb && mpRoomCode) {
      try {
        if (isHost) await fb.remove(roomRef());
        else await fb.remove(roomRef(`/players/${myId}`));
      } catch { /* ignore */ }
    }
    setMpRoom(null);
    setMpRoomCode('');
    setScreen('mpHome');
  }, [fb, mpRoomCode, isHost, roomRef, myId]);

  const mpStartRace = useCallback(async () => {
    if (!fb || !isHost) return;
    try {
      // reset everyone and set a synced start time
      const resets = {};
      mpPlayers.forEach((p) => {
        resets[`players/${p.id}/pos`] = 0;
        resets[`players/${p.id}/correct`] = 0;
        resets[`players/${p.id}/streak`] = 0;
        resets[`players/${p.id}/finishedAt`] = null;
      });
      await fb.update(roomRef(), {
        ...resets,
        phase: 'racing',
        startAt: Date.now() + MP_COUNTDOWN_MS,
      });
    } catch (err) {
      console.error('Start race failed:', err);
    }
  }, [fb, isHost, mpPlayers, roomRef]);

  // enter the race screen when the host starts
  useEffect(() => {
    if (!mpRoom) return;
    if (mpRoom.phase === 'racing' && screen === 'mpLobby') {
      questionPickerRef.current = () => {
        const keys = levelKeys(mpRoom.level || 2);
        return keys[Math.floor(Math.random() * keys.length)];
      };
      mpPosRef.current = 0;
      mpStartedRef.current = false;
      mpFinishedRef.current = false;
      frozenRef.current = true;
      resetLocalRaceStats();
      setQuestion(null);
      setScreen('mpRace');
    }
  }, [mpRoom, screen, levelKeys, resetLocalRaceStats]);

  // fire GO + first question once the synced countdown ends
  useEffect(() => {
    if (screen !== 'mpRace' || !mpRoom?.startAt || mpStartedRef.current) return;
    if (now >= mpRoom.startAt) {
      mpStartedRef.current = true;
      frozenRef.current = false;
      startTimeRef.current = performance.now();
      synthRef.current?.go();
      nextQuestion();
    }
  }, [now, screen, mpRoom, nextQuestion]);

  // host: end the race once every kart has finished
  useEffect(() => {
    if (!fb || !isHost || mpRoom?.phase !== 'racing' || mpPlayers.length === 0) return;
    if (mpPlayers.every((p) => p.finishedAt)) {
      fb.update(roomRef(), { phase: 'finished' }).catch(() => {});
    }
  }, [fb, isHost, mpRoom, mpPlayers, roomRef]);

  const mpWritePlayer = useCallback((fields) => {
    if (!fb || !mpRoomCode) return;
    fb.update(roomRef(`/players/${myId}`), fields).catch(() => {});
  }, [fb, mpRoomCode, roomRef, myId]);

  const mpFinishLine = useCallback(() => {
    if (mpFinishedRef.current) return;
    mpFinishedRef.current = true;
    frozenRef.current = true;
    const finishedAt = Date.now();
    mpWritePlayer({ pos: TRACK_LEN, finishedAt });
    const secs = Math.round((performance.now() - startTimeRef.current) / 1000);
    setRaceTime(secs);
    const aheadOfMe = mpPlayers.filter((p) => p.id !== myId && p.finishedAt && p.finishedAt < finishedAt).length;
    const myPlace = aheadOfMe + 1;
    setPlace(myPlace);
    if (myPlace === 1) synthRef.current?.finish(); else synthRef.current?.lose();
    const finalCorrect = correctRef.current;
    const score = Math.max(0, (MAX_PLAYERS + 1 - myPlace) * 50 + finalCorrect * 10 - secs);
    setBest((prev) => {
      const nb = Math.max(prev, score);
      try { localStorage.setItem(BEST_KEY, String(nb)); } catch { /* ignore */ }
      return nb;
    });
    maybeAwardCoins(myPlace, finalCorrect, score);
  }, [mpPlayers, mpWritePlayer, maybeAwardCoins, myId]);

  const submitAnswerMp = useCallback(() => {
    if (!question || frozenRef.current || spinOut || mpFinishedRef.current) return;
    const guess = typed.trim();
    if (guess === '') return;
    setAttempts((a) => a + 1);

    if (Number(guess) === Number(question.answer)) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrect((c) => c + 1);
      correctRef.current += 1;
      let boost = CORRECT_BOOST;
      if (newStreak % 3 === 0) {
        boost += TURBO_BONUS;
        setTurboFlash(true);
        setTimeout(() => setTurboFlash(false), 700);
        synthRef.current?.turbo();
      } else {
        synthRef.current?.correct();
      }
      mpPosRef.current = Math.min(TRACK_LEN, mpPosRef.current + boost);
      mpWritePlayer({ pos: mpPosRef.current, correct: correctRef.current, streak: newStreak });
      setFeedback({ type: 'correct', text: newStreak % 3 === 0 ? '🔥 TURBO BOOST!' : '✅ Vroom! Nice one!' });
      setTimeout(() => setFeedback(null), 900);
      if (mpPosRef.current >= TRACK_LEN) mpFinishLine();
      else nextQuestion();
    } else {
      synthRef.current?.wrong();
      setStreak(0);
      setSpinOut(true);
      mpWritePlayer({ streak: 0 });
      setMissed((prev) => [...prev, { q: question.display ? `${question.question} ${question.display}` : question.question, a: question.answer }]);
      setFeedback({ type: 'wrong', text: `🌀 Spin out! The answer was ${question.answer}.` });
      frozenRef.current = true;
      setTimeout(() => {
        setSpinOut(false);
        setFeedback(null);
        if (!mpFinishedRef.current) {
          frozenRef.current = false;
          nextQuestion();
        }
      }, SPIN_OUT_TIME * 1000);
    }
  }, [question, typed, streak, spinOut, nextQuestion, mpWritePlayer, mpFinishLine]);

  const mpBackToLobby = useCallback(async () => {
    if (!fb || !isHost) return;
    try {
      await fb.update(roomRef(), { phase: 'lobby', startAt: null });
    } catch { /* ignore */ }
  }, [fb, isHost, roomRef]);

  // return everyone to the lobby when the host resets
  useEffect(() => {
    if (mpRoom?.phase === 'lobby' && screen === 'mpRace') setScreen('mpLobby');
  }, [mpRoom, screen]);

  // multiplayer standings (finished first by time, then by distance)
  const mpStandings = useMemo(() => {
    const done = mpPlayers.filter((p) => p.finishedAt).sort((a, b) => a.finishedAt - b.finishedAt);
    const racing = mpPlayers.filter((p) => !p.finishedAt).sort((a, b) => (b.pos || 0) - (a.pos || 0));
    return [...done, ...racing];
  }, [mpPlayers]);

  const alreadyRewardedToday =
    studentData?.gameProgress?.mathGrandPrix?.lastRewardDate === new Date().toDateString();

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 100;
  const mpCountdownLeft = screen === 'mpRace' && mpRoom?.startAt ? Math.max(0, Math.ceil((mpRoom.startAt - now) / 1000)) : 0;

  // ── Shared lane renderer ────────────────────────────────────────────────────
  const renderLane = (key, emoji, name, pos, opts = {}) => {
    const clamped = Math.min(pos || 0, TRACK_LEN);
    const done = clamped >= TRACK_LEN;
    return (
      <div key={key} className="relative h-10 bg-gray-700/60 rounded-lg overflow-hidden mb-1.5">
        <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-gray-500/40" />
        <div className="absolute right-8 top-0 bottom-0 w-1.5 bg-[repeating-linear-gradient(0deg,#fff_0_4px,#000_4px_8px)] opacity-70" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 text-2xl ${opts.spin ? 'animate-spin' : ''} ${opts.turbo ? 'scale-125' : ''}`}
          style={{ left: `calc(${(clamped / TRACK_LEN) * 100}% * 0.88)` }}
        >
          {opts.turbo && <span className="absolute -left-5 top-0 text-lg">💨</span>}
          {emoji}
        </div>
        <span className={`absolute left-1.5 top-0.5 text-[10px] font-bold ${opts.colorClass || 'text-gray-300'}`}>
          {name} {done && '🏁'}
        </span>
      </div>
    );
  };

  // ── Shared question panel (solo + multiplayer) ─────────────────────────────
  const renderQuestionPanel = (onSubmit) => (
    <>
      <div className="bg-white/95 rounded-2xl p-4 text-center mb-3 shadow-inner">
        <p className="text-[10px] text-gray-400 font-mono mb-1">{question?.sublevelName}</p>
        <p className="text-2xl font-black text-gray-800">{question?.question}</p>
        {question?.display && (
          <p className="text-xl text-purple-700 tracking-widest mt-1 break-all">{question.display}</p>
        )}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
        className="flex items-center justify-center gap-2 mb-2"
      >
        <input
          ref={inputRef}
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(/[^0-9\-]/g, ''))}
          placeholder="?"
          inputMode="numeric"
          autoComplete="off"
          disabled={spinOut}
          className="px-4 py-3 rounded-xl bg-white text-gray-900 font-black text-2xl text-center w-32 outline-none ring-2 ring-emerald-400 focus:ring-yellow-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={spinOut || typed.trim() === ''}
          className="px-5 py-3 rounded-xl font-black text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-105 transition-transform disabled:opacity-40"
        >
          GO 💨
        </button>
      </form>
      <div className="min-h-7 text-center">
        {feedback && (
          <p className={`font-bold ${feedback.type === 'correct' ? 'text-green-300' : 'text-orange-300'}`}>
            {feedback.text}
          </p>
        )}
      </div>
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {/* HUD */}
      <div className="flex items-center justify-between w-full max-w-2xl px-2">
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-green-600 font-bold">✅ {correct}</span>
          <span className="text-orange-500 font-bold">{streak > 1 ? `🔥x${streak}` : ''}</span>
          {(screen === 'racing' || screen === 'mpRace') && <span className="text-gray-500">accuracy {accuracy}%</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-yellow-600 font-mono text-sm">BEST {best}</span>
          <button
            onClick={() => setMuted((m) => !m)}
            className="px-2 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden ring-2 ring-emerald-400/50 shadow-xl bg-gradient-to-b from-slate-800 to-slate-900 min-h-96 p-4">
        {/* ── MENU ── */}
        {screen === 'menu' && (
          <div className="flex flex-col items-center justify-center text-center min-h-96">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-300 to-red-400 mb-2">
              🏎️ MATH GRAND PRIX
            </h2>
            <p className="text-emerald-100/90 max-w-md mb-1 text-sm">
              Your kart runs on BRAIN POWER! Answer mental-math questions to accelerate.
              Three correct in a row = 🔥 TURBO!
            </p>
            <p className="text-emerald-200/60 text-xs mb-5">Wrong answers cause a spin-out — and the rivals keep driving!</p>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => { setMpMsg(''); setScreen('mpHome'); }}
                className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-105 transition-transform shadow-lg"
              >
                🎮 Multiplayer — race your classmates!
              </button>
              {assignedLevel && (
                <button
                  onClick={() => startRace(() => assignedLevel, `My Level ${assignedLevel} — ${MATH_SUBLEVELS[assignedLevel].name}`, Math.floor(Number(assignedLevel)) || 1)}
                  className="px-6 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-transform shadow-lg"
                >
                  ⭐ My Math Level ({assignedLevel} — {MATH_SUBLEVELS[assignedLevel].name})
                </button>
              )}
              {[1, 2, 3, 4].map((lvl) => {
                const keys = levelKeys(lvl);
                if (keys.length === 0) return null;
                return (
                  <button
                    key={lvl}
                    onClick={() => startRace(() => keys[Math.floor(Math.random() * keys.length)], `Level ${lvl} Mixed`, lvl)}
                    className="px-6 py-2.5 rounded-2xl font-bold text-white bg-gradient-to-r from-slate-600 to-slate-700 hover:from-emerald-600 hover:to-teal-700 hover:scale-105 transition-all"
                  >
                    Level {lvl} Mixed {'⭐'.repeat(lvl)}
                  </button>
                );
              })}
            </div>
            {!assignedLevel && (
              <p className="text-emerald-200/50 text-xs mt-3">
                Tip: when your teacher assigns your Math Mentals level, a ⭐ My Math Level race appears here!
              </p>
            )}
            <p className="text-xs text-white/50 mt-4">
              Finish <b className="text-white/80">1st</b> with {REWARD_MIN_CORRECT}+ correct answers to earn {REWARD_COINS} coins once a day!
              {alreadyRewardedToday && ' (already earned today ✅)'}
            </p>
          </div>
        )}

        {/* ── MULTIPLAYER HOME ── */}
        {screen === 'mpHome' && (
          <div className="flex flex-col items-center justify-center text-center min-h-96">
            <h3 className="text-2xl font-black text-pink-300 mb-3">🎮 MULTIPLAYER RACE</h3>
            <input
              value={mpName}
              onChange={(e) => setMpName(e.target.value)}
              placeholder="Your name"
              maxLength={16}
              className="px-4 py-2.5 rounded-xl bg-white text-gray-900 font-bold text-center w-56 outline-none ring-2 ring-pink-400 mb-4"
            />

            <div className="bg-white/5 rounded-2xl p-4 w-full max-w-sm mb-3">
              <p className="text-emerald-200 font-bold text-sm mb-2">Host a new race</p>
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {[1, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setMpLevel(lvl)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mpLevel === lvl ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                  >
                    Lvl {lvl}
                  </button>
                ))}
              </div>
              <button
                onClick={mpCreateRoom}
                disabled={!fb}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-transform disabled:opacity-40 w-full"
              >
                {fb ? '🏁 Create room' : 'Connecting...'}
              </button>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 w-full max-w-sm">
              <p className="text-emerald-200 font-bold text-sm mb-2">Join with a code</p>
              <div className="flex gap-2 justify-center">
                <input
                  value={mpCodeInput}
                  onChange={(e) => setMpCodeInput(e.target.value.toUpperCase().slice(0, 4))}
                  placeholder="CODE"
                  className="px-3 py-2 rounded-xl bg-white text-gray-900 font-black text-center tracking-[0.3em] w-28 outline-none ring-2 ring-emerald-400 uppercase"
                />
                <button
                  onClick={mpJoinRoom}
                  disabled={!fb}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:scale-105 transition-transform disabled:opacity-40"
                >
                  Join 🚗
                </button>
              </div>
            </div>

            {mpMsg && <p className="text-amber-300 text-sm mt-3 font-semibold">{mpMsg}</p>}
            <button onClick={() => setScreen('menu')} className="mt-4 text-white/50 hover:text-white text-sm">
              ← Back to menu
            </button>
          </div>
        )}

        {/* ── MULTIPLAYER LOBBY ── */}
        {screen === 'mpLobby' && mpRoom && (
          <div className="flex flex-col items-center text-center min-h-96 py-4">
            <p className="text-emerald-200/70 text-xs font-mono mb-1">ROOM CODE</p>
            <p className="text-5xl font-black tracking-[0.35em] text-yellow-300 mb-2">{mpRoom.roomCode}</p>
            <p className="text-white/60 text-xs mb-4">
              Classmates join from the Math Grand Prix menu → 🎮 Multiplayer → Join with this code.
            </p>
            <p className="text-emerald-200 font-bold text-sm mb-2">
              Level {mpRoom.level} Mixed · {mpPlayers.length}/{MAX_PLAYERS} racers
            </p>

            <div className="flex flex-col gap-1.5 w-full max-w-sm mb-4">
              {mpPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-bold text-white">{p.name}</span>
                  {p.isHost && <span className="text-[10px] bg-yellow-400/20 text-yellow-300 font-bold px-2 py-0.5 rounded-full">HOST</span>}
                  {p.id === myId && <span className="text-[10px] bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">YOU</span>}
                </div>
              ))}
            </div>

            {isHost ? (
              <button
                onClick={mpStartRace}
                disabled={mpPlayers.length < 2}
                className="px-8 py-3 rounded-2xl font-black text-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-transform disabled:opacity-40"
              >
                {mpPlayers.length < 2 ? 'Waiting for racers...' : '🏁 START RACE!'}
              </button>
            ) : (
              <p className="text-white/70 font-semibold animate-pulse">Waiting for the host to start... 🏎️</p>
            )}
            <button onClick={mpLeaveRoom} className="mt-3 text-white/50 hover:text-white text-sm">
              ← Leave room
            </button>
          </div>
        )}

        {/* ── MULTIPLAYER RACE ── */}
        {screen === 'mpRace' && mpRoom && (
          <div className="flex flex-col min-h-96">
            <p className="text-center text-emerald-200/70 text-xs font-mono mb-2">
              ROOM {mpRoom.roomCode} · Level {mpRoom.level} Mixed
            </p>

            {/* live lanes for every racer */}
            <div className="mb-3">
              {mpPlayers.map((p) =>
                renderLane(
                  p.id,
                  p.id === myId && spinOut ? '🌀' : p.emoji,
                  p.id === myId ? `${p.name} (YOU)` : p.name,
                  p.id === myId ? mpPosRef.current : p.pos,
                  {
                    spin: p.id === myId && spinOut,
                    turbo: p.id === myId && turboFlash,
                    colorClass: p.id === myId ? 'text-yellow-300' : 'text-gray-300',
                  }
                )
              )}
            </div>

            {mpRoom.phase === 'finished' || mpFinishedRef.current ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {place && (
                  <>
                    <p className="text-5xl mb-1">{place <= 3 ? MEDALS[place - 1] : '🏁'}</p>
                    <p className="text-2xl font-black text-yellow-300 mb-1">
                      {place === 1 ? 'CHAMPION!' : `You finished #${place}!`}
                    </p>
                    <p className="text-white/80 font-mono text-sm mb-2">{correct} correct · {accuracy}% · {raceTime}s</p>
                    {rewardMsg && <p className="text-yellow-300 font-bold mb-1">{rewardMsg}</p>}
                  </>
                )}
                {!place && <p className="text-white/70 font-bold mb-2">🏁 Race over!</p>}

                <div className="w-full max-w-sm mt-1">
                  <p className="text-emerald-200 font-bold text-xs mb-1.5">STANDINGS</p>
                  {mpStandings.map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-2 rounded-lg px-3 py-1 mb-1 ${p.id === myId ? 'bg-yellow-400/15' : 'bg-white/5'}`}>
                      <span className="font-black text-white/80 w-8">{i < 3 ? MEDALS[i] : `${i + 1}.`}</span>
                      <span>{p.emoji}</span>
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      <span className="ml-auto text-white/50 font-mono text-xs">✅ {p.correct || 0}</span>
                    </div>
                  ))}
                </div>

                {missed.length > 0 && (
                  <div className="mt-2 max-w-md">
                    <p className="text-emerald-200 font-bold text-xs mb-1">🔧 Pit-stop practice:</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {missed.slice(0, 6).map((m, i) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/10 text-orange-200 font-mono text-[11px]">
                          {m.q.replace('= ?', `= ${m.a}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mpRoom.phase === 'finished' && (
                  isHost ? (
                    <button
                      onClick={mpBackToLobby}
                      className="mt-4 px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-transform"
                    >
                      🔁 Back to lobby
                    </button>
                  ) : (
                    <p className="mt-4 text-white/50 text-xs animate-pulse">Waiting for the host to restart...</p>
                  )
                )}
                <button onClick={mpLeaveRoom} className="mt-2 text-white/40 hover:text-white text-xs">
                  ← Leave room
                </button>
              </div>
            ) : mpCountdownLeft > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-7xl font-black text-yellow-300 animate-ping">{mpCountdownLeft}</p>
                <p className="text-white/60 text-sm mt-3">Get ready to race!</p>
              </div>
            ) : (
              question && renderQuestionPanel(submitAnswerMp)
            )}
          </div>
        )}

        {/* ── SOLO COUNTDOWN + RACING ── */}
        {(screen === 'countdown' || screen === 'racing') && (
          <div className="flex flex-col min-h-96">
            <p className="text-center text-emerald-200/70 text-xs font-mono mb-2">{modeName}</p>
            <div className="mb-3">
              {renderLane('me', spinOut ? '🌀' : '🏎️', studentData?.firstName ? `${studentData.firstName} (YOU)` : 'YOU', positions[0], { spin: spinOut, turbo: turboFlash, colorClass: 'text-yellow-300' })}
              {AI_KARTS.map((k, i) => renderLane(k.name, k.emoji, k.name, positions[i + 1], {}))}
            </div>

            {screen === 'countdown' && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-7xl font-black text-yellow-300 animate-ping">{countdown}</p>
              </div>
            )}
            {screen === 'racing' && question && renderQuestionPanel(submitAnswer)}
          </div>
        )}

        {/* ── SOLO FINISHED ── */}
        {screen === 'finished' && (
          <div className="flex flex-col items-center justify-center text-center min-h-96">
            <p className="text-6xl mb-2">{place && place <= 3 ? MEDALS[place - 1] : '🏁'}</p>
            <p className="text-3xl font-black text-yellow-300 mb-1">
              {place === 1 ? 'CHAMPION!' : place === 2 ? '2ND PLACE!' : place === 3 ? '3RD PLACE!' : 'FINISHED!'}
            </p>
            <p className="text-white/90 font-mono mb-1">
              {correct} correct · {accuracy}% accuracy · {raceTime}s
            </p>
            {rewardMsg && <p className="text-yellow-300 font-bold mb-1">{rewardMsg}</p>}
            {place === 1 && correct < REWARD_MIN_CORRECT && !rewardMsg && (
              <p className="text-white/50 text-xs mb-1">Win with {REWARD_MIN_CORRECT}+ correct answers to earn daily coins!</p>
            )}

            {missed.length > 0 && (
              <div className="mt-3 max-w-md">
                <p className="text-emerald-200 font-bold text-sm mb-2">🔧 Pit-stop practice:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {missed.slice(0, 8).map((m, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-orange-200 font-mono text-xs">
                      {m.q.replace('= ?', `= ${m.a}`)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {missed.length === 0 && correct > 0 && (
              <p className="text-green-300 font-bold mt-2">💯 Flawless driving — every answer correct!</p>
            )}

            <button
              onClick={() => setScreen('menu')}
              className="mt-6 px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-105 transition-transform"
            >
              Race Again 🏎️
            </button>
          </div>
        )}
      </div>

      {(screen === 'racing' || (screen === 'mpRace' && mpCountdownLeft === 0 && mpRoom?.phase === 'racing' && !mpFinishedRef.current)) && (
        <p className="text-xs text-gray-400 text-center px-4">
          Type the answer and press <b>Enter</b>. Every 3rd correct in a row fires a 🔥 TURBO boost!
        </p>
      )}
    </div>
  );
};

export default MathGrandPrixGame;
