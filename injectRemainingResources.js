const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const curriculumPath = path.join(__dirname, 'utils/curriculumData.js');
let code = fs.readFileSync(curriculumPath, 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
});

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

function addResourceToSubtopic(domainsNodeName, domainId, topicId, subtopicId, tabName, resourceData) {
    traverse(ast, {
        VariableDeclarator(path) {
            if (path.node.id.name === domainsNodeName) {
                const domains = path.node.init.elements;
                const domain = domains.find(d => {
                    const idProp = d.properties.find(p => p.key.name === 'id');
                    return idProp && idProp.value.value === domainId;
                });
                if (!domain) return;

                const topicsProp = domain.properties.find(p => p.key.name === 'topics');
                if (!topicsProp) return;

                const topic = topicsProp.value.elements.find(t => {
                    const idProp = t.properties.find(p => p.key.name === 'id');
                    return idProp && idProp.value.value === topicId;
                });
                if (!topic) return;

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

                let resourcesProp = subtopic.properties.find(p => p.key.name === 'resources');
                if (!resourcesProp) {
                    resourcesProp = t.objectProperty(
                        t.identifier('resources'),
                        t.objectExpression([])
                    );
                    subtopic.properties.push(resourcesProp);
                }

                let tabProp = resourcesProp.value.properties.find(p => p.key.name === tabName);
                if (!tabProp) {
                    tabProp = t.objectProperty(
                        t.identifier(tabName),
                        t.arrayExpression([])
                    );
                    resourcesProp.value.properties.push(tabProp);
                }

                tabProp.value.elements.push(createResourceNode(resourceData));
            }
        }
    });
}

function resolveMapping(file) {
    const lfile = file.toLowerCase();
    let map = { domainsNodeName: 'englishDomains', domainId: 'cross_curricular_english', topicId: 'media_literacy_projects', subtopicId: 'media_literacy_projects', tab: 'display' }; // default

    if (lfile.includes('banner')) {
        map = { domainsNodeName: 'englishDomains', domainId: 'cross_curricular_english', topicId: 'media_literacy_projects', subtopicId: 'media_literacy_projects', tab: 'display' };
    } else if (lfile.includes('behaviour')) {
        map = { domainsNodeName: 'hassDomains', domainId: 'civics_citizenship', topicId: 'citizenship', subtopicId: 'citizenship', tab: 'display' };
    } else if (lfile.includes('alphabet') || lfile.includes('phonics') || lfile.includes('spelling')) {
        map = { domainsNodeName: 'englishDomains', domainId: 'how_english_works', topicId: 'spelling', subtopicId: 'phonics_patterns', tab: 'practice' };
    } else if (lfile.includes('book review')) {
        map = { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'informative_writing', tab: 'practice' };
    } else if (lfile.includes('persuasive')) {
        map = { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'writing_genres', subtopicId: 'persuasive_writing', tab: 'practice' };
    } else if (lfile.includes('literacy')) {
        map = { domainsNodeName: 'englishDomains', domainId: 'literacy', topicId: 'reading_skills', subtopicId: 'comprehension_strategies', tab: 'practice' };
    } else if (lfile.includes('hass')) {
        map = { domainsNodeName: 'hassDomains', domainId: 'history', topicId: 'ancient_history', subtopicId: 'ancient_history', tab: 'practice' };
    } else if (lfile.includes('math')) {
        map = { domainsNodeName: 'mathDomains', domainId: 'number_algebra', topicId: 'patterns_algebra', subtopicId: 'patterns_algebra', tab: 'practice' };
    } else if (lfile.includes('science')) {
        map = { domainsNodeName: 'scienceDomains', domainId: 'physical_sciences', topicId: 'forces_motion', subtopicId: 'simple_machines', tab: 'practice' };
    }

    // Set tab to display if it's an image, or learn/practice if it's a doc
    if (lfile.endsWith('.png') || lfile.endsWith('.jpg')) {
        map.tab = 'display';
    }

    return map;
}

const missingFiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'missing_files.json')));

missingFiles.forEach(f => {
    const title = path.basename(f).replace(/\.[^/.]+$/, "").replace(/_/g, ' ');
    const type = f.toLowerCase().endsWith('.pdf') ? 'pdf' : (f.toLowerCase().endsWith('.pptx') ? 'pptx' : 'image');
    const mapping = resolveMapping(f);

    addResourceToSubtopic(mapping.domainsNodeName, mapping.domainId, mapping.topicId, mapping.subtopicId, mapping.tab, {
        type: type,
        title: title,
        src: f
    });
});

const output = generate(ast, {}, code);
fs.writeFileSync(curriculumPath, output.code);
console.log('Successfully injected the remaining ' + missingFiles.length + ' extra resources!');
