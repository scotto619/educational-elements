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
        content: `☀️ SH makes the "shh" sound like when we say be quiet! 🤫
🌙 SH makes the "shh" sound like when we say be quiet! 🤫`,
        instructions: 'Partner Reading: Say "shh" and put your finger to your lips'
      },
      {
        type: 'sound-mixing',
        content: `☀️ sh  s  t  sh  a  sh  p  sh  i  sh  n  sh
🌙 sh  m  sh  o  sh  r  sh  e  sh  u  sh`,
        instructions: 'Partner Reading: Say each sound. Notice how SH is different from S'
      },
      {
        type: 'simple-words',
        content: `☀️ she    shop    ship    shut    show
🌙 fish    dish    wash    push    rush`,
        instructions: 'Partner Reading: Easy SH words - read them slowly'
      },
      {
        type: 'tricky-words',
        content: `☀️ shampoo    mushroom    fishing    sunshine
🌙 washing    brushing    crushing    splashing`,
        instructions: 'Partner Reading: Harder SH words - break them into parts'
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
        content: `☀️ CH makes the "ch" sound like a train! Choo choo! 🚂
🌙 CH makes the "ch" sound like a train! Choo choo! 🚂`,
        instructions: 'Partner Reading: Say "ch ch ch" like a train starting up'
      },
      {
        type: 'sound-mixing',
        content: `☀️ ch  s  a  ch  t  ch  p  ch  i  ch  n  ch
🌙 ch  m  ch  o  ch  r  ch  e  ch  u  ch`,
        instructions: 'Partner Reading: Say each sound. Notice the special CH sound'
      },
      {
        type: 'simple-words',
        content: `☀️ chat    chip    chop    chin    much
🌙 rich    such    lunch    touch    teach`,
        instructions: 'Partner Reading: Easy CH words - sound them out'
      },
      {
        type: 'tricky-words',
        content: `☀️ children    chocolate    sandwich    lunchtime
🌙 teacher    kitchen    watching    crunching`,
        instructions: 'Partner Reading: Harder CH words - take your time'
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
        content: `☀️ TH makes the "th" sound - put your tongue between your teeth! 👅
🌙 TH makes the "th" sound - put your tongue between your teeth! 👅`,
        instructions: 'Partner Reading: Feel your tongue touch your teeth when you say "th"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ th  s  a  th  t  th  p  th  i  th  n  th
🌙 th  m  th  o  th  r  th  e  th  u  th`,
        instructions: 'Partner Reading: Say each sound. Feel the TH with your tongue'
      },
      {
        type: 'simple-words',
        content: `☀️ the    this    that    with    then
🌙 path    bath    math    teeth    cloth`,
        instructions: 'Partner Reading: Common TH words we use every day'
      },
      {
        type: 'tricky-words',
        content: `☀️ things    mother    brother    together
🌙 father    nothing    thinking    birthday`,
        instructions: 'Partner Reading: Longer TH words - break them down'
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
        content: `☀️ CK makes the "k" sound at the end of words like duck! 🦆
🌙 CK makes the "k" sound at the end of words like duck! 🦆`,
        instructions: 'Partner Reading: Say "quack" and hear the CK sound at the end'
      },
      {
        type: 'sound-mixing',
        content: `☀️ ck  s  a  ck  t  ck  p  ck  i  ck  n  ck
🌙 ck  m  ck  o  ck  r  ck  e  ck  u  ck`,
        instructions: 'Partner Reading: CK usually comes at the end of words'
      },
      {
        type: 'simple-words',
        content: `☀️ back    kick    duck    rock    neck
🌙 sick    pick    luck    pack    tick`,
        instructions: 'Partner Reading: CK ending words - listen for the final sound'
      },
      {
        type: 'tricky-words',
        content: `☀️ chicken    pocket    cricket    bucket
🌙 sticker    tracker    cracker    thicker`,
        instructions: 'Partner Reading: Longer CK words - find the CK sound'
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
        content: `☀️ NG makes the "ng" sound like a bell ringing! 🔔 Ring ring!
🌙 NG makes the "ng" sound like a bell ringing! 🔔 Ring ring!`,
        instructions: 'Partner Reading: Say "ring" and feel the NG sound in your throat'
      },
      {
        type: 'sound-mixing',
        content: `☀️ ng  s  a  ng  t  ng  p  ng  i  ng  n  ng
🌙 ng  m  ng  o  ng  r  ng  e  ng  u  ng`,
        instructions: 'Partner Reading: NG makes a special sound - feel it in your throat'
      },
      {
        type: 'simple-words',
        content: `☀️ ring    sing    long    king    wing
🌙 song    bang    hang    ding    rang`,
        instructions: 'Partner Reading: NG ending words - feel the throat vibration'
      },
      {
        type: 'tricky-words',
        content: `☀️ morning    evening    nothing    something
🌙 singing    bringing    playing    swinging`,
        instructions: 'Partner Reading: Longer NG words - listen carefully'
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
        content: `☀️ QU makes the "kw" sound like in queen! 👑 Q always has U with it!
🌙 QU makes the "kw" sound like in queen! 👑 Q always has U with it!`,
        instructions: 'Partner Reading: Say "queen" and hear the "kw" sound at the start'
      },
      {
        type: 'sound-mixing',
        content: `☀️ qu  s  a  qu  t  qu  p  qu  i  qu  n  qu
🌙 qu  m  qu  o  qu  r  qu  e  qu  u  qu`,
        instructions: 'Partner Reading: Q and U are always together making "kw"'
      },
      {
        type: 'simple-words',
        content: `☀️ quit    quiz    quick    quiet    quack
🌙 queen    quite    quest    quote    quart`,
        instructions: 'Partner Reading: QU beginning words - hear the "kw" sound'
      },
      {
        type: 'tricky-words',
        content: `☀️ question    squirrel    aquarium    earthquake
🌙 quarter    squash    liquid    antique`,
        instructions: 'Partner Reading: QU in longer words - can you find it?'
      }
    ],
    targetWords: ['quit', 'quiz', 'quick', 'quiet', 'quack', 'queen', 'quite', 'quest'],
    soundFocus: 'QU combination and "kw" sound recognition'
  }
];