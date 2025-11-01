import React, { useMemo, useState, useEffect, useRef } from 'react';
import programStructure from './data/spelling-program-structure.json';
import { buildResourcePack } from '../../utils/spellingResourceGenerator';

const DOMAIN_ORDER = ['Phonology', 'Spelling Patterns', 'Morphology'];
const LEVEL_ORDER = ['Level Foundation', 'Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'];

const DOMAIN_META = {
  Phonology: {
    color: 'from-amber-500 via-orange-500 to-pink-500',
    accent: 'bg-amber-500/20 border-amber-400/60',
    description: 'Build confident decoders by tackling every sound concept from Foundation to Level 6.'
  },
  'Spelling Patterns': {
    color: 'from-sky-500 via-indigo-500 to-purple-600',
    accent: 'bg-sky-500/20 border-sky-400/60',
    description: 'Master visual patterns, rules, and orthographic conventions with curated lists and activities.'
  },
  Morphology: {
    color: 'from-emerald-500 via-teal-500 to-blue-600',
    accent: 'bg-emerald-500/20 border-emerald-400/60',
    description: 'Explore word building, affixes, and etymology with rich resources for every level.'
  }
};

const domainIcon = {
  Phonology: '🔊',
  'Spelling Patterns': '🧩',
  Morphology: '🧠'
};

const tagColors = {
  'Level Foundation': 'bg-amber-500/20 text-amber-200 border-amber-400/60',
  'Level 1': 'bg-sky-500/20 text-sky-200 border-sky-400/60',
  'Level 2': 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60',
  'Level 3': 'bg-indigo-500/20 text-indigo-200 border-indigo-400/60',
  'Level 4': 'bg-purple-500/20 text-purple-200 border-purple-400/60',
  'Level 5': 'bg-rose-500/20 text-rose-100 border-rose-400/60',
  'Level 6': 'bg-slate-500/20 text-slate-100 border-slate-400/60'
};

const ResourceBadge = ({ label }) => (
  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-white/10 border border-white/20">
    {label}
  </span>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-3">
    <span className="text-2xl" aria-hidden>{icon}</span>
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-300">{subtitle}</p>}
    </div>
  </div>
);

const SpellingCenter = ({ showToast }) => {
  const programData = useMemo(() => {
    const compiled = {};
    DOMAIN_ORDER.forEach((domain) => {
      const levels = programStructure[domain] || {};
      compiled[domain] = {};
      Object.keys(levels).forEach((level) => {
        compiled[domain][level] = levels[level].map((item) => ({
          ...item,
          resources: buildResourcePack(item, domain, level)
        }));
      });
    });
    return compiled;
  }, []);

  const [selectedDomain, setSelectedDomain] = useState(DOMAIN_ORDER[0]);
  const [selectedLevel, setSelectedLevel] = useState(LEVEL_ORDER[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const printRef = useRef(null);

  const domainLevels = useMemo(() => {
    const available = Object.keys(programData[selectedDomain] || {});
    return LEVEL_ORDER.filter((level) => available.includes(level));
  }, [programData, selectedDomain]);

  useEffect(() => {
    if (!domainLevels.includes(selectedLevel)) {
      setSelectedLevel(domainLevels[0] || LEVEL_ORDER[0]);
    }
  }, [domainLevels, selectedLevel]);

  const stats = useMemo(() => {
    return DOMAIN_ORDER.map((domain) => {
      const levels = programData[domain] || {};
      const totalConcepts = Object.values(levels).reduce((sum, arr) => sum + arr.length, 0);
      return { domain, totalConcepts };
    });
  }, [programData]);

  const concepts = useMemo(() => {
    const levelConcepts = programData[selectedDomain]?.[selectedLevel] || [];
    if (!searchTerm.trim()) return levelConcepts;
    const query = searchTerm.toLowerCase();
    return levelConcepts.filter((item) => item.text.toLowerCase().includes(query));
  }, [programData, selectedDomain, selectedLevel, searchTerm]);

  const handleOpenConcept = (concept) => {
    setSelectedConcept({
      ...concept,
      level: selectedLevel,
      domain: selectedDomain
    });
  };

  const handlePrint = () => {
    if (typeof window === 'undefined' || !printRef.current) return;
    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    const doc = printWindow.document;
    doc.write('<html><head><title>Spelling Resource Pack</title>');
    doc.write('<style>body{font-family:Inter,sans-serif;padding:40px;background:#f7f9fc;color:#0f172a;} h1{font-size:28px;margin-bottom:16px;} h2{font-size:20px;margin-top:24px;} ul{padding-left:20px;} .tag{display:inline-block;margin-right:8px;padding:4px 10px;border-radius:999px;background:#e0e7ff;color:#312e81;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;} table{border-collapse:collapse;width:100%;margin-top:12px;} th,td{border:1px solid #cbd5f5;padding:8px;text-align:left;} .section{margin-bottom:24px;}</style>');
    doc.write('</head><body>');
    doc.write(printRef.current.innerHTML);
    doc.write('</body></html>');
    doc.close();
    printWindow.focus();
    printWindow.print();
  };

  const activeConceptCount = concepts.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black" aria-hidden />
        <div className="absolute inset-x-0 -top-24 h-72 bg-gradient-to-r from-purple-600/40 via-sky-500/30 to-emerald-400/30 blur-3xl" aria-hidden />
        <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex-1 min-w-[260px]">
                <p className="uppercase tracking-[0.4em] text-xs font-semibold text-slate-300 mb-3">Ultimate spelling studio</p>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-300">
                  Every phonics, spelling pattern, and morphology focus curated in one place
                </h1>
              </div>
              <div className="flex flex-col gap-3 min-w-[220px] bg-white/5 border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm uppercase tracking-widest text-slate-300">Program Snapshot</h2>
                <div className="space-y-2">
                  {stats.map(({ domain, totalConcepts }) => (
                    <div key={domain} className="flex justify-between text-sm text-slate-200">
                      <span>{domain}</span>
                      <span className="font-semibold text-white">{totalConcepts}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">Each item opens a full resource pack with lists, passages, games, worksheets, and displays.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20">
                <p className="text-sm text-slate-300 mb-4">Start by selecting an area of focus.</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {DOMAIN_ORDER.map((domain) => {
                    const meta = DOMAIN_META[domain];
                    const isActive = selectedDomain === domain;
                    return (
                      <button
                        key={domain}
                        onClick={() => {
                          setSelectedDomain(domain);
                          if (showToast) {
                            showToast(`Loaded ${domain} pathway`, 'info');
                          }
                        }}
                        className={`relative overflow-hidden rounded-2xl border border-white/10 p-5 text-left transition-all duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-300 focus-visible:outline-none ${isActive ? 'bg-white/10 shadow-lg shadow-slate-900/60' : 'bg-white/5'}`}
                      >
                        <div className={`absolute inset-0 rounded-2xl opacity-60 bg-gradient-to-br ${meta.color}`} aria-hidden />
                        <div className="relative z-10 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-3xl" aria-hidden>{domainIcon[domain]}</span>
                            <ResourceBadge label={`${programData[domain] ? Object.values(programData[domain]).reduce((sum, arr) => sum + arr.length, 0) : 0} focuses`} />
                          </div>
                          <h2 className="text-xl font-semibold">{domain}</h2>
                          <p className="text-sm text-slate-200/90">{meta.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-3">How it works</h2>
                  <ul className="space-y-2 text-sm text-slate-200">
                    <li>1. Choose phonology, spelling patterns, or morphology.</li>
                    <li>2. Select a level to reveal every explicit teaching focus.</li>
                    <li>3. Open a focus to access printable lists, passages, scripts, games, displays, and worksheets.</li>
                  </ul>
                </div>
                <p className="mt-4 text-xs text-slate-400">Designed to look stunning on classroom displays and respond beautifully on mobile.</p>
              </div>
            </div>

            <div className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>{domainIcon[selectedDomain]}</span>
                  <div>
                    <p className="uppercase text-xs tracking-[0.3em] text-slate-300">Selected Focus</p>
                    <h2 className="text-2xl font-semibold">{selectedDomain}</h2>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex bg-white/10 rounded-full p-1">
                    {domainLevels.map((level) => {
                      const isActive = level === selectedLevel;
                      return (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition ${isActive ? 'bg-white text-slate-900 shadow' : 'text-slate-200 hover:text-white'}`}
                        >
                          {level.replace('Level ', 'L')}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative">
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search focus statements..."
                      className="bg-white/10 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>⌕</span>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">Showing {activeConceptCount} focus{activeConceptCount === 1 ? '' : 'es'} for {selectedLevel}.</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {concepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="relative bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-lg shadow-black/30 hover:shadow-purple-500/20 transition group"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition bg-gradient-to-br from-white via-transparent to-transparent" aria-hidden />
                    <div className="relative z-10">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${tagColors[selectedLevel] || 'bg-white/10 text-slate-100 border-white/20'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
                        {selectedLevel}
                      </div>
                      <p className="mt-3 text-sm text-slate-200 leading-relaxed">{concept.text}</p>
                    </div>
                    <div className="relative z-10 mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <ResourceBadge label="Word Lists" />
                        <ResourceBadge label="Passages" />
                        <ResourceBadge label="Games" />
                      </div>
                      <button
                        onClick={() => handleOpenConcept(concept)}
                        className="px-4 py-2 text-sm font-semibold bg-white text-slate-900 rounded-full shadow hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-200"
                      >
                        Open Pack
                      </button>
                    </div>
                  </div>
                ))}

                {concepts.length === 0 && (
                  <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-slate-300">
                    <p>No concepts match that search just yet. Try a different keyword.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedConcept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" aria-hidden onClick={() => setSelectedConcept(null)} />
          <div className="relative max-w-5xl w-full bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-80 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-white/10 p-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus Area</p>
                  <h2 className="text-2xl font-bold text-white mt-2">{selectedConcept.domain}</h2>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 mt-3 rounded-full border text-xs font-semibold ${tagColors[selectedConcept.level] || 'bg-white/10 text-slate-100 border-white/20'}`}>
                    <span className="w-2 h-2 rounded-full bg-current" aria-hidden />
                    {selectedConcept.level}
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{selectedConcept.text}</p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Word Lists</p>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedConcept.resources.spellingLists.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Activities</p>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedConcept.resources.activities.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Games</p>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedConcept.resources.games.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">Worksheets</p>
                    <p className="mt-1 text-lg font-semibold text-white">{selectedConcept.resources.worksheets.length}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handlePrint}
                    className="w-full px-4 py-2 text-sm font-semibold bg-white text-slate-900 rounded-full shadow hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-100"
                  >
                    Print Resource Pack
                  </button>
                  <button
                    onClick={() => setSelectedConcept(null)}
                    className="w-full px-4 py-2 text-sm font-semibold bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="flex-1 max-h-[80vh] overflow-y-auto" ref={printRef}>
                <div className="p-6 space-y-6">
                  <header>
                    <h1 className="text-2xl font-bold text-white">{selectedConcept.text}</h1>
                    <p className="text-sm text-slate-300 mt-1">Comprehensive classroom resource pack aligned to {selectedConcept.level}.</p>
                  </header>

                  <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <SectionTitle icon="📝" title="Printable Spelling Lists" subtitle="Three tiers to differentiate instruction." />
                    <div className="grid sm:grid-cols-3 gap-4">
                      {selectedConcept.resources.spellingLists.map((list) => (
                        <div key={list.id} className={`relative p-4 rounded-xl border border-white/10 bg-gradient-to-br ${list.gradient}`}>
                          <h3 className="text-lg font-semibold text-white">{list.title}</h3>
                          <p className="mt-2 text-sm text-slate-100/90">{list.description}</p>
                          <div className="mt-3 text-xs text-slate-50/90">
                            <p className="font-semibold uppercase tracking-widest text-[10px] text-white/80">Word Set</p>
                            <ul className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
                              {list.words.map((word) => (
                                <li key={word} className="flex items-center gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden />
                                  {word}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <a
                            href={list.download.url}
                            download={list.download.filename}
                            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/90"
                          >
                            Download list →
                          </a>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <SectionTitle icon="📚" title="Ready-to-Use Passages" subtitle="Short texts for guided and independent practice." />
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedConcept.resources.passages.map((passage) => (
                        <div key={passage.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{passage.title}</h3>
                            <span className="text-xs text-slate-300">{passage.difficulty}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-200 leading-relaxed">{passage.text}</p>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-300">
                            <span>{passage.wordCount} words</span>
                            <a href={passage.download.url} download={passage.download.filename} className="font-semibold text-white/80">Download →</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <SectionTitle icon="🎯" title="Teaching & Learning Experiences" subtitle="Mix-and-match activities, scripts, and games." />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <h4 className="text-base font-semibold text-white">Launch & Workshop Activities</h4>
                        <div className="space-y-3">
                          {selectedConcept.resources.activities.map((activity) => (
                            <div key={activity.id} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                              <p className="text-sm font-semibold text-white">{activity.title}</p>
                              <p className="text-xs text-slate-300 mb-2">{activity.duration}</p>
                              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                                {activity.steps.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                        <h4 className="text-base font-semibold text-white">Teacher Scripts & Classroom Games</h4>
                        <div className="space-y-3">
                          {selectedConcept.resources.teacherScripts.map((script) => (
                            <div key={script.id} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                              <p className="text-sm font-semibold text-white">{script.title}</p>
                              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 mt-2">
                                {script.sections.map((section, index) => (
                                  <li key={index}>{section}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <div className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white">Gamified Practice</p>
                            <ul className="space-y-2 text-xs text-slate-300">
                              {selectedConcept.resources.games.map((game) => (
                                <li key={game.id} className="border border-white/5 rounded-md p-2">
                                  <p className="font-semibold text-white/90">{game.name}</p>
                                  <p className="mt-1">{game.description}</p>
                                  <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">Materials: {game.materials.join(', ')}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <SectionTitle icon="🖼️" title="Displays & Printable Worksheets" subtitle="Make it beautiful for your classroom walls and student folders." />
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        {selectedConcept.resources.displays.map((display) => (
                          <div key={display.id} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white">{display.title}</p>
                            <p className="mt-2 text-xs text-slate-300">{display.description}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {selectedConcept.resources.worksheets.map((worksheet) => (
                          <div key={worksheet.id} className="bg-slate-900/60 border border-white/10 rounded-lg p-3">
                            <p className="text-sm font-semibold text-white">{worksheet.title}</p>
                            <ul className="mt-2 list-disc list-inside text-xs text-slate-300 space-y-1">
                              {worksheet.sections.map((section, index) => (
                                <li key={index}>{section}</li>
                              ))}
                            </ul>
                            <a href={worksheet.download.url} download={worksheet.download.filename} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-white/80">
                              Download worksheet →
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellingCenter;
