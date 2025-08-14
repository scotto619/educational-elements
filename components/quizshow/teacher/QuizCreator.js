// components/quizshow/teacher/QuizCreator.js - CUSTOM QUIZ CREATION INTERFACE
import React, { useState, useEffect } from 'react';
import { validateQuestion, validateQuiz, QUESTION_CATEGORIES, playQuizSound } from '../../../utils/quizShowHelpers';

const QuizCreator = ({ quiz, onSave, onCancel }) => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: 'general',
    questions: [],
    settings: {
      showCorrectAnswers: true,
      allowRetakes: false,
      shuffleQuestions: false,
      shuffleAnswers: true,
      timePerQuestion: 20
    }
  });
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timeLimit: 20,
    points: 1000
  });
  
  const [editingIndex, setEditingIndex] = useState(-1);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Initialize with existing quiz data if editing
  useEffect(() => {
    if (quiz) {
      setQuizData({
        title: quiz.title || '',
        description: quiz.description || '',
        category: quiz.category || 'general',
        questions: quiz.questions || [],
        settings: {
          showCorrectAnswers: quiz.settings?.showCorrectAnswers ?? true,
          allowRetakes: quiz.settings?.allowRetakes ?? false,
          shuffleQuestions: quiz.settings?.shuffleQuestions ?? false,
          shuffleAnswers: quiz.settings?.shuffleAnswers ?? true,
          timePerQuestion: quiz.settings?.timePerQuestion ?? 20
        }
      });
    }
  }, [quiz]);

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors.question) {
      setErrors(prev => ({ ...prev, question: null }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer >= index ? Math.max(0, prev.correctAnswer - 1) : prev.correctAnswer
      }));
    }
  };

  const saveQuestion = () => {
    const validation = validateQuestion(currentQuestion);
    
    if (!validation.isValid) {
      setErrors({ question: validation.errors.join(', ') });
      return;
    }

    const questionToSave = {
      ...currentQuestion,
      id: editingIndex >= 0 ? quizData.questions[editingIndex].id : `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (editingIndex >= 0) {
      // Update existing question
      const updatedQuestions = [...quizData.questions];
      updatedQuestions[editingIndex] = questionToSave;
      setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
    } else {
      // Add new question
      setQuizData(prev => ({ 
        ...prev, 
        questions: [...prev.questions, questionToSave]
      }));
    }

    // Reset form
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timeLimit: 20,
      points: 1000
    });
    setEditingIndex(-1);
    setErrors({});
    
    playQuizSound('answerSubmit');
  };

  const editQuestion = (index) => {
    setCurrentQuestion({ ...quizData.questions[index] });
    setEditingIndex(index);
    setErrors({});
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
      
      if (editingIndex === index) {
        setEditingIndex(-1);
        setCurrentQuestion({
          question: '',
          type: 'multiple_choice',
          options: ['', '', '', ''],
          correctAnswer: 0,
          timeLimit: 20,
          points: 1000
        });
      }
    }
  };

  const moveQuestion = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= quizData.questions.length) return;

    const updatedQuestions = [...quizData.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [updatedQuestions[newIndex], updatedQuestions[index]];
    
    setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleSave = () => {
    const validation = validateQuiz(quizData);
    
    if (!validation.isValid) {
      setErrors({ quiz: validation.errors });
      return;
    }

    const finalQuiz = {
      ...quizData,
      id: quiz?.id || `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: quiz?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSave(finalQuiz);
    playQuizSound('gameStart');
  };

  const QuestionCard = ({ question, index }) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-2">
            Question {index + 1}
          </h4>
          <p className="text-gray-700 text-sm mb-2">{question.question}</p>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option, optIndex) => (
              <span 
                key={optIndex}
                className={`px-2 py-1 rounded text-xs ${
                  optIndex === question.correctAnswer 
                    ? 'bg-green-100 text-green-700 font-semibold' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {String.fromCharCode(65 + optIndex)}: {option}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col space-y-1 ml-4">
          <button
            onClick={() => editQuestion(index)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => moveQuestion(index, 'up')}
            disabled={index === 0}
            className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-30"
            title="Move Up"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <button
            onClick={() => moveQuestion(index, 'down')}
            disabled={index === quizData.questions.length - 1}
            className="text-gray-600 hover:text-gray-800 p-1 disabled:opacity-30"
            title="Move Down"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={() => deleteQuestion(index)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center text-xs text-gray-500 space-x-4">
        <span>⏱️ {question.timeLimit}s</span>
        <span>🎯 {question.points} pts</span>
        <span>📊 {question.type.replace('_', ' ')}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {quiz ? 'Edit Quiz' : 'Create New Quiz'}
            </h1>
            <p className="text-gray-600 mt-2">
              Build an engaging quiz show experience for your students
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {showPreview ? 'Hide Preview' : 'Preview Quiz'}
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              Save Quiz
            </button>
          </div>
        </div>

        {/* Quiz Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={quizData.title}
              onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter quiz title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={quizData.category}
              onChange={(e) => setQuizData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              {Object.entries(QUESTION_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={quizData.description}
            onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this quiz covers..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Quiz Settings */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={quizData.settings.showCorrectAnswers}
              onChange={(e) => setQuizData(prev => ({
                ...prev,
                settings: { ...prev.settings, showCorrectAnswers: e.target.checked }
              }))}
              className="text-purple-600"
            />
            <span className="text-sm">Show Correct Answers</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={quizData.settings.shuffleQuestions}
              onChange={(e) => setQuizData(prev => ({
                ...prev,
                settings: { ...prev.settings, shuffleQuestions: e.target.checked }
              }))}
              className="text-purple-600"
            />
            <span className="text-sm">Shuffle Questions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={quizData.settings.shuffleAnswers}
              onChange={(e) => setQuizData(prev => ({
                ...prev,
                settings: { ...prev.settings, shuffleAnswers: e.target.checked }
              }))}
              className="text-purple-600"
            />
            <span className="text-sm">Shuffle Answers</span>
          </label>
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Default Time (seconds)
            </label>
            <input
              type="number"
              min="5"
              max="120"
              value={quizData.settings.timePerQuestion}
              onChange={(e) => setQuizData(prev => ({
                ...prev,
                settings: { ...prev.settings, timePerQuestion: parseInt(e.target.value) || 20 }
              }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Question Editor */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingIndex >= 0 ? 'Edit Question' : 'Add Question'}
        </h2>
        
        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Question *
            </label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => handleQuestionChange('question', e.target.value)}
              placeholder="Enter your question here..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Answer Options *
            </label>
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === index}
                      onChange={() => handleQuestionChange('correctAnswer', index)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm font-semibold text-gray-600">
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  {currentQuestion.options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Remove option"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {currentQuestion.options.length < 6 && (
              <button
                onClick={addOption}
                className="mt-2 text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Option</span>
              </button>
            )}
          </div>

          {/* Question Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={currentQuestion.timeLimit}
                onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                min="100"
                max="5000"
                step="100"
                value={currentQuestion.points}
                onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1000)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Type
              </label>
              <select
                value={currentQuestion.type}
                onChange={(e) => handleQuestionChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
              </select>
            </div>
          </div>

          {/* Error Display */}
          {errors.question && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-semibold">{errors.question}</p>
            </div>
          )}

          {/* Save Question Button */}
          <div className="flex justify-end space-x-3">
            {editingIndex >= 0 && (
              <button
                onClick={() => {
                  setEditingIndex(-1);
                  setCurrentQuestion({
                    question: '',
                    type: 'multiple_choice',
                    options: ['', '', '', ''],
                    correctAnswer: 0,
                    timeLimit: 20,
                    points: 1000
                  });
                  setErrors({});
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel Edit
              </button>
            )}
            <button
              onClick={saveQuestion}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {editingIndex >= 0 ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Questions ({quizData.questions.length})
          </h2>
          {quizData.questions.length > 0 && (
            <p className="text-gray-600">
              Estimated duration: {Math.ceil(quizData.questions.reduce((sum, q) => sum + (q.timeLimit || 20), 0) / 60)} minutes
            </p>
          )}
        </div>
        
        {quizData.questions.length > 0 ? (
          <div className="space-y-4">
            {quizData.questions.map((question, index) => (
              <QuestionCard key={question.id || index} question={question} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Questions Yet</h3>
            <p className="text-gray-500">Add your first question using the form above</p>
          </div>
        )}
      </div>

      {/* Quiz Validation Errors */}
      {errors.quiz && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Please fix these issues:</h3>
          <ul className="list-disc list-inside space-y-1">
            {errors.quiz.map((error, index) => (
              <li key={index} className="text-red-600 text-sm">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QuizCreator;