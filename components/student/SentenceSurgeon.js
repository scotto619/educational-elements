// components/student/SentenceSurgeon.js — Sentence Surgeon 🩺
// A writing-editing tool for the Learning → Literacy → Writing strand.
// Broken sentences arrive as "patients" and the student operates: tap any word
// they think is wrong and choose the correct treatment from the options.
// Four wards cover the classic editing skills — capitals & full stops,
// question marks & spelling, homophones, and apostrophes & tricky words.
// Careless operations cost points, clean surgeries earn bonuses, and total
// fixes build a medical career from Trainee all the way to Grammar Legend.
// Progress persists to studentData.gameProgress.sentenceSurgeon.
'use client';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ── Puzzle data ──────────────────────────────────────────────────────────────
// Each token: { t: shown } or { t: shown, c: correct, alts: [wrong options] }
// Every sentence has an end-mark token. "▢" means a missing end mark.
const WARDS = [
  {
    id: 1,
    name: 'Capitals Ward',
    emoji: '🩹',
    skill: 'Capital letters and full stops',
    color: 'from-emerald-500 to-teal-600',
    puzzles: [
      { tokens: [{ t: 'the', c: 'The', alts: ['THE'] }, { t: 'dog' }, { t: 'ran' }, { t: 'to' }, { t: 'the' }, { t: 'park' }, { t: '▢', c: '.', alts: ['?'] }] },
      { tokens: [{ t: 'my' }, { t: 'friend' }, { t: 'sam', c: 'Sam', alts: ['SAM'] }, { t: 'likes' }, { t: 'apples' }, { t: '.' }], note: 'Names need capital letters!' },
      { tokens: [{ t: 'We' }, { t: 'went' }, { t: 'swimming' }, { t: 'on' }, { t: 'monday', c: 'Monday', alts: ['MONDAY'] }, { t: '▢', c: '.', alts: ['!'] }] },
      { tokens: [{ t: 'i', c: 'I', alts: ['i.'] }, { t: 'love' }, { t: 'my' }, { t: 'pet' }, { t: 'cat' }, { t: '.' }] },
      { tokens: [{ t: 'the', c: 'The', alts: ['THe'] }, { t: 'sun' }, { t: 'is' }, { t: 'very' }, { t: 'hot' }, { t: '▢', c: '.', alts: ['?'] }] },
      { tokens: [{ t: 'we', c: 'We', alts: ['WE'] }, { t: 'live' }, { t: 'in' }, { t: 'australia', c: 'Australia', alts: ['australia.'] }, { t: '.' }] },
      { tokens: [{ t: 'my', c: 'My', alts: ['MY'] }, { t: 'sister' }, { t: 'plays' }, { t: 'soccer' }, { t: 'with' }, { t: 'emma', c: 'Emma', alts: ['emmA'] }, { t: '.' }] },
      { tokens: [{ t: 'Dad' }, { t: 'cooked' }, { t: 'dinner' }, { t: 'last' }, { t: 'night' }, { t: '▢', c: '.', alts: ['?'] }] },
      { tokens: [{ t: 'school', c: 'School', alts: ['SCHOOL'] }, { t: 'starts' }, { t: 'at' }, { t: 'nine' }, { t: '▢', c: '.', alts: ['!'] }] },
      { tokens: [{ t: 'our', c: 'Our', alts: ['OUR'] }, { t: 'teacher' }, { t: 'read' }, { t: 'us' }, { t: 'a' }, { t: 'story' }, { t: '.' }] },
      { tokens: [{ t: 'ben', c: 'Ben', alts: ['BEN'] }, { t: 'and' }, { t: 'i', c: 'I', alts: ['me'] }, { t: 'built' }, { t: 'a' }, { t: 'fort' }, { t: '.' }] },
      { tokens: [{ t: 'the', c: 'The', alts: ['ThE'] }, { t: 'baby' }, { t: 'is' }, { t: 'sleeping' }, { t: '▢', c: '.', alts: ['?'] }] },
    ],
  },
  {
    id: 2,
    name: 'Spelling Ward',
    emoji: '💊',
    skill: 'Question marks and tricky spellings',
    color: 'from-blue-500 to-indigo-600',
    puzzles: [
      { tokens: [{ t: 'Can' }, { t: 'you' }, { t: 'come' }, { t: 'to' }, { t: 'my' }, { t: 'party' }, { t: '.', c: '?', alts: ['!'] }] },
      { tokens: [{ t: 'My' }, { t: 'best' }, { t: 'frend', c: 'friend', alts: ['freind'] }, { t: 'is' }, { t: 'kind' }, { t: '.' }] },
      { tokens: [{ t: 'What' }, { t: 'time' }, { t: 'is' }, { t: 'it' }, { t: '▢', c: '?', alts: ['.'] }] },
      { tokens: [{ t: 'She' }, { t: 'sed', c: 'said', alts: ['sayed'] }, { t: 'hello' }, { t: 'to' }, { t: 'everyone' }, { t: '.' }] },
      { tokens: [{ t: 'I' }, { t: 'stayed' }, { t: 'home' }, { t: 'becos', c: 'because', alts: ['becuase'] }, { t: 'I' }, { t: 'was' }, { t: 'sick' }, { t: '.' }] },
      { tokens: [{ t: 'Where' }, { t: 'did' }, { t: 'you' }, { t: 'go' }, { t: '.', c: '?', alts: ['!'] }] },
      { tokens: [{ t: 'We' }, { t: 'wint', c: 'went', alts: ['whent'] }, { t: 'to' }, { t: 'the' }, { t: 'beach' }, { t: '.' }] },
      { tokens: [{ t: 'I' }, { t: 'like' }, { t: 'skool', c: 'school', alts: ['schol'] }, { t: 'lunches' }, { t: '.' }] },
      { tokens: [{ t: 'Do' }, { t: 'you' }, { t: 'have' }, { t: 'a' }, { t: 'pet' }, { t: '▢', c: '?', alts: ['.'] }] },
      { tokens: [{ t: 'The' }, { t: 'water' }, { t: 'was' }, { t: 'very' }, { t: 'cold' }, { t: 'wen', c: 'when', alts: ['whn'] }, { t: 'we' }, { t: 'jumped' }, { t: 'in' }, { t: '.' }] },
      { tokens: [{ t: 'Watch' }, { t: 'out' }, { t: 'for' }, { t: 'that' }, { t: 'car' }, { t: '.', c: '!', alts: ['?'] }], note: 'Warnings need excitement!' },
      { tokens: [{ t: 'My' }, { t: 'favrite', c: 'favourite', alts: ['favorit'] }, { t: 'colour' }, { t: 'is' }, { t: 'green' }, { t: '.' }] },
    ],
  },
  {
    id: 3,
    name: 'Homophone Ward',
    emoji: '🩺',
    skill: 'There / their, to / too, your / you’re and friends',
    color: 'from-purple-500 to-fuchsia-600',
    puzzles: [
      { tokens: [{ t: 'The' }, { t: 'kids' }, { t: 'left' }, { t: 'there', c: 'their', alts: ['they’re'] }, { t: 'bags' }, { t: 'outside' }, { t: '.' }] },
      { tokens: [{ t: 'We' }, { t: 'are' }, { t: 'going' }, { t: 'two', c: 'to', alts: ['too'] }, { t: 'the' }, { t: 'shops' }, { t: '.' }] },
      { tokens: [{ t: 'Is' }, { t: 'that' }, { t: 'you’re', c: 'your', alts: ['yore'] }, { t: 'jumper' }, { t: '▢', c: '?', alts: ['.'] }] },
      { tokens: [{ t: 'Their', c: 'There', alts: ['They’re'] }, { t: 'are' }, { t: 'ten' }, { t: 'ducks' }, { t: 'on' }, { t: 'the' }, { t: 'pond' }, { t: '.' }] },
      { tokens: [{ t: 'I' }, { t: 'ate' }, { t: 'to', c: 'too', alts: ['two'] }, { t: 'much' }, { t: 'cake' }, { t: '.' }] },
      { tokens: [{ t: 'Wear', c: 'Where', alts: ['Were'] }, { t: 'did' }, { t: 'the' }, { t: 'cat' }, { t: 'hide' }, { t: '?' }] },
      { tokens: [{ t: 'They’re' }, { t: 'bringing' }, { t: 'there', c: 'their', alts: ['they’re'] }, { t: 'dog' }, { t: 'to' }, { t: 'the' }, { t: 'park' }, { t: '.' }] },
      { tokens: [{ t: 'You’re' }, { t: 'going' }, { t: 'to' }, { t: 'love' }, { t: 'you’re', c: 'your', alts: ['yor'] }, { t: 'present' }, { t: '.' }] },
      { tokens: [{ t: 'We' }, { t: 'where', c: 'were', alts: ['wear'] }, { t: 'late' }, { t: 'for' }, { t: 'the' }, { t: 'bus' }, { t: '.' }] },
      { tokens: [{ t: 'Can' }, { t: 'I' }, { t: 'come' }, { t: 'two', c: 'too', alts: ['to'] }, { t: '▢', c: '?', alts: ['.'] }] },
      { tokens: [{ t: 'Put' }, { t: 'the' }, { t: 'books' }, { t: 'over' }, { t: 'they’re', c: 'there', alts: ['their'] }, { t: '.' }] },
      { tokens: [{ t: 'Your', c: 'You’re', alts: ['Youre'] }, { t: 'sure' }, { t: 'you’re', c: 'your', alts: ['yore'] }, { t: 'keys' }, { t: 'are' }, { t: 'packed' }, { t: '?' }] },
    ],
  },
  {
    id: 4,
    name: 'Apostrophe Ward',
    emoji: '🧬',
    skill: 'Apostrophes, contractions and expert fixes',
    color: 'from-rose-500 to-orange-500',
    puzzles: [
      { tokens: [{ t: 'I' }, { t: 'dont', c: 'don’t', alts: ['do’nt'] }, { t: 'like' }, { t: 'thunderstorms' }, { t: '.' }] },
      { tokens: [{ t: 'The' }, { t: 'dog' }, { t: 'wagged' }, { t: 'it’s', c: 'its', alts: ['its’'] }, { t: 'tail' }, { t: '.' }] },
      { tokens: [{ t: 'Its', c: 'It’s', alts: ['Its’'] }, { t: 'raining' }, { t: 'again' }, { t: '.' }] },
      { tokens: [{ t: 'She' }, { t: 'cant', c: 'can’t', alts: ['ca’nt'] }, { t: 'find' }, { t: 'her' }, { t: 'shoes' }, { t: '.' }] },
      { tokens: [{ t: 'You' }, { t: 'could' }, { t: 'of', c: 'have', alts: ['off'] }, { t: 'told' }, { t: 'me' }, { t: '!' }] },
      { tokens: [{ t: 'Were', c: 'We’re', alts: ['Were’'] }, { t: 'having' }, { t: 'pizza' }, { t: 'tonight' }, { t: '.' }] },
      { tokens: [{ t: 'That' }, { t: 'is' }, { t: 'Toms', c: 'Tom’s', alts: ['Toms’'] }, { t: 'bike' }, { t: '.' }] },
      { tokens: [{ t: 'I' }, { t: 'am' }, { t: 'taller' }, { t: 'then', c: 'than', alts: ['thann'] }, { t: 'my' }, { t: 'brother' }, { t: '.' }] },
      { tokens: [{ t: 'Whos', c: 'Who’s', alts: ['Whose'] }, { t: 'coming' }, { t: 'to' }, { t: 'training' }, { t: '?' }] },
      { tokens: [{ t: 'They' }, { t: 'didnt', c: 'didn’t', alts: ['did’nt'] }, { t: 'hear' }, { t: 'the' }, { t: 'bell' }, { t: '.' }] },
      { tokens: [{ t: 'The' }, { t: 'bird' }, { t: 'built' }, { t: 'its' }, { t: 'nest' }, { t: 'and' }, { t: 'its', c: 'it’s', alts: ['its’'] }, { t: 'beautiful' }, { t: '.' }] },
      { tokens: [{ t: 'Lets', c: 'Let’s', alts: ['Lets’'] }, { t: 'go' }, { t: 'swimming' }, { t: 'after' }, { t: 'school' }, { t: '!' }] },
    ],
  },
];

const RANKS = [
  { name: 'Trainee', emoji: '🎓', need: 0 },
  { name: 'First Aider', emoji: '🩹', need: 10 },
  { name: 'Nurse', emoji: '💉', need: 25 },
  { name: 'Doctor', emoji: '🩺', need: 45 },
  { name: 'Surgeon', emoji: '🧑‍⚕️', need: 70 },
  { name: 'Chief Surgeon', emoji: '⭐', need: 100 },
  { name: 'Grammar Legend', emoji: '👑', need: 150 },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
  const tone = (freq, dur, type = 'sine', vol = 0.09, when = 0) => {
    if (mutedRef.current) return;
    const ac = ensure();
    if (!ac) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };
  return {
    fix: () => { tone(660, 0.09); tone(990, 0.12, 'sine', 0.09, 0.07); },
    wrong: () => tone(190, 0.2, 'sawtooth', 0.09),
    healed: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'sine', 0.09, i * 0.09)); },
    rankUp: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.17, 'sine', 0.1, i * 0.1)); },
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const SentenceSurgeon = ({ studentData, showToast, updateStudentData }) => {
  const [view, setView] = useState('wards');   // wards | surgery
  const [ward, setWard] = useState(null);
  const [order, setOrder] = useState([]);       // shuffled puzzle indices
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [tokens, setTokens] = useState([]);     // working copy with fixed flags
  const [openToken, setOpenToken] = useState(null); // index with options showing
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [ops, setOps] = useState(0);            // operations used this patient
  const [healedThisVisit, setHealedThisVisit] = useState(0);
  const [banner, setBanner] = useState(null);   // {type:'healed'|'oops', text}
  const [totalFixed, setTotalFixed] = useState(0);
  const [muted, setMuted] = useState(false);

  const mutedRef = useRef(false);
  const synthRef = useRef(null);
  const savedTotalRef = useRef(0);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => {
    synthRef.current = createSynth(mutedRef);
    const saved = studentData?.gameProgress?.sentenceSurgeon?.totalFixed || 0;
    setTotalFixed(saved);
    savedTotalRef.current = saved;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rank = useMemo(
    () => RANKS.reduce((acc, r) => (totalFixed >= r.need ? r : acc), RANKS[0]),
    [totalFixed]
  );
  const nextRank = RANKS[RANKS.indexOf(rank) + 1] || null;

  // ── Persistence ─────────────────────────────────────────────────────────────
  const persist = useCallback((newTotal, extraHealed) => {
    if (!studentData || !updateStudentData) return;
    const prev = studentData.gameProgress?.sentenceSurgeon || {};
    Promise.resolve(
      updateStudentData({
        ...studentData,
        gameProgress: {
          ...studentData.gameProgress,
          sentenceSurgeon: {
            ...prev,
            totalFixed: newTotal,
            patientsHealed: (prev.patientsHealed || 0) + extraHealed,
            lastPractised: new Date().toISOString(),
          },
        },
      })
    ).catch((err) => console.error('SentenceSurgeon: save failed', err));
  }, [studentData, updateStudentData]);

  // ── Puzzle setup ────────────────────────────────────────────────────────────
  const puzzleTokens = (w, idx) => {
    const p = w.puzzles[idx];
    const src = p.tokensOverride || p.tokens;
    return src.map((tok) => ({ ...tok, fixed: false }));
  };

  const startWard = (w) => {
    const shuffled = shuffle(w.puzzles.map((_, i) => i));
    setWard(w);
    setOrder(shuffled);
    setPuzzleIdx(0);
    setTokens(puzzleTokens(w, shuffled[0]));
    setScore(0);
    setOps(0);
    setHealedThisVisit(0);
    setOpenToken(null);
    setBanner(null);
    setView('surgery');
  };

  const errorsLeft = tokens.filter((tok) => tok.c && !tok.fixed).length;

  const nextPatient = useCallback(() => {
    const next = puzzleIdx + 1;
    if (next >= order.length) {
      // ward complete → back to wards with a toast
      showToast?.(`🏥 ${ward.name} complete! ${healedThisVisit + 1} patients healed.`, 'success');
      setView('wards');
      return;
    }
    setPuzzleIdx(next);
    setTokens(puzzleTokens(ward, order[next]));
    setOps(0);
    setOpenToken(null);
    setBanner(null);
  }, [puzzleIdx, order, ward, healedThisVisit, showToast]);

  // ── Interactions ────────────────────────────────────────────────────────────
  const tapToken = (idx) => {
    const tok = tokens[idx];
    if (tok.fixed || banner?.type === 'healed') return;
    if (openToken === idx) { setOpenToken(null); return; }
    // build options: keep-as-is + correct (if any) + distractors
    const opts = new Set([tok.t]);
    if (tok.c) opts.add(tok.c);
    (tok.alts || []).forEach((a) => opts.add(a));
    // for correct tokens with no alts, invent one light distractor so
    // "looks right" is still a real decision
    if (!tok.c && opts.size < 2) {
      const w = tok.t;
      opts.add(w.length > 2 ? w.slice(0, -1) + w.slice(-1).toUpperCase() : `${w}${w.slice(-1)}`);
    }
    setOptions(shuffle([...opts]));
    setOpenToken(idx);
  };

  const chooseOption = (choice) => {
    const idx = openToken;
    if (idx == null) return;
    const tok = tokens[idx];
    setOps((o) => o + 1);
    setOpenToken(null);

    if (tok.c) {
      if (choice === tok.c) {
        // correct fix!
        const newTokens = tokens.map((t, i) => (i === idx ? { ...t, t: t.c, fixed: true } : t));
        setTokens(newTokens);
        setScore((s) => s + 20);
        synthRef.current?.fix();
        const remaining = newTokens.filter((t) => t.c && !t.fixed).length;
        if (remaining === 0) {
          // patient healed!
          const fixesHere = newTokens.filter((t) => t.c).length;
          const clean = ops + 1 <= fixesHere; // no wasted operations
          const bonus = clean ? 15 : 0;
          setScore((s) => s + bonus);
          setHealedThisVisit((h) => h + 1);
          setBanner({ type: 'healed', text: clean ? '🌟 PERFECT SURGERY! Patient healed with no wasted operations!' : '💚 Patient healed!' });
          synthRef.current?.healed();
          const newTotal = totalFixed + fixesHere;
          setTotalFixed(newTotal);
          // rank-up check
          const before = RANKS.reduce((acc, r) => (totalFixed >= r.need ? r : acc), RANKS[0]);
          const after = RANKS.reduce((acc, r) => (newTotal >= r.need ? r : acc), RANKS[0]);
          if (after.need > before.need) {
            showToast?.(`${after.emoji} Promoted to ${after.name}!`, 'success');
            setTimeout(() => synthRef.current?.rankUp(), 400);
          }
          persist(newTotal, 1);
          setTimeout(() => nextPatient(), 1800);
        }
      } else if (choice === tok.t) {
        setScore((s) => Math.max(0, s - 5));
        setBanner({ type: 'oops', text: 'That word IS part of the problem — look closer!' });
        synthRef.current?.wrong();
        setTimeout(() => setBanner(null), 1500);
      } else {
        setScore((s) => Math.max(0, s - 5));
        setBanner({ type: 'oops', text: 'Not that treatment — try again!' });
        synthRef.current?.wrong();
        setTimeout(() => setBanner(null), 1500);
      }
    } else {
      // token was fine all along
      if (choice === tok.t) {
        setBanner({ type: 'oops', text: 'Good news — that word was healthy! No points lost for checking.' });
        setTimeout(() => setBanner(null), 1400);
      } else {
        setScore((s) => Math.max(0, s - 5));
        setBanner({ type: 'oops', text: 'Careful! That word was healthy and the operation made it worse!' });
        synthRef.current?.wrong();
        setTimeout(() => setBanner(null), 1600);
      }
    }
  };

  // ── Render: WARD PICKER ─────────────────────────────────────────────────────
  if (view === 'wards') {
    return (
      <div className="space-y-5">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🩺</span>
              <div>
                <h2 className="text-2xl font-bold">Sentence Surgeon</h2>
                <p className="text-teal-100 text-sm">Broken sentences need YOU! Find the problems and operate.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl">{rank.emoji}</p>
              <p className="font-black">{rank.name}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-teal-100 mb-1">
              <span>{totalFixed} errors fixed all-time</span>
              {nextRank && <span>{nextRank.need - totalFixed} more to become {nextRank.name} {nextRank.emoji}</span>}
            </div>
            <div className="h-3 bg-teal-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-300 transition-all duration-700"
                style={{ width: `${nextRank ? Math.min(100, (totalFixed / nextRank.need) * 100) : 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {WARDS.map((w) => (
            <button
              key={w.id}
              onClick={() => startWard(w)}
              className={`text-left rounded-2xl p-5 text-white bg-gradient-to-br ${w.color} hover:scale-[1.02] transition-transform shadow`}
            >
              <p className="text-3xl mb-1">{w.emoji}</p>
              <p className="font-black text-lg">{w.name}</p>
              <p className="text-sm opacity-85">{w.skill}</p>
              <p className="text-xs opacity-70 mt-2">{w.puzzles.length} patients waiting</p>
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-500">
          <b className="text-gray-700">How to operate:</b> read the sentence carefully, tap a word that looks
          wrong, and choose the correct treatment. Fixing every error heals the patient — but operating on
          healthy words costs points!
        </div>
      </div>
    );
  }

  // ── Render: SURGERY ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={() => setView('wards')} className="text-sm font-bold text-gray-400 hover:text-gray-600">
          ← Back to wards
        </button>
        <p className="text-sm font-mono text-gray-500">
          {ward.emoji} {ward.name} · Patient {puzzleIdx + 1}/{order.length}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-mono font-bold text-teal-600">SCORE {score}</p>
          <button
            onClick={() => setMuted((m) => !m)}
            className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className={`rounded-3xl p-8 shadow-lg transition-colors ${
        banner?.type === 'healed' ? 'bg-emerald-50 ring-4 ring-emerald-300' : 'bg-white ring-1 ring-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-bold text-gray-400">
            🤒 This sentence has <span className="text-rose-500 text-lg">{tokens.filter((t) => t.c).length}</span> problem{tokens.filter((t) => t.c).length !== 1 ? 's' : ''}
          </p>
          <p className="text-sm font-bold text-emerald-500">{errorsLeft === 0 ? '' : `${errorsLeft} left`}</p>
        </div>

        {/* the sentence */}
        <p className="text-2xl leading-loose text-center">
          {tokens.map((tok, i) => (
            <span key={i} className="relative inline-block mx-1">
              <button
                onClick={() => tapToken(i)}
                className={`rounded-lg px-1.5 py-0.5 font-semibold transition ${
                  tok.fixed
                    ? 'bg-emerald-100 text-emerald-700 cursor-default'
                    : openToken === i
                      ? 'bg-amber-200 text-amber-900'
                      : tok.t === '▢'
                        ? 'bg-rose-50 text-rose-400 border-2 border-dashed border-rose-200 hover:bg-rose-100'
                        : 'text-gray-800 hover:bg-indigo-100'
                }`}
              >
                {tok.t}
              </button>
              {/* options popover */}
              {openToken === i && (
                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 flex flex-col gap-1 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 min-w-28">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => chooseOption(opt)}
                      className="px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 hover:bg-indigo-500 hover:text-white transition whitespace-nowrap"
                    >
                      {opt === tok.t ? `✓ keep "${opt === '▢' ? 'nothing' : opt}"` : opt}
                    </button>
                  ))}
                </span>
              )}
            </span>
          ))}
        </p>

        {/* banner */}
        <div className="min-h-10 mt-5 text-center">
          {banner && (
            <p className={`font-bold ${banner.type === 'healed' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {banner.text}
            </p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Tap a word that looks wrong, then pick the right treatment. The dashed box means an end mark might be missing!
      </p>
    </div>
  );
};

export default SentenceSurgeon;
