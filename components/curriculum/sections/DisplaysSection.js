// components/curriculum/sections/DisplaysSection.js
// Lazy-loaded Displays section for Curriculum Corner
import React, { useState } from 'react';

// Import displays component
import DisplaysGallery from '../general/DisplaysGallery';

const DisplaysSection = ({ onBack, showToast, students, subjectFilter }) => {
    return (
        <DisplaysGallery showToast={showToast} students={students} subjectFilter={subjectFilter} />
    );
};

export default DisplaysSection;
