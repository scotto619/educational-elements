// components/curriculum/literacy/PartnerReadingPassages.js
import React, { useState, useRef } from 'react';

// ─── Passage Data ─────────────────────────────────────────────────────────────
const passages = [
  {
    id: 'octopus',
    title: 'The Secret Life of the Octopus',
    icon: '🐙',
    subject: 'Ocean Science',
    palette: {
      bg: 'from-cyan-600 to-blue-700',
      light: 'bg-cyan-50',
      border: 'border-cyan-200',
      badge: 'bg-cyan-100 text-cyan-800',
      accent: 'text-cyan-700',
      star: '#0e7490',
      moon: '#1d4ed8',
      headerText: 'text-white',
    },
    illustration: '🦑',
    paragraphs: [
      {
        partner: 'star',
        text: 'Deep beneath the ocean waves, in rocky caves and coral reefs, lives one of the most intelligent creatures on Earth — the octopus. With eight long, flexible arms covered in hundreds of suckers, the octopus is built for survival. Each sucker can taste and smell, helping the octopus explore its world in a way that\'s completely different from us.',
      },
      {
        partner: 'moon',
        text: 'One of the most amazing things about the octopus is its ability to change colour and texture in less than a second. Tiny cells in its skin, called chromatophores, expand and contract to create dazzling patterns. Whether hiding from a shark or sneaking up on a crab, the octopus is a master of disguise.',
      },
      {
        partner: 'star',
        text: 'Octopuses are surprisingly clever problem-solvers. Scientists have watched them open jars, escape from tanks, and even carry coconut shells to use as portable shelters. Some octopuses have been seen collecting rocks and arranging them outside their dens — a sign of planning ahead, something very few animals can do.',
      },
      {
        partner: 'moon',
        text: 'If an octopus is grabbed by a predator, it has a spectacular escape plan. It squirts a cloud of dark ink to confuse the attacker, then rockets backwards using jets of water. In a final twist, a caught arm can be shed like a lizard\'s tail — and slowly, a new one will grow back in its place.',
      },
      {
        partner: 'star',
        text: 'Despite being so impressive, an octopus lives a short and mostly solitary life, rarely more than two years. After a female lays her eggs, she guards them tirelessly for weeks, gently fanning them with fresh water, never leaving to eat. When the tiny hatchlings finally emerge, a new generation of ocean geniuses begins its journey.',
      },
    ],
  },
  {
    id: 'volcano',
    title: 'Fire Mountains: The Story of Volcanoes',
    icon: '🌋',
    subject: 'Earth Science',
    palette: {
      bg: 'from-orange-600 to-red-700',
      light: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-800',
      accent: 'text-orange-700',
      star: '#c2410c',
      moon: '#9f1239',
      headerText: 'text-white',
    },
    illustration: '⛰️',
    paragraphs: [
      {
        partner: 'star',
        text: 'Far beneath your feet, the Earth is not solid rock all the way through. Deep underground, rock becomes so hot that it melts into a thick, slow-moving liquid called magma. When pressure builds up and magma finds a weak spot in the Earth\'s crust, it bursts upward through an opening called a vent — and a volcano is born.',
      },
      {
        partner: 'moon',
        text: 'When a volcano erupts, the magma that reaches the surface is given a new name: lava. Lava can flow as slowly as a person walking, or shoot out as fast as a racing car. Along with lava, volcanoes launch enormous clouds of ash and gas into the sky, which can travel thousands of kilometres and block sunlight for months.',
      },
      {
        partner: 'star',
        text: 'Not all volcanoes look the same. Some are wide and gently sloping, built by thin, runny lava that spreads far before cooling. Others are steep and cone-shaped, created by thick lava and explosive eruptions that pile up material around the vent. The famous Mount Fuji in Japan and Mauna Loa in Hawaii are both volcanoes, yet they look completely different.',
      },
      {
        partner: 'moon',
        text: 'As frightening as volcanoes can be, they are also creators. The lava and ash they release slowly break down into some of the most fertile soil on the planet. Communities have lived near volcanoes for thousands of years because the land grows food so well. Ancient Romans built cities near Mount Vesuvius for exactly this reason.',
      },
      {
        partner: 'star',
        text: 'Today, scientists called volcanologists work to monitor and predict volcanic eruptions. They measure tiny earthquakes, track changes in the shape of the volcano, and study the gases it releases. Their work helps communities prepare and evacuate in time. While no volcano can be perfectly predicted, modern science saves thousands of lives every year.',
      },
    ],
  },
  {
    id: 'space',
    title: 'Reaching for the Stars: A History of Space Exploration',
    icon: '🚀',
    subject: 'Space & History',
    palette: {
      bg: 'from-indigo-700 to-purple-800',
      light: 'bg-indigo-50',
      border: 'border-indigo-200',
      badge: 'bg-indigo-100 text-indigo-800',
      accent: 'text-indigo-700',
      star: '#4338ca',
      moon: '#7e22ce',
      headerText: 'text-white',
    },
    illustration: '🌌',
    paragraphs: [
      {
        partner: 'star',
        text: 'For thousands of years, humans gazed up at the night sky with wonder. The stars and planets seemed impossibly far away — beautiful, mysterious, and unreachable. Then, in the mid-twentieth century, everything changed. Scientists and engineers began designing machines powerful enough to break free from Earth\'s gravity and travel into the vast darkness of space.',
      },
      {
        partner: 'moon',
        text: 'The space race began in 1957, when the Soviet Union launched Sputnik — a small metal sphere about the size of a beach ball — into orbit around Earth. It beeped as it circled the globe, and the world listened in amazement. Just four years later, Soviet cosmonaut Yuri Gagarin became the first human to travel to space, completing one full orbit of Earth.',
      },
      {
        partner: 'star',
        text: 'The United States was determined to go further. On 20 July 1969, the Apollo 11 mission landed on the Moon. Neil Armstrong became the first person to walk on another world, leaving behind a famous message: "That\'s one small step for man, one giant leap for mankind." Over 600 million people — the largest television audience ever at the time — watched live.',
      },
      {
        partner: 'moon',
        text: 'Since then, space exploration has continued to push boundaries. Robotic rovers have trundled across the surface of Mars, sending back stunning photographs of an alien landscape. Space telescopes like the Hubble have peered billions of light-years into the universe, capturing images of galaxies being born and dying in spectacular explosions called supernovae.',
      },
      {
        partner: 'star',
        text: 'Today, astronauts from many nations live and work together aboard the International Space Station, orbiting Earth at 28,000 kilometres per hour. Private companies are now building their own rockets and spacecraft, dreaming of sending people to Mars within your lifetime. The universe is enormous, and humanity has only just taken its first steps into the dark.',
      },
    ],
  },
  {
    id: 'rainforest',
    title: 'Journey into the Rainforest',
    icon: '🌿',
    subject: 'Environment & Nature',
    palette: {
      bg: 'from-emerald-600 to-green-700',
      light: 'bg-emerald-50',
      border: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800',
      accent: 'text-emerald-700',
      star: '#065f46',
      moon: '#166534',
      headerText: 'text-white',
    },
    illustration: '🦜',
    paragraphs: [
      {
        partner: 'star',
        text: 'Rainforests are among the most extraordinary places on our planet. Found near the equator where rainfall is heavy and temperatures stay warm all year, they burst with more life per square metre than almost anywhere else on Earth. The Amazon Rainforest in South America alone is home to more than three million species of plants, animals, and insects.',
      },
      {
        partner: 'moon',
        text: 'A rainforest is not one single place — it is a layered world stacked on top of itself. At the very top, tall trees called emergents poke above the rest, catching sunlight. Below sits the canopy, a thick ceiling of leaves where monkeys swing and birds nest. Further down in the dim understorey, jaguars prowl, and on the dark forest floor, fungi and insects do vital work recycling nutrients.',
      },
      {
        partner: 'star',
        text: 'Rainforests act like the lungs of our planet. Their billions of trees absorb carbon dioxide from the atmosphere and release oxygen, helping to keep our air clean. They also play a huge role in weather patterns, releasing so much water vapour that they essentially create their own rainfall — feeding rivers that supply fresh water to millions of people.',
      },
      {
        partner: 'moon',
        text: 'Many of the medicines we use today were discovered in rainforest plants. Indigenous peoples who have lived in these forests for thousands of years hold deep knowledge about which plants can heal wounds, treat fevers, or ease pain. Scientists work alongside these communities to understand this knowledge before it is lost forever.',
      },
      {
        partner: 'star',
        text: 'Sadly, rainforests are disappearing at an alarming rate. Every minute, an area the size of several football fields is cut down. The good news is that people around the world are fighting to protect these vital ecosystems. By reducing deforestation, replanting trees, and supporting sustainable farming, we can help ensure that rainforests continue to thrive for generations to come.',
      },
    ],
  },
  {
    id: 'sharks',
    title: 'Sharks: Rulers of the Ocean',
    icon: '🦈',
    subject: 'Ocean Science',
    palette: {
      bg: 'from-slate-600 to-blue-800',
      light: 'bg-slate-50',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-800',
      accent: 'text-slate-700',
      star: '#1e3a5f',
      moon: '#1d4ed8',
      headerText: 'text-white',
    },
    illustration: '🌊',
    paragraphs: [
      {
        partner: 'star',
        text: 'Sharks have been swimming in Earth\'s oceans for over 450 million years — long before the dinosaurs appeared, and long after they disappeared. There are more than 500 different species of shark, ranging from the tiny dwarf lanternshark, which could fit in your hand, to the enormous whale shark, which can grow as long as a school bus and is the largest fish in the world.',
      },
      {
        partner: 'moon',
        text: 'Sharks are extraordinary hunters, equipped with senses that seem almost superhuman. They can detect a single drop of blood in 100 litres of water and pick up electrical signals given off by the heartbeats of other animals. Rows of teeth sit in their jaws like a conveyor belt — when one falls out, a new one moves forward to replace it. A shark may grow thousands of teeth in its lifetime.',
      },
      {
        partner: 'star',
        text: 'Not all sharks hunt large prey. The whale shark and basking shark, despite being enormous, feed only on tiny creatures called plankton. They swim slowly through the water with their enormous mouths open, filtering out billions of microscopic organisms. These gentle giants are completely harmless to humans and have even been known to let divers hitch a ride on their dorsal fins.',
      },
      {
        partner: 'moon',
        text: 'Sharks play a vital role in keeping ocean ecosystems healthy. As apex predators — animals at the very top of the food chain — they control the populations of fish and other sea creatures below them. Without sharks, certain fish would multiply out of control and devastate the underwater habitats that millions of species depend on. A healthy ocean needs healthy shark populations.',
      },
      {
        partner: 'star',
        text: 'Sadly, shark numbers are falling rapidly around the world. Millions are caught each year, often just for their fins, which are used in a dish called shark fin soup. Many species are now endangered. Scientists and conservationists are working hard to change laws, protect shark habitats, and teach people that sharks deserve our respect — not our fear. These ancient animals are survivors, and they need our help.',
      },
    ],
  },
  {
    id: 'egypt',
    title: 'Ancient Egypt: Land of the Pharaohs',
    icon: '🏺',
    subject: 'History',
    palette: {
      bg: 'from-yellow-500 to-amber-700',
      light: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-800',
      accent: 'text-yellow-700',
      star: '#78350f',
      moon: '#b45309',
      headerText: 'text-white',
    },
    illustration: '🐪',
    paragraphs: [
      {
        partner: 'star',
        text: 'More than 5,000 years ago, along the banks of the Nile River in Africa, one of the greatest civilisations in history came to life. Ancient Egypt was a land of towering monuments, mysterious gods, and powerful rulers called pharaohs. The Egyptians believed their pharaoh was a living god on Earth, and everything — from the crops that grew to the floods that came each year — was connected to the pharaoh\'s divine power.',
      },
      {
        partner: 'moon',
        text: 'The ancient Egyptians built structures so impressive they still stand today. The Great Pyramid of Giza, built for Pharaoh Khufu around 2560 BCE, was constructed using over two million stone blocks, some weighing as much as a small car. For nearly 4,000 years, it remained the tallest structure ever built by humans. Archaeologists still debate exactly how the Egyptians moved such enormous stones without modern machinery.',
      },
      {
        partner: 'star',
        text: 'When a pharaoh died, the Egyptians believed their ruler would travel to an afterlife — a paradise called the Field of Reeds. To prepare for this journey, the body was carefully preserved through a process called mummification, which could take up to 70 days. The mummy was then placed inside a decorated coffin, surrounded by food, furniture, jewellery, and everything the pharaoh might need in the next world.',
      },
      {
        partner: 'moon',
        text: 'Ancient Egyptians developed one of the world\'s earliest writing systems, called hieroglyphics. Instead of letters, they used hundreds of small pictures and symbols carved into stone or written on a plant-based paper called papyrus. For centuries after the Egyptian civilisation ended, nobody could read hieroglyphics — until the discovery of the Rosetta Stone in 1799 finally gave scholars the key to unlock their secrets.',
      },
      {
        partner: 'star',
        text: 'Egypt was also home to remarkable women who wielded enormous power. Queen Hatshepsut ruled as pharaoh for over 20 years and launched ambitious building projects across the kingdom. Cleopatra VII, the last pharaoh of Egypt, spoke nine languages and was a skilled diplomat who negotiated with the most powerful leaders in the ancient world. These women helped shape one of history\'s most enduring civilisations.',
      },
    ],
  },
  {
    id: 'butterfly',
    title: 'A Butterfly\'s Amazing Journey',
    icon: '🦋',
    subject: 'Life Science',
    palette: {
      bg: 'from-fuchsia-500 to-pink-600',
      light: 'bg-fuchsia-50',
      border: 'border-fuchsia-200',
      badge: 'bg-fuchsia-100 text-fuchsia-800',
      accent: 'text-fuchsia-700',
      star: '#86198f',
      moon: '#be185d',
      headerText: 'text-white',
    },
    illustration: '🌸',
    paragraphs: [
      {
        partner: 'star',
        text: 'Few transformations in nature are as breathtaking as the journey of a butterfly. What begins as a tiny egg clinging to a leaf will eventually become a creature of spectacular colour and grace, capable of flying thousands of kilometres. This journey — called metamorphosis — takes place in four incredible stages, each one completely different from the last.',
      },
      {
        partner: 'moon',
        text: 'A butterfly\'s life begins as an egg, often no bigger than a pinhead, carefully laid on a specific type of plant. The female butterfly chooses her plant wisely, because when the egg hatches into a caterpillar — also called a larva — it will immediately begin eating. Caterpillars are eating machines. They munch through leaves almost constantly, growing so quickly that they shed their skin, or moult, several times as they expand.',
      },
      {
        partner: 'star',
        text: 'When the caterpillar is large enough, it enters the third stage of its life by forming a protective case around itself called a chrysalis. From the outside, the chrysalis looks still and quiet — but inside, something extraordinary is happening. The caterpillar\'s body breaks down almost completely into a soup of cells, which then reorganise and rebuild themselves into an entirely new creature. This process takes one to two weeks.',
      },
      {
        partner: 'moon',
        text: 'When the chrysalis finally opens, a fully formed butterfly emerges, but its wings are soft and crumpled. The butterfly must pump fluid into its wings and wait for them to dry before it can fly. Once airborne, it feeds on nectar from flowers using a long, tube-like tongue called a proboscis, which it can curl up when not in use — like a party blower in reverse.',
      },
      {
        partner: 'star',
        text: 'Some butterflies undertake one of the most astonishing migrations in the animal kingdom. The monarch butterfly travels up to 4,500 kilometres each year from Canada all the way to forests in central Mexico. Incredibly, no individual butterfly makes the full round trip — it takes several generations, each one somehow knowing the route. Scientists believe they navigate using the sun and even the Earth\'s magnetic field.',
      },
    ],
  },
  {
    id: 'great-barrier-reef',
    title: 'The Great Barrier Reef: A World Beneath the Waves',
    icon: '🐠',
    subject: 'Environment & Science',
    palette: {
      bg: 'from-teal-500 to-cyan-700',
      light: 'bg-teal-50',
      border: 'border-teal-200',
      badge: 'bg-teal-100 text-teal-800',
      accent: 'text-teal-700',
      star: '#0f766e',
      moon: '#0e7490',
      headerText: 'text-white',
    },
    illustration: '🪸',
    paragraphs: [
      {
        partner: 'star',
        text: 'Stretching more than 2,300 kilometres along the northeastern coast of Australia, the Great Barrier Reef is the largest living structure on Earth. It is so vast that it can be seen from outer space. The reef is not one single structure, but a collection of nearly 3,000 individual reefs and 900 islands, all teeming with life in the warm, clear waters of the Coral Sea.',
      },
      {
        partner: 'moon',
        text: 'Coral reefs look like colourful underwater gardens, but the coral itself is actually an animal — or rather, millions of tiny animals called polyps, each one no bigger than a grain of rice. These polyps build hard limestone skeletons around themselves, and over thousands of years, layer upon layer of these skeletons forms the reef structure. The Great Barrier Reef began forming approximately 20,000 years ago.',
      },
      {
        partner: 'star',
        text: 'The reef is home to an astonishing variety of life. More than 1,500 species of fish, 4,000 types of mollusc, 240 species of bird, and six of the world\'s seven sea turtle species all depend on the reef. It is also a critical nursery for many species, providing shelter for young fish that would otherwise be easy prey in open water. Without the reef, countless ocean species would struggle to survive.',
      },
      {
        partner: 'moon',
        text: 'The greatest threat to the Great Barrier Reef is rising ocean temperatures caused by climate change. When the water gets too warm, coral expels the tiny algae living inside it that give it colour and provide most of its food. The coral then turns completely white — a process called coral bleaching — and if temperatures don\'t drop, the coral will starve and die. Large sections of the reef have already experienced severe bleaching events.',
      },
      {
        partner: 'star',
        text: 'Scientists, conservationists, and the Australian government are working on ambitious plans to protect and restore the reef. These include reducing water pollution, controlling the crown-of-thorns starfish that eat coral, and even developing heat-resistant coral in laboratories. The Great Barrier Reef was listed as a World Heritage Site in 1981. Protecting it is one of the most important environmental challenges of our time.',
      },
    ],
  },
  {
    id: 'dinosaurs',
    title: 'Dinosaurs: Rulers of the Ancient World',
    icon: '🦕',
    subject: 'Prehistoric Science',
    palette: {
      bg: 'from-green-600 to-lime-700',
      light: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-800',
      accent: 'text-green-700',
      star: '#14532d',
      moon: '#365314',
      headerText: 'text-white',
    },
    illustration: '🌿',
    paragraphs: [
      {
        partner: 'star',
        text: 'For over 165 million years, dinosaurs ruled the Earth. They first appeared around 230 million years ago and came in an astonishing range of shapes and sizes — from the chicken-sized Microraptor to the colossal Argentinosaurus, which may have weighed as much as 80 tonnes and stretched 30 metres from nose to tail. No other group of land animals has ever dominated the planet for such an extraordinary length of time.',
      },
      {
        partner: 'moon',
        text: 'Dinosaurs were not the slow, cold-blooded monsters that old movies portrayed. Modern scientists believe that many dinosaurs were warm-blooded, fast-moving, and highly social creatures. Some were incredibly intelligent. The Velociraptor, made famous by movies, was about the size of a turkey — but it was quick, cunning, and hunted in packs. Many dinosaurs also had feathers, making them much more closely related to modern birds than most people realise.',
      },
      {
        partner: 'star',
        text: 'We know about dinosaurs almost entirely through fossils — the preserved remains or imprints of creatures that lived millions of years ago. When a dinosaur died in the right conditions — usually near water — its bones could be slowly replaced by minerals over millions of years, turning them to stone. Palaeontologists, scientists who study prehistoric life, carefully excavate and study these fossils to piece together how dinosaurs looked, moved, and behaved.',
      },
      {
        partner: 'moon',
        text: 'About 66 million years ago, the age of dinosaurs came to a sudden, catastrophic end. A massive asteroid, estimated to be around 10 kilometres wide, slammed into the Earth near what is now Mexico. The impact triggered enormous fires, a tsunami, and a cloud of dust and debris so thick it blocked sunlight for years. Without sunlight, plants died, and the food chain collapsed. Around three-quarters of all species on Earth went extinct.',
      },
      {
        partner: 'star',
        text: 'But not all dinosaurs died out. Birds are the direct descendants of a group of small, feathered theropod dinosaurs, which survived the mass extinction. Every time you see a sparrow, a pigeon, or an eagle, you are looking at a living dinosaur. Scientists have discovered more new dinosaur species in the last 30 years than in all of history before that — and new discoveries continue to reshape our understanding of these magnificent creatures.',
      },
    ],
  },
  {
    id: 'elephants',
    title: 'Elephants: The Memory Masters',
    icon: '🐘',
    subject: 'Animal Science',
    palette: {
      bg: 'from-gray-500 to-stone-600',
      light: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-800',
      accent: 'text-gray-700',
      star: '#374151',
      moon: '#44403c',
      headerText: 'text-white',
    },
    illustration: '🌍',
    paragraphs: [
      {
        partner: 'star',
        text: 'The African elephant is the largest land animal on Earth, with males standing up to four metres tall and weighing as much as six tonnes. Their enormous ears, shaped remarkably like the continent of Africa, are packed with blood vessels and act like radiators — flapping them helps cool the animal\'s blood in the blazing African heat. Their tusks, which are actually elongated teeth, are used for digging, stripping bark from trees, and competing with rivals.',
      },
      {
        partner: 'moon',
        text: 'Elephants are among the most intelligent animals on the planet. They can recognise themselves in mirrors — a sign of self-awareness shared only by humans, great apes, and dolphins. They use tools, solve problems, and show remarkable empathy. When a member of the herd is sick or injured, others will stay behind to help, sometimes using their trunks to prop up a weakened companion. Elephants have even been observed appearing to grieve their dead.',
      },
      {
        partner: 'star',
        text: 'An elephant\'s trunk is one of the most versatile and extraordinary structures in the animal kingdom. Containing over 40,000 individual muscles — compared to the 600 in the entire human body — the trunk can uproot trees, pick up a single blade of grass, suck up and squirt 15 litres of water, smell water sources kilometres away, and even make trumpet calls loud enough to be heard two kilometres in every direction.',
      },
      {
        partner: 'moon',
        text: 'Elephants live in close-knit family groups led by the oldest female, called the matriarch. Her decades of experience are invaluable — she remembers the locations of water sources and safe travel routes that the herd relies on during droughts. Young elephants spend years learning from their elders. This deep social structure means that when an older elephant is lost, often to poaching, the whole herd suffers from the loss of her knowledge.',
      },
      {
        partner: 'star',
        text: 'Elephant populations have plummeted due to habitat loss and poaching for their ivory tusks. In the early twentieth century, around ten million elephants roamed Africa. Today, fewer than 450,000 remain. Many countries have banned the ivory trade, and conservation organisations work tirelessly to protect elephant habitats and combat poaching. These majestic animals are keystone species — their survival is essential to maintaining the entire ecosystem they live in.',
      },
    ],
  },
  {
    id: 'earthquakes',
    title: 'Earthquakes: When the Earth Shakes',
    icon: '🌍',
    subject: 'Earth Science',
    palette: {
      bg: 'from-red-600 to-orange-700',
      light: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-800',
      accent: 'text-red-700',
      star: '#991b1b',
      moon: '#c2410c',
      headerText: 'text-white',
    },
    illustration: '🏔️',
    paragraphs: [
      {
        partner: 'star',
        text: 'The ground beneath your feet feels solid and still, but the Earth\'s outer layer — called the crust — is actually broken into enormous pieces called tectonic plates. These plates, some as large as entire continents, float on a layer of hot, partially melted rock called the mantle. They move incredibly slowly — about as fast as your fingernails grow — but over millions of years, this movement reshapes the entire surface of our planet.',
      },
      {
        partner: 'moon',
        text: 'When two tectonic plates grind against each other, enormous pressure builds up along the boundary between them. Eventually, that pressure becomes so great that the rocks suddenly shift or crack — releasing huge amounts of energy in the form of seismic waves that ripple outward through the Earth. This sudden release of energy is an earthquake. The point underground where the earthquake originates is called the focus, and the point directly above it on the surface is called the epicentre.',
      },
      {
        partner: 'star',
        text: 'Scientists measure the size of earthquakes using a scale called the Richter scale, or the more modern moment magnitude scale. Small earthquakes, below magnitude 3, happen thousands of times every day and are too gentle to be felt. A magnitude 5 earthquake can rattle windows and knock items off shelves. A magnitude 8 or above is catastrophic, capable of toppling entire cities. The largest earthquake ever recorded measured 9.5 and struck Chile in 1960.',
      },
      {
        partner: 'moon',
        text: 'One of the most dangerous consequences of an undersea earthquake is a tsunami. When the ocean floor suddenly shifts upward, it pushes an enormous volume of water upward too. This creates a series of waves that can travel across entire ocean basins at the speed of a jet plane. In deep water these waves are barely noticeable, but as they approach shallow coastlines they slow down, grow taller, and can crash ashore as walls of water many metres high.',
      },
      {
        partner: 'star',
        text: 'While earthquakes cannot yet be predicted with precision, scientists called seismologists constantly monitor the Earth for warning signs. Countries that experience frequent earthquakes, like Japan and New Zealand, have strict building codes requiring structures to flex rather than collapse during shaking. Early warning systems can now detect the first waves of an earthquake and send alerts to cities seconds before the stronger shaking arrives — enough time to take cover and save lives.',
      },
    ],
  },
  {
    id: 'everest',
    title: 'Mount Everest: Top of the World',
    icon: '🏔️',
    subject: 'Geography & Adventure',
    palette: {
      bg: 'from-sky-600 to-indigo-700',
      light: 'bg-sky-50',
      border: 'border-sky-200',
      badge: 'bg-sky-100 text-sky-800',
      accent: 'text-sky-700',
      star: '#075985',
      moon: '#3730a3',
      headerText: 'text-white',
    },
    illustration: '❄️',
    paragraphs: [
      {
        partner: 'star',
        text: 'Rising 8,849 metres above sea level in the Himalayan mountain range between Nepal and Tibet, Mount Everest is the highest point on the surface of the Earth. Known as Sagarmatha in Nepali and Chomolungma in Tibetan — both meaning "Goddess Mother of the World" — the mountain has drawn explorers, adventurers, and climbers for over a century. Simply reaching its summit is considered one of the greatest achievements a human being can accomplish.',
      },
      {
        partner: 'moon',
        text: 'The conditions on Everest are among the harshest on the planet. Near the summit, temperatures can plunge to minus 60 degrees Celsius, and winds can exceed 280 kilometres per hour — fast enough to hurl a climber off the mountain. Perhaps most dangerously, the air at the summit contains only one-third the oxygen found at sea level. Without supplemental oxygen from tanks, most climbers would lose consciousness within minutes and die within hours.',
      },
      {
        partner: 'star',
        text: 'On 29 May 1953, New Zealand mountaineer Edmund Hillary and Tenzing Norgay, a Sherpa from Nepal, became the first confirmed climbers to stand on the summit of Everest. The news reached London just in time for Queen Elizabeth II\'s coronation, and the two men became instant global heroes. Tenzing had already attempted the mountain six times before this successful climb — a testament to the extraordinary determination the mountain demands.',
      },
      {
        partner: 'moon',
        text: 'Sherpas — members of a Himalayan people who have lived near Everest for generations — are the backbone of almost every major expedition on the mountain. Adapted by thousands of years of high-altitude living, Sherpas can carry enormous loads at heights where most people struggle to breathe. They fix the ropes, establish camps, carry supplies, and guide climbers to the summit. Without Sherpas, most Everest expeditions would be impossible.',
      },
      {
        partner: 'star',
        text: 'Today, more than 6,000 people have reached the summit of Everest, and the mountain has become crowded with climbers each spring season. This success has brought new challenges: the slopes are littered with abandoned equipment and waste, and the famous "death zone" above 8,000 metres sees dangerous queues of climbers waiting to push for the summit. Conservation groups and the Nepali government are working to clean up the mountain and preserve this natural wonder for future generations.',
      },
    ],
  },
  {
    id: 'deep-sea',
    title: 'Into the Deep: The Mystery of the Ocean Floor',
    icon: '🌊',
    subject: 'Ocean Science',
    palette: {
      bg: 'from-blue-800 to-indigo-900',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-900',
      accent: 'text-blue-800',
      star: '#1e3a8a',
      moon: '#312e81',
      headerText: 'text-white',
    },
    illustration: '🔦',
    paragraphs: [
      {
        partner: 'star',
        text: 'Humans have explored the surface of the Moon more thoroughly than the depths of our own oceans. The deep sea — any ocean water below 200 metres — covers more than half of the Earth\'s surface, yet remains largely unknown. It is completely dark, bitterly cold, and subject to crushing pressures that would flatten a submarine not designed to withstand them. Despite these extreme conditions, life down there is not just surviving — it is thriving.',
      },
      {
        partner: 'moon',
        text: 'The deepest place on Earth is the Mariana Trench in the Pacific Ocean, plunging nearly 11 kilometres below the surface. If you dropped Mount Everest into it, the peak would still be more than two kilometres underwater. The pressure at the very bottom is over 1,000 times greater than at the surface — equivalent to having 50 jumbo jets stacked on top of you. In 1960, two explorers descended to the bottom in a submersible and found, to everyone\'s amazement, a small fish living there.',
      },
      {
        partner: 'star',
        text: 'In the total darkness of the deep ocean, many creatures have evolved their own light — a phenomenon called bioluminescence. The anglerfish dangles a glowing lure above its enormous jaws to attract curious prey. Firefly squid flash patterns of blue light to communicate with each other. Some deep-sea shrimp squirt clouds of glowing liquid to confuse predators, then vanish into the darkness. Scientists estimate that up to 90 percent of all deep-sea animals produce some form of light.',
      },
      {
        partner: 'moon',
        text: 'Far from sunlight, the deep ocean floor was once thought to be a barren wasteland. Then scientists discovered hydrothermal vents — cracks in the ocean floor that spew superheated, mineral-rich water. Around these vents, entire ecosystems thrive without a single ray of sunlight. Giant tube worms up to two metres long, ghostly white crabs, and unique species of clams cluster around these vents, powered not by the sun but by chemical energy from the Earth itself.',
      },
      {
        partner: 'star',
        text: 'The deep ocean is more than a scientific curiosity — it plays a crucial role in regulating our planet\'s climate. Deep ocean currents act like a global conveyor belt, carrying heat around the world and absorbing vast amounts of carbon dioxide from the atmosphere. New species are discovered in the deep sea every year, and many have already led to important medical breakthroughs. Protecting this vast, mysterious world is one of the most urgent challenges facing ocean science today.',
      },
    ],
  },
  {
    id: 'ancient-rome',
    title: 'Ancient Rome: An Empire Built to Last',
    icon: '🏛️',
    subject: 'History',
    palette: {
      bg: 'from-rose-600 to-red-700',
      light: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-100 text-rose-800',
      accent: 'text-rose-700',
      star: '#9f1239',
      moon: '#7f1d1d',
      headerText: 'text-white',
    },
    illustration: '⚔️',
    paragraphs: [
      {
        partner: 'star',
        text: 'At its height, the Roman Empire was one of the most powerful civilisations the world has ever seen. Stretching from Britain in the northwest to Egypt in the southeast, it encompassed over five million square kilometres and was home to more than 70 million people — roughly one quarter of the entire world\'s population at the time. For 500 years, the city of Rome stood at the centre of this vast empire, governing it with remarkable sophistication.',
      },
      {
        partner: 'moon',
        text: 'The Romans were master builders whose engineering achievements still astonish us today. They invented concrete, constructed over 400,000 kilometres of roads — many of which form the basis of modern roads in Europe — and built aqueducts that carried fresh water for hundreds of kilometres to supply cities and public baths. The Colosseum in Rome, completed in 80 CE, could seat 50,000 spectators and featured a system of tunnels, lifts, and trapdoors beneath its arena floor.',
      },
      {
        partner: 'star',
        text: 'Roman society was strictly organised. At the top were patricians — wealthy, noble families who controlled much of the land and political power. Below them were plebeians, the ordinary citizens — farmers, craftsmen, and traders. At the bottom were slaves, who did much of the hard labour and had no rights at all. Despite this inequality, Rome also developed one of history\'s earliest legal systems, with ideas about justice and rights that still influence laws around the world today.',
      },
      {
        partner: 'moon',
        text: 'The Roman army was the engine that built and maintained the empire. Divided into units called legions of around 5,000 soldiers, the Roman military was extraordinarily well-organised and disciplined. Soldiers trained constantly, built their own roads and forts, and served for 25 years. In return, they received pay, equipment, and a plot of land when they retired. This professional army allowed Rome to conquer — and hold — a territory far larger than any before it.',
      },
      {
        partner: 'star',
        text: 'The Roman Empire gradually declined through a combination of political instability, economic trouble, and pressure from tribes along its borders. In 476 CE, the last Roman emperor of the west was overthrown — an event historians often mark as the end of the ancient world. Yet Rome\'s legacy lives on. Its language, Latin, is the root of French, Spanish, Italian, and Portuguese. Its architecture inspired buildings across the world, and its legal and political ideas helped shape modern democracy.',
      },
    ],
  },
  {
    id: 'bees',
    title: 'Bees: Nature\'s Most Valuable Workers',
    icon: '🐝',
    subject: 'Animal Science',
    palette: {
      bg: 'from-yellow-400 to-amber-600',
      light: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-900',
      accent: 'text-yellow-700',
      star: '#92400e',
      moon: '#78350f',
      headerText: 'text-white',
    },
    illustration: '🌻',
    paragraphs: [
      {
        partner: 'star',
        text: 'If you have ever eaten an apple, a strawberry, or a slice of watermelon, you have a bee to thank. Bees are among the most important creatures on Earth, responsible for pollinating roughly one third of all the food that humans eat. As they travel from flower to flower collecting nectar to make honey, tiny grains of pollen stick to their fuzzy bodies and get transferred between plants, allowing those plants to reproduce and bear fruit.',
      },
      {
        partner: 'moon',
        text: 'A honeybee hive is one of nature\'s most extraordinary communities. A single hive can contain up to 80,000 bees, all working together with remarkable organisation. At the centre is the queen, whose sole job is to lay eggs — sometimes more than 1,500 per day. Worker bees, all female, do everything else: foraging for nectar, making honey, building and repairing the wax honeycomb, guarding the entrance, and caring for the young.',
      },
      {
        partner: 'star',
        text: 'Bees have a remarkable way of sharing information with each other. When a worker bee finds a good source of nectar, she returns to the hive and performs what scientists call a "waggle dance" — a figure-eight movement that tells other bees exactly where the flowers are, how far away they are, and how good the nectar is. This dance language, decoded by scientists in the 1940s, is one of the most sophisticated communication systems in the entire animal kingdom.',
      },
      {
        partner: 'moon',
        text: 'Making honey is a complex process that takes enormous effort. Worker bees collect nectar from flowers and carry it back to the hive in a special honey stomach. Back at the hive, they pass the nectar between each other, adding enzymes that begin breaking it down. The bees then fan the nectar with their wings to evaporate the water until it thickens into honey. It takes the entire lifetime\'s work of twelve bees to produce just one teaspoon of honey.',
      },
      {
        partner: 'star',
        text: 'Bee populations around the world are declining at an alarming rate due to habitat loss, pesticides, disease, and climate change. Scientists have described this as a global crisis, because without bees, entire food systems would collapse. Gardeners and farmers can help by planting wildflowers, reducing chemical use, and providing small bee hotels for solitary bee species. Even a single pot of lavender on a balcony can provide a vital food source for these irreplaceable insects.',
      },
    ],
  },
  {
    id: 'trains',
    title: 'Full Steam Ahead: The History of the Train',
    icon: '🚂',
    subject: 'History & Technology',
    palette: {
      bg: 'from-zinc-600 to-slate-800',
      light: 'bg-zinc-50',
      border: 'border-zinc-200',
      badge: 'bg-zinc-100 text-zinc-800',
      accent: 'text-zinc-700',
      star: '#27272a',
      moon: '#1e293b',
      headerText: 'text-white',
    },
    illustration: '🛤️',
    paragraphs: [
      {
        partner: 'star',
        text: 'Before trains existed, travelling long distances was slow, exhausting, and often dangerous. A journey from one city to another might take days or even weeks by horse and carriage. Then, in 1804, a British engineer named Richard Trevithick built the world\'s first steam-powered locomotive — a machine that used boiling water to create steam, which pushed pistons to turn wheels. The age of the train had begun, and the world would never be the same.',
      },
      {
        partner: 'moon',
        text: 'The railway revolution transformed societies across the globe. Goods that once took weeks to transport could now reach distant markets in days. Fresh food, coal, and manufactured products moved across countries with ease. Towns and cities that were connected by rail grew rapidly, while those that were bypassed often declined. In many countries, the railway literally determined which towns would flourish and which would fade away.',
      },
      {
        partner: 'star',
        text: 'One of the greatest railway achievements was the completion of the transcontinental railroad in the United States in 1869, which connected the east and west coasts of the country for the first time. Built by thousands of workers — many of them Irish immigrants and Chinese labourers — the railroad spanned nearly 3,000 kilometres across deserts, plains, and mountain ranges. When the final spike was driven in, the nation celebrated with the ringing of church bells from coast to coast.',
      },
      {
        partner: 'moon',
        text: 'Modern trains are extraordinary feats of engineering. Japan\'s Shinkansen — known as the bullet train — first launched in 1964 and now carries passengers at speeds of up to 320 kilometres per hour. France\'s TGV network and China\'s high-speed rail system are among the busiest and fastest in the world. Maglev trains, which use powerful magnets to float above the track entirely, have reached experimental speeds of over 600 kilometres per hour.',
      },
      {
        partner: 'star',
        text: 'As concerns about climate change grow, trains are increasingly seen as a vital part of a sustainable future. A high-speed train produces up to 90 percent less carbon emissions per passenger than an equivalent aeroplane journey. Many countries are now investing billions of dollars in expanding their rail networks, electrifying existing lines, and developing the next generation of hydrogen-powered and hyperloop transport systems that could one day carry passengers at near-aircraft speeds in vacuum tubes.',
      },
    ],
  },
  {
    id: 'blue-whale',
    title: 'Blue Whales: Giants of the Ocean',
    icon: '🐋',
    subject: 'Ocean Science',
    palette: {
      bg: 'from-blue-500 to-cyan-700',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-900',
      accent: 'text-blue-700',
      star: '#1d4ed8',
      moon: '#0e7490',
      headerText: 'text-white',
    },
    illustration: '🌊',
    paragraphs: [
      {
        partner: 'star',
        text: 'The blue whale is the largest animal that has ever lived on Earth — bigger than any dinosaur, bigger than any creature that has roamed the land or swum the seas in all of known history. An adult blue whale can grow up to 33 metres long and weigh as much as 200 tonnes. Its heart alone is the size of a small car, and its blood vessels are wide enough for a child to crawl through.',
      },
      {
        partner: 'moon',
        text: 'Despite their immense size, blue whales feed almost exclusively on some of the smallest creatures in the ocean — tiny shrimp-like animals called krill. A single blue whale consumes up to four tonnes of krill every day during the feeding season. To do this, it lunges through dense krill swarms with its enormous mouth wide open, taking in up to 90 tonnes of water and krill at once, then pushing the water out through sieve-like plates called baleen while trapping the krill inside.',
      },
      {
        partner: 'star',
        text: 'Blue whales are among the loudest animals on Earth. Their deep, rumbling calls — far below what humans can hear — can travel hundreds or even thousands of kilometres through the ocean. Scientists believe these calls help whales communicate with each other across vast stretches of ocean and may also play a role in finding mates. Each population of blue whales has its own distinct dialect — a unique song pattern that differs from other populations around the world.',
      },
      {
        partner: 'moon',
        text: 'Blue whales were once found in every ocean on Earth, but commercial whaling in the nineteenth and twentieth centuries brought them to the brink of extinction. By the mid-twentieth century, hunters using explosive harpoons had reduced the global population from an estimated 350,000 to just a few hundred individuals. An international ban on hunting blue whales was introduced in 1966, and populations have slowly begun to recover — but they remain endangered today.',
      },
      {
        partner: 'star',
        text: 'Scientists study blue whales using a range of remarkable techniques: attaching satellite tags to track their migrations, recording their calls with underwater microphones, and identifying individuals from aerial photographs of their unique tail markings. We now know that blue whales migrate thousands of kilometres between cold, krill-rich feeding grounds and warmer tropical waters where they breed. Much about their lives — including where they give birth — remains a mystery, waiting to be discovered.',
      },
    ],
  },
  {
    id: 'moon',
    title: 'Our Moon: Earth\'s Closest Neighbour',
    icon: '🌕',
    subject: 'Space Science',
    palette: {
      bg: 'from-violet-700 to-slate-800',
      light: 'bg-violet-50',
      border: 'border-violet-200',
      badge: 'bg-violet-100 text-violet-900',
      accent: 'text-violet-700',
      star: '#4c1d95',
      moon: '#1e1b4b',
      headerText: 'text-white',
    },
    illustration: '🌌',
    paragraphs: [
      {
        partner: 'star',
        text: 'On a clear night, the Moon is the brightest object in the sky — and the only place beyond Earth that human beings have ever walked. Our Moon is about 384,000 kilometres away, which sounds enormous, but in cosmic terms it is our closest neighbour. It is roughly one quarter the size of Earth, making it unusually large compared to the moons of other planets in our solar system, and scientists believe it was formed around 4.5 billion years ago.',
      },
      {
        partner: 'moon',
        text: 'The most widely accepted theory of how the Moon formed is called the Giant Impact Hypothesis. According to this theory, early in Earth\'s history, a planet roughly the size of Mars — nicknamed Theia — smashed into the young Earth at an angle. The collision blasted an enormous cloud of molten rock and debris into orbit around Earth. Over millions of years, gravity pulled this material together, and it slowly formed into the Moon we see today.',
      },
      {
        partner: 'star',
        text: 'The Moon has a powerful effect on Earth even from its great distance. Its gravitational pull is the main cause of the ocean tides — the daily rise and fall of sea levels around the world. The Moon also helps stabilise the tilt of Earth\'s axis, which gives us our seasons. Without the Moon, scientists believe Earth\'s axis would wobble unpredictably over thousands of years, causing chaotic swings in climate that might have made complex life impossible.',
      },
      {
        partner: 'moon',
        text: 'The surface of the Moon is covered in craters, mountains, and vast flat plains called maria — a Latin word meaning "seas," named by early astronomers who mistakenly thought they were bodies of water. Because the Moon has no atmosphere, there is no wind or rain to wear these features away. Some of the craters you can see through a telescope were formed billions of years ago and look almost exactly as they did when they were first created.',
      },
      {
        partner: 'star',
        text: 'Twelve human beings have walked on the Moon, all of them American astronauts between 1969 and 1972. They brought back 382 kilograms of Moon rock and soil, which scientists are still studying today. Now, more than 50 years later, several nations — including the United States, China, and India — have ambitious plans to return humans to the Moon, build permanent bases there, and use it as a launching point for future missions to Mars and beyond.',
      },
    ],
  },
  {
    id: 'lions',
    title: 'Lions: Pride, Power, and Survival',
    icon: '🦁',
    subject: 'Animal Science',
    palette: {
      bg: 'from-orange-500 to-yellow-600',
      light: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-900',
      accent: 'text-orange-700',
      star: '#7c2d12',
      moon: '#713f12',
      headerText: 'text-white',
    },
    illustration: '🌅',
    paragraphs: [
      {
        partner: 'star',
        text: 'Known as the "king of the jungle," the lion is one of the most iconic animals on Earth — though it actually lives on grasslands and open savannas, not in jungles at all. Lions are the only truly social members of the cat family. They live in family groups called prides, which typically consist of several related females, their cubs, and a small number of males. This social lifestyle gives them a crucial advantage when it comes to hunting and defending territory.',
      },
      {
        partner: 'moon',
        text: 'Contrary to popular belief, it is the female lions — called lionesses — who do most of the hunting for the pride. Working together in coordinated groups, they fan out to surround prey and cut off escape routes before launching their attack. Lions hunt at night and at dawn when their excellent low-light vision gives them an advantage. Their favourite prey includes zebras, wildebeest, and buffalo, though they will eat almost anything they can catch, including baby elephants.',
      },
      {
        partner: 'star',
        text: 'A lion\'s roar is one of the most powerful sounds in nature. It can be heard from up to eight kilometres away and serves as a warning to rival prides to stay out of the territory. Lions have the loudest roar of any big cat, and their roars are so individual that researchers can identify specific lions just by listening to recordings. Cubs are born without any roaring ability and take up to a year to develop their first proper roar.',
      },
      {
        partner: 'moon',
        text: 'Lion cubs are born with spotted fur that gradually fades as they grow, possibly a camouflage adaptation from an ancestor that lived in a more forested environment. Cubs are raised communally — all the lionesses in a pride will nurse and care for each other\'s young. Life as a cub is risky, however. Up to 80 percent of lion cubs die before reaching adulthood, from predators like hyenas and leopards, or from starvation when prey is scarce.',
      },
      {
        partner: 'star',
        text: 'Lion numbers have fallen by around 40 percent in just the last three generations. Habitat loss, conflict with farmers protecting their livestock, and trophy hunting have all taken a heavy toll. A century ago, lions roamed across Africa and even parts of Europe and Asia. Today they are largely confined to protected reserves in sub-Saharan Africa, with a small, endangered population — fewer than 700 individuals — surviving in the Gir Forest of India. Conservation efforts are crucial to their survival.',
      },
    ],
  },
  {
    id: 'cave-art',
    title: 'Cave Paintings: Messages from the First Artists',
    icon: '🎨',
    subject: 'History & Art',
    palette: {
      bg: 'from-stone-600 to-amber-800',
      light: 'bg-stone-50',
      border: 'border-stone-200',
      badge: 'bg-stone-100 text-stone-800',
      accent: 'text-stone-700',
      star: '#57534e',
      moon: '#78350f',
      headerText: 'text-white',
    },
    illustration: '🦬',
    paragraphs: [
      {
        partner: 'star',
        text: 'Deep inside caves across Europe, Africa, Asia, and Australia, some of humanity\'s earliest art has survived for tens of thousands of years. Painted onto cave walls by the light of flickering torches, these ancient images of animals, human hands, and mysterious symbols are a direct message from our prehistoric ancestors. The oldest known cave paintings were discovered in Indonesia and are estimated to be at least 45,500 years old.',
      },
      {
        partner: 'moon',
        text: 'The caves of Lascaux in France, discovered in 1940, contain some of the most spectacular prehistoric art ever found. Painted roughly 17,000 years ago, the walls are covered with more than 600 images of horses, bison, deer, bears, and rhinoceroses rendered in vivid ochre, black, and red. The artists used natural pigments mixed with animal fat, and applied paint by blowing through hollow bones — making them some of the world\'s earliest airbrush artists.',
      },
      {
        partner: 'star',
        text: 'One of the most common images in prehistoric cave art around the world is the outline of a human hand. Artists pressed their hands against the wall and blew pigment around them to leave a stencil, or dipped their hands in paint and pressed them directly onto the rock. These handprints have been found on every continent except Antarctica, and some of them — based on finger length — were made by women and children, suggesting that cave painting was not just a male activity.',
      },
      {
        partner: 'moon',
        text: 'Why did prehistoric people make cave art? Archaeologists have debated this question for over a century. Some believe the paintings were part of hunting rituals — that by depicting prey animals, hunters hoped to ensure a successful hunt. Others think the caves were sacred spaces used for ceremonies or storytelling. Some researchers have even suggested that people entered deep, dark caves specifically to experience the strange visual effects that occur when humans are deprived of light for long periods.',
      },
      {
        partner: 'star',
        text: 'Cave art tells us something profound: that tens of thousands of years ago, humans were not so different from us. They observed the world around them carefully, developed skills to express what they saw, and felt a deep desire to create and communicate. The presence of art — whether scratched into a cave wall or displayed in a modern gallery — is one of the defining characteristics of what it means to be human, and it stretches back further than we ever imagined.',
      },
    ],
  },
  {
    id: 'tornadoes',
    title: 'Tornadoes: Nature\'s Most Violent Storms',
    icon: '🌪️',
    subject: 'Earth Science',
    palette: {
      bg: 'from-gray-600 to-slate-700',
      light: 'bg-gray-50',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-800',
      accent: 'text-gray-700',
      star: '#374151',
      moon: '#1e293b',
      headerText: 'text-white',
    },
    illustration: '⚡',
    paragraphs: [
      {
        partner: 'star',
        text: 'A tornado is one of the most terrifying and destructive forces in nature — a rapidly rotating column of air extending from a thunderstorm cloud down to the ground. Tornadoes can form in minutes and travel across the landscape at speeds of up to 100 kilometres per hour, with the winds inside spinning at over 480 kilometres per hour in the most powerful examples. They can uproot trees, demolish buildings, and toss cars hundreds of metres through the air.',
      },
      {
        partner: 'moon',
        text: 'Tornadoes form under very specific conditions. When warm, humid air near the ground meets cold, dry air higher in the atmosphere, the warm air is forced rapidly upward. If there are also horizontal winds blowing at different speeds and directions at different altitudes, this can cause the rising air to begin rotating. Under the right conditions, this rotating column of air can extend downward from a thunderstorm to create a tornado. The process can unfold with terrifying speed.',
      },
      {
        partner: 'star',
        text: 'The United States experiences more tornadoes than any other country on Earth — around 1,200 per year. Most occur in a region of the central United States nicknamed "Tornado Alley," stretching from Texas north through Oklahoma, Kansas, and Nebraska, where the flat landscape and clash of air masses from the Rocky Mountains and the Gulf of Mexico create ideal tornado conditions. In April and May each spring, communities in this region live on constant alert.',
      },
      {
        partner: 'moon',
        text: 'Scientists called storm chasers deliberately drive towards tornadoes to study them up close. Using specialised vehicles fitted with instruments and cameras, they try to collect data that helps improve tornado warnings and our understanding of how these storms work. It is extremely dangerous work. Modern Doppler radar technology can detect the rotating winds inside a thunderstorm and issue warnings several minutes before a tornado touches down — enough time for people to take shelter.',
      },
      {
        partner: 'star',
        text: 'Australia experiences more tornadoes than most people realise — though they are generally smaller and less frequent than those in the United States. They can occur in any state and at any time of year, most commonly along the coast and in the southwest. If you are ever caught in a tornado warning, the safest place is underground in a basement or storm shelter. If indoors, move to the smallest interior room on the lowest floor, away from windows, and protect your head.',
      },
    ],
  },
  {
    id: 'castles',
    title: 'Medieval Castles: Life Behind the Walls',
    icon: '🏰',
    subject: 'History',
    palette: {
      bg: 'from-purple-700 to-indigo-800',
      light: 'bg-purple-50',
      border: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-900',
      accent: 'text-purple-700',
      star: '#4c1d95',
      moon: '#312e81',
      headerText: 'text-white',
    },
    illustration: '⚔️',
    paragraphs: [
      {
        partner: 'star',
        text: 'For much of the Middle Ages — roughly from the ninth to the fifteenth century — castles were the most important buildings in Europe. Part fortress, part palace, and part community hub, a castle served as the home and headquarters of a powerful lord or king, and the centre of political and military power for the surrounding region. More than 25,000 medieval castles have been identified across Europe, many of which still stand today as some of the continent\'s most visited landmarks.',
      },
      {
        partner: 'moon',
        text: 'Early castles were simple wooden structures built on raised mounds of earth called mottes, surrounded by enclosed courtyards called baileys. Over time, builders began constructing in stone, creating far stronger and more elaborate fortifications. They added tall towers for watching the countryside, thick outer walls called curtain walls, and deep water-filled ditches called moats to prevent attackers from reaching the walls. Some castles took decades and thousands of workers to complete.',
      },
      {
        partner: 'star',
        text: 'Life inside a medieval castle was very different for different people. The lord and his family lived in relative comfort in a grand hall and private chambers, eating elaborate feasts and hosting tournaments in the courtyard below. Servants, soldiers, and craftspeople also lived within the castle walls in much more cramped conditions. For the peasants who worked the farmland surrounding the castle, the drawbridge and portcullis offered safety in times of attack — in exchange for loyalty and rent paid in crops.',
      },
      {
        partner: 'moon',
        text: 'Attacking a well-built castle was an enormous challenge. Sieges — where an army surrounded a castle and cut off its food and water supply — could last for months or even years. Attackers used giant war machines called trebuchets to hurl boulders at the walls, tunnelled beneath foundations to make them collapse, and sometimes catapulted diseased animal carcasses over the walls to spread sickness. Defenders poured boiling water or oil from the battlements and fired arrows through narrow slits called arrow loops.',
      },
      {
        partner: 'star',
        text: 'The invention of gunpowder and cannons gradually made stone castle walls obsolete — no walls could withstand repeated cannon fire for long. By the sixteenth century, most new military fortifications were being built differently, with low, angled earthen walls that absorbed cannon fire rather than shattering. Many castles were abandoned, fell into ruin, or were converted into stately homes. Today they stand as dramatic reminders of a world built on courage, conflict, and the constant search for power.',
      },
    ],
  },
  {
    id: 'electricity',
    title: 'Electricity: The Power That Changed Everything',
    icon: '⚡',
    subject: 'Science & Technology',
    palette: {
      bg: 'from-yellow-500 to-orange-500',
      light: 'bg-yellow-50',
      border: 'border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-900',
      accent: 'text-yellow-700',
      star: '#92400e',
      moon: '#c2410c',
      headerText: 'text-white',
    },
    illustration: '💡',
    paragraphs: [
      {
        partner: 'star',
        text: 'Look around any room and you will find electricity at work. The lights, the screens, the sounds — almost everything in modern life depends on it. Electricity is a form of energy created by the movement of tiny particles called electrons. When electrons flow through a material like a copper wire, they create an electric current. That current can be used to power everything from a humble torch bulb to an entire city\'s train network.',
      },
      {
        partner: 'moon',
        text: 'Humans have known about electricity in nature for thousands of years — lightning strikes were terrifying and mysterious to ancient peoples. But it was not until the eighteenth century that scientists began to understand and harness it. American inventor Benjamin Franklin famously flew a kite in a thunderstorm to prove that lightning was electrical in nature. A metal key attached to the kite string conducted electricity down into a jar, demonstrating that lightning and static electricity were the same phenomenon.',
      },
      {
        partner: 'star',
        text: 'The person who truly transformed electricity from a scientific curiosity into a practical power source was Thomas Edison. In 1879, after more than a thousand failed experiments, Edison successfully demonstrated the world\'s first practical incandescent light bulb. Within just a few years, he had designed and built one of the world\'s first electrical power stations in New York City, which supplied electricity to 59 customers. By the early twentieth century, electric lighting had begun to transform cities across the world.',
      },
      {
        partner: 'moon',
        text: 'Electricity can be generated in many different ways. Traditional power stations burn coal or gas to boil water, creating steam that spins giant turbines connected to generators. Hydroelectric dams use the power of falling water. Nuclear power stations use the heat produced by splitting atoms. Increasingly, solar panels convert sunlight directly into electricity, and wind turbines harness the power of the moving air. Each method has advantages and disadvantages, and the world is transitioning rapidly towards cleaner sources.',
      },
      {
        partner: 'star',
        text: 'Today, around 770 million people around the world still lack access to reliable electricity, living without the light, refrigeration, and communication technology that most of us take for granted. Providing clean, affordable electricity to every person on Earth is one of the great challenges of our century. Remarkably, the falling cost of solar panels means that for the first time in history, the answer may not lie in enormous centralised power stations, but in small, affordable solar panels installed on individual homes and communities.',
      },
    ],
  },
  {
    id: 'amazon-river',
    title: 'The Amazon River: Lifeline of a Continent',
    icon: '🌿',
    subject: 'Geography & Nature',
    palette: {
      bg: 'from-green-700 to-teal-700',
      light: 'bg-green-50',
      border: 'border-green-200',
      badge: 'bg-green-100 text-green-900',
      accent: 'text-green-700',
      star: '#14532d',
      moon: '#134e4a',
      headerText: 'text-white',
    },
    illustration: '🐊',
    paragraphs: [
      {
        partner: 'star',
        text: 'Winding nearly 7,000 kilometres across South America, the Amazon River is one of the most extraordinary rivers on Earth. By volume of water, it is by far the largest river in the world — carrying more water to the ocean than the next seven largest rivers combined. During the wet season, the Amazon can stretch up to 50 kilometres wide in some places, flooding vast areas of surrounding rainforest and creating a vast, shallow inland sea teeming with life.',
      },
      {
        partner: 'moon',
        text: 'The Amazon is home to an astonishing variety of wildlife found nowhere else on Earth. More than 3,000 species of fish swim its waters, including the fearsome piranha, the enormous arapaima fish which can grow up to three metres long, and the remarkable electric eel, which can generate a shock powerful enough to stun a horse. River dolphins — pink in colour and known as boto — navigate the murky waters using echolocation, just like their ocean-dwelling cousins.',
      },
      {
        partner: 'star',
        text: 'The Amazon floods its surrounding forests so reliably each year that the trees and animals that live there have evolved extraordinary adaptations to life partly underwater. Some trees can survive being submerged for six months at a time. Fish swim through the flooded forest eating fruit that falls from the trees above them, and in doing so they help spread seeds across vast distances — making fish one of the most important seed dispersers in the entire Amazon ecosystem.',
      },
      {
        partner: 'moon',
        text: 'For thousands of years, Indigenous peoples have called the Amazon home, developing deep knowledge of its plants, animals, and waterways. Today, around one million Indigenous people from hundreds of different nations still live in or near the Amazon. They are among the most effective guardians of the forest — studies consistently show that rainforest areas managed by Indigenous communities experience far lower rates of deforestation than areas outside their territories.',
      },
      {
        partner: 'star',
        text: 'The Amazon is under enormous pressure. Deforestation for cattle farming, soy plantations, and illegal gold mining has destroyed vast areas of rainforest in recent decades. Scientists warn that if too much forest is lost, the Amazon could reach a "tipping point" — where it can no longer generate enough rainfall to sustain itself and begins to dry out and die. Protecting the Amazon is not just a local issue — it affects the climate, the water cycle, and biodiversity for the entire planet.',
      },
    ],
  },
  {
    id: 'olympics',
    title: 'The Ancient Olympics: Glory, Sweat & Olive Wreaths',
    icon: '🏅',
    subject: 'History & Sport',
    palette: {
      bg: 'from-amber-500 to-yellow-600',
      light: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-800',
      accent: 'text-amber-700',
      star: '#92400e',
      moon: '#78350f',
      headerText: 'text-white',
    },
    illustration: '🏛️',
    paragraphs: [
      {
        partner: 'star',
        text: 'More than 2,700 years ago, in the small city of Olympia in ancient Greece, something remarkable began. In 776 BCE, Greek athletes gathered to compete in honour of Zeus, the king of the gods. These were the first Olympic Games, and they would be held every four years without fail for nearly twelve centuries. Wars were paused, and rival city-states set aside their disputes so athletes could travel safely to compete.',
      },
      {
        partner: 'moon',
        text: 'The events of the ancient Olympics were very different from today. Athletes competed in the stadion — a running race of about 192 metres — as well as wrestling, discus, javelin, and long jump. There was even a terrifying event called the pankration, which combined boxing and wrestling with almost no rules at all. Only free Greek men were allowed to compete, and many athletes competed in the nude.',
      },
      {
        partner: 'star',
        text: 'Winning at the ancient Olympics was one of the greatest honours a Greek man could achieve. The prize was not gold or silver, but a simple wreath of olive leaves — cut from a sacred tree near the Temple of Zeus. Yet winners were treated like heroes when they returned home. Poets wrote odes in their honour, cities built statues of them, and some were given free meals for life.',
      },
      {
        partner: 'moon',
        text: 'The ancient Games finally ended in 393 CE when the Roman Emperor Theodosius banned all pagan festivals. For more than 1,500 years, the Olympics were forgotten. It was a French educator named Pierre de Coubertin who revived them. In 1896, the first modern Olympic Games were held in Athens, Greece, with 14 nations sending 241 athletes to compete in 43 events.',
      },
      {
        partner: 'star',
        text: 'Today the Olympic Games are the world\'s largest sporting event, with over 200 nations and thousands of athletes competing every four years. While the prizes are now gold, silver, and bronze medals rather than olive wreaths, the spirit remains the same — the pursuit of excellence, the celebration of human achievement, and the hope that sport can bring the world together in peace.',
      },
    ],
  },
];

// ─── Print Styles ─────────────────────────────────────────────────────────────
const PrintStyles = () => (
  <style>{`
    @media print {
      body * { visibility: hidden !important; }
      #partner-reading-print-area,
      #partner-reading-print-area * { visibility: visible !important; }
      #partner-reading-print-area {
        position: fixed !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        z-index: 99999 !important;
        background: white !important;
      }
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  `}</style>
);

// ─── Partner Key Badge ────────────────────────────────────────────────────────
const PartnerKey = ({ palette }) => (
  <div
    style={{
      display: 'flex',
      gap: '24px',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8px 20px',
      background: 'rgba(255,255,255,0.18)',
      borderRadius: '999px',
      border: '1.5px solid rgba(255,255,255,0.35)',
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '13px', color: 'white' }}>
      <span style={{ fontSize: '17px' }}>⭐</span> Partner 1
    </span>
    <span style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.4)' }} />
    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, fontSize: '13px', color: 'white' }}>
      <span style={{ fontSize: '17px' }}>🌙</span> Partner 2
    </span>
  </div>
);

// ─── Printable Passage View ───────────────────────────────────────────────────
const PrintView = ({ passage, onClose }) => {
  const handlePrint = () => window.print();

  const gradientStart = passage.id === 'octopus' ? '#0e7490' :
    passage.id === 'volcano' ? '#c2410c' :
    passage.id === 'space' ? '#4338ca' :
    passage.id === 'rainforest' ? '#065f46' : '#92400e';

  const gradientEnd = passage.id === 'octopus' ? '#1d4ed8' :
    passage.id === 'volcano' ? '#9f1239' :
    passage.id === 'space' ? '#7e22ce' :
    passage.id === 'rainforest' ? '#166534' : '#78350f';

  const accentLight = passage.id === 'octopus' ? '#e0f2fe' :
    passage.id === 'volcano' ? '#fff7ed' :
    passage.id === 'space' ? '#eef2ff' :
    passage.id === 'rainforest' ? '#ecfdf5' : '#fffbeb';

  const borderColor = passage.id === 'octopus' ? '#bae6fd' :
    passage.id === 'volcano' ? '#fed7aa' :
    passage.id === 'space' ? '#c7d2fe' :
    passage.id === 'rainforest' ? '#a7f3d0' : '#fde68a';

  return (
    <div>
      <PrintStyles />

      {/* Screen controls — hidden when printing */}
      <div className="print:hidden flex items-center justify-between mb-5 flex-wrap gap-3">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold text-sm px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all"
        >
          ← Back to Passages
        </button>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-teal-700 shadow-md transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Save as PDF
          </button>
        </div>
      </div>

      {/* The printable A4 page */}
      <div
        id="partner-reading-print-area"
        style={{
          width: '210mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          margin: '0 auto',
          background: 'white',
          boxShadow: '0 4px 40px rgba(0,0,0,0.15)',
          fontFamily: '"Georgia", "Times New Roman", serif',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
            padding: '14px 28px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
                fontFamily: 'Arial, sans-serif',
                marginBottom: '4px',
              }}>
                Partner Reading · {passage.subject}
              </div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 900,
                color: 'white',
                margin: 0,
                lineHeight: 1.15,
                fontFamily: 'Arial Black, Arial, sans-serif',
              }}>
                {passage.title}
              </h1>
            </div>
            <div style={{ fontSize: '52px', lineHeight: 1, opacity: 0.9 }}>
              {passage.illustration}
            </div>
          </div>
          <PartnerKey />
        </div>

        {/* Decorative divider */}
        <div style={{
          height: '5px',
          background: `repeating-linear-gradient(90deg, ${gradientStart} 0, ${gradientStart} 10px, ${gradientEnd} 10px, ${gradientEnd} 20px)`,
          opacity: 0.25,
        }} />

        {/* Passages */}
        <div style={{
          flex: 1,
          padding: '12px 28px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '9px',
          background: accentLight,
        }}>
          {passage.paragraphs.map((para, index) => {
            const isStar = para.partner === 'star';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  background: 'white',
                  borderRadius: '10px',
                  padding: '9px 13px',
                  border: `1.5px solid ${borderColor}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}
              >
                {/* Symbol column */}
                <div style={{
                  flexShrink: 0,
                  width: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '1px',
                  gap: '3px',
                }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>
                    {isStar ? '⭐' : '🌙'}
                  </span>
                  <span style={{
                    fontSize: '8px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: isStar ? gradientStart : gradientEnd,
                    fontFamily: 'Arial, sans-serif',
                    whiteSpace: 'nowrap',
                  }}>
                    P{isStar ? '1' : '2'}
                  </span>
                </div>
                {/* Text */}
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#1e293b',
                  textAlign: 'justify',
                  fontFamily: 'Georgia, serif',
                }}>
                  {para.text}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '6px 28px',
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontFamily: 'Arial, sans-serif', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Educational Elements · Partner Reading
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Arial, sans-serif' }}>⭐ = Partner 1</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontFamily: 'Arial, sans-serif' }}>🌙 = Partner 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Passage Card ─────────────────────────────────────────────────────────────
const PassageCard = ({ passage, onSelect }) => {
  const gradientClass = `bg-gradient-to-br ${passage.palette.bg}`;
  return (
    <button
      onClick={() => onSelect(passage)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left border border-slate-100"
    >
      {/* Colour header */}
      <div className={`${gradientClass} p-5 flex items-center justify-between`}>
        <div>
          <span className={`inline-block text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full mb-2 ${passage.palette.badge}`}>
            {passage.subject}
          </span>
          <h3 className="text-white font-black text-base leading-snug pr-2" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
            {passage.title}
          </h3>
        </div>
        <span className="text-5xl opacity-90 flex-shrink-0 ml-2">{passage.illustration}</span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
          {passage.paragraphs[0].text}
        </p>

        {/* Partner key */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="text-base">⭐</span> Partner 1
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="text-base">🌙</span> Partner 2
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {passage.paragraphs.length} paragraphs
            </span>
          </div>
        </div>

        <div className={`w-full py-2.5 rounded-xl text-white text-sm font-bold text-center bg-gradient-to-r ${passage.palette.bg} group-hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Open &amp; Print
        </div>
      </div>
    </button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const PartnerReadingPassages = ({ showToast }) => {
  const [selectedPassage, setSelectedPassage] = useState(null);

  if (selectedPassage) {
    return (
      <PrintView
        passage={selectedPassage}
        onClose={() => setSelectedPassage(null)}
      />
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-700 px-8 py-9 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="text-6xl">🤝</div>
          <div>
            <div className="text-xs font-bold tracking-widest uppercase text-violet-300 mb-1">English · Reading</div>
            <h2 className="text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
              Partner Reading Passages
            </h2>
            <p className="text-violet-200 text-sm mt-1.5 max-w-xl leading-relaxed">
              Beautifully designed, printable passages for two readers. Each paragraph is labelled
              with&nbsp;<strong>⭐ Partner 1</strong>&nbsp;or&nbsp;<strong>🌙 Partner 2</strong>&nbsp;so partners take turns reading aloud.
            </p>
          </div>
        </div>

        {/* How to use strip */}
        <div className="relative z-10 mt-5 flex flex-wrap gap-3">
          {[
            { icon: '🖨️', label: 'Print-ready — fits one A4 page' },
            { icon: '📄', label: 'Save as PDF from print dialog' },
            { icon: '🤝', label: '25 engaging topics included' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Passage cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {passages.map(passage => (
          <PassageCard key={passage.id} passage={passage} onSelect={setSelectedPassage} />
        ))}
      </div>

      {/* Tip */}
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div>
          <p className="text-violet-800 font-bold text-sm">How to use these passages</p>
          <p className="text-violet-600 text-sm mt-0.5">
            Pair students up and open a passage. The student who reads ⭐ paragraphs is Partner 1, and the student reading 🌙 paragraphs is Partner 2. They take turns reading each paragraph aloud to each other. Use the <strong>Print</strong> button to print, or <strong>Save as PDF</strong> (choose "Save as PDF" from the print dialog) for digital use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerReadingPassages;
