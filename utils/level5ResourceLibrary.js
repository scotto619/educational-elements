import {
  createListDownloads,
  createWorksheetDownload,
  createPassageDownload,
  createCardKitDownload
} from './spellingResourceHelpers.js';

const LIST_BLUEPRINTS = [
  { key: 'core', title: 'Core Practice List', description: 'Solidify the pattern with high-utility vocabulary.' },
  { key: 'extension', title: 'Extension List', description: 'Blend curriculum vocabulary with cross-curricular language.' },
  { key: 'challenge', title: 'Challenge List', description: 'Stretch students with academic and literary language.' }
];

const buildSpellingLists = (baseId, concept, wordSets) =>
  LIST_BLUEPRINTS.map(({ key, title, description }) => {
    const words = wordSets[key] || [];
    const { download, multiCopyDownloads } = createListDownloads(`${baseId}-${key}`, title, concept, words);
    return {
      id: `${baseId}-${key}`,
      title,
      description,
      words,
      gradient:
        key === 'core'
          ? 'from-emerald-500 to-emerald-600'
          : key === 'extension'
          ? 'from-sky-500 to-sky-600'
          : 'from-purple-500 to-purple-600',
      download,
      multiCopyDownloads
    };
  });

const withIds = (baseId, prefix, items) =>
  items.map((item) => ({
    id: `${baseId}-${prefix}-${item.slug}`,
    ...item
  }));

const buildPassages = (baseId, concept, entries) =>
  entries.map((entry, index) => {
    const focusWords = entry.focusWords || [];
    const text = entry.text.trim();
    return {
      id: `${baseId}-passage-${index + 1}`,
      title: entry.title,
      difficulty: entry.difficulty,
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      download: createPassageDownload({
        id: `${baseId}-passage-${index + 1}`,
        title: entry.title,
        concept,
        difficulty: entry.difficulty,
        text,
        focusWords
      })
    };
  });

const buildWorksheets = (baseId, concept, worksheets) =>
  withIds(baseId, 'worksheet', worksheets).map((worksheet) => {
    const download =
      worksheet.template === 'cards'
        ? createCardKitDownload({
            id: worksheet.id,
            title: worksheet.title,
            concept,
            cards: worksheet.cards,
            columns: worksheet.columns
          })
        : createWorksheetDownload({
            id: worksheet.id,
            title: worksheet.title,
            concept,
            directions: worksheet.directions,
            tasks: worksheet.tasks
          });
    return {
      ...worksheet,
      download
    };
  });

const buildActivities = (baseId, activities) =>
  withIds(baseId, 'activity', activities).map((activity) => ({
    ...activity,
    steps: activity.steps
  }));

const buildTeacherScripts = (baseId, scripts) =>
  withIds(baseId, 'script', scripts).map((script) => ({
    ...script,
    sections: script.sections
  }));

const buildGames = (baseId, games) => withIds(baseId, 'game', games);

const buildDisplays = (baseId, displays) => withIds(baseId, 'display', displays);

const createResourcePack = (baseId, concept, config) => ({
  spellingLists: buildSpellingLists(baseId, concept, config.wordSets),
  passages: buildPassages(baseId, concept, config.passages),
  activities: buildActivities(baseId, config.activities),
  teacherScripts: buildTeacherScripts(baseId, config.teacherScripts),
  games: buildGames(baseId, config.games),
  displays: buildDisplays(baseId, config.displays),
  worksheets: buildWorksheets(baseId, concept, config.worksheets)
});

const listJoin = (words) => {
  if (!words.length) return '';
  if (words.length === 1) return words[0];
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
};

const WORD_SET_LABELS = {
  core: 'Core list',
  extension: 'Extension list',
  challenge: 'Challenge list'
};

const createWordCardSet = (wordSets, footer) =>
  Object.entries(wordSets).flatMap(([group, words]) =>
    words.map((word) => ({
      title: word,
      subtitle: WORD_SET_LABELS[group] || group,
      footer
    }))
  );

const prefixPassages = (meta) => {
  const focusA = meta.wordSets.core.slice(0, 3).concat(meta.wordSets.extension.slice(0, 2));
  const focusB = meta.wordSets.extension.slice(2, 4).concat(meta.wordSets.challenge.slice(0, 2));
  return [
    {
      title: `${meta.prefixLabel} Workshop Narrative`,
      difficulty: 'On-Level',
      focusWords: focusA,
      text: `During the ${meta.scenario.setting}, students ${meta.scenario.onLevelFocus}. They experimented with words such as ${listJoin(
        focusA
      )} to highlight how the prefix ${meta.prefix} means “${meta.meaning}.” Each team created quick sketches and captions to prove the meaning stayed intact while the base word changed.`
    },
    {
      title: `${meta.prefixLabel} Field Report`,
      difficulty: 'Stretch',
      focusWords: focusB,
      text: `Later, the class composed a field report about ${meta.scenario.stretchFocus}. Learners embedded terms like ${listJoin(
        focusB
      )} and annotated how the prefix signalled “${meta.meaning}.” The report concluded with reflections on accurate spelling during advanced writing tasks.`
    }
  ];
};

const prefixActivities = (meta) => [
  {
    slug: 'build-lab',
    title: `${meta.prefixLabel} Build Lab`,
    duration: '20 minutes',
    steps: [
      `Sort base words into categories that pair logically with ${meta.prefix}.`,
      'Construct new words and record definitions that show the combined meaning.',
      'Highlight spelling shifts that occur when the prefix meets the base.',
      'Publish top examples on the collaborative board.'
    ]
  },
  {
    slug: 'writing-challenge',
    title: `${meta.scenario.project} Writing Challenge`,
    duration: '25 minutes',
    steps: [
      'Plan a short informational paragraph using at least six focus words.',
      'Colour-code the prefix, base, and suffix in each word.',
      'Peer review for meaning and spelling accuracy.',
      'Revise to ensure academic tone and clarity.'
    ]
  },
  {
    slug: 'expert-interviews',
    title: `${meta.prefixLabel} Expert Interviews`,
    duration: '15 minutes',
    steps: [
      'Role-play interviews where one student acts as the “prefix expert.”',
      'Interviewers ask how the prefix changes meaning in selected words.',
      'Experts respond using precise vocabulary and provide spelling tips.',
      'Rotate roles to give every learner speaking practice.'
    ]
  }
];

const prefixScripts = (meta) => [
  {
    slug: 'mini-lesson',
    title: `Mini-Lesson: ${meta.prefixLabel}`,
    sections: [
      `Hook with two base words and ask how meaning shifts when ${meta.prefix} is added.`,
      `State the teaching point: “When we add ${meta.prefix}, we signal ${meta.meaning}.”`,
      'Model highlighting the prefix and base in a sentence from mentor text.',
      'Guide students to generate an example and justify the spelling choices.'
    ]
  },
  {
    slug: 'strategy-group',
    title: 'Strategy Group Prompts',
    sections: [
      'Prompt students to identify the base word and discuss if double letters are needed.',
      'Coach learners to use morphology charts or etymology notes for accuracy.',
      'Celebrate correct reasoning and encourage students to record the word family.'
    ]
  }
];

const prefixGames = (meta) => [
  {
    slug: 'dominoes',
    name: `${meta.prefixLabel} Dominoes`,
    description: 'Students connect prefix tiles to base tiles to build accurate words and definitions.',
    materials: ['Prefix tiles', 'Base word tiles', 'Definition cards', 'Game mats']
  },
  {
    slug: 'escape-room',
    name: `${meta.prefixLabel} Escape Room`,
    description: `Teams solve etymology puzzles related to ${meta.scenario.setting} to unlock the next clue using ${meta.prefix} words.`,
    materials: ['Puzzle envelopes', 'UV pens', 'Lock boxes', 'Timer']
  }
];

const prefixDisplays = (meta) => [
  {
    slug: 'morpheme-tree',
    title: `${meta.prefixLabel} Morpheme Tree`,
    description: 'Display a branching tree where each branch shows a new word formed with the prefix and an illustrated definition.'
  },
  {
    slug: 'word-equations',
    title: 'Word Equation Wall',
    description: `Feature large equations such as ${meta.prefix} + base = new word, with colour-coded parts and student-authored examples.`
  }
];

const prefixWorksheets = (meta) => [
  {
    slug: 'word-engineer',
    title: `${meta.prefixLabel} Word Engineer`,
    directions: 'Use the worksheet to engineer precise words that showcase the prefix meaning and maintain accurate spelling.',
    tasks: [
      'Match each base to a prefix and write the combined word.',
      'Define the new word using context clues from the scenario.',
      'Create an original sentence that proves the meaning.'
    ],
    sections: [
      'Combine prefix cards with base words and record meanings.',
      'Analyse spelling changes when the base begins with a similar consonant.',
      'Draft sentences that demonstrate real-world usage.'
    ]
  },
  {
    slug: 'editing-check',
    title: `${meta.prefixLabel} Editing Check`,
    directions: 'Students edit a short paragraph, correcting misspelled prefix words and annotating their reasoning.',
    tasks: [
      'Underline incorrect prefix usage in the sample paragraph.',
      'Rewrite the word correctly and note the base meaning.',
      'Add a margin note explaining the morphological change.'
    ],
    sections: [
      'Spot and correct spelling errors related to the focus prefix.',
      'Highlight the base word within each correction.',
      'Reflect on strategies that ensured accuracy.'
    ]
  },
  {
    slug: 'card-kit',
    title: `${meta.prefixLabel} Card Kit`,
    template: 'cards',
    sections: [
      'Print, cut, and sort the cards to match prefix variations with base words.',
      'Use the deck for Build Lab, Dominoes, or any quick-drill station.',
      'Store cards in labelled bags for easy reuse.'
    ],
    cards: createWordCardSet(meta.wordSets, 'Mark the prefix and highlight the stressed syllable.')
  }
];

const buildPrefixResource = (meta) =>
  createResourcePack(meta.id, meta.concept, {
    wordSets: meta.wordSets,
    passages: prefixPassages(meta),
    activities: prefixActivities(meta),
    teacherScripts: prefixScripts(meta),
    games: prefixGames(meta),
    displays: prefixDisplays(meta),
    worksheets: prefixWorksheets(meta)
  });

const suffixPassages = (meta) => {
  const focusA = meta.wordSets.core.slice(0, 3).concat(meta.wordSets.extension.slice(0, 2));
  const focusB = meta.wordSets.extension.slice(2, 4).concat(meta.wordSets.challenge.slice(0, 2));
  return [
    {
      title: `${meta.suffixLabel} Studio`,
      difficulty: 'On-Level',
      focusWords: focusA,
      text: `Writers collaborated in the ${meta.scenario.setting} to craft ${meta.suffix} words that express ${meta.meaning}. They analysed ${listJoin(
        focusA
      )} and highlighted how the suffix transforms the base into precise academic language.`
    },
    {
      title: `${meta.suffixLabel} Showcase`,
      difficulty: 'Stretch',
      focusWords: focusB,
      text: `During the showcase, teams presented polished paragraphs featuring ${listJoin(
        focusB
      )}. They justified how ${meta.suffix} alters the grammatical role and practised proofreading for accuracy.`
    }
  ];
};

const suffixActivities = (meta) => [
  {
    slug: 'suffix-sort',
    title: `${meta.suffixLabel} Sort & Describe`,
    duration: '20 minutes',
    steps: [
      'Sort base words by part of speech before adding the suffix.',
      `Attach ${meta.suffix} and record how the word class or meaning changes.`,
      'Discuss spelling adjustments required when combining the morphemes.',
      'Summarise findings in notebooks with examples.'
    ]
  },
  {
    slug: 'mentor-text',
    title: 'Mentor Text Mining',
    duration: '25 minutes',
    steps: [
      'Scan mentor texts for suffix examples aligned to the focus.',
      'Collect sentences and annotate base words versus new forms.',
      'Compose a class anchor paragraph using the collected examples.',
      'Reflect on tone and meaning shifts created by the suffix.'
    ]
  },
  {
    slug: 'design-lab',
    title: `${meta.scenario.project} Design Lab`,
    duration: '15 minutes',
    steps: [
      'Create posters or slide decks demonstrating three favourite suffix words.',
      'Include definitions, illustrations, and usage tips.',
      'Set up a gallery walk for peer feedback.',
      'Revise displays based on suggestions.'
    ]
  }
];

const suffixScripts = (meta) => [
  {
    slug: 'focus-lesson',
    title: `Focus Lesson: ${meta.suffixLabel}`,
    sections: [
      `Hook by presenting a base word and asking how ${meta.suffix} might transform it.`,
      `State the teaching point: “Adding ${meta.suffix} creates words that mean ${meta.meaning}.”`,
      'Model building two words and annotating spelling shifts.',
      'Invite students to co-construct a third example with precise definitions.'
    ]
  },
  {
    slug: 'application-prompts',
    title: 'Application Prompts',
    sections: [
      'Encourage learners to use morphology charts when proofreading writing.',
      'Ask students to underline the base word and circle the suffix in published texts.',
      'Provide sentence stems that integrate the new vocabulary during discussions.'
    ]
  }
];

const suffixGames = (meta) => [
  {
    slug: 'build-and-bid',
    name: `${meta.suffixLabel} Build & Bid`,
    description: 'Teams “bid” on base words and compete to create the strongest new word using the suffix with accurate definitions.',
    materials: ['Base word cards', 'Token chips', 'Definition boards']
  },
  {
    slug: 'suffix-spin',
    name: `${meta.suffixLabel} Spinner`,
    description: 'Spin to reveal a base word, add the suffix, and earn points by using the new word in a context-rich sentence.',
    materials: ['Spinner board', 'Base word deck', 'Score sheets']
  }
];

const suffixDisplays = (meta) => [
  {
    slug: 'suffix-spectrum',
    title: `${meta.suffixLabel} Spectrum`,
    description: 'Display a gradient chart showing base words on one side and transformed words on the other with definitions.'
  },
  {
    slug: 'word-families',
    title: 'Word Family Showcase',
    description: 'Create family trees that map the base to multiple suffix combinations using colour-coded leaves.'
  }
];

const suffixWorksheets = (meta) => [
  {
    slug: 'precision-builder',
    title: `${meta.suffixLabel} Precision Builder`,
    directions: 'Construct words with the target suffix and explain how meaning and grammar change.',
    tasks: [
      'Write the base word and the new word side by side.',
      'Identify the part of speech before and after adding the suffix.',
      'Compose a sentence using the new word accurately.'
    ],
    sections: [
      'Base-to-suffix conversion table.',
      'Grammar shift checklist.',
      'Sentence practice lines with feedback column.'
    ]
  },
  {
    slug: 'editing-task',
    title: `${meta.suffixLabel} Editing Task`,
    directions: 'Edit a paragraph that misuses suffix endings, then rewrite it with accurate spelling and meaning.',
    tasks: [
      'Circle incorrect suffix usage.',
      'Rewrite each word correctly and explain the change.',
      'Reflect on strategies that ensured accuracy.'
    ],
    sections: [
      'Editing passage with margin notes.',
      'Correction table for before-and-after forms.',
      'Reflection prompts for writers.'
    ]
  },
  {
    slug: 'card-kit',
    title: `${meta.suffixLabel} Card Kit`,
    template: 'cards',
    sections: [
      'Print and cut the cards to support Sort & Describe or Build & Bid.',
      'Include the deck in literacy centres for quick revision.',
      'Invite students to write definitions or part-of-speech notes on the back.'
    ],
    cards: createWordCardSet(meta.wordSets, 'Underline the suffix when you play.')
  }
];

const buildSuffixResource = (meta) =>
  createResourcePack(meta.id, meta.concept, {
    wordSets: meta.wordSets,
    passages: suffixPassages(meta),
    activities: suffixActivities(meta),
    teacherScripts: suffixScripts(meta),
    games: suffixGames(meta),
    displays: suffixDisplays(meta),
    worksheets: suffixWorksheets(meta)
  });

const rootPassages = (meta) => {
  const focusA = meta.wordSets.core.slice(0, 3).concat(meta.wordSets.extension.slice(0, 2));
  const focusB = meta.wordSets.extension.slice(2, 4).concat(meta.wordSets.challenge.slice(0, 2));
  return [
    {
      title: `${meta.rootLabel} Discovery`,
      difficulty: 'On-Level',
      focusWords: focusA,
      text: `Learners explored how the root “${meta.root}” means ${meta.meaning} by curating artefacts in the ${meta.scenario.setting}. They used ${listJoin(
        focusA
      )} to narrate the exploration and emphasised accurate spelling through morphology cues.`
    },
    {
      title: `${meta.rootLabel} Expedition`,
      difficulty: 'Stretch',
      focusWords: focusB,
      text: `Teams produced a multimedia report highlighting ${listJoin(
        focusB
      )}. Each section connected the root meaning to scientific or historical contexts while modelling precise spelling strategies.`
    }
  ];
};

const rootActivities = (meta) => [
  {
    slug: 'root-gallery',
    title: `${meta.rootLabel} Gallery Walk`,
    duration: '20 minutes',
    steps: [
      'Create mini posters that explain the root meaning and provide examples.',
      'Include visual diagrams or timelines to embed the concept.',
      'Lead a gallery walk where peers add sticky-note compliments.',
      'Collect posters into a class reference book.'
    ]
  },
  {
    slug: 'word-journal',
    title: 'Root Word Journal',
    duration: '25 minutes',
    steps: [
      'Maintain a journal entry for each new word with the root.',
      'Record definition, origin, and a sentence from real reading.',
      'Sketch a visual reminder for the root meaning.',
      'Share entries with a partner for accountability.'
    ]
  },
  {
    slug: 'stem-challenge',
    title: `${meta.scenario.project} Challenge`,
    duration: '15 minutes',
    steps: [
      'Apply the root meaning to a science or humanities mini-task.',
      'Use targeted vocabulary in oral presentations.',
      'Collect evidence of accurate spelling in student work samples.',
      'Celebrate mastery with digital badges.'
    ]
  }
];

const rootScripts = (meta) => [
  {
    slug: 'root-lesson',
    title: `Lesson: Understanding ${meta.rootLabel}`,
    sections: [
      `Introduce the root ${meta.root} and unpack its meaning ${meta.meaning}.`,
      'Demonstrate how to break a word into prefix, root, and suffix.',
      'Model using a morphology notebook to track examples.',
      'Guide students to generate a new word and discuss spelling implications.'
    ]
  },
  {
    slug: 'coaching-cues',
    title: 'Coaching Cues',
    sections: [
      'Prompt: “Which part of the word carries the meaning?”',
      'Ask: “How does the root connect to the content we are studying?”',
      'Encourage: “Record this in your notebook with a sketch or symbol.”'
    ]
  }
];

const rootGames = (meta) => [
  {
    slug: 'root-match',
    name: `${meta.rootLabel} Match-Up`,
    description: 'Match base words containing the root to definitions or images in a timed challenge.',
    materials: ['Root cards', 'Definition cards', 'Timer']
  },
  {
    slug: 'story-cards',
    name: `${meta.rootLabel} Story Cards`,
    description: 'Draw cards to build a collaborative story that must use root-based vocabulary accurately.',
    materials: ['Story starter cards', 'Root vocabulary deck', 'Recording sheets']
  }
];

const rootDisplays = (meta) => [
  {
    slug: 'root-map',
    title: `${meta.rootLabel} Map`,
    description: 'Create a visual map linking the root to subject areas, notable quotes, and real-world applications.'
  },
  {
    slug: 'root-ladder',
    title: 'Morphology Ladder',
    description: 'Display a ladder showing how the root connects to increasingly complex vocabulary.'
  }
];

const rootWorksheets = (meta) => [
  {
    slug: 'root-research',
    title: `${meta.rootLabel} Research Sheet`,
    directions: 'Investigate the root, collect examples, and explain how it contributes to meaning.',
    tasks: [
      'Define the root and note its origin.',
      'List examples from literature, science, and everyday life.',
      'Compose a summary paragraph using three root-based words.'
    ],
    sections: [
      'Root definition box with etymology.',
      'Example table sorted by subject area.',
      'Paragraph frame for synthesis.'
    ]
  },
  {
    slug: 'application-sheet',
    title: `${meta.rootLabel} Application Sheet`,
    directions: 'Solve real-world problems or riddles that require knowledge of the root.',
    tasks: [
      'Match vocabulary to context clues.',
      'Explain why the root helps determine meaning.',
      'Create a quiz question for a peer using the root.'
    ],
    sections: [
      'Contextual questions with space for written responses.',
      'Reflection prompts about learning strategies.',
      'Peer question builder.'
    ]
  },
  {
    slug: 'card-kit',
    title: `${meta.rootLabel} Card Kit`,
    template: 'cards',
    sections: [
      'Cut out the cards to support Root Match-Up, Story Cards, or quick review stations.',
      'Ask students to add sketches or example sentences on the reverse side.',
      'Keep sets clipped together for easy differentiation.'
    ],
    cards: createWordCardSet(meta.wordSets, 'Highlight the root letters before you play.')
  }
];

const buildRootResource = (meta) =>
  createResourcePack(meta.id, meta.concept, {
    wordSets: meta.wordSets,
    passages: rootPassages(meta),
    activities: rootActivities(meta),
    teacherScripts: rootScripts(meta),
    games: rootGames(meta),
    displays: rootDisplays(meta),
    worksheets: rootWorksheets(meta)
  });

const stressShiftWordSets = {
  core: [
    'photograph',
    'photographer',
    'photography',
    'academy',
    'academic',
    'economy',
    'economic',
    'economics',
    'athlete',
    'athletic'
  ],
  extension: [
    'analysis',
    'analytical',
    'history',
    'historic',
    'historical',
    'medicine',
    'medical',
    'politics',
    'political',
    'politician'
  ],
  challenge: [
    'democracy',
    'democratic',
    'democratise',
    'geography',
    'geographic',
    'geographical',
    'symmetry',
    'symmetric',
    'parenthesis',
    'parenthetical'
  ]
};

const schwaWordSets = {
  core: [
    'separate',
    'different',
    'family',
    'camera',
    'memory',
    'general',
    'animal',
    'average',
    'history',
    'favourite'
  ],
  extension: [
    'literature',
    'temperature',
    'vegetable',
    'comfortable',
    'opera',
    'chocolate',
    'secretary',
    'library',
    'ordinary',
    'calendar'
  ],
  challenge: [
    'extraordinary',
    'parliament',
    'administrator',
    'territory',
    'dictionary',
    'commentary',
    'necessary',
    'complimentary',
    'solitary',
    'explanatory'
  ]
};

const assimilatedPrefixWordSets = {
  core: [
    'adapt',
    'adjoin',
    'accompany',
    'accuse',
    'affect',
    'affirm',
    'aggressive',
    'alliterate',
    'appear',
    'attend'
  ],
  extension: [
    'accelerate',
    'accomplish',
    'affiliation',
    'aggregate',
    'allocate',
    'apprehend',
    'assimilate',
    'attest',
    'adjacent',
    'adjustment'
  ],
  challenge: [
    'acclimatisation',
    'afforestation',
    'aggrandisement',
    'appellation',
    'acquiesce',
    'approximate',
    'arrangement',
    'assortment',
    'attainment',
    'adjudicate'
  ]
};

const borrowedWordSets = {
  core: [
    'ballet',
    'debris',
    'regime',
    'bouquet',
    'crochet',
    'cuisine',
    'genre',
    'plaque',
    'champagne',
    'facade'
  ],
  extension: [
    'chandelier',
    'lingerie',
    'camouflage',
    'croissant',
    'fiance',
    'chauffeur',
    'pirouette',
    'souvenir',
    'timbre',
    'boutique'
  ],
  challenge: [
    'charcuterie',
    'sommelier',
    'concierge',
    'bourgeois',
    'coiffure',
    'coterie',
    'entrepreneur',
    'ensuite',
    'repertoire',
    'ricochet'
  ]
};

const phonologyLevel5 = {
  'analyse-stress-shifts-in-related-word-families-e-g-photograph-photography': createResourcePack(
    'analyse-stress-shifts-in-related-word-families-e-g-photograph-photography',
    'Word Family Stress Shifts',
    {
      wordSets: stressShiftWordSets,
      passages: [
        {
          title: 'Talent Show Spotlight',
          difficulty: 'On-Level',
          focusWords: ['photograph', 'photographer', 'academic', 'economic'],
          text: `During the school talent show, the media crew snapped each photograph and chatted with the photographer about the best angles. Backstage, students created academic shout-outs for clubs raising money for economic causes. They clapped out the syllables in every focus word and circled the syllable that suddenly carried the stress.`
        },
        {
          title: 'Student News Studio',
          difficulty: 'Stretch',
          focusWords: ['analysis', 'analytical', 'democracy', 'democratic'],
          text: `For the weekly student news video, reporters filmed an analysis of the upcoming student council election and compared it to an analytical sports segment. Presenters rehearsed democracy and democratic in front of the green screen, marking the syllable shift so the audience could hear the difference.`
        }
      ],
      activities: [
        {
          slug: 'stress-mapping-lab',
          title: 'Stress Mapping Lab',
          duration: '20 minutes',
          steps: [
            'Use coloured dots to mark the stressed syllable in each focus word.',
            'Record how suffixes like -ic and -ical shift the emphasis.',
            'Group words by shared stress pattern changes.',
            'Share generalisations with the class anchor chart.'
          ]
        },
        {
          slug: 'podcast-producers',
          title: 'Podcast Producers',
          duration: '25 minutes',
          steps: [
            'Write a short script that pairs base words with their derived forms.',
            'Highlight the syllable that becomes stressed in each variation.',
            'Record or perform the script, exaggerating the stress difference.',
            'Reflect on how stress affects intelligibility for listeners.'
          ]
        },
        {
          slug: 'debate-draft',
          title: 'Debate Draft Workshop',
          duration: '15 minutes',
          steps: [
            'Compose debate cue cards using at least six focus words.',
            'Mark stress patterns with stress marks and arrows.',
            'Practise reading cards aloud with a partner for feedback on emphasis.',
            'Revise cards to ensure the stress guides the audience.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'mini-lesson',
          title: 'Mini-Lesson: Hearing Stress Shifts',
          sections: [
            'Display photograph and photography. Ask students to clap the syllables and notice which is stronger.',
            'Explain that suffixes like -ic and -ical often move the stress toward the end of the word.',
            'Model annotating academic and economic with stress marks and syllable breaks.',
            'Invite students to predict stress changes before revealing additional examples.'
          ]
        },
        {
          slug: 'guided-practice',
          title: 'Guided Practice Prompts',
          sections: [
            'Coach students to use mirrors or hand motions to emphasise stressed syllables.',
            'Provide immediate feedback when pronunciation hides the stress shift.',
            'Encourage learners to connect stress movement to meaning and part of speech changes.'
          ]
        }
      ],
      games: [
        {
          slug: 'stress-hop',
          name: 'Stress Hopscotch',
          description: 'Learners hop to the syllable squares that should receive stress, earning points for accurate matches and explanations.',
          materials: ['Chalked hopscotch grid or floor tiles', 'Word cards', 'Timer']
        },
        {
          slug: 'intonation-challenge',
          name: 'Intonation Challenge',
          description: 'Teams race to read sentences using correct stress for derived forms, collecting challenge badges for precision.',
          materials: ['Sentence strips', 'Recording devices or tablets', 'Badge stickers']
        }
      ],
      displays: [
        {
          slug: 'stress-wave',
          title: 'Stress Wave Wall',
          description: 'Create wave-style posters showing the rise and fall of stress for word families, with arrows marking syllable emphasis.'
        },
        {
          slug: 'family-tree',
          title: 'Word Family Stress Tree',
          description: 'Design a tree that branches from base words to derived forms with icons identifying the stressed syllable.'
        }
      ],
      worksheets: [
        {
          slug: 'stress-investigation',
          title: 'Stress Shift Investigation Mat',
          directions: 'Analyse how stress moves within related words and document the spelling-stress connection.',
          tasks: [
            'Record syllable counts and stress placement for each word pair.',
            'Explain in writing how the suffix influences the stress.',
            'Compose a sentence using one pair that showcases the new stress.'
          ],
          sections: [
            'Mark primary stress using a stress symbol in the syllable boxes.',
            'Identify the suffix or affix responsible for the change.',
            'Summarise two observations about how stress shifts across the list.'
          ]
        },
        {
          slug: 'family-cards',
          title: 'Word Family Sort Cards',
          directions: 'Cut and sort cards into base, derived, and stress pattern categories for collaborative practice.',
          tasks: [
            'Match each base word to two related forms.',
            'Highlight the stressed syllable on every card.',
            'Reflect on which endings consistently move the stress.'
          ],
          sections: [
            'Base Word Bank',
            'Derived Forms',
            'Stress Shift Notes'
          ],
          template: 'cards',
          cards: createWordCardSet(stressShiftWordSets, 'Add stress marks before playing the games.')
        }
      ]
    }
  ),
  'recognise-schwa-in-multisyllabic-words-e-g-separate-ordinary': createResourcePack(
    'recognise-schwa-in-multisyllabic-words-e-g-separate-ordinary',
    'Sneaky Schwa Spotters',
    {
      wordSets: schwaWordSets,
      passages: [
        {
          title: 'Assembly Announcements',
          difficulty: 'On-Level',
          focusWords: ['separate', 'different', 'library', 'ordinary'],
          text: `During assembly practice, announcers prepared separate scripts for the library makeover and reminded families about ordinary routines. They highlighted the sneaky schwa syllables in different and library, tapping the beat so their voices stayed clear even when the vowel sound softened.`
        },
        {
          title: 'Science Expo Reflection',
          difficulty: 'Stretch',
          focusWords: ['extraordinary', 'administrator', 'territory', 'dictionary'],
          text: `After an extraordinary science expo, the student administrator asked teams to write reflections about discoveries from each territory. Writers flipped through the class dictionary to check spellings that hide a schwa and practised reading aloud so every relaxed vowel still sounded confident.`
        }
      ],
      activities: [
        {
          slug: 'schwa-hunt',
          title: 'Schwa Sound Hunt',
          duration: '20 minutes',
          steps: [
            'Search classroom texts for multisyllabic words with reduced vowel sounds.',
            'Record each find on sticky notes and label the schwa syllable.',
            'Sort notes by spelling pattern on a collaborative board.',
            'Summarise which spellings appear most frequently.'
          ]
        },
        {
          slug: 'newsroom',
          title: 'Pronunciation Newsroom',
          duration: '25 minutes',
          steps: [
            'Write a newsroom bulletin using at least eight focus words.',
            'Annotate scripts with phonetic spellings to support accurate pronunciation.',
            'Record the bulletin or perform it live for a peer group.',
            'Invite feedback on clarity and schwa awareness.'
          ]
        },
        {
          slug: 'studio-articulation',
          title: 'Articulation Studio',
          duration: '15 minutes',
          steps: [
            'Practise reading tongue twisters built from focus words.',
            'Use hand signals to show when the schwa occurs.',
            'Coach a partner to keep the vowel relaxed but audible.',
            'Reflect on strategies that support confident spelling.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'launch-lesson',
          title: 'Launch Lesson: Spotting Schwa',
          sections: [
            'Write separate, camera, and animal on the board. Ask which syllable sounds relaxed.',
            'Introduce the term schwa and note that it often hides in unstressed syllables.',
            'Model using a dictionary entry to check syllable stress and schwa symbols.',
            'Guide students through marking library and comfortable with schwa brackets.'
          ]
        },
        {
          slug: 'coaching-notes',
          title: 'Coaching Notes',
          sections: [
            'Prompt: “Which syllable carries the main stress? How does that affect other vowels?”',
            'Encourage students to stretch the word slowly before easing into the schwa.',
            'Celebrate students who justify spellings with both phonology and morphology.'
          ]
        }
      ],
      games: [
        {
          slug: 'schwa-bingo',
          name: 'Schwa Bingo',
          description: 'Players cover words that feature the announced schwa spelling pattern and explain the unstressed syllable to win.',
          materials: ['Printable bingo boards', 'Calling cards by spelling pattern', 'Counters or markers']
        },
        {
          slug: 'studio-dub',
          name: 'Studio Dub',
          description: 'Teams dub over a short video clip, scoring points for accurate schwa pronunciation and expressive performance.',
          materials: ['Short muted video clip', 'Script templates', 'Microphones or tablets']
        }
      ],
      displays: [
        {
          slug: 'schwa-spectrum',
          title: 'Schwa Spectrum Poster',
          description: 'Display a gradient chart showing common spellings of schwa with example words and stress markings.'
        },
        {
          slug: 'listening-line',
          title: 'Listening Line',
          description: 'Arrange a timeline of student-recorded words illustrating how schwa appears in early, middle, and final syllables.'
        }
      ],
      worksheets: [
        {
          slug: 'schwa-journal',
          title: 'Schwa Detective Journal',
          directions: 'Document schwa discoveries from reading, listening, and speaking tasks.',
          tasks: [
            'List five words that include a schwa and identify the syllable.',
            'Explain which spelling pattern represents the schwa in each word.',
            'Write a reflection about how schwa knowledge supports spelling.'
          ],
          sections: [
            'Word & Syllable Chart',
            'Pattern Analysis',
            'Reflection Paragraph'
          ]
        },
        {
          slug: 'pronunciation-path',
          title: 'Pronunciation Path Worksheet',
          directions: 'Follow the pronunciation path by mapping stress and schwa sounds through connected words.',
          tasks: [
            'Trace the path from base word to derived forms, marking schwa syllables.',
            'Circle any syllables that change from a full vowel to a schwa.',
            'Compose a summary sentence describing the pattern you noticed.'
          ],
          sections: [
            'Base Word Starting Point',
            'Derived Forms Trail',
            'Summary Station'
          ]
        },
        {
          slug: 'card-kit',
          title: 'Schwa Focus Card Kit',
          template: 'cards',
          sections: [
            'Print and use the cards for Schwa Bingo, Pronunciation Newsroom, or small-group warm-ups.',
            'Ask students to note the schwa syllable on each card before playing.',
            'Store sets in labelled envelopes for quick revision.'
          ],
          cards: createWordCardSet(schwaWordSets, 'Underline the schwa syllable and rehearse the word aloud.')
        }
      ]
    }
  ),
  'investigate-assimilated-prefixes-and-resulting-sound-changes-e-g-affix-illegal': createResourcePack(
    'investigate-assimilated-prefixes-and-resulting-sound-changes-e-g-affix-illegal',
    'Prefix Sound Switches',
    {
      wordSets: assimilatedPrefixWordSets,
      passages: [
        {
          title: 'Robotics Design Brief',
          difficulty: 'On-Level',
          focusWords: ['adapt', 'accompany', 'aggregate', 'allocate'],
          text: `During robotics club, teams adapted last week’s robot and accompanied mentors on a design walk-through. They aggregated testing data and allocated extra batteries, pointing out how ad- becomes ac- or al- when the next sound changes.`
        },
        {
          title: 'Mystery Writers Room',
          difficulty: 'Stretch',
          focusWords: ['acclimatisation', 'aggrandisement', 'appellation', 'adjudicate'],
          text: `In the mystery writers room, authors drafted a case about acclimatisation at a wildlife park and the aggrandisement of a villain’s grand appellation. The editor explained how judges adjudicate each clue, spotlighting prefixes that shift to match the consonant that follows.`
        }
      ],
      activities: [
        {
          slug: 'prefix-lab',
          title: 'Prefix Pronunciation Lab',
          duration: '20 minutes',
          steps: [
            'Sort word cards by the consonant that follows the prefix.',
            'Pronounce each category aloud, noting how the prefix sound changes.',
            'Annotate the prefix to show doubled letters created by assimilation.',
            'Record generalisations in a lab notebook.'
          ]
        },
        {
          slug: 'morphology-makers',
          title: 'Morphology Makers',
          duration: '25 minutes',
          steps: [
            'Build new sentences using assimilated prefix words in context.',
            'Highlight the prefix and base in contrasting colours.',
            'Explain the meaning of each combination to a partner.',
            'Compile examples into a class reference guide.'
          ]
        },
        {
          slug: 'courtroom-roleplay',
          title: 'Courtroom Role-Play',
          duration: '15 minutes',
          steps: [
            'Stage a mock hearing where “word witnesses” explain their prefixes.',
            'Attorneys question why the prefix changed its spelling or sound.',
            'Judges summarise the rule demonstrated by each example.',
            'Rotate roles to deepen understanding.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'prefix-lesson',
          title: 'Mini-Lesson: Assimilated Prefixes',
          sections: [
            'Write adjoin, accuse, and approve. Ask students to predict why the prefix looks different each time.',
            'Explain that the /d/ sound adjusts to match the next consonant, making pronunciation smoother.',
            'Demonstrate with a mouth diagram showing articulator movement.',
            'Guide practice with additional examples such as affirm and alliterate.'
          ]
        },
        {
          slug: 'conference-menu',
          title: 'Conference Menu',
          sections: [
            'Ask: “What base word do you hear after the prefix? How does that guide the spelling?”',
            'Prompt students to identify whether the prefix doubled the next consonant.',
            'Encourage learners to create a memory trick connecting sound change to meaning.'
          ]
        }
      ],
      games: [
        {
          slug: 'prefix-pursuit',
          name: 'Prefix Pursuit',
          description: 'Race to collect cards that show each version of the assimilated prefix family, explaining the sound shift to keep the card.',
          materials: ['Prefix family card sets', 'Game board with prefix pathways', 'Sand timer']
        },
        {
          slug: 'decode-dash',
          name: 'Decode Dash',
          description: 'Teams decode sentences containing assimilated prefixes and earn points for identifying both pronunciation and meaning changes.',
          materials: ['Sentence decks', 'Response whiteboards', 'Score tracker']
        }
      ],
      displays: [
        {
          slug: 'prefix-subway',
          title: 'Prefix Subway Map',
          description: 'Design a transit map where each line represents a prefix variant and stations showcase example words.'
        },
        {
          slug: 'sound-switch-chart',
          title: 'Sound Switch Chart',
          description: 'Create a classroom chart illustrating how ad- shifts to ac-, af-, ag-, al-, ap-, ar-, as-, and at- with mouth position diagrams.'
        }
      ],
      worksheets: [
        {
          slug: 'prefix-investigation',
          title: 'Assimilation Investigation Sheet',
          directions: 'Investigate how the prefix spelling changes to match the base word that follows.',
          tasks: [
            'List the base word and the assimilated prefix form.',
            'Describe the sound produced at the boundary of prefix and base.',
            'Write an original sentence using each example.'
          ],
          sections: [
            'Prefix & Base Table',
            'Sound Observation Notes',
            'Sentence Studio'
          ]
        },
        {
          slug: 'court-report',
          title: 'Word Court Report',
          directions: 'Complete a courtroom-style report analysing why the prefix altered its spelling.',
          tasks: [
            'State the “case” by naming the word and its meaning.',
            'Present evidence describing the assimilation.',
            'Deliver a verdict summarising the spelling rule.'
          ],
          sections: [
            'Case File',
            'Evidence Log',
            'Verdict Summary'
          ]
        },
        {
          slug: 'card-kit',
          title: 'Assimilated Prefix Card Kit',
          template: 'cards',
          sections: [
            'Use the cards for Prefix Pursuit, Decode Dash, or quick warm-ups.',
            'Highlight the original prefix and the assimilated form on each card.',
            'Sort cards by the consonant that triggered the sound switch.'
          ],
          cards: createWordCardSet(assimilatedPrefixWordSets, 'Mark the base word and note how the prefix changed.')
        }
      ]
    }
  ),
  'explore-borrowed-words-with-unique-phoneme-grapheme-patterns-e-g-ballet-debris': createResourcePack(
    'explore-borrowed-words-with-unique-phoneme-grapheme-patterns-e-g-ballet-debris',
    'Borrowed Word Spotlight',
    {
      wordSets: borrowedWordSets,
      passages: [
        {
          title: 'Culture Fair Sneak Peek',
          difficulty: 'On-Level',
          focusWords: ['ballet', 'bouquet', 'cuisine', 'chandelier'],
          text: `The culture fair crew rehearsed a ballet routine under a sparkling chandelier and prepared a bouquet bar with favourite cuisine samples. They practised the French-inspired pronunciations while double-checking the unusual spellings for the program.`
        },
        {
          title: 'Global Food Review',
          difficulty: 'Stretch',
          focusWords: ['charcuterie', 'concierge', 'entrepreneur', 'repertoire'],
          text: `For a global food review vlog, students interviewed a concierge who guided young entrepreneurs through a charcuterie workshop before a music repertoire showcase. The script highlighted how the spellings honour the word’s original language and give clues about pronunciation.`
        }
      ],
      activities: [
        {
          slug: 'loanword-gallery',
          title: 'Loanword Gallery Walk',
          duration: '20 minutes',
          steps: [
            'Create posters that highlight origin, pronunciation, and meaning for each word.',
            'Display posters around the room and take notes on new pronunciation patterns.',
            'Identify shared spelling endings that signal a borrowed word.',
            'Discuss how origin guides pronunciation choices.'
          ]
        },
        {
          slug: 'chef-challenge',
          title: 'Culinary Word Challenge',
          duration: '25 minutes',
          steps: [
            'Design a menu or event invitation using loanwords accurately.',
            'Provide pronunciation keys beside each featured term.',
            'Share menus with classmates and offer peer feedback.',
            'Revise to polish both spelling and presentation.'
          ]
        },
        {
          slug: 'origin-studio',
          title: 'Origin Story Studio',
          duration: '15 minutes',
          steps: [
            'Research the language of origin for three focus words.',
            'Record a short audio story explaining how the word entered English.',
            'Include pronunciation tips that reflect the original language.',
            'Upload stories to the class digital map of borrowed words.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'loanword-lesson',
          title: 'Mini-Lesson: Borrowed Spellings',
          sections: [
            'Present ballet, debris, and genre. Ask: “What do you notice about the final letters and the sounds we say?”',
            'Explain that many cultural words keep their original spellings to honour the source language.',
            'Model looking up pronunciation guides in an etymology dictionary.',
            'Guide students to annotate words with accent marks or phonetic clues.'
          ]
        },
        {
          slug: 'guided-reading',
          title: 'Guided Reading Prompts',
          sections: [
            'Encourage readers to pause and decode using syllable chunks informed by the origin.',
            'Ask students to compare the English spelling with the original language pronunciation.',
            'Celebrate when students link spelling, meaning, and cultural context.'
          ]
        }
      ],
      games: [
        {
          slug: 'accent-adventure',
          name: 'Accent Adventure',
          description: 'Spin a globe to land on a language family, then pronounce and define the matching borrowed word to earn passport stamps.',
          materials: ['Game globe spinner', 'Passport stamp cards', 'Word deck organised by origin']
        },
        {
          slug: 'loanword-lotto',
          name: 'Loanword Lotto',
          description: 'Match pronunciation audio clips to the correct spellings on lotto boards, gaining bonus points for origin facts.',
          materials: ['Audio clips or QR codes', 'Lotto boards', 'Counters']
        }
      ],
      displays: [
        {
          slug: 'world-map',
          title: 'World Word Map',
          description: 'Pin borrowed words on a world map with strings connecting to pronunciation tips and cultural facts.'
        },
        {
          slug: 'pronunciation-parade',
          title: 'Pronunciation Parade',
          description: 'Create banner strips that show phonetic spellings under the traditional orthography for each focus word.'
        }
      ],
      worksheets: [
        {
          slug: 'loanword-profile',
          title: 'Loanword Profile Page',
          directions: 'Profile each borrowed word using research-based notes on meaning, origin, and pronunciation.',
          tasks: [
            'Complete a fact box with origin, part of speech, and definition.',
            'Transcribe the pronunciation using phonetic spelling or syllable cues.',
            'Illustrate or describe a real-world context for the word.'
          ],
          sections: [
            'Fact Box',
            'Pronunciation Guide',
            'Context Snapshot'
          ]
        },
        {
          slug: 'etymology-tracker',
          title: 'Etymology Tracker',
          directions: 'Track how borrowed words retain unique spellings across different texts.',
          tasks: [
            'Log where you encountered each word (book, video, article).',
            'Note any alternate spellings or accents found.',
            'Summarise how recognising the origin supports accurate spelling.'
          ],
          sections: [
            'Source Log',
            'Spelling Variations',
            'Reflection Notes'
          ]
        },
        {
          slug: 'card-kit',
          title: 'Borrowed Word Card Kit',
          template: 'cards',
          sections: [
            'Use the cards during Loanword Gallery, Culinary Word Challenge, or accent games.',
            'Add pronunciation hints or origin icons to the back of each card.',
            'Sort cards by language family to notice spelling clues.'
          ],
          cards: createWordCardSet(borrowedWordSets, 'Note the origin and rehearse the pronunciation as you play.')
        }
      ]
    }
  )
};

const spellingPatternsLevel5 = {
  'spell-less-familiar-words-that-share-common-letter-patterns-but-have-different-p': createResourcePack(
    'spell-less-familiar-words-that-share-common-letter-patterns-but-have-different-p',
    'Spell less familiar words that share common letter patterns but have different pronunciations',
    {
      wordSets: {
        core: ['courage', 'journey', 'nourish', 'tourist', 'flourish', 'famous', 'generous', 'courteous', 'glamour', 'honour'],
        extension: [
          'curiosity',
          'detour',
          'gorgeous',
          'vigorous',
          'endeavour',
          'courier',
          'contour',
          'armoury',
          'rumour',
          'odyssey'
        ],
        challenge: [
          'ambiguous',
          'magnanimous',
          'contiguous',
          'sumptuous',
          'illustrious',
          'adventurous',
          'ubiquitous',
          'cantankerous',
          'plenteous',
          'scrupulous'
        ]
      },
      passages: [
        {
          title: 'Festival of Words',
          difficulty: 'On-Level',
          focusWords: ['courage', 'journey', 'tourist', 'curiosity'],
          text: `Our Level 5 writers curated a festival guide that celebrated how one letter pattern can make multiple sounds. The
students described the courage it took for a young tourist to begin a journey through the old armoury, noticing how curiosity and courtesy kept the group united. They highlighted how the flourish of a parade can sound different to each listener, even though the words share the same spelling pattern.`
        },
        {
          title: 'Audio Tour Transcript',
          difficulty: 'Stretch',
          focusWords: ['vigorous', 'endeavour', 'contour', 'gorgeous'],
          text: `During a museum audio tour, the narrator invited visitors to enjoy a vigorous endeavour tracing the contour of historic tapestries. Learners analysed why gorgeous and courageous share letters yet offer contrasting vowel sounds. The transcript encouraged students to annotate each example and justify the pronunciation with syllable knowledge.`
        }
      ],
      activities: [
        {
          slug: 'contrast-chart',
          title: 'Pronunciation Detective Lab',
          duration: '20 minutes',
          steps: [
            'Sort focus words by pronunciation while keeping the shared pattern visible.',
            'Annotate syllables and mark the vowel sounds that shift.',
            'Record generalisations about when each sound is likely to appear.',
            'Present findings using mini whiteboards and receive peer feedback.'
          ]
        },
        {
          slug: 'research-rounds',
          title: 'Word Origin Research Rounds',
          duration: '25 minutes',
          steps: [
            'Assign teams to investigate origins of tricky pattern words using class dictionaries.',
            'Compile etymology notes and connect origin to pronunciation shifts.',
            'Create a short video or slideshow summarising discoveries.',
            'Upload resources to the class spelling hub for future reference.'
          ]
        },
        {
          slug: 'writing-studio',
          title: 'Expressive Writing Studio',
          duration: '20 minutes',
          steps: [
            'Write a descriptive paragraph that includes at least six focus words.',
            'Highlight the letter pattern each time it appears.',
            'Underline the sound you expected and note any surprises.',
            'Swap notebooks with a partner for peer review.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'introduction',
          title: 'Mini-Lesson: Flexible Letter Patterns',
          sections: [
            'Display courage, journey, and tourist. Ask: “What do you notice about the shared letters and the changing sounds?”',
            'Explain that many patterns were borrowed from French and Latin, so pronunciation depends on origin.',
            'Model how to use syllable types and word origin notes to predict the sound.',
            'Guide students through analysing flourish and courteous, prompting justification of each vowel sound.'
          ]
        },
        {
          slug: 'conferring',
          title: 'Conference Prompts',
          sections: [
            'If a student is unsure, prompt: “Which syllable is stressed? How might that change the vowel sound?”',
            'Encourage use of origin charts: “Does this word come from French? If so, which sound pattern fits best?”',
            'Close by celebrating accurate reasoning rather than only correct spelling.'
          ]
        }
      ],
      games: [
        {
          slug: 'sound-sprint',
          name: 'Sound Sprint Relay',
          description: 'Teams race to place word cards under the correct pronunciation heading, then justify the placement to earn points.',
          materials: ['Pronunciation header cards', 'Word cards', 'Recording sheets', 'Timers']
        },
        {
          slug: 'accent-quest',
          name: 'Accent Quest VR',
          description: 'Students use tablets to scan QR codes that play pronunciations from different English-speaking regions and match them to spellings.',
          materials: ['Tablets or VR viewers', 'QR code cards', 'Headphones']
        }
      ],
      displays: [
        {
          slug: 'sound-map',
          title: 'Global Sound Map',
          description: 'Design a map that pins each focus word to a region showing how the pronunciation shifts around the world.'
        },
        {
          slug: 'syllable-gallery',
          title: 'Syllable Gallery Wall',
          description: 'Layered posters with syllable breakdowns and coloured phoneme keys invite students to analyse each pattern daily.'
        }
      ],
      worksheets: [
        {
          slug: 'analysis',
          title: 'Pattern Analysis Mat',
          directions: 'Guide students to classify pronunciations, mark syllable stress, and summarise what influences the sound change.',
          tasks: [
            'Group the words by pronunciation and highlight the vowel sound.',
            'Write the syllable division and stress mark for each word.',
            'Explain in two sentences how origin affects the sound for three examples.'
          ],
          sections: [
            'Group focus words by shared spelling pattern and note their pronunciations.',
            'Annotate each word with syllable breaks, stress, and part of speech.',
            'Summarise two generalisations using evidence from the list.'
          ]
        },
        {
          slug: 'dictation',
          title: 'Dictation & Reflection Sheet',
          directions: 'Use this printable for weekly dictation. Encourage students to justify each spelling with evidence.',
          tasks: [
            'Write the teacher-dictated sentence that includes two focus words.',
            'Underline the pattern and note why the pronunciation fits.',
            'Reflect on one strategy that helped you spell accurately.'
          ],
          sections: [
            'Record sentences that include multiple focus words.',
            'Show working by marking syllables and sound choices.',
            'Complete a reflection checklist for accuracy and strategy use.'
          ]
        }
      ]
    }
  ),
  'understand-that-different-areas-of-the-world-have-different-accepted-spelling-ru': createResourcePack(
    'understand-that-different-areas-of-the-world-have-different-accepted-spelling-ru',
    'Understand that different areas of the world have different accepted spelling rules and make choices accordingly when spelling',
    {
      wordSets: {
        core: ['colour', 'color', 'favourite', 'favorite', 'theatre', 'theater', 'travelling', 'traveling', 'analyse', 'analyze'],
        extension: [
          'catalogue',
          'catalog',
          'dialogue',
          'dialog',
          'neighbour',
          'neighbor',
          'kilometre',
          'kilometer',
          'organisation',
          'organization'
        ],
        challenge: [
          'honourable',
          'honorable',
          'licence',
          'license',
          'grey',
          'gray',
          'programme',
          'program',
          'mould',
          'mold'
        ]
      },
      passages: [
        {
          title: 'Editorial Style Meeting',
          difficulty: 'On-Level',
          focusWords: ['colour', 'color', 'favourite', 'favorite'],
          text: `During an editorial meeting, the Level 5 team created a style guide for the school magazine. They compared colour and color, favourite and favorite, and travelling versus traveling before deciding which spelling suited their Australian audience. Students highlighted how reader location determines the spelling choice and recorded their decision-making process.`
        },
        {
          title: 'Travel Blog Draft',
          difficulty: 'Stretch',
          focusWords: ['kilometre', 'kilometer', 'organisation', 'organization'],
          text: `A travel blogger prepared twin posts for audiences in Melbourne and Seattle. Learners examined how kilometre transforms to kilometer and organisation shifts to organization depending on the readers. They annotated the passage with notes about publishing guidelines and why consistent choice matters.`
        }
      ],
      activities: [
        {
          slug: 'style-guide',
          title: 'Build a Style Guide',
          duration: '25 minutes',
          steps: [
            'Assign partners a publication type such as newspaper, blog, or science journal.',
            'Research regional spelling expectations for that publication.',
            'Draft a one-page style guide and justify each rule with evidence.',
            'Present the style guide and field questions from peers.'
          ]
        },
        {
          slug: 'translation-station',
          title: 'Translation Station',
          duration: '20 minutes',
          steps: [
            'Convert a paragraph from Australian English to American English or vice versa.',
            'Highlight every change and label it with the spelling principle.',
            'Swap conversions with another pair for proofreading.',
            'Publish both versions on the class digital board.'
          ]
        },
        {
          slug: 'debate-club',
          title: 'Spelling Debate Club',
          duration: '15 minutes',
          steps: [
            'Stage a friendly debate: “Should our class adopt one global spelling or switch based on audience?”',
            'Gather arguments using research from dictionaries and style manuals.',
            'Encourage persuasive language while referencing real examples.',
            'Vote on a conclusion and display it near the writing station.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'launch',
          title: 'Launch Talk: Audience Matters',
          sections: [
            'Display colour/color and ask which version appears in Australian texts students read.',
            'Explain that authors choose a spelling that suits their audience and must stay consistent.',
            'Model checking an online style guide and demonstrate documenting the decision.',
            'Set the purpose for independent practice: match the spelling to the intended readers.'
          ]
        },
        {
          slug: 'small-group',
          title: 'Small-Group Coaching',
          sections: [
            'Review key pairs such as metre/meter, organise/organize, licence/license.',
            'Guide students to create a decision tree for selecting the correct variant.',
            'Encourage them to record examples in their word-study notebooks for future reference.'
          ]
        }
      ],
      games: [
        {
          slug: 'style-sprint',
          name: 'Style Sprint',
          description: 'Teams race to sort sentence strips into “British English” and “American English” pockets before explaining the choice.',
          materials: ['Sentence strips', 'Pocket charts', 'Timer', 'Style cards']
        },
        {
          slug: 'publication-puzzle',
          name: 'Publication Puzzle Hunt',
          description: 'Students receive clue cards about publications around the world and must match them with the correct spelling variant.',
          materials: ['Clue cards', 'World map mat', 'Magnetic markers']
        }
      ],
      displays: [
        {
          slug: 'style-board',
          title: 'Editorial Style Board',
          description: 'Create a split display that shows sample headlines in regional spellings with notes about where each version is published.'
        },
        {
          slug: 'decision-tree',
          title: 'Audience Decision Tree',
          description: 'Display a large flowchart that helps writers choose spellings based on audience, purpose, and publication.'
        }
      ],
      worksheets: [
        {
          slug: 'style-matcher',
          title: 'Style Matcher Worksheet',
          directions: 'Provide paired sentences that need the correct regional spelling. Students justify the choice in writing.',
          tasks: [
            'Circle the audience for each sentence.',
            'Write the correct spelling variant beside each sentence.',
            'Explain the rule in a brief note.'
          ],
          sections: [
            'Match sentences to either British or American English spellings.',
            'Annotate the clues that helped determine the choice.',
            'Complete a self-checklist for consistency.'
          ]
        },
        {
          slug: 'style-guide-template',
          title: 'Class Style Guide Template',
          directions: 'Use this printable to draft a class-wide style guide that lives in the writing centre.',
          tasks: [
            'List common spelling pairs your class encounters.',
            'Agree on the preferred variant and document why.',
            'Add an example sentence for each entry.'
          ],
          sections: [
            'Document regional variants and selected classroom conventions.',
            'Record references consulted such as dictionaries or websites.',
            'Add reminders for publishing final drafts.'
          ]
        }
      ]
    }
  ),
  'spell-words-with-less-common-silent-letters-e-g-subtle-pneumonia': createResourcePack(
    'spell-words-with-less-common-silent-letters-e-g-subtle-pneumonia',
    'Spell words with less common silent letters',
    {
      wordSets: {
        core: ['subtle', 'debt', 'doubt', 'gnarl', 'whistle', 'fasten', 'thumb', 'island', 'wrestle', 'knack'],
        extension: ['pneumonia', 'mnemonic', 'gnat', 'whittle', 'corps', 'hasten', 'yacht', 'honest', 'plumber', 'castle'],
        challenge: ['doubtful', 'condemn', 'handkerchief', 'rhubarb', 'answerable', 'knapsack', 'colonel', 'ghostly', 'ballet', 'gnarled']
      },
      passages: [
        {
          title: 'Silent Letter Surgery',
          difficulty: 'On-Level',
          focusWords: ['subtle', 'debt', 'gnarl', 'thumb'],
          text: `In science lab, students performed “spelling surgery” on silent-letter words. They labelled the silent consonant in subtle, debt, gnarl, and thumb, discussing why the letter remains even without a sound. The narrative emphasised analysing word history and morphology when memorising these spellings.`
        },
        {
          title: 'Archaeology Field Notes',
          difficulty: 'Stretch',
          focusWords: ['pneumonia', 'mnemonic', 'handkerchief', 'colonel'],
          text: `During a mock archaeological dig, the class kept field notes about artefacts with silent letters. Learners described how a mnemonic helped them spell pneumonia accurately and why colonel preserves a silent “l.” They justified each spelling choice using history-based evidence.`
        }
      ],
      activities: [
        {
          slug: 'x-ray-lab',
          title: 'Silent Letter X-Ray Lab',
          duration: '20 minutes',
          steps: [
            'Use highlighters to “x-ray” words and reveal silent letters.',
            'Sort words by the type of silent letter and note origins.',
            'Record strategies such as mnemonic phrases or syllable cues.',
            'Create an anchor card for the class chart.'
          ]
        },
        {
          slug: 'origin-investigation',
          title: 'Origin Investigation',
          duration: '25 minutes',
          steps: [
            'Research the language of origin for focus words.',
            'Explain why the silent letter appears and whether it signals meaning.',
            'Share findings via mini podcast recordings.',
            'Compile the audio into a listening station.'
          ]
        },
        {
          slug: 'design-challenge',
          title: 'Mnemonic Design Challenge',
          duration: '15 minutes',
          steps: [
            'Design visual mnemonics or slogans that reinforce silent-letter positions.',
            'Include sketches and colour-coding to emphasise the hidden letter.',
            'Display the designs and allow classmates to vote on clarity.',
            'Add top designs to the class study wall.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'model',
          title: 'Model: Hidden Letters Matter',
          sections: [
            'Display doubt and ask what happens if the “b” is removed.',
            'Demonstrate the etymology connection to Latin debitum.',
            'Model creating a mnemonic sentence to lock the spelling in memory.',
            'Have students apply the strategy to subtle and thumb.'
          ]
        },
        {
          slug: 'guided-practice',
          title: 'Guided Practice Prompts',
          sections: [
            'Chant: “Silent letters protect meaning.”',
            'Ask: “Which part of the word would change if we removed the silent letter?”',
            'Encourage learners to use syllable clapping to confirm the sound structure.'
          ]
        }
      ],
      games: [
        {
          slug: 'silent-letter-bingo',
          name: 'Silent Letter Bingo',
          description: 'Call out clues about silent letters and have students cover the matching word on their bingo cards.',
          materials: ['Custom bingo cards', 'Clue deck', 'Counters']
        },
        {
          slug: 'mystery-cipher',
          name: 'Mystery Cipher Hunt',
          description: 'Learners decode messages where silent letters are the key to unlocking the cipher.',
          materials: ['Cipher wheels', 'Message cards', 'Black lights']
        }
      ],
      displays: [
        {
          slug: 'silent-letter-gallery',
          title: 'Silent Letter Gallery',
          description: 'Feature enlarged word art where the silent letter is translucent but highlighted with etymology notes.'
        },
        {
          slug: 'mnemonic-wall',
          title: 'Mnemonic Wall',
          description: 'Showcase class-created mnemonics with illustrations to reinforce memory pathways.'
        }
      ],
      worksheets: [
        {
          slug: 'spotlight',
          title: 'Silent Spotlight Worksheet',
          directions: 'Students spotlight the silent letter, explain its purpose, and craft a memory hook.',
          tasks: [
            'Underline the silent letter.',
            'Write the origin or rule that keeps the letter.',
            'Create a mnemonic or sketch to remember the spelling.'
          ],
          sections: [
            'Highlight silent letters and record how they influence meaning.',
            'Add origin notes or syllable clues for each word.',
            'Design a visual cue to revisit during revision.'
          ]
        },
        {
          slug: 'dictation-journal',
          title: 'Dictation Journal Page',
          directions: 'Use this page for weekly dictation featuring silent-letter words. Include reflection prompts.',
          tasks: [
            'Write the dictated sentence neatly.',
            'Box the silent letter and justify its presence.',
            'Rate your confidence and set a practice goal.'
          ],
          sections: [
            'Dictation lines with space for teacher feedback.',
            'Reflection prompts to reinforce strategy use.',
            'Goal-tracking panel for independent study.'
          ]
        }
      ]
    }
  ),
  'spell-multisyllabic-words-including-some-with-more-complex-letter-patterns-e-g-e': createResourcePack(
    'spell-multisyllabic-words-including-some-with-more-complex-letter-patterns-e-g-e',
    'Spell multisyllabic words including some with more complex letter patterns',
    {
      wordSets: {
        core: ['extraordinary', 'microorganism', 'encyclopedia', 'transparency', 'consequence', 'parallel', 'auditorium', 'biological', 'architecture', 'transmission'],
        extension: ['photosynthesis', 'characteristic', 'hyperbole', 'configuration', 'metropolitan', 'imagination', 'collaboration', 'legislation', 'civilization', 'unpredictable'],
        challenge: ['interdisciplinary', 'reconfiguration', 'electromagnetic', 'counterproductive', 'extraordinarily', 'photosensitive', 'misinterpretation', 'bioluminescence', 'characterization', 'institutionalize']
      },
      passages: [
        {
          title: 'STEM Symposium Summary',
          difficulty: 'On-Level',
          focusWords: ['extraordinary', 'microorganism', 'encyclopedia', 'auditorium'],
          text: `The Level 5 cohort hosted a STEM symposium in the auditorium where each expert shared extraordinary discoveries about microorganisms. Students built an encyclopedia entry that broke complex words into syllables, clapped the rhythm, and practised accenting the stressed syllable to keep spelling accurate.`
        },
        {
          title: 'Innovation Podcast Transcript',
          difficulty: 'Stretch',
          focusWords: ['photosynthesis', 'collaboration', 'interdisciplinary', 'characterization'],
          text: `In their innovation podcast, students discussed how collaboration drives interdisciplinary research. The transcript highlighted how writers slow down to encode words like photosynthesis and characterization, using syllable markers and morphological chunks to sustain precision.`
        }
      ],
      activities: [
        {
          slug: 'syllable-sculpt',
          title: 'Syllable Sculpting Workshop',
          duration: '20 minutes',
          steps: [
            'Use clay or magnetic tiles to build each syllable.',
            'Label stress patterns and vowel teams.',
            'Record the morphological units in notebooks.',
            'Share strategies for tracking longer words.'
          ]
        },
        {
          slug: 'tech-breakdown',
          title: 'Tech Breakdown Station',
          duration: '25 minutes',
          steps: [
            'Use a digital whiteboard to chunk words into syllables.',
            'Colour-code prefixes, roots, and suffixes.',
            'Add voice recordings pronouncing each syllable.',
            'Export the slides as revision flashcards.'
          ]
        },
        {
          slug: 'academic-write',
          title: 'Academic Writing Studio',
          duration: '20 minutes',
          steps: [
            'Draft a persuasive paragraph using at least five complex words.',
            'Mark each syllable break lightly in pencil for proofreading.',
            'Swap drafts for a peer syllable check.',
            'Finalise the writing with clean, polished handwriting.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'syllable-lesson',
          title: 'Lesson: Build Long Words',
          sections: [
            'Model stretching extraordinary with syllable gestures.',
            'Demonstrate writing each syllable in boxes to maintain spacing.',
            'Guide students through encoding encyclopedia with prefix, root, and suffix highlights.',
            'Invite learners to lead a syllable break for collaboration.'
          ]
        },
        {
          slug: 'feedback',
          title: 'Feedback Sentence Stems',
          sections: [
            '“I noticed you tapped each syllable—how did that help?”',
            '“Which part was the hardest to remember and why?”',
            '“Show me how the suffix changes the meaning in this long word.”'
          ]
        }
      ],
      games: [
        {
          slug: 'syllable-dash',
          name: 'Syllable Dash',
          description: 'Teams race to build long words on segmented mats, earning points for accurate syllable division.',
          materials: ['Segmented mats', 'Letter tiles', 'Stopwatch']
        },
        {
          slug: 'morphology-madness',
          name: 'Morphology Madness Quiz Show',
          description: 'A fast-paced quiz where teams identify prefixes, roots, and suffixes within multisyllabic words.',
          materials: ['Buzzers', 'Digital scoreboard', 'Question cards']
        }
      ],
      displays: [
        {
          slug: 'syllable-ladder',
          title: 'Syllable Ladder',
          description: 'Create a ladder chart where each rung shows syllable divisions and stress marks for a complex word.'
        },
        {
          slug: 'word-lab',
          title: 'Word Lab Wall',
          description: 'Display step-by-step breakdowns of academic vocabulary with colour-coded morphology notes.'
        }
      ],
      worksheets: [
        {
          slug: 'word-breakdown',
          title: 'Word Breakdown Blueprint',
          directions: 'Students break each multisyllabic word into syllables, mark stress, and identify morphemes.',
          tasks: [
            'Divide each word into syllables using dots or slashes.',
            'Circle the stressed syllable.',
            'List any prefixes, roots, or suffixes present.'
          ],
          sections: [
            'Syllable division practice grid.',
            'Stress mark reminders and sample cues.',
            'Morphology table for recording components.'
          ]
        },
        {
          slug: 'sentence-weaver',
          title: 'Sentence Weaver Sheet',
          directions: 'Learners craft complex sentences featuring multiple long words and revise for clarity.',
          tasks: [
            'Write two sentences using focus words.',
            'Underline the syllable that receives the strongest stress.',
            'Check for punctuation and clarity.'
          ],
          sections: [
            'Sentence drafting lines with editing checklist.',
            'Margin for syllable notes.',
            'Peer feedback column.'
          ]
        }
      ]
    }
  )
};

const manualMorphologyLevel5 = {
  'use-knowledge-of-prefixes-and-suffixes-to-spell-less-common-words-e-g-glamorous-': createResourcePack(
    'use-knowledge-of-prefixes-and-suffixes-to-spell-less-common-words-e-g-glamorous-',
    'Use knowledge of prefixes and suffixes to spell less common words',
    {
      wordSets: {
        core: ['glamorous', 'explanation', 'misinterpret', 'renewable', 'previewed', 'unhelpful', 'overheated', 'carelessness', 'playfully', 'inactive'],
        extension: [
          'understatement',
          'reimagined',
          'disheartened',
          'preparation',
          'unfamiliar',
          'overachieve',
          'mistranslate',
          'restoration',
          'playfulness',
          'unmistakable'
        ],
        challenge: [
          'miscommunication',
          'reestablishment',
          'hyperactive',
          'counterproductive',
          'uncharacteristic',
          'overcompensate',
          'rejuvenation',
          'disproportionate',
          'misrepresentation',
          'reinvigorated'
        ]
      },
      passages: [
        {
          title: 'Innovation Incubator Log',
          difficulty: 'On-Level',
          focusWords: ['glamorous', 'explanation', 'renewable', 'inactive'],
          text: `Students documented their innovation incubator using layered vocabulary. They crafted an explanation of a glamorous but renewable energy model and described strategies for reviving inactive systems. The log emphasised identifying prefixes and suffixes to decode meaning and guard spelling accuracy.`
        },
        {
          title: 'Media Review Column',
          difficulty: 'Stretch',
          focusWords: ['miscommunication', 'reestablishment', 'reinvigorated', 'counterproductive'],
          text: `A review column analysed how miscommunication can derail a project until a reinvigorated team establishes new routines. Writers slowed down to segment complex affixed words, highlighting each prefix and suffix combination that carried meaning.`
        }
      ],
      activities: [
        {
          slug: 'affix-lab',
          title: 'Affix Strategy Lab',
          duration: '20 minutes',
          steps: [
            'Highlight the prefix and suffix in each focus word.',
            'Discuss how the affixes change meaning or part of speech.',
            'Create a chart of strategies for spelling less common words.',
            'Apply the strategies to new vocabulary from reading.'
          ]
        },
        {
          slug: 'affix-challenge',
          title: 'Morphology Challenge Cards',
          duration: '20 minutes',
          steps: [
            'Draw a base word card and spin to reveal a prefix or suffix.',
            'Build a new word, define it, and use it in a sentence.',
            'Peer judges award points for accuracy and creativity.',
            'Record high-scoring words on the class morphology wall.'
          ]
        },
        {
          slug: 'writing-application',
          title: 'Editorial Application',
          duration: '25 minutes',
          steps: [
            'Write an editorial paragraph using at least six affixed words.',
            'Underline the base, prefix, and suffix in different colours.',
            'Exchange paragraphs for peer feedback on clarity and spelling.',
            'Revise and publish to the class digital magazine.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'launch-lesson',
          title: 'Launch Lesson: Affix Power',
          sections: [
            'Display glamorous, misinterpret, and renewable. Ask what the affixes contribute to meaning.',
            'Model breaking the words into prefix, base, and suffix using a morphology map.',
            'Discuss how understanding affixes prevents spelling errors.',
            'Guide students to co-create a new word from a known base.'
          ]
        },
        {
          slug: 'conferring-cues',
          title: 'Conferring Cues',
          sections: [
            'Prompt: “Which part of this word is the base? Which affix is challenging you?”',
            'Cue: “Try rewriting the word family to see patterns.”',
            'Celebrate: “You used morphology to self-correct—note that in your journal.”'
          ]
        }
      ],
      games: [
        {
          slug: 'affix-bingo',
          name: 'Affix Bingo',
          description: 'Students cover squares when they can form and define a new word using the called prefix or suffix.',
          materials: ['Bingo boards', 'Affix call cards', 'Counters']
        },
        {
          slug: 'studio-showdown',
          name: 'Word Studio Showdown',
          description: 'Teams race to build accurate affixed words that match teacher-provided definitions.',
          materials: ['Prefix/suffix tiles', 'Definition cards', 'Timer']
        }
      ],
      displays: [
        {
          slug: 'affix-arsenal',
          title: 'Affix Arsenal Board',
          description: 'Design a display with pockets for prefixes and suffixes where students add new discoveries with definitions.'
        },
        {
          slug: 'word-factory',
          title: 'Word Factory Diagram',
          description: 'Showcase a factory-themed diagram illustrating how bases move along a conveyor and collect affixes to create precise vocabulary.'
        }
      ],
      worksheets: [
        {
          slug: 'affix-planner',
          title: 'Affix Planner Sheet',
          directions: 'Plan and record how affixes adjust meaning and spelling in new words.',
          tasks: [
            'List the base word, chosen affix, and resulting word.',
            'Explain the new meaning in your own words.',
            'Write a sentence using the new word correctly.'
          ],
          sections: [
            'Planning table for prefix/suffix combinations.',
            'Meaning analysis column.',
            'Sentence writing lines with checklist.'
          ]
        },
        {
          slug: 'reflection-journal',
          title: 'Morphology Reflection Journal Page',
          directions: 'Reflect on successes and challenges when spelling complex affixed words.',
          tasks: [
            'Identify two words that felt easy and explain why.',
            'Identify a tricky word and describe your strategy.',
            'Set a goal for using affix knowledge in writing.'
          ],
          sections: [
            'Success column with evidence.',
            'Challenge column with strategy notes.',
            'Goal-setting footer for next lesson.'
          ]
        }
      ]
    }
  ),
  'combine-more-complex-bases-with-the-accompanying-prefixes-and-suffixes-e-g-decon': createResourcePack(
    'combine-more-complex-bases-with-the-accompanying-prefixes-and-suffixes-e-g-decon',
    'Combine more complex bases with the accompanying prefixes and suffixes',
    {
      wordSets: {
        core: ['constructive', 'deconstruct', 'reconstruction', 'instructional', 'productive', 'substructure', 'introduction', 'conductive', 'construction', 'reduction'],
        extension: [
          'restructuring',
          'misconstruction',
          'reproduction',
          'inductively',
          'counterproductive',
          'overconstruction',
          'infrastructure',
          'deduction',
          'obstruction',
          'superstructure'
        ],
        challenge: [
          'deconstructionist',
          'reconstructive',
          'conductivity',
          'introductory',
          'subproductive',
          'overconstructionist',
          'misconducted',
          'reductionism',
          'productivity',
          'indestructible'
        ]
      },
      passages: [
        {
          title: 'Engineering Notebook Entry',
          difficulty: 'On-Level',
          focusWords: ['constructive', 'deconstruct', 'reconstruction', 'substructure'],
          text: `During design thinking, learners recorded how they deconstruct prototypes to plan reconstruction. The notebook described each substructure carefully, emphasising the importance of spotting prefixes and suffixes that signal changes in meaning.`
        },
        {
          title: 'Architecture Critique',
          difficulty: 'Stretch',
          focusWords: ['infrastructure', 'counterproductive', 'restructuring', 'introductory'],
          text: `A critique of city planning explored when restructuring an outdated infrastructure becomes counterproductive. Students annotated complex affixed words, using morphology knowledge to maintain spelling precision during analytical writing.`
        }
      ],
      activities: [
        {
          slug: 'blueprint-lab',
          title: 'Blueprint Morphology Lab',
          duration: '25 minutes',
          steps: [
            'Break words into prefix, base, and suffix using colour-coded highlighters.',
            'Sketch a “blueprint” showing how each part builds meaning.',
            'Swap blueprints and see if peers can rebuild the word.',
            'Discuss how understanding structure supports spelling.'
          ]
        },
        {
          slug: 'concept-map',
          title: 'Concept Mapping Workshop',
          duration: '20 minutes',
          steps: [
            'Create a concept map linking base words like struct, duct, and product to related affixed forms.',
            'Add arrows showing how prefixes alter direction or intensity.',
            'Present the map to the class and explain the relationships.',
            'Add the map to the morphology reference wall.'
          ]
        },
        {
          slug: 'writing-extension',
          title: 'Technical Writing Extension',
          duration: '20 minutes',
          steps: [
            'Draft a technical paragraph describing a construction project using at least five focus words.',
            'Underline each affix and explain its contribution in the margin.',
            'Peer edit for accuracy and clarity.',
            'Publish the final paragraph with diagrams.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'explicit-instruction',
          title: 'Explicit Instruction Script',
          sections: [
            'Model how the Latin base struct means “build” and how prefixes adjust direction.',
            'Show how adding -ion or -ive creates nouns or adjectives.',
            'Guide students to segment reconstruction and substructure together.',
            'Provide guided practice with newly introduced vocabulary.'
          ]
        },
        {
          slug: 'feedback-loop',
          title: 'Feedback Loop Prompts',
          sections: [
            'Ask: “What does the base word tell you about the action?”',
            'Prompt: “Which affix gives you clues about time or intensity?”',
            'Remind: “Record the pattern in your morphology journal for reference.”'
          ]
        }
      ],
      games: [
        {
          slug: 'struct-stack',
          name: 'Struct Stack',
          description: 'Build towers by matching prefixes, bases, and suffixes; towers fall if a combination is inaccurate.',
          materials: ['Prefix/base/suffix blocks', 'Timer', 'Challenge cards']
        },
        {
          slug: 'morphology-draft',
          name: 'Morphology Draft Pick',
          description: 'Students draft word parts to create high-scoring combinations explained to the group.',
          materials: ['Draft board', 'Part cards', 'Score sheets']
        }
      ],
      displays: [
        {
          slug: 'word-crane',
          title: 'Word Crane Display',
          description: 'Design a display shaped like a crane lifting prefixes and suffixes onto base words to show construction of meaning.'
        },
        {
          slug: 'morphology-blueprint',
          title: 'Morphology Blueprint Wall',
          description: 'Feature blueprint-style posters that map how common bases combine with multiple affixes.'
        }
      ],
      worksheets: [
        {
          slug: 'structure-grid',
          title: 'Structure Grid Worksheet',
          directions: 'Map the structure of complex words and explain each component.',
          tasks: [
            'Fill in prefix, base, and suffix columns for each word.',
            'Describe how each part contributes to meaning.',
            'Create an original word using the base and explain it.'
          ],
          sections: [
            'Morphology table with labelled columns.',
            'Meaning explanation box.',
            'Creative construction space.'
          ]
        },
        {
          slug: 'concept-reflection',
          title: 'Concept Reflection Sheet',
          directions: 'Reflect on how combining bases with affixes supports comprehension.',
          tasks: [
            'Summarise one strategy for spelling a complex word.',
            'Illustrate the word parts as a diagram.',
            'Plan how to use the word in future writing.'
          ],
          sections: [
            'Written reflection prompts.',
            'Diagramming box.',
            'Future-use checklist.'
          ]
        }
      ]
    }
  ),
  'know-more-complex-irregular-plurals-e-g-cacti-crisis-appendices-dice-larvae-stim': createResourcePack(
    'know-more-complex-irregular-plurals-e-g-cacti-crisis-appendices-dice-larvae-stim',
    'Know more complex irregular plurals',
    {
      wordSets: {
        core: ['cactus/cacti', 'focus/foci', 'analysis/analyses', 'criterion/criteria', 'phenomenon/phenomena', 'larva/larvae', 'crisis/crises', 'axis/axes', 'stimulus/stimuli', 'octopus/octopi'],
        extension: [
          'appendix/appendices',
          'nucleus/nuclei',
          'alumnus/alumni',
          'syllabus/syllabi',
          'radius/radii',
          'fungus/fungi',
          'thesis/theses',
          'diagnosis/diagnoses',
          'bacterium/bacteria',
          'oasis/oases'
        ],
        challenge: [
          'hypothesis/hypotheses',
          'parenthesis/parentheses',
          'analysis/analyses',
          'automaton/automata',
          'curriculum/curricula',
          'memorandum/memoranda',
          'stratum/strata',
          'addendum/addenda',
          'index/indices',
          'vertex/vertices'
        ]
      },
      passages: [
        {
          title: 'Science Symposium Recap',
          difficulty: 'On-Level',
          focusWords: ['cacti', 'larvae', 'criteria', 'phenomena'],
          text: `A science symposium recap highlighted how researchers applied criteria to study desert phenomena like blooming cacti and migrating larvae. The passage explained each irregular plural and invited students to justify spelling with etymology notes.`
        },
        {
          title: 'Museum Field Guide',
          difficulty: 'Stretch',
          focusWords: ['appendices', 'nuclei', 'theses', 'curricula'],
          text: `In a museum field guide, docents described ancient scrolls stored in protective appendices and explained how scholars compared nuclei across scientific theses. Learners annotated each irregular plural and linked it to Greek or Latin origins.`
        }
      ],
      activities: [
        {
          slug: 'plural-gallery',
          title: 'Plural Gallery Walk',
          duration: '20 minutes',
          steps: [
            'Create dual-sided cards showing singular and plural forms.',
            'Include origin notes and visual cues.',
            'Gallery walk to quiz peers using the cards.',
            'Record tricky pairs in notebooks with mnemonic support.'
          ]
        },
        {
          slug: 'debate',
          title: 'Language Debate Circle',
          duration: '20 minutes',
          steps: [
            'Debate whether certain irregular plurals should accept regular endings.',
            'Use evidence from dictionaries and historical usage.',
            'Vote on the most convincing arguments.',
            'Add conclusions to the classroom language charter.'
          ]
        },
        {
          slug: 'research-lab',
          title: 'Etymology Research Lab',
          duration: '25 minutes',
          steps: [
            'Research the origin of assigned singular/plural pairs.',
            'Create quick reference slides with pronunciation tips.',
            'Record audio explaining the transformation.',
            'Upload slides and audio to the class digital library.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'mini-lesson',
          title: 'Mini-Lesson: Irregular Plurals',
          sections: [
            'Display singulars alongside irregular plurals and ask what patterns students notice.',
            'Explain that many irregular plurals preserve original Latin or Greek endings.',
            'Model using a T-chart to connect singular and plural forms.',
            'Guide students to sort new words using the same process.'
          ]
        },
        {
          slug: 'conferring',
          title: 'Conferring Tips',
          sections: [
            'Prompt: “Which part of the word changes in the plural form?”',
            'Coach: “Can you find a similar example in your notes?”',
            'Celebrate: “You explained the plural using origin knowledge—excellent thinking.”'
          ]
        }
      ],
      games: [
        {
          slug: 'plural-dominoes',
          name: 'Plural Dominoes',
          description: 'Match singular and plural domino tiles while explaining the transformation to score points.',
          materials: ['Domino tiles with singular/plural pairs', 'Score tracker']
        },
        {
          slug: 'quiz-show',
          name: 'Irregular Plural Quiz Show',
          description: 'Teams answer rapid-fire questions about irregular plurals with bonus points for etymology facts.',
          materials: ['Quiz cards', 'Bells or buzzers', 'Scoreboard']
        }
      ],
      displays: [
        {
          slug: 'plural-park',
          title: 'Irregular Plural Park',
          description: 'Create a park-themed display where each bench features a singular/plural pair with origin facts.'
        },
        {
          slug: 'reference-chart',
          title: 'Reference Chart',
          description: 'Design a clean chart sorted by plural endings, showing examples and pronunciation cues.'
        }
      ],
      worksheets: [
        {
          slug: 'matching-grid',
          title: 'Plural Matching Grid',
          directions: 'Match singular and plural forms, then note the language of origin.',
          tasks: [
            'Draw lines between matching singular/plural forms.',
            'Write the origin language beside each pair.',
            'Use each plural in a sentence.'
          ],
          sections: [
            'Matching grid with columns for singular and plural.',
            'Origin recording column.',
            'Sentence writing lines.'
          ]
        },
        {
          slug: 'quiz-review',
          title: 'Quiz Review Sheet',
          directions: 'Prepare for assessments with practise questions focused on irregular plurals.',
          tasks: [
            'Fill in missing plural forms.',
            'Explain why the plural looks different.',
            'Self-assess confidence levels.'
          ],
          sections: [
            'Fill-in-the-blank section.',
            'Explanation boxes for reasoning.',
            'Self-assessment checklist.'
          ]
        }
      ]
    }
  ),
  'independently-build-morphemic-word-families-using-knowledge-of-prefixes-and-suff': createResourcePack(
    'independently-build-morphemic-word-families-using-knowledge-of-prefixes-and-suff',
    'Independently build morphemic word families using knowledge of prefixes and suffixes',
    {
      wordSets: {
        core: ['destroy', 'destroys', 'destroyed', 'destroyer', 'inform', 'informs', 'information', 'protect', 'protection', 'designer'],
        extension: ['solve', 'solution', 'educate', 'education', 'translate', 'translation', 'invent', 'invention', 'communicate', 'communication'],
        challenge: ['collaborate', 'collaboration', 'investigate', 'investigation', 'negotiate', 'negotiation', 'evaluate', 'evaluation', 'activate', 'activation']
      },
      passages: [
        {
          title: 'Word Family Workshop Journal',
          difficulty: 'On-Level',
          focusWords: ['destroyed', 'information', 'protection', 'designer'],
          text: `Students journaled about building word families to strengthen their writing. They recorded how destroyed, information, protection, and designer share a base but take on new roles when combined with affixes. The journal emphasised charting word families for spelling independence.`
        },
        {
          title: 'Innovation Report',
          difficulty: 'Stretch',
          focusWords: ['collaboration', 'investigation', 'evaluation', 'activation'],
          text: `An innovation report described how collaboration and investigation lead to activation of new ideas. Learners highlighted the base verbs and tracked how affixes signal tense and part of speech changes, ensuring accurate spelling across the family.`
        }
      ],
      activities: [
        {
          slug: 'family-tree',
          title: 'Word Family Tree Studio',
          duration: '20 minutes',
          steps: [
            'Select a base word and map possible prefixes and suffixes.',
            'Organise the family tree by part of speech.',
            'Add definitions and example sentences for each branch.',
            'Share trees with peers for feedback.'
          ]
        },
        {
          slug: 'family-games',
          title: 'Word Family Relay',
          duration: '15 minutes',
          steps: [
            'Teams race to build complete families from word part cards.',
            'Each teammate explains how their word fits the family.',
            'Judge accuracy and depth of explanation.',
            'Record results on a scoreboard for revision.'
          ]
        },
        {
          slug: 'writing-portfolio',
          title: 'Portfolio Application',
          duration: '25 minutes',
          steps: [
            'Review recent writing pieces and highlight word families used.',
            'Identify opportunities to replace repeated words with new family members.',
            'Revise the writing to showcase variety.',
            'Reflect on how word families improved clarity.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'modeling',
          title: 'Model: Building Word Families',
          sections: [
            'Model selecting a base word and brainstorming related affixed forms.',
            'Demonstrate organising the family by verbs, nouns, adjectives, and adverbs.',
            'Highlight spelling changes such as dropped letters or doubled consonants.',
            'Invite students to co-create a family on chart paper.'
          ]
        },
        {
          slug: 'conference',
          title: 'Conference Script',
          sections: [
            'Ask: “Show me the word family you are building.”',
            'Prompt: “Which pattern helps you spell each variation?”',
            'Challenge: “Add a new member to the family and explain it.”'
          ]
        }
      ],
      games: [
        {
          slug: 'family-bingo',
          name: 'Family Bingo',
          description: 'Bingo boards feature base words; students earn markers by generating accurate family members.',
          materials: ['Custom bingo boards', 'Word part tokens', 'Definition deck']
        },
        {
          slug: 'morphology-puzzle',
          name: 'Morphology Puzzle Hunt',
          description: 'Learners solve puzzles that require matching word family members to contextual clues.',
          materials: ['Puzzle cards', 'Clue envelopes', 'Timer']
        }
      ],
      displays: [
        {
          slug: 'family-gallery',
          title: 'Family Gallery Wall',
          description: 'Display student-created family trees with colour-coded affixes and example sentences.'
        },
        {
          slug: 'family-notebook',
          title: 'Word Family Notebook Station',
          description: 'Maintain a class notebook of families where students add new pages throughout the term.'
        }
      ],
      worksheets: [
        {
          slug: 'family-planner',
          title: 'Family Planner Sheet',
          directions: 'Plan and record members of a word family with meanings and sentence examples.',
          tasks: [
            'List each family member and label its part of speech.',
            'Explain how the affix changes meaning.',
            'Write a sentence using the new word.'
          ],
          sections: [
            'Planning table for word families.',
            'Meaning explanation column.',
            'Sentence lines with checklist.'
          ]
        },
        {
          slug: 'self-assessment',
          title: 'Family Self-Assessment',
          directions: 'Evaluate your mastery of building word families.',
          tasks: [
            'Rate confidence for selecting affixes.',
            'Provide evidence from writing samples.',
            'Set a target for the next learning cycle.'
          ],
          sections: [
            'Rating scale with prompts.',
            'Evidence boxes for citing work.',
            'Goal-setting reflection.'
          ]
        }
      ]
    }
  ),
  'make-nouns-using-suffixes-ment-ion-age-e-g-development-education-postage': createResourcePack(
    'make-nouns-using-suffixes-ment-ion-age-e-g-development-education-postage',
    'Make nouns using suffixes -ment, -ion, -age',
    {
      wordSets: {
        core: ['development', 'celebration', 'postage', 'movement', 'education', 'coverage', 'invention', 'encouragement', 'storage', 'addition'],
        extension: [
          'arrangement',
          'exploration',
          'heritage',
          'assignment',
          'imagination',
          'voyage',
          'measurement',
          'extension',
          'percentage',
          'observation'
        ],
        challenge: [
          'acknowledgement',
          'transformation',
          'navigation',
          'management',
          'persuasion',
          'advantage',
          'representation',
          'conversation',
          'pilgrimage',
          'documentation'
        ]
      },
      passages: [
        {
          title: 'Project Proposal',
          difficulty: 'On-Level',
          focusWords: ['development', 'education', 'coverage', 'exploration'],
          text: `A project proposal detailed the development of a community garden and the education sessions that supported it. Students noted how coverage, exploration, and other nouns ending in -ment, -ion, and -age signal outcomes or processes.`
        },
        {
          title: 'Historical Travelogue',
          difficulty: 'Stretch',
          focusWords: ['voyage', 'heritage', 'acknowledgement', 'documentation'],
          text: `A travelogue described a voyage tracing cultural heritage sites and included acknowledgement of elders who shared documentation. Learners highlighted the suffixes and discussed how they transformed verbs into abstract nouns.`
        }
      ],
      activities: [
        {
          slug: 'suffix-spotlight',
          title: 'Suffix Spotlight',
          duration: '20 minutes',
          steps: [
            'Sort words into -ment, -ion, and -age groups.',
            'Identify the base verb for each noun.',
            'Discuss spelling adjustments such as dropping or adding letters.',
            'Create anchor cards with sample sentences.'
          ]
        },
        {
          slug: 'newsroom',
          title: 'Noun Newsroom',
          duration: '20 minutes',
          steps: [
            'Pretend to be journalists writing headlines featuring target nouns.',
            'Include captions explaining the base verb and outcome.',
            'Share headlines during a mock press conference.',
            'Reflect on clarity and correctness.'
          ]
        },
        {
          slug: 'design-studio',
          title: 'Design Studio',
          duration: '15 minutes',
          steps: [
            'Design posters illustrating the journey from verb to noun.',
            'Use arrows and icons to show the change.',
            'Display posters in the classroom for reference.',
            'Invite peers to add examples on sticky notes.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'lesson-plan',
          title: 'Lesson Plan: Noun Makers',
          sections: [
            'Explain that -ment, -ion, and -age create nouns that show results or processes.',
            'Model converting explore to exploration and encourage to encouragement.',
            'Highlight spelling shifts such as dropping silent e.',
            'Guide students through practising with new base verbs.'
          ]
        },
        {
          slug: 'coaching',
          title: 'Coaching Questions',
          sections: [
            '“What is the base verb in this noun?”',
            '“Does the base need a spelling change before adding the suffix?”',
            '“How does the suffix change the role of the word in a sentence?”'
          ]
        }
      ],
      games: [
        {
          slug: 'suffix-spin',
          name: 'Suffix Spin-Off',
          description: 'Spin to select a base verb and race to create accurate -ment, -ion, or -age nouns with definitions.',
          materials: ['Spinner', 'Base verb cards', 'Whiteboards']
        },
        {
          slug: 'production-line',
          name: 'Noun Production Line',
          description: 'Students form a production line where each stage adds part of the word, ensuring the final noun is correct.',
          materials: ['Stage cards', 'Word part tiles', 'Timer']
        }
      ],
      displays: [
        {
          slug: 'noun-market',
          title: 'Noun Market Stall',
          description: 'Create a market-themed display with baskets for -ment, -ion, and -age nouns complete with definition tags.'
        },
        {
          slug: 'process-chart',
          title: 'Process Chart',
          description: 'Show a flowchart that tracks verbs becoming nouns using the target suffixes.'
        }
      ],
      worksheets: [
        {
          slug: 'conversion-chart',
          title: 'Conversion Chart Worksheet',
          directions: 'Convert verbs to nouns using -ment, -ion, or -age and describe the meaning change.',
          tasks: [
            'Write the base verb and the new noun.',
            'Explain the meaning of the noun.',
            'Use the noun in a context sentence.'
          ],
          sections: [
            'Conversion table with columns for verb and noun.',
            'Meaning explanation lines.',
            'Sentence practise area.'
          ]
        },
        {
          slug: 'editing-practice',
          title: 'Editing Practice Sheet',
          directions: 'Edit a paragraph with incorrect suffix usage.',
          tasks: [
            'Circle incorrect nouns and rewrite them accurately.',
            'Justify why the correction works.',
            'Reflect on which suffix you need to practise more.'
          ],
          sections: [
            'Paragraph editing space.',
            'Correction table.',
            'Reflection prompts.'
          ]
        }
      ]
    }
  ),
  'understand-and-learn-more-about-greek-and-latin-etymology-and-that-many-words-ha': createResourcePack(
    'understand-and-learn-more-about-greek-and-latin-etymology-and-that-many-words-ha',
    'Understand and learn more about Greek and Latin etymology and that many words have Greek and Latin roots which carry meaning',
    {
      wordSets: {
        core: ['telegraph', 'autograph', 'biography', 'aquatic', 'spectator', 'transport', 'visible', 'microscope', 'phonics', 'chrono'],
        extension: [
          'telepathy',
          'autonomous',
          'geology',
          'aquarium',
          'inspect',
          'export',
          'invisible',
          'microscope',
          'telephone',
          'chronology'
        ],
        challenge: [
          'telecommunication',
          'autobiography',
          'geographical',
          'aquaculture',
          'circumspect',
          'transportation',
          'provision',
          'microscopic',
          'phonological',
          'synchronize'
        ]
      },
      passages: [
        {
          title: 'Roots Around Us',
          difficulty: 'On-Level',
          focusWords: ['telegraph', 'autograph', 'aquatic', 'spectator'],
          text: `Students toured their community documenting words with Greek and Latin roots. They recorded how telegraph means “writing at a distance,” autograph shows “self writing,” aquatic connects to water, and spectator links to seeing.`
        },
        {
          title: 'STEM Roots Report',
          difficulty: 'Stretch',
          focusWords: ['telecommunication', 'geology', 'microscopic', 'chronology'],
          text: `A STEM roots report analysed how telecommunication supports modern science, geology explains Earth’s layers, microscopes reveal microscopic organisms, and chronology arranges events. Learners annotated roots and meanings for each example.`
        }
      ],
      activities: [
        {
          slug: 'root-safari',
          title: 'Root Safari',
          duration: '25 minutes',
          steps: [
            'Hunt for Greek and Latin roots in classroom books and digital texts.',
            'Record each discovery on a shared slide deck with meaning and origin.',
            'Categorise the roots by theme (movement, sight, sound, etc.).',
            'Present findings to the class with examples.'
          ]
        },
        {
          slug: 'etymology-lab',
          title: 'Etymology Lab',
          duration: '20 minutes',
          steps: [
            'Use etymology dictionaries to trace the history of focus words.',
            'Map the journey from the original language to modern English.',
            'Create a timeline or flowchart showing the evolution.',
            'Explain the impact of the root on spelling and meaning.'
          ]
        },
        {
          slug: 'root-quiz',
          title: 'Root Quiz Creation',
          duration: '15 minutes',
          steps: [
            'Design quiz questions that require identifying the meaning of roots.',
            'Swap quizzes with classmates for practise.',
            'Provide answer keys with explanations.',
            'Reflect on the most surprising discoveries.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'root-lesson',
          title: 'Lesson Script: Why Roots Matter',
          sections: [
            'Explain that roots carry meaning that helps decode unfamiliar words.',
            'Model breaking telegraph into tele (distance) and graph (write).',
            'Connect root knowledge to improved spelling accuracy.',
            'Invite students to explore their own root-based words.'
          ]
        },
        {
          slug: 'discussion',
          title: 'Discussion Prompts',
          sections: [
            '“How does understanding the root help you remember the spelling?”',
            '“Which root appears in multiple subject areas?”',
            '“How can you share root knowledge with your family?”'
          ]
        }
      ],
      games: [
        {
          slug: 'root-memory',
          name: 'Root Memory Match',
          description: 'Match roots to their meanings and a modern English example in a memory-style game.',
          materials: ['Root cards', 'Meaning cards', 'Example cards']
        },
        {
          slug: 'escape-trail',
          name: 'Etymology Escape Trail',
          description: 'Solve puzzles and riddles that require decoding roots to unlock the next clue.',
          materials: ['Puzzle envelopes', 'Lock boxes', 'Timer']
        }
      ],
      displays: [
        {
          slug: 'root-map',
          title: 'Root World Map',
          description: 'Display a world map showing the origin of each root with strings connecting to English examples.'
        },
        {
          slug: 'root-index',
          title: 'Class Root Index',
          description: 'Create an index of roots with meanings, pronunciations, and student-chosen examples.'
        }
      ],
      worksheets: [
        {
          slug: 'root-dossier',
          title: 'Root Dossier Sheet',
          directions: 'Compile information about a root including origin, meaning, and examples.',
          tasks: [
            'Record the root and its translation.',
            'List three English words with the root.',
            'Describe how the root guides spelling.'
          ],
          sections: [
            'Root identification box.',
            'Example list with context.',
            'Reflection paragraph section.'
          ]
        },
        {
          slug: 'root-hunt',
          title: 'Root Hunt Checklist',
          directions: 'Track root discoveries during independent reading.',
          tasks: [
            'Note the text and page number of each root word.',
            'Explain the meaning using the root.',
            'Rate how confident you are about spelling the word.'
          ],
          sections: [
            'Checklist columns for text, word, and explanation.',
            'Confidence rating scale.',
            'Goal-setting prompt.'
          ]
        }
      ]
    }
  ),
  'understand-that-assimilated-prefixes-have-the-same-meaning-but-are-spelled-diffe': createResourcePack(
    'understand-that-assimilated-prefixes-have-the-same-meaning-but-are-spelled-diffe',
    'Understand that assimilated prefixes have the same meaning but are spelled differently to make pronunciation easier',
    {
      wordSets: {
        core: ['admit', 'affirm', 'allocate', 'appear', 'approve', 'assign', 'attack', 'accompany', 'affix', 'attach'],
        extension: [
          'collapse',
          'collect',
          'correlate',
          'commute',
          'contribute',
          'cooperate',
          'succeed',
          'support',
          'suppress',
          'submerge'
        ],
        challenge: [
          'aggression',
          'affirmation',
          'assimilate',
          'correspondence',
          'committee',
          'collaboration',
          'susceptible',
          'subterranean',
          'opposition',
          'officiate'
        ]
      },
      passages: [
        {
          title: 'Prefix Adaptation Log',
          difficulty: 'On-Level',
          focusWords: ['accompany', 'affirm', 'allocate', 'attack'],
          text: `Learners recorded how the prefix ad- changes to ac-, af-, al-, and at- depending on the base word. The log highlighted accompany, affirm, allocate, and attack to show how pronunciation becomes smoother while meaning remains “to or toward.”`
        },
        {
          title: 'Team Charter',
          difficulty: 'Stretch',
          focusWords: ['collaboration', 'committee', 'correspondence', 'support'],
          text: `A team charter described the importance of collaboration, a committee structure, and ongoing correspondence to support a project. Students analysed how com- becomes col- or cor- and how sub- becomes sup- when meeting certain consonants.`
        }
      ],
      activities: [
        {
          slug: 'sound-shift',
          title: 'Sound Shift Investigation',
          duration: '20 minutes',
          steps: [
            'Sort words by their assimilated prefix (ad-, ac-, af-, etc.).',
            'Discuss why the spelling changes improve pronunciation.',
            'Record generalisations in notebooks.',
            'Create a chant to remember each variation.'
          ]
        },
        {
          slug: 'prefix-studio',
          title: 'Prefix Studio Stations',
          duration: '25 minutes',
          steps: [
            'Station 1: Build words with magnetic letters showing the shift.',
            'Station 2: Use mirrors to watch mouth position while pronouncing words.',
            'Station 3: Write sentences illustrating meaning.',
            'Station 4: Create mini posters explaining one assimilated prefix.'
          ]
        },
        {
          slug: 'coaching-circle',
          title: 'Coaching Circle',
          duration: '15 minutes',
          steps: [
            'Students coach each other on tricky words using cue cards.',
            'Each coach explains the original prefix and why it changed.',
            'Switch roles to ensure everyone practises multiple prefixes.',
            'Reflect together on successful strategies.'
          ]
        }
      ],
      teacherScripts: [
        {
          slug: 'direct-instruction',
          title: 'Direct Instruction Script',
          sections: [
            'Explain that ad- means “to or toward” and often changes letters to ease pronunciation.',
            'Demonstrate with ad + company = accompany, ad + fix = affix, etc.',
            'Highlight that meaning stays consistent even when letters shift.',
            'Guide guided practice with new base words.'
          ]
        },
        {
          slug: 'prompt-bank',
          title: 'Prompt Bank',
          sections: [
            '“Which original prefix do you hear in this word?”',
            '“How does the next letter influence the spelling change?”',
            '“What other words follow the same pattern?”'
          ]
        }
      ],
      games: [
        {
          slug: 'prefix-switch',
          name: 'Prefix Switchboard',
          description: 'Players spin to reveal a base word, then choose the correct assimilated prefix tile to form a real word.',
          materials: ['Base word cards', 'Prefix tiles', 'Spinner']
        },
        {
          slug: 'card-quest',
          name: 'Assimilation Card Quest',
          description: 'Collect sets of words that originate from the same prefix but use different assimilations.',
          materials: ['Card sets', 'Recording sheets', 'Timer']
        }
      ],
      displays: [
        {
          slug: 'prefix-wall',
          title: 'Assimilated Prefix Wall',
          description: 'Design a wall display with colour-coded columns for each assimilated prefix, including examples and meanings.'
        },
        {
          slug: 'pronunciation-guide',
          title: 'Pronunciation Guide',
          description: 'Create a guide with arrows showing how the mouth position influences the spelling change.'
        }
      ],
      worksheets: [
        {
          slug: 'pattern-tracker',
          title: 'Pattern Tracker Sheet',
          directions: 'Track assimilated prefixes, record original forms, and explain spelling shifts.',
          tasks: [
            'List the assimilated prefix and the original prefix.',
            'Write two examples for each pattern.',
            'Explain the pronunciation change in a sentence.'
          ],
          sections: [
            'Table for prefix pairs.',
            'Example recording area.',
            'Explanation box.'
          ]
        },
        {
          slug: 'assessment',
          title: 'Self-Assessment Checklist',
          directions: 'Assess understanding of assimilated prefixes.',
          tasks: [
            'Rate confidence for identifying original prefixes.',
            'Highlight words to practise.',
            'Set a goal for applying knowledge in writing.'
          ],
          sections: [
            'Confidence scale.',
            'Practice list area.',
            'Goal-setting prompt.'
          ]
        }
      ]
    }
  )
};

const prefixMetas = [
  {
    id: 'add-the-prefix-ad-and-assimilated-prefixes-ac-af-as-al-at-and-ap-to-toward-e-g-a',
    concept:
      'Add the prefix ad- (and assimilated prefixes ac-, af-, as-, al-, at- and ap-) “to, toward”',
    prefix: 'ad-',
    prefixLabel: 'Ad- Family',
    meaning: 'to, toward',
    scenario: {
      setting: 'innovation design studio',
      onLevelFocus: 'adapted blueprints to advance the final prototype',
      stretchFocus: 'documenting how adjustments advanced the mission',
      project: 'Ad- Motion Portfolio'
    },
    wordSets: {
      core: ['advance', 'adapt', 'adhere', 'appoint', 'approve', 'appear', 'affix', 'assign', 'attend', 'allot'],
      extension: ['adjust', 'advocate', 'adjoin', 'aggression', 'allocate', 'affirm', 'assemble', 'apply', 'attain', 'announce'],
      challenge: ['accumulate', 'affiliation', 'approximate', 'assimilation', 'aggregation', 'allegation', 'aggrandize', 'appreciation', 'assignment', 'attainment']
    }
  },
  {
    id: 'add-the-prefix-com-and-assimilated-prefixes-col-cor-con-and-co-together-with-joi',
    concept:
      'Add the prefix com- (and assimilated prefixes col-, cor-, con- and co-) “together, with, jointly”',
    prefix: 'com-',
    prefixLabel: 'Com- Family',
    meaning: 'together, with, jointly',
    scenario: {
      setting: 'collaborative research hub',
      onLevelFocus: 'connected ideas to complete a group investigation',
      stretchFocus: 'chronicling coordinated problem solving across teams',
      project: 'Collaboration Chronicle'
    },
    wordSets: {
      core: ['combine', 'connect', 'collect', 'collaborate', 'coordinate', 'community', 'compose', 'cooperate', 'contribute', 'compact'],
      extension: ['correlate', 'commemorate', 'converge', 'consolidate', 'collide', 'coauthor', 'conference', 'comprise', 'companionship', 'consequence'],
      challenge: ['commiseration', 'conglomerate', 'cohabitation', 'correspondence', 'contradictory', 'collaboration', 'connotation', 'comprehensive', 'cohesiveness', 'congregation']
    }
  },
  {
    id: 'add-the-prefix-dis-and-assimilated-prefixes-dif-and-di-apart-away-or-not-e-g-dis',
    concept: 'Add the prefix dis- (and assimilated prefixes dif- and di-) “apart, away or not”',
    prefix: 'dis-',
    prefixLabel: 'Dis- Family',
    meaning: 'apart, away, not',
    scenario: {
      setting: 'debate analysis lounge',
      onLevelFocus: 'dissected arguments to distinguish fact from opinion',
      stretchFocus: 'discussing how disagreements drive discovery in civic discourse',
      project: 'Discourse Dossier'
    },
    wordSets: {
      core: ['disagree', 'displace', 'differ', 'distract', 'disconnect', 'discover', 'discard', 'disappear', 'disallow', 'dislike'],
      extension: ['disrupt', 'distinguish', 'disregard', 'disperse', 'disable', 'diverge', 'dissuade', 'dismissal', 'discord', 'dissuasion'],
      challenge: ['disintegration', 'disproportionate', 'disillusionment', 'differentiation', 'disenfranchise', 'disassociate', 'dissatisfaction', 'dissemination', 'disinheritance', 'disapproval']
    }
  },
  {
    id: 'add-the-prefix-ex-and-assimilated-prefixes-ef-and-e-out-away-from-beyond-e-g-exi',
    concept: 'Add the prefix ex- (and assimilated prefixes ef- and e-) “out, away from, beyond”',
    prefix: 'ex-',
    prefixLabel: 'Ex- Family',
    meaning: 'out, away from, beyond',
    scenario: {
      setting: 'expedition planning center',
      onLevelFocus: 'explained how explorers exit and extend beyond familiar terrain',
      stretchFocus: 'examining evidence of ecosystems adapting beyond expectations',
      project: 'Expedition Exhibit'
    },
    wordSets: {
      core: ['exit', 'export', 'extend', 'expand', 'explore', 'exclude', 'excavate', 'erase', 'emit', 'eject'],
      extension: ['exchange', 'express', 'excel', 'exclaim', 'effort', 'effect', 'elaborate', 'elevate', 'expose', 'exercise'],
      challenge: ['extrapolate', 'exaggeration', 'elimination', 'exorbitant', 'exhilaration', 'effervescent', 'exemplify', 'exposition', 'exemplary', 'extraction']
    }
  },
  {
    id: 'add-the-prefix-in-and-assimilated-prefixes-il-im-ir-and-in-meaning-not-into-or-t',
    concept:
      'Add the prefix in- (and assimilated prefixes il-, im-, ir- and in-) meaning “not, into or toward”',
    prefix: 'in-',
    prefixLabel: 'In- Family',
    meaning: 'not, into, toward',
    scenario: {
      setting: 'inquiry newsroom',
      onLevelFocus: 'investigated inaccurate reports to improve integrity',
      stretchFocus: 'illustrating how inquiry invites readers into new ideas',
      project: 'Inquiry Index'
    },
    wordSets: {
      core: ['include', 'invite', 'imperfect', 'illegal', 'irregular', 'insert', 'inspect', 'inhale', 'illustrate', 'imbalance'],
      extension: ['invisible', 'immersion', 'irresistible', 'illogical', 'incomplete', 'immigrate', 'inspectors', 'inhabit', 'inspire', 'irresponsible'],
      challenge: ['infrastructure', 'illumination', 'impractical', 'irreplaceable', 'inaugurate', 'impeccable', 'irreversible', 'inference', 'inception', 'immensity']
    }
  },
  {
    id: 'add-the-prefix-ob-and-assimilated-prefixes-oc-of-op-toward-against-completely-e-',
    concept: 'Add the prefix ob- (and assimilated prefixes oc-, of-, op-) “toward, against, completely”',
    prefix: 'ob-',
    prefixLabel: 'Ob- Family',
    meaning: 'toward, against, completely',
    scenario: {
      setting: 'opinion writing studio',
      onLevelFocus: 'observed obstacles and opposed weak arguments respectfully',
      stretchFocus: 'offering observations about opposing viewpoints in editorials',
      project: 'Observation Op-Ed'
    },
    wordSets: {
      core: ['object', 'observe', 'obtain', 'occupy', 'offer', 'oppose', 'oblige', 'obscure', 'offend', 'obstruct'],
      extension: ['occasion', 'officiate', 'oppress', 'obstacle', 'objection', 'opinion', 'offset', 'obvious', 'obligation', 'opportunity'],
      challenge: ['obstruction', 'opposition', 'offshoot', 'occupational', 'officiating', 'observatory', 'opportunistic', 'obliteration', 'obfuscate', 'obstinate']
    }
  },
  {
    id: 'add-the-prefix-sub-and-assimilated-prefixes-suc-suf-sup-sus-and-su-under-e-g-sub',
    concept:
      'Add the prefix sub- (and assimilated prefixes suc-, suf-, sup-, sus- and su-) “under”',
    prefix: 'sub-',
    prefixLabel: 'Sub- Family',
    meaning: 'under',
    scenario: {
      setting: 'submarine research bay',
      onLevelFocus: 'surveyed submerged habitats to support new theories',
      stretchFocus: 'sustaining documentation about subterranean ecosystems',
      project: 'Submersible Study'
    },
    wordSets: {
      core: ['submerge', 'subtract', 'subway', 'support', 'suffer', 'succeed', 'sustain', 'supply', 'suspect', 'suction'],
      extension: ['submarine', 'subheading', 'subsequent', 'suppress', 'suspense', 'substitute', 'subterranean', 'subdivision', 'succulent', 'suffix'],
      challenge: ['subconscious', 'sufficiency', 'supplementary', 'succession', 'subservient', 'subcutaneous', 'subdivision', 'subsistence', 'subcommittee', 'subversive']
    }
  },
  {
    id: 'add-the-prefix-a-not-in-on-without-e-g-atypical-aside',
    concept: 'Add the prefix a- “not, in, on, without”',
    prefix: 'a-',
    prefixLabel: 'A- Prefix',
    meaning: 'not, in, on, without',
    scenario: {
      setting: 'astronomy observatory',
      onLevelFocus: 'analysed atypical patterns appearing across the night sky',
      stretchFocus: 'arguing how anomalies advance scientific understanding',
      project: 'A-typical Atlas'
    },
    wordSets: {
      core: ['atypical', 'aside', 'aboard', 'awake', 'ashore', 'afloat', 'amoral', 'apolitical', 'achromatic', 'asleep'],
      extension: ['anonymous', 'asymmetry', 'achievable', 'amorphous', 'atonal', 'abandon', 'aloft', 'asea', 'abrupt', 'amorphousness'],
      challenge: ['asynchronous', 'anachronism', 'apolitical', 'anarchy', 'amorphousness', 'aphonic', 'asexuality', 'asymptomatic', 'afebrile', 'atonement']
    }
  },
  {
    id: 'add-the-prefix-inter-meaning-between-among-e-g-interact-interconnect',
    concept: 'Add the prefix inter- meaning “between, among”',
    prefix: 'inter-',
    prefixLabel: 'Inter- Prefix',
    meaning: 'between, among',
    scenario: {
      setting: 'international science exchange',
      onLevelFocus: 'interacted with partner schools to interpret shared data',
      stretchFocus: 'interweaving interviews and infographics for a showcase',
      project: 'Interconnect Expo'
    },
    wordSets: {
      core: ['interact', 'interconnect', 'interview', 'interpret', 'internet', 'interlock', 'intermix', 'interplay', 'interstate', 'intertwine'],
      extension: ['intercept', 'intermediate', 'intervene', 'intergalactic', 'intersect', 'interactive', 'interweave', 'interdependence', 'interpersonal', 'interstellar'],
      challenge: ['interdisciplinary', 'interrogation', 'intercontinental', 'interrelation', 'interconnection', 'intermission', 'intervention', 'interplanetary', 'intercultural', 'interlaced']
    }
  },
  {
    id: 'add-the-latin-prefix-intra-meaning-inside-within-e-g-intranet-intravenous',
    concept: 'Add the Latin prefix intra- meaning “inside, within”',
    prefix: 'intra-',
    prefixLabel: 'Intra- Prefix',
    meaning: 'inside, within',
    scenario: {
      setting: 'medical technology lab',
      onLevelFocus: 'investigated intranet security within the hospital system',
      stretchFocus: 'illustrating how intravenous devices interact internally',
      project: 'IntraLab Portfolio'
    },
    wordSets: {
      core: ['intranet', 'intravenous', 'intramural', 'intracellular', 'intrastate', 'intrinsic', 'introvert', 'intricate', 'intrapersonal', 'intractable'],
      extension: ['intrauterine', 'intracranial', 'intravenously', 'intrapreneur', 'introductory', 'intrareligious', 'intraregional', 'intraplate', 'intracompany', 'intraspecies'],
      challenge: ['intravenousness', 'intragalactic', 'intramuscular', 'intrascholastic', 'intracultural', 'intrametropolitan', 'intrapartum', 'intraoperative', 'intraprocedural', 'intraclass']
    }
  },
  {
    id: 'add-the-latin-prefix-mal-meaning-bad-wrongly-e-g-malpractice-malfunction',
    concept: 'Add the Latin prefix mal- meaning “bad, wrongly”',
    prefix: 'mal-',
    prefixLabel: 'Mal- Prefix',
    meaning: 'bad, wrongly',
    scenario: {
      setting: 'ethics inquiry lab',
      onLevelFocus: 'monitored malpractice scenarios to maintain fairness',
      stretchFocus: 'mapping how malfunctioning systems cause mistakes',
      project: 'Mal- Alert Report'
    },
    wordSets: {
      core: ['malfunction', 'malpractice', 'malnourish', 'malformed', 'maladjusted', 'malcontent', 'malodor', 'malaria', 'malignant', 'malice'],
      extension: ['malicious', 'malefactor', 'maladapted', 'malarkey', 'maleficent', 'malfeasance', 'malapropism', 'malpractice', 'maladroit', 'malodorous'],
      challenge: ['maldistribution', 'malnutrition', 'malformation', 'malfeasant', 'malfunctioning', 'maladministration', 'malinvestment', 'maleficence', 'malocclusion', 'malediction']
    }
  },
  {
    id: 'add-the-latin-prefix-pro-meaning-in-favour-of-positive-in-front-of-e-g-proactive',
    concept:
      'Add the Latin prefix pro- meaning “in favour of, positive, in front of”',
    prefix: 'pro-',
    prefixLabel: 'Pro- Prefix',
    meaning: 'forward, in favour of',
    scenario: {
      setting: 'leadership summit',
      onLevelFocus: 'promoted proactive plans to progress community projects',
      stretchFocus: 'profiling how proactive leaders protect progress long-term',
      project: 'Progress Portfolio'
    },
    wordSets: {
      core: ['promote', 'progress', 'proactive', 'proceed', 'project', 'protect', 'provide', 'pronounce', 'produce', 'profile'],
      extension: ['proclaim', 'provision', 'propel', 'prototype', 'prohibit', 'prosper', 'proportion', 'prolific', 'protagonist', 'profound'],
      challenge: ['propagation', 'proliferate', 'pronunciation', 'prosecutor', 'prodigious', 'protraction', 'provincial', 'proficiency', 'proclamation', 'propensity']
    }
  }
];

const suffixMetas = [
  {
    id: 'add-the-latin-vowel-suffix-ally-meaning-how-something-is-like-to-adjectives-to-f',
    concept:
      'Add the Latin vowel suffix -ally meaning “how something is, like” to adjectives to form adverbs when the base ends in -ic or -al',
    suffix: '-ally',
    suffixLabel: '-ally Suffix',
    meaning: 'in a manner, related to',
    scenario: {
      setting: 'media production suite',
      project: 'Adverb Broadcast'
    },
    wordSets: {
      core: ['magically', 'historically', 'practically', 'musically', 'comically', 'tragically', 'drastically', 'critically', 'basically', 'dramatically'],
      extension: ['scientifically', 'theatrically', 'classically', 'heroically', 'politically', 'strategically', 'artistically', 'athletically', 'statistically', 'ecologically'],
      challenge: ['hypothetically', 'enthusiastically', 'logistically', 'empathetically', 'rhetorically', 'philosophically', 'empathetically', 'theoretically', 'problematically', 'systematically']
    }
  },
  {
    id: 'add-the-latin-suffixes-ary-and-ery-meaning-connected-to-or-relating-to-to-form-a',
    concept:
      'Add the Latin suffixes -ary and -ery meaning “connected to or relating to” to form adjectives or nouns',
    suffix: '-ary/-ery',
    suffixLabel: '-ary & -ery Suffixes',
    meaning: 'connected to, place of',
    scenario: {
      setting: 'heritage museum lab',
      project: 'Heritage Directory'
    },
    wordSets: {
      core: ['library', 'bakery', 'dictionary', 'nursery', 'primary', 'stationary', 'pottery', 'salary', 'legendary', 'planetary'],
      extension: ['glossary', 'apiary', 'notary', 'cemetery', 'monastery', 'secondary', 'hereditary', 'inventory', 'machinery', 'cautionary'],
      challenge: ['anniversary', 'visionary', 'revolutionary', 'customary', 'missionary', 'necessary', 'literary', 'complimentary', 'accessory', 'commentary']
    }
  },
  {
    id: 'add-the-vowel-suffixes-ant-meaning-a-condition-or-state-a-thing-or-a-being-and-a',
    concept: 'Add the vowel suffixes -ant and -ance meaning “condition or state”',
    suffix: '-ant/-ance',
    suffixLabel: '-ant & -ance Suffixes',
    meaning: 'state of, person who',
    scenario: {
      setting: 'community leadership forum',
      project: 'Leadership Ledger'
    },
    wordSets: {
      core: ['assistant', 'brilliant', 'important', 'reliant', 'reliance', 'tolerant', 'tolerance', 'observant', 'observance', 'relevance'],
      extension: ['applicant', 'attendance', 'resistant', 'resistance', 'dominant', 'dominance', 'abundant', 'abundance', 'consultant', 'consultance'],
      challenge: ['significant', 'significance', 'exuberant', 'exuberance', 'protestant', 'acceptance', 'reluctant', 'reluctance', 'inhabitant', 'inhabitance']
    }
  },
  {
    id: 'add-the-vowel-suffixes-an-ian-ean-meaning-belonging-to-or-relating-to-to-nouns-t',
    concept:
      'Add the vowel suffixes -an, -ian, -ean meaning “belonging to or relating to” to nouns to form adjectives or nouns',
    suffix: '-an/-ian/-ean',
    suffixLabel: '-an Family',
    meaning: 'belonging to',
    scenario: {
      setting: 'global cultures seminar',
      project: 'Culture Atlas'
    },
    wordSets: {
      core: ['Australian', 'Canadian', 'musician', 'historian', 'librarian', 'guardian', 'comedian', 'technician', 'artisan', 'civilian'],
      extension: ['theologian', 'electrician', 'magician', 'Mediterranean', 'Floridian', 'politician', 'humanitarian', 'physician', 'caribbean', 'veterinarian'],
      challenge: ['egalitarian', 'dietician', 'mathematician', 'norman', 'Elizabethan', 'disciplinarian', 'academician', 'phonetician', 'philosophian', 'humanitarianism']
    }
  },
  {
    id: 'add-the-latin-suffix-ee-meaning-a-person-who-is-or-a-recipient-of-an-action-or-i',
    concept: 'Add the Latin suffix -ee meaning “a person who is or receives an action”',
    suffix: '-ee',
    suffixLabel: '-ee Suffix',
    meaning: 'person receiving',
    scenario: {
      setting: 'civic service workshop',
      project: 'Community Roster'
    },
    wordSets: {
      core: ['employee', 'trainee', 'nominee', 'referee', 'addressee', 'attendee', 'trustee', 'escapee', 'licensee', 'draftee'],
      extension: ['interviewee', 'committee', 'divorcee', 'payee', 'resignee', 'standee', 'absentee', 'devotee', 'assignee', 'mortgagee'],
      challenge: ['franchisee', 'electee', 'transferee', 'pensionee', 'conferee', 'protegee', 'commandeered', 'interrogatee', 'debtee', 'convivee']
    }
  },
  {
    id: 'add-the-vowel-suffixes-ent-meaning-a-person-who-or-a-thing-that-does-a-state-or-',
    concept:
      'Add the vowel suffixes -ent and -ence meaning “a person who or a thing that does, a state or quality”',
    suffix: '-ent/-ence',
    suffixLabel: '-ent & -ence Suffixes',
    meaning: 'quality or person',
    scenario: {
      setting: 'science discovery lab',
      project: 'Evidence Journal'
    },
    wordSets: {
      core: ['student', 'resident', 'dependent', 'confident', 'confidence', 'emergent', 'emergence', 'patient', 'patience', 'different'],
      extension: ['efficient', 'efficience', 'persistent', 'persistence', 'influential', 'influence', 'intelligent', 'intelligence', 'respondent', 'response'],
      challenge: ['benevolent', 'benevolence', 'resilient', 'resilience', 'competent', 'competence', 'transient', 'transience', 'insistent', 'insistence']
    }
  },
  {
    id: 'add-the-vowel-suffixes-eous-nous-meaning-having-qualities-of-to-nouns-to-form-ad',
    concept: 'Add the vowel suffixes -eous and -nous meaning “having qualities of” to form adjectives',
    suffix: '-eous/-nous',
    suffixLabel: '-eous & -nous Suffixes',
    meaning: 'having qualities of',
    scenario: {
      setting: 'art criticism studio',
      project: 'Texture Gallery'
    },
    wordSets: {
      core: ['courageous', 'nervous', 'joyous', 'dangerous', 'generous', 'mountainous', 'famous', 'gaseous', 'hazardous', 'glorious'],
      extension: ['spontaneous', 'pretentious', 'harmonious', 'luxurious', 'voluminous', 'mysterious', 'adventurous', 'courteous', 'continuous', 'gracious'],
      challenge: ['magnanimous', 'miscellaneous', 'instantaneous', 'simultaneous', 'meticulous', 'scrupulous', 'ceremonious', 'perilous', 'salubrious', 'felonious']
    }
  },
  {
    id: 'add-the-greek-suffix-ism-meaning-state-of-being-to-verbs-and-nouns-to-form-nouns',
    concept: 'Add the Greek suffix -ism meaning “state of being” to form nouns',
    suffix: '-ism',
    suffixLabel: '-ism Suffix',
    meaning: 'belief, state of',
    scenario: {
      setting: 'philosophy debate hall',
      project: 'Ideas Almanac'
    },
    wordSets: {
      core: ['heroism', 'realism', 'optimism', 'activism', 'tourism', 'criticism', 'journalism', 'baptism', 'plagiarism', 'humanism'],
      extension: ['capitalism', 'environmentalism', 'abolitionism', 'feminism', 'nationalism', 'expressionism', 'idealism', 'satirism', 'cynicism', 'dualism'],
      challenge: ['existentialism', 'utilitarianism', 'egalitarianism', 'multiculturalism', 'individualism', 'imperialism', 'materialism', 'pragmatism', 'romanticism', 'stoicism']
    }
  },
  {
    id: 'add-the-vowel-suffix-ile-meaning-ability-to-belonging-to-e-g-percentile-projecti',
    concept: 'Add the vowel suffix -ile meaning “ability to, belonging to”',
    suffix: '-ile',
    suffixLabel: '-ile Suffix',
    meaning: 'capable of, related to',
    scenario: {
      setting: 'math modelling studio',
      project: 'Percentile Portfolio'
    },
    wordSets: {
      core: ['fragile', 'fertile', 'docile', 'agile', 'juvenile', 'mobile', 'versatile', 'reptile', 'tactile', 'ductile'],
      extension: ['projectile', 'volatile', 'hostile', 'textile', 'sterile', 'missile', 'senile', 'camomile', 'servile', 'futile'],
      challenge: ['mercantile', 'subtile', 'versatile', 'domicile', 'puerile', 'juvenile', 'fragilely', 'gentile', 'agilely', 'ductilely']
    }
  },
  {
    id: 'add-the-greek-suffix-logy-meaning-study-of-field-of-knowledge-e-g-biology-geolog',
    concept: 'Add the Greek suffix -logy meaning “study of, field of knowledge”',
    suffix: '-logy',
    suffixLabel: '-logy Suffix',
    meaning: 'study of',
    scenario: {
      setting: 'science symposium',
      project: 'Logy Library'
    },
    wordSets: {
      core: ['biology', 'geology', 'zoology', 'ecology', 'meteorology', 'technology', 'psychology', 'mythology', 'sociology', 'archaeology'],
      extension: ['astrology', 'anthropology', 'criminology', 'immunology', 'neurology', 'pharmacology', 'paleontology', 'cardiology', 'microbiology', 'dermatology'],
      challenge: ['epidemiology', 'ornithology', 'ethnology', 'seismology', 'virology', 'limnology', 'morphology', 'cryptozoology', 'astrobiology', 'cosmology']
    }
  },
  {
    id: 'add-the-latin-suffix-ory-meaning-place-or-something-having-a-specific-use-to-ver',
    concept:
      'Add the Latin suffix -ory meaning “place or something having a specific use” to verbs and nouns',
    suffix: '-ory',
    suffixLabel: '-ory Suffix',
    meaning: 'place or relating to',
    scenario: {
      setting: 'history archive workshop',
      project: 'Memory Repository'
    },
    wordSets: {
      core: ['laboratory', 'observatory', 'dormitory', 'inventory', 'territory', 'factory', 'directory', 'armory', 'oratory', 'celebratory'],
      extension: ['obligatory', 'migratory', 'regulatory', 'congratulatory', 'compulsory', 'conservatory', 'explanatory', 'preparatory', 'respiratory', 'advisory'],
      challenge: ['suppository', 'observatory', 'perfunctory', 'promissory', 'illusory', 'commendatory', 'interrogatory', 'acclamatory', 'repository', 'lavatory']
    }
  },
  {
    id: 'add-the-vowel-suffixes-ion-sion-and-ssion-meaning-act-of-state-of-result-of-to-c',
    concept:
      'Add the vowel suffixes -ion, -sion, and -ssion meaning “act of, state of, result of” to create nouns',
    suffix: '-ion/-sion/-ssion',
    suffixLabel: '-ion Family',
    meaning: 'act, process, result',
    scenario: {
      setting: 'research publication studio',
      project: 'Innovation Compendium'
    },
    wordSets: {
      core: ['decision', 'persuasion', 'admission', 'division', 'collision', 'expansion', 'discussion', 'invasion', 'extension', 'revision'],
      extension: ['innovation', 'conclusion', 'transition', 'confession', 'suspension', 'conversion', 'immersion', 'commission', 'submission', 'precision'],
      challenge: ['apprehension', 'intermission', 'intervention', 'suppression', 'transmission', 'contradiction', 'progression', 'supervision', 'compression', 'procession']
    }
  }
];

const rootMetas = [
  {
    id: 'know-the-greek-and-latin-roots-relating-to-number-duo-two-e-g-duet-dual-duplicat',
    concept: 'Know the Greek and Latin roots relating to number duo “two”',
    root: 'duo',
    rootLabel: 'Duo/Du Root',
    meaning: 'two',
    scenario: {
      setting: 'mathematics showcase',
      project: 'Number Narratives'
    },
    wordSets: {
      core: ['duet', 'dual', 'duplicate', 'double', 'duplex', 'duo', 'bicycle', 'binary', 'bifocal', 'dioxide'],
      extension: ['dualism', 'duologue', 'biennial', 'dichotomy', 'diploid', 'bilingual', 'diverge', 'divide', 'dividend', 'diverse'],
      challenge: ['dodecahedron', 'dichotomous', 'duplicity', 'duodecimal', 'bidirectional', 'biannual', 'dihybrid', 'dissonance', 'diphthong', 'dilation']
    }
  },
  {
    id: 'know-the-following-latin-bases-aqua-meaning-water-e-g-aquatic-aquarium-aquamarin',
    concept: 'Know the Latin base aqua meaning “water”',
    root: 'aqua',
    rootLabel: 'Aqua Root',
    meaning: 'water',
    scenario: {
      setting: 'marine biology lab',
      project: 'Aquatic Atlas'
    },
    wordSets: {
      core: ['aquatic', 'aquarium', 'aquamarine', 'aqueduct', 'aquifer', 'aqueous', 'aquaplane', 'aquaculture', 'aquarist', 'subaqueous'],
      extension: ['aquaponics', 'aquiferous', 'aquarelle', 'aquanaut', 'aqualung', 'aquafarm', 'aquacade', 'aquapark', 'aquaponic', 'aquatint'],
      challenge: ['aquaculturist', 'aquaregium', 'aquiferousness', 'aquaretic', 'hydroacoustics', 'aquavit', 'aquanautics', 'aquarestoration', 'aquaplaning', 'aquatinting']
    }
  },
  {
    id: 'know-the-following-greek-bases-di-meaning-two-or-in-parts-e-g-digraph-divert-dia',
    concept: 'Know the Greek base di- meaning “two or in parts”',
    root: 'di-',
    rootLabel: 'Di Root',
    meaning: 'two, apart',
    scenario: {
      setting: 'language arts lab',
      project: 'Di- Explorers'
    },
    wordSets: {
      core: ['digraph', 'divert', 'dialogue', 'divide', 'dioxide', 'diploma', 'dilemma', 'diphthong', 'diagonal', 'diameter'],
      extension: ['diversify', 'dichotomy', 'dissuade', 'dihedral', 'dilapidated', 'diaphanous', 'diorama', 'diligent', 'divergent', 'diatomic'],
      challenge: ['dissonance', 'dichotomous', 'diacritical', 'diaphanousness', 'differentiation', 'diastolic', 'diaphragmatic', 'diagenesis', 'diastema', 'differential']
    }
  }
];

const prefixResources = Object.fromEntries(prefixMetas.map((meta) => [meta.id, buildPrefixResource(meta)]));
const suffixResources = Object.fromEntries(suffixMetas.map((meta) => [meta.id, buildSuffixResource(meta)]));
const rootResources = Object.fromEntries(rootMetas.map((meta) => [meta.id, buildRootResource(meta)]));

const morphologicalLevel5 = {
  ...manualMorphologyLevel5,
  ...prefixResources,
  ...suffixResources,
  ...rootResources
};

export const level5ResourceLibrary = {
  Phonology: phonologyLevel5,
  'Spelling Patterns': spellingPatternsLevel5,
  Morphology: morphologicalLevel5
};
