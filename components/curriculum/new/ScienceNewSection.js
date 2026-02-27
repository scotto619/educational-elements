import React, { useState } from 'react';
import TopicContentView from './TopicContentView';

// Data Structure for Science Topics
const scienceDomains = [
    {
        id: 'physical_sciences',
        name: '1. Physical Sciences (Physics)',
        icon: '🔬',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        topics: [
            { id: 'forces_motion', name: 'Forces & Motion', icon: '⚡', domain: 'Physical Sciences' },
            { id: 'energy', name: 'Energy', icon: '🔊', domain: 'Physical Sciences' },
            { id: 'light', name: 'Light', icon: '💡', domain: 'Physical Sciences' },
            { id: 'sound', name: 'Sound', icon: '🔉', domain: 'Physical Sciences' },
            { id: 'heat_temp', name: 'Heat & Temperature', icon: '🌡', domain: 'Physical Sciences' },
            { id: 'electricity', name: 'Electricity', icon: '⚙', domain: 'Physical Sciences' }
        ]
    },
    {
        id: 'earth_space',
        name: '2. Earth & Space Sciences',
        icon: '🌍',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        topics: [
            { id: 'earth_materials', name: 'Earth Materials', icon: '🌎', domain: 'Earth & Space Sciences' },
            { id: 'weather_climate', name: 'Weather & Climate', icon: '🌦', domain: 'Earth & Space Sciences' },
            { id: 'water_earth', name: 'Water on Earth', icon: '🌊', domain: 'Earth & Space Sciences' },
            { id: 'earth_systems', name: 'Earth Systems', icon: '🌏', domain: 'Earth & Space Sciences' },
            { id: 'space', name: 'Space', icon: '🚀', domain: 'Earth & Space Sciences' }
        ]
    },
    {
        id: 'biological_sciences',
        name: '3. Biological Sciences (Life Science)',
        icon: '🌱',
        color: 'bg-green-50 border-green-200 text-green-900',
        topics: [
            { id: 'plants', name: 'Plants', icon: '🌿', domain: 'Biological Sciences' },
            { id: 'animals', name: 'Animals', icon: '🐾', domain: 'Biological Sciences' },
            { id: 'human_biology', name: 'Human Biology', icon: '👩‍⚕️', domain: 'Biological Sciences' },
            { id: 'ecosystems', name: 'Ecosystems', icon: '🌏', domain: 'Biological Sciences' },
            { id: 'adaptations', name: 'Adaptations', icon: '🧬', domain: 'Biological Sciences' }
        ]
    },
    {
        id: 'chemical_sciences',
        name: '4. Chemical Sciences (Chemistry)',
        icon: '🧪',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        topics: [
            { id: 'matter', name: 'Matter', icon: '🧱', domain: 'Chemical Sciences' },
            { id: 'materials', name: 'Materials', icon: '🧴', domain: 'Chemical Sciences' },
            { id: 'changes_materials', name: 'Changes in Materials', icon: '🔄', domain: 'Chemical Sciences' }
        ]
    },
    {
        id: 'inquiry_skills',
        name: '5. Scientific Inquiry Skills (Process Skills)',
        icon: '🔎',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        topics: [
            { id: 'investigating', name: 'Investigating', icon: '🔬', domain: 'Scientific Inquiry Skills' },
            { id: 'observing_measuring', name: 'Observing & Measuring', icon: '📏', domain: 'Scientific Inquiry Skills' },
            { id: 'analysing', name: 'Analysing', icon: '📊', domain: 'Scientific Inquiry Skills' },
            { id: 'communicating_science', name: 'Communicating Science', icon: '🗣', domain: 'Scientific Inquiry Skills' }
        ]
    },
    {
        id: 'stem_technology',
        name: '6. STEM & Technology Links',
        icon: '🤖',
        color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
        topics: [
            { id: 'engineering_concepts', name: 'Engineering Concepts', icon: '🏗', domain: 'STEM & Technology' },
            { id: 'digital_science_skills', name: 'Digital Science Skills', icon: '💻', domain: 'STEM & Technology' },
            { id: 'sustainability', name: 'Sustainability & Environmental Science', icon: '♻', domain: 'STEM & Technology' }
        ]
    },
    {
        id: 'cross_curriculum',
        name: '7. Cross-Curriculum / Real-World Science',
        icon: '🧠',
        color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
        topics: [
            { id: 'health_science', name: 'Health Science', icon: '🍎', domain: 'Cross-Curriculum' },
            { id: 'environmental_awareness', name: 'Environmental Awareness', icon: '🌲', domain: 'Cross-Curriculum' },
            { id: 'indigenous_science', name: 'Indigenous Science Perspectives', icon: '🪃', domain: 'Cross-Curriculum' }
        ]
    }
];

const ScienceNewSection = ({ onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);

    // If a topic is selected, render the TopicContentView
    if (selectedTopic) {
        return <TopicContentView topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }

    // Otherwise render the domain layout
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-4 border-t-violet-500 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
                    <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" /></svg>
                </div>
                <div>
                    <button
                        onClick={onBack}
                        className="text-slate-400 hover:text-violet-600 mb-2 flex items-center gap-1 text-sm font-semibold transition-colors"
                    >
                        ← Back to Hub
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl bg-violet-100 p-4 rounded-2xl shadow-inner">🔬</span>
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Science Framework</h2>
                            <p className="text-slate-500 text-lg mt-1 font-medium">Select a domain and topic to explore</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout for Domains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {scienceDomains.map((domain, index) => (
                    <div
                        key={domain.id}
                        className={`rounded-3xl border shadow-sm hover:shadow-xl transition-shadow bg-white overflow-hidden flex flex-col h-full animate-in slide-in-from-bottom-4`}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Domain Header */}
                        <div className={`p-6 border-b ${domain.color} flex items-center gap-4`}>
                            <span className="text-4xl bg-white p-3 rounded-xl shadow-sm">{domain.icon}</span>
                            <h3 className="text-xl font-bold">{domain.name}</h3>
                        </div>

                        {/* Topics Grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow bg-slate-50/50">
                            {domain.topics.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all group flex items-start gap-4 text-left"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-violet-700 transition-colors line-clamp-2 leading-tight">
                                            {topic.name}
                                        </h4>
                                        <span className="text-xs text-slate-400 mt-1 block group-hover:text-violet-500 font-medium">Explore →</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScienceNewSection;
