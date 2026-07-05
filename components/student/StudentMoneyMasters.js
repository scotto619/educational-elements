// components/student/StudentMoneyMasters.js — Money Masters (student experience)
// Financial literacy adventure: work through assigned levels of lessons, pass
// auto-marked quizzes, beat Boss Challenges to earn level badges, and grow a
// virtual bank account (with real weekly interest on savings!).
//
// Reads assignment from classData.toolkitData.moneyMasters (teacher side).
// Writes progress to the student record as moneyMastersProgress, and awards
// class XP (totalPoints) + coins (currency) on first-time passes.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCurrency,
  fmt,
  MM_LEVELS,
  MM_LEVEL_IDS,
  getLessonsForLevel,
  getLesson,
  generateLessonQuiz,
  generateBossChallenge,
  checkAnswer,
  QUIZ_PASS,
  QUIZ_LENGTH,
  BOSS_PASS,
  BOSS_LENGTH,
  MM_REWARDS,
  SAVINGS_GOALS,
  BANK_INTEREST_RATE,
  emptyProgress,
  emptyBank,
  applyWeeklyInterest,
  isLevelComplete,
  lessonsPassedInLevel,
  BANK_TX_LIMIT,
} from '../../utils/moneyMastersEngine';

const round2 = (n) => Math.round(n * 100) / 100;

const LEVEL_THEMES = {
  1: { grad: 'from-amber-400 to-yellow-500', soft: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
  2: { grad: 'from-emerald-400 to-green-500', soft: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700' },
  3: { grad: 'from-sky-400 to-blue-500', soft: 'bg-sky-50', border: 'border-sky-300', text: 'text-sky-700' },
  4: { grad: 'from-violet-400 to-purple-500', soft: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700' },
  5: { grad: 'from-rose-400 to-pink-500', soft: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700' },
};

// Firestore-safe deep clean of the progress object (no undefined anywhere)
const cleanProgress = (p) => ({
  completedLessons: Object.fromEntries(
    Object.entries(p.completedLessons || {}).map(([id, r]) => [id, {
      score: r?.score || 0,
      total: r?.total || QUIZ_LENGTH,
      best: r?.best || r?.score || 0,
      passed: !!r?.passed,
      timestamp: r?.timestamp || new Date().toISOString(),
    }])
  ),
  completedChallenges: Object.fromEntries(
    Object.entries(p.completedChallenges || {}).map(([lvl, r]) => [lvl, {
      score: r?.score || 0,
      total: r?.total || BOSS_LENGTH,
      passed: !!r?.passed,
      timestamp: r?.timestamp || new Date().toISOString(),
    }])
  ),
  unlockedLevel: p.unlockedLevel || 1,
  bank: {
    balance: round2(p.bank?.balance || 0),
    savings: round2(p.bank?.savings || 0),
    lastInterest: p.bank?.lastInterest || new Date().toISOString(),
    transactions: (p.bank?.transactions || []).slice(0, BANK_TX_LIMIT).map((t) => ({
      type: t?.type || 'other',
      amount: round2(t?.amount || 0),
      desc: t?.desc || '',
      ts: t?.ts || new Date().toISOString(),
    })),
    goalsEarned: [...(p.bank?.goalsEarned || [])],
  },
  badges: [...(p.badges || [])],
});

const StudentMoneyMasters = ({ studentData, classData, showToast, updateStudentData }) => {
  const mmData = classData?.toolkitData?.moneyMasters;
  const assignment = mmData?.students?.[studentData?.id];
  const currency = getCurrency(mmData?.settings?.currency);

  const [progress, setProgress] = useState(() => ({
    ...emptyProgress(),
    ...(studentData?.moneyMastersProgress || {}),
    bank: { ...emptyBank(), ...(studentData?.moneyMastersProgress?.bank || {}) },
  }));
  const [view, setView] = useState('home'); // 'home' | 'lesson' | 'quiz' | 'bank'
  const [activeLesson, setActiveLesson] = useState(null); // lesson object
  const [quiz, setQuiz] = useState(null); // { kind:'lesson'|'boss', level, lessonId, questions }

  // ── Persistence ─────────────────────────────────────────────────────────────
  const save = useCallback(async (nextProgress, rewards = null) => {
    const cleaned = cleanProgress(nextProgress);
    setProgress(cleaned);
    const updates = { moneyMastersProgress: cleaned };
    if (rewards) {
      updates.totalPoints = (studentData?.totalPoints || 0) + rewards.xp;
      updates.currency = (studentData?.currency || 0) + rewards.coins;
    }
    const ok = await updateStudentData(updates);
    if (!ok) showToast('Could not save your progress — check your connection.', 'error');
    return ok;
  }, [studentData, updateStudentData, showToast]);

  // ── Weekly interest on savings (applied once on load) ───────────────────────
  useEffect(() => {
    if (!assignment) return;
    const { bank, earned } = applyWeeklyInterest(progress.bank);
    if (earned > 0) {
      showToast(`🏦 Your savings earned ${fmt(earned, currency)} interest!`, 'success');
      save({ ...progress, bank });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.assignedLevel]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const maxLevel = useMemo(() => {
    if (!assignment) return 0;
    return Math.min(5, Math.max(assignment.assignedLevel || 1, progress.unlockedLevel || 1));
  }, [assignment, progress.unlockedLevel]);

  const bankTotal = round2((progress.bank?.balance || 0) + (progress.bank?.savings || 0));

  // ── Quiz completion handler ─────────────────────────────────────────────────
  const handleQuizComplete = async (results) => {
    const score = results.filter((r) => r.isCorrect).length;
    const next = cleanProgress(progress);
    let rewards = null;
    const now = new Date().toISOString();
    const deposit = (amount, desc) => {
      next.bank.balance = round2(next.bank.balance + amount);
      next.bank.transactions = [{ type: 'earn', amount, desc, ts: now }, ...next.bank.transactions].slice(0, BANK_TX_LIMIT);
    };

    if (quiz.kind === 'lesson') {
      const prev = next.completedLessons[quiz.lessonId];
      const passed = score >= QUIZ_PASS;
      const firstPass = passed && !prev?.passed;
      next.completedLessons[quiz.lessonId] = {
        score,
        total: QUIZ_LENGTH,
        best: Math.max(score, prev?.best || 0),
        passed: passed || !!prev?.passed,
        timestamp: now,
      };
      if (firstPass) {
        rewards = { xp: MM_REWARDS.LESSON_XP, coins: MM_REWARDS.LESSON_COINS };
        deposit(MM_REWARDS.LESSON_BANK, `Passed lesson ${quiz.lessonId}`);
        showToast(`🎉 Lesson passed! +${MM_REWARDS.LESSON_XP} XP, +${MM_REWARDS.LESSON_COINS} coins, +${fmt(MM_REWARDS.LESSON_BANK, currency)} banked!`, 'success');
      } else if (passed) {
        showToast(`Nice work — ${score}/${QUIZ_LENGTH}!`, 'success');
      } else {
        showToast(`${score}/${QUIZ_LENGTH}. You need ${QUIZ_PASS} to pass — review the lesson and try again!`, 'info');
      }
    } else {
      const level = quiz.level;
      const prev = next.completedChallenges[level];
      const passed = score >= BOSS_PASS;
      const firstPass = passed && !prev?.passed;
      next.completedChallenges[level] = {
        score,
        total: BOSS_LENGTH,
        passed: passed || !!prev?.passed,
        timestamp: now,
      };
      if (firstPass) {
        rewards = { xp: MM_REWARDS.BOSS_XP, coins: MM_REWARDS.BOSS_COINS };
        deposit(MM_REWARDS.BOSS_BANK, `Beat Level ${level} Boss Challenge`);
        const badgeId = `level_${level}`;
        if (!next.badges.includes(badgeId)) next.badges.push(badgeId);
        if (level < 5 && next.unlockedLevel < level + 1) {
          next.unlockedLevel = level + 1;
          showToast(`🏆 Level ${level} complete! Level ${level + 1}: ${MM_LEVELS[level + 1].name} unlocked!`, 'success');
        } else {
          showToast(`🏆 Boss defeated! +${MM_REWARDS.BOSS_XP} XP, +${fmt(MM_REWARDS.BOSS_BANK, currency)} banked!`, 'success');
        }
      } else if (!passed) {
        showToast(`${score}/${BOSS_LENGTH}. You need ${BOSS_PASS} — sharpen up and challenge the boss again!`, 'info');
      }
    }

    await save(next, rewards);
  };

  // ── Bank actions ────────────────────────────────────────────────────────────
  const transfer = async (amount, toSavings) => {
    const next = cleanProgress(progress);
    const from = toSavings ? 'balance' : 'savings';
    if (amount <= 0 || next.bank[from] < amount) {
      showToast('Not enough money for that transfer!', 'error');
      return;
    }
    next.bank[from] = round2(next.bank[from] - amount);
    const to = toSavings ? 'savings' : 'balance';
    next.bank[to] = round2(next.bank[to] + amount);
    next.bank.transactions = [{
      type: 'transfer',
      amount,
      desc: toSavings ? 'Moved into savings' : 'Moved out of savings',
      ts: new Date().toISOString(),
    }, ...next.bank.transactions].slice(0, BANK_TX_LIMIT);

    // savings goal badges (based on savings balance)
    SAVINGS_GOALS.forEach((g) => {
      if (next.bank.savings >= g.amount && !next.bank.goalsEarned.includes(g.id)) {
        next.bank.goalsEarned.push(g.id);
        showToast(`${g.icon} Savings goal reached: ${g.name}!`, 'success');
      }
    });
    await save(next);
  };

  // ── Not assigned ────────────────────────────────────────────────────────────
  if (!assignment?.assignedLevel) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-8 text-center">
        <div className="text-4xl md:text-6xl mb-4">💰</div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Money Masters</h2>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Your teacher hasn’t assigned you a Money Masters level yet.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <p className="text-amber-800 text-sm">
            Ask your teacher to assign you a level in the Resources tab — then start earning badges and growing your bank!
          </p>
        </div>
      </div>
    );
  }

  // ── Quiz view ───────────────────────────────────────────────────────────────
  if (view === 'quiz' && quiz) {
    return (
      <QuizRunner
        quiz={quiz}
        currency={currency}
        onExit={() => { setView(quiz.kind === 'lesson' ? 'lesson' : 'home'); setQuiz(null); }}
        onComplete={async (results) => { await handleQuizComplete(results); }}
        onFinished={() => { setView('home'); setQuiz(null); setActiveLesson(null); }}
      />
    );
  }

  // ── Lesson view ─────────────────────────────────────────────────────────────
  if (view === 'lesson' && activeLesson) {
    const theme = LEVEL_THEMES[activeLesson.level];
    const record = progress.completedLessons[activeLesson.id];
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setView('home'); setActiveLesson(null); }}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
        >
          ← Back to Money Masters
        </button>

        <div className={`bg-gradient-to-r ${theme.grad} rounded-2xl p-6 text-white shadow-lg`}>
          <p className="text-sm font-bold opacity-90">Level {activeLesson.level} · {MM_LEVELS[activeLesson.level].name}</p>
          <h2 className="text-2xl font-bold mt-1">{activeLesson.icon} Lesson {activeLesson.id}: {activeLesson.name}</h2>
          <p className="text-sm opacity-90 mt-2">{activeLesson.intro}</p>
          {record?.passed && (
            <span className="inline-block bg-white/25 rounded-full px-3 py-1 text-xs font-bold mt-3">
              ✅ Passed · best score {record.best}/{QUIZ_LENGTH}
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {activeLesson.cards(currency).map((card, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="font-bold text-gray-800 mb-2">{card.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{card.text}</p>
              {card.example && (
                <p className={`text-sm ${theme.text} ${theme.soft} rounded-xl px-3 py-2 mt-3 font-medium`}>
                  💡 {card.example}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">⭐ <span className="font-semibold">Remember:</span> {activeLesson.tip}</p>
          <button
            onClick={() => {
              setQuiz({
                kind: 'lesson',
                lessonId: activeLesson.id,
                level: activeLesson.level,
                questions: generateLessonQuiz(activeLesson.id, currency.code),
              });
              setView('quiz');
            }}
            className={`bg-gradient-to-r ${theme.grad} text-white px-8 py-3 rounded-xl font-bold text-lg shadow hover:shadow-lg transition whitespace-nowrap`}
          >
            {record?.passed ? '🔁 Retake Quiz' : '🚀 Take the Quiz'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400">
          {QUIZ_LENGTH} questions · pass with {QUIZ_PASS} or more · first pass earns +{MM_REWARDS.LESSON_XP} XP, +{MM_REWARDS.LESSON_COINS} coins and {fmt(MM_REWARDS.LESSON_BANK, currency)} into your bank
        </p>
      </div>
    );
  }

  // ── Bank view ───────────────────────────────────────────────────────────────
  if (view === 'bank') {
    return (
      <BankView
        progress={progress}
        currency={currency}
        bankTotal={bankTotal}
        transfer={transfer}
        onBack={() => setView('home')}
      />
    );
  }

  // ── Home: level map ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">💰 Money Masters</h1>
            <p className="text-amber-100 text-sm mt-1">
              Learn real money skills · earn badges · grow your bank ({currency.flag} {currency.code})
            </p>
          </div>
          <button
            onClick={() => setView('bank')}
            className="bg-white/20 hover:bg-white/30 rounded-xl px-5 py-3 text-left transition"
          >
            <p className="text-xs font-bold text-amber-100">MY BANK 🏦</p>
            <p className="text-xl font-bold">{fmt(bankTotal, currency)}</p>
            <p className="text-[11px] text-amber-100">{fmt(progress.bank?.savings || 0, currency)} in savings → tap to manage</p>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium">
          <span className="bg-white/20 rounded-full px-3 py-1">🏅 {progress.badges.length} level badge{progress.badges.length !== 1 ? 's' : ''}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🎯 {(progress.bank?.goalsEarned || []).length} savings goal{(progress.bank?.goalsEarned || []).length !== 1 ? 's' : ''}</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🌱 Savings grow {Math.round(BANK_INTEREST_RATE * 100)}% every week</span>
        </div>
      </div>

      {/* Level map */}
      <div className="space-y-4">
        {MM_LEVEL_IDS.map((lvl) => {
          const info = MM_LEVELS[lvl];
          const theme = LEVEL_THEMES[lvl];
          const unlocked = lvl <= maxLevel;
          const lessons = getLessonsForLevel(lvl);
          const passedCount = lessonsPassedInLevel(progress, lvl);
          const bossRecord = progress.completedChallenges[lvl];
          const bossReady = passedCount === lessons.length;
          const complete = isLevelComplete(progress, lvl);

          if (!unlocked) {
            return (
              <div key={lvl} className="bg-gray-100 rounded-2xl p-5 border border-gray-200 opacity-70">
                <p className="font-bold text-gray-500">🔒 Level {lvl}: {info.name} <span className="font-medium text-xs">({info.years})</span></p>
                <p className="text-sm text-gray-400 mt-1">
                  {lvl === maxLevel + 1 ? `Beat the Level ${maxLevel} Boss Challenge to unlock!` : 'Locked for now — keep going!'}
                </p>
              </div>
            );
          }

          return (
            <div key={lvl} className={`bg-white rounded-2xl border-2 ${complete ? theme.border : 'border-gray-200'} shadow-sm overflow-hidden`}>
              <div className={`bg-gradient-to-r ${theme.grad} px-5 py-4 text-white`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{info.icon} Level {lvl}: {info.name} {complete && '🏆'}</h3>
                    <p className="text-xs opacity-90">{info.description}</p>
                  </div>
                  <span className="bg-white/25 rounded-full px-3 py-1 text-xs font-bold">
                    {passedCount}/{lessons.length} lessons
                  </span>
                </div>
              </div>
              <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {lessons.map((lesson) => {
                  const rec = progress.completedLessons[lesson.id];
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => { setActiveLesson(lesson); setView('lesson'); }}
                      className={`text-left rounded-xl border-2 p-3 transition hover:shadow-md ${
                        rec?.passed ? `${theme.soft} ${theme.border}` : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-gray-800 text-sm">{lesson.icon} {lesson.name}</p>
                      <p className={`text-xs mt-1 font-medium ${rec?.passed ? theme.text : 'text-gray-400'}`}>
                        {rec?.passed ? `✅ Passed · best ${rec.best}/${QUIZ_LENGTH}` : rec ? `Best ${rec.best}/${QUIZ_LENGTH} — try again!` : 'Not started'}
                      </p>
                    </button>
                  );
                })}
                {/* Boss challenge */}
                <button
                  onClick={() => {
                    if (!bossReady) return showToast(`Pass all ${lessons.length} lessons first to face the boss!`, 'info');
                    setQuiz({ kind: 'boss', level: lvl, questions: generateBossChallenge(lvl, currency.code) });
                    setView('quiz');
                  }}
                  className={`text-left rounded-xl border-2 p-3 transition ${
                    bossRecord?.passed
                      ? 'border-yellow-400 bg-yellow-50'
                      : bossReady
                        ? 'border-gray-800 bg-gray-900 text-white hover:shadow-lg'
                        : 'border-dashed border-gray-300 bg-gray-50 text-gray-400'
                  }`}
                >
                  <p className={`font-bold text-sm ${bossRecord?.passed ? 'text-yellow-700' : ''}`}>
                    {bossRecord?.passed ? '👑 Boss Defeated!' : '⚔️ Boss Challenge'}
                  </p>
                  <p className={`text-xs mt-1 font-medium ${bossRecord?.passed ? 'text-yellow-600' : bossReady ? 'text-gray-300' : 'text-gray-400'}`}>
                    {bossRecord?.passed
                      ? `Badge earned · ${bossRecord.score}/${BOSS_LENGTH}`
                      : bossReady
                        ? `${BOSS_LENGTH} mixed questions — get ${BOSS_PASS}+ to win the badge!`
                        : `Unlocks after all ${lessons.length} lessons`}
                  </p>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge cabinet */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">🏅 Badge Cabinet</h3>
        <div className="flex flex-wrap gap-2">
          {MM_LEVEL_IDS.map((lvl) => {
            const earned = progress.badges.includes(`level_${lvl}`);
            return (
              <span
                key={lvl}
                title={`${MM_LEVELS[lvl].name} — complete Level ${lvl}`}
                className={`rounded-full px-3 py-1.5 text-sm font-bold border ${earned ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 'bg-gray-50 border-gray-200 text-gray-300'}`}
              >
                {MM_LEVELS[lvl].icon} {MM_LEVELS[lvl].name}
              </span>
            );
          })}
          {SAVINGS_GOALS.map((g) => {
            const earned = (progress.bank?.goalsEarned || []).includes(g.id);
            return (
              <span
                key={g.id}
                title={`${g.name} — save ${fmt(g.amount, currency)}`}
                className={`rounded-full px-3 py-1.5 text-sm font-bold border ${earned ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-300'}`}
              >
                {g.icon} {g.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Quiz runner (lesson quizzes + boss challenges) ───────────────────────────
const QuizRunner = ({ quiz, currency, onExit, onComplete, onFinished }) => {
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null); // { isCorrect, correctAnswer }
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const questions = quiz.questions;
  const q = questions[index];
  const isBoss = quiz.kind === 'boss';
  const passMark = isBoss ? BOSS_PASS : QUIZ_PASS;
  const lesson = quiz.lessonId ? getLesson(quiz.lessonId) : null;

  const submit = (answer) => {
    if (feedback) return;
    const isCorrect = checkAnswer(q, answer);
    setFeedback({ isCorrect, correctAnswer: q.answer });
    setResults((prev) => [...prev, {
      question: q.question,
      userAnswer: String(answer),
      correctAnswer: String(q.answer),
      isCorrect,
    }]);
  };

  const next = async () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setInput('');
      setPicked(null);
      setFeedback(null);
    } else {
      setDone(true);
      setSaving(true);
      await onComplete([...results]);
      setSaving(false);
    }
  };

  if (done) {
    const score = results.filter((r) => r.isCorrect).length;
    const passed = score >= passMark;
    return (
      <div className="space-y-5">
        <div className={`bg-white rounded-2xl shadow-lg p-8 text-center border-t-8 ${passed ? 'border-emerald-400' : 'border-orange-400'}`}>
          <div className="text-6xl mb-3">{passed ? (isBoss ? '👑' : '🎉') : '💪'}</div>
          <h1 className="text-3xl font-bold text-gray-800">
            {passed ? (isBoss ? 'Boss Defeated!' : 'Quiz Passed!') : 'So Close!'}
          </h1>
          <p className="text-2xl font-bold text-amber-600 mt-2">{score} / {questions.length}</p>
          <p className="text-sm text-gray-500 mt-2">
            {passed
              ? saving ? 'Saving your rewards…' : 'Rewards saved — check your bank!'
              : `You need ${passMark}/${questions.length} to pass. Review and try again — you’ve got this!`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Review your answers</h2>
          <div className="space-y-2.5">
            {results.map((r, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 border ${r.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                <p className="text-sm font-semibold text-gray-800">{r.isCorrect ? '✅' : '❌'} {r.question}</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Your answer: {r.userAnswer}{!r.isCorrect && <span className="font-bold"> · Correct: {r.correctAnswer}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onFinished}
            disabled={saving}
            className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600 transition disabled:opacity-50"
          >
            Back to Money Masters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-5 text-white shadow-lg ${isBoss ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {isBoss ? `⚔️ Level ${quiz.level} Boss Challenge` : `${lesson?.icon || '📝'} ${lesson?.name || 'Lesson'} Quiz`}
            </h2>
            <p className="text-xs opacity-80 mt-0.5">Question {index + 1} of {questions.length} · pass with {passMark}+</p>
          </div>
          <button onClick={onExit} className="bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 text-sm font-bold transition">
            Exit
          </button>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5 mt-3">
          <div className="bg-white h-2.5 rounded-full transition-all duration-300" style={{ width: `${((index + (feedback ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">{q.question}</h3>

        {q.type === 'mc' ? (
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {q.options.map((opt) => {
              const isPicked = picked === opt;
              const showState = feedback && (opt === String(q.answer) || isPicked);
              return (
                <button
                  key={opt}
                  onClick={() => { if (!feedback) { setPicked(opt); submit(opt); } }}
                  disabled={!!feedback}
                  className={`rounded-xl border-2 px-4 py-3.5 font-semibold text-left transition ${
                    showState
                      ? opt === String(q.answer)
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="max-w-xs mx-auto">
            <input
              type="text"
              inputMode="decimal"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && input.trim() && !feedback) submit(input); }}
              placeholder="Your answer…"
              disabled={!!feedback}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl font-bold focus:outline-none focus:border-amber-400 disabled:bg-gray-50"
              autoFocus
            />
            {!feedback && (
              <button
                onClick={() => input.trim() && submit(input)}
                disabled={!input.trim()}
                className="w-full mt-3 bg-amber-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-amber-600 disabled:bg-gray-300 transition"
              >
                Check Answer
              </button>
            )}
          </div>
        )}

        {feedback && (
          <div className={`max-w-2xl mx-auto mt-5 rounded-xl px-5 py-4 text-center ${feedback.isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-bold ${feedback.isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>
              {feedback.isCorrect ? '✅ Correct!' : `❌ Not quite — the answer is ${feedback.correctAnswer}`}
            </p>
            <button
              onClick={next}
              className="mt-3 bg-gray-800 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition"
            >
              {index < questions.length - 1 ? 'Next Question →' : 'See Results 🏁'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Bank view ────────────────────────────────────────────────────────────────
const BankView = ({ progress, currency, bankTotal, transfer, onBack }) => {
  const [amount, setAmount] = useState('');
  const bank = progress.bank || emptyBank();
  const parsed = round2(parseFloat(amount) || 0);
  const nextGoal = SAVINGS_GOALS.find((g) => !(bank.goalsEarned || []).includes(g.id));

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
      >
        ← Back to Money Masters
      </button>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">🏦 My Money Masters Bank</h2>
        <p className="text-emerald-100 text-sm mt-1">
          Earn by passing lessons and bosses. Savings grow {Math.round(BANK_INTEREST_RATE * 100)}% every week — real compound interest!
        </p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-emerald-100">WALLET</p>
            <p className="text-xl font-bold">{fmt(bank.balance || 0, currency)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-emerald-100">SAVINGS 🌱</p>
            <p className="text-xl font-bold">{fmt(bank.savings || 0, currency)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-emerald-100">TOTAL</p>
            <p className="text-xl font-bold">{fmt(bankTotal, currency)}</p>
          </div>
        </div>
      </div>

      {/* Transfer */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-1">Move your money</h3>
        <p className="text-xs text-gray-500 mb-3">
          Money in SAVINGS earns weekly interest. Money in your WALLET doesn’t — where should it live? 🤔
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Amount (${currency.symbol})`}
            className="border-2 border-gray-200 rounded-xl px-4 py-2.5 font-bold text-gray-800 w-40 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => { if (parsed > 0) { transfer(parsed, true); setAmount(''); } }}
            disabled={parsed <= 0 || parsed > (bank.balance || 0)}
            className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 transition"
          >
            → Into Savings
          </button>
          <button
            onClick={() => { if (parsed > 0) { transfer(parsed, false); setAmount(''); } }}
            disabled={parsed <= 0 || parsed > (bank.savings || 0)}
            className="bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition"
          >
            ← Back to Wallet
          </button>
        </div>
      </div>

      {/* Next goal */}
      {nextGoal && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-800">🎯 Next savings goal: {nextGoal.icon} {nextGoal.name}</h3>
            <span className="text-sm font-bold text-emerald-600">{fmt(bank.savings || 0, currency)} / {fmt(nextGoal.amount, currency)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((bank.savings || 0) / nextGoal.amount) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-3">📜 My bank statement</h3>
        {(bank.transactions || []).length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No transactions yet — pass a lesson to make your first deposit!</p>
        ) : (
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {bank.transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {t.type === 'interest' ? '🌱' : t.type === 'transfer' ? '🔄' : '💵'} {t.desc}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(t.ts).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ml-3 ${t.type === 'transfer' ? 'text-gray-500' : 'text-emerald-600'}`}>
                  {t.type === 'transfer' ? '' : '+'}{fmt(t.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMoneyMasters;
