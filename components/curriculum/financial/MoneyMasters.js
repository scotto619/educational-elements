// components/curriculum/financial/MoneyMasters.js — Money Masters (teacher hub)
// Financial literacy program for the Resources tab: pick a class currency,
// assign levels to students, watch lesson/badge/bank progress at a glance,
// and preview every lesson + auto-generated quiz questions. Auto-saves.
//
// DATA CONTRACT (do not change — student app depends on it):
//   toolkitData.moneyMasters = {
//     settings: { currency: 'AUD' },
//     students: { [studentId]: { assignedLevel: 1..5, assignedAt } },
//   }
// Student progress lives on the student record as studentData.moneyMastersProgress
// (written student-side), so the roster below reads live progress from `students`.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  getCurrency,
  fmt,
  MM_LEVELS,
  MM_LEVEL_IDS,
  getLessonsForLevel,
  generateLessonQuiz,
  lessonsPassedInLevel,
  countTotalLessonsPassed,
  isLevelComplete,
  TOTAL_LESSONS,
  QUIZ_PASS,
  QUIZ_LENGTH,
  BOSS_PASS,
  BOSS_LENGTH,
} from '../../../utils/moneyMastersEngine';

const LEVEL_BADGE_STYLES = {
  1: 'bg-amber-100 text-amber-700',
  2: 'bg-emerald-100 text-emerald-700',
  3: 'bg-sky-100 text-sky-700',
  4: 'bg-violet-100 text-violet-700',
  5: 'bg-rose-100 text-rose-700',
};

const MoneyMasters = ({
  students = [],
  showToast = () => {},
  saveData = () => {},
  loadedData = {},
}) => {
  const [data, setData] = useState({ settings: { currency: DEFAULT_CURRENCY }, students: {} });
  const [selected, setSelected] = useState(new Set());
  const [bulkLevel, setBulkLevel] = useState(1);
  const [previewLevel, setPreviewLevel] = useState(1);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [previewQs, setPreviewQs] = useState(null);
  const [view, setView] = useState('students'); // 'students' | 'preview'

  useEffect(() => {
    const stored = loadedData?.moneyMasters;
    setData({
      settings: { currency: stored?.settings?.currency || DEFAULT_CURRENCY },
      students: stored?.students || {},
    });
  }, [loadedData]);

  const currency = getCurrency(data.settings.currency);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  const persist = useCallback((updated, message) => {
    setData(updated);
    try {
      saveData({
        toolkitData: {
          ...(loadedData || {}),
          moneyMasters: { ...updated, lastSaved: new Date().toISOString() },
        },
      });
      if (message) showToast(message, 'success');
    } catch (err) {
      console.error('MoneyMasters: save failed', err);
      showToast('Error saving changes', 'error');
    }
  }, [saveData, loadedData, showToast]);

  // ── Assignment actions ──────────────────────────────────────────────────────
  const setCurrencyCode = (code) => {
    persist(
      { ...data, settings: { ...data.settings, currency: code } },
      `Class currency set to ${CURRENCIES[code].flag} ${CURRENCIES[code].name}`
    );
  };

  const assignLevel = (studentIds, level) => {
    if (studentIds.length === 0) return showToast('Select at least one student first', 'info');
    const updated = { ...data, students: { ...data.students } };
    studentIds.forEach((id) => {
      updated.students[id] = {
        ...(updated.students[id] || {}),
        assignedLevel: level,
        assignedAt: new Date().toISOString(),
      };
    });
    persist(updated, `${studentIds.length} student${studentIds.length !== 1 ? 's' : ''} assigned to Level ${level} — ${MM_LEVELS[level].name}`);
    setSelected(new Set());
  };

  const unassign = (studentIds) => {
    const updated = { ...data, students: { ...data.students } };
    studentIds.forEach((id) => { delete updated.students[id]; });
    persist(updated, 'Assignment removed');
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── Derived stats ───────────────────────────────────────────────────────────
  const assignedCount = useMemo(
    () => students.filter((s) => data.students[s.id]?.assignedLevel).length,
    [students, data.students]
  );
  const classStats = useMemo(() => {
    let lessons = 0; let badges = 0; let bank = 0;
    students.forEach((s) => {
      const p = s.moneyMastersProgress;
      if (!p) return;
      lessons += countTotalLessonsPassed(p);
      badges += (p.badges || []).length + (p.bank?.goalsEarned || []).length;
      bank += (p.bank?.balance || 0) + (p.bank?.savings || 0);
    });
    return { lessons, badges, bank };
  }, [students]);

  // ── Preview helpers ─────────────────────────────────────────────────────────
  const openLessonPreview = (lesson) => {
    setPreviewLesson(lesson);
    setPreviewQs(generateLessonQuiz(lesson.id, currency.code, 6));
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h2 className="text-2xl font-bold">Money Masters</h2>
              <p className="text-amber-100 text-sm mt-0.5">
                Financial literacy for Years 2–6 · lessons, quizzes, badges and a virtual bank
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('students')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${view === 'students' ? 'bg-white text-amber-700 shadow-sm' : 'bg-white/20 hover:bg-white/30'}`}
            >
              👥 Students
            </button>
            <button
              onClick={() => setView('preview')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${view === 'preview' ? 'bg-white text-amber-700 shadow-sm' : 'bg-white/20 hover:bg-white/30'}`}
            >
              📖 Curriculum
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium">
          <span className="bg-white/20 rounded-full px-3 py-1">👥 {assignedCount}/{students.length} assigned</span>
          <span className="bg-white/20 rounded-full px-3 py-1">✅ {classStats.lessons} lessons passed</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🏅 {classStats.badges} badges earned</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🏦 {fmt(classStats.bank, currency)} in class banks</span>
          <span className="bg-white/20 rounded-full px-3 py-1">💾 Changes save automatically</span>
        </div>
      </div>

      {/* Currency picker */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-40">
            <p className="font-bold text-gray-800 text-sm">Class currency</p>
            <p className="text-xs text-gray-500">Every lesson, quiz and bank uses this currency.</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.values(CURRENCIES).map((c) => (
              <button
                key={c.code}
                onClick={() => setCurrencyCode(c.code)}
                title={c.name}
                className={`px-3 py-2 rounded-xl border-2 text-sm font-bold transition ${
                  currency.code === c.code
                    ? 'border-amber-400 bg-amber-50 text-amber-800'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'students' ? (
        <StudentsView
          students={students}
          data={data}
          currency={currency}
          selected={selected}
          toggleSelect={toggleSelect}
          setSelected={setSelected}
          bulkLevel={bulkLevel}
          setBulkLevel={setBulkLevel}
          assignLevel={assignLevel}
          unassign={unassign}
        />
      ) : (
        <PreviewView
          currency={currency}
          previewLevel={previewLevel}
          setPreviewLevel={setPreviewLevel}
          previewLesson={previewLesson}
          setPreviewLesson={setPreviewLesson}
          previewQs={previewQs}
          openLessonPreview={openLessonPreview}
          refreshQs={() => previewLesson && setPreviewQs(generateLessonQuiz(previewLesson.id, currency.code, 6))}
        />
      )}
    </div>
  );
};

// ─── Students view ────────────────────────────────────────────────────────────
const StudentsView = ({
  students, data, currency, selected, toggleSelect, setSelected,
  bulkLevel, setBulkLevel, assignLevel, unassign,
}) => {
  const allSelected = selected.size === students.length && students.length > 0;

  if (students.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-amber-200 rounded-2xl p-10 text-center">
        <p className="text-5xl mb-3">💰</p>
        <h3 className="text-xl font-bold text-gray-800 mb-1">No students in this class yet</h3>
        <p className="text-gray-500 text-sm">Add students to your class first, then assign Money Masters levels here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setSelected(allSelected ? new Set() : new Set(students.map((s) => s.id)))}
          className="text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition"
        >
          {allSelected ? '✕ Clear selection' : '☑ Select all'}
        </button>
        <span className="text-sm text-gray-500 font-medium">{selected.size} selected</span>
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={bulkLevel}
            onChange={(e) => setBulkLevel(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white"
          >
            {MM_LEVEL_IDS.map((lvl) => (
              <option key={lvl} value={lvl}>
                Level {lvl} — {MM_LEVELS[lvl].name} ({MM_LEVELS[lvl].years})
              </option>
            ))}
          </select>
          <button
            onClick={() => assignLevel([...selected], bulkLevel)}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-amber-600 transition shadow-sm"
          >
            Assign level
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => unassign([...selected])}
              className="text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg px-3 py-2 transition"
            >
              Unassign
            </button>
          )}
        </div>
      </div>

      {/* Roster */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
          <div className="col-span-3">Student</div>
          <div className="col-span-2">Assigned level</div>
          <div className="col-span-3">Progress</div>
          <div className="col-span-2">Bank</div>
          <div className="col-span-2">Badges</div>
        </div>
        <div className="divide-y divide-gray-50">
          {students.map((s) => {
            const assignment = data.students[s.id];
            const p = s.moneyMastersProgress;
            const level = assignment?.assignedLevel;
            const workingLevel = Math.max(level || 1, p?.unlockedLevel || 1);
            const passed = level ? lessonsPassedInLevel(p, workingLevel) : 0;
            const lessonCount = getLessonsForLevel(workingLevel).length;
            const totalPassed = countTotalLessonsPassed(p);
            const bankTotal = (p?.bank?.balance || 0) + (p?.bank?.savings || 0);
            const badgeCount = (p?.badges || []).length + (p?.bank?.goalsEarned || []).length;
            const on = selected.has(s.id);
            return (
              <div
                key={s.id}
                className={`grid grid-cols-2 md:grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer transition ${on ? 'bg-amber-50' : 'hover:bg-gray-50'}`}
                onClick={() => toggleSelect(s.id)}
              >
                <div className="col-span-2 md:col-span-3 flex items-center gap-2.5 min-w-0">
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-bold shrink-0 ${on ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300 text-transparent'}`}>✓</span>
                  <div className="w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {(s.firstName || '?').charAt(0)}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm truncate">{s.firstName} {s.lastName}</p>
                </div>
                <div className="md:col-span-2">
                  {level ? (
                    <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${LEVEL_BADGE_STYLES[level]}`}>
                      {MM_LEVELS[level].icon} L{level} {MM_LEVELS[level].name}
                      {workingLevel > level && <span title="Auto-advanced past assigned level"> → L{workingLevel}</span>}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Not assigned</span>
                  )}
                </div>
                <div className="md:col-span-3">
                  {level ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-32">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${lessonCount ? (passed / lessonCount) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {passed}/{lessonCount} · {totalPassed}/{TOTAL_LESSONS} total
                        {isLevelComplete(p, workingLevel) && ' 🏆'}
                      </span>
                    </div>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </div>
                <div className="md:col-span-2">
                  {p?.bank ? (
                    <span className="text-xs font-bold text-emerald-600">
                      🏦 {fmt(bankTotal, currency)}
                      {p.bank.savings > 0 && <span className="text-gray-400 font-medium"> ({fmt(p.bank.savings, currency)} saved)</span>}
                    </span>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </div>
                <div className="md:col-span-2">
                  {badgeCount > 0
                    ? <span className="text-xs font-bold text-violet-600">🏅 {badgeCount}</span>
                    : <span className="text-xs text-gray-300">—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level legend */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {MM_LEVEL_IDS.map((lvl) => {
          const info = MM_LEVELS[lvl];
          const count = students.filter((s) => data.students[s.id]?.assignedLevel === lvl).length;
          return (
            <div key={lvl} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
              <p className="font-bold text-gray-800 text-sm">{info.icon} Level {lvl}: {info.name}</p>
              <p className="text-xs text-gray-400 font-medium">{info.years} · {count} student{count !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500 mt-1">{info.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Curriculum preview ───────────────────────────────────────────────────────
const PreviewView = ({
  currency, previewLevel, setPreviewLevel,
  previewLesson, setPreviewLesson, previewQs, openLessonPreview, refreshQs,
}) => {
  const lessons = getLessonsForLevel(previewLevel);

  return (
    <div className="space-y-4">
      {/* level tabs */}
      <div className="flex flex-wrap gap-2">
        {MM_LEVEL_IDS.map((lvl) => (
          <button
            key={lvl}
            onClick={() => { setPreviewLevel(lvl); setPreviewLesson(null); }}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              previewLevel === lvl
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {MM_LEVELS[lvl].icon} L{lvl} {MM_LEVELS[lvl].name}
          </button>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm text-amber-800">
          <span className="font-bold">{MM_LEVELS[previewLevel].icon} {MM_LEVELS[previewLevel].name}</span> ({MM_LEVELS[previewLevel].years}) — {MM_LEVELS[previewLevel].description}{' '}
          Students pass a lesson with {QUIZ_PASS}/{QUIZ_LENGTH}, then beat the Boss Challenge ({BOSS_PASS}/{BOSS_LENGTH}) to complete the level and earn its badge.
        </p>
      </div>

      {/* lesson list */}
      <div className="grid md:grid-cols-2 gap-3">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => openLessonPreview(lesson)}
            className={`text-left bg-white rounded-2xl border-2 p-4 transition shadow-sm hover:shadow-md ${
              previewLesson?.id === lesson.id ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-200'
            }`}
          >
            <p className="font-bold text-gray-800">{lesson.icon} {lesson.id} — {lesson.name}</p>
            <p className="text-sm text-gray-500 mt-1">{lesson.intro}</p>
          </button>
        ))}
      </div>

      {/* lesson detail */}
      {previewLesson && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-bold text-gray-800">
              {previewLesson.icon} Lesson {previewLesson.id}: {previewLesson.name}
            </h3>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 rounded-full px-3 py-1">
              Shown in {currency.flag} {currency.code}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            {previewLesson.cards(currency).map((card, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4">
                <p className="font-bold text-gray-800 text-sm mb-1">{card.title}</p>
                <p className="text-sm text-gray-600">{card.text}</p>
                {card.example && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5 mt-2 font-medium">
                    💡 {card.example}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 italic">⭐ Teacher tip shown to students: “{previewLesson.tip}”</p>

          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-gray-700 text-sm">Sample quiz questions (auto-generated fresh every quiz)</h4>
            <button
              onClick={refreshQs}
              className="px-3 py-1.5 rounded-lg text-sm font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
            >
              🎲 Shuffle
            </button>
          </div>
          {previewQs && (
            <div className="grid sm:grid-cols-2 gap-2">
              {previewQs.map((q) => (
                <div key={q.uniqueId} className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm">
                  <p className="font-semibold text-gray-800">{q.question}</p>
                  {q.type === 'mc' && (
                    <p className="text-xs text-gray-500 mt-0.5">Options: {q.options.join(' · ')}</p>
                  )}
                  <p className="text-xs text-emerald-600 font-bold mt-0.5">Answer: {q.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoneyMasters;
