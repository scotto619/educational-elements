// components/curriculum/literacy/FluencyPractice.js
// FLUENCY PRACTICE - READING PASSAGES FOR ALL SPELLING LEVELS
import React, { useState, useEffect } from 'react';

// ===============================================
// READING PASSAGES DATA STRUCTURE
// ===============================================
const READING_PASSAGES = [
  // LEVEL 1.1 - Simple CVC (Basic consonant-vowel-consonant patterns)
  {
    id: "1.1",
    level: "Level 1.1 - Simple CVC",
    spellingFocus: "Basic consonant-vowel-consonant patterns",
    targetWords: ["in", "at", "it", "an", "sit", "sat"],
    texts: [
      {
        type: "narrative",
        title: "Cat and Rat",
        wordCount: 52,
        content: `Cat sat on a mat. Rat sat in a hat. Cat can sit. Rat can sit. Cat is at the mat. Rat is in the hat. Cat and Rat sit. It is fun. Cat sat. Rat sat. The cat sat on the mat at the top.`
      },
      {
        type: "informational",
        title: "Animals Sit",
        wordCount: 48,
        content: `Animals can sit. A cat can sit on a mat. A rat can sit in a hat. Animals sit at home. Animals sit and rest. It is good for animals to sit. Cats sit. Rats sit. Animals need to sit.`
      },
      {
        type: "persuasive",
        title: "Sit and Rest",
        wordCount: 45,
        content: `You need to sit! Sit on a mat. Sit and rest. It is good to sit. Sit at home. Sit and read. Sit with a cat. Sitting is fun. Sit every day. Everyone should sit and rest.`
      },
      {
        type: "poetry",
        title: "Sitting Song",
        wordCount: 40,
        content: `Sit, sit, sit on a mat,\nSit, sit, sit with a cat.\nSit, sit, it is fun,\nSit, sit, when day is done.\nSat, sat, sat on the mat,\nSat, sat, sat with the cat.`
      }
    ]
  },

  // LEVEL 2.1 - Consonant Digraphs (Advanced consonant combinations)
  {
    id: "2.1",
    level: "Level 2.1 - Consonant Digraphs",
    spellingFocus: "Advanced consonant combinations",
    targetWords: ["drink", "thank", "shrink", "thick", "shack", "chick", "quack", "quick", "queen", "quilt"],
    texts: [
      {
        type: "narrative",
        title: "The Queen's Quilt",
        wordCount: 156,
        content: `The queen lived in a thick castle. She had a beautiful quilt on her bed. One day, a quick chick came to visit. The chick could quack very loudly. "Thank you for visiting," said the queen. The chick wanted to drink some water from the royal pond. The queen was happy to share. They sat together on the soft quilt and watched the water shrink in the pond as other animals came to drink. The chick quacked a happy song. The queen smiled and said thank you for the wonderful visit. From that day on, the quick chick visited the queen every week. They became the best of friends, sharing stories and drinking tea together on the thick, warm quilt.`
      },
      {
        type: "informational",
        title: "Birds and Their Sounds",
        wordCount: 142,
        content: `Many birds make different sounds. Chicks quack when they are young. Ducks also quack when they swim. Some birds drink water very quickly. Birds need to drink water every day to stay healthy. Their beaks help them drink from ponds and streams. Baby birds are often thick and fluffy. Mother birds thank their babies by feeding them. Birds can shrink down when they sleep. They make their bodies small and thick to stay warm. Different birds make quick movements when they fly. Some birds build thick nests to keep their eggs safe. Thank you, birds, for all the beautiful sounds you make! Next time you see a bird, watch how it drinks water.`
      },
      {
        type: "persuasive",
        title: "Thank Your Teacher",
        wordCount: 138,
        content: `You should always thank your teacher! Teachers work very hard every day. They help you learn to read quick stories. They show you how to write thick letters. Teachers drink coffee to stay awake and help you learn. When you shrink back in your chair, teachers help you sit up straight. They quack... I mean speak loudly so everyone can hear. Teachers are like a queen or king in the classroom. They make learning as warm as a thick quilt. Please remember to thank your teacher today. Say thank you when they help you. Quick thanks make teachers happy. Thank you, teachers, for all you do! You should drink water and rest, but keep teaching us amazing things every single day.`
      },
      {
        type: "poetry",
        title: "The Quick Duck's Song",
        wordCount: 96,
        content: `Quack, quack goes the duck so quick,\nThank you, pond, your water's thick.\nDrink, drink, the duck will say,\nShrink away at end of day.\n\nChick, chick, follows mother duck,\nQuack, quack with a bit of luck.\nThick and fluffy, yellow bright,\nQuilt-like feathers, soft and light.\n\nThank the pond and thank the sun,\nQuick adventures, so much fun!\nDrink the water, quack your song,\nThick together, we belong.`
      }
    ]
  },

  // LEVEL 3.1 - I-E & ICE (Long i patterns and ice endings)
  {
    id: "3.1",
    level: "Level 3.1 - I-E & ICE",
    spellingFocus: "Long i patterns and ice endings",
    targetWords: ["while", "smile", "knife", "plate", "skate", "whale", "lace", "pace", "trace", "mice", "dice", "rice"],
    texts: [
      {
        type: "narrative",
        title: "The Mice and the Rice",
        wordCount: 178,
        content: `While the family slept, three mice came to the kitchen. They could smell rice on a white plate near the window. The first mouse had a big smile as he looked at the feast. "We can trace a path to that plate," he whispered. The second mouse moved at a quick pace toward the counter. The third mouse was careful to slice the rice with his tiny knife-like teeth. While they ate, they had to be quiet as mice. Suddenly, they heard footsteps! The mice scattered and ran at a fast pace back to their hiding place. One mouse dropped a grain of rice while running. "Next time, we'll use dice to see who gets the biggest share," said the first mouse with a smile. The mice learned to work together while sharing their midnight snacks. They would always remember to move at a careful pace and smile while enjoying their rice dinners together.`
      },
      {
        type: "informational",
        title: "Ice and Winter Sports",
        wordCount: 165,
        content: `Ice forms when water gets very cold. While winter arrives, people enjoy many ice sports. Ice skating is popular because you can glide at any pace you like. Skaters trace beautiful patterns while moving across the ice. Hockey players skate at a fast pace while chasing the puck. Figure skaters smile while performing jumps and spins. Some people like to slice through ice while ice fishing. While fishing, they cut holes with a sharp knife. Ice hockey players wear protective gear while they play. Dice games are sometimes played while waiting for ice to freeze on outdoor rinks. Rice can be eaten hot while watching winter sports. Whales migrate while ice forms in cold ocean waters. While some animals sleep during winter, others stay active on the ice. Remember to smile while enjoying winter activities, but always be safe on ice surfaces.`
      },
      {
        type: "persuasive",
        title: "Smile While You Learn",
        wordCount: 152,
        content: `You should smile while you learn new things! Learning is like using dice - you never know what amazing facts you'll discover. While reading, trace each word with your finger at your own pace. Rice becomes more interesting when you smile while learning about how it grows. Even small mice can teach us about working together while solving problems. While some tasks might seem as sharp as a knife, a smile makes everything easier. Skate through difficult homework while keeping a positive attitude. While whales swim in the ocean, you can swim through books with a smile. Place your worries aside like putting food on a plate, then smile while you tackle each challenge. While learning takes practice, your smile will help you trace the path to success. So remember: smile while you read, smile while you write, and smile while you discover new and exciting things every single day.`
      },
      {
        type: "poetry",
        title: "While I Smile",
        wordCount: 124,
        content: `While I smile and while I play,\nRice and dice come out to stay.\nTrace the patterns, set the pace,\nMice are dancing with such grace.\n\nWhile the whale swims in the sea,\nSkate and slice so carefully.\nLace up boots and grab the knife,\nSmile brings joy to every life.\n\nWhile the plate sits on the table,\nMice tell stories, fact and fable.\nDice will roll and rice will grow,\nSmile while learning all we know.\n\nWhile we trace each line with care,\nSmiles and laughter fill the air.\nPace yourself but never stop,\nWhile you smile, you'll reach the top!`
      }
    ]
  },

  // LEVEL 4.1 - Soft C (c making s sound in city, circle)
  {
    id: "4.1",
    level: "Level 4.1 - Soft C",
    spellingFocus: "c making s sound in city, circle",
    targetWords: ["once", "sentence", "pounce", "palace", "chance", "silence", "city", "circle", "cement", "circus", "fancy", "cellar"],
    texts: [
      {
        type: "narrative",
        title: "The Palace in the City",
        wordCount: 189,
        content: `Once upon a time, there was a magnificent palace in the center of the city. The palace had fancy decorations and was built from strong cement. In the cellar below, there lived a cat who loved to pounce on mice. Every day, the cat would circle around the palace gardens in complete silence. The king who lived in the palace gave the cat a chance to perform at the royal circus. The cat practiced jumping through circles of fire and learned to balance on cement blocks. One sentence the king always remembered was "Give everyone a chance to shine." The fancy circus performance was held in the city square. People came from far and wide to see the amazing cat pounce through hoops. The silence was broken only by gasps of amazement. After the show, the cat returned to the palace cellar, proud of its performance. The king smiled and said, "Once again, you have made our city proud with your fancy tricks!"`
      },
      {
        type: "informational",
        title: "Building with Cement",
        wordCount: 171,
        content: `Cement is an important building material used in every city around the world. Once cement is mixed with water, it becomes very strong. Workers pounce on the chance to use cement for building projects. In fancy buildings and simple homes, cement helps create strong foundations. The circus often uses cement platforms for performances. Palace walls are sometimes made with cement to last for centuries. In the city, cement sidewalks help people walk safely. Workers pour cement in a circle to make round structures. Sometimes there is silence while cement dries and hardens. Each sentence in building plans must mention cement amounts carefully. Cellar walls need cement to stay dry and strong. People get one chance to pour cement correctly before it hardens. Circle back to check cement work once it begins to set. Fancy buildings use special types of cement for decoration. Remember, cement work requires patience and silence while it cures properly.`
      },
      {
        type: "persuasive",
        title: "Visit Our City",
        wordCount: 156,
        content: `You should visit our amazing city! Once you arrive, you'll see why it's so special. Our fancy palace has tours every day - don't miss your chance to see inside! The city center has a beautiful cement fountain where people gather in a circle. Experience the silence of our peaceful parks, then pounce on the opportunity to visit our world-famous circus. Each sentence I write about our city is true - we have the best attractions! Walk through our fancy shopping district and see the palace from every angle. The cement walkways make it easy to circle around all the sights. Once you visit our circus, you'll want to come back again and again. Give yourself a chance to explore the palace cellar museum. The fancy restaurants in our city serve food fit for royalty. Don't wait in silence - book your trip to our city today! Once you visit, you'll understand why everyone loves our beautiful city.`
      },
      {
        type: "poetry",
        title: "City Circle Song",
        wordCount: 132,
        content: `Once upon a time in a city so bright,\nA palace stood tall in the morning light.\nWith fancy cement and walls so thick,\nA circus performed every magic trick.\n\nIn silence they moved in a perfect circle,\nWhile artists would pounce and leap and hurdle.\nThe chance to see shows in the city square,\nBrought people from everywhere to stare.\n\nEach sentence spoken, each word so clear,\nThe fancy performers brought such cheer.\nFrom cellar to tower, the palace stood proud,\nWhile circus acts thrilled the gathering crowd.\n\nOnce more the city will shine tonight,\nWith cement paths glowing in moonlight.\nThe chance to dream in this city so free,\nMakes fancy memories for you and me.`
      }
    ]
  },

  // LEVEL 1.2 - CVC Practice (CVC patterns with p, t, n)
  {
    id: "1.2",
    level: "Level 1.2 - CVC Practice",
    spellingFocus: "CVC patterns with p, t, n",
    targetWords: ["pat", "tap", "nap", "tin", "pin", "pit"],
    texts: [
      {
        type: "narrative",
        title: "Pat's Nap",
        wordCount: 58,
        content: `Pat was tired. Pat needed a nap. Pat went to her bed. She put her head on the soft pillow. Pat had a tin cup by her bed. There was a pin on her dress. Pat took a little nap. The pin fell off. The tin cup sat still. Pat woke up happy after her nap.`
      },
      {
        type: "informational",
        title: "Things Made of Tin",
        wordCount: 55,
        content: `Tin is a type of metal. People make many things from tin. A tin can holds food. A tin cup holds water. Some people have a tin pot for cooking. Tin is strong but light. You can tap on tin and hear a sound. Tin does not break like glass. Tin keeps food fresh.`
      },
      {
        type: "persuasive",
        title: "Take a Nap",
        wordCount: 52,
        content: `You should take a nap every day! A nap helps you feel better. Pat your pillow and lie down. Put your head on something soft. Even a short nap is good for you. After a nap, you can think better. Take a nap when you feel tired. Naps help you grow big and strong.`
      },
      {
        type: "poetry",
        title: "Tap, Tap, Nap",
        wordCount: 48,
        content: `Tap, tap on the tin,\nPat has a big grin.\nPin goes in the pit,\nTime for her to sit.\n\nNap, nap in the sun,\nPat's day is now done.\nTin cup by her side,\nDreams where she will glide.`
      }
    ]
  },

  // LEVEL 2.2 - Long A Patterns (Various long a spellings)
  {
    id: "2.2",
    level: "Level 2.2 - Long A Patterns",
    spellingFocus: "Various long a spellings",
    targetWords: ["away", "stay", "today", "delay", "again", "drain", "waist", "faith", "strain", "paint"],
    texts: [
      {
        type: "narrative",
        title: "The Artist's Day",
        wordCount: 167,
        content: `Today was a special day for Maya, the young artist. She wanted to paint a beautiful picture, but rain began to fall. "I won't let this delay my plans," she said with faith in her heart. Maya decided to stay inside and paint by the window. She put on her old apron around her waist to protect her clothes. The rain continued to drain from the roof outside. Maya began to paint again and again until her picture was perfect. She had to strain her eyes to see the small details. "I will stay focused today," she told herself. The painting showed children playing in the sunshine, far away from any storm clouds. When the rain stopped, Maya's mother came to see the artwork. "This is wonderful!" she said. Maya smiled, knowing that her faith in staying determined had helped her create something beautiful today. She would paint again tomorrow.`
      },
      {
        type: "informational",
        title: "How Paint is Made",
        wordCount: 149,
        content: `Paint is made from several different materials mixed together. Today, most paint contains special chemicals that help it stay bright for many years. Workers must strain the paint to remove any lumps. They mix it again and again until it becomes smooth. Paint factories have special systems to drain waste water safely. Workers wear protective clothes around their waist to stay clean. The process requires faith in following exact recipes. Some paints can cause a delay in drying if the weather is too humid. Artists often stay patient while waiting for paint to dry completely. Modern paint won't drain away easily when it rains. Away from sunlight, paint can last for decades. Today's paint technology helps it stay fresh much longer than old-style paints. Quality paint requires careful work and attention to detail every step of the way.`
      },
      {
        type: "persuasive",
        title: "Don't Give Up Today",
        wordCount: 143,
        content: `You should never give up on your dreams today! Sometimes life can strain your patience, but stay strong. When problems try to drain your energy away, have faith in yourself. Don't let anything delay your progress toward your goals. Today is the perfect time to try again and again. Stay focused on what matters most to you. Paint a picture of your future success in your mind. Keep your goals close to your heart, like wearing a belt around your waist. Don't let negativity drain away your positive thoughts. Stay determined, even when others walk away. Today you can start fresh - don't delay any longer! Have faith that you can accomplish anything you set your mind to. Remember, every expert was once a beginner who chose to stay committed and try again. Today is your day to shine!`
      },
      {
        type: "poetry",
        title: "Stay and Play Today",
        wordCount: 108,
        content: `Today is the day to stay and play,\nDon't let your dreams just drain away.\nPaint the sky with colors bright,\nStay with faith throughout the night.\n\nAgain and again we'll try our best,\nNo delay, no time to rest.\nStrain to reach the highest star,\nStay determined, you'll go far.\n\nWaist-deep in dreams that shine so bright,\nFaith will guide us through the night.\nAway from worry, away from fear,\nToday brings hope and joy so dear.\n\nDrain the doubt from every heart,\nStay together, never part.\nPaint tomorrow with today,\nFaith and hope will light the way.`
      }
    ]
  },

  // LEVEL 3.2 - A-E & AGE (Long a patterns and age endings)
  {
    id: "3.2",
    level: "Level 3.2 - A-E & AGE",
    spellingFocus: "Long a patterns and age endings",
    targetWords: ["chase", "blaze", "quake", "brave", "cute", "use", "fuse", "page", "cage", "rage", "stage", "huge"],
    texts: [
      {
        type: "narrative",
        title: "The Brave Hero's Adventure",
        wordCount: 184,
        content: `On the stage of the huge outdoor theater, a brave young actor prepared for his biggest performance. The story would take place during an earthquake that would shake the village. The actor had to chase the villain across the stage while flames would blaze from special effects. His character needed to be brave enough to rescue a cute puppy trapped in a cage. The audience would use their imagination to picture the huge quake shaking the ground. In one scene, the hero had to defuse a pretend bomb by cutting the right fuse. The villain's rage was clear as he tried to escape. Page after page of the script showed the brave hero overcoming each challenge. The cute puppy actor wagged its tail from inside the safe prop cage. When the final scene arrived, the audience cheered as the brave hero saved the day. The huge crowd gave a standing ovation. The young actor felt proud to use his talents on such an important stage. It was truly a performance to remember.`
      },
      {
        type: "informational",
        title: "Earthquakes and Safety",
        wordCount: 172,
        content: `An earthquake, or quake, happens when the ground shakes suddenly. Scientists use special tools to measure how huge an earthquake might be. During a quake, it's important to be brave but also smart about safety. Never chase after falling objects or try to use elevators during shaking. If you're on a stage or platform, move to a safe location immediately. Don't rage or panic - stay calm and think clearly. Follow each page of your family's emergency plan carefully. Sometimes earthquakes can cause fires to blaze, so know how to turn off gas lines and electrical fuses. If you have a cute pet in a cage, make sure the cage is secure and won't tip over. Use sturdy furniture to hide under during the shaking. The huge importance of earthquake preparedness cannot be overstated. Brave families practice earthquake drills regularly. Page through safety guides and use them to create your own emergency plan. Remember, preparation today can save lives during a future quake.`
      },
      {
        type: "persuasive",
        title: "Be Brave and Try",
        wordCount: 158,
        content: `You should be brave and try new things! Don't let fear cage you in like a cute animal hiding from the world. Use every opportunity to chase your dreams with determination. Even if you feel rage when things don't go perfectly, stay brave and keep trying. Each page you turn in your life's story should show courage and growth. Don't let setbacks cause you to quake with fear - use them as learning experiences instead. Be brave enough to step onto the stage of life and show your talents. Chase away negative thoughts that try to blaze through your confidence. Use your imagination to see the huge possibilities ahead of you. It's brave to ask for help when you need it. Don't let pride cage your potential for growth. Each day gives you a new page to write your story. Be brave, stay focused, and use every chance to become the amazing person you're meant to be. The stage is yours!`
      },
      {
        type: "poetry",
        title: "Brave and Free",
        wordCount: 124,
        content: `Be brave, be bold, turn every page,\nDon't let fear keep you in a cage.\nChase your dreams both night and day,\nUse your talents in every way.\n\nHuge adventures wait for you,\nBrave and strong in all you do.\nQuake with excitement, not with fear,\nStage your success year after year.\n\nBlaze a trail that's yours alone,\nBrave hearts reap what they have sown.\nRage against what holds you back,\nUse your strength to stay on track.\n\nCute or tough, young or old,\nBrave stories deserve to be told.\nFuse your dreams with hard work true,\nHuge rewards are waiting for you.`
      }
    ]
  },

  // LEVEL 4.2 - Silent Letters (Silent letters in doubt, write, thumb)
  {
    id: "4.2",
    level: "Level 4.2 - Silent Letters",
    spellingFocus: "Silent letters in doubt, write, thumb",
    targetWords: ["doubt", "debt", "plumber", "climbed", "thumb", "lamb", "write", "wrong", "wrist", "wrap", "wrench", "wrote"],
    texts: [
      {
        type: "narrative",
        title: "The Plumber's Challenge",
        wordCount: 192,
        content: `Without a doubt, Jake was the best young plumber in town. He climbed under houses and never once complained about the dirt on his thumb. Yesterday, he wrote in his work diary about a difficult job he had completed. A customer had tried the wrong approach to fix their pipes, which put them in debt for unnecessary repairs. Jake arrived with his wrench and toolkit, ready to wrap the damaged pipes properly. He hurt his wrist while tightening a stubborn bolt, but didn't let that stop him. The customer watched as Jake wrote down each step of the repair process. "There's no doubt you know what you're doing," said the grateful homeowner. Jake had climbed through crawl spaces since he was young, learning from his father. He wrote detailed notes about each job to help other plumbers avoid the wrong methods. When he finished, Jake wrapped his tools carefully and wrote up the final bill. The customer had no doubt they had chosen the right plumber for the job. Jake drove away, proud of another successful repair.`
      },
      {
        type: "informational",
        title: "Writing Through History",
        wordCount: 175,
        content: `Throughout history, people have found many ways to write and record information. Ancient people wrote on clay tablets using their thumb to press symbols into soft clay. They climbed mountains to carve messages on stone walls that still exist today. Some cultures wrote on animal skins, like lamb hide, which they would wrap carefully to preserve. Without a doubt, the invention of paper changed how people could write and share ideas. Early writers often hurt their wrist from holding heavy carving tools for hours. When metal tools arrived, people could use a wrench-like device to press letters into metal. Many ancient writing systems seem wrong to us now, but they worked perfectly for their time. People climbed great heights to write messages on pyramid walls. The debt we owe to early writers cannot be measured. They wrote despite having the wrong tools by today's standards. Some writing was wrapped in cloth and buried for future generations to find. There's no doubt that writing has shaped human history.`
      },
      {
        type: "persuasive",
        title: "Learn to Write Well",
        wordCount: 161,
        content: `You should learn to write well - there's no doubt about it! Writing is not a debt you owe to anyone else; it's a gift you give yourself. Don't doubt your ability to improve with practice. When you feel you've written something wrong, don't wrap it up and throw it away. Instead, use that experience to climb toward better writing skills. A plumber uses a wrench to fix pipes, but you use a pen to fix ideas and make them clear. Write with your whole hand, not just your thumb. If your wrist gets tired, take breaks but keep practicing. Don't doubt that you can become a great writer with effort. Climb over any obstacles that make writing seem too difficult. There's no doubt that good writing takes time to develop. Don't be wrong in thinking that some people are just "born writers" - everyone can learn! Write every day, and wrap your thoughts in clear, simple words. Without doubt, writing well will help you succeed in everything you do.`
      },
      {
        type: "poetry",
        title: "Write Without Doubt",
        wordCount: 136,
        content: `Write, write with all your might,\nNever doubt your words are right.\nClimbed the mountain, reached the top,\nThumb and wrist will never stop.\n\nWrench away the fear and doubt,\nWrite what life is all about.\nWrap your thoughts in words so true,\nWrite the dreams that live in you.\n\nLamb and plumber, young and old,\nEveryone has stories told.\nWrote the words with careful hand,\nClimbed to where few people stand.\n\nDebt to pay? No, gift to give,\nWrite the way you want to live.\nWrong or right, just start today,\nWrite your thoughts and find your way.\n\nThumb through pages, old and new,\nWrite the words that speak of you.`
      }
    ]
  }
];

// ===============================================
// TEXT TYPE CONFIGURATIONS
// ===============================================
const TEXT_TYPES = [
  { 
    id: "narrative", 
    name: "Narrative", 
    icon: "📖", 
    color: "bg-blue-500", 
    description: "Stories with characters, setting, and plot" 
  },
  { 
    id: "informational", 
    name: "Information Text", 
    icon: "📊", 
    color: "bg-green-500", 
    description: "Factual texts that inform and explain" 
  },
  { 
    id: "persuasive", 
    name: "Persuasive", 
    icon: "💭", 
    color: "bg-orange-500", 
    description: "Texts that convince and persuade" 
  },
  { 
    id: "poetry", 
    name: "Poetry", 
    icon: "🎭", 
    color: "bg-purple-500", 
    description: "Poems, rhymes, and verse" 
  }
];

// ===============================================
// MAIN FLUENCY PRACTICE COMPONENT
// ===============================================
const FluencyPractice = ({ 
  showToast = () => {}, 
  students = [], 
  saveData = () => {}, 
  loadedData = {} 
}) => {
  const [groups, setGroups] = useState(loadedData?.fluencyGroups || []);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showTextBrowser, setShowTextBrowser] = useState(false);
  const [viewingText, setViewingText] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTextType, setSelectedTextType] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [displayingText, setDisplayingText] = useState(null);

  // Initialize groups if empty
  useEffect(() => {
    if (loadedData?.fluencyGroups && loadedData.fluencyGroups.length > 0) {
      setGroups(loadedData.fluencyGroups);
      setHasUnsavedChanges(false);
      console.log('📚 Loaded fluency groups from Firebase:', loadedData.fluencyGroups);
    } else if (loadedData !== undefined && groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Group 1", color: "bg-blue-500", students: [], assignedTexts: [] },
        { id: 2, name: "Group 2", color: "bg-green-500", students: [], assignedTexts: [] },
        { id: 3, name: "Group 3", color: "bg-purple-500", students: [], assignedTexts: [] }
      ];
      setGroups(defaultGroups);
      setHasUnsavedChanges(true);
      console.log('📚 Created default fluency groups');
    }
  }, [loadedData]);

  // Update groups when loadedData changes
  useEffect(() => {
    if (loadedData?.fluencyGroups && 
        Array.isArray(loadedData.fluencyGroups) && 
        loadedData.fluencyGroups.length > 0 &&
        JSON.stringify(loadedData.fluencyGroups) !== JSON.stringify(groups)) {
      setGroups(loadedData.fluencyGroups);
      setHasUnsavedChanges(false);
      console.log('🔄 Updated fluency groups from Firebase data change');
    }
  }, [loadedData?.fluencyGroups]);

  // Clean up groups when students change
  useEffect(() => {
    if (groups.length > 0 && students.length > 0) {
      const studentIds = students.map(s => s.id);
      let hasChanges = false;
      
      const cleanedGroups = groups.map(group => {
        const validStudents = group.students.filter(student => studentIds.includes(student.id));
        if (validStudents.length !== group.students.length) {
          hasChanges = true;
          return { ...group, students: validStudents };
        }
        return group;
      });
      
      if (hasChanges) {
        console.log('🧹 Cleaned up removed students from fluency groups');
        setGroups(cleanedGroups);
        setHasUnsavedChanges(true);
      }
    }
  }, [students]);

  // Save function
  const saveGroups = () => {
    try {
      if (!saveData || typeof saveData !== 'function') {
        console.error('❌ saveData function not available');
        return;
      }

      if (!groups || groups.length === 0) {
        console.error('❌ No groups to save');
        return;
      }
      
      const existingToolkitData = loadedData || {};
      const updatedToolkitData = {
        ...existingToolkitData,
        fluencyGroups: groups,
        lastSaved: new Date().toISOString()
      };
      
      saveData({ toolkitData: updatedToolkitData });
      setHasUnsavedChanges(false);
      console.log('💾 Fluency groups saved to Firebase successfully:', groups);
      
    } catch (error) {
      console.error('❌ Error saving fluency groups:', error);
    }
  };

  // Update groups locally
  const updateGroups = (updatedGroups) => {
    if (!Array.isArray(updatedGroups)) {
      console.error('❌ Invalid groups data - must be array');
      return;
    }
    setGroups(updatedGroups);
    setHasUnsavedChanges(true);
    console.log('📝 Groups updated locally, unsaved changes flagged');
  };

  const addGroup = () => {
    if (groups.length >= 5) return;
    
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    const newGroup = {
      id: Date.now(),
      name: `Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedTexts: []
    };
    updateGroups([...groups, newGroup]);
  };

  const removeGroup = (groupId) => {
    updateGroups(groups.filter(g => g.id !== groupId));
  };

  const updateGroupName = (groupId, newName) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    ));
  };

  const assignStudentToGroup = (studentId, groupId) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.id === groupId 
        ? [...group.students.filter(s => s.id !== studentId), students.find(s => s.id === studentId)]
        : group.students.filter(s => s.id !== studentId)
    }));
    updateGroups(updatedGroups);
  };

  const assignTextsToGroup = (groupId, textIds) => {
    updateGroups(groups.map(g => 
      g.id === groupId ? { ...g, assignedTexts: textIds } : g
    ));
  };

  const printTexts = (textIds) => {
    const textsToprint = [];
    textIds.forEach(textId => {
      const [levelId, textType] = textId.split('-');
      const passage = READING_PASSAGES.find(p => p.id === levelId);
      if (passage) {
        const text = passage.texts.find(t => t.type === textType);
        if (text) {
          textsToprint.push({ ...text, passage });
        }
      }
    });
    
    if (textsToprint.length === 0) return;
    
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    
    const generateTextCopies = (text, passage) => {
      let copiesHtml = '';
      for (let i = 0; i < 6; i++) {
        copiesHtml += `
          <div class="text-copy">
            <div class="text-header">
              <div class="text-title">${text.title}</div>
              <div class="text-info">
                <span class="level">${passage.level}</span> | 
                <span class="type">${text.type.charAt(0).toUpperCase() + text.type.slice(1)}</span> | 
                <span class="word-count">${text.wordCount} words</span>
              </div>
              <div class="spelling-focus">${passage.spellingFocus}</div>
            </div>
            <div class="text-content">${text.content.replace(/\n/g, '<br>')}</div>
            <div class="target-words">
              <strong>Focus Words:</strong> ${passage.targetWords.join(', ')}
            </div>
          </div>
        `;
      }
      return copiesHtml;
    };
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Fluency Practice Texts - 6 Copies</title>
          <style>
            body { 
              font-family: Georgia, serif; 
              margin: 10px; 
              padding: 0;
              font-size: 14px;
              line-height: 1.6;
            }
            .text-page {
              page-break-after: always;
              margin-bottom: 20px;
            }
            .text-page:last-child {
              page-break-after: auto;
            }
            .copies-container { 
              display: grid; 
              grid-template-columns: repeat(2, 1fr); 
              grid-template-rows: repeat(3, 1fr);
              gap: 15px; 
              width: 100%;
              height: 95vh;
            }
            .text-copy { 
              border: 2px solid #333; 
              padding: 12px;
              break-inside: avoid;
              display: flex;
              flex-direction: column;
            }
            .text-header {
              border-bottom: 2px solid #666;
              margin-bottom: 10px;
              padding-bottom: 8px;
            }
            .text-title { 
              font-weight: bold; 
              text-align: center; 
              font-size: 16px;
              margin-bottom: 4px;
            }
            .text-info {
              text-align: center;
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            .spelling-focus {
              font-style: italic;
              text-align: center;
              font-size: 11px;
              color: #888;
            }
            .text-content { 
              flex-grow: 1;
              font-size: 14px;
              line-height: 1.8;
              margin-bottom: 10px;
              text-align: justify;
            }
            .target-words {
              font-size: 11px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 6px;
              text-align: center;
            }
            @media print {
              body { margin: 5px; }
              .copies-container { 
                gap: 10px; 
                height: 97vh;
              }
              .text-copy { 
                padding: 8px; 
              }
            }
          </style>
        </head>
        <body>
          ${textsToprint.map(textData => `
            <div class="text-page">
              <div class="copies-container">
                ${generateTextCopies(textData, textData.passage)}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const getAssignedStudents = () => {
    return groups.reduce((assigned, group) => [...assigned, ...group.students], []);
  };

  const unassignedStudents = students.filter(student => 
    !getAssignedStudents().some(assigned => assigned?.id === student.id)
  );

  // Get available texts for selection
  const getAvailableTexts = () => {
    const texts = [];
    READING_PASSAGES.forEach(passage => {
      passage.texts.forEach(text => {
        texts.push({
          id: `${passage.id}-${text.type}`,
          displayName: `${passage.level} - ${text.title} (${text.type})`,
          passage: passage,
          text: text
        });
      });
    });
    return texts;
  };

  // Get text for display
  const getDisplayText = () => {
    if (!displayingText) return null;
    
    const [levelId, textType] = displayingText.split('-');
    const passage = READING_PASSAGES.find(p => p.id === levelId);
    if (!passage) return null;
    
    const text = passage.texts.find(t => t.type === textType);
    if (!text) return null;
    
    return { text, passage };
  };

  const displayText = getDisplayText();

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedTexts.length > 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">📖 Today's Reading</h1>
          <button
            onClick={() => setIsPresentationMode(false)}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl text-xl font-bold hover:bg-gray-700"
          >
            Exit Presentation
          </button>
        </div>

        <div className={`grid gap-4 ${
          activeGroups.length <= 3 
            ? activeGroups.length === 1 ? 'grid-cols-1' : activeGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {activeGroups.length > 3 ? (
            <div className="grid grid-cols-4 gap-4">
              {activeGroups.map(group => (
                <div key={group.id} className="bg-white rounded-xl shadow-lg p-4">
                  <div className={`${group.color} text-white text-center py-3 rounded-lg mb-4`}>
                    <h2 className="text-xl font-bold">{group.name}</h2>
                    <p className="text-sm opacity-90">{group.students.length} students</p>
                  </div>

                  {group.assignedTexts.map(textId => {
                    const [levelId, textType] = textId.split('-');
                    const passage = READING_PASSAGES.find(p => p.id === levelId);
                    const text = passage?.texts.find(t => t.type === textType);
                    if (!text || !passage) return null;

                    return (
                      <div key={textId} className="mb-4 text-xs">
                        <h3 className="font-bold text-center mb-2 text-gray-800">{text.title}</h3>
                        <p className="text-center mb-2 text-blue-600 italic">{passage.level}</p>
                        <div className="bg-gray-50 p-2 rounded text-gray-700 max-h-24 overflow-hidden">
                          {text.content.substring(0, 120)}...
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            activeGroups.map(group => (
              <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
                <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                  <h2 className="text-4xl font-bold">{group.name}</h2>
                  <p className="text-2xl opacity-90">{group.students.length} students</p>
                </div>

                {group.assignedTexts.map(textId => {
                  const [levelId, textType] = textId.split('-');
                  const passage = READING_PASSAGES.find(p => p.id === levelId);
                  const text = passage?.texts.find(t => t.type === textType);
                  if (!text || !passage) return null;

                  return (
                    <div key={textId} className="mb-6">
                      <h3 className="text-3xl font-bold text-center mb-2 text-gray-800">{text.title}</h3>
                      <p className="text-lg text-center mb-4 text-blue-600 italic">{passage.level} - {text.type}</p>
                      <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
                        <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {text.content}
                        </div>
                      </div>
                      <div className="mt-3 text-center text-sm text-gray-600">
                        <strong>Focus Words:</strong> {passage.targetWords.join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">📖</span>
              Fluency Practice
            </h1>
            <p className="text-lg opacity-90">Reading passages aligned with spelling levels - {READING_PASSAGES.length} levels available</p>
            {loadedData?.fluencyGroups && loadedData.fluencyGroups.length > 0 && !hasUnsavedChanges && (
              <p className="text-sm opacity-75 mt-1">✅ Groups loaded from your saved data</p>
            )}
            {hasUnsavedChanges && (
              <p className="text-sm opacity-75 mt-1">⚠️ You have unsaved changes</p>
            )}
          </div>
          <div className="flex gap-3">
            {hasUnsavedChanges && (
              <button
                onClick={saveGroups}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2 animate-pulse"
              >
                💾 Save Changes
              </button>
            )}
            <button
              onClick={() => setShowStudentAssignment(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              👥 Assign Students
            </button>
            <button
              onClick={() => setShowTextBrowser(!showTextBrowser)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              📚 Browse Texts
            </button>
            <button
              onClick={() => setIsPresentationMode(true)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              🎭 Presentation Mode
            </button>
          </div>
        </div>
      </div>

      {/* Text Display Modal */}
      {displayText && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{displayText.text.title}</h2>
                  <p className="text-xl opacity-90">{displayText.passage.level} - {displayText.text.type.charAt(0).toUpperCase() + displayText.text.type.slice(1)}</p>
                  <p className="text-lg opacity-80">{displayText.text.wordCount} words | {displayText.passage.spellingFocus}</p>
                </div>
                <button
                  onClick={() => setDisplayingText(null)}
                  className="text-white hover:text-red-200 text-4xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 mb-6">
                <div className="text-2xl leading-relaxed text-gray-800 whitespace-pre-wrap font-serif text-center">
                  {displayText.text.content}
                </div>
              </div>

              {/* Target Words */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3 text-center">Focus Words</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {displayText.passage.targetWords.map(word => (
                    <span key={word} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-lg font-semibold">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 rounded-b-xl text-center">
              <button
                onClick={() => setDisplayingText(null)}
                className="bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-700"
              >
                Close Display
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Browser Modal */}
      {showTextBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Browse Reading Passages</h2>
                <button
                  onClick={() => {
                    setShowTextBrowser(false);
                    setViewingText(null);
                    setSelectedLevel(null);
                    setSelectedTextType(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {viewingText ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{viewingText.title}</h3>
                      <p className="text-blue-600 italic">{viewingText.passage.level} - {viewingText.type}</p>
                      <p className="text-gray-600">{viewingText.wordCount} words | {viewingText.passage.spellingFocus}</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDisplayingText(`${viewingText.passage.id}-${viewingText.type}`)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        📺 Display to Class
                      </button>
                      <button
                        onClick={() => setViewingText(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        ← Back
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap font-serif">
                      {viewingText.content}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <p className="text-sm text-gray-600">
                        <strong>Target Words:</strong> {viewingText.passage.targetWords.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : selectedLevel ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{selectedLevel.level}</h3>
                      <p className="text-blue-600 italic">{selectedLevel.spellingFocus}</p>
                    </div>
                    <button
                      onClick={() => setSelectedLevel(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to Levels
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedLevel.texts.map(text => {
                      const textType = TEXT_TYPES.find(t => t.id === text.type);
                      return (
                        <button
                          key={text.type}
                          onClick={() => setViewingText({ ...text, passage: selectedLevel })}
                          className={`p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 text-left transition-all hover:scale-105 ${textType?.color || 'bg-gray-500'} text-white`}
                        >
                          <div className="text-3xl mb-2">{textType?.icon}</div>
                          <div className="font-bold text-lg">{text.title}</div>
                          <div className="text-sm opacity-90 mb-2">{textType?.name}</div>
                          <div className="text-xs opacity-80">{text.wordCount} words</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {READING_PASSAGES.map(passage => (
                    <button
                      key={passage.id}
                      onClick={() => setSelectedLevel(passage)}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all hover:scale-105"
                    >
                      <div className="font-bold text-lg mb-2">{passage.level}</div>
                      <div className="text-sm text-blue-600 italic mb-2">{passage.spellingFocus}</div>
                      <div className="text-xs text-gray-600 mb-2">{passage.texts.length} texts available</div>
                      <div className="flex gap-1">
                        {passage.texts.map(text => {
                          const textType = TEXT_TYPES.find(t => t.id === text.type);
                          return (
                            <span key={text.type} className="text-lg" title={textType?.name}>
                              {textType?.icon}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 mb-3">👤 Unassigned Students ({unassignedStudents.length})</h3>
          <p className="text-sm text-yellow-700 mb-3">Click "Assign Students" above to quickly assign students to groups</p>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.slice(0, 5).map(student => (
              <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm font-medium">{student.firstName} {student.lastName}</span>
              </div>
            ))}
            {unassignedStudents.length > 5 && (
              <div className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm text-gray-500">+{unassignedStudents.length - 5} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groups Display */}
      <div className={`grid gap-4 ${
        groups.length === 1 ? 'grid-cols-1' :
        groups.length === 2 ? 'grid-cols-2' :
        groups.length === 3 ? 'grid-cols-3' :
        groups.length === 4 ? 'grid-cols-4' :
        'grid-cols-5'
      }`}>
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
            {/* Group Header */}
            <div className={`${group.color} text-white p-3 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                  className={`bg-transparent text-white font-bold border-none outline-none ${
                    groups.length >= 4 ? 'text-sm' : 'text-lg'
                  }`}
                />
                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-white hover:text-red-200 text-lg"
                >
                  ×
                </button>
              </div>
              <p className={`opacity-90 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                {group.students.length} students
              </p>
            </div>

            <div className={`${groups.length >= 4 ? 'p-3' : 'p-4'}`}>
              {/* Students */}
              <div className="mb-3">
                <h4 className={`font-bold text-gray-700 mb-2 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                  Students:
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {group.students.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-gray-50 p-1 rounded">
                      <span className={`${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                        {student.firstName} {student.lastName}
                      </span>
                      <button
                        onClick={() => assignStudentToGroup(student.id, null)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {group.students.length === 0 && (
                    <p className={`text-gray-500 italic ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                      No students assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Texts */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-gray-700 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                    Texts:
                  </h4>
                  <button
                    onClick={() => printTexts(group.assignedTexts)}
                    disabled={group.assignedTexts.length === 0}
                    className={`bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 ${
                      groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                    }`}
                  >
                    🖨️
                  </button>
                </div>
                
                <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                  {group.assignedTexts.map(textId => {
                    const [levelId, textType] = textId.split('-');
                    const passage = READING_PASSAGES.find(p => p.id === levelId);
                    const text = passage?.texts.find(t => t.type === textType);
                    const typeConfig = TEXT_TYPES.find(t => t.id === textType);
                    
                    if (!text || !passage) return null;

                    return (
                      <div key={textId} className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-blue-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                            {text.title}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDisplayingText(textId)}
                              className={`bg-green-500 text-white rounded hover:bg-green-600 ${
                                groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                              }`}
                              title="Display to class"
                            >
                              📺
                            </button>
                            <button
                              onClick={() => assignTextsToGroup(group.id, group.assignedTexts.filter(id => id !== textId))}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm">{typeConfig?.icon}</span>
                          <span className={`text-blue-600 italic ${groups.length >= 5 ? 'text-xs' : 'text-xs'}`}>
                            {passage.level} - {text.type} ({text.wordCount} words)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value && !group.assignedTexts.includes(e.target.value)) {
                      if (group.assignedTexts.length < 8) {
                        assignTextsToGroup(group.id, [...group.assignedTexts, e.target.value]);
                      } else {
                        showToast('Maximum 8 texts per group', 'error');
                      }
                    }
                    e.target.value = '';
                  }}
                  className={`w-full border border-gray-300 rounded p-1 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}
                  defaultValue=""
                >
                  <option value="">Add text...</option>
                  {getAvailableTexts().filter(text => !group.assignedTexts.includes(text.id)).map(text => (
                    <option key={text.id} value={text.id}>
                      {TEXT_TYPES.find(t => t.id === text.text.type)?.icon} {text.displayName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {/* Add Group Button */}
        {groups.length < 5 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center min-h-[300px]">
            <button
              onClick={addGroup}
              className="text-gray-600 hover:text-gray-800 text-center"
            >
              <div className={`mb-2 ${groups.length >= 4 ? 'text-2xl' : 'text-4xl'}`}>+</div>
              <div className={`font-bold ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>Add Group</div>
            </button>
          </div>
        )}
      </div>

      {/* Student Assignment Modal */}
      {showStudentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">👥 Assign Students to Groups</h2>
                <button
                  onClick={() => setShowStudentAssignment(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Students */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Available Students</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedStudents.map(student => (
                      <div key={student.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="flex gap-2 mt-2">
                          {groups.map(group => (
                            <button
                              key={group.id}
                              onClick={() => assignStudentToGroup(student.id, group.id)}
                              className={`${group.color} text-white text-xs px-3 py-1 rounded hover:opacity-80`}
                            >
                              → {group.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {unassignedStudents.length === 0 && (
                      <p className="text-gray-500 italic">All students are assigned to groups!</p>
                    )}
                  </div>
                </div>

                {/* Groups with Students */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Groups</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {groups.map(group => (
                      <div key={group.id} className="border rounded-lg">
                        <div className={`${group.color} text-white p-2 rounded-t-lg`}>
                          <h4 className="font-bold">{group.name} ({group.students.length})</h4>
                        </div>
                        <div className="p-2 space-y-1">
                          {group.students.map(student => (
                            <div key={student.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{student.firstName} {student.lastName}</span>
                              <button
                                onClick={() => assignStudentToGroup(student.id, null)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {group.students.length === 0 && (
                            <p className="text-gray-400 text-sm italic">No students assigned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FluencyPractice;