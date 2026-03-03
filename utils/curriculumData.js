// utils/curriculumData.js

// ------------------------------------------------------------------
// ENGLISH
// ------------------------------------------------------------------
export const englishDomains = [
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
                                        { type: 'image', title: 'Noun Kingdom Display', src: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Noun Kingdom Guide', src: '/Curriculum/New Literacy/Grammar/Nouns/Learning/Noun_Kingdom.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Nouns/Learning/Noun_Kingdom.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Learning/Cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', componentId: 'noun_sorting', title: 'Noun Master Challenge', thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png' },
                                        { type: 'game', componentId: 'noun_detective', title: 'Noun Detective Case', thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png' },
                                        { type: 'game', componentId: 'noun_pop', title: 'Balloon Pop Nouns', thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png' }
                                    ]
                                }
                            },
                            {
                                id: 'verbs',
                                name: 'Verbs',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Verbs Display', src: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Verbs Guide', src: '/Curriculum/New Literacy/Grammar/Verbs/Learning/Verbs.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Verbs/Learning/Verbs.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', componentId: 'verb_race', title: 'Verb Action Race', thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png' },
                                        { type: 'game', componentId: 'verb_sorting', title: 'Verb Master Challenge', thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png' },
                                        { type: 'game', componentId: 'verb_time_machine', title: 'Verb Time Machine', thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png' }
                                    ]
                                }
                            },
                            {
                                id: 'adjectives',
                                name: 'Adjectives',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Adjectives Display', src: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Adjectives Guide', src: '/Curriculum/New Literacy/Grammar/Adjectives/Learning/Adjectives.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Adjectives/Learning/Adjectives.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', componentId: 'adjective_detective', title: 'Adjective Detective Case', thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png' },
                                        { type: 'game', componentId: 'adjective_sorting', title: 'Adjective Master Challenge', thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png' },
                                        { type: 'game', componentId: 'adjective_opposites', title: 'Adjective Opposites Match', thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png' }
                                    ]
                                }
                            },
                            {
                                id: 'adverbs',
                                name: 'Adverbs',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Adverbs Display', src: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Adverbs Guide', src: '/Curriculum/New Literacy/Grammar/Adverbs/Learning/Adverbs.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Adverbs/Learning/Adverbs.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Adverb Asteroids', src: 'AdverbAsteroidsGame', thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png' },
                                        { type: 'game', title: 'Adverb Sort', src: 'AdverbSortingGame', thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png' },
                                        { type: 'game', title: 'Action Builder', src: 'AdverbActionBuilder', thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png' }
                                    ]
                                }
                            },
                            {
                                id: 'pronouns',
                                name: 'Pronouns',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Pronouns Display', src: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Pronouns Guide', src: '/Curriculum/New Literacy/Grammar/Pronouns/Learning/Pronouns.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Pronouns/Learning/Pronouns.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Pronoun Replacement Race', src: 'PronounReplacementRace', thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png' },
                                        { type: 'game', title: 'Pronoun Type Match', src: 'PronounTypeMatch', thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png' },
                                        { type: 'game', title: 'Pronoun Rescue Mission', src: 'PronounRescueMission', thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png' }
                                    ]
                                }
                            },
                            {
                                id: 'prepositions',
                                name: 'Prepositions',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Prepositions Display', src: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Prepositions Guide', src: '/Curriculum/New Literacy/Grammar/Prepositions/Learning/Prepositions.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Prepositions/Learning/Prepositions.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Preposition Ninja', src: 'PrepositionNinja', thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png' },
                                        { type: 'game', title: 'Preposition Location Match', src: 'PrepositionLocationGame', thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png' },
                                        { type: 'game', title: 'Phrase Builder', src: 'PrepositionPhraseBuilder', thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png' }
                                    ]
                                }
                            },
                            {
                                id: 'conjunctions',
                                name: 'Conjunctions',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Conjunctions Display', src: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Conjunctions Guide', src: '/Curriculum/New Literacy/Grammar/Conjunctions/Learning/Conjunctions.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Conjunctions/Learning/Conjunctions.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Conjunction Conductor', src: 'ConjunctionConductor', thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png' },
                                        { type: 'game', title: 'Bridge Builder', src: 'ConjunctionBridgeBuilder', thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png' },
                                        { type: 'game', title: 'Conjunction Sort', src: 'ConjunctionSort', thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png' }
                                    ]
                                }
                            },
                            {
                                id: 'interjections',
                                name: 'Interjections',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Interjections Display', src: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Interjections Guide', src: '/Curriculum/New Literacy/Grammar/Interjections/Learning/Interjections.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Interjections/Learning/Interjections.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Emotion Match', src: 'InterjectionEmotionMatch', thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png' },
                                        { type: 'game', title: 'Balloon Pop Interjections', src: 'InterjectionPopGame', thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png' },
                                        { type: 'game', title: 'Interjection Comic Strip', src: 'InterjectionComicStrip', thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png' }
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
                                id: 'simple_compound_complex',
                                name: 'Simple, compound, complex sentences',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Sentence Types Display', src: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Display/SentenceTypes.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Sentence Types Guide', src: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Learning/SentenceTypes.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Learning/SentenceTypes.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'clauses',
                                name: 'Clauses (main/subordinate)',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Clauses Display', src: '/Curriculum/New Literacy/Grammar/Clauses/Display/Clauses.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Clauses Guide', src: '/Curriculum/New Literacy/Grammar/Clauses/Learning/Clauses.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Clauses/Learning/Clauses.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Clauses/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'subjects_predicates',
                                name: 'Subjects and Predicates',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Subjects and Predicates Display', src: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Display/SubjectandPredicate.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Subjects and Predicates Guide', src: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Learning/SubjectandPredicate.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Learning/SubjectandPredicate.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'active_passive_voice',
                                name: 'Active and Passive Voice',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Active vs Passive Voice Display', src: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Display/ActiveVsPassive.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Active vs Passive Voice Guide', src: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Learning/ActiveVsPassive.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Learning/ActiveVsPassive.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'fragments_run_ons',
                                name: 'Fragments and Run-Ons',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Fragments and Run-Ons Display', src: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Display/FragmentsandRunons.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Fragments and Run-Ons Guide', src: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Learning/SegmentsandRunons.pdf', pptxSrc: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Learning/SegmentsandRunons.pptx', thumbnail: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            }
                        ]
                    },
                    {
                        id: 'tense',
                        name: 'Tense',
                        subtopics: [
                            { id: 'past_present_future', name: 'Past, present, future' },
                            { id: 'irregular_verbs', name: 'Irregular verbs' },
                            { id: 'consistent_tense', name: 'Consistent tense use' }
                        ]
                    }
                ]
            },
            {
                id: 'punctuation',
                name: 'Punctuation',
                icon: '❕',
                domain: 'Language (How English Works)',
                subtopics: [
                    { id: 'capital_letters', name: 'Capital letters' },
                    { id: 'full_stops', name: 'Full stops' },
                    { id: 'question_marks', name: 'Question marks' },
                    { id: 'exclamation_marks', name: 'Exclamation marks' },
                    { id: 'commas', name: 'Commas (lists, clauses, dialogue)' },
                    { id: 'apostrophes', name: 'Apostrophes (contractions/possession)' },
                    { id: 'quotation_marks', name: 'Quotation marks' },
                    { id: 'colons_semicolons', name: 'Colons and semicolons (upper primary)' },
                    { id: 'hyphens', name: 'Hyphens' }
                ]
            },
            {
                id: 'spelling',
                name: 'Spelling & Word Study',
                icon: '📝',
                domain: 'Language (How English Works)',
                subtopics: [
                    { id: 'phonics_patterns', name: 'Phonics patterns' },
                    { id: 'digraphs_trigraphs', name: 'Digraphs/trigraphs/quadgraphs' },
                    { id: 'prefixes_suffixes', name: 'Prefixes/suffixes' },
                    { id: 'root_words', name: 'Root words' },
                    { id: 'homophones', name: 'Homophones' },
                    { id: 'silent_letters', name: 'Silent letters' },
                    { id: 'spelling_rules', name: 'Spelling rules' },
                    { id: 'high_frequency_words', name: 'High-frequency words' },
                    { id: 'morphology', name: 'Morphology' }
                ]
            },
            {
                id: 'vocabulary',
                name: 'Vocabulary Development',
                icon: '🧠',
                domain: 'Language (How English Works)',
                subtopics: [
                    { id: 'synonyms_antonyms', name: 'Synonyms and antonyms' },
                    { id: 'shades_of_meaning', name: 'Shades of meaning' },
                    { id: 'figurative_vocabulary', name: 'Figurative vocabulary' },
                    { id: 'technical_vocabulary', name: 'Technical vocabulary' },
                    { id: 'context_clues', name: 'Context clues' },
                    { id: 'word_origins', name: 'Word origins (etymology basics)' }
                ]
            }
        ]
    },
    {
        id: 'literature',
        name: '2. Literature (Understanding Texts)',
        icon: '🎭',
        color: 'bg-purple-50 border-purple-200 text-purple-900',
        topics: [
            {
                id: 'narrative_texts',
                name: 'Narrative Texts',
                icon: '📚',
                domain: 'Literature',
                subtopics: [
                    { id: 'story_elements', name: 'Story elements (Character, Setting, Plot, Conflict, Resolution)' },
                    { id: 'themes_messages', name: 'Themes and messages' },
                    { id: 'point_of_view', name: 'Point of view' },
                    { id: 'character_development', name: 'Character development' },
                    { id: 'narrative_voice', name: 'Narrative voice' }
                ]
            },
            {
                id: 'poetry_lit',
                name: 'Poetry',
                icon: '📝',
                domain: 'Literature',
                subtopics: [
                    { id: 'rhythm_rhyme', name: 'Rhythm and rhyme' },
                    { id: 'imagery_poetry', name: 'Imagery' },
                    { id: 'figurative_language', name: 'Figurative language (Simile, Metaphor, Personification, Alliteration)' },
                    { id: 'free_verse', name: 'Free verse vs structured poetry' },
                    { id: 'performance_poetry', name: 'Performance poetry' }
                ]
            },
            {
                id: 'drama',
                name: 'Drama',
                icon: '🎭',
                domain: 'Literature',
                subtopics: [
                    { id: 'scripts_dialogue', name: 'Scripts and dialogue' },
                    { id: 'role_play', name: 'Role play' },
                    { id: 'readers_theatre', name: 'Readers theatre' },
                    { id: 'performance_skills', name: 'Performance skills' },
                    { id: 'stage_directions', name: 'Stage directions' }
                ]
            },
            {
                id: 'literary_appreciation',
                name: 'Literary Appreciation',
                icon: '🌍',
                domain: 'Literature',
                subtopics: [
                    { id: 'author_studies', name: 'Author studies' },
                    { id: 'genre_exploration', name: 'Genre exploration' },
                    { id: 'cultural_perspectives', name: 'Cultural perspectives in texts' },
                    { id: 'comparing_texts', name: 'Comparing texts' },
                    { id: 'visual_literacy_lit', name: 'Visual literacy (illustrations, film, media)' }
                ]
            }
        ]
    },
    {
        id: 'literacy',
        name: '3. Literacy (Using English)',
        icon: '🗣️',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        topics: [
            {
                id: 'writing_genres',
                name: 'Writing Genres',
                icon: '📝',
                domain: 'Literacy',
                subtopics: [
                    { id: 'narrative_writing', name: 'Narrative Writing (Short stories, Fantasy/adventure, Historical fiction, Personal narratives)' },
                    { id: 'persuasive_writing', name: 'Persuasive Writing (Arguments, Opinion pieces, Debates, Advertisements)' },
                    { id: 'informative_writing', name: 'Informative Writing (Reports, Explanations, Procedures, Information texts)' },
                    { id: 'creative_writing', name: 'Creative Writing (Poetry, Plays/scripts, Imaginative pieces)' }
                ]
            },
            {
                id: 'writing_skills',
                name: 'Writing Skills',
                icon: '📊',
                domain: 'Literacy',
                subtopics: [
                    { id: 'planning_drafting', name: 'Planning and drafting' },
                    { id: 'editing_revising', name: 'Editing and revising' },
                    { id: 'paragraph_structure', name: 'Paragraph structure (TEEL/PEEL etc.)' },
                    { id: 'cohesion_flow', name: 'Cohesion and flow' },
                    { id: 'audience_awareness', name: 'Audience awareness' }
                ]
            },
            {
                id: 'reading_skills',
                name: 'Reading Skills',
                icon: '📖',
                domain: 'Literacy',
                subtopics: [
                    { id: 'decoding_fluency', name: 'Decoding & Fluency (Phonics, Sight words, Expression, Reading pace)' },
                    { id: 'comprehension_strategies', name: 'Comprehension Strategies (Predicting, Questioning, Summarising, Inferring, Visualising, Clarifying)' },
                    { id: 'higher_level_comprehension', name: 'Higher-Level Comprehension (Analysing themes, Evaluating texts, Comparing texts, Identifying bias)' }
                ]
            },
            {
                id: 'speaking_listening',
                name: 'Speaking & Listening',
                icon: '🗣',
                domain: 'Literacy',
                subtopics: [
                    { id: 'oral_presentations', name: 'Oral presentations' },
                    { id: 'discussions', name: 'Discussions' },
                    { id: 'active_listening', name: 'Active listening' },
                    { id: 'public_speaking', name: 'Public speaking skills' },
                    { id: 'interviews', name: 'Interviews' },
                    { id: 'debates', name: 'Debates' }
                ]
            }
        ]
    },
    {
        id: 'media_digital_literacy',
        name: '4. Media & Digital Literacy',
        icon: '📱',
        color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
        topics: [
            {
                id: 'media_texts',
                name: 'Media Texts',
                subtopics: [
                    { id: 'advertisements', name: 'Advertisements' },
                    { id: 'news_reports', name: 'News reports' },
                    { id: 'films_videos', name: 'Films/videos' },
                    { id: 'social_media', name: 'Social media texts' }
                ]
            },
            {
                id: 'critical_literacy',
                name: 'Critical Literacy',
                subtopics: [
                    { id: 'bias_persuasion', name: 'Bias and persuasion' },
                    { id: 'fact_vs_opinion', name: 'Fact vs opinion' },
                    { id: 'audience_targeting', name: 'Audience targeting' },
                    { id: 'credibility', name: 'Credibility of sources' }
                ]
            },
            {
                id: 'digital_communication',
                name: 'Digital Communication',
                subtopics: [
                    { id: 'emails_messages', name: 'Emails/messages' },
                    { id: 'multimedia_presentations', name: 'Multimedia presentations' },
                    { id: 'online_etiquette', name: 'Online etiquette' }
                ]
            }
        ]
    },
    {
        id: 'text_types_genres',
        name: '5. Text Types & Genres (Great for Units)',
        icon: '🎯',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        topics: [
            {
                id: 'fiction_genres',
                name: 'Fiction Genres',
                subtopics: [
                    { id: 'fantasy', name: 'Fantasy' },
                    { id: 'sci_fi', name: 'Sci-fi' },
                    { id: 'mystery', name: 'Mystery' },
                    { id: 'adventure', name: 'Adventure' },
                    { id: 'historical_fiction', name: 'Historical fiction' },
                    { id: 'humour', name: 'Humour' }
                ]
            },
            {
                id: 'non_fiction_genres',
                name: 'Non-Fiction Genres',
                subtopics: [
                    { id: 'biographies', name: 'Biographies' },
                    { id: 'reports', name: 'Reports' },
                    { id: 'explanations', name: 'Explanations' },
                    { id: 'instructions', name: 'Instructions' }
                ]
            },
            {
                id: 'functional_texts',
                name: 'Functional Texts',
                subtopics: [
                    { id: 'letters', name: 'Letters' },
                    { id: 'emails', name: 'Emails' },
                    { id: 'posters', name: 'Posters' },
                    { id: 'speeches', name: 'Speeches' }
                ]
            }
        ]
    },
    {
        id: 'language_features_style',
        name: '6. Language Features & Style',
        icon: '🌟',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        topics: [
            {
                id: 'figurative_language',
                name: 'Figurative Language',
                subtopics: [
                    { id: 'simile_metaphor', name: 'Simile/metaphor' },
                    { id: 'personification', name: 'Personification' },
                    { id: 'hyperbole', name: 'Hyperbole' },
                    { id: 'idioms', name: 'Idioms' }
                ]
            },
            {
                id: 'author_techniques',
                name: 'Author Techniques',
                subtopics: [
                    { id: 'tone', name: 'Tone' },
                    { id: 'mood', name: 'Mood' },
                    { id: 'imagery', name: 'Imagery' },
                    { id: 'symbolism', name: 'Symbolism' }
                ]
            }
        ]
    },
    {
        id: 'oral_language',
        name: '7. Oral Language Development',
        icon: '🧩',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        topics: [
            { id: 'conversation_skills', name: 'Conversation skills' },
            { id: 'turn_taking', name: 'Turn-taking' },
            { id: 'expressive_language', name: 'Expressive language' },
            { id: 'questioning_techniques', name: 'Questioning techniques' },
            { id: 'storytelling', name: 'Storytelling' }
        ]
    },
    {
        id: 'cross_curricular_english',
        name: '8. Cross-Curricular English Topics',
        icon: '🧪',
        color: 'bg-green-50 border-green-200 text-green-900',
        topics: [
            { id: 'science_report', name: 'Science report writing' },
            { id: 'historical_narratives', name: 'Historical narratives' },
            { id: 'persuasive_environmental', name: 'Persuasive environmental writing' },
            { id: 'stem_explanations', name: 'STEM explanations' },
            { id: 'media_literacy_projects', name: 'Media literacy projects' }
        ]
    },
    {
        id: 'aus_curriculum_cultural',
        name: '9. Australian Curriculum / Cultural Context Topics',
        icon: '🇦🇺',
        color: 'bg-orange-50 border-orange-200 text-orange-900',
        topics: [
            { id: 'indigenous_storytelling', name: 'Indigenous storytelling' },
            { id: 'australian_authors', name: 'Australian authors' },
            { id: 'multicultural_literature', name: 'Multicultural literature' },
            { id: 'local_community_texts', name: 'Local community texts' }
        ]
    },
    {
        id: 'higher_level_literacy',
        name: '10. Higher-Level Literacy Skills (Upper Primary)',
        icon: '💡',
        color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
        topics: [
            { id: 'author_intent', name: 'Author intent' },
            { id: 'bias_perspective', name: 'Bias and perspective' },
            { id: 'critical_analysis', name: 'Critical analysis' },
            { id: 'comparing_sources', name: 'Comparing multiple sources' },
            { id: 'research_skills', name: 'Research skills' }
        ]
    }
];

// ------------------------------------------------------------------
// MATH
// ------------------------------------------------------------------
export const mathDomains = [
    {
        id: 'number_algebra',
        name: '1. Number & Algebra',
        icon: '🔢',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        topics: [
            { id: 'number_place_value', name: 'Number & Place Value', icon: '🧮', domain: 'Number & Algebra' },
            { id: 'addition_subtraction', name: 'Addition & Subtraction', icon: '➕', domain: 'Number & Algebra' },
            { id: 'multiplication_division', name: 'Multiplication & Division', icon: '✖', domain: 'Number & Algebra' },
            { id: 'fractions', name: 'Fractions', icon: '🍰', domain: 'Number & Algebra' },
            { id: 'decimals', name: 'Decimals', icon: '🧁', domain: 'Number & Algebra' },
            { id: 'percentages', name: 'Percentages', icon: '💰', domain: 'Number & Algebra' },
            { id: 'patterns_algebra', name: 'Patterns & Algebra', icon: '📐', domain: 'Number & Algebra' }
        ]
    },
    {
        id: 'measurement_geometry',
        name: '2. Measurement & Geometry',
        icon: '📏',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        topics: [
            { id: 'length', name: 'Length', icon: '📐', domain: 'Measurement & Geometry' },
            { id: 'area', name: 'Area', icon: '🟦', domain: 'Measurement & Geometry' },
            { id: 'volume_capacity', name: 'Volume & Capacity', icon: '🧊', domain: 'Measurement & Geometry' },
            { id: 'mass', name: 'Mass', icon: '⚖', domain: 'Measurement & Geometry' },
            { id: 'time', name: 'Time', icon: '🕒', domain: 'Measurement & Geometry' },
            { id: 'money', name: 'Money', icon: '💵', domain: 'Measurement & Geometry' },
            { id: '2d_shapes', name: '2D Shapes', icon: '🔷', domain: 'Measurement & Geometry' },
            { id: '3d_objects', name: '3D Objects', icon: '🧊', domain: 'Measurement & Geometry' },
            { id: 'transformation', name: 'Transformation', icon: '🔁', domain: 'Measurement & Geometry' },
            { id: 'position_direction', name: 'Position & Direction', icon: '🧭', domain: 'Measurement & Geometry' }
        ]
    },
    {
        id: 'statistics_probability',
        name: '3. Statistics & Probability',
        icon: '📊',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        topics: [
            { id: 'data_representation', name: 'Data Representation', icon: '📈', domain: 'Statistics & Probability' },
            { id: 'interpreting_data', name: 'Interpreting Data', icon: '📊', domain: 'Statistics & Probability' },
            { id: 'probability', name: 'Probability', icon: '🎲', domain: 'Statistics & Probability' }
        ]
    },
    {
        id: 'mathematical_thinking',
        name: '4. Mathematical Thinking & Problem Solving',
        icon: '🧠',
        color: 'bg-purple-50 border-purple-200 text-purple-900',
        topics: [
            { id: 'problem_solving_strategies', name: 'Problem Solving Strategies', icon: '🧩', domain: 'Mathematical Thinking' },
            { id: 'mathematical_communication', name: 'Mathematical Communication', icon: '🗣', domain: 'Mathematical Thinking' }
        ]
    },
    {
        id: 'financial_real_world',
        name: '5. Financial & Real-World Mathematics',
        icon: '💡',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        topics: [
            { id: 'financial_mathematics', name: 'Financial Mathematics', icon: '🪙', domain: 'Financial & Real-World' },
            { id: 'real_world_applications', name: 'Real-World Applications', icon: '🌍', domain: 'Financial & Real-World' }
        ]
    },
    {
        id: 'cross_curricular_maths',
        name: '6. Cross-Curricular Maths Topics',
        icon: '🧩',
        color: 'bg-teal-50 border-teal-200 text-teal-900',
        topics: [
            { id: 'maths_across_curriculum', name: 'Maths Across the Curriculum', icon: '🔗', domain: 'Cross-Curricular Maths' }
        ]
    }
];

// ------------------------------------------------------------------
// SCIENCE
// ------------------------------------------------------------------
export const scienceDomains = [
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

// ------------------------------------------------------------------
// HASS
// ------------------------------------------------------------------
export const hassDomains = [
    {
        id: 'history',
        name: '1. History',
        icon: '🌏',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        topics: [
            { id: 'ancient_history', name: 'Ancient History', icon: '🏺', domain: 'History' },
            { id: 'australian_history', name: 'Australian History', icon: '🇦🇺', domain: 'History' },
            { id: 'wars_conflict', name: 'Wars & Conflict', icon: '⚔', domain: 'History' },
            { id: 'local_history', name: 'Local History', icon: '🧭', domain: 'History' },
            { id: 'historical_skills', name: 'Historical Skills', icon: '👤', domain: 'History' }
        ]
    },
    {
        id: 'geography',
        name: '2. Geography',
        icon: '🌍',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        topics: [
            { id: 'physical_geography', name: 'Physical Geography', icon: '🌎', domain: 'Geography' },
            { id: 'weather_climate', name: 'Weather & Climate', icon: '🌦', domain: 'Geography' },
            { id: 'environmental_geography', name: 'Environmental Geography', icon: '🌱', domain: 'Geography' },
            { id: 'human_geography', name: 'Human Geography', icon: '🗺', domain: 'Geography' },
            { id: 'mapping_skills', name: 'Mapping Skills', icon: '🧭', domain: 'Geography' }
        ]
    },
    {
        id: 'civics_citizenship',
        name: '3. Civics & Citizenship',
        icon: '🏛',
        color: 'bg-blue-50 border-blue-200 text-blue-900',
        topics: [
            { id: 'government_democracy', name: 'Government & Democracy', icon: '🏫', domain: 'Civics & Citizenship' },
            { id: 'citizenship', name: 'Citizenship', icon: '👥', domain: 'Civics & Citizenship' },
            { id: 'justice_laws', name: 'Justice & Laws', icon: '⚖', domain: 'Civics & Citizenship' },
            { id: 'global_citizenship', name: 'Global Citizenship', icon: '🌐', domain: 'Civics & Citizenship' }
        ]
    },
    {
        id: 'economics_business',
        name: '4. Economics & Business',
        icon: '💰',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        topics: [
            { id: 'consumer_skills', name: 'Consumer Skills', icon: '💵', domain: 'Economics & Business' },
            { id: 'business_basics', name: 'Business Basics', icon: '🛒', domain: 'Economics & Business' },
            { id: 'financial_literacy', name: 'Financial Literacy', icon: '🏦', domain: 'Economics & Business' },
            { id: 'trade_economy', name: 'Trade & Economy', icon: '🌍', domain: 'Economics & Business' }
        ]
    },
    {
        id: 'culture_society',
        name: '5. Culture & Society',
        icon: '🌏',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        topics: [
            { id: 'cultural_studies', name: 'Cultural Studies', icon: '🌎', domain: 'Culture & Society' },
            { id: 'communities', name: 'Communities', icon: '🏘', domain: 'Culture & Society' },
            { id: 'family_identity', name: 'Family & Identity', icon: '👨‍👩‍👧', domain: 'Culture & Society' }
        ]
    },
    {
        id: 'inquiry_skills',
        name: '6. Inquiry Skills (HASS Skills)',
        icon: '🧠',
        color: 'bg-purple-50 border-purple-200 text-purple-900',
        topics: [
            { id: 'investigating', name: 'Investigating', icon: '🔍', domain: 'Inquiry Skills' },
            { id: 'analysing', name: 'Analysing', icon: '📊', domain: 'Inquiry Skills' },
            { id: 'communicating', name: 'Communicating', icon: '🗣', domain: 'Inquiry Skills' }
        ]
    },
    {
        id: 'integrated_inquiry',
        name: '7. Integrated Inquiry Topics',
        icon: '🧩',
        color: 'bg-teal-50 border-teal-200 text-teal-900',
        topics: [
            { id: 'sustainability_projects', name: 'Sustainability Projects', icon: '♻', domain: 'Integrated Inquiry' },
            { id: 'leadership_community', name: 'Leadership & Community Projects', icon: '🤝', domain: 'Integrated Inquiry' },
            { id: 'global_issues', name: 'Global Issues', icon: '🌍', domain: 'Integrated Inquiry' }
        ]
    },
    {
        id: 'indigenous_perspectives',
        name: '8. Indigenous Perspectives',
        icon: '🇦🇺',
        color: 'bg-orange-50 border-orange-200 text-orange-900',
        topics: [
            { id: 'traditional_custodianship', name: 'Traditional Custodianship', icon: '🪃', domain: 'Indigenous Perspectives' },
            { id: 'cultural_knowledge', name: 'Cultural Knowledge Systems', icon: '🌌', domain: 'Indigenous Perspectives' }
        ]
    },
    {
        id: 'future_focused',
        name: '9. Future-Focused HASS Topics',
        icon: '🚀',
        color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
        topics: [
            { id: 'globalisation', name: 'Globalisation', icon: '🌐', domain: 'Future-Focused HASS' },
            { id: 'digital_citizenship', name: 'Digital Citizenship', icon: '💻', domain: 'Future-Focused HASS' },
            { id: 'future_cities', name: 'Future Cities', icon: '🏙', domain: 'Future-Focused HASS' }
        ]
    }
];

// Helper to lookup subject by id and return the data object
export const getCurriculumData = () => {
    return {
        english: englishDomains,
        mathematics: mathDomains,
        science: scienceDomains,
        hass: hassDomains
    };
};

/**
 * Helper to fetch a complete topic/subtopic object.
 * Finds the object matching the provided config identifiers.
 */
export const getTopicData = (subjectId, domainId, topicId) => {
    const allData = getCurriculumData();
    const domains = allData[subjectId];
    if (!domains) return null;

    const domain = domains.find(d => d.id === domainId);
    if (!domain) return null;

    const topic = domain.topics?.find(t => t.id === topicId);

    // Add the subject and domain metadata down if we found it
    if (topic) {
        return {
            ...topic,
            subjectId,
            domainId,
            domainName: domain.name
        };
    }
    return null;
};
