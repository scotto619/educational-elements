// GeographyTab.js - Complete Geography Learning System with REST Countries API
import React, { useState, useEffect } from 'react';

const GeographyTab = ({ 
  students = [], 
  showToast = () => {}, 
  handleAwardXP = () => {},
  setStudents = () => {},
  saveStudentsToFirebase = () => {}
}) => {
  const [activeSection, setActiveSection] = useState('spotlight');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dailyCountry, setDailyCountry] = useState(null);
  
  // Flag Game States
  const [flagGameActive, setFlagGameActive] = useState(false);
  const [flagGameScore, setFlagGameScore] = useState(0);
  const [flagGameQuestion, setFlagGameQuestion] = useState(null);
  const [flagGameOptions, setFlagGameOptions] = useState([]);
  const [flagGameStreak, setFlagGameStreak] = useState(0);
  const [flagGameFeedback, setFlagGameFeedback] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Quiz States
  const [quizActive, setQuizActive] = useState(false);
  const [quizCountry, setQuizCountry] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  // Load countries data on component mount
  useEffect(() => {
    fetchCountries();
  }, []);

  // Set daily country (changes once per day)
  useEffect(() => {
    if (countries.length > 0) {
      const today = new Date().toDateString();
      const savedDaily = localStorage.getItem('dailyCountry');
      const savedDate = localStorage.getItem('dailyCountryDate');
      
      if (savedDaily && savedDate === today) {
        setDailyCountry(JSON.parse(savedDaily));
      } else {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        setDailyCountry(randomCountry);
        localStorage.setItem('dailyCountry', JSON.stringify(randomCountry));
        localStorage.setItem('dailyCountryDate', today);
      }
    }
  }, [countries]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://restcountries.com/v3.1/all');
      const data = await response.json();
      
      // Sort countries alphabetically and add some useful computed properties
      const processedCountries = data
        .map(country => ({
          ...country,
          searchName: country.name.common.toLowerCase(),
          region: country.region || 'Unknown',
          subregion: country.subregion || 'Unknown',
          populationFormatted: country.population ? country.population.toLocaleString() : 'Unknown',
          areaFormatted: country.area ? country.area.toLocaleString() + ' km²' : 'Unknown',
          currencies: country.currencies ? Object.values(country.currencies).map(c => c.name).join(', ') : 'Unknown',
          languages: country.languages ? Object.values(country.languages).join(', ') : 'Unknown'
        }))
        .sort((a, b) => a.name.common.localeCompare(b.name.common));
      
      setCountries(processedCountries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      showToast('Error loading country data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter countries based on search
  const filteredCountries = countries.filter(country => 
    country.searchName.includes(searchTerm.toLowerCase()) ||
    country.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.subregion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Flag Game Functions
  const startFlagGame = (student) => {
    if (!student) {
      showToast('Please select a student first!', 'error');
      return;
    }
    
    setSelectedStudent(student);
    setFlagGameActive(true);
    setFlagGameScore(0);
    setFlagGameStreak(0);
    setFlagGameFeedback(null);
    generateFlagQuestion();
  };

  const generateFlagQuestion = () => {
    if (countries.length < 4) return;
    
    // Pick a random country as the correct answer
    const correctCountry = countries[Math.floor(Math.random() * countries.length)];
    
    // Pick 3 other random countries as wrong answers
    const wrongCountries = [];
    while (wrongCountries.length < 3) {
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      if (randomCountry.name.common !== correctCountry.name.common && 
          !wrongCountries.find(c => c.name.common === randomCountry.name.common)) {
        wrongCountries.push(randomCountry);
      }
    }
    
    // Shuffle the options
    const options = [correctCountry, ...wrongCountries].sort(() => Math.random() - 0.5);
    
    setFlagGameQuestion(correctCountry);
    setFlagGameOptions(options);
    setFlagGameFeedback(null);
  };

  const handleFlagAnswer = (selectedCountry) => {
    const isCorrect = selectedCountry.name.common === flagGameQuestion.name.common;
    
    if (isCorrect) {
      setFlagGameScore(prev => prev + 1);
      setFlagGameStreak(prev => prev + 1);
      setFlagGameFeedback({ type: 'correct', message: 'Correct! 🎉' });
      
      // Award XP to student
      if (selectedStudent) {
        handleAwardXP(selectedStudent.id, 'Learner', 2);
      }
    } else {
      setFlagGameStreak(0);
      setFlagGameFeedback({ 
        type: 'incorrect', 
        message: `Incorrect. That's ${flagGameQuestion.name.common}!` 
      });
    }
    
    // Generate next question after a delay
    setTimeout(() => {
      generateFlagQuestion();
    }, 2000);
  };

  const endFlagGame = () => {
    if (selectedStudent && flagGameScore > 0) {
      // Bonus XP for good performance
      if (flagGameScore >= 10) {
        handleAwardXP(selectedStudent.id, 'Learner', 5);
        showToast(`🌟 ${selectedStudent.firstName} earned bonus XP for excellent geography knowledge!`, 'success');
      }
      
      showToast(`🌍 ${selectedStudent.firstName} identified ${flagGameScore} flags correctly!`, 'success');
    }
    
    setFlagGameActive(false);
    setSelectedStudent(null);
    setFlagGameScore(0);
    setFlagGameStreak(0);
    setFlagGameFeedback(null);
  };

  // Quiz Functions
  const startQuiz = (country, student) => {
    if (!student) {
      showToast('Please select a student first!', 'error');
      return;
    }
    
    setSelectedStudent(student);
    setQuizCountry(country);
    setQuizActive(true);
    setCurrentQuizQuestion(0);
    setQuizScore(0);
    setQuizAnswers([]);
    setQuizComplete(false);
    
    // Generate quiz questions
    const questions = generateQuizQuestions(country);
    setQuizQuestions(questions);
  };

  const generateQuizQuestions = (country) => {
    const questions = [];
    
    // Capital question
    if (country.capital && country.capital[0]) {
      const wrongCapitals = countries
        .filter(c => c.capital && c.capital[0] && c.capital[0] !== country.capital[0])
        .slice(0, 3)
        .map(c => c.capital[0]);
      
      questions.push({
        question: `What is the capital of ${country.name.common}?`,
        options: [country.capital[0], ...wrongCapitals].sort(() => Math.random() - 0.5),
        correct: country.capital[0],
        type: 'capital'
      });
    }
    
    // Population question
    if (country.population) {
      const populations = [
        country.populationFormatted,
        (country.population * 2).toLocaleString(),
        Math.floor(country.population / 2).toLocaleString(),
        Math.floor(country.population * 1.5).toLocaleString()
      ];
      
      questions.push({
        question: `What is the approximate population of ${country.name.common}?`,
        options: populations.sort(() => Math.random() - 0.5),
        correct: country.populationFormatted,
        type: 'population'
      });
    }
    
    // Region question
    const wrongRegions = [...new Set(countries.map(c => c.region))]
      .filter(r => r !== country.region)
      .slice(0, 3);
    
    questions.push({
      question: `Which region is ${country.name.common} located in?`,
      options: [country.region, ...wrongRegions].sort(() => Math.random() - 0.5),
      correct: country.region,
      type: 'region'
    });
    
    // Currency question (if available)
    if (country.currencies) {
      const wrongCurrencies = countries
        .filter(c => c.currencies && Object.keys(c.currencies)[0] !== Object.keys(country.currencies)[0])
        .slice(0, 3)
        .map(c => Object.values(c.currencies)[0].name);
      
      questions.push({
        question: `What is the currency of ${country.name.common}?`,
        options: [Object.values(country.currencies)[0].name, ...wrongCurrencies].sort(() => Math.random() - 0.5),
        correct: Object.values(country.currencies)[0].name,
        type: 'currency'
      });
    }
    
    // Language question (if available)
    if (country.languages) {
      const mainLanguage = Object.values(country.languages)[0];
      const wrongLanguages = countries
        .filter(c => c.languages && !Object.values(c.languages).includes(mainLanguage))
        .slice(0, 3)
        .map(c => Object.values(c.languages)[0]);
      
      questions.push({
        question: `What is a primary language spoken in ${country.name.common}?`,
        options: [mainLanguage, ...wrongLanguages].sort(() => Math.random() - 0.5),
        correct: mainLanguage,
        type: 'language'
      });
    }
    
    return questions.slice(0, 5); // Limit to 5 questions
  };

  const handleQuizAnswer = (answer) => {
    const currentQ = quizQuestions[currentQuizQuestion];
    const isCorrect = answer === currentQ.correct;
    
    setQuizAnswers(prev => [...prev, { 
      question: currentQ.question, 
      selected: answer, 
      correct: currentQ.correct, 
      isCorrect 
    }]);
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    
    if (currentQuizQuestion + 1 < quizQuestions.length) {
      setCurrentQuizQuestion(prev => prev + 1);
    } else {
      // Quiz complete
      setQuizComplete(true);
      
      // Award XP based on performance
      const percentage = (quizScore + (isCorrect ? 1 : 0)) / quizQuestions.length;
      let xpAmount = 3; // Base XP
      
      if (percentage >= 0.8) {
        xpAmount = 8; // Excellent performance
        showToast(`🏆 Excellent! ${selectedStudent.firstName} scored ${Math.round(percentage * 100)}%!`, 'success');
      } else if (percentage >= 0.6) {
        xpAmount = 5; // Good performance
        showToast(`👍 Good job! ${selectedStudent.firstName} scored ${Math.round(percentage * 100)}%!`, 'success');
      } else {
        showToast(`📚 Keep studying! ${selectedStudent.firstName} scored ${Math.round(percentage * 100)}%`, 'info');
      }
      
      handleAwardXP(selectedStudent.id, 'Learner', xpAmount);
    }
  };

  const endQuiz = () => {
    setQuizActive(false);
    setQuizComplete(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading world data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 flex items-center justify-center">
            <span className="text-4xl mr-4 animate-bounce">🌍</span>
            Geography Explorer
            <span className="text-4xl ml-4 animate-bounce">🗺️</span>
          </h2>
          <p className="text-xl opacity-90">Discover the amazing world around us!</p>
        </div>
        
        {/* Floating decorations */}
        <div className="absolute top-4 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🏔️</div>
        <div className="absolute bottom-4 left-4 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🏝️</div>
        <div className="absolute top-1/2 right-1/4 text-xl animate-bounce" style={{ animationDelay: '1.5s' }}>🌴</div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        {[
          { id: 'spotlight', label: 'Daily Spotlight', icon: '⭐' },
          { id: 'learn', label: 'Learn About', icon: '📚' },
          { id: 'flag-game', label: 'Flag Game', icon: '🏁' },
          { id: 'quiz', label: 'Country Quiz', icon: '🧠' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeSection === tab.id
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Daily Country Spotlight */}
      {activeSection === 'spotlight' && dailyCountry && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">🌟 Today's Country Spotlight</h3>
            <p className="text-gray-600">Learn something new about our world every day!</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="text-center">
              <img 
                src={dailyCountry.flags.png} 
                alt={`Flag of ${dailyCountry.name.common}`}
                className="w-48 h-auto mx-auto mb-4 rounded-lg shadow-lg border-4 border-gray-200"
              />
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{dailyCountry.name.common}</h2>
              <p className="text-xl text-gray-600">{dailyCountry.region}</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">🏛️ Capital</h4>
                  <p className="text-blue-700">{dailyCountry.capital?.[0] || 'Unknown'}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">👥 Population</h4>
                  <p className="text-green-700">{dailyCountry.populationFormatted}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-800 mb-2">📐 Area</h4>
                  <p className="text-purple-700">{dailyCountry.areaFormatted}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-800 mb-2">🗣️ Languages</h4>
                  <p className="text-orange-700">{dailyCountry.languages}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">💰 Currency</h4>
                <p className="text-yellow-700">{dailyCountry.currencies}</p>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => {
                    setSelectedCountry(dailyCountry);
                    setActiveSection('learn');
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  📚 Learn More
                </button>
                <button
                  onClick={() => {
                    if (students.length === 0) {
                      showToast('No students available for quiz!', 'error');
                      return;
                    }
                    startQuiz(dailyCountry, students[0]);
                  }}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  🧠 Take Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learn About Section */}
      {activeSection === 'learn' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🔍 Explore Countries</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for a country, region, or continent..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-2">
              💡 Try searching for "Asia", "Africa", "Island", or any country name
            </p>
          </div>

          {/* Country Selection Grid */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Countries ({filteredCountries.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
              {filteredCountries.slice(0, 50).map(country => (
                <button
                  key={country.cca3}
                  onClick={() => setSelectedCountry(country)}
                  className={`p-3 rounded-lg border-2 transition-all text-center hover:scale-105 ${
                    selectedCountry?.cca3 === country.cca3
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <img 
                    src={country.flags.png} 
                    alt={`Flag of ${country.name.common}`}
                    className="w-12 h-8 mx-auto mb-2 rounded border object-cover"
                  />
                  <div className="text-xs font-bold text-gray-800 truncate" title={country.name.common}>
                    {country.name.common}
                  </div>
                  <div className="text-xs text-gray-600">{country.region}</div>
                </button>
              ))}
            </div>
            
            {filteredCountries.length > 50 && (
              <p className="text-center text-gray-500 mt-4">
                Showing first 50 results. Try searching to narrow down!
              </p>
            )}
          </div>

          {/* Selected Country Details */}
          {selectedCountry && (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <img 
                    src={selectedCountry.flags.png} 
                    alt={`Flag of ${selectedCountry.name.common}`}
                    className="w-full max-w-64 h-auto mx-auto mb-4 rounded-lg shadow-lg border-4 border-gray-200"
                  />
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedCountry.name.common}</h2>
                  <p className="text-lg text-gray-600">{selectedCountry.region} • {selectedCountry.subregion}</p>
                </div>
                
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-2">🏛️ Capital City</h4>
                      <p className="text-blue-700">{selectedCountry.capital?.[0] || 'Unknown'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2">👥 Population</h4>
                      <p className="text-green-700">{selectedCountry.populationFormatted}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-bold text-purple-800 mb-2">📐 Total Area</h4>
                      <p className="text-purple-700">{selectedCountry.areaFormatted}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-bold text-orange-800 mb-2">🗣️ Languages</h4>
                      <p className="text-orange-700">{selectedCountry.languages}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-bold text-yellow-800 mb-2">💰 Currency</h4>
                      <p className="text-yellow-700">{selectedCountry.currencies}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-bold text-red-800 mb-2">🕐 Time Zone</h4>
                      <p className="text-red-700">{selectedCountry.timezones?.[0] || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 mt-6">
                    <button
                      onClick={() => {
                        if (students.length === 0) {
                          showToast('No students available for quiz!', 'error');
                          return;
                        }
                        startQuiz(selectedCountry, students[0]);
                      }}
                      className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      🧠 Take Quiz About {selectedCountry.name.common}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flag Game */}
      {activeSection === 'flag-game' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!flagGameActive ? (
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">🏁 Flag Recognition Challenge</h3>
              <p className="text-gray-600 mb-8">Test your knowledge of world flags! Can you identify countries by their flags?</p>
              
              {/* Student Selection */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Select Student:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                  {students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => startFlagGame(student)}
                      className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 bg-white transition-all text-center hover:scale-105"
                    >
                      {student.avatar ? (
                        <img
                          src={student.avatar}
                          alt={student.firstName}
                          className="w-12 h-12 rounded-full mx-auto border-2 border-gray-300 mb-2"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full mx-auto border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-2xl mb-2">
                          👤
                        </div>
                      )}
                      <div className="font-bold text-gray-800 text-sm">{student.firstName}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">🎯 How to Play:</h4>
                <ul className="text-blue-700 text-left max-w-md mx-auto space-y-2">
                  <li>• Look at the flag shown</li>
                  <li>• Choose the correct country name</li>
                  <li>• Earn XP for each correct answer</li>
                  <li>• Build your geography knowledge!</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              {/* Game Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    🏁 Flag Challenge - {selectedStudent?.firstName}
                  </h3>
                  <p className="text-gray-600">Score: {flagGameScore} | Streak: {flagGameStreak}</p>
                </div>
                <button
                  onClick={endFlagGame}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Game
                </button>
              </div>

              {/* Flag Question */}
              {flagGameQuestion && (
                <div className="text-center mb-8">
                  <img 
                    src={flagGameQuestion.flags.png} 
                    alt="Flag to identify"
                    className="w-64 h-auto mx-auto mb-6 rounded-lg shadow-lg border-4 border-gray-200"
                  />
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Which country does this flag belong to?</h4>
                  
                  {/* Answer Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {flagGameOptions.map((option, index) => (
                      <button
                        key={option.cca3}
                        onClick={() => handleFlagAnswer(option)}
                        className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors font-semibold text-gray-800"
                        disabled={flagGameFeedback !== null}
                      >
                        {option.name.common}
                      </button>
                    ))}
                  </div>
                  
                  {/* Feedback */}
                  {flagGameFeedback && (
                    <div className={`mt-6 p-4 rounded-lg ${
                      flagGameFeedback.type === 'correct' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <p className="text-lg font-semibold">{flagGameFeedback.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quiz Section */}
      {activeSection === 'quiz' && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          {!quizActive ? (
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">🧠 Country Knowledge Quiz</h3>
              <p className="text-gray-600 mb-8">Test your knowledge about countries around the world!</p>
              
              {selectedCountry ? (
                <div className="mb-8">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <img 
                      src={selectedCountry.flags.png} 
                      alt={`Flag of ${selectedCountry.name.common}`}
                      className="w-16 h-auto rounded border"
                    />
                    <h4 className="text-2xl font-bold text-gray-800">{selectedCountry.name.common}</h4>
                  </div>
                  
                  {/* Student Selection */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4">Select Student:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-60 overflow-y-auto">
                      {students.map(student => (
                        <button
                          key={student.id}
                          onClick={() => startQuiz(selectedCountry, student)}
                          className="p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 bg-white transition-all text-center hover:scale-105"
                        >
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.firstName}
                              className="w-12 h-12 rounded-full mx-auto border-2 border-gray-300 mb-2"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full mx-auto border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-2xl mb-2">
                              👤
                            </div>
                          )}
                          <div className="font-bold text-gray-800 text-sm">{student.firstName}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-6 rounded-lg mb-8">
                  <p className="text-yellow-800">Select a country from the "Learn About" section first, then come back here to take a quiz!</p>
                </div>
              )}
            </div>
          ) : quizComplete ? (
            <div className="text-center">
              <h3 className="text-3xl font-bold text-gray-800 mb-6">🎉 Quiz Complete!</h3>
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-purple-600 mb-2">
                  {selectedStudent?.firstName} scored {quizScore}/{quizQuestions.length}
                </h4>
                <p className="text-gray-600">
                  {Math.round((quizScore / quizQuestions.length) * 100)}% correct about {quizCountry?.name.common}
                </p>
              </div>
              
              {/* Review Answers */}
              <div className="text-left max-w-2xl mx-auto mb-8">
                <h5 className="text-lg font-bold text-gray-800 mb-4">📋 Review:</h5>
                {quizAnswers.map((answer, index) => (
                  <div key={index} className={`p-4 rounded-lg mb-3 ${
                    answer.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                  }`}>
                    <p className="font-semibold">{answer.question}</p>
                    <p className={answer.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      Your answer: {answer.selected} {answer.isCorrect ? '✓' : '✗'}
                    </p>
                    {!answer.isCorrect && (
                      <p className="text-gray-600">Correct answer: {answer.correct}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={endQuiz}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Take Another Quiz
              </button>
            </div>
          ) : (
            <div>
              {/* Quiz Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    🧠 Quiz: {quizCountry?.name.common} - {selectedStudent?.firstName}
                  </h3>
                  <p className="text-gray-600">Question {currentQuizQuestion + 1} of {quizQuestions.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Score: {quizScore}/{currentQuizQuestion}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuizQuestion + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>

              {/* Current Question */}
              {quizQuestions[currentQuizQuestion] && (
                <div className="text-center">
                  <h4 className="text-xl font-semibold text-gray-800 mb-6">
                    {quizQuestions[currentQuizQuestion].question}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {quizQuestions[currentQuizQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(option)}
                        className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg transition-colors font-semibold text-gray-800"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeographyTab;