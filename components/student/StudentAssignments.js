import React, { useState, useEffect } from 'react';
import TopicContentView from '../curriculum/new/TopicContentView';
import { getTopicData } from '../../utils/curriculumData';

const StudentAssignments = ({ assignedTopics = [], onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [hydratedTopics, setHydratedTopics] = useState([]);

    useEffect(() => {
        // Hydrate the simple stored topic objects into full topic data objects
        // so that TopicContentView can render them
        if (assignedTopics && assignedTopics.length > 0) {
            const filledTopics = assignedTopics.map(topicBase => {
                const fullData = getTopicData(topicBase.subjectId, topicBase.domainId, topicBase.id);
                if (fullData) {
                    return fullData;
                }
                return null;
            }).filter(Boolean);

            setHydratedTopics(filledTopics);
        } else {
            setHydratedTopics([]);
        }
    }, [assignedTopics]);

    // If a topic is selected, render its content natively
    if (selectedTopic) {
        return (
            <TopicContentView
                topic={selectedTopic}
                onBack={() => setSelectedTopic(null)}
                isStudentView={true}
                subjectId={selectedTopic.subjectId}
            />
        );
    }

    if (hydratedTopics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
                <span className="text-6xl mb-4">🌟</span>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">No Assigned Topics</h3>
                <p className="text-slate-500 text-center max-w-md">
                    Your teacher hasn't assigned any special topics yet. Check back later!
                </p>
            </div>
        );
    }

    // Grid of assigned topics
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl shadow-md p-8 flex items-center justify-between border-t-4 border-t-indigo-500 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4">
                        <span className="text-5xl bg-indigo-100 p-4 rounded-2xl shadow-inner">📝</span>
                        <div>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Your Assignments</h2>
                            <p className="text-slate-500 text-lg mt-1 font-medium">Explore the topics your teacher picked for you.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                {hydratedTopics.map((topic, index) => {
                    // Match a color to the subject
                    let ringColor = 'ring-indigo-500';
                    let bgHover = 'hover:bg-indigo-50';
                    if (topic.subjectId === 'mathematics') { ringColor = 'ring-emerald-500'; bgHover = 'hover:bg-emerald-50'; }
                    if (topic.subjectId === 'science') { ringColor = 'ring-violet-500'; bgHover = 'hover:bg-violet-50'; }
                    if (topic.subjectId === 'hass') { ringColor = 'ring-amber-500'; bgHover = 'hover:bg-amber-50'; }

                    return (
                        <button
                            key={`${topic.subjectId}-${topic.id}-${index}`}
                            onClick={() => setSelectedTopic(topic)}
                            className={`bg-white rounded-3xl p-6 text-left relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ring-1 ring-slate-200 hover:ring-2 ${ringColor} ${bgHover}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-5xl drop-shadow-sm">{topic.icon || '📚'}</span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">{topic.name}</h3>
                            <p className="text-sm font-semibold text-slate-400 mb-4">{topic.domainName || topic.subjectId}</p>

                            <div className="flex items-center text-sm font-bold text-indigo-600">
                                <span>Open Topic</span>
                                <span className="ml-1 text-lg">→</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default StudentAssignments;
