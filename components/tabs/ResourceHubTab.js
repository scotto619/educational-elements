// components/tabs/ResourceHubTab.js
// Unified Resource Hub - combines all curriculum tools, displays, and resources in one place
import React, { useState, Suspense, lazy, useMemo } from 'react';

// Lazy-load section components for performance
const DisplaysGallery = lazy(() => import('../curriculum/general/DisplaysGallery'));
const EnglishNewSection = lazy(() => import('../curriculum/new/EnglishNewSection'));
const MathNewSection = lazy(() => import('../curriculum/new/MathNewSection'));
const ScienceNewSection = lazy(() => import('../curriculum/new/ScienceNewSection'));
const HassNewSection = lazy(() => import('../curriculum/new/HassNewSection'));

// ─── Loading Spinner ────────────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
      <p className="text-slate-500 font-medium">Loading...</p>
    </div>
  </div>
);

// ─── Resource Data ───────────────────────────────────────────────────────────
const resourcesBySubject = {
  behaviour: [
    { id: 'zones-of-regulation', title: 'Zones of Regulation', description: 'A framework for self-regulation — understanding and managing emotions in the classroom', pdfPath: '/free-resources/Zones_of_Regulation.pdf', icon: '🌈' },
  ],
  english: [
    { id: 'wilds-of-writing', title: 'The Wilds of Writing: A Field Guide', description: 'A comprehensive guide to creative writing techniques', pdfPath: '/Unit Resources/Literacy/The_Wilds_of_Writing_A_Field_Guide.pdf', icon: '✍️' },
    { id: 'blend-friends', title: 'Blend Friends Adventure', description: 'Phonics and blending adventure', pdfPath: '/Unit Resources/Literacy/Blend_Friends_Adventure.pdf', icon: '🔤' },
    { id: 'phonics-superpowers', title: 'Phonics Superpowers Guide', description: 'CVC blending cards and phonics patterns guide — includes MAT, PAT, PIN, SAT, SIT, TAP, TIP and more', pdfPath: '/Curriculum/New Literacy/Spelling and Word Study/Phonics Patterns/Learning/Phonics_Superpowers.pdf', icon: '🔡' },
    { id: 'comprehension-info-texts', title: 'Comprehension Information Texts', description: 'Developing comprehension skills with information texts', pdfPath: '/Unit Resources/Literacy/Comprehension Information Texts.pdf', icon: '📖' },
    { id: 'leveled-comprehension-pack-1', title: 'Leveled Comprehension PACK 1', description: 'First collection of leveled reading comprehension tasks', pdfPath: '/Unit Resources/Literacy/Leveled Comprehension PACK 1.pdf', icon: '📖' },
    { id: 'leveled-comprehension-pack-2', title: 'Leveled Comprehension PACK 2', description: 'Second collection of leveled reading comprehension tasks', pdfPath: '/Unit Resources/Literacy/Leveled Comprehension PACK 2.pdf', icon: '📖' },
    { id: 'reading-strategies', title: 'Reading Strategies', description: 'Strategies for effective reading and understanding', pdfPath: '/Unit Resources/Literacy/Reading Strategies.pdf', icon: '🧠' },
    { id: 'info-text-comprehension', title: 'Information Text Comprehension', description: 'Teaching information text comprehension skills', pdfPath: '/Unit Resources/Literacy/Information Text Comprehension.pdf', icon: '📝' },
    { id: 'character-profile', title: 'Character Profile Comprehension', description: 'Analysing and understanding character profiles in texts', pdfPath: '/Unit Resources/Literacy/Character Profile Comprehension.pdf', icon: '🧑‍🎨' },
    { id: 'character-creation', title: 'Character Creation Crew', description: 'Building unforgettable stories through character development', pdfPath: '/Unit Resources/Literacy/Character_Creation_Crew_Building_Unforgettable_Stories.pdf', icon: '🧑‍🎨' },
    { id: 'metaphors-similes', title: 'Comparison Cuties: Metaphors & Similes', description: 'Understanding and using figurative language', pdfPath: '/Unit Resources/Literacy/Comparison_Cuties_Metaphors_and_Similes.pdf', icon: '🌈' },
    { id: 'literary-architecture', title: 'Literary Architecture', description: 'Understanding text structure and story building', pdfPath: '/Unit Resources/Literacy/Literary_Architecture.pdf', icon: '🏛️' },
    { id: 'paint-worlds', title: 'Paint Worlds With Words', description: 'Descriptive writing and imagery techniques', pdfPath: '/Unit Resources/Literacy/Paint_Worlds_With_Words.pdf', icon: '🎨' },
    { id: 'shelter-shore', title: 'Shelter Shore: Identity Craft', description: 'Exploring identity through creative writing', pdfPath: '/Unit Resources/Literacy/Shelter_Shore_Identity_Craft.pdf', icon: '🌊' },
    { id: 'teresa-book-analysis', title: 'Teresa: A New Australian - Book Analysis', description: 'Comprehensive analysis of the novel Teresa: A New Australian', pdfPath: '/Unit Resources/Literacy/Teresa_A_New_Australian_Book_Analysis.pdf', icon: '📗' },
    { id: 'fanboys', title: 'FANBOYS: The Super Squad of Sentences', description: 'Mastering coordinating conjunctions', pdfPath: '/Unit Resources/Literacy/FANBOYS_The_Super_Squad_of_Sentences.pdf', icon: '💥' },
    { id: 'grammar-garden', title: 'Grammar Garden Helpers', description: 'Cultivating strong grammar skills', pdfPath: '/Unit Resources/Literacy/Grammar_Garden_Helpers.pdf', icon: '🌸' },
    { id: 'grammar-kingdoms', title: 'Grammar: The Four Kingdoms', description: 'Exploring the realms of grammar', pdfPath: '/Unit Resources/Literacy/Grammar_The_Four_Kingdoms.pdf', icon: '👑' },
    { id: 'narnia', title: 'Narnia: Deep Magic and the Wardrobe', description: 'Exploring the magical world of Narnia', pdfPath: '/Unit Resources/Literacy/Narnia_Deep_Magic_and_the_Wardrobe.pdf', icon: '🦁' },
    { id: 'nintendo-story', title: 'The Nintendo Story', description: 'Reading comprehension about gaming history', pdfPath: '/Unit Resources/Literacy/The_Nintendo_Story.pdf', icon: '🎮' },
    { id: 'noun-hunt', title: 'The Noun Hunt', description: 'Activity to identify and understand nouns', pdfPath: '/Unit Resources/Literacy/The_Noun_Hunt.pdf', icon: '🔍' },
    { id: 'world-cup', title: 'World Cup History: The Global Game', description: 'Reading comprehension about the World Cup', pdfPath: '/Unit Resources/Literacy/World_Cup_History_The_Global_Game.pdf', icon: '⚽' },
  ],
  mathematics: [
    { id: 'coins-notes', title: 'Australian Coins and Notes', description: 'Understanding Australian currency and money skills', pdfPath: '/Unit Resources/Mathematics/Australian Coins and Notes.pdf', icon: '💰' },
    { id: 'fraction-blocks', title: 'Fraction Building Blocks', description: 'Foundational concepts for understanding fractions', pdfPath: '/Unit Resources/Mathematics/Fraction_Building_Blocks.pdf', icon: '½' },
    { id: 'integer-ocean', title: 'Integer Ocean Adventure', description: 'Exploring positive and negative integers', pdfPath: '/Unit Resources/Mathematics/Integer_Ocean_Adventure.pdf', icon: '🌊' },
    { id: 'world-beyond-zero', title: 'The World Beyond Zero', description: 'Understanding numbers beyond zero — decimals and negatives', pdfPath: '/Unit Resources/Mathematics/The_World_Beyond_Zero.pdf', icon: '0️⃣' },
  ],
  science: [
    { id: 'city-stars', title: 'A City In The Stars', description: 'Exploring future cities and space', pdfPath: '/Unit Resources/Science/A_City_In_The_Stars.pdf', icon: '🌃' },
    { id: 'celestial-clockwork', title: 'Celestial Clockwork', description: 'Understanding the mechanics of the universe', pdfPath: '/Unit Resources/Science/Celestial_Clockwork.pdf', icon: '⚙️' },
    { id: 'solar-system', title: 'Our Solar System Tour', description: 'A journey through our solar system', pdfPath: '/Unit Resources/Science/Our_Solar_System_Tour.pdf', icon: '🪐' },
  ],
  hass: [
    { id: 'historical-figures', title: 'Historical Figures', description: 'Learning about significant historical figures (PowerPoint)', pdfPath: '/Unit Resources/HASS/Historical Figures.pptx', icon: '🏛️' },
    { id: 'alexander-unbroken', title: 'Alexander Unbroken', description: 'The Life of Conquest', pdfPath: '/Unit Resources/HASS/Alexander_Unbroken_The_Life_of_Conquest.pdf', icon: '⚔️' },
    { id: 'attila', title: 'Attila: Scourge and Sovereign', description: 'History of the Hunnic Empire', pdfPath: '/Unit Resources/HASS/Attila_Scourge_and_Sovereign.pdf', icon: '🗡️' },
    { id: 'australia-deep-time', title: 'Australia: Deep Time to Now', description: 'Australian history through the ages', pdfPath: '/Unit Resources/HASS/Australia_Deep_Time_to_Now.pdf', icon: '🦘' },
    { id: 'bermuda-triangle', title: 'Bermuda Triangle Investigation', description: 'Investigating the mystery', pdfPath: '/Unit Resources/HASS/Bermuda_Triangle_Investigation.pdf', icon: '🔺' },
    { id: 'caesar', title: "Caesar's Path to Empire", description: 'The rise of the Roman Empire', pdfPath: '/Unit Resources/HASS/Caesar_s_Path_to_Empire.pdf', icon: '🦅' },
    { id: 'cleopatra', title: 'Cleopatra: Power, Propaganda, Legacy', description: 'The life of the Egyptian Queen', pdfPath: '/Unit Resources/HASS/Cleopatra_Power_Propaganda_Legacy.pdf', icon: '🐍' },
    { id: 'cross-crescent', title: 'Cross and Crescent: War and Ideas', description: 'Historical conflict and exchange', pdfPath: '/Unit Resources/HASS/Cross_and_Crescent_War_and_Ideas.pdf', icon: '✝️' },
    { id: 'einstein', title: 'Einstein: Mind, Matter, Time', description: 'The life and theories of Albert Einstein', pdfPath: '/Unit Resources/HASS/Einstein_Mind_Matter_Time.pdf', icon: '🧠' },
    { id: 'genghis-khan', title: 'Genghis Khan', description: 'Architect of the Modern World', pdfPath: '/Unit Resources/HASS/Genghis_Khan_Architect_of_the_Modern_World.pdf', icon: '🏹' },
    { id: 'joan-of-arc', title: 'Joan of Arc', description: 'The Maid Who Saved France', pdfPath: '/Unit Resources/HASS/Joan_of_Arc_The_Maid_Who_Saved_France.pdf', icon: '⚜️' },
    { id: 'pyramid-engineering', title: 'Pyramid Engineering Solved', description: 'How the pyramids were built', pdfPath: '/Unit Resources/HASS/Pyramid_Engineering_Solved.pdf', icon: '🔺' },
    { id: 'black-death', title: 'The Black Death', description: 'A Timeline of History', pdfPath: '/Unit Resources/HASS/The_Black_Death_A_Timeline_of_History.pdf', icon: '💀' },
    { id: 'french-revolution', title: 'The French Revolution', description: 'A World Transformed', pdfPath: '/Unit Resources/HASS/The_French_Revolution_A_World_Transformed.pdf', icon: '🗽' },
    { id: 'ww2', title: 'The Second World War', description: '1939–1945 History', pdfPath: '/Unit Resources/HASS/The_Second_World_War_1939–1945.pdf', icon: '🎖️' },
    { id: 'confucius', title: 'The Way of Confucius', description: 'Philosophy and endurance', pdfPath: '/Unit Resources/HASS/The_Way_of_Confucius_Endures.pdf', icon: '☯️' },
    { id: 'ww1', title: 'World War I Timeline', description: 'From Spark to Treaty', pdfPath: '/Unit Resources/HASS/World_War_I_Timeline_From_Spark_to_Treaty.pdf', icon: '🕊️' },
  ],
};

// Flat search index for resources only
const toolsSearchIndex = [];

// Subject configuration
const subjects = [
  {
    id: 'behaviour',
    name: 'Behaviour & Wellbeing',
    icon: '🌈',
    gradient: 'from-amber-500 to-rose-500',
    lightBg: 'bg-amber-50',
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    ringColor: 'ring-amber-300',
    banner: null,
    description: 'Zones of regulation, classroom rules & wellbeing displays',
    hasCurriculum: false,
  },
  {
    id: 'english',
    name: 'English',
    icon: '📚',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    accentColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    ringColor: 'ring-blue-300',
    banner: '/Displays/Banners/Literacy.png',
    description: 'Reading, writing, phonics & language',
    hasCurriculum: true,
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '🔢',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    accentColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    ringColor: 'ring-emerald-300',
    banner: '/Displays/Banners/Mathematics.png',
    description: 'Numbers, patterns & problem solving',
    hasCurriculum: true,
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    accentColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    ringColor: 'ring-violet-300',
    banner: '/Displays/Banners/Science.png',
    description: 'Experiments, nature & discovery',
    hasCurriculum: true,
  },
  {
    id: 'hass',
    name: 'HASS',
    icon: '🌍',
    gradient: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    accentColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    ringColor: 'ring-amber-300',
    banner: '/Displays/Banners/HISTORY.png',
    description: 'History, geography & social sciences',
    hasCurriculum: true,
  },
];

// Sections per subject — Resources, Curriculum Domains, Displays only
const getSections = (subject) => [
  {
    id: 'resources',
    name: 'Worksheets & Resources',
    icon: '📁',
    description: 'PDFs, PowerPoints & downloadable worksheets',
    available: (resourcesBySubject[subject.id] || []).length > 0,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    id: 'curriculum',
    name: 'Curriculum Domains',
    icon: '🎓',
    description: 'Framework topics and structured learning content',
    available: subject.hasCurriculum,
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'displays',
    name: 'Classroom Displays',
    icon: '🖼️',
    description: 'Printable posters & wall displays',
    available: true,
    gradient: 'from-fuchsia-500 to-violet-600',
  },
];

// ─── PDF / File Viewer ────────────────────────────────────────────────────────
const ResourceViewer = ({ resource, onBack }) => {
  const isPdf = resource.pdfPath.toLowerCase().endsWith('.pdf');
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{resource.title}</h2>
          <p className="text-sm text-slate-500">{resource.description}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a href={resource.pdfPath} download className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          <button onClick={onBack} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors text-sm font-semibold">
            ← Back
          </button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200" style={{ height: '78vh' }}>
        {isPdf ? (
          <iframe src={resource.pdfPath} className="w-full h-full border-0" title={resource.title} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
            <div className="bg-indigo-100 p-6 rounded-full mb-6">
              <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 2H7a2 2 0 00-2 2v15a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Preview Not Available</h3>
            <p className="text-slate-500 max-w-sm mb-6 text-sm">This file type cannot be previewed. Please download to view it.</p>
            <a href={resource.pdfPath} download className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-semibold inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

// ─── Unit Resources List ──────────────────────────────────────────────────────
const UnitResourcesList = ({ subject, onSelectResource }) => {
  const resources = resourcesBySubject[subject.id] || [];
  const [filter, setFilter] = useState('');
  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(filter.toLowerCase()) ||
    r.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Search within resources */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
        </svg>
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder={`Search ${subject.name} resources...`}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
        />
      </div>

      {resources.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <div className="text-5xl mb-3">📂</div>
          <h3 className="text-lg font-bold text-slate-600 mb-1">No Resources Yet</h3>
          <p className="text-slate-400 text-sm">Resources for {subject.name} will be added soon!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No results for "{filter}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(resource => {
            const isPpt = resource.pdfPath.endsWith('.pptx') || resource.pdfPath.endsWith('.ppt');
            return (
              <button
                key={resource.id}
                onClick={() => onSelectResource(resource)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-rose-300 hover:shadow-lg p-5 text-left transition-all group relative"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${isPpt ? 'bg-orange-100' : 'bg-red-100'}`}>
                    {resource.icon || (isPpt ? '📊' : '📄')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover:text-rose-700 transition-colors">{resource.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{resource.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPpt ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                        {isPpt ? 'PowerPoint' : 'PDF'}
                      </span>
                      <span className="text-xs text-rose-500 font-semibold group-hover:text-rose-700">Open →</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── Coming Soon Section ──────────────────────────────────────────────────────
const ComingSoonSection = ({ name }) => (
  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-12 text-center border border-amber-200">
    <div className="text-5xl mb-4">🚧</div>
    <h3 className="text-xl font-bold text-amber-800 mb-2">{name} Coming Soon</h3>
    <p className="text-amber-600 text-sm">We're working hard to bring you this content. Check back soon!</p>
  </div>
);

// ─── Search Results View ──────────────────────────────────────────────────────
const SearchResults = ({ query, onNavigate }) => {
  const allItems = useMemo(() => {
    const items = [];
    // Add tools
    toolsSearchIndex.forEach(tool => {
      items.push({ ...tool, type: 'tool', sectionLabel: 'Learning Tools' });
    });
    // Add resources
    Object.entries(resourcesBySubject).forEach(([subjectId, resources]) => {
      resources.forEach(r => {
        items.push({ ...r, subject: subjectId, section: 'resources', type: 'resource', sectionLabel: 'Unit Resources' });
      });
    });
    return items;
  }, []);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    ).slice(0, 24);
  }, [query, allItems]);

  const subjectMap = Object.fromEntries(subjects.map(s => [s.id, s]));

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-3">🔍</div>
        <p className="text-slate-500 font-medium">No results for "{query}"</p>
        <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500 font-medium">{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {results.map(item => {
          const subj = subjectMap[item.subject];
          return (
            <button
              key={`${item.subject}-${item.id}`}
              onClick={() => onNavigate(item)}
              className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md p-4 text-left transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${subj?.gradient || 'from-slate-400 to-slate-500'} text-white`}>
                      {subj?.name || item.subject}
                    </span>
                    <span className="text-xs text-slate-400">{item.sectionLabel}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main ResourceHubTab ──────────────────────────────────────────────────────
const ResourceHubTab = ({
  students = [],
  showToast = () => {},
  saveData = () => {},
  loadedData = {},
}) => {
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [activeResource, setActiveResource] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  const assignedTopics = loadedData.assignedTopics || [];
  const handleToggleAssign = async (topicInfo) => {
    try {
      const isAssigned = assignedTopics.some(
        t => t.id === topicInfo.id && t.domainId === topicInfo.domainId && t.subjectId === topicInfo.subjectId
      );
      const newAssignedTopics = isAssigned
        ? assignedTopics.filter(t => !(t.id === topicInfo.id && t.domainId === topicInfo.domainId && t.subjectId === topicInfo.subjectId))
        : [...assignedTopics, topicInfo];
      showToast(isAssigned ? `Removed "${topicInfo.name}" from assignments` : `Assigned "${topicInfo.name}" to students!`, isAssigned ? 'info' : 'success');
      await saveData({ assignedTopics: newAssignedTopics });
    } catch (e) {
      showToast('Failed to update assigned topics', 'error');
    }
  };

  // Navigate from search result
  const handleSearchNavigate = (item) => {
    setSearchQuery('');
    const subj = subjects.find(s => s.id === item.subject);
    if (!subj) return;
    setActiveSubject(subj);
    const sections = getSections(subj);
    const sect = sections.find(s => s.id === item.section);
    if (sect) setActiveSection(sect);
    if (item.type === 'resource') setActiveResource(item);
  };

  const handleBackToHub = () => {
    setActiveSubject(null);
    setActiveSection(null);
    setActiveResource(null);
    setSearchQuery('');
  };

  const handleBackToSubject = () => {
    setActiveSection(null);
    setActiveResource(null);
  };


  // ── LEVEL 3: Resource Viewer ──────────────────────────────────────────────
  if (activeResource) {
    return (
      <div className="space-y-4">
        <Breadcrumb
          subject={activeSubject}
          section={activeSection}
          item={activeResource.title}
          onHome={handleBackToHub}
          onSubject={handleBackToSubject}
          onSection={() => setActiveResource(null)}
        />
        <ResourceViewer resource={activeResource} onBack={() => setActiveResource(null)} />
      </div>
    );
  }

  // ── LEVEL 2: Section Content ──────────────────────────────────────────────
  if (activeSubject && activeSection) {
    const renderSectionContent = () => {
      const { id: sectionId } = activeSection;
      const { id: subjectId } = activeSubject;

      if (sectionId === 'curriculum') {
        if (subjectId === 'english') {
          return <EnglishNewSection onBack={handleBackToSubject} students={students} showToast={showToast} onToggleAssign={handleToggleAssign} assignedTopics={assignedTopics} />;
        }
        if (subjectId === 'mathematics') {
          return <MathNewSection onBack={handleBackToSubject} students={students} showToast={showToast} onToggleAssign={handleToggleAssign} assignedTopics={assignedTopics} />;
        }
        if (subjectId === 'science') {
          return <ScienceNewSection onBack={handleBackToSubject} students={students} showToast={showToast} onToggleAssign={handleToggleAssign} assignedTopics={assignedTopics} />;
        }
        if (subjectId === 'hass') {
          return <HassNewSection onBack={handleBackToSubject} students={students} showToast={showToast} onToggleAssign={handleToggleAssign} assignedTopics={assignedTopics} />;
        }
        return <ComingSoonSection name="Curriculum Domains" />;
      }

      if (sectionId === 'resources') {
        return <UnitResourcesList subject={activeSubject} onSelectResource={setActiveResource} />;
      }

      if (sectionId === 'displays') {
        // Map ResourceHub subject IDs to DisplaysGallery category IDs
        const displayFilterMap = {
          english: 'english',
          mathematics: 'maths',
          science: 'science',
          hass: 'hass',
          behaviour: 'behaviour',
        };
        return (
          <DisplaysGallery
            showToast={showToast}
            students={students}
            subjectFilter={displayFilterMap[subjectId] || subjectId}
          />
        );
      }

      return <ComingSoonSection name={activeSection.name} />;
    };

    return (
      <div className="space-y-5">
        <Breadcrumb
          subject={activeSubject}
          section={activeSection}
          onHome={handleBackToHub}
          onSubject={handleBackToSubject}
        />
        <Suspense fallback={<LoadingSpinner />}>
          {renderSectionContent()}
        </Suspense>
      </div>
    );
  }

  // ── LEVEL 1: Subject Section Picker ──────────────────────────────────────
  if (activeSubject) {
    const sections = getSections(activeSubject);
    return (
      <div className="space-y-6">
        <Breadcrumb subject={activeSubject} onHome={handleBackToHub} />

        {/* Subject Hero */}
        <div className={`rounded-3xl overflow-hidden shadow-lg relative`}>
          {activeSubject.banner && !imageErrors[activeSubject.id] ? (
            <div className="relative h-36 md:h-44 overflow-hidden">
              <img
                src={activeSubject.banner}
                alt={activeSubject.name}
                className="w-full h-full object-cover"
                onError={() => setImageErrors(prev => ({ ...prev, [activeSubject.id]: true }))}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex items-center px-8">
                <div className="text-white">
                  <div className="text-4xl mb-1">{activeSubject.icon}</div>
                  <h2 className="text-3xl font-black tracking-tight">{activeSubject.name}</h2>
                  <p className="text-white/80 text-sm font-medium">{activeSubject.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={`bg-gradient-to-br ${activeSubject.gradient} p-8 text-white flex items-center gap-5`}>
              <span className="text-5xl">{activeSubject.icon}</span>
              <div>
                <h2 className="text-3xl font-black tracking-tight">{activeSubject.name}</h2>
                <p className="text-white/80 text-sm font-medium">{activeSubject.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => section.available && setActiveSection(section)}
              className={`group relative rounded-2xl overflow-hidden shadow-md transition-all duration-300 text-left ${
                section.available
                  ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                  : 'opacity-50 cursor-default'
              }`}
            >
              <div className={`bg-gradient-to-br ${section.gradient} p-6 text-white min-h-[140px] flex flex-col justify-between`}>
                <div>
                  <div className="text-4xl mb-3">{section.icon}</div>
                  <h3 className="text-lg font-bold leading-tight">{section.name}</h3>
                  <p className="text-white/75 text-xs mt-1 leading-snug">{section.description}</p>
                </div>
                {section.available ? (
                  <div className="mt-4 flex items-center gap-1 text-white/90 text-sm font-semibold group-hover:gap-2 transition-all">
                    Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                ) : (
                  <span className="mt-4 inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Coming Soon</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── LEVEL 0: Main Hub ─────────────────────────────────────────────────────
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-10 md:py-14 shadow-2xl">
        {/* Glow blobs */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-purple-500/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All Resources · One Place
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Resource Hub
          </h1>
          <p className="text-indigo-200/80 text-base md:text-lg max-w-xl font-light">
            Printable displays, worksheets, PDFs and curriculum domains — all organised by subject.
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl mt-2">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools, resources, topics..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {isSearching ? (
        <SearchResults query={searchQuery} onNavigate={handleSearchNavigate} />
      ) : (
        <>
          {/* Subject Cards */}
          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-4">Choose a Subject</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {subjects.map(subject => (
                <button
                  key={subject.id}
                  onClick={() => setActiveSubject(subject)}
                  className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 text-left"
                >
                  {/* Banner image or gradient */}
                  {subject.banner && !imageErrors[subject.id] ? (
                    <div className="relative h-36 overflow-hidden">
                      <img
                        src={subject.banner}
                        alt={subject.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageErrors(prev => ({ ...prev, [subject.id]: true }))}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  ) : (
                    <div className={`h-36 bg-gradient-to-br ${subject.gradient} flex items-center justify-center`}>
                      <span className="text-6xl opacity-80">{subject.icon}</span>
                    </div>
                  )}

                  {/* Info bar */}
                  <div className={`bg-gradient-to-r ${subject.gradient} px-5 py-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-lg">{subject.icon}</span>
                          <h3 className="font-black text-base">{subject.name}</h3>
                        </div>
                        <p className="text-white/70 text-xs">{subject.description}</p>
                      </div>
                      <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Section count badges */}
                  <div className={`${subject.lightBg} px-5 py-3 flex gap-2 flex-wrap`}>
                    {getSections(subject).filter(s => s.available).map(s => (
                      <span key={s.id} className={`text-xs font-semibold ${subject.accentColor} bg-white px-2 py-0.5 rounded-full border ${subject.borderColor}`}>
                        {s.icon} {s.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Access Row */}
          <div>
            <h2 className="text-xl font-bold text-slate-700 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Classroom Displays', icon: '🖼️', gradient: 'from-fuchsia-500 to-violet-600', desc: 'Printable posters & wall displays', action: () => { setActiveSubject(subjects[0]); setActiveSection(getSections(subjects[0]).find(s => s.id === 'displays')); } },
                { label: 'Worksheets & Resources', icon: '📁', gradient: 'from-rose-500 to-pink-600', desc: 'PDFs, PowerPoints & printables', action: () => { setActiveSubject(subjects[0]); setActiveSection(getSections(subjects[0]).find(s => s.id === 'resources')); } },
                { label: 'Curriculum Domains', icon: '🎓', gradient: 'from-teal-500 to-cyan-600', desc: 'Framework topics & content', action: () => { setActiveSubject(subjects[0]); setActiveSection(getSections(subjects[0]).find(s => s.id === 'curriculum')); } },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={`bg-gradient-to-br ${item.gradient} rounded-2xl p-5 text-white text-left hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-bold text-sm">{item.label}</div>
                  <div className="text-white/70 text-xs mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ subject, section, item, onHome, onSubject, onSection }) => (
  <nav className="flex items-center gap-1.5 text-sm flex-wrap bg-white rounded-xl px-4 py-3 shadow-sm border border-slate-200">
    <button onClick={onHome} className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Resource Hub
    </button>
    {subject && (
      <>
        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <button onClick={onSubject} className={`font-semibold transition-colors ${section ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-800'}`}>
          {subject.icon} {subject.name}
        </button>
      </>
    )}
    {section && (
      <>
        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <button onClick={onSection} className={`font-semibold transition-colors ${item ? 'text-slate-600 hover:text-indigo-600' : 'text-slate-800'}`}>
          {section.icon} {section.name}
        </button>
      </>
    )}
    {item && (
      <>
        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        <span className="font-bold text-slate-800 truncate max-w-[200px]">{item}</span>
      </>
    )}
  </nav>
);

export default ResourceHubTab;
