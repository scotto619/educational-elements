// components/student/StudentLiteracy.js - Literacy Hub with Reading, Spelling, and Writing sub-tabs
import React, { useState } from 'react';
import StudentReading from './StudentReading';
import StudentSpelling from './StudentSpelling';
import StudentWriting from './StudentWriting';

const StudentLiteracy = ({ 
  studentData, 
  classData, 
  showToast,
  updateStudentData 
}) => {
  const [activeSubTab, setActiveSubTab] = useState('reading');

  const subTabs = [
    { id: 'reading', name: 'Reading', icon: '📖', color: 'from-blue-500 to-blue-600' },
    { id: 'spelling', name: 'Spelling', icon: '📝', color: 'from-green-500 to-green-600' },
    { id: 'writing', name: 'Writing', icon: '✍️', color: 'from-purple-500 to-pink-600' }
  ];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'reading':
        return (
          <StudentReading 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
          />
        );
      case 'spelling':
        return (
          <StudentSpelling 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
          />
        );
      case 'writing':
        return (
          <StudentWriting 
            studentData={studentData}
            classData={classData}
            showToast={showToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-2 md:p-4">
        <div className="grid grid-cols-3 gap-2 md:gap-4">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex flex-col items-center justify-center 
                p-3 md:p-4 rounded-lg 
                font-semibold text-xs md:text-base
                transition-all duration-200
                ${activeSubTab === tab.id 
                  ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span className="text-2xl md:text-3xl mb-1">{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tab Content */}
      <div>
        {renderSubTabContent()}
      </div>
    </div>
  );
};

export default StudentLiteracy;