// components/curriculum/mathematics/InteractiveAngles.js
// COMPREHENSIVE ANGLES TEACHING TOOL — v2
// Six modes: Learn types, Measure (protractor), Create (target challenges),
// Angle Rules (complementary / supplementary / vertically opposite / angles
// at a point / triangle sum), Missing Angle composite challenges, Estimate game.
// All figures are interactive SVG — drag rays to change angles live.
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ════════════════════════════════════════════════════════════════════════════
// Geometry helpers (SVG: y axis inverted, angles anticlockwise from east)
// ════════════════════════════════════════════════════════════════════════════
const polar = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos((deg * Math.PI) / 180),
  y: cy - r * Math.sin((deg * Math.PI) / 180),
});

// Arc as polyline points (avoids SVG arc-flag headaches, handles reflex)
const arcPoints = (cx, cy, r, a0, a1, step = 3) => {
  const pts = [];
  const dir = a1 >= a0 ? 1 : -1;
  for (let a = a0; dir > 0 ? a <= a1 : a >= a1; a += dir * step) {
    const p = polar(cx, cy, r, a);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  const end = polar(cx, cy, r, a1);
  pts.push(`${end.x.toFixed(1)},${end.y.toFixed(1)}`);
  return pts.join(' ');
};

const wedgePath = (cx, cy, r, a0, a1, step = 3) => {
  let d = `M ${cx} ${cy} `;
  const dir = a1 >= a0 ? 1 : -1;
  for (let a = a0; dir > 0 ? a <= a1 : a >= a1; a += dir * step) {
    const p = polar(cx, cy, r, a);
    d += `L ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  const end = polar(cx, cy, r, a1);
  d += `L ${end.x.toFixed(1)} ${end.y.toFixed(1)} Z`;
  return d;
};

const normalize = (deg) => ((deg % 360) + 360) % 360;

const angleFromEvent = (e, svgEl, cx, cy, viewW, viewH) => {
  const rect = svgEl.getBoundingClientRect();
  const x = ((e.clientX - rect.left) * viewW) / rect.width;
  const y = ((e.clientY - rect.top) * viewH) / rect.height;
  return normalize((Math.atan2(cy - y, x - cx) * 180) / Math.PI);
};

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ════════════════════════════════════════════════════════════════════════════
// Shared data
// ════════════════════════════════════════════════════════════════════════════
const ANGLE_TYPES = {
  acute: {
    name: 'Acute Angle', range: '1° – 89°', color: '#22C55E',
    description: 'Less than 90° — small and sharp!',
    example: '🍕 A pizza slice, ✂️ scissors slightly open, 🏠 a steep roof peak',
  },
  right: {
    name: 'Right Angle', range: 'Exactly 90°', color: '#3B82F6',
    description: 'Exactly 90° — a perfect corner.',
    example: '📕 A book corner, 🚪 a door frame, ➕ where walls meet the floor',
  },
  obtuse: {
    name: 'Obtuse Angle', range: '91° – 179°', color: '#F59E0B',
    description: 'More than 90° but less than 180°.',
    example: '💻 An open laptop screen, 🪑 a reclined chair back',
  },
  straight: {
    name: 'Straight Angle', range: 'Exactly 180°', color: '#8B5CF6',
    description: 'Exactly 180° — a straight line.',
    example: '🌅 The horizon, 📏 the edge of a ruler, 🤸 doing the splits',
  },
  reflex: {
    name: 'Reflex Angle', range: '181° – 359°', color: '#EF4444',
    description: 'More than 180° — bends back on itself.',
    example: '🕙 Clock hands at 10 o\'clock (going the long way), 📐 outside of a corner',
  },
};

const getAngleType = (deg) => {
  const d = Math.round(deg);
  if (d < 90) return 'acute';
  if (d === 90) return 'right';
  if (d < 180) return 'obtuse';
  if (d === 180) return 'straight';
  return 'reflex';
};

const PART_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#06B6D4'];
const MISSING_COLOR = '#F97316';

// ════════════════════════════════════════════════════════════════════════════
// Reusable SVG figure: rays from a centre + coloured wedges + labels
// parts: [{ value, known, color }] drawn anticlockwise starting at baseDeg
// kind: 'line' (180 sum, draws full line), 'point' (360), 'corner' (90 w/ square)
// ════════════════════════════════════════════════════════════════════════════
const PartsFigure = ({ parts, baseDeg = 0, kind = 'line', size = 320 }) => {
  const cx = size / 2;
  const cy = kind === 'line' ? size * 0.62 : size / 2;
  const R = size * 0.4;
  let acc = baseDeg;
  const boundaries = [baseDeg];
  parts.forEach((p) => {
    acc += p.value;
    boundaries.push(acc);
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] mx-auto select-none">
      {/* Wedges */}
      {parts.map((p, i) => {
        const a0 = boundaries[i];
        const a1 = boundaries[i + 1];
        const arcR = R * (0.42 + (i % 2) * 0.13);
        const mid = (a0 + a1) / 2;
        const labelPos = polar(cx, cy, arcR + 26, mid);
        const color = p.known ? p.color : MISSING_COLOR;
        return (
          <g key={i}>
            <path d={wedgePath(cx, cy, arcR, a0, a1)} fill={color + '2e'} />
            <polyline points={arcPoints(cx, cy, arcR, a0, a1)} fill="none" stroke={color} strokeWidth="2.5" />
            <text
              x={labelPos.x}
              y={labelPos.y + 5}
              textAnchor="middle"
              fontSize={p.known ? 16 : 19}
              fontWeight="800"
              fill={color}
            >
              {p.known ? `${p.value}°` : 'x°?'}
            </text>
          </g>
        );
      })}
      {/* Rays */}
      {boundaries.map((b, i) => {
        // For a line figure, first & last boundary form the full line
        const p = polar(cx, cy, R, b);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />;
      })}
      {/* Extend the base line for 'line' kind so it reads as a straight line */}
      {kind === 'line' && (
        <>
          <line
            x1={polar(cx, cy, R, baseDeg).x} y1={polar(cx, cy, R, baseDeg).y}
            x2={polar(cx, cy, R, baseDeg + 180).x} y2={polar(cx, cy, R, baseDeg + 180).y}
            stroke="#374151" strokeWidth="3.5" strokeLinecap="round"
          />
        </>
      )}
      {/* Right-angle square for corner kind */}
      {kind === 'corner' && (
        <path
          d={`M ${polar(cx, cy, 26, baseDeg).x} ${polar(cx, cy, 26, baseDeg).y}
              L ${polar(cx, cy, 36.8, baseDeg + 45).x} ${polar(cx, cy, 36.8, baseDeg + 45).y}
              L ${polar(cx, cy, 26, baseDeg + 90).x} ${polar(cx, cy, 26, baseDeg + 90).y}`}
          fill="none" stroke="#64748b" strokeWidth="2"
        />
      )}
      <circle cx={cx} cy={cy} r="5" fill="#374151" />
    </svg>
  );
};

// Crossing-lines figure for vertically opposite angles
const VertFigure = ({ a, baseDeg = 0, labels, size = 320 }) => {
  // labels: [{pos:'a0'|'a1'|'a2'|'a3', text, color}] — angle regions between rays
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.42;
  const dirs = [baseDeg, baseDeg + a, baseDeg + 180, baseDeg + 180 + a];
  const regions = [
    [baseDeg, baseDeg + a],
    [baseDeg + a, baseDeg + 180],
    [baseDeg + 180, baseDeg + 180 + a],
    [baseDeg + 180 + a, baseDeg + 360],
  ];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[340px] mx-auto select-none">
      {labels.map((l, i) => {
        const idx = ['a0', 'a1', 'a2', 'a3'].indexOf(l.pos);
        const [r0, r1] = regions[idx];
        const mid = (r0 + r1) / 2;
        const arcR = 38 + (idx % 2) * 14;
        const lp = polar(cx, cy, arcR + 26, mid);
        return (
          <g key={i}>
            <polyline points={arcPoints(cx, cy, arcR, r0, r1)} fill="none" stroke={l.color} strokeWidth="2.5" />
            <path d={wedgePath(cx, cy, arcR, r0, r1)} fill={l.color + '2e'} />
            <text x={lp.x} y={lp.y + 5} textAnchor="middle" fontSize={l.big ? 19 : 15} fontWeight="800" fill={l.color}>
              {l.text}
            </text>
          </g>
        );
      })}
      {/* Two full lines */}
      <line x1={polar(cx, cy, R, dirs[0]).x} y1={polar(cx, cy, R, dirs[0]).y} x2={polar(cx, cy, R, dirs[2]).x} y2={polar(cx, cy, R, dirs[2]).y} stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={polar(cx, cy, R, dirs[1]).x} y1={polar(cx, cy, R, dirs[1]).y} x2={polar(cx, cy, R, dirs[3]).x} y2={polar(cx, cy, R, dirs[3]).y} stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#374151" />
    </svg>
  );
};

// Triangle figure with interior angle arcs. angles = [A, B, C] (sum 180)
const TriangleFigure = ({ angles, known = [true, true, false], size = 320 }) => {
  const [A, B] = angles;
  const W = size;
  const base = W * 0.74;
  const x1 = (W - base) / 2;
  const x2 = x1 + base;
  const yBase = W * 0.78;
  // Apex: intersection of ray from P1 at angle A and ray from P2 at 180 - B
  const tanA = Math.tan((A * Math.PI) / 180);
  const tanB = Math.tan((B * Math.PI) / 180);
  const xApex = x1 + (base * tanB) / (tanA + tanB);
  const yApex = yBase - (xApex - x1) * tanA;
  const verts = [
    { x: x1, y: yBase },
    { x: x2, y: yBase },
    { x: xApex, y: yApex },
  ];
  // interior arc at each vertex: directions to the other two vertices
  const arcs = verts.map((v, i) => {
    const others = [verts[(i + 1) % 3], verts[(i + 2) % 3]];
    const d0 = normalize((Math.atan2(v.y - others[0].y, others[0].x - v.x) * 180) / Math.PI);
    const d1 = normalize((Math.atan2(v.y - others[1].y, others[1].x - v.x) * 180) / Math.PI);
    let a0 = d0;
    let a1 = d1;
    if (normalize(a1 - a0) > 180) [a0, a1] = [a1, a0];
    if (a1 < a0) a1 += 360;
    return { a0, a1, v };
  });
  return (
    <svg viewBox={`0 0 ${W} ${W * 0.92}`} className="w-full max-w-[340px] mx-auto select-none">
      <polygon
        points={verts.map((v) => `${v.x},${v.y}`).join(' ')}
        fill="#3B82F610"
        stroke="#374151"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {arcs.map((arc, i) => {
        const color = known[i] ? PART_COLORS[i] : MISSING_COLOR;
        const mid = (arc.a0 + arc.a1) / 2;
        const lp = polar(arc.v.x, arc.v.y, 52, mid);
        return (
          <g key={i}>
            <polyline points={arcPoints(arc.v.x, arc.v.y, 28, arc.a0, arc.a1)} fill="none" stroke={color} strokeWidth="2.5" />
            <text x={lp.x} y={lp.y + 5} textAnchor="middle" fontSize={known[i] ? 15 : 18} fontWeight="800" fill={color}>
              {known[i] ? `${angles[i]}°` : 'x°?'}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// Main component
// ════════════════════════════════════════════════════════════════════════════
const InteractiveAngles = ({ showToast = () => {}, saveData = () => {}, loadedData = {} }) => {
  const [activeMode, setActiveMode] = useState('learn');

  // ── LEARN state ──
  const [learnAngle, setLearnAngle] = useState(45);
  const learnSvgRef = useRef(null);
  const [learnDragging, setLearnDragging] = useState(false);

  // ── MEASURE state ──
  const [measureAngle, setMeasureAngle] = useState(() => randInt(15, 165));
  const [measureBase, setMeasureBase] = useState(() => randInt(0, 360));
  const [showProtractor, setShowProtractor] = useState(true);
  const [protractorPos, setProtractorPos] = useState({ x: 0, y: 0 });
  const [protractorRot, setProtractorRot] = useState(0);
  const [protractorDragging, setProtractorDragging] = useState(false);
  const protractorDragStart = useRef(null);
  const [measureGuess, setMeasureGuess] = useState('');
  const [measureFeedback, setMeasureFeedback] = useState(null);
  const [measureStreak, setMeasureStreak] = useState(0);
  const [measureRevealed, setMeasureRevealed] = useState(false);

  // ── CREATE state ──
  const [createSubmode, setCreateSubmode] = useState('free'); // free | challenge
  const [createdAngle, setCreatedAngle] = useState(60);
  const createSvgRef = useRef(null);
  const [createDragging, setCreateDragging] = useState(false);
  const [targetAngle, setTargetAngle] = useState(null);
  const [createRound, setCreateRound] = useState(0);
  const [createScore, setCreateScore] = useState(0);
  const [createResult, setCreateResult] = useState(null);
  const [createLevel, setCreateLevel] = useState(1);

  // ── RULES state ──
  const [activeRule, setActiveRule] = useState('complementary');
  const [ruleAngleA, setRuleAngleA] = useState(35);
  const [pointDiv1, setPointDiv1] = useState(110);
  const [pointDiv2, setPointDiv2] = useState(230);
  const [triApexT, setTriApexT] = useState(0.45); // apex position 0..1 along the top
  const ruleSvgRef = useRef(null);
  const [ruleDragTarget, setRuleDragTarget] = useState(null); // 'a' | 'd1' | 'd2'
  const [ruleQuiz, setRuleQuiz] = useState(null); // {question, answer}
  const [ruleQuizInput, setRuleQuizInput] = useState('');
  const [ruleQuizFeedback, setRuleQuizFeedback] = useState(null);

  // ── MISSING state ──
  const [missingLevel, setMissingLevel] = useState(1);
  const [missingProblem, setMissingProblem] = useState(null);
  const [missingInput, setMissingInput] = useState('');
  const [missingFeedback, setMissingFeedback] = useState(null);
  const [missingQNum, setMissingQNum] = useState(0);
  const [missingScore, setMissingScore] = useState(0);
  const [missingStreak, setMissingStreak] = useState(0);
  const [missingDone, setMissingDone] = useState(false);
  const MISSING_TOTAL = 10;

  // ── ESTIMATE state ──
  const [estLevel, setEstLevel] = useState(1);
  const [estAngle, setEstAngle] = useState(45);
  const [estQNum, setEstQNum] = useState(0);
  const [estScore, setEstScore] = useState(0);
  const [estStreak, setEstStreak] = useState(0);
  const [estGuess, setEstGuess] = useState('');
  const [estFeedback, setEstFeedback] = useState(null);

  // ══════════════════════════════════════════════════════════════════════════
  // LEARN mode
  // ══════════════════════════════════════════════════════════════════════════
  const handleLearnPointer = (e, isDown = false) => {
    if (!isDown && !learnDragging) return;
    const svg = learnSvgRef.current;
    if (!svg) return;
    const deg = angleFromEvent(e, svg, 180, 200, 360, 360);
    setLearnAngle(Math.max(1, Math.min(359, Math.round(deg))));
  };

  const renderLearn = () => {
    const type = ANGLE_TYPES[getAngleType(learnAngle)];
    const cx = 180, cy = 200, R = 130;
    const tip = polar(cx, cy, R, learnAngle);
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-bold mb-1 text-center">Interactive Angle</h3>
          <p className="text-center text-sm text-gray-500 mb-2">Drag the green dot (or anywhere) to change the angle!</p>
          <svg
            ref={learnSvgRef}
            viewBox="0 0 360 360"
            className="w-full max-w-[360px] mx-auto cursor-pointer select-none touch-none"
            onPointerDown={(e) => { setLearnDragging(true); e.currentTarget.setPointerCapture?.(e.pointerId); handleLearnPointer(e, true); }}
            onPointerMove={(e) => handleLearnPointer(e)}
            onPointerUp={() => setLearnDragging(false)}
            onPointerLeave={() => setLearnDragging(false)}
          >
            <path d={wedgePath(cx, cy, 56, 0, learnAngle)} fill={type.color + '30'} />
            <polyline points={arcPoints(cx, cy, 56, 0, learnAngle)} fill="none" stroke={type.color} strokeWidth="3" />
            {Math.round(learnAngle) === 90 && (
              <path d={`M ${cx + 24} ${cy} L ${cx + 24} ${cy - 24} L ${cx} ${cy - 24}`} fill="none" stroke={type.color} strokeWidth="2.5" />
            )}
            <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <circle cx={tip.x} cy={tip.y} r="11" fill={type.color} stroke="#fff" strokeWidth="3" className="cursor-grab" />
            <circle cx={cx} cy={cy} r="5" fill="#374151" />
            <text x={cx} y={60} textAnchor="middle" fontSize="34" fontWeight="900" fill={type.color}>
              {Math.round(learnAngle)}°
            </text>
          </svg>
          <div className="mt-2">
            <input
              type="range" min="1" max="359" value={learnAngle}
              onChange={(e) => setLearnAngle(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="text-center mt-3">
            <div className="inline-block px-4 py-2 rounded-full text-white font-bold" style={{ backgroundColor: type.color }}>
              {type.name}
            </div>
            <p className="text-sm text-gray-600 mt-2">{type.description}</p>
            <p className="text-sm text-gray-500 mt-1">Real world: {type.example}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-xl font-bold mb-4">The 5 Angle Types</h3>
          <div className="space-y-3">
            {Object.entries(ANGLE_TYPES).map(([key, type2]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  getAngleType(learnAngle) === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  const examples = { acute: 45, right: 90, obtuse: 135, straight: 180, reflex: 270 };
                  setLearnAngle(examples[key]);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold" style={{ color: type2.color }}>{type2.name}</h4>
                    <p className="text-sm text-gray-600">{type2.description}</p>
                  </div>
                  <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded whitespace-nowrap">{type2.range}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // MEASURE mode — rotated angles + draggable & rotatable protractor
  // ══════════════════════════════════════════════════════════════════════════
  const newMeasureAngle = () => {
    setMeasureAngle(randInt(15, 165));
    setMeasureBase(randInt(0, 360));
    setMeasureGuess('');
    setMeasureFeedback(null);
    setMeasureRevealed(false);
  };

  const checkMeasure = () => {
    if (!measureGuess) {
      setMeasureFeedback({ type: 'info', text: 'Enter your measurement first!' });
      return;
    }
    const diff = Math.abs(parseInt(measureGuess) - measureAngle);
    if (diff === 0) {
      const ns = measureStreak + 1;
      setMeasureStreak(ns);
      setMeasureFeedback({ type: 'success', text: `PERFECT! It's exactly ${measureAngle}°! 🔥 Streak: ${ns}` });
      showToast('Perfect measurement! 🎉', 'success');
      setTimeout(newMeasureAngle, 1800);
    } else if (diff <= 3) {
      const ns = measureStreak + 1;
      setMeasureStreak(ns);
      setMeasureFeedback({ type: 'success', text: `Correct! ${measureAngle}° (you said ${measureGuess}°) — within 3°! Streak: ${ns}` });
      setTimeout(newMeasureAngle, 1800);
    } else if (diff <= 8) {
      setMeasureFeedback({ type: 'close', text: `Close — you're within ${diff}°. Line the protractor's centre on the vertex and 0° on one arm.` });
      setMeasureGuess('');
    } else {
      setMeasureStreak(0);
      setMeasureFeedback({ type: 'wrong', text: `${diff}° off. Tip: put the cross of the protractor exactly on the corner point, then rotate it so 0° sits on one arm.` });
      setMeasureGuess('');
    }
  };

  const renderMeasure = () => {
    const cx = 200, cy = 210, R = 150;
    const p1 = polar(cx, cy, R, measureBase);
    const p2 = polar(cx, cy, R, measureBase + measureAngle);
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-xl font-bold mb-1 text-center">Measure with a Protractor</h3>
        <p className="text-center text-sm text-gray-500 mb-3">
          Drag the protractor onto the vertex, rotate it so 0° lines up with one arm, then read the scale.
        </p>

        <div className="relative mx-auto" style={{ maxWidth: 420 }}>
          <svg viewBox="0 0 400 400" className="w-full border rounded-lg bg-slate-50 select-none">
            <path d={wedgePath(cx, cy, 44, measureBase, measureBase + measureAngle)} fill="#3B82F625" />
            <polyline points={arcPoints(cx, cy, 44, measureBase, measureBase + measureAngle)} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
            <line x1={cx} y1={cy} x2={p1.x} y2={p1.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <line x1={cx} y1={cy} x2={p2.x} y2={p2.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="#374151" />
            {measureRevealed && (
              <text x={cx} y={54} textAnchor="middle" fontSize="30" fontWeight="900" fill="#3B82F6">{measureAngle}°</text>
            )}
          </svg>

          {showProtractor && (
            <div
              className="absolute cursor-move select-none touch-none"
              style={{
                left: '50%',
                top: '52%',
                transform: `translate(calc(-50% + ${protractorPos.x}px), calc(-43% + ${protractorPos.y}px)) rotate(${-protractorRot}deg)`,
                zIndex: 10,
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                setProtractorDragging(true);
                protractorDragStart.current = { x: e.clientX - protractorPos.x, y: e.clientY - protractorPos.y };
                e.currentTarget.setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!protractorDragging || !protractorDragStart.current) return;
                setProtractorPos({
                  x: e.clientX - protractorDragStart.current.x,
                  y: e.clientY - protractorDragStart.current.y,
                });
              }}
              onPointerUp={() => { setProtractorDragging(false); protractorDragStart.current = null; }}
            >
              <svg width="240" height="130" viewBox="0 0 240 130" className="drop-shadow">
                <path d="M 20 110 A 100 100 0 0 1 220 110 Z" fill="rgba(191, 219, 254, 0.35)" stroke="rgba(37, 99, 235, 0.9)" strokeWidth="2" />
                {Array.from({ length: 19 }, (_, i) => {
                  const a = i * 10;
                  const rad = (a * Math.PI) / 180;
                  const major = a % 30 === 0;
                  const r1 = major ? 84 : 90;
                  const x1 = 120 + r1 * Math.cos(rad);
                  const y1 = 110 - r1 * Math.sin(rad);
                  const x2 = 120 + 98 * Math.cos(rad);
                  const y2 = 110 - 98 * Math.sin(rad);
                  const tx = 120 + 72 * Math.cos(rad);
                  const ty = 110 - 72 * Math.sin(rad);
                  return (
                    <g key={a}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(37,99,235,0.9)" strokeWidth={major ? 2 : 1} />
                      {major && (
                        <text x={tx} y={ty + 4} fontSize="11" textAnchor="middle" fill="rgba(37,99,235,0.95)" fontWeight="bold">{a}</text>
                      )}
                    </g>
                  );
                })}
                <line x1="20" y1="110" x2="220" y2="110" stroke="rgba(37,99,235,0.9)" strokeWidth="2" />
                <circle cx="120" cy="110" r="3" fill="rgba(220,38,38,0.95)" />
                <line x1="112" y1="110" x2="128" y2="110" stroke="rgba(220,38,38,0.8)" strokeWidth="1" />
                <line x1="120" y1="102" x2="120" y2="118" stroke="rgba(220,38,38,0.8)" strokeWidth="1" />
              </svg>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <button onClick={newMeasureAngle} className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold">
            🎲 New Angle
          </button>
          <button
            onClick={() => setShowProtractor(!showProtractor)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold text-white ${showProtractor ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}
          >
            📐 {showProtractor ? 'Hide' : 'Show'} Protractor
          </button>
          <button
            onClick={() => { setProtractorPos({ x: 0, y: 0 }); setProtractorRot(0); }}
            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm font-semibold"
          >
            🔄 Reset Position
          </button>
          <button
            onClick={() => setMeasureRevealed(!measureRevealed)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold text-white ${measureRevealed ? 'bg-purple-500 hover:bg-purple-600' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            {measureRevealed ? '🙈 Hide' : '👀 Show'} Answer
          </button>
        </div>

        {/* Protractor rotation */}
        {showProtractor && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 flex-wrap justify-center">
            <span className="text-sm font-semibold text-blue-800">Rotate protractor:</span>
            <button onClick={() => setProtractorRot((r) => r - 15)} className="bg-white border px-3 py-1 rounded-lg text-sm hover:bg-blue-100">↻ −15°</button>
            <input
              type="range" min="-180" max="180" value={protractorRot}
              onChange={(e) => setProtractorRot(parseInt(e.target.value))}
              className="w-40"
            />
            <button onClick={() => setProtractorRot((r) => r + 15)} className="bg-white border px-3 py-1 rounded-lg text-sm hover:bg-blue-100">↺ +15°</button>
            <span className="text-sm font-mono text-blue-700">{protractorRot}°</span>
          </div>
        )}

        {/* Guess */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4 max-w-md mx-auto text-center">
          <div className="text-lg font-bold text-gray-700 mb-2">What's your measurement? {measureStreak > 1 && <span className="text-orange-500">🔥{measureStreak}</span>}</div>
          <div className="flex items-center justify-center gap-3">
            <input
              type="number" value={measureGuess}
              onChange={(e) => setMeasureGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkMeasure()}
              placeholder="degrees" className="px-3 py-2 border rounded-lg text-center font-bold w-28"
              min="0" max="360"
            />
            <span className="font-bold">°</span>
            <button onClick={checkMeasure} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold">Check</button>
          </div>
          {measureFeedback && (
            <div className={`mt-3 p-3 rounded-lg border-2 text-center font-semibold text-sm ${
              measureFeedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800'
                : measureFeedback.type === 'close' ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : measureFeedback.type === 'wrong' ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-gray-100 border-gray-200 text-gray-700'
            }`}>
              {measureFeedback.text}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // CREATE mode — free play + target challenges
  // ══════════════════════════════════════════════════════════════════════════
  const newTarget = (lvl = createLevel) => {
    const gen = {
      1: () => randInt(2, 36) * 5, // multiples of 5 up to 180
      2: () => randInt(10, 180),
      3: () => randInt(10, 350),
    };
    setTargetAngle(gen[lvl]());
    setCreatedAngle(randInt(30, 60));
    setCreateResult(null);
  };

  const startCreateChallenge = (lvl) => {
    setCreateLevel(lvl);
    setCreateSubmode('challenge');
    setCreateRound(1);
    setCreateScore(0);
    newTarget(lvl);
  };

  const lockInCreate = () => {
    const diff = Math.abs(createdAngle - targetAngle);
    let pts = 0;
    let verdict = '';
    if (diff <= 2) { pts = 100; verdict = '🎯 PERFECT!'; }
    else if (diff <= 5) { pts = 75; verdict = '🌟 Excellent!'; }
    else if (diff <= 10) { pts = 50; verdict = '👍 Good!'; }
    else if (diff <= 20) { pts = 25; verdict = '🙂 Not bad!'; }
    else { pts = 0; verdict = '😅 Keep practising!'; }
    setCreateScore((s) => s + pts);
    setCreateResult({ diff, pts, verdict });
    setTimeout(() => {
      if (createRound >= 8) {
        showToast(`Challenge complete! Score: ${createScore + pts}/800`, 'success');
        setCreateSubmode('free');
        setCreateRound(0);
      } else {
        setCreateRound((r) => r + 1);
        newTarget();
      }
    }, 1800);
  };

  const handleCreatePointer = (e, isDown = false) => {
    if (!isDown && !createDragging) return;
    const svg = createSvgRef.current;
    if (!svg) return;
    const deg = angleFromEvent(e, svg, 180, 200, 360, 360);
    setCreatedAngle(Math.max(1, Math.min(359, Math.round(deg))));
  };

  const renderCreate = () => {
    const type = ANGLE_TYPES[getAngleType(createdAngle)];
    const cx = 180, cy = 200, R = 130;
    const tip = polar(cx, cy, R, createdAngle);
    const inChallenge = createSubmode === 'challenge' && createRound > 0;
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <button
            onClick={() => { setCreateSubmode('free'); setCreateRound(0); }}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${!inChallenge ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            ✏️ Free Play
          </button>
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              onClick={() => startCreateChallenge(lvl)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${inChallenge && createLevel === lvl ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              🎯 Challenge L{lvl}
              <span className="block text-[10px] opacity-75">{lvl === 1 ? 'multiples of 5' : lvl === 2 ? 'up to 180°' : 'incl. reflex'}</span>
            </button>
          ))}
        </div>

        {inChallenge && (
          <div className="flex items-center justify-between max-w-md mx-auto mb-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2">
            <span className="text-sm font-semibold text-purple-700">Round {createRound}/8</span>
            <span className="text-lg font-black text-purple-700">Make: {targetAngle}°</span>
            <span className="text-sm font-semibold text-purple-700">Score: {createScore}</span>
          </div>
        )}

        <svg
          ref={createSvgRef}
          viewBox="0 0 360 360"
          className="w-full max-w-[360px] mx-auto cursor-crosshair select-none touch-none"
          onPointerDown={(e) => { setCreateDragging(true); e.currentTarget.setPointerCapture?.(e.pointerId); handleCreatePointer(e, true); }}
          onPointerMove={(e) => handleCreatePointer(e)}
          onPointerUp={() => setCreateDragging(false)}
          onPointerLeave={() => setCreateDragging(false)}
        >
          <path d={wedgePath(cx, cy, 56, 0, createdAngle)} fill={type.color + '30'} />
          <polyline points={arcPoints(cx, cy, 56, 0, createdAngle)} fill="none" stroke={type.color} strokeWidth="3" />
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y} r="11" fill={type.color} stroke="#fff" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="5" fill="#374151" />
          {!inChallenge && (
            <text x={cx} y={60} textAnchor="middle" fontSize="34" fontWeight="900" fill={type.color}>{createdAngle}°</text>
          )}
          {inChallenge && createResult && (
            <text x={cx} y={60} textAnchor="middle" fontSize="24" fontWeight="900" fill={type.color}>
              {createdAngle}° ({createResult.diff}° off)
            </text>
          )}
        </svg>

        {!inChallenge ? (
          <>
            <input
              type="range" min="1" max="359" value={createdAngle}
              onChange={(e) => setCreatedAngle(parseInt(e.target.value))}
              className="w-full max-w-md mx-auto block mt-2"
            />
            <div className="text-center mt-3">
              <div className="inline-block px-6 py-2 rounded-full text-white font-bold" style={{ backgroundColor: type.color }}>
                {createdAngle}° — {type.name}
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4 max-w-lg mx-auto">
              {[{ v: 30, t: 'Acute' }, { v: 90, t: 'Right' }, { v: 135, t: 'Obtuse' }, { v: 180, t: 'Straight' }, { v: 270, t: 'Reflex' }].map((b) => (
                <button
                  key={b.v}
                  onClick={() => setCreatedAngle(b.v)}
                  className="text-white px-2 py-2 rounded text-xs font-semibold hover:opacity-90"
                  style={{ backgroundColor: ANGLE_TYPES[getAngleType(b.v)].color }}
                >
                  {b.v}° {b.t}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center mt-3">
            {createResult ? (
              <div className="text-2xl font-black" style={{ color: type.color }}>
                {createResult.verdict} +{createResult.pts}
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-2">Drag to shape the angle — degrees are hidden. Trust your eyes!</p>
                <button onClick={lockInCreate} className="bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg">
                  🔒 Lock It In!
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RULES mode — interactive lessons on angle relationships
  // ══════════════════════════════════════════════════════════════════════════
  const RULES = {
    complementary: {
      name: 'Complementary', icon: '🧩', sum: 90,
      fact: 'Two angles are COMPLEMENTARY when they add up to 90° (a right angle). Think: "Corner = Complementary".',
      makeQuiz: () => { const a = randInt(5, 85); return { q: `One angle is ${a}°. What is its complement?`, a: 90 - a, working: `90 − ${a} = ${90 - a}°` }; },
    },
    supplementary: {
      name: 'Supplementary', icon: '📏', sum: 180,
      fact: 'Two angles are SUPPLEMENTARY when they add up to 180° (a straight line). Think: "Straight = Supplementary".',
      makeQuiz: () => { const a = randInt(10, 170); return { q: `One angle is ${a}°. What is its supplement?`, a: 180 - a, working: `180 − ${a} = ${180 - a}°` }; },
    },
    vertical: {
      name: 'Vertically Opposite', icon: '✖️',
      fact: 'When two straight lines cross, the angles OPPOSITE each other are always EQUAL. The angles next to each other add to 180°.',
      makeQuiz: () => { const a = randInt(20, 160); return { q: `Two lines cross. One angle is ${a}°. What is the angle directly opposite it?`, a, working: `Vertically opposite angles are equal, so it's also ${a}°` }; },
    },
    point: {
      name: 'Angles at a Point', icon: '🎡', sum: 360,
      fact: 'Angles around a point always add up to 360° — a full turn!',
      makeQuiz: () => { const a = randInt(60, 150); const b = randInt(60, 150); return { q: `Three angles meet at a point. Two of them are ${a}° and ${b}°. What is the third?`, a: 360 - a - b, working: `360 − ${a} − ${b} = ${360 - a - b}°` }; },
    },
    triangle: {
      name: 'Triangle Sum', icon: '🔺', sum: 180,
      fact: 'The three inside angles of ANY triangle always add up to exactly 180°. Always. Every triangle, every time!',
      makeQuiz: () => { const a = randInt(30, 90); const b = randInt(30, 80); return { q: `A triangle has angles of ${a}° and ${b}°. What is the third angle?`, a: 180 - a - b, working: `180 − ${a} − ${b} = ${180 - a - b}°` }; },
    },
  };

  const newRuleQuiz = (ruleKey = activeRule) => {
    setRuleQuiz(RULES[ruleKey].makeQuiz());
    setRuleQuizInput('');
    setRuleQuizFeedback(null);
  };

  useEffect(() => {
    if (activeMode === 'rules') newRuleQuiz(activeRule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRule, activeMode]);

  const checkRuleQuiz = () => {
    if (!ruleQuiz || ruleQuizInput === '') return;
    const correct = parseInt(ruleQuizInput) === ruleQuiz.a;
    if (correct) {
      setRuleQuizFeedback({ ok: true, text: `Correct! ${ruleQuiz.working} ✅` });
      showToast('Correct! 🎉', 'success');
      setTimeout(() => newRuleQuiz(), 2000);
    } else {
      setRuleQuizFeedback({ ok: false, text: `Not quite. ${ruleQuiz.working}` });
      setTimeout(() => newRuleQuiz(), 2600);
    }
  };

  const handleRulePointer = (e, target = null, isDown = false) => {
    const t = isDown ? target : ruleDragTarget;
    if (!t) return;
    const svg = ruleSvgRef.current;
    if (!svg) return;
    const cx = 160, cy = activeRule === 'supplementary' ? 200 : 160;
    const deg = angleFromEvent(e, svg, cx, cy, 320, activeRule === 'supplementary' ? 240 : 320);
    if (t === 'a') {
      if (activeRule === 'complementary') setRuleAngleA(Math.max(5, Math.min(85, Math.round(deg))));
      else if (activeRule === 'supplementary') setRuleAngleA(Math.max(5, Math.min(175, Math.round(deg))));
      else if (activeRule === 'vertical') setRuleAngleA(Math.max(15, Math.min(165, Math.round(deg))));
    } else if (t === 'd1') {
      setPointDiv1(Math.max(15, Math.min(pointDiv2 - 15, Math.round(deg))));
    } else if (t === 'd2') {
      setPointDiv2(Math.max(pointDiv1 + 15, Math.min(345, Math.round(deg))));
    }
  };

  const renderRuleFigure = () => {
    const dragProps = (target) => ({
      onPointerDown: (e) => { e.stopPropagation(); setRuleDragTarget(target); handleRulePointer(e, target, true); },
    });
    const svgShared = {
      ref: ruleSvgRef,
      className: 'w-full max-w-[340px] mx-auto select-none touch-none',
      onPointerMove: (e) => handleRulePointer(e),
      onPointerUp: () => setRuleDragTarget(null),
      onPointerLeave: () => setRuleDragTarget(null),
    };

    if (activeRule === 'complementary') {
      const cx = 160, cy = 160, R = 120;
      const a = ruleAngleA;
      const tip = polar(cx, cy, R, a);
      const up = polar(cx, cy, R, 90);
      return (
        <svg viewBox="0 0 320 320" {...svgShared}>
          <path d={wedgePath(cx, cy, 50, 0, a)} fill={PART_COLORS[0] + '30'} />
          <path d={wedgePath(cx, cy, 64, a, 90)} fill={PART_COLORS[1] + '30'} />
          <polyline points={arcPoints(cx, cy, 50, 0, a)} fill="none" stroke={PART_COLORS[0]} strokeWidth="2.5" />
          <polyline points={arcPoints(cx, cy, 64, a, 90)} fill="none" stroke={PART_COLORS[1]} strokeWidth="2.5" />
          <path d={`M ${cx + 20} ${cy} L ${cx + 20} ${cy - 20} L ${cx} ${cy - 20}`} fill="none" stroke="#64748b" strokeWidth="2" />
          <line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={up.x} y2={up.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="2 0" />
          <circle cx={tip.x} cy={tip.y} r="11" fill="#fff" stroke={PART_COLORS[0]} strokeWidth="4" className="cursor-grab" {...dragProps('a')} />
          <text {...(() => { const p = polar(cx, cy, 88, a / 2); return { x: p.x, y: p.y + 5 }; })()} textAnchor="middle" fontSize="17" fontWeight="800" fill={PART_COLORS[0]}>{a}°</text>
          <text {...(() => { const p = polar(cx, cy, 96, (a + 90) / 2); return { x: p.x, y: p.y + 5 }; })()} textAnchor="middle" fontSize="17" fontWeight="800" fill={PART_COLORS[1]}>{90 - a}°</text>
          <circle cx={cx} cy={cy} r="5" fill="#374151" />
        </svg>
      );
    }

    if (activeRule === 'supplementary') {
      const cx = 160, cy = 200, R = 130;
      const a = ruleAngleA;
      const tip = polar(cx, cy, R, a);
      return (
        <svg viewBox="0 0 320 240" {...svgShared}>
          <path d={wedgePath(cx, cy, 48, 0, a)} fill={PART_COLORS[0] + '30'} />
          <path d={wedgePath(cx, cy, 62, a, 180)} fill={PART_COLORS[1] + '30'} />
          <polyline points={arcPoints(cx, cy, 48, 0, a)} fill="none" stroke={PART_COLORS[0]} strokeWidth="2.5" />
          <polyline points={arcPoints(cx, cy, 62, a, 180)} fill="none" stroke={PART_COLORS[1]} strokeWidth="2.5" />
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y} r="11" fill="#fff" stroke={PART_COLORS[0]} strokeWidth="4" className="cursor-grab" {...dragProps('a')} />
          <text {...(() => { const p = polar(cx, cy, 86, a / 2); return { x: p.x, y: p.y + 5 }; })()} textAnchor="middle" fontSize="17" fontWeight="800" fill={PART_COLORS[0]}>{a}°</text>
          <text {...(() => { const p = polar(cx, cy, 94, (a + 180) / 2); return { x: p.x, y: p.y + 5 }; })()} textAnchor="middle" fontSize="17" fontWeight="800" fill={PART_COLORS[1]}>{180 - a}°</text>
          <circle cx={cx} cy={cy} r="5" fill="#374151" />
        </svg>
      );
    }

    if (activeRule === 'vertical') {
      const a = ruleAngleA;
      const cx = 160, cy = 160, R = 134;
      const handle = polar(cx, cy, R, a);
      return (
        <svg viewBox="0 0 320 320" {...svgShared}>
          {[[0, a, PART_COLORS[0], `${a}°`, 40], [a, 180, PART_COLORS[1], `${180 - a}°`, 54], [180, 180 + a, PART_COLORS[0], `${a}°`, 40], [180 + a, 360, PART_COLORS[1], `${180 - a}°`, 54]].map(([s, e2, col, lab, r], i) => {
            const mid = (Number(s) + Number(e2)) / 2;
            const lp = polar(cx, cy, Number(r) + 26, mid);
            return (
              <g key={i}>
                <path d={wedgePath(cx, cy, Number(r), Number(s), Number(e2))} fill={col + '28'} />
                <polyline points={arcPoints(cx, cy, Number(r), Number(s), Number(e2))} fill="none" stroke={col} strokeWidth="2.5" />
                <text x={lp.x} y={lp.y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill={col}>{lab}</text>
              </g>
            );
          })}
          <line x1={polar(cx, cy, R, 0).x} y1={polar(cx, cy, R, 0).y} x2={polar(cx, cy, R, 180).x} y2={polar(cx, cy, R, 180).y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <line x1={polar(cx, cy, R, a).x} y1={polar(cx, cy, R, a).y} x2={polar(cx, cy, R, a + 180).x} y2={polar(cx, cy, R, a + 180).y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <circle cx={handle.x} cy={handle.y} r="11" fill="#fff" stroke={PART_COLORS[0]} strokeWidth="4" className="cursor-grab" {...dragProps('a')} />
          <circle cx={cx} cy={cy} r="5" fill="#374151" />
        </svg>
      );
    }

    if (activeRule === 'point') {
      const cx = 160, cy = 160;
      const parts = [
        { value: pointDiv1, known: true, color: PART_COLORS[0] },
        { value: pointDiv2 - pointDiv1, known: true, color: PART_COLORS[1] },
        { value: 360 - pointDiv2, known: true, color: PART_COLORS[2] },
      ];
      const h1 = polar(cx, cy, 134, pointDiv1);
      const h2 = polar(cx, cy, 134, pointDiv2);
      let acc = 0;
      return (
        <svg viewBox="0 0 320 320" {...svgShared}>
          {parts.map((p, i) => {
            const a0 = acc;
            acc += p.value;
            const r = 40 + i * 13;
            const mid = (a0 + acc) / 2;
            const lp = polar(cx, cy, r + 27, mid);
            return (
              <g key={i}>
                <path d={wedgePath(cx, cy, r, a0, acc)} fill={p.color + '28'} />
                <polyline points={arcPoints(cx, cy, r, a0, acc)} fill="none" stroke={p.color} strokeWidth="2.5" />
                <text x={lp.x} y={lp.y + 5} textAnchor="middle" fontSize="15" fontWeight="800" fill={p.color}>{p.value}°</text>
              </g>
            );
          })}
          {[0, pointDiv1, pointDiv2].map((d, i) => {
            const p = polar(cx, cy, 134, d);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />;
          })}
          <circle cx={h1.x} cy={h1.y} r="11" fill="#fff" stroke={PART_COLORS[0]} strokeWidth="4" className="cursor-grab" {...dragProps('d1')} />
          <circle cx={h2.x} cy={h2.y} r="11" fill="#fff" stroke={PART_COLORS[2]} strokeWidth="4" className="cursor-grab" {...dragProps('d2')} />
          <circle cx={cx} cy={cy} r="5" fill="#374151" />
        </svg>
      );
    }

    // triangle
    const A = Math.round(30 + triApexT * 60); // 30..90
    const B = Math.round(110 - triApexT * 60); // 50..110... keep sum < 180
    const C = 180 - A - B;
    return (
      <div>
        <TriangleFigure angles={[A, B, C]} known={[true, true, true]} />
        <div className="max-w-xs mx-auto mt-2">
          <label className="block text-xs text-gray-500 text-center mb-1">Drag to reshape the triangle</label>
          <input type="range" min="0" max="1" step="0.01" value={triApexT} onChange={(e) => setTriApexT(parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>
    );
  };

  const ruleEquation = () => {
    switch (activeRule) {
      case 'complementary':
        return <><span style={{ color: PART_COLORS[0] }}>{ruleAngleA}°</span> + <span style={{ color: PART_COLORS[1] }}>{90 - ruleAngleA}°</span> = <strong>90°</strong></>;
      case 'supplementary':
        return <><span style={{ color: PART_COLORS[0] }}>{ruleAngleA}°</span> + <span style={{ color: PART_COLORS[1] }}>{180 - ruleAngleA}°</span> = <strong>180°</strong></>;
      case 'vertical':
        return <><span style={{ color: PART_COLORS[0] }}>{ruleAngleA}°</span> = <span style={{ color: PART_COLORS[0] }}>{ruleAngleA}°</span> and <span style={{ color: PART_COLORS[1] }}>{180 - ruleAngleA}°</span> = <span style={{ color: PART_COLORS[1] }}>{180 - ruleAngleA}°</span></>;
      case 'point':
        return <><span style={{ color: PART_COLORS[0] }}>{pointDiv1}°</span> + <span style={{ color: PART_COLORS[1] }}>{pointDiv2 - pointDiv1}°</span> + <span style={{ color: PART_COLORS[2] }}>{360 - pointDiv2}°</span> = <strong>360°</strong></>;
      case 'triangle': {
        const A = Math.round(30 + triApexT * 60);
        const B = Math.round(110 - triApexT * 60);
        return <><span style={{ color: PART_COLORS[0] }}>{A}°</span> + <span style={{ color: PART_COLORS[1] }}>{B}°</span> + <span style={{ color: PART_COLORS[2] }}>{180 - A - B}°</span> = <strong>180°</strong></>;
      }
      default:
        return null;
    }
  };

  const renderRules = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(RULES).map(([key, rule]) => (
            <button
              key={key}
              onClick={() => setActiveRule(key)}
              className={`px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm transition-all ${
                activeRule === key ? 'bg-purple-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rule.icon} {rule.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-center mb-1">{RULES[activeRule].icon} {RULES[activeRule].name} Angles</h3>
          <p className="text-center text-xs text-gray-500 mb-3">
            {activeRule === 'triangle' ? 'Use the slider to reshape — the sum never changes!' : 'Drag the white handles and watch the numbers update!'}
          </p>
          {renderRuleFigure()}
          <div className="text-center text-xl md:text-2xl font-black mt-3 bg-gray-50 rounded-xl py-3">
            {ruleEquation()}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5">
            <h4 className="font-bold text-purple-800 mb-2">💡 Key Fact</h4>
            <p className="text-purple-900 text-sm leading-relaxed">{RULES[activeRule].fact}</p>
          </div>

          {ruleQuiz && (
            <div className="bg-white rounded-xl p-5 shadow-sm border">
              <h4 className="font-bold text-gray-800 mb-2">✏️ Quick Check</h4>
              <p className="text-gray-700 mb-3">{ruleQuiz.q}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number" value={ruleQuizInput}
                  onChange={(e) => setRuleQuizInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkRuleQuiz()}
                  placeholder="degrees" className="px-3 py-2 border rounded-lg text-center font-bold w-28"
                />
                <span className="font-bold">°</span>
                <button onClick={checkRuleQuiz} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">Check</button>
                <button onClick={() => newRuleQuiz()} className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-sm">New</button>
              </div>
              {ruleQuizFeedback && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-semibold ${ruleQuizFeedback.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {ruleQuizFeedback.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // MISSING mode — composite missing-angle challenges
  // ══════════════════════════════════════════════════════════════════════════
  const makeMissingProblem = useCallback((lvl) => {
    const pools = {
      1: ['line2', 'comp', 'vert'],
      2: ['line2', 'comp', 'vert', 'line3', 'point3'],
      3: ['line3', 'point3', 'point4', 'tri', 'vert'],
    };
    const pool = pools[lvl];
    const kind = pool[randInt(0, pool.length - 1)];
    const baseDeg = randInt(0, 70);

    const buildParts = (sum, n) => {
      // n known parts + 1 missing, all ≥ 12° for readability
      const vals = [];
      let remaining = sum - 12 * (n + 1);
      for (let i = 0; i < n; i++) {
        const v = 12 + randInt(0, Math.floor(remaining / (n - i + 1)) * 2 > remaining ? remaining : Math.floor((remaining / (n + 1 - i)) * 1.4));
        vals.push(12 + Math.min(remaining, Math.max(0, v - 12)));
        remaining -= vals[vals.length - 1] - 12;
      }
      const missing = sum - vals.reduce((a, b) => a + b, 0);
      return { vals, missing };
    };

    let problem;
    if (kind === 'line2') {
      const a = randInt(25, 150);
      problem = {
        kind, figure: 'parts', figKind: 'line', baseDeg,
        parts: [{ value: a, known: true }, { value: 180 - a, known: false }],
        answer: 180 - a,
        rule: 'Angles on a straight line add to 180°',
        working: `x = 180 − ${a} = ${180 - a}°`,
      };
    } else if (kind === 'line3') {
      const { vals, missing } = buildParts(180, 2);
      const order = randInt(0, 2);
      const parts = vals.map((v) => ({ value: v, known: true }));
      parts.splice(order, 0, { value: missing, known: false });
      problem = {
        kind, figure: 'parts', figKind: 'line', baseDeg, parts,
        answer: missing,
        rule: 'Angles on a straight line add to 180°',
        working: `x = 180 − ${vals.join(' − ')} = ${missing}°`,
      };
    } else if (kind === 'comp') {
      const a = randInt(15, 75);
      const parts = [{ value: a, known: true }, { value: 90 - a, known: false }];
      if (Math.random() < 0.5) parts.reverse();
      problem = {
        kind, figure: 'parts', figKind: 'corner', baseDeg: 0, parts,
        answer: 90 - a,
        rule: 'Angles in a right angle add to 90°',
        working: `x = 90 − ${a} = ${90 - a}°`,
      };
    } else if (kind === 'point3' || kind === 'point4') {
      const n = kind === 'point3' ? 2 : 3;
      const { vals, missing } = buildParts(360, n);
      const insertAt = randInt(0, n);
      const parts = vals.map((v) => ({ value: v, known: true }));
      parts.splice(insertAt, 0, { value: missing, known: false });
      problem = {
        kind, figure: 'parts', figKind: 'point', baseDeg, parts,
        answer: missing,
        rule: 'Angles around a point add to 360°',
        working: `x = 360 − ${vals.join(' − ')} = ${missing}°`,
      };
    } else if (kind === 'vert') {
      const a = randInt(25, 155);
      const askOpposite = Math.random() < 0.6;
      problem = {
        kind, figure: 'vert', baseDeg: randInt(0, 40), vertAngle: a, askOpposite,
        answer: askOpposite ? a : 180 - a,
        rule: askOpposite ? 'Vertically opposite angles are equal' : 'Angles on a straight line add to 180°',
        working: askOpposite ? `x = ${a}° (vertically opposite angles are equal)` : `x = 180 − ${a} = ${180 - a}°`,
      };
    } else {
      // triangle
      const A = randInt(30, 100);
      const B = randInt(25, Math.min(120, 165 - A));
      const C = 180 - A - B;
      const hide = randInt(0, 2);
      const angles = [A, B, C];
      problem = {
        kind, figure: 'tri', angles, hide,
        answer: angles[hide],
        rule: 'Angles in a triangle add to 180°',
        working: `x = 180 − ${angles.filter((_, i) => i !== hide).join(' − ')} = ${angles[hide]}°`,
      };
    }
    return problem;
  }, []);

  const startMissing = (lvl) => {
    setMissingLevel(lvl);
    setMissingQNum(1);
    setMissingScore(0);
    setMissingStreak(0);
    setMissingDone(false);
    setMissingProblem(makeMissingProblem(lvl));
    setMissingInput('');
    setMissingFeedback(null);
  };

  const submitMissing = () => {
    if (!missingProblem || missingInput === '' || missingFeedback) return;
    const correct = parseInt(missingInput) === missingProblem.answer;
    if (correct) {
      const pts = 10 + missingStreak * 2;
      setMissingScore((s) => s + pts);
      setMissingStreak((st) => st + 1);
      setMissingFeedback({ ok: true, text: `Correct! +${pts} — ${missingProblem.working}` });
      showToast('Correct! 🎉', 'success');
    } else {
      setMissingStreak(0);
      setMissingFeedback({ ok: false, text: `Not quite. ${missingProblem.rule}. ${missingProblem.working}` });
    }
    setTimeout(() => {
      if (missingQNum >= MISSING_TOTAL) {
        setMissingDone(true);
      } else {
        setMissingQNum((n) => n + 1);
        setMissingProblem(makeMissingProblem(missingLevel));
        setMissingInput('');
        setMissingFeedback(null);
      }
    }, 2400);
  };

  const renderMissingFigure = (p) => {
    if (p.figure === 'parts') {
      return (
        <PartsFigure
          parts={p.parts.map((part, i) => ({ ...part, color: PART_COLORS[i % PART_COLORS.length] }))}
          baseDeg={p.baseDeg}
          kind={p.figKind}
        />
      );
    }
    if (p.figure === 'vert') {
      const labels = p.askOpposite
        ? [
            { pos: 'a0', text: `${p.vertAngle}°`, color: PART_COLORS[0] },
            { pos: 'a2', text: 'x°?', color: MISSING_COLOR, big: true },
          ]
        : [
            { pos: 'a0', text: `${p.vertAngle}°`, color: PART_COLORS[0] },
            { pos: 'a1', text: 'x°?', color: MISSING_COLOR, big: true },
          ];
      return <VertFigure a={p.vertAngle} baseDeg={p.baseDeg} labels={labels} />;
    }
    // triangle
    return <TriangleFigure angles={p.angles} known={p.angles.map((_, i) => i !== p.hide)} />;
  };

  const renderMissing = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-xl font-bold text-center mb-1">🎯 Find the Missing Angle</h3>
      <p className="text-center text-sm text-gray-500 mb-4">Use the angle rules to work out x — no protractor needed, just maths!</p>

      {missingQNum === 0 || missingDone ? (
        <div className="text-center space-y-5">
          {missingDone && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 max-w-md mx-auto">
              <div className="text-4xl mb-1">{missingScore >= 100 ? '🏆' : '⭐'}</div>
              <div className="text-2xl font-black text-purple-700">{missingScore} points</div>
              <p className="text-sm text-gray-600 mt-1">Level {missingLevel} complete!</p>
            </div>
          )}
          <div className="text-4xl">{missingDone ? '' : '🧮'}</div>
          <p className="text-gray-700 font-semibold">{missingDone ? 'Play again?' : `Solve ${MISSING_TOTAL} missing-angle puzzles. Streaks earn bonus points!`}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {[
              { lvl: 1, name: 'Level 1', desc: 'Lines, corners & opposite angles' },
              { lvl: 2, name: 'Level 2', desc: '+ 3-part lines & points' },
              { lvl: 3, name: 'Level 3', desc: '+ triangles & 4-part points' },
            ].map((o) => (
              <button
                key={o.lvl}
                onClick={() => startMissing(o.lvl)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl px-6 py-3 font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                {o.name}
                <span className="block text-xs font-normal opacity-80">{o.desc}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between max-w-md mx-auto mb-3 text-sm font-semibold text-gray-600">
            <span>Question {missingQNum}/{MISSING_TOTAL} · Level {missingLevel}</span>
            <span className="text-orange-500">{missingStreak > 1 ? `🔥${missingStreak}` : ''}</span>
            <span className="text-purple-700">Score: {missingScore}</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-center text-sm font-semibold text-blue-800 max-w-md mx-auto mb-3">
            📖 Rule: {missingProblem?.rule}
          </div>

          {missingProblem && renderMissingFigure(missingProblem)}

          <div className="text-center mt-4">
            <div className="flex items-center justify-center gap-2">
              <span className="font-bold text-lg" style={{ color: MISSING_COLOR }}>x =</span>
              <input
                type="number" value={missingInput}
                onChange={(e) => setMissingInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitMissing()}
                placeholder="?" className="px-3 py-2 border-2 rounded-lg text-center font-bold w-28 text-lg"
                style={{ borderColor: MISSING_COLOR }}
                disabled={Boolean(missingFeedback)}
              />
              <span className="font-bold text-lg">°</span>
              <button
                onClick={submitMissing}
                disabled={Boolean(missingFeedback) || missingInput === ''}
                className="bg-gradient-to-r from-orange-500 to-pink-600 text-white px-5 py-2 rounded-lg font-bold hover:shadow-lg disabled:opacity-40"
              >
                Submit
              </button>
            </div>
            {missingFeedback && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-semibold max-w-md mx-auto ${missingFeedback.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {missingFeedback.text}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ESTIMATE mode — estimation game
  // ══════════════════════════════════════════════════════════════════════════
  const newEstAngle = (lvl = estLevel) => {
    const gens = { 1: () => randInt(5, 89), 2: () => randInt(5, 179), 3: () => randInt(5, 354) };
    setEstAngle(gens[lvl]());
    setEstGuess('');
    setEstFeedback(null);
  };

  const startEstimate = (lvl) => {
    setEstLevel(lvl);
    setEstQNum(1);
    setEstScore(0);
    setEstStreak(0);
    newEstAngle(lvl);
  };

  const submitEstimate = () => {
    if (!estGuess || estFeedback) return;
    const diff = Math.abs(parseInt(estGuess) - estAngle);
    let pts = 0;
    if (diff === 0) pts = 20;
    else if (diff <= 3) pts = 15;
    else if (diff <= 7) pts = 10;
    else if (diff <= 12) pts = 5;
    const bonus = pts > 0 ? estStreak * 2 : 0;
    setEstScore((s) => s + pts + bonus);
    setEstStreak(pts > 0 ? estStreak + 1 : 0);
    setEstFeedback({
      ok: pts > 0,
      text: `It was ${estAngle}° (${ANGLE_TYPES[getAngleType(estAngle)].name}). You were ${diff}° off → +${pts}${bonus ? ` (+${bonus} streak bonus)` : ''}`,
    });
    setTimeout(() => {
      if (estQNum >= 10) {
        showToast(`Estimation game over! Score: ${estScore + pts + bonus}`, 'success');
        setEstQNum(0);
      } else {
        setEstQNum((n) => n + 1);
        newEstAngle();
      }
    }, 2200);
  };

  const renderEstimate = () => {
    const cx = 160, cy = 170, R = 120;
    const base = 15; // fixed slight rotation so it's not always horizontal
    const tip = polar(cx, cy, R, base + estAngle);
    const start = polar(cx, cy, R, base);
    const type = ANGLE_TYPES[getAngleType(estAngle)];
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="text-xl font-bold text-center mb-1">🎮 Angle Estimation Game</h3>
        {estQNum === 0 ? (
          <div className="text-center space-y-5 py-4">
            <div className="text-4xl">🎯</div>
            <p className="text-gray-700 font-semibold">Estimate each angle by eye — within 12° scores points, exact = 20!</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              {[
                { lvl: 1, name: 'Level 1', desc: 'Acute angles only' },
                { lvl: 2, name: 'Level 2', desc: 'Up to 180°' },
                { lvl: 3, name: 'Level 3', desc: 'All angles incl. reflex' },
              ].map((o) => (
                <button
                  key={o.lvl}
                  onClick={() => startEstimate(o.lvl)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl px-6 py-3 font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  {o.name}
                  <span className="block text-xs font-normal opacity-80">{o.desc}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between max-w-md mx-auto mb-2 text-sm font-semibold text-gray-600">
              <span>Question {estQNum}/10 · Level {estLevel}</span>
              <span className="text-orange-500">{estStreak > 1 ? `🔥${estStreak}` : ''}</span>
              <span className="text-blue-700">Score: {estScore}</span>
            </div>
            <svg viewBox="0 0 320 320" className="w-full max-w-[300px] mx-auto select-none">
              <path d={wedgePath(cx, cy, 46, base, base + estAngle)} fill={(estFeedback ? type.color : '#64748b') + '28'} />
              <polyline points={arcPoints(cx, cy, 46, base, base + estAngle)} fill="none" stroke={estFeedback ? type.color : '#64748b'} strokeWidth="2.5" />
              <line x1={cx} y1={cy} x2={start.x} y2={start.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
              <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#374151" strokeWidth="4" strokeLinecap="round" />
              <circle cx={cx} cy={cy} r="5" fill="#374151" />
              {estFeedback && (
                <text x={cx} y={40} textAnchor="middle" fontSize="28" fontWeight="900" fill={type.color}>{estAngle}°</text>
              )}
            </svg>
            <div className="text-center mt-3">
              <div className="flex items-center justify-center gap-2">
                <input
                  type="number" value={estGuess}
                  onChange={(e) => setEstGuess(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitEstimate()}
                  placeholder="estimate" className="px-3 py-2 border rounded-lg text-center font-bold w-28"
                  disabled={Boolean(estFeedback)}
                />
                <span className="font-bold">°</span>
                <button
                  onClick={submitEstimate}
                  disabled={Boolean(estFeedback) || !estGuess}
                  className="bg-blue-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-40"
                >
                  Submit
                </button>
              </div>
              {estFeedback && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-semibold max-w-md mx-auto ${estFeedback.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {estFeedback.text}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Layout
  // ══════════════════════════════════════════════════════════════════════════
  const MODES = [
    { id: 'learn', name: 'Learn Types', icon: '📚', description: 'Explore the 5 angle types' },
    { id: 'measure', name: 'Measure', icon: '📏', description: 'Practise with a protractor' },
    { id: 'create', name: 'Create', icon: '✏️', description: 'Build angles & beat targets' },
    { id: 'rules', name: 'Angle Rules', icon: '🧩', description: 'Pairs, points & triangles' },
    { id: 'missing', name: 'Missing Angle', icon: '🎯', description: 'Solve for x with the rules' },
    { id: 'estimate', name: 'Estimate', icon: '🎮', description: 'Estimation challenge game' },
  ];

  const renderContent = () => {
    switch (activeMode) {
      case 'learn': return renderLearn();
      case 'measure': return renderMeasure();
      case 'create': return renderCreate();
      case 'rules': return renderRules();
      case 'missing': return renderMissing();
      case 'estimate': return renderEstimate();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <span className="mr-3">📐</span>
            Interactive Angles
            <span className="ml-3">📏</span>
          </h1>
          <p className="text-lg md:text-xl opacity-90">Learn, measure, create, solve, and play with angles!</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex flex-col items-center p-3 md:p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                activeMode === mode.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{mode.icon}</div>
              <div className="font-bold text-sm md:text-base">{mode.name}</div>
              <div className="text-[11px] text-gray-600 text-center mt-1 leading-tight">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Angle Rules Cheat Sheet
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <h4 className="font-semibold text-blue-700 mb-2">The 5 Types</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Acute: less than 90° (A-cute = small!)</li>
              <li>• Right: exactly 90° (an "L" shape)</li>
              <li>• Obtuse: between 90° and 180°</li>
              <li>• Straight: exactly 180° (a line)</li>
              <li>• Reflex: more than 180°</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-3">
            <h4 className="font-semibold text-blue-700 mb-2">Adding-Up Rules</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Right angle (corner): parts add to <strong>90°</strong></li>
              <li>• Straight line: parts add to <strong>180°</strong></li>
              <li>• Around a point: parts add to <strong>360°</strong></li>
              <li>• Inside a triangle: angles add to <strong>180°</strong></li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-3">
            <h4 className="font-semibold text-blue-700 mb-2">Clever Tricks</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Crossing lines → opposite angles are <strong>equal</strong></li>
              <li>• Complementary = Corner (90°)</li>
              <li>• Supplementary = Straight (180°)</li>
              <li>• To find x: add the known angles, subtract from the total</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveAngles;
