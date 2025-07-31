// components/tabs/StudentsTab.js - DEFINITIVE FINAL VERSION
import React, { useState, useEffect, useRef } from 'react';

// ===============================================
// HELPER FUNCTIONS
// ===============================================
const getAvatarImage = (avatarBase, level) => `/avatars/${avatarBase || 'Wizard F'}/Level ${Math.max(1, Math.min(level || 1, 4))}.png`;
const calculateAvatarLevel = (xp) => (xp >= 300 ? 4 : xp >= 200 ? 3 : xp >= 100 ? 2 : 1);
const calculateCoins = (student) => Math.max(0, Math.floor((student?.totalPoints || 0) / 5) + (student?.currency || 0) - (student?.coinsSpent || 0));
const getPetImage = (petType, petName) => {
    const key = (petType || petName || '').toLowerCase();
    const map = { 'alchemist': '/Pets/Alchemist.png', 'barbarian': '/Pets/Barbarian.png', 'bard': '/Pets/Bard.png', 'beastmaster': '/Pets/Beastmaster.png', 'cleric': '/Pets/Cleric.png', 'crystal knight': '/Pets/Crystal Knight.png', 'crystal sage': '/Pets/Crystal Sage.png', 'engineer': '/Pets/Engineer.png', 'frost mage': '/Pets/Frost Mage.png', 'illusionist': '/Pets/Illusionist.png', 'knight': '/Pets/Knight.png', 'lightning': '/Pets/Lightning.png', 'monk': '/Pets/Monk.png', 'necromancer': '/Pets/Necromancer.png', 'rogue': '/Pets/Rogue.png', 'stealth': '/Pets/Stealth.png', 'time knight': '/Pets/Time Knight.png', 'warrior': '/Pets/Warrior.png', 'wizard': '/Pets/Wizard.png', 'dragon': '/Pets/Lightning.png', 'phoenix': '/Pets/Crystal Sage.png', 'unicorn': '/Pets/Time Knight.png', 'wolf': '/Pets/Warrior.png', 'owl': '/Pets/Wizard.png', 'cat': '/Pets/Rogue.png', 'tiger': '/Pets/Barbarian.png', 'bear': '/Pets/Beastmaster.png', 'lion': '/Pets/Knight.png', 'eagle': '/Pets/Stealth.png' };
    return map[key] || '/Pets/Wizard.png';
};
const getGridClasses = (studentCount) => {
    if (studentCount <= 6) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6';
    if (studentCount <= 12) return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-6';
    if (studentCount <= 18) return 'grid-cols-3 md:grid-cols-5 lg:grid-cols-9';
    if (studentCount <= 24) return 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12';
    if (studentCount <= 32) return 'grid-cols-4 md:grid-cols-7 lg:grid-cols-12';
    return 'grid-cols-5 md:grid-cols-8 lg:grid-cols-12';
};

// ===============================================
// CONTEXT MENU COMPONENT
// ===============================================
const ContextMenu = ({ student, position, onAward, onView, onAvatar, onClose }) => {
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
// MAIN STUDENTS TAB COMPONENT
// ===============================================
const StudentsTab = ({ students = [], xpCategories = [], onUpdateCategories, onBulkAward, onUpdateStudent, onReorderStudents, onViewDetails, onAddStudent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, student: null });
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showIndividualModal, setShowIndividualModal] = useState(false);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [draggedStudentId, setDraggedStudentId] = useState(null);

    const filteredStudents = students.filter(student =>
        student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStudentClick = (e, student) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, student });
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
    };
    
    const closeModals = () => {
        setContextMenu({ visible: false, x: 0, y: 0, student: null });
        setShowIndividualModal(false);
        setShowBulkModal(false);
    };

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
    
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-auto pl-4 pr-4 py-2 border rounded-lg" />
                    <button onClick={handleSelectAll} className="bg-blue-500 text-white px-4 py-2 rounded-lg whitespace-nowrap">{selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}</button>
                </div>
                <div className="text-gray-600 font-semibold">{selectedStudents.length > 0 ? `${selectedStudents.length} student(s) selected` : 'Click an avatar for options or drag to reorder'}</div>
                <div className="flex items-center gap-2">
                    {selectedStudents.length > 0 && (<button onClick={() => setShowBulkModal(true)} className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg">Award Bulk</button>)}
                    <button onClick={() => setShowCategoriesModal(true)} className="bg-indigo-500 text-white px-4 py-2 rounded-lg">⚙️ Categories</button>
                    <button onClick={onAddStudent} className="bg-green-500 text-white px-4 py-2 rounded-lg">+ Add Student</button>
                </div>
            </div>

            <div className={`grid ${getGridClasses(filteredStudents.length)} gap-4`}>
                {filteredStudents.map((student) => (
                    <StudentCard key={student.id} student={student} isSelected={selectedStudents.includes(student.id)} isDragged={draggedStudentId === student.id} onClick={(e) => handleStudentClick(e, student)} onDragStart={(e) => handleDragStart(e, student.id)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, student.id)} />
                ))}
            </div>

            {contextMenu.visible && (
                <ContextMenu
                    student={contextMenu.student}
                    // **THE FIX IS HERE**: Correctly creating the position object
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onAward={() => setShowIndividualModal(true)}
                    onView={() => { onViewDetails(contextMenu.student); closeModals(); }}
                    onAvatar={() => { /* Avatar modal logic from parent would be called here */ closeModals(); }}
                    onClose={closeModals}
                />
            )}

            {(showIndividualModal || showBulkModal) && <AwardModal isBulk={showBulkModal} studentCount={selectedStudents.length} student={contextMenu.student} onSubmit={showBulkModal ? (a,r,t) => { onBulkAward(selectedStudents, a, t); closeModals(); setSelectedStudents([]); } : (a,r,t) => { onBulkAward([contextMenu.student.id], a, t); closeModals(); }} onClose={closeModals} />}
            {showCategoriesModal && <CategoriesModal categories={xpCategories} onSave={onUpdateCategories} onClose={() => setShowCategoriesModal(false)} />}
        </div>
    );
};

// ===============================================
// STUDENT CARD COMPONENT
// ===============================================
const StudentCard = ({ student, isSelected, isDragged, onClick, onDragStart, onDragOver, onDrop }) => {
    const level = calculateAvatarLevel(student.totalPoints);
    const coins = calculateCoins(student);
    const xpForNextLevel = (student.totalPoints || 0) % 100;

    return (
        <div draggable="true" onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onClick={onClick} className={`p-3 rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer ${isSelected ? 'border-purple-500 bg-purple-100 scale-105' : 'border-transparent bg-white hover:border-blue-400'} ${isDragged ? 'opacity-30 ring-2 ring-blue-500' : ''}`}>
            <div className="flex flex-col items-center text-center">
                <div className="relative"><img src={getAvatarImage(student.avatarBase, level)} alt={student.firstName} className="w-20 h-20 rounded-full border-4 border-white shadow-md"/><div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">L{level}</div>{student.ownedPets?.[0] && <img src={getPetImage(student.ownedPets[0].type, student.ownedPets[0].name)} className="w-8 h-8 rounded-full absolute -bottom-1 -left-1 border-2 border-white shadow-sm"/>}</div>
                <h3 className="text-md font-bold text-gray-800 mt-2 truncate w-full">{student.firstName}</h3>
                <div className="flex items-center justify-around w-full mt-2 text-xs"><span className="font-semibold text-blue-600">⭐ {student.totalPoints || 0}</span><span className="font-semibold text-yellow-600">🪙 {coins}</span></div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5"><div className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 rounded-full" style={{ width: `${xpForNextLevel}%` }}></div></div>
            </div>
        </div>
    );
};

// ===============================================
// MODAL COMPONENTS
// ===============================================
const AwardModal = ({ isBulk, studentCount, student, onSubmit, onClose }) => {
    const [amount, setAmount] = useState(10);
    const [reason, setReason] = useState('Good Work');
    const [type, setType] = useState('xp');
    const title = isBulk ? `Award to ${studentCount} Students` : `Award to ${student.firstName}`;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"><div className="p-6 border-b"><h2 className="text-2xl font-bold text-gray-800">{title}</h2></div><div className="p-6 space-y-6"><div className="grid grid-cols-2 gap-2 p-1 bg-gray-200 rounded-lg"><button onClick={() => setType('xp')} className={`px-4 py-2 rounded-md font-semibold transition ${type === 'xp' ? 'bg-blue-500 text-white shadow' : 'text-gray-600'}`}>Award XP ⭐</button><button onClick={() => setType('coins')} className={`px-4 py-2 rounded-md font-semibold transition ${type === 'coins' ? 'bg-yellow-500 text-white shadow' : 'text-gray-600'}`}>Award Coins 🪙</button></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Amount</label><input type="number" min="1" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label><input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/></div></div><div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl"><button onClick={onClose} className="flex-1 px-4 py-3 border rounded-lg bg-white hover:bg-gray-100 font-semibold">Cancel</button><button onClick={() => onSubmit(amount, reason, type)} className="flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 font-semibold text-white">Confirm Award</button></div></div>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"><div className="p-6 border-b"><h2 className="text-2xl font-bold text-gray-800">Manage XP Categories</h2></div><div className="p-6 space-y-3 overflow-y-auto flex-grow">{localCategories.map(cat => (<div key={cat.id} className="grid grid-cols-12 gap-2 items-center"><input value={cat.icon} onChange={e => handleUpdate(cat.id, 'icon', e.target.value)} className="col-span-1 p-2 border rounded-lg"/><input value={cat.label} onChange={e => handleUpdate(cat.id, 'label', e.target.value)} className="col-span-6 p-2 border rounded-lg"/><input type="number" value={cat.amount} onChange={e => handleUpdate(cat.id, 'amount', Number(e.target.value))} className="col-span-2 p-2 border rounded-lg"/><button onClick={() => handleDelete(cat.id)} className="col-span-3 bg-red-500 text-white rounded-lg py-2 text-sm">Delete</button></div>))}<button onClick={handleAdd} className="w-full mt-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg py-2 hover:bg-gray-100">Add Category</button></div><div className="flex space-x-3 p-6 bg-gray-50 rounded-b-2xl"><button onClick={onClose} className="flex-1 py-3 border rounded-lg">Cancel</button><button onClick={() => { onSave(localCategories); onClose(); }} className="flex-1 py-3 bg-blue-500 text-white rounded-lg">Save Changes</button></div></div>
        </div>
    );
};


export default StudentsTab;