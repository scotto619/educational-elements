import React from 'react';

const RaceSetupModal = ({ 
  showRaceSetup, 
  setShowRaceSetup, 
  students, 
  selectedPets, 
  setSelectedPets,
  setRacePositions,
  setRaceInProgress,
  setRaceFinished,
  setRaceWinner
}) => {
  if (!showRaceSetup) return null;

  const handleStartRace = () => {
    const starters = {};
    selectedPets.forEach((id) => (starters[id] = 0));
    setRacePositions(starters);
    setRaceInProgress(true);
    setRaceFinished(false);
    setRaceWinner(null);
    setShowRaceSetup(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full transform scale-100 animate-modal-appear">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="mr-3">🐾</span>
          Select Racing Pets
        </h2>
        <p className="text-gray-600 mb-6">Choose up to 5 students with pets to compete:</p>

        <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto mb-6">
          {students
            .filter((s) => s.pet?.image)
            .map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedPets.includes(s.id)
                    ? 'bg-blue-100 border-blue-400 shadow-md'
                    : 'hover:bg-gray-100 border-gray-300'
                }`}
                onClick={() => {
                  if (selectedPets.includes(s.id)) {
                    setSelectedPets((prev) => prev.filter((id) => id !== s.id));
                  } else if (selectedPets.length < 5) {
                    setSelectedPets((prev) => [...prev, s.id]);
                  }
                }}
              >
                <img src={s.pet.image} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{s.firstName}</div>
                  <div className="text-sm text-gray-600">{s.pet.name || 'Unnamed'}</div>
                </div>
                {selectedPets.includes(s.id) && (
                  <div className="text-blue-500 text-xl">✓</div>
                )}
              </div>
            ))}
        </div>

        {students.filter((s) => s.pet?.image).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🐾</div>
            <p>No students have pets yet. Students unlock pets at 50 XP!</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowRaceSetup(false);
              setSelectedPets([]);
            }}
            className="flex-1 px-4 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={selectedPets.length === 0}
            onClick={handleStartRace}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg"
          >
            Start Race! 🏁
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceSetupModal;