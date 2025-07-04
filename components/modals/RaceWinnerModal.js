import React from 'react';

const RaceWinnerModal = ({ 
  raceFinished, 
  setRaceFinished, 
  raceWinner, 
  selectedPrize, 
  xpAmount 
}) => {
  if (!raceFinished || !raceWinner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full mx-4 transform scale-100 animate-modal-appear">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-3xl font-bold mb-6 text-green-600">Race Winner!</h3>
        <p className="mb-4 text-xl font-medium text-gray-700">{raceWinner.firstName}'s pet wins the race!</p>
        <img src={raceWinner.pet.image} className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-400 shadow-lg mb-4" />
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-lg font-semibold text-yellow-800">Prize: {selectedPrize === 'XP' ? `${xpAmount} XP` : selectedPrize}</p>
        </div>
        <button
          onClick={() => setRaceFinished(false)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Celebrate! 🎉
        </button>
      </div>
    </div>
  );
};

export default RaceWinnerModal;