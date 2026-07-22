// components/quizshow/teacher/QuizCreator.js — QUIZ BUILDER
// Dark arena theme, four question types: multiple choice, true/false,
// picture questions, and "Closest Wins" estimation questions.
import React, { useState, useEffect } from 'react';
import { validateQuestion, validateQuiz, QUESTION_CATEGORIES, QUESTION_TYPES, playQuizSound } from '../../../utils/quizShowHelpers';

const EMPTY_QUESTION = {
  question: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correctAnswer: 0,
  timeLimit: 20,
  points: 1000,
  answerValue: '',
  unit: '',
  media: null,
};

const ANSWER_STYLES = [
  { bg: 'bg-rose-500', shape: '▲' },
  { bg: 'bg-blue-500', shape: '◆' },
  { bg: 'bg-amber-500', shape: '●' },
  { bg: 'bg-emerald-500', shape: '■' },
  { bg: 'bg-violet-500', shape: '★' },
  { bg: 'bg-cyan-500', shape: '⬟' },
];

const inputCls = "w-full px-4 py-2.5 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-400 transition";
const labelCls = "block text-sm font-bold text-slate-300 mb-2";

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

  const [currentQuestion, setCurrentQuestion] = useState({ ...EMPTY_QUESTION });
  const [editingIndex, setEditingIndex] = useState(-1);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

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

  const resetQuestionForm = () => {
    setCurrentQuestion({ ...EMPTY_QUESTION, options: ['', '', '', ''] });
    setEditingIndex(-1);
    setErrors({});
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    if (errors.question) setErrors(prev => ({ ...prev, question: null }));
  };

  const handleTypeChange = (type) => {
    setCurrentQuestion(prev => {
      const next = { ...prev, type };
      if (type === 'true_false') {
        next.options = ['True', 'False'];
        next.correctAnswer = Math.min(prev.correctAnswer, 1);
      } else if (type === 'multiple_choice' || type === 'image') {
        if (!prev.options || prev.options.length < 2 || (prev.options.length === 2 && prev.options[0] === 'True')) {
          next.options = ['', '', '', ''];
          next.correctAnswer = 0;
        }
      }
      return next;
    });
    setErrors({});
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({ ...prev, options: [...prev.options, ''] }));
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
    const toValidate = {
      ...currentQuestion,
      media: currentQuestion.type === 'image' ? currentQuestion.media : (currentQuestion.media?.url ? currentQuestion.media : null),
    };
    const validation = validateQuestion(toValidate);

    if (!validation.isValid) {
      setErrors({ question: validation.errors.join(', ') });
      return;
    }

    const questionToSave = {
      ...toValidate,
      answerValue: toValidate.type === 'estimation' ? Number(toValidate.answerValue) : null,
      options: toValidate.type === 'estimation' ? [] : toValidate.options,
      id: editingIndex >= 0 ? quizData.questions[editingIndex].id : `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    if (editingIndex >= 0) {
      const updatedQuestions = [...quizData.questions];
      updatedQuestions[editingIndex] = questionToSave;
      setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
    } else {
      setQuizData(prev => ({ ...prev, questions: [...prev.questions, questionToSave] }));
    }

    resetQuestionForm();
    playQuizSound('answerSubmit');
  };

  const editQuestion = (index) => {
    const q = quizData.questions[index];
    setCurrentQuestion({
      ...EMPTY_QUESTION,
      ...q,
      options: q.options?.length ? [...q.options] : ['', '', '', ''],
      answerValue: q.answerValue ?? '',
      unit: q.unit || '',
    });
    setEditingIndex(index);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Delete this question?')) {
      const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
      setQuizData(prev => ({ ...prev, questions: updatedQuestions }));
      if (editingIndex === index) resetQuestionForm();
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
      firestoreId: quiz?.firestoreId,
      createdAt: quiz?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    onSave(finalQuiz);
    playQuizSound('gameStart');
  };

  const typeInfo = QUESTION_TYPES[currentQuestion.type] || QUESTION_TYPES.multiple_choice;
  const isEstimation = currentQuestion.type === 'estimation';
  const isTrueFalse = currentQuestion.type === 'true_false';
  const needsImage = currentQuestion.type === 'image';

  const QuestionCard = ({ question, index }) => {
    const qType = QUESTION_TYPES[question.type] || QUESTION_TYPES.multiple_choice;
    return (
      <div className="bg-white/5 rounded-2xl border-2 border-white/10 p-4 hover:border-fuchsia-400/40 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h4 className="font-bold text-white">Q{index + 1}</h4>
              <span className="text-xs font-semibold text-slate-300 bg-white/10 rounded-full px-2 py-0.5">{qType.icon} {qType.name}</span>
              {question.media?.url && <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 rounded-full px-2 py-0.5">🖼️ image</span>}
            </div>
            <p className="text-slate-200 text-sm mb-2">{question.question}</p>
            {question.type === 'estimation' ? (
              <span className="inline-block px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                🎯 Answer: {Number(question.answerValue).toLocaleString()} {question.unit}
              </span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {question.options?.map((option, optIndex) => (
                  <span key={optIndex}
                    className={`px-2 py-1 rounded text-xs ${
                      optIndex === question.correctAnswer
                        ? 'bg-emerald-500/25 text-emerald-300 font-semibold'
                        : 'bg-white/10 text-slate-400'
                    }`}>
                    {String.fromCharCode(65 + optIndex)}: {option}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button onClick={() => editQuestion(index)} className="text-sky-300 hover:text-sky-200 p-1 text-sm" title="Edit">✏️</button>
            <button onClick={() => moveQuestion(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-white p-1 disabled:opacity-20 text-sm" title="Move Up">▲</button>
            <button onClick={() => moveQuestion(index, 'down')} disabled={index === quizData.questions.length - 1} className="text-slate-400 hover:text-white p-1 disabled:opacity-20 text-sm" title="Move Down">▼</button>
            <button onClick={() => deleteQuestion(index)} className="text-rose-400 hover:text-rose-300 p-1 text-sm" title="Delete">🗑️</button>
          </div>
        </div>
        <div className="flex items-center text-xs text-slate-500 gap-4 mt-2">
          <span>⏱️ {question.timeLimit}s</span>
          <span>🎯 {question.points} pts</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-3xl bg-slate-950 border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-700 to-purple-800 px-6 md:px-8 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {quiz ? '✏️ Edit Quiz' : '🎨 Create New Quiz'}
            </h1>
            <p className="text-fuchsia-200 text-sm mt-1">
              Mix question types to keep your class on their toes
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowPreview(!showPreview)}
              className="bg-white/15 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/25 transition-colors">
              {showPreview ? '🙈 Hide Preview' : '👀 Preview'}
            </button>
            <button onClick={onCancel}
              className="bg-white/15 text-white px-4 py-2 rounded-xl font-bold hover:bg-white/25 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-black hover:bg-emerald-400 transition-colors shadow-lg">
              💾 Save Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Quiz basics */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Quiz Title *</label>
              <input type="text" value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter quiz title…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={quizData.category}
                onChange={(e) => setQuizData(prev => ({ ...prev, category: e.target.value }))}
                className={inputCls}>
                {Object.entries(QUESTION_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key} className="text-gray-900">{category.icon} {category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className={labelCls}>Description</label>
            <textarea value={quizData.description}
              onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this quiz covers…" rows={2} className={inputCls} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            {[
              ['showCorrectAnswers', 'Show correct answers'],
              ['shuffleQuestions', 'Shuffle questions'],
              ['shuffleAnswers', 'Shuffle answers'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input type="checkbox" checked={quizData.settings[key]}
                  onChange={(e) => setQuizData(prev => ({
                    ...prev, settings: { ...prev.settings, [key]: e.target.checked }
                  }))}
                  className="accent-fuchsia-500 w-4 h-4" />
                {label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm text-slate-300">
              Default time
              <input type="number" min="5" max="120" value={quizData.settings.timePerQuestion}
                onChange={(e) => setQuizData(prev => ({
                  ...prev, settings: { ...prev.settings, timePerQuestion: parseInt(e.target.value) || 20 }
                }))}
                className="w-20 px-2 py-1 bg-white/5 border-2 border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-fuchsia-400" />
              sec
            </label>
          </div>
        </div>

        {/* Question editor */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black text-white mb-5">
            {editingIndex >= 0 ? `✏️ Edit Question ${editingIndex + 1}` : '➕ Add Question'}
          </h2>

          {/* Type picker */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            {Object.values(QUESTION_TYPES).map(t => (
              <button key={t.id} onClick={() => handleTypeChange(t.id)}
                className={`rounded-xl p-3 text-left border-2 transition-all ${
                  currentQuestion.type === t.id
                    ? 'border-fuchsia-400 bg-fuchsia-500/15'
                    : 'border-white/10 bg-white/5 hover:border-fuchsia-400/40'
                }`}>
                <div className="text-xl mb-1">{t.icon}</div>
                <div className="text-sm font-bold text-white leading-tight">{t.name}</div>
                <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{t.description}</div>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {/* Question text */}
            <div>
              <label className={labelCls}>Question *</label>
              <textarea value={currentQuestion.question}
                onChange={(e) => handleQuestionChange('question', e.target.value)}
                placeholder={isEstimation ? 'e.g. How many bones are in the human body?' : 'Enter your question here…'}
                rows={2} className={inputCls} />
            </div>

            {/* Image URL (picture questions, or optional extra for others) */}
            {(needsImage || currentQuestion.media?.url) && (
              <div>
                <label className={labelCls}>Image URL {needsImage ? '*' : '(optional)'}</label>
                <input type="text" value={currentQuestion.media?.url || ''}
                  onChange={(e) => handleQuestionChange('media', e.target.value ? { type: 'image', url: e.target.value } : null)}
                  placeholder="https://… or /path/to/image.png" className={inputCls} />
                {currentQuestion.media?.url && (
                  <img src={currentQuestion.media.url} alt="Preview"
                    className="mt-3 max-h-40 rounded-xl border-2 border-white/15 object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                    onLoad={(e) => { e.target.style.display = ''; }} />
                )}
              </div>
            )}
            {!needsImage && !currentQuestion.media?.url && (
              <button onClick={() => handleQuestionChange('media', { type: 'image', url: '' })}
                className="text-sky-300 hover:text-sky-200 font-semibold text-sm">
                🖼️ + Attach an image to this question
              </button>
            )}

            {/* Answers */}
            {isEstimation ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Correct Number *</label>
                  <input type="number" value={currentQuestion.answerValue}
                    onChange={(e) => handleQuestionChange('answerValue', e.target.value)}
                    placeholder="e.g. 206" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Unit (optional)</label>
                  <input type="text" value={currentQuestion.unit}
                    onChange={(e) => handleQuestionChange('unit', e.target.value)}
                    placeholder="e.g. bones, km, kg" className={inputCls} />
                </div>
                <p className="sm:col-span-2 text-xs text-slate-400 bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-3">
                  🎯 <strong className="text-emerald-300">Closest Wins:</strong> students type a guess. An exact answer scores full points, and points scale down the further away they are. Within 25% still counts as "correct".
                </p>
              </div>
            ) : (
              <div>
                <label className={labelCls}>Answer Options * <span className="text-slate-500 font-normal">(tick the correct one)</span></label>
                <div className="space-y-2.5">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <button onClick={() => handleQuestionChange('correctAnswer', index)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm shrink-0 transition ${
                          currentQuestion.correctAnswer === index
                            ? 'bg-emerald-500 border-emerald-400 text-white'
                            : 'border-white/20 text-slate-400 hover:border-emerald-400'
                        }`}
                        title="Mark as correct">
                        {currentQuestion.correctAnswer === index ? '✓' : String.fromCharCode(65 + index)}
                      </button>
                      <div className={`w-8 h-8 rounded-lg ${ANSWER_STYLES[index % 6].bg} flex items-center justify-center text-white text-sm font-black shrink-0`}>
                        {ANSWER_STYLES[index % 6].shape}
                      </div>
                      <input type="text" value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        disabled={isTrueFalse}
                        className={`${inputCls} disabled:opacity-60`} />
                      {!isTrueFalse && currentQuestion.options.length > 2 && (
                        <button onClick={() => removeOption(index)}
                          className="text-rose-400 hover:text-rose-300 p-1 shrink-0" title="Remove option">✖</button>
                      )}
                    </div>
                  ))}
                </div>
                {!isTrueFalse && currentQuestion.options.length < 6 && (
                  <button onClick={addOption}
                    className="mt-3 text-sky-300 hover:text-sky-200 font-semibold text-sm">
                    ➕ Add Option
                  </button>
                )}
              </div>
            )}

            {/* Time & points */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div>
                <label className={labelCls}>Time Limit (sec)</label>
                <input type="number" min="5" max="120" value={currentQuestion.timeLimit}
                  onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value) || 20)}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Points</label>
                <input type="number" min="100" max="5000" step="100" value={currentQuestion.points}
                  onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1000)}
                  className={inputCls} />
              </div>
            </div>

            {errors.question && (
              <div className="bg-rose-500/10 border border-rose-400/40 rounded-xl p-3">
                <p className="text-rose-300 text-sm font-semibold">{errors.question}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              {editingIndex >= 0 && (
                <button onClick={resetQuestionForm}
                  className="px-4 py-2 bg-white/10 text-slate-200 rounded-xl font-semibold hover:bg-white/20 transition-colors">
                  Cancel Edit
                </button>
              )}
              <button onClick={saveQuestion}
                className="bg-fuchsia-600 text-white px-6 py-2.5 rounded-xl font-black hover:bg-fuchsia-500 transition-colors shadow-lg">
                {editingIndex >= 0 ? '✔ Update Question' : '➕ Add Question'}
              </button>
            </div>
          </div>
        </div>

        {/* Question list */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-xl font-black text-white">
              📋 Questions ({quizData.questions.length})
            </h2>
            {quizData.questions.length > 0 && (
              <p className="text-slate-400 text-sm">
                ~{Math.ceil(quizData.questions.reduce((sum, q) => sum + (q.timeLimit || 20), 0) / 60)} min play time
              </p>
            )}
          </div>

          {quizData.questions.length > 0 ? (
            <div className="space-y-3">
              {quizData.questions.map((question, index) => (
                <QuestionCard key={question.id || index} question={question} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">❓</div>
              <h3 className="text-lg font-bold text-white mb-1">No questions yet</h3>
              <p className="text-slate-400 text-sm">Add your first question using the editor above</p>
            </div>
          )}
        </div>

        {/* Validation errors */}
        {errors.quiz && (
          <div className="bg-rose-500/10 border border-rose-400/40 rounded-2xl p-4">
            <h3 className="font-bold text-rose-300 mb-2">Please fix these issues:</h3>
            <ul className="list-disc list-inside space-y-1">
              {errors.quiz.map((error, index) => (
                <li key={index} className="text-rose-300/90 text-sm">{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-1">👀 Student Preview</h2>
            <p className="text-slate-400 text-sm mb-5">How each question will look on the big screen.</p>

            {quizData.questions.length === 0 ? (
              <p className="text-center py-8 text-slate-500">Add questions to see a preview.</p>
            ) : (
              <div className="space-y-5">
                {quizData.questions.map((q, i) => (
                  <div key={q.id || i} className="rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-violet-700 to-fuchsia-700 px-5 py-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide text-white/70">
                          Q{i + 1} · {(QUESTION_TYPES[q.type] || QUESTION_TYPES.multiple_choice).name}
                        </span>
                        <span className="text-xs text-white/70">⏱ {q.timeLimit}s · 🎯 {q.points} pts</span>
                      </div>
                      <p className="text-lg font-bold text-white">{q.question}</p>
                      {q.media?.url && (
                        <img src={q.media.url} alt="" className="mt-2 max-h-32 rounded-lg object-contain" />
                      )}
                    </div>
                    {q.type === 'estimation' ? (
                      <div className="p-4 bg-slate-900 text-center">
                        <span className="inline-block bg-emerald-500/20 text-emerald-300 rounded-xl px-4 py-2 font-bold text-sm">
                          🎯 Students guess a number — answer: {Number(q.answerValue).toLocaleString()} {q.unit}
                        </span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-4 bg-slate-900">
                        {q.options?.map((opt, oi) => (
                          <div key={oi} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-white font-semibold text-sm ${ANSWER_STYLES[oi % 6].bg} ${oi === q.correctAnswer ? 'ring-2 ring-white' : 'opacity-75'}`}>
                            <span>{ANSWER_STYLES[oi % 6].shape}</span>
                            <span className="flex-1">{opt || <span className="opacity-50 italic">Empty</span>}</span>
                            {oi === q.correctAnswer && <span className="font-black">✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizCreator;
