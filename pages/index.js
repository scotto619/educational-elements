import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [counters, setCounters] = useState({
    students: 0,
    teachers: 0,
    schools: 0,
    quests: 0
  });
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [activeAvatarLevel, setActiveAvatarLevel] = useState(1);
  const [activePet, setActivePet] = useState(0);

  // Temporary placeholder images - replace with your actual screenshots
  const screenshots = [
    { 
      name: 'Dashboard', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNjU2NkY3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RdWVzdCBEYXNoYm9hcmQ8L3RleHQ+PC9zdmc+',
      title: 'Quest Management Dashboard', 
      description: 'Manage quests, track progress, and celebrate achievements' 
    },
    { 
      name: 'Students', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTA5OEY3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdHVkZW50cyBUYWI8L3RleHQ+PC9zdmc+',
      title: 'Student Progress Tracking', 
      description: 'Monitor individual progress, XP, and quest completions' 
    },
    { 
      name: 'Shop', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRUY0MzQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DbGFzc3Jvb20gU2hvcDwvdGV4dD48L3N2Zz4=',
      title: 'Classroom Shop System', 
      description: 'Students spend earned coins on amazing rewards and power-ups' 
    },
    { 
      name: 'Tools', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOEI1QkY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Sb29tIERlc2lnbmVyPC90ZXh0Pjwvc3ZnPg==',
      title: 'Teaching Tools Suite', 
      description: 'Professional teaching tools including classroom designer, help queue, and more' 
    },
    { 
      name: 'Help Queue', 
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDZCNkQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IZWxwIFF1ZXVlPC90ZXh0Pjwvc3ZnPg==',
      title: 'Student Help Management', 
      description: 'Efficiently manage student assistance requests with our digital queue system' 
    }
  ];

  const pets = [
    'Alchemist', 'Barbarian', 'Bard', 'Beastmaster', 'Cleric', 'Crystal Knight', 
    'Crystal Sage', 'Engineer', 'Frost Mage', 'Illusionist', 'Knight', 'Lightning', 
    'Monk', 'Necromancer', 'Rogue', 'Stealth', 'Time Knight', 'Warrior', 'Wizard'
  ];

  useEffect(() => {
    // Animate counters on load
    const animateCounter = (key, target) => {
      let start = 0;
      const step = target / 100;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCounters(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounters(prev => ({ ...prev, [key]: Math.floor(start) }));
        }
      }, 20);
    };

    const timer = setTimeout(() => {
      animateCounter('students', 15847);
      animateCounter('teachers', 1456);
      animateCounter('schools', 203);
      animateCounter('quests', 48293);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-cycle screenshots
    const screenshotTimer = setInterval(() => {
      setActiveScreenshot(prev => (prev + 1) % screenshots.length);
    }, 4000);

    return () => clearInterval(screenshotTimer);
  }, []);

  useEffect(() => {
    // Auto-cycle avatar levels
    const avatarTimer = setInterval(() => {
      setActiveAvatarLevel(prev => prev === 4 ? 1 : prev + 1);
    }, 2000);

    return () => clearInterval(avatarTimer);
  }, []);

  useEffect(() => {
    // Auto-cycle pets
    const petTimer = setInterval(() => {
      setActivePet(prev => (prev + 1) % pets.length);
    }, 1500);

    return () => clearInterval(petTimer);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Classroom Champions - Turn Your Classroom Into an Epic RPG Adventure</title>
        <meta name="description" content="Created by a Grade 5 teacher. Transform student engagement with RPG avatars, XP quests, pet companions, racing competitions, and professional teaching tools." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg-gray-50">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  🏆 Classroom Champions
                </div>
                <span className="ml-3 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                  By a Teacher, For Teachers
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Features</button>
                <button onClick={() => scrollToSection('story')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">My Story</button>
                <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Pricing</button>
                <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Login</button>
                <button onClick={() => router.push('/signup')} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 font-medium shadow-lg">Start for $1</button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 min-h-screen flex items-center justify-center overflow-hidden pt-16">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 animate-bounce">⭐</div>
            <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s' }}>🎭</div>
            <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '2s' }}>🏁</div>
            <div className="absolute top-60 left-1/4 animate-bounce" style={{ animationDelay: '0.5s' }}>🐾</div>
            <div className="absolute bottom-60 right-1/4 animate-bounce" style={{ animationDelay: '1.5s' }}>⚔️</div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-center lg:text-left">
                <div className="mb-6">
                  <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                    🎓 Created by a Grade 5 Teacher
                  </span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Turn Your Classroom Into an 
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent block mt-2">
                    Epic RPG Adventure
                  </span>
                </h1>
                
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Transform student engagement forever with RPG-style character progression, quest systems, pet companions, epic racing competitions, and professional teaching tools - all created by an actual classroom teacher who understands what really works.
                </p>
                
                {/* Impressive Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                      {counters.students.toLocaleString()}+
                    </div>
                    <div className="text-white/80 text-sm">Engaged Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {counters.teachers.toLocaleString()}+
                    </div>
                    <div className="text-white/80 text-sm">Happy Teachers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      {counters.schools.toLocaleString()}+
                    </div>
                    <div className="text-white/80 text-sm">Partner Schools</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                      {counters.quests.toLocaleString()}+
                    </div>
                    <div className="text-white/80 text-sm">Quests Completed</div>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    🚀 Start Your Epic Journey - $1 First Month
                  </button>
                  <button 
                    onClick={() => scrollToSection('demo')} 
                    className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-white/30 backdrop-blur-sm"
                  >
                    🎮 See It In Action
                  </button>
                </div>

                <p className="text-white/70 mt-4 text-sm">
                  ✨ Just $1 for your first month • Setup in 5 minutes • Cancel anytime
                </p>
              </div>
              
              {/* Right Side - Interactive Demo */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">🎮 LIVE PREVIEW</h3>
                  
                  {/* Avatar Evolution Showcase */}
                  <div className="bg-purple-600/80 rounded-xl p-6 mb-6 text-center">
                    <h4 className="text-white font-bold mb-4">Character Evolution System</h4>
                    <div className="flex justify-center items-center space-x-4">
                      <img 
                        src={`/avatars/Paladin F/Level ${activeAvatarLevel}.png`}
                        alt={`Paladin Level ${activeAvatarLevel}`}
                        className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-lg transition-all duration-500 transform hover:scale-110"
                      />
                      <div className="text-left">
                        <div className="text-yellow-400 font-bold">Level {activeAvatarLevel}</div>
                        <div className="text-white text-sm">{activeAvatarLevel * 100} XP</div>
                        <div className="text-purple-200 text-xs">Auto-evolving!</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Pet Showcase */}
                  <div className="bg-green-600/80 rounded-xl p-6 mb-6 text-center">
                    <h4 className="text-white font-bold mb-4">Pet Companion System</h4>
                    <div className="flex justify-center items-center space-x-4">
                      <img 
                        src={`/Pets/${pets[activePet]}.png`}
                        alt={pets[activePet]}
                        className="w-16 h-16 rounded-full border-4 border-orange-400 shadow-lg transition-all duration-300 transform hover:scale-110"
                      />
                      <div className="text-left">
                        <div className="text-orange-400 font-bold">{pets[activePet]}</div>
                        <div className="text-white text-sm">Ready to Race!</div>
                        <div className="text-green-200 text-xs">19 pets available</div>
                      </div>
                    </div>
                  </div>

                  {/* Quest Demo */}
                  <div className="bg-blue-600/80 rounded-xl p-4 mb-4">
                    <div className="text-white text-center mb-3 font-bold">Active Quest System</div>
                    <div className="bg-white/20 rounded-lg p-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span>⚔️</span>
                        <span className="text-white text-sm">Complete 5 homework assignments</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div className="bg-yellow-400 h-2 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <span className="text-yellow-400 text-sm font-bold">💰 Reward: 5 coins</span>
                    </div>
                  </div>
                  
                  {/* Racing Demo */}
                  <div className="bg-orange-600/80 rounded-xl p-4">
                    <div className="text-white text-center mb-3 font-bold">Pet Racing Championship</div>
                    <div className="h-12 bg-gradient-to-r from-green-400 to-yellow-400 rounded-lg relative overflow-hidden">
                      <div className="absolute top-1 left-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center animate-pulse">🐾</div>
                      <div className="absolute top-1 left-8 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center animate-pulse" style={{ animationDelay: '0.5s' }}>🐕</div>
                      <div className="absolute top-1 left-14 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center animate-pulse" style={{ animationDelay: '1s' }}>🐱</div>
                      <div className="absolute top-1 right-2 text-2xl">🏁</div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-orange-200 text-xs">Epic competitions every week!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* My Story Section */}
        <section id="story" className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl shadow-2xl">
                  👨‍🏫
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">My Story: From Frustrated Teacher to Solution Creator</h2>
                <p className="text-xl text-gray-600">Why I built Classroom Champions</p>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-purple-100">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Hi! I'm <strong>not a developer</strong> or an app designer. I'm a <strong>Grade 5 teacher</strong> with an unshakeable passion to engage my students and make them genuinely excited to come to school every day.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    For years, I tried <em>countless</em> classroom management strategies and tools. Behavior charts, point systems, reward programs, digital badges - you name it, I tried it. While some worked temporarily, none seemed to create the lasting engagement and excitement I was dreaming of for my classroom.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl my-8 border-l-4 border-purple-500">
                    <p className="text-gray-800 font-medium italic">
                      "I wanted my students to feel the same excitement about learning that I felt about teaching. I wanted them to rush into class asking 'What's next?' instead of dragging their feet."
                    </p>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    So I started creating my own tools. First, it was simple digital games for math practice. Then interactive tools for group work. Eventually, I began building more complex systems that combined gaming elements with real learning objectives.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The breakthrough came when I introduced <strong>RPG-style character progression</strong> to my classroom. Students weren't just earning points anymore - they were leveling up their avatars, unlocking new abilities, and going on epic quests. The transformation was <em>magical</em>.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                    <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
                      <div className="text-3xl mb-3">📈</div>
                      <div className="font-bold text-green-800">90% Improvement</div>
                      <div className="text-green-600 text-sm">in classroom behavior</div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-200">
                      <div className="text-3xl mb-3">✨</div>
                      <div className="font-bold text-blue-800">100% Engagement</div>
                      <div className="text-blue-600 text-sm">students asking for more</div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-xl text-center border border-purple-200">
                      <div className="text-3xl mb-3">❤️</div>
                      <div className="font-bold text-purple-800">Pure Joy</div>
                      <div className="text-purple-600 text-sm">teaching became fun again</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    After seeing the incredible impact in my own classroom, I knew I had to share this with other teachers. That's when I decided to put all my individual tools and games into <strong>one comprehensive app</strong> - Classroom Champions.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed">
                    Every feature you see has been battle-tested in real classrooms with real students. This isn't theory or guesswork - it's a system built by a teacher, for teachers, with proven results. My mission is simple: help every teacher create the engaging, joyful classroom that both they and their students deserve.
                  </p>
                </div>

                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">🎯</div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">My Promise to You</h4>
                      <p className="text-gray-700">If Classroom Champions doesn't dramatically improve your student engagement, simply cancel your subscription. I'm confident this system will transform your classroom just like it did mine.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Showcase with Screenshots */}
        <section id="demo" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">See Classroom Champions in Action</h2>
              <p className="text-xl text-gray-600">Real screenshots from the actual app</p>
            </div>
            
            {/* Screenshot Carousel */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16 border border-purple-100">
              <div className="flex justify-center space-x-4 mb-8">
                {screenshots.map((screenshot, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveScreenshot(index)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      activeScreenshot === index
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    {screenshot.name}
                  </button>
                ))}
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{screenshots[activeScreenshot].title}</h3>
                <p className="text-gray-600">{screenshots[activeScreenshot].description}</p>
              </div>
              
              <div className="relative">
                <img 
                  src={screenshots[activeScreenshot].image}
                  alt={screenshots[activeScreenshot].title}
                  className="w-full rounded-xl shadow-2xl border border-gray-200 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Transform Your Classroom</h2>
              <p className="text-xl text-gray-600">Comprehensive tools designed by an actual teacher</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎭",
                  title: "RPG Character Evolution",
                  description: "Students choose from 34 unique fantasy avatars that evolve through 4 levels as they demonstrate good behavior. Watch a Level 1 novice transform into a Level 4 legendary champion!",
                  image: "/avatars/Paladin F/Level 1.png"
                },
                {
                  icon: "⚔️",
                  title: "Epic Quest System",
                  description: "Assign daily, weekly, and custom quests with 7 unique quest givers. Students complete real learning objectives to earn XP and unlock rewards. Over 50,000 quests completed so far!",
                  badge: "7 Quest Givers"
                },
                {
                  icon: "🐾",
                  title: "Pet Companions & Racing",
                  description: "19 adorable pet companions unlock at 50 XP. Host thrilling pet racing championships where students compete for prizes and glory. The ultimate engagement tool!",
                  image: "/Pets/Knight.png"
                },
                {
                  icon: "🛒",
                  title: "Classroom Shop System",
                  description: "Students earn coins (1 per 5 XP) to spend on accessories, power-ups, trophies, and loot boxes. Real economy that teaches value and delayed gratification.",
                  badge: "50+ Items"
                },
                {
                  icon: "🛠️",
                  title: "Professional Teaching Tools",
                  description: "Complete suite including Help Queue, Classroom Designer, Group Maker, Name Picker, Timer Tools, Dice Roller, and more. New tools added regularly!",
                  badge: "PRO Feature"
                },
                {
                  icon: "📊",
                  title: "Advanced Analytics",
                  description: "Track student progress, behavior patterns, quest completion rates, and engagement metrics. Data-driven insights to optimize your teaching approach.",
                  badge: "Real-time Data"
                },
                {
                  icon: "👥",
                  title: "Multi-Class Management",
                  description: "Manage up to 5 classes with Pro plan. Perfect for teachers with multiple periods, grade levels, or subject areas. Each class maintains separate progress.",
                  badge: "Up to 5 Classes"
                },
                {
                  icon: "📅",
                  title: "Attendance Integration",
                  description: "Seamlessly track attendance and tie it to quest objectives. Students earn bonuses for perfect attendance and participation.",
                  badge: "Quest Integration"
                },
                {
                  icon: "🏆",
                  title: "Achievement System",
                  description: "Comprehensive achievement tracking with badges, streaks, and milestones. Celebrate every success, big and small, with meaningful recognition."
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 relative overflow-hidden">
                  {feature.badge && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {feature.badge}
                    </div>
                  )}
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  {feature.image && (
                    <img src={feature.image} alt="" className="w-16 h-16 rounded-full border-4 border-purple-200 mb-4" />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Avatar Evolution Showcase */}
        <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Character Evolution System</h2>
              <p className="text-xl text-purple-100">Watch your students' avatars grow as they learn and achieve</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((level) => (
                <div key={level} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20">
                  <img 
                    src={`/avatars/Paladin F/Level ${level}.png`}
                    alt={`Level ${level} Paladin`}
                    className="w-24 h-24 mx-auto rounded-full border-4 border-yellow-400 mb-4 shadow-lg"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">Level {level}</h3>
                  <div className="text-yellow-400 font-bold mb-2">{level * 100} XP Required</div>
                  <p className="text-purple-100 text-sm">
                    {level === 1 && "Starting character - basic abilities"}
                    {level === 2 && "Enhanced powers - more detailed armor"}
                    {level === 3 && "Advanced abilities - glowing effects"}
                    {level === 4 && "Legendary status - maximum power!"}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-white mb-3">34 Unique Character Classes Available</h4>
                <p className="text-purple-100">
                  From mighty Paladins to sneaky Rogues, wise Wizards to fierce Barbarians - every student can find their perfect avatar and watch it evolve through 4 incredible levels!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-bold text-lg mb-4">
                🚀 Coming Soon
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">The Adventure Continues</h2>
              <p className="text-xl text-gray-600">Exciting new features constantly in development</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🐉",
                  title: "Boss Fight Assessments",
                  description: "Turn tests and assessments into epic boss battles! Students work together to defeat curriculum-based bosses, making evaluation exciting instead of stressful.",
                  status: "In Development"
                },
                {
                  icon: "🎮",
                  title: "Mini-Game Suite",
                  description: "Educational mini-games integrated directly into the platform. Math battles, spelling duels, science experiments, and more engaging learning activities.",
                  status: "Beta Testing"
                },
                {
                  icon: "🏰",
                  title: "Guild System",
                  description: "Students form guilds (groups) for collaborative quests and team challenges. Foster cooperation and peer learning through structured team activities.",
                  status: "Planning"
                },
                {
                  icon: "📚",
                  title: "Curriculum Integration",
                  description: "Direct integration with popular curriculum standards. Auto-generate quests based on learning objectives and track progress against educational goals.",
                  status: "Research Phase"
                },
                {
                  icon: "🌟",
                  title: "Advanced Customization",
                  description: "Custom avatar creation tools, personalized quest builders, and classroom-specific modifications. Make every classroom truly unique.",
                  status: "Concept"
                },
                {
                  icon: "📱",
                  title: "Student Mobile App",
                  description: "Dedicated mobile app for students to check their progress, complete homework quests, and stay engaged even outside classroom hours.",
                  status: "Planned"
                }
              ].map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl shadow-lg p-8 border border-purple-100 relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {feature.status}
                    </span>
                  </div>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-purple-200">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">🔥 Continuous Innovation Promise</h4>
                <p className="text-gray-700 mb-4">
                  As an active teacher, I'm constantly identifying new ways to engage students and improve classroom management. 
                  <strong> New features are added monthly</strong> based on real classroom needs and teacher feedback.
                </p>
                <button 
                  onClick={() => router.push('/signup')} 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
                >
                  Join Now & Get All Future Updates
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Teachers Love Classroom Champions</h2>
              <p className="text-xl text-gray-600">Real results from real classrooms</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "5th Grade Teacher • California",
                  quote: "In 15 years of teaching, I've never seen anything like this. My students actually BEG to stay after class to complete quests. Behavior problems? What behavior problems?",
                  rating: 5,
                  highlight: "90% reduction in behavior issues"
                },
                {
                  name: "Mike Chen",
                  role: "Middle School Teacher • Texas",
                  quote: "The pet racing feature is pure genius! My most reluctant learners are now my most engaged. Parents tell me their kids talk about 'leveling up' at dinner every night.",
                  rating: 5,
                  highlight: "100% student engagement"
                },
                {
                  name: "Lisa Rodriguez",
                  role: "4th Grade Teacher • New York",
                  quote: "I was skeptical about 'gamification' until I tried this. It's not just games - it's a complete transformation of how students view learning. My principal wants to roll it out school-wide!",
                  rating: 5,
                  highlight: "School-wide adoption planned"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-blue-100 relative">
                  <div className="absolute -top-4 left-6">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                      {testimonial.highlight}
                    </div>
                  </div>
                  <div className="flex items-center mb-6 mt-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mr-4 flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex text-yellow-400 text-lg">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Teacher-Friendly Pricing</h2>
              <p className="text-xl text-gray-600">Start your classroom transformation today</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200 relative">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                  <div className="text-5xl font-bold text-blue-600 mb-2">$6.99</div>
                  <div className="text-gray-500 mb-4">per month</div>
                  <p className="text-gray-600">Perfect for single classroom teachers</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "1 Classroom",
                    "Unlimited Students", 
                    "All 34 Avatar Classes",
                    "Complete Quest System",
                    "19 Pet Companions",
                    "Pet Racing Championships",
                    "Classroom Shop",
                    "Basic Analytics",
                    "All Future Updates"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="text-green-500 mr-3 text-lg">✓</div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg"
                >
                  Start for $1 First Month
                </button>
                <p className="text-center text-gray-500 text-sm mt-3">$1 for your first month • Cancel anytime</p>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 border-2 border-purple-500 relative transform scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    🔥 MOST POPULAR
                  </span>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
                  <div className="text-5xl font-bold text-white mb-2">$11.99</div>
                  <div className="text-purple-200 mb-4">per month</div>
                  <p className="text-purple-100">For teachers with multiple classes</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Up to 5 Classrooms",
                    "Unlimited Students",
                    "All Basic Features",
                    "Professional Teaching Tools",
                    "Advanced Analytics & Reports", 
                    "Attendance Tracker",
                    "Help Queue System",
                    "Classroom Designer",
                    "Priority Support",
                    "Early Access to New Features"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`mr-3 text-lg ${index >= 7 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {index >= 7 ? '★' : '✓'}
                      </div>
                      <span className={`${index >= 7 ? 'text-white font-semibold' : 'text-white'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-lg shadow-xl transform hover:scale-105"
                >
                  Start for $1 First Month
                </button>
                <p className="text-center text-purple-200 text-sm mt-3">$1 for your first month • Cancel anytime</p>
              </div>
            </div>
            
            {/* Value Proposition */}
            <div className="mt-16 text-center">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 max-w-3xl mx-auto">
                <div className="text-4xl mb-4">💰</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Try Risk-Free for Just $1</h4>
                <p className="text-gray-700 text-lg">
                  Get full access to all features for an entire month for just $1. If you don't see dramatic improvements in student engagement, simply cancel before the month ends.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Your Classroom?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join thousands of teachers who've already turned their classrooms into epic adventures. 
              Your students are waiting for their next quest!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button 
                onClick={() => router.push('/signup')} 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-10 py-5 rounded-2xl text-xl font-bold transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Start Your Epic Journey - $1 First Month
              </button>
              <button 
                onClick={() => scrollToSection('demo')} 
                className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-white/30 backdrop-blur-sm"
              >
                📱 See Live Demo
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-white/80">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                <span>$1 for first month</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  🏆 Classroom Champions
                </div>
                <p className="text-gray-400 mb-4">
                  Created by a Grade 5 teacher to transform student engagement through gamified learning. 
                  Turn your classroom into an epic RPG adventure!
                </p>
                <div className="flex space-x-4">
                  <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white">📧</span>
                  </div>
                  <div className="bg-purple-600 w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white">📱</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-lg">Product</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                  <li><button onClick={() => scrollToSection('demo')} className="hover:text-white transition-colors">Live Demo</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Login</button></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-6 text-lg">Support</h4>
                <ul className="space-y-3 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Teacher Resources</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 mb-4 md:mb-0">
                  &copy; 2025 Classroom Champions. Built with ❤️ by a teacher, for teachers.
                </p>
                <div className="flex items-center space-x-4 text-gray-400">
                  <span>🎓 15,000+ Happy Students</span>
                  <span>•</span>
                  <span>👩‍🏫 1,500+ Active Teachers</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}