// components/curriculum/mathematics/ColumnStrategy.js
// Column Strategy Lab — fully interactive column addition & subtraction
// with guided carrying (trading) and borrowing. Used by BOTH the student
// portal (StudentMaths) and the teacher Resources tab (ResourcesTab).
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
const placeName = (i) => PLACE_NAMES[i] || `10^${i}`;

const digitsOf = (n) => String(n).split('').reverse().map(Number); // index 0 = ones
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Count how many columns need a carry / borrow
const countRegroups = (op, a, b) => {
  const aD = digitsOf(a);
  const bD = digitsOf(b);
  const cols = Math.max(aD.length, bD.length);
  let count = 0;
  if (op === 'add') {
    let carry = 0;
    for (let i = 0; i < cols; i++) {
      const total = (aD[i] || 0) + (bD[i] || 0) + carry;
      if (total > 9) { count++; carry = 1; } else carry = 0;
    }
  } else {
    const work = aD.map(d => d);
    for (let i = 0; i < cols; i++) {
      const bd = bD[i] || 0;
      if (work[i] < bd) {
        count++;
        let j = i + 1;
        while (work[j] === 0) j++;
        work[j] -= 1;
        for (let k = j - 1; k > i; k--) work[k] = 9;
        work[i] += 10;
      }
    }
  }
  return count;
};

// Generate a problem matching the settings (rejection sampling)
const genProblem = (op, numDigits, regroup) => {
  for (let t = 0; t < 500; t++) {
    const min = Math.pow(10, numDigits - 1);
    const max = Math.pow(10, numDigits) - 1;
    let a = randInt(min, max);
    const shorter = numDigits > 2 && Math.random() < 0.25;
    let b = shorter
      ? randInt(Math.pow(10, numDigits - 2), Math.pow(10, numDigits - 1) - 1)
      : randInt(min, max);
    if (op === 'sub') {
      if (b > a) [a, b] = [b, a];
      if (a === b) continue;
    }
    const regs = countRegroups(op, a, b);
    if (regroup === 'always' && regs === 0) continue;
    if (regroup === 'never' && regs > 0) continue;
    return { a, b };
  }
  // Safe fallbacks
  return op === 'add' ? { a: 47, b: 38 } : { a: 72, b: 38 };
};

// Apply a borrow into column i on a working-digit array. Returns info for narration.
const applyBorrowCascade = (work, i) => {
  let j = i + 1;
  while (work[j] === 0) j++;
  const donorOrig = work[j];
  work[j] -= 1;
  for (let k = j - 1; k > i; k--) work[k] = 9;
  work[i] += 10;
  return { donorIdx: j, donorOrig, crossedZeros: j - i - 1 };
};

// ─── Practice step builder ────────────────────────────────────────────────────
// Produces an ordered list of interactive steps for a problem.
const buildSteps = (op, a, b) => {
  const aD = digitsOf(a);
  const bD = digitsOf(b);
  const cols = Math.max(aD.length, bD.length);
  const steps = [];
  if (op === 'add') {
    let carry = 0;
    for (let i = 0; i < cols; i++) {
      const ad = aD[i] ?? null;
      const bd = bD[i] ?? null;
      const total = (ad || 0) + (bd || 0) + carry;
      steps.push({ kind: 'sum', col: i, expected: total, carryIn: carry, ad, bd, isLast: i === cols - 1 });
      if (total > 9) {
        carry = 1;
        if (i < cols - 1) steps.push({ kind: 'carryTap', col: i, expected: i + 1 });
      } else {
        carry = 0;
      }
    }
  } else {
    const work = aD.map(d => d);
    for (let i = 0; i < cols; i++) {
      const bd = bD[i] ?? null;
      const needBorrow = work[i] < (bd || 0);
      if (bd !== null) {
        steps.push({ kind: 'borrowAsk', col: i, needBorrow, topVal: work[i], bottom: bd });
      }
      if (needBorrow) {
        steps.push({ kind: 'borrowTap', col: i, expected: i + 1 });
        applyBorrowCascade(work, i);
      }
      steps.push({ kind: 'sub', col: i, expected: work[i] - (bd || 0), topVal: work[i], bottom: bd });
    }
  }
  return { steps, cols, aD, bD };
};

// ─── Learn mode: worked examples → snapshots ──────────────────────────────────

const LEARN_EXAMPLES = [
  { id: 'add-basic', op: 'add', a: 52, b: 36, emoji: '🌱', title: 'Addition — the basics', blurb: 'No carrying — a gentle warm-up.' },
  { id: 'add-carry', op: 'add', a: 47, b: 38, emoji: '🎒', title: 'Addition with carrying', blurb: 'The ones make more than 9 — time to carry!' },
  { id: 'add-double', op: 'add', a: 476, b: 287, emoji: '🔥', title: 'Carrying twice!', blurb: 'Two carries in one sum. You can handle it.' },
  { id: 'sub-basic', op: 'sub', a: 75, b: 43, emoji: '🧊', title: 'Subtraction — the basics', blurb: 'No borrowing — take away column by column.' },
  { id: 'sub-borrow', op: 'sub', a: 72, b: 38, emoji: '🤝', title: 'Subtraction with borrowing', blurb: 'Not enough ones? Borrow from next door!' },
  { id: 'sub-zero', op: 'sub', a: 305, b: 127, emoji: '🕳️', title: 'Borrowing across a zero', blurb: 'The trickiest one — the zero has nothing to lend!' },
];

