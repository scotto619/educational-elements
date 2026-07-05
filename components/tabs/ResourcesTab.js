// components/tabs/ResourcesTab.js
// Curriculum Resources hub — lives inside Classroom Champions, student-aware
import React, { Suspense, lazy, useState } from 'react';

const SpellingProgram = lazy(() => import('../curriculum/literacy/SpellingProgram'));
const ReadersTheatre  = lazy(() => import('../curriculum/literacy/ReadersTheatre'));
const MathMentals     = lazy(() => import('../curriculum/mathematics/MathMentals'));
const MoneyMasters    = lazy(() => import('../curriculum/financial/MoneyMasters'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
  </div>
);

// ─── Tool catalogue (expand here as new curriculum tools are added) ───────────
const RESOURCE_TOOLS = [
  {
    id: 'spelling-program',
    name: 'Spelling & Fluency Studio',
    emoji: '🌀',
    description: 'Assign spelling lists to student groups, run fluency passages, and track activities.',
    badge: 'UPDATED',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    borderColor: 'border-emerald-300',
    bgColor: 'bg-emerald-50',
    hoverColor: 'hover:bg-emerald-100',
  },
  {
    id: 'readers-theatre',
    name: 'Readers Theatre',
    emoji: '🎭',
    description: 'Assign drama scripts to groups, allocate character roles to students, and perform together.',
    badge: 'NEW',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-700',
    borderColor: 'border-fuchsia-300',
    bgColor: 'bg-fuchsia-50',
    hoverColor: 'hover:bg-fuchsia-100',
  },
  {
    id: 'math-mentals',
    name: 'Math Mentals',
    emoji: '🧮',
    description: 'Assign mental-math levels to students, track daily tests and streaks, and preview questions for every level.',
    badge: 'REBUILT',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    borderColor: 'border-cyan-300',
    bgColor: 'bg-cyan-50',
    hoverColor: 'hover:bg-cyan-100',
  },
  {
    id: 'money-masters',
    name: 'Money Masters',
    emoji: '💰',
    description: 'Assign financial literacy levels — money lessons, auto-marked quizzes, boss challenges, badges, and a virtual bank with weekly interest.',
    badge: 'NEW',
    badgeColor: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-100',
  },
];

// ─── Main component ───────────────────────────────────────────────────────────
const ResourcesTab = ({
  students = [],
  showToast = () => {},
  saveClassData = async () => {},
  currentClassData = {},
}) => {
  const [activeTool, setActiveTool] = useState(null);

  // Both SpellingProgram and ReadersTheatre call saveData({ toolkitData: updatedData })
  // We just pass that straight through to saveClassData.
  const handleSaveData = async (dataObj) => {
    try {
      if (dataObj && dataObj.toolkitData) {
        await saveClassData({ toolkitData: dataObj.toolkitData });
      }
    } catch (err) {
      console.error('ResourcesTab: error saving toolkit data', err);
      showToast('Error saving data', 'error');
    }
  };

  const loadedData = currentClassData?.toolkitData || {};

  // ── Active tool view ────────────────────────────────────────────────────────
  if (activeTool) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveTool(null)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
        >
          ← Back to Resources
        </button>

        <Suspense fallback={<LoadingSpinner />}>
          {activeTool === 'spelling-program' && (
            <SpellingProgram
              students={students}
              showToast={showToast}
              saveData={handleSaveData}
              loadedData={loadedData}
            />
          )}
          {activeTool === 'readers-theatre' && (
            <ReadersTheatre
              students={students}
              showToast={showToast}
              saveData={handleSaveData}
              loadedData={loadedData}
            />
          )}
          {activeTool === 'math-mentals' && (
            <MathMentals
              students={students}
              showToast={showToast}
              saveData={handleSaveData}
              loadedData={loadedData}
            />
          )}
          {activeTool === 'money-masters' && (
            <MoneyMasters
              students={students}
              showToast={showToast}
              saveData={handleSaveData}
              loadedData={loadedData}
            />
          )}
        </Suspense>
      </div>
    );
  }

  // ── Tool picker ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📚</span>
          <div>
            <h2 className="text-2xl font-bold">Curriculum Resources</h2>
            <p className="text-violet-200 text-sm mt-0.5">
              Assign spelling lists, readers theatre scripts, and more — all linked to your class.
            </p>
          </div>
        </div>

        {students.length > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 text-sm font-medium">
            <span>👥</span>
            <span>{students.length} student{students.length !== 1 ? 's' : ''} in your class</span>
          </div>
        )}
      </div>

      {/* Tool cards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          Available Tools
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCE_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`text-left p-5 rounded-2xl border-2 ${tool.borderColor} ${tool.bgColor} ${tool.hoverColor} transition-all shadow-sm hover:shadow-md group`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-4xl">{tool.emoji}</span>
                {tool.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-1 group-hover:text-indigo-700 transition-colors">
                {tool.name}
              </h4>
              <p className="text-sm text-gray-500 leading-snug">{tool.description}</p>
            </button>
          ))}

          {/* Placeholder card — more coming soon */}
          <div className="p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center min-h-[140px]">
            <span className="text-3xl mb-2">🔜</span>
            <p className="text-sm font-semibold text-gray-400">More tools coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
