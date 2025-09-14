// components/student/StudentReadingForFun.js
// STUDENT INTERFACE FOR READING FOR FUN - Advanced readers enjoying longer texts
import React, { useState, useEffect } from 'react';

// Import fun reading texts from the teacher files
import { FUN_NARRATIVE_TEXTS } from '../curriculum/literacy/funTexts/FunNarrativeTexts';
import { FUN_INFORMATIONAL_TEXTS } from '../curriculum/literacy/funTexts/FunInformationalTexts';
import { FUN_PERSUASIVE_TEXTS } from '../curriculum/literacy/funTexts/FunPersuasiveTexts';
import { FUN_POETRY_TEXTS } from '../curriculum/literacy/funTexts/FunPoetryTexts';
import { FUN_COMEDY_TEXTS } from '../curriculum/literacy/funTexts/FunComedyTexts';
import { FUN_READERS_THEATRE_TEXTS } from '../curriculum/literacy/funTexts/FunReadersTheatreTexts'; // NEW IMPORT

// Text category configurations - UPDATED WITH THEATRE
const FUN_TEXT_CATEGORIES = [
  { 
    id: "narrative", 
    name: "Adventure Stories", 
    icon: "🚀", 
    color: "bg-purple-500", 
    description: "Epic adventures and exciting journeys",
    texts: FUN_NARRATIVE_TEXTS
  },
  { 
    id: "informational", 
    name: "Cool Facts", 
    icon: "🤯", 
    color: "bg-blue-500", 
    description: "Amazing facts about your favorite topics",
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
    description: "Poems and verses with attitude",
    texts: FUN_POETRY_TEXTS
  },
  { 
    id: "comedy", 
    name: "Laugh Zone", 
    icon: "😂", 
    color: "bg-pink-500", 
    description: "Jokes and funny stories",
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

const StudentReadingForFun = ({ 
  studentData, 
  classData, 
  showToast 
}) => {
  const [studentAssignments, setStudentAssignments] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [readingMode, setReadingMode] = useState('comfortable'); // 'comfortable' or 'focus'
  const [readingProgress, setReadingProgress] = useState({});

  useEffect(() => {
    if (studentData && classData) {
      findStudentAssignments();
    }
  }, [studentData, classData]);

  const findStudentAssignments = () => {
    // Get fun reading groups from class toolkit data
    const funReadingGroups = classData?.toolkitData?.funReadingGroups || [];
    
    // Find which group this student belongs to
    const studentGroup = funReadingGroups.find(group => 
      group.students.some(s => s.id === studentData.id)
    );

    if (studentGroup) {
      // Get assigned reading texts
      const assignedTexts = [];
      
      studentGroup.assignedTexts.forEach(textId => {
        const [categoryId, textIndex] = textId.split('-');
        const category = FUN_TEXT_CATEGORIES.find(c => c.id === categoryId);
        if (category) {
          const text = category.texts[parseInt(textIndex)];
          if (text) {
            // Check if this student has a character assignment for this text
            let assignedCharacter = null;
            if (category.id === 'theatre' && studentGroup.characterAssignments) {
              // Find which character this student is assigned to
              Object.keys(studentGroup.characterAssignments).forEach(character => {
                if (studentGroup.characterAssignments[character] === studentData.id) {
                  assignedCharacter = character;
                }
              });
            }

            assignedTexts.push({
              id: textId,
              category: category,
              text: text,
              categoryId: categoryId,
              textIndex: parseInt(textIndex),
              myCharacter: assignedCharacter // For theatre scripts
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

  // Mark text as read/in progress
  const updateReadingProgress = (textId, status) => {
    const newProgress = { ...readingProgress };
    newProgress[textId] = {
      status: status, // 'reading', 'completed'
      timestamp: new Date().toISOString()
    };
    setReadingProgress(newProgress);
    
    // Could save to database here in real implementation
    console.log(`Updated reading progress for ${textId}: ${status}`);
  };

  // Get reading time estimate
  const getReadingTime = (wordCount) => {
    // Average reading speed for teens is 200-250 words per minute
    return Math.ceil(wordCount / 225);
  };

  // Render selected text for reading - UPDATED WITH THEATRE SUPPORT
  if (selectedText) {
    const isTheatreScript = selectedText.category.id === 'theatre';
    
    return (
      <div className="space-y-6">
        {/* Reading Header */}
        <div className={`bg-gradient-to-r ${selectedText.category.color} text-white rounded-xl p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{selectedText.text.title}</h1>
              <p className="text-lg opacity-90">{selectedText.category.name}</p>
              <div className="flex items-center gap-4 text-sm opacity-80 mt-2">
                <span>📖 {selectedText.text.wordCount} words</span>
                <span>⏱️ ~{getReadingTime(selectedText.text.wordCount)} min read</span>
                {isTheatreScript && selectedText.text.characters && (
                  <span>🎭 {selectedText.text.characters.length} characters</span>
                )}
              </div>
              {selectedText.myCharacter && (
                <div className="mt-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                  <p className="text-sm font-bold">Your Character: {selectedText.myCharacter}</p>
                </div>
              )}
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
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={() => setReadingMode('comfortable')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  readingMode === 'comfortable' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📖 Comfortable Reading
              </button>
              <button
                onClick={() => setReadingMode('focus')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  readingMode === 'focus' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎯 Focus Mode
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateReadingProgress(selectedText.id, 'reading')}
                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
              >
                📚 Mark as Reading
              </button>
              <button
                onClick={() => updateReadingProgress(selectedText.id, 'completed')}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                ✅ Mark as Finished
              </button>
            </div>
          </div>
        </div>

        {/* Theatre-specific character info */}
        {isTheatreScript && selectedText.text.characters && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎭 Characters in This Script</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {selectedText.text.characters.map(character => (
                <div 
                  key={character} 
                  className={`p-3 rounded-lg border text-center ${
                    character === selectedText.myCharacter 
                      ? 'bg-indigo-100 border-indigo-400 text-indigo-800 font-bold' 
                      : 'bg-gray-100 border-gray-300 text-gray-700'
                  }`}
                >
                  {character}
                  {character === selectedText.myCharacter && (
                    <div className="text-xs mt-1">👆 That's you!</div>
                  )}
                </div>
              ))}
            </div>
            {selectedText.myCharacter && (
              <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-bold text-indigo-800 mb-2">🎯 Your Role: {selectedText.myCharacter}</h4>
                <p className="text-indigo-700 text-sm">
                  Look for your character's lines in the script below. Practice reading them with expression!
                </p>
              </div>
            )}
            {selectedText.text.estimatedTime && (
              <div className="mt-4 text-center">
                <p className="text-gray-600">⏱️ Performance Time: {selectedText.text.estimatedTime}</p>
                <p className="text-gray-600">📊 Difficulty: {selectedText.text.difficulty}</p>
              </div>
            )}
          </div>
        )}

        {/* Reading Text */}
        <div className={`bg-white rounded-xl shadow-lg ${
          readingMode === 'focus' ? 'p-8 md:p-12' : 'p-6'
        }`}>
          <div className={`${selectedText.category.color} text-white p-4 rounded-lg mb-6 text-center`}>
            <div className="text-3xl mb-2">{selectedText.category.icon}</div>
            <h3 className="text-xl font-bold">{selectedText.category.name}</h3>
            <p className="text-sm opacity-90">{selectedText.category.description}</p>
          </div>
          
          <div className={`bg-gray-50 border-2 border-gray-200 rounded-xl p-6 ${
            readingMode === 'focus' ? 'md:p-12' : 'md:p-8'
          }`}>
            {isTheatreScript ? (
              // Special formatting for theatre scripts
              <div className={`text-gray-800 leading-relaxed ${
                readingMode === 'focus' 
                  ? 'text-lg md:text-xl' 
                  : 'text-base md:text-lg'
              }`}>
                {selectedText.text.content.split('\n').map((line, index) => {
                  line = line.trim();
                  if (line.startsWith('**') && line.endsWith('**')) {
                    const content = line.substring(2, line.length - 2);
                    if (content.includes(':** (')) {
                      const [character, rest] = content.split(':** (');
                      const isMyCharacter = character === selectedText.myCharacter;
                      return (
                        <div key={index} className={`mb-3 ${isMyCharacter ? 'bg-indigo-100 p-2 rounded border-l-4 border-indigo-500' : ''}`}>
                          <span className={`font-bold ${isMyCharacter ? 'text-indigo-800 text-lg' : 'text-purple-800'}`}>
                            {character}:
                          </span>
                          <span className="text-gray-600 italic"> ({rest}</span>
                        </div>
                      );
                    } else if (content.includes(':** ')) {
                      const [character, dialogue] = content.split(':** ');
                      const isMyCharacter = character === selectedText.myCharacter;
                      return (
                        <div key={index} className={`mb-3 ${isMyCharacter ? 'bg-indigo-100 p-2 rounded border-l-4 border-indigo-500' : ''}`}>
                          <span className={`font-bold ${isMyCharacter ? 'text-indigo-800 text-lg' : 'text-purple-800'}`}>
                            {character}:
                          </span>
                          <span className="ml-2">{dialogue}</span>
                        </div>
                      );
                    }
                  }
                  return (
                    <div key={index} className="mb-2 text-gray-600 italic">
                      {line}
                    </div>
                  );
                })}
              </div>
            ) : (
              // Regular text formatting
              <div className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${
                readingMode === 'focus' 
                  ? 'text-xl md:text-2xl font-serif text-center' 
                  : 'text-base md:text-lg font-serif'
              }`}>
                {selectedText.text.content}
              </div>
            )}
          </div>
        </div>

        {/* Theatre-specific tips */}
        {isTheatreScript ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🎭 Readers Theatre Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-bold text-purple-800 mb-2">Know Your Character</h4>
                <p className="text-sm text-purple-700">Practice your lines and think about your character's personality</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🔊</div>
                <h4 className="font-bold text-blue-800 mb-2">Use Your Voice</h4>
                <p className="text-sm text-blue-700">Change your tone and volume to bring your character to life</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-bold text-green-800 mb-2">Work Together</h4>
                <p className="text-sm text-green-700">Listen to other actors and react to what they say</p>
              </div>
            </div>
          </div>
        ) : (
          // Regular reading tips for advanced readers
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📚 Advanced Reading Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🤔</div>
                <h4 className="font-bold text-blue-800 mb-2">Think Critically</h4>
                <p className="text-sm text-blue-700">Question what you read and form your own opinions</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-bold text-green-800 mb-2">Make Connections</h4>
                <p className="text-sm text-green-700">Connect what you read to your life and other texts</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">💭</div>
                <h4 className="font-bold text-purple-800 mb-2">Visualize & Imagine</h4>
                <p className="text-sm text-purple-700">Create mental images of what you're reading</p>
              </div>
            </div>
          </div>
        )}

        {/* Post-Reading Reflection */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            {isTheatreScript ? '🎭 After Performing' : '✨ After Reading'} Reflection
          </h3>
          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-700 mb-2">
                {isTheatreScript ? '🎯 How did your character make you feel?' : '🎯 What was the main message or theme?'}
              </h4>
              <p className="text-sm text-gray-600">
                {isTheatreScript 
                  ? 'Think about what it was like to be that character and how they might think or feel.'
                  : 'Think about the central idea the author was trying to communicate.'
                }
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-700 mb-2">
                {isTheatreScript ? '⭐ What was your favorite part to perform?' : '⭐ What did you like or dislike about this text?'}
              </h4>
              <p className="text-sm text-gray-600">
                {isTheatreScript
                  ? 'Which lines or scenes were the most fun or challenging to perform?'
                  : 'Consider the style, content, and how it made you feel.'
                }
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-700 mb-2">🤝 Would you recommend this to a friend? Why?</h4>
              <p className="text-sm text-gray-600">
                {isTheatreScript
                  ? 'Think about who might enjoy performing this script and why.'
                  : 'Think about who might enjoy this text and why.'
                }
              </p>
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
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 md:p-8">
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <span className="mr-3">🎉</span>
            Reading for Fun
          </h1>
          <div className="text-lg md:text-xl opacity-90">
            {studentData.firstName}'s Advanced Reading Corner
          </div>
          <div className="text-sm md:text-base opacity-80 mt-2">
            Stories, facts, debates, poems, comedy & theatre scripts!
          </div>
        </div>
      </div>

      {studentAssignments && studentAssignments.texts.length > 0 ? (
        <div className="space-y-6">
          {/* Group Header */}
          <div className={`${studentAssignments.groupColor} text-white rounded-xl p-6`}>
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center justify-center">
                <span className="mr-3">📚</span>
                My Fun Reading Collection
              </h2>
              <div className="text-lg opacity-90">
                {studentAssignments.groupName}
              </div>
              <div className="text-sm opacity-80 mt-2">
                {studentAssignments.texts.length} amazing text{studentAssignments.texts.length !== 1 ? 's' : ''} to explore
              </div>
            </div>
          </div>

          {/* Reading Progress Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 My Reading Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {studentAssignments.texts.length}
                </div>
                <div className="text-sm text-blue-700">Total Texts</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {Object.values(readingProgress).filter(p => p.status === 'reading').length}
                </div>
                <div className="text-sm text-yellow-700">Currently Reading</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(readingProgress).filter(p => p.status === 'completed').length}
                </div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
            </div>
          </div>

          {/* Reading Texts */}
          <div className="grid gap-6">
            {studentAssignments.texts.map(textData => {
              const progress = readingProgress[textData.id];
              const isReading = progress?.status === 'reading';
              const isCompleted = progress?.status === 'completed';
              const isTheatreScript = textData.category.id === 'theatre';

              return (
                <div key={textData.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
                  <div className={`${textData.category.color} text-white p-4 md:p-6 rounded-t-xl relative`}>
                    {/* Progress Badge */}
                    {(isReading || isCompleted) && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-yellow-500 text-gray-800'
                        }`}>
                          {isCompleted ? '✅ Finished' : '📖 Reading'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold">{textData.text.title}</h2>
                        <p className="text-sm md:text-base opacity-90">{textData.category.name}</p>
                        <div className="flex items-center gap-4 text-xs md:text-sm opacity-80 mt-2">
                          <span>📖 {textData.text.wordCount} words</span>
                          <span>⏱️ ~{getReadingTime(textData.text.wordCount)} min read</span>
                          {isTheatreScript && textData.text.characters && (
                            <span>🎭 {textData.text.characters.length} characters</span>
                          )}
                        </div>
                        {textData.myCharacter && (
                          <div className="mt-2 bg-white bg-opacity-20 rounded px-2 py-1">
                            <p className="text-xs font-bold">Your Role: {textData.myCharacter}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-3xl md:text-4xl">{textData.category.icon}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6">
                    {/* Preview of text */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="text-gray-800 text-sm md:text-base leading-relaxed">
                        {textData.text.content.substring(0, 200)}
                        {textData.text.content.length > 200 && '...'}
                      </div>
                    </div>
                    
                    {/* Category description */}
                    <div className="mb-4">
                      <p className="text-gray-600 text-sm md:text-base italic">
                        {textData.category.description}
                        {isTheatreScript && ' - Get ready to perform!'}
                      </p>
                    </div>

                    {/* Read/Perform button */}
                    <div className="text-center">
                      <button
                        onClick={() => setSelectedText(textData)}
                        className={`${textData.category.color} text-white px-6 py-3 rounded-lg font-semibold text-sm md:text-base hover:opacity-90 transition-opacity`}
                      >
                        {isTheatreScript ? (
                          isCompleted ? '🎭 Perform Again' : isReading ? '🎭 Continue Script' : '🎭 Start Script'
                        ) : (
                          isCompleted ? '📖 Read Again' : isReading ? '📖 Continue Reading' : '🚀 Start Reading'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // No Assignments View - UPDATED
        <div className="bg-white rounded-xl p-6 md:p-8 text-center">
          <div className="text-4xl md:text-6xl mb-4">🎉</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Fun Reading Assigned Yet</h2>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
            Your teacher hasn't assigned you to a fun reading group yet. When they do, you'll find awesome texts here including:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FUN_TEXT_CATEGORIES.map(category => (
              <div key={category.id} className={`${category.color} text-white rounded-lg p-4`}>
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-bold text-lg mb-2">{category.name}</h3>
                <p className="text-sm opacity-90">{category.description}</p>
                <div className="text-xs opacity-80 mt-2">
                  {category.texts.length} texts available
                </div>
              </div>
            ))}
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
            <p className="text-purple-800 text-sm">
              🎯 <strong>Ask your teacher</strong> to assign you to a fun reading group!
            </p>
          </div>
        </div>
      )}

      {/* Reading Benefits for Advanced Readers - UPDATED */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🌟 Why Reading for Fun Makes You Even Smarter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2 text-center">🧠 Brain Power Boost:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Expands vocabulary and language skills</li>
              <li>• Improves critical thinking abilities</li>
              <li>• Enhances creativity and imagination</li>
              <li>• Develops empathy and understanding</li>
              <li>• Builds performance and presentation skills (theatre)</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2 text-center">🚀 Life Skills:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Better communication and writing</li>
              <li>• Increased cultural awareness</li>
              <li>• Confidence in public speaking (theatre)</li>
              <li>• Stress relief and relaxation</li>
              <li>• Preparation for advanced academics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentReadingForFun;