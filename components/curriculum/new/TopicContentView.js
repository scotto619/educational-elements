import React, { useState } from 'react';

const TopicContentView = ({ topic, onBack }) => {
    const [activeTab, setActiveTab] = useState('display');

    const tabs = [
        { id: 'display', label: 'DISPLAY', icon: '🖼️', description: 'Printable displays and posters' },
        { id: 'learn', label: 'LEARN', icon: '📖', description: 'Resources and guides for teaching' },
        { id: 'practice', label: 'PRACTICE', icon: '✍️', description: 'Interactive tools and student activities' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-100">
                <div>
                    <button
                        onClick={onBack}
                        className="text-slate-400 hover:text-indigo-600 mb-2 flex items-center gap-1 text-sm font-semibold transition-colors"
                    >
                        ← Back to Topics
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{topic.icon}</span>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">{topic.name}</h2>
                            <p className="text-slate-500">{topic.domain}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3-Pillar Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 relative overflow-hidden flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-indigo-700 shadow-inner'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></span>
                            )}
                            <span className="text-2xl">{tab.icon}</span>
                            <div className="text-left hidden md:block">
                                <div className="font-bold tracking-wide">{tab.label}</div>
                                <div className={`text-xs ${activeTab === tab.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                                    {tab.description}
                                </div>
                            </div>
                            <div className="font-bold tracking-wide md:hidden">{tab.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 min-h-[400px] p-8 relative overflow-hidden">
                {/* Placeholder Content for now */}
                <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-16">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">
                            {tabs.find(t => t.id === activeTab)?.icon}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">
                        {topic.name} - {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Content for this section is currently being curated. Check back soon for high-quality {activeTab} materials!
                    </p>

                    <button className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <span>Request Resource</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopicContentView;
