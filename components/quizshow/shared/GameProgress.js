// ===============================================
// components/quizshow/shared/GameProgress.js - PROGRESS INDICATOR
// ===============================================
export const GameProgress = ({ 
  currentQuestion, 
  totalQuestions, 
  showPercentage = true 
}) => {
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">Progress</span>
        {showPercentage && (
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        )}
      </div>
      
      <div className="bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500 text-center">
        Question {currentQuestion + 1} of {totalQuestions}
      </div>
    </div>
  );
};