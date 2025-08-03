// components/tabs/StudentsTab.js - WITH AWARD NOTIFICATIONS (COMPLETE FILE)
import React, { useState, useEffect, useRef } from 'react';

// ===============================================
// HELPER FUNCTIONS (LOCAL FALLBACKS)
// ===============================================
const getGridClasses = (studentCount) => {
    if (studentCount <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
    if (studentCount <= 12) return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    if (studentCount <= 18) return 'grid-cols-3 md:grid-cols-5 lg:grid-cols-9';
    if (studentCount <= 24) return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12';
    if (studentCount <= 32) return 'grid-cols-4 md:grid-cols-7 lg:grid-cols-12';
    return 'grid-cols-5 md:grid-cols-8 lg:grid-cols-12';
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

// ===============================================
// AWARD NOTIFICATION POPUP COMPONENT
// ===============================================
const AwardNotification = ({ notification, onClose }) => {
    if (!notification) return null;

    const { students, amount, type, isBulk } = notification;
    const isCoins = type === 'coins';
    const icon = isCoins ? '💰' : '⭐';
    const color = isCoins ? 'from-yellow-400 to-orange-500' : 'from-blue-400 to-purple-500';
    const typeText = isCoins ? 'Coins' : 'XP';

    useEffect(() => {
        // Auto-close after 4 seconds
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className={`bg-gradient-to-br ${color} text-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform animate-bounce`}>
                <div className="text-center">
                    {/* Celebration Header */}
                    <div className="text-6xl mb-4 animate-pulse">{icon}</div>
                    <h2 className="text-3xl font-bold mb-4">
                        {isBulk ? '🎉 BULK AWARD! 🎉' : '🎉 AWARD GIVEN! 🎉'}
                    </h2>
                    
                    {/* Award Details */}
                    <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
                        <div className="text-2xl font-bold mb-2">
                            +{amount} {typeText}
                        </div>
                        {isBulk ? (
                            <div className="text-lg">
                                Awarded to {students.length} students!
                            </div>
                        ) : (
                            <div className="text-lg">
                                Awarded to <strong>{students[0]?.firstName}</strong>!
                            </div>
                        )}
                    </div>

                    {/* Student Names (for bulk awards, show first few) */}
                    {isBulk && students.length > 1 && (
                        <div className="text-sm opacity-90">
                            {students.slice(0, 3).map(s => s.firstName).join(', ')}
                            {students.length > 3 && ` +${students.length - 3} more`}
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-xl transition-all duration-300 font-semibold"
                    >
                        Awesome! ✨
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// CONTEXT MENU COMPONENT
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

    return (
        <div ref={menuRef} className="fixed z-50 bg-white w-56 rounded-xl shadow-2xl border border-gray-200 p-2 animate-fade-in-fast" style={{ top: position.y, left: position.x }}>
            <div className="flex items-center p-2 border-b mb-2">
                <img src={getAvatarImage(student.avatarBase, calculateAvatarLevel(student.totalPoints))} className="w-10 h-10 rounded-full mr-3" />
                <span className="font-bold text-gray-800">{student.firstName}</span>
            </div>
            <ul className="text-gray-700">
                <li onClick={onAward} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-500 hover:text-white cursor-pointer"><span className="mr-3">🏆</span> Award XP / Coins</li>
                <li onClick={onView} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-purple-500 hover:text-white cursor-pointer"><span className="mr-3">📜</span> View Character Sheet</li>
                <li onClick={onAvatar} className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-green-500 hover:text-white cursor-pointer"><span className="mr-3">🎭</span> Change Avatar</li>
            </ul>
        </div>
    );
};

// ===============================================
// HOVER PREVIEW COMPONENT
// ===============================================
const HoverPreview = ({ preview, position }) => {
    if (!preview) return null;
    return (
        <div
            className="fixed pointer-events-none z-[100] bg-white rounded-lg shadow-2xl p-3 border-2 border-blue-300 transition-transform duration-200 ease-out"
            style={{ left: position.x + 20, top: position.y - 100, transform: 'scale(1)' }}
        >
            <img src={preview.image} alt="Preview" className="w-48 h-48 rounded-lg" />
            <p className="text-center font-bold mt-2 text-gray-800">{preview.text}</p>
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
    calculateAvatarLevel: propCalculateAvatarLevel
}) => {
    // Use passed functions or fallback to local ones
    const getAvatarImageFunc = propGetAvatarImage || ((avatarBase, level) => `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`);
    
    // FIXED: Use the proper function signature for getPetImage - expecting a pet object, not separate parameters
    const getPetImageFunc = propGetPetImage || ((pet) => {
        if (!pet) return '/Pets/Wizard.png';
        const key = (pet.type || pet.name || '').toLowerCase();
        const map = { 'alchemist': '/Pets/Alchemist.png', 'barbarian': '/Pets/Barbarian.png', 'bard': '/Pets/Bard.png', 'beastmaster': '/Pets/Beastmaster.png', 'cleric': '/Pets/Cleric.png', 'crystal knight': '/Pets/Crystal Knight.png', 'crystal sage': '/Pets/Crystal Sage.png', 'engineer': '/Pets/Engineer.png', 'frost mage': '/Pets/Frost Mage.png', 'illusionist': '/Pets/Illusionist.png', 'knight': '/Pets/Knight.png', 'lightning': '/Pets/Lightning.png', 'monk': '/Pets/Monk.png', 'necromancer': '/Pets/Necromancer.png', 'rogue': '/Pets/Rogue.png', 'stealth': '/Pets/Stealth.png', 'time knight': '/Pets/Time Knight.png', 'warrior': '/Pets/Warrior.png', 'wizard': '/Pets/Wizard.png', 'dragon': '/Pets/Lightning.png', 'phoenix': '/Pets/Crystal Sage.png', 'unicorn': '/Pets/Time Knight.png', 'wolf': '/Pets/Warrior.png', 'owl': '/Pets/Wizard.png', 'cat': '/Pets/Rogue.png', 'tiger': '/Pets/Barbarian.png', 'bear': '/Pets/Beastmaster.png', 'lion': '/Pets/Knight.png', 'eagle': '/Pets/Stealth.png' };
        return map[key] || '/Pets/Wizard.png';
    });
    
    const calculateCoinsFunc = propCalculateCoins || ((student) => Math.max(0, Math.floor((student?.totalPoints || 0) / 5) + (student?.currency || 0) - (student?.coinsSpent || 0)));
    const calculateAvatarLevelFunc = propCalculateAvatarLevel || ((xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1));
    
    // States
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, student: null });
    const [draggedStudentId, setDraggedStudentId] = useState(null);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [awardModal, setAwardModal] = useState({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null });
    const [hoverPreview, setHoverPreview] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    // NEW: Award notification state
    const [awardNotification, setAwardNotification] = useState(null);
    
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

    // UPDATED: Enhanced award submit with notification
    const handleAwardSubmit = (amount, reason, type) => {
        try {
            const targetIds = awardModal.isBulk ? selectedStudents : [awardModal.studentId];
            const awardedStudents = students.filter(student => targetIds.includes(student.id));
            
            // Call the original award function
            onBulkAward(targetIds, amount, type);
            
            // Play sound effect
            playAwardSound(type);
            
            // Show notification popup
            setAwardNotification({
                students: awardedStudents,
                amount: amount,
                type: type,
                isBulk: awardModal.isBulk,
                reason: reason
            });
            
        } finally {
            // Close award modal
            setAwardModal({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null });
            if (awardModal.isBulk) setSelectedStudents([]);
        }
    };

    // Close award notification
    const closeAwardNotification = () => {
        setAwardNotification(null);
    };
    
    return (
        <div className="space-y-6" onMouseMove={handleMouseMove}>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-auto pl-4 pr-4 py-2 border rounded-lg" />
                    <button onClick={handleSelectAll} className="bg-blue-500 text-white px-4 py-2 rounded-lg whitespace-nowrap">{selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}</button>
                </div>
                <div className="text-gray-600 font-semibold">{selectedStudents.length > 0 ? `${selectedStudents.length} student(s) selected` : 'Click an avatar for options or drag to reorder'}</div>
                <div className="flex items-center gap-2">
                    {selectedStudents.length > 0 && (<button onClick={() => setAwardModal({ visible: true, isBulk: true, type: 'xp', studentId: null, student: null })} className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-105">🏆 Award Bulk</button>)}
                    <button onClick={() => setShowCategoriesModal(true)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-all">⚙️ Categories</button>
                    <button onClick={onAddStudent} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all">+ Add Student</button>
                </div>
            </div>

            <div className={`grid ${getGridClasses(filteredStudents.length)} gap-4`}>
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
                        onSelect={(studentId) => {
                            setSelectedStudents(prev => 
                                prev.includes(studentId) 
                                    ? prev.filter(id => id !== studentId)
                                    : [...prev, studentId]
                            );
                        }}
                    />
                ))}
            </div>

            {/* Award Notification Popup */}
            <AwardNotification 
                notification={awardNotification} 
                onClose={closeAwardNotification} 
            />

            <HoverPreview preview={hoverPreview} position={mousePosition} />
            {contextMenu.visible && <ContextMenu student={contextMenu.student} position={{ x: contextMenu.x, y: contextMenu.y }} onAward={() => { setAwardModal({ visible: true, isBulk: false, type: 'xp', studentId: contextMenu.student.id, student: contextMenu.student }); closeContextMenu(); }} onView={() => { onViewDetails(contextMenu.student); closeContextMenu(); }} onAvatar={() => { /* Avatar modal logic */ closeContextMenu(); }} onClose={closeContextMenu} getAvatarImage={getAvatarImageFunc} calculateAvatarLevel={calculateAvatarLevelFunc} />}
            {awardModal.visible && <AwardModal isBulk={awardModal.isBulk} awardType={awardModal.type} onTypeChange={(newType) => setAwardModal(prev => ({ ...prev, type: newType }))} studentCount={selectedStudents.length} student={awardModal.student} onSubmit={handleAwardSubmit} onClose={() => setAwardModal({ visible: false, isBulk: false, type: 'xp', studentId: null, student: null })} />}
            {showCategoriesModal && <CategoriesModal categories={xpCategories} onSave={onUpdateCategories} onClose={() => setShowCategoriesModal(false)} />}
        </div>
    );
};

// ===============================================
// STUDENT CARD COMPONENT
// ===============================================
const StudentCard = ({ student, isSelected, isDragged, onClick, onDragStart, onDragOver, onDrop, onAvatarHover, onPetHover, onHoverEnd, getAvatarImage, getPetImage, calculateCoins, calculateAvatarLevel, onSelect }) => {
    const level = calculateAvatarLevel(student.totalPoints);
    const coins = calculateCoins(student);
    const xpForNextLevel = (student.totalPoints || 0) % 100;
    const avatarImg = getAvatarImage(student.avatarBase, level);
    const pet = student.ownedPets?.[0];
    
    // FIXED: Pass the entire pet object to getPetImage, not separate parameters
    const petImg = pet ? getPetImage(pet) : null;

    return (
        <div 
            draggable="true" 
            onDragStart={onDragStart} 
            onDragOver={onDragOver} 
            onDrop={onDrop} 
            onClick={onClick} 
            className={`p-3 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                isSelected 
                    ? 'border-purple-500 bg-purple-100 scale-105 shadow-purple-200' 
                    : 'border-transparent bg-white hover:border-blue-400 hover:bg-blue-50'
            } ${
                isDragged ? 'opacity-30 ring-2 ring-blue-500' : ''
            }`}
        >
            <div className="flex flex-col items-center text-center">
                <div className="relative">
                    <img 
                        src={avatarImg} 
                        alt={student.firstName} 
                        className="w-20 h-20 rounded-full border-4 border-white shadow-md transition-transform duration-200 hover:scale-105" 
                        onMouseEnter={() => onAvatarHover(avatarImg, `${student.firstName}'s Avatar`)} 
                        onMouseLeave={onHoverEnd} 
                    />
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">L{level}</div>
                    {pet && (
                        <img 
                            src={petImg} 
                            className="w-8 h-8 rounded-full absolute -bottom-1 -left-1 border-2 border-white shadow-sm transition-transform duration-200 hover:scale-125" 
                            onMouseEnter={() => onPetHover(petImg, pet.name)} 
                            onMouseLeave={onHoverEnd}
                        />
                    )}
                </div>
                <h3 className="text-md font-bold text-gray-800 mt-2 truncate w-full">{student.firstName}</h3>
                <div className="flex items-center justify-around w-full mt-2 text-xs">
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">⭐ {student.totalPoints || 0}</span>
                    <span className="font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">💰 {coins}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                    <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${xpForNextLevel}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

// ===============================================
// MODAL COMPONENTS
// ===============================================
const AwardModal = ({ isBulk, awardType, onTypeChange, studentCount, student, onSubmit, onClose }) => {
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('Good Work');
    const title = isBulk ? `Award to ${studentCount} Students` : `Award to ${student?.firstName || ''}`;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-scale-in">
                <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold">{title}</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg">
                        <button 
                            onClick={() => onTypeChange('xp')} 
                            className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                                awardType === 'xp' 
                                    ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Award XP ⭐
                        </button>
                        <button 
                            onClick={() => onTypeChange('coins')} 
                            className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
                                awardType === 'coins' 
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                        <input 
                            type="text" 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                    <button 
                        onClick={onClose} 
                        className="flex-1 px-4 py-3 border rounded-lg bg-white hover:bg-gray-100 font-semibold transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSubmit(amount, reason, awardType)} 
                        className="flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        🎁 Confirm Award
                    </button>
                </div>
            </div>
        </div>
    );
};

const CategoriesModal = ({ categories, onSave, onClose }) => {
    const [localCategories, setLocalCategories] = useState(JSON.parse(JSON.stringify(categories)));
    const handleUpdate = (id, field, value) => setLocalCategories(localCategories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
    const handleAdd = () => setLocalCategories([...localCategories, { id: Date.now(), label: 'New Category', amount: 1, icon: '🌟', color: 'bg-gray-500' }]);
    const handleDelete = (id) => setLocalCategories(localCategories.filter(cat => cat.id !== id));
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl">
                    <h2 className="text-2xl font-bold">Manage XP Categories</h2>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto flex-grow">
                    {localCategories.map(cat => (
                        <div key={cat.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 p-3 rounded-lg">
                            <input 
                                value={cat.icon} 
                                onChange={e => handleUpdate(cat.id, 'icon', e.target.value)} 
                                className="col-span-1 p-2 border rounded-lg text-center"
                            />
                            <input 
                                value={cat.label} 
                                onChange={e => handleUpdate(cat.id, 'label', e.target.value)} 
                                className="col-span-6 p-2 border rounded-lg"
                            />
                            <input 
                                type="number" 
                                value={cat.amount} 
                                onChange={e => handleUpdate(cat.id, 'amount', Number(e.target.value))} 
                                className="col-span-2 p-2 border rounded-lg"
                            />
                            <button 
                                onClick={() => handleDelete(cat.id)} 
                                className="col-span-3 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-sm transition-all duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                    <button 
                        onClick={handleAdd} 
                        className="w-full mt-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg py-2 hover:bg-gray-100 transition-all duration-200"
                    >
                        + Add Category
                    </button>
                </div>
                <div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl">
                    <button 
                        onClick={onClose} 
                        className="flex-1 py-3 border rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onSave(localCategories); onClose(); }} 
                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentsTab;