// StudentHelpQueue.js - Student Assistance Request Management System (FIXED CONTRAST)
import React, { useState, useRef, useEffect } from 'react';

const StudentHelpQueue = ({ students, showToast }) => {
  const [helpQueue, setHelpQueue] = useState([]);
  const [currentlyHelping, setCurrentlyHelping] = useState(null);
  const [readyStudents, setReadyStudents] = useState(new Set());
  const [helpHistory, setHelpHistory] = useState([]);
  const [ticketCounter, setTicketCounter] = useState(1);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortMode, setSortMode] = useState('queue'); // 'queue', 'alphabetical', 'priority'
  
  // Audio notification
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkeBz2V4PS8cSQLKoHOvs2IXt8TZLaKl8TXTFANTrro9bGJ');
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  // Add student to ready queue
  const addToReadyQueue = (student) => {
    if (readyStudents.has(student.id)) {
      setReadyStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(student.id);
        return newSet;
      });
      showToast(`${student.firstName} removed from ready queue`);
    } else {
      setReadyStudents(prev => new Set([...prev, student.id]));
      showToast(`${student.firstName} is ready for help!`);
      playNotificationSound();
    }
  };

  // Add student to help queue
  const addToHelpQueue = (student) => {
    if (helpQueue.find(item => item.studentId === student.id)) {
      showToast(`${student.firstName} is already in the queue!`);
      return;
    }

    const queueItem = {
      studentId: student.id,
      name: student.firstName,
      avatar: student.avatar,
      ticketNumber: ticketCounter,
      timeAdded: new Date(),
      priority: 'normal'
    };

    setHelpQueue(prev => [...prev, queueItem]);
    setTicketCounter(prev => prev + 1);
    
    // Remove from ready queue if they were there
    setReadyStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(student.id);
      return newSet;
    });

    showToast(`${student.firstName} added to help queue! Ticket #${ticketCounter}`);
    playNotificationSound();
  };

  // Remove student from queue
  const removeFromQueue = (ticketNumber) => {
    setHelpQueue(prev => prev.filter(item => item.ticketNumber !== ticketNumber));
    showToast('Student removed from queue');
  };

  // Start helping next student
  const startHelping = () => {
    if (helpQueue.length === 0) return;

    const nextStudent = helpQueue[0];
    setCurrentlyHelping({
      ...nextStudent,
      startTime: new Date()
    });
    
    setHelpQueue(prev => prev.slice(1));
    showToast(`Now helping ${nextStudent.name}!`);
  };

  // Complete helping current student
  const completeHelp = () => {
    if (!currentlyHelping) return;

    const completedHelp = {
      ...currentlyHelping,
      endTime: new Date(),
      duration: Math.round((new Date() - currentlyHelping.startTime) / 1000) // seconds
    };

    setHelpHistory(prev => [completedHelp, ...prev]);
    setCurrentlyHelping(null);
    showToast(`Finished helping ${completedHelp.name}!`);
    
    // Auto-start next if queue has students
    if (helpQueue.length > 0) {
      setTimeout(() => {
        startHelping();
      }, 1000);
    }
  };

  // Clear all queues
  const clearAll = () => {
    setHelpQueue([]);
    setCurrentlyHelping(null);
    setReadyStudents(new Set());
    setHelpHistory([]);
    setTicketCounter(1);
    showToast('All queues cleared!');
  };

  // Format time duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get queue position
  const getQueuePosition = (ticketNumber) => {
    const position = helpQueue.findIndex(item => item.ticketNumber === ticketNumber);
    return position === -1 ? 0 : position + 1;
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-700">
          Add students to your class or load a class to use the Help Queue system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🎫 Student Help Queue</h2>
        <p className="text-gray-700">Manage student assistance requests efficiently</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{readyStudents.size}</div>
            <div className="text-sm text-gray-800 font-semibold">Ready for Help</div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{helpQueue.length}</div>
            <div className="text-sm text-gray-800 font-semibold">In Queue</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentlyHelping ? 1 : 0}</div>
            <div className="text-sm text-gray-800 font-semibold">Currently Helping</div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{helpHistory.length}</div>
            <div className="text-sm text-gray-800 font-semibold">Completed Today</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-xl font-bold text-gray-800">Queue Management</h3>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              {showCompleted ? '👁️ Hide History' : '📜 Show History'}
            </button>
          </div>
        </div>

        {/* Student Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {students.map((student) => {
            const isReady = readyStudents.has(student.id);
            const isInQueue = helpQueue.find(item => item.studentId === student.id);
            const isCurrentlyHelping = currentlyHelping?.studentId === student.id;
            
            return (
              <div key={student.id} className="relative">
                <button
                  onClick={() => !isInQueue && !isCurrentlyHelping && addToReadyQueue(student)}
                  disabled={isInQueue || isCurrentlyHelping}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    isCurrentlyHelping
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : isInQueue
                        ? 'border-orange-500 bg-orange-100 text-orange-800'
                        : isReady
                          ? 'border-blue-500 bg-blue-100 text-blue-800'
                          : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    {student.avatar && (
                      <img
                        src={student.avatar}
                        alt={student.firstName}
                        className="w-12 h-12 rounded-full border-2 border-gray-300"
                      />
                    )}
                    <span className="font-semibold text-sm">{student.firstName}</span>
                    {isReady && <span className="text-xs font-bold">READY</span>}
                    {isInQueue && (
                      <span className="text-xs font-bold">
                        #{isInQueue.ticketNumber} (Pos: {getQueuePosition(isInQueue.ticketNumber)})
                      </span>
                    )}
                    {isCurrentlyHelping && <span className="text-xs font-bold">HELPING NOW</span>}
                  </div>
                </button>
                
                {/* Add to Queue Button */}
                {isReady && (
                  <button
                    onClick={() => addToHelpQueue(student)}
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Add to Queue
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Help Queue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Help Queue ({helpQueue.length})
          </h3>
          
          <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
            {helpQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <div className="text-4xl mb-2">📝</div>
                <p className="italic">No students in queue</p>
              </div>
            ) : (
              helpQueue.map((item, index) => (
                <div
                  key={item.ticketNumber}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    index === 0 
                      ? 'bg-yellow-100 border-yellow-300' 
                      : 'bg-orange-100 border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-orange-600">#{item.ticketNumber}</span>
                      {item.avatar && (
                        <img 
                          src={item.avatar} 
                          alt={item.name} 
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                        />
                      )}
                      <span className="font-semibold text-gray-800">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-700 font-semibold">
                        Position: {index + 1}
                      </span>
                      <button
                        onClick={() => removeFromQueue(item.ticketNumber)}
                        className="bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={startHelping}
              disabled={helpQueue.length === 0}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {helpQueue.length === 0 ? 'Queue Empty' : 'Start Helping Next Student'}
            </button>
          </div>
        </div>

        {/* Currently Helping & Completed */}
        <div className="space-y-6">
          {/* Currently Helping */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Currently Helping
            </h3>
            
            <div className="text-center">
              {currentlyHelping ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    {currentlyHelping.avatar && (
                      <img
                        src={currentlyHelping.avatar}
                        alt={currentlyHelping.name}
                        className="w-16 h-16 rounded-full border-2 border-green-500"
                      />
                    )}
                    <div>
                      <div className="text-xl font-bold text-gray-800">{currentlyHelping.name}</div>
                      <div className="text-sm text-gray-600">Ticket #{currentlyHelping.ticketNumber}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={completeHelp}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    ✅ Mark as Complete
                  </button>
                </div>
              ) : (
                <div className="py-8 text-gray-600">
                  <div className="text-4xl mb-2">👨‍🏫</div>
                  <p className="italic">No student currently being helped</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Today */}
          {showCompleted && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">✅</span>
                Completed Today ({helpHistory.length})
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {helpHistory.length === 0 ? (
                  <div className="text-center py-4 text-gray-600">
                    <p className="italic">No completed sessions today</p>
                  </div>
                ) : (
                  helpHistory.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        {item.avatar && (
                          <img src={item.avatar} alt={item.name} className="w-6 h-6 rounded-full" />
                        )}
                        <span className="font-semibold text-gray-800">{item.name}</span>
                      </div>
                      <span className="text-xs text-gray-700 font-semibold">
                        {formatDuration(item.duration)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHelpQueue;