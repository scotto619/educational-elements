// components/tabs/CurriculumCornerTab.js - COMPLETE REWRITE WITH INTERACTIVE ANGLES
import React, { useState } from 'react';

// Import all activity components
import LiteracyWarmup from '../curriculum/literacy/LiteracyWarmup';
import PrepLiteracyWarmup from '../curriculum/literacy/PrepLiteracyWarmUp';
import ReadingComprehension from '../curriculum/literacy/ReadingComprehension';
import VisualWritingPrompts from '../curriculum/literacy/VisualWritingPrompts';
import SpellingProgram from '../curriculum/literacy/SpellingProgram';
import FluencyPractice from '../curriculum/literacy/FluencyPractice';
import BeginnerReaders from '../curriculum/literacy/BeginnerReaders';
import ReadingForFun from '../curriculum/literacy/ReadingForFun';
import ReadersTheatre from '../curriculum/literacy/ReadersTheatre';
import Morphology from '../curriculum/literacy/Morphology';
import AreaPerimeterTool from '../curriculum/mathematics/AreaPerimeterTool';
import MathWarmup from '../curriculum/mathematics/MathWarmup';
import WorksheetGenerator from '../curriculum/mathematics/WorksheetGenerator';
import NumbersBoard from '../curriculum/mathematics/NumbersBoard';
import MathMentals from '../curriculum/mathematics/MathMentals';
import InteractiveClock from '../curriculum/mathematics/InteractiveClock';
import InteractiveAngles from '../curriculum/mathematics/InteractiveAngles'; // NEW IMPORT

// ===============================================
// COMING SOON COMPONENT
// ===============================================
const ComingSoon = ({ toolName, description }) => (
  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
    <div className="text-6xl mb-4">🚧</div>
    <h3 className="text-2xl font-bold text-gray-700 mb-2">{toolName}</h3>
    <p className="text-gray-600 mb-6">{description}</p>
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
      <h4 className="font-bold text-blue-800 mb-2">🌟 Coming Soon!</h4>
      <p className="text-blue-700 text-sm">This tool is under development and will be available in a future update.</p>
    </div>
  </div>
);

// ===============================================
// COMPLETE SUBJECT CONFIGURATION
// ===============================================
const subjects = [
  {
    id: 'literacy',
    name: 'Literacy & Language Arts',
    icon: '📚',
    color: 'from-blue-500 to-purple-600',
    description: 'Complete literacy toolkit: phonics, spelling, reading, writing, drama & vocabulary',
    activities: [
      {
        id: 'beginner-readers',
        name: 'Beginner Readers',
        icon: '🔤',
        description: 'Early reading activities for beginning readers - sound recognition, phonics, and simple passages',
        component: BeginnerReaders
      },
      {
        id: 'reading-for-fun',
        name: 'Reading for Fun',
        icon: '🎉',
        description: 'Engaging texts for advanced readers - longer passages with modern topics kids love',
        component: ReadingForFun,
        isNew: true
      },
      {
        id: 'readers-theatre',
        name: 'Readers Theatre',
        icon: '🎭',
        description: 'Drama scripts with character roles for student performances and oral reading practice',
        component: ReadersTheatre,
        isNew: true
      },
      {
        id: 'morphology',
        name: 'Morphology Master',
        icon: '🔤',
        description: 'Learn how words work! Teach prefixes, suffixes, and base words with engaging multi-level lessons',
        component: Morphology,
        isNew: true
      },
      {
        id: 'literacy-warmup',
        name: 'Literacy Warmup',
        icon: '🔥',
        description: 'Interactive phonics and sound recognition activities',
        component: LiteracyWarmup,
        hasYearLevels: true,
        yearLevels: [
          {
            id: 'prep',
            name: 'Prep/Foundation',
            description: 'SATPIN progression - single letter sounds (4-6 years)',
            component: PrepLiteracyWarmup
          },
          {
            id: 'grade5',
            name: 'Grade 5',
            description: 'Complex blends and morphology (10-11 years)',
            component: LiteracyWarmup
          }
        ]
      },
      {
        id: 'fluency-practice',
        name: 'Fluency Practice',
        icon: '📖',
        description: 'Reading passages aligned with spelling levels for fluency development',
        component: FluencyPractice,
        isUpdated: true
      },
      {
        id: 'spelling-program',
        name: 'Spelling Program',
        icon: '🔡',
        description: 'Structured spelling lists with activities and assessments',
        component: SpellingProgram
      },
      {
        id: 'reading-comprehension',
        name: 'Reading Comprehension',
        icon: '🧠',
        description: 'Text analysis and understanding activities',
        component: ReadingComprehension
      },
      {
        id: 'visual-writing-prompts',
        name: 'Visual Writing Prompts',
        icon: '🖼️',
        description: 'Inspire creativity through visual storytelling prompts',
        component: VisualWritingPrompts
      },
      {
        id: 'vocabulary-builder',
        name: 'Vocabulary Builder',
        icon: '📖',
        description: 'Word study and vocabulary development',
        component: ComingSoon
      },
      {
        id: 'grammar-workshop',
        name: 'Grammar Workshop',
        icon: '✏️',
        description: 'Interactive grammar lessons and practice',
        component: ComingSoon
      },
      {
        id: 'poetry-corner',
        name: 'Poetry Corner',
        icon: '🎭',
        description: 'Explore different forms of poetry writing',
        component: ComingSoon
      },
      {
        id: 'handwriting-practice',
        name: 'Handwriting Practice',
        icon: '✏️',
        description: 'Letter formation and handwriting improvement',
        component: ComingSoon
      }
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '🔢',
    color: 'from-green-500 to-green-600',
    description: 'Math tools and number activities',
    activities: [
      {
        id: 'interactive-angles',
        name: 'Interactive Angles',
        icon: '📐',
        description: 'Complete angles teaching tool - learn, measure, create, identify & play with angles!',
        component: InteractiveAngles,
        isNew: true
      },
      {
        id: 'interactive-clock',
        name: 'Interactive Clock',
        icon: '🕒',
        description: 'Learn to tell time with draggable hands and digital display',
        component: InteractiveClock
      },
      {
        id: 'math-mentals',
        name: 'Math Mentals',
        icon: '🧮',
        description: 'Daily number facts practice for automatic recall - like Wordle for math!',
        component: MathMentals
      },
      {
        id: 'worksheet-generator',
        name: 'Worksheet Generator',
        icon: '📄',
        description: 'Create professional printable math worksheets for any topic',
        component: WorksheetGenerator
      },
      {
        id: 'math-warmup',
        name: 'Math Warmup',
        icon: '🔥',
        description: 'Daily number activities and mathematical thinking',
        component: MathWarmup
      },
      {
        id: 'area-perimeter',
        name: 'Area & Perimeter',
        icon: '📏',
        description: 'Interactive tool for exploring area and perimeter concepts',
        component: AreaPerimeterTool
      },
      {
        id: 'numbers-board',
        name: 'Numbers Board',
        icon: '💯',
        description: 'Interactive hundreds board for number patterns and exploration',
        component: NumbersBoard
      },
      {
        id: 'times-tables',
        name: 'Times Tables',
        icon: '✖️',
        description: 'Multiplication practice and games',
        component: ComingSoon
      },
      {
        id: 'problem-solving',
        name: 'Problem Solving',
        icon: '🧮',
        description: 'Word problems and mathematical thinking',
        component: ComingSoon
      },
      {
        id: 'fractions',
        name: 'Fractions',
        icon: '½',
        description: 'Visual fraction learning tools',
        component: ComingSoon
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    color: 'from-purple-500 to-purple-600',
    description: 'Scientific exploration and experiments',
    activities: [
      {
        id: 'virtual-experiments',
        name: 'Virtual Experiments',
        icon: '⚗️',
        description: 'Safe virtual science experiments',
        component: ComingSoon
      },
      {
        id: 'body-systems',
        name: 'Body Systems',
        icon: '🫀',
        description: 'Learn about the human body',
        component: ComingSoon
      },
      {
        id: 'weather-station',
        name: 'Weather Station',
        icon: '🌤️',
        description: 'Weather tracking and meteorology',
        component: ComingSoon
      },
      {
        id: 'solar-system',
        name: 'Solar System',
        icon: '🪐',
        description: 'Explore planets and space',
        component: ComingSoon
      }
    ]
  },
  {
    id: 'geography',
    name: 'Geography',
    icon: '🌍',
    color: 'from-teal-500 to-teal-600',
    description: 'World maps, countries, and cultures',
    activities: [
      {
        id: 'world-map',
        name: 'Interactive World Map',
        icon: '🗺️',
        description: 'Explore countries and continents',
        component: ComingSoon
      },
      {
        id: 'country-explorer',
        name: 'Country Explorer',
        icon: '🏛️',
        description: 'Learn about different countries and cultures',
        component: ComingSoon
      },
      {
        id: 'landmarks',
        name: 'World Landmarks',
        icon: '🗽',
        description: 'Famous landmarks around the world',
        component: ComingSoon
      }
    ]
  },
  {
    id: 'history',
    name: 'History',
    icon: '🏺',
    color: 'from-amber-500 to-amber-600',
    description: 'Historical events and timelines',
    activities: [
      {
        id: 'timeline-builder',
        name: 'Timeline Builder',
        icon: '📅',
        description: 'Create and explore historical timelines',
        component: ComingSoon
      },
      {
        id: 'famous-people',
        name: 'Famous People',
        icon: '👑',
        description: 'Learn about historical figures',
        component: ComingSoon
      },
      {
        id: 'ancient-civilizations',
        name: 'Ancient Civilizations',
        icon: '🏛️',
        description: 'Explore ancient cultures and societies',
        component: ComingSoon
      }
    ]
  },
  {
    id: 'arts',
    name: 'Arts & Creativity',
    icon: '🎨',
    color: 'from-pink-500 to-pink-600',
    description: 'Creative arts and expression tools',
    activities: [
      {
        id: 'art-gallery',
        name: 'Art Gallery',
        icon: '🖼️',
        description: 'Explore famous artworks and artists',
        component: ComingSoon
      },
      {
        id: 'music-maker',
        name: 'Music Maker',
        icon: '🎵',
        description: 'Create and learn about music',
        component: ComingSoon
      },
      {
        id: 'drama-workshop',
        name: 'Drama Workshop',
        icon: '🎭',
        description: 'Acting and theater activities',
        component: ComingSoon
      }
    ]
  }
];

// ===============================================
// MAIN CURRICULUM CORNER COMPONENT
// ===============================================
const CurriculumCornerTab = ({ 
  students = [], 
  showToast = () => {},
  saveData = () => {},
  loadedData = {}
}) => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState(null);

  const handleSubjectSelect = (subject) => {
    setActiveSubject(subject);
    setActiveActivity(null);
    setSelectedYearLevel(null);
  };

  const handleActivitySelect = (activity) => {
    if (activity.hasYearLevels) {
      // Don't set activity yet, show year level selection first
      setActiveActivity(activity);
      setSelectedYearLevel(null);
    } else {
      setActiveActivity(activity);
      setSelectedYearLevel(null);
    }
  };

  const handleYearLevelSelect = (yearLevel) => {
    setSelectedYearLevel(yearLevel);
  };

  const handleBackToSubjects = () => {
    setActiveSubject(null);
    setActiveActivity(null);
    setSelectedYearLevel(null);
  };

  const handleBackToActivities = () => {
    setActiveActivity(null);
    setSelectedYearLevel(null);
  };

  // Render specific activity
  if (activeActivity && (!activeActivity.hasYearLevels || selectedYearLevel)) {
    const ActivityComponent = selectedYearLevel ? selectedYearLevel.component : activeActivity.component;
    
    // Pass additional props to activities for Firebase saving
    const activityProps = {
      showToast,
      students
    };
    
    // Add Firebase save/load props for specific activities that need them
    if (activeActivity.id === 'literacy-warmup' || 
        activeActivity.id === 'math-warmup' || 
        activeActivity.id === 'spelling-program' ||
        activeActivity.id === 'fluency-practice' ||
        activeActivity.id === 'math-mentals' ||
        activeActivity.id === 'interactive-clock' ||
        activeActivity.id === 'interactive-angles' ||
        activeActivity.id === 'beginner-readers' ||
        activeActivity.id === 'reading-for-fun' ||
        activeActivity.id === 'readers-theatre') {
      activityProps.saveData = saveData;
      activityProps.loadedData = loadedData;
    }
    
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <button onClick={handleBackToSubjects} className="hover:text-blue-600 transition-colors">Curriculum Corner</button>
            <span>→</span>
            <button onClick={handleBackToActivities} className="hover:text-blue-600 transition-colors">{activeSubject.name}</button>
            <span>→</span>
            <span className="font-semibold text-slate-800">
              {activeActivity.name}
              {selectedYearLevel && <span className="text-blue-600"> ({selectedYearLevel.name})</span>}
            </span>
          </div>
          <button onClick={handleBackToActivities} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">← Back to {activeSubject.name}</button>
        </div>

        {/* Activity Content */}
        <ActivityComponent {...activityProps} />
      </div>
    );
  }

  // Render year level selection for activities that have multiple year levels
  if (activeActivity && activeActivity.hasYearLevels && !selectedYearLevel) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600">
            <button onClick={handleBackToSubjects} className="hover:text-blue-600 transition-colors">Curriculum Corner</button>
            <span>→</span>
            <button onClick={handleBackToActivities} className="hover:text-blue-600 transition-colors">{activeSubject.name}</button>
            <span>→</span>
            <span className="font-semibold text-slate-800">{activeActivity.name}</span>
          </div>
          <button onClick={handleBackToActivities} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors">← Back to Activities</button>
        </div>

        {/* Year Level Selection */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <span className="text-3xl mr-3">{activeActivity.icon}</span>
              {activeActivity.name}
            </h2>
            <p className="text-xl opacity-90">Choose your year level</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Select Year Level</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {activeActivity.yearLevels.map(yearLevel => (
              <button
                key={yearLevel.id}
                onClick={() => handleYearLevelSelect(yearLevel)}
                className="p-6 rounded-xl border-2 border-slate-200 hover:border-blue-300 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-left hover:scale-105 group"
              >
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {yearLevel.id === 'prep' ? '🌱' : '🚀'}
                  </div>
                  <h4 className="font-bold text-slate-800 text-xl mb-2">{yearLevel.name}</h4>
                  <p className="text-slate-600 text-sm leading-tight">{yearLevel.description}</p>
                </div>
                <div className="text-center">
                  <span className="text-blue-500 font-semibold text-sm group-hover:text-blue-600">Select →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render activities for selected subject
  if (activeSubject) {
    return (
      <div className="space-y-6">
        {/* Subject Header */}
        <div className={`text-center bg-gradient-to-r ${activeSubject.color} text-white rounded-2xl p-8 shadow-lg relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <span className="text-3xl mr-3">{activeSubject.icon}</span>
              {activeSubject.name}
            </h2>
            <p className="text-xl opacity-90">{activeSubject.description}</p>
          </div>
          <button onClick={handleBackToSubjects} className="absolute top-4 right-4 bg-black bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">← Back</button>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubject.activities.map(activity => (
            <button
              key={activity.id}
              onClick={() => handleActivitySelect(activity)}
              className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all duration-300 hover:scale-105 border border-slate-200 hover:border-blue-300 relative"
            >
              {/* New/Updated Badge */}
              {activity.isNew && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  NEW!
                </div>
              )}
              {activity.isUpdated && (
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  UPDATED
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{activity.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{activity.name}</h3>
                  <p className="text-slate-600 text-sm">{activity.description}</p>
                  {activity.hasYearLevels && (
                    <p className="text-blue-600 text-xs font-semibold mt-1">
                      📚 Multiple year levels available
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  activity.component === ComingSoon 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {activity.component === ComingSoon ? 'Coming Soon' : 'Available'}
                </span>
                <div className="flex items-center gap-2">
                  {activity.hasYearLevels && (
                    <span className="text-blue-500 text-xs">
                      {activity.yearLevels?.length || 2} levels
                    </span>
                  )}
                  <span className="text-blue-500 font-semibold">Open →</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render main subject selection
  return (
    <div className="space-y-6">
      {/* Main Header */}
      <div className="text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4">📖</span>
            Curriculum Corner
            <span className="text-4xl ml-4">🎓</span>
          </h2>
          <p className="text-xl opacity-90">Subject-based teaching tools for every classroom need</p>
        </div>
      </div>

      {/* Subject Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Choose Your Subject Area</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSelect(subject)}
              className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-center hover:scale-105 group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{subject.icon}</div>
              <h4 className="font-bold text-slate-800 text-lg mb-2">{subject.name}</h4>
              <p className="text-sm text-slate-600 leading-tight mb-4">{subject.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                  {subject.activities.length} tool{subject.activities.length !== 1 ? 's' : ''}
                </span>
                <span className="text-blue-500 font-semibold text-sm group-hover:text-blue-600">Enter →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">📊 Curriculum Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map(subject => {
            const availableTools = subject.activities.filter(activity => activity.component !== ComingSoon).length;
            const totalTools = subject.activities.length;
            const newTools = subject.activities.filter(activity => activity.isNew).length;
            
            return (
              <div key={subject.id} className="text-center p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl mb-2">{subject.icon}</div>
                <div className="text-sm font-semibold text-slate-800">{subject.name}</div>
                <div className="text-xs text-slate-600 mt-1">
                  {availableTools}/{totalTools} tools ready
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${subject.color}`}
                    style={{ width: `${(availableTools / totalTools) * 100}%` }}
                  ></div>
                </div>
                {/* Highlight New Tools */}
                {newTools > 0 && (
                  <div className="text-xs text-red-600 font-semibold mt-1 animate-pulse">
                    🆕 {newTools} new tool{newTools > 1 ? 's' : ''}!
                  </div>
                )}
                {/* Special highlights */}
                {subject.id === 'literacy' && (
                  <div className="text-xs text-purple-600 font-semibold mt-1">
                    ✨ 2 New Literacy Tools!
                  </div>
                )}
                {subject.id === 'mathematics' && (
                  <div className="text-xs text-green-600 font-semibold mt-1">
                    📐 New Angles Tool!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* What's New Section - UPDATED WITH ANGLES TOOL */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
          <span className="mr-2">🆕</span>
          What's New in Curriculum Corner
        </h3>
        <div className="space-y-3">
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <h4 className="font-bold text-green-700 mb-2">📐 NEW: Interactive Angles Tool</h4>
            <p className="text-sm text-green-600 mb-2">
              Complete angles teaching system with 5 engaging modes:
            </p>
            <ul className="text-xs text-green-600 space-y-1 ml-4">
              <li>• 📚 Learn Types - Explore acute, right, obtuse, straight & reflex angles</li>
              <li>• 📏 Measure - Use a virtual protractor to measure angles</li>
              <li>• ✏️ Create - Draw angles by dragging or using controls</li>
              <li>• 🔍 Identify - Test angle recognition with challenges</li>
              <li>• 🎮 Game - Angle estimation game with difficulty levels</li>
            </ul>
            <p className="text-xs text-green-500 italic mt-2">
              Perfect visual tool for teaching geometry concepts!
            </p>
          </div>
          <div className="bg-white border border-purple-200 rounded-lg p-4">
            <h4 className="font-bold text-purple-700 mb-2">🎉 New: Reading for Fun</h4>
            <p className="text-sm text-purple-600 mb-2">
              Engaging texts for advanced readers with 6 exciting categories:
            </p>
            <ul className="text-xs text-purple-600 space-y-1 ml-4">
              <li>• 🚀 Adventure Stories - Epic tales and exciting journeys</li>
              <li>• 🤯 Cool Facts - Amazing info about gaming, tech, and trends</li>
              <li>• ⚡ Debate Zone - Persuasive texts about topics kids care about</li>
              <li>• 🎵 Rhythm & Rhyme - Modern poems and verses with attitude</li>
              <li>• 😂 Laugh Zone - Jokes, funny stories, and silly situations</li>
              <li>• 🎭 Readers Theatre - Drama scripts with character roles</li>
            </ul>
            <p className="text-xs text-purple-500 italic mt-2">
              Perfect for students who have mastered fluency and want engaging content!
            </p>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-4">
            <h4 className="font-bold text-red-700 mb-2">🔤 Beginner Readers</h4>
            <p className="text-sm text-red-600 mb-2">
              A complete early reading system with 3 progressive levels for beginning readers.
            </p>
          </div>
          <div className="bg-white border border-orange-200 rounded-lg p-4">
            <h4 className="font-bold text-orange-700 mb-2">📖 Updated: Fluency Practice</h4>
            <p className="text-sm text-orange-600">
              Better level organization and comprehension question support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCornerTab;