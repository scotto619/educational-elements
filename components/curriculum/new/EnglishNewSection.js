import React, { useState } from 'react';
import TopicContentView from './TopicContentView';

// Data Structure for English Topics
const englishDomains = [
    {
        id: 'how_english_works',
        name: '1. Language (How English Works)',
        icon: '📚',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        topics: [
            {
                id: 'grammar',
                name: 'Grammar',
                icon: '🔤',
                domain: 'Language (How English Works)',
                categories: [
                    {
                        id: 'parts_of_speech',
                        name: 'Parts of Speech',
                        subtopics: [
                            {
                                id: 'nouns',
                                name: 'Nouns',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Noun Kingdom Display', src: '/curriculum/new literacy/Grammar/Nouns/Displays/Nouns.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Noun Kingdom Guide', src: '/curriculum/new literacy/Grammar/Nouns/Learning/Noun_Kingdom.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Nouns/Learning/Noun_Kingdom.pptx', thumbnail: '/curriculum/new literacy/Grammar/Nouns/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', componentId: 'noun_sorting', title: 'Noun Master Challenge', thumbnail: '/curriculum/new literacy/Grammar/Nouns/Displays/Nouns.png' },
                                        { type: 'game', componentId: 'noun_detective', title: 'Noun Detective Case', thumbnail: '/curriculum/new literacy/Grammar/Nouns/Displays/Nouns.png' },
                                        { type: 'game', componentId: 'noun_pop', title: 'Balloon Pop Nouns', thumbnail: '/curriculum/new literacy/Grammar/Nouns/Displays/Nouns.png' }
                                    ]
                                }
                            },
                            {
                                id: 'verbs',
                                name: 'Verbs',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Verbs Display', src: '/curriculum/new literacy/Grammar/Verbs/Display/Verbs.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Verbs Guide', src: '/curriculum/new literacy/Grammar/Verbs/Learning/Verbs.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Verbs/Learning/Verbs.pptx', thumbnail: '/curriculum/new literacy/Grammar/Verbs/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', componentId: 'verb_race', title: 'Verb Action Race', thumbnail: '/curriculum/new literacy/Grammar/Verbs/Display/Verbs.png' },
                                        { type: 'game', componentId: 'verb_sorting', title: 'Verb Master Challenge', thumbnail: '/curriculum/new literacy/Grammar/Verbs/Display/Verbs.png' },
                                        { type: 'game', componentId: 'verb_time_machine', title: 'Verb Time Machine', thumbnail: '/curriculum/new literacy/Grammar/Verbs/Display/Verbs.png' }
                                    ]
                                }
                            },
                            {
                                id: 'adjectives',
                                name: 'Adjectives',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Adjectives Display', src: '/curriculum/new literacy/Grammar/Adjectives/Display/Adjectives.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Adjectives Guide', src: '/curriculum/new literacy/Grammar/Adjectives/Learning/Adjectives.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Adjectives/Learning/Adjectives.pptx', thumbnail: '/curriculum/new literacy/Grammar/Adjectives/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', componentId: 'adjective_detective', title: 'Adjective Detective Case', thumbnail: '/curriculum/new literacy/Grammar/Adjectives/Display/Adjectives.png' },
                                        { type: 'game', componentId: 'adjective_sorting', title: 'Adjective Master Challenge', thumbnail: '/curriculum/new literacy/Grammar/Adjectives/Display/Adjectives.png' },
                                        { type: 'game', componentId: 'adjective_opposites', title: 'Adjective Opposites Match', thumbnail: '/curriculum/new literacy/Grammar/Adjectives/Display/Adjectives.png' }
                                    ]
                                }
                            },
                            {
                                id: 'adverbs',
                                name: 'Adverbs',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Adverbs Display', src: '/curriculum/new literacy/Grammar/Adverbs/Display/Adverbs.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Adverbs Guide', src: '/curriculum/new literacy/Grammar/Adverbs/Learning/Adverbs.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Adverbs/Learning/Adverbs.pptx', thumbnail: '/curriculum/new literacy/Grammar/Adverbs/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Adverb Asteroids', src: 'AdverbAsteroidsGame' },
                                        { type: 'game', title: 'Adverb Sort', src: 'AdverbSortingGame' },
                                        { type: 'game', title: 'Action Builder', src: 'AdverbActionBuilder' }
                                    ]
                                }
                            },
                            {
                                id: 'pronouns',
                                name: 'Pronouns',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Pronouns Display', src: '/curriculum/new literacy/Grammar/Pronouns/Display/Pronouns.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Pronouns Guide', src: '/curriculum/new literacy/Grammar/Pronouns/Learning/Pronouns.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Pronouns/Learning/Pronouns.pptx', thumbnail: '/curriculum/new literacy/Grammar/Pronouns/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Pronoun Race', src: 'PronounReplacementRace' },
                                        { type: 'game', title: 'Pronoun Match', src: 'PronounTypeMatch' },
                                        { type: 'game', title: 'Rescue Mission', src: 'PronounRescueMission' }
                                    ]
                                }
                            },
                            {
                                id: 'prepositions',
                                name: 'Prepositions',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Prepositions Display', src: '/curriculum/new literacy/Grammar/Prepositions/Display/Prepositions.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Prepositions Guide', src: '/curriculum/new literacy/Grammar/Prepositions/Learning/Prepositions.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Prepositions/Learning/Prepositions.pptx', thumbnail: '/curriculum/new literacy/Grammar/Prepositions/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Preposition Ninja', src: 'PrepositionNinja' },
                                        { type: 'game', title: 'Where is the Cat?', src: 'PrepositionLocationGame' },
                                        { type: 'game', title: 'Phrase Builder', src: 'PrepositionPhraseBuilder' }
                                    ]
                                }
                            },
                            {
                                id: 'conjunctions',
                                name: 'Conjunctions',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Conjunctions Display', src: '/curriculum/new literacy/Grammar/Conjunctions/Display/Conjunctions.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Conjunctions Guide', src: '/curriculum/new literacy/Grammar/Conjunctions/Learning/Conjunctions.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Conjunctions/Learning/Conjunctions.pptx', thumbnail: '/curriculum/new literacy/Grammar/Conjunctions/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Train Conductor', src: 'ConjunctionConductor' },
                                        { type: 'game', title: 'Bridge Builder', src: 'ConjunctionBridgeBuilder' },
                                        { type: 'game', title: 'Conjunction Sort', src: 'ConjunctionSort' }
                                    ]
                                }
                            },
                            {
                                id: 'interjections',
                                name: 'Interjections',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Interjections Display', src: '/curriculum/new literacy/Grammar/Interjections/Displays/Interjections.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Interjections Guide', src: '/curriculum/new literacy/Grammar/Interjections/Learning/Interjections.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Interjections/Learning/Interjections.pptx', thumbnail: '/curriculum/new literacy/Grammar/Interjections/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Emotion Match', src: 'InterjectionEmotionMatch' },
                                        { type: 'game', title: 'Interjection Pop!', src: 'InterjectionPopGame' },
                                        { type: 'game', title: 'Comic Creator', src: 'InterjectionComicStrip' }
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        id: 'sentence_structure',
                        name: 'Sentence Structure',
                        subtopics: [
                            {
                                id: 'sentence_types',
                                name: 'Simple, compound, complex sentences',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Simple, Compound, Complex Sentences Display', src: '/curriculum/new literacy/Grammar/Simple Compound Complex Sentences/Display/SentenceTypes.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Simple, Compound, Complex Sentences Guide', src: '/curriculum/new literacy/Grammar/Simple Compound Complex Sentences/Learning/SentenceTypes.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Simple Compound Complex Sentences/Learning/SentenceTypes.pptx', thumbnail: '/curriculum/new literacy/Grammar/Simple Compound Complex Sentences/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'clauses',
                                name: 'Clauses (main/subordinate)',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Clauses Display', src: '/curriculum/new literacy/Grammar/Clauses/Display/Clauses.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Clauses Guide', src: '/curriculum/new literacy/Grammar/Clauses/Learning/Clauses.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Clauses/Learning/Clauses.pptx', thumbnail: '/curriculum/new literacy/Grammar/Clauses/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'subjects_predicates',
                                name: 'Subjects and predicates',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Subjects and Predicates Display', src: '/curriculum/new literacy/Grammar/Subject and Predicate/Display/SubjectandPredicate.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Subjects and Predicates Guide', src: '/curriculum/new literacy/Grammar/Subject and Predicate/Learning/SubjectandPredicate.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Subject and Predicate/Learning/SubjectandPredicate.pptx', thumbnail: '/curriculum/new literacy/Grammar/Subject and Predicate/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'active_passive',
                                name: 'Active vs passive voice',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Active vs Passive Voice Display', src: '/curriculum/new literacy/Grammar/Active vs Passive Voice/Display/ActiveVsPassive.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Active vs Passive Voice Guide', src: '/curriculum/new literacy/Grammar/Active vs Passive Voice/Learning/ActiveVsPassive.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Active vs Passive Voice/Learning/ActiveVsPassive.pptx', thumbnail: '/curriculum/new literacy/Grammar/Active vs Passive Voice/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'fragments_runons',
                                name: 'Sentence fragments and run-ons',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Sentence Fragments and Run-ons Display', src: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-ons/Display/FragmentsandRunons.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Sentence Fragments and Run-ons Guide', src: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-ons/Learning/SegmentsandRunons.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-ons/Learning/SegmentsandRunons.pptx', thumbnail: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-ons/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            }
                        ]
                    }
                ]
            },
            { id: 'sentence_structure', name: 'Sentence Structure', icon: '📝', domain: 'Language (How English Works)' },
            { id: 'tense', name: 'Tense', icon: '⏳', domain: 'Language (How English Works)' },
            { id: 'punctuation', name: 'Punctuation', icon: '✏️', domain: 'Language (How English Works)' },
            { id: 'spelling_word_study', name: 'Spelling & Word Study', icon: '🔠', domain: 'Language (How English Works)' },
            { id: 'vocabulary_development', name: 'Vocabulary Development', icon: '🧠', domain: 'Language (How English Works)' }
        ]
    },
    {
        id: 'understanding_texts',
        name: '2. Literature (Understanding Texts)',
        icon: '📖',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        topics: [
            { id: 'narrative_texts', name: 'Narrative Texts', icon: '📚', domain: 'Literature' },
            { id: 'poetry', name: 'Poetry', icon: '📝', domain: 'Literature' },
            { id: 'drama', name: 'Drama', icon: '🎭', domain: 'Literature' },
            { id: 'literary_appreciation', name: 'Literary Appreciation', icon: '🌍', domain: 'Literature' }
        ]
    },
    {
        id: 'using_english',
        name: '3. Literacy (Using English)',
        icon: '✍️',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        topics: [
            { id: 'writing_genres', name: 'Writing Genres', icon: '📝', domain: 'Literacy' },
            { id: 'writing_skills', name: 'Writing Skills', icon: '📊', domain: 'Literacy' },
            { id: 'reading_skills', name: 'Reading Skills', icon: '📖', domain: 'Literacy' },
            { id: 'speaking_listening', name: 'Speaking & Listening', icon: '🗣', domain: 'Literacy' }
        ]
    },
    {
        id: 'media_digital',
        name: '4. Media & Digital Literacy',
        icon: '📱',
        color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
        topics: [
            { id: 'media_texts', name: 'Media Texts', icon: '📺', domain: 'Media & Digital Literacy' },
            { id: 'critical_literacy', name: 'Critical Literacy', icon: '🔎', domain: 'Media & Digital Literacy' },
            { id: 'digital_communication', name: 'Digital Communication', icon: '💻', domain: 'Media & Digital Literacy' }
        ]
    },
    {
        id: 'text_types_genres',
        name: '5. Text Types & Genres',
        icon: '🎯',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        topics: [
            { id: 'fiction_genres', name: 'Fiction Genres', icon: '🐉', domain: 'Text Types & Genres' },
            { id: 'non_fiction_genres', name: 'Non-Fiction Genres', icon: '📰', domain: 'Text Types & Genres' },
            { id: 'functional_texts', name: 'Functional Texts', icon: '✉️', domain: 'Text Types & Genres' }
        ]
    },
    {
        id: 'language_features',
        name: '6. Language Features & Style',
        icon: '🌟',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        topics: [
            { id: 'figurative_language', name: 'Figurative Language', icon: '✨', domain: 'Language Features & Style' },
            { id: 'author_techniques', name: 'Author Techniques', icon: '🖋️', domain: 'Language Features & Style' }
        ]
    },
    {
        id: 'oral_language',
        name: '7. Oral Language Development',
        icon: '🧩',
        color: 'bg-purple-50 border-purple-200 text-purple-900',
        topics: [
            { id: 'conversation_skills', name: 'Conversation Skills', icon: '💬', domain: 'Oral Language Development' },
            { id: 'storytelling', name: 'Storytelling', icon: '🏕️', domain: 'Oral Language Development' }
        ]
    },
    {
        id: 'cross_curricular',
        name: '8. Cross-Curricular English Topics',
        icon: '🧪',
        color: 'bg-teal-50 border-teal-200 text-teal-900',
        topics: [
            { id: 'integrated_units', name: 'Integrated Units (Science/HASS)', icon: '🔗', domain: 'Cross-Curricular' }
        ]
    },
    {
        id: 'cultural_context',
        name: '9. Australian / Cultural Context Topics',
        icon: '🇦🇺',
        color: 'bg-orange-50 border-orange-200 text-orange-900',
        topics: [
            { id: 'indigenous_storytelling', name: 'Indigenous Storytelling', icon: '🪃', domain: 'Cultural Context' },
            { id: 'australian_authors', name: 'Australian Authors', icon: '🐨', domain: 'Cultural Context' }
        ]
    },
    {
        id: 'higher_level',
        name: '10. Higher-Level Literacy (Upper Primary)',
        icon: '💡',
        color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
        topics: [
            { id: 'critical_analysis', name: 'Critical Analysis', icon: '🔍', domain: 'Higher-Level Literacy' },
            { id: 'research_skills', name: 'Research Skills', icon: '📂', domain: 'Higher-Level Literacy' }
        ]
    }
];

const EnglishNewSection = ({ onBack }) => {
    const [selectedTopic, setSelectedTopic] = useState(null);

    // If a topic is selected, render the TopicContentView
    if (selectedTopic) {
        return <TopicContentView topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
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
