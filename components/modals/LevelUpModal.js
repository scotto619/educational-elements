import React from 'react';

const LevelUpModal = ({ levelUpData, setLevelUpData }) => {
  if (!levelUpData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full mx-4 transform scale-100 animate-modal-appear">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-green-600 mb-4">Level Up!</h2>
        <p className="mb-8 text-xl font-medium text-gray-700">{levelUpData.name} has reached the next level!</p>
        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-sm mb-2 text-gray-600 font-semibold">Before</p>
            <img src={levelUpData.oldAvatar} className="w-24 h-24 rounded-full border-4 border-gray-300 shadow-lg" />
          </div>
          <div className="text-4xl">➡️</div>
          <div className="text-center">
            <p className="text-sm mb-2 text-gray-600 font-semibold">After</p>
            <img src={levelUpData.newAvatar} className="w-24 h-24 rounded-full border-4 border-green-400 shadow-lg" />
          </div>
        </div>
        <button
          onClick={() => setLevelUpData(null)}
          className="px-8 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          Awesome! 🎉
        </button>
      </div>
    </div>
  );
};

export default LevelUpModal;