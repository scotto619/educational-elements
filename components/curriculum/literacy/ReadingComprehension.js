// components/curriculum/literacy/ReadingComprehension.js
// READING COMPREHENSION COMPONENT WITH DIFFERENT TEXT TYPES
import React, { useState, useRef } from 'react';
import { readingComprehensionContent, getTextTypes, getPassagesByDifficulty } from './data/reading-comprehension-content';

// ===============================================
// TEXT TYPE SELECTOR COMPONENT
// ===============================================
const TextTypeSelector = ({ onSelectType, isPresentationMode }) => {
  const textTypes = getTextTypes();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
          📚 Choose Your Text Type
        </h3>
        <p className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
          Different types of texts help develop different reading skills
        </p>
      </div>

      <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {textTypes.map(textType => (
          <button
            key={textType.id}
            onClick={() => onSelectType(textType)}
            className={`bg-gradient-to-br ${textType.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-left ${isPresentationMode ? 'p-10' : ''}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className={`${isPresentationMode ? 'text-6xl' : 'text-4xl'}`}>{textType.icon}</span>
              <div>
                <h4 className={`font-bold ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>{textType.name}</h4>
                <p className={`opacity-90 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                  {textType.passages.length} passage{textType.passages.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <p className={`opacity-80 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
              {textType.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// PASSAGE SELECTOR COMPONENT  
// ===============================================
const PassageSelector = ({ textType, onSelectPassage, onBack, isPresentationMode }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-bold text-gray-800 flex items-center gap-3 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
            <span>{textType.icon}</span>
            {textType.name}
          </h3>
          <p className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
            {textType.description}
          </p>
        </div>
        <button 
          onClick={onBack}
          className={`bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
        >
          ← Back
        </button>
      </div>

      <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 p-8' : 'grid-cols-1 md:grid-cols-2'}`}>
        {textType.passages.map(passage => (
          <button
            key={passage.id}
            onClick={() => onSelectPassage(passage)}
            className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className={`font-bold text-gray-800 ${isPresentationMode ? 'text-3xl' : 'text-xl'}`}>
                {passage.title}
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                passage.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                passage.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              } ${isPresentationMode ? 'text-lg px-6 py-3' : ''}`}>
                {passage.difficulty}
              </span>
            </div>
            
            <div className="space-y-2">
              <p className={`text-gray-600 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                📖 Reading Level: {passage.readingLevel}
              </p>
              <p className={`text-gray-600 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                📝 {passage.wordCount} words • {passage.questions.length} questions
              </p>
              <p className={`text-gray-700 ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                {passage.text.substring(0, 100)}...
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex flex-wrap gap-1">
                {passage.teachingFocus.slice(0, 2).map((focus, i) => (
                  <span key={i} className={`px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs ${isPresentationMode ? 'text-lg px-4 py-2' : ''}`}>
                    {focus}
                  </span>
                ))}
              </div>
              <span className="text-blue-500 font-semibold">Read →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// QUESTION COMPONENT
// ===============================================
const QuestionComponent = ({ question, answer, onAnswerChange, showResult, isPresentationMode }) => {
  const isCorrect = question.type === 'multiple_choice' 
    ? answer === question.correctAnswer
    : answer && answer.toLowerCase().includes(question.keyWords?.[0]?.toLowerCase() || '');

  if (question.type === 'multiple_choice') {
    return (
      <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${isPresentationMode ? 'p-10' : ''}`}>
        <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
          Question {question.id}: {question.question}
        </h4>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && onAnswerChange(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                showResult
                  ? index === question.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : index === answer && index !== question.correctAnswer
                    ? 'bg-red-100 border-red-500 text-red-800'  
                    : 'bg-gray-50 border-gray-300 text-gray-600'
                  : answer === index
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
              } ${isPresentationMode ? 'text-2xl p-6' : ''}`}
            >
              <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
              {showResult && index === question.correctAnswer && <span className="float-right">✓</span>}
              {showResult && index === answer && index !== question.correctAnswer && <span className="float-right">✗</span>}
            </button>
          ))}
        </div>

        {showResult && (
          <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'} ${isPresentationMode ? 'text-2xl' : ''}`}>
              {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className={`text-gray-700 mt-2 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Short answer question
  return (
    <div className={`bg-white rounded-xl border-2 border-gray-200 p-6 ${isPresentationMode ? 'p-10' : ''}`}>
      <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
        Question {question.id}: {question.question}
      </h4>
      
      <textarea
        value={answer || ''}
        onChange={(e) => !showResult && onAnswerChange(e.target.value)}
        disabled={showResult}
        placeholder="Type your answer here..."
        className={`w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none ${isPresentationMode ? 'text-2xl p-6 h-32' : 'h-24'}`}
        rows={isPresentationMode ? 4 : 3}
      />

      {showResult && (
        <div className="mt-4 space-y-3">
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-yellow-800'} ${isPresentationMode ? 'text-2xl' : ''}`}>
              {isCorrect ? '✅ Great answer!' : '💭 Here\'s a sample answer:'}
            </p>
            <p className={`text-gray-700 mt-2 ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
              <strong>Suggested answer:</strong> {question.suggestedAnswer}
            </p>
            {question.keyWords && (
              <p className={`text-gray-600 mt-2 ${isPresentationMode ? 'text-lg' : 'text-xs'}`}>
                <strong>Key words to include:</strong> {question.keyWords.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================================
// READING PASSAGE COMPONENT
// ===============================================
const ReadingPassageComponent = ({ passage, onBack, isPresentationMode }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [viewMode, setViewMode] = useState('reading'); // 'reading', 'questions', 'results'
  const printRef = useRef(null);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAnswers = () => {
    setShowResults(true);
    setViewMode('results');
  };

  const calculateScore = () => {
    let correct = 0;
    passage.questions.forEach(question => {
      const answer = answers[question.id];
      if (question.type === 'multiple_choice') {
        if (answer === question.correctAnswer) correct++;
      } else {
        // For short answer, check if any key words are included
        if (answer && question.keyWords?.some(keyword => 
          answer.toLowerCase().includes(keyword.toLowerCase())
        )) {
          correct++;
        }
      }
    });
    return { correct, total: passage.questions.length };
  };

  const handlePrint = () => {
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>${passage.title} - Reading Comprehension</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .passage { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; }
            .questions { margin-top: 20px; }
            .question { margin-bottom: 20px; padding: 10px; background: #f9f9f9; }
            .answer-space { border-bottom: 1px solid #ccc; min-height: 30px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${passage.title}</h1>
            <p>Reading Level: ${passage.readingLevel} | Word Count: ${passage.wordCount}</p>
          </div>
          <div class="passage">
            <h3>Reading Passage:</h3>
            <p>${passage.text.replace(/\n/g, '<br>')}</p>
          </div>
          <div class="questions">
            <h3>Comprehension Questions:</h3>
            ${passage.questions.map((q, i) => `
              <div class="question">
                <p><strong>Question ${i + 1}:</strong> ${q.question}</p>
                ${q.type === 'multiple_choice' ? 
                  q.options.map((opt, j) => `<p>${String.fromCharCode(65 + j)}. ${opt}</p>`).join('') :
                  '<div class="answer-space"></div>'
                }
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const resetActivity = () => {
    setAnswers({});
    setShowResults(false);
    setViewMode('reading');
    setCurrentQuestionIndex(0);
  };

  const score = showResults ? calculateScore() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-bold text-gray-800 ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
            {passage.title}
          </h3>
          <div className="flex flex-wrap gap-4 mt-2">
            <span className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
              📚 {passage.readingLevel}
            </span>
            <span className={`text-gray-600 ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
              📝 {passage.wordCount} words
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              passage.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
              passage.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            } ${isPresentationMode ? 'text-lg px-6 py-3' : ''}`}>
              {passage.difficulty}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          {!isPresentationMode && (
            <button 
              onClick={handlePrint}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all"
            >
              🖨️ Print
            </button>
          )}
          <button 
            onClick={onBack}
            className={`bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className={`bg-white rounded-xl shadow-lg p-6 ${isPresentationMode ? 'p-10' : ''}`}>
        <div className="flex justify-center gap-4">
          {['reading', 'questions', 'results'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              disabled={mode === 'results' && !showResults}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === mode
                  ? 'bg-blue-500 text-white shadow-lg'
                  : mode === 'results' && !showResults
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isPresentationMode ? 'px-12 py-6 text-3xl' : ''}`}
            >
              {mode === 'reading' && '📖 Read'}
              {mode === 'questions' && '❓ Questions'}
              {mode === 'results' && '📊 Results'}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'reading' && (
        <div className={`bg-white rounded-xl shadow-lg p-8 ${isPresentationMode ? 'p-16' : ''}`}>
          <div className={`prose max-w-none ${isPresentationMode ? 'text-3xl leading-relaxed' : 'text-lg leading-relaxed'}`}>
            {passage.text.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => setViewMode('questions')}
              className={`bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all ${isPresentationMode ? 'px-16 py-6 text-3xl' : ''}`}
            >
              Start Questions →
            </button>
          </div>
        </div>
      )}

      {viewMode === 'questions' && (
        <div className="space-y-6">
          <div className="space-y-6">
            {passage.questions.map(question => (
              <QuestionComponent
                key={question.id}
                question={question}
                answer={answers[question.id]}
                onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                showResult={showResults}
                isPresentationMode={isPresentationMode}
              />
            ))}
          </div>

          {!showResults && (
            <div className="text-center">
              <button
                onClick={handleSubmitAnswers}
                className={`bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all ${isPresentationMode ? 'px-16 py-6 text-3xl' : ''}`}
              >
                Submit Answers 📝
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'results' && score && (
        <div className="space-y-6">
          <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-8 text-center ${isPresentationMode ? 'p-16' : ''}`}>
            <h3 className={`font-bold text-purple-800 mb-4 ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
              📊 Your Results
            </h3>
            <div className={`text-6xl mb-4 ${isPresentationMode ? 'text-9xl mb-8' : ''}`}>
              {score.correct === score.total ? '🎉' : score.correct >= score.total * 0.7 ? '👏' : '💪'}
            </div>
            <p className={`text-purple-700 font-bold ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
              {score.correct} out of {score.total} correct
            </p>
            <p className={`text-purple-600 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
              {Math.round((score.correct / score.total) * 100)}% accuracy
            </p>
          </div>

          <div className="text-center space-y-4">
            <button
              onClick={resetActivity}
              className={`bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-all ${isPresentationMode ? 'px-16 py-6 text-3xl' : ''}`}
            >
              🔄 Try Again
            </button>
          </div>

          {/* Teaching Focus */}
          <div className={`bg-white rounded-xl shadow-lg p-6 ${isPresentationMode ? 'p-10' : ''}`}>
            <h4 className={`font-bold text-gray-800 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
              🎯 This passage focused on:
            </h4>
            <div className="flex flex-wrap gap-3">
              {passage.teachingFocus.map((focus, i) => (
                <span key={i} className={`px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold ${isPresentationMode ? 'text-xl px-6 py-3' : 'text-sm'}`}>
                  {focus}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===============================================
// MAIN READING COMPREHENSION COMPONENT
// ===============================================
const ReadingComprehension = ({ showToast = () => {}, students = [] }) => {
  const [selectedTextType, setSelectedTextType] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(
      isPresentationMode 
        ? 'Exited presentation mode' 
        : 'Entered presentation mode - perfect for classroom display!', 
      'success'
    );
  };

  const handleSelectTextType = (textType) => {
    setSelectedTextType(textType);
    showToast(`Selected ${textType.name} - ${textType.passages.length} passages available`, 'info');
  };

  const handleSelectPassage = (passage) => {
    setSelectedPassage(passage);
    showToast(`Starting "${passage.title}" - ${passage.difficulty} level`, 'success');
  };

  const handleBack = () => {
    if (selectedPassage) {
      setSelectedPassage(null);
    } else if (selectedTextType) {
      setSelectedTextType(null);
    }
  };

  const handleBackToStart = () => {
    setSelectedTextType(null);
    setSelectedPassage(null);
  };

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'bg-gradient-to-br from-blue-50 to-green-50 min-h-screen' : ''}`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl p-6 shadow-lg ${isPresentationMode ? 'p-12' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold mb-2 flex items-center ${isPresentationMode ? 'text-7xl animate-pulse' : 'text-3xl'}`}>
              <span className="mr-3">🧠</span>
              Reading Comprehension
            </h3>
            <p className={`opacity-90 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
              Build understanding through different types of texts
            </p>
          </div>
          <div className="flex gap-3">
            {(selectedTextType || selectedPassage) && (
              <button
                onClick={handleBackToStart}
                className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
              >
                🏠 Start Over
              </button>
            )}
            <button
              onClick={togglePresentationMode}
              className={`bg-white bg-opacity-20 text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl transform hover:scale-105' : 'px-6 py-3'}`}
            >
              {isPresentationMode ? '📺 Exit Presentation' : '🎭 Presentation Mode'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className={`${isPresentationMode ? 'p-12' : 'p-6'}`}>
          {!selectedTextType && (
            <TextTypeSelector 
              onSelectType={handleSelectTextType} 
              isPresentationMode={isPresentationMode}
            />
          )}

          {selectedTextType && !selectedPassage && (
            <PassageSelector 
              textType={selectedTextType}
              onSelectPassage={handleSelectPassage}
              onBack={handleBack}
              isPresentationMode={isPresentationMode}
            />
          )}

          {selectedPassage && (
            <ReadingPassageComponent 
              passage={selectedPassage}
              onBack={handleBack}
              isPresentationMode={isPresentationMode}
            />
          )}
        </div>
      </div>

      {/* Teaching Tips */}
      {!isPresentationMode && !selectedPassage && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-green-800 mb-2">🎯 Teaching Tips</h4>
              <div className="text-green-700 space-y-2">
                <p><strong>Different text types</strong> develop different reading skills and strategies.</p>
                <p><strong>Fiction</strong> builds imagination and character analysis skills.</p>
                <p><strong>Non-fiction</strong> develops fact-finding and research abilities.</p>
                <p><strong>Poetry</strong> enhances language appreciation and rhythm recognition.</p>
                <p>Use <strong>Presentation Mode</strong> for whole-class reading activities!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingComprehension;