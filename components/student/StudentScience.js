import React from 'react';
import SolarSystemExplorer from '../curriculum/science/SolarSystemExplorer';

const StudentScience = () => (
  <div className="space-y-4">
    <div className="bg-white shadow-md rounded-2xl p-4 md:p-6 border border-blue-100">
      <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Science Lab</p>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Solar System Explorer</h2>
      <p className="text-gray-600 text-sm md:text-base">
        Launch the interactive model to watch each planet orbit the sun. Click a world to pause its path, explore
        quick facts, and compare how fast every orbit is in this classroom-friendly space tour.
      </p>
    </div>

    <div className="shadow-2xl rounded-3xl overflow-hidden border border-slate-800/40 bg-slate-900">
      <SolarSystemExplorer />
    </div>
  </div>
);

export default StudentScience;
