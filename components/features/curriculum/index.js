// components/features/curriculum/index.js - Curriculum Corner Components
// These focused components handle educational content delivery

import React, { useState, useMemo } from 'react';
import { 
  Button, 
  Card, 
  Modal,
  SelectField,
  LoadingSpinner,
  EmptyState
} from '../../shared';
import { 
  LITERACY_CONTENT, 
  MATHEMATICS_CONTENT, 
  SCIENCE_CONTENT, 
  SOCIAL_STUDIES_CONTENT,
  STEM_CONTENT,
  CROSS_CURRICULAR_PROJECTS,
  ASSESSMENT_TOOLS
} from '../../../config/curriculumContent';

// ===============================================
// SUBJECT SELECTOR COMPONENT
// ===============================================

/**
 * Navigation between different curriculum subjects
 */
export const SubjectSelector = ({ activeSubject, onSubjectChange }) => {
  const subjects = [
    { id: 'literacy', name: 'Literacy', icon: '📚', color: 'bg-blue-500' },
    { id: 'mathematics', name: 'Mathematics', icon: '🔢', color: 'bg-green-500' },
    { id: 'science', name: 'Science', icon: '🔬', color: 'bg-purple-500' },
    { id: 'social_studies', name: 'Social Studies', icon: '🌍', color: 'bg-orange-500' },
    { id: 'stem', name: 'STEM', icon: '⚙️', color: 'bg-red-500' },
    { id: 'projects', name: 'Projects', icon: '🎯', color: 'bg-indigo-500' },
    { id: 'assessment', name: 'Assessment', icon: '📋', color: 'bg-teal-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {subjects.map(subject => (
        <button
          key={subject.id}
          onClick={() => onSubjectChange(subject.id)}
          className={`
            ${subject.color} text-white p-4 rounded-lg shadow-md
            ${activeSubject === subject.id ? 'ring-4 ring-yellow-400 transform scale-105' : 'hover:shadow-lg transform hover:scale-105'}
            transition-all duration-200 text-center
          `}
        >
          <div className="text-2xl mb-2">{subject.icon}</div>
          <div className="font-semibold text-sm">{subject.name}</div>
        </button>
      ))}
    </div>
  );
};

// ===============================================
// WRITING STRUCTURES COMPONENT
// ===============================================

/**
 * Interactive writing structure guide
 */
export const WritingStructuresDisplay = ({ structures }) => {
  const [selectedStructure, setSelectedStructure] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(structures).map(([key, structure]) => (
          <Card 
            key={key}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedStructure(structure)}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl">{structure.icon}</div>
              <h3 className="font-bold text-gray-800">{structure.name}</h3>
              <p className="text-sm text-gray-600">{structure.description}</p>
              <Button size="sm">View Structure</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Writing Structure Modal */}
      <Modal
        isOpen={!!selectedStructure}
        onClose={() => setSelectedStructure(null)}
        title={selectedStructure?.name}
        size="lg"
      >
        {selectedStructure && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">{selectedStructure.description}</p>
            </div>

            <div className="space-y-4">
              {selectedStructure.sections.map((section, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-bold text-gray-800">{section.name}</h4>
                  <p className="text-gray-600 mb-2">{section.description}</p>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Key Questions:
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===============================================
// MATH OPERATIONS DISPLAY
// ===============================================

/**
 * Interactive math operations guide
 */
export const MathOperationsDisplay = ({ operations }) => {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(operations).map(([key, operation]) => (
          <Card 
            key={key}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedOperation(operation)}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl">{operation.icon}</div>
              <h3 className="font-bold text-gray-800">{operation.name}</h3>
              <p className="text-sm text-gray-600">
                {Object.keys(operation.levels).length} skill levels
              </p>
              <Button size="sm">Explore</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Math Operation Modal */}
      <Modal
        isOpen={!!selectedOperation}
        onClose={() => {
          setSelectedOperation(null);
          setSelectedLevel(null);
        }}
        title={selectedOperation?.name}
        size="lg"
      >
        {selectedOperation && (
          <div className="p-6 space-y-6">
            {/* Level Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(selectedOperation.levels).map(([levelKey, level]) => (
                <button
                  key={levelKey}
                  onClick={() => setSelectedLevel(level)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${selectedLevel === level 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <h4 className="font-bold text-gray-800">{level.name}</h4>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </button>
              ))}
            </div>

            {/* Level Content */}
            {selectedLevel && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-bold text-green-800 mb-2">Examples:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {selectedLevel.examples.map((example, index) => (
                      <div key={index} className="bg-white p-2 rounded text-center font-mono">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-800 mb-2">Teaching Strategies:</h4>
                  <ul className="space-y-1">
                    {selectedLevel.strategies.map((strategy, index) => (
                      <li key={index} className="flex items-start text-blue-700">
                        <span className="text-blue-500 mr-2">•</span>
                        {strategy}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===============================================
// READING STRATEGIES DISPLAY
// ===============================================

/**
 * Reading comprehension strategies guide
 */
export const ReadingStrategiesDisplay = ({ strategies }) => {
  const [selectedStrategy, setSelectedStrategy] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(strategies).map(([key, strategy]) => (
          <Card 
            key={key}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedStrategy(strategy)}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl">{strategy.icon}</div>
              <h3 className="font-bold text-gray-800">{strategy.name}</h3>
              <p className="text-sm text-gray-600">
                {strategy.strategies.length} strategies
              </p>
              <Button size="sm">View Strategies</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Reading Strategy Modal */}
      <Modal
        isOpen={!!selectedStrategy}
        onClose={() => setSelectedStrategy(null)}
        title={selectedStrategy?.name}
        size="lg"
      >
        {selectedStrategy && (
          <div className="p-6 space-y-4">
            {selectedStrategy.strategies.map((strategy, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">{strategy.name}</h4>
                <p className="text-gray-600 mb-3">{strategy.description}</p>
                
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="font-medium text-yellow-800 mb-1">Activity:</div>
                  <div className="text-yellow-700">{strategy.activity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===============================================
// CROSS-CURRICULAR PROJECTS
// ===============================================

/**
 * Integrated project displays
 */
export const CrossCurricularProjects = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <Card 
            key={project.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProject(project)}
          >
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800">{project.name}</h3>
              <p className="text-sm text-gray-600">{project.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {project.subjects.map(subject => (
                  <span 
                    key={subject}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-gray-500">
                Duration: {project.duration}
              </div>
              
              <Button size="sm">View Details</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Details Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject?.name}
        size="lg"
      >
        {selectedProject && (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800">{selectedProject.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Subjects Integrated:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.subjects.map(subject => (
                    <span 
                      key={subject}
                      className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Duration:</h4>
                <p className="text-gray-600">{selectedProject.duration}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 mb-3">Project Activities:</h4>
              <div className="space-y-2">
                {selectedProject.activities.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===============================================
// ASSESSMENT TOOLS DISPLAY
// ===============================================

/**
 * Rubrics and assessment tools
 */
export const AssessmentToolsDisplay = ({ tools }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedRubric, setSelectedRubric] = useState(null);

  return (
    <div className="space-y-6">
      {/* Rubrics Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Assessment Rubrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(tools.rubrics).map(([key, rubric]) => (
            <Card 
              key={key}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRubric(rubric)}
            >
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800">{rubric.name}</h4>
                <p className="text-sm text-gray-600">
                  {rubric.criteria.length} assessment criteria
                </p>
                <Button size="sm">View Rubric</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Checklists Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Assessment Checklists</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(tools.checklists).map(([key, checklist]) => (
            <Card key={key}>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 capitalize">
                  {key.replace('_', ' ')}
                </h4>
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <input 
                        type="checkbox" 
                        className="mt-1 mr-2" 
                        id={`${key}-${index}`}
                      />
                      <label 
                        htmlFor={`${key}-${index}`}
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Rubric Details Modal */}
      <Modal
        isOpen={!!selectedRubric}
        onClose={() => setSelectedRubric(null)}
        title={selectedRubric?.name}
        size="lg"
      >
        {selectedRubric && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">Criteria</th>
                    {selectedRubric.criteria[0]?.levels.map(level => (
                      <th key={level} className="border border-gray-300 p-3 text-center">
                        {level}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRubric.criteria.map((criterion, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-3 font-medium">
                        {criterion.name}
                      </td>
                      {criterion.levels.map(level => (
                        <td key={level} className="border border-gray-300 p-3 text-center">
                          <input type="radio" name={`criterion-${index}`} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===============================================
// MAIN CURRICULUM TAB COMPONENT
// ===============================================

/**
 * Complete Curriculum Corner using modular content
 */
export const CurriculumTab = () => {
  const [activeSubject, setActiveSubject] = useState('literacy');

  const renderSubjectContent = () => {
    switch (activeSubject) {
      case 'literacy':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Writing Structures</h2>
              <WritingStructuresDisplay structures={LITERACY_CONTENT.writingStructures} />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reading Strategies</h2>
              <ReadingStrategiesDisplay strategies={LITERACY_CONTENT.readingStrategies} />
            </div>
          </div>
        );

      case 'mathematics':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Number Operations</h2>
              <MathOperationsDisplay operations={MATHEMATICS_CONTENT.operations} />
            </div>
          </div>
        );

      case 'science':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Life Science</h2>
              <Card>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🧬</div>
                  <h3 className="text-xl font-bold text-gray-800">Science Content</h3>
                  <p className="text-gray-600">Interactive science lessons coming soon!</p>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'social_studies':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Geography & History</h2>
              <Card>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🌍</div>
                  <h3 className="text-xl font-bold text-gray-800">Social Studies</h3>
                  <p className="text-gray-600">Explore the world and its history!</p>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'stem':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">STEM Activities</h2>
              <Card>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">⚙️</div>
                  <h3 className="text-xl font-bold text-gray-800">STEM Learning</h3>
                  <p className="text-gray-600">Hands-on engineering and technology!</p>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Cross-Curricular Projects</h2>
              <CrossCurricularProjects projects={CROSS_CURRICULAR_PROJECTS} />
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Tools</h2>
              <AssessmentToolsDisplay tools={ASSESSMENT_TOOLS} />
            </div>
          </div>
        );

      default:
        return (
          <EmptyState
            icon="📚"
            title="Subject Not Found"
            description="Please select a valid subject from the menu above."
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Curriculum Corner 📚
        </h1>
        <p className="text-gray-600 mt-2">
          Interactive teaching resources and educational content
        </p>
      </div>

      {/* Subject Navigation */}
      <SubjectSelector 
        activeSubject={activeSubject} 
        onSubjectChange={setActiveSubject} 
      />

      {/* Subject Content */}
      {renderSubjectContent()}
    </div>
  );
};

// Export all components
export {
  SubjectSelector,
  WritingStructuresDisplay,
  MathOperationsDisplay,
  ReadingStrategiesDisplay,
  CrossCurricularProjects,
  AssessmentToolsDisplay,
  CurriculumTab
};