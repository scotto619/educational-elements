// LiteracyCompanion.js - Comprehensive Literacy Teaching Tool
import React, { useState } from 'react';
import PhonicsCenter from './literacy/PhonicsCenter';
import VocabularyCenter from './literacy/VocabularyCenter';
import ComprehensionCenter from './literacy/ComprehensionCenter';
import SpellingCenter from './literacy/SpellingCenter';
import FluencyCenter from './literacy/FluencyCenter';
import WritingCenter from './literacy/WritingCenter';
import GrammarCenter from './literacy/GrammarCenter';

const LiteracyCompanion = ({ showToast }) => {
  const [activeCenter, setActiveCenter] = useState('phonics');
  const [displayMode, setDisplayMode] = useState('teacher'); // 'teacher' or 'presentation'

  const literacyCenters = [
    {
      id: 'phonics',
      name: 'Phonics & Sounds',
      icon: '🔤',
      color: 'blue',
      description: 'Letter sounds, blends, digraphs, and phonemic awareness',
      component: PhonicsCenter
    },
    {
      id: 'vocabulary',
      name: 'Vocabulary',
      icon: '📖',
      color: 'green',
      description: 'Word meanings, synonyms, antonyms, and word building',
      component: VocabularyCenter
    },
    {
      id: 'comprehension',
      name: 'Reading Comprehension',
      icon: '🧠',
      color: 'purple',
      description: 'Reading strategies, questioning, and text analysis',
      component: ComprehensionCenter
    },
    {
      id: 'spelling',
      name: 'Spelling',
      icon: '✏️',
      color: 'orange',
      description: 'Spelling patterns, rules, and practice activities',
      component: SpellingCenter
    },
    {
      id: 'fluency',
      name: 'Reading Fluency',
      icon: '🎯',
      color: 'red',
      description: 'Reading rate, expression, and accuracy practice',
      component: FluencyCenter
    },
    {
      id: 'writing',
      name: 'Writing',
      icon: '✍️',
      color: 'indigo',
      description: 'Writing prompts, structures, and editing strategies',
      component: WritingCenter
    },
    {
      id: 'grammar',
      name: 'Grammar',
      icon: '📝',
      color: 'pink',
      description: 'Parts of speech, sentence structure, and language rules',
      component: GrammarCenter
    }
  ];

  const currentCenter = literacyCenters.find(center => center.id === activeCenter);
  const CurrentComponent = currentCenter?.component;

  const toggleDisplayMode = () => {
    setDisplayMode(prev => prev === 'teacher' ? 'presentation' : 'teacher');
    showToast(`Switched to ${displayMode === 'teacher' ? 'Presentation' : 'Teacher'} mode`, 'success');
  };

  if (displayMode === 'presentation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        {/* Presentation Mode Header */}
        <div className="bg-black/20 backdrop-blur p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{currentCenter?.icon}</span>
            <h1 className="text-3xl font-bold">{currentCenter?.name}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDisplayMode}
              className="px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-all font-bold"
            >
              📋 Teacher Mode
            </button>
            <div className="text-sm bg-white/10 px-3 py-1 rounded-full">
              Presentation Mode
            </div>
          </div>
        </div>

        {/* Full Screen Content */}
        <div className="p-8">
          {CurrentComponent && (
            <CurrentComponent 
              showToast={showToast} 
              displayMode="presentation"
              onCenterChange={setActiveCenter}
            />
          )}
        </div>

        {/* Presentation Mode Navigation */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/40 backdrop-blur rounded-2xl p-3 flex space-x-2">
            {literacyCenters.map(center => (
              <button
                key={center.id}
                onClick={() => setActiveCenter(center.id)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  activeCenter === center.id
                    ? `bg-${center.color}-500 text-white shadow-lg transform scale-110`
                    : 'bg-white/20 hover:bg-white/30 text-white/80'
                }`}
                title={center.name}
              >
                <span className="text-2xl">{center.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Teacher Mode (Normal View)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center">
              <span className="mr-3">📚</span>
              Literacy Companion
            </h2>
            <p className="text-blue-100 text-lg">
              Complete toolkit for literacy instruction and classroom displays
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDisplayMode}
              className="px-6 py-3 bg-white/20 backdrop-blur rounded-xl hover:bg-white/30 transition-all font-bold flex items-center space-x-2"
            >
              <span>📺</span>
              <span>Presentation Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Literacy Centers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {literacyCenters.map(center => (
          <button
            key={center.id}
            onClick={() => setActiveCenter(center.id)}
            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left hover:shadow-lg transform hover:scale-105 ${
              activeCenter === center.id
                ? `border-${center.color}-500 bg-${center.color}-50 shadow-lg scale-105`
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`text-4xl p-3 rounded-xl ${
                activeCenter === center.id 
                  ? `bg-${center.color}-100` 
                  : 'bg-gray-50'
              }`}>
                {center.icon}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg mb-2 ${
                  activeCenter === center.id ? `text-${center.color}-800` : 'text-gray-800'
                }`}>
                  {center.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {center.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Active Center Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[600px]">
        {CurrentComponent && (
          <CurrentComponent 
            showToast={showToast} 
            displayMode="teacher"
            onCenterChange={setActiveCenter}
          />
        )}
      </div>

      {/* Helper Information */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
        <h4 className="font-bold text-purple-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Literacy Companion Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-600 mt-1">📺</span>
              <div>
                <span className="font-bold">Presentation Mode:</span> Full-screen display perfect for projecting to your class
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-600 mt-1">🎯</span>
              <div>
                <span className="font-bold">Interactive Activities:</span> Click on elements to reveal information and engage students
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <span className="text-purple-600 mt-1">📱</span>
              <div>
                <span className="font-bold">Daily Use:</span> Each center includes daily warm-ups and focused lessons
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-purple-600 mt-1">🔄</span>
              <div>
                <span className="font-bold">Adaptive Content:</span> Activities adjust to different grade levels and abilities
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiteracyCompanion;