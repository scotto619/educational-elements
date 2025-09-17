// components/tabs/CurriculumCornerTab.js - UPDATED WITH INTERACTIVE ANGLES
import React, { useState } from 'react';

// Import all activity components (including the new one)
import LiteracyWarmup from '../curriculum/literacy/LiteracyWarmup';
import PrepLiteracyWarmup from '../curriculum/literacy/PrepLiteracyWarmUp';
import ReadingComprehension from '../curriculum/literacy/ReadingComprehension';
import VisualWritingPrompts from '../curriculum/literacy/VisualWritingPrompts';
import SpellingProgram from '../curriculum/literacy/SpellingProgram';
import FluencyPractice from '../curriculum/literacy/FluencyPractice';
import BeginnerReaders from '../curriculum/literacy/BeginnerReaders';
import ReadingForFun from '../curriculum/literacy/ReadingForFun';
import ReadersTheatre from '../curriculum/literacy/ReadersTheatre';
import AreaPerimeterTool from '../curriculum/mathematics/AreaPerimeterTool';
import MathWarmup from '../curriculum/mathematics/MathWarmup';
import WorksheetGenerator from '../curriculum/mathematics/WorksheetGenerator';
import NumbersBoard from '../curriculum/mathematics/NumbersBoard';
import MathMentals from '../curriculum/mathematics/MathMentals';
import InteractiveClock from '../curriculum/mathematics/InteractiveClock';
import InteractiveAngles from '../curriculum/mathematics/InteractiveAngles'; // NEW IMPORT

// ... (keep all existing ComingSoon and other code the same until the mathematics section)

const subjects = [
  {
    id: 'literacy',
    name: 'Literacy & Language Arts',
    icon: '📚',
    color: 'from-blue-500 to-purple-600',
    description: 'Complete literacy toolkit: phonics, spelling, reading, writing, drama & vocabulary',
    activities: [
      // ... (keep all existing literacy activities)
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
        id: 'interactive-angles',  // NEW ACTIVITY - PUT IT FIRST TO HIGHLIGHT IT
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
  // ... (keep all other subjects the same)
];

// ... (rest of the component remains exactly the same)

// UPDATE: Add interactive-angles to the Firebase activities list in renderContent
if (activeActivity.id === 'literacy-warmup' || 
    activeActivity.id === 'math-warmup' || 
    activeActivity.id === 'spelling-program' ||
    activeActivity.id === 'fluency-practice' ||
    activeActivity.id === 'math-mentals' ||
    activeActivity.id === 'interactive-clock' ||
    activeActivity.id === 'interactive-angles' ||  // ADD THIS LINE
    activeActivity.id === 'beginner-readers' ||
    activeActivity.id === 'reading-for-fun' ||
    activeActivity.id === 'readers-theatre') {
  activityProps.saveData = saveData;
  activityProps.loadedData = loadedData;
}

// ... (rest of component stays the same)

// UPDATE the "What's New" section to highlight the angles tool:
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
    {/* Keep existing new items */}
  </div>
</div>

export default CurriculumCornerTab;