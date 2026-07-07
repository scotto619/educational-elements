// components/curriculum/typing/KeyboardQuest.js — Keyboard Quest (teacher hub)
// Touch-typing program for the Resources tab: assign stages to students, watch
// live WPM/accuracy/belt progress across the class, and preview every lesson.
// Auto-saves via the standard toolkitData contract.
//
// DATA CONTRACT (do not change — student app depends on it):
//   toolkitData.keyboardQuest = {
//     students: { [studentId]: { assignedStage: 1..5, assignedAt } },
//   }
// Student progress lives on the student record as keyboardQuestProgress
// (written student-side), so this roster reads live data from `students`.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  KQ_STAGES, KQ_STAGE_IDS, KQ_LESSONS, getLessonsForStage, KQ_TOTAL_LESSONS,
  generateLessonText, generateBeltTest,
  lessonsPassedInStage, bestWpm, avgAccuracy, totalStars,
} from '../../../utils/keyboardQuestEngine';

const STAGE_BADGE = {
  1: 'bg-amber-100 text-amber-700',
  2: 'bg-orange-100 text-orange-700',
  3: 'bg-emerald-100 text-emerald-700',
  4: 'bg-sky-100 text-sky-700',
  5: 'bg-violet-100 text-violet-700',
};

const KeyboardQuest = ({
  students = [],
  showToast = () => {},
  saveData = () => {},
  loadedData = {},
}) => {
  const [data, setData] = useState({ students: {} });
  const [selected, setSelected] = useState(new Set());
  const [bulkStage, setBulkStage] = useState(1);
  const [view, setView] = useState('students'); // 'students' | 'preview'
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'wpm'
  const [previewStage, setPreviewStage] = useState(1);
  const [previewLesson, setPreviewLesson] = useState(null);
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    setData({ students: loadedData?.keyboardQuest?.students || {} });
  }, [loadedData]);

  // Awaits the save and only confirms on success — a failed write now shows an
  // error instead of silently looking saved until the page reloads.
  const persist = useCallback(async (updated, message) => {
    setData(updated);
    try {
      const ok = await saveData({
        toolkitData: {
          ...(loadedData || {}),
          keyboardQuest: { ...updated, lastSaved: new Date().toISOString() },
        },
      });
      if (ok === false) {
        showToast('Save failed — your change may not stick. Please try again.', 'error');
        return;
      }
      if (message) showToast(message, 'success');
    } catch (err) {
      console.error('KeyboardQuest: save failed', err);
      showToast('Error saving changes', 'error');
    }
  }, [saveData, loadedData, showToast]);

  const assignStage = (ids, stage) => {
    if (ids.length === 0) return showToast('Select at least one student first', 'info');
    const updated = { ...data, students: { ...data.students } };
    ids.forEach((id) => {
      updated.students[id] = { ...(updated.students[id] || {}), assignedStage: stage, assignedAt: new Date().toISOString() };
    });
    persist(updated, `${ids.length} student${ids.length !== 1 ? 's' : ''} assigned to Stage ${stage} — ${KQ_STAGES[stage].name}`);
    setSelected(new Set());
  };

  const unassign = (ids) => {
    const updated = { ...data, students: { ...data.students } };
    ids.forEach((id) => { delete updated.students[id]; });
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

  // ── Class stats ─────────────────────────────────────────────────────────────
  const assignedCount = students.filter((s) => data.students[s.id]?.assignedStage).length;
  const classStats = useMemo(() => {
    const withData = students.map((s) => s.keyboardQuestProgress).filter(Boolean);
    const wpms = withData.map((p) => bestWpm(p)).filter((w) => w > 0);
    const belts = withData.reduce((n, p) => n + Object.keys(p.belts || {}).length, 0);
    const lessons = withData.reduce((n, p) => n + Object.values(p.completedLessons || {}).filter((r) => r?.passed).length, 0);
    return {
      avgWpm: wpms.length ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length * 10) / 10 : 0,
      topWpm: wpms.length ? Math.max(...wpms) : 0,
      belts, lessons,
    };
  }, [students]);

  const sortedStudents = useMemo(() => {
    const rows = [...students];
    if (sortBy === 'wpm') rows.sort((a, b) => bestWpm(b.keyboardQuestProgress) - bestWpm(a.keyboardQuestProgress));
    else rows.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    return rows;
  }, [students, sortBy]);

  const openPreview = (lesson) => {
    setPreviewLesson(lesson);
    setPreviewText(generateLessonText(lesson.id));
  };

  const allSelected = selected.size === students.length && students.length > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-indigo-700 to-violet-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⌨️</span>
            <div>
              <h2 className="text-2xl font-bold">Keyboard Quest</h2>
              <p className="text-indigo-200 text-sm mt-0.5">
                Touch-typing curriculum · 5 belts · {KQ_TOTAL_LESSONS} lessons from home row to Speed Legend
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('students')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${view === 'students' ? 'bg-white text-indigo-700 shadow-sm' : 'bg-white/20 hover:bg-white/30'}`}
            >
              👥 Students
            </button>
            <button
              onClick={() => setView('preview')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${view === 'preview' ? 'bg-white text-indigo-700 shadow-sm' : 'bg-white/20 hover:bg-white/30'}`}
            >
              📖 Curriculum
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium">
          <span className="bg-white/20 rounded-full px-3 py-1">👥 {assignedCount}/{students.length} assigned</span>
          <span className="bg-white/20 rounded-full px-3 py-1">📈 Class avg {classStats.avgWpm} WPM</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🏎️ Top {classStats.topWpm} WPM</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🥋 {classStats.belts} belts earned</span>
          <span className="bg-white/20 rounded-full px-3 py-1">✅ {classStats.lessons} lessons passed</span>
        </div>
      </div>

      {view === 'students' ? (
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
            <button
              onClick={() => setSortBy(sortBy === 'name' ? 'wpm' : 'name')}
              className="text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-3 py-2 transition"
            >
              Sort: {sortBy === 'name' ? 'A→Z' : '🏆 WPM'}
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={bulkStage}
                onChange={(e) => setBulkStage(Number(e.target.value))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 bg-white"
              >
                {KQ_STAGE_IDS.map((s) => (
                  <option key={s} value={s}>Stage {s} — {KQ_STAGES[s].name} ({KQ_STAGES[s].targetWpm}+ WPM)</option>
                ))}
              </select>
              <button
                onClick={() => assignStage([...selected], bulkStage)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-sm"
              >
                Assign stage
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
          {students.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center">
              <p className="text-5xl mb-3">⌨️</p>
              <h3 className="text-xl font-bold text-gray-800 mb-1">No students in this class yet</h3>
              <p className="text-gray-500 text-sm">Add students first, then assign Keyboard Quest stages here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                <div className="col-span-3">Student</div>
                <div className="col-span-2">Stage</div>
                <div className="col-span-3">Progress</div>
                <div className="col-span-2">Best WPM · Acc</div>
                <div className="col-span-2">Belts · Stars</div>
              </div>
              <div className="divide-y divide-gray-50">
                {sortedStudents.map((s) => {
                  const assignment = data.students[s.id];
                  const p = s.keyboardQuestProgress;
                  const stage = assignment?.assignedStage;
                  const workingStage = Math.min(5, Math.max(stage || 1, p?.unlockedStage || 1));
                  const passed = stage ? lessonsPassedInStage(p, workingStage) : 0;
                  const lessonCount = getLessonsForStage(workingStage).length;
                  const wpm = bestWpm(p);
                  const acc = avgAccuracy(p);
                  const beltCount = Object.keys(p?.belts || {}).length;
                  const stars = totalStars(p);
                  const on = selected.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`grid grid-cols-2 md:grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer transition ${on ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleSelect(s.id)}
                    >
                      <div className="col-span-2 md:col-span-3 flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-bold shrink-0 ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-transparent'}`}>✓</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {(s.firstName || '?').charAt(0)}
                        </div>
                        <p className="font-semibold text-gray-800 text-sm truncate">{s.firstName} {s.lastName}</p>
                      </div>
                      <div className="md:col-span-2">
                        {stage ? (
                          <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${STAGE_BADGE[stage]}`}>
                            {KQ_STAGES[stage].icon} S{stage}
                            {workingStage > stage && <span title="Auto-advanced by earning belts"> → S{workingStage}</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Not assigned</span>
                        )}
                      </div>
                      <div className="md:col-span-3">
                        {stage ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-32">
                              <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${(passed / lessonCount) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{passed}/{lessonCount} lessons</span>
                          </div>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </div>
                      <div className="md:col-span-2">
                        {wpm > 0 ? (
                          <span className="text-xs font-bold text-emerald-600">
                            🏎️ {wpm} WPM{acc !== null && <span className="text-gray-400 font-medium"> · {acc}%</span>}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </div>
                      <div className="md:col-span-2">
                        {(beltCount > 0 || stars > 0) ? (
                          <span className="text-xs font-bold text-violet-600">
                            {beltCount > 0 && <span title={Object.keys(p.belts).map((b) => KQ_STAGES[b]?.belt).join(', ')}>🥋 {beltCount}</span>}
                            {stars > 0 && <span className="ml-1.5 text-amber-500">⭐ {stars}</span>}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage legend */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {KQ_STAGE_IDS.map((sid) => {
              const info = KQ_STAGES[sid];
              const count = students.filter((s) => data.students[s.id]?.assignedStage === sid).length;
              return (
                <div key={sid} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
                  <p className="font-bold text-gray-800 text-sm">{info.icon} Stage {sid}: {info.name}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    {info.beltIcon} {info.belt} · {info.targetWpm}+ WPM at {info.targetAcc}%+ · {count} student{count !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── Curriculum preview ── */
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {KQ_STAGE_IDS.map((sid) => (
              <button
                key={sid}
                onClick={() => { setPreviewStage(sid); setPreviewLesson(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                  previewStage === sid ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {KQ_STAGES[sid].icon} S{sid} {KQ_STAGES[sid].name}
              </button>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
            <p className="text-sm text-indigo-800">
              <span className="font-bold">{KQ_STAGES[previewStage].icon} {KQ_STAGES[previewStage].name}</span> — {KQ_STAGES[previewStage].description}{' '}
              Students pass lessons at {KQ_STAGES[previewStage].targetWpm}+ WPM with {KQ_STAGES[previewStage].targetAcc}%+ accuracy, then take the
              belt test to earn the {KQ_STAGES[previewStage].beltIcon} {KQ_STAGES[previewStage].belt} and unlock the next stage.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {getLessonsForStage(previewStage).map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => openPreview(lesson)}
                className={`text-left bg-white rounded-2xl border-2 p-4 transition shadow-sm hover:shadow-md ${
                  previewLesson?.id === lesson.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'
                }`}
              >
                <p className="font-bold text-gray-800">
                  {lesson.icon} {lesson.id.replace('t', '')} — {lesson.name}
                  {lesson.newKeys.length > 0 && (
                    <span className="ml-2 text-xs font-bold text-indigo-500">new: {lesson.newKeys.join(' ')}</span>
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">{lesson.tip}</p>
              </button>
            ))}
          </div>

          {previewLesson && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-lg font-bold text-gray-800">{previewLesson.icon} {previewLesson.name} — sample text</h3>
                <button
                  onClick={() => setPreviewText(generateLessonText(previewLesson.id))}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                >
                  🎲 Shuffle
                </button>
              </div>
              <p className="font-mono text-lg text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed break-words">{previewText}</p>
              <p className="text-xs text-gray-400">
                Text is generated fresh for every attempt, using only the keys students have learned so far.
              </p>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Belt test sample (Stage {previewStage})</p>
                <p className="font-mono text-sm text-gray-600 break-words">{generateBeltTest(previewStage)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyboardQuest;
