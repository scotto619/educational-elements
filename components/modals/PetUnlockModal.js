import React from 'react';

const PetUnlockModal = ({ 
  petUnlockData, 
  setPetUnlockData, 
  petNameInput, 
  setPetNameInput,
  setStudents,
  getRandomPetName
}) => {
  if (!petUnlockData) return null;

  const handlePetUnlock = () => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === petUnlockData.studentId
          ? {
              ...s,
              pet: {
                ...petUnlockData.pet,
                name: petNameInput || getRandomPetName(),
              },
            }
          : s
      )
    );
    setPetUnlockData(null);
    setPetNameInput('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center transform scale-100 animate-modal-appear">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Pet Unlocked!</h2>
        <p className="mb-6 text-xl text-gray-700">{petUnlockData.firstName}, meet your new companion!</p>
        <img
          src={petUnlockData.pet.image}
          alt="Pet"
          className="w-32 h-32 mx-auto rounded-full border-4 border-green-400 mb-6 shadow-lg"
        />
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Name your pet:</label>
          <input
            type="text"
            placeholder="Enter a name"
            className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg mb-3 focus:border-blue-500 transition-colors"
            value={petNameInput}
            onChange={(e) => setPetNameInput(e.target.value)}
          />
          <button
            onClick={() => setPetNameInput(getRandomPetName())}
            className="text-sm text-blue-600 hover:underline font-semibold"
          >
            🎲 Random Name
          </button>
        </div>

        <button
          onClick={handlePetUnlock}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Welcome New Pet! 🐾
        </button>
      </div>
    </div>
  );
};

export default PetUnlockModal;