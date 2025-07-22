// config/curriculumContent.js - Centralized Curriculum Content
// This file contains all educational content for the Curriculum Corner
// To add new content, simply update the relevant subject sections below

// ===============================================
// LITERACY CONTENT
// ===============================================

export const LITERACY_CONTENT = {
  // Writing structures and frameworks
  writingStructures: {
    narrative: {
      name: 'Narrative Writing',
      icon: '📖',
      description: 'Tell a story with characters, setting, and plot',
      sections: [
        {
          name: 'Orientation',
          description: 'Introduce characters, setting, and time',
          tips: ['Who are the main characters?', 'Where does it take place?', 'When does it happen?']
        },
        {
          name: 'Complication',
          description: 'Present the problem or challenge',
          tips: ['What goes wrong?', 'What challenge appears?', 'How do characters react?']
        },
        {
          name: 'Resolution',
          description: 'Solve the problem and conclude',
          tips: ['How is the problem solved?', 'What did characters learn?', 'How does it end?']
        }
      ]
    },
    persuasive: {
      name: 'Persuasive Writing',
      icon: '🎯',
      description: 'Convince your reader with strong arguments',
      sections: [
        {
          name: 'Position Statement',
          description: 'State your clear opinion or argument',
          tips: ['Be clear and direct', 'Use strong language', 'State your main point']
        },
        {
          name: 'Supporting Arguments',
          description: 'Provide evidence and reasons',
          tips: ['Use facts and examples', 'Give multiple reasons', 'Include expert opinions']
        },
        {
          name: 'Conclusion',
          description: 'Restate and call for action',
          tips: ['Summarize main points', 'Restate your position', 'Tell reader what to do']
        }
      ]
    },
    informative: {
      name: 'Informative Writing',
      icon: '📋',
      description: 'Teach your reader about a topic',
      sections: [
        {
          name: 'Introduction',
          description: 'Hook reader and introduce topic',
          tips: ['Start with interesting fact', 'Define key terms', 'Preview main points']
        },
        {
          name: 'Body Paragraphs',
          description: 'Organize information clearly',
          tips: ['One main idea per paragraph', 'Use topic sentences', 'Include supporting details']
        },
        {
          name: 'Conclusion',
          description: 'Summarize and wrap up',
          tips: ['Restate main points', 'Emphasize importance', 'End with final thought']
        }
      ]
    },
    poetry: {
      name: 'Poetry Writing',
      icon: '🎭',
      description: 'Express emotions and ideas creatively',
      sections: [
        {
          name: 'Choose Your Form',
          description: 'Select poetry type and structure',
          tips: ['Free verse or rhyming?', 'How many lines?', 'What rhythm or pattern?']
        },
        {
          name: 'Imagery and Language',
          description: 'Use vivid and descriptive words',
          tips: ['Appeal to the senses', 'Use metaphors and similes', 'Choose powerful words']
        },
        {
          name: 'Refine and Edit',
          description: 'Polish your poem for impact',
          tips: ['Read aloud for rhythm', 'Remove unnecessary words', 'Strengthen word choices']
        }
      ]
    }
  },

  // Grammar and language tools
  grammarTopics: {
    'parts-of-speech': {
      name: 'Parts of Speech',
      icon: '🔤',
      description: 'Master the building blocks of language',
      sections: {
        nouns: {
          name: 'Nouns',
          definition: 'Words that name people, places, things, or ideas',
          examples: ['person: teacher, doctor, student', 'place: school, park, library', 'thing: book, computer, desk', 'idea: happiness, freedom, love'],
          activities: ['Noun hunt in a story', 'Sort common vs proper nouns', 'Abstract vs concrete nouns']
        },
        verbs: {
          name: 'Verbs',
          definition: 'Words that show action or state of being',
          examples: ['action: run, jump, write, think', 'being: is, are, was, were', 'helping: have, will, can, should'],
          activities: ['Verb tense timeline', 'Action verb charades', 'Find helping verbs']
        },
        adjectives: {
          name: 'Adjectives',
          definition: 'Words that describe or modify nouns',
          examples: ['size: big, small, tiny, huge', 'color: red, blue, bright, dark', 'feeling: happy, sad, excited', 'opinion: beautiful, ugly, wonderful'],
          activities: ['Descriptive writing challenge', 'Compare with comparatives', 'Adjective placement practice']
        },
        adverbs: {
          name: 'Adverbs',
          definition: 'Words that describe verbs, adjectives, or other adverbs',
          examples: ['how: quickly, carefully, loudly', 'when: yesterday, soon, always', 'where: here, there, everywhere', 'degree: very, quite, extremely'],
          activities: ['Adverb scavenger hunt', 'Modify the action', 'Adverb vs adjective practice']
        }
      }
    },
    'sentence-structure': {
      name: 'Sentence Structure',
      icon: '🏗️',
      description: 'Build strong and varied sentences',
      sections: {
        simple: {
          name: 'Simple Sentences',
          definition: 'One independent clause with subject and predicate',
          examples: ['The dog barks.', 'Students learn quickly.', 'My sister loves reading.'],
          activities: ['Identify subject and predicate', 'Expand simple sentences', 'Combine short sentences']
        },
        compound: {
          name: 'Compound Sentences',
          definition: 'Two independent clauses joined by conjunction',
          examples: ['I like pizza, but she prefers pasta.', 'We studied hard, so we passed the test.', 'It was raining, yet we went outside.'],
          activities: ['FANBOYS practice', 'Combine with semicolons', 'Fix run-on sentences']
        },
        complex: {
          name: 'Complex Sentences',
          definition: 'Independent clause with dependent clause',
          examples: ['Because it was late, we went home.', 'When the bell rings, class ends.', 'Although tired, she finished homework.'],
          activities: ['Subordinating conjunctions', 'Dependent clause identification', 'Sentence combining practice']
        }
      }
    },
    punctuation: {
      name: 'Punctuation',
      icon: '‼️',
      description: 'Use punctuation marks correctly',
      sections: {
        periods: {
          name: 'Periods',
          rules: ['End declarative sentences', 'After abbreviations', 'In decimal numbers'],
          examples: ['The book is on the table.', 'Dr. Smith teaches science.', 'The price is $4.99.']
        },
        commas: {
          name: 'Commas',
          rules: ['Separate items in series', 'Before conjunctions in compound sentences', 'After introductory elements', 'Around non-essential information'],
          examples: ['I bought apples, oranges, and bananas.', 'She studied hard, but the test was difficult.', 'After the movie, we went home.', 'My friend, who lives nearby, visited today.']
        },
        apostrophes: {
          name: 'Apostrophes',
          rules: ['Show possession', 'Form contractions', 'Plural of letters and numbers'],
          examples: ["The cat's toy is missing.", "Don't forget your homework.", "Mind your p's and q's."]
        }
      }
    }
  },

  // Reading comprehension strategies
  readingStrategies: {
    'before-reading': {
      name: 'Before Reading',
      icon: '🔍',
      strategies: [
        { name: 'Preview', description: 'Look at title, headings, pictures', activity: 'Make predictions about content' },
        { name: 'Activate Prior Knowledge', description: 'Think about what you already know', activity: 'Create a KWL chart' },
        { name: 'Set Purpose', description: 'Decide why you are reading', activity: 'Write reading goals' },
        { name: 'Predict', description: 'Guess what might happen', activity: 'Make and record predictions' }
      ]
    },
    'during-reading': {
      name: 'During Reading',
      icon: '📖',
      strategies: [
        { name: 'Visualize', description: 'Create pictures in your mind', activity: 'Draw what you imagine' },
        { name: 'Question', description: 'Ask yourself questions', activity: 'Write questions in margins' },
        { name: 'Connect', description: 'Link to your experiences', activity: 'Make text-to-self connections' },
        { name: 'Summarize', description: 'Retell main ideas', activity: 'Stop and summarize sections' }
      ]
    },
    'after-reading': {
      name: 'After Reading',
      icon: '💭',
      strategies: [
        { name: 'Reflect', description: 'Think about the text', activity: 'Write a reaction response' },
        { name: 'Analyze', description: 'Examine author choices', activity: 'Identify theme and message' },
        { name: 'Evaluate', description: 'Judge the text quality', activity: 'Rate and review the text' },
        { name: 'Extend', description: 'Go beyond the text', activity: 'Research related topics' }
      ]
    }
  }
};

// ===============================================
// MATHEMATICS CONTENT
// ===============================================

export const MATHEMATICS_CONTENT = {
  // Number operations
  operations: {
    addition: {
      name: 'Addition',
      icon: '➕',
      levels: {
        basic: {
          name: 'Basic Addition',
          description: 'Single-digit numbers',
          examples: ['3 + 4 = 7', '5 + 2 = 7', '6 + 3 = 9'],
          strategies: ['Count on', 'Use fingers', 'Number line', 'Doubles facts']
        },
        regrouping: {
          name: 'Addition with Regrouping',
          description: 'Multi-digit with carrying',
          examples: ['47 + 35 = 82', '156 + 289 = 445'],
          strategies: ['Column addition', 'Place value understanding', 'Mental math tricks']
        },
        decimals: {
          name: 'Decimal Addition',
          description: 'Adding decimal numbers',
          examples: ['3.45 + 2.67 = 6.12', '12.8 + 9.25 = 22.05'],
          strategies: ['Line up decimal points', 'Add zeros as placeholders', 'Check reasonableness']
        }
      }
    },
    subtraction: {
      name: 'Subtraction',
      icon: '➖',
      levels: {
        basic: {
          name: 'Basic Subtraction',
          description: 'Single-digit numbers',
          examples: ['9 - 4 = 5', '8 - 3 = 5', '7 - 2 = 5'],
          strategies: ['Count back', 'Count up', 'Number line', 'Fact families']
        },
        regrouping: {
          name: 'Subtraction with Regrouping',
          description: 'Multi-digit with borrowing',
          examples: ['82 - 47 = 35', '503 - 176 = 327'],
          strategies: ['Column subtraction', 'Decomposition method', 'Mental math strategies']
        },
        decimals: {
          name: 'Decimal Subtraction',
          description: 'Subtracting decimal numbers',
          examples: ['8.75 - 3.28 = 5.47', '15.6 - 7.89 = 7.71'],
          strategies: ['Align decimal points', 'Add zeros', 'Check with addition']
        }
      }
    },
    multiplication: {
      name: 'Multiplication',
      icon: '✖️',
      levels: {
        tables: {
          name: 'Times Tables',
          description: 'Memorizing multiplication facts',
          examples: ['7 × 8 = 56', '6 × 9 = 54', '4 × 7 = 28'],
          strategies: ['Skip counting', 'Arrays', 'Repeated addition', 'Pattern recognition']
        },
        multidigit: {
          name: 'Multi-digit Multiplication',
          description: 'Larger number multiplication',
          examples: ['23 × 47 = 1,081', '156 × 24 = 3,744'],
          strategies: ['Standard algorithm', 'Area model', 'Partial products', 'Estimation']
        },
        decimals: {
          name: 'Decimal Multiplication',
          description: 'Multiplying decimal numbers',
          examples: ['3.7 × 2.4 = 8.88', '0.25 × 1.6 = 0.4'],
          strategies: ['Count decimal places', 'Estimate first', 'Convert to fractions']
        }
      }
    },
    division: {
      name: 'Division',
      icon: '➗',
      levels: {
        basic: {
          name: 'Basic Division',
          description: 'Simple division facts',
          examples: ['56 ÷ 8 = 7', '42 ÷ 6 = 7', '81 ÷ 9 = 9'],
          strategies: ['Related multiplication', 'Arrays', 'Equal groups', 'Number lines']
        },
        longdivision: {
          name: 'Long Division',
          description: 'Multi-digit division',
          examples: ['684 ÷ 4 = 171', '2,156 ÷ 7 = 308'],
          strategies: ['Standard algorithm', 'Estimate quotient', 'Check with multiplication']
        },
        decimals: {
          name: 'Decimal Division',
          description: 'Dividing decimal numbers',
          examples: ['8.4 ÷ 2.1 = 4', '15.75 ÷ 3 = 5.25'],
          strategies: ['Move decimal points', 'Convert to whole numbers', 'Estimate answer']
        }
      }
    }
  },

  // Geometry concepts
  geometry: {
    shapes2d: {
      name: '2D Shapes',
      icon: '🔺',
      shapes: {
        triangle: {
          name: 'Triangle',
          properties: ['3 sides', '3 angles', 'sum of angles = 180°'],
          types: ['Equilateral', 'Isosceles', 'Scalene', 'Right', 'Acute', 'Obtuse'],
          realworld: ['Road signs', 'Pizza slice', 'Roof of house']
        },
        quadrilateral: {
          name: 'Quadrilateral',
          properties: ['4 sides', '4 angles', 'sum of angles = 360°'],
          types: ['Square', 'Rectangle', 'Rhombus', 'Parallelogram', 'Trapezoid'],
          realworld: ['Windows', 'Books', 'Tables', 'Computer screens']
        },
        circle: {
          name: 'Circle',
          properties: ['Curved line', 'All points equal distance from center', 'No corners'],
          terms: ['Radius', 'Diameter', 'Circumference', 'Center'],
          realworld: ['Wheels', 'Clocks', 'Coins', 'Plates']
        }
      }
    },
    shapes3d: {
      name: '3D Shapes',
      icon: '🎲',
      shapes: {
        cube: {
          name: 'Cube',
          properties: ['6 faces', '12 edges', '8 vertices', 'all faces are squares'],
          examples: ['Dice', 'Ice cubes', 'Gift boxes']
        },
        sphere: {
          name: 'Sphere',
          properties: ['Curved surface', 'No edges', 'No vertices', 'perfectly round'],
          examples: ['Basketball', 'Earth', 'Marbles']
        },
        cylinder: {
          name: 'Cylinder',
          properties: ['2 circular faces', '1 curved surface', 'No vertices'],
          examples: ['Cans', 'Toilet paper roll', 'Pencils']
        },
        pyramid: {
          name: 'Pyramid',
          properties: ['Triangular faces', 'One base', 'Vertices meet at apex'],
          examples: ['Egyptian pyramids', 'Tents', 'Mountain peaks']
        }
      }
    }
  },

  // Measurement units and concepts
  measurement: {
    length: {
      name: 'Length',
      icon: '📏',
      units: {
        metric: ['millimeter (mm)', 'centimeter (cm)', 'meter (m)', 'kilometer (km)'],
        imperial: ['inch (in)', 'foot (ft)', 'yard (yd)', 'mile (mi)']
      },
      conversions: ['10mm = 1cm', '100cm = 1m', '1000m = 1km', '12in = 1ft', '3ft = 1yd', '5280ft = 1mi'],
      activities: ['Measure classroom objects', 'Estimate then measure', 'Unit conversion practice']
    },
    weight: {
      name: 'Weight/Mass',
      icon: '⚖️',
      units: {
        metric: ['gram (g)', 'kilogram (kg)', 'tonne (t)'],
        imperial: ['ounce (oz)', 'pound (lb)', 'ton']
      },
      conversions: ['1000g = 1kg', '1000kg = 1t', '16oz = 1lb', '2000lb = 1 ton'],
      activities: ['Compare object weights', 'Cooking measurements', 'Body weight tracking']
    },
    capacity: {
      name: 'Capacity/Volume',
      icon: '🥤',
      units: {
        metric: ['milliliter (mL)', 'liter (L)'],
        imperial: ['fluid ounce (fl oz)', 'cup', 'pint', 'quart', 'gallon']
      },
      conversions: ['1000mL = 1L', '8 fl oz = 1 cup', '2 cups = 1 pint', '2 pints = 1 quart', '4 quarts = 1 gallon'],
      activities: ['Water experiments', 'Recipe measurements', 'Container comparisons']
    }
  }
};

// ===============================================
// SCIENCE CONTENT
// ===============================================

export const SCIENCE_CONTENT = {
  // Life science topics
  lifescience: {
    livingthings: {
      name: 'Living Things',
      icon: '🌱',
      characteristics: [
        'Growth and development',
        'Reproduction',
        'Response to environment',
        'Energy use',
        'Organization',
        'Homeostasis'
      ],
      classification: {
        kingdoms: ['Animals', 'Plants', 'Fungi', 'Protists', 'Bacteria'],
        examples: {
          animals: ['Mammals', 'Birds', 'Fish', 'Reptiles', 'Amphibians', 'Insects'],
          plants: ['Trees', 'Flowers', 'Grasses', 'Ferns', 'Mosses'],
          fungi: ['Mushrooms', 'Molds', 'Yeasts']
        }
      },
      activities: ['Living vs non-living sort', 'Animal classification', 'Plant observation journal']
    },
    ecosystems: {
      name: 'Ecosystems',
      icon: '🌍',
      components: {
        biotic: ['Plants', 'Animals', 'Bacteria', 'Fungi'],
        abiotic: ['Water', 'Air', 'Soil', 'Sunlight', 'Temperature']
      },
      types: ['Forest', 'Desert', 'Ocean', 'Grassland', 'Freshwater', 'Arctic'],
      foodchains: {
        levels: ['Producers', 'Primary consumers', 'Secondary consumers', 'Decomposers'],
        example: 'Grass → Rabbit → Fox → Bacteria'
      },
      activities: ['Create food web', 'Ecosystem diorama', 'Animal habitat research']
    }
  },

  // Physical science topics
  physicalscience: {
    matter: {
      name: 'States of Matter',
      icon: '🧊',
      states: {
        solid: {
          properties: ['Fixed shape', 'Fixed volume', 'Particles close together'],
          examples: ['Ice', 'Rock', 'Wood', 'Metal']
        },
        liquid: {
          properties: ['No fixed shape', 'Fixed volume', 'Particles can move'],
          examples: ['Water', 'Oil', 'Juice', 'Mercury']
        },
        gas: {
          properties: ['No fixed shape', 'No fixed volume', 'Particles spread out'],
          examples: ['Air', 'Steam', 'Helium', 'Carbon dioxide']
        }
      },
      changes: ['Melting', 'Freezing', 'Evaporation', 'Condensation', 'Sublimation'],
      activities: ['Ice melting experiment', 'Water cycle model', 'Balloon expansion demo']
    },
    forces: {
      name: 'Forces and Motion',
      icon: '⚡',
      types: {
        contact: ['Friction', 'Applied force', 'Spring force', 'Tension'],
        noncontact: ['Gravity', 'Magnetic force', 'Electric force']
      },
      laws: {
        newton1: 'Objects at rest stay at rest, objects in motion stay in motion',
        newton2: 'Force = mass × acceleration',
        newton3: 'Every action has an equal and opposite reaction'
      },
      activities: ['Friction experiments', 'Paper airplane tests', 'Magnet investigations']
    }
  },

  // Earth science topics
  earthscience: {
    weather: {
      name: 'Weather and Climate',
      icon: '🌤️',
      elements: ['Temperature', 'Precipitation', 'Wind', 'Humidity', 'Air pressure'],
      instruments: {
        thermometer: 'Measures temperature',
        barometer: 'Measures air pressure',
        anemometer: 'Measures wind speed',
        rain_gauge: 'Measures precipitation',
        hygrometer: 'Measures humidity'
      },
      patterns: ['Daily changes', 'Seasonal changes', 'Climate zones'],
      activities: ['Weather station setup', 'Cloud identification', 'Climate graphing']
    },
    rocks: {
      name: 'Rocks and Minerals',
      icon: '🪨',
      types: {
        igneous: {
          formation: 'Cooling magma or lava',
          examples: ['Granite', 'Obsidian', 'Pumice', 'Basalt']
        },
        sedimentary: {
          formation: 'Layers of sediment compressed',
          examples: ['Sandstone', 'Limestone', 'Shale', 'Coal']
        },
        metamorphic: {
          formation: 'Heat and pressure changes',
          examples: ['Marble', 'Slate', 'Quartzite', 'Gneiss']
        }
      },
      cycle: 'Rock cycle shows how rocks change from one type to another',
      activities: ['Rock collection', 'Mineral hardness test', 'Rock cycle diagram']
    }
  }
};

// ===============================================
// SOCIAL STUDIES CONTENT
// ===============================================

export const SOCIAL_STUDIES_CONTENT = {
  geography: {
    maps: {
      name: 'Maps and Geography',
      icon: '🗺️',
      types: ['Political maps', 'Physical maps', 'Climate maps', 'Population maps'],
      elements: ['Title', 'Legend/Key', 'Scale', 'Compass rose', 'Grid system'],
      skills: ['Reading coordinates', 'Measuring distance', 'Interpreting symbols', 'Direction finding'],
      activities: ['Treasure map creation', 'School map drawing', 'Coordinate games']
    },
    continents: {
      name: 'Continents and Oceans',
      icon: '🌎',
      continents: ['Asia', 'Africa', 'North America', 'South America', 'Europe', 'Australia', 'Antarctica'],
      oceans: ['Pacific', 'Atlantic', 'Indian', 'Arctic', 'Southern'],
      features: ['Mountains', 'Rivers', 'Deserts', 'Forests', 'Plains'],
      activities: ['Continent puzzle', 'Ocean current tracking', 'Landmark research']
    }
  },

  history: {
    timelines: {
      name: 'Understanding Time',
      icon: '📅',
      concepts: ['Past, present, future', 'Chronological order', 'Cause and effect', 'Change over time'],
      tools: ['Timelines', 'Calendars', 'Historical documents', 'Artifacts'],
      activities: ['Personal timeline', 'School history research', 'Historical figure study']
    },
    communities: {
      name: 'Communities',
      icon: '🏘️',
      types: ['Rural', 'Suburban', 'Urban'],
      features: ['Homes', 'Schools', 'Businesses', 'Transportation', 'Government'],
      roles: ['Citizens', 'Workers', 'Leaders', 'Volunteers'],
      activities: ['Community walk', 'Local government visit', 'Community helper interviews']
    }
  }
};

// ===============================================
// STEM/TECHNOLOGY CONTENT
// ===============================================

export const STEM_CONTENT = {
  engineering: {
    process: {
      name: 'Engineering Design Process',
      icon: '⚙️',
      steps: [
        { name: 'Ask', description: 'Define the problem' },
        { name: 'Imagine', description: 'Brainstorm solutions' },
        { name: 'Plan', description: 'Choose best solution' },
        { name: 'Create', description: 'Build prototype' },
        { name: 'Test', description: 'Try your solution' },
        { name: 'Improve', description: 'Make it better' }
      ],
      activities: ['Bridge building challenge', 'Tower construction', 'Catapult design']
    },
    simple_machines: {
      name: 'Simple Machines',
      icon: '🔧',
      types: {
        lever: { examples: ['Seesaw', 'Crowbar', 'Scissors'], principle: 'Multiply force' },
        pulley: { examples: ['Flag pole', 'Well', 'Crane'], principle: 'Change direction of force' },
        inclined_plane: { examples: ['Ramp', 'Slide', 'Stairs'], principle: 'Reduce effort force' },
        wheel_axle: { examples: ['Car wheel', 'Door knob', 'Bicycle'], principle: 'Multiply force and speed' },
        wedge: { examples: ['Knife', 'Axe', 'Nail'], principle: 'Split objects apart' },
        screw: { examples: ['Bolt', 'Drill bit', 'Jar lid'], principle: 'Hold things together' }
      },
      activities: ['Machine scavenger hunt', 'Lever experiments', 'Pulley system building']
    }
  },

  technology: {
    digital_citizenship: {
      name: 'Digital Citizenship',
      icon: '💻',
      principles: [
        'Respect others online',
        'Protect personal information',
        'Think before you post',
        'Be kind and helpful',
        'Respect digital property'
      ],
      safety: ['Strong passwords', 'Safe websites', 'Trusted adults', 'Privacy settings'],
      activities: ['Password creation', 'Online safety scenarios', 'Digital footprint discussion']
    },
    coding: {
      name: 'Coding Concepts',
      icon: '👨‍💻',
      concepts: {
        sequence: 'Steps in order',
        loops: 'Repeat actions',
        conditionals: 'If-then decisions',
        variables: 'Store information',
        functions: 'Reusable code blocks'
      },
      activities: ['Unplugged coding games', 'Robot programming', 'Simple app creation']
    }
  }
};

// ===============================================
// CROSS-CURRICULAR PROJECTS
// ===============================================

export const CROSS_CURRICULAR_PROJECTS = [
  {
    id: 'weather_station',
    name: 'Weather Station Project',
    subjects: ['Science', 'Math', 'Technology'],
    description: 'Create and monitor a classroom weather station',
    duration: '2 weeks',
    activities: [
      'Build weather instruments',
      'Collect daily data',
      'Create graphs and charts',
      'Make weather predictions',
      'Present findings'
    ]
  },
  {
    id: 'community_guide',
    name: 'Community Guide Book',
    subjects: ['Social Studies', 'Literacy', 'Art'],
    description: 'Research and create a guide to your local community',
    duration: '3 weeks',
    activities: [
      'Interview community members',
      'Map important locations',
      'Write descriptive articles',
      'Design layout and illustrations',
      'Publish final guide'
    ]
  },
  {
    id: 'garden_project',
    name: 'School Garden Mathematics',
    subjects: ['Math', 'Science', 'Health'],
    description: 'Plan, plant, and maintain a school garden using math concepts',
    duration: 'Full semester',
    activities: [
      'Measure garden plot',
      'Calculate plant spacing',
      'Track growth data',
      'Monitor water usage',
      'Harvest and weigh produce'
    ]
  }
];

// ===============================================
// ASSESSMENT TOOLS
// ===============================================

export const ASSESSMENT_TOOLS = {
  rubrics: {
    writing: {
      name: 'Writing Rubric',
      criteria: [
        { name: 'Ideas & Content', levels: ['Developing', 'Proficient', 'Advanced'] },
        { name: 'Organization', levels: ['Developing', 'Proficient', 'Advanced'] },
        { name: 'Voice & Style', levels: ['Developing', 'Proficient', 'Advanced'] },
        { name: 'Conventions', levels: ['Developing', 'Proficient', 'Advanced'] }
      ]
    },
    presentation: {
      name: 'Presentation Rubric',
      criteria: [
        { name: 'Content Knowledge', levels: ['Needs Work', 'Good', 'Excellent'] },
        { name: 'Organization', levels: ['Needs Work', 'Good', 'Excellent'] },
        { name: 'Delivery', levels: ['Needs Work', 'Good', 'Excellent'] },
        { name: 'Visual Aids', levels: ['Needs Work', 'Good', 'Excellent'] }
      ]
    }
  },
  
  checklists: {
    project_completion: [
      'Planning phase completed',
      'Research conducted',
      'First draft created',
      'Peer review completed',
      'Revisions made',
      'Final product submitted'
    ],
    presentation_prep: [
      'Topic researched thoroughly',
      'Visual aids prepared',
      'Speech practiced',
      'Time limit considered',
      'Questions anticipated'
    ]
  }
};

export default {
  LITERACY_CONTENT,
  MATHEMATICS_CONTENT,
  SCIENCE_CONTENT,
  SOCIAL_STUDIES_CONTENT,
  STEM_CONTENT,
  CROSS_CURRICULAR_PROJECTS,
  ASSESSMENT_TOOLS
};