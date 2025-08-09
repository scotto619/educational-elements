// components/tabs/CurriculumCornerTab.js - UPDATED WITH MATH WARMUP SUPPORT
import React, { useState } from 'react';

// Import activity components
import LiteracyWarmup from '../curriculum/literacy/LiteracyWarmup';
import ReadingComprehension from '../curriculum/literacy/ReadingComprehension';
import AreaPerimeterTool from '../curriculum/mathematics/AreaPerimeterTool';
import MathWarmup from '../curriculum/mathematics/MathWarmup';
// import SpellingBee from '../curriculum/literacy/SpellingBee';
// import NumbersBoard from '../curriculum/mathematics/NumbersBoard';
// import VirtualExperiments from '../curriculum/science/VirtualExperiments';
// ... import other activities as you create them

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
// SUBJECT CONFIGURATION - UPDATED WITH MATH WARMUP
// ===============================================
const subjects = [
  {
    id: 'literacy',
    name: 'Literacy',
    icon: '📚',
    color: 'from-blue-500 to-blue-600',
    description: 'Reading, writing, and language arts tools',
    activities: [
      {
        id: 'literacy-warmup',
        name: 'Literacy Warmup',
        icon: '🔥',
        description: 'Interactive phonics and sound recognition activities',
        component: LiteracyWarmup
      },
      {
        id: 'spelling-bee',
        name: 'Spelling Bee',
        icon: '🐝',
        description: 'Interactive spelling competitions and practice',
        component: ComingSoon
      },
      {
        id: 'reading-comprehension',
        name: 'Reading Comprehension',
        icon: '🧠',
        description: 'Text analysis and understanding activities',
        component: ReadingComprehension
      },
      {
        id: 'phonics-games',
        name: 'Phonics Games',
        icon: '🎮',
        description: 'Fun phonics games and activities',
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
        id: 'math-warmup',
        name: 'Math Warmup',
        icon: '🔥',
        description: 'Daily number activities and mathematical thinking',
        component: MathWarmup
      },
      {
        id: 'area-perimeter',
        name: 'Area & Perimeter',
        icon: '📐',
        description: 'Interactive tool for exploring area and perimeter concepts',
        component: AreaPerimeterTool
      },
      {
        id: 'numbers-board',
        name: 'Numbers Board',
        icon: '💯',
        description: 'Interactive hundreds board for number patterns',
        component: ComingSoon
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
        id: 'creative-writing',
        name: 'Creative Writing',
        icon: '✍️',
        description: 'Story writing prompts and tools',
        component: ComingSoon
      }
    ]
  }
];

// ===============================================
// MAIN CURRICULUM CORNER COMPONENT - UPDATED WITH FIREBASE SUPPORT
// ===============================================
const CurriculumCornerTab = ({ 
  students = [], 
  showToast = () => {},
  saveData = () => {},
  loadedData = {}
}) => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);

  const handleSubjectSelect = (subject) => {
    setActiveSubject(subject);
    setActiveActivity(null);
  };

  const handleActivitySelect = (activity) => {
    setActiveActivity(activity);
  };

  const handleBackToSubjects = () => {
    setActiveSubject(null);
    setActiveActivity(null);
  };

  const handleBackToActivities = () => {
    setActiveActivity(null);
  };

  // Render specific activity
  if (activeActivity) {
    const ActivityComponent = activeActivity.component;
    
    // Pass additional props to activities for Firebase saving
    const activityProps = {
      showToast,
      students
    };
    
    // Add Firebase save/load props for specific activities that need them
    if (activeActivity.id === 'literacy-warmup' || activeActivity.id === 'math-warmup') {
      activityProps.saveData = saveData;
      activityProps.loadedData = loadedData;
    }
    
    return (
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <button onClick={handleBackToSubjects} className="hover:text-blue-600 transition-colors">Curriculum Corner</button>
            <span>→</span>
            <button onClick={handleBackToActivities} className="hover:text-blue-600 transition-colors">{activeSubject.name}</button>
            <span>→</span>
            <span className="font-semibold text-gray-800">{activeActivity.name}</span>
          </div>
          <button onClick={handleBackToActivities} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">← Back to {activeSubject.name}</button>
        </div>

        {/* Activity Content */}
        <ActivityComponent {...activityProps} />
      </div>
    );
  }

  // Render activities for selected subject
  if (activeSubject) {
    return (
      <div className="space-y-6">
        {/* Subject Header */}
        <div className={`text-center bg-gradient-to-r ${activeSubject.color} text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden`}>
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
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{activity.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{activity.name}</h3>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${activity.component === ComingSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {activity.component === ComingSoon ? 'Coming Soon' : 'Available'}
                </span>
                <span className="text-blue-500 font-semibold">Open →</span>
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
      <div className="text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">📖</span>
            Curriculum Corner
            <span className="text-4xl ml-4 animate-bounce">🎓</span>
          </h2>
          <p className="text-xl opacity-90">Subject-based teaching tools for every classroom need</p>
        </div>
        
        {/* Floating decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🔬</div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🎨</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🌍</div>
      </div>

      {/* Subject Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Choose Your Subject Area</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => handleSubjectSelect(subject)}
              className="p-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 bg-white shadow-md hover:shadow-xl transition-all duration-300 text-center hover:scale-105 group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{subject.icon}</div>
              <h4 className="font-bold text-gray-800 text-lg mb-2">{subject.name}</h4>
              <p className="text-sm text-gray-600 leading-tight mb-4">{subject.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {subject.activities.length} tool{subject.activities.length !== 1 ? 's' : ''}
                </span>
                <span className="text-blue-500 font-semibold text-sm group-hover:text-blue-600">Enter →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Curriculum Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map(subject => {
            const availableTools = subject.activities.filter(activity => activity.component !== ComingSoon).length;
            const totalTools = subject.activities.length;
            
            return (
              <div key={subject.id} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-2">{subject.icon}</div>
                <div className="text-sm font-semibold text-gray-800">{subject.name}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {availableTools}/{totalTools} tools ready
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${subject.color}`}
                    style={{ width: `${(availableTools / totalTools) * 100}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Feature Notice for New Math Warmup */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">🔥</span>
          <div>
            <h4 className="font-bold text-green-800 mb-2">✨ New Math Warmup Added!</h4>
            <p className="text-green-700 mb-4">
              The Math Warmup includes progressive Number of the Day activities, mental math strategies that build over 10 weeks, 
              daily problem solving with hints, and interactive number practice tools!
            </p>
            <div className="bg-green-100 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 mb-2">🎯 What's Included:</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Number of the Day activities with progressive difficulty (5→1000)</li>
                <li>• Mental math strategies that build across weeks</li>
                <li>• Daily math problems with hints and explanations</li>
                <li>• Interactive number practice with random highlighting</li>
                <li>• Math facts of the day for engagement</li>
                <li>• Presentation mode for classroom display</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Feature Notice for Literacy Updates */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">🔥</span>
          <div>
            <h4 className="font-bold text-blue-800 mb-2">✨ Literacy Warmup Features!</h4>
            <p className="text-blue-700 mb-4">
              The Literacy Warmup includes daily activities with 5 reading passage activities, 4 daily grammar tasks, 
              daily riddles and fun facts, random graph practice, and Firebase-saved focus words!
            </p>
            <div className="bg-blue-100 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-2">🎯 What's Available:</h5>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Random 5+5 letter/digraph practice (increases complexity after week 5)</li>
                <li>• Larger, easier-to-read fonts throughout</li>
                <li>• 5 daily reading activities per passage</li>
                <li>• 4 daily grammar/punctuation tasks</li>
                <li>• 5 riddles and fun facts per week (one per day)</li>
                <li>• Editable focus words that save to Firebase</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Feature Notice */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">⭐</span>
          <div>
            <h4 className="font-bold text-yellow-800 mb-2">Unlock More Curriculum Tools</h4>
            <p className="text-yellow-700 mb-4">
              Get access to advanced teaching tools, more subject areas, and interactive activities with Classroom Champions PRO!
            </p>
            <button
              onClick={() => showToast('Upgrade feature coming soon!', 'info')}
              className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
            >
              Upgrade to PRO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurriculumCornerTab;