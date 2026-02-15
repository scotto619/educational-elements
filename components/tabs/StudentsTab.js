// components/tabs/StudentsTab.js - UPDATED WITH TRAFFIC LIGHTS, ATTENDANCE & AUTO-REFRESH
import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PET_IMAGE, getAvatarImage as resolveAvatarImage, getPetImage as resolvePetImage } from '../../utils/gameHelpers';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';

// ===============================================
// HELPER FUNCTIONS (LOCAL FALLBACKS)
// ===============================================
const getGridClasses = (studentCount) => {
    // Mobile-first responsive grid system
    if (studentCount <= 4) return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4';
    if (studentCount <= 8) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
    if (studentCount <= 12) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    if (studentCount <= 18) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9';
    if (studentCount <= 24) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
    if (studentCount <= 32) return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8';
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10';
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
};

const getBehaviorStatusForToday = (status) => {
    if (!status) return null;

    const today = getTodayDate();

    if (typeof status === 'string') {
        return status;
    }

    if (typeof status === 'object') {
        if (status.date === today) {
            return status.value || null;
        }

        if (status[today]) {
            return status[today];
        }
    }

    return null;
};

// Play award sound
const playAwardSound = (type = 'xp') => {
    try {
        const audio = new Audio('/sounds/xp-gain.wav');
        audio.volume = 0.4;
        audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (e) {
        console.log('Sound error:', e);
    }
};

// UPDATED: Get theme border styles for student cards with all new themes
const getThemeBorder = (themeName) => {
    const themeMap = {
        'default': 'border-blue-300',
        'Hero\'s Dawn': 'border-blue-300',
        'Shadow Realm': 'border-purple-400',
        'Elven Grove': 'border-green-400',
        'Dragon\'s Lair': 'border-red-400',
        'Frozen Peaks': 'border-cyan-400',
        'Void Dimension': 'border-indigo-500',
        'Desert Oasis': 'border-yellow-400',
        'Ocean Depths': 'border-blue-500',
        'Mystic Grove': 'border-purple-300',
        'Celestial Realm': 'border-indigo-400',
        'Volcanic Forge': 'border-red-500'
    };
    return themeMap[themeName] || 'border-blue-300';
};

// UPDATED: Get theme background styles with all new themes  
const getThemeBackground = (themeName) => {
    const themeMap = {
        'default': 'bg-blue-50',
        'Hero\'s Dawn': 'bg-blue-50',
        'Shadow Realm': 'bg-purple-50',
        'Elven Grove': 'bg-green-50',
        'Dragon\'s Lair': 'bg-red-50',
        'Frozen Peaks': 'bg-cyan-50',
        'Void Dimension': 'bg-indigo-50',
        'Desert Oasis': 'bg-yellow-50',
        'Ocean Depths': 'bg-blue-100',
        'Mystic Grove': 'bg-purple-100',
        'Celestial Realm': 'bg-indigo-100',
        'Volcanic Forge': 'bg-red-100'
    };
    return themeMap[themeName] || 'bg-blue-50';
};

// Get title colors
const getTitleColor = (title) => {
    const titleColorMap = {
        'Novice': 'text-gray-600',
        'Apprentice': 'text-green-600',
        'Warrior': 'text-blue-600',
        'Hero': 'text-purple-600',
        'Champion': 'text-orange-600',
        'Legend': 'text-yellow-600',
        'Mythic': 'text-pink-600',
        'Ascended': 'text-cyan-600',
        'Divine': 'text-yellow-600',
        'Eternal': 'text-purple-600'
    };
    return titleColorMap[title] || 'text-gray-600';
};

// ===============================================
// MOBILE-OPTIMIZED AWARD NOTIFICATION POPUP
// ===============================================
const AwardNotification = ({ notification, onClose }) => {
    if (!notification) return null;

    const { students, amount, type, isBulk } = notification;
    const isCoins = type === 'coins';
    const icon = isCoins ? '💰' : '⭐';
    const color = isCoins ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-purple-500';
    const typeText = isCoins ? 'Coins' : 'XP';

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-sm sm:max-w-md w-full transform animate-bounce`}>
                <div className="text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-200 text-xl sm:text-2xl font-bold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center"
                        style={{ position: 'absolute' }}
                    >
                        ×
                    </button>

                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">{icon}</div>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                        {isBulk ? 'BULK AWARD!' : 'AWARD GIVEN!'}
                    </h2>

                    <div className="bg-white bg-opacity-20 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="text-xl sm:text-2xl font-bold mb-2">
                            +{amount} {typeText}
                        </div>
                        {isBulk ? (
                            <div className="text-base sm:text-lg">
                                Awarded to {students.length} students!
                            </div>
                        ) : (
                            <div className="text-base sm:text-lg">
                                Awarded to <strong>{students[0]?.firstName}</strong>!
                            </div>
                        )}
                    </div>

                    {isBulk && students.length > 1 && (
                        <div className="text-xs sm:text-sm opacity-90">
                            {students.slice(0, 3).map(s => s.firstName).join(', ')}
                            {students.length > 3 && ` +${students.length - 3} more`}
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="mt-3 sm:mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 font-semibold hover:scale-105 transform text-sm sm:text-base"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// MOBILE-OPTIMIZED CONTEXT MENU COMPONENT
// ===============================================
const ContextMenu = ({ student, position, onAward, onView, onAvatar, onClose, getAvatarImage, calculateAvatarLevel }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Mobile-responsive positioning
    const isMobile = window.innerWidth < 640;
    const menuStyle = isMobile ? {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60
    } : {
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 50
    };

    return (
        <div ref={menuRef} className="bg-white w-56 sm:w-64 rounded-xl shadow-2xl border border-gray-200 p-2 sm:p-3 animate-fade-in-fast" style={menuStyle}>
            <div className="flex items-center p-2 sm:p-3 border-b mb-2">
                <img src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3" />
                <span className="font-bold text-gray-800 text-sm sm:text-base">{student.firstName}</span>
            </div>
            <ul className="text-gray-700">
                <li onClick={onAward} className="flex items-center px-3 py-2 sm:py-3 text-sm sm:text-base rounded-md hover:bg-blue-500 hover:text-white cursor-pointer transition-colors">
                    <span className="mr-3 text-lg">🏆</span> Award XP / Coins
                </li>
                <li onClick={onView} className="flex items-center px-3 py-2 sm:py-3 text-sm sm:text-base rounded-md hover:bg-purple-500 hover:text-white cursor-pointer transition-colors">
                    <span className="mr-3 text-lg">📜</span> View Character Sheet
                </li>
                <li onClick={onAvatar} className="flex items-center px-3 py-2 sm:py-3 text-sm sm:text-base rounded-md hover:bg-green-500 hover:text-white cursor-pointer transition-colors">
                    <span className="mr-3 text-lg">🎭</span> Change Avatar
                </li>
            </ul>
        </div>
    );
};

// ===============================================
// MOBILE-OPTIMIZED HOVER PREVIEW COMPONENT
// ===============================================
const HoverPreview = ({ preview, position }) => {
    if (!preview) return null;

    if (typeof window === 'undefined') return null;

    // Don't show hover previews on mobile (touch devices)
    const supportsMatchMedia = typeof window.matchMedia === 'function';
    const isMobile = (supportsMatchMedia && window.matchMedia('(hover: none)').matches) || window.innerWidth < 640;
    if (isMobile) return null;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const previewWidth = viewportWidth >= 1024 ? 208 : 192;
    const previewHeight = viewportWidth >= 1024 ? 248 : 216;
    const edgePadding = 16;
    const offsetX = 20;

    let left = position.x + offsetX;
    if (left + previewWidth + edgePadding > viewportWidth) {
        left = Math.max(edgePadding, position.x - previewWidth - offsetX);
    }
    left = Math.max(edgePadding, Math.min(left, viewportWidth - previewWidth - edgePadding));

    let top = position.y - previewHeight / 2;
    if (top < edgePadding) {
        top = edgePadding;
    } else if (top + previewHeight + edgePadding > viewportHeight) {
        top = Math.max(edgePadding, viewportHeight - previewHeight - edgePadding);
    }

    return (
        <div
            className="fixed pointer-events-none z-[100] bg-white rounded-lg shadow-2xl p-3 border-2 border-blue-300 transition-transform duration-200 ease-out"
            style={{ left, top, transform: 'scale(1)' }}
        >
            <img src={preview.image} alt="Preview" className="w-32 sm:w-48 h-32 sm:h-48 rounded-lg" />
            <p className="text-center font-bold mt-2 text-gray-800 text-sm sm:text-base">{preview.text}</p>
        </div>
    );
};

// ===============================================
// MAIN STUDENTS TAB COMPONENT - MOBILE OPTIMIZED
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
    calculateAvatarLevel: propCalculateAvatarLevel
}) => {
    // Use passed functions or fallback to local ones
    const getAvatarImageFunc = propGetAvatarImage || ((avatarBase, level) => resolveAvatarImage(avatarBase, level));

    const getPetImageFunc = propGetPetImage || ((pet) => {
        return resolvePetImage(pet);
    });

    const calculateCoinsFunc = propCalculateCoins || ((student) => Math.max(0, Math.floor((student?.totalPoints || 0) / 5) + (student?.currency || 0) - (student?.coinsSpent || 0)));
    const calculateAvatarLevelFunc = propCalculateAvatarLevel || ((xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1));

    // States
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

        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        handleFullscreenChange();

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (typeof document === 'undefined') return;

        const exitFullscreen = () => {
            if (typeof document.exitFullscreen === 'function') {
                document.exitFullscreen().catch(() => { });
            } else if (typeof document.webkitExitFullscreen === 'function') {
                document.webkitExitFullscreen();
            }
        };

        if (document.fullscreenElement) {
            exitFullscreen();
            return;
        }

        const element = containerRef.current || document.documentElement;
        if (!element) return;

        const request = element.requestFullscreen || element.webkitRequestFullscreen || element.mozRequestFullScreen || element.msRequestFullscreen;
        if (typeof request === 'function') {
            request.call(element).catch(() => { });
        }
    };

    // Auto-refresh when tab becomes visible
    useEffect(() => {
        console.log('📊 Students tab refreshed - student data updated');
        setRefreshKey(prev => prev + 1);
    }, [students]);

    const filteredStudents = students.filter(student =>
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    const handleStudentClick = (e, student) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, student });
    };
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

            setAwardNotification({
                students: awardedStudents,
                amount: amount,
                type: type,
                isBulk: awardModal.isBulk,
                reason: reason
            });

        } finally {
            setAwardModal({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null });
            if (awardModal.isBulk) setSelectedStudents([]);
        }
    };

    const closeAwardNotification = () => {
        setAwardNotification(null);
    };

    const handleQuickAward = (student, type) => {
        const amount = 1;
        const awardedStudents = [student];

        onBulkAward([student.id], amount, type);
        playAwardSound(type);

        setAwardNotification({
            students: awardedStudents,
            amount: amount,
            type: type,
            isBulk: false,
            reason: 'Quick Award'
        });
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // NEW: Handle traffic light click
    const handleTrafficLightClick = (student, color) => {
        const today = getTodayDate();
        const currentStatus = getBehaviorStatusForToday(student.behaviorStatus);
        const nextStatus = currentStatus === color ? null : { date: today, value: color };

        onUpdateStudent(student.id, { behaviorStatus: nextStatus });
    };

    // NEW: Handle attendance toggle
    const handleAttendanceToggle = (student) => {
        const today = getTodayDate();
        const currentAttendance = student.attendance?.[today];

        let newStatus;
        if (!currentAttendance) {
            newStatus = 'present';
        } else if (currentAttendance === 'present') {
            newStatus = 'absent';
        } else {
            newStatus = null;
        }

        const updatedAttendance = {
            ...(student.attendance || {}),
            [today]: newStatus
        };

        // Remove null entries to keep data clean
        if (newStatus === null) {
            delete updatedAttendance[today];
        }

        onUpdateStudent(student.id, { attendance: updatedAttendance });
    };

    return (
        <div ref={containerRef} className="space-y-4 sm:space-y-6" onMouseMove={handleMouseMove}>
            {/* MOBILE-OPTIMIZED HEADER */}
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-gray-200">
                {/* Mobile Layout - Stacked */}
                <div className="flex flex-col space-y-3 sm:hidden">
                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                    />

                    {/* Mobile Status */}
                    <div className="text-center text-sm text-gray-600 font-medium">
                        {selectedStudents.length > 0
                            ? `${selectedStudents.length} student(s) selected`
                            : 'Tap avatar for options • Star/coin to award'
                        }
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex space-x-2">
                        <button
                            onClick={handleSelectAll}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                            {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedStudents.length > 0 && (
                            <button
                                onClick={() => setAwardModal({ visible: true, isBulk: true, type: 'xp', studentId: null, student: null })}
                                className="flex-1 bg-purple-600 text-white font-bold px-3 py-2 rounded-lg text-sm"
                            >
                                Award Bulk
                            </button>
                        )}
                        <button
                            onClick={onAddStudent}
                            className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
                        >
                            + Add
                        </button>
                    </div>
                </div>

                {/* Desktop Layout - Single Row */}
                <div className="hidden sm:flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-auto pl-4 pr-4 py-2 border rounded-lg"
                        />
                        <button
                            onClick={handleSelectAll}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg whitespace-nowrap"
                        >
                            {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="text-gray-600 font-semibold text-sm lg:text-base">
                        {selectedStudents.length > 0
                            ? `${selectedStudents.length} student(s) selected`
                            : 'Click avatar for options • Star/coin to quick award • Shift+click to select • Drag to reorder'
                        }
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleFullscreen}
                            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all"
                            type="button"
                            aria-pressed={isFullscreen}
                        >
                            <span aria-hidden="true">{isFullscreen ? '🗗' : '⛶'}</span>
                            {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                        </button>
                        {selectedStudents.length > 0 && (
                            <button
                                onClick={() => setAwardModal({ visible: true, isBulk: true, type: 'xp', studentId: null, student: null })}
                                className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105 text-sm lg:text-base"
                            >
                                🏆 Award Bulk
                            </button>
                        )}
                        <button
                            onClick={onAddStudent}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
                        >
                            + Add Student
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE-OPTIMIZED STUDENT GRID */}
            <div className={`grid ${getGridClasses(filteredStudents.length)} gap-2 sm:gap-3 md:gap-4`} key={refreshKey}>
                {filteredStudents.map((student) => (
                    <StudentCard
                        key={student.id}
                        student={student}
                        isSelected={selectedStudents.includes(student.id)}
                        isDragged={draggedStudentId === student.id}
                        onClick={(e) => handleStudentClick(e, student)}
                        onDragStart={(e) => handleDragStart(e, student.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, student.id)}
                        onAvatarHover={(img, text) => setHoverPreview({ image: img, text: text })}
                        onPetHover={(img, text) => setHoverPreview({ image: img, text: text })}
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

            <AwardNotification
                notification={awardNotification}
                onClose={closeAwardNotification}
            />

            <HoverPreview preview={hoverPreview} position={mousePosition} />

            {contextMenu.visible && (
                <ContextMenu
                    student={contextMenu.student}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onAward={() => {
                        setAwardModal({ visible: true, isBulk: false, type: 'xp', studentId: contextMenu.student.id, student: contextMenu.student });
                        closeContextMenu();
                    }}
                    onView={() => {
                        onViewDetails(contextMenu.student);
                        closeContextMenu();
                    }}
                    onAvatar={() => {
                        closeContextMenu();
                    }}
                    onClose={closeContextMenu}
                    getAvatarImage={getAvatarImageFunc}
                    calculateAvatarLevel={calculateAvatarLevelFunc}
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
                />
            )}
        </div>
    );
};

// ===============================================
// MOBILE-OPTIMIZED STUDENT CARD COMPONENT - WITH TRAFFIC LIGHTS & ATTENDANCE
// ===============================================
const StudentCard = ({
    student,
    isSelected,
    isDragged,
    onClick,
    onDragStart,
    onDragOver,
    onDrop,
    onAvatarHover,
    onPetHover,
    onHoverEnd,
    getAvatarImage,
    getPetImage,
    calculateCoins,
    calculateAvatarLevel,
    onQuickAward,
    onToggleSelection,
    onTrafficLightClick,
    onAttendanceToggle
}) => {
    const level = calculateAvatarLevel(student.totalPoints);
    const coins = calculateCoins(student);
    const xpForNextLevel = (student.totalPoints || 0) % 100;
    const avatarImg = getAvatarImage(student.avatarBase, level);
    const pet = student.ownedPets?.[0];
    const petImage = pet ? normalizeImageSource(getPetImage(pet), DEFAULT_PET_IMAGE) : null;
    const petImageErrorHandler = createImageErrorHandler(DEFAULT_PET_IMAGE);

    // Get today's attendance
    const today = getTodayDate();
    const todayAttendance = student.attendance?.[today];
    const behaviorStatus = getBehaviorStatusForToday(student.behaviorStatus);

    // Get clicker data from clickerGameData
    const clickerGameData = student.clickerGameData || null;
    const hasClickerData = clickerGameData && clickerGameData.activeTheme;

    let clickerAchievements = null;
    if (hasClickerData) {
        const themeNameMap = {
            'default': 'Hero\'s Dawn',
            'dark': 'Shadow Realm',
            'forest': 'Elven Grove',
            'fire': 'Dragon\'s Lair',
            'ice': 'Frozen Peaks',
            'cosmic': 'Void Dimension',
            'desert': 'Desert Oasis',
            'ocean': 'Ocean Depths',
            'mystic': 'Mystic Grove',
            'celestial': 'Celestial Realm',
            'volcanic': 'Volcanic Forge'
        };

        clickerAchievements = {
            title: clickerGameData.activeTitle || 'Novice',
            themeName: themeNameMap[clickerGameData.activeTheme] || 'Hero\'s Dawn',
            theme: clickerGameData.activeTheme || 'default',
            totalGold: clickerGameData.totalGold || 0,
            prestige: clickerGameData.prestige || 0,
            lastPlayed: clickerGameData.lastSave || Date.now()
        };
    }

    const handleStarClick = (e) => {
        e.stopPropagation();
        onQuickAward(student, 'xp');
    };

    const handleCoinClick = (e) => {
        e.stopPropagation();
        onQuickAward(student, 'coins');
    };

    const handleCardClick = (e) => {
        if (e.shiftKey) {
            e.preventDefault();
            onToggleSelection(student.id);
        } else {
            onClick(e);
        }
    };

    const handleTrafficLightClickInternal = (e, color) => {
        e.stopPropagation();
        onTrafficLightClick(student, color);
    };

    const handleAttendanceClickInternal = (e) => {
        e.stopPropagation();
        onAttendanceToggle(student);
    };

    // Apply theme styling when clicker data exists
    const themeBorder = hasClickerData
        ? getThemeBorder(clickerAchievements.themeName)
        : 'border-gray-200';

    const themeBackground = hasClickerData
        ? getThemeBackground(clickerAchievements.themeName)
        : (isSelected ? 'bg-purple-100' : 'bg-white');

    const titleColor = hasClickerData
        ? getTitleColor(clickerAchievements.title)
        : 'text-gray-600';

    const achievementBorderClass = hasClickerData
        ? `border-4 ${themeBorder} shadow-lg`
        : 'border-2 border-gray-200';

    return (
        <div
            draggable="true"
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={handleCardClick}
            className={`relative p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${achievementBorderClass} ${isSelected
                    ? `border-purple-500 bg-purple-100 scale-105 shadow-purple-200`
                    : `${themeBackground} hover:border-blue-400 hover:shadow-xl`
                } ${isDragged ? 'opacity-30 ring-2 ring-blue-500' : ''
                }`}
        >
            {/* TRAFFIC LIGHTS - Top Left Corner */}
            <div className="absolute top-1 left-1 flex flex-col space-y-0.5 z-10">
                <button
                    onClick={(e) => handleTrafficLightClickInternal(e, 'green')}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${behaviorStatus === 'green'
                            ? 'bg-green-500 border-green-700 shadow-lg scale-110'
                            : 'bg-green-200 border-green-400 hover:bg-green-300'
                        }`}
                />
                <button
                    onClick={(e) => handleTrafficLightClickInternal(e, 'yellow')}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${behaviorStatus === 'yellow'
                            ? 'bg-yellow-500 border-yellow-700 shadow-lg scale-110'
                            : 'bg-yellow-200 border-yellow-400 hover:bg-yellow-300'
                        }`}
                />
                <button
                    onClick={(e) => handleTrafficLightClickInternal(e, 'red')}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 transition-all ${behaviorStatus === 'red'
                            ? 'bg-red-500 border-red-700 shadow-lg scale-110'
                            : 'bg-red-200 border-red-400 hover:bg-red-300'
                        }`}
                />
            </div>

            {/* ATTENDANCE BUTTON - Top Right Corner */}
            <button
                onClick={handleAttendanceClickInternal}
                className={`absolute top-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-all z-10 ${todayAttendance === 'present'
                        ? 'bg-green-500 border-green-700 text-white shadow-md'
                        : todayAttendance === 'absent'
                            ? 'bg-red-500 border-red-700 text-white shadow-md'
                            : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                    }`}
                title={todayAttendance === 'present' ? 'Present' : todayAttendance === 'absent' ? 'Absent' : 'Mark attendance'}
            >
                {todayAttendance === 'present' ? '✓' : todayAttendance === 'absent' ? 'A' : ''}
            </button>

            <div className="flex flex-col items-center text-center">
                <div className="relative">
                    <img
                        src={avatarImg}
                        alt={student.firstName}
                        className="w-12 h-12 sm:w-16 md:w-20 lg:w-20 sm:h-16 md:h-20 lg:h-20 rounded-full border-2 sm:border-4 border-white shadow-md transition-transform duration-200 hover:scale-105"
                        onMouseEnter={() => onAvatarHover && onAvatarHover(avatarImg, `${student.firstName}'s Avatar`)}
                        onMouseLeave={onHoverEnd}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 rounded-full font-bold shadow-sm">
                        L{level}
                    </div>
                    {petImage && (
                        <img
                            src={petImage.src}
                            className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 rounded-full absolute -bottom-1 -left-1 border-1 sm:border-2 border-white shadow-sm transition-transform duration-200 hover:scale-125"
                            data-fallbacks={serializeFallbacks(petImage.fallbacks)}
                            data-fallback-index="0"
                            onError={petImageErrorHandler}
                            onMouseEnter={() => onPetHover && onPetHover(petImage.src, pet?.name)}
                            onMouseLeave={onHoverEnd}
                        />
                    )}
                </div>

                <h3 className="text-xs sm:text-sm md:text-md font-bold text-gray-800 mt-1 sm:mt-2 truncate w-full leading-tight">
                    {student.firstName}
                </h3>

                <div className="flex items-center justify-around w-full mt-1 sm:mt-2 text-[10px] sm:text-xs">
                    <span
                        onClick={handleStarClick}
                        className="font-semibold text-blue-600 bg-blue-50 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-pointer hover:bg-blue-100 hover:scale-110 transition-all duration-200 select-none"
                        title="Click to award 1 XP"
                    >
                        ⭐ {student.totalPoints || 0}
                    </span>
                    <span
                        onClick={handleCoinClick}
                        className="font-semibold text-yellow-600 bg-yellow-50 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-pointer hover:bg-yellow-100 hover:scale-110 transition-all duration-200 select-none"
                        title="Click to award 1 coin"
                    >
                        💰 {coins}
                    </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 mt-1 sm:mt-1.5">
                    <div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-1 sm:h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${xpForNextLevel}%` }}
                    ></div>
                </div>

                {isSelected && (
                    <div className="absolute top-1 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold">
                        ✓
                    </div>
                )}

                {/* Show hero title or "Common Hero" */}
                <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    {hasClickerData ? (
                        <div className={`${titleColor} font-bold leading-tight`}>
                            {clickerAchievements.title}
                        </div>
                    ) : (
                        <div className="text-gray-500 font-medium leading-tight">
                            Common Hero
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ===============================================
// MOBILE-OPTIMIZED AWARD MODAL COMPONENT
// ===============================================
const AwardModal = ({ isBulk, awardType, onTypeChange, studentCount, student, onSubmit, onClose }) => {
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('Good Work');
    const title = isBulk ? `Award to ${studentCount} Students` : `Award to ${student?.firstName || ''}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-scale-in">
                <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
                    <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg">
                        <button
                            onClick={() => onTypeChange('xp')}
                            className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base ${awardType === 'xp'
                                    ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Award XP ⭐
                        </button>
                        <button
                            onClick={() => onTypeChange('coins')}
                            className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm sm:text-base ${awardType === 'coins'
                                    ? 'bg-yellow-500 text-white shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Award Coins 💰
                        </button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="w-full sm:flex-1 px-4 py-3 border rounded-lg bg-white hover:bg-gray-100 font-semibold transition-all duration-200 text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(amount, reason, awardType)}
                        className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                        Confirm Award
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentsTab;