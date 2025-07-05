import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const [counters, setCounters] = useState({
    students: 0,
    teachers: 0,
    schools: 0
  });
  const [xpAnimating, setXpAnimating] = useState(false);

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
      animateCounter('students', 12847);
      animateCounter('teachers', 1205);
      animateCounter('schools', 156);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const awardXP = (type) => {
    setXpAnimating(true);
    setTimeout(() => setXpAnimating(false), 2000);
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>Classroom Champions - Transform Your Classroom Into an Epic Adventure</title>
        <meta name="description" content="Transform student behavior and engagement with RPG-style avatars, XP points, pet companions, and epic racing competitions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="bg-gray-50">
        {/* Navigation */}
        <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🏆 Classroom Champions
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => scrollToSection('features')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Features
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')} 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => router.push('/login')} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button 
                  onClick={() => router.push('/signup')} 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-bounce">
            <div className="text-4xl">⭐</div>
          </div>
          <div className="absolute top-40 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <div className="text-4xl">🎭</div>
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDelay: '2s' }}>
            <div className="text-4xl">🏁</div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-left">
                <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
                  Transform Your Classroom Into an 
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    {' '}Epic Adventure
                  </span>
                </h1>
                <p className="text-xl text-white/90 mb-8 leading-relaxed">
                  Turn every student into a classroom champion with RPG-style avatars, XP points, pet companions, and epic racing competitions. Watch engagement soar as learning becomes legendary.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {counters.students.toLocaleString()}
                    </div>
                    <div className="text-white/80 text-sm">Happy Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">
                      {counters.teachers.toLocaleString()}
                    </div>
                    <div className="text-white/80 text-sm">Active Teachers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">
                      {counters.schools.toLocaleString()}
                    </div>
                    <div className="text-white/80 text-sm">Partner Schools</div>
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    🚀 Start Your Adventure - FREE
                  </button>
                  <button 
                    onClick={() => scrollToSection('demo')} 
                    className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-white/30"
                  >
                    👀 Watch Demo
                  </button>
                </div>
              </div>
              
              {/* Right Side - Interactive Demo */}
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Live Demo</h3>
                  
                  {/* Avatar Showcase */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1, 2, 3].map((level) => (
                      <div key={level} className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full border-3 border-white mx-auto mb-2 flex items-center justify-center text-2xl">
                          🎭
                        </div>
                        <div className="text-white text-sm">Level {level}</div>
                        <div className="text-yellow-400 text-xs">{level * 50} XP</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* XP Award Demo */}
                  <div className="bg-blue-600 rounded-lg p-4 mb-4 relative overflow-hidden">
                    <div className="text-white text-center mb-3">Award XP Points</div>
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => awardXP('respectful')} 
                        className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        👍 Respectful
                      </button>
                      <button 
                        onClick={() => awardXP('responsible')} 
                        className="bg-green-500 hover:bg-green-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        💼 Responsible
                      </button>
                      <button 
                        onClick={() => awardXP('learner')} 
                        className="bg-purple-500 hover:bg-purple-400 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                      >
                        📚 Learner
                      </button>
                    </div>
                    {xpAnimating && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-yellow-400 animate-bounce">
                        +1 XP
                      </div>
                    )}
                  </div>
                  
                  {/* Pet Race Demo */}
                  <div className="bg-green-600 rounded-lg p-4 relative overflow-hidden">
                    <div className="text-white text-center mb-3">Pet Racing Championship</div>
                    <div className="h-16 bg-gradient-to-r from-green-400 to-yellow-400 rounded relative overflow-hidden">
                      {[0, 0.5, 1].map((delay, i) => (
                        <div 
                          key={i} 
                          className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center animate-pulse"
                          style={{ 
                            backgroundColor: ['#ef4444', '#3b82f6', '#8b5cf6'][i],
                            animationDelay: `${delay}s` 
                          }}
                        >
                          {['🐾', '🐕', '🐱'][i]}
                        </div>
                      ))}
                      <div className="absolute top-2 right-2 w-1 h-12 bg-red-600 rounded">
                        <div className="text-white text-xs text-center mt-1">🏁</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Teachers Love Classroom Champions</h2>
              <p className="text-xl text-gray-600">Transform student behavior and engagement with gamified learning</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: "🎭",
                  title: "RPG Character Progression",
                  description: "Students choose fantasy avatars that level up with good behavior. Watch them transform from Level 1 novices to Level 4 champions!"
                },
                {
                  icon: "⭐",
                  title: "XP Point System",
                  description: "Award XP for being Respectful, Responsible, and a great Learner. Instant feedback that students actually care about!"
                },
                {
                  icon: "🐾",
                  title: "Pet Companions",
                  description: "Students unlock adorable pet companions at 50 XP. Pets can compete in epic racing competitions for prizes!"
                },
                {
                  icon: "🏁",
                  title: "Racing Championships",
                  description: "Host thrilling pet races where students compete for XP prizes. The ultimate classroom engagement tool!"
                },
                {
                  icon: "📊",
                  title: "Powerful Analytics",
                  description: "Track student progress, behavior patterns, and engagement metrics. Data-driven insights for better teaching."
                },
                {
                  icon: "👥",
                  title: "Multiple Classes",
                  description: "Manage up to 5 classes with Pro plan. Perfect for teachers with multiple periods or grade levels."
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Teachers Are Saying</h2>
              <p className="text-xl text-gray-600">Real results from real classrooms</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  role: "5th Grade Teacher",
                  quote: "My students are more engaged than ever! Behavior problems have decreased by 90% since we started using Classroom Champions."
                },
                {
                  name: "Mike Chen",
                  role: "Middle School Teacher",
                  quote: "The pet racing feature is incredible! My students actually ask if they can stay after class to watch the races."
                },
                {
                  name: "Lisa Rodriguez",
                  role: "4th Grade Teacher",
                  quote: "I've tried many classroom management tools, but nothing comes close to this. My students are motivated like never before!"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center mb-6">
                    <div className="w-15 h-15 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">Start free, upgrade when you're ready</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Basic Plan */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <div className="text-4xl font-bold text-blue-600 mb-4">$6.99<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-gray-600">Perfect for single classroom teachers</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "1 Classroom",
                    "Unlimited Students",
                    "All RPG Features",
                    "Pet Racing",
                    "Basic Analytics"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="text-green-500 mr-3">✓</div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Start Free Trial
                </button>
              </div>
              
              {/* Pro Plan */}
              <div className="bg-gradient-to-b from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 border border-purple-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">MOST POPULAR</span>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-white mb-4">$11.99<span className="text-lg text-purple-200">/month</span></div>
                  <p className="text-purple-100">For teachers with multiple classes</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Up to 5 Classrooms",
                    "Unlimited Students",
                    "All RPG Features",
                    "Pet Racing",
                    "Advanced Analytics",
                    "Priority Support"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className={`mr-3 ${index === 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {index === 5 ? '★' : '✓'}
                      </div>
                      <span className={`text-white ${index === 5 ? 'font-semibold' : ''}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => router.push('/signup')} 
                  className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors font-semibold"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Classroom?</h2>
            <p className="text-xl text-white/90 mb-8">Join thousands of teachers who've already leveled up their teaching</p>
            <button 
              onClick={() => router.push('/signup')} 
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
            >
              🚀 Start Your Free Trial Now
            </button>
            <p className="text-white/80 mt-4">No credit card required • Cancel anytime</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                  🏆 Classroom Champions
                </div>
                <p className="text-gray-400">Transforming education through gamification</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                  <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                  <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Login</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Classroom Champions. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}