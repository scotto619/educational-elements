// components/tabs/ResourcesTab.js
// Curriculum Resources hub — lives inside Classroom Champions, student-aware
import React, { Suspense, lazy, useState } from 'react';

// Class programs (student-aware)
const SpellingProgram = lazy(() => import('../curriculum/literacy/SpellingProgram'));
const ReadersTheatre  = lazy(() => import('../curriculum/literacy/ReadersTheatre'));
const MathMentals     = lazy(() => import('../curriculum/mathematics/MathMentals'));
const MoneyMasters    = lazy(() => import('../curriculum/financial/MoneyMasters'));
const KeyboardQuest   = lazy(() => import('../curriculum/typing/KeyboardQuest'));

// English tools (moved here from the Resource Hub)
const ReadingComprehension = lazy(() => import('../curriculum/literacy/ReadingComprehension'));
const BeginnerReaders      = lazy(() => import('../curriculum/literacy/BeginnerReaders'));
const PartnerReading       = lazy(() => import('../curriculum/literacy/PartnerReadingPassages'));
const ReadingForFun        = lazy(() => import('../curriculum/literacy/ReadingForFun'));
const VisualWritingPrompts = lazy(() => import('../curriculum/literacy/VisualWritingPrompts'));
const GrammarWorkshop      = lazy(() => import('../curriculum/literacy/GrammarWorkshop'));
const PoetryCorner         = lazy(() => import('../curriculum/literacy/PoetryCorner'));
const Morphology           = lazy(() => import('../curriculum/literacy/Morphology'));
const VocabularyCorner     = lazy(() => import('../curriculum/literacy/VocabularyCorner'));
const PrepLiteracyWarmup   = lazy(() => import('../curriculum/literacy/PrepLiteracyWarmUp'));
const LiteracyWarmup       = lazy(() => import('../curriculum/literacy/LiteracyWarmup'));

// Mathematics tools (moved here from the Resource Hub)
const TimesTablesMaster    = lazy(() => import('../curriculum/mathematics/TimesTablesMaster'));
const NumbersBoard         = lazy(() => import('../curriculum/mathematics/NumbersBoard'));
const DailyMathChallenges  = lazy(() => import('../curriculum/mathematics/DailyMathChallenges'));
const MathWarmup           = lazy(() => import('../curriculum/mathematics/MathWarmup'));
const FractionVisualiser   = lazy(() => import('../curriculum/mathematics/FractionVisualiser'));
const InteractiveAngles    = lazy(() => import('../curriculum/mathematics/InteractiveAngles'));
const AreaPerimeterTool    = lazy(() => import('../curriculum/mathematics/AreaPerimeterTool'));
const InteractiveClock     = lazy(() => import('../curriculum/mathematics/InteractiveClock'));
const WorksheetGenerator   = lazy(() => import('../curriculum/mathematics/WorksheetGenerator'));

// Science tools (moved here from the Resource Hub)
const SolarSystemExplorer  = lazy(() => import('../curriculum/science/SolarSystemExplorer'));
const FoodChainBuilder     = lazy(() => import('../curriculum/science/FoodChainBuilder'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
  </div>
);

// ─── Tool catalogue (expand here as new curriculum tools are added) ───────────
const RESOURCE_TOOLS = [
  // ── Class programs — assign work & track students ──
  { id: 'spelling-program', group: 'Class Programs', name: 'Spelling & Fluency Studio', emoji: '🌀', component: SpellingProgram,
    description: 'Assign spelling lists to student groups, run fluency passages, and track activities.',
    badge: 'UPDATED', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-emerald-300', bgColor: 'bg-emerald-50', hoverColor: 'hover:bg-emerald-100' },
  { id: 'readers-theatre', group: 'Class Programs', name: 'Readers Theatre', emoji: '🎭', component: ReadersTheatre,
    description: 'Assign drama scripts to groups, allocate character roles to students, and perform together.',
    badge: 'NEW', badgeColor: 'bg-fuchsia-100 text-fuchsia-700', borderColor: 'border-fuchsia-300', bgColor: 'bg-fuchsia-50', hoverColor: 'hover:bg-fuchsia-100' },
  { id: 'math-mentals', group: 'Class Programs', name: 'Math Mentals', emoji: '🧮', component: MathMentals,
    description: 'Assign mental-math levels to students, track daily tests and streaks, and preview questions for every level.',
    badge: 'REBUILT', badgeColor: 'bg-cyan-100 text-cyan-700', borderColor: 'border-cyan-300', bgColor: 'bg-cyan-50', hoverColor: 'hover:bg-cyan-100' },
  { id: 'money-masters', group: 'Class Programs', name: 'Money Masters', emoji: '💰', component: MoneyMasters,
    description: 'Assign financial literacy levels — money lessons, auto-marked quizzes, boss challenges, badges, and a virtual bank with weekly interest.',
    badge: 'NEW', badgeColor: 'bg-amber-100 text-amber-700', borderColor: 'border-amber-300', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100' },
  { id: 'keyboard-quest', group: 'Class Programs', name: 'Keyboard Quest', emoji: '⌨️', component: KeyboardQuest,
    description: 'Assign touch-typing stages — 40 lessons across 5 belts with live WPM tracking, a finger-guide keyboard, stars, and belt tests.',
    badge: 'NEW', badgeColor: 'bg-indigo-100 text-indigo-700', borderColor: 'border-indigo-300', bgColor: 'bg-indigo-50', hoverColor: 'hover:bg-indigo-100' },

  // ── English ──
  { id: 'reading-comprehension', group: 'English', name: 'Reading Comprehension', emoji: '🧠', component: ReadingComprehension,
    description: 'Text analysis and understanding.',
    badge: 'UPDATED', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-sky-300', bgColor: 'bg-sky-50', hoverColor: 'hover:bg-sky-100' },
  { id: 'beginner-readers', group: 'English', name: 'Beginner Readers', emoji: '🔤', component: BeginnerReaders,
    description: 'Early reading for beginning readers.',
    borderColor: 'border-blue-300', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
  { id: 'partner-reading', group: 'English', name: 'Partner Reading Passages', emoji: '🤝', component: PartnerReading,
    description: 'Printable passages with partner turns.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-cyan-300', bgColor: 'bg-cyan-50', hoverColor: 'hover:bg-cyan-100' },
  { id: 'reading-for-fun', group: 'English', name: 'Reading for Fun', emoji: '🎉', component: ReadingForFun,
    description: 'Engaging texts for advanced readers.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-teal-300', bgColor: 'bg-teal-50', hoverColor: 'hover:bg-teal-100' },
  { id: 'visual-writing-prompts', group: 'English', name: 'Visual Writing Prompts', emoji: '🖼️', component: VisualWritingPrompts,
    description: 'Image-based storytelling prompts.',
    borderColor: 'border-pink-300', bgColor: 'bg-pink-50', hoverColor: 'hover:bg-pink-100' },
  { id: 'grammar-workshop', group: 'English', name: 'Grammar Workshop', emoji: '✏️', component: GrammarWorkshop,
    description: 'Interactive grammar lessons & quizzes.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-rose-300', bgColor: 'bg-rose-50', hoverColor: 'hover:bg-rose-100' },
  { id: 'poetry-corner', group: 'English', name: 'Poetry Corner', emoji: '🎭', component: PoetryCorner,
    description: 'Poetry forms and creative expression.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-fuchsia-300', bgColor: 'bg-fuchsia-50', hoverColor: 'hover:bg-fuchsia-100' },
  { id: 'morphology', group: 'English', name: 'Morphology Master', emoji: '🔤', component: Morphology,
    description: 'Prefixes, suffixes and base words.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-emerald-300', bgColor: 'bg-emerald-50', hoverColor: 'hover:bg-emerald-100' },
  { id: 'vocabulary-builder', group: 'English', name: 'Vocabulary Builder', emoji: '📖', component: VocabularyCorner,
    description: 'Definitions, synonyms and word lists.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-lime-300', bgColor: 'bg-lime-50', hoverColor: 'hover:bg-lime-100' },
  { id: 'literacy-warmup-prep', group: 'English', name: 'Literacy Warmup — Prep / Foundation', emoji: '🌱', component: PrepLiteracyWarmup,
    description: 'Interactive phonics activities for Prep / Foundation.',
    borderColor: 'border-green-300', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
  { id: 'literacy-warmup-grade5', group: 'English', name: 'Literacy Warmup — Grade 5', emoji: '🚀', component: LiteracyWarmup,
    description: 'Interactive phonics and word-study warmups for Grade 5.',
    borderColor: 'border-violet-300', bgColor: 'bg-violet-50', hoverColor: 'hover:bg-violet-100' },

  // ── Mathematics ──
  { id: 'times-tables', group: 'Mathematics', name: 'Times Tables Master', emoji: '✖️', component: TimesTablesMaster,
    description: 'Explore and quiz all 12 times tables.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-lime-300', bgColor: 'bg-lime-50', hoverColor: 'hover:bg-lime-100' },
  { id: 'numbers-board', group: 'Mathematics', name: 'Numbers Board', emoji: '💯', component: NumbersBoard,
    description: 'Interactive hundreds board for patterns.',
    borderColor: 'border-cyan-300', bgColor: 'bg-cyan-50', hoverColor: 'hover:bg-cyan-100' },
  { id: 'daily-math-challenges', group: 'Mathematics', name: 'Daily Math Challenges', emoji: '🎯', component: DailyMathChallenges,
    description: 'Rich daily challenges for classroom display.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-amber-300', bgColor: 'bg-amber-50', hoverColor: 'hover:bg-amber-100' },
  { id: 'math-warmup', group: 'Mathematics', name: 'Math Warmup', emoji: '🔥', component: MathWarmup,
    description: 'Daily warm-up number activities.',
    borderColor: 'border-orange-300', bgColor: 'bg-orange-50', hoverColor: 'hover:bg-orange-100' },
  { id: 'fraction-visualiser', group: 'Mathematics', name: 'Fraction Visualiser', emoji: '½', component: FractionVisualiser,
    description: 'Bar, circle, grid & number line models.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-teal-300', bgColor: 'bg-teal-50', hoverColor: 'hover:bg-teal-100' },
  { id: 'interactive-angles', group: 'Mathematics', name: 'Interactive Angles', emoji: '📐', component: InteractiveAngles,
    description: 'Learn, measure, create and play with angles.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-yellow-300', bgColor: 'bg-yellow-50', hoverColor: 'hover:bg-yellow-100' },
  { id: 'area-perimeter', group: 'Mathematics', name: 'Area & Perimeter', emoji: '📏', component: AreaPerimeterTool,
    description: 'Explore area and perimeter concepts.',
    borderColor: 'border-emerald-300', bgColor: 'bg-emerald-50', hoverColor: 'hover:bg-emerald-100' },
  { id: 'interactive-clock', group: 'Mathematics', name: 'Interactive Clock', emoji: '🕒', component: InteractiveClock,
    description: 'Learn to tell time with draggable hands.',
    borderColor: 'border-sky-300', bgColor: 'bg-sky-50', hoverColor: 'hover:bg-sky-100' },
  { id: 'worksheet-generator', group: 'Mathematics', name: 'Worksheet Generator', emoji: '📄', component: WorksheetGenerator,
    description: 'Generate printable maths worksheets.',
    borderColor: 'border-slate-300', bgColor: 'bg-slate-50', hoverColor: 'hover:bg-slate-100' },

  // ── Science ──
  { id: 'solar-system', group: 'Science', name: 'Solar System Explorer', emoji: '🪐', component: SolarSystemExplorer,
    description: 'Explore planets and space interactively.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-indigo-300', bgColor: 'bg-indigo-50', hoverColor: 'hover:bg-indigo-100' },
  { id: 'food-chain', group: 'Science', name: 'Food Chain Builder', emoji: '🦁', component: FoodChainBuilder,
    description: 'Build food chains across 4 ecosystems.',
    badge: 'NEW', badgeColor: 'bg-emerald-100 text-emerald-700', borderColor: 'border-green-300', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
];

const TOOL_GROUPS = ['Class Programs', 'English', 'Mathematics', 'Science'];
const GROUP_EMOJI = { 'Class Programs': '🏫', English: '📚', Mathematics: '🔢', Science: '🔬' };

// ─── Main component ───────────────────────────────────────────────────────────
const ResourcesTab = ({
  students = [],
  showToast = () => {},
  saveClassData = async () => {},
  currentClassData = {},
}) => {
  const [activeTool, setActiveTool] = useState(null);

  // Tools call saveData({ toolkitData: updatedData }) — pass straight through to saveClassData.
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
    const tool = RESOURCE_TOOLS.find(t => t.id === activeTool);
    const ToolComp = tool ? tool.component : null;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setActiveTool(null)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition font-semibold text-sm shadow-sm"
        >
          ← Back to Resources
        </button>

        <Suspense fallback={<LoadingSpinner />}>
          {ToolComp && (
            <ToolComp
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
            <h2 className="text-2xl font-bold">Interactive Resources</h2>
            <p className="text-violet-200 text-sm mt-0.5">
              Class programs plus interactive English, Maths and Science tools — all linked to your class.
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

      {/* Tool cards, grouped by subject */}
      {TOOL_GROUPS.map(group => {
        const tools = RESOURCE_TOOLS.filter(t => t.group === group);
        if (tools.length === 0) return null;
        return (
          <div key={group}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {GROUP_EMOJI[group]} {group}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map(tool => (
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
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResourcesTab;
