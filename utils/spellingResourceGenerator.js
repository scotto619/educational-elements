const defaultWordBanks = {
  'Level Foundation': {
    core: ['cat', 'dog', 'sun', 'map', 'bed', 'pig', 'jam', 'run', 'mix', 'web'],
    extension: ['ship', 'ring', 'chat', 'thin', 'duck', 'buzz', 'bell', 'kick', 'mop', 'flag'],
    challenge: ['rain', 'keep', 'boat', 'moon', 'loud', 'seed', 'coat', 'foam', 'team', 'light']
  },
  'Level 1': {
    core: ['play', 'name', 'ride', 'cube', 'stone', 'team', 'rain', 'tray', 'beak', 'glow'],
    extension: ['climb', 'queen', 'shine', 'storm', 'cloud', 'march', 'proud', 'train', 'share', 'coach'],
    challenge: ['teacher', 'doctor', 'dollar', 'about', 'puzzle', 'bridge', 'throat', 'knight', 'gnome', 'whale']
  },
  'Level 2': {
    core: ['baker', 'candle', 'people', 'family', 'cities', 'silver', 'happy', 'lucky', 'magic', 'garden'],
    extension: ['recycle', 'sketch', 'badge', 'catch', 'answer', 'turtle', 'bubble', 'cycle', 'stories', 'cried'],
    challenge: ['journey', 'captain', 'voyage', 'station', 'gesture', 'nature', 'fortune', 'wander', 'adventure', 'creature']
  },
  'Level 3': {
    core: ['earth', 'feature', 'square', 'stair', 'cheer', 'secure', 'shadow', 'famous', 'meadow', 'treasure'],
    extension: ['journey', 'explore', 'anchor', 'thunder', 'adventure', 'courage', 'library', 'mixture', 'history', 'govern'],
    challenge: ['photograph', 'dolphin', 'choreograph', 'technician', 'geology', 'architecture', 'parachute', 'orchestra', 'sculpture', 'invitation']
  },
  'Level 4': {
    core: ['strategy', 'eager', 'fraction', 'declare', 'passage', 'texture', 'harvest', 'mission', 'knotted', 'sparkle'],
    extension: ['consider', 'venture', 'disagree', 'remark', 'narrative', 'caution', 'distant', 'fortunate', 'measure', 'arrange'],
    challenge: ['biography', 'microscope', 'reception', 'signature', 'resilient', 'hydraulic', 'monument', 'recollection', 'consequence', 'expedition']
  },
  'Level 5': {
    core: ['transport', 'generate', 'interact', 'compose', 'symbolic', 'reflect', 'debate', 'conclude', 'emerge', 'structure'],
    extension: ['reluctant', 'creativity', 'sensation', 'clarify', 'assumption', 'nourish', 'ancestor', 'fractional', 'citizen', 'economy'],
    challenge: ['photovoltaic', 'geothermal', 'transmission', 'adolescence', 'circumstance', 'contradictory', 'supervision', 'inefficient', 'appreciation', 'agricultural']
  },
  'Level 6': {
    core: ['collaborate', 'hypothesis', 'inference', 'comparable', 'distortion', 'figurative', 'component', 'migration', 'heritage', 'ethics'],
    extension: ['chronology', 'innovation', 'resistance', 'transform', 'revitalize', 'synthesize', 'legislative', 'articulate', 'philosophy', 'aerospace'],
    challenge: ['telecommunication', 'photosynthesis', 'interrelationship', 'metamorphosis', 'characterization', 'responsibility', 'disproportionate', 'microorganism', 'reconstruction', 'overgeneralization']
  }
};

const targetedWordBanks = [
  {
    matchers: [/two sounds of .*th/i, /voiced/],
    label: 'TH Variations',
    words: {
      core: ['this', 'that', 'then', 'them', 'than', 'thin', 'thank', 'think', 'thick', 'thorn'],
      extension: ['those', 'these', 'though', 'thought', 'thirteen', 'thorough', 'thrive', 'thistle', 'thunder', 'threshold'],
      challenge: ['therefore', 'although', 'northern', 'feathered', 'smoothly', 'withered', 'farthing', 'brotherhood', 'weathering', 'thirtieth']
    }
  },
  {
    matchers: [/double consonant/i],
    label: 'Double Consonants',
    words: {
      core: ['bell', 'miss', 'buzz', 'doll', 'hill', 'puff', 'class', 'jazz', 'happen', 'rabbit'],
      extension: ['butter', 'lesson', 'hidden', 'success', 'address', 'common', 'summit', 'collect', 'fitting', 'letter'],
      challenge: ['embarrass', 'accommodate', 'committee', 'possessive', 'occurrence', 'accessory', 'parallel', 'millennium', 'successive', 'aggressive']
    }
  },
  {
    matchers: [/consonant digraph/i],
    label: 'Consonant Digraphs',
    words: {
      core: ['ship', 'chin', 'whale', 'phone', 'graph', 'chew', 'that', 'when', 'which', 'shell'],
      extension: ['phrase', 'shrimp', 'thrive', 'gnome', 'knock', 'wring', 'badge', 'tchotchke', 'sketch', 'switch'],
      challenge: ['chrysanthemum', 'pharmacy', 'whimsical', 'gnarled', 'wristwatch', 'schematic', 'drought', 'choreograph', 'diphthong', 'whirlpool']
    }
  },
  {
    matchers: [/vowel digraph/i, /vowel team/i],
    label: 'Vowel Teams',
    words: {
      core: ['rain', 'boat', 'team', 'seed', 'road', 'meat', 'coat', 'sail', 'toad', 'beach'],
      extension: ['praise', 'groan', 'stream', 'knead', 'loaf', 'eagle', 'soapy', 'season', 'croak', 'league'],
      challenge: ['daybreak', 'seacoast', 'roadway', 'mealtime', 'beehive', 'floatation', 'seaboard', 'daydream', 'teammate', 'coasting']
    }
  },
  {
    matchers: [/r[- ]?controlled/i],
    label: 'R-Controlled Vowels',
    words: {
      core: ['car', 'storm', 'bird', 'turn', 'start', 'fork', 'fern', 'harm', 'purse', 'shark'],
      extension: ['harvest', 'forward', 'curtain', 'alarm', 'certain', 'courage', 'thirsty', 'surface', 'service', 'journey'],
      challenge: ['extraordinary', 'cartography', 'hurricane', 'furnace', 'furthermore', 'advertisement', 'circular', 'northern', 'courtyard', 'earthquake']
    }
  },
  {
    matchers: [/long ['”"']?a/i, /ai/i],
    label: 'Long A Choices',
    words: {
      core: ['day', 'rain', 'cake', 'play', 'train', 'mail', 'lane', 'stay', 'gate', 'paint'],
      extension: ['praise', 'drain', 'stake', 'relay', 'waist', 'detail', 'again', 'faint', 'neigh', 'obey'],
      challenge: ['maintain', 'campaign', 'greatest', 'portray', 'exclaim', 'airplane', 'quaintly', 'meandering', 'curtail', 'champaign']
    }
  },
  {
    matchers: [/long ['”"']?e/i, /ee/i],
    label: 'Long E Spellings',
    words: {
      core: ['see', 'tree', 'beet', 'need', 'week', 'sleep', 'green', 'clean', 'feet', 'seed'],
      extension: ['between', 'belief', 'evening', 'people', 'piece', 'either', 'complete', 'receive', 'season', 'eager'],
      challenge: ['succeed', 'freedom', 'machinery', 'serene', 'protein', 'phoenix', 'amoeba', 'perceive', 'deceitful', 'achievement']
    }
  },
  {
    matchers: [/long ['”"']?o/i, /oa/i, /ow/i],
    label: 'Long O Spellings',
    words: {
      core: ['boat', 'snow', 'goat', 'road', 'soap', 'toad', 'know', 'glow', 'coat', 'show'],
      extension: ['throat', 'float', 'elbow', 'croak', 'boulder', 'window', 'pillow', 'shadow', 'approach', 'groan'],
      challenge: ['overflow', 'oatmeal', 'rainbow', 'bestow', 'overgrown', 'showcase', 'coasting', 'shoulder', 'overwhelm', 'foreclose']
    }
  },
  {
    matchers: [/long ['”"']?i/i, /igh/i],
    label: 'Long I Patterns',
    words: {
      core: ['light', 'night', 'kite', 'cry', 'high', 'sight', 'mile', 'shine', 'time', 'fine'],
      extension: ['bright', 'fright', 'twice', 'either', 'slight', 'spine', 'icicle', 'hyphen', 'cyclone', 'pirate'],
      challenge: ['highlight', 'nighttime', 'spyglass', 'skyline', 'childlike', 'slyness', 'timeline', 'eyelet', 'dynamite', 'sci-fi']
    }
  },
  {
    matchers: [/suffix \-ing/i],
    label: 'Suffix -ing',
    words: {
      core: ['jumping', 'singing', 'helping', 'reading', 'playing', 'looking', 'dancing', 'sailing', 'smiling', 'cooking'],
      extension: ['traveling', 'studying', 'exploring', 'creating', 'arriving', 'revising', 'researching', 'designing', 'questioning', 'comparing'],
      challenge: ['investigating', 'experimenting', 'collaborating', 'persevering', 'restructuring', 'volunteering', 'strategizing', 'accelerating', 'qualifying', 'negotiating']
    }
  },
  {
    matchers: [/suffix \-ed/i],
    label: 'Suffix -ed',
    words: {
      core: ['jumped', 'played', 'walked', 'called', 'yelled', 'painted', 'helped', 'fixed', 'cleaned', 'moved'],
      extension: ['imagined', 'wandered', 'answered', 'created', 'discovered', 'considered', 'improved', 'debated', 'arranged', 'observed'],
      challenge: ['anticipated', 'negotiated', 'collaborated', 'illustrated', 'authenticated', 'reconstructed', 'consolidated', 'appreciated', 'synthesized', 'recalculated']
    }
  },
  {
    matchers: [/prefix un/i],
    label: 'Prefix un-',
    words: {
      core: ['unfair', 'undo', 'unlock', 'unzip', 'unhappy', 'unsafe', 'unpack', 'untie', 'unknown', 'unreal'],
      extension: ['unfold', 'unwind', 'unseen', 'unequal', 'untangle', 'unstable', 'unspoken', 'unbroken', 'uncommon', 'unlike'],
      challenge: ['unmistakable', 'unbreakable', 'unforgettable', 'unintended', 'unbelievable', 'unpredictable', 'unconventional', 'unproductive', 'unimaginable', 'unattainable']
    }
  },
  {
    matchers: [/prefix re/i],
    label: 'Prefix re-',
    words: {
      core: ['redo', 'rename', 'replay', 'return', 'rewrite', 'rebuild', 'reheat', 'review', 'reopen', 'remake'],
      extension: ['rethink', 'revisit', 'recycle', 'relocate', 'recharge', 'reconsider', 'reappear', 'refocus', 'reorganize', 'remodel'],
      challenge: ['rejuvenate', 'reinvestigate', 'reconstruct', 'reintroduce', 'redistribute', 'reestablish', 'reintegrate', 'reclassification', 'reallocate', 'reinvigorate']
    }
  },
  {
    matchers: [/prefix pre/i],
    label: 'Prefix pre-',
    words: {
      core: ['preview', 'preschool', 'preheat', 'pretest', 'prepare', 'prefix', 'prepay', 'prevent', 'preplan', 'precut'],
      extension: ['predict', 'preheat', 'prebuilt', 'prejudge', 'prenatal', 'preteen', 'prequel', 'preboard', 'preorder', 'preseason'],
      challenge: ['preconceive', 'preposition', 'premeditate', 'predetermine', 'preexisting', 'preeminent', 'preliminary', 'preoccupation', 'prehistory', 'prevalence']
    }
  },
  {
    matchers: [/suffix \-er/i],
    label: 'Suffix -er',
    words: {
      core: ['teacher', 'runner', 'helper', 'player', 'baker', 'farmer', 'leader', 'singer', 'painter', 'reader'],
      extension: ['creator', 'designer', 'performer', 'manager', 'sailor', 'inventor', 'explorer', 'reporter', 'speaker', 'trainer'],
      challenge: ['photographer', 'researcher', 'engineer', 'visionary', 'strategist', 'financier', 'counselor', 'professor', 'philosopher', 'entrepreneur']
    }
  },
  {
    matchers: [/suffix \-est/i],
    label: 'Suffix -est',
    words: {
      core: ['fastest', 'biggest', 'softest', 'brightest', 'longest', 'hottest', 'coldest', 'kindest', 'smartest', 'sweetest'],
      extension: ['boldest', 'proudest', 'bravest', 'toughest', 'highest', 'lowest', 'safest', 'earliest', 'deepest', 'quickest'],
      challenge: ['cleverest', 'energetic', 'silliest', 'diligent', 'graceful', 'relevant', 'resolute', 'resilient', 'inventive', 'permanent']
    }
  },
  {
    matchers: [/prefix dis/i],
    label: 'Prefix dis-',
    words: {
      core: ['dislike', 'disagree', 'disconnect', 'dishonest', 'disobey', 'disappear', 'disapprove', 'disallow', 'discover', 'displace'],
      extension: ['discomfort', 'distract', 'discolor', 'dislodge', 'disrupt', 'disengage', 'disgrace', 'disorient', 'disinfect', 'dismantle'],
      challenge: ['disadvantage', 'disenchantment', 'disproportion', 'disillusionment', 'disintegration', 'disassociation', 'disenfranchise', 'discontinuation', 'disinheritance', 'disempowerment']
    }
  },
  {
    matchers: [/prefix mis/i],
    label: 'Prefix mis-',
    words: {
      core: ['misprint', 'misfit', 'misplace', 'mislead', 'misspell', 'mishear', 'misuse', 'misread', 'mislay', 'mistreat'],
      extension: ['misjudge', 'misquote', 'misalign', 'misapply', 'misbehave', 'misinform', 'mismanage', 'mistrust', 'misconduct', 'misdirect'],
      challenge: ['misrepresentation', 'misinterpretation', 'miscommunication', 'miscalculation', 'misconception', 'misappropriation', 'misidentification', 'misallocation', 'misdemeanor', 'misalignment']
    }
  },
  {
    matchers: [/suffix \-ful/i],
    label: 'Suffix -ful',
    words: {
      core: ['joyful', 'playful', 'helpful', 'careful', 'hopeful', 'thankful', 'colorful', 'cheerful', 'mindful', 'powerful'],
      extension: ['grateful', 'artful', 'skillful', 'thoughtful', 'delightful', 'meaningful', 'resourceful', 'successful', 'peaceful', 'respectful'],
      challenge: ['bountiful', 'masterful', 'insightful', 'plentiful', 'purposeful', 'influential', 'imaginative', 'trustful', 'merciful', 'wonderful']
    }
  },
  {
    matchers: [/suffix \-able/i],
    label: 'Suffix -able',
    words: {
      core: ['likable', 'portable', 'washable', 'teachable', 'printable', 'breakable', 'countable', 'workable', 'movable', 'noticeable'],
      extension: ['comfortable', 'reliable', 'enjoyable', 'valuable', 'adaptable', 'agreeable', 'predictable', 'remarkable', 'considerable', 'changeable'],
      challenge: ['unbelievable', 'unforgettable', 'indispensable', 'extraordinary', 'conversational', 'transferable', 'appreciable', 'measurable', 'programmable', 'marketable']
    }
  },
  {
    matchers: [/suffix \-tion/i],
    label: 'Suffix -tion',
    words: {
      core: ['action', 'motion', 'station', 'nation', 'fiction', 'section', 'caution', 'option', 'portion', 'vacation'],
      extension: ['creation', 'location', 'rotation', 'direction', 'relation', 'decision', 'addition', 'attention', 'invention', 'generation'],
      challenge: ['transportation', 'imagination', 'communication', 'organization', 'celebration', 'revolution', 'destination', 'distribution', 'explanation', 'presentation']
    }
  },
  {
    matchers: [/homophone/i],
    label: 'Homophones',
    words: {
      core: ['to', 'two', 'too', 'there', 'their', 'they\'re', 'sea', 'see', 'one', 'won'],
      extension: ['flare', 'flair', 'pair', 'pear', 'right', 'write', 'break', 'brake', 'flower', 'flour'],
      challenge: ['principal', 'principle', 'stationary', 'stationery', 'complement', 'compliment', 'council', 'counsel', 'desert', 'dessert']
    }
  },
  {
    matchers: [/compound word/i],
    label: 'Compound Words',
    words: {
      core: ['sunset', 'rainbow', 'backpack', 'football', 'snowman', 'toothbrush', 'firefly', 'raincoat', 'cupcake', 'doghouse'],
      extension: ['classroom', 'moonlight', 'sailboat', 'bookstore', 'airport', 'playground', 'homesick', 'butterfly', 'rainstorm', 'sandbox'],
      challenge: ['newscast', 'earthquake', 'daydream', 'waterproof', 'underground', 'afterthought', 'headphones', 'passcode', 'timetable', 'warehouse']
    }
  }
];

function resolveWordBank(concept, level) {
  const lower = concept.toLowerCase();
  for (const bank of targetedWordBanks) {
    if (bank.matchers.some((matcher) => matcher.test(lower))) {
      return bank.words;
    }
  }
  return defaultWordBanks[level] || defaultWordBanks['Level 3'];
}

function createDownloadLink(filename, content) {
  return {
    filename,
    url: `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`
  };
}

function generateSpellingLists(concept, level, id) {
  const bank = resolveWordBank(concept, level);
  const lists = [
    { key: 'core', name: 'Core Practice List', description: 'Introduce the pattern with accessible examples.', color: 'from-emerald-500 to-emerald-600' },
    { key: 'extension', name: 'Extension List', description: 'Broaden understanding with mixed syllable types.', color: 'from-sky-500 to-sky-600' },
    { key: 'challenge', name: 'Challenge List', description: 'Stretch confident spellers with rich vocabulary.', color: 'from-purple-500 to-purple-600' }
  ];

  return lists.map((list) => {
    const words = bank[list.key] || [];
    const printable = [`${list.name}`, `Focus: ${concept}`, '', ...words].join('\n');
    return {
      id: `${id}-${list.key}`,
      title: list.name,
      description: list.description,
      words,
      gradient: list.color,
      download: createDownloadLink(`${id}-${list.key}-list.txt`, printable)
    };
  });
}

function generatePassages(concept, level, id, lists) {
  const focusWords = lists.flatMap((list) => list.words.slice(0, 2)).slice(0, 6);
  const focusText = focusWords.join(', ');
  const baseIntro = `This passage reinforces ${concept.toLowerCase()} for ${level.toLowerCase()} learners.`;

  const passages = [
    {
      id: `${id}-passage-1`,
      title: 'Guided Practice Passage',
      difficulty: 'On-Level',
      text: `${baseIntro} Students read about a curious class that collects words like ${focusText}. They highlight each example and discuss why it matches the focus.`
    },
    {
      id: `${id}-passage-2`,
      title: 'Application Passage',
      difficulty: 'Stretch',
      text: `Learners apply the pattern in context as they explore a vivid scene packed with ${focusText}. Encourage annotation and partner discussion about spelling choices.`
    }
  ];

  return passages.map((passage) => {
    const sentences = passage.text.split(/\s+/).length;
    return {
      ...passage,
      wordCount: sentences,
      download: createDownloadLink(`${passage.id}.txt`, `${passage.title}\nFocus: ${concept}\n\n${passage.text}`)
    };
  });
}

function generateActivities(concept, level, id) {
  const lower = level.toLowerCase();
  return [
    {
      id: `${id}-activity-launch`,
      title: 'Launch Mini Lesson',
      duration: '15 minutes',
      steps: [
        `Introduce the focus: ${concept}.`,
        'Model with two high-visibility examples and think aloud.',
        'Co-construct an anchor chart highlighting the pattern or rule.',
        'Invite students to generate one example in pairs.'
      ]
    },
    {
      id: `${id}-activity-workshop`,
      title: 'Collaborative Word Workshop',
      duration: '20 minutes',
      steps: [
        'Rotate through three stations: word sort, build & write, explain the pattern.',
        'Students record their discoveries in notebooks or digital slides.',
        'Encourage use of color coding and syllable marking.',
        'Finish with a gallery walk to compare strategies.'
      ]
    },
    {
      id: `${id}-activity-application`,
      title: 'Real-World Application',
      duration: '15 minutes',
      steps: [
        `Connect ${concept.toLowerCase()} to authentic reading or writing tasks suitable for ${lower} learners.`,
        'Students highlight examples in current texts or compose sentences.',
        'Quick share-out: Which words best demonstrate today\'s focus?',
        'Add favourite discoveries to the classroom display.'
      ]
    }
  ];
}

function generateTeacherScripts(concept, level, id) {
  return [
    {
      id: `${id}-script-intro`,
      title: 'Explicit Instruction Script',
      sections: [
        'Hook: Display three examples and ask what they share.',
        `Teaching Point: “Today we are mastering how ${concept.toLowerCase()} helps us spell accurately.”`,
        'Guided Practice: Blend, tap, or break the word apart with students.',
        'Check for Understanding: Quick thumbs or mini-whiteboard show.'
      ]
    },
    {
      id: `${id}-script-review`,
      title: 'Spiral Review Script',
      sections: [
        'Warm-Up: Review last week’s focus and connect to current concept.',
        'Active Engagement: Students build a word with letter tiles or magnetic letters.',
        'Link: Prompt learners to spot the pattern during independent reading.',
        'Exit Ticket: One sentence using the focus with evidence of correct spelling.'
      ]
    }
  ];
}

function generateGames(concept, id) {
  return [
    {
      id: `${id}-game-quest`,
      name: 'Spelling Quest Board Game',
      description: 'Teams advance by reading a card, explaining how it matches the focus, then writing it from memory.',
      materials: ['Focus word cards', 'Dice', 'Game markers', 'Recording sheets']
    },
    {
      id: `${id}-game-digital`,
      name: 'Digital Pattern Hunt',
      description: 'Learners scan QR codes around the room that reveal mini-challenges tied to the concept. They log answers in a shared doc.',
      materials: ['Printed QR codes', 'Tablets or devices', 'Shared response board']
    }
  ];
}

function generateDisplays(concept, id) {
  return [
    {
      id: `${id}-display-anchor`,
      title: 'Interactive Anchor Chart',
      description: `Create a layered anchor chart that defines ${concept.toLowerCase()} with magnetic word cards students can move daily.`
    },
    {
      id: `${id}-display-wordwall`,
      title: 'Spotlight Word Wall',
      description: 'Design a sleek display with color-coded headers for core, extension, and challenge words. Include QR links to audio support.'
    }
  ];
}

function generateWorksheets(concept, id) {
  return [
    {
      id: `${id}-worksheet-sort`,
      title: 'Sort & Explain Organizer',
      sections: ['Cut and sort the words', 'Explain the pattern in each column', 'Write two original examples'],
      download: createDownloadLink(`${id}-sorter.txt`, `${concept}\n\n1. Sort words into categories\n2. Describe what you notice\n3. Add original examples`)
    },
    {
      id: `${id}-worksheet-sentences`,
      title: 'Sentence Challenge',
      sections: ['Write a sentence for each focus word', 'Underline the feature that proves the spelling', 'Star your strongest sentence'],
      download: createDownloadLink(`${id}-sentences.txt`, `${concept}\n\nUse each word in a sentence. Underline the focus pattern.`)
    },
    {
      id: `${id}-worksheet-check`,
      title: 'Quick Check Quiz',
      sections: ['Dictation', 'Multiple choice rule check', 'Self-reflection'],
      download: createDownloadLink(`${id}-quiz.txt`, `${concept}\n\n1. Dictation list\n2. Choose the correct spelling\n3. I can explain the rule because...`)
    }
  ];
}

export function buildResourcePack(item, category, level) {
  const { id, text } = item;
  const spellingLists = generateSpellingLists(text, level, id);
  const passages = generatePassages(text, level, id, spellingLists);
  return {
    spellingLists,
    passages,
    activities: generateActivities(text, level, id),
    teacherScripts: generateTeacherScripts(text, level, id),
    games: generateGames(text, id),
    displays: generateDisplays(text, id),
    worksheets: generateWorksheets(text, id)
  };
}
