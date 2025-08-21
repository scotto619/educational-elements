// components/tools/BrainBreaks.js
import React, { useState, useEffect } from 'react';

const BRAIN_BREAK_ACTIVITIES = [
  {
    id: 1,
    name: "Dance Freeze",
    duration: "2-3 minutes",
    type: "Movement",
    explanation: "Play music and have students dance freely. When the music stops, everyone must freeze like statues. Anyone still moving sits out the next round!",
    icon: "💃"
  },
  {
    id: 2,
    name: "20 Jumping Jacks",
    duration: "1 minute",
    type: "Exercise",
    explanation: "Everyone does 20 jumping jacks together. Count out loud as a class to build energy and coordination.",
    icon: "🤸"
  },
  {
    id: 3,
    name: "Silent Ball",
    duration: "3-5 minutes",
    type: "Focus Game",
    explanation: "Sit in circle and toss a soft ball. No talking allowed! If you drop it, talk, or make a bad throw, you're out. Last person standing wins!",
    icon: "⚽"
  },
  {
    id: 4,
    name: "Would You Rather",
    duration: "2-3 minutes",
    type: "Decision Game",
    explanation: "Ask fun 'Would you rather' questions. Students move to different sides of the room based on their choice. Great for getting to know each other!",
    icon: "🤔"
  },
  {
    id: 5,
    name: "Mirror Dance",
    duration: "2-3 minutes",
    type: "Partner Activity",
    explanation: "Partners face each other. One leads with slow movements, the other mirrors exactly. Switch roles halfway through!",
    icon: "🪞"
  },
  {
    id: 6,
    name: "Categories Race",
    duration: "3-4 minutes",
    type: "Brain Game",
    explanation: "Call out a category (animals, foods, colors). Students take turns naming items. If you repeat or can't think of one, you're out!",
    icon: "📝"
  },
  {
    id: 7,
    name: "Invisible Hula Hoop",
    duration: "2 minutes",
    type: "Imagination",
    explanation: "Pretend to hula hoop! Students move their bodies as if spinning a hula hoop around their waist, arms, or legs.",
    icon: "⭕"
  },
  {
    id: 8,
    name: "Rock Paper Scissors Tournament",
    duration: "3-5 minutes",
    type: "Competition",
    explanation: "Everyone finds a partner for rock-paper-scissors. Winner finds new partner, loser becomes their cheerleader. Continue until one champion remains!",
    icon: "✂️"
  },
  {
    id: 9,
    name: "Animal Walks",
    duration: "2-3 minutes",
    type: "Movement",
    explanation: "Call out animals and students move like them: bear crawl, crab walk, frog jumps, penguin waddle, etc.",
    icon: "🐻"
  },
  {
    id: 10,
    name: "Thumb Wrestling Championship",
    duration: "3-4 minutes",
    type: "Partner Game",
    explanation: "Partner up for thumb wrestling! Best 2 out of 3 wins. Winners pair up for elimination rounds until there's a class champion.",
    icon: "👍"
  },
  {
    id: 11,
    name: "Statue Garden",
    duration: "2-3 minutes",
    type: "Creative",
    explanation: "One person is the 'gardener' who walks around. Everyone else are statues frozen in creative poses. If the gardener catches you moving, you become a gardener too!",
    icon: "🗿"
  },
  {
    id: 12,
    name: "Lightning Math",
    duration: "2-3 minutes",
    type: "Academic",
    explanation: "Quick-fire math problems! Students stand and sit down when they know the answer. First few standing get to answer.",
    icon: "⚡"
  },
  {
    id: 13,
    name: "Human Knot",
    duration: "4-5 minutes",
    type: "Teamwork",
    explanation: "Stand in circle, grab hands with two different people (not next to you). Work together to untangle without letting go!",
    icon: "🪢"
  },
  {
    id: 14,
    name: "Breathing Exercise",
    duration: "2-3 minutes",
    type: "Mindfulness",
    explanation: "Deep breathing: Breathe in for 4 counts, hold for 4, out for 4. Imagine inflating like a balloon and slowly deflating.",
    icon: "🫁"
  },
  {
    id: 15,
    name: "Compliment Circle",
    duration: "3-4 minutes",
    type: "Social",
    explanation: "Sit in circle. Each person gives a genuine compliment to the person on their right. Spread positivity!",
    icon: "💝"
  },
  {
    id: 16,
    name: "Desk Push-ups",
    duration: "1-2 minutes",
    type: "Exercise",
    explanation: "Use your desk for modified push-ups! Place hands on desk edge and do 10-15 push-ups. Great for upper body strength.",
    icon: "💪"
  },
  {
    id: 17,
    name: "Story Building",
    duration: "3-4 minutes",
    type: "Creative",
    explanation: "Start a story with one sentence. Each student adds exactly one sentence to continue the story. See where the adventure leads!",
    icon: "📚"
  },
  {
    id: 18,
    name: "Speed Sorting",
    duration: "2-3 minutes",
    type: "Organization",
    explanation: "Quickly organize something: line up by birthday month, height, alphabetically by middle name, or shoe size!",
    icon: "📊"
  },
  {
    id: 19,
    name: "Chair Yoga",
    duration: "3-4 minutes",
    type: "Stretching",
    explanation: "Gentle stretches you can do sitting: neck rolls, shoulder shrugs, spinal twists, ankle circles. Perfect for tight spaces!",
    icon: "🧘"
  },
  {
    id: 20,
    name: "Invisible Jump Rope",
    duration: "2 minutes",
    type: "Exercise",
    explanation: "Pretend to jump rope! Students jump as if holding a rope, varying speed and style. Count jumps together!",
    icon: "🪢"
  },
  {
    id: 21,
    name: "Emoji Charades",
    duration: "3-5 minutes",
    type: "Acting",
    explanation: "Act out emojis without speaking! Others guess the emoji. Use facial expressions and body language only.",
    icon: "😄"
  },
  {
    id: 22,
    name: "Wall Push-ups",
    duration: "1-2 minutes",
    type: "Exercise",
    explanation: "Stand arm's length from wall. Place palms against wall and do 15-20 wall push-ups. Great for small spaces!",
    icon: "🧱"
  },
  {
    id: 23,
    name: "Guess the Sound",
    duration: "2-3 minutes",
    type: "Listening Game",
    explanation: "Play various sounds (animals, instruments, everyday objects). Students guess what's making each sound.",
    icon: "👂"
  },
  {
    id: 24,
    name: "Human Bingo",
    duration: "4-5 minutes",
    type: "Social",
    explanation: "Find classmates who match criteria: 'Has a pet,' 'Born in summer,' 'Likes pizza.' First to complete a line wins!",
    icon: "🎯"
  },
  {
    id: 25,
    name: "Alphabet Actions",
    duration: "3-4 minutes",
    type: "Movement",
    explanation: "Go through alphabet with actions: A=Applaud, B=Bounce, C=Clap, etc. Students suggest actions for each letter!",
    icon: "🔤"
  },
  {
    id: 26,
    name: "Mindful Minute",
    duration: "2-3 minutes",
    type: "Mindfulness",
    explanation: "Sit quietly and focus on breathing. Notice 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, 1 you can taste.",
    icon: "🧠"
  },
  {
    id: 27,
    name: "Quick Draw",
    duration: "2-3 minutes",
    type: "Art",
    explanation: "Call out objects to draw in 30 seconds each. No erasing allowed! Share and laugh at the creative interpretations.",
    icon: "✏️"
  },
  {
    id: 28,
    name: "Telephone Game",
    duration: "3-4 minutes",
    type: "Communication",
    explanation: "Whisper a message around the circle. See how much it changes from start to finish! Use funny phrases for more laughs.",
    icon: "📞"
  },
  {
    id: 29,
    name: "Balance Challenge",
    duration: "2-3 minutes",
    type: "Balance",
    explanation: "Stand on one foot for 30 seconds, then switch. Try with eyes closed, arms extended, or while counting backwards!",
    icon: "⚖️"
  },
  {
    id: 30,
    name: "Rapid Fire Questions",
    duration: "2-3 minutes",
    type: "Quick Thinking",
    explanation: "Ask rapid questions requiring quick answers: 'Name 3 red things!' 'What's 7x8?' Keep the pace fast and fun!",
    icon: "❓"
  },
  {
    id: 31,
    name: "Human Pretzel",
    duration: "3-4 minutes",
    type: "Flexibility",
    explanation: "Call out body positions: 'Touch your toes,' 'Reach for the sky,' 'Twist left,' 'Sit like a pretzel.' Hold each for 10 seconds.",
    icon: "🥨"
  },
  {
    id: 32,
    name: "Clapping Patterns",
    duration: "2-3 minutes",
    type: "Rhythm",
    explanation: "Create clapping rhythms that get progressively complex. Students repeat the pattern. Add stomping or snapping!",
    icon: "👏"
  },
  {
    id: 33,
    name: "Scavenger Hunt",
    duration: "3-4 minutes",
    type: "Search Game",
    explanation: "Find classroom items: 'Something red,' 'Something round,' 'Something that starts with B.' First to find all items wins!",
    icon: "🔍"
  },
  {
    id: 34,
    name: "Memory Circle",
    duration: "3-5 minutes",
    type: "Memory Game",
    explanation: "'I went to the store and bought...' Each person repeats the list and adds one item. See how long the list can get!",
    icon: "🧵"
  },
  {
    id: 35,
    name: "Superhero Poses",
    duration: "2-3 minutes",
    type: "Imagination",
    explanation: "Strike superhero poses and hold for 10 seconds each. Create your own superhero and show their signature pose!",
    icon: "🦸"
  },
  {
    id: 36,
    name: "Word Association",
    duration: "2-3 minutes",
    type: "Word Game",
    explanation: "Start with one word. Next person says a related word. Continue around the circle. No repeating words!",
    icon: "💭"
  },
  {
    id: 37,
    name: "Simon Says Extreme",
    duration: "3-4 minutes",
    type: "Following Directions",
    explanation: "Classic Simon Says but with silly actions: 'Simon says hop like a bunny!' 'Simon says make a funny face!'",
    icon: "👨‍🏫"
  },
  {
    id: 38,
    name: "Gratitude Round",
    duration: "2-3 minutes",
    type: "Mindfulness",
    explanation: "Share one thing you're grateful for today. Keep it quick and positive. Great for building class community!",
    icon: "🙏"
  },
  {
    id: 39,
    name: "Speed Stacking",
    duration: "2-3 minutes",
    type: "Dexterity",
    explanation: "Stack classroom items (books, erasers, pencils) as high as possible in 60 seconds. Whose tower will be tallest?",
    icon: "📚"
  },
  {
    id: 40,
    name: "Laugh Track",
    duration: "1-2 minutes",
    type: "Fun",
    explanation: "Everyone fake laughs for 30 seconds. Often the fake laughing becomes real laughing! Great stress reliever.",
    icon: "😂"
  },
  {
    id: 41,
    name: "Pencil Relay",
    duration: "3-4 minutes",
    type: "Team Game",
    explanation: "Pass a pencil down the line using only elbows, then knees, then feet. Drop it and start over! First team to finish wins.",
    icon: "✏️"
  },
  {
    id: 42,
    name: "Two Truths and a Lie",
    duration: "4-5 minutes",
    type: "Getting to Know",
    explanation: "Each person shares 3 statements about themselves - 2 true, 1 false. Others guess which is the lie!",
    icon: "🎭"
  },
  {
    id: 43,
    name: "Finger Exercises",
    duration: "1-2 minutes",
    type: "Fine Motor",
    explanation: "Stretch and exercise fingers: make fists, spread wide, touch thumb to each finger, wiggle each finger individually.",
    icon: "👋"
  },
  {
    id: 44,
    name: "Rhyme Time",
    duration: "2-3 minutes",
    type: "Word Play",
    explanation: "Start with a word. Go around circle with words that rhyme. When stuck, start with a new word. Keep the rhythm going!",
    icon: "🎵"
  },
  {
    id: 45,
    name: "Paper Airplane Contest",
    duration: "4-5 minutes",
    type: "Engineering",
    explanation: "Quick paper airplane construction and flying contest. Whose plane flies furthest? Most creative design?",
    icon: "✈️"
  },
  {
    id: 46,
    name: "Invisible Activities",
    duration: "2-3 minutes",
    type: "Imagination",
    explanation: "Pretend to do activities: wash dishes, walk a dog, play piano, climb a mountain. Others guess the activity!",
    icon: "👻"
  },
  {
    id: 47,
    name: "Number Sequences",
    duration: "2-3 minutes",
    type: "Math",
    explanation: "Count around circle with patterns: by 2s, 5s, 10s, or backwards from 100. Switch patterns to keep everyone alert!",
    icon: "🔢"
  },
  {
    id: 48,
    name: "Stretch and Reach",
    duration: "2-3 minutes",
    type: "Stretching",
    explanation: "Guided stretching: reach high like picking apples, bend like touching toes, twist like wringing out a towel.",
    icon: "🤸‍♀️"
  },
  {
    id: 49,
    name: "Mini Meditation",
    duration: "3-4 minutes",
    type: "Mindfulness",
    explanation: "Close eyes and imagine a peaceful place. Describe what you see, hear, and feel in this calm space.",
    icon: "🌅"
  },
  {
    id: 50,
    name: "Class Cheer",
    duration: "1-2 minutes",
    type: "Energy Boost",
    explanation: "Create or perform a class cheer with clapping, stomping, and shouting. End with a positive affirmation together!",
    icon: "📣"
  }
];

const BrainBreaks = ({ showToast, students = [] }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerActive, setTimerActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(timerSeconds - 1);
        } else if (timerMinutes > 0) {
          setTimerMinutes(timerMinutes - 1);
          setTimerSeconds(59);
        } else {
          // Timer finished
          setIsTimerRunning(false);
          setTimerActive(false);
          // Play completion sound
          try {
            const audio = new Audio('/sounds/ding.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => {});
          } catch(e) {}
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds, timerActive]);

  const selectRandomActivity = () => {
    setIsSpinning(true);
    
    // Add spinning delay for effect
    setTimeout(() => {
      const randomActivity = BRAIN_BREAK_ACTIVITIES[Math.floor(Math.random() * BRAIN_BREAK_ACTIVITIES.length)];
      setSelectedActivity(randomActivity);
      setIsSpinning(false);
      
      // Reset timer to activity duration (default to 3 minutes)
      const durationMatch = randomActivity.duration.match(/(\d+)/);
      if (durationMatch) {
        setTimerMinutes(parseInt(durationMatch[0]));
        setTimerSeconds(0);
      } else {
        setTimerMinutes(3);
        setTimerSeconds(0);
      }
      
      // Play selection sound
      try {
        const audio = new Audio('/sounds/ding.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => {});
      } catch(e) {}
    }, 1500);
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    setTimerActive(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerActive(false);
    if (selectedActivity) {
      const durationMatch = selectedActivity.duration.match(/(\d+)/);
      if (durationMatch) {
        setTimerMinutes(parseInt(durationMatch[0]));
        setTimerSeconds(0);
      } else {
        setTimerMinutes(3);
        setTimerSeconds(0);
      }
    } else {
      setTimerMinutes(3);
      setTimerSeconds(0);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'Movement': 'bg-red-500',
      'Exercise': 'bg-orange-500',
      'Focus Game': 'bg-blue-500',
      'Decision Game': 'bg-purple-500',
      'Partner Activity': 'bg-pink-500',
      'Brain Game': 'bg-indigo-500',
      'Imagination': 'bg-yellow-500',
      'Competition': 'bg-green-500',
      'Creative': 'bg-teal-500',
      'Academic': 'bg-cyan-500',
      'Teamwork': 'bg-emerald-500',
      'Mindfulness': 'bg-violet-500',
      'Social': 'bg-rose-500',
      'Stretching': 'bg-lime-500',
      'Organization': 'bg-amber-500',
      'Acting': 'bg-fuchsia-500',
      'Listening Game': 'bg-sky-500',
      'Art': 'bg-stone-500',
      'Communication': 'bg-red-400',
      'Balance': 'bg-blue-400',
      'Quick Thinking': 'bg-green-400',
      'Flexibility': 'bg-purple-400',
      'Rhythm': 'bg-pink-400',
      'Search Game': 'bg-yellow-400',
      'Memory Game': 'bg-indigo-400',
      'Word Game': 'bg-orange-400',
      'Following Directions': 'bg-teal-400',
      'Fun': 'bg-red-300',
      'Dexterity': 'bg-blue-300',
      'Team Game': 'bg-green-300',
      'Getting to Know': 'bg-purple-300',
      'Fine Motor': 'bg-pink-300',
      'Word Play': 'bg-yellow-300',
      'Engineering': 'bg-indigo-300',
      'Math': 'bg-orange-300',
      'Energy Boost': 'bg-red-600'
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <span className="text-4xl mr-3">🧠</span>
          Brain Break Generator
          <span className="text-4xl ml-3">⚡</span>
        </h3>
        <p className="text-lg opacity-90">Quick 2-5 minute activities to energize your classroom!</p>
      </div>

      {/* Main Action Button */}
      <div className="text-center">
        <button
          onClick={selectRandomActivity}
          disabled={isSpinning}
          className={`
            px-12 py-6 rounded-2xl text-2xl font-bold shadow-2xl transform transition-all duration-300
            ${isSpinning 
              ? 'bg-gray-400 cursor-not-allowed animate-pulse' 
              : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:scale-105 text-white'
            }
          `}
        >
          {isSpinning ? (
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
              <span>Selecting Brain Break...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🎲</span>
              <span>Get Random Brain Break!</span>
              <span className="text-3xl">🎯</span>
            </div>
          )}
        </button>
      </div>

      {/* Selected Activity Display */}
      {selectedActivity && (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gradient-to-r from-purple-400 to-pink-400">
          {/* Activity Header */}
          <div className={`${getTypeColor(selectedActivity.type)} text-white p-6 text-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10">
              <div className="text-6xl mb-3">{selectedActivity.icon}</div>
              <h4 className="text-4xl font-bold mb-2">{selectedActivity.name}</h4>
              <div className="flex items-center justify-center space-x-6 text-lg">
                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  📝 {selectedActivity.type}
                </span>
                <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                  ⏰ {selectedActivity.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Instructions */}
          <div className="p-8">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h5 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                <span className="text-2xl mr-2">📋</span>
                How to Play:
              </h5>
              <p className="text-lg text-gray-700 leading-relaxed">
                {selectedActivity.explanation}
              </p>
            </div>

            {/* Timer Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
              <h5 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">⏰</span>
                Activity Timer:
              </h5>
              
              {/* Timer Display */}
              <div className="text-center mb-4">
                <div className={`
                  text-6xl font-mono font-bold mb-4 p-6 rounded-2xl
                  ${timerActive 
                    ? (timerMinutes < 1 && timerSeconds <= 30 
                      ? 'bg-red-100 text-red-600 animate-pulse' 
                      : 'bg-green-100 text-green-600'
                    )
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={startTimer}
                  disabled={timerActive && isTimerRunning}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-all font-medium"
                >
                  ▶️ Start
                </button>
                
                <button
                  onClick={pauseTimer}
                  disabled={!timerActive}
                  className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-all font-medium"
                >
                  {isTimerRunning ? '⏸️ Pause' : '▶️ Resume'}
                </button>
                
                <button
                  onClick={resetTimer}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium"
                >
                  🔄 Reset
                </button>
              </div>

              {/* Timer Status */}
              {timerActive && (
                <div className="text-center mt-4">
                  <span className={`
                    px-4 py-2 rounded-full font-medium
                    ${isTimerRunning ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  `}>
                    {isTimerRunning ? '🟢 Timer Running' : '🟡 Timer Paused'}
                  </span>
                </div>
              )}
            </div>

            {/* New Activity Button */}
            <div className="text-center mt-6">
              <button
                onClick={selectRandomActivity}
                disabled={isSpinning}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg"
              >
                🔄 Get Another Brain Break
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="text-center">
          <h5 className="text-lg font-bold text-blue-800 mb-2">💡 Brain Break Benefits</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">🧠</span>
              <span>Improves focus and attention</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">❤️</span>
              <span>Reduces stress and anxiety</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xl">⚡</span>
              <span>Boosts energy and mood</span>
            </div>
          </div>
          <p className="text-blue-600 mt-3 font-medium">
            🎯 {BRAIN_BREAK_ACTIVITIES.length} unique activities available! Perfect for any classroom moment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrainBreaks;