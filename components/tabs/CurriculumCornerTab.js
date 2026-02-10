// components/tabs/CurriculumCornerTab.js
// 3-TIER NAVIGATION: Subjects → Categories (Tools/Displays/Resources) → Content
import React, { useState, Suspense, lazy } from 'react';

// Lazy-load content components for performance
const LiteracyTools = lazy(() => import('../curriculum/sections/LiteracySection'));
const MathematicsTools = lazy(() => import('../curriculum/sections/MathematicsSection'));
const ScienceTools = lazy(() => import('../curriculum/sections/ScienceSection'));
const DisplaysSection = lazy(() => import('../curriculum/sections/DisplaysSection'));

// Loading spinner
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      <p className="text-slate-600">Loading...</p>
    </div>
  </div>
);

// Resource Viewer Component - handles PDF and other file types
const ResourceViewer = ({ resource, onBack }) => {
  const { pdfPath, title } = resource;
  const isPdf = pdfPath.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <div className="flex gap-3">
          <a
            href={pdfPath}
            download
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download {isPdf ? 'PDF' : 'File'}
          </a>
          <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '80vh' }}>
        {isPdf ? (
          <iframe
            src={pdfPath}
            className="w-full h-full border-0"
            title={title}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
            <div className="bg-indigo-100 p-6 rounded-full mb-6">
              <svg className="w-20 h-20 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Preview Not Available</h3>
            <p className="text-slate-600 max-w-md mb-8">
              This file type cannot be previewed directly in the browser. Please download the file to view it on your device.
            </p>
            <a
              href={pdfPath}
              download
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center gap-2 font-bold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download File
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// Resources List Component - shows PDFs for a subject
const ResourcesList = ({ subject, onBack, onSelectResource }) => {
  // Define resources by subject
  const resourcesBySubject = {
    english: [
      {
        id: 'wilds-of-writing',
        title: 'The Wilds of Writing: A Field Guide',
        description: 'A comprehensive guide to creative writing techniques',
        pdfPath: '/Unit Resources/Literacy/The_Wilds_of_Writing_A_Field_Guide.pdf',
        isNew: true
      },
      {
        id: 'blend-friends',
        title: 'Blend Friends Adventure',
        description: 'Phonics and blending adventure',
        pdfPath: '/Unit Resources/Literacy/Blend_Friends_Adventure.pdf',
        isNew: true
      },
      {
        id: 'comprehension-info-texts',
        title: 'Comprehension Information Texts',
        description: 'Developing comprehension skills with information texts',
        pdfPath: '/Unit Resources/Literacy/Comprehension Information Texts.pdf',
        isNew: true
      },
      {
        id: 'leveled-comprehension-pack-1',
        title: 'Leveled Comprehension PACK 1',
        description: 'First collection of leveled reading comprehension tasks',
        pdfPath: '/Unit Resources/Literacy/Leveled Comprehension PACK 1.pdf',
        isNew: true
      },
      {
        id: 'leveled-comprehension-pack-2',
        title: 'Leveled Comprehension PACK 2',
        description: 'Second collection of leveled reading comprehension tasks',
        pdfPath: '/Unit Resources/Literacy/Leveled Comprehension PACK 2.pdf',
        isNew: true
      },
      {
        id: 'reading-strategies',
        title: 'Reading Strategies',
        description: 'Strategies for effective reading and understanding',
        pdfPath: '/Unit Resources/Literacy/Reading Strategies.pdf',
        isNew: true
      },
      {
        id: 'info-text-comprehension',
        title: 'Information Text Comprehension',
        description: 'Teaching information text comprehension skills',
        pdfPath: '/Unit Resources/Literacy/Information Text Comprehension.pdf',
        isNew: true
      },
      {
        id: 'character-profile',
        title: 'Character Profile Comprehension',
        description: 'Analysing and understanding character profiles in texts',
        pdfPath: '/Unit Resources/Literacy/Character Profile Comprehension.pdf',
        isNew: true
      },
      {
        id: 'character-creation',
        title: 'Character Creation Crew',
        description: 'Building unforgettable stories through character development',
        pdfPath: '/Unit Resources/Literacy/Character_Creation_Crew_Building_Unforgettable_Stories.pdf',
        isNew: true
      },
      {
        id: 'metaphors-similes',
        title: 'Comparison Cuties: Metaphors & Similes',
        description: 'Understanding and using figurative language',
        pdfPath: '/Unit Resources/Literacy/Comparison_Cuties_Metaphors_and_Similes.pdf',
        isNew: true
      },
      {
        id: 'literary-architecture',
        title: 'Literary Architecture',
        description: 'Understanding text structure and story building',
        pdfPath: '/Unit Resources/Literacy/Literary_Architecture.pdf',
        isNew: true
      },
      {
        id: 'paint-worlds',
        title: 'Paint Worlds With Words',
        description: 'Descriptive writing and imagery techniques',
        pdfPath: '/Unit Resources/Literacy/Paint_Worlds_With_Words.pdf',
        isNew: true
      },
      {
        id: 'shelter-shore',
        title: 'Shelter Shore: Identity Craft',
        description: 'Exploring identity through creative writing',
        pdfPath: '/Unit Resources/Literacy/Shelter_Shore_Identity_Craft.pdf',
        isNew: true
      },
      {
        id: 'teresa-book-analysis',
        title: 'Teresa: A New Australian - Book Analysis',
        description: 'Comprehensive analysis of the novel Teresa: A New Australian',
        pdfPath: '/Unit Resources/Literacy/Teresa_A_New_Australian_Book_Analysis.pdf',
        isNew: true
      },
      {
        id: 'fanboys',
        title: 'FANBOYS: The Super Squad of Sentences',
        description: 'Mastering coordinating conjunctions',
        pdfPath: '/Unit Resources/Literacy/FANBOYS_The_Super_Squad_of_Sentences.pdf',
        isNew: true
      },
      {
        id: 'grammar-garden',
        title: 'Grammar Garden Helpers',
        description: 'Cultivating strong grammar skills',
        pdfPath: '/Unit Resources/Literacy/Grammar_Garden_Helpers.pdf',
        isNew: true
      },
      {
        id: 'grammar-kingdoms',
        title: 'Grammar: The Four Kingdoms',
        description: 'Exploring the realms of grammar',
        pdfPath: '/Unit Resources/Literacy/Grammar_The_Four_Kingdoms.pdf',
        isNew: true
      },
      {
        id: 'narnia',
        title: 'Narnia: Deep Magic and the Wardrobe',
        description: 'Exploring the magical world of Narnia',
        pdfPath: '/Unit Resources/Literacy/Narnia_Deep_Magic_and_the_Wardrobe.pdf',
        isNew: true
      },
      {
        id: 'nintendo-story',
        title: 'The Nintendo Story',
        description: 'Reading comprehension about gaming history',
        pdfPath: '/Unit Resources/Literacy/The_Nintendo_Story.pdf',
        isNew: true
      },
      {
        id: 'noun-hunt',
        title: 'The Noun Hunt',
        description: 'Activity to identify and understand nouns',
        pdfPath: '/Unit Resources/Literacy/The_Noun_Hunt.pdf',
        isNew: true
      },
      {
        id: 'world-cup',
        title: 'World Cup History: The Global Game',
        description: 'Reading comprehension about the World Cup',
        pdfPath: '/Unit Resources/Literacy/World_Cup_History_The_Global_Game.pdf',
        isNew: true
      }
    ],
    mathematics: [
      {
        id: 'coins-notes',
        title: 'Australian Coins and Notes',
        description: 'Understanding Australian currency and money skills',
        pdfPath: '/Unit Resources/Mathematics/Australian Coins and Notes.pdf',
        isNew: true
      },
      {
        id: 'fraction-blocks',
        title: 'Fraction Building Blocks',
        description: 'Foundational concepts for understanding fractions',
        pdfPath: '/Unit Resources/Mathematics/Fraction_Building_Blocks.pdf',
        isNew: true
      },
      {
        id: 'integer-ocean',
        title: 'Integer Ocean Adventure',
        description: 'Exploring positive and negative integers',
        pdfPath: '/Unit Resources/Mathematics/Integer_Ocean_Adventure.pdf',
        isNew: true
      },
      {
        id: 'world-beyond-zero',
        title: 'The World Beyond Zero',
        description: 'Understanding numbers beyond zero - decimals and negatives',
        pdfPath: '/Unit Resources/Mathematics/The_World_Beyond_Zero.pdf',
        isNew: true
      }
    ],
    science: [
      {
        id: 'city-stars',
        title: 'A City In The Stars',
        description: 'Exploring future cities and space',
        pdfPath: '/Unit Resources/Science/A_City_In_The_Stars.pdf',
        isNew: true
      },
      {
        id: 'celestial-clockwork',
        title: 'Celestial Clockwork',
        description: 'Understanding the mechanics of the universe',
        pdfPath: '/Unit Resources/Science/Celestial_Clockwork.pdf',
        isNew: true
      },
      {
        id: 'solar-system',
        title: 'Our Solar System Tour',
        description: 'A journey through our solar system',
        pdfPath: '/Unit Resources/Science/Our_Solar_System_Tour.pdf',
        isNew: true
      }
    ],
    geography: [],
    history: [
      {
        id: 'historical-figures',
        title: 'Historical Figures',
        description: 'Learning about significant historical figures (PowerPoint)',
        pdfPath: '/Unit Resources/HASS/Historical Figures.pptx',
        isNew: true
      },
      {
        id: 'alexander-unbroken',
        title: 'Alexander Unbroken',
        description: 'The Life of Conquest',
        pdfPath: '/Unit Resources/HASS/Alexander_Unbroken_The_Life_of_Conquest.pdf',
        isNew: true
      },
      {
        id: 'attila',
        title: 'Attila: Scourge and Sovereign',
        description: 'History of the Hunnic Empire',
        pdfPath: '/Unit Resources/HASS/Attila_Scourge_and_Sovereign.pdf',
        isNew: true
      },
      {
        id: 'australia-deep-time',
        title: 'Australia: Deep Time to Now',
        description: 'Australian history through the ages',
        pdfPath: '/Unit Resources/HASS/Australia_Deep_Time_to_Now.pdf',
        isNew: true
      },
      {
        id: 'bermuda-triangle',
        title: 'Bermuda Triangle Investigation',
        description: 'Investigating the mystery',
        pdfPath: '/Unit Resources/HASS/Bermuda_Triangle_Investigation.pdf',
        isNew: true
      },
      {
        id: 'caesar',
        title: "Caesar's Path to Empire",
        description: 'The rise of the Roman Empire',
        pdfPath: '/Unit Resources/HASS/Caesar_s_Path_to_Empire.pdf',
        isNew: true
      },
      {
        id: 'cleopatra',
        title: 'Cleopatra: Power, Propaganda, Legacy',
        description: 'The life of the Egyptian Queen',
        pdfPath: '/Unit Resources/HASS/Cleopatra_Power_Propaganda_Legacy.pdf',
        isNew: true
      },
      {
        id: 'cross-crescent',
        title: 'Cross and Crescent: War and Ideas',
        description: 'Historical conflict and exchange',
        pdfPath: '/Unit Resources/HASS/Cross_and_Crescent_War_and_Ideas.pdf',
        isNew: true
      },
      {
        id: 'einstein',
        title: 'Einstein: Mind, Matter, Time',
        description: 'The life and theories of Albert Einstein',
        pdfPath: '/Unit Resources/HASS/Einstein_Mind_Matter_Time.pdf',
        isNew: true
      },
      {
        id: 'genghis-khan',
        title: 'Genghis Khan',
        description: 'Architect of the Modern World',
        pdfPath: '/Unit Resources/HASS/Genghis_Khan_Architect_of_the_Modern_World.pdf',
        isNew: true
      },
      {
        id: 'joan-of-arc',
        title: 'Joan of Arc',
        description: 'The Maid Who Saved France',
        pdfPath: '/Unit Resources/HASS/Joan_of_Arc_The_Maid_Who_Saved_France.pdf',
        isNew: true
      },
      {
        id: 'pyramid-engineering',
        title: 'Pyramid Engineering Solved',
        description: 'How the pyramids were built',
        pdfPath: '/Unit Resources/HASS/Pyramid_Engineering_Solved.pdf',
        isNew: true
      },
      {
        id: 'black-death',
        title: 'The Black Death',
        description: 'A Timeline of History',
        pdfPath: '/Unit Resources/HASS/The_Black_Death_A_Timeline_of_History.pdf',
        isNew: true
      },
      {
        id: 'french-revolution',
        title: 'The French Revolution',
        description: 'A World Transformed',
        pdfPath: '/Unit Resources/HASS/The_French_Revolution_A_World_Transformed.pdf',
        isNew: true
      },
      {
        id: 'ww2',
        title: 'The Second World War',
        description: '1939–1945 History',
        pdfPath: '/Unit Resources/HASS/The_Second_World_War_1939–1945.pdf',
        isNew: true
      },
      {
        id: 'confucius',
        title: 'The Way of Confucius',
        description: 'Philosophy and endurance',
        pdfPath: '/Unit Resources/HASS/The_Way_of_Confucius_Endures.pdf',
        isNew: true
      },
      {
        id: 'ww1',
        title: 'World War I Timeline',
        description: 'From Spark to Treaty',
        pdfPath: '/Unit Resources/HASS/World_War_I_Timeline_From_Spark_to_Treaty.pdf',
        isNew: true
      }
    ],
    arts: []
  };

  const resources = resourcesBySubject[subject.id] || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">📚</span> {subject.name} Resources
        </h2>
        <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
      </div>

      {resources.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-12 text-center border border-slate-200">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-2xl font-bold text-slate-700 mb-2">No Resources Yet</h3>
          <p className="text-slate-500">Resources for {subject.name} will be added soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <button
              key={resource.id}
              onClick={() => onSelectResource(resource)}
              className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all hover:scale-[1.02] border border-slate-200 hover:border-blue-300 relative group"
            >
              {resource.isNew && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">NEW</span>
              )}
              <div className="flex items-start gap-4">
                <div className="bg-red-100 rounded-xl p-3">
                  <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 4h7l5 5v11H6V4zm8.5 11v3.5L12 16l-2.5 2.5V15H8v-1h10v1h-1.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 mb-1">{resource.title}</h3>
                  <p className="text-sm text-slate-500 mb-3">{resource.description}</p>
                  <span className="text-blue-600 font-semibold text-sm group-hover:text-blue-700">
                    {resource.pdfPath.endsWith('.pdf') ? 'View PDF' : 'View File'} →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Coming Soon placeholder for empty categories
const ComingSoonCategory = ({ category, subject, onBack }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
      <h2 className="text-xl font-bold text-slate-800">{subject.name} - {category}</h2>
      <button onClick={onBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
    </div>
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-12 text-center border border-amber-200">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-2xl font-bold text-amber-800 mb-2">{category} Coming Soon!</h3>
      <p className="text-amber-600">We're working on {subject.name.toLowerCase()} {category.toLowerCase()}.</p>
    </div>
  </div>
);

// Subject configuration with banners
const subjects = [
  {
    id: 'english',
    name: 'English',
    banner: '/Displays/Banners/Literacy.png',
    color: 'from-blue-500 to-purple-600',
    icon: '📚',
    hasTools: true,
    hasDisplays: true,
    hasResources: true
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    banner: '/Displays/Banners/Mathematics.png',
    color: 'from-green-500 to-emerald-600',
    icon: '🔢',
    hasTools: true,
    hasDisplays: true,
    hasResources: true
  },
  {
    id: 'science',
    name: 'Science',
    banner: '/Displays/Banners/Science.png',
    color: 'from-purple-500 to-violet-600',
    icon: '🔬',
    hasTools: true,
    hasDisplays: true,
    hasResources: true
  },
  {
    id: 'geography',
    name: 'Geography',
    banner: '/Displays/Banners/GEOGRAPHY.png',
    color: 'from-teal-500 to-cyan-600',
    icon: '🌍',
    hasTools: false,
    hasDisplays: true,
    hasResources: false
  },
  {
    id: 'history',
    name: 'History',
    banner: '/Displays/Banners/HISTORY.png',
    color: 'from-amber-500 to-orange-600',
    icon: '🏺',
    hasTools: false,
    hasDisplays: true,
    hasResources: true
  },
  {
    id: 'arts',
    name: 'Arts & Creativity',
    banner: null,
    color: 'from-pink-500 to-rose-600',
    icon: '🎨',
    hasTools: false,
    hasDisplays: true,
    hasResources: false
  }
];

// Category configuration
const categories = [
  {
    id: 'tools',
    name: 'Tools',
    icon: '🛠️',
    description: 'Interactive teaching tools',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    id: 'displays',
    name: 'Displays',
    icon: '🖼️',
    description: 'Printable classroom posters',
    color: 'from-fuchsia-500 to-pink-600'
  },
  {
    id: 'resources',
    name: 'Resources',
    icon: '📚',
    description: 'PDFs, worksheets & downloads',
    color: 'from-emerald-500 to-teal-600'
  }
];

// Main Curriculum Corner Component
const CurriculumCornerTab = ({
  students = [],
  showToast = () => { },
  saveData = () => { },
  loadedData = {}
}) => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (subjectId) => {
    setImageErrors(prev => ({ ...prev, [subjectId]: true }));
  };

  const handleBack = () => {
    if (activeResource) {
      setActiveResource(null);
    } else if (activeCategory) {
      setActiveCategory(null);
    } else if (activeSubject) {
      setActiveSubject(null);
    }
  };

  const handleBackToSubjects = () => {
    setActiveSubject(null);
    setActiveCategory(null);
    setActiveResource(null);
  };

  // TIER 3: Render content for selected subject + category
  if (activeSubject && activeCategory) {
    // Handle resource viewing
    if (activeResource) {
      return (
        <ResourceViewer
          resource={activeResource}
          onBack={() => setActiveResource(null)}
        />
      );
    }

    // Resources category
    if (activeCategory.id === 'resources') {
      return (
        <ResourcesList
          subject={activeSubject}
          onBack={handleBack}
          onSelectResource={setActiveResource}
        />
      );
    }

    // Displays category - use displays gallery with subject filter
    if (activeCategory.id === 'displays') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">🖼️</span> {activeSubject.name} Displays
              </h2>
              <button onClick={handleBack} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back</button>
            </div>
            <DisplaysSection
              onBack={handleBack}
              showToast={showToast}
              students={students}
              subjectFilter={activeSubject.id}
            />
          </div>
        </Suspense>
      );
    }

    // Tools category - render the appropriate tools section
    if (activeCategory.id === 'tools') {
      let ToolsComponent = null;

      switch (activeSubject.id) {
        case 'english':
          ToolsComponent = LiteracyTools;
          break;
        case 'mathematics':
          ToolsComponent = MathematicsTools;
          break;
        case 'science':
          ToolsComponent = ScienceTools;
          break;
        default:
          return <ComingSoonCategory category="Tools" subject={activeSubject} onBack={handleBack} />;
      }

      return (
        <Suspense fallback={<LoadingSpinner />}>
          <ToolsComponent
            onBack={handleBack}
            showToast={showToast}
            students={students}
            saveData={saveData}
            loadedData={loadedData}
          />
        </Suspense>
      );
    }
  }

  // TIER 2: Render category selection for selected subject
  if (activeSubject) {
    return (
      <div className="space-y-8">
        {/* Subject Header */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{activeSubject.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{activeSubject.name}</h2>
              <p className="text-slate-500 text-sm">Choose a category</p>
            </div>
          </div>
          <button onClick={handleBackToSubjects} className="bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600">← Back to Subjects</button>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(category => {
            // Check if this subject has content for this category
            const hasContent =
              (category.id === 'tools' && activeSubject.hasTools) ||
              (category.id === 'displays' && activeSubject.hasDisplays) ||
              (category.id === 'resources' && activeSubject.hasResources);

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category)}
                className={`relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.03] ${!hasContent ? 'opacity-50' : ''}`}
              >
                <div className={`bg-gradient-to-br ${category.color} p-8 text-white text-center`}>
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white/80">{category.description}</p>
                  {!hasContent && (
                    <span className="mt-4 inline-block bg-white/20 px-3 py-1 rounded-full text-sm">Coming Soon</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // TIER 1: Render subject selection (main menu)
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <img
          src="/Displays/Banners/CurriculumCorner.png"
          alt="Curriculum Corner"
          className="h-24 md:h-32 mx-auto object-contain mb-4"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <p className="text-slate-600 text-lg">Choose a subject to explore tools, displays, and resources</p>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {subjects.map(subject => (
          <button
            key={subject.id}
            onClick={() => setActiveSubject(subject)}
            className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.03]"
          >
            {/* Banner or Gradient */}
            {subject.banner && !imageErrors[subject.id] ? (
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={subject.banner}
                  alt={subject.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={() => handleImageError(subject.id)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
              </div>
            ) : (
              <div className={`relative aspect-[16/9] bg-gradient-to-br ${subject.color} flex items-center justify-center`}>
                <div className="text-center text-white p-6">
                  <span className="text-6xl block mb-4">{subject.icon}</span>
                  <h3 className="text-2xl font-bold">{subject.name}</h3>
                </div>
              </div>
            )}

            {/* Info Bar */}
            <div className={`bg-gradient-to-r ${subject.color} p-4`}>
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span>{subject.icon}</span>
                    {subject.name}
                  </h3>
                </div>
                <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CurriculumCornerTab;
