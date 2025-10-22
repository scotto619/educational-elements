import React, { useState } from 'react';
import { Plus, Trash2, Upload, Download, Wand2, RefreshCw, Save } from 'lucide-react';

const SpecialistTimetable = ({ showNotification }) => {
  const generateDefaultPeriods = () => {
    const periods = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let id = 1;
    
    days.forEach(day => {
      const morning = [
        ['08:30', '09:00'],
        ['09:00', '09:30'],
        ['09:30', '10:00'],
        ['10:00', '10:30'],
      ];
      
      const midday = [
        ['11:10', '11:40'],
        ['11:40', '12:10'],
        ['12:10', '12:40'],
        ['12:40', '13:10'],
      ];
      
      const afternoon = [
        ['13:50', '14:20'],
      ];
      
      [...morning, ...midday, ...afternoon].forEach(([start, end]) => {
        periods.push({ id: id++, start, end, day });
      });
    });
    
    return periods;
  };

  const [specialists, setSpecialists] = useState([
    { id: 1, name: 'Junior PE', duration: 60, color: '#3b82f6', yearLevels: ['Prep', 'Year 1', 'Year 2'] },
    { id: 2, name: 'Senior PE', duration: 60, color: '#3b82f6', yearLevels: ['Year 3', 'Year 4', 'Year 5', 'Year 6'] },
    { id: 3, name: 'Junior ART', duration: 60, color: '#8b5cf6', yearLevels: ['Prep', 'Year 1', 'Year 2'] },
    { id: 4, name: 'Senior ART', duration: 60, color: '#8b5cf6', yearLevels: ['Year 3', 'Year 4', 'Year 5', 'Year 6'] },
    { id: 5, name: 'Health', duration: 30, color: '#ec4899', yearLevels: [] },
    { id: 6, name: 'Music', duration: 30, color: '#f59e0b', yearLevels: [] },
    { id: 7, name: 'LOTE', duration: 30, color: '#ef4444', yearLevels: [] },
  ]);
  
  const generateDefaultClasses = () => {
    const classes = [];
    const yearLevels = ['Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
    const classLetters = ['A', 'B', 'C', 'D'];
    let id = 1;
    
    yearLevels.forEach(year => {
      classLetters.forEach(letter => {
        classes.push({ id: id++, name: `${year}${letter}` });
      });
    });
    
    return classes;
  };
  
  const [classes, setClasses] = useState(generateDefaultClasses());
  const [timePeriods, setTimePeriods] = useState(generateDefaultPeriods());
  const [timetable, setTimetable] = useState({});
  const [breaks, setBreaks] = useState([
    { id: 1, name: 'Recess', start: '10:30', end: '11:10' },
    { id: 2, name: 'Lunch', start: '13:10', end: '13:50' }
  ]);
  const [constraints, setConstraints] = useState([
    { id: 1, yearLevel: 'Prep', type: 'avoid', startTime: '08:30', endTime: '10:30', day: 'all' },
    { id: 2, yearLevel: 'Year 1', type: 'avoid', startTime: '08:30', endTime: '10:30', day: 'all' },
    { id: 3, yearLevel: 'Year 2', type: 'avoid', startTime: '08:30', endTime: '10:30', day: 'all' },
    { id: 4, yearLevel: 'Year 3', type: 'minimize', startTime: '11:10', endTime: '13:10', day: 'all' },
    { id: 5, yearLevel: 'Year 4', type: 'minimize', startTime: '11:10', endTime: '13:10', day: 'all' },
    { id: 6, yearLevel: 'Year 5', type: 'minimize', startTime: '11:10', endTime: '13:10', day: 'all' },
    { id: 7, yearLevel: 'Year 6', type: 'minimize', startTime: '11:10', endTime: '13:10', day: 'all' },
  ]);
  const [newConstraint, setNewConstraint] = useState({ yearLevel: 'Prep', type: 'avoid', startTime: '', endTime: '', day: 'all' });
  const [view, setView] = useState('timetable');
  const [timetableView, setTimetableView] = useState('by-class');
  const [specialistOrientation, setSpecialistOrientation] = useState('horizontal');
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [newSpecialist, setNewSpecialist] = useState({ name: '', duration: 30, color: '#3b82f6', yearLevels: [] });
  const [newClass, setNewClass] = useState('');
  const [newPeriod, setNewPeriod] = useState({ start: '', end: '', day: 'Monday' });
  const [newBreak, setNewBreak] = useState({ name: '', start: '', end: '' });
  const [generating, setGenerating] = useState(false);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const availableYearLevels = ['Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];

  const addSpecialist = () => {
    if (newSpecialist.name) {
      setSpecialists([...specialists, { ...newSpecialist, id: Date.now() }]);
      setNewSpecialist({ name: '', duration: 30, color: '#3b82f6', yearLevels: [] });
      if (showNotification) showNotification('Specialist added successfully!', 'success');
    }
  };

  const deleteSpecialist = (id) => {
    setSpecialists(specialists.filter(s => s.id !== id));
    const newTimetable = { ...timetable };
    Object.keys(newTimetable).forEach(key => {
      if (newTimetable[key].specialistId === id) {
        delete newTimetable[key];
      }
    });
    setTimetable(newTimetable);
    if (showNotification) showNotification('Specialist removed', 'success');
  };

  const addClass = () => {
    if (newClass) {
      setClasses([...classes, { id: Date.now(), name: newClass }]);
      setNewClass('');
      if (showNotification) showNotification('Class added successfully!', 'success');
    }
  };

  const deleteClass = (id) => {
    setClasses(classes.filter(c => c.id !== id));
    const newTimetable = { ...timetable };
    Object.keys(newTimetable).forEach(key => {
      if (key.startsWith(`${id}-`)) {
        delete newTimetable[key];
      }
    });
    setTimetable(newTimetable);
    if (showNotification) showNotification('Class removed', 'success');
  };

  const addBreak = () => {
    if (newBreak.name && newBreak.start && newBreak.end) {
      setBreaks([...breaks, { ...newBreak, id: Date.now() }]);
      setNewBreak({ name: '', start: '', end: '' });
      if (showNotification) showNotification('Break added successfully!', 'success');
    }
  };

  const deleteBreak = (id) => {
    setBreaks(breaks.filter(b => b.id !== id));
    if (showNotification) showNotification('Break removed', 'success');
  };

  const isBreakTime = (period) => {
    return breaks.some(breakPeriod => {
      return period.start >= breakPeriod.start && period.start < breakPeriod.end;
    });
  };

  const addConstraint = () => {
    if (newConstraint.yearLevel && newConstraint.startTime && newConstraint.endTime) {
      setConstraints([...constraints, { ...newConstraint, id: Date.now() }]);
      setNewConstraint({ yearLevel: 'Prep', type: 'avoid', startTime: '', endTime: '', day: 'all' });
      if (showNotification) showNotification('Constraint added successfully!', 'success');
    }
  };

  const deleteConstraint = (id) => {
    setConstraints(constraints.filter(c => c.id !== id));
    if (showNotification) showNotification('Constraint removed', 'success');
  };

  const handleCellClick = (classId, periodId) => {
    const key = `${classId}-${periodId}`;
    const existing = timetable[key];
    setEditingCell({ classId, periodId, current: existing });
  };

  const assignSpecialist = (specialistId) => {
    if (!editingCell) return;

    const { classId, periodId } = editingCell;
    const key = `${classId}-${periodId}`;
    const period = timePeriods.find(p => p.id === periodId);
    
    if (!period) return;

    if (specialistId === null) {
      const newTimetable = { ...timetable };
      const entry = newTimetable[key];
      
      if (entry && entry.slots) {
        entry.slots.forEach(slotPeriodId => {
          delete newTimetable[`${classId}-${slotPeriodId}`];
        });
      }
      
      setTimetable(newTimetable);
      setEditingCell(null);
      if (showNotification) showNotification('Entry removed', 'success');
      return;
    }

    if (specialistId === 'NCT') {
      const newTimetable = { ...timetable };
      Object.keys(newTimetable).forEach(k => {
        if (k.startsWith(`${classId}-${periodId}`)) {
          delete newTimetable[k];
        }
      });
      
      newTimetable[key] = {
        specialistId: 'NCT',
        name: 'NCT',
        isFirst: true,
        slots: [periodId]
      };
      
      setTimetable(newTimetable);
      setEditingCell(null);
      if (showNotification) showNotification('NCT assigned', 'success');
      return;
    }

    const specialist = specialists.find(s => s.id === specialistId);
    if (!specialist) return;

    const blocksNeeded = Math.ceil(specialist.duration / 30);
    const sameDayPeriods = timePeriods
      .filter(p => p.day === period.day)
      .sort((a, b) => a.start.localeCompare(b.start));
    
    const startIndex = sameDayPeriods.findIndex(p => p.id === periodId);
    if (startIndex === -1) return;

    const requiredSlots = [];
    for (let i = 0; i < blocksNeeded; i++) {
      const slotPeriod = sameDayPeriods[startIndex + i];
      if (!slotPeriod) {
        if (showNotification) showNotification(`Not enough consecutive blocks for ${specialist.name}`, 'error');
        return;
      }
      
      if (isBreakTime(slotPeriod)) {
        if (showNotification) showNotification('Cannot schedule during break time', 'error');
        return;
      }
      
      const slotKey = `${classId}-${slotPeriod.id}`;
      if (timetable[slotKey] && timetable[slotKey].specialistId !== specialistId) {
        if (showNotification) showNotification('Time slot already occupied', 'error');
        return;
      }
      
      requiredSlots.push(slotPeriod.id);
    }

    const newTimetable = { ...timetable };
    
    Object.keys(newTimetable).forEach(k => {
      if (requiredSlots.some(slot => k === `${classId}-${slot}`)) {
        delete newTimetable[k];
      }
    });

    requiredSlots.forEach((slotId, index) => {
      const slotKey = `${classId}-${slotId}`;
      newTimetable[slotKey] = {
        specialistId: specialist.id,
        name: specialist.name,
        color: specialist.color,
        duration: specialist.duration,
        isFirst: index === 0,
        slots: requiredSlots
      };
    });

    setTimetable(newTimetable);
    setEditingCell(null);
    if (showNotification) showNotification(`${specialist.name} assigned successfully!`, 'success');
  };

  const generateTimetable = () => {
    setGenerating(true);
    if (showNotification) showNotification('Generating timetable...', 'info');

    setTimeout(() => {
      const newTimetable = {};
      const classSchedules = {};
      
      classes.forEach(cls => {
        classSchedules[cls.id] = {};
        days.forEach(day => {
          classSchedules[cls.id][day] = [];
        });
      });

      const specialistQueue = [...specialists].sort((a, b) => b.duration - a.duration);

      const getYearLevel = (className) => {
        const match = className.match(/^(Prep|Year \d)/);
        return match ? match[0] : null;
      };

      const violatesConstraint = (cls, period) => {
        const yearLevel = getYearLevel(cls.name);
        if (!yearLevel) return false;

        return constraints.some(constraint => {
          if (constraint.yearLevel !== yearLevel) return false;
          if (constraint.day !== 'all' && constraint.day !== period.day) return false;
          if (constraint.type === 'avoid') {
            return period.start >= constraint.startTime && period.start < constraint.endTime;
          }
          return false;
        });
      };

      const isSlotAvailable = (cls, period, blocksNeeded) => {
        const sameDayPeriods = timePeriods
          .filter(p => p.day === period.day)
          .sort((a, b) => a.start.localeCompare(b.start));
        
        const startIndex = sameDayPeriods.findIndex(p => p.id === period.id);
        if (startIndex === -1) return false;

        for (let i = 0; i < blocksNeeded; i++) {
          const slotPeriod = sameDayPeriods[startIndex + i];
          if (!slotPeriod) return false;
          if (isBreakTime(slotPeriod)) return false;
          
          const slotKey = `${cls.id}-${slotPeriod.id}`;
          if (newTimetable[slotKey]) return false;
          
          if (violatesConstraint(cls, slotPeriod)) return false;
        }
        
        return true;
      };

      specialistQueue.forEach(specialist => {
        const eligibleClasses = specialist.yearLevels.length > 0
          ? classes.filter(cls => {
              const yearLevel = getYearLevel(cls.name);
              return yearLevel && specialist.yearLevels.includes(yearLevel);
            })
          : classes;

        const shuffledClasses = [...eligibleClasses].sort(() => Math.random() - 0.5);

        shuffledClasses.forEach(cls => {
          let assigned = false;
          const blocksNeeded = Math.ceil(specialist.duration / 30);
          
          const shuffledPeriods = [...timePeriods].sort(() => Math.random() - 0.5);
          
          for (const period of shuffledPeriods) {
            if (assigned) break;
            
            if (isSlotAvailable(cls, period, blocksNeeded)) {
              const sameDayPeriods = timePeriods
                .filter(p => p.day === period.day)
                .sort((a, b) => a.start.localeCompare(b.start));
              
              const startIndex = sameDayPeriods.findIndex(p => p.id === period.id);
              const requiredSlots = [];
              
              for (let i = 0; i < blocksNeeded; i++) {
                requiredSlots.push(sameDayPeriods[startIndex + i].id);
              }

              requiredSlots.forEach((slotId, index) => {
                const slotKey = `${cls.id}-${slotId}`;
                newTimetable[slotKey] = {
                  specialistId: specialist.id,
                  name: specialist.name,
                  color: specialist.color,
                  duration: specialist.duration,
                  isFirst: index === 0,
                  slots: requiredSlots
                };
              });

              assigned = true;
            }
          }
        });
      });

      setTimetable(newTimetable);
      setGenerating(false);
      if (showNotification) showNotification('Timetable generated successfully!', 'success');
    }, 500);
  };

  const clearTimetable = () => {
    setTimetable({});
    if (showNotification) showNotification('Timetable cleared', 'success');
  };

  const exportData = () => {
    const data = {
      specialists,
      classes,
      timePeriods,
      timetable,
      breaks,
      constraints
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specialist-timetable.json';
    a.click();
    URL.revokeObjectURL(url);
    if (showNotification) showNotification('Timetable exported successfully!', 'success');
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (data.specialists) setSpecialists(data.specialists);
        if (data.classes) setClasses(data.classes);
        if (data.timePeriods) setTimePeriods(data.timePeriods);
        if (data.timetable) setTimetable(data.timetable);
        if (data.breaks) setBreaks(data.breaks);
        if (data.constraints) setConstraints(data.constraints);
        if (showNotification) showNotification('Timetable imported successfully!', 'success');
      } catch (error) {
        if (showNotification) showNotification('Failed to import timetable', 'error');
      }
    };
    reader.readAsText(file);
  };

  const sortedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periodsByDay = timePeriods.reduce((acc, period) => {
    if (!acc[period.day]) acc[period.day] = [];
    acc[period.day].push(period);
    return acc;
  }, {});

  Object.keys(periodsByDay).forEach(day => {
    periodsByDay[day].sort((a, b) => a.start.localeCompare(b.start));
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <span className="text-5xl">📅</span>
              Specialist Timetable Creator
            </h1>
            <p className="text-indigo-100 text-lg">Professional timetable scheduling for specialists</p>
          </div>

          <div className="p-6">
            <div className="flex gap-4 mb-6 flex-wrap">
              <button
                onClick={() => setView('timetable')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'timetable'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Timetable
              </button>
              <button
                onClick={() => setView('specialists')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'specialists'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👨‍🏫 Specialists
              </button>
              <button
                onClick={() => setView('classes')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'classes'
                    ? 'bg-pink-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎓 Classes
              </button>
              <button
                onClick={() => setView('schedule')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'schedule'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⏰ Schedule
              </button>
              <button
                onClick={() => setView('constraints')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  view === 'constraints'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⚙️ Constraints
              </button>
            </div>

            {view === 'specialists' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">➕</span>
                    Add New Specialist
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Specialist name"
                      value={newSpecialist.name}
                      onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
                      className="px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                    <input
                      type="number"
                      placeholder="Duration (min)"
                      value={newSpecialist.duration}
                      onChange={(e) => setNewSpecialist({ ...newSpecialist, duration: parseInt(e.target.value) || 30 })}
                      className="px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    />
                    <select
                      value={newSpecialist.color}
                      onChange={(e) => setNewSpecialist({ ...newSpecialist, color: e.target.value })}
                      className="px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                      {colors.map(color => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={addSpecialist}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Specialist
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">Year Level Restrictions:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableYearLevels.map(level => (
                        <button
                          key={level}
                          onClick={() => {
                            const updated = newSpecialist.yearLevels.includes(level)
                              ? newSpecialist.yearLevels.filter(l => l !== level)
                              : [...newSpecialist.yearLevels, level];
                            setNewSpecialist({ ...newSpecialist, yearLevels: updated });
                          }}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            newSpecialist.yearLevels.includes(level)
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {newSpecialist.yearLevels.length === 0 
                        ? 'No restrictions - available for all year levels' 
                        : `Only for: ${newSpecialist.yearLevels.join(', ')}`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialists.map(specialist => (
                    <div
                      key={specialist.id}
                      className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full shadow-md"
                            style={{ backgroundColor: specialist.color }}
                          />
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{specialist.name}</h3>
                            <p className="text-sm text-gray-600">{specialist.duration} minutes</p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSpecialist(specialist.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        {specialist.yearLevels.length === 0 
                          ? '✅ All year levels' 
                          : `📚 ${specialist.yearLevels.join(', ')}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'classes' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">➕</span>
                    Add New Class
                  </h2>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Class name (e.g., 5A)"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                    />
                    <button
                      onClick={addClass}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Class
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {classes.map(cls => (
                    <div
                      key={cls.id}
                      className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-gray-800">{cls.name}</span>
                        <button
                          onClick={() => deleteClass(cls.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {view === 'schedule' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">🕐</span>
                    Manage Breaks
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Break name"
                      value={newBreak.name}
                      onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })}
                      className="px-4 py-3 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <input
                      type="time"
                      value={newBreak.start}
                      onChange={(e) => setNewBreak({ ...newBreak, start: e.target.value })}
                      className="px-4 py-3 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <input
                      type="time"
                      value={newBreak.end}
                      onChange={(e) => setNewBreak({ ...newBreak, end: e.target.value })}
                      className="px-4 py-3 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <button
                      onClick={addBreak}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add Break
                    </button>
                  </div>

                  <div className="space-y-3">
                    {breaks.map(breakItem => (
                      <div
                        key={breakItem.id}
                        className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all"
                      >
                        <div>
                          <span className="font-bold text-gray-800 text-lg">{breakItem.name}</span>
                          <span className="text-gray-600 ml-4">
                            {breakItem.start} - {breakItem.end}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteBreak(breakItem.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'constraints' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-3xl">⚙️</span>
                    Add Scheduling Constraint
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <select
                      value={newConstraint.yearLevel}
                      onChange={(e) => setNewConstraint({ ...newConstraint, yearLevel: e.target.value })}
                      className="px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    >
                      {availableYearLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <select
                      value={newConstraint.type}
                      onChange={(e) => setNewConstraint({ ...newConstraint, type: e.target.value })}
                      className="px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    >
                      <option value="avoid">Avoid</option>
                      <option value="minimize">Minimize</option>
                    </select>
                    <input
                      type="time"
                      value={newConstraint.startTime}
                      onChange={(e) => setNewConstraint({ ...newConstraint, startTime: e.target.value })}
                      className="px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                    <input
                      type="time"
                      value={newConstraint.endTime}
                      onChange={(e) => setNewConstraint({ ...newConstraint, endTime: e.target.value })}
                      className="px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                    />
                    <button
                      onClick={addConstraint}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Add
                    </button>
                  </div>

                  <div className="space-y-3">
                    {constraints.map(constraint => (
                      <div
                        key={constraint.id}
                        className="bg-white border-2 border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-800">{constraint.yearLevel}</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            constraint.type === 'avoid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {constraint.type}
                          </span>
                          <span className="text-gray-600">
                            {constraint.startTime} - {constraint.endTime}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteConstraint(constraint.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {view === 'timetable' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-6">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <button
                      onClick={generateTimetable}
                      disabled={generating}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      <Wand2 size={20} />
                      {generating ? 'Generating...' : 'Auto Generate'}
                    </button>
                    <button
                      onClick={clearTimetable}
                      className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                    >
                      <RefreshCw size={20} />
                      Clear All
                    </button>
                    <button
                      onClick={exportData}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                    >
                      <Download size={20} />
                      Export
                    </button>
                    <label className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 cursor-pointer">
                      <Upload size={20} />
                      Import
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <button
                      onClick={() => setTimetableView('by-class')}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        timetableView === 'by-class'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      View by Class
                    </button>
                    <button
                      onClick={() => setTimetableView('all-specialists')}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        timetableView === 'all-specialists'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All Specialists
                    </button>
                    <button
                      onClick={() => setTimetableView('individual-specialist')}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        timetableView === 'individual-specialist'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Individual Specialist
                    </button>
                  </div>
                </div>

                {timetableView === 'by-class' && (
                  <div>
                    <div className="mb-4 flex items-center gap-4">
                      <label className="font-semibold text-gray-700 text-lg">Select Class:</label>
                      <select
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-lg"
                      >
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedClassId && (
                      <div className="overflow-x-auto rounded-xl shadow-lg">
                        <table className="w-full border-collapse bg-white">
                          <thead>
                            <tr>
                              <th className="p-4 bg-indigo-600 text-white font-bold border border-indigo-700 text-lg">
                                Time
                              </th>
                              {sortedDays.map(day => (
                                <th key={day} className="p-4 bg-indigo-600 text-white font-bold border border-indigo-700 text-lg">
                                  {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timePeriods.filter((period, index, self) => 
                              index === self.findIndex(p => p.start === period.start && p.end === period.end)
                            ).map(uniquePeriod => (
                              <tr key={`${uniquePeriod.start}-${uniquePeriod.end}`}>
                                <td className="p-3 bg-gray-100 font-semibold border border-gray-300">
                                  {uniquePeriod.start} - {uniquePeriod.end}
                                </td>
                                {sortedDays.map(day => {
                                  const dayPeriod = periodsByDay[day]?.find(
                                    p => p.start === uniquePeriod.start && p.end === uniquePeriod.end
                                  );
                                  
                                  if (!dayPeriod) {
                                    return <td key={day} className="p-3 border border-gray-300 bg-white"></td>;
                                  }

                                  const key = `${selectedClassId}-${dayPeriod.id}`;
                                  const entry = timetable[key];
                                  const isFirst = entry?.isFirst;
                                  const isBreak = isBreakTime(dayPeriod);

                                  return (
                                    <td
                                      key={day}
                                      onClick={() => !isBreak && handleCellClick(selectedClassId, dayPeriod.id)}
                                      className={`p-2 border border-gray-300 transition-all ${
                                        isBreak 
                                          ? 'bg-gray-200 cursor-not-allowed' 
                                          : 'cursor-pointer hover:bg-gray-50'
                                      }`}
                                      style={entry && !isBreak ? { backgroundColor: entry.color + '20' } : {}}
                                    >
                                      {isBreak && (
                                        <div className="text-center text-gray-600 font-medium py-2">
                                          Break
                                        </div>
                                      )}
                                      {!isBreak && entry && isFirst && (
                                        <div
                                          className="px-3 py-2 rounded-lg text-white font-semibold shadow-md text-center"
                                          style={{ backgroundColor: entry.color }}
                                        >
                                          <div className="text-sm">{entry.name}</div>
                                          <div className="text-xs opacity-90 mt-1">{entry.duration}min</div>
                                        </div>
                                      )}
                                      {!isBreak && entry && !isFirst && (
                                        <div
                                          className="h-full flex items-center justify-center text-white text-sm py-2 rounded-lg"
                                          style={{ backgroundColor: entry.color }}
                                        >
                                          •••
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {timetableView === 'all-specialists' && (
                  <div>
                    {specialists.length === 0 ? (
                      <div className="text-center text-gray-600 py-12 bg-gray-50 rounded-xl">
                        <p className="text-xl">No specialists added yet. Add specialists to view their timetables.</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {specialists.map(specialist => (
                          <div key={specialist.id} className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full" style={{ backgroundColor: specialist.color }} />
                              {specialist.name} - Weekly Schedule
                            </h2>
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr>
                                    <th className="p-3 text-white font-semibold border" style={{ backgroundColor: specialist.color }}>
                                      Time
                                    </th>
                                    {sortedDays.map(day => (
                                      <th key={day} className="p-3 text-white font-semibold border" style={{ backgroundColor: specialist.color }}>
                                        {day}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {timePeriods.filter((period, index, self) => 
                                    index === self.findIndex(p => p.start === period.start && p.end === period.end)
                                  ).map(uniquePeriod => (
                                    <tr key={`${uniquePeriod.start}-${uniquePeriod.end}`}>
                                      <td className="p-2 bg-gray-100 font-medium border border-gray-300 text-sm">
                                        {uniquePeriod.start} - {uniquePeriod.end}
                                      </td>
                                      {sortedDays.map(day => {
                                        const dayPeriod = periodsByDay[day]?.find(
                                          p => p.start === uniquePeriod.start && p.end === uniquePeriod.end
                                        );
                                        
                                        const classWithSpecialist = dayPeriod ? classes.find(cls => {
                                          const key = `${cls.id}-${dayPeriod.id}`;
                                          return timetable[key] && timetable[key].specialistId === specialist.id;
                                        }) : null;
                                        
                                        const entry = classWithSpecialist && dayPeriod ? timetable[`${classWithSpecialist.id}-${dayPeriod.id}`] : null;
                                        const isFirst = entry?.isFirst;
                                        
                                        return (
                                          <td
                                            key={day}
                                            onClick={() => classWithSpecialist && dayPeriod && handleCellClick(classWithSpecialist.id, dayPeriod.id)}
                                            className="p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center"
                                            style={{ backgroundColor: classWithSpecialist ? specialist.color + '20' : 'white' }}
                                          >
                                            {classWithSpecialist && isFirst && (
                                              <div
                                                className="px-2 py-2 rounded text-white font-medium text-sm shadow-sm"
                                                style={{ backgroundColor: specialist.color }}
                                              >
                                                <div className="whitespace-nowrap overflow-hidden text-ellipsis">{classWithSpecialist.name}</div>
                                                <div className="text-xs opacity-90">{specialist.duration}min</div>
                                              </div>
                                            )}
                                            {classWithSpecialist && !isFirst && (
                                              <div
                                                className="h-full flex items-center justify-center text-white text-xs opacity-75 py-2"
                                                style={{ backgroundColor: specialist.color }}
                                              >
                                                •••
                                              </div>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {timetableView === 'individual-specialist' && (
                  <div>
                    <div className="mb-4 flex items-center gap-4">
                      <label className="font-semibold text-gray-700 text-lg">Select Specialist:</label>
                      <select
                        value={selectedSpecialistId || ''}
                        onChange={(e) => setSelectedSpecialistId(parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-lg"
                      >
                        {specialists.map(spec => (
                          <option key={spec.id} value={spec.id}>{spec.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedSpecialistId && (
                      <div>
                        {(() => {
                          const specialist = specialists.find(s => s.id === selectedSpecialistId);
                          return (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: specialist?.color }} />
                                {specialist?.name} - Weekly Schedule
                              </h2>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="p-3 text-white font-semibold border" style={{ backgroundColor: specialist?.color }}>
                                        Time
                                      </th>
                                      {sortedDays.map(day => (
                                        <th key={day} className="p-3 text-white font-semibold border" style={{ backgroundColor: specialist?.color }}>
                                          {day}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {timePeriods.filter((period, index, self) => 
                                      index === self.findIndex(p => p.start === period.start && p.end === period.end)
                                    ).map(uniquePeriod => (
                                      <tr key={`${uniquePeriod.start}-${uniquePeriod.end}`}>
                                        <td className="p-2 bg-gray-100 font-medium border border-gray-300 text-sm">
                                          {uniquePeriod.start} - {uniquePeriod.end}
                                        </td>
                                        {sortedDays.map(day => {
                                          const dayPeriod = periodsByDay[day]?.find(
                                            p => p.start === uniquePeriod.start && p.end === uniquePeriod.end
                                          );
                                          
                                          const classWithSpecialist = dayPeriod ? classes.find(cls => {
                                            const key = `${cls.id}-${dayPeriod.id}`;
                                            return timetable[key] && timetable[key].specialistId === selectedSpecialistId;
                                          }) : null;
                                          
                                          const entry = classWithSpecialist && dayPeriod ? timetable[`${classWithSpecialist.id}-${dayPeriod.id}`] : null;
                                          const isFirst = entry?.isFirst;
                                          
                                          return (
                                            <td
                                              key={day}
                                              onClick={() => classWithSpecialist && dayPeriod && handleCellClick(classWithSpecialist.id, dayPeriod.id)}
                                              className="p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center"
                                              style={{ backgroundColor: classWithSpecialist ? specialist?.color + '20' : 'white' }}
                                            >
                                              {classWithSpecialist && isFirst && (
                                                <div
                                                  className="px-2 py-2 rounded text-white font-medium text-sm shadow-sm"
                                                  style={{ backgroundColor: specialist?.color }}
                                                >
                                                  <div className="whitespace-nowrap overflow-hidden text-ellipsis">{classWithSpecialist.name}</div>
                                                  <div className="text-xs opacity-90">{specialist?.duration}min</div>
                                                </div>
                                              )}
                                              {classWithSpecialist && !isFirst && (
                                                <div
                                                  className="h-full flex items-center justify-center text-white text-xs opacity-75 py-2"
                                                  style={{ backgroundColor: specialist?.color }}
                                                >
                                                  •••
                                                </div>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Assign Specialist
            </h3>
            <div className="space-y-3 mb-6">
              {specialists.map(specialist => (
                <button
                  key={specialist.id}
                  onClick={() => assignSpecialist(specialist.id)}
                  className="w-full p-4 rounded-lg text-white font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
                  style={{ backgroundColor: specialist.color }}
                >
                  <div className="text-lg">{specialist.name}</div>
                  <div className="text-sm opacity-90">({specialist.duration} minutes)</div>
                </button>
              ))}
              <button
                onClick={() => assignSpecialist('NCT')}
                className="w-full p-4 rounded-lg bg-gray-700 text-white font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
              >
                <div className="text-lg">NCT</div>
                <div className="text-sm opacity-90">(Non Contact Time)</div>
              </button>
              {editingCell.current && (
                <button
                  onClick={() => assignSpecialist(null)}
                  className="w-full p-4 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
                >
                  Remove Entry
                </button>
              )}
            </div>
            <button
              onClick={() => setEditingCell(null)}
              className="w-full p-4 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistTimetable;