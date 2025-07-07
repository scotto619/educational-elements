// TeachersToolkitTab.js - Professional Teaching Tools for PRO Users
import React, { useState } from 'react';

const TeachersToolkitTab = ({ 
  userData, 
  router, 
  students, 
  showToast 
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('overview');
  const [selectedTool, setSelectedTool] = useState(null);

  // Check if user has PRO access
  const hasPROAccess = userData?.subscription === 'pro';

  // Available tools configuration
  const availableTools = [
    {
      id: 'group-maker',
      name: 'Class Group Maker',
      description: 'Automatically create balanced groups for activities and projects',
      icon: '👥',
      category: 'classroom-management',
      status: 'coming-soon', // 'available', 'coming-soon', 'in-development'
      features: ['Random grouping', 'Balanced by ability', 'Custom criteria', 'Export groups']
    },
    {
      id: 'dice-roller',
      name: 'Digital Dice Roller',
      description: 'Interactive dice for classroom games and random selection',
      icon: '🎲',
      category: 'interactive',
      status: 'coming-soon',
      features: ['Multiple dice types', 'Custom sides', 'Animation effects', 'Sound effects']
    },
    {
      id: 'hundreds-board',
      name: 'Interactive Hundreds Board',
      description: 'Digital hundreds chart for number recognition and patterns',
      icon: '💯',
      category: 'math',
      status: 'coming-soon',
      features: ['Interactive highlighting', 'Pattern recognition', 'Skip counting', 'Number games']
    },
    {
      id: 'help-tickets',
      name: 'Student Help System',
      description: 'Digital help queue for managing student questions',
      icon: '🎫',
      category: 'classroom-management',
      status: 'coming-soon',
      features: ['Question queue', 'Priority levels', 'Time tracking', 'Help analytics']
    },
    {
      id: 'random-selector',
      name: 'Student Selector',
      description: 'Fairly select students for participation and activities',
      icon: '🎯',
      category: 'interactive',
      status: 'coming-soon',
      features: ['Fair rotation', 'Group selection', 'Weighted selection', 'History tracking']
    },
    {
      id: 'timer-tools',
      name: 'Classroom Timers',
      description: 'Various timers for activities, breaks, and transitions',
      icon: '⏰',
      category: 'classroom-management',
      status: 'coming-soon',
      features: ['Multiple timers', 'Visual indicators', 'Sound alerts', 'Activity tracking']
    }
  ];

  const toolCategories = [
    { id: 'all', name: 'All Tools', icon: '🛠️' },
    { id: 'classroom-management', name: 'Classroom Management', icon: '📋' },
    { id: 'interactive', name: 'Interactive Tools', icon: '🎮' },
    { id: 'math', name: 'Math Tools', icon: '🔢' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTools = selectedCategory === 'all' 
    ? availableTools 
    : availableTools.filter(tool => tool.category === selectedCategory);

  // PRO Access Check Component
  const PROAccessCheck = () => {
    if (hasPROAccess) return null;

    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Teachers Toolkit - PRO Feature</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Unlock powerful teaching tools designed to enhance your classroom experience. 
          The Teachers Toolkit includes group makers, interactive tools, timers, and much more!
        </p>
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 max-w-3xl mx-auto mb-8">
          <h3 className="text-xl font-bold text-purple-800 mb-4">🌟 PRO Features Include:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {availableTools.slice(0, 6).map(tool => (
              <div key={tool.id} className="flex items-center space-x-3">
                <span className="text-2xl">{tool.icon}</span>
                <span className="text-purple-700 font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router?.push('/pricing')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            ⭐ Upgrade to PRO
          </button>
          <button
            onClick={() => showToast && showToast('More information available on our pricing page!')}
            className="bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    );
  };

  // Tool Card Component
  const ToolCard = ({ tool }) => {
    const getStatusBadge = (status) => {
      switch (status) {
        case 'available':
          return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Available</span>;
        case 'coming-soon':
          return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">Coming Soon</span>;
        case 'in-development':
          return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">In Development</span>;
        default:
          return null;
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{tool.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{tool.name}</h3>
              {getStatusBadge(tool.status)}
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{tool.description}</p>
        
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700 mb-2">Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {tool.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        
        <button
          onClick={() => {
            if (tool.status === 'available') {
              setSelectedTool(tool);
            } else {
              showToast && showToast(`${tool.name} is ${tool.status.replace('-', ' ')}. We're working hard to bring this to you!`);
            }
          }}
          disabled={tool.status !== 'available'}
          className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
            tool.status === 'available'
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {tool.status === 'available' ? 'Launch Tool' : 'Coming Soon'}
        </button>
      </div>
    );
  };

  // Main Toolkit Overview
  const ToolkitOverview = () => (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center">
          <span className="mr-3">🛠️</span>
          Teachers Toolkit
          <span className="ml-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm px-3 py-1 rounded-full">PRO</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Professional teaching tools designed to enhance your classroom experience and streamline your daily activities.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {toolCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-md transition-all flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <span>{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Development Notice */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
        <h3 className="text-xl font-bold text-blue-800 mb-2">🚀 More Tools Coming Soon!</h3>
        <p className="text-blue-700 mb-4">
          We're actively developing new tools based on teacher feedback. Have an idea for a tool you'd love to see?
        </p>
        <button
          onClick={() => showToast && showToast('Feature requests coming soon! Keep an eye out for updates.')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          💡 Suggest a Tool
        </button>
      </div>
    </div>
  );

  // Selected Tool View
  const SelectedToolView = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedTool(null)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <span>←</span>
          <span>Back to Toolkit</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">{selectedTool.icon}</span>
          {selectedTool.name}
        </h2>
      </div>
      
      {/* Tool content will be rendered here */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">{selectedTool.icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{selectedTool.name}</h3>
        <p className="text-gray-600 mb-6">{selectedTool.description}</p>
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 font-semibold">
            🏗️ This tool is being prepared for launch. Check back soon!
          </p>
        </div>
      </div>
    </div>
  );

  // Main Render
  if (!hasPROAccess) {
    return <PROAccessCheck />;
  }

  return (
    <div className="animate-fade-in">
      {selectedTool ? (
        <SelectedToolView />
      ) : (
        <ToolkitOverview />
      )}
    </div>
  );
};

export default TeachersToolkitTab;