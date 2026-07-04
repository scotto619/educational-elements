// components/student/StudentScience.js — Science Lab hub
// Learning → Science now offers multiple tools: pick between the Solar System
// Explorer and the new Matter Lab particle simulator.
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Loading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
  </div>
);

const SolarSystemExplorer = dynamic(() => import('../curriculum/science/SolarSystemExplorer'), { loading: Loading, ssr: false });
const MatterLab = dynamic(() => import('./MatterLab'), { loading: Loading, ssr: false });

const TOOLS = [
  {
    id: 'matter-lab',
    name: 'Matter Lab',
    emoji: '🧪',
    badge: 'NEW',
    description: 'Heat and cool real particles! Watch ice melt, water boil and steam condense — then earn all 8 lab badges to become a Matter Master.',
    color: 'from-sky-500 to-cyan-600',
  },
  {
    id: 'solar-system',
    name: 'Solar System Explorer',
    emoji: '🪐',
    description: 'Watch every planet orbit the sun, click a world to pause its path, and compare how fast each orbit is.',
    color: 'from-indigo-600 to-slate-800',
  },
];

const StudentScience = ({ studentData, showToast, updateStudentData }) => {
  const [active, setActive] = useState(null);

  if (active) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActive(null)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
        >
          ← Back to Science Lab
        </button>
        {active === 'matter-lab' && (
          <MatterLab
            studentData={studentData}
            showToast={showToast}
            updateStudentData={updateStudentData}
          />
        )}
        {active === 'solar-system' && (
          <div className="shadow-2xl rounded-3xl overflow-hidden border border-slate-800/40 bg-slate-900">
            <SolarSystemExplorer />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🪐</span>
          <div>
            <h2 className="text-2xl font-bold">Science Lab</h2>
            <p className="text-sky-100 text-sm mt-0.5">Explore, experiment and discover!</p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActive(tool.id)}
            className={`text-left rounded-2xl p-6 text-white bg-gradient-to-br ${tool.color} hover:scale-[1.02] transition-transform shadow-lg`}
          >
            <div className="flex items-start justify-between">
              <span className="text-4xl mb-2">{tool.emoji}</span>
              {tool.badge && (
                <span className="text-xs font-black bg-white/25 rounded-full px-2.5 py-1">{tool.badge}</span>
              )}
            </div>
            <p className="font-black text-xl mb-1">{tool.name}</p>
            <p className="text-sm opacity-90 leading-snug">{tool.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentScience;
