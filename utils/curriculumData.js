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
                                        { type: 'game', title: 'Adverb Asteroids', src: 'AdverbAsteroidsGame', thumbnail: '/curriculum/new literacy/Grammar/Adverbs/Display/Adverbs.png' },
                                        { type: 'game', title: 'Adverb Sort', src: 'AdverbSortingGame', thumbnail: '/curriculum/new literacy/Grammar/Adverbs/Display/Adverbs.png' },
                                        { type: 'game', title: 'Action Builder', src: 'AdverbActionBuilder', thumbnail: '/curriculum/new literacy/Grammar/Adverbs/Display/Adverbs.png' }
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
                                        { type: 'game', title: 'Pronoun Replacement Race', src: 'PronounReplacementRace', thumbnail: '/curriculum/new literacy/Grammar/Pronouns/Display/Pronouns.png' },
                                        { type: 'game', title: 'Pronoun Type Match', src: 'PronounTypeMatch', thumbnail: '/curriculum/new literacy/Grammar/Pronouns/Display/Pronouns.png' },
                                        { type: 'game', title: 'Pronoun Rescue Mission', src: 'PronounRescueMission', thumbnail: '/curriculum/new literacy/Grammar/Pronouns/Display/Pronouns.png' }
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
                                        { type: 'game', title: 'Preposition Ninja', src: 'PrepositionNinja', thumbnail: '/curriculum/new literacy/Grammar/Prepositions/Display/Prepositions.png' },
                                        { type: 'game', title: 'Preposition Location Match', src: 'PrepositionLocationGame', thumbnail: '/curriculum/new literacy/Grammar/Prepositions/Display/Prepositions.png' },
                                        { type: 'game', title: 'Phrase Builder', src: 'PrepositionPhraseBuilder', thumbnail: '/curriculum/new literacy/Grammar/Prepositions/Display/Prepositions.png' }
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
                                        { type: 'game', title: 'Conjunction Conductor', src: 'ConjunctionConductor', thumbnail: '/curriculum/new literacy/Grammar/Conjunctions/Display/Conjunctions.png' },
                                        { type: 'game', title: 'Bridge Builder', src: 'ConjunctionBridgeBuilder', thumbnail: '/curriculum/new literacy/Grammar/Conjunctions/Display/Conjunctions.png' },
                                        { type: 'game', title: 'Conjunction Sort', src: 'ConjunctionSort', thumbnail: '/curriculum/new literacy/Grammar/Conjunctions/Display/Conjunctions.png' }
                                    ]
                                }
                            },
                            {
                                id: 'interjections',
                                name: 'Interjections',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Interjections Display', src: '/curriculum/new literacy/Grammar/Interjections/Display/Interjections.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Interjections Guide', src: '/curriculum/new literacy/Grammar/Interjections/Learning/Interjections.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Interjections/Learning/Interjections.pptx', thumbnail: '/curriculum/new literacy/Grammar/Interjections/Learning/cover.png' }
                                    ],
                                    practice: [
                                        { type: 'game', title: 'Emotion Match', src: 'InterjectionEmotionMatch', thumbnail: '/curriculum/new literacy/Grammar/Interjections/Display/Interjections.png' },
                                        { type: 'game', title: 'Balloon Pop Interjections', src: 'InterjectionPopGame', thumbnail: '/curriculum/new literacy/Grammar/Interjections/Display/Interjections.png' },
                                        { type: 'game', title: 'Interjection Comic Strip', src: 'InterjectionComicStrip', thumbnail: '/curriculum/new literacy/Grammar/Interjections/Display/Interjections.png' }
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
                                id: 'subjects_predicates',
                                name: 'Subjects and Predicates',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Subjects and Predicates Display', src: '/curriculum/new literacy/Grammar/Subjects and Predicates/Display/Subjects_and_Predicates.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Subjects and Predicates Guide', src: '/curriculum/new literacy/Grammar/Subjects and Predicates/Learning/Subjects_and_Predicates.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Subjects and Predicates/Learning/Subjects_and_Predicates.pptx', thumbnail: '/curriculum/new literacy/Grammar/Subjects and Predicates/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'active_passive_voice',
                                name: 'Active and Passive Voice',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Active vs Passive Voice Display', src: '/curriculum/new literacy/Grammar/Active and Passive Voice/Display/Active_vs_Passive.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Active vs Passive Voice Guide', src: '/curriculum/new literacy/Grammar/Active and Passive Voice/Learning/Active_vs_Passive.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Active and Passive Voice/Learning/Active_vs_Passive.pptx', thumbnail: '/curriculum/new literacy/Grammar/Active and Passive Voice/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            },
                            {
                                id: 'fragments_run_ons',
                                name: 'Fragments and Run-Ons',
                                resources: {
                                    display: [
                                        { type: 'image', title: 'Fragments and Run-Ons Display', src: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-On Sentences/Display/Fragments_and_Run-Ons.png' }
                                    ],
                                    learn: [
                                        { type: 'pdf', title: 'Fragments and Run-Ons Guide', src: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-On Sentences/Learning/Fragments_and_Run_Ons.pdf', pptxSrc: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-On Sentences/Learning/Fragments_and_Run_Ons.pptx', thumbnail: '/curriculum/new literacy/Grammar/Sentence Fragments and Run-On Sentences/Learning/cover.png' }
                                    ],
                                    practice: []
                                }
                            }
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
                    { id: 'end_punctuation', name: 'End Punctuation (. ? !)' },
                    { id: 'commas', name: 'Commas (,)' },
                    { id: 'apostrophes', name: "Apostrophes (')" },
                    { id: 'quotation_marks', name: 'Quotation Marks (" ")' },
                    { id: 'colons_semicolons', name: 'Colons & Semicolons (: ;)' },
                    { id: 'hyphens_dashes', name: 'Hyphens & Dashes (- —)' }
                ]
            },
            {
                id: 'spelling',
                name: 'Spelling (Orthography)',
                icon: '📝',
                domain: 'Language (How English Works)',
                subtopics: [
                    { id: 'phonics', name: 'Phonics & Sounds' },
                    { id: 'morphemes', name: 'Prefixes & Suffixes' },
                    { id: 'etymology', name: 'Word Origins (Etymology)' },
                    { id: 'spelling_rules', name: 'Common Spelling Rules' },
                    { id: 'homophones', name: 'Homophones' }
                ]
            }
        ]
    },
    {
        id: 'literature',
        name: '2. Literature (Responding to & Creating Literature)',
        icon: '🎭',
        color: 'bg-purple-50 border-purple-200 text-purple-900',
        topics: [
            { id: 'examining_literature', name: 'Examining Literature', icon: '🔍', domain: 'Literature' },
            { id: 'creating_literature', name: 'Creating Literature', icon: '✍️', domain: 'Literature' },
            { id: 'poetry', name: 'Poetry', icon: '📜', domain: 'Literature' },
            { id: 'story_elements', name: 'Story Elements (Plot, Character, Setting)', icon: '📖', domain: 'Literature' }
        ]
    },
    {
        id: 'literacy',
        name: '3. Literacy (Reading, Writing, Speaking, Listening)',
        icon: '🗣️',
        color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        topics: [
            { id: 'reading_comprehension', name: 'Reading Comprehension', icon: '👁️', domain: 'Literacy' },
            { id: 'writing_genres', name: 'Writing Genres (Text Types)', icon: '✒️', domain: 'Literacy' },
            { id: 'speaking_listening', name: 'Speaking & Listening', icon: '🎧', domain: 'Literacy' },
            { id: 'visual_literacy', name: 'Visual Literacy', icon: '🖼️', domain: 'Literacy' },
            { id: 'information_literacy', name: 'Information Literacy', icon: '📰', domain: 'Literacy' }
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
