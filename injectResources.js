const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const curriculumPath = path.join(__dirname, 'utils/curriculumData.js');
let code = fs.readFileSync(curriculumPath, 'utf8');

// Parse the file
const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
});

// A helper to create resource AST nodes
function createResourceNode(resource) {
    const props = [
        t.objectProperty(t.identifier('type'), t.stringLiteral(resource.type)),
        t.objectProperty(t.identifier('title'), t.stringLiteral(resource.title)),
        t.objectProperty(t.identifier('src'), t.stringLiteral(resource.src)),
        t.objectProperty(t.identifier('extra'), t.booleanLiteral(true))
    ];
    if (resource.thumbnail) {
        props.push(t.objectProperty(t.identifier('thumbnail'), t.stringLiteral(resource.thumbnail)));
    }
    return t.objectExpression(props);
}

// Function to find a subtopic node and add a resource
function addResourceToSubtopic(domainsNodeName, domainId, topicId, subtopicId, tabName, resourceData) {
    traverse(ast, {
        VariableDeclarator(path) {
            if (path.node.id.name === domainsNodeName) {
                // Find domain
                const domains = path.node.init.elements;
                const domain = domains.find(d => {
                    const idProp = d.properties.find(p => p.key.name === 'id');
                    return idProp && idProp.value.value === domainId;
                });

                if (!domain) return;

                // Find topc
                const topicsProp = domain.properties.find(p => p.key.name === 'topics');
                if (!topicsProp) return;

                const topic = topicsProp.value.elements.find(t => {
                    const idProp = t.properties.find(p => p.key.name === 'id');
                    return idProp && idProp.value.value === topicId;
                });
                if (!topic) return;

                // For some topics, subtopics are under categories
                let subtopicsArray = null;
                const subtopicsProp = topic.properties.find(p => p.key.name === 'subtopics');
                if (subtopicsProp) {
                    subtopicsArray = subtopicsProp.value.elements;
                } else {
                    const categoriesProp = topic.properties.find(p => p.key.name === 'categories');
                    if (categoriesProp) {
                        for (const cat of categoriesProp.value.elements) {
                            const stProp = cat.properties.find(p => p.key.name === 'subtopics');
                            if (stProp) {
                                const found = stProp.value.elements.find(st => {
                                    const idProp = st.properties.find(p => p.key.name === 'id');
                                    return idProp && idProp.value.value === subtopicId;
                                });
                                if (found) {
                                    subtopicsArray = stProp.value.elements;
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!subtopicsArray) return;

                const subtopic = subtopicsArray.find(st => {
                    const idProp = st.properties.find(p => p.key.name === 'id');
                    return idProp && idProp.value.value === subtopicId;
                });

                if (!subtopic) return;

                // Find or create 'resources'
                let resourcesProp = subtopic.properties.find(p => p.key.name === 'resources');
                if (!resourcesProp) {
                    resourcesProp = t.objectProperty(
                        t.identifier('resources'),
                        t.objectExpression([])
                    );
                    subtopic.properties.push(resourcesProp);
                }

                // Find or create tab (display/learn/practice)
                let tabProp = resourcesProp.value.properties.find(p => p.key.name === tabName);
                if (!tabProp) {
                    tabProp = t.objectProperty(
                        t.identifier(tabName),
                        t.arrayExpression([])
                    );
                    resourcesProp.value.properties.push(tabProp);
                }

                // Add the resource
                tabProp.value.elements.push(createResourceNode(resourceData));
            }
        }
    });
}

// ----------------------------------------------------
// LET'S MAP THE RESOURCES AUTOMATICALLY
// ----------------------------------------------------

const resourcesToInject = [
    // Visual Prompts (Literacy -> Writing Genres -> Creative Writing)
    ...Array.from({ length: 40 }, (_, i) => i + 1).map(i => ({
        domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'creative_writing', tab: 'practice',
        data: { type: 'image', title: `Visual Prompt ${i}`, src: `/Curriculum/Literacy/VisualPrompts/${i}.png` }
    })),
    // Persuasive Prompts (Literacy -> Writing Genres -> Persuasive Writing)
    ...Array.from({ length: 16 }, (_, i) => i + 1).map(i => ({
        domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'persuasive_writing', tab: 'practice',
        data: { type: 'image', title: `Persuasive Prompt ${i}`, src: `/Curriculum/Literacy/VisualPrompts/Persuasive/${i}.png` }
    })),
    // Comprehension Non-Fiction (Literacy -> Reading Skills -> Comprehension Strategies)
    ...['Bees', 'Climate', 'Fortnite', 'Volcanoes'].map(name => ({
        domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'reading_skills', subtopicId: 'comprehension_strategies', tab: 'practice',
        data: { type: 'image', title: `${name} Comprehension`, src: `/Curriculum/Literacy/Comprehension Pages/Non Fiction/${name}.png` }
    })),

    // Literacy Unit Resources
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'reading_skills', subtopicId: 'comprehension_strategies', tab: 'learn', data: { type: 'pdf', title: 'Comprehension Information Texts', src: '/Unit Resources/Literacy/Comprehension Information Texts.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'reading_skills', subtopicId: 'comprehension_strategies', tab: 'learn', data: { type: 'pdf', title: 'Reading Strategies', src: '/Unit Resources/Literacy/Reading Strategies.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'reading_skills', subtopicId: 'comprehension_strategies', tab: 'practice', data: { type: 'pdf', title: 'Leveled Comprehension PACK 1', src: '/Unit Resources/Literacy/Leveled Comprehension PACK 1.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'reading_skills', subtopicId: 'comprehension_strategies', tab: 'practice', data: { type: 'pdf', title: 'Leveled Comprehension PACK 2', src: '/Unit Resources/Literacy/Leveled Comprehension PACK 2.pdf' } },
    // Narrative Writing -> Themes/Messages
    { domainsNodeName: 'englishDomains', domainId: 'literature', topicId: 'narrative_texts', subtopicId: 'themes_messages', tab: 'learn', data: { type: 'pdf', title: 'Narnia Deep Magic and the Wardrobe', src: '/Unit Resources/Literacy/Narnia_Deep_Magic_and_the_Wardrobe.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literature', topicId: 'narrative_texts', subtopicId: 'character_development', tab: 'learn', data: { type: 'pdf', title: 'Character Creation Crew', src: '/Unit Resources/Literacy/Character_Creation_Crew_Building_Unforgettable_Sto.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literature', topicId: 'narrative_texts', subtopicId: 'character_development', tab: 'practice', data: { type: 'pdf', title: 'Character Profile Comprehension', src: '/Unit Resources/Literacy/Character Profile Comprehension.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literature', topicId: 'narrative_texts', subtopicId: 'story_elements', tab: 'learn', data: { type: 'pdf', title: 'Shelter, Shore, Identity, Craft', src: '/Unit Resources/Literacy/Shelter_Shore_Identity_Craft.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literature', topicId: 'literary_appreciation', subtopicId: 'comparing_texts', tab: 'learn', data: { type: 'pdf', title: 'Teresa: A New Australian Book Analysis', src: '/Unit Resources/Literacy/Teresa_A_New_Australian_Book_Analysis.pdf' } },
    // Figurative Language
    { domainsNodeName: 'englishDomains', domainId: 'language_features_style', topicId: 'figurative_language', subtopicId: 'simile_metaphor', tab: 'learn', data: { type: 'pdf', title: 'Comparison Cuties Metaphors and Similes', src: '/Unit Resources/Literacy/Comparison_Cuties_Metaphors_and_Similes.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'language_features_style', topicId: 'author_techniques', subtopicId: 'imagery', tab: 'learn', data: { type: 'pdf', title: 'Paint Worlds With Words', src: '/Unit Resources/Literacy/Paint_Worlds_With_Words.pdf' } },
    // Writing Genres
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'informative_writing', tab: 'learn', data: { type: 'pdf', title: 'The Nintendo Story', src: '/Unit Resources/Literacy/The_Nintendo_Story.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'informative_writing', tab: 'learn', data: { type: 'pdf', title: 'World Cup History The Global Game', src: '/Unit Resources/Literacy/World_Cup_History_The_Global_Game.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'creative_writing', tab: 'learn', data: { type: 'pdf', title: 'The Wilds of Writing A Field Guide', src: '/Unit Resources/Literacy/The_Wilds_of_Writing_A_Field_Guide.pdf' } },
    // Grammar 
    { domainsNodeName: 'englishDomains', domainId: 'how_english_works', topicId: 'grammar', subtopicId: 'nouns', tab: 'learn', data: { type: 'pdf', title: 'The Noun Hunt', src: '/Unit Resources/Literacy/The_Noun_Hunt.pdf' } },
    { domainsNodeName: 'englishDomains', domainId: 'how_english_works', topicId: 'grammar', subtopicId: 'conjunctions', tab: 'learn', data: { type: 'pdf', title: 'FANBOYS The Super Squad of Sentences', src: '/Unit Resources/Literacy/FANBOYS_The_Super_Squad_of_Sentences.pdf' } },

    // HASS Unit Resources
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'ancient_history', subtopicId: 'ancient_history', tab: 'learn', data: { type: 'pdf', title: 'Alexander Unbroken', src: '/Unit Resources/HASS/Alexander_Unbroken_The_Life_of_Conquest.pdf' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'ancient_history', subtopicId: 'ancient_history', tab: 'learn', data: { type: 'pdf', title: 'Attila Scourge and Sovereign', src: '/Unit Resources/HASS/Attila_Scourge_and_Sovereign.pdf' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'ancient_history', subtopicId: 'ancient_history', tab: 'learn', data: { type: 'pdf', title: 'Caesar\'s Path to Empire', src: '/Unit Resources/HASS/Caesar_s_Path_to_Empire.pdf' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'ancient_history', subtopicId: 'ancient_history', tab: 'learn', data: { type: 'pdf', title: 'Cleopatra Power Propaganda Legacy', src: '/Unit Resources/HASS/Cleopatra_Power_Propaganda_Legacy.pdf' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'ancient_history', subtopicId: 'ancient_history', tab: 'learn', data: { type: 'pptx', title: 'Historical Figures Presentations', src: '/Unit Resources/HASS/Historical Figures.pptx' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'australian_history', subtopicId: 'australian_history', tab: 'learn', data: { type: 'pdf', title: 'Australia Deep Time to Now', src: '/Unit Resources/HASS/Australia_Deep_Time_to_Now.pdf' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'wars_conflict', subtopicId: 'wars_conflict', tab: 'learn', data: { type: 'pdf', title: 'World War I Timeline', src: '/Unit Resources/HASS/World_War_I_Timeline_From_Spark_to_Treaty.pdf' } },
    { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'wars_conflict', subtopicId: 'wars_conflict', tab: 'learn', data: { type: 'pdf', title: 'The Second World War', src: '/Unit Resources/HASS/The_Second_World_War_1939-1945.pdf' } },

    // Science Unit Resources
    { domainsNodeName: 'scienceDomains', domainId: 'earth_space', topicId: 'space', subtopicId: 'space', tab: 'learn', data: { type: 'pdf', title: 'A City In The Stars', src: '/Unit Resources/Science/A_City_In_The_Stars.pdf' } },
    { domainsNodeName: 'scienceDomains', domainId: 'earth_space', topicId: 'space', subtopicId: 'space', tab: 'learn', data: { type: 'pdf', title: 'Celestial Clockwork', src: '/Unit Resources/Science/Celestial_Clockwork.pdf' } },
    { domainsNodeName: 'scienceDomains', domainId: 'earth_space', topicId: 'space', subtopicId: 'space', tab: 'learn', data: { type: 'pdf', title: 'Our Solar System Tour', src: '/Unit Resources/Science/Our_Solar_System_Tour.pdf' } },

    // Maths Unit Resources
    { domainsNodeName: 'mathDomains', domainId: 'measurement_geometry', topicId: 'money', subtopicId: 'money', tab: 'practice', data: { type: 'pdf', title: 'Australian Coins and Notes', src: '/Unit Resources/Mathematics/Australian Coins and Notes.pdf' } },
    { domainsNodeName: 'mathDomains', domainId: 'number_algebra', topicId: 'fractions', subtopicId: 'fractions', tab: 'learn', data: { type: 'pdf', title: 'Fraction Building Blocks', src: '/Unit Resources/Mathematics/Fraction_Building_Blocks.pdf' } },

    // English Displays
    ...['Poetry', 'Recount', 'SciFi Narratives'].map(name => ({
        domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'creative_writing', tab: 'display',
        data: { type: 'image', title: `${name} Display`, src: `/Displays/English/Writing/${name}.png` }
    })),
    ...['Characterisation', 'Imagery', 'Literary Devices', 'Metaphors', 'Personification', 'Setting', 'Similes', 'Symbolism'].map(name => ({
        domainsNodeName: 'englishDomains', domainId: 'language_features_style', topicId: 'author_techniques', subtopicId: 'imagery', tab: 'display',
        data: { type: 'image', title: `${name} Display`, src: `/Displays/English/Writing/Literary Devices/${name}.png` }
    })),
    // Mathematics Displays
    { domainsNodeName: 'mathDomains', domainId: 'measurement_geometry', topicId: '2d_shapes', subtopicId: '2d_shapes', tab: 'display', data: { type: 'image', title: '2D Shapes', src: '/Displays/Maths/2D Shapes.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'measurement_geometry', topicId: '3d_objects', subtopicId: '3d_objects', tab: 'display', data: { type: 'image', title: '3D Shapes', src: '/Displays/Maths/3D Shapes.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'number_algebra', topicId: 'addition_subtraction', subtopicId: 'addition_subtraction', tab: 'display', data: { type: 'image', title: 'Addition', src: '/Displays/Maths/Addition.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'number_algebra', topicId: 'addition_subtraction', subtopicId: 'addition_subtraction', tab: 'display', data: { type: 'image', title: 'Subtraction', src: '/Displays/Maths/Subtraction.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'number_algebra', topicId: 'multiplication_division', subtopicId: 'multiplication_division', tab: 'display', data: { type: 'image', title: 'Multiplication', src: '/Displays/Maths/Multiplication.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'number_algebra', topicId: 'multiplication_division', subtopicId: 'multiplication_division', tab: 'display', data: { type: 'image', title: 'Division', src: '/Displays/Maths/Division.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'measurement_geometry', topicId: 'length', subtopicId: 'length', tab: 'display', data: { type: 'image', title: 'Length', src: '/Displays/Maths/Length.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'measurement_geometry', topicId: 'mass', subtopicId: 'mass', tab: 'display', data: { type: 'image', title: 'Mass', src: '/Displays/Maths/Mass.png' } },
    { domainsNodeName: 'mathDomains', domainId: 'measurement_geometry', topicId: 'volume_capacity', subtopicId: 'volume_capacity', tab: 'display', data: { type: 'image', title: 'Volume', src: '/Displays/Maths/Volume.png' } },

    // Science Space Displays
    ...['Earth', 'Jupiter', 'Mars', 'Mercury', 'Neptune', 'Saturn', 'SolarSystem', 'SpaceVocab', 'Uranus', 'Venus'].map(name => ({
        domainsNodeName: 'scienceDomains', domainId: 'earth_space', topicId: 'space', subtopicId: 'space', tab: 'display',
        data: { type: 'image', title: `${name} Display`, src: `/Displays/Science/Space/${name}.png` }
    })),

    // Games Displays (Map them as well to Physical Ed or General? Just putting them under Cross Curricular English for now, or Oral Language)
    ...['20Questions', '2truths', 'Bang', 'CaptainsOrders', 'CelebrityHeads', 'Corners', 'FruitSalad', 'HeadsDownThumbsUp', 'HumanKnot', 'Musical Statues', 'OneWord', 'PSR', 'SecretLeader', 'SharksandMinnows', 'Silent Ball', 'SleepySpy'].map(name => ({
        domainsNodeName: 'englishDomains', domainId: 'oral_language', topicId: 'conversation_skills', subtopicId: 'conversation_skills', tab: 'practice',
        data: { type: 'image', title: `${name} Game Rules`, src: `/Displays/Games/${name}.png` }
    }))
];

// Add subtopics loop trick for topics that don't have subtopics natively
// but we just pass the topicId as subtopicId in getCurriculumData if subtopics array is missing
traverse(ast, {
    VariableDeclarator(path) {
        if (['englishDomains', 'mathDomains', 'scienceDomains', 'hassDomains'].includes(path.node.id.name)) {
            const domains = path.node.init.elements;
            domains.forEach(domain => {
                const topicsProp = domain.properties.find(p => p.key.name === 'topics');
                if (topicsProp) {
                    topicsProp.value.elements.forEach(topic => {
                        const idProp = topic.properties.find(p => p.key.name === 'id');
                        // Make sure every topic has a `subtopics` property with at least itself!

                        let hasSubtopics = topic.properties.some(p => p.key.name === 'subtopics' || p.key.name === 'categories');

                        if (!hasSubtopics && idProp) {
                            topic.properties.push(t.objectProperty(
                                t.identifier('subtopics'),
                                t.arrayExpression([
                                    t.objectExpression([
                                        t.objectProperty(t.identifier('id'), t.stringLiteral(idProp.value.value)),
                                        t.objectProperty(t.identifier('name'), t.stringLiteral('General')),
                                        t.objectProperty(t.identifier('resources'), t.objectExpression([
                                            t.objectProperty(t.identifier('display'), t.arrayExpression([])),
                                            t.objectProperty(t.identifier('learn'), t.arrayExpression([])),
                                            t.objectProperty(t.identifier('practice'), t.arrayExpression([]))
                                        ]))
                                    ])
                                ])
                            ));
                        }
                    });
                }
            });
        }
    }
});

resourcesToInject.forEach(r => {
    try {
        addResourceToSubtopic(r.domainsNodeName, r.domainId, r.topicId, r.subtopicId, r.tab, r.data);
    } catch (e) {
        console.log(`Failed to inject ${r.data.title}: ${e.message}`);
    }
});

const output = generate(ast, {}, code);
fs.writeFileSync(curriculumPath, output.code);
console.log('Successfully injected extra resources via AST!');
