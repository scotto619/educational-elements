// components/student/StudentWritingStudio.js
// ─────────────────────────────────────────────────────────────────────────────
// WRITING STUDIO — student side.
//
// Students pick a visual prompt, then write in a scaffolded workspace:
//  • the prompt image (with zoom) + a story hook and planning questions
//  • a clickable word bank and sentence starters that insert at the cursor
//  • a success-criteria checklist per text type
//  • autosaving drafts, word count, and "hand in to teacher"
//  • teacher feedback appears right in the workspace ✨
//
// Stories persist to studentData.writingStories (a map keyed by story id) via
// the portal's updateStudentData, so they sync to the teacher's Writing
// Studio review inbox in Classroom Champions.
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  getTextTypes, getTypeConfig, getPrompts, getPromptById,
  countWords, timeAgo,
} from '../curriculum/literacy/writing-prompts/promptData';
import { containsProfanity } from '../../utils/profanityFilter';

const MAX_CHARS = 20000;
const SUBMIT_XP = 5;

const newStoryId = () => `story_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const hasNewFeedback = (story) =>
  Boolean(story?.feedbackUpdatedAt && story.feedbackUpdatedAt > (story.feedbackSeenAt || ''));

// ─────────────────────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = ({ title, icon, defaultOpen = false, badge = null, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
      >
        <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <span>{icon}</span>{title}
          {badge}
        </span>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const StoryStatusBadge = ({ story }) => {
  if (story.status === 'submitted') {
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Handed in ✅</span>;
  }
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">Draft</span>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const StudentWritingStudio = ({ studentData, showToast = () => {}, updateStudentData }) => {
  const [view, setView] = useState('home');          // 'home' | 'pickType' | 'pickPrompt' | 'write'
  const [pickedType, setPickedType] = useState(null);
  const [activeStoryId, setActiveStoryId] = useState(null);

  // Editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [checklist, setChecklist] = useState({});
  const [saveState, setSaveState] = useState('saved'); // 'saved' | 'unsaved' | 'saving'
  const [submitting, setSubmitting] = useState(false);
  const [zoomImage, setZoomImage] = useState(false);

  const textareaRef = useRef(null);
  const studentRef = useRef(studentData);
  useEffect(() => { studentRef.current = studentData; }, [studentData]);

  const stories = useMemo(() => {
    const map = studentData?.writingStories || {};
    return Object.values(map).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [studentData]);

  const activeStory = activeStoryId ? (studentData?.writingStories || {})[activeStoryId] : null;
  const activePrompt = activeStory ? getPromptById(activeStory.promptId) : null;
  const activeType = activeStory ? getTypeConfig(activeStory.promptType) : null;
  const wordCount = countWords(content);

  // ── Persistence ─────────────────────────────────────────────────────────────

  const persistStory = useCallback(async (patch, { silent = true } = {}) => {
    const current = studentRef.current?.writingStories || {};
    const existing = current[patch.id] || {};
    const nowIso = new Date().toISOString();
    const merged = { ...existing, ...patch, updatedAt: nowIso };
    const ok = await updateStudentData({
      ...(patch.__xp ? { totalPoints: (studentRef.current?.totalPoints || 0) + patch.__xp } : {}),
      writingStories: { ...current, [merged.id]: (({ __xp, ...rest }) => rest)(merged) },
    });
    if (ok === false) {
      if (!silent) showToast('Could not save your story. Check your connection and try again.', 'error');
      return false;
    }
    return true;
  }, [updateStudentData, showToast]);

  // Debounced autosave while writing
  useEffect(() => {
    if (view !== 'write' || !activeStoryId || saveState !== 'unsaved') return undefined;
    const t = setTimeout(async () => {
      setSaveState('saving');
      const ok = await persistStory({ id: activeStoryId, title, content, checklist });
      setSaveState(ok ? 'saved' : 'unsaved');
    }, 1800);
    return () => clearTimeout(t);
  }, [view, activeStoryId, title, content, checklist, saveState, persistStory]);

  const saveNow = async ({ silent = false } = {}) => {
    if (!activeStoryId) return true;
    setSaveState('saving');
    const ok = await persistStory({ id: activeStoryId, title, content, checklist }, { silent });
    setSaveState(ok ? 'saved' : 'unsaved');
    if (ok && !silent) showToast('Story saved! 💾', 'success');
    return ok;
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const startStory = async (prompt) => {
    const id = newStoryId();
    const nowIso = new Date().toISOString();
    const story = {
      id,
      promptType: prompt.typeId,
      promptId: prompt.id,
      title: '',
      content: '',
      checklist: {},
      status: 'draft',
      feedback: [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    const ok = await persistStory(story, { silent: false });
    if (!ok) return;
    setActiveStoryId(id);
    setTitle('');
    setContent('');
    setChecklist({});
    setSaveState('saved');
    setView('write');
  };

  const openStory = (story) => {
    setActiveStoryId(story.id);
    setTitle(story.title || '');
    setContent(story.content || '');
    setChecklist(story.checklist || {});
    setSaveState('saved');
    setView('write');
    if (hasNewFeedback(story)) {
      persistStory({ id: story.id, feedbackSeenAt: new Date().toISOString() });
    }
  };

  const closeEditor = async () => {
    if (saveState !== 'saved') await saveNow({ silent: true });
    setActiveStoryId(null);
    setView('home');
  };

  const deleteStory = async (story) => {
    const sure = typeof window !== 'undefined'
      ? window.confirm(`Delete "${story.title || 'Untitled story'}"? This cannot be undone.`)
      : false;
    if (!sure) return;
    const current = { ...(studentRef.current?.writingStories || {}) };
    delete current[story.id];
    const ok = await updateStudentData({ writingStories: current });
    if (ok === false) showToast('Could not delete the story. Please try again.', 'error');
    else showToast('Story deleted.', 'info');
  };

  const handInStory = async () => {
    if (submitting) return;
    if (!title.trim()) { showToast('Give your story a title before handing it in! ✏️', 'error'); return; }
    if (wordCount < 10) { showToast('Write a little more before handing in — aim for at least a paragraph!', 'error'); return; }
    if (containsProfanity(title) || containsProfanity(content)) {
      showToast('Please check your language before handing this in. 🙈', 'error');
      return;
    }
    setSubmitting(true);
    const firstSubmit = activeStory?.status !== 'submitted' && !activeStory?.submittedAt;
    const ok = await persistStory({
      id: activeStoryId,
      title,
      content,
      checklist,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      ...(firstSubmit ? { __xp: SUBMIT_XP } : {}),
    }, { silent: false });
    setSubmitting(false);
    if (ok) {
      setSaveState('saved');
      showToast(
        firstSubmit
          ? `Story handed in to your teacher! +${SUBMIT_XP} XP 🎉`
          : 'Updated story handed in to your teacher! 📬',
        'success'
      );
      setView('home');
      setActiveStoryId(null);
    }
  };

  // Insert text at the cursor in the writing area
  const insertAtCursor = (text, { addSpace = true } = {}) => {
    const el = textareaRef.current;
    const insert = addSpace ? `${text} ` : text;
    if (!el) {
      setContent((c) => c + insert);
      setSaveState('unsaved');
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + insert + content.slice(end);
    if (next.length > MAX_CHARS) return;
    setContent(next);
    setSaveState('unsaved');
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + insert.length;
      el.setSelectionRange(pos, pos);
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: editor
  // ═══════════════════════════════════════════════════════════════════════════

  if (view === 'write' && activeStory && activePrompt && activeType) {
    const feedback = [...(activeStory.feedback || [])].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    return (
      <div className="space-y-4">
        {/* Editor header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={closeEditor}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition"
          >
            ← My stories
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-slate-500 font-medium">
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </span>
            <span className={`text-xs font-semibold ${
              saveState === 'saved' ? 'text-emerald-600' : saveState === 'saving' ? 'text-sky-600' : 'text-amber-600'
            }`}>
              {saveState === 'saved' ? '✓ Saved' : saveState === 'saving' ? 'Saving…' : '● Unsaved changes'}
            </span>
            <button
              onClick={() => saveNow()}
              disabled={saveState === 'saving'}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold transition disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handInStory}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Handing in…' : activeStory.status === 'submitted' ? '📬 Hand in again' : '📬 Hand in to teacher'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 items-start">
          {/* Writing area */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 pt-5">
              <input
                value={title}
                onChange={(e) => { setTitle(e.target.value.slice(0, 120)); setSaveState('unsaved'); }}
                placeholder="My story title…"
                className="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 focus:outline-none border-b-2 border-slate-100 focus:border-indigo-300 pb-3 transition-colors"
              />
            </div>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => { setContent(e.target.value.slice(0, MAX_CHARS)); setSaveState('unsaved'); }}
              placeholder={`Start writing your ${activeType.label.toLowerCase()} piece here…\n\nTip: click words in the Word Bank or a Sentence Starter to drop them straight into your writing.`}
              className="w-full min-h-[420px] px-5 py-4 text-slate-700 leading-relaxed focus:outline-none resize-y placeholder-slate-300"
            />
          </div>

          {/* Scaffolding sidebar */}
          <div className="space-y-3">
            {/* Prompt */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button onClick={() => setZoomImage(true)} className="block w-full relative group">
                <img src={activePrompt.image} alt={activePrompt.title} className="w-full aspect-video object-cover" />
                <span className="absolute bottom-2 right-2 bg-slate-900/70 text-white text-xs font-semibold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition">
                  🔍 Enlarge
                </span>
              </button>
              <div className="px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{activeType.label} prompt</p>
                <p className="font-bold text-slate-800">{activePrompt.title}</p>
                <p className="text-sm text-slate-500 italic mt-1 leading-snug">{activePrompt.hook}</p>
              </div>
            </div>

            {/* Teacher feedback */}
            {feedback.length > 0 && (
              <SectionCard
                title="Teacher feedback"
                icon="💬"
                defaultOpen
                badge={hasNewFeedback(activeStory) ? <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-black">NEW</span> : null}
              >
                <div className="space-y-2">
                  {feedback.map((f) => (
                    <div key={f.id} className="bg-indigo-50 border border-indigo-100 rounded-xl px-3.5 py-2.5">
                      <p className="text-sm text-slate-700">{f.text}</p>
                      <p className="text-[11px] text-slate-400 mt-1">Your teacher · {timeAgo(f.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Word bank */}
            <SectionCard title="Word Bank" icon="📚" defaultOpen>
              <p className="text-xs text-slate-400 mb-2">Click a word to add it to your writing.</p>
              <div className="space-y-3">
                {Object.entries(activePrompt.wordBank).map(([category, words]) => (
                  <div key={category}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {words.map((w) => (
                        <button
                          key={w}
                          onClick={() => insertAtCursor(w)}
                          className="px-2 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-700 rounded-lg text-sm font-medium transition active:scale-95"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Sentence starters */}
            <SectionCard title="Sentence Starters" icon="🚀">
              <p className="text-xs text-slate-400 mb-2">Stuck? Click one to drop it in, then keep going.</p>
              <div className="space-y-2">
                {activePrompt.starters.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => insertAtCursor(s, { addSpace: true })}
                    className="w-full text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 italic transition active:scale-[0.99]"
                  >
                    “{s}”
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* Structure guide */}
            <SectionCard title={`${activeType.label} Structure`} icon="🗺️">
              <div className="space-y-2">
                {activeType.structure.map((step, i) => (
                  <div key={step.title} className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{step.title}</p>
                      <p className="text-xs text-slate-500 leading-snug">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Checklist */}
            <SectionCard title="Before you hand in…" icon="✅">
              <div className="space-y-1.5">
                {activeType.successCriteria.map((item, i) => (
                  <label key={i} className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={Boolean(checklist[i])}
                      onChange={(e) => { setChecklist((c) => ({ ...c, [i]: e.target.checked })); setSaveState('unsaved'); }}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`text-sm transition ${checklist[i] ? 'text-slate-400 line-through' : 'text-slate-600 group-hover:text-slate-800'}`}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </SectionCard>

            {/* Writer's craft tips */}
            <SectionCard title="Writer's Toolbox" icon="🧰">
              <div className="space-y-2.5">
                {activeType.craft.map((c) => (
                  <div key={c.name}>
                    <p className="text-sm font-semibold text-slate-700">{c.name}</p>
                    <p className="text-xs text-slate-500 leading-snug">{c.tip}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Image zoom overlay */}
        {zoomImage && (
          <div
            className="fixed inset-0 z-[100] bg-slate-950/90 flex items-center justify-center p-6 cursor-zoom-out"
            onClick={() => setZoomImage(false)}
          >
            <img src={activePrompt.image} alt={activePrompt.title} className="max-w-full max-h-full rounded-xl shadow-2xl" />
            <button className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl" aria-label="Close">✕</button>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: pick a prompt (within a type)
  // ═══════════════════════════════════════════════════════════════════════════

  if (view === 'pickPrompt' && pickedType) {
    const type = getTypeConfig(pickedType);
    const prompts = getPrompts(pickedType);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView('pickType')}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition font-semibold text-sm shadow-sm"
        >
          ← Writing types
        </button>
        <div className={`bg-gradient-to-r ${type.gradient} rounded-2xl px-6 py-5 text-white shadow-lg`}>
          <h3 className="text-xl font-bold flex items-center gap-2">{type.icon} {type.label} Prompts</h3>
          <p className="text-white/80 text-sm mt-0.5">{type.tagline}. Pick the picture that sparks your imagination!</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => startStory(prompt)}
              className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="aspect-video overflow-hidden bg-slate-100">
                <img src={prompt.image} alt={prompt.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="px-3.5 py-2.5">
                <p className="font-bold text-slate-800 text-sm leading-tight truncate">{prompt.title}</p>
                <p className="text-xs text-indigo-500 font-semibold mt-0.5">Write this one →</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: pick a text type
  // ═══════════════════════════════════════════════════════════════════════════

  if (view === 'pickType') {
    const types = getTextTypes();
    return (
      <div className="space-y-4">
        <button
          onClick={() => setView('home')}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition font-semibold text-sm shadow-sm"
        >
          ← My stories
        </button>
        <h3 className="text-xl font-bold text-slate-800">What kind of writing today?</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => { setPickedType(t.id); setView('pickPrompt'); }}
              className={`text-left rounded-2xl p-6 text-white bg-gradient-to-br ${t.gradient} hover:scale-[1.02] transition-transform shadow-lg`}
            >
              <span className="text-4xl block mb-2">{t.icon}</span>
              <p className="font-black text-xl mb-1">{t.label}</p>
              <p className="text-sm opacity-90 leading-snug">{t.tagline}</p>
              <p className="text-xs font-bold bg-white/20 rounded-full px-2.5 py-1 inline-block mt-3">{t.promptCount} picture prompts</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: home — my stories
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 rounded-2xl px-6 py-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">✍️ Writing Studio</h2>
            <p className="text-white/80 text-sm mt-1">
              Pick a picture, write your story, and hand it in — your teacher can read it and send you feedback!
            </p>
          </div>
          <button
            onClick={() => setView('pickType')}
            className="bg-white text-indigo-700 px-5 py-3 rounded-xl font-black shadow-md hover:scale-105 transition-transform"
          >
            + Start a new story
          </button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="text-6xl mb-3">📝</div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Your bookshelf is empty… for now!</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
            Every great author starts with a blank page. Pick a picture prompt and let your imagination do the rest.
          </p>
          <button
            onClick={() => setView('pickType')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-sm"
          >
            Write my first story
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => {
            const prompt = getPromptById(story.promptId);
            const words = countWords(story.content);
            return (
              <div
                key={story.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all duration-200 group relative"
              >
                <button onClick={() => openStory(story)} className="block w-full text-left">
                  {prompt && (
                    <div className="h-28 overflow-hidden bg-slate-100 relative">
                      <img src={prompt.image} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {hasNewFeedback(story) && (
                        <span className="absolute top-2 right-2 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow animate-pulse">
                          💬 New feedback!
                        </span>
                      )}
                    </div>
                  )}
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-slate-800 truncate">{story.title || 'Untitled story'}</p>
                      <StoryStatusBadge story={story} />
                    </div>
                    <p className="text-xs text-slate-400">
                      {getTypeConfig(story.promptType).label} · {words} word{words !== 1 ? 's' : ''} · {timeAgo(story.updatedAt)}
                    </p>
                    {(story.feedback || []).length > 0 && (
                      <p className="text-xs text-indigo-500 font-semibold mt-1.5">
                        💬 {story.feedback.length} teacher comment{story.feedback.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => deleteStory(story)}
                  className="absolute bottom-2.5 right-2.5 text-slate-300 hover:text-rose-500 text-sm transition p-1"
                  title="Delete story"
                  aria-label="Delete story"
                >
                  🗑️
                </button>
              </div>
            );
          })}

          {/* New story card */}
          <button
            onClick={() => setView('pickType')}
            className="min-h-[180px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 transition flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500"
          >
            <span className="text-4xl">＋</span>
            <span className="font-bold text-sm">New story</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentWritingStudio;
