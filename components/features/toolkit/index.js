// components/features/toolkit/index.js - Teacher Toolkit Components
// These focused components handle teacher utilities and classroom management tools

import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  IconButton,
  Card, 
  Modal,
  InputField,
  SelectField,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { useStudents } from '../../../hooks';
import soundService from '../../../services/soundService';

// ===============================================
// TIMER COMPONENTS
// ===============================================

/**
 * Classroom Timer with multiple modes
 */
export const ClassroomTimer = () => {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState('countdown'); // 'countdown', 'stopwatch', 'pomodoro'
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            soundService.playNotificationSound();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const startTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(minutes * 60 + seconds);
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(0);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const TimerDisplay = ({ className = '' }) => (
    <div className={`text-center ${className}`}>
      <div className="text-6xl md:text-8xl font-mono font-bold text-gray-800 mb-4">
        {formatTime(timeLeft)}
      </div>
      
      <div className="flex justify-center space-x-4">
        {!isActive ? (
          <Button 
            onClick={startTimer}
            className="bg-green-500 hover:bg-green-600"
            size="lg"
          >
            ▶️ Start
          </Button>
        ) : (
          <Button 
            onClick={pauseTimer}
            className="bg-yellow-500 hover:bg-yellow-600"
            size="lg"
          >
            ⏸️ Pause
          </Button>
        )}
        
        <Button 
          onClick={resetTimer}
          variant="secondary"
          size="lg"
        >
          🔄 Reset
        </Button>
        
        <Button 
          onClick={() => setIsFullscreen(true)}
          variant="secondary"
          size="lg"
        >
          🔍 Fullscreen
        </Button>
      </div>
    </div>
  );

  return (
    <Card title="Classroom Timer">
      <div className="space-y-6">
        {/* Timer Setup */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Minutes"
            type="number"
            value={minutes}
            onChange={(value) => setMinutes(parseInt(value) || 0)}
            disabled={isActive}
          />
          <InputField
            label="Seconds"
            type="number"
            value={seconds}
            onChange={(value) => setSeconds(parseInt(value) || 0)}
            disabled={isActive}
          />
        </div>

        {/* Quick Preset Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 5, 10, 15].map(preset => (
            <Button
              key={preset}
              size="sm"
              variant="secondary"
              onClick={() => {
                setMinutes(preset);
                setSeconds(0);
                setTimeLeft(0);
                setIsActive(false);
              }}
              disabled={isActive}
            >
              {preset}m
            </Button>
          ))}
        </div>

        {/* Timer Display */}
        <TimerDisplay />

        {/* Progress Bar */}
        {timeLeft > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{ 
                width: `${((minutes * 60 + seconds - timeLeft) / (minutes * 60 + seconds)) * 100}%` 
              }}
            />
          </div>
        )}
      </div>

      {/* Fullscreen Timer Modal */}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title="Timer"
        size="xl"
        showCloseButton={false}
      >
        <div className="p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white min-h-96 flex items-center justify-center">
          <TimerDisplay className="text-white" />
        </div>
      </Modal>
    </Card>
  );
};

// ===============================================
// RANDOM NAME/STUDENT PICKER
// ===============================================

/**
 * Random student selector for fair participation
 */
