// components/student/StudentReading.js - UPDATED WITH BEGINNER READERS SUPPORT
import React, { useState, useEffect } from 'react';

// Import reading passages from the actual passage files
import { LEVEL_1_PASSAGES } from '../curriculum/literacy/passages/Level1Passages';
import { LEVEL_2_PASSAGES_1 } from '../curriculum/literacy/passages/Level2Passages1';
import { LEVEL_2_PASSAGES_2 } from '../curriculum/literacy/passages/Level2Passages2';
import { LEVEL_2_PASSAGES_3 } from '../curriculum/literacy/passages/Level2Passages3';
import { LEVEL_2_PASSAGES_4 } from '../curriculum/literacy/passages/Level2Passages4';
import { LEVEL_2_PASSAGES_5 } from '../curriculum/literacy/passages/Level2Passages5';
import { LEVEL_2_PASSAGES_6 } from '../curriculum/literacy/passages/Level2Passages6';
import { LEVEL_2_PASSAGES_7 } from '../curriculum/literacy/passages/Level2Passages7';
import { LEVEL_2_PASSAGES_8 } from '../curriculum/literacy/passages/Level2Passages8';
import { LEVEL_2_PASSAGES_9 } from '../curriculum/literacy/passages/Level2Passages9';
import { LEVEL_2_PASSAGES_10 } from '../curriculum/literacy/passages/Level2Passages10';
import { LEVEL_3_PASSAGES_1 } from '../curriculum/literacy/passages/Level3Passages1';
import { LEVEL_3_PASSAGES_2 } from '../curriculum/literacy/passages/Level3Passages2';
import { LEVEL_3_PASSAGES_3 } from '../curriculum/literacy/passages/Level3Passages3';
import { LEVEL_3_PASSAGES_4 } from '../curriculum/literacy/passages/Level3Passages4';
import { LEVEL_3_PASSAGES_5 } from '../curriculum/literacy/passages/Level3Passages5';
import { LEVEL_3_PASSAGES_6 } from '../curriculum/literacy/passages/Level3Passages6';
import { LEVEL_3_PASSAGES_7 } from '../curriculum/literacy/passages/Level3Passages7';
import { LEVEL_3_PASSAGES_8 } from '../curriculum/literacy/passages/Level3Passages8';
import { LEVEL_3_PASSAGES_9 } from '../curriculum/literacy/passages/Level3Passages9';
import { LEVEL_3_PASSAGES_10 } from '../curriculum/literacy/passages/Level3Passages10';
import { LEVEL_3_PASSAGES_11 } from '../curriculum/literacy/passages/Level3Passages11';
import { LEVEL_3_PASSAGES_12 } from '../curriculum/literacy/passages/Level3Passages12';
import { LEVEL_3_PASSAGES_13 } from '../curriculum/literacy/passages/Level3Passages13';
import { LEVEL_4_PASSAGES_1 } from '../curriculum/literacy/passages/Level4Passages1';
import { LEVEL_4_PASSAGES_2 } from '../curriculum/literacy/passages/Level4Passages2';
import { LEVEL_4_PASSAGES_3 } from '../curriculum/literacy/passages/Level4Passages3';
import { LEVEL_4_PASSAGES_4 } from '../curriculum/literacy/passages/Level4Passages4';
import { LEVEL_4_PASSAGES_5 } from '../curriculum/literacy/passages/Level4Passages5';
import { LEVEL_4_PASSAGES_6 } from '../curriculum/literacy/passages/Level4Passages6';
import { LEVEL_4_PASSAGES_7 } from '../curriculum/literacy/passages/Level4Passages7';
import { LEVEL_4_PASSAGES_8 } from '../curriculum/literacy/passages/Level4Passages8';
import { LEVEL_4_PASSAGES_9 } from '../curriculum/literacy/passages/Level4Passages9';
import { LEVEL_4_PASSAGES_10 } from '../curriculum/literacy/passages/Level4Passages10';
import { LEVEL_4_PASSAGES_11 } from '../curriculum/literacy/passages/Level4Passages11';
import { LEVEL_4_PASSAGES_12 } from '../curriculum/literacy/passages/Level4Passages12';
import { LEVEL_4_PASSAGES_13 } from '../curriculum/literacy/passages/Level4Passages13';

// Import beginner reading sounds
import { BEGINNER_LEVEL_1_SOUNDS } from '../curriculum/literacy/beginnerReaders/BeginnerLevel1Sounds';
import { BEGINNER_LEVEL_2_SOUNDS } from '../curriculum/literacy/beginnerReaders/BeginnerLevel2Sounds';
import { BEGINNER_LEVEL_3_SOUNDS } from '../curriculum/literacy/beginnerReaders/BeginnerLevel3Sounds';

// Consolidated reading passages from all levels
const READING_PASSAGES = [
  ...LEVEL_1_PASSAGES,
  ...LEVEL_2_PASSAGES_1,
  ...LEVEL_2_PASSAGES_2,
  ...LEVEL_2_PASSAGES_3,
  ...LEVEL_2_PASSAGES_4,
  ...LEVEL_2_PASSAGES_5,
  ...LEVEL_2_PASSAGES_6,
  ...LEVEL_2_PASSAGES_7,
  ...LEVEL_2_PASSAGES_8,
  ...LEVEL_2_PASSAGES_9,
  ...LEVEL_2_PASSAGES_10,
  ...LEVEL_3_PASSAGES_1,
  ...LEVEL_3_PASSAGES_2,
  ...LEVEL_3_PASSAGES_3,
  ...LEVEL_3_PASSAGES_4,
  ...LEVEL_3_PASSAGES_5,
  ...LEVEL_3_PASSAGES_6,
  ...LEVEL_3_PASSAGES_7,
  ...LEVEL_3_PASSAGES_8,
  ...LEVEL_3_PASSAGES_9,
  ...LEVEL_3_PASSAGES_10,
  ...LEVEL_3_PASSAGES_11,
  ...LEVEL_3_PASSAGES_12,
  ...LEVEL_3_PASSAGES_13,
  ...LEVEL_4_PASSAGES_1,
  ...LEVEL_4_PASSAGES_2,
  ...LEVEL_4_PASSAGES_3,
  ...LEVEL_4_PASSAGES_4,
  ...LEVEL_4_PASSAGES_5,
  ...LEVEL_4_PASSAGES_6,
  ...LEVEL_4_PASSAGES_7,
  ...LEVEL_4_PASSAGES_8,
  ...LEVEL_4_PASSAGES_9,
  ...LEVEL_4_PASSAGES_10,
  ...LEVEL_4_PASSAGES_11,
  ...LEVEL_4_PASSAGES_12,
  ...LEVEL_4_PASSAGES_13
];

// Consolidated beginner sounds
const BEGINNER_SOUNDS = [
  ...BEGINNER_LEVEL_1_SOUNDS,
  ...BEGINNER_LEVEL_2_SOUNDS,
  ...BEGINNER_LEVEL_3_SOUNDS
];

const TEXT_TYPES = [
  { 
    id: "narrative", 
    name: "Story", 
    icon: "📖", 
    color: "bg-blue-500", 
    description: "Stories with characters and events" 
  },
  { 
    id: "informational", 
    name: "Information", 
    icon: "📊", 
    color: "bg-green-500", 
    description: "Facts and information to learn" 
  },
  { 
    id: "persuasive", 
    name: "Persuasive", 
    icon: "💭", 
    color: "bg-orange-500", 
    description: "Texts that try to convince you" 
  },
  { 
    id: "poetry", 
    name: "Poetry", 
    icon: "🎭", 
    color: "bg-purple-500", 
    description: "Poems and rhymes" 
  }
];

const StudentReading = ({ 
  studentData, 
  classData, 
  showToast 
}) => {
  const [studentAssignments, setStudentAssignments] = useState(null);
  const [beginnerAssignments, setBeginnerAssignments] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [selectedSound, setSelectedSound] = useState(null);
  const [readingMode, setReadingMode] = useState('practice'); // 'practice' or 'full'
  const [activeTab, setActiveTab] = useState('auto'); // 'auto', 'fluency', 'beginner'

  useEffect(() => {
    if (studentData && classData) {
      findStudentAssignments();
      findBeginnerAssignments();
    }
  }, [studentData, classData]);

  useEffect(() => {
    // Auto-determine which tab to show based on assignments
    if (beginnerAssignments && beginnerAssignments.sounds.length > 0) {
      setActiveTab('beginner');
    } else if (studentAssignments && studentAssignments.texts.length > 0) {
      setActiveTab('fluency');
    } else {
      setActiveTab('auto');
    }
  }, [studentAssignments, beginnerAssignments]);

  const findStudentAssignments = () => {
    // Get fluency groups from class toolkit data
    const fluencyGroups = classData?.toolkitData?.fluencyGroups || [];
    
    // Find which group this student belongs to
    const studentGroup = fluencyGroups.find(group => 
      group.students.some(s => s.id === studentData.id)
    );

    if (studentGroup) {
      // Get assigned reading texts
      const assignedTexts = [];
      
      studentGroup.assignedTexts.forEach(textId => {
        const [levelId, textType] = textId.split('-');
        // Find passage from imported data
        const passage = READING_PASSAGES.find(p => p.id === levelId);
        if (passage) {
          const text = passage.texts.find(t => t.type === textType);
          if (text) {
            assignedTexts.push({
              id: textId,
              passage: passage,
              text: text,
              textType: TEXT_TYPES.find(t => t.id === textType)
            });
          }
        }
      });

      setStudentAssignments({
        groupName: studentGroup.name,
        groupColor: studentGroup.color,
        texts: assignedTexts
      });
    } else {
      setStudentAssignments(null);
    }
  };

  const findBeginnerAssignments = () => {
    // Get beginner groups from class toolkit data
    const beginnerGroups = classData?.toolkitData?.beginnerGroups || [];
    
    // Find which group this student belongs to
    const studentGroup = beginnerGroups.find(group => 
      group.students.some(s => s.id === studentData.id)
    );

    if (studentGroup) {
      // Get assigned sounds
      const assignedSounds = [];
      
      studentGroup.assignedSounds.forEach(soundId => {
        const sound = BEGINNER_SOUNDS.find(s => s.id === soundId);
        if (sound) {
          assignedSounds.push({
            id: soundId,
            sound: sound
          });
        }
      });

      setBeginnerAssignments({
        groupName: studentGroup.name,
        groupColor: studentGroup.color,
        sounds: assignedSounds
      });
    } else {
      setBeginnerAssignments(null);
    }
  };

  // Render selected sound practice
  if (selectedSound) {
    return (
      <div className="space-y-6">
        {/* Sound Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{selectedSound.sound.title} {selectedSound.sound.image}</h1>
              <p className="text-lg opacity-90">{selectedSound.sound.description}</p>
              <p className="text-sm opacity-80">{selectedSound.sound.soundFocus}</p>
            </div>
            <button
              onClick={() => setSelectedSound(null)}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              ← Back to My Sounds
            </button>
          </div>
        </div>

        {/* Sound Practice Activities */}
        <div className="space-y-4">
          {selectedSound.sound.practices.map((practice, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">{practice.instructions}</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="text-2xl md:text-4xl leading-relaxed text-gray-800 text-center font-bold font-mono">
                  {practice.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Passage for Level 3 */}
        {selectedSound.sound.simplePassage && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">📖 Reading Practice</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-4">
              <h4 className="text-lg font-bold text-blue-800 mb-4 text-center">{selectedSound.sound.simplePassage.title}</h4>
              <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                {selectedSound.sound.simplePassage.content}
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="text-lg font-bold text-green-800 mb-3">🤔 Think About It:</h4>
              <ul className="space-y-2">
                {selectedSound.sound.simplePassage.comprehensionQuestions.map((question, index) => (
                  <li key={index} className="text-green-700">• {question}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Focus Words */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎯 Focus Words</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {selectedSound.sound.targetWords.map(word => (
              <span key={word} className="bg-red-200 border-2 border-red-400 px-4 py-2 rounded-lg text-lg font-bold text-gray-800">
                {word}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            Practice reading these words!
          </p>
        </div>

        {/* Daily Practice Guide */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📅 How to Practice</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">👀</div>
              <h4 className="font-bold text-blue-800 mb-2">Step 1: Look</h4>
              <p className="text-sm text-blue-700">Look at each sound and say it out loud</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔊</div>
              <h4 className="font-bold text-green-800 mb-2">Step 2: Practice</h4>
              <p className="text-sm text-green-700">Practice the sounds and words</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">📖</div>
              <h4 className="font-bold text-purple-800 mb-2">Step 3: Read</h4>
              <p className="text-sm text-purple-700">Try reading with the focus words</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render selected text (same as before for fluency practice)
  if (selectedText) {
    return (
      <div className="space-y-6">
        {/* Reading Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{selectedText.text.title}</h1>
              <p className="text-lg opacity-90">{selectedText.passage.level} - {selectedText.textType.name}</p>
              <p className="text-sm opacity-80">{selectedText.text.wordCount} words</p>
            </div>
            <button
              onClick={() => setSelectedText(null)}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              ← Back to My Reading
            </button>
          </div>
        </div>

        {/* Reading Mode Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setReadingMode('practice')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                readingMode === 'practice' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📖 Practice Mode
            </button>
            <button
              onClick={() => setReadingMode('full')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                readingMode === 'full' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📄 Full Screen Reading
            </button>
          </div>
        </div>

        {/* Focus Words */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎯 Focus Words</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {selectedText.passage.targetWords.map(word => (
              <span key={word} className="bg-yellow-200 border-2 border-yellow-400 px-4 py-2 rounded-lg text-lg font-bold text-gray-800">
                {word}
              </span>
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-3">
            Look for these words while you read!
          </p>
        </div>

        {/* Reading Text */}
        <div className={`bg-white rounded-xl shadow-lg ${
          readingMode === 'full' ? 'p-8 md:p-12' : 'p-6'
        }`}>
          <div className={`${selectedText.textType.color} text-white p-4 rounded-lg mb-6 text-center`}>
            <div className="text-3xl mb-2">{selectedText.textType.icon}</div>
            <h3 className="text-xl font-bold">{selectedText.textType.name}</h3>
            <p className="text-sm opacity-90">{selectedText.textType.description}</p>
          </div>
          
          <div className={`bg-gray-50 border-2 border-gray-200 rounded-xl p-6 ${
            readingMode === 'full' ? 'md:p-12' : 'md:p-8'
          }`}>
            <div className={`text-gray-800 whitespace-pre-wrap font-serif leading-relaxed ${
              readingMode === 'full' 
                ? 'text-xl md:text-3xl text-center' 
                : 'text-lg md:text-xl'
            }`}>
              {selectedText.text.content}
            </div>
          </div>
        </div>

        {/* Daily Activities - same as before */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📅 5-Day Reading Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-bold text-red-800 mb-2">Day 1</h4>
                <p className="text-sm text-red-700 font-semibold mb-2">Read to a Partner</p>
                <p className="text-xs text-red-600">Take turns reading the passage to each other in a clear voice. The partner not reading should follow along pointing at the words being read.</p>
              </div>
            </div>
            
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🔍</div>
                <h4 className="font-bold text-orange-800 mb-2">Day 2</h4>
                <p className="text-sm text-orange-700 font-semibold mb-2">Find Focus Words</p>
                <p className="text-xs text-orange-600">After reading to a partner, find each of the focus words in the text. Are there any other words that have a similar pattern?</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">❓</div>
                <h4 className="font-bold text-yellow-800 mb-2">Day 3</h4>
                <p className="text-sm text-yellow-700 font-semibold mb-2">Answer Questions</p>
                <p className="text-xs text-yellow-600">After reading to a partner, complete the comprehension questions.</p>
                <p className="text-xs text-yellow-500 italic mt-1">(Coming soon)</p>
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <h4 className="font-bold text-green-800 mb-2">Day 4</h4>
                <p className="text-sm text-green-700 font-semibold mb-2">Summarize</p>
                <p className="text-xs text-green-600">After reading to a partner, summarize the text in your own words. What were the main ideas?</p>
              </div>
            </div>
            
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎨</div>
                <h4 className="font-bold text-blue-800 mb-2">Day 5</h4>
                <p className="text-sm text-blue-700 font-semibold mb-2">Draw a Picture</p>
                <p className="text-xs text-blue-600">After reading to a partner, draw a picture that relates to the passage. Show the main idea or your favorite part.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
            <p className="text-sm text-purple-700">
              💡 <strong>Remember:</strong> Every day starts with reading to a partner first!
            </p>
          </div>
        </div>

        {/* Reading Tips */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📚 Reading Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">👀</div>
              <h4 className="font-bold text-blue-800 mb-2">Look Carefully</h4>
              <p className="text-sm text-blue-700">Read each word slowly and carefully</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔊</div>
              <h4 className="font-bold text-green-800 mb-2">Read Aloud</h4>
              <p className="text-sm text-green-700">Practice reading out loud with expression</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🤔</div>
              <h4 className="font-bold text-purple-800 mb-2">Think About It</h4>
              <p className="text-sm text-purple-700">What is happening in the story?</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reading selection view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <span className="mr-3">📖</span>
            My Reading Activities
          </h1>
          <div className="text-lg md:text-xl opacity-90">
            {studentData.firstName}'s Reading Corner
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {(studentAssignments || beginnerAssignments) && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-center gap-4">
            {beginnerAssignments && beginnerAssignments.sounds.length > 0 && (
              <button
                onClick={() => setActiveTab('beginner')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'beginner' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔤 Beginning Sounds
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                  {beginnerAssignments.sounds.length}
                </span>
              </button>
            )}
            {studentAssignments && studentAssignments.texts.length > 0 && (
              <button
                onClick={() => setActiveTab('fluency')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'fluency' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📖 Reading Passages
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                  {studentAssignments.texts.length}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Beginner Sounds Tab */}
      {activeTab === 'beginner' && beginnerAssignments && beginnerAssignments.sounds.length > 0 && (
        <div className="space-y-6">
          {/* Group Header */}
          <div className={`${beginnerAssignments.groupColor} text-white rounded-xl p-6`}>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center">
                <span className="mr-3">🔤</span>
                My Beginning Sounds
              </h2>
              <div className="text-lg opacity-90">
                {beginnerAssignments.groupName}
              </div>
              <div className="text-sm opacity-80 mt-2">
                {beginnerAssignments.sounds.length} sound{beginnerAssignments.sounds.length !== 1 ? 's' : ''} to practice
              </div>
            </div>
          </div>

          {/* Sound Activities */}
          <div className="grid gap-6">
            {beginnerAssignments.sounds.map(soundData => (
              <div key={soundData.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="bg-red-500 text-white p-4 md:p-6 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">{soundData.sound.title} {soundData.sound.image}</h2>
                      <p className="text-sm md:text-base opacity-90">{soundData.sound.description}</p>
                      <p className="text-sm opacity-80">{soundData.sound.soundFocus}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  {/* Preview of practices */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="text-gray-800 text-lg md:text-xl font-bold text-center">
                      {soundData.sound.practices[0]?.content.substring(0, 50)}...
                    </div>
                  </div>
                  
                  {/* Focus words preview */}
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-700 mb-2 text-sm md:text-base">Practice Words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {soundData.sound.targetWords.slice(0, 4).map(word => (
                        <span key={word} className="bg-red-100 border border-red-300 px-2 py-1 rounded text-sm font-semibold text-gray-800">
                          {word}
                        </span>
                      ))}
                      {soundData.sound.targetWords.length > 4 && (
                        <span className="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-sm text-gray-600">
                          +{soundData.sound.targetWords.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Practice button */}
                  <div className="text-center">
                    <button
                      onClick={() => setSelectedSound(soundData)}
                      className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-red-600 transition-colors"
                    >
                      🔤 Start Practice
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fluency Practice Tab */}
      {activeTab === 'fluency' && studentAssignments && studentAssignments.texts.length > 0 && (
        <div className="space-y-6">
          {/* Group Header */}
          <div className={`${studentAssignments.groupColor} text-white rounded-xl p-6`}>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center">
                <span className="mr-3">📖</span>
                My Reading Passages
              </h2>
              <div className="text-lg opacity-90">
                {studentAssignments.groupName}
              </div>
              <div className="text-sm opacity-80 mt-2">
                {studentAssignments.texts.length} reading passage{studentAssignments.texts.length !== 1 ? 's' : ''} assigned
              </div>
            </div>
          </div>

          {/* Reading Passages */}
          <div className="grid gap-6">
            {studentAssignments.texts.map(textData => (
              <div key={textData.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                <div className={`${textData.textType.color} text-white p-4 md:p-6 rounded-t-xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold">{textData.text.title}</h2>
                      <p className="text-sm md:text-base opacity-90">{textData.passage.level} - {textData.textType.name}</p>
                      <p className="text-sm opacity-80">{textData.text.wordCount} words | {textData.passage.spellingFocus}</p>
                    </div>
                    <div className="text-3xl md:text-4xl">{textData.textType.icon}</div>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  {/* Preview of text */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="text-gray-800 text-sm md:text-base leading-relaxed">
                      {textData.text.content.substring(0, 120)}
                      {textData.text.content.length > 120 && '...'}
                    </div>
                  </div>
                  
                  {/* Focus words preview */}
                  <div className="mb-4">
                    <h4 className="font-bold text-gray-700 mb-2 text-sm md:text-base">Focus Words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {textData.passage.targetWords.slice(0, 4).map(word => (
                        <span key={word} className="bg-yellow-100 border border-yellow-300 px-2 py-1 rounded text-sm font-semibold text-gray-800">
                          {word}
                        </span>
                      ))}
                      {textData.passage.targetWords.length > 4 && (
                        <span className="bg-gray-100 border border-gray-300 px-2 py-1 rounded text-sm text-gray-600">
                          +{textData.passage.targetWords.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Read button */}
                  <div className="text-center">
                    <button
                      onClick={() => setSelectedText(textData)}
                      className={`${textData.textType.color} text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base hover:opacity-90 transition-opacity`}
                    >
                      📖 Start Reading
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Assignments View */}
      {activeTab === 'auto' && (!studentAssignments || studentAssignments.texts.length === 0) && (!beginnerAssignments || beginnerAssignments.sounds.length === 0) && (
        <div className="bg-white rounded-xl p-6 md:p-8 text-center">
          <div className="text-4xl md:text-6xl mb-4">📚</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Reading Assignments</h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
            Your teacher hasn't assigned you to any reading groups yet. They can assign you to:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-3xl mb-2">🔤</div>
              <h3 className="font-bold text-red-800 mb-2">Beginning Sounds</h3>
              <p className="text-red-600 text-sm">
                Perfect for learning letter sounds, phonics, and beginning reading skills
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-3xl mb-2">📖</div>
              <h3 className="font-bold text-blue-800 mb-2">Reading Passages</h3>
              <p className="text-blue-600 text-sm">
                Longer texts for fluency practice and reading comprehension
              </p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
            <p className="text-purple-800 text-sm">
              🎯 <strong>Ask your teacher</strong> to assign you to a reading group in the Curriculum Corner!
            </p>
          </div>
        </div>
      )}

      {/* Reading Benefits */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🌟 Why Reading Practice Helps You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2 text-center">🚀 Get Better at Reading:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Read words faster and easier</li>
              <li>• Understand stories better</li>
              <li>• Learn new words</li>
              <li>• Read with more expression</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2 text-center">🎯 Reading Tips:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Point to each word as you read</li>
              <li>• Read the same passage multiple times</li>
              <li>• Ask questions about what you read</li>
              <li>• Practice reading to family or friends</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReading;