// components/curriculum/sections/ArtsSection.js
// Lazy-loaded Arts & Creativity section for Curriculum Corner
import React, { useState } from 'react';

// Coming Soon placeholder
const ComingSoon = ({ toolName }) => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-2xl font-bold text-amber-800 mb-2">{toolName || 'Feature'} Coming Soon!</h3>
        <p className="text-amber-600">We're working hard to bring you this tool. Check back soon!</p>
    </div>
);

const artsActivities = [
    {
        id: 'art-gallery', name: 'Art Gallery', icon: '🖼️',
        description: 'Explore famous artworks and artists',
        component: ComingSoon
    },
    {
        id: 'music-maker', name: 'Music Maker', icon: '🎵',
        description: 'Create and learn about music',
        component: ComingSoon
    },
    {
        id: 'drama-workshop', name: 'Drama Workshop', icon: '🎭',
        description: 'Acting and theater activities',
        component: ComingSoon
    }
];

const ArtsSection = ({ onBack, showToast, students }) => {
    const [activeActivity, setActiveActivity] = useState(null);

    if (activeActivity) {
        const ActivityComponent = activeActivity.component;
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        <button onClick={onBack} className="hover:text-blue-600">Curriculum Corner</button>
                        <span>→</span>
                        <button onClick={() => setActiveActivity(null)} className="hover:text-blue-600">Arts</button>
                        <span>→</span>
                        <span className="font-semibold text-slate-800">{activeActivity.name}</span>
                    </div>
                    <button onClick={() => setActiveActivity(null)} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
                </div>
                <ActivityComponent toolName={activeActivity.name} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🎨</span> Arts & Creativity
                </h2>
                <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back to Subjects</button>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-2xl font-bold mb-2">Arts Tools Coming Soon!</h3>
                <p className="opacity-90">We're building creative tools for art, music, and drama.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {artsActivities.map(activity => (
                    <button key={activity.id} onClick={() => setActiveActivity(activity)}
                        className="bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] border border-slate-200 hover:border-pink-300 relative opacity-60">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">{activity.icon}</span>
                            <div>
                                <h3 className="font-bold text-slate-800">{activity.name}</h3>
                                <p className="text-sm text-slate-500">{activity.description}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Coming Soon</span>
                            <span className="text-pink-600 font-semibold text-sm">Preview →</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ArtsSection;
