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
          materials: ['Picture cards', 'Worksheet or whiteboard']
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
          materials: ['Word cards', 'Paper', 'Crayons']
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
          materials: ['Base word cards', 'Affix cards', 'Paper', 'Pencils']
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
          materials: ['Colored word part cards', 'Train template (optional)']
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
          materials: ['Word part cards', 'Three sorting mats or boxes']
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
          materials: ['Large word part cards students can hold']
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
          materials: ['Worksheet', 'Colored pencils or crayons (red, blue, yellow)']
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
    }
  ]
};

export default MorphologyLevel1;