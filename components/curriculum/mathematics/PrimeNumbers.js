// components/curriculum/mathematics/PrimeNumbers.js
// Interactive Prime Numbers slide deck for Grade 6 classrooms
import React, { useState, useEffect, useCallback } from 'react';

// ─── Slide data ───────────────────────────────────────────────────────────────

const ACCENT = '#8B5CF6';
const ACCENT_LIGHT = '#a78bfa';
const ACCENT_DIM = 'rgba(139,92,246,0.12)';
const CARD_BG = '#1a1a1a';
const BORDER = '#2a2a2a';

// Inline-style helpers (slides use a dark theme that doesn't map to Tailwind tokens)
const s = {
    slide: {
        background: 'linear-gradient(135deg, #0d0d0d 0%, #111827 100%)',
        color: '#fff',
        borderRadius: 20,
        padding: '48px 56px',
        minHeight: 440,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
    },
    label: {
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: ACCENT,
        marginBottom: 12,
    },
    h1: { fontSize: 60, fontWeight: 900, lineHeight: 1.05, margin: 0 },
    h2: { fontSize: 40, fontWeight: 800, lineHeight: 1.1, margin: '0 0 4px 0' },
    accent: { color: ACCENT },
    subtitle: { fontSize: 20, color: '#a0a0a0', marginTop: 12, lineHeight: 1.5 },
    accentBar: { width: 56, height: 5, background: ACCENT, borderRadius: 3, margin: '20px 0' },
    card: {
        background: CARD_BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 14,
        padding: '22px 20px',
        textAlign: 'center',
    },
    cardIcon: { fontSize: 36, marginBottom: 10 },
    cardTitle: { fontSize: 17, fontWeight: 700, margin: '0 0 6px 0' },
    cardDesc: { fontSize: 14, color: '#a0a0a0', lineHeight: 1.5, margin: 0 },
    defBox: {
        background: ACCENT_DIM,
        border: `1px solid ${ACCENT}`,
        borderRadius: 18,
        padding: '28px 32px',
        marginTop: 28,
        textAlign: 'center',
    },
    defText: { fontSize: 24, fontWeight: 600, lineHeight: 1.5, color: '#fff' },
    funBand: {
        background: ACCENT_DIM,
        border: `1px solid ${ACCENT}`,
        borderRadius: 12,
        padding: '14px 22px',
        marginTop: 22,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 16,
        color: ACCENT_LIGHT,
    },
    stepRow: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 0,
        marginTop: 36,
        flexWrap: 'wrap',
    },
    step: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1,
        minWidth: 120,
        maxWidth: 180,
    },
    stepNum: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: ACCENT,
        color: '#fff',
        fontSize: 18,
        fontWeight: 800,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        flexShrink: 0,
    },
    stepArrow: {
        fontSize: 22,
        color: ACCENT_LIGHT,
        alignSelf: 'center',
        paddingBottom: 36,
        flexShrink: 0,
        margin: '0 2px',
    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Label = ({ children }) => <div style={s.label}>{children}</div>;

const FunBand = ({ icon, children }) => (
    <div style={s.funBand}>
        <span style={{ fontSize: 26 }}>{icon}</span>
        <span>{children}</span>
    </div>
);

const BigNum = ({ n, isPrime }) => (
    <div style={{
        width: 68, height: 68, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, fontWeight: 800,
        background: isPrime ? ACCENT_DIM : CARD_BG,
        border: `2px solid ${isPrime ? ACCENT : BORDER}`,
        color: isPrime ? ACCENT_LIGHT : '#a0a0a0',
    }}>{n}</div>
);

const NumCell = ({ n, state }) => {
    // state: 'prime' | 'one' | 'crossed' | 'normal'
    const styles = {
        prime: { background: ACCENT_DIM, border: `1px solid ${ACCENT}`, color: ACCENT },
        one:   { background: '#2a2a1a', border: '1px solid #55550a', color: '#b0b000' },
        crossed: { opacity: 0.28, textDecoration: 'line-through', background: CARD_BG, border: `1px solid ${BORDER}`, color: '#a0a0a0' },
        normal: { background: CARD_BG, border: `1px solid ${BORDER}`, color: '#a0a0a0' },
    };
    return (
        <div style={{
            aspectRatio: '1',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            ...styles[state],
        }}>{n}</div>
    );
};

// Sieve data for 1-50
const buildSieve = () => {
    const cells = [];
    const primes = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47]);
    for (let i = 1; i <= 50; i++) {
        let state = 'normal';
        if (i === 1) state = 'one';
        else if (primes.has(i)) state = 'prime';
        else state = 'crossed';
        cells.push({ n: i, state });
    }
    return cells;
};
const sieveCells = buildSieve();

// ─── Individual Slides ────────────────────────────────────────────────────────

const slides = [
    // 1 — Title
    ({ }) => (
        <div style={s.slide}>
            <Label>Grade 6 Math</Label>
            <h1 style={s.h1}>Prime<br /><span style={s.accent}>Numbers</span></h1>
            <div style={s.accentBar} />
            <p style={s.subtitle}>The building blocks of all numbers —<br />and some of the coolest in maths! 🔢</p>
        </div>
    ),

    // 2 — Why it matters
    ({ }) => (
        <div style={s.slide}>
            <Label>Why It Matters</Label>
            <h2 style={s.h2}>Numbers have <span style={s.accent}>secrets.</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 28 }}>
                {[
                    { icon: '🧩', title: 'Building Blocks', desc: 'Every number is either prime or made from primes.' },
                    { icon: '🔐', title: 'Internet Security', desc: 'Your passwords & banking use prime numbers to stay safe.' },
                    { icon: '♾️', title: 'Never Ending', desc: 'There are infinitely many primes — they never stop!' },
                ].map(c => (
                    <div key={c.title} style={s.card}>
                        <div style={s.cardIcon}>{c.icon}</div>
                        <p style={s.cardTitle}>{c.title}</p>
                        <p style={s.cardDesc}>{c.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    ),

    // 3 — Definition
    ({ }) => (
        <div style={s.slide}>
            <Label>The Big Idea</Label>
            <h2 style={s.h2}>What is a <span style={s.accent}>prime</span> number?</h2>
            <div style={s.defBox}>
                <p style={s.defText}>
                    A prime number is a whole number{' '}
                    <span style={{ color: ACCENT_LIGHT }}>greater than 1</span> that can only be divided evenly by{' '}
                    <span style={{ color: ACCENT_LIGHT }}>1</span> and{' '}
                    <span style={{ color: ACCENT_LIGHT }}>itself</span>.
                </p>
            </div>
            <FunBand icon="💡">
                Example: <strong>7</strong> is prime because only 1×7 = 7. Nothing else divides it evenly.
            </FunBand>
        </div>
    ),

    // 4 — Divisibility comparison
    ({ }) => (
        <div style={s.slide}>
            <Label>Key Concept</Label>
            <h2 style={s.h2}>Factors &amp; <span style={s.accent}>Divisibility</span></h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginTop: 24 }}>
                <div style={{ ...s.card, textAlign: 'left' }}>
                    <p style={{ ...s.cardTitle, color: '#6ee7b7' }}>🟢 7 is Prime</p>
                    <p style={{ fontSize: 14, color: '#a0a0a0', lineHeight: 1.7, marginTop: 8 }}>
                        ÷ 1 → <strong>7</strong> ✅<br />
                        ÷ 7 → <strong>1</strong> ✅<br />
                        ÷ 2 → <strong>3.5</strong> ❌<br />
                        ÷ 3 → <strong>2.33…</strong> ❌
                    </p>
                    <p style={{ marginTop: 10, color: ACCENT, fontWeight: 700, fontSize: 14 }}>Only 2 factors!</p>
                </div>
                <div style={{
                    background: ACCENT_DIM, border: `1px solid ${ACCENT}`, color: ACCENT,
                    fontWeight: 800, fontSize: 16, width: 44, height: 44, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>VS</div>
                <div style={{ ...s.card, textAlign: 'left' }}>
                    <p style={{ ...s.cardTitle, color: '#fca5a5' }}>🔴 12 is NOT Prime</p>
                    <p style={{ fontSize: 14, color: '#a0a0a0', lineHeight: 1.7, marginTop: 8 }}>
                        ÷ 1 → <strong>12</strong> ✅<br />
                        ÷ 2 → <strong>6</strong> ✅<br />
                        ÷ 3 → <strong>4</strong> ✅<br />
                        ÷ 4 → <strong>3</strong> ✅
                    </p>
                    <p style={{ marginTop: 10, color: '#f43f5e', fontWeight: 700, fontSize: 14 }}>More than 2 factors!</p>
                </div>
            </div>
        </div>
    ),

    // 5 — Is 1 prime?
    ({ }) => (
        <div style={s.slide}>
            <Label>Common Mistake</Label>
            <h2 style={s.h2}>Is <span style={s.accent}>1</span> a prime number?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
                <div style={{ ...s.card, border: '1px solid #a0a000', background: '#2a2a1a' }}>
                    <div style={s.cardIcon}>🤔</div>
                    <p style={{ ...s.cardTitle, color: '#d0d000' }}>Seems Like Yes…</p>
                    <p style={s.cardDesc}>1 ÷ 1 = 1. Only divides by itself… right?</p>
                </div>
                <div style={{ ...s.card, border: `1px solid ${ACCENT}`, background: ACCENT_DIM }}>
                    <div style={s.cardIcon}>🚫</div>
                    <p style={{ ...s.cardTitle, color: ACCENT_LIGHT }}>Actually: NO!</p>
                    <p style={s.cardDesc}>A prime needs <em>exactly two different factors</em>. The number 1 only has <em>one</em> factor — itself!</p>
                </div>
            </div>
            <FunBand icon="📌">
                Rule: Prime numbers must be <strong>greater than 1</strong>. So 1 is neither prime nor composite.
            </FunBand>
        </div>
    ),

    // 6 — First 10 primes
    ({ }) => (
        <div style={s.slide}>
            <Label>Meet the Primes</Label>
            <h2 style={s.h2}>The first <span style={s.accent}>10 prime</span> numbers</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28, justifyContent: 'center' }}>
                {[2, 3, 5, 7, 11, 13, 17, 19, 23, 29].map(n => (
                    <BigNum key={n} n={n} isPrime={true} />
                ))}
            </div>
            <FunBand icon="⭐">
                <strong>2</strong> is the only even prime! Every other even number can be divided by 2.
            </FunBand>
        </div>
    ),

    // 7 — How to check
    ({ }) => (
        <div style={s.slide}>
            <Label>Your Toolkit</Label>
            <h2 style={s.h2}>How to <span style={s.accent}>check</span> a prime</h2>
            <div style={s.stepRow}>
                {[
                    { n: 1, title: 'Is it > 1?', desc: 'If no, it\'s NOT prime. Stop here.' },
                    { n: 2, title: 'Try dividing', desc: 'Try 2, 3, 4… up to the number.' },
                    { n: 3, title: 'Whole result?', desc: 'If anything divides evenly, NOT prime.' },
                    { n: 4, title: 'Nothing worked?', desc: 'It IS prime! 🎉' },
                ].reduce((acc, step, i, arr) => {
                    acc.push(
                        <div key={step.n} style={s.step}>
                            <div style={s.stepNum}>{step.n}</div>
                            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px 0' }}>{step.title}</p>
                            <p style={{ fontSize: 13, color: '#a0a0a0', lineHeight: 1.4, margin: 0 }}>{step.desc}</p>
                        </div>
                    );
                    if (i < arr.length - 1) acc.push(<div key={`arrow-${i}`} style={s.stepArrow}>→</div>);
                    return acc;
                }, [])}
            </div>
        </div>
    ),

    // 8 — Sieve of Eratosthenes
    ({ }) => (
        <div style={s.slide}>
            <Label>Ancient Greek Trick — 240 BC</Label>
            <h2 style={{ ...s.h2, marginBottom: 4 }}>The <span style={s.accent}>Sieve</span> of Eratosthenes</h2>
            <p style={{ fontSize: 15, color: '#a0a0a0', margin: '0 0 16px 0' }}>
                Cross out 1, then cross out multiples of 2, 3, 5, 7… What's left is{' '}
                <span style={{ color: ACCENT_LIGHT }}>prime</span>!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
                {sieveCells.map(c => <NumCell key={c.n} n={c.n} state={c.state} />)}
            </div>
        </div>
    ),

    // 9 — Real life
    ({ }) => (
        <div style={s.slide}>
            <Label>Real World</Label>
            <h2 style={s.h2}>Primes are <span style={s.accent}>everywhere!</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
                {[
                    { icon: '🔐', title: 'Encryption & Online Shopping', desc: 'When you buy something online, massive prime numbers (hundreds of digits!) scramble your card info to keep it safe.' },
                    { icon: '🦗', title: 'Cicadas & Nature', desc: 'Cicadas emerge every 13 or 17 years — both prime — so predators can never sync their cycles to feast on them.' },
                    { icon: '🎵', title: 'Music & Rhythms', desc: 'Musicians use prime-based rhythms to create patterns that feel surprising and interesting to the ear.' },
                ].map(r => (
                    <div key={r.title} style={{
                        ...s.card,
                        display: 'flex', alignItems: 'center', gap: 18, textAlign: 'left', padding: '16px 22px',
                    }}>
                        <span style={{ fontSize: 30, flexShrink: 0 }}>{r.icon}</span>
                        <div>
                            <p style={{ ...s.cardTitle, marginBottom: 4 }}>{r.title}</p>
                            <p style={{ ...s.cardDesc, fontSize: 13 }}>{r.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ),

    // 10 — Infinity fact
    ({ }) => (
        <div style={{ ...s.slide, alignItems: 'center', textAlign: 'center' }}>
            <Label>Mind-Blowing Fact</Label>
            <h2 style={s.h2}>How many primes <span style={s.accent}>exist?</span></h2>
            <div style={{ fontSize: 100, fontWeight: 900, color: ACCENT, lineHeight: 1, margin: '20px 0 8px' }}>∞</div>
            <p style={{ fontSize: 22, color: '#a0a0a0' }}>Infinitely many — they never end!</p>
            <FunBand icon="🧠">
                Euclid proved this over <strong>2,300 years ago</strong> — and no one has found the "last" prime since!
            </FunBand>
        </div>
    ),

    // 11 — Quick quiz
    ({ }) => (
        <div style={s.slide}>
            <Label>Quick Check</Label>
            <h2 style={s.h2}>Which are <span style={s.accent}>prime?</span></h2>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 28, justifyContent: 'center' }}>
                {[
                    { n: 2, isPrime: true }, { n: 4, isPrime: false },
                    { n: 11, isPrime: true }, { n: 15, isPrime: false },
                    { n: 17, isPrime: true }, { n: 21, isPrime: false },
                    { n: 29, isPrime: true }, { n: 36, isPrime: false },
                ].map(({ n, isPrime }) => <BigNum key={n} n={n} isPrime={isPrime} />)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT}`, color: ACCENT_LIGHT, borderRadius: 999, padding: '5px 14px', fontSize: 13, fontWeight: 600, margin: '0 6px' }}>🟣 Purple = Prime</span>
                <span style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: '#a0a0a0', borderRadius: 999, padding: '5px 14px', fontSize: 13, fontWeight: 600, margin: '0 6px' }}>⬛ Grey = Not Prime</span>
            </div>
            <FunBand icon="✅">
                Primes: <strong>2, 11, 17, 29</strong> — Can you explain why each one is prime?
            </FunBand>
        </div>
    ),

    // 12 — Takeaways
    ({ }) => (
        <div style={s.slide}>
            <Label>Remember This</Label>
            <h2 style={s.h2}>The <span style={s.accent}>Big 5</span> Takeaways</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
                {[
                    { icon: '1️⃣', title: 'Only 2 factors', desc: 'A prime has exactly 1 and itself as factors.' },
                    { icon: '2️⃣', title: 'Greater than 1', desc: '1 is NOT prime. Primes start at 2.' },
                    { icon: '3️⃣', title: '2 is special', desc: 'The only even prime number is 2.' },
                    { icon: '4️⃣', title: 'Infinite supply', desc: 'There are infinitely many primes — they never run out!' },
                ].map(c => (
                    <div key={c.title} style={{ ...s.card, textAlign: 'left', padding: '18px 20px' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
                        <p style={s.cardTitle}>{c.title}</p>
                        <p style={{ ...s.cardDesc, marginTop: 4 }}>{c.desc}</p>
                    </div>
                ))}
            </div>
            <FunBand icon="🚀">
                Primes are the <strong>atoms of arithmetic</strong> — every number is built from them!
            </FunBand>
        </div>
    ),
];

// ─── Main Component ───────────────────────────────────────────────────────────

const PrimeNumbers = ({ showToast = () => {} }) => {
    const [current, setCurrent] = useState(0);
    const total = slides.length;

    const goTo = useCallback((n) => {
        setCurrent(((n % total) + total) % total);
    }, [total]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goTo(current + 1);
            if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   goTo(current - 1);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [current, goTo]);

    const SlideComponent = slides[current];

    return (
        <div className="space-y-4">
            {/* Header info bar */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-5 py-3 flex items-center gap-3">
                <span className="text-2xl">🔢</span>
                <div>
                    <p className="font-semibold text-purple-900 text-sm">Prime Numbers — Classroom Slide Deck</p>
                    <p className="text-purple-600 text-xs">Use arrow keys ← → or the buttons below to navigate · Grade 6</p>
                </div>
            </div>

            {/* Slide */}
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.25)' }}>
                <SlideComponent />
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                {/* Prev */}
                <button
                    onClick={() => goTo(current - 1)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                    ← Prev
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            style={{
                                width: i === current ? 22 : 8,
                                height: 8,
                                borderRadius: 9999,
                                background: i === current ? ACCENT : '#d1d5db',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* Counter + Next */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 font-medium">{current + 1} / {total}</span>
                    <button
                        onClick={() => goTo(current + 1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-colors"
                        style={{ background: ACCENT }}
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* Slide title strip */}
            <div className="text-center">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                    {[
                        'Title', 'Why It Matters', 'Definition', 'Divisibility',
                        'Is 1 Prime?', 'First 10 Primes', 'How to Check',
                        'Sieve of Eratosthenes', 'Real Life', 'Infinity Fact',
                        'Quick Quiz', 'Takeaways',
                    ][current]}
                </span>
            </div>
        </div>
    );
};

export default PrimeNumbers;
