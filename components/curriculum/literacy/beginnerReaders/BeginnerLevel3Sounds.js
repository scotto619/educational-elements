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
  },
  {
    id: 'alternate-oo-ew',
    sound: 'long-u',
    title: 'Long U Sound: OO and EW',
    description: 'Different ways to spell the "oo" sound',
    image: '🦆', // Moon
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "oo" sound can be spelled OO (like in moon 🌙) or EW (like in flew ✈️)
🌙 The "oo" sound can be spelled OO (like in moon 🌙) or EW (like in flew ✈️)`,
        instructions: 'Partner Reading: Same sound, different spellings'
      },
      {
        type: 'oo-words',
        content: `☀️ moon    soon    food    cool    pool    room
🌙 boot    hoop    loop    mood    noon    zoom`,
        instructions: 'Partner Reading: OO words - listen for the "oo" sound'
      },
      {
        type: 'ew-words',
        content: `☀️ new    few    dew    grew    threw    blew
🌙 flew    crew    drew    knew    chew    stew`,
        instructions: 'Partner Reading: EW words - same "oo" sound'
      },
      {
        type: 'mixed-practice',
        content: `☀️ new moon    cool crew    few rooms    grew food
🌙 threw hoop    knew soon    blew pool    drew boot`,
        instructions: 'Partner Reading: Mix both spellings together'
      }
    ],
    simplePassage: {
      title: 'The New Moon',
      content: `☀️ There was a new moon in the cool night sky. A crew of children knew it would be a good night.
🌙 "The moon grew bright," said Sue.
☀️ "Soon we can eat our food by the pool," said Drew.
🌙 They threw their boots on and ran to the room where the food was kept.
☀️ It was a perfect night under the new moon.`
    },
    targetWords: ['new', 'moon', 'cool', 'crew', 'knew', 'grew', 'soon', 'food', 'threw', 'room'],
    soundFocus: 'Long U "oo" sound spelled as OO and EW'
  },
  {
    id: 'alternate-er-ur-ir',
    sound: 'r-controlled',
    title: 'R-Controlled: ER, UR, IR',
    description: 'Different ways to spell the "er" sound',
    image: '🐦', // Bird
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "er" sound can be spelled ER (her), UR (fur), or IR (bird 🐦)
🌙 The "er" sound can be spelled ER (her), UR (fur), or IR (bird 🐦)`,
        instructions: 'Partner Reading: All three spellings make the same sound!'
      },
      {
        type: 'er-words',
        content: `☀️ her    under    after    water    paper    sister
🌙 better    letter    winter    summer    number    finger`,
        instructions: 'Partner Reading: ER words - listen for the "er" sound'
      },
      {
        type: 'ur-words',
        content: `☀️ fur    turn    burn    hurt    nurse    purple
🌙 burst    curve    surf    church    turkey    curtain`,
        instructions: 'Partner Reading: UR words - same "er" sound'
      },
      {
        type: 'ir-words',
        content: `☀️ bird    girl    first    dirt    shirt    skirt
🌙 third    birth    circus    circle    thirty    thirteen`,
        instructions: 'Partner Reading: IR words - same "er" sound as ER and UR'
      }
    ],
    simplePassage: {
      title: 'The Girl and Her Bird',
      content: `☀️ There was a girl who had a bird. The bird had purple and white fur-like feathers.
🌙 "First, I will give you water," said the girl.
☀️ The bird turned its head and looked at her.
🌙 "You are the best bird," she said, touching its soft shirt of feathers.
☀️ The girl and her bird were the best of friends.`
    },
    targetWords: ['girl', 'bird', 'purple', 'fur', 'first', 'water', 'her', 'turned', 'shirt'],
    soundFocus: 'R-controlled vowels: ER, UR, IR all make the same sound'
  },
  {
    id: 'alternate-or-ore-oar',
    sound: 'or-sound',
    title: 'OR Sound: OR, ORE, OAR',
    description: 'Different ways to spell the "or" sound',
    image: '⭐', // Star (or)
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "or" sound can be spelled OR (for), ORE (more), or OAR (roar 🦁)
🌙 The "or" sound can be spelled OR (for), ORE (more), or OAR (roar 🦁)`,
        instructions: 'Partner Reading: Three ways to spell the same sound!'
      },
      {
        type: 'or-words',
        content: `☀️ for    or    born    corn    horn    storm
🌙 fort    form    sort    sport    short    north`,
        instructions: 'Partner Reading: OR words - the basic "or" spelling'
      },
      {
        type: 'ore-words',
        content: `☀️ more    core    bore    fore    tore    wore
🌙 store    shore    score    before    explore    ignore`,
        instructions: 'Partner Reading: ORE words - "or" sound with silent E'
      },
      {
        type: 'oar-words',
        content: `☀️ roar    soar    board    hoard    coarse    hoarse
🌙 aboard    keyboard    cardboard    seaboard    onboard`,
        instructions: 'Partner Reading: OAR words - longer spelling, same sound'
      }
    ],
    simplePassage: {
      title: 'The Storm at the Shore',
      content: `☀️ There was a big storm at the shore. The waves would roar and crash on the board walk.
🌙 "We need to explore the store before the storm gets worse," said Cora.
☀️ They ran north to the store and bought more food.
🌙 Back at home, they could hear the storm roar outside.
☀️ "This is better than being at the shore in the storm!" said Cora.`
    },
    targetWords: ['storm', 'shore', 'roar', 'board', 'explore', 'store', 'more', 'north', 'before'],
    soundFocus: 'OR sound spelled as OR, ORE, and OAR'
  },
  {
    id: 'alternate-ar-are',
    sound: 'ar-sound',
    title: 'AR Sound: AR and ARE',
    description: 'Different ways to spell the "ar" sound',
    image: '⭐', // Star
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "ar" sound can be spelled AR (star ⭐) or ARE (care 💝)
🌙 The "ar" sound can be spelled AR (star ⭐) or ARE (care 💝)`,
        instructions: 'Partner Reading: Two ways to spell the "ar" sound'
      },
      {
        type: 'ar-words',
        content: `☀️ car    far    bar    jar    tar    scar
🌙 park    dark    hard    card    yard    smart`,
        instructions: 'Partner Reading: AR words - the basic "ar" spelling'
      },
      {
        type: 'are-words',
        content: `☀️ care    dare    fare    mare    rare    scare
🌙 share    spare    square    prepare    compare    declare`,
        instructions: 'Partner Reading: ARE words - "ar" sound with silent E'
      },
      {
        type: 'mixed-practice',
        content: `☀️ park care    dark square    hard scare    smart share
🌙 far dare    car rare    yard spare    card compare`,
        instructions: 'Partner Reading: Mix both spellings together'
      }
    ],
    simplePassage: {
      title: 'A Day at the Park',
      content: `☀️ Clara and Mark went to the park in their car. They wanted to share a fun day.
🌙 "I dare you to run to that far tree," said Clara.
☀️ Mark ran hard across the yard to the tree by the square pond.
🌙 "You are very smart and fast!" said Clara.
☀️ They spent the day playing games and didn't care about anything else.`
    },
    targetWords: ['Clara', 'Mark', 'park', 'car', 'share', 'dare', 'far', 'hard', 'yard', 'square', 'smart', 'care'],
    soundFocus: 'AR sound spelled as AR and ARE'
  },
  {
    id: 'alternate-oy-oi',
    sound: 'oy-sound',
    title: 'OY Sound: OY and OI',
    description: 'Different ways to spell the "oy" sound',
    image: '🧸', // Toy
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "oy" sound can be spelled OY (toy 🧸) or OI (coin 🪙)
🌙 The "oy" sound can be spelled OY (toy 🧸) or OI (coin 🪙)`,
        instructions: 'Partner Reading: Same sound, two different spellings'
      },
      {
        type: 'oy-words',
        content: `☀️ toy    boy    joy    soy    coy    troy
🌙 enjoy    employ    destroy    annoy    deploy`,
        instructions: 'Partner Reading: OY words - usually at the end of words'
      },
      {
        type: 'oi-words',
        content: `☀️ oil    boil    soil    coil    foil    toil
🌙 join    coin    point    moist    voice    choice`,
        instructions: 'Partner Reading: OI words - usually in the middle of words'
      },
      {
        type: 'mixed-practice',
        content: `☀️ boy coin    joy oil    toy voice    employ choice
🌙 destroy soil    annoy point    troy join    enjoy boil`,
        instructions: 'Partner Reading: Mix both spellings together'
      }
    ],
    simplePassage: {
      title: 'The Boy and His Coin',
      content: `☀️ A boy found a shiny coin in the soil by his favorite toy truck.
🌙 "What joy!" said the boy with a loud voice.
☀️ He decided to join his friends and show them his choice find.
🌙 "You can buy a new toy with that coin," said his friend Roy.
☀️ The boy smiled and put the coin in his pocket to enjoy later.`
    },
    targetWords: ['boy', 'coin', 'soil', 'toy', 'joy', 'voice', 'join', 'choice', 'Roy', 'enjoy'],
    soundFocus: 'OY sound spelled as OY and OI'
  },
  {
    id: 'alternate-aw-au',
    sound: 'aw-sound',
    title: 'AW Sound: AW and AU',
    description: 'Different ways to spell the "aw" sound',
    image: '🐾', // Paw
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "aw" sound can be spelled AW (paw 🐾) or AU (haul 🚛)
🌙 The "aw" sound can be spelled AW (paw 🐾) or AU (haul 🚛)`,
        instructions: 'Partner Reading: Same sound, different spellings'
      },
      {
        type: 'aw-words',
        content: `☀️ paw    saw    law    raw    jaw    claw
🌙 draw    crawl    awful    awesome    hawk    lawn`,
        instructions: 'Partner Reading: AW words - listen for the "aw" sound'
      },
      {
        type: 'au-words',
        content: `☀️ haul    maul    Paul    Saul    fault    vault
🌙 cause    pause    clause    applause    because    dinosaur`,
        instructions: 'Partner Reading: AU words - same "aw" sound'
      },
      {
        type: 'mixed-practice',
        content: `☀️ paw haul    saw Paul    raw cause    claw fault
🌙 draw pause    crawl because    hawk applause    lawn vault`,
        instructions: 'Partner Reading: Both spellings make the same sound'
      }
    ],
    simplePassage: {
      title: 'Paul and His Dog',
      content: `☀️ Paul had a dog with a hurt paw. He saw that it needed help.
🌙 "We need to haul you to the vet," said Paul to his dog.
☀️ The vet said the paw would heal because Paul brought the dog quickly.
🌙 Paul was awesome! He knew the right thing to do without fault.
☀️ The dog's paw got better, and Paul was happy because he helped his friend.`
    },
    targetWords: ['Paul', 'paw', 'saw', 'haul', 'because', 'awesome', 'fault', 'law'],
    soundFocus: 'AW sound spelled as AW and AU'
  },
  {
    id: 'alternate-ew-ue',
    sound: 'ue-sound',
    title: 'UE Sound: EW and UE',
    description: 'Different ways to spell the "ue" sound',
    image: '🔵', // Blue
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "ue" sound can be spelled EW (flew ✈️) or UE (blue 🔵)
🌙 The "ue" sound can be spelled EW (flew ✈️) or UE (blue 🔵)`,
        instructions: 'Partner Reading: Same sound, two spellings'
      },
      {
        type: 'ew-words',
        content: `☀️ new    few    dew    grew    threw    blew
🌙 flew    crew    drew    knew    chew    stew`,
        instructions: 'Partner Reading: EW words - "ue" sound spelled with EW'
      },
      {
        type: 'ue-words',
        content: `☀️ due    hue    cue    sue    rue    flue
🌙 blue    clue    glue    true    value    rescue`,
        instructions: 'Partner Reading: UE words - same sound, spelled with UE'
      },
      {
        type: 'mixed-practice',
        content: `☀️ new blue    few clue    grew true    threw glue
🌙 knew due    flew rescue    drew value    stew cue`,
        instructions: 'Partner Reading: Both spellings sound the same'
      }
    ],
    simplePassage: {
      title: 'The True Blue Clue',
      content: `☀️ Sue knew she had a clue to find the treasure. It was written on blue paper.
🌙 "The clue says to look where the flowers grew," said Sue.
☀️ She threw on her jacket and ran to the garden where true blue flowers bloomed.
🌙 There, due to her careful searching, she found a bottle of glue with a new clue inside!
☀️ Sue was happy that the blue clue led her to the next step of the treasure hunt.`
    },
    targetWords: ['Sue', 'knew', 'clue', 'blue', 'grew', 'threw', 'true', 'due', 'glue', 'new'],
    soundFocus: 'UE sound spelled as EW and UE'
  },
  {
    id: 'alternate-ie-y-long-e',
    sound: 'y-long-e',
    title: 'Long E Sound: IE and Y',
    description: 'IE and Y making the long E sound',
    image: '🍰', // Pie
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ Long E can be spelled IE (pie 🍰) or Y (happy 😊) at the end
🌙 Long E can be spelled IE (pie 🍰) or Y (happy 😊) at the end`,
        instructions: 'Partner Reading: Both make the long E sound at word endings'
      },
      {
        type: 'ie-words',
        content: `☀️ pie    tie    die    lie    vie    hie
🌙 field    piece    brief    chief    thief    believe`,
        instructions: 'Partner Reading: IE words - some make long E, others make long I'
      },
      {
        type: 'y-words',
        content: `☀️ happy    puppy    candy    family    study    city
🌙 empty    plenty    twenty    fifty    silly    berry`,
        instructions: 'Partner Reading: Y words - Y at the end makes long E'
      },
      {
        type: 'mixed-practice',
        content: `☀️ happy pie    family tie    silly piece    empty field
🌙 funny brief    lucky chief    pretty believe    study twenty`,
        instructions: 'Partner Reading: Mix IE and Y long E sounds'
      }
    ],
    simplePassage: {
      title: 'The Happy Family',
      content: `☀️ There was a happy family who loved to study together. Every Sunday they would eat pie.
🌙 "I believe we should make a berry pie," said the chief cook of the family.
☀️ They picked twenty berries from their field behind the house.
🌙 The silly puppy tried to tie his collar to help, but he was too little.
☀️ The family laughed and gave the happy puppy a tiny piece of pie.`
    },
    targetWords: ['happy', 'family', 'study', 'pie', 'believe', 'berry', 'twenty', 'field', 'silly', 'puppy', 'tie', 'piece'],
    soundFocus: 'Long E sound at word endings: IE and Y'
  },
  {
    id: 'alternate-c-k-ck',
    sound: 'k-sound',
    title: 'K Sound: C, K, CK',
    description: 'Different ways to spell the "k" sound',
    image: '🐱', // Cat
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "k" sound can be spelled C (cat 🐱), K (king 👑), or CK (duck 🦆)
🌙 The "k" sound can be spelled C (cat 🐱), K (king 👑), or CK (duck 🦆)`,
        instructions: 'Partner Reading: Three ways to spell the same sound!'
      },
      {
        type: 'c-words',
        content: `☀️ cat    can    cup    cut    car    cool
🌙 come    call    cake    cave    cure    camp`,
        instructions: 'Partner Reading: C words - C makes the "k" sound before A, O, U'
      },
      {
        type: 'k-words',
        content: `☀️ king    keep    kind    kite    key    kid
🌙 kiss    kick    kitchen    kitten    knee    knife`,
        instructions: 'Partner Reading: K words - K makes the "k" sound before I, E'
      },
      {
        type: 'ck-words',
        content: `☀️ back    neck    pick    rock    duck    truck
🌙 black    click    flock    quick    stick    track`,
        instructions: 'Partner Reading: CK words - CK at the end after short vowels'
      }
    ],
    simplePassage: {
      title: 'The King and the Duck',
      content: `☀️ There was a kind king who had a pet duck. The duck could not quack like other ducks.
🌙 "Come here, my duck," called the king from his kitchen.
☀️ The duck would kick its feet and run to the king.
🌙 "You are the best duck a king could have," he said as he gave it a quick hug.
☀️ The king and his duck were happy together in their castle.`
    },
    targetWords: ['kind', 'king', 'duck', 'quack', 'come', 'called', 'kitchen', 'kick', 'could', 'quick', 'castle'],
    soundFocus: 'K sound spelled as C, K, and CK'
  },
  {
    id: 'alternate-f-ph',
    sound: 'f-sound',
    title: 'F Sound: F and PH',
    description: 'Different ways to spell the "f" sound',
    image: '🐠', // Fish
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "f" sound can be spelled F (fish 🐠) or PH (phone 📱)
🌙 The "f" sound can be spelled F (fish 🐠) or PH (phone 📱)`,
        instructions: 'Partner Reading: F and PH make exactly the same sound!'
      },
      {
        type: 'f-words',
        content: `☀️ fish    fun    fast    farm    fire    family
🌙 face    food    friend    first    field    follow`,
        instructions: 'Partner Reading: F words - the regular "f" spelling'
      },
      {
        type: 'ph-words',
        content: `☀️ phone    photo    graph    laugh    tough    enough
🌙 elephant    alphabet    dolphin    nephew    trophy`,
        instructions: 'Partner Reading: PH words - same "f" sound, different spelling'
      },
      {
        type: 'mixed-practice',
        content: `☀️ fish phone    fun photo    fast graph    farm elephant
🌙 fire laugh    family tough    friend enough    food alphabet`,
        instructions: 'Partner Reading: Both F and PH sound exactly the same'
      }
    ],
    simplePassage: {
      title: 'Phil and His Phone',
      content: `☀️ Phil loved to take photos with his phone. His favorite was a photo of a fish.
🌙 "This fish is tough to photograph," said Phil with a laugh.
☀️ He showed the photo to his family and friends.
🌙 "That's enough fish photos for today," said his nephew with a laugh.
☀️ Phil put his phone away, but he was already planning his next photo of a fish.`
    },
    targetWords: ['Phil', 'photos', 'phone', 'photo', 'fish', 'photograph', 'tough', 'laugh', 'family', 'friends', 'enough', 'nephew'],
    soundFocus: 'F sound spelled as F and PH'
  },
  {
    id: 'alternate-j-g-dge',
    sound: 'j-sound',
    title: 'J Sound: J, G, DGE',
    description: 'Different ways to spell the "j" sound',
    image: '🫙', // Jar
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "j" sound can be spelled J (jar 🫙), G (gem 💎), or DGE (bridge 🌉)
🌙 The "j" sound can be spelled J (jar 🫙), G (gem 💎), or DGE (bridge 🌉)`,
        instructions: 'Partner Reading: Three ways to spell the "j" sound!'
      },
      {
        type: 'j-words',
        content: `☀️ jar    job    jump    just    joy    June
🌙 join    joke    juice    judge    jacket    jigsaw`,
        instructions: 'Partner Reading: J words - the regular "j" spelling'
      },
      {
        type: 'g-words',
        content: `☀️ gem    gym    germ    giant    giraffe    gentle
🌙 engine    magic    cage    stage    large    orange`,
        instructions: 'Partner Reading: G words - G makes "j" sound before E, I, Y'
      },
      {
        type: 'dge-words',
        content: `☀️ badge    edge    fudge    judge    ledge    ridge
🌙 bridge    smudge    grudge    pledge    wedge    hedge`,
        instructions: 'Partner Reading: DGE words - "j" sound at the end after short vowels'
      }
    ],
    simplePassage: {
      title: 'The Giant and the Bridge',
      content: `☀️ A gentle giant lived by a large bridge. He would judge who could cross safely.
🌙 "Just show me your badge," said the giant to each person.
☀️ One day, a giraffe came to the bridge carrying a jar of orange juice.
🌙 "What magic!" said the giant. "You may cross my bridge!"
☀️ The giant and giraffe became friends and shared the juice by the bridge.`
    },
    targetWords: ['gentle', 'giant', 'large', 'bridge', 'judge', 'just', 'badge', 'giraffe', 'jar', 'orange', 'juice', 'magic'],
    soundFocus: 'J sound spelled as J, G (before E/I/Y), and DGE'
  },
  {
    id: 'alternate-s-c-ss',
    sound: 's-sound',
    title: 'S Sound: S, C, SS',
    description: 'Different ways to spell the "s" sound',
    image: '🐍', // Snake
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "s" sound can be spelled S (snake 🐍), C (city 🏙️), or SS (dress 👗)
🌙 The "s" sound can be spelled S (snake 🐍), C (city 🏙️), or SS (dress 👗)`,
        instructions: 'Partner Reading: Three ways to make the "s" sound!'
      },
      {
        type: 's-words',
        content: `☀️ snake    sun    sit    sand    swim    story
🌙 sister    seven    sleep    small    smile    space`,
        instructions: 'Partner Reading: S words - the regular "s" spelling'
      },
      {
        type: 'c-words',
        content: `☀️ city    cent    cell    cycle    dance    face
🌙 ice    mice    nice    place    price    race`,
        instructions: 'Partner Reading: C words - C makes "s" sound before E, I, Y'
      },
      {
        type: 'ss-words',
        content: `☀️ dress    grass    class    glass    cross    press
🌙 mess    less    miss    pass    kiss    toss`,
        instructions: 'Partner Reading: SS words - double S makes the "s" sound'
      }
    ],
    simplePassage: {
      title: 'The Class in the City',
      content: `☀️ Miss Chen's class took a trip to the city. They had to cross busy streets.
🌙 "Stay close and don't make a mess," said Miss Chen with a smile.
☀️ The children saw tall grass in the city park and a man selling ice.
🌙 "This place is so nice!" said the children as they passed the fountain.
☀️ The class had a great day in the city and couldn't wait to go back.`
    },
    targetWords: ['class', 'city', 'cross', 'Miss', 'mess', 'smile', 'grass', 'ice', 'place', 'nice', 'passed'],
    soundFocus: 'S sound spelled as S, C (before E/I/Y), and SS'
  },
  {
    id: 'alternate-z-s-zz',
    sound: 'z-sound',
    title: 'Z Sound: Z, S, ZZ',
    description: 'Different ways to spell the "z" sound',
    image: '🦓', // Zebra
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ The "z" sound can be spelled Z (zebra 🦓), S (has), or ZZ (buzz 🐝)
🌙 The "z" sound can be spelled Z (zebra 🦓), S (has), or ZZ (buzz 🐝)`,
        instructions: 'Partner Reading: Three ways to make the "z" sound!'
      },
      {
        type: 'z-words',
        content: `☀️ zebra    zoo    zero    zone    zip    zap
🌙 size    prize    freeze    breeze    amazing    lazy`,
        instructions: 'Partner Reading: Z words - the regular "z" spelling'
      },
      {
        type: 's-words',
        content: `☀️ has    his    was    is    goes    does
🌙 nose    rose    close    those    these    choose`,
        instructions: 'Partner Reading: S words - S makes "z" sound in these words'
      },
      {
        type: 'zz-words',
        content: `☀️ buzz    jazz    fizz    fuzz    pizza    puzzle
🌙 dazzle    sizzle    muzzle    nuzzle    drizzle`,
        instructions: 'Partner Reading: ZZ words - double Z makes the "z" sound'
      }
    ],
    simplePassage: {
      title: 'A Day at the Zoo',
      content: `☀️ Zoe was amazed by the zebras at the zoo. They had amazing stripes!
🌙 "Those zebras are the size of horses," said Zoe as the breeze blew.
☀️ She chose to watch them close up and saw one zebra puzzle over its food.
🌙 The zebra was lazy in the warm sun, but Zoe was excited by everything she saw.
☀️ Zoe decided the zoo was the perfect place to spend a breezy day.`
    },
    targetWords: ['Zoe', 'amazed', 'zebras', 'zoo', 'amazing', 'those', 'size', 'breeze', 'chose', 'close', 'puzzle', 'lazy'],
    soundFocus: 'Z sound spelled as Z, S (in some words), and ZZ'
  },
  {
    id: 'alternate-silent-letters',
    sound: 'silent-letters',
    title: 'Silent Letters: B, L, W, K',
    description: 'Letters we see but don\'t say',
    image: '🔕', // Muted sound
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ Some letters are silent! We see them but don't say them 🔕
🌙 Some letters are silent! We see them but don't say them 🔕`,
        instructions: 'Partner Reading: Silent letters are there but we don\'t hear them'
      },
      {
        type: 'silent-b',
        content: `☀️ lamb    thumb    climb    comb    tomb    crumb
🌙 limb    bomb    dumb    numb    plumb    womb`,
        instructions: 'Partner Reading: Silent B - we don\'t say the B at the end'
      },
      {
        type: 'silent-l',
        content: `☀️ half    calf    walk    talk    chalk    stalk
🌙 palm    calm    psalm    balm    salmon    yolk`,
        instructions: 'Partner Reading: Silent L - we don\'t say the L in these words'
      },
      {
        type: 'silent-w-k',
        content: `☀️ write    wrong    wrist    knee    knife    know
🌙 wrap    wreck    knock    knot    knight    gnome`,
        instructions: 'Partner Reading: Silent W and K - we don\'t say W in WR or K in KN'
      }
    ],
    simplePassage: {
      title: 'The Knight Who Couldn\'t Write',
      content: `☀️ There was a knight who couldn't write with his right hand because he hurt his thumb.
🌙 "I know I can learn to write with my left hand," said the knight.
☀️ He would climb up to his room and practice writing with chalk.
🌙 Half the time his writing was wrong, but he didn't want to talk about giving up.
☀️ Soon the knight could write perfectly, and he was no longer dumb about writing!`
    },
    targetWords: ['knight', 'write', 'right', 'thumb', 'know', 'climb', 'chalk', 'half', 'wrong', 'talk', 'dumb'],
    soundFocus: 'Silent letters: B (lamb), L (half), W (write), K (knee)'
  }
];