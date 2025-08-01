// components/tabs/CurriculumCornerTab.js - REBUILT WITH INTERACTIVE LESSON FLOW
import React, { useState, useEffect, useRef } from 'react';
import { literacyContent } from './literacy-content'; // Assuming the file is in the same directory

// ===============================================
// HELPER & SUB-COMPONENTS
// ===============================================

// Tool for reviewing graphs, digraphs, etc.
const GraphReviewTool = ({ title, items, words }) => {
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const intervalRef = useRef(null);

    const startHighlighting = () => {
        stopHighlighting(); // Clear any existing timer
        intervalRef.current = setInterval(() => {
            setHighlightedIndex(prev => (prev + 1) % items.length);
        }, 1500); // Highlight a new item every 1.5 seconds
    };

    const stopHighlighting = () => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    useEffect(() => {
        // Cleanup on component unmount
        return () => stopHighlighting();
    }, []);

    return (
        <div className="space-y-6">
            <h3 className="text-2xl font-bold text-center text-gray-800">{title}</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="grid grid-cols-8 gap-2 mb-4">
                    {items.map((item, index) => (
                        <div key={index} className={`flex items-center justify-center p-3 text-2xl font-bold rounded-lg transition-all duration-500 ${highlightedIndex === index ? 'bg-yellow-400 text-black scale-110 shadow-lg' : 'bg-white'}`}>
                            {item}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center gap-4">
                    <button onClick={startHighlighting} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">Start Random Highlight</button>
                    <button onClick={stopHighlighting} className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600">Stop</button>
                </div>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <h4 className="font-bold text-lg text-green-800 mb-2">Read these words:</h4>
                <div className="flex flex-wrap gap-3 text-xl mb-4">
                    {words.map((word, i) => <span key={i} className="bg-white px-3 py-1 rounded shadow-sm">{word}</span>)}
                </div>
                <p className="text-green-700">Now, can you write 3 of your own words?</p>
            </div>
        </div>
    );
};

// Tool for the Sound of the Week
const SoundOfTheWeekTool = ({ content }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-purple-800 mb-4">Focus Sound: <span className="text-5xl font-mono bg-white px-3 rounded-lg">{content.focusSound}</span></h3>
                <h4 className="font-bold text-lg text-purple-700 mb-2">Sound Words:</h4>
                <div className="flex flex-wrap gap-2 text-lg mb-6">
                    {content.soundWords.map((word, i) => <span key={i} className="bg-white px-3 py-1 rounded shadow-sm">{word}</span>)}
                </div>
                <h4 className="font-bold text-lg text-purple-700 mb-2">Extra Activities:</h4>
                <ul className="list-disc list-inside space-y-1 text-purple-700">
                    {content.extraActivities.map((activity, i) => <li key={i}>{activity}</li>)}
                </ul>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                <h3 className="text-2xl font-bold text-yellow-800 mb-4">Boggle Challenge</h3>
                <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto mb-4">
                    {content.boggleLetters.map((letter, i) => (
                        <div key={i} className="flex items-center justify-center bg-white text-4xl font-bold rounded-lg shadow-md aspect-square">
                            {letter.toUpperCase()}
                        </div>
                    ))}
                </div>
                <p className="text-yellow-700">How many words can you make using the focus sound?</p>
            </div>
        </div>
    );
};

// Tool for the Reading Passage
const ReadingPassageTool = ({ passage }) => {
    const printableRef = useRef(null);

    const handlePrint = () => {
        const printContent = printableRef.current.innerHTML;
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write(`<html><head><title>Print Passage</title></head><body>${printContent}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div>
            <div ref={printableRef} className="prose lg:prose-xl bg-white p-8 rounded-xl border-2">
                <h3 className="text-center">{passage.title}</h3>
                <p>{passage.text}</p>
            </div>
            <div className="text-center mt-6">
                <button onClick={handlePrint} className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600">🖨️ Print Passage</button>
            </div>
        </div>
    );
};

// Tool for Language Activities
const LanguageTool = ({ language }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-indigo-800 mb-3">Synonyms (Same Meaning)</h3>
                {language.synonyms.map(([word1, word2], i) => <p key={i} className="text-center text-xl p-2">{word1} = {word2}</p>)}
            </div>
            <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-pink-800 mb-3">Antonyms (Opposite Meaning)</h3>
                {language.antonyms.map(([word1, word2], i) => <p key={i} className="text-center text-xl p-2">{word1} ≠ {word2}</p>)}
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 md:col-span-2">
                <h3 className="font-bold text-lg text-green-800 mb-3">Grammar & Punctuation Tasks</h3>
                <p className="mb-2"><strong>Grammar:</strong> {language.grammarTask}</p>
                <p><strong>Punctuation:</strong> {language.punctuationTask}</p>
            </div>
        </div>
    );
};

// Tool for Writing Prompt
const WritingTool = ({ prompt }) => {
    return (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-orange-800 mb-4">✍️ Writing Prompt</h3>
            <p className="text-xl text-orange-700">{prompt}</p>
        </div>
    );
};


// ===============================================
// MAIN CURRICULUM CORNER COMPONENT
// ===============================================
const CurriculumCornerTab = ({ showToast = () => {} }) => {
  const [selectedWeek, setSelectedWeek] = useState('week1');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const LITERACY_LESSON_STEPS = [
    { id: 'graph_review', title: 'Graph Review' },
    { id: 'sound_of_week', title: 'Sound of the Week' },
    { id: 'reading', title: 'Reading Passage' },
    { id: 'language', title: 'Language Activities' },
    { id: 'writing', title: 'Writing Prompt' }
  ];

  const weeklyContent = literacyContent[selectedWeek];
  if (!weeklyContent) return <div>Error: Content for {selectedWeek} not found.</div>;
  
  const currentStep = LITERACY_LESSON_STEPS[currentStepIndex];

  const goToNextStep = () => setCurrentStepIndex(prev => Math.min(prev + 1, LITERACY_LESSON_STEPS.length - 1));
  const goToPrevStep = () => setCurrentStepIndex(prev => Math.max(prev - 1, 0));

  const renderCurrentStep = () => {
    switch(currentStep.id) {
        case 'graph_review':
            // This is a placeholder to cycle through all graph types. A more complex state would be needed to do them one-by-one.
            return <GraphReviewTool title="Review Digraphs" items={weeklyContent.graphReview.digraphs} words={weeklyContent.soundWords} />;
        case 'sound_of_week':
            return <SoundOfTheWeekTool content={weeklyContent} />;
        case 'reading':
            return <ReadingPassageTool passage={weeklyContent.readingPassage} />;
        case 'language':
            return <LanguageTool language={weeklyContent.language} />;
        case 'writing':
            return <WritingTool prompt={weeklyContent.writingPrompt} />;
        default:
            return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">📚 Literacy Companion</h2>
        <div>
          <label htmlFor="week-select" className="mr-2 font-semibold">Select Week:</label>
          <select id="week-select" value={selectedWeek} onChange={e => { setSelectedWeek(e.target.value); setCurrentStepIndex(0); }} className="p-2 border-2 border-gray-300 rounded-lg">
            {Object.keys(literacyContent).map(weekKey => (
              <option key={weekKey} value={weekKey}>
                {weekKey.replace('week', 'Week ')} - Focus: {literacyContent[weekKey].focusSound.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b-2 border-gray-100">
            <h3 className="text-2xl font-bold text-blue-600">{currentStep.title}</h3>
            <p className="text-gray-500">Step {currentStepIndex + 1} of {LITERACY_LESSON_STEPS.length}</p>
        </div>
        <div className="p-6 bg-gray-50">
            {renderCurrentStep()}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <button onClick={goToPrevStep} disabled={currentStepIndex === 0} className="px-8 py-3 bg-white rounded-lg shadow font-semibold disabled:opacity-50">Previous</button>
        <div className="flex items-center gap-2">
            {LITERACY_LESSON_STEPS.map((step, index) => (
                <div key={step.id} className={`w-4 h-4 rounded-full transition-colors ${currentStepIndex === index ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            ))}
        </div>
        <button onClick={goToNextStep} disabled={currentStepIndex === LITERACY_LESSON_STEPS.length - 1} className="px-8 py-3 bg-blue-500 text-white rounded-lg shadow font-semibold disabled:opacity-50">Next</button>
      </div>
    </div>
  );
};

export default CurriculumCornerTab;