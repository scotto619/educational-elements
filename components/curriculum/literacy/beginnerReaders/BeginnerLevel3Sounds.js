// components/curriculum/literacy/beginnerReaders/BeginnerLevel3Sounds.js
// LEVEL 3 - ALTERNATE SPELLING SOUNDS
// Different ways to spell the same sound, includes simple reading passages

export const BEGINNER_LEVEL_3_SOUNDS = [
  {
    id: 'alternate-ai-ay',
    sound: 'long-a',
    title: 'Long A Sound: AI and AY',
    description: 'Different ways to spell the long A sound',
    image: '🌧️', // Rain
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The long A sound can be spelled AI (like in rain 🌧️) or AY (like in play ⚽)
🌙 The long A sound can be spelled AI (like in rain 🌧️) or AY (like in play ⚽)`,
        instructions: 'Partner Reading: Listen for the same sound in both spellings'
      },
      {
        type: 'ai-words',
        content: `☀️ rain    pain    main    train    brain    chain
🌙 tail    nail    sail    snail    trail    mail`,
        instructions: 'Partner Reading: AI words - all have the long A sound'
      },
      {
        type: 'ay-words',
        content: `☀️ play    day    way    say    may    stay
🌙 bay    hay    ray    lay    pay    gray`,
        instructions: 'Partner Reading: AY words - same long A sound, different spelling'
      },
      {
        type: 'mixed-practice',
        content: `☀️ rain or ray?    pain or pay?    main or may?
🌙 tail or tray?    snail or spray?    train or gray?`,
        instructions: 'Partner Reading: Both spellings make the same sound!'
      }
    ],
    simplePassage: {
      title: 'A Rainy Day',
      content: `☀️ It was a rainy day in May. Sam could not play outside.
🌙 "I want to play!" said Sam.
☀️ "We can play with the toy train," said his mother.
🌙 They played with the train all day.
☀️ "This is a great way to play!" said Sam.`
    },
    targetWords: ['rain', 'day', 'may', 'play', 'train', 'way', 'great'],
    soundFocus: 'Long A sound spelled as AI and AY'
  },
  {
    id: 'alternate-ee-ea',
    sound: 'long-e',
    title: 'Long E Sound: EE and EA',
    description: 'Different ways to spell the long E sound',
    image: '🌳', // Tree
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The long E sound can be spelled EE (like in tree 🌳) or EA (like in read 📖)
🌙 The long E sound can be spelled EE (like in tree 🌳) or EA (like in read 📖)`,
        instructions: 'Partner Reading: Same sound, two different spellings'
      },
      {
        type: 'ee-words',
        content: `☀️ tree    bee    see    free    three    green
🌙 need    feel    keep    meet    deep    sleep`,
        instructions: 'Partner Reading: EE words - listen for the long E sound'
      },
      {
        type: 'ea-words',
        content: `☀️ read    eat    sea    tea    leaf    clean
🌙 heat    meat    bean    team    dream    cream`,
        instructions: 'Partner Reading: EA words - same long E sound'
      },
      {
        type: 'mixed-practice',
        content: `☀️ tree or tea?    see or sea?    bee or beach?
🌙 green or cream?    three or dream?    free or team?`,
        instructions: 'Partner Reading: Listen carefully to hear they sound the same'
      }
    ],
    simplePassage: {
      title: 'Under the Green Tree',
      content: `☀️ There is a big green tree by the sea. Three children read under this tree.
🌙 "Let's eat our lunch here," said Lee.
☀️ "I can see a bee on that leaf," said Jean.
🌙 The children read and ate their lunch under the green tree.`
    },
    targetWords: ['green', 'tree', 'sea', 'three', 'read', 'eat', 'see', 'bee', 'leaf'],
    soundFocus: 'Long E sound spelled as EE and EA'
  },
  {
    id: 'alternate-igh-y',
    sound: 'long-i',
    title: 'Long I Sound: IGH and Y',
    description: 'Different ways to spell the long I sound',
    image: '🌙', // Night
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The long I sound can be spelled IGH (like in night 🌙) or Y (like in cry 😢)
🌙 The long I sound can be spelled IGH (like in night 🌙) or Y (like in cry 😢)`,
        instructions: 'Partner Reading: Same sound, different spellings at different places'
      },
      {
        type: 'igh-words',
        content: `☀️ night    light    right    bright    sight    fight
🌙 might    tight    fright    height    flight    slight`,
        instructions: 'Partner Reading: IGH words - usually in the middle or end'
      },
      {
        type: 'y-words',
        content: `☀️ cry    try    fly    my    by    shy
🌙 dry    spy    sky    fry    why    sly`,
        instructions: 'Partner Reading: Y words - Y at the end makes long I sound'
      },
      {
        type: 'mixed-practice',
        content: `☀️ bright light    fly high    try right    my night
🌙 sky light    cry bright    shy flight    dry sight`,
        instructions: 'Partner Reading: Mix both spellings in phrases'
      }
    ],
    simplePassage: {
      title: 'A Bright Night',
      content: `☀️ One bright night, a little fly wanted to try something new.
🌙 "I want to fly high up to that bright light," said the fly.
☀️ The fly tried and tried to reach the light.
🌙 "Try again," said a wise owl.
☀️ The little fly tried one more time and flew right up to the bright light!`
    },
    targetWords: ['bright', 'night', 'fly', 'try', 'high', 'light', 'right'],
    soundFocus: 'Long I sound spelled as IGH and Y'
  },
  {
    id: 'alternate-oa-ow',
    sound: 'long-o',
    title: 'Long O Sound: OA and OW',
    description: 'Different ways to spell the long O sound',
    image: '🚣', // Boat
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The long O sound can be spelled OA (like in boat 🚣) or OW (like in snow ❄️)
🌙 The long O sound can be spelled OA (like in boat 🚣) or OW (like in snow ❄️)`,
        instructions: 'Partner Reading: Same sound, two different letter patterns'
      },
      {
        type: 'oa-words',
        content: `☀️ boat    coat    goat    road    soap    toast
🌙 float    throat    moat    toad    foam    roast`,
        instructions: 'Partner Reading: OA words - listen for the long O sound'
      },
      {
        type: 'ow-words',
        content: `☀️ snow    grow    show    slow    know    blow
🌙 flow    glow    throw    below    elbow    follow`,
        instructions: 'Partner Reading: OW words - same long O sound'
      },
      {
        type: 'mixed-practice',
        content: `☀️ slow boat    snow coat    show goat    grow road
🌙 float snow    glow boat    throw soap    know toad`,
        instructions: 'Partner Reading: Practice both spellings together'
      }
    ],
    simplePassage: {
      title: 'The Slow Boat',
      content: `☀️ There was a slow boat on the water. The boat had a white coat of paint.
🌙 "Look at that goat on the boat!" said Joe.
☀️ Snow started to fall from the sky.
🌙 "I know!" said Joe. "The goat wanted a boat ride in the snow!"
☀️ The goat seemed happy on the slow boat.`
    },
    targetWords: ['slow', 'boat', 'coat', 'goat', 'snow', 'know'],
    soundFocus: 'Long O sound spelled as OA and OW'
  }
];