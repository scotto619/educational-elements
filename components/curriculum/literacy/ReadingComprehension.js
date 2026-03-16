// components/curriculum/literacy/ReadingComprehension.js
// READING COMPREHENSION COMPONENT WITH INTERACTIVE TEXTS AND FULL-SIZE VIEW
import React, { useState, useRef } from 'react';
import { readingComprehensionContent, getTextTypes, getPassagesByDifficulty } from './data/reading-comprehension-content';

// ===============================================
// TOOLTIP COMPONENT FOR GLOSSARY
// ===============================================
const Tooltip = ({ text, children, isPresentationMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const spanRef = useRef(null);

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10,
        left: rect.left + (rect.width / 2)
      });
      setIsVisible(true);
    }
  };

  return (
    <span
      className="relative inline-block cursor-help group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsVisible(false)}
      ref={spanRef}
    >
      {/* The word itself */}
      <span className="border-b-2 border-dotted border-blue-400 text-blue-700 font-medium transition-colors hover:bg-blue-50 py-0.5 rounded">
        {children}
      </span>

      {/* Tooltip portal/floating element (simplified for inline rendering) */}
      {isVisible && (
        <span
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 pointer-events-none animate-fade-in-up"
          style={{ top: position.top, left: position.left }}
        >
          <span className={`block max-w-[250px] bg-slate-800 text-white rounded-xl shadow-xl border border-slate-700 ${isPresentationMode ? 'text-2xl p-6 min-w-[300px]' : 'text-sm p-4'}`}>
            <span className="block font-bold text-blue-300 mb-1 capitalize border-b border-slate-600 pb-1">{children}</span>
            {text}
            {/* Down arrow */}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-800"></span>
          </span>
        </span>
      )}
    </span>
  );
};

// ===============================================
// INTERACTIVE TEXT RENDERER
// ===============================================
const InteractiveTextRenderer = ({ text, glossary, isPickMode, onWordClick, isPresentationMode }) => {
  // Split text by paragraphs first
  const paragraphs = text.split('\n');

  return (
    <>
      {paragraphs.map((paragraph, pIndex) => {
        if (!paragraph.trim()) return <br key={`p-${pIndex}`} className="block my-4" />;

        // Split paragraph into tokens (words and punctuation)
        // \w+ matches words (including numbers), [^\w\s]+ matches punctuation, \s+ matches spaces
        // But we want to keep punctuation separate from words.
        // A better regex that handles words with hyphens or apostrophes:
        const tokens = paragraph.match(/[a-zA-Z0-9'-]+|[^\w\s]+|\s+/g) || [];

        return (
          <p key={`p-${pIndex}`} className="mb-6">
            {tokens.map((token, tIndex) => {
              const isSpace = /^\s+$/.test(token);
              if (isSpace) return <span key={`t-${pIndex}-${tIndex}`}>{token}</span>;

              const isWord = /[a-zA-Z0-9]+/.test(token);
              if (!isWord) return <span key={`t-${pIndex}-${tIndex}`} className="text-gray-600">{token}</span>;

              // It's a word
              const cleanWord = token.toLowerCase().replace(/^['"-]+|['"-]+$/g, '');
              const hasGlossary = glossary && glossary[cleanWord];

              if (isPickMode) {
                return (
                  <button
                    key={`t-${pIndex}-${tIndex}`}
                    onClick={() => onWordClick(cleanWord, token)}
                    className={`hover:bg-purple-200 hover:text-purple-800 hover:scale-110 transition-all rounded px-1 cursor-pointer ring-0 focus:outline-none focus:ring-2 focus:ring-purple-400 ${isPresentationMode ? 'hover:font-bold' : ''}`}
                    title="Click to select this word"
                  >
                    {token}
                  </button>
                );
              }

              if (hasGlossary) {
                return (
                  <Tooltip key={`t-${pIndex}-${tIndex}`} text={glossary[cleanWord]} isPresentationMode={isPresentationMode}>
                    {token}
                  </Tooltip>
                );
              }

              return <span key={`t-${pIndex}-${tIndex}`}>{token}</span>;
            })}
          </p>
        );
      })}
    </>
  );
};

// ===============================================
// TEXT TYPE SELECTOR COMPONENT
// ===============================================
const TextTypeSelector = ({ onSelectType, isPresentationMode }) => {
  const textTypes = getTextTypes();

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h3 className={`font-extrabold text-gray-800 mb-4 tracking-tight ${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>
          Choose Your Reading Journey
        </h3>
        <p className={`text-gray-500 font-medium ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
          Select a category to begin exploring stories, facts, and more.
        </p>
      </div>

      <div className={`grid gap-8 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 p-8' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {textTypes.map(textType => (
          <button
            key={textType.id}
            onClick={() => onSelectType(textType)}
            className={`group relative overflow-hidden bg-gradient-to-br ${textType.color} text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left ${isPresentationMode ? 'p-12 min-h-[300px]' : 'min-h-[220px]'}`}
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-4">
                <span className={`drop-shadow-lg ${isPresentationMode ? 'text-7xl' : 'text-5xl'}`}>{textType.icon}</span>
                <span className={`bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-semibold ${isPresentationMode ? 'text-xl' : 'text-xs'}`}>
                  {textType.passages.length} collection{textType.passages.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div>
                <h4 className={`font-bold tracking-tight mb-2 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>{textType.name}</h4>
                <p className={`text-white/80 font-medium ${isPresentationMode ? 'text-2xl leading-snug' : 'text-sm'}`}>
                  {textType.description}
                </p>
              </div>
            </div>
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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full bg-gradient-to-br ${textType.color} text-white shadow-lg`}>
            <span className={`${isPresentationMode ? 'text-6xl' : 'text-3xl'}`}>{textType.icon}</span>
          </div>
          <div>
            <h3 className={`font-extrabold text-gray-800 tracking-tight ${isPresentationMode ? 'text-5xl' : 'text-2xl'}`}>
              {textType.name}
            </h3>
            <p className={`text-gray-500 font-medium ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
              Select a passage to read
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className={`flex items-center gap-2 bg-white text-gray-600 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
        >
          ← Back to Categories
        </button>
      </div>

      <div className={`grid gap-8 ${isPresentationMode ? 'grid-cols-1 p-8' : 'grid-cols-1 md:grid-cols-2'}`}>
        {textType.passages.map(passage => (
          <button
            key={passage.id}
            onClick={() => onSelectPassage(passage)}
            className="group flex flex-col justify-between bg-white rounded-3xl shadow-md hover:shadow-2xl border border-gray-100 overflow-hidden text-left hover:-translate-y-1 transition-all duration-300 min-h-[250px]"
          >
            <div className={`h-3 w-full bg-gradient-to-r ${textType.color}`}></div>

            <div className={`p-6 md:p-8 flex-grow flex flex-col ${isPresentationMode ? 'p-12' : ''}`}>
              <div className="flex justify-between items-start mb-4 gap-4">
                <h4 className={`font-bold text-gray-800 tracking-tight leading-tight ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
                  {passage.title}
                </h4>
                {passage.isMultiLevel ? (
                  <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 ${isPresentationMode ? 'text-lg px-6 py-3' : ''}`}>
                    Multi-Level
                  </span>
                ) : (
                  <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${passage.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      passage.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    } ${isPresentationMode ? 'text-lg px-6 py-3' : ''}`}>
                    {passage.difficulty}
                  </span>
                )}
              </div>

              <div className="space-y-4 flex-grow">
                {passage.isMultiLevel ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className={`text-gray-600 font-medium ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                      📚 Available Levels: {passage.levels.map(l => l.readingLevel).join(', ')}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-4">
                    <p className={`text-gray-600 font-medium ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                      📚 {passage.readingLevel}
                    </p>
                    <p className={`text-gray-600 font-medium ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                      📝 {passage.wordCount} words
                    </p>
                  </div>
                )}

                <p className={`text-gray-600 leading-relaxed ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                  {passage.isMultiLevel
                    ? passage.levels[0].text.substring(0, 120) + '...'
                    : passage.text.substring(0, 120) + '...'}
                </p>
              </div>

              {(!passage.isMultiLevel && passage.teachingFocus) && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {passage.teachingFocus.slice(0, 2).map((focus, i) => (
                    <span key={i} className={`px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium ${isPresentationMode ? 'text-lg px-4 py-2' : ''}`}>
                      {focus}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <span className={`inline-flex items-center gap-2 font-bold group-hover:gap-4 transition-all ${textType.color.split(' ')[1].replace('to-', 'text-')} ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                  {passage.isMultiLevel ? 'Select Level' : 'Start Reading'} <span aria-hidden="true">&rarr;</span>
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ===============================================
// LEVEL SELECTOR COMPONENT (For Multi-level texts)
// ===============================================
const LevelSelector = ({ passage, onSelectLevel, onBack, isPresentationMode }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <div>
          <h3 className={`font-extrabold text-gray-800 tracking-tight ${isPresentationMode ? 'text-5xl' : 'text-3xl'}`}>
            {passage.title}
          </h3>
          <p className={`text-gray-500 font-medium mt-2 ${isPresentationMode ? 'text-2xl' : 'text-lg'}`}>
            Choose a reading level that works best for you
          </p>
        </div>
        <button
          onClick={onBack}
          className={`shrink-0 flex items-center gap-2 bg-white text-gray-600 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all ${isPresentationMode ? 'px-12 py-6 text-3xl' : 'px-6 py-3'}`}
        >
          ← Back
        </button>
      </div>

      <div className={`grid gap-6 ${isPresentationMode ? 'grid-cols-1 p-8' : 'grid-cols-1 md:grid-cols-3'}`}>
        {passage.levels.map((level, index) => {
          const colorClass = level.difficulty === 'beginner' ? 'from-green-400 to-emerald-500' :
            level.difficulty === 'intermediate' ? 'from-blue-400 to-indigo-500' :
              'from-purple-500 to-pink-500';
          const bgClass = level.difficulty === 'beginner' ? 'bg-green-50/50' :
            level.difficulty === 'intermediate' ? 'bg-blue-50/50' :
              'bg-purple-50/50';

          return (
            <button
              key={index}
              onClick={() => onSelectLevel({ ...passage, ...level, isMultiLevel: false, title: `${passage.title} (${level.readingLevel})` })}
              className={`group flex flex-col justify-between rounded-3xl p-8 border-2 border-transparent hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 ${bgClass} text-left min-h-[300px] hover:-translate-y-2`}
            >
              <div>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorClass} text-white flex items-center justify-center font-bold text-2xl shadow-lg mb-6`}>
                  {index + 1}
                </div>
                <h4 className={`font-extrabold text-gray-800 mb-2 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>
                  {level.difficulty.charAt(0).toUpperCase() + level.difficulty.slice(1)}
                </h4>
                <p className={`font-bold text-gray-600 mb-4 ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                  {level.readingLevel}
                </p>
                <div className="space-y-2 mb-6">
                  <p className={`text-gray-500 font-medium ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                    📝 {level.wordCount} words
                  </p>
                  <p className={`text-gray-500 font-medium ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                    ❓ {level.questions.length} questions
                  </p>
                </div>
              </div>
              <div className={`mt-auto inline-flex items-center gap-2 font-bold rounded-xl px-6 py-3 text-white bg-gradient-to-r w-fit ${colorClass} shadow-md group-hover:scale-105 transition-transform ${isPresentationMode ? 'text-2xl' : 'text-sm'}`}>
                Select Level <span aria-hidden="true">&rarr;</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ===============================================
// QUESTION COMPONENT
// ===============================================
const QuestionComponent = ({ question, answer, onAnswerChange, showResult, isPresentationMode, index, onActivateClickWord, isClickWordActive }) => {
  const isCorrect = question.type === 'multiple_choice'
    ? answer === question.correctAnswer
    : question.type === 'click_word'
      ? answer && answer.toLowerCase() === question.correctAnswer.toLowerCase()
      : answer && answer.toLowerCase().includes(question.keyWords?.[0]?.toLowerCase() || '');

  return (
    <div className={`group relative bg-white rounded-2xl border ${showResult ? (isCorrect ? 'border-green-200 shadow-green-100' : 'border-red-200 shadow-red-100') : isClickWordActive ? 'border-purple-400 ring-4 ring-purple-100' : 'border-gray-100'} shadow-sm p-6 lg:p-8 transition-all duration-300 ${isPresentationMode ? 'p-12 mb-8' : 'mb-6'}`}>

      {/* Click word active indicator */}
      {isClickWordActive && !showResult && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md animate-pulse">
          Select word in text
        </div>
      )}

      <div className="flex gap-4">
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${showResult ? (isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700') : isClickWordActive ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} ${isPresentationMode ? 'w-16 h-16 text-2xl' : 'text-lg'}`}>
          {index + 1}
        </div>
        <div className="w-full space-y-4">
          <h4 className={`font-bold text-gray-800 leading-snug ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
            {question.question}
          </h4>

          {question.type === 'multiple_choice' ? (
            <div className="space-y-3 mt-6">
              {question.options.map((option, optIndex) => {
                const isSelected = answer === optIndex;
                const isCorrectOption = optIndex === question.correctAnswer;

                let btnStyle = 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50';
                if (showResult) {
                  if (isCorrectOption) {
                    btnStyle = 'border-green-500 bg-green-50 text-green-800 font-medium ring-2 ring-green-200';
                  } else if (isSelected) {
                    btnStyle = 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-200';
                  } else {
                    btnStyle = 'border-gray-200 bg-gray-50 text-gray-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-blue-500 bg-blue-50 text-blue-800 font-medium ring-2 ring-blue-200';
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => !showResult && onAnswerChange(optIndex)}
                    disabled={showResult}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${btnStyle} ${isPresentationMode ? 'text-3xl p-6' : 'text-base'}`}
                  >
                    <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold ${showResult && isCorrectOption ? 'bg-green-200 text-green-800' : isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'} ${isPresentationMode ? 'w-12 h-12 text-2xl' : ''}`}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="flex-grow">{option}</span>
                    {showResult && isCorrectOption && <span className="text-2xl">✅</span>}
                    {showResult && isSelected && !isCorrectOption && <span className="text-2xl">❌</span>}
                  </button>
                );
              })}
            </div>
          ) : question.type === 'click_word' ? (
            <div className="mt-4">
              {!showResult ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <button
                    onClick={onActivateClickWord}
                    className={`shrink-0 px-6 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${isClickWordActive ? 'bg-purple-600 text-white ring-2 ring-purple-300 ring-offset-1' : 'bg-white border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                    {isClickWordActive ? 'Select a word...' : answer ? 'Change Selection' : 'Pick Word from Text'}
                  </button>
                  <div className="flex-grow flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-gray-200 w-full">
                    <span className="text-gray-400 font-medium whitespace-nowrap">Selected:</span>
                    {answer ? (
                      <span className="font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-md">{answer}</span>
                    ) : (
                      <span className="text-gray-400 italic">None</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="text-gray-500 font-medium">Your answer:</span>
                  <span className={`font-bold px-4 py-2 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 line-through opacity-70'}`}>
                    {answer || 'No answer'}
                  </span>
                  {!isCorrect && <span className="font-bold bg-green-100 text-green-800 px-4 py-2 rounded-lg ml-auto">Correct: {question.correctAnswer}</span>}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <textarea
                value={answer || ''}
                onChange={(e) => !showResult && onAnswerChange(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer here..."
                className={`w-full p-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none resize-none transition-all ${showResult
                    ? isCorrect ? 'border-green-400 bg-green-50/30' : 'border-yellow-400 bg-yellow-50/30'
                    : 'border-gray-200 bg-gray-50'
                  } ${isPresentationMode ? 'text-3xl p-6 min-h-[200px]' : 'text-base min-h-[120px]'}`}
              />
            </div>
          )}

          {/* Feedback/Explanation Box */}
          {showResult && (
            <div className={`mt-6 p-6 rounded-xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : (question.type === 'multiple_choice' || question.type === 'click_word') ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'} animate-fade-in-up`}>
              <p className={`font-bold mb-2 ${isCorrect ? 'text-green-800' : (question.type === 'multiple_choice' || question.type === 'click_word') ? 'text-red-800' : 'text-yellow-800'} ${isPresentationMode ? 'text-3xl' : 'text-lg'}`}>
                {isCorrect ? 'Excellent!' : question.type === 'short_answer' ? 'Sample Answer:' : 'Incorrect'}
              </p>
              <p className={`text-gray-700 leading-relaxed ${isPresentationMode ? 'text-2xl' : 'text-base'}`}>
                {question.type === 'multiple_choice' || question.type === 'click_word' ? question.explanation : question.suggestedAnswer}
              </p>
              {question.type === 'short_answer' && question.keyWords && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`text-gray-500 font-medium ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>Key concepts:</span>
                  {question.keyWords.map((kw, i) => (
                    <span key={i} className={`bg-white/60 px-2 py-1 rounded text-gray-700 border border-gray-200 ${isPresentationMode ? 'text-xl' : 'text-xs'}`}>
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===============================================
// SPLIT-PANE READING VIEW COMPONENT
// ===============================================
const SplitPaneReadingView = ({ passage, onBack, isPresentationMode }) => {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [activeClickWordQuestionId, setActiveClickWordQuestionId] = useState(null);
  const [isFullscreenText, setIsFullscreenText] = useState(false);
  const printRef = useRef(null);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleWordClick = (word, rawToken) => {
    if (activeClickWordQuestionId) {
      handleAnswerChange(activeClickWordQuestionId, word);
      setActiveClickWordQuestionId(null); // deactivate pick mode after selection
    }
  };

  const calculateScore = () => {
    let correct = 0;
    passage.questions.forEach(question => {
      const answer = answers[question.id];
      if (question.type === 'multiple_choice') {
        if (answer === question.correctAnswer) correct++;
      } else if (question.type === 'click_word') {
        if (answer && answer.toLowerCase() === question.correctAnswer.toLowerCase()) correct++;
      } else {
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
    // Formats the passage for printing
    const printWindow = window.open('', 'Print', 'height=800,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>${passage.title} - Reading Comprehension</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { color: #1f2937; margin-bottom: 10px; }
            .meta { color: #6b7280; font-size: 14px; }
            .passage { margin-bottom: 40px; font-size: 16px; line-height: 1.8; }
            .questions { margin-top: 30px; page-break-before: always; }
            .question { margin-bottom: 25px; padding: 15px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; page-break-inside: avoid; }
            .question-title { font-weight: bold; margin-bottom: 10px; }
            .answer-space { border-bottom: 1px solid #9ca3af; min-height: 40px; margin-top: 15px; }
            .options { margin-left: 20px; }
            .option { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${passage.title}</h1>
            <div class="meta">Reading Level: ${passage.readingLevel} | Word Count: ${passage.wordCount}</div>
          </div>
          <div class="passage">
            ${passage.text.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}
          </div>
          <div class="questions">
            <h2>Comprehension Questions</h2>
            ${passage.questions.map((q, i) => `
              <div class="question">
                <div class="question-title">${i + 1}. ${q.question}</div>
                ${q.type === 'multiple_choice' ?
        `<div class="options">
                    ${q.options.map((opt, j) => `<div class="option">${String.fromCharCode(65 + j)}. ${opt}</div>`).join('')}
                  </div>` :
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
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const score = showResults ? calculateScore() : null;
  const isAllAnswered = passage.questions.every(q => answers[q.id] !== undefined && answers[q.id] !== '');

  return (
    <div className={`flex flex-col transition-all duration-500 ease-in-out ${isFullscreenText ? 'min-h-[500px]' : 'h-[calc(100vh-140px)] min-h-[800px]'} animate-fade-in-up`}>
      {/* Top Header Toolbar */}
      <div className="shrink-0 flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div>
            <h2 className={`font-extrabold text-gray-800 tracking-tight leading-tight ${isPresentationMode ? 'text-4xl' : 'text-xl'}`}>
              {passage.title}
            </h2>
            <div className="flex gap-3 mt-1">
              <span className={`text-gray-500 font-medium ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>Levels: {passage.readingLevel}</span>
              <span className="text-gray-300">•</span>
              <span className={`flex items-center gap-1 text-gray-500 font-medium ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                {passage.wordCount} words
              </span>
              {passage.glossary && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className={`flex items-center gap-1 text-blue-500 font-bold ${isPresentationMode ? 'text-xl' : 'text-sm'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Interactive Definitions
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsFullscreenText(!isFullscreenText)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all border ${isFullscreenText ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            {isFullscreenText ? (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H4a2 2 0 00-2 2v6a2 2 0 002 2h3a2 2 0 002-2zm0 0V9a2 2 0 012-2h3a2 2 0 012 2v10m-2 0v-6a2 2 0 012-2h3a2 2 0 012 2v6a2 2 0 01-2 2h-3a2 2 0 01-2-2z" /></svg> Show Questions</>
            ) : (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg> Expand Text</>
            )}
          </button>
          {!isPresentationMode && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all border border-gray-200"
              title="Print reading passage and questions"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
          )}
        </div>
      </div>

      {/* Split Pane Content */}
      <div className={`flex-grow flex flex-col lg:flex-row bg-gray-50 rounded-b-2xl transition-all duration-500 overflow-hidden ${isFullscreenText ? 'h-auto' : 'h-0'}`}>

        {/* LEFT PANE: Reading Material */}
        <div className={`flex flex-col transition-all duration-500 ease-in-out ${isFullscreenText ? 'w-full border-none' : 'w-full lg:w-1/2 border-r border-gray-200'} bg-white relative z-10`}>
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2 sticky top-0 z-10 shrink-0">
            <span className="text-xl">📖</span>
            <h3 className="font-bold text-gray-700">Reading Passage</h3>
            {activeClickWordQuestionId && (
              <div className="ml-auto bg-purple-100 border border-purple-300 text-purple-800 text-sm font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                Select a word below
              </div>
            )}
          </div>

          <div className={`overflow-y-auto custom-scrollbar flex-grow ${isFullscreenText ? 'p-8 md:p-16 lg:px-32 xl:px-48 max-h-[80vh]' : 'p-6 md:p-10 lg:p-12'}`}>
            <div className={`text-gray-800 ${isPresentationMode ? 'text-3xl leading-relaxed' : 'text-lg leading-loose'} ${isFullscreenText ? 'max-w-4xl mx-auto text-xl leading-loose' : ''}`}>
              <InteractiveTextRenderer
                text={passage.text}
                glossary={passage.glossary}
                isPickMode={!!activeClickWordQuestionId}
                onWordClick={handleWordClick}
                isPresentationMode={isPresentationMode}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Questions & Results */}
        <div className={`flex flex-col bg-gray-50/50 transition-all duration-500 ease-in-out transform origin-right ${isFullscreenText ? 'w-0 opacity-0 lg:w-0' : 'w-full lg:w-1/2 opacity-100'} overflow-hidden relative z-0`}>
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shrink-0 shadow-sm w-full">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xl">❓</span>
              <h3 className="font-bold text-gray-700">Comprehension Check</h3>
            </div>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shrink-0">
              {passage.questions.length} Questions
            </span>
          </div>

          <div className="overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar flex-grow w-full">

            {showResults && score && (
              <div className="mb-8 p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-xl animate-fade-in-up">
                <div className="text-center">
                  <h3 className={`font-extrabold mb-2 opacity-90 ${isPresentationMode ? 'text-4xl' : 'text-2xl'}`}>Activity Complete!</h3>
                  <div className="flex items-center justify-center gap-4 my-6">
                    <div className="text-6xl">
                      {score.correct === score.total ? '🏆' : score.correct >= score.total * 0.7 ? '🌟' : '📚'}
                    </div>
                    <div className="text-left font-bold">
                      <span className="block text-5xl">{Math.round((score.correct / score.total) * 100)}%</span>
                      <span className="block text-indigo-200 text-xl">{score.correct} of {score.total} correct</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setAnswers({}); setShowResults(false); }}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all shadow-md"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {passage.questions.map((question, index) => (
                <QuestionComponent
                  key={question.id}
                  index={index}
                  question={question}
                  answer={answers[question.id]}
                  onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                  showResult={showResults}
                  isPresentationMode={isPresentationMode}
                  isClickWordActive={activeClickWordQuestionId === question.id}
                  onActivateClickWord={() => {
                    setActiveClickWordQuestionId(activeClickWordQuestionId === question.id ? null : question.id);
                    if (isFullscreenText) setIsFullscreenText(false); // Make sure text is visible
                  }}
                />
              ))}
            </div>

            {!showResults && (
              <div className="mt-10 mb-8 flex justify-end shrink-0">
                <button
                  onClick={() => setShowResults(true)}
                  disabled={!isAllAnswered}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isAllAnswered
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:-translate-y-1'
                      : 'bg-gray-300 cursor-not-allowed border border-gray-400'
                    } ${isPresentationMode ? 'text-3xl px-12 py-6' : 'text-lg'}`}
                >
                  {isAllAnswered ? 'Submit Answers' : 'Finish answering to submit'}
                  {isAllAnswered && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </button>
              </div>
            )}

            {showResults && (
              <div className="h-24"></div> // Padding bottom for scrolling
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ===============================================
// MAIN READING COMPREHENSION COMPONENT
// ===============================================
const ReadingComprehension = ({ showToast = () => { }, students = [] }) => {
  const [selectedTextType, setSelectedTextType] = useState(null);
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // New styles embedded to ensure custom scrollbar and animations work
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.5);
        border-radius: 20px;
      }
      .custom-scrollbar:hover::-webkit-scrollbar-thumb {
        background-color: rgba(107, 114, 128, 0.8);
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
  };

  const handleSelectPassage = (passage) => {
    setSelectedPassage(passage);
  };

  const handleSelectLevel = (levelPassage) => {
    setSelectedPassage(levelPassage);
    showToast(`Started reading: Level ${levelPassage.readingLevel}`, 'success');
  }

  const handleBack = () => {
    if (selectedPassage) {
      // If coming from a multi-level child, go back to text type, else go back logic
      setSelectedPassage(null);
    } else if (selectedTextType) {
      setSelectedTextType(null);
    }
  };

  const handleBackToStart = () => {
    setSelectedTextType(null);
    setSelectedPassage(null);
  };

  // Determine which component to render
  const renderContent = () => {
    if (!selectedTextType) {
      return <TextTypeSelector onSelectType={handleSelectTextType} isPresentationMode={isPresentationMode} />;
    }

    if (selectedTextType && !selectedPassage) {
      return <PassageSelector textType={selectedTextType} onSelectPassage={handleSelectPassage} onBack={handleBack} isPresentationMode={isPresentationMode} />;
    }

    if (selectedPassage && selectedPassage.isMultiLevel) {
      return <LevelSelector passage={selectedPassage} onSelectLevel={handleSelectLevel} onBack={handleBack} isPresentationMode={isPresentationMode} />;
    }

    if (selectedPassage && !selectedPassage.isMultiLevel) {
      return <SplitPaneReadingView passage={selectedPassage} onBack={handleBack} isPresentationMode={isPresentationMode} />;
    }
  };

  return (
    <div className={`space-y-6 ${isPresentationMode ? 'bg-gray-50 min-h-screen p-6' : ''}`}>
      {/* Header Container */}
      {(!selectedPassage || (selectedPassage && selectedPassage.isMultiLevel)) && (
        <div className={`relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl animate-fade-in-up ${isPresentationMode ? 'mb-12' : ''}`}>
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-semibold mb-4 border border-white/10">
                <span>✨</span> New interface
              </div>
              <h2 className={`font-extrabold tracking-tight mb-2 flex items-center gap-4 ${isPresentationMode ? 'text-7xl' : 'text-4xl lg:text-5xl'}`}>
                Reading Tools
              </h2>
              <p className={`text-blue-100 font-medium ${isPresentationMode ? 'text-3xl max-w-3xl' : 'text-lg max-w-xl'}`}>
                Explore an immersive split-pane reading experience to build comprehension skills.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                onClick={togglePresentationMode}
                className={`flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all shadow-lg ${isPresentationMode ? 'px-8 py-4 text-2xl' : 'px-6 py-3'}`}
              >
                {isPresentationMode ? 'Exit Presentation' : 'Presentation View'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Content */}
      <div className={`bg-white rounded-[2rem] shadow-xl border border-gray-100 p-6 md:p-8 lg:p-12 ${selectedPassage && !selectedPassage.isMultiLevel ? 'p-0 md:p-0 lg:p-0 shadow-2xl border-none' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ReadingComprehension;