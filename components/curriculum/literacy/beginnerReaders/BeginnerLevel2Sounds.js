// components/curriculum/literacy/beginnerReaders/BeginnerLevel2Sounds.js
// LEVEL 2 - SINGLE SOUND FOCUS
// Single letter or digraphs/blends focus with mixture of sounds, simple and trickier words

export const BEGINNER_LEVEL_2_SOUNDS = [
  {
    id: 'focus-sh',
    sound: 'sh',
    title: 'The SH Sound',
    description: 'Learning the SH digraph sound',
    image: '🤫', // Shush
    practices: [
      {
        type: 'sound-recognition',
        content: 'SH makes the "shh" sound like when we say be quiet! 🤫',
        instructions: 'Say "shh" and put your finger to your lips'
      },
      {
        type: 'sound-mixing',
        content: 'sh  s  t  sh  a  sh  p  sh  i  sh  n  sh',
        instructions: 'Say each sound. Notice how SH is different from S'
      },
      {
        type: 'simple-words',
        content: 'she    shop    ship    shut    show',
        instructions: 'Easy SH words - read them slowly'
      },
      {
        type: 'tricky-words',
        content: 'shampoo    mushroom    fishing    sunshine',
        instructions: 'Harder SH words - break them into parts'
      }
    ],
    targetWords: ['she', 'shop', 'ship', 'shut', 'show', 'fish', 'dish', 'wish'],
    soundFocus: 'SH digraph recognition and blending'
  },
  {
    id: 'focus-ch',
    sound: 'ch',
    title: 'The CH Sound',
    description: 'Learning the CH digraph sound',
    image: '🚂', // Train (choo choo)
    practices: [
      {
        type: 'sound-recognition',
        content: 'CH makes the "ch" sound like a train! Choo choo! 🚂',
        instructions: 'Say "ch ch ch" like a train starting up'
      },
      {
        type: 'sound-mixing',
        content: 'ch  s  a  ch  t  ch  p  ch  i  ch  n  ch',
        instructions: 'Say each sound. Notice the special CH sound'
      },
      {
        type: 'simple-words',
        content: 'chat    chip    chop    chin    much',
        instructions: 'Easy CH words - sound them out'
      },
      {
        type: 'tricky-words',
        content: 'children    chocolate    sandwich    lunchtime',
        instructions: 'Harder CH words - take your time'
      }
    ],
    targetWords: ['chat', 'chip', 'chop', 'chin', 'much', 'rich', 'such', 'lunch'],
    soundFocus: 'CH digraph recognition and blending'
  },
  {
    id: 'focus-th',
    sound: 'th',
    title: 'The TH Sound',
    description: 'Learning the TH digraph sound',
    image: '👅', // Tongue
    practices: [
      {
        type: 'sound-recognition',
        content: 'TH makes the "th" sound - put your tongue between your teeth! 👅',
        instructions: 'Feel your tongue touch your teeth when you say "th"'
      },
      {
        type: 'sound-mixing',
        content: 'th  s  a  th  t  th  p  th  i  th  n  th',
        instructions: 'Say each sound. Feel the TH with your tongue'
      },
      {
        type: 'simple-words',
        content: 'the    this    that    with    then',
        instructions: 'Common TH words we use every day'
      },
      {
        type: 'tricky-words',
        content: 'things    mother    brother    together',
        instructions: 'Longer TH words - break them down'
      }
    ],
    targetWords: ['the', 'this', 'that', 'with', 'then', 'path', 'bath', 'math'],
    soundFocus: 'TH digraph recognition and tongue placement'
  },
  {
    id: 'focus-ck',
    sound: 'ck',
    title: 'The CK Sound',
    description: 'Learning the CK ending sound',
    image: '🦆', // Duck
    practices: [
      {
        type: 'sound-recognition',
        content: 'CK makes the "k" sound at the end of words like duck! 🦆',
        instructions: 'Say "quack" and hear the CK sound at the end'
      },
      {
        type: 'sound-mixing',
        content: 'ck  s  a  ck  t  ck  p  ck  i  ck  n  ck',
        instructions: 'CK usually comes at the end of words'
      },
      {
        type: 'simple-words',
        content: 'back    kick    duck    rock    neck',
        instructions: 'CK ending words - listen for the final sound'
      },
      {
        type: 'tricky-words',
        content: 'chicken    pocket    cricket    bucket',
        instructions: 'Longer CK words - find the CK sound'
      }
    ],
    targetWords: ['back', 'kick', 'duck', 'rock', 'neck', 'sick', 'pick', 'luck'],
    soundFocus: 'CK ending sound recognition'
  },
  {
    id: 'focus-ng',
    sound: 'ng',
    title: 'The NG Sound',
    description: 'Learning the NG ending sound',
    image: '🔔', // Bell (ring)
    practices: [
      {
        type: 'sound-recognition',
        content: 'NG makes the "ng" sound like a bell ringing! 🔔 Ring ring!',
        instructions: 'Say "ring" and feel the NG sound in your throat'
      },
      {
        type: 'sound-mixing',
        content: 'ng  s  a  ng  t  ng  p  ng  i  ng  n  ng',
        instructions: 'NG makes a special sound - feel it in your throat'
      },
      {
        type: 'simple-words',
        content: 'ring    sing    long    king    wing',
        instructions: 'NG ending words - feel the throat vibration'
      },
      {
        type: 'tricky-words',
        content: 'morning    evening    nothing    something',
        instructions: 'Longer NG words - listen carefully'
      }
    ],
    targetWords: ['ring', 'sing', 'long', 'king', 'wing', 'song', 'bang', 'hang'],
    soundFocus: 'NG ending sound and throat placement'
  },
  {
    id: 'focus-qu',
    sound: 'qu',
    title: 'The QU Sound',
    description: 'Learning the QU sound combination',
    image: '👑', // Queen
    practices: [
      {
        type: 'sound-recognition',
        content: '☀️ QU makes the "kw" sound like in queen! 👑 Q always has U with it!\n🌙 QU makes the "kw" sound like in queen! 👑 Q always has U with it!',
        instructions: 'Partner Reading: Say "queen" and hear the "kw" sound at the start'
      },
      {
        type: 'sound-mixing',
        content: '☀️ qu  s  a  qu  t  qu  p  qu  i  qu  n  qu\n🌙 qu  m  qu  o  qu  r  qu  e  qu  u  qu',
        instructions: 'Partner Reading: Q and U are always together making "kw"'
      },
      {
        type: 'simple-words',
        content: '☀️ quit    quiz    quick    quiet    quack\n🌙 queen    quite    quest    quote    quart',
        instructions: 'Partner Reading: QU beginning words - hear the "kw" sound'
      },
      {
        type: 'tricky-words',
        content: '☀️ question    squirrel    aquarium    earthquake\n🌙 quarter    squash    liquid    antique',
        instructions: 'Partner Reading: QU in longer words - can you find it?'
      }
    ],
    targetWords: ['quit', 'quiz', 'quick', 'quiet', 'quack', 'queen', 'quite', 'quest'],
    soundFocus: 'QU combination and "kw" sound recognition'
  }
];