// components/tabs/StudentsTab.js - UPGRADED: Dark Mode, Card Effects, Fun Design
import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PET_IMAGE, getAvatarImage as resolveAvatarImage, getPetImage as resolvePetImage } from '../../utils/gameHelpers';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';
import { CARD_EFFECT_MAP } from '../../constants/cardEffects';

// ===============================================
// HELPER FUNCTIONS (LOCAL FALLBACKS)
// ===============================================
const getGridClasses = (studentCount) => {
    if (studentCount <= 4) return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4';
    if (studentCount <= 8) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    if (studentCount <= 12) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    if (studentCount <= 18) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9';
    if (studentCount <= 24) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
    if (studentCount <= 32) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10';
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getBehaviorStatusForToday = (status) => {
    if (!status) return null;
    const today = getTodayDate();
    if (typeof status === 'string') return status;
    if (typeof status === 'object') {
        if (status.date === today) return status.value || null;
        if (status[today]) return status[today];
    }
    return null;
};

const playAwardSound = (type = 'xp') => {
    try {
        const audio = new Audio('/sounds/xp-gain.wav');
        audio.volume = 0.4;
        audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (e) { console.log('Sound error:', e); }
};

// Theme map for card borders/backgrounds (light + dark variants)
const THEME_COLORS = {
    'default':         { border: 'border-blue-400',    darkBorder: 'border-blue-500',    bg: 'bg-blue-50',     darkBg: 'bg-blue-950/40',   glow: 'shadow-blue-400/40' },
    'Hero\'s Dawn':    { border: 'border-blue-400',    darkBorder: 'border-blue-500',    bg: 'bg-blue-50',     darkBg: 'bg-blue-950/40',   glow: 'shadow-blue-400/40' },
    'Shadow Realm':    { border: 'border-purple-400',  darkBorder: 'border-purple-400',  bg: 'bg-purple-50',   darkBg: 'bg-purple-950/40', glow: 'shadow-purple-400/40' },
    'Elven Grove':     { border: 'border-green-400',   darkBorder: 'border-green-400',   bg: 'bg-green-50',    darkBg: 'bg-green-950/40',  glow: 'shadow-green-400/40' },
    'Dragon\'s Lair':  { border: 'border-red-400',     darkBorder: 'border-red-400',     bg: 'bg-red-50',      darkBg: 'bg-red-950/40',    glow: 'shadow-red-400/40' },
    'Frozen Peaks':    { border: 'border-cyan-400',    darkBorder: 'border-cyan-400',    bg: 'bg-cyan-50',     darkBg: 'bg-cyan-950/40',   glow: 'shadow-cyan-400/40' },
    'Void Dimension':  { border: 'border-indigo-500',  darkBorder: 'border-indigo-400',  bg: 'bg-indigo-50',   darkBg: 'bg-indigo-950/40', glow: 'shadow-indigo-400/40' },
    'Desert Oasis':    { border: 'border-yellow-400',  darkBorder: 'border-yellow-400',  bg: 'bg-yellow-50',   darkBg: 'bg-yellow-950/40', glow: 'shadow-yellow-400/40' },
    'Ocean Depths':    { border: 'border-blue-500',    darkBorder: 'border-blue-400',    bg: 'bg-blue-100',    darkBg: 'bg-blue-900/40',   glow: 'shadow-blue-500/40' },
    'Mystic Grove':    { border: 'border-purple-300',  darkBorder: 'border-purple-400',  bg: 'bg-purple-100',  darkBg: 'bg-purple-900/40', glow: 'shadow-purple-300/40' },
    'Celestial Realm': { border: 'border-indigo-400',  darkBorder: 'border-indigo-400',  bg: 'bg-indigo-100',  darkBg: 'bg-indigo-900/40', glow: 'shadow-indigo-400/40' },
    'Volcanic Forge':  { border: 'border-red-500',     darkBorder: 'border-red-400',     bg: 'bg-red-100',     darkBg: 'bg-red-900/40',    glow: 'shadow-red-500/40' },
};

const getThemeColors = (themeName) => THEME_COLORS[themeName] || THEME_COLORS['default'];

const getTitleColor = (title, isDark) => {
    const map = {
        'Novice':     isDark ? 'text-slate-400'  : 'text-gray-600',
        'Apprentice': isDark ? 'text-green-400'  : 'text-green-600',
        'Warrior':    isDark ? 'text-blue-400'   : 'text-blue-600',
        'Hero':       isDark ? 'text-purple-400' : 'text-purple-600',
        'Champion':   isDark ? 'text-orange-400' : 'text-orange-600',
        'Legend':     isDark ? 'text-yellow-400' : 'text-yellow-600',
        'Mythic':     isDark ? 'text-pink-400'   : 'text-pink-600',
        'Ascended':   isDark ? 'text-cyan-400'   : 'text-cyan-600',
        'Divine':     isDark ? 'text-amber-300'  : 'text-yellow-600',
        'Eternal':    isDark ? 'text-violet-400' : 'text-purple-600',
    };
    return map[title] || (isDark ? 'text-slate-400' : 'text-gray-600');
};

const getPrestigeEffects = (prestige, masterLevel) => {
    if (masterLevel > 0) return 'animate-pulse ring-4 ring-offset-2 ring-purple-500 shadow-2xl shadow-purple-500/50';
    if (prestige >= 50) return 'animate-pulse ring-4 ring-indigo-500 shadow-xl shadow-indigo-500/50';
    if (prestige >= 25) return 'ring-4 ring-pink-500 shadow-lg shadow-pink-500/50';
    if (prestige >= 10) return 'ring-4 ring-yellow-400 shadow-lg shadow-yellow-400/50';
    if (prestige >= 5)  return 'ring-4 ring-gray-400 shadow-md shadow-gray-400/50';
    if (prestige >= 1)  return 'ring-4 ring-orange-400 shadow-md shadow-orange-400/50';
    return '';
};

// Effect rarity badge colors
const EFFECT_RARITY_COLORS = {
    rare:      { bg: 'bg-blue-500',   text: 'text-white' },
    epic:      { bg: 'bg-purple-600', text: 'text-white' },
    legendary: { bg: 'bg-amber-500',  text: 'text-white' },
};

// ===============================================
// CLASS STATS BAR
// ===============================================
const ClassStatsBar = ({ students, isDark }) => {
    const totalXP    = students.reduce((s, st) => s + (st.totalPoints || 0), 0);
    const totalCoins = students.reduce((s, st) => s + Math.max(0, Math.floor((st.totalPoints || 0) / 5) + (st.currency || 0) - (st.coinsSpent || 0)), 0);
    const topStudent = students.length > 0
        ? students.reduce((best, st) => (st.totalPoints || 0) > (best.totalPoints || 0) ? st : best, students[0])
        : null;
    const effectCount = students.filter(st => st.equippedCardEffect).length;
    const today = getTodayDate();
    const presentCount = students.filter(st => st.attendance?.[today] === 'present').length;

    const pill = isDark
        ? 'bg-slate-700/80 border border-slate-600 text-slate-100'
        : 'bg-white border border-gray-200 text-gray-800 shadow-sm';

    const stats = [
        { icon: '👥', label: 'Students', value: students.length },
        { icon: '⭐', label: 'Class XP',  value: totalXP.toLocaleString() },
        { icon: '💰', label: 'Coins',     value: totalCoins.toLocaleString() },
        { icon: '✅', label: 'Present',   value: `${presentCount}/${students.length}` },
        ...(topStudent ? [{ icon: '🏆', label: 'Top Hero', value: topStudent.firstName }] : []),
        ...(effectCount > 0 ? [{ icon: '✨', label: 'Effects', value: effectCount }] : []),
    ];

    return (
        <div className="flex flex-wrap gap-2">
            {stats.map(({ icon, label, value }) => (
                <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${pill}`}>
                    <span className="text-base leading-none">{icon}</span>
                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{label}:</span>
                    <span>{value}</span>
                </div>
            ))}
        </div>
    );
};

// ===============================================
// AWARD NOTIFICATION POPUP
// ===============================================
const AwardNotification = ({ notification, onClose }) => {
    if (!notification) return null;
    const { students, amount, type, isBulk } = notification;
    const isCoins = type === 'coins';
    const icon = isCoins ? '💰' : '⭐';
    const color = isCoins ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-purple-500';
    const typeText = isCoins ? 'Coins' : 'XP';

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full transform animate-bounce`}>
                <div className="text-center relative">
                    <button onClick={onClose} className="absolute top-0 right-0 text-white hover:text-gray-200 text-2xl font-bold w-8 h-8 flex items-center justify-center">×</button>
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">{icon}</div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">{isBulk ? 'BULK AWARD!' : 'AWARD GIVEN!'}</h2>
                    <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="text-xl sm:text-2xl font-bold mb-2">+{amount} {typeText}</div>
                        {isBulk
                            ? <div className="text-base sm:text-lg">Awarded to {students.length} students!</div>
                            : <div className="text-base sm:text-lg">Awarded to <strong>{students[0]?.firstName}</strong>!</div>
                        }
                    </div>
                    {isBulk && students.length > 1 && (
                        <div className="text-xs sm:text-sm opacity-90">
                            {students.slice(0, 3).map(s => s.firstName).join(', ')}
                            {students.length > 3 && ` +${students.length - 3} more`}
                        </div>
                    )}
                    <button onClick={onClose} className="mt-3 sm:mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 font-semibold hover:scale-105 transform text-sm sm:text-base">
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// CONTEXT MENU COMPONENT
// ===============================================
const ContextMenu = ({ student, position, onAward, onView, onAvatar, onClose, getAvatarImage, calculateAvatarLevel, isDark }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) onClose(); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const isMobile = window.innerWidth < 640;
    const menuStyle = isMobile
        ? { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 60 }
        : { position: 'fixed', top: position.y, left: position.x, zIndex: 50 };

    const bg = isDark ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-white border-gray-200 text-gray-800';

    return (
        <div ref={menuRef} className={`w-56 sm:w-64 rounded-xl shadow-2xl border p-2 sm:p-3 ${bg}`} style={menuStyle}>
            <div className={`flex items-center p-2 sm:p-3 border-b mb-2 ${isDark ? 'border-slate-600' : ''}`}>
                <img src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3" />
                <span className="font-bold text-sm sm:text-base">{student.firstName}</span>
            </div>
            <ul>
                <li onClick={onAward} className={`flex items-center px-3 py-2 sm:py-3 text-sm sm:text-base rounded-md cursor-pointer transition-colors ${isDark ? 'hover:bg-blue-600' : 'hover:bg-blue-500 hover:text-white'}`}>
                    <span className="mr-3 text-lg">🏆</span> Award XP / Coins
                </li>
                <li onClick={onView} className={`flex items-center px-3 py-2 sm:py-3 text-sm sm:text-base rounded-md cursor-pointer transition-colors ${isDark ? 'hover:bg-purple-600' : 'hover:bg-purple-500 hover:text-white'}`}>
                    <span className="mr-3 text-lg">📜</span> View Character Sheet
                </li>
                <li onClick={onAvatar} className={`flex items-center px-3 py-2 sm:py-3 text-sm sm:text-base rounded-md cursor-pointer transition-colors ${isDark ? 'hover:bg-green-700' : 'hover:bg-green-500 hover:text-white'}`}>
                    <span className="mr-3 text-lg">🎭</span> Change Avatar
                </li>
            </ul>
        </div>
    );
};

// ===============================================
// HOVER PREVIEW COMPONENT
// ===============================================
const HoverPreview = ({ preview, position, isDark }) => {
    if (!preview) return null;
    if (typeof window === 'undefined') return null;
    const isMobile = (typeof window.matchMedia === 'function' && window.matchMedia('(hover: none)').matches) || window.innerWidth < 640;
    if (isMobile) return null;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = viewportWidth >= 1024 ? 208 : 192;
    const previewHeight = viewportWidth >= 1024 ? 248 : 216;
    const edgePadding = 16;
    let left = Math.max(edgePadding, Math.min(position.x + 20, viewportWidth - previewWidth - edgePadding));
    let top = Math.max(edgePadding, Math.min(position.y - previewHeight / 2, viewportHeight - previewHeight - edgePadding));

    return (
        <div
            className={`fixed pointer-events-none z-[100] rounded-lg shadow-2xl p-3 border-2 border-blue-300 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
            style={{ left, top }}
        >
            <img src={preview.image} alt="Preview" className="w-32 sm:w-48 h-32 sm:h-48 rounded-lg" />
            <p className={`text-center font-bold mt-2 text-sm sm:text-base ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{preview.text}</p>
        </div>
    );
};

// ===============================================
// MAIN STUDENTS TAB COMPONENT
// ===============================================
const StudentsTab = ({
    students = [],
    xpCategories = [],
    onUpdateCategories,
    onBulkAward,
    onUpdateStudent,
    onReorderStudents,
    onViewDetails,
    onAddStudent,
    getAvatarImage: propGetAvatarImage,
    getPetImage: propGetPetImage,
    calculateCoins: propCalculateCoins,
    calculateAvatarLevel: propCalculateAvatarLevel,
    groupData
}) => {
    const getAvatarImageFunc = propGetAvatarImage || ((avatarBase, level) => resolveAvatarImage(avatarBase, level));
    const getPetImageFunc = propGetPetImage || ((pet) => resolvePetImage(pet));
    const calculateCoinsFunc = propCalculateCoins || ((student) => Math.max(0, Math.floor((student?.totalPoints || 0) / 5) + (student?.currency || 0) - (student?.coinsSpent || 0)));
    const calculateAvatarLevelFunc = propCalculateAvatarLevel || ((xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1));

    // Dark mode — persisted in localStorage
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('studentsTab_darkMode') === 'true';
        }
        return false;
    });

    const toggleDark = () => {
        setIsDark(prev => {
            const next = !prev;
            if (typeof window !== 'undefined') localStorage.setItem('studentsTab_darkMode', next);
            return next;
        });
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, student: null });
    const [draggedStudentId, setDraggedStudentId] = useState(null);
    const [awardModal, setAwardModal] = useState({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null });
    const [hoverPreview, setHoverPreview] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [awardNotification, setAwardNotification] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        handleFullscreenChange();
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const activeGroups = React.useMemo(() => {
        if (!groupData || !groupData.groupsToSave || groupData.groupsToSave.length === 0) return [];
        return groupData.groupsToSave;
    }, [groupData]);

    const toggleFullscreen = () => {
        if (typeof document === 'undefined') return;
        if (document.fullscreenElement) {
            if (typeof document.exitFullscreen === 'function') document.exitFullscreen().catch(() => {});
            else if (typeof document.webkitExitFullscreen === 'function') document.webkitExitFullscreen();
            return;
        }
        const element = containerRef.current || document.documentElement;
        if (!element) return;
        const request = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
        if (typeof request === 'function') request.call(element).catch(() => {});
    };

    useEffect(() => { setRefreshKey(prev => prev + 1); }, [students]);

    const filteredStudents = students.filter(student =>
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleStudentClick = (e, student) => { e.preventDefault(); setContextMenu({ visible: true, x: e.clientX, y: e.clientY, student }); };
    const handleSelectAll = () => setSelectedStudents(prev => prev.length === filteredStudents.length ? [] : filteredStudents.map(s => s.id));
    const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, student: null });
    const handleDragStart = (e, studentId) => setDraggedStudentId(studentId);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e, targetStudentId) => {
        if (draggedStudentId === targetStudentId) return;
        const fromIndex = students.findIndex(s => s.id === draggedStudentId);
        const toIndex = students.findIndex(s => s.id === targetStudentId);
        let newStudents = [...students];
        const [draggedItem] = newStudents.splice(fromIndex, 1);
        newStudents.splice(toIndex, 0, draggedItem);
        onReorderStudents(newStudents);
        setDraggedStudentId(null);
    };

    const handleAwardSubmit = (amount, reason, type) => {
        try {
            const targetIds = awardModal.isBulk ? selectedStudents : [awardModal.studentId];
            const awardedStudents = students.filter(student => targetIds.includes(student.id));
            onBulkAward(targetIds, amount, type);
            playAwardSound(type);
            setAwardNotification({ students: awardedStudents, amount, type, isBulk: awardModal.isBulk, reason });
        } finally {
            setAwardModal({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null });
            if (awardModal.isBulk) setSelectedStudents([]);
        }
    };

    const handleQuickAward = (student, type) => {
        onBulkAward([student.id], 1, type);
        playAwardSound(type);
        setAwardNotification({ students: [student], amount: 1, type, isBulk: false, reason: 'Quick Award' });
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev => prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]);
    };

    const handleTrafficLightClick = (student, color) => {
        const today = getTodayDate();
        const currentStatus = getBehaviorStatusForToday(student.behaviorStatus);
        const nextStatus = currentStatus === color ? null : { date: today, value: color };
        onUpdateStudent(student.id, { behaviorStatus: nextStatus });
    };

    const handleAttendanceToggle = (student) => {
        const today = getTodayDate();
        const currentAttendance = student.attendance?.[today];
        let newStatus = !currentAttendance ? 'present' : currentAttendance === 'present' ? 'absent' : null;
        const updatedAttendance = { ...(student.attendance || {}), [today]: newStatus };
        if (newStatus === null) delete updatedAttendance[today];
        onUpdateStudent(student.id, { attendance: updatedAttendance });
    };

    // ─── Dark mode themed classes ─────────────────────────────────────────────
    const outerBg  = isDark ? 'bg-slate-900 min-h-screen'  : '';
    const headerBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200';
    const inputCls = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500'
        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500';
    const groupBoardBg = isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-purple-200';
    const groupCardBg  = isDark ? 'bg-slate-700 border-slate-600' : 'bg-purple-50 border-purple-100';

    return (
        <div ref={containerRef} className={`space-y-3 sm:space-y-4 p-1 ${outerBg}`} onMouseMove={handleMouseMove}>

            {/* ── HEADER ───────────────────────────────────────────────── */}
            <div className={`rounded-xl p-3 shadow-md border ${headerBg}`}>

                {/* Stats row */}
                <div className="mb-3">
                    <ClassStatsBar students={filteredStudents} isDark={isDark} />
                </div>

                {/* Controls row */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="🔍 Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`flex-1 min-w-[140px] px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors ${inputCls}`}
                    />

                    {/* Select All */}
                    <button
                        onClick={handleSelectAll}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            isDark
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? 'Deselect All' : 'Select All'}
                    </button>

                    {/* Bulk award */}
                    {selectedStudents.length > 0 && (
                        <button
                            onClick={() => setAwardModal({ visible: true, isBulk: true, type: 'xp', studentId: null, student: null })}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg transition-all transform hover:scale-105 text-sm whitespace-nowrap"
                        >
                            🏆 Award {selectedStudents.length}
                        </button>
                    )}

                    {/* Add student */}
                    <button
                        onClick={onAddStudent}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            isDark
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        + Add
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={toggleFullscreen}
                        className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isDark
                                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
                        }`}
                        type="button"
                    >
                        <span aria-hidden="true">{isFullscreen ? '🗗' : '⛶'}</span>
                        <span>{isFullscreen ? 'Exit' : 'Full'}</span>
                    </button>

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleDark}
                        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                            isDark
                                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-300 border-slate-600'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                        }`}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {/* Status hint (desktop only) */}
                    <span className={`hidden lg:block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {selectedStudents.length > 0
                            ? `${selectedStudents.length} selected`
                            : 'Click avatar • ⭐/💰 quick award • Shift+click select'}
                    </span>
                </div>
            </div>

            {/* ── GROUP SCOREBOARD ──────────────────────────────────────── */}
            {activeGroups.length > 0 && (
                <div className={`rounded-xl p-3 shadow-md border ${groupBoardBg}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        <span className="text-base">🏆</span> Active Group Scores
                    </h3>
                    <div className="flex overflow-x-auto pb-1 gap-2 snap-x">
                        {activeGroups.map(group => (
                            <div key={group.id} className={`min-w-[130px] flex-shrink-0 rounded-lg p-2.5 border snap-start ${groupCardBg}`}>
                                <div className={`font-bold text-sm truncate mb-1 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{group.name}</div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={`font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Daily: {group.scores?.daily || 0}</span>
                                    <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>Wk: {group.scores?.weekly || 0}</span>
                                </div>
                                <div className={`mt-1.5 text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {group.students?.length || 0} Members
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── STUDENT GRID ──────────────────────────────────────────── */}
            <div className={`grid ${getGridClasses(filteredStudents.length)} gap-2 sm:gap-3`} key={refreshKey}>
                {filteredStudents.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        isSelected={selectedStudents.includes(student.id)}
                        isDragged={draggedStudentId === student.id}
                        isDark={isDark}
                        onClick={(e) => handleStudentClick(e, student)}
                        onDragStart={(e) => handleDragStart(e, student.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, student.id)}
                        onAvatarHover={(img, text) => setHoverPreview({ image: img, text })}
                        onPetHover={(img, text) => setHoverPreview({ image: img, text })}
                        onHoverEnd={() => setHoverPreview(null)}
                        getAvatarImage={getAvatarImageFunc}
                        getPetImage={getPetImageFunc}
                        calculateCoins={calculateCoinsFunc}
                        calculateAvatarLevel={calculateAvatarLevelFunc}
                        onQuickAward={handleQuickAward}
                        onToggleSelection={toggleStudentSelection}
                        onTrafficLightClick={handleTrafficLightClick}
                        onAttendanceToggle={handleAttendanceToggle}
                    />
                ))}
            </div>

            <AwardNotification notification={awardNotification} onClose={() => setAwardNotification(null)} />
            <HoverPreview preview={hoverPreview} position={mousePosition} isDark={isDark} />

            {contextMenu.visible && (
                <ContextMenu
                    student={contextMenu.student}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onAward={() => { setAwardModal({ visible: true, isBulk: false, type: 'xp', studentId: contextMenu.student.id, student: contextMenu.student }); closeContextMenu(); }}
                    onView={() => { onViewDetails(contextMenu.student); closeContextMenu(); }}
                    onAvatar={() => { closeContextMenu(); }}
                    onClose={closeContextMenu}
                    getAvatarImage={getAvatarImageFunc}
                    calculateAvatarLevel={calculateAvatarLevelFunc}
                    isDark={isDark}
                />
            )}

            {awardModal.visible && (
                <AwardModal
                    isBulk={awardModal.isBulk}
                    awardType={awardModal.type}
                    onTypeChange={(newType) => setAwardModal(prev => ({ ...prev, type: newType }))}
                    studentCount={selectedStudents.length}
                    student={awardModal.student}
                    onSubmit={handleAwardSubmit}
                    onClose={() => setAwardModal({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null })}
                    isDark={isDark}
                />
            )}
        </div>
    );
};

// ===============================================
// STUDENT CARD COMPONENT — WITH CARD EFFECTS & DARK MODE
// ===============================================
const StudentCard = ({
    student, isSelected, isDragged, isDark,
    onClick, onDragStart, onDragOver, onDrop,
    onAvatarHover, onPetHover, onHoverEnd,
    getAvatarImage, getPetImage, calculateCoins, calculateAvatarLevel,
    onQuickAward, onToggleSelection, onTrafficLightClick, onAttendanceToggle
}) => {
    const level     = calculateAvatarLevel(student.totalPoints);
    const coins     = calculateCoins(student);
    const xpForNext = (student.totalPoints || 0) % 100;
    const avatarImg = getAvatarImage(student.avatarBase, level);
    const pet       = student.ownedPets?.[0];
    const petImage  = pet ? normalizeImageSource(getPetImage(pet), DEFAULT_PET_IMAGE) : null;
    const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);

    const today          = getTodayDate();
    const todayAttendance = student.attendance?.[today];
    const behaviorStatus  = getBehaviorStatusForToday(student.behaviorStatus);

    // ── Card effect lookup ───────────────────────────────────────────────────
    const equippedEffectId = student.equippedCardEffect;
    const cardEffect       = equippedEffectId ? CARD_EFFECT_MAP[equippedEffectId] : null;

    // ── Clicker / theme data ─────────────────────────────────────────────────
    const clickerGameData = student.clickerGameData || null;
    const hasClickerData  = clickerGameData && clickerGameData.activeTheme;

    let clickerAchievements = null;
    if (hasClickerData) {
        const themeNameMap = {
            'default': 'Hero\'s Dawn', 'dark': 'Shadow Realm', 'forest': 'Elven Grove',
            'fire': 'Dragon\'s Lair', 'ice': 'Frozen Peaks', 'cosmic': 'Void Dimension',
            'desert': 'Desert Oasis', 'ocean': 'Ocean Depths', 'mystic': 'Mystic Grove',
            'celestial': 'Celestial Realm', 'volcanic': 'Volcanic Forge'
        };
        clickerAchievements = {
            title:     clickerGameData.activeTitle || 'Novice',
            themeName: themeNameMap[clickerGameData.activeTheme] || 'Hero\'s Dawn',
            theme:     clickerGameData.activeTheme || 'default',
            prestige:  clickerGameData.prestige || 0,
            masterLevel: clickerGameData.masterLevel || 0,
        };
    }

    // ── Derived styling ───────────────────────────────────────────────────────
    const themeColors    = hasClickerData ? getThemeColors(clickerAchievements.themeName) : null;
    const titleColor     = hasClickerData ? getTitleColor(clickerAchievements.title, isDark) : (isDark ? 'text-slate-500' : 'text-gray-500');
    const prestigeEffects = hasClickerData ? getPrestigeEffects(clickerAchievements.prestige, clickerAchievements.masterLevel) : '';

    // Base card background
    let cardBg;
    if (isSelected) {
        cardBg = isDark ? 'bg-purple-900/60' : 'bg-purple-100';
    } else if (hasClickerData) {
        cardBg = isDark ? themeColors.darkBg : themeColors.bg;
    } else if (cardEffect) {
        cardBg = isDark ? 'bg-slate-800' : 'bg-white';
    } else {
        cardBg = isDark ? 'bg-slate-800' : 'bg-white';
    }

    // Border
    let borderCls;
    if (isSelected) {
        borderCls = 'border-2 border-purple-500';
    } else if (cardEffect) {
        // Effect provides its own glow ring — use a subtler border derived from effect rarity
        const rarityBorderMap = { rare: 'border-2 border-blue-400', epic: 'border-2 border-purple-500', legendary: 'border-2 border-amber-400' };
        borderCls = rarityBorderMap[cardEffect.rarity] || 'border-2 border-blue-400';
    } else if (hasClickerData) {
        borderCls = `border-4 ${isDark ? themeColors.darkBorder : themeColors.border} shadow-lg ${themeColors.glow} ${prestigeEffects}`;
    } else {
        borderCls = isDark ? 'border border-slate-700 hover:border-slate-500' : 'border border-gray-200 hover:border-blue-400';
    }

    const handleStarClick   = (e) => { e.stopPropagation(); onQuickAward(student, 'xp'); };
    const handleCoinClick   = (e) => { e.stopPropagation(); onQuickAward(student, 'coins'); };
    const handleCardClick   = (e) => { if (e.shiftKey) { e.preventDefault(); onToggleSelection(student.id); } else { onClick(e); } };

    return (
        <div
            draggable="true"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={handleCardClick}
            className={`relative overflow-hidden p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.03]
                ${cardBg} ${borderCls}
                ${isSelected ? 'scale-105' : ''}
                ${isDragged ? 'opacity-30 ring-2 ring-blue-500' : ''}
            `}
        >
            {/* ── CARD EFFECT LAYERS ─────────────────────────────────────── */}
            {cardEffect && (
                <>
                    {/* Aura background */}
                    <div
                        className={`absolute inset-0 rounded-xl pointer-events-none blur-md bg-gradient-to-br ${cardEffect.preview?.auraClass || ''}`}
                        style={{ opacity: 0.7, zIndex: 0 }}
                    />
                    {/* Ring glow */}
                    <div
                        className={`absolute inset-0 rounded-xl pointer-events-none ${cardEffect.preview?.ringClass || ''} ${cardEffect.preview?.animationClass || ''}`}
                        style={{ zIndex: 0 }}
                    />
                </>
            )}

            {/* ── TRAFFIC LIGHTS ─────────────────────────────────────────── */}
            <div className="absolute top-1 left-1 flex flex-col space-y-0.5 z-20">
                {[
                    { color: 'green',  active: '#22c55e', activeBorder: '#15803d', dimBg: '#bbf7d0', dimBorder: '#4ade80' },
                    { color: 'yellow', active: '#eab308', activeBorder: '#a16207', dimBg: '#fef08a', dimBorder: '#facc15' },
                    { color: 'red',    active: '#ef4444', activeBorder: '#b91c1c', dimBg: '#fecaca', dimBorder: '#f87171' },
                ].map(({ color, active, activeBorder, dimBg, dimBorder }) => {
                    const isActive = behaviorStatus === color;
                    return (
                        <button
                            key={color}
                            onClick={(e) => { e.stopPropagation(); onTrafficLightClick(student, color); }}
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 transition-all ${isActive ? 'shadow-lg scale-110' : ''}`}
                            style={{
                                backgroundColor: isActive ? active : dimBg,
                                borderColor: isActive ? activeBorder : dimBorder,
                            }}
                        />
                    );
                })}
            </div>

            {/* ── ATTENDANCE ────────────────────────────────────────────────── */}
            <button
                onClick={(e) => { e.stopPropagation(); onAttendanceToggle(student); }}
                className={`absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-all z-20 ${
                    todayAttendance === 'present' ? 'bg-green-500 border-green-700 text-white shadow-md'
                    : todayAttendance === 'absent' ? 'bg-red-500 border-red-700 text-white shadow-md'
                    : isDark ? 'bg-slate-700 border-slate-500 hover:bg-slate-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                title={todayAttendance === 'present' ? 'Present' : todayAttendance === 'absent' ? 'Absent' : 'Mark attendance'}
            >
                {todayAttendance === 'present' ? '✓' : todayAttendance === 'absent' ? 'A' : ''}
            </button>

            {/* ── CARD CONTENT ─────────────────────────────────────────────── */}
            <div className="relative z-10 flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mt-1">
                    <img
                        src={avatarImg}
                        alt={student.firstName}
                        className="w-12 h-12 sm:w-14 md:w-16 lg:w-18 sm:h-14 md:h-16 lg:h-18 rounded-full border-2 sm:border-4 border-white shadow-md transition-transform duration-200 hover:scale-105"
                        onMouseEnter={() => onAvatarHover && onAvatarHover(avatarImg, `${student.firstName}'s Avatar`)}
                        onMouseLeave={onHoverEnd}
                    />
                    {/* Level badge */}
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold shadow-sm leading-tight">
                        L{level}
                    </div>
                    {/* Pet */}
                    {petImage && (
                        <img
                            src={petImage.src}
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full absolute -bottom-1 -left-1 border-2 border-white shadow-sm transition-transform duration-200 hover:scale-125"
                            data-fallbacks={serializeFallbacks(petImage.fallbacks)}
                            data-fallback-index="0"
                            onError={petImageErrorHandler}
                            onMouseEnter={() => onPetHover && onPetHover(petImage.src, pet?.name)}
                            onMouseLeave={onHoverEnd}
                        />
                    )}
                </div>

                {/* Name */}
                <h3 className={`text-xs sm:text-sm font-bold mt-1.5 truncate w-full leading-tight ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                    {student.firstName}
                </h3>

                {/* XP + Coins */}
                <div className="flex items-center justify-around w-full mt-1 text-[10px] sm:text-xs gap-1">
                    <span
                        onClick={handleStarClick}
                        className={`font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 select-none ${
                            isDark ? 'text-blue-300 bg-blue-900/60 hover:bg-blue-800/80' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                        }`}
                        title="Click to award 1 XP"
                    >
                        ⭐ {student.totalPoints || 0}
                    </span>
                    <span
                        onClick={handleCoinClick}
                        className={`font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-pointer hover:scale-110 transition-all duration-200 select-none ${
                            isDark ? 'text-yellow-300 bg-yellow-900/60 hover:bg-yellow-800/80' : 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                        }`}
                        title="Click to award 1 coin"
                    >
                        💰 {coins}
                    </span>
                </div>

                {/* XP progress bar */}
                <div className={`w-full rounded-full h-1 sm:h-1.5 mt-1 ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${xpForNext}%` }}
                    />
                </div>

                {/* Title row */}
                <div className="text-[9px] sm:text-[10px] mt-0.5 leading-tight w-full flex items-center justify-center gap-1">
                    {hasClickerData ? (
                        <span className={`font-bold ${titleColor}`}>{clickerAchievements.title}</span>
                    ) : (
                        <span className={`font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Hero</span>
                    )}
                    {/* Effect badge */}
                    {cardEffect && (
                        <span className={`inline-flex items-center rounded-full px-1 text-[8px] sm:text-[9px] font-bold leading-tight
                            ${EFFECT_RARITY_COLORS[cardEffect.rarity]?.bg || 'bg-indigo-500'}
                            ${EFFECT_RARITY_COLORS[cardEffect.rarity]?.text || 'text-white'}`}
                        >
                            ✨
                        </span>
                    )}
                </div>

                {/* Selection checkmark */}
                {isSelected && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-purple-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold shadow-md z-30">
                        ✓
                    </div>
                )}
            </div>
        </div>
    );
};

// ===============================================
// AWARD MODAL COMPONENT
// ===============================================
const AwardModal = ({ isBulk, awardType, onTypeChange, studentCount, student, onSubmit, onClose, isDark }) => {
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('Good Work');
    const title = isBulk ? `Award to ${studentCount} Students` : `Award to ${student?.firstName || ''}`;

    const modalBg  = isDark ? 'bg-slate-800 text-slate-100' : 'bg-white';
    const labelCls = isDark ? 'text-slate-300' : 'text-gray-700';
    const inputCls = isDark
        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500'
        : 'border-gray-300 text-gray-900 focus:ring-blue-500';
    const footerBg = isDark ? 'bg-slate-700' : 'bg-gray-50';
    const cancelCls = isDark
        ? 'bg-slate-600 hover:bg-slate-500 text-slate-100 border-slate-500'
        : 'bg-white hover:bg-gray-100 border-gray-300';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-2xl w-full max-w-md transform ${modalBg}`}>
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
                    <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                    <div className={`grid grid-cols-2 gap-2 p-1 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                        <button
                            onClick={() => onTypeChange('xp')}
                            className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base ${awardType === 'xp' ? 'bg-blue-500 text-white shadow-lg scale-105' : (isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-100')}`}
                        >
                            Award XP ⭐
                        </button>
                        <button
                            onClick={() => onTypeChange('coins')}
                            className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base ${awardType === 'coins' ? 'bg-yellow-500 text-white shadow-lg scale-105' : (isDark ? 'text-slate-300 hover:bg-slate-600' : 'text-gray-600 hover:bg-gray-100')}`}
                        >
                            Award Coins 💰
                        </button>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${labelCls}`}>Amount</label>
                        <input
                            type="number" min="1" value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all text-sm sm:text-base ${inputCls}`}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${labelCls}`}>Reason (Optional)</label>
                        <input
                            type="text" value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition-all text-sm sm:text-base ${inputCls}`}
                        />
                    </div>
                </div>
                <div className={`flex flex-col sm:flex-row gap-2 p-4 sm:p-6 rounded-b-2xl ${footerBg}`}>
                    <button onClick={onClose} className={`w-full sm:flex-1 px-4 py-3 border rounded-lg font-semibold transition-all text-sm sm:text-base ${cancelCls}`}>
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(amount, reason, awardType)}
                        className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-semibold text-white transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                        Confirm Award
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentsTab;
