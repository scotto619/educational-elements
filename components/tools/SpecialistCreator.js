// components/tools/SpecialistCreator.js - Remade to match site structure
import React, { useState, useEffect } from 'react';

// ===============================================
// SPECIALIST TIMETABLE CREATOR COMPONENT
// ===============================================

const SpecialistCreator = ({ 
  students = [], 
  showToast = () => {},
  saveData = () => {}, // Function to save data to Firebase
  loadedData = {} // Pre-loaded data from Firebase
}) => {
  // ===============================================
  // STATE MANAGEMENT
  // ===============================================
  
  // Core data
  const [specialists, setSpecialists] = useState([
    { id: 1, name: 'Junior PE', duration: 60, color: '#3b82f6', icon: '⚽', yearLevels: ['Prep', 'Year 1', 'Year 2'] },
    { id: 2, name: 'Senior PE', duration: 60, color: '#3b82f6', icon: '⚽', yearLevels: ['Year 3', 'Year 4', 'Year 5', 'Year 6'] },
    { id: 3, name: 'Junior ART', duration: 60, color: '#8b5cf6', icon: '🎨', yearLevels: ['Prep', 'Year 1', 'Year 2'] },
    { id: 4, name: 'Senior ART', duration: 60, color: '#8b5cf6', icon: '🎨', yearLevels: ['Year 3', 'Year 4', 'Year 5', 'Year 6'] },
    { id: 5, name: 'Health', duration: 30, color: '#ec4899', icon: '❤️', yearLevels: [] },
    { id: 6, name: 'Music', duration: 30, color: '#f59e0b', icon: '🎵', yearLevels: [] },
    { id: 7, name: 'LOTE', duration: 30, color: '#ef4444', icon: '🌍', yearLevels: [] },
  ]);
  
  const [classes, setClasses] = useState([]);
  const [timePeriods, setTimePeriods] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [breaks, setBreaks] = useState([
    { id: 1, name: 'Recess', start: '10:30', end: '11:10' },
    { id: 2, name: 'Lunch', start: '13:10', end: '13:50' }
  ]);
  const [constraints, setConstraints] = useState([
    { id: 1, yearLevel: 'Prep', type: 'avoid', startTime: '08:30', endTime: '10:30', day: 'all' },
    { id: 2, yearLevel: 'Year 1', type: 'avoid', startTime: '08:30', endTime: '10:30', day: 'all' },
    { id: 3, yearLevel: 'Year 2', type: 'avoid', startTime: '08:30', endTime: '10:30', day: 'all' },
  ]);
  const [yearLevelGroups, setYearLevelGroups] = useState([]);

  // UI state
  const [currentView, setCurrentView] = useState('timetable'); // timetable, specialists, classes, settings
  const [timetableView, setTimetableView] = useState('by-class'); // by-class, by-specialist
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal states
  const [showSpecialistModal, setShowSpecialistModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showConstraintModal, setShowConstraintModal] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingCell, setEditingCell] = useState(null);

  // Form states
  const [newSpecialist, setNewSpecialist] = useState({
    name: '',
    duration: 30, 
    color: '#3b82f6', 
    icon: '📚',
    yearLevels: [] 
  });
  const [newClass, setNewClass] = useState('');
  const [newBreak, setNewBreak] = useState({ name: '', start: '', end: '' });
  const [newConstraint, setNewConstraint] = useState({
    yearLevel: 'Prep',
    type: 'avoid',
    startTime: '',
    endTime: '',
    day: 'all'
  });
  const [newPeriod, setNewPeriod] = useState({ start: '', end: '', day: 'Monday' });
  const [newGroup, setNewGroup] = useState({
    name: '',
    yearLevels: [],
    sessions: 1,
    enabled: true
  });
  
  // Constants
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const YEAR_LEVELS = ['Prep', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 'Year 6'];
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];
  const ICONS = ['⚽', '🎨', '🎵', '🌍', '❤️', '🧪', '📖', '💻', '🏃', '🎭'];
  
  // ===============================================
  // DATA INITIALIZATION
  // ===============================================
  
  useEffect(() => {
    // Generate default time periods
    const defaultPeriods = generateDefaultPeriods();
    setTimePeriods(defaultPeriods);
    
    // Generate default classes
    const defaultClasses = generateDefaultClasses();
    setClasses(defaultClasses);
    
    // Set first class and specialist as selected
    if (defaultClasses.length > 0) setSelectedClassId(defaultClasses[0].id);
    if (specialists.length > 0) setSelectedSpecialistId(specialists[0].id);
  }, []);
  
  // Load saved data from Firebase
  useEffect(() => {
    if (loadedData.specialistTimetableData) {
      const {
        specialists: savedSpecialists,
        classes: savedClasses,
        timePeriods: savedPeriods,
        timetable: savedTimetable,
        breaks: savedBreaks,
        constraints: savedConstraints,
        yearLevelGroups: savedGroups
      } = loadedData.specialistTimetableData;

      if (savedSpecialists) setSpecialists(savedSpecialists);
      if (savedClasses) setClasses(savedClasses);
      if (savedPeriods) setTimePeriods(savedPeriods);
      if (savedTimetable) setTimetable(savedTimetable);
      if (savedBreaks) setBreaks(savedBreaks);
      if (savedConstraints) setConstraints(savedConstraints);
      if (savedGroups) {
        const normalisedGroups = savedGroups.map(group => ({
          id: group.id ?? Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
          name: group.name || '',
          yearLevels: Array.isArray(group.yearLevels) ? group.yearLevels : [],
          sessions: Math.max(1, parseInt(group.sessions, 10) || 1),
          enabled: group.enabled !== false
        }));
        setYearLevelGroups(normalisedGroups);
      }

      console.log('📖 Loaded Specialist Timetable data from Firebase');
    }
  }, [loadedData]);
  
  // ===============================================
  // UTILITY FUNCTIONS
  // ===============================================
  
  function generateDefaultPeriods() {
    const periods = [];
    let id = 1;
    
    DAYS.forEach(day => {
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
  }
  
  function generateDefaultClasses() {
    const classes = [];
    const classLetters = ['A', 'B', 'C', 'D'];
    let id = 1;
    
    YEAR_LEVELS.forEach(year => {
      classLetters.forEach(letter => {
        classes.push({ 
          id: id++, 
          name: `${year}${letter}`,
          yearLevel: year
        });
      });
    });
    
    return classes;
  }
  
  function isBreakTime(period) {
    return breaks.some(breakPeriod => {
      return period.start >= breakPeriod.start && period.start < breakPeriod.end;
    });
  }
  
  function getTimetableKey(classId, periodId) {
    return `${classId}-${periodId}`;
  }
  
  function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  function checkConstraints(classObj, period) {
    const relevantConstraints = constraints.filter(c =>
      c.yearLevel === classObj.yearLevel &&
      (c.day === 'all' || c.day === period.day)
    );
    
    const periodStart = parseTime(period.start);
    
    for (const constraint of relevantConstraints) {
      const constraintStart = parseTime(constraint.startTime);
      const constraintEnd = parseTime(constraint.endTime);
      
      if (periodStart >= constraintStart && periodStart < constraintEnd) {
        return constraint.type; // 'avoid' or 'minimize'
      }
    }

    return null;
  }

  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function isSpecialistAvailableForClass(specialist, classObj) {
    if (!specialist) return false;
    if (!classObj) return false;
    if (!specialist.yearLevels || specialist.yearLevels.length === 0) return true;
    return specialist.yearLevels.includes(classObj.yearLevel);
  }

  function periodsAreSequential(periodA, periodB) {
    return parseTime(periodA.end) === parseTime(periodB.start);
  }
  
  // ===============================================
  // SAVE FUNCTION
  // ===============================================
  
  const handleManualSave = async () => {
    setIsSaving(true);
    try {
      const specialistTimetableData = {
        specialists,
        classes,
        timePeriods,
        timetable,
        breaks,
        constraints,
        yearLevelGroups,
        lastUpdated: new Date().toISOString()
      };
      
      await saveData({ specialistTimetableData });
      setHasUnsavedChanges(false);
      showToast('Specialist Timetable saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving specialist timetable:', error);
      showToast('Error saving timetable. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // ===============================================
  // SPECIALIST MANAGEMENT
  // ===============================================
  
  const addSpecialist = () => {
    if (!newSpecialist.name) {
      showToast('Please enter a specialist name!', 'error');
      return;
    }
    
    const specialist = {
      ...newSpecialist,
      id: Date.now()
    };
    
    setSpecialists([...specialists, specialist]);
    setHasUnsavedChanges(true);
    setNewSpecialist({ name: '', duration: 30, color: '#3b82f6', icon: '📚', yearLevels: [] });
    setShowSpecialistModal(false);
    showToast('Specialist added! Click "Save Timetable" to save.', 'info');
  };
  
  const deleteSpecialist = (id) => {
    if (!confirm('Are you sure you want to delete this specialist? This will remove all their timetable entries.')) {
      return;
    }
    
    setSpecialists(specialists.filter(s => s.id !== id));
    
    // Remove all timetable entries for this specialist
    const newTimetable = { ...timetable };
    Object.keys(newTimetable).forEach(key => {
      if (newTimetable[key].specialistId === id) {
        delete newTimetable[key];
      }
    });
    setTimetable(newTimetable);
    
    setHasUnsavedChanges(true);
    showToast('Specialist removed! Click "Save Timetable" to save.', 'info');
  };
  
  // ===============================================
  // CLASS MANAGEMENT
  // ===============================================
  
  const addClass = () => {
    if (!newClass) {
      showToast('Please enter a class name!', 'error');
      return;
    }
    
    // Detect year level from class name
    let yearLevel = '';
    for (const year of YEAR_LEVELS) {
      if (newClass.includes(year.replace(' ', ''))) {
        yearLevel = year;
        break;
      }
    }
    
    const classObj = {
      id: Date.now(),
      name: newClass,
      yearLevel: yearLevel
    };
    
    setClasses([...classes, classObj]);
    setHasUnsavedChanges(true);
    setNewClass('');
    setShowClassModal(false);
    showToast('Class added! Click "Save Timetable" to save.', 'info');
  };
  
  const deleteClass = (id) => {
    if (!confirm('Are you sure you want to delete this class? This will remove all their timetable entries.')) {
      return;
    }

    setClasses(classes.filter(c => c.id !== id));

    // Remove all timetable entries for this class
    const newTimetable = { ...timetable };
    Object.keys(newTimetable).forEach(key => {
      if (key.startsWith(`${id}-`)) {
        delete newTimetable[key];
      }
    });
    setTimetable(newTimetable);
    
    setHasUnsavedChanges(true);
    showToast('Class removed! Click "Save Timetable" to save.', 'info');
  };
  
  // ===============================================
  // BREAK MANAGEMENT
  // ===============================================
  
  const addBreak = () => {
    if (!newBreak.name || !newBreak.start || !newBreak.end) {
      showToast('Please fill in all break fields!', 'error');
      return;
    }
    
    const breakObj = {
      ...newBreak,
      id: Date.now()
    };
    
    setBreaks([...breaks, breakObj]);
    setHasUnsavedChanges(true);
    setNewBreak({ name: '', start: '', end: '' });
    setShowBreakModal(false);
    showToast('Break added! Click "Save Timetable" to save.', 'info');
  };
  
  const deleteBreak = (id) => {
    setBreaks(breaks.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
    showToast('Break removed! Click "Save Timetable" to save.', 'info');
  };
  
  // ===============================================
  // CONSTRAINT MANAGEMENT
  // ===============================================
  
  const addConstraint = () => {
    if (!newConstraint.yearLevel || !newConstraint.startTime || !newConstraint.endTime) {
      showToast('Please fill in all constraint fields!', 'error');
      return;
    }
    
    const constraint = {
      ...newConstraint,
      id: Date.now()
    };
    
    setConstraints([...constraints, constraint]);
    setHasUnsavedChanges(true);
    setNewConstraint({ yearLevel: 'Prep', type: 'avoid', startTime: '', endTime: '', day: 'all' });
    setShowConstraintModal(false);
    showToast('Constraint added! Click "Save Timetable" to save.', 'info');
  };
  
  const deleteConstraint = (id) => {
    setConstraints(constraints.filter(c => c.id !== id));
    setHasUnsavedChanges(true);
    showToast('Constraint removed! Click "Save Timetable" to save.', 'info');
  };

  // ===============================================
  // YEAR LEVEL GROUP MANAGEMENT
  // ===============================================

  const addYearLevelGroup = () => {
    if (!newGroup.name.trim()) {
      showToast('Please give the group a name!', 'error');
      return;
    }

    if (newGroup.yearLevels.length === 0) {
      showToast('Select at least one year level for the group.', 'error');
      return;
    }

    const group = {
      id: Date.now(),
      name: newGroup.name.trim(),
      yearLevels: [...newGroup.yearLevels],
      sessions: Math.max(1, parseInt(newGroup.sessions, 10) || 1),
      enabled: newGroup.enabled
    };

    setYearLevelGroups([...yearLevelGroups, group]);
    setHasUnsavedChanges(true);
    setNewGroup({ name: '', yearLevels: [], sessions: 1, enabled: true });
    setShowGroupModal(false);
    showToast('Year level group added! Click "Save Timetable" to save.', 'info');
  };

  const deleteYearLevelGroup = (id) => {
    if (!confirm('Delete this grouping? This will not remove any timetable entries.')) {
      return;
    }

    setYearLevelGroups(yearLevelGroups.filter(group => group.id !== id));
    setHasUnsavedChanges(true);
    showToast('Year level group removed. Save to keep changes.', 'info');
  };

  const toggleGroupEnabled = (id) => {
    setYearLevelGroups(prev =>
      prev.map(group =>
        group.id === id
          ? { ...group, enabled: !group.enabled }
          : group
      )
    );
    setHasUnsavedChanges(true);
  };

  const updateGroupSessions = (id, value) => {
    const sessions = Math.max(1, parseInt(value, 10) || 1);
    setYearLevelGroups(prev => prev.map(group => group.id === id ? { ...group, sessions } : group));
    setHasUnsavedChanges(true);
  };

  const toggleGroupYearLevel = (groupId, yearLevel) => {
    setYearLevelGroups(prev => prev.map(group => {
      if (group.id !== groupId) return group;

      const includes = group.yearLevels.includes(yearLevel);
      const yearLevels = includes
        ? group.yearLevels.filter(level => level !== yearLevel)
        : [...group.yearLevels, yearLevel];

      return { ...group, yearLevels };
    }));
    setHasUnsavedChanges(true);
  };

  const updateGroupName = (id, name) => {
    setYearLevelGroups(prev => prev.map(group => group.id === id ? { ...group, name } : group));
    setHasUnsavedChanges(true);
  };

  // ===============================================
  // TIMETABLE CELL MANAGEMENT
  // ===============================================
  
  const handleCellClick = (classId, periodId) => {
    const key = getTimetableKey(classId, periodId);
    const currentEntry = timetable[key];
    
    setEditingCell({
      classId,
      periodId,
      current: currentEntry
    });
  };
  
  const assignSpecialist = (specialistId) => {
    if (!editingCell) return;
    
    const { classId, periodId } = editingCell;
    const key = getTimetableKey(classId, periodId);
    
    if (specialistId === null) {
      // Remove entry
      const newTimetable = { ...timetable };
      delete newTimetable[key];
      setTimetable(newTimetable);
    } else if (specialistId === 'NCT') {
      // Non-contact time
      setTimetable({
        ...timetable,
        [key]: {
          specialistId: 'NCT',
          type: 'NCT',
          isFirst: true
        }
      });
    } else {
      // Assign specialist
      const specialist = specialists.find(s => s.id === specialistId);
      if (!specialist) return;
      
      const period = timePeriods.find(p => p.id === periodId);
      const periodDuration = 30; // Assuming 30-minute slots
      const slotsNeeded = Math.ceil(specialist.duration / periodDuration);
      
      // Find consecutive periods for this slot
      const periodIndex = timePeriods.findIndex(p => p.id === periodId);
      const consecutivePeriods = timePeriods
        .slice(periodIndex, periodIndex + slotsNeeded)
        .filter(p => p.day === period.day);
      
      if (consecutivePeriods.length < slotsNeeded) {
        showToast(`Not enough consecutive time slots for ${specialist.name} (needs ${specialist.duration} minutes)`, 'error');
        return;
      }
      
      // Clear any existing entries in these slots
      const newTimetable = { ...timetable };
      consecutivePeriods.forEach(p => {
        const k = getTimetableKey(classId, p.id);
        delete newTimetable[k];
      });
      
      // Add new entries
      consecutivePeriods.forEach((p, index) => {
        const k = getTimetableKey(classId, p.id);
        newTimetable[k] = {
          specialistId,
          specialistName: specialist.name,
          color: specialist.color,
          icon: specialist.icon,
          duration: specialist.duration,
          isFirst: index === 0
        };
      });
      
      setTimetable(newTimetable);
    }
    
    setHasUnsavedChanges(true);
    setEditingCell(null);
  };
  
  // ===============================================
  // AUTO-SCHEDULE FUNCTION
  // ===============================================
  
  const autoSchedule = () => {
    if (!confirm('This will clear the current timetable and create a new schedule. Continue?')) {
      return;
    }

    showToast('Generating timetable... This may take a moment.', 'info');

    const newTimetable = {};
    const classOccupied = new Map();
    const specialistOccupied = new Map();
    const scheduledPairs = new Set();

    const basePeriodDuration = 30; // minutes

    const dayPeriodsMap = {};
    DAYS.forEach(day => {
      dayPeriodsMap[day] = timePeriods
        .filter(p => p.day === day)
        .sort((a, b) => parseTime(a.start) - parseTime(b.start));
    });

    const getConsecutivePeriods = (day, startIndex, slotsNeeded) => {
      const dayPeriods = dayPeriodsMap[day] || [];
      const slice = dayPeriods.slice(startIndex, startIndex + slotsNeeded);
      if (slice.length < slotsNeeded) return null;

      for (let i = 0; i < slice.length; i++) {
        const period = slice[i];
        if (isBreakTime(period)) return null;
        if (i > 0 && !periodsAreSequential(slice[i - 1], period)) return null;
      }

      return slice;
    };

    const isPeriodFreeForClass = (classId, periodId) => {
      const occupied = classOccupied.get(classId);
      return !occupied || !occupied.has(periodId);
    };

    const isPeriodFreeForSpecialist = (specialistId, periodId) => {
      const occupied = specialistOccupied.get(specialistId);
      return !occupied || !occupied.has(periodId);
    };

    const occupyBlock = (classObj, specialist, periods) => {
      periods.forEach((period, index) => {
        const key = getTimetableKey(classObj.id, period.id);
        newTimetable[key] = {
          specialistId: specialist.id,
          specialistName: specialist.name,
          color: specialist.color,
          icon: specialist.icon,
          duration: specialist.duration,
          isFirst: index === 0
        };

        const classSet = classOccupied.get(classObj.id) || new Set();
        classSet.add(period.id);
        classOccupied.set(classObj.id, classSet);

        const specSet = specialistOccupied.get(specialist.id) || new Set();
        specSet.add(period.id);
        specialistOccupied.set(specialist.id, specSet);
      });
    };

    const allStartSlots = [];
    DAYS.forEach(day => {
      const dayPeriods = dayPeriodsMap[day];
      dayPeriods.forEach((period, index) => {
        if (!isBreakTime(period)) {
          allStartSlots.push({ day, index });
        }
      });
    });

    const shuffledStartSlots = () => shuffleArray(allStartSlots);

    const schedulePair = (classObj, specialist) => {
      const slotsNeeded = Math.ceil(specialist.duration / basePeriodDuration);
      let fallback = null;

      for (const slot of shuffledStartSlots()) {
        const periods = getConsecutivePeriods(slot.day, slot.index, slotsNeeded);
        if (!periods) continue;

        let conflict = false;
        let hasMinimize = false;

        for (const period of periods) {
          if (!isPeriodFreeForClass(classObj.id, period.id) || !isPeriodFreeForSpecialist(specialist.id, period.id)) {
            conflict = true;
            break;
          }

          const constraint = checkConstraints(classObj, period);
          if (constraint === 'avoid') {
            conflict = true;
            break;
          }
          if (constraint === 'minimize') {
            hasMinimize = true;
          }
        }

        if (conflict) continue;

        if (!hasMinimize) {
          occupyBlock(classObj, specialist, periods);
          scheduledPairs.add(`${classObj.id}-${specialist.id}`);
          return true;
        }

        if (!fallback) {
          fallback = periods;
        }
      }

      if (fallback) {
        occupyBlock(classObj, specialist, fallback);
        scheduledPairs.add(`${classObj.id}-${specialist.id}`);
        return true;
      }

      return false;
    };

    const activeGroups = yearLevelGroups.filter(group => group.enabled && group.yearLevels.length > 0);

    activeGroups.forEach(group => {
      let sessionsToCreate = Math.max(1, parseInt(group.sessions, 10) || 1);
      const groupedClasses = shuffleArray(
        classes.filter(cls => group.yearLevels.includes(cls.yearLevel))
      );

      if (groupedClasses.length === 0) {
        return;
      }

      while (sessionsToCreate > 0) {
        const candidates = shuffleArray(
          groupedClasses.filter(classObj =>
            specialists.some(spec =>
              isSpecialistAvailableForClass(spec, classObj) &&
              !scheduledPairs.has(`${classObj.id}-${spec.id}`)
            )
          )
        );

        if (candidates.length === 0) {
          break;
        }

        let scheduledBlock = false;

        for (const slot of shuffledStartSlots()) {
          const assignments = [];
          const usedSpecialists = new Set();
          let valid = true;

          for (const classObj of candidates) {
            const specialistOptions = shuffleArray(
              specialists.filter(spec =>
                isSpecialistAvailableForClass(spec, classObj) &&
                !scheduledPairs.has(`${classObj.id}-${spec.id}`) &&
                !usedSpecialists.has(spec.id)
              )
            );

            let chosen = null;
            let chosenMinimizeCount = 0;

            for (const spec of specialistOptions) {
              const slotsNeeded = Math.ceil(spec.duration / basePeriodDuration);
              const periods = getConsecutivePeriods(slot.day, slot.index, slotsNeeded);
              if (!periods) continue;

              let conflict = false;
              let minimizeCount = 0;

              for (const period of periods) {
                if (!isPeriodFreeForClass(classObj.id, period.id) || !isPeriodFreeForSpecialist(spec.id, period.id)) {
                  conflict = true;
                  break;
                }

                const constraint = checkConstraints(classObj, period);
                if (constraint === 'avoid') {
                  conflict = true;
                  break;
                }
                if (constraint === 'minimize') {
                  minimizeCount += 1;
                }
              }

              if (!conflict) {
                chosen = { specialist: spec, periods };
                chosenMinimizeCount = minimizeCount;
                break;
              }
            }

            if (!chosen) {
              valid = false;
              break;
            }

            usedSpecialists.add(chosen.specialist.id);
            assignments.push({ classObj, specialist: chosen.specialist, periods: chosen.periods, minimizeCount: chosenMinimizeCount });
          }

          if (valid) {
            assignments
              .sort((a, b) => a.minimizeCount - b.minimizeCount)
              .forEach(({ classObj, specialist, periods }) => {
                occupyBlock(classObj, specialist, periods);
                scheduledPairs.add(`${classObj.id}-${specialist.id}`);
              });

            scheduledBlock = true;
            break;
          }
        }

        if (!scheduledBlock) {
          break;
        }

        sessionsToCreate -= 1;
      }
    });

    const remainingTasks = [];
    classes.forEach(classObj => {
      specialists.forEach(specialist => {
        if (!isSpecialistAvailableForClass(specialist, classObj)) return;
        const key = `${classObj.id}-${specialist.id}`;
        if (scheduledPairs.has(key)) return;
        remainingTasks.push({ classObj, specialist });
      });
    });

    shuffleArray(remainingTasks).forEach(({ classObj, specialist }) => {
      const success = schedulePair(classObj, specialist);
      if (!success) {
        console.warn(`Could not schedule ${specialist.name} for ${classObj.name}`);
      }
    });

    setTimetable(newTimetable);
    setHasUnsavedChanges(true);
    showToast('Auto-schedule complete! Review and click "Save Timetable" to save.', 'success');
  };
  
  // ===============================================
  // RENDER HELPERS
  // ===============================================
  
  const renderTimetableGrid = () => {
    if (timetableView === 'by-class' && !selectedClassId) return null;
    if (timetableView === 'by-specialist' && !selectedSpecialistId) return null;

    // Group periods by day
    const periodsByDay = {};
    DAYS.forEach(day => {
      periodsByDay[day] = timePeriods
        .filter(p => p.day === day)
        .filter((period, index, self) => 
          index === self.findIndex(p => p.start === period.start && p.end === period.end)
        );
    });

    const getAssignmentForSpecialist = (periodId, specialistId) => {
      for (const classObj of classes) {
        const key = getTimetableKey(classObj.id, periodId);
        const entry = timetable[key];
        if (entry && entry.specialistId === specialistId && entry.isFirst) {
          return { classObj, entry };
        }
      }
      return null;
    };

    if (timetableView === 'by-class') {
      const selectedClass = classes.find(c => c.id === selectedClassId);
      if (!selectedClass) return null;

      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="text-3xl mr-3">📚</span>
              {selectedClass.name} - Weekly Schedule
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-3 bg-indigo-100 text-indigo-900 font-bold border border-indigo-200 min-w-[120px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(periodsByDay).length > 0 && 
                  periodsByDay[DAYS[0]].map(uniquePeriod => (
                    <tr key={`${uniquePeriod.start}-${uniquePeriod.end}`}>
                      <td className="p-2 bg-gray-50 font-medium border border-gray-300 text-sm whitespace-nowrap">
                        {uniquePeriod.start} - {uniquePeriod.end}
                      </td>
                      {DAYS.map(day => {
                        const dayPeriod = periodsByDay[day]?.find(
                          p => p.start === uniquePeriod.start && p.end === uniquePeriod.end
                        );
                        
                        if (!dayPeriod) {
                          return <td key={day} className="border border-gray-300 bg-gray-100"></td>;
                        }
                        
                        if (isBreakTime(dayPeriod)) {
                          const breakInfo = breaks.find(b => 
                            dayPeriod.start >= b.start && dayPeriod.start < b.end
                          );
                          return (
                            <td key={day} className="p-2 border border-gray-300 bg-gray-200 text-center">
                              <div className="text-gray-600 font-medium text-sm">
                                ☕ {breakInfo?.name}
                              </div>
                            </td>
                          );
                        }
                        
                        const key = getTimetableKey(selectedClassId, dayPeriod.id);
                        const entry = timetable[key];
                        const constraint = checkConstraints(selectedClass, dayPeriod);
                        
                        return (
                          <td
                            key={day}
                            onClick={() => handleCellClick(selectedClassId, dayPeriod.id)}
                            className={`p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center ${
                              constraint === 'avoid' ? 'bg-red-50' : 
                              constraint === 'minimize' ? 'bg-yellow-50' : ''
                            }`}
                          >
                            {entry && entry.isFirst && (
                              <div
                                className="px-2 py-2 rounded-lg text-white font-semibold text-sm shadow-md flex flex-col items-center justify-center"
                                style={{ backgroundColor: entry.color }}
                              >
                                <div className="text-lg mb-1">{entry.icon}</div>
                                <div className="text-xs">{entry.specialistName}</div>
                                <div className="text-xs opacity-90">{entry.duration}min</div>
                              </div>
                            )}
                            {entry && !entry.isFirst && (
                              <div
                                className="h-full flex items-center justify-center text-white text-xs opacity-75 py-2 rounded"
                                style={{ backgroundColor: entry.color }}
                              >
                                •••
                              </div>
                            )}
                            {entry && entry.type === 'NCT' && (
                              <div className="px-2 py-2 bg-gray-700 text-white rounded-lg font-semibold text-xs">
                                NCT
                              </div>
                            )}
                            {constraint === 'avoid' && !entry && (
                              <div className="text-red-500 text-xs">⚠️</div>
                            )}
                            {constraint === 'minimize' && !entry && (
                              <div className="text-yellow-500 text-xs">⚡</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
              <span className="text-gray-700">⚠️ Avoid Time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded"></div>
              <span className="text-gray-700">⚡ Minimize</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
              <span className="text-gray-700">☕ Break</span>
            </div>
          </div>
        </div>
      );
    }

    if (timetableView === 'all-specialists') {
      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="text-3xl mr-3">🧑‍🏫</span>
              All Specialists - Weekly Overview
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">Day</th>
                  <th className="p-3 bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">Time</th>
                  {specialists.map(spec => (
                    <th
                      key={spec.id}
                      className="p-3 bg-indigo-100 text-indigo-900 font-bold border border-indigo-200 min-w-[160px]"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">{spec.icon}</span>
                        <span>{spec.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => (
                  periodsByDay[day].map(period => {
                    const isBreak = isBreakTime(period);

                    if (isBreak) {
                      const breakInfo = breaks.find(b => period.start >= b.start && period.start < b.end);
                      return (
                        <tr key={`${day}-${period.start}-${period.end}`} className="bg-gray-100">
                          <td className="p-2 border border-gray-300 font-semibold text-gray-600">{day}</td>
                          <td className="p-2 border border-gray-300 text-gray-600">
                            {period.start} - {period.end}
                          </td>
                          <td
                            colSpan={Math.max(1, specialists.length)}
                            className="p-2 border border-gray-300 text-center text-sm text-gray-600"
                          >
                            ☕ {breakInfo?.name || 'Break'}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={`${day}-${period.id}`}>
                        <td className="p-2 border border-gray-300 font-semibold text-gray-700 bg-gray-50">{day}</td>
                        <td className="p-2 border border-gray-300 text-sm bg-gray-50">
                          {period.start} - {period.end}
                        </td>
                        {specialists.map(spec => {
                          const assignment = getAssignmentForSpecialist(period.id, spec.id);

                          if (!assignment) {
                            return (
                              <td key={spec.id} className="p-2 border border-gray-200 text-center text-xs text-gray-400">—</td>
                            );
                          }

                          const { classObj, entry } = assignment;

                          return (
                            <td
                              key={spec.id}
                              onClick={() => handleCellClick(classObj.id, period.id)}
                              className="p-2 border border-gray-200 cursor-pointer hover:bg-indigo-50 transition"
                            >
                              <div
                                className="px-2 py-2 rounded-lg text-white text-sm shadow-md"
                                style={{ backgroundColor: entry.color }}
                              >
                                <div className="font-semibold">{classObj.name}</div>
                                <div className="text-xs opacity-90">{entry.duration}min</div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (timetableView === 'by-specialist') {
      const selectedSpecialist = specialists.find(s => s.id === selectedSpecialistId);
      if (!selectedSpecialist) return null;
      
      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6" style={{ backgroundColor: selectedSpecialist.color }}>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <span className="text-3xl mr-3">{selectedSpecialist.icon}</span>
              {selectedSpecialist.name} - Weekly Schedule
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-3 text-white font-bold border" style={{ backgroundColor: selectedSpecialist.color }}>
                    Time
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-3 text-white font-bold border min-w-[120px]" style={{ backgroundColor: selectedSpecialist.color }}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(periodsByDay).length > 0 && 
                  periodsByDay[DAYS[0]].map(uniquePeriod => (
                    <tr key={`${uniquePeriod.start}-${uniquePeriod.end}`}>
                      <td className="p-2 bg-gray-50 font-medium border border-gray-300 text-sm whitespace-nowrap">
                        {uniquePeriod.start} - {uniquePeriod.end}
                      </td>
                      {DAYS.map(day => {
                        const dayPeriod = periodsByDay[day]?.find(
                          p => p.start === uniquePeriod.start && p.end === uniquePeriod.end
                        );
                        
                        if (!dayPeriod) {
                          return <td key={day} className="border border-gray-300 bg-gray-100"></td>;
                        }
                        
                        const classWithSpecialist = classes.find(cls => {
                          const key = getTimetableKey(cls.id, dayPeriod.id);
                          return timetable[key] && timetable[key].specialistId === selectedSpecialistId;
                        });
                        
                        const entry = classWithSpecialist ? timetable[getTimetableKey(classWithSpecialist.id, dayPeriod.id)] : null;
                        
                        return (
                          <td
                            key={day}
                            onClick={() => classWithSpecialist && handleCellClick(classWithSpecialist.id, dayPeriod.id)}
                            className="p-1 border border-gray-300 cursor-pointer hover:bg-gray-50 transition text-center"
                            style={{ backgroundColor: classWithSpecialist ? selectedSpecialist.color + '20' : 'white' }}
                          >
                            {classWithSpecialist && entry && entry.isFirst && (
                              <div
                                className="px-2 py-2 rounded-lg text-white font-semibold text-sm shadow-md"
                                style={{ backgroundColor: selectedSpecialist.color }}
                              >
                                <div>{classWithSpecialist.name}</div>
                                <div className="text-xs opacity-90">{selectedSpecialist.duration}min</div>
                              </div>
                            )}
                            {classWithSpecialist && entry && !entry.isFirst && (
                              <div
                                className="h-full flex items-center justify-center text-white text-xs opacity-75 py-2"
                                style={{ backgroundColor: selectedSpecialist.color }}
                              >
                                •••
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // ===============================================
  // MAIN RENDER
  // ===============================================
  
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center mb-2">
              <span className="text-4xl mr-3">📅</span>
              Specialist Timetable Creator
            </h1>
            <p className="text-indigo-100">
              Create and manage your specialist teacher timetables with ease
            </p>
          </div>
          <button
            onClick={handleManualSave}
            disabled={!hasUnsavedChanges || isSaving}
            className={`px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center space-x-2 ${
              hasUnsavedChanges && !isSaving
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span className="text-xl">💾</span>
                <span>Save Timetable</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-md flex gap-2 flex-wrap">
        {[
          { id: 'timetable', label: 'Timetable View', icon: '📅' },
          { id: 'specialists', label: 'Manage Specialists', icon: '👨‍🏫' },
          { id: 'classes', label: 'Manage Classes', icon: '🏫' },
          { id: 'settings', label: 'Settings', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`flex-1 min-w-[150px] px-4 py-3 rounded-lg font-semibold transition-all ${
              currentView === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="space-y-6">
        {/* TIMETABLE VIEW */}
        {currentView === 'timetable' && (
          <div className="space-y-4">
            {/* View Controls */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <label className="font-semibold text-gray-700">View By:</label>
                  <select
                    value={timetableView}
                    onChange={(e) => setTimetableView(e.target.value)}
                    className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                  >
                    <option value="by-class">By Class</option>
                    <option value="by-specialist">By Specialist</option>
                    <option value="all-specialists">All Specialists</option>
                  </select>

                  {timetableView === 'by-class' && (
                    <>
                      <label className="font-semibold text-gray-700">Select Class:</label>
                      <select
                        value={selectedClassId || ''}
                        onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                      >
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </>
                  )}
                  
                  {timetableView === 'by-specialist' && (
                    <>
                      <label className="font-semibold text-gray-700">Select Specialist:</label>
                      <select
                        value={selectedSpecialistId || ''}
                        onChange={(e) => setSelectedSpecialistId(parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
                      >
                        {specialists.map(spec => (
                          <option key={spec.id} value={spec.id}>
                            {spec.icon} {spec.name}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
                
                <button
                  onClick={autoSchedule}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  ✨ Auto-Schedule
                </button>
              </div>
            </div>
            
            {/* Timetable Grid */}
            {renderTimetableGrid()}
          </div>
        )}
        
        {/* SPECIALISTS VIEW */}
        {currentView === 'specialists' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Specialists</h2>
                <button
                  onClick={() => setShowSpecialistModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Specialist
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {specialists.map(specialist => (
                  <div
                    key={specialist.id}
                    className="border-2 rounded-xl p-4 hover:shadow-lg transition-all"
                    style={{ borderColor: specialist.color }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: specialist.color + '20' }}
                        >
                          {specialist.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{specialist.name}</h3>
                          <p className="text-sm text-gray-600">{specialist.duration} minutes</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSpecialist(specialist.id)}
                        className="text-red-600 hover:text-red-800 text-xl"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {specialist.yearLevels.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Year Levels:</p>
                        <div className="flex flex-wrap gap-1">
                          {specialist.yearLevels.map(year => (
                            <span
                              key={year}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {year}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* CLASSES VIEW */}
        {currentView === 'classes' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Classes</h2>
                <button
                  onClick={() => setShowClassModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Class
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {classes.map(cls => (
                  <div
                    key={cls.id}
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 hover:shadow-md transition-all relative group"
                  >
                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="absolute top-1 right-1 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎓</div>
                      <h3 className="font-bold text-gray-800">{cls.name}</h3>
                      {cls.yearLevel && (
                        <p className="text-xs text-gray-600 mt-1">{cls.yearLevel}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* SETTINGS VIEW */}
        {currentView === 'settings' && (
          <div className="space-y-4">
            {/* Breaks */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Break Times</h2>
                <button
                  onClick={() => setShowBreakModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Break
                </button>
              </div>
              
              <div className="space-y-3">
                {breaks.map(breakItem => (
                  <div
                    key={breakItem.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800">☕ {breakItem.name}</h3>
                      <p className="text-sm text-gray-600">
                        {breakItem.start} - {breakItem.end}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteBreak(breakItem.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Constraints */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Scheduling Constraints</h2>
                <button
                  onClick={() => setShowConstraintModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Constraint
                </button>
              </div>
              
              <div className="space-y-3">
                {constraints.map(constraint => (
                  <div
                    key={constraint.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      constraint.type === 'avoid' ? 'bg-red-50 border-2 border-red-200' : 'bg-yellow-50 border-2 border-yellow-200'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {constraint.type === 'avoid' ? '⚠️' : '⚡'} {constraint.yearLevel}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {constraint.type === 'avoid' ? 'Avoid' : 'Minimize'}: {constraint.startTime} - {constraint.endTime}
                        {constraint.day !== 'all' && ` on ${constraint.day}`}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteConstraint(constraint.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Year Level Groupings */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Year Level Groupings</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Group year levels to align their specialist times and create shared planning windows.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNewGroup({ name: '', yearLevels: [], sessions: 1, enabled: true });
                    setShowGroupModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                >
                  + Add Group
                </button>
              </div>

              {yearLevelGroups.length === 0 ? (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 text-sm">
                  No year level groupings yet. Add a group to keep teams free at the same time.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {yearLevelGroups.map(group => (
                    <div key={group.id} className="border-2 border-indigo-100 rounded-xl p-4 bg-gradient-to-br from-white to-indigo-50">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name</label>
                          <input
                            type="text"
                            value={group.name}
                            onChange={(e) => updateGroupName(group.id, e.target.value)}
                            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex flex-col text-sm font-semibold text-gray-700">
                            Shared Sessions
                            <input
                              type="number"
                              min={1}
                              value={group.sessions}
                              onChange={(e) => updateGroupSessions(group.id, e.target.value)}
                              className="mt-1 w-24 px-3 py-2 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center"
                            />
                          </label>

                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <input
                              type="checkbox"
                              checked={group.enabled}
                              onChange={() => toggleGroupEnabled(group.id)}
                              className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            Active
                          </label>

                          <button
                            onClick={() => deleteYearLevelGroup(group.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Year Levels</p>
                        <div className="flex flex-wrap gap-2">
                          {YEAR_LEVELS.map(year => {
                            const isActive = group.yearLevels.includes(year);
                            return (
                              <button
                                key={year}
                                onClick={() => toggleGroupYearLevel(group.id, year)}
                                className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition ${
                                  isActive
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                                    : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                                }`}
                              >
                                {year}
                              </button>
                            );
                          })}
                        </div>

                        {!group.yearLevels.length && (
                          <p className="mt-3 text-xs text-red-500 font-semibold">
                            Add at least one year level to this group so it can be used when auto scheduling.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* MODALS */}
      
      {/* Add Specialist Modal */}
      {showSpecialistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Specialist</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={newSpecialist.name}
                  onChange={(e) => setNewSpecialist({...newSpecialist, name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., PE, Art, Music"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <select
                  value={newSpecialist.duration}
                  onChange={(e) => setNewSpecialist({...newSpecialist, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewSpecialist({...newSpecialist, icon})}
                      className={`p-3 text-2xl rounded-lg border-2 transition-all ${
                        newSpecialist.icon === icon
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewSpecialist({...newSpecialist, color})}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        newSpecialist.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Levels (Optional)</label>
                <div className="grid grid-cols-2 gap-2">
                  {YEAR_LEVELS.map(year => (
                    <label key={year} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
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
                        className="rounded"
                      />
                      <span className="text-sm">{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={addSpecialist}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Add Specialist
              </button>
              <button
                onClick={() => setShowSpecialistModal(false)}
                className="px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Create Year Level Group</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Senior Team Planning"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col text-sm font-semibold text-gray-700">
                  Shared Sessions
                  <input
                    type="number"
                    min={1}
                    value={newGroup.sessions}
                    onChange={(e) => setNewGroup({ ...newGroup, sessions: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="mt-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={newGroup.enabled}
                    onChange={() => setNewGroup({ ...newGroup, enabled: !newGroup.enabled })}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  Active for auto scheduling
                </label>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Year Levels</p>
                <div className="flex flex-wrap gap-2">
                  {YEAR_LEVELS.map(year => {
                    const active = newGroup.yearLevels.includes(year);
                    return (
                      <button
                        key={year}
                        onClick={() => {
                          if (active) {
                            setNewGroup({
                              ...newGroup,
                              yearLevels: newGroup.yearLevels.filter(level => level !== year)
                            });
                          } else {
                            setNewGroup({
                              ...newGroup,
                              yearLevels: [...newGroup.yearLevels, year]
                            });
                          }
                        }}
                        className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition ${
                          active
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
                {newGroup.yearLevels.length === 0 && (
                  <p className="mt-3 text-xs text-red-500 font-semibold">
                    Select at least one year level for this group.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={addYearLevelGroup}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Add Group
              </button>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setNewGroup({ name: '', yearLevels: [], sessions: 1, enabled: true });
                }}
                className="px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add New Class</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class Name</label>
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 5A, PrepB"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Tip: Include the year level in the name (e.g., Prep, Year1, Year2)
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={addClass}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Add Class
              </button>
              <button
                onClick={() => setShowClassModal(false)}
                className="px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Break Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add Break Time</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Break Name</label>
                <input
                  type="text"
                  value={newBreak.name}
                  onChange={(e) => setNewBreak({...newBreak, name: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Recess, Lunch"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newBreak.start}
                    onChange={(e) => setNewBreak({...newBreak, start: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newBreak.end}
                    onChange={(e) => setNewBreak({...newBreak, end: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={addBreak}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Add Break
              </button>
              <button
                onClick={() => setShowBreakModal(false)}
                className="px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Constraint Modal */}
      {showConstraintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Add Scheduling Constraint</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year Level</label>
                <select
                  value={newConstraint.yearLevel}
                  onChange={(e) => setNewConstraint({...newConstraint, yearLevel: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {YEAR_LEVELS.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Constraint Type</label>
                <select
                  value={newConstraint.type}
                  onChange={(e) => setNewConstraint({...newConstraint, type: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="avoid">⚠️ Avoid (Don't schedule)</option>
                  <option value="minimize">⚡ Minimize (Try to avoid)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={newConstraint.startTime}
                    onChange={(e) => setNewConstraint({...newConstraint, startTime: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={newConstraint.endTime}
                    onChange={(e) => setNewConstraint({...newConstraint, endTime: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                <select
                  value={newConstraint.day}
                  onChange={(e) => setNewConstraint({...newConstraint, day: e.target.value})}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Days</option>
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={addConstraint}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                Add Constraint
              </button>
              <button
                onClick={() => setShowConstraintModal(false)}
                className="px-4 py-3 bg-gray-300 text-gray-800 font-bold rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cell Edit Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Assign Specialist</h3>
            
            <div className="space-y-3 mb-6">
              {specialists.map(specialist => (
                <button
                  key={specialist.id}
                  onClick={() => assignSpecialist(specialist.id)}
                  className="w-full p-4 rounded-lg text-white font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center space-x-3"
                  style={{ backgroundColor: specialist.color }}
                >
                  <span className="text-2xl">{specialist.icon}</span>
                  <div className="text-left">
                    <div className="text-lg">{specialist.name}</div>
                    <div className="text-sm opacity-90">({specialist.duration} minutes)</div>
                  </div>
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

export default SpecialistCreator;
