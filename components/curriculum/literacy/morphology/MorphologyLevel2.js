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
        }
      ],

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
        }
      ],

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
        }
      ],

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
        }
      ],

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
        }
      ],

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
    }
  ]
};

export default MorphologyLevel2;
