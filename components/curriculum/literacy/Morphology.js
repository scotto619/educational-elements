// components/curriculum/literacy/Morphology.js
import React, { useState } from 'react';
import MorphologyLevel1 from './morphology/MorphologyLevel1';

const Morphology = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showActivities, setShowActivities] = useState(false);

  // Available levels
  const levels = [
    {
      level: 1,
      data: MorphologyLevel1,
      locked: false
    },
    {
      level: 2,
      title: 'Expanding Skills',
      description: 'Common prefixes and suffixes',
      ageRange: '6-7 years',
      locked: true
    },
    {
      level: 3,
      title: 'Advanced Patterns',
      description: 'Multiple affixes and word families',
      ageRange: '7-8 years',
      locked: true
    }
  ];

  const handleBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null);
      setCurrentSection(0);
      setShowActivities(false);
    } else if (selectedLevel) {
      setSelectedLevel(null);
    }
  };

  // Render level selection
  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-6xl font-bold mb-4 flex items-center justify-center">
                <span className="text-5xl mr-4">🔤</span>
                Morphology Master
                <span className="text-5xl ml-4">✨</span>
              </h1>
              <p className="text-2xl opacity-90 mb-2">Learn How Words Work!</p>
              <p className="text-lg opacity-75">Understanding prefixes, suffixes, and base words</p>
            </div>
          </div>
        </div>

        {/* Level Cards */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-purple-900 mb-6">Choose Your Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map((level) => (
              <button
                key={level.level}
                onClick={() => !level.locked && setSelectedLevel(level)}
                disabled={level.locked}
                className={`relative p-8 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                  level.locked
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                    : 'bg-white border-purple-400 hover:border-purple-600 hover:shadow-2xl cursor-pointer'
                }`}
              >
                {/* Level Badge */}
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full font-bold text-white text-lg ${
                  level.locked ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  Level {level.level}
                </div>

                <div className="mt-6 text-center">
                  {/* Icon/Emoji */}
                  <div className="text-6xl mb-4">
                    {level.locked ? '🔒' : level.data ? '🌟' : '⭐'}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2 text-purple-900">
                    {level.data ? level.data.levelInfo.title : level.title}
                  </h3>

                  {/* Age Range */}
                  <div className="text-sm text-purple-600 mb-3 font-semibold">
                    Ages {level.data ? level.data.levelInfo.ageRange : level.ageRange}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    {level.data ? level.data.levelInfo.description : level.description}
                  </p>

                  {/* Lesson Count */}
                  {level.data && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                      <div className="text-purple-800 font-bold">
                        📚 {level.data.lessons.length} Engaging Lessons
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {level.locked ? (
                    <div className="text-gray-500 text-sm mt-4">🔒 Coming Soon</div>
                  ) : (
                    <div className="text-purple-600 font-bold mt-4 text-lg">
                      Start Learning →
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-8 bg-white border-2 border-purple-300 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            What is Morphology?
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Morphology is the study of how words are built! It teaches students about <strong>base words</strong>,
            <strong> prefixes</strong> (parts added to the beginning), and <strong>suffixes</strong> (parts added to the end).
            Understanding morphology helps students decode unfamiliar words, spell better, and build their vocabulary naturally!
          </p>
        </div>
      </div>
    );
  }

  // Render lesson selection
  if (selectedLevel && !selectedLesson) {
    const levelData = selectedLevel.data;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 px-6 py-3 bg-white border-2 border-purple-400 rounded-xl font-bold text-purple-700 hover:bg-purple-50 transition-all flex items-center gap-2"
        >
          ← Back to Levels
        </button>

        {/* Level Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-75 mb-1">Level {selectedLevel.level}</div>
              <h2 className="text-4xl font-bold mb-2">{levelData.levelInfo.title}</h2>
              <p className="text-lg opacity-90">{levelData.levelInfo.description}</p>
              <p className="text-sm opacity-75 mt-2">Ages {levelData.levelInfo.ageRange}</p>
            </div>
            <div className="text-6xl">📖</div>
          </div>
        </div>

        {/* Lesson Cards */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-purple-900 mb-4">Select a Lesson</h3>
          <div className="grid grid-cols-1 gap-6">
            {levelData.lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                className="bg-white border-4 border-purple-300 rounded-2xl p-6 hover:border-purple-500 hover:shadow-xl transition-all text-left group"
              >
                <div className="flex items-start gap-6">
                  {/* Lesson Number Circle */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    {/* Title */}
                    <h4 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                      <span>{lesson.icon}</span>
                      {lesson.title}
                    </h4>

                    {/* Duration */}
                    <div className="text-purple-600 text-sm font-semibold mb-3">
                      ⏱️ {lesson.duration}
                    </div>

                    {/* Objectives */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
                      <div className="text-sm font-bold text-purple-800 mb-2">Learning Objectives:</div>
                      <ul className="text-sm text-purple-700 space-y-1">
                        {lesson.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-pink-500">✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Activities Count */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold">
                        🎯 {lesson.activities.length} Activities
                      </span>
                      <span className="text-purple-600 font-bold group-hover:text-purple-800">
                        Start Lesson →
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render lesson content
  if (selectedLesson) {
    const lesson = selectedLesson;
    const totalSections = lesson.teacherScript.length;
    const isLastSection = currentSection >= totalSections - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 px-6 py-3 bg-white border-2 border-purple-400 rounded-xl font-bold text-purple-700 hover:bg-purple-50 transition-all flex items-center gap-2"
        >
          ← Back to Lesson Selection
        </button>

        {!showActivities ? (
          <>
            {/* Lesson Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{lesson.icon}</div>
                  <div>
                    <div className="text-sm opacity-75">Lesson {lesson.id}</div>
                    <h2 className="text-3xl font-bold">{lesson.title}</h2>
                    <div className="text-sm opacity-90 mt-1">⏱️ {lesson.duration}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-75 mb-1">Progress</div>
                  <div className="text-2xl font-bold">{currentSection + 1} / {totalSections}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Info Panel */}
            <div className="bg-white border-2 border-purple-300 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Materials Needed */}
                <div>
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>📦</span> Materials Needed
                  </h4>
                  <ul className="space-y-2">
                    {lesson.materials.map((material, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Objectives */}
                <div>
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>🎯</span> Learning Objectives
                  </h4>
                  <ul className="space-y-2">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border-4 border-purple-400 rounded-2xl p-8 mb-6 shadow-xl">
              {/* Section Header */}
              <div className="mb-6 pb-4 border-b-2 border-purple-200">
                <h3 className="text-3xl font-bold text-purple-900 mb-2">
                  {lesson.teacherScript[currentSection].section}
                </h3>
                <div className="text-purple-600 text-sm font-semibold">
                  Section {currentSection + 1} of {totalSections}
                </div>
              </div>

              {/* Teacher Script */}
              <div className="prose max-w-none">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                  <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {lesson.teacherScript[currentSection].content}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  currentSection === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg'
                }`}
              >
                ← Previous Section
              </button>

              {!isLastSection ? (
                <button
                  onClick={() => setCurrentSection(currentSection + 1)}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                >
                  Next Section →
                </button>
              ) : (
                <button
                  onClick={() => setShowActivities(true)}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all animate-pulse"
                >
                  View Activities 🎯
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Activities View */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span>🎯</span>
                Activity Time!
              </h2>
              <p className="text-lg opacity-90">Hands-on practice activities for {lesson.title}</p>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {lesson.activities.map((activity, index) => (
                <div key={index} className="bg-white border-4 border-green-300 rounded-2xl p-6 hover:border-green-500 transition-all shadow-lg">
                  {/* Activity Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-green-900 mb-2">{activity.title}</h4>
                      <div className="text-green-600 text-sm font-semibold mb-2">
                        ⏱️ {activity.duration}
                      </div>
                      <p className="text-gray-700">{activity.description}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="font-bold text-green-800 mb-2">📋 Instructions:</div>
                    <ol className="space-y-2">
                      {activity.instructions.map((instruction, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="font-bold text-green-500 min-w-[20px]">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Materials */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="font-bold text-blue-800 text-sm mb-2">📦 Materials:</div>
                    <div className="text-sm text-blue-700">
                      {activity.materials.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Assessment Section */}
            {lesson.assessment && (
              <div className="bg-white border-4 border-yellow-300 rounded-2xl p-6 mb-6 shadow-lg">
                <h3 className="text-2xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Assessment & Checking Understanding
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Formative Assessment */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-3">🔍 What to Look For:</h4>
                    <ul className="space-y-2">
                      {lesson.assessment.formative.map((item, i) => (
                        <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Questions to Ask */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-3">💬 Questions to Ask Students:</h4>
                    <ul className="space-y-2">
                      {lesson.assessment.questions.map((question, i) => (
                        <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Exit Ticket if exists */}
                {lesson.assessment.exitTicket && (
                  <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">🎫 Exit Ticket:</h4>
                    <p className="text-purple-700">{lesson.assessment.exitTicket}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowActivities(false)}
                className="px-8 py-4 bg-purple-500 text-white rounded-xl font-bold text-lg hover:bg-purple-600 shadow-lg transition-all"
              >
                ← Back to Lesson
              </button>

              <button
                onClick={handleBack}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
              >
                Complete Lesson ✓
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default Morphology;