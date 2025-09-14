// components/curriculum/literacy/ReadingForFun.js
// READING FOR FUN - Advanced readers who have mastered fluency and comprehension
import React, { useState, useEffect } from 'react';
import { FUN_NARRATIVE_TEXTS } from './funTexts/FunNarrativeTexts';
import { FUN_INFORMATIONAL_TEXTS } from './funTexts/FunInformationalTexts';
import { FUN_PERSUASIVE_TEXTS } from './funTexts/FunPersuasiveTexts';
import { FUN_POETRY_TEXTS } from './funTexts/FunPoetryTexts';
import { FUN_COMEDY_TEXTS } from './funTexts/FunComedyTexts';
import { FUN_READERS_THEATRE_TEXTS } from './funTexts/FunReadersTheatreTexts'; // NEW IMPORT

// ===============================================
// TEXT TYPE CONFIGURATIONS FOR FUN READING - UPDATED WITH THEATRE
// ===============================================
const FUN_TEXT_TYPES = [
  { 
    id: "narrative", 
    name: "Adventure Stories", 
    icon: "🚀", 
    color: "bg-purple-500", 
    description: "Epic adventures, fantasy tales, and exciting journeys",
    texts: FUN_NARRATIVE_TEXTS
  },
  { 
    id: "informational", 
    name: "Cool Facts", 
    icon: "🤯", 
    color: "bg-blue-500", 
    description: "Amazing facts about games, tech, animals, and more",
    texts: FUN_INFORMATIONAL_TEXTS
  },
  { 
    id: "persuasive", 
    name: "Debate Zone", 
    icon: "⚡", 
    color: "bg-orange-500", 
    description: "Arguments about important (and fun) topics",
    texts: FUN_PERSUASIVE_TEXTS
  },
  { 
    id: "poetry", 
    name: "Rhythm & Rhyme", 
    icon: "🎵", 
    color: "bg-green-500", 
    description: "Poems, raps, and verses with attitude",
    texts: FUN_POETRY_TEXTS
  },
  { 
    id: "comedy", 
    name: "Laugh Zone", 
    icon: "😂", 
    color: "bg-pink-500", 
    description: "Jokes, funny stories, and silly situations",
    texts: FUN_COMEDY_TEXTS
  },
  { 
    id: "theatre", 
    name: "Drama Scripts", 
    icon: "🎭", 
    color: "bg-indigo-500", 
    description: "Readers theatre scripts with character roles",
    texts: FUN_READERS_THEATRE_TEXTS // NEW CATEGORY
  }
];

// ===============================================
// MAIN READING FOR FUN COMPONENT
// ===============================================
const ReadingForFun = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [groups, setGroups] = useState(loadedData?.funReadingGroups || []);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showTextBrowser, setShowTextBrowser] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewingText, setViewingText] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [displayingText, setDisplayingText] = useState(null);

  // Initialize groups if empty
  useEffect(() => {
    if (loadedData?.funReadingGroups && loadedData.funReadingGroups.length > 0) {
      setGroups(loadedData.funReadingGroups);
      setHasUnsavedChanges(false);
      console.log('🎉 Loaded fun reading groups from Firebase:', loadedData.funReadingGroups);
    } else if (loadedData !== undefined && groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Advanced Readers", color: "bg-purple-600", students: [], assignedTexts: [], characterAssignments: {} },
        { id: 2, name: "Fun Readers", color: "bg-blue-600", students: [], assignedTexts: [], characterAssignments: {} },
        { id: 3, name: "Independent Readers", color: "bg-green-600", students: [], assignedTexts: [], characterAssignments: {} }
      ];
      setGroups(defaultGroups);
      setHasUnsavedChanges(true);
      console.log('🎉 Created default fun reading groups');
    }
  }, [loadedData]);

  // Update groups when loadedData changes
  useEffect(() => {
    if (loadedData?.funReadingGroups && 
        Array.isArray(loadedData.funReadingGroups) && 
        loadedData.funReadingGroups.length > 0 &&
        JSON.stringify(loadedData.funReadingGroups) !== JSON.stringify(groups)) {
      setGroups(loadedData.funReadingGroups);
      setHasUnsavedChanges(false);
      console.log('🔄 Updated fun reading groups from Firebase data change');
    }
  }, [loadedData?.funReadingGroups]);

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
        console.log('🧹 Cleaned up removed students from fun reading groups');
        setGroups(cleanedGroups);
        setHasUnsavedChanges(true);
      }
    }
  }, [students]);

  // Save function
  const saveGroups = () => {
    try {
      if (!saveData || typeof saveData !== 'function') {
        console.error('⚠️ saveData function not available');
        return;
      }

      if (!groups || groups.length === 0) {
        console.error('⚠️ No groups to save');
        return;
      }
      
      const existingToolkitData = loadedData || {};
      const updatedToolkitData = {
        ...existingToolkitData,
        funReadingGroups: groups,
        lastSaved: new Date().toISOString()
      };
      
      saveData({ toolkitData: updatedToolkitData });
      setHasUnsavedChanges(false);
      console.log('💾 Fun reading groups saved to Firebase successfully:', groups);
      
    } catch (error) {
      console.error('⚠️ Error saving fun reading groups:', error);
    }
  };

  // Update groups locally
  const updateGroups = (updatedGroups) => {
    if (!Array.isArray(updatedGroups)) {
      console.error('⚠️ Invalid groups data - must be array');
      return;
    }
    setGroups(updatedGroups);
    setHasUnsavedChanges(true);
    console.log('📝 Groups updated locally, unsaved changes flagged');
  };

  const addGroup = () => {
    if (groups.length >= 5) return;
    
    const colors = ["bg-purple-600", "bg-blue-600", "bg-green-600", "bg-orange-600", "bg-pink-600"];
    const newGroup = {
      id: Date.now(),
      name: `Reading Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedTexts: [],
      characterAssignments: {} // NEW: For theatre character assignments
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

  // NEW: Assign character to student for theatre texts
  const assignCharacterToStudent = (groupId, studentId, character) => {
    updateGroups(groups.map(group => {
      if (group.id === groupId) {
        const newAssignments = { ...group.characterAssignments };
        // Remove student from any existing character
        Object.keys(newAssignments).forEach(char => {
          if (newAssignments[char] === studentId) {
            delete newAssignments[char];
          }
        });
        // Assign new character
        if (character) {
          newAssignments[character] = studentId;
        }
        return { ...group, characterAssignments: newAssignments };
      }
      return group;
    }));
  };

  // Print texts with fun formatting
  const printTexts = (textIds) => {
    const textsToPrint = [];
    textIds.forEach(textId => {
      const [categoryId, textIndex] = textId.split('-');
      const category = FUN_TEXT_TYPES.find(c => c.id === categoryId);
      if (category) {
        const text = category.texts[parseInt(textIndex)];
        if (text) {
          textsToPrint.push({ ...text, category });
        }
      }
    });
    
    if (textsToPrint.length === 0) return;
    
    const printWindow = window.open('', 'PrintFunReading', 'height=800,width=600');
    
    const printContent = textsToPrint.map(textData => `
      <div class="text-page">
        <div class="text-header">
          <h1 class="text-title">${textData.title}</h1>
          <div class="text-info">
            <span class="category">${textData.category.name}</span> | 
            <span class="word-count">${textData.wordCount} words</span>
            <span class="reading-time">~${Math.ceil(textData.wordCount / 200)} min read</span>
            ${textData.characters ? `<span class="characters">• ${textData.characters.length} characters</span>` : ''}
          </div>
        </div>
        <div class="text-content">${textData.content.replace(/\n/g, '<br>')}</div>
        <div class="fun-footer">📚 Reading for Fun - Keep reading, keep growing!</div>
      </div>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Reading for Fun - Printable Texts</title>
          <style>
            body { 
              font-family: 'Comic Sans MS', Arial, sans-serif; 
              margin: 15px; 
              color: #333;
              line-height: 1.6;
            }
            .text-page {
              page-break-after: always;
              margin-bottom: 30px;
              min-height: 90vh;
            }
            .text-page:last-child {
              page-break-after: auto;
            }
            .text-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 15px;
              margin-bottom: 20px;
              text-align: center;
            }
            .text-title { 
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .text-info {
              font-size: 16px;
              opacity: 0.9;
            }
            .text-content { 
              font-size: 16px;
              line-height: 1.8;
              margin-bottom: 20px;
              background: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              border-left: 5px solid #667eea;
            }
            .fun-footer {
              text-align: center;
              font-style: italic;
              color: #666;
              border-top: 2px solid #e9ecef;
              padding-top: 15px;
              font-size: 14px;
            }
            @media print {
              body { margin: 10px; }
              .text-header { background: #667eea !important; }
            }
          </style>
        </head>
        <body>
          ${printContent}
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
    FUN_TEXT_TYPES.forEach(category => {
      category.texts.forEach((text, index) => {
        texts.push({
          id: `${category.id}-${index}`,
          displayName: `${category.name} - ${text.title}`,
          category: category,
          text: text
        });
      });
    });
    return texts;
  };

  // Get text for display
  const getDisplayText = () => {
    if (!displayingText) return null;
    
    const [categoryId, textIndex] = displayingText.split('-');
    const category = FUN_TEXT_TYPES.find(c => c.id === categoryId);
    if (!category) return null;
    
    const text = category.texts[parseInt(textIndex)];
    if (!text) return null;
    
    return { text, category };
  };

  const displayText = getDisplayText();

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedTexts.length > 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">🎉 Reading for Fun Time!</h1>
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
          {activeGroups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
              <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                <h2 className="text-4xl font-bold">{group.name}</h2>
                <p className="text-2xl opacity-90">{group.students.length} readers</p>
              </div>

              {group.assignedTexts.map(textId => {
                const [categoryId, textIndex] = textId.split('-');
                const category = FUN_TEXT_TYPES.find(c => c.id === categoryId);
                const text = category?.texts[parseInt(textIndex)];
                if (!text || !category) return null;

                return (
                  <div key={textId} className="mb-6">
                    <h3 className="text-3xl font-bold text-center mb-2 text-gray-800">{text.title}</h3>
                    <p className="text-lg text-center mb-4 text-purple-600 italic">{category.name} • {text.wordCount} words</p>
                    {text.characters && (
                      <p className="text-md text-center mb-4 text-indigo-600">🎭 {text.characters.length} characters</p>
                    )}
                    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
                      <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                        {text.content.length > 500 ? text.content.substring(0, 500) + '...' : text.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">🎉</span>
              Reading for Fun
            </h1>
            <p className="text-lg opacity-90">Awesome texts for advanced readers who love reading!</p>
            <p className="text-sm opacity-75 mt-1">✨ Stories, facts, debates, poems, comedy & theatre scripts</p>
            {loadedData?.funReadingGroups && loadedData.funReadingGroups.length > 0 && !hasUnsavedChanges && (
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
            <div className={`bg-gradient-to-r ${displayText.category.color} text-white p-6 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{displayText.text.title}</h2>
                  <p className="text-xl opacity-90">{displayText.category.name} • {displayText.text.wordCount} words</p>
                  <p className="text-lg opacity-80">Reading time: ~{Math.ceil(displayText.text.wordCount / 200)} minutes</p>
                  {displayText.text.characters && (
                    <p className="text-lg opacity-80">🎭 Characters: {displayText.text.characters.join(', ')}</p>
                  )}
                </div>
                <button
                  onClick={() => setDisplayingText(null)}
                  className="text-white hover:text-red-200 text-4xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8">
                <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                  {displayText.text.content}
                </div>
              </div>
            </div>
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

      {/* Text Browser Modal */}
      {showTextBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Browse Fun Reading Texts</h2>
                <button
                  onClick={() => {
                    setShowTextBrowser(false);
                    setViewingText(null);
                    setSelectedCategory(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {viewingText ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{viewingText.title}</h3>
                      <p className="text-purple-600 italic">{viewingText.category} • {viewingText.wordCount} words</p>
                      <p className="text-gray-600">~{Math.ceil(viewingText.wordCount / 200)} minute read</p>
                      {viewingText.characters && (
                        <p className="text-indigo-600">🎭 Characters: {viewingText.characters.join(', ')}</p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDisplayingText(`${viewingText.categoryId}-${viewingText.textIndex}`)}
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
                    <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                      {viewingText.content}
                    </div>
                  </div>
                </div>
              ) : selectedCategory ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                        <span className="mr-3">{selectedCategory.icon}</span>
                        {selectedCategory.name}
                      </h3>
                      <p className="text-gray-600">{selectedCategory.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to Categories
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedCategory.texts.map((text, index) => (
                      <button
                        key={index}
                        onClick={() => setViewingText({
                          ...text, 
                          category: selectedCategory.name,
                          categoryId: selectedCategory.id,
                          textIndex: index
                        })}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 text-left transition-all hover:scale-105 bg-white shadow-sm hover:shadow-md"
                      >
                        <div className="font-bold text-lg mb-2">{text.title}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          {text.wordCount} words • ~{Math.ceil(text.wordCount / 200)} min
                          {text.characters && ` • ${text.characters.length} characters`}
                        </div>
                        <div className="text-sm text-gray-700">
                          {text.content.substring(0, 100)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Choose a Category</h3>
                    <p className="text-gray-600">Fun reading for students who love to read!</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FUN_TEXT_TYPES.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category)}
                        className={`p-6 rounded-xl border-2 border-gray-200 hover:border-purple-300 text-center transition-all hover:scale-105 ${category.color} text-white shadow-lg`}
                      >
                        <div className="text-5xl mb-4">{category.icon}</div>
                        <h4 className="font-bold text-2xl mb-2">{category.name}</h4>
                        <div className="text-lg opacity-90 mb-3">{category.texts.length} texts</div>
                        <div className="text-sm opacity-80">{category.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 mb-3">👤 Unassigned Students ({unassignedStudents.length})</h3>
          <p className="text-sm text-yellow-700 mb-3">Click "Assign Students" above to assign students to fun reading groups</p>
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

      {/* Groups Display */}
      <div className={`grid gap-4 ${
        groups.length === 1 ? 'grid-cols-1' :
        groups.length === 2 ? 'grid-cols-2' :
        groups.length === 3 ? 'grid-cols-3' :
        groups.length === 4 ? 'grid-cols-4' :
        'grid-cols-5'
      }`}>
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
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
                {group.students.length} readers
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

              {/* Assigned Texts */}
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
                    const [categoryId, textIndex] = textId.split('-');
                    const category = FUN_TEXT_TYPES.find(c => c.id === categoryId);
                    const text = category?.texts[parseInt(textIndex)];
                    
                    if (!text || !category) return null;

                    const isTheatreScript = category.id === 'theatre';

                    return (
                      <div key={textId} className="bg-purple-50 border border-purple-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-purple-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                            {text.title}
                          </span>
                          <div className="flex items-center gap-1">
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
                          <span className="text-sm">{category.icon}</span>
                          <span className={`text-purple-600 italic ${groups.length >= 5 ? 'text-xs' : 'text-xs'}`}>
                            {category.name} ({text.wordCount} words)
                            {isTheatreScript && text.characters && (
                              <span className="ml-1">• {text.characters.length} characters</span>
                            )}
                          </span>
                        </div>
                        
                        {/* Character assignments for theatre scripts */}
                        {isTheatreScript && text.characters && (
                          <div className="mt-2 pt-2 border-t border-purple-300">
                            <div className={`font-bold text-purple-700 mb-1 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>Cast:</div>
                            <div className="space-y-1 max-h-16 overflow-y-auto">
                              {text.characters.map(character => {
                                const assignedStudentId = group.characterAssignments?.[character];
                                const student = group.students.find(s => s.id === assignedStudentId);
                                return (
                                  <div key={character} className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-indigo-700">{character}:</span>
                                    <select
                                      value={assignedStudentId || ''}
                                      onChange={(e) => assignCharacterToStudent(group.id, e.target.value, character)}
                                      className="text-xs border border-gray-300 rounded px-1"
                                      style={{ fontSize: '10px', padding: '1px' }}
                                    >
                                      <option value="">Unassigned</option>
                                      {group.students.map(student => (
                                        <option key={student.id} value={student.id}>
                                          {student.firstName}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value && !group.assignedTexts.includes(e.target.value)) {
                      if (group.assignedTexts.length < 10) {
                        assignTextsToGroup(group.id, [...group.assignedTexts, e.target.value]);
                      } else {
                        showToast('Maximum 10 texts per group', 'error');
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
                      {text.category.icon} {text.displayName}
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

      {/* Student Assignment Modal */}
      {showStudentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">👥 Assign Students to Fun Reading Groups</h2>
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
                <div>
                  <h3 className="text-lg font-bold mb-4">Available Students</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedStudents.map(student => (
                      <div key={student.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="flex gap-2 mt-2 flex-wrap">
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

export default ReadingForFun;