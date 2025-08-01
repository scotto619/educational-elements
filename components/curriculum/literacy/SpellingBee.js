// components/curriculum/literacy/SpellingBee.js
// EXAMPLE TEMPLATE FOR OTHER LITERACY ACTIVITIES
import React, { useState } from 'react';
import { spellingBeeContent } from './data/spelling-bee-content'; // Would be a separate data file

const SpellingBee = ({ showToast = () => {}, students = [] }) => {
  const [currentWord, setCurrentWord] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [gameMode, setGameMode] = useState('practice');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
        <h3 className="text-3xl font-bold mb-2 flex items-center">
          <span className="mr-3">🐝</span>
          Spelling Bee
        </h3>
        <p className="opacity-90 text-lg">Interactive spelling practice and competitions</p>
      </div>

      {/* Coming Soon Content */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Spelling Bee Tool</h3>
        <p className="text-gray-600 mb-6">Interactive spelling competitions and practice</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
          <h4 className="font-bold text-yellow-800 mb-2">🌟 Features Coming Soon:</h4>
          <ul className="text-yellow-700 text-sm text-left space-y-1">
            <li>• Audio pronunciation of words</li>
            <li>• Difficulty levels (easy, medium, hard)</li>
            <li>• Class competition mode</li>
            <li>• Student progress tracking</li>
            <li>• Custom word lists</li>
            <li>• XP rewards for correct spelling</li>
          </ul>
        </div>
      </div>

      {/* Future Implementation Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Planned Interface Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Difficulty Selection</h5>
            <div className="space-y-2">
              <button className="w-full bg-green-200 p-2 rounded">Easy (3-4 letters)</button>
              <button className="w-full bg-yellow-200 p-2 rounded">Medium (5-6 letters)</button>
              <button className="w-full bg-red-200 p-2 rounded">Hard (7+ letters)</button>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Word Display</h5>
            <div className="bg-white p-4 rounded border-2 border-dashed">
              <p className="text-center text-2xl font-bold">EXAMPLE</p>
              <p className="text-center text-gray-600">🔊 Pronunciation</p>
            </div>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h5 className="font-semibold mb-2">Student Response</h5>
            <input 
              type="text" 
              placeholder="Type spelling here..." 
              className="w-full p-2 border rounded mb-2"
              disabled
            />
            <button className="w-full bg-blue-200 p-2 rounded">Check Spelling</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpellingBee;