// components/curriculum/literacy/FluencyPractice.js
// FLUENCY PRACTICE - UPDATED WITH COMPREHENSION QUESTIONS SUPPORT
import React, { useState, useEffect } from 'react';
import { LEVEL_1_PASSAGES } from './passages/Level1Passages';
import { LEVEL_2_PASSAGES_1 } from './passages/Level2Passages1';
import { LEVEL_2_PASSAGES_2 } from './passages/Level2Passages2';
import { LEVEL_2_PASSAGES_3 } from './passages/Level2Passages3';
import { LEVEL_2_PASSAGES_4 } from './passages/Level2Passages4';
import { LEVEL_2_PASSAGES_5 } from './passages/Level2Passages5';
import { LEVEL_2_PASSAGES_6 } from './passages/Level2Passages6';
import { LEVEL_2_PASSAGES_7 } from './passages/Level2Passages7';
import { LEVEL_2_PASSAGES_8 } from './passages/Level2Passages8';
import { LEVEL_2_PASSAGES_9 } from './passages/Level2Passages9';
import { LEVEL_2_PASSAGES_10 } from './passages/Level2Passages10';
import { LEVEL_3_PASSAGES_1 } from './passages/Level3Passages1';
import { LEVEL_3_PASSAGES_2 } from './passages/Level3Passages2';
import { LEVEL_3_PASSAGES_3 } from './passages/Level3Passages3';
import { LEVEL_3_PASSAGES_4 } from './passages/Level3Passages4';
import { LEVEL_3_PASSAGES_5 } from './passages/Level3Passages5';
import { LEVEL_3_PASSAGES_6 } from './passages/Level3Passages6';
import { LEVEL_3_PASSAGES_7 } from './passages/Level3Passages7';
import { LEVEL_3_PASSAGES_8 } from './passages/Level3Passages8';
import { LEVEL_3_PASSAGES_9 } from './passages/Level3Passages9';
import { LEVEL_3_PASSAGES_10 } from './passages/Level3Passages10';
import { LEVEL_3_PASSAGES_11 } from './passages/Level3Passages11';
import { LEVEL_3_PASSAGES_12 } from './passages/Level3Passages12';
import { LEVEL_3_PASSAGES_13 } from './passages/Level3Passages13';
import { LEVEL_4_PASSAGES_1 } from './passages/Level4Passages1';
import { LEVEL_4_PASSAGES_2 } from './passages/Level4Passages2';
import { LEVEL_4_PASSAGES_3 } from './passages/Level4Passages3';
import { LEVEL_4_PASSAGES_4 } from './passages/Level4Passages4';
import { LEVEL_4_PASSAGES_5 } from './passages/Level4Passages5';
import { LEVEL_4_PASSAGES_6 } from './passages/Level4Passages6';
import { LEVEL_4_PASSAGES_7 } from './passages/Level4Passages7';
import { LEVEL_4_PASSAGES_8 } from './passages/Level4Passages8';
import { LEVEL_4_PASSAGES_9 } from './passages/Level4Passages9';
import { LEVEL_4_PASSAGES_10 } from './passages/Level4Passages10';
import { LEVEL_4_PASSAGES_11 } from './passages/Level4Passages11';
import { LEVEL_4_PASSAGES_12 } from './passages/Level4Passages12';
import { LEVEL_4_PASSAGES_13 } from './passages/Level4Passages13';

// ===============================================
// TEXT TYPE CONFIGURATIONS
// ===============================================
const TEXT_TYPES = [
  { 
    id: "narrative", 
    name: "Narrative", 
    icon: "📖", 
    color: "bg-blue-500", 
    description: "Stories with characters, setting, and plot" 
  },
  { 
    id: "informational", 
    name: "Information Text", 
    icon: "📊", 
    color: "bg-green-500", 
    description: "Factual texts that inform and explain" 
  },
  { 
    id: "persuasive", 
    name: "Persuasive", 
    icon: "💭", 
    color: "bg-orange-500", 
    description: "Texts that convince and persuade" 
  },
  { 
    id: "poetry", 
    name: "Poetry", 
    icon: "🎭", 
    color: "bg-purple-500", 
    description: "Poems, rhymes, and verse" 
  }
];

// NEW: Question type information for comprehension questions
const QUESTION_TYPES = {
  "right-there": {
    name: "Right There",
    description: "Answer is directly in the text",
    icon: "👀",
    color: "bg-green-100 border-green-300 text-green-800"
  },
  "think-and-search": {
    name: "Think and Search", 
    description: "Combine information from different parts",
    icon: "🔍",
    color: "bg-blue-100 border-blue-300 text-blue-800"
  },
  "author-and-me": {
    name: "Author and Me",
    description: "Use text and your own thinking",
    icon: "🤔", 
    color: "bg-purple-100 border-purple-300 text-purple-800"
  },
  "on-my-own": {
    name: "On My Own",
    description: "Use your own experience",
    icon: "💡",
    color: "bg-yellow-100 border-yellow-300 text-yellow-800"
  }
};

// ===============================================
// READING PASSAGES - CONSOLIDATED FROM ALL LEVEL FILES
// ===============================================
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

// ===============================================
// LEVEL ORGANIZATION
// ===============================================
const organizePassagesByLevel = () => {
  const levels = {
    'Level 1': { id: 'level-1', name: 'Level 1', icon: '🌱', color: 'bg-green-500', passages: [] },
    'Level 2': { id: 'level-2', name: 'Level 2', icon: '🌿', color: 'bg-blue-500', passages: [] },
    'Level 3': { id: 'level-3', name: 'Level 3', icon: '🌳', color: 'bg-purple-500', passages: [] },
    'Level 4': { id: 'level-4', name: 'Level 4', icon: '🎓', color: 'bg-orange-500', passages: [] }
  };

  READING_PASSAGES.forEach(passage => {
    const levelNumber = passage.level.includes('Level 1') ? 'Level 1' :
                       passage.level.includes('Level 2') ? 'Level 2' :
                       passage.level.includes('Level 3') ? 'Level 3' :
                       passage.level.includes('Level 4') ? 'Level 4' : null;
    
    if (levelNumber && levels[levelNumber]) {
      levels[levelNumber].passages.push(passage);
    }
  });

  return Object.values(levels).filter(level => level.passages.length > 0);
};

// ===============================================
// MAIN FLUENCY PRACTICE COMPONENT
// ===============================================
const FluencyPractice = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [groups, setGroups] = useState(loadedData?.fluencyGroups || []);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showTextBrowser, setShowTextBrowser] = useState(false);
  const [viewingText, setViewingText] = useState(null);
  const [selectedMainLevel, setSelectedMainLevel] = useState(null);
  const [selectedSubLevel, setSelectedSubLevel] = useState(null);
  const [selectedTextType, setSelectedTextType] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [displayingText, setDisplayingText] = useState(null);
  const [showComprehensionQuestions, setShowComprehensionQuestions] = useState(false); // NEW: For viewing comprehension questions

  // Initialize groups if empty
  useEffect(() => {
    if (loadedData?.fluencyGroups && loadedData.fluencyGroups.length > 0) {
      setGroups(loadedData.fluencyGroups);
      setHasUnsavedChanges(false);
      console.log('📚 Loaded fluency groups from Firebase:', loadedData.fluencyGroups);
    } else if (loadedData !== undefined && groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Group 1", color: "bg-blue-500", students: [], assignedTexts: [] },
        { id: 2, name: "Group 2", color: "bg-green-500", students: [], assignedTexts: [] },
        { id: 3, name: "Group 3", color: "bg-purple-500", students: [], assignedTexts: [] }
      ];
      setGroups(defaultGroups);
      setHasUnsavedChanges(true);
      console.log('📚 Created default fluency groups');
    }
  }, [loadedData]);

  // Update groups when loadedData changes
  useEffect(() => {
    if (loadedData?.fluencyGroups && 
        Array.isArray(loadedData.fluencyGroups) && 
        loadedData.fluencyGroups.length > 0 &&
        JSON.stringify(loadedData.fluencyGroups) !== JSON.stringify(groups)) {
      setGroups(loadedData.fluencyGroups);
      setHasUnsavedChanges(false);
      console.log('🔄 Updated fluency groups from Firebase data change');
    }
  }, [loadedData?.fluencyGroups]);

  // Clean up groups when students change
  useEffect(() => {
    if (groups.length > 0 && students.length > 0) {
      const studentIds = students.map(s => s.id);
      let hasChanges = false;
      
      const cleanedGroups = groups.map(group => {
        const validStudents = group.students.filter(student => studentIds.includes(student.id));
        if (validStudents.length !== group.students.length) {
          hasChanges = true;
          return { ...group, students: validStudents };
        }
        return group;
      });
      
      if (hasChanges) {
        console.log('🧹 Cleaned up removed students from fluency groups');
        setGroups(cleanedGroups);
        setHasUnsavedChanges(true);
      }
    }
  }, [students]);

  // Save function
  const saveGroups = () => {
    try {
      if (!saveData || typeof saveData !== 'function') {
        console.error('❌ saveData function not available');
        return;
      }

      if (!groups || groups.length === 0) {
        console.error('❌ No groups to save');
        return;
      }
      
      const existingToolkitData = loadedData || {};
      const updatedToolkitData = {
        ...existingToolkitData,
        fluencyGroups: groups,
        lastSaved: new Date().toISOString()
      };
      
      saveData({ toolkitData: updatedToolkitData });
      setHasUnsavedChanges(false);
      console.log('💾 Fluency groups saved to Firebase successfully:', groups);
      
    } catch (error) {
      console.error('❌ Error saving fluency groups:', error);
    }
  };

  // Update groups locally
  const updateGroups = (updatedGroups) => {
    if (!Array.isArray(updatedGroups)) {
      console.error('❌ Invalid groups data - must be array');
      return;
    }
    setGroups(updatedGroups);
    setHasUnsavedChanges(true);
    console.log('📝 Groups updated locally, unsaved changes flagged');
  };

  const addGroup = () => {
    if (groups.length >= 5) return;
    
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    const newGroup = {
      id: Date.now(),
      name: `Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedTexts: []
    };
    updateGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId) => {
    updateGroups(groups.filter(g => g.id !== groupId));
  };

  const updateGroupName = (groupId, newName) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    ));
  };

  const assignStudentToGroup = (studentId, groupId) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.id === groupId 
        ? [...group.students.filter(s => s.id !== studentId), students.find(s => s.id === studentId)]
        : group.students.filter(s => s.id !== studentId)
    }));
    updateGroups(updatedGroups);
  };

  const assignTextsToGroup = (groupId, textIds) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, assignedTexts: textIds } : g
    ));
  };

  // NEW: Get comprehension questions for a text
  const getComprehensionQuestions = (textId) => {
    const [levelId, textType] = textId.split('-');
    const passage = READING_PASSAGES.find(p => p.id === levelId);
    if (!passage) return null;
    
    const text = passage.texts.find(t => t.type === textType);
    return text?.comprehensionQuestions || null;
  };

  // NEW: Render comprehension questions modal
  const renderComprehensionModal = () => {
    if (!showComprehensionQuestions || !viewingText) return null;

    const questions = viewingText.comprehensionQuestions;
    if (!questions) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <span className="mr-3">❓</span>
                  Comprehension Questions
                </h2>
                <p className="text-lg opacity-90">{viewingText.title}</p>
                <p className="text-sm opacity-80">{viewingText.passage.level} - {viewingText.type}</p>
              </div>
              <button
                onClick={() => setShowComprehensionQuestions(false)}
                className="text-white hover:text-red-200 text-4xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Question Types Guide */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 Question Types (QAR Framework)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(QUESTION_TYPES).map(([type, info]) => (
                <div key={type} className={`p-3 rounded-lg border-2 ${info.color}`}>
                  <div className="text-2xl mb-1">{info.icon}</div>
                  <h4 className="font-bold text-sm">{info.name}</h4>
                  <p className="text-xs opacity-90">{info.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">📚 Comprehension Questions</h3>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const questionType = QUESTION_TYPES[question.type];
                return (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg border-2 ${questionType.color} flex-shrink-0`}>
                        <div className="text-2xl">{questionType.icon}</div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold">
                            Question {index + 1}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${questionType.color}`}>
                            {questionType.name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-4">{question.question}</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <p className="text-sm text-green-800 mb-2">
                            <strong>💡 Sample Answer:</strong>
                          </p>
                          <p className="text-sm text-green-700 italic">{question.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 rounded-b-xl text-center">
            <button
              onClick={() => setShowComprehensionQuestions(false)}
              className="bg-yellow-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-700"
            >
              Close Questions
            </button>
          </div>
        </div>
      </div>
    );
  };

  const printTexts = (textIds) => {
    const textsToprint = [];
    textIds.forEach(textId => {
      const [levelId, textType] = textId.split('-');
      const passage = READING_PASSAGES.find(p => p.id === levelId);
      if (passage) {
        const text = passage.texts.find(t => t.type === textType);
        if (text) {
          textsToprint.push({ ...text, passage });
        }
      }
    });
    
    if (textsToprint.length === 0) return;
    
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    
    const generateTextCopies = (text, passage) => {
      let copiesHtml = '';
      for (let i = 0; i < 6; i++) {
        copiesHtml += `
          <div class="text-copy">
            <div class="text-header">
              <div class="text-title">${text.title}</div>
              <div class="text-info">
                <span class="level">${passage.level}</span> | 
                <span class="type">${text.type.charAt(0).toUpperCase() + text.type.slice(1)}</span> | 
                <span class="word-count">${text.wordCount} words</span>
                ${text.comprehensionQuestions ? ' | <span class="questions">✅ Questions</span>' : ''}
              </div>
              <div class="spelling-focus">${passage.spellingFocus}</div>
            </div>
            <div class="text-content">${text.content.replace(/\n/g, '<br>')}</div>
            <div class="target-words">
              <strong>Focus Words:</strong> ${passage.targetWords.join(', ')}
            </div>
          </div>
        `;
      }
      return copiesHtml;
    };
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Fluency Practice Texts - 6 Copies</title>
          <style>
            body { 
              font-family: Georgia, serif; 
              margin: 10px; 
              padding: 0;
              font-size: 14px;
              line-height: 1.6;
            }
            .text-page {
              page-break-after: always;
              margin-bottom: 20px;
            }
            .text-page:last-child {
              page-break-after: auto;
            }
            .copies-container { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              grid-template-rows: repeat(3, 1fr);
              gap: 15px; 
              width: 100%;
              height: 95vh;
            }
            .text-copy { 
              border: 2px solid #333; 
              padding: 12px;
              break-inside: avoid;
              display: flex;
              flex-direction: column;
            }
            .text-header {
              border-bottom: 2px solid #666;
              margin-bottom: 10px;
              padding-bottom: 8px;
            }
            .text-title { 
              font-weight: bold; 
              text-align: center; 
              font-size: 16px;
              margin-bottom: 4px;
            }
            .text-info {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            .questions {
              color: #059669;
              font-weight: bold;
            }
            .spelling-focus {
              font-style: italic;
              text-align: center;
              font-size: 11px;
              color: #888;
            }
            .text-content { 
              flex-grow: 1;
              font-size: 14px;
              line-height: 1.8;
              margin-bottom: 10px;
              text-align: justify;
            }
            .target-words {
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 6px;
              text-align: center;
            }
            @media print {
              body { margin: 5px; }
              .copies-container { 
                gap: 10px; 
                height: 97vh;
              }
              .text-copy { 
                padding: 8px; 
              }
            }
          </style>
        </head>
        <body>
          ${textsToprint.map(textData => `
            <div class="text-page">
              <div class="copies-container">
                ${generateTextCopies(textData, textData.passage)}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getAssignedStudents = () => {
    return groups.reduce((assigned, group) => [...assigned, ...group.students], []);
  };

  const unassignedStudents = students.filter(student => 
    !getAssignedStudents().some(assigned => assigned?.id === student.id)
  );

  // Get available texts for selection
  const getAvailableTexts = () => {
    const texts = [];
    READING_PASSAGES.forEach(passage => {
      passage.texts.forEach(text => {
        texts.push({
          id: `${passage.id}-${text.type}`,
          displayName: `${passage.level} - ${text.title} (${text.type})`,
          passage: passage,
          text: text,
          hasQuestions: !!text.comprehensionQuestions
        });
      });
    });
    return texts;
  };

  // Get text for display
  const getDisplayText = () => {
    if (!displayingText) return null;
    
    const [levelId, textType] = displayingText.split('-');
    const passage = READING_PASSAGES.find(p => p.id === levelId);
    if (!passage) return null;
    
    const text = passage.texts.find(t => t.type === textType);
    if (!text) return null;
    
    return { text, passage };
  };

  const displayText = getDisplayText();

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedTexts.length > 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">📖 Today's Reading</h1>
          <button
            onClick={() => setIsPresentationMode(false)}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl text-xl font-bold hover:bg-gray-700"
          >
            Exit Presentation
          </button>
        </div>

        <div className={`grid gap-4 ${
          activeGroups.length <= 3 
            ? activeGroups.length === 1 ? 'grid-cols-1' : activeGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {activeGroups.length > 3 ? (
            <div className="grid grid-cols-4 gap-4">
              {activeGroups.map(group => (
                <div key={group.id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className={`${group.color} text-white text-center py-3 rounded-lg mb-4`}>
                    <h2 className="text-xl font-bold">{group.name}</h2>
                    <p className="text-sm opacity-90">{group.students.length} students</p>
                  </div>

                  {group.assignedTexts.map(textId => {
                    const [levelId, textType] = textId.split('-');
                    const passage = READING_PASSAGES.find(p => p.id === levelId);
                    const text = passage?.texts.find(t => t.type === textType);
                    if (!text || !passage) return null;

                    return (
                      <div key={textId} className="mb-4 text-xs">
                        <h3 className="font-bold text-center mb-2 text-gray-800">{text.title}</h3>
                        <p className="text-center mb-2 text-blue-600 italic">{passage.level}</p>
                        {text.comprehensionQuestions && (
                          <p className="text-center mb-2 text-green-600 text-xs">✅ Questions Available</p>
                        )}
                        <div className="bg-gray-50 p-2 rounded text-gray-700 max-h-24 overflow-hidden">
                          {text.content.substring(0, 120)}...
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            activeGroups.map(group => (
              <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
                <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                  <h2 className="text-4xl font-bold">{group.name}</h2>
                  <p className="text-2xl opacity-90">{group.students.length} students</p>
                </div>

                {group.assignedTexts.map(textId => {
                  const [levelId, textType] = textId.split('-');
                  const passage = READING_PASSAGES.find(p => p.id === levelId);
                  const text = passage?.texts.find(t => t.type === textType);
                  if (!text || !passage) return null;

                  return (
                    <div key={textId} className="mb-6">
                      <h3 className="text-3xl font-bold text-center mb-2 text-gray-800">{text.title}</h3>
                      <p className="text-lg text-center mb-4 text-blue-600 italic">{passage.level} - {text.type}</p>
                      {text.comprehensionQuestions && (
                        <p className="text-center mb-4 text-green-600 font-semibold">✅ Comprehension Questions Available</p>
                      )}
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
                        <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {text.content}
                        </div>
                      </div>
                      <div className="mt-3 text-center text-sm text-gray-600">
                        <strong>Focus Words:</strong> {passage.targetWords.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comprehension Questions Modal */}
      {renderComprehensionModal()}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">📖</span>
              Fluency Practice
            </h1>
            <p className="text-lg opacity-90">Reading passages aligned with spelling levels - {READING_PASSAGES.length} levels available</p>
            <p className="text-sm opacity-75 mt-1">✅ Includes comprehension questions for enhanced learning</p>
            {loadedData?.fluencyGroups && loadedData.fluencyGroups.length > 0 && !hasUnsavedChanges && (
              <p className="text-sm opacity-75 mt-1">✅ Groups loaded from your saved data</p>
            )}
            {hasUnsavedChanges && (
              <p className="text-sm opacity-75 mt-1">⚠️ You have unsaved changes</p>
            )}
          </div>
          <div className="flex gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={saveGroups}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2 animate-pulse"
              >
                💾 Save Changes
              </button>
            )}
            <button
              onClick={() => setShowStudentAssignment(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              👥 Assign Students
            </button>
            <button
              onClick={() => setShowTextBrowser(!showTextBrowser)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              📚 Browse Texts
            </button>
            <button
              onClick={() => setIsPresentationMode(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              🎭 Presentation Mode
            </button>
          </div>
        </div>
      </div>

      {/* Text Display Modal */}
      {displayText && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{displayText.text.title}</h2>
                  <p className="text-xl opacity-90">{displayText.passage.level} - {displayText.text.type.charAt(0).toUpperCase() + displayText.text.type.slice(1)}</p>
                  <p className="text-lg opacity-80">{displayText.text.wordCount} words | {displayText.passage.spellingFocus}</p>
                  {displayText.text.comprehensionQuestions && (
                    <p className="text-sm opacity-90 mt-1">✅ Includes {displayText.text.comprehensionQuestions.length} comprehension questions</p>
                  )}
                </div>
                <div className="flex gap-3">
                  {displayText.text.comprehensionQuestions && (
                    <button
                      onClick={() => {
                        setViewingText(displayText);
                        setShowComprehensionQuestions(true);
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                    >
                      ❓ View Questions
                    </button>
                  )}
                  <button
                    onClick={() => setDisplayingText(null)}
                    className="text-white hover:text-red-200 text-4xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 mb-6">
                <div className="text-2xl leading-relaxed text-gray-800 whitespace-pre-wrap font-serif text-center">
                  {displayText.text.content}
                </div>
              </div>

              {/* Target Words */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3 text-center">Focus Words</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {displayText.passage.targetWords.map(word => (
                    <span key={word} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-lg font-semibold">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-xl text-center">
              <button
                onClick={() => setDisplayingText(null)}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700"
              >
                Close Display
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Browser Modal - UPDATED WITH COMPREHENSION QUESTIONS INDICATORS */}
      {showTextBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Browse Reading Passages</h2>
                <button
                  onClick={() => {
                    setShowTextBrowser(false);
                    setViewingText(null);
                    setSelectedMainLevel(null);
                    setSelectedSubLevel(null);
                    setSelectedTextType(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {viewingText ? (
                // Individual Text View - UPDATED with comprehension questions
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{viewingText.title}</h3>
                      <p className="text-blue-600 italic">{viewingText.passage.level} - {viewingText.type}</p>
                      <p className="text-gray-600">{viewingText.wordCount} words | {viewingText.passage.spellingFocus}</p>
                      {viewingText.comprehensionQuestions && (
                        <p className="text-green-600 font-semibold">✅ {viewingText.comprehensionQuestions.length} comprehension questions included</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {viewingText.comprehensionQuestions && (
                        <button
                          onClick={() => setShowComprehensionQuestions(true)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
                        >
                          ❓ View Questions
                        </button>
                      )}
                      <button
                        onClick={() => setDisplayingText(`${viewingText.passage.id}-${viewingText.type}`)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        📺 Display to Class
                      </button>
                      <button
                        onClick={() => setViewingText(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                      {viewingText.content}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm text-gray-600">
                        <strong>Target Words:</strong> {viewingText.passage.targetWords.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedSubLevel ? (
                // Sub Level Text Types View - UPDATED with question indicators
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedSubLevel.level}</h3>
                      <p className="text-blue-600 italic">{selectedSubLevel.spellingFocus}</p>
                    </div>
                    <button
                      onClick={() => setSelectedSubLevel(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to {selectedMainLevel.name} Sub-levels
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedSubLevel.texts.map(text => {
                      const textType = TEXT_TYPES.find(t => t.id === text.type);
                      return (
                        <button
                          key={text.type}
                          onClick={() => setViewingText({ ...text, passage: selectedSubLevel })}
                          className={`p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 text-left transition-all hover:scale-105 ${textType?.color || 'bg-gray-500'} text-white relative`}
                        >
                          {text.comprehensionQuestions && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                              ❓{text.comprehensionQuestions.length}
                            </div>
                          )}
                          <div className="text-3xl mb-2">{textType?.icon}</div>
                          <div className="font-bold text-lg">{text.title}</div>
                          <div className="text-sm opacity-90 mb-2">{textType?.name}</div>
                          <div className="text-xs opacity-80">{text.wordCount} words</div>
                          {text.comprehensionQuestions && (
                            <div className="text-xs opacity-90 mt-1">+ Questions</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : selectedMainLevel ? (
                // Sub Levels View
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <span className="mr-3">{selectedMainLevel.icon}</span>
                        {selectedMainLevel.name} Sub-levels
                      </h3>
                      <p className="text-gray-600">Choose a specific sub-level to browse texts</p>
                    </div>
                    <button
                      onClick={() => setSelectedMainLevel(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to Main Levels
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {selectedMainLevel.passages.map(passage => {
                      const questionsCount = passage.texts.reduce((count, text) => 
                        count + (text.comprehensionQuestions ? text.comprehensionQuestions.length : 0), 0
                      );
                      
                      return (
                        <button
                          key={passage.id}
                          onClick={() => setSelectedSubLevel(passage)}
                          className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all hover:scale-105 relative"
                        >
                          {questionsCount > 0 && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              ❓{questionsCount}
                            </div>
                          )}
                          <div className="font-bold text-lg mb-2">{passage.level}</div>
                          <div className="text-sm text-blue-600 italic mb-2">{passage.spellingFocus}</div>
                          <div className="text-xs text-gray-600 mb-2">{passage.texts.length} texts available</div>
                          {questionsCount > 0 && (
                            <div className="text-xs text-green-600 mb-2">+ {questionsCount} comprehension questions</div>
                          )}
                          <div className="flex gap-1">
                            {passage.texts.map(text => {
                              const textType = TEXT_TYPES.find(t => t.id === text.type);
                              return (
                                <span key={text.type} className="text-lg" title={textType?.name}>
                                  {textType?.icon}
                                  {text.comprehensionQuestions && <span className="text-xs">❓</span>}
                                </span>
                              );
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Main Levels View - UPDATED with question counts
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Choose a Reading Level</h3>
                    <p className="text-gray-600">Organized by main levels for easier navigation</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {organizePassagesByLevel().map(level => {
                      const totalQuestions = level.passages.reduce((total, passage) => 
                        total + passage.texts.reduce((count, text) => 
                          count + (text.comprehensionQuestions ? text.comprehensionQuestions.length : 0), 0
                        ), 0
                      );
                      
                      return (
                        <button
                          key={level.id}
                          onClick={() => setSelectedMainLevel(level)}
                          className={`p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 text-center transition-all hover:scale-105 ${level.color} text-white shadow-lg relative`}
                        >
                          {totalQuestions > 0 && (
                            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                              ❓{totalQuestions}
                            </div>
                          )}
                          <div className="text-5xl mb-4">{level.icon}</div>
                          <h4 className="font-bold text-2xl mb-2">{level.name}</h4>
                          <div className="text-lg opacity-90 mb-3">{level.passages.length} sub-levels</div>
                          <div className="text-sm opacity-80">
                            {level.passages.reduce((total, passage) => total + passage.texts.length, 0)} total texts
                          </div>
                          {totalQuestions > 0 && (
                            <div className="text-sm opacity-90 mt-2">
                              + {totalQuestions} comprehension questions
                            </div>
                          )}
                          <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2">
                            <div className="text-xs opacity-90">Click to browse sub-levels</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Quick Stats - UPDATED with question information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 text-center">📊 Reading Levels Overview</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {organizePassagesByLevel().map(level => {
                        const totalQuestions = level.passages.reduce((total, passage) => 
                          total + passage.texts.reduce((count, text) => 
                            count + (text.comprehensionQuestions ? text.comprehensionQuestions.length : 0), 0
                          ), 0
                        );
                        
                        return (
                          <div key={level.id} className="text-center p-3 bg-white rounded-lg border">
                            <div className="text-2xl mb-1">{level.icon}</div>
                            <div className="font-semibold text-gray-800">{level.name}</div>
                            <div className="text-sm text-gray-600">{level.passages.length} sub-levels</div>
                            <div className="text-xs text-blue-600">
                              {level.passages.reduce((total, passage) => total + passage.texts.length, 0)} texts
                            </div>
                            {totalQuestions > 0 && (
                              <div className="text-xs text-green-600">
                                {totalQuestions} questions
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rest of component remains largely the same but with comprehension question indicators in group displays... */}
      
      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 mb-3">👤 Unassigned Students ({unassignedStudents.length})</h3>
          <p className="text-sm text-yellow-700 mb-3">Click "Assign Students" above to quickly assign students to groups</p>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.slice(0, 5).map(student => (
              <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm font-medium">{student.firstName} {student.lastName}</span>
              </div>
            ))}
            {unassignedStudents.length > 5 && (
              <div className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm text-gray-500">+{unassignedStudents.length - 5} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groups Display - UPDATED with comprehension question indicators */}
      <div className={`grid gap-4 ${
        groups.length === 1 ? 'grid-cols-1' :
        groups.length === 2 ? 'grid-cols-2' :
        groups.length === 3 ? 'grid-cols-3' :
        groups.length === 4 ? 'grid-cols-4' :
        'grid-cols-5'
      }`}>
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
            {/* Group Header */}
            <div className={`${group.color} text-white p-3 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                  className={`bg-transparent text-white font-bold border-none outline-none ${
                    groups.length >= 4 ? 'text-sm' : 'text-lg'
                  }`}
                />
                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-white hover:text-red-200 text-lg"
                >
                  ×
                </button>
              </div>
              <p className={`opacity-90 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                {group.students.length} students
              </p>
            </div>

            <div className={`${groups.length >= 4 ? 'p-3' : 'p-4'}`}>
              {/* Students */}
              <div className="mb-3">
                <h4 className={`font-bold text-gray-700 mb-2 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                  Students:
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {group.students.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-gray-50 p-1 rounded">
                      <span className={`${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                        {student.firstName} {student.lastName}
                      </span>
                      <button
                        onClick={() => assignStudentToGroup(student.id, null)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {group.students.length === 0 && (
                    <p className={`text-gray-500 italic ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                      No students assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Texts - UPDATED with question indicators */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-gray-700 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                    Texts:
                  </h4>
                  <button
                    onClick={() => printTexts(group.assignedTexts)}
                    disabled={group.assignedTexts.length === 0}
                    className={`bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 ${
                      groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                    }`}
                  >
                    🖨️
                  </button>
                </div>
                
                <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                  {group.assignedTexts.map(textId => {
                    const [levelId, textType] = textId.split('-');
                    const passage = READING_PASSAGES.find(p => p.id === levelId);
                    const text = passage?.texts.find(t => t.type === textType);
                    const typeConfig = TEXT_TYPES.find(t => t.id === textType);
                    
                    if (!text || !passage) return null;

                    return (
                      <div key={textId} className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-blue-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                            {text.title}
                            {text.comprehensionQuestions && (
                              <span className="text-green-600 ml-1">❓{text.comprehensionQuestions.length}</span>
                            )}
                          </span>
                          <div className="flex items-center gap-1">
                            {text.comprehensionQuestions && (
                              <button
                                onClick={() => {
                                  setViewingText({ ...text, passage });
                                  setShowComprehensionQuestions(true);
                                }}
                                className={`bg-yellow-500 text-white rounded hover:bg-yellow-600 ${
                                  groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                                }`}
                                title="View comprehension questions"
                              >
                                ❓
                              </button>
                            )}
                            <button
                              onClick={() => setDisplayingText(textId)}
                              className={`bg-green-500 text-white rounded hover:bg-green-600 ${
                                groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                              }`}
                              title="Display to class"
                            >
                              📺
                            </button>
                            <button
                              onClick={() => assignTextsToGroup(group.id, group.assignedTexts.filter(id => id !== textId))}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm">{typeConfig?.icon}</span>
                          <span className={`text-blue-600 italic ${groups.length >= 5 ? 'text-xs' : 'text-xs'}`}>
                            {passage.level} - {text.type} ({text.wordCount} words)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value && !group.assignedTexts.includes(e.target.value)) {
                      if (group.assignedTexts.length < 8) {
                        assignTextsToGroup(group.id, [...group.assignedTexts, e.target.value]);
                      } else {
                        showToast('Maximum 8 texts per group', 'error');
                      }
                    }
                    e.target.value = '';
                  }}
                  className={`w-full border border-gray-300 rounded p-1 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}
                  defaultValue=""
                >
                  <option value="">Add text...</option>
                  {getAvailableTexts().filter(text => !group.assignedTexts.includes(text.id)).map(text => (
                    <option key={text.id} value={text.id}>
                      {TEXT_TYPES.find(t => t.id === text.text.type)?.icon} {text.displayName}
                      {text.hasQuestions ? ' ❓' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Add Group Button */}
        {groups.length < 5 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center min-h-[300px]">
            <button
              onClick={addGroup}
              className="text-gray-600 hover:text-gray-800 text-center"
            >
              <div className={`mb-2 ${groups.length >= 4 ? 'text-2xl' : 'text-4xl'}`}>+</div>
              <div className={`font-bold ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>Add Group</div>
            </button>
          </div>
        )}
      </div>

      {/* Student Assignment Modal - Remains the same */}
      {showStudentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">👥 Assign Students to Groups</h2>
                <button
                  onClick={() => setShowStudentAssignment(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Students */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Available Students</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedStudents.map(student => (
                      <div key={student.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="flex gap-2 mt-2">
                          {groups.map(group => (
                            <button
                              key={group.id}
                              onClick={() => assignStudentToGroup(student.id, group.id)}
                              className={`${group.color} text-white text-xs px-3 py-1 rounded hover:opacity-80`}
                            >
                              → {group.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {unassignedStudents.length === 0 && (
                      <p className="text-gray-500 italic">All students are assigned to groups!</p>
                    )}
                  </div>
                </div>

                {/* Groups with Students */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Groups</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {groups.map(group => (
                      <div key={group.id} className="border rounded-lg">
                        <div className={`${group.color} text-white p-2 rounded-t-lg`}>
                          <h4 className="font-bold">{group.name} ({group.students.length})</h4>
                        </div>
                        <div className="p-2 space-y-1">
                          {group.students.map(student => (
                            <div key={student.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{student.firstName} {student.lastName}</span>
                              <button
                                onClick={() => assignStudentToGroup(student.id, null)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {group.students.length === 0 && (
                            <p className="text-gray-400 text-sm italic">No students assigned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FluencyPractice;