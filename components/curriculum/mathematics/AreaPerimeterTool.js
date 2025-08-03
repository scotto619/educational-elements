// components/curriculum/mathematics/AreaPerimeterTool.js
import React, { useState, useEffect } from 'react';
import { mathContent } from './data/math-content';

const AreaPerimeterTool = ({ showToast = () => {}, students = [] }) => {
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [dimensions, setDimensions] = useState({ length: 8, width: 6, side: 5 });
  const [showCalculations, setShowCalculations] = useState(false);
  const [animateShape, setAnimateShape] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);

  const shapes = {
    rectangle: {
      name: 'Rectangle',
      emoji: '📱',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500'
    },
    square: {
      name: 'Square',
      emoji: '⬜',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-500'
    },
    triangle: {
      name: 'Triangle',
      emoji: '🔺',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500'
    }
  };

  const calculateArea = () => {
    switch(selectedShape) {
      case 'rectangle':
        return dimensions.length * dimensions.width;
      case 'square':
        return dimensions.side * dimensions.side;
      case 'triangle':
        return (dimensions.length * dimensions.width) / 2;
      default:
        return 0;
    }
  };

  const calculatePerimeter = () => {
    switch(selectedShape) {
      case 'rectangle':
        return 2 * (dimensions.length + dimensions.width);
      case 'square':
        return 4 * dimensions.side;
      case 'triangle':
        return dimensions.length + dimensions.width + dimensions.side;
      default:
        return 0;
    }
  };

  const handleShapeChange = (shape) => {
    setSelectedShape(shape);
    setAnimateShape(true);
    setTimeout(() => setAnimateShape(false), 500);
    showToast(`Switched to ${shapes[shape].name}!`, 'info');
  };

  const handleDimensionChange = (dimension, value) => {
    if (value > 0 && value <= 20) {
      setDimensions(prev => ({
        ...prev,
        [dimension]: parseInt(value) || 1
      }));
    }
  };

  const toggleCalculations = () => {
    setShowCalculations(!showCalculations);
    showToast(showCalculations ? 'Calculations hidden' : 'Calculations revealed!', 'success');
  };

  const renderShape = () => {
    const scale = 15; // Scale factor for visualization
    const shapeStyle = `transition-all duration-500 ${animateShape ? 'scale-110' : 'scale-100'}`;

    switch(selectedShape) {
      case 'rectangle':
        return (
          <div className={`${shapeStyle} relative`}>
            <div 
              className={`bg-gradient-to-br ${shapes[selectedShape].color} border-4 ${shapes[selectedShape].borderColor} rounded-lg shadow-lg relative`}
              style={{ 
                width: `${dimensions.length * scale}px`, 
                height: `${dimensions.width * scale}px`,
                minWidth: '120px',
                minHeight: '80px'
              }}
            >
              {/* Length label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-sm font-bold text-gray-800">
                {dimensions.length} units
              </div>
              {/* Width label */}
              <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 rotate-90 bg-white px-2 py-1 rounded shadow text-sm font-bold text-gray-800">
                {dimensions.width} units
              </div>
            </div>
          </div>
        );
      
      case 'square':
        return (
          <div className={`${shapeStyle} relative`}>
            <div 
              className={`bg-gradient-to-br ${shapes[selectedShape].color} border-4 ${shapes[selectedShape].borderColor} rounded-lg shadow-lg relative`}
              style={{ 
                width: `${dimensions.side * scale}px`, 
                height: `${dimensions.side * scale}px`,
                minWidth: '100px',
                minHeight: '100px'
              }}
            >
              {/* Side label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-sm font-bold text-gray-800">
                {dimensions.side} units
              </div>
            </div>
          </div>
        );
      
      case 'triangle':
        return (
          <div className={`${shapeStyle} relative`}>
            <div className="relative">
              <svg 
                width={Math.max(dimensions.length * scale, 120)} 
                height={Math.max(dimensions.width * scale, 80)}
                className="drop-shadow-lg"
              >
                <defs>
                  <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
                <polygon 
                  points={`0,${dimensions.width * scale} ${(dimensions.length * scale)/2},0 ${dimensions.length * scale},${dimensions.width * scale}`}
                  fill="url(#triangleGradient)"
                  stroke="#7C3AED"
                  strokeWidth="4"
                />
              </svg>
              {/* Base label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-sm font-bold text-gray-800">
                Base: {dimensions.length} units
              </div>
              {/* Height label */}
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-1 rounded shadow text-sm font-bold text-gray-800">
                Height: {dimensions.width} units
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`bg-gradient-to-r ${shapes[selectedShape].color} text-white rounded-xl p-6 shadow-lg`}>
        <h3 className="text-3xl font-bold mb-2 flex items-center">
          <span className="mr-3">{shapes[selectedShape].emoji}</span>
          Area & Perimeter Explorer
        </h3>
        <p className="opacity-90 text-lg">Interactive tool for exploring area and perimeter concepts</p>
      </div>

      {/* Shape Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Choose a Shape</h4>
        <div className="flex flex-wrap gap-3">
          {Object.entries(shapes).map(([key, shape]) => (
            <button
              key={key}
              onClick={() => handleShapeChange(key)}
              className={`px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 ${
                selectedShape === key
                  ? `bg-gradient-to-r ${shape.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{shape.emoji}</span>
              {shape.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shape Visualization */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Shape Visualization</h4>
          <div className="flex justify-center items-center min-h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
            {renderShape()}
          </div>
        </div>

        {/* Controls and Calculations */}
        <div className="space-y-6">
          {/* Dimension Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Adjust Dimensions</h4>
            <div className="space-y-4">
              {selectedShape === 'rectangle' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length: {dimensions.length} units</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={dimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width: {dimensions.width} units</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </>
              )}
              
              {selectedShape === 'square' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Side Length: {dimensions.side} units</label>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    value={dimensions.side}
                    onChange={(e) => handleDimensionChange('side', e.target.value)}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
              
              {selectedShape === 'triangle' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Base: {dimensions.length} units</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={dimensions.length}
                      onChange={(e) => handleDimensionChange('length', e.target.value)}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height: {dimensions.width} units</label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={dimensions.width}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-gray-800">Calculations</h4>
              <button
                onClick={() => setShowFormulas(!showFormulas)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
              >
                {showFormulas ? 'Hide' : 'Show'} Formulas
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${shapes[selectedShape].borderColor} bg-gradient-to-r ${shapes[selectedShape].color} bg-opacity-10`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Area:</span>
                  <span className="text-2xl font-bold text-gray-900">{calculateArea()} square units</span>
                </div>
                {showFormulas && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedShape === 'rectangle' && `Formula: Length × Width = ${dimensions.length} × ${dimensions.width}`}
                    {selectedShape === 'square' && `Formula: Side × Side = ${dimensions.side} × ${dimensions.side}`}
                    {selectedShape === 'triangle' && `Formula: (Base × Height) ÷ 2 = (${dimensions.length} × ${dimensions.width}) ÷ 2`}
                  </div>
                )}
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${shapes[selectedShape].borderColor} bg-gradient-to-r ${shapes[selectedShape].color} bg-opacity-10`}>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Perimeter:</span>
                  <span className="text-2xl font-bold text-gray-900">{calculatePerimeter()} units</span>
                </div>
                {showFormulas && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedShape === 'rectangle' && `Formula: 2 × (Length + Width) = 2 × (${dimensions.length} + ${dimensions.width})`}
                    {selectedShape === 'square' && `Formula: 4 × Side = 4 × ${dimensions.side}`}
                    {selectedShape === 'triangle' && `Formula: Side₁ + Side₂ + Side₃ = ${dimensions.length} + ${dimensions.width} + ${dimensions.side}`}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Tips */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">💡</span>
          <div>
            <h4 className="font-bold text-yellow-800 mb-2">Teaching Tips</h4>
            <div className="text-yellow-700 space-y-2">
              <p><strong>Area:</strong> The space inside a shape. Think "How many squares fit inside?"</p>
              <p><strong>Perimeter:</strong> The distance around the outside. Think "How far to walk around?"</p>
              <p><strong>Activity:</strong> Have students predict what happens to area and perimeter when dimensions change!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Activities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Quick Classroom Activities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mathContent.areaPerimeter.activities.map((activity, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activity.emoji}</span>
                <div>
                  <h5 className="font-bold text-gray-800">{activity.title}</h5>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreaPerimeterTool;