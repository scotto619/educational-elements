// components/TutorialGuide.js — Multi-step website tour
// Auto-opens on a user's first login (tracked via Firestore `hasSeenTutorial`),
// and can be re-opened any time from the "Website Guide" button on the main menu.

import { useState, useEffect, useCallback } from 'react';

const STEPS = [
    {
        emoji: '👋',
        title: 'Welcome to Educational Elements!',
        gradient: 'linear-gradient(90deg, #9333ea, #ec4899)',
        intro: 'Your all-in-one teaching companion. Here’s a quick tour of where everything lives — it only takes a minute!',
        items: [
            { icon: '🏆', title: 'Classroom Champions', desc: 'A gamified classroom system — XP, avatars, quests, a class shop and more.' },
            { icon: '📚', title: 'Resource Hub', desc: 'Interactive lessons, printable worksheets, and classroom displays for every subject.' },
            { icon: '🛠️', title: 'Teacher Toolkit', desc: 'Everyday classroom tools — timers, name pickers, group makers and more.' },
        ],
        tip: 'You can reopen this guide any time using the “Website Guide” button on the main menu.',
    },
    {
        emoji: '🏆',
        title: 'Classroom Champions',
        gradient: 'linear-gradient(90deg, #f59e0b, #f97316)',
        intro: 'Click the Classroom Champions card, then select (or create) a class to enter. Inside you’ll find tabs along the top:',
        items: [
            { icon: '🏠', title: 'Dashboard', desc: 'Your class overview — award XP and coins to students in a click.' },
            { icon: '👥', title: 'Students', desc: 'Manage your class roster, avatars, levels and pets.' },
            { icon: '📜', title: 'Quests & Shop', desc: 'Set challenges for students, and let them spend coins on rewards.' },
            { icon: '🎪', title: 'Quiz Show & Pet Race', desc: 'Whole-class games that make review sessions exciting.' },
        ],
        tip: 'First time? Head to Classroom Champions and create your class — everything else builds from there.',
    },
    {
        emoji: '📚',
        title: 'Resource Hub',
        gradient: 'linear-gradient(90deg, #3b82f6, #6366f1)',
        intro: 'Click the Resource Hub card — no class needed. Resources are organised by subject: English, Mathematics, Science, Behaviour & Wellbeing, HASS and Classroom Decor.',
        items: [
            { icon: '🧠', title: 'Interactive tools', desc: 'Reading comprehension, grammar workshop, math mentals, times tables, fraction visualiser, solar system explorer and many more.' },
            { icon: '📁', title: 'Bundles', desc: 'Downloadable PDFs, worksheets and PowerPoints — find them inside each subject.' },
            { icon: '🖼️', title: 'Displays', desc: 'Printable posters and wall displays for your classroom, organised by subject.' },
        ],
        tip: 'Use the search bar at the top of the Resource Hub to jump straight to any resource.',
    },
    {
        emoji: '🛠️',
        title: 'Teacher Toolkit',
        gradient: 'linear-gradient(90deg, #10b981, #14b8a6)',
        intro: 'Click the Teacher Toolkit card and select your class. It’s packed with quick tools for the day-to-day:',
        items: [
            { icon: '⏱️', title: 'Timers & noise meter', desc: 'Countdown timers, a clock, and a noise level monitor.' },
            { icon: '🎲', title: 'Pickers & groups', desc: 'Random name picker, group maker, dice roller and spinner wheel.' },
            { icon: '🧘', title: 'Brain breaks', desc: 'Movement, breathing, mindfulness and dance activities for quick resets.' },
            { icon: '🌅', title: 'Morning meeting', desc: 'A full morning meeting presenter — plus class jobs, help queue, checklists and a reward jar.' },
        ],
        tip: 'Tools open full-screen so they’re easy to project for the whole class.',
    },
    {
        emoji: '🧭',
        title: 'Finding your way around',
        gradient: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
        intro: 'A few handy navigation tips:',
        items: [
            { icon: '🏡', title: 'Back to the main menu', desc: 'Click the Educational Elements logo (top-left) on any page to return here.' },
            { icon: '⚡', title: 'Quick access row', desc: 'The shortcuts at the bottom of the main menu jump straight to the Shop, Quests, Games and Students.' },
            { icon: '📖', title: 'This guide', desc: 'Reopen it any time with the “Website Guide” button in the top bar.' },
        ],
        tip: 'Students join with their own login — manage their passwords from the Students tab in Classroom Champions.',
    },
    {
        emoji: '🌱',
        title: 'We’re always growing!',
        gradient: 'linear-gradient(90deg, #10b981, #3b82f6)',
        intro: 'Educational Elements is constantly evolving — new resources, tools and features are added regularly, so keep checking back!',
        items: [
            { icon: '📦', title: 'New content, often', desc: 'Look for the NEW and UPDATED badges around the site.' },
            { icon: '💌', title: 'We’d love your feedback', desc: 'Found something not working, or want to request a resource? Reach out any time at admin@educational-elements.com.' },
        ],
        tip: 'That’s it — you’re ready to go. Have fun!',
        isLast: true,
    },
];

export default function TutorialGuide({ onClose }) {
    const [step, setStep] = useState(0);
    const current = STEPS[step];
    const isFirst = step === 0;
    const isLast = step === STEPS.length - 1;

    const handleKey = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight' && step < STEPS.length - 1) setStep(s => s + 1);
        if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1);
    }, [step, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleKey]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl bg-white flex flex-col"
                style={{ animation: 'tutorialEntrance 0.45s cubic-bezier(0.34,1.56,0.64,1) both', maxHeight: '90vh' }}
            >
                {/* Gradient header bar */}
                <div style={{ background: current.gradient, height: '10px' }} />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-lg font-bold z-10"
                    aria-label="Close guide"
                >
                    ×
                </button>

                {/* Scrollable body */}
                <div className="px-7 pt-7 pb-4 overflow-y-auto">
                    {/* Step counter */}
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        Step {step + 1} of {STEPS.length}
                    </p>

                    {/* Heading */}
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{current.emoji}</span>
                        <h2
                            className="text-2xl font-black leading-tight"
                            style={{ background: current.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        >
                            {current.title}
                        </h2>
                    </div>

                    {/* Intro */}
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">{current.intro}</p>

                    {/* Feature items */}
                    <div className="space-y-2.5 mb-4">
                        {current.items.map((item) => (
                            <div key={item.title} className="flex items-start gap-3 rounded-2xl px-4 py-3 bg-gray-50 border border-gray-100">
                                <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                                    <p className="text-gray-500 text-sm leading-snug">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tip box */}
                    {current.tip && (
                        <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)', border: '1.5px solid #f0abfc' }}>
                            <span className="font-bold text-purple-700">💡 Tip:</span>{' '}
                            <span className="text-purple-800">{current.tip}</span>
                        </div>
                    )}
                </div>

                {/* Footer: dots + nav buttons */}
                <div className="px-7 py-5 border-t border-gray-100 bg-white">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-4">
                        {STEPS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setStep(i)}
                                aria-label={`Go to step ${i + 1}`}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: i === step ? '24px' : '8px',
                                    height: '8px',
                                    background: i === step ? '#9333ea' : i < step ? '#d8b4fe' : '#e5e7eb',
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {!isFirst && (
                            <button
                                onClick={() => setStep(s => s - 1)}
                                className="px-5 py-3 rounded-2xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                            >
                                ← Back
                            </button>
                        )}
                        {!isLast && (
                            <button
                                onClick={onClose}
                                className="px-4 py-3 rounded-2xl font-semibold text-sm text-gray-400 hover:text-gray-600 transition-all"
                            >
                                Skip
                            </button>
                        )}
                        <button
                            onClick={() => (isLast ? onClose() : setStep(s => s + 1))}
                            className="flex-1 py-3 rounded-2xl font-black text-white text-sm tracking-wide shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                            style={{ background: current.gradient }}
                        >
                            {isLast ? "Let's Go! 🚀" : 'Next →'}
                        </button>
                    </div>
                </div>

                {/* Bottom gradient bar */}
                <div style={{ background: current.gradient, height: '10px' }} />
            </div>

            <style>{`
                @keyframes tutorialEntrance {
                    0%   { opacity: 0; transform: scale(0.7) translateY(30px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
