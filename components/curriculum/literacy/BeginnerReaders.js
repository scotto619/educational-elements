// components/curriculum/literacy/BeginnerReaders.js
// BEGINNER READERS - Main component for early reading activities
import React, { useState, useEffect } from 'react';
import { BEGINNER_LEVEL_1_SOUNDS } from './beginnerReaders/BeginnerLevel1Sounds';
import { BEGINNER_LEVEL_2_SOUNDS } from './beginnerReaders/BeginnerLevel2Sounds';
import { BEGINNER_LEVEL_3_SOUNDS } from './beginnerReaders/BeginnerLevel3Sounds';

// ===============================================
// BEGINNER READING LEVELS CONFIGURATION
// ===============================================
const BEGINNER_LEVELS = [
  {
    id: 'level1',
    name: 'Level 1 - Basic Sounds',
    description: 'Large font, repetitive single sounds with images',
    icon: '🔤',
    color: 'from-red-500 to-pink-600',
    sounds: BEGINNER_LEVEL_1_SOUNDS,
    instructions: 'Perfect for children just starting to learn letter sounds'
  },
  {
    id: 'level2',
    name: 'Level 2 - Sound Focus',
    description: 'Single letter or digraph focus with simple and complex words',
    icon: '🔡',
    color: 'from-orange-500 to-yellow-600',
    sounds: BEGINNER_LEVEL_2_SOUNDS,
    instructions: 'Building on basic sounds with digraphs and blends'
  },
  {
    id: 'level3',
    name: 'Level 3 - Alternate Spellings',
    description: 'Different ways to spell sounds with simple passages',
    icon: '📚',
    color: 'from-green-500 to-blue-600',
    sounds: BEGINNER_LEVEL_3_SOUNDS,
    instructions: 'Understanding that sounds can be spelled different ways'
  }
];

// ===============================================
// MAIN BEGINNER READERS COMPONENT
// ===============================================
const BeginnerReaders = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [groups, setGroups] = useState(loadedData?.beginnerGroups || []);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showSoundBrowser, setShowSoundBrowser] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [viewingSound, setViewingSound] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [displayingSound, setDisplayingSound] = useState(null);

  // Initialize groups if empty
  useEffect(() => {
    if (loadedData?.beginnerGroups && loadedData.beginnerGroups.length > 0) {
      setGroups(loadedData.beginnerGroups);
      setHasUnsavedChanges(false);
      console.log('📖 Loaded beginner groups from Firebase:', loadedData.beginnerGroups);
    } else if (loadedData !== undefined && groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Beginner Group 1", color: "bg-red-500", students: [], assignedSounds: [] },
        { id: 2, name: "Beginner Group 2", color: "bg-orange-500", students: [], assignedSounds: [] },
        { id: 3, name: "Beginner Group 3", color: "bg-green-500", students: [], assignedSounds: [] }
      ];
      setGroups(defaultGroups);
      setHasUnsavedChanges(true);
      console.log('📖 Created default beginner groups');
    }
  }, [loadedData]);

  // Update groups when loadedData changes
  useEffect(() => {
    if (loadedData?.beginnerGroups && 
        Array.isArray(loadedData.beginnerGroups) && 
        loadedData.beginnerGroups.length > 0 &&
        JSON.stringify(loadedData.beginnerGroups) !== JSON.stringify(groups)) {
      setGroups(loadedData.beginnerGroups);
      setHasUnsavedChanges(false);
      console.log('🔄 Updated beginner groups from Firebase data change');
    }
  }, [loadedData?.beginnerGroups]);

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
        console.log('🧹 Cleaned up removed students from beginner groups');
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
        beginnerGroups: groups,
        lastSaved: new Date().toISOString()
      };
      
      saveData({ toolkitData: updatedToolkitData });
      setHasUnsavedChanges(false);
      console.log('💾 Beginner groups saved to Firebase successfully:', groups);
      
    } catch (error) {
      console.error('❌ Error saving beginner groups:', error);
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
    
    const colors = ["bg-red-500", "bg-orange-500", "bg-green-500", "bg-blue-500", "bg-purple-500"];
    const newGroup = {
      id: Date.now(),
      name: `Beginner Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedSounds: []
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

  const assignSoundsToGroup = (groupId, soundIds) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, assignedSounds: soundIds } : g
    ));
  };

  // FIXED PRINTING FUNCTION - Clean A4 Layout with Level-Specific Scaling
  const printSounds = (soundIds) => {
    if (soundIds.length === 0) {
      showToast('No sounds to print', 'error');
      return;
    }

    const soundsToPrint = [];
    soundIds.forEach(soundId => {
      const allSounds = [...BEGINNER_LEVEL_1_SOUNDS, ...BEGINNER_LEVEL_2_SOUNDS, ...BEGINNER_LEVEL_3_SOUNDS];
      const sound = allSounds.find(s => s.id === soundId);
      if (sound) {
        const level = BEGINNER_LEVELS.find(l => l.sounds.includes(sound));
        soundsToPrint.push({ ...sound, level: level });
      }
    });
    
    if (soundsToPrint.length === 0) {
      showToast('No valid sounds found to print', 'error');
      return;
    }

    // Create print content with level-specific scaling and focus words removal for Level 3
    const printContent = soundsToPrint.map(soundData => {
      const isLevel3 = soundData.level?.id === 'level3';
      const levelClass = soundData.level?.id || 'level1';
      
      return `
        <div class="sound-page ${levelClass}">
          <div class="page-header">
            <h1 class="sound-title">${soundData.title} ${soundData.image}</h1>
            <p class="sound-info">${soundData.level?.name || 'Beginner Reading'} - ${soundData.description}</p>
            <p class="sound-focus">${soundData.soundFocus}</p>
          </div>
          
          <div class="content-sections">
            ${soundData.practices.map(practice => `
              <div class="practice-section">
                <h2 class="section-title">${practice.instructions}</h2>
                <div class="practice-content">${practice.content.replace(/\n/g, '<br>')}</div>
              </div>
            `).join('')}
            
            ${soundData.simplePassage ? `
              <div class="practice-section passage-section">
                <h2 class="section-title">📖 Reading Practice: ${soundData.simplePassage.title}</h2>
                <div class="passage-content">${soundData.simplePassage.content.replace(/\n/g, '<br>')}</div>
              </div>
            ` : ''}
          </div>
          
          ${!isLevel3 ? `
            <div class="target-words">
              <h3>🎯 Focus Words:</h3>
              <div class="words-list">${soundData.targetWords.join(' • ')}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Create and style print window
    const printWindow = window.open('', 'PrintSounds', 'width=800,height=600');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Beginner Reading Sounds</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body { 
              font-family: 'Comic Sans MS', 'Trebuchet MS', Arial, sans-serif;
              color: #333;
              background: white;
            }
            
            .sound-page {
              page-break-after: always;
              min-height: 90vh;
              display: flex;
              flex-direction: column;
              padding: 10px;
            }
            
            .sound-page:last-child {
              page-break-after: avoid;
            }
            
            .page-header {
              text-align: center;
              border-bottom: 3px solid #e74c3c;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            
            .sound-title { 
              font-size: 32px;
              font-weight: bold;
              color: #e74c3c;
              margin-bottom: 8px;
            }
            
            .sound-info {
              font-size: 16px;
              color: #666;
              margin-bottom: 5px;
            }
            
            .sound-focus {
              font-size: 14px;
              color: #3498db;
              font-style: italic;
            }
            
            .content-sections {
              flex-grow: 1;
              margin-bottom: 20px;
            }
            
            .practice-section {
              background: #f9f9f9;
              border: 2px solid #ddd;
              border-radius: 10px;
              padding: 15px;
              margin-bottom: 15px;
            }
            
            .section-title {
              font-size: 18px;
              color: #2c3e50;
              margin-bottom: 10px;
              border-bottom: 1px solid #bdc3c7;
              padding-bottom: 5px;
            }
            
            .practice-content {
              font-size: 20px;
              line-height: 2.2;
              font-weight: bold;
              text-align: center;
              background: white;
              padding: 15px;
              border-radius: 5px;
              border: 1px solid #ecf0f1;
            }
            
            .passage-section {
              background: #e8f5e8;
              border-color: #27ae60;
            }
            
            .passage-content {
              font-size: 16px;
              line-height: 1.8;
              text-align: left;
              font-weight: normal;
            }
            
            .target-words {
              background: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 10px;
              padding: 15px;
              text-align: center;
            }
            
            .target-words h3 {
              font-size: 18px;
              color: #856404;
              margin-bottom: 10px;
            }
            
            .words-list {
              font-size: 16px;
              font-weight: bold;
              color: #856404;
              line-height: 1.5;
            }
            
            @media print {
              body { 
                margin: 0;
                font-size: 14px;
              }
              
              .sound-page {
                margin: 0;
                padding: 5px;
              }
              
              .sound-title {
                font-size: 28px;
              }
              
              .practice-content {
                font-size: 18px;
              }
              
              /* Level-specific scaling */
              .level1, .level2 {
                transform: scale(0.9);
                transform-origin: top left;
                width: 111.11%; /* Compensate for scale */
                height: 111.11%; /* Compensate for scale */
              }
              
              .level3 {
                transform: scale(0.8);
                transform-origin: top left;
                width: 125%; /* Compensate for scale */
                height: 125%; /* Compensate for scale */
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
    
    showToast(`Printing ${soundsToPrint.length} sound page(s)...`, 'success');
  };

  const getAssignedStudents = () => {
    return groups.reduce((assigned, group) => [...assigned, ...group.students], []);
  };

  const unassignedStudents = students.filter(student => 
    !getAssignedStudents().some(assigned => assigned?.id === student.id)
  );

  // Get available sounds for selection
  const getAvailableSounds = () => {
    const sounds = [];
    BEGINNER_LEVELS.forEach(level => {
      level.sounds.forEach(sound => {
        sounds.push({
          id: sound.id,
          displayName: `${level.name.split(' - ')[1]} - ${sound.title}`,
          level: level,
          sound: sound
        });
      });
    });
    return sounds;
  };

  // Get sound for display
  const getDisplaySound = () => {
    if (!displayingSound) return null;
    
    const allSounds = [...BEGINNER_LEVEL_1_SOUNDS, ...BEGINNER_LEVEL_2_SOUNDS, ...BEGINNER_LEVEL_3_SOUNDS];
    const sound = allSounds.find(s => s.id === displayingSound);
    if (!sound) return null;
    
    const level = BEGINNER_LEVELS.find(l => l.sounds.includes(sound));
    return { sound, level };
  };

  const displaySound = getDisplaySound();

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedSounds.length > 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">🔤 Today's Reading Sounds</h1>
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
                <p className="text-2xl opacity-90">{group.students.length} students</p>
              </div>

              {group.assignedSounds.map(soundId => {
                const allSounds = [...BEGINNER_LEVEL_1_SOUNDS, ...BEGINNER_LEVEL_2_SOUNDS, ...BEGINNER_LEVEL_3_SOUNDS];
                const sound = allSounds.find(s => s.id === soundId);
                if (!sound) return null;

                return (
                  <div key={soundId} className="mb-6">
                    <h3 className="text-3xl font-bold text-center mb-2 text-gray-800">{sound.title} {sound.image}</h3>
                    <p className="text-lg text-center mb-4 text-blue-600 italic">{sound.description}</p>
                    
                    {sound.practices.map((practice, index) => (
                      <div key={index} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 mb-4">
                        <h4 className="text-lg font-bold text-gray-700 mb-2">{practice.instructions}</h4>
                        <div className="text-2xl leading-relaxed text-gray-800 text-center font-bold whitespace-pre-line">
                          {practice.content}
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-3 text-center text-sm text-gray-600">
                      <strong>Focus Words:</strong> {sound.targetWords.join(', ')}
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
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">🔤</span>
              Beginner Readers
            </h1>
            <p className="text-lg opacity-90">Early reading activities for beginning readers - {BEGINNER_LEVELS.reduce((total, level) => total + level.sounds.length, 0)} sounds available</p>
            {loadedData?.beginnerGroups && loadedData.beginnerGroups.length > 0 && !hasUnsavedChanges && (
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
              onClick={() => setShowSoundBrowser(!showSoundBrowser)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              🔤 Browse Sounds
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

      {/* Sound Display Modal */}
      {displaySound && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className={`bg-gradient-to-r ${displaySound.level.color} text-white p-6 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{displaySound.sound.title} {displaySound.sound.image}</h2>
                  <p className="text-xl opacity-90">{displaySound.level.name}</p>
                  <p className="text-lg opacity-80">{displaySound.sound.description}</p>
                </div>
                <button
                  onClick={() => setDisplayingSound(null)}
                  className="text-white hover:text-red-200 text-4xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {displaySound.sound.practices.map((practice, index) => (
                <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 mb-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-3">{practice.instructions}</h3>
                  <div className="text-3xl leading-relaxed text-gray-800 text-center font-bold font-mono whitespace-pre-line">
                    {practice.content}
                  </div>
                </div>
              ))}

              {/* Simple Passage for Level 3 */}
              {displaySound.sound.simplePassage && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-6">
                  <h3 className="text-2xl font-bold text-blue-800 mb-4 text-center">{displaySound.sound.simplePassage.title}</h3>
                  <div className="text-xl leading-relaxed text-gray-800 font-serif text-center mb-6 whitespace-pre-line">
                    {displaySound.sound.simplePassage.content}
                  </div>
                </div>
              )}

              {/* Target Words */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-800 mb-3 text-center">Focus Words</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {displaySound.sound.targetWords.map(word => (
                    <span key={word} className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-lg font-semibold">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-xl text-center">
              <button
                onClick={() => setDisplayingSound(null)}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700"
              >
                Close Display
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sound Browser Modal */}
      {showSoundBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Browse Reading Sounds</h2>
                <button
                  onClick={() => {
                    setShowSoundBrowser(false);
                    setViewingSound(null);
                    setSelectedLevel(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {viewingSound ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{viewingSound.title} {viewingSound.image}</h3>
                      <p className="text-blue-600 italic">{viewingSound.description}</p>
                      <p className="text-gray-600">{viewingSound.soundFocus}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDisplayingSound(viewingSound.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        📺 Display to Class
                      </button>
                      <button
                        onClick={() => setViewingSound(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                  {viewingSound.practices.map((practice, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-gray-700 mb-2">{practice.instructions}</h4>
                      <div className="text-xl leading-relaxed text-gray-800 font-mono text-center whitespace-pre-line">
                        {practice.content}
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-sm text-gray-600">
                      <strong>Target Words:</strong> {viewingSound.targetWords.join(', ')}
                    </p>
                  </div>
                </div>
              ) : selectedLevel ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedLevel.name}</h3>
                      <p className="text-blue-600 italic">{selectedLevel.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedLevel(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to Levels
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedLevel.sounds.map(sound => (
                      <button
                        key={sound.id}
                        onClick={() => setViewingSound(sound)}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 text-left transition-all hover:scale-105 bg-white shadow-sm hover:shadow-md"
                      >
                        <div className="text-4xl mb-2 text-center">{sound.image}</div>
                        <div className="font-bold text-lg text-center">{sound.title}</div>
                        <div className="text-sm text-gray-600 text-center mb-2">{sound.description}</div>
                        <div className="text-xs text-blue-600 text-center">{sound.targetWords.length} focus words</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {BEGINNER_LEVELS.map(level => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedLevel(level)}
                      className="p-6 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-center transition-all hover:scale-105"
                    >
                      <div className="text-5xl mb-4">{level.icon}</div>
                      <h4 className="font-bold text-xl mb-2">{level.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{level.description}</p>
                      <div className="text-xs text-blue-600 mb-2">{level.sounds.length} sounds available</div>
                      <p className="text-xs text-gray-500 italic">{level.instructions}</p>
                    </button>
                  ))}
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
          <p className="text-sm text-yellow-700 mb-3">Click "Assign Students" above to quickly assign students to beginner reading groups</p>
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

              {/* Assigned Sounds */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-gray-700 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                    Sounds:
                  </h4>
                  <button
                    onClick={() => printSounds(group.assignedSounds)}
                    disabled={group.assignedSounds.length === 0}
                    className={`bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 ${
                      groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                    }`}
                  >
                    🖨️
                  </button>
                </div>
                
                <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                  {group.assignedSounds.map(soundId => {
                    const allSounds = [...BEGINNER_LEVEL_1_SOUNDS, ...BEGINNER_LEVEL_2_SOUNDS, ...BEGINNER_LEVEL_3_SOUNDS];
                    const sound = allSounds.find(s => s.id === soundId);
                    
                    if (!sound) return null;

                    return (
                      <div key={soundId} className="bg-red-50 border border-red-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-red-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                            {sound.title} {sound.image}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDisplayingSound(soundId)}
                              className={`bg-green-500 text-white rounded hover:bg-green-600 ${
                                groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                              }`}
                              title="Display to class"
                            >
                              📺
                            </button>
                            <button
                              onClick={() => assignSoundsToGroup(group.id, group.assignedSounds.filter(id => id !== soundId))}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className={`text-red-600 italic ${groups.length >= 5 ? 'text-xs' : 'text-xs'}`}>
                            {sound.description}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value && !group.assignedSounds.includes(e.target.value)) {
                      if (group.assignedSounds.length < 8) {
                        assignSoundsToGroup(group.id, [...group.assignedSounds, e.target.value]);
                      } else {
                        showToast('Maximum 8 sounds per group', 'error');
                      }
                    }
                    e.target.value = '';
                  }}
                  className={`w-full border border-gray-300 rounded p-1 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}
                  defaultValue=""
                >
                  <option value="">Add sound...</option>
                  {getAvailableSounds().filter(sound => !group.assignedSounds.includes(sound.id)).map(sound => (
                    <option key={sound.id} value={sound.id}>
                      {sound.level.icon} {sound.displayName}
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
                <h2 className="text-2xl font-bold">👥 Assign Students to Beginner Groups</h2>
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

export default BeginnerReaders;