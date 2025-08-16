// components/curriculum/literacy/SpellingProgram.js
// CLEAN SPELLING PROGRAM WITH 59 LEVEL 1 LISTS
import React, { useState, useEffect, useRef } from 'react';

// ===============================================
// ALL 59 SPELLING LISTS FROM DOCUMENT
// ===============================================
const SPELLING_LISTS = [
  { id: "1.1", name: "Level 1.1", words: ["in", "at", "it", "an", "sit", "sat"] },
  { id: "1.2", name: "Level 1.2", words: ["pat", "tap", "nap", "tin", "pin", "pit"] },
  { id: "1.3", name: "Level 1.3", words: ["pan", "nip", "sip", "tan", "tip", "pip"] },
  { id: "1.4", name: "Level 1.4", words: ["him", "red", "did", "can", "man", "ran"] },
  { id: "1.5", name: "Level 1.5", words: ["cat", "am", "hat", "sad", "dad", "had"] },
  { id: "1.6", name: "Level 1.6", words: ["set", "men", "met", "pet", "ten", "net"] },
  { id: "1.7", name: "Level 1.7", words: ["pen", "hen", "rat", "mat", "pad", "mad"] },
  { id: "1.8", name: "Level 1.8", words: ["hip", "cap", "map", "ram", "dip", "hid"] },
  { id: "1.9", name: "Level 1.9", words: ["leg", "get", "let", "run", "sun", "fun"] },
  { id: "1.10", name: "Level 1.10", words: ["but", "hot", "cut", "got", "not", "lot"] },
  { id: "1.11", name: "Level 1.11", words: ["bad", "bed", "us", "bit", "up", "dog"] },
  { id: "1.12", name: "Level 1.12", words: ["mum", "on", "top", "if", "pig", "big"] },
  { id: "1.13", name: "Level 1.13", words: ["gum", "hug", "bag", "fed", "bus", "gap"] },
  { id: "1.14", name: "Level 1.14", words: ["cup", "mud", "rod", "fan", "lip", "rub"] },
  { id: "1.15", name: "Level 1.15", words: ["yes", "wet", "jet", "yet", "vet", "kid"] },
  { id: "1.16", name: "Level 1.16", words: ["job", "jug", "zip", "van", "win", "web"] },
  { id: "1.17", name: "Level 1.17", words: ["but", "sad", "bed", "tub", "dam", "sob", "dip", "nod"] },
  { id: "1.18", name: "Level 1.18", words: ["shed", "fish", "ship", "rush", "shop", "dish", "shot", "wish"] },
  { id: "1.19", name: "Level 1.19", words: ["chop", "such", "chip", "much", "chin", "rich", "chat", "chest"] },
  { id: "1.20", name: "Level 1.20", words: ["lash", "shelf", "shut", "mash", "hush", "chap", "chug", "much"] },
  { id: "1.21", name: "Level 1.21", words: ["that", "them", "this", "then", "with", "moth", "than", "thick"] },
  { id: "1.22", name: "Level 1.22", words: ["cash", "shin", "shift", "such", "chum", "thin", "then", "thud"] },
  { id: "1.23", name: "Level 1.23", words: ["when", "whip", "which", "whiz", "whim", "wheel", "whack", "whacked"] },
  { id: "1.24", name: "Level 1.24", words: ["duck", "sock", "pick", "sick", "thick", "kick", "back", "neck"] },
  { id: "1.25", name: "Level 1.25", words: ["desk", "risk", "thank", "milk", "rock", "shack", "chick", "pack"] },
  { id: "1.26", name: "Level 1.26", words: ["week", "see", "been", "need", "keep", "seem", "feet", "teeth"] },
  { id: "1.27", name: "Level 1.27", words: ["meet", "cheek", "feel", "sheet", "wheel", "weed", "seed", "deep"] },
  { id: "1.28", name: "Level 1.28", words: ["food", "soon", "moon", "room", "tooth", "too", "zoo", "noon"] },
  { id: "1.29", name: "Level 1.29", words: ["root", "hoop", "roof", "mood", "boot", "booth", "shoot", "loop"] },
  { id: "1.30", name: "Level 1.30", words: ["cool", "book", "look", "took", "pool", "shook", "good", "wood"] },
  { id: "1.31", name: "Level 1.31", words: ["six", "box", "fox", "wax", "tax", "fix", "mix", "fax"] },
  { id: "1.32", name: "Level 1.32", words: ["quick", "quiz", "quit", "quits", "quack", "quacks", "quilt", "queen"] },
  { id: "1.33", name: "Level 1.33", words: ["twin", "plan", "frog", "step", "from", "stop", "swim", "flag"] },
  { id: "1.34", name: "Level 1.34", words: ["black", "smash", "three", "sleep", "flash", "green", "tree", "truck"] },
  { id: "1.35", name: "Level 1.35", words: ["drum", "block", "flap", "club", "snap", "track", "flip", "flat"] },
  { id: "1.36", name: "Level 1.36", words: ["trip", "drag", "plug", "crash", "clip", "drop", "spin", "glad"] },
  { id: "1.37", name: "Level 1.37", words: ["just", "left", "and", "lunch", "land", "hand", "went", "must"] },
  { id: "1.38", name: "Level 1.38", words: ["end", "help", "next", "list", "thank", "think", "pink", "best"] },
  { id: "1.39", name: "Level 1.39", words: ["told", "gold", "old", "cold", "felt", "jump", "hold", "milk"] },
  { id: "1.40", name: "Level 1.40", words: ["soft", "lost", "shift", "pond", "wind", "cost", "damp", "bend"] },
  { id: "1.41", name: "Level 1.41", words: ["broom", "snack", "west", "thump", "fresh", "hunt", "speed", "chunk"] },
  { id: "1.42", name: "Level 1.42", words: ["slept", "stand", "blend", "stamp", "plant", "drink", "upon", "until"] },
  { id: "1.43", name: "Level 1.43", words: ["day", "play", "say", "way", "stay", "may", "today", "away"] },
  { id: "1.44", name: "Level 1.44", words: ["paint", "rain", "chain", "train", "paid", "wait", "again", "nail"] },
  { id: "1.45", name: "Level 1.45", words: ["tail", "snail", "afraid", "trail", "tray", "delay", "clay", "sway"] },
  { id: "1.46", name: "Level 1.46", words: ["call", "fall", "all", "stall", "small", "ball", "wall", "tall"] },
  { id: "1.47", name: "Level 1.47", words: ["king", "swing", "bring", "sing", "thing", "long", "song", "along"] },
  { id: "1.48", name: "Level 1.48", words: ["north", "short", "torch", "storm", "sport", "form", "for", "horse"] },
  { id: "1.49", name: "Level 1.49", words: ["start", "hard", "car", "far", "garden", "card", "park", "dark"] },
  { id: "1.50", name: "Level 1.50", words: ["shark", "star", "chart", "march", "arch", "farm", "smart", "part"] },
  { id: "1.51", name: "Level 1.51", words: ["ever", "under", "never", "number", "her", "river", "sister", "term"] },
  { id: "1.52", name: "Level 1.52", words: ["report", "forget", "thorn", "corn", "scarf", "market", "sharp", "alarm"] },
  { id: "1.53", name: "Level 1.53", words: ["carpet", "spark", "charm", "clever", "winter", "jumper", "porch", "pork"] },
  { id: "1.54", name: "Level 1.54", words: ["boy", "toy", "enjoy", "royal", "oil", "point", "soil", "joint"] },
  { id: "1.55", name: "Level 1.55", words: ["faint", "grain", "claim", "slay", "pray", "joy", "moist", "join"] },
  { id: "1.56", name: "Level 1.56", words: ["a", "I", "is", "as", "his", "has", "was", "the"] },
  { id: "1.57", name: "Level 1.57", words: ["of", "for", "me", "be", "he", "we", "she", "are"] },
  { id: "1.58", name: "Level 1.58", words: ["to", "do", "who", "into", "you", "one", "two", "said"] },
  { id: "1.59", name: "Level 1.59", words: ["they", "more", "what", "have", "put", "pull", "so", "no", "go"] }
];

// ===============================================
// SPELLING ACTIVITIES
// ===============================================
const ACTIVITIES = [
  { id: "look_cover_write", name: "Look, Cover, Write, Check", icon: "👀", color: "bg-blue-500" },
  { id: "rainbow_words", name: "Rainbow Words", icon: "🌈", color: "bg-purple-500" },
  { id: "silly_sentences", name: "Silly Sentences", icon: "😄", color: "bg-green-500" },
  { id: "word_sorting", name: "Word Sorting", icon: "📊", color: "bg-orange-500" },
  { id: "spelling_pyramid", name: "Spelling Pyramid", icon: "🔺", color: "bg-red-500" },
  { id: "trace_write", name: "Trace & Write", icon: "✏️", color: "bg-indigo-500" }
];

// ===============================================
// MAIN SPELLING PROGRAM COMPONENT
// ===============================================
const SpellingProgram = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [groups, setGroups] = useState(loadedData.spellingGroups || []);
  const [selectedLists, setSelectedLists] = useState([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);

  // Initialize groups if empty
  useEffect(() => {
    if (groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Group 1", color: "bg-blue-500", students: [], assignedLists: [], assignedActivity: null },
        { id: 2, name: "Group 2", color: "bg-green-500", students: [], assignedLists: [], assignedActivity: null },
        { id: 3, name: "Group 3", color: "bg-purple-500", students: [], assignedLists: [], assignedActivity: null }
      ];
      setGroups(defaultGroups);
      saveGroups(defaultGroups);
    }
  }, []);

  const saveGroups = (updatedGroups) => {
    setGroups(updatedGroups);
    saveData({ spellingGroups: updatedGroups });
    showToast('Groups saved successfully!', 'success');
  };

  const addGroup = () => {
    if (groups.length >= 5) {
      showToast('Maximum 5 groups allowed', 'error');
      return;
    }
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    const newGroup = {
      id: Date.now(),
      name: `Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedLists: [],
      assignedActivity: null
    };
    const updatedGroups = [...groups, newGroup];
    saveGroups(updatedGroups);
  };

  const removeGroup = (groupId) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    saveGroups(updatedGroups);
  };

  const updateGroupName = (groupId, newName) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    );
    saveGroups(updatedGroups);
  };

  const assignStudentToGroup = (studentId, groupId) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.id === groupId 
        ? [...group.students.filter(s => s.id !== studentId), students.find(s => s.id === studentId)]
        : group.students.filter(s => s.id !== studentId)
    }));
    saveGroups(updatedGroups);
  };

  const assignListsToGroup = (groupId, listIds) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, assignedLists: listIds } : g
    );
    saveGroups(updatedGroups);
  };

  const assignActivityToGroup = (groupId, activityId) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, assignedActivity: activityId } : g
    );
    saveGroups(updatedGroups);
  };

  const printLists = (listIds) => {
    const lists = SPELLING_LISTS.filter(list => listIds.includes(list.id));
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Spelling Lists</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .list { margin-bottom: 30px; page-break-inside: avoid; }
            .words { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
            .word { padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Educational Elements - Spelling Lists</h1>
            <p>Student Name: _______________  Date: _______________</p>
          </div>
          ${lists.map(list => `
            <div class="list">
              <h2>${list.name}</h2>
              <div class="words">
                ${list.words.map(word => `<div class="word">${word}</div>`).join('')}
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

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(
      isPresentationMode 
        ? 'Exited presentation mode' 
        : 'Entered presentation mode!', 
      'success'
    );
  };

  const getAssignedStudents = (students) => {
    return groups.reduce((assigned, group) => [...assigned, ...group.students], []);
  };

  const unassignedStudents = students.filter(student => 
    !getAssignedStudents(students).some(assigned => assigned?.id === student.id)
  );

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedLists.length > 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-6xl font-bold text-gray-800">📝 Today's Spelling</h1>
          <button
            onClick={togglePresentationMode}
            className="bg-gray-600 text-white px-8 py-4 rounded-xl text-2xl font-bold hover:bg-gray-700"
          >
            Exit Presentation
          </button>
        </div>

        <div className={`grid gap-8 ${activeGroups.length === 1 ? 'grid-cols-1' : activeGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {activeGroups.map(group => {
            const assignedActivity = ACTIVITIES.find(a => a.id === group.assignedActivity);
            return (
              <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
                <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                  <h2 className="text-4xl font-bold">{group.name}</h2>
                  <p className="text-2xl opacity-90">{group.students.length} students</p>
                </div>

                {group.assignedLists.map(listId => {
                  const list = SPELLING_LISTS.find(l => l.id === listId);
                  return (
                    <div key={listId} className="mb-6">
                      <h3 className="text-3xl font-bold text-center mb-4 text-gray-800">{list.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {list.words.map((word, index) => (
                          <div key={index} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
                            <span className="text-3xl font-bold text-gray-800">{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {assignedActivity && (
                  <div className={`${assignedActivity.color} text-white p-6 rounded-xl mt-6`}>
                    <div className="text-center">
                      <div className="text-6xl mb-4">{assignedActivity.icon}</div>
                      <h3 className="text-3xl font-bold">{assignedActivity.name}</h3>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">🔤</span>
              Spelling Program
            </h1>
            <p className="text-lg opacity-90">59 Level 1 spelling lists with group management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowListSelector(!showListSelector)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              📋 Browse Lists
            </button>
            <button
              onClick={togglePresentationMode}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              🎭 Presentation Mode
            </button>
          </div>
        </div>
      </div>

      {/* List Selector Modal */}
      {showListSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Select Spelling Lists</h2>
                <button
                  onClick={() => setShowListSelector(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {SPELLING_LISTS.map(list => (
                  <button
                    key={list.id}
                    onClick={() => {
                      if (selectedLists.includes(list.id)) {
                        setSelectedLists(selectedLists.filter(id => id !== list.id));
                      } else if (selectedLists.length < 5) {
                        setSelectedLists([...selectedLists, list.id]);
                      } else {
                        showToast('Maximum 5 lists can be selected', 'error');
                      }
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      selectedLists.includes(list.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm">{list.name}</div>
                    <div className="text-xs text-gray-600">{list.words.length} words</div>
                    <div className="text-xs mt-1">
                      {list.words.slice(0, 3).join(', ')}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 mb-3">👤 Unassigned Students</h3>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.map(student => (
              <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm font-medium">{student.firstName} {student.lastName}</span>
                <select
                  onChange={(e) => e.target.value && assignStudentToGroup(student.id, parseInt(e.target.value))}
                  className="ml-2 text-xs border rounded"
                  defaultValue=""
                >
                  <option value="">Assign to group...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
            {/* Group Header */}
            <div className={`${group.color} text-white p-4 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                  className="bg-transparent text-white font-bold text-lg border-none outline-none"
                />
                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-white hover:text-red-200 text-xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm opacity-90">{group.students.length} students</p>
            </div>

            <div className="p-4">
              {/* Students */}
              <div className="mb-4">
                <h4 className="font-bold text-gray-700 mb-2">Students:</h4>
                <div className="space-y-1">
                  {group.students.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{student.firstName} {student.lastName}</span>
                      <button
                        onClick={() => assignStudentToGroup(student.id, null)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {group.students.length === 0 && (
                    <p className="text-gray-500 text-sm italic">No students assigned</p>
                  )}
                </div>
              </div>

              {/* Assigned Lists */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-700">Spelling Lists:</h4>
                  <button
                    onClick={() => printLists(group.assignedLists)}
                    disabled={group.assignedLists.length === 0}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
                  >
                    🖨️ Print
                  </button>
                </div>
                
                <div className="space-y-2 mb-3">
                  {group.assignedLists.map(listId => {
                    const list = SPELLING_LISTS.find(l => l.id === listId);
                    return (
                      <div key={listId} className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-800">{list.name}</span>
                          <button
                            onClick={() => assignListsToGroup(group.id, group.assignedLists.filter(id => id !== listId))}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ×
                          </button>
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {list.words.join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value && !group.assignedLists.includes(e.target.value)) {
                      if (group.assignedLists.length < 5) {
                        assignListsToGroup(group.id, [...group.assignedLists, e.target.value]);
                      } else {
                        showToast('Maximum 5 lists per group', 'error');
                      }
                    }
                    e.target.value = '';
                  }}
                  className="w-full text-sm border border-gray-300 rounded p-2"
                  defaultValue=""
                >
                  <option value="">Add spelling list...</option>
                  {SPELLING_LISTS.filter(list => !group.assignedLists.includes(list.id)).map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Activity */}
              <div>
                <h4 className="font-bold text-gray-700 mb-2">Activity:</h4>
                {group.assignedActivity ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {ACTIVITIES.find(a => a.id === group.assignedActivity)?.icon}
                      </span>
                      <span className="font-medium text-green-800">
                        {ACTIVITIES.find(a => a.id === group.assignedActivity)?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => assignActivityToGroup(group.id, null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <select
                    onChange={(e) => e.target.value && assignActivityToGroup(group.id, e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded p-2"
                    defaultValue=""
                  >
                    <option value="">Select activity...</option>
                    {ACTIVITIES.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.icon} {activity.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Group Button */}
        {groups.length < 5 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 flex items-center justify-center">
            <button
              onClick={addGroup}
              className="text-gray-600 hover:text-gray-800 text-center"
            >
              <div className="text-4xl mb-2">+</div>
              <div className="font-bold">Add Group</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellingProgram;