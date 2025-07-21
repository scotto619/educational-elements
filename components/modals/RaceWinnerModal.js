// RaceWinnerModal.js - Enhanced Race Winner Celebration
import React, { useState, useEffect } from 'react';

const RaceWinnerModal = ({ 
  winner,
  onClose,
  selectedPrize,
  prizeDetails,
  getAvatarImage
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('entrance');

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setAnimationPhase('celebration'), 300);
    const timer2 = setTimeout(() => setShowConfetti(false), 3000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!winner) return null;

  const getPrizeText = () => {
    if (selectedPrize === 'xp') {
      return `${prizeDetails.amount || 5} ${prizeDetails.category || 'Respectful'} XP`;
    } else if (selectedPrize === 'coins') {
      return `${prizeDetails.amount || 10} bonus coins`;
    } else if (selectedPrize === 'reward') {
      return prizeDetails.description || 'Classroom reward';
    }
    return 'Amazing prize!';
  };

  const getPrizeIcon = () => {
    if (selectedPrize === 'xp') return '⭐';
    if (selectedPrize === 'coins') return '💰';
    if (selectedPrize === 'reward') return '🎁';
    return '🏆';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '🎁', '💫'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div 
        className={`bg-white rounded-2xl shadow-2xl text-center max-w-lg w-full mx-4 overflow-hidden transform transition-all duration-500 ${
          animationPhase === 'entrance' ? 'scale-50 rotate-12 opacity-0' : 
          animationPhase === 'celebration' ? 'scale-100 rotate-0 opacity-100' : 
          'scale-110 opacity-90'
        }`}
      >
        {/* Header with Winner Info */}
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className={`text-8xl mb-4 transform transition-all duration-1000 ${
              animationPhase === 'celebration' ? 'scale-110 animate-bounce' : 'scale-100'
            }`}>
              🏆
            </div>
            <h2 className="text-4xl font-bold mb-2">RACE WINNER!</h2>
            <div className="text-yellow-100 text-lg">🎉 Congratulations! 🎉</div>
          </div>
          
          {/* Animated background elements */}
          <div className="absolute top-4 right-4 text-3xl animate-spin" style={{ animationDuration: '3s' }}>⭐</div>
          <div className="absolute bottom-4 left-4 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎊</div>
          <div className="absolute top-1/2 left-1/4 text-2xl animate-pulse" style={{ animationDelay: '1s' }}>💫</div>
        </div>

        {/* Winner Details */}
        <div className="p-8">
          {/* Student and Pet */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            {/* Student Avatar */}
            <div className="text-center">
              <div className="relative">
                <img
                  src={winner.avatar || getAvatarImage(winner.avatarBase, winner.avatarLevel || 1)}
                  alt={`${winner.firstName}'s avatar`}
                  className={`w-20 h-20 rounded-full border-4 border-blue-400 shadow-xl transition-all duration-1000 ${
                    animationPhase === 'celebration' ? 'animate-pulse' : ''
                  }`}
                />
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                  Lv.{winner.avatarLevel || 1}
                </div>
              </div>
              <div className="mt-3 font-bold text-xl text-gray-800">{winner.firstName}</div>
              <div className="text-blue-600 font-semibold">Champion Trainer</div>
            </div>

            {/* Connection */}
            <div className="text-4xl animate-bounce">
              ❤️
            </div>

            {/* Pet */}
            <div className="text-center">
              <div className="relative">
                <img
                  src={winner.pet?.image}
                  alt={winner.pet?.name || 'Pet'}
                  className={`w-20 h-20 rounded-full border-4 border-yellow-400 shadow-xl transition-all duration-1000 ${
                    animationPhase === 'celebration' ? 'animate-spin' : ''
                  }`}
                  style={{ animationDuration: '2s' }}
                />
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  🏃‍♂️
                </div>
              </div>
              <div className="mt-3 font-bold text-xl text-gray-800">{winner.pet?.name || 'Racing Pet'}</div>
              <div className="text-yellow-600 font-semibold">Speed Demon</div>
            </div>
          </div>

          {/* Prize Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-2 border-purple-200">
            <div className="text-5xl mb-3">{getPrizeIcon()}</div>
            <h3 className="text-2xl font-bold text-purple-800 mb-2">Victory Prize Awarded!</h3>
            <div className="bg-white p-4 rounded-xl border border-purple-300">
              <p className="text-xl font-bold text-purple-700">{getPrizeText()}</p>
            </div>
          </div>

          {/* Race Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-sm text-blue-600 font-semibold">Total Wins</div>
              <div className="text-xl font-bold text-blue-800">{(winner.pet?.wins || 0) + 1}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm text-green-600 font-semibold">Pet Level</div>
              <div className="text-xl font-bold text-green-800">{winner.pet?.level || 1}</div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-200">
            <h4 className="font-bold text-yellow-800 mb-2 flex items-center justify-center">
              <span className="mr-2">⭐</span>
              Fun Fact
              <span className="ml-2">⭐</span>
            </h4>
            <p className="text-yellow-700 text-sm">
              {winner.pet?.name || 'This pet'} has now won {(winner.pet?.wins || 0) + 1} race{(winner.pet?.wins || 0) + 1 > 1 ? 's' : ''}! 
              {(winner.pet?.wins || 0) + 1 === 1 && " What an amazing debut performance!"}
              {(winner.pet?.wins || 0) + 1 === 2 && " They're on a winning streak!"}
              {(winner.pet?.wins || 0) + 1 === 3 && " A true champion in the making!"}
              {(winner.pet?.wins || 0) + 1 >= 4 && " An absolute racing legend! 🌟"}
            </p>
          </div>

          {/* Action Buttons */}
          <button
            onClick={onClose}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            🎉 Celebrate Victory! 🎉
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceWinnerModal;