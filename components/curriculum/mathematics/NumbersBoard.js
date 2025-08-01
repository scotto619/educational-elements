// components/curriculum/mathematics/NumbersBoard.js
// EXAMPLE OF HOW OTHER SUBJECT COMPONENTS WOULD BE STRUCTURED
import React, { useState } from 'react';
import { mathContent } from './data/math-content'; // Would import from separate data file

const NumbersBoard = ({ showToast = () => {}, students = [] }) => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [highlightPattern, setHighlightPattern] = useState([]);

  // Generate numbers 1-100
  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);

  const handleNumberClick = (number) => {
    setSelectedNumber(number);
    showToast(`Selected number: ${number}`, 'info');
  };

  const highlightEvens = () => {
    const evens = numbers.filter(n => n % 2 === 0);
    setHighlightPattern(evens);
    showToast('Highlighted all even numbers!', 'success');
  };

  const highlightOdds = () => {
    const odds = numbers.filter(n => n % 2 === 1);
    setHighlightPattern(odds);
    showToast('Highlighted all odd numbers!', 'success');
  };

  const highlightMultiples = (multiple) => {
    const multiples = numbers.filter(n => n % multiple === 0);
    setHighlightPattern(multiples);
    showToast(`Highlighted multiples of ${multiple}!`, 'success');
  };

  const clearHighlights = () => {
    setHighlightPattern([]);
    setSelectedNumber(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-3xl font-bold mb-2 flex items-center">
          <span className="mr-3">💯</span>
          Interactive Numbers Board
        </h3>
        <p className="opacity-90 text-lg">Explore number patterns and relationships</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Pattern Tools</h4>
        <div className="flex flex-wrap gap-3">
          <button onClick={highlightEvens} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">Even Numbers</button>
          <button onClick={highlightOdds} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Odd Numbers</button>
          <button onClick={() => highlightMultiples(5)} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">Multiples of 5</button>
          <button onClick={() => highlightMultiples(10)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">Multiples of 10</button>
          <button onClick={clearHighlights} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Clear</button>
        </div>
        {selectedNumber && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-800">Selected: {selectedNumber}</p>
            <p className="text-green-700">Is {selectedNumber % 2 === 0 ? 'even' : 'odd'}</p>
          </div>
        )}
      </div>

      {/* Numbers Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-10 gap-1">
          {numbers.map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              className={`aspect-square flex items-center justify-center text-sm font-bold rounded transition-all hover:scale-110 ${
                selectedNumber === number
                  ? 'bg-blue-600 text-white shadow-lg scale-110'
                  : highlightPattern.includes(number)
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      </div>

      {/* Teaching Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-bold text-green-800 mb-2">Teaching Tip</h4>
            <p className="text-green-700">
              Use the pattern buttons to help students visualize number relationships. 
              Ask them to predict which numbers will be highlighted before revealing the pattern.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NumbersBoard;