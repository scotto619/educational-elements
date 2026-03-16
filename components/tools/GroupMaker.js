// GroupMaker.js - Smart Group Creation Tool (Redesigned)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarImage, calculateAvatarLevel } from '../../utils/gameHelpers';

const GroupMaker = ({ 
  students = [], 
  showToast, 
  saveGroupDataToFirebase, 
  userData, 
  currentClassId 
}) => {
  // --- State ---
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [studentPoints, setStudentPoints] = useState({}); // { studentId: points }
  const [showHistoryForGroup, setShowHistoryForGroup] = useState(null); // groupId
  
  // Settings Mode
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('random'); // 'random', 'constraints'
  
  // Random Settings
  const [groupSize, setGroupSize] = useState(4);
  const [numberOfGroups, setNumberOfGroups] = useState(0);
  const [groupingMethod, setGroupingMethod] = useState('size'); // 'size' or 'number'
  
  // Constraints
  const [constraints, setConstraints] = useState({ neverGroup: [], alwaysGroup: [] });
  const [constraintMode, setConstraintMode] = useState(null);
  const [selectedStudentsForConstraint, setSelectedStudentsForConstraint] = useState([]);
  
  // Random Picker
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSelectedGroups, setPickerSelectedGroups] = useState([]);
  const [pickerResult, setPickerResult] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Saved Groupings
  const [savedGroupings, setSavedGroupings] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (groups.length === 0 && students.length > 0) {
      setUnassignedStudents([...students]);
    }
  }, [students, groups.length]);

  // --- Date Check & Reset Logic ---
  const checkAndResetScores = (groupArray) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Get the Monday of this week
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // adjust when day is sunday
    const thisMonday = new Date(today.setDate(diff));
    const thisMondayStr = thisMonday.toISOString().split('T')[0];

    let hasChanges = false;
    const updatedGroups = groupArray.map(g => {
      const scores = g.scores || { daily: 0, weekly: 0, lastUpdatedDaily: todayStr, lastUpdatedWeekly: thisMondayStr };
      let updatedScores = { ...scores };
      let changed = false;

      if (scores.lastUpdatedDaily !== todayStr) {
        updatedScores.daily = 0;
        updatedScores.lastUpdatedDaily = todayStr;
        changed = true;
      }

      // Check if the lastUpdatedWeekly is before this Monday
      if (!scores.lastUpdatedWeekly || Array.isArray(scores.lastUpdatedWeekly) || scores.lastUpdatedWeekly < thisMondayStr) {
        updatedScores.weekly = 0;
        updatedScores.lastUpdatedWeekly = thisMondayStr;
        changed = true;
      }

      if (changed) {
        hasChanges = true;
        return { ...g, scores: updatedScores };
      }
      return g;
    });

    return { updatedGroups, hasChanges };
  };

  useEffect(() => {
    if (groups.length > 0) {
      const { updatedGroups, hasChanges } = checkAndResetScores(groups);
      if (hasChanges) {
        setGroups(updatedGroups);
      }
    }
  }, [groups.length]);

  useEffect(() => {
    if (groupingMethod === 'size' && students.length > 0) {
      setNumberOfGroups(Math.ceil(students.length / groupSize));
    }
  }, [groupSize, students.length, groupingMethod]);

  useEffect(() => {
    if (groupingMethod === 'number' && students.length > 0 && numberOfGroups > 0) {
      setGroupSize(Math.ceil(students.length / numberOfGroups));
    }
  }, [numberOfGroups, students.length, groupingMethod]);

  // --- Helpers ---
  const generateNewGroupId = () => `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const getGroupColor = (index) => {
    const colors = [
      'bg-blue-50 border-blue-200 shadow-blue-100',
      'bg-green-50 border-green-200 shadow-green-100',
      'bg-yellow-50 border-yellow-200 shadow-yellow-100',
      'bg-purple-50 border-purple-200 shadow-purple-100',
      'bg-pink-50 border-pink-200 shadow-pink-100',
      'bg-indigo-50 border-indigo-200 shadow-indigo-100',
      'bg-orange-50 border-orange-200 shadow-orange-100',
      'bg-teal-50 border-teal-200 shadow-teal-100'
    ];
    return colors[index % colors.length];
  };

  const getHeaderColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800'
    ];
    return colors[index % colors.length];
  };

  // --- Core Actions ---
  const addEmptyGroup = () => {
    setGroups(prev => [...prev, {
      id: generateNewGroupId(),
      name: `Group ${prev.length + 1}`,
      students: [],
      leaderId: null,
      scores: { daily: 0, weekly: 0, lastUpdatedDaily: new Date().toISOString().split('T')[0], lastUpdatedWeekly: new Date().toISOString().split('T')[0] },
      pointHistory: []
    }]);
  };

  const removeGroup = (groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group && group.students.length > 0) {
      setUnassignedStudents(prev => [...prev, ...group.students]);
    }
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const clearAllGroups = () => {
    setGroups([]);
    setUnassignedStudents([...students]);
    if (showToast) showToast('All groups cleared!');
  };

  // --- Drag & Drop ---
  const handleDragStart = (e, studentId, sourceId) => {
    e.dataTransfer.setData('studentId', studentId);
    e.dataTransfer.setData('sourceId', sourceId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('studentId');
    const sourceId = e.dataTransfer.getData('sourceId');
    
    if (!studentId || sourceId === targetId) return;

    let studentToMove = null;
    
    if (sourceId === 'unassigned') {
      studentToMove = unassignedStudents.find(s => s.id === studentId);
    } else {
      const g = groups.find(g => g.id === sourceId);
      if (g) studentToMove = g.students.find(s => s.id === studentId);
    }

    if (!studentToMove) return;

    if (sourceId === 'unassigned') {
      setUnassignedStudents(prev => prev.filter(s => s.id !== studentId));
    } else {
      setGroups(prev => prev.map(group => {
        if (group.id === sourceId) {
          return {
            ...group,
            students: group.students.filter(s => s.id !== studentId),
            leaderId: group.leaderId === studentId ? null : group.leaderId
          };
        }
        return group;
      }));
    }

    if (targetId === 'unassigned') {
      setUnassignedStudents(prev => [...prev, studentToMove]);
    } else {
      setGroups(prev => prev.map(group => {
        if (group.id === targetId) {
          return { ...group, students: [...group.students, studentToMove] };
        }
        return group;
      }));
    }
  };

  // --- Group Info Updates ---
  const updateGroupName = (groupId, newName) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name: newName } : g));
  };

  const toggleLeader = (groupId, studentId) => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return { ...g, leaderId: g.leaderId === studentId ? null : studentId };
      }
      return g;
    }));
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const updateGroupScore = (groupId, type, delta, reason = 'Teacher Adjustment') => {
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const historyEntry = {
          id: Date.now(),
          target: 'Group',
          delta,
          type,
          reason,
          timestamp: new Date().toLocaleTimeString()
        };

        const newDaily = type === 'daily' ? Math.max(0, g.scores.daily + delta) : g.scores.daily;
        // Notice that modifying 'daily' also adjusts 'weekly'
        const newWeekly = type === 'daily' ? Math.max(0, g.scores.weekly + delta) : g.scores.weekly;

        return {
          ...g,
          scores: { 
            ...g.scores, 
            daily: newDaily,
            weekly: newWeekly,
            lastUpdatedDaily: type === 'daily' ? getTodayStr() : g.scores.lastUpdatedDaily,
            lastUpdatedWeekly: type === 'daily' ? getTodayStr() : g.scores.lastUpdatedWeekly
          },
          pointHistory: [historyEntry, ...(g.pointHistory || [])].slice(0, 50)
        };
      }
      return g;
    }));
  };

  const updateStudentPoints = (groupId, studentId, studentName, delta) => {
    // 1. Update individual floating point state 
    setStudentPoints(prev => ({
      ...prev,
      [studentId]: Math.max(0, (prev[studentId] || 0) + delta)
    }));

    // 2. Cascade points to the group's daily and weekly totals
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const historyEntry = {
          id: Date.now(),
          target: studentName,
          delta,
          type: 'daily & weekly',
          reason: 'Individual Award',
          timestamp: new Date().toLocaleTimeString()
        };

        return {
          ...g,
          scores: {
            ...g.scores,
            daily: Math.max(0, g.scores.daily + delta),
            weekly: Math.max(0, g.scores.weekly + delta),
            lastUpdatedDaily: getTodayStr(),
            lastUpdatedWeekly: getTodayStr()
          },
          pointHistory: [historyEntry, ...(g.pointHistory || [])].slice(0, 50)
        };
      }
      return g;
    }));
  };

  // --- Random Generation ---
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateGroups = () => {
    if (students.length === 0) {
      if (showToast) showToast('No students available to group!', 'error');
      return;
    }

    const canGroupTogether = (s1, s2) => {
      return !constraints.neverGroup.some(c => c.includes(s1.id) && c.includes(s2.id));
    };

    let availableStudents = [...students];
    let generatedGroups = [];
    
    constraints.alwaysGroup.forEach(c => {
      if (c.length > 0) {
        const cStudents = availableStudents.filter(s => c.includes(s.id));
        if (cStudents.length > 0) {
          generatedGroups.push(cStudents);
          availableStudents = availableStudents.filter(s => !c.includes(s.id));
        }
      }
    });

    availableStudents = shuffleArray(availableStudents);

    const targetGroupCount = groupingMethod === 'number' ? numberOfGroups : Math.ceil(students.length / groupSize);
    const targetGroupSize = groupingMethod === 'size' ? groupSize : Math.ceil(students.length / numberOfGroups);

    let groupIndex = 0;
    while (availableStudents.length > 0 && groupIndex < generatedGroups.length) {
      while (generatedGroups[groupIndex].length < targetGroupSize && availableStudents.length > 0) {
        let added = false;
        for (let i = 0; i < availableStudents.length; i++) {
          const s = availableStudents[i];
          if (generatedGroups[groupIndex].every(gm => canGroupTogether(s, gm))) {
            generatedGroups[groupIndex].push(s);
            availableStudents.splice(i, 1);
            added = true;
            break;
          }
        }
        if (!added) break;
      }
      groupIndex++;
    }

    while (availableStudents.length > 0) {
      const newG = [];
      newG.push(availableStudents.shift());
      
      while (newG.length < targetGroupSize && availableStudents.length > 0) {
        let added = false;
        for (let i = 0; i < availableStudents.length; i++) {
          const s = availableStudents[i];
          if (newG.every(gm => canGroupTogether(s, gm))) {
            newG.push(s);
            availableStudents.splice(i, 1);
            added = true;
            break;
          }
        }
        if (!added) break;
      }
      generatedGroups.push(newG);
    }

    while (availableStudents.length > 0) {
      const s = availableStudents.shift();
      let tGroup = null;
      let minSize = Infinity;
      
      for (const group of generatedGroups) {
        if (group.length < minSize && group.every(gm => canGroupTogether(s, gm))) {
          tGroup = group;
          minSize = group.length;
        }
      }
      
      if (tGroup) tGroup.push(s);
      else generatedGroups.push([s]);
    }

    const finalGroups = generatedGroups.map((arr, i) => ({
      id: generateNewGroupId(),
      name: `Group ${i + 1}`,
      students: arr,
      leaderId: null,
      scores: { daily: 0, weekly: 0, lastUpdatedDaily: new Date().toISOString().split('T')[0], lastUpdatedWeekly: new Date().toISOString().split('T')[0] },
      pointHistory: []
    }));

    setGroups(finalGroups);
    setUnassignedStudents([]);
    setShowSettings(false);
    if (showToast) showToast(`Created ${finalGroups.length} groups!`);
  };

  // --- Save / Load ---
  const saveGrouping = () => {
    if (groups.length === 0) {
      if (showToast) showToast('No groups to save!', 'error');
      return;
    }

    const grouping = {
      id: Date.now(),
      name: `Grouping ${new Date().toLocaleDateString()}`,
      groupsToSave: groups, 
      method: groupingMethod,
      groupSize: groupSize,
      createdAt: new Date()
    };

    setSavedGroupings(prev => [grouping, ...prev]);
    if (saveGroupDataToFirebase && currentClassId) {
      saveGroupDataToFirebase(currentClassId, grouping);
    }
    if (showToast) showToast('Grouping saved!');
  };

  const loadGrouping = (grouping) => {
    let loadedGroups = [];
    if (grouping.groupsToSave) {
      loadedGroups = grouping.groupsToSave;
    } else if (grouping.groups) {
      loadedGroups = grouping.groups.map((arr, i) => ({
        id: generateNewGroupId(),
        name: `Group ${i + 1}`,
        students: arr,
        leaderId: null,
        scores: { daily: 0, weekly: 0, lastUpdatedDaily: new Date().toISOString().split('T')[0], lastUpdatedWeekly: new Date().toISOString().split('T')[0] },
        pointHistory: []
      }));
    }
    
    // Check dates and reset if necessary on load
    const { updatedGroups } = checkAndResetScores(loadedGroups);
    setGroups(updatedGroups);

    setUnassignedStudents([]);
    setShowSaved(false);
    if (showToast) showToast('Grouping loaded!');
  };

  // --- Random Picker ---
  const toggleGroupSelectionForPicker = (groupId) => {
    setPickerSelectedGroups(prev => 
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const pickRandomStudent = () => {
    if (pickerSelectedGroups.length === 0) return;
    
    let pool = [];
    groups.forEach(g => {
      if (pickerSelectedGroups.includes(g.id)) {
        pool.push(...g.students);
      }
    });

    if (pool.length === 0) {
      if (showToast) showToast('No students in selected groups!', 'error');
      return;
    }

    setIsSpinning(true);
    setPickerResult(null);
    
    let spins = 0;
    const duration = 20; 
    
    const spinInterval = setInterval(() => {
      const luckyIndex = Math.floor(Math.random() * pool.length);
      setPickerResult(pool[luckyIndex]);
      spins++;
      
      if (spins > duration) {
        clearInterval(spinInterval);
        setIsSpinning(false);
      }
    }, 100);
  };

  const renderStudentCard = (student, groupId) => {
    const level = calculateAvatarLevel(student.totalPoints || 0);
    const avatarImg = getAvatarImage(student.avatarBase, level);
    
    return (
    <motion.div 
      layout
      layoutId={student.id}
      draggable
      onDragStart={(e) => handleDragStart(e, student.id, groupId)}
      className="flex items-center justify-between p-2 mb-2 bg-white rounded-lg border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-300 transition-colors"
    >
      <div className="flex items-center space-x-2">
        {avatarImg && (
          <img src={avatarImg} alt={student.firstName} className="w-8 h-8 rounded-full border border-gray-200 object-cover bg-blue-50" />
        )}
        <span className="font-semibold text-gray-700">{student.firstName}</span>
        {groupId !== 'unassigned' && groups.find(g => g.id === groupId)?.leaderId === student.id && (
          <span title="Group Leader">👑</span>
        )}
      </div>

      {groupId !== 'unassigned' && (
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => updateStudentPoints(groupId, student.id, student.firstName, -1)}
            className="w-6 h-6 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 flex items-center justify-center font-bold"
          >-</button>
          <span className="text-sm font-bold w-4 text-center">{studentPoints[student.id] || 0}</span>
          <button 
            onClick={() => updateStudentPoints(groupId, student.id, student.firstName, 1)}
            className="w-6 h-6 text-xs bg-green-100 text-green-600 rounded-full hover:bg-green-200 flex items-center justify-center font-bold"
          >+</button>
          <button 
            onClick={() => toggleLeader(groupId, student.id)}
            className="ml-1 text-gray-400 hover:text-yellow-500 transition-colors text-sm"
            title="Toggle Leader"
          >
            ⭐
          </button>
        </div>
      )}
    </motion.div>
  )};

  if (students.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-500">Please add students to your class first.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen rounded-2xl">
      {/* Top Application Bar */}
      <div className="bg-white px-6 py-4 rounded-t-2xl border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
            <span className="text-blue-500">✨</span> Group Maker
          </h2>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button onClick={addEmptyGroup} className="flex items-center gap-1 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-100 transition shadow-sm border border-indigo-100">
            ➕ Add Group
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm">
            🎲 Auto Generate
          </button>
          <button onClick={() => setShowPicker(true)} className="flex items-center gap-1 px-4 py-2 bg-purple-50 text-purple-600 font-semibold rounded-lg hover:bg-purple-100 transition shadow-sm border border-purple-100">
            🎯 Name Picker
          </button>
          
          <div className="h-10 w-px bg-gray-200 mx-1"></div>
          
          <button onClick={() => setShowSaved(true)} className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition" title="Saved Groupings">
            💾
          </button>
          <button onClick={clearAllGroups} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Clear All Groups">
            🗑️
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button onClick={() => setActiveTab('random')} className={`px-4 py-2 font-semibold ${activeTab === 'random' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Randomize Settings</button>
                  <button onClick={() => setActiveTab('constraints')} className={`px-4 py-2 font-semibold ${activeTab === 'constraints' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>Constraints</button>
                </div>

                {activeTab === 'random' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">Generation Method</h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="radio" value="size" checked={groupingMethod === 'size'} onChange={(e) => setGroupingMethod(e.target.value)} className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">By Group Size ({groupSize} per group)</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input type="radio" value="number" checked={groupingMethod === 'number'} onChange={(e) => setGroupingMethod(e.target.value)} className="w-5 h-5 text-blue-600" />
                          <span className="text-gray-700 font-medium">By Number of Groups ({numberOfGroups} groups)</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-4">
                        {groupingMethod === 'size' ? 'Students Per Group' : 'Target Groups Count'}
                      </h3>
                      <input
                        type="number"
                        min="1"
                        max={students.length}
                        value={groupingMethod === 'size' ? groupSize : numberOfGroups}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          groupingMethod === 'size' ? setGroupSize(val) : setNumberOfGroups(val);
                        }}
                        className="w-full text-lg px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition"
                      />
                      <button onClick={generateGroups} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition">
                        ⚡ Generate Random Groups Now
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'constraints' && (
                  <div>
                    <div className="flex gap-4 mb-4">
                      <button onClick={() => { setConstraintMode('neverGroup'); setSelectedStudentsForConstraint([]); }} className={`px-4 py-2 rounded-lg font-bold ${constraintMode === 'neverGroup' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'}`}>
                        Never Group (-)
                      </button>
                      <button onClick={() => { setConstraintMode('alwaysGroup'); setSelectedStudentsForConstraint([]); }} className={`px-4 py-2 rounded-lg font-bold ${constraintMode === 'alwaysGroup' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>
                        Always Group (+)
                      </button>
                    </div>

                    {constraintMode && (
                      <div className="mb-4 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                        <p className="font-semibold text-gray-700 mb-2">Select students to {constraintMode === 'neverGroup' ? 'keep apart' : 'keep together'}:</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {students.map(s => {
                            const isSelected = selectedStudentsForConstraint.find(ss => ss.id === s.id);
                            return (
                              <button key={s.id} onClick={() => handleStudentSelectForConstraint(s)} className={`px-3 py-1.5 rounded-full border-2 text-sm font-semibold transition ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'}`}>
                                {s.firstName}
                              </button>
                            );
                          })}
                        </div>
                        <button onClick={() => addConstraint(constraintMode)} disabled={selectedStudentsForConstraint.length < 2} className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50">
                          Add Constraint Rule
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {constraints.neverGroup.length > 0 && (
                        <div>
                          <h4 className="font-bold text-red-700 mb-2">Never Together</h4>
                          <div className="space-y-2">
                            {constraints.neverGroup.map((c, i) => (
                              <div key={i} className="flex justify-between p-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium">
                                <span>{c.map(id => students.find(s => s.id === id)?.firstName).join(', ')}</span>
                                <button onClick={() => removeConstraint('neverGroup', i)} className="text-red-500">❌</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {constraints.alwaysGroup.length > 0 && (
                        <div>
                          <h4 className="font-bold text-green-700 mb-2">Always Together</h4>
                          <div className="space-y-2">
                            {constraints.alwaysGroup.map((c, i) => (
                              <div key={i} className="flex justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-sm font-medium">
                                <span>{c.map(id => students.find(s => s.id === id)?.firstName).join(', ')}</span>
                                <button onClick={() => removeConstraint('alwaysGroup', i)} className="text-green-500">❌</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Workspace Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Unassigned Pool */}
          {unassignedStudents.length > 0 && (
            <div 
              className="lg:w-1/4 min-w-[250px] bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'unassigned')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-700 uppercase tracking-wider text-sm">Unassigned ({unassignedStudents.length})</h3>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">Drag & Drop</span>
              </div>
              <div className="flex flex-col h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
                {unassignedStudents.map(s => renderStudentCard(s, 'unassigned'))}
              </div>
            </div>
          )}

          {/* Groups Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max items-start">
            {groups.map((group, index) => (
              <motion.div 
                layout
                key={group.id} 
                className={`rounded-2xl border-2 flex flex-col ${getGroupColor(index)} shadow-sm`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, group.id)}
              >
                {/* Group Header */}
                <div className={`p-4 rounded-t-xl ${getHeaderColor(index)} border-b border-inherit`}>
                  <div className="flex justify-between items-center mb-2">
                    <input 
                      value={group.name}
                      onChange={(e) => updateGroupName(group.id, e.target.value)}
                      className="bg-transparent font-bold text-lg w-full outline-none mr-2 focus:bg-white/50 rounded px-1 transition-colors"
                    />
                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowHistoryForGroup(group.id)} className="text-blue-500 hover:text-blue-700 font-bold text-sm bg-blue-50 px-2 py-1 rounded" title="View History">📜</button>
                      <button onClick={() => removeGroup(group.id)} className="text-gray-500 hover:text-red-500 font-bold" title="Remove Group">✕</button>
                    </div>
                  </div>

                  {/* Group Scores (Daily & Weekly) */}
                  <div className="flex gap-4 text-sm font-semibold bg-white/40 p-2 rounded-lg">
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xs uppercase opacity-80 mb-1">Daily</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateGroupScore(group.id, 'daily', -1)} className="hover:scale-110 active:scale-95 transition-transform">-</button>
                        <span className="text-lg">{group.scores.daily || 0}</span>
                        <button onClick={() => updateGroupScore(group.id, 'daily', 1)} className="hover:scale-110 active:scale-95 transition-transform">+</button>
                      </div>
                    </div>
                    <div className="w-px bg-black/10"></div>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-xs uppercase opacity-80 mb-1">Weekly</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{group.scores.weekly || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group Members */}
                <div className="p-4 bg-white/90 rounded-b-xl flex-1 min-h-[150px]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase">{group.students.length} Members</span>
                    {group.leaderId && <span className="text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-200">Leader Assigned</span>}
                  </div>
                  <div className="space-y-1">
                    {group.students.map(s => renderStudentCard(s, group.id))}
                    {group.students.length === 0 && (
                      <div className="h-full min-h-[100px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
                        Drag students here
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {groups.length === 0 && unassignedStudents.length === 0 && (
              <div className="col-span-full"></div> // Replaces the big warning since we handle it at root
            )}
          </div>
        </div>
      </div>

      {/* Random Name Picker Modal */}
      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-2">Random Name Picker</h2>
              <p className="text-gray-500 mb-6 font-medium">Select groups to draw a student from</p>
              
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {groups.map(g => (
                  <button 
                    key={g.id} 
                    onClick={() => toggleGroupSelectionForPicker(g.id)}
                    className={`px-4 py-2 rounded-full font-bold border-2 transition-colors ${pickerSelectedGroups.includes(g.id) ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50'}`}
                  >
                    {g.name}
                  </button>
                ))}
                <button 
                  onClick={() => setPickerSelectedGroups(groups.map(g=>g.id))}
                  className="px-4 py-2 rounded-full font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  All Groups
                </button>
              </div>

               <div className="h-32 flex items-center justify-center bg-gray-50 rounded-xl border-4 border-gray-100 mb-6 relative overflow-hidden">
                 <AnimatePresence mode="popLayout">
                   {pickerResult ? (
                     <motion.div 
                       key={pickerResult.id}
                       initial={{ y: 20, opacity: 0 }}
                       animate={{ y: 0, opacity: 1 }}
                       exit={{ y: -20, opacity: 0, position: 'absolute' }}
                       className="flex items-center space-x-3"
                     >
                       {getAvatarImage(pickerResult.avatarBase, calculateAvatarLevel(pickerResult.totalPoints || 0)) && (
                         <img src={getAvatarImage(pickerResult.avatarBase, calculateAvatarLevel(pickerResult.totalPoints || 0))} className="w-12 h-12 rounded-full shadow-md object-cover bg-blue-50" />
                       )}
                       <span className={`text-3xl font-black ${isSpinning ? 'text-gray-400' : 'text-purple-600'}`}>{pickerResult.firstName}</span>
                     </motion.div>
                   ) : (
                     <span className="text-gray-400 font-bold text-xl">Ready to spin...</span>
                   )}
                 </AnimatePresence>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowPicker(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Close</button>
                <button onClick={pickRandomStudent} disabled={isSpinning || pickerSelectedGroups.length === 0} className={`flex-1 px-4 py-3 font-bold rounded-xl transition ${isSpinning ? 'bg-gray-300' : 'bg-purple-600 text-white hover:bg-purple-700'}`}>
                  {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Groupings Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Saved Groupings</h2>
                <button onClick={() => setShowSaved(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              
              <button onClick={saveGrouping} disabled={groups.length === 0} className="w-full mb-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">
                💾 Save Current Grouping
              </button>

              <div className="max-h-[60vh] overflow-y-auto space-y-3">
                {savedGroupings.length === 0 && <p className="text-center text-gray-500 py-8">No saved groupings yet.</p>}
                {savedGroupings.map((g, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-gray-800">{g.name}</div>
                      <div className="text-sm text-gray-500">{g.groupsToSave ? g.groupsToSave.length : g.groups.length} Groups</div>
                    </div>
                    <button onClick={() => loadGrouping(g)} className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200">
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Point History Modal */}
      <AnimatePresence>
        {showHistoryForGroup && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <span>📜</span> {groups.find(g => g.id === showHistoryForGroup)?.name} History
                </h2>
                <button onClick={() => setShowHistoryForGroup(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {groups.find(g => g.id === showHistoryForGroup)?.pointHistory?.length > 0 ? (
                  groups.find(g => g.id === showHistoryForGroup).pointHistory.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 text-sm">
                           {entry.delta > 0 ? '+' : ''}{entry.delta} from {entry.target}
                        </span>
                        <span className="text-xs text-gray-500">{entry.reason}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-medium text-gray-400 uppercase">{entry.type}</span>
                        <span className="text-xs text-gray-400">{entry.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6 italic border-2 border-dashed border-gray-100 rounded-xl">No point history for this group yet.</p>
                )}
              </div>
              
              <button onClick={() => setShowHistoryForGroup(null)} className="mt-6 w-full py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GroupMaker;