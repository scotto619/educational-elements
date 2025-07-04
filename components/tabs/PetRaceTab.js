import React from 'react';

const PetRaceTab = ({
  students,
  raceInProgress,
  selectedPrize,
  setSelectedPrize,
  xpAmount,
  setXpAmount,
  setShowRaceSetup,
  selectedPets,
  racePositions
}) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center relative">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center justify-center">
          <span className="text-3xl mr-3">🏁</span>
          Pet Race Championship
        </h2>

        <div className="flex items-center justify-center gap-6 mb-8 bg-gray-50 p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <label className="font-bold text-gray-700">🎁 Prize:</label>
            <select
              value={selectedPrize}
              onChange={(e) => setSelectedPrize(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
            >
              <option value="XP">XP Points</option>
              <option value="Loot">Loot Item</option>
              <option value="Prize">Classroom Prize</option>
            </select>
          </div>

          {selectedPrize === 'XP' && (
            <div className="flex items-center gap-3">
              <label className="font-bold text-gray-700">Amount:</label>
              <input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(Number(e.target.value))}
                className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 transition-colors"
                min="1"
                max="100"
              />
            </div>
          )}
        </div>

        <button
          disabled={raceInProgress}
          onClick={() => setShowRaceSetup(true)}
          className="mb-8 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-lg text-lg"
        >
          {raceInProgress ? 'Race in Progress...' : 'Setup New Race'}
        </button>

        {/* Race Track */}
        <div className="relative h-80 border-4 border-gray-300 bg-gradient-to-r from-green-100 via-yellow-50 to-green-200 overflow-hidden rounded-xl shadow-inner mb-8">
          {/* Track lanes */}
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="absolute w-full h-16 border-b border-gray-200" style={{ top: `${i * 60}px` }} />
          ))}
          
          {selectedPets.map((id, i) => {
            const s = students.find(stu => stu.id === id);
            if (!s?.pet) return null;
            const x = racePositions[id] || 0;

            return (
              <div
                key={id}
                className="absolute flex items-center space-x-3 transition-all duration-200 z-10"
                style={{
                  top: `${i * 60 + 12}px`,
                  left: `${x}px`,
                  transition: 'left 0.2s linear',
                }}
              >
                <img src={s.pet.image} alt="Pet" className="w-16 h-16 rounded-full border-2 border-white shadow-lg" />
                <span className="bg-white px-2 py-1 rounded-lg text-sm font-bold text-gray-700 shadow">{s.firstName}</span>
              </div>
            );
          })}

          {/* Finish Line */}
          <div className="absolute top-0 bottom-0 right-5 w-4 bg-gradient-to-b from-red-500 to-red-600 shadow-lg z-20 rounded">
            <div className="text-white text-center text-xs font-bold mt-2 transform -rotate-90">FINISH</div>
          </div>

          {/* Starting line */}
          <div className="absolute top-0 bottom-0 left-5 w-1 bg-gray-400 z-20"></div>
        </div>
        
        {/* Pet Champion Leaderboard */}
        <div className="bg-gray-50 p-6 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center justify-center">
            <span className="text-2xl mr-2">🏅</span>
            Pet Champions Hall of Fame
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {students
              .filter((s) => s.pet?.wins > 0)
              .sort((a, b) => (b.pet.wins || 0) - (a.pet.wins || 0))
              .slice(0, 3)
              .map((s, i) => (
                <div key={s.id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-3">
                  <div className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <img src={s.pet.image} className="w-12 h-12 rounded-full border-2 border-gray-300" />
                  <div>
                    <div className="font-bold text-gray-800">{s.firstName}</div>
                    <div className="text-sm text-gray-600">{s.pet.name} - {s.pet.wins} wins</div>
                  </div>
                </div>
              ))}
          </div>
          {students.filter((s) => s.pet?.wins > 0).length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏁</div>
              <p className="text-gray-500 italic">No races completed yet. Start your first race!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetRaceTab;