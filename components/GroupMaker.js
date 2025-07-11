// GroupMaker.js - Advanced Student Group Management Tool
import React, { useState, useEffect, useRef } from 'react';

const GroupMaker = ({ students, showToast, saveGroupDataToFirebase, userData, currentClassId }) => {
  const [groups, setGroups] = useState([]);
  const [groupSize, setGroupSize] = useState('auto');
  const [constraints, setConstraints] = useState({
    neverGroup: [], // Array of student ID pairs that should never be grouped
    alwaysGroup: [] // Array of student ID groups that should always be grouped
  });
  const [showConstraints, setShowConstraints] = useState(false);
  const [savedGroups, setSavedGroups] = useState([]);
  const [editingGroupName, setEditingGroupName] = useState(null);
  const [draggedStudent, setDraggedStudent] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [selectedStudentsForConstraint, setSelectedStudentsForConstraint] = useState([]);
  const [constraintMode, setConstraintMode] = useState(null); // 'never' or 'always'

  // Load saved data on component mount
  useEffect(() => {
    loadGroupData();
  }, [currentClassId]);

  const loadGroupData = async () => {
    // In a real app, this would load from Firebase
    // For now, we'll use localStorage as a demo
    try {
      const savedData = localStorage.getItem(`groupData_${currentClassId}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setConstraints(data.constraints || { neverGroup: [], alwaysGroup: [] });
        setSavedGroups(data.savedGroups || []);
      }
    } catch (error) {
      console.error('Error loading group data:', error);
    }
  };

  const saveGroupData = async (newConstraints = constraints, newSavedGroups = savedGroups) => {
    try {
      const dataToSave = {
        constraints: newConstraints,
        savedGroups: newSavedGroups
      };
      localStorage.setItem(`groupData_${currentClassId}`, JSON.stringify(dataToSave));
      
      // Also save to Firebase if the function is available
      if (saveGroupDataToFirebase) {
        await saveGroupDataToFirebase(dataToSave);
      }
    } catch (error) {
      console.error('Error saving group data:', error);
    }
  };

  // Check if two students should never be grouped together
  const shouldNeverGroup = (student1Id, student2Id) => {
    return constraints.neverGroup.some(pair => 
      (pair.includes(student1Id) && pair.includes(student2Id))
    );
  };

  // Get students that must always be grouped with a given student
  const getAlwaysGroupWith = (studentId) => {
    const alwaysGroup = constraints.alwaysGroup.find(group => 
      group.includes(studentId)
    );
    return alwaysGroup ? alwaysGroup.filter(id => id !== studentId) : [];
  };

  // Generate groups with constraints
  const generateGroups = () => {
    if (students.length === 0) {
      showToast('No students available to group!');
      return;
    }

    const availableStudents = [...students];
    const newGroups = [];
    const usedStudents = new Set();

    // First, handle "always group" constraints
    constraints.alwaysGroup.forEach(alwaysGroupIds => {
      if (alwaysGroupIds.every(id => availableStudents.find(s => s.id === id))) {
        const groupStudents = alwaysGroupIds.map(id => 
          availableStudents.find(s => s.id === id)
        ).filter(Boolean);
        
        if (groupStudents.length > 0) {
          newGroups.push({
            id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `Group ${newGroups.length + 1}`,
            students: groupStudents
          });
          groupStudents.forEach(student => usedStudents.add(student.id));
        }
      }
    });

    // Get remaining students
    const remainingStudents = availableStudents.filter(s => !usedStudents.has(s.id));
    
    if (remainingStudents.length === 0) {
      setGroups(newGroups);
      showToast(`Created ${newGroups.length} groups from constraints`);
      return;
    }

    // Shuffle remaining students
    const shuffled = [...remainingStudents].sort(() => Math.random() - 0.5);

    // Determine target group size
    let targetSize;
    if (groupSize === 'auto') {
      // Auto-balance: aim for groups of 3-5 students
      const idealSize = 4;
      const numGroups = Math.ceil(shuffled.length / idealSize);
      targetSize = Math.ceil(shuffled.length / numGroups);
    } else {
      targetSize = parseInt(groupSize);
    }

    // Create groups with proper size management
    const studentsToPlace = [...shuffled];
    let attempts = 0;
    const maxAttempts = shuffled.length * 3; // Prevent infinite loops

    while (studentsToPlace.length > 0 && attempts < maxAttempts) {
      attempts++;
      
      // Calculate remaining groups needed and adjust target size if necessary
      const remainingStudents = studentsToPlace.length;
      const groupsStillNeeded = Math.ceil(remainingStudents / targetSize);
      let currentTargetSize = targetSize;
      
      // If this is the last batch and we have a small remainder, distribute more evenly
      if (groupSize !== 'auto' && remainingStudents <= targetSize * 1.5 && remainingStudents > targetSize) {
        // Split remainder across 2 groups instead of making one full and one tiny group
        currentTargetSize = Math.ceil(remainingStudents / 2);
      }

      const currentGroup = [];
      const groupStudentIds = [];
      
      // Try to fill current group to target size
      for (let i = 0; i < studentsToPlace.length && currentGroup.length < currentTargetSize; i++) {
        const student = studentsToPlace[i];
        let canAdd = true;

        // Check constraints with current group members
        for (const groupStudent of currentGroup) {
          if (shouldNeverGroup(student.id, groupStudent.id)) {
            canAdd = false;
            break;
          }
        }

        if (canAdd) {
          currentGroup.push(student);
          groupStudentIds.push(student.id);
        }
      }

      // If we couldn't form a group of minimum size due to constraints
      if (currentGroup.length === 0) {
        // Take the first available student to avoid infinite loop
        if (studentsToPlace.length > 0) {
          currentGroup.push(studentsToPlace[0]);
          groupStudentIds.push(studentsToPlace[0].id);
        }
      }

      // Only create group if we have students
      if (currentGroup.length > 0) {
        newGroups.push({
          id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `Group ${newGroups.length + 1}`,
          students: currentGroup
        });

        // Remove placed students from the pool
        groupStudentIds.forEach(id => {
          const index = studentsToPlace.findIndex(s => s.id === id);
          if (index !== -1) {
            studentsToPlace.splice(index, 1);
          }
        });
      } else {
        // Safety break if we can't place any students
        break;
      }

      // For non-auto mode, if we have a very small remainder (1-2 students), 
      // add them to existing groups instead of creating tiny groups
      if (groupSize !== 'auto' && studentsToPlace.length > 0 && studentsToPlace.length < targetSize / 2 && newGroups.length > 0) {
        // Distribute remaining students to existing groups
        let groupIndex = 0;
        while (studentsToPlace.length > 0 && groupIndex < newGroups.length) {
          const remainingStudent = studentsToPlace[0];
          let canAddToGroup = true;

          // Check constraints with the target group
          for (const groupStudent of newGroups[groupIndex].students) {
            if (shouldNeverGroup(remainingStudent.id, groupStudent.id)) {
              canAddToGroup = false;
              break;
            }
          }

          if (canAddToGroup) {
            newGroups[groupIndex].students.push(remainingStudent);
            studentsToPlace.shift();
          }
          
          groupIndex++;
          
          // Reset to first group if we've tried all groups
          if (groupIndex >= newGroups.length) {
            groupIndex = 0;
            // If we've tried all groups and can't place student due to constraints,
            // create a new group for them
            if (studentsToPlace.length > 0) {
              break;
            }
          }
        }
      }
    }

    // Handle any remaining students that couldn't be placed due to constraints
    if (studentsToPlace.length > 0) {
      newGroups.push({
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `Group ${newGroups.length + 1}`,
        students: studentsToPlace
      });
    }

    setGroups(newGroups);
    
    // Provide feedback about group sizes
    const groupSizes = newGroups.map(g => g.students.length);
    const uniqueSizes = [...new Set(groupSizes)];
    
    if (groupSize !== 'auto' && uniqueSizes.length > 1) {
      showToast(`Created ${newGroups.length} groups. Note: Constraints resulted in varying sizes (${uniqueSizes.join(', ')} students per group)`);
    } else {
      showToast(`Created ${newGroups.length} groups successfully!`);
    }
  };

  // Handle drag and drop
  const handleDragStart = (e, student, sourceGroupId) => {
    setDraggedStudent({ student, sourceGroupId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, targetGroupId) => {
    e.preventDefault();
    setDragOverGroup(targetGroupId);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e, targetGroupId) => {
    e.preventDefault();
    setDragOverGroup(null);

    if (!draggedStudent || draggedStudent.sourceGroupId === targetGroupId) {
      return;
    }

    const { student, sourceGroupId } = draggedStudent;

    // Check constraints
    const targetGroup = groups.find(g => g.id === targetGroupId);
    if (targetGroup) {
      for (const groupStudent of targetGroup.students) {
        if (shouldNeverGroup(student.id, groupStudent.id)) {
          showToast(`${student.firstName} cannot be grouped with ${groupStudent.firstName} due to constraints!`);
          setDraggedStudent(null);
          return;
        }
      }
    }

    // Move student between groups
    setGroups(prev => prev.map(group => {
      if (group.id === sourceGroupId) {
        return {
          ...group,
          students: group.students.filter(s => s.id !== student.id)
        };
      } else if (group.id === targetGroupId) {
        return {
          ...group,
          students: [...group.students, student]
        };
      }
      return group;
    }));

    setDraggedStudent(null);
    showToast(`Moved ${student.firstName} to new group!`);
  };

  // Handle group naming
  const handleGroupNameChange = (groupId, newName) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    ));
  };

  // Save current groups
  const saveCurrentGroups = () => {
    if (groups.length === 0) {
      showToast('No groups to save!');
      return;
    }

    const groupName = prompt('Enter a name for this group configuration:');
    if (groupName) {
      const newSavedGroup = {
        id: `saved-${Date.now()}`,
        name: groupName,
        groups: groups,
        createdAt: new Date().toISOString()
      };

      const newSavedGroups = [...savedGroups, newSavedGroup];
      setSavedGroups(newSavedGroups);
      saveGroupData(constraints, newSavedGroups);
      showToast(`Groups saved as "${groupName}"!`);
    }
  };

  // Load saved groups
  const loadSavedGroups = (savedGroup) => {
    setGroups(savedGroup.groups);
    showToast(`Loaded "${savedGroup.name}" groups!`);
  };

  // Delete saved groups
  const deleteSavedGroups = (savedGroupId) => {
    if (window.confirm('Are you sure you want to delete this saved group configuration?')) {
      const newSavedGroups = savedGroups.filter(sg => sg.id !== savedGroupId);
      setSavedGroups(newSavedGroups);
      saveGroupData(constraints, newSavedGroups);
      showToast('Saved groups deleted!');
    }
  };

  // Constraint management
  const handleStudentSelectForConstraint = (student) => {
    setSelectedStudentsForConstraint(prev => {
      if (prev.find(s => s.id === student.id)) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const addNeverGroupConstraint = () => {
    if (selectedStudentsForConstraint.length < 2) {
      showToast('Please select at least 2 students!');
      return;
    }

    const studentIds = selectedStudentsForConstraint.map(s => s.id);
    const newConstraints = {
      ...constraints,
      neverGroup: [...constraints.neverGroup, studentIds]
    };
    setConstraints(newConstraints);
    saveGroupData(newConstraints);
    setSelectedStudentsForConstraint([]);
    setConstraintMode(null);
    
    const studentNames = selectedStudentsForConstraint.map(s => s.firstName).join(', ');
    showToast(`Added "never group" constraint for: ${studentNames}`);
  };

  const addAlwaysGroupConstraint = () => {
    if (selectedStudentsForConstraint.length < 2) {
      showToast('Please select at least 2 students!');
      return;
    }

    const studentIds = selectedStudentsForConstraint.map(s => s.id);
    const newConstraints = {
      ...constraints,
      alwaysGroup: [...constraints.alwaysGroup, studentIds]
    };
    setConstraints(newConstraints);
    saveGroupData(newConstraints);
    setSelectedStudentsForConstraint([]);
    setConstraintMode(null);
    
    const studentNames = selectedStudentsForConstraint.map(s => s.firstName).join(', ');
    showToast(`Added "always group" constraint for: ${studentNames}`);
  };

  const removeConstraint = (type, index) => {
    const newConstraints = {
      ...constraints,
      [type]: constraints[type].filter((_, i) => i !== index)
    };
    setConstraints(newConstraints);
    saveGroupData(newConstraints);
    showToast('Constraint removed!');
  };

  const clearAllGroups = () => {
    if (window.confirm('Are you sure you want to clear all current groups?')) {
      setGroups([]);
      showToast('All groups cleared!');
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-600">
          Add students to your class to use the Group Maker tool.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">👥 Smart Group Maker</h2>
        <p className="text-gray-600">Create balanced groups with intelligent constraints</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Group Size</label>
            <select
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="auto">Auto Balance</option>
              <option value="2">2 students</option>
              <option value="3">3 students</option>
              <option value="4">4 students</option>
              <option value="5">5 students</option>
              <option value="6">6 students</option>
              <option value="7">7 students</option>
              <option value="8">8 students</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateGroups}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Generate Groups
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setShowConstraints(true)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Manage Rules
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={saveCurrentGroups}
              disabled={groups.length === 0}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors font-semibold"
            >
              Save Groups
            </button>
          </div>
        </div>

        {groups.length > 0 && (
          <div className="flex justify-center gap-2">
            <button
              onClick={generateGroups}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold text-sm"
            >
              🔄 Regenerate
            </button>
            <button
              onClick={clearAllGroups}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
            >
              🗑️ Clear All
            </button>
          </div>
        )}
      </div>

      {/* Groups Display */}
      {groups.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Current Groups</h3>
            <span className="text-sm text-gray-600">
              {groups.length} groups • {groups.reduce((sum, g) => sum + g.students.length, 0)} students
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                  dragOverGroup === group.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
                onDragOver={(e) => handleDragOver(e, group.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group.id)}
              >
                <div className="mb-3">
                  {editingGroupName === group.id ? (
                    <input
                      type="text"
                      value={group.name}
                      onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                      onBlur={() => setEditingGroupName(null)}
                      onKeyPress={(e) => e.key === 'Enter' && setEditingGroupName(null)}
                      className="w-full px-2 py-1 border border-gray-300 rounded font-bold text-lg"
                      autoFocus
                    />
                  ) : (
                    <h4 
                      className="font-bold text-lg text-gray-800 cursor-pointer hover:text-blue-600"
                      onClick={() => setEditingGroupName(group.id)}
                    >
                      {group.name} ({group.students.length})
                    </h4>
                  )}
                </div>
                
                <div className="space-y-2">
                  {group.students.map((student) => (
                    <div
                      key={student.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, student, group.id)}
                      className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200 cursor-move hover:shadow-md transition-shadow"
                    >
                      {student.avatar && (
                        <img 
                          src={student.avatar} 
                          alt={student.firstName} 
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                        />
                      )}
                      <span className="font-semibold text-gray-800">{student.firstName}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Groups */}
      {savedGroups.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Saved Group Configurations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedGroups.map((savedGroup) => (
              <div key={savedGroup.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-bold text-lg text-gray-800 mb-2">{savedGroup.name}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {savedGroup.groups.length} groups • Created {new Date(savedGroup.createdAt).toLocaleDateString()}
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => loadSavedGroups(savedGroup)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteSavedGroups(savedGroup.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints Modal */}
      {showConstraints && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Group Constraints</h2>
              <button
                onClick={() => {
                  setShowConstraints(false);
                  setConstraintMode(null);
                  setSelectedStudentsForConstraint([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Add New Constraints */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Constraint</h3>
                
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => {
                      setConstraintMode('never');
                      setSelectedStudentsForConstraint([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      constraintMode === 'never' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Never Group Together
                  </button>
                  <button
                    onClick={() => {
                      setConstraintMode('always');
                      setSelectedStudentsForConstraint([]);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      constraintMode === 'always' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Always Group Together
                  </button>
                </div>

                {constraintMode && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Select students for this constraint:
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => handleStudentSelectForConstraint(student)}
                          className={`p-2 rounded-lg border-2 transition-colors text-left ${
                            selectedStudentsForConstraint.find(s => s.id === student.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {student.avatar && (
                              <img src={student.avatar} alt={student.firstName} className="w-6 h-6 rounded-full" />
                            )}
                            <span className="font-semibold text-sm">{student.firstName}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={constraintMode === 'never' ? addNeverGroupConstraint : addAlwaysGroupConstraint}
                        disabled={selectedStudentsForConstraint.length < 2}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                          constraintMode === 'never' 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Add Constraint ({selectedStudentsForConstraint.length} selected)
                      </button>
                      <button
                        onClick={() => {
                          setConstraintMode(null);
                          setSelectedStudentsForConstraint([]);
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Existing Constraints */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Current Constraints</h3>
                
                {/* Never Group Constraints */}
                {constraints.neverGroup.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-red-700 mb-2">Never Group Together:</h4>
                    <div className="space-y-2">
                      {constraints.neverGroup.map((pair, index) => (
                        <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                          <span className="text-red-800">
                            {pair.map(id => students.find(s => s.id === id)?.firstName || 'Unknown').join(' & ')}
                          </span>
                          <button
                            onClick={() => removeConstraint('neverGroup', index)}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Always Group Constraints */}
                {constraints.alwaysGroup.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-green-700 mb-2">Always Group Together:</h4>
                    <div className="space-y-2">
                      {constraints.alwaysGroup.map((group, index) => (
                        <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <span className="text-green-800">
                            {group.map(id => students.find(s => s.id === id)?.firstName || 'Unknown').join(', ')}
                          </span>
                          <button
                            onClick={() => removeConstraint('alwaysGroup', index)}
                            className="text-green-600 hover:text-green-800 font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {constraints.neverGroup.length === 0 && constraints.alwaysGroup.length === 0 && (
                  <p className="text-gray-500 italic">No constraints set. Students will be grouped randomly.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cursor-move:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

export default GroupMaker;