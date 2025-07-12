// NamePicker.js - Smart Name Selection Wheel (FIXED CONTRAST)
import React, { useState, useEffect, useRef } from 'react';

const NamePicker = ({ students, showToast }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pickedStudents, setPickedStudents] = useState(new Set());
  const [availableStudents, setAvailableStudents] = useState([]);
  const [pickHistory, setPickHistory] = useState([]);
  const [spinDuration, setSpinDuration] = useState(3000);
  const [excludeMode, setExcludeMode] = useState('none'); // 'none', 'exclude', 'reset'
  const [wheelSize, setWheelSize] = useState('large');
  const [showHistory, setShowHistory] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState('normal');
  
  const wheelRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setAvailableStudents(students.filter(student => !pickedStudents.has(student.id)));
  }, [students, pickedStudents]);

  useEffect(() => {
    // Create audio context for sound effects
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkeBz2V4PS8cSQLKoHOvs2IXt8TZLaKl8TXTFANTrro9bGJ');
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
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
    playSound();

    // Animate the wheel spinning
    if (wheelRef.current) {
      const randomRotations = 3 + Math.random() * 5; // 3-8 full rotations
      const finalRotation = randomRotations * 360;
      
      wheelRef.current.style.transition = `transform ${spinDuration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
      wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;
    }

    // Wait for animation to complete
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      const picked = availableStudents[randomIndex];
      
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
      
      // Reset wheel rotation
      if (wheelRef.current) {
        setTimeout(() => {
          wheelRef.current.style.transition = 'none';
          wheelRef.current.style.transform = 'rotate(0deg)';
        }, 500);
      }

      showToast(`Selected: ${picked.firstName}!`);
    }, spinDuration);
  };

  // Reset picked students
  const resetPicked = () => {
    setPickedStudents(new Set());
    setSelectedStudent(null);
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

  // Get wheel segment colors
  const getSegmentColor = (index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[index % colors.length];
  };

  // Create wheel segments
  const createWheelSegments = () => {
    const studentsToShow = availableStudents.length > 0 ? availableStudents : students;
    const segmentAngle = 360 / studentsToShow.length;
    
    return studentsToShow.map((student, index) => {
      const rotation = index * segmentAngle;
      const color = getSegmentColor(index);
      
      return (
        <div
          key={student.id}
          className="absolute wheel-segment"
          style={{
            width: '50%',
            height: '50%',
            transformOrigin: '100% 100%',
            transform: `rotate(${rotation}deg)`,
            backgroundColor: color,
            clipPath: `polygon(0 100%, 100% 100%, ${50 + Math.tan((segmentAngle * Math.PI) / 360) * 50}% 0)`,
          }}
        >
          <div
            className="segment-text"
            style={{
              transform: `rotate(${segmentAngle / 2}deg) translateX(60%)`,
              transformOrigin: '0 100%'
            }}
          >
            <span className="text-white font-bold text-sm whitespace-nowrap">
              {student.firstName}
            </span>
          </div>
        </div>
      );
    });
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
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎯 Smart Name Picker</h2>
        <p className="text-gray-700">Fair and engaging student selection with visual wheel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{availableStudents.length}</div>
            <div className="text-sm text-gray-800 font-semibold">Available</div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{pickedStudents.size}</div>
            <div className="text-sm text-gray-800 font-semibold">Already Picked</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{students.length}</div>
            <div className="text-sm text-gray-800 font-semibold">Total Students</div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{pickHistory.length}</div>
            <div className="text-sm text-gray-800 font-semibold">Picks Today</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Exclude Mode */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Exclude Mode</h3>
            <select
              value={excludeMode}
              onChange={(e) => setExcludeMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
            >
              <option value="none">No Exclusion</option>
              <option value="exclude">Exclude After Pick</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              {excludeMode === 'exclude' ? 'Students removed after being picked' : 'Same students can be picked multiple times'}
            </p>
          </div>

          {/* Spin Duration */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Spin Duration</h3>
            <select
              value={spinDuration}
              onChange={(e) => setSpinDuration(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
            >
              <option value="1500">Fast (1.5s)</option>
              <option value="3000">Normal (3s)</option>
              <option value="5000">Slow (5s)</option>
              <option value="7000">Very Slow (7s)</option>
            </select>
          </div>

          {/* Wheel Size */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Wheel Size</h3>
            <select
              value={wheelSize}
              onChange={(e) => setWheelSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-800"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={resetPicked}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors text-sm"
              >
                🔄 Reset All
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
              >
                📜 {showHistory ? 'Hide' : 'Show'} History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wheel and Main Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="text-center">
            {/* Wheel */}
            <div className="relative mx-auto mb-6" style={{
              width: wheelSize === 'small' ? '200px' : wheelSize === 'medium' ? '300px' : '400px',
              height: wheelSize === 'small' ? '200px' : wheelSize === 'medium' ? '300px' : '400px'
            }}>
              <div
                ref={wheelRef}
                className="relative w-full h-full rounded-full border-4 border-gray-800 overflow-hidden"
                style={{ backgroundColor: '#f3f4f6' }}
              >
                {availableStudents.length > 0 ? createWheelSegments() : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-600 font-bold">No Available Students</span>
                  </div>
                )}
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
              </div>
            </div>

            {/* Pick Button */}
            <button
              onClick={pickRandomStudent}
              disabled={isSpinning || availableStudents.length === 0}
              className={`px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300 ${
                isSpinning || availableStudents.length === 0
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105 shadow-lg'
              }`}
            >
              {isSpinning ? '🎯 Spinning...' : '🎯 Pick Student'}
            </button>

            {/* Selected Student Display */}
            {selectedStudent && !isSpinning && (
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <div className="flex items-center justify-center space-x-4">
                  {selectedStudent.avatar && (
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.firstName}
                      className="w-16 h-16 rounded-full border-2 border-green-500"
                    />
                  )}
                  <div>
                    <div className="text-2xl font-bold text-green-800">
                      {selectedStudent.firstName}
                    </div>
                    <div className="text-green-700 font-semibold">Selected!</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student Lists */}
        <div className="space-y-6">
          {/* Available Students */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Available Students ({availableStudents.length})
            </h3>
            
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableStudents.map((student) => (
                <div key={student.id} className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  {student.avatar && (
                    <img src={student.avatar} alt={student.firstName} className="w-6 h-6 rounded-full" />
                  )}
                  <span className="font-semibold text-gray-800 text-sm">{student.firstName}</span>
                </div>
              ))}
            </div>
            
            {availableStudents.length === 0 && pickedStudents.size > 0 && (
              <div className="text-center py-8 text-gray-600">
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
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Already Picked ({pickedStudents.size})
              </h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {students.filter(s => pickedStudents.has(s.id)).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {student.avatar && (
                        <img src={student.avatar} alt={student.firstName} className="w-6 h-6 rounded-full" />
                      )}
                      <span className="font-semibold text-gray-800 text-sm">{student.firstName}</span>
                    </div>
                    <button
                      onClick={() => removeFromPicked(student.id)}
                      className="text-orange-600 hover:text-orange-800 font-bold text-sm"
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
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Pick History ({pickHistory.length})</h3>
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
            >
              Clear History
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pickHistory.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-600 font-bold text-sm">#{pickHistory.length - index}</span>
                  {entry.student.avatar && (
                    <img src={entry.student.avatar} alt={entry.student.firstName} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="font-semibold text-gray-800">{entry.student.firstName}</span>
                </div>
                <span className="text-xs text-gray-600 font-semibold">
                  {entry.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .wheel-segment {
          position: absolute;
        }
        
        .segment-text {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default NamePicker;