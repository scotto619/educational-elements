// components/student/StudentWriting.js - Visual Writing Prompts for Students
import React, { useState } from 'react';
import VisualWritingPrompts from '../curriculum/literacy/VisualWritingPrompts';

const StudentWriting = ({ 
  studentData, 
  classData, 
  showToast 
}) => {
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-4 md:p-6 mb-6 text-white text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">✍️ Visual Writing Prompts</h1>
        <p className="text-sm md:text-base opacity-90">
          Let your creativity flow with inspiring images and word banks!
        </p>
      </div>

      {/* Visual Writing Prompts Component */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
        <VisualWritingPrompts 
          showToast={showToast}
          students={[]}
        />
      </div>
    </div>
  );
};

export default StudentWriting;