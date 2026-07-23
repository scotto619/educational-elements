// components/curriculum/literacy/VisualWritingPrompts.js
// ─────────────────────────────────────────────────────────────────────────────
// WRITING STUDIO — teacher side (fully redesigned).
//
//  • Prompt Library — browse visual prompts by text type, with image-specific
//    word banks, sentence starters, hooks and a structure guide.
//  • Present — distraction-free fullscreen mode for classroom displays
//    (no student devices needed), with toggleable scaffolds + keyboard nav.
//  • Student Writing — live review inbox of stories written in the student
//    portal Writing Studio: read, comment, and award XP.
//  • Print — generates a ready-to-photocopy worksheet for any prompt.
//
// Prompt images live in public/Curriculum/Literacy/VisualPrompts/<Type>/.
// Add images (or new text-type folders) and run
// `node scripts/generateWritingPromptsManifest.js` to register them.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { firestore } from '../../../utils/firebase';
import {
  collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, increment,
} from 'firebase/firestore';
import {
  getTextTypes, getTypeConfig, getPrompts, getPromptById, getAccent,
  countWords, timeAgo,
} from './writing-prompts/promptData';

// ═════════════════════════════════════════════════════════════════════════════
// Small shared pieces
// ═════════════════════════════════════════════════════════════════════════════

const WordBankPanel = ({ wordBank, compact = false }) => (
  <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
    {Object.entries(wordBank).map(([category, words]) => (
      <div key={category} className="bg-white/70 border border-slate-200 rounded-xl p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{category}</p>
        <div className="flex flex-wrap gap-1.5">
          {words.map((w) => (
            <span key={w} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-sm font-medium">
              {w}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const StartersPanel = ({ starters }) => (
  <div className="space-y-2">
    {starters.map((s, i) => (
      <div key={i} className="flex items-start gap-2.5 bg-white/70 border border-slate-200 rounded-xl px-3.5 py-2.5">
        <span className="text-slate-300 font-serif text-xl leading-none mt-0.5">“</span>
        <p className="text-slate-700 text-sm italic leading-snug">{s}</p>
      </div>
    ))}
  </div>
);

const StructurePanel = ({ structure, expandedStep, onToggleStep }) => (
  <div className="space-y-1.5">
    {structure.map((step, i) => (
      <div key={step.title} className="bg-white/70 border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => onToggleStep(expandedStep === i ? null : i)}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 transition"
        >
          <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm">{step.title}</p>
            <p className="text-xs text-slate-500">{step.short}</p>
          </div>
          <span className="text-slate-400 text-xs">{expandedStep === i ? '▲' : '▼'}</span>
        </button>
        {expandedStep === i && (
          <div className="px-3.5 pb-3 pt-1 border-t border-slate-100">
            <p className="text-sm text-slate-600 mb-2">{step.detail}</p>
            <ul className="space-y-1">
              {step.tips.map((tip, t) => (
                <li key={t} className="text-xs text-slate-500 flex gap-1.5">
                  <span className="text-slate-300">•</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// Fullscreen presentation mode
// ═════════════════════════════════════════════════════════════════════════════

const PresentationMode = ({ typeId, startIndex, onExit }) => {
  const prompts = useMemo(() => getPrompts(typeId), [typeId]);
  const type = getTypeConfig(typeId);
  const [index, setIndex] = useState(startIndex);
  const [panel, setPanel] = useState(null); // 'words' | 'starters' | 'structure' | null
  const [showHook, setShowHook] = useState(true);
  const [expandedStep, setExpandedStep] = useState(0);

  const prompt = prompts[index];

  const go = useCallback((dir) => {
    setIndex((prev) => (prev + dir + prompts.length) % prompts.length);
  }, [prompts.length]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go, onExit]);

  if (!prompt) return null;

  const panelButton = (key, label) => (
    <button
      onClick={() => setPanel(panel === key ? null : key)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        panel === key ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">{type.icon}</span>
          <div className="min-w-0">
            <p className="text-white font-bold text-lg truncate">{prompt.title}</p>
            <p className="text-slate-400 text-sm">{type.label} · Prompt {prompt.displayNumber} of {prompts.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHook((v) => !v)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${showHook ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            {showHook ? 'Hide hook' : 'Show hook'}
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm font-semibold transition"
          >
            ✕ Exit&nbsp;<span className="hidden sm:inline text-slate-400 font-normal">(Esc)</span>
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-h-0 px-6 pb-2 gap-4">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            <img
              src={prompt.image}
              alt={prompt.title}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl"
            />
            {/* Edge click zones for prev/next */}
            <button onClick={() => go(-1)} className="absolute left-0 top-0 h-full w-16 flex items-center justify-start pl-1 text-white/20 hover:text-white/80 text-5xl transition" aria-label="Previous prompt">‹</button>
            <button onClick={() => go(1)} className="absolute right-0 top-0 h-full w-16 flex items-center justify-end pr-1 text-white/20 hover:text-white/80 text-5xl transition" aria-label="Next prompt">›</button>
          </div>
          {showHook && (
            <p className="text-center text-slate-200 text-xl lg:text-2xl leading-snug font-light px-8 py-4 flex-shrink-0">
              {prompt.hook}
            </p>
          )}
        </div>

        {/* Side scaffold panel */}
        {panel && (
          <div className="w-80 lg:w-96 flex-shrink-0 bg-white/95 backdrop-blur rounded-2xl p-4 overflow-y-auto">
            {panel === 'words' && (
              <>
                <h4 className="font-bold text-slate-800 mb-3 text-lg">Word Bank</h4>
                <WordBankPanel wordBank={prompt.wordBank} compact />
              </>
            )}
            {panel === 'starters' && (
              <>
                <h4 className="font-bold text-slate-800 mb-3 text-lg">Sentence Starters</h4>
                <StartersPanel starters={prompt.starters} />
              </>
            )}
            {panel === 'structure' && (
              <>
                <h4 className="font-bold text-slate-800 mb-3 text-lg">{type.label} Structure</h4>
                <StructurePanel structure={type.structure} expandedStep={expandedStep} onToggleStep={setExpandedStep} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <button onClick={() => go(-1)} className="px-5 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 font-semibold transition">
          ← Previous
        </button>
        <div className="flex items-center gap-2">
          {panelButton('words', 'Word Bank')}
          {panelButton('starters', 'Sentence Starters')}
          {panelButton('structure', 'Structure')}
        </div>
        <button onClick={() => go(1)} className="px-5 py-2.5 rounded-lg bg-white text-slate-900 hover:bg-slate-200 font-semibold transition">
          Next →
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Printable worksheet
// ═════════════════════════════════════════════════════════════════════════════

const printWorksheet = (prompt, type) => {
  const wordBankHtml = Object.entries(prompt.wordBank).map(([cat, words]) => `
    <div class="wb-col">
      <h4>${cat}</h4>
      <p>${words.join(' &nbsp;·&nbsp; ')}</p>
    </div>`).join('');

  const startersHtml = prompt.starters.map((s) => `<li>${s}</li>`).join('');
  const structureHtml = type.structure.map((s, i) => `<li><strong>${i + 1}. ${s.title}</strong> — ${s.short}</li>`).join('');
  const lines = Array.from({ length: 18 }, () => '<div class="line"></div>').join('');

  const w = window.open('', 'Print', 'height=900,width=700');
  if (!w) return;
  w.document.write(`
    <html>
      <head>
        <title>${prompt.title} — ${type.label} Writing</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Georgia, 'Times New Roman', serif; margin: 24px; color: #1e293b; }
          .head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #1e293b; padding-bottom: 8px; margin-bottom: 14px; }
          h1 { font-size: 22px; margin: 0; }
          .meta { font-size: 12px; color: #64748b; }
          .name-line { font-size: 13px; margin-bottom: 12px; }
          img.prompt { width: 100%; max-height: 320px; object-fit: contain; border-radius: 8px; border: 1px solid #cbd5e1; }
          .hook { font-style: italic; font-size: 14px; margin: 10px 0 14px; color: #334155; }
          .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 14px 0 6px; font-family: Arial, sans-serif; }
          .wb { display: flex; gap: 14px; }
          .wb-col { flex: 1; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 10px; }
          .wb-col h4 { margin: 0 0 4px; font-size: 12px; font-family: Arial, sans-serif; }
          .wb-col p { margin: 0; font-size: 11px; line-height: 1.7; }
          ul { margin: 4px 0; padding-left: 18px; font-size: 12px; line-height: 1.6; }
          .line { border-bottom: 1px solid #94a3b8; height: 26px; }
          .two-col { display: flex; gap: 18px; }
          .two-col > div { flex: 1; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="head">
          <h1>${prompt.title}</h1>
          <span class="meta">${type.label} Writing</span>
        </div>
        <p class="name-line">Name: ______________________________ &nbsp;&nbsp; Date: ______________</p>
        <img class="prompt" src="${prompt.image}" alt="${prompt.title}" />
        <p class="hook">${prompt.hook}</p>
        <div class="two-col">
          <div>
            <p class="section-title">Sentence starters</p>
            <ul>${startersHtml}</ul>
          </div>
          <div>
            <p class="section-title">${type.label} structure</p>
            <ul>${structureHtml}</ul>
          </div>
        </div>
        <p class="section-title">Word bank</p>
        <div class="wb">${wordBankHtml}</div>
        <p class="section-title">My writing</p>
        ${lines}
      </body>
    </html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 350);
};

// ═════════════════════════════════════════════════════════════════════════════
// Student Writing — review inbox
// ═════════════════════════════════════════════════════════════════════════════

const QUICK_FEEDBACK = [
  'Fantastic hook — it pulled me straight in! 🎣',
  'Great use of the word bank vocabulary. 💬',
  'I love the details you included. ✨',
  'Can you SHOW the feelings here instead of telling them?',
  'Check your paragraphs — where could a new one start?',
  'What a powerful ending! 🌟',
];

const storyNeedsReview = (story) => {
  if (story.status !== 'submitted') return false;
  const lastFeedback = (story.feedback || []).reduce(
    (latest, f) => (f.createdAt > latest ? f.createdAt : latest), ''
  );
  return !lastFeedback || (story.submittedAt && story.submittedAt > lastFeedback);
};

const StatusBadge = ({ story }) => {
  if (story.status !== 'submitted') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">In progress</span>;
  }
  if (storyNeedsReview(story)) {
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Awaiting feedback</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Reviewed</span>;
};

const StudentWorkReview = ({ students, showToast }) => {
  const classId = students?.[0]?.classId || null;
  const [liveStudents, setLiveStudents] = useState(students || []);
  const [selected, setSelected] = useState(null); // { studentId, storyId }
  const [filter, setFilter] = useState('review'); // 'review' | 'all' | 'drafts' | 'reviewed'
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [awarding, setAwarding] = useState(false);

  // Live listener — story saves in the student portal update students/<id>
  // directly (not the class membership doc), so the students prop alone would
  // go stale. Falls back silently to the prop if the query can't run.
  useEffect(() => {
    if (!classId) return undefined;
    try {
      const q = query(collection(firestore, 'students'), where('classId', '==', classId));
      const unsub = onSnapshot(q, (snap) => {
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
        setLiveStudents(list);
      }, (err) => {
        console.error('Writing Studio: students listener error', err);
        setLiveStudents(students || []);
      });
      return () => unsub();
    } catch (err) {
      console.error('Writing Studio: could not attach students listener', err);
      setLiveStudents(students || []);
      return undefined;
    }
  }, [classId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Flatten stories across the class
  const allStories = useMemo(() => {
    const rows = [];
    (liveStudents || []).forEach((s) => {
      Object.values(s.writingStories || {}).forEach((story) => {
        rows.push({ student: s, story });
      });
    });
    rows.sort((a, b) => (b.story.updatedAt || '').localeCompare(a.story.updatedAt || ''));
    return rows;
  }, [liveStudents]);

  const counts = useMemo(() => ({
    review: allStories.filter((r) => storyNeedsReview(r.story)).length,
    reviewed: allStories.filter((r) => r.story.status === 'submitted' && !storyNeedsReview(r.story)).length,
    drafts: allStories.filter((r) => r.story.status !== 'submitted').length,
    all: allStories.length,
  }), [allStories]);

  const visible = useMemo(() => allStories.filter(({ story }) => {
    if (filter === 'review') return storyNeedsReview(story);
    if (filter === 'reviewed') return story.status === 'submitted' && !storyNeedsReview(story);
    if (filter === 'drafts') return story.status !== 'submitted';
    return true;
  }), [allStories, filter]);

  const selectedRow = useMemo(() => {
    if (!selected) return null;
    const student = (liveStudents || []).find((s) => s.id === selected.studentId);
    const story = student?.writingStories?.[selected.storyId];
    return student && story ? { student, story } : null;
  }, [selected, liveStudents]);

  const sendFeedback = async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || !selectedRow) return;
    setSaving(true);
    try {
      const { student, story } = selectedRow;
      const entry = {
        id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        text: trimmed,
        createdAt: new Date().toISOString(),
      };
      await updateDoc(doc(firestore, 'students', student.id), {
        [`writingStories.${story.id}.feedback`]: arrayUnion(entry),
        [`writingStories.${story.id}.feedbackUpdatedAt`]: entry.createdAt,
        updatedAt: entry.createdAt,
      });
      setComment('');
      showToast('Feedback sent! ✅', 'success');
    } catch (err) {
      console.error('Writing Studio: error sending feedback', err);
      showToast('Could not send feedback. Please try again.', 'error');
    }
    setSaving(false);
  };

  const awardXP = async (amount) => {
    if (!selectedRow || awarding) return;
    setAwarding(true);
    try {
      const { student } = selectedRow;
      await updateDoc(doc(firestore, 'students', student.id), {
        totalPoints: increment(amount),
        updatedAt: new Date().toISOString(),
      });
      showToast(`Awarded ${amount} XP to ${student.firstName}! ⭐`, 'success');
    } catch (err) {
      console.error('Writing Studio: error awarding XP', err);
      showToast('Could not award XP. Please try again.', 'error');
    }
    setAwarding(false);
  };

  if (!classId) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
        <div className="text-5xl mb-3">🧑‍🏫</div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No class connected</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Open the Writing Studio from inside <strong>Classroom Champions → Resources</strong> to
          see the stories your students write in their portal, leave feedback, and award XP.
        </p>
      </div>
    );
  }

  // ── Story detail view ──
  if (selectedRow) {
    const { student, story } = selectedRow;
    const prompt = getPromptById(story.promptId);
    const feedback = [...(story.feedback || [])].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition font-semibold text-sm shadow-sm"
          >
            ← All student writing
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Quick award:</span>
            {[2, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => awardXP(n)}
                disabled={awarding}
                className="px-3 py-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm font-bold transition disabled:opacity-50"
              >
                +{n} XP
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 items-start">
          {/* Story */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{story.title || 'Untitled story'}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  by <span className="font-semibold text-slate-700">{student.firstName} {student.lastName || ''}</span>
                  {' · '}{countWords(story.content)} words
                  {story.submittedAt && <> · handed in {timeAgo(story.submittedAt)}</>}
                </p>
              </div>
              <StatusBadge story={story} />
            </div>
            <div className="px-6 py-5">
              {story.content
                ? story.content.split(/\n+/).map((para, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">{para}</p>
                  ))
                : <p className="text-slate-400 italic">Nothing written yet.</p>}
            </div>
          </div>

          {/* Side: prompt + feedback */}
          <div className="space-y-4">
            {prompt && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <img src={prompt.image} alt={prompt.title} className="w-full aspect-video object-cover" />
                <div className="px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{getTypeConfig(prompt.typeId).label} prompt</p>
                  <p className="font-semibold text-slate-800 text-sm">{prompt.title}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <h4 className="font-bold text-slate-800 mb-3">Feedback</h4>
              {feedback.length === 0 && (
                <p className="text-sm text-slate-400 mb-3">No feedback yet — be the first to cheer them on!</p>
              )}
              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                {feedback.map((f) => (
                  <div key={f.id} className="bg-indigo-50 border border-indigo-100 rounded-xl px-3.5 py-2.5">
                    <p className="text-sm text-slate-700">{f.text}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{timeAgo(f.createdAt)}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_FEEDBACK.map((qf) => (
                  <button
                    key={qf}
                    onClick={() => sendFeedback(qf)}
                    disabled={saving}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 text-xs font-medium transition disabled:opacity-50"
                  >
                    {qf}
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Write feedback for this story…"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                onClick={() => sendFeedback(comment)}
                disabled={saving || !comment.trim()}
                className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition disabled:opacity-40"
              >
                {saving ? 'Sending…' : 'Send feedback'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Inbox list view ──
  const filterTab = (key, label) => (
    <button
      onClick={() => setFilter(key)}
      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
        filter === key ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
      }`}
    >
      {label} <span className={filter === key ? 'text-slate-300' : 'text-slate-400'}>({counts[key]})</span>
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterTab('review', 'To review')}
        {filterTab('reviewed', 'Reviewed')}
        {filterTab('drafts', 'In progress')}
        {filterTab('all', 'All')}
      </div>

      {visible.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {filter === 'review' ? 'Nothing waiting for review' : 'No stories here yet'}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            When students write and hand in stories from the Writing Studio in their portal
            (Learning → Literacy → Writing), they&apos;ll appear here for you to read and comment on.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map(({ student, story }) => {
            const prompt = getPromptById(story.promptId);
            return (
              <button
                key={`${student.id}-${story.id}`}
                onClick={() => setSelected({ studentId: student.id, storyId: story.id })}
                className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition overflow-hidden group"
              >
                {prompt && (
                  <div className="h-24 overflow-hidden">
                    <img src={prompt.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{story.title || 'Untitled story'}</p>
                    <StatusBadge story={story} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {student.firstName} {student.lastName || ''} · {countWords(story.content)} words · {timeAgo(story.updatedAt)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// Prompt Library
// ═════════════════════════════════════════════════════════════════════════════

const PromptLibrary = ({ onPresent, showToast }) => {
  const textTypes = useMemo(() => getTextTypes(), []);
  const [typeId, setTypeId] = useState(textTypes[0]?.id || null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  const prompts = useMemo(() => (typeId ? getPrompts(typeId) : []), [typeId]);
  const type = getTypeConfig(typeId);
  const accent = getAccent(typeId);

  // ── Detail view ──
  if (selectedIndex !== null && prompts[selectedIndex]) {
    const prompt = prompts[selectedIndex];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={() => setSelectedIndex(null)}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition font-semibold text-sm shadow-sm"
          >
            ← All {type.label.toLowerCase()} prompts
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIndex((selectedIndex - 1 + prompts.length) % prompts.length)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
            >←</button>
            <span className="text-sm text-slate-500 font-medium">{prompt.displayNumber} / {prompts.length}</span>
            <button
              onClick={() => setSelectedIndex((selectedIndex + 1) % prompts.length)}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
            >→</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 items-start">
          {/* Image + actions */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <img src={prompt.image} alt={prompt.title} className="w-full object-cover" />
              <div className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${accent.chip}`}>{type.label}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{prompt.title}</h3>
                <p className="text-slate-600 mt-1 italic">{prompt.hook}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onPresent(typeId, selectedIndex)}
                className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
              >
                🖥️ Present full screen
              </button>
              <button
                onClick={() => { printWorksheet(prompt, type); showToast('Preparing worksheet…', 'info'); }}
                className="flex-1 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition shadow-sm"
              >
                🖨️ Print worksheet
              </button>
            </div>
          </div>

          {/* Scaffolds */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`rounded-2xl border p-4 ${accent.soft}`}>
              <h4 className="font-bold text-slate-800 mb-3">Word Bank</h4>
              <WordBankPanel wordBank={prompt.wordBank} compact />
            </div>
            <div className={`rounded-2xl border p-4 ${accent.soft}`}>
              <h4 className="font-bold text-slate-800 mb-3">Sentence Starters</h4>
              <StartersPanel starters={prompt.starters} />
            </div>
            <div className={`rounded-2xl border p-4 ${accent.soft}`}>
              <h4 className="font-bold text-slate-800 mb-3">{type.label} Structure</h4>
              <StructurePanel structure={type.structure} expandedStep={expandedStep} onToggleStep={setExpandedStep} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Gallery view ──
  return (
    <div className="space-y-5">
      {/* Text type selector */}
      <div className="flex flex-wrap gap-2">
        {textTypes.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTypeId(t.id); setSelectedIndex(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition border ${
              typeId === t.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            <span className={typeId === t.id ? 'text-slate-400' : 'text-slate-400'}>· {t.promptCount}</span>
          </button>
        ))}
      </div>

      <p className="text-slate-500 text-sm -mt-1">{type.tagline}. Click a prompt to see its word bank, sentence starters and structure guide — or present it to the class.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {prompts.map((prompt, index) => (
          <button
            key={prompt.id}
            onClick={() => { setSelectedIndex(index); setExpandedStep(null); }}
            className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="aspect-video overflow-hidden bg-slate-100">
              <img
                src={prompt.image}
                alt={prompt.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="px-3.5 py-3">
              <p className="font-bold text-slate-800 text-sm leading-tight truncate">{prompt.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">Prompt {prompt.displayNumber}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const VisualWritingPrompts = ({ showToast = () => {}, students = [] }) => {
  const [tab, setTab] = useState('library'); // 'library' | 'work'
  const [presenting, setPresenting] = useState(null); // { typeId, index }

  const pendingReviews = useMemo(() => {
    let count = 0;
    (students || []).forEach((s) => {
      Object.values(s.writingStories || {}).forEach((story) => {
        if (storyNeedsReview(story)) count += 1;
      });
    });
    return count;
  }, [students]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 rounded-2xl px-6 py-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">✍️</div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Writing Studio</h2>
              <p className="text-slate-300 text-sm mt-0.5">
                Visual prompts with built-in scaffolding — present to the class, print worksheets, and review student writing.
              </p>
            </div>
          </div>
          <div className="flex bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setTab('library')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'library' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/10'}`}
            >
              Prompt Library
            </button>
            <button
              onClick={() => setTab('work')}
              className={`relative px-4 py-2 rounded-lg text-sm font-semibold transition ${tab === 'work' ? 'bg-white text-slate-900' : 'text-white hover:bg-white/10'}`}
            >
              Student Writing
              {pendingReviews > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black flex items-center justify-center">
                  {pendingReviews}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {tab === 'library' && (
        <PromptLibrary
          showToast={showToast}
          onPresent={(typeId, index) => setPresenting({ typeId, index })}
        />
      )}
      {tab === 'work' && <StudentWorkReview students={students} showToast={showToast} />}

      {presenting && (
        <PresentationMode
          typeId={presenting.typeId}
          startIndex={presenting.index}
          onExit={() => setPresenting(null)}
        />
      )}
    </div>
  );
};

export default VisualWritingPrompts;
