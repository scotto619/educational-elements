import React, { useState } from 'react';
import TopicContentView from './TopicContentView';
import { englishDomains } from '../../../utils/curriculumData';

const EnglishNewSection = ({ onBack, onToggleAssign, assignedTopics }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);

    // If a topic is selected, render the TopicContentView
    if (selectedTopic) {
        return (
            <TopicContentView
                topic={selectedTopic}
                onBack={() => setSelectedTopic(null)}
                onToggleAssign={onToggleAssign}
                assignedTopics={assignedTopics}
                subjectId="english"
            />
        );
    }

    // Otherwise render the domain layout
    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-lg p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t-4 border-t-blue-500 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
                    <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z" /></svg>
                </div>
                <div>
                    <button
                        onClick={onBack}
                        className="text-slate-400 hover:text-blue-600 mb-2 flex items-center gap-1 text-sm font-semibold transition-colors"
                    >
                        ← Back to Hub
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="text-5xl bg-blue-100 p-4 rounded-2xl shadow-inner">📚</span>
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">English Framework</h2>
                            <p className="text-slate-500 text-lg mt-1 font-medium">Select a domain and topic to explore</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout for Domains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {englishDomains.map((domain, index) => (
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
                                    className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group flex items-start gap-4 text-left"
                                >
                                    <span className="text-3xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">
                                            {topic.name}
                                        </h4>
                                        <span className="text-xs text-slate-400 mt-1 block group-hover:text-blue-500 font-medium">Explore →</span>
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

export default EnglishNewSection;
