// components/curriculum/mathematics/MathMentals.js - FIXED TEACHER COMPONENT
import React, { useState, useEffect } from 'react';

// [Include all the MATH_LEVELS, MATH_SUBLEVELS, and generateQuestion constants from the original file]
const MATH_LEVELS = {
  1: {
    name: "Level 1",
    description: "Basic number facts and counting (Ages 5-7)",
    color: "from-green-400 to-green-600",
    icon: "🌱"
  },
  2: {
    name: "Level 2", 
    description: "Early addition and subtraction (Ages 6-8)",
    color: "from-blue-400 to-blue-600",
    icon: "📚"
  },
  3: {
    name: "Level 3",
    description: "Multiplication and division basics (Ages 7-9)", 
    color: "from-purple-400 to-purple-600",
    icon: "🚀"
  },
  4: {
    name: "Level 4",
    description: "Advanced number operations (Ages 8-10)",
    color: "from-red-400 to-red-600", 
    icon: "⭐"
  }
};

const MATH_SUBLEVELS = {
  // LEVEL 1 - PREP/GRADE 1
  "1.1": { name: "Counting 0-5", type: "counting", max: 5 },
  "1.2": { name: "Counting 0-10", type: "counting", max: 10 },
  "1.3": { name: "Add 1", type: "add_one", max: 10 },
  "1.4": { name: "Subtract 1", type: "subtract_one", max: 10 },
  "1.5": { name: "Add 2", type: "add_two", max: 8 },
  "1.6": { name: "Number Before", type: "number_before", max: 10 },
  "1.7": { name: "Number After", type: "number_after", max: 9 },
  "1.8": { name: "Doubles to 5", type: "doubles", max: 5 },
  "1.9": { name: "Add to 5", type: "add_to_target", target: 5 },
  "1.10": { name: "Subtract from 5", type: "subtract_from_target", target: 5 },
  "1.11": { name: "Count by 2s", type: "skip_count", step: 2, max: 10 },
  "1.12": { name: "Add to 10", type: "add_to_target", target: 10 },
  "1.13": { name: "Subtract from 10", type: "subtract_from_target", target: 10 },
  "1.14": { name: "Doubles to 10", type: "doubles", max: 10 },
  "1.15": { name: "Which is More?", type: "compare", max: 10 },
  "1.16": { name: "Which is Less?", type: "compare_less", max: 10 },
  "1.17": { name: "Missing Numbers", type: "missing_number", max: 10 },
  "1.18": { name: "Count Forward 3", type: "count_forward", steps: 3, max: 7 },
  "1.19": { name: "Count Backward 3", type: "count_backward", steps: 3, max: 10 },
  "1.20": { name: "Mixed to 10", type: "mixed_basic", max: 10 },

  // LEVEL 2 - GRADE 1/2
  "2.1": { name: "Add to 15", type: "addition", max: 15 },
  "2.2": { name: "Subtract from 15", type: "subtraction", max: 15 },
  "2.3": { name: "Add to 20", type: "addition", max: 20 },
  "2.4": { name: "Subtract from 20", type: "subtraction", max: 20 },
  "2.5": { name: "Doubles to 20", type: "doubles", max: 20 },
  "2.6": { name: "Near Doubles", type: "near_doubles", max: 20 },
  "2.7": { name: "Count by 5s", type: "skip_count", step: 5, max: 50 },
  "2.8": { name: "Count by 10s", type: "skip_count", step: 10, max: 100 },
  "2.9": { name: "2 Times Table", type: "times_table", table: 2 },
  "2.10": { name: "5 Times Table", type: "times_table", table: 5 },
  "2.11": { name: "10 Times Table", type: "times_table", table: 10 },
  "2.12": { name: "Half of Even Numbers", type: "halving", max: 20 },
  "2.13": { name: "Add 10", type: "add_ten", max: 90 },
  "2.14": { name: "Subtract 10", type: "subtract_ten", max: 100 },
  "2.15": { name: "Bridging 10", type: "bridging_ten", max: 20 },
  "2.16": { name: "Teen Numbers", type: "teen_numbers", max: 19 },
  "2.17": { name: "Place Value Tens", type: "place_value_tens", max: 99 },
  "2.18": { name: "Round to 10", type: "rounding", target: 10 },
  "2.19": { name: "Mixed Addition 20", type: "mixed_addition", max: 20 },
  "2.20": { name: "Mixed Subtraction 20", type: "mixed_subtraction", max: 20 },

  // LEVEL 3 - GRADE 2/3  
  "3.1": { name: "Add to 50", type: "addition", max: 50 },
  "3.2": { name: "Subtract from 50", type: "subtraction", max: 50 },
  "3.3": { name: "Add to 100", type: "addition", max: 100 },
  "3.4": { name: "Subtract from 100", type: "subtraction", max: 100 },
  "3.5": { name: "3 Times Table", type: "times_table", table: 3 },
  "3.6": { name: "4 Times Table", type: "times_table", table: 4 },
  "3.7": { name: "6 Times Table", type: "times_table", table: 6 },
  "3.8": { name: "7 Times Table", type: "times_table", table: 7 },
  "3.9": { name: "8 Times Table", type: "times_table", table: 8 },
  "3.10": { name: "9 Times Table", type: "times_table", table: 9 },
  "3.11": { name: "Division by 2", type: "division", table: 2 },
  "3.12": { name: "Division by 5", type: "division", table: 5 },
  "3.13": { name: "Division by 10", type: "division", table: 10 },
  "3.14": { name: "Mixed Times Tables", type: "mixed_tables", tables: [2,3,4,5,10] },
  "3.15": { name: "Add 3 Numbers", type: "add_three", max: 30 },
  "3.16": { name: "Round to 100", type: "rounding", target: 100 },
  "3.17": { name: "Place Value 100s", type: "place_value_hundreds", max: 999 },
  "3.18": { name: "Missing Addend", type: "missing_addend", max: 50 },
  "3.19": { name: "Fraction Halves", type: "fractions_half", max: 20 },
  "3.20": { name: "Mixed Operations 100", type: "mixed_all", max: 100 },

  // LEVEL 4 - GRADE 3/4
  "4.1": { name: "Add to 200", type: "addition", max: 200 },
  "4.2": { name: "Subtract from 200", type: "subtraction", max: 200 },
  "4.3": { name: "Add to 1000", type: "addition", max: 1000 },
  "4.4": { name: "Subtract from 1000", type: "subtraction", max: 1000 },
  "4.5": { name: "11 Times Table", type: "times_table", table: 11 },
  "4.6": { name: "12 Times Table", type: "times_table", table: 12 },
  "4.7": { name: "Mixed Division", type: "mixed_division", tables: [2,3,4,5,6,7,8,9,10] },
  "4.8": { name: "Multiply by 10", type: "multiply_ten", max: 99 },
  "4.9": { name: "Multiply by 100", type: "multiply_hundred", max: 99 },
  "4.10": { name: "Divide by 10", type: "divide_ten", max: 990 },
  "4.11": { name: "Decimals Add", type: "decimal_add", max: 10 },
  "4.12": { name: "Decimals Subtract", type: "decimal_subtract", max: 10 },
  "4.13": { name: "Fraction Quarters", type: "fractions_quarter", max: 16 },
  "4.14": { name: "Percentage 10s", type: "percentage_tens", max: 100 },
  "4.15": { name: "Square Numbers", type: "squares", max: 10 },
  "4.16": { name: "Double & Half", type: "double_half", max: 100 },
  "4.17": { name: "Add Hundreds", type: "add_hundreds", max: 900 },
  "4.18": { name: "Subtract Hundreds", type: "subtract_hundreds", max: 1000 },
  "4.19": { name: "Round to 1000", type: "rounding", target: 1000 },
  "4.20": { name: "Mixed Advanced", type: "mixed_advanced", max: 1000 }
};

const MathMentals = ({ 
  students = [], 
  showToast = () => {}, 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  console.log('🧮 MathMentals component loaded with:', {
    studentsCount: students?.length || 0,
    hasShowToast: typeof showToast === 'function',
    hasSaveData: typeof saveData === 'function',
    hasLoadedData: !!loadedData
  });
  
  const [mathGroups, setMathGroups] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentLevels, setStudentLevels] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // FIXED: Load data on component mount - use consistent data structure
  useEffect(() => {
    try {
      // FIXED: Load from mathMentalsGroups directly (not mathMentalsData.groups)
      const mathData = loadedData?.mathMentalsGroups;
      if (mathData && Array.isArray(mathData)) {
        setMathGroups(mathData);
        console.log('📖 Loaded Math Mentals data:', mathData.length, 'groups');
      } else {
        console.log('📄 No existing Math Mentals data found');
        setMathGroups([]);
      }
    } catch (error) {
      console.error('❌ Error loading Math Mentals data:', error);
      showToast('Error loading Math Mentals data', 'error');
    }
  }, [loadedData]);

  // FIXED: Save data function using consistent structure
  const saveGroups = (groups) => {
    try {
      console.log('💾 Saving Math Mentals groups to Firebase:', groups.length, 'groups');
      
      setMathGroups(groups);
      setHasUnsavedChanges(false);
      
      if (saveData && typeof saveData === 'function') {
        // CRITICAL FIX: Save directly as mathMentalsGroups (matching the API and student component)
        const existingToolkitData = loadedData || {};
        const updatedToolkitData = {
          ...existingToolkitData,
          mathMentalsGroups: groups, // Save directly as mathMentalsGroups
          lastSaved: new Date().toISOString()
        };
        
        // Save to toolkitData to match loading location
        saveData({ toolkitData: updatedToolkitData });
        showToast('Math groups saved successfully!', 'success');
        console.log('✅ Math Mentals data saved:', updatedToolkitData);
      } else {
        console.error('❌ saveData function not available or not a function');
        showToast('Error: Unable to save data - saveData function missing', 'error');
      }
    } catch (error) {
      console.error('❌ Error saving Math Mentals data:', error);
      showToast('Error saving data: ' + error.message, 'error');
    }
  };

  // Mark as having unsaved changes
  const markAsChanged = () => {
    setHasUnsavedChanges(true);
  };

  const createGroup = () => {
    try {
      if (!groupName.trim()) {
        showToast('Please enter a group name', 'error');
        return;
      }
      
      if (!selectedStudents || selectedStudents.length === 0) {
        showToast('Please select at least one student', 'error');
        return;
      }

      // Validate that each selected student has a starting level
      const studentsWithoutLevels = selectedStudents.filter(studentId => !studentLevels[studentId]);
      if (studentsWithoutLevels.length > 0) {
        showToast('Please assign a starting level to all students', 'error');
        return;
      }

      // Validate students exist
      const validStudents = selectedStudents.filter(id => students.find(s => s.id === id));
      if (validStudents.length !== selectedStudents.length) {
        showToast('Some selected students are invalid', 'error');
        return;
      }

      const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
        'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
      ];
      const color = colors[mathGroups.length % colors.length];

      const newGroup = {
        id: `mathgroup_${Date.now()}`,
        name: groupName,
        color,
        students: selectedStudents.map(id => {
          const student = students.find(s => s.id === id);
          const startingLevel = studentLevels[id];
          
          if (!student) {
            throw new Error(`Student with id ${id} not found`);
          }
          
          return {
            id: student.id,
            firstName: student.firstName || 'Unknown',
            lastName: student.lastName || '',
            currentLevel: startingLevel,
            progress: {},
            streak: 0
          };
        }),
        createdAt: new Date().toISOString()
      };

      const updatedGroups = [...mathGroups, newGroup];
      
      // Don't auto-save, just mark as changed
      setMathGroups(updatedGroups);
      markAsChanged();
      
      resetModal();
      showToast(`Math group "${groupName}" created! Click Save to persist changes.`, 'success');
      
      console.log('✅ Math group created successfully:', newGroup);
    } catch (error) {
      console.error('❌ Error creating math group:', error);
      showToast(`Error creating group: ${error.message}`, 'error');
    }
  };

  const updateGroup = () => {
    if (!groupName.trim() || selectedStudents.length === 0) {
      showToast('Please enter group name and select students', 'error');
      return;
    }

    // Validate that each selected student has a starting level
    const studentsWithoutLevels = selectedStudents.filter(studentId => !studentLevels[studentId]);
    if (studentsWithoutLevels.length > 0) {
      showToast('Please assign a starting level to all students', 'error');
      return;
    }

    const updatedGroups = mathGroups.map(group => {
      if (group.id === editingGroup.id) {
        return {
          ...group,
          name: groupName,
          students: selectedStudents.map(id => {
            const student = students.find(s => s.id === id);
            const existingStudent = group.students.find(s => s.id === id);
            const assignedLevel = studentLevels[id];
            
            return existingStudent ? {
              ...existingStudent,
              firstName: student.firstName, // Update name in case it changed
              lastName: student.lastName,
              // Only update level if it's different and student hasn't made progress
              currentLevel: (!existingStudent.progress || Object.keys(existingStudent.progress).length === 0) 
                ? assignedLevel 
                : existingStudent.currentLevel
            } : {
              id: student.id,
              firstName: student.firstName,
              lastName: student.lastName,
              currentLevel: assignedLevel,
              progress: {},
              streak: 0
            };
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return group;
    });

    setMathGroups(updatedGroups);
    markAsChanged();
    
    resetModal();
    showToast(`Math group "${groupName}" updated! Click Save to persist changes.`, 'success');
  };

  const deleteGroup = (groupId) => {
    const updatedGroups = mathGroups.filter(group => group.id !== groupId);
    setMathGroups(updatedGroups);
    markAsChanged();
    showToast('Math group deleted - Click Save to persist changes', 'success');
  };

  const resetModal = () => {
    setShowGroupModal(false);
    setGroupName('');
    setSelectedStudents([]);
    setStudentLevels({});
    setEditingGroup(null);
  };

  const editGroup = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setSelectedStudents(group.students.map(s => s.id));
    
    // Set the current levels for each student
    const levels = {};
    group.students.forEach(student => {
      levels[student.id] = student.currentLevel;
    });
    setStudentLevels(levels);
    
    setShowGroupModal(true);
  };

  // Handle student level assignment (single level per student)
  const handleStudentLevelChange = (studentId, level) => {
    setStudentLevels(prev => ({
      ...prev,
      [studentId]: level
    }));
  };

  // Save all changes to Firebase
  const handleSaveAll = () => {
    if (mathGroups.length === 0) {
      showToast('No groups to save', 'info');
      return;
    }
    saveGroups(mathGroups);
  };

  // [Rest of the component remains the same - just including the key render parts]
  
  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <span className="mr-3">🧮</span>
              Math Mentals Program
            </h1>
            <p className="text-green-100">Daily number facts practice for automatic recall</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSaveAll}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                hasUnsavedChanges 
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-lg' 
                  : 'bg-white text-green-600 hover:bg-gray-100'
              }`}
            >
              {hasUnsavedChanges ? '💾 Save Changes' : '✅ Saved'}
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              + Create Group
            </button>
          </div>
        </div>
        {hasUnsavedChanges && (
          <div className="mt-4 bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg p-3">
            <p className="text-yellow-100 text-sm">⚠️ You have unsaved changes. Click "Save Changes" to persist them to Firebase.</p>
          </div>
        )}
      </div>

      {/* Existing Groups Display */}
      {mathGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Current Math Groups</h2>
          <div className="grid gap-4">
            {mathGroups.map(group => {
              const uniqueLevels = [...new Set(group.students.map(s => s.currentLevel))];
              return (
                <div key={group.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
                  <div className={`${group.color} text-white p-4 rounded-t-xl`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{group.name}</h3>
                        <p className="opacity-90">{group.students.length} students • {uniqueLevels.length} levels</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => editGroup(group)}
                          className="bg-white bg-opacity-20 px-3 py-2 rounded-lg hover:bg-opacity-30"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="bg-red-500 bg-opacity-80 px-3 py-2 rounded-lg hover:bg-opacity-100"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Students ({group.students.length})</h4>
                        <div className="space-y-2">
                          {group.students.map(student => (
                            <div key={student.id} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{student.firstName} {student.lastName}</span>
                                <div className="text-sm">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    Level {student.currentLevel}
                                  </span>
                                  {student.streak > 0 && (
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded ml-2">
                                      {student.streak} day streak
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Progress Overview</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {group.students.filter(s => s.progress && Object.keys(s.progress).length > 0).length}
                              </div>
                              <div className="text-xs text-gray-600">Students Active</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round((group.students.reduce((sum, s) => sum + (s.streak || 0), 0) / group.students.length) * 10) / 10}
                              </div>
                              <div className="text-xs text-gray-600">Avg Streak</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Level Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Math Mentals Level Structure</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(MATH_LEVELS).map(([level, config]) => (
            <div key={level} className={`bg-gradient-to-r ${config.color} text-white rounded-xl p-6 text-center`}>
              <div className="text-4xl mb-3">{config.icon}</div>
              <h3 className="text-xl font-bold mb-2">{config.name}</h3>
              <p className="text-sm opacity-90 mb-4">{config.description}</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <span className="text-sm font-semibold">
                  20 Sub-levels ({level}.1 - {level}.20)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group Creation Modal - Full modal code would be included here */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                {editingGroup ? 'Edit Math Group' : 'Create Math Group'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Advanced Mathematicians"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Student Selection with Individual Level Assignment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assign Students & Starting Levels
                </label>
                <div className="border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto">
                  {!students || students.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No students available</p>
                  ) : (
                    <div className="space-y-3">
                      {students.map(student => {
                        if (!student || !student.id) {
                          console.warn('Invalid student object:', student);
                          return null;
                        }
                        
                        const isSelected = selectedStudents.includes(student.id);
                        const assignedLevel = studentLevels[student.id] || '';
                        
                        return (
                          <div key={student.id} className={`p-3 rounded-lg border-2 transition-colors ${
                            isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <div className="flex items-center justify-between">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    try {
                                      if (e.target.checked) {
                                        setSelectedStudents(prev => [...prev, student.id]);
                                        // Set default starting level if none assigned
                                        if (!studentLevels[student.id]) {
                                          setStudentLevels(prev => ({
                                            ...prev,
                                            [student.id]: '1.1'
                                          }));
                                        }
                                      } else {
                                        setSelectedStudents(prev => prev.filter(id => id !== student.id));
                                        // Remove level assignment when unchecked
                                        setStudentLevels(prev => {
                                          const newLevels = { ...prev };
                                          delete newLevels[student.id];
                                          return newLevels;
                                        });
                                      }
                                    } catch (error) {
                                      console.error('Error updating student selection:', error);
                                      showToast('Error updating selection', 'error');
                                    }
                                  }}
                                  className="rounded border-gray-300 mr-3"
                                />
                                <span className="font-medium">
                                  {student.firstName || 'Unknown'} {student.lastName || ''}
                                </span>
                              </label>
                              
                              {isSelected && (
                                <select
                                  value={assignedLevel}
                                  onChange={(e) => {
                                    try {
                                      handleStudentLevelChange(student.id, e.target.value);
                                    } catch (error) {
                                      console.error('Error changing student level:', error);
                                      showToast('Error updating level', 'error');
                                    }
                                  }}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Select starting level...</option>
                                  {Object.entries(MATH_SUBLEVELS).map(([levelId, config]) => (
                                    <option key={levelId} value={levelId}>
                                      {levelId}: {config?.name || 'Unknown Level'}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        );
                      }).filter(Boolean)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select students and assign their starting level. They will progress through levels automatically after 3 perfect scores.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={resetModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={editingGroup ? updateGroup : createGroup}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                {editingGroup ? 'Update Group' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MathMentals;