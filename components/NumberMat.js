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

  // Helper function to convert number to words
  const numberToWords = (num) => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    
    return num.toString(); // For larger numbers, just return the number
  };

  // Helper function to find factors
  const findFactors = (num) => {
    const factors = [];
    for (let i = 1; i <= num; i++) {
      if (num % i === 0) {
        factors.push(i);
      }
    }
    return factors;
  };

  // Helper function to find first few multiples
  const findMultiples = (num, count = 5) => {
    const multiples = [];
    for (let i = 1; i <= count; i++) {
      multiples.push(num * i);
    }
    return multiples;
  };

  // Auto-calculate some fields when center number changes
  const updateCenterNumber = (num) => {
    setCenterNumber(num);
    
    if (num && !isNaN(num)) {
      const number = parseInt(num);
      const newSections = { ...sections };
      
      // Auto-fill some basic information
      if (number > 0 && number < 10000) {
        // Even/Odd
        newSections.evenOdd = number % 2 === 0 ? 'Even' : 'Odd';
        
        // Word Form
        newSections.wordForm = numberToWords(number);
        
        // Factors (only for reasonable numbers)
        if (number <= 100) {
          const factors = findFactors(number);
          newSections.factors = factors.join(', ');
        }
        
        // Multiples
        if (number <= 20) {
          const multiples = findMultiples(number);
          newSections.multiples = multiples.join(', ');
        }
        
        // Place Value (for numbers up to thousands)
        if (number < 10000) {
          const thousands = Math.floor(number / 1000);
          const hundreds = Math.floor((number % 1000) / 100);
          const tens = Math.floor((number % 100) / 10);
          const ones = number % 10;
          
          let placeValueParts = [];
          if (thousands > 0) placeValueParts.push(`${thousands} thousand${thousands > 1 ? 's' : ''}`);
          if (hundreds > 0) placeValueParts.push(`${hundreds} hundred${hundreds > 1 ? 's' : ''}`);
          if (tens > 0) placeValueParts.push(`${tens} ten${tens > 1 ? 's' : ''}`);
          if (ones > 0) placeValueParts.push(`${ones} one${ones > 1 ? 's' : ''}`);
          
          newSections.placeValue = placeValueParts.join(', ');
        }
        
        // Expanded Form
        if (number < 10000) {
          const thousands = Math.floor(number / 1000) * 1000;
          const hundreds = Math.floor((number % 1000) / 100) * 100;
          const tens = Math.floor((number % 100) / 10) * 10;
          const ones = number % 10;
          
          let expandedParts = [];
          if (thousands > 0) expandedParts.push(thousands.toString());
          if (hundreds > 0) expandedParts.push(hundreds.toString());
          if (tens > 0) expandedParts.push(tens.toString());
          if (ones > 0) expandedParts.push(ones.toString());
          
          newSections.expandedForm = expandedParts.join(' + ');
        }
        
        // Basic decimal and percentage (for numbers 0-100)
        if (number >= 0 && number <= 100) {
          newSections.decimal = (number / 100).toFixed(2);
          newSections.percentage = number + '%';
          newSections.fraction = `${number}/100`;
        }
      }
      
      setSections(newSections);
    }
  };

  const updateSection = (key, value) => {
    setSections(prev => ({ ...prev, [key]: value }));
  };

  const saveChart = () => {
    if (!centerNumber.trim()) {
      showToast('Please enter a center number first!', 'error');
      return;
    }
    
    const chartData = {
      id: Date.now(),
      name: `Number ${centerNumber} Chart`,
      centerNumber,
      sections,
      fontSize,
      colorTheme,
      createdAt: new Date().toLocaleDateString()
    };
    
    setSavedCharts(prev => [...prev, chartData]);
    showToast('Chart saved successfully!');
  };

  const loadChart = (chartData) => {
    setCenterNumber(chartData.centerNumber);
    setSections(chartData.sections);
    setFontSize(chartData.fontSize);
    setColorTheme(chartData.colorTheme);
    showToast('Chart loaded!');
  };

  const clearChart = () => {
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
    showToast('Chart cleared!');
  };

  const deleteChart = (chartId) => {
    setSavedCharts(prev => prev.filter(chart => chart.id !== chartId));
    showToast('Chart deleted!');
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

          {/* Quick Number Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Quick Numbers</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100].map(num => (
                <button
                  key={num}
                  onClick={() => updateCenterNumber(num.toString())}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Display Options</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Font Size</label>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Color Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(colorThemes).map(theme => (
                    <button
                      key={theme}
                      onClick={() => setColorTheme(theme)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        colorTheme === theme 
                          ? colorThemes[theme].accent.replace('bg-', 'bg-') + ' text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showGrid"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showGrid" className="text-sm font-medium text-gray-700">
                  Show Grid
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={saveChart}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                💾 Save Chart
              </button>
              <button
                onClick={printChart}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                🖨️ Print Chart
              </button>
              <button
                onClick={clearChart}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                🗑️ Clear Chart
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
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Word Form
                </label>
                <textarea
                  value={sections.wordForm}
                  onChange={(e) => updateSection('wordForm', e.target.value)}
                  placeholder="e.g., Twenty-five"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Place Value
                </label>
                <textarea
                  value={sections.placeValue}
                  onChange={(e) => updateSection('placeValue', e.target.value)}
                  placeholder="e.g., 2 tens, 5 ones"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Expanded Form
                </label>
                <textarea
                  value={sections.expandedForm}
                  onChange={(e) => updateSection('expandedForm', e.target.value)}
                  placeholder="e.g., 20 + 5"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Number Sentences
                </label>
                <textarea
                  value={sections.numberSentences}
                  onChange={(e) => updateSection('numberSentences', e.target.value)}
                  placeholder="e.g., 20 + 5 = 25"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              {/* Second Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Multiples
                </label>
                <textarea
                  value={sections.multiples}
                  onChange={(e) => updateSection('multiples', e.target.value)}
                  placeholder="e.g., 25, 50, 75, 100"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              {/* CENTER NUMBER */}
              <div className={`col-span-2 ${currentTheme.accent} text-white rounded-lg flex items-center justify-center text-center p-4`}>
                <div>
                  <div className={`${currentFont.center} font-bold leading-none break-all`}>
                    {centerNumber || '25'}
                  </div>
                  <div className={`${currentFont.main} opacity-90 mt-2`}>
                    {sections.evenOdd && `${sections.evenOdd} Number`}
                  </div>
                </div>
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Factors
                </label>
                <textarea
                  value={sections.factors}
                  onChange={(e) => updateSection('factors', e.target.value)}
                  placeholder="e.g., 1, 5, 25"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              {/* Third Row */}
              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Comparison
                </label>
                <textarea
                  value={sections.comparison}
                  onChange={(e) => updateSection('comparison', e.target.value)}
                  placeholder="e.g., 25 > 20, 25 < 30"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Fraction
                </label>
                <textarea
                  value={sections.fraction}
                  onChange={(e) => updateSection('fraction', e.target.value)}
                  placeholder="e.g., 25/100"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Decimal
                </label>
                <textarea
                  value={sections.decimal}
                  onChange={(e) => updateSection('decimal', e.target.value)}
                  placeholder="e.g., 0.25"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              <div className={`${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Percentage
                </label>
                <textarea
                  value={sections.percentage}
                  onChange={(e) => updateSection('percentage', e.target.value)}
                  placeholder="e.g., 25%"
                  className={`w-full h-20 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
                />
              </div>

              {/* Bottom Row - Visual Representation (spans full width) */}
              <div className={`col-span-4 ${currentTheme.primary} ${currentTheme.border} border rounded-lg p-3`}>
                <label className={`block ${currentFont.label} font-bold text-gray-900 mb-2`}>
                  Visual Representation / Drawing Space
                </label>
                <textarea
                  value={sections.visualRepresentation}
                  onChange={(e) => updateSection('visualRepresentation', e.target.value)}
                  placeholder="Describe visual representations, draw base-10 blocks, arrays, etc."
                  className={`w-full h-24 p-2 border border-gray-300 rounded resize-none text-gray-900 ${currentFont.main}`}
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