// components/student/StudentWritingHub.js — Writing strand hub
// Small chooser for the Learning → Literacy → Writing strand: pick between
// the Writing Studio (scaffolded creative writing with teacher feedback) and
// Sentence Surgeon (editing).
'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const Loading = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
  </div>
);

const StudentWritingStudio = dynamic(() => import('./StudentWritingStudio'), { loading: Loading, ssr: false });
const SentenceSurgeon = dynamic(() => import('./SentenceSurgeon'), { loading: Loading, ssr: false });

const TOOLS = [
  {
    id: 'writing-studio',
    name: 'Writing Studio',
    emoji: '✍️',
    badge: 'NEW',
    description: 'Pick a picture prompt, write your story with word banks and sentence starters, then hand it in — your teacher can read it and send you feedback!',
    color: 'from-indigo-600 to-fuchsia-600',
  },
  {
    id: 'sentence-surgeon',
    name: 'Sentence Surgeon',
    emoji: '🩺',
    description: 'Broken sentences need fixing! Hunt down missing capitals, wrong homophones, lost apostrophes and more. Earn ranks from Trainee to Grammar Legend.',
    color: 'from-teal-500 to-emerald-600',
  },
];

const StudentWritingHub = ({ studentData, showToast, updateStudentData }) => {
  const [active, setActive] = useState(null);

  if (active) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActive(null)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
        >
          ← Back to Writing
        </button>
        {active === 'sentence-surgeon' && (
          <SentenceSurgeon
            studentData={studentData}
            showToast={showToast}
            updateStudentData={updateStudentData}
          />
        )}
        {active === 'writing-studio' && (
          <StudentWritingStudio
            studentData={studentData}
            showToast={showToast}
            updateStudentData={updateStudentData}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-purple-600 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✍️</span>
          <div>
            <h2 className="text-2xl font-bold">Writing Corner</h2>
            <p className="text-purple-100 text-sm mt-0.5">Create amazing stories — and fix broken ones!</p>
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

export default StudentWritingHub;
