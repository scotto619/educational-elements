// components/curriculum/mathematics/FractionVisualiser.js
import React, { useState, useMemo } from 'react';

// ── Pure helpers (outside component to avoid stale-closure warnings) ─────────
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const simplify = (n, d) => {
    if (d === 0) return { n: 0, d: 1 };
    const g = gcd(Math.abs(n), Math.abs(d));
    return { n: n / g, d: d / g };
};

const FractionVisualiser = ({ showToast = () => {} }) => {
    // --- Primary Fraction ---
    const [numerator, setNumerator] = useState(1);
    const [denominator, setDenominator] = useState(4);

    // --- Compare mode ---
    const [compareMode, setCompareMode] = useState(false);
    const [numB, setNumB] = useState(1);
    const [denB, setDenB] = useState(3);

    // --- Display settings ---
    const [viewMode, setViewMode] = useState('bar'); // 'bar' | 'circle' | 'grid' | 'numberline'
    const [showDecimal, setShowDecimal] = useState(false);
    const [showPercentage, setShowPercentage] = useState(false);
    const [showEquivalents, setShowEquivalents] = useState(true);

    // --- Quiz mode ---
    const [quizMode, setQuizMode] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState(null);
    const [quizAnswer, setQuizAnswer] = useState('');
    const [quizFeedback, setQuizFeedback] = useState(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizTotal, setQuizTotal] = useState(0);

    const equivalent = useMemo(() => {
        const results = [];
        for (let mult = 1; mult <= 8; mult++) {
            results.push({ n: numerator * mult, d: denominator * mult });
        }
        return results;
    }, [numerator, denominator]);

    const simplified = useMemo(() => simplify(numerator, denominator), [numerator, denominator]);
    const decimalVal = denominator !== 0 ? (numerator / denominator) : 0;
    const percentVal = (decimalVal * 100).toFixed(1);

    const compareResult = useMemo(() => {
        if (!compareMode) return null;
        const valA = numerator / denominator;
        const valB = numB / denB;
        if (Math.abs(valA - valB) < 0.0001) return '=';
        return valA > valB ? '>' : '<';
    }, [compareMode, numerator, denominator, numB, denB]);

    // ── Quiz logic ────────────────────────────────────────────────────────────
    const generateQuestion = () => {
        const types = ['identify', 'simplify', 'compare', 'equivalent'];
        const type = types[Math.floor(Math.random() * types.length)];
        const dens = [2, 3, 4, 5, 6, 8, 10];
        const d = dens[Math.floor(Math.random() * dens.length)];
        const n = Math.floor(Math.random() * d) + 1;

        if (type === 'identify') {
            return {
                type,
                text: `Look at the fraction bar above. What fraction is shown?`,
                displayN: n, displayD: d,
                answer: `${n}/${d}`,
                hint: `Count the shaded parts (top) over total parts (bottom)`
            };
        } else if (type === 'simplify') {
            const mult = Math.floor(Math.random() * 3) + 2;
            const sn = n * mult, sd = d * mult;
            const s = simplify(sn, sd);
            return {
                type,
                text: `Simplify ${sn}/${sd} to its lowest terms`,
                displayN: sn, displayD: sd,
                answer: `${s.n}/${s.d}`,
                hint: `Divide both numbers by their Greatest Common Factor`
            };
        } else if (type === 'compare') {
            const d2 = dens[Math.floor(Math.random() * dens.length)];
            const n2 = Math.floor(Math.random() * d2) + 1;
            const v1 = n / d, v2 = n2 / d2;
            const ans = Math.abs(v1 - v2) < 0.001 ? '=' : v1 > v2 ? '>' : '<';
            return {
                type,
                text: `Use >, < or = to compare: ${n}/${d}  ?  ${n2}/${d2}`,
                displayN: n, displayD: d,
                answer: ans,
                hint: `Convert both to the same denominator or use decimals`
            };
        } else {
            const mult2 = Math.floor(Math.random() * 4) + 2;
            return {
                type,
                text: `Write an equivalent fraction for ${n}/${d} using denominator ${d * mult2}`,
                displayN: n, displayD: d,
                answer: `${n * mult2}/${d * mult2}`,
                hint: `Multiply both numerator and denominator by the same number`
            };
        }
    };

    const startQuiz = () => {
        const q = generateQuestion();
        setQuizQuestion(q);
        setNumerator(q.displayN);
        setDenominator(q.displayD);
        setQuizAnswer('');
        setQuizFeedback(null);
        setQuizMode(true);
    };

    const submitAnswer = () => {
        if (!quizAnswer.trim()) return;
        const correct = quizAnswer.trim().replace(/\s/g, '').toLowerCase() === quizQuestion.answer.toLowerCase();
        setQuizTotal(t => t + 1);
        if (correct) setQuizScore(s => s + 1);
        setQuizFeedback({ correct, answer: quizQuestion.answer });
    };

    const nextQuestion = () => {
        const q = generateQuestion();
        setQuizQuestion(q);
        setNumerator(q.displayN);
        setDenominator(q.displayD);
        setQuizAnswer('');
        setQuizFeedback(null);
    };

    // ── Visual renderers ─────────────────────────────────────────────────────
    const BarModel = ({ n, d, color = 'indigo' }) => {
        const colorMap = {
            indigo: { fill: '#6366f1', light: '#e0e7ff', border: '#4338ca' },
            rose: { fill: '#f43f5e', light: '#ffe4e6', border: '#be123c' },
        };
        const c = colorMap[color] || colorMap.indigo;
        const safeD = Math.max(d, 1);
        const pct = Math.min(n / safeD, 1);

        return (
            <div className="w-full">
                <div className="flex rounded-xl overflow-hidden border-2 h-14" style={{ borderColor: c.border }}>
                    {Array.from({ length: safeD }).map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 flex items-center justify-center text-xs font-bold transition-all"
                            style={{
                                background: i < n ? c.fill : c.light,
                                color: i < n ? 'white' : c.border,
                                borderRight: i < safeD - 1 ? `1px solid ${c.border}` : 'none'
                            }}
                        >
                            {safeD <= 12 && <span>{i + 1}</span>}
                        </div>
                    ))}
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>{n} part{n !== 1 ? 's' : ''} shaded</span>
                    <span>{safeD} parts total</span>
                </div>
            </div>
        );
    };

    const CircleModel = ({ n, d, color = 'indigo' }) => {
        const colorMap = {
            indigo: '#6366f1',
            rose: '#f43f5e',
        };
        const fill = colorMap[color] || colorMap.indigo;
        const safeD = Math.max(d, 1);
        const size = 160;
        const cx = size / 2, cy = size / 2, r = size / 2 - 8;

        const slices = Array.from({ length: safeD }).map((_, i) => {
            const startAngle = (i / safeD) * 2 * Math.PI - Math.PI / 2;
            const endAngle = ((i + 1) / safeD) * 2 * Math.PI - Math.PI / 2;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const largeArc = safeD === 1 ? 1 : 0;
            const path = safeD === 1
                ? `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 1 ${2 * r} 0 a ${r} ${r} 0 1 1 -${2 * r} 0`
                : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            return { path, shaded: i < n };
        });

        return (
            <div className="flex justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={cx} cy={cy} r={r} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                    {slices.map((slice, i) => (
                        <path
                            key={i}
                            d={slice.path}
                            fill={slice.shaded ? fill : '#f1f5f9'}
                            stroke="white"
                            strokeWidth="2"
                        />
                    ))}
                    <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                </svg>
            </div>
        );
    };

    const GridModel = ({ n, d, color = 'indigo' }) => {
        const colorMap = { indigo: '#6366f1', rose: '#f43f5e' };
        const fill = colorMap[color] || colorMap.indigo;
        const safeD = Math.max(d, 1);
        const cols = Math.ceil(Math.sqrt(safeD));
        const rows = Math.ceil(safeD / cols);

        return (
            <div
                className="inline-grid gap-1"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
                {Array.from({ length: safeD }).map((_, i) => (
                    <div
                        key={i}
                        className="w-10 h-10 rounded-lg border-2 transition-all"
                        style={{
                            background: i < n ? fill : '#f1f5f9',
                            borderColor: i < n ? fill : '#cbd5e1'
                        }}
                    />
                ))}
            </div>
        );
    };

    const NumberLine = ({ n, d }) => {
        const safeD = Math.max(d, 1);
        const pct = (n / safeD) * 100;
        const ticks = Array.from({ length: safeD + 1 }, (_, i) => i / safeD * 100);

        return (
            <div className="px-4 py-6">
                <div className="relative h-8">
                    {/* line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-300 rounded -translate-y-1/2" />
                    {/* ticks */}
                    {ticks.map((t, i) => (
                        <div key={i} className="absolute -translate-x-1/2" style={{ left: `${t}%`, top: 0 }}>
                            <div className="w-0.5 h-8 bg-slate-400 mx-auto" />
                            <div className="text-xs text-slate-500 text-center mt-1 whitespace-nowrap">
                                {i}/{safeD}
                            </div>
                        </div>
                    ))}
                    {/* marker */}
                    <div
                        className="absolute -translate-x-1/2 -top-1 transition-all"
                        style={{ left: `${pct}%` }}
                    >
                        <div className="w-5 h-5 bg-indigo-500 rounded-full border-2 border-white shadow-md" />
                        <div className="text-xs font-bold text-indigo-700 text-center mt-1 whitespace-nowrap">
                            {n}/{safeD}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderVisual = (n, d, color = 'indigo') => {
        if (viewMode === 'bar') return <BarModel n={n} d={d} color={color} />;
        if (viewMode === 'circle') return <CircleModel n={n} d={d} color={color} />;
        if (viewMode === 'grid') return <GridModel n={n} d={d} color={color} />;
        if (viewMode === 'numberline') return <NumberLine n={n} d={d} />;
        return null;
    };

    const FractionInput = ({ label, n, d, onN, onD, color = 'indigo' }) => {
        const colorClasses = {
            indigo: 'from-indigo-500 to-purple-600',
            rose: 'from-rose-500 to-pink-600'
        };
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{label}</p>
                <div className="flex items-center gap-4 justify-center">
                    <div className="flex flex-col items-center gap-1">
                        <input
                            type="number" min="0" max={d}
                            value={n}
                            onChange={e => {
                                const v = Math.max(0, Math.min(d, parseInt(e.target.value) || 0));
                                onN(v);
                            }}
                            className="w-16 h-16 text-3xl font-bold text-center border-2 border-indigo-300 rounded-xl focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-xs text-slate-400">numerator</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-1 bg-slate-700 rounded" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <input
                            type="number" min="1" max="20"
                            value={d}
                            onChange={e => {
                                const v = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
                                onD(v);
                                if (n > v) onN(v);
                            }}
                            className="w-16 h-16 text-3xl font-bold text-center border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                        <span className="text-xs text-slate-400">denominator</span>
                    </div>
                </div>
                <div className={`mt-3 text-center text-2xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
                    {n}/{d}
                </div>
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl">½</span>
                        <div>
                            <h2 className="text-3xl font-bold">Fraction Visualiser</h2>
                            <p className="text-lg opacity-90">See fractions come to life with interactive models</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => { setCompareMode(false); setQuizMode(false); }}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${!compareMode && !quizMode ? 'bg-white text-indigo-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            🔍 Explore
                        </button>
                        <button
                            onClick={() => { setCompareMode(true); setQuizMode(false); }}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${compareMode && !quizMode ? 'bg-white text-indigo-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            ⚖️ Compare
                        </button>
                        <button
                            onClick={startQuiz}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${quizMode ? 'bg-white text-indigo-700 shadow' : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            🎯 Quiz
                        </button>
                    </div>
                </div>
            </div>

            {/* View mode toggle */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-slate-600">Visual Model:</span>
                {[
                    { id: 'bar', label: '📊 Bar', },
                    { id: 'circle', label: '🥧 Circle' },
                    { id: 'grid', label: '🔲 Grid' },
                    { id: 'numberline', label: '📏 Number Line' },
                ].map(vm => (
                    <button
                        key={vm.id}
                        onClick={() => setViewMode(vm.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${viewMode === vm.id ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {vm.label}
                    </button>
                ))}
                <div className="ml-auto flex gap-3 flex-wrap">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                        <input type="checkbox" checked={showDecimal} onChange={e => setShowDecimal(e.target.checked)} className="rounded" />
                        Decimal
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                        <input type="checkbox" checked={showPercentage} onChange={e => setShowPercentage(e.target.checked)} className="rounded" />
                        Percentage
                    </label>
                    {!compareMode && !quizMode && (
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                            <input type="checkbox" checked={showEquivalents} onChange={e => setShowEquivalents(e.target.checked)} className="rounded" />
                            Equivalents
                        </label>
                    )}
                </div>
            </div>

            {/* ── QUIZ MODE ── */}
            {quizMode && quizQuestion && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-amber-800">🎯 Fraction Quiz</h3>
                                <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                                    {quizScore}/{quizTotal}
                                </span>
                            </div>
                            <p className="text-slate-700 font-semibold text-lg mb-4">{quizQuestion.text}</p>

                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={quizAnswer}
                                    onChange={e => setQuizAnswer(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !quizFeedback && submitAnswer()}
                                    placeholder="Your answer…"
                                    disabled={!!quizFeedback}
                                    className="flex-1 px-4 py-3 border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 text-lg font-mono"
                                />
                                {!quizFeedback ? (
                                    <button
                                        onClick={submitAnswer}
                                        className="px-5 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                                    >
                                        Check
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextQuestion}
                                        className="px-5 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                                    >
                                        Next →
                                    </button>
                                )}
                            </div>

                            {quizFeedback && (
                                <div className={`mt-4 p-4 rounded-xl ${quizFeedback.correct ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                                    <div className={`font-bold text-lg ${quizFeedback.correct ? 'text-green-700' : 'text-red-700'}`}>
                                        {quizFeedback.correct ? '✅ Correct! Well done!' : `❌ Not quite — the answer is ${quizFeedback.answer}`}
                                    </div>
                                    <p className="text-sm mt-1 text-slate-600">💡 {quizQuestion.hint}</p>
                                </div>
                            )}

                            <button
                                onClick={() => setQuizMode(false)}
                                className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline"
                            >
                                Exit quiz
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-base font-bold text-slate-700 mb-4">Visual: {quizQuestion.displayN}/{quizQuestion.displayD}</h3>
                        {renderVisual(quizQuestion.displayN, quizQuestion.displayD, 'indigo')}
                        {(showDecimal || showPercentage) && (
                            <div className="mt-4 flex gap-3 flex-wrap">
                                {showDecimal && (
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-mono font-bold text-sm">
                                        = {(quizQuestion.displayN / quizQuestion.displayD).toFixed(4)}
                                    </span>
                                )}
                                {showPercentage && (
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">
                                        = {(quizQuestion.displayN / quizQuestion.displayD * 100).toFixed(1)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── COMPARE MODE ── */}
            {compareMode && !quizMode && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        {/* Fraction A */}
                        <div className="space-y-4">
                            <FractionInput
                                label="Fraction A"
                                n={numerator} d={denominator}
                                onN={setNumerator} onD={setDenominator}
                                color="indigo"
                            />
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                                {renderVisual(numerator, denominator, 'indigo')}
                                {(showDecimal || showPercentage) && (
                                    <div className="mt-3 flex gap-2 flex-wrap justify-center">
                                        {showDecimal && <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-mono font-bold text-sm">= {decimalVal.toFixed(4)}</span>}
                                        {showPercentage && <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-sm">= {percentVal}%</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comparison symbol */}
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <div className="text-7xl font-black text-slate-300">{compareResult || '?'}</div>
                            <div className={`px-6 py-3 rounded-2xl text-xl font-bold ${compareResult === '>' ? 'bg-indigo-100 text-indigo-700' : compareResult === '<' ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'}`}>
                                {compareResult === '>' ? `${numerator}/${denominator} is greater` : compareResult === '<' ? `${numerator}/${denominator} is smaller` : 'They are equal!'}
                            </div>
                            <div className="text-sm text-slate-500 text-center">
                                {numerator}/{denominator} = {decimalVal.toFixed(3)}<br />
                                {numB}/{denB} = {(numB / denB).toFixed(3)}
                            </div>
                        </div>

                        {/* Fraction B */}
                        <div className="space-y-4">
                            <FractionInput
                                label="Fraction B"
                                n={numB} d={denB}
                                onN={setNumB} onD={setDenB}
                                color="rose"
                            />
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                                {renderVisual(numB, denB, 'rose')}
                                {(showDecimal || showPercentage) && (
                                    <div className="mt-3 flex gap-2 flex-wrap justify-center">
                                        {showDecimal && <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-mono font-bold text-sm">= {(numB / denB).toFixed(4)}</span>}
                                        {showPercentage && <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-bold text-sm">= {(numB / denB * 100).toFixed(1)}%</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── EXPLORE MODE ── */}
            {!compareMode && !quizMode && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: inputs + visual */}
                    <div className="lg:col-span-2 space-y-4">
                        <FractionInput
                            label="Your Fraction"
                            n={numerator} d={denominator}
                            onN={setNumerator} onD={setDenominator}
                            color="indigo"
                        />

                        {/* Sliders */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                            <div>
                                <label className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                                    <span>Numerator</span>
                                    <span className="text-indigo-600">{numerator}</span>
                                </label>
                                <input
                                    type="range" min="0" max={denominator} value={numerator}
                                    onChange={e => setNumerator(parseInt(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="flex justify-between text-sm font-semibold text-slate-600 mb-1">
                                    <span>Denominator</span>
                                    <span className="text-purple-600">{denominator}</span>
                                </label>
                                <input
                                    type="range" min="1" max="20" value={denominator}
                                    onChange={e => {
                                        const v = parseInt(e.target.value);
                                        setDenominator(v);
                                        if (numerator > v) setNumerator(v);
                                    }}
                                    className="w-full accent-purple-500"
                                />
                            </div>
                        </div>

                        {/* Visual */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h3 className="text-base font-bold text-slate-600 mb-4">
                                {viewMode === 'bar' ? '📊 Bar Model' : viewMode === 'circle' ? '🥧 Circle Model' : viewMode === 'grid' ? '🔲 Array Model' : '📏 Number Line'}
                            </h3>
                            {renderVisual(numerator, denominator, 'indigo')}

                            {/* Stats row */}
                            <div className="mt-4 flex flex-wrap gap-3 justify-center">
                                <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-center">
                                    <div className="text-xs text-indigo-500 font-semibold">Fraction</div>
                                    <div className="text-xl font-bold text-indigo-700">{numerator}/{denominator}</div>
                                </div>
                                {simplified.n !== numerator || simplified.d !== denominator ? (
                                    <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
                                        <div className="text-xs text-purple-500 font-semibold">Simplified</div>
                                        <div className="text-xl font-bold text-purple-700">{simplified.n}/{simplified.d}</div>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-center">
                                        <div className="text-xs text-green-500 font-semibold">Already simplified!</div>
                                        <div className="text-xl font-bold text-green-700">✓</div>
                                    </div>
                                )}
                                {showDecimal && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center">
                                        <div className="text-xs text-blue-500 font-semibold">Decimal</div>
                                        <div className="text-xl font-bold font-mono text-blue-700">{decimalVal.toFixed(3)}</div>
                                    </div>
                                )}
                                {showPercentage && (
                                    <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-2 text-center">
                                        <div className="text-xs text-pink-500 font-semibold">Percentage</div>
                                        <div className="text-xl font-bold text-pink-700">{percentVal}%</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: equivalents + common fractions */}
                    <div className="space-y-4">
                        {/* Common fractions quick-set */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                            <h3 className="text-sm font-bold text-slate-600 mb-3">⚡ Common Fractions</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    [1,2],[1,3],[2,3],[1,4],[3,4],[1,5],
                                    [2,5],[3,5],[1,8],[3,8],[1,10],[7,10]
                                ].map(([n,d]) => (
                                    <button
                                        key={`${n}/${d}`}
                                        onClick={() => { setNumerator(n); setDenominator(d); }}
                                        className={`py-2 rounded-xl text-sm font-bold border-2 transition-all ${numerator === n && denominator === d ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                                    >
                                        {n}/{d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Equivalent fractions */}
                        {showEquivalents && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                                <h3 className="text-sm font-bold text-slate-600 mb-3">🔄 Equivalent Fractions</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {equivalent.slice(0, 8).map((eq, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <button
                                                onClick={() => { setNumerator(eq.n); setDenominator(eq.d); }}
                                                className="flex-1 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl px-3 py-2 transition-all"
                                            >
                                                <span className="font-bold text-indigo-700">{eq.n}/{eq.d}</span>
                                                <span className="text-xs text-slate-400">×{i + 1}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Teaching tips */}
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
                            <h3 className="text-sm font-bold text-amber-800 mb-2">💡 Teaching Tips</h3>
                            <ul className="text-xs text-amber-700 space-y-1.5">
                                <li>• <strong>Numerator</strong> = parts we have (top)</li>
                                <li>• <strong>Denominator</strong> = total equal parts (bottom)</li>
                                <li>• <strong>Proper fraction:</strong> numerator &lt; denominator</li>
                                <li>• <strong>Equivalent fractions</strong> have the same value</li>
                                <li>• <strong>Simplify</strong> by dividing by the GCF</li>
                                <li>• Try all 4 visual models with the same fraction!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FractionVisualiser;
