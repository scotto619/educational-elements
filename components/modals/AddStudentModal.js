// AddStudentModal.js - UPDATED with new shop fields
import React from 'react';

const AddStudentModal = ({
  showAddStudentModal,
  setShowAddStudentModal,
  newStudentName,
  setNewStudentName,
  newStudentAvatar,
  setNewStudentAvatar,
  AVAILABLE_AVATARS,
  getAvatarImage,
  students,
  setStudents,
  saveStudentsToFirebase,
  showToast,
  handleDeselectAll
}) => {
  if (!showAddStudentModal) return null;

  const handleAddStudent = () => {
    if (!newStudentName || !newStudentAvatar) {
      alert("Please enter a name and choose an avatar");
      return;
    }
    
    const base = AVAILABLE_AVATARS.find(a => a.path === newStudentAvatar)?.base || '';
    
    // UPDATED: Include new shop fields in student creation
    const newStudent = {
      id: Date.now().toString(),
      firstName: newStudentName,
      avatarBase: base,
      avatarLevel: 1,
      avatar: getAvatarImage(base, 1),
      totalPoints: 0,
      weeklyPoints: 0,
      categoryTotal: {},
      categoryWeekly: {},
      logs: [],
      pet: null,
      coins: 0,
      coinsSpent: 0,
      // NEW SHOP FIELDS
      ownedAvatars: [base], // Student owns their starting avatar
      ownedPets: [],
      rewardsPurchased: [],
      inventory: []
    };
    
    setStudents((prev) => {
      const updatedStudents = [...prev, newStudent];
      saveStudentsToFirebase(updatedStudents);
      return updatedStudents;
    });
    
    setNewStudentName('');
    setNewStudentAvatar('');
    setShowAddStudentModal(false);
    
    // Clear any selections when adding a new student
    if (handleDeselectAll) {
      handleDeselectAll();
    }
    
    showToast('Student added successfully!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform scale-100 animate-modal-appear">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Student</h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
          <input
            type="text"
            placeholder="Enter first name"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Choose Avatar</label>
          <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
            {AVAILABLE_AVATARS.map((avatar) => (
              <div
                key={avatar.path}
                className="relative group cursor-pointer"
                onClick={() => setNewStudentAvatar(avatar.path)}
              >
                <img
                  src={avatar.path}
                  alt={avatar.base}
                  className={`w-full h-full rounded-lg border-2 object-cover transition-all duration-300 ${
                    newStudentAvatar === avatar.path 
                      ? 'border-blue-500 shadow-lg scale-110' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setShowAddStudentModal(false)}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleAddStudent}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Add Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;