// components/curriculum/literacy/data/reading-comprehension-content.js
// READING COMPREHENSION CONTENT DATA - ORGANIZED BY TEXT TYPES

export const readingComprehensionContent = {
  fiction: {
    name: "Fiction Stories",
    icon: "📖",
    color: "from-purple-500 to-purple-600",
    description: "Imaginative stories with characters, settings, and plots",
    passages: [
      {
        id: "fiction_1",
        title: "The Magic Garden",
        difficulty: "beginner",
        readingLevel: "Grade 2-3",
        wordCount: 150,
        text: "Emma loved spending time in her grandmother's garden. One sunny morning, she noticed something strange. The flowers seemed to be whispering to each other! Emma crept closer and heard the roses saying, 'The little girl is kind. She waters us every day.' The sunflowers nodded their big yellow heads in agreement. 'She talks to us too,' they said. Emma gasped in surprise. 'You can really talk!' she whispered. The garden burst into gentle laughter. 'We've always been able to talk, dear Emma,' said the wise old oak tree. 'But only special people who truly love nature can hear us.' From that day on, Emma and the plants became the best of friends, sharing secrets and stories every afternoon.",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What did Emma discover about the garden?",
            options: ["The flowers were dying", "The plants could talk", "There were bugs everywhere", "It needed more water"],
            correctAnswer: 1,
            explanation: "Emma discovered that the plants in her grandmother's garden could talk to her."
          },
          {
            id: 2,
            type: "short_answer",
            question: "Why could Emma hear the plants talking when others couldn't?",
            suggestedAnswer: "Because she was special and truly loved nature, and only people who love nature can hear them.",
            keyWords: ["special", "loved nature", "kind"]
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What did the roses say about Emma?",
            options: ["She was too loud", "She was kind and watered them", "She picked too many flowers", "She didn't visit enough"],
            correctAnswer: 1,
            explanation: "The roses said Emma was kind and that she watered them every day."
          },
          {
            id: 4,
            type: "short_answer", 
            question: "How do you think Emma felt when she first heard the plants talking?",
            suggestedAnswer: "Surprised, amazed, or shocked because she gasped in surprise.",
            keyWords: ["surprised", "amazed", "shocked", "gasped"]
          }
        ],
        teachingFocus: ["Character feelings", "Fantasy vs reality", "Cause and effect", "Making inferences"],
        vocabulary: ["crept", "gasped", "agreement", "whispered", "gentle"]
      },
      {
        id: "fiction_2", 
        title: "The Brave Little Mouse",
        difficulty: "intermediate",
        readingLevel: "Grade 3-4",
        wordCount: 200,
        text: "Chester was the smallest mouse in the barn, but he had the biggest heart. While the other mice hid when the farmer's cat, Whiskers, prowled around, Chester always stood up for his friends. One stormy night, little Lucy mouse got trapped under a fallen bucket. The other mice were too frightened to help because Whiskers was nearby, watching and waiting. But Chester knew he had to act fast. He scurried across the barn floor, dodging the cat's paws, and managed to tip over the bucket. Lucy was free! However, now Chester was trapped in the corner with the angry cat blocking his escape. Just then, all the other mice realized how brave Chester had been. Together, they created a distraction, allowing Chester to escape safely. From that night on, all the mice looked up to Chester not because of his size, but because of his courage and kindness.",
        questions: [
          {
            id: 1,
            type: "multiple_choice", 
            question: "What was special about Chester compared to the other mice?",
            options: ["He was the biggest", "He was the fastest", "He was brave and had a big heart", "He was the smartest"],
            correctAnswer: 2,
            explanation: "Chester was the smallest mouse but had the biggest heart and was very brave."
          },
          {
            id: 2,
            type: "short_answer",
            question: "What problem did Lucy mouse have?",
            suggestedAnswer: "She got trapped under a fallen bucket during a stormy night.",
            keyWords: ["trapped", "bucket", "fallen"]
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "Why didn't the other mice help Lucy at first?",
            options: ["They didn't like her", "They were too frightened of the cat", "They didn't know where she was", "They were sleeping"],
            correctAnswer: 1,
            explanation: "The other mice were too frightened to help because Whiskers the cat was nearby."
          },
          {
            id: 4,
            type: "short_answer",
            question: "How did the story show that teamwork is important?",
            suggestedAnswer: "The other mice worked together to create a distraction and help Chester escape safely.",
            keyWords: ["together", "distraction", "teamwork", "help"]
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What lesson does this story teach?",
            options: ["Big animals are scary", "Size doesn't matter, courage does", "Mice are smarter than cats", "Storms are dangerous"],
            correctAnswer: 1,
            explanation: "The story teaches that size doesn't matter - courage and kindness are what make someone special."
          }
        ],
        teachingFocus: ["Character traits", "Problem and solution", "Theme identification", "Character motivation"],
        vocabulary: ["prowled", "scurried", "dodging", "distraction", "courage"]
      }
    ]
  },

  nonFiction: {
    name: "Non-Fiction Articles", 
    icon: "📰",
    color: "from-blue-500 to-blue-600",
    description: "Factual texts about real people, places, and events",
    passages: [
      {
        id: "nonfiction_1",
        title: "Amazing Dolphins",
        difficulty: "beginner",
        readingLevel: "Grade 2-3", 
        wordCount: 140,
        text: "Dolphins are some of the smartest animals in the ocean. They live in groups called pods and love to play together. Dolphins can jump high out of the water and do flips in the air! They use special clicking sounds to talk to each other and to find food. This is called echolocation. Baby dolphins are called calves, and they stay close to their mothers for two years. Dolphins are mammals, which means they breathe air just like humans do. They have to come to the surface of the water to breathe through a blowhole on top of their heads. Dolphins are very friendly and have been known to help humans who are in trouble in the ocean. They can swim up to 25 miles per hour!",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What are baby dolphins called?", 
            options: ["Puppies", "Calves", "Cubs", "Kits"],
            correctAnswer: 1,
            explanation: "Baby dolphins are called calves, just like baby cows."
          },
          {
            id: 2,
            type: "short_answer",
            question: "How do dolphins breathe?",
            suggestedAnswer: "They come to the surface and breathe air through a blowhole on top of their heads.",
            keyWords: ["surface", "blowhole", "air", "breathe"]
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What is echolocation?",
            options: ["Swimming fast", "Using clicking sounds to talk and find food", "Jumping out of water", "Living in groups"], 
            correctAnswer: 1,
            explanation: "Echolocation is when dolphins use clicking sounds to communicate and locate food."
          },
          {
            id: 4,
            type: "short_answer",
            question: "Name two ways dolphins are similar to humans.",
            suggestedAnswer: "They breathe air and are mammals, they are smart, they live in groups/are social.",
            keyWords: ["breathe air", "mammals", "smart", "groups", "social"]
          }
        ],
        teachingFocus: ["Main idea and details", "Animal facts", "Compare and contrast", "Vocabulary in context"],
        vocabulary: ["pods", "echolocation", "mammals", "blowhole", "surface"]
      },
      {
        id: "nonfiction_2",
        title: "The Life Cycle of a Butterfly",
        difficulty: "intermediate", 
        readingLevel: "Grade 3-4",
        wordCount: 180,
        text: "The transformation of a caterpillar into a butterfly is one of nature's most amazing processes. This change is called metamorphosis, and it happens in four distinct stages. First, an adult butterfly lays tiny eggs on a leaf. These eggs are usually round or oval and very small. After about five days, a tiny caterpillar, or larva, hatches from each egg. The caterpillar's main job is to eat and grow. It starts by eating its own eggshell, then munches on leaves almost constantly. As it grows bigger, the caterpillar sheds its skin several times. When the caterpillar is fully grown, it forms a protective casing around itself called a chrysalis or cocoon. Inside this casing, the most incredible transformation takes place. After about two weeks, a beautiful butterfly emerges. The butterfly must pump fluid into its wings and let them dry before it can fly. Once ready, the butterfly will mate and lay eggs, starting the cycle all over again.",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What is the process of a caterpillar changing into a butterfly called?",
            options: ["Evolution", "Metamorphosis", "Transformation", "Development"],
            correctAnswer: 1,
            explanation: "Metamorphosis is the scientific term for the complete transformation from caterpillar to butterfly."
          },
          {
            id: 2,
            type: "short_answer", 
            question: "List the four stages of a butterfly's life cycle in order.",
            suggestedAnswer: "1. Egg, 2. Caterpillar/larva, 3. Chrysalis/cocoon, 4. Butterfly",
            keyWords: ["egg", "caterpillar", "larva", "chrysalis", "cocoon", "butterfly"]
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What does a caterpillar do most of the time?",
            options: ["Sleep", "Eat and grow", "Build webs", "Fly around"],
            correctAnswer: 1,
            explanation: "A caterpillar's main job is to eat leaves constantly and grow bigger."
          },
          {
            id: 4,
            type: "short_answer",
            question: "Why does a caterpillar shed its skin several times?",
            suggestedAnswer: "Because it is growing bigger and needs more room, so it outgrows its old skin.",
            keyWords: ["growing", "bigger", "outgrows", "more room"]
          },
          {
            id: 5,
            type: "multiple_choice",
            question: "What must a newly emerged butterfly do before it can fly?",
            options: ["Find food", "Pump fluid into wings and let them dry", "Find a mate", "Lay eggs"],
            correctAnswer: 1,
            explanation: "A new butterfly must pump fluid into its wings and let them dry before it can fly properly."
          }
        ],
        teachingFocus: ["Sequence of events", "Scientific vocabulary", "Process description", "Cause and effect"],
        vocabulary: ["metamorphosis", "distinct", "larva", "chrysalis", "emerges"]
      }
    ]
  },

  poetry: {
    name: "Poetry & Rhymes",
    icon: "🎵", 
    color: "from-pink-500 to-pink-600",
    description: "Poems, songs, and rhyming texts with rhythm and imagery",
    passages: [
      {
        id: "poetry_1",
        title: "The Dancing Trees",
        difficulty: "beginner",
        readingLevel: "Grade 2-3",
        wordCount: 80,
        text: "The trees dance in the morning breeze,\nTheir branches sway with graceful ease.\nThe leaves whisper secrets to the sky,\nAs fluffy white clouds go floating by.\n\nThe oak tree stands so tall and proud,\nIts voice both strong and clear and loud.\nThe willow weeps with drooping arms,\nProtecting all from wind and harms.\n\nIn autumn when the leaves turn gold,\nThe trees tell stories, new and old.\nThey paint the world in red and brown,\nBefore their leaves come tumbling down.",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What do the trees do in the morning breeze?",
            options: ["Sleep", "Dance", "Cry", "Hide"],
            correctAnswer: 1,
            explanation: "The poem says 'The trees dance in the morning breeze' in the first line."
          },
          {
            id: 2,
            type: "short_answer",
            question: "Find two words that rhyme with 'sky' in the poem.",
            suggestedAnswer: "By, high (from 'floating by')",
            keyWords: ["by", "high"]
          },
          {
            id: 3,
            type: "multiple_choice", 
            question: "How is the willow tree described?",
            options: ["Tall and proud", "Weeping with drooping arms", "Strong and loud", "Small and quiet"],
            correctAnswer: 1,
            explanation: "The poem describes the willow as weeping with drooping arms."
          },
          {
            id: 4,
            type: "short_answer",
            question: "What colors do the trees paint the world in autumn?",
            suggestedAnswer: "Red, brown, and gold",
            keyWords: ["red", "brown", "gold"]
          }
        ],
        teachingFocus: ["Rhyme patterns", "Imagery and visualization", "Personification", "Seasonal changes"],
        vocabulary: ["graceful", "drooping", "tumbling", "floating", "whisper"]
      }
    ]
  },

  instructions: {
    name: "Instructions & Procedures",
    icon: "📋",
    color: "from-green-500 to-green-600", 
    description: "How-to texts and step-by-step procedures",
    passages: [
      {
        id: "instructions_1",
        title: "How to Make a Paper Airplane",
        difficulty: "beginner",
        readingLevel: "Grade 2-3",
        wordCount: 120,
        text: "Making a paper airplane is easy and fun! First, you will need one sheet of paper. Start by folding the paper in half lengthwise, then unfold it. Next, fold the top two corners down to meet the center crease, making a triangle shape at the top. Then, fold the angled edges down again to make the triangle even narrower. After that, fold the plane in half along the original center crease. Finally, fold each wing down to create the airplane's wings. Make sure both wings are even. Your paper airplane is ready to fly! Hold it gently and throw it forward with a smooth motion. The airplane should glide through the air. If it doesn't fly well, check that your folds are neat and the wings are even.",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "What do you need to make a paper airplane?",
            options: ["Scissors and glue", "One sheet of paper", "Colored pencils", "Tape and markers"],
            correctAnswer: 1,
            explanation: "The instructions clearly state you only need one sheet of paper to make a paper airplane."
          },
          {
            id: 2,
            type: "short_answer",
            question: "What is the first step in making a paper airplane?",
            suggestedAnswer: "Fold the paper in half lengthwise, then unfold it.",
            keyWords: ["fold", "half", "lengthwise", "unfold"]
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What should you check if your airplane doesn't fly well?",
            options: ["The color of the paper", "That folds are neat and wings are even", "The weather outside", "The size of the room"],
            correctAnswer: 1,
            explanation: "The text says to check that your folds are neat and the wings are even if it doesn't fly well."
          },
          {
            id: 4,
            type: "short_answer",
            question: "How should you throw the paper airplane?",
            suggestedAnswer: "Hold it gently and throw it forward with a smooth motion.",
            keyWords: ["gently", "forward", "smooth", "motion"]
          }
        ],
        teachingFocus: ["Following sequential steps", "Procedural language", "Problem solving", "Cause and effect"],
        vocabulary: ["lengthwise", "crease", "angled", "glide", "motion"]
      }
    ]
  },

  letters: {
    name: "Letters & Messages",
    icon: "✉️",
    color: "from-yellow-500 to-yellow-600",
    description: "Personal letters, emails, and written communications",
    passages: [
      {
        id: "letter_1", 
        title: "Letter to Grandma",
        difficulty: "beginner",
        readingLevel: "Grade 2-3",
        wordCount: 110,
        text: "Dear Grandma,\n\nI hope you are feeling well. I wanted to tell you about my new pet hamster, Peanut. He is brown and white with tiny black eyes. Peanut loves to run on his wheel at night, which sometimes keeps me awake! He also enjoys eating sunflower seeds and hiding them in his cheeks.\n\nMom says you might visit us next month. I can't wait to show you Peanut's tricks! He can climb through tubes and roll in his ball around the house. I think you will love him as much as I do.\n\nI miss you very much and hope to see you soon.\n\nLove,\nSarah\n\nP.S. Mom says to tell you that Dad fixed the leaky faucet you mentioned.",
        questions: [
          {
            id: 1,
            type: "multiple_choice",
            question: "Who wrote this letter?",
            options: ["Grandma", "Mom", "Sarah", "Dad"], 
            correctAnswer: 2,
            explanation: "The letter is signed 'Love, Sarah' at the end."
          },
          {
            id: 2,
            type: "short_answer",
            question: "What is the name of Sarah's pet and what kind of animal is it?",
            suggestedAnswer: "Peanut, and he is a hamster.",
            keyWords: ["Peanut", "hamster"]
          },
          {
            id: 3,
            type: "multiple_choice",
            question: "What does Peanut do that sometimes keeps Sarah awake?",
            options: ["Eats loudly", "Runs on his wheel", "Climbs through tubes", "Rolls in his ball"],
            correctAnswer: 1,
            explanation: "The letter says Peanut runs on his wheel at night, which sometimes keeps Sarah awake."
          },
          {
            id: 4,
            type: "short_answer",
            question: "What news does Sarah share in the P.S. section?",
            suggestedAnswer: "That Dad fixed the leaky faucet that Grandma had mentioned.",
            keyWords: ["Dad", "fixed", "leaky faucet"]
          }
        ],
        teachingFocus: ["Letter format and structure", "Purpose of writing", "Personal connections", "Details and examples"],
        vocabulary: ["mentioned", "climb", "cheeks", "tricks", "leaky"]
      }
    ]
  }
};

// Helper function to get passages by difficulty
export const getPassagesByDifficulty = (difficulty) => {
  const allPassages = [];
  Object.values(readingComprehensionContent).forEach(textType => {
    textType.passages.forEach(passage => {
      if (passage.difficulty === difficulty) {
        allPassages.push({...passage, textType: textType.name});
      }
    });
  });
  return allPassages;
};

// Helper function to get all text types
export const getTextTypes = () => {
  return Object.keys(readingComprehensionContent).map(key => ({
    id: key,
    ...readingComprehensionContent[key]
  }));
};