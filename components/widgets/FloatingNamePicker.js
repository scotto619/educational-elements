// components/widgets/FloatingNamePicker.js - Persistent floating name picker widget
import React, { useState, useEffect, useRef, useCallback } from 'react';

const FloatingNamePicker = ({ 
  students = [], 
  showToast, 
  playSound, 
  getAvatarImage, 
  calculateAvatarLevel 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinText, setSpinText] = useState('');
  const [excludedStudents, setExcludedStudents] = useState(new Set());
  const [pickerMode, setPickerMode] = useState('single'); // single, multiple
  const [groupSize, setGroupSize] = useState(2);
  const [generatedGroups, setGeneratedGroups] = useState([]);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  const availableStudents = students.filter(s => !excludedStudents.has(s.id));

  const containerRef = useRef(null);
  const dragStateRef = useRef({
    isPointerDown: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    dragging: false,
  });
  const preventClickRef = useRef(false);

  const clampPosition = useCallback((x, y) => {
    if (typeof window === 'undefined') {
      return { x, y };
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
    const maxX = Math.max(16, window.innerWidth - width - 16);
    const maxY = Math.max(16, window.innerHeight - height - 16);
    const clampedX = Math.min(Math.max(16, x), maxX);
    const clampedY = Math.min(Math.max(16, y), maxY);

    return { x: clampedX, y: clampedY };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Default to sit slightly to the left of the timer widget
    setPosition(clampPosition(window.innerWidth - 260, window.innerHeight - 140));
  }, [clampPosition]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setPosition(prev => clampPosition(prev.x, prev.y));
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [clampPosition]);

  const handlePointerMove = useCallback((event) => {
    const state = dragStateRef.current;
    if (!state.isPointerDown) {
      return;
    }

    if (!state.dragging) {
      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;
      if (Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) {
        return;
      }

      state.dragging = true;
      preventClickRef.current = true;
      setIsDragging(true);
    }

    const newX = event.clientX - state.offsetX;
    const newY = event.clientY - state.offsetY;
    setPosition(clampPosition(newX, newY));
  }, [clampPosition]);

  const handlePointerUp = useCallback(() => {
    const state = dragStateRef.current;
    if (!state.isPointerDown) {
      return;
    }

    state.isPointerDown = false;

    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    }

    if (state.dragging) {
      state.dragging = false;
      setIsDragging(false);
      setTimeout(() => {
        preventClickRef.current = false;
      }, 120);
    } else {
      preventClickRef.current = false;
    }
  }, [handlePointerMove]);

  const handlePointerDown = useCallback((event) => {
    const rect = containerRef.current?.getBoundingClientRect();
    dragStateRef.current = {
      isPointerDown: true,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - (rect?.left ?? 0),
      offsetY: event.clientY - (rect?.top ?? 0),
      dragging: false,
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, [handlePointerMove, handlePointerUp]);

  const handleOpen = () => {
    if (preventClickRef.current) {
      return;
    }
    setIsExpanded(true);
  };

  const pickRandomStudent = () => {
    if (availableStudents.length === 0) {
      return;
    }

    setIsSpinning(true);
    setSelectedStudent(null);
    
    // Spinning animation with random names
    let spinCount = 0;
    const maxSpins = 20;
    
    const spinInterval = setInterval(() => {
      const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
      setSpinText(randomStudent.firstName);
      spinCount++;
      
      if (spinCount >= maxSpins) {
        clearInterval(spinInterval);
        // Final selection
        const finalStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
        setSelectedStudent(finalStudent);
        setSpinText(finalStudent.firstName);
        setIsSpinning(false);
        playSound('select');
      }
    }, 100);
  };

  const generateRandomGroups = () => {
    if (availableStudents.length < groupSize) {
      return;
    }

    // Shuffle students
    const shuffled = [...availableStudents].sort(() => Math.random() - 0.5);
    const groups = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      groups.push(shuffled.slice(i, i + groupSize));
    }
    
    setGeneratedGroups(groups);
    playSound('success');
  };

  const toggleStudentExclusion = (studentId) => {
    const newExcluded = new Set(excludedStudents);
    if (newExcluded.has(studentId)) {
      newExcluded.delete(studentId);
    } else {
      newExcluded.add(studentId);
    }
    setExcludedStudents(newExcluded);
  };

  const clearExclusions = () => {
    setExcludedStudents(new Set());
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setGeneratedGroups([]);
    setSpinText('');
  };

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{ top: position.y, left: position.x }}
    >
      {!isExpanded && (
        <div
          onPointerDown={handlePointerDown}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          className="transition-all duration-300"
        >
          <button
            onClick={handleOpen}
            className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center text-white font-bold"
            title="Name Picker"
          >
            <div className="text-center">
              <div className="text-lg">🎯</div>
              <div className="text-xs leading-none">Pick</div>
            </div>
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="z-50 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 w-80 max-h-[calc(100vh-3rem)] overflow-y-auto">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 flex justify-between items-center"
            onPointerDown={handlePointerDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎯</span>
              <h3 className="font-bold">Name Picker</h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex rounded-lg overflow-hidden border">
              <button
                onClick={() => {setPickerMode('single'); clearSelection();}}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-colors ${
                  pickerMode === 'single' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                👤 Single
              </button>
              <button
                onClick={() => {setPickerMode('multiple'); clearSelection();}}
                className={`flex-1 py-2 px-3 text-sm font-semibold transition-colors ${
                  pickerMode === 'multiple' 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                👥 Groups
              </button>
            </div>
          </div>

          {/* Single Student Mode */}
          {pickerMode === 'single' && (
            <div className="p-4">
              {/* Selection Display */}
              <div className="text-center mb-4 p-4 bg-gray-50 rounded-lg min-h-[80px] flex items-center justify-center">
                {isSpinning ? (
                  <div className="animate-pulse">
                    <div className="text-2xl font-bold text-purple-600">{spinText}</div>
                    <div className="text-sm text-gray-500">Selecting...</div>
                  </div>
                ) : selectedStudent ? (
                  <div className="text-center">
                    <img 
                      src={getAvatarImage(selectedStudent.avatarBase, calculateAvatarLevel(selectedStudent.totalPoints))}
                      className="w-12 h-12 rounded-full border-2 border-purple-400 mx-auto mb-2"
                      alt={selectedStudent.firstName}
                    />
                    <div className="text-xl font-bold text-purple-600">{selectedStudent.firstName}</div>
                    <div className="text-sm text-gray-500">Level {calculateAvatarLevel(selectedStudent.totalPoints)}</div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <div className="text-lg">🎲</div>
                    <div className="text-sm">Click Pick to select</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={pickRandomStudent}
                  disabled={isSpinning || availableStudents.length === 0}
                  className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSpinning ? '🎲 Picking...' : '🎯 Pick Student'}
                </button>
                
                {selectedStudent && (
                  <button
                    onClick={clearSelection}
                    className="w-full bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition-all"
                  >
                    🔄 Clear Selection
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center mt-2">
                Available: {availableStudents.length} students
              </div>
            </div>
          )}

          {/* Group Mode */}
          {pickerMode === 'multiple' && (
            <div className="p-4">
              {/* Group Size Setting */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600 mb-2">Group Size</label>
                <div className="flex space-x-2">
                  {[2, 3, 4, 5].map(size => (
                    <button
                      key={size}
                      onClick={() => setGroupSize(size)}
                      className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                        groupSize === size 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Groups Display */}
              {generatedGroups.length > 0 && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg max-h-32 overflow-y-auto">
                  <div className="text-sm font-semibold text-purple-800 mb-2">Groups:</div>
                  {generatedGroups.map((group, index) => (
                    <div key={index} className="text-sm mb-1">
                      <span className="font-semibold text-purple-600">Group {index + 1}:</span> {group.map(s => s.firstName).join(', ')}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={generateRandomGroups}
                  disabled={availableStudents.length < groupSize}
                  className="w-full bg-purple-500 text-white py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  👥 Generate Groups
                </button>
                
                {generatedGroups.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="w-full bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition-all"
                  >
                    🔄 Clear Groups
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-500 text-center mt-2">
                Available: {availableStudents.length} students
              </div>
            </div>
          )}

          {/* Student Exclusion Toggle */}
          {students.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-600">
                  Exclude Students ({excludedStudents.size})
                </span>
                {excludedStudents.size > 0 && (
                  <button
                    onClick={clearExclusions}
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto">
                {students.map(student => (
                  <button
                    key={student.id}
                    onClick={() => toggleStudentExclusion(student.id)}
                    className={`text-xs p-1 rounded transition-colors ${
                      excludedStudents.has(student.id)
                        ? 'bg-red-100 text-red-700 line-through'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {student.firstName}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingNamePicker;