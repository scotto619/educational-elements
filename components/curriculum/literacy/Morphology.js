// components/curriculum/literacy/Morphology.js
import React, { useState } from 'react';
import MorphologyLevel1 from './morphology/MorphologyLevel1';

// Printable templates
const printableTemplates = {
  'compound-word-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Compound Word Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:30px 0}
.card{border:4px solid #333;border-radius:15px;padding:30px;text-align:center;min-height:200px}
.part1{background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%)}
.part2{background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)}
.compound{background:linear-gradient(135deg,#c3cfe2 0%,#c3cfe2 100%);border-width:5px}
.emoji{font-size:70px}
.word{font-size:32px;font-weight:bold;margin:10px 0}
h2{color:#4a148c;margin-top:40px}
</style></head><body>
<h1 style="text-align:center">🔤 Compound Word Picture Match Cards</h1>
<h2>Set 1: Rainbow 🌈</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">☔</div><div class="word">RAIN</div></div>
<div class="card part2"><div class="emoji">🎀</div><div class="word">BOW</div></div>
<div class="card compound"><div class="emoji">🌈</div><div class="word">RAINBOW</div></div>
</div>
<h2>Set 2: Sunshine ☀️</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">☀️</div><div class="word">SUN</div></div>
<div class="card part2"><div class="emoji">✨</div><div class="word">SHINE</div></div>
<div class="card compound"><div class="emoji">🌞</div><div class="word">SUNSHINE</div></div>
</div>
<h2>Set 3: Football ⚽</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">👣</div><div class="word">FOOT</div></div>
<div class="card part2"><div class="emoji">⚽</div><div class="word">BALL</div></div>
<div class="card compound"><div class="emoji">🏈</div><div class="word">FOOTBALL</div></div>
</div>
<h2>Set 4: Butterfly 🦋</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">🧈</div><div class="word">BUTTER</div></div>
<div class="card part2"><div class="emoji">🪰</div><div class="word">FLY</div></div>
<div class="card compound"><div class="emoji">🦋</div><div class="word">BUTTERFLY</div></div>
</div>
<h2>Set 5: Cupcake 🧁</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">☕</div><div class="word">CUP</div></div>
<div class="card part2"><div class="emoji">🎂</div><div class="word">CAKE</div></div>
<div class="card compound"><div class="emoji">🧁</div><div class="word">CUPCAKE</div></div>
</div>
<h2>Set 6: Bedroom 🛏️</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">🛏️</div><div class="word">BED</div></div>
<div class="card part2"><div class="emoji">🚪</div><div class="word">ROOM</div></div>
<div class="card compound"><div class="emoji">🏠</div><div class="word">BEDROOM</div></div>
</div>
</body></html>`;
  },
  
  'build-a-word-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Build-A-Word Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}
.card{border:4px dashed #333;border-radius:12px;padding:25px 15px;text-align:center;background:linear-gradient(135deg,#ffeaa7 0%,#fdcb6e 100%);min-height:100px;display:flex;align-items:center;justify-content:center}
.word{font-size:28px;font-weight:bold}
h2{color:#0984e3;margin-top:30px}
</style></head><body>
<h1 style="text-align:center">🏗️ Build-A-Word Station Cards</h1>
<h2>Word Cards - Set 1</h2>
<div class="card-grid">
<div class="card"><div class="word">SUN</div></div>
<div class="card"><div class="word">MOON</div></div>
<div class="card"><div class="word">STAR</div></div>
<div class="card"><div class="word">RAIN</div></div>
<div class="card"><div class="word">FISH</div></div>
<div class="card"><div class="word">BALL</div></div>
<div class="card"><div class="word">BOW</div></div>
<div class="card"><div class="word">LIGHT</div></div>
</div>
<h2>Word Cards - Set 2</h2>
<div class="card-grid">
<div class="card"><div class="word">FOOT</div></div>
<div class="card"><div class="word">BASKET</div></div>
<div class="card"><div class="word">CUP</div></div>
<div class="card"><div class="word">TOOTH</div></div>
<div class="card"><div class="word">CAKE</div></div>
<div class="card"><div class="word">BRUSH</div></div>
<div class="card"><div class="word">POP</div></div>
<div class="card"><div class="word">CORN</div></div>
</div>
<h2>Word Cards - Set 3</h2>
<div class="card-grid">
<div class="card"><div class="word">BED</div></div>
<div class="card"><div class="word">BATH</div></div>
<div class="card"><div class="word">CLASS</div></div>
<div class="card"><div class="word">PLAY</div></div>
<div class="card"><div class="word">ROOM</div></div>
<div class="card"><div class="word">GROUND</div></div>
<div class="card"><div class="word">MATE</div></div>
<div class="card"><div class="word">TIME</div></div>
</div>
<h2>Word Cards - Set 4</h2>
<div class="card-grid">
<div class="card"><div class="word">FIRE</div></div>
<div class="card"><div class="word">SNOW</div></div>
<div class="card"><div class="word">AIR</div></div>
<div class="card"><div class="word">WATER</div></div>
<div class="card"><div class="word">FLY</div></div>
<div class="card"><div class="word">MAN</div></div>
<div class="card"><div class="word">PLANE</div></div>
<div class="card"><div class="word">FALL</div></div>
</div>
</body></html>`;
  },
  
  'base-affix-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Base & Affix Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}
.base-card{border:5px solid #e74c3c;border-radius:12px;padding:30px 20px;text-align:center;background:linear-gradient(135deg,#ffeaa7 0%,#fdcb6e 100%);min-height:120px}
.affix-card{border:5px solid #3498db;border-radius:12px;padding:30px 20px;text-align:center;background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);min-height:120px}
.word{font-size:32px;font-weight:bold}
.emoji{font-size:35px}
h2{color:#e74c3c;margin-top:30px}
</style></head><body>
<h1 style="text-align:center">🎯 Base Words & Affixes Cards</h1>
<h2>❤️ Base Word Cards (RED borders)</h2>
<div class="card-grid">
<div class="base-card"><div class="emoji">🎮</div><div class="word">PLAY</div></div>
<div class="base-card"><div class="emoji">🦘</div><div class="word">JUMP</div></div>
<div class="base-card"><div class="emoji">🚶</div><div class="word">WALK</div></div>
<div class="base-card"><div class="emoji">🏃</div><div class="word">RUN</div></div>
<div class="base-card"><div class="emoji">🤝</div><div class="word">HELP</div></div>
<div class="base-card"><div class="emoji">👩‍🏫</div><div class="word">TEACH</div></div>
<div class="base-card"><div class="emoji">🎨</div><div class="word">PAINT</div></div>
<div class="base-card"><div class="emoji">🎤</div><div class="word">SING</div></div>
<div class="base-card"><div class="emoji">📖</div><div class="word">READ</div></div>
<div class="base-card"><div class="emoji">✏️</div><div class="word">WRITE</div></div>
<div class="base-card"><div class="emoji">😊</div><div class="word">SMILE</div></div>
<div class="base-card"><div class="emoji">🗣️</div><div class="word">TALK</div></div>
</div>
<h2 style="color:#3498db">💙 Affix Cards (BLUE borders)</h2>
<div class="card-grid">
<div class="affix-card"><div class="word">-ING</div><small>happening now</small></div>
<div class="affix-card"><div class="word">-ED</div><small>already happened</small></div>
<div class="affix-card"><div class="word">-ER</div><small>person who does</small></div>
<div class="affix-card"><div class="word">-S</div><small>more than one</small></div>
</div>
</body></html>`;
  },
  
  'word-train-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Word Part Train</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:15px;margin:20px 0}
.prefix-card{background:linear-gradient(135deg,#ff6b6b 0%,#ee5a6f 100%);border:5px solid #c92a2a;border-radius:12px;padding:25px 15px;text-align:center;min-height:100px}
.base-card{background:linear-gradient(135deg,#ffd93d 0%,#f6c23e 100%);border:5px solid #f59f00;border-radius:12px;padding:25px 15px;text-align:center;min-height:100px}
.suffix-card{background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);border:5px solid #5f3dc4;border-radius:12px;padding:25px 15px;text-align:center;min-height:100px}
.word{font-size:28px;font-weight:bold;color:white}
h2{margin-top:30px}
</style></head><body>
<h1 style="text-align:center">🚂 Word Part Train Cards</h1>
<h2>🔴 PREFIX Cards (RED)</h2>
<div class="card-grid">
<div class="prefix-card"><div class="word">UN-</div></div>
<div class="prefix-card"><div class="word">RE-</div></div>
<div class="prefix-card"><div class="word">UN-</div></div>
<div class="prefix-card"><div class="word">RE-</div></div>
<div class="prefix-card"><div class="word">UN-</div></div>
</div>
<h2>🟡 BASE WORD Cards (YELLOW)</h2>
<div class="card-grid">
<div class="base-card"><div class="word">HAPPY</div></div>
<div class="base-card"><div class="word">LOCK</div></div>
<div class="base-card"><div class="word">TIE</div></div>
<div class="base-card"><div class="word">PLAY</div></div>
<div class="base-card"><div class="word">DO</div></div>
<div class="base-card"><div class="word">READ</div></div>
<div class="base-card"><div class="word">KIND</div></div>
<div class="base-card"><div class="word">CARE</div></div>
<div class="base-card"><div class="word">HELP</div></div>
<div class="base-card"><div class="word">COLOR</div></div>
</div>
<h2>🟣 SUFFIX Cards (PURPLE)</h2>
<div class="card-grid">
<div class="suffix-card"><div class="word">-ING</div></div>
<div class="suffix-card"><div class="word">-ED</div></div>
<div class="suffix-card"><div class="word">-ER</div></div>
<div class="suffix-card"><div class="word">-FUL</div></div>
<div class="suffix-card"><div class="word">-LESS</div></div>
<div class="suffix-card"><div class="word">-ING</div></div>
<div class="suffix-card"><div class="word">-ED</div></div>
<div class="suffix-card"><div class="word">-FUL</div></div>
<div class="suffix-card"><div class="word">-LESS</div></div>
<div class="suffix-card"><div class="word">-S</div></div>
</div>
</body></html>`;
  },
  
  'color-the-parts': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Color the Word Parts</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;max-width:800px;margin:0 auto;padding:30px}
.word-box{border:3px solid #333;border-radius:10px;padding:20px;margin:20px 0;background:white}
.word-display{font-size:48px;font-weight:bold;text-align:center;letter-spacing:8px;padding:20px;background:#f8f9fa;border-radius:8px;margin:10px 0}
.instructions{background:#fff3cd;border:3px solid #ffc107;border-radius:10px;padding:15px;margin:20px 0}
h1{text-align:center}
</style></head><body>
<h1>🎨 Color the Word Parts</h1>
<div class="instructions">
<strong>Instructions:</strong> Color each part of the word:
<ul>
<li>Color the PREFIX <strong style="color:#ff6b6b">RED</strong></li>
<li>Color the BASE <strong style="color:#ffd93d">YELLOW</strong></li>
<li>Color the SUFFIX <strong style="color:#a29bfe">PURPLE</strong></li>
</ul>
</div>
<div class="word-box"><strong>1.</strong><div class="word-display">UNHAPPY</div></div>
<div class="word-box"><strong>2.</strong><div class="word-display">PLAYING</div></div>
<div class="word-box"><strong>3.</strong><div class="word-display">JUMPED</div></div>
<div class="word-box"><strong>4.</strong><div class="word-display">REPLAY</div></div>
<div class="word-box"><strong>5.</strong><div class="word-display">CAREFUL</div></div>
<div class="word-box"><strong>6.</strong><div class="word-display">HELPLESS</div></div>
<div class="word-box"><strong>7.</strong><div class="word-display">UNKIND</div></div>
<div class="word-box"><strong>8.</strong><div class="word-display">TEACHER</div></div>
</body></html>`;
  }
};

const Morphology = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showActivities, setShowActivities] = useState(false);

  // Download printable function
  const downloadPrintable = (printableId, activityTitle) => {
    if (!printableTemplates[printableId]) return;
    
    const htmlContent = printableTemplates[printableId]();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${printableId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="font-bold text-blue-800 text-sm mb-2">📦 Materials:</div>
                    <div className="text-sm text-blue-700">
                      {activity.materials.join(', ')}
                    </div>
                  </div>

                  {/* Printable Download Button */}
                  {activity.printable && (
                    <button
                      onClick={() => downloadPrintable(activity.printable, activity.title)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>📄</span>
                      Download Printable Materials
                    </button>
                  )}
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