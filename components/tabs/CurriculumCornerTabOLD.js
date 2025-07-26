// CurriculumCornerTab.js - Complete Subject-Based Educational Tools
import React, { useState } from 'react';

// Import all educational components
import LiteracyCompanion from '../LiteracyCompanion';
import WordStudy from '../WordStudy';
import HundredsBoard from '../HundredsBoard';
import NumberMat from '../NumberMat';
import DiceRoller from '../DiceRoller';
import GeographyTab from './GeographyTab';

const CurriculumCornerTab = ({ 
  students, 
  showToast,
  userData,
  saveGroupDataToFirebase,
  saveClassroomDataToFirebase,
  saveVocabularyDataToFirebase,
  currentClassId,
  // All props needed for GeographyTab
  handleAwardXP,
  setStudents,
  saveStudentsToFirebase,
  // All other props to pass through
  ...otherProps
}) => {
  const [activeSubject, setActiveSubject] = useState('literacy');
  const [activeSubjectTool, setActiveSubjectTool] = useState('literacy-companion');

  // Define subject areas and their tools
  const subjects = [
    {
      id: 'literacy',
      name: 'Literacy',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      description: 'Reading, writing, and language arts tools',
      tools: [
        {
          id: 'literacy-companion',
          name: 'Literacy Companion',
          icon: '📖',
          description: 'Complete literacy teaching system',
          component: LiteracyCompanion
        },
        {
          id: 'word-study',
          name: 'Word Study',
          icon: '🔤',
          description: 'Interactive word analysis tools',
          component: WordStudy
        }
      ]
    },
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: '🔢',
      color: 'from-green-500 to-green-600',
      description: 'Math tools and number activities',
      tools: [
        {
          id: 'hundreds-board',
          name: 'Numbers Board',
          icon: '💯',
          description: 'Interactive hundreds board',
          component: HundredsBoard
        },
        {
          id: 'number-mat',
          name: 'Number Mat',
          icon: '🧮',
          description: 'Visual number learning tool',
          component: NumberMat
        },
        {
          id: 'dice-roller',
          name: 'Dice Roller',
          icon: '🎲',
          description: 'Digital dice for math activities',
          component: DiceRoller
        }
      ]
    },
    {
      id: 'geography',
      name: 'Geography',
      icon: '🌍',
      color: 'from-purple-500 to-purple-600',
      description: 'World geography exploration',
      tools: [
        {
          id: 'geography-explorer',
          name: 'Geography Explorer',
          icon: '🗺️',
          description: 'Interactive world geography learning',
          component: GeographyTab
        }
      ]
    },
    {
      id: 'science',
      name: 'Science',
      icon: '🔬',
      color: 'from-orange-500 to-orange-600',
      description: 'Science exploration and experiments',
      tools: [
        {
          id: 'coming-soon-science',
          name: 'Science Tools',
          icon: '⚗️',
          description: 'Interactive science activities',
          component: null // Placeholder for future science tools
        }
      ]
    },
    {
      id: 'social-studies',
      name: 'Social Studies',
      icon: '🏛️',
      color: 'from-red-500 to-red-600',
      description: 'History, civics, and culture',
      tools: [
        {
          id: 'coming-soon-social',
          name: 'History Explorer',
          icon: '📜',
          description: 'Historical timelines and events',
          component: null // Placeholder for future social studies tools
        }
      ]
    },
    {
      id: 'arts',
      name: 'Arts & Creativity',
      icon: '🎨',
      color: 'from-pink-500 to-pink-600',
      description: 'Creative expression and arts',
      tools: [
        {
          id: 'coming-soon-arts',
          name: 'Art Studio',
          icon: '🖌️',
          description: 'Digital art and creativity tools',
          component: null // Placeholder for future arts tools
        }
      ]
    }
  ];

  // Get current subject and tool
  const currentSubject = subjects.find(s => s.id === activeSubject);
  const currentTool = currentSubject?.tools.find(t => t.id === activeSubjectTool);

  // Handle subject change
  const handleSubjectChange = (subjectId) => {
    setActiveSubject(subjectId);
    const subject = subjects.find(s => s.id === subjectId);
    if (subject && subject.tools.length > 0) {
      setActiveSubjectTool(subject.tools[0].id);
    }
  };

  // Coming Soon Component for placeholder tools
  const ComingSoon = ({ toolName, subjectName }) => (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{toolName}</h3>
      <p className="text-gray-600 mb-6">
        Exciting {subjectName.toLowerCase()} tools are being developed and will be available soon!
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
        <h4 className="font-bold text-blue-800 mb-2">🌟 What's Coming:</h4>
        <ul className="text-blue-700 text-sm text-left space-y-1">
          <li>• Interactive learning activities</li>
          <li>• Student progress tracking</li>
          <li>• XP and rewards integration</li>
          <li>• Engaging visual content</li>
        </ul>
      </div>
      <p className="text-gray-500 mt-6 text-sm">
        💡 Have suggestions for {subjectName.toLowerCase()} tools? Send us feedback!
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map(subject => (
            <button
              key={subject.id}
              onClick={() => handleSubjectChange(subject.id)}
              className={`p-6 rounded-xl border-2 transition-all duration-300 text-center hover:scale-105 ${
                activeSubject === subject.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 bg-white shadow-md'
              }`}
            >
              <div className="text-4xl mb-3">{subject.icon}</div>
              <h4 className="font-bold text-gray-800 text-sm mb-2">{subject.name}</h4>
              <p className="text-xs text-gray-600 leading-tight">{subject.description}</p>
              <div className="mt-3 text-xs text-gray-500">
                {subject.tools.length} tool{subject.tools.length !== 1 ? 's' : ''}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Tools */}
      {currentSubject && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Subject Header */}
          <div className={`bg-gradient-to-r ${currentSubject.color} text-white p-6`}>
            <div className="flex items-center space-x-4">
              <div className="text-5xl">{currentSubject.icon}</div>
              <div>
                <h3 className="text-3xl font-bold">{currentSubject.name}</h3>
                <p className="text-lg opacity-90">{currentSubject.description}</p>
              </div>
            </div>
          </div>

          {/* Tools Navigation */}
          {currentSubject.tools.length > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {currentSubject.tools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveSubjectTool(tool.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      activeSubjectTool === tool.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span>{tool.icon}</span>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tool Content */}
          <div className="p-6">
            {currentTool && currentTool.component ? (
              <>
                {/* Tool Header */}
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{currentTool.icon}</span>
                    <h4 className="text-2xl font-bold text-gray-800">{currentTool.name}</h4>
                  </div>
                  <p className="text-gray-600">{currentTool.description}</p>
                </div>

                {/* Render the actual component */}
                <currentTool.component
                  students={students}
                  showToast={showToast}
                  userData={userData}
                  saveGroupDataToFirebase={saveGroupDataToFirebase}
                  saveClassroomDataToFirebase={saveClassroomDataToFirebase}
                  saveVocabularyDataToFirebase={saveVocabularyDataToFirebase}
                  currentClassId={currentClassId}
                  handleAwardXP={handleAwardXP}
                  setStudents={setStudents}
                  saveStudentsToFirebase={saveStudentsToFirebase}
                  {...otherProps}
                />
              </>
            ) : (
              <ComingSoon 
                toolName={currentTool?.name || 'New Tools'} 
                subjectName={currentSubject.name}
              />
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Curriculum Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {subjects.map(subject => {
            const availableTools = subject.tools.filter(tool => tool.component !== null).length;
            const totalTools = subject.tools.length;
            
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

      {/* Pro Feature Notice */}
      {userData?.subscription !== 'pro' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">⭐</span>
            <div>
              <h4 className="font-bold text-yellow-800 mb-2">Unlock More Curriculum Tools</h4>
              <p className="text-yellow-700 mb-4">
                Get access to advanced teaching tools, unlimited classes, and new subject areas with Classroom Champions PRO!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-700 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span>🔬</span>
                    <span>Interactive Science Experiments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🎨</span>
                    <span>Digital Art & Music Studio</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📜</span>
                    <span>Historical Timeline Builder</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span>🌐</span>
                    <span>Extended Geography Adventures</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span>Advanced Analytics Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>🎯</span>
                    <span>Custom Learning Pathways</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.open('/pricing', '_blank')}
                className="mt-4 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold text-sm"
              >
                Upgrade to PRO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumCornerTab;