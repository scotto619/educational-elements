// GroupMaker.js - Smart Group Creation Tool (FIXED CONTRAST)
import React, { useState, useEffect } from 'react';

const GroupMaker = ({ 
  students, 
  showToast, 
  saveGroupDataToFirebase, 
  userData, 
  currentClassId 
}) => {
  const [groupSize, setGroupSize] = useState(4);
  const [numberOfGroups, setNumberOfGroups] = useState(0);
  const [groupingMethod, setGroupingMethod] = useState('size'); // 'size' or 'number'
  const [groups, setGroups] = useState([]);
  const [constraints, setConstraints] = useState({
    neverGroup: [], // Array of arrays - students that should never be grouped together
    alwaysGroup: [] // Array of arrays - students that should always be grouped together
  });
  const [constraintMode, setConstraintMode] = useState(null); // 'never', 'always', or null
  const [selectedStudentsForConstraint, setSelectedStudentsForConstraint] = useState([]);
  const [savedGroupings, setSavedGroupings] = useState([]);
  const [showConstraints, setShowConstraints] = useState(false);

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

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check if two students can be grouped together
  const canGroupTogether = (student1, student2) => {
    // Check if they're in a "never group" constraint
    return !constraints.neverGroup.some(constraint => 
      constraint.includes(student1.id) && constraint.includes(student2.id)
    );
  };

  // Generate groups with constraints
  const generateGroups = () => {
    if (students.length === 0) {
      showToast('No students available to group!', 'error');
      return;
    }

    let availableStudents = [...students];
    let newGroups = [];
    
    // First, handle "always group" constraints
    constraints.alwaysGroup.forEach(constraint => {
      if (constraint.length > 0) {
        const constraintStudents = availableStudents.filter(s => constraint.includes(s.id));
        if (constraintStudents.length > 0) {
          newGroups.push(constraintStudents);
          availableStudents = availableStudents.filter(s => !constraint.includes(s.id));
        }
      }
    });

    // Shuffle remaining students
    availableStudents = shuffleArray(availableStudents);

    // Create groups with remaining students
    const targetGroupCount = groupingMethod === 'number' ? numberOfGroups : Math.ceil(students.length / groupSize);
    const targetGroupSize = groupingMethod === 'size' ? groupSize : Math.ceil(students.length / numberOfGroups);

    // Fill existing groups from constraints first
    let groupIndex = 0;
    while (availableStudents.length > 0 && groupIndex < newGroups.length) {
      while (newGroups[groupIndex].length < targetGroupSize && availableStudents.length > 0) {
        // Find a student that can be added to this group
        let studentAdded = false;
        for (let i = 0; i < availableStudents.length; i++) {
          const student = availableStudents[i];
          const canAddToGroup = newGroups[groupIndex].every(groupMember => 
            canGroupTogether(student, groupMember)
          );
          
          if (canAddToGroup) {
            newGroups[groupIndex].push(student);
            availableStudents.splice(i, 1);
            studentAdded = true;
            break;
          }
        }
        
        if (!studentAdded) break; // No compatible student found
      }
      groupIndex++;
    }

    // Create new groups for remaining students
    while (availableStudents.length > 0) {
      const newGroup = [];
      
      // Add first student
      if (availableStudents.length > 0) {
        newGroup.push(availableStudents.shift());
      }
      
      // Add more students to reach target size
      while (newGroup.length < targetGroupSize && availableStudents.length > 0) {
        let studentAdded = false;
        for (let i = 0; i < availableStudents.length; i++) {
          const student = availableStudents[i];
          const canAddToGroup = newGroup.every(groupMember => 
            canGroupTogether(student, groupMember)
          );
          
          if (canAddToGroup) {
            newGroup.push(student);
            availableStudents.splice(i, 1);
            studentAdded = true;
            break;
          }
        }
        
        if (!studentAdded) break; // No compatible student found
      }
      
      newGroups.push(newGroup);
    }

    // Handle any remaining students (distribute among existing groups)
    while (availableStudents.length > 0) {
      const student = availableStudents.shift();
      // Find the smallest group that can accommodate this student
      let targetGroup = null;
      let minSize = Infinity;
      
      for (const group of newGroups) {
        if (group.length < minSize) {
          const canAdd = group.every(groupMember => canGroupTogether(student, groupMember));
          if (canAdd) {
            targetGroup = group;
            minSize = group.length;
          }
        }
      }
      
      if (targetGroup) {
        targetGroup.push(student);
      } else {
        // Create a new group for this student if no compatible group found
        newGroups.push([student]);
      }
    }

    setGroups(newGroups);
    showToast(`Created ${newGroups.length} groups!`);
  };

  // Save current grouping
  const saveGrouping = () => {
    if (groups.length === 0) {
      showToast('No groups to save!', 'error');
      return;
    }

    const grouping = {
      id: Date.now(),
      name: `Grouping ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      groups: groups,
      constraints: constraints,
      createdAt: new Date(),
      groupSize: groupSize,
      method: groupingMethod
    };

    setSavedGroupings(prev => [grouping, ...prev]);
    
    // Save to Firebase if available
    if (saveGroupDataToFirebase && currentClassId) {
      saveGroupDataToFirebase(currentClassId, grouping);
    }
    
    showToast('Grouping saved successfully!');
  };

  // Load a saved grouping
  const loadGrouping = (grouping) => {
    setGroups(grouping.groups);
    setConstraints(grouping.constraints);
    setGroupSize(grouping.groupSize);
    setGroupingMethod(grouping.method);
    showToast('Grouping loaded!');
  };

  // Clear all groups
  const clearGroups = () => {
    setGroups([]);
    showToast('All groups cleared!');
  };

  // Add constraint
  const addNeverGroupConstraint = () => {
    if (selectedStudentsForConstraint.length < 2) {
      showToast('Select at least 2 students for a constraint!', 'error');
      return;
    }

    const studentIds = selectedStudentsForConstraint.map(s => s.id);
    setConstraints(prev => ({
      ...prev,
      neverGroup: [...prev.neverGroup, studentIds]
    }));
    
    setSelectedStudentsForConstraint([]);
    setConstraintMode(null);
    showToast('Never group constraint added!');
  };

  const addAlwaysGroupConstraint = () => {
    if (selectedStudentsForConstraint.length < 2) {
      showToast('Select at least 2 students for a constraint!', 'error');
      return;
    }

    const studentIds = selectedStudentsForConstraint.map(s => s.id);
    setConstraints(prev => ({
      ...prev,
      alwaysGroup: [...prev.alwaysGroup, studentIds]
    }));
    
    setSelectedStudentsForConstraint([]);
    setConstraintMode(null);
    showToast('Always group constraint added!');
  };

  // Remove constraint
  const removeConstraint = (type, index) => {
    setConstraints(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
    showToast('Constraint removed!');
  };

  // Handle student selection for constraints
  const handleStudentSelectForConstraint = (student) => {
    setSelectedStudentsForConstraint(prev => {
      const isSelected = prev.find(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  // Get group color
  const getGroupColor = (index) => {
    const colors = [
      'bg-blue-100 border-blue-300',
      'bg-green-100 border-green-300',
      'bg-yellow-100 border-yellow-300',
      'bg-purple-100 border-purple-300',
      'bg-pink-100 border-pink-300',
      'bg-indigo-100 border-indigo-300',
      'bg-orange-100 border-orange-300',
      'bg-teal-100 border-teal-300'
    ];
    return colors[index % colors.length];
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-700">
          Add students to your class or load a class to use the Group Maker.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">👥 Smart Group Maker</h2>
        <p className="text-gray-700">Create balanced groups with intelligent constraints</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Grouping Method */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Grouping Method</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="size"
                  checked={groupingMethod === 'size'}
                  onChange={(e) => setGroupingMethod(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-800 font-semibold">By Group Size</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="number"
                  checked={groupingMethod === 'number'}
                  onChange={(e) => setGroupingMethod(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-800 font-semibold">By Number of Groups</span>
              </label>
            </div>
          </div>

          {/* Group Size/Number */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">
              {groupingMethod === 'size' ? 'Students per Group' : 'Number of Groups'}
            </h3>
            <input
              type="number"
              min="1"
              max={groupingMethod === 'size' ? students.length : students.length}
              value={groupingMethod === 'size' ? groupSize : numberOfGroups}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                if (groupingMethod === 'size') {
                  setGroupSize(value);
                } else {
                  setNumberOfGroups(value);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
            />
            <p className="text-sm text-gray-600 mt-2">
              {groupingMethod === 'size' 
                ? `Will create ${Math.ceil(students.length / groupSize)} groups`
                : `Each group will have ~${Math.ceil(students.length / numberOfGroups)} students`
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={generateGroups}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                🎲 Generate Groups
              </button>
              <button
                onClick={() => setShowConstraints(!showConstraints)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
              >
                ⚙️ Constraints
              </button>
              <button
                onClick={saveGrouping}
                disabled={groups.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition-colors"
              >
                💾 Save Grouping
              </button>
              <button
                onClick={clearGroups}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
              >
                🗑️ Clear Groups
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Constraints Panel */}
      {showConstraints && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Group Constraints</h3>
          
          <div className="space-y-6">
            {/* Constraint Mode Selection */}
            <div>
              <div className="flex gap-3 mb-4">
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
                  <p className="text-sm text-gray-700 mb-3 font-semibold">
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
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
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
                      Add {constraintMode === 'never' ? 'Never Group' : 'Always Group'} Constraint
                    </button>
                    <button
                      onClick={() => {
                        setConstraintMode(null);
                        setSelectedStudentsForConstraint([]);
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Current Constraints Display */}
            <div className="space-y-4">
              {constraints.neverGroup.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Never Group Together:</h4>
                  <div className="space-y-2">
                    {constraints.neverGroup.map((group, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                        <span className="text-red-800 font-semibold">
                          {group.map(id => students.find(s => s.id === id)?.firstName || 'Unknown').join(', ')}
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

              {constraints.alwaysGroup.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Always Group Together:</h4>
                  <div className="space-y-2">
                    {constraints.alwaysGroup.map((group, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                        <span className="text-green-800 font-semibold">
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
                <p className="text-gray-600 italic">No constraints set. Students will be grouped randomly.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Groups */}
      {groups.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Groups ({groups.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className={`p-4 rounded-lg border-2 ${getGroupColor(groupIndex)}`}>
                <h4 className="font-bold text-gray-800 mb-3">Group {groupIndex + 1} ({group.length} students)</h4>
                <div className="space-y-2">
                  {group.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg">
                      {student.avatar && (
                        <img src={student.avatar} alt={student.firstName} className="w-8 h-8 rounded-full" />
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

      {/* Saved Groupings */}
      {savedGroupings.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Saved Groupings</h3>
          
          <div className="space-y-3">
            {savedGroupings.map((grouping) => (
              <div key={grouping.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-800">{grouping.name}</div>
                  <div className="text-sm text-gray-600">
                    {grouping.groups.length} groups • {grouping.method === 'size' ? 'By size' : 'By number'} • {grouping.groupSize} per group
                  </div>
                </div>
                <button
                  onClick={() => loadGrouping(grouping)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                >
                  Load
                </button>
              </div>
            ))}
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