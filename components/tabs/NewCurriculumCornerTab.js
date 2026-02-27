import React, { useState, Suspense, lazy } from 'react';

// Lazy-load the new Science section
const ScienceNewSection = lazy(() => import('../curriculum/new/ScienceNewSection'));

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600">Loading Content...</p>
        </div>
    </div>
);

// Coming Soon placeholder
const ComingSoonSubject = ({ subject, onBack }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{subject.name} Exploration</h2>
            <button
                onClick={onBack}
                className="group flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium shadow-sm"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Hub
            </button>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-16 text-center border-2 border-dashed border-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/bg-patterns/circuit-board.svg')] opacity-5"></div>
            <div className="relative z-10 w-24 h-24 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-100">
                <span className="text-5xl">{subject.icon}</span>
            </div>
            <h3 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {subject.name} is Evolving!
            </h3>
            <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                Our curriculum engineers are currently building breathtaking new modules for {subject.name}. Check back soon for the grand reveal!
            </p>
        </div>
    </div>
);

// Main Subjects Configuration
const subjects = [
    {
        id: 'english',
        name: 'English',
        icon: '📚',
        gradient: 'from-blue-600 via-blue-500 to-indigo-600',
        description: 'Master the art of language and literature',
        pattern: 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]',
        available: false
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: '🔢',
        gradient: 'from-emerald-600 via-emerald-500 to-teal-600',
        description: 'Unlock the universe with numbers',
        pattern: 'bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))]',
        available: false
    },
    {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        gradient: 'from-violet-600 via-purple-500 to-fuchsia-600',
        description: 'Discover the forces that shape our world',
        pattern: 'bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]',
        available: true
    },
    {
        id: 'hass',
        name: 'HASS',
        icon: '🌍',
        gradient: 'from-amber-600 via-orange-500 to-red-600',
        description: 'Explore human societies and history',
        pattern: 'bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]',
        available: false
    }
];

const NewCurriculumCornerTab = ({
    students = [],
    showToast = () => { },
    saveData = () => { },
    loadedData = {}
}) => {
    const [activeSubject, setActiveSubject] = useState(null);

    const handleBackToMenu = () => {
        setActiveSubject(null);
    };

    // Render deeply nested module
    if (activeSubject) {
        if (activeSubject.id === 'science') {
            return (
                <Suspense fallback={<LoadingSpinner />}>
                    <ScienceNewSection
                        onBack={handleBackToMenu}
                        students={students}
                        showToast={showToast}
                    />
                </Suspense>
            );
        }

        // Fallback for unavailable subjects
        return <ComingSoonSubject subject={activeSubject} onBack={handleBackToMenu} />;
    }

    // Render Main Hub
    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-12 animate-in fade-in duration-700">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-16 md:px-16 md:py-24 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl mix-blend-screen"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl mix-blend-screen"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-sm font-semibold tracking-wide uppercase">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Version 2.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-100 to-purple-200 tracking-tight leading-tight">
                        The Curriculum <br className="hidden md:block" /> Hub
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100/80 max-w-2xl font-light leading-relaxed">
                        Welcome to the next generation of teaching. Select a portal to discover transformative interactive learning experiences.
                    </p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {subjects.map((subject, idx) => (
                    <button
                        key={subject.id}
                        onClick={() => setActiveSubject(subject)}
                        className="group relative h-72 rounded-3xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                        style={{ animationDelay: `${idx * 150}ms` }}
                    >
                        {/* Background Gradients */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}></div>
                        <div className={`absolute inset-0 ${subject.pattern} opacity-50`}></div>

                        {/* Glass Texture Overlay */}
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/20 to-transparent"></div>

                        {/* Content Container */}
                        <div className="relative h-full flex flex-col items-center justify-center p-8 text-center border-t border-white/20">

                            {/* Floating Icon */}
                            <div className="w-24 h-24 mb-6 relative transform transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                                <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/30"></div>
                                <div className="absolute inset-0 flex items-center justify-center text-5xl">
                                    {subject.icon}
                                </div>
                            </div>

                            {/* Text */}
                            <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
                                {subject.name}
                            </h2>
                            <p className="text-white/80 font-medium text-lg leading-snug">
                                {subject.description}
                            </p>

                            {/* Availability Badge */}
                            {!subject.available && (
                                <div className="absolute top-6 right-6">
                                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-white/90 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                                        Coming Soon
                                    </span>
                                </div>
                            )}

                            {/* Enter Arrow */}
                            <div className="absolute bottom-6 right-6 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>

                        </div>
                    </button >
                ))}
            </div >
        </div >
    );
};

export default NewCurriculumCornerTab;