const buildLearnSnapshots = (op, a, b) => {
  const aD = digitsOf(a);
  const bD = digitsOf(b);
  const cols = Math.max(aD.length, bD.length);
  const snaps = [];
  const state = { carries: {}, work: aD.map(d => d), answer: {} };
  const snap = (text, activeCol = null) => snaps.push({
    carries: { ...state.carries },
    work: [...state.work],
    answer: { ...state.answer },
    text,
    activeCol,
  });

  if (op === 'add') {
    snap(`We're adding ${a} + ${b}. Line the numbers up so ones sit above ones, tens above tens. In the column strategy we ALWAYS start on the right, with the ones.`);
    let carry = 0;
    for (let i = 0; i < cols; i++) {
      const ad = aD[i] ?? null;
      const bd = bD[i] ?? null;
      const total = (ad || 0) + (bd || 0) + carry;
      const bits = [];
      if (ad !== null) bits.push(String(ad));
      if (bd !== null) bits.push(String(bd));
      if (carry) bits.push('the carried 1');
      snap(`Look at the ${placeName(i)} column: ${bits.join(' + ')} = ${total}.`, i);
      if (total > 9) {
        state.answer[i] = total % 10;
        if (i < cols - 1) {
          state.carries[i + 1] = 1;
          snap(`${total} is more than 9, so it can't all fit in one column! Write the ${total % 10} in the answer, and CARRY the 1 (worth ten ${placeName(i)} = one ${placeName(i + 1).replace(/s$/, '')}) to the top of the ${placeName(i + 1)} column.`, i);
          carry = 1;
        } else {
          state.answer[i + 1] = Math.floor(total / 10);
          snap(`${total} is more than 9 — but there's no next column to carry to, so the 1 walks straight down into the answer. Write the whole ${total}.`, i);
          carry = 0;
        }
      } else {
        state.answer[i] = total;
        snap(`${total} fits in one column — just write it in the answer. Easy!`, i);
        carry = 0;
      }
    }
    snap(`🎉 All columns done! ${a} + ${b} = ${a + b}. Right to left, carry when a column makes 10 or more — that's the whole strategy!`);
  } else {
    snap(`We're solving ${a} − ${b}. The bigger number goes on TOP. Start on the right with the ones — always top digit minus bottom digit.`);
    for (let i = 0; i < cols; i++) {
      const bd = bD[i] ?? null;
      const topVal = state.work[i];
      if (bd === null) {
        state.answer[i] = topVal;
        snap(`The ${placeName(i)} column has nothing underneath — nothing to take away! The ${topVal} comes straight down into the answer.`, i);
        continue;
      }
      const needBorrow = topVal < bd;
      snap(`Look at the ${placeName(i)} column: can we take ${bd} away from ${topVal}?${needBorrow ? ` No! ${topVal} is too small.` : ` Yes — ${topVal} is big enough.`}`, i);
      if (needBorrow) {
        const before = [...state.work];
        const info = applyBorrowCascade(state.work, i);
        if (info.crossedZeros === 0) {
          snap(`Time to BORROW from next door! The ${placeName(i + 1)} digit ${before[i + 1]} lends 1 (that 1 is worth ten ${placeName(i)}). Cross out the ${before[i + 1]}, write ${state.work[i + 1]}, and our ${topVal} becomes ${state.work[i]}.`, i);
        } else {
          snap(`We need to borrow — but next door is a 0, and 0 has nothing to lend! So the 0 borrows from ITS neighbour first: the ${before[info.donorIdx]} becomes ${state.work[info.donorIdx]}, the 0 becomes ${info.crossedZeros > 1 ? '9s' : 'a 9'} (it got 10, then lent 1), and our ${topVal} becomes ${state.work[i]}. Phew!`, i);
        }
      }
      const result = state.work[i] - bd;
      state.answer[i] = result;
      snap(`Now subtract: ${state.work[i]} − ${bd} = ${result}. Write it in the answer.`, i);
    }
    const leadingZeros = String(a - b).length < cols;
    snap(`🎉 All done! ${a} − ${b} = ${a - b}.${leadingZeros ? ' (We can ignore any zeros at the front of the answer.)' : ''} Remember: if the top digit is too small, borrow from next door!`);
  }
  return { snaps, cols, aD, bD };
};

// ─── Board renderer (shared by Learn + Practice) ─────────────────────────────

const DigitCell = ({ children, className = '' }) => (
  <div className={`h-12 sm:h-16 flex items-center justify-center font-mono font-black text-3xl sm:text-5xl ${className}`}>
    {children}
  </div>
);

const Board = ({
  op, cols, aD, bD, carries, work, answer,
  activeCol, carryTapMode, onCarryTap, topTapMode, onTopTap, shakeKey,
}) => {
  // Display columns: leftmost extra column for addition overflow
  const extra = op === 'add' ? 1 : 0;
  const displayCols = [];
  for (let i = cols - 1 + extra; i >= 0; i--) displayCols.push(i);

  return (
    <div
      key={shakeKey}
      className={`relative bg-white rounded-3xl border-4 border-indigo-100 shadow-lg px-4 sm:px-8 py-5 sm:py-7 inline-block ${shakeKey ? 'cs-shake' : ''}`}
      style={{
        backgroundImage: 'linear-gradient(#eef2ff 1px, transparent 1px), linear-gradient(90deg, #eef2ff 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div className="flex items-end">
        {/* Operator column */}
        <div className="flex flex-col justify-end mr-1 sm:mr-2">
          <div className="h-8 sm:h-10" />
          <DigitCell className="text-transparent select-none">0</DigitCell>
          <DigitCell className="text-indigo-500">{op === 'add' ? '+' : '−'}</DigitCell>
          <div className="h-1" />
          <DigitCell className="text-transparent select-none">0</DigitCell>
        </div>

        {displayCols.map((i) => {
          const isActive = activeCol === i;
          const topDigit = op === 'sub' ? (aD[i] ?? null) : (aD[i] ?? null);
          const curWork = op === 'sub' && work ? work[i] : null;
          const borrowed = op === 'sub' && work && aD[i] !== undefined && curWork !== aD[i];
          const carryHere = carries && carries[i];
          const showCarrySlot = carryTapMode && !carryHere && i <= cols - 1 + extra;
          const topTappable = topTapMode && op === 'sub' && aD[i] !== undefined;
          const ansVal = answer ? answer[i] : undefined;

          return (
            <div
              key={i}
              className={`flex flex-col w-14 sm:w-20 rounded-2xl transition-all duration-300 ${isActive ? 'bg-yellow-100/90 ring-4 ring-amber-300 shadow-md' : ''}`}
            >
              {/* Carry row */}
              <div className="h-8 sm:h-10 flex items-center justify-center">
                {carryHere ? (
                  <span className="cs-pop inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-orange-500 text-white font-black text-sm sm:text-lg shadow">
                    1
                  </span>
                ) : showCarrySlot ? (
                  <button
                    onClick={() => onCarryTap?.(i)}
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-dashed border-orange-400 bg-orange-50 hover:bg-orange-200 hover:scale-110 transition-all animate-pulse"
                    aria-label={`carry spot above ${placeName(i)}`}
                  />
                ) : null}
              </div>

              {/* Top number (with borrow cross-outs for subtraction) */}
              {topTappable ? (
                <button
                  onClick={() => onTopTap?.(i)}
                  className="rounded-xl hover:bg-emerald-100 ring-2 ring-emerald-300 ring-dashed transition-all hover:scale-105 cs-wiggle"
                >
                  <BorrowableDigit orig={aD[i]} cur={curWork} borrowed={borrowed} />
                </button>
              ) : (
                <div>
                  {topDigit !== null || (op === 'sub' && aD[i] !== undefined) ? (
                    op === 'sub'
                      ? <BorrowableDigit orig={aD[i]} cur={curWork} borrowed={borrowed} />
                      : <DigitCell className="text-slate-800">{topDigit !== null ? topDigit : ''}</DigitCell>
                  ) : (
                    <DigitCell> </DigitCell>
                  )}
                </div>
              )}

              {/* Bottom number */}
              <DigitCell className="text-slate-800">{bD[i] !== undefined ? bD[i] : ''}</DigitCell>

              {/* Rule line */}
              <div className="h-1 bg-slate-800 rounded-full mx-1" />

              {/* Answer row */}
              <DigitCell className="text-indigo-600">
                {ansVal !== undefined ? <span className="cs-pop inline-block">{ansVal}</span> : ''}
              </DigitCell>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Subtraction top digit that can show a cross-out + new value
const BorrowableDigit = ({ orig, cur, borrowed }) => {
  if (orig === undefined) return <DigitCell> </DigitCell>;
  if (!borrowed) return <DigitCell className="text-slate-800">{orig}</DigitCell>;
  return (
    <div className="h-12 sm:h-16 flex flex-col items-center justify-center leading-none">
      <span className="cs-pop text-emerald-600 font-mono font-black text-base sm:text-2xl">{cur}</span>
      <span className="text-rose-400 font-mono font-bold text-lg sm:text-2xl line-through decoration-rose-500 decoration-2 opacity-70">{orig}</span>
    </div>
  );
};

// ─── Number pad ───────────────────────────────────────────────────────────────

const NumberPad = ({ buffer, onDigit, onBackspace, onCheck, disabled }) => (
  <div className="w-full max-w-[260px]">
    <div className="bg-slate-800 text-white rounded-xl h-14 mb-2 flex items-center justify-center font-mono font-black text-3xl tracking-widest">
      {buffer || <span className="text-slate-500">?</span>}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button key={n} onClick={() => onDigit(n)} disabled={disabled}
          className="bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 text-slate-800 font-black text-2xl py-3 rounded-xl shadow-sm transition-all active:scale-90 disabled:opacity-40">
          {n}
        </button>
      ))}
      <button onClick={onBackspace} disabled={disabled}
        className="bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-500 font-black text-xl py-3 rounded-xl transition-all active:scale-90 disabled:opacity-40">
        ⌫
      </button>
      <button onClick={() => onDigit(0)} disabled={disabled}
        className="bg-white border-2 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 text-slate-800 font-black text-2xl py-3 rounded-xl shadow-sm transition-all active:scale-90 disabled:opacity-40">
        0
      </button>
      <button onClick={onCheck} disabled={disabled || !buffer}
        className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xl py-3 rounded-xl shadow transition-all active:scale-90 disabled:opacity-40">
        ✓
      </button>
    </div>
  </div>
);

// ─── Confetti ─────────────────────────────────────────────────────────────────

const Confetti = () => {
  const pieces = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      emoji: ['🎉', '⭐', '✨', '🌟', '🎊'][i % 5],
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.2,
      size: 18 + Math.random() * 22,
    })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {pieces.map((p, i) => (
        <span key={i} className="absolute cs-fall" style={{
          left: `${p.left}%`, top: '-10%', fontSize: p.size,
          animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
        }}>{p.emoji}</span>
      ))}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ColumnStrategy = ({ showToast = () => {} }) => {
  const [mode, setMode] = useState('learn'); // learn | practice

  // ── Learn state ──
  const [learnExample, setLearnExample] = useState(null); // example object
  const [learnStep, setLearnStep] = useState(0);
  const learnData = useMemo(
    () => learnExample ? buildLearnSnapshots(learnExample.op, learnExample.a, learnExample.b) : null,
    [learnExample]
  );

  // ── Practice settings ──
  const [opSetting, setOpSetting] = useState('add'); // add | sub | mixed
  const [digitSetting, setDigitSetting] = useState(2); // 2 | 3 | 4
  const [regroupSetting, setRegroupSetting] = useState('mixed'); // mixed | always | never

  // ── Practice state ──
  const [problem, setProblem] = useState(null); // {op,a,b,steps,cols,aD,bD}
  const [stepIdx, setStepIdx] = useState(0);
  const [carries, setCarries] = useState({});
  const [work, setWork] = useState([]);
  const [answer, setAnswer] = useState({});
  const [buffer, setBuffer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [mistakesThisQ, setMistakesThisQ] = useState(0);
  const [feedback, setFeedback] = useState(null); // {text, tone}
  const [shakeKey, setShakeKey] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [solved, setSolved] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stars, setStars] = useState(0);

  const step = problem ? problem.steps[stepIdx] : null;

  // ── New practice question ──
  const newQuestion = useCallback((opOverride) => {
    const op = opOverride || (opSetting === 'mixed' ? (Math.random() < 0.5 ? 'add' : 'sub') : opSetting);
    const { a, b } = genProblem(op, digitSetting, regroupSetting);
    const built = buildSteps(op, a, b);
    setProblem({ op, a, b, ...built });
    setStepIdx(0);
    setCarries({});
    setWork(built.aD.map(d => d));
    setAnswer({});
    setBuffer('');
    setAttempts(0);
    setMistakesThisQ(0);
    setCelebrating(false);
    setFeedback({
      text: op === 'add'
        ? `Let's add ${a} + ${b}! Start with the ones column on the right. What do the ones make altogether?`
        : `Let's solve ${a} − ${b}! Start with the ones column on the right.`,
      tone: 'info',
    });
  }, [opSetting, digitSetting, regroupSetting]);

  // Start / restart when settings change while practising
  useEffect(() => {
    if (mode === 'practice') newQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, opSetting, digitSetting, regroupSetting]);

  // ── Step prompts ──
  const promptFor = useCallback((s) => {
    if (!s || !problem) return '';
    const pn = placeName(s.col);
    if (s.kind === 'sum') {
      const bits = [];
      if (s.ad !== null) bits.push(String(s.ad));
      if (s.bd !== null) bits.push(String(s.bd));
      if (s.carryIn) bits.push('the carried 1');
      return `${pn.charAt(0).toUpperCase() + pn.slice(1)} column: what is ${bits.join(' + ')}?`;
    }
    if (s.kind === 'carryTap') {
      return `That's 10 or more — the 1 needs to be carried! Tap the spot where it belongs.`;
    }
    if (s.kind === 'borrowAsk') {
      return `${pn.charAt(0).toUpperCase() + pn.slice(1)} column: can we take ${s.bottom} away from ${s.topVal}?`;
    }
    if (s.kind === 'borrowTap') {
      return `We need to borrow! Tap the digit that lends us a 10.`;
    }
    if (s.kind === 'sub') {
      if (s.bottom === null) return `Nothing underneath in the ${pn} column — what comes straight down into the answer?`;
      return `${pn.charAt(0).toUpperCase() + pn.slice(1)} column: what is ${s.topVal} − ${s.bottom}?`;
    }
    return '';
  }, [problem]);

  const hintFor = useCallback((s) => {
    if (!s) return '';
    if (s.kind === 'sum') {
      const base = (s.ad || 0) + (s.bd || 0) + (s.carryIn || 0);
      return base > 9
        ? `Count it up carefully — it makes ${base}. When a column makes 10 or more, we write the ones digit and carry the 1.`
        : `Count on your fingers if it helps! ${s.ad !== null ? s.ad : 0}${s.bd !== null ? ` + ${s.bd}` : ''}${s.carryIn ? ' + 1' : ''}…`;
    }
    if (s.kind === 'carryTap') return 'The carry always jumps ONE column to the LEFT — to the top of the very next column.';
    if (s.kind === 'borrowAsk') return `Is ${s.topVal} big enough to take ${s.bottom} away from it? If the top digit is smaller, we must borrow.`;
    if (s.kind === 'borrowTap') return 'We always borrow from our NEXT-DOOR neighbour — the digit one column to the left.';
    if (s.kind === 'sub') return s.bottom === null
      ? 'With nothing to take away, the top digit just comes straight down.'
      : `Count backwards from ${s.topVal}, ${s.bottom} hops. Or think: what plus ${s.bottom} makes ${s.topVal}?`;
    return '';
  }, []);

  // ── Advance to next step ──
  const advance = useCallback((nextFeedback) => {
    if (!problem) return;
    const next = stepIdx + 1;
    setBuffer('');
    setAttempts(0);
    if (next >= problem.steps.length) {
      // Finished!
      const perfect = mistakesThisQ === 0;
      setCelebrating(true);
      setSolved(v => v + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(b => Math.max(b, newStreak));
      if (perfect) setStars(v => v + 1);
      const result = problem.op === 'add' ? problem.a + problem.b : problem.a - problem.b;
      const leadingZeros = problem.op === 'sub' && String(result).length < problem.cols;
      setFeedback({
        text: `🎉 Brilliant! ${problem.a} ${problem.op === 'add' ? '+' : '−'} ${problem.b} = ${result}.${leadingZeros ? ' (Zeros at the front of an answer can be ignored!)' : ''}${perfect ? ' Perfect solve — you earned a ⭐!' : ''}`,
        tone: 'success',
      });
      showToast(perfect ? 'Perfect solve! ⭐' : 'Question complete! 🎉', 'success');
    } else {
      setStepIdx(next);
      if (nextFeedback) setFeedback(nextFeedback);
    }
  }, [problem, stepIdx, mistakesThisQ, streak, showToast]);

  // ── Wrong answer handling ──
  const wrong = useCallback((message) => {
    setAttempts(a => a + 1);
    setMistakesThisQ(m => m + 1);
    setStreak(0);
    setShakeKey(k => k + 1);
    setFeedback({ text: message, tone: 'error' });
  }, []);

  // ── Numeric check (sum & sub steps) ──
  const checkNumber = useCallback(() => {
    if (!step || !buffer) return;
    const v = parseInt(buffer, 10);
    if (Number.isNaN(v)) { setBuffer(''); return; }

    if (step.kind === 'sum') {
      if (v === step.expected) {
        const onesDigit = step.expected % 10;
        setAnswer(prev => {
          const upd = { ...prev, [step.col]: onesDigit };
          if (step.expected > 9 && step.isLast) upd[step.col + 1] = Math.floor(step.expected / 10);
          return upd;
        });
        if (step.expected > 9 && !step.isLast) {
          advance({ text: `Yes — ${step.expected}! Write the ${onesDigit}… but the 1 ten can't stay here. Tap the spot where the carried 1 goes!`, tone: 'success' });
        } else if (step.expected > 9 && step.isLast) {
          advance({ text: `Yes — ${step.expected}! No more columns to the left, so the whole ${step.expected} goes into the answer.`, tone: 'success' });
        } else {
          advance({ text: `Correct — ${step.expected}! On to the next column (moving left).`, tone: 'success' });
        }
      } else {
        wrong(attempts >= 1
          ? `Not quite. Hint: ${hintFor(step)}`
          : `Hmm, that's not it — count again carefully!`);
        if (attempts >= 2) setFeedback({ text: `The answer is ${step.expected} — type it in to keep going!`, tone: 'error' });
      }
      return;
    }

    if (step.kind === 'sub') {
      if (v === step.expected) {
        setAnswer(prev => ({ ...prev, [step.col]: step.expected }));
        advance({ text: `Correct — ${step.expected}! Keep moving left.`, tone: 'success' });
      } else {
        wrong(attempts >= 1 ? `Not quite. Hint: ${hintFor(step)}` : `Hmm, check that again!`);
        if (attempts >= 2) setFeedback({ text: `The answer is ${step.expected} — type it in to keep going!`, tone: 'error' });
      }
    }
  }, [step, buffer, attempts, advance, wrong, hintFor]);

  // ── Carry tap ──
  const handleCarryTap = useCallback((colTapped) => {
    if (!step || step.kind !== 'carryTap') return;
    if (colTapped === step.expected) {
      setCarries(prev => ({ ...prev, [colTapped]: 1 }));
      advance({ text: `Perfect! The carried 1 sits at the top of the ${placeName(colTapped)} column, ready to be added in.`, tone: 'success' });
    } else {
      wrong(`Not that spot! The carry jumps ONE column to the LEFT — right next door.`);
    }
  }, [step, advance, wrong]);

  // ── Borrow ask (yes / no) ──
  const handleBorrowAnswer = useCallback((saysYes) => {
    if (!step || step.kind !== 'borrowAsk') return;
    const correct = saysYes !== step.needBorrow;
    if (correct) {
      if (step.needBorrow) {
        advance({ text: `Right — ${step.topVal} is too small to take ${step.bottom} away. We need to BORROW from next door!`, tone: 'success' });
      } else {
        advance({ text: `Correct — ${step.topVal} is big enough. Subtract away!`, tone: 'success' });
      }
    } else {
      wrong(step.needBorrow
        ? `Look again — ${step.topVal} is smaller than ${step.bottom}, so we CAN'T subtract yet. We need to borrow!`
        : `Look again — ${step.topVal} is big enough to take ${step.bottom} from. No borrowing needed here!`);
    }
  }, [step, advance, wrong]);

  // ── Borrow tap ──
  const handleTopTap = useCallback((colTapped) => {
    if (!step || step.kind !== 'borrowTap') return;
    if (colTapped === step.expected) {
      const next = [...work];
      const before = [...next];
      const info = applyBorrowCascade(next, step.col);
      const msg = info.crossedZeros === 0
        ? `Great! The ${before[step.expected]} lends 1 and becomes ${next[step.expected]}. Our digit becomes ${next[step.col]} — now we can subtract!`
        : `Good tap — but the 0 has nothing to lend! It borrows from ITS neighbour: the ${before[info.donorIdx]} becomes ${next[info.donorIdx]}, the zero${info.crossedZeros > 1 ? 's become 9s' : ' becomes 9'}, and our digit becomes ${next[step.col]}. Phew!`;
      setWork(next);
      advance({ text: msg, tone: 'success' });
    } else if (colTapped === step.col) {
      wrong(`That's the digit that NEEDS the help! Borrow from its next-door neighbour, one column to the left.`);
    } else {
      wrong(`We always borrow from the NEXT-DOOR neighbour — the digit just one column to the left.`);
    }
  }, [step, work, advance, wrong]);

  // ── Keyboard support ──
  useEffect(() => {
    const numericStep = step && (step.kind === 'sum' || step.kind === 'sub');
    const handler = (e) => {
      if (mode === 'learn' && learnData) {
        if (e.key === 'ArrowRight') setLearnStep(s => Math.min(s + 1, learnData.snaps.length - 1));
        if (e.key === 'ArrowLeft') setLearnStep(s => Math.max(s - 1, 0));
        return;
      }
      if (mode !== 'practice' || celebrating) return;
      if (numericStep) {
        if (/^[0-9]$/.test(e.key)) setBuffer(b => (b.length < 2 ? b + e.key : b));
        if (e.key === 'Backspace') setBuffer(b => b.slice(0, -1));
        if (e.key === 'Enter') checkNumber();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, step, celebrating, checkNumber, learnData]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const styles = (
    <style>{`
      @keyframes cs-pop { 0% { transform: scale(0); } 70% { transform: scale(1.25); } 100% { transform: scale(1); } }
      .cs-pop { animation: cs-pop 0.35s ease-out; }
      @keyframes cs-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
      .cs-shake { animation: cs-shake 0.4s ease; }
      @keyframes cs-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(480px) rotate(340deg); opacity: 0; } }
      .cs-fall { animation-name: cs-fall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
      @keyframes cs-wiggle { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-2deg); } 75% { transform: rotate(2deg); } }
      .cs-wiggle { animation: cs-wiggle 0.8s ease-in-out infinite; }
    `}</style>
  );

  const header = (
    <div className="text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 text-6xl flex items-center justify-around select-none pointer-events-none">
        <span>➕</span><span>➖</span><span>🧮</span><span>➕</span><span>➖</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-2 relative">🧱 Column Strategy Lab</h1>
      <p className="text-lg opacity-90 relative">Master column addition &amp; subtraction — carrying, borrowing and all!</p>
    </div>
  );

  const modeTabs = (
    <div className="flex justify-center gap-3">
      {[
        { id: 'learn', label: '📖 Learn It', color: 'from-sky-500 to-blue-600' },
        { id: 'practice', label: '🎯 Practise It', color: 'from-emerald-500 to-green-600' },
      ].map(t => (
        <button
          key={t.id}
          onClick={() => { setMode(t.id); if (t.id === 'learn') { setLearnExample(null); setLearnStep(0); } }}
          className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
            mode === t.id
              ? `bg-gradient-to-r ${t.color} text-white shadow-lg scale-105`
              : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  // ── LEARN MODE ──
  if (mode === 'learn') {
    // Example picker
    if (!learnExample) {
      return (
        <div className="space-y-6">
          {styles}
          {header}
          {modeTabs}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LEARN_EXAMPLES.map(ex => (
              <button
                key={ex.id}
                onClick={() => { setLearnExample(ex); setLearnStep(0); }}
                className={`text-left p-5 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                  ex.op === 'add' ? 'border-sky-200 bg-sky-50 hover:bg-sky-100' : 'border-rose-200 bg-rose-50 hover:bg-rose-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-4xl">{ex.emoji}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ex.op === 'add' ? 'bg-sky-200 text-sky-800' : 'bg-rose-200 text-rose-800'}`}>
                    {ex.op === 'add' ? '➕ ADDITION' : '➖ SUBTRACTION'}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 mb-1">{ex.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{ex.blurb}</p>
                <p className="font-mono font-black text-xl text-slate-700">{ex.a} {ex.op === 'add' ? '+' : '−'} {ex.b}</p>
              </button>
            ))}
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
            <strong>💡 Teacher tip:</strong> work through the examples in order on the board, then switch to <strong>Practise It</strong> and let students solve their own — the Lab checks every single step.
          </div>
        </div>
      );
    }

    // Walkthrough
    const snapData = learnData;
    const snap = snapData.snaps[learnStep];
    const isFirst = learnStep === 0;
    const isLast = learnStep === snapData.snaps.length - 1;

    return (
      <div className="space-y-5">
        {styles}
        {header}
        {modeTabs}

        <div className="bg-white rounded-2xl shadow-sm border p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-600">
            <button onClick={() => setLearnExample(null)} className="hover:text-blue-600 font-semibold transition-colors">📖 Examples</button>
            <span>→</span>
            <span className="font-bold text-slate-800">{learnExample.emoji} {learnExample.title}</span>
          </div>
          <span className="text-sm text-slate-400 font-semibold">Step {learnStep + 1} of {snapData.snaps.length}</span>
        </div>

        <div className="flex flex-col items-center gap-5">
          <Board
            op={learnExample.op}
            cols={snapData.cols}
            aD={snapData.aD}
            bD={snapData.bD}
            carries={snap.carries}
            work={snap.work}
            answer={snap.answer}
            activeCol={snap.activeCol}
          />

          {/* Narration */}
          <div className="w-full max-w-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5 flex gap-4 items-start">
            <span className="text-4xl shrink-0">🦉</span>
            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium">{snap.text}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLearnStep(s => Math.max(0, s - 1))}
              disabled={isFirst}
              className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-bold px-6 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-40"
            >
              ← Back
            </button>
            <div className="flex gap-1.5">
              {snapData.snaps.map((_, i) => (
                <button key={i} onClick={() => setLearnStep(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === learnStep ? 'bg-indigo-500 scale-125' : i < learnStep ? 'bg-indigo-300' : 'bg-slate-200'}`} />
              ))}
            </div>
            {isLast ? (
              <button
                onClick={() => setMode('practice')}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                🎯 Practise It!
              </button>
            ) : (
              <button
                onClick={() => setLearnStep(s => Math.min(snapData.snaps.length - 1, s + 1))}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── PRACTICE MODE ──
  if (!problem) return <div className="text-center py-20 text-slate-400">Loading…</div>;

  const numericStep = step && (step.kind === 'sum' || step.kind === 'sub');
  const feedbackTone = feedback?.tone || 'info';
  const toneStyles = {
    info: 'from-indigo-50 to-purple-50 border-indigo-200 text-slate-700',
    success: 'from-emerald-50 to-green-50 border-emerald-300 text-emerald-800',
    error: 'from-rose-50 to-red-50 border-rose-300 text-rose-700',
  };

  return (
    <div className="space-y-5">
      {styles}
      {header}
      {modeTabs}

      {/* Settings + score bar */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { key: 'op', options: [{ v: 'add', l: '➕ Addition' }, { v: 'sub', l: '➖ Subtraction' }, { v: 'mixed', l: '🎲 Mixed' }], cur: opSetting, set: setOpSetting },
            { key: 'dig', options: [{ v: 2, l: '2-digit' }, { v: 3, l: '3-digit' }, { v: 4, l: '4-digit' }], cur: digitSetting, set: setDigitSetting },
            { key: 'reg', options: [{ v: 'mixed', l: '🎲 Sometimes regroup' }, { v: 'always', l: '🔄 Always regroup' }, { v: 'never', l: '🚫 No regrouping' }], cur: regroupSetting, set: setRegroupSetting },
          ].map(grp => (
            <div key={grp.key} className="flex bg-slate-100 rounded-xl p-1 gap-1">
              {grp.options.map(o => (
                <button key={String(o.v)} onClick={() => grp.set(o.v)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${grp.cur === o.v ? 'bg-white text-indigo-700 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                  {o.l}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="text-emerald-600">✅ {solved}</span>
          <span className="text-orange-500">🔥 {streak}<span className="text-slate-300 font-semibold text-xs"> (best {bestStreak})</span></span>
          <span className="text-amber-500">⭐ {stars}</span>
        </div>
      </div>

      {/* Main play area */}
      <div className="relative bg-gradient-to-b from-slate-50 to-indigo-50/50 rounded-3xl border-2 border-indigo-100 p-4 sm:p-8">
        {celebrating && <Confetti />}

        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-10">
          {/* Board */}
          <div className="flex flex-col items-center gap-4">
            <Board
              op={problem.op}
              cols={problem.cols}
              aD={problem.aD}
              bD={problem.bD}
              carries={carries}
              work={work}
              answer={answer}
              activeCol={celebrating ? null : step?.col}
              carryTapMode={!celebrating && step?.kind === 'carryTap'}
              onCarryTap={handleCarryTap}
              topTapMode={!celebrating && step?.kind === 'borrowTap'}
              onTopTap={handleTopTap}
              shakeKey={shakeKey}
            />

            {/* Feedback bubble */}
            <div className={`w-full max-w-xl bg-gradient-to-r border-2 rounded-2xl p-4 flex gap-3 items-start ${toneStyles[feedbackTone]}`}>
              <span className="text-3xl shrink-0">{feedbackTone === 'error' ? '🤔' : feedbackTone === 'success' ? '🦉' : '🦉'}</span>
              <div>
                <p className="font-medium leading-relaxed">{feedback?.text}</p>
                {!celebrating && step && (
                  <p className="mt-1.5 text-sm font-bold opacity-80">{promptFor(step)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Input side */}
          <div className="flex flex-col items-center gap-4 min-w-[260px]">
            {celebrating ? (
              <button
                onClick={() => newQuestion()}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xl px-8 py-5 rounded-2xl shadow-lg transition-all active:scale-95 cs-pop"
              >
                Next Question →
              </button>
            ) : step?.kind === 'borrowAsk' ? (
              <div className="w-full max-w-[260px] space-y-3">
                <p className="text-center text-slate-500 font-semibold text-sm">Can we subtract without borrowing?</p>
                <button onClick={() => handleBorrowAnswer(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg py-4 rounded-2xl shadow transition-all active:scale-95">
                  ✅ Yes, subtract!
                </button>
                <button onClick={() => handleBorrowAnswer(false)}
                  className="w-full bg-rose-500 hover:bg-rose-400 text-white font-black text-lg py-4 rounded-2xl shadow transition-all active:scale-95">
                  🤝 No — we need to borrow!
                </button>
              </div>
            ) : step?.kind === 'carryTap' || step?.kind === 'borrowTap' ? (
              <div className="w-full max-w-[260px] bg-white border-2 border-dashed border-amber-300 rounded-2xl p-5 text-center">
                <div className="text-4xl mb-2 animate-bounce">👆</div>
                <p className="text-slate-600 font-semibold text-sm">
                  {step.kind === 'carryTap' ? 'Tap the glowing spot on the board where the carried 1 belongs!' : 'Tap the digit on the board that we borrow from!'}
                </p>
              </div>
            ) : (
              <NumberPad
                buffer={buffer}
                onDigit={(d) => setBuffer(b => (b.length < 2 ? b + String(d) : b))}
                onBackspace={() => setBuffer(b => b.slice(0, -1))}
                onCheck={checkNumber}
                disabled={!numericStep}
              />
            )}

            {!celebrating && (
              <div className="flex gap-2">
                <button
                  onClick={() => setFeedback({ text: `💡 ${hintFor(step)}`, tone: 'info' })}
                  className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-700 font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95"
                >
                  💡 Hint
                </button>
                <button
                  onClick={() => newQuestion()}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95"
                >
                  ⏭️ Skip
                </button>
              </div>
            )}
            <p className="text-slate-300 text-xs text-center hidden sm:block">⌨️ You can also type with your keyboard — Enter to check</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnStrategy;
