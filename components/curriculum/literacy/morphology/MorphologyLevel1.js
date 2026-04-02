// components/curriculum/literacy/morphology/MorphologyLevel1.js
import React from 'react';

const MorphologyLevel1 = {
  levelInfo: {
    level: 1,
    ageRange: '5-6 years',
    title: 'Introduction to Morphology',
    description: 'Building word awareness and understanding word parts',
    color: 'from-pink-400 to-purple-500'
  },

  lessons: [
    {
      id: 1,
      title: 'Word Awareness: Compound Words & Syllables',
      icon: '🔤',
      duration: '20-25 minutes',
      objectives: [
        'Understand that words can be made of smaller parts',
        'Identify compound words (two words put together)',
        'Clap out syllables in multisyllabic words'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Picture cards (optional)',
        'Student whiteboards'
      ],
      
      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Good morning, word detectives! 🔍 Today we're going to discover something AMAZING about words!

Did you know that some words are actually made up of smaller words? And some words have parts that we can clap out? Let me show you!

[Write "butterfly" on the board]

Let's look at this word together. Can anyone see TWO words hiding inside this word?

[Wait for responses - guide them to see "butter" and "fly"]

That's right! BUTTER + FLY = BUTTERFLY! When we put two words together to make one new word, we call it a COMPOUND WORD!`,
          animation: 'fadeIn'
        },
        {
          section: 'Teaching Compound Words (8 mins)',
          content: `Let's try some more! I'll show you a word, and you can help me find the two words hiding inside!

[Write these words one at a time, letting students discover the parts]

RAINBOW → RAIN + BOW ☔🌈
SUNSHINE → SUN + SHINE ☀️✨
FOOTBALL → FOOT + BALL ⚽👣
BEDROOM → BED + ROOM 🛏️🚪
CUPCAKE → CUP + CAKE 🧁☕

Wow! You're all amazing word detectives! 

Now here's the fun part - we can make up our OWN compound words! What if we put:

• DRAGON + FLY = DRAGONFLY 🐉
• FIRE + TRUCK = FIRETRUCK 🚒🔥
• POP + CORN = POPCORN 🍿

Can YOU think of a compound word? [Take student suggestions]`,
          animation: 'slideUp'
        },
        {
          section: 'Teaching Syllables (7 mins)',
          content: `Now let's learn about another word secret! Some words have different parts we can CLAP!

These parts are called SYLLABLES. Watch me:

[Clap as you say each syllable]

SUN-SHINE (clap twice) 👏👏
BUT-TER-FLY (clap three times) 👏👏👏
CAT (clap once) 👏

Your turn! Let's clap these words together:

• RAIN-BOW 👏👏
• AP-PLE 👏👏
• BA-NA-NA 👏👏👏
• EL-E-PHANT 👏👏👏
• FOOT-BALL 👏👏

Great job! Can you think of your name in syllables? Let's clap everyone's name!

[Go around the class clapping student names]`,
          animation: 'bounce'
        },
        {
          section: 'Practice Activity (5 mins)',
          content: `Now let's play a game! I'm going to say a word. If it's a compound word (two words put together), put your hands together like this [demonstrate hands together]. If it's NOT a compound word, shake your head!

Ready?

• BUTTERFLY → [hands together] ✅
• TABLE → [shake head] ❌
• RAINBOW → [hands together] ✅
• HAPPY → [shake head] ❌
• PLAYGROUND → [hands together] ✅
• SKATEBOARD → [hands together] ✅
• PENCIL → [shake head] ❌

You're all SUPERSTARS! 🌟`,
          animation: 'pulse'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `What did we learn today, word detectives?

✅ Some words are made of TWO smaller words (COMPOUND WORDS)
✅ We can CLAP the parts of words (SYLLABLES)
✅ Being a word detective is FUN!

Tomorrow we'll learn even more amazing things about words! Great work, everyone! 🎉`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Word Detectives Assemble!',
          subtitle: 'Compound words hide two smaller words',
          icon: '🔍',
          prompt: 'Say the two little words, then blend them together to make the big word!',
          focusWords: [
            'butter + fly = BUTTERFLY',
            'rain + bow = RAINBOW',
            'sun + shine = SUNSHINE',
            'cup + cake = CUPCAKE'
          ],
          actions: [
            'Point to each part as you say it out loud.',
            'Stretch your arms wide and cheer when the big word appears!'
          ],
          background: 'from-pink-500 via-purple-500 to-blue-500'
        },
        {
          title: 'Can You Spot the Compound Word?',
          subtitle: 'Two words become one new meaning',
          icon: '🌈',
          prompt: 'Read the two picture words, then blend them into one.',
          focusWords: [
            'rain + coat = RAINCOAT',
            'dog + house = DOGHOUSE',
            'pop + corn = POPCORN',
            'rain + bow = RAINBOW'
          ],
          actions: [
            'Thumbs up if it makes a real word.',
            'Shake your head if it does not make sense.'
          ],
          background: 'from-yellow-400 via-pink-400 to-purple-500'
        },
        {
          title: 'Clap the Syllables!',
          subtitle: 'Each clap is a word beat',
          icon: '👏',
          prompt: 'Clap with the teacher while you say each part of the word.',
          focusWords: ['sun-shine (2 claps)', 'ap-ple (2 claps)', 'el-e-phant (3 claps)', 'foot-ball (2 claps)'],
          actions: ['Tap the syllables on your lap.', 'Hold up fingers to show how many claps you hear.'],
          background: 'from-blue-500 via-purple-500 to-pink-500'
        },
        {
          title: 'Word Detective Challenge',
          subtitle: 'Let’s play our class game!',
          icon: '🎉',
          prompt: 'Hands together if it is a compound word. Shake your head if it is not.',
          focusWords: ['butterfly', 'table', 'rainbow', 'happy'],
          actions: ['Freeze in a superhero pose when you hear a real compound word.', 'Call out your own compound word to share.'],
          background: 'from-purple-600 via-pink-500 to-orange-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🔍',
          title: 'Compound Word Detectives',
          subtitle: 'Find the mini words hiding inside big words and clap the syllable beats!',
          gradient: 'from-pink-400 via-purple-400 to-indigo-400'
        },
        ruleFocus: {
          title: 'Today’s Discovery',
          description: 'Some words are made from two smaller words. Each word has beats called syllables that we can clap.',
          keyPoints: [
            'Say the two little words before you blend them.',
            'Clap the syllable beats as you say the big word.',
            'Check that the new word makes sense.'
          ],
          examples: [
            { word: 'SUNSHINE', breakdown: 'SUN + SHINE', meaning: 'sunlight and brightness' },
            { word: 'FOOTBALL', breakdown: 'FOOT + BALL', meaning: 'a game with a ball you kick' },
            { word: 'CUPCAKE', breakdown: 'CUP + CAKE', meaning: 'a cake in a cup' }
          ]
        },
        quickCheck: {
          question: 'Is “starfish” made from two words? What are they?',
          answers: ['star + fish'],
          celebration: '⭐ Great job, word detective!'
        },
        practice: [
          {
            title: 'Word Builder Tap',
            icon: '🧱',
            background: 'from-yellow-300 via-orange-300 to-pink-300',
            description: 'Tap each little word and then blend them together.',
            steps: [
              'Say the first word and tap your left hand.',
              'Say the second word and tap your right hand.',
              'Slide your hands together and say the big word with a cheer!'
            ]
          },
          {
            title: 'Syllable Stomp',
            icon: '🦶',
            background: 'from-blue-300 via-indigo-300 to-purple-300',
            description: 'Stomp the beats in each word.',
            steps: [
              'Say the word slowly.',
              'Stomp once for each syllable you hear.',
              'Show the number of stomps on your fingers.'
            ]
          }
        ],
        exitTicket: 'Draw a compound word and label the two mini words that make it.'
      },

      practiceWordLists: [
        {
          icon: '🌟',
          title: 'Compound Word Detective',
          description: 'Read the two little words. Blend them to say the new word.',
          words: [
            'sun + shine → sunshine',
            'rain + bow → rainbow',
            'cup + cake → cupcake',
            'foot + ball → football',
            'dog + house → doghouse'
          ]
        },
        {
          icon: '👏',
          title: 'Clap the Beats',
          description: 'Clap once for each syllable you hear.',
          words: ['rain-bow (2 claps)', 'but-ter-fly (3 claps)', 'puz-zle (2 claps)', 'pen-cil (2 claps)', 'el-e-phant (3 claps)']
        },
        {
          icon: '🧠',
          title: 'Make Your Own',
          description: 'Choose two cards and build a silly compound word.',
          words: ['star + fish → starfish', 'sun + flower → sunflower', 'mail + box → mailbox', 'play + ground → playground', 'rain + coat → raincoat']
        }
      ],

      displaySections: [
        {
          title: 'One to Many Switch',
          subtitle: 'Add -S to show more than one',
          icon: '🔁',
          prompt: 'Say the base word, then add -S and cheer the plural word together.',
          focusWords: ['cat → cats', 'dog → dogs', 'hat → hats', 'cup → cups'],
          actions: [
            'Trace the base word in the air, then flick your fingers as you add -S.',
            'Use a soft cheer like "yay!" when you read the new plural aloud.'
          ],
          background: 'from-yellow-400 via-orange-400 to-pink-500'
        },
        {
          title: 'Spot the Base Word',
          subtitle: 'The base stays the same!',
          icon: '🕵️‍♀️',
          prompt: 'Read the plural and point to the base word that did not change.',
          focusWords: ['beds (base: bed)', 'pigs (base: pig)', 'bugs (base: bug)', 'pens (base: pen)'],
          actions: [
            'Underline the base word with your finger, then tap the -S.',
            'Freeze like a statue when you see the base word hiding in the plural.'
          ],
          background: 'from-blue-400 via-purple-400 to-pink-500'
        },
        {
          title: 'Plural Parade Sentences',
          subtitle: 'Read the whole sentence with the plural',
          icon: '🎺',
          prompt: 'March in place as you read the sentence and show the plural with your fingers.',
          focusWords: [
            'I see two cats.',
            'Three dogs run.',
            'Four pigs play.',
            'Five bugs crawl.'
          ],
          actions: [
            'Hold up the number of fingers for how many you hear.',
            'Give the plural a drumroll on your knees before you say it.'
          ],
          background: 'from-green-400 via-teal-400 to-blue-500'
        },
        {
          title: 'Base Word Freeze Dance',
          subtitle: 'Say the base before the plural',
          icon: '🧊',
          prompt: 'When the plural appears, say the base word, then add -S with a sparkle motion.',
          focusWords: ['cat ... cats', 'bag ... bags', 'cup ... cups', 'bed ... beds'],
          actions: [
            'Freeze like a statue while you say the base, then wiggle as you add -S.',
            'Whisper the base word and shout the plural for dramatic fun.'
          ],
          background: 'from-purple-500 via-indigo-500 to-blue-500'
        }
      ],

      practiceWordLists: [
        {
          icon: '🎯',
          title: 'Add -S Builders',
          description: 'Read the base word, then add -S to make it mean more than one.',
          words: ['cat → cats', 'dog → dogs', 'hat → hats', 'cup → cups', 'pig → pigs']
        },
        {
          icon: '📚',
          title: 'Plural Reading Parade',
          description: 'Point to the base, tap the -S, and read the plural out loud.',
          words: ['beds', 'bugs', 'pens', 'toys', 'maps']
        },
        {
          icon: '✍️',
          title: 'Sentence Starters',
          description: 'Finish the sentence with a plural word that has -S at the end.',
          words: [
            'I have two ____ (cats).',
            'Three ____ are running (dogs).',
            'Look at the red ____ (hats).',
            'Five ____ are on the table (cups).',
            'Seven ____ buzz past (bugs).'
          ]
        }
      ],

      activities: [
        {
          title: 'Compound Word Picture Match',
          icon: '🎨',
          duration: '10 mins',
          description: 'Match pictures to create compound words',
          instructions: [
            'Display pairs of pictures (rain/bow, sun/flower, tooth/brush)',
            'Students match pictures that make compound words',
            'Draw lines to connect or use physical picture cards',
            'Students say the compound word created'
          ],
          materials: ['Picture cards', 'Worksheet or whiteboard'],
          printable: 'compound-word-cards'
        },
        {
          title: 'Syllable Clapping Circle',
          icon: '👏',
          duration: '10 mins',
          description: 'Clap syllables in a fun circle game',
          instructions: [
            'Sit in a circle',
            'Teacher says a word',
            'Everyone claps the syllables together',
            'Go around the circle - each student suggests a word',
            'Class claps it together'
          ],
          materials: ['None - just hands!']
        },
        {
          title: 'Build-A-Word Station',
          icon: '🏗️',
          duration: '15 mins',
          description: 'Create compound words with word cards',
          instructions: [
            'Provide cards with simple words (sun, moon, fish, star, ball, foot, cup, cake)',
            'Students experiment putting two cards together',
            'They check if it makes a real compound word',
            'Draw or write their favorite combinations'
          ],
          materials: ['Word cards', 'Paper', 'Crayons'],
          printable: 'build-a-word-cards'
        }
      ],

      assessment: {
        formative: [
          'Observe student participation in clapping activities',
          'Listen for correct syllable counting',
          'Check understanding during compound word game'
        ],
        questions: [
          'Can you tell me what a compound word is?',
          'Show me how to clap the syllables in your name',
          'Can you think of a compound word you see at school?'
        ]
      }
    },

    {
      id: 2,
      title: 'Base Words & Affixes: Changing Meaning',
      icon: '🎯',
      duration: '20-25 minutes',
      objectives: [
        'Understand that every word has a base',
        'Learn that we can add parts to change word meaning',
        'Recognize how affixes make new words'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Word building blocks or cards',
        'Magnetic letters (optional)'
      ],
      
      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Hello, word builders! 👷 Last time we learned about compound words and syllables. Today we're going to learn about the HEART of a word!

Every word has a special part called a BASE. The base is like the heart of the word - it's the main part!

[Draw a heart on the board and write "play" inside]

Look at this word: PLAY

This is a BASE WORD. It's complete all by itself! But watch what we can do...`,
          animation: 'heartbeat'
        },
        {
          section: 'Teaching Base Words (7 mins)',
          content: `The base word PLAY is like a building block. We can add pieces to it to make NEW words!

[Write on board, showing the base word highlighted in one color, additions in another]

PLAY → the base word 🎮
PLAYING → we added ING! ✨
PLAYED → we added ED! 🎯
PLAYER → we added ER! 🏆

Look! Same base word (PLAY) but we made FOUR different words!

The parts we ADD to the base are called AFFIXES. They're like word decorations that change the meaning!

Let's try another one:

JUMP → the base word 🦘
JUMPING → add ING
JUMPED → add ED  
JUMPER → add ER

Can you spot the base word in each one? That's right - JUMP! 

What do you notice? When we add these parts, we change WHEN something happens or WHO is doing it!

• JUMP → happening now
• JUMPED → already happened
• JUMPING → happening right now
• JUMPER → a person or thing that jumps`,
          animation: 'buildUp'
        },
        {
          section: 'Interactive Practice (8 mins)',
          content: `Now YOU try! Let's start with these base words and add parts!

[Write on board, students help complete]

Base: WALK 🚶
• WALK + ING = WALKING
• WALK + ED = WALKED  
• WALK + ER = WALKER

Base: TEACH 👩‍🏫
• TEACH + ING = TEACHING
• TEACH + ER = TEACHER

Base: HELP 🤝
• HELP + ING = HELPING
• HELP + ED = HELPED
• HELP + ER = HELPER

Look at how we're building word families! They all have the same base!

Here's something COOL: Sometimes the base word changes a tiny bit. Watch:

Base: RUN 🏃
• RUN + ING = RUNNING (we double the N!)
• RUN + ER = RUNNER (we double the N!)

But RUN is still the base - the heart of the word!`,
          animation: 'construct'
        },
        {
          section: 'Meaning Changes (5 mins)',
          content: `Let's see how these word parts change the meaning!

PAINT 🎨
"I PAINT a picture" - I do it

PAINTED 🖼️
"I PAINTED a picture yesterday" - I already did it

PAINTING 🎭
"I am PAINTING right now" - I'm doing it now

PAINTER 👨‍🎨
"I am a PAINTER" - It's my job or what I do

See? Same base (PAINT) but the meaning changes when we add parts!

Let's try one more:

SING 🎤
• "I SING" - what I do
• "I am SINGING" - doing it now
• "I SANG yesterday" - already did it (special change!)
• "I am a SINGER" - it's what I am

The BASE stays the same, but we can make it mean different things! Isn't that amazing? 🌟`,
          animation: 'transform'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `What did we discover today, word builders?

✅ Every word has a BASE - the heart of the word!
✅ We can ADD parts (called AFFIXES) to change the meaning
✅ The same base can make a whole FAMILY of words!

Tomorrow we'll learn the special NAMES for these word parts! You're all becoming word experts! 🎓`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'The Base is the Heart',
          subtitle: 'Every word has a strong base',
          icon: '💖',
          prompt: 'Say the base word together. Put your hands on your heart as you say it.',
          focusWords: ['play', 'jump', 'help', 'sing'],
          actions: ['Whisper the base word, then say it in a strong voice.', 'Show the thumbs-up when you hear a base word.'],
          background: 'from-red-400 via-pink-500 to-purple-500'
        },
        {
          title: 'Add Word Endings',
          subtitle: 'Affixes change the meaning',
          icon: '🧱',
          prompt: 'Read the base word, then add the new ending together.',
          focusWords: ['play + ing = PLAYING', 'play + er = PLAYER', 'jump + ed = JUMPED', 'jump + er = JUMPER'],
          actions: ['Circle the base word with your finger in the air.', 'Wave your hands like sparkles when the meaning changes.'],
          background: 'from-yellow-400 via-orange-400 to-pink-500'
        },
        {
          title: 'Build the Word Family',
          subtitle: 'Same base, many words',
          icon: '🏗️',
          prompt: 'All of these words share the same heart.',
          focusWords: ['walk → walking → walker', 'help → helping → helper', 'paint → painting → painter'],
          actions: ['Hold up one finger for the base, two for the new word.', 'Act out the word while we say it.'],
          background: 'from-green-400 via-teal-400 to-blue-500'
        },
        {
          title: 'What Changed?',
          subtitle: 'Listen for meaning clues',
          icon: '🧠',
          prompt: 'Does the new ending tell us WHEN or WHO?',
          focusWords: ['I paint. → I painted.', 'I jump. → I am jumping.', 'I play. → I am a player.'],
          actions: ['Show past tense with a thumbs over your shoulder.', 'Point to yourself if the word tells WHO.'],
          background: 'from-purple-500 via-blue-500 to-teal-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🎯',
          title: 'Base Word Builders',
          subtitle: 'Keep the base strong and add endings to change meaning!',
          gradient: 'from-amber-400 via-rose-400 to-purple-500'
        },
        ruleFocus: {
          title: 'Build With Affixes',
          description: 'A base word is the heart of the word. Adding endings like -ing, -ed, or -er changes the meaning or the time.',
          keyPoints: [
            'The base carries the main idea.',
            'Suffixes like -ing, -ed, -er change when or who.',
            'The base stays the same in every family word.'
          ],
          examples: [
            { word: 'PLAYING', breakdown: 'PLAY + ING', meaning: 'happening now' },
            { word: 'PLAYED', breakdown: 'PLAY + ED', meaning: 'already happened' },
            { word: 'PLAYER', breakdown: 'PLAY + ER', meaning: 'a person who plays' }
          ]
        },
        quickCheck: {
          question: 'What is the base word in “HELPER”?',
          answers: ['HELP'],
          celebration: '🙌 Great spotting!'
        },
        practice: [
          {
            title: 'Base Word Bounce',
            icon: '🏀',
            background: 'from-orange-300 via-pink-300 to-purple-300',
            description: 'Bounce the base word and catch an ending.',
            steps: [
              'Say the base word out loud.',
              'Bounce a ball or tap the desk while saying the new word with -ing or -ed.',
              'Explain what changed.'
            ]
          },
          {
            title: 'Affix Action Cards',
            icon: '🧩',
            background: 'from-blue-300 via-indigo-300 to-violet-300',
            description: 'Choose a base card and an ending card to make a new word.',
            steps: [
              'Pick a base word card (jump, help, walk).',
              'Pick an ending card (-ing, -ed, -er).',
              'Say the new word and act it out.'
            ]
          }
        ],
        exitTicket: 'Write one base word and add two different endings. Tell what each new word means.'
      },

      practiceWordLists: [
        {
          icon: '🎮',
          title: 'Play Word Family',
          description: 'Read how the word changes when we add endings.',
          words: ['play', 'plays', 'playing', 'played', 'player']
        },
        {
          icon: '🦘',
          title: 'Jump Word Family',
          description: 'Say the base word first, then the new word.',
          words: ['jump', 'jumping', 'jumped', 'jumper', 'jumps']
        },
        {
          icon: '🖌️',
          title: 'Try These Bases',
          description: 'Use cards to build the new words together.',
          words: ['walk → walking / walker', 'help → helping / helper', 'sing → singing / singer', 'paint → painting / painter', 'run → running / runner']
        }
      ],

      activities: [
        {
          title: 'Base Word Hunt',
          icon: '🔍',
          duration: '10 mins',
          description: 'Find the base word in word families',
          instructions: [
            'Display word families on board (play, playing, played, player)',
            'Students identify the base word',
            'Circle or highlight the base in each word',
            'Try with multiple word families'
          ],
          materials: ['Word cards', 'Markers', 'Whiteboard']
        },
        {
          title: 'Word Building Station',
          icon: '🏗️',
          duration: '15 mins',
          description: 'Build words by adding affixes to bases',
          instructions: [
            'Provide base word cards (jump, walk, help, play)',
            'Provide affix cards (ing, ed, er, s)',
            'Students combine base + affix',
            'They say the new word created',
            'Draw pictures showing the different meanings'
          ],
          materials: ['Base word cards', 'Affix cards', 'Paper', 'Pencils'],
          printable: 'base-affix-cards'
        },
        {
          title: 'Acting Out Meanings',
          icon: '🎭',
          duration: '10 mins',
          description: 'Act out how affixes change meaning',
          instructions: [
            'Choose a base word (jump, walk, dance)',
            'Show the base - student acts it out',
            'Add "ing" - student acts it happening now',
            'Add "ed" - student acts like it already happened',
            'Add "er" - student becomes someone who does that action'
          ],
          materials: ['None - just bodies!']
        }
      ],

      assessment: {
        formative: [
          'Can students identify the base in a word family?',
          'Do they understand that affixes change meaning?',
          'Can they create new words by adding affixes?'
        ],
        questions: [
          'What is the base word in "jumping"?',
          'How does adding "ed" change the word "walk"?',
          'Can you make a new word from the base "help"?'
        ]
      }
    },

    {
      id: 3,
      title: 'Understanding: Base, Prefix, and Suffix',
      icon: '📖',
      duration: '20-25 minutes',
      objectives: [
        'Learn the terms "base," "prefix," and "suffix"',
        'Understand that prefixes come BEFORE the base',
        'Understand that suffixes come AFTER the base',
        'Identify these parts in simple words'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Word building blocks or cards',
        'Colored markers (3 colors)',
        'Prefix and suffix cards'
      ],
      
      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Welcome back, word experts! 👋

We've learned that words have a BASE (the heart) and we can add AFFIXES (extra parts) to change the meaning.

Today we're going to learn the OFFICIAL NAMES for these word parts! You're going to sound super smart! 🧠

These names are:
• BASE (we know this one!)
• PREFIX (a new word!)
• SUFFIX (another new word!)

Don't worry - they're easy to remember because they tell us WHERE they go! Let me show you...`,
          animation: 'sparkle'
        },
        {
          section: 'Teaching PREFIX (8 mins)',
          content: `First, let's learn about PREFIX!

A PREFIX is a part we add to the BEGINNING (the front) of a base word.

PRE means BEFORE
FIX means ATTACH

So PREFIX = attach BEFORE the base!

[Draw a train with three cars: PREFIX car, BASE car (engine), SUFFIX car]

See? The PREFIX car goes at the FRONT of the train!

Let's look at some prefixes:

UN- is a prefix that means NOT

[Write examples with the prefix in one color, base in another]

UN + HAPPY = UNHAPPY 😢
(not happy)

UN + LOCK = UNLOCK 🔓
(not locked/open the lock)

UN + TIE = UNTIE 🎀
(not tied/undo the tie)

See? UN- goes BEFORE the base and changes the meaning to mean NOT or OPPOSITE!

Let's try another prefix:

RE- means AGAIN

RE + PLAY = REPLAY 🔄
(play again)

RE + DO = REDO ✏️
(do again)

RE + READ = REREAD 📖
(read again)

Wow! You're learning prefixes! Let's practice:

If HEAT means to make hot 🔥, what does REHEAT mean?
[Wait for response: heat again!]

If TIE means to tie something 🎀, what does UNTIE mean?
[Wait for response: to undo/not tied!]

Perfect! Prefixes go at the BEGINNING! 🎯`,
          animation: 'slideRight'
        },
        {
          section: 'Teaching SUFFIX (8 mins)',
          content: `Now let's learn about SUFFIX!

A SUFFIX is a part we add to the END of a base word.

[Point to the train diagram]

See? The SUFFIX car goes at the BACK of the train!

We actually already know some suffixes! Remember -ing, -ed, and -er?

Those are SUFFIXES! They go AFTER the base!

[Write examples with base in one color, suffix in another]

PLAY + ING = PLAYING ▶️
(suffix -ing shows it's happening now)

PLAY + ED = PLAYED ⏸️
(suffix -ed shows it already happened)

PLAY + ER = PLAYER 👤
(suffix -er shows a person who does it)

Let's try more suffixes:

-FUL means FULL OF

CARE + FUL = CAREFUL 🚸
(full of care)

COLOR + FUL = COLORFUL 🌈
(full of color)

HELP + FUL = HELPFUL 🤝
(full of help)

-LESS means WITHOUT

CARE + LESS = CARELESS 🙈
(without care)

HELP + LESS = HELPLESS 😢
(without help)

See how suffixes change the meaning? They go at the END! 🎯`,
          animation: 'slideLeft'
        },
        {
          section: 'Putting It All Together (4 mins)',
          content: `Now here's where it gets REALLY cool! We can use BOTH a prefix AND a suffix!

[Draw the train with all three parts highlighted]

PREFIX + BASE + SUFFIX

Let's build a word together:

UN + HELP + FUL = UNHELPFUL
(not helpful)

RE + PLAY + ING = REPLAYING  
(playing again, right now)

Can you see all three parts?

• PREFIX (at the front) - UN, RE
• BASE (in the middle) - HELP, PLAY
• SUFFIX (at the back) - FUL, ING

Let's try to spot the parts in these words:

UNKIND
• PREFIX: UN-
• BASE: KIND
• SUFFIX: (none - just prefix!)

TEACHING
• PREFIX: (none!)
• BASE: TEACH
• SUFFIX: -ING

REPLAY
• PREFIX: RE-
• BASE: PLAY
• SUFFIX: (none - just prefix!)

UNHAPPY
• PREFIX: UN-
• BASE: HAPPY
• SUFFIX: (none - just prefix!)

You're all word part detectives now! 🔍`,
          animation: 'build'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `Let's review what we learned today! Can everyone show me...

👉 Point to the FRONT of your desk - that's where PREFIX goes!
👉 Point to the MIDDLE of your desk - that's where BASE goes!
👉 Point to the END of your desk - that's where SUFFIX goes!

Remember:
✅ PREFIX = before the base (front of the train)
✅ BASE = the main part (middle - the engine!)
✅ SUFFIX = after the base (back of the train)

You now know the SECRET CODE of words! Next time we'll use these word parts to make even MORE words! 

Give yourself a pat on the back - you learned three big vocabulary words today! 🌟`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Ride the Word Train',
          subtitle: 'Every part has its own carriage',
          icon: '🚂',
          prompt: 'Prefix first, base in the middle, suffix at the end.',
          focusWords: ['prefix + base + suffix', 'pre + view + er', 're + play + er'],
          actions: ['Use your arms to show the three parts in order.', 'Chant "prefix, base, suffix" together.'],
          background: 'from-blue-500 via-indigo-500 to-purple-500'
        },
        {
          title: 'Prefixes Go First',
          subtitle: 'Prefixes give starting clues',
          icon: '⬅️',
          prompt: 'Say the prefix, then say the new meaning.',
          focusWords: ['un + happy = UNHAPPY', 're + do = REDO', 'pre + view = PREVIEW'],
          actions: ['Step forward when you hear the prefix.', 'Make a rewind motion for prefixes like re-.'],
          background: 'from-green-400 via-teal-400 to-blue-500'
        },
        {
          title: 'Suffixes Go Last',
          subtitle: 'Suffixes change how or who',
          icon: '➡️',
          prompt: 'Read the base, then add the ending at the end.',
          focusWords: ['jump + ing = JUMPING', 'help + er = HELPER', 'play + ful = PLAYFUL'],
          actions: ['Give yourself a hug when the word tells WHO (helper).', 'Wave your hands like it is happening now for -ing.'],
          background: 'from-pink-500 via-orange-400 to-yellow-300'
        },
        {
          title: 'Build a Word Together',
          subtitle: 'Choose the parts you need',
          icon: '🧩',
          prompt: 'Pick a prefix, base, or suffix to create a new word.',
          focusWords: ['un + pack', 're + tell', 'help + ful'],
          actions: ['Hold the cards up high as you read the word.', 'Explain what the word now means in one short sentence.'],
          background: 'from-purple-500 via-pink-500 to-red-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🚂',
          title: 'Prefix-Base-Suffix Express',
          subtitle: 'Hop on the train where every word part has a job!',
          gradient: 'from-sky-400 via-indigo-400 to-purple-500'
        },
        ruleFocus: {
          title: 'Where Do the Parts Go?',
          description: 'Prefixes stand at the front, bases ride in the middle, and suffixes bring meaning to the end.',
          keyPoints: [
            'Prefixes attach to the front of a base word.',
            'Bases carry the main meaning of the word.',
            'Suffixes hook onto the end to add extra information.'
          ],
          examples: [
            { word: 'UNPACK', breakdown: 'UN + PACK', meaning: 'not packed anymore' },
            { word: 'PLAYER', breakdown: 'PLAY + ER', meaning: 'a person who plays' },
            { word: 'REPLAY', breakdown: 'RE + PLAY', meaning: 'play again' }
          ]
        },
        quickCheck: {
          question: 'Where does the suffix go in HELPER?',
          answers: ['At the front', 'In the middle', 'At the end'],
          correctAnswer: 'At the end',
          celebration: '🎉 Nailed it! Suffixes always finish the word.'
        },
        practice: [
          {
            title: 'Word Train Builder',
            icon: '🚆',
            background: 'from-blue-500 via-purple-500 to-pink-500',
            description: 'Slide prefix, base, and suffix cards into the right order.',
            steps: [
              'Pick a base card (PLAY, HELP, PACK).',
              'Choose a prefix or suffix that makes sense.',
              'Read the new word and tell what changed.'
            ]
          },
          {
            title: 'Prefix or Suffix?',
            icon: '❓',
            background: 'from-emerald-400 via-teal-400 to-cyan-400',
            description: 'Sort word parts into “front” or “end” buckets.',
            steps: [
              'Hold up a card like UN-, -ER, or RE-.',
              'Decide if it goes before or after the base.',
              'Say a word that uses it in the right spot.'
            ]
          }
        ],
        exitTicket: 'Circle the base word in REPLAYING and underline the prefix and suffix.'
      },

      practiceWordLists: [
        {
          icon: '🚀',
          title: 'Prefix Practice',
          description: 'Remember: prefixes sit at the front.',
          words: ['un + happy → unhappy', 're + do → redo', 'pre + heat → preheat', 'un + pack → unpack', 're + tell → retell']
        },
        {
          icon: '🎯',
          title: 'Suffix Practice',
          description: 'Add the ending to show how or who.',
          words: ['jump + ing → jumping', 'help + er → helper', 'play + ed → played', 'sing + er → singer', 'smile + ing → smiling']
        },
        {
          icon: '🚂',
          title: 'Full Word Trains',
          description: 'Build a three-part word train together.',
          words: ['pre + view + er → previewer', 're + play + ing → replaying', 'un + help + ful → unhelpful', 're + tell + ing → retelling', 'un + pack + ed → unpacked']
        }
      ],

      activities: [
        {
          title: 'Word Part Train',
          icon: '🚂',
          duration: '15 mins',
          description: 'Build word trains with prefix, base, and suffix cards',
          instructions: [
            'Provide three colors of cards (prefix=red, base=blue, suffix=yellow)',
            'Students build "trains" by putting cards in order',
            'Check: Does prefix come first? Base in middle? Suffix at end?',
            'Students read their complete word',
            'Example: UN- + HELP + -FUL = UNHELPFUL'
          ],
          materials: ['Colored word part cards', 'Train template (optional)'],
          printable: 'word-train-cards'
        },
        {
          title: 'Prefix & Suffix Sort',
          icon: '📦',
          duration: '10 mins',
          description: 'Sort word parts into three categories',
          instructions: [
            'Create three sorting areas: PREFIX, BASE, SUFFIX',
            'Provide mixed word part cards (un-, -ing, jump, re-, play, -ed, -ful)',
            'Students sort cards into correct categories',
            'Discuss: How do you know where each part goes?'
          ],
          materials: ['Word part cards', 'Three sorting mats or boxes'],
          printable: 'word-train-cards'
        },
        {
          title: 'Human Word Building',
          icon: '🧑‍🤝‍🧑',
          duration: '10 mins',
          description: 'Students become word parts and stand in order',
          instructions: [
            'Give students cards to hold (un-, happy, re-, play, -ing)',
            'Call out a word: "UNHAPPY"',
            'Students holding UN- and HAPPY stand in order at front',
            'Class checks: Is prefix first? Base after?',
            'Try with different words'
          ],
          materials: ['Large word part cards students can hold'],
          printable: 'word-train-cards'
        },
        {
          title: 'Color the Parts',
          icon: '🎨',
          duration: '10 mins',
          description: 'Identify and color different word parts',
          instructions: [
            'Provide worksheet with words: unhappy, replaying, careful, jumping',
            'Students use three colors:',
            '  - Red for PREFIX',
            '  - Blue for BASE',
            '  - Yellow for SUFFIX',
            'They color each part of the word the correct color'
          ],
          materials: ['Worksheet', 'Colored pencils or crayons (red, blue, yellow)'],
          printable: 'color-the-parts'
        }
      ],

      assessment: {
        formative: [
          'Can students identify which part is the prefix?',
          'Can students identify which part is the suffix?',
          'Can students identify the base word?',
          'Do they understand the position of each part?'
        ],
        questions: [
          'Show me where a prefix goes in a word',
          'What\'s the base word in "unhappy"?',
          'Where does a suffix go - beginning or end?',
          'Can you find the prefix in "replay"?'
        ],
        exitTicket: 'Draw a simple train with three cars. Label them PREFIX, BASE, and SUFFIX. Write one example word with all three parts.'
      }
    },

    {
      id: 4,
      title: 'Words Have Meaningful Parts',
      icon: '🧩',
      duration: '20-25 minutes',
      objectives: [
        'Understand that words can have more than one meaningful part',
        'Recognize that each part adds meaning to the word',
        'Identify meaningful parts in simple words'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Picture cards with plural items',
        'Word building cards'
      ],
      
      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Hello word detectives! 👋 We've been learning about word parts - remember prefixes, bases, and suffixes?

Today we're going to discover something REALLY important: every part of a word means something! Each part is like a puzzle piece that adds meaning!

[Draw a simple puzzle with 2-3 pieces on the board]

Let me show you what I mean...`,
          animation: 'fadeIn'
        },
        {
          section: 'Teaching Meaningful Parts (8 mins)',
          content: `Let's look at this word: DOGS 🐕🐕

[Write "DOGS" on the board]

How many parts does this word have? Let's find out!

First part: DOG 🐕
- This is our BASE word
- It means ONE animal - a dog!

Second part: -S
- This is our SUFFIX
- It means MORE THAN ONE!

So DOGS = DOG + S = MORE THAN ONE DOG! 🐕🐕🐕

Both parts are MEANINGFUL! They both tell us something!
- DOG tells us WHAT animal
- S tells us HOW MANY (more than one!)

Let's try another one:

CATS 🐱
[Write on board, separating parts]

Part 1: CAT 🐱 (one cat)
Part 2: -S (more than one!)

CATS = CAT + S = MORE THAN ONE CAT! 🐱🐱🐱

Each part means something important!

Here are more examples:

BEDS 🛏️
- BED = one bed (the thing we sleep on)
- -S = more than one
- BEDS = more than one bed!

HATS 🎩
- HAT = one hat (thing we wear)
- -S = more than one
- HATS = more than one hat!

PIGS 🐷
- PIG = one pig (the animal)
- -S = more than one
- PIGS = more than one pig!

See the pattern? The BASE tells us WHAT, and the -S tells us there's MORE THAN ONE! 

Every part is meaningful - it tells us something! 🌟`,
          animation: 'buildUp'
        },
        {
          section: 'Interactive Practice (7 mins)',
          content: `Now YOU help me break apart words into meaningful parts!

I'll say a word, you help me find the parts!

[Write on board as students help]

BUGS 🐛
- What's the base? (BUG)
- What's the suffix? (-S)
- What does BUG mean? (the insect)
- What does -S mean? (more than one!)

CUPS ☕
- What's the base? (CUP)
- What's the suffix? (-S)
- What does CUP mean? (thing we drink from)
- What does -S mean? (more than one!)

TOYS 🎮
- What's the base? (TOY)
- What's the suffix? (-S)
- What does each part mean?

PENS ✏️
- Let's break this one apart together!
- PEN = the writing tool
- -S = more than one
- PENS = more than one pen!

Great job! You're finding the meaningful parts! 🎯

Remember: Every part of a word tells us something! No part is just there for fun - they all have a JOB!`,
          animation: 'bounce'
        },
        {
          section: 'Meaning Changes (5 mins)',
          content: `Let's see how adding that -S changes the meaning!

[Show pictures or draw on board]

ONE DOG 🐕 → DOGS 🐕🐕
The word changed! Now it means MORE THAN ONE!

ONE BOOK 📕 → BOOKS 📕📚
Look! The -S made it mean MANY books!

ONE STAR ⭐ → STARS ⭐✨🌟
The -S is so powerful! It changed the meaning from ONE to MANY!

Let's try a game! I'll say a word with ONE thing. You add -S to make it MANY things!

• CAR → (CARS!) 🚗🚗
• BALL → (BALLS!) ⚽⚽
• TREE → (TREES!) 🌳🌲
• DUCK → (DUCKS!) 🦆🦆

Amazing! You understand that -S is meaningful - it changes the word from one to many! 🎉`,
          animation: 'transform'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `What did we learn today, word experts?

✅ Words can have MORE THAN ONE meaningful part!
✅ Each part adds meaning to the word
✅ The suffix -S means "more than one"!
✅ Every part has a JOB to do!

Tomorrow we'll practice adding -S to words ourselves! You're all becoming morphology masters! 🏆`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Every Part Has a Job',
          subtitle: 'Listen for what each part tells us',
          icon: '🧩',
          prompt: 'Say the base first, then add the ending and explain what changed.',
          focusWords: ['dog + s = DOGS (more than one)', 'cat + s = CATS (more than one)', 'hat + s = HATS (more than one)'],
          actions: ['Hold up one finger for the base, then show many fingers for -s.', 'Say “one” and “many” with big voices.'],
          background: 'from-orange-400 via-pink-400 to-purple-500'
        },
        {
          title: 'Find the Base Word',
          subtitle: 'The base tells WHAT the word is about',
          icon: '🔍',
          prompt: 'Spot the base word hiding at the front.',
          focusWords: ['bed + s = BEDS', 'pig + s = PIGS', 'cup + s = CUPS'],
          actions: ['Touch your nose when you hear the base word.', 'Draw the base in the air using finger writing.'],
          background: 'from-yellow-300 via-orange-300 to-pink-400'
        },
        {
          title: 'What Does -S Tell Us?',
          subtitle: 'The ending changes how many',
          icon: '➕',
          prompt: 'Show with your hands if the word means one or many.',
          focusWords: ['dog vs. dogs', 'book vs. books', 'star vs. stars'],
          actions: ['Hold one fist for one item, spread fingers for many items.', 'Say “That means more than one!” together.'],
          background: 'from-blue-400 via-teal-400 to-green-400'
        },
        {
          title: 'Singular or Plural?',
          subtitle: 'Listen and respond',
          icon: '🎲',
          prompt: 'If you hear ONE, show one finger. If you hear MANY, hold up jazz hands!',
          focusWords: ['cat', 'cats', 'tree', 'trees'],
          actions: ['Call out your own plural word to challenge the class.', 'Make a joyful cheer when you hear a plural.'],
          background: 'from-purple-500 via-blue-500 to-cyan-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🧩',
          title: 'Meaningful Word Pieces',
          subtitle: 'See how every piece of a word shares the story!',
          gradient: 'from-orange-400 via-pink-400 to-purple-500'
        },
        ruleFocus: {
          title: 'Two Parts, Two Clues',
          description: 'The base tells what the word is about. The suffix -s tells us there is more than one.',
          keyPoints: [
            'Read the base first to know the thing.',
            '-S at the end means more than one.',
            'Both parts work together to make meaning.'
          ],
          examples: [
            { word: 'DOGS', breakdown: 'DOG + S', meaning: 'more than one dog' },
            { word: 'PIGS', breakdown: 'PIG + S', meaning: 'more than one pig' },
            { word: 'BEDS', breakdown: 'BED + S', meaning: 'more than one bed' }
          ]
        },
        quickCheck: {
          question: 'What does the -S in CATS tell you?',
          answers: ['One cat', 'More than one cat', 'Nothing at all'],
          correctAnswer: 'More than one cat',
          celebration: '🎉 Yes! That little -S makes the group grow.'
        },
        practice: [
          {
            title: 'Plural Picture Sort',
            icon: '🖼️',
            background: 'from-yellow-400 via-amber-400 to-red-400',
            description: 'Match singular and plural pictures to the right words.',
            steps: [
              'Flip a base word like CAT or DOG.',
              'Add the -S card if the picture shows many.',
              'Explain what each part means.'
            ]
          },
          {
            title: 'Meaning Match Cards',
            icon: '🎯',
            background: 'from-teal-400 via-sky-400 to-blue-500',
            description: 'Pair the base card with the suffix card that completes the meaning.',
            steps: [
              'Lay out base cards in one row.',
              'Lay out suffix cards like -S or -ES in another.',
              'Connect the cards and act out “one” vs “many.”'
            ]
          }
        ],
        exitTicket: 'Draw a base word and add -S. Label what each part means.'
      },

      practiceWordLists: [
        {
          icon: '🐾',
          title: 'Plural Power',
          description: 'Read each base word and add -s to show many.',
          words: ['dog + s → dogs', 'cat + s → cats', 'pig + s → pigs', 'cup + s → cups', 'hat + s → hats']
        },
        {
          icon: '🧃',
          title: 'Base Word Check',
          description: 'Circle the base word first, then say the whole word.',
          words: ['bug + s → bugs', 'pen + s → pens', 'toy + s → toys', 'bag + s → bags', 'bell + s → bells']
        },
        {
          icon: '🎯',
          title: 'One or Many?',
          description: 'Point to the correct picture or use mini objects.',
          words: ['book ↔ books', 'star ↔ stars', 'duck ↔ ducks', 'car ↔ cars', 'tree ↔ trees']
        }
      ],

      activities: [
        {
          title: 'Meaningful Parts Sorting',
          icon: '🧩',
          duration: '10 mins',
          description: 'Sort words and identify which parts are meaningful',
          instructions: [
            'Provide word cards with simple plurals (cats, dogs, hats, cups)',
            'Students identify the base and suffix in each word',
            'They explain what each part means',
            'Sort into two piles: base parts and suffix parts'
          ],
          materials: ['Word cards', 'Sorting mats'],
          printable: 'meaningful-parts-cards'
        },
        {
          title: 'Picture Match Game',
          icon: '🎴',
          duration: '15 mins',
          description: 'Match singular and plural pictures',
          instructions: [
            'Create pairs: one dog/two dogs, one cat/three cats',
            'Students match the plural picture to the plural word',
            'They identify the -S suffix that makes it plural',
            'Discuss how the -S changes the meaning'
          ],
          materials: ['Picture cards', 'Word cards'],
          printable: 'singular-plural-match'
        },
        {
          title: 'Build the Meaning',
          icon: '🏗️',
          duration: '10 mins',
          description: 'Build words and explain what each part means',
          instructions: [
            'Provide base word cards (cat, dog, hat, cup)',
            'Provide -S suffix cards',
            'Students build plural words',
            'They must explain: "CAT means one cat, -S means more than one, so CATS means more than one cat!"',
            'Practice with multiple words'
          ],
          materials: ['Base word cards', '-S cards', 'Paper for recording'],
          printable: 'meaningful-parts-cards'
        }
      ],

      assessment: {
        formative: [
          'Can students identify that words have multiple parts?',
          'Do they understand each part has meaning?',
          'Can they explain what -S means?',
          'Can they break simple plurals into base + suffix?'
        ],
        questions: [
          'How many meaningful parts does "dogs" have?',
          'What does the -S in "cats" mean?',
          'Why do we say every part is meaningful?',
          'Can you tell me what each part of "hats" means?'
        ]
      }
    },

    {
      id: 5,
      title: 'Adding Plural -S to Base Nouns',
      icon: '➕',
      duration: '20-25 minutes',
      objectives: [
        'Add the plural suffix -S to simple base nouns',
        'Understand that the base word doesn\'t change',
        'Practice reading and writing simple plurals'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Magnetic letters or letter cards',
        'Picture cards',
        'Student whiteboards'
      ],
      
      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Welcome back, word builders! 👷

Last time we learned that words have meaningful parts, and the suffix -S means "more than one"!

Today we're going to practice ADDING the -S ourselves! We're going to turn words that mean ONE thing into words that mean MANY things!

[Write on board: "ONE → MANY"]

Are you ready to become plural experts? Let's go! 🚀`,
          animation: 'fadeIn'
        },
        {
          section: 'Teaching How to Add -S (8 mins)',
          content: `Here's the super easy rule for adding -S:

[Write on board with big arrows]

CAT → CAT + S → CATS

Look what happened! We:
1. Started with CAT
2. Added -S to the end
3. The CAT part stayed THE SAME!

That's the important part: THE BASE WORD DOESN'T CHANGE! We just add -S to the end!

Let's try more together:

DOG → DOG + S → DOGS
[Point to DOG] See? DOG stayed the same!
[Point to -S] We just added -S!

HAT → HAT + S → HATS
[Point to HAT] HAT stayed the same!
[Point to -S] We just added -S!

PIG → PIG + S → PIGS
BUG → BUG + S → BUGS
CUP → CUP + S → CUPS

Notice: The base word NEVER changes! We just add -S!

[Draw a visual: CAT (in a box) + S (in a circle) = CATS]

Think of it like this:
- The base word is safe in a box - it doesn't change!
- We just glue the -S on the end!
- Easy! 🎯

Let me show you with letters:

[Use magnetic letters or write clearly]

C-A-T
Now watch... I add -S
C-A-T-S

Did CAT change? NO! We just added -S! 

Your turn to help! I'll write the base word, you tell me how to spell the plural!

BED → BED + S = ? (BEDS!)
PEN → PEN + S = ? (PENS!)
TOP → TOP + S = ? (TOPS!)

You're naturals at this! 🌟`,
          animation: 'slideUp'
        },
        {
          section: 'Guided Practice (7 mins)',
          content: `Now let's practice adding -S to different words!

[Write base words on the board, students help add -S]

Here's our base: BAT 🦇
Let's add -S... BATS!
[Write it out: B-A-T-S]

Base: RAT 🐀
Add -S... RATS!
[Write it out: R-A-T-S]

Base: NET 🥅
Add -S... NETS!
[Write it out: N-E-T-S]

Base: BIN 🗑️
Add -S... BINS!
[Write it out: B-I-N-S]

Let me test you! What base word do you see in these plurals?

CATS → What's the base? (CAT!)
DOGS → What's the base? (DOG!)
BEDS → What's the base? (BED!)

Perfect! You can see that the base stays the same!

Now I'm going to give you some base words, and YOU add the -S!

[Have students use whiteboards or call out answers]

• FOX → (FOXES - ooh, we'll learn about this one later!)
• Actually, let's stick to simple ones today:

• SUN ☀️ → (SUNS!)
• BUS 🚌 → (BUSES - save for later!)
• Let's do: BEE 🐝 → (BEES!)
• COW 🐄 → (COWS!)

Great work! 🎉`,
          animation: 'construct'
        },
        {
          section: 'Reading Practice (5 mins)',
          content: `Now let's practice READING words with -S!

I'll show you a word, you read it out loud!

[Show cards or write words]

CATS → Read it! 🐱🐱
HATS → Read it! 🎩🎩
DOGS → Read it! 🐕🐕
PIGS → Read it! 🐷🐷
BUGS → Read it! 🐛🐛
CUPS → Read it! ☕☕

Excellent reading! 

Now let's read them in sentences!

"I see two CATS."
"She has three HATS."
"The DOGS are playing."
"Five PIGS are in the mud."

You're all reading plurals like experts! 📖`,
          animation: 'pulse'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `What did we learn today, plural experts?

✅ We can ADD -S to base words to make plurals!
✅ The base word STAYS THE SAME - it doesn't change!
✅ Just add -S to the end!
✅ CAT + S = CATS (one cat → many cats!)

Keep practicing! Next time we'll learn about some special words that are a bit trickier! 

But for now, you're AMAZING at adding -S! Give yourselves a round of applause! 👏`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Base Word + -S = Many',
          subtitle: 'Add -S to show more than one',
          icon: '➕',
          prompt: 'Say the base word, slide on -S, then shout the new plural word!',
          focusWords: ['cat + s = cats', 'dog + s = dogs', 'hat + s = hats', 'cup + s = cups'],
          actions: [
            'Hold your hands around the base word to show it stays the same.',
            'Give a sparkle clap when you add -S to make many!'
          ],
          background: 'from-blue-500 via-purple-500 to-pink-500'
        },
        {
          title: 'Spot the Base Word',
          subtitle: 'The base stays safe',
          icon: '🧱',
          prompt: 'Read the plural. Point to the base word hiding inside.',
          focusWords: ['cats → base word: cat', 'pigs → base word: pig', 'beds → base word: bed', 'bugs → base word: bug'],
          actions: [
            'Trace the base word in the air, then circle the -S ending.',
            'Whisper the base word, then say the plural with a cheer.'
          ],
          background: 'from-yellow-400 via-orange-400 to-pink-500'
        },
        {
          title: 'Plural Parade',
          subtitle: 'One marches into many',
          icon: '🎈',
          prompt: 'Show one item, then add -S and show many with your hands.',
          focusWords: ['one cat → many cats', 'one pig → many pigs', 'one cup → many cups', 'one bug → many bugs'],
          actions: [
            'Hold up one finger for the base, then wiggle all fingers for the plural.',
            'March in place while you chant the plural words together.'
          ],
          background: 'from-teal-400 via-blue-500 to-indigo-500'
        },
        {
          title: 'Sentence Shout-Out',
          subtitle: 'Use your plural power',
          icon: '📣',
          prompt: 'Read the sentence. Emphasise the plural word with a big voice.',
          focusWords: [
            'I see three cats.',
            'Two dogs are running.',
            'The hats are on the rack.',
            'Five pigs are in the mud.'
          ],
          actions: [
            'Tap the plural word on the screen when you read it.',
            'Add a quick action to match the sentence meaning.'
          ],
          background: 'from-pink-500 via-red-400 to-orange-400'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🎈',
          title: 'Plural Builders',
          subtitle: 'Add -S to grow a word from one to many!',
          gradient: 'from-teal-400 via-blue-500 to-indigo-500'
        },
        ruleFocus: {
          title: 'Keep the Base, Add the Ending',
          description: 'To make a simple plural, keep the base word the same and slide -s onto the end.',
          keyPoints: [
            'Say the base word first to lock it in.',
            'Add -S to show more than one.',
            'Read the new word smoothly without changing the base.'
          ],
          examples: [
            { word: 'CATS', breakdown: 'CAT + S', meaning: 'more than one cat' },
            { word: 'PANS', breakdown: 'PAN + S', meaning: 'more than one pan' },
            { word: 'BUGS', breakdown: 'BUG + S', meaning: 'more than one bug' }
          ]
        },
        quickCheck: {
          question: 'What stays the same when you change DOG to DOGS?',
          answers: ['The base word DOG', 'Only the ending', 'Everything changes'],
          correctAnswer: 'The base word DOG',
          celebration: '🎉 Exactly! The base stays safe while -S joins the party.'
        },
        practice: [
          {
            title: 'Base Saver Challenge',
            icon: '🛡️',
            background: 'from-purple-500 via-pink-500 to-red-400',
            description: 'Protect the base word as you build plurals.',
            steps: [
              'Cover the base word with your hand.',
              'Slide an -S card to the end.',
              'Reveal the whole word and read it aloud.'
            ]
          },
          {
            title: 'Plural Parade Cards',
            icon: '🥁',
            background: 'from-amber-400 via-orange-400 to-pink-500',
            description: 'March your cards from one to many.',
            steps: [
              'Hold a base picture like one hat.',
              'Add the matching -S picture showing many hats.',
              'Chant the plural word as you march in place.'
            ]
          }
        ],
        exitTicket: 'Write one base word and its plural. Highlight the part that stayed the same.'
      },

      practiceWordLists: [
        {
          icon: '🐾',
          title: 'Add -S Word Builders',
          description: 'Start with the base word, add -S, then read the plural aloud.',
          words: ['cat → cats', 'dog → dogs', 'hat → hats', 'pig → pigs', 'cup → cups']
        },
        {
          icon: '🔍',
          title: 'Find the Base',
          description: 'Underline the base word hiding inside each plural.',
          words: ['beds (base: bed)', 'bugs (base: bug)', 'pans (base: pan)', 'tubs (base: tub)', 'mats (base: mat)']
        },
        {
          icon: '🗣️',
          title: 'Plural Sentence Starters',
          description: 'Use the sentence starter to share about many items.',
          words: ['I see many cats.', 'We have two dogs.', 'The cups are full.', 'Three pigs are playing.', 'Four hats are on the hook.']
        }
      ],

      activities: [
        {
          title: 'Magnetic Letter Building',
          icon: '🧲',
          duration: '15 mins',
          description: 'Use magnetic letters to build plurals',
          instructions: [
            'Provide magnetic letters spelling simple words (cat, dog, hat)',
            'Students add -S magnetic letter to make plural',
            'They read both versions aloud',
            'Practice with multiple words',
            'Emphasize that base word doesn\'t change'
          ],
          materials: ['Magnetic letters', 'Magnetic boards', 'Word list'],
          printable: 'add-s-practice'
        },
        {
          title: 'Write the Plural',
          icon: '✏️',
          duration: '10 mins',
          description: 'Practice writing plurals',
          instructions: [
            'Show picture of ONE item (cat, dog, hat)',
            'Students write the base word',
            'Show picture of MULTIPLE items',
            'Students add -S and write the plural',
            'They can draw their own plural pictures'
          ],
          materials: ['Worksheets', 'Pencils', 'Picture cards'],
          printable: 'write-plurals-worksheet'
        },
        {
          title: 'Plural Builders Game',
          icon: '🎮',
          duration: '15 mins',
          description: 'Build plurals and act them out',
          instructions: [
            'Teacher calls out a base word (cat, jump, hat)',
            'Students hold up cards: base word + S card',
            'They read the plural aloud',
            'Optional: act out the word (one cat vs. many cats)',
            'Keep score for correct plurals'
          ],
          materials: ['Base word cards', '-S cards', 'Score board'],
          printable: 'add-s-practice'
        },
        {
          title: 'One or Many?',
          icon: '🔢',
          duration: '10 mins',
          description: 'Identify if words are singular or plural',
          instructions: [
            'Show mixed word cards (cat, dogs, hat, beds, cup, pigs)',
            'Students sort into "ONE" pile and "MANY" pile',
            'They identify which words have -S',
            'Discuss: How do you know it means more than one?'
          ],
          materials: ['Mixed word cards', 'Sorting mats labeled "ONE" and "MANY"'],
          printable: 'singular-plural-match'
        }
      ],

      assessment: {
        formative: [
          'Can students add -S to simple CVC words?',
          'Do they understand the base doesn\'t change?',
          'Can they read simple plurals?',
          'Can they write plurals independently?'
        ],
        questions: [
          'How do we make "cat" mean more than one cat?',
          'What happens to the base word when we add -S?',
          'Can you write "dogs" for me?',
          'What does -S tell us about the word?'
        ],
        exitTicket: 'Write 3 words with -S added. Circle the base in each word.'
      }
    },

    {
      id: 6,
      title: 'Adding -ING for Happening Now',
      icon: '🏃‍♂️',
      duration: '20-25 minutes',
      objectives: [
        'Add the suffix -ING to show an action is happening now',
        'Keep the base word the same while adding -ING',
        'Act out and read -ING words with confidence'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Action picture cards',
        'Magnetic letters or letter cards',
        'Student whiteboards or clipboards'
      ],

      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Hello, action heroes! 🦸‍♀️ Today we are learning a super fun suffix: -ING! When we add -ING to a base word, it tells us the action is happening RIGHT NOW.`,
          animation: 'fadeIn'
        },
        {
          section: 'Model the -ING Magic (7 mins)',
          content: `Watch this! I write the base word JUMP. When I add -ING, it becomes JUMPING. That means someone is jumping right now! Notice how JUMP stayed the same - we just glued -ING to the end.\n\nLet's try more together:\n• SING → SINGING 🎤\n• HELP → HELPING 🤝\n• FISH → FISHING 🎣\n• ACT → ACTING 🎭\nThe base word stays the same. -ING tells us the action is happening now!`,
          animation: 'spotlight'
        },
        {
          section: 'Action Practice (7 mins)',
          content: `Time to move! I will show an action picture. First say the base word, then add -ING and do the action.\n\nPicture of a runner → RUN → RUNNING (jog in place)\nPicture of a singer → SING → SINGING (hold a pretend microphone)\nPicture of a helper → HELP → HELPING (pretend to help a friend)\nPicture of kids playing → PLAY → PLAYING (shake and cheer)\n\nKeep saying the base word and then the -ING word. Feel the "happening now" meaning!`,
          animation: 'bounce'
        },
        {
          section: 'Build & Read (5 mins)',
          content: `Now you try on your whiteboard. Write the base word WALK. Add -ING to make WALKING. Read it with me!\n\nTry these: JUMP → JUMPING, HELP → HELPING, SING → SINGING, FISH → FISHING.\n\nRemember: the base word stays safe. We only add -ING to show it is happening now.`,
          animation: 'construct'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `What did we learn today, superheroes?\n\n✅ -ING means the action is happening now\n✅ The base word stays the same\n✅ We can say, read, and act out -ING words!\n\nTake a bow for your amazing -ING skills!`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Base + -ING = Happening Now',
          subtitle: 'Say the base, add -ING, show the action',
          icon: '✨',
          prompt: 'Chant “base… -ING!” as you slide the parts together.',
          focusWords: ['jump + ing = jumping', 'sing + ing = singing', 'help + ing = helping', 'fish + ing = fishing'],
          actions: ['Clap for the base word, wave your hands when you add -ING.', 'Act out each action as you read the -ING word.'],
          background: 'from-orange-400 via-pink-400 to-purple-500'
        },
        {
          title: 'Action Spotlight',
          subtitle: 'What is happening right now?',
          icon: '🎥',
          prompt: 'Describe the picture using an -ING word.',
          focusWords: ['A kid is jumping.', 'The girl is singing.', 'The boy is fishing.', 'The friends are helping.'],
          actions: ['Pose like the picture while you say the sentence.', 'Make a “now” gesture by pointing to the floor as you read.'],
          background: 'from-yellow-400 via-lime-400 to-green-500'
        },
        {
          title: 'Build the Word',
          subtitle: 'Keep the base safe!',
          icon: '🧱',
          prompt: 'Spot the base word. Trace it in the air, then stick on -ING.',
          focusWords: ['play + ing', 'paint + ing', 'draw + ing', 'clap + ping'],
          actions: ['Hold your hands like a brick wall around the base word.', 'Give a sparkle motion as you add -ING.'],
          background: 'from-blue-400 via-indigo-500 to-purple-500'
        },
        {
          title: 'Sentence Groove',
          subtitle: 'Read the sentence with energy',
          icon: '🎶',
          prompt: 'Tap the rhythm as you read the -ING sentence.',
          focusWords: ['We are jumping.', 'I am singing.', 'They are helping.', 'Dad is fishing.'],
          actions: ['Pat your lap with each word, snap when you say the -ING word.', 'Show the action silently after you read the sentence.'],
          background: 'from-teal-400 via-cyan-400 to-blue-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🏃‍♀️',
          title: 'Action Words in Motion',
          subtitle: 'Stick -ING onto a base word to show it is happening right now!',
          gradient: 'from-orange-400 via-pink-500 to-purple-600'
        },
        ruleFocus: {
          title: 'Add -ING for Now',
          description: '-ING tells us the action is happening at this moment while the base word keeps its shape.',
          keyPoints: [
            'Say the base word first (jump, sing, help).',
            'Glue -ING to the end without changing the base.',
            'Act out the word to feel the “right now” meaning.'
          ],
          examples: [
            { word: 'JUMPING', breakdown: 'JUMP + ING', meaning: 'jumping right now' },
            { word: 'HELPING', breakdown: 'HELP + ING', meaning: 'helping right now' },
            { word: 'SINGING', breakdown: 'SING + ING', meaning: 'singing right now' }
          ]
        },
        quickCheck: {
          question: 'What does -ING tell us in RUNNING?',
          answers: ['It already happened', 'It is happening now', 'It will happen later'],
          correctAnswer: 'It is happening now',
          celebration: '🎉 Yes! -ING shows the action is happening in the moment.'
        },
        practice: [
          {
            title: 'Act & Add',
            icon: '🎭',
            background: 'from-yellow-400 via-lime-400 to-green-500',
            description: 'Act out the -ING word as you read it.',
            steps: [
              'Read the base word card.',
              'Add an -ING card to build the new word.',
              'Perform the action together while saying the word.'
            ]
          },
          {
            title: 'ING Word Lab',
            icon: '🧪',
            background: 'from-cyan-400 via-sky-400 to-blue-500',
            description: 'Experiment with bases and -ING endings.',
            steps: [
              'Mix and match base cards like CLAP, PAINT, or SKIP.',
              'Add -ING and read the new word.',
              'Draw or mime what the action looks like right now.'
            ]
          }
        ],
        exitTicket: 'Write one -ING word and underline the base that stayed the same.'
      },

      practiceWordLists: [
        {
          icon: '🏅',
          title: '-ING Action Stars',
          description: 'Read the base word, add -ING, then act it out.',
          words: ['jump → jumping', 'sing → singing', 'fish → fishing', 'act → acting', 'help → helping']
        },
        {
          icon: '🧠',
          title: 'Keep the Base',
          description: 'Circle the base word that stayed the same.',
          words: ['play → playing', 'paint → painting', 'draw → drawing', 'kick → kicking', 'clap → clapping']
        },
        {
          icon: '🗣️',
          title: 'Happening Now Sentences',
          description: 'Read the sentence and show the action.',
          words: ['The frog is jumping.', 'Mum is singing.', 'We are helping.', 'Nan is knitting.', 'The kids are painting.']
        }
      ],

      activities: [
        {
          title: 'Action Charades',
          icon: '🎭',
          duration: '10 mins',
          description: 'Students act out -ING words for the class to guess',
          instructions: [
            'Show an action card with the base word hidden',
            'Student acts it out without speaking',
            'Class guesses the -ING word',
            'Reveal the base word and add -ING together'
          ],
          materials: ['Action picture cards'],
          printable: 'ing-action-posters'
        },
        {
          title: 'Build the -ING Word',
          icon: '🧲',
          duration: '12 mins',
          description: 'Use magnetic letters to build -ING words',
          instructions: [
            'Provide base words on cards (jump, sing, help, play)',
            'Students spell the base word with magnetic letters',
            'They add the -ING ending',
            'Read the completed word aloud'
          ],
          materials: ['Magnetic letters', 'Base word cards', '-ING letter tiles'],
          printable: 'ing-word-builders'
        },
        {
          title: '-ING Sentence Strips',
          icon: '📜',
          duration: '10 mins',
          description: 'Match pictures to -ING sentences',
          instructions: [
            'Lay out sentences with -ING words',
            'Students match to the correct picture',
            'Read the sentence together with expression',
            'Act out the action to confirm the meaning'
          ],
          materials: ['Sentence strips', 'Picture cards'],
          printable: 'ing-sentence-strips'
        }
      ],

      assessment: {
        formative: [
          'Can students explain that -ING means happening now?',
          'Do they keep the base word the same when adding -ING?',
          'Can they read and act out -ING words?'
        ],
        questions: [
          'What does -ING tell us about an action?',
          'Show me how to turn "jump" into "jumping".',
          'Can you find the base word in "singing"?'
        ],
        exitTicket: 'Write or build two -ING words. Circle the base word in each.'
      }
    },

    {
      id: 7,
      title: 'Adding the Prefix UN- (Meaning Not or Opposite)',
      icon: '🔓',
      duration: '20-25 minutes',
      objectives: [
        'Understand that UN- means not or opposite of the base word',
        'Attach UN- to simple base words to change meaning',
        'Explain how the meaning changes with UN-'
      ],
      materials: [
        'Whiteboard/chart paper',
        'Prefix and base word cards',
        'Velcro or magnet board',
        'Picture cards showing opposites'
      ],

      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Welcome, meaning makers! Today we have a prefix superhero: UN-! When we put UN- in front of a base word, it means NOT or the OPPOSITE.`,
          animation: 'fadeIn'
        },
        {
          section: 'Meet Prefix UN- (7 mins)',
          content: `Watch this! I write the base word LOCK. That means the door is closed tight. Now I slide UN- to the front: UNLOCK. That means NOT locked!\n\nTry these with me:\n• ZIP → UNZIP (take it back apart)\n• PACK → UNPACK (take things out)\n• TIE → UNTIE (make it loose)\n• DO → UNDO (make it like before)\nDo you hear how UN- changes the meaning?`,
          animation: 'slideIn'
        },
        {
          section: 'Meaning Match (7 mins)',
          content: `Let\'s match pictures. I show a locked door → LOCK. Now I add UN- → UNLOCK. The door is open!\n\nWe\'ll do more: zipped backpack → ZIP, unzipped backpack → UNZIP; packed suitcase → PACK, empty suitcase → UNPACK.\n\nEach time, UN- makes the opposite meaning.`,
          animation: 'flip'
        },
        {
          section: 'Build & Explain (5 mins)',
          content: `On your boards, write the base word DO. Add UN- to make UNDO. Tell your partner what it means.\n\nTry LOCK → UNLOCK, TIE → UNTIE, WRAP → UNWRAP.\n\nRemember, UN- always goes at the FRONT and means NOT or OPPOSITE.`,
          animation: 'construct'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `Big brain moment!\n\n✅ UN- is a prefix that means not or opposite\n✅ We attach UN- to the front of a base word\n✅ The base word meaning changes to the opposite\n\nGive yourself a superhero pose for using prefixes!`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Prefix Power',
          subtitle: 'UN- + base word = opposite meaning',
          icon: '⚡',
          prompt: 'Say “UN- means NOT!” then read the new word.',
          focusWords: ['lock → unlock', 'zip → unzip', 'pack → unpack', 'tie → untie'],
          actions: ['Push your hands apart as you add UN-.', 'Show a thumbs down when you say the opposite meaning.'],
          background: 'from-red-400 via-orange-400 to-yellow-400'
        },
        {
          title: 'Opposite Match',
          subtitle: 'Which picture shows the UN- word?',
          icon: '🧩',
          prompt: 'Point to the picture that matches the UN- word.',
          focusWords: ['unlock', 'untie', 'unzip', 'unpack'],
          actions: ['Hold both hands together for the base meaning, spread them apart for UN-.', 'Explain the change in one short sentence.'],
          background: 'from-green-400 via-teal-400 to-blue-500'
        },
        {
          title: 'Word Detective',
          subtitle: 'Spot the prefix at the front',
          icon: '🔍',
          prompt: 'Underline UN- and tell what it does to the word.',
          focusWords: ['undo', 'unfold', 'unplug', 'unbutton'],
          actions: ['Say “UN- means not!” every time you underline it.', 'Show the base word with your fingers once the prefix is covered.'],
          background: 'from-purple-400 via-indigo-500 to-blue-500'
        },
        {
          title: 'Sentence Switch',
          subtitle: 'Change the meaning with UN-',
          icon: '🔄',
          prompt: 'Read the base sentence. Add UN- to change it.',
          focusWords: ['I zip my bag. → I unzip my bag.', 'We pack the box. → We unpack the box.', 'I tie the bow. → I untie the bow.', 'Dad locks the gate. → Dad unlocks the gate.'],
          actions: ['Use a rewind motion when you add UN-.', 'Act out the base and the UN- action.'],
          background: 'from-yellow-400 via-pink-400 to-purple-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🦸‍♂️',
          title: 'UN- Prefix Power',
          subtitle: 'Flip a word to its opposite by adding UN- at the front!',
          gradient: 'from-red-400 via-orange-400 to-yellow-400'
        },
        ruleFocus: {
          title: 'UN- Means Not',
          description: 'UN- is a prefix that stands at the front of a base word to show the opposite meaning.',
          keyPoints: [
            'Attach UN- to the beginning of the base word.',
            'UN- means not or the opposite of the base.',
            'Say both meanings to hear the change.'
          ],
          examples: [
            { word: 'UNLOCK', breakdown: 'UN + LOCK', meaning: 'not locked' },
            { word: 'UNZIP', breakdown: 'UN + ZIP', meaning: 'not zipped' },
            { word: 'UNTIE', breakdown: 'UN + TIE', meaning: 'not tied' }
          ]
        },
        quickCheck: {
          question: 'What does UN- tell us in UNZIP?',
          answers: ['Zip it tighter', 'Not zipped anymore', 'Zip it later'],
          correctAnswer: 'Not zipped anymore',
          celebration: '🎉 Super! You flipped the meaning with UN-.'
        },
        practice: [
          {
            title: 'Opposite Switch Cards',
            icon: '🔄',
            background: 'from-green-400 via-teal-400 to-blue-500',
            description: 'Turn a base word card into its UN- partner.',
            steps: [
              'Read the base word and show its meaning.',
              'Slide an UN- card to the front.',
              'Act out or explain the new opposite meaning.'
            ]
          },
          {
            title: 'Prefix Superhero Mission',
            icon: '🦸‍♀️',
            background: 'from-purple-500 via-pink-500 to-red-400',
            description: 'Save the day by finding where UN- belongs.',
            steps: [
              'Look at a scene card like a tied shoe or a locked door.',
              'Decide if the hero needs UN- to fix it.',
              'Say the new UN- word and celebrate the rescue.'
            ]
          }
        ],
        exitTicket: 'Match one base word with its UN- word and draw the opposite meanings.'
      },

      practiceWordLists: [
        {
          icon: '🛠️',
          title: 'Prefix Builders',
          description: 'Slide UN- to the front and read the new word.',
          words: ['do → undo', 'zip → unzip', 'pack → unpack', 'lock → unlock', 'tie → untie']
        },
        {
          icon: '🗣️',
          title: 'Explain the Change',
          description: 'Tell what the UN- word means.',
          words: ['unlock = not locked', 'unpack = take things out', 'untie = not tied', 'unzip = open the zip', 'undo = make it like before']
        },
        {
          icon: '🎲',
          title: 'Spin & Say',
          description: 'Roll a cube and read the UN- word you land on.',
          words: ['unplug', 'unfold', 'unroll', 'unmask', 'unmix']
        }
      ],

      activities: [
        {
          title: 'Prefix Flip Cards',
          icon: '🎴',
          duration: '12 mins',
          description: 'Flip cards to reveal base and UN- words',
          instructions: [
            'Lay out base word cards and UN- cards',
            'Students flip a base card, then find the matching UN- card',
            'Explain how the meaning changed',
            'Record the pair on a mini whiteboard'
          ],
          materials: ['Prefix cards', 'Base word cards', 'Whiteboards'],
          printable: 'un-prefix-flipcards'
        },
        {
          title: 'Opposite Sort',
          icon: '🗂️',
          duration: '10 mins',
          description: 'Sort pictures into base and UN- meanings',
          instructions: [
            'Provide picture cards showing both meanings',
            'Students sort into “base word” and “UN- word” mats',
            'Read the word that matches each picture',
            'Discuss why UN- makes it the opposite'
          ],
          materials: ['Picture cards', 'Sorting mats'],
          printable: 'un-word-sort'
        },
        {
          title: 'Meaning Match Ups',
          icon: '🤝',
          duration: '12 mins',
          description: 'Match sentences that show base vs. UN- meanings',
          instructions: [
            'Read a base sentence card aloud',
            'Students find the sentence that shows the UN- version',
            'Stick the pair together on a chart',
            'Act out each sentence pair'
          ],
          materials: ['Sentence cards', 'Chart paper', 'Stickers'],
          printable: 'un-change-mats'
        }
      ],

      assessment: {
        formative: [
          'Can students explain that UN- means not or opposite?',
          'Do they attach UN- to the front of base words correctly?',
          'Can they describe the new meaning with UN-?'
        ],
        questions: [
          'What happens to “lock” when we add UN-?',
          'Show me the base word inside “unpack”.',
          'Tell me what “untie” means.'
        ],
        exitTicket: 'Match two base words with their UN- pairs and draw the meaning.'
      }
    },

    {
      id: 8,
      title: 'Joining Free Bases to Make Compound Words',
      icon: '🌈',
      duration: '20-25 minutes',
      objectives: [
        'Recognise that two free base words can join to make a new word',
        'Blend simple base words to form compound words',
        'Explain the meaning of each part in a compound word'
      ],
      materials: [
        'Large base word cards',
        'Picture puzzles that join together',
        'Pocket chart or magnetic board',
        'Student mini cards for building words'
      ],

      teacherScript: [
        {
          section: 'Introduction (3 mins)',
          content: `Word builders, assemble! Today we are joining two free base words to make a brand-new word. When two base words join, they create a compound word with a fresh meaning.`,
          animation: 'fadeIn'
        },
        {
          section: 'Blend the Bases (7 mins)',
          content: `Watch me build GOLD + FISH. When I push them together, GOLD + FISH = GOLDFISH 🐠. It\'s a new word with a new meaning!\n\nLet\'s build more:\n• SUN + SET = SUNSET 🌅\n• RAIN + COAT = RAINCOAT ☔\n• STAR + FISH = STARFISH ⭐🐟\n• SAND + CASTLE = SANDCASTLE 🏖️\nEach part keeps its meaning, and together they make something new.`,
          animation: 'combine'
        },
        {
          section: 'Picture Puzzle Time (7 mins)',
          content: `I have picture halves. One shows GOLD, the other shows FISH. When we clip them together, we see a GOLDFISH!\n\nStudents help match SUN + FLOWER, POP + CORN, MOON + LIGHT. Say the little words, then blend them into the big word.`,
          animation: 'puzzle'
        },
        {
          section: 'Create & Share (5 mins)',
          content: `Now you try with mini cards. Choose two base words that make a real word. Place them together, read the compound word, and tell what each part brings to the meaning.\n\nExample: RAIN + BOW = RAINBOW. RAIN means water from the sky. BOW means a curved shape. Together they make the colourful arc we see after rain!`,
          animation: 'build'
        },
        {
          section: 'Wrap-Up (2 mins)',
          content: `Super compound creators!\n\n✅ Two base words can join together\n✅ Each part still has meaning\n✅ Together they make a new, bigger meaning\n\nKeep spotting compound words everywhere you read!`,
          animation: 'celebrate'
        }
      ],

      displaySections: [
        {
          title: 'Blend the Bases',
          subtitle: 'Say the little words, then the big word',
          icon: '🧩',
          prompt: 'Touch each base as you say it, then slide them together.',
          focusWords: ['gold + fish = goldfish', 'sun + set = sunset', 'rain + coat = raincoat', 'star + fish = starfish'],
          actions: ['Move your hands together as the words join.', 'Stretch out the blended word with a rainbow motion.'],
          background: 'from-pink-400 via-purple-400 to-blue-500'
        },
        {
          title: 'Picture It!',
          subtitle: 'Match the images to the compound word',
          icon: '🖼️',
          prompt: 'Say the two picture words, then name the new word.',
          focusWords: ['moon + light = moonlight', 'rain + bow = rainbow', 'cup + cake = cupcake', 'tooth + brush = toothbrush'],
          actions: ['Point to each picture part with the matching word.', 'Draw the compound word in the air after you read it.'],
          background: 'from-yellow-400 via-orange-400 to-red-400'
        },
        {
          title: 'Meaning Makers',
          subtitle: 'What does each part tell us?',
          icon: '💡',
          prompt: 'Explain what each base word means before blending.',
          focusWords: ['sunset = sun + set', 'football = foot + ball', 'playground = play + ground', 'ladybug = lady + bug'],
          actions: ['Hold up one finger for each base meaning.', 'Share a quick sentence that uses the new compound word.'],
          background: 'from-green-400 via-teal-400 to-blue-500'
        },
        {
          title: 'Create Your Own',
          subtitle: 'Try silly or real combinations',
          icon: '🎨',
          prompt: 'Choose two base words to join. Decide if it makes a real word.',
          focusWords: ['sand + box = sandbox', 'rain + drop = raindrop', 'star + dust = stardust', 'bed + time = bedtime'],
          actions: ['Thumbs up if it makes sense, thumbs sideways if it is silly.', 'Act out the new word or draw it quickly.'],
          background: 'from-indigo-400 via-purple-500 to-pink-500'
        }
      ],

      studentPortalContent: {
        hero: {
          emoji: '🌈',
          title: 'Compound Word Creators',
          subtitle: 'Blend two base words to build a brand-new idea!',
          gradient: 'from-pink-400 via-purple-500 to-blue-500'
        },
        ruleFocus: {
          title: 'Two Bases, One Word',
          description: 'A compound word is made when two base words join their meanings together.',
          keyPoints: [
            'Read each base word separately first.',
            'Slide the words together without any spaces.',
            'Explain what each part brings to the new meaning.'
          ],
          examples: [
            { word: 'SUNSET', breakdown: 'SUN + SET', meaning: 'the sun going down' },
            { word: 'RAINBOW', breakdown: 'RAIN + BOW', meaning: 'colourful bow after rain' },
            { word: 'PLAYGROUND', breakdown: 'PLAY + GROUND', meaning: 'ground where you play' }
          ]
        },
        quickCheck: {
          question: 'Which two words make RAINBOW?',
          answers: ['RAIN + BOW', 'RAIN + GO', 'SUN + BOW'],
          correctAnswer: 'RAIN + BOW',
          celebration: '🎉 Nailed it! Each part keeps its meaning inside the new word.'
        },
        practice: [
          {
            title: 'Puzzle Pair Builder',
            icon: '🧩',
            background: 'from-yellow-400 via-orange-400 to-red-400',
            description: 'Match picture halves to reveal the compound word.',
            steps: [
              'Find two picture cards that belong together.',
              'Say each base word aloud.',
              'Blend them to name the compound word and explain the meaning.'
            ]
          },
          {
            title: 'Real or Silly Mix-Up',
            icon: '😂',
            background: 'from-teal-400 via-cyan-400 to-blue-500',
            description: 'Create funny combinations and test if they are real words.',
            steps: [
              'Spin or pick two base word cards.',
              'Put them together and read the result.',
              'Give a thumbs up for real words and invent a meaning for silly ones.'
            ]
          }
        ],
        exitTicket: 'Choose a compound word, draw both base parts, and label the new meaning.'
      },

      practiceWordLists: [
        {
          icon: '🌟',
          title: 'Compound Match Ups',
          description: 'Blend the two base words into one compound word.',
          words: ['gold + fish → goldfish', 'sun + set → sunset', 'rain + coat → raincoat', 'moon + light → moonlight', 'cup + cake → cupcake']
        },
        {
          icon: '🖍️',
          title: 'Draw the Meaning',
          description: 'Read the compound word and sketch a quick picture.',
          words: ['starfish', 'playground', 'toothbrush', 'snowman', 'basketball']
        },
        {
          icon: '🎲',
          title: 'Spin a Compound',
          description: 'Spin two wheels to create a compound word. Is it real?',
          words: ['rain + bow', 'fire + fly', 'sun + flower', 'bed + room', 'book + shelf']
        }
      ],

      activities: [
        {
          title: 'Compound Puzzle Builders',
          icon: '🧱',
          duration: '12 mins',
          description: 'Match picture puzzle halves to create compound words',
          instructions: [
            'Lay out base word picture halves on the floor',
            'Students find two halves that join to make a real word',
            'Read the little words and then the big word',
            'Explain what each part means in the new word'
          ],
          materials: ['Picture puzzle cards'],
          printable: 'compound-explorer-cards'
        },
        {
          title: 'Pocket Chart Builders',
          icon: '📊',
          duration: '10 mins',
          description: 'Use a pocket chart to join base word cards',
          instructions: [
            'Place base word cards in two columns',
            'Students slide one card from each column together',
            'Read and decide if it is a real compound word',
            'Place real words in the “Word Winners” row'
          ],
          materials: ['Pocket chart', 'Base word cards', 'Real/not real headers'],
          printable: 'compound-blend-mats'
        },
        {
          title: 'Create & Illustrate',
          icon: '🎨',
          duration: '12 mins',
          description: 'Students create their own compound word posters',
          instructions: [
            'Give students two base word cards and blank templates',
            'They write the base words and the new compound word',
            'Draw a picture showing the new meaning',
            'Share with a partner or the class'
          ],
          materials: ['Compound word templates', 'Crayons', 'Markers'],
          printable: 'compound-scene-posters'
        }
      ],

      assessment: {
        formative: [
          'Can students identify the two base words in a compound word?',
          'Do they blend base words smoothly to make the new word?',
          'Can they explain what each part means?'
        ],
        questions: [
          'What two words make “sunset”?',
          'Explain the parts of “goldfish”.',
          'Can you think of a compound word you use at school?'
        ],
        exitTicket: 'Build one compound word and draw what it means.'
      }
    }
  ]
};

export default MorphologyLevel1;
