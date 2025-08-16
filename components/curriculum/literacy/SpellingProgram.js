// components/curriculum/literacy/SpellingProgram.js
// COMPREHENSIVE SPELLING PROGRAM WITH WORD LISTS AND ACTIVITIES
import React, { useState, useRef } from 'react';

// ===============================================
// LEVEL 1 SPELLING WORD LISTS - FROM DOCUMENT
// ===============================================
const SPELLING_WORD_LISTS = {
  level1: {
    name: "Level 1 - Foundation Words",
    description: "Essential phonetic words and high-frequency words",
    lists: [
      {
        id: "list_1a",
        name: "List 1A - Basic CVC Words",
        category: "Short Vowels",
        words: ["in", "at", "it", "an", "sit", "sat", "set", "men", "met", "pet", "ten", "net", "bad", "bed", "us", "bit", "up", "dog"]
      },
      {
        id: "list_1b", 
        name: "List 1B - CVC Continuation",
        category: "Short Vowels",
        words: ["pat", "tap", "nap", "tin", "pin", "pit", "pen", "hen", "rat", "mat", "pad", "mad", "mum", "on", "top", "if", "pig", "big"]
      },
      {
        id: "list_1c",
        name: "List 1C - More CVC Words",
        category: "Short Vowels", 
        words: ["pan", "nip", "sip", "tan", "tip", "pip", "hip", "cap", "map", "ram", "dip", "hid", "gum", "hug", "bag", "fed", "bus", "gap"]
      },
      {
        id: "list_1d",
        name: "List 1D - Final CVC Set",
        category: "Short Vowels",
        words: ["him", "red", "did", "can", "man", "ran", "leg", "get", "let", "run", "sun", "fun", "cup", "mud", "rod", "fan", "lip", "rub"]
      },
      {
        id: "list_2a",
        name: "List 2A - Basic Extensions",
        category: "Consonant Blends",
        words: ["cat", "am", "hat", "sad", "dad", "had", "but", "hot", "cut", "got", "not", "lot", "yes", "wet", "jet", "yet", "vet", "kid"]
      },
      {
        id: "list_2b",
        name: "List 2B - Consonant Clusters",
        category: "Consonant Blends", 
        words: ["job", "jug", "zip", "van", "win", "web", "but", "sad", "bed", "tub", "dam", "sob", "dip", "nod"]
      },
      {
        id: "list_3a",
        name: "List 3A - Digraphs SH/CH",
        category: "Digraphs",
        words: ["shed", "fish", "ship", "rush", "shop", "dish", "shot", "wish", "chop", "such", "chip", "much", "chin", "rich", "chat", "chest"]
      },
      {
        id: "list_3b",
        name: "List 3B - More Digraphs",
        category: "Digraphs",
        words: ["lash", "shelf", "shut", "mash", "hush", "chap", "chug", "much", "cash", "shin", "shift", "such", "chum", "thin", "then", "thud"]
      },
      {
        id: "list_4a",
        name: "List 4A - TH/WH Words",
        category: "Digraphs",
        words: ["that", "them", "this", "then", "with", "moth", "than", "thick", "when", "whip", "which", "whiz", "whim", "wheel", "whack", "whacked"]
      },
      {
        id: "list_4b",
        name: "List 4B - CK Endings",
        category: "Consonant Digraphs",
        words: ["duck", "sock", "pick", "sick", "thick", "kick", "back", "neck", "desk", "risk", "thank", "milk", "rock", "shack", "chick", "pack"]
      },
      {
        id: "list_5a",
        name: "List 5A - Long Vowels EE/OO",
        category: "Long Vowels",
        words: ["week", "see", "been", "need", "keep", "seem", "feet", "teeth", "meet", "cheek", "feel", "sheet", "wheel", "weed", "seed", "deep"]
      },
      {
        id: "list_5b",
        name: "List 5B - More Long Vowels",
        category: "Long Vowels",
        words: ["food", "soon", "moon", "room", "tooth", "too", "zoo", "noon", "root", "hoop", "roof", "mood", "boot", "booth", "shoot", "loop"]
      },
      {
        id: "list_5c",
        name: "List 5C - Cool/Book Pattern",
        category: "Long Vowels",
        words: ["cool", "book", "look", "took", "pool", "shook", "good", "wood"]
      },
      {
        id: "list_6a",
        name: "List 6A - Blends & QU",
        category: "Consonant Blends",
        words: ["six", "box", "fox", "wax", "tax", "fix", "mix", "fax", "quick", "quiz", "quit", "quits", "quack", "quacks", "quilt", "queen"]
      },
      {
        id: "list_6b", 
        name: "List 6B - Initial Blends",
        category: "Consonant Blends",
        words: ["twin", "plan", "frog", "step", "from", "stop", "swim", "flag", "black", "smash", "three", "sleep", "flash", "green", "tree", "truck"]
      },
      {
        id: "list_6c",
        name: "List 6C - More Blends",
        category: "Consonant Blends", 
        words: ["drum", "block", "flap", "club", "snap", "track", "flip", "flat", "trip", "drag", "plug", "crash", "clip", "drop", "spin", "glad"]
      },
      {
        id: "list_7a",
        name: "List 7A - Final Blends",
        category: "Final Consonant Blends",
        words: ["just", "left", "and", "lunch", "land", "hand", "went", "must", "end", "help", "next", "list", "thank", "think", "pink", "best"]
      },
      {
        id: "list_7b",
        name: "List 7B - More Final Blends", 
        category: "Final Consonant Blends",
        words: ["told", "gold", "old", "cold", "felt", "jump", "hold", "milk", "soft", "lost", "shift", "pond", "wind", "cost", "damp", "bend"]
      },
      {
        id: "list_8a",
        name: "List 8A - Complex Words",
        category: "Complex Patterns",
        words: ["broom", "snack", "west", "thump", "fresh", "hunt", "speed", "chunk", "slept", "stand", "blend", "stamp", "plant", "drink", "upon", "until"]
      },
      {
        id: "list_8b",
        name: "List 8B - AI/AY Patterns",
        category: "Vowel Teams",
        words: ["day", "play", "say", "way", "stay", "may", "today", "away", "paint", "rain", "chain", "train", "paid", "wait", "again", "nail"]
      },
      {
        id: "list_8c",
        name: "List 8C - More Vowel Teams",
        category: "Vowel Teams",
        words: ["tail", "snail", "afraid", "trail", "tray", "delay", "clay", "sway"]
      },
      {
        id: "list_9a",
        name: "List 9A - ALL Family",
        category: "Word Families",
        words: ["call", "fall", "all", "stall", "small", "ball", "wall", "tall"]
      },
      {
        id: "list_9b",
        name: "List 9B - ING Family", 
        category: "Word Families",
        words: ["king", "swing", "bring", "sing", "thing", "long", "song", "along"]
      },
      {
        id: "list_9c",
        name: "List 9C - OR/AR Sounds",
        category: "R-Controlled Vowels",
        words: ["north", "short", "torch", "storm", "sport", "form", "for", "horse", "start", "hard", "car", "far", "garden", "card", "park", "dark"]
      },
      {
        id: "list_9d",
        name: "List 9D - More R-Controlled",
        category: "R-Controlled Vowels", 
        words: ["shark", "star", "chart", "march", "arch", "farm", "smart", "part"]
      },
      {
        id: "list_10a",
        name: "List 10A - ER Sounds",
        category: "R-Controlled Vowels",
        words: ["ever", "under", "never", "number", "her", "river", "sister", "term", "report", "forget", "thorn", "corn", "scarf", "market", "sharp", "alarm"]
      },
      {
        id: "list_10b",
        name: "List 10B - Complex R-Controlled",
        category: "R-Controlled Vowels",
        words: ["carpet", "spark", "charm", "clever", "winter", "jumper", "porch", "pork"]
      },
      {
        id: "list_11a",
        name: "List 11A - OY/OI Sounds",
        category: "Diphthongs",
        words: ["boy", "toy", "enjoy", "royal", "oil", "point", "soil", "joint", "faint", "grain", "claim", "slay", "pray", "joy", "moist", "join"]
      },
      {
        id: "list_12a",
        name: "List 12A - High Frequency Words Set 1",
        category: "High Frequency",
        words: ["a", "I", "is", "as", "his", "has", "was", "the", "of", "for", "me", "be", "he", "we", "she", "are", "to", "do", "who", "into", "you", "one", "two", "said"]
      },
      {
        id: "list_12b",
        name: "List 12B - High Frequency Words Set 2", 
        category: "High Frequency",
        words: ["they", "more", "what", "have", "put", "pull", "so", "no", "go"]
      }
    ]
  }
};

// ===============================================
// DAILY SPELLING ACTIVITIES
// ===============================================
const DAILY_ACTIVITIES = [
  {
    id: "look_say_cover_write_check",
    name: "Look, Say, Cover, Write, Check",
    icon: "👀",
    description: "Classic spelling practice method",
    instructions: [
      "1. 👀 LOOK at the word carefully",
      "2. 🗣️ SAY the word out loud", 
      "3. 🙈 COVER the word",
      "4. ✍️ WRITE the word from memory",
      "5. ✅ CHECK your spelling"
    ]
  },
  {
    id: "rainbow_words",
    name: "Rainbow Words",
    icon: "🌈", 
    description: "Write words in different colors",
    instructions: [
      "1. Write each spelling word",
      "2. Use a different color for each letter",
      "3. Make your words look like rainbows!",
      "4. Say each word as you write it"
    ]
  },
  {
    id: "silly_sentences",
    name: "Silly Sentences",
    icon: "😄",
    description: "Create funny sentences with spelling words",
    instructions: [
      "1. Choose 3-5 spelling words",
      "2. Create a silly sentence using all words",
      "3. Make it as funny as possible!",
      "4. Share your sentence with the class"
    ]
  },
  {
    id: "word_sorting",
    name: "Word Sorting",
    icon: "📊",
    description: "Sort words by patterns or features",
    instructions: [
      "1. Look at your spelling words",
      "2. Find words that are similar",
      "3. Sort them into groups",
      "4. Explain why you grouped them together"
    ]
  },
  {
    id: "spelling_pyramid",
    name: "Spelling Pyramid",
    icon: "🔺",
    description: "Build words letter by letter",
    instructions: [
      "1. Write the first letter of your word",
      "2. Write the first two letters below it",
      "3. Keep adding letters to build a pyramid",
      "4. Example: c → ca → cat"
    ]
  },
  {
    id: "trace_and_write",
    name: "Trace and Write",
    icon: "✏️",
    description: "Trace words then write independently",
    instructions: [
      "1. Trace each spelling word 3 times",
      "2. Write the word 3 times without tracing",
      "3. Say each letter as you write it",
      "4. Check your spelling when finished"
    ]
  },
  {
    id: "word_search_create",
    name: "Create Word Search",
    icon: "🔍",
    description: "Make a word search with spelling words",
    instructions: [
      "1. Draw a grid on paper",
      "2. Hide your spelling words in the grid",
      "3. Fill empty spaces with random letters",
      "4. Give to a friend to solve!"
    ]
  }
];

