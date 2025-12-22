// components/curriculum/sections/MathematicsSection.js
// Lazy-loaded Mathematics section for Curriculum Corner
import React, { useState } from 'react';

// Import math components
import DailyMathChallenges from '../mathematics/DailyMathChallenges';
import InteractiveAngles from '../mathematics/InteractiveAngles';
import InteractiveClock from '../mathematics/InteractiveClock';
import NumbersBoard from '../mathematics/NumbersBoard';
import MathMentals from '../mathematics/MathMentals';
import MathWarmup from '../mathematics/MathWarmup';
import WorksheetGenerator from '../mathematics/WorksheetGenerator';
import AreaPerimeterTool from '../mathematics/AreaPerimeterTool';

// Coming Soon placeholder
const ComingSoon = ({ toolName }) => (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-2xl font-bold text-amber-800 mb-2">{toolName || 'Feature'} Coming Soon!</h3>
        <p className="text-amber-600">We're working hard to bring you this tool. Check back soon!</p>
    </div>
);

const mathActivities = [
    {
        id: 'daily-math-challenges', name: 'Daily Math Challenges', icon: '🎯',
        description: 'Rich daily challenges for classroom display',
        component: DailyMathChallenges, isNew: true
    },
    {
        id: 'interactive-angles', name: 'Interactive Angles', icon: '📐',
        description: 'Learn, measure, create, and play with angles',
        component: InteractiveAngles, isNew: true
    },
    {
        id: 'interactive-clock', name: 'Interactive Clock', icon: '🕒',
        description: 'Learn to tell time with draggable hands',
        component: InteractiveClock
    },
    {
        id: 'numbers-board', name: 'Numbers Board', icon: '💯',
        description: 'Interactive hundreds board for patterns',
        component: NumbersBoard
    },
    {
        id: 'math-mentals', name: 'Math Mentals', icon: '🧮',
        description: 'Daily number facts practice',
        component: MathMentals
    },
    {
        id: 'times-tables', name: 'Times Tables', icon: '✖️',
        description: 'Multiplication practice games',
        component: ComingSoon
    },
    {
        id: 'problem-solving', name: 'Problem Solving', icon: '🧮',
        description: 'Word problems and mathematical thinking',
        component: ComingSoon
    },
    {
        id: 'fractions', name: 'Fractions', icon: '½',
        description: 'Visual fraction learning tools',
        component: ComingSoon
    },
    {
        id: 'worksheet-generator', name: 'Worksheet Generator', icon: '📄',
        description: 'Create printable math worksheets',
        component: WorksheetGenerator, underConstruction: true
    },
    {
        id: 'math-warmup', name: 'Math Warmup', icon: '🔥',
        description: 'Daily number activities',
        component: MathWarmup, underConstruction: true
    },
    {
        id: 'area-perimeter', name: 'Area & Perimeter', icon: '📏',
        description: 'Explore area and perimeter concepts',
        component: AreaPerimeterTool, underConstruction: true
    }
];

const MathematicsSection = ({ onBack, showToast, students, saveData, loadedData }) => {
    const [activeActivity, setActiveActivity] = useState(null);

    const sortedActivities = mathActivities.sort((a, b) =>
        (a.underConstruction ? 1 : 0) - (b.underConstruction ? 1 : 0)
    );

    if (activeActivity) {
        const ActivityComponent = activeActivity.component;
        const activityProps = { showToast, students };
        if (['daily-math-challenges', 'interactive-angles', 'math-mentals', 'interactive-clock'].includes(activeActivity.id)) {
            activityProps.saveData = saveData;
            activityProps.loadedData = loadedData;
        }

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                        <button onClick={onBack} className="hover:text-blue-600">Curriculum Corner</button>
                        <span>→</span>
                        <button onClick={() => setActiveActivity(null)} className="hover:text-blue-600">Mathematics</button>
                        <span>→</span>
                        <span className="font-semibold text-slate-800">{activeActivity.name}</span>
                    </div>
                    <button onClick={() => setActiveActivity(null)} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
                </div>
                <ActivityComponent {...activityProps} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🛠️</span> Mathematics Tools
                </h2>
                <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedActivities.map(activity => (
                    <button key={activity.id} onClick={() => setActiveActivity(activity)}
                        className={`bg-white rounded-xl shadow-sm p-5 text-left hover:shadow-lg transition-all hover:scale-[1.02] border border-slate-200 hover:border-green-300 relative ${activity.underConstruction ? 'opacity-60' : ''}`}>
                        {activity.isNew && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>}
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
                            <span className="text-green-600 font-semibold text-sm">Open →</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MathematicsSection;
