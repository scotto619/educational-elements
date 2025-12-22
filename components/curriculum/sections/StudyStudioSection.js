// components/curriculum/sections/StudyStudioSection.js
// Lazy-loaded Study & Revision Studio section for Curriculum Corner
import React, { useState } from 'react';

// Import study components
import FlipCardsStudio from '../general/FlipCardsStudio';

const studyActivities = [
    {
        id: 'flip-cards', name: 'Flip Cards Studio', icon: '🎴',
        description: 'Fullscreen flip cards with default decks and deck builder',
        component: FlipCardsStudio, isNew: true
    }
];

const StudyStudioSection = ({ onBack, showToast, students }) => {
    const [activeActivity, setActiveActivity] = useState(null);

    if (activeActivity) {
        const ActivityComponent = activeActivity.component;
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        <button onClick={onBack} className="hover:text-blue-600">Curriculum Corner</button>
                        <span>→</span>
                        <button onClick={() => setActiveActivity(null)} className="hover:text-blue-600">Study Studio</button>
                        <span>→</span>
                        <span className="font-semibold text-slate-800">{activeActivity.name}</span>
                    </div>
                    <button onClick={() => setActiveActivity(null)} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
                </div>
                <ActivityComponent showToast={showToast} students={students} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🧠</span> Study & Revision Studio
                </h2>
                <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back to Subjects</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {studyActivities.map(activity => (
                    <button key={activity.id} onClick={() => setActiveActivity(activity)}
                        className="bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] border border-slate-200 hover:border-indigo-300 relative">
                        {activity.isNew && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{activity.icon}</span>
                            <div>
                                <h3 className="font-bold text-slate-800">{activity.name}</h3>
                                <p className="text-sm text-slate-500">{activity.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Available</span>
                            <span className="text-indigo-600 font-semibold text-sm">Open →</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default StudyStudioSection;
