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
      },
      {
        id: "nonfiction_volcanoes",
        title: "How Volcanoes Erupt",
        isMultiLevel: true,
        levels: [
          {
            difficulty: "beginner",
            readingLevel: "Grade 1-2",
            wordCount: 228,
            text: "A volcano is a mountain with an opening in the ground. Deep under the ground, the Earth is very hot. In some places, the rock gets so hot that it melts. Melted rock under the ground is called magma.\n\nMagma can move slowly under the Earth. Sometimes it pushes up through cracks in the rock. When too much magma and gas build up, the volcano can erupt.\n\nAn eruption is when hot magma, gas, ash, and rocks burst out of the volcano. When magma comes out onto the ground, it is called lava. Lava is very, very hot. It can glow red, orange, or yellow.\n\nVolcanoes do not all erupt in the same way. Some volcanoes erupt quietly. Lava flows down the sides like a hot river. Other volcanoes erupt with a loud boom! They can shoot ash, smoke, and rocks high into the sky.\n\nBefore a volcano erupts, there are often clues. The ground may start to shake. This is called an earthquake. Sometimes steam or gas comes out from the top of the volcano. These signs can tell scientists that an eruption may happen soon.\n\nInside the volcano, gas is trapped in the magma. As the magma rises, the gas pushes harder and harder. It is a bit like shaking a bottle of fizzy drink. When the pressure gets too strong, the volcano erupts.\n\nAfter an eruption, lava cools down and becomes hard rock. Over time, this can change the shape of the land. Some volcanoes even make new islands!\n\nVolcanoes can be dangerous, but they are also amazing. They help make new land. The ash from volcanoes can also help plants grow because it adds minerals to the soil.\n\nThere are volcanoes in many places around the world. Some are on land, and some are under the sea. Some volcanoes are active, which means they can still erupt. Others are sleeping, which means they have not erupted for a long time. Some are extinct, which means they will probably not erupt again.\n\nVolcanoes are one of the most powerful parts of nature. Deep under the Earth, heat and pressure work together to make an eruption happen. When a volcano erupts, it reminds us just how strong our planet really is.",
            questions: [
              {
                id: 1,
                type: "click_word",
                question: "Find and click the word in the text that means 'melted rock under the ground'.",
                correctAnswer: "magma",
                explanation: "Melted rock under the ground is called magma."
              },
              {
                id: 2,
                type: "multiple_choice",
                question: "What do we call magma when it comes out of the volcano?",
                options: ["Fire", "Water", "Lava", "Rock"],
                correctAnswer: 2,
                explanation: "When magma comes out onto the ground, it is called lava."
              },
              {
                id: 3,
                type: "short_answer",
                question: "What colour can lava be?",
                suggestedAnswer: "It can glow red, orange, or yellow.",
                keyWords: ["red", "orange", "yellow"]
              },
              {
                id: 4,
                type: "multiple_choice",
                question: "What might happen to the ground before a volcano erupts?",
                options: ["It turns green", "It might start to shake (an earthquake)", "It gets very cold", "It starts to rain"],
                correctAnswer: 1,
                explanation: "The ground may start to shake in an earthquake before an eruption."
              },
              {
                id: 5,
                type: "short_answer",
                question: "Why are volcanoes important for plants?",
                suggestedAnswer: "The ash from volcanoes adds minerals to the soil, helping plants grow.",
                keyWords: ["ash", "minerals", "soil", "grow"]
              },
              {
                id: 6,
                type: "multiple_choice",
                question: "Where does magma come from?",
                options: ["From the sky", "Deep under the ground", "From the ocean", "From rivers"],
                correctAnswer: 1,
                explanation: "Magma is melted rock that forms deep under the ground."
              },
              {
                id: 7,
                type: "short_answer",
                question: "What happens during a volcano eruption?",
                suggestedAnswer: "Hot magma, gas, ash, and rocks burst out of the volcano.",
                keyWords: ["burst", "magma", "gas", "ash", "rocks"]
              },
              {
                id: 8,
                type: "short_answer",
                question: "What happens to lava after it cools down?",
                suggestedAnswer: "It becomes hard rock.",
                keyWords: ["hard", "rock"]
              },
              {
                id: 9,
                type: "multiple_choice",
                question: "What kind of volcano has not erupted for a very long time?",
                options: ["Extinct", "Sleeping", "Active", "Awake"],
                correctAnswer: 1,
                explanation: "A sleeping volcano has not erupted for a long time."
              },
              {
                id: 10,
                type: "short_answer",
                question: "Why does a volcano erupt?",
                suggestedAnswer: "When too much magma and gas build up, the pressure gets too strong and it erupts.",
                keyWords: ["magma", "gas", "build up", "pressure"]
              }
            ],
            teachingFocus: ["Earth science", "Cause and effect", "Descriptive writing", "Sequencing"],
            vocabulary: ["magma", "lava", "eruption", "active", "extinct"],
            glossary: {
              "magma": "Melted rock beneath the Earth's surface.",
              "lava": "Hot, melted rock that erupts from a volcano.",
              "eruption": "When hot magma, gas, ash, and rocks burst out of a volcano."
            }
          },
          {
            difficulty: "intermediate",
            readingLevel: "Grade 3-4",
            wordCount: 350,
            text: "Volcanoes are one of the most exciting and powerful natural features on Earth. They may look like ordinary mountains, but deep inside them something amazing is happening. Far below the ground, it is so hot that some rock melts into a thick, hot liquid called magma.\n\nMagma forms deep inside the Earth’s crust and mantle. Because it is hot and full of gas, magma wants to rise upward. It moves through weak spots and cracks in the Earth’s crust. Sometimes, it collects in a large underground space called a magma chamber.\n\nAs more magma fills the chamber, pressure begins to build. The gases trapped inside the magma push harder and harder. This pressure is a little bit like air building up inside a balloon. When the pressure becomes too great, the magma is forced up through the volcano and out of the top. This is called a volcanic eruption.\n\nWhen magma comes out of the volcano, it is called lava. Lava can flow down the sides of the volcano like a fiery river. Volcanoes can also release ash, steam, gas, and pieces of rock during an eruption.\n\nNot all volcanoes erupt in the same way. Some eruptions are gentle, with lava slowly pouring out. Other eruptions are explosive and violent. These eruptions can blast ash and hot rocks high into the air. The type of eruption depends on the kind of magma inside the volcano. Thick, sticky magma traps more gas, which can cause a bigger explosion. Runny magma lets gas escape more easily, so the eruption is often quieter.\n\nScientists watch volcanoes carefully for warning signs. Before an eruption, the ground might shake with small earthquakes. The volcano may swell or bulge as magma rises inside it. More gas and steam may also escape from cracks or vents. These clues help scientists know when a volcano might erupt.\n\nAfter an eruption, the lava cools and hardens into rock. Over many eruptions, this rock builds up and changes the shape of the land. In fact, some mountains and islands were formed by volcanoes. The Hawaiian Islands, for example, were created by volcanic activity.\n\nVolcanoes can be dangerous, but they are also important. They create new land and bring minerals from deep inside the Earth up to the surface. Volcanic ash can make soil rich and good for growing plants.\n\nThere are many volcanoes around the world. Some are active, which means they can still erupt. Others are dormant, which means they are resting for now. A volcano that is extinct is not expected to erupt again.\n\nVolcanoes are a powerful reminder that Earth is always changing. Deep underground, heat, pressure, gas, and magma work together to create nature’s most dramatic events.",
            questions: [
              {
                id: 1,
                type: "short_answer",
                question: "What is magma?",
                suggestedAnswer: "Magma is rock that has melted into a thick, hot liquid deep underground.",
                keyWords: ["rock", "melted", "liquid", "hot"]
              },
              {
                id: 2,
                type: "short_answer",
                question: "What is a magma chamber?",
                suggestedAnswer: "A large underground space where magma collects.",
                keyWords: ["underground", "space", "collects"]
              },
              {
                id: 3,
                type: "click_word",
                question: "Click the word in the text that is the name for magma when it comes out of the volcano.",
                correctAnswer: "lava",
                explanation: "When magma comes out of the volcano, it is called lava."
              },
              {
                id: 4,
                type: "short_answer",
                question: "What are two things that might come out of a volcano during an eruption?",
                suggestedAnswer: "Lava, ash, steam, gas, and pieces of rock.",
                keyWords: ["lava", "ash", "steam", "gas", "rock"]
              },
              {
                id: 5,
                type: "multiple_choice",
                question: "Why does magma move upward inside the Earth?",
                options: ["Because it is pushed by water", "Because it is hot and full of gas", "Because it is heavier than solid rock", "Because it is cold"],
                correctAnswer: 1,
                explanation: "Magma wants to rise upward because it is hot and full of gas."
              },
              {
                id: 6,
                type: "multiple_choice",
                question: "What causes pressure to build up inside a volcano?",
                options: ["More magma fills the chamber and trapped gases push harder", "Water leaking into the volcano", "Lava cooling down rapidly", "Heavy rocks falling inside"],
                correctAnswer: 0,
                explanation: "As more magma fills the chamber, pressure builds because trapped gases push harder."
              },
              {
                id: 7,
                type: "short_answer",
                question: "What is one sign that a volcano may erupt soon?",
                suggestedAnswer: "Small earthquakes, the volcano swelling/bulging, or more gas and steam escaping.",
                keyWords: ["earthquakes", "swelling", "bulging", "gas", "steam"]
              },
              {
                id: 8,
                type: "multiple_choice",
                question: "How were the Hawaiian Islands formed?",
                options: ["By earthquakes breaking up land", "By human construction", "By volcanic activity", "By severe storms"],
                correctAnswer: 2,
                explanation: "The Hawaiian Islands were created by volcanic activity."
              },
              {
                id: 9,
                type: "multiple_choice",
                question: "Why are some eruptions gentle while others are explosive?",
                options: ["Explosive volcanoes are taller", "Thick magma traps gas causing explosions, runny magma lets gas escape for quieter eruptions", "Gentle volcanoes don't have magma", "It depends on the weather"],
                correctAnswer: 1,
                explanation: "Thick, sticky magma traps more gas causing a bigger explosion. Runny magma lets gas escape easily leading to quieter eruptions."
              },
              {
                id: 10,
                type: "short_answer",
                question: "What does the word dormant mean when talking about volcanoes?",
                suggestedAnswer: "It means the volcano is resting for now.",
                keyWords: ["resting"]
              }
            ],
            teachingFocus: ["Comparing and contrasting", "Technical vocabulary", "Main ideas", "Supporting details"],
            vocabulary: ["chamber", "dormant", "violent", "crust", "mantle"],
            glossary: {
              "magma": "Thick, hot liquid rock deep underground.",
              "lava": "Magma that has reached the Earth's surface.",
              "crust": "The outer solid layer of the Earth.",
              "dormant": "Resting for now, but a volcano that could erupt again."
            }
          },
          {
            difficulty: "advanced",
            readingLevel: "Grade 5-6",
            wordCount: 410,
            text: "Volcanoes are among the most powerful and dramatic natural forces on Earth. Although they may appear to be ordinary mountains, volcanoes are actually openings in the Earth’s crust where molten rock, gas, ash, and other materials can escape from deep below the surface. A volcanic eruption is the result of heat, pressure, and movement inside the Earth.\n\nDeep beneath the Earth’s crust, temperatures are so extreme that some rock begins to melt. This molten rock is known as magma. Magma forms in parts of the mantle and lower crust where heat, pressure changes, and trapped water lower the melting point of rock. Because magma is less dense than the solid rock around it, it begins to rise toward the surface.\n\nAs magma rises, it may collect in an underground reservoir called a magma chamber. Over time, more magma can flow into this chamber, increasing the pressure inside. At the same time, gases such as water vapour, carbon dioxide, and sulfur dioxide are trapped within the magma. As the magma moves upward, the pressure around it decreases, causing the gases to expand. This creates even more pressure inside the volcano.\n\nEventually, the pressure becomes too great for the surrounding rock to hold it back. The magma is then forced upward through cracks, vents, or weak points in the Earth’s crust, causing a volcanic eruption. Once magma reaches the Earth’s surface, it is called lava.\n\nThe way a volcano erupts depends largely on the type of magma it contains. Thin, runny magma allows gas to escape easily, which usually leads to gentler eruptions with flowing lava. Thick, sticky magma traps gas more effectively, causing pressure to build up until it is released in a violent explosion. This is why some volcanoes produce slow lava flows, while others erupt with enormous blasts of ash, rock, and hot gas.\n\nBefore a volcano erupts, there are often warning signs. Small earthquakes may occur as magma pushes through underground rock. The ground around the volcano might bulge or crack. Scientists may also detect increased gas emissions or rising temperatures near the volcano. By studying these clues, volcanologists can sometimes predict when an eruption may happen.\n\nVolcanic eruptions can have both destructive and constructive effects. They can destroy homes, forests, and roads, and ash clouds can affect air travel and breathing. However, eruptions also create new landforms, including mountains and islands. Volcanic ash can enrich the soil, making it excellent for farming once the area becomes safe again.\n\nVolcanoes are found all over the world, especially near the edges of tectonic plates. Many are located around the Pacific Ring of Fire, a region with frequent earthquakes and volcanic activity. Volcanoes are usually described as active, dormant, or extinct, depending on whether they are erupting now, may erupt again, or are unlikely to erupt in the future.\n\nVolcanoes show us that Earth is a living, changing planet. Their eruptions are caused by an incredible combination of heat, pressure, gases, and moving rock deep beneath our feet.",
            questions: [
              {
                id: 1,
                type: "short_answer",
                question: "What is magma and where does it form?",
                suggestedAnswer: "Magma is molten rock that forms in parts of the mantle and lower crust.",
                keyWords: ["molten rock", "mantle", "lower crust"]
              },
              {
                id: 2,
                type: "click_word",
                question: "Find and click the word in the text that means 'closely compacted in substance' (which magma is less of than solid rock).",
                correctAnswer: "dense",
                explanation: "Magma is less dense than the solid rock around it, so it naturally begins to rise."
              },
              {
                id: 3,
                type: "multiple_choice",
                question: "What are three gases that can be found in magma?",
                options: ["Oxygen, nitrogen, methane", "Water vapour, carbon dioxide, sulfur dioxide", "Helium, hydrogen, argon", "Carbon monoxide, ozone, sulfur"],
                correctAnswer: 1,
                explanation: "The text mentions water vapour, carbon dioxide, and sulfur dioxide."
              },
              {
                id: 4,
                type: "multiple_choice",
                question: "How does pressure build inside a volcano before an eruption?",
                options: ["Rock falls into the magma chamber", "More magma flows into the chamber and expanding gases create more pressure", "Rain enters the volcano", "The mantle pushes up from below"],
                correctAnswer: 1,
                explanation: "More magma flows in, and as magma moves upward, decreasing external pressure allows gases to expand, creating huge internal pressure."
              },
              {
                id: 5,
                type: "short_answer",
                question: "What warning signs might scientists observe before an eruption?",
                suggestedAnswer: "Small earthquakes, ground bulging or cracking, increased gas emissions, or rising temperatures.",
                keyWords: ["earthquakes", "bulge", "crack", "gas emissions", "temperatures"]
              },
              {
                id: 6,
                type: "short_answer",
                question: "What is the Pacific Ring of Fire?",
                suggestedAnswer: "A region around the edges of tectonic plates with frequent earthquakes and volcanic activity.",
                keyWords: ["region", "tectonic plates", "earthquakes", "volcanic activity"]
              },
              {
                id: 7,
                type: "multiple_choice",
                question: "What are two negative effects of volcanic eruptions?",
                options: ["Creating mountains and enriching soil", "Destroying homes/forests and ash affecting air travel/breathing", "Causing tsunamis and making rain", "Melting ice caps and destroying ozone"],
                correctAnswer: 1,
                explanation: "Eruptions can destroy homes, forests, roads, and ash clouds can affect air travel and breathing."
              },
              {
                id: 8,
                type: "short_answer",
                question: "Why does gas expansion make eruptions stronger?",
                suggestedAnswer: "As gas expands, it creates even more pressure inside the volcano, eventually forcing its way out violently (especially if trapped in thick magma).",
                keyWords: ["pressure", "violently", "trapped"]
              },
              {
                id: 9,
                type: "short_answer",
                question: "How can volcanoes both destroy and create land?",
                suggestedAnswer: "They destroy land, homes, and forests with lava and ash, but the cooled lava creates new landforms (mountains/islands) and the ash enriches the soil.",
                keyWords: ["destroy", "create", "new landforms", "enrich"]
              },
              {
                id: 10,
                type: "multiple_choice",
                question: "What role do tectonic plates play in the formation of volcanoes?",
                options: ["They spin to generate heat", "Volcanoes are often found near the edges of tectonic plates", "They hold volcanoes up", "They stop magma from escaping"],
                correctAnswer: 1,
                explanation: "Volcanoes are found all over the world, especially near the edges of tectonic plates where there is frequent activity."
              }
            ],
            teachingFocus: ["Scientific processes", "Advanced vocabulary", "Citing evidence", "Text structure analysis"],
            vocabulary: ["tectonic", "emissions", "volcanologists", "constructive", "reservoir"],
            glossary: {
              "molten": "Liquefied by heat; melted.",
              "dense": "Closely compacted in substance.",
              "vent": "An opening that allows gas or liquid to escape.",
              "constructive": "Serving a useful purpose; tending to build up."
            }
          }
        ]
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
        allPassages.push({ ...passage, textType: textType.name });
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