// ===============================================
// STUDENT GROUP MANAGEMENT COMPONENT
// ===============================================
const StudentGroupManager = ({ students, onSaveGroups, savedGroups = [], isPresentationMode }) => {
  const [groups, setGroups] = useState(savedGroups.length > 0 ? savedGroups : [
    { id: 1, name: "Group 1", students: [], assignedList: null },
    { id: 2, name: "Group 2", students: [], assignedList: null },
    { id: 3, name: "Group 3", students: [], assignedList: null }
  ]);
  const [draggedStudent, setDraggedStudent] = useState(null);

  const handleDragStart = (e, student) => {
    setDraggedStudent(student);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, groupId) => {
    e.preventDefault();
    if (!draggedStudent) return;

    const newGroups = groups.map(group => {
      // Remove student from current group
      const filteredStudents = group.students.filter(s => s.id !== draggedStudent.id);
      
      // Add to target group
      if (group.id === groupId) {
        return { ...group, students: [...filteredStudents, draggedStudent] };
      }
      return { ...group, students: filteredStudents };
    });

    setGroups(newGroups);
    setDraggedStudent(null);
    onSaveGroups(newGroups);
  };

  const assignListToGroup = (groupId, listId) => {
    const newGroups = groups.map(group => 
      group.id === groupId ? { ...group, assignedList: listId } : group
    );
    setGroups(newGroups);
    onSaveGroups(newGroups);
  };

  if (isPresentationMode) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-4xl font-bold text-center mb-8">📚 Today's Spelling Groups</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {groups.map(group => {
            const assignedList = SPELLING_WORD_LISTS.level1.lists.find(list => list.id === group.assignedList);
            return (
              <div key={group.id} className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="text-2xl font-bold text-blue-800 mb-4">{group.name}</h4>
                {assignedList && (
                  <div className="bg-blue-100 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 font-semibold text-xl">{assignedList.name}</p>
                    <p className="text-blue-600 text-lg">{assignedList.category}</p>
                  </div>
                )}
                <div className="space-y-2">
                  {group.students.map(student => (
                    <div key={student.id} className="bg-white p-3 rounded-lg border border-blue-200">
                      <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800">👥 Student Groups & List Assignment</h3>
      
      {/* Unassigned Students */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-lg font-bold text-gray-700 mb-4">📋 Unassigned Students</h4>
        <div className="flex flex-wrap gap-2">
          {students.filter(student => 
            !groups.some(group => group.students.some(s => s.id === student.id))
          ).map(student => (
            <div
              key={student.id}
              draggable
              onDragStart={(e) => handleDragStart(e, student)}
              className="bg-white border-2 border-gray-300 rounded-lg p-3 cursor-move hover:shadow-md transition-all"
            >
              <p className="font-semibold">{student.firstName} {student.lastName}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map(group => {
          const assignedList = SPELLING_WORD_LISTS.level1.lists.find(list => list.id === group.assignedList);
          return (
            <div
              key={group.id}
              className="bg-white rounded-xl border-2 border-blue-200 p-6 min-h-64"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, group.id)}
            >
              <h4 className="text-xl font-bold text-blue-800 mb-4">{group.name}</h4>
              
              {/* List Assignment */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned List:</label>
                <select
                  value={group.assignedList || ""}
                  onChange={(e) => assignListToGroup(group.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">No list assigned</option>
                  {SPELLING_WORD_LISTS.level1.lists.map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              {assignedList && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-blue-800 font-semibold">{assignedList.name}</p>
                  <p className="text-blue-600 text-sm">{assignedList.category}</p>
                  <p className="text-xs text-blue-500">{assignedList.words.length} words</p>
                </div>
              )}

              {/* Students in Group */}
              <div className="space-y-2">
                {group.students.map(student => (
                  <div key={student.id} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                  </div>
                ))}
                {group.students.length === 0 && (
                  <p className="text-gray-500 text-center py-8">Drop students here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ===============================================
// WORD LIST DISPLAY COMPONENT
// ===============================================
const WordListDisplay = ({ list, isPresentationMode }) => {
  const printRef = useRef(null);

  const handlePrint = () => {
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${list.name} - Spelling Words</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 10px; 
              line-height: 1.6; 
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .copy {
              margin-bottom: 30px;
              padding: 15px;
              border: 2px solid #333;
              page-break-inside: avoid;
            }
            .copy h3 {
              margin-top: 0;
              color: #333;
            }
            .word-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 15px;
            }
            .word {
              padding: 8px;
              border: 1px solid #ddd;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
            }
            .cut-line {
              border-top: 2px dashed #999;
              margin: 15px 0;
              text-align: center;
              color: #666;
              font-size: 12px;
              padding-top: 5px;
            }
            @media print {
              .cut-line { 
                page-break-after: avoid; 
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Educational Elements</h1>
            <h2>${list.name}</h2>
            <p>Category: ${list.category} | ${list.words.length} words</p>
          </div>
          
          ${Array.from({ length: 4 }, (_, i) => `
            <div class="copy">
              <h3>Copy ${i + 1} - Student Name: _______________</h3>
              <div class="word-grid">
                ${list.words.map(word => `<div class="word">${word}</div>`).join('')}
              </div>
              <p style="margin-top: 20px;">
                <strong>Instructions:</strong> Practice these words daily using the "Look, Say, Cover, Write, Check" method.
              </p>
            </div>
            ${i < 3 ? '<div class="cut-line">✂️ Cut along this line ✂️</div>' : ''}
          `).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  if (isPresentationMode) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <h2 className="text-6xl font-bold text-purple-800 mb-8">{list.name}</h2>
        <p className="text-3xl text-purple-600 mb-8">{list.category}</p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {list.words.map((word, index) => (
            <div key={index} className="bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
              <span className="text-4xl font-bold text-purple-800">{word}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{list.name}</h3>
          <p className="text-gray-600">Category: {list.category} • {list.words.length} words</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-semibold flex items-center gap-2"
        >
          🖨️ Print 4 Copies
        </button>
      </div>

      <div ref={printRef} className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {list.words.map((word, index) => (
            <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <span className="text-lg font-bold text-purple-800">{word}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// DAILY ACTIVITY DISPLAY COMPONENT
// ===============================================
const DailyActivityDisplay = ({ activity, selectedWords = [], isPresentationMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (isPresentationMode) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12">
        <div className="text-center mb-12">
          <div className="text-8xl mb-6">{activity.icon}</div>
          <h2 className="text-6xl font-bold text-green-800 mb-4">{activity.name}</h2>
          <p className="text-3xl text-green-600">{activity.description}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-8 mb-8">
          <h3 className="text-4xl font-bold text-green-800 mb-6">📋 Instructions:</h3>
          <div className="space-y-6">
            {activity.instructions.map((instruction, index) => (
              <div 
                key={index} 
                className={`text-3xl p-6 rounded-lg border-2 transition-all ${
                  currentStep === index 
                    ? 'bg-green-200 border-green-500 font-bold' 
                    : 'bg-white border-green-200'
                }`}
              >
                {instruction}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-8">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="bg-gray-500 text-white px-12 py-6 rounded-lg font-bold text-3xl disabled:opacity-50"
          >
            ⬅️ Previous
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(activity.instructions.length - 1, currentStep + 1))}
            disabled={currentStep === activity.instructions.length - 1}
            className="bg-green-500 text-white px-12 py-6 rounded-lg font-bold text-3xl disabled:opacity-50"
          >
            Next ➡️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">{activity.icon}</div>
        <h3 className="text-2xl font-bold text-green-800">{activity.name}</h3>
        <p className="text-green-600">{activity.description}</p>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="text-lg font-bold text-green-800 mb-4">📋 Instructions:</h4>
        <div className="space-y-3">
          {activity.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-200 text-green-800 rounded-full text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <p className="text-green-700">{instruction}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedWords.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="text-lg font-bold text-blue-800 mb-3">📝 Today's Words:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedWords.map((word, index) => (
              <span key={index} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-semibold">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================================
// MAIN SPELLING PROGRAM COMPONENT
// ===============================================
const SpellingProgram = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedList, setSelectedList] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(DAILY_ACTIVITIES[0]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [studentGroups, setStudentGroups] = useState(loadedData.spellingGroups || []);
  const [currentDay, setCurrentDay] = useState(0);

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(
      isPresentationMode 
        ? 'Exited presentation mode' 
        : 'Entered presentation mode - perfect for classroom display!', 
      'success'
    );
  };

  const handleSaveGroups = (groups) => {
    setStudentGroups(groups);
    saveData({ spellingGroups: groups });
    showToast('Student groups saved successfully!', 'success');
  };

  const handleSelectList = (list) => {
    setSelectedList(list);
    setActiveView('wordlist');
    showToast(`Selected ${list.name} - ${list.words.length} words`, 'info');
  };

  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
    setActiveView('activity');
    showToast(`Selected ${activity.name} activity`, 'success');
  };

  // Overview screen
  if (activeView === 'overview') {
    return (
      <div className={`space-y-6 ${isPresentationMode ? 'bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen' : ''}`}>
        {/* Header */}
        <div className={`bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-6 shadow-lg ${isPresentationMode ? 'p-12' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-7xl animate-pulse' : 'text-4xl'}`}>
                <span className="mr-3">🔤</span>
                Spelling Program
              </h3>
              <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>Structured spelling lists with engaging activities</p>
            </div>
            <button
              onClick={togglePresentationMode}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>🎯 Quick Actions</h4>
          <div className={`grid gap-4 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-2 md:grid-cols-4'}`}>
            <button 
              onClick={() => setActiveView('groups')}
              className={`bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 ${isPresentationMode ? 'p-10' : ''}`}
            >
              <div className={`text-center ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>👥</div>
              <h5 className={`font-bold mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Manage Groups</h5>
              <p className={`text-sm opacity-90 ${isPresentationMode ? 'text-xl' : ''}`}>Assign lists to students</p>
            </button>

            <button 
              onClick={() => setActiveView('lists')}
              className={`bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 ${isPresentationMode ? 'p-10' : ''}`}
            >
              <div className={`text-center ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>📝</div>
              <h5 className={`font-bold mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Word Lists</h5>
              <p className={`text-sm opacity-90 ${isPresentationMode ? 'text-xl' : ''}`}>View & print lists</p>
            </button>

            <button 
              onClick={() => setActiveView('activities')}
              className={`bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 ${isPresentationMode ? 'p-10' : ''}`}
            >
              <div className={`text-center ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>🎯</div>
              <h5 className={`font-bold mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Daily Activities</h5>
              <p className={`text-sm opacity-90 ${isPresentationMode ? 'text-xl' : ''}`}>Interactive practice</p>
            </button>

            <button 
              onClick={() => setActiveView('assessment')}
              className={`bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 ${isPresentationMode ? 'p-10' : ''}`}
            >
              <div className={`text-center ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>📊</div>
              <h5 className={`font-bold mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>Assessment</h5>
              <p className={`text-sm opacity-90 ${isPresentationMode ? 'text-xl' : ''}`}>Track progress</p>
            </button>
          </div>
        </div>

        {/* Program Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>📚 Level 1 Program Overview</h4>
          <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className={`font-bold text-blue-800 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>📊 Statistics</h5>
              <ul className={`text-blue-700 space-y-1 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                <li>• {SPELLING_WORD_LISTS.level1.lists.length} spelling lists</li>
                <li>• {SPELLING_WORD_LISTS.level1.lists.reduce((total, list) => total + list.words.length, 0)} total words</li>
                <li>• {DAILY_ACTIVITIES.length} activity types</li>
                <li>• Covers all essential phonetic patterns</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className={`font-bold text-green-800 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>🎯 Categories Covered</h5>
              <ul className={`text-green-700 space-y-1 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                <li>• Short Vowels (CVC words)</li>
                <li>• Consonant Blends & Digraphs</li>
                <li>• Long Vowels & Vowel Teams</li>
                <li>• R-Controlled Vowels</li>
                <li>• High Frequency Words</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className={`font-bold text-purple-800 mb-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>✨ Features</h5>
              <ul className={`text-purple-700 space-y-1 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                <li>• Differentiated groups</li>
                <li>• Printable word lists</li>
                <li>• Interactive activities</li>
                <li>• Progress tracking</li>
                <li>• Classroom display mode</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Featured Activity */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className={`${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>⭐</span>
            <div>
              <h4 className={`font-bold text-yellow-800 mb-2 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>Featured Activity: Look, Say, Cover, Write, Check</h4>
              <p className={`text-yellow-700 mb-4 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
                The classic spelling practice method that builds visual memory and reinforces correct spelling patterns.
                Perfect for daily practice and proven effective for all learning styles!
              </p>
              <button
                onClick={() => handleSelectActivity(DAILY_ACTIVITIES[0])}
                className={`bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
              >
                Try This Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Student Groups View
  if (activeView === 'groups') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">👥 Student Groups & List Assignment</h3>
          <div className="flex gap-3">
            <button
              onClick={togglePresentationMode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
            <button 
              onClick={() => setActiveView('overview')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Back to Overview
            </button>
          </div>
        </div>

        <StudentGroupManager 
          students={students}
          onSaveGroups={handleSaveGroups}
          savedGroups={studentGroups}
          isPresentationMode={isPresentationMode}
        />
      </div>
    );
  }

  // Word Lists View
  if (activeView === 'lists') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">📝 Spelling Word Lists</h3>
          <button 
            onClick={() => setActiveView('overview')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Back to Overview
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPELLING_WORD_LISTS.level1.lists.map(list => (
            <button
              key={list.id}
              onClick={() => handleSelectList(list)}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-purple-300"
            >
              <h4 className="text-lg font-bold text-gray-800 mb-2">{list.name}</h4>
              <p className="text-purple-600 font-semibold mb-2">{list.category}</p>
              <p className="text-gray-600 text-sm mb-4">{list.words.length} words</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {list.words.slice(0, 6).map((word, i) => (
                  <span key={i} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                    {word}
                  </span>
                ))}
                {list.words.length > 6 && (
                  <span className="text-gray-500 text-xs">+{list.words.length - 6} more</span>
                )}
              </div>
              <span className="text-purple-500 font-semibold">View List →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Individual Word List View
  if (activeView === 'wordlist' && selectedList) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{selectedList.name}</h3>
            <p className="text-gray-600">{selectedList.category} • {selectedList.words.length} words</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={togglePresentationMode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
            <button 
              onClick={() => setActiveView('lists')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Back to Lists
            </button>
          </div>
        </div>

        <WordListDisplay list={selectedList} isPresentationMode={isPresentationMode} />
      </div>
    );
  }

  // Activities View
  if (activeView === 'activities') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">🎯 Daily Spelling Activities</h3>
          <button 
            onClick={() => setActiveView('overview')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Back to Overview
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DAILY_ACTIVITIES.map(activity => (
            <button
              key={activity.id}
              onClick={() => handleSelectActivity(activity)}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-green-300"
            >
              <div className="text-4xl mb-4">{activity.icon}</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">{activity.name}</h4>
              <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
              <div className="text-xs text-gray-500 mb-4">
                {activity.instructions.length} steps
              </div>
              <span className="text-green-500 font-semibold">Try Activity →</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Individual Activity View
  if (activeView === 'activity' && selectedActivity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{selectedActivity.name}</h3>
            <p className="text-gray-600">{selectedActivity.description}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={togglePresentationMode}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
            <button 
              onClick={() => setActiveView('activities')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ← Back to Activities
            </button>
          </div>
        </div>

        <DailyActivityDisplay 
          activity={selectedActivity} 
          selectedWords={selectedList ? selectedList.words.slice(0, 5) : []}
          isPresentationMode={isPresentationMode}
        />
      </div>
    );
  }

  // Assessment View (Coming Soon)
  if (activeView === 'assessment') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-800">📊 Spelling Assessment</h3>
          <button 
            onClick={() => setActiveView('overview')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Back to Overview
          </button>
        </div>

        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Assessment Tools</h3>
          <p className="text-gray-600 mb-6">Student progress tracking and spelling assessments</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
            <h4 className="font-bold text-blue-800 mb-2">🌟 Coming Soon!</h4>
            <p className="text-blue-700 text-sm">
              Spelling tests, progress charts, and individual student tracking will be available in the next update.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SpellingProgram;