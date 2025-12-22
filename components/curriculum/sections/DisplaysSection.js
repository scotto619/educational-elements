// components/curriculum/sections/DisplaysSection.js
// Lazy-loaded Displays section for Curriculum Corner
import React, { useState } from 'react';

// Import displays component
import DisplaysGallery from '../general/DisplaysGallery';

const DisplaysSection = ({ onBack, showToast, students }) => {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-2xl">🖼️</span> Classroom Displays
                </h2>
                <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back to Subjects</button>
            </div>
            <DisplaysGallery showToast={showToast} students={students} />
        </div>
    );
};

export default DisplaysSection;
