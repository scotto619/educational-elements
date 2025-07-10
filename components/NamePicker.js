// NamePicker.js - Interactive Student Name Selector with Spinning Wheel
import React, { useState, useEffect, useRef } from 'react';

const NamePicker = ({ students, showToast }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [excludedStudents, setExcludedStudents] = useState(new Set());
  const [pickHistory, setPickHistory] = useState([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [mode, setMode] = useState('fair'); // 'fair' or 'weighted'
  const [autoExclude, setAutoExclude] = useState(false);
  const wheelRef = useRef(null);

  // Get available students (not excluded)
  const availableStudents = students.filter(student => !excludedStudents.has(student.id));

  // Generate wheel segments
  const generateSegments = () => {
    if (availableStudents.length === 0) return [];
    
    const segmentAngle = 360 / availableStudents.length;
    return availableStudents.map((student, index) => ({
      ...student,
      startAngle: index * segmentAngle,
      endAngle: (index + 1) * segmentAngle,
      color: `hsl(${(index * 137.5) % 360}, 70%, 60%)` // Golden ratio for nice color distribution
    }));
  };

  const segments = generateSegments();

  // Spin the wheel
  const spinWheel = () => {
    if (availableStudents.length === 0) {
      showToast('No students available to pick!');
      return;
    }

    setIsSpinning(true);
    setSelectedStudent(null);

    // Random number of full rotations plus random position
    const minSpins = 3;
    const maxSpins = 6;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const finalRotation = wheelRotation + (spins * 360) + (Math.random() * 360);

    setWheelRotation(finalRotation);

    // Calculate which student was selected
    setTimeout(() => {
      const normalizedAngle = (360 - (finalRotation % 360) + 90) % 360; // Adjust for top pointer
      const selectedSegment = segments.find(segment => 
        normalizedAngle >= segment.startAngle && normalizedAngle < segment.endAngle
      );

      if (selectedSegment) {
        setSelectedStudent(selectedSegment);
        setPickHistory(prev => [{
          student: selectedSegment,
          timestamp: new Date(),
          id: Date.now()
        }, ...prev.slice(0, 9)]); // Keep last 10 picks

        if (autoExclude) {
          setExcludedStudents(prev => new Set([...prev, selectedSegment.id]));
        }

        showToast(`Selected: ${selectedSegment.firstName}! 🎯`);
      }

      setIsSpinning(false);
    }, 3000); // Match animation duration
  };

  // Toggle student exclusion
  const toggleStudentExclusion = (studentId) => {
    setExcludedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  // Reset exclusions
  const resetExclusions = () => {
    setExcludedStudents(new Set());
    showToast('All students are now available for selection!');
  };

  // Clear history
  const clearHistory = () => {
    setPickHistory([]);
    showToast('Pick history cleared!');
  };

  // Quick pick (no animation)
  const quickPick = () => {
    if (availableStudents.length === 0) {
      showToast('No students available to pick!');
      return;
    }

    const randomStudent = availableStudents[Math.floor(Math.random() * availableStudents.length)];
    setSelectedStudent(randomStudent);
    setPickHistory(prev => [{
      student: randomStudent,
      timestamp: new Date(),
      id: Date.now()
    }, ...prev.slice(0, 9)]);

    if (autoExclude) {
      setExcludedStudents(prev => new Set([...prev, randomStudent.id]));
    }

    showToast(`Quick picked: ${randomStudent.firstName}! ⚡`);
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-600">
          Add students to your class to use the Name Picker tool.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎯 Name Picker Wheel</h2>
        <p className="text-gray-600">Randomly select students with style!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wheel Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="text-center">
            {/* Wheel Container */}
            <div className="relative inline-block mb-6">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
              </div>

              {/* Wheel */}
              <div className="relative">
                <svg
                  ref={wheelRef}
                  width="300"
                  height="300"
                  viewBox="0 0 300 300"
                  className="transition-transform duration-3000 ease-out"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {segments.map((segment, index) => {
                    const startAngle = (segment.startAngle - 90) * (Math.PI / 180);
                    const endAngle = (segment.endAngle - 90) * (Math.PI / 180);
                    const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                    
                    const x1 = 150 + 140 * Math.cos(startAngle);
                    const y1 = 150 + 140 * Math.sin(startAngle);
                    const x2 = 150 + 140 * Math.cos(endAngle);
                    const y2 = 150 + 140 * Math.sin(endAngle);
                    
                    const midAngle = (startAngle + endAngle) / 2;
                    const textX = 150 + 100 * Math.cos(midAngle);
                    const textY = 150 + 100 * Math.sin(midAngle);

                    return (
                      <g key={segment.id}>
                        <path
                          d={`M 150 150 L ${x1} ${y1} A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={textX}
                          y={textY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="bold"
                          transform={`rotate(${(segment.startAngle + segment.endAngle) / 2}, ${textX}, ${textY})`}
                        >
                          {segment.firstName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Selected Student Display */}
            {selectedStudent && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6 animate-pulse">
                <h3 className="text-2xl font-bold text-green-800 mb-2">🎉 Selected!</h3>
                <div className="flex items-center justify-center space-x-4">
                  {selectedStudent.avatar && (
                    <img 
                      src={selectedStudent.avatar} 
                      alt={selectedStudent.firstName} 
                      className="w-16 h-16 rounded-full border-4 border-green-300"
                    />
                  )}
                  <span className="text-3xl font-bold text-gray-800">{selectedStudent.firstName}</span>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={spinWheel}
                disabled={isSpinning || availableStudents.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg"
              >
                {isSpinning ? '🎡 Spinning...' : '🎡 Spin Wheel'}
              </button>
              <button
                onClick={quickPick}
                disabled={availableStudents.length === 0}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                ⚡ Quick Pick
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              {availableStudents.length} of {students.length} students available
            </p>
          </div>
        </div>

        {/* Controls and History Section */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Settings</h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={autoExclude}
                  onChange={(e) => setAutoExclude(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Auto-exclude picked students</span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={resetExclusions}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Reset All
                </button>
                <button
                  onClick={clearHistory}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Student List</h3>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {students.map(student => {
                const isExcluded = excludedStudents.has(student.id);
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isExcluded 
                        ? 'bg-gray-100 border-gray-300 opacity-60' 
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {student.avatar && (
                        <img 
                          src={student.avatar} 
                          alt={student.firstName} 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <span className={`font-semibold ${isExcluded ? 'text-gray-500' : 'text-gray-800'}`}>
                        {student.firstName}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => toggleStudentExclusion(student.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                        isExcluded 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isExcluded ? 'Include' : 'Exclude'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pick History */}
          {pickHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Picks</h3>
              
              <div className="space-y-2">
                {pickHistory.map((pick, index) => (
                  <div
                    key={pick.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                      {pick.student.avatar && (
                        <img 
                          src={pick.student.avatar} 
                          alt={pick.student.firstName} 
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="font-semibold text-gray-800">{pick.student.firstName}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {pick.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .duration-3000 {
          transition-duration: 3s;
        }
      `}</style>
    </div>
  );
};

export default NamePicker;