// components/tabs/CurriculumCornerTab.js
// COMPLETE OVERHAUL: Banner-based navigation with lazy-loaded sections
import React, { useState, Suspense, lazy } from 'react';

// Lazy-load section components for performance
const LiteracySection = lazy(() => import('../curriculum/sections/LiteracySection'));
const MathematicsSection = lazy(() => import('../curriculum/sections/MathematicsSection'));
const ScienceSection = lazy(() => import('../curriculum/sections/ScienceSection'));
const GeographySection = lazy(() => import('../curriculum/sections/GeographySection'));
const HistorySection = lazy(() => import('../curriculum/sections/HistorySection'));
const DisplaysSection = lazy(() => import('../curriculum/sections/DisplaysSection'));
const StudyStudioSection = lazy(() => import('../curriculum/sections/StudyStudioSection'));
const ArtsSection = lazy(() => import('../curriculum/sections/ArtsSection'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      <p className="text-slate-600 font-medium">Loading section...</p>
    </div>
  </div>
);

// Subject configuration with banners
const subjects = [
  {
    id: 'literacy',
    name: 'Literacy & Language Arts',
    description: 'Reading, writing, spelling, phonics & vocabulary tools',
    banner: '/Displays/Banners/Literacy.png',
    color: 'from-blue-500 to-purple-600',
    icon: '📚',
    component: LiteracySection
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Interactive math tools and daily challenges',
    banner: '/Displays/Banners/Mathematics.png',
    color: 'from-green-500 to-emerald-600',
    icon: '🔢',
    component: MathematicsSection
  },
  {
    id: 'science',
    name: 'Science',
    description: 'Scientific exploration and experiments',
    banner: '/Displays/Banners/Science.png',
    color: 'from-purple-500 to-violet-600',
    icon: '🔬',
    component: ScienceSection
  },
  {
    id: 'geography',
    name: 'Geography',
    description: 'World maps, countries, and cultures',
    banner: '/Displays/Banners/GEOGRAPHY.png',
    color: 'from-teal-500 to-cyan-600',
    icon: '🌍',
    component: GeographySection
  },
  {
    id: 'history',
    name: 'History',
    description: 'Historical events and timelines',
    banner: '/Displays/Banners/HISTORY.png',
    color: 'from-amber-500 to-orange-600',
    icon: '🏺',
    component: HistorySection
  },
  {
    id: 'displays',
    name: 'Classroom Displays',
    description: 'Printable posters and classroom decorations',
    banner: '/Displays/Banners/Displays.png',
    color: 'from-fuchsia-500 to-pink-600',
    icon: '🖼️',
    component: DisplaysSection
  },
  {
    id: 'study-studio',
    name: 'Study & Revision',
    description: 'Flip cards and revision tools',
    banner: null, // No specific banner
    color: 'from-indigo-500 to-purple-600',
    icon: '🧠',
    component: StudyStudioSection
  },
  {
    id: 'arts',
    name: 'Arts & Creativity',
    description: 'Creative arts and expression tools',
    banner: null, // No specific banner
    color: 'from-pink-500 to-rose-600',
    icon: '🎨',
    component: ArtsSection
  }
];

// Main Curriculum Corner Component
const CurriculumCornerTab = ({
  students = [],
  showToast = () => { },
  saveData = () => { },
  loadedData = {}
}) => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (subjectId) => {
    setImageErrors(prev => ({ ...prev, [subjectId]: true }));
  };

  // Render active subject section
  if (activeSubject) {
    const SubjectComponent = activeSubject.component;

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <SubjectComponent
          onBack={() => setActiveSubject(null)}
          showToast={showToast}
          students={students}
          saveData={saveData}
          loadedData={loadedData}
        />
      </Suspense>
    );
  }

  // Main menu with banners
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <img
          src="/Displays/Banners/CurriculumCorner.png"
          alt="Curriculum Corner"
          className="h-24 md:h-32 mx-auto object-contain mb-4"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div className="hidden text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl p-8">
          <h2 className="text-4xl font-bold">📖 Curriculum Corner 🎓</h2>
        </div>
        <p className="text-slate-600 text-lg mt-2">Subject-based teaching tools for every classroom need</p>
      </div>

      {/* Subject Grid with Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <button
            key={subject.id}
            onClick={() => setActiveSubject(subject)}
            className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-purple-300"
          >
            {/* Banner Image or Gradient Fallback */}
            {subject.banner && !imageErrors[subject.id] ? (
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={subject.banner}
                  alt={subject.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => handleImageError(subject.id)}
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              </div>
            ) : (
              /* Gradient fallback for subjects without banners */
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
                <div className="text-center text-white p-6">
                  <span className="text-6xl block mb-4">{subject.icon}</span>
                  <h3 className="text-2xl font-bold">{subject.name}</h3>
                </div>
              </div>
            )}

            {/* Info Bar */}
            <div className={`bg-gradient-to-r ${subject.color} p-4`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span>{subject.icon}</span>
                    {subject.name}
                  </h3>
                  <p className="text-white/80 text-sm">{subject.description}</p>
                </div>
                <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span>💡</span> Quick Navigation Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-blue-700 mb-1">📚 Literacy</div>
            <div className="text-slate-600">Has focus area filters for Reading, Writing, Spelling, Phonics & Speaking</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-green-700 mb-1">🔢 Mathematics</div>
            <div className="text-slate-600">Daily math challenges, interactive angles & clock tools</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="font-semibold text-fuchsia-700 mb-1">🖼️ Displays</div>
            <div className="text-slate-600">Browse and print subject-specific classroom decorations</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCornerTab;
