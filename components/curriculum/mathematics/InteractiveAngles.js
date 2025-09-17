// components/curriculum/mathematics/InteractiveAngles.js - COMPREHENSIVE ANGLES TEACHING TOOL
import React, { useState, useRef, useEffect } from 'react';

const InteractiveAngles = ({ showToast = () => {}, saveData = () => {}, loadedData = {} }) => {
  // Tool states
  const [activeMode, setActiveMode] = useState('learn'); // 'learn', 'measure', 'create', 'identify', 'game'
  const [selectedAngleType, setSelectedAngleType] = useState('acute');
  const [showProtractor, setShowProtractor] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(45);
  const [userGuess, setUserGuess] = useState('');
  const [gameScore, setGameScore] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameQuestion, setGameQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [createdAngle, setCreatedAngle] = useState(90);
  const [dragStart, setDragStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hideAngleMeasurement, setHideAngleMeasurement] = useState(true); // Start with answer hidden
  const [protractorPosition, setProtractorPosition] = useState({ x: 0, y: 0 });
  const [protractorDragging, setProtractorDragging] = useState(false);

  // Canvas refs for interactive drawing
  const canvasRef = useRef(null);
  const protractorRef = useRef(null);

  // Angle types and definitions
  const angleTypes = {
    acute: { name: 'Acute Angle', range: '0° - 89°', color: '#22C55E', description: 'Less than 90 degrees' },
    right: { name: 'Right Angle', range: '90°', color: '#3B82F6', description: 'Exactly 90 degrees' },
    obtuse: { name: 'Obtuse Angle', range: '91° - 179°', color: '#F59E0B', description: 'More than 90° but less than 180°' },
    straight: { name: 'Straight Angle', range: '180°', color: '#8B5CF6', description: 'Exactly 180 degrees' },
    reflex: { name: 'Reflex Angle', range: '181° - 359°', color: '#EF4444', description: 'More than 180 degrees' }
  };

  // Generate random angle for games
  const generateRandomAngle = () => {
    const angles = {
      1: () => Math.floor(Math.random() * 90) + 1, // Level 1: Acute angles
      2: () => Math.floor(Math.random() * 180) + 1, // Level 2: Up to straight
      3: () => Math.floor(Math.random() * 360) + 1  // Level 3: All angles
    };
    return angles[gameLevel]();
  };

  // Determine angle type from degrees
  const getAngleType = (degrees) => {
    if (degrees < 90) return 'acute';
    if (degrees === 90) return 'right';
    if (degrees < 180) return 'obtuse';
    if (degrees === 180) return 'straight';
    return 'reflex';
  };

  // Draw angle on canvas
  const drawAngle = (canvas, angle, showMeasurement = false, highlightType = false) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up drawing styles
    ctx.lineWidth = 3;
    ctx.strokeStyle = highlightType ? angleTypes[getAngleType(angle)].color : '#374151';
    
    // Draw the two rays
    // First ray (horizontal)
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
    
    // Second ray (at angle)
    const radians = (angle * Math.PI) / 180;
    const endX = centerX + radius * Math.cos(radians);
    const endY = centerY - radius * Math.sin(radians); // Negative because canvas Y is inverted
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arc showing the angle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, -radians, true);
    ctx.strokeStyle = angleTypes[getAngleType(angle)].color;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Fill the angle area lightly
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, 40, 0, -radians, true);
    ctx.closePath();
    ctx.fillStyle = angleTypes[getAngleType(angle)].color + '20';
    ctx.fill();
    
    // Add angle measurement if requested
    if (showMeasurement) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${angle}°`, centerX + 60, centerY - 10);
    }
    
    // Add center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#374151';
    ctx.fill();
  };

  // Handle angle creation by dragging
  const handleMouseDown = (e) => {
    if (activeMode !== 'create') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragStart({ x, y });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || activeMode !== 'create' || !dragStart) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Calculate angle from center to mouse position
    const deltaX = x - centerX;
    const deltaY = centerY - y; // Inverted Y
    let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
    
    // Ensure positive angle
    if (angle < 0) angle += 360;
    
    setCreatedAngle(Math.round(angle));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Protractor drag handlers
  const handleProtractorMouseDown = (e) => {
    if (activeMode === 'measure' && showProtractor) {
      e.stopPropagation();
      setProtractorDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragStart({
        x: e.clientX - protractorPosition.x,
        y: e.clientY - protractorPosition.y
      });
    }
  };

  const handleProtractorMouseMove = (e) => {
    if (protractorDragging && dragStart && activeMode === 'measure') {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Keep protractor within reasonable bounds
      const containerRect = canvasRef.current?.getBoundingClientRect();
      if (containerRect) {
        const boundedX = Math.max(-100, Math.min(containerRect.width - 100, newX));
        const boundedY = Math.max(-50, Math.min(containerRect.height - 50, newY));
        setProtractorPosition({ x: boundedX, y: boundedY });
      }
    }
  };

  const handleProtractorMouseUp = () => {
    setProtractorDragging(false);
    setDragStart(null);
  };

  // Add event listeners for protractor dragging
  React.useEffect(() => {
    if (protractorDragging) {
      document.addEventListener('mousemove', handleProtractorMouseMove);
      document.addEventListener('mouseup', handleProtractorMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleProtractorMouseMove);
        document.removeEventListener('mouseup', handleProtractorMouseUp);
      };
    }
  }, [protractorDragging, dragStart]);

  // Initialize canvas when mode changes
  useEffect(() => {
    if (activeMode === 'learn' || activeMode === 'identify' || activeMode === 'game') {
      const canvas = canvasRef.current;
      if (canvas) {
        drawAngle(canvas, currentAngle, activeMode === 'learn', activeMode === 'learn');
      }
    } else if (activeMode === 'measure') {
      const canvas = canvasRef.current;
      if (canvas) {
        // In measure mode, only show measurement if not hidden
        drawAngle(canvas, currentAngle, !hideAngleMeasurement, false);
      }
    } else if (activeMode === 'create') {
      const canvas = canvasRef.current;
      if (canvas) {
        drawAngle(canvas, createdAngle, true, true);
      }
    }
  }, [activeMode, currentAngle, createdAngle, hideAngleMeasurement]);

  // Game logic
  const checkAnswer = () => {
    const guess = parseInt(userGuess);
    const correct = Math.abs(guess - currentAngle) <= 5; // Allow 5-degree tolerance
    
    if (correct) {
      setGameScore(gameScore + 10);
      showToast('Correct! Great estimation!', 'success');
    } else {
      showToast(`Close! The angle was ${currentAngle}°`, 'info');
    }
    
    setShowAnswer(true);
    setTimeout(() => {
      if (gameQuestion < 9) {
        setGameQuestion(gameQuestion + 1);
        setCurrentAngle(generateRandomAngle());
        setUserGuess('');
        setShowAnswer(false);
      } else {
        showToast(`Game complete! Final score: ${correct ? gameScore + 10 : gameScore}/100`, 'success');
        setGameQuestion(0);
        setGameScore(0);
      }
    }, 2000);
  };

  const startNewGame = () => {
    setGameQuestion(1);
    setGameScore(0);
    setCurrentAngle(generateRandomAngle());
    setUserGuess('');
    setShowAnswer(false);
  };

  // Render different modes
  const renderContent = () => {
    switch (activeMode) {
      case 'learn':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Angle Display */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-center">Interactive Angle</h3>
              <div className="text-center mb-4">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={300}
                  className="border rounded-lg mx-auto"
                />
              </div>
              
              {/* Angle Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Angle Size: {currentAngle}°</label>
                  <input
                    type="range"
                    min="1"
                    max="359"
                    value={currentAngle}
                    onChange={(e) => setCurrentAngle(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div className="text-center">
                  <div className={`inline-block px-4 py-2 rounded-full text-white font-bold`}
                       style={{ backgroundColor: angleTypes[getAngleType(currentAngle)].color }}>
                    {angleTypes[getAngleType(currentAngle)].name}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {angleTypes[getAngleType(currentAngle)].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Angle Types Reference */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold mb-4">Angle Types</h3>
              <div className="space-y-3">
                {Object.entries(angleTypes).map(([key, type]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAngleType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedAngleType(key);
                      // Set example angle for this type
                      const examples = { acute: 45, right: 90, obtuse: 135, straight: 180, reflex: 270 };
                      setCurrentAngle(examples[key]);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold" style={{ color: type.color }}>
                          {type.name}
                        </h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {type.range}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'measure':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold mb-4 text-center">Measure Angles with a Protractor</h3>
            
            <div className="text-center mb-6 relative" style={{ height: '450px' }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="border rounded-lg mx-auto"
              />
              
              {showProtractor && (
                <div 
                  className="absolute cursor-move select-none"
                  style={{ 
                    left: `50%`,
                    top: `50%`,
                    transform: `translate(calc(-50% + ${protractorPosition.x}px), calc(-50% + ${protractorPosition.y}px))`,
                    zIndex: 10,
                    pointerEvents: protractorDragging ? 'auto' : 'auto'
                  }}
                  onMouseDown={handleProtractorMouseDown}
                >
                  {/* Clean, transparent protractor */}
                  <svg width="200" height="100" viewBox="0 0 200 100" className="drop-shadow-sm">
                    {/* Semi-transparent semicircle */}
                    <path 
                      d="M 20 85 A 80 80 0 0 1 180 85 Z" 
                      fill="rgba(255, 255, 255, 0.1)" 
                      stroke="rgba(59, 130, 246, 0.8)" 
                      strokeWidth="2"
                    />
                    
                    {/* Degree markings - only major ones to avoid clutter */}
                    {Array.from({ length: 7 }, (_, i) => {
                      const angle = i * 30; // Every 30 degrees: 0, 30, 60, 90, 120, 150, 180
                      const radian = (angle * Math.PI) / 180;
                      const innerRadius = 70;
                      const outerRadius = 78;
                      const textRadius = 62;
                      
                      const x1 = 100 + innerRadius * Math.cos(radian);
                      const y1 = 85 - innerRadius * Math.sin(radian);
                      const x2 = 100 + outerRadius * Math.cos(radian);
                      const y2 = 85 - outerRadius * Math.sin(radian);
                      const textX = 100 + textRadius * Math.cos(radian);
                      const textY = 85 - textRadius * Math.sin(radian);
                      
                      return (
                        <g key={angle}>
                          <line 
                            x1={x1} y1={y1} x2={x2} y2={y2} 
                            stroke="rgba(59, 130, 246, 0.9)" 
                            strokeWidth="2"
                          />
                          <text 
                            x={textX} y={textY + 4} 
                            fontSize="12" 
                            textAnchor="middle" 
                            fill="rgba(59, 130, 246, 0.9)"
                            fontWeight="bold"
                          >
                            {angle}°
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Minor markings every 10 degrees */}
                    {Array.from({ length: 19 }, (_, i) => {
                      const angle = i * 10;
                      if (angle % 30 === 0) return null; // Skip major markings
                      
                      const radian = (angle * Math.PI) / 180;
                      const innerRadius = 74;
                      const outerRadius = 78;
                      
                      const x1 = 100 + innerRadius * Math.cos(radian);
                      const y1 = 85 - innerRadius * Math.sin(radian);
                      const x2 = 100 + outerRadius * Math.cos(radian);
                      const y2 = 85 - outerRadius * Math.sin(radian);
                      
                      return (
                        <line 
                          key={angle}
                          x1={x1} y1={y1} x2={x2} y2={y2} 
                          stroke="rgba(59, 130, 246, 0.6)" 
                          strokeWidth="1"
                        />
                      );
                    })}
                    
                    {/* Center point - small and subtle */}
                    <circle cx="100" cy="85" r="2" fill="rgba(59, 130, 246, 0.8)"/>
                    
                    {/* Base line */}
                    <line x1="20" y1="85" x2="180" y2="85" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="2"/>
                    
                    {/* Small drag indicator */}
                    <text x="100" y="15" fontSize="10" textAnchor="middle" fill="rgba(59, 130, 246, 0.8)" fontWeight="bold">
                      DRAG
                    </text>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <button
                  onClick={() => setCurrentAngle(Math.floor(Math.random() * 180) + 1)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-2 w-full"
                >
                  New Random Angle
                </button>
                <p className="text-sm text-gray-600">Generate a random angle</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setShowProtractor(!showProtractor)}
                  className={`px-4 py-2 rounded-lg mb-2 w-full ${
                    showProtractor ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {showProtractor ? 'Hide' : 'Show'} Protractor
                </button>
                <p className="text-sm text-gray-600">Toggle measuring tool</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setHideAngleMeasurement(!hideAngleMeasurement)}
                  className={`px-4 py-2 rounded-lg mb-2 w-full ${
                    hideAngleMeasurement ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  {hideAngleMeasurement ? 'Show' : 'Hide'} Answer
                </button>
                <p className="text-sm text-gray-600">Practice measuring</p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setProtractorPosition({ x: 0, y: 0 })}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mb-2 w-full"
                >
                  Reset Position
                </button>
                <p className="text-sm text-gray-600">Center protractor</p>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              {!hideAngleMeasurement ? (
                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    Angle: {currentAngle}°
                  </div>
                  <div className="text-lg" style={{ color: angleTypes[getAngleType(currentAngle)].color }}>
                    {angleTypes[getAngleType(currentAngle)].name}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-4 max-w-md mx-auto">
                  <div className="text-lg font-bold text-gray-700 mb-2">
                    What's your measurement?
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <input
                      type="number"
                      value={userGuess}
                      onChange={(e) => setUserGuess(e.target.value)}
                      placeholder="Enter degrees"
                      className="px-3 py-2 border rounded-lg text-center font-bold w-24"
                      min="0"
                      max="360"
                    />
                    <span className="font-bold">°</span>
                    <button
                      onClick={() => {
                        if (!userGuess) {
                          showToast('Please enter your measurement first!', 'error');
                          return;
                        }
                        const guess = parseInt(userGuess);
                        const difference = Math.abs(guess - currentAngle);
                        
                        if (difference <= 2) {
                          showToast(`Perfect! The angle is ${currentAngle}°`, 'success');
                        } else if (difference <= 5) {
                          showToast(`Very close! The angle is ${currentAngle}°`, 'success');
                        } else {
                          showToast(`Good try! The angle is ${currentAngle}°. You were ${difference}° off.`, 'info');
                        }
                        
                        setUserGuess('');
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      Check
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Drag the protractor to line it up with the angle, then measure!
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'create':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold mb-4 text-center">Create Your Own Angles</h3>
            
            <div className="text-center mb-6">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="border rounded-lg mx-auto cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
              <p className="text-sm text-gray-600 mt-2">
                Click and drag to create an angle, or use the slider below
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Create Angle: {createdAngle}°</label>
                <input
                  type="range"
                  min="1"
                  max="359"
                  value={createdAngle}
                  onChange={(e) => setCreatedAngle(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-lg`}
                     style={{ backgroundColor: angleTypes[getAngleType(createdAngle)].color }}>
                  {angleTypes[getAngleType(createdAngle)].name}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {angleTypes[getAngleType(createdAngle)].description}
                </p>
              </div>
              
              <div className="grid grid-cols-5 gap-2 mt-4">
                <button
                  onClick={() => setCreatedAngle(30)}
                  className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
                >
                  30° Acute
                </button>
                <button
                  onClick={() => setCreatedAngle(90)}
                  className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
                >
                  90° Right
                </button>
                <button
                  onClick={() => setCreatedAngle(135)}
                  className="bg-yellow-500 text-white px-3 py-2 rounded text-sm hover:bg-yellow-600"
                >
                  135° Obtuse
                </button>
                <button
                  onClick={() => setCreatedAngle(180)}
                  className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
                >
                  180° Straight
                </button>
                <button
                  onClick={() => setCreatedAngle(270)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
                >
                  270° Reflex
                </button>
              </div>
            </div>
          </div>
        );

      case 'identify':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold mb-4 text-center">Angle Identification Challenge</h3>
            
            <div className="text-center mb-6">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border rounded-lg mx-auto"
              />
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold">What type of angle is this?</p>
              <p className="text-sm text-gray-600">Current angle: {showAnswer ? `${currentAngle}°` : '???'}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(angleTypes).map(([key, type]) => {
                  const isCorrectAnswer = key === getAngleType(currentAngle);
                  const buttonStyle = showAnswer ? 
                    (isCorrectAnswer ? 
                      { borderColor: type.color, backgroundColor: type.color + '20', transform: 'scale(1.05)' } : 
                      { opacity: '0.6' }) : 
                    {};
                    
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        if (showAnswer) return; // Don't allow clicks during answer display
                        
                        const correct = isCorrectAnswer;
                        setShowAnswer(true);
                        
                        if (correct) {
                          showToast('Correct! Well done!', 'success');
                        } else {
                          showToast(`Not quite! This is a ${angleTypes[getAngleType(currentAngle)].name}`, 'error');
                        }
                        
                        // Auto-generate new challenge after 2 seconds
                        setTimeout(() => {
                          setCurrentAngle(Math.floor(Math.random() * 359) + 1);
                          setShowAnswer(false);
                        }, 2000);
                      }}
                      disabled={showAnswer}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                        showAnswer ? 'cursor-not-allowed' : 'border-gray-200 hover:border-blue-300 hover:scale-105'
                      }`}
                      style={buttonStyle}
                    >
                      <div className={`font-bold ${showAnswer && isCorrectAnswer ? 'text-green-600' : 'text-gray-800'}`}>
                        {type.name}
                        {showAnswer && isCorrectAnswer && ' ✓'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{type.range}</div>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => {
                    setCurrentAngle(Math.floor(Math.random() * 359) + 1);
                    setShowAnswer(false);
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  New Challenge
                </button>
                
                <button
                  onClick={() => {
                    setShowAnswer(!showAnswer);
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  {showAnswer ? 'Hide' : 'Show'} Answer
                </button>
              </div>
            </div>
          </div>
        );

      case 'game':
        return (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-bold mb-4 text-center">Angle Estimation Game</h3>
            
            {gameQuestion === 0 ? (
              <div className="text-center space-y-6">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-lg">Test your angle estimation skills!</p>
                <p className="text-gray-600">
                  Estimate the angle size within 5 degrees to score points.
                </p>
                
                <div className="space-y-3">
                  <label className="block font-semibold">Choose Difficulty Level:</label>
                  <div className="flex justify-center space-x-3">
                    {[1, 2, 3].map(level => (
                      <button
                        key={level}
                        onClick={() => setGameLevel(level)}
                        className={`px-4 py-2 rounded-lg ${
                          gameLevel === level 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Level {level}
                        <div className="text-xs">
                          {level === 1 ? 'Acute only' : level === 2 ? 'Up to 180°' : 'All angles'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={startNewGame}
                  className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-600"
                >
                  Start Game!
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Game Progress */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Question {gameQuestion}/10 • Level {gameLevel}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    Score: {gameScore}/100
                  </div>
                </div>
                
                {/* Angle Display */}
                <div className="text-center">
                  <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="border rounded-lg mx-auto"
                  />
                </div>
                
                {/* Input and Answer */}
                <div className="text-center space-y-4">
                  {!showAnswer ? (
                    <div className="space-y-4">
                      <label className="block text-lg font-semibold">
                        What's your estimate? (degrees)
                      </label>
                      <div className="flex justify-center items-center space-x-3">
                        <input
                          type="number"
                          value={userGuess}
                          onChange={(e) => setUserGuess(e.target.value)}
                          placeholder="Enter degrees"
                          className="px-4 py-2 border rounded-lg text-center text-lg font-bold"
                          min="1"
                          max="359"
                        />
                        <button
                          onClick={checkAnswer}
                          disabled={!userGuess}
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        The angle was {currentAngle}°
                      </div>
                      <div className="text-lg" style={{ color: angleTypes[getAngleType(currentAngle)].color }}>
                        {angleTypes[getAngleType(currentAngle)].name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {gameQuestion < 10 ? 'Next question coming up...' : 'Game complete!'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <button
                    onClick={() => {
                      setGameQuestion(0);
                      setGameScore(0);
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    End Game
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
            <span className="mr-3">📐</span>
            Interactive Angles
            <span className="ml-3">📏</span>
          </h1>
          <p className="text-xl opacity-90">Learn, measure, create, and play with angles!</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { id: 'learn', name: 'Learn Types', icon: '📚', description: 'Explore different angle types' },
            { id: 'measure', name: 'Measure', icon: '📏', description: 'Use a protractor to measure angles' },
            { id: 'create', name: 'Create', icon: '✏️', description: 'Draw and create your own angles' },
            { id: 'identify', name: 'Identify', icon: '🔍', description: 'Test your angle recognition skills' },
            { id: 'game', name: 'Game', icon: '🎮', description: 'Play angle estimation challenges' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                activeMode === mode.id 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">{mode.icon}</div>
              <div className="font-bold">{mode.name}</div>
              <div className="text-xs text-gray-600 text-center mt-1">{mode.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {renderContent()}

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Angle Tips & Tricks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Memory Aids:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Acute = A-cute (small and sharp)</li>
              <li>• Right = Makes an "L" shape</li>
              <li>• Obtuse = "Oh-btuse" (bigger than right)</li>
              <li>• Straight = Forms a straight line</li>
              <li>• Reflex = Reflects back (more than straight)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Real World Examples:</h4>
            <ul className="space-y-1 text-blue-600">
              <li>• Acute: Pizza slice, roof peak</li>
              <li>• Right: Square corner, book corner</li>
              <li>• Obtuse: Opened book, laptop screen</li>
              <li>• Straight: Horizon, ruler edge</li>
              <li>• Reflex: Clock at 10:00, open scissors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveAngles;