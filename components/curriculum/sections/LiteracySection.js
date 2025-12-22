// components/curriculum/sections/LiteracySection.js
// Lazy-loaded Literacy section for Curriculum Corner
import React, { useState } from 'react';

// Import literacy components
import BeginnerReaders from '../literacy/BeginnerReaders';
import ReadingForFun from '../literacy/ReadingForFun';
import ReadersTheatre from '../literacy/ReadersTheatre';
import Morphology from '../literacy/Morphology';
import LiteracyWarmup from '../literacy/LiteracyWarmup';
import PrepLiteracyWarmup from '../literacy/PrepLiteracyWarmUp';
import SpellingProgram from '../literacy/SpellingProgram';
import ReadingComprehension from '../literacy/ReadingComprehension';
import VisualWritingPrompts from '../literacy/VisualWritingPrompts';
import VocabularyCorner from '../literacy/VocabularyCorner';

// Coming Soon placeholder
const ComingSoon = ({ toolName }) => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-2xl font-bold text-amber-800 mb-2">{toolName || 'Feature'} Coming Soon!</h3>
        <p className="text-amber-600">We're working hard to bring you this tool. Check back soon!</p>
    </div>
);

const literacyFocusAreas = [
    { id: 'all', title: 'All Tools', icon: '🌈', gradient: 'from-pink-500 via-purple-500 to-indigo-500' },
    { id: 'reading', title: 'Reading', icon: '📖', gradient: 'from-blue-500 to-indigo-500' },
    { id: 'writing', title: 'Writing', icon: '✍️', gradient: 'from-orange-500 to-rose-500' },
    { id: 'spelling', title: 'Spelling', icon: '🔡', gradient: 'from-emerald-500 to-green-500' },
    { id: 'phonics', title: 'Phonics', icon: '🔤', gradient: 'from-cyan-500 to-sky-500' },
    { id: 'speaking', title: 'Speaking', icon: '🎤', gradient: 'from-red-500 to-fuchsia-500' }
];

const literacyActivities = [
    {
        id: 'beginner-readers', name: 'Beginner Readers', icon: '🔤',
        description: 'Early reading activities for beginning readers',
        component: BeginnerReaders, category: ['reading', 'phonics']
    },
    {
        id: 'reading-for-fun', name: 'Reading for Fun', icon: '🎉',
        description: 'Engaging texts for advanced readers',
        component: ReadingForFun, category: 'reading', isNew: true, underConstruction: true
    },
    {
        id: 'readers-theatre', name: 'Readers Theatre', icon: '🎭',
        description: 'Drama scripts with character roles',
        component: ReadersTheatre, category: ['reading', 'speaking'], isNew: true, underConstruction: true
    },
    {
        id: 'morphology', name: 'Morphology Master', icon: '🔤',
        description: 'Prefixes, suffixes, and base words',
        component: Morphology, category: 'spelling', isNew: true
    },
    {
        id: 'literacy-warmup', name: 'Literacy Warmup', icon: '🔥',
        description: 'Interactive phonics activities',
        component: LiteracyWarmup, category: 'phonics',
        hasYearLevels: true,
        yearLevels: [
            { id: 'prep', name: 'Prep/Foundation', component: PrepLiteracyWarmup },
            { id: 'grade5', name: 'Grade 5', component: LiteracyWarmup }
        ]
    },
    {
        id: 'spelling-program', name: 'Spelling & Fluency Studio', icon: '🌀',
        description: 'Spelling lists with reading passages',
        component: SpellingProgram, category: ['spelling', 'reading'], isUpdated: true
    },
    {
        id: 'reading-comprehension', name: 'Reading Comprehension', icon: '🧠',
        description: 'Text analysis and understanding',
        component: ReadingComprehension, category: 'reading', underConstruction: true
    },
    {
        id: 'visual-writing-prompts', name: 'Visual Writing Prompts', icon: '🖼️',
        description: 'Visual storytelling prompts',
        component: VisualWritingPrompts, category: 'writing'
    },
    {
        id: 'vocabulary-builder', name: 'Vocabulary Builder', icon: '📖',
        description: 'Definitions, synonyms, and word lists',
        component: VocabularyCorner, category: ['spelling', 'reading'], isNew: true, underConstruction: true
    },
    {
        id: 'grammar-workshop', name: 'Grammar Workshop', icon: '✏️',
        description: 'Interactive grammar lessons',
        component: ComingSoon, category: 'writing'
    },
    {
        id: 'poetry-corner', name: 'Poetry Corner', icon: '🎭',
        description: 'Poetry writing forms',
        component: ComingSoon, category: ['writing', 'speaking']
    },
    {
        id: 'handwriting-practice', name: 'Handwriting Practice', icon: '✏️',
        description: 'Letter formation practice',
        component: ComingSoon, category: 'writing'
    }
];

const LiteracySection = ({ onBack, showToast, students, saveData, loadedData }) => {
    const [activeActivity, setActiveActivity] = useState(null);
    const [selectedYearLevel, setSelectedYearLevel] = useState(null);
    const [focusArea, setFocusArea] = useState('all');

    // Filter activities by focus area
    const filteredActivities = literacyActivities.filter(activity => {
        if (focusArea === 'all') return true;
        const cat = activity.category;
        if (Array.isArray(cat)) return cat.includes(focusArea);
        return cat === focusArea;
    }).sort((a, b) => (a.underConstruction ? 1 : 0) - (b.underConstruction ? 1 : 0));

    // Render active activity
    if (activeActivity && (!activeActivity.hasYearLevels || selectedYearLevel)) {
        const ActivityComponent = selectedYearLevel ? selectedYearLevel.component : activeActivity.component;
        const activityProps = { showToast, students };
        if (['literacy-warmup', 'spelling-program', 'beginner-readers', 'morphology'].includes(activeActivity.id)) {
            activityProps.saveData = saveData;
            activityProps.loadedData = loadedData;
        }

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        <button onClick={onBack} className="hover:text-blue-600">Curriculum Corner</button>
                        <span>→</span>
                        <button onClick={() => { setActiveActivity(null); setSelectedYearLevel(null); }} className="hover:text-blue-600">Literacy</button>
                        <span>→</span>
                        <span className="font-semibold text-slate-800">{activeActivity.name}</span>
                    </div>
                    <button onClick={() => { setActiveActivity(null); setSelectedYearLevel(null); }} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
                </div>
                <ActivityComponent {...activityProps} />
            </div>
        );
    }

    // Year level selection
    if (activeActivity?.hasYearLevels && !selectedYearLevel) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <button onClick={() => setActiveActivity(null)} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 text-center">
                    <h2 className="text-3xl font-bold mb-2">{activeActivity.icon} {activeActivity.name}</h2>
                    <p className="opacity-90">Choose your year level</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {activeActivity.yearLevels.map(level => (
                        <button key={level.id} onClick={() => setSelectedYearLevel(level)}
                            className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-center border-2 border-transparent hover:border-blue-300">
                            <div className="text-4xl mb-3">{level.id === 'prep' ? '🌱' : '🚀'}</div>
                            <h4 className="font-bold text-xl text-slate-800">{level.name}</h4>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Main literacy view
    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">📚</span> Literacy & Language Arts
                </h2>
                <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back to Subjects</button>
            </div>

            {/* Focus Area Selector */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {literacyFocusAreas.map(area => (
                    <button key={area.id} onClick={() => setFocusArea(area.id)}
                        className={`p-4 rounded-xl text-white font-semibold transition-all hover:scale-105 bg-gradient-to-br ${area.gradient} ${focusArea === area.id ? 'ring-4 ring-offset-2 ring-purple-300 shadow-xl' : 'shadow-md opacity-90'}`}>
                        <div className="text-2xl mb-1">{area.icon}</div>
                        <div className="text-sm">{area.title}</div>
                    </button>
                ))}
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredActivities.map(activity => (
                    <button key={activity.id} onClick={() => setActiveActivity(activity)}
                        className={`bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] border border-slate-200 hover:border-blue-300 relative ${activity.underConstruction ? 'opacity-60' : ''}`}>
                        {activity.isNew && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>}
                        {activity.isUpdated && <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">UPDATED</span>}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{activity.icon}</span>
                            <div>
                                <h3 className="font-bold text-slate-800">{activity.name}</h3>
                                <p className="text-sm text-slate-500">{activity.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activity.underConstruction ? 'bg-amber-100 text-amber-700' : activity.component === ComingSoon ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {activity.underConstruction ? 'Under Construction' : activity.component === ComingSoon ? 'Coming Soon' : 'Available'}
                            </span>
                            <span className="text-blue-500 font-semibold text-sm">Open →</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LiteracySection;
