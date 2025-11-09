// components/curriculum/literacy/morphology/MorphologyLevel2.js
import React from 'react';

const MorphologyLevel2 = {
  levelInfo: {
    level: 2,
    ageRange: '6-7 years',
    title: 'Growing Morphology Masters',
    description: 'Deepening knowledge of morphemes, homophones, and word families',
    color: 'from-blue-500 via-indigo-500 to-teal-400'
  },

  lessons: [
    {
      id: 1,
      title: 'Meet the Morphology Team',
      icon: '🧠',
      duration: '25 minutes',
      objectives: [
        'Define the terms morpheme, base, prefix, and suffix',
        'Identify base words and affixes in familiar words',
        'Explain how morphemes work together to build meaning'
      ],
      materials: [
        'Word part cards (prefix, base, suffix)',
        'Anchor chart paper',
        'Magnets or Velcro dots'
      ],

      teacherScript: [
        {
          section: 'Warm-Up (5 mins)',
          content: `Morphology Masters, today we are meeting the WORD TEAM! 👋\n\nHold up three cards labelled PREFIX, BASE, and SUFFIX.\n\nEvery word has little meaning pieces called MORPHEMES. A morpheme is the smallest bit that has meaning. Some morphemes can stand alone, like PLAY. Others need a partner, like the suffix -ER.`,
          animation: 'fadeIn'
        },
        {
          section: 'Introduce Each Team Member (10 mins)',
          content: `Point to each card while explaining:\n\n• PREFIX: A morpheme that comes at the front. It changes the meaning. Example: UN- in UNHAPPY means NOT happy.\n• BASE: The main morpheme that carries the core meaning. Example: PLAY in PLAYFUL.\n• SUFFIX: A morpheme that comes at the end. It can change number or tense. Example: -ED in PLAYED shows it already happened.\n\nWrite the word "REPLAYING". Ask students to spot the three morphemes and label them with arrows. Repeat with "UNHELPFUL".`,
          animation: 'slideUp'
        },
        {
          section: 'Build the Word Machine (7 mins)',
          content: `On the board, draw a simple machine with three slots: Prefix, Base, Suffix. Invite volunteers to slide morpheme cards into the machine. When the word is complete, read it together and discuss the meaning.\n\nPossible builds: UN + LOCK + ED, RE + READ + ER, HAPPY + -NESS (no prefix). Celebrate that some words only need one or two slots!`,
          animation: 'zoomIn'
        },
        {
          section: 'Reflection (3 mins)',
          content: `Ask: Which morpheme tells the main idea of the word? (Base) Which morphemes give extra clues? (Prefix/Suffix)\n\nChant together: "Prefixes front! Bases strong! Suffixes smile and sing along!"`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Morphology Team Roles',
          subtitle: 'Every morpheme has a job',
          icon: '🛠️',
          prompt: 'Read the job and act it out with your hands!',
          focusWords: [
            'PREFIX ➜ Starts the word and changes meaning',
            'BASE ➜ Carries the main idea',
            'SUFFIX ➜ Finishes the word and adds detail',
            'MORPHEME ➜ Any meaning piece'
          ],
          actions: [
            'Prefix = Step forward with big arms',
            'Base = Stand strong with hands on hips',
            'Suffix = Sprinkle glitter fingers at the end'
          ],
          background: 'from-indigo-500 via-sky-500 to-emerald-400'
        },
        {
          title: 'Build & Read',
          subtitle: 'Can you label each morpheme?',
          icon: '🧩',
          prompt: 'Read the word, then point to the prefix, base, and suffix.',
          focusWords: [
            'UNHAPPY = UN + HAPPY',
            'REPLAYED = RE + PLAY + ED',
            'SMILE = BASE ONLY',
            'HELPFUL = HELP + FUL'
          ],
          actions: [
            'Thumbs up when you spot the base.',
            'Clap once for each morpheme you can name.'
          ],
          background: 'from-blue-500 via-purple-500 to-pink-500'
        },
        {
          title: 'Word Machine Challenge',
          subtitle: 'Slide the morphemes into place',
          icon: '🚂',
          prompt: 'Read each combination and shout the finished word together.',
          focusWords: [
            'RE + READ + ER ➜ REREADER (person who reads again)',
            'UN + KIND ➜ UNKIND (not kind)',
            'PLAY + FUL ➜ PLAYFUL (full of play)',
            'RE + TURN ➜ RETURN (turn again)'
          ],
          actions: [
            'Trace the train as it moves from prefix to suffix.',
            'Freeze like a statue when a morpheme cannot stand alone.'
          ],
          background: 'from-violet-500 via-blue-500 to-cyan-400'
        },
        {
          title: 'Morphology Motions',
          subtitle: 'Use your body to show each part',
          icon: '🤸',
          prompt: 'Move when you hear your role called out.',
          focusWords: [
            'PREFIX POP ➜ Jump forward like a rocket',
            'BASE BOOST ➜ Stand tall and steady',
            'SUFFIX SPARK ➜ Twirl and sparkle at the end',
            'ONE-PART WORD ➜ Hold a superhero pose'
          ],
          actions: [
            'Switch roles and act it again with new volunteers.',
            'Add sound effects for extra flair!'
          ],
          background: 'from-fuchsia-500 via-rose-500 to-amber-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🧠',
          title: 'Meet the Morpheme Team',
          subtitle: 'Prefixes, bases, and suffixes join forces to build words!',
          gradient: 'from-indigo-500 via-sky-500 to-emerald-400'
        },
        ruleFocus: {
          title: 'Word-Building Mission',
          description: 'Every word has a base. Prefixes go at the front and suffixes go at the end to tweak the meaning.',
          keyPoints: [
            'A base carries the main idea.',
            'Prefixes change meaning at the start.',
            'Suffixes add detail at the end.'
          ],
          examples: [
            { word: 'UNHAPPY', breakdown: 'UN + HAPPY', meaning: 'not happy' },
            { word: 'PLAYFUL', breakdown: 'PLAY + FUL', meaning: 'full of play' },
            { word: 'REWIND', breakdown: 'RE + WIND', meaning: 'wind again' }
          ]
        },
        quickCheck: {
          question: 'Which part is the base in REPLAYING?',
          answers: ['RE', 'PLAY', 'ING'],
          correctAnswer: 'PLAY',
          celebration: '🎉 Base words stay strong in the middle!'
        },
        practice: [
          {
            title: 'Build-a-Word Workshop',
            icon: '🛠️',
            background: 'from-blue-500 via-purple-500 to-pink-500',
            description: 'Drag or point to the prefix, base, and suffix that build the word shown.',
            steps: [
              'Pick a base card (PLAY, HELP, PACK).',
              'Add a prefix or suffix card to change the meaning.',
              'Read the new word and act it out!'
            ]
          },
          {
            title: 'Prefix Dash',
            icon: '⚡',
            background: 'from-emerald-400 via-teal-400 to-cyan-400',
            description: 'Race to find the prefix before the timer ends.',
            steps: [
              'Teacher flashes a word.',
              'Students point to the front part and shout its meaning.',
              'Bonus: Say another word that uses the same prefix.'
            ]
          }
        ],
        exitTicket: 'Underline the base in UNLOCKED and circle the suffix.'
      },

      practiceWordLists: [
        {
          heading: 'Meet the Morphemes',
          description: 'Label each part out loud.',
          words: [
            'UN + KIND',
            'PLAY + ER',
            'HOPE + LESS',
            'RE + DO',
            'LOVE + LY',
            'READ + ER',
            'UN + PACK',
            'HELP + FUL'
          ]
        },
        {
          heading: 'Base or Affix?',
          description: 'Say if it can stand alone or needs a friend.',
          words: ['PLAY', 'UN-', '-ED', 'SING', 'RE-', '-NESS', 'JUMP', '-ING']
        }
      ],

      activities: [
        {
          title: 'Morphology Sorting Mats',
          icon: '🗂️',
          duration: '12 mins',
          description: 'Students sort morpheme cards into prefix, base, and suffix pockets.',
          instructions: [
            'Lay out the colourful sorting mat.',
            'Place mixed morpheme cards face down.',
            'Students draw a card, read it, and place it in the correct pocket.',
            'Challenge: Build a word using one card from each pocket.'
          ],
          materials: ['Sorting mat', 'Morpheme cards'],
          printable: 'morphology-team-mat'
        },
        {
          title: 'Word Machine Builders',
          icon: '🚂',
          duration: '10 mins',
          description: 'Pairs build words with slot cards and record meanings.',
          instructions: [
            'Give each pair a word machine board and dry-erase markers.',
            'Students spin the prefix and suffix spinners to collect parts.',
            'Add a base word card to complete the build.',
            'Record the finished word and draw what it means.'
          ],
          materials: ['Word machine board', 'Spinners', 'Base word cards'],
          printable: 'word-machine-board'
        },
        {
          title: 'Morpheme Chant Cards',
          icon: '🎶',
          duration: '8 mins',
          description: 'Use chant cards to practise vocabulary.',
          instructions: [
            'Display a chant card with one morpheme.',
            'Class chants the definition and acts it out.',
            'Switch cards quickly to keep pace lively.',
            'Students create a quick word using the morpheme.'
          ],
          materials: ['Chant cards'],
          printable: 'morpheme-chant-cards'
        }
      ],

      assessment: {
        formative: [
          'Can students define prefix, suffix, base, and morpheme?',
          'Do they correctly sort cards by morpheme type?',
          'Can they explain how morphemes change meaning?'
        ],
        questions: [
          'What part of the word tells the main idea?',
          'Where does a prefix go?',
          'How does adding -ful change the word help?'
        ],
        exitTicket: 'Circle the prefix, underline the base, and box the suffix in UNHELPFUL.'
      }
    },
    {
      id: 2,
      title: 'Happy Homophone Heroes',
      icon: '🦸',
      duration: '25 minutes',
      objectives: [
        'Recognise and read common homophone pairs',
        'Explain that homophones sound the same but have different spellings and meanings',
        'Choose the correct homophone for a sentence context'
      ],
      materials: ['Homophone hero cards', 'Mini whiteboards', 'Pocket chart'],

      teacherScript: [
        {
          section: 'Story Hook (5 mins)',
          content: `Tell a short story with a funny mix-up: "I wanted two cookies, but Mum said take the toes!"\n\nExplain that words that sound the same but mean different things are called HOMOPHONES. They are trickster twins!`,
          animation: 'fadeIn'
        },
        {
          section: 'Hero Cards (10 mins)',
          content: `Show the homophone hero cards for TO/TOO/TWO. Each card has a picture clue. Say the sentence, then have students hold up the matching hero. Repeat with MEET/MEAT, SEA/SEE, and WEAR/WHERE.\n\nHighlight the spelling differences and point to the meaning clues.`,
          animation: 'slideUp'
        },
        {
          section: 'Context Detective (7 mins)',
          content: `Write sentences with a blank on the board. Students choose the correct homophone by holding up finger signals (1,2,3). Example: "We will ___ at the park." (meet). Discuss why the choice fits the meaning.`,
          animation: 'bounce'
        },
        {
          section: 'Wrap & Review (3 mins)',
          content: `Chant: "Homophones sound the same, spellings show the meaning game!"\n\nAsk: "How can we remember which one to use?" (Look at the meaning picture).`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Homophone Hero Pairs',
          subtitle: 'Sound the same, meaning changes',
          icon: '🎭',
          prompt: 'Point to the word that matches the picture clue.',
          focusWords: [
            'TO ➜ going somewhere',
            'TWO ➜ number 2',
            'TOO ➜ also or very',
            'MEET ➜ to see a person',
            'MEAT ➜ food from animals'
          ],
          actions: [
            'Make a superhero pose when you hear the right word.',
            'Draw the meaning in the air with your finger.'
          ],
          background: 'from-orange-400 via-red-500 to-purple-500'
        },
        {
          title: 'Choose the Correct Word',
          subtitle: 'Listen to the sentence clue',
          icon: '🗨️',
          prompt: 'Cover the word that does NOT match the meaning.',
          focusWords: [
            'SEA vs SEE',
            'WEAR vs WHERE',
            'PAIR vs PEAR',
            'NIGHT vs KNIGHT'
          ],
          actions: [
            'Tap your head when you know the meaning clue.',
            'Whisper the spelling to a partner.'
          ],
          background: 'from-sky-500 via-cyan-400 to-lime-400'
        },
        {
          title: 'Meaning Match-Up',
          subtitle: 'Spot the picture clue',
          icon: '🕵️',
          prompt: 'Hold up one finger for word A and two fingers for word B.',
          focusWords: [
            'BE ➜ to exist vs BEE ➜ buzzing insect',
            'FLOWER ➜ blooming plant vs FLOUR ➜ baking powder',
            'PANE ➜ window glass vs PAIN ➜ ouch feeling',
            'MADE ➜ created vs MAID ➜ helper'
          ],
          actions: [
            'Explain your choice with a complete sentence.',
            'Switch partners and quiz each other.'
          ],
          background: 'from-amber-400 via-orange-500 to-rose-500'
        },
        {
          title: 'Trickster Twin Sentences',
          subtitle: 'Choose the right hero word',
          icon: '🦸‍♂️',
          prompt: 'Read the sentence and step to the side that matches.',
          focusWords: [
            'I can HEAR the drums vs Come over HERE',
            'Will you WRITE the card vs Turn RIGHT at the sign',
            'We ATE pizza vs There are EIGHT slices',
            'Please WEAR your hat vs WHERE is your hat?'
          ],
          actions: [
            'Add a quick action to show the meaning (pretend to write, point, etc.).',
            'Swap volunteers to read the next clue.'
          ],
          background: 'from-purple-500 via-indigo-500 to-blue-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🦸',
          title: 'Happy Homophone Heroes',
          subtitle: 'Sound twins with different spellings and meanings!',
          gradient: 'from-orange-400 via-rose-500 to-purple-500'
        },
        ruleFocus: {
          title: 'Today’s Rule',
          description: 'Homophones sound the same but mean different things. Picture clues help you choose the right spelling.',
          keyPoints: [
            'Listen for the sentence meaning.',
            'Look for picture clues or context words.',
            'Check the spelling to be sure.'
          ],
          examples: [
            { word: 'TOO', breakdown: 'Means “also” or “very”', meaning: 'I want cake too.' },
            { word: 'TWO', breakdown: 'Number 2', meaning: 'We have two puppies.' },
            { word: 'TO', breakdown: 'Direction word', meaning: 'We walk to school.' }
          ]
        },
        quickCheck: {
          question: 'Which spelling fits: “Let’s ____ the new friends”?',
          answers: ['MEET', 'MEAT'],
          correctAnswer: 'MEET',
          celebration: '🎉 Context clues save the day!'
        },
        practice: [
          {
            title: 'Hero Cape Sort',
            icon: '🦹‍♀️',
            background: 'from-red-400 via-orange-400 to-yellow-400',
            description: 'Match the homophone to its picture clue.',
            steps: [
              'Lay out picture cards (sea, see, sun, son).',
              'Match each card with the correct spelling.',
              'Say the sentence out loud to double-check.'
            ]
          },
          {
            title: 'Sentence Switch Challenge',
            icon: '🔄',
            background: 'from-cyan-400 via-sky-400 to-indigo-400',
            description: 'Swap the wrong homophone to fix the sentence.',
            steps: [
              'Read a silly sentence: “I can sea the ship.”',
              'Rewrite it using the correct spelling.',
              'Draw a quick doodle to match your sentence.'
            ]
          }
        ],
        exitTicket: 'Write a mini-comic using TO, TOO, and TWO correctly.'
      },

      practiceWordLists: [
        {
          heading: 'Homophone Triples',
          description: 'Read and give a quick meaning clue.',
          words: ['to', 'two', 'too', 'there', 'their', "they're", 'your', "you\'re"]
        },
        {
          heading: 'Picture Clues',
          description: 'Match the image to the spelling.',
          words: ['meet 🤝', 'meat 🍖', 'sea 🌊', 'see 👀', 'wear 👗', 'where ❓']
        }
      ],

      activities: [
        {
          title: 'Homophone Hero Capes',
          icon: '🦸‍♀️',
          duration: '12 mins',
          description: 'Students create mini capes showing the meaning clue.',
          instructions: [
            'Give each student a cape template with two homophones.',
            'Colour the cape and draw the meaning clue on each side.',
            'Write a sentence using each homophone.',
            'Hang capes on a string for display.'
          ],
          materials: ['Cape templates', 'Crayons'],
          printable: 'homophone-hero-capes'
        },
        {
          title: 'Spin & Choose',
          icon: '🌀',
          duration: '10 mins',
          description: 'Small groups spin a sentence starter and choose the matching homophone.',
          instructions: [
            'Place a spinner board with images in the centre.',
            'Students spin, read the starter sentence, and pick the correct homophone card.',
            'Explain why it matches before collecting the card.',
            'Most cards collected wins the round.'
          ],
          materials: ['Spinner board', 'Homophone cards'],
          printable: 'homophone-spinner-board'
        },
        {
          title: 'Pocket Chart Sort & Write',
          icon: '📊',
          duration: '8 mins',
          description: 'Sort sentences under the correct homophone header.',
          instructions: [
            'Place headers for each homophone pair in the chart.',
            'Read sentence strips and decide where they belong.',
            'Students copy one sentence and draw a matching picture.',
            'Switch roles to give everyone a turn reading.'
          ],
          materials: ['Sentence strips', 'Pocket chart'],
          printable: 'homophone-sentence-strips'
        }
      ],

      assessment: {
        formative: [
          'Can students explain the meaning of each homophone?',
          'Do they select the correct spelling for context clues?',
          'Can they create sentences using both words correctly?'
        ],
        questions: [
          'Which homophone means “also”?',
          'How can the picture help you choose the spelling?',
          'Use both MEET and MEAT in two different sentences.'
        ],
        exitTicket: 'Draw a quick comic showing the difference between SEE and SEA.'
      }
    },
    {
      id: 3,
      title: 'Word Family Builders',
      icon: '🏠',
      duration: '25 minutes',
      objectives: [
        'Group related words into families based on shared morphemes',
        'Explain how suffixes change tense or number',
        'Generate new words using common bases and affixes'
      ],
      materials: ['Word family houses', 'Magnetic morpheme tiles', 'Markers'],

      teacherScript: [
        {
          section: 'Introduce the Family House (5 mins)',
          content: `Display a house diagram labelled ROOF (base) and ROOMS (suffixes). Place PLAY on the roof and add plays, playing, played in the rooms. Explain that word families stay together because they share the same base morpheme.`,
          animation: 'fadeIn'
        },
        {
          section: 'Family Building (12 mins)',
          content: `Give students magnetic morpheme tiles. Call out a base word (jump, help, talk, paint). Students work in trios to build the family on their mini houses, adding -s, -ing, -ed, and -er if it makes sense. Share and discuss which suffixes work best.`,
          animation: 'slideUp'
        },
        {
          section: 'Meaning Match (5 mins)',
          content: `Pick a family word and ask: "What does played tell us about play?" or "What does helper tell us about help?" Encourage complete sentences.`,
          animation: 'zoomIn'
        },
        {
          section: 'Reflection (3 mins)',
          content: `Chant: "Same base, new ending! Word families keep on extending!"`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Word Family Houses',
          subtitle: 'Same base, different endings',
          icon: '🏡',
          prompt: 'Read across each room and notice the base stay the same.',
          focusWords: [
            'PLAY ➜ plays, playing, played, player',
            'JUMP ➜ jumps, jumping, jumped, jumper',
            'HELP ➜ helps, helping, helped, helper'
          ],
          actions: [
            'Underline the base with your finger in the air.',
            'Say the meaning change for each suffix.'
          ],
          background: 'from-yellow-400 via-orange-400 to-pink-400'
        },
        {
          title: 'Build a New Family',
          subtitle: 'Choose a base and add endings',
          icon: '🧱',
          prompt: 'Which suffixes make real words?',
          focusWords: [
            'PAINT ➜ ?, ?, ?',
            'CLAP ➜ ?, ?, ?',
            'READ ➜ ?, ?, ?'
          ],
          actions: [
            'Clap once for a real word, twice for a nonsense word.',
            'Share your favourite family word with a partner.'
          ],
          background: 'from-lime-400 via-teal-400 to-blue-500'
        },
        {
          title: 'Suffix Power Rooms',
          subtitle: 'What does each ending tell us?',
          icon: '🔌',
          prompt: 'Point to the room that shows “happening now” or “person who”.',
          focusWords: [
            'PLAY ➜ PLAYING (happening now)',
            'HELP ➜ HELPER (person who helps)',
            'CLAP ➜ CLAPPED (already happened)',
            'JUMP ➜ JUMPS (more than one action)'
          ],
          actions: [
            'Hold up fingers to show tense (1 = now, 2 = past, 3 = person).',
            'Create a quick motion to match each new word.'
          ],
          background: 'from-amber-300 via-yellow-400 to-lime-400'
        },
        {
          title: 'Word Family Chef',
          subtitle: 'Cook up tasty combos',
          icon: '👩‍🍳',
          prompt: 'Choose a base and add toppings (suffixes) to serve a new word.',
          focusWords: [
            'BAKE ➜ bakes, baking, baked, baker',
            'PAINT ➜ paints, painting, painted, painter',
            'READ ➜ reads, reading, reader, reread'
          ],
          actions: [
            'Pretend to stir the pot when the word works.',
            'Make a buzzer sound if the combination is nonsense.'
          ],
          background: 'from-rose-400 via-pink-400 to-purple-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🏠',
          title: 'Word Family Builders',
          subtitle: 'One base, many related words!',
          gradient: 'from-yellow-400 via-orange-400 to-pink-500'
        },
        ruleFocus: {
          title: 'Family Rule',
          description: 'Words belong to the same family when they share a base and add different endings.',
          keyPoints: [
            'Suffixes can show time (past, now).',
            'Some suffixes tell who is doing the action.',
            'The base keeps the main meaning.'
          ],
          examples: [
            { word: 'PLAYED', breakdown: 'PLAY + ED', meaning: 'play that already happened' },
            { word: 'PLAYER', breakdown: 'PLAY + ER', meaning: 'person who plays' },
            { word: 'PLAYING', breakdown: 'PLAY + ING', meaning: 'happening now' }
          ]
        },
        quickCheck: {
          question: 'Which suffix makes “person who helps”?',
          answers: ['-ING', '-ER', '-ED'],
          correctAnswer: '-ER',
          celebration: '🎉 Helpers wear the -ER badge!'
        },
        practice: [
          {
            title: 'Family Sorting Station',
            icon: '🗂️',
            background: 'from-blue-400 via-teal-400 to-emerald-400',
            description: 'Sort word cards under the matching base word house.',
            steps: [
              'Place base word roofs in a row.',
              'Deal out suffix cards and build as many real family members as you can.',
              'Read each word aloud with expression.'
            ]
          },
          {
            title: 'Suffix Switch-Up',
            icon: '🔁',
            background: 'from-purple-400 via-indigo-400 to-sky-400',
            description: 'Swap suffixes to change the meaning.',
            steps: [
              'Start with a base (HELP).',
              'Try each suffix (-ING, -ED, -ER).',
              'Explain what the new word means in your own words.'
            ]
          }
        ],
        exitTicket: 'Write two members of the JUMP family and tell what each ending means.'
      },

      practiceWordLists: [
        {
          heading: 'Play Family',
          description: 'Read and sort by tense or job.',
          words: ['play', 'plays', 'playing', 'played', 'player']
        },
        {
          heading: 'Jump Family',
          description: 'Say what each suffix tells you.',
          words: ['jump', 'jumps', 'jumping', 'jumped', 'jumper']
        }
      ],

      activities: [
        {
          title: 'Word Family House Posters',
          icon: '🏠',
          duration: '15 mins',
          description: 'Students design a house showing base and suffix rooms.',
          instructions: [
            'Provide a house template with blank rooms.',
            'Students choose a base word and add suffixes in each room.',
            'Draw a picture clue for each new word.',
            'Share houses during a gallery walk.'
          ],
          materials: ['House template', 'Crayons'],
          printable: 'word-family-house-template'
        },
        {
          title: 'Spin a Family',
          icon: '🎡',
          duration: '8 mins',
          description: 'Use spinners to collect a base and suffix.',
          instructions: [
            'One spinner shows base words, another shows suffixes.',
            'Students spin both and decide if the combination makes a real word.',
            'Record real words on the family flow sheet.',
            'Create a sentence with one favourite word.'
          ],
          materials: ['Base spinner', 'Suffix spinner', 'Recording sheet'],
          printable: 'word-family-flow-sheet'
        },
        {
          title: 'Family Relay',
          icon: '🏃‍♂️',
          duration: '7 mins',
          description: 'Teams race to build complete families.',
          instructions: [
            'Place base word cards at one end of the room.',
            'Students run to collect a base, then add suffix tiles back at their team spot.',
            'First team to build four correct family members wins.',
            'Check together and read each word aloud.'
          ],
          materials: ['Base cards', 'Suffix tiles'],
          printable: 'word-family-relay-cards'
        }
      ],

      assessment: {
        formative: [
          'Do students recognise that the base stays the same?',
          'Can they explain what each suffix adds?',
          'Are they able to build new family members?' 
        ],
        questions: [
          'What does -ing tell us about the verb?',
          'How does -ed change the time?',
          'Which family word means “a person who helps”?' 
        ],
        exitTicket: 'Write two new words for the base word READ and explain each one.'
      }
    },
    {
      id: 4,
      title: 'Plural Power with -s and -es',
      icon: '🐾',
      duration: '25 minutes',
      objectives: [
        'Add -s or -es to make plural nouns',
        'Explain when to use each suffix',
        'Read plural nouns in short sentences'
      ],
      materials: ['Picture noun cards', 'Pocket chart', 'Mini whiteboards'],

      teacherScript: [
        {
          section: 'Launch (4 mins)',
          content: `Show one DOG card and then many DOGS. Ask: "How do we show more than one?" Add -s. Repeat with BUS ➜ BUSES. Explain that -es sticks onto words that hiss, buzz, or end with ch, sh, x, or s.`,
          animation: 'fadeIn'
        },
        {
          section: 'Sound Sorting (10 mins)',
          content: `Display picture cards. Students sort them into the -S basket or the -ES basket based on the ending sound. Say the rule aloud together after each card.`,
          animation: 'slideUp'
        },
        {
          section: 'Sentence Snap (7 mins)',
          content: `Write short sentences with blanks. Students add the correct plural ending on mini whiteboards (e.g., "The fox has two ____" → foxes). Share answers and emphasise pronunciation.`,
          animation: 'zoomIn'
        },
        {
          section: 'Quick Quiz (4 mins)',
          content: `Call out base nouns. Students hold up one finger for -s and two fingers for -es. Reveal the card to confirm.`,
          animation: 'bounce'
        }
      ],

      displaySections: [
        {
          title: 'When to Add -s',
          subtitle: 'Most nouns just need -s',
          icon: '🟢',
          prompt: 'Read each plural and whisper the base word.',
          focusWords: ['cats', 'dogs', 'rooms', 'games', 'books'],
          actions: [
            'Blow a soft breeze sound for smooth -s words.',
            'High five a friend after reading the list.'
          ],
          background: 'from-green-400 via-teal-400 to-blue-500'
        },
        {
          title: 'When to Add -es',
          subtitle: 'Hissing sounds need extra syllables',
          icon: '🔵',
          prompt: 'Circle the ending that tells you to add -es.',
          focusWords: ['buses', 'boxes', 'brushes', 'dishes', 'foxes'],
          actions: [
            'Make the ending sound together (sss, zzz, ch, sh, ks).',
            'Stretch arms wide while saying the full plural.'
          ],
          background: 'from-blue-500 via-indigo-500 to-purple-500'
        },
        {
          title: 'Sound Detective',
          subtitle: 'Listen for the secret ending sound',
          icon: '🕵️‍♀️',
          prompt: 'Cover your ears, then show thumbs up for -s or jazz hands for -es.',
          focusWords: [
            'bus ➜ buses (ends in /s/)',
            'wish ➜ wishes (ends in /sh/)',
            'box ➜ boxes (ends in /ks/)',
            'crash ➜ crashes (ends in /sh/)'
          ],
          actions: [
            'Whisper the base, shout the plural.',
            'Bounce to the rhythm of the extra syllable.'
          ],
          background: 'from-cyan-400 via-sky-400 to-lime-400'
        },
        {
          title: 'Plural Parade',
          subtitle: 'March the words into the correct lane',
          icon: '🎺',
          prompt: 'Hold a mini parade march for -s words and a shimmy for -es words.',
          focusWords: [
            'cars, stars, balloons, games',
            'bushes, lunches, dresses, foxes'
          ],
          actions: [
            'Call out the rule as you march: “Smooth gets -s, hiss adds -es!”.',
            'Trade places with a friend and try again with new cards.'
          ],
          background: 'from-amber-400 via-rose-400 to-magenta-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🐾',
          title: 'Plural Power',
          subtitle: 'Choose -s or -es to show more than one!',
          gradient: 'from-green-400 via-teal-400 to-blue-500'
        },
        ruleFocus: {
          title: 'Plural Rule',
          description: 'Most nouns take -s. If the word ends with a hissing sound (s, x, z, ch, sh), add -es to make an extra syllable.',
          keyPoints: [
            'Listen to the ending sound.',
            'Words ending in s, x, z, ch, sh need -es.',
            'Everything else usually just takes -s.'
          ],
          examples: [
            { word: 'cats', breakdown: 'cat + s', meaning: 'more than one cat' },
            { word: 'dishes', breakdown: 'dish + es', meaning: 'more than one dish' },
            { word: 'boxes', breakdown: 'box + es', meaning: 'more than one box' }
          ]
        },
        quickCheck: {
          question: 'What ending does “brush” need?',
          answers: ['-s', '-es'],
          correctAnswer: '-es',
          celebration: '🎉 Brushes need the extra syllable!'
        },
        practice: [
          {
            title: 'Ending Echo',
            icon: '🎤',
            background: 'from-blue-400 via-indigo-400 to-purple-500',
            description: 'Echo the base and plural together.',
            steps: [
              'Say the base word quietly.',
              'Add the ending loudly (-s or -es).',
              'Clap the number of syllables you hear.'
            ]
          },
          {
            title: 'Plural Picture Hunt',
            icon: '🖼️',
            background: 'from-emerald-400 via-lime-400 to-yellow-400',
            description: 'Find classroom objects and turn them into plurals.',
            steps: [
              'Pick an object card or draw your own.',
              'Decide if it needs -s or -es.',
              'Write the plural in a speech bubble for the picture.'
            ]
          }
        ],
        exitTicket: 'Circle the correct plural: foxs or foxes? Then explain why.'
      },

      practiceWordLists: [
        {
          heading: 'Add -s',
          description: 'Write the plural quickly.',
          words: ['dog', 'car', 'flower', 'bell', 'tree']
        },
        {
          heading: 'Add -es',
          description: 'Remember the hissing endings.',
          words: ['bus', 'fox', 'peach', 'dish', 'glass']
        }
      ],

      activities: [
        {
          title: 'Plural Sorting Trail',
          icon: '🛣️',
          duration: '12 mins',
          description: 'Students move along a floor trail sorting picture cards.',
          instructions: [
            'Lay the colourful trail mat on the floor.',
            'Students pick a noun card, say the plural, and hop to the correct ending square.',
            'Write the plural on the recording sheet.',
            'Cheer with the chant “S for smooth, ES for extra syllable!”.'
          ],
          materials: ['Trail mat', 'Picture cards', 'Recording sheet'],
          printable: 'plural-sorting-trail'
        },
        {
          title: 'Plural Flip Books',
          icon: '📘',
          duration: '10 mins',
          description: 'Create mini books showing singular and plural forms.',
          instructions: [
            'Provide foldable templates with base nouns.',
            'Students draw the singular on the front and the plural inside.',
            'Label the ending (-s or -es) with a highlight pen.',
            'Share books with a buddy for reading practice.'
          ],
          materials: ['Flip book template', 'Crayons'],
          printable: 'plural-flip-book'
        },
        {
          title: 'Sentence Spin & Write',
          icon: '✍️',
          duration: '8 mins',
          description: 'Use a spinner to add plurals to sentence starters.',
          instructions: [
            'Students spin to select a noun.',
            'Add -s or -es and write the full plural in a sentence.',
            'Underline the ending and share aloud.',
            'Swap sentences with a partner to check endings.'
          ],
          materials: ['Spinner board', 'Sentence strips'],
          printable: 'plural-sentence-spinner'
        }
      ],

      assessment: {
        formative: [
          'Can students explain when to add -s versus -es?',
          'Do they pronounce the extra syllable for -es words?',
          'Can they apply the rule in sentences?'
        ],
        questions: [
          'Why does fox become foxes?',
          'Which ending would you add to the word chair?',
          'Say a sentence with the plural word buses.'
        ],
        exitTicket: 'Write the plural for dish, cat, and box. Circle the -es word.'
      }
    },
    {
      id: 5,
      title: 'Third-Person Verb Superstars',
      icon: '⭐',
      duration: '25 minutes',
      objectives: [
        'Add -s and -es to verbs used with he, she, or it',
        'Explain that verbs change spelling to match the subject',
        'Read and act out third-person sentences'
      ],
      materials: ['Verb action cards', 'Subject cards (he/she/it/name)', 'Chart paper'],

      teacherScript: [
        {
          section: 'Action Warm-Up (5 mins)',
          content: `Act out base verbs (hop, wash, buzz, wish). Then say: "When HE or SHE does the action, we add -s or -es!"`,
          animation: 'fadeIn'
        },
        {
          section: 'Subject-Verb Match (10 mins)',
          content: `Place a subject card (He/She/It/Mr Fox) next to a verb card. Ask students to help add the correct ending. Write the full sentence ("She hops", "It buzzes"). Highlight the suffix.`,
          animation: 'slideUp'
        },
        {
          section: 'Act It Out (7 mins)',
          content: `Invite volunteers to draw a subject and a verb. Class says the full sentence with the correct ending while the volunteer acts it out.`,
          animation: 'zoomIn'
        },
        {
          section: 'Quick Write (3 mins)',
          content: `Students write one sentence in their books using a third-person subject and share with a partner.`,
          animation: 'pulse'
        }
      ],

      displaySections: [
        {
          title: 'He/She/It = Add -s',
          subtitle: 'Most verbs add -s',
          icon: '🙋',
          prompt: 'Say the sentence together.',
          focusWords: ['He sings', 'She plays', 'It jumps', 'A bird flies'],
          actions: [
            'Gesture to the subject, then flick fingers for the -s ending.',
            'Clap once after each sentence.'
          ],
          background: 'from-purple-500 via-pink-500 to-orange-400'
        },
        {
          title: 'Watch for -es',
          subtitle: 'Hissing verbs need -es',
          icon: '🐍',
          prompt: 'Read the verbs that change to -es.',
          focusWords: ['She washes', 'He fixes', 'It buzzes', 'Dad catches'],
          actions: [
            'Make the hissing or buzzing sound as you finish the word.',
            'Air-write the letters -es when you hear them.'
          ],
          background: 'from-indigo-500 via-blue-500 to-teal-400'
        },
        {
          title: 'Sentence Remix',
          subtitle: 'Switch the subject, switch the ending',
          icon: '🎛️',
          prompt: 'Change “I hop” to “He ___” and fill in the new ending.',
          focusWords: [
            'I play ➜ She plays',
            'We wish ➜ It wishes',
            'They buzz ➜ He buzzes',
            'You wash ➜ She washes'
          ],
          actions: [
            'Tap shoulders when the subject changes.',
            'Snap fingers when you add the new ending.'
          ],
          background: 'from-pink-500 via-rose-500 to-orange-400'
        },
        {
          title: 'Verb Ending Detective',
          subtitle: 'Spot the tricky verbs',
          icon: '🕵️‍♂️',
          prompt: 'Use magnifying glasses (hands) to zoom in on the ending you need.',
          focusWords: [
            'mix ➜ mixes',
            'watch ➜ watches',
            'push ➜ pushes',
            'fix ➜ fixes'
          ],
          actions: [
            'Whisper “extra syllable” when you hear -es.',
            'Draw the ending in the air and pass the detective badge to a friend.'
          ],
          background: 'from-teal-400 via-cyan-400 to-blue-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '⭐',
          title: 'Third-Person Verb Superstars',
          subtitle: 'He/She/It verbs need special endings!',
          gradient: 'from-purple-500 via-pink-500 to-orange-400'
        },
        ruleFocus: {
          title: 'Verb Rule',
          description: 'When the subject is he, she, it, or a name, verbs take -s. If the base ends in s, x, z, ch, sh, or o sounds, add -es.',
          keyPoints: [
            'Match the subject to the verb ending.',
            'Listen for hissing sounds that trigger -es.',
            'Say the sentence aloud to check how it sounds.'
          ],
          examples: [
            { word: 'She sings', breakdown: 'sing + s', meaning: 'She is doing it now.' },
            { word: 'It buzzes', breakdown: 'buzz + es', meaning: 'The insect makes noise.' },
            { word: 'Dad fixes', breakdown: 'fix + es', meaning: 'Dad repairs it.' }
          ]
        },
        quickCheck: {
          question: 'Fill the blank: “The cat ____ (wash) its paws.”',
          answers: ['wash', 'washes'],
          correctAnswer: 'washes',
          celebration: '🎉 Purrfect verb ending!'
        },
        practice: [
          {
            title: 'Subject Swap Cards',
            icon: '🔄',
            background: 'from-indigo-400 via-violet-400 to-magenta-400',
            description: 'Swap subjects to hear how the verb ending changes.',
            steps: [
              'Draw a base sentence card (I jump).',
              'Swap in a new subject (He/She/It).',
              'Read the updated sentence with the correct ending.'
            ]
          },
          {
            title: 'Action Freeze Frames',
            icon: '🕺',
            background: 'from-amber-400 via-yellow-400 to-lime-400',
            description: 'Act out verbs while classmates guess the correct sentence.',
            steps: [
              'One student draws a verb card and acts it silently.',
              'Classmates say “He/She/It ___” with the correct ending.',
              'Freeze in a superstar pose when the sentence is correct.'
            ]
          }
        ],
        exitTicket: 'Write one sentence with -s and one with -es endings for he/she/it subjects.'
      },

      practiceWordLists: [
        {
          heading: 'Add -s for He/She/It',
          description: 'Say the sentence after you add -s.',
          words: ['hop', 'sing', 'play', 'read', 'draw']
        },
        {
          heading: 'Add -es',
          description: 'Remember the same endings as plural nouns.',
          words: ['watch', 'wash', 'mix', 'buzz', 'push']
        }
      ],

      activities: [
        {
          title: 'Subject-Verb Snap Cards',
          icon: '🎴',
          duration: '12 mins',
          description: 'Match subject cards to verbs and add the correct ending.',
          instructions: [
            'Shuffle subject and verb decks.',
            'Students flip one of each and read the sentence aloud with the correct ending.',
            'If correct, they keep the pair; if not, the cards go back.',
            'Bonus: Act out the sentence for extra points.'
          ],
          materials: ['Subject cards', 'Verb cards'],
          printable: 'subject-verb-snap-cards'
        },
        {
          title: 'Sentence Builder Boards',
          icon: '🧱',
          duration: '9 mins',
          description: 'Magnetic boards help form correct sentences.',
          instructions: [
            'Provide boards with three zones: Subject, Verb, Ending.',
            'Students place the subject and verb, then choose -s or -es tiles.',
            'Write the sentence below and illustrate.',
            'Swap boards and check a friend’s work.'
          ],
          materials: ['Magnetic boards', 'Ending tiles'],
          printable: 'third-person-builder-board'
        },
        {
          title: 'Verb Superstar Certificates',
          icon: '🏆',
          duration: '6 mins',
          description: 'Celebrate correct third-person sentences.',
          instructions: [
            'Students write two sentences using -s and -es verbs on the certificate template.',
            'Decorate with star stickers or drawings.',
            'Share one sentence aloud to earn the superstar badge.',
            'Take certificates home for practice.'
          ],
          materials: ['Certificate template', 'Stickers'],
          printable: 'verb-superstar-certificates'
        }
      ],

      assessment: {
        formative: [
          'Do students add the correct ending for he/she/it subjects?',
          'Can they explain why a verb needs -es?',
          'Are sentences spoken and written with the correct subject-verb match?'
        ],
        questions: [
          'Why do we say "She washes" and not "She wash"?',
          'Which ending would you use with the verb jump when the subject is it?',
          'Make a sentence with the word pushes.'
        ],
        exitTicket: 'Write a sentence using the subject “The dog” and the verb “chase”. Add the correct ending and draw it.'
      }
    },
    {
      id: 6,
      title: 'Time-Traveling Endings',
      icon: '⏰',
      duration: '25 minutes',
      objectives: [
        'Explain that -ed shows the action happened in the past',
        'Explain that -ing shows the action is happening now',
        'Sort verbs by tense using inflectional endings'
      ],
      materials: ['Timeline chart', 'Verb cards with -ed/-ing endings', 'Mini whiteboards'],

      teacherScript: [
        {
          section: 'Hook the Time Machine (5 mins)',
          content: `Display a simple past/present timeline. Say: "Our time machine watches verb endings!" Read "The frog jumped" and place it in the past column. Read "The frog is jumping" and place it in the present column.`,
          animation: 'fadeIn'
        },
        {
          section: 'Ending Investigation (10 mins)',
          content: `Hand out verb cards (jumped/jumping, kicked/kicking). Students hold up the card that matches the sentence you read. Highlight the -ed or -ing ending and discuss how it changes the time.`,
          animation: 'slideUp'
        },
        {
          section: 'Timeline Sort (7 mins)',
          content: `Groups place verb cards on a floor timeline labeled PAST and PRESENT. Each time they place a card they must explain: "I know it is past because..." or "I know it is present because..."`,
          animation: 'zoomIn'
        },
        {
          section: 'Wrap-Up Chant (3 mins)',
          content: `Chant together: "-ED happened before, -ING is happening more!" Ask a quick question: "If I say walking, when is it happening?"`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Spot the Ending',
          subtitle: 'Which time does it show?',
          icon: '🔍',
          prompt: 'Point to the ending and tell the tense.',
          focusWords: ['jumped', 'jumping', 'played', 'playing', 'called', 'calling'],
          actions: [
            'Hold up one finger for past (-ed).',
            'Hold up two fingers for present (-ing).'
          ],
          background: 'from-blue-500 via-sky-500 to-emerald-400'
        },
        {
          title: 'Sentence Time Markers',
          subtitle: 'Listen for the clue words',
          icon: '🗓️',
          prompt: 'Match each sentence to the correct tense.',
          focusWords: [
            'Yesterday I painted.',
            'Right now I am painting.',
            'Last night she danced.',
            'Today she is dancing.'
          ],
          actions: [
            'Tap the timeline arrow when you hear a time clue.',
            'Underline the ending in the air.'
          ],
          background: 'from-indigo-500 via-purple-500 to-pink-400'
        },
        {
          title: 'Swap the Ending',
          subtitle: 'Change past to present',
          icon: '🔄',
          prompt: 'Say the base word and add -ed or -ing.',
          focusWords: ['walk ➜ walked / walking', 'kick ➜ kicked / kicking', 'talk ➜ talked / talking'],
          actions: [
            'Pretend to flip a switch on the timeline.',
            'Act out the verb as you say it.'
          ],
          background: 'from-teal-400 via-cyan-400 to-blue-500'
        },
        {
          title: 'Tense Detective',
          subtitle: 'Explain your evidence',
          icon: '🕵️‍♀️',
          prompt: 'Tell why the ending shows past or present.',
          focusWords: ['The bird flapped.', 'The bird is flapping.', 'We shouted.', 'We are shouting.'],
          actions: [
            'Use a detective voice to give your reason.',
            'Pass the magnifying glass prop after you share.'
          ],
          background: 'from-amber-400 via-yellow-400 to-lime-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '⏰',
          title: 'Time-Traveling Endings',
          subtitle: 'Verb endings show when the action happens!',
          gradient: 'from-blue-500 via-sky-500 to-emerald-400'
        },
        ruleFocus: {
          title: 'Tense Rule',
          description: '-ED endings tell us the action already happened. -ING endings tell us it is happening now.',
          keyPoints: [
            'Look at the ending to know the time.',
            'Past actions often have time clues like yesterday or last.',
            'Present actions use helping verbs like is/am/are.'
          ],
          examples: [
            { word: 'jumped', breakdown: 'jump + ed', meaning: 'jump that happened before now' },
            { word: 'is jumping', breakdown: 'is + jump + ing', meaning: 'jumping that is happening now' },
            { word: 'played', breakdown: 'play + ed', meaning: 'play that already ended' }
          ]
        },
        quickCheck: {
          question: 'Choose the present tense: “The cat ____ (purr) right now.”',
          answers: ['purred', 'is purring'],
          correctAnswer: 'is purring',
          celebration: '🎉 You spotted the happening-now ending!'
        },
        practice: [
          {
            title: 'Timeline Card Sort',
            icon: '🛤️',
            background: 'from-indigo-400 via-violet-400 to-pink-400',
            description: 'Sort verb cards onto the past or present column.',
            steps: [
              'Read the sentence strip.',
              'Look for -ed or -ing endings.',
              'Place it on the correct side of the timeline mat.'
            ]
          },
          {
            title: 'Ending Echo Read',
            icon: '📣',
            background: 'from-emerald-400 via-teal-400 to-cyan-400',
            description: 'Echo read verbs and match the tense.',
            steps: [
              'Teacher says the past form.',
              'Students echo with the present form.',
              'Switch roles and try new verbs.'
            ]
          }
        ],
        exitTicket: 'Circle the verb that shows past: “We climbed” or “We are climbing”.'
      },

      practiceWordLists: [
        {
          heading: 'Past Actions',
          description: 'Read each -ed verb aloud.',
          words: ['jumped', 'walked', 'played', 'called', 'yelled']
        },
        {
          heading: 'Present Actions',
          description: 'Read each -ing verb aloud.',
          words: ['jumping', 'walking', 'playing', 'calling', 'yelling']
        }
      ],

      activities: [
        {
          title: 'Past & Present Timeline Mat',
          icon: '🗂️',
          duration: '12 mins',
          description: 'Students place verb cards on a large floor timeline.',
          instructions: [
            'Lay out the printable timeline mat with PAST and PRESENT labels.',
            'Students draw a verb card, read it, and place it correctly.',
            'Use dry-erase boards to write a matching sentence.',
            'Check placements as a class and adjust if needed.'
          ],
          materials: ['Timeline mat printable', 'Verb cards', 'Dry-erase boards'],
          printable: 'past-present-timeline-mat'
        },
        {
          title: 'Ending Clip Cards',
          icon: '📎',
          duration: '8 mins',
          description: 'Clothespins mark whether the verb shows past or present.',
          instructions: [
            'Provide clip cards with a base sentence and two endings.',
            'Students clip the correct ending (-ed or -ing).',
            'Read the finished sentence aloud.',
            'Trade cards with a partner to double-check.'
          ],
          materials: ['Clip cards', 'Clothespins'],
          printable: 'ending-clip-cards'
        },
        {
          title: 'Time Machine Mini-Book',
          icon: '📔',
          duration: '10 mins',
          description: 'Create a booklet showing verbs in past and present.',
          instructions: [
            'Fold the mini-book template along the dotted lines.',
            'On each page, write the past verb on the left and the present on the right.',
            'Illustrate each action with a quick sketch.',
            'Share with the class and place in literacy folders.'
          ],
          materials: ['Mini-book template', 'Crayons'],
          printable: 'time-machine-mini-book'
        }
      ],

      assessment: {
        formative: [
          'Do students identify tense using verb endings?',
          'Can they explain why -ed or -ing is used?',
          'Do they place verbs correctly on the timeline?'
        ],
        questions: [
          'What does -ed tell you about an action?',
          'How do you know “is running” is happening now?',
          'Change “walk” to show it already happened.'
        ],
        exitTicket: 'Write a sentence with a past verb and a sentence with a present verb ending. Label each one.'
      }
    },
    {
      id: 7,
      title: 'Perfect Past -ed Builders',
      icon: '🧱',
      duration: '25 minutes',
      objectives: [
        'Add the suffix -ed to regular verbs without changing the base',
        'Read and write past tense sentences with -ed endings',
        'Explain how -ed changes the meaning of a verb'
      ],
      materials: ['Base verb cards', 'Suffix tiles', 'Sentence strips'],

      teacherScript: [
        {
          section: 'Review the Base (5 mins)',
          content: `Show the base verb PLAY. Ask students to whisper the base, then stick the -ED tile on the end to read PLAYED. Explain that we did not change the base spelling—just added -ed to show it happened already.`,
          animation: 'fadeIn'
        },
        {
          section: 'Build & Read (10 mins)',
          content: `Students use base verb cards (jump, walk, call, yell) and physically attach -ed tiles. They read the new word and act it out in the past tense (“I jumped yesterday”).`,
          animation: 'slideUp'
        },
        {
          section: 'Sentence Stretch (7 mins)',
          content: `Write sentence starters on the board (“Yesterday we ___.”). Students choose a base verb, add -ed, and finish the sentence orally before writing it on a strip.`,
          animation: 'zoomIn'
        },
        {
          section: 'Share & Reflect (3 mins)',
          content: `Invite volunteers to share their sentences. Ask: "What does the -ed ending tell us?"`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Add -ed, Keep the Base',
          subtitle: 'No spelling changes needed',
          icon: '➕',
          prompt: 'Say the base and then the past tense.',
          focusWords: ['play ➜ played', 'walk ➜ walked', 'call ➜ called', 'yell ➜ yelled'],
          actions: [
            'Tap the base word, then slide to the suffix.',
            'Use a thumbs-up when the base stays the same.'
          ],
          background: 'from-orange-400 via-amber-400 to-yellow-400'
        },
        {
          title: 'Match the Sentence',
          subtitle: 'Choose the correct -ed verb',
          icon: '📝',
          prompt: 'Fill in the blank with the past tense.',
          focusWords: [
            'Yesterday I ____ (jump).',
            'Last night we ____ (play).',
            'She ____ (call) her friend.',
            'They ____ (yell) for help.'
          ],
          actions: [
            'Air-write the -ed ending before saying the word.',
            'Check with a partner and read the sentence together.'
          ],
          background: 'from-rose-400 via-pink-400 to-purple-400'
        },
        {
          title: 'Past Tense Picture Match',
          subtitle: 'Look at the clues',
          icon: '🖼️',
          prompt: 'Match each picture to the past tense verb.',
          focusWords: ['painted 🎨', 'shouted 📣', 'climbed 🧗', 'jumped 🐸'],
          actions: [
            'Hold the picture and act it out like it already happened.',
            'Say the sentence “Yesterday I ___.”'
          ],
          background: 'from-teal-400 via-cyan-400 to-blue-500'
        },
        {
          title: 'Base vs Past Sort',
          subtitle: 'Which one has -ed?',
          icon: '🧺',
          prompt: 'Sort the cards into base and past tense baskets.',
          focusWords: ['walk', 'walked', 'smile', 'smiled', 'roll', 'rolled'],
          actions: [
            'Hold the card to your chest if it has -ed.',
            'Place it on the correct mat with a quick sentence.'
          ],
          background: 'from-lime-400 via-emerald-400 to-teal-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🧱',
          title: 'Perfect Past -ed Builders',
          subtitle: 'Add -ed to show a verb already happened.',
          gradient: 'from-orange-400 via-amber-400 to-yellow-400'
        },
        ruleFocus: {
          title: '-ed Rule',
          description: 'For regular verbs, just add -ed to the base word to show the action happened in the past.',
          keyPoints: [
            'The base spelling stays the same.',
            'Read the word smoothly by blending the base and -ed.',
            'Think of a time clue like yesterday or last.'
          ],
          examples: [
            { word: 'walked', breakdown: 'walk + ed', meaning: 'walk that already happened' },
            { word: 'played', breakdown: 'play + ed', meaning: 'play that is finished' },
            { word: 'called', breakdown: 'call + ed', meaning: 'call that already took place' }
          ]
        },
        quickCheck: {
          question: 'Choose the past tense: “We ____ (jump) over the log yesterday.”',
          answers: ['jump', 'jumped'],
          correctAnswer: 'jumped',
          celebration: '🎉 Great job building the past tense!'
        },
        practice: [
          {
            title: '-ed Build & Read',
            icon: '🧩',
            background: 'from-red-400 via-orange-400 to-amber-400',
            description: 'Snap the -ed tile onto the base card.',
            steps: [
              'Say the base word.',
              'Add the -ed tile.',
              'Read the new word and use it in a sentence.'
            ]
          },
          {
            title: 'Past Tense Sketch',
            icon: '✏️',
            background: 'from-emerald-400 via-teal-400 to-cyan-400',
            description: 'Draw the action after writing the -ed word.',
            steps: [
              'Write the -ed verb at the top.',
              'Draw a picture of the action already finished.',
              'Label your drawing with a sentence.'
            ]
          }
        ],
        exitTicket: 'Write the word “play” in the past tense and draw a picture to match.'
      },

      practiceWordLists: [
        {
          heading: 'Quick -ed Practice',
          description: 'Add -ed to each base.',
          words: ['jump', 'call', 'yell', 'clap', 'paint']
        },
        {
          heading: 'Sentence Starters',
          description: 'Finish with a past tense verb.',
          words: ['Yesterday we ___', 'Last night I ___', 'She ___ on Monday', 'They ___ together']
        }
      ],

      activities: [
        {
          title: '-ed Construction Zone',
          icon: '🚧',
          duration: '12 mins',
          description: 'Students build past tense words with base blocks and -ed bricks.',
          instructions: [
            'Lay out base word blocks and -ed bricks.',
            'Students select a base, attach -ed, and read the new word.',
            'Record the word on the construction log sheet.',
            'Act out the action showing it already happened.'
          ],
          materials: ['Base word blocks', '-ed bricks', 'Construction log sheet'],
          printable: 'ed-construction-log'
        },
        {
          title: 'Past Tense Sentence Trail',
          icon: '🌈',
          duration: '9 mins',
          description: 'Follow a trail of sentence starters and add -ed verbs.',
          instructions: [
            'Place trail cards around the room.',
            'Students walk the trail, adding an -ed verb to each starter.',
            'Write the full sentence on the recording page.',
            'Share one sentence at the end of the trail.'
          ],
          materials: ['Trail cards', 'Recording page'],
          printable: 'past-tense-sentence-trail'
        },
        {
          title: 'Story Snapshots',
          icon: '📸',
          duration: '8 mins',
          description: 'Create a three-panel comic using -ed verbs.',
          instructions: [
            'Use the comic strip template with three boxes.',
            'Write an -ed verb under each box (e.g., climbed, looked, waved).',
            'Draw the action that already happened in each panel.',
            'Read your comic aloud to a partner.'
          ],
          materials: ['Comic strip template', 'Crayons'],
          printable: 'past-tense-comic-strip'
        }
      ],

      assessment: {
        formative: [
          'Do students add -ed without changing the base?',
          'Can they read -ed words smoothly?',
          'Do they use time clues in sentences?'
        ],
        questions: [
          'How does -ed change the word jump?',
          'Give me a sentence using played.',
          'What clue tells you a sentence is in the past?'
        ],
        exitTicket: 'Add -ed to two base verbs and write a sentence for each.'
      }
    },
    {
      id: 8,
      title: 'People-Doer -er Suffix',
      icon: '👩‍🏫',
      duration: '25 minutes',
      objectives: [
        'Add the suffix -er to show a person or thing that does an action',
        'Explain how -er changes a verb into a noun',
        'Generate new words with -er and describe their meanings'
      ],
      materials: ['Verb cards', '-er suffix cards', 'Picture cards of occupations'],

      teacherScript: [
        {
          section: 'Meet the Doers (5 mins)',
          content: `Show the base word TEACH. Add the -ER card to make TEACHER. Explain: "-ER means a person who does the action." Show other examples: SPEAK ➜ SPEAKER, HELP ➜ HELPER.`,
          animation: 'fadeIn'
        },
        {
          section: 'Build the Doer Words (10 mins)',
          content: `Students work with partners to add -er to verb cards (jump, paint, bake, read). They hold up the new word and say, “A ___ is someone who ___.”`,
          animation: 'slideUp'
        },
        {
          section: 'Occupation Match (7 mins)',
          content: `Display pictures of community helpers. Students match the picture to the correct -er word and explain what that person does.`,
          animation: 'zoomIn'
        },
        {
          section: 'Reflection Circle (3 mins)',
          content: `Ask: "What does the suffix -er tell us?" Create a quick class chart of new -er words.`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Add -er to Make a Person',
          subtitle: 'Who does the action?',
          icon: '🧑‍🔧',
          prompt: 'Say “A ___ is someone who ___.”',
          focusWords: ['teach ➜ teacher', 'bake ➜ baker', 'paint ➜ painter', 'farm ➜ farmer'],
          actions: [
            'Act out the job after you say the word.',
            'Hold up a finger to show the -er ending.'
          ],
          background: 'from-blue-400 via-indigo-400 to-purple-400'
        },
        {
          title: 'Doer or Not?',
          subtitle: 'Decide if -er fits',
          icon: '✅',
          prompt: 'Does the word make sense with -er?',
          focusWords: ['sing ➜ singer (yes)', 'jump ➜ jumper (yes)', 'sleep ➜ sleeper (yes)', 'green ➜ greener (no, different meaning)'],
          actions: [
            'Thumbs up if -er means a person, thumbs sideways if it means something else.',
            'Explain your choice to a partner.'
          ],
          background: 'from-emerald-400 via-teal-400 to-cyan-400'
        },
        {
          title: 'Word Builder Station',
          subtitle: 'Create new -er nouns',
          icon: '🏗️',
          prompt: 'Combine the base with -er and share the meaning.',
          focusWords: ['teach', 'speak', 'dance', 'help'],
          actions: [
            'Use a microphone prop when you say your new word.',
            'Write it on the whiteboard for the class word bank.'
          ],
          background: 'from-amber-400 via-orange-400 to-red-400'
        },
        {
          title: 'Picture to Word',
          subtitle: 'Match the helper to the word',
          icon: '🖼️',
          prompt: 'Read the word and place it near the correct picture.',
          focusWords: ['builder', 'reader', 'writer', 'runner'],
          actions: [
            'Describe what the person does in one sentence.',
            'Switch pictures with a partner and try again.'
          ],
          background: 'from-rose-400 via-pink-400 to-purple-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '👩‍🏫',
          title: 'People-Doer -er Suffix',
          subtitle: '-er means a person or thing that does the action.',
          gradient: 'from-blue-400 via-indigo-400 to-purple-400'
        },
        ruleFocus: {
          title: '-er Rule',
          description: 'Add -er to many verbs to name the person or thing that does the action.',
          keyPoints: [
            '-er words are usually nouns.',
            'They tell who or what is doing the action.',
            'The base spelling stays the same.'
          ],
          examples: [
            { word: 'teacher', breakdown: 'teach + er', meaning: 'person who teaches' },
            { word: 'reader', breakdown: 'read + er', meaning: 'person who reads' },
            { word: 'baker', breakdown: 'bake + er', meaning: 'person who bakes' }
          ]
        },
        quickCheck: {
          question: 'Who is a person that paints?',
          answers: ['painted', 'painter'],
          correctAnswer: 'painter',
          celebration: '🎉 Painters add colour to the world!'
        },
        practice: [
          {
            title: '-er Match Cards',
            icon: '🃏',
            background: 'from-lime-400 via-emerald-400 to-teal-400',
            description: 'Match base verbs with their -er partners.',
            steps: [
              'Turn over a base card.',
              'Find the -er card that names the doer.',
              'Say the meaning aloud.'
            ]
          },
          {
            title: 'Doer Drawings',
            icon: '🎨',
            background: 'from-pink-400 via-rose-400 to-red-400',
            description: 'Illustrate someone doing the action.',
            steps: [
              'Write the -er word at the top.',
              'Draw the person or thing doing the job.',
              'Share your drawing with a partner.'
            ]
          }
        ],
        exitTicket: 'Write two -er words and tell what each person does.'
      },

      practiceWordLists: [
        {
          heading: 'Add -er',
          description: 'Create the person or thing.',
          words: ['teach', 'dance', 'sing', 'help', 'farm']
        },
        {
          heading: 'Who Is It?',
          description: 'Match the job to the word.',
          words: ['reader', 'runner', 'builder', 'singer', 'painter']
        }
      ],

      activities: [
        {
          title: 'Doer Badge Workshop',
          icon: '🎖️',
          duration: '11 mins',
          description: 'Students craft badges that show their favourite -er word.',
          instructions: [
            'Provide badge templates with space for the -er word.',
            'Students write the word and draw the action.',
            'Cut out and wear the badge during share time.',
            'Introduce yourself using your badge ("I am a reader").'
          ],
          materials: ['Badge template', 'Crayons', 'Safety pins or tape'],
          printable: 'doer-badge-template'
        },
        {
          title: '-er Job Fair',
          icon: '🏢',
          duration: '9 mins',
          description: 'Turn the classroom into a mini job fair for -er words.',
          instructions: [
            'Place picture cards around the room.',
            'Students walk around, read the -er word, and describe the job to a partner.',
            'Record the word on the job fair passport.',
            'Collect signatures from three classmates who matched the same job.'
          ],
          materials: ['Picture cards', 'Job fair passport sheets'],
          printable: 'er-job-fair-passport'
        },
        {
          title: 'Doer Dominoes',
          icon: '🀄',
          duration: '8 mins',
          description: 'Play dominoes by matching base verbs to -er nouns.',
          instructions: [
            'Distribute domino tiles with bases on one side and -er words on the other.',
            'Students connect matching pairs to build a train.',
            'Read the pair aloud and explain the meaning.',
            'First to use all tiles wins.'
          ],
          materials: ['Domino tiles printable'],
          printable: 'er-doer-dominoes'
        }
      ],

      assessment: {
        formative: [
          'Do students add -er correctly to base verbs?',
          'Can they explain the meaning of the new noun?',
          'Do they recognise when -er does not mean a person?'
        ],
        questions: [
          'What does the word teacher mean?',
          'Does jumper mean a person? Explain.',
          'Make a sentence with the word runner.'
        ],
        exitTicket: 'Write one -er word that names a person and draw the action.'
      }
    },
    {
      id: 9,
      title: 'Comparing with -er',
      icon: '⚖️',
      duration: '25 minutes',
      objectives: [
        'Add the comparative suffix -er to compare two things',
        'Explain how -er changes adjectives to show comparison',
        'Use -er adjectives in sentences that compare objects'
      ],
      materials: ['Adjective cards', 'Comparison objects (soft ball, hard block)', 'Sentence frames'],

      teacherScript: [
        {
          section: 'Introduce Comparing Words (5 mins)',
          content: `Hold a soft pillow and a firm book. Say: "The pillow is soft. The pillow is softer than the book." Highlight the -er ending and explain it compares two things.`,
          animation: 'fadeIn'
        },
        {
          section: 'Hands-On Comparisons (10 mins)',
          content: `Pairs compare classroom objects (heavy/light, long/short). They add -er to the adjective and complete the sentence frame “The ___ is ___ than the ___.”`,
          animation: 'slideUp'
        },
        {
          section: 'Sentence Share (7 mins)',
          content: `Invite groups to share their comparison sentence. Write strong examples on chart paper and underline the -er endings.`,
          animation: 'zoomIn'
        },
        {
          section: 'Mini-Reflection (3 mins)',
          content: `Ask: "When do we use -er on an adjective?" Record student responses and repeat the rule together.`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Add -er to Compare',
          subtitle: 'Two objects, one comparison',
          icon: '📏',
          prompt: 'Say the sentence using -er.',
          focusWords: ['soft ➜ softer', 'quick ➜ quicker', 'long ➜ longer', 'cold ➜ colder'],
          actions: [
            'Use hand motions to show which object is more.',
            'Underline the -er ending in the air.'
          ],
          background: 'from-sky-400 via-cyan-400 to-emerald-400'
        },
        {
          title: 'Which One Wins?',
          subtitle: 'Choose the stronger adjective',
          icon: '🏆',
          prompt: 'Point to the picture that matches the -er word.',
          focusWords: ['taller', 'quicker', 'smaller', 'brighter'],
          actions: [
            'Stand tall, crouch low, or move quickly to act it out.',
            'Explain which two things you are comparing.'
          ],
          background: 'from-yellow-400 via-orange-400 to-red-400'
        },
        {
          title: 'Fix the Sentence',
          subtitle: 'Add the missing -er',
          icon: '🛠️',
          prompt: 'Rewrite the sentence correctly.',
          focusWords: [
            'The blue car is fast than the red car.',
            'This pencil is long than that pencil.'
          ],
          actions: [
            'Add -er and reread with expression.',
            'Share the corrected sentence with the group.'
          ],
          background: 'from-purple-400 via-indigo-400 to-blue-400'
        },
        {
          title: 'Compare & Draw',
          subtitle: 'Illustrate the comparison',
          icon: '✏️',
          prompt: 'Draw two things that match the -er word.',
          focusWords: ['bigger', 'smaller', 'hotter', 'colder'],
          actions: [
            'Label each drawing with the adjective.',
            'Show your drawing and read the sentence aloud.'
          ],
          background: 'from-emerald-400 via-teal-400 to-cyan-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '⚖️',
          title: 'Comparing with -er',
          subtitle: 'Add -er to describe which one has more or less.',
          gradient: 'from-sky-400 via-cyan-400 to-emerald-400'
        },
        ruleFocus: {
          title: 'Comparative Rule',
          description: 'When comparing two things, add -er to many short adjectives.',
          keyPoints: [
            'Use -er when comparing two objects.',
            'Say “than” to connect the two items.',
            'Do not change the base spelling for these adjectives.'
          ],
          examples: [
            { word: 'softer', breakdown: 'soft + er', meaning: 'more soft than something else' },
            { word: 'harder', breakdown: 'hard + er', meaning: 'more hard than something else' },
            { word: 'quicker', breakdown: 'quick + er', meaning: 'faster than another thing' }
          ]
        },
        quickCheck: {
          question: 'Which word compares two things?',
          answers: ['cold', 'colder'],
          correctAnswer: 'colder',
          celebration: '🎉 Comparative champion!'
        },
        practice: [
          {
            title: 'Comparison Cards',
            icon: '🃏',
            background: 'from-blue-400 via-indigo-400 to-purple-400',
            description: 'Read the adjective and make a comparing sentence.',
            steps: [
              'Pick an adjective card.',
              'Add -er and say “than”.',
              'Compare two classroom objects.'
            ]
          },
          {
            title: 'Picture Compare Challenge',
            icon: '🖼️',
            background: 'from-amber-400 via-orange-400 to-red-400',
            description: 'Use picture pairs to describe differences.',
            steps: [
              'Look at the picture pair.',
              'Decide which one shows more of the adjective.',
              'Write the -er sentence in your notebook.'
            ]
          }
        ],
        exitTicket: 'Write a sentence comparing two animals using an -er word.'
      },

      practiceWordLists: [
        {
          heading: 'Add -er to Adjectives',
          description: 'Say each comparative aloud.',
          words: ['soft ➜ softer', 'hard ➜ harder', 'quick ➜ quicker', 'cold ➜ colder', 'long ➜ longer']
        },
        {
          heading: 'Sentence Frames',
          description: 'Fill in the blank with an -er word.',
          words: ['My pencil is ____ than yours.', 'This blanket is ____ than that one.', 'The turtle is ____ than the rabbit.']
        }
      ],

      activities: [
        {
          title: 'Comparison Relay',
          icon: '🏃',
          duration: '11 mins',
          description: 'Teams race to create correct -er sentences.',
          instructions: [
            'Line up teams with adjective cards in a basket.',
            'First student grabs a card, adds -er, and compares two items in the room.',
            'Write the sentence on the relay chart and tag the next teammate.',
            'Most accurate sentences win.'
          ],
          materials: ['Adjective cards', 'Relay chart'],
          printable: 'comparison-relay-chart'
        },
        {
          title: '-er Spinner Sentences',
          icon: '🌀',
          duration: '8 mins',
          description: 'Spin to select an adjective and two nouns to compare.',
          instructions: [
            'Use the spinner template with adjectives and nouns.',
            'Spin once for the adjective and twice for nouns.',
            'Build a sentence comparing the two nouns.',
            'Record it on the spinner worksheet.'
          ],
          materials: ['Spinner template', 'Pencil'],
          printable: 'er-comparison-spinner'
        },
        {
          title: 'Comparative Sorting Mats',
          icon: '🧼',
          duration: '10 mins',
          description: 'Sort adjective cards into base and -er forms.',
          instructions: [
            'Lay out mats labelled BASE and COMPARATIVE.',
            'Students sort cards and read each word aloud.',
            'Match each comparative with a picture clue.',
            'Share one comparison sentence with the group.'
          ],
          materials: ['Sorting mats', 'Adjective cards', 'Picture clues'],
          printable: 'comparative-sorting-mats'
        }
      ],

      assessment: {
        formative: [
          'Do students correctly add -er to adjectives?',
          'Can they explain what two things are being compared?',
          'Do they use “than” in sentences?'
        ],
        questions: [
          'How does adding -er change the word quick?',
          'Compare two classroom items using longer.',
          'When should you use -er?'
        ],
        exitTicket: 'Circle the word that compares: warm or warmer. Then write a sentence with it.'
      }
    },
    {
      id: 10,
      title: 'Re-do Prefix Power',
      icon: '🔁',
      duration: '25 minutes',
      objectives: [
        'Add the prefix re- to show doing something again',
        'Explain how re- changes the meaning of base words',
        'Generate and use re- words in sentences'
      ],
      materials: ['Prefix re- cards', 'Base word cards', 'Whiteboards'],

      teacherScript: [
        {
          section: 'Prefix Introduction (5 mins)',
          content: `Write the word DO on the board. Add the prefix card RE- to make REDO. Explain: "The prefix re- means again." Repeat with READ ➜ REREAD and MAKE ➜ REMAKE.`,
          animation: 'fadeIn'
        },
        {
          section: 'Build & Explain (10 mins)',
          content: `Students pair prefix cards with base words (play, draw, name, write). After building the word, they explain, “To rename means name again.”`,
          animation: 'slideUp'
        },
        {
          section: 'Sentence Challenge (7 mins)',
          content: `Provide sentence frames (“I will ___ my picture.”). Students choose a re- word that fits and read the sentence aloud.`,
          animation: 'zoomIn'
        },
        {
          section: 'Reflection (3 mins)',
          content: `Ask: "What does the prefix re- tell us?" Create a quick anchor chart of student-generated re- words.`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Add re- to Repeat',
          subtitle: 'Do it again!',
          icon: '🔄',
          prompt: 'Say the new meaning.',
          focusWords: ['play ➜ replay', 'make ➜ remake', 'draw ➜ redraw', 'name ➜ rename'],
          actions: [
            'Pretend to rewind with your hands.',
            'Explain the new meaning in one sentence.'
          ],
          background: 'from-cyan-400 via-sky-400 to-indigo-400'
        },
        {
          title: 'Prefix Detective',
          subtitle: 'Does it mean again?',
          icon: '🕵️‍♀️',
          prompt: 'Sort words that start with re-.',
          focusWords: ['redo', 'return', 'remember', 'recycle'],
          actions: [
            'Hold a magnifying glass prop and explain the meaning.',
            'Decide if re- means again or not (return, remember).'
          ],
          background: 'from-emerald-400 via-teal-400 to-lime-400'
        },
        {
          title: 'Sentence Starters',
          subtitle: 'Complete with re-',
          icon: '📝',
          prompt: 'Fill in the blank to make sense.',
          focusWords: [
            'I need to ___ my homework (redo).',
            'Let’s ___ the song (replay).',
            'We will ___ the picture (redraw).'
          ],
          actions: [
            'Write the word on a mini whiteboard.',
            'Read the sentence to a partner.'
          ],
          background: 'from-yellow-400 via-orange-400 to-red-400'
        },
        {
          title: 'Prefix Switch-Up',
          subtitle: 'Add re- to new bases',
          icon: '🎛️',
          prompt: 'Try re- with different base words.',
          focusWords: ['read', 'mix', 'fill', 'paint'],
          actions: [
            'If the word makes sense, act it out.',
            'If it does not, explain why.'
          ],
          background: 'from-purple-400 via-indigo-400 to-blue-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🔁',
          title: 'Re-do Prefix Power',
          subtitle: 're- means again or back.',
          gradient: 'from-cyan-400 via-sky-400 to-indigo-400'
        },
        ruleFocus: {
          title: 'Prefix Rule',
          description: 'The prefix re- goes at the front of a base word to show doing something again or returning.',
          keyPoints: [
            'Prefixes come before the base.',
            're- usually means again or back.',
            'Read the whole word to check if it makes sense.'
          ],
          examples: [
            { word: 'redo', breakdown: 're + do', meaning: 'do again' },
            { word: 'rename', breakdown: 're + name', meaning: 'name again' },
            { word: 'react', breakdown: 're + act', meaning: 'act in response again' }
          ]
        },
        quickCheck: {
          question: 'What does replay mean?',
          answers: ['play once', 'play again'],
          correctAnswer: 'play again',
          celebration: '🎉 Ready to replay the fun!'
        },
        practice: [
          {
            title: 'Prefix Builder',
            icon: '🧱',
            background: 'from-blue-400 via-indigo-400 to-purple-400',
            description: 'Snap re- onto base words.',
            steps: [
              'Choose a base card.',
              'Add the re- card to the front.',
              'Say the new meaning aloud.'
            ]
          },
          {
            title: 'Re- Word Hunt',
            icon: '🔍',
            background: 'from-emerald-400 via-teal-400 to-lime-400',
            description: 'Search texts for re- words.',
            steps: [
              'Scan a shared reading passage.',
              'Highlight any words that start with re-.',
              'Explain each word to a partner.'
            ]
          }
        ],
        exitTicket: 'Write one re- word and explain what it means.'
      },

      practiceWordLists: [
        {
          heading: 'Add re-',
          description: 'Create new words.',
          words: ['make ➜ remake', 'draw ➜ redraw', 'play ➜ replay', 'do ➜ redo', 'name ➜ rename']
        },
        {
          heading: 'Meaning Match',
          description: 'Connect the word to the meaning.',
          words: ['redo = do again', 'react = act again', 'rename = name again', 'rewrite = write again']
        }
      ],

      activities: [
        {
          title: 'Re- Word Construction Cards',
          icon: '🏗️',
          duration: '10 mins',
          description: 'Students build re- words with puzzle pieces.',
          instructions: [
            'Provide puzzle pieces labelled re- and base words.',
            'Students connect pieces to make real words.',
            'Read the word aloud and explain the meaning.',
            'Record the word on the construction sheet.'
          ],
          materials: ['Puzzle pieces', 'Recording sheet'],
          printable: 're-prefix-puzzle-cards'
        },
        {
          title: 'Re- Action Charades',
          icon: '🎭',
          duration: '9 mins',
          description: 'Act out re- words for classmates to guess.',
          instructions: [
            'Students draw a re- word card.',
            'Act out the action without speaking.',
            'Classmates guess the word and explain the meaning.',
            'Switch actors and continue.'
          ],
          materials: ['Word cards'],
          printable: 're-action-charades-cards'
        },
        {
          title: 'Prefix Flow Chart',
          icon: '📊',
          duration: '8 mins',
          description: 'Plan steps to redo a task using re- words.',
          instructions: [
            'Give each student a flow chart template.',
            'Students fill in three steps using re- words (e.g., rewrite, redraw, retry).',
            'Share the plan with a partner.',
            'Post charts on the Morphology wall.'
          ],
          materials: ['Flow chart template'],
          printable: 're-prefix-flow-chart'
        }
      ],

      assessment: {
        formative: [
          'Do students attach re- correctly?',
          'Can they explain the meaning change?',
          'Do they use re- words accurately in sentences?'
        ],
        questions: [
          'What does remix mean?',
          'Give me a sentence with rename.',
          'Why does re- mean again?'
        ],
        exitTicket: 'Circle the words that mean “again”: redo, replay, open. Explain your choice.'
      }
    },
    {
      id: 11,
      title: 'Yummy -y Adjectives',
      icon: '🍦',
      duration: '25 minutes',
      objectives: [
        'Add the suffix -y to make adjectives meaning “full of” or “having”',
        'Describe objects using -y adjectives',
        'Write sentences that use -y words to add detail'
      ],
      materials: ['Noun cards', '-y suffix cards', 'Texture samples'],

      teacherScript: [
        {
          section: 'Introduce -y (5 mins)',
          content: `Show the word SUN. Add -Y to make SUNNY. Explain that -y means “full of” or “having the quality of.” Repeat with RAIN ➜ RAINY and MESS ➜ MESSY.`,
          animation: 'fadeIn'
        },
        {
          section: 'Sensory Stations (10 mins)',
          content: `Set up small stations with items (soft cotton, sticky tape). Students choose a base word (cloud, stick) and add -y to describe the item (cloudy, sticky).`,
          animation: 'slideUp'
        },
        {
          section: 'Sentence Share (7 mins)',
          content: `Students write a sentence using their favourite -y word on a mini whiteboard and illustrate it quickly.`,
          animation: 'zoomIn'
        },
        {
          section: 'Reflection (3 mins)',
          content: `Ask: "What does -y tell us about the noun?" Create a word wall of new -y adjectives.`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Add -y for Description',
          subtitle: 'Full of something',
          icon: '🌦️',
          prompt: 'Say the noun and the -y adjective.',
          focusWords: ['rain ➜ rainy', 'cloud ➜ cloudy', 'sun ➜ sunny', 'luck ➜ lucky'],
          actions: [
            'Gesture the weather or feeling as you speak.',
            'Underline the -y ending with your finger.'
          ],
          background: 'from-blue-400 via-sky-400 to-yellow-400'
        },
        {
          title: 'Texture Match',
          subtitle: 'Which -y word fits?',
          icon: '🖐️',
          prompt: 'Feel the object and name the -y word.',
          focusWords: ['sticky', 'messy', 'bumpy', 'squishy'],
          actions: [
            'Pass the texture sample to the next student.',
            'Use the sentence “It feels ___.”'
          ],
          background: 'from-lime-400 via-emerald-400 to-teal-400'
        },
        {
          title: 'Picture Adjectives',
          subtitle: 'Describe what you see',
          icon: '🖼️',
          prompt: 'Choose the best -y word for the picture.',
          focusWords: ['snowy', 'windy', 'spooky', 'sleepy'],
          actions: [
            'Act out the adjective with a motion.',
            'Explain why the word fits the picture.'
          ],
          background: 'from-purple-400 via-indigo-400 to-blue-400'
        },
        {
          title: 'Sentence Switch',
          subtitle: 'Make the sentence more descriptive',
          icon: '✍️',
          prompt: 'Add a -y adjective to the noun.',
          focusWords: ['The puppy was ___ (sleep).', 'The sky looked ___ (cloud).', 'My hands were ___ (mess).'],
          actions: [
            'Write the new sentence and share with a partner.',
            'Illustrate the sentence quickly.'
          ],
          background: 'from-amber-400 via-orange-400 to-red-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🍦',
          title: 'Yummy -y Adjectives',
          subtitle: '-y words describe what something is full of.',
          gradient: 'from-blue-400 via-sky-400 to-yellow-400'
        },
        ruleFocus: {
          title: '-y Rule',
          description: 'Add -y to nouns to make adjectives that tell what something is like.',
          keyPoints: [
            '-y means full of or having the quality of.',
            'These words describe nouns.',
            'Most base spellings stay the same.'
          ],
          examples: [
            { word: 'rainy', breakdown: 'rain + y', meaning: 'full of rain' },
            { word: 'messy', breakdown: 'mess + y', meaning: 'full of mess' },
            { word: 'sleepy', breakdown: 'sleep + y', meaning: 'full of sleepiness' }
          ]
        },
        quickCheck: {
          question: 'Which word means “full of sun”?',
          answers: ['sun', 'sunny'],
          correctAnswer: 'sunny',
          celebration: '🌞 Sunny success!'
        },
        practice: [
          {
            title: '-y Word Builder',
            icon: '🧩',
            background: 'from-emerald-400 via-teal-400 to-cyan-400',
            description: 'Snap -y onto base nouns.',
            steps: [
              'Pick a noun card.',
              'Add -y and read the adjective.',
              'Use it to describe something in the room.'
            ]
          },
          {
            title: 'Adjective Artist',
            icon: '🎨',
            background: 'from-pink-400 via-rose-400 to-red-400',
            description: 'Draw what the -y word looks like.',
            steps: [
              'Write the -y word in bubble letters.',
              'Illustrate the meaning.',
              'Share your art gallery with classmates.'
            ]
          }
        ],
        exitTicket: 'Write two -y words and use one in a sentence.'
      },

      practiceWordLists: [
        {
          heading: 'Create -y Adjectives',
          description: 'Add -y to the base.',
          words: ['luck', 'mess', 'sun', 'rain', 'sleep']
        },
        {
          heading: 'Describe It',
          description: 'Choose the best -y word.',
          words: ['___ day (rainy/sunny)', '___ puppy (sleepy/happy)', '___ room (messy/tidy)']
        }
      ],

      activities: [
        {
          title: '-y Texture Hunt',
          icon: '🔍',
          duration: '10 mins',
          description: 'Hunt for classroom items that fit -y adjectives.',
          instructions: [
            'Give students a checklist of -y words.',
            'Search the room and write the object that matches each word.',
            'Sketch the object quickly.',
            'Share findings in a circle.'
          ],
          materials: ['Checklist printable', 'Pencils'],
          printable: 'y-adjective-hunt'
        },
        {
          title: 'Weather Wheel',
          icon: '🌀',
          duration: '9 mins',
          description: 'Spin to get a weather base word and add -y.',
          instructions: [
            'Use the weather wheel spinner.',
            'Students spin, add -y, and describe the weather.',
            'Draw the scene on the response sheet.',
            'Present to a partner.'
          ],
          materials: ['Spinner', 'Response sheet'],
          printable: 'y-weather-wheel'
        },
        {
          title: 'Adjective Sentence Strips',
          icon: '📝',
          duration: '8 mins',
          description: 'Add -y words to plain sentences.',
          instructions: [
            'Provide plain noun sentences.',
            'Students add a -y adjective to describe the noun.',
            'Illustrate and read the sentence to a friend.',
            'Collect strips for a class book.'
          ],
          materials: ['Sentence strips', 'Crayons'],
          printable: 'y-adjective-sentence-strips'
        }
      ],

      assessment: {
        formative: [
          'Do students add -y correctly to nouns?',
          'Can they explain the meaning of the new adjective?',
          'Do they use -y words in sentences?'
        ],
        questions: [
          'What does snowy mean?',
          'Give a sentence with messy.',
          'How does -y change the word sun?'
        ],
        exitTicket: 'Add -y to two nouns and write a describing sentence for one.'
      }
    },
    {
      id: 12,
      title: 'Lovely -ly Builders',
      icon: '✨',
      duration: '25 minutes',
      objectives: [
        'Add the suffix -ly to nouns to make adjectives',
        'Add the suffix -ly to adjectives to make adverbs',
        'Use -ly words in sentences to describe how actions happen'
      ],
      materials: ['Noun and adjective cards', '-ly suffix cards', 'Action cards'],

      teacherScript: [
        {
          section: 'Two Jobs for -ly (5 mins)',
          content: `Explain that -ly can turn nouns into adjectives (friend ➜ friendly) and adjectives into adverbs (quick ➜ quickly). Show both on the board with simple sentences.`,
          animation: 'fadeIn'
        },
        {
          section: 'Sort & Build (10 mins)',
          content: `Provide cards labelled NOUN or ADJECTIVE. Students add -ly to the correct words and sort them into "-ly adjectives" (friendly, lovely) and "-ly adverbs" (quickly, slowly).`,
          animation: 'slideUp'
        },
        {
          section: 'Action Showcase (7 mins)',
          content: `Pairs draw an action card (run, sing). One student acts it out quickly, slowly, or sadly while the other says the sentence using the -ly adverb.`,
          animation: 'zoomIn'
        },
        {
          section: 'Reflection (3 mins)',
          content: `Ask: "What does -ly tell us in each sentence?" Record examples of adjectives and adverbs on a T-chart.`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Noun to Adjective',
          subtitle: 'Add -ly to describe nouns',
          icon: '👥',
          prompt: 'Use the word in a describing sentence.',
          focusWords: ['friend ➜ friendly', 'love ➜ lovely'],
          actions: [
            'Give a friendly wave or a lovely smile.',
            'Share a sentence describing a person or place.'
          ],
          background: 'from-pink-400 via-rose-400 to-red-400'
        },
        {
          title: 'Adjective to Adverb',
          subtitle: 'Tell how something happens',
          icon: '🏃‍♀️',
          prompt: 'Add -ly and act it out.',
          focusWords: ['quick ➜ quickly', 'slow ➜ slowly', 'sad ➜ sadly', 'loud ➜ loudly'],
          actions: [
            'Act the motion in the described way.',
            'Say the full sentence aloud.'
          ],
          background: 'from-blue-400 via-indigo-400 to-purple-400'
        },
        {
          title: 'Sentence Fixer',
          subtitle: 'Choose the correct -ly word',
          icon: '🛠️',
          prompt: 'Replace the underlined word with an -ly word.',
          focusWords: [
            'The girl sings beautiful.',
            'He ran slow to the door.'
          ],
          actions: [
            'Rewrite with beautifully or slowly.',
            'Read the improved sentence dramatically.'
          ],
          background: 'from-teal-400 via-cyan-400 to-emerald-400'
        },
        {
          title: '-ly Word Sort',
          subtitle: 'Adjective or adverb?',
          icon: '🧺',
          prompt: 'Place each -ly word in the correct column.',
          focusWords: ['friendly', 'lovely', 'quickly', 'slowly'],
          actions: [
            'Explain whether the word describes a noun or verb.',
            'Use it in a sentence before placing it.'
          ],
          background: 'from-yellow-400 via-orange-400 to-red-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '✨',
          title: 'Lovely -ly Builders',
          subtitle: '-ly words describe people and actions.',
          gradient: 'from-pink-400 via-rose-400 to-purple-400'
        },
        ruleFocus: {
          title: '-ly Rule',
          description: 'Add -ly to nouns to make adjectives and to adjectives to make adverbs that tell how something happens.',
          keyPoints: [
            '-ly adjectives describe nouns (friendly dog).',
            '-ly adverbs describe verbs (run quickly).',
            'The base spelling usually stays the same.'
          ],
          examples: [
            { word: 'friendly', breakdown: 'friend + ly', meaning: 'kind and full of friendship' },
            { word: 'lovely', breakdown: 'love + ly', meaning: 'full of love and beauty' },
            { word: 'quickly', breakdown: 'quick + ly', meaning: 'in a fast way' }
          ]
        },
        quickCheck: {
          question: 'Which word tells how someone runs?',
          answers: ['runner', 'quickly'],
          correctAnswer: 'quickly',
          celebration: '💨 Speedy success!'
        },
        practice: [
          {
            title: '-ly T-Chart Sort',
            icon: '📊',
            background: 'from-blue-400 via-indigo-400 to-purple-400',
            description: 'Sort words into adjective or adverb columns.',
            steps: [
              'Read the base word and decide its job.',
              'Add -ly and place it in the correct column.',
              'Say a sentence to prove your choice.'
            ]
          },
          {
            title: 'Adverb Action Cards',
            icon: '🎬',
            background: 'from-emerald-400 via-teal-400 to-cyan-400',
            description: 'Act out how the adverb tells you to move.',
            steps: [
              'Draw an action card.',
              'Add an -ly adverb (quickly, slowly, loudly).',
              'Act it out while your partner names the adverb.'
            ]
          }
        ],
        exitTicket: 'Write one -ly adjective and one -ly adverb. Label each.'
      },

      practiceWordLists: [
        {
          heading: 'Noun to -ly Adjective',
          description: 'Add -ly to describe the noun.',
          words: ['friend ➜ friendly', 'love ➜ lovely', 'cost ➜ costly', 'cloud ➜ cloudy (review)', 'heart ➜ hearty']
        },
        {
          heading: 'Adjective to -ly Adverb',
          description: 'Add -ly to tell how.',
          words: ['quick ➜ quickly', 'slow ➜ slowly', 'sad ➜ sadly', 'brave ➜ bravely', 'quiet ➜ quietly']
        }
      ],

      activities: [
        {
          title: '-ly Word Lab',
          icon: '🧪',
          duration: '11 mins',
          description: 'Experiment with changing base words using -ly.',
          instructions: [
            'Set up lab trays with base word cards.',
            'Students add -ly and record whether it makes an adjective or adverb.',
            'Write a sentence using the new word.',
            'Share findings during lab debrief.'
          ],
          materials: ['Lab tray labels', 'Recording sheet'],
          printable: 'ly-word-lab-recording-sheet'
        },
        {
          title: 'Adverb Relay',
          icon: '🏃‍♂️',
          duration: '8 mins',
          description: 'Teams act out adverbs as classmates guess.',
          instructions: [
            'Students draw an adjective card and add -ly.',
            'Act out the motion while teammates guess the adverb.',
            'Swap roles after each correct guess.',
            'Record the word on the relay log.'
          ],
          materials: ['Adjective cards', 'Relay log'],
          printable: 'ly-adverb-relay-log'
        },
        {
          title: 'Friendly & Lovely Notes',
          icon: '💌',
          duration: '9 mins',
          description: 'Write notes using -ly adjectives and adverbs.',
          instructions: [
            'Provide note templates with prompts.',
            'Students write a friendly compliment and describe an action using an -ly adverb.',
            'Decorate and deliver the note to a classmate.',
            'Read the note aloud together.'
          ],
          materials: ['Note templates', 'Markers'],
          printable: 'ly-friendly-note-cards'
        }
      ],

      assessment: {
        formative: [
          'Do students know when -ly makes an adjective or adverb?',
          'Can they explain how the meaning changes?',
          'Do they use -ly words accurately in sentences?'
        ],
        questions: [
          'What does friendly describe?',
          'Use quickly in a sentence that tells how someone moves.',
          'Is lovely an adjective or adverb? Explain.'
        ],
        exitTicket: 'Write a sentence with an -ly adverb and underline the verb it describes.'
      }
    }
  ]
};

export default MorphologyLevel2;
