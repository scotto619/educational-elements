// NumberMat.js - Interactive Number Anchor Chart Tool
import React, { useState, useRef } from 'react';

const NumberMat = ({ showToast }) => {
  const [centerNumber, setCenterNumber] = useState('');
  const [sections, setSections] = useState({
    wordForm: '',
    placeValue: '',
    expandedForm: '',
    numberSentences: '',
    multiples: '',
    factors: '',
    evenOdd: '',
    comparison: '',
    fraction: '',
    decimal: '',
    percentage: '',
    visualRepresentation: ''
  });
  const [fontSize, setFontSize] = useState('medium');
  const [colorTheme, setColorTheme] = useState('blue');
  const [showGrid, setShowGrid] = useState(true);
  const [savedCharts, setSavedCharts] = useState([]);
  const chartRef = useRef(null);

  const colorThemes = {
    blue: {
      primary: 'bg-blue-100',
      secondary: 'bg-blue-50', 
      border: 'border-blue-300',
      text: 'text-blue-900',
      accent: 'bg-blue-600'
    },
    green: {
      primary: 'bg-green-100',
      secondary: 'bg-green-50',
      border: 'border-green-300', 
      text: 'text-green-900',
      accent: 'bg-green-600'
    },
    purple: {
      primary: 'bg-purple-100',
      secondary: 'bg-purple-50',
      border: 'border-purple-300',
      text: 'text-purple-900',
      accent: 'bg-purple-600'
    },
    orange: {
      primary: 'bg-orange-100',
      secondary: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      accent: 'bg-orange-600'
    }
  };

  const fontSizes = {
    small: { main: 'text-base', center: 'text-6xl', label: 'text-xs' },
    medium: { main: 'text-lg', center: 'text-8xl', label: 'text-sm' },
    large: { main: 'text-xl', center: 'text-9xl', label: 'text-base' }
  };

  const currentTheme = colorThemes[colorTheme];
  const currentFont = fontSizes[fontSize];

  // Auto-calculate some fields when center number changes
  const updateCenterNumber = (num) => {
    setCenterNumber(num);
    
    if (num && !isNaN(num)) {
      const number = parseInt(num);
      const newSections = { ...sections };
      
      // Auto-fill some basic information
      if (number > 0) {
        // Even/Odd
        newSections.evenOdd = number % 2 === 0 ? 'Even' : 'Odd';
        
        // Basic multiples (first 5)
        const multiples = [];
        for (let i = 1; i <= 5; i++) {
          multiples.push(number * i);
        }
        if (multiples.length > 0) {
          newSections.multiples = multiples.join(', ') + '...';
        }
        
        // Basic factors
        const factors = [];
        for (let i = 1; i <= number; i++) {
          if (number % i === 0) {
            factors.push(i);
          }
        }
        if (factors.length > 0) {
          newSections.factors = factors.join(', ');
        }
        
        // Place value for numbers up to millions
        if (number < 1000000) {
          const placeValues = [];
          const numStr = number.toString();
          const places = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands'];
          
          for (let i = 0; i < numStr.length; i++) {
            const digit = numStr[numStr.length - 1 - i];
            const place = places[i];
            if (digit !== '0') {
              placeValues.unshift(`${digit} ${place}`);
            }
          }
          newSections.placeValue = placeValues.join(', ');
        }
        
        // Expanded form
        if (number < 1000000) {
          const expanded = [];
          const numStr = number.toString();
          const multipliers = [1, 10, 100, 1000, 10000, 100000];
          
          for (let i = 0; i < numStr.length; i++) {
            const digit = parseInt(numStr[numStr.length - 1 - i]);
            if (digit !== 0) {
              expanded.unshift(digit * multipliers[i]);
            }
          }
          newSections.expandedForm = expanded.join(' + ');
        }
      }
      
      setSections(newSections);
    }
  };

  // Update individual section
  const updateSection = (sectionKey, value) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: value
    }));
  };

  // Clear all content
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all content?')) {
      setCenterNumber('');
      setSections({
        wordForm: '',
        placeValue: '',
        expandedForm: '',
        numberSentences: '',
        multiples: '',
        factors: '',
        evenOdd: '',
        comparison: '',
        fraction: '',
        decimal: '',
        percentage: '',
        visualRepresentation: ''
      });
      showToast('Number mat cleared!');
    }
  };

  // Save current chart
  const saveChart = () => {
    if (!centerNumber) {
      showToast('Please enter a center number first!');
      return;
    }
    
    const name = prompt('Enter a name for this number chart:');
    if (name) {
      const chart = {
        id: Date.now(),
        name,
        centerNumber,
        sections: { ...sections },
        fontSize,
        colorTheme,
        createdAt: new Date().toISOString()
      };
      
      setSavedCharts(prev => [chart, ...prev]);
      showToast(`Chart "${name}" saved!`);
    }
  };

  // Load saved chart
  const loadChart = (chart) => {
    setCenterNumber(chart.centerNumber);
    setSections(chart.sections);
    setFontSize(chart.fontSize);
    setColorTheme(chart.colorTheme);
    showToast(`Loaded chart "${chart.name}"`);
  };

  // Delete saved chart
  const deleteChart = (chartId) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      setSavedCharts(prev => prev.filter(chart => chart.id !== chartId));
      showToast('Chart deleted!');
    }
  };

  // Print/Export functionality
  const printChart = () => {
    const printWindow = window.open('', '_blank');
    const chartHTML = chartRef.current.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Number Mat - ${centerNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .no-print { display: none !important; }
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${chartHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔢 Number Mat Anchor Chart</h2>
        <p className="text-gray-600">Create interactive number exploration charts for teaching</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Center Number Input */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Center Number</h3>
            <input
              type="number"
              value={centerNumber}
              onChange={(e) => updateCenterNumber(e.target.value)}
              placeholder="Enter number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl font-bold"
            />
          </div>

          {/* Display Options */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Display Options</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Color Theme</label>
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="orange">Orange</option>
                </select>
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Show grid lines</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={saveChart}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
              >
                💾 Save Chart
              </button>
              <button
                onClick={printChart}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
              >
                🖨️ Print Chart
              </button>
              <button
                onClick={clearAll}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Saved Charts */}
          {savedCharts.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">Saved Charts</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedCharts.map(chart => (
                  <div key={chart.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{chart.name}</div>
                      <div className="text-xs text-gray-500">Number: {chart.centerNumber}</div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => loadChart(chart)}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteChart(chart.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Number Mat Display */}
        <div className="lg:col-span-3">
          <div 
            ref={chartRef}
            className={`
              ${currentTheme.secondary} ${currentTheme.border} 
              border-2 rounded-xl p-6 shadow-lg
              ${showGrid ? 'bg-grid-pattern' : ''}
            `}
          >
            {/* Main Grid Layout */}
            <div className="grid grid-cols-4 gap-4 h-full min-h-[600px]">
              {/* Top Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Word Form
                </label>
                <textarea
                  value={sections.wordForm}
                  onChange={(e) => updateSection('wordForm', e.target.value)}
                  placeholder="e.g., Twenty-five"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Place Value
                </label>
                <textarea
                  value={sections.placeValue}
                  onChange={(e) => updateSection('placeValue', e.target.value)}
                  placeholder="e.g., 2 tens, 5 ones"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Expanded Form
                </label>
                <textarea
                  value={sections.expandedForm}
                  onChange={(e) => updateSection('expandedForm', e.target.value)}
                  placeholder="e.g., 20 + 5"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Number Sentences
                </label>
                <textarea
                  value={sections.numberSentences}
                  onChange={(e) => updateSection('numberSentences', e.target.value)}
                  placeholder="e.g., 20 + 5 = 25"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* Second Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Multiples
                </label>
                <textarea
                  value={sections.multiples}
                  onChange={(e) => updateSection('multiples', e.target.value)}
                  placeholder="e.g., 25, 50, 75..."
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* CENTER NUMBER */}
              <div className={`col-span-2 ${currentTheme.accent} text-white rounded-lg flex items-center justify-center text-center p-4`}>
                <div>
                  <div className={`${currentFont.center} font-bold leading-none`}>
                    {centerNumber || '?'}
                  </div>
                  <div className={`${currentFont.main} opacity-90 mt-2`}>
                    {sections.evenOdd && `${sections.evenOdd} Number`}
                  </div>
                </div>
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Factors
                </label>
                <textarea
                  value={sections.factors}
                  onChange={(e) => updateSection('factors', e.target.value)}
                  placeholder="e.g., 1, 5, 25"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* Third Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Comparison
                </label>
                <textarea
                  value={sections.comparison}
                  onChange={(e) => updateSection('comparison', e.target.value)}
                  placeholder="e.g., 25 > 20, 25 < 30"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Fraction
                </label>
                <textarea
                  value={sections.fraction}
                  onChange={(e) => updateSection('fraction', e.target.value)}
                  placeholder="e.g., 25/100"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Decimal
                </label>
                <textarea
                  value={sections.decimal}
                  onChange={(e) => updateSection('decimal', e.target.value)}
                  placeholder="e.g., 0.25"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Percentage
                </label>
                <textarea
                  value={sections.percentage}
                  onChange={(e) => updateSection('percentage', e.target.value)}
                  placeholder="e.g., 25%"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>

              {/* Bottom Row - Visual Representation (spans full width) */}
              <div className={`col-span-4 ${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold ${currentTheme.text} mb-2`}>
                  Visual Representation / Drawing Space
                </label>
                <textarea
                  value={sections.visualRepresentation}
                  onChange={(e) => updateSection('visualRepresentation', e.target.value)}
                  placeholder="Describe visual representations, draw base-10 blocks, arrays, etc."
                  className={`w-full h-24 p-2 border border-gray-300 rounded resize-none ${currentFont.main}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default NumberMat;