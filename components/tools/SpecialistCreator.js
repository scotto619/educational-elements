import React, { useState } from 'react';
import { Plus, Trash2, Upload, Download, Wand2, RefreshCw, Save } from 'lucide-react';

const SpecialistTimetable = () => {
  // Generate default time periods for Monday-Friday
  const generateDefaultPeriods = () => {
    const periods = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    let id = 1;
    
    days.forEach(day => {
      // 8:30am - 10:30am (4 blocks)
      const morning = [
        ['08:30', '09:00'],
        ['09:00', '09:30'],
        ['09:30', '10:00'],
        ['10:00', '10:30'],
      ];
      
      // Break 10:30am - 11:10am
      
      // 11:10am - 1:10pm (4 blocks)
      const midday = [
        ['11:10', '11:40'],
        ['11:40', '12:10'],
        ['12:10', '12:40'],
        ['12:40', '13:10'],
      ];
      
      // Break 1:10pm - 1:50pm
      
      // 1:50pm - 2:30pm (1 block of 40 min, but we'll use 30 min block)
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
  
  // Generate default classes: Prep to Year 6, 4 classes each
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
  };

  const addClass = () => {
    if (newClass) {
      setClasses([...classes, { id: Date.now(), name: newClass }]);
      setNewClass('');
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
  };

  const addBreak = () => {
    if (newBreak.name && newBreak.start && newBreak.end) {
      setBreaks([...breaks, { ...newBreak, id: Date.now() }]);
      setNewBreak({ name: '', start: '', end: '' });
    }
  };

  const deleteBreak = (id) => {
    setBreaks(breaks.filter(b => b.id !== id));
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
    }
  };

  const deleteConstraint = (id) => {
    setConstraints(constraints.filter(c => c.id !== id));
  };

  const getYearLevelFromClassName = (className) => {
    if (className.startsWith('Prep')) return 'Prep';
    for (let i = 1; i <= 6; i++) {
      if (className.startsWith(`Year ${i}`)) return `Year ${i}`;
    }
    return null;
  };

  const getConstraintForPeriod = (className, period) => {
    const yearLevel = getYearLevelFromClassName(className);
    if (!yearLevel) return null;
    
    return constraints.find(c => {
      if (c.yearLevel !== yearLevel) return false;
      if (c.day !== 'all' && c.day !== period.day) return false;
      return period.start >= c.startTime && period.end <= c.endTime;
    });
  };

  const getPeriodBlocks = (startPeriodId, duration) => {
    const blocks = [];
    let currentPeriodIndex = timePeriods.findIndex(p => p.id === startPeriodId);
    let remainingTime = duration;
    
    while (remainingTime > 0 && currentPeriodIndex < timePeriods.length) {
      const period = timePeriods[currentPeriodIndex];
      const periodDuration = 30;
      
      if (isBreakTime(period)) {
        currentPeriodIndex++;
        continue;
      }
      
      blocks.push(period.id);
      remainingTime -= periodDuration;
      currentPeriodIndex++;
    }
    
    return blocks;
  };

  const generateTimetable = () => {
    setGenerating(true);
    setTimeout(() => {
      const newTimetable = {};
      const classAssignments = {};
      const specialistCapacity = {};
      
      specialists.forEach(spec => {
        specialistCapacity[spec.id] = {};
        timePeriods.forEach(period => {
          if (!isBreakTime(period)) {
            specialistCapacity[spec.id][period.id] = false;
          }
        });
      });
      
      classes.forEach(cls => {
        classAssignments[cls.id] = {};
        timePeriods.forEach(period => {
          classAssignments[cls.id][period.id] = false;
        });
      });
      
      const shuffledSpecialists = [...specialists].sort(() => Math.random() - 0.5);
      
      shuffledSpecialists.forEach(specialist => {
        const eligibleClasses = classes.filter(cls => {
          const yearLevel = getYearLevelFromClassName(cls.name);
          return !specialist.yearLevels || specialist.yearLevels.length === 0 || 
                 specialist.yearLevels.includes(yearLevel);
        });
        
        const shuffledClasses = [...eligibleClasses].sort(() => Math.random() - 0.5);
        
        shuffledClasses.forEach(cls => {
          const className = cls.name;
          const yearLevel = getYearLevelFromClassName(className);
          
          // Get PLT constraints for this year level
          const pltConstraints = constraints.filter(c => 
            c.yearLevel === yearLevel && c.type === 'minimize'
          );
          
          // Separate periods into PLT and non-PLT
          const pltPeriods = [];
          const nonPltPeriods = [];
          
          timePeriods.forEach(period => {
            if (isBreakTime(period)) return;
            if (classAssignments[cls.id][period.id]) return;
            
            const isPltPeriod = pltConstraints.some(constraint => {
              if (constraint.day !== 'all' && constraint.day !== period.day) return false;
              return period.start >= constraint.startTime && period.end <= constraint.endTime;
            });
            
            if (isPltPeriod) {
              pltPeriods.push(period);
            } else {
              nonPltPeriods.push(period);
            }
          });
          
          // First try to find a slot in non-PLT periods
          let assigned = false;
          
          for (const period of nonPltPeriods) {
            const constraint = getConstraintForPeriod(className, period);
            if (constraint && constraint.type === 'avoid') continue;
            
            const blocks = getPeriodBlocks(period.id, specialist.duration);
            
            if (blocks.length < specialist.duration / 30) continue;
            
            const allBlocksFree = blocks.every(blockId => {
              return !classAssignments[cls.id][blockId] && 
                     !specialistCapacity[specialist.id][blockId];
            });
            
            if (allBlocksFree) {
              blocks.forEach((blockId, idx) => {
                const key = `${cls.id}-${blockId}`;
                newTimetable[key] = {
                  specialistId: specialist.id,
                  isFirst: idx === 0
                };
                classAssignments[cls.id][blockId] = true;
                specialistCapacity[specialist.id][blockId] = true;
              });
              assigned = true;
              break;
            }
          }
          
          // If not assigned and there are PLT periods, try to assign to PLT periods
          if (!assigned && pltPeriods.length > 0) {
            for (const period of pltPeriods) {
              const blocks = getPeriodBlocks(period.id, specialist.duration);
              
              if (blocks.length < specialist.duration / 30) continue;
              
              const allBlocksFree = blocks.every(blockId => {
                return !classAssignments[cls.id][blockId] && 
                       !specialistCapacity[specialist.id][blockId];
              });
              
              if (allBlocksFree) {
                blocks.forEach((blockId, idx) => {
                  const key = `${cls.id}-${blockId}`;
                  newTimetable[key] = {
                    specialistId: specialist.id,
                    isFirst: idx === 0
                  };
                  classAssignments[cls.id][blockId] = true;
                  specialistCapacity[specialist.id][blockId] = true;
                });
                assigned = true;
                break;
              }
            }
          }
        });
      });
      
      setTimetable(newTimetable);
      setGenerating(false);
    }, 100);
  };

  const clearTimetable = () => {
    setTimetable({});
  };

  const exportTimetable = () => {
    const data = {
      specialists,
      classes,
      timePeriods,
      timetable,
      breaks,
      constraints
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'specialist-timetable.json';
    a.click();
  };

  const importTimetable = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setSpecialists(data.specialists || specialists);
          setClasses(data.classes || classes);
          setTimePeriods(data.timePeriods || timePeriods);
          setTimetable(data.timetable || {});
          setBreaks(data.breaks || breaks);
          setConstraints(data.constraints || constraints);
        } catch (error) {
          alert('Error importing timetable');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCellClick = (classId, periodId) => {
    const key = `${classId}-${periodId}`;
    const currentEntry = timetable[key];
    setEditingCell({ classId, periodId, current: currentEntry });
  };

  const assignSpecialist = (specialistId) => {
    if (!editingCell) return;
    
    const { classId, periodId } = editingCell;
    const newTimetable = { ...timetable };
    
    // If removing or assigning NCT
    if (!specialistId || specialistId === 'NCT') {
      const key = `${classId}-${periodId}`;
      if (specialistId === 'NCT') {
        newTimetable[key] = {
          specialistId: 'NCT',
          isFirst: true
        };
      } else {
        const currentEntry = newTimetable[key];
        if (currentEntry && currentEntry.specialistId !== 'NCT') {
          const specialist = specialists.find(s => s.id === currentEntry.specialistId);
          if (specialist) {
            const blocks = getPeriodBlocks(periodId, specialist.duration);
            blocks.forEach(blockId => {
              delete newTimetable[`${classId}-${blockId}`];
            });
          }
        } else {
          delete newTimetable[key];
        }
      }
    } else {
      // Assigning a specialist
      const specialist = specialists.find(s => s.id === specialistId);
      if (!specialist) return;
      
      const blocks = getPeriodBlocks(periodId, specialist.duration);
      
      // Clear any existing assignments in these blocks
      blocks.forEach(blockId => {
        const key = `${classId}-${blockId}`;
        delete newTimetable[key];
      });
      
      // Assign new specialist
      blocks.forEach((blockId, idx) => {
        const key = `${classId}-${blockId}`;
        newTimetable[key] = {
          specialistId: specialist.id,
          isFirst: idx === 0
        };
      });
    }
    
    setTimetable(newTimetable);
    setEditingCell(null);
  };

  const sortedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periodsByDay = {};
  sortedDays.forEach(day => {
    periodsByDay[day] = timePeriods.filter(p => p.day === day);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-8">
            <h1 className="text-4xl font-bold mb-2">Specialist Timetable Creator</h1>
            <p className="text-lg opacity-90">Automated scheduling with constraints and PLT management</p>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setView('setup')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                view === 'setup'
                  ? 'bg-indigo-100 text-indigo-700 border-b-4 border-indigo-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Setup
            </button>
            <button
              onClick={() => setView('constraints')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                view === 'constraints'
                  ? 'bg-indigo-100 text-indigo-700 border-b-4 border-indigo-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Constraints
            </button>
            <button
              onClick={() => setView('timetable')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                view === 'timetable'
                  ? 'bg-indigo-100 text-indigo-700 border-b-4 border-indigo-600'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Timetable
            </button>
          </div>

          <div className="p-8">
            {view === 'setup' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Specialists</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {specialists.map(specialist => (
                      <div
                        key={specialist.id}
                        className="bg-white rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow"
                        style={{ borderLeftColor: specialist.color }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{specialist.name}</h3>
                            <p className="text-sm text-gray-600">{specialist.duration} minutes</p>
                          </div>
                          <button
                            onClick={() => deleteSpecialist(specialist.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {specialist.yearLevels && specialist.yearLevels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {specialist.yearLevels.map(year => (
                              <span
                                key={year}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {year}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Add Specialist</h3>
                    <input
                      type="text"
                      placeholder="Specialist name"
                      value={newSpecialist.name}
                      onChange={(e) => setNewSpecialist({ ...newSpecialist, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newSpecialist.duration}
                        onChange={(e) => setNewSpecialist({ ...newSpecialist, duration: parseInt(e.target.value) })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                      <select
                        value={newSpecialist.color}
                        onChange={(e) => setNewSpecialist({ ...newSpecialist, color: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {colors.map(color => (
                          <option key={color} value={color} style={{ backgroundColor: color, color: 'white' }}>
                            {color}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Restrict to Year Levels (optional)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableYearLevels.map(year => (
                          <label key={year} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newSpecialist.yearLevels.includes(year)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewSpecialist({
                                    ...newSpecialist,
                                    yearLevels: [...newSpecialist.yearLevels, year]
                                  });
                                } else {
                                  setNewSpecialist({
                                    ...newSpecialist,
                                    yearLevels: newSpecialist.yearLevels.filter(y => y !== year)
                                  });
                                }
                              }}
                              className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{year}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={addSpecialist}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Specialist
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Classes</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                    {classes.map(cls => (
                      <div
                        key={cls.id}
                        className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between hover:shadow-md transition"
                      >
                        <span className="font-medium text-gray-800">{cls.name}</span>
                        <button
                          onClick={() => deleteClass(cls.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Add Class</h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Class name (e.g., Year 3A)"
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={addClass}
                        className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Breaks</h2>
                  <div className="space-y-3 mb-6">
                    {breaks.map(breakPeriod => (
                      <div
                        key={breakPeriod.id}
                        className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800">{breakPeriod.name}</h3>
                          <p className="text-sm text-gray-600">
                            {breakPeriod.start} - {breakPeriod.end}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteBreak(breakPeriod.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Add Break</h3>
                    <input
                      type="text"
                      placeholder="Break name"
                      value={newBreak.name}
                      onChange={(e) => setNewBreak({ ...newBreak, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        value={newBreak.start}
                        onChange={(e) => setNewBreak({ ...newBreak, start: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="time"
                        value={newBreak.end}
                        onChange={(e) => setNewBreak({ ...newBreak, end: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      onClick={addBreak}
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Break
                    </button>
                  </div>
                </div>
              </div>
            )}

            {view === 'constraints' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Scheduling Constraints</h2>
                  <p className="text-gray-600 mb-6">
                    Set time preferences for different year levels. "Avoid" means strongly prefer other times, 
                    "Minimize" means use these times only when necessary for PLT (Planning and Learning Time).
                  </p>

                  <div className="space-y-3 mb-6">
                    {constraints.map(constraint => (
                      <div
                        key={constraint.id}
                        className={`rounded-lg p-4 shadow-sm flex items-center justify-between hover:shadow-md transition ${
                          constraint.type === 'avoid' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-yellow-50 border-l-4 border-yellow-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800">{constraint.yearLevel}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              constraint.type === 'avoid' 
                                ? 'bg-red-200 text-red-800' 
                                : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {constraint.type === 'avoid' ? 'AVOID' : 'PLT TIME'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {constraint.startTime} - {constraint.endTime}
                            {constraint.day !== 'all' && ` on ${constraint.day}`}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteConstraint(constraint.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-700">Add Constraint</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={newConstraint.yearLevel}
                        onChange={(e) => setNewConstraint({ ...newConstraint, yearLevel: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {availableYearLevels.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      <select
                        value={newConstraint.type}
                        onChange={(e) => setNewConstraint({ ...newConstraint, type: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="avoid">Avoid (Strong Preference)</option>
                        <option value="minimize">PLT Time (Use Only When Needed)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="time"
                        value={newConstraint.startTime}
                        onChange={(e) => setNewConstraint({ ...newConstraint, startTime: e.target.value })}
                        placeholder="Start time"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="time"
                        value={newConstraint.endTime}
                        onChange={(e) => setNewConstraint({ ...newConstraint, endTime: e.target.value })}
                        placeholder="End time"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <select
                      value={newConstraint.day}
                      onChange={(e) => setNewConstraint({ ...newConstraint, day: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Days</option>
                      {days.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <button
                      onClick={addConstraint}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Constraint
                    </button>
                  </div>
                </div>
              </div>
            )}

            {view === 'timetable' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={generateTimetable}
                    disabled={generating}
                    className="flex-1 min-w-[200px] bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50"
                  >
                    <Wand2 size={20} />
                    {generating ? 'Generating...' : 'Generate Timetable'}
                  </button>
                  <button
                    onClick={clearTimetable}
                    className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition flex items-center gap-2 font-semibold shadow-lg"
                  >
                    <RefreshCw size={20} />
                    Clear
                  </button>
                  <button
                    onClick={exportTimetable}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold shadow-lg"
                  >
                    <Download size={20} />
                    Export
                  </button>
                  <label className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold shadow-lg cursor-pointer">
                    <Upload size={20} />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={importTimetable}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="bg-white rounded-lg p-4 mb-6">
                  <label className="font-semibold text-gray-700 mb-3 block">View Mode:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTimetableView('by-class')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        timetableView === 'by-class'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      By Class
                    </button>
                    <button
                      onClick={() => setTimetableView('by-specialist')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        timetableView === 'by-specialist'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      All Specialists
                    </button>
                    <button
                      onClick={() => setTimetableView('individual-specialist')}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
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
                      <label className="font-semibold text-gray-700">Select Class:</label>
                      <select
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedClassId && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                          {classes.find(c => c.id === selectedClassId)?.name} - Weekly Schedule
                        </h2>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                <th className="p-3 bg-indigo-600 text-white font-semibold border border-indigo-700">
                                  Time
                                </th>
                                {sortedDays.map(day => (
                                  <th key={day} className="p-3 bg-indigo-600 text-white font-semibold border border-indigo-700">
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
                                    
                                    if (!dayPeriod) {
                                      return <td key={day} className="p-2 border border-gray-300 bg-gray-50"></td>;
                                    }

                                    const key = `${selectedClassId}-${dayPeriod.id}`;
                                    const entry = timetable[key];
                                    const specialist = entry?.specialistId === 'NCT' 
                                      ? { name: 'NCT', color: '#6b7280', duration: 30 }
                                      : specialists.find(s => s.id === entry?.specialistId);
                                    const isFirst = entry?.isFirst;

                                    return (
                                      <td
                                        key={day}
                                        onClick={() => handleCellClick(selectedClassId, dayPeriod.id)}
                                        className="p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center"
                                        style={{ backgroundColor: specialist ? specialist.color + '20' : 'white' }}
                                      >
                                        {specialist && isFirst && (
                                          <div
                                            className="px-2 py-2 rounded text-white font-medium text-sm shadow-sm"
                                            style={{ backgroundColor: specialist.color }}
                                          >
                                            <div className="whitespace-nowrap overflow-hidden text-ellipsis">{specialist.name}</div>
                                            <div className="text-xs opacity-90">{specialist.duration}min</div>
                                          </div>
                                        )}
                                        {specialist && !isFirst && (
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
                    )}
                  </div>
                )}

                {timetableView === 'by-specialist' && (
                  <div>
                    <div className="mb-4 flex items-center gap-4">
                      <label className="font-semibold text-gray-700">Orientation:</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSpecialistOrientation('horizontal')}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            specialistOrientation === 'horizontal'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Horizontal
                        </button>
                        <button
                          onClick={() => setSpecialistOrientation('vertical')}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            specialistOrientation === 'vertical'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Vertical
                        </button>
                      </div>
                    </div>

                    {specialistOrientation === 'horizontal' && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-3 bg-indigo-600 text-white font-semibold border border-indigo-700 sticky left-0 z-10">
                                Time / Class
                              </th>
                              {classes.map(cls => (
                                <th key={cls.id} className="p-3 bg-indigo-600 text-white font-semibold border border-indigo-700 min-w-[100px]">
                                  {cls.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sortedDays.map(day => (
                              <React.Fragment key={day}>
                                <tr>
                                  <td colSpan={classes.length + 1} className="p-2 bg-gray-200 font-bold text-center border border-gray-300">
                                    {day}
                                  </td>
                                </tr>
                                {periodsByDay[day].map(period => {
                                  if (isBreakTime(period)) {
                                    return (
                                      <tr key={period.id}>
                                        <td className="p-2 bg-gray-100 font-medium border border-gray-300 text-sm sticky left-0 z-10">
                                          {period.start} - {period.end}
                                        </td>
                                        {classes.map(cls => (
                                          <td key={cls.id} className="p-2 bg-orange-100 text-center border border-gray-300 text-sm">
                                            BREAK
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  }
                                  return (
                                    <tr key={period.id}>
                                      <td className="p-2 bg-gray-100 font-medium border border-gray-300 text-sm sticky left-0 z-10">
                                        {period.start} - {period.end}
                                      </td>
                                      {classes.map(cls => {
                                        const key = `${cls.id}-${period.id}`;
                                        const entry = timetable[key];
                                        const specialist = entry?.specialistId === 'NCT'
                                          ? { name: 'NCT', color: '#6b7280', duration: 30 }
                                          : specialists.find(s => s.id === entry?.specialistId);
                                        const isFirst = entry?.isFirst;

                                        return (
                                          <td
                                            key={cls.id}
                                            onClick={() => handleCellClick(cls.id, period.id)}
                                            className="p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center"
                                            style={{ backgroundColor: specialist ? specialist.color + '20' : 'white' }}
                                          >
                                            {specialist && isFirst && (
                                              <div
                                                className="px-2 py-1 rounded text-white font-medium text-xs shadow-sm"
                                                style={{ backgroundColor: specialist.color }}
                                              >
                                                <div className="whitespace-nowrap overflow-hidden text-ellipsis">{specialist.name}</div>
                                                <div className="text-xs opacity-90">{specialist.duration}min</div>
                                              </div>
                                            )}
                                            {specialist && !isFirst && (
                                              <div
                                                className="h-full flex items-center justify-center text-white text-xs opacity-75 py-1"
                                                style={{ backgroundColor: specialist.color }}
                                              >
                                                •••
                                              </div>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {specialistOrientation === 'vertical' && (
                      <div className="space-y-8">
                        {sortedDays.map(day => (
                          <div key={day} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-indigo-600 text-white p-3 font-bold text-center text-lg">
                              {day}
                            </div>
                            <table className="w-full border-collapse">
                              <thead>
                                <tr>
                                  <th className="p-3 bg-gray-100 font-semibold border border-gray-300">Time</th>
                                  {classes.map(cls => (
                                    <th key={cls.id} className="p-3 bg-gray-100 font-semibold border border-gray-300">
                                      {cls.name}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {periodsByDay[day].map(period => {
                                  if (isBreakTime(period)) {
                                    return (
                                      <tr key={period.id}>
                                        <td className="p-2 bg-gray-100 font-medium border border-gray-300 text-sm">
                                          {period.start} - {period.end}
                                        </td>
                                        {classes.map(cls => (
                                          <td key={cls.id} className="p-2 bg-orange-100 text-center border border-gray-300 text-sm">
                                            BREAK
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  }
                                  return (
                                    <tr key={period.id}>
                                      <td className="p-2 bg-gray-100 font-medium border border-gray-300 text-sm">
                                        {period.start} - {period.end}
                                      </td>
                                      {classes.map(cls => {
                                        const key = `${cls.id}-${period.id}`;
                                        const entry = timetable[key];
                                        const specialist = entry?.specialistId === 'NCT'
                                          ? { name: 'NCT', color: '#6b7280', duration: 30 }
                                          : specialists.find(s => s.id === entry?.specialistId);
                                        const isFirst = entry?.isFirst;

                                        return (
                                          <td
                                            key={cls.id}
                                            onClick={() => handleCellClick(cls.id, period.id)}
                                            className="p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center"
                                            style={{ backgroundColor: specialist ? specialist.color + '20' : 'white' }}
                                          >
                                            {specialist && isFirst && (
                                              <div
                                                className="px-2 py-2 rounded text-white font-medium text-sm shadow-sm"
                                                style={{ backgroundColor: specialist.color }}
                                              >
                                                <div className="whitespace-nowrap overflow-hidden text-ellipsis">{specialist.name}</div>
                                                <div className="text-xs opacity-90">{specialist.duration}min</div>
                                              </div>
                                            )}
                                            {specialist && !isFirst && (
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
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {timetableView === 'individual-specialist' && (
                  <div>
                    <div className="mb-4 flex items-center gap-4">
                      <label className="font-semibold text-gray-700">Select Specialist:</label>
                      <select
                        value={selectedSpecialistId || ''}
                        onChange={(e) => setSelectedSpecialistId(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            <>
                              <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: specialist?.color }} />
                                {specialist?.name} - Weekly Schedule
                              </h2>
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr>
                                      <th className="p-3 text-white font-semibold border border-purple-600" style={{ backgroundColor: specialist?.color }}>
                                        Time
                                      </th>
                                      {sortedDays.map(day => (
                                        <th key={day} className="p-3 text-white font-semibold border border-purple-600" style={{ backgroundColor: specialist?.color }}>
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
                            </>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              Assign Specialist
            </h3>
            <div className="space-y-2 mb-4">
              {specialists.map(specialist => (
                <button
                  key={specialist.id}
                  onClick={() => assignSpecialist(specialist.id)}
                  className="w-full p-3 rounded-lg text-white font-medium hover:opacity-90 transition"
                  style={{ backgroundColor: specialist.color }}
                >
                  {specialist.name} ({specialist.duration} min)
                </button>
              ))}
              <button
                onClick={() => assignSpecialist('NCT')}
                className="w-full p-3 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-700 transition"
              >
                NCT (Non Contact Time)
              </button>
              {editingCell.current && (
                <button
                  onClick={() => assignSpecialist(null)}
                  className="w-full p-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                >
                  Remove
                </button>
              )}
            </div>
            <button
              onClick={() => setEditingCell(null)}
              className="w-full p-3 rounded-lg bg-gray-300 text-gray-700 font-medium hover:bg-gray-400 transition"
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