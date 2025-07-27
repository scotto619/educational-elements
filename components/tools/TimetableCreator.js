// components/tools/TimetableCreator.js - Interactive Timetable Creator with Reminders
import React, { useState, useEffect } from 'react';

// ===============================================
// TIMETABLE CREATOR COMPONENT
// ===============================================

const TimetableCreator = ({ 
  students = [], 
  showToast = () => {},
  onSaveData = () => {} // Function to save timetable data
}) => {
  // State management
  const [timetable, setTimetable] = useState({});
  const [timeSlots, setTimeSlots] = useState([
    { id: 'slot1', start: '09:00', end: '09:50', label: 'Period 1' },
    { id: 'slot2', start: '09:50', end: '10:40', label: 'Period 2' },
    { id: 'slot3', start: '10:40', end: '11:00', label: 'Morning Tea' },
    { id: 'slot4', start: '11:00', end: '11:50', label: 'Period 3' },
    { id: 'slot5', start: '11:50', end: '12:40', label: 'Period 4' },
    { id: 'slot6', start: '12:40', end: '13:20', label: 'Lunch' },
    { id: 'slot7', start: '13:20', end: '14:10', label: 'Period 5' },
    { id: 'slot8', start: '14:10', end: '15:00', label: 'Period 6' }
  ]);
  
  const [subjects, setSubjects] = useState([
    { id: 'math', name: 'Mathematics', color: 'bg-blue-500', icon: '🧮' },
    { id: 'english', name: 'English', color: 'bg-green-500', icon: '📚' },
    { id: 'science', name: 'Science', color: 'bg-purple-500', icon: '🔬' },
    { id: 'history', name: 'History', color: 'bg-yellow-500', icon: '🏛️' },
    { id: 'pe', name: 'Physical Education', color: 'bg-red-500', icon: '⚽' },
    { id: 'art', name: 'Art', color: 'bg-pink-500', icon: '🎨' },
    { id: 'music', name: 'Music', color: 'bg-indigo-500', icon: '🎵' },
    { id: 'break', name: 'Break', color: 'bg-gray-400', icon: '☕' },
    { id: 'lunch', name: 'Lunch', color: 'bg-orange-500', icon: '🍎' }
  ]);

  const [teachers, setTeachers] = useState([
    { id: 'teacher1', name: 'Ms. Johnson', specialties: ['math', 'science'] },
    { id: 'teacher2', name: 'Mr. Smith', specialties: ['english', 'history'] },
    { id: 'teacher3', name: 'Mrs. Davis', specialties: ['art', 'music'] },
    { id: 'teacher4', name: 'Coach Wilson', specialties: ['pe'] }
  ]);

  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());
  
  // Modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Activity form state
  const [newActivity, setNewActivity] = useState({
    id: '',
    subject: '',
    teacher: '',
    students: [], // 'all' or array of student IDs
    location: '',
    notes: '',
    reminder: 0, // minutes before
    type: 'main' // 'main' or 'parallel'
  });

  // Days of the week
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Reminder system
  const [activeReminders, setActiveReminders] = useState([]);

  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================

  function getCurrentWeek() {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return startOfWeek.toISOString().split('T')[0];
  }

  function getTimetableKey(day, slotId) {
    return `${currentWeek}-${day}-${slotId}`;
  }

  function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // ===============================================
  // TIMETABLE MANAGEMENT FUNCTIONS
  // ===============================================

  const addActivityToSlot = () => {
    if (!newActivity.subject || !selectedDay || !selectedSlot) return;

    const key = getTimetableKey(selectedDay, selectedSlot.id);
    const activity = {
      ...newActivity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      day: selectedDay,
      slot: selectedSlot,
      createdAt: new Date().toISOString()
    };

    // Handle multiple activities in same slot
    const existingActivities = timetable[key] || [];
    const updatedActivities = [...existingActivities, activity];

    setTimetable({
      ...timetable,
      [key]: updatedActivities
    });

    // Set up reminder if specified
    if (activity.reminder > 0) {
      setupReminder(activity);
    }

    // Reset form
    setNewActivity({
      id: '',
      subject: '',
      teacher: '',
      students: [],
      location: '',
      notes: '',
      reminder: 0,
      type: 'main'
    });
    setShowActivityModal(false);
  };

  const removeActivity = (day, slotId, activityId) => {
    const key = getTimetableKey(day, slotId);
    const activities = timetable[key] || [];
    const updatedActivities = activities.filter(activity => activity.id !== activityId);
    
    if (updatedActivities.length === 0) {
      const { [key]: removed, ...remainingTimetable } = timetable;
      setTimetable(remainingTimetable);
    } else {
      setTimetable({
        ...timetable,
        [key]: updatedActivities
      });
    }

    // Remove any associated reminders
    setActiveReminders(prev => prev.filter(reminder => reminder.activityId !== activityId));
  };

  const openActivityModal = (day, slot) => {
    setSelectedDay(day);
    setSelectedSlot(slot);
    setNewActivity({
      id: '',
      subject: '',
      teacher: '',
      students: [],
      location: '',
      notes: '',
      reminder: 0,
      type: 'main'
    });
    setShowActivityModal(true);
  };

  // ===============================================
  // REMINDER SYSTEM
  // ===============================================

  const setupReminder = (activity) => {
    const now = new Date();
    const activityDate = new Date(currentWeek);
    const dayIndex = DAYS.indexOf(activity.day);
    activityDate.setDate(activityDate.getDate() + dayIndex);
    
    const [hours, minutes] = activity.slot.start.split(':').map(Number);
    activityDate.setHours(hours, minutes, 0, 0);
    
    const reminderTime = new Date(activityDate.getTime() - (activity.reminder * 60 * 1000));
    
    if (reminderTime > now) {
      const timeoutId = setTimeout(() => {
        showReminderNotification(activity);
        setActiveReminders(prev => prev.filter(r => r.id !== `reminder_${activity.id}`));
      }, reminderTime.getTime() - now.getTime());

      setActiveReminders(prev => [...prev, {
        id: `reminder_${activity.id}`,
        activityId: activity.id,
        timeoutId,
        activity,
        reminderTime
      }]);
    }
  };

  const showReminderNotification = (activity) => {
    // Create a visual reminder notification
    const reminderDiv = document.createElement('div');
    reminderDiv.className = 'fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    reminderDiv.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">⏰</div>
        <div>
          <div class="font-bold">Upcoming Activity!</div>
          <div class="text-sm">${activity.subject} in ${activity.reminder} minutes</div>
          <div class="text-xs opacity-90">${activity.slot.start} - ${activity.slot.end}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(reminderDiv);
    
    // Play reminder sound
    try {
      const audio = new Audio('/sounds/reminder.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback beep if no audio file
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.3;
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      });
    } catch (e) {
      console.log('Audio not available');
    }

    // Remove notification after 5 seconds
    setTimeout(() => {
      if (document.body.contains(reminderDiv)) {
        document.body.removeChild(reminderDiv);
      }
    }, 5000);
  };

  // ===============================================
  // SUBJECT AND TEACHER MANAGEMENT
  // ===============================================

  const addSubject = (subjectData) => {
    const subject = {
      id: `subject_${Date.now()}`,
      ...subjectData
    };
    setSubjects([...subjects, subject]);
    setShowSubjectModal(false);
  };

  const addTeacher = (teacherData) => {
    const teacher = {
      id: `teacher_${Date.now()}`,
      ...teacherData
    };
    setTeachers([...teachers, teacher]);
    setShowTeacherModal(false);
  };

  // ===============================================
  // RENDER FUNCTIONS
  // ===============================================

  const getSubjectById = (id) => subjects.find(s => s.id === id);
  const getTeacherById = (id) => teachers.find(t => t.id === id);

  const renderActivityCard = (activity, isParallel = false) => {
    const subject = getSubjectById(activity.subject);
    const teacher = getTeacherById(activity.teacher);
    
    return (
      <div 
        key={activity.id}
        className={`${subject?.color || 'bg-gray-500'} text-white p-2 rounded-lg mb-1 text-xs relative ${
          isParallel ? 'opacity-80 border-2 border-white border-dashed' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-1">
            <span>{subject?.icon}</span>
            <span className="font-semibold truncate">{subject?.name}</span>
          </div>
          <button
            onClick={() => removeActivity(activity.day, activity.slot.id, activity.id)}
            className="text-white hover:text-red-200 text-xs"
          >
            ✕
          </button>
        </div>
        
        {teacher && (
          <div className="text-xs opacity-90 mb-1">👩‍🏫 {teacher.name}</div>
        )}
        
        {activity.students.length > 0 && activity.students[0] !== 'all' && (
          <div className="text-xs opacity-90 mb-1">
            👥 {activity.students.length} student{activity.students.length !== 1 ? 's' : ''}
          </div>
        )}
        
        {activity.location && (
          <div className="text-xs opacity-90 mb-1">📍 {activity.location}</div>
        )}
        
        {activity.reminder > 0 && (
          <div className="text-xs opacity-90">⏰ {activity.reminder}min reminder</div>
        )}
        
        {isParallel && (
          <div className="absolute top-1 right-6 text-xs bg-white bg-opacity-20 px-1 rounded">
            Parallel
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">📅 Timetable Creator</h2>
            <p className="text-indigo-100">Create and manage your weekly class schedule</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-200">Week Starting</div>
            <div className="text-xl font-bold">{new Date(currentWeek).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <button
              onClick={() => setShowSubjectModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              ➕ Add Subject
            </button>
            
            <button
              onClick={() => setShowTeacherModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              👩‍🏫 Add Teacher
            </button>
            
            <button
              onClick={() => setShowTimeSlotModal(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              ⏰ Edit Time Slots
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Active Reminders:</span> {activeReminders.length}
            </div>
            
            <button
              onClick={() => onSaveData(timetable)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              💾 Save Timetable
            </button>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-xl p-6 shadow-lg overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="font-bold text-gray-800 p-3 text-center">Time</div>
            {DAYS.map(day => (
              <div key={day} className="font-bold text-gray-800 p-3 text-center bg-gray-50 rounded-lg">
                {day}
              </div>
            ))}
          </div>

          {/* Time Slot Rows */}
          {timeSlots.map(slot => (
            <div key={slot.id} className="grid grid-cols-6 gap-2 mb-2">
              {/* Time Column */}
              <div className="bg-gray-100 p-3 rounded-lg text-center">
                <div className="font-semibold text-sm">{slot.label}</div>
                <div className="text-xs text-gray-600">{slot.start} - {slot.end}</div>
              </div>

              {/* Day Columns */}
              {DAYS.map(day => {
                const key = getTimetableKey(day, slot.id);
                const activities = timetable[key] || [];
                const mainActivities = activities.filter(a => a.type === 'main');
                const parallelActivities = activities.filter(a => a.type === 'parallel');

                return (
                  <div
                    key={day}
                    className="bg-gray-50 p-2 rounded-lg min-h-[80px] border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => openActivityModal(day, slot)}
                    title={`Add activity to ${day} ${slot.label}`}
                  >
                    {/* Main Activities */}
                    {mainActivities.map(activity => renderActivityCard(activity, false))}
                    
                    {/* Parallel Activities */}
                    {parallelActivities.map(activity => renderActivityCard(activity, true))}
                    
                    {activities.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        Click to add activity
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Subject Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded ${subject.color}`}></div>
              <span className="text-sm">{subject.icon} {subject.name}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-dashed rounded"></div>
              <span>Parallel Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>⏰</span>
              <span>Has Reminder</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👩‍🏫</span>
              <span>Specialist Teacher</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>👥</span>
              <span>Specific Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">
                ➕ Add Activity - {selectedDay} {selectedSlot?.label}
              </h2>
              <p className="text-indigo-100">{selectedSlot?.start} - {selectedSlot?.end}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={newActivity.subject}
                    onChange={(e) => setNewActivity({...newActivity, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select subject...</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.icon} {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                  <select
                    value={newActivity.teacher}
                    onChange={(e) => setNewActivity({...newActivity, teacher: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">No specialist teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Students</label>
                <select
                  value={newActivity.students.length === 0 ? 'all' : 'specific'}
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setNewActivity({...newActivity, students: []});
                    } else {
                      setNewActivity({...newActivity, students: []});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                >
                  <option value="all">Whole Class</option>
                  <option value="specific">Specific Students</option>
                </select>

                {newActivity.students.length === 0 && (
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    <div className="text-sm text-gray-600 mb-2">Select students for this activity:</div>
                    {students.map(student => (
                      <label key={student.id} className="flex items-center space-x-2 mb-1">
                        <input
                          type="checkbox"
                          checked={newActivity.students.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewActivity({
                                ...newActivity,
                                students: [...newActivity.students, student.id]
                              });
                            } else {
                              setNewActivity({
                                ...newActivity,
                                students: newActivity.students.filter(id => id !== student.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{student.firstName} {student.lastName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newActivity.location}
                    onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Library, Gym, Room 12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({...newActivity, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="main">Main Activity</option>
                    <option value="parallel">Parallel Activity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder (minutes before)</label>
                <select
                  value={newActivity.reminder}
                  onChange={(e) => setNewActivity({...newActivity, reminder: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={0}>No reminder</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({...newActivity, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Additional notes about this activity..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addActivityToSlot}
                disabled={!newActivity.subject}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">➕ Add Subject</h2>
            </div>
            
            <div className="p-6">
              <SubjectForm onSubmit={addSubject} onCancel={() => setShowSubjectModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">👩‍🏫 Add Teacher</h2>
            </div>
            
            <div className="p-6">
              <TeacherForm 
                subjects={subjects}
                onSubmit={addTeacher} 
                onCancel={() => setShowTeacherModal(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================================
// SUBJECT FORM COMPONENT
// ===============================================

const SubjectForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    color: 'bg-blue-500',
    icon: '📚'
  });

  const COLORS = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500',
    'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500',
    'bg-orange-500', 'bg-gray-500'
  ];

  const ICONS = [
    '📚', '🧮', '🔬', '🎨', '🎵', '⚽', '🏛️', '🌍', '💻', '🎭',
    '📝', '🔍', '🎯', '🏆', '💡', '⭐'
  ];

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Mathematics"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => setFormData({...formData, color})}
              className={`w-8 h-8 rounded-full ${color} ${
                formData.color === color ? 'ring-4 ring-gray-400' : ''
              }`}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(icon => (
            <button
              key={icon}
              onClick={() => setFormData({...formData, icon})}
              className={`p-2 text-xl rounded-lg border-2 ${
                formData.icon === icon ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim()}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          Add Subject
        </button>
      </div>
    </div>
  );
};

// ===============================================
// TEACHER FORM COMPONENT
// ===============================================

const TeacherForm = ({ subjects, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    specialties: []
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  const toggleSpecialty = (subjectId) => {
    if (formData.specialties.includes(subjectId)) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(id => id !== subjectId)
      });
    } else {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, subjectId]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Teacher Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="e.g., Ms. Johnson"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {subjects.map(subject => (
            <label key={subject.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.specialties.includes(subject.id)}
                onChange={() => toggleSpecialty(subject.id)}
                className="rounded"
              />
              <span className="text-sm">{subject.icon} {subject.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim()}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          Add Teacher
        </button>
      </div>
    </div>
  );
};

export default TimetableCreator;