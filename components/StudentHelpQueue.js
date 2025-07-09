// StudentHelpQueue.js - Integrated Help Queue Tool for Classroom Champions
import React, { useState, useEffect, useRef } from 'react';

const StudentHelpQueue = ({ students, showToast }) => {
  const [helpQueue, setHelpQueue] = useState([]);
  const [currentlyHelping, setCurrentlyHelping] = useState(null);
  const [nextTicketNumber, setNextTicketNumber] = useState(1);
  const [completedToday, setCompletedToday] = useState([]);
  const [readyStudents, setReadyStudents] = useState(new Set());
  const audioContextRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  // Sound effects
  const playDingSound = () => {
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const playSuccessSound = () => {
    try {
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  // Functions
  const markStudentReady = (student) => {
    setReadyStudents(prev => new Set([...prev, student.id]));
    showToast(`${student.firstName} marked as ready for help!`);
  };

  const unmarkStudentReady = (student) => {
    setReadyStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(student.id);
      return newSet;
    });
    showToast(`${student.firstName} removed from ready status.`);
  };

  const addToQueue = (student) => {
    const queueItem = {
      id: student.id,
      name: student.firstName,
      avatar: student.avatar,
      ticketNumber: nextTicketNumber,
      timestamp: new Date().toISOString(),
      priority: 'normal'
    };
    
    setHelpQueue(prev => [...prev, queueItem]);
    setNextTicketNumber(prev => prev + 1);
    setReadyStudents(prev => {
      const newSet = new Set(prev);
      newSet.delete(student.id);
      return newSet;
    });
    
    playDingSound();
    showToast(`${student.firstName} added to help queue with ticket #${nextTicketNumber}`);
  };

  const removeFromQueue = (ticketNumber) => {
    setHelpQueue(prev => prev.filter(item => item.ticketNumber !== ticketNumber));
    showToast('Student removed from queue.');
  };

  const startHelping = () => {
    if (helpQueue.length === 0) return;
    
    const nextStudent = helpQueue[0];
    setCurrentlyHelping(nextStudent);
    setHelpQueue(prev => prev.slice(1));
    
    playDingSound();
    showToast(`Now helping ${nextStudent.name} (Ticket #${nextStudent.ticketNumber})`);
  };

  const finishHelping = () => {
    if (!currentlyHelping) return;
    
    const completedItem = {
      ...currentlyHelping,
      completedAt: new Date().toISOString(),
      helpDuration: Math.floor((new Date() - new Date(currentlyHelping.timestamp)) / 1000)
    };
    
    setCompletedToday(prev => [...prev, completedItem]);
    setCurrentlyHelping(null);
    
    playSuccessSound();
    showToast(`Finished helping ${completedItem.name}! 🎉`);
  };

  const resetQueue = () => {
    setHelpQueue([]);
    setCurrentlyHelping(null);
    setNextTicketNumber(1);
    setCompletedToday([]);
    setReadyStudents(new Set());
    showToast('Help queue reset successfully!');
  };

  const getStudentStatus = (student) => {
    if (currentlyHelping && currentlyHelping.id === student.id) {
      return 'being-helped';
    }
    if (helpQueue.some(item => item.id === student.id)) {
      return 'in-queue';
    }
    if (readyStudents.has(student.id)) {
      return 'ready';
    }
    if (completedToday.some(item => item.id === student.id)) {
      return 'completed';
    }
    return 'available';
  };

  const getWaitTime = (ticketNumber) => {
    const position = helpQueue.findIndex(item => item.ticketNumber === ticketNumber);
    return position === -1 ? 0 : position + 1;
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-600">
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
        <p className="text-gray-600">Manage student assistance requests efficiently</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{readyStudents.size}</div>
            <div className="text-sm text-blue-700">Ready for Help</div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{helpQueue.length}</div>
            <div className="text-sm text-orange-700">In Queue</div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentlyHelping ? 1 : 0}</div>
            <div className="text-sm text-green-700">Being Helped</div>
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{completedToday.length}</div>
            <div className="text-sm text-purple-700">Completed Today</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Roster */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">👥</span>
              Class Roster
            </h3>
            <button
              onClick={resetQueue}
              className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm font-semibold"
            >
              Reset All
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {students.map(student => {
              const status = getStudentStatus(student);
              const queueItem = helpQueue.find(item => item.id === student.id);
              
              return (
                <div
                  key={student.id}
                  className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                    status === 'being-helped' 
                      ? 'bg-green-100 border-green-300' 
                      : status === 'in-queue' 
                      ? 'bg-orange-100 border-orange-300' 
                      : status === 'ready' 
                      ? 'bg-blue-100 border-blue-300' 
                      : status === 'completed' 
                      ? 'bg-purple-100 border-purple-300' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {student.avatar && (
                        <img 
                          src={student.avatar} 
                          alt={student.firstName} 
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                        />
                      )}
                      <div>
                        <span className="font-semibold text-gray-800">{student.firstName}</span>
                        {queueItem && (
                          <span className="ml-2 text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                            #{queueItem.ticketNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {status === 'available' && (
                        <button
                          onClick={() => markStudentReady(student)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                          Ready
                        </button>
                      )}
                      {status === 'ready' && (
                        <>
                          <button
                            onClick={() => addToQueue(student)}
                            className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                          >
                            Add to Queue
                          </button>
                          <button
                            onClick={() => unmarkStudentReady(student)}
                            className="bg-gray-600 text-white px-2 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            ×
                          </button>
                        </>
                      )}
                      {status === 'in-queue' && (
                        <button
                          onClick={() => removeFromQueue(queueItem.ticketNumber)}
                          className="bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          ×
                        </button>
                      )}
                      {status === 'being-helped' && (
                        <span className="text-green-600 font-semibold text-sm">Being Helped</span>
                      )}
                      {status === 'completed' && (
                        <span className="text-purple-600 font-semibold text-sm">✓ Done</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Help Queue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">⏳</span>
              Waiting Queue
            </h3>
            <span className="text-sm text-gray-600">
              Next: #{nextTicketNumber}
            </span>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {helpQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
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
                      <span className="text-xs text-gray-600">
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
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      <span className="text-2xl font-bold text-green-600">#{currentlyHelping.ticketNumber}</span>
                      {currentlyHelping.avatar && (
                        <img 
                          src={currentlyHelping.avatar} 
                          alt={currentlyHelping.name} 
                          className="w-12 h-12 rounded-full border-2 border-green-300"
                        />
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-green-800">{currentlyHelping.name}</h4>
                    <p className="text-sm text-green-600 mt-2">
                      Started: {new Date(currentlyHelping.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={finishHelping}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
                  >
                    ✓ Finish Helping
                  </button>
                </div>
              ) : (
                <div className="py-8 text-gray-500">
                  <div className="text-4xl mb-2">💤</div>
                  <p className="italic">No one being helped</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">✅</span>
              Completed Today
            </h3>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {completedToday.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="italic text-sm">No students helped yet</p>
                </div>
              ) : (
                completedToday.map((item) => (
                  <div
                    key={`completed-${item.ticketNumber}`}
                    className="p-3 rounded-lg bg-purple-50 border border-purple-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-purple-600">#{item.ticketNumber}</span>
                        {item.avatar && (
                          <img 
                            src={item.avatar} 
                            alt={item.name} 
                            className="w-6 h-6 rounded-full border border-purple-300"
                          />
                        )}
                        <span className="font-semibold text-gray-800">{item.name}</span>
                      </div>
                      <span className="text-xs text-purple-600">
                        {new Date(item.completedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHelpQueue;