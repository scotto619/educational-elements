// StudentHelpQueue.js - Student Help Queue — Redesigned for teachers
import React, { useState, useRef, useEffect, useCallback } from 'react';

const HELP_CATEGORIES = [
  { id: 'stuck', label: 'Stuck', icon: '🤔', color: 'orange' },
  { id: 'check', label: 'Check Work', icon: '✅', color: 'blue' },
  { id: 'question', label: 'Question', icon: '❓', color: 'purple' },
  { id: 'urgent', label: 'Urgent', icon: '🚨', color: 'red' },
  { id: 'other', label: 'Other', icon: '📌', color: 'gray' },
];

const CATEGORY_STYLES = {
  stuck:    { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', pill: 'bg-orange-100 text-orange-700' },
  check:    { bg: 'bg-blue-50',   border: 'border-blue-300',   text: 'text-blue-700',   pill: 'bg-blue-100 text-blue-700' },
  question: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', pill: 'bg-purple-100 text-purple-700' },
  urgent:   { bg: 'bg-red-50',    border: 'border-red-300',    text: 'text-red-700',    pill: 'bg-red-100 text-red-700' },
  other:    { bg: 'bg-gray-50',   border: 'border-gray-300',   text: 'text-gray-700',   pill: 'bg-gray-100 text-gray-700' },
};

// Elapsed timer display component
const ElapsedTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const color = elapsed > 300 ? 'text-red-600' : elapsed > 120 ? 'text-orange-600' : 'text-green-600';

  return (
    <span className={`font-mono font-bold ${color}`}>
      {mins}:{secs.toString().padStart(2, '0')}
    </span>
  );
};

const StudentHelpQueue = ({ students, showToast, getAvatarImage, calculateAvatarLevel }) => {
  const [helpQueue, setHelpQueue] = useState([]);
  const [currentlyHelping, setCurrentlyHelping] = useState(null);
  const [helpHistory, setHelpHistory] = useState([]);
  const [ticketCounter, setTicketCounter] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [addModalStudent, setAddModalStudent] = useState(null); // Student being added — shows category picker
  const [searchQuery, setSearchQuery] = useState('');

  // Audio notification
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkeBz2V4PS8cSQLKoHOvs2IXt8TZLaKl8TXTFANTrro9bGJ');
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  // Resolve avatar path safely
  const resolveAvatar = useCallback((student) => {
    if (getAvatarImage && calculateAvatarLevel) {
      return getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints || 0));
    }
    // Fallback: build the path manually
    const base = student.avatarBase || 'Wizard F';
    const xp = student.totalPoints || 0;
    const level = xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1;
    return `/Avatars/${base}/Level ${level}.png`;
  }, [getAvatarImage, calculateAvatarLevel]);

  // --- Queue actions ---

  const addToHelpQueue = (student, category = 'other') => {
    if (helpQueue.find(item => item.studentId === student.id)) {
      showToast(`${student.firstName} is already in the queue!`);
      return;
    }

    const queueItem = {
      studentId: student.id,
      name: student.firstName,
      lastName: student.lastName || '',
      avatarPath: resolveAvatar(student),
      ticketNumber: ticketCounter,
      category,
      timeAdded: new Date().toISOString(),
    };

    setHelpQueue(prev => {
      // Urgent items go to the top (but after other urgents)
      if (category === 'urgent') {
        const urgentEnd = prev.filter(i => i.category === 'urgent').length;
        return [...prev.slice(0, urgentEnd), queueItem, ...prev.slice(urgentEnd)];
      }
      return [...prev, queueItem];
    });
    setTicketCounter(prev => prev + 1);
    setAddModalStudent(null);

    showToast(`${student.firstName} added to help queue!`);
    playNotificationSound();
  };

  const removeFromQueue = (ticketNumber) => {
    const item = helpQueue.find(i => i.ticketNumber === ticketNumber);
    setHelpQueue(prev => prev.filter(i => i.ticketNumber !== ticketNumber));
    if (item) showToast(`${item.name} removed from queue`);
  };

  const moveUp = (index) => {
    if (index <= 0) return;
    setHelpQueue(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index) => {
    setHelpQueue(prev => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const startHelping = () => {
    if (helpQueue.length === 0) return;
    // If already helping someone, auto-complete them first
    if (currentlyHelping) {
      completeHelp(true);
    }
    const nextStudent = helpQueue[0];
    setCurrentlyHelping({
      ...nextStudent,
      startTime: new Date().toISOString(),
    });
    setHelpQueue(prev => prev.slice(1));
    showToast(`Now helping ${nextStudent.name}!`);
  };

  const skipCurrent = () => {
    if (!currentlyHelping) return;
    // Put them back at end of queue
    setHelpQueue(prev => [...prev, { ...currentlyHelping, timeAdded: new Date().toISOString() }]);
    showToast(`${currentlyHelping.name} sent back to queue`);
    setCurrentlyHelping(null);
  };

  const completeHelp = (silent = false) => {
    if (!currentlyHelping) return;
    const completedHelp = {
      ...currentlyHelping,
      endTime: new Date().toISOString(),
      duration: Math.round((Date.now() - new Date(currentlyHelping.startTime).getTime()) / 1000),
    };
    setHelpHistory(prev => [completedHelp, ...prev]);
    setCurrentlyHelping(null);
    if (!silent) showToast(`Finished helping ${completedHelp.name}!`);
  };

  const clearAll = () => {
    if (!confirm('Clear all queue data? This cannot be undone.')) return;
    setHelpQueue([]);
    setCurrentlyHelping(null);
    setHelpHistory([]);
    setTicketCounter(1);
    showToast('All queues cleared!');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter students for add modal
  const filteredStudents = searchQuery
    ? students.filter(s => `${s.firstName} ${s.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : students;

  const isStudentBusy = (studentId) =>
    helpQueue.some(i => i.studentId === studentId) || currentlyHelping?.studentId === studentId;

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎓</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Students Available</h2>
        <p className="text-gray-700">Add students to your class to use the Help Queue.</p>
      </div>
    );
  }

  // ===============================================
  // RENDER
  // ===============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 md:p-8 shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <span className="text-3xl">🙋</span> Help Queue
            </h2>
            <p className="text-white/80 mt-1 text-sm md:text-base">Click a student to add them to the queue</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold">
              {helpQueue.length} waiting
            </span>
            {currentlyHelping && (
              <span className="bg-green-400/30 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                🟢 Helping 1
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl md:text-3xl font-bold text-blue-600">{helpQueue.length}</div>
          <div className="text-xs md:text-sm font-medium text-gray-600">Waiting</div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl md:text-3xl font-bold text-green-600">{currentlyHelping ? 1 : 0}</div>
          <div className="text-xs md:text-sm font-medium text-gray-600">Helping</div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-600">{helpHistory.length}</div>
          <div className="text-xs md:text-sm font-medium text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm text-center">
          <div className="text-2xl md:text-3xl font-bold text-gray-600">
            {helpHistory.length > 0
              ? formatDuration(Math.round(helpHistory.reduce((a, h) => a + h.duration, 0) / helpHistory.length))
              : '—'}
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-600">Avg Time</div>
        </div>
      </div>

      {/* Currently Helping Banner */}
      {currentlyHelping && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={currentlyHelping.avatarPath}
                  alt={currentlyHelping.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full border-3 border-green-400 shadow-md object-cover bg-gray-100"
                  onError={(e) => { e.target.src = '/Avatars/Wizard F/Level 1.png'; }}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Now Helping</div>
                <div className="text-lg md:text-xl font-bold text-gray-800">{currentlyHelping.name} {currentlyHelping.lastName}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {(() => {
                    const cat = HELP_CATEGORIES.find(c => c.id === currentlyHelping.category);
                    const style = CATEGORY_STYLES[currentlyHelping.category] || CATEGORY_STYLES.other;
                    return cat ? (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.pill}`}>
                        {cat.icon} {cat.label}
                      </span>
                    ) : null;
                  })()}
                  <span className="text-xs text-gray-500">•</span>
                  <ElapsedTimer startTime={currentlyHelping.startTime} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={skipCurrent}
                className="px-4 py-2 bg-white border-2 border-orange-300 text-orange-600 rounded-xl font-semibold text-sm hover:bg-orange-50 transition-all"
              >
                ↩️ Send Back
              </button>
              <button
                onClick={() => completeHelp()}
                className="px-5 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all shadow-sm active:scale-95"
              >
                ✅ Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Student Roster (tap to add) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>👥</span> Students
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">{students.length} total</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students..."
              className="w-full px-4 py-2.5 pl-9 border border-gray-200 rounded-xl text-sm focus:border-blue-400 focus:outline-none transition-colors bg-gray-50 focus:bg-white"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
            )}
          </div>

          {/* Student grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
            {filteredStudents.map((student) => {
              const busy = isStudentBusy(student.id);
              const inQueue = helpQueue.find(i => i.studentId === student.id);
              const isHelping = currentlyHelping?.studentId === student.id;

              return (
                <button
                  key={student.id}
                  onClick={() => !busy && setAddModalStudent(student)}
                  disabled={busy}
                  className={`relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 ${
                    isHelping
                      ? 'border-green-400 bg-green-50 ring-2 ring-green-200'
                      : inQueue
                        ? 'border-orange-300 bg-orange-50 opacity-75 cursor-default'
                        : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-md hover:scale-[1.02] active:scale-95'
                  } disabled:cursor-not-allowed`}
                >
                  <img
                    src={resolveAvatar(student)}
                    alt={student.firstName}
                    className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover bg-gray-100 mb-1.5"
                    onError={(e) => { e.target.src = '/Avatars/Wizard F/Level 1.png'; }}
                  />
                  <span className="text-xs font-semibold text-gray-800 truncate w-full text-center">{student.firstName}</span>
                  {inQueue && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {helpQueue.findIndex(i => i.studentId === student.id) + 1}
                    </span>
                  )}
                  {isHelping && (
                    <span className="absolute top-1 right-1 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">NOW</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Queue + History */}
        <div className="lg:col-span-3 space-y-5">
          {/* Queue */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span>📋</span> Queue
                {helpQueue.length > 0 && (
                  <span className="ml-1 bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">{helpQueue.length}</span>
                )}
              </h3>
              <div className="flex gap-2">
                {helpQueue.length > 0 && (
                  <button
                    onClick={startHelping}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                  >
                    ▶️ Help Next
                  </button>
                )}
              </div>
            </div>

            {helpQueue.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <div className="text-5xl mb-3 opacity-40">📝</div>
                <p className="font-medium">Queue is empty</p>
                <p className="text-sm mt-1">Tap a student on the left to add them</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {helpQueue.map((item, index) => {
                  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.other;
                  const cat = HELP_CATEGORIES.find(c => c.id === item.category);

                  return (
                    <div
                      key={item.ticketNumber}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${style.bg} ${style.border} ${
                        index === 0 ? 'ring-2 ring-blue-200 shadow-sm' : ''
                      }`}
                    >
                      {/* Position */}
                      <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                        <button
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                        >▲</button>
                        <span className="text-sm font-bold text-gray-500 w-6 text-center">{index + 1}</span>
                        <button
                          onClick={() => moveDown(index)}
                          disabled={index === helpQueue.length - 1}
                          className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none"
                        >▼</button>
                      </div>

                      {/* Avatar */}
                      <img
                        src={item.avatarPath}
                        alt={item.name}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-gray-100 flex-shrink-0"
                        onError={(e) => { e.target.src = '/Avatars/Wizard F/Level 1.png'; }}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 text-sm truncate">{item.name} {item.lastName}</span>
                          {index === 0 && <span className="text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">NEXT</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${style.pill}`}>
                            {cat?.icon} {cat?.label}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            <ElapsedTimer startTime={item.timeAdded} /> waiting
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {index === 0 && (
                          <button
                            onClick={startHelping}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
                          >Help</button>
                        )}
                        <button
                          onClick={() => removeFromQueue(item.ticketNumber)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 transition-all text-sm"
                        >×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* History & Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1.5"
              >
                <span>{showHistory ? '▼' : '▶'}</span>
                ✅ Completed Today ({helpHistory.length})
              </button>
              <button
                onClick={clearAll}
                className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Clear All
              </button>
            </div>

            {showHistory && (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {helpHistory.length === 0 ? (
                  <p className="text-center py-6 text-gray-400 text-sm italic">No completed sessions yet</p>
                ) : (
                  helpHistory.map((item, index) => {
                    const cat = HELP_CATEGORIES.find(c => c.id === item.category);
                    return (
                      <div key={index} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                        <img
                          src={item.avatarPath}
                          alt={item.name}
                          className="w-8 h-8 rounded-full border border-gray-200 object-cover bg-gray-100"
                          onError={(e) => { e.target.src = '/Avatars/Wizard F/Level 1.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-sm text-gray-800 truncate block">{item.name} {item.lastName}</span>
                          <span className="text-[11px] text-gray-400">{cat?.icon} {cat?.label}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {formatDuration(item.duration)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* ADD TO QUEUE MODAL — Category Picker */}
      {/* ============================================= */}
      {addModalStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAddModalStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setAddModalStudent(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all text-lg"
            >×</button>

            <div className="text-center mb-5">
              <img
                src={resolveAvatar(addModalStudent)}
                alt={addModalStudent.firstName}
                className="w-16 h-16 rounded-full border-3 border-blue-300 mx-auto mb-3 object-cover bg-gray-100 shadow-md"
                onError={(e) => { e.target.src = '/Avatars/Wizard F/Level 1.png'; }}
              />
              <h3 className="text-lg font-bold text-gray-800">{addModalStudent.firstName} {addModalStudent.lastName || ''}</h3>
              <p className="text-sm text-gray-500 mt-0.5">What do they need help with?</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {HELP_CATEGORIES.map(cat => {
                const style = CATEGORY_STYLES[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => addToHelpQueue(addModalStudent, cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all hover:shadow-md active:scale-[0.98] ${style.bg} ${style.border}`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className={`font-semibold ${style.text}`}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHelpQueue;