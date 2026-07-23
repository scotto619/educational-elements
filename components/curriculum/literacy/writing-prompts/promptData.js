// components/curriculum/literacy/writing-prompts/promptData.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared data layer for the Writing Studio (teacher + student).
//
//  • TEXT_TYPE_CONFIG — one entry per text type (folder in VisualPrompts/):
//    labels, colours, structure guide, generic word bank & sentence starters,
//    and a success-criteria checklist used by the student editor.
//  • PROMPT_SCAFFOLDS — hand-authored, image-specific scaffolding keyed by
//    "<Folder>/<num>". Prompts without an entry fall back to the type's
//    generic scaffold, so newly added images work immediately.
//  • Helper functions used by both the teacher and student components.
//
// Adding prompts: drop images into public/Curriculum/Literacy/VisualPrompts/
// and run `node scripts/generateWritingPromptsManifest.js`. Optionally add a
// scaffold entry here for image-specific word banks and starters.
// ─────────────────────────────────────────────────────────────────────────────

import { PROMPT_MANIFEST } from './promptManifest';

// NOTE: exact case matters — Next serves /public files case-sensitively.
export const PROMPTS_BASE_PATH = '/Curriculum/Literacy/VisualPrompts';

// ═════════════════════════════════════════════════════════════════════════════
// TEXT TYPE CONFIGURATION
// ═════════════════════════════════════════════════════════════════════════════

export const TEXT_TYPE_CONFIG = {
  Narrative: {
    id: 'Narrative',
    label: 'Narrative',
    tagline: 'Tell an imaginative story that hooks your reader',
    icon: '📖',
    accent: 'violet',
    gradient: 'from-violet-600 to-fuchsia-600',
    structure: [
      {
        title: 'Orientation',
        short: 'Hook your reader — who, where, when',
        detail: 'Open with a hook (action, dialogue, a question or a vivid description). Introduce your main character and paint the setting.',
        tips: ['Start in the middle of something interesting', 'Show the setting through the senses', 'Make us care about your character straight away'],
      },
      {
        title: 'Build-Up',
        short: 'Something begins to change',
        detail: 'Life is normal… until it isn\'t. Hint that something unusual is coming and build tension step by step.',
        tips: ['Slow down time at important moments', 'Drop small clues about what\'s coming', 'Use short sentences to build pace'],
      },
      {
        title: 'Complication',
        short: 'The problem strikes',
        detail: 'This is the heart of the story — the biggest problem, danger or decision your character faces. Emotions run highest here.',
        tips: ['Make the problem feel BIG for your character', 'Show emotions through actions and body language', 'Let your character struggle before they succeed'],
      },
      {
        title: 'Resolution',
        short: 'The problem is solved',
        detail: 'Show how your character solves the problem — through cleverness, courage, kindness or help from a friend.',
        tips: ['Let your character earn the solution', 'Avoid "…and then I woke up"', 'Show how your character has changed'],
      },
      {
        title: 'Ending',
        short: 'Leave a lasting impression',
        detail: 'Wrap up loose ends and leave your reader with a feeling — a laugh, a shiver, a question or a warm glow.',
        tips: ['Echo an idea from your opening', 'End with an image, thought or piece of dialogue', 'A final twist can be unforgettable'],
      },
    ],
    craft: [
      { name: 'Show, don\'t tell', tip: 'Instead of "I was scared", try "My hands trembled on the door handle."' },
      { name: 'Sensory details', tip: 'What can your character see, hear, smell, taste and feel?' },
      { name: 'Dialogue', tip: 'Let characters speak — it brings scenes to life and reveals personality.' },
      { name: 'Strong verbs', tip: '"Sprinted", "crept" and "stumbled" beat "went" every time.' },
      { name: 'Vary your sentences', tip: 'Mix long, flowing sentences with short, punchy ones. Like this.' },
    ],
    genericWordBank: {
      'Nouns': ['adventure', 'shadow', 'whisper', 'journey', 'stranger', 'secret', 'horizon', 'courage'],
      'Verbs': ['discover', 'creep', 'glimmer', 'race', 'vanish', 'tremble', 'soar', 'explore'],
      'Adjectives': ['mysterious', 'ancient', 'gleaming', 'fearless', 'hidden', 'enormous', 'silent', 'unexpected'],
    },
    genericStarters: [
      'It all began the moment I saw it.',
      'Nobody believed me, but I knew what I had seen.',
      'The day started like any other — until everything changed.',
    ],
    successCriteria: [
      'My opening hooks the reader',
      'I introduced my character and setting',
      'My story has a clear problem',
      'I used sensory details (see, hear, feel…)',
      'I showed feelings instead of just telling them',
      'My ending wraps up the story',
      'I checked my punctuation and paragraphs',
    ],
    studentPlanning: ['Who is in this picture — and who is just out of frame?', 'What happened one minute before this moment?', 'What happens next… and what could go wrong?'],
  },

  Persuasive: {
    id: 'Persuasive',
    label: 'Persuasive',
    tagline: 'Convince your reader with powerful arguments',
    icon: '📣',
    accent: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    structure: [
      {
        title: 'Introduction',
        short: 'Hook + state your position',
        detail: 'Grab attention with a striking fact, question or image — then state your opinion clearly and confidently.',
        tips: ['Try a rhetorical question or a surprising fact', 'Use high-modality words: must, should, definitely', 'Preview your strongest reasons'],
      },
      {
        title: 'Argument 1',
        short: 'Your strongest reason + evidence',
        detail: 'Lead with your most convincing reason. Back it up with facts, examples or expert opinions.',
        tips: ['One clear reason per paragraph', 'Explain HOW your evidence proves your point', 'Statistics and examples are persuasive gold'],
      },
      {
        title: 'Argument 2',
        short: 'A different reason + evidence',
        detail: 'Add a second, different reason. Appeal to your reader\'s emotions as well as their logic.',
        tips: ['Start with a connective: furthermore, in addition', 'Emotive language makes readers feel your argument', 'Speak directly to the reader — "imagine if…"'],
      },
      {
        title: 'Counter-Argument',
        short: 'What might others say?',
        detail: 'Show you understand the other side — then explain politely and firmly why your position is still stronger.',
        tips: ['"Some people claim… however…"', 'Knocking down the other side makes yours stronger', 'Stay respectful — it makes you more convincing'],
      },
      {
        title: 'Conclusion',
        short: 'Restate + call to action',
        detail: 'Restate your position, summarise your reasons, and finish with a powerful call to action.',
        tips: ['Never introduce new arguments here', 'Tell the reader exactly what to do next', 'End with your most memorable line'],
      },
    ],
    craft: [
      { name: 'High modality', tip: 'Use strong words: must, will, definitely, certainly — not might or maybe.' },
      { name: 'Rhetorical questions', tip: '"How would YOU feel if…?" makes the reader stop and think.' },
      { name: 'Rule of three', tip: 'Group ideas in threes: "cleaner, safer, and fairer for everyone."' },
      { name: 'Emotive language', tip: 'Choose words that spark feelings: "heartbreaking", "unforgettable", "unjust".' },
      { name: 'Facts & statistics', tip: 'Numbers are convincing — even sensible estimates strengthen a claim.' },
    ],
    genericWordBank: {
      'Topic words': ['community', 'evidence', 'benefit', 'consequence', 'responsibility', 'future', 'solution', 'choice'],
      'Power verbs': ['believe', 'urge', 'insist', 'demand', 'protect', 'improve', 'convince', 'transform'],
      'Emotive adjectives': ['vital', 'shocking', 'unacceptable', 'remarkable', 'urgent', 'unfair', 'essential', 'powerful'],
    },
    genericStarters: [
      'Have you ever stopped to think about…?',
      'I strongly believe that…',
      'It is time for us to take action.',
    ],
    successCriteria: [
      'I stated my position clearly in the introduction',
      'Each paragraph has one reason with evidence',
      'I used high-modality words (must, should…)',
      'I included emotive language',
      'I answered a counter-argument',
      'My conclusion has a call to action',
      'I checked my punctuation and paragraphs',
    ],
    studentPlanning: ['What is this picture asking us to decide?', 'What are your three strongest reasons?', 'What would someone who disagrees say — and how will you answer them?'],
  },

  Informative: {
    id: 'Informative',
    label: 'Informative',
    tagline: 'Explain a topic clearly with facts and detail',
    icon: '🔍',
    accent: 'emerald',
    gradient: 'from-emerald-600 to-teal-600',
    structure: [
      {
        title: 'Classification',
        short: 'Introduce and define your topic',
        detail: 'Tell the reader exactly what your topic is and which group or category it belongs to. A surprising fact makes a great opening.',
        tips: ['Try a definition: "A ___ is a ___ that ___"', 'Hook the reader with an amazing fact', 'Let the reader know what your report will cover'],
      },
      {
        title: 'Features',
        short: 'What is it like? What are its parts?',
        detail: 'Describe the main features, parts or characteristics of your topic with precise detail.',
        tips: ['Group facts about the same thing into one paragraph', 'Use technical vocabulary', 'Sizes, numbers and comparisons paint a clear picture'],
      },
      {
        title: 'How & Why',
        short: 'Explain how it works or why it happens',
        detail: 'Explain the process step by step. Show cause and effect so the reader understands how it all fits together.',
        tips: ['Use connectives: because, therefore, as a result', 'Order words help: first, next, then, finally', 'Stay in the present tense'],
      },
      {
        title: 'Fascinating Facts',
        short: 'Zoom in on the most interesting details',
        detail: 'Share the surprising facts, records and details most people don\'t know. This is the paragraph readers remember.',
        tips: ['Numbers stick in the mind', 'Compare to everyday things ("as heavy as a bus")', 'Pick facts your reader will want to retell'],
      },
      {
        title: 'Conclusion',
        short: 'Sum up and leave the reader thinking',
        detail: 'Briefly sum up your topic and explain why it matters — or what might happen to it in the future.',
        tips: ['No new information here', 'Link back to your opening', 'End with a thought-provoking fact or question'],
      },
    ],
    craft: [
      { name: 'Technical vocabulary', tip: 'Use the correct scientific words — and explain each one the first time you use it.' },
      { name: 'Present tense', tip: 'Reports describe how things ARE: "Bees live in colonies", not "Bees lived".' },
      { name: 'Third person', tip: 'Write about the topic, not about yourself — save "I think" for persuasive writing.' },
      { name: 'Facts, not opinions', tip: 'Every sentence should be checkable and true.' },
      { name: 'Compare to explain', tip: '"A blue whale\'s heart is the size of a small car" beats "its heart is big".' },
    ],
    genericWordBank: {
      'Topic words': ['features', 'habitat', 'process', 'cycle', 'structure', 'species', 'environment', 'system'],
      'Precise verbs': ['consists', 'contains', 'produces', 'develops', 'occurs', 'survives', 'transforms', 'depends'],
      'Technical adjectives': ['remarkable', 'complex', 'essential', 'unique', 'natural', 'extraordinary', 'microscopic', 'powerful'],
    },
    genericStarters: [
      'Did you know that…?',
      'This is one of the most fascinating subjects in the natural world.',
      'Scientists have discovered that…',
    ],
    successCriteria: [
      'My opening tells the reader exactly what the topic is',
      'My facts are true and checkable',
      'I grouped information into paragraphs by subtopic',
      'I used technical vocabulary (and explained it)',
      'I wrote in the present tense',
      'My conclusion sums up why the topic matters',
      'I checked my punctuation and spelling',
    ],
    studentPlanning: ['What is this picture showing — and what do you already know about it?', 'What would your reader need explained first?', 'Which three amazing facts will you include?'],
  },
};

// Fallback config for text-type folders added later without a config entry —
// they still work with a sensible generic writing structure.
export const DEFAULT_TYPE_CONFIG = {
  tagline: 'Respond to the picture in your own words',
  icon: '🖼️',
  accent: 'sky',
  gradient: 'from-sky-500 to-indigo-600',
  structure: [
    { title: 'Beginning', short: 'Set the scene', detail: 'Introduce your topic or story and hook your reader\'s attention.', tips: ['Open with something surprising', 'Let the reader know what this piece is about'] },
    { title: 'Middle', short: 'Develop your ideas', detail: 'Build your ideas step by step, in clear paragraphs, using details from the picture.', tips: ['One main idea per paragraph', 'Use details you can see in the image'] },
    { title: 'End', short: 'Finish strongly', detail: 'Wrap up your writing and leave your reader with something to remember.', tips: ['Echo your opening idea', 'End with a strong final line'] },
  ],
  craft: [
    { name: 'Strong vocabulary', tip: 'Swap plain words for precise, interesting ones.' },
    { name: 'Detail from the image', tip: 'Zoom in on small details others might miss.' },
  ],
  genericWordBank: {
    'Nouns': ['detail', 'moment', 'scene', 'feeling', 'idea', 'place', 'reason', 'picture'],
    'Verbs': ['describe', 'notice', 'imagine', 'explain', 'wonder', 'observe', 'create', 'explore'],
    'Adjectives': ['striking', 'unusual', 'vivid', 'fascinating', 'memorable', 'curious', 'bold', 'remarkable'],
  },
  genericStarters: ['When I look at this picture, I notice…', 'This image makes me think about…', 'At first glance you might miss it, but…'],
  successCriteria: [
    'My opening hooks the reader',
    'My ideas are organised into paragraphs',
    'I used interesting vocabulary',
    'I checked my punctuation and spelling',
  ],
  studentPlanning: ['What is happening in this picture?', 'What details stand out to you?', 'What do you want your reader to think or feel?'],
};

// ═════════════════════════════════════════════════════════════════════════════
// PER-PROMPT SCAFFOLDS (hand-authored, image-specific)
// Key format: "<Folder>/<image number>"
// ═════════════════════════════════════════════════════════════════════════════

export const PROMPT_SCAFFOLDS = {
  // ── Narrative ──────────────────────────────────────────────────────────────
  'Narrative/1': {
    title: 'The Door in the Tree',
    hook: 'Deep in the forest, a carved door glows at the foot of an ancient tree. Tonight, for the first time in a hundred years, it is unlocked…',
    wordBank: {
      'Nouns': ['doorway', 'roots', 'forest', 'keyhole', 'moonlight', 'hinges', 'secret', 'threshold'],
      'Verbs': ['creak', 'glimmer', 'whisper', 'beckon', 'tiptoe', 'unlock', 'vanish', 'tremble'],
      'Adjectives': ['ancient', 'twisted', 'mysterious', 'gnarled', 'enchanted', 'silver', 'hidden', 'silent'],
    },
    starters: [
      'The door had never been open before — until tonight.',
      'Nobody in the village ever spoke about the old tree, and now I knew why.',
      'As my fingers touched the carved handle, the whole forest fell silent.',
    ],
  },
  'Narrative/3': {
    title: 'Balloon Voyage',
    hook: 'The burner roars, the ropes strain, and the desert unrolls beneath you like a golden map. Where is this balloon taking you — and why?',
    wordBank: {
      'Nouns': ['basket', 'horizon', 'canyon', 'breeze', 'voyage', 'ropes', 'flame', 'sunset'],
      'Verbs': ['drift', 'soar', 'rise', 'glide', 'sway', 'dangle', 'plummet', 'wave'],
      'Adjectives': ['golden', 'endless', 'weightless', 'distant', 'fiery', 'daring', 'calm', 'breathtaking'],
    },
    starters: [
      'The ground shrank beneath us as the balloon lifted into the amber sky.',
      'We had one map, three passengers and no way of turning back.',
      'At sunset the whole desert turned to gold — and that\'s when we saw it.',
    ],
  },
  'Narrative/5': {
    title: 'An Unlikely Friend',
    hook: 'Everyone in town says the creature is dangerous. But here it is, crouched in the doorway, looking just as nervous as you feel…',
    wordBank: {
      'Nouns': ['creature', 'alleyway', 'paw', 'stranger', 'kindness', 'courage', 'whiskers', 'friendship'],
      'Verbs': ['crouch', 'tremble', 'offer', 'blink', 'rumble', 'nuzzle', 'sniff', 'trust'],
      'Adjectives': ['enormous', 'gentle', 'scruffy', 'curious', 'lonely', 'timid', 'loyal', 'misunderstood'],
    },
    starters: [
      'Everyone said the creature was dangerous, but no one had ever said hello.',
      'It was hiding behind the old door — and it looked as nervous as I felt.',
      'Slowly, I held out my hand, and the giant beast leaned closer.',
    ],
  },
  'Narrative/7': {
    title: 'The Great Machine',
    hook: 'A colossal ring of cogs and gears towers over the desert. It has been silent for a hundred years — but today, something inside it begins to tick…',
    wordBank: {
      'Nouns': ['machine', 'cogs', 'gears', 'lever', 'inventor', 'portal', 'desert', 'engine'],
      'Verbs': ['whir', 'clank', 'spin', 'grind', 'hum', 'tick', 'shudder', 'awaken'],
      'Adjectives': ['colossal', 'rusted', 'forgotten', 'mechanical', 'mighty', 'brass', 'ticking', 'unstoppable'],
    },
    starters: [
      'The map called it the Great Machine, and it hadn\'t moved in a hundred years.',
      'With a screech of rusted gears, the enormous wheel began to turn.',
      'Grandpa\'s journal said to bring the key — but not what it would open.',
    ],
  },
  'Narrative/9': {
    title: 'Beyond the Cave',
    hook: 'You step out of the cave and stop dead. Three moons hang in the sky — and none of them are ours. Where are you, and how will you get home?',
    wordBank: {
      'Nouns': ['planet', 'moons', 'canyon', 'spacecraft', 'explorer', 'gravity', 'galaxy', 'homeworld'],
      'Verbs': ['explore', 'glow', 'hover', 'discover', 'wander', 'shimmer', 'echo', 'stride'],
      'Adjectives': ['alien', 'glowing', 'vast', 'crimson', 'distant', 'silent', 'strange', 'unknown'],
    },
    starters: [
      'The cave opened onto a world that wasn\'t on any map.',
      'Three moons hung in the sky, and none of them were ours.',
      'My boots left the first footprints this planet had ever seen.',
    ],
  },
  'Narrative/11': {
    title: 'The Attic',
    hook: 'Dust dances in the light from the skylight. Boxes and shadows crowd every corner. Something up here has been waiting a very long time to be found…',
    wordBank: {
      'Nouns': ['attic', 'ladder', 'dust', 'chest', 'lantern', 'cobwebs', 'skylight', 'treasure'],
      'Verbs': ['climb', 'creak', 'rummage', 'discover', 'flicker', 'uncover', 'sneeze', 'gleam'],
      'Adjectives': ['dusty', 'forgotten', 'crooked', 'shadowy', 'cluttered', 'secret', 'faded', 'curious'],
    },
    starters: [
      'We weren\'t allowed in the attic — which is exactly why we went.',
      'The ladder groaned under my feet as I climbed towards the light.',
      'Under a sheet in the corner sat a chest with my name on it.',
    ],
  },
  'Narrative/13': {
    title: 'The Drawing',
    hook: 'You sketch a girl at the window — and she waves back. What will you draw next… and what will it do?',
    wordBank: {
      'Nouns': ['sketchbook', 'pencil', 'window', 'reflection', 'imagination', 'page', 'smudge', 'daydream'],
      'Verbs': ['sketch', 'blink', 'wave', 'appear', 'shade', 'erase', 'smile', 'escape'],
      'Adjectives': ['curious', 'magical', 'delicate', 'impossible', 'mischievous', 'lifelike', 'grey', 'wonderful'],
    },
    starters: [
      'I drew a girl at the window — and then she waved at me.',
      'My pencil moved before I did, sketching things I\'d never seen.',
      'The picture changed every time I looked away.',
    ],
  },
  'Narrative/15': {
    title: 'The Museum of Wonders',
    hook: 'Glass cases full of strange and precious things line the walls. One exhibit doesn\'t have a label. That\'s the one that just moved…',
    wordBank: {
      'Nouns': ['museum', 'exhibit', 'relic', 'glass case', 'curator', 'artefact', 'plaque', 'wonder'],
      'Verbs': ['gaze', 'wander', 'gleam', 'examine', 'guard', 'stir', 'awaken', 'whisper'],
      'Adjectives': ['rare', 'precious', 'peculiar', 'priceless', 'ancient', 'gleaming', 'mysterious', 'forbidden'],
    },
    starters: [
      'The sign said "Do Not Touch" — but the exhibit touched me first.',
      'Grandpa knew the story of every treasure in the museum, except one.',
      'At closing time, something behind the glass began to move.',
    ],
  },
  'Narrative/17': {
    title: 'The Dream Door',
    hook: 'You wake at midnight, and your bedroom door no longer leads to the hallway. It leads to a floating kingdom in the clouds…',
    wordBank: {
      'Nouns': ['bedroom', 'doorway', 'kingdom', 'castle', 'clouds', 'midnight', 'blanket', 'dream'],
      'Verbs': ['awaken', 'float', 'glow', 'peek', 'drift', 'dare', 'step', 'soar'],
      'Adjectives': ['sleepy', 'magical', 'floating', 'misty', 'impossible', 'pale', 'wondrous', 'brave'],
    },
    starters: [
      'When I woke at midnight, my bedroom door didn\'t lead to the hallway anymore.',
      'The kingdom from my dream was real — and it was waiting.',
      'One step past the doorway, and my slippers touched cloud.',
    ],
  },
  'Narrative/19': {
    title: 'The Storybook',
    hook: 'You open the old book and a castle rises from the page — with waterfalls, forests and tiny lights in its windows. This book doesn\'t tell stories. It grows them…',
    wordBank: {
      'Nouns': ['storybook', 'chapter', 'castle', 'waterfall', 'kingdom', 'ink', 'legend', 'page'],
      'Verbs': ['unfold', 'spill', 'leap', 'pour', 'bloom', 'escape', 'begin', 'sparkle'],
      'Adjectives': ['enchanted', 'miniature', 'sparkling', 'leather-bound', 'living', 'untold', 'magical', 'brand-new'],
    },
    starters: [
      'The book didn\'t tell a story — it grew one.',
      'When I turned the page, water spilled onto my desk.',
      'Every legend has a first page, and I had just opened it.',
    ],
  },
  'Narrative/21': {
    title: 'The House on the Hill',
    hook: 'Every town has a house nobody visits. Tonight, with one flickering lantern, you are going to find out why…',
    wordBank: {
      'Nouns': ['mansion', 'gate', 'lantern', 'shadows', 'staircase', 'cellar', 'whisper', 'moonlight'],
      'Verbs': ['creak', 'flicker', 'dare', 'shudder', 'vanish', 'echo', 'watch', 'drift'],
      'Adjectives': ['abandoned', 'crooked', 'eerie', 'cold', 'moonlit', 'strange', 'brave', 'silent'],
    },
    starters: [
      'Every town has a house nobody visits. Ours was watching me.',
      'The lantern flickered twice — the signal to go in.',
      'They said the house was empty. The light in the window disagreed.',
    ],
  },
  'Narrative/23': {
    title: 'The Journey Begins',
    hook: 'Backpack on, cape flying, the old plane waiting at the end of the dusty road. Some journeys start with a map. This one starts with a dare…',
    wordBank: {
      'Nouns': ['aeroplane', 'runway', 'journey', 'backpack', 'horizon', 'pilot', 'adventure', 'farewell'],
      'Verbs': ['stride', 'board', 'soar', 'promise', 'depart', 'chase', 'roar', 'dream'],
      'Adjectives': ['dusty', 'determined', 'distant', 'brave', 'bold', 'early-morning', 'roaring', 'unforgettable'],
    },
    starters: [
      'I had packed everything except an excuse to stay.',
      'The old plane had one seat left, and it had my name on it.',
      'Some journeys start with a map. Mine started with a dare.',
    ],
  },
  'Narrative/25': {
    title: 'The Treasure Hunters',
    hook: 'Two explorers, one mysterious book, and a shipwreck glinting in the cave light. The tide is coming in — and the clue makes no sense…',
    wordBank: {
      'Nouns': ['treasure', 'map', 'cave', 'shipwreck', 'compass', 'tide', 'clue', 'crew'],
      'Verbs': ['search', 'decode', 'dig', 'sail', 'follow', 'glint', 'bury', 'whisper'],
      'Adjectives': ['hidden', 'salty', 'golden', 'daring', 'rocky', 'legendary', 'secret', 'mysterious'],
    },
    starters: [
      'The map was torn in half — and we had the wrong half.',
      'By the time the tide turned, we had to be out of the cave.',
      'X never marks the spot. That\'s the first rule of treasure hunting.',
    ],
  },
  'Narrative/27': {
    title: 'The Portal',
    hook: 'The stone archway has stood empty in the wasteland for a thousand years. Tonight it is full of stars — and it only opens for one person…',
    wordBank: {
      'Nouns': ['portal', 'archway', 'galaxy', 'stars', 'traveller', 'threshold', 'silence', 'universe'],
      'Verbs': ['step', 'shimmer', 'pull', 'glow', 'cross', 'drift', 'return', 'beckon'],
      'Adjectives': ['infinite', 'glowing', 'silent', 'midnight-blue', 'frozen', 'otherworldly', 'breathtaking', 'ancient'],
    },
    starters: [
      'The archway had stood empty for a thousand years. Tonight it was full of stars.',
      'One step forward and I would leave Earth behind.',
      'The portal only opens for one person. It chose me.',
    ],
  },
  'Narrative/29': {
    title: 'Message in a Bottle',
    hook: 'The waves leave a battered old bottle at your feet. Inside is a rolled-up message — and it is addressed to you, by name…',
    wordBank: {
      'Nouns': ['bottle', 'message', 'shoreline', 'waves', 'ink', 'cork', 'stranger', 'secret'],
      'Verbs': ['wash', 'uncork', 'unroll', 'scrawl', 'drift', 'plead', 'reply', 'rescue'],
      'Adjectives': ['weathered', 'urgent', 'faded', 'salty', 'desperate', 'curious', 'distant', 'mysterious'],
    },
    starters: [
      'The letter inside was addressed to me — by name.',
      '"Help. Island. Hurry." That was all it said.',
      'I threw my reply into the waves and began to wait.',
    ],
  },
  'Narrative/31': {
    title: 'Sidekicks',
    hook: 'By day, you\'re ordinary. But when the capes come out and the city lights flicker on, you and your sidekick have a job to do…',
    wordBank: {
      'Nouns': ['hero', 'sidekick', 'cape', 'city', 'signal', 'rooftop', 'mission', 'disguise'],
      'Verbs': ['patrol', 'leap', 'rescue', 'soar', 'guard', 'dash', 'protect', 'spot'],
      'Adjectives': ['fearless', 'loyal', 'secret', 'speedy', 'unstoppable', 'brave', 'ordinary', 'super'],
    },
    starters: [
      'By day we were ordinary. By night, the city was ours to protect.',
      'Every hero needs a sidekick. Mine had four legs.',
      'The signal appeared over the city — time to move.',
    ],
  },
  'Narrative/33': {
    title: 'The Secret Garden',
    hook: 'Ivy has swallowed the old archway almost completely. No one has walked this path in fifty years. Today, the gate is open…',
    wordBank: {
      'Nouns': ['archway', 'ivy', 'garden', 'gate', 'roses', 'pathway', 'statue', 'key'],
      'Verbs': ['bloom', 'wander', 'unlock', 'rustle', 'tend', 'discover', 'overgrow', 'hide'],
      'Adjectives': ['overgrown', 'forgotten', 'emerald', 'tangled', 'peaceful', 'walled', 'wild', 'secret'],
    },
    starters: [
      'The ivy had swallowed the archway whole — almost.',
      'No one had walked this path in fifty years. Today, I would.',
      'Behind the gate, the garden was still alive — and waiting.',
    ],
  },
  'Narrative/35': {
    title: 'The Expedition',
    hook: 'Wind rattles the tent. Somewhere above, the summit hides in cloud. By lantern light, the explorer opens the journal and begins to write…',
    wordBank: {
      'Nouns': ['expedition', 'summit', 'blizzard', 'journal', 'camp', 'supplies', 'peak', 'courage'],
      'Verbs': ['trek', 'record', 'shiver', 'scale', 'survive', 'chart', 'endure', 'press on'],
      'Adjectives': ['freezing', 'remote', 'treacherous', 'determined', 'icy', 'exhausted', 'fearless', 'uncharted'],
    },
    starters: [
      'Day 47: the mountain has beaten everyone who ever tried. I write this at its feet.',
      'The storm took our tent, our map and very nearly our courage.',
      'Base camp was silent except for my pencil and the wind.',
    ],
  },
  'Narrative/37': {
    title: 'The Enchanted Forest',
    hook: 'Mist curls between the trees, butterflies drift like sparks, and the deer in the clearing don\'t run. They were expecting you…',
    wordBank: {
      'Nouns': ['forest', 'creatures', 'moss', 'sunlight', 'clearing', 'antlers', 'butterflies', 'magic'],
      'Verbs': ['graze', 'flutter', 'glow', 'tiptoe', 'rustle', 'sparkle', 'welcome', 'watch'],
      'Adjectives': ['enchanted', 'misty', 'gentle', 'emerald', 'peaceful', 'shy', 'sunlit', 'magical'],
    },
    starters: [
      'The deer in the clearing didn\'t run. They were expecting me.',
      'Light fell through the trees like something out of a fairytale — because it was.',
      'Every animal in the forest turned to look at the same time.',
    ],
  },
  'Narrative/39': {
    title: 'The Old Ship',
    hook: 'Down at the harbour, the great wooden ship creaks at her moorings in the golden evening light. Tonight, something is being loaded in secret…',
    wordBank: {
      'Nouns': ['galleon', 'harbour', 'sails', 'deck', 'captain', 'cargo', 'anchor', 'voyage'],
      'Verbs': ['dock', 'sail', 'creak', 'navigate', 'haul', 'load', 'set sail', 'weigh anchor'],
      'Adjectives': ['mighty', 'wooden', 'golden', 'seaworthy', 'weather-beaten', 'grand', 'restless', 'legendary'],
    },
    starters: [
      'The old ship had crossed every ocean — and tonight she needed a new crew.',
      'They said she would never sail again. They were wrong.',
      'Down at the harbour, something was being loaded in secret.',
    ],
  },
  'Narrative/41': {
    title: 'The Rainbow Falls',
    hook: 'A tower on a floating island, a waterfall that pours into a rainbow, and butterflies the size of kites. At the top of the tower, a light is waiting…',
    wordBank: {
      'Nouns': ['island', 'tower', 'waterfall', 'rainbow', 'clouds', 'butterflies', 'staircase', 'sky'],
      'Verbs': ['float', 'cascade', 'sparkle', 'flutter', 'climb', 'shimmer', 'soar', 'wish'],
      'Adjectives': ['floating', 'magical', 'glittering', 'impossible', 'joyful', 'sky-high', 'dazzling', 'candy-coloured'],
    },
    starters: [
      'The waterfall didn\'t fall into a river. It fell into a rainbow.',
      'At the top of the floating tower, a light was waiting for me.',
      'Butterflies the size of kites led the way up the cloud path.',
    ],
  },

  // ── Persuasive ─────────────────────────────────────────────────────────────
  'Persuasive/1': {
    title: 'Should Our Class Have a Pet?',
    hook: 'A dog dozing by the reading corner, a rabbit on the mat… Some say a class pet teaches responsibility; others say it\'s a furry distraction. Where do you stand?',
    wordBank: {
      'Topic words': ['classroom', 'responsibility', 'companion', 'allergies', 'routine', 'wellbeing', 'care', 'distraction'],
      'Power verbs': ['believe', 'urge', 'benefit', 'teach', 'improve', 'insist', 'convince', 'distract'],
      'Emotive adjectives': ['calming', 'responsible', 'rewarding', 'unfair', 'noisy', 'caring', 'valuable', 'essential'],
    },
    starters: [
      'Imagine walking into class and being greeted by a wagging tail.',
      'I strongly believe every classroom deserves a class pet.',
      'Some people think pets belong at home — but the evidence says otherwise.',
    ],
  },
  'Persuasive/2': {
    title: 'Should Animals Be Kept in Zoos?',
    hook: 'On one side of the fence, an elephant in an enclosure. On the other, a herd roaming free at sunset. Do zoos protect wild animals — or imprison them?',
    wordBank: {
      'Topic words': ['zoo', 'wildlife', 'habitat', 'enclosure', 'conservation', 'freedom', 'species', 'sanctuary'],
      'Power verbs': ['protect', 'roam', 'confine', 'preserve', 'educate', 'suffer', 'rescue', 'belong'],
      'Emotive adjectives': ['wild', 'endangered', 'cramped', 'natural', 'cruel', 'magnificent', 'safe', 'free'],
    },
    starters: [
      'An elephant can walk fifty kilometres a day — unless it lives in a zoo.',
      'Zoos call themselves protectors, but is that the whole story?',
      'It is time we asked whether wild animals truly belong behind fences.',
    ],
  },
  'Persuasive/3': {
    title: 'Fireworks or Drone Shows?',
    hook: 'Fireworks boom — and pets tremble, ears are covered, smoke fills the sky. Drone shows paint silent whales across the stars. Which should our city choose?',
    wordBank: {
      'Topic words': ['fireworks', 'drones', 'celebration', 'noise', 'pets', 'pollution', 'tradition', 'spectacle'],
      'Power verbs': ['explode', 'terrify', 'dazzle', 'replace', 'celebrate', 'frighten', 'amaze', 'choose'],
      'Emotive adjectives': ['deafening', 'spectacular', 'silent', 'traditional', 'frightening', 'modern', 'dazzling', 'harmless'],
    },
    starters: [
      'Every New Year\'s Eve, thousands of pets tremble under beds. It doesn\'t have to be this way.',
      'Tradition matters — but so do the animals who share our cities.',
      'Drone shows can paint whales across the sky without a single bang.',
    ],
  },
  'Persuasive/4': {
    title: 'Save Our Beaches',
    hook: 'On one stretch of sand, a turtle hatches beside driftwood and clear water. On another, a child stands ankle-deep in plastic. Convince your reader to act.',
    wordBank: {
      'Topic words': ['pollution', 'plastic', 'wildlife', 'shoreline', 'rubbish', 'ocean', 'future', 'community'],
      'Power verbs': ['pollute', 'protect', 'destroy', 'recycle', 'restore', 'choke', 'act', 'respect'],
      'Emotive adjectives': ['pristine', 'polluted', 'precious', 'devastating', 'fragile', 'urgent', 'responsible', 'spotless'],
    },
    starters: [
      'On one side of the beach, a turtle hatches. On the other, a seabird picks through plastic.',
      'Our beaches are drowning in rubbish — and we are the reason.',
      'If we want summers by the sea, we must earn them.',
    ],
  },
  'Persuasive/5': {
    title: 'Streets for Cars or People?',
    hook: 'One street is jammed with honking, smoking traffic. The other hums with bikes, trees and cafés. Which future should our city build?',
    wordBank: {
      'Topic words': ['traffic', 'exhaust', 'bicycles', 'streets', 'exercise', 'air quality', 'community', 'city'],
      'Power verbs': ['pollute', 'pedal', 'choke', 'breathe', 'transform', 'reduce', 'encourage', 'thrive'],
      'Emotive adjectives': ['gridlocked', 'healthy', 'smoggy', 'active', 'clean', 'vibrant', 'congested', 'liveable'],
    },
    starters: [
      'Picture two streets: one jammed with honking cars, one alive with bikes and trees.',
      'Our city has a choice to make — and it starts with how we travel to school.',
      'Every short car trip is a chance we missed to clear the air.',
    ],
  },
  'Persuasive/6': {
    title: 'Two Futures, One Planet',
    hook: 'Half the tree is bare above cracked, smoking earth. The other half is green above rolling hills. Both futures are possible. Which one will we choose?',
    wordBank: {
      'Topic words': ['environment', 'climate', 'drought', 'forests', 'pollution', 'future', 'planet', 'action'],
      'Power verbs': ['destroy', 'restore', 'plant', 'waste', 'protect', 'change', 'flourish', 'choose'],
      'Emotive adjectives': ['barren', 'thriving', 'lifeless', 'lush', 'urgent', 'hopeful', 'damaged', 'green'],
    },
    starters: [
      'One tree, two futures. Which side will we choose?',
      'The planet doesn\'t need us to be perfect — it needs us to start.',
      'We are the first generation to see the damage, and the last who can undo it.',
    ],
  },
  'Persuasive/7': {
    title: 'Screens or Sunshine?',
    hook: 'Inside, a glowing screen and another level to beat. Outside, a treehouse, a creek and mates calling your name. Which is the better way to spend a Saturday?',
    wordBank: {
      'Topic words': ['screen time', 'gaming', 'outdoors', 'adventure', 'exercise', 'imagination', 'friendship', 'balance'],
      'Power verbs': ['scroll', 'explore', 'build', 'climb', 'connect', 'waste', 'balance', 'play'],
      'Emotive adjectives': ['glowing', 'active', 'endless', 'healthy', 'addictive', 'real', 'energetic', 'unforgettable'],
    },
    starters: [
      'While one child levels up indoors, another is building a real treehouse.',
      'Screens promise adventure — the outdoors delivers it.',
      'I\'m not saying gaming is bad. I\'m saying sunshine is better.',
    ],
  },
  'Persuasive/8': {
    title: 'Adopt, Don\'t Shop',
    hook: 'Behind the pet shop glass, puppies wait under bright lights. Across the park, shelter animals wait for a second chance. Where should a new best friend come from?',
    wordBank: {
      'Topic words': ['shelter', 'adoption', 'pet shop', 'rescue', 'breeder', 'companion', 'kennel', 'second chance'],
      'Power verbs': ['adopt', 'rescue', 'abandon', 'deserve', 'choose', 'save', 'support', 'care'],
      'Emotive adjectives': ['abandoned', 'loving', 'hopeful', 'overcrowded', 'loyal', 'heartbreaking', 'kind-hearted', 'forever'],
    },
    starters: [
      'Behind the shiny glass of the pet shop, a shelter dog somewhere waits for a home.',
      'Every year, thousands of pets in shelters wait for a family to choose them.',
      'If you truly love animals, there is only one place to find your next pet.',
    ],
  },
  'Persuasive/9': {
    title: 'Plant a Tree, Change the World',
    hook: 'One girl, one sapling, one hillside at sunset. Planting a tree takes ten minutes — convince your reader it\'s worth every second.',
    wordBank: {
      'Topic words': ['sapling', 'oxygen', 'shade', 'roots', 'forest', 'generation', 'soil', 'habitat'],
      'Power verbs': ['plant', 'grow', 'breathe', 'nurture', 'restore', 'cool', 'shelter', 'flourish'],
      'Emotive adjectives': ['life-giving', 'simple', 'powerful', 'greener', 'hopeful', 'healthy', 'lasting', 'growing'],
    },
    starters: [
      'One small sapling today is a towering tree tomorrow.',
      'Planting a tree takes ten minutes — its gifts last a hundred years.',
      'If every student planted just one tree, imagine the forest we could grow.',
    ],
  },
  'Persuasive/10': {
    title: 'Save the Orangutans',
    hook: 'On one side of the tree: a rainforest full of life. On the other: smoke and machines. Convince your reader the forest is worth saving.',
    wordBank: {
      'Topic words': ['orangutan', 'rainforest', 'habitat', 'deforestation', 'palm oil', 'wildlife', 'bulldozer', 'extinction'],
      'Power verbs': ['destroy', 'protect', 'clear', 'vanish', 'defend', 'replant', 'threaten', 'survive'],
      'Emotive adjectives': ['endangered', 'precious', 'irreplaceable', 'devastating', 'gentle', 'wild', 'vanishing', 'urgent'],
    },
    starters: [
      'On one side of the tree: a rainforest full of life. On the other: silence and smoke.',
      'Orangutans share almost all of our DNA — and we are destroying their home.',
      'Every minute, forests the size of football fields disappear forever.',
    ],
  },
  'Persuasive/11': {
    title: 'Say No to Plastic',
    hook: 'A sea turtle glides through water filled with drifting bags and bottles. To a turtle, a plastic bag looks exactly like a jellyfish. Persuade your reader to act.',
    wordBank: {
      'Topic words': ['plastic', 'ocean', 'pollution', 'straws', 'packaging', 'recycling', 'marine life', 'turtle'],
      'Power verbs': ['choke', 'entangle', 'pollute', 'ban', 'refuse', 'reuse', 'protect', 'drift'],
      'Emotive adjectives': ['single-use', 'deadly', 'avoidable', 'fragile', 'wasteful', 'cleaner', 'innocent', 'urgent'],
    },
    starters: [
      'To a sea turtle, a floating plastic bag looks exactly like lunch.',
      'Every piece of plastic ever made still exists somewhere — much of it in our oceans.',
      'One reusable bottle can replace hundreds of pieces of rubbish.',
    ],
  },
  'Persuasive/12': {
    title: 'Every Home Needs a Pet',
    hook: 'A girl, a golden retriever and a kitten, curled up in the afternoon sun. Are pets just animals in the house — or part of the family?',
    wordBank: {
      'Topic words': ['companionship', 'responsibility', 'friendship', 'comfort', 'exercise', 'family', 'loneliness', 'wellbeing'],
      'Power verbs': ['comfort', 'teach', 'cuddle', 'protect', 'welcome', 'brighten', 'listen', 'belong'],
      'Emotive adjectives': ['loyal', 'comforting', 'playful', 'responsible', 'joyful', 'calming', 'faithful', 'priceless'],
    },
    starters: [
      'A pet doesn\'t care about your worst day — they\'re just happy you\'re home.',
      'Growing up with a pet teaches children lessons no classroom can.',
      'Some friends have four legs and never let you down.',
    ],
  },
  'Persuasive/13': {
    title: 'Libraries Matter',
    hook: 'While the city rushes past the windows, readers of every age are lost in other worlds. Some say libraries are old-fashioned. Prove them wrong — or right.',
    wordBank: {
      'Topic words': ['library', 'community', 'knowledge', 'imagination', 'stories', 'learning', 'refuge', 'generations'],
      'Power verbs': ['discover', 'borrow', 'belong', 'imagine', 'gather', 'preserve', 'inspire', 'escape'],
      'Emotive adjectives': ['priceless', 'welcoming', 'peaceful', 'essential', 'timeless', 'free', 'magical', 'irreplaceable'],
    },
    starters: [
      'In a world of glowing screens, one building still runs on imagination.',
      'A library is the only place where anyone can travel anywhere — for free.',
      'Close a library, and you close a thousand doors.',
    ],
  },

  // ── Informative ────────────────────────────────────────────────────────────
  'Informative/1': {
    title: 'The Water Cycle',
    hook: 'Water rises from the sea, gathers into clouds, falls on the mountains and races back again. Explain Earth\'s greatest recycling system.',
    wordBank: {
      'Topic words': ['evaporation', 'condensation', 'precipitation', 'water vapour', 'clouds', 'runoff', 'ocean', 'collection'],
      'Precise verbs': ['evaporates', 'condenses', 'falls', 'flows', 'rises', 'cools', 'collects', 'repeats'],
      'Technical adjectives': ['continuous', 'invisible', 'endless', 'fresh', 'vital', 'natural', 'recycled', 'powerful'],
    },
    starters: [
      'Every drop of water on Earth has been on an incredible journey.',
      'The water you drank today may once have floated in a cloud — or an ocean.',
      'The water cycle is Earth\'s way of recycling every single drop.',
    ],
  },
  'Informative/2': {
    title: 'Coral Reef Ecosystems',
    hook: 'Above the waves, a quiet tropical island. Below, one of the busiest habitats on Earth. Explain how a coral reef works and why it matters.',
    wordBank: {
      'Topic words': ['coral', 'reef', 'ecosystem', 'polyps', 'marine life', 'algae', 'habitat', 'biodiversity'],
      'Precise verbs': ['shelters', 'feeds', 'grows', 'protects', 'depends', 'thrives', 'builds', 'supports'],
      'Technical adjectives': ['vibrant', 'fragile', 'tropical', 'teeming', 'colourful', 'living', 'underwater', 'endangered'],
    },
    starters: [
      'Coral reefs cover less than one percent of the ocean floor, yet support a quarter of all marine life.',
      'A coral reef is not a rock — it is a living city built by tiny animals.',
      'Beneath the waves lies one of the busiest habitats on Earth.',
    ],
  },
  'Informative/3': {
    title: 'Honey Bees',
    hook: 'Inside the hive, fifty thousand workers build perfect hexagons, feed a queen and dance directions to flowers. Explain the secret world of bees.',
    wordBank: {
      'Topic words': ['hive', 'honeycomb', 'pollen', 'nectar', 'queen', 'worker bees', 'colony', 'pollination'],
      'Precise verbs': ['pollinate', 'collect', 'communicate', 'produce', 'build', 'protect', 'swarm', 'transform'],
      'Technical adjectives': ['busy', 'essential', 'hexagonal', 'golden', 'hardworking', 'organised', 'tiny', 'vital'],
    },
    starters: [
      'One in every three mouthfuls of food you eat exists thanks to bees.',
      'Inside every hive is a city of fifty thousand workers — and a single queen.',
      'A honey bee makes just one twelfth of a teaspoon of honey in its whole life.',
    ],
  },
  'Informative/4': {
    title: 'Your Amazing Immune System',
    hook: 'Zoom inside your bloodstream, where white blood cells hunt down invaders every second of every day. Explain the invisible army that keeps you alive.',
    wordBank: {
      'Topic words': ['white blood cells', 'germs', 'antibodies', 'virus', 'bacteria', 'bloodstream', 'defence', 'infection'],
      'Precise verbs': ['attack', 'defend', 'detect', 'destroy', 'protect', 'remember', 'patrol', 'multiply'],
      'Technical adjectives': ['microscopic', 'invisible', 'constant', 'remarkable', 'protective', 'rapid', 'specialised', 'powerful'],
    },
    starters: [
      'Right now, an invisible army is patrolling your body.',
      'Your body fights thousands of tiny battles every day — and you never notice.',
      'White blood cells are the security guards of your bloodstream.',
    ],
  },
  'Informative/5': {
    title: 'Our Solar System',
    hook: 'Eight planets, one star, and millions of smaller worlds spinning through space. Take your reader on a tour of our corner of the galaxy.',
    wordBank: {
      'Topic words': ['planets', 'orbit', 'Sun', 'gravity', 'asteroid', 'atmosphere', 'moons', 'galaxy'],
      'Precise verbs': ['orbits', 'rotates', 'shines', 'attracts', 'spins', 'travels', 'formed', 'revolves'],
      'Technical adjectives': ['vast', 'rocky', 'gaseous', 'frozen', 'distant', 'enormous', 'ancient', 'mysterious'],
    },
    starters: [
      'Our solar system is home to eight planets, one star and millions of smaller worlds.',
      'If the Sun were a basketball, Earth would be smaller than a peppercorn.',
      'Everything in our solar system — including you — circles one ordinary star.',
    ],
  },
  'Informative/6': {
    title: 'Volcanoes',
    hook: 'This cutaway view shows what most people never see: rivers of molten rock rising from deep underground. Explain how a volcano really works.',
    wordBank: {
      'Topic words': ['magma', 'lava', 'eruption', 'crater', 'crust', 'pressure', 'vent', 'chamber'],
      'Precise verbs': ['erupts', 'flows', 'builds', 'explodes', 'cools', 'hardens', 'forms', 'rumbles'],
      'Technical adjectives': ['molten', 'explosive', 'dormant', 'active', 'fiery', 'destructive', 'powerful', 'ancient'],
    },
    starters: [
      'Beneath the calm surface of some mountains, rock hotter than 1,000 degrees is waiting.',
      'A volcano is a window into the fiery heart of our planet.',
      'When pressure builds deep underground, something has to give.',
    ],
  },
  'Informative/7': {
    title: 'Wetland Ecosystems',
    hook: 'Half above the water, half below — a swamp at sunrise, with an alligator gliding through it. Explain why wetlands are among Earth\'s richest habitats.',
    wordBank: {
      'Topic words': ['wetlands', 'swamp', 'alligator', 'predator', 'food web', 'species', 'filtration', 'habitat'],
      'Precise verbs': ['filters', 'lurks', 'breeds', 'nests', 'absorbs', 'teems', 'shelters', 'balances'],
      'Technical adjectives': ['murky', 'rich', 'protective', 'humid', 'diverse', 'hidden', 'essential', 'thriving'],
    },
    starters: [
      'Wetlands are sometimes called the kidneys of the Earth.',
      'Beneath the still green water, a whole world is at work.',
      'Swamps are not wastelands — they are some of the richest habitats on the planet.',
    ],
  },
  'Informative/8': {
    title: 'The Monarch Butterfly Life Cycle',
    hook: 'Egg, caterpillar, chrysalis, butterfly — four completely different lives in a few short weeks. Explain nature\'s most astonishing transformation.',
    wordBank: {
      'Topic words': ['egg', 'caterpillar', 'chrysalis', 'metamorphosis', 'milkweed', 'larva', 'wings', 'migration'],
      'Precise verbs': ['hatches', 'transforms', 'sheds', 'emerges', 'feeds', 'migrates', 'develops', 'flutters'],
      'Technical adjectives': ['delicate', 'striped', 'remarkable', 'complete', 'hungry', 'fragile', 'orange', 'extraordinary'],
    },
    starters: [
      'In just a few weeks, one creature lives as four completely different forms.',
      'The monarch butterfly begins life smaller than a grain of rice.',
      'Metamorphosis is one of nature\'s most astonishing magic tricks — and it is completely real.',
    ],
  },
  'Informative/9': {
    title: 'Glaciers and Icebergs',
    hook: 'The camera dips below the waterline to reveal the truth: the ice you can see is only the very top. Explain the frozen giants of our planet.',
    wordBank: {
      'Topic words': ['glacier', 'iceberg', 'ice sheet', 'freshwater', 'meltwater', 'climate', 'valley', 'fjord'],
      'Precise verbs': ['carves', 'drifts', 'melts', 'freezes', 'calves', 'flows', 'shrinks', 'floats'],
      'Technical adjectives': ['colossal', 'frozen', 'ancient', 'slow-moving', 'brilliant-blue', 'hidden', 'mighty', 'melting'],
    },
    starters: [
      'Almost ninety percent of an iceberg hides beneath the surface.',
      'Glaciers are rivers of ice that carve mountains — one centimetre at a time.',
      'Some of the ice in today\'s glaciers fell as snow ten thousand years ago.',
    ],
  },
  'Informative/10': {
    title: 'The Life Cycle of Stars',
    hook: 'From a cloud of dust to a blazing sun to a supernova — this diagram shows the whole life of a star. Explain how stars are born, live and die.',
    wordBank: {
      'Topic words': ['nebula', 'supernova', 'red giant', 'black hole', 'gravity', 'fusion', 'galaxy', 'neutron star'],
      'Precise verbs': ['forms', 'burns', 'expands', 'collapses', 'explodes', 'shines', 'fuses', 'fades'],
      'Technical adjectives': ['stellar', 'colossal', 'blazing', 'ancient', 'unimaginable', 'dense', 'luminous', 'spectacular'],
    },
    starters: [
      'Stars are born, live for billions of years, and die in spectacular style.',
      'Every atom in your body was forged inside a dying star.',
      'A star\'s life is a tug-of-war between gravity and fire.',
    ],
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════

const imageNumber = (filename) => {
  const m = String(filename).match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : filename;
};

/** All available text types, with config merged over sensible defaults.
 *  Ordered to match TEXT_TYPE_CONFIG (Narrative first); unknown folders
 *  added later appear at the end in alphabetical order. */
export function getTextTypes() {
  const configOrder = Object.keys(TEXT_TYPE_CONFIG);
  const keys = Object.keys(PROMPT_MANIFEST).sort((a, b) => {
    const ia = configOrder.indexOf(a);
    const ib = configOrder.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  return keys.map((key) => {
    const config = TEXT_TYPE_CONFIG[key] || {};
    return {
      ...DEFAULT_TYPE_CONFIG,
      id: key,
      label: key.replace(/([a-z])([A-Z])/g, '$1 $2'),
      ...config,
      promptCount: PROMPT_MANIFEST[key].images.length,
    };
  });
}

/** Config for one text type (falls back to defaults for unknown folders). */
export function getTypeConfig(typeId) {
  const config = TEXT_TYPE_CONFIG[typeId] || {};
  return {
    ...DEFAULT_TYPE_CONFIG,
    id: typeId,
    label: typeId ? typeId.replace(/([a-z])([A-Z])/g, '$1 $2') : 'Writing',
    ...config,
  };
}

/** All prompts for a text type, each with its scaffold fully resolved. */
export function getPrompts(typeId) {
  const entry = PROMPT_MANIFEST[typeId];
  if (!entry) return [];
  const type = getTypeConfig(typeId);

  return entry.images.map((filename, index) => {
    const num = imageNumber(filename);
    const scaffold = PROMPT_SCAFFOLDS[`${entry.folder}/${num}`] || {};
    return {
      id: `${entry.folder}-${num}`,
      typeId,
      num,
      displayNumber: index + 1,
      image: `${PROMPTS_BASE_PATH}/${entry.folder}/${filename}`,
      title: scaffold.title || `${type.label} Prompt ${index + 1}`,
      hook: scaffold.hook || type.tagline,
      wordBank: scaffold.wordBank || type.genericWordBank,
      starters: scaffold.starters || type.genericStarters,
      hasCustomScaffold: Boolean(PROMPT_SCAFFOLDS[`${entry.folder}/${num}`]),
    };
  });
}

/** Look up a single prompt by its id ("Folder-num"). */
export function getPromptById(promptId) {
  if (!promptId) return null;
  const sep = String(promptId).lastIndexOf('-');
  const typeId = String(promptId).slice(0, sep);
  return getPrompts(typeId).find((p) => p.id === promptId) || null;
}

/** Word count that behaves sensibly with empty strings. */
export function countWords(text) {
  if (!text) return 0;
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

/** Short relative "time ago" label for feeds and story cards. */
export function timeAgo(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  if (Number.isNaN(diff)) return '';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** Accent colour utility classes per text type (kept as full literal class
 *  names so Tailwind's scanner picks them up). */
export const ACCENT_STYLES = {
  violet: {
    chip: 'bg-violet-100 text-violet-700',
    solid: 'bg-violet-600 hover:bg-violet-700 text-white',
    soft: 'bg-violet-50 border-violet-200',
    text: 'text-violet-700',
    ring: 'ring-violet-400',
  },
  amber: {
    chip: 'bg-amber-100 text-amber-700',
    solid: 'bg-amber-500 hover:bg-amber-600 text-white',
    soft: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    ring: 'ring-amber-400',
  },
  emerald: {
    chip: 'bg-emerald-100 text-emerald-700',
    solid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    soft: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    ring: 'ring-emerald-400',
  },
  sky: {
    chip: 'bg-sky-100 text-sky-700',
    solid: 'bg-sky-600 hover:bg-sky-700 text-white',
    soft: 'bg-sky-50 border-sky-200',
    text: 'text-sky-700',
    ring: 'ring-sky-400',
  },
};

export const getAccent = (typeId) => ACCENT_STYLES[getTypeConfig(typeId).accent] || ACCENT_STYLES.sky;
