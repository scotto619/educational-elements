// NamePicker.js - Clean Name Cycling Animation
import React, { useState, useEffect, useRef } from 'react';

const NamePicker = ({ students, showToast }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pickedStudents, setPickedStudents] = useState(new Set());
  const [availableStudents, setAvailableStudents] = useState([]);
  const [pickHistory, setPickHistory] = useState([]);
  const [excludeMode, setExcludeMode] = useState('none');
  const [showHistory, setShowHistory] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState('');
  const [cyclingNames, setCyclingNames] = useState([]);
  
  const cycleIntervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setAvailableStudents(students.filter(student => !pickedStudents.has(student.id)));
  }, [students, pickedStudents]);

  useEffect(() => {
    // Initialize display
    if (availableStudents.length > 0 && !isSpinning) {
      setCurrentDisplayName(availableStudents[0].firstName);
    }
  }, [availableStudents, isSpinning]);

  useEffect(() => {
    // Create audio context for sound effects
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkeBz2V4PS8cSQLKoHOvs2IXt8TZLaKl8TXTFANTrro9bGJ');
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Create cycling effect
  const startNameCycling = () => {
    if (availableStudents.length === 0) return;
    
    let cycleSpeed = 50; // Start fast
    let cycleCount = 0;
    const maxCycles = 60; // Total cycles before slowing down
    
    cycleIntervalRef.current = setInterval(() => {
      const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
      setCurrentDisplayName(randomStudent.firstName);
      
      cycleCount++;
      
      // Gradually slow down the cycling
      if (cycleCount > maxCycles * 0.7) {
        cycleSpeed += 20; // Slow down more dramatically at the end
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = setInterval(() => {
          const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
          setCurrentDisplayName(randomStudent.firstName);
          cycleCount++;
          
          if (cycleCount >= maxCycles) {
            clearInterval(cycleIntervalRef.current);
            finalizePick();
          }
        }, cycleSpeed);
      }
    }, cycleSpeed);
  };

  const finalizePick = () => {
    // Pick the final student
    const randomIndex = Math.floor(Math.random() * availableStudents.length);
    const picked = availableStudents[randomIndex];
    
    setCurrentDisplayName(picked.firstName);
    setSelectedStudent(picked);
    
    // Add to pick history
    const historyEntry = {
      student: picked,
      timestamp: new Date(),
      id: Date.now()
    };
    setPickHistory(prev => [historyEntry, ...prev]);

    // Handle exclude mode
    if (excludeMode === 'exclude') {
      setPickedStudents(prev => new Set([...prev, picked.id]));
    }

    setIsSpinning(false);
    showToast(`Selected: ${picked.firstName}!`, 'success');
  };

  // Pick a random student
  const pickRandomStudent = async () => {
    if (availableStudents.length === 0) {
      if (pickedStudents.size === 0) {
        showToast('No students available!', 'error');
        return;
      } else {
        showToast('All students have been picked!', 'warning');
        return;
      }
    }

    setIsSpinning(true);
    setSelectedStudent(null);
    playSound();
    
    // Start the cycling animation
    startNameCycling();

    // Stop after 3 seconds
    setTimeout(() => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        finalizePick();
      }
    }, 3000);
  };

  // Reset picked students
  const resetPicked = () => {
    setPickedStudents(new Set());
    setSelectedStudent(null);
    if (availableStudents.length === 0 && students.length > 0) {
      setCurrentDisplayName(students[0].firstName);
    }
    showToast('Reset complete! All students are available again.');
  };

  // Clear history
  const clearHistory = () => {
    setPickHistory([]);
    showToast('History cleared!');
  };

  // Remove student from picked list
  const removeFromPicked = (studentId) => {
    setPickedStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
    showToast('Student returned to available pool!');
  };

  // Get avatar for current display name
  const getCurrentDisplayAvatar = () => {
    const student = availableStudents.find(s => s.firstName === currentDisplayName);
    return student?.avatar || null;
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-700">
          Add students to your class or load a class to use the Name Picker.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">🎯 Smart Name Picker</h2>
        <p className="text-slate-600">Fair and engaging student selection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{availableStudents.length}</div>
            <div className="text-sm text-slate-700 font-semibold">Available</div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pickedStudents.size}</div>
            <div className="text-sm text-slate-700 font-semibold">Already Picked</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{students.length}</div>
            <div className="text-sm text-slate-700 font-semibold">Total Students</div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{pickHistory.length}</div>
            <div className="text-sm text-slate-700 font-semibold">Picks Today</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Exclude Mode */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Exclude Mode</h3>
            <select
              value={excludeMode}
              onChange={(e) => setExcludeMode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Exclusion</option>
              <option value="exclude">Exclude After Pick</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {excludeMode === 'exclude' ? 'Students removed after being picked' : 'Same students can be picked multiple times'}
            </p>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Actions</h3>
            <div className="flex space-x-2">
              <button
                onClick={resetPicked}
                className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-semibold transition-colors text-sm"
              >
                🔄 Reset All
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
              >
                📜 {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>
          </div>

          {/* Quick Info */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Status</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-600">Available:</span>
                <span className="font-bold text-slate-800">{availableStudents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">History:</span>
                <span className="font-bold text-slate-800">{pickHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Picker Display */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            {/* Name Display */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-8 mb-6 border-4 border-slate-300">
                {/* Avatar */}
                <div className="mb-4">
                  {getCurrentDisplayAvatar() ? (
                    <img
                      src={getCurrentDisplayAvatar()}
                      alt={currentDisplayName}
                      className={`w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto transition-all duration-300 ${
                        isSpinning ? 'animate-pulse' : ''
                      }`}
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full border-4 border-white bg-slate-300 flex items-center justify-center mx-auto shadow-lg transition-all duration-300 ${
                      isSpinning ? 'animate-pulse' : ''
                    }`}>
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <div className={`text-4xl font-bold text-slate-800 transition-all duration-200 ${
                  isSpinning ? 'animate-pulse' : ''
                }`}>
                  {currentDisplayName || '?'}
                </div>
                
                {/* Status */}
                <div className="text-lg text-slate-600 mt-2">
                  {isSpinning ? 'Picking...' : 'Ready to pick!'}
                </div>
              </div>

              {/* Pick Button */}
              <button
                onClick={pickRandomStudent}
                disabled={isSpinning || availableStudents.length === 0}
                className={`px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 ${
                  isSpinning || availableStudents.length === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg'
                }`}
              >
                {isSpinning ? '🎯 Picking...' : '🎯 Pick Student'}
              </button>
            </div>

            {/* Selected Student Display */}
            {selectedStudent && !isSpinning && (
              <div className="mt-6 p-6 bg-green-50 border-2 border-green-300 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 mb-2">
                    🎉 {selectedStudent.firstName} Selected! 🎉
                  </div>
                  <div className="text-green-700">
                    Great choice! Time to participate.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Lists */}
        <div className="space-y-6">
          {/* Available Students */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              Available Students ({availableStudents.length})
            </h3>
            
            {availableStudents.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableStudents.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    {student.avatar && (
                      <img src={student.avatar} alt={student.firstName} className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-semibold text-slate-800 text-sm">{student.firstName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-600">
                <div className="text-4xl mb-2">🎯</div>
                <p className="italic">All students have been picked!</p>
                <button
                  onClick={resetPicked}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Reset to Pick Again
                </button>
              </div>
            )}
          </div>

          {/* Already Picked Students */}
          {pickedStudents.size > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                Already Picked ({pickedStudents.size})
              </h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {students.filter(s => pickedStudents.has(s.id)).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {student.avatar && (
                        <img src={student.avatar} alt={student.firstName} className="w-6 h-6 rounded-full" />
                      )}
                      <span className="font-semibold text-slate-800 text-sm">{student.firstName}</span>
                    </div>
                    <button
                      onClick={() => removeFromPicked(student.id)}
                      className="text-orange-600 hover:text-orange-800 font-bold text-sm px-2 py-1 rounded hover:bg-orange-100 transition-colors"
                    >
                      Return
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pick History */}
      {showHistory && pickHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800">Pick History ({pickHistory.length})</h3>
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pickHistory.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  <span className="text-slate-600 font-bold text-sm">#{pickHistory.length - index}</span>
                  {entry.student.avatar && (
                    <img src={entry.student.avatar} alt={entry.student.firstName} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="font-semibold text-slate-800">{entry.student.firstName}</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NamePicker;