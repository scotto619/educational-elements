// RaceSetupModal.js - Complete with Prize Selection System
import React, { useState } from 'react';

const RaceSetupModal = ({ 
  students, 
  selectedPets, 
  setSelectedPets,
  selectedPrize,
  setSelectedPrize,
  prizeDetails,
  setPrizeDetails,
  teacherRewards,
  onClose, 
  onStartRace,
  calculateSpeed,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState('pets'); // 'pets' or 'prize'

  const handleStartRace = () => {
    if (selectedPets.length === 0) {
      showToast('Please select at least one pet to race!', 'error');
      return;
    }

    if (selectedPrize === 'xp' && (!prizeDetails.amount || !prizeDetails.category)) {
      showToast('Please set XP amount and category!', 'error');
      return;
    }

    if (selectedPrize === 'coins' && !prizeDetails.amount) {
      showToast('Please set coin amount!', 'error');
      return;
    }

    onStartRace();
  };

  const handlePetToggle = (studentId) => {
    if (selectedPets.includes(studentId)) {
      setSelectedPets(prev => prev.filter(id => id !== studentId));
    } else if (selectedPets.length < 5) {
      setSelectedPets(prev => [...prev, studentId]);
    } else {
      showToast('Maximum 5 pets can race at once!', 'warning');
    }
  };

  const studentsWithPets = students.filter(s => s.pet?.image);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h2 className="text-3xl font-bold flex items-center justify-center">
            <span className="mr-3">🏁</span>
            Race Setup
            <span className="ml-3">🐾</span>
          </h2>
          <p className="text-center text-blue-100 mt-2">Configure your exciting pet race!</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pets')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'pets'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            🐾 Select Racing Pets ({selectedPets.length}/5)
          </button>
          <button
            onClick={() => setActiveTab('prize')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'prize'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            🎁 Choose Prize
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Pet Selection Tab */}
          {activeTab === 'pets' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Choose up to 5 students with pets to compete:</p>
                {studentsWithPets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🐾</div>
                    <p>No students have pets yet.</p>
                    <p className="text-sm">Students unlock pets at 50 XP!</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {studentsWithPets.map(student => {
                  const isSelected = selectedPets.includes(student.id);
                  const speed = calculateSpeed ? calculateSpeed(student.pet) : 1;
                  
                  return (
                    <div
                      key={student.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 shadow-md transform scale-[1.02]'
                          : 'hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handlePetToggle(student.id)}
                    >
                      <img 
                        src={student.pet.image} 
                        alt={student.pet.name || 'Pet'}
                        className="w-16 h-16 rounded-full border-3 border-gray-300 shadow-lg" 
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 text-lg">{student.firstName}</div>
                        <div className="text-gray-600">{student.pet.name || 'Unnamed Pet'}</div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>🏃‍♂️ Speed: {speed.toFixed(1)}</span>
                          <span>🏆 Wins: {student.pet.wins || 0}</span>
                          <span>⭐ Level: {student.pet.level || 1}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-blue-500 text-2xl animate-pulse">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prize Selection Tab */}
          {activeTab === 'prize' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">🏆 Winner's Prize</h3>
                <p className="text-gray-600">Choose what the winning student will receive:</p>
              </div>

              {/* Prize Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setSelectedPrize('xp')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
                    selectedPrize === 'xp'
                      ? 'bg-green-50 border-green-400 shadow-md transform scale-105'
                      : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="text-3xl mb-2">⭐</div>
                  <h4 className="font-bold text-green-700">XP Points</h4>
                  <p className="text-sm text-green-600">Award experience points</p>
                </div>

                <div
                  onClick={() => setSelectedPrize('coins')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
                    selectedPrize === 'coins'
                      ? 'bg-yellow-50 border-yellow-400 shadow-md transform scale-105'
                      : 'border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                >
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold text-yellow-700">Coins</h4>
                  <p className="text-sm text-yellow-600">Award bonus coins</p>
                </div>

                <div
                  onClick={() => setSelectedPrize('reward')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center ${
                    selectedPrize === 'reward'
                      ? 'bg-purple-50 border-purple-400 shadow-md transform scale-105'
                      : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="text-3xl mb-2">🎁</div>
                  <h4 className="font-bold text-purple-700">Classroom Reward</h4>
                  <p className="text-sm text-purple-600">Custom classroom prize</p>
                </div>
              </div>

              {/* Prize Configuration */}
              <div className="bg-gray-50 rounded-xl p-6">
                {selectedPrize === 'xp' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Configure XP Award:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount:</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={prizeDetails.amount || 5}
                          onChange={(e) => setPrizeDetails(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category:</label>
                        <select
                          value={prizeDetails.category || 'Respectful'}
                          onChange={(e) => setPrizeDetails(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 transition-colors"
                        >
                          <option value="Respectful">Respectful</option>
                          <option value="Responsible">Responsible</option>
                          <option value="Learner">Learner</option>
                        </select>
                      </div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <p className="text-green-800 font-semibold">
                        Winner receives: {prizeDetails.amount || 5} {prizeDetails.category || 'Respectful'} XP
                      </p>
                    </div>
                  </div>
                )}

                {selectedPrize === 'coins' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Configure Coin Reward:</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Coin Amount:</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={prizeDetails.amount || 10}
                        onChange={(e) => setPrizeDetails(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 transition-colors"
                      />
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <p className="text-yellow-800 font-semibold">
                        Winner receives: {prizeDetails.amount || 10} bonus coins 💰
                      </p>
                    </div>
                  </div>
                )}

                {selectedPrize === 'reward' && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-800">Custom Classroom Reward:</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Description:</label>
                      <input
                        type="text"
                        placeholder="e.g., Extra recess time, Choose classroom music, etc."
                        value={prizeDetails.description || ''}
                        onChange={(e) => setPrizeDetails(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 transition-colors"
                      />
                    </div>
                    
                    {/* Pre-set reward options */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Or choose from popular rewards:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Extra recess time",
                          "Choose classroom music",
                          "Line leader for the day", 
                          "Teacher's helper",
                          "Free homework pass",
                          "Special seat privilege",
                          "Show and tell time",
                          "Choose class activity"
                        ].map(reward => (
                          <button
                            key={reward}
                            onClick={() => setPrizeDetails(prev => ({ ...prev, description: reward }))}
                            className="text-left p-2 text-sm bg-white border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                          >
                            {reward}
                          </button>
                        ))}
                      </div>
                    </div>

                    {prizeDetails.description && (
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <p className="text-purple-800 font-semibold">
                          Winner receives: {prizeDetails.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedPets.length > 0 ? (
              <span>✅ {selectedPets.length} pet{selectedPets.length > 1 ? 's' : ''} selected</span>
            ) : (
              <span>⚠️ Select pets to race</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              disabled={selectedPets.length === 0}
              onClick={handleStartRace}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg transform hover:scale-105"
            >
              Start Race! 🏁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceSetupModal;