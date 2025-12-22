// components/curriculum/sections/ScienceSection.js
// Lazy-loaded Science section for Curriculum Corner
import React, { useState } from 'react';

// Import science components
import SolarSystemExplorer from '../science/SolarSystemExplorer';

// Coming Soon placeholder
const ComingSoon = ({ toolName }) => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-2xl font-bold text-amber-800 mb-2">{toolName || 'Feature'} Coming Soon!</h3>
        <p className="text-amber-600">We're working hard to bring you this tool. Check back soon!</p>
    </div>
);

const scienceActivities = [
    {
        id: 'solar-system', name: 'Solar System Explorer', icon: '🪐',
        description: 'Explore planets and space',
        component: SolarSystemExplorer, isNew: true
    },
    {
        id: 'virtual-experiments', name: 'Virtual Experiments', icon: '⚗️',
        description: 'Safe virtual science experiments',
        component: ComingSoon
    },
    {
        id: 'body-systems', name: 'Body Systems', icon: '🫀',
        description: 'Learn about the human body',
        component: ComingSoon
    },
    {
        id: 'weather-station', name: 'Weather Station', icon: '🌤️',
        description: 'Weather tracking and meteorology',
        component: ComingSoon
    }
];

const ScienceSection = ({ onBack, showToast, students }) => {
    const [activeActivity, setActiveActivity] = useState(null);

    if (activeActivity) {
        const ActivityComponent = activeActivity.component;
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        <button onClick={onBack} className="hover:text-blue-600">Curriculum Corner</button>
                        <span>→</span>
                        <button onClick={() => setActiveActivity(null)} className="hover:text-blue-600">Science</button>
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
                    <span className="text-2xl">🔬</span> Science
                </h2>
                <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back to Subjects</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {scienceActivities.map(activity => (
                    <button key={activity.id} onClick={() => setActiveActivity(activity)}
                        className="bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] border border-slate-200 hover:border-purple-300 relative">
                        {activity.isNew && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>}
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{activity.icon}</span>
                            <div>
                                <h3 className="font-bold text-slate-800">{activity.name}</h3>
                                <p className="text-sm text-slate-500">{activity.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${activity.component === ComingSoon ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {activity.component === ComingSoon ? 'Coming Soon' : 'Available'}
                            </span>
                            <span className="text-purple-600 font-semibold text-sm">Open →</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ScienceSection;
