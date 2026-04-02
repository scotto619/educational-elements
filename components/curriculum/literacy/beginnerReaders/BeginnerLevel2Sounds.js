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
  },
  {
    id: 'focus-wh',
    sound: 'wh',
    title: 'The WH Sound',
    description: 'Learning the WH beginning sound',
    image: '🐋', // Whale
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ WH makes the "wh" sound like whale! 🐋 It's like blowing air!
🌙 WH makes the "wh" sound like whale! 🐋 It's like blowing air!`,
        instructions: 'Partner Reading: Say "whale" and feel the air on your hand'
      },
      {
        type: 'sound-mixing',
        content: `☀️ wh  s  a  wh  t  wh  p  wh  i  wh  n  wh
🌙 wh  m  wh  o  wh  r  wh  e  wh  u  wh`,
        instructions: 'Partner Reading: WH is different from just W - feel the air'
      },
      {
        type: 'simple-words',
        content: `☀️ what    when    where    why    who
🌙 wheel    white    while    whip    whim`,
        instructions: 'Partner Reading: WH question words - we use these a lot!'
      },
      {
        type: 'tricky-words',
        content: `☀️ whisper    whistle    whirlpool    somewhere
🌙 anywhere    everywhere    meanwhile    whatever`,
        instructions: 'Partner Reading: Longer WH words - find the WH sound'
      }
    ],
    targetWords: ['what', 'when', 'where', 'why', 'who', 'wheel', 'white', 'while'],
    soundFocus: 'WH digraph and breath sound recognition'
  },
  {
    id: 'focus-ph',
    sound: 'ph',
    title: 'The PH Sound',
    description: 'Learning the PH sound like F',
    image: '📱', // Phone
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ PH makes the "f" sound like phone! 📱 PH sounds just like F!
🌙 PH makes the "f" sound like phone! 📱 PH sounds just like F!`,
        instructions: 'Partner Reading: Say "phone" - PH makes the same sound as F'
      },
      {
        type: 'sound-mixing',
        content: `☀️ ph  f  ph  s  a  ph  t  ph  i  ph  n  ph
🌙 ph  f  ph  m  ph  o  ph  r  ph  e  ph`,
        instructions: 'Partner Reading: PH and F sound exactly the same!'
      },
      {
        type: 'simple-words',
        content: `☀️ phone    photo    graph    laugh    tough
🌙 elephant    alphabet    trophy    dolphin    nephew`,
        instructions: 'Partner Reading: PH words - remember PH = F sound'
      },
      {
        type: 'tricky-words',
        content: `☀️ telephone    paragraph    microphone    geography
🌙 pharmacy    philosophy    photography    atmosphere`,
        instructions: 'Partner Reading: Longer PH words - find all the PH sounds'
      }
    ],
    targetWords: ['phone', 'photo', 'graph', 'laugh', 'tough', 'elephant', 'alphabet', 'trophy'],
    soundFocus: 'PH digraph making F sound'
  },
  {
    id: 'focus-bl',
    sound: 'bl',
    title: 'The BL Blend',
    description: 'Learning the BL beginning blend',
    image: '🔵', // Blue circle
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ BL blends B and L together like blue! 🔵 B-L = BL!
🌙 BL blends B and L together like blue! 🔵 B-L = BL!`,
        instructions: 'Partner Reading: Say "B" then "L" quickly together - "BL"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ bl  b  l  bl  s  bl  a  bl  t  bl  p  bl
🌙 bl  i  bl  n  bl  m  bl  o  bl  r  bl`,
        instructions: 'Partner Reading: Blend the B and L sounds smoothly together'
      },
      {
        type: 'simple-words',
        content: `☀️ blue    blow    blog    blob    bled
🌙 black    block    blend    blank    blast`,
        instructions: 'Partner Reading: BL blend words - smooth B and L together'
      },
      {
        type: 'tricky-words',
        content: `☀️ blanket    blizzard    problem    trouble
🌙 scramble    bubble    marble    possible`,
        instructions: 'Partner Reading: BL in longer words - can you hear it?'
      }
    ],
    targetWords: ['blue', 'blow', 'blog', 'blob', 'black', 'block', 'blend', 'blank'],
    soundFocus: 'BL consonant blend at beginning of words'
  },
  {
    id: 'focus-cl',
    sound: 'cl',
    title: 'The CL Blend',
    description: 'Learning the CL beginning blend',
    image: '👏', // Clap
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ CL blends C and L together like clap! 👏 C-L = CL!
🌙 CL blends C and L together like clap! 👏 C-L = CL!`,
        instructions: 'Partner Reading: Say "C" then "L" quickly together - "CL"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ cl  c  l  cl  s  cl  a  cl  t  cl  p  cl
🌙 cl  i  cl  n  cl  m  cl  o  cl  r  cl`,
        instructions: 'Partner Reading: Blend the C and L sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ clap    clip    clan    clam    clad
🌙 class    clean    clear    climb    clock`,
        instructions: 'Partner Reading: CL blend words - blend C and L together'
      },
      {
        type: 'tricky-words',
        content: `☀️ cluster    clothes    bicycle    uncle
🌙 circle    article    muscle    vehicle`,
        instructions: 'Partner Reading: CL in different places - listen carefully'
      }
    ],
    targetWords: ['clap', 'clip', 'clan', 'clam', 'class', 'clean', 'clear', 'climb'],
    soundFocus: 'CL consonant blend recognition'
  },
  {
    id: 'focus-fl',
    sound: 'fl',
    title: 'The FL Blend',
    description: 'Learning the FL beginning blend',
    image: '🎌', // Flag
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ FL blends F and L together like flag! 🎌 F-L = FL!
🌙 FL blends F and L together like flag! 🎌 F-L = FL!`,
        instructions: 'Partner Reading: Say "F" then "L" quickly together - "FL"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ fl  f  l  fl  s  fl  a  fl  t  fl  p  fl
🌙 fl  i  fl  n  fl  m  fl  o  fl  r  fl`,
        instructions: 'Partner Reading: Blend F and L sounds smoothly together'
      },
      {
        type: 'simple-words',
        content: `☀️ flag    flip    flat    flap    fled
🌙 flow    flew    flex    flog    flop`,
        instructions: 'Partner Reading: FL blend words - smooth F and L together'
      },
      {
        type: 'tricky-words',
        content: `☀️ flower    flight    flashlight    butterfly
🌙 reflect    conflict    inflatable    snowflake`,
        instructions: 'Partner Reading: FL in longer words - find the blend'
      }
    ],
    targetWords: ['flag', 'flip', 'flat', 'flap', 'flow', 'flew', 'flex', 'flog'],
    soundFocus: 'FL consonant blend recognition'
  },
  {
    id: 'focus-gl',
    sound: 'gl',
    title: 'The GL Blend',
    description: 'Learning the GL beginning blend',
    image: '🥃', // Glass
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ GL blends G and L together like glass! 🥃 G-L = GL!
🌙 GL blends G and L together like glass! 🥃 G-L = GL!`,
        instructions: 'Partner Reading: Say "G" then "L" quickly together - "GL"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ gl  g  l  gl  s  gl  a  gl  t  gl  p  gl
🌙 gl  i  gl  n  gl  m  gl  o  gl  r  gl`,
        instructions: 'Partner Reading: Blend G and L sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ glad    glow    glue    glob    glen
🌙 glass    glide    globe    glory    gloom`,
        instructions: 'Partner Reading: GL blend words - blend G and L together'
      },
      {
        type: 'tricky-words',
        content: `☀️ glitter    glasses    triangle    angle
🌙 ingle    jungle    single    mingle`,
        instructions: 'Partner Reading: GL in different positions - listen for it'
      }
    ],
    targetWords: ['glad', 'glow', 'glue', 'glob', 'glass', 'glide', 'globe', 'glory'],
    soundFocus: 'GL consonant blend recognition'
  },
  {
    id: 'focus-pl',
    sound: 'pl',
    title: 'The PL Blend',
    description: 'Learning the PL beginning blend',
    image: '🌱', // Plant
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ PL blends P and L together like plant! 🌱 P-L = PL!
🌙 PL blends P and L together like plant! 🌱 P-L = PL!`,
        instructions: 'Partner Reading: Say "P" then "L" quickly together - "PL"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ pl  p  l  pl  s  pl  a  pl  t  pl  i  pl
🌙 pl  n  pl  m  pl  o  pl  r  pl  e  pl`,
        instructions: 'Partner Reading: Blend P and L sounds together smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ plan    play    plot    plus    plug
🌙 place    plane    plant    plate    plum`,
        instructions: 'Partner Reading: PL blend words - blend P and L together'
      },
      {
        type: 'tricky-words',
        content: `☀️ planet    plastic    explain    complete
🌙 simple    purple    example    apple`,
        instructions: 'Partner Reading: PL in different places in words'
      }
    ],
    targetWords: ['plan', 'play', 'plot', 'plus', 'place', 'plane', 'plant', 'plate'],
    soundFocus: 'PL consonant blend recognition'
  },
  {
    id: 'focus-sl',
    sound: 'sl',
    title: 'The SL Blend',
    description: 'Learning the SL beginning blend',
    image: '🛝', // Slide
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ SL blends S and L together like slide! 🛝 S-L = SL!
🌙 SL blends S and L together like slide! 🛝 S-L = SL!`,
        instructions: 'Partner Reading: Say "S" then "L" quickly together - "SL"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ sl  s  l  sl  a  sl  t  sl  p  sl  i  sl
🌙 sl  n  sl  m  sl  o  sl  r  sl  e  sl`,
        instructions: 'Partner Reading: Blend S and L sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ slap    slip    slot    slug    slam
🌙 slow    slim    sled    slob    slid`,
        instructions: 'Partner Reading: SL blend words - smooth S and L together'
      },
      {
        type: 'tricky-words',
        content: `☀️ sleeping    slippery    translate    island
🌙 asleep    translate    mislead    newsline`,
        instructions: 'Partner Reading: SL in longer words - find the blend'
      }
    ],
    targetWords: ['slap', 'slip', 'slot', 'slug', 'slow', 'slim', 'sled', 'slob'],
    soundFocus: 'SL consonant blend recognition'
  },
  {
    id: 'focus-br',
    sound: 'br',
    title: 'The BR Blend',
    description: 'Learning the BR beginning blend',
    image: '🤎', // Brown
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ BR blends B and R together like brown! 🤎 B-R = BR!
🌙 BR blends B and R together like brown! 🤎 B-R = BR!`,
        instructions: 'Partner Reading: Say "B" then "R" quickly together - "BR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ br  b  r  br  s  br  a  br  t  br  p  br
🌙 br  i  br  n  br  m  br  o  br  e  br`,
        instructions: 'Partner Reading: Blend B and R sounds together'
      },
      {
        type: 'simple-words',
        content: `☀️ brag    bred    brew    brim    brad
🌙 brown    bring    brave    break    brush`,
        instructions: 'Partner Reading: BR blend words - blend B and R smoothly'
      },
      {
        type: 'tricky-words',
        content: `☀️ brother    birthday    library    February
🌙 umbrella    celebrate    vibrate    embrace`,
        instructions: 'Partner Reading: BR in different places - listen carefully'
      }
    ],
    targetWords: ['brag', 'bred', 'brew', 'brim', 'brown', 'bring', 'brave', 'break'],
    soundFocus: 'BR consonant blend recognition'
  },
  {
    id: 'focus-cr',
    sound: 'cr',
    title: 'The CR Blend',
    description: 'Learning the CR beginning blend',
    image: '🦀', // Crab
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ CR blends C and R together like crab! 🦀 C-R = CR!
🌙 CR blends C and R together like crab! 🦀 C-R = CR!`,
        instructions: 'Partner Reading: Say "C" then "R" quickly together - "CR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ cr  c  r  cr  s  cr  a  cr  t  cr  p  cr
🌙 cr  i  cr  n  cr  m  cr  o  cr  e  cr`,
        instructions: 'Partner Reading: Blend C and R sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ crab    crop    crew    crib    cram
🌙 cross    crack    cream    crown    crush`,
        instructions: 'Partner Reading: CR blend words - blend C and R together'
      },
      {
        type: 'tricky-words',
        content: `☀️ crazy    create    cricket    December
🌙 describe    increase    microscope    incredible`,
        instructions: 'Partner Reading: CR in longer words - find the blend'
      }
    ],
    targetWords: ['crab', 'crop', 'crew', 'crib', 'cross', 'crack', 'cream', 'crown'],
    soundFocus: 'CR consonant blend recognition'
  },
  {
    id: 'focus-dr',
    sound: 'dr',
    title: 'The DR Blend',
    description: 'Learning the DR beginning blend',
    image: '🥁', // Drum
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ DR blends D and R together like drum! 🥁 D-R = DR!
🌙 DR blends D and R together like drum! 🥁 D-R = DR!`,
        instructions: 'Partner Reading: Say "D" then "R" quickly together - "DR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ dr  d  r  dr  s  dr  a  dr  t  dr  p  dr
🌙 dr  i  dr  n  dr  m  dr  o  dr  e  dr`,
        instructions: 'Partner Reading: Blend D and R sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ drag    drop    drew    drip    drum
🌙 drive    dream    dress    drink    dried`,
        instructions: 'Partner Reading: DR blend words - blend D and R together'
      },
      {
        type: 'tricky-words',
        content: `☀️ dragon    address    hundreds    children
🌙 bedroom    understand    extraordinary    laundry`,
        instructions: 'Partner Reading: DR in different positions in words'
      }
    ],
    targetWords: ['drag', 'drop', 'drew', 'drip', 'drive', 'dream', 'dress', 'drink'],
    soundFocus: 'DR consonant blend recognition'
  },
  {
    id: 'focus-fr',
    sound: 'fr',
    title: 'The FR Blend',
    description: 'Learning the FR beginning blend',
    image: '🐸', // Frog
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ FR blends F and R together like frog! 🐸 F-R = FR!
🌙 FR blends F and R together like frog! 🐸 F-R = FR!`,
        instructions: 'Partner Reading: Say "F" then "R" quickly together - "FR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ fr  f  r  fr  s  fr  a  fr  t  fr  p  fr
🌙 fr  i  fr  n  fr  m  fr  o  fr  e  fr`,
        instructions: 'Partner Reading: Blend F and R sounds together'
      },
      {
        type: 'simple-words',
        content: `☀️ frog    from    free    fret    frig
🌙 front    fresh    frame    fruit    freeze`,
        instructions: 'Partner Reading: FR blend words - blend F and R smoothly'
      },
      {
        type: 'tricky-words',
        content: `☀️ Friday    frozen    friendship    Africa
🌙 afraid    refrigerator    confrontation    infrared`,
        instructions: 'Partner Reading: FR in different places - listen for it'
      }
    ],
    targetWords: ['frog', 'from', 'free', 'fret', 'front', 'fresh', 'frame', 'fruit'],
    soundFocus: 'FR consonant blend recognition'
  },
  {
    id: 'focus-gr',
    sound: 'gr',
    title: 'The GR Blend',
    description: 'Learning the GR beginning blend',
    image: '💚', // Green heart
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ GR blends G and R together like green! 💚 G-R = GR!
🌙 GR blends G and R together like green! 💚 G-R = GR!`,
        instructions: 'Partner Reading: Say "G" then "R" quickly together - "GR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ gr  g  r  gr  s  gr  a  gr  t  gr  p  gr
🌙 gr  i  gr  n  gr  m  gr  o  gr  e  gr`,
        instructions: 'Partner Reading: Blend G and R sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ grab    grid    grew    grin    gram
🌙 green    great    grape    grass    group`,
        instructions: 'Partner Reading: GR blend words - blend G and R together'
      },
      {
        type: 'tricky-words',
        content: `☀️ grocery    grandmother    program    agreement
🌙 hungry    angry    migrate    ingredient`,
        instructions: 'Partner Reading: GR in longer words - find the blend'
      }
    ],
    targetWords: ['grab', 'grid', 'grew', 'grin', 'green', 'great', 'grape', 'grass'],
    soundFocus: 'GR consonant blend recognition'
  },
  {
    id: 'focus-pr',
    sound: 'pr',
    title: 'The PR Blend',
    description: 'Learning the PR beginning blend',
    image: '🦐', // Prawn/shrimp (proud)
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ PR blends P and R together like proud! 🦐 P-R = PR!
🌙 PR blends P and R together like proud! 🦐 P-R = PR!`,
        instructions: 'Partner Reading: Say "P" then "R" quickly together - "PR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ pr  p  r  pr  s  pr  a  pr  t  pr  i  pr
🌙 pr  n  pr  m  pr  o  pr  e  pr  u  pr`,
        instructions: 'Partner Reading: Blend P and R sounds together'
      },
      {
        type: 'simple-words',
        content: `☀️ pray    prep    prim    prod    pram
🌙 price    pride    print    prize    prove`,
        instructions: 'Partner Reading: PR blend words - blend P and R smoothly'
      },
      {
        type: 'tricky-words',
        content: `☀️ practice    problem    surprise    April
🌙 appropriate    expression    appreciate    improvement`,
        instructions: 'Partner Reading: PR in different places - listen carefully'
      }
    ],
    targetWords: ['pray', 'prep', 'prim', 'prod', 'price', 'pride', 'print', 'prize'],
    soundFocus: 'PR consonant blend recognition'
  },
  {
    id: 'focus-tr',
    sound: 'tr',
    title: 'The TR Blend',
    description: 'Learning the TR beginning blend',
    image: '🚂', // Train
    practices: [
      {
        type: 'sound-recognition',
        content: `☀️ TR blends T and R together like train! 🚂 T-R = TR!
🌙 TR blends T and R together like train! 🚂 T-R = TR!`,
        instructions: 'Partner Reading: Say "T" then "R" quickly together - "TR"'
      },
      {
        type: 'sound-mixing',
        content: `☀️ tr  t  r  tr  s  tr  a  tr  p  tr  i  tr
🌙 tr  n  tr  m  tr  o  tr  e  tr  u  tr`,
        instructions: 'Partner Reading: Blend T and R sounds smoothly'
      },
      {
        type: 'simple-words',
        content: `☀️ trap    trip    trim    trod    tram
🌙 train    truck    track    trade    trust`,
        instructions: 'Partner Reading: TR blend words - blend T and R together'
      },
      {
        type: 'tricky-words',
        content: `☀️ trouble    triangle    country    central
🌙 nutrition    electric    attract    instruction`,
        instructions: 'Partner Reading: TR in different positions in words'
      }
    ],
    targetWords: ['trap', 'trip', 'trim', 'trod', 'train', 'truck', 'track', 'trade'],
    soundFocus: 'TR consonant blend recognition'
  }
];