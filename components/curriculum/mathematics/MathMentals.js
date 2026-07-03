// components/curriculum/mathematics/MathMentals.js — Math Mentals (teacher hub)
// Rebuilt for the Resources tab: create groups, assign starting levels, watch
// progress at a glance, nudge individual students up or down a sublevel, and
// preview the exact questions any sublevel generates. Auto-saves every change.
//
// DATA CONTRACT (do not change — student app + API depend on it):
//   toolkitData.mathMentalsGroups = [{
//     id, name, color, createdAt,
//     students: [{ id, firstName, lastName, currentLevel, progress, streak }]
//   }]
// Students take one 10-question test per day at their currentLevel and
// auto-advance after 3 perfect scores in a row (handled student-side).
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MATH_LEVELS,
  MATH_SUBLEVELS,
  getSublevelsForLevel,
  getNextSublevel,
  getPrevSublevel,
  generateQuestionSet,
} from '../../../utils/mathMentalsEngine';

const GROUP_COLORS = [
  { id: 'blue', dot: 'bg-blue-500', soft: 'bg-blue-50', ring: 'ring-blue-200', text: 'text-blue-700' },
  { id: 'emerald', dot: 'bg-emerald-500', soft: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-700' },
  { id: 'purple', dot: 'bg-purple-500', soft: 'bg-purple-50', ring: 'ring-purple-200', text: 'text-purple-700' },
  { id: 'rose', dot: 'bg-rose-500', soft: 'bg-rose-50', ring: 'ring-rose-200', text: 'text-rose-700' },
  { id: 'amber', dot: 'bg-amber-500', soft: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-700' },
  { id: 'teal', dot: 'bg-teal-500', soft: 'bg-teal-50', ring: 'ring-teal-200', text: 'text-teal-700' },
];

// Old groups stored tailwind classes like "bg-blue-500" — map both formats.
const colorTheme = (color) =>
  GROUP_COLORS.find((c) => c.id === color || c.dot === color) || GROUP_COLORS[0];

const levelOf = (sublevelId) => Math.floor(Number(sublevelId)) || 1;

const latestAttempt = (progress) => {
  const dates = Object.keys(progress || {}).sort();
  if (dates.length === 0) return null;
  const d = dates[dates.length - 1];
  return { date: d, ...progress[d] };
};

const shortDate = (iso) => {
  try {
    return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
};

// ─── Main component ───────────────────────────────────────────────────────────
const MathMentals = ({
  students = [],
  showToast = () => {},
  saveData = () => {},
  loadedData = {},
}) => {
  const [groups, setGroups] = useState([]);
  const [modal, setModal] = useState(null); // null | { mode:'create' } | { mode:'edit', group }
  const [previewLevel, setPreviewLevel] = useState('1.1');
  const [previewQs, setPreviewQs] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const data = loadedData?.mathMentalsGroups;
    setGroups(Array.isArray(data) ? data : []);
  }, [loadedData]);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  const persist = useCallback((updatedGroups, message) => {
    setGroups(updatedGroups);
    try {
      saveData({
        toolkitData: {
          ...(loadedData || {}),
          mathMentalsGroups: updatedGroups,
          lastSaved: new Date().toISOString(),
        },
      });
      if (message) showToast(message, 'success');
    } catch (err) {
      console.error('MathMentals: save failed', err);
      showToast('Error saving changes', 'error');
    }
  }, [saveData, loadedData, showToast]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const assignedIds = useMemo(
    () => new Set(groups.flatMap((g) => (g.students || []).map((s) => s.id))),
    [groups]
  );
  const unassigned = useMemo(
    () => students.filter((s) => !assignedIds.has(s.id)),
    [students, assignedIds]
  );
  const groupOf = useCallback(
    (studentId) => groups.find((g) => (g.students || []).some((s) => s.id === studentId)),
    [groups]
  );

  // ── Group mutations ─────────────────────────────────────────────────────────
  const upsertGroup = ({ id, name, colorId, memberIds, startingLevel }) => {
    const editing = id ? groups.find((g) => g.id === id) : null;
    const newEntry = (student) => ({
      id: student.id,
      firstName: student.firstName || 'Unknown',
      lastName: student.lastName || '',
      currentLevel: startingLevel,
      progress: {},
      streak: 0,
    });

    const members = memberIds.map((sid) => {
      const student = students.find((s) => s.id === sid);
      // keep existing level/progress if they were already in ANY group
      const existing =
        editing?.students?.find((s) => s.id === sid) ||
        groups.flatMap((g) => g.students || []).find((s) => s.id === sid);
      return existing
        ? { ...existing, firstName: student?.firstName || existing.firstName, lastName: student?.lastName || existing.lastName }
        : newEntry(student);
    });

    const groupData = {
      id: id || `mathgroup_${Date.now()}`,
      name: name.trim(),
      color: colorId,
      students: members,
      createdAt: editing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // a student lives in exactly one group: strip members from all other groups
    const others = groups
      .filter((g) => g.id !== groupData.id)
      .map((g) => ({ ...g, students: (g.students || []).filter((s) => !memberIds.includes(s.id)) }));

    persist([...others.filter((g) => g.students.length > 0 || g.id === groupData.id), groupData],
      editing ? `Group "${groupData.name}" updated` : `Group "${groupData.name}" created`);
    setModal(null);
  };

  const deleteGroup = (group) => {
    if (!window.confirm(`Delete group "${group.name}"? Students keep their progress if you re-add them later today, but the group assignment is removed.`)) return;
    persist(groups.filter((g) => g.id !== group.id), `Group "${group.name}" deleted`);
  };

  const removeStudent = (group, studentId) => {
    persist(
      groups.map((g) => (g.id === group.id
        ? { ...g, students: g.students.filter((s) => s.id !== studentId) }
        : g)),
      'Student removed from group'
    );
  };

  const shiftStudentLevel = (group, studentId, dir) => {
    const entry = group.students.find((s) => s.id === studentId);
    if (!entry) return;
    const next = dir > 0 ? getNextSublevel(entry.currentLevel) : getPrevSublevel(entry.currentLevel);
    if (!next) return;
    persist(
      groups.map((g) => (g.id === group.id
        ? {
          ...g,
          students: g.students.map((s) => (s.id === studentId
            ? { ...s, currentLevel: next, streak: 0 }
            : s)),
        }
        : g)),
      `Level set to ${next} — ${MATH_SUBLEVELS[next]?.name}`
    );
  };

  // ── Question preview ────────────────────────────────────────────────────────
  const refreshPreview = useCallback((sublevelId) => {
    setPreviewLevel(sublevelId);
    setPreviewQs(generateQuestionSet(sublevelId, 6));
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧮</span>
            <div>
              <h2 className="text-2xl font-bold">Math Mentals</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                Daily number-fact practice · students level up after 3 perfect scores in a row
              </p>
            </div>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-50 transition shadow-sm"
          >
            ＋ New Group
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 text-xs font-medium">
          <span className="bg-white/20 rounded-full px-3 py-1">👥 {students.length} students</span>
          <span className="bg-white/20 rounded-full px-3 py-1">🗂️ {groups.length} groups</span>
          <span className="bg-white/20 rounded-full px-3 py-1">✅ Changes save automatically</span>
        </div>
      </div>

      {/* Unassigned students */}
      {unassigned.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-amber-800 font-semibold text-sm">
              ⚠️ {unassigned.length} student{unassigned.length !== 1 ? 's' : ''} not in a math group yet
            </p>
            <button
              onClick={() => setModal({ mode: 'create', preselect: unassigned.map((s) => s.id) })}
              className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg px-3 py-1.5 transition"
            >
              Assign them now →
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {unassigned.map((s) => (
              <span key={s.id} className="bg-white border border-amber-200 text-amber-800 text-xs font-medium rounded-full px-2.5 py-1">
                {s.firstName} {s.lastName?.charAt(0) || ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {groups.length === 0 && (
        <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center">
          <p className="text-5xl mb-3">🧮</p>
          <h3 className="text-xl font-bold text-gray-800 mb-1">No math groups yet</h3>
          <p className="text-gray-500 text-sm mb-5 max-w-md mx-auto">
            Create a group, choose students, and pick a starting level. Each student then gets a
            daily 10-question mental-math test at exactly their level.
          </p>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow"
          >
            ＋ Create your first group
          </button>
        </div>
      )}

      {/* Group cards */}
      {groups.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => {
            const theme = colorTheme(group.color);
            return (
              <div key={group.id} className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden`}>
                {/* card header */}
                <div className={`flex items-center justify-between px-4 py-3 ${theme.soft} border-b border-gray-100`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-3 h-3 rounded-full ${theme.dot} shrink-0`} />
                    <h3 className="font-bold text-gray-800 truncate">{group.name}</h3>
                    <span className="text-xs text-gray-500 shrink-0">
                      {group.students?.length || 0} student{(group.students?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setModal({ mode: 'edit', group })}
                      title="Edit group"
                      className="w-8 h-8 rounded-lg hover:bg-white/70 transition text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteGroup(group)}
                      title="Delete group"
                      className="w-8 h-8 rounded-lg hover:bg-white/70 transition text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* students */}
                <div className="divide-y divide-gray-50">
                  {(group.students || []).map((s) => {
                    const cfg = MATH_SUBLEVELS[s.currentLevel];
                    const last = latestAttempt(s.progress);
                    const days = Object.keys(s.progress || {}).length;
                    return (
                      <div key={s.id} className="px-4 py-2.5 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${theme.dot} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                          {(s.firstName || '?').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {s.firstName} {s.lastName}
                            {s.streak > 0 && (
                              <span className="ml-1.5 text-xs text-orange-500 font-bold" title={`${s.streak} perfect score${s.streak !== 1 ? 's' : ''} in a row`}>
                                🔥{s.streak}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            <span className={`font-bold ${theme.text}`}>{s.currentLevel}</span>
                            {cfg ? ` · ${cfg.name}` : ''}
                            {days > 0 && ` · ${days} day${days !== 1 ? 's' : ''} practised`}
                          </p>
                        </div>
                        {last && (
                          <span
                            title={`Last test: ${shortDate(last.date)}`}
                            className={`text-xs font-bold rounded-full px-2 py-0.5 shrink-0 ${
                              last.score === 10 ? 'bg-green-100 text-green-700'
                                : last.score >= 7 ? 'bg-blue-100 text-blue-700'
                                  : 'bg-orange-100 text-orange-600'
                            }`}
                          >
                            {last.score}/10
                          </span>
                        )}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => shiftStudentLevel(group, s.id, -1)}
                            disabled={!getPrevSublevel(s.currentLevel)}
                            title="Move down one sublevel"
                            className="w-7 h-7 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition font-bold text-gray-600"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => shiftStudentLevel(group, s.id, 1)}
                            disabled={!getNextSublevel(s.currentLevel)}
                            title="Move up one sublevel"
                            className="w-7 h-7 rounded-lg text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition font-bold text-gray-600"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => removeStudent(group, s.id)}
                            title="Remove from group"
                            className="w-7 h-7 rounded-lg text-xs hover:bg-red-50 hover:text-red-500 transition text-gray-400 ml-0.5"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(group.students || []).length === 0 && (
                    <p className="px-4 py-4 text-sm text-gray-400 text-center">No students in this group</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Question preview */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <button
          onClick={() => {
            setShowPreview((v) => !v);
            if (!previewQs) refreshPreview(previewLevel);
          }}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="font-bold text-gray-800">🔍 Preview questions by level</span>
          <span className="text-gray-400 text-sm">{showPreview ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {showPreview && (
          <div className="px-5 pb-5 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => refreshPreview(`${lvl}.1`)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                    levelOf(previewLevel) === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {MATH_LEVELS[lvl].icon} Level {lvl}
                </button>
              ))}
              <select
                value={previewLevel}
                onChange={(e) => refreshPreview(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 bg-white"
              >
                {getSublevelsForLevel(levelOf(previewLevel)).map((id) => (
                  <option key={id} value={id}>
                    {id} — {MATH_SUBLEVELS[id].name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => refreshPreview(previewLevel)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-cyan-100 text-cyan-700 hover:bg-cyan-200 transition"
              >
                🎲 Shuffle
              </button>
            </div>
            {previewQs && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {previewQs.map((q) => (
                  <div key={q.uniqueId} className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm">
                    <p className="font-semibold text-gray-800">{q.question}</p>
                    {q.display && <p className="text-purple-600 tracking-widest break-all">{q.display}</p>}
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">Answer: {q.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <GroupModal
          key={modal.group?.id || 'create'}
          mode={modal.mode}
          group={modal.group}
          preselect={modal.preselect}
          students={students}
          groupOf={groupOf}
          onCancel={() => setModal(null)}
          onSave={upsertGroup}
        />
      )}
    </div>
  );
};

// ─── Create / edit group modal ────────────────────────────────────────────────
const GroupModal = ({ mode, group, preselect, students, groupOf, onCancel, onSave }) => {
  const [name, setName] = useState(group?.name || '');
  const [colorId, setColorId] = useState(colorTheme(group?.color).id);
  const [selected, setSelected] = useState(
    () => new Set(group ? group.students.map((s) => s.id) : (preselect || []))
  );
  const [startLevel, setStartLevel] = useState('1.1');
  const [pickLevelTab, setPickLevelTab] = useState(1);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const newMembers = [...selected].filter(
    (id) => !group?.students?.some((s) => s.id === id) && !groupOf(id)
  );

  const submit = () => {
    if (!name.trim()) return alert('Please give the group a name.');
    if (selected.size === 0) return alert('Please select at least one student.');
    onSave({
      id: group?.id,
      name,
      colorId,
      memberIds: [...selected],
      startingLevel: startLevel,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-800">
            {mode === 'edit' ? '✏️ Edit group' : '＋ New math group'}
          </h3>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        <div className="p-6 space-y-5">
          {/* name + colour */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Group name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rockets"
                className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Colour</label>
              <div className="flex gap-1.5 mt-1.5">
                {GROUP_COLORS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorId(c.id)}
                    className={`w-8 h-8 rounded-full ${c.dot} transition ${colorId === c.id ? 'ring-4 ring-offset-1 ' + c.ring : 'opacity-50 hover:opacity-100'}`}
                    title={c.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* students */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Students ({selected.size} selected)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-1.5 max-h-52 overflow-y-auto pr-1">
              {students.map((s) => {
                const inThisGroup = group?.students?.some((gs) => gs.id === s.id);
                const otherGroup = !inThisGroup && groupOf(s.id);
                const on = selected.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`text-left rounded-xl px-3 py-2 border transition ${
                      on
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {on ? '✓ ' : ''}{s.firstName} {s.lastName?.charAt(0) || ''}
                    </p>
                    {otherGroup && (
                      <p className="text-[10px] text-amber-600 font-medium truncate">
                        moves from {otherGroup.name}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* starting level for NEW members */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Starting level {mode === 'edit' ? '(only applies to newly added students)' : ''}
            </label>
            <div className="flex flex-wrap gap-2 mt-1.5 items-center">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => { setPickLevelTab(lvl); setStartLevel(`${lvl}.1`); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition ${
                    pickLevelTab === lvl ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={MATH_LEVELS[lvl].description}
                >
                  {MATH_LEVELS[lvl].icon} {lvl}
                </button>
              ))}
              <select
                value={startLevel}
                onChange={(e) => setStartLevel(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 bg-white flex-1 min-w-44"
              >
                {getSublevelsForLevel(pickLevelTab).map((id) => (
                  <option key={id} value={id}>
                    {id} — {MATH_SUBLEVELS[id].name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {MATH_LEVELS[pickLevelTab].description} · {newMembers.length} student{newMembers.length !== 1 ? 's' : ''} will start at {startLevel}.
              Existing members keep their current level and progress.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow"
          >
            {mode === 'edit' ? 'Save changes' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MathMentals;
