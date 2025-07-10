// TeachersToolkitTab.js - Updated with Interactive Teaching Tools
import React, { useState } from 'react';
import StudentHelpQueue from '../StudentHelpQueue';
import HundredsBoard from '../HundredsBoard';
import GroupMaker from '../GroupMaker';

const TeachersToolkitTab = ({ 
  students, 
  showToast,
  userData,
  saveGroupDataToFirebase,
  currentClassId
}) => {
  const [activeToolkitTab, setActiveToolkitTab] = useState('help-queue');

  // Check if user has PRO access
  if (userData?.subscription !== 'pro') {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🛠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Teachers Toolkit</h2>
        <p className="text-gray-600 mb-6">
          The Teachers Toolkit is a PRO feature that includes interactive teaching tools to enhance your classroom experience.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
          <p className="text-yellow-700 font-semibold mb-3">🌟 PRO Teaching Tools Include:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-600 text-sm">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>🎫</span>
                <span>Student Help Queue System</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔢</span>
                <span>Interactive Number Board</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>👥</span>
                <span>Smart Group Maker with Constraints</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Name Picker Wheel</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏰</span>
                <span>Classroom Timer Tools</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📊</span>
                <span>Interactive Polling</span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={() => window.open('/pricing', '_blank')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          Upgrade to PRO
        </button>
      </div>
    );
  }

  const toolkitTabs = [
    { 
      id: 'help-queue', 
      label: 'Help Queue', 
      icon: '🎫',
      description: 'Manage student assistance requests'
    },
    { 
      id: 'number-board', 
      label: 'Number Board', 
      icon: '🔢',
      description: 'Interactive mathematics tool'
    },
    { 
      id: 'group-maker', 
      label: 'Group Maker', 
      icon: '👥',
      description: 'Create and manage student groups'
    },
    { 
      id: 'name-picker', 
      label: 'Name Picker', 
      icon: '🎯',
      description: 'Random student selector',
      comingSoon: true
    },
    { 
      id: 'timer-tools', 
      label: 'Timer Tools', 
      icon: '⏰',
      description: 'Classroom timing utilities',
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🛠️ Teachers Toolkit</h2>
        <p className="text-gray-600">Interactive teaching tools to enhance your classroom experience</p>
      </div>

      {/* Toolkit Navigation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolkitTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.comingSoon && setActiveToolkitTab(tab.id)}
              disabled={tab.comingSoon}
              className={`p-4 rounded-lg transition-all duration-300 text-left relative ${
                tab.comingSoon
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : activeToolkitTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-102"
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{tab.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg">{tab.label}</h3>
                    {tab.comingSoon && (
                      <span className="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                        Soon
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${
                    activeToolkitTab === tab.id ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </p>
                </div>
              </div>
              {activeToolkitTab === tab.id && !tab.comingSoon && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tool Content */}
      <div className="bg-gray-50 rounded-xl p-6 min-h-[600px]">
        {activeToolkitTab === 'help-queue' && (
          <div className="animate-fade-in">
            <StudentHelpQueue students={students} showToast={showToast} />
          </div>
        )}

        {activeToolkitTab === 'number-board' && (
          <div className="animate-fade-in">
            <HundredsBoard showToast={showToast} />
          </div>
        )}

        {activeToolkitTab === 'group-maker' && (
          <div className="animate-fade-in">
            <GroupMaker 
              students={students} 
              showToast={showToast} 
              saveGroupDataToFirebase={saveGroupDataToFirebase}
              userData={userData}
              currentClassId={currentClassId}
            />
          </div>
        )}

        {activeToolkitTab === 'name-picker' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Name Picker</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Randomly select students for questions, activities, or presentations. Coming soon!
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-green-700 text-sm">
                Features will include weighted selection, exclusion lists, and spinning wheel animation.
              </p>
            </div>
          </div>
        )}

        {activeToolkitTab === 'timer-tools' && (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Timer Tools</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Customizable timers for activities, transitions, and classroom management. Coming soon!
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-orange-700 text-sm">
                Includes countdown timers, stopwatches, and interval timers with sound alerts.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pro Features Notice */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
        <div className="text-center">
          <h3 className="text-lg font-bold text-purple-800 mb-2">🌟 Exclusive PRO Teaching Tools</h3>
          <p className="text-purple-700 text-sm">
            These interactive tools are designed to make classroom management easier and learning more engaging. 
            More tools are being added regularly based on teacher feedback!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default TeachersToolkitTab;