export const StudentPicker = ({ students }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [excludedStudents, setExcludedStudents] = useState([]);
  const [pickerHistory, setPickerHistory] = useState([]);

  const availableStudents = students.filter(student => 
    !excludedStudents.includes(student.id)
  );

  const pickRandomStudent = () => {
    if (availableStudents.length === 0) {
      return;
    }

    setIsSpinning(true);
    soundService.playClickSound();

    // Simulate spinning animation
    let count = 0;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableStudents.length);
      setSelectedStudent(availableStudents[randomIndex]);
      count++;

      if (count > 10) {
        clearInterval(spinInterval);
        setIsSpinning(false);
        soundService.playNotificationSound();
        
        // Add to history
        const finalStudent = availableStudents[randomIndex];
        setPickerHistory(prev => [
          { student: finalStudent, timestamp: new Date().toISOString() },
          ...prev.slice(0, 9) // Keep last 10 picks
        ]);
      }
    }, 100);
  };

  const toggleExclude = (studentId) => {
    setExcludedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const resetPicker = () => {
    setSelectedStudent(null);
    setExcludedStudents([]);
    setPickerHistory([]);
  };

  return (
    <Card title="Random Student Picker">
      <div className="space-y-6">
        {/* Main Picker Display */}
        <div className="text-center space-y-4">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white p-8 rounded-xl">
            {selectedStudent ? (
              <div className="space-y-3">
                <img
                  src={selectedStudent.avatar}
                  alt={`${selectedStudent.firstName}'s avatar`}
                  className={`w-20 h-20 mx-auto rounded-full border-4 border-white ${isSpinning ? 'animate-spin' : ''}`}
                  onError={(e) => {
                    e.target.src = '/Avatars/Wizard F/Level 1.png';
                  }}
                />
                <h3 className="text-2xl font-bold">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-purple-100">
                  Level {selectedStudent.level || 1}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-4xl">❓</span>
                </div>
                <h3 className="text-2xl font-bold">Who's Next?</h3>
                <p className="text-purple-100">Click the button to find out!</p>
              </div>
            )}
          </div>

          <div className="flex justify-center space-x-4">
            <Button
              onClick={pickRandomStudent}
              disabled={isSpinning || availableStudents.length === 0}
              loading={isSpinning}
              className="bg-green-500 hover:bg-green-600"
              size="lg"
            >
              🎲 Pick Student
            </Button>
            
            <Button
              onClick={resetPicker}
              variant="secondary"
              size="lg"
            >
              🔄 Reset
            </Button>
          </div>

          <p className="text-gray-600">
            {availableStudents.length} student{availableStudents.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Student List with Exclude Options */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Manage Students:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {students.map(student => (
              <button
                key={student.id}
                onClick={() => toggleExclude(student.id)}
                className={`
                  p-2 rounded text-sm text-left transition-all
                  ${excludedStudents.includes(student.id)
                    ? 'bg-red-100 text-red-800 line-through'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }
                `}
              >
                {student.firstName} {student.lastName}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Picks History */}
        {pickerHistory.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Recent Picks:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pickerHistory.map((pick, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <span>{pick.student.firstName} {pick.student.lastName}</span>
                  <span className="text-gray-500">
                    {new Date(pick.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ===============================================
// CLASSROOM SEATING CHART
// ===============================================

/**
 * Drag-and-drop seating arrangement tool
 */
export const SeatingChart = ({ students }) => {
  const [layout, setLayout] = useState('grid'); // 'grid', 'groups', 'horseshoe'
  const [seatingArrangement, setSeatingArrangement] = useState({});
  const [draggedStudent, setDraggedStudent] = useState(null);

  const handleDragStart = (student) => {
    setDraggedStudent(student);
  };

  const handleDrop = (seatId) => {
    if (draggedStudent) {
      setSeatingArrangement(prev => ({
        ...prev,
        [seatId]: draggedStudent
      }));
      setDraggedStudent(null);
    }
  };

  const clearSeat = (seatId) => {
    setSeatingArrangement(prev => {
      const newArrangement = { ...prev };
      delete newArrangement[seatId];
      return newArrangement;
    });
  };

  const generateRandomSeating = () => {
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const newArrangement = {};
    
    shuffledStudents.forEach((student, index) => {
      newArrangement[`seat-${index}`] = student;
    });
    
    setSeatingArrangement(newArrangement);
  };

  const SeatComponent = ({ seatId, size = 'medium' }) => {
    const student = seatingArrangement[seatId];
    const sizeClasses = {
      small: 'w-12 h-12',
      medium: 'w-16 h-16',
      large: 'w-20 h-20'
    };

    return (
      <div
        className={`
          ${sizeClasses[size]} border-2 border-dashed border-gray-300 rounded-lg
          flex items-center justify-center relative cursor-pointer
          hover:border-blue-400 transition-colors
          ${student ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'}
        `}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(seatId)}
      >
        {student ? (
          <div className="text-center">
            <img
              src={student.avatar}
              alt={student.firstName}
              className="w-8 h-8 rounded-full mx-auto mb-1"
              onError={(e) => {
                e.target.src = '/Avatars/Wizard F/Level 1.png';
              }}
            />
            <div className="text-xs font-medium truncate">
              {student.firstName}
            </div>
            <button
              onClick={() => clearSeat(seatId)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="text-gray-400 text-xs">Empty</div>
        )}
      </div>
    );
  };

  const renderLayout = () => {
    const seatCount = Math.max(students.length, 20);
    
    switch (layout) {
      case 'grid':
        const cols = Math.ceil(Math.sqrt(seatCount));
        return (
          <div 
            className="grid gap-2 p-4"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: seatCount }, (_, i) => (
              <SeatComponent key={`seat-${i}`} seatId={`seat-${i}`} />
            ))}
          </div>
        );

      case 'groups':
        const groupSize = 4;
        const groups = Math.ceil(seatCount / groupSize);
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {Array.from({ length: groups }, (_, groupIndex) => (
              <div key={groupIndex} className="border border-gray-300 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Group {groupIndex + 1}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: groupSize }, (_, seatIndex) => {
                    const seatId = `group-${groupIndex}-seat-${seatIndex}`;
                    return (
                      <SeatComponent key={seatId} seatId={seatId} size="small" />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );

      case 'horseshoe':
        return (
          <div className="relative p-8">
            {/* Front of classroom */}
            <div className="text-center mb-8 p-4 bg-gray-200 rounded">
              Teacher's Desk
            </div>
            
            {/* Horseshoe arrangement */}
            <div className="relative h-64">
              {Array.from({ length: seatCount }, (_, i) => {
                const angle = (i / (seatCount - 1)) * Math.PI;
                const radius = 80;
                const x = 50 + (radius * Math.cos(angle));
                const y = 50 + (radius * Math.sin(angle) * 0.5);
                
                return (
                  <div
                    key={`seat-${i}`}
                    className="absolute"
                    style={{ 
                      left: `${x}%`, 
                      top: `${y}%`, 
                      transform: 'translate(-50%, -50%)' 
                    }}
                  >
                    <SeatComponent seatId={`seat-${i}`} size="small" />
                  </div>
                );
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card title="Classroom Seating Chart">
      <div className="space-y-6">
        {/* Layout Controls */}
        <div className="flex items-center justify-between">
          <SelectField
            label="Layout Style"
            value={layout}
            onChange={setLayout}
            options={[
              { value: 'grid', label: 'Traditional Grid' },
              { value: 'groups', label: 'Group Tables' },
              { value: 'horseshoe', label: 'Horseshoe' }
            ]}
          />
          
          <Button onClick={generateRandomSeating} variant="secondary">
            🎲 Random Seating
          </Button>
        </div>

        {/* Student Bank */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-3">Available Students:</h4>
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg min-h-16">
            {students
              .filter(student => !Object.values(seatingArrangement).includes(student))
              .map(student => (
                <div
                  key={student.id}
                  draggable
                  onDragStart={() => handleDragStart(student)}
                  className="flex items-center space-x-2 bg-white p-2 rounded border cursor-move hover:shadow-md"
                >
                  <img
                    src={student.avatar}
                    alt={student.firstName}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.target.src = '/Avatars/Wizard F/Level 1.png';
                    }}
                  />
                  <span className="text-sm font-medium">
                    {student.firstName} {student.lastName}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Seating Layout */}
        <div className="border border-gray-300 rounded-lg bg-white min-h-96">
          {renderLayout()}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          💡 <strong>How to use:</strong> Drag students from the bank above and drop them onto seats. 
          Click the × on any occupied seat to remove a student.
        </div>
      </div>
    </Card>
  );
};

// ===============================================
// MAIN TOOLKIT TAB COMPONENT
// ===============================================

/**
 * Complete Teacher Toolkit using smaller utility components
 */
export const ToolkitTab = ({ userId, classId }) => {
  const { students, loading } = useStudents(userId, classId);
  const [activetool, setActiveTool] = useState('timer');

  const tools = [
    { id: 'timer', name: 'Timer', icon: '⏰', description: 'Classroom timing tool' },
    { id: 'picker', name: 'Student Picker', icon: '🎲', description: 'Random student selection' },
    { id: 'seating', name: 'Seating Chart', icon: '💺', description: 'Arrange classroom seating' },
    { id: 'noise', name: 'Noise Meter', icon: '📢', description: 'Monitor classroom volume' },
    { id: 'groups', name: 'Group Maker', icon: '👥', description: 'Create random groups' },
    { id: 'rewards', name: 'Reward Wheel', icon: '🎪', description: 'Spin for rewards' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'timer':
        return <ClassroomTimer />;
      case 'picker':
        return <StudentPicker students={students} />;
      case 'seating':
        return <SeatingChart students={students} />;
      default:
        return (
          <Card title="Tool Coming Soon">
            <EmptyState
              icon="🚧"
              title="Under Development"
              description={`The ${tools.find(t => t.id === activeTool)?.name} tool is coming soon!`}
            />
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Teacher's Toolkit 🛠️
        </h1>
        <p className="text-gray-600 mt-2">
          Essential tools for classroom management and engagement
        </p>
      </div>

      {/* Tool Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`
              p-4 rounded-lg border-2 transition-all text-center
              ${activeTool === tool.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700 transform scale-105' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-2xl mb-2">{tool.icon}</div>
            <div className="font-semibold text-sm">{tool.name}</div>
            <div className="text-xs text-gray-600 mt-1">{tool.description}</div>
          </button>
        ))}
      </div>

      {/* Active Tool Display */}
      {renderActiveTool()}
    </div>
  );
};

// Export all components
export {
  ClassroomTimer,
  StudentPicker,
  SeatingChart,
  ToolkitTab
};