import React from 'react';

const CharacterSheetModal = ({ selectedStudent, setSelectedStudent, handleAvatarClick }) => {
  if (!selectedStudent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-modal-appear">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center justify-center">
          <span className="mr-3">🎭</span>
          {selectedStudent.firstName}
          <span className="ml-3 text-xl">⭐{selectedStudent.avatarLevel}</span>
        </h2>
        
        {selectedStudent.avatar ? (
          <div className="mb-6">
            <img
              src={selectedStudent.avatar}
              className="w-32 h-32 mx-auto rounded-full border-4 border-gray-300 shadow-lg mb-4"
            />
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                setSelectedStudent(null);
                setTimeout(() => handleAvatarClick(selectedStudent.id), 0);
              }}
            >
              🎨 Change Avatar
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg mb-4">
              {selectedStudent.firstName.charAt(0)}
            </div>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                handleAvatarClick(selectedStudent.id);
                setSelectedStudent(null);
              }}
            >
              🎨 Choose Avatar
            </button>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-gray-700 mb-4">📊 Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">👍</div>
              <div className="font-semibold">Respectful</div>
              <div className="text-blue-600 font-bold">{selectedStudent.categoryTotal?.Respectful || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">💼</div>
              <div className="font-semibold">Responsible</div>
              <div className="text-green-600 font-bold">{selectedStudent.categoryTotal?.Responsible || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">📚</div>
              <div className="font-semibold">Learner</div>
              <div className="text-purple-600 font-bold">{selectedStudent.categoryTotal?.Learner || 0}</div>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <div className="text-2xl mb-1">⭐</div>
              <div className="font-semibold">Total XP</div>
              <div className="text-yellow-600 font-bold">{selectedStudent.totalPoints}</div>
            </div>
          </div>
        </div>

        {selectedStudent.pet?.image && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center">
              <span className="mr-2">🐾</span>
              Pet Companion
            </h3>
            <img
              src={selectedStudent.pet.image}
              alt="Pet"
              className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-gray-300 shadow-lg"
            />
            <div className="text-center">
              <div className="font-semibold text-gray-800">{selectedStudent.pet.name || 'Unnamed'}</div>
              <div className="text-sm text-gray-600 mt-1">
                Level {selectedStudent.pet.level || 1} • Speed: {selectedStudent.pet.speed || 1} • Wins: {selectedStudent.pet.wins || 0}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setSelectedStudent(null)}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default CharacterSheetModal;