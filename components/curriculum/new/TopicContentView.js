import React, { useState } from 'react';
import ResourceViewer from './ResourceViewer';
import NounSortingGame from '../../games/NounSortingGame';
import NounDetectiveGame from '../../games/NounDetectiveGame';
import NounPopGame from '../../games/NounPopGame';
import VerbActionRace from '../../games/VerbActionRace';
import VerbSortingGame from '../../games/VerbSortingGame';
import VerbTenseTimeMachine from '../../games/VerbTenseTimeMachine';
import AdjectiveDetectiveGame from '../../games/AdjectiveDetectiveGame';
import AdjectiveSortingGame from '../../games/AdjectiveSortingGame';
import AdjectiveOppositesGame from '../../games/AdjectiveOppositesGame';
import AdverbAsteroidsGame from '../../games/AdverbAsteroidsGame';
import AdverbSortingGame from '../../games/AdverbSortingGame';
import AdverbActionBuilder from '../../games/AdverbActionBuilder';
import PronounReplacementRace from '../../games/PronounReplacementRace';
import PronounTypeMatch from '../../games/PronounTypeMatch';
import PronounRescueMission from '../../games/PronounRescueMission';
import PrepositionNinja from '../../games/PrepositionNinja';
import PrepositionLocationGame from '../../games/PrepositionLocationGame';
import PrepositionPhraseBuilder from '../../games/PrepositionPhraseBuilder';
import ConjunctionConductor from '../../games/ConjunctionConductor';
import ConjunctionBridgeBuilder from '../../games/ConjunctionBridgeBuilder';
import ConjunctionSort from '../../games/ConjunctionSort';
import InterjectionEmotionMatch from '../../games/InterjectionEmotionMatch';
import InterjectionPopGame from '../../games/InterjectionPopGame';
import InterjectionComicStrip from '../../games/InterjectionComicStrip';

// Map game string identifiers to their actual components
const COMPONENTS = {
    NounSortingGame,
    NounDetectiveGame,
    NounPopGame,
    VerbActionRace,
    VerbSortingGame,
    VerbTenseTimeMachine,
    AdjectiveDetectiveGame,
    AdjectiveSortingGame,
    AdjectiveOppositesGame,
    AdverbAsteroidsGame,
    AdverbSortingGame,
    AdverbActionBuilder,
    PronounReplacementRace,
    PronounTypeMatch,
    PronounRescueMission,
    PrepositionNinja,
    PrepositionLocationGame,
    PrepositionPhraseBuilder,
    ConjunctionConductor,
    ConjunctionBridgeBuilder,
    ConjunctionSort,
    InterjectionEmotionMatch,
    InterjectionPopGame,
    InterjectionComicStrip
};

const TopicContentView = ({ topic, subjectId, onBack, onToggleAssign, assignedTopics = [], isStudentView = false }) => {
    const isAssigned = React.useMemo(() => {
        return assignedTopics.some(
            t => t.id === topic.id && t.domainId === topic.domainId && t.subjectId === subjectId
        );
    }, [assignedTopics, topic, subjectId]);

    const handleAssignClick = () => {
        if (onToggleAssign) {
            onToggleAssign({ ...topic, subjectId, domainId: topic.domainId });
        }
    };

    const [activeCategoryId, setActiveCategoryId] = useState(
        topic.categories && topic.categories.length > 0 ? topic.categories[0].id : null
    );

    // Determine the active subtopics list (either from selected category or from topic direct subtopics)
    const activeSubtopics = topic.categories
        ? topic.categories.find(c => c.id === activeCategoryId)?.subtopics
        : topic.subtopics;

    const [activeSubtopicId, setActiveSubtopicId] = useState(
        activeSubtopics && activeSubtopics.length > 0 ? activeSubtopics[0].id : null
    );

    // Reset subtopic when category changes
    React.useEffect(() => {
        if (activeSubtopics && activeSubtopics.length > 0) {
            // Check if current activeSubtopicId is in the new list, if not replace it
            if (!activeSubtopics.find(s => s.id === activeSubtopicId)) {
                setActiveSubtopicId(activeSubtopics[0].id);
            }
        } else {
            setActiveSubtopicId(null);
        }
    }, [activeCategoryId, activeSubtopics, activeSubtopicId]);

    const [activeTab, setActiveTab] = useState('display');
    const [viewingResource, setViewingResource] = useState(null);

    const tabs = [
        { id: 'display', label: 'DISPLAY', icon: '🖼️', description: 'Printable displays and posters' },
        { id: 'learn', label: 'LEARN', icon: '📖', description: 'Resources and guides for teaching' },
        { id: 'practice', label: 'PRACTICE', icon: '✍️', description: 'Interactive tools and student activities' }
    ];

    // Helper to get current resources based on active tab and subtopic
    const currentSubtopic = activeSubtopics?.find(s => s.id === activeSubtopicId);

    let currentResources = [];
    if (currentSubtopic && currentSubtopic.resources && currentSubtopic.resources[activeTab]) {
        currentResources = currentSubtopic.resources[activeTab];
    }

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
                {!isStudentView && onToggleAssign && (
                    <button
                        onClick={handleAssignClick}
                        className={`px-6 py-3 rounded-xl font-bold tracking-wide transition-all duration-300 shadow-sm flex items-center gap-2 ${isAssigned
                            ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 hover:bg-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                            }`}
                    >
                        {isAssigned ? (
                            <>
                                <span>ASSIGNED</span>
                                <span className="text-lg">✓</span>
                            </>
                        ) : (
                            <>
                                <span>ASSIGN TO STUDENTS</span>
                                <span className="text-lg">➕</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Categories Menu (if they exist) */}
            {topic.categories && topic.categories.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 md:p-4 mb-2">
                    <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-4 snap-x hide-scrollbar">
                        {topic.categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategoryId(category.id)}
                                className={`whitespace-nowrap flex-1 px-8 py-4 rounded-xl font-black text-lg transition-all snap-center border-b-4 ${activeCategoryId === category.id
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-600 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-slate-50'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Subtopic Pill Menu (Only shown if subtopics exist) */}
            {activeSubtopics && activeSubtopics.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    <div className="flex overflow-x-auto pb-2 gap-3 snap-x hide-scrollbar">
                        {activeSubtopics.map(subtopic => (
                            <button
                                key={subtopic.id}
                                onClick={() => setActiveSubtopicId(subtopic.id)}
                                className={`whitespace-nowrap flex-shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all snap-center shadow-sm border ${activeSubtopicId === subtopic.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                {subtopic.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
            <div className="bg-slate-50 rounded-3xl shadow-inner border border-slate-200 min-h-[400px] p-8 relative overflow-hidden">

                {/* If we have resources, display them in a grid */}
                {currentResources && currentResources.length > 0 ? (
                    <div className="space-y-12">
                        {/* Featured Resources Section */}
                        {currentResources.filter(r => !r.extra).length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold tracking-wide text-slate-800 border-b border-slate-300 pb-2 mb-6">FEATURED RESOURCES</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentResources.filter(r => !r.extra).map((resource, index) => {
                                        if (resource.type === 'game') {
                                            return (
                                                <div
                                                    key={`featured-game-${index}`}
                                                    onClick={() => setViewingResource(resource)}
                                                    className="relative group cursor-pointer h-[276px] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-[3px] border-transparent hover:border-indigo-300 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 flex flex-col items-center justify-center transform hover:-translate-y-1"
                                                >
                                                    {/* Background pattern */}
                                                    <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                                                    <div className="relative z-10 flex flex-col items-center justify-center h-full w-full bg-white/10 backdrop-blur-sm p-6 transition-colors group-hover:bg-white/20">
                                                        {/* Icon */}
                                                        <div className="w-[72px] h-[72px] bg-white shadow-xl rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                                            <span className="text-4xl translate-x-[2px]">🎮</span>
                                                        </div>

                                                        {/* Title */}
                                                        <h4 className="text-xl font-black text-white text-center tracking-wide drop-shadow-md mb-4 line-clamp-2 leading-tight">
                                                            {resource.title}
                                                        </h4>

                                                        {/* Play Button */}
                                                        <div className="mt-auto flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 rounded-full font-black text-sm shadow-lg group-hover:bg-indigo-50 group-hover:shadow-indigo-500/30 transition-all border border-indigo-100">
                                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                            <span className="tracking-wider">PLAY</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={`featured-${index}`}
                                                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer flex flex-col"
                                                onClick={() => setViewingResource(resource)}
                                            >
                                                {/* Resource Thumbnail Preview */}
                                                <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                                    {resource.type === 'image' && (
                                                        <img src={resource.src} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    )}
                                                    {resource.thumbnail && (
                                                        <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    )}
                                                    {resource.type === 'pdf' && !resource.thumbnail && (
                                                        <div className="text-rose-500 group-hover:scale-110 transition-transform duration-500">
                                                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                    {resource.type === 'pptx' && !resource.thumbnail && (
                                                        <div className="text-orange-500 group-hover:scale-110 transition-transform duration-500">
                                                            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                                        </div>
                                                    )}

                                                    {/* Featured Badge Overlay */}
                                                    <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-black tracking-wider px-2 py-1 rounded-md shadow-sm z-20 flex items-center gap-1">
                                                        <span className="text-base">⭐</span> FEATURED
                                                    </div>

                                                    {/* View Overlay */}
                                                    <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-30">
                                                        <span className="text-white font-bold tracking-widest flex items-center gap-2">
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            VIEW RESOURCE
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Resource Details */}
                                                <div className="p-5 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug">{resource.title}</h4>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
                                                            {resource.type === 'pdf' && resource.pptxSrc ? 'PDF & PPTX' : resource.type}
                                                        </span>
                                                        <span className="text-indigo-600 bg-indigo-50 rounded-full p-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Extra Resources Section */}
                        {currentResources.filter(r => r.extra).length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold tracking-wide text-slate-500 border-b border-slate-300 pb-2 mb-6">EXTRA RESOURCES</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {currentResources.filter(r => r.extra).map((resource, index) => {
                                        return (
                                            <div
                                                key={`extra-${index}`}
                                                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col"
                                                onClick={() => setViewingResource(resource)}
                                            >
                                                {/* Smaller Thumbnail */}
                                                <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                                    {resource.type === 'image' && (
                                                        <img src={resource.src} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    )}
                                                    {resource.thumbnail && (
                                                        <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    )}
                                                    {resource.type === 'pdf' && !resource.thumbnail && (
                                                        <div className="text-slate-400 group-hover:scale-110 transition-transform duration-500">
                                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                        </div>
                                                    )}
                                                    {resource.type === 'pptx' && !resource.thumbnail && (
                                                        <div className="text-slate-400 group-hover:scale-110 transition-transform duration-500">
                                                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                                        </div>
                                                    )}

                                                    {/* View Overlay */}
                                                    <div className="absolute inset-0 bg-slate-800/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-30">
                                                        <span className="text-white font-bold text-sm tracking-widest flex items-center gap-1">
                                                            VIEW
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Resource Details */}
                                                <div className="p-3 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-700 text-sm line-clamp-2 leading-tight">{resource.title}</h4>
                                                    </div>
                                                    <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                        {resource.type === 'pdf' && resource.pptxSrc ? 'PDF & PPTX' : resource.type}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Placeholder Content if no resources exist */
                    <div className="flex flex-col items-center justify-center text-center h-full space-y-4 py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-4 shadow-inner">
                            <span className="text-4xl">
                                {tabs.find(t => t.id === activeTab)?.icon}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                            {currentSubtopic ? currentSubtopic.name : topic.name} - {tabs.find(t => t.id === activeTab)?.label}
                        </h3>
                        <p className="text-slate-500 max-w-md mx-auto text-lg">
                            Content for this section is currently being curated. Check back soon for high-quality {activeTab} materials!
                        </p>
                    </div>
                )}
            </div>

            {/* Resource Viewer Modal or Game Component */}
            {viewingResource && viewingResource.type !== 'game' && (
                <ResourceViewer
                    resource={viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}

            {/* Dynamic Game Rendering */}
            {viewingResource && viewingResource.type === 'game' && (
                (() => {
                    // Try to resolve by src first (the newer method)
                    let GameComponent = COMPONENTS[viewingResource.src];

                    // Fallback to componentId mapping for older Noun/Verb/Adjective games
                    if (!GameComponent && viewingResource.componentId) {
                        const legacyMap = {
                            'noun_sorting': COMPONENTS.NounSortingGame,
                            'noun_detective': COMPONENTS.NounDetectiveGame,
                            'noun_pop': COMPONENTS.NounPopGame,
                            'verb_race': COMPONENTS.VerbActionRace,
                            'verb_sorting': COMPONENTS.VerbSortingGame,
                            'verb_time_machine': COMPONENTS.VerbTenseTimeMachine,
                            'adjective_detective': COMPONENTS.AdjectiveDetectiveGame,
                            'adjective_sorting': COMPONENTS.AdjectiveSortingGame,
                            'adjective_opposites': COMPONENTS.AdjectiveOppositesGame
                        };
                        GameComponent = legacyMap[viewingResource.componentId];
                    }

                    if (GameComponent) {
                        return <GameComponent onClose={() => setViewingResource(null)} />;
                    }

                    return (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h3>
                                <p className="text-slate-600 mb-6">This game is not yet fully connected.</p>
                                <button onClick={() => setViewingResource(null)} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Go Back</button>
                            </div>
                        </div>
                    );
                })()
            )}
        </div>
    );
};

export default TopicContentView;
