// components/curriculum/mathematics/InteractiveClock.js
import React, { useState, useEffect, useRef } from 'react';

const InteractiveClock = ({ showToast = () => {}, saveData = () => {}, loadedData = {} }) => {
  // Clock state
  const [hours, setHours] = useState(3);
  const [minutes, setMinutes] = useState(0);
  const [showDigital, setShowDigital] = useState(true);
  const [show24Hour, setShow24Hour] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [isDragging, setIsDragging] = useState(null);
  
  // Refs for drag functionality
  const clockRef = useRef(null);
  
  // Time scenarios for teaching
  const timeScenarios = [
    { name: "Breakfast Time", hour: 7, minute: 30, description: "Time to eat breakfast!" },
    { name: "School Starts", hour: 9, minute: 0, description: "School begins!" },
    { name: "Lunch Time", hour: 12, minute: 15, description: "Time for lunch!" },
    { name: "Home Time", hour: 3, minute: 30, description: "School ends!" },
    { name: "Dinner Time", hour: 6, minute: 0, description: "Family dinner!" },
    { name: "Bedtime", hour: 8, minute: 30, description: "Time for bed!" }
  ];

  // Load saved data
  useEffect(() => {
    if (loadedData?.interactiveClock) {
      const saved = loadedData.interactiveClock;
      setHours(saved.hours || 3);
      setMinutes(saved.minutes || 0);
      setShowDigital(saved.showDigital !== undefined ? saved.showDigital : true);
      setShow24Hour(saved.show24Hour !== undefined ? saved.show24Hour : false);
    }
  }, [loadedData]);

  // Save data whenever settings change
  useEffect(() => {
    const dataToSave = {
      interactiveClock: {
        hours,
        minutes,
        showDigital,
        show24Hour,
        lastUpdated: new Date().toISOString()
      }
    };
    saveData(dataToSave);
  }, [hours, minutes, showDigital, show24Hour, saveData]);

  // Real-time clock update
  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        const now = new Date();
        setHours(now.getHours() % 12 || 12);
        setMinutes(now.getMinutes());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRealTime]);

  // Calculate angles for clock hands
  const getHourAngle = () => (hours % 12) * 30 + (minutes * 0.5);
  const getMinuteAngle = () => minutes * 6;

  // Convert to 12/24 hour format
  const formatTime = () => {
    const displayHours = show24Hour ? 
      (hours === 12 ? 12 : hours % 12) + (hours >= 12 && hours !== 12 ? 12 : 0) :
      hours === 0 ? 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displayHoursStr = show24Hour ? displayHours.toString().padStart(2, '0') : displayHours.toString();
    const period = show24Hour ? '' : (hours >= 12 ? ' PM' : ' AM');
    return `${displayHoursStr}:${displayMinutes}${period}`;
  };

  // Handle mouse events for dragging clock hands
  const handleMouseDown = (handType, e) => {
    e.preventDefault();
    setIsDragging(handType);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !clockRef.current) return;
    
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90;
    const normalizedAngle = ((angle % 360) + 360) % 360;

    if (isDragging === 'hour') {
      const newHour = Math.round(normalizedAngle / 30) % 12;
      setHours(newHour === 0 ? 12 : newHour);
    } else if (isDragging === 'minute') {
      const newMinute = Math.round(normalizedAngle / 6) % 60;
      setMinutes(newMinute);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Set specific scenario time
  const setScenarioTime = (scenario) => {
    setHours(scenario.hour);
    setMinutes(scenario.minute);
    setIsRealTime(false);
    showToast(`Set to ${scenario.name}: ${scenario.description}`, 'success');
  };

  // Quick time setters
  const quickTimeButtons = [
    { label: "12:00", hour: 12, minute: 0 },
    { label: "3:00", hour: 3, minute: 0 },
    { label: "6:00", hour: 6, minute: 0 },
    { label: "9:00", hour: 9, minute: 0 },
    { label: "1:30", hour: 1, minute: 30 },
    { label: "4:15", hour: 4, minute: 15 },
    { label: "7:45", hour: 7, minute: 45 },
    { label: "10:30", hour: 10, minute: 30 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🕐</div>
          <div>
            <h2 className="text-3xl font-bold">Interactive Clock</h2>
            <p className="text-lg opacity-90">Learn to tell time with an interactive analog clock</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Clock */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Analog Clock</h3>
            <p className="text-gray-600">Drag the hands to set the time!</p>
          </div>

          {/* Clock Container */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Clock Face */}
              <svg
                ref={clockRef}
                width="300"
                height="300"
                viewBox="0 0 300 300"
                className="drop-shadow-lg cursor-pointer"
              >
                {/* Clock Circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="145"
                  fill="url(#clockGradient)"
                  stroke="#2563eb"
                  strokeWidth="4"
                />
                
                {/* Gradient Definition */}
                <defs>
                  <radialGradient id="clockGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </radialGradient>
                </defs>

                {/* Hour Markers */}
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30) * Math.PI / 180;
                  const x1 = 150 + Math.sin(angle) * 120;
                  const y1 = 150 - Math.cos(angle) * 120;
                  const x2 = 150 + Math.sin(angle) * 100;
                  const y2 = 150 - Math.cos(angle) * 100;
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#1e40af"
                      strokeWidth="3"
                    />
                  );
                })}

                {/* Numbers */}
                {[...Array(12)].map((_, i) => {
                  const number = i === 0 ? 12 : i;
                  const angle = (i * 30) * Math.PI / 180;
                  const x = 150 + Math.sin(angle) * 85;
                  const y = 150 - Math.cos(angle) * 85;
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xl font-bold fill-blue-700"
                    >
                      {number}
                    </text>
                  );
                })}

                {/* Minute Markers */}
                {[...Array(60)].map((_, i) => {
                  if (i % 5 !== 0) {
                    const angle = (i * 6) * Math.PI / 180;
                    const x1 = 150 + Math.sin(angle) * 120;
                    const y1 = 150 - Math.cos(angle) * 120;
                    const x2 = 150 + Math.sin(angle) * 110;
                    const y2 = 150 - Math.cos(angle) * 110;
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#64748b"
                        strokeWidth="1"
                      />
                    );
                  }
                  return null;
                })}

                {/* Hour Hand */}
                <line
                  x1="150"
                  y1="150"
                  x2={150 + Math.sin(getHourAngle() * Math.PI / 180) * 60}
                  y2={150 - Math.cos(getHourAngle() * Math.PI / 180) * 60}
                  stroke="#dc2626"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="cursor-grab hover:stroke-red-700"
                  onMouseDown={(e) => handleMouseDown('hour', e)}
                />

                {/* Minute Hand */}
                <line
                  x1="150"
                  y1="150"
                  x2={150 + Math.sin(getMinuteAngle() * Math.PI / 180) * 90}
                  y2={150 - Math.cos(getMinuteAngle() * Math.PI / 180) * 90}
                  stroke="#059669"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="cursor-grab hover:stroke-green-700"
                  onMouseDown={(e) => handleMouseDown('minute', e)}
                />

                {/* Center Circle */}
                <circle
                  cx="150"
                  cy="150"
                  r="8"
                  fill="#374151"
                />
              </svg>
            </div>
          </div>

          {/* Digital Display */}
          {showDigital && (
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-center mb-4">
              <div className="text-4xl font-mono font-bold tracking-wider">
                {formatTime()}
              </div>
              <div className="text-sm text-green-300 mt-1">
                Digital Time Display
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setShowDigital(!showDigital)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                showDigital 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {showDigital ? 'Hide' : 'Show'} Digital
            </button>
            <button
              onClick={() => setShow24Hour(!show24Hour)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                show24Hour 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {show24Hour ? '12 Hour' : '24 Hour'}
            </button>
            <button
              onClick={() => setIsRealTime(!isRealTime)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isRealTime 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isRealTime ? 'Stop' : 'Real Time'}
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Manual Time Input */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              ⚡ Quick Set
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hours (1-12)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minutes (0-59)</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Time Buttons */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🎯 Quick Times
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {quickTimeButtons.map((time, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setHours(time.hour);
                    setMinutes(time.minute);
                    setIsRealTime(false);
                  }}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Scenarios */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📅 Daily Times
            </h3>
            <div className="space-y-2">
              {timeScenarios.map((scenario, index) => (
                <button
                  key={index}
                  onClick={() => setScenarioTime(scenario)}
                  className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors border border-yellow-200"
                >
                  <div className="font-semibold text-yellow-800">{scenario.name}</div>
                  <div className="text-sm text-yellow-600">
                    {scenario.hour}:{scenario.minute.toString().padStart(2, '0')} - {scenario.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Teaching Tips */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              💡 Teaching Tips
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Red hand = Hours (shorter)</li>
              <li>• Green hand = Minutes (longer)</li>
              <li>• Hour hand moves slowly as minutes change</li>
              <li>• Practice with daily routine times</li>
              <li>• Count by 5s for minute intervals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveClock;