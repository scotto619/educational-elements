const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const curriculumPath = path.join(__dirname, 'utils/curriculumData.js');
let code = fs.readFileSync(curriculumPath, 'utf8');

const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'flow']
});

const report = {};

traverse(ast, {
    VariableDeclarator(path) {
        if (['englishDomains', 'mathDomains', 'scienceDomains', 'hassDomains'].includes(path.node.id.name)) {
            const subject = path.node.id.name.replace('Domains', '').toUpperCase();

            const domains = path.node.init.elements;
            domains.forEach(domain => {
                const domainNameProp = domain.properties.find(p => p.key.name === 'name');
                if (!domainNameProp) return;
                const domainName = domainNameProp.value.value;

                const topicsProp = domain.properties.find(p => p.key.name === 'topics');
                if (!topicsProp) return;

                topicsProp.value.elements.forEach(topic => {
                    const topicNameProp = topic.properties.find(p => p.key.name === 'name');
                    if (!topicNameProp) return;
                    const topicName = topicNameProp.value.value;

                    const subtopicsArray = (() => {
                        const stProp = topic.properties.find(p => p.key.name === 'subtopics');
                        if (stProp) return stProp.value.elements;

                        const catProp = topic.properties.find(p => p.key.name === 'categories');
                        if (catProp) {
                            let arr = [];
                            catProp.value.elements.forEach(c => {
                                const cstProp = c.properties.find(p => p.key.name === 'subtopics');
                                if (cstProp) arr.push(...cstProp.value.elements);
                            });
                            return arr;
                        }
                        return [];
                    })();

                    subtopicsArray.forEach(subtopic => {
                        const subtopicNameProp = subtopic.properties.find(p => p.key.name === 'name');
                        if (!subtopicNameProp) return;
                        const subtopicName = subtopicNameProp.value.value;

                        const resProp = subtopic.properties.find(p => p.key.name === 'resources');
                        if (!resProp) return;

                        const types = ['display', 'learn', 'practice'];
                        types.forEach(t => {
                            const tabProp = resProp.value.properties.find(p => p.key.name === t);
                            if (tabProp) {
                                tabProp.value.elements.forEach(resNode => {
                                    const extraProp = resNode.properties.find(p => p.key.name === 'extra');
                                    if (extraProp && extraProp.value.value === true) {
                                        const titleProp = resNode.properties.find(p => p.key.name === 'title');
                                        const title = titleProp ? titleProp.value.value : 'Unknown Resource';

                                        const locationKey = `${subject} > ${domainName} > ${topicName} > ${subtopicName}`;
                                        if (!report[locationKey]) report[locationKey] = [];
                                        report[locationKey].push(`- [${t.toUpperCase()}] ${title}`);
                                    }
                                });
                            }
                        });
                    });
                });
            });
        }
    }
});

let md = '# Mapped Legacy Resources\n\nThis document lists all of the older logic resources that were successfully migrated to the new Curriculum Framework as Extra Resources.\n\n';

for (const [location, resources] of Object.entries(report)) {
    md += `### ${location}\n`;
    resources.forEach(r => {
        md += `${r}\n`;
    });
    md += '\n';
}

fs.writeFileSync('C:/Users/USER/.gemini/antigravity/brain/0fee85b4-67ef-4847-b399-8b99e1468426/mapped_resources_list.md', md);
console.log('Markdown report generated successfully.');
